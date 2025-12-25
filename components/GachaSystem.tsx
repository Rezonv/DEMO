
import React, { useState, useEffect, useRef } from 'react';
import { ShopItem, Character, UserStatistics } from '../types';
import { SHOP_ITEMS } from '../data/items';
import { CHARACTERS } from '../data/characters';

interface Props {
    credits: number;
    starJade: number;
    onSpendCredits: (amount: number) => void;
    onSpendStarJade: (amount: number) => void;
    onAddItem: (item: ShopItem) => void;
    onAddCharacter: (char: Character) => void;
    onBack: () => void;
    allCharacters: Character[];
    isTutorial: boolean;
    trackStat?: (key: keyof UserStatistics, value: number) => void;
}

type GachaPhase = 'STANDBY' | 'DOOR_OPEN' | 'WARP_SPEED' | 'IMPACT' | 'FLASH' | 'REVEAL' | 'SUMMARY';
type VisualTier = 'R' | 'SR' | 'SSR';
type BannerType = 'ITEM' | 'CHARACTER';
type PoolType = 'HSR' | 'GENSHIN';

const GachaSystem: React.FC<Props> = ({ credits, starJade, onSpendCredits, onSpendStarJade, onAddItem, onAddCharacter, onBack, allCharacters, isTutorial, trackStat }) => {
    const [phase, setPhase] = useState<GachaPhase>('STANDBY');
    const [activeBanner, setActiveBanner] = useState<BannerType>(isTutorial ? 'CHARACTER' : 'CHARACTER');
    const [activePool, setActivePool] = useState<PoolType>('HSR');
    const [pullResults, setPullResults] = useState<(ShopItem | Character)[]>([]);
    const [revealIndex, setRevealIndex] = useState(-1);
    const [revealedIndices, setRevealedIndices] = useState<boolean[]>([]);
    const [visualTier, setVisualTier] = useState<VisualTier>('R');
    const [revealedCurrent, setRevealedCurrent] = useState(false); // For single reveal state

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);

    // 使用 allCharacters prop 而不是全局 CHARACTERS，以支持 DEMO 模式
    const hsrChars = allCharacters.filter(c => c.game === 'Honkai: Star Rail' || c.game === 'Original');
    const genshinChars = allCharacters.filter(c => c.game === 'Genshin Impact');

    const doPull = (forceSSR: boolean = false) => {
        const rand = Math.random();
        // 教學模式強制抽到 firefly
        if (isTutorial && forceSSR) {
            const firefly = allCharacters.find(c => c.id === 'firefly');
            if (!firefly) {
                console.error('❌ [GACHA] firefly 不在 allCharacters 中！');
                return allCharacters[0]; // 返回第一個角色作為後備
            }
            return firefly;
        }

        if (activeBanner === 'CHARACTER' || isTutorial) {
            if (isTutorial || rand < 0.1 || forceSSR) {
                const pool = activePool === 'HSR' ? hsrChars : genshinChars;
                const tier = (forceSSR || Math.random() > 0.5) ? 5 : 4;
                const subPool = pool.filter(c => c.rarity === tier);
                const finalPool = subPool.length > 0 ? subPool : pool;

                if (finalPool.length === 0) {
                    console.error('❌ [GACHA] 角色池為空！');
                    return allCharacters[0]; // 返回第一個角色作為後備
                }

                return finalPool[Math.floor(Math.random() * finalPool.length)];
            } else {
                const pool = SHOP_ITEMS.filter(i => i.rarity === 'R');
                return pool[Math.floor(Math.random() * pool.length)];
            }
        } else {
            const pool = SHOP_ITEMS.filter(i => i.purchasable !== false);
            return pool[Math.floor(Math.random() * pool.length)];
        }
    };

    const handlePull = (amount: number) => {
        const cost = amount * 160;
        if (!isTutorial) {
            if (activeBanner === 'CHARACTER') {
                if (starJade < cost) return alert("星瓊不足！");
                onSpendStarJade(cost);
            } else {
                if (credits < cost) return alert("積分不足！");
                onSpendCredits(cost);
            }
        }

        const results: (ShopItem | Character)[] = [];
        let maxRarity = 3;

        for (let i = 0; i < amount; i++) {
            const force = isTutorial && i === 9;
            const res = doPull(force);
            results.push(res);

            if ((res as any).game) {
                onAddCharacter(res as Character);
                if ((res as Character).rarity > maxRarity) maxRarity = (res as Character).rarity;
            } else {
                onAddItem(res as ShopItem);
                const itemRarity = (res as ShopItem).rarity === 'SSR' ? 5 : (res as ShopItem).rarity === 'SR' ? 4 : 3;
                if (itemRarity > maxRarity) maxRarity = itemRarity;
            }
        }

        if (trackStat) trackStat('gachaPulls', amount);

        setPullResults(results);
        setRevealedIndices(new Array(amount).fill(false));
        setVisualTier(maxRarity >= 5 ? 'SSR' : maxRarity === 4 ? 'SR' : 'R');
        setPhase('DOOR_OPEN');
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const updateSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        updateSize();
        window.addEventListener('resize', updateSize);

        let stars: { x: number, y: number, z: number, speed: number }[] = [];
        const width = canvas.width;
        const height = canvas.height;

        for (let i = 0; i < 500; i++) {
            stars.push({
                x: (Math.random() - 0.5) * width,
                y: (Math.random() - 0.5) * height,
                z: Math.random() * width,
                speed: Math.random() * 2 + 0.5
            });
        }

        let flashOpacity = 0;
        let impactScale = 0;

        const render = () => {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            if (phase === 'STANDBY' || phase === 'DOOR_OPEN' || phase === 'WARP_SPEED') {
                const speedMult = phase === 'WARP_SPEED' ? 50 : phase === 'DOOR_OPEN' ? 10 : 1;
                stars.forEach(star => {
                    star.z -= star.speed * speedMult;
                    if (star.z <= 0) {
                        star.z = canvas.width;
                        star.x = (Math.random() - 0.5) * canvas.width;
                        star.y = (Math.random() - 0.5) * canvas.height;
                    }
                    const k = 128.0 / star.z;
                    const px = star.x * k + cx;
                    const py = star.y * k + cy;
                    if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
                        const size = (1 - star.z / canvas.width) * 3;
                        const shade = Math.floor((1 - star.z / canvas.width) * 255);
                        ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade + 50})`;
                        if (phase === 'WARP_SPEED') {
                            ctx.beginPath();
                            ctx.strokeStyle = `rgba(100, 200, 255, ${shade / 255})`;
                            ctx.lineWidth = size;
                            ctx.moveTo(px, py);
                            ctx.lineTo((star.x * k * 1.1) + cx, (star.y * k * 1.1) + cy);
                            ctx.stroke();
                        } else {
                            ctx.beginPath();
                            ctx.arc(px, py, size, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                });
            }

            if (phase === 'DOOR_OPEN' || phase === 'WARP_SPEED') {
                ctx.save();
                ctx.translate(cx, cy);
                const scale = phase === 'WARP_SPEED' ? 1.5 + Math.random() * 0.1 : 1;
                ctx.scale(scale, scale);
                const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, 300);
                grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
                grad.addColorStop(0.5, 'rgba(100, 200, 255, 0.5)');
                grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = grad;
                ctx.fillRect(-400, -400, 800, 800);
                ctx.restore();
            }

            if (phase === 'IMPACT') {
                impactScale += 0.5;
                const color = visualTier === 'SSR' ? '#FFD700' : visualTier === 'SR' ? '#A020F0' : '#1E90FF';
                ctx.save();
                ctx.translate(cx, cy);
                ctx.beginPath();
                ctx.arc(0, 0, impactScale * 50, 0, Math.PI * 2);
                ctx.strokeStyle = color;
                ctx.lineWidth = 20;
                ctx.stroke();
                const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, impactScale * 30);
                grad.addColorStop(0, 'white');
                grad.addColorStop(0.5, color);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, 0, impactScale * 40, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            if (phase === 'FLASH') {
                if (flashOpacity < 1) flashOpacity += 0.2;
                ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            animationRef.current = requestAnimationFrame(render);
        };

        render();
        return () => {
            cancelAnimationFrame(animationRef.current);
            window.removeEventListener('resize', updateSize);
        };
    }, [phase, visualTier]);

    useEffect(() => {
        if (phase === 'DOOR_OPEN') setTimeout(() => setPhase('WARP_SPEED'), 1500);
        if (phase === 'WARP_SPEED') setTimeout(() => setPhase('IMPACT'), 2500);
        if (phase === 'IMPACT') setTimeout(() => setPhase('FLASH'), 500);
        if (phase === 'FLASH') setTimeout(() => { setPhase('REVEAL'); setRevealIndex(0); setRevealedCurrent(false); }, 500);
    }, [phase]);

    const reset = () => { setPhase('STANDBY'); setVisualTier('R'); setPullResults([]); setRevealIndex(-1); setRevealedIndices([]); setRevealedCurrent(false); };

    const handleClickReveal = () => {
        if (!revealedCurrent) {
            setRevealedCurrent(true);
        } else {
            if (revealIndex < pullResults.length - 1) {
                setRevealIndex(prev => prev + 1);
                setRevealedCurrent(false);
            } else {
                setPhase('SUMMARY');
            }
        }
    };

    const handleSkip = () => {
        setPhase('SUMMARY');
    };

    const currentItem = revealIndex >= 0 ? pullResults[revealIndex] : null;
    const isChar = currentItem ? (currentItem as any).game : false;
    const currentRarity = currentItem ? (isChar ? (currentItem as Character).rarity : (currentItem as ShopItem).rarity === 'SSR' ? 5 : (currentItem as ShopItem).rarity === 'SR' ? 4 : 3) : 3;

    return (
        <div className="fixed inset-0 z-[100] bg-black overflow-hidden font-sans select-none">
            {(phase !== 'SUMMARY') && (
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            )}

            {phase === 'STANDBY' && (
                <div className="absolute inset-0 z-10 flex flex-col justify-between p-10">
                    <div className="flex justify-between items-start">
                        <button onClick={onBack} className="text-gray-400 hover:text-white text-lg">✕ 退出</button>
                        <div className="bg-black/60 backdrop-blur rounded-full px-6 py-2 flex gap-6 border border-gray-700">
                            <div className="flex items-center gap-2">
                                <span>🪙</span> <span className="text-yellow-400 font-bold">{credits}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>💎</span> <span className="text-purple-400 font-bold">{starJade}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="flex gap-4 mb-8">
                            <button onClick={() => setActivePool('HSR')} className={`px-6 py-2 rounded-full font-bold transition-all ${activePool === 'HSR' ? 'bg-white text-black scale-110' : 'bg-black/50 text-gray-400 border border-gray-600'}`}>星穹鐵道</button>
                            <button onClick={() => setActivePool('GENSHIN')} className={`px-6 py-2 rounded-full font-bold transition-all ${activePool === 'GENSHIN' ? 'bg-white text-black scale-110' : 'bg-black/50 text-gray-400 border border-gray-600'}`}>原神</button>
                        </div>

                        <h1 className="text-6xl font-black text-white mb-2 drop-shadow-lg italic tracking-tighter">
                            {activePool === 'HSR' ? '星際躍遷' : '祈願'}
                        </h1>
                        <p className="text-gray-300 mb-12 tracking-widest uppercase">
                            {activePool === 'HSR' ? 'WARP EVENT' : 'WISH EVENT'}
                        </p>

                        <div className="flex gap-8">
                            <button
                                onClick={() => handlePull(1)}
                                className="group relative bg-[#ECE5D8] text-[#1D1D1F] w-48 h-16 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] transition-all active:scale-95 overflow-hidden"
                            >
                                <span className="relative z-10">單次 ({isTutorial ? 0 : 160})</span>
                            </button>
                            <button
                                onClick={() => handlePull(10)}
                                className="group relative bg-[#DBC291] text-[#1D1D1F] w-48 h-16 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(219,194,145,0.3)] hover:shadow-[0_0_40px_rgba(219,194,145,0.5)] transition-all active:scale-95 overflow-hidden"
                            >
                                <span className="relative z-10">十連 ({isTutorial ? 0 : 1600})</span>
                            </button>
                        </div>
                    </div>
                    <div className="text-center text-xs text-gray-500">
                        機率: 5★ 0.6% / 4★ 5.1% (含保底機制)
                    </div>
                </div>
            )}

            {phase === 'REVEAL' && currentItem && (
                <div
                    className="absolute inset-0 z-50 flex flex-col items-center justify-center cursor-pointer bg-gradient-to-b from-gray-900 to-black"
                    onClick={handleClickReveal}
                >
                    <div className="absolute top-8 right-8 z-50">
                        <button onClick={(e) => { e.stopPropagation(); handleSkip(); }} className="text-white border border-white/30 px-4 py-2 rounded-full hover:bg-white/10">跳過</button>
                    </div>

                    <div className="relative flex flex-col items-center">
                        {/* Card Back / Front Logic */}
                        {!revealedCurrent ? (
                            <div className={`w-[250px] h-[450px] rounded-2xl border-4 flex items-center justify-center bg-gray-800 shadow-2xl animate-pulse relative overflow-hidden ${currentRarity === 5 ? 'border-yellow-500 shadow-[0_0_30px_gold]' : currentRarity === 4 ? 'border-purple-500 shadow-[0_0_20px_purple]' : 'border-blue-500'}`}>
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                                <div className="text-6xl opacity-50">?</div>
                                <div className="absolute bottom-10 text-sm font-bold text-gray-400 uppercase tracking-widest">Click to Reveal</div>
                            </div>
                        ) : (
                            <div className="animate-scale-up-bounce flex flex-col items-center">
                                {/* Character Art / Item Icon */}
                                <div className={`mb-8 shadow-2xl ${isChar ? 'w-[300px] h-[600px]' : 'w-[250px] h-[250px]'} relative group rounded-xl overflow-hidden border-4 ${currentRarity === 5 ? 'border-yellow-400' : 'border-white/20'}`}>
                                    {isChar ? (
                                        <img src={(currentItem as Character).avatarUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-800 flex items-center justify-center text-9xl">
                                            {(currentItem as any).icon}
                                        </div>
                                    )}
                                    {/* Rarity Stars */}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                                        {Array.from({ length: currentRarity }).map((_, i) => (
                                            <span key={i} className="text-2xl text-yellow-400 drop-shadow-md">★</span>
                                        ))}
                                    </div>
                                </div>

                                <h2 className="text-5xl font-black text-white mb-2 drop-shadow-lg italic">{currentItem.name}</h2>
                                <p className="text-xl text-gray-300 mb-8 uppercase tracking-widest bg-black/50 px-4 py-1 rounded">
                                    {isChar ? (currentItem as Character).game : (currentItem as ShopItem).type}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {phase === 'SUMMARY' && (
                <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-gray-900 w-full max-w-5xl rounded-3xl border border-gray-700 shadow-2xl p-8 max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col">
                        <div className="text-center mb-8">
                            <h2 className="text-4xl font-black text-white italic tracking-tighter">獲取清單</h2>
                            <div className="text-sm text-gray-400 mt-2">重複的角色/裝備已自動轉換為素材</div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
                            {pullResults.map((item, idx) => {
                                const isC = (item as any).game;
                                const r = isC ? (item as Character).rarity : (item as ShopItem).rarity === 'SSR' ? 5 : (item as ShopItem).rarity === 'SR' ? 4 : 3;
                                const borderColor = r === 5 ? 'border-yellow-500 shadow-[0_0_10px_gold]' : r === 4 ? 'border-purple-500 shadow-[0_0_5px_purple]' : 'border-gray-700';

                                return (
                                    <div key={idx} className={`relative aspect-[3/4] bg-gray-800 rounded-xl flex flex-col items-center justify-center p-2 border overflow-hidden ${borderColor} animate-pop-in`} style={{ animationDelay: `${idx * 0.05}s` }}>
                                        {isC ? <img src={(item as Character).avatarUrl} className="absolute inset-0 w-full h-full object-cover opacity-60" /> : <div className="text-4xl z-10">{(item as any).icon}</div>}
                                        <div className="relative z-10 mt-auto bg-black/60 w-full text-center py-1">
                                            <div className={`text-[10px] font-bold ${r === 5 ? 'text-yellow-300' : r === 4 ? 'text-purple-300' : 'text-gray-300'}`}>{item.name}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-center gap-6 mt-auto">
                            <button onClick={reset} className="px-8 py-3 rounded-full border border-gray-600 text-gray-300 font-bold hover:bg-white hover:text-black transition-all">關閉</button>
                            {!isTutorial && <button onClick={() => { reset(); handlePull(10); }} className="px-8 py-3 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all">再抽 10 次</button>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GachaSystem;
