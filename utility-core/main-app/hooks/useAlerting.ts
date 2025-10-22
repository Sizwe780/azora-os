/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { useEffect } from 'react';
import { useMetrics } from '../context/MetricsProvider';
import { useAlerts } from '../context/AlertProvider';

export function useAlerting() {
  const { metrics } = useMetrics();
  const { push } = useAlerts();

  useEffect(() => {
    if (metrics.proposals > 40) {
      push({ type: 'warning', message: '⚠️ Proposal flood detected' });
    }
    const reps = Object.values(metrics.repDistribution);
    const max = Math.max(...reps, 0);
    const total = reps.reduce((a, b) => a + b, 0);
    if (total > 0 && max / total > 0.6) {
      push({ type: 'error', message: '🚨 REP concentration risk: >60% in one citizen' });
    }
    if (metrics.federationTraffic > 100) {
      push({ type: 'info', message: '🌐 Federation traffic surge detected' });
    }
  }, [metrics, push]);
}
