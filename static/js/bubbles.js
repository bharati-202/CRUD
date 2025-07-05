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

    class Bubble {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.radius = Math.random() * 15 + 5; // Radius between 5 and 20
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.speedX = (Math.random() - 0.5) * 2; // Random horizontal speed (-1 to 1)
            this.speedY = (Math.random() - 0.5) * 2; // Random vertical speed (-1 to 1)
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
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
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
