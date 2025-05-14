import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // Validazione input
    let message = "";
    let image = null;
    
    try {
      const body = await req.json();
      message = body.message || "";
      image = body.image || null;
    } catch (e) {
      console.error('Errore parsing JSON:', e);
      return NextResponse.json({ error: 'Formato richiesta non valido' }, { status: 400 });
    }
    
    // Logging di debug
    console.log('Richiesta ricevuta:', { message, hasImage: !!image });
    
    // API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('API key mancante');
      return NextResponse.json({ error: 'API key mancante' }, { status: 500 });
    }

    // Usa sempre Mixtral come modello di base per text
    const model = image 
      ? 'microsoft/phi-3-vision-128k-instruct:free'
      : 'mistralai/mixtral-8x7b-instruct:free';
    
    console.log(`Usando il modello: ${model}`);
    
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

    try {
      console.log('Chiamata API a OpenRouter...');
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
      console.log('Risposta ricevuta:', data);
      const text = data.choices?.[0]?.message?.content || 'Nessuna risposta generata.';
      return NextResponse.json({ text });
    } catch (apiErr) {
      console.error('Errore chiamata API:', apiErr);
      return NextResponse.json({ error: 'Errore di connessione API', details: String(apiErr) }, { status: 503 });
    }
  } catch (err) {
    console.error('Errore generale:', err);
    return NextResponse.json({ error: 'Errore interno', details: String(err) }, { status: 500 });
  }
} 