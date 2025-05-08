import { HfInference } from '@huggingface/inference';

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || '';
const hf = new HfInference(HUGGINGFACE_API_KEY);

// Esempio di agente AI per consigli sul poker
async function pokerAgent(chat: string, screen: string) {
  try {
    if (!HUGGINGFACE_API_KEY) {
      return 'API key non configurata. Configura HUGGINGFACE_API_KEY nelle variabili d\'ambiente.';
    }

    // Utilizziamo il modello mistral-7b-instruct-v0.2 che è ottimo per il ragionamento
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: `[INST] Sei un esperto di poker. Analizza la seguente situazione e dai consigli strategici:

Chat: ${chat}

Screen: ${screen}

Dai consigli dettagliati sulla strategia da seguire. [/INST]`,
      parameters: {
        max_new_tokens: 1000,
        temperature: 0.7,
        top_p: 0.95,
        repetition_penalty: 1.1
      }
    });

    return response.generated_text || 'Nessun consiglio disponibile';
  } catch (error) {
    console.error('Errore durante la generazione dei consigli:', error);
    return 'Si è verificato un errore durante la generazione dei consigli.';
  }
}

export default pokerAgent; 