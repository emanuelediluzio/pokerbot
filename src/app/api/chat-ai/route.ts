import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { message, image } = await req.json();
  // API key fornita dall'utente
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key mancante' }, { status: 500 });
  }

  try {
    // Se c'è un'immagine, usa Phi-3-vision (modello multimodale gratuito)
    // Altrimenti usa Mixtral (modello solo testo)
    const model = image ? 'microsoft/phi-3-vision-128k-instruct:free' : 'mistralai/mixtral-8x7b-instruct:free';
    
    // Costruisci il messaggio in base alla presenza dell'immagine
    const messages = image 
      ? [
          {
            role: 'system',
            content: "Sei PokerBot, un assistente AI esperto di poker. Se l'utente invia un'immagine, descrivi solo ciò che è rilevante per il poker: carte, tavoli, strategie visibili. Rispondi in modo sintetico e chiaro, massimo 5-6 frasi. Se non vedi contenuti relativi al poker nell'immagine, dillo semplicemente."
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: message || "Cosa vedi in questa immagine di poker?" },
              { type: 'image_url', image_url: { url: image } }
            ]
          }
        ]
      : [
          {
            role: 'system',
            content: "Sei PokerBot, un assistente AI esperto di poker. Rispondi in modo sintetico e chiaro, massimo 5-6 frasi."
          },
          { 
            role: 'user', 
            content: message || "Ciao, sono qui per parlare di poker."
          }
        ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://openrouter.ai/',
        'X-Title': 'Poker Advisor AI',
      },
      body: JSON.stringify({
        model,
        messages,
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