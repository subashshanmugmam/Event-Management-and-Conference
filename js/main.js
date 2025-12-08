// Main interactions and animations for Eventia
(() => {
  // Inject animation styles
  const style = document.createElement('style');
  style.textContent = `
    .anim-pre {opacity:0;transform:translateY(24px);transition:opacity 600ms ease,transform 600ms ease;will-change:opacity,transform;}
    .anim-in {opacity:1;transform:translateY(0);}
    .anim-delay-1 {transition-delay:120ms;}
    .anim-delay-2 {transition-delay:240ms;}
    .anim-delay-3 {transition-delay:360ms;}
    .anim-pop {opacity:0;transform:scale(.96);transition:opacity 420ms ease,transform 420ms ease;}
    .anim-pop-in {opacity:1;transform:scale(1);}
  `;
  document.head.appendChild(style);

  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Animate on scroll
  const animTargets = qsa('section, article, .card, [data-animate]');
  animTargets.forEach((el, idx) => {
    const delayClass = idx % 3 === 1 ? 'anim-delay-1' : idx % 3 === 2 ? 'anim-delay-2' : '';
    el.classList.add('anim-pre');
    if (delayClass) el.classList.add(delayClass);
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('anim-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });
  animTargets.forEach(el => io.observe(el));

  // Nav + header behavior
  const header = qs('[data-header]');
  const headerMode = header?.dataset.headerMode || 'light'; // 'light' expects dark text initially, 'dark' expects light text
  const navToggle = qs('[data-nav-toggle]');
  const navMenu = qs('[data-nav-menu]');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('hidden');
      onScroll(); // update colors immediately for mobile menu state
    });
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        navMenu.classList.add('hidden');
        onScroll();
      }
    });
  }
  const initHomeToggle = () => {
    // Setup dropdown menus for home switching
    qsa('[data-home-switch]').forEach(switchContainer => {
      const btn = switchContainer.querySelector('button');
      const menu = switchContainer.querySelector('[data-home-menu]');

      if (!btn || !menu) return;

      // Toggle menu visibility on button click
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = menu.classList.contains('hidden');

        // Close all other menus first
        qsa('[data-home-menu]').forEach(m => m.classList.add('hidden'));

        // Toggle this menu
        if (isHidden) {
          menu.classList.remove('hidden');
        } else {
          menu.classList.add('hidden');
        }
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('[data-home-switch]')) {
        qsa('[data-home-menu]').forEach(menu => menu.classList.add('hidden'));
      }
    });
  };

  const onScroll = () => {
    if (!header) return;
    const scrolled = window.scrollY > 12;
    const menuOpen = navMenu && !navMenu.classList.contains('hidden');
    const useDarkText = headerMode === 'light'
      ? true // Light mode always wants dark text (Transparency implies light bg behind, Scroll implies white bg)
      : menuOpen; // Dark mode only wants dark text if mobile menu is open (white bg)

    // Toggle background and blur based on mode
    // Toggle background and blur based on mode
    if (headerMode === 'light') {
      // Light Mode (Home 2): Starts transparent/light, becomes White on scroll
      header.classList.toggle('bg-white/90', scrolled);
      header.classList.toggle('backdrop-blur-md', scrolled);
      header.classList.toggle('shadow-sm', scrolled);
      // Remove valid dark/slate bg if present from other logic
      header.classList.remove('bg-slate-950/80');
    } else {
      // Dark Mode (Home 1): Starts transparent/dark, becomes Dark on scroll
      header.classList.toggle('bg-[#020617]/90', scrolled);
      header.classList.toggle('backdrop-blur-md', scrolled);
      header.classList.toggle('border-white/5', scrolled);

      // Ensure we don't have white bg
      header.classList.remove('bg-white');
      header.classList.remove('bg-white/90');
      header.classList.remove('shadow-sm');
    }

    // Toggle text colors for all nav elements
    const logo = header.querySelector('a[href="index.html"]');
    const navLinks = header.querySelectorAll('[data-nav-menu] a, [data-nav-menu] button');
    const rtlButton = header.querySelector('[data-rtl-toggle]');
    const navToggle = header.querySelector('[data-nav-toggle]');

    if (logo) {
      logo.classList.toggle('text-white', !useDarkText);
      logo.classList.toggle('text-slate-900', useDarkText);
    }

    navLinks.forEach(link => {
      // Skip login button and Home Dropdown links (they have static colors)
      if (link.href?.includes('login.html') || link.closest('[data-home-menu]')) return;

      // Handle all nav links and buttons
      link.classList.toggle('text-white', !useDarkText);
      link.classList.toggle('text-slate-900', useDarkText);
      link.classList.toggle('hover:text-sky-300', !useDarkText);
      link.classList.toggle('hover:text-sky-600', useDarkText);
    });

    if (rtlButton) {
      rtlButton.classList.toggle('border-white/20', !useDarkText);
      rtlButton.classList.toggle('text-white', !useDarkText);
      rtlButton.classList.toggle('hover:border-white/40', !useDarkText);
      rtlButton.classList.toggle('border-slate-300', useDarkText);
      rtlButton.classList.toggle('text-slate-900', useDarkText);
      rtlButton.classList.toggle('hover:border-slate-900', useDarkText);
    }

    if (navToggle) {
      navToggle.classList.toggle('bg-white/10', !useDarkText);
      navToggle.classList.toggle('text-white', !useDarkText);
      navToggle.classList.toggle('bg-slate-900', useDarkText);
    }

    const scrollTopBtn = qs('[data-scroll-top]');
    if (scrollTopBtn) scrollTopBtn.classList.toggle('hidden', window.scrollY < 240);
  };
  document.addEventListener('scroll', onScroll);
  onScroll();
  initHomeToggle();

  // Smooth scroll for anchor links
  qsa('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const el = qs(targetId);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  const scrollTopBtn = qs('[data-scroll-top]');
  if (scrollTopBtn) scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Form validation (basic)
  qsa('form[data-validate]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      qsa('[required]', form).forEach(field => {
        const errorEl = field.closest('div')?.querySelector('[data-error]') || field.parentElement.querySelector('[data-error]');
        if (!field.value.trim()) {
          valid = false;
          if (errorEl) errorEl.classList.remove('hidden');
          field.classList.add('ring-2', 'ring-rose-400');
        } else {
          if (errorEl) errorEl.classList.add('hidden');
          field.classList.remove('ring-2', 'ring-rose-400');
        }
      });
      const successEl = form.querySelector('[data-success]');
      if (valid && successEl) successEl.classList.remove('hidden');
    });
  });

  // Tabs
  qsa('[data-tabs]').forEach(tabGroup => {
    const buttons = qsa('[data-tab]', tabGroup.parentElement || tabGroup);
    buttons.forEach(btn => btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      buttons.forEach(b => b.classList.replace('bg-sky-500', 'bg-white/10'));
      btn.classList.add('bg-sky-500');
      qsa('[data-tab-panel]', tabGroup.parentElement || document).forEach(panel => {
        panel.classList.toggle('hidden', panel.dataset.tabPanel !== target);
      });
    }));
  });

  // Accordions
  qsa('[data-accordion]').forEach(acc => {
    qsa('[data-accordion-toggle]', acc).forEach(toggle => {
      toggle.addEventListener('click', () => {
        const content = toggle.parentElement.nextElementSibling;
        content.classList.toggle('hidden');
        const icon = toggle.querySelector('i');
        if (icon) icon.classList.toggle('fa-plus');
        if (icon) icon.classList.toggle('fa-minus');
      });
    });
  });

  // Carousel (simple auto-play)
  const carousel = qs('[data-carousel]');
  if (carousel) {
    const track = qs('[data-carousel-track]', carousel);
    const slides = qsa('article', track);
    let index = 0;
    const setIndex = (i) => {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
    };
    qsa('[data-carousel-next]').forEach(btn => btn.addEventListener('click', () => setIndex(index + 1)));
    qsa('[data-carousel-prev]').forEach(btn => btn.addEventListener('click', () => setIndex(index - 1)));
    setInterval(() => setIndex(index + 1), 5000);
  }

  // Modals
  const modal = qs('[data-modal]');
  if (modal) {
    const closeModal = () => modal.classList.add('hidden');
    qsa('[data-modal-close]').forEach(btn => btn.addEventListener('click', closeModal));
    qsa('[data-modal-open]').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.session');
        if (card) {
          const title = qs('h3', card)?.textContent || 'Session';
          const body = qs('p.text-sm', card)?.textContent || '';
          const modalTitle = qs('[data-modal-title]', modal);
          const modalBody = qs('[data-modal-body]', modal);
          if (modalTitle) modalTitle.textContent = title;
          if (modalBody) modalBody.textContent = body;
        }
        modal.classList.remove('hidden');
      });
    });
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  }

  // Filters (schedule)
  const filterTrack = qs('[data-filter-track]');
  const filterType = qs('[data-filter-type]');
  const filterSpeaker = qs('[data-filter-speaker]');
  const filterSearch = qs('[data-filter-search]');
  const activeFilters = qs('[data-active-filters]');
  const sessions = qsa('[data-session-list] .session');
  const runFilters = () => {
    const t = filterTrack?.value || 'all';
    const ty = filterType?.value || 'all';
    const sp = filterSpeaker?.value || 'all';
    const q = (filterSearch?.value || '').toLowerCase();
    sessions.forEach(card => {
      const match = (t === 'all' || card.dataset.track === t)
        && (ty === 'all' || card.dataset.type === ty)
        && (sp === 'all' || card.dataset.speaker === sp)
        && card.textContent.toLowerCase().includes(q);
      card.classList.toggle('hidden', !match);
    });
    if (activeFilters) {
      activeFilters.innerHTML = '';
      [[filterTrack, 'Track'], [filterType, 'Type'], [filterSpeaker, 'Speaker']].forEach(([sel, label]) => {
        if (sel && sel.value !== 'all') {
          const pill = document.createElement('span');
          pill.className = 'rounded-full bg-white/10 px-3 py-1 text-xs text-white';
          pill.textContent = `${label}: ${sel.options[sel.selectedIndex].text}`;
          activeFilters.appendChild(pill);
        }
      });
    }
  };
  [filterTrack, filterType, filterSpeaker, filterSearch].forEach(el => el && el.addEventListener('input', runFilters));
  runFilters();

  // Simple counters (hero stats)
  qsa('[data-count]').forEach(el => {
    const target = Number(el.dataset.count || 0);
    let current = 0;
    const step = Math.max(1, Math.round(target / 60));
    const tick = () => {
      current += step;
      if (current >= target) { el.textContent = target; return; }
      el.textContent = current;
      requestAnimationFrame(tick);
    };
    tick();
  });

  // Register multi-step form with persistence
  const regForm = qs('[data-register-form]');
  if (regForm) {
    const steps = qsa('[data-step]', regForm);
    const nextBtn = qs('[data-next]', regForm);
    const prevBtn = qs('[data-prev]', regForm);
    const submitBtn = qs('[data-submit]', regForm);
    const successEl = qs('[data-success]', regForm);
    const progress = qs('[data-step-progress]');
    const stepLabel = qs('[data-step-label]');
    const summaryEl = qs('[data-summary]');
    const reviewEl = qs('[data-review]');
    let current = 0;
    let store = {};
    try { store = JSON.parse(sessionStorage.getItem('eventiaRegister') || '{}'); } catch (_) { store = {}; }

    const persist = () => sessionStorage.setItem('eventiaRegister', JSON.stringify(store));

    const applyStoredValues = () => {
      qsa('input, select, textarea', regForm).forEach(field => {
        const key = field.name;
        if (!key || !(key in store)) return;
        if (field.type === 'checkbox') {
          field.checked = Array.isArray(store[key]) ? store[key].includes(field.value) : Boolean(store[key]);
        } else if (field.type === 'radio') {
          field.checked = store[key] === field.value;
        } else {
          field.value = store[key];
        }
      });
    };

    const buildReview = () => {
      if (!reviewEl) return;
      const ticket = store.ticket || 'Explorer';
      const dietary = store.diet || '-';
      const access = store.access || '-';
      reviewEl.textContent = `Ticket: ${ticket} | Dietary: ${dietary} | Accessibility: ${access}`;
    };

    const updateSummary = () => {
      if (!summaryEl) return;
      summaryEl.innerHTML = '';
      const items = [
        `Ticket: ${store.ticket || 'Explorer'}`,
        `Price: ${store.ticket === 'Executive' ? '$899' : store.ticket === 'Virtual' ? '$249' : '$499'}`,
        `Dietary: ${store.diet || '-'}`,
      ];
      items.forEach(text => {
        const p = document.createElement('p');
        p.textContent = text;
        summaryEl.appendChild(p);
      });
    };

    const showStep = () => {
      steps.forEach((step, idx) => step.classList.toggle('hidden', idx !== current));
      if (progress) progress.style.width = `${((current + 1) / steps.length) * 100}%`;
      if (stepLabel) stepLabel.textContent = `${current + 1}/${steps.length}`;
      if (prevBtn) prevBtn.classList.toggle('opacity-50', current === 0);
      if (nextBtn) nextBtn.classList.toggle('hidden', current === steps.length - 1);
      if (submitBtn) submitBtn.classList.toggle('hidden', current !== steps.length - 1);
      buildReview();
      updateSummary();
    };

    const validateStep = () => {
      let valid = true;
      qsa('[required]', steps[current]).forEach(field => {
        if (!field.value.trim()) {
          valid = false;
          field.classList.add('ring-2', 'ring-rose-400');
        } else {
          field.classList.remove('ring-2', 'ring-rose-400');
        }
      });
      return valid;
    };

    qsa('input, select, textarea', regForm).forEach(field => {
      field.addEventListener('input', () => {
        const key = field.name;
        if (!key) return;
        if (field.type === 'checkbox') {
          const arr = store[key] || [];
          if (field.checked) {
            if (!arr.includes(field.value)) arr.push(field.value);
          } else {
            const idx = arr.indexOf(field.value);
            if (idx >= 0) arr.splice(idx, 1);
          }
          store[key] = arr;
        } else if (field.type === 'radio') {
          if (field.checked) store[key] = field.value;
        } else {
          store[key] = field.value;
        }
        persist();
        buildReview();
        updateSummary();
      });
    });

    if (nextBtn) nextBtn.addEventListener('click', () => {
      if (!validateStep()) return;
      current = Math.min(current + 1, steps.length - 1);
      showStep();
    });
    if (prevBtn) prevBtn.addEventListener('click', () => {
      current = Math.max(0, current - 1);
      showStep();
    });
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateStep()) return;
      if (successEl) successEl.classList.remove('hidden');
      persist();
    });

    applyStoredValues();
    showStep();
  }

  // Admin table sort (by name)
  qsa('[data-sort-table]').forEach(btn => {
    btn.addEventListener('click', () => {
      const table = btn.closest('section')?.querySelector('[data-table]');
      if (!table) return;
      const rows = qsa('tbody tr', table);
      const asc = btn.dataset.order !== 'desc';
      rows.sort((a, b) => {
        const aText = a.cells[0].textContent.trim().toLowerCase();
        const bText = b.cells[0].textContent.trim().toLowerCase();
        return asc ? aText.localeCompare(bText) : bText.localeCompare(aText);
      });
      const tbody = table.querySelector('tbody');
      rows.forEach(r => tbody.appendChild(r));
      btn.dataset.order = asc ? 'desc' : 'asc';
    });
  });

  // User dashboard: remove sessions
  qsa('[data-remove-session]').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('li');
      if (row) row.remove();
    });
  });

  // Sidebar toggle (admin)
  const sidebar = qs('[data-sidebar]');
  const sidebarToggle = qs('[data-sidebar-toggle]');
  if (sidebar && sidebarToggle) {
    sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('hidden'));
  }

  // Countdown (coming soon)
  qsa('[data-countdown]').forEach(box => {
    const targetStr = box.dataset.target;
    if (!targetStr) return;
    const target = new Date(targetStr).getTime();
    const dd = qs('[data-dd]', box);
    const hh = qs('[data-hh]', box);
    const mm = qs('[data-mm]', box);
    const ss = qs('[data-ss]', box);
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      if (dd) dd.textContent = String(days).padStart(2, '0');
      if (hh) hh.textContent = String(hours).padStart(2, '0');
      if (mm) mm.textContent = String(mins).padStart(2, '0');
      if (ss) ss.textContent = String(secs).padStart(2, '0');
      if (diff > 0) requestAnimationFrame(tick);
    };
    tick();
  });
})();
