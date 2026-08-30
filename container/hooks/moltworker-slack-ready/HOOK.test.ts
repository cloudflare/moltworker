import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

type YamlValue = Record<string, unknown> | unknown[] | string

function parseYamlFrontmatter(source: string): Record<string, unknown> {
  const match = source.match(/^---\n([\s\S]*?)\n---(?:\n|$)/)
  if (!match) {
    throw new Error('HOOK.md is missing YAML frontmatter')
  }

  const root: Record<string, unknown> = {}
  const stack: Array<{ indent: number; value: YamlValue }> = [{ indent: -1, value: root }]
  const lines = match[1].split('\n').filter((line) => line.trim() !== '')

  for (const [index, line] of lines.entries()) {
    const indent = line.length - line.trimStart().length
    const content = line.trim()
    while (stack.at(-1)!.indent >= indent) {
      stack.pop()
    }

    if (content.startsWith('- ')) {
      const parent = stack.at(-1)!.value
      if (!Array.isArray(parent)) {
        throw new Error(`Unexpected YAML sequence at line ${index + 1}`)
      }
      parent.push(content.slice(2))
      continue
    }

    const keyMatch = content.match(/^([\w-]+):(?:\s+(.*))?$/)
    if (!keyMatch) {
      throw new Error(`Unsupported YAML at line ${index + 1}`)
    }

    const parent = stack.at(-1)!.value
    if (Array.isArray(parent)) {
      throw new Error(`Unexpected YAML mapping at line ${index + 1}`)
    }

    const [, key, scalar] = keyMatch
    if (scalar !== undefined) {
      parent[key] = scalar
      continue
    }

    const nextLine = lines[index + 1]
    const nextIndent = nextLine ? nextLine.length - nextLine.trimStart().length : -1
    const value: YamlValue = nextIndent > indent && nextLine.trim().startsWith('- ') ? [] : {}
    parent[key] = value
    stack.push({ indent, value })
  }

  return root
}

describe('moltworker-slack-ready HOOK.md metadata', () => {
  it('declares gateway startup under OpenClaw hook metadata', () => {
    const hook = parseYamlFrontmatter(
      readFileSync(fileURLToPath(new URL('./HOOK.md', import.meta.url)), 'utf8'),
    )

    expect(hook).toMatchObject({
      metadata: {
        openclaw: {
          events: ['gateway:startup'],
        },
      },
    })
    expect(hook.events).toBeUndefined()
  })
})
