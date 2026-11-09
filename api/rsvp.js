// O&M — אישורי הגעה. Vercel Function + Upstash Redis (REST, בלי תלויות).
//   POST /api/rsvp            ← אורח שולח אישור (אותו טלפון = עדכון)
//   GET  /api/rsvp  + header x-admin-key  ← רשימת המאשרים
const crypto = require('crypto');

const KEY = 'om:rsvps'; // Redis hash: phone -> JSON

function redisEnv() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('redis not configured');
  return { url, token };
}

async function redis(...cmd) {
  const { url, token } = redisEnv();
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd)
  });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(j.error || 'redis ' + r.status);
  return j.result;
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

const clean = (v, max) => String(v == null ? '' : v).trim().slice(0, max);

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return JSON.parse(raw || '{}');
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'POST') {
      let d;
      try { d = await readBody(req); } catch (e) { return res.status(400).json({ ok: false, error: 'bad json' }); }
      const name = clean(d.name, 80);
      const phone = String(d.phone || '').replace(/[^\d]/g, '').slice(0, 15);
      if (!name || phone.length < 9) return res.status(400).json({ ok: false, error: 'missing' });
      const attending = d.attending === 'no' ? 'no' : 'yes';
      const count = attending === 'yes' ? Math.max(1, Math.min(30, parseInt(d.count, 10) || 1)) : 0;
      const row = { time: new Date().toISOString(), name, phone, attending, count, note: clean(d.note, 500) };
      const isNew = await redis('HSET', KEY, phone, JSON.stringify(row));
      return res.status(200).json({ ok: true, updated: Number(isNew) === 0 });
    }

    if (req.method === 'GET') {
      const admin = process.env.ADMIN_KEY;
      if (!admin || !safeEqual(req.headers['x-admin-key'] || '', admin)) {
        return res.status(401).json({ ok: false, error: 'unauthorized' });
      }
      const flat = (await redis('HGETALL', KEY)) || [];
      const rows = [];
      for (let i = 1; i < flat.length; i += 2) {
        try { rows.push(JSON.parse(flat[i])); } catch (e) {}
      }
      return res.status(200).json({ ok: true, rows });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'method' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'server' });
  }
};
