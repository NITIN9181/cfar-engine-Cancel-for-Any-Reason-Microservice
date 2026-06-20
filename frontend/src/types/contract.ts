// Frontend TypeScript Types - Mirrors Scala Models

export type CoverageTier = 'partial' | 'full';

export type ContractStatus =
  | 'active'
  | 'cancelled'
  | 'refund_initiated'
  | 'refunded'
  | 'expired'
  | 'voided';

export interface CfarContract {
  id: string;
  partnerId: string;
  pnr: string;
  origin: string;
  destination: string;
  departureDate: string; // ISO Date String
  passengerCount: number;
  fareAmount: number;
  fareCurrency: string;
  coverageTier: CoverageTier;
  coveragePct: number;
  cfarFee: number;
  cfarFeePct: number;
  status: ContractStatus;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  cancelledAt: string | null;
  refundAmount: number | null;
  refundInitiatedAt: string | null;
  refundCompletedAt: string | null;
  cancellationReason: string | null;
}

export interface PricingRequest {
  partnerId: string;
  origin: string;
  destination: string;
  departureDate: string; // YYYY-MM-DD
  fareAmount: number;
  fareCurrency: string;
  passengerCount: number;
}

export interface CoveragePricing {
  tier: CoverageTier;
  coveragePct: number;
  cfarFee: number;
  cfarFeePct: number;
  refundIfUsed: number;
}

export interface PricingResult {
  partialCoverage: CoveragePricing;
  fullCoverage: CoveragePricing;
  riskScore: number;
  modelVersion: string;
  expiresInSeconds?: number;
}

export type AuditEventType =
  | 'ContractCreated'
  | 'ContractCancelled'
  | 'EligibilityChecked'
  | 'RefundInitiated'
  | 'RefundCompleted'
  | 'ContractExpired'
  | 'ContractVoided'
  | 'PricingCalculated';

export interface AuditEntry {
  id: string;
  contractId: string;
  eventType: AuditEventType;
  fromStatus: ContractStatus | null;
  toStatus: ContractStatus | null;
  metadata: Record<string, string>;
  createdAt: string;
  actorId: string; // "system" | "traveler" | "partner_api"
}

export interface PartnerConfig {
  partnerId: string;
  partnerName: string;
  partialCoveragePct: number;
  fullCoveragePct: number;
  minCfarFeePct: number;
  maxCfarFeePct: number;
  cancellationWindowH: number;
  supportedCurrencies: string[];
  brandColor: string;
  brandLogoUrl: string | null;
  webhookUrl: string | null;
  isActive: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string> | null;
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

export interface CreateContractBody {
  pnr: string;
  origin: string;
  destination: string;
  departureDate: string; // YYYY-MM-DD
  fareAmount: number;
  fareCurrency: string;
  passengerCount: number;
  coverageTier: CoverageTier;
  travelerId?: string;
}

export interface CancellationResult {
  contractId: string;
  status: ContractStatus;
  refundAmount: number;
  refundCurrency: string;
  refundTimeline: string;
  cancelledAt: string;
  message: string;
}
