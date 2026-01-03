(function () {
  const STORAGE_KEY = 'eventia_dir';
  const html = document.documentElement;
  const saved = localStorage.getItem(STORAGE_KEY);
  
  // Apply saved direction on page load
  if (saved === 'rtl' || saved === 'ltr') {
    html.setAttribute('dir', saved);
  }

  const buttons = Array.from(document.querySelectorAll('[data-rtl-toggle]'));
  
  // Sync button states with current direction
  const syncButtons = () => {
    const isRTL = html.getAttribute('dir') === 'rtl';
    buttons.forEach(btn => {
      btn.setAttribute('aria-pressed', isRTL);
      btn.setAttribute('title', isRTL ? 'Switch to LTR' : 'Switch to RTL');
      
      // Add visual indicator for active state
      if (isRTL) {
        btn.classList.add('ring-2', 'ring-sky-400/50');
      } else {
        btn.classList.remove('ring-2', 'ring-sky-400/50');
      }
    });
    
    // Dispatch custom event for other components to listen to
    document.dispatchEvent(new CustomEvent('directionChange', { 
      detail: { direction: isRTL ? 'rtl' : 'ltr' } 
    }));
  };
  
  // Initial sync
  syncButtons();

  // Handle button clicks
  buttons.forEach(btn => btn.addEventListener('click', () => {
    const next = html.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl';
    html.setAttribute('dir', next);
    localStorage.setItem(STORAGE_KEY, next);
    syncButtons();
    
    // Add transition class for smooth direction change
    document.body.classList.add('direction-transition');
    setTimeout(() => {
      document.body.classList.remove('direction-transition');
    }, 300);
  }));
  
  // Listen for storage changes from other tabs
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && (e.newValue === 'rtl' || e.newValue === 'ltr')) {
      html.setAttribute('dir', e.newValue);
      syncButtons();
    }
  });
})();
