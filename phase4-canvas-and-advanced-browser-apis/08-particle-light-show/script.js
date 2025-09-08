document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    const particleCountEl = document.getElementById('particle-count');
    const gravitySlider = document.getElementById('gravity-slider');
    const trailsSlider = document.getElementById('trails-slider');
    const colorInput = document.getElementById('particle-color');
    const toolBtns = document.querySelectorAll('.tool-btn');
    const resetBtn = document.getElementById('reset-btn');

    // --- State & Config ---
    let particles = [];
    let vfx = []; // For shockwaves, sparks, etc.
    let forcePoints = []; // Attractors and Repulsors
    let settings = {
        gravity: 0.1,
        trailAmount: 0.1,
        tool: 'particle',
        particleColor: '#818cf8',
        G: 1, // Gravitational constant for force points
    };

    // --- Classes ---
    class Particle {
        constructor(x, y, radius, color, vx = 0, vy = 0) {
            this.x = x; this.y = y;
            this.radius = radius;
            this.color = color;
            this.mass = radius * radius * 0.1;
            this.vx = vx;
            this.vy = vy;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
        }

        update(index) {
            // Apply forces
            this.vy += settings.gravity;
            forcePoints.forEach(fp => {
                const dx = fp.x - this.x;
                const dy = fp.y - this.y;
                const distSq = dx * dx + dy * dy;
                if (distSq > this.radius + fp.radius) {
                    const dist = Math.sqrt(distSq);
                    const force = (settings.G * fp.mass) / distSq * fp.strength;
                    const angle = Math.atan2(dy, dx);
                    this.vx += (force * Math.cos(angle));
                    this.vy += (force * Math.sin(angle));
                }
            });

            // Update position
            this.x += this.vx;
            this.y += this.vy;

            // Wall collisions
            if (this.x + this.radius > canvas.width || this.x - this.radius < 0) this.vx *= -0.8;
            if (this.y + this.radius > canvas.height || this.y - this.radius < 0) this.vy *= -0.8;
            this.x = Math.max(this.radius, Math.min(this.x, canvas.width - this.radius));
            this.y = Math.max(this.radius, Math.min(this.y, canvas.height - this.radius));

            // Particle-particle collisions
            for (let i = index + 1; i < particles.length; i++) {
                resolveCollision(this, particles[i]);
            }
        }
    }
    
    class ForcePoint {
        constructor(x, y, strength) {
            this.x = x; this.y = y;
            this.strength = strength; // Positive for attractor, negative for repulsor
            this.radius = Math.abs(strength) / 5;
            this.mass = this.radius * 20;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.strength > 0 ? 'rgba(0, 255, 150, 0.5)' : 'rgba(255, 100, 100, 0.5)';
            ctx.fill();
        }
    }
    
    class Shockwave {
        constructor(x, y, radius, color) {
            this.x = x; this.y = y;
            this.radius = 5;
            this.maxRadius = radius;
            this.color = color;
            this.life = 1; // 1 = 100%
        }
        update() { this.life -= 0.04; this.radius += 1; }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            ctx.globalAlpha = this.life;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }
    
    class Spark {
        constructor(x, y, color) {
            this.x = x; this.y = y;
            this.vx = (Math.random() - 0.5) * 8;
            this.vy = (Math.random() - 0.5) * 8;
            this.color = color;
            this.life = 1;
        }
        update() { this.life -= 0.05; this.x += this.vx; this.y += this.vy; }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.life;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    // --- Physics Calculation ---
    function resolveCollision(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < p1.radius + p2.radius) {
            // Collision occurred!
            const overlap = 0.5 * (dist - p1.radius - p2.radius);
            p1.x += overlap * (p1.x - p2.x) / dist;
            p1.y += overlap * (p1.y - p2.y) / dist;
            p2.x -= overlap * (p1.x - p2.x) / dist;
            p2.y -= overlap * (p1.y - p2.y) / dist;
            
            const normalX = dx / dist;
            const normalY = dy / dist;
            const kx = p1.vx - p2.vx;
            const ky = p1.vy - p2.vy;
            const p = 2 * (normalX * kx + normalY * ky) / (p1.mass + p2.mass);
            
            const impactForce = Math.sqrt(kx*kx + ky*ky);
            
            p1.vx -= p * p2.mass * normalX;
            p1.vy -= p * p2.mass * normalY;
            p2.vx += p * p1.mass * normalX;
            p2.vy += p * p1.mass * normalY;
            
            // Generate VFX from collision
            const shockwaveSize = impactForce * 2;
            const color = getCollisionColor(p1.x);
            vfx.push(new Shockwave(p1.x, p1.y, shockwaveSize, color));
            if(impactForce > 15) { // Create sparks on big impacts
                for(let i=0; i < 10; i++) vfx.push(new Spark(p1.x, p1.y, color));
            }
        }
    }
    
    function getCollisionColor(xPosition) {
        const zoneWidth = canvas.width / 3;
        if (xPosition < zoneWidth) return '#ef4444'; // Red zone
        if (xPosition < zoneWidth * 2) return '#f59e0b'; // Orange zone
        return '#84cc16'; // Green zone
    }

    // --- Main Animation Loop ---
    function animate() {
        // Draw trails effect
        ctx.fillStyle = `rgba(17, 24, 39, ${settings.trailAmount})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw all objects
        particles.forEach((p, i) => { p.update(i); p.draw(); });
        forcePoints.forEach(fp => fp.draw());
        vfx.forEach((v, i) => { v.update(); v.draw(); });
        
        // Garbage collection for expired VFX
        vfx = vfx.filter(v => v.life > 0);
        
        particleCountEl.textContent = particles.length + forcePoints.length;
        requestAnimationFrame(animate);
    }

    // --- UI & Event Handlers ---
    let mouseStart = { x: 0, y: 0 };
    function handleMouseDown(e) {
        mouseStart = { x: e.clientX, y: e.clientY };
    }
    function handleMouseUp(e) {
        const dx = e.clientX - mouseStart.x;
        const dy = e.clientY - mouseStart.y;
        
        if (settings.tool === 'particle') {
            const radius = Math.random() * 10 + 5;
            particles.push(new Particle(e.clientX, e.clientY, radius, settings.particleColor, dx * 0.1, dy * 0.1));
        } else if (settings.tool === 'attractor') {
            forcePoints.push(new ForcePoint(e.clientX, e.clientY, 100));
        } else if (settings.tool === 'repulsor') {
            forcePoints.push(new ForcePoint(e.clientX, e.clientY, -100));
        }
    }
    
    function setupEventListeners() {
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);
        
        gravitySlider.addEventListener('input', (e) => settings.gravity = parseFloat(e.target.value));
        trailsSlider.addEventListener('input', (e) => settings.trailAmount = parseFloat(e.target.value));
        colorInput.addEventListener('input', (e) => settings.particleColor = e.target.value);
        
        toolBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                toolBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                settings.tool = btn.dataset.tool;
                document.body.className = `tool-${settings.tool}`;
            });
        });
        
        resetBtn.addEventListener('click', () => { particles = []; vfx = []; forcePoints = []; });
        window.addEventListener('resize', resizeCanvas);
    }

    // --- Initialization ---
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    function init() {
        resizeCanvas();
        setupEventListeners();
        animate();
    }
    init();
});