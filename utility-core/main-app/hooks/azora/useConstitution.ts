/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { useState, useEffect } from 'react';

// Define the structure of a constitutional rule
interface ConstitutionalRule {
  ruleId: string;
  name: string;
  description: string;
  article: string;
  section: string;
  isCritical: boolean;
  appliesTo: string[];
}

// Define the hook's return type
interface UseConstitutionReturn {
  rules: ConstitutionalRule[];
  loading: boolean;
  error: string | null;
  getRuleById: (ruleId: string) => ConstitutionalRule | undefined;
}

const API_URL = 'http://localhost:4032/api/v1/compliance/rules';

/**
 * Fetches and manages constitutional rules from the Azora OS procurement corridor.
 * This hook provides live data, adhering to the "No Mock Protocol" (Article IX).
 * @returns {UseConstitutionReturn} The constitutional rules, loading state, and error status.
 */
export function useConstitution(): UseConstitutionReturn {
  const [rules, setRules] = useState<ConstitutionalRule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch rules: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // The API returns an object with a 'rules' array
        if (data && Array.isArray(data.rules)) {
          setRules(data.rules);
        } else {
          // Handle cases where the API might return just the array
          setRules(data);
        }

      } catch (err: any) {
        console.error("Error fetching constitutional rules:", err);
        setError(err.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, []);

  const getRuleById = (ruleId: string): ConstitutionalRule | undefined => {
    return rules.find(rule => rule.ruleId === ruleId);
  };

  return { rules, loading, error, getRuleById };
}