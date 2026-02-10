# Phase 1 Engineering Research Report: Cloudflare-Native AI Inference Orchestration

## 1. Executive Summary

This document formalizes the architectural strategy for the Stream Kinetics Molt project and our 5 enterprise platforms (TabbyTarot, ContentGuru, WealthInnovation, MetaMirror, StreamKinetics).

Moving away from legacy models and fragmented API schemas, this architecture establishes a **100% Cloudflare-Native** control plane using **AI Gateway** and **Workers AI**. We have adopted an "Intent-Based Optimal Rubric" that routes requests to specialized, State-of-the-Art (SOTA) models based on task requirements, while centralizing observability, caching, and evaluation entirely within the Cloudflare ecosystem.

---

## 2. The "Optimal Rubric": Intent-Based Model Strategy

Instead of a monolithic approach, we route traffic to specialized models based on the `intent` of the user's request. This optimizes for the triangle of Speed, Cost, and Capability.

### I. The Sprinter (Speed, Chat, & Fine-Tuning)

* **Model:** `@cf/meta/llama-3.1-8b-instruct-fast`
* **Role:** The high-volume frontline worker (e.g., TabbyTarot chats, MetaMirror roleplay).
* **Rationale:** Optimized for multilingual dialogue, this model offers extreme speed and cost-efficiency ($0.045 per M input tokens). Crucially, the non-fast variant supports LoRA, securing our path for future fine-tuning.

### II. The Sage (Heavy Reasoning & Synthesis)

* **Model:** `@cf/openai/gpt-oss-120b`
* **Role:** Deep financial synthesis (WealthInnovation) and complex content drafting (ContentGuru).
* **Rationale:** At 120 billion parameters, this is the flagship open-weight model for agentic tasks and powerful reasoning. It natively supports a `reasoning` configuration object, allowing us to dial compute effort up or down.

### III. The Seer (Vision & UI Analysis)

* **Model:** `@cf/meta/llama-4-scout-17b-16e-instruct`
* **Role:** The "eyes" of our agents (e.g., analyzing competitor sites, transcribing visual data).
* **Rationale:** Natively multimodal, leveraging a 16-expert Mixture-of-Experts (MoE) architecture. This provides 17B-level intelligence while keeping inference compute highly efficient.

### IV. The Artist (Image Generation)

* **Model:** `@cf/black-forest-labs/flux-2-dev`
* **Role:** Asset generation (TabbyTarot cards, blog headers).
* **Rationale:** SOTA text-to-image generation delivering highly realistic, detailed 1024x1024 images with multi-reference support.

---

## 3. Integration Architecture: The Unified API

To minimize backend complexity in Moltworker, we will standardize our API interactions.

* **Text and Reasoning Models:** We will utilize the Cloudflare AI Gateway **OpenAI-Compatible Endpoint** (`/compat/chat/completions`). This allows us to use a single, standardized JSON payload structure (`{"messages": [{"role": "user", "content": "..."}]}`) across all text models. We hot-swap the model simply by changing the `model` string in the payload (e.g., `"model": "openai/gpt-oss-120b"`).
* **Image Generation Exception:** The `flux-2-dev` model is the sole exception. It requires a `multipart/form-data` request containing the `prompt`, `width`, and `height`. This will require a distinct API client method in the backend.

---

## 4. Operationalizing the Platform

### 4.1 Tracing and Observability (100% Cloudflare Native)

We are explicitly rejecting external tools like Datadog and Honeycomb to keep data gravity and costs managed within Cloudflare.

* **Custom Metadata:** Every request sent from the Moltworker backend to AI Gateway will include a `cf-aig-metadata` header. We will pass flattened JSON containing keys like `tenant_id`, `project` (e.g., "TabbyTarot"), and `intent`.
* **Log Storage & Export:** AI Gateway persists logs (including prompts, responses, and token usage). We will configure **Workers Logpush** to securely export these logs to **Cloudflare R2**. From R2, we can query our logs natively using Cloudflare D1 or Athena for deep operational analytics.

### 4.2 Caching Strategy (Semantic Keys)

Caching LLM requests is complex because slight variations in prompts break cache hits. We will use surgical, deterministic caching.

* **Implementation:** We will use the `cf-aig-cache-key` header to override the default cache key.
* **Use Case:** If TabbyTarot generates a "Daily Global Horoscope", the backend will pass `cf-aig-cache-key: daily_horo_2026_02_10`. All subsequent requests for that day will be served instantly from Cloudflare's edge cache, completely bypassing the model provider and saving 100% of the token costs.

### 4.3 RLHF (Reinforcement Learning from Human Feedback)

To build a moat of proprietary data, we must capture user satisfaction.

* **Implementation:** The Svelte 5 frontend will feature feedback mechanisms (thumbs up/down). When clicked, the Moltworker backend will invoke the `patchLog` method via the AI binding (e.g., `env.AI.gateway("my-gateway").patchLog(logId, { feedback: 1, score: 100 })`).
* **Impact:** This annotates the specific AI Gateway log with human feedback, which becomes the foundation for our platform evaluations.

### 4.4 Evaluations and A/B/n Testing

We will mathematically prove our model choices rather than guessing.

* **Evaluations:** Using the AI Gateway dashboard, we will create "Datasets" from our logs and run structured Evaluations against them. The evaluators will automatically score models based on Cost, Speed, and the Human Feedback we gathered via `patchLog`.
* **A/B/n Routing:** When introducing a new model, we will use AI Gateway's Dynamic Routing to create a **Percentage Split**. We can route 90% of traffic to our baseline model and 10% to a challenger model, letting the Evaluation metrics prove the winner.

### 4.5 Explainability

We require transparency into how models arrive at complex answers (e.g., for WealthInnovation).

* **Implementation:** We will rely on the native capabilities of `@cf/openai/gpt-oss-120b`. The REST API payload for this model accepts a `reasoning` object where we can define `effort` ("low", "medium", "high") and request a `summary` of the reasoning performed ("auto", "concise", "detailed"). This provides structured explainability without having to parse raw `<think>` tokens from the output text.

### 4.6 Future-Proofing: LoRA (Fine-Tuning)

As our enterprise platforms require specialized brand voices or compliance knowledge, we will utilize Low-Rank Adaptation (LoRA).

* **Implementation:** Cloudflare Workers AI supports LoRA natively on select models (like `llama-3.1-8b-instruct`).
* **Architecture:** The backend will simply append the `lora` string parameter (referencing our fine-tuned weights) to the standard API request. This allows a single, fast base model to dynamically swap personalities per-tenant with zero infrastructure overhead.

---

## 5. Immediate Next Steps for Engineering

1. **Provision Infrastructure:** Create the AI Gateway in the Cloudflare Dashboard and generate the required API tokens with `AI Gateway - Edit` and `Workers AI Read` permissions.
2. **Update API Clients:** Refactor `src/client/api.ts` in the Moltworker repo to point to the `/compat/chat/completions` endpoint for text, and build the `multipart/form-data` handler for `flux-2-dev`.
3. **Establish Routing:** Configure Dynamic Routing rules in the Gateway to parse the `intent` metadata key.
4. **Deploy Logpush:** Set up the R2 bucket and configure Logpush to begin capturing our persistent telemetry baseline.