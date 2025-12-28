const { connectToDatabase } = require('../_db');

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }
  try {
    const buf = await streamToBuffer(req);
    const body = buf.length ? JSON.parse(buf.toString('utf8')) : {};
    const { type, path: pagePath, element, text, meta } = body || {};
    if (!type) {
      res.status(400).json({ message: 'type is required' });
      return;
    }
    const { db } = await connectToDatabase();
    const doc = {
      type,
      path: pagePath,
      element: element || null,
      text: text || null,
      meta: {
        clientId: meta?.clientId || null,
        sessionId: meta?.sessionId || null,
        device: meta?.device || null,
        loadTimeMs: meta?.loadTimeMs ?? null,
        ua: meta?.ua || null,
        width: meta?.width ?? null,
        height: meta?.height ?? null,
      },
      ts: new Date(),
    };
    await db.collection('events').insertOne(doc);
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ message: 'Failed to track', error: String(e && e.message || e) });
  }
};



