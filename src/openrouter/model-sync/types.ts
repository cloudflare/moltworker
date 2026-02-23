/**
 * Types for the automated model catalog sync system.
 *
 * Fetches all models from OpenRouter API, detects capabilities,
 * generates stable aliases, and persists to R2.
 */

import type { ModelInfo, ReasoningCapability } from '../models';

// === OpenRouter API Response Types ===

export interface OpenRouterApiModel {
  id: string;
  name: string;
  description?: string;
  context_length: number;
  architecture?: {
    modality?: string;
    input_modalities?: string[];
    output_modalities?: string[];
  };
  pricing?: {
    prompt: string;
    completion: string;
  };
  supported_parameters?: string[];
  top_provider?: {
    max_completion_tokens?: number;
    is_moderated?: boolean;
  };
}

export interface OpenRouterApiResponse {
  data: OpenRouterApiModel[];
}

// === Capability Detection ===

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface DetectedCapability {
  value: boolean;
  confidence: ConfidenceLevel;
  source: string;
}

export interface DetectedCapabilities {
  supportsVision: DetectedCapability;
  supportsTools: DetectedCapability;
  structuredOutput: DetectedCapability;
  reasoning: { value: ReasoningCapability; confidence: ConfidenceLevel; source: string };
  isImageGen: DetectedCapability;
  isFree: DetectedCapability;
  parallelCalls: DetectedCapability;
}

// === Deprecation Lifecycle ===

export type DeprecationState = 'active' | 'stale' | 'deprecated' | 'removed';

export interface DeprecationEntry {
  state: DeprecationState;
  firstMissing: number | null; // Timestamp when model first went missing
  lastSeen: number;            // Timestamp when model was last seen in API
}

// Thresholds in milliseconds
export const STALE_THRESHOLD_MS = 14 * 24 * 60 * 60 * 1000;      // 14 days
export const DEPRECATED_THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000;  // 30 days

// === Sync Catalog (R2 storage) ===

export interface SyncCatalog {
  version: number;
  syncedAt: number;
  totalFetched: number;
  models: Record<string, ModelInfo>;
  aliasMap: Record<string, string>; // modelId → alias (stable across syncs)
  deprecations: Record<string, DeprecationEntry>;
}

export const SYNC_CATALOG_VERSION = 1;
export const SYNC_CATALOG_R2_KEY = 'sync/full-catalog.json';
export const SYNC_CATALOG_TMP_KEY = 'sync/full-catalog.tmp.json';

// === Sync Result ===

export interface SyncResult {
  success: boolean;
  totalFetched: number;
  totalSynced: number;
  newModels: number;
  removedModels: number;
  staleModels: number;
  error?: string;
  durationMs: number;
}
