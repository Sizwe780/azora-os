import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceControl = ({ onCommand }: { onCommand: (command: string) => void }) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();
  const [isListening, setIsListening] = useState(listening);

  useEffect(() => {
    setIsListening(listening);
  }, [listening]);

  useEffect(() => {
    if (transcript) {
      onCommand(transcript);
    }
  }, [transcript, onCommand]);

  const handleToggleListen = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <div className="text-xs text-red-400">Speech recognition not supported</div>;
  }

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleToggleListen}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-colors ${
          isListening ? 'bg-red-500/80 text-white' : 'bg-cyan-500/80 text-white'
        }`}
      >
        {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
      </motion.button>
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-20 right-0 w-64 bg-gray-950/80 backdrop-blur-md border border-cyan-500/20 rounded-lg p-4 text-white shadow-2xl"
          >
            <p className="text-sm text-cyan-200/80">Transcript:</p>
            <p className="mt-2 text-lg font-medium">{transcript}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceControl;
