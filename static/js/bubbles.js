document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('bubble-background');
    if (!canvas) {
        console.error('Bubble background canvas not found!');
        return;
    }
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        bubbles.forEach(bubble => { // Optional: Re-position bubbles on resize
            bubble.x = Math.random() * width;
            bubble.y = Math.random() * height;
        });
    });

    const colors = [
        '#3B1E5A', '#1A1C6A', '#0C7B8A', '#65C744',
        '#F5F142', '#F7921E', '#D1325E', '#5B1A36'
    ];

    const numBubbles = 75; // Number of bubbles
    const bubbles = [];

    class SmokeParticle {
        constructor(x, y, bubbleRadius) {
            // Start particle near the edge of the bubble
            const angle = Math.random() * Math.PI * 2;
            this.x = x + (bubbleRadius * 0.8) * Math.cos(angle); // Start slightly inside or on edge
            this.y = y + (bubbleRadius * 0.8) * Math.sin(angle);

            this.radius = Math.random() * 4 + 2; // Smoke particle radius 2 to 6
            this.initialRadius = this.radius;
            this.color = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black

            // Move outwards and slightly upwards
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = -Math.random() * 0.3 - 0.2; // Mostly upwards

            this.life = Math.random() * 40 + 80; // Lifespan: 80-120 frames
            this.initialLife = this.life;
        }

        update() {
            this.life -= 1;
            this.x += this.speedX;
            this.y += this.speedY;

            // Fade out and expand
            const lifeRatio = Math.max(0, this.life / this.initialLife);
            this.radius = this.initialRadius * (1 + (1 - lifeRatio) * 0.5); // Expand as it dies
            this.alpha = lifeRatio * 0.3; // Fade out, max alpha 0.3 for subtlety
        }

        draw() {
            if (this.life <= 0) return;

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.fillStyle = `rgba(0, 0, 0, ${this.alpha})`;
            ctx.fill();
            ctx.closePath();
        }
    }

    class Bubble {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.radius = Math.random() * 15 + 5; // Radius between 5 and 20
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.speedX = (Math.random() - 0.5) * 2; // Random horizontal speed (-1 to 1)
            this.speedY = (Math.random() - 0.5) * 2; // Random vertical speed (-1 to 1)

            this.smokeParticles = [];
            this.smokeEmitInterval = 5; // Emit smoke every 5 frames (approx)
            this.smokeEmitCounter = 0;
            this.maxSmokeParticles = 30; // Max smoke particles per bubble
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Bounce off walls
            if (this.x + this.radius > width || this.x - this.radius < 0) {
                this.speedX *= -1;
                this.x = Math.max(this.radius, Math.min(width - this.radius, this.x)); // Prevent sticking
            }
            if (this.y + this.radius > height || this.y - this.radius < 0) {
                this.speedY *= -1;
                this.y = Math.max(this.radius, Math.min(height - this.radius, this.y)); // Prevent sticking
            }

            // Update smoke particles
            this.smokeEmitCounter++;
            if (this.smokeEmitCounter >= this.smokeEmitInterval && this.smokeParticles.length < this.maxSmokeParticles) {
                this.smokeParticles.push(new SmokeParticle(this.x, this.y, this.radius));
                this.smokeEmitCounter = 0;
            }

            for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
                this.smokeParticles[i].update();
                if (this.smokeParticles[i].life <= 0) {
                    this.smokeParticles.splice(i, 1);
                }
            }
        }

        draw() {
            // Draw smoke first, so it's behind the bubble's main body and shine
            this.smokeParticles.forEach(particle => particle.draw());

            // Save context state for bubble drawing
            ctx.save();

            // Shadow for the bubble itself
            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'; // Semi-transparent black shadow
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            // Radial gradient for shine effect
            // Highlight will be slightly offset to top-left
            let highlightX = this.x - this.radius * 0.3;
            let highlightY = this.y - this.radius * 0.3;

            const gradient = ctx.createRadialGradient(
                highlightX, highlightY, this.radius * 0.05, // Inner circle (highlight point)
                this.x, this.y, this.radius                 // Outer circle (bubble edge)
            );

            // Make the highlight brighter/whiter but somewhat transparent
            // The exact color of the highlight can be tricky.
            // We'll use a lighter version of the bubble's color or a generic white.
            // For simplicity, let's try a generic white highlight first.
            // To make a lighter version of bubble color:
            // e.g. tinycolor(this.color).lighten(30).setAlpha(0.8).toRgbString();
            // This would require a color manipulation library.
            // For now, a semi-transparent white:
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)'); // Shine color (center of gradient)
            gradient.addColorStop(0.7, this.color); // Bubble's actual color (outer part of gradient)
            // gradient.addColorStop(1, tinycolor(this.color).darken(10).toRgbString()); // Optional: darker edge for more 3D

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Restore context state to remove shadow for next bubble
            ctx.restore();

            ctx.closePath(); // Though for fill, closePath isn't strictly necessary here
        }
    }

    function initBubbles() {
        for (let i = 0; i < numBubbles; i++) {
            bubbles.push(new Bubble());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height); // Clear canvas each frame

        bubbles.forEach(bubble => {
            bubble.update();
            bubble.draw();
        });

        requestAnimationFrame(animate);
    }

    initBubbles();
    animate();
});
