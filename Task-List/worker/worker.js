const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

function kvKey(date) {
  return 'task-list-' + date;
}

function validDate(date) {
  return typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function authorized(request, env) {
  const header = request.headers.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  return token && env.AUTH_TOKEN && token === env.AUTH_TOKEN;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);
    if (url.pathname !== '/api/today') {
      return json({ error: 'Not found' }, 404);
    }

    if (!authorized(request, env)) {
      return json({ error: 'Unauthorized' }, 401);
    }

    if (request.method === 'GET') {
      const date = url.searchParams.get('date');
      if (!validDate(date)) {
        return json({ error: 'Invalid date' }, 400);
      }
      const text = await env.TASKS.get(kvKey(date));
      if (text == null || text === '') {
        return json({ date, text: '' }, 404);
      }
      return json({ date, text });
    }

    if (request.method === 'POST') {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: 'Invalid JSON' }, 400);
      }
      const date = body && body.date;
      const text = body && typeof body.text === 'string' ? body.text : '';
      if (!validDate(date)) {
        return json({ error: 'Invalid date' }, 400);
      }
      await env.TASKS.put(kvKey(date), text);
      return json({ date, ok: true });
    }

    return json({ error: 'Method not allowed' }, 405);
  },
};
