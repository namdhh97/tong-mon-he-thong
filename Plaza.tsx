import { avatarCanvas } from './avatar';
import type { Character } from './character';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Phaser from 'phaser';
import { Client, type Room } from 'colyseus.js';
import { WIDTH, HEIGHT, ROOM, type Player, type Speech } from './world';

type Avatar = { sprite: Phaser.GameObjects.Container; bubble: Phaser.GameObjects.Text; x: number; y: number; expires: number };

export function Plaza({ character }: { character: Character }) {
  const mount = useRef<HTMLDivElement>(null);
  const connection = useRef<Room | null>(null);
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState('Đang vào quảng trường…');
  const [attempt, setAttempt] = useState(0);
  const [message, setMessage] = useState('');
  const [lastSpeech, setLastSpeech] = useState('');

  useEffect(() => {
    let disposed = false;
    let players: Player[] = [];
    const speech = new Map<string, { text: string; expires: number }>();
    let self = '';
    const avatars = new Map<string, Avatar>();
    let nextKey = 0;
    setCount(0);
    setStatus('Đang vào quảng trường…');

    const game = new Phaser.Game({
      type: Phaser.AUTO, parent: mount.current!, width: WIDTH, height: HEIGHT,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      backgroundColor: '#b8d6a2',
      scene: {
        create(this: Phaser.Scene) {
          const scenery = this.add.graphics();
          scenery.fillStyle(0xe9ddbc).fillRoundedRect(62, 56, 776, 390, 90);
          scenery.lineStyle(2, 0xd8c8a4, .55);
          for (let y = 100; y < 445; y += 36) scenery.lineBetween(100, y, 800, y);
          for (let x = 125; x < 800; x += 45) scenery.lineBetween(x, 90, x, 410);
          scenery.fillStyle(0x91bfa2).fillEllipse(450, 205, 138, 80);
          scenery.fillStyle(0x457e7d).fillEllipse(450, 200, 116, 61);
          scenery.fillStyle(0x8fc6bd).fillEllipse(450, 193, 78, 33);
          for (const [x, y] of [[44, 80], [80, 430], [830, 70], [855, 402], [253, 30], [666, 467], [380, 30]]) {
            scenery.fillStyle(0x639673).fillCircle(x, y, 27);
            scenery.fillStyle(0x82ad76).fillCircle(x - 8, y - 9, 19);
          }
          this.add.text(450, 22, '✦  QUẢNG TRƯỜNG GA MÂY  ✦', {
            fontFamily: 'system-ui', fontSize: '15px', color: '#214d3d', fontStyle: 'bold'
          }).setOrigin(.5);
          this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            connection.current?.send('move', { x: pointer.worldX, y: pointer.worldY });
          });
        },
        update(this: Phaser.Scene, time: number, delta: number) {
          const ids = new Set(players.map(player => player.id));
          for (const [id, avatar] of avatars) {
            if (ids.has(id)) continue;
            avatar.sprite.destroy();
            avatars.delete(id);
            speech.delete(id);
          }
          for (const player of players) {
            let avatar = avatars.get(player.id);
            if (!avatar) {
              const key = [player.outfit, player.hair, player.head, player.face, player.build, player.skin].join('-');
              if (!this.textures.exists(key)) this.textures.addCanvas(key, avatarCanvas(player));
              const body = this.add.image(0, 17, key).setOrigin(.5, 1).setDisplaySize(62, 62);
              const name = this.add.text(0, 17, player.name, { fontFamily: 'system-ui', fontSize: '13px',
                backgroundColor: player.id === self ? '#194e42' : '#344438', padding: { x: 5, y: 2 } }).setOrigin(.5, 0);
              const bubble = this.add.text(0, -47, '', { fontFamily: 'system-ui', fontSize: '15px',
                color: '#193b31', backgroundColor: '#fffdf2', padding: { x: 9, y: 6 },
                wordWrap: { width: 170, useAdvancedWrap: true } }).setOrigin(.5, 1).setVisible(false);
              const sprite = this.add.container(player.x, player.y, [body, name, bubble]);
              avatar = { sprite, bubble, x: player.x, y: player.y, expires: 0 };
              avatars.set(player.id, avatar);
            }
            const blend = 1 - Math.exp(-delta / 65);
            avatar.x += (player.x - avatar.x) * blend;
            avatar.y += (player.y - avatar.y) * blend;
            avatar.sprite.setPosition(avatar.x, avatar.y).setDepth(avatar.y);
            const line = speech.get(player.id);
            if (line && line.expires !== avatar.expires) {
              avatar.expires = line.expires;
              avatar.bubble.setText(line.text);
            }
            avatar.bubble.setVisible(!!line && line.expires > Date.now());
          }
        }
      }
    });

    const client = new Client(location.origin);
    client.joinOrCreate(ROOM, { character }).then(room => {
      if (disposed) { void room.leave(); return; }
      connection.current = room;
      self = room.sessionId;
      room.onMessage('players', (list: Player[]) => {
        players = list;
        setCount(list.length);
      });
      room.onMessage('speech', (line: Speech) => {
        speech.set(line.id, { text: line.text, expires: Date.now() + 6500 });
        setLastSpeech((players.find(player => player.id === line.id)?.name ?? 'Lữ khách') + ': ' + line.text);
      });
      room.onLeave(() => {
        if (disposed) return;
        connection.current = null;
        players = [];
        setCount(0);
        setStatus('Đã mất kết nối.');
      });
      setStatus('');
    }).catch(() => {
      if (!disposed) setStatus('Chưa thể vào quảng trường.');
    });

    function move(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement) return;
      const offsets: Record<string, [number, number]> = {
        ArrowLeft: [-45, 0], ArrowRight: [45, 0], ArrowUp: [0, -45], ArrowDown: [0, 45]
      };
      const offset = offsets[event.key];
      const player = players.find(player => player.id === self);
      if (!offset || !player) return;
      event.preventDefault();
      if (performance.now() < nextKey) return;
      nextKey = performance.now() + 100;
      connection.current?.send('move', { x: player.x + offset[0], y: player.y + offset[1] });
    }
    window.addEventListener('keydown', move);
    return () => {
      disposed = true;
      window.removeEventListener('keydown', move);
      void connection.current?.leave();
      connection.current = null;
      game.destroy(true);
    };
  }, [character, attempt]);

  function send(event: FormEvent) {
    event.preventDefault();
    if (!message.trim() || !connection.current) return;
    connection.current.send('chat', message.trim());
    setMessage('');
  }

  return <section className="plaza" aria-label="Quảng trường">
    <div className="plaza-heading"><strong>✦ Ga Mây</strong><span>{count} người trong khu</span></div>
    <div className="plaza-map" ref={mount} />
    {status && <p role="status">{status} {!status.startsWith('Đang') &&
      <button type="button" onClick={() => setAttempt(attempt + 1)}>Thử lại</button>}</p>}
    <form className="plaza-chat" onSubmit={send}>
      <input aria-label="Tin nhắn quảng trường" placeholder="Nói gì đó với mọi người…" maxLength={140}
        value={message} onChange={event => setMessage(event.target.value)} disabled={!!status}/>
      <button disabled={!!status || !message.trim()}>Gửi</button>
    </form>
    <small>Chạm vào bản đồ hoặc dùng phím mũi tên để đi lại.</small>
    <p className="sr-only" aria-live="polite">{lastSpeech}</p>
  </section>;
}
