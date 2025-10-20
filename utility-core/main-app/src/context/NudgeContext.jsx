/**
 * @file NudgeContext.jsx
 * @author Sizwe Ngwenya
 * @description Provides a global context for the AI to "nudge" the user with contextual guidance.
 */
import React, { createContext, useState, useContext } from 'react';

const NudgeContext = createContext();

export const useNudge = () => useContext(NudgeContext);

export const NudgeProvider = ({ children }) => {
  const [nudge, setNudge] = useState(null);

  const showNudge = (message, duration = 5000) => {
    setNudge(message);
    setTimeout(() => setNudge(null), duration);
  };

  const value = { nudge, showNudge };

  return (
    <NudgeContext.Provider value={value}>
      {children}
    </NudgeContext.Provider>
  );
};