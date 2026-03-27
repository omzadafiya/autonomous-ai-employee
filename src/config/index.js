require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  geminiApiKey: process.env.GEMINI_API_KEY,
  ownerNumber: process.env.WHATSAPP_OWNER_NUMBER,
  redisUrl: process.env.REDIS_URL,
  isDev: process.env.NODE_ENV !== 'production',
};
