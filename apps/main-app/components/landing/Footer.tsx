import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const Footer = () => {
    const navigate = useNavigate();

    return (
        <footer className="py-12 border-t border-gray-800">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <div className="text-2xl font-bold mb-1">AZORA OS</div>
                        <p className="text-gray-500 text-sm">The Sovereign Immune System</p>
                    </div>
                    <div className="flex gap-6 text-sm">
                        <button onClick={() => navigate('/founders')} className="text-gray-400 hover:text-white transition-colors">
                            Founders
                        </button>
                        <a href="mailto:sizwe.ngwenya@azora.world" className="text-gray-400 hover:text-white transition-colors">
                            Contact
                        </a>
                        <a href="https://azora.world" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                            Website
                        </a>
                    </div>
                </div>
                <div className="text-center mt-8 text-gray-600 text-sm">
                    © {new Date().getFullYear()} Azora World (Pty) Ltd. Built with ❤️ in South Africa 🇿🇦
                </div>
            </div>
        </footer>
    );
};
