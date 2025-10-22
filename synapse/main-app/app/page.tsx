import { Metadata } from "next"
import { HeroSection } from "@/components/sections/hero-section"
import { ValueProposition } from "@/components/sections/value-proposition"
import { EcosystemSection } from "@/components/sections/ecosystem-section"
import { CommandCenterSection } from "@/components/sections/command-center-section"
import { TrustSection } from "@/components/sections/trust-section"
import { CTASection } from "@/components/sections/cta-section"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Azora OS - Africa's First Full Software Infrastructure | Sizwe Ngwenya",
  description: "Built in South Africa by Sizwe Ngwenya, Founder & CEO. Experience African intelligence through AI-powered compliance, decentralized finance, and enterprise-grade cloud solutions.",
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <ValueProposition />
      <EcosystemSection />
      <CommandCenterSection />
      <TrustSection />
      <CTASection />
      <Footer />
    </div>
  )
}