import '../styles/main.css';

import { initNavigation } from './modules/navigation.js';
import { initParallax } from './modules/parallax.js';
import { initParticles } from './modules/particles.js';
import { initScrollAnimations } from './modules/scrollAnimations.js';
import { initEasterEgg } from './modules/easterEgg.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initParallax();
  initParticles();
  initScrollAnimations();
  initEasterEgg();
});
