// 正確的診斷腳本：檢查 IndexedDB 中的數據
// 在瀏覽器 Console 中執行此腳本

console.log('=== 檢查 IndexedDB 中的 userState ===\n');

// 打開 IndexedDB
const request = indexedDB.open('DreamCompanionDB');

request.onsuccess = function (event) {
    const db = event.target.result;
    const transaction = db.transaction(['gameData'], 'readonly');
    const objectStore = transaction.objectStore('gameData');
    const getRequest = objectStore.get('user_state');

    getRequest.onsuccess = function () {
        const userState = getRequest.result;
        if (userState) {
            console.log('✅ 找到 userState 數據:');
            console.log('   - 擁有的角色:', userState.ownedCharacterIds);
            console.log('   - 角色進度:', Object.keys(userState.characterProgression || {}));

            // 檢查 yunli
            if (userState.ownedCharacterIds?.includes('yunli')) {
                console.log('\n✅ yunli 在數據庫中！');
                console.log('   - yunli 進度:', userState.characterProgression?.yunli);
            } else {
                console.log('\n❌ yunli 不在數據庫中');
            }
        } else {
            console.log('❌ 找不到 userState 數據');
        }
    };

    getRequest.onerror = function () {
        console.error('❌ 讀取失敗:', getRequest.error);
    };
};

request.onerror = function () {
    console.error('❌ 無法打開 IndexedDB');
};
