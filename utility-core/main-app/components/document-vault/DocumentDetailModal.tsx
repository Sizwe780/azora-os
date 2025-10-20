import { motion, AnimatePresence } from 'framer-motion';
import { Document } from '../../features/document-vault/mockData';
import { CheckCircle, Download, X, Link as LinkIcon, AlertTriangle, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface DocumentDetailModalProps {
  doc: Document | null;
  onClose: () => void;
}

const statusConfig = {
  certified: { icon: CheckCircle, color: 'green', label: 'Certified' },
  pending: { icon: Clock, color: 'yellow', label: 'Pending' },
  expired: { icon: AlertTriangle, color: 'orange', label: 'Expired' },
  rejected: { icon: XCircle, color: 'red', label: 'Rejected' },
};

const DocumentDetailModal = ({ doc, onClose }: DocumentDetailModalProps) => {
  const status = doc ? statusConfig[doc.status] : null;
  const color = status?.color || 'gray';
  const label = status?.label || 'Unknown';

  const colorClasses = {
    green: { labelBg: 'bg-green-500/10', labelText: 'text-green-300' },
    yellow: { labelBg: 'bg-yellow-500/10', labelText: 'text-yellow-300' },
    orange: { labelBg: 'bg-orange-500/10', labelText: 'text-orange-300' },
    red: { labelBg: 'bg-red-500/10', labelText: 'text-red-300' },
    gray: { labelBg: 'bg-gray-500/10', labelText: 'text-gray-300' },
  };
  const classes = colorClasses[color as keyof typeof colorClasses];

  return (
    <AnimatePresence>
      {doc && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900/70 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl p-8 max-w-lg w-full relative shadow-2xl shadow-cyan-500/10"
          >
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </motion.button>

            <div className="text-center mb-8">
              <div className="w-48 h-48 mx-auto mb-4 rounded-lg bg-white p-2 flex items-center justify-center border-4 border-gray-700">
                <img src={doc.qrCode} alt="QR Code" className="w-full h-full" />
              </div>
              <h2 className="text-2xl font-bold text-white truncate">{doc.fileName}</h2>
              <p className="text-sm text-gray-500 break-all">{doc.uid}</p>
            </div>

            <div className="space-y-4 text-sm mb-8">
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-400">Status</span>
                <span className={`font-semibold px-3 py-1 rounded-md text-xs ${classes.labelBg} ${classes.labelText}`}>{label}</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-800/50 rounded-lg"><span className="text-gray-400">Uploaded</span><span className="font-mono">{format(new Date(doc.uploadedAt), 'dd MMM yyyy, HH:mm')}</span></div>
              {doc.expiresAt && <div className="flex justify-between p-3 bg-gray-800/50 rounded-lg"><span className="text-gray-400">Expires</span><span className="font-mono">{format(new Date(doc.expiresAt), 'dd MMM yyyy')}</span></div>}
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-400">Watermarked</span>
                <span className={`flex items-center gap-1.5 font-semibold ${doc.watermarked ? 'text-cyan-400' : 'text-red-400'}`}>
                  {doc.watermarked ? <CheckCircle size={16} /> : <X size={16} />}
                  {doc.watermarked ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
            
            {doc.blockchainHash && (
              <div className="mb-8">
                <p className="text-gray-400 text-sm mb-2 flex items-center gap-2"><LinkIcon size={14}/> Blockchain Hash</p>
                <p className="text-xs text-gray-500 bg-gray-800/50 p-3 rounded-lg break-all font-mono border border-gray-700">{doc.blockchainHash}</p>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02, y: -2, boxShadow: '0 10px 20px rgba(0, 255, 255, 0.1)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <Download size={18} /> Download Verified Copy
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DocumentDetailModal;
