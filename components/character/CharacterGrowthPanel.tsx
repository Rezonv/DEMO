import React from 'react';
import { CharacterProgression, TraceNode } from '../../types';
import {
    Sword, Shield, Heart, Zap, Star, Crown,
    Activity, Crosshair, Sparkles, Flame,
    Droplets, Wind, Hexagon, Move, ArrowUp
} from 'lucide-react';

interface Props {
    progression: CharacterProgression;
    maxLevel: number;
    traces: TraceNode[];
    unlockedTraces: string[];
    onLevelUp: () => void;
    onAscension: () => void;  // 新增
    onUnlockTrace: (node: TraceNode) => void;
}

// Icon Mapping Helper
const getIcon = (iconName: string | undefined, type: string) => {
    const props = { className: "w-full h-full p-1.5" };

    // Specific Stat Icons
    if (iconName === 'atk') return <Sword {...props} />;
    if (iconName === 'hp') return <Heart {...props} />;
    if (iconName === 'def') return <Shield {...props} />;
    if (iconName === 'spd') return <Move {...props} />;
    if (iconName === 'critRate') return <Crosshair {...props} />;
    if (iconName === 'critDmg') return <Activity {...props} />;
    if (iconName === 'energyRegen') return <Zap {...props} />;
    if (iconName === 'breakEffect') return <Hexagon {...props} />;
    if (iconName === 'effectHitRate') return <ArrowUp {...props} />;
    if (iconName === 'effectRes') return <Shield {...props} />; // Reuse shield for res
    if (iconName === 'outgoingHealing') return <Heart {...props} />;

    // Generic Fallbacks based on Type
    if (type === 'CORE') return <Crown {...props} className="w-full h-full p-2" />;
    if (type === 'ABILITY') return <Star {...props} />;
    if (type === 'BONUS') return <Sparkles {...props} />;

    // Default
    return <div className="w-2 h-2 bg-current rounded-full" />;
};

const CharacterGrowthPanel: React.FC<Props> = ({
    progression, maxLevel, traces, unlockedTraces, onLevelUp, onAscension, onUnlockTrace
}) => {
    return (
        <div className="space-y-8 animate-fade-in-right h-full flex flex-col">
            {/* Leveling Section */}
            <div className="bg-black/40 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-lg relative overflow-hidden group">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--ak-accent-yellow)]/10 to-transparent rounded-bl-full pointer-events-none"></div>

                <div className="flex justify-between mb-2 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-[var(--ak-accent-yellow)] shadow-[0_0_10px_var(--ak-accent-yellow)]"></div>
                        <span className="text-lg font-black italic text-white tracking-wider">等級提升 LEVEL UP</span>
                    </div>
                    <span className="text-sm font-mono text-[var(--ak-accent-yellow)]">{progression.level} <span className="text-gray-500">/</span> {maxLevel}</span>
                </div>

                {/* EXP Progress Bar */}
                <div className="mb-4 relative z-10">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>經驗值 EXP</span>
                        <span className="font-mono">{progression.exp || 0} / {progression.maxExp || 100}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700 relative">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-500"
                            style={{ width: `${Math.min(100, ((progression.exp || 0) / (progression.maxExp || 100)) * 100)}%` }}
                        >
                            <div className="absolute top-0 right-0 h-full w-1 bg-white/50 animate-pulse"></div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 items-center relative z-10">
                    <button
                        onClick={onLevelUp}
                        className="flex-1 bg-[var(--ak-accent-yellow)] hover:bg-yellow-400 text-black px-6 py-3 rounded-sm text-sm font-black italic tracking-widest shadow-[0_0_15px_rgba(234,179,8,0.4)] hover:shadow-[0_0_25px_rgba(234,179,8,0.6)] active:scale-95 transition-all clip-path-polygon"
                        style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
                    >
                        使用經驗書 (+200 EXP)
                    </button>
                    {progression.level >= maxLevel && progression.ascension < 6 && (
                        <button
                            onClick={onAscension}
                            className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-sm text-sm font-black italic tracking-widest shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] active:scale-95 transition-all animate-pulse"
                        >
                            突破 ⬆
                        </button>
                    )}
                </div>

                <div className="mt-4 flex items-center gap-3 text-xs text-gray-400 relative z-10">
                    <span className="font-bold">消耗 COST</span>
                    <div className="h-px w-8 bg-gray-700"></div>
                    <span className="bg-black/60 border border-purple-500/30 px-3 py-1 rounded-sm flex items-center gap-2 text-purple-300 shadow-sm">
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                        漫遊指南 x1
                    </span>
                </div>
            </div>

            {/* Trace Tree Canvas */}
            <div className="flex-1 relative group">
                {/* Background Container - Clips backgrounds & Borders */}
                <div className="absolute inset-0 rounded-xl overflow-hidden bg-black/60 backdrop-blur-xl border border-white/5 shadow-inner z-0">
                    {/* Grid Background */}
                    <div className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                            backgroundSize: '40px 40px'
                        }}>
                    </div>

                    {/* Vignette */}
                    <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/80 pointer-events-none"></div>
                </div>

                {/* Content Container - Allows tooltips to overflow */}
                <div className="relative w-full h-full z-10">
                    <h3 className="absolute top-4 left-4 text-xs font-black text-gray-500 uppercase z-20 tracking-[0.2em] flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        行跡 TRACES
                    </h3>

                    <div className="w-full h-full relative transform scale-90 origin-center">
                        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60">
                            {traces.map(node => {
                                if (!node.dependsOn) return null;
                                return node.dependsOn.map(parentId => {
                                    const parent = traces.find(t => t.id === parentId);
                                    if (!parent) return null;
                                    const isUnlocked = unlockedTraces.includes(node.id);
                                    return (
                                        <line
                                            key={`${parentId}-${node.id}`}
                                            x1={`${parent.x}%`} y1={`${parent.y}%`}
                                            x2={`${node.x}%`} y2={`${node.y}%`}
                                            stroke={isUnlocked ? "var(--ak-accent-cyan)" : "#374151"}
                                            strokeWidth={isUnlocked ? "2" : "1"}
                                            strokeDasharray={isUnlocked ? "0" : "4 2"}
                                            className="transition-all duration-500"
                                        />
                                    );
                                });
                            })}
                        </svg>
                        {traces.map(node => {
                            const isUnlocked = unlockedTraces.includes(node.id);
                            const canUnlock = !isUnlocked && (!node.dependsOn || node.dependsOn.every(id => unlockedTraces.includes(id))) && progression.level >= node.reqLevel;

                            // Determine Icon Name from statsModifier if not explicit
                            let iconName = node.icon;
                            if (node.type === 'STAT' && node.statsModifier) {
                                const keys = Object.keys(node.statsModifier);
                                if (keys.length > 0) iconName = keys[0];
                            }

                            // Determine Tooltip Alignment based on X position
                            let tooltipAlignClass = "left-1/2 -translate-x-1/2 origin-top"; // Default Center
                            if (node.x < 40) tooltipAlignClass = "left-0 -translate-x-4 origin-top-left"; // Align Left (push right)
                            if (node.x > 60) tooltipAlignClass = "right-0 translate-x-4 origin-top-right"; // Align Right (push left)

                            return (
                                <div
                                    key={node.id}
                                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition-all cursor-pointer group/node hover:z-50
                                    ${node.type === 'CORE' ? 'w-16 h-16 border-4' : node.type === 'ABILITY' ? 'w-12 h-12 border-2' : 'w-8 h-8 border'}
                                    ${isUnlocked
                                            ? 'bg-black border-[var(--ak-accent-cyan)] text-[var(--ak-accent-cyan)] shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                                            : canUnlock
                                                ? 'bg-gray-900 border-[var(--ak-accent-yellow)] text-[var(--ak-accent-yellow)] animate-pulse shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                                                : 'bg-black/80 border-gray-700 text-gray-700'
                                        }
                                `}
                                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                                    onClick={() => canUnlock && onUnlockTrace(node)}
                                >
                                    {/* Inner Glow for Unlocked */}
                                    {isUnlocked && <div className="absolute inset-0 rounded-full bg-[var(--ak-accent-cyan)]/10 animate-pulse"></div>}

                                    {/* Icon */}
                                    <div className={`relative z-10 transition-transform duration-300 group-hover/node:scale-110 ${node.type === 'CORE' ? 'p-3' : 'p-1.5'}`}>
                                        {getIcon(iconName, node.type)}
                                    </div>

                                    {/* Lock Icon Overlay */}
                                    {!isUnlocked && !canUnlock && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full backdrop-blur-[1px]">
                                            <div className="w-3 h-3 bg-gray-600 rounded-sm"></div>
                                        </div>
                                    )}

                                    {/* Tooltip - Dynamic Alignment */}
                                    <div className={`absolute top-full mt-4 w-max max-w-[220px] bg-black/90 backdrop-blur-xl p-4 rounded-sm border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] opacity-0 group-hover/node:opacity-100 pointer-events-none transition-all duration-300 z-[100] scale-95 group-hover/node:scale-100 ${tooltipAlignClass}`}>
                                        <div className={`font-black text-sm mb-2 tracking-wider whitespace-normal leading-tight ${isUnlocked ? 'text-[var(--ak-accent-cyan)]' : 'text-white'}`}>{node.name}</div>
                                        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-500 to-transparent mb-2"></div>
                                        <div className="text-xs text-gray-400 leading-relaxed whitespace-normal">{node.description}</div>
                                        {!isUnlocked && (
                                            <div className="mt-3 flex items-center justify-center gap-2 text-[10px] font-mono bg-red-900/30 py-1.5 px-2 rounded border border-red-500/30 text-red-300 whitespace-nowrap">
                                                <span>🔒 需等級 LV.{node.reqLevel}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CharacterGrowthPanel;
