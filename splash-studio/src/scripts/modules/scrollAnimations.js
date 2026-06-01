export function initScrollAnimations() {
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  if (revealEls.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.style.transitionDelay || '0s';
        const delayMs = parseFloat(delay) * 1000 || 0;
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, delayMs);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px',
  });

  revealEls.forEach(el => observer.observe(el));

  // Step reveal for process steps
  const steps = document.querySelectorAll('.process__step');
  const stepObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.style.transitionDelay || '0s';
        const delayMs = parseFloat(delay) * 1000 || 0;
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, delayMs);
        stepObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -60px 0px',
  });

  steps.forEach(el => stepObserver.observe(el));

  // Paper plane every 10 seconds
  let planeCount = 0;
  setInterval(() => {
    const plane = document.createElement('div');
    plane.className = 'paper-plane';
    plane.textContent = '✈️';
    plane.style.top = (20 + Math.random() * 40) + '%';
    plane.style.animationDuration = (4 + Math.random() * 3) + 's';
    plane.style.fontSize = (1.2 + Math.random() * 0.8) + 'rem';
    plane.dataset.plane = String(planeCount++);
    document.body.appendChild(plane);

    plane.addEventListener('animationend', () => plane.remove());
  }, 10000);
}
