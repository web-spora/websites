export function initEasterEgg() {
  const chalkboard = document.getElementById('chalkboard');
  if (!chalkboard) return;

  const emojis = ['🎉', '🎊', '✨', '🌟', '💥', '🎆', '🎇', '🌈', '🦄', '🍦', '🧁', '🎨', '🖌️', '💜', '💖', '⭐', '🔥', '🎈', '🎁', '🍭'];

  function explode() {
    // Flash
    const flash = document.createElement('div');
    flash.className = 'surprise-flash';
    document.body.appendChild(flash);
    requestAnimationFrame(() => flash.classList.add('surprise-flash--active'));

    setTimeout(() => {
      flash.classList.remove('surprise-flash--active');
      setTimeout(() => flash.remove(), 300);
    }, 200);

    // Emoji burst
    for (let i = 0; i < 40; i++) {
      const emoji = document.createElement('div');
      emoji.className = 'surprise-emoji';
      emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      emoji.style.left = Math.random() * 100 + 'vw';
      emoji.style.top = Math.random() * 100 + 'vh';
      const angle = Math.random() * Math.PI * 2;
      const distance = 150 + Math.random() * 250;
      emoji.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
      emoji.style.setProperty('--dy', Math.sin(angle) * distance + 'px');
      emoji.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      emoji.style.fontSize = (1.5 + Math.random() * 2.5) + 'rem';
      emoji.style.animationDuration = (1 + Math.random() * 1) + 's';
      document.body.appendChild(emoji);

      emoji.addEventListener('animationend', () => emoji.remove());
    }

    // Change chalkboard text
    const text = chalkboard.querySelector('.footer__chalkboard-text');
    if (text) {
      text.innerHTML = '🎉 СЮРПРИЗ! 🎉 Держи мороженое! 🍦 <span>_</span>';
      setTimeout(() => {
        text.innerHTML = 'Не уходи, у меня есть сюрприз <span>_</span>';
      }, 4000);
    }
  }

  chalkboard.addEventListener('click', explode);
}
