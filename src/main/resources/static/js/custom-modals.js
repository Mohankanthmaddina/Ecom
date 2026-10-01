/**
 * Custom Modal System for BuildPro E-commerce
 * Beautiful, professional modals with animations
 * Fully responsive for all devices
 */

// Initialize modals on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeModals();
});

function initializeModals() {
    // Check if modals already exist
    if (!document.getElementById('customAlertModal')) {
        createModalElements();
    }
}

function createModalElements() {
    // Create modal container
    const modalHTML = `
        <!-- Custom Alert Modal -->
        <div id="customAlertModal" class="custom-modal">
            <div class="modal-content alert-modal">
                <div class="modal-header" id="alertModalHeader">
                    <div class="modal-icon" id="alertIcon">ℹ️</div>
                    <h2 class="modal-title" id="alertTitle">Alert</h2>
                </div>
                <div class="modal-body">
                    <div class="modal-message" id="alertMessage">
                        This is an alert message.
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn modal-btn-ok" onclick="closeAlert()" style="width: 100%;">
                        <i class="fas fa-check mr-2"></i>OK
                    </button>
                </div>
            </div>
        </div>

        <!-- Custom Confirm Modal -->
        <div id="customConfirmModal" class="custom-modal">
            <div class="modal-content confirm-modal">
                <div class="modal-header" id="confirmModalHeader">
                    <div class="modal-icon" id="confirmIcon">❓</div>
                    <h2 class="modal-title" id="confirmTitle">Confirm</h2>
                </div>
                <div class="modal-body">
                    <div class="modal-message" id="confirmMessage">
                        Are you sure?
                    </div>
                    <div id="confirmDetails" class="confirm-details"></div>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn modal-btn-cancel" onclick="closeConfirm(false)">
                        <i class="fas fa-times mr-2"></i>Cancel
                    </button>
                    <button class="modal-btn modal-btn-confirm" onclick="closeConfirm(true)">
                        <i class="fas fa-check mr-2"></i>Confirm
                    </button>
                </div>
            </div>
        </div>

        <!-- Custom Loading Modal -->
        <div id="customLoadingModal" class="custom-modal">
            <div class="modal-content loading-modal">
                <div class="modal-body" style="text-align: center; padding: 40px;">
                    <div class="loading-spinner"></div>
                    <div class="modal-message" id="loadingMessage" style="margin-top: 20px;">
                        Processing...
                    </div>
                </div>
            </div>
        </div>
    `;

    // Append to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Alert Modal Functions
let alertCallback = null;

function showAlert(message, title = 'Alert', icon = '⚠️', type = 'info') {
    const modal = document.getElementById('customAlertModal');
    const header = document.getElementById('alertModalHeader');
    
    // Set theme based on type
    const themes = {
        success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        info: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    };
    
    header.style.background = themes[type] || themes.info;
    
    document.getElementById('alertIcon').textContent = icon;
    document.getElementById('alertTitle').textContent = title;
    document.getElementById('alertMessage').textContent = message;
    
    modal.classList.add('active');
    
    // Auto-close on backdrop click
    modal.onclick = function(e) {
        if (e.target === modal) {
            closeAlert();
        }
    };

    return new Promise((resolve) => {
        alertCallback = resolve;
    });
}

function closeAlert() {
    const modal = document.getElementById('customAlertModal');
    modal.classList.remove('active');
    if (alertCallback) {
        alertCallback(true);
        alertCallback = null;
    }
}

// Confirm Modal Functions
let confirmCallback = null;

function showConfirm(message, title = 'Confirm', icon = '❓', details = null) {
    const modal = document.getElementById('customConfirmModal');
    
    document.getElementById('confirmIcon').textContent = icon;
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    
    // Add details if provided
    const detailsContainer = document.getElementById('confirmDetails');
    if (details) {
        let detailsHTML = '<div class="modal-details-list">';
        for (const [key, value] of Object.entries(details)) {
            detailsHTML += `
                <div class="modal-info-row">
                    <span class="modal-info-label">${key}</span>
                    <span class="modal-info-value">${value}</span>
                </div>
            `;
        }
        detailsHTML += '</div>';
        detailsContainer.innerHTML = detailsHTML;
        detailsContainer.style.display = 'block';
    } else {
        detailsContainer.innerHTML = '';
        detailsContainer.style.display = 'none';
    }
    
    modal.classList.add('active');
    
    // Close on backdrop click (cancel)
    modal.onclick = function(e) {
        if (e.target === modal) {
            closeConfirm(false);
        }
    };

    return new Promise((resolve) => {
        confirmCallback = resolve;
    });
}

function closeConfirm(result) {
    const modal = document.getElementById('customConfirmModal');
    modal.classList.remove('active');
    if (confirmCallback) {
        confirmCallback(result);
        confirmCallback = null;
    }
}

// Loading Modal Functions
function showLoading(message = 'Processing...') {
    const modal = document.getElementById('customLoadingModal');
    document.getElementById('loadingMessage').textContent = message;
    modal.classList.add('active');
}

function hideLoading() {
    const modal = document.getElementById('customLoadingModal');
    modal.classList.remove('active');
}

// Success notification (auto-dismiss)
function showSuccess(message, duration = 3000) {
    showAlert(message, 'Success', '✅', 'success');
    setTimeout(() => {
        closeAlert();
    }, duration);
}

// Error notification (auto-dismiss)
function showError(message, duration = 3000) {
    showAlert(message, 'Error', '❌', 'error');
    setTimeout(() => {
        closeAlert();
    }, duration);
}

// Warning notification
function showWarning(message, title = 'Warning') {
    return showAlert(message, title, '⚠️', 'warning');
}

// Info notification
function showInfo(message, title = 'Information') {
    return showAlert(message, title, 'ℹ️', 'info');
}

// Toast notification (corner notification)
function showToast(message, type = 'info', duration = 3000) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };

    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        border-left: 4px solid ${colors[type]};
        max-width: 350px;
    `;

    toast.innerHTML = `
        <span style="font-size: 24px;">${icons[type]}</span>
        <span style="color: #1f2937; font-weight: 500;">${message}</span>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}

// Keyboard support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Close any open modal
        closeAlert();
        closeConfirm(false);
        hideLoading();
    }
});

// Add animations CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

