document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const canvas = document.getElementById('sandbox-canvas');
    const ctx = canvas.getContext('2d');
    const particleCountEl = document.getElementById('particle-count');
    const gravitySlider = document.getElementById('gravity-slider');
    const bouncinessSlider = document.getElementById('bounciness-slider');
    const massSlider = document.getElementById('mass-slider');
    const mutualGravityToggle = document.getElementById('mutual-gravity-toggle');
    const collisionsToggle = document.getElementById('collisions-toggle');
    const toolBtns = document.querySelectorAll('.tool-btn');
    const resetBtn = document.getElementById('reset-btn');

    // --- State & Config ---
    let particles = [];
    let settings = {
        globalGravity: 0.1,
        bounciness: 0.8,
        particleMass: 10,
        mutualGravity: false,
        particleCollisions: true,
        tool: 'add',
        G: 0.1, // Gravitational constant for mutual gravity
    };

    // --- Particle Class ---
    class Particle {
        constructor(x, y, radius, color, mass, vx = 0, vy = 0) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.color = color;
            this.mass = mass;
            this.vx = vx;
            this.vy = vy;
            this.isBlackHole = false;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
        }

        update(index) {
            if (this.isBlackHole) return;

            // Apply global gravity
            this.vy += settings.globalGravity;

            // Apply mutual gravity
            if (settings.mutualGravity) {
                for (let i = 0; i < particles.length; i++) {
                    if (i === index) continue;
                    const other = particles[i];
                    const dx = other.x - this.x;
                    const dy = other.y - this.y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq > this.radius + other.radius) {
                        const dist = Math.sqrt(distSq);
                        const force = (settings.G * this.mass * other.mass) / distSq;
                        const angle = Math.atan2(dy, dx);
                        this.vx += (force * Math.cos(angle)) / this.mass;
                        this.vy += (force * Math.sin(angle)) / this.mass;
                    }
                }
            }

            // Update position
            this.x += this.vx;
            this.y += this.vy;

            // Wall collisions
            if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
                this.vx *= -settings.bounciness;
                this.x = Math.min(Math.max(this.x, this.radius), canvas.width - this.radius);
            }
            if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
                this.vy *= -settings.bounciness;
                this.y = Math.min(Math.max(this.y, this.radius), canvas.height - this.radius);
            }
            
            // Particle collisions
            if(settings.particleCollisions) {
                for (let i = index + 1; i < particles.length; i++) {
                    const other = particles[i];
                    if (other.isBlackHole) continue;
                    const dx = other.x - this.x;
                    const dy = other.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < this.radius + other.radius) {
                        resolveCollision(this, other);
                    }
                }
            }
        }
    }
    
    // --- Physics Calculation ---
    function resolveCollision(p1, p2) {
        // ... (complex but standard collision physics)
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Separate them to prevent sticking
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
        
        p1.vx -= p * p2.mass * normalX * settings.bounciness;
        p1.vy -= p * p2.mass * normalY * settings.bounciness;
        p2.vx += p * p1.mass * normalX * settings.bounciness;
        p2.vy += p * p1.mass * normalY * settings.bounciness;
    }

    // --- Main Animation Loop ---
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach((particle, index) => {
            particle.update(index);
            particle.draw();
        });
        
        particleCountEl.textContent = particles.length;
        requestAnimationFrame(animate);
    }

    // --- UI & Event Handlers ---
    function handleCanvasClick(e) {
        const mass = (settings.tool === 'blackhole') ? 5000 : settings.particleMass;
        const radius = Math.sqrt(mass / Math.PI) * 2;
        const color = (settings.tool === 'blackhole') ? 'black' : `hsl(${Math.random() * 360}, 70%, 60%)`;
        
        const particle = new Particle(
            e.clientX, e.clientY, radius, color, mass,
            (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10
        );
        
        if(settings.tool === 'blackhole') {
            particle.isBlackHole = true;
            particle.vx = 0;
            particle.vy = 0;
        }
        
        particles.push(particle);
    }
    
    function setupEventListeners() {
        canvas.addEventListener('click', handleCanvasClick);
        
        // Sliders
        gravitySlider.addEventListener('input', (e) => settings.globalGravity = parseFloat(e.target.value));
        bouncinessSlider.addEventListener('input', (e) => settings.bounciness = parseFloat(e.target.value));
        massSlider.addEventListener('input', (e) => settings.particleMass = parseFloat(e.target.value));
        
        // Toggles
        mutualGravityToggle.addEventListener('change', (e) => settings.mutualGravity = e.target.checked);
        collisionsToggle.addEventListener('change', (e) => settings.particleCollisions = e.target.checked);
        
        // Tool buttons
        toolBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                toolBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                settings.tool = btn.dataset.tool;
            });
        });
        
        resetBtn.addEventListener('click', () => {
            particles = [];
        });
        
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