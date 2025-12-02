import React from 'react';
import { Character, AffectionMilestone, SceneContext } from '../../types';

interface Props {
    character: Character;
    affection: number;
    bondInfo: { level: number; title: string; bonus: number; color: string; desc: string };
    milestones: AffectionMilestone[];
    onStartSpecialStory?: (char: Character, scene: SceneContext) => void;
    onUpdateAffection?: (charId: string, newScore: number) => void;
}

const CharacterBondPanel: React.FC<Props> = ({
    character, affection, bondInfo, milestones, onStartSpecialStory, onUpdateAffection
}) => {
    return (
        <div className="space-y-8 animate-fade-in-right">
            <div className="bg-gradient-to-br from-pink-900/30 to-purple-900/30 p-6 rounded-2xl border border-pink-500/30 flex items-center gap-6 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-500/20 blur-3xl rounded-full"></div>

                {/* Heart Animation */}
                <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                    <div className="absolute inset-0 text-pink-900 text-7xl animate-pulse">♥</div>
                    <div className="absolute inset-0 text-pink-500 text-7xl overflow-hidden" style={{ clipPath: 'inset(' + (100 - (Math.min(affection, 500) / 500) * 100) + '% 0 0 0)' }}>♥</div>
                    <div className="absolute bottom-0 text-[10px] font-bold text-white drop-shadow-md">{Math.floor((Math.min(affection, 500) / 500) * 100)}%</div>
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-sm text-pink-200 font-bold uppercase tracking-widest mb-1">羈絆等級 (BOND LEVEL)</div>
                            <h3 className={`text-2xl font-black ${bondInfo.color}`}>{bondInfo.title}</h3>
                        </div>
                    </div>
                    <p className="text-xs text-pink-100/60 mt-1">{bondInfo.desc}</p>
                </div>
            </div>

            {/* Milestones Timeline */}
            <div className="pl-4 border-l-2 border-gray-700 space-y-8 relative">
                {milestones.map((m, idx) => {
                    const isUnlocked = affection >= m.reqAffection;
                    const isNext = !isUnlocked && (idx === 0 || affection >= milestones[idx - 1].reqAffection);

                    return (
                        <div key={idx} className={`relative pl-6 transition-all ${isUnlocked ? 'opacity-100' : 'opacity-50'}`}>
                            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${isUnlocked ? 'bg-pink-500 border-pink-300' : isNext ? 'bg-gray-800 border-yellow-500 animate-pulse' : 'bg-gray-900 border-gray-600'}`}></div>
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-white text-sm">{m.title}</h4>
                                    <span className="text-[10px] font-mono text-gray-500">{m.reqAffection} Pts</span>
                                </div>
                                <p className="text-xs text-gray-400 mb-3">{m.description}</p>
                                <div className="flex gap-2 flex-wrap">
                                    {m.rewards.map((r, ri) => (
                                        <span key={ri} className="text-[10px] bg-black/30 px-2 py-1 rounded border border-gray-600 text-gray-300 flex items-center gap-1">
                                            {r.type === 'STAT_BONUS' && <span className="text-green-400">📈</span>}
                                            {r.type === 'STORY_UNLOCK' && <span className="text-pink-400">🎬</span>}
                                            {r.label}
                                        </span>
                                    ))}
                                </div>
                                {isUnlocked && m.rewards.some(r => r.type === 'STORY_UNLOCK') && (
                                    <button
                                        onClick={() => onStartSpecialStory && m.sceneContext && onStartSpecialStory(character, { ...m.sceneContext, time: '回憶' })}
                                        className="mt-3 w-full bg-pink-600/20 hover:bg-pink-600/40 text-pink-300 border border-pink-500/30 py-2 rounded text-xs font-bold transition-colors"
                                    >
                                        ▶ 回顧劇情
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CharacterBondPanel;
