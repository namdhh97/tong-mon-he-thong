import { CharacterEditor } from './CharacterEditor';
import { characterSchema, genders, newCharacter, type Character } from './character';
import { useEffect, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import { Plaza } from './Plaza';

type User = { id: string; email: string; name: string; character?: Character | null };
async function request(path: string, body?: object): Promise<{ user: User | null }> {
  const response = await fetch('/api/' + path, body === undefined ? {} : {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? 'Không thể xử lý yêu cầu.');
  if (data.user?.character) {
    const saved = characterSchema.safeParse(data.user.character);
    data.user.character = saved.success ? saved.data : null;
  }
  return data;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [register, setRegister] = useState(false);
  const [editing, setEditing] = useState(false);
  const [guestCharacter, setGuestCharacter] = useState(() => {
    try {
      const parsed = characterSchema.safeParse(JSON.parse(sessionStorage.getItem('travel_character') ?? 'null'));
      return parsed.success ? parsed.data : null;
    } catch { return null; }
  });
  const [guest, setGuest] = useState(() => sessionStorage.getItem('travel_guest') === 'true');
  const [pending, setPending] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    request('me').then(result => setUser(result.user))
      .catch(() => setError('Không thể tải phiên đăng nhập.'))
      .finally(() => setPending(false));
  }, []);

  async function send(path: string, body: object) {
    setPending(true);
    setError('');
    try {
      setUser((await request(path, body)).user);
      leaveGuest();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Vui lòng thử lại.');
    } finally {
      setPending(false);
    }
  }

  function startGuest() {
    sessionStorage.setItem('travel_guest', 'true');
    setError('');
    setGuest(true);
  }

  function leaveGuest() {
    sessionStorage.removeItem('travel_guest');
    setGuest(false);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(register ? 'register' : 'login', Object.fromEntries(new FormData(event.currentTarget)));
  }

  const character = user ? user.character : guestCharacter;
  if ((user || (guest && !register)) && (editing || !character)) {
    return <main className="world-shell">
      <CharacterEditor initial={character ?? newCharacter(user?.name ?? '')}
        save={async next => {
          if (user) setUser((await request('character', next)).user);
          else {
            sessionStorage.setItem('travel_character', JSON.stringify(next));
            setGuestCharacter(next);
          }
          setEditing(false);
        }}
        cancel={() => {
          setEditing(false);
          if (!character && user) void send('logout', {});
          if (!character && !user) leaveGuest();
        }} />
      {error && <p role="alert">{error}</p>}
    </main>;
  }
  if (character && (user || (guest && !register))) return <main className="world-shell">
    <Plaza character={character}/>
    <aside className="world-account">
      <strong>{character.name}{!user && ' · Khách'}</strong>
      {character.gender > 0 && <span>{genders[character.gender]}</span>}
      <button className="link" onClick={() => setEditing(true)}>Đổi nhân vật</button>
      {user ? <>
        <span>{user.email}</span>
        <button className="link" disabled={pending} onClick={() => void send('logout', {})}>Đăng xuất</button>
      </> : <>
        <button className="link" onClick={() => { setRegister(true); setError(''); }}>Tạo tài khoản</button>
        <button className="link" onClick={() => { leaveGuest(); setError(''); }}>Về trang đăng nhập</button>
      </>}
      {error && <p role="alert">{error}</p>}
    </aside>
  </main>;

  return <main>
    <section className="intro">
      <span className="brand">✦ GA MÂY</span>
      <h1>Gặp nhau ở<br/>một nơi mới.</h1>
      <p>Một thế giới nhỏ để gặp bạn bè, đi dạo và cùng nhau lên đường.</p>
      <div className="landscape" aria-hidden="true">✦</div>
    </section>
    <section className="panel">
        <span className="eyebrow">TÀI KHOẢN</span>
        <h2>{register ? 'Tạo tài khoản' : 'Đăng nhập'}</h2>
        <form key={String(register)} onSubmit={submit}>
          {register && <label>Tên hiển thị<input name="name" autoComplete="nickname" minLength={2} maxLength={40} required /></label>}
          <label>Email<input name="email" type="email" autoComplete="username" maxLength={254} required /></label>
          <label>Mật khẩu<input name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} minLength={10} maxLength={128} required /></label>
          {register && <small>Dùng ít nhất 10 ký tự.</small>}
          <button disabled={pending}>{pending ? 'Đang xử lý…' : register ? 'Đăng ký' : 'Đăng nhập'}</button>
        </form>
        <button className="link" disabled={pending} onClick={() => { setRegister(!register); setError(''); }}>
          {register ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
        </button>
      {!user && (!guest || register) && <button className="link guest-link" disabled={pending} onClick={() => { setRegister(false); startGuest(); }}>
        {guest ? 'Quay lại chơi thử' : 'Chơi thử với tư cách khách'}
      </button>}
      {error && <p role="alert">{error}</p>}
    </section>
  </main>;
}

createRoot(document.getElementById('root')!).render(<App />);
