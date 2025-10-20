import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

// Based on the Python API's EmotionalFeedback model
export interface EmotionalFeedback {
  mood: "celebratory" | "encouraging" | "challenging";
  message_type: "success" | "warning" | "growth";
  human_voice_message: string;
}

interface AlertContextType {
  feedback: EmotionalFeedback | null;
  fetchAndSetFeedback: (metrics: PerformanceMetrics) => Promise<void>;
  clearFeedback: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [feedback, setFeedback] = useState<EmotionalFeedback | null>(null);

  const fetchAndSetFeedback = useCallback(async (metrics: PerformanceMetrics) => {
    try {
      // NOTE: In a real deployment, this would be a relative URL like '/api/v1/citizen/emotional-feedback'
      // and you would have a proxy set up in your vite.config.ts to avoid CORS issues.
      const response = await fetch('http://127.0.0.1:8000/api/v1/citizen/emotional-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metrics),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch emotional feedback');
      }

      const data: EmotionalFeedback = await response.json();
      setFeedback(data);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      // Set a fallback error message
      setFeedback({
        mood: 'challenging',
        message_type: 'warning',
        human_voice_message: 'Could not connect to the Emotional Feedback Engine. Please check your connection.',
      });
    }
  }, []);

  const clearFeedback = () => setFeedback(null);

  return (
    <AlertContext.Provider value={{ feedback, fetchAndSetFeedback, clearFeedback }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};