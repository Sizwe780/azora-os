import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Rocket } from 'lucide-react';

export const Hero = () => {
    const navigate = useNavigate();

    return (
        <section className="relative min-h-screen flex items-center justify-center text-center py-24 overflow-hidden">
            {/* Grid background */}
            <div className="absolute inset-0 h-full w-full bg-transparent bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="z-10"
            >
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 leading-tight shadow-cyan-500/20 text-shadow-lg">
                    The Sovereign<br />Immune System
                </h1>
                <p className="text-lg md:text-xl text-cyan-200/80 mb-12 max-w-3xl mx-auto">
                    We don't audit corruption. We make it impossible. Constitutional integrity as code, built to safeguard nations.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <motion.button
                        onClick={() => navigate('/onboarding')}
                        whileHover={{ scale: 1.05, y: -2, boxShadow: '0px 10px 30px rgba(45, 212, 191, 0.4)' }}
                        whileTap={{ scale: 0.98 }}
                        className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-lg shadow-2xl shadow-cyan-500/20 flex items-center gap-3"
                    >
                        <Rocket size={20} />
                        Start 2-Week Free Trial
                    </motion.button>
                    <motion.button
                        onClick={() => window.open('https://calendly.com/sizwe-azora', '_blank')}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-8 py-4 bg-gray-950/70 border border-cyan-500/20 rounded-xl font-bold text-lg text-cyan-200 backdrop-blur-md"
                    >
                        Book a Demo
                    </motion.button>
                </div>
            </motion.div>
        </section>
    );
};
