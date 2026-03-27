const axios = require('axios');
const logger = require('../src/utils/logger');

const TEST_URL = 'http://localhost:3000/webhook';

const testClientMessage = async () => {
  logger.info('--- Testing Client Message ---');
  try {
    const response = await axios.post(TEST_URL, {
      message: {
        from: '911234567890', // Client Number
        text: 'Bhai, Gaming Laptop ka rate kya hai aur mera 5 units ka quote banao'
      }
    });
    console.log('Server Response:', response.data);
  } catch (err) {
    console.error('Error:', err.message);
  }
};

const testOwnerApproval = async () => {
  logger.info('--- Testing Owner Approval ---');
  try {
    const response = await axios.post(TEST_URL, {
      message: {
        from: '919904843058', // Your owner number
        text: 'Yes, Approved!',
        context: { clientId: '911234567890' }
      }
    });
    console.log('Server Response:', response.data);
  } catch (err) {
    console.error('Error:', err.message);
  }
};

// Start tests
setTimeout(testClientMessage, 1000);
// setTimeout(testOwnerApproval, 5000); // Run this after client message triggers approval
