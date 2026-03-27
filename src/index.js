const express = require('express');
const config = require('./config');
const logger = require('./utils/logger');

const app = express();

app.use(express.json());
app.use('/uploads', express.static('/tmp'));

// Basic health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// We will add routes here later
app.use('/webhook', require('./routes/webhook'));

app.listen(config.port, () => {
  logger.info(`Autonomous AI Employee Server started on port ${config.port}`);
});

module.exports = app;
