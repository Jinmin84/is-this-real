// Vercel Serverless Function
// 경로: /api/analyze
// 환경변수 ANTHROPIC_API_KEY를 Vercel 프로젝트 설정에 등록해야 합니다.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST 요청만 허용됩니다.' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: '서버에 API 키가 설정되지 않았습니다. (ANTHROPIC_API_KEY 환경변수 확인)' });
  }

  try {
    const { content, tools } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'content가 필요합니다.' });
    }

    const requestBody = {
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      messages: [
        { role: 'user', content }
      ]
    };

    if (tools) {
      requestBody.tools = tools;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'API 요청 실패' });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: '서버 오류: ' + err.message });
  }
}
