import { useState, useEffect, useCallback } from 'react';
import type { CfarContract, ApiError } from '../types/contract';
import { cfarClient } from '../api/cfarClient';

export function useContract(contractId: string | null) {
  const [data, setData] = useState<CfarContract | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchContract = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    const result = await cfarClient.getContract(id);
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
      fetchContract(contractId);
    }
  }, [contractId, fetchContract]);

  useEffect(() => {
    if (!contractId) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    fetchContract(contractId);
  }, [contractId, fetchContract]);

  return {
    data,
    isLoading,
    error,
    refetch
  };
}

export default useContract;
