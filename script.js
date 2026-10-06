// ========================================================
// CONGRATULATIONS - MULTI-FRIEND PATH SYSTEM
// Supports:
// 1. Path URL: /kanom or /dew or /minnie or /irene
// 2. Query URL: ?to=kanom or ?to=irene or ?to=dew
// ========================================================

class MobileCelebrationExperience {
  constructor() {
    this.stage1 = document.getElementById('stage-1');
    this.stage2 = document.getElementById('stage-2');
    this.dollTarget = document.getElementById('doll-click-target');
    this.personCutout = document.getElementById('person-cutout');
    this.cardImg = document.querySelector('#stage-2 .screen-bg-img');
    this.personImg = document.querySelector('#person-cutout img');
    this.canvas = document.getElementById('stars-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.particles = [];
    this.audioCtx = null;
    this.isTransitioning = false;

    this.friendId = this.detectFriendId();

    this.init();
  }

  detectFriendId() {
    // 1. Check URL Search Parameters (?to=irene or ?name=dew or ?friend=somo)
    const params = new URLSearchParams(window.location.search);
    const paramName = params.get('to') || params.get('name') || params.get('friend');
    if (paramName) {
      return paramName.trim().toLowerCase();
    }

    // 2. Check path segments (e.g. site.com/congrats/irene or site.netlify.app/irene)
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      const last = segments[segments.length - 1];
      // Ignore root repository name or index.html
      if (last && last !== 'index.html' && last !== 'congrats' && !last.includes('.')) {
        return last.trim().toLowerCase();
      }
    }

    return null;
  }

  getBasePath() {
    let p = window.location.pathname;
    if (!p.endsWith('/') && !p.endsWith('.html')) {
      p += '/';
    }
    return p.replace(/[^\/]*$/, '');
  }

  setupFriendAssets() {
    if (!this.friendId) return;

    // Update browser title
    document.title = `Congratulations 🎓🧸✨`;

    const base = this.getBasePath();
    const cacheBuster = `?v=${Date.now()}`;

    // Custom configuration for Irene
    if (this.friendId === 'irene') {
      const ireneCardSrc = `${base}assets/irene/irenecard.jpg${cacheBuster}`;
      const irenePersonSrc = `${base}assets/irene/irene.png${cacheBuster}`;

      if (this.cardImg) {
        this.cardImg.src = ireneCardSrc;
      }

      if (this.personCutout && this.personImg) {
        this.personCutout.style.display = 'block';
        this.personCutout.style.left = '39.5%';
        this.personCutout.style.top = '32.3%';
        this.personCutout.style.width = '48.4%';
        this.personCutout.classList.remove('wiggle-person');
        this.personCutout.classList.add('wiggle-gentle'); // ไม่ต้องขยับเยอะมาก
        this.personImg.src = irenePersonSrc;
      }
      return;
    }

    // Default configuration for Kanom and other friends
    const friendCardSrc = `${base}assets/${this.friendId}/card.jpg${cacheBuster}`;
    const friendPersonSrc = `${base}assets/${this.friendId}/person.png${cacheBuster}`;

    if (this.cardImg) {
      this.cardImg.src = friendCardSrc;
      this.cardImg.onerror = () => {
        this.cardImg.src = `${base}assets/card.jpg?v=2`;
      };
    }

    if (this.personImg && this.personCutout) {
      this.personCutout.style.display = 'block';
      this.personCutout.style.left = '47.2%';
      this.personCutout.style.top = '40.6%';
      this.personCutout.style.width = '45.4%';
      this.personCutout.classList.remove('wiggle-gentle');
      this.personCutout.classList.add('wiggle-person');
      this.personImg.src = friendPersonSrc;
      this.personImg.onerror = () => {
        if (this.friendId !== 'kanom') {
          this.personCutout.style.display = 'none';
        } else {
          this.personImg.src = `${base}assets/person_cropped.png?v=2`;
        }
      };
    }
  }

  init() {
    this.setupCanvas();
    this.setupFriendAssets();
    this.bindEvents();
    this.loop();
  }

  setupCanvas() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  bindEvents() {
    // 1. Tap on Doll to start
    this.dollTarget.addEventListener('click', (e) => {
      if (this.isTransitioning) return;
      this.handleDollClick(e);
    });

    this.dollTarget.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!this.isTransitioning) this.handleDollClick(e);
      }
    });

    // 2. Tap on Person to trigger cheerful extra wiggle + star sprinkles
    if (this.personCutout) {
      this.personCutout.addEventListener('click', (e) => {
        this.triggerPersonHappyWiggle(e);
      });
    }
  }

  handleDollClick(e) {
    this.isTransitioning = true;
    this.playMagicChimeSound();

    const rect = this.dollTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Pop out animation on doll
    this.dollTarget.classList.add('pop-out');

    // Spawn white sparkling stars bursting outward
    this.spawnWhiteStarBurst(centerX, centerY, 80);

    // Continuous trailing sparkles
    const interval = setInterval(() => {
      const offsetX = (Math.random() - 0.5) * rect.width * 0.8;
      const offsetY = (Math.random() - 0.5) * rect.height * 0.8;
      this.spawnWhiteStarBurst(centerX + offsetX, centerY + offsetY, 12);
    }, 100);

    // Transition to Card Page (Stage 2)
    setTimeout(() => {
      clearInterval(interval);
      this.transitionToCard();
    }, 650);
  }

  transitionToCard() {
    this.stage1.classList.remove('stage-active');
    this.stage1.classList.add('stage-hidden');

    this.stage2.classList.remove('stage-hidden');
    this.stage2.classList.add('stage-active');

    // Soft welcoming star twinkle on the card
    const cardRect = this.stage2.getBoundingClientRect();
    this.spawnWhiteStarBurst(cardRect.left + cardRect.width / 2, cardRect.top + cardRect.height * 0.45, 30);
  }

  triggerPersonHappyWiggle(e) {
    this.playPopNote();
    this.personCutout.classList.add('active-wiggle');
    setTimeout(() => {
      this.personCutout.classList.remove('active-wiggle');
    }, 700);

    const rect = this.personCutout.getBoundingClientRect();
    const x = e ? e.clientX : rect.left + rect.width / 2;
    const y = e ? e.clientY : rect.top + rect.height / 2;
    this.spawnWhiteStarBurst(x, y, 16);
  }

  // ========================================================
  // WHITE STAR PARTICLE ENGINE (✦ Stars & Twinkles)
  // ========================================================
  spawnWhiteStarBurst(originX, originY, count = 50) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5.5 + 1.5;
      const size = Math.random() * 8 + 3;
      const isFourPointStar = Math.random() > 0.35;

      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (Math.random() * 1.5),
        size: size,
        alpha: 1,
        fadeSpeed: Math.random() * 0.022 + 0.015,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.12,
        isFourPointStar: isFourPointStar,
        color: Math.random() > 0.85 ? '#fff3d1' : '#ffffff'
      });
    }
  }

  drawSparkleStar(ctx, x, y, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(x, y - outerRadius);

    for (let i = 0; i < spikes; i++) {
      let cx = x + Math.cos(rot) * outerRadius;
      let cy = y + Math.sin(rot) * outerRadius;
      ctx.lineTo(cx, cy);
      rot += step;

      cx = x + Math.cos(rot) * innerRadius;
      cy = y + Math.sin(rot) * innerRadius;
      ctx.lineTo(cx, cy);
      rot += step;
    }
    ctx.lineTo(x, y - outerRadius);
    ctx.closePath();
    ctx.fill();
  }

  loop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.rotation += p.rotSpeed;
      p.alpha -= p.fadeSpeed;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
      this.ctx.shadowBlur = 10;

      if (p.isFourPointStar) {
        // Draw 4-pointed sparkle star ✦
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);
        this.drawSparkleStar(this.ctx, 0, 0, 4, p.size, p.size * 0.26);
      } else {
        // Soft glowing point
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * 0.45, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    requestAnimationFrame(() => this.loop());
  }

  // ========================================================
  // WEB AUDIO API - MAGICAL CHIME & POP NOTES
  // ========================================================
  getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  playMagicChimeSound() {
    try {
      const ctx = this.getAudioContext();
      // Ascending twinkling glockenspiel notes
      const notes = [1318.51, 1661.22, 1975.53, 2637.02];
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        const startTime = now + idx * 0.08;
        const duration = 0.55;

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch (e) {}
  }

  playPopNote() {
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {}
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new MobileCelebrationExperience();
});
