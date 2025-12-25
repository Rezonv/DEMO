/**
 * 一次性清理腳本：刪除自定義角色「允允」
 * 
 * 使用方法：
 * 1. 在瀏覽器 Console (F12) 中複製貼上此腳本
 * 2. 執行後會自動刪除「允允」並重新載入頁面
 */

(async function deleteYunyun() {
    console.log('🗑️ 開始刪除自定義角色「允允」...');

    const DB_NAME = 'DreamCompanionDB';
    const DB_VERSION = 5;

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('❌ 無法打開數據庫');
            reject(request.error);
        };

        request.onsuccess = async (event) => {
            const db = event.target.result;

            try {
                // 1. 獲取自定義角色列表
                const customChars = await new Promise((resolve, reject) => {
                    const tx = db.transaction(['app_data'], 'readonly');
                    const store = tx.objectStore('app_data');
                    const req = store.get('custom_characters');

                    req.onsuccess = () => resolve(req.result?.value || []);
                    req.onerror = () => reject(req.error);
                });

                console.log('📋 當前自定義角色:', customChars.map(c => c.name));

                // 2. 找到「允允」
                const yunyunChar = customChars.find(c => c.name === '允允');

                if (!yunyunChar) {
                    console.log('⚠️ 找不到角色「允允」');
                    alert('找不到角色「允允」，可能已被刪除。');
                    resolve();
                    return;
                }

                console.log('✅ 找到角色「允允」，ID:', yunyunChar.id);

                // 3. 從自定義角色列表中移除
                const filteredChars = customChars.filter(c => c.name !== '允允');

                await new Promise((resolve, reject) => {
                    const tx = db.transaction(['app_data'], 'readwrite');
                    const store = tx.objectStore('app_data');
                    const req = store.put({ key: 'custom_characters', value: filteredChars });

                    req.onsuccess = () => {
                        console.log('✅ 已從自定義角色列表中刪除');
                        resolve();
                    };
                    req.onerror = () => reject(req.error);
                });

                // 4. 從 userState 中移除
                const userState = await new Promise((resolve, reject) => {
                    const tx = db.transaction(['app_data'], 'readonly');
                    const store = tx.objectStore('app_data');
                    const req = store.get('user_state');

                    req.onsuccess = () => resolve(req.result?.value);
                    req.onerror = () => reject(req.error);
                });

                if (userState) {
                    // 移除角色 ID
                    userState.ownedCharacterIds = userState.ownedCharacterIds.filter(
                        id => id !== yunyunChar.id
                    );

                    // 移除角色進度
                    delete userState.characterProgression[yunyunChar.id];

                    await new Promise((resolve, reject) => {
                        const tx = db.transaction(['app_data'], 'readwrite');
                        const store = tx.objectStore('app_data');
                        const req = store.put({ key: 'user_state', value: userState });

                        req.onsuccess = () => {
                            console.log('✅ 已從擁有角色列表中刪除');
                            resolve();
                        };
                        req.onerror = () => reject(req.error);
                    });
                }

                // 5. 刪除頭像圖片（如果有）
                try {
                    const tx = db.transaction(['avatars'], 'readwrite');
                    const store = tx.objectStore('avatars');
                    store.delete(yunyunChar.id);
                    console.log('✅ 已刪除頭像圖片');
                } catch (e) {
                    console.log('⚠️ 刪除頭像時出錯（可能不存在）:', e.message);
                }

                console.log('🎉 角色「允允」已完全刪除！');
                alert('角色「允允」已刪除！頁面即將重新載入。');

                setTimeout(() => {
                    location.reload();
                }, 1000);

                resolve();

            } catch (error) {
                console.error('❌ 刪除過程中出錯:', error);
                alert('刪除失敗：' + error.message);
                reject(error);
            }
        };
    });
})();
