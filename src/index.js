const express = require('express');
const config = require('./config');
const logger = require('./utils/logger');

const app = express();

app.use(express.json());
app.use('/uploads', express.static('/tmp'));

// Basic health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running', env: process.env.NODE_ENV });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).send('<h1>Autonomous AI Employee is Live!</h1><p>Send messages to the <code>/webhook</code> endpoint.</p>');
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error(err, 'Global error caught');
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// We will add routes here later
app.use('/webhook', require('./routes/webhook'));

app.listen(config.port, () => {
  logger.info(`Autonomous AI Employee Server started on port ${config.port}`);
});

module.exports = app;
