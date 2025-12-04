import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
    Character, UserState, InventoryItem, SavedStory,
    ImageGenerationSettings, TextGenerationSettings,
    UserStatistics, AffectionMap,
    FacilityConfig, FacilityState, ShowcaseSlot, HomeState,
    ExpeditionMap, ActiveExpedition,
    ShopItem,
    DailyStage, RaidMap,
    CombatUnit,
    SkillConfig,
    MemoryMap, DiaryMap, Memory, DiaryEntry // NEW Imports
} from '../types';
import { initDB, saveAvatarToDB, getAllAvatarsFromDB, saveDashboardImageToDB, saveUltImageToDB, getAllMapImagesFromDB, getAllEnemyImagesFromDB, getAllItemImagesFromDB, getGameData, saveGameData, migrateLocalStorageToIDB, saveMapImageToDB, saveEnemyImageToDB, saveItemImageToDB, saveRegionImageToDB, getAllRegionImagesFromDB } from '../services/dbService';
import { CHARACTERS } from '../data/characters';
import { SHOP_ITEMS } from '../data/items';
import { FACILITIES } from '../data/facilities';

const DEFAULT_IMAGE_SETTINGS: ImageGenerationSettings = {
    provider: 'runpod',
    customUrl: '',
    customApiKey: '',
    generationMode: 'quality',
    runpodLoraStrength: 1.0
};

const DEFAULT_TEXT_SETTINGS: TextGenerationSettings = {
    provider: 'custom',
    customBaseUrl: 'https://openrouter.ai/api/v1',
    customApiKey: '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',
    customModelName: 'google/gemini-2.0-flash-exp:free'
};



const DEFAULT_STATISTICS: UserStatistics = {
    totalLogins: 1,
    battlesWon: 0,
    enemiesDefeated: 0,
    creditsSpent: 0,
    gachaPulls: 0,
    expeditionsCompleted: 0,
    giftsSent: 0,
    chatInteractions: 0,
    itemsCrafted: 0
};

// Generate All Characters Unlocked State
const generateAllUnlockedState = () => {
    const progression: Record<string, any> = {};
    const ids = CHARACTERS.map(c => c.id);
    ids.forEach(id => {
        progression[id] = { level: 80, exp: 0, ascension: 6, unlockedTraces: [`${id}_core`] };
    });
    return { ids, progression };
};

const { ids: ALL_CHAR_IDS, progression: ALL_CHAR_PROGRESSION } = generateAllUnlockedState();

const DEFAULT_USER_STATE: UserState = {
    level: 60, exp: 0, maxExp: 100, stamina: 240, maxStamina: 240, lastStaminaRegen: Date.now(),
    starJade: 16000, starlight: 0,
    ownedCharacterIds: ALL_CHAR_IDS,
    characterProgression: ALL_CHAR_PROGRESSION,
    clearedStageIds: [], mapExploration: {}, isTutorialDone: true,

    // NEW
    statistics: DEFAULT_STATISTICS,
    claimedQuestIds: [],
    lastLoginDate: new Date().toISOString().split('T')[0]
};

const DEFAULT_INVENTORY: InventoryItem[] = [
    { ...SHOP_ITEMS.find(i => i.id === 'wp_firefly_ssr')!, count: 1 },
    { ...SHOP_ITEMS.find(i => i.id === 'wp_kafka_ssr')!, count: 1 },
    { ...SHOP_ITEMS.find(i => i.id === 'wp_acheron_ssr')!, count: 1 },
    { ...SHOP_ITEMS.find(i => i.id === 'wp_raiden_ssr')!, count: 1 },
    { ...SHOP_ITEMS.find(i => i.id === 'wp_staff_sr')!, count: 5 },
    { ...SHOP_ITEMS.find(i => i.id === 'wp_pistol_sr')!, count: 5 },
    { ...SHOP_ITEMS.find(i => i.id === 'wp_sword_sr')!, count: 5 },
    { ...SHOP_ITEMS.find(i => i.id === 'exp_book_purple')!, count: 100 },
    { ...SHOP_ITEMS.find(i => i.id === 'currency_credit')!, count: 1000000 }
];

const DEFAULT_HOME_STATE: HomeState = {
    facilities: [{ id: 'lobby', level: 1, assignedCharId: null }],
    showcase: [{ id: 'slot_1', unlocked: true }, { id: 'slot_2', unlocked: true }, { id: 'slot_3', unlocked: true }],
    lastCollected: new Date().toISOString()
};

const INITIAL_PRESET_EQUIPMENT = {
    'firefly': { weaponId: 'wp_firefly_ssr' },
    'kafka': { weaponId: 'wp_kafka_ssr' },
    'acheron': { weaponId: 'wp_acheron_ssr' },
    'raiden': { weaponId: 'wp_raiden_ssr' }
};

interface GameContextType {
    // ... (Existing props)
    isDataLoaded: boolean;
    imageSettings: ImageGenerationSettings;
    setImageSettings: React.Dispatch<React.SetStateAction<ImageGenerationSettings>>;
    textSettings: TextGenerationSettings;
    setTextSettings: React.Dispatch<React.SetStateAction<TextGenerationSettings>>;
    // Core State
    userState: UserState;
    setUserState: React.Dispatch<React.SetStateAction<UserState>>;
    credits: number;
    setCredits: React.Dispatch<React.SetStateAction<number>>;
    inventory: InventoryItem[];
    setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    customCharactersList: Character[];
    setCustomCharactersList: React.Dispatch<React.SetStateAction<Character[]>>;
    favorites: string[];
    setFavorites: React.Dispatch<React.SetStateAction<string[]>>;
    affectionMap: AffectionMap;
    setAffectionMap: React.Dispatch<React.SetStateAction<AffectionMap>>;

    // NEW: Memory & Diary State
    memoriesMap: MemoryMap;
    setMemoriesMap: React.Dispatch<React.SetStateAction<MemoryMap>>;
    diariesMap: DiaryMap;
    setDiariesMap: React.Dispatch<React.SetStateAction<DiaryMap>>;
    addMemory: (charId: string, text: string, type: 'fact' | 'event' | 'preference', importance?: number) => Promise<void>;
    addDiaryEntry: (charId: string, entry: DiaryEntry) => Promise<void>;

    homeState: HomeState;
    setHomeState: React.Dispatch<React.SetStateAction<HomeState>>;
    activeExpeditions: ActiveExpedition[];
    setActiveExpeditions: React.Dispatch<React.SetStateAction<ActiveExpedition[]>>;
    library: SavedStory[];
    setLibrary: React.Dispatch<React.SetStateAction<SavedStory[]>>;
    presetEquipment: { [charId: string]: any };
    setPresetEquipment: React.Dispatch<React.SetStateAction<{ [charId: string]: any }>>;
    dashboardGirlIds: string[];
    setDashboardGirlIds: React.Dispatch<React.SetStateAction<string[]>>;

    // Image State
    customAvatars: { [key: string]: string };
    dashboardImages: { [key: string]: string };
    ultImages: { [key: string]: string };
    mapImages: { [key: string]: string };
    enemyImages: { [key: string]: string };
    itemImages: { [key: string]: string };

    // Image Actions
    updateAvatar: (charId: string, dataUrl: string) => Promise<void>;
    updateDashboardImage: (charId: string, dataUrl: string) => Promise<void>;
    updateUltImage: (charId: string, dataUrl: string) => Promise<void>;
    updateMapImage: (id: string, file: File) => Promise<void>;
    updateEnemyImage: (id: string, file: File) => Promise<void>;
    updateItemImage: (id: string, file: File) => Promise<void>;

    // LoRA Support
    customLoras: { [key: string]: string };
    updateCustomLora: (charId: string, loraTag: string) => Promise<void>;
    customLoraTriggers: { [key: string]: string }; // New Trigger Words State
    updateCustomLoraTrigger: (charId: string, trigger: string) => Promise<void>;

    // Derived Data
    mergedCharacters: Character[];
    ownedCharacters: Character[];

    // Helpers
    addCustomCharacter: (char: Character) => void;
    updateAffection: (charId: string, newScore: number) => void;
    trackStat: (key: keyof UserStatistics, value: number) => void; // NEW
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [imageSettings, setImageSettings] = useState<ImageGenerationSettings>(DEFAULT_IMAGE_SETTINGS);
    const [textSettings, setTextSettings] = useState<TextGenerationSettings>(DEFAULT_TEXT_SETTINGS);

    // Core Data
    const [userState, setUserState] = useState<UserState>(DEFAULT_USER_STATE);
    const [credits, setCredits] = useState<number>(2000000);
    const [inventory, setInventory] = useState<InventoryItem[]>(DEFAULT_INVENTORY);
    const [customCharactersList, setCustomCharactersList] = useState<Character[]>([]);
    const [favorites, setFavorites] = useState<string[]>([]);

    // Initialize high affection for testing
    const initialAffection = useMemo(() => {
        const map: AffectionMap = {};
        CHARACTERS.forEach(c => map[c.id] = 500);
        return map;
    }, []);
    const [affectionMap, setAffectionMap] = useState<AffectionMap>(initialAffection);

    const [homeState, setHomeState] = useState<HomeState>(DEFAULT_HOME_STATE);
    const [activeExpeditions, setActiveExpeditions] = useState<ActiveExpedition[]>([]);
    const [library, setLibrary] = useState<SavedStory[]>([]);
    const [presetEquipment, setPresetEquipment] = useState<{ [charId: string]: any }>(INITIAL_PRESET_EQUIPMENT);
    const [dashboardGirlIds, setDashboardGirlIds] = useState<string[]>([]);

    // Images
    const [customAvatars, setCustomAvatars] = useState<{ [key: string]: string }>({});
    const [customLoras, setCustomLoras] = useState<{ [key: string]: string }>({}); // New LoRA State
    const [customLoraTriggers, setCustomLoraTriggers] = useState<{ [key: string]: string }>({}); // New Trigger Words State
    const [dashboardImages, setDashboardImages] = useState<{ [key: string]: string }>({});
    const [ultImages, setUltImages] = useState<{ [key: string]: string }>({});
    const [mapImages, setMapImages] = useState<{ [key: string]: string }>({});
    const [enemyImages, setEnemyImages] = useState<{ [key: string]: string }>({});
    const [itemImages, setItemImages] = useState<{ [key: string]: string }>({});

    // NEW: Memory & Diary State
    const [memoriesMap, setMemoriesMap] = useState<MemoryMap>({});
    const [diariesMap, setDiariesMap] = useState<DiaryMap>({});

    // Initialization
    useEffect(() => {
        const init = async () => {
            try {
                await initDB();
                await migrateLocalStorageToIDB();

                // Load Images
                const allImages = await getAllAvatarsFromDB();
                const avatars: { [key: string]: string } = {};
                const dashImgs: { [key: string]: string } = {};
                const ultImgs: { [key: string]: string } = {};
                Object.entries(allImages).forEach(([key, value]) => {
                    if (key.startsWith('dashboard_')) dashImgs[key.replace('dashboard_', '')] = value;
                    else if (key.startsWith('ult_')) ultImgs[key.replace('ult_', '')] = value;
                    else avatars[key] = value;
                });
                setCustomAvatars(avatars);
                setDashboardImages(dashImgs);
                setUltImages(ultImgs);
                setMapImages(await getAllMapImagesFromDB());
                setEnemyImages(await getAllEnemyImagesFromDB());
                setItemImages(await getAllItemImagesFromDB());

                const loadedSettings = await getGameData<ImageGenerationSettings>('image_settings');
                if (loadedSettings) {

                    setImageSettings(loadedSettings);
                } else {
                    setImageSettings(DEFAULT_IMAGE_SETTINGS);
                }

                const loadedTextSettings = await getGameData<TextGenerationSettings>('text_settings');
                if (loadedTextSettings) {
                    // FORCE MIGRATION: Switch to Grok 4.1 Fast Free if currently using Gemini OR other models
                    if (loadedTextSettings.provider === 'gemini' ||
                        loadedTextSettings.customModelName?.includes('google/gemini')) {

                        console.log("Migrating Text Settings to Grok 4.1 Fast Free...");
                        setTextSettings(DEFAULT_TEXT_SETTINGS);
                    } else {
                        setTextSettings(loadedTextSettings);
                    }
                } else {
                    setTextSettings(DEFAULT_TEXT_SETTINGS);
                }

                // Load LoRAs
                const loadedLoras = await getGameData<{ [key: string]: string }>('custom_loras');
                if (loadedLoras) setCustomLoras(loadedLoras);

                const loadedTriggers = await getGameData<{ [key: string]: string }>('custom_lora_triggers');
                if (loadedTriggers) {
                    setCustomLoraTriggers(loadedTriggers);
                } else {
                    // Default Triggers for known characters
                    setCustomLoraTriggers({});
                }

                // Load Data
                const loadedUserState = await getGameData<UserState>('user_state');
                if (loadedUserState) {
                    // Migration Logic for new features
                    if (!loadedUserState.characterProgression) loadedUserState.characterProgression = {};
                    if (loadedUserState.starlight === undefined) loadedUserState.starlight = 0;
                    if (!loadedUserState.statistics) loadedUserState.statistics = DEFAULT_STATISTICS;
                    if (!loadedUserState.claimedQuestIds) loadedUserState.claimedQuestIds = [];

                    // Login Check
                    const today = new Date().toISOString().split('T')[0];
                    if (loadedUserState.lastLoginDate !== today) {
                        loadedUserState.lastLoginDate = today;
                        loadedUserState.statistics.totalLogins = (loadedUserState.statistics.totalLogins || 0) + 1;
                        // Reset daily claimed quest IDs (Assuming format 'daily_xxx')
                        loadedUserState.claimedQuestIds = loadedUserState.claimedQuestIds.filter(id => !id.startsWith('daily_'));
                    }

                    // FORCE UNLOCK ALL CHARACTERS FOR TESTING
                    const allCharIds = CHARACTERS.map(c => c.id);
                    allCharIds.forEach(id => {
                        if (!loadedUserState.ownedCharacterIds.includes(id)) {
                            loadedUserState.ownedCharacterIds.push(id);
                            loadedUserState.characterProgression[id] = { level: 80, exp: 0, ascension: 6, unlockedTraces: [`${id} _core`] };
                        }
                    });

                    loadedUserState.isTutorialDone = true;
                    setUserState(loadedUserState);
                }

                const loadedFavorites = await getGameData<string[]>('favorite_chars'); if (loadedFavorites) setFavorites(loadedFavorites);
                const loadedLibrary = await getGameData<SavedStory[]>('story_library'); if (loadedLibrary) setLibrary(loadedLibrary);
                const loadedCustomChars = await getGameData<Character[]>('custom_characters'); if (loadedCustomChars) setCustomCharactersList(loadedCustomChars);
                const loadedCredits = await getGameData<number>('user_credits'); if (loadedCredits !== null) setCredits(loadedCredits);
                const loadedInventory = await getGameData<InventoryItem[]>('user_inventory'); if (loadedInventory) setInventory(loadedInventory);
                const loadedDashboardIds = await getGameData<string[]>('dashboard_girl_ids'); if (loadedDashboardIds) setDashboardGirlIds(loadedDashboardIds);
                const loadedHomeState = await getGameData<HomeState>('home_state'); if (loadedHomeState) setHomeState(loadedHomeState);
                const loadedAffection = await getGameData<AffectionMap>('affection_map') || {};
                // FORCE OVERRIDE: Set all characters to 500 affection as requested
                const forcedAffectionMap: AffectionMap = { ...loadedAffection };

                // 1. Update known characters
                CHARACTERS.forEach(c => {
                    forcedAffectionMap[c.id] = 500;
                });

                // 2. Update any other keys found in the saved data (to cover custom chars or mismatches)
                Object.keys(forcedAffectionMap).forEach(key => {
                    forcedAffectionMap[key] = 500;
                });

                // 3. Update loaded custom characters (in case they are not in the map yet)
                if (loadedCustomChars) {
                    loadedCustomChars.forEach(c => {
                        forcedAffectionMap[c.id] = 500;
                    });
                }

                console.log("Force updated affection map:", forcedAffectionMap);
                setAffectionMap(forcedAffectionMap);
                const loadedExpeditions = await getGameData<ActiveExpedition[]>('active_expeditions'); if (loadedExpeditions) setActiveExpeditions(loadedExpeditions);
                const loadedPreset = await getGameData<any>('preset_equipment'); if (loadedPreset) setPresetEquipment(loadedPreset);

                // Load Memory & Diary
                const loadedMemories = await getGameData<MemoryMap>('memories_map'); if (loadedMemories) setMemoriesMap(loadedMemories);
                const loadedDiaries = await getGameData<DiaryMap>('diaries_map'); if (loadedDiaries) setDiariesMap(loadedDiaries);

                setIsDataLoaded(true);
            } catch (e) {
                console.error("Initialization Failed", e);
            }
        };
        init();
    }, []);

    // Persistence Effects
    useEffect(() => { if (isDataLoaded) saveGameData('image_settings', imageSettings); }, [imageSettings, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) saveGameData('text_settings', textSettings); }, [textSettings, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) saveGameData('user_state', userState); }, [userState, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) saveGameData('favorite_chars', favorites); }, [favorites, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) saveGameData('story_library', library); }, [library, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) saveGameData('custom_characters', customCharactersList); }, [customCharactersList, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) saveGameData('user_credits', credits); }, [credits, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) saveGameData('user_inventory', inventory); }, [inventory, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) saveGameData('dashboard_girl_ids', dashboardGirlIds); }, [dashboardGirlIds, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) saveGameData('home_state', homeState); }, [homeState, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) saveGameData('affection_map', affectionMap); }, [affectionMap, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) saveGameData('active_expeditions', activeExpeditions); }, [activeExpeditions, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) saveGameData('preset_equipment', presetEquipment); }, [presetEquipment, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) saveGameData('memories_map', memoriesMap); }, [memoriesMap, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) saveGameData('diaries_map', diariesMap); }, [diariesMap, isDataLoaded]);

    // Image Handlers
    const updateAvatar = async (charId: string, dataUrl: string) => { setCustomAvatars(prev => ({ ...prev, [charId]: dataUrl })); await saveAvatarToDB(charId, dataUrl); };
    const updateDashboardImage = async (charId: string, dataUrl: string) => { setDashboardImages(prev => ({ ...prev, [charId]: dataUrl })); await saveDashboardImageToDB(charId, dataUrl); };
    const updateUltImage = async (charId: string, dataUrl: string) => { setUltImages(prev => ({ ...prev, [charId]: dataUrl })); await saveUltImageToDB(charId, dataUrl); };
    const updateMapImage = async (id: string, file: File) => {
        const reader = new FileReader(); reader.onload = async (e) => { if (e.target?.result) { const url = e.target!.result as string; setMapImages(prev => ({ ...prev, [id]: url })); await saveMapImageToDB(id, url); } }; reader.readAsDataURL(file);
    };
    const updateEnemyImage = async (id: string, file: File) => {
        const reader = new FileReader(); reader.onload = async (e) => { if (e.target?.result) { const url = e.target!.result as string; setEnemyImages(prev => ({ ...prev, [id]: url })); await saveEnemyImageToDB(id, url); } }; reader.readAsDataURL(file);
    };
    const updateItemImage = async (id: string, file: File) => {
        const reader = new FileReader(); reader.onload = async (e) => { if (e.target?.result) { const url = e.target!.result as string; setItemImages(prev => ({ ...prev, [id]: url })); await saveItemImageToDB(id, url); } }; reader.readAsDataURL(file);
    };

    // Derived Data
    const mergedCharacters = useMemo(() => {
        return [...customCharactersList, ...CHARACTERS].map(c => {
            const preset = presetEquipment[c.id] || {};
            return { ...c, equipment: preset };
        });
    }, [customCharactersList, presetEquipment]);

    const ownedCharacters = useMemo(() => mergedCharacters.filter(c => userState.ownedCharacterIds.includes(c.id)), [mergedCharacters, userState.ownedCharacterIds]);

    // Helpers
    const addCustomCharacter = (char: Character) => setCustomCharactersList(prev => [...prev, char]);
    const updateAffection = async (charId: string, newScore: number) => {
        const newMap = { ...affectionMap, [charId]: newScore };
        setAffectionMap(newMap);
        await saveGameData('affection_map', newMap);
    };

    // LoRA Update Handler
    const updateCustomLora = async (charId: string, loraTag: string) => {
        const newLoras = { ...customLoras, [charId]: loraTag };
        setCustomLoras(newLoras);
        await saveGameData('custom_loras', newLoras);
    };

    const updateCustomLoraTrigger = async (charId: string, trigger: string) => {
        const newTriggers = { ...customLoraTriggers, [charId]: trigger };
        setCustomLoraTriggers(newTriggers);
        await saveGameData('custom_lora_triggers', newTriggers);
    };

    const trackStat = async (key: keyof UserStatistics, value: number) => {
        const newStats = { ...userState.statistics, [key]: (userState.statistics?.[key] || 0) + value };
        const newState = { ...userState, statistics: newStats };
        setUserState(newState);
        await saveGameData('user_state', newState);
    };

    // Memory Helpers
    const addMemory = async (charId: string, text: string, type: 'fact' | 'event' | 'preference', importance: number = 1) => {
        const newMemory: Memory = {
            id: Date.now().toString(),
            text,
            type,
            timestamp: Date.now(),
            importance
        };
        const newMap = { ...memoriesMap, [charId]: [...(memoriesMap[charId] || []), newMemory] };
        setMemoriesMap(newMap);
        await saveGameData('memories_map', newMap);
    };

    const addDiaryEntry = async (charId: string, entry: DiaryEntry) => {
        const newMap = { ...diariesMap, [charId]: [entry, ...(diariesMap[charId] || [])] };
        setDiariesMap(newMap);
        await saveGameData('diaries_map', newMap);
    };

    return (
        <GameContext.Provider value={{
            isDataLoaded,
            imageSettings, setImageSettings,
            textSettings, setTextSettings,
            userState, setUserState,
            credits, setCredits,
            inventory, setInventory,
            customCharactersList, setCustomCharactersList,
            favorites, setFavorites,
            affectionMap, setAffectionMap,
            homeState, setHomeState,
            activeExpeditions, setActiveExpeditions,
            library, setLibrary,
            presetEquipment, setPresetEquipment,
            dashboardGirlIds, setDashboardGirlIds,

            customAvatars, dashboardImages, ultImages, mapImages, enemyImages, itemImages,
            updateAvatar, updateDashboardImage, updateUltImage, updateMapImage, updateEnemyImage, updateItemImage,

            customLoras, updateCustomLora, // Export LoRA handlers
            customLoraTriggers, updateCustomLoraTrigger,

            mergedCharacters, ownedCharacters,
            addCustomCharacter, updateAffection, trackStat,
            memoriesMap, setMemoriesMap, diariesMap, setDiariesMap, addMemory, addDiaryEntry
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error("useGame must be used within a GameProvider");
    }
    return context;
};
