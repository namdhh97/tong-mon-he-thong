interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  VOICE_ORIGIN?: string;
  VOICE_API_TOKEN?: string;
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (new URL(request.url).pathname !== '/api/voice') return env.ASSETS.fetch(request);
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    if (!env.VOICE_ORIGIN || !env.VOICE_API_TOKEN) return new Response('Voice not configured', { status: 503 });
    const body = await request.text();
    if (body.length > 8192) return new Response('Too large', { status: 413 });
    let text: unknown;
    try { text = JSON.parse(body).text; } catch { return new Response('Invalid JSON', { status: 400 }); }
    if (typeof text !== 'string' || !text.trim() || text.length > 1200) return new Response('Invalid text', { status: 400 });
    try {
      const audio = await fetch(new URL('/voice', env.VOICE_ORIGIN), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.VOICE_API_TOKEN },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(40000)
      });
      if (!audio.ok) return new Response('Voice unavailable', { status: 503 });
      return new Response(audio.body, { headers: { 'Content-Type': 'audio/wav', 'Cache-Control': 'no-store' } });
    } catch { return new Response('Voice unavailable', { status: 503 }); }
  }
};