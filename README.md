# Poker AI Advisor

Un assistente AI per il poker con supporto per immagini, realizzato con Next.js.

## Funzionalità

- Interfaccia chat in stile ChatGPT con tema scuro
- Supporto per upload e analisi di immagini
- Supporto per diversi modelli di AI
- Sidebar navigabile per conversazioni multiple

## Configurazione

1. Copia il file `.env.example` in `.env.local`
2. Imposta le chiavi API:
   - `OPENROUTER_API_KEY`: La tua chiave API per OpenRouter
   - `HUGGINGFACE_API_KEY`: La tua chiave API per Hugging Face (opzionale)

## Modelli AI supportati

Il progetto supporta diversi modelli AI tramite OpenRouter:

- **Default Text Model**: Mistral AI Mixtral-8x7B (free)
- **Default Vision Model**: Microsoft Phi-3 Vision (free)
- **Llama 4 Maverick**: Meta Llama 4 17B Maverick (free)

Puoi configurare il modello da utilizzare tramite variabili d'ambiente:
- `DEFAULT_TEXT_MODEL`: Modello per testo
- `DEFAULT_VISION_MODEL`: Modello per visione
- `USE_LLAMA4`: Imposta a "true" per usare Llama 4 Maverick

## Sviluppo

```bash
npm install
npm run dev
```

Il server di sviluppo sarà disponibile su [http://localhost:3000](http://localhost:3000).

## Deploy

Il progetto è configurato per il deploy su Vercel.
