# Phase 1 Backend Adaptation: Tenant Resolution and Sandbox ID Specification

## 1. Executive Summary
This report serves as the definitive technical specification for the Tenant Resolution and Sandbox Identity mechanisms within the StreamKinetics Moltworker architecture. As the platform prepares for Phase 1 backend readiness, the transition from a monolithic proof-of-concept to a scalable, multi-tenant SaaS infrastructure requires a rigorous definition of how incoming HTTP requests are mapped to isolated backend resources.

The core objective of this research spike was to resolve ambiguities regarding the authoritative tenant signal and to define a Sandbox ID format that satisfies the intersection of constraints imposed by Cloudflare Workers, D1 Databases, R2 Storage, KV Namespaces, and AI Gateway.

Key Decisions and Findings:

- Authoritative Signal: The Host Header (derived from the request URL) is the only authoritative signal for tenant identification in production environments. This leverages Cloudflare’s "SSL for SaaS" infrastructure to ensure that only validated, provisioned hostnames can trigger tenant logic.
- Development Overrides: The use of X-Tenant-Override headers is strictly prohibited in production due to severe risks of cache poisoning and authorization bypass. Such overrides are permitted only in environments explicitly flagged as DEV_MODE.
- Sandbox ID Format: To accommodate the strictly conflicting constraints of downstream services—most notably the 32-character recommended limit for D1 databases and the strict lowercase/hyphen-only requirement of R2—the platform will adopt a Stable Short Hash (SSH) format: sk-[hash].
- Derivation Logic: The Sandbox ID will be derived by computing a SHA-256 hash of the authoritative Tenant ID, truncated to the first 16 hexadecimal characters, and prefixed with sk-. This results in a 19-character identifier (e.g., sk-a1b2c3d4e5f67890) that is deterministic, collision-resistant (64-bit entropy), and compliant with all platform limits.

This document details the architectural reasoning, security threat models, platform constraint analysis, and implementation logic required to operationalize these decisions. It is intended for the engineering team responsible for the Phase 1 backend adaptation of the OpenClaw integration.

## 2. Architectural Context and Problem Definition

### 2.1 The Moltworker Stack
StreamKinetics Moltworker represents a cutting-edge integration of the OpenClaw AI agent framework within a serverless edge environment. Unlike traditional containerized deployments, Moltworker leverages the Cloudflare Stack—specifically Workers, Durable Objects, and the Sandbox SDK—to provide ephemeral, secure execution environments for AI agents.

In this architecture, "Tenancy" is not merely a logical separation of rows in a database; it is a physical and operational isolation boundary. Each tenant (user or organization) requires:

- Isolated Storage: A dedicated D1 database or distinct shard for structured data.
- Object Storage: A dedicated path or bucket in R2 for unstructured artifacts (logs, generated files).
- Compute Isolation: A specific configuration passed to the Cloudflare Sandbox to ensure the AI agent operates within defined resource quotas.
- Observability: Distinct logging and cost-tracking via Cloudflare AI Gateway.

### 2.2 The Tenant Resolution Challenge
The entry point for any interaction with Moltworker is the HTTP request. Before any backend logic can execute, the system must answer the fundamental question: "Who is calling?"

In a single-tenant environment, this is trivial. In a multi-tenant SaaS running at the edge, this becomes complex due to:

- Edge Termination: Requests are terminated at hundreds of global data centers. The resolution logic must be replicated and consistent globally.
- Spoofing Risks: Malicious actors may manipulate HTTP headers to access another tenant's isolated environment.
- Development Velocity: Developers need ways to simulate different tenants without modifying global DNS records.

### 2.3 The Sandbox Identity Challenge
Once a tenant is identified (e.g., Tenant: Acme Corp), the system must provision or access resources. While "Acme Corp" is a human-readable identifier, it is unsuitable for technical resource naming due to variable lengths, special characters, and potential mutability (rebranding).

The system requires a Sandbox ID: a technical, immutable, and strictly formatted identifier used to name the underlying infrastructure resources. The challenge lies in the Constraint Intersection:

- D1 prefers short names (<32 chars) for tooling stability.
- R2 demands strict lowercase and no underscores.
- AI Gateway allows longer names but has its own character set limits.
- Internal UUIDs (36 chars) are often too long or contain restricted characters when combined with prefixes.

The Sandbox ID must be the "lowest common denominator" that works safely across all these services without requiring complex mapping tables or stateful lookups.

## 3. Tenant Resolution Strategy
The security of a multi-tenant system is predicated on the reliability of the tenant resolution mechanism. If an attacker can trick the system into resolving their request to a victim's tenant ID, the isolation guarantees of the entire stack are compromised.

### 3.1 Analysis of Potential Signals
We evaluated four potential signals for identifying a tenant from an incoming HTTP request:

- Path Prefix: domain.com/tenant-a/api. Easy to implement; works on single domain. Breaks standard REST patterns; difficult to isolate at DNS/TLS level; prevents white-labeling (custom domains).
- JWT or Token: Authorization: Bearer <token>. Secure; carries cryptographic proof. Requires parsing body/header before routing; creates a chicken-and-egg problem for unauthenticated public endpoints (e.g., login pages, public assets).
- Custom Header: X-Tenant-ID: tenant-a. Simple for internal testing. Extremely insecure in public facing apps; highly susceptible to spoofing; requires trust in the client.
- Host Header: tenant-a.app.com. Standard for SaaS; relies on DNS; supports custom domains (app.acme.com). Requires DNS propagation; harder to simulate locally without /etc/hosts hacking.

### 3.2 The Authoritative Signal: Host Header
Based on the analysis of Cloudflare's architecture and industry best practices for SaaS, the Host Header is selected as the definitive, authoritative signal for tenant resolution in production.

#### 3.2.1 Mechanism of Trust
In the Cloudflare Workers environment, the request.url (and derived hostname) is trustworthy because:

- TLS Termination: Cloudflare handles the TLS handshake. For a request to reach the Worker with a specific hostname (e.g., app.acme.com), Cloudflare must hold a valid SSL certificate for that domain.
- Domain Control Validation: Cloudflare for SaaS requires active Domain Control Validation (DCV) before issuing certificates for custom hostnames. This ensures that the entity pointing the DNS record actually controls the domain.
- Routing Integrity: The Worker is bound to specific routes or zones. A request cannot accidentally hit the Worker with a hostname that hasn't been explicitly configured in the Cloudflare Dashboard or via the API.

#### 3.2.2 Handling Punycode and International Domains
Modern SaaS applications must support international customers who may use non-ASCII domains (e.g., munchen.de).

- Observation: Browsers and HTTP clients transmit these domains in their Punycode format (e.g., xn--mnchen-3ya.de) in the Host header to ensure ASCII compatibility.
- Requirement: The Moltworker resolution logic must treat the Punycode version as the canonical key for lookup.
- Implementation: The standard new URL(request.url).hostname JavaScript API in the Workers runtime automatically handles normalization. The Tenant Registry (KV/D1) must store the Punycode version of the domain to ensure O(1) lookups without complex runtime conversion logic.

### 3.3 The Risk of Override Headers
A critical question in the research spike was: "Are override headers permitted in non-prod only?" The definitive answer is yes.

#### 3.3.1 Threat Model: Cache Poisoning and Authorization Bypass
If the production environment accepts an X-Tenant-Override header, the following attack vectors open up:

- Cache Poisoning: An attacker requests https://tenant-a.com with X-Tenant-Override: tenant-b. If the backend serves Tenant B's content but Cloudflare caches it under the URL for Tenant A, subsequent legitimate users of Tenant A will see Tenant B's data. This is a catastrophic data leak.
- Bypass of Custom Domain Logic: Some tenants may have specific IP access rules or WAF settings attached to their custom domain. Using an override header on a generic domain (e.g., api.moltworker.com) allows an attacker to interact with the tenant's backend while bypassing domain-specific security controls.

#### 3.3.2 Development Mode Constraints
While dangerous in production, override headers are essential for developer velocity. They allow engineers to test "Tenant A" behavior against a local instance or a staging worker without manipulating local DNS files.

Constraint: The code path checking for X-Tenant-Override must be wrapped in a conditional block that checks a specific environment variable (e.g., ENVIRONMENT or DEV_MODE).

TypeScript // Safe Implementation Pattern
const isDev = env.ENVIRONMENT === "development";
if (isDev && request.headers.has("X-Tenant-Override")) {
    // Process override
}
This variable must be set via wrangler.toml for the [env.dev] environment and must not be present or set to true in the production configuration.3.4 Tenant Resolution Contract (Ordered Rules)The following logic defines the immutable contract for resolving a tenant. This order of operations must be implemented in the main entry point of the Worker.Initialization:Extract hostname from request.url.Load environment configuration (env.APP_DOMAIN, env.DEV_MODE).Development Override (Conditional):IF env.DEV_MODE is true:Check for X-Tenant-Override header.IF present:Validate format (alphanumeric, no special chars).IF valid: Return header value as TenantSlug.ELSE: Log warning, ignore header.Production Hostname Parsing:Case A: Subdomain on App Domain (e.g., tenant-a.moltworker.com)Check if hostname ends with env.APP_DOMAIN.Extract the prefix (subdomain).Return prefix as TenantSlug.Case B: Custom Domain (e.g., agent.custom-client.com)Perform a KV Lookup in TENANT_REGISTRY using hostname as the key.IF found: Return stored TenantSlug.ELSE: Proceed to Missing Tenant Handler.Final Validation:If TenantSlug is resolved, fetch the full TenantRecord (containing ID, config, SandboxID).If TenantRecord cannot be found (slug exists but record deleted/corrupted), treat as Missing Tenant.4. Sandbox Identity SpecificationOnce the tenant is resolved (e.g., slug: acme-corp), we must determine the Sandbox ID used to bind backend resources. The research indicates that a direct mapping (using the slug or a raw UUID) is unsafe due to platform constraints.4.1 Platform Constraint AnalysisWe analyzed the naming limitations of every Cloudflare service involved in Phase 1. The constraints are contradictory, requiring a "lowest common denominator" approach.4.1.1 Cloudflare R2 (Object Storage)R2 is the most restrictive regarding character sets.Limit: 3-63 characters.Charset: Lowercase letters, numbers, and hyphens only.Forbidden: Underscores (_), uppercase letters, periods (in some contexts), and starting/ending with a hyphen.Impact: We cannot use sk_{tenant_id} (underscore is forbidden). We cannot use raw UUIDs if they are upper-cased.4.1.2 Cloudflare D1 (SQL Database)D1 is the most restrictive regarding "safe" length.Documentation: Explicitly states "A good database name is... shorter than 32 characters".Hard Limits: While the underlying SQLite engine handles longer names, the Cloudflare control plane and Wrangler CLI tools have historically had issues with long binding names.Impact: A standard UUID is 36 characters. A prefix sk- + UUID is 39 characters. This exceeds the 32-character "safe zone," posing a risk of future instability or tooling errors.4.1.3 Cloudflare KV (Key-Value Store)Limit: 512 bytes for key names.Flexibility: High. However, binding names in wrangler.toml must be valid JavaScript identifiers (no dashes) if we want to access them as env.BINDING.Resolution: We will not name the binding after the tenant (which would require a new deployment per tenant). Instead, we use a single KV namespace and use the Sandbox ID as a key prefix (e.g., sk-abc1234:setting_key).4.1.4 AI GatewayLimit: 64 characters.Charset: URL-safe characters recommended.Impact: Not a bottleneck, provided we satisfy R2/D1 limits.4.2 The Collision ProblemThe "Tenant ID" in the system is likely a UUIDv4 (e.g., 123e4567-e89b-12d3-a456-426614174000).Direct Use: sk-123e4567-e89b-12d3-a456-426614174000 (39 chars).Violation: Too long for D1 safety (<32 chars).Slug Use: sk-acme-corp (Variable length).Violation: Slugs are mutable (companies rebrand) and can be extremely long (sk-the-very-long-company-name-ltd), breaking D1 limits.4.3 The Solution: Stable Short Hash (SSH)To strictly satisfy the requirement of being <32 characters (D1) and lowercase/hyphen-only (R2) while maintaining uniqueness, we must use a hashing strategy.4.3.1 Algorithm SelectionInput: The authoritative TenantUUID (immutable).Hash Function: SHA-256.Why? Native support in Cloudflare Workers via crypto.subtle (zero-dependency, high performance).Truncation: First 16 hexadecimal characters (64 bits).Formatting: Prefix with sk-.Final Format: sk-[16_hex_chars]Example: sk-a1b2c3d4e5f67890Total Length: 19 characters.Compliance:D1: 19 < 32 (Safe).R2: Lowercase, alphanumeric, hyphen (Safe).DNS/Container: Valid DNS label (Safe).4.3.2 Collision Probability AnalysisIs 16 hex characters (64 bits) enough?Entropy: $2^{64}$ unique combinations ($1.84 \times 10^{19}$).Birthday Paradox: The probability of a collision reaches 50% only after generating approximately $4 \times 10^9$ (4 billion) IDs.Risk Assessment: Even at the scale of a massive SaaS (e.g., 100 million tenants), the collision probability is statistically negligible ($~10^{-13}$).Safety Net: The provisioning logic will include a "Check-If-Exists" step. In the astronomically unlikely event of a collision, the system can append a suffix (e.g., sk-[hash]-2).5. Handling Missing or Unknown TenantsA critical aspect of the resolution contract is defining behavior when a tenant cannot be identified.5.1 Security vs. UsabilityThere is a tension between helping a user ("Did you mean X?") and preventing enumeration attacks.Enumeration Risk: If the system returns specific errors like "Tenant ID valid but no sandbox found" vs "Tenant ID invalid," an attacker can map out the entire customer base.5.2 The 404 StrategyThe research confirms that a consistent 404 Not Found is the preferred response for all failure modes regarding tenant resolution.Failure Scenarios:DNS Mismatch: Hostname points to Worker, but is not in Registry.Deleted Tenant: Hostname is in Registry, but deleted_at is set.Provisioning Lag: Tenant created, but KV propagation delay (usually ms) prevents resolution.Implementation Guidance:Response: HTTP 404.Body: Generic HTML/JSON. "The requested workspace could not be found."Logging: Crucial. While the user sees a generic error, the backend must log the event to Cloudflare AI Gateway or Workers Analytics.Metadata: { event: "resolution_failure", host: "bad-host.com", ip: "1.2.3.4" }.Alerting: High rates of resolution failures from a single IP should trigger WAF rules (Rate Limiting).6. Implementation Specifications6.1 Sandbox ID Generation Code (TypeScript)This code snippet utilizes the Web Crypto API, which is native to the V8 isolate and significantly faster than JavaScript-based implementations.TypeScript/**
 * Derives a deterministic, safe Sandbox ID from a Tenant UUID.
 * Format: sk-[16-char-hex-hash]
 */
export async function generateSandboxId(tenantUuid: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(tenantUuid);

  // SHA-256 is native and fast in Workers
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  // Convert to byte array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // Convert first 8 bytes (16 hex chars) to hex string
  const hexPart = hashArray
   .slice(0, 8) // Truncate to 64 bits
   .map(b => b.toString(16).padStart(2, '0'))
   .join('');

  return `sk-${hexPart}`;
}
6.2 Binding Validation LogicBefore interacting with any bound resource (D1, R2, KV), the Worker must validate that the SandboxID is syntactically valid. This prevents injection attacks where a corrupted database state might cause the Worker to attempt accessing invalid resources.TypeScriptconst SANDBOX_ID_REGEX = /^sk-[a-f0-9]{16}$/;

function validateBinding(sandboxId: string): boolean {
  if (!SANDBOX_ID_REGEX.test(sandboxId)) {
    console.error(`Security Alert: Invalid Sandbox ID format detected: ${sandboxId}`);
    return false;
  }
  return true;
}
6.3 AI Gateway IntegrationTo support the "Out of Scope" billing requirements in Phase 2, Phase 1 must ensure that tenant identity is correctly propagated to the AI Gateway for analytics.Header: cf-aig-metadataFormat: JSON string.Content:JSON{
  "tenant_id": "uuid-...",
  "sandbox_id": "sk-a1b2...",
  "environment": "production"
}
Constraint: AI Gateway limits metadata keys/values. Keep keys short and values flat (no nested objects).7. Test PlanTo ensure the robustness of this specification, the following test cases must be implemented in the CI/CD pipeline (vitest via wrangler test).CategoryTest Case IDDescriptionInputExpected OutputResolutionRES-001Prod: Valid HostnameHost: tenant-a.moltworker.comTenant: tenant-aResolutionRES-002Prod: Override HeaderHost: tenant-a..., X-Tenant-Override: tenant-bTenant: tenant-a (Header Ignored)ResolutionRES-003Dev: Override HeaderHost: localhost, X-Tenant-Override: tenant-b, ENV=DEVTenant: tenant-b (Header Accepted)ResolutionRES-004Punycode DomainHost: xn--mnchen-3ya.deTenant: muenchen (Resolved via KV)ID GenID-001DeterminismUUID: 123... (Run 2x)Outputs identical ID both times.ID GenID-002Length CheckUUID: 123...Length == 19 chars.ID GenID-003Charset CheckUUID: 123...Matches ^sk-[a-z0-9]+$SecuritySEC-001Host InjectionHost: <script>alert(1)</script>.com404 / 400 Bad RequestSecuritySEC-002Missing TenantHost: unknown.com404 Not Found (Generic Message)8. ConclusionPhase 1 backend readiness for StreamKinetics Moltworker hinges on a secure and deterministic foundation for identifying tenants and resources. By strictly enforcing Host Header authority and adopting the Stable Short Hash (SSH) format (sk-[hash]) for Sandbox IDs, we successfully navigate the conflicting constraints of the Cloudflare stack.This specification ensures:Security: Eliminating header-based overrides in production closes significant spoofing vulnerabilities.Stability: The 19-character Sandbox ID safely operates within the "safe zones" of D1 and R2, preventing future tooling failures.Scalability: The 64-bit entropy of the ID guarantees collision resistance well beyond the projected growth of the platform.Engineering teams should proceed immediately with implementing the generateSandboxId utility and the resolveTenant middleware as defined in this report.