

import { DailyStage } from '../types';
import { ENEMIES } from './enemies';

const getBg = (prompt: string) => `https://pollinations.ai/p/${encodeURIComponent(prompt + " battle arena background anime style 8k")}`;

export const DAILY_STAGES: DailyStage[] = [
  {
    id: 'calyx_gold',
    name: '擬造花萼 (金) - 回憶',
    type: 'EXP',
    openDays: [1, 3, 5, 0], // Mon, Wed, Fri, Sun
    imageUrl: getBg('golden magical flower futuristic abstract yellow'),
    staticImageUrl: undefined, // Placeholder for manual override
    difficulties: [
      {
        level: 1, recLevel: 10, staminaCost: 10,
        rewards: [{ itemId: 'exp_book_blue', chance: 1.0, min: 3, max: 5 }],
        enemies: [ENEMIES[0], ENEMIES[0]]
      },
      {
        level: 2, recLevel: 30, staminaCost: 20,
        rewards: [
          { itemId: 'exp_book_blue', chance: 1.0, min: 6, max: 10 },
          { itemId: 'exp_book_purple', chance: 0.6, min: 1, max: 2 }
        ],
        enemies: [ENEMIES[1], ENEMIES[1]]
      },
      {
        level: 3, recLevel: 50, staminaCost: 30,
        rewards: [
          { itemId: 'exp_book_purple', chance: 1.0, min: 3, max: 5 },
          { itemId: 'exp_book_blue', chance: 1.0, min: 5, max: 8 }
        ],
        enemies: [ENEMIES[2], ENEMIES[0]]
      },
      {
        level: 4, recLevel: 70, staminaCost: 40,
        rewards: [
          { itemId: 'exp_book_purple', chance: 1.0, min: 6, max: 10 },
          { itemId: 'aether_dust', chance: 0.3, min: 1, max: 2 }
        ],
        enemies: [ENEMIES[2], ENEMIES[2]]
      }
    ]
  },
  {
    id: 'calyx_crimson',
    name: '擬造花萼 (赤) - 鋒芒',
    type: 'ASCENSION',
    openDays: [2, 4, 6, 0], // Tue, Thu, Sat, Sun
    imageUrl: getBg('crimson red magical flower dark ominous'),
    staticImageUrl: undefined, // Placeholder for manual override
    difficulties: [
      {
        level: 1, recLevel: 20, staminaCost: 20,
        rewards: [
          { itemId: 'aether_dust', chance: 1.0, min: 2, max: 3 }
        ],
        enemies: [ENEMIES[1], ENEMIES[0]]
      },
      {
        level: 2, recLevel: 40, staminaCost: 30,
        rewards: [
          { itemId: 'aether_dust', chance: 1.0, min: 3, max: 5 },
          { itemId: 'ice_crystal', chance: 0.5, min: 1, max: 2 }
        ],
        enemies: [ENEMIES[1], ENEMIES[2]]
      },
      {
        level: 3, recLevel: 60, staminaCost: 40,
        rewards: [
          { itemId: 'ice_crystal', chance: 1.0, min: 3, max: 5 },
          { itemId: 'thunder_prism', chance: 0.4, min: 1, max: 2 }
        ],
        enemies: [ENEMIES[2], ENEMIES[2]]
      }
    ]
  },
  {
    id: 'treasure_bud',
    name: '藏金之蕾',
    type: 'CREDITS',
    openDays: [0, 1, 2, 3, 4, 5, 6], // Everyday
    imageUrl: getBg('gold coins treasure vault fantasy cave'),
    staticImageUrl: undefined, // Placeholder for manual override
    difficulties: [
      {
        level: 1, recLevel: 10, staminaCost: 10,
        rewards: [], // Credits handled by system logic multiplier
        enemies: [ENEMIES[3], ENEMIES[3]]
      },
      {
        level: 2, recLevel: 30, staminaCost: 20,
        rewards: [],
        enemies: [ENEMIES[3], ENEMIES[3], ENEMIES[3]]
      },
      {
        level: 3, recLevel: 50, staminaCost: 30,
        rewards: [],
        enemies: [ENEMIES[2], ENEMIES[3], ENEMIES[3]]
      }
    ]
  }
];