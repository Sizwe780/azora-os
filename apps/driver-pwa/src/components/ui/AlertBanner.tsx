import React from 'react';
import { useAlert } from '../../context/AlertProvider';

export function AlertBanner() {
  const { feedback, clearFeedback } = useAlert();

  if (!feedback) {
    return null;
  }

  const moodColors = {
    celebratory: 'bg-green-500 border-green-700',
    encouraging: 'bg-blue-500 border-blue-700',
    challenging: 'bg-yellow-500 border-yellow-700 text-black',
  };

  return (
    <div 
      className={`fixed top-5 right-5 max-w-sm p-4 rounded-lg shadow-lg text-white border-2 ${moodColors[feedback.mood]} cursor-pointer z-50`}
      onClick={clearFeedback}
    >
      <p className="font-bold">{feedback.mood.charAt(0).toUpperCase() + feedback.mood.slice(1)}!</p>
      <p>{feedback.human_voice_message}</p>
    </div>
  );
}