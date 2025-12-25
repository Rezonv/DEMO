export interface WorldLore {
    game: string | string[];
    description: string;
    terms: { term: string; desc: string }[];
    concepts: { name: string; desc: string }[];
    factions?: { name: string; keywords: string[]; desc: string; values: string }[];
}

export const WORLD_LORE: WorldLore[] = [
    {
        game: ['Honkai: Star Rail', '崩壞：星穹鐵道'],
        description: '一個由「星神」掌管「命途」的科幻宇宙。角色們搭乘星穹列車穿梭於各個世界之間。',
        terms: [
            { term: 'Aeons (星神)', desc: '掌管命途的類神存在 (如：Nous/智識, Yaoshi/藥師, Lan/嵐)。' },
            { term: 'Paths (命途)', desc: '賦予力量的哲學概念 (毀滅, 巡獵, 豐饒, 智識等)。' },
            { term: 'Light Cone (光錐)', desc: '凝結的記憶，用作武器或裝備。' },
            { term: 'Relic (遺器)', desc: '包含過去數據的古代遺物。' },
            { term: 'Pathstrider (命途行者)', desc: '汲取特定命途力量的個體。' },
            { term: 'Emanator (令使)', desc: '直接獲得星神賜予強大力量的存在。' },
            { term: 'Stellaron (星核)', desc: '「萬界之癌」，引發災難的神秘物質。' }
        ],
        concepts: [
            { name: 'Context', desc: '確保角色使用的隱喻和價值觀符合其命途與出身。' }
        ],
        factions: [
            {
                name: 'Xianzhou Alliance (仙舟聯盟)',
                keywords: ['Xianzhou', 'Luofu', 'Yaoqing', 'Zhuming', 'Fanghu', 'Yuqe', 'Cangcheng', '仙舟', '羅浮'],
                desc: '巡獵豐饒孽物的銀河艦隊。他們是受「魔陰身」困擾的長生種。',
                values: '佈局嚴謹，偶爾使用古風用語，痛恨豐饒/藥師，重視責任與長生種的視角。'
            },
            {
                name: 'IPC (星際和平公司)',
                keywords: ['IPC', 'Pier Point', 'Strategic Investment', '公司', '皮諾康尼'],
                desc: '崇拜「存護」克里珀的宇宙最大經濟體。',
                values: '利益至上，企業階級，契約精神，高效，常使用高科技或商業隱喻。'
            },
            {
                name: 'Stellaron Hunters (星核獵手)',
                keywords: ['Stellaron Hunters', 'Elio', 'Script', 'Kafka', 'Silver Wolf', 'Blade', 'Firefly', 'Sam', '獵手'],
                desc: '一群通緝犯，遵循「艾利歐的劇本」來塑造未來。',
                values: '神秘，命運驅動，對劇本/艾利歐絕對忠誠，道德觀模糊。'
            },
            {
                name: 'Penacony (匹諾康尼)',
                keywords: ['Penacony', 'Dreamscapes', 'Family', 'Harmony', '匹諾康尼', '美夢'],
                desc: '盛會之星，由遵循「同諧」的家族統治的巨大共享夢境。',
                values: '享樂主義，夢境隱喻，表演慾，家族團結 (或隱藏的黑暗)。'
            },
            {
                name: 'Genius Society (天才俱樂部)',
                keywords: ['Genius Society', 'Herta', 'Ruan Mei', 'Screwllum', 'Nous', '天才'],
                desc: '由「智識」星神博識尊選出的宇宙最聰明個體組成的團體。',
                values: '傲慢，痴迷於知識，缺乏常識，致力於研究未知。'
            },
            {
                name: 'Belobog (貝洛伯格)',
                keywords: ['Belobog', 'Jarilo-VI', 'Overworld', 'Underworld', 'Silvermane', '貝洛伯格'],
                desc: '雅利洛-VI 冰凍星球上最後的人類堡壘，由築城者守護。',
                values: '堅韌，存護，冰雪隱喻，上層區 (貴族) 與下層區 (生存) 的隔閡。'
            }
        ]
    },
    {
        game: ['Genshin Impact', '原神'],
        description: '一個名為提瓦特的奇幻世界，由掌管七種元素的七位神明統治。',
        terms: [
            { term: 'Teyvat (提瓦特)', desc: '故事發生的奇幻世界。' },
            { term: 'Vision (神之眼)', desc: '神明賜予的寶石，賦予元素力量。' },
            { term: 'Gnosis (神之心)', desc: '魔神的內部魔力核心，連接天空島。' },
            { term: 'Archon (魔神/七神)', desc: '統治七國的神明 (如：雷電將軍, 鍾離)。' },
            { term: 'Element (元素)', desc: '火, 水, 風, 雷, 草, 冰, 岩。' },
            { term: 'Celestia (天空島)', desc: '懸浮於空中的神之居所。' }
        ],
        concepts: [
            { name: 'Traveler', desc: '「旅行者」(用戶) 是一名能使用多種元素的異鄉人。' }
        ],
        factions: [
            {
                name: 'Mondstadt (蒙德)',
                keywords: ['Mondstadt', 'Knights of Favonius', 'Barbatos', 'Venti', '蒙德'],
                desc: '自由之城，崇拜風神巴巴托斯。',
                values: '自由，美酒，詩歌，騎士精神，輕鬆的氛圍。'
            },
            {
                name: 'Liyue (璃月)',
                keywords: ['Liyue', 'Qixing', 'Adepti', 'Rex Lapis', 'Zhongli', '璃月'],
                desc: '契約之城，崇拜岩王帝君。',
                values: '契約，商業，傳統，歷史，穩重且精明的商業思維。'
            },
            {
                name: 'Inazuma (稻妻)',
                keywords: ['Inazuma', 'Shogunate', 'Raiden Shogun', 'Tri-Commission', 'Ei', '稻妻'],
                desc: '永恆之國，崇拜雷電將軍。',
                values: '永恆，榮譽，武士道，物哀 (Mono no aware)，嚴格的階級。'
            },
            {
                name: 'Sumeru (須彌)',
                keywords: ['Sumeru', 'Akademiya', 'Dendro Archon', 'Nahida', 'Wisdom', '須彌'],
                desc: '智慧之國，致力於管理所有知識。',
                values: '知識，夢境 (或缺乏夢境)，理性主義，自然與科技的結合。'
            },
            {
                name: 'Fontaine (楓丹)',
                keywords: ['Fontaine', 'Justice', 'Focalors', 'Furina', 'Neuvillette', '楓丹'],
                desc: '正義之國，以歌劇院和複雜的法律系統聞名。',
                values: '正義，戲劇性，表演，審判，先進的蒸汽龐克科技。'
            },
            {
                name: 'Fatui (愚人眾)',
                keywords: ['Fatui', 'Snezhnaya', 'Harbinger', 'Tsaritsa', '愚人眾'],
                desc: '來自至冬國的外交官與軍事力量，效忠冰之女皇。',
                values: '對女皇的忠誠，不擇手段，軍事紀律，冷酷無情。'
            }
        ]
    }
];

export const getLoreForGame = (gameName: string, regionOrGroup?: string): string => {
    const lore = WORLD_LORE.find(l =>
        Array.isArray(l.game) ? l.game.includes(gameName) : l.game === gameName
    );

    if (!lore) return '';

    let output = `
  - ** Universe **: ${lore.description}
  ${lore.terms.map(t => `- ** ${t.term} **: ${t.desc}`).join('\n  ')}
  `;

    // Dynamic Faction Injection
    if (lore.factions && regionOrGroup) {
        const faction = lore.factions.find(f =>
            f.keywords.some(k => regionOrGroup.includes(k)) ||
            f.name.includes(regionOrGroup)
        );

        if (faction) {
            output += `\n  - ** Faction/Region (${faction.name}) **:
          - ** Description **: ${faction.desc}
          - ** Core Values **: ${faction.values} (Reflect this in personality/speech!)`;
        }
    }

    return output;
};
