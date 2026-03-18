export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { topic, tone, academyData } = req.body;

  const TONE_DESC = {
    trendy: 'MZ세대 감성, 트렌디하고 직설적인 문체, 공감 유발',
    informative: '팩트 중심, 분석적, 데이터와 수치 활용, 객관적 문체',
    emotional: '감성적 스토리텔링, 공감과 감동, 따뜻한 문체',
    listicle: 'TOP N 형식, 순위와 리스트, 명확한 포인트'
  };

  const prompt = `당신은 인스타그램 카드뉴스 카피라이터입니다.
주제: "${topic.replace(/["`]/g, '')}"
톤: ${TONE_DESC[tone] || TONE_DESC.trendy}${academyData ? '\n' + academyData : ''}

순수 JSON만 출력 (백틱/설명 없이):
{"series_title":"시리즈제목","hashtags":["태그1","태그2","태그3","태그4","태그5"],"slides":[{"type":"cover","headline":"커버제목","subtitle":"부제목","tag":"FILM"},{"type":"body","headline":"제목","highlight":"핵심문장","content":"본문80자"},{"type":"body","headline":"제목","highlight":"핵심문장","content":"본문80자"},{"type":"body","headline":"제목","highlight":"핵심문장","content":"본문80자"},{"type":"closing","headline":"마무리제목","content":"마무리메시지","hashtags":["태그1","태그2","태그3","태그4","태그5"]}]}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    if (!response.ok) throw new Error(`API ${response.status}`);
    const data = await response.json();
    const text = data.content.map(c => c.text || '').join('');
    const clean = text.replace(/```[\w]*\n?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.status(200).json(parsed);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
