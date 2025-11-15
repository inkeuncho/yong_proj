/**
 * Message Utilities - User Feedback System
 * Provides styled success, error, and info messages
 * Uses performance.css message styling
 */

class MessageUtils {
  /**
   * Show an error message
   * @param {string} message - The error message to display
   * @param {HTMLElement|string} container - Container element or selector
   * @param {number} duration - Auto-hide duration in ms (0 = no auto-hide)
   */
  static showError(message, container = 'body', duration = 0) {
    this._showMessage(message, 'error-message', container, duration);
  }

  /**
   * Show a success message
   * @param {string} message - The success message to display
   * @param {HTMLElement|string} container - Container element or selector
   * @param {number} duration - Auto-hide duration in ms (0 = no auto-hide)
   */
  static showSuccess(message, container = 'body', duration = 5000) {
    this._showMessage(message, 'success-message', container, duration);
  }

  /**
   * Show an info message
   * @param {string} message - The info message to display
   * @param {HTMLElement|string} container - Container element or selector
   * @param {number} duration - Auto-hide duration in ms (0 = no auto-hide)
   */
  static showInfo(message, container = 'body', duration = 5000) {
    this._showMessage(message, 'info-message', container, duration);
  }

  /**
   * Internal method to show a message with a specific class
   * @private
   */
  static _showMessage(message, className, container, duration) {
    // Get container element
    const containerEl = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!containerEl) {
      console.error('Message container not found');
      return null;
    }

    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = className;
    messageEl.setAttribute('role', 'alert');
    messageEl.setAttribute('aria-live', 'polite');

    // Add icon based on message type
    const icon = this._getIcon(className);

    messageEl.innerHTML = `
      <span style="font-size: 1.25rem;">${icon}</span>
      <span>${message}</span>
      <button onclick="this.parentElement.remove()"
              style="margin-left: auto; background: none; border: none; cursor: pointer; padding: 0.25rem; opacity: 0.7; color: inherit;"
              aria-label="Close message">
        ✕
      </button>
    `;

    // Append to container
    containerEl.appendChild(messageEl);

    // Auto-hide if duration specified
    if (duration > 0) {
      setTimeout(() => {
        this._fadeOutAndRemove(messageEl);
      }, duration);
    }

    return messageEl;
  }

  /**
   * Get icon based on message type
   * @private
   */
  static _getIcon(className) {
    const icons = {
      'error-message': '⚠️',
      'success-message': '✅',
      'info-message': 'ℹ️'
    };
    return icons[className] || 'ℹ️';
  }

  /**
   * Fade out and remove an element
   * @private
   */
  static _fadeOutAndRemove(element) {
    if (!element) return;

    element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    element.style.opacity = '0';
    element.style.transform = 'translateY(-10px)';

    setTimeout(() => {
      element.remove();
    }, 300);
  }

  /**
   * Clear all messages from a container
   * @param {HTMLElement|string} container - Container element or selector
   */
  static clearMessages(container = 'body') {
    const containerEl = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!containerEl) return;

    const messages = containerEl.querySelectorAll('.error-message, .success-message, .info-message');
    messages.forEach(msg => this._fadeOutAndRemove(msg));
  }

  /**
   * Show a loading overlay on an element
   * @param {HTMLElement|string} target - Target element or selector
   * @param {string} message - Loading message
   */
  static showLoading(target = 'body', message = 'Loading...') {
    const targetEl = typeof target === 'string'
      ? document.querySelector(target)
      : target;

    if (!targetEl) return null;

    // Remove existing loading overlay
    const existing = targetEl.querySelector('.loading-overlay');
    if (existing) existing.remove();

    // Create loading overlay
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      z-index: 9999;
      backdrop-filter: blur(4px);
    `;

    overlay.innerHTML = `
      <div class="spinner"></div>
      <p style="color: white; font-size: 1rem; font-weight: 500;">${message}</p>
    `;

    // Make target relative if not already positioned
    if (getComputedStyle(targetEl).position === 'static') {
      targetEl.style.position = 'relative';
    }

    targetEl.appendChild(overlay);
    return overlay;
  }

  /**
   * Hide loading overlay
   * @param {HTMLElement|string} target - Target element or selector
   */
  static hideLoading(target = 'body') {
    const targetEl = typeof target === 'string'
      ? document.querySelector(target)
      : target;

    if (!targetEl) return;

    const overlay = targetEl.querySelector('.loading-overlay');
    if (overlay) {
      this._fadeOutAndRemove(overlay);
    }
  }

  /**
   * Show a confirmation dialog (replaces window.confirm)
   * Returns a Promise that resolves to true/false
   * @param {string} message - Confirmation message
   * @param {string} confirmText - Text for confirm button
   * @param {string} cancelText - Text for cancel button
   */
  static async confirm(message, confirmText = 'Confirm', cancelText = 'Cancel') {
    return new Promise((resolve) => {
      // Create modal overlay
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(4px);
      `;

      // Create dialog
      const dialog = document.createElement('div');
      dialog.style.cssText = `
        background: var(--color-bg, white);
        color: var(--color-text, black);
        padding: 2rem;
        border-radius: 12px;
        max-width: 400px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: smooth-appear 0.3s ease;
      `;

      dialog.innerHTML = `
        <p style="margin: 0 0 1.5rem 0; font-size: 1rem; line-height: 1.5;">${message}</p>
        <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
          <button id="dialog-cancel"
                  style="padding: 0.5rem 1.5rem; border-radius: 6px; border: 1px solid rgba(0,0,0,0.2); background: transparent; cursor: pointer; font-weight: 500;">
            ${cancelText}
          </button>
          <button id="dialog-confirm"
                  style="padding: 0.5rem 1.5rem; border-radius: 6px; border: none; background: var(--color-primary, #25e2f4); color: #000; cursor: pointer; font-weight: 600;">
            ${confirmText}
          </button>
        </div>
      `;

      overlay.appendChild(dialog);
      document.body.appendChild(overlay);

      // Handle button clicks
      const handleResponse = (confirmed) => {
        this._fadeOutAndRemove(overlay);
        resolve(confirmed);
      };

      document.getElementById('dialog-confirm').onclick = () => handleResponse(true);
      document.getElementById('dialog-cancel').onclick = () => handleResponse(false);
      overlay.onclick = (e) => {
        if (e.target === overlay) handleResponse(false);
      };

      // ESC key to cancel
      const escHandler = (e) => {
        if (e.key === 'Escape') {
          document.removeEventListener('keydown', escHandler);
          handleResponse(false);
        }
      };
      document.addEventListener('keydown', escHandler);
    });
  }
}

// Make available globally
window.MessageUtils = MessageUtils;
