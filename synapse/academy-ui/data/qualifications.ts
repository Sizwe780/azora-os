/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

export type ModuleDef = {
  code: string
  title: string
  credits: number
  professor: string
  assessment: string[]
}

export type Qualification = {
  id: string
  title: string
  level: number
  credits: number
  saqaId: string
  description: string
  outcomes: string[]
  modules: ModuleDef[]
  assessmentStructure: { courseworkPercent: number; examPercent: number; capstone?: boolean }
  examEligibility: { externalExamEligible: boolean; howToSitExternalExam: string }
  recognitionNotes: string
  aiProfessor: { name: string; persona: string }
  deliveryModes: string[] // e.g., ["online","blended","in-person"]
  prerequisites?: string[]
}

export const qualifications: Qualification[] = [
  {
    id: "bsc-ai",
    title: "Bachelor of Science: Artificial Intelligence (Unaccredited)",
    level: 7,
    credits: 360,
    saqaId: "AZORA-BSC-AI-001",
    description:
      "Comprehensive undergraduate program covering foundations of AI, ML, data engineering, ethics, and production deployment. Designed to match DHET/SAQA learning outcomes for NQF 7 degrees.",
    outcomes: [
      "Design and implement ML systems",
      "Evaluate models for fairness, robustness and safety",
      "Deploy AI in production with observability and governance",
      "Lead applied AI projects and research"
    ],
    modules: [
      { code: "AI101", title: "Introduction to AI", credits: 20, professor: "Prof. Azora AI", assessment: ["assignments", "midterm", "final exam"] },
      { code: "ML201", title: "Machine Learning Algorithms", credits: 30, professor: "Dr. Model", assessment: ["projects", "final exam"] },
      { code: "DS202", title: "Data Engineering & Pipelines", credits: 20, professor: "Eng. Data", assessment: ["lab work", "project"] },
      { code: "ETH300", title: "AI Ethics & Policy", credits: 10, professor: "Dr. Ethica", assessment: ["essays", "presentation"] },
      { code: "CAP399", title: "AI Capstone Project", credits: 40, professor: "Prof. Azora AI", assessment: ["capstone deliverable", "defense"] }
      // add remaining modules to reach total credits in production dataset
    ],
    assessmentStructure: { courseworkPercent: 60, examPercent: 40, capstone: true },
    examEligibility: {
      externalExamEligible: true,
      howToSitExternalExam:
        "Students can register to sit external university-style final exams via Azora's examination conduit. Azora provides exam centres, invigilation guidelines and mapped assessment matrices to enable third-party exam sittings."
    },
    recognitionNotes:
      "Program mapped to SAQA/DHET outcomes. Full module descriptors, assessment matrices and evidence packs are maintained for audit and future accreditation.",
    aiProfessor: { name: "Prof. Azora AI", persona: "Adaptive, research-led AI professor focusing on practical engineering and ethics." },
    deliveryModes: ["online", "blended"],
    prerequisites: ["Mathematics (Matric level)"]
  },
  {
    id: "dip-ds",
    title: "Diploma: Data Science & Analytics",
    level: 6,
    credits: 240,
    saqaId: "AZORA-DIP-DS-002",
    description: "Practical data science diploma with emphasis on statistical inference, ML, visualization and storytelling.",
    outcomes: [
      "Perform data wrangling and exploratory analysis",
      "Build and validate predictive models",
      "Communicate insights to stakeholders"
    ],
    modules: [
      { code: "DS101", title: "Statistics & Probability", credits: 20, professor: "Dr. Stat", assessment: ["assignments", "exam"] },
      { code: "DS102", title: "Data Wrangling & Visualization", credits: 20, professor: "Ms. Viz", assessment: ["labs", "project"] },
      { code: "ML150", title: "Applied Machine Learning", credits: 30, professor: "Dr. Model", assessment: ["project", "exam"] },
      { code: "PRJ200", title: "Industry Project", credits: 40, professor: "Industry Mentor", assessment: ["project deliverable", "presentation"] }
    ],
    assessmentStructure: { courseworkPercent: 70, examPercent: 30 },
    examEligibility: {
      externalExamEligible: true,
      howToSitExternalExam: "Students may request a proctored external exam; Azora provides exam reports and competency matrices to partner institutions."
    },
    recognitionNotes: "Module descriptors aligned to national unit standards; evidence packs per module.",
    aiProfessor: { name: "Dr. Data AI", persona: "Hands-on, practical data scientist coach." },
    deliveryModes: ["online", "in-person"]
  },
  {
    id: "cert-cloud-devops",
    title: "Certificate: Cloud Architecture & DevOps",
    level: 6,
    credits: 120,
    saqaId: "AZORA-CERT-CLD-003",
    description: "Cloud-native engineering and DevOps best practices for production-ready systems.",
    outcomes: ["Design cloud architectures", "Automate deployments", "Observe and secure systems"],
    modules: [
      { code: "CLD101", title: "Cloud Fundamentals", credits: 20, professor: "Prof. Nimbus AI", assessment: ["labs", "exam"] },
      { code: "CI201", title: "CI/CD & Automation", credits: 30, professor: "Eng. Pipeline", assessment: ["project", "demo"] },
      { code: "SEC220", title: "Cloud Security", credits: 20, professor: "Dr. Secure", assessment: ["case study", "exam"] }
    ],
    assessmentStructure: { courseworkPercent: 60, examPercent: 40 },
    examEligibility: {
      externalExamEligible: false,
      howToSitExternalExam: "Not applicable for this certificate; industry certification routes recommended in addition."
    },
    recognitionNotes: "Mapped to industry competence standards; stack-agnostic approach.",
    aiProfessor: { name: "Prof. Nimbus AI", persona: "Systems-minded cloud practitioner." },
    deliveryModes: ["online", "blended"]
  },
  {
    id: "bach-se",
    title: "Bachelor: Software Engineering",
    level: 7,
    credits: 360,
    saqaId: "AZORA-BSC-SE-004",
    description: "End-to-end software engineering cycle, testing, design, architecture and team-based delivery.",
    outcomes: ["Design systems", "Write robust code", "Lead engineering teams"],
    modules: [
      { code: "SE101", title: "Programming Foundations", credits: 20, professor: "Prof. Code AI", assessment: ["labs", "exam"] },
      { code: "SE201", title: "Software Design & Architecture", credits: 30, professor: "Dr. Arch", assessment: ["project", "exam"] },
      { code: "SE350", title: "Testing & Reliability", credits: 20, professor: "QA Mentor", assessment: ["assignments", "project"] },
      { code: "CAP390", title: "Engineering Capstone", credits: 40, professor: "Prof. Code AI", assessment: ["capstone", "defense"] }
    ],
    assessmentStructure: { courseworkPercent: 65, examPercent: 35, capstone: true },
    examEligibility: { externalExamEligible: true, howToSitExternalExam: "External exam registration via Azora exam conduit with mapped learning outcomes." },
    recognitionNotes: "Full module descriptors and assessment matrices available for audit.",
    aiProfessor: { name: "Prof. Code AI", persona: "Software engineering mentor focused on industry practices." },
    deliveryModes: ["blended", "in-person"]
  },
  {
    id: "cert-cyber",
    title: "Certificate: Cybersecurity & Incident Response",
    level: 6,
    credits: 120,
    saqaId: "AZORA-CERT-CYB-005",
    description: "Focused on defensive security, incident response, and secure architecture.",
    outcomes: ["Detect threats", "Respond to incidents", "Design secure systems"],
    modules: [
      { code: "CYB101", title: "Security Fundamentals", credits: 20, professor: "Dr. Secure", assessment: ["labs", "exam"] },
      { code: "CYB201", title: "Incident Response", credits: 30, professor: "Responder", assessment: ["simulations", "report"] },
      { code: "CYB300", title: "Secure Architecture", credits: 20, professor: "Arch Secure", assessment: ["case study", "project"] }
    ],
    assessmentStructure: { courseworkPercent: 60, examPercent: 40 },
    examEligibility: { externalExamEligible: false, howToSitExternalExam: "Not supported; certificate intended for industry readiness." },
    recognitionNotes: "Mapped to cybersecurity unit standards and industry certifications.",
    aiProfessor: { name: "SecureAI", persona: "Security-focused tutor with attack/defense insights." },
    deliveryModes: ["online", "lab-based"]
  },
  {
    id: "dipl-ux",
    title: "Diploma: Product Design & UX",
    level: 6,
    credits: 240,
    saqaId: "AZORA-DIP-UX-006",
    description: "User-centred design, research, prototyping and evaluation with industry-standard toolchains.",
    outcomes: ["Conduct user research", "Prototype solutions", "Measure usability and impact"],
    modules: [
      { code: "UX101", title: "Design Thinking", credits: 20, professor: "Ms. Designer", assessment: ["project", "portfolio"] },
      { code: "UX201", title: "Interaction Design & Prototyping", credits: 30, professor: "Mr. UX", assessment: ["portfolio", "presentation"] },
      { code: "UX301", title: "Usability Testing", credits: 20, professor: "Dr. Research", assessment: ["lab", "report"] }
    ],
    assessmentStructure: { courseworkPercent: 80, examPercent: 20 },
    examEligibility: { externalExamEligible: false, howToSitExternalExam: "Not typical; assessment uses portfolios for recognition." },
    recognitionNotes: "Portfolio-focused qualification aligned to professional practice standards.",
    aiProfessor: { name: "DesignAI", persona: "Practical product design mentor." },
    deliveryModes: ["blended", "studio"]
  },
  {
    id: "cert-fintech",
    title: "Certificate: Digital Finance & Blockchain",
    level: 6,
    credits: 120,
    saqaId: "AZORA-CERT-FIN-007",
    description: "Foundations of digital payments, blockchain primitives, DeFi and regulatory compliance.",
    outcomes: ["Understand blockchain architectures", "Build secure payment flows", "Navigate regulatory frameworks"],
    modules: [
      { code: "FIN101", title: "Blockchain Fundamentals", credits: 20, professor: "Prof. Chain", assessment: ["assignments", "exam"] },
      { code: "FIN201", title: "Payments & Regulation", credits: 20, professor: "Law AI", assessment: ["case studies", "exam"] }
    ],
    assessmentStructure: { courseworkPercent: 60, examPercent: 40 },
    examEligibility: { externalExamEligible: false, howToSitExternalExam: "Not applicable; industry certification pathways recommended." },
    recognitionNotes: "Designed with compliance mapping for financial services regulators.",
    aiProfessor: { name: "Prof. Chain", persona: "Finance-aware technical instructor." },
    deliveryModes: ["online"]
  },
  {
    id: "dip-iot",
    title: "Diploma: IoT & Embedded Systems",
    level: 6,
    credits: 240,
    saqaId: "AZORA-DIP-IOT-008",
    description: "Hardware-software integration, sensors, edge computing, and secure embedded systems.",
    outcomes: ["Design embedded solutions", "Implement edge analytics", "Ensure device security"],
    modules: [
      { code: "IOT101", title: "Embedded Systems", credits: 30, professor: "Eng. Embed", assessment: ["labs", "project"] },
      { code: "IOT201", title: "Edge Analytics", credits: 20, professor: "Dr. Edge", assessment: ["project", "report"] }
    ],
    assessmentStructure: { courseworkPercent: 70, examPercent: 30 },
    examEligibility: { externalExamEligible: false, howToSitExternalExam: "Not supported; practical competence assessed via labs." },
    recognitionNotes: "Practical skill emphasis; includes lab evidence for audit.",
    aiProfessor: { name: "EdgeAI", persona: "Hardware-aware AI tutor." },
    deliveryModes: ["lab", "in-person"]
  },
  {
    id: "dipl-robotics",
    title: "Diploma: Robotics & Automation",
    level: 7,
    credits: 240,
    saqaId: "AZORA-DIP-ROB-009",
    description: "Robotics, control systems, automation pipelines and real-time systems.",
    outcomes: ["Design control systems", "Integrate robotics sensors", "Deploy automation at scale"],
    modules: [
      { code: "ROB101", title: "Robotics Fundamentals", credits: 30, professor: "Dr. Bot", assessment: ["labs", "project"] },
      { code: "ROB201", title: "Control Systems", credits: 30, professor: "Dr. Control", assessment: ["exam", "project"] }
    ],
    assessmentStructure: { courseworkPercent: 65, examPercent: 35 },
    examEligibility: { externalExamEligible: false, howToSitExternalExam: "Not applicable; assessed via labs and capstone." },
    recognitionNotes: "Mapped to engineering practice outcomes; evidence packs maintained.",
    aiProfessor: { name: "Dr. Bot AI", persona: "Robotics practitioner and researcher." },
    deliveryModes: ["lab", "blended"]
  },
  {
    id: "dipl-edtech",
    title: "Diploma: Education Technology & Digital Pedagogy",
    level: 6,
    credits: 240,
    saqaId: "AZORA-DIP-EDT-010",
    description: "Design and deliver digital learning experiences; assess and certify learners.",
    outcomes: ["Design curricula", "Use AI tutors to support learning", "Assess learners fairly"],
    modules: [
      { code: "EDU101", title: "Learning Theories & Design", credits: 20, professor: "Dr. Pedagogy", assessment: ["essays", "project"] },
      { code: "EDU201", title: "Assessment & Accreditation", credits: 20, professor: "Accred AI", assessment: ["portfolio", "exam"] },
      { code: "EDU301", title: "AI Tutors & Personalisation", credits: 30, professor: "TutorAI", assessment: ["project", "demo"] }
    ],
    assessmentStructure: { courseworkPercent: 75, examPercent: 25 },
    examEligibility: {
      externalExamEligible: true,
      howToSitExternalExam:
        "This qualification provides full exam matrices to enable candidates (even non-enrolled) to sit validated external exams where partnered institutions agree; Azora provides invigilation and evidence packages."
    },
    recognitionNotes: "Designed specifically to enable RPL (Recognition of Prior Learning) and external exam equivalency for non-traditional learners.",
    aiProfessor: { name: "TutorAI", persona: "Educational design and assessment specialist." },
    deliveryModes: ["online", "blended"],
    prerequisites: ["Teaching qualification or portfolio (recommended)"]
  }
]