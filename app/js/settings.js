/**
 * Settings Page JavaScript
 * Handles theme and language preferences
 */

class SettingsManager {
  constructor() {
    this.initThemeButtons();
    this.initLanguageSelect();
  }

  /**
   * Initialize theme selection buttons
   */
  initThemeButtons() {
    const themeButtons = document.querySelectorAll('.theme-btn');
    const currentTheme = localStorage.getItem('theme') || 'light';

    // Set active button based on current theme
    themeButtons.forEach(btn => {
      if (btn.dataset.theme === currentTheme) {
        btn.classList.add('active');
      }

      btn.addEventListener('click', () => {
        const selectedTheme = btn.dataset.theme;

        // Update active state
        themeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Apply theme
        if (selectedTheme === 'dark') {
          document.body.classList.add('dark-mode');
          localStorage.setItem('theme', 'dark');
          if (window.themeToggle) {
            window.themeToggle.toggle.checked = true;
          }
        } else {
          document.body.classList.remove('dark-mode');
          localStorage.setItem('theme', 'light');
          if (window.themeToggle) {
            window.themeToggle.toggle.checked = false;
          }
        }
      });
    });
  }

  /**
   * Initialize language selection dropdown
   */
  initLanguageSelect() {
    const languageSelect = document.getElementById('language-select');
    const savedLanguage = localStorage.getItem('language') || 'en';

    // Set saved language
    languageSelect.value = savedLanguage;

    // Handle language change
    languageSelect.addEventListener('change', (e) => {
      const selectedLanguage = e.target.value;
      localStorage.setItem('language', selectedLanguage);

      // Show notification
      this.showNotification(`Language set to ${this.getLanguageName(selectedLanguage)}`);

      // In a real application, you would reload content in the selected language
      // For now, we just save the preference
    });
  }

  /**
   * Get language display name
   */
  getLanguageName(code) {
    const languages = {
      'en': 'English',
      'ko': '한국어',
      'ja': '日本語',
      'zh': '中文',
      'es': 'Español',
      'fr': 'Français'
    };
    return languages[code] || code;
  }

  /**
   * Show notification message
   */
  showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'settings-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--color-primary);
      color: white;
      padding: 1rem 2rem;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      z-index: 10001;
      animation: slideUp 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideDown 0.3s ease-out';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translate(-50%, 20px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }

  @keyframes slideDown {
    from {
      opacity: 1;
      transform: translate(-50%, 0);
    }
    to {
      opacity: 0;
      transform: translate(-50%, 20px);
    }
  }
`;
document.head.appendChild(style);

// Initialize settings when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
  });
} else {
  window.settingsManager = new SettingsManager();
}
