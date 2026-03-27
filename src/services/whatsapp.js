const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Send a WhatsApp Message via 11za API
 */
const sendMessage = async (to, text) => {
  try {
    if (!config.elevenZaApiKey) {
      logger.warn('11za API Key missing. Skipping real message send.');
      return;
    }

    logger.info({ to, textLength: text.length }, 'Sending message via 11za');

    // Official 11za Send API (Based on standard docs)
    const url = 'https://api.11za.in/apis/text/sendText';
    const response = await axios.post(url, {
      number: to,
      message: text
    }, {
      headers: {
        'api-key': config.elevenZaApiKey,
        'Content-Type': 'application/json'
      }
    });

    logger.info({ status: response.status, data: response.data }, '11za Send response');
    return response.data;
  } catch (error) {
    logger.error(error.response?.data || error.message, 'Failed to send WhatsApp message');
  }
};

module.exports = {
  sendMessage,
};
