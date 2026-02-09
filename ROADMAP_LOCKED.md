\# ROADMAP\_LOCKED



This roadmap is locked and should not be modified without explicit approval.



\## M-GP0

\- Implemented as an Anthropic-only router with deterministic caps and tier routing.

\- Enforces NO\_LLM sources for cron, scheduled, and heartbeat traffic.

\- Requires explicit source classification (fail-closed).

\- Applies budgets and rate limits before any model call.

\- Emits structured decision logs for auditing.



