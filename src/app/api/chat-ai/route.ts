import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { message, image, pdf } = await req.json();
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key mancante' }, { status: 500 });
  }

  try {
    const userContent: any[] = [];
    if (message) userContent.push({ type: 'text', text: message });
    if (image) userContent.push({ type: 'image_url', image_url: { url: image } });
    if (pdf) userContent.push({ type: 'text', text: `[PDF allegato in base64]: ${pdf}` });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://openrouter.ai/', // opzionale, per leaderboard
        'X-Title': 'Poker Advisor AI', // opzionale, per leaderboard
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3-0324:free',
        messages: [
          { role: 'system', content: 'Sei un assistente AI esperto di ragionamento matematico e logico.' },
          { role: 'user', content: userContent }
        ],
        temperature: 0.7,
        max_tokens: 1024
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Errore OpenRouter:', errorText);
      return NextResponse.json({ error: 'Errore dalla AI', details: errorText }, { status: 500 });
    }
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || 'Nessuna risposta generata.';
    return NextResponse.json({ text });
  } catch (err) {
    console.error('Errore generale:', err);
    return NextResponse.json({ error: 'Errore interno', details: String(err) }, { status: 500 });
  }
} 