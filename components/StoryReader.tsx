
import React, { useEffect, useRef, useState } from 'react';
import { StorySegment, StoryOption, Character, AppState, InventoryItem } from '../types';
import { generateSpeech } from '../services/geminiService';

interface Props {
  character: Character;
  segments: StorySegment[];
  currentOptions: StoryOption[];
  appState: AppState;
  customAvatar?: string;
  generatingSegmentId?: string | null;
  onOptionSelect: (option: StoryOption, useSearch?: boolean) => void;
  onGenerateImage: (segmentId: string, text: string) => void;
  onEditImage: (segmentId: string, currentImageUrl: string, prompt: string) => void;
  onGenerateVideo: (segmentId: string, imageUrl: string, prompt: string, aspectRatio: '16:9' | '9:16') => void; // Kept in type signature for compatibility but unused
  onToggleFavorite: (segmentId: string) => void;
  onSave: () => void;
  onBack: () => void;
  currentAffection: number;
  inventory: InventoryItem[];
  onOpenShop: () => void;
  onSendGift: (item: InventoryItem) => void;
  onUploadUserImage: (file: File) => void;
  onUpdateAffection?: (newAffection: number) => void; // New Prop
}

// --- Visual Progress Bar Component ---
const ProgressBar: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isActive) {
      setProgress(0);
      // Simulate progress: fast to 30%, slow to 90%, then wait
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev < 30) return prev + 5;
          if (prev < 60) return prev + 2;
          if (prev < 90) return prev + 0.5;
          return prev;
        });
      }, 200);
      return () => clearInterval(timer);
    } else {
      setProgress(100);
    }
  }, [isActive]);

  if (!isActive && progress === 100) return null;

  return (
    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden relative shadow-inner border border-gray-700/50 mt-2">
      <div
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-600 to-purple-500 transition-all duration-300 ease-linear shadow-[0_0_10px_rgba(236,72,153,0.5)]"
        style={{ width: `${progress}%` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
    </div>
  );
};

const StoryReader: React.FC<Props> = ({
  character,
  segments,
  currentOptions,
  appState,
  customAvatar,
  generatingSegmentId,
  onOptionSelect,
  onGenerateImage,
  onEditImage,
  onToggleFavorite,
  onSave,
  onBack,
  currentAffection,
  inventory,
  onOpenShop,
  onSendGift,
  onUploadUserImage,
  onUpdateAffection
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customInput, setCustomInput] = useState("");
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [useSearch, setUseSearch] = useState(false);

  // Image Navigation State
  const imageSegments = segments.filter(s => s.imageUrl);
  const [viewingImageIndex, setViewingImageIndex] = useState(imageSegments.length - 1);

  // Affection Edit State
  const [isEditingAffection, setIsEditingAffection] = useState(false);
  const [tempAffection, setTempAffection] = useState(currentAffection.toString());

  // Update viewing index when new images arrive
  useEffect(() => {
    setViewingImageIndex(imageSegments.length - 1);
  }, [imageSegments.length]);

  // Sync temp affection when prop changes
  useEffect(() => {
    setTempAffection(currentAffection.toString());
  }, [currentAffection]);

  const handleAffectionUpdate = () => {
    const val = parseInt(tempAffection);
    if (!isNaN(val) && onUpdateAffection) {
      onUpdateAffection(val);
      setIsEditingAffection(false);
    }
  };

  // Image Edit Modal State
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState("");

  // Audio State
  const [playingSegmentId, setPlayingSegmentId] = useState<string | null>(null);

  // Filter inventory for gifts only
  const giftInventory = inventory.filter(i => i.type === 'gift');

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [segments, appState]);

  const handleCustomSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!customInput.trim()) return;
    onOptionSelect({ label: customInput, action: "使用者自定義行動" }, useSearch);
    setCustomInput("");
  };

  const handleGiftClick = (item: InventoryItem) => {
    onSendGift(item);
    setIsInventoryOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onUploadUserImage(e.target.files[0]);
    }
  };

  const openEditModal = (id: string, url: string) => {
    setEditingImageId(id);
    setEditingImageUrl(url);
    setEditPrompt("");
  };

  const submitEdit = () => {
    if (editingImageId && editingImageUrl && editPrompt) {
      onEditImage(editingImageId, editingImageUrl, editPrompt);
      // Close modal immediately, progress handled by global state
      setEditingImageId(null);
    }
  };

  const handlePlaySpeech = async (segmentId: string, text: string) => {
    if (playingSegmentId) return;
    setPlayingSegmentId(segmentId);
    try {
      const base64 = await generateSpeech(text);
      if (base64) {
        await playAudio(base64);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPlayingSegmentId(null);
    }
  };

  // 0-500 Affection Logic
  const getAffectionState = (score: number) => {
    let tierName = "";
    let tierColor = "";
    let tierGradient = "";
    let percentage = 0;

    if (score >= 400) {
      tierName = "戀人 (Lover)";
      tierColor = "text-purple-400";
      tierGradient = "from-purple-500 to-fuchsia-500";
      percentage = Math.min(100, score - 400);
    } else if (score >= 300) {
      tierName = "曖昧 (Ambiguous)";
      tierColor = "text-pink-500";
      tierGradient = "from-pink-500 to-rose-500";
      percentage = score - 300;
    } else if (score >= 200) {
      tierName = "好感 (Good Impression)";
      tierColor = "text-red-400";
      tierGradient = "from-red-400 to-pink-400";
      percentage = score - 200;
    } else if (score >= 100) {
      tierName = "朋友 (Friend)";
      tierColor = "text-sky-400";
      tierGradient = "from-sky-400 to-blue-500";
      percentage = score - 100;
    } else {
      tierName = "陌生 (Stranger)";
      tierColor = "text-gray-400";
      tierGradient = "from-gray-600 to-gray-400";
      percentage = score;
    }

    return { tierName, tierColor, tierGradient, percentage };
  };

  const affState = getAffectionState(currentAffection);

  return (
    <div className="h-screen max-w-[95vw] mx-auto bg-gray-900 flex flex-col shadow-2xl overflow-hidden relative">

      {/* Fixed Header / Toolbar (Shrink-0) */}
      <div className="shrink-0 z-30 bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between shadow-lg">

        <div className="flex items-center gap-4 flex-1">
          <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full overflow-hidden border-2 border-gray-700 bg-gray-800 shadow-lg`}>
              <img src={customAvatar || character.avatarUrl} alt={character.name} className="w-full h-full object-cover" />
            </div>

            <div className="flex flex-col">
              <h1 className="text-base font-bold text-white leading-none mb-1.5">{character.name}</h1>

              {/* 5-Tier Affection Bar */}
              <div className="flex flex-col gap-0.5 relative group/edit">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide">
                  <span className={`${affState.tierColor}`}>{affState.tierName}</span>
                  <span className="text-gray-500">{Math.round(affState.percentage)}%</span>
                </div>
                <div className="relative w-32 sm:w-48 h-1.5 bg-gray-800 rounded-full overflow-hidden group">
                  <div
                    className={`h-full transition-all duration-700 ease-out rounded-full bg-gradient-to-r ${affState.tierGradient}`}
                    style={{ width: `${affState.percentage}%` }}
                  ></div>
                </div>

                {/* Affection Edit Control */}
                {isEditingAffection ? (
                  <div className="absolute top-8 left-0 bg-gray-800 p-2 rounded border border-gray-600 flex gap-1 z-50 shadow-xl min-w-[150px]">
                    <input
                      type="number"
                      value={tempAffection}
                      onChange={(e) => setTempAffection(e.target.value)}
                      className="flex-1 bg-gray-900 text-white text-xs p-1 rounded border border-gray-700"
                      autoFocus
                    />
                    <button onClick={handleAffectionUpdate} className="bg-green-600 hover:bg-green-500 text-white px-2 rounded text-xs">OK</button>
                    <button onClick={() => setIsEditingAffection(false)} className="bg-red-600 hover:bg-red-500 text-white px-2 rounded text-xs">X</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingAffection(true)}
                    className="absolute -right-10 -top-2 px-2 py-1 bg-pink-600 hover:bg-pink-500 text-white rounded-full border border-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.5)] z-50 flex items-center gap-1 animate-pulse"
                    title="修改好感度"
                  >
                    <span className="text-[10px] font-bold">修改</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsInventoryOpen(true)}
            className="p-2 text-yellow-400 hover:bg-gray-800 rounded-full relative"
            title="背包/送禮"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            {giftInventory.length > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                {giftInventory.length}
              </span>
            )}
          </button>

          <button
            onClick={onSave}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-700"
          >
            <span>💾</span>
            <span className="hidden sm:inline">保存</span>
          </button>
        </div>
      </div>

      {/* Main Content Area (Flex Row) */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Panel Container (Flex Col) */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-gray-800">
          {/* Chat History (Flex-1) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 pb-8 bg-gradient-to-b from-gray-900 to-gray-900 custom-scrollbar relative">
            {segments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500 animate-pulse space-y-4">
                <div className="w-16 h-16 rounded-full bg-gray-800 animate-bounce flex items-center justify-center text-3xl">
                  💬
                </div>
                <p className="text-lg font-light">故事即將開始...</p>
              </div>
            )}

            {segments.map((segment) => (
              <div key={segment.id} className={`flex flex-col gap-2 animate-fade-in ${segment.isUserChoice ? 'items-end' : 'items-start'}`}>

                {segment.isUserChoice ? (
                  <div className="flex flex-col gap-2 items-end max-w-[85%]">
                    <div className="bg-gradient-to-br from-pink-900/40 to-purple-900/40 border border-pink-500/20 rounded-2xl rounded-tr-none px-6 py-4 backdrop-blur-sm shadow-sm">
                      <p className="text-pink-100 font-medium text-base">{segment.text}</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full group relative pl-4 sm:pl-0">
                    {segment.affectionChange !== undefined && segment.affectionChange !== 0 && (
                      <div className={`absolute -top-6 left-0 sm:-left-4 animate-bounce z-20`}>
                        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full shadow-xl border backdrop-blur-md text-xs font-bold transform transition-transform
                            ${segment.affectionChange > 0
                            ? 'bg-pink-600/90 border-pink-400 text-white'
                            : 'bg-slate-700/90 border-slate-500 text-slate-200'}`}
                        >
                          <span>{segment.affectionChange > 0 ? '❤️ +' : '💔 '}{segment.affectionChange}</span>
                          {segment.affectionSource && <span className="font-normal opacity-90 border-l border-white/20 pl-1 ml-1 truncate max-w-[150px]">{segment.affectionSource}</span>}
                        </div>
                      </div>
                    )}

                    <div className="relative bg-gray-800/40 hover:bg-gray-800/60 transition-colors rounded-xl p-4 sm:p-6 border border-transparent hover:border-gray-700/50">
                      <button
                        onClick={() => onToggleFavorite(segment.id)}
                        className={`absolute top-2 right-2 p-2 transition-all z-10 rounded-full hover:bg-gray-700/50 ${segment.isFavorited
                          ? 'text-pink-500 opacity-100 scale-110'
                          : 'text-gray-500 opacity-0 group-hover:opacity-100 hover:text-pink-400'
                          }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${segment.isFavorited ? 'fill-current' : 'fill-none stroke-current'}`} viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>

                      {/* TTS Play Button */}
                      <button
                        onClick={() => handlePlaySpeech(segment.id, segment.text)}
                        disabled={!!playingSegmentId}
                        className={`absolute top-2 right-10 p-2 transition-all z-10 rounded-full hover:bg-gray-700/50 ${playingSegmentId === segment.id
                          ? 'text-pink-400 animate-pulse'
                          : 'text-gray-500 opacity-0 group-hover:opacity-100 hover:text-pink-400'
                          }`}
                        title="播放語音 (TTS)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                      </button>

                      <div className="text-gray-200 leading-relaxed text-lg whitespace-pre-wrap font-light tracking-wide mb-4">
                        {segment.text}
                      </div>

                      {/* Image Link Button (Small) */}
                      {segment.imageUrl && (
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => openEditModal(segment.id, segment.imageUrl!)}
                            className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1 hover:underline"
                          >
                            <span>📸 查看/編輯圖片</span>
                          </button>
                        </div>
                      )}

                      {!segment.imageUrl && !segment.videoUrl && (
                        <div className="flex flex-col w-full max-w-md mx-auto mt-2">
                          {generatingSegmentId === segment.id ? (
                            <div className="bg-gray-800/50 rounded-xl p-4 border border-pink-500/30">
                              <div className="flex items-center gap-2 mb-2 text-pink-400 text-xs font-bold uppercase tracking-widest">
                                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
                                Generating Image...
                              </div>
                              <ProgressBar isActive={true} />
                            </div>
                          ) : (
                            <div className="flex justify-end">
                              <button
                                onClick={() => onGenerateImage(segment.id, segment.text)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all bg-transparent border-pink-500/30 text-pink-400 hover:bg-pink-600 hover:text-white hover:border-pink-500"
                              >
                                <span>🎨 生成此場景插圖</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {appState === AppState.GENERATING_TEXT && (
              <div className="flex items-center gap-4 text-gray-400 p-4 bg-gray-800/20 rounded-xl border border-gray-800 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                  <img src={customAvatar || character.avatarUrl} className="w-full h-full object-cover opacity-50" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-pink-500">{character.name} 正在思考...</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Footer Input (Moved Inside Left Column) */}
          {(appState === AppState.WAITING_FOR_INPUT || currentOptions.length > 0) && (
            <div className="shrink-0 p-4 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800/50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-40">
              <div className="w-full flex flex-col gap-4">

                {/* Search Toggle */}
                <div className="flex justify-end">
                  <label className={`flex items-center gap-2 text-xs font-bold cursor-pointer select-none transition-colors px-3 py-1 rounded-full border ${useSearch ? 'bg-blue-900/30 border-blue-500 text-blue-400' : 'bg-gray-800 border-gray-700 text-gray-500'}`}>
                    <input type="checkbox" checked={useSearch} onChange={e => setUseSearch(e.target.checked)} className="hidden" />
                    <div className={`w-3 h-3 rounded-full ${useSearch ? 'bg-blue-400' : 'bg-gray-600'}`}></div>
                    Google Search
                  </label>
                </div>

                <form onSubmit={handleCustomSubmit} className="flex gap-2 relative items-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white p-3 rounded-xl border border-gray-700 transition-colors"
                    title="上傳圖片"
                  >
                    🖼️
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder={useSearch ? "輸入問題來搜尋最新資訊..." : "輸入行動或對話..."}
                    className="flex-1 bg-gray-800 text-white rounded-xl pl-4 pr-12 py-3.5 border border-gray-700 focus:border-pink-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!customInput.trim()}
                    className="absolute right-2 top-2 bottom-2 bg-pink-600 hover:bg-pink-500 disabled:opacity-0 text-white aspect-square rounded-lg flex items-center justify-center"
                  >
                    ➤
                  </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[30vh] overflow-y-auto pr-1 custom-scrollbar">
                  {currentOptions.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => onOptionSelect(option, useSearch)}
                      className="px-5 py-4 rounded-xl bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-pink-500 text-left transition-all"
                    >
                      <span className="block font-bold text-gray-200 text-sm mb-1">{option.label}</span>
                      <span className="text-xs text-gray-500 block truncate">{option.action}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Dedicated Image Display (50% Width) */}
        <div className="w-1/2 bg-gray-900 border-l border-gray-800 flex flex-col shrink-0 p-4 shadow-2xl z-20 hidden md:flex">
          <h3 className="text-lg font-bold text-pink-400 mb-4 flex items-center gap-2">
            <span className="text-2xl">📸</span>
            劇情寫真
          </h3>

          <div className="flex-1 bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden relative flex items-center justify-center group">
            {imageSegments.length > 0 && imageSegments[viewingImageIndex] ? (
              <>
                <img
                  src={imageSegments[viewingImageIndex].imageUrl}
                  className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                />

                {/* Navigation Buttons */}
                {viewingImageIndex > 0 && (
                  <button
                    onClick={() => setViewingImageIndex(prev => Math.max(0, prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-sm transition-all z-20 opacity-0 group-hover:opacity-100"
                  >
                    ◀
                  </button>
                )}
                {viewingImageIndex < imageSegments.length - 1 && (
                  <button
                    onClick={() => setViewingImageIndex(prev => Math.min(imageSegments.length - 1, prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-sm transition-all z-20 opacity-0 group-hover:opacity-100"
                  >
                    ▶
                  </button>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-6 gap-2 pointer-events-none">
                  <div className="pointer-events-auto flex gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all">
                    <button
                      onClick={() => window.open(imageSegments[viewingImageIndex].imageUrl, '_blank')}
                      className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-full font-bold shadow-lg text-sm"
                    >
                      查看原圖
                    </button>
                    <button
                      onClick={() => openEditModal(imageSegments[viewingImageIndex].id, imageSegments[viewingImageIndex].imageUrl!)}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full font-bold shadow-lg text-sm border border-gray-600"
                    >
                      編輯
                    </button>
                  </div>
                </div>

                {/* Image Counter Badge */}
                <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-md">
                  {viewingImageIndex + 1} / {imageSegments.length}
                </div>

                {/* Progress Overlay for Dedicated Panel */}
                {appState === AppState.GENERATING_IMAGE && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-8 backdrop-blur-sm z-20">
                    <div className="text-pink-400 font-bold animate-pulse mb-4 text-lg">
                      {generatingSegmentId === imageSegments[viewingImageIndex].id ? 'AI 修圖中...' : 'AI 繪圖中...'}
                    </div>
                    <ProgressBar isActive={true} />
                  </div>
                )}
              </>
            ) : (
              <div className="text-gray-500 flex flex-col items-center gap-2">
                <span className="text-4xl opacity-30">🖼️</span>
                <p className="text-sm">尚未生成圖片</p>
              </div>
            )}
          </div>

          <div className="mt-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
            <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Scene Info</h4>
            <p className="text-xs text-gray-500 font-mono break-all line-clamp-3">
              {imageSegments[viewingImageIndex]?.text || 'Waiting for generation...'}
            </p>
          </div>
        </div>

      </div>

      {/* Image Edit Modal */}
      {editingImageId && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gray-800 p-6 rounded-xl w-full max-w-lg border border-gray-600 shadow-2xl relative overflow-hidden">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span>🪄</span> 編輯圖片 (Nano Banana)
            </h3>

            {/* Preview Area */}
            <div className="mb-4 rounded-lg overflow-hidden max-h-64 border border-gray-700 flex justify-center bg-black relative">
              <img src={editingImageUrl!} className="h-full object-contain" />
              {/* Progress Overlay inside Modal */}
              {appState === AppState.GENERATING_IMAGE && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-8 backdrop-blur-sm">
                  <div className="text-pink-400 font-bold animate-pulse mb-4">AI 修圖中...</div>
                  <ProgressBar isActive={true} />
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-400 block mb-1">修改指令</label>
              <input
                type="text"
                value={editPrompt}
                onChange={e => setEditPrompt(e.target.value)}
                placeholder="例如：加上眼鏡、換成晚上的背景..."
                disabled={appState === AppState.GENERATING_IMAGE}
                className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-pink-500 outline-none disabled:opacity-50"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditingImageId(null)} disabled={appState === AppState.GENERATING_IMAGE} className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50">取消</button>
              <button onClick={submitEdit} disabled={appState === AppState.GENERATING_IMAGE} className="px-6 py-2 bg-pink-600 hover:bg-pink-500 disabled:bg-gray-700 text-white rounded-lg font-bold">生成修改</button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {isInventoryOpen && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-800 w-full max-w-md rounded-xl shadow-2xl border border-gray-700 flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900 rounded-t-xl">
              <h3 className="text-xl font-bold text-white">選擇禮物</h3>
              <button onClick={() => setIsInventoryOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {giftInventory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  背包中沒有可贈送的禮物 (裝備無法贈送)
                  <div className="mt-2"><button onClick={() => { setIsInventoryOpen(false); onOpenShop(); }} className="text-pink-400 underline">前往商城</button></div>
                </div>
              ) : giftInventory.map(item => (
                <div key={item.id} className="bg-gray-700/50 p-3 rounded-lg flex items-center gap-3 border border-transparent hover:border-pink-500/50 transition-colors">
                  <div className="text-2xl">{item.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-100">{item.name}</h4>
                    <p className="text-xs text-gray-400">x{item.count}</p>
                  </div>
                  <button onClick={() => handleGiftClick(item)} className="bg-pink-600 hover:bg-pink-500 text-white text-xs px-3 py-1 rounded font-bold">送禮</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// --- Audio Helpers ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

async function playAudio(base64String: string) {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioContextClass({ sampleRate: 24000 });

  try {
    const bytes = decode(base64String);
    const audioBuffer = await decodeAudioData(bytes, audioContext, 24000, 1);

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  } catch (e) {
    console.error("Audio Playback Error:", e);
  }
}

export default StoryReader;
