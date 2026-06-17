import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Send } from 'lucide-react';
import type { NPCData } from './TownCanvas';

interface ChatModalProps {
  npc: NPCData;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatModal = ({ npc, onClose }: ChatModalProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character_id: npc.id,
          message: userMessage,
          location: "Town Square"
        })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Something went wrong in the silence..." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div>
            <h3 className="text-town-warm font-light tracking-widest uppercase text-sm">{npc.name}</h3>
            <p className="text-[10px] text-slate-500 uppercase">Conversation</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {messages.length === 0 && (
            <p className="text-center text-slate-600 text-xs italic mt-10">
              The air is heavy. What do you wish to say?
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                m.role === 'user' 
                  ? 'bg-town-warm/10 border border-town-warm/20 text-town-warm/90' 
                  : 'bg-white/5 border border-white/10 text-slate-300'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/5 flex gap-2">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Whisper into the void..."
            className="flex-1 bg-black/40 border border-white/10 rounded-full px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-town-warm/50 transition-colors"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 bg-town-warm text-black rounded-full hover:bg-town-warm/80 disabled:opacity-50 disabled:hover:bg-town-warm transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ChatModal;
