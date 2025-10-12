(function(){
  const qs = (sel, ctx=document) => ctx.querySelector(sel);
  const qsa = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  // Mobile nav toggle
  const nav = qs('.primary-nav');
  const navToggle = qs('[data-nav-toggle]');
  const navMenu = qs('[data-nav-menu]');
  if (nav && navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open', !expanded);
    });
    // Close when clicking outside on small screens
    document.addEventListener('click', (e) => {
      if (window.matchMedia('(max-width: 720px)').matches) {
        if (!nav.contains(e.target) && nav.classList.contains('open')) {
          nav.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  }

  // Reveal on scroll
  const revealEls = qsa('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length){
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  // Parallax background for hero
  const heroBg = qs('.hero-bg');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (heroBg && !reduceMotion) {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY * 0.18;
          heroBg.style.transform = `translateY(${y}px)`;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Testimonials carousel (accessible)
  const carousel = qs('[data-carousel]');
  if (carousel) {
    const track = qs('[data-carousel-track]', carousel);
    const slides = qsa('.carousel-slide', track);
    const prevBtn = qs('[data-carousel-prev]', carousel);
    const nextBtn = qs('[data-carousel-next]', carousel);
    const dotsRoot = qs('[data-carousel-dots]', carousel);
    let index = 0;

    const setAria = () => {
      slides.forEach((slide, i) => {
        const selected = i === index;
        slide.setAttribute('aria-hidden', String(!selected));
        slide.tabIndex = selected ? 0 : -1;
      });
      qsa('[role="tab"]', dotsRoot).forEach((dot, i) => {
        dot.setAttribute('aria-selected', String(i === index));
        dot.tabIndex = i === index ? 0 : -1;
      });
    };

    const update = () => {
      const offset = index * -100;
      track.style.transform = `translateX(${offset}%)`;
      setAria();
    };

    const goTo = (i) => {
      index = (i + slides.length) % slides.length;
      update();
    };

    // Dots
    slides.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', `Show slide ${i+1}`);
      btn.addEventListener('click', () => goTo(i));
      dotsRoot.appendChild(btn);
    });

    prevBtn?.addEventListener('click', () => goTo(index - 1));
    nextBtn?.addEventListener('click', () => goTo(index + 1));

    // Keyboard
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
    });

    // Init
    update();
  }
})();
