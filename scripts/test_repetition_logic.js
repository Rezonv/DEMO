/**
 * 文本重複性自動化測試腳本 (Automated Repetition Test Script)
 * 
 * 功能：
 * 1. 模擬多輪對話。
 * 2. 檢測生成內容之間以及與歷史紀錄之間的相似度。
 * 3. 驗證是否出現「呆板結尾」或「重複句式」。
 */

import crypto from 'crypto';

// 簡單的 Jaccard 相似度計算
function calculateSimilarity(str1, str2) {
    const set1 = new Set(str1.split(''));
    const set2 = new Set(str2.split(''));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
}

// 檢測重複句式 (N-gram 基礎)
function findRepeatedSentences(text, history) {
    const sentences = text.match(/[^。！？…\n]+[。！？…\n]*/g) || [];
    const historySentences = history.flatMap(h => h.match(/[^。！？…\n]+[。！？…\n]*/g) || []);

    const results = {
        duplicates: [],
        highSimilarity: []
    };

    for (const s of sentences) {
        if (s.length < 5) continue; // 忽略過短的感嘆詞

        for (const hs of historySentences) {
            if (s.trim() === hs.trim()) {
                results.duplicates.push(s.trim());
            } else {
                const sim = calculateSimilarity(s, hs);
                if (sim > 0.8) {
                    results.highSimilarity.push({ sentence: s.trim(), target: hs.trim(), similarity: sim });
                }
            }
        }
    }
    return results;
}

// 模擬測試流程
async function runTest() {
    console.log("=== 開始執行文本重複性模擬測試 ===");

    // 模擬一段有重複問題的歷史 (以前的情況)
    const history = [
        "你加快了抽插的速度，更加用力地將肉棒插進她的嘴裡。",
        "她的眼神迷離，嘴角掛著淫蕩的微笑，似乎在期待著下一次的性愛。",
        "你站在起身，走到她身後，一把將她壓倒在床。"
    ];

    // 模擬模型生成的新內容
    const newOutput = "你俯身吻住她的唇，雙手死死夾住她的纖腰。她的眼神迷離，嘴角掛著淫蕩的微笑，似乎在期待著下一次的性愛。最終，你在她的體內射出了大量的精液。她抬起頭，用渴望的眼神看著你，嘴角掛著淫蕩的微笑，似乎在期待著下一次的性愛。";

    console.log("\n[待測文本]:", newOutput);

    const report = findRepeatedSentences(newOutput, history);

    console.log("\n--- 測試報告 ---");
    if (report.duplicates.length > 0) {
        console.warn("❌ 偵測到完全重複的句子:");
        report.duplicates.forEach(d => console.warn(`   - "${d}"`));
    } else {
        console.log("✅ 未偵測到跨回合完全重複。");
    }

    if (report.highSimilarity.length > 0) {
        console.warn("⚠️ 偵測到高度相似內容 (疑似呆板套路):");
        report.highSimilarity.forEach(h => console.warn(`   - 目前: "${h.sentence}"\n     歷史: "${h.target}"\n     相似度: ${(h.similarity * 100).toFixed(2)}%`));
    } else {
        console.log("✅ 未偵測到高度相似內容。");
    }

    // 自我檢查生成內容內部的重複
    console.log("\n--- 內部循環檢查 ---");
    const internalSentences = newOutput.match(/[^。！？…\n]+[。！？…\n]*/g) || [];
    let internalRepeats = 0;
    for (let i = 0; i < internalSentences.length; i++) {
        for (let j = i + 1; j < internalSentences.length; j++) {
            if (calculateSimilarity(internalSentences[i], internalSentences[j]) > 0.9) {
                console.warn(`❌ 文本內部出現重複循環:\n   "${internalSentences[i].trim()}"\n   與\n   "${internalSentences[j].trim()}"`);
                internalRepeats++;
            }
        }
    }
    if (internalRepeats === 0) console.log("✅ 文本內部多樣性良好。");

    console.log("\n=== 測試結束 ===");
}

runTest();
