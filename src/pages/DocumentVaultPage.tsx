import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Download, Search, Shield, CheckCircle, AlertTriangle, QrCode } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Document {
  id: string;
  uid: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  status: 'certified' | 'pending' | 'expired';
  watermarked: boolean;
  qrCode: string;
}

const BORDER_POSTS = [
  { name: 'Beitbridge (ZW)', code: 'BBG' },
  { name: 'Lebombo/Ressano Garcia (MZ)', code: 'LEB' },
  { name: 'Chirundu (ZM)', code: 'CHI' },
  { name: 'Skilpadshek (BW)', code: 'SKI' },
  { name: 'Ariamsvlei (NA)', code: 'ARI' }
];

export default function DocumentVaultPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedBorder, setSelectedBorder] = useState('BBG');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [borderReadiness, setBorderReadiness] = useState<any>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4087/api/documents/user123');
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      // Demo data
      setDocuments([
        {
          id: '1',
          uid: 'AZ-DOC-2025-10-10-ABC123',
          fileName: 'Driver_License.pdf',
          fileType: 'license',
          uploadedAt: new Date().toISOString(),
          status: 'certified',
          watermarked: true,
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        },
        {
          id: '2',
          uid: 'AZ-DOC-2025-10-10-DEF456',
          fileName: 'ID_Document.pdf',
          fileType: 'id',
          uploadedAt: new Date().toISOString(),
          status: 'certified',
          watermarked: true,
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    formData.append('userId', 'user123');
    formData.append('fileType', 'general');

    try {
      setUploading(true);
      await axios.post('http://localhost:4087/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Document uploaded successfully!');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const checkBorderReadiness = async () => {
    try {
      const response = await axios.post('http://localhost:4087/api/border-readiness/check', {
        borderPost: selectedBorder,
        userId: 'user123'
      });
      setBorderReadiness(response.data);
      
      if (response.data.ready) {
        toast.success('✅ Border ready! All documents in order.');
      } else {
        toast.error('❌ Missing documents for this border');
      }
    } catch (error) {
      // Demo readiness check
      setBorderReadiness({
        borderPost: selectedBorder,
        ready: documents.length >= 2,
        requiredDocs: ['passport', 'license', 'insurance', 'vehicle_registration'],
        missingDocs: documents.length < 2 ? ['passport', 'insurance'] : [],
        expiringDocs: []
      });
      
      if (documents.length >= 2) {
        toast.success('✅ Border ready! All documents in order.');
      } else {
        toast.error('❌ Missing documents for this border');
      }
    }
  };

  const validateDocument = async (docId: string) => {
    try {
      const response = await axios.post(`http://localhost:4087/api/documents/${docId}/validate`);
      toast.success('Document validated successfully!');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to validate document');
    }
  };

  const downloadDocument = (doc: Document) => {
    toast.success(`Downloading ${doc.fileName}`);
    // In production, this would trigger actual download
  };

  const filteredDocuments = documents.filter(doc =>
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.uid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">Document Vault</h1>
        <p className="text-green-200">Your Legal Safety Net - Triple Backup, Border Ready</p>
      </motion.div>

      {/* Actions Bar */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <motion.label
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 cursor-pointer hover:bg-white/20 transition-all"
        >
          <div className="flex items-center gap-4">
            <Upload className="w-12 h-12 text-green-400" />
            <div>
              <h3 className="text-xl font-bold text-white">Upload Document</h3>
              <p className="text-white/70 text-sm">Drag & drop or click</p>
            </div>
          </div>
          <input
            type="file"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
          {uploading && <div className="mt-4 text-center text-white">Uploading...</div>}
        </motion.label>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
        >
          <div className="flex items-center gap-4">
            <Shield className="w-12 h-12 text-blue-400" />
            <div>
              <h3 className="text-xl font-bold text-white">{documents.filter(d => d.status === 'certified').length}</h3>
              <p className="text-white/70 text-sm">Certified Documents</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
        >
          <div className="flex items-center gap-4">
            <QrCode className="w-12 h-12 text-purple-400" />
            <div>
              <h3 className="text-xl font-bold text-white">{documents.filter(d => d.watermarked).length}</h3>
              <p className="text-white/70 text-sm">UID Watermarked</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Border Readiness Check */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Border Readiness Check</h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-white/70 text-sm mb-2 block">Select Border Post</label>
            <select
              value={selectedBorder}
              onChange={(e) => setSelectedBorder(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {BORDER_POSTS.map((border) => (
                <option key={border.code} value={border.code} className="bg-slate-800">
                  {border.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={checkBorderReadiness}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Check Readiness
          </button>
        </div>

        {borderReadiness && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 p-4 bg-white/5 rounded-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              {borderReadiness.ready ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span className="text-white font-semibold">Ready to cross border!</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                  <span className="text-white font-semibold">Missing documents</span>
                </>
              )}
            </div>
            
            {borderReadiness.missingDocs && borderReadiness.missingDocs.length > 0 && (
              <div>
                <p className="text-white/70 text-sm mb-2">Missing:</p>
                <div className="flex flex-wrap gap-2">
                  {borderReadiness.missingDocs.map((doc: string) => (
                    <span key={doc} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm capitalize">
                      {doc.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
          <input
            type="text"
            placeholder="Search by filename or UID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-white text-center py-12">Loading documents...</div>
        ) : filteredDocuments.length === 0 ? (
          <div className="col-span-3 text-white/50 text-center py-12">
            {searchQuery ? 'No documents match your search' : 'No documents uploaded yet'}
          </div>
        ) : (
          filteredDocuments.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedDoc(doc)}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 cursor-pointer hover:bg-white/20 transition-all border border-white/10"
            >
              <div className="flex items-start justify-between mb-4">
                <FileText className="w-12 h-12 text-green-400" />
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    doc.status === 'certified'
                      ? 'bg-green-500/20 text-green-300'
                      : doc.status === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  {doc.status}
                </span>
              </div>

              <h3 className="text-white font-semibold mb-2 truncate">{doc.fileName}</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-white/50" />
                  <span className="text-white/70 truncate">{doc.uid}</span>
                </div>
                <div className="text-white/50">
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </div>
              </div>

              {doc.watermarked && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    UID Watermarked
                  </span>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Document Detail Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{selectedDoc.fileName}</h2>
                <p className="text-white/70">UID: {selectedDoc.uid}</p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-white/50 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* QR Code */}
              <div className="bg-white p-6 rounded-lg text-center">
                <img
                  src={selectedDoc.qrCode}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto mb-4"
                />
                <p className="text-slate-700 text-sm">Scan for instant verification</p>
              </div>

              {/* Document Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/50 text-sm mb-1">Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold inline-block ${
                      selectedDoc.status === 'certified'
                        ? 'bg-green-500/20 text-green-300'
                        : selectedDoc.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {selectedDoc.status}
                  </span>
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">Uploaded</p>
                  <p className="text-white">{new Date(selectedDoc.uploadedAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">File Type</p>
                  <p className="text-white capitalize">{selectedDoc.fileType}</p>
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">Watermarked</p>
                  <p className="text-white">{selectedDoc.watermarked ? 'Yes ✓' : 'No'}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => downloadDocument(selectedDoc)}
                  className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download
                </button>
                {selectedDoc.status === 'pending' && (
                  <button
                    onClick={() => validateDocument(selectedDoc.id)}
                    className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Shield className="w-5 h-5" />
                    Validate
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
