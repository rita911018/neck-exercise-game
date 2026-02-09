/**
 * IndexedDB 存储模块 - 大容量照片存储
 * 容量：50MB-1GB+（远超 localStorage 的 5-10MB）
 */

const DB_NAME = 'GamePhotoDB';
const DB_VERSION = 1;
const STORE_SCORES = 'scores';

class IndexedDBStorage {
    constructor() {
        this.db = null;
    }

    // 初始化数据库
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('IndexedDB 打开失败:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB 初始化成功');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // 创建分数存储
                if (!db.objectStoreNames.contains(STORE_SCORES)) {
                    const scoreStore = db.createObjectStore(STORE_SCORES, { keyPath: 'id' });
                    scoreStore.createIndex('score', 'score', { unique: false });
                    scoreStore.createIndex('date', 'date', { unique: false });
                }

                console.log('IndexedDB 数据库结构创建完成');
            };
        });
    }

    // 保存分数记录
    async saveScore(scoreData) {
        if (!this.db) await this.init();

        return new Promise(async (resolve, reject) => {
            try {
                // 添加唯一ID
                const record = {
                    id: Date.now(),
                    ...scoreData
                };

                const transaction = this.db.transaction([STORE_SCORES], 'readwrite');
                const store = transaction.objectStore(STORE_SCORES);

                const request = store.add(record);

                request.onsuccess = async () => {
                    console.log('分数保存成功');

                    // 清理旧记录，只保留前10名
                    await this.cleanOldScores();
                    resolve(true);
                };

                request.onerror = () => {
                    console.error('保存分数失败:', request.error);
                    reject(request.error);
                };
            } catch (e) {
                console.error('保存分数异常:', e);
                reject(e);
            }
        });
    }

    // 获取所有分数记录
    async getScores() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_SCORES], 'readonly');
            const store = transaction.objectStore(STORE_SCORES);
            const request = store.getAll();

            request.onsuccess = () => {
                const scores = request.result || [];
                // 按分数排序（从高到低）
                scores.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
                resolve(scores);
            };

            request.onerror = () => {
                console.error('读取分数失败:', request.error);
                resolve([]);
            };
        });
    }

    // 清理旧记录，只保留前3名
    async cleanOldScores() {
        const scores = await this.getScores();

        if (scores.length <= 3) return;

        // 删除第4名之后的记录
        const toDelete = scores.slice(3);

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_SCORES], 'readwrite');
            const store = transaction.objectStore(STORE_SCORES);

            toDelete.forEach(score => {
                store.delete(score.id);
            });

            transaction.oncomplete = () => {
                console.log(`清理了 ${toDelete.length} 条旧记录`);
                resolve();
            };

            transaction.onerror = () => {
                console.error('清理记录失败:', transaction.error);
                reject(transaction.error);
            };
        });
    }

    // 清空所有分数
    async clearAllScores() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_SCORES], 'readwrite');
            const store = transaction.objectStore(STORE_SCORES);
            const request = store.clear();

            request.onsuccess = () => {
                console.log('所有分数已清空');
                resolve(true);
            };

            request.onerror = () => {
                console.error('清空分数失败:', request.error);
                reject(request.error);
            };
        });
    }

    // 工具：压缩图片
    compressCanvas(canvas, quality = 0.8) {
        return canvas.toDataURL('image/jpeg', quality);
    }

    // 工具：下载图片
    downloadImage(base64Data, filename = 'snapshot.png') {
        const link = document.createElement('a');
        link.href = base64Data;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// 创建全局实例
const idbStorage = new IndexedDBStorage();

// 挂载到全局
window.AppStorage = idbStorage;
