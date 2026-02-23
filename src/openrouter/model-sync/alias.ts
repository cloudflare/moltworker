/**
 * Deterministic alias generation for auto-synced models.
 *
 * Strategy:
 * 1. Strip provider prefix (e.g., "openai/" → "")
 * 2. Remove date suffixes, version tags, "preview", "latest"
 * 3. Collapse to lowercase alphanumeric
 * 4. Truncate to 20 chars
 * 5. Resolve conflicts by appending short hash or counter
 *
 * Uses a stable alias map (modelId → alias) persisted in R2
 * so aliases don't change between syncs.
 */

/**
 * Generate a stable alias for a model ID.
 * If the model already has an alias in the map, return it.
 * Otherwise generate a new one and add to the map.
 */
export function generateAlias(
  modelId: string,
  existingAliases: Set<string>,
  aliasMap: Record<string, string>,
): string {
  // Return existing stable alias if we've seen this model before
  if (aliasMap[modelId] && !existingAliases.has(aliasMap[modelId])) {
    existingAliases.add(aliasMap[modelId]);
    return aliasMap[modelId];
  }
  if (aliasMap[modelId]) {
    // Alias exists but conflicts — return it anyway (it was assigned first)
    return aliasMap[modelId];
  }

  const alias = createNewAlias(modelId, existingAliases);
  aliasMap[modelId] = alias;
  existingAliases.add(alias);
  return alias;
}

/**
 * Create a new alias from a model ID.
 */
function createNewAlias(modelId: string, existingAliases: Set<string>): string {
  // Strip provider prefix
  let base = modelId.includes('/') ? modelId.split('/').pop()! : modelId;

  // Remove :free suffix (handled separately via isFree flag)
  base = base.replace(/:free$/i, '');

  // Remove date suffixes (2024-01-01, 20240101, etc.)
  base = base.replace(/-?\d{4}-?\d{2}-?\d{2}/g, '');
  base = base.replace(/-?\d{6,8}/g, '');

  // Remove common version/preview tags
  base = base.replace(/-(preview|latest|next|beta|alpha|exp|experimental|turbo|instruct|chat|online)$/gi, '');

  // Collapse to lowercase, keep only alphanumeric and hyphens
  base = base.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');

  // Remove common filler words to shorten
  if (base.length > 20) {
    base = base.replace(/(free|plus|large|small|mini|flash|ultra|super|pro|max|standard)/gi, (m) => m[0]);
  }

  // Truncate
  if (base.length > 20) {
    base = base.slice(0, 20).replace(/-$/, '');
  }

  // Ensure non-empty
  if (!base) {
    base = 'model';
  }

  // Resolve conflicts
  let alias = base;
  if (existingAliases.has(alias)) {
    // Try appending provider short code
    const provider = modelId.includes('/') ? modelId.split('/')[0].slice(0, 3) : '';
    if (provider) {
      alias = `${base}-${provider}`;
      if (!existingAliases.has(alias)) return alias;
    }

    // Fall back to counter
    let counter = 2;
    while (existingAliases.has(`${base}${counter}`)) {
      counter++;
    }
    alias = `${base}${counter}`;
  }

  return alias;
}

/**
 * Collect all aliases currently in use (curated + dynamic + blocked).
 */
export function collectExistingAliases(
  curatedModels: Record<string, unknown>,
  dynamicModels: Record<string, unknown>,
): Set<string> {
  const aliases = new Set<string>();
  for (const key of Object.keys(curatedModels)) aliases.add(key.toLowerCase());
  for (const key of Object.keys(dynamicModels)) aliases.add(key.toLowerCase());
  return aliases;
}
