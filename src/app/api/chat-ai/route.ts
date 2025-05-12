import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { message } = await req.json();
  // API key fornita dall'utente
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key mancante' }, { status: 500 });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://openrouter.ai/',
        'X-Title': 'Poker Advisor AI',
      },
      body: JSON.stringify({
        model: 'mistralai/mixtral-8x7b-instruct:free',
        messages: [
          {
            role: 'system',
            content: "Sei PokerBot, un assistente AI esperto di poker. Rispondi in modo sintetico e chiaro, massimo 5-6 frasi. Non ripetere informazioni inutili, non scrivere troppo. Se non puoi rispondere, dillo chiaramente."
          },
          { 
            role: 'user', 
            content: message || "Ciao, sono qui per parlare di poker."
          }
        ],
        temperature: 0.7,
        max_tokens: 2048
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