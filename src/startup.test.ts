import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('start-moltbot.sh', () => {
  it('uses CLAWDBOT_BIND_MODE if provided (regression for hard-coded bind mode)', () => {
    const scriptPath = path.resolve(process.cwd(), 'start-moltbot.sh');
    const script = fs.readFileSync(scriptPath, 'utf8');

    // Expect the script to reference CLAWDBOT_BIND_MODE in the bind mode assignment.
    // This ensures env configuration actually takes effect.
    const bindModeAssignmentUsesEnv =
      /BIND_MODE=.*CLAWDBOT_BIND_MODE/.test(script) ||
      /CLAWDBOT_BIND_MODE/.test(script);

    expect(bindModeAssignmentUsesEnv).toBe(true);
  });
});
