const Redis = require('ioredis');
const config = require('../config');
const logger = require('../utils/logger');

const redisUrl = config.redisUrl || 'redis://127.0.0.1:6379';
const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  connectTimeout: 5000
});

redis.on('error', (err) => {
  logger.error(err, 'Redis Connection Error');
});

/**
 * Get chat history from Redis
 */
const getHistory = async (sessionId) => {
  try {
    const history = await redis.get(`chat:${sessionId}`);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    logger.error(error, 'Error getting history from Redis');
    return [];
  }
};

/**
 * Save chat history to Redis
 */
const saveHistory = async (sessionId, history) => {
  try {
    // Keep only last 20 messages for context
    const limitedHistory = history.slice(-20);
    await redis.set(`chat:${sessionId}`, JSON.stringify(limitedHistory), 'EX', 86400); // 24h expiry
  } catch (error) {
    logger.error(error, 'Error saving history to Redis');
  }
};

const savePendingAction = async (clientId, action) => {
  await redis.set(`pending:${clientId}`, JSON.stringify(action), 'EX', 3600); // 1h expiry
};

const getPendingAction = async (clientId) => {
  const data = await redis.get(`pending:${clientId}`);
  return data ? JSON.parse(data) : null;
};

const clearPendingAction = async (clientId) => {
  await redis.del(`pending:${clientId}`);
};

module.exports = {
  getHistory,
  saveHistory,
  savePendingAction,
  getPendingAction,
  clearPendingAction,
};
