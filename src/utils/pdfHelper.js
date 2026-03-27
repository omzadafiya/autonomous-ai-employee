const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Generate a professional Quotation PDF
 */
const generateQuotePDF = async (customerName, items) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const fileName = `Quote_${customerName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      const filePath = path.join('/tmp', fileName); // Use /tmp for serverless environments

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(25).text('QUOTATION', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Customer: ${customerName}`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      // Table Header
      doc.fontSize(14).text('Items:', { underline: true });
      doc.moveDown(0.5);

      let total = 0;
      items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        doc.fontSize(12).text(`${item.name} - ${item.quantity} x ₹${item.price} = ₹${itemTotal}`);
      });

      doc.moveDown();
      doc.fontSize(16).text(`Total Amount: ₹${total}`, { align: 'right' });

      // Footer
      doc.moveDown(2);
      doc.fontSize(10).text('Thank you for your business!', { align: 'center', italic: true });

      doc.end();

      stream.on('finish', () => {
        logger.info({ filePath }, 'PDF Generated successfully');
        resolve({ status: 'Success', filePath, fileName });
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateQuotePDF,
};
