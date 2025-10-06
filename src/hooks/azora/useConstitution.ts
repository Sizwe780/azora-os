// Minimal stub for useConstitution hook.
// Fill in with actual logic later if needed.

import { useState } from "react";

export function useConstitution() {
  // Example state and dummy data
  const [constitution, setConstitution] = useState<string>("No constitution loaded.");

  // Add real logic here
  return {
    constitution,
    setConstitution,
  };
}