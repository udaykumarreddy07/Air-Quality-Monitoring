/**
 * Air Quality Monitoring - 1,500-Node HTML5 Canvas Particle Dispersion Physics Simulator
 * Simulates atmospheric fluid advection, Lagrangian transport, and vortex diffusion
 */

class AtmosphericParticleSimulator {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = canvasElement && typeof canvasElement.getContext === 'function' ? canvasElement.getContext('2d') : null;
    this.numParticles = options.numParticles || 1500;
    this.particles = [];
    this.isRunning = false;
    this.animationFrameId = null;

    // Simulation physics constants
    this.windAngle = Math.PI * 0.25; // Northeast wind
    this.windSpeed = 1.2;
    this.turbulence = 0.45;
    this.vortices = [
      { x: 0.35, y: 0.3, strength: 0.8, radius: 0.25 }, // Delhi-NCR vortex
      { x: 0.7, y: 0.6, strength: -0.6, radius: 0.2 }    // Eastern mining vortex
    ];

    this.resize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.resize());
    }
    this.initParticles();
  }

  resize() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    const rect = parent && typeof parent.getBoundingClientRect === 'function' 
      ? parent.getBoundingClientRect() 
      : { width: 800, height: 480 };
    this.width = this.canvas.width = rect.width || 800;
    this.height = this.canvas.height = rect.height || 480;
  }

  initParticles() {
    this.particles = [];
    const colors = [
      'rgba(239, 68, 68, 0.7)',   // PM2.5 / Unhealthy
      'rgba(245, 158, 11, 0.6)',  // Moderate / Coarse
      'rgba(56, 189, 248, 0.5)',  // Fine advection
      'rgba(168, 85, 247, 0.7)',  // Severe plumes
      'rgba(255, 255, 255, 0.4)'  // Ambient air
    ];

    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: 0,
        vy: 0,
        size: Math.random() * 2.2 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: Math.random() * 200 + 100,
        maxLife: 300,
        baseSpeed: Math.random() * 0.8 + 0.6
      });
    }
  }

  update() {
    const cosWind = Math.cos(this.windAngle) * this.windSpeed;
    const sinWind = Math.sin(this.windAngle) * this.windSpeed;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Base wind vector
      p.vx = cosWind * p.baseSpeed;
      p.vy = sinWind * p.baseSpeed;

      // Add vortex physics
      const normX = p.x / this.width;
      const normY = p.y / this.height;

      for (const v of this.vortices) {
        const dx = normX - v.x;
        const dy = normY - v.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < v.radius && dist > 0.01) {
          const force = (1 - dist / v.radius) * v.strength;
          p.vx += -dy * force * 4.0;
          p.vy += dx * force * 4.0;
        }
      }

      // Add turbulent brownian jitter
      p.vx += (Math.random() - 0.5) * this.turbulence;
      p.vy += (Math.random() - 0.5) * this.turbulence;

      // Move particle
      p.x += p.vx;
      p.y += p.vy;
      p.life--;

      // Wrap around bounds or respawn
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      if (p.life <= 0) {
        p.x = Math.random() * this.width;
        p.y = Math.random() * this.height;
        p.life = Math.random() * 200 + 100;
      }
    }
  }

  draw() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const alpha = Math.min(1, p.life / 50) * 0.75;
      
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1.0;
  }

  loop() {
    if (!this.isRunning || !this.ctx) return;
    this.update();
    this.draw();
    if (typeof requestAnimationFrame === 'function') {
      this.animationFrameId = requestAnimationFrame(() => this.loop());
    }
  }

  start() {
    if (!this.ctx) return;
    if (!this.isRunning) {
      this.isRunning = true;
      this.loop();
    }
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }

  toggle() {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start();
    }
    return this.isRunning;
  }
}

window.AtmosphericParticleSimulator = AtmosphericParticleSimulator;

