import { useState, useCallback } from 'react';
import type { CancellationResult, ApiError } from '../types/contract';
import { cfarClient } from '../api/cfarClient';

export function useCancellation(contractId: string | null) {
  const [data, setData] = useState<CancellationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const cancelContract = useCallback(async (reason?: string) => {
    if (!contractId) {
      setError({ code: 'MISSING_CONTRACT_ID', message: 'No contract ID provided for cancellation' });
      return null;
    }

    setIsLoading(true);
    setError(null);

    const result = await cfarClient.cancelContract(contractId, reason);

    if (result.ok) {
      setData(result.data);
      setError(null);
      setIsLoading(false);
      return result.data;
    } else {
      setData(null);
      setError(result.error);
      setIsLoading(false);
      return null;
    }
  }, [contractId]);

  return {
    cancelContract,
    isLoading,
    error,
    data
  };
}

export default useCancellation;
