import { useState, useEffect } from 'react';

interface ServiceStatus {
  name: string;
  url: string;
  status: 'ok' | 'error' | 'pending';
  latency?: number;
}

const servicesToMonitor: Omit<ServiceStatus, 'status'>[] = [
  { name: 'Blockchain Node', url: 'http://localhost:5001/health' },
  { name: 'Procurement Corridor', url: 'http://localhost:4032/health' },
  { name: 'UN Compliance', url: 'http://localhost:4035/health' },
  { name: 'SA Compliance', url: 'http://localhost:4036/health' },
  { name: 'Document Vault', url: 'http://localhost:4087/health' },
  { name: 'Security Framework', url: 'http://localhost:4011/health' },
];

export function useLiveOperations() {
  const [statuses, setStatuses] = useState<ServiceStatus[]>(
    servicesToMonitor.map(s => ({ ...s, status: 'pending' }))
  );
  const [loading, setLoading] = useState(true);

  const checkServices = async () => {
    setLoading(true);
    const results = await Promise.all(
      servicesToMonitor.map(async (service) => {
        const startTime = Date.now();
        try {
          const response = await fetch(service.url, { signal: AbortSignal.timeout(2000) });
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'ok') {
              return { ...service, status: 'ok' as const, latency: Date.now() - startTime };
            }
          }
          return { ...service, status: 'error' as const, latency: Date.now() - startTime };
        } catch (error) {
          return { ...service, status: 'error' as const };
        }
      })
    );
    setStatuses(results);
    setLoading(false);
  };

  useEffect(() => {
    checkServices();
    const interval = setInterval(checkServices, 30000); // Re-check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return { statuses, loading, lastChecked: new Date() };
}