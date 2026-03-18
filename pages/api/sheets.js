export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { sheetsUrl, payload } = req.body;
  if (!sheetsUrl) return res.status(400).json({ error: 'No sheets URL' });

  try {
    const response = await fetch(sheetsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
