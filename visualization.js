/**
 * Data visualization for the house price prediction system
 */

// Chart objects
let priceComparisonChart = null;
let priceFactorsChart = null;

// Initialize charts when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize empty charts
    initializeCharts();

    // Add event listener to the reset button
    const resetButton = document.getElementById('reset-form');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            // Reset the form
            document.getElementById('prediction-form').reset();
            
            // Clear the prediction result
            document.getElementById('prediction-result').innerHTML = '';
            
            // Reset charts
            resetCharts();
        });
    }
});

/**
 * Initialize empty charts
 */
function initializeCharts() {
    // Price comparison chart
    const comparisonCtx = document.getElementById('price-comparison-chart');
    if (comparisonCtx) {
        priceComparisonChart = new Chart(comparisonCtx, {
            type: 'bar',
            data: {
                labels: ['Your Property', 'City Average'],
                datasets: [{
                    label: 'Price (Lakhs ₹)',
                    data: [0, 0],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 99, 132, 0.6)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Price Comparison (in Lakhs ₹)',
                        color: '#ffffff'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    // Price factors chart
    const factorsCtx = document.getElementById('price-factors-chart');
    if (factorsCtx) {
        priceFactorsChart = new Chart(factorsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Location', 'Area', 'Bedrooms', 'Bathrooms', 'Age', 'Floor', 'Furnishing', 'Amenities'],
                datasets: [{
                    data: [0, 0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                        'rgba(199, 199, 199, 0.6)',
                        'rgba(83, 102, 255, 0.6)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(199, 199, 199, 1)',
                        'rgba(83, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Price Contribution Factors',
                        color: '#ffffff'
                    },
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#ffffff'
                        }
                    }
                }
            }
        });
    }
}

/**
 * Updates the visualization based on prediction results
 * @param {Object} formData - The form data used for prediction
 * @param {number} predictedPrice - The predicted price
 */
function updateVisualization(formData, predictedPrice) {
    if (!window.cityData || !window.modelCoefficients) return;
    
    // Show the visualization container
    const visualizationContainer = document.getElementById('visualization-container');
    if (visualizationContainer) {
        visualizationContainer.style.display = 'block';
    }

    // Get city average price
    const city = window.cityData.find(c => c.name === formData.city);
    const cityAverage = city ? city.averagePrice : 50; // Default 50 lakhs if not found

    // Update price comparison chart
    if (priceComparisonChart) {
        priceComparisonChart.data.datasets[0].data = [predictedPrice, cityAverage];
        priceComparisonChart.update();
    }

    // Calculate price factors
    if (priceFactorsChart && window.modelCoefficients) {
        const coef = window.modelCoefficients;
        const cityFactor = getCityFactor(formData.city);
        
        // Calculate contribution of each factor
        const locationContribution = cityFactor * coef.cityFactor;
        const areaContribution = formData.area * coef.areaCoefficient;
        const bedroomsContribution = formData.bedrooms * coef.bedroomCoefficient;
        const bathroomsContribution = formData.bathrooms * coef.bathroomCoefficient;
        const ageContribution = (10 - Math.min(formData.propertyAge, 10)) * coef.ageCoefficient;
        
        const floorContribution = 
            (formData.floorNumber * coef.floorNumberCoefficient) + 
            (formData.totalFloors * coef.totalFloorsCoefficient);
        
        let furnishingContribution = 0;
        if (formData.furnishing === 'fully-furnished') {
            furnishingContribution = coef.fullyFurnishedBonus;
        } else if (formData.furnishing === 'semi-furnished') {
            furnishingContribution = coef.semiFurnishedBonus;
        }
        
        const amenitiesContribution = formData.amenities.length * coef.amenityBonus;
        
        // Make sure all contributions are positive for the chart
        const contributions = [
            Math.abs(locationContribution),
            Math.abs(areaContribution),
            Math.abs(bedroomsContribution),
            Math.abs(bathroomsContribution),
            Math.abs(ageContribution),
            Math.abs(floorContribution),
            Math.abs(furnishingContribution),
            Math.abs(amenitiesContribution)
        ];
        
        // Update chart
        priceFactorsChart.data.datasets[0].data = contributions;
        priceFactorsChart.update();
    }
}

/**
 * Resets the charts to their initial state
 */
function resetCharts() {
    if (priceComparisonChart) {
        priceComparisonChart.data.datasets[0].data = [0, 0];
        priceComparisonChart.update();
    }
    
    if (priceFactorsChart) {
        priceFactorsChart.data.datasets[0].data = [0, 0, 0, 0, 0, 0, 0, 0];
        priceFactorsChart.update();
    }
    
    // Hide the visualization container
    const visualizationContainer = document.getElementById('visualization-container');
    if (visualizationContainer) {
        visualizationContainer.style.display = 'none';
    }
}
