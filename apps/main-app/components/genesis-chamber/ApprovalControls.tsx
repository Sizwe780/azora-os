import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface ApprovalControlsProps {
    onApprove: () => void;
    onReject: () => void;
}

const ApprovalControls = ({ onApprove, onReject }: ApprovalControlsProps) => (
    <div className="mt-12 text-center">
        <h2 className="text-2xl mb-6 font-semibold text-white">Does this proposal align with the vision?</h2>
        <div className="flex justify-center gap-6">
            <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={onApprove}
                className="px-10 py-4 bg-green-600/80 hover:bg-green-500 border border-green-500/50 rounded-lg font-bold flex items-center gap-3 text-white shadow-lg shadow-green-500/20 transition-all"
            >
                <Check /> Approve Genesis
            </motion.button>
            <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={onReject}
                className="px-10 py-4 bg-red-600/80 hover:bg-red-500 border border-red-500/50 rounded-lg font-bold flex items-center gap-3 text-white shadow-lg shadow-red-500/20 transition-all"
            >
                <X /> Reject Proposal
            </motion.button>
        </div>
    </div>
);

export default ApprovalControls;
