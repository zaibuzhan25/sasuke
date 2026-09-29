gsap.registerPlugin(ScrollTrigger);

const cursor = document.querySelector('.cursor');
const cursorDot = document.querySelector('.cursor-dot');
const gridBg = document.querySelector('.grid-bg');
const preloader = document.querySelector('.preloader');
const progressBar = document.querySelector('.progress-bar');
const particleContainer = document.querySelector('.particle-container');

let mouseX = 0, mouseY = 0, curX = 0, curY = 0;

// ========== 预加载动画 ==========
gsap.to(preloader, {
  opacity: 0,
  duration: 1.2,
  delay: 0.6,
  ease: "power2.inOut",
  onComplete: () => preloader.style.display = "none"
});

// ========== 滚动进度条 ==========
gsap.to(progressBar, {
  width: "100%",
  ease: "none",
  scrollTrigger: {
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: true
  }
});

// ========== 鼠标移动：网格背景视差 ==========
window.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top = mouseY + 'px';
  const x = (e.clientX - window.innerWidth / 2) / 45;
  const y = (e.clientY - window.innerHeight / 2) / 45;
  gridBg.style.transform = `translate3d(${x}px,${y}px,0)`;
});

function animateCursor() {
  curX += (mouseX - curX) * 0.18;
  curY += (mouseY - curY) * 0.18;
  cursor.style.left = curX + 'px';
  cursor.style.top = curY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

// 点击粒子爆破
function createParticle(x, y) {
  for (let i = 0; i < 8; i++) {
    const p = document.createElement("div");
    p.style.position = "absolute";
    p.style.width = "6px";
    p.style.height = "6px";
    p.style.borderRadius = "50%";
    p.style.background = "#ff2a2a";
    p.style.left = x + "px";
    p.style.top = y + "px";
    particleContainer.appendChild(p);
    const angle = (Math.PI * 2 / 8) * i;
    const dist = 60 + Math.random() * 40;
    gsap.fromTo(p, { opacity: 1 }, {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      opacity: 0,
      duration: 0.8,
      onComplete: () => p.remove()
    });
  }
}
window.addEventListener("mousedown", () => cursor.classList.add("click"));
window.addEventListener("mouseup", (e) => {
  cursor.classList.remove("click");
  createParticle(e.clientX, e.clientY);
});

// 光标hover激活
document.querySelectorAll('a, .chip, .video-row, .gallery-card, .skill-card, .qr-card').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('active'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
});

// 导航栏滚动变色
ScrollTrigger.create({
  trigger: "body",
  start: "top 20px",
  onEnter: () => document.querySelector("nav").classList.add("scrolled"),
  onLeaveBack: () => document.querySelector("nav").classList.remove("scrolled")
});

// Hero 标题入场
gsap.from('.line-inner', {
  yPercent: 110,
  opacity: 0,
  duration: 1,
  stagger: 0.18,
  ease: 'power3.out'
});

// Hero 视差
gsap.to('.hero-title', {
  y: 80,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true
  }
});

// About 区块入场
gsap.from(".about .section-label, .about h2, .about .about-text", {
  y: 80,
  rotationX: 12,
  opacity: 0,
  duration: 1,
  stagger: 0.18,
  ease: "power2.out",
  scrollTrigger: {
    trigger: ".about",
    start: "top 75%",
    once: true
  }
});
gsap.from('.skill-card', {
  y: 100,
  scale: 0.92,
  opacity: 0,
  duration: 1,
  stagger: 0.18,
  ease: 'power2.out',
  scrollTrigger: {
    trigger: '.about',
    start: 'top 75%',
    once: true
  }
});

// ========== 无缝跑马灯 ==========
const track = document.querySelector('.marquee-track');
const originalItem = track.querySelector('.marquee-item');
const cloneItem = originalItem.cloneNode(true);
track.appendChild(cloneItem);

const itemWidth = originalItem.offsetWidth;
const marqueeTween = gsap.to(track, {
  x: -itemWidth,
  duration: 22,
  ease: 'none',
  repeat: -1,
  paused: true
});

gsap.to(marqueeTween, {
  timeScale: 2.2,
  scrollTrigger: {
    trigger: ".marquee",
    start: "top bottom",
    end: "bottom top",
    scrub: true
  }
});
marqueeTween.play();

// 窗口缩放自适应
window.addEventListener('resize', () => {
  const newWidth = originalItem.offsetWidth;
  gsap.set(track, { x: 0 });
  marqueeTween.vars.x = -newWidth;
  marqueeTween.invalidate().restart();
});

// Portfolio head入场
gsap.from(".portfolio-head", {
  y: 90,
  scale: 0.94,
  opacity: 0,
  duration: 1.1,
  ease: "power2.out",
  scrollTrigger: {
    trigger: ".portfolio",
    start: "top 75%",
    once: true
  }
});

// 作品列表行入场
gsap.from('.video-row', {
  x: -60,
  opacity: 0,
  duration: 0.95,
  stagger: 0.14,
  ease: 'power2.out',
  scrollTrigger: {
    trigger: '.video-list',
    start: 'top 80%',
    once: true
  }
});

// Gallery卡片入场
gsap.from('.gallery-card', {
  y: 100,
  rotateY: -12,
  opacity: 0,
  duration: 1.1,
  stagger: 0.12,
  ease: 'power2.out',
  scrollTrigger: {
    trigger: '.gallery',
    start: 'top 80%',
    once: true
  }
});

// Contact区块入场
gsap.from(".contact .section-label, .contact h2, .contact-grid", {
  y: 90,
  rotationX: 8,
  opacity: 0,
  duration: 1.1,
  stagger: 0.2,
  ease: "power2.out",
  scrollTrigger: {
    trigger: ".contact",
    start: "top 75%",
    once: true
  }
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ========== 杩涢樁鐗堬細鍒嗙被绛涢€夛紙甯︽贰鍏ユ贰鍑哄姩鐢伙級 ==========
const filterChips = document.querySelectorAll('.portfolio-filter .chip');
const filterRows = document.querySelectorAll('.video-row');
const filterCards = document.querySelectorAll('.gallery-card');

function naturalDisplay(el) {
  return el.classList.contains('video-row') ? 'grid' : 'block';
}

function filterWorks(category) {
  filterRows.forEach(row => {
    const match = category === 'all' || row.dataset.category === category;
    if (match) {
      gsap.fromTo(row,
        { opacity: 0, y: 20, display: naturalDisplay(row) },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
      );
    } else {
      gsap.to(row, {
        opacity: 0, y: 20, duration: 0.3, ease: 'power2.in',
        onComplete: () => gsap.set(row, { display: 'none' })
      });
    }
  });

  filterCards.forEach(card => {
    const match = category === 'all' || card.dataset.category === category;
    if (match) {
      gsap.fromTo(card,
        { opacity: 0, y: 20, display: naturalDisplay(card) },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
      );
    } else {
      gsap.to(card, {
        opacity: 0, y: 20, duration: 0.3, ease: 'power2.in',
        onComplete: () => gsap.set(card, { display: 'none' })
      });
    }
  });
}

filterChips.forEach(chip => {
  chip.addEventListener('click', () => {
    filterChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    filterWorks(chip.dataset.filter);
  });
});

