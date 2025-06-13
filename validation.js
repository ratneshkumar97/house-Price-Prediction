/**
 * Form validation for the house price prediction inputs
 */

/**
 * Validates the prediction form inputs
 * @returns {boolean} - True if all inputs are valid, false otherwise
 */
function validateForm() {
    let isValid = true;
    
    // Clear previous error messages
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(elem => elem.remove());
    
    // Validate city
    const city = document.getElementById('city');
    if (!city.value) {
        displayFieldError(city, 'Please select a city');
        isValid = false;
    }
    
    // Validate area
    const area = document.getElementById('area');
    if (!area.value || isNaN(area.value) || area.value <= 0) {
        displayFieldError(area, 'Please enter a valid area (greater than 0)');
        isValid = false;
    } else if (area.value > 10000) {
        displayFieldError(area, 'Area seems too large. Please verify your input');
        isValid = false;
    }
    
    // Validate bedrooms
    const bedrooms = document.getElementById('bedrooms');
    if (!bedrooms.value || isNaN(bedrooms.value) || bedrooms.value < 1) {
        displayFieldError(bedrooms, 'Please enter at least 1 bedroom');
        isValid = false;
    } else if (bedrooms.value > 10) {
        displayFieldError(bedrooms, 'Number of bedrooms seems high. Please verify');
        isValid = false;
    }
    
    // Validate bathrooms
    const bathrooms = document.getElementById('bathrooms');
    if (!bathrooms.value || isNaN(bathrooms.value) || bathrooms.value < 1) {
        displayFieldError(bathrooms, 'Please enter at least 1 bathroom');
        isValid = false;
    } else if (bathrooms.value > 10) {
        displayFieldError(bathrooms, 'Number of bathrooms seems high. Please verify');
        isValid = false;
    }
    
    // Validate property age
    const propertyAge = document.getElementById('property-age');
    if (!propertyAge.value || isNaN(propertyAge.value) || propertyAge.value < 0) {
        displayFieldError(propertyAge, 'Please enter a valid property age (0 for new construction)');
        isValid = false;
    } else if (propertyAge.value > 100) {
        displayFieldError(propertyAge, 'Property age seems high. Please verify');
        isValid = false;
    }
    
    // Validate floor number
    const floorNumber = document.getElementById('floor-number');
    if (!floorNumber.value || isNaN(floorNumber.value) || floorNumber.value < 0) {
        displayFieldError(floorNumber, 'Please enter a valid floor number (0 for ground floor)');
        isValid = false;
    }
    
    // Validate total floors
    const totalFloors = document.getElementById('total-floors');
    if (!totalFloors.value || isNaN(totalFloors.value) || totalFloors.value < 1) {
        displayFieldError(totalFloors, 'Please enter at least 1 total floor');
        isValid = false;
    }
    
    // Validate floor logic (floor number cannot exceed total floors)
    if (parseInt(floorNumber.value) > parseInt(totalFloors.value)) {
        displayFieldError(floorNumber, 'Floor number cannot exceed total floors');
        isValid = false;
    }
    
    // Validate furnishing
    const furnishing = document.getElementById('furnishing');
    if (!furnishing.value) {
        displayFieldError(furnishing, 'Please select furnishing status');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Displays an error message for a form field
 * @param {HTMLElement} field - The form field with an error
 * @param {string} message - The error message to display
 */
function displayFieldError(field, message) {
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message text-danger mt-1';
    errorDiv.textContent = message;
    
    // Add error class to the input
    field.classList.add('is-invalid');
    
    // Insert error message after the field
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
    
    // Add event listener to clear error when field is changed
    field.addEventListener('input', function() {
        this.classList.remove('is-invalid');
        const errorMsg = this.parentNode.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
    }, { once: true });
}