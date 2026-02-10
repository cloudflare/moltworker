<page>
---
title: Overview · Cloudflare Workflows docs
description: >-
  With Workflows, you can build applications that chain together multiple steps,
  automatically retry failed tasks,

  and persist state for minutes, hours, or even weeks - with no infrastructure
  to manage.
lastUpdated: 2025-12-11T17:16:40.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/workflows/
  md: https://developers.cloudflare.com/workflows/index.md
---

Build durable multi-step applications on Cloudflare Workers with Workflows.

Available on Free and Paid plans

With Workflows, you can build applications that chain together multiple steps, automatically retry failed tasks, and persist state for minutes, hours, or even weeks - with no infrastructure to manage.

Use Workflows to build reliable AI applications, process data pipelines, manage user lifecycle with automated emails and trial expirations, and implement human-in-the-loop approval systems.

**Workflows give you:**

* Durable multi-step execution without timeouts
* The ability to pause for external events or approvals
* Automatic retries and error handling
* Built-in observability and debugging

## Example

An image processing workflow that fetches from R2, generates an AI description, waits for approval, then publishes:

```ts
export class ImageProcessingWorkflow extends WorkflowEntrypoint {
  async run(event: WorkflowEvent, step: WorkflowStep) {
    const imageData = await step.do('fetch image', async () => {
      const object = await this.env.BUCKET.get(event.params.imageKey);
      return await object.arrayBuffer();
    });


    const description = await step.do('generate description', async () => {
      const imageArray = Array.from(new Uint8Array(imageData));
      return await this.env.AI.run('@cf/llava-hf/llava-1.5-7b-hf', {
        image: imageArray,
        prompt: 'Describe this image in one sentence',
        max_tokens: 50,
      });
    });


    await step.waitForEvent('await approval', {
      event: 'approved',
      timeout: '24 hours',
    });


    await step.do('publish', async () => {
      await this.env.BUCKET.put(`public/${event.params.imageKey}`, imageData);
    });
  }
}
```

[Get started](https://developers.cloudflare.com/workflows/get-started/guide/)

[Browse the examples](https://developers.cloudflare.com/workflows/examples/)

***

## Features

### Durable step execution

Break complex operations into durable steps with automatic retries and error handling.

[Learn about steps](https://developers.cloudflare.com/workflows/build/workers-api/)

### Sleep and scheduling

Pause workflows for seconds, hours, or days with `step.sleep()` and `step.sleepUntil()`.

[Add delays](https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/)

### Wait for external events

Wait for webhooks, user input, or external system responses before continuing execution.

[Handle events](https://developers.cloudflare.com/workflows/build/events-and-parameters/)

### Workflow lifecycle management

Trigger, pause, resume, and terminate workflow instances programmatically or via API.

[Manage instances](https://developers.cloudflare.com/workflows/build/trigger-workflows/)

***

## Related products

**[Workers](https://developers.cloudflare.com/workers/)**

Build serverless applications and deploy instantly across the globe for exceptional performance, reliability, and scale.

**[Pages](https://developers.cloudflare.com/pages/)**

Deploy dynamic front-end applications in record time.

***

## More resources

[Pricing](https://developers.cloudflare.com/workflows/reference/pricing/)

Learn more about how Workflows is priced.

[Limits](https://developers.cloudflare.com/workflows/reference/limits/)

Learn more about Workflow limits, and how to work within them.

[Storage options](https://developers.cloudflare.com/workers/platform/storage-options/)

Learn more about the storage and database options you can build on with Workers.

[Developer Discord](https://discord.cloudflare.com)

Connect with the Workers community on Discord to ask questions, show what you are building, and discuss the platform with other developers.

[@CloudflareDev](https://x.com/cloudflaredev)

Follow @CloudflareDev on Twitter to learn about product announcements, and what is new in Cloudflare Developer Platform.

</page>

<page>
---
title: 404 - Page Not Found · Cloudflare Workflows docs
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/workflows/404/
  md: https://developers.cloudflare.com/workflows/404/index.md
---

# 404

Check the URL, try using our [search](https://developers.cloudflare.com/search/) or try our LLM-friendly [llms.txt directory](https://developers.cloudflare.com/llms.txt).

</page>

<page>
---
title: Build with Workflows · Cloudflare Workflows docs
lastUpdated: 2024-10-24T11:52:00.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/workflows/build/
  md: https://developers.cloudflare.com/workflows/build/index.md
---

* [Workers API](https://developers.cloudflare.com/workflows/build/workers-api/)
* [Trigger Workflows](https://developers.cloudflare.com/workflows/build/trigger-workflows/)
* [Sleeping and retrying](https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/)
* [Events and parameters](https://developers.cloudflare.com/workflows/build/events-and-parameters/)
* [Local Development](https://developers.cloudflare.com/workflows/build/local-development/)
* [Rules of Workflows](https://developers.cloudflare.com/workflows/build/rules-of-workflows/)
* [Call Workflows from Pages](https://developers.cloudflare.com/workflows/build/call-workflows-from-pages/)
* [Test Workflows](https://developers.cloudflare.com/workers/testing/vitest-integration/test-apis/#workflows)
* [Visualize Workflows](https://developers.cloudflare.com/workflows/build/visualizer/)

</page>

<page>
---
title: Examples · Cloudflare Workflows docs
description: Explore the following examples for Workflows.
lastUpdated: 2025-08-18T14:27:42.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/workflows/examples/
  md: https://developers.cloudflare.com/workflows/examples/index.md
---

Explore the following examples for Workflows.

[Human-in-the-Loop Image Tagging with waitForEvent](https://developers.cloudflare.com/workflows/examples/wait-for-event/)

[Human-in-the-loop Workflow with waitForEvent API](https://developers.cloudflare.com/workflows/examples/wait-for-event/)

[Export and save D1 database](https://developers.cloudflare.com/workflows/examples/backup-d1/)

[Send invoice when shopping cart is checked out and paid for](https://developers.cloudflare.com/workflows/examples/backup-d1/)

[Integrate Workflows with Twilio](https://developers.cloudflare.com/workflows/examples/twilio/)

[Integrate Workflows with Twilio. Learn how to receive and send text messages and phone calls via APIs and Webhooks.](https://developers.cloudflare.com/workflows/examples/twilio/)

[Pay cart and send invoice](https://developers.cloudflare.com/workflows/examples/send-invoices/)

[Send invoice when shopping cart is checked out and paid for](https://developers.cloudflare.com/workflows/examples/send-invoices/)

</page>

<page>
---
title: Get started · Cloudflare Workflows docs
lastUpdated: 2026-01-22T21:38:43.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/workflows/get-started/
  md: https://developers.cloudflare.com/workflows/get-started/index.md
---

* [Build your first Workflow](https://developers.cloudflare.com/workflows/get-started/guide/)
* [Build a Durable AI Agent](https://developers.cloudflare.com/workflows/get-started/durable-agents/)

</page>

<page>
---
title: Observability · Cloudflare Workflows docs
lastUpdated: 2024-10-24T11:52:00.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/workflows/observability/
  md: https://developers.cloudflare.com/workflows/observability/index.md
---

* [Metrics and analytics](https://developers.cloudflare.com/workflows/observability/metrics-analytics/)

</page>

<page>
---
title: Python Workflows SDK · Cloudflare Workflows docs
description: >-
  Workflow entrypoints can be declared using Python. To achieve this, you can
  export a WorkflowEntrypoint that runs on the Cloudflare Workers platform.

  Refer to Python Workers for more information about Python on the Workers
  runtime.
lastUpdated: 2026-02-09T12:13:25.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/workflows/python/
  md: https://developers.cloudflare.com/workflows/python/index.md
---

Workflow entrypoints can be declared using Python. To achieve this, you can export a `WorkflowEntrypoint` that runs on the Cloudflare Workers platform. Refer to [Python Workers](https://developers.cloudflare.com/workers/languages/python) for more information about Python on the Workers runtime.

Python Workflows are in beta, as well as the underlying platform.

Join the #python-workers channel in the [Cloudflare Developers Discord](https://discord.cloudflare.com/) and let us know what you'd like to see next.

## Get Started

The main entrypoint for a Python workflow is the [`WorkflowEntrypoint`](https://developers.cloudflare.com/workflows/build/workers-api/#workflowentrypoint) class. Your workflow logic should exist inside the [`run`](https://developers.cloudflare.com/workflows/build/workers-api/#run) handler.

```python
from workers import WorkflowEntrypoint


class MyWorkflow(WorkflowEntrypoint):
    async def run(self, event, step):
        # steps here
```

For example, a Workflow may be defined as:

```python
from workers import Response, WorkflowEntrypoint


class PythonWorkflowStarter(WorkflowEntrypoint):
    async def run(self, event, step):


        @step.do('step1')
        async def step_1():
            # does stuff
            print('executing step1')


        @step.do('step2')
        async def step_2():
            # does stuff
            print('executing step2')


        await step_1()
        await step_2()


async def on_fetch(request, env):
    await env.MY_WORKFLOW.create()
    return Response("Hello world!")
```

You must add both `python_workflows` and `python_workers` compatibility flags to your Wrangler configuration file.

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "hello-python",
    "main": "src/entry.py",
    "compatibility_flags": [
      "python_workers",
      "experimental",
      "python_workflows"
    ],
    "compatibility_date": "2026-02-10",
    "workflows": [
      {
        "name": "workflows-demo",
        "binding": "MY_WORKFLOW",
        "class_name": "PythonWorkflowStarter"
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "hello-python"
  main = "src/entry.py"
  compatibility_flags = [ "python_workers", "experimental", "python_workflows" ]
  compatibility_date = "2026-02-10"


  [[workflows]]
  name = "workflows-demo"
  binding = "MY_WORKFLOW"
  class_name = "PythonWorkflowStarter"
  ```

To run a Python Workflow locally, use [Wrangler](https://developers.cloudflare.com/workers/wrangler/), the CLI for Cloudflare Workers:

```bash
npx wrangler@latest dev
```

To deploy a Python Workflow to Cloudflare, run [`wrangler deploy`](https://developers.cloudflare.com/workers/wrangler/commands/#deploy):

```bash
npx wrangler@latest deploy
```

Join the #python-workers channel in the [Cloudflare Developers Discord](https://discord.cloudflare.com/) and let us know what you would like to see next.

</page>

<page>
---
title: Platform · Cloudflare Workflows docs
lastUpdated: 2025-03-07T09:55:39.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/workflows/reference/
  md: https://developers.cloudflare.com/workflows/reference/index.md
---

* [Pricing](https://developers.cloudflare.com/workflows/reference/pricing/)
* [Limits](https://developers.cloudflare.com/workflows/reference/limits/)
* [Event subscriptions](https://developers.cloudflare.com/workflows/reference/event-subscriptions/)
* [Glossary](https://developers.cloudflare.com/workflows/reference/glossary/)
* [Wrangler commands](https://developers.cloudflare.com/workflows/reference/wrangler-commands/)
* [Changelog](https://developers.cloudflare.com/workflows/reference/changelog/)

</page>

<page>
---
title: Workflows REST API · Cloudflare Workflows docs
lastUpdated: 2024-12-16T22:33:26.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/workflows/workflows-api/
  md: https://developers.cloudflare.com/workflows/workflows-api/index.md
---


</page>

<page>
---
title: Videos · Cloudflare Workflows docs
lastUpdated: 2025-05-08T09:06:01.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/workflows/videos/
  md: https://developers.cloudflare.com/workflows/videos/index.md
---

[Build an application using Cloudflare Workflows ](https://developers.cloudflare.com/learning-paths/workflows-course/series/workflows-1/)In this series, we introduce Cloudflare Workflows and the term 'Durable Execution' which comes from the desire to run applications that can resume execution from where they left off, even if the underlying host or compute fails.

</page>

<page>
---
title: Call Workflows from Pages · Cloudflare Workflows docs
description: You can bind and trigger Workflows from Pages Functions by
  deploying a Workers project with your Workflow definition and then invoking
  that Worker using service bindings or a standard fetch() call.
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/workflows/build/call-workflows-from-pages/
  md: https://developers.cloudflare.com/workflows/build/call-workflows-from-pages/index.md
---

Use Static Assets

To call Workflows from Pages, you are required to deploy a separate Worker containing your Workflows. We recommend using [**Static Assets**](https://developers.cloudflare.com/workers/static-assets/) instead, as this allows you to add your Workflows directly to your Static Assets Worker.

If you wish to migrate your Pages project to Static Assets, follow this [guide](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/).

***

You can bind and trigger Workflows from [Pages Functions](https://developers.cloudflare.com/pages/functions/) by deploying a Workers project with your Workflow definition and then invoking that Worker using [service bindings](https://developers.cloudflare.com/pages/functions/bindings/#service-bindings) or a standard `fetch()` call.

Note

You will need to deploy your Workflow as a standalone Workers project first before your Pages Function can call it. If you have not yet deployed a Workflow, refer to the Workflows [get started guide](https://developers.cloudflare.com/workflows/get-started/guide/).

### Use Service Bindings

[Service Bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/) allow you to call a Worker from another Worker or a Pages Function without needing to expose it directly.

To do this, you will need to:

1. Deploy your Workflow in a Worker
2. Create a Service Binding to that Worker in your Pages project
3. Call the Worker remotely using the binding

For example, if you have a Worker called `workflows-starter`, you would create a new Service Binding in your Pages project as follows, ensuring that the `service` name matches the name of the Worker your Workflow is defined in:

* wrangler.jsonc

  ```jsonc
  {
    "services": [
      {
        "binding": "WORKFLOW_SERVICE",
        "service": "workflows-starter"
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  [[services]]
  binding = "WORKFLOW_SERVICE"
  service = "workflows-starter"
  ```

Your Worker can expose a specific method (or methods) that only other Workers or Pages Functions can call over the Service Binding.

In the following example, we expose a specific `createInstance` method that accepts our `Payload` and returns the [`InstanceStatus`](https://developers.cloudflare.com/workflows/build/workers-api/#instancestatus) from the Workflows API:

* JavaScript

  ```js
  import { WorkerEntrypoint } from "cloudflare:workers";


  export default class WorkflowsService extends WorkerEntrypoint {
    // Currently, entrypoints without a named handler are not supported
    async fetch() {
      return new Response(null, { status: 404 });
    }


    async createInstance(payload) {
      let instance = await this.env.MY_WORKFLOW.create({
        params: payload,
      });


      return Response.json({
        id: instance.id,
        details: await instance.status(),
      });
    }
  }
  ```

* TypeScript

  ```ts
  import { WorkerEntrypoint } from "cloudflare:workers";


  interface Env {
    MY_WORKFLOW: Workflow;
  }


  type Payload = {
    hello: string;
  };


  export default class WorkflowsService extends WorkerEntrypoint<Env> {
    // Currently, entrypoints without a named handler are not supported
    async fetch() {
      return new Response(null, { status: 404 });
    }


    async createInstance(payload: Payload) {
      let instance = await this.env.MY_WORKFLOW.create({
        params: payload,
      });


      return Response.json({
        id: instance.id,
        details: await instance.status(),
      });
    }
  }
  ```

Your Pages Function would resemble the following:

* JavaScript

  ```js
  export const onRequest = async (context) => {
    // This payload could be anything from within your app or from your frontend
    let payload = { hello: "world" };
    return context.env.WORKFLOWS_SERVICE.createInstance(payload);
  };
  ```

* TypeScript

  ```ts
  interface Env {
    WORKFLOW_SERVICE: Service;
  }


  export const onRequest: PagesFunction<Env> = async (context) => {
    // This payload could be anything from within your app or from your frontend
    let payload = { hello: "world" };
    return context.env.WORKFLOWS_SERVICE.createInstance(payload);
  };
  ```

To learn more about binding to resources from Pages Functions, including how to bind via the Cloudflare dashboard, refer to the [bindings documentation for Pages Functions](https://developers.cloudflare.com/pages/functions/bindings/#service-bindings).

### Using fetch

Service Bindings vs. fetch

We recommend using [Service Bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/) when calling a Worker in your own account.

Service Bindings don't require you to expose a public endpoint from your Worker, don't require you to configure authentication, and allow you to call methods on your Worker directly, avoiding the overhead of managing HTTP requests and responses.

An alternative to setting up a Service Binding is to call the Worker over HTTP by using the Workflows [Workers API](https://developers.cloudflare.com/workflows/build/workers-api/#workflow) to `create` a new Workflow instance for each incoming HTTP call to the Worker:

* JavaScript

  ```js
  // This is in the same file as your Workflow definition
  export default {
    async fetch(req, env) {
      let instance = await env.MY_WORKFLOW.create({
        params: payload,
      });
      return Response.json({
        id: instance.id,
        details: await instance.status(),
      });
    },
  };
  ```

* TypeScript

  ```ts
  // This is in the same file as your Workflow definition
  export default {
    async fetch(req: Request, env: Env): Promise<Response> {
      let instance = await env.MY_WORKFLOW.create({
        params: payload,
      });
      return Response.json({
        id: instance.id,
        details: await instance.status(),
      });
    },
  };
  ```

Your [Pages Function](https://developers.cloudflare.com/pages/functions/get-started/) can then make a regular `fetch` call to the Worker:

* JavaScript

  ```js
  export const onRequest = async (context) => {
    // Other code
    let payload = { hello: "world" };
    const instanceStatus = await fetch("https://YOUR_WORKER.workers.dev/", {
      method: "POST",
      body: JSON.stringify(payload), // Send a payload for our Worker to pass to the Workflow
    });


    return Response.json(instanceStatus);
  };
  ```

* TypeScript

  ```ts
  export const onRequest: PagesFunction<Env> = async (context) => {
    // Other code
    let payload = { hello: "world" };
    const instanceStatus = await fetch("https://YOUR_WORKER.workers.dev/", {
      method: "POST",
      body: JSON.stringify(payload), // Send a payload for our Worker to pass to the Workflow
    });


    return Response.json(instanceStatus);
  };
  ```

You can also choose to authenticate these requests by passing a shared secret in a header and validating that in your Worker.

### Next steps

* Learn more about how to programatically call and trigger Workflows from the [Workers API](https://developers.cloudflare.com/workflows/build/workers-api/)
* Understand how to send [events and parameters](https://developers.cloudflare.com/workflows/build/events-and-parameters/) when triggering a Workflow
* Review the [Rules of Workflows](https://developers.cloudflare.com/workflows/build/rules-of-workflows/) and best practices for writing Workflows

</page>

<page>
---
title: Events and parameters · Cloudflare Workflows docs
description: When a Workflow is triggered, it can receive an optional event.
  This event can include data that your Workflow can act on, including request
  details, user data fetched from your database (such as D1 or KV) or from a
  webhook, or messages from a Queue consumer.
lastUpdated: 2026-02-08T16:43:40.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/workflows/build/events-and-parameters/
  md: https://developers.cloudflare.com/workflows/build/events-and-parameters/index.md
---

When a Workflow is triggered, it can receive an optional event. This event can include data that your Workflow can act on, including request details, user data fetched from your database (such as D1 or KV) or from a webhook, or messages from a Queue consumer.

Events are a powerful part of a Workflow, as you often want a Workflow to act on data. Because a given Workflow instance executes durably, events are a useful way to provide a Workflow with data that should be immutable (not changing) and/or represents data the Workflow needs to operate on at that point in time.

## Pass data to a Workflow

You can pass parameters to a Workflow in three ways:

* As an optional argument to the `create` method on a [Workflow binding](https://developers.cloudflare.com/workers/wrangler/commands/#trigger) when triggering a Workflow from a Worker.
* Via the `--params` flag when using the `wrangler` CLI to trigger a Workflow.
* Via the `step.waitForEvent` API, which allows a Workflow instance to wait for an event (and optional data) to be received *while it is running*. Workflow instances can be sent events from external services over HTTP or via the Workers API for Workflows.

You can pass any JSON-serializable object as a parameter.

Warning

A `WorkflowEvent` and its associated `payload` property are effectively *immutable*: any changes to an event are not persisted across the steps of a Workflow. This includes both cases when a Workflow is progressing normally, and in cases where a Workflow has to be restarted due to a failure.

Store state durably by returning it from your `step.do` callbacks.

* JavaScript

  ```js
  export default {
    async fetch(req, env) {
      let someEvent = { url: req.url, createdTimestamp: Date.now() };
      // Trigger our Workflow
      // Pass our event as the second parameter to the `create` method
      // on our Workflow binding.
      let instance = await env.MY_WORKFLOW.create({
        id: crypto.randomUUID(),
        params: someEvent,
      });


      return Response.json({
        id: instance.id,
        details: await instance.status(),
      });
    },
  };
  ```

* TypeScript

  ```ts
  export default {
    async fetch(req: Request, env: Env) {
      let someEvent = { url: req.url, createdTimestamp: Date.now() };
      // Trigger our Workflow
      // Pass our event as the second parameter to the `create` method
      // on our Workflow binding.
      let instance = await env.MY_WORKFLOW.create({
        id: crypto.randomUUID(),
        params: someEvent,
      });


      return Response.json({
        id: instance.id,
        details: await instance.status(),
      });
    },
  };
  ```

To pass parameters via the `wrangler` command-line interface, pass a JSON string as the second parameter to the `workflows trigger` sub-command:

```sh
npx wrangler@latest workflows trigger workflows-starter '{"some":"data"}'
```

```sh
🚀 Workflow instance "57c7913b-8e1d-4a78-a0dd-dce5a0b7aa30" has been queued successfully
```

### Wait for events

A running Workflow can wait for an event (or events) by calling `step.waitForEvent` within the Workflow, which allows you to send events to the Workflow in one of two ways:

1. Via the [Workers API binding](https://developers.cloudflare.com/workflows/build/workers-api/): call `instance.sendEvent` to send events to specific workflow instances.
2. Using the REST API (HTTP API)'s [Events endpoint](https://developers.cloudflare.com/api/resources/workflows/subresources/instances/subresources/events/methods/create/).

Because `waitForEvent` is part of the `WorkflowStep` API, you can call it multiple times within a Workflow, and use control flow to conditionally wait for an event.

Calling `waitForEvent` requires you to specify an `type` (up to 100 characters [1](#user-content-fn-1)), which is used to match the corresponding `type` when sending an event to a Workflow instance.

Warning

The `waitForEvent` type parameter only supports letters, digits, `-`, and `_`. Currently including `.` is not supported and will result in a `workflow.invalid_event_type` error.

For example, to wait for billing webhook:

* JavaScript

  ```js
  export class MyWorkflow extends WorkflowEntrypoint {
    async run(event, step) {
      // Other steps in your Workflow
      let stripeEvent = await step.waitForEvent(
        "receive invoice paid webhook from Stripe",
        { type: "stripe-webhook", timeout: "1 hour" },
      );
      // Rest of your Workflow
    }
  }
  ```

* TypeScript

  ```ts
  export class MyWorkflow extends WorkflowEntrypoint<Env, Params> {
    async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
      // Other steps in your Workflow
      let stripeEvent = await step.waitForEvent<IncomingStripeWebhook>(
        "receive invoice paid webhook from Stripe",
        { type: "stripe-webhook", timeout: "1 hour" },
      );
      // Rest of your Workflow
    }
  }
  ```

The above example:

* Calls `waitForEvent` with a `type` of `stripe-webhook` - the corresponding `sendEvent` call would thus be `await instance.sendEvent({type: "stripe-webhook", payload: webhookPayload})`.
* Uses a TypeScript [type parameter](https://www.typescriptlang.org/docs/handbook/2/generics.html) to type the return value of `step.waitForEvent` as our `IncomingStripeWebhook`.
* Continues on with the rest of the Workflow.

The default timeout for a `waitForEvent` call is 24 hours, which can be changed by passing `{ timeout: WorkflowTimeoutDuration }` as the second argument to your `waitForEvent` call.

* JavaScript

  ```js
  let event = await step.waitForEvent("wait for human approval", {
    type: "approval-flow",
    timeout: "15 minutes",
  });
  ```

* TypeScript

  ```ts
  let event = await step.waitForEvent(
      "wait for human approval",
      { type: "approval-flow", timeout: "15 minutes" },
    );
  ```

You can specify a timeout between 1 second and up to 365 days.

Timeout behavior

When `waitForEvent` times out, the Workflow will throw an error and the instance will fail. If you want your Workflow to continue even if the event is not received, wrap the `waitForEvent` call in a try-catch block:

* JavaScript

  ```js
  try {
    const event = await step.waitForEvent("wait for approval", {
      type: "approval",
      timeout: "1 hour",
    });
    // Handle the received event
  } catch (e) {
    // Timeout occurred - handle the case where no event was received
    console.log("No approval received, proceeding with default action");
  }
  ```

* TypeScript

  ```ts
  try {
    const event = await step.waitForEvent("wait for approval", {
      type: "approval",
      timeout: "1 hour",
    });
    // Handle the received event
  } catch (e) {
    // Timeout occurred - handle the case where no event was received
    console.log("No approval received, proceeding with default action");
  }
  ```

### Send events to running workflows

Workflow instances that are waiting on events using the `waitForEvent` API can be sent events using the `instance.sendEvent` API:

* JavaScript

  ```js
  export default {
    async fetch(req, env) {
      const instanceId = new URL(req.url).searchParams.get("instanceId");
      const webhookPayload = await req.json();


      let instance = await env.MY_WORKFLOW.get(instanceId);
      // Send our event, with `type` matching the event type defined in
      // our step.waitForEvent call
      await instance.sendEvent({
        type: "stripe-webhook",
        payload: webhookPayload,
      });


      return Response.json({
        status: await instance.status(),
      });
    },
  };
  ```

* TypeScript

  ```ts
  export default {
    async fetch(req: Request, env: Env) {
      const instanceId = new URL(req.url).searchParams.get("instanceId");
      const webhookPayload = await req.json<Payload>();


      let instance = await env.MY_WORKFLOW.get(instanceId);
      // Send our event, with `type` matching the event type defined in
      // our step.waitForEvent call
      await instance.sendEvent({
        type: "stripe-webhook",
        payload: webhookPayload,
      });


      return Response.json({
        status: await instance.status(),
      });
    },
  };
  ```

- Similar to the [`waitForEvent`](#wait-for-events) example in this guide, the `type` property in our `waitForEvent` and `sendEvent` fields must match.
- To send multiple events to a Workflow that has multiple `waitForEvent` calls, call `sendEvent` with the corresponding `type` property set (up to 100 characters [1](#user-content-fn-1)).
- Events can also be sent using the REST API (HTTP API)'s [Events endpoint](https://developers.cloudflare.com/api/resources/workflows/subresources/instances/subresources/events/methods/create/).

Event timing

You can send an event to a Workflow instance *before* it reaches the corresponding `waitForEvent` call, as long as the instance has been created. The event will be buffered and delivered when the Workflow reaches the `waitForEvent` step with the matching `type`.

## TypeScript and type parameters

By default, the `WorkflowEvent` passed to the `run` method of your Workflow definition has a type that conforms to the following, with `payload` (your data), `timestamp`, and `instanceId` properties:

```ts
export type WorkflowEvent<T> = {
  // The data passed as the parameter when the Workflow instance was triggered
  payload: T;
  // The timestamp that the Workflow was triggered
  timestamp: Date;
  // ID of the current Workflow instance
  instanceId: string;
};
```

You can optionally type these events by defining your own type and passing it as a [type parameter](https://www.typescriptlang.org/docs/handbook/2/generics.html#working-with-generic-type-variables) to the `WorkflowEvent`:

```ts
// Define a type that conforms to the events your Workflow instance is
// instantiated with
interface YourEventType {
  userEmail: string;
  createdTimestamp: number;
  metadata?: Record<string, string>;
}
```

When you pass your `YourEventType` to `WorkflowEvent` as a type parameter, the `event.payload` property now has the type `YourEventType` throughout your workflow definition:

```ts
// Import the Workflow definition
import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent} from 'cloudflare:workers';


export class MyWorkflow extends WorkflowEntrypoint {
    // Pass your type as a type parameter to WorkflowEvent
    // The 'payload' property will have the type of your parameter.
    async run(event: WorkflowEvent<YourEventType>, step: WorkflowStep) {
        let state = await step.do("my first step", async () => {
          // Access your properties via event.payload
          let userEmail = event.payload.userEmail
          let createdTimestamp = event.payload.createdTimestamp
        })


        await step.do("my second step", async () => { /* your code here */ })
    }
}
```

Warning

Providing a type parameter does *not* validate that the incoming event matches your type definition. In TypeScript, properties (fields) that do not exist or conform to the type you provided will be dropped. If you need to validate incoming events, we recommend a library such as [zod](https://zod.dev/) or your own validator logic.

You can also provide a type parameter to the `Workflows` type when creating (triggering) a Workflow instance using the `create` method of the [Workers API](https://developers.cloudflare.com/workflows/build/workers-api/#workflow). Note that this does *not* propagate type information into the Workflow itself, as TypeScript types are a build-time construct.

## Footnotes

1. Match pattern: `^[a-zA-Z0-9_][a-zA-Z0-9-_]*$` [↩](#user-content-fnref-1) [↩2](#user-content-fnref-1-2)

</page>

<page>
---
title: Local Development · Cloudflare Workflows docs
description: Workflows support local development using Wrangler, the
  command-line interface for Workers. Wrangler runs an emulated version of
  Workflows compared to the one that Cloudflare runs globally.
lastUpdated: 2025-09-18T22:01:54.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/workflows/build/local-development/
  md: https://developers.cloudflare.com/workflows/build/local-development/index.md
---

Workflows support local development using [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/), the command-line interface for Workers. Wrangler runs an emulated version of Workflows compared to the one that Cloudflare runs globally.

## Prerequisites

To develop locally with Workflows, you will need:

* [Wrangler v3.89.0](https://blog.cloudflare.com/wrangler3/) or later.

* Node.js version of `18.0.0` or later. Consider using a Node version manager like [Volta](https://volta.sh/) or [nvm](https://github.com/nvm-sh/nvm) to avoid permission issues and change Node versions.

* If you are new to Workflows and/or Cloudflare Workers, refer to the [Workflows Guide](https://developers.cloudflare.com/workflows/get-started/guide/) to install `wrangler` and deploy their first Workflows.

## Start a local development session

Open your terminal and run the following commands to start a local development session:

```sh
# Confirm we are using wrangler v3.89.0+
npx wrangler --version
```

```sh
⛅️ wrangler 3.89.0
```

Start a local dev session

```sh
# Start a local dev session:
npx wrangler dev
```

```sh
------------------
Your worker has access to the following bindings:
- Workflows:
  - MY_WORKFLOW: MyWorkflow
⎔ Starting local server...
[wrangler:inf] Ready on http://127.0.0.1:8787/
```

Local development sessions create a standalone, local-only environment that mirrors the production environment Workflows runs in so you can test your Workflows *before* you deploy to production.

Refer to the [`wrangler dev` documentation](https://developers.cloudflare.com/workers/wrangler/commands/#dev) to learn more about how to configure a local development session.

## Known Issues

Workflows are not supported as [remote bindings](https://developers.cloudflare.com/workers/development-testing/#remote-bindings) or when using `npx wrangler dev --remote`.

Wrangler Workflows commands `npx wrangler workflow [cmd]` are not supported for local development, as they target production API.

</page>

<page>
---
title: Rules of Workflows · Cloudflare Workflows docs
description: A Workflow contains one or more steps. Each step is a
  self-contained, individually retriable component of a Workflow. Steps may emit
  (optional) state that allows a Workflow to persist and continue from that
  step, even if a Workflow fails due to a network or infrastructure issue.
lastUpdated: 2026-02-08T16:43:40.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/workflows/build/rules-of-workflows/
  md: https://developers.cloudflare.com/workflows/build/rules-of-workflows/index.md
---

A Workflow contains one or more steps. Each step is a self-contained, individually retriable component of a Workflow. Steps may emit (optional) state that allows a Workflow to persist and continue from that step, even if a Workflow fails due to a network or infrastructure issue.

This is a small guidebook on how to build more resilient and correct Workflows.

### Ensure API/Binding calls are idempotent

Because a step might be retried multiple times, your steps should (ideally) be idempotent. For context, idempotency is a logical property where the operation (in this case a step), can be applied multiple times without changing the result beyond the initial application.

As an example, let us assume you have a Workflow that charges your customers, and you really do not want to charge them twice by accident. Before charging them, you should check if they were already charged:

* JavaScript

  ```js
  export class MyWorkflow extends WorkflowEntrypoint {
    async run(event, step) {
      const customer_id = 123456;
      // ✅ Good: Non-idempotent API/Binding calls are always done **after** checking if the operation is
      // still needed.
      await step.do(
        `charge ${customer_id} for its monthly subscription`,
        async () => {
          // API call to check if customer was already charged
          const subscription = await fetch(
            `https://payment.processor/subscriptions/${customer_id}`,
          ).then((res) => res.json());


          // return early if the customer was already charged, this can happen if the destination service dies
          // in the middle of the request but still commits it, or if the Workflows Engine restarts.
          if (subscription.charged) {
            return;
          }


          // non-idempotent call, this operation can fail and retry but still commit in the payment
          // processor - which means that, on retry, it would mischarge the customer again if the above checks
          // were not in place.
          return await fetch(
            `https://payment.processor/subscriptions/${customer_id}`,
            {
              method: "POST",
              body: JSON.stringify({ amount: 10.0 }),
            },
          );
        },
      );
    }
  }
  ```

* TypeScript

  ```ts
  export class MyWorkflow extends WorkflowEntrypoint {
    async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
      const customer_id = 123456;
      // ✅ Good: Non-idempotent API/Binding calls are always done **after** checking if the operation is
      // still needed.
      await step.do(
        `charge ${customer_id} for its monthly subscription`,
        async () => {
          // API call to check if customer was already charged
          const subscription = await fetch(
            `https://payment.processor/subscriptions/${customer_id}`,
          ).then((res) => res.json());


          // return early if the customer was already charged, this can happen if the destination service dies
          // in the middle of the request but still commits it, or if the Workflows Engine restarts.
          if (subscription.charged) {
            return;
          }


          // non-idempotent call, this operation can fail and retry but still commit in the payment
          // processor - which means that, on retry, it would mischarge the customer again if the above checks
          // were not in place.
          return await fetch(
            `https://payment.processor/subscriptions/${customer_id}`,
            {
              method: "POST",
              body: JSON.stringify({ amount: 10.0 }),
            },
          );
        },
      );
    }
  }
  ```

Note

Guaranteeing idempotency might be optional in your specific use-case and implementation, but we recommend that you always try to guarantee it.

### Make your steps granular

Steps should be as self-contained as possible. This allows your own logic to be more durable in case of failures in third-party APIs, network errors, and so on.

You can also think of it as a transaction, or a unit of work.

* ✅ Minimize the number of API/binding calls per step (unless you need multiple calls to prove idempotency).

- JavaScript

  ```js
  export class MyWorkflow extends WorkflowEntrypoint {
    async run(event, step) {
      // ✅ Good: Unrelated API/Binding calls are self-contained, so that in case one of them fails
      // it can retry them individually. It also has an extra advantage: you can control retry or
      // timeout policies for each granular step - you might not to want to overload http.cat in
      // case of it being down.
      const httpCat = await step.do("get cutest cat from KV", async () => {
        return await this.env.KV.get("cutest-http-cat");
      });


      const image = await step.do("fetch cat image from http.cat", async () => {
        return await fetch(`https://http.cat/${httpCat}`);
      });
    }
  }
  ```

- TypeScript

  ```ts
  export class MyWorkflow extends WorkflowEntrypoint {
    async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
      // ✅ Good: Unrelated API/Binding calls are self-contained, so that in case one of them fails
      // it can retry them individually. It also has an extra advantage: you can control retry or
      // timeout policies for each granular step - you might not to want to overload http.cat in
      // case of it being down.
      const httpCat = await step.do("get cutest cat from KV", async () => {
        return await this.env.KV.get("cutest-http-cat");
      });


      const image = await step.do("fetch cat image from http.cat", async () => {
        return await fetch(`https://http.cat/${httpCat}`);
      });
    }
  }
  ```

Otherwise, your entire Workflow might not be as durable as you might think, and you may encounter some undefined behaviour. You can avoid them by following the rules below:

* 🔴 Do not encapsulate your entire logic in one single step.
* 🔴 Do not call separate services in the same step (unless you need it to prove idempotency).
* 🔴 Do not make too many service calls in the same step (unless you need it to prove idempotency).
* 🔴 Do not do too much CPU-intensive work inside a single step - sometimes the engine may have to restart, and it will start over from the beginning of that step.

- JavaScript

  ```js
  export class MyWorkflow extends WorkflowEntrypoint {
    async run(event, step) {
      // 🔴 Bad: you are calling two separate services from within the same step. This might cause
      // some extra calls to the first service in case the second one fails, and in some cases, makes
      // the step non-idempotent altogether
      const image = await step.do("get cutest cat from KV", async () => {
        const httpCat = await this.env.KV.get("cutest-http-cat");
        return fetch(`https://http.cat/${httpCat}`);
      });
    }
  }
  ```

- TypeScript

  ```ts
  export class MyWorkflow extends WorkflowEntrypoint {
    async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
      // 🔴 Bad: you are calling two separate services from within the same step. This might cause
      // some extra calls to the first service in case the second one fails, and in some cases, makes
      // the step non-idempotent altogether
      const image = await step.do("get cutest cat from KV", async () => {
        const httpCat = await this.env.KV.get("cutest-http-cat");
        return fetch(`https://http.cat/${httpCat}`);
      });
    }
  }
  ```

### Do not rely on state outside of a step

Workflows may hibernate and lose all in-memory state. This will happen when engine detects that there is no pending work and can hibernate until it needs to wake-up (because of a sleep, retry, or event).

This means that you should not store state outside of a step:

* JavaScript

  ```js
  function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
  }


  export class MyWorkflow extends WorkflowEntrypoint {
    async run(event, step) {
      // 🔴 Bad: `imageList` will be not persisted across engine's lifetimes. Which means that after hibernation,
      // `imageList` will be empty again, even though the following two steps have already ran.
      const imageList = [];


      await step.do("get first cutest cat from KV", async () => {
        const httpCat = await this.env.KV.get("cutest-http-cat-1");


        imageList.push(httpCat);
      });


      await step.do("get second cutest cat from KV", async () => {
        const httpCat = await this.env.KV.get("cutest-http-cat-2");


        imageList.push(httpCat);
      });


      // A long sleep can (and probably will) hibernate the engine which means that the first engine lifetime ends here
      await step.sleep("💤💤💤💤", "3 hours");


      // When this runs, it will be on the second engine lifetime - which means `imageList` will be empty.
      await step.do(
        "choose a random cat from the list and download it",
        async () => {
          const randomCat = imageList.at(getRandomInt(0, imageList.length));
          // this will fail since `randomCat` is undefined because `imageList` is empty
          return await fetch(`https://http.cat/${randomCat}`);
        },
      );
    }
  }
  ```

* TypeScript

  ```ts
  function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
  }


  export class MyWorkflow extends WorkflowEntrypoint {
    async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
      // 🔴 Bad: `imageList` will be not persisted across engine's lifetimes. Which means that after hibernation,
      // `imageList` will be empty again, even though the following two steps have already ran.
      const imageList: string[] = [];


      await step.do("get first cutest cat from KV", async () => {
        const httpCat = await this.env.KV.get("cutest-http-cat-1");


        imageList.push(httpCat);
      });


      await step.do("get second cutest cat from KV", async () => {
        const httpCat = await this.env.KV.get("cutest-http-cat-2");


        imageList.push(httpCat);
      });


      // A long sleep can (and probably will) hibernate the engine which means that the first engine lifetime ends here
      await step.sleep("💤💤💤💤", "3 hours");


      // When this runs, it will be on the second engine lifetime - which means `imageList` will be empty.
      await step.do(
        "choose a random cat from the list and download it",
        async () => {
          const randomCat = imageList.at(getRandomInt(0, imageList.length));
          // this will fail since `randomCat` is undefined because `imageList` is empty
          return await fetch(`https://http.cat/${randomCat}`);
        },
      );
    }
  }
  ```

Instead, you should build top-level state exclusively comprised of `step.do` returns:

* JavaScript

  ```js
  function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
  }


  export class MyWorkflow extends WorkflowEntrypoint {
    async run(event, step) {
      // ✅ Good: imageList state is exclusively comprised of step returns - this means that in the event of
      // multiple engine lifetimes, imageList will be built accordingly
      const imageList = await Promise.all([
        step.do("get first cutest cat from KV", async () => {
          return await this.env.KV.get("cutest-http-cat-1");
        }),


        step.do("get second cutest cat from KV", async () => {
          return await this.env.KV.get("cutest-http-cat-2");
        }),
      ]);


      // A long sleep can (and probably will) hibernate the engine which means that the first engine lifetime ends here
      await step.sleep("💤💤💤💤", "3 hours");


      // When this runs, it will be on the second engine lifetime - but this time, imageList will contain
      // the two most cutest cats
      await step.do(
        "choose a random cat from the list and download it",
        async () => {
          const randomCat = imageList.at(getRandomInt(0, imageList.length));
          // this will eventually succeed since `randomCat` is defined
          return await fetch(`https://http.cat/${randomCat}`);
        },
      );
    }
  }
  ```

* TypeScript

  ```ts
  function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
  }


  export class MyWorkflow extends WorkflowEntrypoint {
    async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
      // ✅ Good: imageList state is exclusively comprised of step returns - this means that in the event of
      // multiple engine lifetimes, imageList will be built accordingly
      const imageList: string[] = await Promise.all([
        step.do("get first cutest cat from KV", async () => {
          return await this.env.KV.get("cutest-http-cat-1");
        }),


        step.do("get second cutest cat from KV", async () => {
          return await this.env.KV.get("cutest-http-cat-2");
        }),
      ]);


      // A long sleep can (and probably will) hibernate the engine which means that the first engine lifetime ends here
      await step.sleep("💤💤💤💤", "3 hours");


      // When this runs, it will be on the second engine lifetime - but this time, imageList will contain
      // the two most cutest cats
      await step.do(
        "choose a random cat from the list and download it",
        async () => {
          const randomCat = imageList.at(getRandomInt(0, imageList.length));
          // this will eventually succeed since `randomCat` is defined
          return await fetch(`https://http.cat/${randomCat}`);
        },
      );
    }
  }
  ```

### Avoid doing side effects outside of a `step.do`

It is not recommended to write code with any side effects outside of steps, unless you would like it to be repeated, because the Workflow engine may restart while an instance is running. If the engine restarts, the step logic will be preserved, but logic outside of the steps may be duplicated.

For example, a `console.log()` outside of workflow steps may cause the logs to print twice when the engine restarts.

However, logic involving non-serializable resources, like a database connection, should be executed outside of steps. Operations outside of a `step.do` might be repeated more than once, due to the nature of the Workflows' instance lifecycle.

* JavaScript

  ```js
  export class MyWorkflow extends WorkflowEntrypoint {
    async run(event, step) {
      // 🔴 Bad: creating instances outside of steps
      // This might get called more than once creating more instances than expected
      const badInstance = await this.env.ANOTHER_WORKFLOW.create();


      // 🔴 Bad: using non-deterministic functions outside of steps
      // this will produce different results if the instance has to restart, different runs of the same instance
      // might go through different paths
      const badRandom = Math.random();


      if (badRandom > 0) {
        // do some stuff
      }


      // ⚠️ Warning: This log may happen many times
      console.log("This might be logged more than once");


      await step.do("do some stuff and have a log for when it runs", async () => {
        // do some stuff


        // this log will only appear once
        console.log("successfully did stuff");
      });


      // ✅ Good: wrap non-deterministic function in a step
      // after running successfully will not run again
      const goodRandom = await step.do("create a random number", async () => {
        return Math.random();
      });


      // ✅ Good: calls that have no side effects can be done outside of steps
      const db = createDBConnection(this.env.DB_URL, this.env.DB_TOKEN);


      // ✅ Good: run functions with side effects inside of a step
      // after running successfully will not run again
      const goodInstance = await step.do(
        "good step that returns state",
        async () => {
          const instance = await this.env.ANOTHER_WORKFLOW.create();


          return instance;
        },
      );
    }
  }
  ```

* TypeScript

  ```ts
  export class MyWorkflow extends WorkflowEntrypoint {
    async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
      // 🔴 Bad: creating instances outside of steps
      // This might get called more than once creating more instances than expected
      const badInstance = await this.env.ANOTHER_WORKFLOW.create();


      // 🔴 Bad: using non-deterministic functions outside of steps
      // this will produce different results if the instance has to restart, different runs of the same instance
      // might go through different paths
      const badRandom = Math.random();


      if (badRandom > 0) {
        // do some stuff
      }


      // ⚠️ Warning: This log may happen many times
      console.log("This might be logged more than once");


      await step.do("do some stuff and have a log for when it runs", async () => {
        // do some stuff


        // this log will only appear once
        console.log("successfully did stuff");
      });


      // ✅ Good: wrap non-deterministic function in a step
      // after running successfully will not run again
      const goodRandom = await step.do("create a random number", async () => {
        return Math.random();
      });


      // ✅ Good: calls that have no side effects can be done outside of steps
      const db = createDBConnection(this.env.DB_URL, this.env.DB_TOKEN);


      // ✅ Good: run functions with side effects inside of a step
      // after running successfully will not run again
      const goodInstance = await step.do(
        "good step that returns state",
        async () => {
          const instance = await this.env.ANOTHER_WORKFLOW.create();


          return instance;
        },
      );
    }
  }
  ```

### Do not mutate your incoming events

The `event` passed to your Workflow's `run` method is immutable: changes you make to the event are not persisted across steps and/or Workflow restarts.

* JavaScript

  ```js
  export class MyWorkflow extends WorkflowEntrypoint {
    async run(event, step) {
      // 🔴 Bad: Mutating the event
      // This will not be persisted across steps and `event.payload` will
      // take on its original value.
      await step.do("bad step that mutates the incoming event", async () => {
        let userData = await this.env.KV.get(event.payload.user);
        event.payload = userData;
      });


      // ✅ Good: persist data by returning it as state from your step
      // Use that state in subsequent steps
      let userData = await step.do("good step that returns state", async () => {
        return await this.env.KV.get(event.payload.user);
      });


      let someOtherData = await step.do(
        "following step that uses that state",
        async () => {
          // Access to userData here
          // Will always be the same if this step is retried
        },
      );
    }
  }
  ```

* TypeScript

  ```ts
  interface MyEvent {
    user: string;
    data: string;
  }


  export class MyWorkflow extends WorkflowEntrypoint {
    async run(event: WorkflowEvent<MyEvent>, step: WorkflowStep) {
      // 🔴 Bad: Mutating the event
      // This will not be persisted across steps and `event.payload` will
      // take on its original value.
      await step.do("bad step that mutates the incoming event", async () => {
        let userData = await this.env.KV.get(event.payload.user);
        event.payload = userData;
      });


      // ✅ Good: persist data by returning it as state from your step
      // Use that state in subsequent steps
      let userData = await step.do("good step that returns state", async () => {
        return await this.env.KV.get(event.payload.user);
      });


      let someOtherData = await step.do(
        "following step that uses that state",
        async () => {
          // Access to userData here
          // Will always be the same if this step is retried
        },
      );
    }
  }
  ```

### Name steps deterministically

Steps should be named deterministically (that is, not using the current date/time, randomness, etc). This ensures that their state is cached, and prevents the step from being rerun unnecessarily. Step names act as the "cache key" in your Workflow.

* JavaScript

  ```js
  export class MyWorkflow extends WorkflowEntrypoint {
    async run(event, step) {
      // 🔴 Bad: Naming the step non-deterministically prevents it from being cached
      // This will cause the step to be re-run if subsequent steps fail.
      await step.do(`step #1 running at: ${Date.now()}`, async () => {
        let userData = await this.env.KV.get(event.payload.user);
        // Do not mutate event.payload
        event.payload = userData;
      });


      // ✅ Good: give steps a deterministic name.
      // Return dynamic values in your state, or log them instead.
      let state = await step.do("fetch user data from KV", async () => {
        let userData = await this.env.KV.get(event.payload.user);
        console.log(`fetched at ${Date.now()}`);
        return userData;
      });


      // ✅ Good: steps that are dynamically named are constructed in a deterministic way.
      // In this case, `catList` is a step output, which is stable, and `catList` is
      // traversed in a deterministic fashion (no shuffles or random accesses) so,
      // it's fine to dynamically name steps (e.g: create a step per list entry).
      let catList = await step.do("get cat list from KV", async () => {
        return await this.env.KV.get("cat-list");
      });


      for (const cat of catList) {
        await step.do(`get cat: ${cat}`, async () => {
          return await this.env.KV.get(cat);
        });
      }
    }
  }
  ```

* TypeScript

  ```ts
  export class MyWorkflow extends WorkflowEntrypoint {
    async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
      // 🔴 Bad: Naming the step non-deterministically prevents it from being cached
      // This will cause the step to be re-run if subsequent steps fail.
      await step.do(`step #1 running at: ${Date.now()}`, async () => {
        let userData = await this.env.KV.get(event.payload.user);
        // Do not mutate event.payload
        event.payload = userData;
      });


      // ✅ Good: give steps a deterministic name.
      // Return dynamic values in your state, or log them instead.
      let state = await step.do("fetch user data from KV", async () => {
        let userData = await this.env.KV.get(event.payload.user);
        console.log(`fetched at ${Date.now()}`);
        return userData;
      });


      // ✅ Good: steps that are dynamically named are constructed in a deterministic way.
      // In this case, `catList` is a step output, which is stable, and `catList` is
      // traversed in a deterministic fashion (no shuffles or random accesses) so,
      // it's fine to dynamically name steps (e.g: create a step per list entry).
      let catList = await step.do("get cat list from KV", async () => {
        return await this.env.KV.get("cat-list");
      });


      for (const cat of catList) {
        await step.do(`get cat: ${cat}`, async () => {
          return await this.env.KV.get(cat);
        });
      }
    }
  }
  ```

### Take care with `Promise.race()` and `Promise.any()`

Workflows allows the usage steps within the `Promise.race()` or `Promise.any()` methods as a way to achieve concurrent steps execution. However, some considerations must be taken.

Due to the nature of Workflows' instance lifecycle, and given that a step inside a Promise will run until it finishes, the step that is returned during the first passage may not be the actual cached step, as [steps are cached by their names](#name-steps-deterministically).

* JavaScript

  ```js
  // helper sleep method
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));


  export class MyWorkflow extends WorkflowEntrypoint {
    async run(event, step) {
      // 🔴 Bad: The `Promise.race` is not surrounded by a `step.do`, which may cause undeterministic caching behavior.
      const race_return = await Promise.race([
        step.do("Promise first race", async () => {
          await sleep(1000);
          return "first";
        }),
        step.do("Promise second race", async () => {
          return "second";
        }),
      ]);


      await step.sleep("Sleep step", "2 hours");


      return await step.do("Another step", async () => {
        // This step will return `first`, even though the `Promise.race` first returned `second`.
        return race_return;
      });
    }
  }
  ```

* TypeScript

  ```ts
  // helper sleep method
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));


  export class MyWorkflow extends WorkflowEntrypoint {
    async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
      // 🔴 Bad: The `Promise.race` is not surrounded by a `step.do`, which may cause undeterministic caching behavior.
      const race_return = await Promise.race([
        step.do("Promise first race", async () => {
          await sleep(1000);
          return "first";
        }),
        step.do("Promise second race", async () => {
          return "second";
        }),
      ]);


      await step.sleep("Sleep step", "2 hours");


      return await step.do("Another step", async () => {
        // This step will return `first`, even though the `Promise.race` first returned `second`.
        return race_return;
      });
    }
  }
  ```

To ensure consistency, we suggest to surround the `Promise.race()` or `Promise.any()` within a `step.do()`, as this will ensure caching consistency across multiple passages.

* JavaScript

  ```js
  // helper sleep method
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));


  export class MyWorkflow extends WorkflowEntrypoint {
    async run(event, step) {
      // ✅ Good: The `Promise.race` is surrounded by a `step.do`, ensuring deterministic caching behavior.
      const race_return = await step.do("Promise step", async () => {
        return await Promise.race([
          step.do("Promise first race", async () => {
            await sleep(1000);
            return "first";
          }),
          step.do("Promise second race", async () => {
            return "second";
          }),
        ]);
      });


      await step.sleep("Sleep step", "2 hours");


      return await step.do("Another step", async () => {
        // This step will return `second` because the `Promise.race` was surround by the `step.do` method.
        return race_return;
      });
    }
  }
  ```

* TypeScript

  ```ts
  // helper sleep method
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));


  export class MyWorkflow extends WorkflowEntrypoint {
    async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
      // ✅ Good: The `Promise.race` is surrounded by a `step.do`, ensuring deterministic caching behavior.
      const race_return = await step.do("Promise step", async () => {
        return await Promise.race([
          step.do("Promise first race", async () => {
            await sleep(1000);
            return "first";
          }),
          step.do("Promise second race", async () => {
            return "second";
          }),
        ]);
      });


      await step.sleep("Sleep step", "2 hours");


      return await step.do("Another step", async () => {
        // This step will return `second` because the `Promise.race` was surround by the `step.do` method.
        return race_return;
      });
    }
  }
  ```

### Instance IDs are unique

Workflow [instance IDs](https://developers.cloudflare.com/workflows/build/workers-api/#workflowinstance) are unique per Workflow. The ID is the unique identifier that associates logs, metrics, state and status of a run to a specific instance, even after completion. Allowing ID re-use would make it hard to understand if a Workflow instance ID referred to an instance that run yesterday, last week or today.

It would also present a problem if you wanted to run multiple different Workflow instances with different [input parameters](https://developers.cloudflare.com/workflows/build/events-and-parameters/) for the same user ID, as you would immediately need to determine a new ID mapping.

If you need to associate multiple instances with a specific user, merchant or other "customer" ID in your system, consider using a composite ID or using randomly generated IDs and storing the mapping in a database like [D1](https://developers.cloudflare.com/d1/).

* JavaScript

  ```js
  // This is in the same file as your Workflow definition
  export default {
    async fetch(req, env) {
      // 🔴 Bad: Use an ID that isn't unique across future Workflow invocations
      let userId = getUserId(req); // Returns the userId
      let badInstance = await env.MY_WORKFLOW.create({
        id: userId,
        params: payload,
      });


      // ✅ Good: use an ID that is unique
      // e.g. a transaction ID, order ID, or task ID are good options
      let instanceId = getTransactionId(); // e.g. assuming transaction IDs are unique
      // or: compose a composite ID and store it in your database
      // so that you can track all instances associated with a specific user or merchant.
      instanceId = `${getUserId(req)}-${crypto.randomUUID().slice(0, 6)}`;
      let { result } = await addNewInstanceToDB(userId, instanceId);
      let goodInstance = await env.MY_WORKFLOW.create({
        id: instanceId,
        params: payload,
      });


      return Response.json({
        id: goodInstance.id,
        details: await goodInstance.status(),
      });
    },
  };
  ```

* TypeScript

  ```ts
  // This is in the same file as your Workflow definition
  export default {
    async fetch(req: Request, env: Env): Promise<Response> {
      // 🔴 Bad: Use an ID that isn't unique across future Workflow invocations
      let userId = getUserId(req); // Returns the userId
      let badInstance = await env.MY_WORKFLOW.create({
        id: userId,
        params: payload,
      });


      // ✅ Good: use an ID that is unique
      // e.g. a transaction ID, order ID, or task ID are good options
      let instanceId = getTransactionId(); // e.g. assuming transaction IDs are unique
      // or: compose a composite ID and store it in your database
      // so that you can track all instances associated with a specific user or merchant.
      instanceId = `${getUserId(req)}-${crypto.randomUUID().slice(0, 6)}`;
      let { result } = await addNewInstanceToDB(userId, instanceId);
      let goodInstance = await env.MY_WORKFLOW.create({
        id: instanceId,
        params: payload,
      });


      return Response.json({
        id: goodInstance.id,
        details: await goodInstance.status(),
      });
    },
  };
  ```

### `await` your steps

When calling `step.do` or `step.sleep`, use `await` to avoid introducing bugs and race conditions into your Workflow code.

If you don't call `await step.do` or `await step.sleep`, you create a dangling Promise. This occurs when a Promise is created but not properly `await`ed, leading to potential bugs and race conditions.

This happens when you do not use the `await` keyword or fail to chain `.then()` methods to handle the result of a Promise. For example, calling `fetch(GITHUB_URL)` without awaiting its response will cause subsequent code to execute immediately, regardless of whether the fetch completed. This can cause issues like premature logging, exceptions being swallowed (and not terminating the Workflow), and lost return values (state).

* JavaScript

  ```js
  export class MyWorkflow extends WorkflowEntrypoint {
    async run(event, step) {
      // 🔴 Bad: The step isn't await'ed, and any state or errors is swallowed before it returns.
      const badIssues = step.do(`fetch issues from GitHub`, async () => {
        // The step will return before this call is done
        let issues = await getIssues(event.payload.repoName);
        return issues;
      });


      // ✅ Good: The step is correctly await'ed.
      const goodIssues = await step.do(`fetch issues from GitHub`, async () => {
        let issues = await getIssues(event.payload.repoName);
        return issues;
      });


      // Rest of your Workflow goes here!
    }
  }
  ```

* TypeScript

  ```ts
  export class MyWorkflow extends WorkflowEntrypoint {
    async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
      // 🔴 Bad: The step isn't await'ed, and any state or errors is swallowed before it returns.
      const badIssues = step.do(`fetch issues from GitHub`, async () => {
        // The step will return before this call is done
        let issues = await getIssues(event.payload.repoName);
        return issues;
      });


      // ✅ Good: The step is correctly await'ed.
      const goodIssues = await step.do(`fetch issues from GitHub`, async () => {
        let issues = await getIssues(event.payload.repoName);
        return issues;
      });


      // Rest of your Workflow goes here!
    }
  }
  ```

### Use conditional logic carefully

You can use `if` statements, loops, and other control flow outside of steps. However, conditions must be based on **deterministic values** — either values from `event.payload` or return values from previous steps. Non-deterministic conditions (such as `Math.random()` or `Date.now()`) outside of steps can cause unexpected behavior if the Workflow restarts.

* JavaScript

  ```js
  export class MyWorkflow extends WorkflowEntrypoint {
    async run(event, step) {
      const config = await step.do("fetch config", async () => {
        return await this.env.KV.get("feature-flags", { type: "json" });
      });


      // ✅ Good: Condition based on step output (deterministic)
      if (config.enableEmailNotifications) {
        await step.do("send email", async () => {
          // Send email logic
        });
      }


      // ✅ Good: Condition based on event payload (deterministic)
      if (event.payload.userType === "premium") {
        await step.do("premium processing", async () => {
          // Premium-only logic
        });
      }


      // 🔴 Bad: Condition based on non-deterministic value outside a step
      // This could behave differently if the Workflow restarts
      if (Math.random() > 0.5) {
        await step.do("maybe do something", async () => {});
      }


      // ✅ Good: Wrap non-deterministic values in a step
      const shouldProcess = await step.do("decide randomly", async () => {
        return Math.random() > 0.5;
      });
      if (shouldProcess) {
        await step.do("conditionally do something", async () => {});
      }
    }
  }
  ```

* TypeScript

  ```ts
  export class MyWorkflow extends WorkflowEntrypoint {
    async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
      const config = await step.do("fetch config", async () => {
        return await this.env.KV.get("feature-flags", { type: "json" });
      });


      // ✅ Good: Condition based on step output (deterministic)
      if (config.enableEmailNotifications) {
        await step.do("send email", async () => {
          // Send email logic
        });
      }


      // ✅ Good: Condition based on event payload (deterministic)
      if (event.payload.userType === "premium") {
        await step.do("premium processing", async () => {
          // Premium-only logic
        });
      }


      // 🔴 Bad: Condition based on non-deterministic value outside a step
      // This could behave differently if the Workflow restarts
      if (Math.random() > 0.5) {
        await step.do("maybe do something", async () => {});
      }


      // ✅ Good: Wrap non-deterministic values in a step
      const shouldProcess = await step.do("decide randomly", async () => {
        return Math.random() > 0.5;
      });
      if (shouldProcess) {
        await step.do("conditionally do something", async () => {});
      }
    }
  }
  ```

### Batch multiple Workflow invocations

When creating multiple Workflow instances, use the [`createBatch`](https://developers.cloudflare.com/workflows/build/workers-api/#createBatch) method to batch the invocations together. This allows you to create multiple Workflow instances in a single request, which will reduce the number of requests made to the Workflows API. However, each individual instance in the batch will still count towards the [creation rate limit](https://developers.cloudflare.com/workflows/reference/limits/). Unlike `create`, `createBatch` is idempotent: if an existing instance with the same ID is still within its [retention limit](https://developers.cloudflare.com/workflows/reference/limits/), it will be skipped and excluded from the returned array.

* JavaScript

  ```js
  export default {
    async fetch(req, env) {
      let instances = [
        { id: "user1", params: { name: "John" } },
        { id: "user2", params: { name: "Jane" } },
        { id: "user3", params: { name: "Alice" } },
        { id: "user4", params: { name: "Bob" } },
      ];


      // 🔴 Bad: Create them one by one, which is more likely to hit creation rate limits.
      for (let instance of instances) {
        await env.MY_WORKFLOW.create({
          id: instance.id,
          params: instance.params,
        });
      }


      // ✅ Good: Batch calls together
      // This improves throughput.
      let createdInstances = await env.MY_WORKFLOW.createBatch(instances);
      return Response.json({ instances: createdInstances });
    },
  };
  ```

* TypeScript

  ```ts
  export default {
    async fetch(req: Request, env: Env): Promise<Response> {
      let instances = [
        { id: "user1", params: { name: "John" } },
        { id: "user2", params: { name: "Jane" } },
        { id: "user3", params: { name: "Alice" } },
        { id: "user4", params: { name: "Bob" } },
      ];


      // 🔴 Bad: Create them one by one, which is more likely to hit creation rate limits.
      for (let instance of instances) {
        await env.MY_WORKFLOW.create({
          id: instance.id,
          params: instance.params,
        });
      }


      // ✅ Good: Batch calls together
      // This improves throughput.
      let createdInstances = await env.MY_WORKFLOW.createBatch(instances);
      return Response.json({ instances: createdInstances });
    },
  };
  ```

### Limit timeouts to 30 minutes or less

When setting a [WorkflowStep timeout](https://developers.cloudflare.com/workflows/build/workers-api/#workflowstep), ensure that its duration is 30 minutes or less. If your use case requires a timeout greater than 30 minutes, consider using `step.waitForEvent()` instead.

### Keep step return values under 1 MiB

Each step can persist up to 1 MiB (2^20 bytes) of state. If your step returns data exceeding this limit, the step will fail. This is a common issue when fetching large API responses or processing large files.

To work around this limit, store large data externally (for example, in R2 or KV) and return only a reference:

* JavaScript

  ```js
  export class MyWorkflow extends WorkflowEntrypoint {
    async run(event, step) {
      // 🔴 Bad: Returning a large response that may exceed 1 MiB
      const largeData = await step.do("fetch large dataset", async () => {
        const response = await fetch("https://api.example.com/large-dataset");
        return await response.json(); // Could exceed 1 MiB
      });


      // ✅ Good: Store large data externally and return a reference
      const dataRef = await step.do("fetch and store large dataset", async () => {
        const response = await fetch("https://api.example.com/large-dataset");
        const data = await response.json();
        // Store in R2 and return a reference
        await this.env.MY_BUCKET.put("dataset-123", JSON.stringify(data));
        return { key: "dataset-123" };
      });


      // Retrieve the data in a later step when needed
      const data = await step.do("process dataset", async () => {
        const stored = await this.env.MY_BUCKET.get(dataRef.key);
        return processData(await stored.json());
      });
    }
  }
  ```

* TypeScript

  ```ts
  export class MyWorkflow extends WorkflowEntrypoint {
    async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
      // 🔴 Bad: Returning a large response that may exceed 1 MiB
      const largeData = await step.do("fetch large dataset", async () => {
        const response = await fetch("https://api.example.com/large-dataset");
        return await response.json(); // Could exceed 1 MiB
      });


      // ✅ Good: Store large data externally and return a reference
      const dataRef = await step.do("fetch and store large dataset", async () => {
        const response = await fetch("https://api.example.com/large-dataset");
        const data = await response.json();
        // Store in R2 and return a reference
        await this.env.MY_BUCKET.put("dataset-123", JSON.stringify(data));
        return { key: "dataset-123" };
      });


      // Retrieve the data in a later step when needed
      const data = await step.do("process dataset", async () => {
        const stored = await this.env.MY_BUCKET.get(dataRef.key);
        return processData(await stored.json());
      });
    }
  }
  ```

</page>

<page>
---
title: Sleeping and retrying · Cloudflare Workflows docs
description: This guide details how to sleep a Workflow and/or configure retries
  for a Workflow step.
lastUpdated: 2026-02-08T16:43:40.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/
  md: https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/index.md
---

This guide details how to sleep a Workflow and/or configure retries for a Workflow step.

## Sleep a Workflow

You can set a Workflow to sleep as an explicit step, which can be useful when you want a Workflow to wait, schedule work ahead, or pause until an input or other external state is ready.

Note

A Workflow instance that is resuming from sleep will take priority over newly scheduled (queued) instances. This helps ensure that older Workflow instances can run to completion and are not blocked by newer instances.

### Sleep for a relative period

Use `step.sleep` to have a Workflow sleep for a relative period of time:

```ts
await step.sleep("sleep for a bit", "1 hour")
```

The second argument to `step.sleep` accepts both `number` (milliseconds) or a human-readable format, such as "1 minute" or "26 hours". The accepted units for `step.sleep` when used this way are as follows:

```ts
| "second"
| "minute"
| "hour"
| "day"
| "week"
| "month"
| "year"
```

### Sleep until a fixed date

Use `step.sleepUntil` to have a Workflow sleep to a specific `Date`: this can be useful when you have a timestamp from another system or want to "schedule" work to occur at a specific time (e.g. Sunday, 9AM UTC).

```ts
// sleepUntil accepts a Date object as its second argument
const workflowsLaunchDate = Date.parse("24 Oct 2024 13:00:00 UTC");
await step.sleepUntil("sleep until X times out", workflowsLaunchDate)
```

You can also provide a UNIX timestamp (milliseconds since the UNIX epoch) directly to `sleepUntil`.

## Retry steps

Each call to `step.do` in a Workflow accepts an optional `StepConfig`, which allows you define the retry behaviour for that step.

If you do not provide your own retry configuration, Workflows applies the following defaults:

```ts
const defaultConfig: WorkflowStepConfig = {
  retries: {
    limit: 5,
    delay: 10000,
    backoff: 'exponential',
  },
  timeout: '10 minutes',
};
```

When providing your own `StepConfig`, you can configure:

* The total number of attempts to make for a step (accepts `Infinity` for unlimited retries)
* The delay between attempts (accepts both `number` (ms) or a human-readable format)
* What backoff algorithm to apply between each attempt: any of `constant`, `linear`, or `exponential`
* When to timeout (in duration) before considering the step as failed (including during a retry attempt, as the timeout is set per attempt)

For example, to limit a step to 10 retries and have it apply an exponential delay (starting at 10 seconds) between each attempt, you would pass the following configuration as an optional object to `step.do`:

```ts
let someState = await step.do("call an API", {
  retries: {
    limit: 10, // The total number of attempts
    delay: "10 seconds", // Delay between each retry
    backoff: "exponential" // Any of "constant" | "linear" | "exponential";
  },
  timeout: "30 minutes",
}, async () => { /* Step code goes here */ })
```

## Force a Workflow instance to fail

You can also force a Workflow instance to fail and *not* retry by throwing a `NonRetryableError` from within the step.

This can be useful when you detect a terminal (permanent) error from an upstream system (such as an authentication failure) or other errors where retrying would not help.

```ts
// Import the NonRetryableError definition
import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';
import { NonRetryableError } from 'cloudflare:workflows';


// In your step code:
export class MyWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    await step.do("some step", async () => {
        if (!event.payload.data) {
          throw new NonRetryableError("event.payload.data did not contain the expected payload")
        }
      })
  }
}
```

The Workflow instance itself will fail immediately, no further steps will be invoked, and the Workflow will not be retried.

## Catch Workflow errors

Any uncaught exceptions that propagate to the top level, or any steps that reach their retry limit, will cause the Workflow to end execution in an `Errored` state.

If you want to avoid this, you can catch exceptions emitted by a `step`. This can be useful if you need to trigger clean-up tasks or have conditional logic that triggers additional steps.

To allow the Workflow to continue its execution, surround the intended steps that are allowed to fail with a `try-catch` block.

```ts
...
await step.do('task', async () => {
  // work to be done
});


try {
    await step.do('non-retryable-task', async () => {
    // work not to be retried
        throw new NonRetryableError('oh no');
    });
} catch (e) {
    console.log(`Step failed: ${e.message}`);
    await step.do('clean-up-task', async () => {
      // Clean up code here
    });
}


// the Workflow will not fail and will continue its execution


await step.do('next-task', async() => {
  // more work to be done
});
...
```

</page>

<page>
---
title: Test Workflows · Cloudflare Workflows docs
lastUpdated: 2025-09-12T15:23:11.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/workflows/build/test-workflows/
  md: https://developers.cloudflare.com/workflows/build/test-workflows/index.md
---


</page>

<page>
---
title: Trigger Workflows · Cloudflare Workflows docs
description: "You can trigger Workflows both programmatically and via the
  Workflows APIs, including:"
lastUpdated: 2026-02-02T18:38:11.000Z
chatbotDeprioritize: false
tags: Bindings
source_url:
  html: https://developers.cloudflare.com/workflows/build/trigger-workflows/
  md: https://developers.cloudflare.com/workflows/build/trigger-workflows/index.md
---

You can trigger Workflows both programmatically and via the Workflows APIs, including:

1. With [Workers](https://developers.cloudflare.com/workers) via HTTP requests in a `fetch` handler, or bindings from a `queue` or `scheduled` handler
2. Using the [Workflows REST API](https://developers.cloudflare.com/api/resources/workflows/methods/list/)
3. Via the [wrangler CLI](https://developers.cloudflare.com/workers/wrangler/commands/#workflows) in your terminal

## Workers API (Bindings)

You can interact with Workflows programmatically from any Worker script by creating a binding to a Workflow. A Worker can bind to multiple Workflows, including Workflows defined in other Workers projects (scripts) within your account.

You can interact with a Workflow:

* Directly over HTTP via the [`fetch`](https://developers.cloudflare.com/workers/runtime-apis/handlers/fetch/) handler
* From a [Queue consumer](https://developers.cloudflare.com/queues/configuration/javascript-apis/#consumer) inside a `queue` handler
* From a [Cron Trigger](https://developers.cloudflare.com/workers/configuration/cron-triggers/) inside a `scheduled` handler
* Within a [Durable Object](https://developers.cloudflare.com/durable-objects/)

Note

New to Workflows? Start with the [Workflows tutorial](https://developers.cloudflare.com/workflows/get-started/guide/) to deploy your first Workflow and familiarize yourself with Workflows concepts.

To bind to a Workflow from your Workers code, you need to define a [binding](https://developers.cloudflare.com/workers/wrangler/configuration/) to a specific Workflow. For example, to bind to the Workflow defined in the [get started guide](https://developers.cloudflare.com/workflows/get-started/guide/), you would configure the [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) with the below:

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "workflows-tutorial",
    "main": "src/index.ts",
    "compatibility_date": "2026-02-10",
    "workflows": [
      {
        // The name of the Workflow
        "name": "workflows-tutorial",
        // The binding name, which must be a valid JavaScript variable name.  This will
        // be how you call (run) your Workflow from your other Workers handlers or
        // scripts.
        "binding": "MY_WORKFLOW",
        // Must match the class defined in your code that extends the Workflow class
        "class_name": "MyWorkflow"
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "workflows-tutorial"
  main = "src/index.ts"
  compatibility_date = "2026-02-10"


  [[workflows]]
  name = "workflows-tutorial"
  binding = "MY_WORKFLOW"
  class_name = "MyWorkflow"
  ```

The `binding = "MY_WORKFLOW"` line defines the JavaScript variable that our Workflow methods are accessible on, including `create` (which triggers a new instance) or `get` (which returns the status of an existing instance).

The following example shows how you can manage Workflows from within a Worker, including:

* Retrieving the status of an existing Workflow instance by its ID
* Creating (triggering) a new Workflow instance
* Returning the status of a given instance ID

```ts
interface Env {
  MY_WORKFLOW: Workflow;
}


export default {
  async fetch(req: Request, env: Env) {
    // Get instanceId from query parameters
    const instanceId = new URL(req.url).searchParams.get("instanceId");


    // If an ?instanceId=<id> query parameter is provided, fetch the status
    // of an existing Workflow by its ID.
    if (instanceId) {
      let instance = await env.MY_WORKFLOW.get(instanceId);
      return Response.json({
        status: await instance.status(),
      });
    }


    // Else, create a new instance of our Workflow, passing in any (optional)
    // params and return the ID.
    const newId = crypto.randomUUID();
    let instance = await env.MY_WORKFLOW.create({ id: newId });
    return Response.json({
      id: instance.id,
      details: await instance.status(),
    });
  },
};
```

### Inspect a Workflow's status

You can inspect the status of any running Workflow instance by calling `status` against a specific instance ID. This allows you to programmatically inspect whether an instance is queued (waiting to be scheduled), actively running, paused, or errored.

```ts
let instance = await env.MY_WORKFLOW.get("abc-123");
let status = await instance.status(); // Returns an InstanceStatus
```

The possible values of status are as follows:

```ts
  status:
    | "queued" // means that instance is waiting to be started (see concurrency limits)
    | "running"
    | "paused"
    | "errored"
    | "terminated" // user terminated the instance while it was running
    | "complete"
    | "waiting" // instance is hibernating and waiting for sleep or event to finish
    | "waitingForPause" // instance is finishing the current work to pause
    | "unknown";
  error?: {
    name: string,
    message: string
  };
  output?: unknown;
```

### Explicitly pause a Workflow

You can explicitly pause a Workflow instance (and later resume it) by calling `pause` against a specific instance ID.

```ts
let instance = await env.MY_WORKFLOW.get("abc-123");
await instance.pause(); // Returns Promise<void>
```

### Resume a Workflow

You can resume a paused Workflow instance by calling `resume` against a specific instance ID.

```ts
let instance = await env.MY_WORKFLOW.get("abc-123");
await instance.resume(); // Returns Promise<void>
```

Calling `resume` on an instance that is not currently paused will have no effect.

### Stop a Workflow

You can stop/terminate a Workflow instance by calling `terminate` against a specific instance ID.

```ts
let instance = await env.MY_WORKFLOW.get("abc-123");
await instance.terminate(); // Returns Promise<void>
```

Once stopped/terminated, the Workflow instance *cannot* be resumed.

### Restart a Workflow

```ts
let instance = await env.MY_WORKFLOW.get("abc-123");
await instance.restart(); // Returns Promise<void>
```

Restarting an instance will immediately cancel any in-progress steps, erase any intermediate state, and treat the Workflow as if it was run for the first time.

### Trigger a Workflow from another Workflow

You can create a new Workflow instance from within a step of another Workflow. The parent Workflow will not block waiting for the child Workflow to complete — it continues execution immediately after the child instance is successfully created.

* JavaScript

  ```js
  export class ParentWorkflow extends WorkflowEntrypoint {
    async run(event, step) {
      // Perform initial work
      const result = await step.do("initial processing", async () => {
        // ... processing logic
        return { fileKey: "output.pdf" };
      });


      // Trigger a child workflow for additional processing
      const childInstance = await step.do("trigger child workflow", async () => {
        return await this.env.CHILD_WORKFLOW.create({
          id: `child-${event.instanceId}`,
          params: { fileKey: result.fileKey },
        });
      });


      // Parent continues immediately - not blocked by child workflow
      await step.do("continue with other work", async () => {
        console.log(`Started child workflow: ${childInstance.id}`);
        // This runs right away, regardless of child workflow status
      });
    }
  }
  ```

* TypeScript

  ```ts
  export class ParentWorkflow extends WorkflowEntrypoint<Env, Params> {
    async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
      // Perform initial work
      const result = await step.do("initial processing", async () => {
        // ... processing logic
        return { fileKey: "output.pdf" };
      });


      // Trigger a child workflow for additional processing
      const childInstance = await step.do("trigger child workflow", async () => {
        return await this.env.CHILD_WORKFLOW.create({
          id: `child-${event.instanceId}`,
          params: { fileKey: result.fileKey },
        });
      });


      // Parent continues immediately - not blocked by child workflow
      await step.do("continue with other work", async () => {
        console.log(`Started child workflow: ${childInstance.id}`);
        // This runs right away, regardless of child workflow status
      });
    }
  }
  ```

If the child Workflow fails to start, the step will fail and be retried according to your retry configuration. Once the child instance is successfully created, it runs independently from the parent.

## REST API (HTTP)

Refer to the [Workflows REST API documentation](https://developers.cloudflare.com/api/resources/workflows/subresources/instances/methods/create/).

## Command line (CLI)

Refer to the [CLI quick start](https://developers.cloudflare.com/workflows/get-started/guide/) to learn more about how to manage and trigger Workflows via the command-line.

</page>

<page>
---
title: Visualize Workflows · Cloudflare Workflows docs
description: View a visual representation of your parsed Workflow code as a
  diagram on the Cloudflare dashboard.
lastUpdated: 2026-02-04T15:06:05.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/workflows/build/visualizer/
  md: https://developers.cloudflare.com/workflows/build/visualizer/index.md
---

View a visual representation of your parsed Workflow code as a diagram on the Cloudflare dashboard.

The diagram illustrates your sequenced & parallel steps, conditionals, loops, and nested logic. To see the Workflow at a high level, view the diagram with loops and conditionals collapsed, or expand for a more detailed view.

![Example diagram](https://developers.cloudflare.com/_astro/2026-02-03-workflows-diagram.BfQAnWL3_Z262koW.webp)

Workflow diagrams are currently in beta for all Typescript and Javascript Workers. View your Workflows in the [Cloudflare dashboard](https://dash.cloudflare.com/?to=/:account/workers/workflows) to see their diagrams.

Warning

Note that this feature is currently in beta.

* Workflows that use a non-default bundler may display unexpected behavior.
* Python Workflows are not currently supported.

</page>

<page>
---
title: Workers API · Cloudflare Workflows docs
description: This guide details the Workflows API within Cloudflare Workers,
  including methods, types, and usage examples.
lastUpdated: 2026-02-08T16:43:40.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/workflows/build/workers-api/
  md: https://developers.cloudflare.com/workflows/build/workers-api/index.md
---

This guide details the Workflows API within Cloudflare Workers, including methods, types, and usage examples.

## WorkflowEntrypoint

The `WorkflowEntrypoint` class is the core element of a Workflow definition. A Workflow must extend this class and define a `run` method with at least one `step` call to be considered a valid Workflow.

```ts
export class MyWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    // Steps here
  }
}
```

### run

* `run(event: WorkflowEvent<T>, step: WorkflowStep): Promise<T>`

  * `event` - the event passed to the Workflow, including an optional `payload` containing data (parameters)
  * `step` - the `WorkflowStep` type that provides the step methods for your Workflow

The `run` method can optionally return data, which is available when querying the instance status via the [Workers API](https://developers.cloudflare.com/workflows/build/workers-api/#instancestatus), [REST API](https://developers.cloudflare.com/api/resources/workflows/subresources/instances/subresources/status/) and the Workflows dashboard. This can be useful if your Workflow is computing a result, returning the key to data stored in object storage, or generating some kind of identifier you need to act on.

```ts
export class MyWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    // Steps here
    let someComputedState = await step.do("my step", async () => {});


    // Optional: return state from our run() method
    return someComputedState;
  }
}
```

The `WorkflowEvent` type accepts an optional [type parameter](https://www.typescriptlang.org/docs/handbook/2/generics.html#working-with-generic-type-variables) that allows you to provide a type for the `payload` property within the `WorkflowEvent`.

Refer to the [events and parameters](https://developers.cloudflare.com/workflows/build/events-and-parameters/) documentation for how to handle events within your Workflow code.

Finally, any JS control-flow primitive (if conditions, loops, try-catches, promises, etc) can be used to manage steps inside the `run` method.

## WorkflowEvent

```ts
export type WorkflowEvent<T> = {
  payload: Readonly<T>;
  timestamp: Date;
  instanceId: string;
};
```

* The `WorkflowEvent` is the first argument to a Workflow's `run` method, and includes an optional `payload` parameter and a `timestamp` property.

  * `payload` - a default type of `any` or type `T` if a type parameter is provided.
  * `timestamp` - a `Date` object set to the time the Workflow instance was created (triggered).
  * `instanceId` - the ID of the associated instance.

Refer to the [events and parameters](https://developers.cloudflare.com/workflows/build/events-and-parameters/) documentation for how to handle events within your Workflow code.

## WorkflowStep

### step

* `step.do(name: string, callback: (): RpcSerializable): Promise<T>`

* `step.do(name: string, config?: WorkflowStepConfig, callback: (): RpcSerializable): Promise<T>`

  * `name` - the name of the step, up to 256 characters.
  * `config` (optional) - an optional `WorkflowStepConfig` for configuring [step specific retry behaviour](https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/).
  * `callback` - an asynchronous function that optionally returns serializable state for the Workflow to persist.

Returning state

When returning state from a `step`, ensure that the object you return is *serializable*.

Primitive types like `string`, `number`, and `boolean`, along with composite structures such as `Array` and `Object` (provided they only contain serializable values), can be serialized.

Objects that include `Function` or `Symbol` types, and objects with circular references, cannot be serialized and the Workflow instance will throw an error if objects with those types is returned.

* `step.sleep(name: string, duration: WorkflowDuration): Promise<void>`

  * `name` - the name of the step.
  * `duration` - the duration to sleep until, in either seconds or as a `WorkflowDuration` compatible string.
  * Refer to the [documentation on sleeping and retrying](https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/) to learn more about how Workflows are retried.

- `step.sleepUntil(name: string, timestamp: Date | number): Promise<void>`

  * `name` - the name of the step.
  * `timestamp` - a JavaScript `Date` object or milliseconds from the Unix epoch to sleep the Workflow instance until.

Note

`step.sleep` and `step.sleepUntil` methods do not count towards the maximum Workflow steps limit.

More information about the limits imposed on Workflow can be found in the [Workflows limits documentation](https://developers.cloudflare.com/workflows/reference/limits/).

* `step.waitForEvent(name: string, options: ): Promise<void>`

  * `name` - the name of the step.
  * `options` - an object with properties for `type` (up to 100 characters [1](#user-content-fn-1)), which determines which event type this `waitForEvent` call will match on when calling `instance.sendEvent`, and an optional `timeout` property, which defines how long the `waitForEvent` call will block for before throwing a timeout exception. The default timeout is 24 hours.

- JavaScript

  ```js
  export class MyWorkflow extends WorkflowEntrypoint {
    async run(event, step) {
      // Other steps in your Workflow
      let stripeEvent = await step.waitForEvent(
        "receive invoice paid webhook from Stripe",
        { type: "stripe-webhook", timeout: "1 hour" },
      );
      // Rest of your Workflow
    }
  }
  ```

- TypeScript

  ```ts
  export class MyWorkflow extends WorkflowEntrypoint<Env, Params> {
    async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
      // Other steps in your Workflow
      let stripeEvent = await step.waitForEvent<IncomingStripeWebhook>(
        "receive invoice paid webhook from Stripe",
        { type: "stripe-webhook", timeout: "1 hour" },
      );
      // Rest of your Workflow
    }
  }
  ```

Review the documentation on [events and parameters](https://developers.cloudflare.com/workflows/build/events-and-parameters/) to learn how to send events to a running Workflow instance.

## WorkflowStepConfig

```ts
export type WorkflowStepConfig = {
  retries?: {
    limit: number;
    delay: string | number;
    backoff?: WorkflowBackoff;
  };
  timeout?: string | number;
};
```

* A `WorkflowStepConfig` is an optional argument to the `do` method of a `WorkflowStep` and defines properties that allow you to configure the retry behaviour of that step.

Refer to the [documentation on sleeping and retrying](https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/) to learn more about how Workflows are retried.

## NonRetryableError

* `throw new NonRetryableError(message: string, name string optional)`: NonRetryableError

  * When thrown inside [`step.do()`](https://developers.cloudflare.com/workflows/build/workers-api/#step), this error stops step retries, propagating the error to the top level (the [run](https://developers.cloudflare.com/workflows/build/workers-api/#run) function). Any error not handled at this top level will cause the Workflow instance to fail.
  * Refer to the [documentation on sleeping and retrying](https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/) to learn more about how Workflows steps are retried.

## Call Workflows from Workers

Workflows exposes an API directly to your Workers scripts via the [bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/#what-is-a-binding) concept. Bindings allow you to securely call a Workflow without having to manage API keys or clients.

You can bind to a Workflow by defining a `[[workflows]]` binding within your Wrangler configuration.

For example, to bind to a Workflow called `workflows-starter` and to make it available on the `MY_WORKFLOW` variable to your Worker script, you would configure the following fields within the `[[workflows]]` binding definition:

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "workflows-starter",
    "main": "src/index.ts",
    "compatibility_date": "2026-02-10",
    "workflows": [
      {
        // name of your workflow
        "name": "workflows-starter",
        // binding name env.MY_WORKFLOW
        "binding": "MY_WORKFLOW",
        // this is class that extends the Workflow class in src/index.ts
        "class_name": "MyWorkflow"
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "workflows-starter"
  main = "src/index.ts"
  compatibility_date = "2026-02-10"


  [[workflows]]
  name = "workflows-starter"
  binding = "MY_WORKFLOW"
  class_name = "MyWorkflow"
  ```

### Bind from Pages

You can bind and trigger Workflows from [Pages Functions](https://developers.cloudflare.com/pages/functions/) by deploying a Workers project with your Workflow definition and then invoking that Worker using [service bindings](https://developers.cloudflare.com/pages/functions/bindings/#service-bindings) or a standard `fetch()` call.

Visit the documentation on [calling Workflows from Pages](https://developers.cloudflare.com/workflows/build/call-workflows-from-pages/) for examples.

### Cross-script calls

You can also bind to a Workflow that is defined in a different Worker script from the script your Workflow definition is in. To do this, provide the `script_name` key with the name of the script to the `[[workflows]]` binding definition in your Wrangler configuration.

For example, if your Workflow is defined in a Worker script named `billing-worker`, but you are calling it from your `web-api-worker` script, your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) would resemble the following:

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "web-api-worker",
    "main": "src/index.ts",
    "compatibility_date": "2026-02-10",
    "workflows": [
      {
        // name of your workflow
        "name": "billing-workflow",
        // binding name env.MY_WORKFLOW
        "binding": "MY_WORKFLOW",
        // this is class that extends the Workflow class in src/index.ts
        "class_name": "MyWorkflow",
        // the script name where the Workflow is defined.
        // required if the Workflow is defined in another script.
        "script_name": "billing-worker"
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "web-api-worker"
  main = "src/index.ts"
  compatibility_date = "2026-02-10"


  [[workflows]]
  name = "billing-workflow"
  binding = "MY_WORKFLOW"
  class_name = "MyWorkflow"
  script_name = "billing-worker"
  ```

If you're using TypeScript, run [`wrangler types`](https://developers.cloudflare.com/workers/wrangler/commands/#types) whenever you modify your Wrangler configuration file. This generates types for the `env` object based on your bindings, as well as [runtime types](https://developers.cloudflare.com/workers/languages/typescript/).

## Workflow

Note

Ensure you have a compatibility date `2024-10-22` or later installed when binding to Workflows from within a Workers project.

The `Workflow` type provides methods that allow you to create, inspect the status, and manage running Workflow instances from within a Worker script. It is part of the generated types produced by [`wrangler types`](https://developers.cloudflare.com/workers/wrangler/commands/#types).

```ts
interface Env {
  // The 'MY_WORKFLOW' variable should match the "binding" value set in the Wrangler config file
  MY_WORKFLOW: Workflow;
}
```

The `Workflow` type exports the following methods:

### create

Create (trigger) a new instance of the given Workflow.

* `create(options?: WorkflowInstanceCreateOptions): Promise<WorkflowInstance>`
  * `options` - optional properties to pass when creating an instance, including a user-provided ID and payload parameters.

An ID is automatically generated, but a user-provided ID can be specified (up to 100 characters [1](#user-content-fn-1)). This can be useful when mapping Workflows to users, merchants or other identifiers in your system. You can also provide a JSON object as the `params` property, allowing you to pass data for the Workflow instance to act on as its [`WorkflowEvent`](https://developers.cloudflare.com/workflows/build/events-and-parameters/).

```ts
// Create a new Workflow instance with your own ID and pass params to the Workflow instance
let instance = await env.MY_WORKFLOW.create({
  id: myIdDefinedFromOtherSystem,
  params: { hello: "world" },
});
return Response.json({
  id: instance.id,
  details: await instance.status(),
});
```

Returns a `WorkflowInstance`.

Throws an error if the provided ID is already used by an existing instance that has not yet passed its [retention limit](https://developers.cloudflare.com/workflows/reference/limits/). To re-run a workflow with the same ID, you can [`restart`](https://developers.cloudflare.com/workflows/build/trigger-workflows/#restart-a-workflow) the existing instance.

Warning

Providing a type parameter does *not* validate that the incoming event matches your type definition. In TypeScript, properties (fields) that do not exist or conform to the type you provided will be dropped. If you need to validate incoming events, we recommend a library such as [zod](https://zod.dev/) or your own validator logic.

You can also provide a type parameter to the `Workflows` type when creating (triggering) a Workflow instance using the `create` method of the [Workers API](https://developers.cloudflare.com/workflows/build/workers-api/#workflow). Note that this does *not* propagate type information into the Workflow itself, as TypeScript types are a build-time construct.

To provide an optional type parameter to the `Workflow`, pass a type argument with your type when defining your Workflow bindings:

```ts
interface User {
  email: string;
  createdTimestamp: number;
}


interface Env {
  // Pass our User type as the type parameter to the Workflow definition
  MY_WORKFLOW: Workflow<User>;
}


export default {
  async fetch(request, env, ctx) {
    // More likely to come from your database or via the request body!
    const user: User = {
      email: user@example.com,
      createdTimestamp: Date.now()
    }


    let instance = await env.MY_WORKFLOW.create({
      // params expects the type User
      params: user
    })


    return Response.json({
      id: instance.id,
      details: await instance.status(),
    });
  }
}
```

### createBatch

Create (trigger) a batch of new instance of the given Workflow, up to 100 instances at a time.

This is useful when you are scheduling multiple instances at once. A call to `createBatch` is treated the same as a call to `create` (for a single instance) and allows you to work within the [instance creation limit](https://developers.cloudflare.com/workflows/reference/limits/).

* `createBatch(batch: WorkflowInstanceCreateOptions[]): Promise<WorkflowInstance[]>`
  * `batch` - list of Options to pass when creating an instance, including a user-provided ID and payload parameters.

Each element of the `batch` list is expected to include both `id` and `params` properties:

```ts
// Create a new batch of 3 Workflow instances, each with its own ID and pass params to the Workflow instances
const listOfInstances = [
  { id: "id-abc123", params: { hello: "world-0" } },
  { id: "id-def456", params: { hello: "world-1" } },
  { id: "id-ghi789", params: { hello: "world-2" } },
];
let instances = await env.MY_WORKFLOW.createBatch(listOfInstances);
```

Returns an array of `WorkflowInstance`.

Unlike [`create`](https://developers.cloudflare.com/workflows/build/workers-api/#create), this operation is idempotent and will not fail if an ID is already in use. If an existing instance with the same ID is still within its [retention limit](https://developers.cloudflare.com/workflows/reference/limits/), it will be skipped and excluded from the returned array.

### get

Get a specific Workflow instance by ID.

* `get(id: string): Promise<WorkflowInstance>`- `id` - the ID of the Workflow instance.

Returns a `WorkflowInstance`. Throws an exception if the instance ID does not exist.

```ts
// Fetch an existing Workflow instance by ID:
try {
  let instance = await env.MY_WORKFLOW.get(id);
  return Response.json({
    id: instance.id,
    details: await instance.status(),
  });
} catch (e: any) {
  // Handle errors
  // .get will throw an exception if the ID doesn't exist or is invalid.
  const msg = `failed to get instance ${id}: ${e.message}`;
  console.error(msg);
  return Response.json({ error: msg }, { status: 400 });
}
```

## WorkflowInstanceCreateOptions

Optional properties to pass when creating an instance.

```ts
interface WorkflowInstanceCreateOptions {
  /**
   * An id for your Workflow instance. Must be unique within the Workflow.
   */
  id?: string;
  /**
   * The event payload the Workflow instance is triggered with
   */
  params?: unknown;
}
```

## WorkflowInstance

Represents a specific instance of a Workflow, and provides methods to manage the instance.

```ts
declare abstract class WorkflowInstance {
  public id: string;
  /**
   * Pause the instance.
   */
  public pause(): Promise<void>;
  /**
   * Resume the instance. If it is already running, an error will be thrown.
   */
  public resume(): Promise<void>;
  /**
   * Terminate the instance. If it is errored, terminated or complete, an error will be thrown.
   */
  public terminate(): Promise<void>;
  /**
   * Restart the instance.
   */
  public restart(): Promise<void>;
  /**
   * Returns the current status of the instance.
   */
  public status(): Promise<InstanceStatus>;
}
```

### id

Return the id of a Workflow.

* `id: string`

### status

Return the status of a running Workflow instance.

* `status(): Promise<InstanceStatus>`

### pause

Pause a running Workflow instance.

* `pause(): Promise<void>`

### resume

Resume a paused Workflow instance.

* `resume(): Promise<void>`

### restart

Restart a Workflow instance.

* `restart(): Promise<void>`

### terminate

Terminate a Workflow instance.

* `terminate(): Promise<void>`

### sendEvent

[Send an event](https://developers.cloudflare.com/workflows/build/events-and-parameters/) to a running Workflow instance.

* `sendEvent(): Promise<void>`
  * `options` - the event `type` (up to 100 characters [1](#user-content-fn-1)) and `payload` to send to the Workflow instance. The `type` must match the `type` in the corresponding `waitForEvent` call in your Workflow.

Return `void` on success; throws an exception if the Workflow is not running or is an errored state.

* JavaScript

  ```js
  export default {
    async fetch(req, env) {
      const instanceId = new URL(req.url).searchParams.get("instanceId");
      const webhookPayload = await req.json();


      let instance = await env.MY_WORKFLOW.get(instanceId);
      // Send our event, with `type` matching the event type defined in
      // our step.waitForEvent call
      await instance.sendEvent({
        type: "stripe-webhook",
        payload: webhookPayload,
      });


      return Response.json({
        status: await instance.status(),
      });
    },
  };
  ```

* TypeScript

  ```ts
  export default {
    async fetch(req: Request, env: Env) {
      const instanceId = new URL(req.url).searchParams.get("instanceId");
      const webhookPayload = await req.json<Payload>();


      let instance = await env.MY_WORKFLOW.get(instanceId);
      // Send our event, with `type` matching the event type defined in
      // our step.waitForEvent call
      await instance.sendEvent({
        type: "stripe-webhook",
        payload: webhookPayload,
      });


      return Response.json({
        status: await instance.status(),
      });
    },
  };
  ```

You can call `sendEvent` multiple times, setting the value of the `type` property to match the specific `waitForEvent` calls in your Workflow.

This allows you to wait for multiple events at once, or use `Promise.race` to wait for multiple events and allow the first event to progress the Workflow.

### InstanceStatus

Details the status of a Workflow instance.

```ts
type InstanceStatus = {
  status:
    | "queued" // means that instance is waiting to be started (see concurrency limits)
    | "running"
    | "paused"
    | "errored"
    | "terminated" // user terminated the instance while it was running
    | "complete"
    | "waiting" // instance is hibernating and waiting for sleep or event to finish
    | "waitingForPause" // instance is finishing the current work to pause
    | "unknown";
  error?: {
    name: string,
    message: string
  };
  output?: unknown;
};
```

## Footnotes

1. Match pattern: `^[a-zA-Z0-9_][a-zA-Z0-9-_]*$` [↩](#user-content-fnref-1) [↩2](#user-content-fnref-1-2) [↩3](#user-content-fnref-1-3)

</page>

<page>
---
title: Agents · Cloudflare Workflows docs
description: Build AI-powered Agents on Cloudflare
lastUpdated: 2025-01-29T20:30:56.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/workflows/examples/agents/
  md: https://developers.cloudflare.com/workflows/examples/agents/index.md
---


</page>

<page>
---
title: Export and save D1 database · Cloudflare Workflows docs
description: Send invoice when shopping cart is checked out and paid for
lastUpdated: 2026-02-02T18:38:11.000Z
chatbotDeprioritize: false
tags: TypeScript
source_url:
  html: https://developers.cloudflare.com/workflows/examples/backup-d1/
  md: https://developers.cloudflare.com/workflows/examples/backup-d1/index.md
---

In this example, we implement a Workflow periodically triggered by a [Cron Trigger](https://developers.cloudflare.com/workers/configuration/cron-triggers). That Workflow initiates a backup for a D1 database using the REST API, and then stores the SQL dump in an [R2](https://developers.cloudflare.com/r2) bucket.

When the Workflow is triggered, it fetches the REST API to initiate an export job for a specific database. Then it fetches the same endpoint to check if the backup job is ready and the SQL dump is available to download.

As shown in this example, Workflows handles both the responses and failures, thereby removing the burden from the developer. Workflows retries the following steps:

* API calls until it gets a successful response
* Fetching the backup from the URL provided
* Saving the file to [R2](https://developers.cloudflare.com/r2)

The Workflow can run until the backup file is ready, handling all of the possible conditions until it is completed.

This example provides simplified steps for backing up a [D1](https://developers.cloudflare.com/d1) database to help you understand the possibilities of Workflows. In every step, it uses the [default](https://developers.cloudflare.com/workflows/build/sleeping-and-retrying) sleeping and retrying configuration. In a real-world scenario, more steps and additional logic would likely be needed.

```ts
import {
  WorkflowEntrypoint,
  WorkflowStep,
  WorkflowEvent,
} from "cloudflare:workers";


// We are using R2 to store the D1 backup
type Env = {
  BACKUP_WORKFLOW: Workflow;
  D1_REST_API_TOKEN: string;
  BACKUP_BUCKET: R2Bucket;
};


// Workflow parameters: we expect accountId and databaseId
type Params = {
  accountId: string;
  databaseId: string;
};


// Workflow logic
export class backupWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const { accountId, databaseId } = event.payload;


    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/export`;
    const method = "POST";
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${this.env.D1_REST_API_TOKEN}`);


    const bookmark = await step.do(
      `Starting backup for ${databaseId}`,
      async () => {
        const payload = { output_format: "polling" };


        const res = await fetch(url, {
          method,
          headers,
          body: JSON.stringify(payload),
        });
        const { result } = (await res.json()) as any;


        // If we don't get `at_bookmark` we throw to retry the step
        if (!result?.at_bookmark) throw new Error("Missing `at_bookmark`");


        return result.at_bookmark;
      },
    );


    await step.do("Check backup status and store it on R2", async () => {
      const payload = { current_bookmark: bookmark };


      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      });
      const { result } = (await res.json()) as any;


      // The endpoint sends `signed_url` when the backup is ready to download.
      // If we don't get `signed_url` we throw to retry the step.
      if (!result?.signed_url) throw new Error("Missing `signed_url`");


      const dumpResponse = await fetch(result.signed_url);
      if (!dumpResponse.ok) throw new Error("Failed to fetch dump file");


      // Finally, stream the file directly to R2
      await this.env.BACKUP_BUCKET.put(result.filename, dumpResponse.body);
    });
  }
}


export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    return new Response("Not found", { status: 404 });
  },
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ) {
    const params: Params = {
      accountId: "{accountId}",
      databaseId: "{databaseId}",
    };
    const instance = await env.BACKUP_WORKFLOW.create({ params });
    console.log(`Started workflow: ${instance.id}`);
  },
};
```

Here is a minimal package.json:

```json
{
  "devDependencies": {
    "wrangler": "^3.99.0"
  }
}
```

Here is a [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/):

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "backup-d1",
    "main": "src/index.ts",
    "compatibility_date": "2026-02-10",
    "compatibility_flags": [
      "nodejs_compat"
    ],
    "workflows": [
      {
        "name": "backup-workflow",
        "binding": "BACKUP_WORKFLOW",
        "class_name": "backupWorkflow"
      }
    ],
    "r2_buckets": [
      {
        "binding": "BACKUP_BUCKET",
        "bucket_name": "d1-backups"
      }
    ],
    "triggers": {
      "crons": [
        "0 0 * * *"
      ]
    }
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "backup-d1"
  main = "src/index.ts"
  compatibility_date = "2026-02-10"
  compatibility_flags = [ "nodejs_compat" ]


  [[workflows]]
  name = "backup-workflow"
  binding = "BACKUP_WORKFLOW"
  class_name = "backupWorkflow"


  [[r2_buckets]]
  binding = "BACKUP_BUCKET"
  bucket_name = "d1-backups"


  [triggers]
  crons = [ "0 0 * * *" ]
  ```

</page>

<page>
---
title: Pay cart and send invoice · Cloudflare Workflows docs
description: Send invoice when shopping cart is checked out and paid for
lastUpdated: 2026-02-02T18:38:11.000Z
chatbotDeprioritize: false
tags: TypeScript
source_url:
  html: https://developers.cloudflare.com/workflows/examples/send-invoices/
  md: https://developers.cloudflare.com/workflows/examples/send-invoices/index.md
---

In this example, we implement a Workflow for an e-commerce website that is triggered every time a shopping cart is created.

Once a Workflow instance is triggered, it starts polling a [D1](https://developers.cloudflare.com/d1) database for the cart ID until it has been checked out. Once the shopping cart is checked out, we proceed to process the payment with an external provider doing a fetch POST. Finally, assuming everything goes well, we try to send an email using [Email Workers](https://developers.cloudflare.com/email-routing/email-workers/) with the invoice to the customer.

As you can see, Workflows handles all the different service responses and failures; it will retry D1 until the cart is checked out, retry the payment processor if it fails for some reason, and retry sending the email with the invoice if it can't. The developer doesn't have to care about any of that logic, and the workflow can run for hours, handling all the possible conditions until it is completed.

This is a simplified example of processing a shopping cart. We would assume more steps and additional logic in a real-life scenario, but this example gives you a good idea of what you can do with Workflows.

```ts
import {
  WorkflowEntrypoint,
  WorkflowStep,
  WorkflowEvent,
} from "cloudflare:workers";
import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";


// We are using Email Routing to send emails out and D1 for our cart database
type Env = {
  CART_WORKFLOW: Workflow;
  SEND_EMAIL: any;
  DB: any;
};


// Workflow parameters: we expect a cartId
type Params = {
  cartId: string;
};


// Adjust this to your Cloudflare zone using Email Routing
const merchantEmail = "merchant@example.com";


// Uses mimetext npm to generate Email
const genEmail = (email: string, amount: number) => {
  const msg = createMimeMessage();
  msg.setSender({ name: "Pet shop", addr: merchantEmail });
  msg.setRecipient(email);
  msg.setSubject("You invoice");
  msg.addMessage({
    contentType: "text/plain",
    data: `Your invoice for ${amount} has been paid. Your products will be shipped shortly.`,
  });


  return new EmailMessage(merchantEmail, email, msg.asRaw());
};


// Workflow logic
export class cartInvoicesWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    await step.sleep("sleep for a while", "10 seconds");


    // Retrieve the cart from the D1 database
    // if the cart hasn't been checked out yet retry every 2 minutes, 10 times, otherwise give up
    const cart = await step.do(
      "retrieve cart",
      {
        retries: {
          limit: 10,
          delay: 2000 * 60,
          backoff: "constant",
        },
        timeout: "30 seconds",
      },
      async () => {
        const { results } = await this.env.DB.prepare(
          `SELECT * FROM cart WHERE id = ?`,
        )
          .bind(event.payload.cartId)
          .run();
        // should return { checkedOut: true, amount: 250 , account: { email: "celsomartinho@gmail.com" }};
        if (results[0].checkedOut === false) {
          throw new Error("cart hasn't been checked out yet");
        }
        return results[0];
      },
    );


    // Proceed to payment, retry 10 times every minute or give up
    const payment = await step.do(
      "payment",
      {
        retries: {
          limit: 10,
          delay: 1000 * 60,
          backoff: "constant",
        },
        timeout: "30 seconds",
      },
      async () => {
        let resp = await fetch("https://payment-processor.example.com/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: JSON.stringify({ amount: cart.amount }),
        });


        if (!resp.ok) {
          throw new Error("payment has failed");
        }


        return { success: true, amount: cart.amount };
      },
    );


    // Send invoice to the customer, retry 10 times every 5 minutes or give up
    // Requires that cart.account.email has previously been validated in Email Routing,
    // See https://developers.cloudflare.com/email-routing/email-workers/
    await step.do(
      "send invoice",
      {
        retries: {
          limit: 10,
          delay: 5000 * 60,
          backoff: "constant",
        },
        timeout: "30 seconds",
      },
      async () => {
        const message = genEmail(cart.account.email, payment.amount);
        try {
          await this.env.SEND_EMAIL.send(message);
        } catch (e) {
          throw new Error("failed to send invoice");
        }
      },
    );
  }
}


// Default page for admin
// Remove in production


export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    let url = new URL(req.url);


    let id = new URL(req.url).searchParams.get("instanceId");


    // Get the status of an existing instance, if provided
    if (id) {
      let instance = await env.CART_WORKFLOW.get(id);
      return Response.json({
        status: await instance.status(),
      });
    }


    if (url.pathname.startsWith("/new")) {
      let instance = await env.CART_WORKFLOW.create({
        params: {
          cartId: "123",
        },
      });
      return Response.json({
        id: instance.id,
        details: await instance.status(),
      });
    }


    return new Response(
      `<html><body><a href="/new">new instance</a> or add ?instanceId=...</body></html>`,
      {
        headers: {
          "content-type": "text/html;charset=UTF-8",
        },
      },
    );
  },
};
```

Here's a minimal package.json:

```json
{
  "devDependencies": {
    "wrangler": "^3.83.0"
  },
  "dependencies": {
    "mimetext": "^3.0.24"
  }
}
```

And finally [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/):

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "cart-invoices",
    "main": "src/index.ts",
    "compatibility_date": "2026-02-10",
    "compatibility_flags": [
      "nodejs_compat"
    ],
    "workflows": [
      {
        "name": "cart-invoices-workflow",
        "binding": "CART_WORKFLOW",
        "class_name": "cartInvoicesWorkflow"
      }
    ],
    "send_email": [
      {
        "name": "SEND_EMAIL"
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "cart-invoices"
  main = "src/index.ts"
  compatibility_date = "2026-02-10"
  compatibility_flags = [ "nodejs_compat" ]


  [[workflows]]
  name = "cart-invoices-workflow"
  binding = "CART_WORKFLOW"
  class_name = "cartInvoicesWorkflow"


  [[send_email]]
  name = "SEND_EMAIL"
  ```

If you're using TypeScript, run [`wrangler types`](https://developers.cloudflare.com/workers/wrangler/commands/#types) whenever you modify your Wrangler configuration file. This generates types for the `env` object based on your bindings, as well as [runtime types](https://developers.cloudflare.com/workers/languages/typescript/).

</page>

<page>
---
title: Integrate Workflows with Twilio · Cloudflare Workflows docs
description: Integrate Workflows with Twilio. Learn how to receive and send text
  messages and phone calls via APIs and Webhooks.
lastUpdated: 2026-01-27T21:11:25.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/workflows/examples/twilio/
  md: https://developers.cloudflare.com/workflows/examples/twilio/index.md
---

Using the following [repository](https://github.com/craigsdennis/twilio-cloudflare-workflow), learn how to integrate Cloudflare Workflows with Twilio, a popular cloud communications platform that enables developers to integrate messaging, voice, video, and authentication features into applications via APIs. By the end of the video tutorial, you will become familiarized with the process of setting up Cloudflare Workflows to seamlessly interact with Twilio's APIs, enabling you to build interesting communication features directly into your applications.

</page>

<page>
---
title: Human-in-the-Loop Image Tagging with waitForEvent · Cloudflare Workflows docs
description: Human-in-the-loop Workflow with waitForEvent API
lastUpdated: 2026-02-02T18:38:11.000Z
chatbotDeprioritize: false
tags: TypeScript
source_url:
  html: https://developers.cloudflare.com/workflows/examples/wait-for-event/
  md: https://developers.cloudflare.com/workflows/examples/wait-for-event/index.md
---

This example demonstrates how to use the `waitForEvent()` API in Cloudflare Workflows to introduce a human-in-the-loop step. The Workflow is triggered by an image upload, during which metadata is stored in a D1 database. The Workflow then waits for user approval, and upon approval, it uses Workers AI to generate image tags, which are stored in the database. An accompanying Next.js frontend application facilitates the image upload and approval process.

Note

The example on this page includes only a subset of the full implementation. For the complete codebase and deployment instructions, please refer to the [GitHub repository](https://github.com/cloudflare/docs-examples/tree/main/workflows/waitForEvent).

## Overview of the Workflow

In this Workflow, we simulate a scenario where an uploaded image requires human approval before AI-based processing. An image is uploaded to R2, then Workflow performs the following steps:

1. Stores image metadata in a D1 database.
2. Pauses execution using `waitForEvent()` and waits for an external event sent from the Next.js frontend, indicating approval or rejection.
3. If approved, the Workflow uses Workers AI to generate image tags and stores the tags in the D1 database.
4. If rejected, the Workflow ends without further action.

This pattern is useful in scenarios where certain operations should not proceed without explicit human consent, adding an extra layer of control and safety.

## Frontend Integration

This example includes a Next.js frontend application that facilitates the image upload and approval process. The frontend provides an interface for uploading images, reviewing them, and approving or rejecting them. Upon image upload, the application triggers the Cloudflare Workflow, which then manages the subsequent steps, including waiting for user approval and performing AI-based image tagging upon approval.

Refer to the `/nextjs-workflow-frontend` folder in the [GitHub repository](https://github.com/cloudflare/docs-examples/tree/main/workflows/waitForEvent) for the complete frontend implementation and deployment details.

## Workflow index.ts

The `index.ts` file defines the core logic of the Cloudflare Workflow responsible for handling image uploads, awaiting human approval, and performing AI-based image tagging upon approval. It extends the `WorkflowEntrypoint` class and implements the `run()` method.

For the complete implementation of the `index.ts` file, please refer to the [GitHub repository](https://github.com/cloudflare/docs-examples/blob/main/workflows/waitForEvent/workflow/src/index.ts).

* JavaScript

  ```js
  export class MyWorkflow extends WorkflowEntrypoint {
    db;


    async run(event, step) {
      this.db = new DatabaseService(this.env.DB);
      const { imageKey } = event.payload;


      await step.do("Insert image name into database", async () => {
        await this.db.insertImage(imageKey, event.instanceId);
      });


      const waitForApproval = await step.waitForEvent(
        "Wait for AI Image tagging approval",
        {
          type: "approval-for-ai-tagging",
          timeout: "5 minute",
        },
      );


      const approvalPayload = waitForApproval.payload;
      if (approvalPayload?.approved) {
        const aiTags = await step.do("Generate AI tags", async () => {
          const image = await this.env.workflow_demo_bucket.get(imageKey);
          if (!image) throw new Error("Image not found");


          const arrayBuffer = await image.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);


          const input = {
            image: Array.from(uint8Array),
            prompt: AI_CONFIG.PROMPT,
            max_tokens: AI_CONFIG.MAX_TOKENS,
          };


          const response = await this.env.AI.run(AI_CONFIG.MODEL, input);
          return response.description;
        });


        await step.do("Update DB with AI tags", async () => {
          await this.db.updateImageTags(event.instanceId, aiTags);
        });
      }
    }
  }
  ```

* TypeScript

  ```ts
  export class MyWorkflow extends WorkflowEntrypoint<Env, WorkflowParams> {
    private db!: DatabaseService;


    async run(event: WorkflowEvent<WorkflowParams>, step: WorkflowStep) {
      this.db = new DatabaseService(this.env.DB);
      const { imageKey } = event.payload;


      await step.do('Insert image name into database', async () => {
        await this.db.insertImage(imageKey, event.instanceId);
      });


      const waitForApproval = await step.waitForEvent('Wait for AI Image tagging approval', {
        type: 'approval-for-ai-tagging',
        timeout: '5 minute',
      });


      const approvalPayload = waitForApproval.payload as ApprovalRequest;
      if (approvalPayload?.approved) {
        const aiTags = await step.do('Generate AI tags', async () => {
          const image = await this.env.workflow_demo_bucket.get(imageKey);
          if (!image) throw new Error('Image not found');


          const arrayBuffer = await image.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);


          const input = {
            image: Array.from(uint8Array),
            prompt: AI_CONFIG.PROMPT,
            max_tokens: AI_CONFIG.MAX_TOKENS,
          };


          const response = await this.env.AI.run(AI_CONFIG.MODEL, input);
          return response.description;
        });


        await step.do('Update DB with AI tags', async () => {
          await this.db.updateImageTags(event.instanceId, aiTags);
        });
      }
    }
  }
  ```

## Workflow wrangler.jsonc

The Workflow configuration is defined in the `wrangler.jsonc` file. This file includes bindings for the R2 bucket, D1 database, Workers AI, and the Workflow itself. Ensure that all necessary bindings and environment variables are correctly set up to match your Cloudflare account and services.

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "node_modules/wrangler/config-schema.json",
    "name": "workflows-waitforevent",
    "main": "src/index.ts",
    "compatibility_date": "2026-02-10",
    "observability": {
      "enabled": true,
      "head_sampling_rate": 1,
    },
    "ai": {
      "binding": "AI"
    },
    "workflows": [
      {
        "name": "workflows-starter",
        "binding": "MY_WORKFLOW",
        "class_name": "MyWorkflow"
      }
    ],
    "r2_buckets": [
      {
        "bucket_name": "workflow-demo",
        "binding": "workflow_demo_bucket"
      }
    ],
    "d1_databases": [
      {
        "binding": "DB",
        "database_name": "workflows-demo-d1",
        "database_id": "66e4fbe9-06ac-4548-abba-2dc42088e13a"
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "node_modules/wrangler/config-schema.json"
  name = "workflows-waitforevent"
  main = "src/index.ts"
  compatibility_date = "2026-02-10"


  [observability]
  enabled = true
  head_sampling_rate = 1


  [ai]
  binding = "AI"


  [[workflows]]
  name = "workflows-starter"
  binding = "MY_WORKFLOW"
  class_name = "MyWorkflow"


  [[r2_buckets]]
  bucket_name = "workflow-demo"
  binding = "workflow_demo_bucket"


  [[d1_databases]]
  binding = "DB"
  database_name = "workflows-demo-d1"
  database_id = "66e4fbe9-06ac-4548-abba-2dc42088e13a"
  ```

For access to the codebase, deployment instructions, and reference architecture, please visit the [GitHub repository](https://github.com/cloudflare/docs-examples/tree/main/workflows/waitForEvent). This resource provides all the necessary tools and information to effectively implement the Workflow and Next.js frontend application.

</page>

<page>
---
title: Build a Durable AI Agent · Cloudflare Workflows docs
description: 'In this guide, you will build an AI agent that researches GitHub
  repositories. Give it a task like "Compare open-source LLM projects" and it
  will:'
lastUpdated: 2026-02-09T12:13:25.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/workflows/get-started/durable-agents/
  md: https://developers.cloudflare.com/workflows/get-started/durable-agents/index.md
---

In this guide, you will build an AI agent that researches GitHub repositories. Give it a task like "Compare open-source LLM projects" and it will:

1. Search GitHub for relevant repositories
2. Fetch details about each one (stars, forks, activity)
3. Analyze and compare them
4. Return a recommendation

Each LLM call and tool call becomes a step — a self-contained, individually retriable unit of work. If any step fails, Workflows retries it automatically. If the entire Workflow crashes mid-task, it resumes from the last successful step.

| Challenge | Solution with Workflows |
| - | - |
| Long-running agent loops | Durable execution that survives any interruption |
| Unreliable LLM and API calls | Automatic retry with independent checkpoints |
| Waiting for human approval | `waitForEvent()` pauses for hours or days |
| Polling for job completion | `step.sleep()` between checks without consuming resources |

This guide uses the [Agents SDK](https://developers.cloudflare.com/agents/) with Workflows for real-time progress updates and the Anthropic SDK for LLM calls. The same patterns apply to any LLM SDK (OpenAI, Google AI, Mistral, etc.).

## Quick start

If you want to skip the steps and pull down the complete agent, utilizing [AI Gateway](https://developers.cloudflare.com/ai-gateway), run the following command:

```sh
npm create cloudflare@latest -- --template cloudflare/docs-examples/workflows/durableAgent
```

Use this option if you are familiar with Cloudflare Workflows or want to explore the code first.

Follow the steps below to learn how to build a durable AI agent from scratch.

## Prerequisites

1. Sign up for a [Cloudflare account](https://dash.cloudflare.com/sign-up/workers-and-pages).
2. Install [`Node.js`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

Node.js version manager

Use a Node version manager like [Volta](https://volta.sh/) or [nvm](https://github.com/nvm-sh/nvm) to avoid permission issues and change Node.js versions. [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/), discussed later in this guide, requires a Node version of `16.17.0` or later.

You will also need an [Anthropic API key](https://platform.claude.com/settings/keys) for LLM calls. New accounts include free credits.

## 1. Create a new Worker project

1. Create a new Worker project by running the following command:

   * npm

     ```sh
     npm create cloudflare@latest -- durable-ai-agent
     ```

   * yarn

     ```sh
     yarn create cloudflare durable-ai-agent
     ```

   * pnpm

     ```sh
     pnpm create cloudflare@latest durable-ai-agent
     ```

   For setup, select the following options:

   * For *What would you like to start with?*, choose `Hello World example`.
   * For *Which template would you like to use?*, choose `Worker only`.
   * For *Which language do you want to use?*, choose `TypeScript`.
   * For *Do you want to use git for version control?*, choose `Yes`.
   * For *Do you want to deploy your application?*, choose `No` (we will be making some changes before deploying).

2. Move into your project:

   ```sh
   cd durable-ai-agent
   ```

3. Install dependencies:

   ```sh
   npm install agents @anthropic-ai/sdk
   ```

## 2. Define your tools

Tools are functions the LLM can call to interact with external systems. You define the schema (what inputs the tool accepts) and the implementation (what it does). The LLM decides when to use each tool based on the task.

1. Create `src/tools.ts` with two complementary tools:

   ```ts
   export interface SearchReposInput {
     query: string;
     limit?: number;
   }


   export interface GetRepoInput {
     owner: string;
     repo: string;
   }


   interface GitHubSearchResponse {
     items: Array<{ full_name: string; stargazers_count: number }>;
   }


   interface GitHubRepoResponse {
     full_name: string;
     description: string;
     stargazers_count: number;
     forks_count: number;
     open_issues_count: number;
     language: string;
     license: { name: string } | null;
     updated_at: string;
   }


   export const searchReposTool = {
     name: "search_repos" as const,
     description:
       "Search GitHub repositories by keyword. Returns top results. Use get_repo for details.",
     input_schema: {
       type: "object" as const,
       properties: {
         query: {
           type: "string",
           description: "Search query (e.g., 'typescript orm')",
         },
         limit: { type: "number", description: "Max results (default 5)" },
       },
       required: ["query"],
     },
     run: async (input: SearchReposInput): Promise<string> => {
       const response = await fetch(
         `https://api.github.com/search/repositories?q=${encodeURIComponent(input.query)}&sort=stars&per_page=${input.limit ?? 5}`,
         {
           headers: {
             Accept: "application/vnd.github+json",
             "User-Agent": "DurableAgent/1.0",
           },
         },
       );
       if (!response.ok) return `Search failed: ${response.status}`;
       const data = await response.json<GitHubSearchResponse>();
       return JSON.stringify(
         data.items.map((r) => ({
           name: r.full_name,
           stars: r.stargazers_count,
         })),
       );
     },
   };


   export const getRepoTool = {
     name: "get_repo" as const,
     description:
       "Get detailed info about a GitHub repository including stars, forks, and description.",
     input_schema: {
       type: "object" as const,
       properties: {
         owner: {
           type: "string",
           description: "Repository owner (e.g., 'cloudflare')",
         },
         repo: {
           type: "string",
           description: "Repository name (e.g., 'workers-sdk')",
         },
       },
       required: ["owner", "repo"],
     },
     run: async (input: GetRepoInput): Promise<string> => {
       const response = await fetch(
         `https://api.github.com/repos/${input.owner}/${input.repo}`,
         {
           headers: {
             Accept: "application/vnd.github+json",
             "User-Agent": "DurableAgent/1.0",
           },
         },
       );
       if (!response.ok) return `Repo not found: ${input.owner}/${input.repo}`;
       const data = await response.json<GitHubRepoResponse>();
       return JSON.stringify({
         name: data.full_name,
         description: data.description,
         stars: data.stargazers_count,
         forks: data.forks_count,
         issues: data.open_issues_count,
         language: data.language,
         license: data.license?.name ?? "None",
         updated: data.updated_at,
       });
     },
   };


   export const tools = [searchReposTool, getRepoTool];
   ```

These tools complement each other: `search_repos` finds repositories, and `get_repo` fetches details about specific ones.

## 3. Write your Workflow

The `AgentWorkflow` class from the Agents SDK extends Cloudflare Workflows with bidirectional Agent communication. Your Workflow can report progress, broadcast to WebSocket clients, and call Agent methods via RPC.

* The [`step`](https://developers.cloudflare.com/workflows/build/workers-api/#step) object provides methods to define durable steps.
* `step.do(name, callback)` executes code and persists the result. If the Workflow is interrupted, it resumes from the last successful step.
* `this.reportProgress()` sends progress updates to the Agent (non-durable).
* `this.broadcastToClients()` sends messages to all connected WebSocket clients (non-durable).

For a gentler introduction, refer to [Build your first Workflow](https://developers.cloudflare.com/workflows/get-started/guide/).

Create `src/workflow.ts`:

```ts
import { AgentWorkflow } from "agents/workflows";
import type { AgentWorkflowEvent, AgentWorkflowStep } from "agents/workflows";
import Anthropic from "@anthropic-ai/sdk";
import {
  tools,
  searchReposTool,
  getRepoTool,
  type SearchReposInput,
  type GetRepoInput,
} from "./tools";
import type { ResearchAgent } from "./agent";


type Params = { task: string };


export class ResearchWorkflow extends AgentWorkflow<ResearchAgent, Params> {
  async run(event: AgentWorkflowEvent<Params>, step: AgentWorkflowStep) {
    const client = new Anthropic({ apiKey: this.env.ANTHROPIC_API_KEY });


    const messages: Anthropic.MessageParam[] = [
      { role: "user", content: event.payload.task },
    ];


    const toolDefinitions = tools.map(({ run, ...rest }) => rest);


    // Durable agent loop - each turn is checkpointed
    for (let turn = 0; turn < 10; turn++) {
      // Report progress to Agent and connected clients
      await this.reportProgress({
        step: `llm-turn-${turn}`,
        status: "running",
        percent: turn / 10,
        message: `Processing turn ${turn + 1}...`,
      });


      const response = (await step.do(
        `llm-turn-${turn}`,
        { retries: { limit: 3, delay: "10 seconds", backoff: "exponential" } },
        async () => {
          const msg = await client.messages.create({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 4096,
            tools: toolDefinitions,
            messages,
          });
          // Serialize for Workflow state
          return JSON.parse(JSON.stringify(msg));
        },
      )) as Anthropic.Message;


      if (!response || !response.content) continue;


      messages.push({ role: "assistant", content: response.content });


      if (response.stop_reason === "end_turn") {
        const textBlock = response.content.find(
          (b): b is Anthropic.TextBlock => b.type === "text",
        );
        const result = {
          status: "complete",
          turns: turn + 1,
          result: textBlock?.text ?? null,
        };


        // Report completion (durable)
        await step.reportComplete(result);
        return result;
      }


      const toolResults: Anthropic.ToolResultBlockParam[] = [];


      for (const block of response.content) {
        if (block.type !== "tool_use") continue;


        // Broadcast tool execution to clients
        this.broadcastToClients({
          type: "tool_call",
          tool: block.name,
          turn,
        });


        const result = await step.do(
          `tool-${turn}-${block.id}`,
          { retries: { limit: 2, delay: "5 seconds" } },
          async () => {
            switch (block.name) {
              case "search_repos":
                return searchReposTool.run(block.input as SearchReposInput);
              case "get_repo":
                return getRepoTool.run(block.input as GetRepoInput);
              default:
                return `Unknown tool: ${block.name}`;
            }
          },
        );


        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result,
        });
      }


      messages.push({ role: "user", content: toolResults });
    }


    return { status: "max_turns_reached", turns: 10 };
  }
}
```

Why separate steps for LLM and tools?

Each `step.do()` creates a checkpoint. If your Workflow crashes or the Worker restarts:

* **After LLM step**: The response is persisted. On resume, it skips the LLM call and moves to tool execution.
* **After tool step**: The result is persisted. If a later tool fails, earlier tools do not re-run.

This is especially important for:

* **LLM calls**: Expensive and slow, should not repeat unnecessarily
* **External APIs**: May have rate limits or side effects
* **Idempotency**: Some tools (like sending emails) should not run twice

## 4. Write your Agent

The Agent handles HTTP requests, WebSocket connections, and Workflow lifecycle events. It triggers a workflow instance `runWorkflow()` and receives progress updates via callbacks.

Create `src/agent.ts`:

```ts
import { Agent } from "agents";


type State = {
  currentWorkflow?: string;
  status?: string;
};


export class ResearchAgent extends Agent<Env, State> {
  initialState: State = {};


  // Start a research task - called via HTTP or WebSocket
  async startResearch(task: string) {
    const instanceId = await this.runWorkflow("RESEARCH_WORKFLOW", { task });
    this.setState({
      ...this.state,
      currentWorkflow: instanceId,
      status: "running",
    });
    return { instanceId };
  }


  // Get status of a workflow
  async getResearchStatus(instanceId: string) {
    return this.getWorkflow(instanceId);
  }


  // Called when workflow reports progress
  async onWorkflowProgress(
    workflowName: string,
    instanceId: string,
    progress: unknown,
  ) {
    // Broadcast to all connected WebSocket clients
    this.broadcast(JSON.stringify({ type: "progress", instanceId, progress }));
  }


  // Called when workflow completes
  async onWorkflowComplete(
    workflowName: string,
    instanceId: string,
    result?: unknown,
  ) {
    this.setState({ ...this.state, status: "complete" });
    this.broadcast(JSON.stringify({ type: "complete", instanceId, result }));
  }


  // Called when workflow errors
  async onWorkflowError(
    workflowName: string,
    instanceId: string,
    error: string,
  ) {
    this.setState({ ...this.state, status: "error" });
    this.broadcast(JSON.stringify({ type: "error", instanceId, error }));
  }
}
```

## 5. Configure your project

1. Open `wrangler.jsonc` and add the Agent and Workflow configuration:

   * wrangler.jsonc

     ```jsonc
     {
       "$schema": "node_modules/wrangler/config-schema.json",
       "name": "durable-ai-agent",
       "main": "src/index.ts",
       "compatibility_date": "2026-02-10",
       "observability": {
         "enabled": true
       },
       "durable_objects": {
         "bindings": [
           {
             "name": "ResearchAgent",
             "class_name": "ResearchAgent"
           }
         ]
       },
       "workflows": [
         {
           "name": "research-workflow",
           "binding": "RESEARCH_WORKFLOW",
           "class_name": "ResearchWorkflow"
         }
       ],
       "migrations": [
         {
           "tag": "v1",
           "new_sqlite_classes": ["ResearchAgent"]
         }
       ]
     }
     ```

   * wrangler.toml

     ```toml
     "$schema" = "node_modules/wrangler/config-schema.json"
     name = "durable-ai-agent"
     main = "src/index.ts"
     compatibility_date = "2026-02-10"


     [observability]
     enabled = true


     [[durable_objects.bindings]]
     name = "ResearchAgent"
     class_name = "ResearchAgent"


     [[workflows]]
     name = "research-workflow"
     binding = "RESEARCH_WORKFLOW"
     class_name = "ResearchWorkflow"


     [[migrations]]
     tag = "v1"
     new_sqlite_classes = [ "ResearchAgent" ]
     ```

2. Generate types for your bindings:

   ```sh
   npx wrangler types
   ```

   This creates a `worker-configuration.d.ts` file with the `Env` type that includes your bindings.

## 6. Write your API

The Worker routes requests to the Agent, which manages workflow lifecycle. Use `routeAgentRequest()` for WebSocket connections and `getAgentByName()` for server-side RPC calls.

Replace `src/index.ts`:

```ts
import { getAgentByName, routeAgentRequest } from "agents";


export { ResearchAgent } from "./agent";
export { ResearchWorkflow } from "./workflow";


export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);


    // Route WebSocket connections to /agents/research-agent/{name}
    const agentResponse = await routeAgentRequest(request, env);
    if (agentResponse) return agentResponse;


    // HTTP API for starting research tasks
    if (request.method === "POST" && url.pathname === "/research") {
      const { task, agentId } = await request.json<{
        task: string;
        agentId?: string;
      }>();


      // Get agent instance by name (creates if doesn't exist)
      const agent = await getAgentByName(
        env.ResearchAgent,
        agentId ?? "default",
      );


      // Start the research workflow via RPC
      const result = await agent.startResearch(task);
      return Response.json(result);
    }


    // Check workflow status
    if (url.pathname === "/status") {
      const instanceId = url.searchParams.get("instanceId");
      const agentId = url.searchParams.get("agentId") ?? "default";


      if (!instanceId) {
        return Response.json({ error: "instanceId required" }, { status: 400 });
      }


      const agent = await getAgentByName(env.ResearchAgent, agentId);
      const status = await agent.getResearchStatus(instanceId);


      return Response.json(status);
    }


    return new Response("POST /research with { task } to start", {
      status: 400,
    });
  },
} satisfies ExportedHandler<Env>;
```

## 7. Develop locally

1. Create a [`.env` file](https://developers.cloudflare.com/workers/wrangler/environments/#secrets-in-local-development) for local development:

   ```sh
   ANTHROPIC_API_KEY=your-api-key-here
   ```

2. Start the dev server:

   ```sh
   npx wrangler dev
   ```

3. Start a research task:

   ```sh
   curl -X POST http://localhost:8787/research \
     -H "Content-Type: application/json" \
     -d '{"task": "Compare open-source LLM projects"}'
   ```

   ```json
   { "instanceId": "abc-123-def" }
   ```

4. Check progress (may take a few seconds to complete):

   ```sh
   curl "http://localhost:8787/status?instanceId=abc-123-def"
   ```

The agent will search for repositories, fetch details, and return a comparison. Progress updates are broadcast to any connected WebSocket clients.

## 8. Deploy

1. Deploy the Worker:

   ```sh
   npx wrangler deploy
   ```

2. Add your API key as a secret:

   ```sh
   npx wrangler secret put ANTHROPIC_API_KEY
   ```

3. Start a research task on your deployed Worker:

   ```sh
   curl -X POST https://durable-ai-agent.<your-subdomain>.workers.dev/research \
     -H "Content-Type: application/json" \
     -d '{"task": "Compare open-source LLM projects"}'
   ```

4. Inspect workflow runs with the CLI:

   ```sh
   npx wrangler workflows instances describe research-workflow latest
   ```

   This shows every step the agent took, including LLM calls, tool executions, timing, and any retries.

   You can also view this in the Cloudflare dashboard under **research-workflow**.

   [Go to **Workflows**](https://dash.cloudflare.com/?to=/:account/workers/workflows)

## Real-time client integration

Connect to your Agent via WebSocket to receive real-time progress updates. The `useAgent` hook connects to `/agents/{agent-name}/{instance-name}`:

```plaintext
/agents/research-agent/default  → ResearchAgent instance "default"
/agents/research-agent/user-123 → ResearchAgent instance "user-123"
```

```tsx
import { useState } from "react";
import { useAgent } from "agents/react";


function ResearchUI({ agentId = "default" }) {
  const [progress, setProgress] = useState(null);


  const { state } = useAgent({
    agent: "research-agent", // Maps to ResearchAgent class
    name: agentId, // Instance name
    onMessage: (message) => {
      const data = JSON.parse(message.data);
      if (data.type === "progress") {
        setProgress(data.progress);
      }
    },
  });


  return (
    <div>
      {progress && (
        <p>
          {progress.message} ({Math.round(progress.percent * 100)}%)
        </p>
      )}
    </div>
  );
}
```

Agent class names are automatically converted to kebab-case for URLs (`ResearchAgent` → `research-agent`).

## Learn more

[Agents SDK Workflows ](https://developers.cloudflare.com/agents/api-reference/run-workflows/)Complete API reference for AgentWorkflow, lifecycle callbacks, and bidirectional communication.

[Events and parameters ](https://developers.cloudflare.com/workflows/build/events-and-parameters/)Pass data to Workflows and pause for external events with waitForEvent.

[Sleeping and retrying ](https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/)Configure retry behavior and sleep patterns.

[Workers API ](https://developers.cloudflare.com/workflows/build/workers-api/)Explore the full Workflows API for programmatic control.

[Agents SDK ](https://developers.cloudflare.com/agents/)For interactive agents with real-time chat and WebSocket connections.

</page>

<page>
---
title: Build your first Workflow · Cloudflare Workflows docs
description: Workflows allow you to build durable, multi-step applications using
  the Workers platform. A Workflow can automatically retry, persist state, run
  for hours or days, and coordinate between third-party APIs.
lastUpdated: 2026-02-02T18:38:11.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/workflows/get-started/guide/
  md: https://developers.cloudflare.com/workflows/get-started/guide/index.md
---

Workflows allow you to build durable, multi-step applications using the Workers platform. A Workflow can automatically retry, persist state, run for hours or days, and coordinate between third-party APIs.

You can build Workflows to post-process file uploads to [R2 object storage](https://developers.cloudflare.com/r2/), automate generation of [Workers AI](https://developers.cloudflare.com/workers-ai/) embeddings into a [Vectorize](https://developers.cloudflare.com/vectorize/) vector database, or to trigger user lifecycle emails using [Email Service](https://developers.cloudflare.com/email-routing/).

Note

The term "Durable Execution" is widely used to describe this programming model.

"Durable" describes the ability of the program to implicitly persist state without you having to manually write to an external store or serialize program state.

In this guide, you will create and deploy a Workflow that fetches data, pauses, and processes results.

## Quick start

If you want to skip the steps and pull down the complete Workflow we are building in this guide, run:

```sh
npm create cloudflare@latest workflows-starter -- --template "cloudflare/workflows-starter"
```

Use this option if you are familiar with Cloudflare Workers or want to explore the code first and learn the details later.

Follow the steps below to learn how to build a Workflow from scratch.

## Prerequisites

1. Sign up for a [Cloudflare account](https://dash.cloudflare.com/sign-up/workers-and-pages).
2. Install [`Node.js`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

Node.js version manager

Use a Node version manager like [Volta](https://volta.sh/) or [nvm](https://github.com/nvm-sh/nvm) to avoid permission issues and change Node.js versions. [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/), discussed later in this guide, requires a Node version of `16.17.0` or later.

## 1. Create a new Worker project

1. Open a terminal and run the `create cloudflare` (C3) CLI tool to create your Worker project:

   * npm

     ```sh
     npm create cloudflare@latest -- my-workflow
     ```

   * yarn

     ```sh
     yarn create cloudflare my-workflow
     ```

   * pnpm

     ```sh
     pnpm create cloudflare@latest my-workflow
     ```

   For setup, select the following options:

   * For *What would you like to start with?*, choose `Hello World example`.
   * For *Which template would you like to use?*, choose `Worker only`.
   * For *Which language do you want to use?*, choose `TypeScript`.
   * For *Do you want to use git for version control?*, choose `Yes`.
   * For *Do you want to deploy your application?*, choose `No` (we will be making some changes before deploying).

2. Move into your new project directory:

   ```sh
   cd my-workflow
   ```

   What files did C3 create?

   In your project directory, C3 will have generated the following:

   * `wrangler.jsonc`: Your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/#sample-wrangler-configuration).
   * `src/index.ts`: A minimal Worker written in TypeScript.
   * `package.json`: A minimal Node dependencies configuration file.
   * `tsconfig.json`: TypeScript configuration.

## 2. Write your Workflow

1. Create a new file `src/workflow.ts`:

   ```ts
   import { WorkflowEntrypoint, WorkflowStep } from "cloudflare:workers";
   import type { WorkflowEvent } from "cloudflare:workers";


   type Params = { name: string };
   type IPResponse = { result: { ipv4_cidrs: string[] } };


   export class MyWorkflow extends WorkflowEntrypoint<Env, Params> {
     async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
       const data = await step.do("fetch data", async () => {
         const response = await fetch("https://api.cloudflare.com/client/v4/ips");
         return await response.json<IPResponse>();
       });


       await step.sleep("pause", "20 seconds");


       const result = await step.do(
         "process data",
         { retries: { limit: 3, delay: "5 seconds", backoff: "linear" } },
         async () => {
           return {
             name: event.payload.name,
             ipCount: data.result.ipv4_cidrs.length,
           };
         },
       );


       return result;
     }
   }
   ```

   A Workflow extends `WorkflowEntrypoint` and implements a `run` method. This code also passes in our `Params` type as a [type parameter](https://developers.cloudflare.com/workflows/build/events-and-parameters/) so that events that trigger our Workflow are typed.

   The [`step`](https://developers.cloudflare.com/workflows/build/workers-api/#step) object is the core of the Workflows API. It provides methods to define durable steps in your Workflow:

   * `step.do(name, callback)` - Executes code and persists the result. If the Workflow is interrupted or retried, it resumes from the last successful step rather than re-running completed work.
   * `step.sleep(name, duration)` - Pauses the Workflow for a duration (e.g., `"10 seconds"`, `"1 hour"`).

   You can pass a [retry configuration](https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/) to `step.do()` to customize how failures are handled. See the [full step API](https://developers.cloudflare.com/workflows/build/workers-api/#step) for additional methods like `sleepUntil` and `waitForEvent`.

   When deciding whether to break code into separate steps, ask yourself: "Do I want all of this code to run again if just one part fails?" Separate steps are ideal for operations like calling external APIs, querying databases, or reading files from storage — if a later step fails, your Workflow can retry from that point using data already fetched, avoiding redundant API calls or database queries.

   For more guidance on how to define your Workflow logic, refer to [Rules of Workflows](https://developers.cloudflare.com/workflows/build/rules-of-workflows/).

## 3. Configure your Workflow

1. Open `wrangler.jsonc`, which is your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) for your Workers project and your Workflow, and add the `workflows` configuration:

   * wrangler.jsonc

     ```jsonc
     {
       "$schema": "node_modules/wrangler/config-schema.json",
       "name": "my-workflow",
       "main": "src/index.ts",
       "compatibility_date": "2026-02-10",
       "observability": {
         "enabled": true
       },
       "workflows": [
         {
           "name": "my-workflow",
           "binding": "MY_WORKFLOW",
           "class_name": "MyWorkflow"
         }
       ]
     }
     ```

   * wrangler.toml

     ```toml
     "$schema" = "node_modules/wrangler/config-schema.json"
     name = "my-workflow"
     main = "src/index.ts"
     compatibility_date = "2026-02-10"


     [observability]
     enabled = true


     [[workflows]]
     name = "my-workflow"
     binding = "MY_WORKFLOW"
     class_name = "MyWorkflow"
     ```

   The `class_name` must match your exported class, and `binding` is the variable name you use to access the Workflow in your code (like `env.MY_WORKFLOW`).

   You can also access [bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/) (such as [KV](https://developers.cloudflare.com/kv/), [R2](https://developers.cloudflare.com/r2/), or [D1](https://developers.cloudflare.com/d1/)) via `this.env` within your Workflow. For more information on bindings within Workers, refer to [Bindings (env)](https://developers.cloudflare.com/workers/runtime-apis/bindings/).

2. Now, generate types for your bindings:

   ```sh
   npx wrangler types
   ```

   This creates a `worker-configuration.d.ts` file with the `Env` type that includes your `MY_WORKFLOW` binding.

## 4. Write your API

Now, you'll need a place to call your Workflow.

1. Replace `src/index.ts` with a [fetch handler](https://developers.cloudflare.com/workers/runtime-apis/handlers/fetch/) to start and check Workflow instances:

   ```ts
   export { MyWorkflow } from "./workflow";


   export default {
     async fetch(request: Request, env: Env): Promise<Response> {
       const url = new URL(request.url);
       const instanceId = url.searchParams.get("instanceId");


       if (instanceId) {
         const instance = await env.MY_WORKFLOW.get(instanceId);
         return Response.json(await instance.status());
       }


       const instance = await env.MY_WORKFLOW.create();
       return Response.json({ instanceId: instance.id });
     },
   } satisfies ExportedHandler<Env>;
   ```

## 5. Develop locally

1. Start a local development server:

   ```sh
   npx wrangler dev
   ```

2. To start a Workflow instance, open a new terminal window and run:

   ```sh
   curl http://localhost:8787
   ```

   An `instanceId` will be automatically generated:

   ```json
   { "instanceId": "abc-123-def" }
   ```

3. Check the status using the returned `instanceId`:

   ```sh
   curl "http://localhost:8787?instanceId=abc-123-def"
   ```

   The Workflow will progress through its steps. After about 20 seconds (the sleep duration), it will complete.

## 6. Deploy your Workflow

1. Deploy your Workflow:

   ```sh
   npx wrangler deploy
   ```

   Test in production using the same curl commands against your deployed URL. You can also [trigger a workflow instance](https://developers.cloudflare.com/workflows/build/trigger-workflows/) in production via Workers, Wrangler, or the Cloudflare dashboard.

   Once deployed, you can also inspect Workflow instances with the CLI:

   ```sh
   npx wrangler workflows instances describe my-workflow latest
   ```

   The output of `instances describe` shows:

   * The status (success, failure, running) of each step
   * Any state emitted by the step
   * Any `sleep` state, including when the Workflow will wake up
   * Retries associated with each step
   * Errors, including exception messages

## Learn more

[Events and parameters ](https://developers.cloudflare.com/workflows/build/events-and-parameters/)Pass data to Workflows and pause for external events with waitForEvent.

[Sleeping and retrying ](https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/)Configure retry behavior and sleep patterns.

[Workers API ](https://developers.cloudflare.com/workflows/build/workers-api/)Explore the full Workflows API for programmatic control.

[Rules of Workflows ](https://developers.cloudflare.com/workflows/build/rules-of-workflows/)Understand the programming model and best practices.

</page>

<page>
---
title: Metrics and analytics · Cloudflare Workflows docs
description: Workflows expose metrics that allow you to inspect and measure
  Workflow execution, error rates, steps, and total duration across each (and
  all) of your Workflows.
lastUpdated: 2025-12-03T22:57:02.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/workflows/observability/metrics-analytics/
  md: https://developers.cloudflare.com/workflows/observability/metrics-analytics/index.md
---

Workflows expose metrics that allow you to inspect and measure Workflow execution, error rates, steps, and total duration across each (and all) of your Workflows.

The metrics displayed in the [Cloudflare dashboard](https://dash.cloudflare.com/) charts are queried from Cloudflare’s [GraphQL Analytics API](https://developers.cloudflare.com/analytics/graphql-api/). You can access the metrics [programmatically](#query-via-the-graphql-api) via GraphQL or HTTP client.

## Metrics

Workflows currently export the below metrics within the `workflowsAdaptiveGroups` GraphQL dataset.

| Metric | GraphQL Field Name | Description |
| - | - | - |
| Read Queries (qps) | `readQueries` | The number of read queries issued against a database. This is the raw number of read queries, and is not used for billing. |

Metrics can be queried (and are retained) for the past 31 days.

### Labels and dimensions

The `workflowsAdaptiveGroups` dataset provides the following dimensions for filtering and grouping query results:

* `workflowName` - Workflow name - e.g. `my-workflow`
* `instanceId` - Instance ID
* `stepName` - Step name
* `eventType` - Event type (see [event types](#event-types))
* `stepCount` - Step number within a given instance
* `date` - The date when the Workflow was triggered
* `datetimeFifteenMinutes` - The date and time truncated to fifteen minutes
* `datetimeFiveMinutes` - The date and time truncated to five minutes
* `datetimeHour` - The date and time truncated to the hour
* `datetimeMinute` - The date and time truncated to the minute

### Event types

The `eventType` metric allows you to filter (or groupBy) Workflows and steps based on their last observed status.

The possible values for `eventType` are documented below:

#### Workflows-level status labels

* `WORKFLOW_QUEUED` - the Workflow is queued, but not currently running. This can happen when you are at the [concurrency limit](https://developers.cloudflare.com/workflows/reference/limits/) and new instances are waiting for currently running instances to complete.
* `WORKFLOW_START` - the Workflow has started and is running.
* `WORKFLOW_SUCCESS` - the Workflow finished without errors.
* `WORKFLOW_FAILURE` - the Workflow failed due to errors (exhausting retries, errors thrown, etc).
* `WORKFLOW_TERMINATED` - the Workflow was explicitly terminated.

#### Step-level status labels

* `STEP_START` - the step has started and is running.
* `STEP_SUCCESS` - the step finished without errors.
* `STEP_FAILURE` - the step failed due to an error.
* `SLEEP_START` - the step is sleeping.
* `SLEEP_COMPLETE` - the step last finished sleeping.
* `ATTEMPT_START` - a step is retrying.
* `ATTEMPT_SUCCESS` - the retry succeeded.
* `ATTEMPT_FAILURE` - the retry attempt failed.

## View metrics in the dashboard

Per-Workflow and instance analytics for Workflows are available in the Cloudflare dashboard. To view current and historical metrics for a database:

1. In the Cloudflare dashboard, go to the **Workflows** page.

   [Go to **Workflows**](https://dash.cloudflare.com/?to=/:account/workers/workflows)

2. Select a Workflow to view its metrics.

You can optionally select a time window to query. This defaults to the last 24 hours.

## Query via the GraphQL API

You can programmatically query analytics for your Workflows via the [GraphQL Analytics API](https://developers.cloudflare.com/analytics/graphql-api/). This API queries the same datasets as the Cloudflare dashboard, and supports GraphQL [introspection](https://developers.cloudflare.com/analytics/graphql-api/features/discovery/introspection/).

Workflows GraphQL datasets require an `accountTag` filter with your Cloudflare account ID, and includes the `workflowsAdaptiveGroups` dataset.

### Examples

To query the count (number of workflow invocations) and sum of `wallTime` for a given `$workflowName` between `$datetimeStart` and `$datetimeEnd`, grouping by `date`:

```graphql
query WorkflowInvocationsExample(
  $accountTag: string!
  $datetimeStart: Time
  $datetimeEnd: Time
  $workflowName: string
) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      wallTime: workflowsAdaptiveGroups(
        limit: 10000
        filter: {
          datetimeHour_geq: $datetimeStart
          datetimeHour_leq: $datetimeEnd
          workflowName: $workflowName
        }
        orderBy: [count_DESC]
      ) {
        count
        sum {
          wallTime
        }
        dimensions {
          date: datetimeHour
        }
      }
    }
  }
}
```

[Run in GraphQL API Explorer](https://graphql.cloudflare.com/explorer?query=I4VwpgTgngBA6gewgawGYBsEHcCSA7ANwQGMBDAFwEsE8BnAUQA9SBbAB3TAAoAoGGACSlixBCDzkAKqQDmALhi1yESnhkBCPoIAmFMFRZgAyuVIRyCyZUNaBu8vuth6ebZae2sSNJiwA5VjAFJRU1HgBKGABvLQJKMCxIaK1+YVFxclouVEp0BwgFKJg0sQlpeUESjPKYAF9ImP4mmCxSdHQrQwUvFAxsWgBBXTYqAjAAcQgxNiyU5ph0a0oLGABGAAZN9bnmnLzIQp35+0dDAAkxCAB9GTBgBTs9A2NTcyPmk+eLkGvOe50nk4XNp3k0ej5sAEuoJwX1-IFQbVQUhtJAAEJQBQAbXSEiuABF6EYAMIAXSODVBuPIoNoIBYyXm81a7U6YERoO0Tjo1DojKZTROCk+Tm+EA5TKRzSldR4tSAA\&variables=N4IghgxhD2CuB2AXAKmA5iAXCAggYTwHkBVAOWQH0BJAERABoQATMRAU0QEsBbNgZURgAToiwgATAAZxANgC00uQEZJyFZmkaAnAC0GzVhx5sAovCZipsheOWqlMjeO17GAd2hCA1gDMANtBupGC8YgBKJgAKADL4JhQA6lTIABIUfMhhVKQA4iAAvkA)

Here we are doing the same for `wallTime`, `instanceRuns` and `stepCount` in the same query:

```graphql
query WorkflowInvocationsExample2(
  $accountTag: string!
  $datetimeStart: Time
  $datetimeEnd: Time
  $workflowName: string
) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      instanceRuns: workflowsAdaptiveGroups(
        limit: 10000
        filter: {
          datetimeHour_geq: $datetimeStart
          datetimeHour_leq: $datetimeEnd
          workflowName: $workflowName
          eventType: "WORKFLOW_START"
        }
        orderBy: [count_DESC]
      ) {
        count
        dimensions {
          date: datetimeHour
        }
      }
      stepCount: workflowsAdaptiveGroups(
        limit: 10000
        filter: {
          datetimeHour_geq: $datetimeStart
          datetimeHour_leq: $datetimeEnd
          workflowName: $workflowName
          eventType: "WORKFLOW_START"
        }
        orderBy: [count_DESC]
      ) {
        count
        dimensions {
          date: datetimeHour
        }
      }
      wallTime: workflowsAdaptiveGroups(
        limit: 10000
        filter: {
          datetimeHour_geq: $datetimeStart
          datetimeHour_leq: $datetimeEnd
          workflowName: $workflowName
        }
        orderBy: [count_DESC]
      ) {
        count
        sum {
          wallTime
        }
        dimensions {
          date: datetimeHour
        }
      }
    }
  }
}
```

[Run in GraphQL API Explorer](https://graphql.cloudflare.com/explorer?query=I4VwpgTgngBA6gewgawGYBsEHcCSA7ANwQGMBDAFwEsE8BnAUQA9SBbAB3TACYAKAKBgwAJKWLEEIPOQAqpAOYAuGLXIRKeOQEIBwgCYUwVFmADK5UhHJLplYzqH7yh22Hp5d1l-axI0mLAByrGBKKmoafACUMADeOgSUYFiQsTqCouKS5LQ8qJToThBKMTAZElKyisJlWZUwAL7RcYItMOoqpHjEYABKkrRKPigY2LQAgvpsVARgAOIQEmw5aa0w6LaUVjAAjAAM+7srrXkFkMVHq47OxgASEhAA+nJgwEoOBkam5pYXrVefdxAj04rz0Hxcbl0vxaQz82CCxjesJGgWC0MEYBmFSgbBCMAARHAAPI9ADSADEADJEuAPEzSMY9aT46H1aFIXSQABCUCUAG1MlIHgARegmADCAF0Lk1oYLyNDdC46NQ6KlVpcDEp-i5ARBWRc2RqVGA2OLyltkf5xpNpnMFiAlvwNYJ1ixNko9gdoSdCucXS0dbd7k8Xm8g18LAqA4II3qHiDw+DjJD0TArfDgkjfCiEWA05iwNjcUpCSSKdTafTGcyDQGOdzeTABRaRWKpTL1S75YrlbRVbQuwGrtrk2A9XXVkbVlhSOh0DZEemc9aJqQppQZvNFssA26PTsDocA76zkOXXGQ89Qe8nJ8zFG05egQmw2C7xD3GmM6il0If3mk4ag2EA8vy8pthK0oarKAY9gGtAgCw54arO86LvmAbThqSrGCqNCDs0MYjjAz76lhhorNObL1EAA\&variables=N4IghgxhD2CuB2AXAKmA5iAXCAggYTwHkBVAOWQH0BJAERABoQATMRAU0QEsBbNgZURgAToiwgATAAZxANgC00uQEZJyFZmmYlMgFoNmrDjzYBReEzFTZC8ctXaN4rbv0B3aEIDWAMwA20V1IwXjEAJRMABQAZfBMKAHUqZAAJCj5kUKpSAHEQAF8gA)

Here lets query `workflowsAdaptive` for raw data about `$instanceId` between `$datetimeStart` and `$datetimeEnd`:

```graphql
query WorkflowsAdaptiveExample(
  $accountTag: string!
  $datetimeStart: Time
  $datetimeEnd: Time
  $instanceId: string
) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      workflowsAdaptive(
        limit: 100
        filter: {
          datetime_geq: $datetimeStart
          datetime_leq: $datetimeEnd
          instanceId: $instanceId
        }
        orderBy: [datetime_ASC]
      ) {
        datetime
        eventType
        workflowName
        instanceId
        stepCount
        wallTime
      }
    }
  }
}
```

[Run in GraphQL API Explorer](https://graphql.cloudflare.com/explorer?query=I4VwpgTgngBA6gewgawGYBsEHcDOBBAEwEMAHAFwEsA3MAUQA8iBbE9MACgCgYYASIgMYCEIAHZkAKkQDmALhg4yECqOkBCbn2JkwlJmADKZIhDLyJFfZt7bdluqILn71lYqKiBYAJJOFSlWlOAEoYAG9NKgowLEhwzR5BYTEyHHZUCnQdCHkwmCSRcSk5PgKU4pgAX1CInjqYLCQ0TFxCUkoaLnr69EsKMxgARgAGYYTujKzIXPHumFs9MAB9aTBgeRsiHUWjEzJZ7oX7JbZ1rS27fVpHA-q3Y08fP157jy9fW6rPpAJIACEoPIANpHfRLPAGADCAF0DjVPqCwJ8wDQilASEi5jxGigMNgAHLMTFY16PD5Y-xgEiQwr7ClYIjodAWKxzSrjdk8dmVIA\&variables=N4IghgxhD2CuB2AXAKmA5iAXCAggYTwHkBVAOWQH0BJAERABoQATMRAU0QEsBbNgZURgAToiwgATAAZxANgC00uQEZJyFZmmZxSgFoNmrDjzYBReEzFTZC8ctVKZG8Vt37O8AM6D4ENlQvYAEomAAoAMvgmFADqVMgAEtR0AL5AA)

#### GraphQL query variables

Example values for the query variables:

```json
{
  "accountTag": "fedfa729a5b0ecfd623bca1f9000f0a22",
  "datetimeStart": "2024-10-20T00:00:00Z",
  "datetimeEnd": "2024-10-29T00:00:00Z",
  "workflowName": "shoppingCart",
  "instanceId": "ecc48200-11c4-22a3-b05f-88a3c1c1db81"
}
```

</page>

<page>
---
title: Interact with a Workflow · Cloudflare Workflows docs
description: The Python Workers platform leverages FFI to access bindings to
  Cloudflare resources. Refer to the bindings documentation for more
  information.
lastUpdated: 2026-02-09T12:13:25.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/workflows/python/bindings/
  md: https://developers.cloudflare.com/workflows/python/bindings/index.md
---

Python Workflows are in beta, as well as the underlying platform.

You must add both `python_workflows` and `python_workers` compatibility flags to your Wrangler config file.

Also, Python Workflows requires `compatibility_date = "2025-08-01"`, or later, to be set in your Wrangler config file.

The Python Workers platform leverages [FFI](https://en.wikipedia.org/wiki/Foreign_function_interface) to access bindings to Cloudflare resources. Refer to the [bindings](https://developers.cloudflare.com/workers/languages/python/ffi/#using-bindings-from-python-workers) documentation for more information.

From the configuration perspective, enabling Python Workflows requires adding the `python_workflows` compatibility flag to your Wrangler configuration file.

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "workflows-starter",
    "main": "src/index.py",
    "compatibility_date": "2026-02-10",
    "compatibility_flags": ["python_workflows", "python_workers"],
    "workflows": [
      {
        // name of your workflow
        "name": "workflows-starter",
        // binding name env.MY_WORKFLOW
        "binding": "MY_WORKFLOW",
        // this is class that extends the Workflow class in src/index.py
        "class_name": "MyWorkflow",
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "workflows-starter"
  main = "src/index.py"
  compatibility_date = "2026-02-10"
  compatibility_flags = [ "python_workflows", "python_workers" ]


  [[workflows]]
  name = "workflows-starter"
  binding = "MY_WORKFLOW"
  class_name = "MyWorkflow"
  ```

And this is how you use the payload in your workflow:

```python
from workers import WorkflowEntrypoint


class DemoWorkflowClass(WorkflowEntrypoint):
    async def run(self, event, step):
        @step.do('step-name')
        async def first_step():
            payload = event["payload"]
            return payload
```

## Workflow

The `Workflow` binding gives you access to the [Workflow](https://developers.cloudflare.com/workflows/build/workers-api/#workflow) class. All its methods are available on the binding.

Under the hood, the `Workflow` binding is a Javascript object that is exposed to the Python script via [JsProxy](https://pyodide.org/en/stable/usage/api/python-api/ffi.html#pyodide.ffi.JsProxy). This means that the values returned by its methods are also `JsProxy` objects, and need to be converted back into Python objects using `python_from_rpc`.

### `create`

Create (trigger) a new instance of a given Workflow.

* `create(options=None)`\* `options` - an **optional** dictionary of options to pass to the workflow instance. Should contain the same keys as the [WorkflowInstanceCreateOptions](https://developers.cloudflare.com/workflows/build/workers-api/#workflowinstancecreateoptions) type.

```python
from js import Object
from pyodide.ffi import to_js
from workers import WorkerEntrypoint, Response




class Default(WorkerEntrypoint):
    async def fetch(self, request):
        event = {"foo": "bar"}
        options = to_js({"params": event}, dict_converter=Object.fromEntries)
        await self.env.MY_WORKFLOW.create(options)
        return Response.json({"status": "success"})
```

Note

Values returned from steps need to be converted into Javascript objects using `to_js`. This is why we explicitly construct the payload using `Object.fromEntries`.

The `create` method returns a [`WorkflowInstance`](https://developers.cloudflare.com/workflows/build/workers-api/#workflowinstance) object, which can be used to query the status of the workflow instance. Note that this is a Javascript object, and not a Python object.

### `create_batch`

Create (trigger) a batch of new workflow instances, up to 100 instances at a time. This is useful if you need to create multiple instances at once within the [instance creation limit](https://developers.cloudflare.com/workflows/reference/limits/).

* `create_batch(batch)`\* `batch` - list of `WorkflowInstanceCreateOptions` to pass when creating an instance, including a user-provided ID and payload parameters.

Each element of the `batch` list is expected to include both `id` and `params` properties:

```python
from pyodide.ffi import to_js
from js import Object
from workers import WorkerEntrypoint, Response


class Default(WorkerEntrypoint):
    async def fetch(self, request):
        # Create a new batch of 3 Workflow instances, each with its own ID and pass params to the Workflow instances
        listOfInstances = [
            to_js({ "id": "id-abc123", "params": { "hello": "world-0" } }, dict_converter=Object.fromEntries),
            to_js({ "id": "id-def456", "params": { "hello": "world-1" } }, dict_converter=Object.fromEntries),
            to_js({ "id": "id-ghi789", "params": { "hello": "world-2" } }, dict_converter=Object.fromEntries)
        ]
        await self.env.MY_WORKFLOW.create_batch(listOfInstances)
        return Response.json({"status": "success"})
```

### `get`

Get a workflow instance by ID.

* `get(id)`\* `id` - the ID of the workflow instance to get.

Returns a [`WorkflowInstance`](https://developers.cloudflare.com/workflows/build/workers-api/#workflowinstance) object, which can be used to query the status of the workflow instance.

```python
from workers import WorkerEntrypoint, Response


class Default(WorkerEntrypoint):
    async def fetch(self, request):
        instance = await self.env.MY_WORKFLOW.get("abc-123")


        # FFI methods available for WorkflowInstance
        await instance.status()
        await instance.pause()
        await instance.resume()
        await instance.restart()
        await instance.terminate()
        return Response.json({"status": "success"})
```

### `send_event`

Send an event to a workflow instance.

* `send_event(options)`\* `type` - the type of event to send to the workflow instance. \* `payload` - the payload to send to the workflow instance.

```python
from pyodide.ffi import to_js
from js import Object
from workers import WorkerEntrypoint, Response


class Default(WorkerEntrypoint):
    async def fetch(self, request):
        await self.env.MY_WORKFLOW.send_event(to_js({ "type": "my-event-type", "payload": { "foo": "bar" } }, dict_converter=Object.fromEntries))
        return Response.json({"status": "success"})
```

Note

Values passed to `send_event` require explicit type translation into JS objects.

## REST API (HTTP)

Refer to the [Workflows REST API documentation](https://developers.cloudflare.com/api/resources/workflows/subresources/instances/methods/create/).

## Command line (CLI)

Refer to the [CLI quick start](https://developers.cloudflare.com/workflows/get-started/guide/) to learn more about how to manage and trigger Workflows via the command-line.

</page>

<page>
---
title: DAG Workflows · Cloudflare Workflows docs
description: The Python Workflows SDK supports DAG workflows in a declarative
  way, using the step.do decorator with the depends parameter to define
  dependencies (other steps that must complete before this step can run).
lastUpdated: 2026-02-09T12:13:25.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/workflows/python/dag/
  md: https://developers.cloudflare.com/workflows/python/dag/index.md
---

The Python Workflows SDK supports DAG workflows in a declarative way, using the `step.do` decorator with the `depends` parameter to define dependencies (other steps that must complete before this step can run).

```python
from workers import Response, WorkflowEntrypoint


class PythonWorkflowStarter(WorkflowEntrypoint):
    async def run(self, event, step):
        async def await_step(fn):
            try:
                return await fn()
            except TypeError as e:
                print(f"Successfully caught {type(e).__name__}: {e}")


        await step.sleep('demo sleep', '10 seconds')


        @step.do('dependency1')
        async def dep_1():
            # does stuff
            print('executing dep1')


        @step.do('dependency2')
        async def dep_2():
            # does stuff
            print('executing dep2')


        @step.do('demo do', depends=[dep_1, dep_2], concurrent=True)
        async def final_step(res1, res2):
            # does stuff
            print('something')


        await await_step(final_step)


async def on_fetch(request, env):
    await env.MY_WORKFLOW.create()
    return Response("Hello world!")
```

On this example, `dep_1` and `dep_2` are run concurrently before execution of `final_step`, which depends on both of them.

Having `concurrent=True` allows the dependencies to be resolved concurrently. If one of the callables passed to `depends` has already completed, it will be skipped and its return value will be reused.

This pattern is useful for diamond shaped workflows, where a step depends on two or more other steps that can run concurrently.

</page>

<page>
---
title: Python Workers API · Cloudflare Workflows docs
description: This guide covers the Python Workflows SDK, with instructions on
  how to build and create workflows using Python.
lastUpdated: 2026-02-09T12:13:25.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/workflows/python/python-workers-api/
  md: https://developers.cloudflare.com/workflows/python/python-workers-api/index.md
---

This guide covers the Python Workflows SDK, with instructions on how to build and create workflows using Python.

## WorkflowEntrypoint

The `WorkflowEntrypoint` is the main entrypoint for a Python workflow. It extends the `WorkflowEntrypoint` class, and implements the `run` method.

```python
from workers import WorkflowEntrypoint


class MyWorkflow(WorkflowEntrypoint):
    async def run(self, event, step):
        # steps here
```

## WorkflowStep

* `step.do(name, depends=[], concurrent=False, config=None)` is a decorator that allows you to define a step in a workflow.

  * `name` - the name of the step.
  * `depends` - an optional list of steps that must complete before this step can run. See [DAG Workflows](https://developers.cloudflare.com/workflows/python/dag).
  * `concurrent` - an optional boolean that indicates whether this step can run concurrently with other steps.
  * `config` - an optional [`WorkflowStepConfig`](https://developers.cloudflare.com/workflows/build/workers-api/#workflowstepconfig) for configuring [step specific retry behaviour](https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/). This is passed as a Python dictionary and then type translated into a `WorkflowStepConfig` object.

```python
from workers import WorkflowEntrypoint


class MyWorkflow(WorkflowEntrypoint):
    async def run(self, event, step):
        @step.do("my first step")
        async def my_first_step():
            # do some work
            return "Hello World!"


        await my_first_step()
```

Note that the decorator doesn't make the call to the step, it just returns a callable that can be used to invoke the step. You have to call the callable to make the step run.

When returning state from a step, you must make sure that the returned value is serializable. Since steps run through an FFI layer, the returned value gets type translated via [FFI.](https://pyodide.org/en/stable/usage/api/python-api/ffi.html#pyodide.ffi.to_js) Refer to [Pyodide's documentation](https://pyodide.org/en/stable/usage/type-conversions.html#type-translations-pyproxy-to-js) regarding type conversions for more information.

* `step.sleep(name, duration)`

  * `name` - the name of the step.
  * `duration` - the duration to sleep until, in either seconds or as a `WorkflowDuration` compatible string.

```python
async def run(self, event, step):
    await step.sleep("my-sleep-step", "10 seconds")
```

* `step.sleep_until(name, timestamp)`

  * `name` - the name of the step.
  * `timestamp` - a `datetime.datetime` object or seconds from the Unix epoch to sleep the workflow instance until.

```python
import datetime


async def run(self, event, step):
    await step.sleep_until("my-sleep-step", datetime.datetime.now() + datetime.timedelta(seconds=10))
```

* `step.wait_for_event(name, event_type, timeout="24 hours")`

  * `name` - the name of the step.
  * `event_type` - the type of event to wait for.
  * `timeout` - the timeout for the `wait_for_event` call. The default timeout is 24 hours.

```python
async def run(self, event, step):
    await step.wait_for_event("my-wait-for-event-step", "my-event-type")
```

### `event` parameter

The `event` parameter is a dictionary that contains the payload passed to the workflow instance, along with other metadata:

* `payload` - the payload passed to the workflow instance.
* `timestamp` - the timestamp that the workflow was triggered.
* `instanceId` - the ID of the current workflow instance.
* `workflowName` - the name of the workflow.

## Error Handling

Workflows semantics allow users to catch exceptions that get thrown to the top level.

Catching specific exceptions within an `except` block may not work, as some Python errors will not be re-instantiated into the same type of error when they are passed through the RPC layer.

Note

Some built-in Python errors (e.g.: `ValueError`, `TypeError`) will work correctly. User defined exceptions, as well as other built-in Python errors will not and should be caught with the `Exception` class.

```python
async def run(self, event, step):
    async def try_step(fn):
        try:
            return await fn()
        except Exception as e:
            print(f"Successfully caught {type(e).__name__}: {e}")


    @step.do("my_failing")
    async def my_failing():
        print("Executing my_failing")
        raise TypeError("Intentional error in my_failing")


    await try_step(my_failing)
```

### NonRetryableError

The Python Workflows SDK provides a `NonRetryableError` class that can be used to signal that a step should not be retried.

```python
from workers.workflows import NonRetryableError


raise NonRetryableError(message)
```

## Configure a workflow instance

You can bind a step to a specific retry policy by passing a `WorkflowStepConfig` object to the `config` parameter of the `step.do` decorator. With Python Workflows, you need to make sure that your `dict` respects the [`WorkflowStepConfig`](https://developers.cloudflare.com/workflows/build/workers-api/#workflowstepconfig) type.

```python
from workers import WorkflowEntrypoint


class DemoWorkflowClass(WorkflowEntrypoint):
    async def run(self, event, step):
        @step.do('step-name', config={"retries": {"limit": 1, "delay": "10 seconds"}})
        async def first_step():
            # do some work
            pass
```

### Create an instance via binding

Note that `env` is a JavaScript object exposed to the Python script via [JsProxy](https://pyodide.org/en/stable/usage/api/python-api/ffi.html#pyodide.ffi.JsProxy). You can access the binding like you would on a JavaScript worker. Refer to the [Workflow binding documentation](https://developers.cloudflare.com/workflows/build/workers-api/#workflow) to learn more about the methods available.

Let's consider the previous binding called `MY_WORKFLOW`. Here's how you would create a new instance:

```python
from workers import Response, WorkerEntrypoint


class Default(WorkerEntrypoint):
    async def fetch(self, request):
        instance = await self.env.MY_WORKFLOW.create()
        return Response.json({"status": "success"})
```

</page>

<page>
---
title: Changelog · Cloudflare Workflows docs
description: Subscribe to RSS
lastUpdated: 2025-02-13T19:35:19.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/workflows/reference/changelog/
  md: https://developers.cloudflare.com/workflows/reference/changelog/index.md
---

[Subscribe to RSS](https://developers.cloudflare.com/workflows/reference/changelog/index.xml)

## 2025-09-12

**Test Workflows locally**

Workflows can now be tested with new test APIs available in the "cloudflare:test" module.

More information available in the Vitest integration [docs](https://developers.cloudflare.com/workers/testing/vitest-integration/test-apis/#workflows).

## 2025-08-22

**Python Workflows is now open beta**

[Python Workflows](https://developers.cloudflare.com/workflows/python/) is now in open beta, and available to any developer a free or paid Workers plan.

More information available in the [changelog](https://developers.cloudflare.com/changelog/2025-08-22-workflows-python-beta/).

## 2025-05-07

**Search for specific Workflows**

With this release, you can search Workflows by name via API.

## 2025-04-29

**Workflow deletion and more**

Workflows can now be deleted (from the Dashboard/UI or via API), and the maximum length limit for event types and instance IDs was increased to 100 characters.

Also, this release fixes a bug where a delay of `0` in step config retries would fail.

## 2025-04-07

**Workflows is now Generally Available**

Workflows is now Generally Available (or "GA").

This release includes the following new features:

* A new `waitForEvent` API that allows a Workflow to wait for an event to occur before continuing execution.
* Increased concurrency: you can run up to 4,500 Workflow instances concurrently — and this will continue to grow.
* Improved observability, including new CPU time metrics that allow you to better understand which Workflow instances are consuming the most resources and/or contributing to your bill.
* Support for vitest for testing Workflows locally and in CI/CD pipelines.

More information available in the [changelog](https://developers.cloudflare.com/changelog/2025-04-07-workflows-ga/).

## 2025-02-25

**Concurrent Workflow instances limits increased**

Workflows now supports up to 4,500 concurrent (running) instances, up from the previous limit of 100.

More information available in the [changelog](https://developers.cloudflare.com/changelog/2025-02-25-workflows-concurrency-increased/).

## 2025-02-11

**Behavior improvements**

Improved Workflows execution that prevents Workflows instances from getting stuck, and allows stuck instances to become unstuck.

Also, improved the reliability of Workflows step retry counts, and improved Instance ID validation.

## 2025-01-23

**Major bugfixes and improvements**

With this release, some bug were fixed:

* `event.timestamp` is now `Date`, fixing a regression.
* Fixed issue where instances without metadata were not terminated as expected.

Also, this release makes Workflows execution more reliable for accounts with high loads.

## 2025-01-09

**Improved Wrangler local dev experience for steps' output, matching production**

Previously, in local dev, the output field would return the list of successful steps outputs in the workflow. This is not expected behavior compared to production workflows (where the output is the actual return of the run function).

This release aligns the local dev output field behavior with the production behavior.

## 2024-12-19

**Better instance control, improved queued logic, and step limit increased**

Workflows can now be terminated and pause instances from a queued state and the ID of an instance is now exposed via the `WorkflowEvent` parameter.

Also, the mechanism to queue instances was improved to force miss-behaved queued instances to be automatically errored.

Workflows now allow you to define up to 1024 steps in a single Workflow definition, up from the previous limit of 512. This limit will continue to increase during the course of the open beta.

## 2024-12-09

**New queue instances logic**

Introduction of a new mechanism to queue instances, which will prevent instances from getting stuck on queued status forever.

## 2024-11-30

**Step limit increased**

Workflows now allow you to define up to 512 steps in a single Workflow definition, up from the previous limit of 256. This limit will continue to increase during the course of the open beta.

If you have Workflows that need more steps, we recommend delegating additional work to other Workflows by [triggering a new Workflow](https://developers.cloudflare.com/workflows/build/trigger-workflows/) from within a step and passing any state as [parameters to that Workflow instance](https://developers.cloudflare.com/workflows/build/events-and-parameters/).

## 2024-11-21

**Fixed create instance API in Workers bindings**

You can now call `create()` without any arguments when using the [Workers API](https://developers.cloudflare.com/workflows/build/workers-api/#create) for Workflows. Workflows will automatically generate the ID of the Workflow on your behalf.

This addresses a bug that caused calls to `create()` to fail when provided with no arguments.

## 2024-11-20

**Multiple Workflows in local development now supported**

Local development with `wrangler dev` now correctly supports multiple Workflow definitions per script.

There is no change to production Workflows, where multiple Workflow definitions per Worker script was already supported.

## 2024-10-23

**Workflows is now in public beta!**

Workflows, a new product for building reliable, multi-step workflows using Cloudflare Workers, is now in public beta. The public beta is available to any user with a [free or paid Workers plan](https://developers.cloudflare.com/workers/platform/pricing/).

A Workflow allows you to define multiple, independent steps that encapsulate errors, automatically retry, persist state, and can run for seconds, minutes, hours or even days. A Workflow can be useful for post-processing data from R2 buckets before querying it, automating a Workers AI RAG pipeline, or managing user signup flows and lifecycle emails.

You can learn more about Workflows in [our announcement blog](https://blog.cloudflare.com/building-workflows-durable-execution-on-workers/), or start building in our [get started guide](https://developers.cloudflare.com/workflows/get-started/guide/).

</page>

<page>
---
title: Event subscriptions · Cloudflare Workflows docs
description: Event subscriptions allow you to receive messages when events occur
  across your Cloudflare account. Cloudflare products (e.g., KV, Workers AI,
  Workers) can publish structured events to a queue, which you can then consume
  with Workers or HTTP pull consumers to build custom workflows, integrations,
  or logic.
lastUpdated: 2025-11-06T01:33:23.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/workflows/reference/event-subscriptions/
  md: https://developers.cloudflare.com/workflows/reference/event-subscriptions/index.md
---

[Event subscriptions](https://developers.cloudflare.com/queues/event-subscriptions/) allow you to receive messages when events occur across your Cloudflare account. Cloudflare products (e.g., [KV](https://developers.cloudflare.com/kv/), [Workers AI](https://developers.cloudflare.com/workers-ai/), [Workers](https://developers.cloudflare.com/workers/)) can publish structured events to a [queue](https://developers.cloudflare.com/queues/), which you can then consume with Workers or [HTTP pull consumers](https://developers.cloudflare.com/queues/configuration/pull-consumers/) to build custom workflows, integrations, or logic.

For more information on [Event Subscriptions](https://developers.cloudflare.com/queues/event-subscriptions/), refer to the [management guide](https://developers.cloudflare.com/queues/event-subscriptions/manage-event-subscriptions/).

## Available Workflows events

#### `instance.queued`

Triggered when an instance was created and is awaiting execution.

**Example:**

```json
{
  "type": "cf.workflows.workflow.instance.queued",
  "source": {
    "type": "workflows.workflow",
    "workflowName": "my-workflow"
  },
  "payload": {
    "versionId": "v1",
    "instanceId": "inst-12345678-90ab-cdef-1234-567890abcdef"
  },
  "metadata": {
    "accountId": "f9f79265f388666de8122cfb508d7776",
    "eventSubscriptionId": "1830c4bb612e43c3af7f4cada31fbf3f",
    "eventSchemaVersion": 1,
    "eventTimestamp": "2025-05-01T02:48:57.132Z"
  }
}
```

#### `instance.started`

Triggered when an instance starts or resumes execution.

**Example:**

```json
{
  "type": "cf.workflows.workflow.instance.started",
  "source": {
    "type": "workflows.workflow",
    "workflowName": "my-workflow"
  },
  "payload": {
    "versionId": "v1",
    "instanceId": "inst-12345678-90ab-cdef-1234-567890abcdef"
  },
  "metadata": {
    "accountId": "f9f79265f388666de8122cfb508d7776",
    "eventSubscriptionId": "1830c4bb612e43c3af7f4cada31fbf3f",
    "eventSchemaVersion": 1,
    "eventTimestamp": "2025-05-01T02:48:57.132Z"
  }
}
```

#### `instance.paused`

Triggered when an instance pauses execution.

**Example:**

```json
{
  "type": "cf.workflows.workflow.instance.paused",
  "source": {
    "type": "workflows.workflow",
    "workflowName": "my-workflow"
  },
  "payload": {
    "versionId": "v1",
    "instanceId": "inst-12345678-90ab-cdef-1234-567890abcdef"
  },
  "metadata": {
    "accountId": "f9f79265f388666de8122cfb508d7776",
    "eventSubscriptionId": "1830c4bb612e43c3af7f4cada31fbf3f",
    "eventSchemaVersion": 1,
    "eventTimestamp": "2025-05-01T02:48:57.132Z"
  }
}
```

#### `instance.errored`

Triggered when an instance step throws an error.

**Example:**

```json
{
  "type": "cf.workflows.workflow.instance.errored",
  "source": {
    "type": "workflows.workflow",
    "workflowName": "my-workflow"
  },
  "payload": {
    "versionId": "v1",
    "instanceId": "inst-12345678-90ab-cdef-1234-567890abcdef"
  },
  "metadata": {
    "accountId": "f9f79265f388666de8122cfb508d7776",
    "eventSubscriptionId": "1830c4bb612e43c3af7f4cada31fbf3f",
    "eventSchemaVersion": 1,
    "eventTimestamp": "2025-05-01T02:48:57.132Z"
  }
}
```

#### `instance.terminated`

Triggered when an instance is manually terminated.

**Example:**

```json
{
  "type": "cf.workflows.workflow.instance.terminated",
  "source": {
    "type": "workflows.workflow",
    "workflowName": "my-workflow"
  },
  "payload": {
    "versionId": "v1",
    "instanceId": "inst-12345678-90ab-cdef-1234-567890abcdef"
  },
  "metadata": {
    "accountId": "f9f79265f388666de8122cfb508d7776",
    "eventSubscriptionId": "1830c4bb612e43c3af7f4cada31fbf3f",
    "eventSchemaVersion": 1,
    "eventTimestamp": "2025-05-01T02:48:57.132Z"
  }
}
```

#### `instance.completed`

Triggered when an instance finishes execution successfully.

**Example:**

```json
{
  "type": "cf.workflows.workflow.instance.completed",
  "source": {
    "type": "workflows.workflow",
    "workflowName": "my-workflow"
  },
  "payload": {
    "versionId": "v1",
    "instanceId": "inst-12345678-90ab-cdef-1234-567890abcdef"
  },
  "metadata": {
    "accountId": "f9f79265f388666de8122cfb508d7776",
    "eventSubscriptionId": "1830c4bb612e43c3af7f4cada31fbf3f",
    "eventSchemaVersion": 1,
    "eventTimestamp": "2025-05-01T02:48:57.132Z"
  }
}
```

</page>

<page>
---
title: Glossary · Cloudflare Workflows docs
description: Review the definitions for terms used across Cloudflare's Workflows
  documentation.
lastUpdated: 2024-10-24T11:52:00.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/workflows/reference/glossary/
  md: https://developers.cloudflare.com/workflows/reference/glossary/index.md
---

Review the definitions for terms used across Cloudflare's Workflows documentation.

| Term | Definition |
| - | - |
| Durable Execution | "Durable Execution" is a programming model that allows applications to execute reliably, automatically persist state, retry, and be resistant to errors caused by API, network or even machine/infrastructure failures. Cloudflare Workflows provide a way to build and deploy applications that align with this model. |
| Event | The event that triggered the Workflow instance. A `WorkflowEvent` may contain optional parameters (data) that a Workflow can operate on. |
| instance | A specific instance (running, paused, errored) of a Workflow. A Workflow can have a potentially infinite number of instances. |
| step | A step is self-contained, individually retriable component of a Workflow. Steps may emit (optional) state that allows a Workflow to persist and continue from that step, even if a Workflow fails due to a network or infrastructure issue. A Workflow can have one or more steps up to the [step limit](https://developers.cloudflare.com/workflows/reference/limits/). |
| Workflow | The named Workflow definition, associated with a single Workers script. |

</page>

<page>
---
title: Limits · Cloudflare Workflows docs
description: Limits that apply to authoring, deploying, and running Workflows
  are detailed below.
lastUpdated: 2026-02-09T12:13:25.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/workflows/reference/limits/
  md: https://developers.cloudflare.com/workflows/reference/limits/index.md
---

Limits that apply to authoring, deploying, and running Workflows are detailed below.

Many limits are inherited from those applied to Workers scripts and as documented in the [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) documentation.

Note

Workflows cannot be deployed to Workers for Platforms namespaces, as Workflows do not support Workers for Platforms.

| Feature | Workers Free | Workers Paid |
| - | - | - |
| Workflow class definitions per script | 3MB max script size per [Worker size limits](https://developers.cloudflare.com/workers/platform/limits/#account-plan-limits) | 10MB max script size per [Worker size limits](https://developers.cloudflare.com/workers/platform/limits/#account-plan-limits) |
| Total scripts per account | 100 | 500 (shared with [Worker script limits](https://developers.cloudflare.com/workers/platform/limits/#account-plan-limits) |
| Compute time per step [1](#user-content-fn-3) | 10 ms | 30 seconds (default) / configurable to 5 minutes of [active CPU time](https://developers.cloudflare.com/workers/platform/limits/#cpu-time) |
| Duration (wall clock) per step [1](#user-content-fn-3) | Unlimited | Unlimited - for example, waiting on network I/O calls or querying a database |
| Maximum persisted state per step | 1MiB (2^20 bytes) | 1MiB (2^20 bytes) |
| Maximum event [payload size](https://developers.cloudflare.com/workflows/build/events-and-parameters/) | 1MiB (2^20 bytes) | 1MiB (2^20 bytes) |
| Maximum state that can be persisted per Workflow instance | 100MB | 1GB |
| Maximum `step.sleep` duration | 365 days (1 year) | 365 days (1 year) |
| Maximum steps per Workflow [2](#user-content-fn-5) | 1024 | 1024 |
| Maximum Workflow executions | 100,000 per day [shared with Workers daily limit](https://developers.cloudflare.com/workers/platform/limits/#worker-limits) | Unlimited |
| Concurrent Workflow instances (executions) per account [3](#user-content-fn-7) | 100 | 10,000 |
| Maximum Workflow instance creation rate [4](#user-content-fn-8) | 100 per second [5](#user-content-fn-6) | 100 per second [5](#user-content-fn-6) |
| Maximum number of [queued instances](https://developers.cloudflare.com/workflows/observability/metrics-analytics/#event-types) | 100,000 | 1,000,000 |
| Retention limit for completed Workflow instance state | 3 days | 30 days [6](#user-content-fn-2) |
| Maximum length of a Workflow name [7](#user-content-fn-4) | 64 characters | 64 characters |
| Maximum length of a Workflow instance ID [7](#user-content-fn-4) | 100 characters | 100 characters |
| Maximum number of subrequests per Workflow instance | 50/request | 1000/request |

Need a higher limit?

To request an adjustment to a limit, complete the [Limit Increase Request Form](https://forms.gle/ukpeZVLWLnKeixDu7). If the limit can be increased, Cloudflare will contact you with next steps.

### `waiting` instances do not count towards instance concurrency limits

Instances that are in a `waiting` state — either sleeping via `step.sleep`, waiting for a retry, or waiting for an event via `step.waitForEvent` — do **not** count towards concurrency limits. This means you can have millions of Workflow instances sleeping or waiting for events simultaneously, as only actively `running` instances count toward the 10,000 concurrent instance limit. However, if there are 10,000 concurrent instances actively running, an instance that has been in a `waiting` state will be queued instead of resuming immediately. When an instance transitions from `running` to `waiting`, other `queued` instances will be scheduled (usually the oldest queued instance, on a best-effort basis). This state transition may not occur if the wait duration is very short.

For example, consider a Workflow that does some work, waits for 30 days, and then continues with more work:

```ts
import {
  WorkflowEntrypoint,
  WorkflowStep,
  WorkflowEvent,
} from "cloudflare:workers";


type Env = {
  MY_WORKFLOW: Workflow;
};


export class MyWorkflow extends WorkflowEntrypoint<Env> {
  async run(event: WorkflowEvent<unknown>, step: WorkflowStep) {
    await step.do("initial work", async () => {
      let resp = await fetch("https://api.cloudflare.com/client/v4/ips");
      return await resp.json<any>();
    });


    await step.sleep("wait 30 days", "30 days");


    await step.do(
      "make a call to write that could maybe, just might, fail",
      {
        retries: {
          limit: 5,
          delay: "5 seconds",
          backoff: "exponential",
        },
        timeout: "15 minutes",
      },
      async () => {
        if (Math.random() > 0.5) {
          throw new Error("API call to $STORAGE_SYSTEM failed");
        }
      },
    );
  }
}
```

While a given Workflow instance is waiting for 30 days, it will transition to the `waiting` state, allowing other `queued` instances to run if concurrency limits are reached.

### Increasing Workflow CPU limits

Workflows are Worker scripts, and share the same [per invocation CPU limits](https://developers.cloudflare.com/workers/platform/limits/#worker-limits) as any Workers do. Note that CPU time is active processing time: not time spent waiting on network requests, storage calls, or other general I/O, which don't count towards your CPU time or Workflows compute consumption.

By default, the maximum CPU time per Workflow invocation is set to 30 seconds, but can be increased for all invocations associated with a Workflow definition by setting `limits.cpu_ms` in your Wrangler configuration:

* wrangler.jsonc

  ```jsonc
  {
    // ...rest of your configuration...
    "limits": {
      "cpu_ms": 300000, // 300,000 milliseconds = 5 minutes
    },
    // ...rest of your configuration...
  }
  ```

* wrangler.toml

  ```toml
  [limits]
  cpu_ms = 300_000
  ```

To learn more about CPU time and limits, [review the Workers documentation](https://developers.cloudflare.com/workers/platform/limits/#cpu-time).

## Footnotes

1. A Workflow instance can run forever, as long as each step does not take more than the CPU time limit and the maximum number of steps per Workflow is not reached. [↩](#user-content-fnref-3) [↩2](#user-content-fnref-3-2)

2. `step.sleep` do not count towards the max. steps limit [↩](#user-content-fnref-5)

3. Only instances with a `running` state count towards the concurrency limits. Instances in the `waiting` state are excluded from these limits. [↩](#user-content-fnref-7)

4. Each instance created or restarted counts towards this limit [↩](#user-content-fnref-8)

5. Workflows will return a HTTP 429 rate limited error if you exceed the rate of new Workflow instance creation. [↩](#user-content-fnref-6) [↩2](#user-content-fnref-6-2)

6. Workflow instance state and logs will be retained for 3 days on the Workers Free plan and for 30 days on the Workers Paid plan. [↩](#user-content-fnref-2)

7. Match pattern: \_`^[a-zA-Z0-9_][a-zA-Z0-9-_]\*$`\_ [↩](#user-content-fnref-4) [↩2](#user-content-fnref-4-2)

</page>

<page>
---
title: Pricing · Cloudflare Workflows docs
description: "Workflows pricing is identical to Workers Standard pricing and are
  billed on three dimensions:"
lastUpdated: 2025-04-08T09:39:12.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/workflows/reference/pricing/
  md: https://developers.cloudflare.com/workflows/reference/pricing/index.md
---

Note

Workflows is included in both the Free and Paid [Workers plans](https://developers.cloudflare.com/workers/platform/pricing/#workers).

Workflows pricing is identical to [Workers Standard pricing](https://developers.cloudflare.com/workers/platform/pricing/#workers) and are billed on three dimensions:

* **CPU time**: the total amount of compute (measured in milliseconds) consumed by a given Workflow.
* **Requests** (invocations): the number of Workflow invocations. [Subrequests](https://developers.cloudflare.com/workers/platform/limits/#subrequests) made from a Workflow do not incur additional request costs.
* **Storage**: the total amount of storage (measured in GB) persisted by your Workflows.

A Workflow that is waiting on a response to an API call, paused as a result of calling `step.sleep`, or otherwise idle, does not incur CPU time.

### Workflows Pricing

| Unit | Workers Free | Workers Paid |
| - | - | - |
| Requests (millions) | 100,000 per day ([shared with Workers requests](https://developers.cloudflare.com/workers/platform/pricing/#workers) | 10 million included per month + $0.30 per additional million |
| CPU time (ms) | 10 milliseconds of CPU time per invocation | 30 million CPU milliseconds included per month + $0.02 per additional million CPU milliseconds |
| Storage (GB-mo) | 1GB | 1GB included per month + $0.20/ GB-month |

CPU limits

You can increase the CPU limit available to your Workflow instances up to 5 minutes per Workflow by [setting the `limits.cpu_ms` property](https://developers.cloudflare.com/workers/wrangler/configuration/#limits) in your Wrangler configuration.

### Storage Usage

Note

Storage billing for Workflows will go live on September 15th, 2025.

Storage is billed using gigabyte-month (GB-month) as the billing metric, identical to [Durable Objects SQL storage](https://developers.cloudflare.com/durable-objects/platform/pricing/#sqlite-storage-backend). A GB-month is calculated by averaging the peak storage per day over a billing period (30 days).

* Storage is calculated across all instances, and includes running, errored, sleeping and completed instances.
* By default, instance state is retained for [3 days on the Free plan](https://developers.cloudflare.com/workflows/reference/limits/) and [7 days on the Paid plan](https://developers.cloudflare.com/workflows/reference/limits/).
* When creating a Workflow instance, you can set a shorter state retention period if you do not need to retain state for errored or completed Workflows.
* Deleting instances via the [Workers API](https://developers.cloudflare.com/workflows/build/workers-api/), [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/commands/#workflows), REST API, or dashboard will free up storage. Note that it may take a few minutes for storage limits to update.

An instance that attempts to store state when your have reached the storage limit on the Free plan will cause an error to be thrown.

## Frequently Asked Questions

Frequently asked questions related to Workflows pricing:

### Are there additional costs for Workflows?

No. Workflows are priced based on the same compute (CPU time), requests (invocations) as Workers, as well as storage (state from a Workflow).

### Are Workflows available on the [Workers Free](https://developers.cloudflare.com/workers/platform/pricing/#workers) plan?

Yes.

### What is a Workflow invocation?

A Workflow invocation is when you trigger a new Workflow instance: for example, via the [Workers API](https://developers.cloudflare.com/workflows/build/workers-api/), wrangler CLI, or REST API. Steps within a Workflow are not invocations.

### How do Workflows show up on my bill?

Workflows are billed as Workers, and share the same CPU time and request SKUs.

### Are there any limits to Workflows?

Refer to the published [limits](https://developers.cloudflare.com/workflows/reference/limits/) documentation.

</page>

<page>
---
title: Wrangler commands · Cloudflare Workflows docs
description: List Workflows associated to account
lastUpdated: 2025-11-14T14:44:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/workflows/reference/wrangler-commands/
  md: https://developers.cloudflare.com/workflows/reference/wrangler-commands/index.md
---

## `workflows list`

List Workflows associated to account

* npm

  ```sh
  npx wrangler workflows list
  ```

* pnpm

  ```sh
  pnpm wrangler workflows list
  ```

* yarn

  ```sh
  yarn wrangler workflows list
  ```

- `--page` number default: 1

  Show a sepecific page from the listing, can configure page size using "per-page"

- `--per-page` number

  Configure the maximum number of workflows to show per page

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

## `workflows describe`

Describe Workflow resource

* npm

  ```sh
  npx wrangler workflows describe [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler workflows describe [NAME]
  ```

* yarn

  ```sh
  yarn wrangler workflows describe [NAME]
  ```

- `[NAME]` string required

  Name of the workflow

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

## `workflows delete`

Delete workflow - when deleting a workflow, it will also delete it's own instances

* npm

  ```sh
  npx wrangler workflows delete [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler workflows delete [NAME]
  ```

* yarn

  ```sh
  yarn wrangler workflows delete [NAME]
  ```

- `[NAME]` string required

  Name of the workflow

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

## `workflows trigger`

Trigger a workflow, creating a new instance. Can optionally take a JSON string to pass a parameter into the workflow instance

* npm

  ```sh
  npx wrangler workflows trigger [NAME] [PARAMS]
  ```

* pnpm

  ```sh
  pnpm wrangler workflows trigger [NAME] [PARAMS]
  ```

* yarn

  ```sh
  yarn wrangler workflows trigger [NAME] [PARAMS]
  ```

- `[NAME]` string required

  Name of the workflow

- `[PARAMS]` string default:

  Params for the workflow instance, encoded as a JSON string

- `--id` string

  Custom instance ID, if not provided it will default to a random UUIDv4

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

## `workflows instances list`

Instance related commands (list, describe, terminate, pause, resume)

* npm

  ```sh
  npx wrangler workflows instances list [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler workflows instances list [NAME]
  ```

* yarn

  ```sh
  yarn wrangler workflows instances list [NAME]
  ```

- `[NAME]` string required

  Name of the workflow

- `--reverse` boolean default: false

  Reverse order of the instances table

- `--status` string

  Filters list by instance status (can be one of: queued, running, paused, errored, terminated, complete)

- `--page` number default: 1

  Show a sepecific page from the listing, can configure page size using "per-page"

- `--per-page` number

  Configure the maximum number of instances to show per page

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

## `workflows instances describe`

Describe a workflow instance - see its logs, retries and errors

* npm

  ```sh
  npx wrangler workflows instances describe [NAME] [ID]
  ```

* pnpm

  ```sh
  pnpm wrangler workflows instances describe [NAME] [ID]
  ```

* yarn

  ```sh
  yarn wrangler workflows instances describe [NAME] [ID]
  ```

- `[NAME]` string required

  Name of the workflow

- `[ID]` string default: latest

  ID of the instance - instead of an UUID you can type 'latest' to get the latest instance and describe it

- `--step-output` boolean default: true

  Don't output the step output since it might clutter the terminal

- `--truncate-output-limit` number default: 5000

  Truncate step output after x characters

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

## `workflows instances send-event`

Send an event to a workflow instance

* npm

  ```sh
  npx wrangler workflows instances send-event [NAME] [ID]
  ```

* pnpm

  ```sh
  pnpm wrangler workflows instances send-event [NAME] [ID]
  ```

* yarn

  ```sh
  yarn wrangler workflows instances send-event [NAME] [ID]
  ```

- `[NAME]` string required

  Name of the workflow

- `[ID]` string required

  ID of the instance - instead of an UUID you can type 'latest' to get the latest instance and send an event to it

- `--type` string required

  Type of the workflow event

- `--payload` string default: {}

  JSON string for the workflow event (e.g., '{"key": "value"}')

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

## `workflows instances terminate`

Terminate a workflow instance

* npm

  ```sh
  npx wrangler workflows instances terminate [NAME] [ID]
  ```

* pnpm

  ```sh
  pnpm wrangler workflows instances terminate [NAME] [ID]
  ```

* yarn

  ```sh
  yarn wrangler workflows instances terminate [NAME] [ID]
  ```

- `[NAME]` string required

  Name of the workflow

- `[ID]` string required

  ID of the instance - instead of an UUID you can type 'latest' to get the latest instance and describe it

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

## `workflows instances restart`

Restart a workflow instance

* npm

  ```sh
  npx wrangler workflows instances restart [NAME] [ID]
  ```

* pnpm

  ```sh
  pnpm wrangler workflows instances restart [NAME] [ID]
  ```

* yarn

  ```sh
  yarn wrangler workflows instances restart [NAME] [ID]
  ```

- `[NAME]` string required

  Name of the workflow

- `[ID]` string required

  ID of the instance - instead of an UUID you can type 'latest' to get the latest instance and describe it

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

## `workflows instances pause`

Pause a workflow instance

* npm

  ```sh
  npx wrangler workflows instances pause [NAME] [ID]
  ```

* pnpm

  ```sh
  pnpm wrangler workflows instances pause [NAME] [ID]
  ```

* yarn

  ```sh
  yarn wrangler workflows instances pause [NAME] [ID]
  ```

- `[NAME]` string required

  Name of the workflow

- `[ID]` string required

  ID of the instance - instead of an UUID you can type 'latest' to get the latest instance and pause it

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

## `workflows instances resume`

Resume a workflow instance

* npm

  ```sh
  npx wrangler workflows instances resume [NAME] [ID]
  ```

* pnpm

  ```sh
  pnpm wrangler workflows instances resume [NAME] [ID]
  ```

* yarn

  ```sh
  yarn wrangler workflows instances resume [NAME] [ID]
  ```

- `[NAME]` string required

  Name of the workflow

- `[ID]` string required

  ID of the instance - instead of an UUID you can type 'latest' to get the latest instance and resume it

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

</page>
