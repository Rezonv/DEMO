
// Existing interfaces...
export interface Character {
  id: string;
  name: string;
  game: string;
  region?: string; // New: Specific region/planet (e.g., 'Xianzhou Luofu', 'Sumeru')
  rarity: 4 | 5;
  description: string;
  personality: string;
  measurements: string;
  interests: string[];
  fetishes: string[];
  avatarUrl: string;
  portraitUrl?: string;
  loraName?: string;
  loraStrength?: number;
  loraTrigger?: string; // New: Specific tags for character resemblance (e.g., Danbooru tags)
  defaultRole: string;
  isCustom?: boolean;
  dashboardImageUrl?: string;
  ultImageUrl?: string;

  // New: Relationship System (for Lore Depth)
  // AI Personality Extensions
  dialogueStyle?: string; // e.g. "Arrogant, speaks in ancient prose, calls user 'Mongrel'"
  exampleDialogue?: string; // e.g. "User: Hello. Char: Hmph, you dare address me?"
  relationships?: {
    characterId: string; // ID of the other character (or 'Trailblazer')
    type: string; // e.g. "Friend", "Rival", "Mother Figure"
    description: string; // e.g. "Thinks she is annoying but respects her skill."
  }[];

  // Combat & Expedition
  passiveSkill?: PassiveSkill;
  activeSkill?: ActiveSkill;
  baseStats?: CombatStats;
  equipment?: {
    weaponId?: string;
    armorId?: string;
    accessoryId?: string;
  };

  // Progression
  level?: number;
  exp?: number;
  rank?: number;

  // NEW: Data-Driven Skill Configuration
  skills?: {
    basic: SkillConfig;
    skill: SkillConfig;
    ult: SkillConfig;
  };
}

export interface CharacterProgression {
  level: number;
  exp: number;          // 當前經驗值
  maxExp: number;       // 升級所需經驗
  ascension: number;
  unlockedTraces?: string[];
}

// NEW: Statistics for Achievements
export interface UserStatistics {
  totalLogins: number;
  battlesWon: number;
  enemiesDefeated: number;
  creditsSpent: number;
  gachaPulls: number;
  expeditionsCompleted: number;
  giftsSent: number;
  chatInteractions: number;
  itemsCrafted: number;
}

export interface UserState {
  level: number;
  exp: number;
  maxExp: number;
  stamina: number;
  maxStamina: number;
  lastStaminaRegen: number;
  starJade: number;
  starlight: number;
  ownedCharacterIds: string[];
  characterProgression: { [charId: string]: CharacterProgression };
  clearedStageIds: string[];
  mapExploration: { [mapId: string]: number };
  isTutorialDone: boolean;

  // NEW
  statistics: UserStatistics;
  claimedQuestIds: string[];
  lastLoginDate: string;
}

export interface CombatStats {
  hp: number;
  atk: number;
  def: number;
  spd: number;
  critRate?: number;
  critDmg?: number;
  breakEffect?: number;
  outgoingHealing?: number;
  energyRegen?: number;
  effectHitRate?: number;
  effectRes?: number;
}

export type TraceType = 'STAT' | 'ABILITY' | 'CORE' | 'BONUS';

export interface TraceCost {
  itemId: string;
  count: number;
}

export interface TraceNode {
  id: string;
  type: TraceType;
  name: string;
  description?: string;
  icon?: string;
  x: number;
  y: number;
  dependsOn?: string[];
  reqLevel: number;
  reqAscension: number;
  cost: TraceCost[];
  statsModifier?: Partial<CombatStats>;
  isCore?: boolean;
}

export type RewardType = 'STAT_BONUS' | 'STORY_UNLOCK' | 'VOICE_UNLOCK' | 'ITEM';

export interface AffectionMilestone {
  level: number;
  reqAffection: number;
  title: string;
  description: string;
  rewards: {
    type: RewardType;
    value: string | number;
    label: string;
  }[];
  sceneContext?: {
    location: string;
    atmosphere: string;
    plotHook: string;
  };
}

// --- NEW: Quest System Types ---
export type QuestType = 'DAILY' | 'WEEKLY' | 'LIFETIME';

export interface Quest {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  targetValue: number;
  metricKey: keyof UserStatistics;
  rewards: {
    credits?: number;
    starJade?: number;
    exp?: number;
    items?: InventoryItem[];
  };
  icon: string;
}

// --- NEW: Recipe System Types ---
export interface Recipe {
  id: string;
  name: string;
  description: string;
  type: 'MATERIAL' | 'CONSUMABLE' | 'EQUIPMENT';
  resultItemId: string;
  resultCount: number;
  materials: { itemId: string; count: number }[];
  costCredits: number;
  unlockLevel?: number;
}

export interface StoryOption {
  label: string;
  action: string;
}

export interface StorySegment {
  id: string;
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  isUserChoice?: boolean;
  isFavorited?: boolean;
  affectionChange?: number;
  affectionSource?: string;
}

export interface SceneContext {
  location: string;
  time: string;
  atmosphere: string;
  plotHook: string;
}

export interface SavedStory {
  id: string;
  title: string;
  date: string;
  characterName: string;
  segments: StorySegment[];
  finalAffection: number;
  sceneContext?: SceneContext;
}

export interface GlobalBuffs {
  costReduction: number;
  creditBoost: number;
  timeReduction: number;
  affectionBoost: number;
  rareDropBoost: number;
}

export interface FacilityConfig {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  baseCreditRate: number;
  baseAffectionRate: number;
  icon: string;
  color: string;
  unlockPrice: number;
  imageUrl?: string;
  upgradeRequirements?: {
    itemId: string;
    baseAmount: number;
  }[];
  upgradeMaterialId?: string;
  baseMaterialCost?: number;
  globalBuffDescription?: string;
  globalBuff?: {
    type: keyof GlobalBuffs;
    valuePerLevel: number;
  };
}

export interface FacilityState {
  id: string;
  level: number;
  assignedCharId: string | null;
}

export interface ShowcaseSlot {
  id: string;
  unlocked: boolean;
  itemId?: string;
}

export interface HomeState {
  facilities: FacilityState[];
  showcase: ShowcaseSlot[];
  lastCollected: string;
}

export type AffectionMap = { [characterId: string]: number };

export interface RandomEvent {
  id: string;
  characterId: string;
  facilityId: string;
  title: string;
  description: string;
  type: 'good' | 'bad' | 'neutral';
  timestamp: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  onClick?: () => void;
}

export interface MaterialDrop {
  itemId: string;
  chance: number;
  min: number;
  max: number;
}

export interface ExpeditionMap {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  recommendedGame?: string;
  baseCreditReward: number;
  baseAffectionReward: number;
  imageUrl: string;
  difficulty: 'Easy' | 'Normal' | 'Hard';
  enemyTypes?: string[];
  enemyElements?: string[];
  ticketCost: number;
  requiredFaction?: string;
  requiredFacilityId?: string;
  requiredFacilityLevel?: number;
  rareRewards?: ShopItem[];
  materialDrops?: MaterialDrop[];
}

export interface ActiveExpedition {
  id: string;
  mapId: string;
  characterIds: [string, string];
  startTime: number;
  endTime: number;
  claimed: boolean;
  usedEquipmentId?: string;
  bonusCreditMult: number;
  bonusAffectionMult: number;
}

export interface Enemy {
  id: string;
  name: string;
  regionId?: string; // New: Planet association
  lore?: string; // New: Flavour text
  skillLore?: string; // New: Skill descriptions
  level: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  imageUrl?: string;
  element: 'Physical' | 'Fire' | 'Ice' | 'Lightning' | 'Wind' | 'Quantum' | 'Imaginary';
  weaknesses?: string[];
  dropTable: MaterialDrop[];
}

export interface RaidRegion {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  color: string;
  dropMaterialId: string;
}

export interface RaidMap {
  id: string;
  regionId: string;
  name: string;
  description: string;
  difficulty: number;
  staminaCost: number;
  maxSquadSize?: number;
  imageUrl: string;
  staticImageUrl?: string;
  nodes: RaidNode[];
  possibleEnemies: Enemy[];
  firstClearReward?: number;
  dropTable?: MaterialDrop[];
}

export interface DailyStageDifficulty {
  level: number;
  recLevel: number;
  staminaCost: number;
  rewards: MaterialDrop[];
  enemies: Enemy[];
}

export interface DailyStage {
  id: string;
  name: string;
  type: 'EXP' | 'ASCENSION' | 'CREDITS';
  openDays: number[];
  imageUrl: string;
  staticImageUrl?: string;
  difficulties: DailyStageDifficulty[];
  description?: string;
  regionId?: string;
}

export type RaidNodeType = 'BATTLE' | 'ELITE_BATTLE' | 'LOOT' | 'EVENT' | 'EXTRACT' | 'BOSS' | 'REST' | 'START' | 'COMBAT' | 'ELITE'; // Unified

export interface RaidNode {
  id: string;
  type: RaidNodeType;
  name?: string;
  x?: number;
  y?: number;
  cleared: boolean;
  isCleared?: boolean; // Duplicate cleanup
  isLocked?: boolean;
  enemies?: CombatUnit[];
}

export interface CombatStatus {
  id: string;
  sourceCharId?: string;
  name: string;
  type: 'BUFF' | 'DEBUFF';
  stat?: string;
  value: number;
  isDoT?: boolean;
  dotDamage?: number;
  duration: number;
  icon: string;
  description: string;
}

export interface CombatUnit {
  uid: string;
  charId: string;
  name: string;
  isEnemy: boolean;
  level: number;
  maxHp: number;
  currentHp: number;
  maxToughness: number;
  currentToughness: number;
  maxEnergy: number;
  currentEnergy: number;
  stats: CombatStats;
  element: string;
  weaknesses?: string[];
  av: number;
  isDead: boolean;
  avatarUrl: string;
  statuses: CombatStatus[];
  shield: number;
  animState: 'idle' | 'attack' | 'hit' | 'break';
  isSummon?: boolean;
  equipmentRefs?: {
    weaponId?: string;
    armorId?: string;
    accessoryId?: string;
  };
}

export interface WorldEventOption {
  label: string;
  effect: 'HEAL' | 'ITEM' | 'BUFF' | 'BATTLE' | 'NOTHING';
  value?: any;
  chance?: number;
}

export interface WorldEvent {
  id: string;
  regionId: string;
  title: string;
  description: string;
  imagePrompt: string;
  choices: WorldEventOption[];
}

export type NarrativeTrigger = 'EXPLORATION' | 'BATTLE_START' | 'ELITE_BATTLE' | 'LOOT_FOUND' | 'VICTORY' | 'DEFEAT' | 'REST';

export interface NarrativeEvent {
  id: string;
  trigger: NarrativeTrigger;
  text: string;
  regionId?: string | 'all';
  requiredCharId?: string;
  requiredPair?: [string, string];
  weight?: number;
}

export enum AppState {
  IDLE,
  GENERATING_TEXT,
  GENERATING_IMAGE,
  GENERATING_VIDEO,
  WAITING_FOR_INPUT,
  ERROR
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  baseAffection: number;
  targetCharacterId?: string;
  icon: string;
  type?: 'gift' | 'equipment' | 'material' | 'consumable' | 'currency';
  equipType?: 'weapon' | 'armor' | 'accessory';
  rarity?: 'R' | 'SR' | 'SSR';
  stats?: Partial<CombatStats>;
  exclusiveEffect?: string;
  purchasable?: boolean;
  showcaseBuff?: {
    type: 'credit_boost' | 'affection_boost' | 'rare_drop_boost';
    value: number;
  };
  effectType?: any;
  effectValue?: any;
  expValue?: number;
}

export interface InventoryItem extends ShopItem {
  count: number;
}

export interface PassiveSkill {
  name: string;
  description: string;
  effectType: 'reduce_time' | 'boost_credits' | 'boost_affection' | 'combat_buff' | 'rare_drop_boost';
  value: number;
  combatStat?: keyof CombatStats;
}

export interface ActiveSkill {
  name: string;
  description: string;
  damageMultiplier: number;
  cost: number;
  type: 'single' | 'aoe' | 'heal' | 'buff';
  healMultiplier?: number;
}

// --- DATA DRIVEN COMBAT ARCHITECTURE ---

export type MechanicTag =
  | 'Damage'          // Standard damage
  | 'Heal'            // Healing logic
  | 'Shield'          // Shield application
  | 'Buff_Atk'        // Buff Attack
  | 'Buff_Dmg'        // Buff Damage %
  | 'Debuff_Def'      // Debuff Defense
  | 'DoT_Shock'       // Apply Shock
  | 'DoT_Burn'        // Apply Burn
  | 'DoT_Wind'        // Apply Wind Shear
  | 'DoT_Bleed'       // Apply Bleed
  | 'DoT_Ice'         // Apply Ice DoT
  | 'DoT_Detonate'    // Kafka: Explode DoTs
  | 'Break_Dmg'       // Firefly: Scale with Break Effect
  | 'Ignore_Weakness' // Acheron/Firefly: Ignore Type
  | 'FollowUp'        // Mark for follow up (triggers extra hit)
  | 'Summon'          // Summon entity
  | 'Double_Cast'     // Seele: Action Forward / Double Turn logic
  | 'No_Energy'       // Acheron: No energy regen
  | 'Hp_Cost'         // Blade/Firefly: Consume HP
  | 'Self_Heal'       // Recover own HP
  | 'AoE'             // Splash/All targets
  | 'Blast'           // Main + Adjacent
  | 'Debuff_Freeze'   // Freeze effect
  | 'Energy_Charge';  // Restore Energy

export interface SkillConfig {
  name: string;
  type: 'Basic' | 'Skill' | 'Ult';
  element: string; // 'Physical' | 'Fire' | 'Ice' | 'Lightning' | 'Wind' | 'Quantum' | 'Imaginary'
  spCost: number; // 0 or 1
  ratio: number; // Multiplier (e.g., 1.5)
  tags: MechanicTag[];

  // Optional Specifics
  healRatio?: number; // Scaling for heals
  buffValue?: number; // Scaling for buffs
  description?: string;
  fixedEnergyGain?: number; // For Acheron specific mechanics (e.g., +3 stacks)
  hitSplit?: number[]; // Array of multipliers for multi-hit animations (sums to 1.0 ideally, but can vary)
}

export interface ImageGenerationSettings {
  provider: 'gemini' | 'custom' | 'novelai' | 'runpod';
  customUrl: string;
  customApiKey?: string;
  customModelName?: string;
  novelaiApiKey?: string;
  runpodEndpointId?: string; // New: RunPod Endpoint ID
  runpodApiKey?: string;     // New: RunPod API Key
  runpodLoraName?: string;   // New: LoRA Filename (.safetensors)
  runpodLoraStrength?: number; // New: LoRA Strength (0.1 - 1.0)
  novelaiUseReference?: boolean; // New: Use avatar as Img2Img reference
  novelaiStrength?: number; // New: Img2Img strength (0.1 - 0.99) // New: NovelAI API Key
  generationMode: 'quality' | 'speed'; // New: Control generation speed/quality
}

export interface TextGenerationSettings {
  provider: 'gemini' | 'custom' | 'runpod';
  customBaseUrl: string; // e.g., https://openrouter.ai/api/v1
  customApiKey?: string;
  customModelName: string; // e.g., midnight-miqu-70b

  // New: Specialized RunPod Settings
  runpodBaseUrl?: string;
  runpodApiKey?: string;
  runpodModelName?: string;

  // New: Generation Parameters
  temperature?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
}

export interface DialogueItem {
  type: 'user' | 'ai';
  text: string;
  timestamp: number;
  category?: 'chat' | 'work' | 'event' | 'special';
  imageUrl?: string;
}

// --- NEW: Long-term Memory & Diary ---
export interface Memory {
  id: string;
  text: string;
  type: 'fact' | 'event' | 'preference';
  timestamp: number;
  importance: number; // 1-5, higher is more important
  keywords?: string[];
}

export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  content: string; // Traditional Chinese
  mood: 'happy' | 'sad' | 'excited' | 'shy' | 'angry' | 'horny';
  summary: string;
  imageUrl?: string; // Optional generated image for the diary
}

export type MemoryMap = { [characterId: string]: Memory[] };
export type DiaryMap = { [characterId: string]: DiaryEntry[] };