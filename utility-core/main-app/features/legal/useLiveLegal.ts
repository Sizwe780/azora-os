import { useState, useEffect } from 'react';

interface ComplianceStatus {
  framework: string;
  status: 'compliant' | 'non-compliant' | 'pending';
  details: string;
  url: string;
}

const frameworksToMonitor: Omit<ComplianceStatus, 'status' | 'details'>[] = [
    { framework: 'UN Global Compact', url: 'http://localhost:4035/api/v1/principles' },
    { framework: 'SA Legal Frameworks', url: 'http://localhost:4036/api/v1/frameworks' },
    { framework: 'GDPR', url: 'http://localhost:4038/api/v1/status' },
    { framework: 'SOX', url: 'http://localhost:4039/api/v1/status' },
];

export function useLiveLegal() {
    const [statuses, setStatuses] = useState<ComplianceStatus[]>(
        frameworksToMonitor.map(f => ({ ...f, status: 'pending', details: 'Checking...' }))
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkFrameworks = async () => {
            setLoading(true);
            const results = await Promise.all(
                frameworksToMonitor.map(async (framework) => {
                    try {
                        const response = await fetch(framework.url, { signal: AbortSignal.timeout(2000) });
                        if (response.ok) {
                            return { ...framework, status: 'compliant' as const, details: 'Service is operational and compliant.' };
                        }
                        return { ...framework, status: 'non-compliant' as const, details: `Service responded with status ${response.status}.` };
                    } catch (error) {
                        return { ...framework, status: 'non-compliant' as const, details: 'Service is unreachable.' };
                    }
                })
            );
            setStatuses(results);
            setLoading(false);
        };
        checkFrameworks();
    }, []);

    return { statuses, loading };
}