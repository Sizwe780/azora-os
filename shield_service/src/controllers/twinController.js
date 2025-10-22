/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const twinService = require('../services/twinService');
const path = require('path');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const createTwin = (req, res, next) => {
  try {
    const { userId, corridor } = req.body;
    const twin = twinService.spawnTwin(userId, corridor);
    // Return public-facing data only
    res.status(201).json({ 
      twinId: twin.id, 
      userId: twin.userId, 
      corridor: twin.corridor,
      publicKey: Buffer.from(twin.sigKeys.publicKey).toString('base64'),
    });
  } catch (error) {
    next(error);
  }
};

const postFeatures = async (req, res, next) => {
  try {
    const { twinId } = req.params;
    const { classicalScore } = req.body;
    if (typeof classicalScore !== 'number') {
      return res.status(400).json({ error: 'classicalScore must be a number' });
    }
    const result = await twinService.processFeatures(twinId, { classicalScore });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Print/download document with UID and watermark logo
const printDocument = (req, res, next) => {
  try {
    const { twinId } = req.params;
    const twin = twinService.getTwin(twinId);
    const doc = new PDFDocument();
    const filename = `Azora_Twin_${twinId}.pdf`;
    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');

    // Watermark logo (assume logo.png in public folder)
    const logoPath = path.join(__dirname, '../../public/logo.png');
    doc.image(logoPath, 50, 50, { width: 120, opacity: 0.15 });

    doc.fontSize(24).fillColor('#2D3A5A').text('Azora Ontological Twin Document', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).fillColor('black').text(`Twin UID: ${twinId}`);
    doc.text(`User ID: ${twin.userId}`);
    doc.text(`Corridor: ${twin.corridor}`);
    doc.text(`Created: ${new Date(twin.state.anchors[0].t0).toLocaleString()}`);
    doc.moveDown();
    doc.fontSize(12).fillColor('gray').text('This document is watermarked and audit-ready.');
    doc.end();
    doc.pipe(res);
  } catch (error) {
    next(error);
  }
};

module.exports = { createTwin, postFeatures, printDocument };
