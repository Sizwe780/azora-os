import { motion } from 'framer-motion';
import { UploadCloud } from 'lucide-react';

interface UploadButtonProps {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
}

const UploadButton = ({ onUpload, uploading }: UploadButtonProps) => (
  <motion.label
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1, duration: 0.3 }}
    className="bg-gray-900/50 backdrop-blur-xl border-2 border-dashed border-gray-700/80 rounded-2xl p-6 cursor-pointer hover:border-cyan-500/80 hover:bg-cyan-900/20 transition-all duration-300 flex flex-col items-center justify-center text-center group"
  >
    <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex flex-col items-center">
      <UploadCloud className="w-12 h-12 text-gray-500 group-hover:text-cyan-400 transition-colors mb-3" />
      <h3 className="text-lg font-bold text-white">{uploading ? 'Processing...' : 'Upload Document'}</h3>
      <p className="text-gray-400 text-sm">{uploading ? 'Verifying and watermarking...' : 'Drag & drop or click to select file'}</p>
    </motion.div>
    <input type="file" onChange={onUpload} className="hidden" disabled={uploading} />
  </motion.label>
);

export default UploadButton;
