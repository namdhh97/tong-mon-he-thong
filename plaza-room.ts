import { characterSchema, newCharacter, outfits, type Character } from './character';
import { Room, type AuthContext, type Client } from '@colyseus/core';
import { z } from 'zod';
import { HEIGHT, WIDTH, type Player } from './world';

const destination = z.object({ x: z.number(), y: z.number() });
const chat = z.string().trim().min(1).max(140);

export function plazaRoom(findCharacter: (cookie?: string) => Promise<Character | null | undefined>) {
  return class PlazaRoom extends Room {
    maxClients = 50;
    private players = new Map<string, Player>();
    private targets = new Map<string, { x: number; y: number }>();
    private lastChat = new Map<string, number>();
    private lastMove = new Map<string, number>();
    private dirty = false;

    async onAuth(_client: Client, options: { character?: unknown }, context: AuthContext) {
      const saved = characterSchema.safeParse(await findCharacter(context.headers.cookie));
      const guest = characterSchema.safeParse(options?.character);
      return { character: saved.success ? saved.data : guest.success ? guest.data : undefined };

    }

    onCreate() {
      this.onMessage('move', (client, value) => {
        const now = Date.now();
        if (now - (this.lastMove.get(client.sessionId) ?? 0) < 70) return;
        const result = destination.safeParse(value);
        if (!result.success || !this.players.has(client.sessionId)) return;
        this.lastMove.set(client.sessionId, now);
        this.targets.set(client.sessionId, {
          x: Math.max(30, Math.min(WIDTH - 30, result.data.x)),
          y: Math.max(115, Math.min(HEIGHT - 35, result.data.y))
        });
      });
      this.onMessage('chat', (client, value) => {
        const now = Date.now();
        if (now - (this.lastChat.get(client.sessionId) ?? 0) < 500) return;
        const result = chat.safeParse(value);
        if (!result.success || !this.players.has(client.sessionId)) return;
        this.lastChat.set(client.sessionId, now);
        this.broadcast('speech', { id: client.sessionId, text: result.data });
      });
      this.setSimulationInterval((elapsed) => {
        for (const [id, target] of this.targets) {
          const player = this.players.get(id)!;
          const dx = target.x - player.x;
          const dy = target.y - player.y;
          const distance = Math.hypot(dx, dy);
          const step = Math.min(elapsed, 150) * .18;
          if (distance <= step) {
            Object.assign(player, target);
            this.targets.delete(id);
          } else {
            player.x += dx * step / distance;
            player.y += dy * step / distance;
          }
          this.dirty = true;
        }
        if (this.dirty) {
          this.broadcast('players', [...this.players.values()]);
          this.dirty = false;
        }
      }, 100);
    }

    onJoin(client: Client, _options: unknown, auth: { character?: Character }) {
      const id = client.sessionId;
      const index = this.players.size;
      this.players.set(id, {
        ...(auth.character ?? { ...newCharacter('Khách ' + id.slice(-4)), outfit: index % outfits.length }),
        id, x: 270 + (index % 9) * 44, y: 312 + Math.floor(index / 9) * 18
      });
      this.dirty = true;
    }

    onLeave(client: Client) {
      const id = client.sessionId;
      this.targets.delete(id);
      this.players.delete(id);
      this.lastChat.delete(id);
      this.lastMove.delete(id);
      this.dirty = true;
    }
  };
}
