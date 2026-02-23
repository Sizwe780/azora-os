"use client"

import { useState, useEffect, useCallback } from 'react'

interface UseVoiceReturn {
    isListening: boolean
    transcript: string
    startListening: () => void
    stopListening: () => void
    resetTranscript: () => void
    isSupported: boolean
}

export function useVoice(): UseVoiceReturn {
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [isSupported, setIsSupported] = useState(false)
    const [recognition, setRecognition] = useState<any | null>(null)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const globalWin = window as unknown as { webkitSpeechRecognition?: { new(): any } }
            if (globalWin.webkitSpeechRecognition) {
                const RecognitionClass = globalWin.webkitSpeechRecognition
                const recognitionInstance = new RecognitionClass()
                recognitionInstance.continuous = true
                recognitionInstance.interimResults = true
                recognitionInstance.lang = 'en-US'
                const raf = requestAnimationFrame(() => {
                    setIsSupported(true)
                    setRecognition(recognitionInstance)
                })

            recognitionInstance.onresult = (event: any) => {
                const results = event.results as SpeechRecognitionResultList
                for (let i = event.resultIndex; i < results.length; i++) {
                    const transcriptPart = results[i][0].transcript
                    if (results[i].isFinal) {
                        setTranscript((prev) => prev + transcriptPart + ' ')
                    }
                }
            }

            recognitionInstance.onend = () => {
                setIsListening(false)
            }

            return () => {
                cancelAnimationFrame(raf)
                try {
                    // cleanup
                    recognitionInstance.onresult = null as unknown as (event: any) => void
                    recognitionInstance.onend = null as unknown as () => void
                    recognitionInstance.stop()
                } catch (e) {
                    // ignore
                }
                setRecognition(null)
            }
            }
        }
    }, [])

    const startListening = useCallback(() => {
        if (recognition && !isListening) {
            try {
                recognition.start()
                setIsListening(true)
            } catch (error) {
                console.error("Voice recognition start error:", error)
            }
        }
    }, [recognition, isListening])

    const stopListening = useCallback(() => {
        if (recognition && isListening) {
            recognition.stop()
            setIsListening(false)
        }
    }, [recognition, isListening])

    const resetTranscript = useCallback(() => {
        setTranscript('')
    }, [])

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        resetTranscript,
        isSupported
    }
}
