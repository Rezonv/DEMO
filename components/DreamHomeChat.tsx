
import React, { useRef, useEffect } from 'react';
import { Character, FacilityConfig, DialogueItem } from '../types';

interface Props {
  activeChar: Character | null;
  activeFacility: FacilityConfig | null;
  affection: number;
  history: DialogueItem[];
  customAvatars: { [key: string]: string };
  isGenerating: boolean;
  onInteraction: (type: 'chat' | 'work' | 'diary', text?: string) => void;
}

const DreamHomeChat: React.FC<Props> = ({
  activeChar,
  activeFacility,
  affection,
  history,
  customAvatars,
  isGenerating,
  onInteraction
}) => {
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [userInput, setUserInput] = React.useState("");

  // Scroll to bottom of chat
  useEffect(() => {
    const scrollToBottom = () => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    };
    // Use a small timeout and requestAnimationFrame to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(scrollToBottom);
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [history, activeChar?.id, isGenerating]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userInput.trim() || isGenerating) return;

    // Command Parsing Logic
    if (userInput.startsWith('/')) {
      const [cmd, ...args] = userInput.split(' ');
      const argStr = args.join(' ');

      if (cmd === '/force' || cmd === '/no' || cmd === '/mode') {
        // Pass command as a special interaction type or append to text
        // For simplicity, we'll prepend it to the text and let the backend handle it, 
        // OR we can pass it as a separate argument if we update the interface.
        // Let's update the interface to support an options object.
        // But since onInteraction signature is fixed in Props, we'll encode it in the text 
        // and let App.tsx or geminiService parse it.
        // Actually, let's just send it as is. The user wants to "chat" commands.
        onInteraction('chat', userInput);
        setUserInput("");
        return;
      }
    }

    onInteraction('chat', userInput);
    setUserInput("");
  };

  if (!activeChar || !activeFacility) {
    return (
      <div className="w-full md:w-[450px] bg-gray-900 border-l border-gray-700 flex flex-col shrink-0 overflow-hidden shadow-2xl h-full">
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center bg-gray-900">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <span className="text-4xl opacity-30">💬</span>
          </div>
          <h3 className="text-lg font-bold text-gray-300 mb-2">暫無通訊</h3>
          <p className="text-sm text-gray-500 max-w-xs">請點擊左側設施中的角色頭像，建立通訊連接。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-[450px] bg-gray-900 border-l border-gray-700 flex flex-col shrink-0 overflow-hidden shadow-2xl relative h-full">
      {/* 1. Modern Header */}
      <div className="p-4 bg-gray-800/80 backdrop-blur-md border-b border-gray-700 flex items-center gap-4 shadow-sm z-20">
        <div className="relative">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-pink-500 shadow-lg bg-gray-800">
            <img src={customAvatars[activeChar.id] || activeChar.avatarUrl} className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-lg truncate flex items-center gap-2">
            {activeChar.name}
            <span className="text-[10px] bg-pink-900/50 text-pink-300 px-2 py-0.5 rounded-full border border-pink-500/30">❤ {affection || 0}</span>
          </h3>
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
            工作中: {activeFacility.name}
          </div>
        </div>
      </div>

      {/* 2. Chat Area (Glassmorphism, clean background) */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar relative bg-gray-900"
        ref={chatScrollRef}
        style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #1f2937 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      >
        <div className="text-center py-4">
          <div className="text-xs text-gray-600 bg-gray-800/50 inline-block px-3 py-1 rounded-full">
            今天 {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {history.map((msg, idx) => (
          <div key={idx} className={`flex w-full ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
            {msg.type === 'ai' && (
              <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-600 mr-2 shrink-0 self-end mb-1">
                <img src={customAvatars[activeChar.id] || activeChar.avatarUrl} className="w-full h-full object-cover" />
              </div>
            )}

            <div className={`max-w-[90%] relative group`}>
              <div className={`px-4 py-3 text-sm leading-relaxed shadow-md ${msg.type === 'user'
                ? 'bg-gradient-to-br from-pink-600 to-purple-600 text-white rounded-2xl rounded-br-none'
                : 'bg-gray-800 text-gray-100 border border-gray-700 rounded-2xl rounded-bl-none'
                }`}>
                {msg.imageUrl ? (
                  <div className="flex flex-col gap-1">
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <div
                      className="text-xs text-pink-400 flex items-center gap-1 cursor-pointer hover:underline"
                      onClick={() => window.open(msg.imageUrl, '_blank')}
                    >
                      <span>📸 查看生成的圖片</span>
                    </div>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
              {/* Timestamp outside bubble */}
              <div className={`text-[9px] text-gray-500 mt-1 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex w-full justify-start animate-pulse">
            <div className="w-8 h-8 rounded-full bg-gray-700 mr-2"></div>
            <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none border border-gray-700 flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Input Area (Sticky Bottom) */}
      <div className="p-4 bg-gray-800 border-t border-gray-700 relative z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
        {/* Quick Actions Tags */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 custom-scrollbar-hide">
          <button
            disabled={isGenerating}
            onClick={() => onInteraction('work')}
            className="shrink-0 bg-gray-700 hover:bg-gray-600 text-blue-300 border border-gray-600 px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1"
          >
            📋 詢問工作
          </button>
          <button
            disabled={isGenerating}
            onClick={() => onInteraction('chat')}
            className="shrink-0 bg-gray-700 hover:bg-gray-600 text-pink-300 border border-gray-600 px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1"
          >
            ☕ 閒聊
          </button>
          <button
            disabled={isGenerating}
            onClick={() => onInteraction('diary')}
            className="shrink-0 bg-gray-700 hover:bg-gray-600 text-purple-300 border border-gray-600 px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1"
          >
            📖 寫日記
          </button>
          <div className="relative group/tooltip">
            <button
              disabled={isGenerating}
              onClick={() => onInteraction('chat', '(generate_image)')}
              className="shrink-0 bg-gray-800 text-pink-400 hover:text-pink-300 hover:bg-gray-700 border border-gray-700 px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1"
            >
              🎨 生成插圖
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none">
              消耗積分與能量來生成寫真
            </div>
          </div>
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={`發送訊息給 ${activeChar.name}...`}
              className="w-full bg-gray-900 text-white rounded-xl pl-4 pr-10 py-3 border border-gray-600 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 transition-all text-sm"
              disabled={isGenerating}
            />
          </div>
          <button
            type="submit"
            disabled={!userInput.trim() || isGenerating}
            className="bg-pink-600 hover:bg-pink-500 disabled:bg-gray-700 disabled:text-gray-500 text-white p-3 rounded-xl transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default DreamHomeChat;
