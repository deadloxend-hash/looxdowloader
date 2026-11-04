/* Shared responsive navigation for all MediaGrab pages. */
(function () {
  const sidebar = document.getElementById('looxSiteSidebar');
  const toggles = Array.from(document.querySelectorAll('[data-sidebar-toggle]'));
  const scrim = document.querySelector('[data-close-sidebar]');
  if (!sidebar) return;

  const isMobile = () => window.matchMedia('(max-width: 1100px)').matches;
  const isOpen = () => document.body.classList.contains('loox-sidebar-open');

  function closeSidebar() {
    document.body.classList.remove('loox-sidebar-open');
    toggles.forEach(button => button.setAttribute('aria-expanded', 'false'));
  }
  function openSidebar() {
    if (!isMobile()) return;
    document.body.classList.add('loox-sidebar-open');
    toggles.forEach(button => button.setAttribute('aria-expanded', 'true'));
  }

  toggles.forEach(button => button.addEventListener('click', () => {
    if (isOpen()) closeSidebar();
    else openSidebar();
  }));
  if (scrim) scrim.addEventListener('click', closeSidebar);

  // A click/tap anywhere outside the sidebar closes it. Opening toggles are
  // excluded so the same interaction never closes and immediately reopens it.
  document.addEventListener('pointerdown', event => {
    if (!isOpen() || !isMobile()) return;
    const target = event.target;
    if (sidebar.contains(target) || toggles.some(button => button.contains(target))) return;
    closeSidebar();
  }, { passive: true });

  // Do not lock body scrolling. Wheel gestures outside the menu dismiss the
  // menu before the browser applies its normal page scroll.
  document.addEventListener('wheel', event => {
    if (isOpen() && isMobile() && !sidebar.contains(event.target)) closeSidebar();
  }, { passive: true, capture: true });

  // On touchscreens, swipe on the backdrop closes the menu and keeps scrolling
  // the underlying page. Swipes within the menu still scroll its link list.
  let startX = 0;
  let startY = 0;
  let startedOutside = false;
  document.addEventListener('touchstart', event => {
    if (!isOpen() || !isMobile() || !event.touches.length) {
      startedOutside = false;
      return;
    }
    startedOutside = !sidebar.contains(event.target);
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchmove', event => {
    if (!startedOutside || !isOpen() || !event.touches.length) return;
    const deltaX = event.touches[0].clientX - startX;
    const deltaY = event.touches[0].clientY - startY;
    if (Math.abs(deltaY) > 5 || Math.abs(deltaX) > 8) closeSidebar();
  }, { passive: true });
  document.addEventListener('touchend', () => { startedOutside = false; }, { passive: true });
  document.addEventListener('touchcancel', () => { startedOutside = false; }, { passive: true });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && isOpen()) {
      closeSidebar();
      toggles[0]?.focus();
    }
  });
  sidebar.querySelectorAll('a').forEach(anchor => anchor.addEventListener('click', closeSidebar));
  window.addEventListener('resize', () => {
    if (!isMobile()) closeSidebar();
  }, { passive: true });
})();
