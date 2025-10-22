/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { useState, useEffect } from 'react';

export function useApi<T>(query: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, this would fetch from the API
        // For now, we return mock data for the ledger
        if (query.startsWith('/api/ledger')) {
            const mockData = {
                entries: [
                    { uid: 'led_1', type: 'INVOICE', entityId: 'inv_abc', companyId: 'comp_123', driverId: 'drv_456', createdAt: new Date().toISOString(), hash: '0xabc' },
                    { uid: 'led_2', type: 'PAYMENT', entityId: 'pay_def', companyId: 'comp_123', createdAt: new Date().toISOString(), hash: '0xdef' },
                ]
            };
            setData(mockData as T);
        } else {
            setData(null);
        }
      } catch (err) {
        console.error('useApi failed to fetch data for query', query, err);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query]);

  return { data, loading, error };
}
