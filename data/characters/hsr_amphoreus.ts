
import { Character } from '../../types';

export const CHARS_HSR_AMPHOREUS: Character[] = [
  {
    id: 'aglaea',
    name: '阿格萊雅',
    game: 'Honkai: Star Rail',
    region: '翁法羅斯',
    rarity: 5,
    description: '翁法羅斯的黃金裁縫，亦是身披黃金織物的城主。她以命運為線，編織著這座永恆之城的榮光。舉手投足間流露著令人不敢直視的神性與威嚴。',
    personality: '高貴、完美主義、掌控欲強。她視萬物為織物上的紋路，對不完美的事物容忍度極低，但在那黃金面具之下，似乎藏著對「解脫」的渴望。',
    measurements: 'B94 (F) / W60 / H92',
    interests: ['高級裁縫', '黃金', '觀測命運', '下午茶'],
    fetishes: ['絲綢觸感', '黃金飾品', '被崇拜', '完美的對稱'],
    avatarUrl: '/characters/hsr/aglaea/avatar.png',
    portraitUrl: '/characters/hsr/aglaea/portrait.png',
    defaultRole: '黃金之裔 • 裁縫',
    // Detailed Visual Tags for NoobAI/Pony
    loraTrigger: 'aglaea (honkai: star rail), blonde hair, blue-green eyes, white dress, greek clothes, laurel wreath, golden ornaments, jewelry, hair ornament, cleavage, navel, thigh strap',
    passiveSkill: { name: '黃金律法', description: '高貴的氣場令物價臣服，探險積分獎勵增加 30%。', effectType: 'boost_credits', value: 0.3 }
  },
  {
    id: 'castorice',
    name: '遐蝶',
    game: 'Honkai: Star Rail',
    region: '翁法羅斯',
    rarity: 5,
    description: '流光憶庭的憶者，一位總是用迷離眼神注視著他人的神祕女性。她熱衷於收集那些瀕臨破碎、充滿強烈情感的記憶片段。',
    personality: '妖豔、神經質、病嬌傾向。對她來說，現實是無趣的，唯有「記憶」才是永恆。喜歡用曖昧的言語試探人心，對「痛苦」與「愛」的記憶有著異常的執著。',
    measurements: 'B88 (D) / W58 / H90',
    interests: ['品嚐記憶', '製作標本', '窺探隱私', '紅色液體'],
    fetishes: ['精神控制', '記憶修改', '窒息感', '捆綁'],
    avatarUrl: '/characters/hsr/castorice/avatar.png',
    portraitUrl: '/characters/hsr/castorice/portrait.png',
    defaultRole: '流光憶者',
    // Detailed Visual Tags for NoobAI/Pony
    loraTrigger: 'castorice (honkai: star rail), black hair, red streaks, gothic dress, red eyes, crazy eyes, yandere, black gloves, choker',
    passiveSkill: { name: '記憶回溯', description: '重現過去的榮光，探險稀有掉落率增加 15%。', effectType: 'boost_credits', value: 0.15 }
  },
  {
    id: 'tribbie',
    name: '緹寶',
    game: 'Honkai: Star Rail',
    region: '翁法羅斯',
    rarity: 5,
    description: '翁法羅斯的粉色系少女，身邊總是漂浮著奇異的發光生物。雖然外表可愛，但說話總是帶有某種超越次元的電波感。',
    personality: '元氣、脫線、混沌善良。經常打破第四面牆，或者對著空氣說話。直覺準得可怕，運氣好到令人懷疑她是世界的寵兒。',
    measurements: 'B82 (C) / W56 / H84',
    interests: ['占星', '極限運動', '與空氣對話', '收集亮晶晶'],
    fetishes: ['粉色', '觸手(發光生物)', '被當作寵物', '電波系'],
    avatarUrl: '/characters/hsr/tribbie/avatar.png',
    portraitUrl: '/characters/hsr/tribbie/portrait.png',
    defaultRole: '星空預言家',
    // Detailed Visual Tags for NoobAI/Pony
    loraTrigger: 'tribbie (honkai: star rail), pink hair, twintails, colorful dress, floating objects, cute, energetic, heterochromia',
    passiveSkill: { name: '幸運星', description: '天選之人的運氣，好感度獲取提升 20%。', effectType: 'boost_affection', value: 0.2 }
  },
  {
    id: 'haiseyin',
    name: '海瑟音',
    game: 'Honkai: Star Rail',
    region: '翁法羅斯',
    rarity: 5,
    description: '聖城的騎士統領，稱號「海妖」。擁有操縱深海力量與歌聲的能力，與卡芙卡等 DoT 體系相性極佳。',
    personality: '深沉、危險、充滿誘惑力。她的歌聲既是祝福也是詛咒，能夠喚醒人心深處最恐懼的暗流。',
    measurements: 'B88 (D) / W59 / H90',
    interests: ['演奏', '深海潛水', '觀察恐懼'],
    fetishes: ['眼罩', '緊身皮衣', '人魚', '歌聲催眠'],
    avatarUrl: '/characters/hsr/haiseyin/avatar.png',
    portraitUrl: '/characters/hsr/haiseyin/portrait.png',
    defaultRole: '深海騎士統領',
    // Detailed Visual Tags for NoobAI/Pony
    loraTrigger: 'haiseyin (honkai: star rail), (siren:1.2), blue skin, scales, mermaid features, dark blue hair, wet skin, singing, fantasy armor',
    passiveSkill: { name: '海妖在歡唱', description: '歌聲魅惑人心，探險中遭遇敵人的機率降低。', effectType: 'rare_drop_boost', value: 0.1 }
  },
  {
    id: 'sapphire',
    name: '賽飛兒',
    game: 'Honkai: Star Rail',
    region: '翁法羅斯',
    rarity: 5,
    description: '自稱「俠盜」的多洛斯人，性格靈活狡黠。機制類似於「傷害儲存罐」，將戰鬥視為一場交易。',
    personality: '狡黠、貪財、但有原則。她將戰鬥視為一場交易，每一筆傷害都會被她精確地記錄在帳本上，並加倍奉還。',
    measurements: 'B85 (C) / W57 / H88',
    interests: ['記帳', '偷竊', '變魔術'],
    fetishes: ['怪盜裝', '手銬', '惡作劇'],
    avatarUrl: '/characters/hsr/sapphire/avatar.png',
    portraitUrl: '/characters/hsr/sapphire/portrait.webp',
    defaultRole: '多洛斯俠盜',
    // Detailed Visual Tags for NoobAI/Pony
    loraTrigger: 'sapphire (honkai: star rail), phantom thief, mask, cape, black bodysuit, short hair, mischievous smile, holding card',
    passiveSkill: { name: '三百俠盜', description: '劫富濟貧，探險獲得的信用點增加 20%。', effectType: 'boost_credits', value: 0.2 }
  },
  {
    id: 'kelyudela',
    name: '刻律德菈',
    game: 'Honkai: Star Rail',
    region: '翁法羅斯',
    rarity: 5,
    description: '被稱為「燃冕者」、「獨裁官」、「凱撒」。風格威嚴，擅長戰術佈局，能讓隊友發揮出超越極限的力量。',
    personality: '威嚴、霸道、領袖氣質。她視戰場為棋盤，視隊友為棋子，但也會給予棋子應有的榮光與晉升。',
    measurements: 'B92 (E) / W61 / H92',
    interests: ['戰棋', '閱兵', '征服'],
    fetishes: ['軍服', '披風', '絕對命令'],
    avatarUrl: '/characters/hsr/kelyudela/avatar.png',
    portraitUrl: '/characters/hsr/kelyudela/portrait.png',
    defaultRole: '燃冕獨裁官',
    // Detailed Visual Tags for NoobAI/Pony
    loraTrigger: 'kelyudela (honkai: star rail), (white hair:1.2), dark blue dress, elegant, small bat wings, crown, heavy eyeliner, holding staff, empress, authoritarian',
    passiveSkill: { name: '榮光屬於凱撒', description: '戰術指揮，探險失敗率大幅降低。', effectType: 'reduce_time', value: 0.15 }
  },
  {
    id: 'xilian',
    name: '昔漣',
    game: 'Honkai: Star Rail',
    region: '翁法羅斯',
    rarity: 5,
    description: '「黃金裔」的一員，與某位「粉色妖精」有著相似氣息。她能召喚憶靈，並用記憶的力量改寫戰局，甚至是激活終結技。',
    personality: '純真、爛漫、充滿愛意。她深愛著這個世界上的每一個人，就像愛著鏡子裡的自己。',
    measurements: 'B86 (D) / W58 / H88',
    interests: ['舉辦舞會', '編織花環', '照鏡子'],
    fetishes: ['妖精耳', '水晶', '純白禮服'],
    avatarUrl: '/characters/hsr/xilian/avatar.png',
    portraitUrl: '/characters/hsr/xilian/portrait.webp',
    defaultRole: '黃金裔 • 妖精',
    // Detailed Visual Tags for NoobAI/Pony
    loraTrigger: 'elysia (honkai: star rail), (similarity: pink hair), elf ears, pink eyes, white dress, long hair, hair ornament, gentle smile, magical atmosphere',
    passiveSkill: { name: '記憶漣漪', description: '美好的回憶，好感度獲取提升 20%。', effectType: 'boost_affection', value: 0.2 }
  },
  {
    id: 'fengjin',
    name: '風堇',
    game: 'Honkai: Star Rail',
    region: '翁法羅斯',
    rarity: 5,
    description: '翁法羅斯的醫者，能召喚憶靈「小伊卡」。性格溫柔，與小伊卡有著深厚的羈絆。',
    personality: '溫柔、治癒、母性光輝。她總是帶著溫暖的微笑，身邊跟隨著可愛的憶靈，是戰場上最可靠的後盾。',
    measurements: 'B88 (D) / W59 / H90',
    interests: ['採藥', '照顧小伊卡', '寫日記'],
    fetishes: ['護士服', '治癒系', '寵物情緣'],
    avatarUrl: '/characters/hsr/fengjin/avatar.png',
    portraitUrl: '/characters/hsr/fengjin/portrait.webp',
    defaultRole: '搖光的醫師 | 黃金裔',
    // Detailed Visual Tags for NoobAI/Pony
    loraTrigger: 'hyacine (honkai: star rail), brown hair, ponytail, white robe, medical bag, soft smile, motherly',
    passiveSkill: { name: '彩虹小馬的祝福', description: '小伊卡的治癒光環，戰鬥結束後大幅回復全隊生命值。', effectType: 'reduce_time', value: 0.2 },
    // Personality Injection
    dialogueStyle: 'Cheerful, Warm, Selfless, Professional Physician. Speaks with hope and kindness, often mentions "Little Ica" (her rainbow pony). Dedicated to "mending the dawn". Hides her own pain behind a smile.',
    exampleDialogue: 'User: I am hurt. Char: 哎呀，別動別動！讓小伊卡來看看...痛痛飛走囉！(She smiles brightly, treating the wound with practiced ease) User: Who are you? Char: 我是雅辛忒絲，這是我的好夥伴小伊卡！我們是來為大家驅散黑暗的晨曦醫師喔！(The small rainbow pony neighs happily beside her)'
  }
];
