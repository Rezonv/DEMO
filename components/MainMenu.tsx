import React from 'react';
import {
    Terminal,
    Users,
    ShoppingBag,
    UserPlus,
    Search,
    ClipboardList,
    Home,
    Box,
    Book,
    RefreshCw,
    Sword,
    Briefcase
} from 'lucide-react';

interface MainMenuProps {
    onNavigate: (view: string) => void;
    assistantUrl?: string;
    onChangeAssistant: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onNavigate, assistantUrl, onChangeAssistant }) => {
    return (
        <div className="w-full h-full flex relative pointer-events-none overflow-hidden">
            {/* Change Assistant Button */}
            <button
                onClick={onChangeAssistant}
                className="absolute top-24 left-8 z-50 pointer-events-auto bg-black/40 hover:bg-[var(--ak-accent-cyan)]/20 border border-white/10 hover:border-[var(--ak-accent-cyan)] text-white px-6 py-3 rounded-sm backdrop-blur-md transition-all group flex items-center gap-3 shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] animate-slide-in-right"
                style={{ animationDelay: '0.1s' }}
            >
                <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500 text-[var(--ak-accent-cyan)]" />
                <span className="text-lg font-bold tracking-widest group-hover:text-[var(--ak-accent-cyan)]">更換助理</span>
            </button>

            {/* Left Side: Assistant Character */}
            <div className="absolute bottom-0 left-[-5%] h-[110%] w-[55%] z-0 pointer-events-none flex items-end justify-center animate-fade-in">
                {assistantUrl && (
                    <img
                        src={assistantUrl}
                        className="h-full object-contain drop-shadow-[0_0_30px_rgba(0,0,0,0.6)] mask-image-gradient-to-b"
                        alt="Assistant"
                    />
                )}
            </div>

            {/* Right Side: UI Grid */}
            <div className="absolute top-20 right-0 w-[60%] h-[calc(100%-5rem)] p-8 flex flex-col items-end pointer-events-auto z-10">

                {/* Upper Section: Terminal & Status */}
                <div className="flex w-full justify-end gap-4 mb-4 h-1/3 animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
                    {/* Terminal (Combat) */}
                    <button
                        onClick={() => onNavigate('combat_zone')}
                        className="w-2/3 h-full bg-black/40 backdrop-blur-md border-t-2 border-r-2 border-[var(--ak-accent-cyan)] relative group overflow-hidden shadow-2xl clip-path-polygon"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
                    >
                        {/* Content */}
                        <div className="absolute top-6 right-8 text-right z-10 transition-transform group-hover:-translate-x-2">
                            <div className="text-7xl font-black italic text-white/50 group-hover:text-white tracking-tighter">作戰</div>
                            <div className="text-2xl font-bold text-[var(--ak-accent-cyan)] tracking-[0.8em] mt-2 group-hover:tracking-[1em] transition-all">TERMINAL</div>
                            <div className="flex items-center justify-end gap-2 mt-6">
                                <span className="text-[var(--ak-accent-cyan)] font-mono text-xs tracking-widest bg-[var(--ak-accent-cyan)]/10 px-2 py-1">AVAILABLE NOW</span>
                            </div>
                        </div>

                        {/* Icon */}
                        <Sword className="absolute bottom-6 left-10 w-32 h-32 text-white/10 group-hover:scale-110 group-hover:rotate-12 transition-all" />
                    </button>
                </div>

                {/* Middle Section: Squads & Operators */}
                <div className="flex w-full justify-end gap-4 mb-4 h-1/4">
                    <MenuButton
                        label="故事" subLabel="STORY"
                        icon={<Book className="w-8 h-8" />}
                        onClick={() => onNavigate('character_select')}
                        className="flex-1 border-l-2 border-white/20 hover:border-[var(--ak-accent-yellow)]"
                        delay="0.3s"
                    />
                    <MenuButton
                        label="幹員" subLabel="OPERATORS"
                        icon={<Users className="w-8 h-8" />}
                        onClick={() => onNavigate('character_management')}
                        className="flex-1 border-l-2 border-white/20 hover:border-[var(--ak-accent-yellow)]"
                        delay="0.4s"
                    />
                </div>

                {/* Lower Section: Store, Recruit, Headhunt */}
                <div className="flex w-full justify-end gap-4 mb-4 h-1/4">
                    <MenuButton
                        label="採購" subLabel="STORE"
                        icon={<ShoppingBag className="w-8 h-8" />}
                        onClick={() => onNavigate('shop')}
                        className="flex-1 border-b-2 border-white/10 hover:border-[var(--ak-accent-cyan)]"
                        delay="0.5s"
                    />
                    <MenuButton
                        label="招募" subLabel="RECRUIT"
                        icon={<Briefcase className="w-8 h-8" />}
                        onClick={() => onNavigate('gacha')}
                        className="flex-1 border-b-2 border-white/10 hover:border-[var(--ak-accent-cyan)]"
                        delay="0.6s"
                    />
                    <MenuButton
                        label="尋訪" subLabel="HEADHUNT"
                        icon={<Search className="w-8 h-8" />}
                        onClick={() => onNavigate('gacha')}
                        className="flex-1 bg-[var(--ak-accent-yellow)]/10 text-white border-b-2 border-[var(--ak-accent-yellow)]"
                        delay="0.7s"
                        highlight
                    />
                </div>

                {/* Bottom Section: Mission, Base, Depot */}
                <div className="flex w-full justify-end gap-4 h-1/5">
                    <SmallMenuButton label="任務 (MEMBER)" icon={<ClipboardList className="w-6 h-6" />} onClick={() => onNavigate('expedition')} delay="0.8s" />
                    <SmallMenuButton label="基建 (BASE)" icon={<Home className="w-6 h-6" />} onClick={() => onNavigate('dream_home')} delay="0.85s" />
                    <SmallMenuButton label="倉庫 (DEPOT)" icon={<Box className="w-6 h-6" />} onClick={() => onNavigate('inventory')} delay="0.9s" />
                    <SmallMenuButton label="收藏 (COLLECTION)" icon={<Terminal className="w-6 h-6" />} onClick={() => onNavigate('library')} delay="0.95s" />
                </div>

            </div>
        </div>
    );
};

const MenuButton = ({ label, subLabel, icon, onClick, className, highlight, delay }: any) => (
    <button
        onClick={onClick}
        className={`relative group overflow-hidden p-6 flex flex-col justify-between transition-all duration-300 
        hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] 
        bg-black/40 backdrop-blur-md animate-slide-in-right
        ${className}`}
        style={{ animationDelay: delay }}
    >
        <div className={`absolute top-4 right-4 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 ${highlight ? 'text-white' : 'text-[var(--ak-accent-cyan)]'}`}>
            {icon}
        </div>
        <div className="mt-auto z-10">
            <div className={`text-3xl font-black italic tracking-tighter ${highlight ? 'text-white' : 'text-gray-200 group-hover:text-white'} drop-shadow-md`}>{label}</div>
            <div className={`text-sm font-bold tracking-widest mt-1 ${highlight ? 'text-red-100' : 'text-gray-500 group-hover:text-[var(--ak-accent-cyan)]'}`}>{subLabel}</div>
        </div>
        {/* Hover Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </button>
);

const SmallMenuButton = ({ label, icon, onClick, delay }: any) => (
    <button
        onClick={onClick}
        className="flex-1 bg-black/40 backdrop-blur-md border border-white/10 hover:border-[var(--ak-accent-cyan)] hover:bg-[var(--ak-accent-cyan)]/10 flex flex-col items-center justify-center gap-2 group transition-all duration-300 animate-slide-in-right hover:shadow-[0_0_15px_rgba(0,240,255,0.2)]"
        style={{ animationDelay: delay }}
    >
        <div className="text-gray-400 group-hover:text-white group-hover:scale-110 transition-all duration-300">{icon}</div>
        <div className="text-[10px] font-bold text-gray-500 group-hover:text-[var(--ak-accent-cyan)] tracking-wider">{label}</div>
    </button>
);

export default MainMenu;
