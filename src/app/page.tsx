'use client';

import React, { useState, ChangeEvent, FormEvent, useRef } from 'react';

export default function Home() {
  const [chat, setChat] = useState('');
  const [screen, setScreen] = useState('');
  const [advice, setAdvice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Per favore carica un\'immagine valida');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'immagine deve essere inferiore a 5MB');
      return;
    }
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setScreen(result);
        setPreview(result);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Errore durante la lettura del file');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/poker-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    <div className="min-h-screen bg-gradient-to-br from-[#18181c] to-[#23232a] flex items-center justify-center py-8 px-2">
      <div className="w-full max-w-xl bg-[#23232a] rounded-2xl shadow-2xl p-6 sm:p-10 border border-[#23232a]/60">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">Poker Advisor <span className="text-green-400">AI</span></h1>
          <p className="text-base text-gray-400">Carica uno screenshot e descrivi la situazione per ricevere consigli strategici</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="chat" className="block text-base font-medium text-gray-300 mb-1">Descrizione della situazione</label>
            <textarea
              id="chat"
              value={chat}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setChat(e.target.value)}
              className="w-full min-h-[100px] p-3 border border-[#33334a] bg-[#19191f] rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 text-gray-100 placeholder-gray-500 transition"
              placeholder="Posizione al tavolo, stack, azioni precedenti, ecc..."
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-300 mb-1">Screenshot della partita</label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#33334a] rounded-xl p-4 bg-[#18181c] hover:border-green-400 transition-colors">
              {preview ? (
                <div className="relative w-full flex flex-col items-center">
                  <img src={preview} alt="Preview" className="max-h-48 rounded-lg object-contain border border-[#33334a]" />
                  <button
                    type="button"
                    onClick={() => {
                      setPreview(null);
                      setScreen('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow"
                    aria-label="Rimuovi immagine"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <>
                  <svg
                    className="mx-auto h-14 w-14 text-[#33334a] mb-2"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <rect x="8" y="8" width="32" height="32" rx="8" strokeWidth="3" />
                    <path d="M16 32l8-8 8 8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="20" cy="20" r="2.5" fill="currentColor" />
                    <path d="M32 16v8m4-4h-8" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <label className="block cursor-pointer text-green-400 font-medium hover:underline">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                    Carica un file o trascina qui
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF fino a 5MB</p>
                </>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !screen}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-semibold text-lg shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Elaborazione...
              </span>
            ) : (
              'Ottieni Consigli'
            )}
          </button>
        </form>
        {error && (
          <div className="mt-6 p-3 bg-red-900/60 border border-red-800 rounded-lg text-red-200 text-center text-sm">
            {error}
          </div>
        )}
        {advice && (
          <div className="mt-8 flex flex-col items-end gap-4">
            <div className="bg-[#23232a] border border-[#33334a] rounded-2xl px-5 py-4 max-w-[90%] self-end shadow-lg animate-fade-in">
              <span className="block text-green-400 font-semibold mb-1">Poker Advisor AI</span>
              <p className="whitespace-pre-wrap text-gray-100 text-base leading-relaxed">{advice}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 