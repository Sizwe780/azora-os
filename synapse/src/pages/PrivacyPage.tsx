import React from 'react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 mb-6">
                <strong>Last updated:</strong> October 21, 2025
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                <p className="text-gray-700 mb-4">
                  Azora OS (Pty) Ltd ("we," "our," or "us") is committed to protecting your privacy and personal information.
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our
                  platform and services.
                </p>
                <p className="text-gray-700">
                  By using Azora OS, you agree to the collection and use of information in accordance with this policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Personal Information</h3>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Name, email address, and contact information</li>
                  <li>Educational and professional background</li>
                  <li>Wallet addresses and transaction data</li>
                  <li>Course progress and learning analytics</li>
                  <li>Compliance and verification documents</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Usage Data</h3>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>IP address, browser type, and device information</li>
                  <li>Pages visited and time spent on our platform</li>
                  <li>Click patterns and user interactions</li>
                  <li>Performance and error logs</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Provide and maintain our services</li>
                  <li>Process transactions and manage your account</li>
                  <li>Personalize your learning experience</li>
                  <li>Ensure platform security and compliance</li>
                  <li>Communicate with you about our services</li>
                  <li>Analyze usage patterns to improve our platform</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing</h2>
                <p className="text-gray-700 mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent,
                  except in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>With service providers who assist our operations</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and prevent fraud</li>
                  <li>In connection with a business transfer</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. POPIA Compliance</h2>
                <p className="text-gray-700 mb-4">
                  As a South African entity, we comply with the Protection of Personal Information Act (POPIA).
                  This includes:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Obtaining consent for data processing</li>
                  <li>Implementing appropriate security measures</li>
                  <li>Providing data subject rights (access, correction, deletion)</li>
                  <li>Maintaining records of processing activities</li>
                  <li>Reporting data breaches within prescribed timeframes</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Security</h2>
                <p className="text-gray-700">
                  We implement appropriate technical and organizational measures to protect your personal information
                  against unauthorized access, alteration, disclosure, or destruction. This includes encryption,
                  access controls, and regular security assessments.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights</h2>
                <p className="text-gray-700 mb-4">Under POPIA, you have the right to:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your information</li>
                  <li>Object to processing in certain circumstances</li>
                  <li>Request data portability</li>
                  <li>Lodge a complaint with the Information Regulator</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies and Tracking</h2>
                <p className="text-gray-700">
                  We use cookies and similar technologies to enhance your experience, analyze usage patterns,
                  and provide personalized content. You can control cookie preferences through your browser settings.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>
                <p className="text-gray-700">
                  Your information may be transferred to and processed in countries other than South Africa.
                  We ensure appropriate safeguards are in place for such transfers.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
                <p className="text-gray-700">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes
                  by posting the new policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
                <p className="text-gray-700">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700"><strong>Email:</strong> privacy@azora.world</p>
                  <p className="text-gray-700"><strong>Address:</strong> Cape Town, South Africa</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}