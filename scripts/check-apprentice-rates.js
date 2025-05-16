// Simple script to check the apprentice rates API response
const awardCode = 'MA000025'; // Electrical Award
const year = 2025;
const apprenticeYear = 2;
const isAdult = false;
const hasCompletedYear12 = false;

// Make API request to check rates
fetch(`/api/fairwork-enhanced/apprentice-rates?awardCode=${awardCode}&year=${year}&apprenticeYear=${apprenticeYear}&isAdult=${isAdult}&hasCompletedYear12=${hasCompletedYear12}`)
  .then(response => response.json())
  .then(data => {
    console.log('API Response:', JSON.stringify(data, null, 2));
    if (data.success && data.data) {
      console.log('\nBase Hourly Rate:', data.data.rates.baseHourly);
      console.log('Final Hourly Rate:', data.data.rates.hourly);
      console.log('Parameters:', data.data.parameters);
    }
  })
  .catch(error => {
    console.error('Error fetching rates:', error);
  });