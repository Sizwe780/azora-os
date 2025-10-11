import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Shield, Globe, Zap, LineChart, Lock, Users, Rocket } from 'lucide-react';

import { Hero } from '../components/landing/Hero';
import { FeatureCard } from '../components/landing/FeatureCard';
import { PhaseCard } from '../components/landing/PhaseCard';
import { PricingCard } from '../components/landing/PricingCard';
import { Footer } from '../components/landing/Footer';

const AnimatedBackground = () => (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
            className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
            animate={{ x: [-100, '100vw'], y: [0, '100vh'], rotate: [0, 180], scale: [1, 1.5, 1] }}
            transition={{ duration: 40, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
        />
        <motion.div
            className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"
            animate={{ x: ['100vw', -100], y: ['100vh', 0], rotate: [0, -180], scale: [1, 1.2, 1] }}
            transition={{ duration: 50, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
        />
    </div>
);

const FinalCTA = () => {
    const navigate = useNavigate();
    return (
        <section className="py-32">
            <div className="max-w-4xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                >
                    <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-yellow-400">
                        Ready to Make Corruption Impossible?
                    </h2>
                    <p className="text-xl text-gray-300 mb-12">
                        Join the sovereign immune system. Start your free trial today.
                    </p>
                    <motion.button
                        onClick={() => navigate('/onboarding')}
                        whileHover={{ scale: 1.05, boxShadow: '0px 0px 40px rgba(45, 212, 191, 0.6)' }}
                        whileTap={{ scale: 0.95 }}
                        className="px-12 py-5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-bold text-2xl shadow-2xl shadow-cyan-500/30 flex items-center gap-3 mx-auto"
                    >
                        <Rocket />
                        Launch Free Trial
                    </motion.button>
                </motion.div>
            </div>
        </section>
    );
}


export default function LandingPage() {
  return (
    <>
    <Helmet>
        <title>Azora OS | The Sovereign Immune System</title>
        <meta name="description" content="We don't audit corruption. We make it impossible. Constitutional integrity as code, built to safeguard nations." />
    </Helmet>
    <div className="bg-gray-950 text-white overflow-x-hidden">
        <AnimatedBackground />

        <div className="relative z-10 px-6">
            <Hero />

            {/* The Solution */}
            <section className="py-32">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">The Azora Solution</h2>
                        <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                            We built the world's first Sovereign Immune System. Not compliance software. Constitutional law as code. Rules that cannot be broken.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard icon={Lock} title="Immutable Transparency" description="Every transaction is blockchain-anchored. History cannot be rewritten." color="cyan" />
                        <FeatureCard icon={Shield} title="Compliance as Default" description="The system prevents rule-breaking. Humans don't have to enforce it." color="purple" />
                        <FeatureCard icon={Zap} title="Real-Time Crime Detection" description="AI flags bid-rigging, collusion, and kickbacks in real-time." color="yellow" />
                        <FeatureCard icon={LineChart} title="Accident Prevention" description="Predictive twins simulate failures before they happen in critical infrastructure." color="green" />
                        <FeatureCard icon={Users} title="Citizen Federation" description="Citizens and employees become the immune system, earning reputation for oversight." color="blue" />
                        <FeatureCard icon={Globe} title="Sovereign Orchestration" description="Nations federate securely, enabling cross-border compliance without losing sovereignty." color="pink" />
                    </div>
                </div>
            </section>

            {/* 4-Phase Vision */}
            <section className="py-32">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">The 4-Phase Vision</h2>
                        <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                            From R90M to R50B+ in 10 years. This is how we build infrastructure for civilization, one phase at a time.
                        </p>
                    </motion.div>

                    <div className="space-y-8">
                        <PhaseCard index={0} phase="Phase 1" timeline="0-9 Months" title="Procurement Corruption" description="Eradicate corruption in government tenders and corporate supply chains." revenue="R90M ARR" color="from-cyan-500 to-blue-500" />
                        <PhaseCard index={1} phase="Phase 2" timeline="9-18 Months" title="Accident Prevention" description="Predictive twins for aviation, energy, and industrial safety." revenue="R450M ARR" color="from-purple-500 to-pink-500" />
                        <PhaseCard index={2} phase="Phase 3" timeline="18-36 Months" title="Citizen Federation" description="10M citizens with Azora Wallet and reputation credits." revenue="R13.5B ARR" color="from-yellow-500 to-orange-500" />
                        <PhaseCard index={3} phase="Phase 4" timeline="3-5 Years" title="Global Orchestration" description="Nations federate. Cross-border compliance. Sovereign protocol." revenue="R50B+ ARR" color="from-green-500 to-teal-500" />
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-32">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Special Launch Offer</h2>
                        <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                            Start your 2-week free trial today. Then get 75% off for 3 months. No commitment.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                        <PricingCard
                            title="Trial"
                            period="14 days free"
                            price="R0"
                            features={["Full system access", "Unlimited users", "No credit card required"]}
                        />
                        <PricingCard
                            title="Promo Rate"
                            period="Months 1-3 after trial"
                            price="R42K/mo"
                            features={["Everything in trial", "Priority support", "Blockchain anchoring", "AI fraud detection"]}
                            bestValue={true}
                        />
                        <PricingCard
                            title="Standard"
                            period="Month 4 onwards"
                            price="R166K/mo"
                            features={["Everything in promo", "24/7 support", "Custom integrations", "Dedicated account manager"]}
                        />
                    </div>
                </div>
            </section>

            <FinalCTA />

            <Footer />
        </div>
    </div>
    </>
  );
}
