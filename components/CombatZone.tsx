
import React, { useState, useEffect } from 'react';
import { Character, UserState, InventoryItem, RaidMap, WorldEvent, CombatUnit, CombatStatus } from '../types';
import { RAID_MAPS, RAID_REGIONS } from '../data/raids';
import { DAILY_STAGES } from '../data/farming';
import { SHOP_ITEMS } from '../data/items';
import { WORLD_EVENTS, GENERIC_EVENTS } from '../data/worldEvents';
import { NarrativeService } from '../services/narrativeService';
import { getAllMapImagesFromDB, getAllEnemyImagesFromDB, getAllRegionImagesFromDB } from '../services/dbService';
import { calculateStats } from '../data/combatData';
import { calculateFinalStats } from '../data/DataManager';
import { APP_CONFIG } from '../appConfig';
import { calculateMVP, calculateDrops, MvpResult } from '../utils/combatLogic';
import BattleEngine, { CombatMetrics } from './BattleEngine';
import MapOverlay from './MapOverlay';
import BattleSettlement from './BattleSettlement';
import RaidSelector from './RaidSelector';
import SquadPrepModal from './SquadPrepModal';
import { generateMapNodes, MapNode } from './MapSystem';

interface Props {
    characters: Character[];
    customAvatars: { [key: string]: string };
    userState: UserState;
    onBack: () => void;
    onUpdateUserState: (newState: UserState) => void;
    onUpdateInventory: (newInv: InventoryItem[]) => void;
    ultImages?: { [key: string]: string };
    inventory?: InventoryItem[];
    onNavigate?: (view: string) => void;
}

type Phase = 'MODE_SELECT' | 'SQUAD_SELECT' | 'MAP_PROGRESSION' | 'PRE_BATTLE_DIALOGUE' | 'COMBAT_ENCOUNTER' | 'COMBAT_RESULT' | 'EVENT_ENCOUNTER' | 'EVENT_RESOLUTION' | 'VICTORY' | 'DEFEAT';

interface SquadState {
    currentHp: number;
    currentEnergy: number;
    isDead: boolean;
}

const CombatZone: React.FC<Props> = ({ characters, customAvatars, userState, onBack, onUpdateUserState, onUpdateInventory, ultImages = {}, inventory = [], onNavigate }) => {
    const [phase, setPhase] = useState<Phase>('MODE_SELECT');
    const [activeMode, setActiveMode] = useState<'RAID' | 'DAILY'>('RAID');
    const [selectedUniverse, setSelectedUniverse] = useState<'HSR' | 'GENSHIN'>('HSR');
    const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
    const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
    const [selectedDailyStageId, setSelectedDailyStageId] = useState<string | null>(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState<number>(0);
    const [squadIds, setSquadIds] = useState<string[]>([]);

    const [generatedNodes, setGeneratedNodes] = useState<MapNode[]>([]);
    const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
    const [raidSquadState, setRaidSquadState] = useState<Record<string, SquadState>>({});
    const [accumulatedDrops, setAccumulatedDrops] = useState<InventoryItem[]>([]);
    const [nextBattleStatuses, setNextBattleStatuses] = useState<Record<string, CombatStatus[]>>({});
    const [sectorClearedDrops, setSectorClearedDrops] = useState<InventoryItem[] | null>(null);

    const [showSweepModal, setShowSweepModal] = useState(false);
    const [sweepCount, setSweepCount] = useState(1);

    const [mapImages, setMapImages] = useState<{ [key: string]: string }>({});
    const [enemyImages, setEnemyImages] = useState<{ [key: string]: string }>({});
    const [regionImages, setRegionImages] = useState<{ [key: string]: string }>({});

    const [narrative, setNarrative] = useState("");
    const [resultData, setResultData] = useState<{
        type: 'VICTORY' | 'DEFEAT' | 'SWEEP';
        mvp: MvpResult | null;
        rewards: { credits: number, exp: number, items: InventoryItem[] };
        metrics: Record<string, CombatMetrics>;
        finalAllies: CombatUnit[];
    } | null>(null);

    const [currentEvent, setCurrentEvent] = useState<WorldEvent | null>(null);
    const [eventResolutionText, setEventResolutionText] = useState("");

    const [battleId, setBattleId] = useState(0);
    const [battleAllies, setBattleAllies] = useState<CombatUnit[]>([]);
    const [battleEnemies, setBattleEnemies] = useState<CombatUnit[]>([]);
    const [battleBg, setBattleBg] = useState('');
    const [gameSpeed, setGameSpeed] = useState(1);
    const [isAuto, setIsAuto] = useState(false);

    const activeMap = activeMode === 'RAID' ? RAID_MAPS.find(m => m.id === selectedMapId) : null;
    const activeDaily = activeMode === 'DAILY' ? DAILY_STAGES.find(d => d.id === selectedDailyStageId) : null;
    const dailyDiff = activeDaily ? activeDaily.difficulties[selectedDifficulty] : null;

    const getAvatar = (id: string) => customAvatars[id] || characters.find(c => c.id === id)?.avatarUrl || '';

    useEffect(() => {
        const loadImages = async () => {
            setMapImages(await getAllMapImagesFromDB());
            setEnemyImages(await getAllEnemyImagesFromDB());
            setRegionImages(await getAllRegionImagesFromDB());
        };
        loadImages();
    }, []);

    useEffect(() => {
        if (activeMode === 'RAID') {
            const regions = RAID_REGIONS.filter(r => {
                const hsrIds = ['herta_station', 'jarilo_vi', 'xianzhou', 'penacony', 'amphoreus'];
                return selectedUniverse === 'HSR' ? hsrIds.includes(r.id) : !hsrIds.includes(r.id);
            });
            if (regions.length > 0) setSelectedRegionId(regions[0].id);
        }
    }, [selectedUniverse, activeMode]);

    const getFullStats = (char: Character) => {
        const prog = userState.characterProgression[char.id] || { level: 1, ascension: 0, unlockedTraces: [] };
        const base = calculateStats(char, prog.level, prog.ascension, 0);
        const final = calculateFinalStats(base, char.id, prog.unlockedTraces, 0);
        ['weapon', 'armor', 'accessory'].forEach(slot => {
            const eqId = char.equipment?.[slot === 'weapon' ? 'weaponId' : slot === 'armor' ? 'armorId' : 'accessoryId'];
            if (eqId) {
                const item = inventory.find(i => i.id === eqId);
                if (item && item.stats) {
                    if (item.stats.hp) final.hp += item.stats.hp;
                    if (item.stats.atk) final.atk += item.stats.atk;
                    if (item.stats.def) final.def += item.stats.def;
                    if (item.stats.spd) final.spd += item.stats.spd;
                }
            }
        });
        return { stats: final, level: prog.level };
    };

    const startRaid = () => {
        if (squadIds.length === 0) { alert("需要至少一名幹員。"); return; }
        if (!activeMap) return;
        if (userState.stamina < activeMap.staminaCost) { alert("體力不足！無法開始討伐。"); return; }
        onUpdateUserState({ ...userState, stamina: userState.stamina - activeMap.staminaCost });

        const nodes = generateMapNodes(activeMap);
        setGeneratedNodes(nodes);
        setCurrentNodeIndex(0);
        setAccumulatedDrops([]);
        setNextBattleStatuses({});

        const initialState: Record<string, SquadState> = {};
        squadIds.forEach(id => {
            const char = characters.find(c => c.id === id)!;
            const { stats } = getFullStats(char);
            initialState[id] = { currentHp: stats.hp, currentEnergy: 60, isDead: false };
        });
        setRaidSquadState(initialState);
        setPhase('MAP_PROGRESSION');
    };

    const handleRetreat = () => {
        const cost = activeMap ? activeMap.staminaCost : (dailyDiff ? dailyDiff.staminaCost : 0);
        const refund = Math.max(0, cost - 1);
        onUpdateUserState({ ...userState, stamina: Math.min(userState.maxStamina, userState.stamina + refund) });
        setSelectedMapId(null);
        setSelectedDailyStageId(null);
        setPhase('SQUAD_SELECT');
        setGeneratedNodes([]);
        setCurrentNodeIndex(0);
        setRaidSquadState({});
        setAccumulatedDrops([]);
        setNextBattleStatuses({});
    };

    const handleEnterNode = () => {
        if (activeMode === 'DAILY' && activeDaily && dailyDiff) {
            if (userState.stamina < dailyDiff.staminaCost) { alert("體力不足！無法開始特訓。"); return; }
            onUpdateUserState({ ...userState, stamina: userState.stamina - dailyDiff.staminaCost });
            setNarrative("特訓開始...");
            const dailyEnemies = dailyDiff.enemies.map(e => ({ ...e, level: dailyDiff.level * 10, hp: e.maxHp * dailyDiff.level, atk: e.atk * dailyDiff.level }));
            prepareBattle(dailyEnemies, activeDaily.imageUrl);
            setPhase('COMBAT_ENCOUNTER');
            return;
        }

        if (!activeMap || generatedNodes.length === 0) return;
        const node = generatedNodes[currentNodeIndex];
        const currentSquad = squadIds.map(id => characters.find(c => c.id === id)!);

        if (node.type === 'ELITE' || node.type === 'COMBAT' || node.type === 'BOSS') {
            const txt = NarrativeService.resolveNarrative({ regionId: activeMap.regionId, trigger: (node.type === 'ELITE' || node.type === 'BOSS') ? 'ELITE_BATTLE' : 'EXPLORATION', squad: currentSquad });
            setNarrative(txt);
            const enemiesData = node.enemies || [];
            const bg = mapImages[activeMap.id] || activeMap.imageUrl;
            prepareBattle(enemiesData, bg, true);
            setPhase('PRE_BATTLE_DIALOGUE');
        } else if (node.type === 'EVENT') {
            pickRandomEvent();
            setPhase('EVENT_ENCOUNTER');
        } else if (node.type === 'REST') {
            setEventResolutionText("隊伍在安全區獲得了短暫的休息，生命值與能量已完全恢復。");
            const healedState = { ...raidSquadState };
            squadIds.forEach(id => {
                const char = characters.find(c => c.id === id)!;
                const { stats } = getFullStats(char);
                healedState[id] = { currentHp: stats.hp, currentEnergy: 120, isDead: false };
            });
            setRaidSquadState(healedState);
            setPhase('EVENT_RESOLUTION');
        } else {
            handleNextStep();
        }
    };

    const pickRandomEvent = () => {
        if (!activeMap) return;
        const regionEvents = WORLD_EVENTS[activeMap.regionId] || [];
        const pool = [...regionEvents, ...GENERIC_EVENTS];
        const evt = pool[Math.floor(Math.random() * pool.length)];
        setCurrentEvent(evt);
    };

    const handleEventChoice = (choice: any) => {
        if (!currentEvent) return;
        let resolution = "Event Resolved.";
        if (choice.effect === 'BUFF') {
            const buffStatus = choice.value as CombatStatus;
            const newBuffs = { ...nextBattleStatuses };
            squadIds.forEach(id => {
                if (!newBuffs[id]) newBuffs[id] = [];
                newBuffs[id].push({ ...buffStatus, id: `event_buff_${Date.now()}`, sourceCharId: 'event' });
            });
            setNextBattleStatuses(newBuffs);
            resolution = `Buff Applied: ${buffStatus.name}`;
        } else if (choice.effect === 'BATTLE') {
            const enemies = [activeMap?.possibleEnemies[0] || {}];
            prepareBattle(enemies, mapImages[activeMap!.id] || activeMap!.imageUrl, false);
            setTimeout(() => setPhase('COMBAT_ENCOUNTER'), 1000);
            return;
        } else if (choice.effect === 'HEAL') {
            const healedState = { ...raidSquadState };
            Object.keys(healedState).forEach(id => { if (!healedState[id].isDead) healedState[id].currentHp = getFullStats(characters.find(c => c.id === id)!).stats.hp; });
            setRaidSquadState(healedState);
            resolution = "Healed.";
        } else if (choice.effect === 'ITEM') {
            const item = SHOP_ITEMS.find(i => i.id === (choice.value === 'random' ? 'aether_dust' : choice.value));
            if (item) setAccumulatedDrops(prev => [...prev, { ...item, count: 1 }]);
            resolution = `Found ${item?.name}`;
        }
        setEventResolutionText(resolution);
        setPhase('EVENT_RESOLUTION');
    };

    const prepareBattle = (enemiesData: any[], bgUrl: string, isInstance: boolean = false) => {
        const allies: CombatUnit[] = squadIds.map(id => {
            const char = characters.find(c => c.id === id)!;
            const { stats, level } = getFullStats(char);
            const element = char.game === 'Honkai: Star Rail' ? 'Quantum' : 'Physical';
            let hp = stats.hp;
            let energy = 60;
            let isDead = false;
            if (activeMode === 'RAID' && raidSquadState[id]) {
                hp = raidSquadState[id].currentHp;
                energy = raidSquadState[id].currentEnergy;
                isDead = raidSquadState[id].isDead;
            }
            return {
                uid: `ally_${id}`, charId: id, name: char.name, isEnemy: false,
                level: level, maxHp: stats.hp, currentHp: hp,
                maxToughness: 0, currentToughness: 0, maxEnergy: 120, currentEnergy: energy,
                stats, element: element, av: 10000 / stats.spd, isDead: isDead,
                avatarUrl: getAvatar(id), statuses: [], shield: 0, animState: 'idle',
                equipmentRefs: char.equipment
            };
        });

        const enemies: CombatUnit[] = (enemiesData as any[]).map((e, i) => {
            // 恢復正常難度，不再削弱敵方
            const hp = e.hp || e.maxHp;
            const atk = e.stats?.atk || e.atk;

            return {
                uid: `enemy_${i}`, charId: e.id || e.charId, name: e.name, isEnemy: true,
                level: e.level, maxHp: hp, currentHp: hp,
                maxToughness: 100, currentToughness: 100, maxEnergy: 0, currentEnergy: 0,
                stats: { ...(e.stats || { hp: e.hp, atk: e.atk, def: e.def, spd: e.spd }), hp, atk }, element: e.element,
                av: 10000 / e.spd, isDead: false, avatarUrl: enemyImages[e.id] || '', statuses: [], shield: 0, animState: 'idle', weaknesses: e.weaknesses
            };
        });

        setBattleAllies(allies);
        setBattleEnemies(enemies);
        setBattleBg(bgUrl);
        setBattleId(Date.now());
    };

    const handleBattleEnd = (win: boolean, survivors: CombatUnit[], metrics: Record<string, CombatMetrics> = {}, allFinalAllies: CombatUnit[] = []) => {
        if (activeMode === 'RAID' && allFinalAllies.length > 0) {
            const newState = { ...raidSquadState };
            allFinalAllies.forEach(unit => {
                if (!unit.isSummon) {
                    newState[unit.charId] = { currentHp: unit.currentHp, currentEnergy: unit.currentEnergy, isDead: unit.isDead };
                }
            });
            setRaidSquadState(newState);
        }

        if (win) {
            const { items: newDrops, credits: gainedCredits, exp: gainedExp } = calculateDrops({
                type: activeMode,
                map: activeMap || undefined,
                daily: activeDaily || undefined,
                dailyDiffIndex: selectedDifficulty
            });

            const mvp = calculateMVP(allFinalAllies, metrics);

            if (activeMode === 'RAID' && activeMap && generatedNodes[currentNodeIndex].type !== 'BOSS') {
                setAccumulatedDrops(prev => [...prev, ...newDrops]);
                setSectorClearedDrops(newDrops);
                setTimeout(() => { setSectorClearedDrops(null); handleNextStep(); }, 2500);
                return;
            }

            const totalDrops = [...accumulatedDrops, ...newDrops];
            const mergedDrops: InventoryItem[] = [];
            totalDrops.forEach(d => {
                const exist = mergedDrops.find(m => m.id === d.id);
                if (exist) exist.count += d.count; else mergedDrops.push({ ...d });
            });
            if (gainedCredits > 0) {
                const creditItem = SHOP_ITEMS.find(i => i.id === 'currency_credit');
                if (creditItem) mergedDrops.push({ ...creditItem, count: gainedCredits });
            }

            let newClearedIds = userState.clearedStageIds;
            if (activeMode === 'RAID' && activeMap && generatedNodes[currentNodeIndex].type === 'BOSS' && !userState.clearedStageIds.includes(activeMap.id)) {
                newClearedIds = [...userState.clearedStageIds, activeMap.id];
            }

            onUpdateUserState({ ...userState, exp: userState.exp + gainedExp, clearedStageIds: newClearedIds });

            if (mergedDrops.length > 0) {
                const newInv = [...inventory];
                mergedDrops.forEach(d => { const exist = newInv.find(i => i.id === d.id); if (exist) exist.count += d.count; else newInv.push(d); });
                onUpdateInventory(newInv);
            }

            setResultData({ type: 'VICTORY', mvp, rewards: { credits: gainedCredits, exp: gainedExp, items: mergedDrops }, metrics, finalAllies: allFinalAllies });
            setPhase('COMBAT_RESULT');
        } else {
            setAccumulatedDrops([]);
            setTimeout(() => setPhase('DEFEAT'), 100);
        }
    };

    const handleNextStep = () => {
        // Logic split based on intent
        if (activeMode === 'DAILY') {
            setPhase('MODE_SELECT');
            return;
        }

        if (!activeMap) return;

        const newNodes = [...generatedNodes];
        // Check current index bounds to prevent error
        if (currentNodeIndex < newNodes.length) {
            newNodes[currentNodeIndex].isCleared = true;
            setGeneratedNodes(newNodes);
        }

        // Check if we are at the end
        if (currentNodeIndex >= generatedNodes.length - 1) {
            setPhase('MODE_SELECT');
        } else {
            // Advance Node
            const nextIdx = currentNodeIndex + 1;
            setCurrentNodeIndex(nextIdx);
            const nextNodes = [...newNodes];
            nextNodes[nextIdx].isLocked = false;
            setGeneratedNodes(nextNodes);
            setPhase('MAP_PROGRESSION');
        }
    };

    const handleSweep = () => {
        if (!activeMap || !userState.clearedStageIds.includes(activeMap.id)) return;
        const totalCost = activeMap.staminaCost * sweepCount;
        if (userState.stamina < totalCost) return alert("體力不足");

        const { items: sweepItems, credits: sweepCredits, exp: sweepExp } = calculateDrops({ type: 'RAID', map: activeMap }, sweepCount);

        const mergedDrops: InventoryItem[] = [];
        sweepItems.forEach(d => {
            const exist = mergedDrops.find(m => m.id === d.id);
            if (exist) exist.count += d.count; else mergedDrops.push({ ...d });
        });
        if (sweepCredits > 0) mergedDrops.push({ ...SHOP_ITEMS.find(i => i.id === 'currency_credit')!, count: sweepCredits });

        onUpdateUserState({ ...userState, stamina: userState.stamina - totalCost, exp: userState.exp + sweepExp });
        const newInv = [...inventory];
        mergedDrops.forEach(d => { const exist = newInv.find(i => i.id === d.id); if (exist) exist.count += d.count; else newInv.push(d); });
        onUpdateInventory(newInv);

        setShowSweepModal(false);
        setResultData({ type: 'SWEEP', mvp: null, rewards: { credits: sweepCredits, exp: sweepExp, items: mergedDrops }, metrics: {}, finalAllies: [] });
        setPhase('COMBAT_RESULT');
    };

    const maxSweeps = activeMap ? Math.floor(userState.stamina / activeMap.staminaCost) : 0;

    return (
        <div className="relative w-full h-full bg-gray-950 text-white flex flex-col font-sans overflow-hidden">
            {phase !== 'COMBAT_ENCOUNTER' && phase !== 'COMBAT_RESULT' && (
                <div className="h-16 px-6 bg-gray-900/90 backdrop-blur-md border-b border-red-900/50 flex justify-between items-center z-20 shrink-0 shadow-[0_5px_20px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
                        <h1 className="text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600 tracking-widest uppercase flex items-center gap-2"><span className="text-3xl">⚠️</span> 星際討伐系統 (RAID)</h1>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-xs font-mono text-red-400/60"><span className="animate-pulse">威脅等級：極高 (CRITICAL)</span><span>|</span><span>區域掃描中...</span></div>
                </div>
            )}

            {phase === 'MODE_SELECT' && (
                <div className="flex-1 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    <div className="flex flex-col md:flex-row gap-8 z-10">
                        <button onClick={() => { setActiveMode('RAID'); setPhase('SQUAD_SELECT'); setSelectedMapId(null); }} className="group w-72 h-[400px] bg-red-900/10 hover:bg-red-900/30 border-2 border-red-800 hover:border-red-500 rounded-3xl flex flex-col items-center justify-center transition-all hover:scale-105 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-red-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <h2 className="text-4xl font-black text-red-500 mb-2 tracking-tighter group-hover:text-white transition-colors z-10">討伐行動</h2>
                            <p className="text-red-300/60 font-mono text-sm z-10">高風險 // 高回報</p>
                            <div className="mt-8 text-6xl opacity-50 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-500">☠️</div>
                        </button>
                        <button onClick={() => { setActiveMode('DAILY'); setPhase('SQUAD_SELECT'); setSelectedDailyStageId(null); }} className="group w-72 h-[400px] bg-blue-900/10 hover:bg-blue-900/30 border-2 border-blue-800 hover:border-blue-500 rounded-3xl flex flex-col items-center justify-center transition-all hover:scale-105 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <h2 className="text-4xl font-black text-blue-500 mb-2 tracking-tighter group-hover:text-white transition-colors z-10">日常特訓</h2>
                            <p className="text-blue-300/60 font-mono text-sm z-10">資源獲取 // 經驗累積</p>
                            <div className="mt-8 text-6xl opacity-50 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-500">⚡</div>
                        </button>
                    </div>
                </div>
            )}

            {phase === 'SQUAD_SELECT' && (
                <div className="flex-1 flex flex-col relative min-h-0">
                    <RaidSelector
                        activeMode={activeMode}
                        selectedUniverse={selectedUniverse}
                        selectedRegionId={selectedRegionId}
                        selectedMapId={selectedMapId}
                        selectedDailyStageId={selectedDailyStageId}
                        clearedStageIds={userState.clearedStageIds}
                        enemyImages={enemyImages}
                        regionImages={regionImages}
                        onSetMode={setActiveMode}
                        onSetUniverse={setSelectedUniverse}
                        onSelectRegion={(id) => { setSelectedRegionId(id); setSelectedMapId(null); }}
                        onSelectMap={setSelectedMapId}
                        onSelectDaily={setSelectedDailyStageId}
                    />

                    {(selectedMapId || selectedDailyStageId) && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                            <SquadPrepModal
                                activeMode={activeMode}
                                map={activeMap || null}
                                daily={activeDaily || null}
                                difficulty={selectedDifficulty}
                                characters={characters}
                                customAvatars={customAvatars}
                                enemyImages={enemyImages}
                                squadIds={squadIds}
                                setSquadIds={setSquadIds}
                                onStart={() => { if (squadIds.length > 0) { if (activeMode === 'RAID') startRaid(); else handleEnterNode(); } else alert("請選擇隊員"); }}
                                onSweep={() => setShowSweepModal(true)}
                                onClose={() => { setSelectedMapId(null); setSelectedDailyStageId(null); setSquadIds([]); }}
                                isCleared={activeMode === 'RAID' && activeMap ? userState.clearedStageIds.includes(activeMap.id) : false}
                            />
                        </div>
                    )}
                </div>
            )}

            {phase === 'MAP_PROGRESSION' && activeMap && (
                <>
                    <MapOverlay nodes={generatedNodes} currentNodeIndex={currentNodeIndex} onNodeClick={(idx) => { if (idx === currentNodeIndex) handleEnterNode(); }} backgroundImage={mapImages[activeMap.id] || activeMap.imageUrl} />
                    {accumulatedDrops.length > 0 && <div className="fixed top-20 right-6 z-50 bg-black/60 backdrop-blur border border-yellow-500/50 rounded-lg p-2 flex items-center gap-2 text-yellow-400 text-xs font-bold animate-pulse"><span>🎒</span> 暫存: {accumulatedDrops.length} 物品</div>}
                </>
            )}

            {phase === 'COMBAT_ENCOUNTER' && (
                <BattleEngine key={battleId} allies={battleAllies} enemies={battleEnemies} backgroundUrl={battleBg} onBattleEnd={handleBattleEnd} gameSpeed={gameSpeed} setGameSpeed={setGameSpeed} isAuto={isAuto} setIsAuto={setIsAuto} enemyImages={enemyImages} ultImages={ultImages} inventory={inventory} staminaCost={activeMap ? activeMap.staminaCost : (dailyDiff ? dailyDiff.staminaCost : 0)} onRetreat={handleRetreat} initialStatuses={nextBattleStatuses} />
            )}

            {(phase === 'PRE_BATTLE_DIALOGUE' || phase === 'EVENT_RESOLUTION') && (
                <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-8">
                    <div className="bg-gray-900 border border-gray-700 p-8 rounded-2xl max-w-2xl w-full text-center">
                        <h2 className="text-2xl font-black mb-4 text-white tracking-widest uppercase">{phase === 'PRE_BATTLE_DIALOGUE' ? '遭遇' : '結果'}</h2>
                        <p className="text-lg text-gray-300 leading-relaxed mb-8 whitespace-pre-wrap font-medium">{phase === 'PRE_BATTLE_DIALOGUE' ? narrative : eventResolutionText}</p>
                        <button onClick={() => phase === 'PRE_BATTLE_DIALOGUE' ? setPhase('COMBAT_ENCOUNTER') : handleNextStep()} className="w-full py-4 bg-white text-black font-black rounded-sm hover:bg-gray-200 transition-colors">繼續</button>
                    </div>
                </div>
            )}

            {phase === 'EVENT_ENCOUNTER' && currentEvent && (
                <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-8">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row">
                        <div className="md:w-1/3 bg-gray-800 relative"><img src={`https://pollinations.ai/p/${encodeURIComponent(currentEvent.imagePrompt)}`} className="w-full h-full object-cover opacity-50" /></div>
                        <div className="md:w-2/3 p-8"><h2 className="text-2xl font-bold text-yellow-400 mb-2">{currentEvent.title}</h2><p className="text-gray-300 mb-6">{currentEvent.description}</p><div className="space-y-3">{currentEvent.choices.map((choice, idx) => (<button key={idx} onClick={() => handleEventChoice(choice)} className="w-full p-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl text-left transition-colors"><div className="font-bold text-white">{choice.label}</div></button>))}</div></div>
                    </div>
                </div>
            )}

            {sectorClearedDrops !== null && (
                <div className="absolute inset-0 z-[190] flex flex-col items-center justify-center pointer-events-none">
                    <div className="bg-black/90 backdrop-blur-md px-12 py-8 border-y-4 border-green-500 transform skew-x-12 animate-slide-in-right flex flex-col items-center gap-4 shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                        <h2 className="text-4xl font-black text-green-500 italic uppercase tracking-widest">Sector Secured</h2>
                        <div className="flex gap-4 transform -skew-x-12 mt-2">{sectorClearedDrops.map((item, idx) => (<div key={idx} className="flex flex-col items-center animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}><div className="w-12 h-12 bg-gray-800 rounded-lg border border-gray-600 flex items-center justify-center text-2xl shadow-lg">{item.icon}</div><span className="text-xs text-gray-300 font-bold mt-1">x{item.count}</span></div>))}</div>
                    </div>
                </div>
            )}

            {phase === 'COMBAT_RESULT' && resultData && (
                <BattleSettlement
                    resultType={resultData.type} mvpData={resultData.mvp} allies={resultData.finalAllies} metrics={resultData.metrics}
                    rewards={resultData.rewards} characters={characters} customAvatars={customAvatars} ultImages={ultImages}
                    onContinue={handleNextStep}
                />
            )}

            {showSweepModal && activeMap && (
                <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-blue-500 w-full max-w-md p-6 rounded-2xl shadow-2xl relative">
                        <button onClick={() => setShowSweepModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
                        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><span className="text-blue-500">⚡</span> 快速掃蕩</h3>
                        <div className="bg-gray-800 p-4 rounded-lg mb-6">
                            <div className="flex justify-between text-sm text-gray-300 mb-2"><span>掃蕩次數: <span className="text-white font-bold text-lg">{sweepCount}</span></span><span className="text-gray-500">最大: {maxSweeps}</span></div>
                            <input type="range" min="1" max={Math.max(1, maxSweeps)} value={sweepCount} onChange={(e) => setSweepCount(parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                            <div className="flex justify-between mt-4 text-xs"><div className="text-center"><div className="text-gray-500">消耗體力</div><div className="text-red-400 font-bold text-lg">-{activeMap.staminaCost * sweepCount}</div></div><div className="text-center"><div className="text-gray-500">剩餘體力</div><div className={`${userState.stamina < activeMap.staminaCost * sweepCount ? 'text-red-600' : 'text-green-400'} font-bold text-lg`}>{userState.stamina} → {userState.stamina - (activeMap.staminaCost * sweepCount)}</div></div></div>
                        </div>
                        <button onClick={handleSweep} disabled={maxSweeps === 0} className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-lg transition-colors shadow-lg">確認執行</button>
                    </div>
                </div>
            )}

            {phase === 'DEFEAT' && (
                <div className="absolute inset-0 z-[200] bg-red-950 flex flex-col items-center justify-center animate-fade-in font-mono">
                    <div className="absolute inset-0 bg-black opacity-80"></div>
                    <div className="relative z-10 flex flex-col items-center max-w-3xl w-full px-4">
                        <h1 className="text-6xl md:text-8xl font-black text-red-600 tracking-tighter mb-4 animate-pulse drop-shadow-[0_0_25px_rgba(220,38,38,0.8)]">MISSION FAILED</h1>
                        <p className="text-red-300 text-lg mb-12 tracking-[0.5em] uppercase">物資遺失 // 全員撤離</p>
                        <button onClick={() => { handleRetreat(); setPhase('MODE_SELECT'); }} className="px-12 py-4 border-2 border-white/20 hover:border-white text-gray-400 hover:text-white font-bold tracking-widest uppercase rounded-full transition-all hover:bg-white/5">返回基地 (Return to Base)</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CombatZone;