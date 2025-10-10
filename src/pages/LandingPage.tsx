import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaGlobe, FaBolt, FaChartLine, FaLock, FaUsers, FaRocket, FaCheckCircle } from 'react-icons/fa';

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Power Beams Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute top-[-50%] left-[-10%] w-[800px] h-[800px] bg-cyan-500/20 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-[-30%] right-[-10%] w-[900px] h-[900px] bg-purple-600/20 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute top-[40%] left-[30%] w-[700px] h-[700px] bg-blue-500/15 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className="absolute top-[10%] right-[20%] w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-[90px]"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
        {/* Energy Beams */}
        <motion.div
          className="absolute top-0 left-[20%] w-[2px] h-full bg-gradient-to-b from-cyan-500/50 via-transparent to-transparent"
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scaleY: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-0 right-[30%] w-[2px] h-full bg-gradient-to-b from-purple-500/50 via-transparent to-transparent"
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scaleY: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute top-0 left-[60%] w-[2px] h-full bg-gradient-to-b from-blue-500/40 via-transparent to-transparent"
          animate={{
            opacity: [0.2, 0.6, 0.2],
            scaleY: [1, 1.15, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-6xl md:text-8xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-yellow-400">
                THE SOVEREIGN<br />IMMUNE SYSTEM
              </h1>
              <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto">
                We don't audit corruption. We make it impossible.
              </p>
              <p className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto">
                Constitutional integrity as code. Built in South Africa by Sizwe Ngwenya and team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  onClick={() => navigate('/dashboard')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full font-bold text-lg shadow-2xl shadow-cyan-500/50"
                >
                  Start 2-Week Free Trial
                </motion.button>
                <motion.button
                  onClick={() => window.open('https://calendly.com/sizwe-azora', '_blank')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full font-bold text-lg"
                >
                  Book a Demo
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-20 px-6 bg-white/5 backdrop-blur-xl border-y border-white/10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <p className="text-white/60 text-sm uppercase tracking-wider mb-4">Trusted By</p>
              <div className="flex flex-wrap justify-center gap-8 items-center">
                <div className="text-2xl font-bold text-white/40">Retail Partners</div>
                <div className="text-2xl font-bold text-white/40">Government Departments</div>
                <div className="text-2xl font-bold text-white/40">Mining Operations</div>
                <div className="text-2xl font-bold text-white/40">Corporate SA</div>
              </div>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl font-black text-cyan-400 mb-2">R90M+</div>
                <p className="text-white/60">Year 1 Revenue Target</p>
              </div>
              <div>
                <div className="text-4xl font-black text-purple-400 mb-2">R500M+</div>
                <p className="text-white/60">Corruption Prevented</p>
              </div>
              <div>
                <div className="text-4xl font-black text-yellow-400 mb-2">99.9%</div>
                <p className="text-white/60">System Uptime SLA</p>
              </div>
            </div>
          </div>
        </section>

        {/* The Problem */}
        <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
                The Problem
              </h2>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Corruption costs South Africa R100 billion every year. Audits happen after the money is gone.
                Compliance is a checkbox. Accidents are investigated after lives are lost.
              </p>
            </motion.div>
          </div>
        </section>

        {/* The Solution */}
        <section className="py-32 px-6 bg-white/5 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                The Azora Solution
              </h2>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                We built the world's first Sovereign Immune System. Not compliance software.
                Constitutional law as code. Rules that cannot be broken.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <FaLock className="text-5xl text-cyan-400" />,
                  title: "Immutable Transparency",
                  description: "Every transaction is blockchain-anchored. History cannot be rewritten."
                },
                {
                  icon: <FaShieldAlt className="text-5xl text-purple-400" />,
                  title: "Compliance as Default",
                  description: "The system prevents rule-breaking. Humans don't have to enforce it."
                },
                {
                  icon: <FaBolt className="text-5xl text-yellow-400" />,
                  title: "Crime Detection",
                  description: "AI flags bid-rigging, collusion, and kickbacks in real-time."
                },
                {
                  icon: <FaChartLine className="text-5xl text-green-400" />,
                  title: "Accident Prevention",
                  description: "Predictive twins simulate failures before they happen."
                },
                {
                  icon: <FaUsers className="text-5xl text-blue-400" />,
                  title: "Citizen Federation",
                  description: "Citizens and employees become the immune system."
                },
                {
                  icon: <FaGlobe className="text-5xl text-pink-400" />,
                  title: "Sovereign Orchestration",
                  description: "Nations federate without losing sovereignty."
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-white/70">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 4-Phase Rollout */}
        <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl md:text-6xl font-black mb-6">
                The 4-Phase Vision
              </h2>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                From R90M to R50B+ in 10 years. This is how we build infrastructure for civilization.
              </p>
            </motion.div>

            <div className="space-y-8">
              {[
                {
                  phase: "Phase 1",
                  timeline: "0-9 Months",
                  title: "Procurement Corruption",
                  description: "Eradicate corruption in government tenders and corporate supply chains.",
                  revenue: "R90M ARR",
                  color: "from-cyan-500 to-blue-500"
                },
                {
                  phase: "Phase 2",
                  timeline: "9-18 Months",
                  title: "Accident Prevention",
                  description: "Predictive twins for aviation, energy, and industrial safety.",
                  revenue: "R450M ARR",
                  color: "from-purple-500 to-pink-500"
                },
                {
                  phase: "Phase 3",
                  timeline: "18-36 Months",
                  title: "Citizen Federation",
                  description: "10M citizens with Azora Wallet and reputation credits.",
                  revenue: "R13.5B ARR",
                  color: "from-yellow-500 to-orange-500"
                },
                {
                  phase: "Phase 4",
                  timeline: "3-5 Years",
                  title: "Global Orchestration",
                  description: "Nations federate. Cross-border compliance. Sovereign protocol.",
                  revenue: "R50B+ ARR",
                  color: "from-green-500 to-teal-500"
                }
              ].map((phase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className={`inline-block px-4 py-2 bg-gradient-to-r ${phase.color} rounded-full text-white font-bold mb-4`}>
                        {phase.phase} • {phase.timeline}
                      </div>
                      <h3 className="text-3xl font-black mb-3">{phase.title}</h3>
                      <p className="text-white/70 mb-4">{phase.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-black text-white mb-1">{phase.revenue}</div>
                      <div className="text-white/60 text-sm">Revenue Target</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-32 px-6 bg-white/5 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl md:text-6xl font-black mb-6">
                Special Launch Offer
              </h2>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Start your 2-week free trial today. Then get 75% off for 3 months.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-8 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl"
              >
                <h3 className="text-2xl font-bold mb-4">Trial Period</h3>
                <div className="text-5xl font-black mb-2">R0</div>
                <p className="text-white/60 mb-6">14 days free</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-400" />
                    <span>Full system access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-400" />
                    <span>Unlimited users</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-400" />
                    <span>No credit card required</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="p-8 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 backdrop-blur-xl border-2 border-cyan-400 rounded-2xl relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-400 text-black text-sm font-bold rounded-full">
                  BEST VALUE
                </div>
                <h3 className="text-2xl font-bold mb-4">Promo Rate</h3>
                <div className="text-5xl font-black mb-2">R42K</div>
                <p className="text-white/60 mb-2">per month (75% off)</p>
                <p className="text-sm text-cyan-400 mb-6">Months 1-3 after trial</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="text-cyan-400" />
                    <span>Everything in trial</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="text-cyan-400" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="text-cyan-400" />
                    <span>Blockchain anchoring</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="text-cyan-400" />
                    <span>AI fraud detection</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="p-8 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl"
              >
                <h3 className="text-2xl font-bold mb-4">Standard</h3>
                <div className="text-5xl font-black mb-2">R166K</div>
                <p className="text-white/60 mb-2">per month</p>
                <p className="text-sm text-white/40 mb-6">Month 4 onwards</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="text-purple-400" />
                    <span>Everything in promo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="text-purple-400" />
                    <span>24/7 support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="text-purple-400" />
                    <span>Custom integrations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="text-purple-400" />
                    <span>Dedicated account manager</span>
                  </li>
                </ul>
              </motion.div>
            </div>

            <div className="text-center mt-12">
              <motion.button
                onClick={() => navigate('/dashboard')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full font-bold text-xl shadow-2xl shadow-cyan-500/50"
              >
                Start Your Free Trial Now
              </motion.button>
              <p className="text-white/60 mt-4 text-sm">
                No credit card required. Cancel anytime. ROI proven in first month.
              </p>
            </div>
          </div>
        </section>

        {/* Built in South Africa */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-6xl font-black mb-8">
                🇿🇦 Built in South Africa
              </h2>
              <p className="text-2xl text-white/80 mb-6">
                By Sizwe Ngwenya and the founding team.
              </p>
              <p className="text-xl text-white/60 mb-12">
                Not imported software. Not adapted for Africa. Built here. For here. From the ground up.
                With the power to scale globally.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  onClick={() => navigate('/founders')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full font-bold text-lg"
                >
                  Meet the Founders
                </motion.button>
                <motion.button
                  onClick={() => window.open('mailto:sizwe.ngwenya@azora.world', '_blank')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full font-bold text-lg"
                >
                  Contact Us
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6 bg-gradient-to-br from-cyan-900/30 via-purple-900/30 to-blue-900/30 backdrop-blur-xl border-t border-white/10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-6xl md:text-7xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-yellow-400">
                Ready to Make<br />Corruption Impossible?
              </h2>
              <p className="text-2xl text-white/80 mb-12">
                Join the sovereign immune system. Start your free trial today.
              </p>
              <motion.button
                onClick={() => navigate('/dashboard')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-16 py-6 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full font-black text-2xl shadow-2xl shadow-cyan-500/50"
              >
                <FaRocket className="inline mr-3" />
                Launch Now
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 bg-black/50 backdrop-blur-xl border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <div className="text-2xl font-black mb-2">AZORA OS</div>
                <p className="text-white/60 text-sm">The Sovereign Immune System</p>
              </div>
              <div className="flex gap-8 text-sm">
                <button onClick={() => navigate('/founders')} className="text-white/60 hover:text-white transition-colors">
                  Founders
                </button>
                <a href="mailto:sizwe.ngwenya@azora.world" className="text-white/60 hover:text-white transition-colors">
                  Contact
                </a>
                <a href="https://azora.world" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                  Website
                </a>
              </div>
            </div>
            <div className="text-center mt-8 text-white/40 text-sm">
              © 2025 Azora World (Pty) Ltd. Built with ❤️ in South Africa 🇿🇦
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
