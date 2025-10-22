/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

export type Lesson = {
  id: string
  title: string
  azrReward: number
}

export type Course = {
  id: string
  title: string
  description: string
  azrReward: number
  professor: string
  lessons: Lesson[]
}

export const courses: Course[] = [
  {
    id: "software-engineering",
    title: "Software Engineering",
    description: "Master coding, algorithms, and system design.",
    azrReward: 20,
    professor: "Dr. Ada Lovelace",
    lessons: [
      { id: "intro", title: "Introduction to Software Engineering", azrReward: 2 },
      { id: "oop", title: "Object-Oriented Programming", azrReward: 3 },
      { id: "algorithms", title: "Algorithms & Data Structures", azrReward: 5 },
      { id: "system-design", title: "System Design Basics", azrReward: 5 },
      { id: "project", title: "Capstone Project", azrReward: 5 },
    ],
  },
  {
    id: "ai-ml",
    title: "Artificial Intelligence & Machine Learning",
    description: "Learn AI concepts, ML algorithms, and practical applications.",
    azrReward: 25,
    professor: "Prof. Alan Turing",
    lessons: [
      { id: "intro", title: "Intro to AI & ML", azrReward: 2 },
      { id: "ml-algorithms", title: "Machine Learning Algorithms", azrReward: 5 },
      { id: "deep-learning", title: "Deep Learning Fundamentals", azrReward: 5 },
      { id: "nlp", title: "Natural Language Processing", azrReward: 5 },
      { id: "project", title: "AI Capstone Project", azrReward: 8 },
    ],
  },
  {
    id: "cloud-devops",
    title: "Cloud Computing & DevOps",
    description: "Deploy, automate, and scale applications in the cloud.",
    azrReward: 18,
    professor: "Dr. Grace Hopper",
    lessons: [
      { id: "cloud-basics", title: "Cloud Fundamentals", azrReward: 3 },
      { id: "devops", title: "DevOps Principles", azrReward: 5 },
      { id: "ci-cd", title: "CI/CD Pipelines", azrReward: 5 },
      { id: "monitoring", title: "Monitoring & Scaling", azrReward: 5 },
    ],
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity",
    description: "Protect systems and data from threats.",
    azrReward: 15,
    professor: "Prof. Kevin Mitnick",
    lessons: [
      { id: "security-basics", title: "Security Fundamentals", azrReward: 3 },
      { id: "network-security", title: "Network Security", azrReward: 4 },
      { id: "app-security", title: "Application Security", azrReward: 4 },
      { id: "incident-response", title: "Incident Response", azrReward: 4 },
    ],
  },
  {
    id: "business-data",
    title: "Business Analytics & Data Science",
    description: "Analyze data to drive business decisions.",
    azrReward: 17,
    professor: "Dr. Fei-Fei Li",
    lessons: [
      { id: "data-basics", title: "Data Science Fundamentals", azrReward: 3 },
      { id: "analytics", title: "Business Analytics", azrReward: 4 },
      { id: "visualization", title: "Data Visualization", azrReward: 5 },
      { id: "project", title: "Analytics Capstone", azrReward: 5 },
    ],
  },
]