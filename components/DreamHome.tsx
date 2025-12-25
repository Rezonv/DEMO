import React, { useState, useEffect } from 'react';
import { Character, HomeState, FacilityState, AffectionMap, RandomEvent, InventoryItem, ShowcaseSlot, DialogueItem, ImageGenerationSettings, TextGenerationSettings, DiaryMap, DiaryEntry } from '../types';
import { FACILITIES } from '../data/facilities';
import { SHOP_ITEMS } from '../data/items';
import { generateHomeInteraction, generateCharacterImage, generateDiaryEntry } from '../services/geminiService';
import DreamHomeFacilities from './DreamHomeFacilities';
import DreamHomeShowcase from './DreamHomeShowcase';
import DreamHomeChat from './DreamHomeChat';

interface Props {
  homeState: HomeState;
  characters: Character[];
  affectionMap: AffectionMap;
  credits: number;
  inventory?: InventoryItem[];
  customAvatars: { [key: string]: string };
  activeEvents: RandomEvent[];
  focusedEventId?: string | null;
  onClearFocusedEvent?: () => void;
  onUpdateHomeState: (newState: HomeState) => void;
  onUpdateCredits: (newCredits: number) => void;
  onUpdateAffection: (charId: string, newScore: number) => void;
  onUpdateInventory?: (newInventory: InventoryItem[]) => void;
  onResolveEvent: (eventId: string) => void;
  onBack: () => void;
  imageSettings?: ImageGenerationSettings;
  textSettings?: TextGenerationSettings;
  customLoras?: { [key: string]: string };
  customLoraTriggers?: { [key: string]: string };
  diariesMap?: DiaryMap;
  addDiaryEntry?: (charId: string, entry: DiaryEntry) => void;
  addMemory?: (charId: string, text: string, type: 'fact' | 'event' | 'preference', importance?: number) => void;
}

const DreamHome: React.FC<Props> = ({
  homeState,
  characters,
  affectionMap,
  credits,
  inventory = [],
  customAvatars,
  activeEvents,
  focusedEventId,
  onClearFocusedEvent,
  onUpdateHomeState,
  onUpdateCredits,
  onUpdateAffection,
  onUpdateInventory,
  onResolveEvent,
  onBack,
  imageSettings,
  textSettings,
  customLoras = {},
  customLoraTriggers = {},
  diariesMap,
  addDiaryEntry,
  addMemory
}) => {
  // View Mode
  const [viewMode, setViewMode] = useState<'facilities' | 'showcase' | 'diary'>('facilities');

  // UI State
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [activeCharId, setActiveCharId] = useState<string | null>(null);
  const [activeFacilityId, setActiveFacilityId] = useState<string | null>(null);
  const [selectedShowcaseSlotId, setSelectedShowcaseSlotId] = useState<string | null>(null);

  // Interaction State
  const [interactionHistory, setInteractionHistory] = useState<{ [charId: string]: DialogueItem[] }>({});
  const [isGenerating, setIsGenerating] = useState(false);

  // Handle Deep Linking
  useEffect(() => {
    if (focusedEventId) {
      const evt = activeEvents.find(e => e.id === focusedEventId);
      if (evt) {
        setActiveCharId(evt.characterId);
        setActiveFacilityId(evt.facilityId);
        setViewMode('facilities');
      }
      if (onClearFocusedEvent) onClearFocusedEvent();
    }
  }, [focusedEventId, activeEvents, onClearFocusedEvent]);

  // Initial Greeting Logic when selecting a char
  useEffect(() => {
    if (activeCharId && activeFacilityId) {
      const history = interactionHistory[activeCharId] || [];
      if (history.length === 0 && !isGenerating) {
        handleInteraction('greeting');
      }
    }
  }, [activeCharId, activeFacilityId]);

  // Calculate pending rewards loop
  const calculatePending = () => {
    const now = new Date();
    const last = new Date(homeState.lastCollected);
    const diffMinutes = (now.getTime() - last.getTime()) / (1000 * 60);

    let pendingCredits = 0;
    const pendingAffection: { [charId: string]: number } = {};

    homeState.facilities.forEach(facState => {
      if (facState.assignedCharId) {
        const config = FACILITIES.find(f => f.id === facState.id);
        if (config) {
          const creditProd = config.baseCreditRate * facState.level * diffMinutes;
          const affProd = config.baseAffectionRate * facState.level * diffMinutes;
          pendingCredits += creditProd;
          if (!pendingAffection[facState.assignedCharId]) pendingAffection[facState.assignedCharId] = 0;
          pendingAffection[facState.assignedCharId] += affProd;
        }
      }
    });

    return { pendingCredits: Math.floor(pendingCredits), pendingAffection };
  };

  const [pending, setPending] = useState(calculatePending());

  useEffect(() => {
    const interval = setInterval(() => setPending(calculatePending()), 1000);
    return () => clearInterval(interval);
  }, [homeState]);

  // Handlers
  const handleCollect = () => {
    const { pendingCredits, pendingAffection } = pending;
    if (pendingCredits <= 0 && Object.keys(pendingAffection).length === 0) return;

    onUpdateCredits(credits + pendingCredits);
    Object.entries(pendingAffection).forEach(([charId, amount]) => {
      const current = affectionMap[charId] || 0;
      onUpdateAffection(charId, Math.min(500, current + Math.floor(amount as number)));
    });

    onUpdateHomeState({
      ...homeState,
      lastCollected: new Date().toISOString()
    });

    alert(`領取成功！\n獲得 ${pendingCredits} 積分\n角色好感度已提升`);
  };

  const handleUpgrade = (facId: string) => {
    const fac = homeState.facilities.find(f => f.id === facId);
    const config = FACILITIES.find(f => f.id === facId);
    if (!fac || !config) return;

    const cost = Math.floor(config.baseCost * Math.pow(config.costMultiplier, fac.level));

    let hasAllMaterials = true;
    const missingMats: string[] = [];

    const requirements = config.upgradeRequirements || [];
    if (requirements.length === 0 && config.upgradeMaterialId && config.baseMaterialCost) {
      requirements.push({ itemId: config.upgradeMaterialId, baseAmount: config.baseMaterialCost });
    }

    requirements.forEach(req => {
      const reqAmount = Math.floor(req.baseAmount * Math.pow(1.3, fac.level - 1));
      const ownedItem = inventory.find(i => i.id === req.itemId);
      if (!ownedItem || ownedItem.count < reqAmount) {
        hasAllMaterials = false;
        const itemInfo = SHOP_ITEMS.find(i => i.id === req.itemId);
        missingMats.push(`${itemInfo?.name || req.itemId} (缺 ${reqAmount - (ownedItem?.count || 0)} 個)`);
      }
    });

    if (credits < cost) return alert("積分不足！");
    if (!hasAllMaterials) return alert(`升級素材不足！\n${missingMats.join('\n')}\n請前往「討伐行動」對應區域獲取。`);

    onUpdateCredits(credits - cost);

    if (onUpdateInventory) {
      let newInv = [...inventory];
      requirements.forEach(req => {
        const reqAmount = Math.floor(req.baseAmount * Math.pow(1.3, fac.level - 1));
        newInv = newInv.map(i => {
          if (i.id === req.itemId) return { ...i, count: i.count - reqAmount };
          return i;
        });
      });
      newInv = newInv.filter(i => i.count > 0);
      onUpdateInventory(newInv);
    }

    const newFacilities = homeState.facilities.map(f => f.id === facId ? { ...f, level: f.level + 1 } : f);
    onUpdateHomeState({ ...homeState, facilities: newFacilities });
  };

  const handleUnlock = (configId: string) => {
    const config = FACILITIES.find(f => f.id === configId);
    if (!config || credits < config.unlockPrice) return alert("積分不足！");
    onUpdateCredits(credits - config.unlockPrice);
    const newFac: FacilityState = { id: configId, level: 1, assignedCharId: null };
    onUpdateHomeState({ ...homeState, facilities: [...homeState.facilities, newFac] });
  };

  const handleAssign = (facId: string, charId: string) => {
    const existing = homeState.facilities.find(f => f.assignedCharId === charId);
    let newFacilities = [...homeState.facilities];
    if (existing) newFacilities = newFacilities.map(f => f.id === existing.id ? { ...f, assignedCharId: null } : f);
    newFacilities = newFacilities.map(f => f.id === facId ? { ...f, assignedCharId: charId } : f);
    onUpdateHomeState({ ...homeState, facilities: newFacilities });
    setSelectedFacilityId(null);
    setActiveCharId(charId);
    setActiveFacilityId(facId);
  };

  const handleSetShowcaseItem = (item: InventoryItem) => {
    if (!selectedShowcaseSlotId) return;
    const isAlreadyDisplayed = homeState.showcase.some(s => s.itemId === item.id);
    if (isAlreadyDisplayed) return alert("此物品已在展示中");

    const newShowcase = homeState.showcase.map(slot =>
      slot.id === selectedShowcaseSlotId ? { ...slot, itemId: item.id } : slot
    );
    onUpdateHomeState({ ...homeState, showcase: newShowcase });
    setSelectedShowcaseSlotId(null);
  };

  const handleRemoveShowcaseItem = (slotId: string) => {
    const newShowcase = homeState.showcase.map(slot =>
      slot.id === slotId ? { ...slot, itemId: undefined } : slot
    );
    onUpdateHomeState({ ...homeState, showcase: newShowcase });
  };

  const activeBuffs = homeState.showcase.reduce((acc, slot) => {
    if (slot.itemId) {
      const item = SHOP_ITEMS.find(i => i.id === slot.itemId);
      if (item?.showcaseBuff) {
        const type = item.showcaseBuff.type;
        acc[type] = (acc[type] || 0) + item.showcaseBuff.value;
      }
    }
    return acc;
  }, {} as Record<string, number>);

  // Chat Interaction
  const addDialogue = (charId: string, item: DialogueItem) => {
    setInteractionHistory(prev => ({ ...prev, [charId]: [...(prev[charId] || []), item] }));
  };

  const handleInteraction = async (type: 'chat' | 'work' | 'greeting' | 'diary', customText?: string) => {
    if (!activeCharId || !activeFacilityId) return;
    const char = characters.find(c => c.id === activeCharId);
    const config = FACILITIES.find(f => f.id === activeFacilityId);
    if (!char || !config) return;

    setIsGenerating(true);

    // Handle Memory Addition
    if (customText?.startsWith('/remember ')) {
      const memoryText = customText.replace('/remember ', '');
      if (addMemory) {
        addMemory(char.id, memoryText, 'event', 3);
        addDialogue(char.id, { type: 'ai', text: `(已記住：${memoryText})`, timestamp: Date.now(), category: 'chat' });
      }
      setIsGenerating(false);
      return;
    }

    // Handle Diary Generation
    if (type === 'diary') {
      if (!addDiaryEntry) { setIsGenerating(false); return; }
      addDialogue(char.id, { type: 'user', text: "今天過得怎麼樣？寫篇日記吧。", timestamp: Date.now(), category: 'chat' });
      try {
        const history = (interactionHistory[char.id] || []).map(i => `${i.type === 'user' ? 'User' : char.name}: ${i.text}`);
        const entry = await generateDiaryEntry(char, history, affectionMap[char.id] || 50, textSettings);
        addDiaryEntry(char.id, entry);
        addDialogue(char.id, { type: 'ai', text: `(羞澀地寫下了日記...)\n\n「${entry.title}」\n${entry.summary}`, timestamp: Date.now(), category: 'chat' });
      } catch (e) {
        addDialogue(char.id, { type: 'ai', text: "唔... 今天沒什麼心情寫日記呢...", timestamp: Date.now(), category: 'chat' });
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // Handle Image Generation
    if (customText === '(generate_image)') {
      addDialogue(char.id, { type: 'user', text: "能讓我看看妳現在的樣子嗎？", timestamp: Date.now(), category: 'chat' });
      try {
        const prompt = `Selfie in ${config.name}, ${char.description.slice(0, 50)}`;
        const loraTag = customLoras[char.id];
        const loraTrigger = customLoraTriggers[char.id];
        const img = await generateCharacterImage(char, prompt, undefined, imageSettings, loraTag, loraTrigger, affectionMap[char.id] || 50);
        if (img) {
          addDialogue(char.id, { type: 'ai', text: "喜歡嗎？", imageUrl: img, timestamp: Date.now(), category: 'chat' });
        } else {
          addDialogue(char.id, { type: 'ai', text: "抱歉... 相機好像壞了...", timestamp: Date.now(), category: 'chat' });
        }
      } catch (e) {
        addDialogue(char.id, { type: 'ai', text: "拍攝失敗了...", timestamp: Date.now(), category: 'chat' });
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    if (type !== 'greeting') {
      const userMsgText = customText || (type === 'work' ? '工作狀況如何？' : '陪我聊聊吧。');
      addDialogue(char.id, { type: 'user', text: userMsgText, timestamp: Date.now(), category: type === 'work' ? 'work' : 'chat' });
    }

    const history = (interactionHistory[char.id] || []).map(i => `${i.type === 'user' ? 'User' : char.name}: ${i.text}`);

    try {
      const text = await generateHomeInteraction(char, config.name, affectionMap[char.id] || 50, type, history, customText, textSettings);
      addDialogue(char.id, { type: 'ai', text, timestamp: Date.now(), category: type === 'work' ? 'work' : 'chat' });
    } finally {
      setIsGenerating(false);
    }
  };

  const activeChar = activeCharId ? characters.find(c => c.id === activeCharId) || null : null;
  const activeFacility = activeFacilityId ? FACILITIES.find(f => f.id === activeFacilityId) || null : null;
  const showcaseItems = inventory.filter(i => i.showcaseBuff);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 border border-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 tracking-tighter">
            幻夢家園
          </h1>

          {/* View Switcher */}
          <div className="bg-gray-800 rounded-lg p-1 flex gap-1">
            <button onClick={() => setViewMode('facilities')} className={`px-4 py-1 rounded text-sm font-bold ${viewMode === 'facilities' ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white'}`}>設施</button>
            <button onClick={() => setViewMode('showcase')} className={`px-4 py-1 rounded text-sm font-bold ${viewMode === 'showcase' ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white'}`}>收藏</button>
            <button onClick={() => setViewMode('diary')} className={`px-4 py-1 rounded text-sm font-bold ${viewMode === 'diary' ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white'}`}>日記</button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-gray-800 px-3 py-1.5 rounded-lg border border-yellow-500/30 text-yellow-400 font-mono font-bold">
            🪙 {credits}
          </div>
          <button
            onClick={handleCollect}
            disabled={pending.pendingCredits <= 0}
            className={`px-4 py-1.5 rounded-lg font-bold shadow-lg text-sm transition-all ${pending.pendingCredits > 0
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 text-white animate-pulse'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
          >
            領取 (+{pending.pendingCredits})
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">

        {/* LEFT CONTENT */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {viewMode === 'facilities' && (
            <DreamHomeFacilities
              facilitiesState={homeState.facilities}
              characters={characters}
              inventory={inventory}
              credits={credits}
              customAvatars={customAvatars}
              activeCharId={activeCharId}
              onUnlock={handleUnlock}
              onUpgrade={handleUpgrade}
              onSelectFacility={setSelectedFacilityId}
              onSelectCharForChat={(facId, charId) => { setActiveCharId(charId); setActiveFacilityId(facId); }}
            />
          )}

          {viewMode === 'showcase' && (
            <DreamHomeShowcase
              showcaseSlots={homeState.showcase}
              activeBuffs={activeBuffs}
              onSlotClick={(slotId, itemId) => { if (itemId) handleRemoveShowcaseItem(slotId); else setSelectedShowcaseSlotId(slotId); }}
            />
          )}

          {viewMode === 'diary' && (
            <div className="p-4 space-y-4">
              <h2 className="text-xl font-bold mb-4">私密日記</h2>
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {characters.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setActiveCharId(c.id)}
                    className={`shrink-0 p-2 rounded-xl border ${activeCharId === c.id ? 'bg-pink-600 border-pink-400' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'} transition-all`}
                  >
                    <img src={customAvatars[c.id] || c.avatarUrl} className="w-12 h-12 rounded-full object-cover mb-1 mx-auto" />
                    <div className="text-xs text-center font-bold">{c.name}</div>
                  </button>
                ))}
              </div>

              {activeCharId ? (
                <div className="space-y-3">
                  {(diariesMap?.[activeCharId] || []).length === 0 ? (
                    <div className="text-gray-500 text-center py-8">還沒有日記... 試著在聊天中讓她寫一篇吧！</div>
                  ) : (
                    (diariesMap?.[activeCharId] || []).slice().reverse().map(entry => (
                      <div key={entry.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg animate-fade-in-up">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg text-pink-300">{entry.title}</h3>
                          <span className="text-xs text-gray-500">{entry.date}</span>
                        </div>
                        <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{entry.content}</div>
                        <div className="mt-3 flex gap-2 text-xs">
                          <span className="bg-gray-900 px-2 py-1 rounded text-gray-400">心情: {entry.mood}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-10">請選擇一位角色查看日記</div>
              )}
            </div>
          )}
        </div>

        {/* CENTER PANEL (Chat) */}
        <DreamHomeChat
          activeChar={activeChar}
          activeFacility={activeFacility}
          affection={activeChar ? (affectionMap[activeChar.id] || 0) : 0}
          history={activeChar ? (interactionHistory[activeChar.id] || []) : []}
          customAvatars={customAvatars}
          isGenerating={isGenerating}
          onInteraction={(type, text) => handleInteraction(type, text)}
        />

        {/* RIGHT PANEL (Image Display) */}
        <div className="w-full md:w-[400px] bg-gray-900 border-l border-gray-700 flex flex-col shrink-0 overflow-hidden shadow-2xl relative h-full p-4">
          <h3 className="text-lg font-bold text-pink-400 mb-4 flex items-center gap-2">
            <span className="text-2xl">📸</span>
            最新寫真
          </h3>

          <div className="flex-1 bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden relative flex items-center justify-center group">
            {activeChar && interactionHistory[activeChar.id]?.slice().reverse().find(m => m.imageUrl)?.imageUrl ? (
              <>
                <img
                  src={interactionHistory[activeChar.id]?.slice().reverse().find(m => m.imageUrl)?.imageUrl}
                  className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-6">
                  <button
                    onClick={() => window.open(interactionHistory[activeChar.id]?.slice().reverse().find(m => m.imageUrl)?.imageUrl, '_blank')}
                    className="bg-pink-600 hover:bg-pink-500 text-white px-6 py-2 rounded-full font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all"
                  >
                    查看原圖
                  </button>
                </div>
              </>
            ) : (
              <div className="text-gray-500 flex flex-col items-center gap-2">
                <span className="text-4xl opacity-30">🖼️</span>
                <p className="text-sm">尚未生成圖片</p>
              </div>
            )}
          </div>

          <div className="mt-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
            <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Prompt Info</h4>
            <p className="text-xs text-gray-500 font-mono break-all">
              {activeChar ? `Selfie in ${activeFacility?.name}, ${activeChar.description.slice(0, 20)}...` : 'Waiting for generation...'}
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedFacilityId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col border border-gray-700 shadow-2xl">
            <div className="p-5 border-b border-gray-700 flex justify-between items-center"><h3 className="text-white font-bold">指派角色</h3><button onClick={() => setSelectedFacilityId(null)} className="text-gray-400">✕</button></div>
            <div className="overflow-y-auto p-3 grid gap-2">
              {characters.map(char => {
                const assignedFac = homeState.facilities.find(f => f.assignedCharId === char.id);
                return (
                  <button key={char.id} onClick={() => handleAssign(selectedFacilityId, char.id)} disabled={assignedFac?.id === selectedFacilityId} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-700 border border-transparent hover:border-gray-600 text-left">
                    <img src={customAvatars[char.id] || char.avatarUrl} className="w-10 h-10 rounded-full bg-gray-600" />
                    <div className="text-white font-bold">{char.name}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedShowcaseSlotId && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col border border-gray-700 shadow-2xl">
            <div className="p-5 border-b border-gray-700 flex justify-between items-center"><h3 className="text-white font-bold">選擇展示品</h3><button onClick={() => setSelectedShowcaseSlotId(null)} className="text-gray-400">✕</button></div>
            <div className="overflow-y-auto p-4 grid grid-cols-3 gap-3">
              {showcaseItems.length === 0 ? <p className="text-gray-500 col-span-3 text-center py-8">沒有可展示的收藏品</p> : showcaseItems.map(item => (
                <button key={item.id} onClick={() => handleSetShowcaseItem(item)} className="bg-gray-700 p-3 rounded-lg hover:bg-gray-600 border border-gray-600 flex flex-col items-center gap-2">
                  <div className="text-3xl">{item.icon}</div>
                  <div className="text-xs text-center text-gray-300">{item.name}</div>
                  <div className="text-[10px] text-green-400 bg-black/30 px-1 rounded">x{item.count}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DreamHome;
