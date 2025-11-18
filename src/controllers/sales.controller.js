// Resumo do sales.controller (versão funcional curta — substitui depois pela versão completa)
const mongoose = require('mongoose');
const Invoice = require('../models/Invoice'); // cria este modelo depois se precisares
const Counter = require('../models/Counter');
const PDFDocument = require('pdfkit');

async function nextSequence(key) {
  const doc = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 }, $set: { updatedAt: new Date() } },
    { new: true, upsert: true }
  );
  return doc.seq;
}

async function generateInvoiceNumberAtomic(tenantId) {
  const year = new Date().getFullYear();
  const key = `invoice_${year}_${tenantId ? tenantId.toString() : 'general'}`;
  const seq = await nextSequence(key);
  return `INV-${year}-${String(seq).padStart(6,'0')}`;
}

module.exports = {
  async createInvoice(req, res) {
    try {
      const tenantId = req.user.tenantId || req.body.tenantId || null;
      const items = req.body.items || [];
      if (!items.length) return res.status(400).json({ success:false, error:'items_required' });

      const invNumber = await generateInvoiceNumberAtomic(tenantId);
      // aqui criarias o documento Invoice (modelo não incluido nesta versão curta)
      // ... salvar invoice
      return res.json({ success:true, data: { invoiceNumber: invNumber }});
    } catch (err) {
      console.error('createInvoice err', err);
      return res.status(500).json({ success:false, error:'server_error' });
    }
  },

  async createPosSale(req, res) { return module.exports.createInvoice(req, res); },
  async listInvoices(req, res) { return res.json({ success:true, data: [] }); },
  async getInvoice(req, res) { return res.json({ success:true, data: {} }); },
  async payInvoice(req, res) { return res.json({ success:true, data: {} }); },
  async cancelInvoice(req, res) { return res.json({ success:true, data: {} }); },

  async exportInvoicesCsv(req, res) { res.setHeader('Content-disposition','attachment; filename=invoices.csv'); res.set('Content-Type','text/csv'); res.send('invoiceNumber,total,status\n'); },

  async exportInvoiceHtml(req, res) {
    const id = req.params.id;
    const html = `<html><body><h1>Invoice ${id}</h1></body></html>`;
    res.setHeader('Content-disposition', `attachment; filename=invoice-${id}.html`);
    res.set('Content-Type', 'text/html');
    res.send(html);
  },

  async exportInvoicePdf(req, res) {
    const id = req.params.id;
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdf = Buffer.concat(buffers);
      res.setHeader('Content-disposition', `attachment; filename=invoice-${id}.pdf`);
      res.setHeader('Content-Type', 'application/pdf');
      res.send(pdf);
    });
    doc.fontSize(20).text('Great Nexus', { align: 'left' });
    doc.moveDown();
    doc.text(`Invoice: ${id}`);
    doc.end();
  }
};
