document.addEventListener('DOMContentLoaded', () => {

  // ===== HAMBURGER MENU =====
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      nav.classList.toggle('open');
    });
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        nav.classList.remove('open');
      });
    });
  }

  // ===== HERO PARTICLES (Canvas) =====
  const canvas = document.getElementById('particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId;

    function resize() {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    }

    function createParticles() {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 8000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 2 + 0.5,
          dx: (Math.random() - 0.5) * 0.3,
          dy: (Math.random() - 0.5) * 0.3,
          alpha: Math.random() * 0.6 + 0.2,
        });
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(184, 134, 255, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(drawParticles);
    }

    resize();
    createParticles();
    drawParticles();
    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });
  }

  // ===== TWINKLING STARS =====
  const starsContainer = document.getElementById('heroStars');
  if (starsContainer) {
    for (let i = 0; i < 60; i++) {
      const star = document.createElement('div');
      star.className = 'hero__star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      const size = Math.random() * 3 + 1;
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      star.style.setProperty('--duration', (Math.random() * 3 + 2) + 's');
      star.style.setProperty('--delay', (Math.random() * 4) + 's');
      starsContainer.appendChild(star);
    }
  }

  // ===== COLLECTIONS FILTER =====
  const filterBtns = document.querySelectorAll('.filter__btn');
  const productCards = document.querySelectorAll('.product-card');
  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        productCards.forEach(card => {
          const cats = card.dataset.category;
          if (filter === 'all' || cats.includes(filter)) {
            card.style.display = 'flex';
            card.style.opacity = '0';
            setTimeout(() => { card.style.opacity = '1'; }, 20);
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // ===== BREW GUIDE TABS =====
  const tabBtns = document.querySelectorAll('.tabs__btn');
  const brewContents = document.querySelectorAll('.brew-content');
  if (tabBtns.length) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        brewContents.forEach(c => c.classList.remove('active'));
        const method = btn.dataset.method;
        const target = document.getElementById('brew-' + method);
        if (target) target.classList.add('active');
      });
    });
  }

  // ===== TIMELINE SCROLL REVEAL =====
  const timelineItems = document.querySelectorAll('.timeline__item');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateX(0)';
      }
    });
  }, { threshold: 0.2 });

  timelineItems.forEach((item, i) => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-30px)';
    item.style.transition = `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`;
    observer.observe(item);
  });

  // ===== MINI-GAME: Constellation =====
  const gameBoard = document.getElementById('gameBoard');
  const gameStarsContainer = document.getElementById('gameStars');
  const gameCanvas = document.getElementById('gameCanvas');
  const gameMessage = document.getElementById('gameMessage');
  const connectedCount = document.getElementById('connectedCount');
  const gameHint = document.getElementById('gameHint');
  const gameReset = document.getElementById('gameReset');
  const promoCode = document.getElementById('promoCode');

  if (gameBoard && gameCanvas) {
    const ctx = gameCanvas.getContext('2d');
    const TOTAL_STARS = 6;
    let stars = [];
    let connected = [];
    let isComplete = false;

    function getRandomPositions() {
      const positions = [];
      const padding = 0.15;
      const centerMargin = 0.1;
      for (let i = 0; i < TOTAL_STARS; i++) {
        let x, y, attempts = 0;
        do {
          x = padding + Math.random() * (1 - 2 * padding);
          y = padding + Math.random() * (1 - 2 * padding);
          attempts++;
        } while (
          attempts < 50 &&
          positions.some(p => Math.hypot(p.x - x, p.y - y) < centerMargin)
        );
        positions.push({ x, y });
      }
      return positions;
    }

    function resizeCanvas() {
      const rect = gameBoard.getBoundingClientRect();
      gameCanvas.width = rect.width;
      gameCanvas.height = rect.height;
      drawConnections();
    }

    function drawConnections() {
      ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
      if (connected.length < 2) return;

      const rect = gameBoard.getBoundingClientRect();
      ctx.beginPath();
      const first = stars[connected[0]];
      ctx.moveTo(first.x * rect.width, first.y * rect.height);
      for (let i = 1; i < connected.length; i++) {
        const s = stars[connected[i]];
        ctx.lineTo(s.x * rect.width, s.y * rect.height);
      }
      ctx.strokeStyle = '#4da6ff';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#4da6ff';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (connected.length === TOTAL_STARS) {
        ctx.beginPath();
        ctx.arc(
          stars[connected[TOTAL_STARS - 1]].x * rect.width,
          stars[connected[TOTAL_STARS - 1]].y * rect.height,
          20, 0, Math.PI * 2
        );
        ctx.fillStyle = 'rgba(77, 166, 255, 0.15)';
        ctx.fill();
      }
    }

    function initGame() {
      isComplete = false;
      connected = [];
      gameMessage.classList.remove('show');
      gameHint.style.display = 'block';
      connectedCount.textContent = '0';

      const positions = getRandomPositions();
      stars = positions.map((pos, i) => ({
        id: i,
        x: pos.x,
        y: pos.y,
      }));

      gameStarsContainer.innerHTML = '';
      stars.forEach((s, i) => {
        const el = document.createElement('div');
        el.className = 'game__star-item';
        el.dataset.index = i;
        el.style.left = (s.x * 100) + '%';
        el.style.top = (s.y * 100) + '%';
        el.innerHTML = `<img src="img/icons/coffee-bean.svg" alt="Звезда-зерно ${i + 1}">`;
        el.addEventListener('click', () => handleStarClick(i));
        gameStarsContainer.appendChild(el);
      });

      resizeCanvas();
      drawConnections();
    }

    function handleStarClick(index) {
      if (isComplete) return;
      if (connected.includes(index)) return;

      if (connected.length > 0) {
        const last = connected[connected.length - 1];
        if (index === last) return;
      }

      connected.push(index);
      connectedCount.textContent = connected.length;

      const starsEls = gameStarsContainer.querySelectorAll('.game__star-item');
      starsEls.forEach((el, i) => {
        if (connected.includes(i)) {
          el.classList.add('connected');
        }
      });

      drawConnections();

      if (connected.length === TOTAL_STARS) {
        isComplete = true;
        gameHint.style.display = 'none';
        setTimeout(() => {
          gameMessage.classList.add('show');
          if (promoCode) {
            const code = 'COSMIC' + Math.floor(Math.random() * 90 + 10);
            promoCode.textContent = code;
          }
        }, 500);
      }
    }

    window.addEventListener('resize', resizeCanvas);
    if (gameReset) {
      gameReset.addEventListener('click', initGame);
    }

    initGame();
  }

  console.log('Cosmic Brew — добро пожаловать во Вселенную вкуса!');
});
