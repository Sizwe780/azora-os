import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { ClipboardCheck, Globe, Shield, FileText, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function CompliancePage() {
  const certifications = [
    { name: "SOC 2 Type II", status: "Compliant", description: "Rigorous auditing of security, availability, and confidentiality." },
    { name: "GDPR", status: "Compliant", description: "Full adherence to EU data protection and privacy regulations." },
    { name: "HIPAA", status: "Ready", description: "Infrastructure configured for healthcare data security standards." },
    { name: "ISO 27001", status: "In Progress", description: "International standard for information security management." }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              Compliance & Governance
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Azora is built to meet the most demanding regulatory requirements, 
              providing a secure foundation for enterprise and government AI deployments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {certifications.map((cert) => (
              <div key={cert.name} className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
                <div className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold">{cert.name}</h3>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-400 border border-emerald-400/30">
                      {cert.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{cert.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-12 mb-16">
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Globe className="h-6 w-6 text-emerald-400" />
                <h2 className="text-2xl font-bold">Global Data Residency</h2>
              </div>
              <p className="text-gray-400 leading-relaxed">
                We offer flexible data residency options, allowing you to store and process 
                data in specific regions to comply with local laws and regulations. 
                Our distributed infrastructure supports deployments in the US, EU, and Asia-Pacific.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-emerald-400" />
                <h2 className="text-2xl font-bold">Constitutional Auditing</h2>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Every agent interaction is logged and can be audited against your 
                internal compliance policies. Our Constitutional AI layer provides 
                automated enforcement of governance rules.
              </p>
            </section>

            <section className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-6 w-6 text-emerald-400" />
                <h2 className="text-xl font-bold">Compliance Documentation</h2>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                Need our latest SOC 2 report or a Data Processing Agreement (DPA)? 
                Our compliance team is ready to assist with your due diligence process.
              </p>
              <Button variant="outline" asChild>
                <a href="mailto:compliance@azora.world">Request Documentation</a>
              </Button>
            </section>
          </div>

          <div className="mt-12 text-center">
            <Link href="/security" className="text-emerald-400 hover:underline">View Security Overview</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
