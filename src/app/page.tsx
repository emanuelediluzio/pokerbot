import React, { useState, ChangeEvent, FormEvent } from 'react';

export default function Home() {
  const [chat, setChat] = useState('');
  const [screen, setScreen] = useState('');
  const [advice, setAdvice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/poker-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chat, screen }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante l\'elaborazione della richiesta');
      }

      setAdvice(data.advice);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante l\'elaborazione della richiesta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Poker Advisor</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="chat" className="block text-sm font-medium mb-2">
            Chat:
          </label>
          <textarea
            id="chat"
            value={chat}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setChat(e.target.value)}
            className="w-full min-h-[100px] p-2 border rounded"
            placeholder="Inserisci la chat"
            required
          />
        </div>

        <div>
          <label htmlFor="screen" className="block text-sm font-medium mb-2">
            Screen (URL o base64):
          </label>
          <input
            id="screen"
            type="text"
            value={screen}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setScreen(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Inserisci l'URL o base64 dello screen"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Elaborazione...' : 'Ottieni Consigli'}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {advice && (
        <div className="mt-6 p-4 bg-green-50 rounded">
          <h2 className="text-xl font-semibold mb-2">Consigli:</h2>
          <p className="whitespace-pre-wrap">{advice}</p>
        </div>
      )}
    </div>
  );
} 