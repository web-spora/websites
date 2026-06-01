export function initParticles() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;
  let mouseX = 0;
  let mouseY = 0;

  function resize() {
    const hero = canvas.parentElement;
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + 20 + Math.random() * 40;
      this.size = Math.random() * 4 + 1.5;
      this.speedY = -(Math.random() * 0.5 + 0.2);
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.4 + 0.15;
      this.hue = Math.floor(Math.random() * 360);
      this.life = 0;
      this.maxLife = 300 + Math.random() * 200;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = 0.01 + Math.random() * 0.02;
    }

    update() {
      this.wobble += this.wobbleSpeed;
      this.x += this.speedX + Math.sin(this.wobble) * 0.15;
      this.y += this.speedY;
      this.life++;

      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120 && dist > 0) {
        this.x -= dx / dist * 0.3;
        this.y -= dy / dist * 0.3;
      }

      if (this.y < -20 || this.life > this.maxLife) {
        this.reset();
        this.y = canvas.height + 20;
      }
    }

    draw() {
      const fadeIn = Math.min(this.life / 80, 1);
      const alpha = this.opacity * fadeIn;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 80%, 65%, ${alpha})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(this.x + 1, this.y - 1, this.size * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 100%, 85%, ${alpha * 0.6})`;
      ctx.fill();
    }
  }

  function createParticles() {
    const count = Math.min(Math.floor(canvas.width * canvas.height / 6000), 80);
    particles = Array.from({ length: count }, () => new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    animationId = requestAnimationFrame(animate);
  }

  function handleMouse(e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  canvas.addEventListener('mousemove', handleMouse);
  canvas.addEventListener('mouseleave', () => {
    mouseX = -9999;
    mouseY = -9999;
  });

  resize();
  createParticles();
  animate();
}
