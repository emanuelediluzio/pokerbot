/// <reference types="next" />
import { NextResponse } from 'next/server';
import pokerAgent from '../../../ai/dev';

interface PokerAdviceRequest {
  chat: string;
  screen: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as PokerAdviceRequest;
    
    if (!body.chat?.trim()) {
      return NextResponse.json(
        { error: 'Il campo chat è richiesto' },
        { status: 400 }
      );
    }

    if (!body.screen?.trim()) {
      return NextResponse.json(
        { error: 'Il campo screen è richiesto' },
        { status: 400 }
      );
    }

    // Validazione base64 o URL per lo screen
    const isBase64 = /^data:image\/[a-z]+;base64,/.test(body.screen);
    const isUrl = /^https?:\/\//.test(body.screen);

    if (!isBase64 && !isUrl) {
      return NextResponse.json(
        { error: 'Lo screen deve essere un URL valido o un\'immagine in base64' },
        { status: 400 }
      );
    }

    const advice = await pokerAgent(body.chat, body.screen);
    
    if (!advice) {
      return NextResponse.json(
        { error: 'Non è stato possibile generare consigli' },
        { status: 500 }
      );
    }

    return NextResponse.json({ advice });
  } catch (error) {
    console.error('Errore durante l\'elaborazione della richiesta:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
} 