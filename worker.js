const SYNC_PIN = 'memo2024'; // ← あとで変更してください

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/sync') {
      const pin = request.headers.get('x-sync-pin');
      if (pin !== SYNC_PIN) {
        return new Response(JSON.stringify({ error: 'PINが違います' }), {
          status: 401,
          headers: corsHeaders('application/json'),
        });
      }
      if (request.method === 'GET') {
        const data = await env.MEMO_STORE.get('sync_data');
        return new Response(data || JSON.stringify({ memos: [], folders: [] }), {
          headers: corsHeaders('application/json'),
        });
      }
      if (request.method === 'POST') {
        const body = await request.text();
        await env.MEMO_STORE.put('sync_data', body);
        return new Response(JSON.stringify({ ok: true }), {
          headers: corsHeaders('application/json'),
        });
      }
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders() });
      }
    }

    return env.ASSETS.fetch(request);
  },
};

function corsHeaders(contentType) {
  const h = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-sync-pin',
  };
  if (contentType) h['Content-Type'] = contentType;
  return h;
}
