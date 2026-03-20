"use client";

import { useState, useRef, useEffect } from 'react';

interface AIHistoryGeneratorProps {
  onResult?: (essay: string, mapData: null) => void;
  currentYear?: number;
}

export default function AIHistoryGenerator({ onResult }: AIHistoryGeneratorProps) {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Автопрокрутка чата вниз
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleGenerate = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/generate-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }), // Отправляем всю историю
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const aiMessage = { role: 'assistant', content: data.text };
      setMessages(prev => [...prev, aiMessage]);

      // Отправляем последний ответ в основное окно (если нужно для карты или эссе)
      if (onResult) {
        onResult(data.text, null);
      }
    } catch (err) {
      console.error("AI Chat Error:", err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "❌ Произошла ошибка при связи с ИИ-историком. Проверьте подключение или попробуйте позже."
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg border border-blue-400/30"
      >
        {isOpen ? "Закрыть чат с ИИ" : "✨ Альтернативная история"}
      </button>

      {isOpen && (
        <div className="bg-gray-900/95 backdrop-blur-xl p-0 rounded-xl border border-blue-500/30 mt-2 w-80 shadow-2xl flex flex-col overflow-hidden h-[450px]">
          {/* Заголовок чата */}
          <div className="bg-blue-600/20 p-3 border-b border-blue-500/20 flex justify-between items-center">
            <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider">Чат с ИИ-историком</h4>
            <button
              onClick={() => setMessages([])}
              className="text-[10px] text-gray-500 hover:text-white transition-colors"
              title="Очистить чат"
            >
              Очистить
            </button>
          </div>

          {/* Область сообщений */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
            {messages.length === 0 && (
              <div className="text-center mt-10">
                <p className="text-gray-400 text-xs px-4">
                  Задайте любой вопрос об альтернативной истории. Я не привязан к году на карте.
                </p>
                <div className="mt-4 flex flex-col gap-2 px-6">
                  <button
                    onClick={() => setInput("Что если Наполеон победил?")}
                    className="text-[10px] bg-gray-800 text-gray-400 p-2 rounded hover:bg-gray-700 text-left"
                  >
                    &quot;Что если Наполеон победил?&quot;
                  </button>
                  <button
                    onClick={() => setInput("Что если СССР не распался?")}
                    className="text-[10px] bg-gray-800 text-gray-400 p-2 rounded hover:bg-gray-700 text-left"
                  >
                    &quot;Что если СССР не распался?&quot;
                  </button>
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-2 rounded-lg text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 p-2 rounded-lg animate-pulse text-blue-400 text-[10px] font-bold">
                  Анализирую линии времени...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Ввод сообщения */}
          <div className="p-3 border-t border-gray-800 bg-black/40">
            <div className="flex gap-2">
              <input
                className="flex-1 bg-gray-900 text-white text-xs p-2 rounded border border-gray-700 focus:border-blue-500 outline-none transition-colors"
                placeholder="Ваш вопрос..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleGenerate();
                  }
                }}
              />
              <button
                disabled={loading}
                onClick={handleGenerate}
                className="bg-blue-600 p-2 rounded hover:bg-blue-500 disabled:bg-gray-800 transition-colors shrink-0"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
