import React from 'react'
import { motion } from 'framer-motion'
import Sidebar from '../ui/Sidebar'
import Header from '../ui/Header'

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Sidebar />
            <div className="ml-64">
                <Header />
                <main className="p-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    )
}

export default MainLayout