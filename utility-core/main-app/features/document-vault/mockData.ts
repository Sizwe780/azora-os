import { format, subMonths, subDays } from 'date-fns';

export interface BorderPost {
  name: string;
  code: string;
}

export interface Document {
  id: string;
  uid: string;
  fileName: string;
  fileType: 'license' | 'id' | 'passport' | 'vehicle' | 'manifest' | 'general';
  uploadedAt: string;
  expiresAt?: string;
  status: 'certified' | 'pending' | 'expired' | 'rejected';
  watermarked: boolean;
  qrCode: string; // Typically a URL or data URI
  blockchainHash?: string;
}

export const BORDER_POSTS: BorderPost[] = [
  { name: 'Beitbridge (ZW)', code: 'BBG' },
  { name: 'Lebombo/Ressano Garcia (MZ)', code: 'LEB' },
  { name: 'Chirundu (ZM)', code: 'CHI' },
  { name: 'Skilpadshek (BW)', code: 'SKI' },
  { name: 'Ariamsvlei (NA)', code: 'ARI' },
];

const generateQrCode = (id: string) => `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${id}</text></svg>`;

export const mockDocuments: Document[] = [
  {
    id: '1',
    uid: 'AZ-DOC-2025-10-10-ABC123',
    fileName: 'Driver_License_J_Doe.pdf',
    fileType: 'license',
    uploadedAt: subMonths(new Date(), 2).toISOString(),
    expiresAt: subMonths(new Date(), -10).toISOString(),
    status: 'certified',
    watermarked: true,
    qrCode: generateQrCode('1'),
    blockchainHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random()*16).toString(16)).join('')
  },
  {
    id: '2',
    uid: 'AZ-DOC-2025-10-10-DEF456',
    fileName: 'ID_Document_J_Doe.pdf',
    fileType: 'id',
    uploadedAt: subMonths(new Date(), 5).toISOString(),
    status: 'certified',
    watermarked: true,
    qrCode: generateQrCode('2'),
    blockchainHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random()*16).toString(16)).join('')
  },
  {
    id: '3',
    uid: 'AZ-DOC-2025-09-01-GHI789',
    fileName: 'Passport_J_Doe.pdf',
    fileType: 'passport',
    uploadedAt: subDays(new Date(), 3).toISOString(),
    expiresAt: subMonths(new Date(), -24).toISOString(),
    status: 'pending',
    watermarked: false,
    qrCode: generateQrCode('3'),
  },
  {
    id: '4',
    uid: 'AZ-DOC-2024-01-15-JKL012',
    fileName: 'Vehicle_Reg_ND12345.pdf',
    fileType: 'vehicle',
    uploadedAt: subMonths(new Date(), 12).toISOString(),
    expiresAt: subMonths(new Date(), 1).toISOString(),
    status: 'expired',
    watermarked: true,
    qrCode: generateQrCode('4'),
    blockchainHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random()*16).toString(16)).join('')
  },
  {
    id: '5',
    uid: 'AZ-DOC-2024-08-20-MNO345',
    fileName: 'Shipping_Manifest_SH789.pdf',
    fileType: 'manifest',
    uploadedAt: subDays(new Date(), 1).toISOString(),
    status: 'certified',
    watermarked: true,
    qrCode: generateQrCode('5'),
    blockchainHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random()*16).toString(16)).join('')
  },
  {
    id: '6',
    uid: 'AZ-DOC-2024-07-11-PQR678',
    fileName: 'Customs_Declaration_CD456.pdf',
    fileType: 'general',
    uploadedAt: subMonths(new Date(), 1).toISOString(),
    status: 'rejected',
    watermarked: false,
    qrCode: generateQrCode('6'),
  }
];

export const checkBorderReadiness = (documents: Document[], borderPostCode: string) => {
  // Example logic: different borders might have different requirements
  const required: Document['fileType'][] = ['passport', 'license', 'vehicle'];
  
  const certifiedDocs = documents.filter(d => d.status === 'certified');
  
  const missingDocs = required.filter(type => 
    !certifiedDocs.some(d => d.fileType === type)
  );

  return {
    borderPost: BORDER_POSTS.find(b => b.code === borderPostCode),
    ready: missingDocs.length === 0,
    missingDocs: missingDocs,
    timestamp: new Date().toISOString(),
  };
};
