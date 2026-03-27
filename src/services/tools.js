const logger = require('../utils/logger');

/**
 * Dynamic Inventory Service (Mock)
 */
const findProduct = async (query) => {
  logger.info({ query }, 'Searching inventory');
  const inventory = [
    { name: 'Gaming Laptop', price: 85000, stock: 12, category: 'Tech' },
    { name: 'Wireless Mouse', price: 1500, stock: 45, category: 'Tech' },
    { name: 'Mechanical Keyboard', price: 4500, stock: 8, category: 'Tech' },
    { name: 'Office Chair', price: 12000, stock: 20, category: 'Furniture' },
    { name: 'Standing Desk', price: 25000, stock: 5, category: 'Furniture' },
    { name: 'Monitor Arm', price: 3500, stock: 15, category: 'Tech' },
  ];

  const results = inventory.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  return results.length > 0 ? results : { message: 'Product not found' };
};

/**
 * Mock Web Research
 */
const webResearch = async (topic) => {
  logger.info({ topic }, 'Researching on web');
  return {
    results: `Based on current trends for ${topic}, the average market price is ₹${Math.floor(Math.random() * 90000)}. Competitors like X and Y are selling at similar rates.`
  };
};

const memory = require('./redis');

/**
 * Mock Approval Request with State
 */
const requestApproval = async (summary, data, sender) => {
  logger.info({ summary, data, sender }, 'Requesting owner approval');
  
  // Save pending action to Redis
  const pendingAction = {
    type: 'OWNER_APPROVAL',
    clientSender: sender,
    summary,
    data,
    timestamp: Date.now()
  };
  
  await memory.savePendingAction(sender, pendingAction);
  
  return { 
    status: 'PAUSED_FOR_APPROVAL', 
    message: 'I have sent your request to the business owner for approval. Please wait a moment.' 
  };
};

const pdfHelper = require('../utils/pdfHelper');

/**
 * Generate Quote PDF
 */
const generateQuote = async (customerName, items) => {
  logger.info({ customerName, items }, 'Generating quote PDF');
  const result = await pdfHelper.generateQuotePDF(customerName, items);
  return { 
    message: 'PDF Generated successfully', 
    fileName: result.fileName, 
    viewUrl: `http://localhost:3000/uploads/${result.fileName}` 
  };
};

module.exports = {
  findProduct,
  webResearch,
  requestApproval,
  generateQuote,
};
