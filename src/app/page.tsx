'use client';

import React, { useState, useRef, FormEvent, ChangeEvent, useEffect } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  image?: string | null;
};

const SYSTEM_PROMPT = "Sei PokerBot, un assistente AI specializzato nell'aiutare gli utenti con domande, strategie e situazioni di poker. Rispondi in modo chiaro, utile e amichevole, anche a domande di logica o curiosità sul gioco.";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Ciao! Sono PokerBot, il tuo assistente AI per il poker. Come posso aiutarti? Puoi chiedermi strategie, consigli o chiarimenti su mani e situazioni di gioco.' }
  ]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Funzione per filtrare i tag <think>...</think>
  function stripThinkTags(text: string) {
    return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  }

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
    const img = new window.Image();
    const reader = new FileReader();
    reader.onload = (ev) => {
      img.onload = () => {
        // Calcola nuove dimensioni
        const maxDim = 800;
        let { width, height } = img;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        // Ridimensiona su canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        // Converte in JPEG qualità 0.7
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setImage(dataUrl);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#23243a] via-[#181a25] to-[#10101a] px-2 py-8">
      <div className="w-full max-w-2xl mx-auto rounded-3xl shadow-2xl bg-[#181a20]/90 border border-[#23263a] flex flex-row min-h-[70vh] max-h-[90vh] p-0 sm:p-0 relative overflow-hidden backdrop-blur-xl">
        {/* Sidebar messaggi */}
        <div className="w-48 sm:w-56 bg-[#181a25] border-r border-[#23263a] flex flex-col items-center py-4 gap-2 overflow-y-auto">
          {messages.map((msg, i) => (
            <button
              key={i}
              className={`w-full text-left whitespace-nowrap overflow-hidden text-ellipsis text-xs sm:text-sm px-3 py-2 rounded-lg mb-1 transition-all flex items-center gap-2 ${msg.role === 'user' ? 'bg-blue-900 text-blue-200' : 'bg-gray-800 text-gray-200'} hover:bg-blue-700 hover:text-white`}
              onClick={() => {
                messageRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              title={msg.role === 'user' ? 'Utente' : 'AI'}
            >
              <span className="text-lg">{msg.role === 'user' ? '👤' : '🤖'}</span>
              <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{msg.content.replace(/\n/g, ' ').slice(0, 40)}{msg.content.length > 40 ? '…' : ''}</span>
            </button>
          ))}
        </div>
        {/* Chat principale */}
        <div ref={chatContainerRef} className="flex-1 flex flex-col justify-end p-4 sm:p-8 gap-4 overflow-y-auto" style={{scrollbarWidth:'thin'}}>
          <h1 className="text-3xl font-extrabold text-white mb-2 text-center drop-shadow-lg">PokerBot AI</h1>
          <div className="flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div key={i} ref={el => { messageRefs.current[i] = el; }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`break-words whitespace-pre-wrap px-5 py-3 rounded-2xl text-base max-w-[80vw] sm:max-w-[70%] shadow transition-all
                    ${msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white self-end rounded-br-md'
                      : 'bg-[#23263a] text-gray-100 self-start rounded-bl-md border border-[#23263a]'}
                  `}
                  style={{wordBreak:'break-word'}}
                >
                  {msg.role === 'assistant' ? stripThinkTags(msg.content) : msg.content}
                  {msg.image && (
                    <img src={msg.image} alt="user upload" className="mt-2 max-h-40 rounded-xl border border-gray-700" />
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-5 py-3 rounded-2xl bg-[#23263a] text-gray-400 animate-pulse text-base max-w-[80vw] sm:max-w-[70%] shadow">Sto scrivendo...</div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
        <form onSubmit={handleSend} className="w-full flex gap-2 p-4 items-center bg-[#181a20]/80 border-t border-[#23263a]">
          <input
            ref={inputRef}
            type="text"
            className="flex-1 rounded-2xl px-4 py-3 bg-[#23263a] text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none text-lg shadow"
            placeholder="Scrivi una domanda di poker, strategia, logica..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            autoComplete="off"
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
    </div>
  );
} 