import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { getFoundersPageData } from '../features/founders/mockData';
import StatCard from '../components/founders/StatCard';
import FounderCard from '../components/founders/FounderCard';
import Milestone from '../components/founders/Milestone';

const FoundersPage = () => {
  const { founders, statCards } = getFoundersPageData();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <>
      <Helmet>
        <title>The Founders | Azora</title>
      </Helmet>
      <div className="p-4 sm:p-6 lg:p-8 text-white min-h-screen bg-gray-950">
        <div className="absolute inset-0 -z-10 h-full w-full bg-gray-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute top-0 left-0 -z-10 h-1/3 w-full bg-gradient-to-b from-purple-500/20 to-transparent"></div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-white tracking-tight">Azora World Founders</h1>
          <p className="text-lg text-cyan-200/80">The architects of Africa&apos;s auditable, transparent, and trusted industrial future.</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statCards.map(card => <StatCard key={card.id} {...card} color={card.color as 'cyan' | 'purple' | 'green' | 'yellow'} />)}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {founders.map((founder) => (
            <FounderCard key={founder.id} founder={founder} />
          ))}
        </motion.div>

        <Milestone />
      </div>
    </>
  );
};

export default FoundersPage;