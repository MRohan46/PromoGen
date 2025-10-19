/* Smooth scroll (Lenis) + GSAP ScrollTrigger wiring, parallax layers, reveals, cursor, interactions */
const state = {
  lenis: null,
  gsap: window.gsap,
  ScrollTrigger: window.ScrollTrigger,
};

function initLenis(){
  const Lenis = window.Lenis;
  if(!Lenis) return;
  const lenis = new Lenis({
    smoothWheel: true,
    duration: 1.2,
    lerp: 0.12,
    wheelMultiplier: 1.0
  });
  state.lenis = lenis;
  function raf(time){
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Sync with ScrollTrigger if present
  const { ScrollTrigger } = state;
  if(ScrollTrigger){
    lenis.on('scroll', ScrollTrigger.update);
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value){ if(arguments.length){ lenis.scrollTo(value, { immediate: true }); } return window.scrollY || window.pageYOffset; },
      getBoundingClientRect(){ return { left:0, top:0, width: window.innerWidth, height: window.innerHeight }; }
    });
  }
}

function initParallaxLayers(){
  const layers = document.querySelectorAll('.layer[data-depth]');
  if(!layers.length || !state.gsap) return;
  const { gsap, ScrollTrigger } = state;
  layers.forEach((layer)=>{
    const depth = parseFloat(layer.getAttribute('data-depth')) || 0.2;
    gsap.to(layer, {
      yPercent: depth * -40,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      }
    });
  });
}

function initHeroReveal(){
  const { gsap } = state; if(!gsap) return;
  const tl = gsap.timeline();
  tl.from('.site-header', { y: -30, opacity: 0, duration: 0.6, ease: 'power3.out' })
    .from('.hero-title .line', { yPercent: 100, opacity: 0, duration: 0.8, ease: 'power4.out', stagger: 0.08 }, '-=0.2')
    .from('.hero-subtitle', { y: 10, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
    .from('.hero-ctas .btn', { y: 8, opacity: 0, duration: 0.5, ease: 'power3.out', stagger: 0.06 }, '-=0.2');
}

function initRevealOnScroll(){
  const { gsap, ScrollTrigger } = state; if(!gsap || !ScrollTrigger) return;
  document.querySelectorAll('.section .section-head, .project-card, .skills-cloud, .skills-bars, .contact-inner').forEach((el)=>{
    gsap.from(el, {
      opacity: 0,
      y: 24,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  });
}

function initProjectsTilt(){
  const cards = document.querySelectorAll('.project-card');
  const constrain = 14;
  let rafId = 0;

  function tilt(card, e){
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const rx = (+1) * (dy / constrain);
    const ry = (-1) * (dx / constrain);
    card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  }
  function reset(card){
    card.style.transform = 'rotateX(0deg) rotateY(0deg)';
  }
  cards.forEach((card)=>{
    card.addEventListener('mousemove', (e)=>{
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(()=>tilt(card, e));
      const media = card.querySelector('.project-media');
      if(media){
        const rect = media.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        media.style.setProperty('--mx', x+'%');
        media.style.setProperty('--my', y+'%');
      }
    });
    card.addEventListener('mouseleave', ()=>reset(card));
    card.addEventListener('focus', ()=>card.classList.add('focus'));
    card.addEventListener('blur', ()=>card.classList.remove('focus'));
  });
}

function initBars(){
  const { gsap, ScrollTrigger } = state; if(!gsap || !ScrollTrigger) return;
  document.querySelectorAll('.bar i').forEach((el)=>{
    const v = parseFloat(el.getAttribute('data-value') || '0');
    gsap.fromTo(el, { width: '0%' }, {
      width: `${Math.round(v*100)}%`,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%' }
    });
  });
}

function initSkillChips(){
  const chips = document.querySelectorAll('.skill-chip');
  const { gsap } = state; if(!gsap) return;
  chips.forEach(chip=>{
    chip.addEventListener('mouseenter', ()=>{
      gsap.to(chip, { y: -3, boxShadow: '0 8px 30px rgba(0,0,0,0.35)', duration: 0.25});
    });
    chip.addEventListener('mouseleave', ()=>{
      gsap.to(chip, { y: 0, boxShadow: 'none', duration: 0.25});
    });
  });
}

function initCursor(){
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if(!dot || !ring) return;
  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0; 
  const speed = 0.18;
  function raf(){
    ringX += (mouseX - ringX) * speed;
    ringY += (mouseY - ringY) * speed;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    requestAnimationFrame(raf);
  }
  window.addEventListener('mousemove', (e)=>{
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  });
  requestAnimationFrame(raf);

  // data-cursor attribute for ring label (simple)
  const tooltip = document.createElement('div');
  tooltip.className = 'cursor-tooltip';
  tooltip.style.position = 'fixed';
  tooltip.style.zIndex = '10001';
  tooltip.style.pointerEvents = 'none';
  tooltip.style.transform = 'translate(-50%, -150%)';
  tooltip.style.color = 'white';
  tooltip.style.fontSize = '12px';
  tooltip.style.opacity = '0';
  document.body.appendChild(tooltip);

  function showCursorLabel(text){
    tooltip.textContent = text;
    tooltip.style.left = ringX + 'px';
    tooltip.style.top = ringY + 'px';
    tooltip.style.opacity = '1';
  }
  function hideCursorLabel(){ tooltip.style.opacity = '0'; }

  document.querySelectorAll('[data-cursor]').forEach(el=>{
    el.addEventListener('mouseenter', ()=> showCursorLabel(el.getAttribute('data-cursor')));
    el.addEventListener('mouseleave', hideCursorLabel);
  });
}

function initContactBackground(){
  const canvas = document.getElementById('contactCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  let w, h, rafId; const orbs = [];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function resize(){
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    w = canvas.clientWidth = canvas.offsetWidth; h = canvas.clientHeight = 380;
    canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function rand(min, max){ return Math.random()*(max-min)+min; }
  function initOrbs(){
    orbs.length = 0;
    for(let i=0;i<18;i++){
      orbs.push({ x: rand(0,w), y: rand(0,h), r: rand(16, 46), dx: rand(-0.4, 0.4), dy: rand(-0.3, 0.3), hue: rand(180, 300)});
    }
  }
  function frame(){
    ctx.clearRect(0,0,w,h);
    for(const o of orbs){
      o.x += o.dx; o.y += o.dy;
      if(o.x< -50 || o.x> w+50) o.dx *= -1;
      if(o.y< -50 || o.y> h+50) o.dy *= -1;
      const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      grad.addColorStop(0, `hsla(${o.hue}, 95%, 65%, 0.35)`);
      grad.addColorStop(1, 'hsla(0,0%,0%,0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI*2); ctx.fill();
    }
    if(!reduceMotion) rafId = requestAnimationFrame(frame);
  }
  resize(); initOrbs(); frame();
  window.addEventListener('resize', ()=>{ resize(); initOrbs(); });
}

function initYear(){
  const el = document.getElementById('year');
  if(el) el.textContent = new Date().getFullYear();
}

function initSectionAnchors(){
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const id = a.getAttribute('href');
      if(id && id.length > 1){
        const target = document.querySelector(id);
        if(target){ e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      }
    });
  });
}

function initScrollTriggerRefresh(){
  const { ScrollTrigger } = state; if(!ScrollTrigger) return;
  let resizeTimeout;
  window.addEventListener('resize', ()=>{
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(()=>ScrollTrigger.refresh(), 200);
  });
}

function main(){
  initLenis();
  initCursor();
  initSectionAnchors();
  initYear();
  // After libs loaded
  const ready = () => Boolean(window.gsap && window.ScrollTrigger);
  const check = setInterval(()=>{
    if(ready()){
      clearInterval(check);
      initParallaxLayers();
      initHeroReveal();
      initRevealOnScroll();
      initBars();
      initSkillChips();
      initContactBackground();
      initScrollTriggerRefresh();
      // Lazy load project backgrounds when in view
      const { gsap, ScrollTrigger } = state;
      document.querySelectorAll('.project-media[data-bg]').forEach(el => {
        const src = el.getAttribute('data-bg');
        ScrollTrigger.create({
          trigger: el,
          start: 'top 95%',
          onEnter(){ el.style.setProperty('--bg', `url('${src}')`); },
          once: true
        });
      });
    }
  }, 30);
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', main);
}else{ main(); }
