// 測試腳本：驗證抽卡角色顯示
// 在瀏覽器 Console 中執行此腳本

console.log('=== 抽卡角色顯示診斷 ===\n');

// 1. 檢查 localStorage 中的數據
const userState = JSON.parse(localStorage.getItem('userState') || '{}');
console.log('1. 擁有的角色 ID:', userState.ownedCharacterIds);
console.log('2. 角色進度數據:', Object.keys(userState.characterProgression || {}));

// 2. 檢查 DEMO 模式設定
console.log('\n3. DEMO 模式設定:');
console.log('   - IS_DEMO_MODE:', window.APP_CONFIG?.IS_DEMO_MODE);
console.log('   - ALLOWED_CHARACTER_IDS:', window.APP_CONFIG?.DEMO_SETTINGS?.ALLOWED_CHARACTER_IDS);

// 3. 檢查角色是否在 CHARACTERS 列表中
console.log('\n4. 檢查 yunli 是否在 CHARACTERS 中:');
const yunliChar = window.CHARACTERS?.find(c => c.id === 'yunli');
console.log('   - yunli 角色:', yunliChar ? '✅ 存在' : '❌ 不存在');
if (yunliChar) {
    console.log('   - 角色資料:', yunliChar);
}

// 4. 測試過濾邏輯
console.log('\n5. 測試過濾邏輯:');
const isAllowed = window.APP_CONFIG?.DEMO_SETTINGS?.ALLOWED_CHARACTER_IDS.includes('yunli');
const isOwned = userState.ownedCharacterIds?.includes('yunli');
console.log('   - yunli 在允許列表中:', isAllowed ? '✅ 是' : '❌ 否');
console.log('   - yunli 在擁有列表中:', isOwned ? '✅ 是' : '❌ 否');
console.log('   - 應該顯示:', (isAllowed || isOwned) ? '✅ 是' : '❌ 否');

console.log('\n=== 診斷完成 ===');
console.log('\n💡 如果「應該顯示」為 ✅ 但角色列表中沒有，請：');
console.log('1. 完全停止開發伺服器 (Ctrl+C)');
console.log('2. 重新啟動 (npm run dev)');
console.log('3. 硬重新整理瀏覽器 (Ctrl+Shift+R)');
