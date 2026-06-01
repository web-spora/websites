import { initNavigation } from './modules/navigation.js';
import { initParallax } from './modules/parallax.js';
import { initParticles } from './modules/particles.js';
import { initScrollAnimations } from './modules/scrollAnimations.js';
import { initEasterEgg } from './modules/easterEgg.js';

function safe(fn) {
  try { fn(); } catch (e) { console.warn(e); }
}

document.addEventListener('DOMContentLoaded', () => {
  safe(initNavigation);
  safe(initParallax);
  safe(initParticles);
  safe(initScrollAnimations);
  safe(initEasterEgg);
});
