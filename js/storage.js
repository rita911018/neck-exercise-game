/**
 * 新年运动大挑战 - 数据存储模块
 * 使用 localStorage 管理分数和精彩瞬间
 */

const STORAGE_KEYS = {
    SCORES: 'ny_scores_v3', // v3: 基于分数 (Higher is better)
    MOMENTS: 'ny_moments_v3'
};

const Storage = {
    // --- 分数管理 ---
    getScores: function () {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.SCORES);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('读取分数失败', e);
            return [];
        }
    },

    saveScore: function (scoreData) {
        // scoreData: { score: number, date: string, moments: [moment objects] }
        const scores = this.getScores();
        scores.push({
            id: Date.now(),
            ...scoreData
        });
        // 按分数排序 (分数越高越好)
        scores.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));

        // 只保留前3名
        const keepScores = scores.slice(0, 3);

        try {
            localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(keepScores));
            return true;
        } catch (e) {
            console.error('保存分数失败:', e);
            console.error('错误类型:', e.name);
            console.error('错误信息:', e.message);

            // 检测具体错误类型
            if (e.name === 'QuotaExceededError') {
                alert('存储空间不足！\n\n建议：\n1. 清理精彩瞬间\n2. 清理旧的排行榜记录');
            } else if (e.name === 'SecurityError') {
                alert('无法保存成绩！\n\n可能原因：\n1. 浏览器处于隐私模式\n2. localStorage 被禁用\n\n建议：使用普通浏览模式打开游戏');
            } else {
                alert('保存成绩失败！\n\n错误：' + e.message + '\n\n建议：刷新页面重试');
            }
            return false;
        }
    },

    // --- 精彩瞬间管理 ---
    getMoments: function () {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.MOMENTS);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('读取精彩瞬间失败', e);
            return [];
        }
    },

    saveMoment: function (momentData) {
        // momentData: { challengeName, challengeIcon, imageData (base64) }
        const moments = this.getMoments();
        const newMoment = {
            id: Date.now() + Math.random().toString().slice(2, 6),
            timestamp: new Date().toISOString(),
            ...momentData
        };

        // 新的在前面
        moments.unshift(newMoment);

        // 只保留最新的30张照片（照片库限制）
        let keepMoments = moments.slice(0, 30);

        // 智能清理：如果存储失败，逐步删除旧照片直到成功
        let maxRetries = 10;
        let retryCount = 0;

        while (retryCount < maxRetries) {
            try {
                localStorage.setItem(STORAGE_KEYS.MOMENTS, JSON.stringify(keepMoments));

                // 如果删除了照片才成功，提示用户
                if (retryCount > 0) {
                    const deletedCount = moments.slice(0, 50).length - keepMoments.length;
                    console.log(`自动清理了 ${deletedCount} 张旧照片以释放空间`);
                }

                return newMoment;
            } catch (e) {
                console.error(`保存照片失败 (尝试 ${retryCount + 1}/${maxRetries})`, e);
                console.error('错误类型:', e.name);
                console.error('错误信息:', e.message);

                // 检测是否是 localStorage 被禁用
                if (e.name === 'SecurityError' || e.message.includes('not available')) {
                    alert('无法保存照片！\n\n可能原因：\n1. 浏览器处于隐私模式\n2. localStorage 被禁用\n\n建议：使用普通浏览模式打开游戏');
                    return null;
                }

                // 如果还有照片可以删除，每次删除30%（更激进）
                if (keepMoments.length > 1) {
                    const deleteCount = Math.max(1, Math.floor(keepMoments.length * 0.3));
                    keepMoments = keepMoments.slice(0, keepMoments.length - deleteCount);
                    retryCount++;
                } else {
                    // 已经没有照片可以删除了
                    alert('存储空间不足！请手动清理相册中的照片。');
                    return null;
                }
            }
        }

        // 重试次数用完
        alert('存储空间严重不足！请清理相册或浏览器缓存。');
        return null;
    },

    deleteMoment: function (id) {
        let moments = this.getMoments();
        moments = moments.filter(m => m.id !== id);
        localStorage.setItem(STORAGE_KEYS.MOMENTS, JSON.stringify(moments));
        return true;
    },

    // 批量删除照片
    deleteMoments: function (ids) {
        let moments = this.getMoments();
        moments = moments.filter(m => !ids.includes(m.id));
        localStorage.setItem(STORAGE_KEYS.MOMENTS, JSON.stringify(moments));
        return true;
    },

    // 删除所有照片
    deleteAllMoments: function () {
        localStorage.setItem(STORAGE_KEYS.MOMENTS, JSON.stringify([]));
        return true;
    },

    // --- 工具 ---
    downloadImage: function (base64Data, filename = 'snapshot.png') {
        const link = document.createElement('a');
        link.href = base64Data;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // 压缩图片 (输入Canvas, 输出Base64)
    compressCanvas: function (canvas, quality = 0.5) {
        return canvas.toDataURL('image/jpeg', quality);
    },

    // 清空所有数据（排名和照片）
    clearAll: function () {
        localStorage.removeItem(STORAGE_KEYS.SCORES);
        localStorage.removeItem(STORAGE_KEYS.MOMENTS);
        return true;
    }
};

// 挂载到全局
window.AppStorage = Storage;
