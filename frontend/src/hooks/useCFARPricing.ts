import { useState, useEffect, useRef, useCallback } from 'react';
import type { PricingRequest, PricingResult, ApiError } from '../types/contract';
import { cfarClient } from '../api/cfarClient';

const QUOTE_TTL = Number(import.meta.env.VITE_PRICING_QUOTE_TTL_S ?? 300) * 1000;

export function useCFARPricing(request: PricingRequest) {
  const [data, setData] = useState<PricingResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [trigger, setTrigger] = useState(0);

  const requestRef = useRef(request);
  const debounceTimerRef = useRef<any>(null);
  const ttlTimerRef = useRef<any>(null);

  const requestChanged =
    request.partnerId !== requestRef.current.partnerId ||
    request.origin !== requestRef.current.origin ||
    request.destination !== requestRef.current.destination ||
    request.departureDate !== requestRef.current.departureDate ||
    request.fareAmount !== requestRef.current.fareAmount ||
    request.fareCurrency !== requestRef.current.fareCurrency ||
    request.passengerCount !== requestRef.current.passengerCount;

  if (requestChanged) {
    requestRef.current = request;
  }

  const fetchPricing = useCallback(async (currentReq: PricingRequest) => {
    setIsLoading(true);
    setError(null);

    const result = await cfarClient.getPricing(currentReq);
    if (result.ok) {
      setData(result.data);
      setError(null);
      
      // Auto refetch on TTL
      if (ttlTimerRef.current) clearTimeout(ttlTimerRef.current);
      ttlTimerRef.current = setTimeout(() => {
        setTrigger(prev => prev + 1);
      }, QUOTE_TTL);
    } else {
      setData(null);
      setError(result.error);
    }
    setIsLoading(false);
  }, []);

  const refetch = useCallback(() => {
    setTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsLoading(true);

    debounceTimerRef.current = setTimeout(() => {
      fetchPricing(requestRef.current);
    }, 400);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (ttlTimerRef.current) clearTimeout(ttlTimerRef.current);
    };
  }, [requestRef.current, trigger, fetchPricing]);

  return {
    data,
    isLoading,
    error,
    refetch
  };
}
export default useCFARPricing;
