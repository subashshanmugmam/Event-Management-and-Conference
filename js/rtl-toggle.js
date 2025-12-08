(function () {
  const STORAGE_KEY = 'eventia_dir';
  const html = document.documentElement;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'rtl' || saved === 'ltr') html.setAttribute('dir', saved);

  const buttons = Array.from(document.querySelectorAll('[data-rtl-toggle]'));
  const syncButtons = () => {
    const dir = html.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr';
    buttons.forEach(btn => {
      btn.setAttribute('aria-pressed', dir === 'rtl');
    });
  };
  syncButtons();

  buttons.forEach(btn => btn.addEventListener('click', () => {
    const next = html.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl';
    html.setAttribute('dir', next);
    localStorage.setItem(STORAGE_KEY, next);
    syncButtons();
  }));
})();
