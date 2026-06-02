/* ────────────────────────────────────────────
   ⚙️  Change cette date si besoin
   Format : YYYY-MM-DDTHH:MM:SS
──────────────────────────────────────────── */
const ANNIVERSARY = new Date('2026-06-21T00:00:00');

// ── floating hearts (fond normal) ──
const bg = document.getElementById('heartsBg');
const emojis = ['❤️', '💕', '💗', '🌸', '✨'];
for (let i = 0; i < 18; i++) {
  const h = document.createElement('span');
  h.className = 'heart-float';
  h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  h.style.left = Math.random() * 100 + 'vw';
  h.style.fontSize = (.8 + Math.random() * 1.4) + 'rem';
  h.style.animationDuration = (8 + Math.random() * 12) + 's';
  h.style.animationDelay = (Math.random() * 12) + 's';
  bg.appendChild(h);
}

// ── countdown ──
const pad  = n => String(n).padStart(2, '0');
const pad3 = n => String(n).padStart(3, '0');
let tickInterval;

function tick() {
  const now  = new Date();
  const diff = ANNIVERSARY - now;
  if (diff <= 0) { clearInterval(tickInterval); triggerCelebration(); return; }
  document.getElementById('cd-days').textContent  = pad3(Math.floor(diff / 86400000));
  document.getElementById('cd-hours').textContent = pad(Math.floor((diff % 86400000) / 3600000));
  document.getElementById('cd-mins').textContent  = pad(Math.floor((diff % 3600000)  / 60000));
  document.getElementById('cd-secs').textContent  = pad(Math.floor((diff % 60000)    / 1000));
}
tick();
tickInterval = setInterval(tick, 1000);

// ══════════════════════════════════════════════
//  CELEBRATION
// ══════════════════════════════════════════════

// Palette partagée
const COLORS = [
  '#ff6b9d','#c0395e','#ffd700','#c9a84c',
  '#a29bfe','#55efc4','#fd79a8','#74b9ff',
  '#ff9ff3','#ffffff','#ffd6e0','#ffe066',
];

function rndColor() { return COLORS[Math.random() * COLORS.length | 0]; }
function rnd(a, b)  { return a + Math.random() * (b - a); }

function triggerCelebration() {
  // flash
  const flash = document.getElementById('flash');
  flash.style.opacity = '1';
  requestAnimationFrame(() => {
    flash.style.transition = 'opacity .45s ease';
    flash.style.opacity = '0';
  });

  // shake
  document.body.classList.add('shake');
  setTimeout(() => document.body.classList.remove('shake'), 600);

  // overlay
  setTimeout(() => document.getElementById('celebration').classList.add('show'), 100);

  // démarrer le moteur de particules
  setTimeout(startParticleEngine, 80);
  setTimeout(launchFloatingHearts, 700);
}

// ══════════════════════════════════════════════
//  MOTEUR UNIQUE — un seul canvas, une seule RAF
// ══════════════════════════════════════════════
function startParticleEngine() {
  const canvas = document.getElementById('fx-canvas');
  const ctx    = canvas.getContext('2d');
  const W = canvas.width  = window.innerWidth;
  const H = canvas.height = window.innerHeight;
  const CX = W / 2, CY = H / 2;

  // ─ pool de particules ─
  const particles = [];

  function addParticle(x, y, vx, vy, color, r, life, gravity = 0.12) {
    particles.push({ x, y, vx, vy, color, r, alpha: 1, life, maxLife: life, gravity });
  }

  // ─ ondes de choc ─
  const rings = [];
  function addRing(delay, color, speed, lw) {
    setTimeout(() => rings.push({ r: 0, alpha: 1, color, speed, lw }), delay);
  }

  // ─ streaks (lignes radiales) ─
  const streaks = [];

  // ─ générateur de feux d'artifice ─
  function burst(x, y, count = 80, speedMult = 1) {
    const color = rndColor();
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + rnd(0, .1);
      const speed = rnd(3, 9) * speedMult;
      addParticle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, rnd(2, 4), rnd(55, 80));
    }
  }

  function burstStar(x, y) {
    const color = rndColor();
    const branches = 8;
    for (let b = 0; b < branches; b++) {
      const angle = (b / branches) * Math.PI * 2;
      for (let i = 0; i < 10; i++) {
        const speed = rnd(2, 10);
        const a2 = angle + rnd(-.15, .15);
        addParticle(x, y, Math.cos(a2) * speed, Math.sin(a2) * speed, color, rnd(1.5, 3.5), rnd(45, 70));
      }
    }
  }

  // ─ confetti canon ─
  function confettiCannon(ox, oy, dir, count = 300) {
    const spread = Math.PI / 3.5;
    const life   = rnd(220, 320);
    for (let i = 0; i < count; i++) {
      const a = dir + rnd(-spread, spread);
      const s = rnd(8, 20);           // vitesse modérée pour que l'arc soit visible
      particles.push({
        x: ox, y: oy,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        color: rndColor(),
        r: rnd(3, 6),
        w: rnd(5, 11), h: rnd(8, 15),
        rot: rnd(0, Math.PI * 2), vr: rnd(-.12, .12),
        alpha: 1, life, maxLife: life,
        gravity: 0.14, isRect: true,
      });
    }
  }

  // ════ SÉQUENCE D'ÉVÉNEMENTS ════

  // explosion centrale + ondes
  burst(CX, CY, 200, 1.6);
  addRing(0,   '#c0395e', 20, 4);
  addRing(100, '#ffd700', 16, 2.5);
  addRing(220, '#ffffff', 12, 1.5);

  // streaks radiaux
  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2;
    streaks.push({ angle, len: 0, maxLen: rnd(100, 200), alpha: 1, color: rndColor() });
  }

  // ── salve initiale : 7 canons ──
  confettiCannon(0,          H, -Math.PI / 4);
  confettiCannon(W,          H, -Math.PI * 3 / 4);
  confettiCannon(CX,         H, -Math.PI / 2);
  confettiCannon(CX * .5,    H, -Math.PI / 2 + .35);
  confettiCannon(CX * 1.5,   H, -Math.PI / 2 - .35);
  confettiCannon(CX * .25,   H, -Math.PI / 3);
  confettiCannon(CX * 1.75,  H, -Math.PI * 2 / 3);

  // ── vagues suivantes toutes les 1s ──
  [1000, 2000, 3000, 4000, 5000, 6000, 7000].forEach((delay, wi) => {
    setTimeout(() => {
      confettiCannon(0,          H, -Math.PI / 4,       200);
      confettiCannon(W,          H, -Math.PI * 3 / 4,   200);
      confettiCannon(CX,         H, -Math.PI / 2,       200);
      confettiCannon(CX * .4,    H, -Math.PI / 2 + .4,  180);
      confettiCannon(CX * 1.6,   H, -Math.PI / 2 - .4,  180);
      if (wi % 2 === 0) {
        confettiCannon(CX * .2,  H, -Math.PI / 3,       150);
        confettiCannon(CX * 1.8, H, -Math.PI * 2 / 3,   150);
      }
    }, delay);
  });

  // feux d'artifice planifiés
  const fwSchedule = [
    { t: 300,  x: .2,  y: .2  },
    { t: 500,  x: .8,  y: .15 },
    { t: 800,  x: .5,  y: .1  },
    { t: 1100, x: .15, y: .35 },
    { t: 1100, x: .85, y: .3  },
    { t: 1500, x: .35, y: .12 },
    { t: 1500, x: .65, y: .18 },
    { t: 1900, x: .5,  y: .08, star: true },
    { t: 2300, x: .25, y: .22 },
    { t: 2300, x: .75, y: .25 },
    { t: 2700, x: .5,  y: .2,  star: true },
    { t: 3100, x: .1,  y: .4  },
    { t: 3100, x: .9,  y: .38 },
    { t: 3500, x: .4,  y: .1  },
    { t: 3500, x: .6,  y: .1  },
    { t: 4000, x: .5,  y: .05, star: true },
    { t: 4400, x: .2,  y: .3  },
    { t: 4400, x: .8,  y: .28 },
    { t: 4800, x: .5,  y: .15 },
    { t: 5200, x: .3,  y: .2  },
    { t: 5200, x: .7,  y: .2  },
    { t: 5600, x: .5,  y: .1, star: true  },
  ];
  fwSchedule.forEach(({ t, x, y, star }) => {
    setTimeout(() => {
      const px = x * W, py = y * H;
      star ? burstStar(px, py) : burst(px, py, rnd(60, 100) | 0, rnd(.8, 1.3));
    }, t);
  });

  // ════ BOUCLE RAF ════
  let running = true;
  let frame;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // ─ ondes ─
    for (let i = rings.length - 1; i >= 0; i--) {
      const rg = rings[i];
      ctx.beginPath();
      ctx.arc(CX, CY, rg.r, 0, Math.PI * 2);
      ctx.strokeStyle = rg.color;
      ctx.lineWidth   = rg.lw;
      ctx.globalAlpha = rg.alpha;
      ctx.stroke();
      rg.r     += rg.speed;
      rg.alpha -= 0.022;
      if (rg.alpha <= 0) rings.splice(i, 1);
    }

    // ─ streaks ─
    ctx.lineWidth = 2;
    for (let i = streaks.length - 1; i >= 0; i--) {
      const s = streaks[i];
      if (s.alpha <= 0) { streaks.splice(i, 1); continue; }
      ctx.globalAlpha = s.alpha;
      ctx.strokeStyle = s.color;
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.lineTo(CX + Math.cos(s.angle) * s.len, CY + Math.sin(s.angle) * s.len);
      ctx.stroke();
      s.len   = Math.min(s.len + 28, s.maxLen);
      s.alpha -= 0.055;
    }

    ctx.globalAlpha = 1;

    // ─ particules — batch par forme ─
    const rects  = [];
    const circs  = [];
    particles.forEach(p => (p.isRect ? rects : circs).push(p));

    // cercles : trier par couleur pour minimiser les changements de fillStyle
    circs.sort((a, b) => (a.color > b.color ? 1 : -1));
    let lastColor = null;
    for (let i = circs.length - 1; i >= 0; i--) {
      const p = circs[i];
      const t = 1 - p.life / p.maxLife;
      p.alpha = t < .7 ? 1 : 1 - (t - .7) / .3;

      ctx.globalAlpha = p.alpha;
      if (p.color !== lastColor) { ctx.fillStyle = p.color; lastColor = p.color; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      p.x  += p.vx; p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.life--;
      if (p.life <= 0) circs.splice(i, 1);
    }

    // rectangles (confetti)
    for (let i = rects.length - 1; i >= 0; i--) {
      const p = rects[i];
      const t = 1 - p.life / p.maxLife;
      p.alpha = t < .6 ? 1 : 1 - (t - .6) / .4;

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle   = p.color;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();

      p.x   += p.vx; p.y += p.vy;
      p.vy  += p.gravity;
      p.vx  *= 0.99;
      p.rot += p.vr;
      p.life--;
      if (p.life <= 0) rects.splice(i, 1);
    }

    ctx.globalAlpha = 1;

    // sync les tableaux
    particles.length = 0;
    circs.forEach(p => particles.push(p));
    rects.forEach(p => particles.push(p));

    if (running || particles.length > 0 || rings.length > 0 || streaks.length > 0) {
      frame = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, W, H);
    }
  }

  frame = requestAnimationFrame(draw);
  setTimeout(() => { running = false; }, 7000);
}

// ── cœurs flottants CSS ───────────────────────
function launchFloatingHearts() {
  const container = document.getElementById('celebration');
  const symbols = ['💗','💕','❤️','💖','💝','🌸','✨','💓','🎉','⭐'];
  let count = 0;
  const iv = setInterval(() => {
    if (count++ >= 30) { clearInterval(iv); return; }
    const el = document.createElement('span');
    el.className = 'cele-heart';
    el.textContent = symbols[Math.random() * symbols.length | 0];
    el.style.left = rnd(3, 94) + '%';
    el.style.fontSize = rnd(1.2, 3.2) + 'rem';
    el.style.animationDuration = rnd(4, 8) + 's';
    el.style.animationDelay = rnd(0, .4) + 's';
    container.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }, 160);
}

