/**
 * Theme Toggle Module
 * Handles dark/light mode switching with localStorage persistence
 *
 * Features:
 * - Smooth theme transitions
 * - localStorage persistence
 * - Animated toggle button
 * - Navbar style updates based on theme
 */

class ThemeToggle {
  constructor() {
    this.toggle = document.getElementById('theme-toggle');
    this.body = document.body;
    this.navbar = document.querySelector('.navbar');

    // Initialize theme from localStorage
    this.init();

    // Add event listeners
    this.addEventListeners();
  }

  /**
   * Initialize theme from saved preference
   */
  init() {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
      this.enableDarkMode();
    } else {
      this.enableLightMode();
    }
  }

  /**
   * Add event listeners for theme toggle
   */
  addEventListeners() {
    if (!this.toggle) return;

    this.toggle.addEventListener('change', () => {
      if (this.toggle.checked) {
        this.enableDarkMode();
      } else {
        this.enableLightMode();
      }
    });

    // Update navbar style on scroll for both themes
    window.addEventListener('scroll', () => this.updateNavbarOnScroll());
  }

  /**
   * Enable dark mode
   */
  enableDarkMode() {
    this.body.classList.add('dark-mode');
    if (this.toggle) {
      this.toggle.checked = true;
    }
    localStorage.setItem('theme', 'dark');
    this.updateNavbarStyle();
  }

  /**
   * Enable light mode
   */
  enableLightMode() {
    this.body.classList.remove('dark-mode');
    if (this.toggle) {
      this.toggle.checked = false;
    }
    localStorage.setItem('theme', 'light');
    this.updateNavbarStyle();
  }

  /**
   * Update navbar style based on current theme
   */
  updateNavbarStyle() {
    if (!this.navbar) return;

    const isDark = this.body.classList.contains('dark-mode');
    const currentScroll = window.pageYOffset;

    if (isDark) {
      if (currentScroll <= 0) {
        this.navbar.style.background = 'rgba(16, 33, 34, 0.72)';
      } else {
        this.navbar.style.background = 'rgba(16, 33, 34, 0.85)';
      }
    } else {
      if (currentScroll <= 0) {
        this.navbar.style.background = 'rgba(255, 255, 255, 0.72)';
      } else {
        this.navbar.style.background = 'rgba(255, 255, 255, 0.82)';
      }
    }
  }

  /**
   * Update navbar on scroll
   */
  updateNavbarOnScroll() {
    this.updateNavbarStyle();
  }

  /**
   * Get current theme
   * @returns {string} 'dark' or 'light'
   */
  getCurrentTheme() {
    return this.body.classList.contains('dark-mode') ? 'dark' : 'light';
  }

  /**
   * Toggle theme programmatically
   */
  toggleTheme() {
    if (this.getCurrentTheme() === 'dark') {
      this.enableLightMode();
    } else {
      this.enableDarkMode();
    }
  }
}

// Initialize theme toggle when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.themeToggle = new ThemeToggle();
  });
} else {
  window.themeToggle = new ThemeToggle();
}
