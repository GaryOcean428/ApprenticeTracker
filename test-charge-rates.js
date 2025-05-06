// Test script for charge rate calculation API
import axios from 'axios';

async function testChargeRateAPI() {
  try {
    console.log('Testing Charge Rate Calculation API');
    
    // 1. Calculate charge rate for an apprentice
    const calculateResponse = await axios.post('http://localhost:5000/api/payroll/test/charge-rates/calculate', {
      apprenticeId: 1,  // Replace with an existing apprentice ID
      hostEmployerId: 913  // Using a host employer ID from the latest seeding
    });
    
    console.log('\nCharge Rate Calculation Result:');
    console.log(JSON.stringify(calculateResponse.data, null, 2));
    
    // 2. Generate a quote for a host employer
    const quoteResponse = await axios.post('http://localhost:5000/api/payroll/test/quotes/generate', {
      hostEmployerId: 913,  // Using a host employer ID from the latest seeding
      apprenticeIds: [1, 2]  // Replace with existing apprentice IDs
    });
    
    console.log('\nQuote Generation Result:');
    console.log(JSON.stringify(quoteResponse.data, null, 2));
    
    // 3. Get quote details if we have a quote ID
    if (quoteResponse.data.success && quoteResponse.data.data.quoteId) {
      const quoteId = quoteResponse.data.data.quoteId;
      
      const quoteDetailsResponse = await axios.get(`http://localhost:5000/api/payroll/quotes/${quoteId}`);
      
      console.log('\nQuote Details:');
      console.log(JSON.stringify(quoteDetailsResponse.data, null, 2));
    }
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error testing charge rate API:', error.response ? error.response.data : error.message);
  }
}

testChargeRateAPI();
