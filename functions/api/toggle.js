export async function onRequestPost({ request, env }) {
  // Simple shared password
  const pass = request.headers.get("x-pass") || "";
  const required = env.APP_PASS || "1234";
  if (pass !== required) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const key = String(body.key || "");
  const on = Boolean(body.on);

  if (!key || !key.includes("|")) {
    return new Response("Bad request", { status: 400 });
  }

  const now = new Date();
  const weekKey = isoWeekKey(now);
  const storageKey = `blocks:${weekKey}`;

  const raw = await env.AVAIL_KV.get(storageKey);
  const set = new Set(raw ? JSON.parse(raw) : []);

  if (on) set.add(key);
  else set.delete(key);

  await env.AVAIL_KV.put(storageKey, JSON.stringify([...set]));

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json" },
  });
}

// ISO week key helper
function isoWeekKey(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}
