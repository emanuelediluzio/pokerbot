'use client';

import React, { useState, useRef, FormEvent } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Ciao! Sono il tuo assistente AI. Come posso aiutarti?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { role: 'user', content: input }]);
    setLoading(true);
    const userMessage = input;
    setInput('');
    try {
      const res = await fetch('/api/chat-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await res.json();
      setMessages((msgs) => [
        ...msgs,
        { role: 'assistant', content: data.text || 'Nessuna risposta generata.' }
      ]);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { role: 'assistant', content: 'Errore nella risposta AI.' }
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="flex-1 flex flex-col items-center justify-center px-2 py-8">
        <div className="w-full max-w-xl bg-gray-900 rounded-3xl shadow-2xl p-6 sm:p-10 flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">Chat AI</h1>
          <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto mb-2">
            {messages.map((msg, i) => (
              <div key={i} className={msg.role === 'user' ? 'self-end' : 'self-start'}>
                <div className={`px-4 py-2 rounded-2xl text-base max-w-[80vw] sm:max-w-[70%] shadow ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-100'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="self-start px-4 py-2 rounded-2xl bg-gray-800 text-gray-400 animate-pulse text-base max-w-[80vw] sm:max-w-[70%] shadow">Sto scrivendo...</div>
            )}
          </div>
        </div>
      </div>
      <form onSubmit={handleSend} className="w-full max-w-xl mx-auto flex gap-2 p-4">
        <input
          ref={inputRef}
          type="text"
          className="flex-1 rounded-2xl px-4 py-3 bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none text-lg shadow"
          placeholder="Scrivi un messaggio..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="rounded-2xl px-6 py-3 bg-blue-600 text-white font-bold text-lg shadow hover:bg-blue-700 transition disabled:opacity-50"
          disabled={loading || !input.trim()}
        >
          Invia
        </button>
      </form>
    </div>
  );
} 