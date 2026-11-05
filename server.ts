import { execFile } from 'node:child_process';
import { characterSchema } from './character';
import { createServer } from 'node:http';
import { Server } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { plazaRoom } from './plaza-room';
import { ROOM } from './world';

import express from 'express';
import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { Pool } from 'pg';
import { z } from 'zod';

const db = new Pool({ connectionString: process.env.DATABASE_URL });
const derive = promisify(scrypt);
const app = express();
const sessionAge = 7 * 24 * 60 * 60 * 1000;
const cookie = { httpOnly: true, sameSite: 'strict' as const, secure: process.env.COOKIE_SECURE === 'true', path: '/' };
const credentials = z.object({
  email: z.string().trim().toLowerCase().max(254).email(),
  password: z.string().min(10).max(128)
});
const registration = credentials.extend({ name: z.string().trim().min(2).max(40) });

await db.query(`
  CREATE TABLE IF NOT EXISTS accounts (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email text UNIQUE NOT NULL,
    name text NOT NULL,
    password_hash text NOT NULL
  );
  ALTER TABLE accounts ADD COLUMN IF NOT EXISTS character jsonb;
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash text PRIMARY KEY,
    account_id bigint NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    expires_at timestamptz NOT NULL
  );
  CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
`);
app.disable('x-powered-by');
app.use('/api', express.json({ limit: '8kb' }));
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (req.method === 'POST' && !req.is('application/json')) {
    res.status(415).json({ error: 'Yêu cầu phải dùng JSON.' });
    return;
  }
  next();
});

function digest(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function sessionHash(cookieHeader?: string) {
  const token = cookieHeader?.match(/(?:^|;\s*)travel_session=([a-f0-9]{64})(?:;|$)/)?.[1];
  return token ? digest(token) : null;
}

async function createSession(req: express.Request, res: express.Response, id: string) {
  const token = randomBytes(32).toString('hex');
  await db.query(
    'INSERT INTO sessions (token_hash, account_id, expires_at) VALUES ($1, $2, $3)',
    [digest(token), id, new Date(Date.now() + sessionAge)]
  );
  const previous = sessionHash(req.headers.cookie);
  if (previous) await db.query('DELETE FROM sessions WHERE token_hash = $1', [previous]);
  res.cookie('travel_session', token, { ...cookie, maxAge: sessionAge });
}

const attempts = new Map<string, { count: number; expires: number }>();
const windowMs = 60_000;
app.use(['/api/register', '/api/login'], (req, res, next) => {
  const key = req.ip ?? 'unknown';
  const now = Date.now();
  let attempt = attempts.get(key);
  if (!attempt || attempt.expires <= now) {
    attempt = { count: 0, expires: now + windowMs };
    attempts.set(key, attempt);
  }
  if (++attempt.count > 12) {
    res.set('Retry-After', String(Math.ceil((attempt.expires - now) / 1000)));
    res.status(429).json({ error: 'Bạn thử quá nhiều lần. Hãy đợi một chút.' });
    return;
  }
  next();
});
setInterval(() => {
  for (const [key, attempt] of attempts) {
    if (attempt.expires <= Date.now()) attempts.delete(key);
  }
}, windowMs).unref();
setInterval(() => {
  db.query('DELETE FROM sessions WHERE expires_at <= now()').catch(console.error);
}, 60 * windowMs).unref();

app.post('/api/register', async (req, res) => {
  const data = registration.safeParse(req.body);
  if (!data.success) return res.status(400).json({ error: 'Kiểm tra email, tên và mật khẩu (ít nhất 10 ký tự).' });
  const { email, name, password } = data.data;
  const salt = randomBytes(16).toString('hex');
  const hash = (await derive(password, salt, 64) as Buffer).toString('hex');
  const { rows } = await db.query(
    'INSERT INTO accounts (email, name, password_hash) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING RETURNING id, email, name',
    [email, name, salt + ':' + hash]
  );
  const user = rows[0];
  if (!user) return res.status(409).json({ error: 'Email này đã được đăng ký.' });
  await createSession(req, res, user.id);
  res.status(201).json({ user });
});

app.post('/api/login', async (req, res) => {
  const data = credentials.safeParse(req.body);
  if (!data.success) return res.status(400).json({ error: 'Kiểm tra email và mật khẩu.' });
  const { rows } = await db.query('SELECT id, email, name, password_hash, character FROM accounts WHERE email = $1', [data.data.email]);
  const user = rows[0];
  const [salt, hash] = user?.password_hash.split(':') ?? ['0'.repeat(32), '0'.repeat(128)];
  const candidate = await derive(data.data.password, salt, 64) as Buffer;
  if (!timingSafeEqual(candidate, Buffer.from(hash, 'hex')) || !user) {
    return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng.' });
  }
  await createSession(req, res, user.id);
  res.json({ user: { id: user.id, email: user.email, name: user.name, character: user.character } });
});

app.get('/api/me', async (req, res) => {
  const { rows } = await db.query(
    'SELECT a.id, a.name, a.email, a.character FROM accounts a JOIN sessions s ON s.account_id = a.id WHERE s.token_hash = $1 AND s.expires_at > now()',
    [sessionHash(req.headers.cookie)]
  );
  res.json({ user: rows[0] ?? null });
});

app.post('/api/character', async (req, res) => {
  const parsed = characterSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Nhân vật không hợp lệ.' });
  const { rows } = await db.query(
    'UPDATE accounts SET character = $1 FROM sessions WHERE accounts.id = sessions.account_id AND token_hash = $2 AND expires_at > now() RETURNING accounts.id, name, email, character',
    [parsed.data, sessionHash(req.headers.cookie)]
  );
  if (!rows[0]) return res.status(401).json({ error: 'Vui lòng đăng nhập lại.' });
  res.json({ user: rows[0] });
});

app.post('/api/logout', async (req, res) => {
  await db.query('DELETE FROM sessions WHERE token_hash = $1', [sessionHash(req.headers.cookie)]);
  res.clearCookie('travel_session', cookie).json({ user: null });
});

app.get('/', (_req, res) => res.redirect('/nhiem-vu.html'));
app.get('/index.html', (_req, res) => res.redirect('/nhiem-vu.html'));
app.post('/api/voice', async (req, res) => {
  const line = req.body?.text;
  if (typeof line !== 'string' || !line.trim() || line.length > 1200) {
    res.status(400).json({ error: 'Lời thoại không hợp lệ.' });
    return;
  }
  const vieneuUrl = process.env.VIENEU_URL;
  if (vieneuUrl) {
    try {
      const generated = await fetch(vieneuUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: line }),
        signal: AbortSignal.timeout(25000)
      });
      if (generated.ok) {
        res.set('X-Voice-Engine', 'vieneu').type('audio/wav').send(Buffer.from(await generated.arrayBuffer()));
        return;
      }
    } catch {
      // Keep the original local voice available while VieNeu loads or restarts.
    }
  }
  const synthesizer = execFile('espeak-ng', ['-v', 'vi', '-s', '145', '--stdout', '--stdin'],
    { encoding: 'buffer', timeout: 5000, maxBuffer: 4_000_000 }, (error, audio) => {
      if (error) {
        res.status(503).json({ error: 'Chưa tạo được giọng đọc.' });
        return;
      }
      res.set('X-Voice-Engine', 'espeak').type('audio/wav').send(audio);
    });
  synthesizer.stdin?.on('error', () => {});
  synthesizer.stdin?.end(line, 'utf8');
});
app.use(express.static('dist'));
app.use((error: { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error.status === 400 || error.status === 413) {
    res.status(error.status).json({ error: 'Dữ liệu gửi lên không hợp lệ.' });
    return;
  }
  console.error(error);
  res.status(500).json({ error: 'Có lỗi xảy ra. Vui lòng thử lại.' });
});
const http = createServer(app);
const game = new Server({ transport: new WebSocketTransport({ server: http, maxPayload: 4096 }) });
game.define(ROOM, plazaRoom(async cookieHeader => {
  const token = sessionHash(cookieHeader);
  if (!token) return undefined;
  const { rows } = await db.query(
    'SELECT a.character FROM accounts a JOIN sessions s ON s.account_id = a.id WHERE s.token_hash = $1 AND s.expires_at > now()',
    [token]
  );
  return rows[0]?.character;
}));
await game.listen(4173, '0.0.0.0');
