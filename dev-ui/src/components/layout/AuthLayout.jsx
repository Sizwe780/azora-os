import React from 'react'
import { motion } from 'framer-motion'

const AuthLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md"
            >
                <div className="bg-card border border-border rounded-lg shadow-lg p-8">
                    {children}
                </div>
            </motion.div>
        </div>
    )
}

export default AuthLayout