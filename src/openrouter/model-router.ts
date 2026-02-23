/**
 * Model Router (Phase 7B.2)
 * Routes simple queries to fast/cheap models for lower latency.
 * Complex queries and explicit model choices are unchanged.
 */

import { type TaskComplexity } from '../utils/task-classifier';
import { getModel, DEFAULT_MODEL } from './models';

/**
 * Fast model candidates, ordered by preference (cheapest/fastest first).
 * Must support tools — simple queries like "what's the weather?" still need tool calls.
 */
export const FAST_MODEL_CANDIDATES = ['mini', 'flash', 'haiku'] as const;

export interface RoutingResult {
  /** The model alias to use (may differ from input if routed). */
  modelAlias: string;
  /** True if the model was switched by the router. */
  wasRouted: boolean;
  /** Human-readable explanation of the routing decision. */
  reason: string;
}

/**
 * Route model selection by task complexity.
 *
 * Policy:
 * - Simple queries on default model ('auto') → fast model (GPT-4o Mini preferred)
 * - Complex queries → keep as-is
 * - Explicit model choice (user ran /use) → keep as-is
 * - Auto-routing disabled → keep as-is
 *
 * @param modelAlias - Current user model alias
 * @param complexity - Task complexity from classifyTaskComplexity()
 * @param autoRouteEnabled - Whether auto-routing is enabled for this user
 * @returns RoutingResult with the resolved model and metadata
 */
export function routeByComplexity(
  modelAlias: string,
  complexity: TaskComplexity,
  autoRouteEnabled: boolean,
): RoutingResult {
  // Only route when auto-routing is enabled
  if (!autoRouteEnabled) {
    return { modelAlias, wasRouted: false, reason: 'Auto-routing disabled' };
  }

  // Only route simple queries
  if (complexity !== 'simple') {
    return { modelAlias, wasRouted: false, reason: 'Complex query — using selected model' };
  }

  // Only route when user hasn't explicitly chosen a model (still on default 'auto')
  if (modelAlias !== DEFAULT_MODEL) {
    return { modelAlias, wasRouted: false, reason: `Explicit model /${modelAlias} — not overriding` };
  }

  // Find the first available fast model
  for (const candidate of FAST_MODEL_CANDIDATES) {
    if (getModel(candidate)) {
      return {
        modelAlias: candidate,
        wasRouted: true,
        reason: `Simple query → /${candidate}`,
      };
    }
  }

  // Fallback: keep default if no fast model is in the catalog
  return { modelAlias, wasRouted: false, reason: 'No fast model available' };
}
