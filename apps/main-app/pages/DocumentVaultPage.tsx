import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle, QrCode, Search } from 'lucide-react';

import { mockDocuments, Document } from '../features/document-vault/mockData';
import StatCard from '../components/document-vault/StatCard';
import UploadButton from '../components/document-vault/UploadButton';
import DocumentCard from '../components/document-vault/DocumentCard';
import DocumentDetailModal from '../components/document-vault/DocumentDetailModal';
import BorderReadinessCheck from '../components/document-vault/BorderReadinessCheck';

export default function DocumentVaultPage() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    setTimeout(() => {
      const newDoc: Document = {
        id: (documents.length + 1).toString(),
        uid: `AZ-DOC-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        fileName: file.name,
        fileType: 'general',
        uploadedAt: new Date().toISOString(),
        status: 'pending',
        watermarked: false,
        qrCode: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${documents.length + 1}</text></svg>`,
      };
      setDocuments(prev => [newDoc, ...prev]);
      setUploading(false);
    }, 1500);
  };

  const filteredDocuments = useMemo(() =>
    documents.filter(doc =>
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.uid.toLowerCase().includes(searchQuery.toLowerCase())
    ), [documents, searchQuery]);

  const stats = [
    { icon: CheckCircle, label: 'Certified Documents', value: documents.filter(d => d.status === 'certified').length.toString(), color: 'green', index: 0 },
    { icon: QrCode, label: 'UID Watermarked', value: documents.filter(d => d.watermarked).length.toString(), color: 'blue', index: 1 },
  ];

  return (
    <>
      <Helmet>
        <title>Document Vault | Azora</title>
        <meta name="description" content="Your Legal Safety Net - Triple Backup, Border Ready. Securely manage and verify all critical documents with blockchain-backed integrity." />
      </Helmet>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-950 min-h-screen text-white">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-xl border border-green-500/30">
              <Shield className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Document Vault</h1>
              <p className="text-green-300/80">Your Legal Safety Net - Triple Backup, Border Ready</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <UploadButton onUpload={handleUpload} uploading={uploading} />
          {stats.map(stat => <StatCard key={stat.label} {...stat} />)}
        </div>

        <BorderReadinessCheck documents={documents} />

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by filename or UID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocuments.map((doc, index) => (
            <DocumentCard key={doc.id} doc={doc} onSelect={setSelectedDoc} index={index} />
          ))}
        </div>

        <AnimatePresence>
          {selectedDoc && (
            <DocumentDetailModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
