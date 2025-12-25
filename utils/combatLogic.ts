
import { InventoryItem, ShopItem, CombatUnit, RaidMap, DailyStage } from '../types';
import { SHOP_ITEMS } from '../data/items';
import { CombatMetrics } from '../components/BattleEngine';
import { APP_CONFIG } from '../appConfig';

// --- MVP Calculation ---
export interface MvpResult {
    uid: string;
    score: number;
    damage: number;
    healing: number;
    shield: number;
    taken: number;
}

export const calculateMVP = (
    allies: CombatUnit[],
    metrics: Record<string, CombatMetrics>
): MvpResult | null => {
    let maxScore = -1;
    let mvpData: MvpResult | null = null;

    // Filter out summons from MVP consideration usually
    allies.filter(u => !u.isSummon).forEach(ally => {
        const m = metrics[ally.uid] || { damageDealt: 0, healingDone: 0, shieldProvided: 0, damageTaken: 0 };

        // MVP Score Formula: Dmg + Heal*1.5 + Shield + Taken*0.5
        const score = m.damageDealt + (m.healingDone * 1.5) + (m.shieldProvided || 0) + ((m.damageTaken || 0) * 0.5);

        if (score > maxScore) {
            maxScore = score;
            mvpData = {
                uid: ally.uid,
                score,
                damage: m.damageDealt,
                healing: m.healingDone,
                shield: m.shieldProvided || 0,
                taken: m.damageTaken || 0
            };
        }
    });

    // Fallback if no significant actions taken
    if (!mvpData && allies.length > 0) {
        const u = allies[0];
        mvpData = { uid: u.uid, score: 0, damage: 0, healing: 0, shield: 0, taken: 0 };
    }

    return mvpData;
};

// --- Drop Calculation ---
export const calculateDrops = (
    source: { type: 'RAID' | 'DAILY', map?: RaidMap, daily?: DailyStage, dailyDiffIndex?: number },
    count: number = 1
): { items: InventoryItem[], credits: number, exp: number } => {
    const allDrops: InventoryItem[] = [];
    let totalCredits = 0;
    let totalExp = 0;

    for (let i = 0; i < count; i++) {
        // 1. DAILY STAGE LOGIC
        if (source.type === 'DAILY' && source.daily && source.dailyDiffIndex !== undefined) {
            const diff = source.daily.difficulties[source.dailyDiffIndex];
            totalExp += diff.level * 100;

            if (source.daily.type === 'CREDITS') totalCredits += 10000 * diff.level;
            else totalCredits += 100 * diff.level;

            diff.rewards.forEach(r => {
                if (Math.random() <= r.chance) {
                    const item = SHOP_ITEMS.find(x => x.id === r.itemId);
                    if (item) {
                        const qty = Math.floor(Math.random() * (r.max - r.min + 1)) + r.min;
                        if (qty > 0) pushDrop(allDrops, item, qty);
                    }
                }
            });
        }
        // 2. RAID MAP LOGIC
        else if (source.type === 'RAID' && source.map) {
            const map = source.map;

            // Logic: Raid maps have drop tables. We simulate clearing nodes (Combat + Boss).
            // Approx 3 combat encounters + 1 boss per full run.
            const rollsPerRun = 4;

            for (let r = 0; r < rollsPerRun; r++) {
                map.dropTable?.forEach(d => {
                    // Increase drop chance for the "Boss" roll (last one)
                    const chanceMult = r === rollsPerRun - 1 ? 2.0 : 1.0;

                    if (Math.random() <= (d.chance * chanceMult)) {
                        const item = SHOP_ITEMS.find(x => x.id === d.itemId);
                        if (item) {
                            const qty = Math.floor(Math.random() * (d.max - d.min + 1)) + d.min;
                            if (qty > 0) pushDrop(allDrops, item, qty);
                        }
                    }
                });
            }

            // Base Raid Rewards
            totalCredits += map.difficulty * 2000;
            totalExp += map.difficulty * 50;
        }
    }

    return { items: allDrops, credits: totalCredits, exp: totalExp };
};

// Helper to merge items into a list
const pushDrop = (list: InventoryItem[], item: ShopItem, count: number) => {
    const exist = list.find(i => i.id === item.id);
    if (exist) exist.count += count;
    else list.push({ ...item, count });
};
