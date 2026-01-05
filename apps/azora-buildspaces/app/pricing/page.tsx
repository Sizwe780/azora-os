"use client"

import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { SmartPricingExample } from "@/components/demo/SmartPricingExample"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">Ubuntu-Based Pricing</h1>
            <p className="text-xl text-gray-400">Fair, transparent, and impact-driven pricing for the Azora ecosystem.</p>
          </div>
          
          <SmartPricingExample />

          <div className="mt-16 rounded-xl bg-white/5 p-8 border border-white/10 text-center">
            <h2 className="text-2xl font-bold mb-4">Need a custom plan?</h2>
            <p className="text-gray-400 mb-6">We offer tailored solutions for large organizations and educational institutions.</p>
            <Button asChild>
              <a href="mailto:sales@azora.world">Contact Sales Team at azora.world</a>
            </Button>
          </div>
          
          <div className="mt-8 text-center">
            <Link href="/" className="text-emerald-400 hover:underline"> Back to home</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
