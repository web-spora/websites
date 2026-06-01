export function initParallax() {
  const hero = document.querySelector('.hero');
  const layers = document.querySelectorAll('.hero__bg-layer');

  if (!hero || layers.length === 0) return;

  const speeds = [0.03, 0.05, 0.02];

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    layers.forEach((layer, i) => {
      const speed = speeds[i] || 0.03;
      layer.style.transform = `translate(${x * 40 * speed}px, ${y * 40 * speed}px)`;
    });
  });

  hero.addEventListener('mouseleave', () => {
    layers.forEach((layer) => {
      layer.style.transform = 'translate(0, 0)';
      layer.style.transition = 'transform 0.5s ease';
    });
    setTimeout(() => {
      layers.forEach((layer) => {
        layer.style.transition = '';
      });
    }, 500);
  });
}
