export class ItemSystem {
    constructor(config) {
        this.config = config;
        this.items = []; // {x, y, id, type, speed}
        this.lastSpawnTime = 0;
        this.onCatch = null; // Callback
        this.onHit = null;   // Callback for bad items
    }

    update(keypoints, now, timeLeft = 180) {
        // 1. Spawn Logic - 临近结束时更密集
        let spawnRate = this.config.spawnRate;

        // 最后30秒加速掉落
        if (timeLeft <= 30) {
            spawnRate = 800; // 更快
        } else if (timeLeft <= 60) {
            spawnRate = 1000; // 稍快
        }

        if (now - this.lastSpawnTime > spawnRate) {
            this.forceSpawn(now);
        }

        // 2. Move & Collision
        for (let i = this.items.length - 1; i >= 0; i--) {
            let item = this.items[i];
            item.y += item.speed;

            // Remove if out of screen
            if (item.y > 1.1) {
                this.items.splice(i, 1);
                continue;
            }

            // 3. Collision Detection (只有当有人时才检测碰撞)
            if (keypoints && this.checkCollision(item, keypoints)) {
                this.items.splice(i, 1);
                if (item.type === 'bomb') {
                    if (this.onHit) this.onHit(item);
                } else {
                    if (this.onCatch) this.onCatch(item);
                }
            }
        }
    }

    forceSpawn(now) {
        this.lastSpawnTime = now;
        const rand = Math.random();

        let type = 'normal';
        let speedMult = 1.0;

        if (rand > 0.95) { // 5% Lion
            type = 'lion';
            speedMult = 1.5; // Fast!
        } else if (rand > 0.65) { // 30% Bomb
            type = 'bomb';
            speedMult = 1.2;
        } else if (rand > 0.5) { // 15% Gold
            type = 'gold';
        }

        // 红包主要掉落在左右两侧，引导转头
        let x;
        if (Math.random() < 0.85) {
            // 85%概率在两侧
            x = Math.random() < 0.5 ? 0.05 + Math.random() * 0.2 : 0.75 + Math.random() * 0.2;
        } else {
            // 15%概率在中间
            x = 0.4 + Math.random() * 0.2;
        }

        this.items.push({
            id: Math.random().toString(36),
            x: x,
            y: -0.1,
            type: type,
            speed: this.config.baseSpeed * speedMult
        });
    }

    checkCollision(item, kp) {
        const hitDist = 0.20; // 增大碰撞范围，更容易接到

        // 用鼻子和肩膀接红包
        const hitNose = Math.hypot(item.x - kp.nose.x, item.y - kp.nose.y) < hitDist;
        const hitLS = Math.hypot(item.x - kp.ls.x, item.y - kp.ls.y) < hitDist;
        const hitRS = Math.hypot(item.x - kp.rs.x, item.y - kp.rs.y) < hitDist;

        return hitNose || hitLS || hitRS;
    }

    draw(ctx, canvasWidth, canvasHeight) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        this.items.forEach(item => {
            const px = item.x * canvasWidth;
            const py = item.y * canvasHeight;

            let icon = '🧧';
            let fontSize = 45; // 放大一些

            if (item.type === 'gold') {
                icon = '🧧';
                fontSize = 50; // 放大
                // Gold effect
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 20;
                ctx.font = `${fontSize}px sans-serif`;
                ctx.fillText('✨', px - 20, py - 20);
                ctx.shadowBlur = 0;
            } else if (item.type === 'bomb') {
                icon = '💣';
                fontSize = 45; // 放大
            } else if (item.type === 'lion') {
                icon = '🦁';
                fontSize = 60; // 放大
                // Red Glow
                ctx.shadowColor = '#FF0000';
                ctx.shadowBlur = 30;
            }

            ctx.font = `${fontSize}px sans-serif`;
            ctx.fillText(icon, px, py);
            ctx.shadowBlur = 0;
        });
    }
}
