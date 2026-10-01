/**
 * Professional Alert System
 * Replaces basic browser alerts with beautiful, modern notifications
 */

class ProfessionalAlerts {
    constructor() {
        this.container = null;
        this.alerts = new Map();
        this.alertCounter = 0;
        this.init();
    }

    init() {
        // Wait for DOM to be ready before creating container
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.createContainer());
        } else {
            this.createContainer();
        }
    }

    createContainer() {
        // Create alert container if it doesn't exist
        if (!document.getElementById('alert-container')) {
            this.container = document.createElement('div');
            this.container.id = 'alert-container';
            this.container.className = 'alert-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('alert-container');
        }
    }

    /**
     * Show a success alert
     */
    success(message, title = 'Success', options = {}) {
        return this.showAlert('success', message, title, options);
    }

    /**
     * Show an error alert
     */
    error(message, title = 'Error', options = {}) {
        return this.showAlert('error', message, title, options);
    }

    /**
     * Show a warning alert
     */
    warning(message, title = 'Warning', options = {}) {
        return this.showAlert('warning', message, title, options);
    }

    /**
     * Show an info alert
     */
    info(message, title = 'Information', options = {}) {
        return this.showAlert('info', message, title, options);
    }

    /**
     * Show a loading alert
     */
    loading(message, title = 'Loading', options = {}) {
        return this.showAlert('loading', message, title, options);
    }

    /**
     * Show a confirmation dialog
     */
    confirm(message, title = 'Confirm', options = {}) {
        return new Promise((resolve) => {
            const alertId = this.showAlert('info', message, title, {
                ...options,
                showActions: true,
                confirmText: options.confirmText || 'Confirm',
                cancelText: options.cancelText || 'Cancel',
                onConfirm: () => {
                    this.hide(alertId);
                    resolve(true);
                },
                onCancel: () => {
                    this.hide(alertId);
                    resolve(false);
                }
            });
        });
    }

    /**
     * Show a toast notification
     */
    toast(message, type = 'info', duration = 3000) {
        return this.showAlert(type, message, '', {
            toast: true,
            duration: duration,
            showClose: true
        });
    }

    /**
     * Main method to show alerts
     */
    showAlert(type, message, title, options = {}) {
        const alertId = `alert-${++this.alertCounter}`;
        const {
            duration = 5000,
            showClose = true,
            showActions = false,
            confirmText = 'OK',
            cancelText = 'Cancel',
            onConfirm = null,
            onCancel = null,
            toast = false,
            persistent = false,
            showProgress = true
        } = options;

        // Create alert element
        const alert = document.createElement('div');
        alert.id = alertId;
        alert.className = `professional-alert alert-${type} ${toast ? 'alert-toast' : ''}`;

        // Set up content
        const icon = this.getIcon(type);
        const closeButton = showClose ? this.createCloseButton(alertId) : '';
        const actions = showActions ? this.createActions(confirmText, cancelText, onConfirm, onCancel) : '';
        const progress = showProgress && !persistent ? '<div class="alert-progress"></div>' : '';

        alert.innerHTML = `
            <div class="alert-header">
                <div class="alert-icon">${icon}</div>
                <h3 class="alert-title">${title}</h3>
                ${closeButton}
            </div>
            <div class="alert-body">${message}</div>
            ${actions}
            ${progress}
        `;

        // Add to container
        this.container.appendChild(alert);
        this.alerts.set(alertId, alert);

        // Trigger animation
        setTimeout(() => {
            alert.classList.add('show');
        }, 10);

        // Auto-hide if not persistent
        if (!persistent && duration > 0) {
            setTimeout(() => {
                this.hide(alertId);
            }, duration);
        }

        return alertId;
    }

    /**
     * Hide an alert
     */
    hide(alertId) {
        const alert = this.alerts.get(alertId);
        if (alert) {
            alert.classList.add('hide');
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.parentNode.removeChild(alert);
                }
                this.alerts.delete(alertId);
            }, 300);
        }
    }

    /**
     * Hide all alerts
     */
    hideAll() {
        this.alerts.forEach((alert, alertId) => {
            this.hide(alertId);
        });
    }

    /**
     * Get icon for alert type
     */
    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ',
            loading: '⟳'
        };
        return icons[type] || icons.info;
    }

    /**
     * Create close button
     */
    createCloseButton(alertId) {
        return `<button class="alert-close" onclick="window.professionalAlerts.hide('${alertId}')" aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>`;
    }

    /**
     * Create action buttons
     */
    createActions(confirmText, cancelText, onConfirm, onCancel) {
        return `
            <div class="alert-actions">
                <button class="alert-btn alert-btn-secondary" onclick="window.professionalAlerts.handleCancel('${this.alertCounter}', ${onCancel ? 'true' : 'false'})">
                    ${cancelText}
                </button>
                <button class="alert-btn alert-btn-primary" onclick="window.professionalAlerts.handleConfirm('${this.alertCounter}', ${onConfirm ? 'true' : 'false'})">
                    ${confirmText}
                </button>
            </div>
        `;
    }

    /**
     * Handle confirm action
     */
    handleConfirm(alertId, hasCallback) {
        if (hasCallback) {
            // This would need to be implemented with proper callback handling
            console.log('Confirm clicked for alert:', alertId);
        }
        this.hide(`alert-${alertId}`);
    }

    /**
     * Handle cancel action
     */
    handleCancel(alertId, hasCallback) {
        if (hasCallback) {
            // This would need to be implemented with proper callback handling
            console.log('Cancel clicked for alert:', alertId);
        }
        this.hide(`alert-${alertId}`);
    }

    /**
     * Update existing alert
     */
    update(alertId, message, title = null) {
        const alert = this.alerts.get(alertId);
        if (alert) {
            const body = alert.querySelector('.alert-body');
            if (body) {
                body.textContent = message;
            }
            if (title) {
                const titleEl = alert.querySelector('.alert-title');
                if (titleEl) {
                    titleEl.textContent = title;
                }
            }
        }
    }
}

// Initialize global alert system
window.professionalAlerts = new ProfessionalAlerts();

// Convenience functions
window.showSuccess = (message, title, options) => window.professionalAlerts.success(message, title, options);
window.showError = (message, title, options) => window.professionalAlerts.error(message, title, options);
window.showWarning = (message, title, options) => window.professionalAlerts.warning(message, title, options);
window.showInfo = (message, title, options) => window.professionalAlerts.info(message, title, options);
window.showLoading = (message, title, options) => window.professionalAlerts.loading(message, title, options);
window.showConfirm = (message, title, options) => window.professionalAlerts.confirm(message, title, options);
window.showToast = (message, type, duration) => window.professionalAlerts.toast(message, type, duration);

// Replace native alert functions
window.alert = (message) => {
    window.professionalAlerts.info(message, 'Alert');
};

window.confirm = (message) => {
    return window.professionalAlerts.confirm(message, 'Confirm');
};

// Enhanced alert functions for common use cases
window.showFormError = (message) => {
    window.professionalAlerts.error(message, 'Form Error', {
        duration: 4000,
        showClose: true
    });
};

window.showFormSuccess = (message) => {
    window.professionalAlerts.success(message, 'Success', {
        duration: 3000,
        showClose: true
    });
};

window.showNetworkError = (message = 'Network error. Please check your connection and try again.') => {
    window.professionalAlerts.error(message, 'Connection Error', {
        duration: 6000,
        showClose: true
    });
};

window.showValidationError = (message) => {
    window.professionalAlerts.warning(message, 'Validation Error', {
        duration: 4000,
        showClose: true
    });
};

window.showLocationError = (message) => {
    window.professionalAlerts.warning(message, 'Location Error', {
        duration: 5000,
        showClose: true
    });
};

window.showLocationSuccess = (message) => {
    window.professionalAlerts.success(message, 'Location Found', {
        duration: 3000,
        showClose: true
    });
};

// Toast notifications for quick feedback
window.showQuickSuccess = (message) => {
    window.professionalAlerts.toast(message, 'success', 2000);
};

window.showQuickError = (message) => {
    window.professionalAlerts.toast(message, 'error', 3000);
};

window.showQuickInfo = (message) => {
    window.professionalAlerts.toast(message, 'info', 2500);
};

// Loading states
window.showLoadingState = (message = 'Processing...') => {
    return window.professionalAlerts.loading(message, 'Please Wait', {
        persistent: true,
        showClose: false
    });
};

window.hideLoadingState = (alertId) => {
    if (alertId) {
        window.professionalAlerts.hide(alertId);
    }
};

// Confirmation dialogs
window.showDeleteConfirm = (itemName = 'this item') => {
    return window.professionalAlerts.confirm(
        `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
        'Delete Confirmation',
        {
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'error'
        }
    );
};

window.showSaveConfirm = (message = 'Do you want to save your changes?') => {
    return window.professionalAlerts.confirm(
        message,
        'Save Changes',
        {
            confirmText: 'Save',
            cancelText: 'Cancel'
        }
    );
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function () {
    // Add CSS if not already added
    if (!document.getElementById('professional-alerts-css')) {
        const link = document.createElement('link');
        link.id = 'professional-alerts-css';
        link.rel = 'stylesheet';
        link.href = '/css/professional-alerts.css';
        document.head.appendChild(link);
    }
});

console.log('Professional Alerts System Loaded');
