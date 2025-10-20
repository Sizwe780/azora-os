// filepath: /workspaces/azora-os/services/contracts-service/index.js
const express = require('express');
const cors = require('cors');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4099;
const COMPLIANCE_URL = process.env.COMPLIANCE_SERVICE_URL || 'http://localhost:4081';
const TEMPLATES_DIR = path.join(__dirname, 'templates');
const OUTPUT_DIR = process.env.CONTRACTS_OUTPUT_DIR || '/tmp/contracts';

// Create output directory if it doesn't exist
(async () => {
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating output directory:', err);
  }
})();

// Contract templates
const CONTRACT_TYPES = {
  'service-agreement': {
    title: 'Enterprise Service Agreement',
    sections: [
      'definitions', 'services', 'term', 'fees', 'confidentiality', 
      'data-protection', 'warranties', 'limitation-of-liability', 
      'termination', 'governing-law'
    ]
  },
  'dpa': {
    title: 'Data Processing Agreement',
    sections: [
      'definitions', 'processing-scope', 'processor-obligations', 
      'security-measures', 'sub-processors', 'data-transfers',
      'audit-rights', 'data-breach', 'termination', 'governing-law'
    ]
  },
  'subscription': {
    title: 'Subscription Agreement',
    sections: [
      'definitions', 'subscription', 'payment-terms', 'usage-rights',
      'restrictions', 'confidentiality', 'term-termination',
      'warranties', 'indemnification', 'governing-law'
    ]
  },
  'privacy-policy': {
    title: 'Enterprise Privacy Policy',
    sections: [
      'information-collection', 'information-use', 'information-sharing',
      'data-storage', 'user-rights', 'cookies', 'third-party-links',
      'children-privacy', 'changes', 'contact'
    ]
  }
};

// Generate contract PDF
async function generateContract(contractType, data) {
  if (!CONTRACT_TYPES[contractType]) {
    throw new Error(`Unsupported contract type: ${contractType}`);
  }
  
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add font
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Add a page
  const page = pdfDoc.addPage([595.276, 841.890]); // A4 size
  const { width, height } = page.getSize();
  
  // Add header with logo placeholder
  page.drawText(CONTRACT_TYPES[contractType].title.toUpperCase(), {
    x: 50,
    y: height - 50,
    font: boldFont,
    size: 16,
  });
  
  // Add company and client information
  page.drawText(`AZORA OS Enterprise`, {
    x: 50,
    y: height - 80,
    font: boldFont,
    size: 12,
  });
  
  page.drawText(`Contract Reference: ${data.reference || crypto.randomBytes(8).toString('hex')}`, {
    x: 50,
    y: height - 100,
    font: font,
    size: 10,
  });
  
  page.drawText(`Date: ${new Date().toISOString().split('T')[0]}`, {
    x: 50,
    y: height - 115,
    font: font,
    size: 10,
  });
  
  if (data.client) {
    page.drawText(`Client: ${data.client.name}`, {
      x: 300,
      y: height - 80,
      font: boldFont,
      size: 12,
    });
    
    if (data.client.address) {
      page.drawText(data.client.address, {
        x: 300,
        y: height - 95,
        font: font,
        size: 10,
      });
    }
  }
  
  // Add contract sections placeholder - in a real implementation, this would
  // load sections from templates and populate with actual data
  let yPosition = height - 150;
  CONTRACT_TYPES[contractType].sections.forEach((section, index) => {
    // Add section title
    page.drawText(`${index + 1}. ${section.replace('-', ' ').toUpperCase()}`, {
      x: 50,
      y: yPosition,
      font: boldFont,
      size: 12,
    });
    
    // Add placeholder text for section content
    yPosition -= 20;
    page.drawText(`This section contains the ${section.replace('-', ' ')} terms.`, {
      x: 50,
      y: yPosition,
      font: font,
      size: 10,
    });
    
    // Move to next section position
    yPosition -= 40;
    
    // Add new page if needed
    if (yPosition < 100) {
      page = pdfDoc.addPage([595.276, 841.890]);
      yPosition = height - 50;
    }
  });
  
  // Add signature blocks
  const sigPage = pdfDoc.addPage([595.276, 841.890]);
  
  sigPage.drawText('SIGNATURES', {
    x: 50,
    y: height - 50,
    font: boldFont,
    size: 14,
  });
  
  sigPage.drawText('For and on behalf of AZORA OS Enterprise:', {
    x: 50,
    y: height - 80,
    font: boldFont,
    size: 12,
  });
  
  sigPage.drawLine({
    start: { x: 50, y: height - 120 },
    end: { x: 250, y: height - 120 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  
  sigPage.drawText('Name:', {
    x: 50,
    y: height - 135,
    font: font,
    size: 10,
  });
  
  sigPage.drawText('Position:', {
    x: 50,
    y: height - 150,
    font: font,
    size: 10,
  });
  
  sigPage.drawText('Date:', {
    x: 50,
    y: height - 165,
    font: font,
    size: 10,
  });
  
  sigPage.drawText(`For and on behalf of ${data.client?.name || '[CLIENT]'}:`, {
    x: 300,
    y: height - 80,
    font: boldFont,
    size: 12,
  });
  
  sigPage.drawLine({
    start: { x: 300, y: height - 120 },
    end: { x: 500, y: height - 120 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  
  sigPage.drawText('Name:', {
    x: 300,
    y: height - 135,
    font: font,
    size: 10,
  });
  
  sigPage.drawText('Position:', {
    x: 300,
    y: height - 150,
    font: font,
    size: 10,
  });
  
  sigPage.drawText('Date:', {
    x: 300,
    y: height - 165,
    font: font,
    size: 10,
  });
  
  // Serialize the PDFDocument to bytes
  const pdfBytes = await pdfDoc.save();
  
  // Create a unique filename
  const timestamp = Date.now();
  const filename = `${contractType}-${timestamp}.pdf`;
  const filePath = path.join(OUTPUT_DIR, filename);
  
  // Write the PDF to file
  await fs.writeFile(filePath, pdfBytes);
  
  return {
    filename,
    path: filePath,
    size: pdfBytes.length,
    contractType,
    generatedAt: new Date().toISOString(),
  };
}

// API endpoints
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'contracts-service' });
});

app.get('/api/contracts/types', (_req, res) => {
  const types = Object.entries(CONTRACT_TYPES).map(([id, contract]) => ({
    id,
    title: contract.title,
    sections: contract.sections,
  }));
  
  res.json({
    types,
    transparencyNote: 'All generated contracts are logged for compliance purposes.',
  });
});

app.post('/api/contracts/generate', async (req, res) => {
  const { type, data } = req.body || {};
  
  if (!type || !CONTRACT_TYPES[type]) {
    return res.status(400).json({ error: 'invalid_contract_type' });
  }
  
  try {
    const contract = await generateContract(type, data || {});
    
    // Log contract generation to compliance service
    try {
      await fetch(`${COMPLIANCE_URL}/api/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contracts',
          action: 'contract.generated',
          contractType: type,
          filename: contract.filename,
          client: data.client?.name,
          userId: data.userId,
          tenantId: data.tenantId,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error('Failed to log to compliance service:', err);
    }
    
    res.json({
      success: true,
      contract,
      downloadUrl: `/api/contracts/download/${contract.filename}`,
    });
  } catch (error) {
    console.error('Error generating contract:', error);
    res.status(500).json({
      error: 'contract_generation_failed',
      message: error.message,
    });
  }
});

app.get('/api/contracts/download/:filename', async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(OUTPUT_DIR, filename);
  
  try {
    // Check if file exists
    await fs.access(filePath);
    
    // Log the download
    try {
      await fetch(`${COMPLIANCE_URL}/api/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contracts',
          action: 'contract.downloaded',
          filename,
          ip: req.ip,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error('Failed to log to compliance service:', err);
    }
    
    // Set headers and send file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'file_not_found' });
    } else {
      console.error('Error downloading contract:', error);
      res.status(500).json({ error: 'download_failed', message: error.message });
    }
  }
});

app.listen(PORT, () => console.log(`Contracts service listening on port ${PORT}`));  name: azora-ingress
  namespace: azora
  annotations:
    kubernetes.io/ingress.class: "nginx"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - api.azora.com
    secretName: azora-tls
  rules:
  - host: api.azora.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-gateway
            port:
              number: 80
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
  namespace: azora
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
---
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: azora-services
  namespace: azora
  labels:
    release: prometheus
spec:
  selector:
    matchLabels:
      app.kubernetes.io/part-of: azora-os
  endpoints:
  - port: http
    interval: 15s
    path: /metrics