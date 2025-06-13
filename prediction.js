/**
 * House Price Prediction Model for Indian Real Estate
 * This script handles the price prediction based on user inputs
 */

// When the document is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load model coefficients
    fetch('./model_coefficients.json')
        .then(response => response.json())
        .then(data => {
            window.modelCoefficients = data;
            console.log('Model coefficients loaded successfully');
        })
        .catch(error => {
            console.error('Error loading model coefficients:', error);
            displayError('Failed to load prediction model. Please try again later.');
        });

    // Load city data for location-based calculations
    fetch('./city_data.json')
        .then(response => response.json())
        .then(data => {
            window.cityData = data;
            
            // Populate the city dropdown
            const citySelect = document.getElementById('city');
            if (citySelect) {
                data.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city.name;
                    option.textContent = city.name;
                    citySelect.appendChild(option);
                });
            }
        })
        .catch(error => {
            console.error('Error loading city data:', error);
            displayError('Failed to load city data. Please try again later.');
        });

    // Add event listener to the prediction form
    const predictionForm = document.getElementById('prediction-form');
    if (predictionForm) {
        predictionForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Validate form inputs
            if (!validateForm()) {
                return;
            }
            
            // Get form values
            const formData = {
                city: document.getElementById('city').value,
                area: parseFloat(document.getElementById('area').value),
                bedrooms: parseInt(document.getElementById('bedrooms').value),
                bathrooms: parseInt(document.getElementById('bathrooms').value),
                propertyAge: parseInt(document.getElementById('property-age').value),
                floorNumber: parseInt(document.getElementById('floor-number').value),
                totalFloors: parseInt(document.getElementById('total-floors').value),
                furnishing: document.getElementById('furnishing').value,
                amenities: getSelectedAmenities()
            };
            
            // Make prediction
            const predictedPrice = predictPrice(formData);
            
            // Display result
            displayPrediction(predictedPrice, formData);
            
            // Update visualization
            updateVisualization(formData, predictedPrice);
        });
    }
});

/**
 * Predicts the house price based on input parameters
 * @param {Object} data - The form data containing house details
 * @returns {number} - The predicted price in lakhs of rupees
 */
function predictPrice(data) {
    if (!window.modelCoefficients) {
        displayError('Prediction model not loaded. Please refresh the page.');
        return null;
    }
    
    // Get coefficients from loaded model
    const coef = window.modelCoefficients;
    
    // Get city factor from city data
    const cityFactor = getCityFactor(data.city);
    
    // Calculate price using a simple linear model
    let price = coef.intercept;
    
    // Add city factor
    price += cityFactor * coef.cityFactor;
    
    // Add area factor (per square foot)
    price += data.area * coef.areaCoefficient;
    
    // Add bedroom factor
    price += data.bedrooms * coef.bedroomCoefficient;
    
    // Add bathroom factor
    price += data.bathrooms * coef.bathroomCoefficient;
    
    // Adjust for property age (newer properties cost more)
    price += (10 - Math.min(data.propertyAge, 10)) * coef.ageCoefficient;
    
    // Add floor factors
    price += data.floorNumber * coef.floorNumberCoefficient;
    
    // Adjust for total floors in building
    price += data.totalFloors * coef.totalFloorsCoefficient;
    
    // Adjust for furnishing status
    if (data.furnishing === 'fully-furnished') {
        price += coef.fullyFurnishedBonus;
    } else if (data.furnishing === 'semi-furnished') {
        price += coef.semiFurnishedBonus;
    }
    
    // Add amenities bonus
    price += data.amenities.length * coef.amenityBonus;
    
    // Ensure price doesn't go below minimum threshold
    return Math.max(price, 5); // Minimum 5 lakhs
}

/**
 * Gets the city factor based on the selected city
 * @param {string} cityName - The name of the city
 * @returns {number} - The city factor for price calculation
 */
function getCityFactor(cityName) {
    if (!window.cityData) return 1.0;
    
    const city = window.cityData.find(c => c.name === cityName);
    return city ? city.priceFactor : 1.0;
}

/**
 * Gets the selected amenities from checkboxes
 * @returns {Array} - Array of selected amenities
 */
function getSelectedAmenities() {
    const checkboxes = document.querySelectorAll('input[name="amenities"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

/**
 * Displays the prediction result on the page
 * @param {number} price - The predicted price in lakhs
 * @param {Object} data - The input data used for prediction
 */
function displayPrediction(price, data) {
    const resultContainer = document.getElementById('prediction-result');
    
    if (!resultContainer || price === null) return;
    
    // Format the price with commas for Indian numbering system (lakhs)
    const formattedPrice = price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    
    // Create the result HTML
    resultContainer.innerHTML = `
        <div class="alert alert-success mt-4">
            <h4 class="alert-heading">Estimated Price: ₹ ${formattedPrice} Lakhs</h4>
            <p>Based on your inputs for a ${data.area} sq.ft. ${data.bedrooms} BHK property in ${data.city}.</p>
            <hr>
            <p class="mb-0">This estimate is based on current market trends and similar properties in the area.</p>
        </div>
    `;
    
    // Scroll to result
    resultContainer.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Displays an error message
 * @param {string} message - The error message to display
 */
function displayError(message) {
    const resultContainer = document.getElementById('prediction-result');
    
    if (!resultContainer) return;
    
    resultContainer.innerHTML = `
        <div class="alert alert-danger mt-4">
            <h4 class="alert-heading">Error</h4>
            <p>${message}</p>
        </div>
    `;
}