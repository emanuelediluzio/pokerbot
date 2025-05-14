'use client';

import React, { useState, useRef, FormEvent, ChangeEvent, useEffect } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  image?: string | null;
  timestamp?: Date;
};

const SYSTEM_PROMPT = "Sei PokerBot, un assistente AI specializzato nell'aiutare gli utenti con domande, strategie e situazioni di poker. Rispondi in modo chiaro, utile e amichevole, anche a domande di logica o curiosità sul gioco.";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Ciao! Sono PokerBot, il tuo assistente AI per il poker. Come posso aiutarti oggi?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Auto scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Funzione per filtrare i tag <think>...</think>
  const stripThinkTags = (text: string) => {
    return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  };

  // Handle Enter key to submit form (Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() || image) {
        handleSend(e as unknown as FormEvent);
      }
    }
  };

  // Handle sending message
  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !image) return;
    
    const timestamp = new Date();
    const userContent = input.trim();
    const userImage = image;
    
    // Aggiorniamo lo stato in modo più sicuro
    setMessages((prevMessages) => [...prevMessages, { 
      role: 'user', 
      content: userContent, 
      image: userImage, 
      timestamp 
    }]);
    
    setLoading(true);
    setInput('');
    setImage(null);
    
    try {
      const res = await fetch('/api/chat-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userContent,
          image: userImage
        }),
        cache: 'no-store'
      });
      
      if (!res.ok) {
        throw new Error(`Errore API: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Aggiorniamo i messaggi dopo aver ricevuto la risposta
      setMessages((prevMessages) => [
        ...prevMessages,
        { 
          role: 'assistant', 
          content: data.text || 'Nessuna risposta generata.', 
          timestamp: new Date() 
        }
      ]);
    } catch (err) {
      console.error('Error:', err);
      setMessages((prevMessages) => [
        ...prevMessages,
        { 
          role: 'assistant', 
          content: 'Errore nella risposta AI. Riprova più tardi.', 
          timestamp: new Date() 
        }
      ]);
    } finally {
      setLoading(false);
      // Focus solo se l'elemento esiste
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Format message timestamp
  const formatTimestamp = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle image upload with resizing
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const img = new window.Image();
      const reader = new FileReader();
      
      reader.onload = (ev) => {
        if (!ev.target?.result) return;
        
        img.onload = () => {
          try {
            // Resize large images
            const maxDim = 800;
            let { width, height } = img;
            
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              // Convert to JPEG at 70% quality
              const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
              setImage(dataUrl);
            }
          } catch (error) {
            console.error('Errore durante il ridimensionamento dell\'immagine:', error);
          }
        };
        
        img.src = ev.target.result as string;
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Errore durante la lettura del file:', error);
    }
  };
  
  // Get the first few messages for sidebar preview
  const getConversationPreview = () => {
    const userMessages = messages.filter(msg => msg.role === 'user');
    if (userMessages.length === 0) return "Nuova conversazione";
    const firstUserMsg = userMessages[0].content.slice(0, 24);
    return firstUserMsg.length > 20 ? `${firstUserMsg}...` : firstUserMsg;
  };

  return (
    <div className="flex h-screen bg-[#0f1117] text-white overflow-hidden">
      {/* Sidebar */}
      <div 
        className={`${isMenuOpen ? 'w-72' : 'w-0'} transition-all duration-300 bg-[#171923] border-r border-[#2d3748] flex flex-col h-screen`}
      >
        {isMenuOpen && (
          <>
            <div className="p-4 border-b border-[#2d3748]">
              <h1 className="text-2xl font-bold text-center flex items-center justify-center">
                <span className="text-blue-500 mr-2">🎲</span> PokerBot AI
              </h1>
            </div>
            
            <div className="p-2">
              <button 
                className="w-full py-3 px-4 rounded-lg border border-[#2d3748] hover:bg-[#2d3748] transition-colors text-left flex items-center mb-4"
                onClick={() => {
                  setMessages([{ 
                    role: 'assistant', 
                    content: 'Ciao! Sono PokerBot, il tuo assistente AI per il poker. Come posso aiutarti oggi?',
                    timestamp: new Date()
                  }]);
                  setInput('');
                  setImage(null);
                }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nuova chat
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              <div className="text-sm text-gray-400 px-3 py-1 mb-2">Conversazioni recenti</div>
              <div className="bg-[#1e2433] hover:bg-[#2d3748] rounded-lg p-3 mb-2 cursor-pointer transition-colors">
                <div className="font-semibold text-sm">{getConversationPreview()}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {formatTimestamp(messages[0].timestamp)}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen relative">
        {/* Header */}
        <div className="h-14 border-b border-[#2d3748] flex items-center px-4">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 mr-2 rounded hover:bg-[#2d3748] transition-colors"
            title="Apri/chiudi menu"
            aria-label="Apri o chiudi menu laterale"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="font-semibold">Chat con PokerBot AI</h2>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-[#0f1117] to-[#151926]">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                ref={el => { messageRefs.current[i] = el; }}
                className={`flex items-start animate-fadeIn ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    🤖
                  </div>
                )}
                <div 
                  className={`group relative flex flex-col max-w-[80%] px-4 py-3 rounded-xl shadow-sm
                    ${msg.role === 'user' 
                      ? 'bg-blue-700 text-white rounded-tr-none' 
                      : 'bg-[#1e2433] text-gray-100 rounded-tl-none'}
                  `}
                >
                  <div className="text-xs text-gray-400 mb-1">
                    {msg.role === 'user' ? 'Tu' : 'PokerBot'} • {formatTimestamp(msg.timestamp)}
                  </div>
                  <div className="text-[15px] leading-relaxed whitespace-pre-line">
                    {msg.role === 'assistant' ? stripThinkTags(msg.content) : msg.content}
                  </div>
                  {msg.image && (
                    <div className="mt-2 overflow-hidden rounded-lg">
                      <img 
                        src={msg.image} 
                        alt="Immagine caricata" 
                        className="max-h-64 object-contain"
                        onClick={() => window.open(msg.image || '', '_blank')}
                      />
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center ml-3 mt-1 flex-shrink-0">
                    👤
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex items-start animate-fadeIn">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                  🤖
                </div>
                <div className="bg-[#1e2433] text-gray-100 px-4 py-4 rounded-xl rounded-tl-none shadow-sm flex items-center space-x-2">
                  <div className="dot-typing"></div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef}></div>
          </div>
        </div>
        
        {/* Input Area */}
        <div className="border-t border-[#2d3748] p-4 bg-[#0c0f16]">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSend} className="flex flex-col relative">
              <div className="relative w-full">
                <textarea
                  ref={inputRef}
                  className="w-full pl-3 pr-16 py-3 bg-[#1e2433] border border-[#2d3748] rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all leading-[1.4]"
                  rows={1}
                  placeholder="Scrivi una domanda sul poker..."
                  value={input}
                  onChange={e => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                  }}
                  onKeyDown={handleKeyDown}
                  style={{minHeight: '44px'}}
                  disabled={loading}
                />
                <div className="absolute right-2 bottom-2 flex space-x-1">
                  <label htmlFor="file-upload" className={`p-2 rounded-md cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#2d3748]'} transition-colors`} title="Carica immagine" aria-label="Carica immagine">
                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </label>
                  <input 
                    type="file" 
                    id="file-upload" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={loading}
                  />
                  
                  <button
                    type="submit"
                    className={`p-2 rounded-md ${input.trim() || image ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600/50 cursor-not-allowed'} transition-colors`}
                    disabled={loading || (!input.trim() && !image)}
                    title="Invia messaggio"
                    aria-label="Invia messaggio"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {image && (
                <div className="mt-2 p-2 bg-[#1e2433] border border-[#2d3748] rounded-lg flex items-center">
                  <img src={image} alt="Preview" className="h-16 rounded" />
                  <button 
                    type="button"
                    className="ml-2 p-1 hover:bg-[#2d3748] rounded-full"
                    onClick={() => setImage(null)}
                    title="Rimuovi immagine"
                    aria-label="Rimuovi immagine"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <span className="ml-2 text-sm text-gray-400">Immagine allegata</span>
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-2 text-center">
                Invia con Invio. Usa Shift+Invio per andare a capo.
              </p>
            </form>
          </div>
        </div>
      </div>
      
      {/* CSS per animazioni e loader */}
      <style jsx global>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .dot-typing {
          position: relative;
          left: -9999px;
          width: 6px;
          height: 6px;
          border-radius: 5px;
          background-color: #6b7280;
          color: #6b7280;
          box-shadow: 9984px 0 0 0 #6b7280, 9999px 0 0 0 #6b7280, 10014px 0 0 0 #6b7280;
          animation: dot-typing 1.5s infinite linear;
        }
        
        @keyframes dot-typing {
          0% { box-shadow: 9984px 0 0 0 #6b7280, 9999px 0 0 0 #6b7280, 10014px 0 0 0 #6b7280; }
          16.667% { box-shadow: 9984px -5px 0 0 #6b7280, 9999px 0 0 0 #6b7280, 10014px 0 0 0 #6b7280; }
          33.333% { box-shadow: 9984px 0 0 0 #6b7280, 9999px 0 0 0 #6b7280, 10014px 0 0 0 #6b7280; }
          50% { box-shadow: 9984px 0 0 0 #6b7280, 9999px -5px 0 0 #6b7280, 10014px 0 0 0 #6b7280; }
          66.667% { box-shadow: 9984px 0 0 0 #6b7280, 9999px 0 0 0 #6b7280, 10014px 0 0 0 #6b7280; }
          83.333% { box-shadow: 9984px 0 0 0 #6b7280, 9999px 0 0 0 #6b7280, 10014px -5px 0 0 #6b7280; }
          100% { box-shadow: 9984px 0 0 0 #6b7280, 9999px 0 0 0 #6b7280, 10014px 0 0 0 #6b7280; }
        }
      `}</style>
    </div>
  );
} 