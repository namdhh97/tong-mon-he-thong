import { execFile } from 'node:child_process';
import express from 'express';

const app = express();
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
        signal: AbortSignal.timeout(40000)
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

app.listen(4173, '0.0.0.0');