(function () {
  const bg     = document.getElementById('petalesBg');
  const petales = ['🌸', '🌷', '🌹', '✿', '❀', '🌺', '💮'];
  for (let i = 0; i < 22; i++) {
    const el = document.createElement('span');
    el.className = 'petale';
    el.textContent = petales[Math.floor(Math.random() * petales.length)];
    el.style.left             = Math.random() * 100 + 'vw';
    el.style.fontSize         = (0.8 + Math.random() * 1.1) + 'rem';
    el.style.animationDuration = (14 + Math.random() * 18) + 's';
    el.style.animationDelay   = (Math.random() * 20) + 's';
    bg.appendChild(el);
  }
})();
