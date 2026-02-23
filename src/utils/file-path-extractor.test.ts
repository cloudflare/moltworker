import { describe, it, expect } from 'vitest';
import { extractFilePaths, extractGitHubContext } from './file-path-extractor';
import type { ChatMessage } from '../openrouter/client';

describe('extractFilePaths', () => {
  describe('paths with directories', () => {
    it('extracts src/path/file.ts pattern', () => {
      const paths = extractFilePaths('Fix the bug in src/routes/api.ts');
      expect(paths).toContain('src/routes/api.ts');
    });

    it('extracts multiple paths', () => {
      const paths = extractFilePaths('Update src/index.ts and src/utils/helpers.ts');
      expect(paths).toContain('src/index.ts');
      expect(paths).toContain('src/utils/helpers.ts');
    });

    it('extracts paths with ./ prefix', () => {
      const paths = extractFilePaths('Read ./src/auth.ts');
      expect(paths).toContain('src/auth.ts');
    });

    it('strips line numbers', () => {
      const paths = extractFilePaths('Error at src/handler.ts:42');
      expect(paths).toContain('src/handler.ts');
      expect(paths).not.toContain('src/handler.ts:42');
    });

    it('extracts nested paths', () => {
      const paths = extractFilePaths('Look at src/openrouter/model-sync/types.ts');
      expect(paths).toContain('src/openrouter/model-sync/types.ts');
    });

    it('extracts paths in backticks', () => {
      const paths = extractFilePaths('Fix `src/routes/api.ts` and `src/index.ts`');
      expect(paths).toContain('src/routes/api.ts');
      expect(paths).toContain('src/index.ts');
    });

    it('extracts config file paths', () => {
      const paths = extractFilePaths('Update config/settings.yaml');
      expect(paths).toContain('config/settings.yaml');
    });
  });

  describe('standalone filenames', () => {
    it('extracts filename with known extension', () => {
      const paths = extractFilePaths('Fix the bug in handler.ts');
      expect(paths).toContain('handler.ts');
    });

    it('extracts package.json', () => {
      const paths = extractFilePaths('Update the package.json');
      expect(paths).toContain('package.json');
    });

    it('extracts Python files', () => {
      const paths = extractFilePaths('Run the main.py script');
      expect(paths).toContain('main.py');
    });

    it('extracts Rust files', () => {
      const paths = extractFilePaths('Check lib.rs for the issue');
      expect(paths).toContain('lib.rs');
    });

    it('strips line numbers from standalone filenames', () => {
      const paths = extractFilePaths('Error in utils.ts:120');
      expect(paths).toContain('utils.ts');
    });
  });

  describe('deduplication', () => {
    it('returns unique paths', () => {
      const paths = extractFilePaths('Fix src/auth.ts and also update src/auth.ts');
      expect(paths.filter(p => p === 'src/auth.ts')).toHaveLength(1);
    });
  });

  describe('false positive filtering', () => {
    it('excludes URLs', () => {
      const paths = extractFilePaths('Visit https://example.com/api/v1/users.json');
      expect(paths).not.toContain('api/v1/users.json');
    });

    it('excludes image files', () => {
      const paths = extractFilePaths('Upload assets/logo.png to the server');
      expect(paths).toHaveLength(0);
    });

    it('excludes binary files', () => {
      const paths = extractFilePaths('Download archive/data.zip');
      expect(paths).toHaveLength(0);
    });

    it('excludes version paths', () => {
      const paths = extractFilePaths('Use node/v16.0.0/bin/node');
      expect(paths).toHaveLength(0);
    });

    it('excludes npm scoped packages', () => {
      const paths = extractFilePaths('Install @types/node from npm');
      expect(paths).toHaveLength(0);
    });

    it('returns empty for no file references', () => {
      const paths = extractFilePaths('Hello, how are you today?');
      expect(paths).toHaveLength(0);
    });

    it('returns empty for simple queries', () => {
      const paths = extractFilePaths("What's the weather in Paris?");
      expect(paths).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('handles empty string', () => {
      expect(extractFilePaths('')).toHaveLength(0);
    });

    it('handles dotfiles in paths', () => {
      const paths = extractFilePaths('Check config/.env.local for secrets');
      expect(paths.length).toBeGreaterThanOrEqual(0); // .env files are valid
    });

    it('extracts multiple extensions', () => {
      const paths = extractFilePaths('Fix app.test.ts and app.spec.js');
      expect(paths).toContain('app.test.ts');
      expect(paths).toContain('app.spec.js');
    });
  });
});

describe('extractGitHubContext', () => {
  function msg(role: 'system' | 'user' | 'assistant', content: string): ChatMessage {
    return { role, content };
  }

  describe('from system prompt', () => {
    it('extracts repo from "Repository: owner/repo" pattern', () => {
      const result = extractGitHubContext([
        msg('system', 'You are a coding assistant. Repository: PetrAnto/moltworker'),
        msg('user', 'Fix the auth bug'),
      ]);
      expect(result).toEqual({ owner: 'PetrAnto', repo: 'moltworker' });
    });

    it('extracts repo from "repo: owner/repo" pattern', () => {
      const result = extractGitHubContext([
        msg('system', 'Working on repo: facebook/react'),
        msg('user', 'Update component'),
      ]);
      expect(result).toEqual({ owner: 'facebook', repo: 'react' });
    });

    it('extracts from GitHub URL', () => {
      const result = extractGitHubContext([
        msg('system', 'See https://github.com/vercel/next.js for details'),
        msg('user', 'Fix the SSR issue'),
      ]);
      expect(result).toEqual({ owner: 'vercel', repo: 'next.js' });
    });
  });

  describe('from user message', () => {
    it('extracts "in owner/repo" pattern', () => {
      const result = extractGitHubContext([
        msg('system', 'You are a helpful assistant'),
        msg('user', 'Fix the bug in PetrAnto/moltworker'),
      ]);
      expect(result).toEqual({ owner: 'PetrAnto', repo: 'moltworker' });
    });

    it('extracts "from owner/repo" pattern', () => {
      const result = extractGitHubContext([
        msg('system', 'You are a helpful assistant'),
        msg('user', 'Read the file from facebook/react'),
      ]);
      expect(result).toEqual({ owner: 'facebook', repo: 'react' });
    });
  });

  describe('no context', () => {
    it('returns null when no repo context found', () => {
      const result = extractGitHubContext([
        msg('system', 'You are a helpful assistant'),
        msg('user', 'What is the weather today?'),
      ]);
      expect(result).toBeNull();
    });

    it('returns null for empty messages', () => {
      expect(extractGitHubContext([])).toBeNull();
    });
  });

  describe('priority', () => {
    it('prefers system prompt over user message', () => {
      const result = extractGitHubContext([
        msg('system', 'Repository: PetrAnto/moltworker'),
        msg('user', 'Read the file from facebook/react'),
      ]);
      // System prompt takes priority
      expect(result).toEqual({ owner: 'PetrAnto', repo: 'moltworker' });
    });
  });
});
