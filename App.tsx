
import React, { useState, useEffect, useMemo } from 'react';
import { Character, StorySegment, StoryOption, AppState, SavedStory, SceneContext, ShopItem, InventoryItem, HomeState, AffectionMap, RandomEvent, AppNotification, ActiveExpedition, UserState, Quest, Recipe } from './types';
import CharacterSelector from './components/CharacterSelector';
import CharacterManager from './components/CharacterManager';
import StoryReader from './components/StoryReader';
import MemoryReader from './components/MemoryReader';
import Library from './components/Library';
import SceneSetup from './components/SceneSetup';
import ShopModal from './components/ShopModal';
import InventorySystem from './components/InventorySystem';
import LandingScreen from './components/LandingScreen';
import DataManagement from './components/DataManagement';
import DreamHome from './components/DreamHome';
import ExpeditionCenter from './components/ExpeditionCenter';
import NotificationToast from './components/NotificationToast';
import GachaSystem from './components/GachaSystem';
import CombatZone from './components/CombatZone';
import ImageCompendium from './components/ImageCompendium';
import DashboardManager from './components/DashboardManager';
import Handbook from './components/Handbook';
import Synthesizer from './components/Synthesizer';
import SettingsModal from './components/SettingsModal';
import ArknightsLayout from './components/Layout/ArknightsLayout';
import MainMenu from './components/MainMenu';
import { generateStorySegment, generateCharacterImage, generateGiftReaction, editCharacterImage } from './services/geminiService';
import { GameProvider, useGame } from './context/GameContext';
import { EXPEDITION_MAPS } from './data/expeditions';
import { SHOP_ITEMS } from './data/items';
import { CHARACTERS } from './data/characters';
import ReactPlayer from 'react-player';

const uuid = () => Math.random().toString(36).substring(2, 15);

type ViewState = 'splash' | 'home' | 'character_select' | 'character_management' | 'scene_setup' | 'story' | 'memory' | 'library' | 'dream_home' | 'expedition' | 'gacha' | 'shop' | 'inventory' | 'combat_zone' | 'compendium' | 'dashboard_manager';

const HomeActivityButton = ({ icon, label, onClick, color = "bg-gray-800", className = "" }: { icon: string; label: string; onClick: () => void; color?: string; className?: string }) => (
    <button
        onClick={onClick}
        className={`${color} ${className} hover:brightness-110 active:scale-95 transition-all duration-200 p-3 rounded-xl flex flex-col items-center justify-center gap-1 border border-white/10 shadow-lg backdrop-blur-md group h-20 w-full`}
    >
        <span className="text-2xl group-hover:scale-110 transition-transform duration-300 drop-shadow-md">{icon}</span>
        <span className="text-xs font-bold text-white tracking-wider">{label}</span>
    </button>
);

const HomeUtilityButton = ({ icon, label, onClick, highlight = false, badge }: { icon: string; label: string; onClick: () => void; highlight?: boolean; badge?: number }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-5 py-3 rounded-2xl border backdrop-blur-md transition-all active:scale-95 shadow-lg relative
      ${highlight
                ? 'bg-pink-600/80 border-pink-400 text-white hover:bg-pink-500'
                : 'bg-gray-900/60 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-400'
            }`}
    >
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-bold tracking-wide">{label}</span>
        {badge ? <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold border-2 border-gray-900">{badge}</div> : null}
    </button>
);

const AppContent = () => {
    const {
        isDataLoaded,
        userState, setUserState,
        credits, setCredits,
        inventory, setInventory,
        customCharactersList,
        favorites, setFavorites,
        affectionMap, setAffectionMap,
        homeState, setHomeState,
        activeExpeditions, setActiveExpeditions,
        library, setLibrary,
        presetEquipment, setPresetEquipment,
        dashboardGirlIds, setDashboardGirlIds,
        customAvatars, dashboardImages, ultImages, mapImages, enemyImages, itemImages,
        updateAvatar, updateDashboardImage, updateUltImage, updateMapImage, updateEnemyImage, updateItemImage,
        mergedCharacters, ownedCharacters,
        addCustomCharacter, updateAffection,
        trackStat,
        imageSettings,
        textSettings, // New
        customLoras, updateCustomLora,
        customLoraTriggers, updateCustomLoraTrigger, // New
        memoriesMap, diariesMap, addDiaryEntry, addMemory // New Memory System
    } = useGame();

    const [view, setView] = useState<ViewState>('splash');
    const [isDataModalOpen, setIsDataModalOpen] = useState(false);
    const [isHandbookOpen, setIsHandbookOpen] = useState(false);

    const [isSynthesizerOpen, setIsSynthesizerOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);

    // UI Specific State (Transient)
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
    const [sceneContext, setSceneContext] = useState<SceneContext>({ location: '', time: '', atmosphere: '', plotHook: '' });
    const [userRole, setUserRole] = useState('開拓者 / 旅行者');
    const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);
    const [activeEvents, setActiveEvents] = useState<RandomEvent[]>([]);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [focusedEventId, setFocusedEventId] = useState<string | null>(null);
    const [dashboardIndex, setDashboardIndex] = useState(0);
    const [segments, setSegments] = useState<StorySegment[]>([]);
    const [currentOptions, setCurrentOptions] = useState<StoryOption[]>([]);
    const [appState, setAppState] = useState<AppState>(AppState.IDLE);
    const [generatingSegmentId, setGeneratingSegmentId] = useState<string | null>(null);
    const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
    const [isSelectingAssistant, setIsSelectingAssistant] = useState(false);

    const currentStoryAffection = selectedCharacter ? (affectionMap[selectedCharacter.id] || 50) : 50;

    const handleEnterApp = () => setView('home');
    const handleCharacterSelect = (char: Character) => { setSelectedCharacter(char); setView('scene_setup'); };

    const handleSceneStart = async (scene: SceneContext, charOverride?: Character, autoGenImage: boolean = false) => {
        const targetChar = charOverride || selectedCharacter;
        if (!targetChar) return;
        setAppState(AppState.GENERATING_TEXT);
        setSceneContext(scene);
        const newStoryId = uuid();
        setCurrentStoryId(newStoryId);
        try {
            const memories = memoriesMap[targetChar.id] || [];
            const result = await generateStorySegment(targetChar, userRole, scene, [], null, affectionMap[targetChar.id] || 50, false, textSettings, memories);
            const newSegments = [{ id: uuid(), text: result.text, imageUrl: undefined, isUserChoice: false }];
            setSegments(newSegments);
            setCurrentOptions(result.options || []);
            setLibrary(prev => [{ id: newStoryId, title: `${targetChar.name} - ${scene.location}`, date: new Date().toISOString(), characterName: targetChar.name, segments: newSegments, finalAffection: result.newAffectionScore || affectionMap[targetChar.id] || 50 }, ...prev]);
            if (result.newAffectionScore) updateAffection(targetChar.id, result.newAffectionScore);
            setView('story');
            trackStat('chatInteractions', 1);
            if (autoGenImage) handleGenerateImage(newSegments[0].id, result.text, targetChar);
        } catch (e) { console.error(e); alert("故事生成失敗，請重試。"); } finally { setAppState(AppState.WAITING_FOR_INPUT); }
    };

    const handleOptionSelect = async (option: StoryOption, useSearch: boolean = false) => {
        if (!selectedCharacter) return;
        const userText = option.label;
        const userSegment: StorySegment = { id: uuid(), text: userText, isUserChoice: true };
        setSegments(prev => [...prev, userSegment]);
        setAppState(AppState.GENERATING_TEXT);
        try {
            const historyText = segments.slice(-5).map(s => s.text);
            const memories = memoriesMap[selectedCharacter.id] || [];
            const result = await generateStorySegment(selectedCharacter, userRole, sceneContext, historyText, userText, affectionMap[selectedCharacter.id] || 50, useSearch, textSettings, memories);
            const aiSegment: StorySegment = { id: uuid(), text: result.text, isUserChoice: false, affectionChange: result.newAffectionScore ? (result.newAffectionScore - (affectionMap[selectedCharacter.id] || 0)) : 0, affectionSource: result.affectionReason };
            setSegments(prev => [...prev, aiSegment]);
            setCurrentOptions(result.options || []);
            if (result.newAffectionScore) updateAffection(selectedCharacter.id, result.newAffectionScore);
            trackStat('chatInteractions', 1);
        } catch (e) { console.error(e); alert("對話生成失敗"); } finally { setAppState(AppState.WAITING_FOR_INPUT); }
    };

    const handleSendGift = async (item: InventoryItem) => {
        if (!selectedCharacter) return;
        setInventory(prev => prev.map(i => i.id === item.id ? { ...i, count: i.count - 1 } : i).filter(i => i.count > 0));
        const currentAff = affectionMap[selectedCharacter.id] || 0;
        const newAff = Math.min(500, currentAff + item.baseAffection);
        updateAffection(selectedCharacter.id, newAff);
        setAppState(AppState.GENERATING_TEXT);
        setSegments(prev => [...prev, { id: uuid(), text: `(贈送了 ${item.name})`, isUserChoice: true }]);
        trackStat('giftsSent', 1);
        try {
            const reaction = await generateGiftReaction(selectedCharacter, item, newAff);
            setSegments(prev => [...prev, { id: uuid(), text: reaction, isUserChoice: false, affectionChange: item.baseAffection, affectionSource: `贈送 ${item.name}` }]);
        } catch (e) { console.error(e); } finally { setAppState(AppState.WAITING_FOR_INPUT); }
    };

    const handleStartMemory = async (char: Character, scene: SceneContext) => {
        setSelectedCharacter(char); setAppState(AppState.GENERATING_TEXT); setView('memory');
        const newStoryId = uuid(); setCurrentStoryId(newStoryId); setSegments([]);
        try {
            let memoryRole = '旅行者';
            if (char.game === 'Honkai: Star Rail') memoryRole = '星';
            else if (char.game === 'Genshin Impact') memoryRole = '螢';
            const currentAff = affectionMap[char.id] || 50;
            const memories = memoriesMap[char.id] || [];
            const result = await generateStorySegment(char, memoryRole, scene, [], null, currentAff, false, textSettings, memories);
            setAppState(AppState.GENERATING_IMAGE);
            const img = await generateCharacterImage(char, result.text, customAvatars[char.id], imageSettings, undefined, undefined, currentAff);
            const newSegment: StorySegment = { id: uuid(), text: result.text, imageUrl: img || undefined, isUserChoice: false, isFavorited: true };
            setSegments([newSegment]);
            const memoryStory: SavedStory = { id: newStoryId, title: `【回憶】${char.name} - ${scene.atmosphere}`, date: new Date().toISOString(), characterName: char.name, segments: [newSegment], finalAffection: currentAff };
            setLibrary(prev => [memoryStory, ...prev]);
        } catch (e) { console.error(e); alert("回憶生成失敗。"); setView('home'); } finally { setAppState(AppState.IDLE); }
    };

    const handleGenerateImage = async (segmentId: string, text: string, charOverride?: Character) => {
        const targetChar = charOverride || selectedCharacter;
        if (!targetChar) return;
        setAppState(AppState.GENERATING_IMAGE);
        setGeneratingSegmentId(segmentId);
        try {
            const prompt = `Action/Scene: ${text}`;
            console.log("Generating image for segment:", segmentId);
            console.log("Generating image for segment:", segmentId);
            const loraTag = customLoras[targetChar.id]; // Get LoRA tag
            const loraTrigger = customLoraTriggers[targetChar.id]; // Get LoRA Trigger
            const imgBase64 = await generateCharacterImage(targetChar, prompt, customAvatars[targetChar.id], imageSettings, loraTag, loraTrigger, affectionMap[targetChar.id] || 50);
            if (imgBase64) {
                console.log("Image URL received:", imgBase64);
                // alert("Debug: Image URL received: " + imgBase64); // Temporary Debug Removed
                setSegments(prev => prev.map(s => s.id === segmentId ? { ...s, imageUrl: imgBase64 } : s));
            } else {
                alert("圖片生成失敗，請檢查 API Key 或後端設定。");
            }
        } catch (e) {
            console.error("Image gen failed", e);
            alert("圖片生成發生錯誤：" + (e as any).message);
        } finally {
            setAppState(AppState.WAITING_FOR_INPUT);
            setGeneratingSegmentId(null);
        }
    };

    const handleEditImage = async (segmentId: string, currentUrl: string, prompt: string) => {
        setAppState(AppState.GENERATING_IMAGE);
        setGeneratingSegmentId(segmentId);
        try {
            const newImg = await editCharacterImage(currentUrl, prompt);
            if (newImg) setSegments(prev => prev.map(s => s.id === segmentId ? { ...s, imageUrl: newImg } : s));
        } catch (e) { console.error(e); } finally { setAppState(AppState.WAITING_FOR_INPUT); setGeneratingSegmentId(null); }
    };

    const handleUserImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                const base64 = e.target.result as string;
                const seg: StorySegment = { id: uuid(), text: "(上傳了圖片)", imageUrl: base64, isUserChoice: true };
                setSegments(prev => [...prev, seg]);
                handleOptionSelect({ label: "(給你看這張圖)", action: "show_image" });
            }
        };
        reader.readAsDataURL(file);
    };

    const handleBuyItem = (item: ShopItem) => {
        if (credits < item.price) return alert("積分不足");
        setCredits(prev => prev - item.price);
        setInventory(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) return prev.map(i => i.id === item.id ? { ...i, count: i.count + 1 } : i);
            return [...prev, { ...item, count: 1 }];
        });
        trackStat('creditsSpent', item.price);
        alert(`購買成功: ${item.name}`);
    };

    const onEquip = (charId: string, itemId: string, slot: 'weapon' | 'armor' | 'accessory') => {
        setPresetEquipment(prev => ({ ...prev, [charId]: { ...(prev[charId] || {}), [slot + 'Id']: itemId } }));
    };

    const onUnequip = (charId: string, slot: 'weapon' | 'armor' | 'accessory') => {
        setPresetEquipment(prev => { const n = { ...prev }; if (n[charId]) delete n[charId][slot + 'Id']; return n; });
    };

    const handleGachaAdd = (item: ShopItem) => {
        setInventory(prev => { const e = prev.find(i => i.id === item.id); if (e) return prev.map(i => i.id === item.id ? { ...i, count: i.count + 1 } : i); return [...prev, { ...item, count: 1 }]; });
    };

    const handleCharacterGet = (char: Character) => {
        if (!userState.ownedCharacterIds.includes(char.id)) {
            setUserState(prev => ({ ...prev, ownedCharacterIds: [...prev.ownedCharacterIds, char.id], characterProgression: { ...prev.characterProgression, [char.id]: { level: 1, exp: 0, ascension: 0, unlockedTraces: [] } } }));
        } else {
            setUserState(prev => ({ ...prev, starlight: prev.starlight + 10 }));
        }
    };

    const handleClaimQuest = (quest: Quest) => {
        setUserState(prev => ({
            ...prev,
            claimedQuestIds: [...prev.claimedQuestIds, quest.id]
        }));

        if (quest.rewards.credits) setCredits(prev => prev + quest.rewards.credits!);
        if (quest.rewards.starJade) setUserState(prev => ({ ...prev, starJade: prev.starJade + quest.rewards.starJade! }));
        if (quest.rewards.exp) setUserState(prev => ({ ...prev, exp: prev.exp + quest.rewards.exp! }));

        alert(`已領取 ${quest.title} 獎勵！`);
    };

    const handleCraft = (recipe: Recipe, amount: number) => {
        const totalCost = recipe.costCredits * amount;
        setCredits(prev => prev - totalCost);

        setInventory(prev => {
            let newInv = [...prev];
            recipe.materials.forEach(mat => {
                const req = mat.count * amount;
                newInv = newInv.map(i => i.id === mat.itemId ? { ...i, count: i.count - req } : i);
            });

            const result = SHOP_ITEMS.find(i => i.id === recipe.resultItemId);
            if (result) {
                const exist = newInv.find(i => i.id === result.id);
                if (exist) exist.count += recipe.resultCount * amount;
                else newInv.push({ ...result, count: recipe.resultCount * amount });
            }

            return newInv.filter(i => i.count > 0);
        });

        trackStat('itemsCrafted', amount);
    };

    const creditIcon = itemImages['currency_credit'] ? <img src={itemImages['currency_credit']} className="w-5 h-5 object-contain" /> : '🪙';
    const jadeIcon = itemImages['currency_jade'] ? <img src={itemImages['currency_jade']} className="w-5 h-5 object-contain" /> : '💎';

    useEffect(() => {
        const interval = setInterval(() => {
            setDashboardIndex(prev => prev + 1);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const currentDashboardBg = useMemo(() => {
        if (dashboardGirlIds.length === 0) return { url: '', name: '', isBlurred: false };
        const validIds = dashboardGirlIds.filter(id => [...CHARACTERS, ...customCharactersList].find(c => c.id === id));
        if (validIds.length === 0) return { url: '', name: '', isBlurred: false };
        const activeId = validIds[dashboardIndex % validIds.length];
        const char = [...CHARACTERS, ...customCharactersList].find(c => c.id === activeId);
        if (dashboardImages[activeId]) return { url: dashboardImages[activeId], name: char?.name || '', isBlurred: false };
        return { url: customAvatars[activeId] || char?.avatarUrl || '', name: char?.name || '', isBlurred: true };
    }, [dashboardGirlIds, dashboardIndex, customCharactersList, dashboardImages, customAvatars]);

    const assistantCharUrl = useMemo(() => {
        if (dashboardGirlIds.length === 0) return '';
        const validIds = dashboardGirlIds.filter(id => [...CHARACTERS, ...customCharactersList].find(c => c.id === id));
        if (validIds.length === 0) return '';
        const activeId = validIds[dashboardIndex % validIds.length];
        const char = [...CHARACTERS, ...customCharactersList].find(c => c.id === activeId);
        return char?.portraitUrl || customAvatars[activeId] || char?.avatarUrl || '';
    }, [dashboardGirlIds, dashboardIndex, customCharactersList, customAvatars]);

    if (!isDataLoaded) return <div className="w-full h-screen bg-[var(--ak-bg-dark)] flex flex-col items-center justify-center text-white"><div className="w-16 h-16 border-4 border-[var(--ak-accent-cyan)] border-t-transparent rounded-full animate-spin mb-4"></div><p className="text-xl font-bold tracking-widest animate-pulse font-mono">INITIALIZING PRTS...</p></div>;

    return (
        <ArknightsLayout
            userState={userState}
            credits={credits}
            bgImage={currentDashboardBg.url}
            onOpenSettings={() => setIsSettingsOpen(true)}
            showTopBar={view === 'home' && !isSelectingAssistant}
        >
            <NotificationToast notifications={notifications} onClose={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} />



            {view === 'splash' ? (
                <LandingScreen onStart={handleEnterApp} backgroundUrl={currentDashboardBg.url} />
            ) : (
                <div className="relative z-10 w-full h-full animate-fade-in">
                    {view === 'home' && (
                        <MainMenu
                            onNavigate={(target) => setView(target as ViewState)}
                            assistantUrl={assistantCharUrl}
                            onChangeAssistant={() => setIsSelectingAssistant(true)}
                        />
                    )}

                    {(view === 'character_select' || isSelectingAssistant) && (
                        <CharacterSelector
                            isOpen={true}
                            onClose={() => {
                                if (isSelectingAssistant) setIsSelectingAssistant(false);
                                else setView('home');
                            }}
                            onToggleDashboardGirl={(id) => {
                                if (dashboardGirlIds.includes(id)) setDashboardGirlIds(prev => prev.filter(d => d !== id));
                                else setDashboardGirlIds(prev => [...prev, id]);
                            }}
                            onSelect={(char) => {
                                if (isSelectingAssistant) {
                                    setDashboardGirlIds([char.id]); // Set as the only dashboard girl
                                    setIsSelectingAssistant(false);
                                } else {
                                    handleCharacterSelect(char);
                                }
                            }}
                            favorites={favorites}
                            toggleFavorite={(id) => setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                            customAvatars={customAvatars}
                            onGenerateAvatar={async (char) => { setIsGeneratingAvatar(true); try { const img = await generateCharacterImage(char, "Portrait", undefined, imageSettings, undefined, undefined, affectionMap[char.id] || 0); if (img) await updateAvatar(char.id, img); } finally { setIsGeneratingAvatar(false); } }}
                            onUploadAvatar={(id, file) => { const reader = new FileReader(); reader.onload = async (e) => { if (e.target?.result) await updateAvatar(id, e.target!.result as string) }; reader.readAsDataURL(file); }}
                            isGeneratingAvatar={isGeneratingAvatar}
                            onAddCustomCharacter={addCustomCharacter}
                            customCharactersList={ownedCharacters.filter(c => c.isCustom)}
                            dashboardGirlIds={dashboardGirlIds}
                            onUploadDashboardImage={(id, file) => { const reader = new FileReader(); reader.onload = async (e) => { if (e.target?.result) await updateDashboardImage(id, e.target!.result as string) }; reader.readAsDataURL(file); }}
                            dashboardImages={dashboardImages}
                            availableCharacters={ownedCharacters}
                            mode={isSelectingAssistant ? 'assistant' : 'story'}
                        />
                    )}
                    {view === 'character_management' && (
                        <CharacterManager
                            isOpen={true}
                            onClose={() => setView('home')}
                            characters={ownedCharacters}
                            inventory={inventory}
                            onEquipItem={onEquip}
                            onUnequipItem={onUnequip}
                            customAvatars={customAvatars}
                            userState={userState}
                            onUpdateUserState={setUserState}
                            onUpdateInventory={setInventory}
                            affectionMap={affectionMap}
                            onUpdateAffection={updateAffection}
                            onStartSpecialStory={handleStartMemory}
                            onUploadUltImage={(id, file) => { const reader = new FileReader(); reader.onload = async (e) => { if (e.target?.result) await updateUltImage(id, e.target!.result as string) }; reader.readAsDataURL(file); }}
                            ultImages={ultImages}
                            customLoras={customLoras}
                            onUpdateLora={updateCustomLora}
                            customLoraTriggers={customLoraTriggers}
                            onUpdateLoraTrigger={updateCustomLoraTrigger}
                        />
                    )}
                    {view === 'combat_zone' && (
                        <CombatZone
                            characters={ownedCharacters} customAvatars={customAvatars} userState={userState} onBack={() => setView('home')}
                            onUpdateUserState={setUserState} onUpdateInventory={setInventory} ultImages={ultImages} inventory={inventory}
                            onNavigate={(target) => setView(target as ViewState)}
                        />
                    )}
                    {view === 'shop' && <ShopModal isOpen={true} onClose={() => setView('home')} credits={credits} onBuy={handleBuyItem} />}
                    {view === 'inventory' && (
                        <InventorySystem
                            inventory={inventory}
                            characters={ownedCharacters}
                            onBack={() => setView('home')}
                            onEquip={onEquip}
                            itemImages={itemImages}
                        />
                    )}
                    {view === 'library' && <Library library={library} onLoadStory={(story) => { const foundChar = mergedCharacters.find((c: any) => c.name === story.characterName) || CHARACTERS[0]; setSelectedCharacter(foundChar); setSegments(story.segments); setCurrentStoryId(story.id); if (story.title.includes('【回憶】')) { setView('memory'); } else { updateAffection(foundChar.id, story.finalAffection); setCurrentOptions([{ label: "繼續", action: "continue" }]); setView('story'); } }} onDeleteStory={(id) => setLibrary(prev => prev.filter(s => s.id !== id))} onBack={() => setView('home')} />}
                    {view === 'story' && selectedCharacter && <StoryReader character={selectedCharacter} segments={segments} currentOptions={currentOptions} appState={appState} customAvatar={customAvatars[selectedCharacter.id]} generatingSegmentId={generatingSegmentId} onOptionSelect={handleOptionSelect} onGenerateImage={handleGenerateImage} onEditImage={handleEditImage} onGenerateVideo={() => { }} onToggleFavorite={(segId) => setSegments(prev => prev.map(s => s.id === segId ? { ...s, isFavorited: !s.isFavorited } : s))} onSave={() => { const storyData: SavedStory = { id: currentStoryId || uuid(), title: `${selectedCharacter.name} - ${sceneContext.location}`, date: new Date().toISOString(), characterName: selectedCharacter.name, segments: segments, finalAffection: affectionMap[selectedCharacter.id] || 50 }; const existingIdx = library.findIndex(s => s.id === storyData.id); if (existingIdx >= 0) { const newLib = [...library]; newLib[existingIdx] = storyData; setLibrary(newLib); } else { setLibrary([storyData, ...library]); } alert("進度已保存"); }} onBack={() => setView('home')} currentAffection={currentStoryAffection} inventory={inventory} onOpenShop={() => setView('shop')} onSendGift={handleSendGift} onUploadUserImage={handleUserImageUpload} onUpdateAffection={(val) => updateAffection(selectedCharacter.id, val)} />}
                    {view === 'memory' && selectedCharacter && <MemoryReader character={selectedCharacter} segment={segments[0]} isGenerating={appState === AppState.GENERATING_TEXT || appState === AppState.GENERATING_IMAGE} onBack={() => setView('home')} />}
                    {view === 'scene_setup' && selectedCharacter && <SceneSetup character={selectedCharacter} userRole={userRole} customAvatar={customAvatars[selectedCharacter.id]} onUserRoleChange={setUserRole} onStart={handleSceneStart} onBack={() => setView('character_select')} currentAffection={affectionMap[selectedCharacter.id] || 0} isGeneratingStory={appState === AppState.GENERATING_TEXT} textSettings={textSettings} />}
                    {view === 'dream_home' && <DreamHome homeState={homeState} characters={ownedCharacters} credits={credits} inventory={inventory} affectionMap={affectionMap} customAvatars={customAvatars} activeEvents={activeEvents} focusedEventId={focusedEventId} onClearFocusedEvent={() => setFocusedEventId(null)} onUpdateHomeState={setHomeState} onUpdateCredits={setCredits} onUpdateAffection={updateAffection} onUpdateInventory={setInventory} onResolveEvent={(id) => setActiveEvents(prev => prev.filter(e => e.id !== id))} onBack={() => setView('home')} imageSettings={imageSettings} textSettings={textSettings} diariesMap={diariesMap} addDiaryEntry={addDiaryEntry} addMemory={addMemory} />}
                    {view === 'expedition' && <ExpeditionCenter characters={ownedCharacters} activeExpeditions={activeExpeditions} customAvatars={customAvatars} inventory={inventory} credits={credits} homeState={homeState} onStartExpedition={(mapId, charIds, equipId) => { const newExp: ActiveExpedition = { id: uuid(), mapId, characterIds: charIds, startTime: Date.now(), endTime: Date.now() + (EXPEDITION_MAPS.find(m => m.id === mapId)?.durationMinutes || 60) * 60 * 1000, claimed: false, usedEquipmentId: equipId, bonusCreditMult: 1, bonusAffectionMult: 1 }; setActiveExpeditions(prev => [...prev, newExp]); setCredits(prev => prev - (EXPEDITION_MAPS.find(m => m.id === mapId)?.ticketCost || 0)); }} onClaimExpedition={(id, log, cred, aff, mats, rare) => { setActiveExpeditions(prev => prev.filter(e => e.id !== id)); setCredits(prev => prev + cred); const exp = activeExpeditions.find(e => e.id === id); if (exp) { exp.characterIds.forEach(cid => updateAffection(cid, (affectionMap[cid] || 0) + aff)); } if (mats.length > 0 || rare) { setInventory(prev => { let newInv = [...prev]; mats.forEach(m => { const exist = newInv.find(i => i.id === m.id); if (exist) exist.count += m.count; else newInv.push(m); }); if (rare) { const exist = newInv.find(i => i.id === rare.id); if (exist) exist.count += 1; else newInv.push({ ...rare, count: 1 }); } return newInv; }); } trackStat('expeditionsCompleted', 1); }} onBack={() => setView('home')} />}
                    {view === 'gacha' && <GachaSystem credits={credits} starJade={userState.starJade} onSpendCredits={(amt) => setCredits(prev => prev - amt)} onSpendStarJade={(amt) => setUserState(prev => ({ ...prev, starJade: prev.starJade - amt }))} onAddItem={handleGachaAdd} onAddCharacter={handleCharacterGet} onBack={() => handleEnterApp()} allCharacters={mergedCharacters} isTutorial={userState.ownedCharacterIds.length === 0} trackStat={trackStat} />}
                    {view === 'compendium' && <ImageCompendium isOpen={true} onClose={() => setView('home')} customCharacters={customCharactersList} mapImages={mapImages} onUploadMapImage={updateMapImage} enemyImages={enemyImages} onUploadEnemyImage={updateEnemyImage} itemImages={itemImages} onUploadItemImage={updateItemImage} characterAvatars={customAvatars} onUploadCharacterImage={(id, file) => { const reader = new FileReader(); reader.onload = async (e) => { if (e.target?.result) await updateAvatar(id, e.target!.result as string) }; reader.readAsDataURL(file); }} ultImages={ultImages} onUploadUltImage={(id, file) => { const reader = new FileReader(); reader.onload = async (e) => { if (e.target?.result) await updateUltImage(id, e.target!.result as string) }; reader.readAsDataURL(file); }} />}
                    {view === 'dashboard_manager' && <DashboardManager isOpen={true} onClose={() => setView('home')} characters={ownedCharacters} dashboardImages={dashboardImages} rotationIds={dashboardGirlIds} onToggleRotation={(id) => setDashboardGirlIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])} onUploadDashboardImage={(id, file) => { const reader = new FileReader(); reader.onload = async (e) => { if (e.target?.result) await updateDashboardImage(id, e.target!.result as string) }; reader.readAsDataURL(file); }} />}

                    <Handbook isOpen={isHandbookOpen} onClose={() => setIsHandbookOpen(false)} userState={userState} onClaimReward={handleClaimQuest} />
                    <Synthesizer isOpen={isSynthesizerOpen} onClose={() => setIsSynthesizerOpen(false)} userState={userState} inventory={inventory} credits={credits} onCraft={handleCraft} />
                    <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
                    <DataManagement isOpen={isDataModalOpen} onClose={() => setIsDataModalOpen(false)} onImportComplete={() => window.location.reload()} />
                </div>
            )}
        </ArknightsLayout>
    );
};

const App = () => {
    return (
        <GameProvider>
            <AppContent />
        </GameProvider>
    );
};

export default App;
