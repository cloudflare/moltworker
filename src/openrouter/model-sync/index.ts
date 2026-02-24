/**
 * Model Sync Module — automated full catalog sync from OpenRouter.
 */

export { detectCapabilities, formatCostString } from './capabilities';
export { generateAlias, collectExistingAliases } from './alias';
export { runFullSync, loadCatalog, loadAutoSyncedModels, fetchOpenRouterModels } from './sync';
export { runSyncCheck, formatSyncCheckMessage } from './synccheck';
export type { SyncCheckResult, CuratedCheckResult, NewFamilyModel } from './synccheck';
export type {
  OpenRouterApiModel,
  OpenRouterApiResponse,
  SyncCatalog,
  SyncResult,
  DeprecationState,
  DeprecationEntry,
  DetectedCapabilities,
  ConfidenceLevel,
} from './types';
export {
  SYNC_CATALOG_R2_KEY,
  SYNC_CATALOG_VERSION,
} from './types';
