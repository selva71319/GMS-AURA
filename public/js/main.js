/* ═══════════════════════════════════════════
   GMS AURA — Premium AI-Driven Digital Agency
   ═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // ── Navbar Scroll ──
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
  navbar.classList.toggle('scrolled', window.scrollY > 40);

  // ── Mobile Menu ──
  const toggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  if (toggle) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      toggle.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    }));
  }

  // ── Scroll Reveal ──
  const revealEls = document.querySelectorAll('.reveal-up');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('revealed'), parseInt(e.target.dataset.delay) || 0);
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => revealObs.observe(el));

  // ── Animated Counters ──
  const statNums = document.querySelectorAll('.stat-number[data-target]');
  let countersStarted = false;
  const startCounters = () => {
    if (countersStarted) return;
    countersStarted = true;
    statNums.forEach(num => {
      const target = parseInt(num.dataset.target);
      const start = performance.now();
      const update = (now) => {
        const p = Math.min((now - start) / 2000, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        num.textContent = Math.floor(eased * target);
        if (p < 1) requestAnimationFrame(update);
        else num.textContent = target;
      };
      requestAnimationFrame(update);
    });
  };
  if (statNums.length) {
    const statsObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { startCounters(); statsObs.unobserve(e.target); } });
    }, { threshold: 0.5 });
    statNums.forEach(n => statsObs.observe(n));
  }

  // ── Card Mouse Glow ──
  document.querySelectorAll('.feature-card, .benefit-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${((e.clientX - r.left) / r.width) * 100}%`);
      card.style.setProperty('--mouse-y', `${((e.clientY - r.top) / r.height) * 100}%`);
    });
  });

  // ── Demo Card Tilt ──
  document.querySelectorAll('.demo-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.transform = `perspective(800px) rotateX(${(y - 0.5) * -8}deg) rotateY(${(x - 0.5) * 8}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => card.style.transform = '');
  });

  // ── Magnetic Buttons ──
  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.15}px, ${(e.clientY - r.top - r.height / 2) * 0.15}px)`;
    });
    btn.addEventListener('mouseleave', () => btn.style.transform = '');
  });

  // ── Parallax Hero Orbs ──
  const orbs = document.querySelectorAll('.hero-orb');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(() => {
      if (window.scrollY < window.innerHeight * 1.5) {
        orbs.forEach((o, i) => o.style.transform = `translateY(${window.scrollY * (0.15 + i * 0.08)}px)`);
      }
      ticking = false;
    }); ticking = true; }
  }, { passive: true });

  // ── Smooth Anchors ──
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); window.scrollTo({ top: t.offsetTop - 80, behavior: 'smooth' }); }
    });
  });

  // ── Cursor Glow ──
  const glow = document.createElement('div');
  Object.assign(glow.style, { position:'fixed', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle,rgba(127,90,240,0.04),transparent 70%)', pointerEvents:'none', zIndex:'0', transform:'translate(-50%,-50%)', transition:'left .3s ease,top .3s ease' });
  document.body.appendChild(glow);
  document.addEventListener('mousemove', e => { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; });

  // ═══════════ CONTACT FORM ═══════════
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = document.getElementById('contactSubmit');
      const msg = document.getElementById('contactMsg');
      btn.disabled = true;
      btn.querySelector('span').textContent = 'Sending...';
      try {
        const data = Object.fromEntries(new FormData(contactForm));
        const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const json = await res.json();
        msg.textContent = json.message || json.error;
        msg.style.color = json.success ? '#10B981' : '#EF4444';
        if (json.success) contactForm.reset();
      } catch { msg.textContent = 'Network error. Please try again.'; msg.style.color = '#EF4444'; }
      btn.disabled = false;
      btn.querySelector('span').textContent = 'Send Message';
    });
  }

  // ═══════════ NEWSLETTER FORM ═══════════
  const nlForm = document.getElementById('newsletterForm');
  if (nlForm) {
    nlForm.addEventListener('submit', async e => {
      e.preventDefault();
      const msg = document.getElementById('newsletterMsg');
      try {
        const email = nlForm.querySelector('input[name="email"]').value;
        const res = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
        const json = await res.json();
        msg.textContent = json.message || json.error;
        msg.style.color = json.success ? '#10B981' : '#EF4444';
        if (json.success) nlForm.reset();
      } catch { msg.textContent = 'Network error.'; msg.style.color = '#EF4444'; }
    });
  }

  // ═══════════ TESTIMONIALS PAGE (dynamic load) ═══════════
  const testimonialsGrid = document.getElementById('testimonialsGrid');
  if (testimonialsGrid) {
    fetch('/api/testimonials').then(r => r.json()).then(json => {
      if (!json.success) return;
      testimonialsGrid.innerHTML = json.data.map(t => `
        <div class="testimonial-card-full reveal-up">
          <div class="testimonial-stars">${'★'.repeat(t.rating)}</div>
          <p>"${t.content}"</p>
          <div class="testimonial-author">
            <div class="author-avatar" style="background:${t.avatar_gradient}">${t.avatar_initials}</div>
            <div><span class="author-name">${t.name}</span><span class="author-role">${t.role}, ${t.company}</span></div>
          </div>
        </div>`).join('');
      // re-observe reveals
      testimonialsGrid.querySelectorAll('.reveal-up').forEach(el => revealObs.observe(el));
    }).catch(() => { testimonialsGrid.innerHTML = '<p style="text-align:center;color:var(--text-muted)">Failed to load testimonials.</p>'; });
  }

  // ═══════════ BLOG PAGE (dynamic load) ═══════════
  const blogGrid = document.getElementById('blogGrid');
  if (blogGrid) {
    fetch('/api/blog').then(r => r.json()).then(json => {
      if (!json.success) return;
      blogGrid.innerHTML = json.data.map(p => `
        <a href="/blog/${p.slug}" class="blog-card reveal-up">
          <div class="blog-card-cover" style="background:${p.cover_gradient}"></div>
          <div class="blog-card-body">
            <span class="blog-card-cat">${p.category}</span>
            <h3>${p.title}</h3>
            <p>${p.excerpt}</p>
            <div class="blog-card-meta"><span>${p.author}</span><span>·</span><span>${p.read_time}</span></div>
          </div>
        </a>`).join('');
      blogGrid.querySelectorAll('.reveal-up').forEach(el => revealObs.observe(el));
    }).catch(() => { blogGrid.innerHTML = '<p style="text-align:center;color:var(--text-muted)">Failed to load posts.</p>'; });
  }

  // ═══════════ BLOG POST PAGE ═══════════
  const blogPostContent = document.getElementById('blogPostContent');
  if (blogPostContent && window.location.pathname.startsWith('/blog/')) {
    const slug = window.location.pathname.split('/blog/')[1];
    fetch(`/api/blog/${slug}`).then(r => r.json()).then(json => {
      if (!json.success) { blogPostContent.innerHTML = '<h2>Post not found</h2><p><a href="/blog">← Back to blog</a></p>'; return; }
      const p = json.data;
      document.title = `${p.title} — GMS AURA`;
      blogPostContent.innerHTML = `
        <a href="/blog" class="blog-back-link">← Back to Blog</a>
        <div class="blog-post-cover" style="background:${p.cover_gradient}"></div>
        <div class="blog-post-meta"><span class="blog-card-cat">${p.category}</span><span>${p.author}</span><span>·</span><span>${p.read_time}</span></div>
        <h1 class="blog-post-title">${p.title}</h1>
        <div class="blog-post-body">${p.content}</div>`;
    }).catch(() => { blogPostContent.innerHTML = '<h2>Error loading post</h2><p><a href="/blog">← Back to blog</a></p>'; });
  }

  // ═══════════ SHOWCASE FILTER ═══════════
  const filterBtns = document.querySelectorAll('.filter-btn');
  const showcaseItems = document.querySelectorAll('.showcase-item');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      showcaseItems.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        item.style.display = match ? '' : 'none';
        if (match) { item.classList.remove('revealed'); setTimeout(() => item.classList.add('revealed'), 50); }
      });
    });
  });
});
