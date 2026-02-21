/**
 * Lightweight code validation for Dream Build generated files.
 *
 * Runs in-memory checks on generated code before PR creation.
 * This is NOT a substitute for real CI — it catches obvious syntax issues
 * (unbalanced braces, empty stubs, missing exports) so the PR isn't DOA.
 */

export interface ValidationResult {
  path: string;
  ok: boolean;
  warnings: string[];
}

/**
 * Validate all generated work items.
 * Returns per-file results and overall pass/fail.
 */
export function validateGeneratedFiles(
  files: Array<{ path: string; content: string }>
): { passed: boolean; results: ValidationResult[] } {
  const results = files.map(f => validateFile(f.path, f.content));
  const passed = results.every(r => r.ok);
  return { passed, results };
}

/**
 * Validate a single generated file.
 */
export function validateFile(path: string, content: string): ValidationResult {
  const warnings: string[] = [];
  const ext = path.split('.').pop()?.toLowerCase() || '';

  // Skip spec/doc files — they're just reference markdown
  if (path.startsWith('docs/')) {
    return { path, ok: true, warnings: [] };
  }

  // Check 1: Non-empty content
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    warnings.push('File is empty');
    return { path, ok: false, warnings };
  }

  // Check 2: Stub-only content (only TODO comments and empty exports)
  if (isStubOnly(trimmed)) {
    warnings.push('File contains only stub/TODO content — no real implementation');
  }

  // Extension-specific checks
  if (ext === 'ts' || ext === 'tsx') {
    warnings.push(...validateTypeScript(trimmed));
  } else if (ext === 'sql') {
    warnings.push(...validateSQL(trimmed));
  }

  return {
    path,
    ok: warnings.length === 0,
    warnings,
  };
}

/**
 * Check if the content is just a stub (only comments, empty exports, whitespace).
 */
function isStubOnly(content: string): boolean {
  const lines = content.split('\n');
  const meaningful = lines.filter(line => {
    const stripped = line.trim();
    if (stripped.length === 0) return false;
    if (stripped.startsWith('//')) return false;
    if (stripped.startsWith('--')) return false;
    if (stripped === 'export {};') return false;
    return true;
  });
  return meaningful.length === 0;
}

/**
 * Lightweight TypeScript validation — catches obvious syntax issues.
 */
function validateTypeScript(content: string): string[] {
  const warnings: string[] = [];

  // Balanced braces
  if (!areBracketsBalanced(content, '{', '}')) {
    warnings.push('Unbalanced curly braces {}');
  }

  // Balanced parentheses
  if (!areBracketsBalanced(content, '(', ')')) {
    warnings.push('Unbalanced parentheses ()');
  }

  // Balanced square brackets
  if (!areBracketsBalanced(content, '[', ']')) {
    warnings.push('Unbalanced square brackets []');
  }

  // Check for common invalid patterns
  if (/\beval\s*\(/.test(content)) {
    warnings.push('Contains eval() — forbidden by project rules');
  }

  // Check for `any` type usage (project rule: no `any`)
  if (/:\s*any\b/.test(content) || /as\s+any\b/.test(content)) {
    warnings.push('Contains `any` type — use proper typing or `unknown`');
  }

  return warnings;
}

/**
 * Lightweight SQL validation.
 */
function validateSQL(content: string): string[] {
  const warnings: string[] = [];
  const upper = content.toUpperCase();

  // Should contain at least one SQL statement
  const hasSQLKeyword =
    upper.includes('CREATE') ||
    upper.includes('ALTER') ||
    upper.includes('INSERT') ||
    upper.includes('SELECT') ||
    upper.includes('DROP') ||
    upper.includes('UPDATE') ||
    upper.includes('DELETE');

  if (!hasSQLKeyword) {
    warnings.push('No SQL statements found (expected CREATE, ALTER, INSERT, etc.)');
  }

  // Check for dangerous unguarded DROP
  if (/\bDROP\s+TABLE\b/i.test(content) && !/\bIF\s+EXISTS\b/i.test(content)) {
    warnings.push('DROP TABLE without IF EXISTS — potential data loss');
  }

  return warnings;
}

/**
 * Check if opening/closing brackets are balanced in source code.
 * Ignores brackets inside string literals and comments.
 */
function areBracketsBalanced(source: string, open: string, close: string): boolean {
  let depth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplate = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];

    // Line comment
    if (!inSingleQuote && !inDoubleQuote && !inTemplate && !inBlockComment) {
      if (ch === '/' && next === '/') {
        inLineComment = true;
        continue;
      }
    }
    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }

    // Block comment
    if (!inSingleQuote && !inDoubleQuote && !inTemplate && !inLineComment) {
      if (ch === '/' && next === '*') {
        inBlockComment = true;
        i++; // skip *
        continue;
      }
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i++; // skip /
      }
      continue;
    }

    // String literals — skip escaped quotes
    if (ch === '\\' && (inSingleQuote || inDoubleQuote || inTemplate)) {
      i++; // skip escaped char
      continue;
    }

    if (ch === "'" && !inDoubleQuote && !inTemplate) {
      inSingleQuote = !inSingleQuote;
      continue;
    }
    if (ch === '"' && !inSingleQuote && !inTemplate) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }
    if (ch === '`' && !inSingleQuote && !inDoubleQuote) {
      inTemplate = !inTemplate;
      continue;
    }

    // Skip chars inside strings
    if (inSingleQuote || inDoubleQuote || inTemplate) continue;

    if (ch === open) depth++;
    if (ch === close) depth--;

    if (depth < 0) return false;
  }

  return depth === 0;
}

/**
 * Format validation results as a markdown section for the PR body.
 */
export function formatValidationWarnings(results: ValidationResult[]): string {
  const failed = results.filter(r => !r.ok);
  if (failed.length === 0) return '';

  const lines = ['### Validation Warnings', ''];
  for (const result of failed) {
    lines.push(`**\`${result.path}\`**:`);
    for (const warning of result.warnings) {
      lines.push(`- ${warning}`);
    }
    lines.push('');
  }
  lines.push('> These warnings were detected by Dream Machine pre-PR validation. Manual review recommended.');
  return lines.join('\n');
}
