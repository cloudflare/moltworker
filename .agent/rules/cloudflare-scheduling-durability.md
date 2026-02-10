---
trigger: always_on
---

Scheduling, Alarms & Workflows

## Context

Use this rule for asynchronous tasks, recurring jobs, or complex multi-step processes that might take longer than a standard HTTP request.

## Standards

1.  **Simple Delays (Agent API)**: Use `this.schedule(when, callback, data)` for tasks within an Agent.
    - `when`: Can be a number (seconds), a `Date` object, or a Cron string.
2.  **Complex Processes (Workflows)**: For reliable, multi-step execution with retries, extend `WorkflowEntrypoint`.
    - **Wait**: Use `step.sleep()` instead of `setTimeout`.
    - **Retry**: Configure retries via the `step.do` options object.
3.  **Durable Object Alarms**: For raw Durable Objects, use `this.ctx.storage.setAlarm()`.

## Code Pattern (Agent Scheduling)

````typescript
// Inside an Agent class
async scheduleReminder(userId: string) {
  // Run 'sendNotification' in 1 hour
  await this.schedule(3600, "sendNotification", { userId, msg: "Time's up!" });
}

async sendNotification(data: { userId: string, msg: string }) {
  // Logic here
}

## Code Pattern
```typescript
import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';

export class OrderProcessing extends WorkflowEntrypoint<Env, OrderParams> {
  async run(event: WorkflowEvent<OrderParams>, step: WorkflowStep) {
    const payment = await step.do('process-payment', {
      retries: { limit: 3, delay: '5 seconds', backoff: 'exponential' }
    }, async () => {
       return await processPayment(event.payload.amount);
    });

    await step.sleep('wait-for-inventory', '1 minute');

    await step.do('ship-item', async () => {
      await shipItem(event.payload.itemId);
    });
  }
}
````
