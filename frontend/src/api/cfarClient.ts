// Typed API client for CFAR Engine
import type {
  ApiResult,
  ApiError,
  PricingRequest,
  PricingResult,
  CreateContractBody,
  CfarContract,
  CancellationResult,
  AuditEntry,
  PartnerConfig
} from '../types/contract';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
const DEFAULT_PARTNER_ID = import.meta.env.VITE_DEFAULT_PARTNER_ID ?? 'aerodemo_airlines';

// Helper to convert snake_case to camelCase
function toCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamel);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result: any, key) => {
      let camelKey = key.replace(/([-_][a-z])/g, (group) =>
        group.toUpperCase().replace('-', '').replace('_', '')
      );
      // Map contract_id -> id
      if (camelKey === 'contractId') {
        camelKey = 'id';
      }
      result[camelKey] = toCamel(obj[key]);
      return result;
    }, {});
  }
  return obj;
}

// Helper to convert camelCase to snake_case
function toSnake(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnake);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result: any, key) => {
      let targetKey = key;
      // Map id -> contract_id
      if (key === 'id') {
        targetKey = 'contractId';
      }
      const snakeKey = targetKey.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      result[snakeKey] = toSnake(obj[key]);
      return result;
    }, {});
  }
  return obj;
}

// Common fetch wrapper
async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  try {
    const partnerId = DEFAULT_PARTNER_ID; // Can be configured or read dynamically
    const headers = new Headers(options.headers);
    
    // Auth headers
    if (!headers.has('X-Partner-Id')) {
      headers.set('X-Partner-Id', partnerId);
    }
    if (!headers.has('X-Api-Key')) {
      headers.set('X-Api-Key', 'demo');
    }
    if (!headers.has('X-Partner-Key')) {
      headers.set('X-Partner-Key', 'demo');
    }
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers
    });

    let jsonResponse: any;
    const text = await response.text();
    if (text) {
      try {
        jsonResponse = JSON.parse(text);
      } catch {
        jsonResponse = { message: text };
      }
    }

    if (!response.ok) {
      const error: ApiError = {
        code: jsonResponse?.error || jsonResponse?.code || 'HTTP_ERROR',
        message: jsonResponse?.message || `Request failed with status ${response.status}`,
        details: jsonResponse?.details || null
      };
      return { ok: false, error };
    }

    return { ok: true, data: toCamel(jsonResponse) as T };
  } catch (err: any) {
    return {
      ok: false,
      error: {
        code: 'NETWORK_ERROR',
        message: err.message || 'Network connection failed'
      }
    };
  }
}

export const cfarClient = {
  async getPricing(req: PricingRequest): Promise<ApiResult<PricingResult>> {
    const params = new URLSearchParams();
    const snakeReq = toSnake(req);
    Object.keys(snakeReq).forEach((key) => {
      params.append(key, String(snakeReq[key]));
    });
    // Ensure partnerId is added to query if not present
    if (!params.has('partner_id')) {
      params.append('partner_id', req.partnerId);
    }

    return apiRequest<PricingResult>(`/api/v1/pricing?${params.toString()}`, {
      method: 'GET'
    });
  },

  async createContract(
    body: CreateContractBody,
    idempotencyKey: string
  ): Promise<ApiResult<CfarContract>> {
    return apiRequest<CfarContract>('/api/v1/contracts', {
      method: 'POST',
      headers: {
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(toSnake(body))
    });
  },

  async getContract(contractId: string): Promise<ApiResult<CfarContract>> {
    return apiRequest<CfarContract>(`/api/v1/contracts/${contractId}`, {
      method: 'GET'
    });
  },

  async cancelContract(
    contractId: string,
    reason?: string
  ): Promise<ApiResult<CancellationResult>> {
    return apiRequest<CancellationResult>(`/api/v1/contracts/${contractId}/cancel`, {
      method: 'POST',
      body: JSON.stringify(toSnake({ reason }))
    });
  },

  async getAuditLog(contractId: string): Promise<ApiResult<AuditEntry[]>> {
    const result = await apiRequest<{ entries: AuditEntry[] }>(
      `/api/v1/contracts/${contractId}/audit`,
      { method: 'GET' }
    );
    if (result.ok) {
      // The API returns { contractId: string, entries: AuditEntry[] }
      // We map this to return just the AuditEntry[] array as requested
      return { ok: true, data: result.data.entries };
    }
    return result as ApiResult<AuditEntry[]>;
  },

  async getPartnerConfig(partnerId: string): Promise<ApiResult<PartnerConfig>> {
    return apiRequest<PartnerConfig>(`/api/v1/admin/partner-config?partnerId=${partnerId}`, {
      method: 'GET'
    });
  },

  async updatePartnerConfig(
    partnerId: string,
    config: Partial<PartnerConfig>
  ): Promise<ApiResult<PartnerConfig>> {
    return apiRequest<PartnerConfig>('/api/v1/admin/partner-config', {
      method: 'PUT',
      body: JSON.stringify({
        partner_id: partnerId,
        ...toSnake(config)
      })
    });
  }
};
