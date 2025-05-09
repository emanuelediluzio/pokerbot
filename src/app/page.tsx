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
    <div className="min-h-screen w-full bg-gradient-to-br from-[#181a20] via-[#23263a] to-[#10101a] flex items-center justify-center py-8 px-2">
      <div className="w-full max-w-xl mx-auto rounded-3xl shadow-2xl bg-[#181a20]/90 border border-[#23263a] relative overflow-hidden backdrop-blur-xl">
        <div className="relative z-10 p-8 sm:p-12 flex flex-col gap-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">Poker Advisor AI</h1>
            <p className="text-lg text-gray-400 font-light">Carica uno screenshot e descrivi la situazione per ricevere consigli strategici</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-7">
            <div>
              <label htmlFor="chat" className="block text-base font-semibold text-gray-200 mb-2">Descrizione della situazione</label>
              <textarea
                id="chat"
                value={chat}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setChat(e.target.value)}
                className="w-full min-h-[110px] p-4 border border-[#23263a] bg-[#23263a]/60 rounded-2xl focus:ring-2 focus:ring-green-400 text-gray-100 placeholder-gray-500 text-lg shadow-inner transition"
                placeholder="Posizione al tavolo, stack, azioni precedenti, ecc..."
                required
              />
            </div>
            <div>
              <label className="block text-base font-semibold text-gray-200 mb-2">Screenshot della partita</label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-green-500/30 rounded-2xl p-6 bg-[#23263a]/40 hover:border-green-400 transition-colors">
                {preview ? (
                  <div className="relative w-full flex flex-col items-center">
                    <img src={preview} alt="Preview" className="max-h-52 rounded-xl object-contain border border-green-500/20 shadow-lg" />
                    <button
                      type="button"
                      onClick={() => {
                        setPreview(null);
                        setScreen('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute top-2 right-2 bg-red-500/80 text-white p-1 rounded-full hover:bg-red-600 shadow"
                      aria-label="Rimuovi immagine"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <>
                    <svg
                      className="mx-auto h-14 w-14 text-green-500/40 mb-2"
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
                    <label className="block cursor-pointer text-green-300 font-medium hover:underline">
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
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-green-500 via-blue-500 to-violet-500 hover:from-green-600 hover:to-violet-600 text-white font-bold text-lg shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-green-400"
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
            <div className="mt-6 p-3 bg-red-900/70 border border-red-800 rounded-2xl text-red-200 text-center text-base shadow-lg backdrop-blur-md">
              {error}
            </div>
          )}
          {advice && (
            <div className="mt-8 flex flex-col items-end gap-4">
              <div className="bg-gradient-to-br from-green-700/80 via-[#23263a] to-blue-900/80 border border-green-500/30 rounded-3xl px-6 py-5 max-w-[90%] self-end shadow-2xl animate-fade-in backdrop-blur-md relative">
                <span className="block text-green-300 font-semibold mb-1">Poker Advisor AI</span>
                <p className="whitespace-pre-wrap text-gray-100 text-lg leading-relaxed drop-shadow-lg">{advice}</p>
                <span className="absolute -top-3 right-6 w-4 h-4 bg-green-400 rounded-full blur-sm opacity-40 animate-pulse" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 