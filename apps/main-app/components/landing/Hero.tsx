import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Rocket } from 'lucide-react';

export const Hero = () => {
    const navigate = useNavigate();

    return (
        <section className="min-h-screen flex items-center justify-center text-center py-24">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200 leading-tight">
                    The Sovereign<br />Immune System
                </h1>
                <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
                    We don't audit corruption. We make it impossible. Constitutional integrity as code, built to safeguard nations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.button
                        onClick={() => navigate('/onboarding')}
                        whileHover={{ scale: 1.05, boxShadow: '0px 0px 30px rgba(45, 212, 191, 0.5)' }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-bold text-lg shadow-lg"
                    >
                        Start 2-Week Free Trial
                    </motion.button>
                    <motion.button
                        onClick={() => window.open('https://calendly.com/sizwe-azora', '_blank')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-gray-900/50 border border-gray-700 rounded-lg font-bold text-lg"
                    >
                        Book a Demo
                    </motion.button>
                </div>
            </motion.div>
        </section>
    );
};
