import React from 'react';
import GlassPanel from './GlassPanel.jsx';

const ConfirmationModal = ({ isOpen, onConfirm, onCancel, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <GlassPanel className="w-full max-w-md p-6 border-indigo-500/50 animate-fade-in-quick">
                <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
                <div className="text-white/80 mb-6">{children}</div>
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg">Cancel</button>
                    <button onClick={onConfirm} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg">Confirm</button>
                </div>
            </GlassPanel>
        </div>
    );
};

export default ConfirmationModal;