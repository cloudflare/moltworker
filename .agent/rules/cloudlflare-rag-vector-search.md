---
trigger: always_on
---

RAG & Vector Search

## Context

Use this rule when the Agent needs to retrieve knowledge from documents, databases, or user uploads.

## Standards

1.  **Vectorize**: Use Cloudflare Vectorize for storing embeddings.
2.  **Embedding Generation**: Use `Workers AI` (e.g., `@cf/baai/bge-base-en-v1.5`) to generate embeddings.
3.  **R2 Integration**: Store the raw content (blobs, text) in R2, and the vectors in Vectorize.
4.  **Metadata**: Always include a `docId` or `url` in the vector metadata to link back to the source.

## Code Pattern

```typescript
interface Env {
  VECTORIZE: VectorizeIndex;
  AI: Ai;
}

async function searchKnowledgeBase(env: Env, query: string) {
  // 1. Generate Embedding
  const { data } = await env.AI.run("@cf/baai/bge-base-en-v1.5", {
    text: [query]
  });

  // 2. Query Vector DB
  const matches = await env.VECTORIZE.query(data[0], {
    topK: 5,
    returnMetadata: true
  });

  // 3. Format Context
  return matches.matches.map((m) => m.metadata?.text).join("\n");
}
```
