import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Clock, FileText } from 'lucide-react';
import { Document } from '../../features/document-vault/mockData';
import { format } from 'date-fns';

const statusConfig = {
  certified: { icon: CheckCircle, color: 'green', label: 'Certified' },
  pending: { icon: Clock, color: 'yellow', label: 'Pending' },
  expired: { icon: AlertTriangle, color: 'orange', label: 'Expired' },
  rejected: { icon: XCircle, color: 'red', label: 'Rejected' },
};

interface DocumentCardProps {
  doc: Document;
  onSelect: (doc: Document) => void;
  index: number;
}

const DocumentCard = ({ doc, onSelect, index }: DocumentCardProps) => {
  const status = statusConfig[doc.status];
  const Icon = status?.icon || FileText;
  const color = status?.color || 'gray';
  const label = status?.label || 'Unknown';

  const colorClasses = {
    green: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', labelBg: 'bg-green-500/10', labelText: 'text-green-300' },
    yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', labelBg: 'bg-yellow-500/10', labelText: 'text-yellow-300' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', labelBg: 'bg-orange-500/10', labelText: 'text-orange-300' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', labelBg: 'bg-red-500/10', labelText: 'text-red-300' },
    gray: { bg: 'bg-gray-500/10', border: 'border-gray-500/20', text: 'text-gray-400', labelBg: 'bg-gray-500/10', labelText: 'text-gray-300' },
  };

  const classes = colorClasses[color as keyof typeof colorClasses];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
      onClick={() => onSelect(doc)}
      className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-5 cursor-pointer group hover:border-cyan-500/50 transition-all duration-300 h-full flex flex-col"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${classes.bg} ${classes.border}`}>
          <Icon className={`w-6 h-6 ${classes.text}`} />
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${classes.labelBg} ${classes.labelText}`}>
          {label}
        </span>
      </div>
      <div className="flex-grow">
        <h3 className="font-semibold text-white truncate mb-1 group-hover:text-cyan-300 transition-colors">{doc.fileName}</h3>
        <p className="text-xs text-gray-500 truncate">{doc.uid}</p>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700/50 flex justify-between items-center text-xs text-gray-400">
        <span>{doc.expiresAt ? `Expires ${format(new Date(doc.expiresAt), 'dd MMM yyyy')}` : 'No Expiry'}</span>
        {doc.watermarked && <span className="flex items-center gap-1 text-cyan-400"><CheckCircle size={14}/> Watermarked</span>}
      </div>
    </motion.div>
  );
};

export default DocumentCard;
