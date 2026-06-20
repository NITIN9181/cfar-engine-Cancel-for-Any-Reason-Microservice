import { useState, useEffect, useCallback } from 'react';
import type { PartnerConfig, ApiError } from '../types/contract';
import { cfarClient } from '../api/cfarClient';

export function usePartnerConfig(partnerId: string) {
  const [config, setConfig] = useState<PartnerConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchConfig = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    const result = await cfarClient.getPartnerConfig(id);
    if (result.ok) {
      setConfig(result.data);
      setError(null);
      // Persist in session storage for layout shell theming
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('cfar_partner_config', JSON.stringify(result.data));
        window.dispatchEvent(new CustomEvent('cfar-theme-changed'));
      }
    } else {
      setConfig(null);
      setError(result.error);
    }
    setIsLoading(false);
  }, []);

  const updateConfig = useCallback((updated: Partial<PartnerConfig>) => {
    setConfig((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updated };
      // Sync local sessionStorage on state updates for instant theme preview
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('cfar_partner_config', JSON.stringify(next));
        window.dispatchEvent(new CustomEvent('cfar-theme-changed'));
      }
      return next;
    });
  }, []);

  const saveConfig = useCallback(async () => {
    if (!config) return false;
    setIsLoading(true);
    setError(null);

    const result = await cfarClient.updatePartnerConfig(partnerId, config);

    if (result.ok) {
      setConfig(result.data);
      setError(null);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('cfar_partner_config', JSON.stringify(result.data));
        window.dispatchEvent(new CustomEvent('cfar-theme-changed'));
      }
      setIsLoading(false);
      return true;
    } else {
      setError(result.error);
      setIsLoading(false);
      return false;
    }
  }, [partnerId, config]);

  useEffect(() => {
    if (partnerId) {
      fetchConfig(partnerId);
    }
  }, [partnerId, fetchConfig]);

  return {
    config,
    isLoading,
    error,
    updateConfig,
    saveConfig,
    refetch: () => fetchConfig(partnerId)
  };
}

export default usePartnerConfig;
