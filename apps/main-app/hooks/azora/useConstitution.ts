// Minimal stub for useConstitution hook.
// Fill in with actual logic later if needed.

import { useMemo, useState } from "react";
import React from "react";
type ConstitutionRule = {
  appliesTo: React.ReactNode | Iterable<React.ReactNode>;
  enforced: unknown;
  id: string;
  title: string;
  description: string;
  enabled: boolean;
};

type ConstitutionLog = {
  triggeredBy: React.ReactNode | Iterable<React.ReactNode>;
  actionTaken: React.ReactNode | Iterable<React.ReactNode>;
  ruleId: string;
  id: string;
  message: string;
  timestamp: string;
};


export function useConstitution() {
  const [constitution, setConstitution] = useState<string>("No constitution loaded.");
  const [rules, setRules] = useState<ConstitutionRule[]>(() => []);
  const [logs, setLogs] = useState<ConstitutionLog[]>(() => []);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const toggle = (ruleId: string, enabled: boolean) => {
    setRules(prev => prev.map(rule => (rule.id === ruleId ? { ...rule, enabled } : rule)));
    setLogs(prev => [
      ...prev,
      {
        id: `${ruleId}-${Date.now()}`,
        ruleId,
        message: `Rule ${ruleId} ${enabled ? "enabled" : "disabled"}`,
        timestamp: new Date().toISOString(),
        triggeredBy: null,
        actionTaken: null,
      },
    ]);
  };

  const api = useMemo(
    () => ({
      constitution,
      setConstitution,
      rules,
      logs,
      status,
      setStatus,
      error,
      setError,
      toggle,
    }),
    [constitution, rules, logs, status, error]
  );

  return api;
}