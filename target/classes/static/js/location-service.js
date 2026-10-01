/**
 * Location Service for BuildPro E-commerce
 * Handles geolocation and address auto-fill functionality
 */

class LocationService {
    constructor() {
        this.isLocationSupported = 'geolocation' in navigator;
        this.currentPosition = null;
    }

    /**
     * Get user's current location
     */
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!this.isLocationSupported) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }

            const options = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.currentPosition = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    resolve(this.currentPosition);
                },
                (error) => {
                    let errorMessage = 'Unable to get your location. ';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage += 'Please allow location access and try again.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage += 'Location information is unavailable.';
                            break;
                        case error.TIMEOUT:
                            errorMessage += 'Location request timed out.';
                            break;
                        default:
                            errorMessage += 'An unknown error occurred.';
                            break;
                    }
                    reject(new Error(errorMessage));
                },
                options
            );
        });
    }

    /**
     * Get address details from coordinates
     */
    async getAddressFromCoordinates(latitude, longitude) {
        try {
            const response = await fetch(`/api/location/address?latitude=${latitude}&longitude=${longitude}`);
            if (!response.ok) {
                throw new Error('Failed to get address details');
            }
            return await response.json();
        } catch (error) {
            console.error('Error getting address from coordinates:', error);
            throw error;
        }
    }

    /**
     * Auto-fill address form with current location
     */
    async fillAddressForm(formSelector, options = {}) {
        const {
            nameField = 'input[name="name"]',
            phoneField = 'input[name="phone"]',
            addressLine1Field = 'input[name="addressLine1"]',
            addressLine2Field = 'input[name="addressLine2"]',
            cityField = 'input[name="city"]',
            stateField = 'input[name="state"]',
            postalCodeField = 'input[name="postalCode"]',
            countryField = 'input[name="country"]',
            showLoader = true,
            onSuccess = null,
            onError = null
        } = options;

        const form = document.querySelector(formSelector);
        if (!form) {
            const error = new Error('Address form not found');
            if (onError) onError(error);
            return;
        }

        // Show loading state
        if (showLoader) {
            this.showLocationLoader(form);
        }

        try {
            // Get current location
            const position = await this.getCurrentLocation();
            
            // Get address details
            const addressDetails = await this.getAddressFromCoordinates(
                position.latitude, 
                position.longitude
            );

            // Fill form fields
            this.fillFormField(form, nameField, '');
            this.fillFormField(form, phoneField, '');
            this.fillFormField(form, addressLine1Field, addressDetails.addressLine1 || '');
            this.fillFormField(form, addressLine2Field, '');
            this.fillFormField(form, cityField, addressDetails.city || '');
            this.fillFormField(form, stateField, addressDetails.state || '');
            this.fillFormField(form, postalCodeField, addressDetails.postalCode || '');
            this.fillFormField(form, countryField, addressDetails.country || 'India');

            // Hide loading state
            this.hideLocationLoader(form);

            // Show success message
            this.showLocationSuccess('Address filled successfully from your current location!');

            if (onSuccess) {
                onSuccess({
                    position,
                    addressDetails
                });
            }

        } catch (error) {
            console.error('Error filling address form:', error);
            
            // Hide loading state
            this.hideLocationLoader(form);
            
            // Show error message
            this.showLocationError(error.message);

            if (onError) {
                onError(error);
            }
        }
    }

    /**
     * Create address from current location
     */
    async createAddressFromLocation(userId, name, phone) {
        try {
            const position = await this.getCurrentLocation();
            
            const response = await fetch(`/addresses/user/${userId}/from-location`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    latitude: position.latitude,
                    longitude: position.longitude,
                    name: name,
                    phone: phone
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create address from location');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating address from location:', error);
            throw error;
        }
    }

    /**
     * Fill form field with value
     */
    fillFormField(form, selector, value) {
        const field = form.querySelector(selector);
        if (field) {
            field.value = value;
            // Trigger change event
            field.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    /**
     * Show location loading state
     */
    showLocationLoader(form) {
        const loader = document.createElement('div');
        loader.id = 'location-loader';
        loader.className = 'location-loader';
        loader.innerHTML = `
            <div class="flex items-center justify-center p-4">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                <span class="text-blue-600 font-medium">Getting your location...</span>
            </div>
        `;
        
        // Insert after the form
        form.parentNode.insertBefore(loader, form.nextSibling);
    }

    /**
     * Hide location loading state
     */
    hideLocationLoader(form) {
        const loader = document.getElementById('location-loader');
        if (loader) {
            loader.remove();
        }
    }

    /**
     * Show location success message
     */
    showLocationSuccess(message) {
        if (window.showLocationSuccess) {
            window.showLocationSuccess(message);
        } else {
            this.showLocationMessage(message, 'success');
        }
    }

    /**
     * Show location error message
     */
    showLocationError(message) {
        if (window.showLocationError) {
            window.showLocationError(message);
        } else {
            this.showLocationMessage(message, 'error');
        }
    }

    /**
     * Show location message (fallback)
     */
    showLocationMessage(message, type) {
        // Remove existing message
        const existingMessage = document.getElementById('location-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.id = 'location-message';
        messageDiv.className = `location-message ${type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'} border px-4 py-3 rounded mb-4`;
        messageDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>
                <span>${message}</span>
            </div>
        `;

        // Insert at the top of the form container
        const formContainer = document.querySelector('.bg-white.rounded-lg.shadow');
        if (formContainer) {
            formContainer.insertBefore(messageDiv, formContainer.firstChild);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 5000);
        }
    }

    /**
     * Create "Use My Current Location" button
     */
    createLocationButton(options = {}) {
        const {
            text = 'Use My Current Location',
            icon = 'fas fa-map-marker-alt',
            className = 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center',
            onClick = null
        } = options;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = className;
        button.innerHTML = `
            <i class="${icon} mr-2"></i>
            ${text}
        `;

        if (onClick) {
            button.addEventListener('click', onClick);
        }

        return button;
    }
}

// Initialize global location service
window.locationService = new LocationService();

// Utility functions for easy integration
window.useCurrentLocation = function(formSelector, options = {}) {
    return window.locationService.fillAddressForm(formSelector, options);
};

window.createLocationButton = function(options = {}) {
    return window.locationService.createLocationButton(options);
};
