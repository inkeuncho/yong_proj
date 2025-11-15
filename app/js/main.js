/**
 * Main JavaScript - Interaction & Animation Logic
 *
 * Features:
 * - Fade-in animations on scroll
 * - Navbar scroll effects
 * - Intersection Observer for performance
 */

/**
 * Initialize fade-in animations for elements
 */
function initFadeInAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe all fade-in elements
  document.querySelectorAll('.fade-in').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(el);
  });
}

/**
 * Initialize smooth scroll behavior
 */
function initSmoothScroll() {
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);

      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/**
 * Initialize mobile menu toggle
 */
function initMobileMenu() {
  const toggle = document.querySelector('.navbar-toggle');
  const menu = document.querySelector('.navbar-menu');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    menu.classList.toggle('active');
  });

  // Close menu when clicking on a link
  const menuLinks = menu.querySelectorAll('.navbar-link');
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      menu.classList.remove('active');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      toggle.classList.remove('active');
      menu.classList.remove('active');
    }
  });
}

/**
 * Initialize all page interactions
 */
function initPageInteractions() {
  initFadeInAnimations();
  initSmoothScroll();
  initMobileMenu();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initPageInteractions);
