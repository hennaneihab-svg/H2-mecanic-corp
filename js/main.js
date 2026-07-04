/* ==========================================================================
   H2 MECANIC CORP — Main JavaScript
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollEffects();
  setActiveNavLink();
});


/* ══════════════════════════════════════════════════════════════════════════
   NAVIGATION
   ══════════════════════════════════════════════════════════════════════════ */
function initNavigation() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  const overlay = document.getElementById('nav-overlay');
  const navLinks = menu ? menu.querySelectorAll('.nav__link') : [];

  if (!toggle || !menu) return;

  function openMenu() {
    toggle.classList.add('nav__toggle--active');
    menu.classList.add('nav__menu--open');
    if (overlay) overlay.classList.add('nav__overlay--visible');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    toggle.classList.remove('nav__toggle--active');
    menu.classList.remove('nav__menu--open');
    if (overlay) overlay.classList.remove('nav__overlay--visible');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.contains('nav__menu--open');
    isOpen ? closeMenu() : openMenu();
  });

  if (overlay) {
    overlay.addEventListener('click', closeMenu);
  }

  // Close on nav link click (mobile)
  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('nav__menu--open')) {
      closeMenu();
    }
  });

  // Close menu on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && menu.classList.contains('nav__menu--open')) {
      closeMenu();
    }
  });
}


/* ══════════════════════════════════════════════════════════════════════════
   SCROLL EFFECTS
   ══════════════════════════════════════════════════════════════════════════ */
function initScrollEffects() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  let lastScrollY = 0;
  let ticking = false;

  function updateNav() {
    const scrollY = window.scrollY;

    if (scrollY > 50) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }

    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });
}


/* ══════════════════════════════════════════════════════════════════════════
   ACTIVE NAV LINK
   ══════════════════════════════════════════════════════════════════════════ */
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav__link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    const linkPage = href.split('/').pop();

    if (linkPage === currentPage ||
        (currentPage === '' && linkPage === 'index.html') ||
        (currentPage === 'index.html' && linkPage === 'index.html')) {
      link.classList.add('nav__link--active');
    } else {
      link.classList.remove('nav__link--active');
    }
  });
}
