import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { message } = await req.json();
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key mancante' }, { status: 500 });
  }

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: message,
        parameters: { max_new_tokens: 200, temperature: 0.7 }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Errore Hugging Face:', errorText);
      return NextResponse.json({ error: 'Errore dalla AI', details: errorText }, { status: 500 });
    }
    const data = await response.json();
    const text = data?.[0]?.generated_text || 'Nessuna risposta generata.';
    return NextResponse.json({ text });
  } catch (err) {
    console.error('Errore generale:', err);
    return NextResponse.json({ error: 'Errore interno', details: String(err) }, { status: 500 });
  }
} 