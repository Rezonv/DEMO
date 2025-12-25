/**
 * 應用程式中心配置文件 (App Configuration)
 * 
 * 這裡控制著「開發模式」與「Demo 模式」的切換。
 * 只要將 IS_DEMO_MODE 設為 false，所有功能就會恢復原樣。
 */

export const APP_CONFIG = {
    // DEMO 模式開關
    IS_DEMO_MODE: false, // ← 已關閉 DEMO 模式

    // DEMO 模式設定
    DEMO_SETTINGS: {
        // 初始資源
        INITIAL_CREDITS: 1000000,
        // 初始星瓊數量（用於抽卡）
        INITIAL_STAR_JADE: 16000,

        // 允許的角色 ID（空陣列 = 允許所有角色）
        // 玩家從零角色開始，通過抽卡獲得任何角色
        ALLOWED_CHARACTER_IDS: [] as string[], // 空陣列表示不限制

        // 強制好感度（用於測試）
        FORCE_AFFECTION_500: true,

        // 體驗時長限制（天數）
        TRIAL_DAYS: 3,

        // 其他限制
        MAX_CUSTOM_CHARACTERS: 5,
        DISABLE_DATA_EXPORT: false,
        SHOW_DEMO_WATERMARK: true,
        DISABLE_GACHA: false, // 是否關閉抽卡
        DISABLE_COMBAT: false, // Demo 模式戰鬥已開啟
    }
};
