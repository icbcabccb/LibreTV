export async function onRequest(context) {
  const { request, env } = context;
  const db = env.DB;

  // 1. CORS 跨域处理
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const url = new URL(request.url);
  const userKey = url.searchParams.get("userKey");

  if (!userKey) return new Response(JSON.stringify({ error: "Missing userKey" }), { status: 400 });

  // 2. GET: 获取云端历史
  if (request.method === "GET") {
    try {
      const { results } = await db.prepare(
        "SELECT * FROM history WHERE user_key = ? ORDER BY updated_at DESC LIMIT 100"
      ).bind(userKey).all();
      return Response.json({ code: 200, list: results });
    } catch (e) {
      return Response.json({ code: 500, error: e.message });
    }
  }

  // 3. POST: 上传/同步记录
  if (request.method === "POST") {
    try {
      const data = await request.json();
      const now = Date.now();
      
      const stmt = db.prepare(`
        INSERT INTO history (user_key, video_id, source_code, title, cover, url, episode_index, playback_position, duration, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_key, video_id, source_code) DO UPDATE SET
          episode_index = excluded.episode_index,
          playback_position = excluded.playback_position,
          updated_at = excluded.updated_at
      `);

      await stmt.bind(
        userKey,
        data.video_id,
        data.source_code || 'unknown',
        data.title,
        data.cover || '',
        data.url,
        data.episode_index || 0,
        data.playback_position || 0,
        data.duration || 0,
        now
      ).run();

      return Response.json({ code: 200, success: true });
    } catch (e) {
      return Response.json({ code: 500, error: e.message });
    }
  }

  return new Response("Method not allowed", { status: 405 });
}
