'use client';

import React, { useState, useRef, FormEvent, ChangeEvent } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  image?: string | null;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Ciao! Sono il tuo assistente AI. Come posso aiutarti?' }
  ]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !image) return;
    setMessages((msgs) => [...msgs, { role: 'user', content: input, image }]);
    setLoading(true);
    const userMessage = input;
    setInput('');
    setImage(null);
    try {
      const res = await fetch('/api/chat-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, image }),
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
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
                  {msg.image && (
                    <img src={msg.image} alt="user upload" className="mt-2 max-h-40 rounded-xl border border-gray-700" />
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="self-start px-4 py-2 rounded-2xl bg-gray-800 text-gray-400 animate-pulse text-base max-w-[80vw] sm:max-w-[70%] shadow">Sto scrivendo...</div>
            )}
          </div>
        </div>
      </div>
      <form onSubmit={handleSend} className="w-full max-w-xl mx-auto flex gap-2 p-4 items-center">
        <input
          ref={inputRef}
          type="text"
          className="flex-1 rounded-2xl px-4 py-3 bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none text-lg shadow"
          placeholder="Scrivi un messaggio..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-2xl shadow text-sm">
          📎
        </label>
        <button
          type="submit"
          className="rounded-2xl px-6 py-3 bg-blue-600 text-white font-bold text-lg shadow hover:bg-blue-700 transition disabled:opacity-50"
          disabled={loading || (!input.trim() && !image)}
        >
          Invia
        </button>
      </form>
    </div>
  );
} 