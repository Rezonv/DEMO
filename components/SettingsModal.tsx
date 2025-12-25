import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const { imageSettings, setImageSettings, textSettings, setTextSettings } = useGame();
    const [localImageSettings, setLocalImageSettings] = useState(imageSettings);
    const [localTextSettings, setLocalTextSettings] = useState(textSettings);

    useEffect(() => {
        setLocalImageSettings(imageSettings);
        setLocalTextSettings(textSettings);
    }, [imageSettings, textSettings, isOpen]);

    const handleSave = () => {
        setImageSettings(localImageSettings);
        setTextSettings(localTextSettings);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span>⚙️</span> 系統設定
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6">

                    {/* Image Generation Settings */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-pink-400 border-b border-pink-500/30 pb-2">圖像生成設定 (RunPod)</h3>

                        <div className="space-y-4 animate-fade-in-up bg-indigo-900/20 p-4 rounded-xl border border-indigo-500/30">

                            {/* Checkpoint Name Input (Restored for Debugging) */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Checkpoint Name (.safetensors)</label>
                                <input
                                    type="text"
                                    value={localImageSettings.customModelName || ''}
                                    onChange={(e) => setLocalImageSettings(prev => ({ ...prev, customModelName: e.target.value }))}
                                    placeholder="pony_v6_xl.safetensors"
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-mono text-sm"
                                />
                                <p className="text-xs text-gray-500">
                                    若 RunPod 報錯找不到模型，請在此輸入正確檔名 (需在 models/checkpoints 資料夾內)。
                                </p>
                            </div>

                            {/* LoRA Settings */}
                            <div className="space-y-2 pt-2 border-t border-indigo-500/30">
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-medium text-gray-300">Global LoRA Filename (Optional)</label>
                                    <span className="text-xs text-indigo-300">Strength: {localImageSettings.runpodLoraStrength || 1.0}</span>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={localImageSettings.runpodLoraName || ''}
                                        onChange={(e) => setLocalImageSettings(prev => ({ ...prev, runpodLoraName: e.target.value }))}
                                        placeholder="my_lora.safetensors"
                                        className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-mono text-sm"
                                    />
                                    <input
                                        type="number"
                                        min="0.1"
                                        max="2.0"
                                        step="0.1"
                                        value={localImageSettings.runpodLoraStrength || 1.0}
                                        onChange={(e) => setLocalImageSettings(prev => ({ ...prev, runpodLoraStrength: parseFloat(e.target.value) }))}
                                        className="w-20 bg-gray-800 border border-gray-600 rounded-lg px-2 py-2 text-white text-center focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                                    />
                                </div>
                                <p className="text-xs text-gray-500">
                                    輸入 LoRA 檔名 (需在 RunPod 上)。留空則不使用。<br />
                                    <span className="text-yellow-500">注意：個別角色的 LoRA 設定將優先於此全域設定。</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Text Generation Settings */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-pink-400 border-b border-pink-500/30 pb-2">文字生成設定 (LLM)</h3>

                        <div className="space-y-4 animate-fade-in-up bg-pink-900/20 p-4 rounded-xl border border-pink-500/30">
                            {/* SaaS Mode: Fixed Provider */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Provider</label>
                                <div className="w-full bg-gray-900 border border-pink-500/30 rounded-lg px-4 py-3 text-pink-400 font-bold flex items-center shadow-[0_0_10px_rgba(236,72,153,0.1)]">
                                    <span className="mr-2">🚀</span> RunPod Serverless (SaaS Enterprise)
                                </div>
                            </div>

                            {/* RunPod Settings (Fixed) */}
                            {localTextSettings.provider === 'runpod' && (
                                <>
                                    <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-lg mb-4 mt-4">
                                        <p className="text-xs text-blue-300 leading-relaxed">
                                            系統已連接至專屬的高效能運算節點 (Midnight Miqu 70B)。
                                            <br />無需任何設定，即刻享受無審查、高智能的對話體驗。
                                        </p>
                                    </div>
                                    <div className="space-y-2 opacity-75 grayscale hover:grayscale-0 transition-all duration-300">
                                        <label className="block text-sm font-medium text-gray-400">RunPod Base URL (Admin Only)</label>
                                        <input
                                            type="text"
                                            value={localTextSettings.runpodBaseUrl || ''}
                                            onChange={(e) => setLocalTextSettings(prev => ({ ...prev, runpodBaseUrl: e.target.value }))}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-gray-500 font-mono text-xs focus:ring-1 focus:ring-gray-500 outline-none"
                                            disabled // Optional: Disable logic if we want to strictly lock it, but user might want to edit?
                                        // User asked to "only let them use Serverless". I will keep it editable but look "advanced".
                                        />
                                    </div>
                                    <div className="space-y-2 opacity-75 grayscale hover:grayscale-0 transition-all duration-300">
                                        <label className="block text-sm font-medium text-gray-400">RunPod API Key (Hidden)</label>
                                        <input
                                            type="password"
                                            value={localTextSettings.runpodApiKey || ''}
                                            onChange={(e) => setLocalTextSettings(prev => ({ ...prev, runpodApiKey: e.target.value }))}
                                            placeholder="Embedded in deployment"
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-gray-500 font-mono text-xs focus:ring-1 focus:ring-gray-500 outline-none"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>


                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-800 bg-gray-800/50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg hover:bg-gray-700 text-gray-300 transition-colors">取消</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg font-bold shadow-lg shadow-pink-900/20 transition-all active:scale-95">
                        儲存設定
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SettingsModal;
