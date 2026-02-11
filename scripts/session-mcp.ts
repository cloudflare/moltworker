import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
// os import removed - unused

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const CONDUCTOR_DIR = path.join(ROOT_DIR, "conductor");

// Helper to ensure directory exists
async function ensureDir(dirPath: string) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch {
    /* dir exists */
  }
}

// Templates for different session types
const TEMPLATES = {
  executive_strategy: (date: string) =>
    `# Executive Strategy Session - ${date}` +
    `\n## 1. State of the Union` +
    `\n*   **Current Goal:** [Reference GOAL.md]` +
    `\n*   **Brand Status:** [Reference brand-positioning.md]` +
    `\n*   **Recent Wins:**` +
    `\n    *   ...` +
    `\n*   **Critical Blockers:**` +
    `\n    *   ...` +
    `\n## 2. Market Radar Review` +
    `\n*   [ ] Review conductor/market-radar.md` +
    `\n*   *New insights/competitors?*` +
    `\n## 3. Financial Pulse` +
    `\n*   *Burn rate / Runway check*` +
    `\n*   *Revenue drivers check*` +
    `\n## 4. Strategic Directives (Next Objectives)` +
    `\n*   [ ] Define next major milestone` +
    `\n*   [ ] Adjust prioritization in conductor/prioritization-framework.md` +
    `\n## 5. Decisions / Action Items` +
    `\n*   ...`,

  feature_design: (featureName: string, date: string) =>
    `# Feature Design Session: ${featureName}` +
    `\n**Date:** ${date}` +
    `\n## 1. Deep Research & Authoritative Sources` +
    `\n> *Action: Research underlying technologies, modern patterns, and stable practices.*` +
    `\n*   [ ] **Internal Docs:** (Audit existing books/)` +
    `\n*   [ ] **External Docs:** (Link authoritative sources, e.g., Stripe docs, Cloudflare docs)` +
    `\n*   [ ] **Patterns:** (Identify relevant design patterns)` +
    `\n## 2. Requirements & Specifications` +
    `\n*   **User Story:** ...` +
    `\n*   **Functional Requirements:**` +
    `\n    *   ...` +
    `\n*   **Non-Functional Requirements (Perf, Scale):**` +
    `\n    *   ...` +
    `\n## 3. Alignment & Standards` +
    `\n*   [ ] **Tech Stack:** Confirm alignment with conductor/tech-stack.md (Bun, Svelte 5, Drizzle, etc.)` +
    `\n*   [ ] **Future Roadmap:** Does this conflict with planned items?` +
    `\n## 4. 360 Review Checklist` +
    `\n*   [ ] **Documentation:** Update plan for books/` +
    `\n*   [ ] **Security:** (AuthZ, Data Privacy, Secrets) - *Consult Security MCP*` +
    `\n*   [ ] **Architecture:** (Data flow, API design) - *Consult Architect MCP*` +
    `\n*   [ ] **Product:** (UX flow, Value prop)` +
    `\n*   [ ] **Finance:** (Cost to operate, ROI estimate)` +
    `\n*   [ ] **Executive:** (Strategic alignment)` +
    `\n## 5. Implementation Plan (Draft)` +
    `\n*   [ ] Define Phases` +
    `\n*   [ ] Define Tasks`,

  pitch_design: (target: string, date: string) =>
    `# Pitch Design Session: ${target}` +
    `\n**Date:** ${date}` +
    `\n**Target Audience:** ${target} (Client/Investor)` +
    `\n## 1. Audience Research` +
    `\n*   **Who are they?**` +
    `\n*   **What do they care about?** (Pain points, goals)` +
    `\n*   **Our Value Proposition for THEM:**` +
    `\n## 2. Narrative Arc` +
    `\n1.  **The Hook:** ...` +
    `\n2.  **The Problem:** ...` +
    `\n3.  **The Solution (ContentGuru):** ...` +
    `\n4.  **The Proof:** ...` +
    `\n5.  **The Ask:** ...` +
    `\n## 3. Presentation Structure (Slides)` +
    `\n*   [ ] Slide 1: Title` +
    `\n*   [ ] Slide 2: ...` +
    `\n## 4. Supporting Materials` +
    `\n*   [ ] Demo Video required?` +
    `\n*   [ ] One-pager PDF?`,

  triage: (date: string, tasks: string) =>
    `# Triage Session - ${date}` +
    `\n## 1. In-Progress Review` +
    `\n${tasks}` +
    `\n## 2. Backlog Grooming` +
    `\n*   [ ] Review conductor/tracks.md for stalled tracks.` +
    `\n*   [ ] Check conductor/incidents/ for open issues.` +
    `\n## 3. Assignments` +
    `\n*   *Assign actions to specific owners.*`,

  retrospective: (date: string, scope: string) =>
    `# Retrospective Session: ${scope}` +
    `\n**Date:** ${date}` +
    `\n## 1. Context` +
    `\n*   **Scope:** ${scope} (e.g., Last Sprint, Feature Release, Incident)` +
    `\n*   **Participants:** ...` +
    `\n## 2. Start / Stop / Continue` +
    `\n### 🟢 Start (What should we begin doing?)` +
    `\n*   ...` +
    `\n### 🔴 Stop (What isn't working?)` +
    `\n*   ...` +
    `\n### 🟡 Continue (What is working well?)` +
    `\n*   ...` +
    `\n## 3. Metrics Review` +
    `\n*   *Did we hit our targets?*` +
    `\n*   *Velocity / Quality check*` +
    `\n## 4. Action Items` +
    `\n*   [ ] Item 1 (Owner: ...)`,

  compliance_audit: (date: string, scope: string) =>
    `# Compliance & Audit Session: ${scope}` +
    `\n**Date:** ${date}` +
    `\n## 1. Scope Definition` +
    `\n*   **Focus Area:** ${scope} (e.g., SOC2, GDPR, License Audit, Secrets Scan)` +
    `\n## 2. Security & Privacy Checklist` +
    `\n*   [ ] **Secrets:** Run security-mcp or gitleaks check.` +
    `\n*   [ ] **PII:** Identify any new PII collection points.` +
    `\n*   [ ] **Access Control:** Review new permissions/roles.` +
    `\n*   [ ] **Dependencies:** Check bun.lock for vulnerable packages.` +
    `\n## 3. Legal & Regulatory` +
    `\n*   [ ] **Licenses:** Verify all 3rd-party libs have compatible licenses.` +
    `\n*   [ ] **Terms of Service:** Do recent changes affect ToS?` +
    `\n*   [ ] **Data Residency:** Are we storing data in compliant regions?` +
    `\n## 4. Findings & Remediation` +
    `\n*   *Log findings here...*` +
    `\n## 5. Sign-off` +
    `\n*   [ ] Security Lead` +
    `\n*   [ ] Legal Lead`,

  best_practices_review: (date: string, scope: string) =>
    `# Best Practices & Pattern Review: ${scope}` +
    `\n**Date:** ${date}` +
    `\n## 1. Authoritative Sources Check` +
    `\n> *Action: Verify alignment with official docs and internal standards.*` +
    `\n*   [ ] **Svelte 5 Runes:** Are we using $state, $derived correctly? (No legacy stores?)` +
    `\n*   [ ] **Bun/Elysia:** Are we following latest patterns?` +
    `\n*   [ ] **Drizzle ORM:** Query efficiency, transaction usage.` +
    `\n*   [ ] **Internal Style Guide:** Check conductor/product-guidelines.md.` +
    `\n## 2. Anti-Pattern Detection` +
    `\n*   [ ] **Global State:** Is any state global that should be local?` +
    `\n*   [ ] **Prop Drilling:** Excessive passing of props? (Use Context/Snippets)` +
    `\n*   [ ] **Tight Coupling:** Can modules be tested in isolation?` +
    `\n*   [ ] **Magic Strings/Numbers:** Extract to constants/configs.` +
    `\n*   [ ] **"Any" Types:** Strict TypeScript compliance check.` +
    `\n## 3. Code Quality Metrics` +
    `\n*   *Complexity check (Cyclomatic complexity)*` +
    `\n*   *Test Coverage for this scope*` +
    `\n## 4. Refactoring Candidates` +
    `\n*   *Identify specific files/functions to improve.*`,

  experimentation_growth: (date: string, hypothesis: string) =>
    `# Experimentation & Growth Session` +
    `\n**Date:** ${date}` +
    `\n**Hypothesis:** ${hypothesis || "Pending Definition"}` +
    `\n## 1. Experiment Design` +
    `\n*   **Hypothesis:** If we change [Variable X], then [Metric Y] will improve because [Reason Z].` +
    `\n*   **Type:** (A/B Test, Multivariate, Rollout)` +
    `\n*   **Duration:** (e.g., 2 weeks)` +
    `\n## 2. Metrics & Significance` +
    `\n*   **Primary Metric (KPI):** (e.g., Conversion Rate)` +
    `\n*   **Guardrail Metrics:** (e.g., Latency, Error Rate - ensure no degradation)` +
    `\n*   **Success Criteria:** (e.g., > 2% lift with 95% confidence)` +
    `\n## 3. Variants` +
    `\n*   **Control (A):** Existing behavior.` +
    `\n*   **Treatment (B):** ...` +
    `\n## 4. Implementation Specification` +
    `\n*   [ ] **Feature Flags:** Define flag name/keys.` +
    `\n*   [ ] **Tracking:** Define events/properties to log.` +
    `\n*   [ ] **Engineering Task:** Link to implementation track.` +
    `\n## 5. Power Analysis (Optional)` +
    `\n*   *Estimated traffic needed for significance.*`,

  data_analysis: (date: string, objective: string) =>
    `# Data Analysis & Insights Session` +
    `\n**Date:** ${date}` +
    `\n**Objective:** ${objective || "Exploratory Analysis"}` +
    `\n## 1. Objective & Scope` +
    `\n*   **Question:** What are we trying to answer?` +
    `\n*   **Scope:** Time range, segments, data sources.` +
    `\n## 2. Data Sources & Munging` +
    `\n*   [ ] **Sources:** (Database, Logs, 3rd Party API)` +
    `\n*   [ ] **Cleaning Steps:** (Handle nulls, duplicates, type conversion)` +
    `\n*   [ ] **Transformations:** (Aggregations, Derived fields)` +
    `\n## 3. Outlier Detection` +
    `\n*   *Identify anomalies or data quality issues.*` +
    `\n*   *Exclude or investigate?*` +
    `\n## 4. Findings & Insights` +
    `\n*   **Finding 1:** ...` +
    `\n*   **Finding 2:** ...` +
    `\n## 5. Recommendations` +
    `\n*   *Actionable next steps based on data.*`,

  semantic_model_design: (date: string, concept: string) =>
    `# Semantic Model Design (Lightdash Prep)` +
    `\n**Date:** ${date}` +
    `\n**Concept:** ${concept || "Core Business Entity"}` +
    `\n## 1. Business Concept` +
    `\n*   **Description:** What real-world entity are we modeling?` +
    `\n*   **Users:** Who will query this? (Marketing, Execs, Product)` +
    `\n## 2. Dimensional Modeling` +
    `\n*   **Fact Table (Measurements):**` +
    `\n    *   *Metric 1*` +
    `\n    *   *Metric 2*` +
    `\n*   **Dimension Tables (Context):**` +
    `\n    *   *Dimension 1 (Time, User, Region)*` +
    `\n    *   *Dimension 2*` +
    `\n## 3. Metric Definitions (Lightdash/dbt)` +
    `\n*   [ ] **Metric Name:** ...` +
    `\n*   [ ] **Calculation Logic:** (SQL snippet)` +
    `\n*   [ ] **Format:** (Currency, Percent, Number)` +
    `\n## 4. Data Lineage & SQL Logic` +
    `\n*   **Source Tables:** ...` +
    `\n*   **Joins:** ...` +
    `\n*   **Filters:** ...` +
    `\n## 5. Implementation Plan` +
    `\n*   [ ] Create View/Table in Drizzle/SQL.` +
    `\n*   [ ] Define Lightdash YAML/configuration.`,

  incident_response: (date: string, incidentTitle: string) =>
    `# Incident Response: ${incidentTitle}` +
    `\n**Date:** ${date}` +
    `\n**Status:** [Active | Monitoring | Resolved]` +
    `\n## 1. Situation Report (SitRep)` +
    `\n*   **Impact:** (Who is affected? How severe?)` +
    `\n*   **Symptoms:** (Error messages, latency spikes)` +
    `\n## 2. Containment Strategy` +
    `\n*   [ ] Rollback recent changes?` +
    `\n*   [ ] Feature flag kill-switch?` +
    `\n*   [ ] Rate limiting / Blocking traffic?` +
    `\n## 3. Timeline (Log events as they happen)` +
    `\n*   **[HH:MM]** Incident detected.` +
    `\n*   **[HH:MM]** ...` +
    `\n## 4. Root Cause Analysis (RCA)` +
    `\n*   *Why did this happen? (5 Whys)*` +
    `\n## 5. Remediation & Prevention` +
    `\n*   [ ] Immediate fix.` +
    `\n*   [ ] Long-term prevention task.`,

  release_gtm: (date: string, releaseName: string) =>
    `# Release & GTM Readiness: ${releaseName}` +
    `\n**Date:** ${date}` +
    `\n## 1. Release Manifest` +
    `\n*   **Version:** ...` +
    `\n*   **Key Features:** ...` +
    `\n## 2. Pre-Flight Checks` +
    `\n*   [ ] **Migrations:** Database schema changes applied/tested?` +
    `\n*   [ ] **Environment Variables:** Secrets added to Prod?` +
    `\n*   [ ] **Feature Flags:** Default values set correctly?` +
    `\n*   [ ] **Smoke Tests:** Critical paths verified in Staging?` +
    `\n## 3. Rollout Strategy` +
    `\n*   **Type:** (Big Bang / Canary / Phased)` +
    `\n*   **Rollback Plan:** (Command to revert: ...)` +
    `\n## 4. Communications (GTM)` +
    `\n*   [ ] **Internal:** Notify Support/Sales teams.` +
    `\n*   [ ] **External:** Release notes / Blog post.` +
    `\n*   [ ] **Status Page:** Update status.contentguru.video?`,

  user_research: (date: string, topic: string) =>
    `# User Research: ${topic}` +
    `\n**Date:** ${date}` +
    `\n**Topic:** ${topic}` +
    `\n## 1. Research Goal` +
    `\n*   *What do we want to learn?*` +
    `\n## 2. Methodology` +
    `\n*   **Type:** (Interview, Survey, Usability Test)` +
    `\n*   **Participants/Personas:** ...` +
    `\n## 3. Script / Questions` +
    `\n*   Q1: ...` +
    `\n*   Q2: ...` +
    `\n## 4. Synthesis & Key Themes` +
    `\n*   **Theme 1:** ...` +
    `\n*   **Theme 2:** ...` +
    `\n## 5. Raw Notes / Voice of the Customer` +
    `\n*   "Quote from user..."`
};

export async function registerSessionTools(server: McpServer) {
  server.registerTool(
    "start_session",
    {
      description:
        "Initiates a structured work session. Creates necessary workspace files and returns a guide.",
      inputSchema: z.object({
        type: z
          .enum([
            "executive_strategy",
            "feature_design",
            "pitch_design",
            "triage",
            "retrospective",
            "compliance_audit",
            "best_practices_review",
            "experimentation_growth",
            "data_analysis",
            "semantic_model_design",
            "incident_response",
            "release_gtm",
            "user_research"
          ])
          .describe("The type of session to start."),
        context: z
          .string()
          .optional()
          .describe("Additional context (e.g., Feature Name, Scope, Client Name, or Hypothesis).")
      })
    },
    async ({ type, context }) => {
      await ensureDir(CONDUCTOR_DIR);
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
      const timestamp = new Date().toISOString();

      let filePath = "";
      let content = "";
      let responseText = "";

      if (type === "executive_strategy") {
        const meetingsDir = path.join(CONDUCTOR_DIR, "meetings");
        await ensureDir(meetingsDir);
        filePath = path.join(meetingsDir, `${date}_strategy_session.md`);
        content = TEMPLATES.executive_strategy(timestamp);
        responseText = `Started Executive Strategy Session.\nFile created: ${filePath}\n\nPlease follow the agenda in the file.`;
      } else if (type === "feature_design") {
        const featureName = context || "untitled_feature";
        const safeName = featureName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .slice(0, 30);

        // Create a new track directory for this feature
        const tracksDir = path.join(CONDUCTOR_DIR, "tracks", `${safeName}_${date}`);
        await ensureDir(tracksDir);

        filePath = path.join(tracksDir, "design_session.md");
        content = TEMPLATES.feature_design(featureName, timestamp);

        // Also init metadata if new track
        const metaPath = path.join(tracksDir, "metadata.json");
        try {
          await fs.access(metaPath);
        } catch {
          await fs.writeFile(
            metaPath,
            JSON.stringify(
              { trackId: `${safeName}_${date}`, type: "feature", effort: "high" },
              null,
              2
            )
          );
        }

        responseText = `Started Feature Design Session for '${featureName}'.\nWorkspace: ${tracksDir}\nFile created: ${filePath}\n\nExecute the '360 Review' checklist using available agents.`;
      } else if (type === "pitch_design") {
        const target = context || "General";
        const safeTarget = target.toLowerCase().replace(/[^a-z0-9]+/g, "_");
        const decksDir = path.join(CONDUCTOR_DIR, "presentations");
        await ensureDir(decksDir);

        filePath = path.join(decksDir, `${date}_pitch_${safeTarget}.md`);
        content = TEMPLATES.pitch_design(target, timestamp);
        responseText = `Started Pitch Design Session for '${target}'.\nFile created: ${filePath}`;
      } else if (type === "triage") {
        // Fetch tasks for context
        const tracksFile = path.join(CONDUCTOR_DIR, "tracks.md");
        let tasks = "*No tracks file found.*";
        try {
          const trackData = await fs.readFile(tracksFile, "utf-8");
          const lines = trackData.split("\n");
          const active = lines
            .filter((l) => l.includes("[~]"))
            .slice(0, 10)
            .join("\n");
          tasks = active || "*No active tracks found.*";
        } catch {
          /* file not found - ignore */
        }

        const meetingsDir = path.join(CONDUCTOR_DIR, "meetings");
        await ensureDir(meetingsDir);
        filePath = path.join(meetingsDir, `${date}_triage.md`);
        content = TEMPLATES.triage(timestamp, tasks);
        responseText = `Started Triage Session.\nFile created: ${filePath}\n\nReviewing active tracks...`;
      } else if (type === "retrospective") {
        const scope = context || "General";
        const meetingsDir = path.join(CONDUCTOR_DIR, "meetings");
        await ensureDir(meetingsDir);
        filePath = path.join(meetingsDir, `${date}_retro.md`);
        content = TEMPLATES.retrospective(timestamp, scope);
        responseText = `Started Retrospective Session.\nFile created: ${filePath}`;
      } else if (type === "compliance_audit") {
        const scope = context || "General";
        const complianceDir = path.join(CONDUCTOR_DIR, "compliance");
        await ensureDir(complianceDir);
        filePath = path.join(
          complianceDir,
          `${date}_audit_${scope.replace(/[^a-z0-9]/gi, "_")}.md`
        );
        content = TEMPLATES.compliance_audit(timestamp, scope);
        responseText = `Started Compliance Audit Session.\nFile created: ${filePath}\n\nReference 'security-mcp' for scans.`;
      } else if (type === "best_practices_review") {
        const scope = context || "General";
        const reviewDir = path.join(CONDUCTOR_DIR, "engineering", "reviews");
        await ensureDir(reviewDir);
        filePath = path.join(
          reviewDir,
          `${date}_pattern_review_${scope.replace(/[^a-z0-9]/gi, "_")}.md`
        );
        content = TEMPLATES.best_practices_review(timestamp, scope);
        responseText = `Started Best Practices Review.\nFile created: ${filePath}\n\nFocus on Authoritative Sources and Anti-patterns.`;
      } else if (type === "experimentation_growth") {
        const hypothesis = context || "";
        const growthDir = path.join(CONDUCTOR_DIR, "growth", "experiments");
        await ensureDir(growthDir);
        // Create filename based on hypothesis snippet or default
        const safeName = hypothesis
          ? hypothesis.slice(0, 20).replace(/[^a-z0-9]/gi, "_")
          : "new_experiment";
        filePath = path.join(growthDir, `${date}_exp_${safeName}.md`);
        content = TEMPLATES.experimentation_growth(timestamp, hypothesis);
        responseText = `Started Experimentation & Growth Session.\nFile created: ${filePath}\n\nDesign your hypothesis and metrics.`;
      } else if (type === "data_analysis") {
        const objective = context || "General";
        const analysisDir = path.join(CONDUCTOR_DIR, "data", "analysis");
        await ensureDir(analysisDir);
        filePath = path.join(
          analysisDir,
          `${date}_analysis_${objective.replace(/[^a-z0-9]/gi, "_").slice(0, 30)}.md`
        );
        content = TEMPLATES.data_analysis(timestamp, objective);
        responseText = `Started Data Analysis Session.\nFile created: ${filePath}\n\nProceed with data munging and insight generation.`;
      } else if (type === "semantic_model_design") {
        const concept = context || "General";
        const modelsDir = path.join(CONDUCTOR_DIR, "data", "models");
        await ensureDir(modelsDir);
        filePath = path.join(modelsDir, `${date}_model_${concept.replace(/[^a-z0-9]/gi, "_")}.md`);
        content = TEMPLATES.semantic_model_design(timestamp, concept);
        responseText = `Started Semantic Model Design Session.\nFile created: ${filePath}\n\nDefine dimensions, metrics, and lineage for Lightdash.`;
      } else if (type === "incident_response") {
        const incidentTitle = context || "Severity_1_Outage";
        const incidentsDir = path.join(CONDUCTOR_DIR, "incidents");
        await ensureDir(incidentsDir);
        filePath = path.join(
          incidentsDir,
          `${date}_${incidentTitle.replace(/[^a-z0-9]/gi, "_")}.md`
        );
        content = TEMPLATES.incident_response(timestamp, incidentTitle);
        responseText = `Started Incident Response Protocol.\nFile created: ${filePath}\n\n🚨 Focus on CONTAINMENT first, then RCA.`;
      } else if (type === "release_gtm") {
        const releaseName = context || "v1.0.0";
        const releasesDir = path.join(CONDUCTOR_DIR, "releases");
        await ensureDir(releasesDir);
        filePath = path.join(
          releasesDir,
          `${date}_release_${releaseName.replace(/[^a-z0-9]/gi, "_")}.md`
        );
        content = TEMPLATES.release_gtm(timestamp, releaseName);
        responseText = `Started Release & GTM Readiness.\nFile created: ${filePath}\n\nVerify pre-flight checks before deploying.`;
      } else if (type === "user_research") {
        const topic = context || "General_Feedback";
        const researchDir = path.join(CONDUCTOR_DIR, "research");
        await ensureDir(researchDir);
        filePath = path.join(
          researchDir,
          `${date}_research_${topic.replace(/[^a-z0-9]/gi, "_")}.md`
        );
        content = TEMPLATES.user_research(timestamp, topic);
        responseText = `Started User Research Session.\nFile created: ${filePath}\n\nCapture raw insights and synthesize key themes.`;
      }

      // Write the file
      try {
        // Don't overwrite if exists, append timestamped update? No, for sessions, maybe just create unique?
        // Let's check existence.
        try {
          await fs.access(filePath);
          // If exists, we might want to append or just notify.
          // For now, let's append a new session header if it's the same day, or just return existing.
          const existing = await fs.readFile(filePath, "utf-8");
          if (!existing.includes(timestamp)) {
            // It's a re-open
            responseText += "\n(File already existed, opened for continuation)";
          }
        } catch {
          /* file not found - ignore */
        }
        await fs.writeFile(filePath, content);

        return {
          content: [
            {
              type: "text",
              text: responseText
            }
          ]
        };
      } catch (e: unknown) {
        const err = e as Error;
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to create session file: ${err.message}` }]
        };
      }
    }
  );
}
