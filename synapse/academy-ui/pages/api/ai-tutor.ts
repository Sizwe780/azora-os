import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  const { question, module, professor } = req.body
  // Simulate teaching and Q&A
  if (question?.toLowerCase().includes("teach me")) {
    res.status(200).json({
      answer: `(${professor}, AI Professor for ${module}): Let's break down ${module} step by step.\n\n1. Introduction: What is ${module}?\n2. Key Concepts explained simply.\n3. Real-world examples.\n4. Practice problems.\n5. Summary and next steps.\n\nAsk me about any step for more details!`
    })
  } else {
    res.status(200).json({
      answer: `(${professor}, AI Professor for ${module}): Here's a simple explanation for "${question}". [Simulated response]`
    })
  }
}