import React, { createContext, useMemo, useCallback } from 'react';
import { evaluateNudges, optOut, auditNudgeEvent } from '../lib/nudge';

export const NudgeContext = createContext({ nudges: [], onAccept: () => {}, onDismiss: () => {} });

export default function NudgeProvider({ context, children }) {
  const nudges = useMemo(() => evaluateNudges(context), [context]);

  const onAccept = useCallback(async (nudge) => {
    await auditNudgeEvent({ type: 'accept', nudgeId: nudge.id, meta: { page: context?.page } });
    await nudge.onAccept?.(context);
  }, [context]);

  const onDismiss = useCallback(async (nudge, { dontShowAgain } = {}) => {
    if (dontShowAgain) optOut(nudge.optOutKey);
    await auditNudgeEvent({ type: 'dismiss', nudgeId: nudge.id, meta: { page: context?.page, dontShowAgain } });
  }, [context]);

  return (
    <NudgeContext.Provider value={{ nudges, onAccept, onDismiss }}>
      {children}
    </NudgeContext.Provider>
  );
}