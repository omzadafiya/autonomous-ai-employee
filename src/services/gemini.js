const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');
const logger = require('../utils/logger');

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

/**
 * Initialize a Gemini model with Tool definitions
 */
const getModel = (tools = []) => {
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    tools: tools.length > 0 ? [{ functionDeclarations: tools }] : [],
  });
};

/**
 * Process a message and route it to appropriate tools
 */
const processMessage = async (text, history = [], sender = 'unknown') => {
  try {
    const model = getModel([
      {
        name: 'find_product',
        description: 'Search for a product in the inventory and check stock levels.',
        parameters: {
          type: 'OBJECT',
          properties: {
            query: { type: 'STRING', description: 'The product name or category to search for.' },
          },
          required: ['query'],
        },
      },
      {
        name: 'web_research',
        description: 'Search the web for real-time information like price, competitors, or news.',
        parameters: {
          type: 'OBJECT',
          properties: {
            topic: { type: 'STRING', description: 'The topic to research online.' },
          },
          required: ['topic'],
        },
      },
      {
        name: 'generate_quote',
        description: 'Generate a professional PDF quotation for the client.',
        parameters: {
          type: 'OBJECT',
          properties: {
            customer_name: { type: 'STRING' },
            items: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  name: { type: 'STRING' },
                  price: { type: 'NUMBER' },
                  quantity: { type: 'NUMBER' },
                },
              },
            },
          },
          required: ['customer_name', 'items'],
        },
      },
      {
        name: 'request_owner_approval',
        description: 'Ask the business owner for permission before sending a final quote or making a deal.',
        parameters: {
          type: 'OBJECT',
          properties: {
            summary: { type: 'STRING', description: 'What we are asking approval for.' },
            data: { type: 'STRING', description: 'The details (e.g. total amount, discount).' },
          },
          required: ['summary', 'data'],
        },
      },
    ]);

    const chat = model.startChat({ history });
    let result = await chat.sendMessage(text);
    let response = result.response;
    
    // Loop to handle tool calls and feedback
    while (response.functionCalls()) {
      const calls = response.functionCalls();
      const toolResponses = [];
      const tools = require('./tools'); // Dynamic import to avoid circular dependency if any

      logger.info({ calls }, 'Gemini requested tools');

      for (const call of calls) {
        let toolData;
        if (call.name === 'find_product') {
          toolData = await tools.findProduct(call.args.query);
        } else if (call.name === 'web_research') {
          toolData = await tools.webResearch(call.args.topic);
        } else if (call.name === 'request_owner_approval') {
          toolData = await tools.requestApproval(call.args.summary, call.args.data, sender);
        } else if (call.name === 'generate_quote') {
          toolData = await tools.generateQuote(call.args.customer_name, call.args.items);
        }

        toolResponses.push({
          functionResponse: {
            name: call.name,
            response: toolData,
          },
        });
      }

      // Send tool results back to Gemini
      result = await chat.sendMessage(toolResponses);
      response = result.response;
    }

    return { 
      type: 'TEXT', 
      text: response.text(), 
      history: await chat.getHistory() 
    };
  } catch (error) {
    logger.error(error, 'Gemini processing error');
    throw error;
  }
};

module.exports = {
  processMessage,
};
