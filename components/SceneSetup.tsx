
import React, { useState, useEffect } from 'react';
import { SceneContext, Character, TextGenerationSettings } from '../types';
import { generateRandomSceneAI } from '../services/geminiService';

interface Props {
  character: Character;
  userRole: string;
  customAvatar?: string;
  onUserRoleChange: (role: string) => void;
  onStart: (scene: SceneContext) => void;
  onBack: () => void;
  currentAffection: number;
  isGeneratingStory?: boolean;
  textSettings?: TextGenerationSettings;
}

// --- Progress Bar Component ---
const ProgressBar: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isActive) {
      setProgress(0);
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev < 30) return prev + 5;
          if (prev < 60) return prev + 2;
          if (prev < 90) return prev + 0.5;
          return prev;
        });
      }, 100);
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

const SceneSetup: React.FC<Props> = ({ character, userRole, customAvatar, onUserRoleChange, onStart, onBack, currentAffection, isGeneratingStory, textSettings }) => {
  const [scene, setScene] = useState<SceneContext>({
    location: '',
    time: '',
    atmosphere: '',
    plotHook: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // --- Static Scene Templates (No AI Required) ---
  const SCENE_TEMPLATES = {
    random: {
      locations: ['午後的咖啡廳', '陽光明媚的公園', '安靜的圖書館', '熙攘的街角', '學校的頂樓', '便利商店', '擁擠的捷運車廂'],
      times: ['放學後', '週末早晨', '平凡的午後', '黃昏時分'],
      atmospheres: ['輕鬆', '悠閒', '熱鬧', '平靜', '有些尷尬', '溫馨']
    },
    date: {
      locations: ['深夜的水族館', '情侶座電影院', '燭光晚餐餐廳', '夜晚的海邊', '遊樂園的摩天輪', '煙火大會', '溫泉旅行'],
      times: ['情人節夜晚', '聖誕夜', '交往紀念日', '星空下'],
      atmospheres: ['浪漫', '甜蜜', '害羞', '心動', '深情', '夢幻']
    },
    sex: {
      locations: ['你的臥室', '上鎖的保健室', '深夜的辦公室', '無人的更衣室', '暴雨夜的旅館', '浴室'],
      times: ['深夜 2 點', '暴雨的夜晚', '無人打擾的午後', '凌晨'],
      atmospheres: ['曖昧', '燥熱', '禁忌', '渴望', '意亂情迷', '危險']
    }
  };

  const handleRandomize = async (type: 'random' | 'date' | 'sex') => {
    if (!textSettings) {
      // Fallback or Alert if settings missing
      console.error("No text settings available for scene generation");
      return;
    }

    setIsGenerating(true);

    try {
      const generatedScene = await generateRandomSceneAI(character, type, textSettings);
      setScene(generatedScene);
    } catch (e) {
      console.error("Scene generation error", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const isReady = scene.location && scene.time && userRole;
  const displayAvatar = customAvatar || character.avatarUrl;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col md:flex-row">

        {/* Left: Character Info Summary */}
        <div className="md:w-1/3 bg-gray-900 p-8 flex flex-col items-center text-center border-r border-gray-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-center bg-cover" style={{ backgroundImage: `url(${displayAvatar})` }}></div>
          <div className="relative z-10">
            <div className="w-32 h-32 rounded-full border-4 border-pink-600 overflow-hidden shadow-lg mb-4 mx-auto bg-gray-800">
              <img src={displayAvatar} alt={character.name} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-bold text-white">{character.name}</h2>
            <p className="text-pink-400 text-sm mt-1">{character.game}</p>

            <div className="mt-4 px-4 py-1 bg-black/40 rounded-full border border-pink-500/30 text-pink-300 font-bold text-sm">
              好感度: {currentAffection}
            </div>

            <div className="mt-6 bg-gray-800/80 p-4 rounded-lg text-sm text-gray-300 text-left w-full">
              <p className="mb-1"><span className="text-pink-500 font-bold">性格：</span>{character.personality.substring(0, 50)}...</p>
              <p><span className="text-pink-500 font-bold">特點：</span>{character.fetishes.slice(0, 3).join(', ')}</p>
            </div>
          </div>
          <button onClick={onBack} disabled={isGeneratingStory} className="mt-auto relative z-10 text-gray-500 hover:text-gray-300 text-sm underline py-4 disabled:opacity-50">
            返回更換角色
          </button>
        </div>

        {/* Right: Scene Configuration */}
        <div className="md:w-2/3 p-8 bg-gray-800 flex flex-col">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">場景與情境設定</h1>
            <p className="text-gray-400 text-xs">選擇一種模式，AI 將為您生成獨特的互動場景。</p>
          </div>

          {/* Scene Type Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              onClick={() => handleRandomize('random')}
              disabled={isGenerating || isGeneratingStory}
              className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-xl flex flex-col items-center gap-1 transition-all border border-gray-600 disabled:opacity-50"
            >
              <span className="text-2xl">🎲</span>
              <span className="text-xs font-bold">隨機日常</span>
            </button>

            <button
              onClick={() => handleRandomize('date')}
              disabled={isGenerating || isGeneratingStory || currentAffection < 200}
              className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all border ${currentAffection >= 200 ? 'bg-pink-900/40 hover:bg-pink-900/60 border-pink-500 text-pink-200' : 'bg-gray-800 border-gray-700 text-gray-600 opacity-50 cursor-not-allowed'} disabled:opacity-50`}
            >
              <span className="text-2xl">{currentAffection >= 200 ? '💕' : '🔒'}</span>
              <span className="text-xs font-bold">甜蜜約會</span>
            </button>

            <button
              onClick={() => handleRandomize('sex')}
              disabled={isGenerating || isGeneratingStory || currentAffection < 400}
              className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all border ${currentAffection >= 400 ? 'bg-red-900/40 hover:bg-red-900/60 border-red-500 text-red-200' : 'bg-gray-800 border-gray-700 text-gray-600 opacity-50 cursor-not-allowed'} disabled:opacity-50`}
            >
              <span className="text-2xl">{currentAffection >= 400 ? '🔞' : '🔒'}</span>
              <span className="text-xs font-bold">深夜激情</span>
            </button>
          </div>

          <div className="space-y-5 flex-1 flex flex-col">
            {/* Loading Bar for Scene Randomization */}
            {isGenerating && (
              <div className="bg-black/30 p-4 rounded-lg border border-pink-500/30 mb-4">
                <div className="text-xs text-pink-400 font-bold mb-2 animate-pulse">AI 正在構建場景 (Generating Scene)...</div>
                <ProgressBar isActive={true} />
              </div>
            )}

            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2">你的身分</label>
              <input
                type="text"
                value={userRole}
                onChange={(e) => onUserRoleChange(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500 disabled:opacity-50"
                placeholder="例如：旅行者、學長、上司..."
                disabled={isGeneratingStory}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">地點</label>
                <input
                  type="text"
                  value={scene.location}
                  onChange={(e) => setScene({ ...scene, location: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500 disabled:opacity-50"
                  placeholder="AI 生成或手動輸入"
                  disabled={isGeneratingStory}
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">時間</label>
                <input
                  type="text"
                  value={scene.time}
                  onChange={(e) => setScene({ ...scene, time: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500 disabled:opacity-50"
                  placeholder="AI 生成或手動輸入"
                  disabled={isGeneratingStory}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2">氣氛</label>
              <input
                type="text"
                value={scene.atmosphere}
                onChange={(e) => setScene({ ...scene, atmosphere: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500 disabled:opacity-50"
                placeholder="例如：曖昧、緊張、危險"
                disabled={isGeneratingStory}
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2">劇情引子 / 補充設定 (選填)</label>
              <textarea
                value={scene.plotHook}
                onChange={(e) => setScene({ ...scene, plotHook: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500 h-24 resize-none disabled:opacity-50"
                placeholder="描述一下故事該如何開始..."
                disabled={isGeneratingStory}
              />
            </div>

            <div className="mt-auto pt-4">
              {isGeneratingStory ? (
                <div className="w-full bg-gray-900/80 p-6 rounded-xl border border-pink-500/50 shadow-[0_0_20px_rgba(236,72,153,0.2)]">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-pink-400 font-bold text-sm tracking-widest animate-pulse">正在生成開場劇情...</span>
                  </div>
                  <ProgressBar isActive={true} />
                </div>
              ) : (
                <button
                  onClick={() => onStart(scene)}
                  disabled={!isReady || isGenerating}
                  className="w-full bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-bold py-4 rounded-xl text-lg shadow-lg transform transition-all active:scale-95"
                >
                  開始互動
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SceneSetup;
