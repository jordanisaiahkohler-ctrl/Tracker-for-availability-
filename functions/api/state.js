export async function onRequestGet({ env }) {
  const now = new Date();
  const weekKey = isoWeekKey(now);            // e.g. "2026-W06"
  const storageKey = `blocks:${weekKey}`;

  const raw = await env.AVAIL_KV.get(storageKey);
  const blocked = raw ? JSON.parse(raw) : [];

  return new Response(JSON.stringify({ weekKey, blocked }), {
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
