/* ═══════════════════════════════════════════════════════════
   GMS AURA — Premium AI-Driven Digital Agency
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // ═══════════ NAVBAR SCROLL EFFECT ═══════════
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  const handleNavScroll = () => {
    const currentScroll = window.scrollY;
    navbar.classList.toggle('scrolled', currentScroll > 40);
    lastScroll = currentScroll;
  };
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // ═══════════ MOBILE MENU ═══════════
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');

  mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileToggle.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ═══════════ SCROLL REVEAL ═══════════
  const revealElements = document.querySelectorAll('.reveal-up');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay) || 0;
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ═══════════ ANIMATED NUMBER COUNTERS ═══════════
  const statNumbers = document.querySelectorAll('.stat-number');
  let countersStarted = false;

  const startCounters = () => {
    if (countersStarted) return;
    countersStarted = true;
    statNumbers.forEach(num => {
      const target = parseInt(num.dataset.target);
      const duration = 2000;
      const startTime = performance.now();

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        num.textContent = current;
        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          num.textContent = target;
        }
      };
      requestAnimationFrame(updateCounter);
    });
  };

  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startCounters();
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    statsObserver.observe(statsSection);
  }

  // ═══════════ CARD MOUSE GLOW TRACKING ═══════════
  const glowCards = document.querySelectorAll('.feature-card, .benefit-card');
  glowCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    });
  });

  // ═══════════ TESTIMONIAL SLIDER ═══════════
  const track = document.getElementById('testimonialTrack');
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');
  const dotsContainer = document.getElementById('sliderDots');
  const cards = track.querySelectorAll('.testimonial-card');
  let currentSlide = 0;
  let slidesPerView = 3;
  let autoplayInterval;

  const updateSlidesPerView = () => {
    const w = window.innerWidth;
    if (w <= 768) slidesPerView = 1;
    else if (w <= 1024) slidesPerView = 2;
    else slidesPerView = 3;
  };

  const totalSlides = () => Math.max(1, cards.length - slidesPerView + 1);

  const createDots = () => {
    dotsContainer.innerHTML = '';
    const count = totalSlides();
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.classList.add('slider-dot');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }
  };

  const goToSlide = (index) => {
    currentSlide = Math.max(0, Math.min(index, totalSlides() - 1));
    const cardWidth = cards[0].offsetWidth + 24; // gap
    track.style.transform = `translateX(-${currentSlide * cardWidth}px)`;

    // Update dots
    dotsContainer.querySelectorAll('.slider-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  };

  const nextSlide = () => goToSlide((currentSlide + 1) % totalSlides());
  const prevSlide = () => goToSlide(currentSlide <= 0 ? totalSlides() - 1 : currentSlide - 1);

  prevBtn.addEventListener('click', () => { prevSlide(); resetAutoplay(); });
  nextBtn.addEventListener('click', () => { nextSlide(); resetAutoplay(); });

  const startAutoplay = () => {
    autoplayInterval = setInterval(nextSlide, 5000);
  };

  const resetAutoplay = () => {
    clearInterval(autoplayInterval);
    startAutoplay();
  };

  const initSlider = () => {
    updateSlidesPerView();
    createDots();
    goToSlide(0);
    startAutoplay();
  };

  initSlider();
  window.addEventListener('resize', () => {
    updateSlidesPerView();
    createDots();
    goToSlide(Math.min(currentSlide, totalSlides() - 1));
  });

  // Touch support
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
      resetAutoplay();
    }
  }, { passive: true });

  // ═══════════ SMOOTH ANCHOR SCROLLING ═══════════
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offsetTop = target.offsetTop - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // ═══════════ PARALLAX ON HERO ORBS ═══════════
  const heroOrbs = document.querySelectorAll('.hero-orb');
  let ticking = false;

  const handleParallax = () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight * 1.5) {
      heroOrbs.forEach((orb, i) => {
        const speed = 0.15 + (i * 0.08);
        orb.style.transform = `translateY(${scrollY * speed}px)`;
      });
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(handleParallax);
      ticking = true;
    }
  }, { passive: true });

  // ═══════════ MAGNETIC BUTTON EFFECT ═══════════
  const magneticBtns = document.querySelectorAll('.btn-primary');
  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // ═══════════ TILT EFFECT ON DEMO CARDS ═══════════
  const demoCards = document.querySelectorAll('.demo-card');
  demoCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateX = (y - 0.5) * -8;
      const rotateY = (x - 0.5) * 8;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ═══════════ STAGGERED ENTRY FOR PROCESS STEPS ═══════════
  const processSteps = document.querySelectorAll('.process-step');
  const processObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const step = entry.target;
        const delay = parseInt(step.dataset.delay) || 0;
        setTimeout(() => {
          step.style.opacity = '1';
          step.style.transform = 'translateY(0)';
        }, delay);
        processObserver.unobserve(step);
      }
    });
  }, { threshold: 0.2 });

  processSteps.forEach(step => {
    step.style.opacity = '0';
    step.style.transform = 'translateY(20px)';
    step.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    processObserver.observe(step);
  });

  // ═══════════ TYPEWRITER BADGE TEXT (one-shot) ═══════════
  const badge = document.querySelector('.hero-badge');
  if (badge) {
    const originalText = badge.textContent.trim();
    const dotEl = badge.querySelector('.badge-dot');
    badge.textContent = '';
    if (dotEl) badge.appendChild(dotEl);
    const textNode = document.createTextNode('');
    badge.appendChild(textNode);

    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < originalText.length) {
        textNode.textContent += originalText[i];
        i++;
      } else {
        clearInterval(typeInterval);
      }
    }, 35);
  }

  // ═══════════ CURSOR GRADIENT FOLLOW (subtle page-level) ═══════════
  const cursorGlow = document.createElement('div');
  Object.assign(cursorGlow.style, {
    position: 'fixed',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(127,90,240,0.04), transparent 70%)',
    pointerEvents: 'none',
    zIndex: '0',
    transform: 'translate(-50%, -50%)',
    transition: 'left 0.3s ease, top 0.3s ease'
  });
  document.body.appendChild(cursorGlow);

  document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
  });

  // ═══════════ ACTIVE NAV LINK HIGHLIGHTING ═══════════
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a:not(.nav-cta)');

  const highlightNav = () => {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navAnchors.forEach(a => {
          a.style.color = '';
          if (a.getAttribute('href') === `#${id}`) {
            a.style.color = 'var(--text-primary)';
          }
        });
      }
    });
  };

  window.addEventListener('scroll', highlightNav, { passive: true });
});
