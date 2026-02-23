"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Sparkles, Code2, Palette, Brain, Terminal, Check } from "lucide-react"

interface OnboardingProps {
  onComplete?: () => void
}

const steps = [
  {
    title: "Welcome to BuildSpaces",
    description: "Your AI-powered development environment is ready. Let's take a quick tour!",
    icon: Sparkles,
    highlight: null,
  },
  {
    title: "Code Chamber",
    description: "Write, edit, and collaborate on code with AI assistance. Use Ctrl+1 to switch here.",
    icon: Code2,
    highlight: "code-chamber",
  },
  {
    title: "Design Studio",
    description: "Create UI designs and convert them to code. Perfect for prototyping.",
    icon: Palette,
    highlight: "design-studio",
  },
  {
    title: "AI Studio",
    description: "Train models, run experiments, and deploy AI solutions.",
    icon: Brain,
    highlight: "ai-studio",
  },
  {
    title: "Command Desk",
    description: "Execute commands, manage deployments, and automate workflows.",
    icon: Terminal,
    highlight: "command-desk",
  },
]

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const CurrentIcon = steps[currentStep].icon

  useEffect(() => {
    const dismissed = localStorage.getItem('buildspaces-onboarding-complete')
    if (!dismissed) {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('buildspaces-onboarding-complete', 'true')
    if (onComplete) setTimeout(onComplete, 300)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleDismiss()
    }
  }

  const handleSkip = () => {
    handleDismiss()
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="max-w-md w-full"
        >
          <Card className="relative bg-[#0d1117] border-white/10 shadow-2xl shadow-emerald-500/5">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-emerald-500/10 w-fit ring-1 ring-emerald-500/20">
                <CurrentIcon className="w-6 h-6 text-emerald-400" />
              </div>
              <CardTitle className="text-xl text-white">{steps[currentStep].title}</CardTitle>
              <CardDescription className="text-base text-gray-400">
                {steps[currentStep].description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Progress Indicator */}
              <div className="flex justify-center gap-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep ? "bg-emerald-400" : "bg-white/10"
                    }`}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="ghost" onClick={handleSkip} className="flex-1 text-gray-400 hover:text-white hover:bg-white/5">
                  Skip Tour
                </Button>
                <Button onClick={handleNext} className="flex-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20">
                  {currentStep === steps.length - 1 ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Get Started
                    </>
                  ) : (
                    "Next"
                  )}
                </Button>
              </div>

              {/* Keyboard Shortcuts Hint */}
              {currentStep > 0 && (
                <div className="text-center text-sm text-gray-500">
                  Pro tip: Use <Badge variant="outline" className="mx-1 border-white/10 text-gray-400">Ctrl+{currentStep}</Badge> to jump to this room
                </div>
              )}
            </CardContent>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-gray-500 hover:text-white hover:bg-white/5"
              onClick={handleSkip}
            >
              <X className="w-4 h-4" />
            </Button>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}