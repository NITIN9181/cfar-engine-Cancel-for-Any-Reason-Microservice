import { useState, useEffect, useCallback } from 'react';
import type { AuditEntry, ApiError } from '../types/contract';
import { cfarClient } from '../api/cfarClient';

export function useAuditLog(contractId: string | null) {
  const [data, setData] = useState<AuditEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchAuditLog = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    const result = await cfarClient.getAuditLog(id);
    if (result.ok) {
      setData(result.data);
      setError(null);
    } else {
      setData(null);
      setError(result.error);
    }
    setIsLoading(false);
  }, []);

  const refetch = useCallback(() => {
    if (contractId) {
      fetchAuditLog(contractId);
    }
  }, [contractId, fetchAuditLog]);

  useEffect(() => {
    if (!contractId) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    fetchAuditLog(contractId);
  }, [contractId, fetchAuditLog]);

  return {
    data,
    isLoading,
    error,
    refetch
  };
}

export default useAuditLog;
