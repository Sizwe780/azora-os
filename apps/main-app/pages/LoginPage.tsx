import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const AuroraBackground = () => (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <motion.div
            className="absolute top-[-30%] left-[-30%] w-[60vw] h-[60vw] bg-cyan-500/10 rounded-full blur-[200px]"
            animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
                x: ['-20%', '20%', '-20%'],
            }}
            transition={{
                duration: 25,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        />
        <motion.div
            className="absolute bottom-[-30%] right-[-30%] w-[60vw] h-[60vw] bg-purple-600/10 rounded-full blur-[200px]"
            animate={{
                scale: [1, 1.4, 1],
                opacity: [0.2, 0.5, 0.2],
                y: ['20%', '-20%', '20%'],
            }}
            transition={{
                duration: 30,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 5
            }}
        />
    </div>
);

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd have validation and API calls here.
    // For this demo, we'll just simulate a successful login.
    sessionStorage.setItem('azora-auth', 'true');
    navigate('/');
  };

  return (
    <>
    <Helmet>
        <title>Login | Azora OS</title>
        <meta name="description" content="Sign in to access the Azora Sovereign OS." />
    </Helmet>
    <div className="relative min-h-screen flex items-center justify-center bg-gray-950 p-4 overflow-hidden">
        <AuroraBackground />

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-gray-900/60 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-2xl shadow-2xl shadow-black/20">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <img src="/azora-logo.svg" alt="Azora OS" className="w-28 drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]" />
          </motion.div>
          <h1 className="text-3xl font-bold text-center text-white mb-2">Welcome Back</h1>
          <p className="text-center text-gray-400 mb-8">Sign in to access the Sovereign OS.</p>
          
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
                <input
                type="email"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                placeholder="pilot@azora.world"
                defaultValue="pilot@azora.world"
                required
                />
            </div>
            <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
                <input
                type="password"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                placeholder="••••••••"
                defaultValue="password"
                required
                />
            </div>
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0px 0px 30px rgba(45, 212, 191, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-semibold text-lg shadow-lg shadow-cyan-500/20"
            >
              Sign In
              <ArrowRight className="w-5 h-5 ml-2" />
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <a href="#" className="text-sm text-cyan-400 hover:underline hover:text-cyan-300 transition-colors">
              Forgot your password?
            </a>
          </div>
        </div>
        <p className="text-center text-xs text-gray-600 mt-8">
            © {new Date().getFullYear()} Azora World (Pty) Ltd. All rights reserved.
        </p>
      </motion.div>
    </div>
    </>
  );
}