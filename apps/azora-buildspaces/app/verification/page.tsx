"use client"
import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import {
  Shield,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  GraduationCap,
  Building,
  Users,
  MapPin,
  CreditCard,
  IdCard
} from "lucide-react"
import { useState } from "react"

export default function VerificationPage() {
  const [selectedVerification, setSelectedVerification] = useState<string | null>(null)
  const [documents, setDocuments] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submissionId, setSubmissionId] = useState<string | null>(null)

  const verificationTypes = [
    {
      id: 'student',
      title: 'Student Verification',
      description: 'Get 50% discount with valid student status',
      icon: GraduationCap,
      color: 'emerald',
      requirements: [
        'Valid student ID card',
        'Current enrollment verification letter',
        'Official transcript or class schedule'
      ],
      discount: '50%',
      processingTime: '24 hours'
    },
    {
      id: 'educator',
      title: 'Educator Verification',
      description: 'Get 40% discount for teaching professionals',
      icon: Users,
      color: 'blue',
      requirements: [
        'Valid teaching certificate or license',
        'Employment verification letter from institution',
        'Professional development documentation'
      ],
      discount: '40%',
      processingTime: '24 hours'
    },
    {
      id: 'nonprofit',
      title: 'Non-Profit Verification',
      description: 'Get 40% discount for registered non-profits',
      icon: Building,
      color: 'purple',
      requirements: [
        '501(c)(3) determination letter (US) or equivalent',
        'Organization registration documents',
        'Annual report or financial statements'
      ],
      discount: '40%',
      processingTime: '48 hours'
    },
    {
      id: 'income_proof',
      title: 'Income Verification',
      description: 'Get additional discount based on income level',
      icon: CreditCard,
      color: 'cyan',
      requirements: [
        'Recent pay stubs (last 3 months)',
        'Bank statements (last 3 months)',
        'Employment verification letter'
      ],
      discount: 'Up to 25%',
      processingTime: '48 hours'
    },
    {
      id: 'address_proof',
      title: 'Address Verification',
      description: 'Verify your location for geographic discounts',
      icon: MapPin,
      color: 'amber',
      requirements: [
        'Utility bill (electricity, gas, water)',
        'Bank statement with address',
        'Government-issued correspondence'
      ],
      discount: 'Up to 15%',
      processingTime: '24 hours'
    },
    {
      id: 'government_id',
      title: 'Government ID',
      description: 'Additional verification for security',
      icon: IdCard,
      color: 'rose',
      requirements: [
        'Valid passport or national ID card',
        'Driver\'s license (if available)',
        'Government-issued residency permit'
      ],
      discount: 'Up to 10%',
      processingTime: '24 hours'
    }
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setDocuments(prev => [...prev, ...files])
  }

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!selectedVerification || documents.length === 0) return

    setSubmitting(true)
    try {
      const formData = new FormData()
      documents.forEach((doc, index) => {
        formData.append(`document_${index}`, doc)
      })

      const response = await fetch('/api/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user123', // In production, get from auth session
          verificationType: selectedVerification,
          documents: documents.map(doc => ({
            name: doc.name,
            size: doc.size,
            type: doc.type
          }))
        })
      })

      const data = await response.json()

      if (data.success) {
        setSubmitted(true)
        setSubmissionId(data.data.submissionId)
      }
    } catch (error) {
      console.error('Verification submission failed:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted && submissionId) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-white">
        <Navbar />
        <main className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-8">
              <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-4">Verification Submitted!</h1>
              <p className="text-gray-400">
                Your verification has been submitted successfully. We'll review your documents and notify you within 24-48 hours.
              </p>
            </div>

            <Card className="bg-white/[0.02] border-white/[0.06] mb-8">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="h-5 w-5 text-yellow-400" />
                  <span className="font-semibold">Submission ID: {submissionId}</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Keep this ID for reference. You can check the status of your verification using this ID.
                </p>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-center">
              <Link href="/pricing">
                <Button variant="outline" className="border-white/20 hover:bg-white/5">
                  Back to Pricing
                </Button>
              </Link>
              <Button className="bg-emerald-500 hover:bg-emerald-600">
                Check Verification Status
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-4 py-2 mb-6">
              <Shield className="h-4 w-4 mr-2" />
              Constitutional Verification
            </Badge>
            <h1 className="text-5xl font-bold mb-6">
              Apply for <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Additional Discounts</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Verify your status to unlock additional discounts on Constitutional AI development tools. All information is processed securely and confidentially.
            </p>
          </div>

          {/* Verification Types */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {verificationTypes.map((type) => (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all duration-300 ${selectedVerification === type.id
                    ? 'border-emerald-500/30 bg-emerald-500/[0.04] shadow-lg shadow-emerald-500/5'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
                  }`}
                onClick={() => setSelectedVerification(type.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <type.icon className={`h-6 w-6 text-${type.color}-400`} />
                    <CardTitle className="text-lg">{type.title}</CardTitle>
                  </div>
                  <p className="text-gray-400 text-sm">{type.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Discount:</span>
                      <span className="text-emerald-400 font-semibold">{type.discount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Processing:</span>
                      <span className="text-cyan-400">{type.processingTime}</span>
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-xs text-gray-500 mb-2">Required Documents:</p>
                      <ul className="text-xs text-gray-400 space-y-1">
                        {type.requirements.slice(0, 2).map((req, index) => (
                          <li key={index}>• {req}</li>
                        ))}
                        {type.requirements.length > 2 && (
                          <li className="text-emerald-400">• +{type.requirements.length - 2} more</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Document Upload */}
          {selectedVerification && (
            <Card className="bg-white/[0.02] border-white/[0.06] mb-8 transition-all duration-300 hover:border-white/[0.12]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-emerald-400" />
                  Upload Documents
                </CardTitle>
                <p className="text-gray-400">
                  Upload clear, high-quality photos or scans of your documents. Accepted formats: JPG, PNG, PDF (max 10MB each).
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="documents" className="text-sm font-medium">
                    Select Documents
                  </Label>
                  <Input
                    id="documents"
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileUpload}
                    className="mt-2"
                  />
                </div>

                {documents.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Uploaded Documents ({documents.length})</h4>
                    <div className="space-y-2">
                      {documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between bg-black/20 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">{doc.name}</p>
                              <p className="text-xs text-gray-400">
                                {(doc.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeDocument(index)}
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-yellow-400 font-medium mb-1">Important Notes:</p>
                      <ul className="text-yellow-300/80 space-y-1">
                        <li>• All documents must be clearly readable</li>
                        <li>• Personal information will be kept confidential</li>
                        <li>• False information may result in account suspension</li>
                        <li>• Verification is required for geographic discounts</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || documents.length === 0}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    {submitting ? 'Submitting...' : 'Submit for Verification'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedVerification(null)}
                    className="border-white/20 hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Notice */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-2xl p-8 border border-emerald-500/20 text-center">
            <Shield className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Your Privacy is Protected</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              All verification documents are processed securely and encrypted. We never share your personal information with third parties.
              Documents are automatically deleted after verification unless you choose to keep them for future use.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
