export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    // 生成粒子爆炸
    emit(x, y, color = '#FFD700', count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.005 + Math.random() * 0.015;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0, // 1.0 -> 0.0
                decay: 0.02 + Math.random() * 0.03,
                color: color,
                size: 5 + Math.random() * 5
            });
        }
    }

    // 生成漂浮文字
    emitText(x, y, text, color = '#FFF') {
        this.particles.push({
            type: 'text',
            x: x,
            y: y,
            vx: 0,
            vy: -0.002, // 向上飘
            life: 1.0,
            decay: 0.015,
            text: text,
            color: color,
            size: 40
        });
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];

            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;

            if (p.type !== 'text') {
                p.vy += 0.0005; // 重力
            }

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx, width, height) {
        this.particles.forEach(p => {
            const px = p.x * width;
            const py = p.y * height;

            ctx.globalAlpha = Math.max(0, p.life);

            if (p.type === 'text') {
                // 保存状态
                ctx.save();
                // 翻转文字，抵消CSS的scaleX(-1)
                ctx.translate(px, py);
                ctx.scale(-1, 1);

                ctx.font = `bold ${p.size}px sans-serif`;
                ctx.fillStyle = p.color;
                ctx.textAlign = 'center';
                ctx.shadowColor = 'black';
                ctx.shadowBlur = 4;
                ctx.fillText(p.text, 0, 0);
                ctx.shadowBlur = 0;

                // 恢复状态
                ctx.restore();
            } else {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(px, py, p.size * p.life, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalAlpha = 1.0;
        });
    }
}
