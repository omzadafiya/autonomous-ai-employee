const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// POST /webhook
// Incoming messages from 11za
router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    logger.info({ payload }, 'Received webhook payload');

    // 1. Acknowledge receipt immediately (Standard for Webhooks)
    res.status(200).send('EVENT_RECEIVED');

    // 2. Process message asynchronously
    const gemini = require('../services/gemini');
    const memory = require('../services/redis');
    
    // Extract message text and sender ID (Assuming 11za format as seen in logs)
    const text = payload.content?.text || payload.message?.text || payload.text;
    const sender = payload.from || payload.message?.from || 'unknown_user';
    
    logger.info({ text, sender }, 'Extracted message details');
    if (!text) return;

    // --- OWNER APPROVAL LOGIC ---
    const config = require('../config');
    if (sender === config.ownerNumber) {
      // Find the client we are approving for
      // For simplicity, we check if there's any pending action (In real life, use a map or ID)
      const clientId = payload.message?.context?.clientId || 'testing_client'; 
      const pending = await memory.getPendingAction(clientId);
      
      if (pending) {
        if (text.toLowerCase().includes('yes') || text.toLowerCase().includes('approve')) {
          logger.info({ clientId }, 'Owner APPROVED action');
          // Resume flow: feed "Owner Approved" back to Gemini for that client
          // In a real system, you'd trigger a background job here
          await memory.clearPendingAction(clientId);
          logger.info({ to: clientId, responseBody: 'The owner has approved your request! Proceeding...' }, 'Notifying client of approval');
        } else {
          logger.info({ clientId }, 'Owner REJECTED action');
          await memory.clearPendingAction(clientId);
          logger.info({ to: clientId, responseBody: 'Sorry, the owner has declined this request.' }, 'Notifying client of rejection');
        }
        return; // Stop here as owner message is processed
      }
    }
    // --- END OWNER LOGIC ---

    // Get Chat History
    const history = await memory.getHistory(sender);

    // Process with Gemini (Auto-handles tools now)
    const result = await gemini.processMessage(text, history, sender);
    logger.info({ result }, 'Gemini final result');

    // Save New History
    await memory.saveHistory(sender, result.history);

    // Send text response back to user (In real life, call WhatsApp API)
    logger.info({ to: sender, responseBody: result.text }, 'Sending response back to user');
  } catch (error) {
    logger.error(error, 'Error processing webhook');
    if (!res.headersSent) {
      res.status(500).send('INTERNAL_SERVER_ERROR');
    }
  }
});

module.exports = router;
