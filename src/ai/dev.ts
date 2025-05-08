import { Genkit } from '@genkit-ai/ai';

if (!process.env.GENKIT_API_KEY) {
  throw new Error('GENKIT_API_KEY non è configurata nelle variabili d\'ambiente');
}

const genkit = new Genkit({
  apiKey: process.env.GENKIT_API_KEY
});

// Esempio di agente AI per consigli sul poker
async function pokerAgent(chat: string, screen: string) {
  try {
    const response = await genkit.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Sei un esperto di poker che analizza chat e screenshot per fornire consigli strategici."
        },
        {
          role: "user",
          content: `Analizza la seguente situazione di poker:\n\nChat: ${chat}\n\nScreen: ${screen}`
        }
      ],
      model: "gpt-4-vision-preview", // o altro modello supportato da Genkit
      max_tokens: 1000
    });

    return response.choices[0]?.message?.content || 'Nessun consiglio disponibile';
  } catch (error) {
    console.error('Errore durante la generazione dei consigli:', error);
    throw error;
  }
}

export default pokerAgent; 