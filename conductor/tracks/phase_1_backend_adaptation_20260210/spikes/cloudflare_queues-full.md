<page>
---
title: Overview · Cloudflare Queues docs
description: Cloudflare Queues integrate with Cloudflare Workers and enable you
  to build applications that can guarantee delivery, offload work from a
  request, send data from Worker to Worker, and buffer or batch data.
lastUpdated: 2026-02-04T18:31:25.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/
  md: https://developers.cloudflare.com/queues/index.md
---

Send and receive messages with guaranteed delivery and no charges for egress bandwidth.

Available on Free and Paid plans

Cloudflare Queues integrate with [Cloudflare Workers](https://developers.cloudflare.com/workers/) and enable you to build applications that can [guarantee delivery](https://developers.cloudflare.com/queues/reference/delivery-guarantees/), [offload work from a request](https://developers.cloudflare.com/queues/reference/how-queues-works/), [send data from Worker to Worker](https://developers.cloudflare.com/queues/configuration/configure-queues/), and [buffer or batch data](https://developers.cloudflare.com/queues/configuration/batching-retries/).

[Get started](https://developers.cloudflare.com/queues/get-started/)

***

## Features

### Batching, Retries and Delays

Cloudflare Queues allows you to batch, retry and delay messages.

[Use Batching, Retries and Delays](https://developers.cloudflare.com/queues/configuration/batching-retries/)

### Dead Letter Queues

Redirect your messages when a delivery failure occurs.

[Use Dead Letter Queues](https://developers.cloudflare.com/queues/configuration/dead-letter-queues/)

### Pull consumers

Configure pull-based consumers to pull from a queue over HTTP from infrastructure outside of Cloudflare Workers.

[Use Pull consumers](https://developers.cloudflare.com/queues/configuration/pull-consumers/)

***

## Related products

**[R2](https://developers.cloudflare.com/r2/)**

Cloudflare R2 Storage allows developers to store large amounts of unstructured data without the costly egress bandwidth fees associated with typical cloud storage services.

**[Workers](https://developers.cloudflare.com/workers/)**

Cloudflare Workers allows developers to build serverless applications and deploy instantly across the globe for exceptional performance, reliability, and scale.

***

## More resources

[Pricing](https://developers.cloudflare.com/queues/platform/pricing/)

Learn about pricing.

[Limits](https://developers.cloudflare.com/queues/platform/limits/)

Learn about Queues limits.

[Try the Demo](https://github.com/Electroid/queues-demo#cloudflare-queues-demo)

Try Cloudflare Queues which can run on your local machine.

[@CloudflareDev](https://x.com/cloudflaredev)

Follow @CloudflareDev on Twitter to learn about product announcements, and what is new in Cloudflare Workers.

[Developer Discord](https://discord.cloudflare.com)

Connect with the Workers community on Discord to ask questions, show what you are building, and discuss the platform with other developers.

[Configuration](https://developers.cloudflare.com/queues/configuration/configure-queues/)

Learn how to configure Cloudflare Queues using Wrangler.

[JavaScript APIs](https://developers.cloudflare.com/queues/configuration/javascript-apis/)

Learn how to use JavaScript APIs to send and receive messages to a Cloudflare Queue.

[Event subscriptions](https://developers.cloudflare.com/queues/event-subscriptions/)

Learn how to configure and manage event subscriptions for your queues.

</page>

<page>
---
title: 404 - Page Not Found · Cloudflare Queues docs
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/404/
  md: https://developers.cloudflare.com/queues/404/index.md
---

# 404

Check the URL, try using our [search](https://developers.cloudflare.com/search/) or try our LLM-friendly [llms.txt directory](https://developers.cloudflare.com/llms.txt).

</page>

<page>
---
title: Configuration · Cloudflare Queues docs
lastUpdated: 2024-08-13T19:56:56.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/configuration/
  md: https://developers.cloudflare.com/queues/configuration/index.md
---

* [Configure Queues](https://developers.cloudflare.com/queues/configuration/configure-queues/)
* [Batching, Retries and Delays](https://developers.cloudflare.com/queues/configuration/batching-retries/)
* [Pause and Purge](https://developers.cloudflare.com/queues/configuration/pause-purge/)
* [Dead Letter Queues](https://developers.cloudflare.com/queues/configuration/dead-letter-queues/)
* [Pull consumers](https://developers.cloudflare.com/queues/configuration/pull-consumers/)
* [Consumer concurrency](https://developers.cloudflare.com/queues/configuration/consumer-concurrency/)
* [JavaScript APIs](https://developers.cloudflare.com/queues/configuration/javascript-apis/)
* [Local Development](https://developers.cloudflare.com/queues/configuration/local-development/)
* [R2 Event Notifications](https://developers.cloudflare.com/r2/buckets/event-notifications/)

</page>

<page>
---
title: Demos and architectures · Cloudflare Queues docs
description: Learn how you can use Queues within your existing application and architecture.
lastUpdated: 2026-01-29T15:12:58.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/demos/
  md: https://developers.cloudflare.com/queues/demos/index.md
---

Learn how you can use Queues within your existing application and architecture.

## Reference architectures

Explore the following reference architectures that use Queues:

[Fullstack applications](https://developers.cloudflare.com/reference-architecture/diagrams/serverless/fullstack-application/)

[A practical example of how these services come together in a real fullstack application architecture.](https://developers.cloudflare.com/reference-architecture/diagrams/serverless/fullstack-application/)

[Serverless ETL pipelines](https://developers.cloudflare.com/reference-architecture/diagrams/serverless/serverless-etl/)

[Cloudflare enables fully serverless ETL pipelines, significantly reducing complexity, accelerating time to production, and lowering overall costs.](https://developers.cloudflare.com/reference-architecture/diagrams/serverless/serverless-etl/)

[Retrieval Augmented Generation (RAG)](https://developers.cloudflare.com/reference-architecture/diagrams/ai/ai-rag/)

[RAG combines retrieval with generative models for better text. It uses external knowledge to create factual, relevant responses, improving coherence and accuracy in NLP tasks like chatbots.](https://developers.cloudflare.com/reference-architecture/diagrams/ai/ai-rag/)

</page>

<page>
---
title: Event subscriptions overview · Cloudflare Queues docs
description: Subscribe to events from Cloudflare services to build custom
  workflows, integrations, and logic with Workers.
lastUpdated: 2025-08-19T15:48:23.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/event-subscriptions/
  md: https://developers.cloudflare.com/queues/event-subscriptions/index.md
---

Event subscriptions allow you to receive messages when events occur across your Cloudflare account. Cloudflare products (e.g., [KV](https://developers.cloudflare.com/kv/), [Workers AI](https://developers.cloudflare.com/workers-ai), [Workers](https://developers.cloudflare.com/workers)) can publish structured events to a queue, which you can then consume with Workers or [HTTP pull consumers](https://developers.cloudflare.com/queues/configuration/pull-consumers/) to build custom workflows, integrations, or logic.

![Event subscriptions architecture](https://developers.cloudflare.com/_astro/queues-event-subscriptions.3aVidnXJ_1iozIn.webp)

## What is an event?

An event is a structured record of something happening in your Cloudflare account – like a Workers AI batch request being queued, a Worker build completing, or an R2 bucket being created. When you subscribe to these events, your queue will automatically start receiving messages when the events occur.

## Learn more

[Manage event subscriptions ](https://developers.cloudflare.com/queues/event-subscriptions/manage-event-subscriptions/)Learn how to create, configure, and manage event subscriptions for your queues.

[Events & schemas ](https://developers.cloudflare.com/queues/event-subscriptions/events-schemas/)Explore available event types and their corresponding data schemas.

</page>

<page>
---
title: Cloudflare Queues - Examples · Cloudflare Queues docs
lastUpdated: 2025-08-18T14:27:42.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/examples/
  md: https://developers.cloudflare.com/queues/examples/index.md
---

[Queues - Publish Directly via a Worker](https://developers.cloudflare.com/queues/examples/publish-to-a-queue-via-workers/)

[Publish to a Queue directly from your Worker.](https://developers.cloudflare.com/queues/examples/publish-to-a-queue-via-workers/)

[Queues - Publish Directly via HTTP](https://developers.cloudflare.com/queues/examples/publish-to-a-queue-via-http/)

[Publish to a Queue directly via HTTP and Workers.](https://developers.cloudflare.com/queues/examples/publish-to-a-queue-via-http/)

[Queues - Use Queues and Durable Objects](https://developers.cloudflare.com/queues/examples/use-queues-with-durable-objects/)

[Publish to a queue from within a Durable Object.](https://developers.cloudflare.com/queues/examples/use-queues-with-durable-objects/)

[Cloudflare Queues - Listing and acknowledging messages from the dashboard](https://developers.cloudflare.com/queues/examples/list-messages-from-dash/)

[Use the dashboard to fetch and acknowledge the messages currently in a queue.](https://developers.cloudflare.com/queues/examples/list-messages-from-dash/)

[Cloudflare Queues - Sending messages from the dashboard](https://developers.cloudflare.com/queues/examples/send-messages-from-dash/)

[Use the dashboard to send messages to a queue.](https://developers.cloudflare.com/queues/examples/send-messages-from-dash/)

[Cloudflare Queues - Queues & R2](https://developers.cloudflare.com/queues/examples/send-errors-to-r2/)

[Example of how to use Queues to batch data and store it in an R2 bucket.](https://developers.cloudflare.com/queues/examples/send-errors-to-r2/)

</page>

<page>
---
title: Getting started · Cloudflare Queues docs
description: Cloudflare Queues is a flexible messaging queue that allows you to
  queue messages for asynchronous processing. By following this guide, you will
  create your first queue, a Worker to publish messages to that queue, and a
  consumer Worker to consume messages from that queue.
lastUpdated: 2026-02-08T20:22:21.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/get-started/
  md: https://developers.cloudflare.com/queues/get-started/index.md
---

Cloudflare Queues is a flexible messaging queue that allows you to queue messages for asynchronous processing. By following this guide, you will create your first queue, a Worker to publish messages to that queue, and a consumer Worker to consume messages from that queue.

## Prerequisites

To use Queues, you will need:

1. Sign up for a [Cloudflare account](https://dash.cloudflare.com/sign-up/workers-and-pages).
2. Install [`Node.js`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

Node.js version manager

Use a Node version manager like [Volta](https://volta.sh/) or [nvm](https://github.com/nvm-sh/nvm) to avoid permission issues and change Node.js versions. [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/), discussed later in this guide, requires a Node version of `16.17.0` or later.

## 1. Create a Worker project

You will access your queue from a Worker, the producer Worker. You must create at least one producer Worker to publish messages onto your queue. If you are using [R2 Bucket Event Notifications](https://developers.cloudflare.com/r2/buckets/event-notifications/), then you do not need a producer Worker.

To create a producer Worker, run:

* npm

  ```sh
  npm create cloudflare@latest -- producer-worker
  ```

* yarn

  ```sh
  yarn create cloudflare producer-worker
  ```

* pnpm

  ```sh
  pnpm create cloudflare@latest producer-worker
  ```

For setup, select the following options:

* For *What would you like to start with?*, choose `Hello World example`.
* For *Which template would you like to use?*, choose `Worker only`.
* For *Which language do you want to use?*, choose `TypeScript`.
* For *Do you want to use git for version control?*, choose `Yes`.
* For *Do you want to deploy your application?*, choose `No` (we will be making some changes before deploying).

This will create a new directory, which will include both a `src/index.ts` Worker script, and a [`wrangler.jsonc`](https://developers.cloudflare.com/workers/wrangler/configuration/) configuration file. After you create your Worker, you will create a Queue to access.

Move into the newly created directory:

```sh
cd producer-worker
```

## 2. Create a queue

To use queues, you need to create at least one queue to publish messages to and consume messages from.

To create a queue, run:

```sh
npx wrangler queues create <MY-QUEUE-NAME>
```

Choose a name that is descriptive and relates to the types of messages you intend to use this queue for. Descriptive queue names look like: `debug-logs`, `user-clickstream-data`, or `password-reset-prod`.

Queue names must be 1 to 63 characters long. Queue names cannot contain special characters outside dashes (`-`), and must start and end with a letter or number.

You cannot change your queue name after you have set it. After you create your queue, you will set up your producer Worker to access it.

## 3. Set up your producer Worker

To expose your queue to the code inside your Worker, you need to connect your queue to your Worker by creating a binding. [Bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/) allow your Worker to access resources, such as Queues, on the Cloudflare developer platform.

To create a binding, open your newly generated `wrangler.jsonc` file and add the following:

* wrangler.jsonc

  ```jsonc
  {
    "queues": {
      "producers": [
        {
          "queue": "MY-QUEUE-NAME",
          "binding": "MY_QUEUE"
        }
      ]
    }
  }
  ```

* wrangler.toml

  ```toml
  [[queues.producers]]
  queue = "MY-QUEUE-NAME"
  binding = "MY_QUEUE"
  ```

Replace `MY-QUEUE-NAME` with the name of the queue you created in [step 2](https://developers.cloudflare.com/queues/get-started/#2-create-a-queue). Next, replace `MY_QUEUE` with the name you want for your `binding`. The binding must be a valid JavaScript variable name. This is the variable you will use to reference this queue in your Worker.

### Write your producer Worker

You will now configure your producer Worker to create messages to publish to your queue. Your producer Worker will:

1. Take a request it receives from the browser.
2. Transform the request to JSON format.
3. Write the request directly to your queue.

In your Worker project directory, open the `src` folder and add the following to your `index.ts` file:

```ts
export default {
  async fetch(request, env, ctx): Promise<Response> {
    const log = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers),
    };
    await env.<MY_QUEUE>.send(log);
    return new Response("Success!");
  },
} satisfies ExportedHandler<Env>;
```

Replace `MY_QUEUE` with the name you have set for your binding from your `wrangler.jsonc` file.

Also add the queue to `Env` interface in `index.ts`.

```ts
export interface Env {
   <MY_QUEUE>: Queue;
}
```

If this write fails, your Worker will return an error (raise an exception). If this write works, it will return `Success` back with a HTTP `200` status code to the browser.

In a production application, you would likely use a [`try...catch`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch) statement to catch the exception and handle it directly (for example, return a custom error or even retry).

### Publish your producer Worker

With your Wrangler file and `index.ts` file configured, you are ready to publish your producer Worker. To publish your producer Worker, run:

```sh
npx wrangler deploy
```

You should see output that resembles the below, with a `*.workers.dev` URL by default.

```plaintext
Uploaded <YOUR-WORKER-NAME> (0.76 sec)
Published <YOUR-WORKER-NAME> (0.29 sec)
  https://<YOUR-WORKER-NAME>.<YOUR-ACCOUNT>.workers.dev
```

Copy your `*.workers.dev` subdomain and paste it into a new browser tab. Refresh the page a few times to start publishing requests to your queue. Your browser should return the `Success` response after writing the request to the queue each time.

You have built a queue and a producer Worker to publish messages to the queue. You will now create a consumer Worker to consume the messages published to your queue. Without a consumer Worker, the messages will stay on the queue until they expire, which defaults to four (4) days.

## 4. Create your consumer Worker

A consumer Worker receives messages from your queue. When the consumer Worker receives your queue's messages, it can write them to another source, such as a logging console or storage objects.

In this guide, you will create a consumer Worker and use it to log and inspect the messages with [`wrangler tail`](https://developers.cloudflare.com/workers/wrangler/commands/#tail). You will create your consumer Worker in the same Worker project that you created your producer Worker.

Note

Queues also supports [pull-based consumers](https://developers.cloudflare.com/queues/configuration/pull-consumers/), which allows any HTTP-based client to consume messages from a queue. This guide creates a push-based consumer using Cloudflare Workers.

To create a consumer Worker, open your `index.ts` file and add the following `queue` handler to your existing `fetch` handler:

```ts
export default {
  async fetch(request, env, ctx): Promise<Response> {
    const log = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers),
    };
    await env.<MY_QUEUE>.send(log);
    return new Response("Success!");
  },
  async queue(batch, env, ctx): Promise<void> {
    for (const message of batch.messages) {
      console.log("consumed from our queue:", JSON.stringify(message.body));
    }
  },
} satisfies ExportedHandler<Env>;
```

Replace `MY_QUEUE` with the name you have set for your binding from your `wrangler.jsonc` file.

Every time messages are published to the queue, your consumer Worker's `queue` handler (`async queue`) is called and it is passed one or more messages.

In this example, your consumer Worker transforms the queue's JSON formatted message into a string and logs that output. In a real world application, your consumer Worker can be configured to write messages to object storage (such as [R2](https://developers.cloudflare.com/r2/)), write to a database (like [D1](https://developers.cloudflare.com/d1/)), further process messages before calling an external API (such as an [email API](https://developers.cloudflare.com/workers/tutorials/)) or a data warehouse with your legacy cloud provider.

When performing asynchronous tasks from within your consumer handler, use `waitUntil()` to ensure the response of the function is handled. Other asynchronous methods are not supported within the scope of this method.

### Connect the consumer Worker to your queue

After you have configured your consumer Worker, you are ready to connect it to your queue.

Each queue can only have one consumer Worker connected to it. If you try to connect multiple consumers to the same queue, you will encounter an error when attempting to publish that Worker.

To connect your queue to your consumer Worker, open your Wrangler file and add this to the bottom:

* wrangler.jsonc

  ```jsonc
  {
    "queues": {
      "consumers": [
        {
          "queue": "<MY-QUEUE-NAME>",
          // Required: this should match the name of the queue you created in step 3.
          // If you misspell the name, you will receive an error when attempting to publish your Worker.
          "max_batch_size": 10, // optional: defaults to 10
          "max_batch_timeout": 5 // optional: defaults to 5 seconds
        }
      ]
    }
  }
  ```

* wrangler.toml

  ```toml
  [[queues.consumers]]
  queue = "<MY-QUEUE-NAME>"
  max_batch_size = 10
  max_batch_timeout = 5
  ```

Replace `MY-QUEUE-NAME` with the queue you created in [step 2](https://developers.cloudflare.com/queues/get-started/#2-create-a-queue).

In your consumer Worker, you are using queues to auto batch messages using the `max_batch_size` option and the `max_batch_timeout` option. The consumer Worker will receive messages in batches of `10` or every `5` seconds, whichever happens first.

`max_batch_size` (defaults to 10) helps to reduce the amount of times your consumer Worker needs to be called. Instead of being called for every message, it will only be called after 10 messages have entered the queue.

`max_batch_timeout` (defaults to 5 seconds) helps to reduce wait time. If the producer Worker is not sending up to 10 messages to the queue for the consumer Worker to be called, the consumer Worker will be called every 5 seconds to receive messages that are waiting in the queue.

### Publish your consumer Worker

With your Wrangler file and `index.ts` file configured, publish your consumer Worker by running:

```sh
npx wrangler deploy
```

## 5. Read messages from your queue

After you set up consumer Worker, you can read messages from the queue.

Run `wrangler tail` to start waiting for our consumer to log the messages it receives:

```sh
npx wrangler tail
```

With `wrangler tail` running, open the Worker URL you opened in [step 3](https://developers.cloudflare.com/queues/get-started/#3-set-up-your-producer-worker).

You should receive a `Success` message in your browser window.

If you receive a `Success` message, refresh the URL a few times to generate messages and push them onto the queue.

With `wrangler tail` running, your consumer Worker will start logging the requests generated by refreshing.

If you refresh less than 10 times, it may take a few seconds for the messages to appear because batch timeout is configured for 10 seconds. After 10 seconds, messages should arrive in your terminal.

If you get errors when you refresh, check that the queue name you created in [step 2](https://developers.cloudflare.com/queues/get-started/#2-create-a-queue) and the queue you referenced in your Wrangler file is the same. You should ensure that your producer Worker is returning `Success` and is not returning an error.

By completing this guide, you have now created a queue, a producer Worker that publishes messages to that queue, and a consumer Worker that consumes those messages from it.

## Related resources

* Learn more about [Cloudflare Workers](https://developers.cloudflare.com/workers/) and the applications you can build on Cloudflare.

</page>

<page>
---
title: Glossary · Cloudflare Queues docs
description: Review the definitions for terms used across Cloudflare's Queues documentation.
lastUpdated: 2024-08-13T19:56:56.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/glossary/
  md: https://developers.cloudflare.com/queues/glossary/index.md
---

Review the definitions for terms used across Cloudflare's Queues documentation.

| Term | Definition |
| - | - |
| consumer | A consumer is the term for a client that is subscribing to or consuming messages from a queue. |
| producer | A producer is the term for a client that is publishing or producing messages on to a queue. |
| queue | A queue is a buffer or list that automatically scales as messages are written to it, and allows a consumer Worker to pull messages from that same queue. |

</page>

<page>
---
title: Observability · Cloudflare Queues docs
lastUpdated: 2025-02-27T10:30:11.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/queues/observability/
  md: https://developers.cloudflare.com/queues/observability/index.md
---

* [Metrics](https://developers.cloudflare.com/queues/observability/metrics/)

</page>

<page>
---
title: Platform · Cloudflare Queues docs
lastUpdated: 2025-02-27T10:30:11.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/queues/platform/
  md: https://developers.cloudflare.com/queues/platform/index.md
---

* [Pricing](https://developers.cloudflare.com/queues/platform/pricing/)
* [Limits](https://developers.cloudflare.com/queues/platform/limits/)
* [Choose a data or storage product](https://developers.cloudflare.com/workers/platform/storage-options/)
* [Changelog](https://developers.cloudflare.com/queues/platform/changelog/)
* [Audit Logs](https://developers.cloudflare.com/queues/platform/audit-logs/)

</page>

<page>
---
title: Queues REST API · Cloudflare Queues docs
lastUpdated: 2024-12-16T22:33:26.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/queues-api/
  md: https://developers.cloudflare.com/queues/queues-api/index.md
---


</page>

<page>
---
title: Reference · Cloudflare Queues docs
lastUpdated: 2025-02-27T10:30:11.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/queues/reference/
  md: https://developers.cloudflare.com/queues/reference/index.md
---

* [How Queues Works](https://developers.cloudflare.com/queues/reference/how-queues-works/)
* [Delivery guarantees](https://developers.cloudflare.com/queues/reference/delivery-guarantees/)
* [Wrangler commands](https://developers.cloudflare.com/queues/reference/wrangler-commands/)

</page>

<page>
---
title: Tutorials · Cloudflare Queues docs
lastUpdated: 2025-08-18T14:27:42.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/tutorials/
  md: https://developers.cloudflare.com/queues/tutorials/index.md
---

## Docs

| Name | Last Updated | Difficulty |
| - | - | - |
| [Use event notification to summarize PDF files on upload](https://developers.cloudflare.com/r2/tutorials/summarize-pdf/) | over 1 year ago | Intermediate |
| [Handle rate limits of external APIs](https://developers.cloudflare.com/queues/tutorials/handle-rate-limits/) | over 1 year ago | Beginner |
| [Build a web crawler with Queues and Browser Rendering](https://developers.cloudflare.com/queues/tutorials/web-crawler-with-browser-rendering/) | over 1 year ago | Intermediate |
| [Log and store upload events in R2 with event notifications](https://developers.cloudflare.com/r2/tutorials/upload-logs-event-notifications/) | almost 2 years ago | Beginner |

## Videos

Cloudflare Workflows | Introduction (Part 1 of 3)

In this video, we introduce Cloudflare Workflows, the Newest Developer Platform Primitive at Cloudflare.

Cloudflare Workflows | Batching and Monitoring Your Durable Execution (Part 2 of 3)

Workflows exposes metrics such as execution, error rates, steps, and total duration!

</page>

<page>
---
title: Batching, Retries and Delays · Cloudflare Queues docs
description: When configuring a consumer Worker for a queue, you can also define
  how messages are batched as they are delivered.
lastUpdated: 2026-02-08T20:22:21.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/configuration/batching-retries/
  md: https://developers.cloudflare.com/queues/configuration/batching-retries/index.md
---

## Batching

When configuring a [consumer Worker](https://developers.cloudflare.com/queues/reference/how-queues-works#consumers) for a queue, you can also define how messages are batched as they are delivered.

Batching can:

1. Reduce the total number of times your consumer Worker needs to be invoked (which can reduce costs).
2. Allow you to batch messages when writing to an external API or service (reducing writes).
3. Disperse load over time, especially if your producer Workers are associated with user-facing activity.

There are two ways to configure how messages are batched. You configure batching when connecting your consumer Worker to a queue.

* `max_batch_size` - The maximum size of a batch delivered to a consumer (defaults to 10 messages).
* `max_batch_timeout` - the *maximum* amount of time the queue will wait before delivering a batch to a consumer (defaults to 5 seconds)

Batch size configuration

Both `max_batch_size` and `max_batch_timeout` work together. Whichever limit is reached first will trigger the delivery of a batch.

For example, a `max_batch_size = 30` and a `max_batch_timeout = 10` means that if 30 messages are written to the queue, the consumer will receive a batch of 30 messages. However, if it takes longer than 10 seconds for those 30 messages to be written to the queue, then the consumer will get a batch of messages that contains however many messages were on the queue at the time (somewhere between 1 and 29, in this case).

Empty queues

When a queue is empty, a push-based (Worker) consumer's `queue` handler will not be invoked until there are messages to deliver. A queue does not attempt to push empty batches to a consumer and thus does not invoke unnecessary reads.

[Pull-based consumers](https://developers.cloudflare.com/queues/configuration/pull-consumers/) that attempt to pull from a queue, even when empty, will incur a read operation.

When determining what size and timeout settings to configure, you will want to consider latency (how long can you wait to receive messages?), overall batch size (when writing to external systems), and cost (fewer-but-larger batches).

### Batch settings

The following batch-level settings can be configured to adjust how Queues delivers batches to your configured consumer.

## Explicit acknowledgement and retries

You can acknowledge individual messages within a batch by explicitly acknowledging each message as it is processed. Messages that are explicitly acknowledged will not be re-delivered, even if your queue consumer fails on a subsequent message and/or fails to return successfully when processing a batch.

* Each message can be acknowledged as you process it within a batch, and avoids the entire batch from being re-delivered if your consumer throws an error during batch processing.
* Acknowledging individual messages is useful when you are calling external APIs, writing messages to a database, or otherwise performing non-idempotent (state changing) actions on individual messages.

To explicitly acknowledge a message as delivered, call the `ack()` method on the message.

* JavaScript

  ```js
  export default {
    async queue(batch, env, ctx) {
      for (const msg of batch.messages) {
        // TODO: do something with the message
        // Explicitly acknowledge the message as delivered
        msg.ack();
      }
    },
  };
  ```

* TypeScript

  ```ts
  export default {
    async queue(batch, env, ctx): Promise<void> {
      for (const msg of batch.messages) {
        // TODO: do something with the message
        // Explicitly acknowledge the message as delivered
        msg.ack();
      }
    },
  } satisfies ExportedHandler<Env>;
  ```

* Python

  ```python
  from workers import WorkerEntrypoint


  class Default(WorkerEntrypoint):
      async def queue(self, batch):
          for msg in batch.messages:
              # TODO: do something with the message
              # Explicitly acknowledge the message as delivered
              msg.ack()
  ```

You can also call `retry()` to explicitly force a message to be redelivered in a subsequent batch. This is referred to as "negative acknowledgement". This can be particularly useful when you want to process the rest of the messages in that batch without throwing an error that would force the entire batch to be redelivered.

* JavaScript

  ```js
  export default {
    async queue(batch, env, ctx) {
      for (const msg of batch.messages) {
        // TODO: do something with the message that fails
        msg.retry();
      }
    },
  };
  ```

* TypeScript

  ```ts
  export default {
    async queue(batch, env, ctx): Promise<void> {
      for (const msg of batch.messages) {
        // TODO: do something with the message that fails
        msg.retry();
      }
    },
  } satisfies ExportedHandler<Env>;
  ```

* Python

  ```python
  from workers import WorkerEntrypoint


  class Default(WorkerEntrypoint):
      async def queue(self, batch):
          for msg in batch.messages:
              # TODO: do something with the message that fails
              msg.retry()
  ```

You can also acknowledge or negatively acknowledge messages at a batch level with `ackAll()` and `retryAll()`. Calling `ackAll()` on the batch of messages (`MessageBatch`) delivered to your consumer Worker has the same behaviour as a consumer Worker that successfully returns (does not throw an error).

Note that calls to `ack()`, `retry()` and their `ackAll()` / `retryAll()` equivalents follow the below precedence rules:

* If you call `ack()` on a message, subsequent calls to `ack()` or `retry()` are silently ignored.
* If you call `retry()` on a message and then call `ack()`: the `ack()` is ignored. The first method call wins in all cases.
* If you call either `ack()` or `retry()` on a single message, and then either/any of `ackAll()` or `retryAll()` on the batch, the call on the single message takes precedence. That is, the batch-level call does not apply to that message (or messages, if multiple calls were made).

## Delivery failure

When a message is failed to be delivered, the default behaviour is to retry delivery three times before marking the delivery as failed. You can set `max_retries` (defaults to 3) when configuring your consumer, but in most cases we recommend leaving this as the default.

Messages that reach the configured maximum retries will be deleted from the queue, or if a [dead-letter queue](https://developers.cloudflare.com/queues/configuration/dead-letter-queues/) (DLQ) is configured, written to the DLQ instead.

Note

Each retry counts as an additional read operation per [Queues pricing](https://developers.cloudflare.com/queues/platform/pricing/).

When a single message within a batch fails to be delivered, the entire batch is retried, unless you have [explicitly acknowledged](#explicit-acknowledgement-and-retries) a message (or messages) within that batch. For example, if a batch of 10 messages is delivered, but the 8th message fails to be delivered, all 10 messages will be retried and thus redelivered to your consumer in full.

Retried messages and consumer concurrency

Retrying messages with `retry()` or calling `retryAll()` on a batch will **not** cause the consumer to autoscale down if consumer concurrency is enabled. Refer to [Consumer concurrency](https://developers.cloudflare.com/queues/configuration/consumer-concurrency/) to learn more.

## Delay messages

When publishing messages to a queue, or when [marking a message or batch for retry](#explicit-acknowledgement-and-retries), you can choose to delay messages from being processed for a period of time.

Delaying messages allows you to defer tasks until later, and/or respond to backpressure when consuming from a queue. For example, if an upstream API you are calling to returns a `HTTP 429: Too Many Requests`, you can delay messages to slow down how quickly you are consuming them before they are re-processed.

Messages can be delayed by up to 12 hours.

Note

Configuring delivery and retry delays via the `wrangler` CLI or when [developing locally](https://developers.cloudflare.com/queues/configuration/local-development/) requires `wrangler` version `3.38.0` or greater. Use `npx wrangler@latest` to always use the latest version of `wrangler`.

### Delay on send

To delay a message or batch of messages when sending to a queue, you can provide a `delaySeconds` parameter when sending a message.

* JavaScript

  ```js
  // Delay a singular message by 600 seconds (10 minutes)
  await env.YOUR_QUEUE.send(message, { delaySeconds: 600 });


  // Delay a batch of messages by 300 seconds (5 minutes)
  await env.YOUR_QUEUE.sendBatch(messages, { delaySeconds: 300 });


  // Do not delay this message.
  // If there is a global delay configured on the queue, ignore it.
  await env.YOUR_QUEUE.sendBatch(messages, { delaySeconds: 0 });
  ```

* TypeScript

  ```ts
  // Delay a singular message by 600 seconds (10 minutes)
  await env.YOUR_QUEUE.send(message, { delaySeconds: 600 });


  // Delay a batch of messages by 300 seconds (5 minutes)
  await env.YOUR_QUEUE.sendBatch(messages, { delaySeconds: 300 });


  // Do not delay this message.
  // If there is a global delay configured on the queue, ignore it.
  await env.YOUR_QUEUE.sendBatch(messages, { delaySeconds: 0 });
  ```

* Python

  ```python
  # Delay a singular message by 600 seconds (10 minutes)
  await env.YOUR_QUEUE.send(message, delaySeconds=600)


  # Delay a batch of messages by 300 seconds (5 minutes)
  await env.YOUR_QUEUE.sendBatch(messages, delaySeconds=300)


  # Do not delay this message.
  # If there is a global delay configured on the queue, ignore it.
  await env.YOUR_QUEUE.sendBatch(messages, delaySeconds=0)
  ```

You can also configure a default, global delay on a per-queue basis by passing `--delivery-delay-secs` when creating a queue via the `wrangler` CLI:

```sh
# Delay all messages by 5 minutes as a default
npx wrangler queues create $QUEUE-NAME --delivery-delay-secs=300
```

### Delay on retry

When [consuming messages from a queue](https://developers.cloudflare.com/queues/reference/how-queues-works/#consumers), you can choose to [explicitly mark messages to be retried](#explicit-acknowledgement-and-retries). Messages can be retried and delayed individually, or as an entire batch.

To delay an individual message within a batch:

* JavaScript

  ```js
  export default {
    async queue(batch, env, ctx) {
      for (const msg of batch.messages) {
        // Mark for retry and delay a singular message
        // by 3600 seconds (1 hour)
        msg.retry({ delaySeconds: 3600 });
      }
    },
  };
  ```

* TypeScript

  ```ts
  export default {
    async queue(batch, env, ctx): Promise<void> {
      for (const msg of batch.messages) {
        // Mark for retry and delay a singular message
        // by 3600 seconds (1 hour)
        msg.retry({ delaySeconds: 3600 });
      }
    },
  } satisfies ExportedHandler<Env>;
  ```

* Python

  ```python
  from workers import WorkerEntrypoint


  class Default(WorkerEntrypoint):
      async def queue(self, batch):
          for msg in batch.messages:
              # Mark for retry and delay a singular message
              # by 3600 seconds (1 hour)
              msg.retry(delaySeconds=3600)
  ```

To delay a batch of messages:

* JavaScript

  ```js
  export default {
    async queue(batch, env, ctx) {
      // Mark for retry and delay a batch of messages
      // by 600 seconds (10 minutes)
      batch.retryAll({ delaySeconds: 600 });
    },
  };
  ```

* TypeScript

  ```ts
  export default {
    async queue(batch, env, ctx): Promise<void> {
      // Mark for retry and delay a batch of messages
      // by 600 seconds (10 minutes)
      batch.retryAll({ delaySeconds: 600 });
    },
  } satisfies ExportedHandler<Env>;
  ```

* Python

  ```python
  from workers import WorkerEntrypoint


  class Default(WorkerEntrypoint):
      async def queue(self, batch):
          # Mark for retry and delay a batch of messages
          # by 600 seconds (10 minutes)
          batch.retryAll(delaySeconds=600)
  ```

You can also choose to set a default retry delay to any messages that are retried due to either implicit failure or when calling `retry()` explicitly. This is set at the consumer level, and is supported in both push-based (Worker) and pull-based (HTTP) consumers.

Delays can be configured via the `wrangler` CLI:

```sh
# Push-based consumers
# Delay any messages that are retried by 60 seconds (1 minute) by default.
npx wrangler@latest queues consumer worker add $QUEUE-NAME $WORKER_SCRIPT_NAME --retry-delay-secs=60


# Pull-based consumers
# Delay any messages that are retried by 60 seconds (1 minute) by default.
npx wrangler@latest queues consumer http add $QUEUE-NAME --retry-delay-secs=60
```

Delays can also be configured in the [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/#queues) with the `delivery_delay` setting for producers (when sending) and/or the `retry_delay` (when retrying) per-consumer:

* wrangler.jsonc

  ```jsonc
  {
    "queues": {
      "producers": [
        {
          "binding": "<BINDING_NAME>",
          "queue": "<QUEUE-NAME>",
          "delivery_delay": 60 // delay every message delivery by 1 minute
        }
      ],
      "consumers": [
        {
          "queue": "my-queue",
          "retry_delay": 300 // delay any retried message by 5 minutes before re-attempting delivery
        }
      ]
    }
  }
  ```

* wrangler.toml

  ```toml
  [[queues.producers]]
  binding = "<BINDING_NAME>"
  queue = "<QUEUE-NAME>"
  delivery_delay = 60


  [[queues.consumers]]
  queue = "my-queue"
  retry_delay = 300
  ```

If you use both the `wrangler` CLI and the [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) to change the settings associated with a queue or a queue consumer, the most recent configuration change will take effect.

Refer to the [Queues REST API documentation](https://developers.cloudflare.com/api/resources/queues/subresources/consumers/methods/get/) to learn how to configure message delays and retry delays programmatically.

### Message delay precedence

Messages can be delayed by default at the queue level, or per-message (or batch).

* Per-message/batch delay settings take precedence over queue-level settings.
* Setting `delaySeconds: 0` on a message when sending or retrying will ignore any queue-level delays and cause the message to be delivered in the next batch.
* A message sent or retried with `delaySeconds: <any positive integer>` to a queue with a shorter default delay will still respect the message-level setting.

### Apply a backoff algorithm

You can apply a backoff algorithm to increasingly delay messages based on the current number of attempts to deliver the message.

Each message delivered to a consumer includes an `attempts` property that tracks the number of delivery attempts made.

For example, to generate an [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff) for a message, you can create a helper function that calculates this for you:

* JavaScript

  ```js
  function calculateExponentialBackoff(attempts, baseDelaySeconds) {
    return baseDelaySeconds ** attempts;
  }
  ```

* TypeScript

  ```ts
  function calculateExponentialBackoff(
    attempts: number,
    baseDelaySeconds: number,
  ): number {
    return baseDelaySeconds ** attempts;
  }
  ```

* Python

  ```python
  def calculate_exponential_backoff(attempts, base_delay_seconds):
      return base_delay_seconds ** attempts
  ```

In your consumer, you then pass the value of `msg.attempts` and your desired delay factor as the argument to `delaySeconds` when calling `retry()` on an individual message:

* JavaScript

  ```js
  const BASE_DELAY_SECONDS = 30;


  export default {
    async queue(batch, env, ctx) {
      for (const msg of batch.messages) {
        // Mark for retry with exponential backoff
        msg.retry({
          delaySeconds: calculateExponentialBackoff(
            msg.attempts,
            BASE_DELAY_SECONDS,
          ),
        });
      }
    },
  };
  ```

* TypeScript

  ```ts
  const BASE_DELAY_SECONDS = 30;


  export default {
    async queue(batch, env, ctx): Promise<void> {
      for (const msg of batch.messages) {
        // Mark for retry with exponential backoff
        msg.retry({
          delaySeconds: calculateExponentialBackoff(
            msg.attempts,
            BASE_DELAY_SECONDS,
          ),
        });
      }
    },
  } satisfies ExportedHandler<Env>;
  ```

* Python

  ```python
  from workers import WorkerEntrypoint


  BASE_DELAY_SECONDS = 30


  class Default(WorkerEntrypoint):
      async def queue(self, batch):
          for msg in batch.messages:
              # Mark for retry and delay a singular message
              # by 3600 seconds (1 hour)
              msg.retry(
                  delaySeconds=calculate_exponential_backoff(
                      msg.attempts,
                      BASE_DELAY_SECONDS,
                  )
              )
  ```

## Related

* Review the [JavaScript API](https://developers.cloudflare.com/queues/configuration/javascript-apis/) documentation for Queues.
* Learn more about [How Queues Works](https://developers.cloudflare.com/queues/reference/how-queues-works/).
* Understand the [metrics available](https://developers.cloudflare.com/queues/observability/metrics/) for your queues, including backlog and delayed message counts.

</page>

<page>
---
title: Cloudflare Queues - Configuration · Cloudflare Queues docs
description: Cloudflare Queues can be configured using Wrangler, the
  command-line interface for Cloudflare's Developer Platform, which includes
  Workers, R2, and other developer products.
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/configuration/configure-queues/
  md: https://developers.cloudflare.com/queues/configuration/configure-queues/index.md
---

Cloudflare Queues can be configured using [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/), the command-line interface for Cloudflare's Developer Platform, which includes [Workers](https://developers.cloudflare.com/workers/), [R2](https://developers.cloudflare.com/r2/), and other developer products.

Each Producer and Consumer Worker has a [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) that specifies environment variables, triggers, and resources, such as a queue. To enable Worker-to-resource communication, you must set up a [binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/) in your Worker project's Wrangler file.

Use the options below to configure your queue.

Note

Below are options for queues, refer to the Wrangler documentation for a full reference of the [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/).

## Queue configuration

The following queue level settings can be configured using Wrangler:

```sh
npx wrangler queues update <QUEUE-NAME> --delivery-delay-secs 60 --message-retention-period-secs 3000
```

* `--delivery-delay-secs` number optional

  * How long a published message is delayed for, before it is delivered to consumers.
  * Must be between 0 and 43200 (12 hours).
  * Defaults to 0.

* `--message-retention-period-secs` number optional

  * How long messages are retained on the Queue.
  * Defaults to 345600 (4 days).
  * Must be between 60 and 1209600 (14 days)

## Producer Worker configuration

A producer is a [Cloudflare Worker](https://developers.cloudflare.com/workers/) that writes to one or more queues. A producer can accept messages over HTTP, asynchronously write messages when handling requests, and/or write to a queue from within a [Durable Object](https://developers.cloudflare.com/durable-objects/). Any Worker can write to a queue.

To produce to a queue, set up a binding in your Wrangler file. These options should be used when a Worker wants to send messages to a queue.

* wrangler.jsonc

  ```jsonc
  {
    "queues": {
      "producers": [
        {
          "queue": "my-queue",
          "binding": "MY_QUEUE"
        }
      ]
    }
  }
  ```

* wrangler.toml

  ```toml
  [[queues.producers]]
  queue = "my-queue"
  binding = "MY_QUEUE"
  ```

- `queue` string
  * The name of the queue.
- `binding` string
  * The name of the binding, which is a JavaScript variable.

## Consumer Worker Configuration

To consume messages from one or more queues, set up a binding in your Wrangler file. These options should be used when a Worker wants to receive messages from a queue.

* wrangler.jsonc

  ```jsonc
  {
    "queues": {
      "consumers": [
        {
          "queue": "my-queue",
          "max_batch_size": 10,
          "max_batch_timeout": 30,
          "max_retries": 10,
          "dead_letter_queue": "my-queue-dlq"
        }
      ]
    }
  }
  ```

* wrangler.toml

  ```toml
  [[queues.consumers]]
  queue = "my-queue"
  max_batch_size = 10
  max_batch_timeout = 30
  max_retries = 10
  dead_letter_queue = "my-queue-dlq"
  ```

Refer to [Limits](https://developers.cloudflare.com/queues/platform/limits) to review the maximum values for each of these options.

* `queue` string
  * The name of the queue.

* `max_batch_size` number optional

  * The maximum number of messages allowed in each batch.
  * Defaults to `10` messages.

* `max_batch_timeout` number optional

  * The maximum number of seconds to wait until a batch is full.
  * Defaults to `5` seconds.

* `max_retries` number optional

  * The maximum number of retries for a message, if it fails or [`retryAll()`](https://developers.cloudflare.com/queues/configuration/javascript-apis/#messagebatch) is invoked.
  * Defaults to `3` retries.

* `dead_letter_queue` string optional

  * The name of another queue to send a message if it fails processing at least `max_retries` times.
  * If a `dead_letter_queue` is not defined, messages that repeatedly fail processing will eventually be discarded.
  * If there is no queue with the specified name, it will be created automatically.

* `max_concurrency` number optional

  * The maximum number of concurrent consumers allowed to run at once. Leaving this unset will mean that the number of invocations will scale to the [currently supported maximum](https://developers.cloudflare.com/queues/platform/limits/).
  * Refer to [Consumer concurrency](https://developers.cloudflare.com/queues/configuration/consumer-concurrency/) for more information on how consumers autoscale, particularly when messages are retried.

## Pull-based

A queue can have a HTTP-based consumer that pulls from the queue. This consumer can be any HTTP-speaking service that can communicate over the Internet. Review [Pull consumers](https://developers.cloudflare.com/queues/configuration/pull-consumers/) to learn how to configure a pull-based consumer.

</page>

<page>
---
title: Consumer concurrency · Cloudflare Queues docs
description: Consumer concurrency allows a consumer Worker processing messages
  from a queue to automatically scale out horizontally to keep up with the rate
  that messages are being written to a queue.
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/configuration/consumer-concurrency/
  md: https://developers.cloudflare.com/queues/configuration/consumer-concurrency/index.md
---

Consumer concurrency allows a [consumer Worker](https://developers.cloudflare.com/queues/reference/how-queues-works/#consumers) processing messages from a queue to automatically scale out horizontally to keep up with the rate that messages are being written to a queue.

In many systems, the rate at which you write messages to a queue can easily exceed the rate at which a single consumer can read and process those same messages. This is often because your consumer might be parsing message contents, writing to storage or a database, or making third-party (upstream) API calls.

Note that queue producers are always scalable, up to the [maximum supported messages-per-second](https://developers.cloudflare.com/queues/platform/limits/) (per queue) limit.

## Enable concurrency

By default, all queues have concurrency enabled. Queue consumers will automatically scale up [to the maximum concurrent invocations](https://developers.cloudflare.com/queues/platform/limits/) as needed to manage a queue's backlog and/or error rates.

## How concurrency works

After processing a batch of messages, Queues will check to see if the number of concurrent consumers should be adjusted. The number of concurrent consumers invoked for a queue will autoscale based on several factors, including:

* The number of messages in the queue (backlog) and its rate of growth.
* The ratio of failed (versus successful) invocations. A failed invocation is when your `queue()` handler returns an uncaught exception instead of `void` (nothing).
* The value of `max_concurrency` set for that consumer.

Where possible, Queues will optimize for keeping your backlog from growing exponentially, in order to minimize scenarios where the backlog of messages in a queue grows to the point that they would reach the [message retention limit](https://developers.cloudflare.com/queues/platform/limits/) before being processed.

Consumer concurrency and retried messages

[Retrying messages with `retry()`](https://developers.cloudflare.com/queues/configuration/batching-retries/#explicit-acknowledgement-and-retries) or calling `retryAll()` on a batch will **not** count as a failed invocation.

### Example

If you are writing 100 messages/second to a queue with a single concurrent consumer that takes 5 seconds to process a batch of 100 messages, the number of messages in-flight will continue to grow at a rate faster than your consumer can keep up.

In this scenario, Queues will notice the growing backlog and will scale the number of concurrent consumer Workers invocations up to a steady-state of (approximately) five (5) until the rate of incoming messages decreases, the consumer processes messages faster, or the consumer begins to generate errors.

### Why are my consumers not autoscaling?

If your consumers are not autoscaling, there are a few likely causes:

* `max_concurrency` has been set to 1.
* Your consumer Worker is returning errors rather than processing messages. Inspect your consumer to make sure it is healthy.
* A batch of messages is being processed. Queues checks if it should autoscale consumers only after processing an entire batch of messages, so it will not autoscale while a batch is being processed. Consider reducing batch sizes or refactoring your consumer to process messages faster.

## Limit concurrency

Recommended concurrency setting

Cloudflare recommends leaving the maximum concurrency unset, which will allow your queue consumer to scale up as much as possible. Setting a fixed number means that your consumer will only ever scale up to that maximum, even as Queues increases the maximum supported invocations over time.

If you have a workflow that is limited by an upstream API and/or system, you may prefer for your backlog to grow, trading off increased overall latency in order to avoid overwhelming an upstream system.

You can configure the concurrency of your consumer Worker in two ways:

1. Set concurrency settings in the Cloudflare dashboard
2. Set concurrency settings via the [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/)

### Set concurrency settings in the Cloudflare dashboard

To configure the concurrency settings for your consumer Worker from the dashboard:

1. In the Cloudflare dashboard, go to the **Queues** page.

   [Go to **Queues**](https://dash.cloudflare.com/?to=/:account/workers/queues)

2. Select your queue > **Settings**.

3. Select **Edit Consumer** under Consumer details.

4. Set **Maximum consumer invocations** to a value between `1` and `250`. This value represents the maximum number of concurrent consumer invocations available to your queue.

To remove a fixed maximum value, select **auto (recommended)**.

Note that if you are writing messages to a queue faster than you can process them, messages may eventually reach the [maximum retention period](https://developers.cloudflare.com/queues/platform/limits/) set for that queue. Individual messages that reach that limit will expire from the queue and be deleted.

### Set concurrency settings in the [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/)

Note

Ensure you are using the latest version of [wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/). Support for configuring the maximum concurrency of a queue consumer is only supported in wrangler [`2.13.0`](https://github.com/cloudflare/workers-sdk/releases/tag/wrangler%402.13.0) or greater.

To set a fixed maximum number of concurrent consumer invocations for a given queue, configure a `max_concurrency` in your Wrangler file:

* wrangler.jsonc

  ```jsonc
  {
    "queues": {
      "consumers": [
        {
          "queue": "my-queue",
          "max_concurrency": 1
        }
      ]
    }
  }
  ```

* wrangler.toml

  ```toml
  [[queues.consumers]]
  queue = "my-queue"
  max_concurrency = 1
  ```

To remove the limit, remove the `max_concurrency` setting from the `[[queues.consumers]]` configuration for a given queue and call `npx wrangler deploy` to push your configuration update.

## Billing

When multiple consumer Workers are invoked, each Worker invocation incurs [CPU time costs](https://developers.cloudflare.com/workers/platform/pricing/#workers).

* If you intend to process all messages written to a queue, *the effective overall cost is the same*, even with concurrency enabled.
* Enabling concurrency simply brings those costs forward, and can help prevent messages from reaching the [message retention limit](https://developers.cloudflare.com/queues/platform/limits/).

Billing for consumers follows the [Workers standard usage model](https://developers.cloudflare.com/workers/platform/pricing/#example-pricing) meaning a developer is billed for the request and for CPU time used in the request.

### Example

A consumer Worker that takes 2 seconds to process a batch of messages will incur the same overall costs to process 50 million (50,000,000) messages, whether it does so concurrently (faster) or individually (slower).

</page>

<page>
---
title: Dead Letter Queues · Cloudflare Queues docs
description: A Dead Letter Queue (DLQ) is a common concept in a messaging
  system, and represents where messages are sent when a delivery failure occurs
  with a consumer after max_retries is reached. A Dead Letter Queue is like any
  other queue, and can be produced to and consumed from independently.
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/configuration/dead-letter-queues/
  md: https://developers.cloudflare.com/queues/configuration/dead-letter-queues/index.md
---

A Dead Letter Queue (DLQ) is a common concept in a messaging system, and represents where messages are sent when a delivery failure occurs with a consumer after `max_retries` is reached. A Dead Letter Queue is like any other queue, and can be produced to and consumed from independently.

With Cloudflare Queues, a Dead Letter Queue is defined within your [consumer configuration](https://developers.cloudflare.com/queues/configuration/configure-queues/). Messages are delivered to the DLQ when they reach the configured retry limit for the consumer. Without a DLQ configured, messages that reach the retry limit are deleted permanently.

For example, the following consumer configuration would send messages to our DLQ named `"my-other-queue"` after retrying delivery (by default, 3 times):

* wrangler.jsonc

  ```jsonc
  {
    "queues": {
      "consumers": [
        {
          "queue": "my-queue",
          "dead_letter_queue": "my-other-queue"
        }
      ]
    }
  }
  ```

* wrangler.toml

  ```toml
  [[queues.consumers]]
  queue = "my-queue"
  dead_letter_queue = "my-other-queue"
  ```

You can also configure a DLQ when creating a consumer from the command-line using `wrangler`:

```sh
wrangler queues consumer add $QUEUE_NAME $SCRIPT_NAME --dead-letter-queue=$NAME_OF_OTHER_QUEUE
```

To process messages placed on your DLQ, you need to [configure a consumer](https://developers.cloudflare.com/queues/configuration/configure-queues/) for that queue as you would with any other queue.

Messages delivered to a DLQ without an active consumer will persist for four (4) days before being deleted from the queue.

</page>

<page>
---
title: R2 Event Notifications · Cloudflare Queues docs
lastUpdated: 2024-08-13T19:56:56.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/configuration/event-notifications/
  md: https://developers.cloudflare.com/queues/configuration/event-notifications/index.md
---


</page>

<page>
---
title: Cloudflare Queues - JavaScript APIs · Cloudflare Queues docs
description: Cloudflare Queues is integrated with Cloudflare Workers. To send
  and receive messages, you must use a Worker.
lastUpdated: 2026-02-08T20:22:21.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/configuration/javascript-apis/
  md: https://developers.cloudflare.com/queues/configuration/javascript-apis/index.md
---

Cloudflare Queues is integrated with [Cloudflare Workers](https://developers.cloudflare.com/workers). To send and receive messages, you must use a Worker.

A Worker that can send messages to a Queue is a producer Worker, while a Worker that can receive messages from a Queue is a consumer Worker. It is possible for the same Worker to be a producer and consumer, if desired.

In the future, we expect to support other APIs, such as HTTP endpoints to send or receive messages. To report bugs or request features, go to the [Cloudflare Community Forums](https://community.cloudflare.com/c/developers/workers/40). To give feedback, go to the [`#queues`](https://discord.cloudflare.com) Discord channel.

## Producer

These APIs allow a producer Worker to send messages to a Queue.

An example of writing a single message to a Queue:

* JavaScript

  ```js
  export default {
    async fetch(req, env, ctx) {
      await env.MY_QUEUE.send({
        url: req.url,
        method: req.method,
        headers: Object.fromEntries(req.headers),
      });
      return new Response("Sent!");
    },
  };
  ```

* TypeScript

  ```ts
  interface Env {
    readonly MY_QUEUE: Queue;
  }


  export default {
    async fetch(req, env, ctx): Promise<Response> {
      await env.MY_QUEUE.send({
        url: req.url,
        method: req.method,
        headers: Object.fromEntries(req.headers),
      });
      return new Response("Sent!");
    },
  } satisfies ExportedHandler<Env>;
  ```

* Python

  ```python
  from pyodide.ffi import to_js
  from workers import Response, WorkerEntrypoint


  class Default(WorkerEntrypoint):
      async def fetch(self, request):
          await self.env.MY_QUEUE.send(to_js({
              "url": request.url,
              "method": request.method,
              "headers": dict(request.headers),
          }))
          return Response("Sent!")
  ```

The Queues API also supports writing multiple messages at once:

* JavaScript

  ```js
  const sendResultsToQueue = async (results, env) => {
    const batch = results.map((value) => ({
      body: value,
    }));
    await env.MY_QUEUE.sendBatch(batch);
  };
  ```

* TypeScript

  ```ts
  const sendResultsToQueue = async (results: Array<unknown>, env: Env) => {
    const batch: MessageSendRequest[] = results.map((value) => ({
      body: value,
    }));
    await env.MY_QUEUE.sendBatch(batch);
  };
  ```

* Python

  ```python
  from pyodide.ffi import to_js


  async def send_results_to_queue(results, env):
      batch = [
          {"body": value}
          for value in results
      ]
      await env.MY_QUEUE.sendBatch(to_js(batch))
  ```

### `Queue`

A binding that allows a producer to send messages to a Queue.

```ts
interface Queue<Body = unknown> {
  send(body: Body, options?: QueueSendOptions): Promise<void>;
  sendBatch(messages: Iterable<MessageSendRequest<Body>>, options?: QueueSendBatchOptions): Promise<void>;
}
```

* `send(bodyunknown, options?{ contentType?: QueuesContentType })` Promise\<void>

  * Sends a message to the Queue. The body can be any type supported by the [structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#supported_types), as long as its size is less than 128 KB.
  * When the promise resolves, the message is confirmed to be written to disk.

* `sendBatch(messagesIterable<MessageSendRequest<unknown>>, options?QueueSendBatchOptions)` Promise\<void>

  * Sends a batch of messages to the Queue. Each item in the provided [Iterable](https://www.typescriptlang.org/docs/handbook/iterators-and-generators.html) must be supported by the [structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#supported_types). A batch can contain up to 100 messages, though items are limited to 128 KB each, and the total size of the array cannot exceed 256 KB.
  * The optional `options` parameter can be used to apply settings (such as `delaySeconds`) to all messages in the batch. See [QueueSendBatchOptions](#queuesendbatchoptions).
  * When the promise resolves, the messages are confirmed to be written to disk.

### `MessageSendRequest`

A wrapper type used for sending message batches.

```ts
interface MessageSendRequest<Body = unknown> {
  body: Body;
  contentType?: QueueContentType;
  delaySeconds?: number;
}
```

* `body` unknown

  * The body of the message.
  * The body can be any type supported by the [structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#supported_types), as long as its size is less than 128 KB.

* `contentType` QueueContentType

  * The explicit content type of a message so it can be previewed correctly with the [List messages from the dashboard](https://developers.cloudflare.com/queues/examples/list-messages-from-dash/) feature. Optional argument.
  * See [QueuesContentType](#queuescontenttype) for possible values.

* `delaySeconds` number

  * The number of seconds to [delay a message](https://developers.cloudflare.com/queues/configuration/batching-retries/) for within the queue, before it can be delivered to a consumer.
  * Must be an integer between 0 and 43200 (12 hours).

### `QueueSendOptions`

Optional configuration that applies when sending a message to a queue.

* `contentType` QueuesContentType

  * The explicit content type of a message so it can be previewed correctly with the [List messages from the dashboard](https://developers.cloudflare.com/queues/examples/list-messages-from-dash/) feature. Optional argument.
  * As of now, this option is for internal use. In the future, `contentType` will be used by alternative consumer types to explicitly mark messages as serialized so they can be consumed in the desired type.
  * See [QueuesContentType](#queuescontenttype) for possible values.

* `delaySeconds` number

  * The number of seconds to [delay a message](https://developers.cloudflare.com/queues/configuration/batching-retries/) for within the queue, before it can be delivered to a consumer.
  * Must be an integer between 0 and 43200 (12 hours). Setting this value to zero will explicitly prevent the message from being delayed, even if there is a global (default) delay at the queue level.

### `QueueSendBatchOptions`

Optional configuration that applies when sending a batch of messages to a queue.

* `delaySeconds` number

  * The number of seconds to [delay messages](https://developers.cloudflare.com/queues/configuration/batching-retries/) for within the queue, before it can be delivered to a consumer.
  * Must be a positive integer.

### `QueuesContentType`

A union type containing valid message content types.

```ts
// Default: json
type QueuesContentType = "text" | "bytes" | "json" | "v8";
```

* Use `"json"` to send a JavaScript object that can be JSON-serialized. This content type can be previewed from the [Cloudflare dashboard](https://dash.cloudflare.com). The `json` content type is the default.
* Use `"text"` to send a `String`. This content type can be previewed with the [List messages from the dashboard](https://developers.cloudflare.com/queues/examples/list-messages-from-dash/) feature.
* Use `"bytes"` to send an `ArrayBuffer`. This content type cannot be previewed from the [Cloudflare dashboard](https://dash.cloudflare.com) and will display as Base64-encoded.
* Use `"v8"` to send a JavaScript object that cannot be JSON-serialized but is supported by [structured clone](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#supported_types) (for example `Date` and `Map`). This content type cannot be previewed from the [Cloudflare dashboard](https://dash.cloudflare.com) and will display as Base64-encoded.

Note

The default content type for Queues changed to `json` (from `v8`) to improve compatibility with pull-based consumers for any Workers with a [compatibility date](https://developers.cloudflare.com/workers/configuration/compatibility-flags/#queues-send-messages-in-json-format) after `2024-03-18`.

If you specify an invalid content type, or if your specified content type does not match the message content's type, the send operation will fail with an error.

## Consumer

These APIs allow a consumer Worker to consume messages from a Queue.

To define a consumer Worker, add a `queue()` function to the default export of the Worker. This will allow it to receive messages from the Queue.

By default, all messages in the batch will be acknowledged as soon as all of the following conditions are met:

1. The `queue()` function has returned.
2. If the `queue()` function returned a promise, the promise has resolved.
3. Any promises passed to `waitUntil()` have resolved.

If the `queue()` function throws, or the promise returned by it or any of the promises passed to `waitUntil()` were rejected, then the entire batch will be considered a failure and will be retried according to the consumer's retry settings.

Note

`waitUntil()` is the only supported method to run tasks (such as logging or metrics calls) that resolve after a queue handler has completed. Promises that have not resolved by the time the queue handler returns may not complete and will not block completion of execution.

* JavaScript

  ```js
  export default {
    async queue(batch, env, ctx) {
      for (const message of batch.messages) {
        console.log("Received", message.body);
      }
    },
  };
  ```

* TypeScript

  ```ts
  interface Env {
    // Add your bindings here
  }


  export default {
    async queue(batch, env, ctx): Promise<void> {
      for (const message of batch.messages) {
        console.log("Received", message.body);
      }
    },
  } satisfies ExportedHandler<Env>;
  ```

* Python

  ```python
  from workers import WorkerEntrypoint


  class Default(WorkerEntrypoint):
      async def queue(self, batch):
          for message in batch.messages:
              print("Received", message)
  ```

The `env` and `ctx` fields are as [documented in the Workers documentation](https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/).

Or alternatively, a queue consumer can be written using the (deprecated) service worker syntax:

```js
addEventListener('queue', (event) => {
  event.waitUntil(handleMessages(event));
});
```

In service worker syntax, `event` provides the same fields and methods as `MessageBatch`, as defined below, in addition to [`waitUntil()`](https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent/waitUntil).

Note

When performing asynchronous tasks in your queue handler that iterates through messages, use an asynchronous version of iterating through your messages. For example, `for (const m of batch.messages)`or `await Promise.all(batch.messages.map(work))` allow for waiting for the results of asynchronous calls. `batch.messages.forEach()` does not.

### `MessageBatch`

A batch of messages that are sent to a consumer Worker.

```ts
interface MessageBatch<Body = unknown> {
  readonly queue: string;
  readonly messages: readonly Message<Body>[];
  ackAll(): void;
  retryAll(options?: QueueRetryOptions): void;
}
```

* `queue` string
  * The name of the Queue that belongs to this batch.

* `messages` Message\[]
  * An array of messages in the batch. Ordering of messages is best effort -- not guaranteed to be exactly the same as the order in which they were published. If you are interested in guaranteed FIFO ordering, please [email the Queues team](mailto:queues@cloudflare.com).

* `ackAll()` void
  * Marks every message as successfully delivered, regardless of whether your `queue()` consumer handler returns successfully or not.

* `retryAll(options?: QueueRetryOptions)` void

  * Marks every message to be retried in the next batch.
  * Supports an optional `options` object.

### `Message`

A message that is sent to a consumer Worker.

```ts
interface Message<Body = unknown> {
  readonly id: string;
  readonly timestamp: Date;
  readonly body: Body;
  readonly attempts: number;
  ack(): void;
  retry(options?: QueueRetryOptions): void;
}
```

* `id` string
  * A unique, system-generated ID for the message.

* `timestamp` Date
  * A timestamp when the message was sent.

* `body` unknown

  * The body of the message.
  * The body can be any type supported by the [structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#supported_types), as long as its size is less than 128 KB.

* `attempts` number
  * The number of times the consumer has attempted to process this message. Starts at 1.

* `ack()` void
  * Marks a message as successfully delivered, regardless of whether your `queue()` consumer handler returns successfully or not.

* `retry(options?: QueueRetryOptions)` void

  * Marks a message to be retried in the next batch.
  * Supports an optional `options` object.

### `QueueRetryOptions`

Optional configuration when marking a message or a batch of messages for retry.

```ts
interface QueueRetryOptions {
  delaySeconds?: number;
}
```

* `delaySeconds` number

  * The number of seconds to [delay a message](https://developers.cloudflare.com/queues/configuration/batching-retries/) for within the queue, before it can be delivered to a consumer.
  * Must be a positive integer.

</page>

<page>
---
title: Local Development · Cloudflare Queues docs
description: Queues support local development workflows using Wrangler, the
  command-line interface for Workers. Wrangler runs the same version of Queues
  as Cloudflare runs globally.
lastUpdated: 2025-04-25T19:19:43.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/configuration/local-development/
  md: https://developers.cloudflare.com/queues/configuration/local-development/index.md
---

Queues support local development workflows using [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/), the command-line interface for Workers. Wrangler runs the same version of Queues as Cloudflare runs globally.

## Prerequisites

To develop locally with Queues, you will need:

* [Wrangler v3.1.0](https://blog.cloudflare.com/wrangler3/) or later.

* Node.js version of `18.0.0` or later. Consider using a Node version manager like [Volta](https://volta.sh/) or [nvm](https://github.com/nvm-sh/nvm) to avoid permission issues and change Node versions.

* If you are new to Queues and/or Cloudflare Workers, refer to the [Queues tutorial](https://developers.cloudflare.com/queues/get-started/) to install `wrangler` and deploy their first Queue.

## Start a local development session

Open your terminal and run the following commands to start a local development session:

```sh
npx wrangler@latest dev
```

```sh
------------------
Your Worker and resources are simulated locally via Miniflare. For more information, see: https://developers.cloudflare.com/workers/testing/local-development.


Your worker has access to the following bindings:
- Queues: <QUEUE-NAME>
```

Local development sessions create a standalone, local-only environment that mirrors the production environment Queues runs in so you can test your Workers *before* you deploy to production.

Refer to the [`wrangler dev` documentation](https://developers.cloudflare.com/workers/wrangler/commands/#dev) to learn more about how to configure a local development session.

## Separating producer & consumer Workers

Wrangler supports running multiple Workers simultaneously with a single command. If your architecture separates the producer and consumer into distinct Workers, you can use this functionality to test the entire message flow locally.

Warning

Support for running multiple Workers at once with one Wrangler command is experimental, and subject to change as we work on the experience. If you run into bugs or have any feedback, [open an issue on the workers-sdk repository](https://github.com/cloudflare/workers-sdk/issues/new)

For example, if your project has the following directory structure:

```plaintext
producer-worker/
├── wrangler.jsonc
├── index.ts
└── consumer-worker/
    ├── wrangler.jsonc
    └── index.ts
```

You can start development servers for both workers with the following command:

```sh
npx wrangler@latest dev -c wrangler.jsonc -c consumer-worker/wrangler.jsonc --persist-to .wrangler/state
```

When the producer Worker sends messages to the queue, the consumer Worker will automatically be invoked to handle them.

Note

[Consumer concurrency](https://developers.cloudflare.com/queues/configuration/consumer-concurrency/) is not supported while running locally.

## Known Issues

* Queues does not support Wrangler remote mode (`wrangler dev --remote`).

</page>

<page>
---
title: Pause and Purge · Cloudflare Queues docs
description: You can pause delivery of messages from your queue to any connected
  consumers. Pausing a queue is useful when managing downtime (for example, if
  your consumer Worker is unhealthy) without losing any messages.
lastUpdated: 2025-08-05T14:31:44.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/configuration/pause-purge/
  md: https://developers.cloudflare.com/queues/configuration/pause-purge/index.md
---

## Pause Delivery

You can pause delivery of messages from your queue to any connected consumers. Pausing a queue is useful when managing downtime (for example, if your consumer Worker is unhealthy) without losing any messages.

Queues continue to receive and store messages even while delivery is paused. Messages in a paused queue are still subject to expiry, if the messages become older than the queue message retention period.

Pausing affects both [push-based consumer Workers](https://developers.cloudflare.com/queues/reference/how-queues-works#consumers) and [pull based consumers](https://developers.cloudflare.com/queues/configuration/pull-consumers).

### Pause and resume delivery using Wrangler

The following command will pause message delivery from your queue:

```sh
$ npx wrangler queues pause-delivery <QUEUE-NAME>
```

* `queue-name` string required
  * The name of the queue for which delivery should be paused.

The following command will resume message delivery:

```sh
$ npx wrangler queues resume-delivery <QUEUE-NAME>
```

* `queue-name` string required
  * The name of the queue for which delivery should be resumed.

### What happens to HTTP Pull consumers with a paused queue?

When a queue is paused, messages cannot be pulled by an [HTTP pull based consumer](https://developers.cloudflare.com/queues/configuration/pull-consumers). Requests to pull messages will receive a `409` response, along with an error message stating `queue_delivery_paused`.

## Purge queue

Purging a queue permanently deletes any messages currently stored in the Queue. Purging is useful while developing a new application, especially to clear out any test data. It can also be useful in production to handle scenarios when a batch of bad messages have been sent to a Queue.

Note that any in flight messages, which are currently being processed by consumers, might still be processed. Messages sent to a queue during a purge operation might not be purged. Any delayed messages will also be deleted from the queue.

Warning

Purging a queue is an irreversible operation. Make sure to use this operation carefully.

### Purge queue using Wrangler

The following command will purge messages from your queue. You will be prompted to enter the queue name to confirm the operation.

```sh
$ npx wrangler queues purge <QUEUE-NAME>


This operation will permanently delete all the messages in Queue <QUEUE-NAME>. Type <QUEUE-NAME> to proceed.
```

### Does purging a Queue affect my bill?

Purging a queue counts as a single billable operation, regardless of how many messages are deleted. For example, if you purge a queue which has 100 messages, all 100 messages will be permanently deleted, and you will be billed for 1 billable operation. Refer to the [pricing](https://developers.cloudflare.com/queues/platform/pricing) page for more information about how Queues is billed.

</page>

<page>
---
title: Events & schemas · Cloudflare Queues docs
description: This page provides a comprehensive reference of available event
  sources and their corresponding events with schemas for event subscriptions.
  All events include common metadata fields and follow a consistent structure.
lastUpdated: 2025-11-07T21:41:51.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/event-subscriptions/events-schemas/
  md: https://developers.cloudflare.com/queues/event-subscriptions/events-schemas/index.md
---

This page provides a comprehensive reference of available event sources and their corresponding events with schemas for [event subscriptions](https://developers.cloudflare.com/queues/event-subscriptions/). All events include common metadata fields and follow a consistent structure.

## Sources

### Access

#### `application.created`

Triggered when an application is created.

**Example:**

```json
{
  "type": "cf.access.application.created",
  "source": {
    "type": "access"
  },
  "payload": {
    "id": "app-12345678-90ab-cdef-1234-567890abcdef",
    "name": "My Application"
  },
  "metadata": {
    "accountId": "f9f79265f388666de8122cfb508d7776",
    "eventSubscriptionId": "1830c4bb612e43c3af7f4cada31fbf3f",
    "eventSchemaVersion": 1,
    "eventTimestamp": "2025-05-01T02:48:57.132Z"
  }
}
```

#### `application.deleted`

Triggered when an application is deleted.

**Example:**

```json
{
  "type": "cf.access.application.deleted",
  "source": {
    "type": "access"
  },
  "payload": {
    "id": "app-12345678-90ab-cdef-1234-567890abcdef",
    "name": "My Application"
  },
  "metadata": {
    "accountId": "f9f79265f388666de8122cfb508d7776",
    "eventSubscriptionId": "1830c4bb612e43c3af7f4cada31fbf3f",
    "eventSchemaVersion": 1,
    "eventTimestamp": "2025-05-01T02:48:57.132Z"
  }
}
```

### R2

#### `bucket.created`

Triggered when a bucket is created.

**Example:**

```json
{
  "type": "cf.r2.bucket.created",
  "source": {
    "type": "r2"
  },
  "payload": {
    "name": "my-bucket",
    "jurisdiction": "default",
    "location": "WNAM",
    "storageClass": "Standard"
  },
  "metadata": {
    "accountId": "f9f79265f388666de8122cfb508d7776",
    "eventSubscriptionId": "1830c4bb612e43c3af7f4cada31fbf3f",
    "eventSchemaVersion": 1,
    "eventTimestamp": "2025-05-01T02:48:57.132Z"
  }
}
```

#### `bucket.deleted`

Triggered when a bucket is deleted.

**Example:**

```json
{
  "type": "cf.r2.bucket.deleted",
  "source": {
    "type": "r2"
  },
  "payload": {
    "name": "my-bucket",
    "jurisdiction": "default"
  },
  "metadata": {
    "accountId": "f9f79265f388666de8122cfb508d7776",
    "eventSubscriptionId": "1830c4bb612e43c3af7f4cada31fbf3f",
    "eventSchemaVersion": 1,
    "eventTimestamp": "2025-05-01T02:48:57.132Z"
  }
}
```

### Super Slurper

#### `job.started`

Triggered when a migration job starts.

**Example:**

```json
{
  "type": "cf.superSlurper.job.started",
  "source": {
    "type": "superSlurper"
  },
  "payload": {
    "id": "job-12345678-90ab-cdef-1234-567890abcdef",
    "createdAt": "2025-05-01T02:48:57.132Z",
    "overwrite": true,
    "pathPrefix": "migrations/",
    "source": {
      "provider": "s3",
      "bucket": "source-bucket",
      "region": "us-east-1",
      "endpoint": "s3.amazonaws.com"
    },
    "destination": {
      "provider": "r2",
      "bucket": "destination-bucket",
      "jurisdiction": "default"
    }
  },
  "metadata": {
    "accountId": "f9f79265f388666de8122cfb508d7776",
    "eventSubscriptionId": "1830c4bb612e43c3af7f4cada31fbf3f",
    "eventSchemaVersion": 1,
    "eventTimestamp": "2025-05-01T02:48:57.132Z"
  }
}
```

#### `job.paused`

Triggered when a migration job pauses.

**Example:**

```json
{
  "type": "cf.superSlurper.job.paused",
  "source": {
    "type": "superSlurper"
  },
  "payload": {
    "id": "job-12345678-90ab-cdef-1234-567890abcdef"
  },
  "metadata": {
    "accountId": "f9f79265f388666de8122cfb508d7776",
    "eventSubscriptionId": "1830c4bb612e43c3af7f4cada31fbf3f",
    "eventSchemaVersion": 1,
    "eventTimestamp": "2025-05-01T02:48:57.132Z"
  }
}
```

#### `job.resumed`

Triggered when a migration job resumes.

**Example:**

```json
{
  "type": "cf.superSlurper.job.resumed",
  "source": {
    "type": "superSlurper"
  },
  "payload": {
    "id": "job-12345678-90ab-cdef-1234-567890abcdef"
  },
  "metadata": {
    "accountId": "f9f79265f388666de8122cfb508d7776",
    "eventSubscriptionId": "1830c4bb612e43c3af7f4cada31fbf3f",
    "eventSchemaVersion": 1,
    "eventTimestamp": "2025-05-01T02:48:57.132Z"
  }
}
```

#### `job.completed`

Triggered when a migration job finishes.

**Example:**

```json
{
  "type": "cf.superSlurper.job.completed",
  "source": {
    "type": "superSlurper"
  },
  "payload": {
    "id": "job-12345678-90ab-cdef-1234-567890abcdef",
    "totalObjectsCount": 1000,
    "skippedObjectsCount": 10,
    "migratedObjectsCount": 980,
    "failedObjectsCount": 10
  },
  "metadata": {
    "accountId": "f9f79265f388666de8122cfb508d7776",
    "eventSubscriptionId": "1830c4bb612e43c3af7f4cada31fbf3f",
    "eventSchemaVersion": 1,
    "eventTimestamp": "2025-05-01T02:48:57.132Z"
  }
}
```

#### `job.aborted`

Triggered when a migration job is manually aborted.

**Example:**

```json
{
  "type": "cf.superSlurper.job.aborted",
  "source": {
    "type": "superSlurper"
  },
  "payload": {
    "id": "job-12345678-90ab-cdef-1234-567890abcdef",
    "totalObjectsCount": 1000,
    "skippedObjectsCount": 100,
    "migratedObjectsCount": 500,
    "failedObjectsCount": 50
  },
  "metadata": {
    "accountId": "f9f79265f388666de8122cfb508d7776",
    "eventSubscriptionId": "1830c4bb612e43c3af7f4cada31fbf3f",
    "eventSchemaVersion": 1,
    "eventTimestamp": "2025-05-01T02:48:57.132Z"
  }
}
```

#### `job.object.migrated`

Triggered when an object is migrated.

**Example:**

```json
{
  "type": "cf.superSlurper.job.object.migrated",
  "source": {
    "type": "superSlurper.job",
    "jobId": "job-12345678-90ab-cdef-1234-567890abcdef"
  },
  "payload": {
    "key": "migrations/file.txt"
  },
  "metadata": {
    "accountId": "f9f79265f388666de8122cfb508d7776",
    "eventSubscriptionId": "1830c4bb612e43c3af7f4cada31fbf3f",
    "eventSchemaVersion": 1,
    "eventTimestamp": "2025-05-01T02:48:57.132Z"
  }
}
```

### Vectorize

#### `index.created`

Triggered when an index is created.

**Example:**

```json
{
  "type": "cf.vectorize.index.created",
  "source": {
    "type": "vectorize"
  },
  "payload": {
    "name": "my-vector-index",
    "description": "Index for embeddings",
    "createdAt": "2025-05-01T02:48:57.132Z",
    "modifiedAt": "2025-05-01T02:48:57.132Z",
    "dimensions": 1536,
    "metric": "cosine"
  },
  "metadata": {
    "accountId": "f9f79265f388666de8122cfb508d7776",
    "eventSubscriptionId": "1830c4bb612e43c3af7f4cada31fbf3f",
    "eventSchemaVersion": 1,
    "eventTimestamp": "2025-05-01T02:48:57.132Z"
  }
}
```

#### `index.deleted`

Triggered when an index is deleted.

**Example:**

```json
{
  "type": "cf.vectorize.index.deleted",
  "source": {
    "type": "vectorize"
  },
  "payload": {
    "name": "my-vector-index"
  },
  "metadata": {
    "accountId": "f9f79265f388666de8122cfb508d7776",
    "eventSubscriptionId": "1830c4bb612e43c3af7f4cada31fbf3f",
    "eventSchemaVersion": 1,
    "eventTimestamp": "2025-05-01T02:48:57.132Z"
  }
}
```

### Workers AI

#### `batch.queued`

Triggered when a batch request is queued.

**Example:**

```json
{
  "type": "cf.workersAi.model.batch.queued",
  "source": {
    "type": "workersAi.model",
    "modelName": "@cf/baai/bge-base-en-v1.5"
  },
  "payload": {
    "requestId": "req-12345678-90ab-cdef-1234-567890abcdef"
  },
  "metadata": {
    "accountId": "f9f79265f388666de8122cfb508d7776",
    "eventSubscriptionId": "1830c4bb612e43c3af7f4cada31fbf3f",
    "eventSchemaVersion": 1,
    "eventTimestamp": "2025-05-01T02:48:57.132Z"
  }
}
```

#### `batch.succeeded`

Triggered when a batch request has completed.

**Example:**

```json
{
  "type": "cf.workersAi.model.batch.succeeded",
  "source": {
    "type": "workersAi.model",
    "modelName": "@cf/baai/bge-base-en-v1.5"
  },
  "payload": {
    "requestId": "req-12345678-90ab-cdef-1234-567890abcdef"
  },
  "metadata": {
    "accountId": "f9f79265f388666de8122cfb508d7776",
    "eventSubscriptionId": "1830c4bb612e43c3af7f4cada31fbf3f",
    "eventSchemaVersion": 1,
    "eventTimestamp": "2025-05-01T02:48:57.132Z"
  }
}
```

#### `batch.failed`

Triggered when a batch request has failed.

**Example:**

```json
{
  "type": "cf.workersAi.model.batch.failed",
  "source": {
    "type": "workersAi.model",
    "modelName": "@cf/baai/bge-base-en-v1.5"
  },
  "payload": {
    "requestId": "req-12345678-90ab-cdef-1234-567890abcdef",
    "message": "Model execution failed",
    "internalCode": 5001,
    "httpCode": 500
  },
  "metadata": {
    "accountId": "f9f79265f388666de8122cfb508d7776",
    "eventSubscriptionId": "1830c4bb612e43c3af7f4cada31fbf3f",
    "eventSchemaVersion": 1,
    "eventTimestamp": "2025-05-01T02:48:57.132Z"
  }
}
```

### Workers Builds

#### `build.started`

Triggered when a build starts.

**Example:**

```json
{
  "type": "cf.workersBuilds.worker.build.started",
  "source": {
    "type": "workersBuilds.worker",
    "workerName": "my-worker"
  },
  "payload": {
    "buildUuid": "build-12345678-90ab-cdef-1234-567890abcdef",
    "status": "running",
    "buildOutcome": null,
    "createdAt": "2025-05-01T02:48:57.132Z",
    "initializingAt": "2025-05-01T02:48:58.132Z",
    "runningAt": "2025-05-01T02:48:59.132Z",
    "stoppedAt": null,
    "buildTriggerMetadata": {
      "buildTriggerSource": "push_event",
      "branch": "main",
      "commitHash": "abc123def456",
      "commitMessage": "Fix bug in authentication",
      "author": "developer@example.com",
      "buildCommand": "npm run build",
      "deployCommand": "wrangler deploy",
      "rootDirectory": "/",
      "repoName": "my-worker-repo",
      "providerAccountName": "github-user",
      "providerType": "github"
    }
  },
  "metadata": {
    "accountId": "f9f79265f388666de8122cfb508d7776",
    "eventSubscriptionId": "1830c4bb612e43c3af7f4cada31fbf3f",
    "eventSchemaVersion": 1,
    "eventTimestamp": "2025-05-01T02:48:57.132Z"
  }
}
```

#### `build.failed`

Triggered when a build fails.

**Example:**

```json
{
  "type": "cf.workersBuilds.worker.build.failed",
  "source": {
    "type": "workersBuilds.worker",
    "workerName": "my-worker"
  },
  "payload": {
    "buildUuid": "build-12345678-90ab-cdef-1234-567890abcdef",
    "status": "failed",
    "buildOutcome": "failure",
    "createdAt": "2025-05-01T02:48:57.132Z",
    "initializingAt": "2025-05-01T02:48:58.132Z",
    "runningAt": "2025-05-01T02:48:59.132Z",
    "stoppedAt": "2025-05-01T02:50:00.132Z",
    "buildTriggerMetadata": {
      "buildTriggerSource": "push_event",
      "branch": "main",
      "commitHash": "abc123def456",
      "commitMessage": "Fix bug in authentication",
      "author": "developer@example.com",
      "buildCommand": "npm run build",
      "deployCommand": "wrangler deploy",
      "rootDirectory": "/",
      "repoName": "my-worker-repo",
      "providerAccountName": "github-user",
      "providerType": "github"
    }
  },
  "metadata": {
    "accountId": "f9f79265f388666de8122cfb508d7776",
    "eventSubscriptionId": "1830c4bb612e43c3af7f4cada31fbf3f",
    "eventSchemaVersion": 1,
    "eventTimestamp": "2025-05-01T02:48:57.132Z"
  }
}
```

#### `build.canceled`

Triggered when a build is canceled.

**Example:**

```json
{
  "type": "cf.workersBuilds.worker.build.canceled",
  "source": {
    "type": "workersBuilds.worker",
    "workerName": "my-worker"
  },
  "payload": {
    "buildUuid": "build-12345678-90ab-cdef-1234-567890abcdef",
    "status": "canceled",
    "buildOutcome": "canceled",
    "createdAt": "2025-05-01T02:48:57.132Z",
    "initializingAt": "2025-05-01T02:48:58.132Z",
    "runningAt": "2025-05-01T02:48:59.132Z",
    "stoppedAt": "2025-05-01T02:49:30.132Z",
    "buildTriggerMetadata": {
      "buildTriggerSource": "push_event",
      "branch": "main",
      "commitHash": "abc123def456",
      "commitMessage": "Fix bug in authentication",
      "author": "developer@example.com",
      "buildCommand": "npm run build",
      "deployCommand": "wrangler deploy",
      "rootDirectory": "/",
      "repoName": "my-worker-repo",
      "providerAccountName": "github-user",
      "providerType": "github"
    }
  },
  "metadata": {
    "accountId": "f9f79265f388666de8122cfb508d7776",
    "eventSubscriptionId": "1830c4bb612e43c3af7f4cada31fbf3f",
    "eventSchemaVersion": 1,
    "eventTimestamp": "2025-05-01T02:48:57.132Z"
  }
}
```

#### `build.succeeded`

Triggered when a build succeeds.

**Example:**

```json
{
  "type": "cf.workersBuilds.worker.build.succeeded",
  "source": {
    "type": "workersBuilds.worker",
    "workerName": "my-worker"
  },
  "payload": {
    "buildUuid": "build-12345678-90ab-cdef-1234-567890abcdef",
    "status": "success",
    "buildOutcome": "success",
    "createdAt": "2025-05-01T02:48:57.132Z",
    "initializingAt": "2025-05-01T02:48:58.132Z",
    "runningAt": "2025-05-01T02:48:59.132Z",
    "stoppedAt": "2025-05-01T02:50:15.132Z",
    "buildTriggerMetadata": {
      "buildTriggerSource": "push_event",
      "branch": "main",
      "commitHash": "abc123def456",
      "commitMessage": "Fix bug in authentication",
      "author": "developer@example.com",
      "buildCommand": "npm run build",
      "deployCommand": "wrangler deploy",
      "rootDirectory": "/",
      "repoName": "my-worker-repo",
      "providerAccountName": "github-user",
      "providerType": "github"
    }
  },
  "metadata": {
    "accountId": "f9f79265f388666de8122cfb508d7776",
    "eventSubscriptionId": "1830c4bb612e43c3af7f4cada31fbf3f",
    "eventSchemaVersion": 1,
    "eventTimestamp": "2025-05-01T02:48:57.132Z"
  }
}
```

### Workers KV

#### `namespace.created`

Triggered when a namespace is created.

**Example:**

```json
{
  "type": "cf.kv.namespace.created",
  "source": {
    "type": "kv"
  },
  "payload": {
    "id": "ns-12345678-90ab-cdef-1234-567890abcdef",
    "name": "my-kv-namespace"
  },
  "metadata": {
    "accountId": "f9f79265f388666de8122cfb508d7776",
    "eventSubscriptionId": "1830c4bb612e43c3af7f4cada31fbf3f",
    "eventSchemaVersion": 1,
    "eventTimestamp": "2025-05-01T02:48:57.132Z"
  }
}
```

#### `namespace.deleted`

Triggered when a namespace is deleted.

**Example:**

```json
{
  "type": "cf.kv.namespace.deleted",
  "source": {
    "type": "kv"
  },
  "payload": {
    "id": "ns-12345678-90ab-cdef-1234-567890abcdef",
    "name": "my-kv-namespace"
  },
  "metadata": {
    "accountId": "f9f79265f388666de8122cfb508d7776",
    "eventSubscriptionId": "1830c4bb612e43c3af7f4cada31fbf3f",
    "eventSchemaVersion": 1,
    "eventTimestamp": "2025-05-01T02:48:57.132Z"
  }
}
```

### Workflows

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

## Common schema fields

All events include these common fields:

| Field | Type | Description |
| - | - | - |
| `type` | string | The event type identifier |
| `source` | object | Contains source-specific information like IDs and names |
| `metadata.accountId` | string | Your Cloudflare account ID |
| `metadata.eventSubscriptionId` | string | The subscription that triggered this event |
| `metadata.eventSchemaVersion` | number | The version of the event schema |
| `metadata.eventTimestamp` | string | The ISO 8601 timestamp when the event occurred |
| `payload` | object | The event-specific data containing details about what happened |

</page>

<page>
---
title: Manage event subscriptions · Cloudflare Queues docs
description: Learn how to create, view, and delete event subscriptions for your queues.
lastUpdated: 2025-09-04T16:11:18.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/event-subscriptions/manage-event-subscriptions/
  md: https://developers.cloudflare.com/queues/event-subscriptions/manage-event-subscriptions/index.md
---

Learn how to:

* Create event subscriptions to receive messages from Cloudflare services.
* View existing subscriptions on your queues.
* Delete subscriptions you no longer need.

## Create subscription

Creating a subscription allows your queue to receive messages when events occur in Cloudflare services. You can specify which source and events you want to subscribe to.

### Dashboard

1. In the Cloudflare dashboard, go to the **Queues** page.

   [Go to **Queues**](https://dash.cloudflare.com/?to=/:account/workers/queues)

2. Select the queue you want to add a subscription to.

3. Switch to the **Subscriptions** tab.

4. Select **Subscribe to events**.

5. Name your subscription, and select the desired source and events.

6. Select **Subscribe**.

### Wrangler CLI

To create a subscription using Wrangler, run the [`queues subscription create command`](https://developers.cloudflare.com/queues/reference/wrangler-commands/#queues-subscription-create):

```bash
npx wrangler queues subscription create <queue-name> --source <source-type> --events <event1,event2> --<source-specific-option> <value>
```

To learn more about which sources and events you can subscribe to, refer to [Events & schemas](https://developers.cloudflare.com/queues/event-subscriptions/events-schemas/).

## View existing subscriptions

You can view all subscriptions configured for a queue to see what events it is currently receiving.

### Dashboard

1. In the Cloudflare dashboard, go to the **Queues** page.

   [Go to **Queues**](https://dash.cloudflare.com/?to=/:account/workers/queues)

2. Select the queue you want to view subscriptions for.

3. Switch to the **Subscriptions** tab.

### Wrangler CLI

To list subscriptions for a queue, run the [`queues subscription list command`](https://developers.cloudflare.com/queues/reference/wrangler-commands/#queues-subscription-list):

```bash
npx wrangler queues subscription list <queue-name>
```

## Delete subscription

When you delete a subscription, your queue will stop receiving messages for those events immediately.

### Dashboard

1. In the Cloudflare dashboard, go to the **Queues** page.

   [Go to **Queues**](https://dash.cloudflare.com/?to=/:account/workers/queues)

2. Select the queue containing the subscription you want to delete.

3. Switch to the **Subscriptions** tab.

4. Select **...** for the subscription you want to delete.

5. Select **Delete subscription**.

### Wrangler CLI

To delete a subscription, run the [`queues subscription delete command`](https://developers.cloudflare.com/queues/reference/wrangler-commands/#queues-subscription-delete):

```bash
npx wrangler queues subscription delete <queue-name> --id <subscription-id>
```

## Learn more

[Events & schemas ](https://developers.cloudflare.com/queues/event-subscriptions/events-schemas/)Explore available event sources and types that you can subscribe to.

</page>

<page>
---
title: Cloudflare Queues - Listing and acknowledging messages from the dashboard
  · Cloudflare Queues docs
description: Use the dashboard to fetch and acknowledge the messages currently in a queue.
lastUpdated: 2026-01-27T21:11:25.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/examples/list-messages-from-dash/
  md: https://developers.cloudflare.com/queues/examples/list-messages-from-dash/index.md
---

## List messages from the dashboard

Listing messages from the dashboard allows you to debug Queues or queue producers without a consumer Worker. Fetching a batch of messages to preview will not acknowledge or retry the message or affect its position in the queue. The queue can still be consumed normally by a consumer Worker.

To list messages in the dashboard:

1. In the Cloudflare dashboard, go to the **Queues** page.

   [Go to **Queues**](https://dash.cloudflare.com/?to=/:account/workers/queues)

2. Select the queue to preview messages from.

3. Select the **Messages** tab.

4. Select **List**.

5. When the list of messages loads, select the blue arrow to the right of each row to expand the message preview.

This will preview a batch of messages currently in the Queue.

## Acknowledge messages from the dashboard

Acknowledging messages from the [Cloudflare dashboard](https://dash.cloudflare.com) will permanently remove them from the queue, with equivalent behavior as `ack()` in a Worker.

1. Select the checkbox to the left of each row to select the message for acknowledgement, or select the checkbox in the table header to select all messages.
2. Select **Acknowledge messages**.
3. Confirm you want to acknowledge the messages, and select **Acknowledge messages**.

This will remove the selected messages from the queue and prevent consumers from processing them further.

Refer to the [Get Started guide](https://developers.cloudflare.com/queues/get-started/) to learn how to process and acknowledge messages from a queue in a Worker.

</page>

<page>
---
title: Cloudflare Queues - Pull consumers · Cloudflare Queues docs
description: A pull-based consumer allows you to pull from a queue over HTTP
  from any environment and/or programming language outside of Cloudflare
  Workers. A pull-based consumer can be useful when your message consumption
  rate is limited by upstream infrastructure or long-running tasks.
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/configuration/pull-consumers/
  md: https://developers.cloudflare.com/queues/configuration/pull-consumers/index.md
---

A pull-based consumer allows you to pull from a queue over HTTP from any environment and/or programming language outside of Cloudflare Workers. A pull-based consumer can be useful when your message consumption rate is limited by upstream infrastructure or long-running tasks.

## How to choose between push or pull consumer

Deciding whether to configure a push-based consumer or a pull-based consumer will depend on how you are using your queues, as well as the configuration of infrastructure upstream from your queue consumer.

* **Starting with a [push-based consumer](https://developers.cloudflare.com/queues/reference/how-queues-works/#consumers) is the easiest way to get started and consume from a queue**. A push-based consumer runs on Workers, and by default, will automatically scale up and consume messages as they are written to the queue.
* Use a pull-based consumer if you need to consume messages from existing infrastructure outside of Cloudflare Workers, and/or where you need to carefully control how fast messages are consumed. A pull-based consumer must explicitly make a call to pull (and then acknowledge) messages from the queue, only when it is ready to do so.

You can remove and attach a new consumer on a queue at any time, allowing you to change from a pull-based to a push-based consumer if your requirements change.

Retrieve an API bearer token

To configure a pull-based consumer, create [an API token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/) with both the `queues#read` and `queues#write` permissions. A consumer must be able to write to a queue to acknowledge messages.

To configure a pull-based consumer and receive messages from a queue, you need to:

1. Enable HTTP pull for the queue.
2. Create a valid authentication token for the HTTP client.
3. Pull message batches from the queue.
4. Acknowledge and/or retry messages within a batch.

## 1. Enable HTTP pull

You can enable HTTP pull or change a queue from push-based to pull-based via the [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/), the `wrangler` CLI, or via the [Cloudflare dashboard](https://dash.cloudflare.com/).

### Wrangler configuration file

A HTTP consumer can be configured in the [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) by setting `type = "http_pull"` in the consumer configuration:

* wrangler.jsonc

  ```jsonc
  {
    "queues": {
      "consumers": [
        {
          // Required
          "queue": "QUEUE-NAME",
          "type": "http_pull",
          // Optional
          "visibility_timeout_ms": 5000,
          "max_retries": 5,
          "dead_letter_queue": "SOME-OTHER-QUEUE"
        }
      ]
    }
  }
  ```

* wrangler.toml

  ```toml
  [[queues.consumers]]
  queue = "QUEUE-NAME"
  type = "http_pull"
  visibility_timeout_ms = 5_000
  max_retries = 5
  dead_letter_queue = "SOME-OTHER-QUEUE"
  ```

Omitting the `type` property will default the queue to push-based.

### wrangler CLI

You can enable a pull-based consumer on any existing queue by using the `wrangler queues consumer http` sub-commands and providing a queue name.

```sh
npx wrangler queues consumer http add $QUEUE-NAME
```

If you have an existing push-based consumer, you will need to remove that first. `wrangler` will return an error if you attempt to call `consumer http add` on a queue with an existing consumer configuration:

```sh
wrangler queues consumer worker remove $QUEUE-NAME $SCRIPT_NAME
```

Note

If you remove the Worker consumer with `wrangler` but do not delete the `[[queues.consumer]]` configuration from your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/), subsequent deployments of your Worker will fail when they attempt to add a conflicting consumer configuration.

Ensure you remove the consumer configuration first.

## 2. Consumer authentication

HTTP Pull consumers require an [API token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/) with the `com.cloudflare.api.account.queues_read` and `com.cloudflare.api.account.queues_write` permissions.

Both read *and* write are required as a pull-based consumer needs to write to the queue state to acknowledge the messages it receives. Consuming messages mutates the queue.

API tokens are presented as Bearer tokens in the `Authorization` header of a HTTP request in the format `Authorization: Bearer $YOUR_TOKEN_HERE`. The following example shows how to pass an API token using the `curl` HTTP client:

```bash
curl "https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/queues/${QUEUE_ID}/messages/pull" \
--header "Authorization: Bearer ${QUEUES_TOKEN}" \
--header "Content-Type: application/json" \
--data '{ "visibility_timeout": 10000, "batch_size": 2 }'
```

You may authenticate and run multiple concurrent pull-based consumers against a single queue.

### Create API tokens

To create an API token:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com).
2. Go to **My Profile** > [API Tokens](https://dash.cloudflare.com/profile/api-tokens).
3. Select **Create Token**.
4. Scroll to the bottom of the page and select **Create Custom Token**.
5. Give the token a name. For example, `queue-pull-token`.
6. Under the **Permissions** section, choose **Account** and then **Queues**. Ensure you have selected **Edit** (read+write).
7. (Optional) Select **All accounts** (default) or a specific account to scope the token to.
8. Select **Continue to summary** and then **Create token**.

You will need to note the token down: it will only be displayed once.

## 3. Pull messages

To pull a message, make a HTTP POST request to the [Queues REST API](https://developers.cloudflare.com/api/resources/queues/subresources/messages/methods/pull/) with a JSON-encoded body that optionally specifies a `visibility_timeout` and a `batch_size`, or an empty JSON object (`{}`):

* JavaScript

  ```js
  // POST /accounts/${CF_ACCOUNT_ID}/queues/${QUEUE_ID}/messages/pull with the timeout & batch size
  let resp = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/queues/${QUEUE_ID}/messages/pull`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${QUEUES_API_TOKEN}`,
      },
      // Optional - you can provide an empty object '{}' and the defaults will apply.
      body: JSON.stringify({ visibility_timeout_ms: 6000, batch_size: 50 }),
    },
  );
  ```

* TypeScript

  ```ts
  // POST /accounts/${CF_ACCOUNT_ID}/queues/${QUEUE_ID}/messages/pull with the timeout & batch size
  let resp = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/queues/${QUEUE_ID}/messages/pull`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${QUEUES_API_TOKEN}`,
      },
      // Optional - you can provide an empty object '{}' and the defaults will apply.
      body: JSON.stringify({ visibility_timeout_ms: 6000, batch_size: 50 }),
    },
  );
  ```

* Python

  ```python
  import json
  from workers import fetch


  # POST /accounts/${CF_ACCOUNT_ID}/queues/${QUEUE_ID}/messages/pull with the timeout & batch size
  resp = await fetch(
      f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/queues/{QUEUE_ID}/messages/pull",
      method="POST",
      headers={
          "content-type": "application/json",
          "authorization": f"Bearer {QUEUES_API_TOKEN}",
      },
      # Optional - you can provide an empty object '{}' and the defaults will apply.
      body=json.dumps({"visibility_timeout_ms": 6000, "batch_size": 50}),
  )
  ```

This will return an array of messages (up to the specified `batch_size`) in the below format:

```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": {
    "message_backlog_count": 10,
    "messages": [
      {
        "body": "hello",
        "id": "1ad27d24c83de78953da635dc2ea208f",
        "timestamp_ms": 1689615013586,
        "attempts": 2,
        "metadata":{
          "CF-sourceMessageSource":"dash",
          "CF-Content-Type":"json"
        },
        "lease_id": "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIn0..NXmbr8h6tnKLsxJ_AuexHQ.cDt8oBb_XTSoKUkVKRD_Jshz3PFXGIyu7H1psTO5UwI.smxSvQ8Ue3-ymfkV6cHp5Va7cyUFPIHuxFJA07i17sc"
      },
      {
        "body": "world",
        "id": "95494c37bb89ba8987af80b5966b71a7",
        "timestamp_ms": 1689615013586,
        "attempts": 2,
        "metadata":{
          "CF-sourceMessageSource":"dash",
          "CF-Content-Type":"json"
        },
        "lease_id": "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIn0..QXPgHfzETsxYQ1Vd-H0hNA.mFALS3lyouNtgJmGSkTzEo_imlur95EkSiH7fIRIn2U.PlwBk14CY_EWtzYB-_5CR1k30bGuPFPUx1Nk5WIipFU"
      }
    ]
  }
}
```

Pull consumers follow a "short polling" approach: if there are messages available to be delivered, Queues will return a response immediately with messages up to the configured `batch_size`. If there are no messages to deliver, Queues will return an empty response. Queues does not hold an open connection (often referred to as "long polling") if there are no messages to deliver.

Note

The [`pull`](https://developers.cloudflare.com/api/resources/queues/subresources/messages/methods/pull/) and [`ack`](https://developers.cloudflare.com/api/resources/queues/subresources/messages/methods/ack/) endpoints use the new `/queues/queue_id/messages/{action}` API format, as defined in the Queues API documentation.

The undocumented `/queues/queue_id/{action}` endpoints are not supported and will be deprecated as of June 30th, 2024.

Each message object has five fields:

1. `body` - this may be base64 encoded based on the [content-type the message was published as](#content-types).
2. `id` - a unique, read-only ephemeral identifier for the message.
3. `timestamp_ms` - when the message was published to the queue in milliseconds since the [Unix epoch](https://en.wikipedia.org/wiki/Unix_time). This allows you to determine how old a message is by subtracting it from the current timestamp.
4. `attempts` - how many times the message has been attempted to be delivered in full. When this reaches the value of `max_retries`, the message will not be re-delivered and will be deleted from the queue permanently.
5. `lease_id` - the encoded lease ID of the message. The `lease_id` is used to explicitly acknowledge or retry the message.

The `lease_id` allows your pull consumer to explicitly acknowledge some, none or all messages in the batch or mark them for retry. If messages are not acknowledged or marked for retry by the consumer, then they will be marked for re-delivery once the `visibility_timeout` is reached. A `lease_id` is no longer valid once this timeout has been reached.

You can configure both `batch_size` and `visibility_timeout` when pulling from a queue:

* `batch_size` (defaults to 5; max 100) - how many messages are returned to the consumer in each pull.
* `visibility_timeout` (defaults to 30 second; max 12 hours) - defines how long the consumer has to explicitly acknowledge messages delivered in the batch based on their `lease_id`. Once this timeout expires, messages are assumed unacknowledged and queued for re-delivery again.

### Concurrent consumers

You may have multiple HTTP clients pulling from the same queue concurrently: each client will receive a unique batch of messages and retain the "lease" on those messages up until the `visibility_timeout` expires, or until those messages are marked for retry.

Messages marked for retry will be put back into the queue and can be delivered to any consumer. Messages are *not* tied to a specific consumer, as consumers do not have an identity and to avoid a slow or stuck consumer from holding up processing of messages in a queue.

Multiple consumers can be useful in cases where you have multiple upstream resources (for example, GPU infrastructure), where you want to autoscale based on the [backlog](https://developers.cloudflare.com/queues/observability/metrics/) of a queue, and/or cost.

## 4. Acknowledge messages

Messages pulled by a consumer need to be either acknowledged or marked for retry.

To acknowledge and/or mark messages to be retried, make a HTTP `POST` request to `/ack` endpoint of your queue per the [Queues REST API](https://developers.cloudflare.com/api/resources/queues/subresources/messages/methods/ack/) by providing an array of `lease_id` objects to acknowledge and/or retry:

* JavaScript

  ```js
  // POST /accounts/${CF_ACCOUNT_ID}/queues/${QUEUE_ID}/messages/ack with the lease_ids
  let resp = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/queues/${QUEUE_ID}/messages/ack`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${QUEUES_API_TOKEN}`,
      },
      // If you have no messages to retry, you can specify an empty array - retries: []
      body: JSON.stringify({
        acks: [
          { lease_id: "lease_id1" },
          { lease_id: "lease_id2" },
          { lease_id: "etc" },
        ],
        retries: [{ lease_id: "lease_id4" }],
      }),
    },
  );
  ```

* TypeScript

  ```ts
  // POST /accounts/${CF_ACCOUNT_ID}/queues/${QUEUE_ID}/messages/ack with the lease_ids
  let resp = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/queues/${QUEUE_ID}/messages/ack`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${QUEUES_API_TOKEN}`,
      },
      // If you have no messages to retry, you can specify an empty array - retries: []
      body: JSON.stringify({
        acks: [
          { lease_id: "lease_id1" },
          { lease_id: "lease_id2" },
          { lease_id: "etc" },
        ],
        retries: [{ lease_id: "lease_id4" }],
      }),
    },
  );
  ```

* Python

  ```python
  import json
  from workers import fetch


  # POST /accounts/${CF_ACCOUNT_ID}/queues/${QUEUE_ID}/messages/ack with the lease_ids
  resp = await fetch(
      f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/queues/{QUEUE_ID}/messages/ack",
      method="POST",
      headers={
          "content-type": "application/json",
          "authorization": f"Bearer {QUEUES_API_TOKEN}",
      },
      # If you have no messages to retry, you can specify an empty array - retries: []
      body=json.dumps({
          "acks": [
              {"lease_id": "lease_id1"},
              {"lease_id": "lease_id2"},
              {"lease_id": "etc"},
          ],
          "retries": [{"lease_id": "lease_id4"}],
      }),
  )
  ```

You may optionally specify the number of seconds to delay a message for when marking it for retry by providing a `{ lease_id: string, delay_seconds: number }` object in the `retries` array:

```json
{
  "acks": [
    { "lease_id": "lease_id1" },
    { "lease_id": "lease_id2" },
    { "lease_id": "lease_id3" }
  ],
  "retries": [{ "lease_id": "lease_id4", "delay_seconds": 600 }]
}
```

Additionally:

* You should provide every `lease_id` in the request to the `/ack` endpoint if you are processing those messages in your consumer. If you do not acknowledge a message, it will be marked for re-delivery (put back in the queue).
* You can optionally mark messages to be retried: for example, if there is an error processing the message or you have upstream resource pressure. Explicitly marking a message for retry will place it back into the queue immediately, instead of waiting for a (potentially long) `visibility_timeout` to be reached.
* You can make multiple calls to the `/ack` endpoint as you make progress through a batch of messages, but we recommend grouping acknowledgements to reduce the number of API calls required.

Queues aims to be permissive when it comes to lease IDs: if a consumer acknowledges a message by its lease ID *after* the visibility timeout is reached, Queues will still accept that acknowledgment. If the message was delivered to another consumer during the intervening period, it will also be able to acknowledge the message without an error.

## Content types

Warning

When attaching a pull-based consumer to a queue, you should ensure that messages are sent with only a `text`, `bytes` or `json` [content type](https://developers.cloudflare.com/queues/configuration/javascript-apis/#queuescontenttype).

The default content type is `json`.

Pull-based consumers cannot decode the `v8` content type as it is specific to the Workers runtime.

When publishing to a queue that has an external consumer, you should be aware that certain content types may be encoded in a way that allows them to be safely serialized within a JSON object.

For both the `json` and `bytes` content types, this means that they will be base64-encoded ([RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648)). The `text` type will be sent as a plain UTF-8 encoded string.

Your consumer will need to decode the `json` and `bytes` types before operating on the data.

## Next steps

* Review the [REST API documentation](https://developers.cloudflare.com/api/resources/queues/subresources/consumers/methods/create/) and schema for Queues.
* Learn more about [how to make API calls](https://developers.cloudflare.com/fundamentals/api/how-to/make-api-calls/) to the Cloudflare API.
* Understand [what limit apply](https://developers.cloudflare.com/queues/platform/limits/) when consuming and writing to a queue.

</page>

<page>
---
title: Queues - Publish Directly via HTTP · Cloudflare Queues docs
description: Publish to a Queue directly via HTTP and Workers.
lastUpdated: 2026-01-27T21:11:25.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/examples/publish-to-a-queue-via-http/
  md: https://developers.cloudflare.com/queues/examples/publish-to-a-queue-via-http/index.md
---

The following example shows you how to publish messages to a Queue from any HTTP client, using a Cloudflare API token to authenticate.

This allows you to write to a Queue from any service or programming language that supports HTTP, including Go, Rust, Python or even a Bash script.

## Prerequisites

* A [queue created](https://developers.cloudflare.com/queues/get-started/#3-create-a-queue) via the [Cloudflare dashboard](https://dash.cloudflare.com) or the [wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/).
* A Cloudflare API token with the `Queues Edit` permission.

### 1. Send a test message

To make sure you successfully authenticate and write a message to your queue, use `curl` on the command line:

```sh
# Make sure to replace the placeholder with your shared secret
curl -XPOST -H "Authorization: Bearer <paste-your-api-token-here>" "https://api.cloudflare.com/client/v4/accounts/<paste-your-account-id-here>/queues/<paste-your-queue-id-here>/messages" --data '{ "body": { "greeting": "hello" } }'
```

```sh
{"success":true}
```

This will issue a HTTP POST request, and if successful, return a HTTP 200 with a `success: true` response body.

* If you receive a HTTP 403, this is because your API token is invalid or does not have the `Queues Edit` permission.

For full documentation about the HTTP Push API, refer to the [Cloudflare API documentation](https://developers.cloudflare.com/api/resources/queues/subresources/messages/).

</page>

<page>
---
title: Queues - Publish Directly via a Worker · Cloudflare Queues docs
description: Publish to a Queue directly from your Worker.
lastUpdated: 2026-02-08T20:22:21.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/examples/publish-to-a-queue-via-workers/
  md: https://developers.cloudflare.com/queues/examples/publish-to-a-queue-via-workers/index.md
---

The following example shows you how to publish messages to a Queue from a Worker. The example uses a Worker that receives a JSON payload from the request body and writes it as-is to the Queue, but in a real application you might have more logic before you queue a message.

## Prerequisites

* A [queue created](https://developers.cloudflare.com/queues/get-started/#3-create-a-queue) via the [Cloudflare dashboard](https://dash.cloudflare.com) or the [wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/).
* A [configured **producer** binding](https://developers.cloudflare.com/queues/configuration/configure-queues/#producer-worker-configuration) in the Cloudflare dashboard or Wrangler file.

Configure your Wrangler file as follows:

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "my-worker",
    "queues": {
      "producers": [
        {
          "queue": "my-queue",
          "binding": "YOUR_QUEUE"
        }
      ]
    }
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "my-worker"


  [[queues.producers]]
  queue = "my-queue"
  binding = "YOUR_QUEUE"
  ```

### 1. Create the Worker

The following Worker script:

1. Validates that the request body is valid JSON.
2. Publishes the payload to the queue.

```ts
interface Env {
  YOUR_QUEUE: Queue;
}


export default {
  async fetch(req, env, ctx): Promise<Response> {
    // Validate the payload is JSON
    // In a production application, we may more robustly validate the payload
    // against a schema using a library like 'zod'
    let messages;
    try {
      messages = await req.json();
    } catch {
      // Return a HTTP 400 (Bad Request) if the payload isn't JSON
      return Response.json({ error: "payload not valid JSON" }, { status: 400 });
    }


    // Publish to the Queue
    try {
      await env.YOUR_QUEUE.send(messages);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      console.error(`failed to send to the queue: ${message}`);
      // Return a HTTP 500 (Internal Error) if our publish operation fails
      return Response.json({ error: message }, { status: 500 });
    }


    // Return a HTTP 200 if the send succeeded!
    return Response.json({ success: true });
  },
} satisfies ExportedHandler<Env>;
```

To deploy this Worker:

```sh
npx wrangler deploy
```

### 2. Send a test message

To make sure you successfully write a message to your queue, use `curl` on the command line:

```sh
# Make sure to replace the placeholder with your shared secret
curl -XPOST "https://YOUR_WORKER.YOUR_ACCOUNT.workers.dev" --data '{"messages": [{"msg":"hello world"}]}'
```

```sh
{"success":true}
```

This will issue a HTTP POST request, and if successful, return a HTTP 200 with a `success: true` response body.

* If you receive a HTTP 400, this is because you attempted to send malformed JSON to your queue.
* If you receive a HTTP 500, this is because the message was not written to your Queue successfully.

You can use [`wrangler tail`](https://developers.cloudflare.com/workers/observability/logs/real-time-logs/) to debug the output of `console.log`.

</page>

<page>
---
title: Cloudflare Queues - Queues & R2 · Cloudflare Queues docs
description: Example of how to use Queues to batch data and store it in an R2 bucket.
lastUpdated: 2026-02-08T20:22:21.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/examples/send-errors-to-r2/
  md: https://developers.cloudflare.com/queues/examples/send-errors-to-r2/index.md
---

The following Worker will catch JavaScript errors and send them to a queue. The same Worker will receive those errors in batches and store them to a log file in an R2 bucket.

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "my-worker",
    "queues": {
      "producers": [
        {
          "queue": "my-queue",
          "binding": "ERROR_QUEUE"
        }
      ],
      "consumers": [
        {
          "queue": "my-queue",
          "max_batch_size": 100,
          "max_batch_timeout": 30
        }
      ]
    },
    "r2_buckets": [
      {
        "bucket_name": "my-bucket",
        "binding": "ERROR_BUCKET"
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "my-worker"


  [[queues.producers]]
  queue = "my-queue"
  binding = "ERROR_QUEUE"


  [[queues.consumers]]
  queue = "my-queue"
  max_batch_size = 100
  max_batch_timeout = 30


  [[r2_buckets]]
  bucket_name = "my-bucket"
  binding = "ERROR_BUCKET"
  ```

```ts
interface ErrorMessage {
  message: string;
  stack?: string;
}


interface Env {
  readonly ERROR_QUEUE: Queue<ErrorMessage>;
  readonly ERROR_BUCKET: R2Bucket;
}


export default {
  async fetch(req, env, ctx): Promise<Response> {
    try {
      return doRequest(req);
    } catch (e) {
      const error: ErrorMessage = {
        message: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack : undefined,
      };
      await env.ERROR_QUEUE.send(error);
      return new Response(error.message, { status: 500 });
    }
  },
  async queue(batch, env, ctx): Promise<void> {
    let file = "";
    for (const message of batch.messages) {
      const error = message.body;
      file += error.stack ?? error.message;
      file += "\r\n";
    }
    await env.ERROR_BUCKET.put(`errors/${Date.now()}.log`, file);
  },
} satisfies ExportedHandler<Env, ErrorMessage>;


function doRequest(request: Request): Response {
  if (Math.random() > 0.5) {
    return new Response("Success!");
  }
  throw new Error("Failed!");
}
```

</page>

<page>
---
title: Cloudflare Queues - Sending messages from the dashboard · Cloudflare
  Queues docs
description: Use the dashboard to send messages to a queue.
lastUpdated: 2026-01-27T21:11:25.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/examples/send-messages-from-dash/
  md: https://developers.cloudflare.com/queues/examples/send-messages-from-dash/index.md
---

Sending messages from the dashboard allows you to debug Queues or queue consumers without a producer Worker.

To send messages from the dashboard:

1. In the Cloudflare dashboard, go to the **Queues** page.

   [Go to **Queues**](https://dash.cloudflare.com/?to=/:account/workers/queues)

2. Select the queue to send a message to.

3. Select the **Messages** tab.

4. Select **Send**.

5. Choose your message **Content Type**: *Text* or *JSON*.

6. Enter your message. Alternatively, drag a file over the textbox to upload a file as a message.

7. Select **Send**.

Your message will be sent to the queue.

Refer to the [Get Started guide](https://developers.cloudflare.com/queues/get-started/) to learn how to send messages to a queue from a Worker.

</page>

<page>
---
title: Serverless ETL pipelines · Cloudflare Queues docs
lastUpdated: 2024-08-13T19:56:56.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/examples/serverless-etl/
  md: https://developers.cloudflare.com/queues/examples/serverless-etl/index.md
---


</page>

<page>
---
title: Metrics · Cloudflare Queues docs
description: Queues expose metrics which allow you to measure the queue backlog,
  consumer concurrency, and message operations.
lastUpdated: 2025-05-14T00:02:06.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/observability/metrics/
  md: https://developers.cloudflare.com/queues/observability/metrics/index.md
---

Queues expose metrics which allow you to measure the queue backlog, consumer concurrency, and message operations.

The metrics displayed in the [Cloudflare dashboard](https://dash.cloudflare.com/) are queried from Cloudflare’s [GraphQL Analytics API](https://developers.cloudflare.com/analytics/graphql-api/). You can access the metrics [programmatically](#query-via-the-graphql-api) via GraphQL or HTTP client.

## Metrics

### Backlog

Queues export the below metrics within the `queuesBacklogAdaptiveGroups` dataset.

| Metric | GraphQL Field Name | Description |
| - | - | - |
| Backlog bytes | `bytes` | Average size of the backlog, in bytes |
| Backlog messages | `messages` | Average size of the backlog, in number of messages |

The `queuesBacklogAdaptiveGroups` dataset provides the following dimensions for filtering and grouping queries:

* `queueID` - ID of the queue
* `datetime` - Timestamp for when the message was sent
* `date` - Timestamp for when the message was sent, truncated to the start of a day
* `datetimeHour` - Timestamp for when the message was sent, truncated to the start of an hour
* `datetimeMinute` - Timestamp for when the message was sent, truncated to the start of a minute

### Consumer concurrency

Queues export the below metrics within the `queueConsumerMetricsAdaptiveGroups` dataset.

| Metric | GraphQL Field Name | Description |
| - | - | - |
| Avg. Consumer Concurrency | `concurrency` | Average number of concurrent consumers over the period |

The `queueConsumerMetricsAdaptiveGroups` dataset provides the following dimensions for filtering and grouping queries:

* `queueID` - ID of the queue
* `datetime` - Timestamp for the consumer metrics
* `date` - Timestamp for the consumer metrics, truncated to the start of a day
* `datetimeHour` - Timestamp for the consumer metrics, truncated to the start of an hour
* `datetimeMinute` - Timestamp for the consumer metrics, truncated to the start of a minute

### Message operations

Queues export the below metrics within the `queueMessageOperationsAdaptiveGroups` dataset.

| Metric | GraphQL Field Name | Description |
| - | - | - |
| Total billable operations | `billableOperations` | Sum of billable operations (writes, reads, and deletes) over the time period |
| Total Bytes | `bytes` | Sum of bytes read, written, and deleted from the queue |
| Lag | `lagTime` | Average lag time in milliseconds between when the message was written and the operation to consume the message. |
| Retries | `retryCount` | Average number of retries per message |
| Message Size | `messageSize` | Maximum message size over the specified period |

The `queueMessageOperationsAdaptiveGroups` dataset provides the following dimensions for filtering and grouping queries:

* `queueID` - ID of the queue
* `actionType` - The type of message operation. Can be `WriteMessage`, `ReadMessage` or `DeleteMessage`
* `consumerType` - The queue consumer type. Can be `worker` or `http`. Only applicable for `ReadMessage` and `DeleteMessage` action types
* `outcome` - The outcome of the mesage operation. Only applicable for `DeleteMessage` action types. Can be `success`, `dlq` or `fail`.
* `datetime` - Timestamp for the message operation
* `date` - Timestamp for the message operation, truncated to the start of a day
* `datetimeHour` - Timestamp for the message operation, truncated to the start of an hour
* `datetimeMinute` - Timestamp for the message operation, truncated to the start of a minute

## Example GraphQL Queries

### Get average queue backlog over time period

```graphql
query QueueBacklog(
  $accountTag: string!
  $queueId: string!
  $datetimeStart: Time!
  $datetimeEnd: Time!
) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      queueBacklogAdaptiveGroups(
        limit: 10000
        filter: {
          queueId: $queueId
          datetime_geq: $datetimeStart
          datetime_leq: $datetimeEnd
        }
      ) {
        avg {
          messages
          bytes
        }
      }
    }
  }
}
```

[Run in GraphQL API Explorer](https://graphql.cloudflare.com/explorer?query=I4VwpgTgngBAiucAhAhgYwNYBsD2BzACgCgYYASdNHEAOwBcAVFPALhgGc6IBLGvAQhLlQYcAEkAJm048+g0mQko6YOtwC2YAMp0UEOmwYaw88kpVrNAURpSYRzYICUMAN5CAbtzAB3SG6FSSmp6dgIAM24sFQg2Vxhg2kZmNgo0KiSmPBgAXxd3UkKYEWR0bHwAQSUABzUPMABxCGpqsMCimCwNbgMYAEYABiGB9qLI6Mg40Y6SsElU2clpovNVYwB9PDBgVNXLbV19ZcK9jaxt3eU161tjnOn845QPbIKOos12dmYwdmPSABGUBUf3epHu7whhSh9xyQA\&variables=N4IghgxhD2CuB2AXAKmA5iAXCAggYTwHkBVAOWQH0BJAERABoQBHWAUzaoBMsQAlAUQAKAGXz8KAdSrIAEtTqNOYRK0QBLALasAyojAAnRDwBMABmMA2ALTmrARlPIHmcy4AcALQYglK9Vv54bmwzSxtje0c7Cxdjdy8AXyA)

### Get average consumer concurrency by hour

```graphql
query QueueConcurrencyByHour(
  $accountTag: string!
  $queueId: string!
  $datetimeStart: Time!
  $datetimeEnd: Time!
) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      queueConsumerMetricsAdaptiveGroups(
        limit: 10000
        filter: {
          queueId: $queueId
          datetime_geq: $datetimeStart
          datetime_leq: $datetimeEnd
        }
        orderBy: [datetimeHour_DESC]
      ) {
        avg {
          concurrency
        }
        dimensions {
          datetimeHour
        }
      }
    }
  }
}
```

[Run in GraphQL API Explorer](https://graphql.cloudflare.com/explorer?query=I4VwpgTgngBAiucBhA9gOwMYghMmoBCUAEitgBQBQMMAJAIYYZloAuAKvQOYBcMAzqwgBLNFwCE1OqDDgAkgBM+gkWMk1aC+qzCthAWzABlVvQis+7A2HV0tOvYYCiaJTCuHJAShgBvKQBuwmAA7pB+UjSMzCBs-OQAZsIANjoQfL4w0Swc3HwMTDmcXDAAvj7+NFUwMsjo-CCGEACyuiIY-ACCWgAOegFgAOIQZD3xkdUwyQbCFjAAjAAMy4sT1UmpkBlrk7Vgivl7ijvV9rrWAPpcYMD5Z47GpuYnVfeXyTd32ufOri+lLxQEAUkCIfAA2m9DKRsBcACJOIxIAC6OwqL3oARKlUm1WYmGwuHw-xeCmsaH4wnqEVxp2+DxhEBJuIB1VZZUopSAA\&variables=N4IghgxhD2CuB2AXAKmA5iAXCAggYTwHkBVAOWQH0BJAERABoQBHWAUzaoBMsQAlAUQAKAGXz8KAdSrIAEtTqNOYRK0QBLALasAyojAAnRDwBMABmMA2ALTmrARlPIHmc5jsBWAFoMQSleq1+eG5sM0sbY3tHOwsXYzcvEABfIA)

### Get message operations by minute

```graphql
query QueueMessageOperationsByMinute(
  $accountTag: string!
  $queueId: string!
  $datetimeStart: Date!
  $datetimeEnd: Date!
) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      queueMessageOperationsAdaptiveGroups(
        limit: 10000
        filter: {
          queueId: $queueId
          datetime_geq: $datetimeStart
          datetime_leq: $datetimeEnd
        }
        orderBy: [datetimeMinute_DESC]
      ) {
        count
        sum {
          bytes
        }
        dimensions {
          datetimeMinute
        }
      }
    }
  }
}
```

[Run in GraphQL API Explorer](https://graphql.cloudflare.com/explorer?query=I4VwpgTgngBAiucBZMBnVBDA5mA8gB0gwBcBLAewDtUAhKJUykYsACgCgYYASDAYz7kQlYgBVsALhipiERlgCEnHqDDgAkgBMpMuZUXLumkmDIBbMAGViGCMSkARE0q5GT5sAFFK2mE5ZKAJQwAN7KAG6kYADukKHKXPyCwsSorABmpAA2LBBSITBJQiLiWFK8AsVi2DAAvsFhXE0wqshomDgERGRUqACCxvhk4WAA4hBC+GkJzTBZpGak9jAAjAAMG2szzZk5kPnbs61gWuXHWofNxiweAPo4wOXXpgtWNnaXTc93WWCPPN9Xt5NJ9ap9yBBNJA6FIANqAiwMJgsW4OTyWADCAF1Dg1PskRJ9UCAzPFZrMAEZQFioUGfTSvagUahk8lfdyvJHMMB08lg5r8ursWpAA\&variables=N4IghgxhD2CuB2AXAKmA5iAXCAggYTwHkBVAOWQH0BJAERABoQBHWAUzaoBMsQAlAUQAKAGXz8KAdSrIAEtTqNOYRK0QBLALasAyojAAnRDwBMABmMA2ALTmbATgYglK9Vv7xu2M5ZvGrARlMQAF8gA)

</page>

<page>
---
title: Queues - Use Queues and Durable Objects · Cloudflare Queues docs
description: Publish to a queue from within a Durable Object.
lastUpdated: 2026-02-08T20:22:21.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/examples/use-queues-with-durable-objects/
  md: https://developers.cloudflare.com/queues/examples/use-queues-with-durable-objects/index.md
---

The following example shows you how to write a Worker script to publish to [Cloudflare Queues](https://developers.cloudflare.com/queues/) from within a [Durable Object](https://developers.cloudflare.com/durable-objects/).

Prerequisites:

* A [queue created](https://developers.cloudflare.com/queues/get-started/#3-create-a-queue) via the Cloudflare dashboard or the [wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/).
* A [configured **producer** binding](https://developers.cloudflare.com/queues/configuration/configure-queues/#producer-worker-configuration) in the Cloudflare dashboard or Wrangler file.
* A [Durable Object namespace binding](https://developers.cloudflare.com/workers/wrangler/configuration/#durable-objects).

Configure your Wrangler file as follows:

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "my-worker",
    "queues": {
      "producers": [
        {
          "queue": "my-queue",
          "binding": "YOUR_QUEUE"
        }
      ]
    },
    "durable_objects": {
      "bindings": [
        {
          "name": "YOUR_DO_CLASS",
          "class_name": "YourDurableObject"
        }
      ]
    },
    "migrations": [
      {
        "tag": "v1",
        "new_sqlite_classes": [
          "YourDurableObject"
        ]
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "my-worker"


  [[queues.producers]]
  queue = "my-queue"
  binding = "YOUR_QUEUE"


  [[durable_objects.bindings]]
  name = "YOUR_DO_CLASS"
  class_name = "YourDurableObject"


  [[migrations]]
  tag = "v1"
  new_sqlite_classes = [ "YourDurableObject" ]
  ```

The following Worker script:

1. Creates a Durable Object stub, or retrieves an existing one based on a userId.
2. Passes request data to the Durable Object.
3. Publishes to a queue from within the Durable Object.

Extending the `DurableObject` base class makes your `Env` available on `this.env` and the Durable Object state available on `this.ctx` within the [`fetch()` handler](https://developers.cloudflare.com/durable-objects/best-practices/create-durable-object-stubs-and-send-requests/) in the Durable Object.

```ts
import { DurableObject } from "cloudflare:workers";


interface Env {
  YOUR_QUEUE: Queue;
  YOUR_DO_CLASS: DurableObjectNamespace<YourDurableObject>;
}


export default {
  async fetch(req, env, ctx): Promise<Response> {
    // Assume each Durable Object is mapped to a userId in a query parameter
    // In a production application, this will be a userId defined by your application
    // that you validate (and/or authenticate) first.
    const url = new URL(req.url);
    const userIdParam = url.searchParams.get("userId");


    if (userIdParam) {
      // Get a stub that allows you to call that Durable Object
      const durableObjectStub = env.YOUR_DO_CLASS.getByName(userIdParam);


      // Pass the request to that Durable Object and await the response
      // This invokes the constructor once on your Durable Object class (defined further down)
      // on the first initialization, and the fetch method on each request.
      // We pass the original Request to the Durable Object's fetch method
      const response = await durableObjectStub.fetch(req);


      // This would return "wrote to queue", but you could return any response.
      return response;
    }
    return new Response("userId must be provided", { status: 400 });
  },
} satisfies ExportedHandler<Env>;


export class YourDurableObject extends DurableObject<Env> {
  async fetch(req: Request): Promise<Response> {
    // Error handling elided for brevity.
    // Publish to your queue
    await this.env.YOUR_QUEUE.send({
      id: this.ctx.id.toString(), // Write the ID of the Durable Object to your queue
      // Write any other properties to your queue
    });


    return new Response("wrote to queue");
  }
}
```

</page>

<page>
---
title: Audit Logs · Cloudflare Queues docs
description: Audit logs provide a comprehensive summary of changes made within
  your Cloudflare account, including those made to Queues. This functionality is
  always enabled.
lastUpdated: 2025-09-04T16:11:18.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/platform/audit-logs/
  md: https://developers.cloudflare.com/queues/platform/audit-logs/index.md
---

[Audit logs](https://developers.cloudflare.com/fundamentals/account/account-security/review-audit-logs/) provide a comprehensive summary of changes made within your Cloudflare account, including those made to Queues. This functionality is always enabled.

## Viewing audit logs

To view audit logs for your Queue in the Cloudflare dashboard, go to the **Audit logs** page.

[Go to **Audit logs**](https://dash.cloudflare.com/?to=/:account/audit-log)

For more information on how to access and use audit logs, refer to [Review audit logs](https://developers.cloudflare.com/fundamentals/account/account-security/review-audit-logs/).

## Logged operations

The following configuration actions are logged:

| Operation | Description |
| - | - |
| CreateQueue | Creation of a new queue. |
| DeleteQueue | Deletion of an existing queue. |
| UpdateQueue | Updating the configuration of a queue. |
| AttachConsumer | Attaching a consumer, including HTTP pull consumers, to the Queue. |
| RemoveConsumer | Removing a consumer, including HTTP pull consumers, from the Queue. |
| UpdateConsumerSettings | Changing Queues consumer settings. |

</page>

<page>
---
title: Changelog · Cloudflare Queues docs
description: Subscribe to RSS
lastUpdated: 2025-02-13T19:35:19.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/platform/changelog/
  md: https://developers.cloudflare.com/queues/platform/changelog/index.md
---

[Subscribe to RSS](https://developers.cloudflare.com/queues/platform/changelog/index.xml)

## 2025-04-17

**Improved limits for pull consumers**

[Queues Pull Consumers](https://developers.cloudflare.com/queues/configuration/pull-consumers/) can now pull and acknowledge up to 5,000 messages per second per queue. Previously, pull consumers were rate limited to 1200 requests / 5 minutes, aggregated across all queues.

Refer to the [documentation on pull consumers](https://developers.cloudflare.com/queues/configuration/pull-consumers/) to learn how to setup a pull consumer, acknowledge / retry messages, and setup multiple consumers.

## 2025-03-27

**Pause delivery and purge queues**

Queues now supports the ability to pause delivery and/or delete messages from a queue, allowing you to better manage queue backlogs.

Message delivery from a Queue to consumers can be paused / resumed. Queues continue to receive messages while paused.

Queues can be purged to permanently delete all messages currently stored in a Queue. This operation is useful while testing a new application, if a queue producer was misconfigured and is sending bad messages.

Refer to the [documentation on Pause & Purge](https://developers.cloudflare.com/queues/configuration/pause-purge/) to learn how to use both operations.

## 2025-02-14

**Customize message retention period**

You can now customize a queue's message retention period, from a minimum of 60 seconds to a maximum of 14 days. Previously, it was fixed to the default of 4 days.

Refer to the [Queues confiuguration documentation](https://developers.cloudflare.com/queues/configuration/configure-queues/#queue-configuration) to learn more.

## 2024-09-26

**Queues is GA, with higher throughput & consumer concurrency**

Queues is now generally available.

The per-queue message throughput has increased from 400 to 5,000 messages per second. This applies to new and existing queues.

Maximum concurrent consumers has increased from 20 to 250. This applies to new and existing queues. Queues with no explicit limit will automatically scale to the new maximum. Review the [consumer concurrency documentation](https://developers.cloudflare.com/queues/configuration/consumer-concurrency) to learn more.

## 2024-03-26

**Delay messages published to a queue**

Messages published to a queue and/or marked for retry from a queue consumer can now be explicitly delayed. Delaying messages allows you to defer tasks until later, and/or respond to backpressure when consuming from a queue.

Refer to [Batching and Retries](https://developers.cloudflare.com/queues/configuration/batching-retries/) to learn how to delay messages written to a queue.

## 2024-03-25

**Support for pull-based consumers**

Queues now supports [pull-based consumers](https://developers.cloudflare.com/queues/configuration/pull-consumers/). A pull-based consumer allows you to pull from a queue over HTTP from any environment and/or programming language outside of Cloudflare Workers. A pull-based consumer can be useful when your message consumption rate is limited by upstream infrastructure or long-running tasks.

Review the [documentation on pull-based consumers](https://developers.cloudflare.com/queues/configuration/pull-consumers/) to configure HTTP-based pull.

## 2024-03-18

**Default content type now set to JSON**

The default [content type](https://developers.cloudflare.com/queues/configuration/javascript-apis/#queuescontenttype) for messages published to a queue is now `json`, which improves compatibility with the upcoming pull-based queues.

Any Workers created on or after the [compatibility date](https://developers.cloudflare.com/workers/configuration/compatibility-flags/#queues-send-messages-in-json-format) of `2024-03-18`, or that explicitly set the `queues_json_messages` compatibility flag, will use the new default behaviour. Existing Workers with a compatibility date prior will continue to use `v8` as the default content type for published messages.

## 2024-02-24

**Explicit retries no longer impact consumer concurrency/scaling.**

Calling `retry()` or `retryAll()` on a message or message batch will no longer have an impact on how Queues scales [consumer concurrency](https://developers.cloudflare.com/queues/configuration/consumer-concurrency/).

Previously, using [explicit retries](https://developers.cloudflare.com/queues/configuration/batching-retries/#explicit-acknowledgement-and-retries) via `retry()` or `retryAll()` would count as an error and could result in Queues scaling down the number of concurrent consumers.

## 2023-10-07

**More queues per account - up to 10,000**

Developers building on Queues can now create up to 10,000 queues per account, enabling easier per-user, per-job and sharding use-cases.

Refer to [Limits](https://developers.cloudflare.com/queues/platform/limits) to learn more about Queues' current limits.

## 2023-10-05

**Higher consumer concurrency limits**

[Queue consumers](https://developers.cloudflare.com/queues/configuration/consumer-concurrency/) can now scale to 20 concurrent invocations (per queue), up from 10. This allows you to scale out and process higher throughput queues more quickly.

Queues with [no explicit limit specified](https://developers.cloudflare.com/queues/configuration/consumer-concurrency/#limit-concurrency) will automatically scale to the new maximum.

This limit will continue to grow during the Queues beta.

## 2023-03-28

**Consumer concurrency (enabled)**

Queue consumers will now [automatically scale up](https://developers.cloudflare.com/queues/configuration/consumer-concurrency/) based on the number of messages being written to the queue. To control or limit concurrency, you can explicitly define a [`max_concurrency`](https://developers.cloudflare.com/queues/configuration/configure-queues/#consumer) for your consumer.

## 2023-03-15

**Consumer concurrency (upcoming)**

Queue consumers will soon automatically scale up concurrently as a queues' backlog grows in order to keep overall message processing latency down. Concurrency will be enabled on all existing queues by 2023-03-28.

**To opt-out, or to configure a fixed maximum concurrency**, set `max_concurrency = 1` in your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) or via [the queues dashboard](https://dash.cloudflare.com/?to=/:account/queues).

**To opt-in, you do not need to take any action**: your consumer will begin to scale out as needed to keep up with your message backlog. It will scale back down as the backlog shrinks, and/or if a consumer starts to generate a higher rate of errors. To learn more about how consumers scale, refer to the [consumer concurrency](https://developers.cloudflare.com/queues/configuration/consumer-concurrency/) documentation.

## 2023-03-02

**Explicit acknowledgement (new feature)**

You can now [acknowledge individual messages with a batch](https://developers.cloudflare.com/queues/configuration/batching-retries/#explicit-acknowledgement-and-retries) by calling `.ack()` on a message.

This allows you to mark a message as delivered as you process it within a batch, and avoids the entire batch from being redelivered if your consumer throws an error during batch processing. This can be particularly useful when you are calling external APIs, writing messages to a database, or otherwise performing non-idempotent actions on individual messages within a batch.

## 2023-03-01

**Higher per-queue throughput**

The per-queue throughput limit has now been [raised to 400 messages per second](https://developers.cloudflare.com/queues/platform/limits/).

## 2022-12-13

**sendBatch support**

The JavaScript API for Queue producers now includes a `sendBatch` method which supports sending up to 100 messages at a time.

## 2022-12-12

**Increased per-account limits**

Queues now allows developers to create up to 100 queues per account, up from the initial beta limit of 10 per account. This limit will continue to increase over time.

</page>

<page>
---
title: Limits · Cloudflare Queues docs
description: 1 1 KB is measured as 1000 bytes. Messages can include up to ~100
  bytes of internal metadata that counts towards total message limits.
lastUpdated: 2026-02-10T13:58:52.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/platform/limits/
  md: https://developers.cloudflare.com/queues/platform/limits/index.md
---

Warning

The following limits apply to both Workers Paid and Workers Free plans with the exception of **Message Retention**, which is non-configurable at 24 hours for the Workers Free plan.

| Feature | Limit |
| - | - |
| Queues | 10,000 per account |
| Message size | 128 KB 1 |
| Message retries | 100 |
| Maximum consumer batch size | 100 messages |
| Maximum messages per `sendBatch` call | 100 (or 256KB in total) |
| Maximum Batch wait time | 60 seconds |
| Per-queue message throughput | 5,000 messages per second 2 |
| Message retention period 3 | [Configurable up to 14 days](https://developers.cloudflare.com/queues/configuration/configure-queues/#queue-configuration). |
| Per-queue backlog size 4 | 25GB |
| Concurrent consumer invocations | 250 push-based only |
| Consumer duration (wall clock time) | 15 minutes 5 |
| [Consumer CPU time](https://developers.cloudflare.com/workers/platform/limits/#cpu-time) | [Configurable to 5 minutes](https://developers.cloudflare.com/queues/platform/limits/#increasing-queue-consumer-worker-cpu-limits) |
| `visibilityTimeout` (pull-based queues) | 12 hours |
| `delaySeconds` (when sending or retrying) | 12 hours |

1 1 KB is measured as 1000 bytes. Messages can include up to \~100 bytes of internal metadata that counts towards total message limits.

2 Exceeding the maximum message throughput will cause the `send()` and `sendBatch()` methods to throw an exception with a `Too Many Requests` error until your producer falls below the limit.

3 Messages in a queue that reach the maximum message retention are deleted from the queue. Queues does not delete messages in the same queue that have not reached this limit.

4 Individual queues that reach this limit will receive a `Storage Limit Exceeded` error when calling `send()` or `sendBatch()` on the queue.

5 Refer to [Workers limits](https://developers.cloudflare.com/workers/platform/limits/#cpu-time).

Need a higher limit?

To request an adjustment to a limit, complete the [Limit Increase Request Form](https://forms.gle/ukpeZVLWLnKeixDu7). If the limit can be increased, Cloudflare will contact you with next steps.

### Increasing Queue Consumer Worker CPU Limits

[Queue consumer Workers](https://developers.cloudflare.com/queues/reference/how-queues-works/#consumers) are Worker scripts, and share the same [per invocation CPU limits](https://developers.cloudflare.com/workers/platform/limits/#worker-limits) as any Workers do. Note that CPU time is active processing time: not time spent waiting on network requests, storage calls, or other general I/O.

By default, the maximum CPU time per consumer Worker invocation is set to 30 seconds, but can be increased by setting `limits.cpu_ms` in your Wrangler configuration:

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

</page>

<page>
---
title: Cloudflare Queues - Pricing · Cloudflare Queues docs
description: Cloudflare Queues charges for the total number of operations
  against each of your queues during a given month.
lastUpdated: 2024-08-13T19:56:56.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/platform/pricing/
  md: https://developers.cloudflare.com/queues/platform/pricing/index.md
---

Cloudflare Queues charges for the total number of operations against each of your queues during a given month.

* An operation is counted for each 64 KB of data that is written, read, or deleted.
* Messages larger than 64 KB are charged as if they were multiple messages: for example, a 65 KB message and a 127 KB message would both incur two operation charges when written, read, or deleted.
* A KB is defined as 1,000 bytes, and each message includes approximately 100 bytes of internal metadata.
* Operations are per message, not per batch. A batch of 10 messages (the default batch size), if processed, would incur 10x write, 10x read, and 10x delete operations: one for each message in the batch.
* There are no data transfer (egress) or throughput (bandwidth) charges.

| | Workers Free | Workers Paid |
| - | - | - |
| Standard operations | 10,000 operations/day included | 1,000,000 operations/month included + $0.40/million operations |
| Message retention | 24 hours (non-configurable) | 4 days default, configurable up to 14 days |

In most cases, it takes 3 operations to deliver a message: 1 write, 1 read, and 1 delete. Therefore, you can use the following formula to estimate your monthly bill:

```txt
((Number of Messages * 3) - 1,000,000) / 1,000,000  * $0.40
```

Additionally:

* Each retry incurs a read operation. A batch of 10 messages that is retried would incur 10 operations for each retry.
* Messages that reach the maximum retries and that are written to a [Dead Letter Queue](https://developers.cloudflare.com/queues/configuration/batching-retries/) incur a write operation for each 64 KB chunk. A message that was retried 3 times (the default), fails delivery on the fourth time and is written to a Dead Letter Queue would incur five (5) read operations.
* Messages that are written to a queue, but that reach the maximum persistence duration (or "expire") before they are read, incur only a write and delete operation per 64 KB chunk.

## Examples

If an application writes, reads and deletes (consumes) one million messages a day (in a 30 day month), and each message is less than 64 KB in size, the estimated bill for the month would be:

| | Total Usage | Free Usage | Billed Usage | Price |
| - | - | - | - | - |
| Standard operations | 3 \* 30 \* 1,000,000 | 1,000,000 | 89,000,000 | $35.60 |
| | (write, read, delete) | | | |
| **TOTAL** | | | | **$35.60** |

An application that writes, reads and deletes (consumes) 100 million \~127 KB messages (each message counts as two 64 KB chunks) per month would have an estimated bill resembling the following:

| | Total Usage | Free Usage | Billed Usage | Price |
| - | - | - | - | - |
| Standard operations | 2 \* 3 \* 100 \* 1,000,000 | 1,000,000 | 599,000,000 | $239.60 |
| | (2x ops for > 64KB messages) | | | |
| **TOTAL** | | | | **$239.60** |

</page>

<page>
---
title: Choose a data or storage product · Cloudflare Queues docs
lastUpdated: 2024-08-13T19:56:56.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/platform/storage-options/
  md: https://developers.cloudflare.com/queues/platform/storage-options/index.md
---


</page>

<page>
---
title: Delivery guarantees · Cloudflare Queues docs
description: Delivery guarantees define how strongly a messaging system enforces
  the delivery of messages it processes.
lastUpdated: 2024-08-13T19:56:56.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/reference/delivery-guarantees/
  md: https://developers.cloudflare.com/queues/reference/delivery-guarantees/index.md
---

Delivery guarantees define how strongly a messaging system enforces the delivery of messages it processes.

As you make stronger guarantees about message delivery, the system needs to perform more checks and acknowledgments to ensure that messages are delivered, or maintain state to ensure a message is only delivered the specified number of times. This increases the latency of the system and reduces the overall throughput of the system. Each message may require an additional internal acknowledgements, and an equivalent number of additional roundtrips, before it can be considered delivered.

* **Queues provides *at least once* delivery by default** in order to optimize for reliability.
* This means that messages are guaranteed to be delivered at least once, and in rare occasions, may be delivered more than once.
* For the majority of applications, this is the right balance between not losing any messages and minimizing end-to-end latency, as exactly once delivery incurs additional overheads in any messaging system.

In cases where processing the same message more than once would introduce unintended behaviour, generating a unique ID when writing the message to the queue and using that as the primary key on database inserts and/or as an idempotency key to de-duplicate the message after processing. For example, using this idempotency key as the ID in an upstream email API or payment API will allow those services to reject the duplicate on your behalf, without you having to carry additional state in your application.

</page>

<page>
---
title: How Queues Works · Cloudflare Queues docs
description: Cloudflare Queues is a flexible messaging queue that allows you to
  queue messages for asynchronous processing. Message queues are great at
  decoupling components of applications, like the checkout and order fulfillment
  services for an e-commerce site. Decoupled services are easier to reason
  about, deploy, and implement, allowing you to ship features that delight your
  customers without worrying about synchronizing complex deployments. Queues
  also allow you to batch and buffer calls to downstream services and APIs.
lastUpdated: 2026-02-08T20:22:21.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/reference/how-queues-works/
  md: https://developers.cloudflare.com/queues/reference/how-queues-works/index.md
---

Cloudflare Queues is a flexible messaging queue that allows you to queue messages for asynchronous processing. Message queues are great at decoupling components of applications, like the checkout and order fulfillment services for an e-commerce site. Decoupled services are easier to reason about, deploy, and implement, allowing you to ship features that delight your customers without worrying about synchronizing complex deployments. Queues also allow you to batch and buffer calls to downstream services and APIs.

There are four major concepts to understand with Queues:

1. [Queues](#what-is-a-queue)
2. [Producers](#producers)
3. [Consumers](#consumers)
4. [Messages](#messages)

## What is a queue

A queue is a buffer or list that automatically scales as messages are written to it, and allows a consumer Worker to pull messages from that same queue.

Queues are designed to be reliable, and messages written to a queue should never be lost once the write succeeds. Similarly, messages are not deleted from a queue until the [consumer](#consumers) has successfully consumed the message.

Queues does not guarantee that messages will be delivered to a consumer in the same order in which they are published.

Developers can create multiple queues. Creating multiple queues can be useful to:

* Separate different use-cases and processing requirements: for example, a logging queue vs. a password reset queue.
* Horizontally scale your overall throughput (messages per second) by using multiple queues to scale out.
* Configure different batching strategies for each consumer connected to a queue.

For most applications, a single producer Worker per queue, with a single consumer Worker consuming messages from that queue allows you to logically separate the processing for each of your queues.

## Producers

A producer is the term for a client that is publishing or producing messages on to a queue. A producer is configured by [binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/) a queue to a Worker and writing messages to the queue by calling that binding.

For example, if we bound a queue named `my-first-queue` to a binding of `MY_FIRST_QUEUE`, messages can be written to the queue by calling `send()` on the binding:

```ts
interface Env {
  readonly MY_FIRST_QUEUE: Queue;
}


export default {
  async fetch(req, env, ctx): Promise<Response> {
    const message = {
      url: req.url,
      method: req.method,
      headers: Object.fromEntries(req.headers),
    };


    await env.MY_FIRST_QUEUE.send(message); // This will throw an exception if the send fails for any reason
    return new Response("Sent!");
  },
} satisfies ExportedHandler<Env>;
```

Note

You can also use [`context.waitUntil()`](https://developers.cloudflare.com/workers/runtime-apis/context/#waituntil) to send the message without blocking the response.

Note that because `waitUntil()` is non-blocking, any errors raised from the `send()` or `sendBatch()` methods on a queue will be implicitly ignored.

A queue can have multiple producer Workers. For example, you may have multiple producer Workers writing events or logs to a shared queue based on incoming HTTP requests from users. There is no limit to the total number of producer Workers that can write to a single queue.

Additionally, multiple queues can be bound to a single Worker. That single Worker can decide which queue to write to (or write to multiple) based on any logic you define in your code.

### Content types

Messages published to a queue can be published in different formats, depending on what interoperability is needed with your consumer. The default content type is `json`, which means that any object that can be passed to `JSON.stringify()` will be accepted.

To explicitly set the content type or specify an alternative content type, pass the `contentType` option to the `send()` method of your queue:

```ts
interface Env {
  readonly MY_FIRST_QUEUE: Queue;
}


export default {
  async fetch(req, env, ctx): Promise<Response> {
    const message = {
      url: req.url,
      method: req.method,
      headers: Object.fromEntries(req.headers),
    };
    try {
      await env.MY_FIRST_QUEUE.send(message, { contentType: "json" }); // "json" is the default
      return new Response("Sent!");
    } catch (e) {
      // Catch cases where send fails, including due to a mismatched content type
      const msg = e instanceof Error ? e.message : "Unknown error";
      return Response.json({ error: msg }, { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;
```

To only accept simple strings when writing to a queue, set `{ contentType: "text" }` instead:

```ts
interface Env {
  readonly MY_FIRST_QUEUE: Queue;
}


export default {
  async fetch(req, env, ctx): Promise<Response> {
    try {
      // This will throw an exception (error) if you pass a non-string to the queue,
      // such as a native JavaScript object or ArrayBuffer.
      await env.MY_FIRST_QUEUE.send("hello there", { contentType: "text" }); // explicitly set 'text'
      return new Response("Sent!");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      return Response.json({ error: msg }, { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;
```

The [`QueuesContentType`](https://developers.cloudflare.com/queues/configuration/javascript-apis/#queuescontenttype) API documentation describes how each format is serialized to a queue.

## Consumers

Queues supports two types of consumer:

1. A [consumer Worker](https://developers.cloudflare.com/queues/configuration/configure-queues/), which is push-based: the Worker is invoked when the queue has messages to deliver.
2. A [HTTP pull consumer](https://developers.cloudflare.com/queues/configuration/pull-consumers/), which is pull-based: the consumer calls the queue endpoint over HTTP to receive and then acknowledge messages.

A queue can only have one type of consumer configured.

### Create a consumer Worker

A consumer is the term for a client that is subscribing to or *consuming* messages from a queue. In its most basic form, a consumer is defined by creating a `queue` handler in a Worker:

```ts
interface Env {
  // Add your bindings here, e.g. KV namespaces, R2 buckets, D1 databases
}


export default {
  async queue(batch, env, ctx): Promise<void> {
    // Do something with messages in the batch
    // i.e. write to R2 storage, D1 database, or POST to an external API
    for (const msg of batch.messages) {
      // Process each message
      console.log(msg.body);
    }
  },
} satisfies ExportedHandler<Env>;
```

You then connect that consumer to a queue with `wrangler queues consumer <queue-name> <worker-script-name>` or by defining a `[[queues.consumers]]` configuration in your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) manually:

* wrangler.jsonc

  ```jsonc
  {
    "queues": {
      "consumers": [
        {
          "queue": "<your-queue-name>",
          "max_batch_size": 100, // optional
          "max_batch_timeout": 30 // optional
        }
      ]
    }
  }
  ```

* wrangler.toml

  ```toml
  [[queues.consumers]]
  queue = "<your-queue-name>"
  max_batch_size = 100
  max_batch_timeout = 30
  ```

Importantly, each queue can only have one active consumer. This allows Cloudflare Queues to achieve at least once delivery and minimize the risk of duplicate messages beyond that.

Best practice

Configure a single consumer per queue. This both logically separates your queues, and ensures that errors (failures) in processing messages from one queue do not impact your other queues.

Notably, you can use the same consumer with multiple queues. The queue handler that defines your consumer Worker will be invoked by the queues it is connected to.

* The `MessageBatch` that is passed to your `queue` handler includes a `queue` property with the name of the queue the batch was read from.
* This can reduce the amount of code you need to write, and allow you to process messages based on the name of your queues.

For example, a consumer configured to consume messages from multiple queues would resemble the following:

```ts
interface Env {
  // Add your bindings here
}


export default {
  async queue(batch, env, ctx): Promise<void> {
    // MessageBatch has a `queue` property we can switch on
    switch (batch.queue) {
      case "log-queue":
        // Write the batch to R2
        break;
      case "debug-queue":
        // Write the message to the console or to another queue
        break;
      case "email-reset":
        // Trigger a password reset email via an external API
        break;
      default:
        // Handle messages we haven't mentioned explicitly (write a log, push to a DLQ)
        break;
    }
  },
} satisfies ExportedHandler<Env>;
```

### Remove a consumer

To remove a queue from your project, run `wrangler queues consumer remove <queue-name> <script-name>` and then remove the desired queue below the `[[queues.consumers]]` in Wrangler file.

### Pull consumers

A queue can have a HTTP-based consumer that pulls from the queue, instead of messages being pushed to a Worker.

This consumer can be any HTTP-speaking service that can communicate over the Internet. Review the [pull consumer guide](https://developers.cloudflare.com/queues/configuration/pull-consumers/) to learn how to configure a pull-based consumer for a queue.

## Messages

A message is the object you are producing to and consuming from a queue.

Any JSON serializable object can be published to a queue. For most developers, this means either simple strings or JSON objects. You can explicitly [set the content type](#content-types) when sending a message.

Messages themselves can be [batched when delivered to a consumer](https://developers.cloudflare.com/queues/configuration/batching-retries/). By default, messages within a batch are treated as all or nothing when determining retries. If the last message in a batch fails to be processed, the entire batch will be retried. You can also choose to [explicitly acknowledge](https://developers.cloudflare.com/queues/configuration/batching-retries/) messages as they are successfully processed, and/or mark individual messages to be retried.

</page>

<page>
---
title: Wrangler commands · Cloudflare Queues docs
description: Queues Wrangler commands use REST APIs to interact with the control
  plane. This page lists the Wrangler commands for Queues.
lastUpdated: 2025-11-14T16:29:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/queues/reference/wrangler-commands/
  md: https://developers.cloudflare.com/queues/reference/wrangler-commands/index.md
---

Queues Wrangler commands use REST APIs to interact with the control plane. This page lists the Wrangler commands for Queues.

## `queues list`

List queues

* npm

  ```sh
  npx wrangler queues list
  ```

* pnpm

  ```sh
  pnpm wrangler queues list
  ```

* yarn

  ```sh
  yarn wrangler queues list
  ```

- `--page` number

  Page number for pagination

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

## `queues create`

Create a queue

* npm

  ```sh
  npx wrangler queues create [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler queues create [NAME]
  ```

* yarn

  ```sh
  yarn wrangler queues create [NAME]
  ```

- `[NAME]` string required

  The name of the queue

- `--delivery-delay-secs` number default: 0

  How long a published message should be delayed for, in seconds. Must be between 0 and 42300

- `--message-retention-period-secs` number default: 345600

  How long to retain a message in the queue, in seconds. Must be between 60 and 1209600

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

## `queues update`

Update a queue

* npm

  ```sh
  npx wrangler queues update [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler queues update [NAME]
  ```

* yarn

  ```sh
  yarn wrangler queues update [NAME]
  ```

- `[NAME]` string required

  The name of the queue

- `--delivery-delay-secs` number

  How long a published message should be delayed for, in seconds. Must be between 0 and 42300

- `--message-retention-period-secs` number

  How long to retain a message in the queue, in seconds. Must be between 60 and 1209600

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

## `queues delete`

Delete a queue

* npm

  ```sh
  npx wrangler queues delete [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler queues delete [NAME]
  ```

* yarn

  ```sh
  yarn wrangler queues delete [NAME]
  ```

- `[NAME]` string required

  The name of the queue

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

## `queues info`

Get queue information

* npm

  ```sh
  npx wrangler queues info [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler queues info [NAME]
  ```

* yarn

  ```sh
  yarn wrangler queues info [NAME]
  ```

- `[NAME]` string required

  The name of the queue

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

## `queues consumer add`

Add a Queue Worker Consumer

* npm

  ```sh
  npx wrangler queues consumer add [QUEUE-NAME] [SCRIPT-NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler queues consumer add [QUEUE-NAME] [SCRIPT-NAME]
  ```

* yarn

  ```sh
  yarn wrangler queues consumer add [QUEUE-NAME] [SCRIPT-NAME]
  ```

- `[QUEUE-NAME]` string required

  Name of the queue to configure

- `[SCRIPT-NAME]` string required

  Name of the consumer script

- `--batch-size` number

  Maximum number of messages per batch

- `--batch-timeout` number

  Maximum number of seconds to wait to fill a batch with messages

- `--message-retries` number

  Maximum number of retries for each message

- `--dead-letter-queue` string

  Queue to send messages that failed to be consumed

- `--max-concurrency` number

  The maximum number of concurrent consumer Worker invocations. Must be a positive integer

- `--retry-delay-secs` number

  The number of seconds to wait before retrying a message

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

## `queues consumer remove`

Remove a Queue Worker Consumer

* npm

  ```sh
  npx wrangler queues consumer remove [QUEUE-NAME] [SCRIPT-NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler queues consumer remove [QUEUE-NAME] [SCRIPT-NAME]
  ```

* yarn

  ```sh
  yarn wrangler queues consumer remove [QUEUE-NAME] [SCRIPT-NAME]
  ```

- `[QUEUE-NAME]` string required

  Name of the queue to configure

- `[SCRIPT-NAME]` string required

  Name of the consumer script

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

## `queues consumer http add`

Add a Queue HTTP Pull Consumer

* npm

  ```sh
  npx wrangler queues consumer http add [QUEUE-NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler queues consumer http add [QUEUE-NAME]
  ```

* yarn

  ```sh
  yarn wrangler queues consumer http add [QUEUE-NAME]
  ```

- `[QUEUE-NAME]` string required

  Name of the queue for the consumer

- `--batch-size` number

  Maximum number of messages per batch

- `--message-retries` number

  Maximum number of retries for each message

- `--dead-letter-queue` string

  Queue to send messages that failed to be consumed

- `--visibility-timeout-secs` number

  The number of seconds a message will wait for an acknowledgement before being returned to the queue.

- `--retry-delay-secs` number

  The number of seconds to wait before retrying a message

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

## `queues consumer http remove`

Remove a Queue HTTP Pull Consumer

* npm

  ```sh
  npx wrangler queues consumer http remove [QUEUE-NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler queues consumer http remove [QUEUE-NAME]
  ```

* yarn

  ```sh
  yarn wrangler queues consumer http remove [QUEUE-NAME]
  ```

- `[QUEUE-NAME]` string required

  Name of the queue for the consumer

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

## `queues consumer worker add`

Add a Queue Worker Consumer

* npm

  ```sh
  npx wrangler queues consumer worker add [QUEUE-NAME] [SCRIPT-NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler queues consumer worker add [QUEUE-NAME] [SCRIPT-NAME]
  ```

* yarn

  ```sh
  yarn wrangler queues consumer worker add [QUEUE-NAME] [SCRIPT-NAME]
  ```

- `[QUEUE-NAME]` string required

  Name of the queue to configure

- `[SCRIPT-NAME]` string required

  Name of the consumer script

- `--batch-size` number

  Maximum number of messages per batch

- `--batch-timeout` number

  Maximum number of seconds to wait to fill a batch with messages

- `--message-retries` number

  Maximum number of retries for each message

- `--dead-letter-queue` string

  Queue to send messages that failed to be consumed

- `--max-concurrency` number

  The maximum number of concurrent consumer Worker invocations. Must be a positive integer

- `--retry-delay-secs` number

  The number of seconds to wait before retrying a message

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

## `queues consumer worker remove`

Remove a Queue Worker Consumer

* npm

  ```sh
  npx wrangler queues consumer worker remove [QUEUE-NAME] [SCRIPT-NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler queues consumer worker remove [QUEUE-NAME] [SCRIPT-NAME]
  ```

* yarn

  ```sh
  yarn wrangler queues consumer worker remove [QUEUE-NAME] [SCRIPT-NAME]
  ```

- `[QUEUE-NAME]` string required

  Name of the queue to configure

- `[SCRIPT-NAME]` string required

  Name of the consumer script

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

## `queues pause-delivery`

Pause message delivery for a queue

* npm

  ```sh
  npx wrangler queues pause-delivery [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler queues pause-delivery [NAME]
  ```

* yarn

  ```sh
  yarn wrangler queues pause-delivery [NAME]
  ```

- `[NAME]` string required

  The name of the queue

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

## `queues resume-delivery`

Resume message delivery for a queue

* npm

  ```sh
  npx wrangler queues resume-delivery [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler queues resume-delivery [NAME]
  ```

* yarn

  ```sh
  yarn wrangler queues resume-delivery [NAME]
  ```

- `[NAME]` string required

  The name of the queue

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

## `queues purge`

Purge messages from a queue

* npm

  ```sh
  npx wrangler queues purge [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler queues purge [NAME]
  ```

* yarn

  ```sh
  yarn wrangler queues purge [NAME]
  ```

- `[NAME]` string required

  The name of the queue

- `--force` boolean

  Skip the confirmation dialog and forcefully purge the Queue

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

## `queues subscription create`

Create a new event subscription for a queue

* npm

  ```sh
  npx wrangler queues subscription create [QUEUE]
  ```

* pnpm

  ```sh
  pnpm wrangler queues subscription create [QUEUE]
  ```

* yarn

  ```sh
  yarn wrangler queues subscription create [QUEUE]
  ```

- `[QUEUE]` string required

  The name of the queue to create the subscription for

- `--source` string required

  The event source type

- `--events` string required

  Comma-separated list of event types to subscribe to

- `--name` string

  Name for the subscription (auto-generated if not provided)

- `--enabled` boolean default: true

  Whether the subscription should be active

- `--model-name` string

  Workers AI model name (required for workersAi.model source)

- `--worker-name` string

  Worker name (required for workersBuilds.worker source)

- `--workflow-name` string

  Workflow name (required for workflows.workflow source)

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

## `queues subscription list`

List event subscriptions for a queue

* npm

  ```sh
  npx wrangler queues subscription list [QUEUE]
  ```

* pnpm

  ```sh
  pnpm wrangler queues subscription list [QUEUE]
  ```

* yarn

  ```sh
  yarn wrangler queues subscription list [QUEUE]
  ```

- `[QUEUE]` string required

  The name of the queue to list subscriptions for

- `--page` number default: 1

  Page number for pagination

- `--per-page` number default: 20

  Number of subscriptions per page

- `--json` boolean default: false

  Output in JSON format

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

## `queues subscription get`

Get details about a specific event subscription

* npm

  ```sh
  npx wrangler queues subscription get [QUEUE]
  ```

* pnpm

  ```sh
  pnpm wrangler queues subscription get [QUEUE]
  ```

* yarn

  ```sh
  yarn wrangler queues subscription get [QUEUE]
  ```

- `[QUEUE]` string required

  The name of the queue

- `--id` string required

  The ID of the subscription to retrieve

- `--json` boolean default: false

  Output in JSON format

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

## `queues subscription delete`

Delete an event subscription from a queue

* npm

  ```sh
  npx wrangler queues subscription delete [QUEUE]
  ```

* pnpm

  ```sh
  pnpm wrangler queues subscription delete [QUEUE]
  ```

* yarn

  ```sh
  yarn wrangler queues subscription delete [QUEUE]
  ```

- `[QUEUE]` string required

  The name of the queue

- `--id` string required

  The ID of the subscription to delete

- `--force` boolean alias: --y default: false

  Skip confirmation

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

## `queues subscription update`

Update an existing event subscription

* npm

  ```sh
  npx wrangler queues subscription update [QUEUE]
  ```

* pnpm

  ```sh
  pnpm wrangler queues subscription update [QUEUE]
  ```

* yarn

  ```sh
  yarn wrangler queues subscription update [QUEUE]
  ```

- `[QUEUE]` string required

  The name of the queue

- `--id` string required

  The ID of the subscription to update

- `--name` string

  New name for the subscription

- `--events` string

  Comma-separated list of event types to subscribe to

- `--enabled` boolean

  Whether the subscription should be active

- `--json` boolean default: false

  Output in JSON format

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

<page>
---
title: Cloudflare Queues - Queues & Rate Limits · Cloudflare Queues docs
description: Example of how to use Queues to handle rate limits of external APIs.
lastUpdated: 2026-02-08T20:22:21.000Z
chatbotDeprioritize: false
tags: TypeScript
source_url:
  html: https://developers.cloudflare.com/queues/tutorials/handle-rate-limits/
  md: https://developers.cloudflare.com/queues/tutorials/handle-rate-limits/index.md
---

This tutorial explains how to use Queues to handle rate limits of external APIs by building an application that sends email notifications using [Resend](https://www.resend.com/). However, you can use this pattern to handle rate limits of any external API.

Resend is a service that allows you to send emails from your application via an API. Resend has a default [rate limit](https://resend.com/docs/api-reference/introduction#rate-limit) of two requests per second. You will use Queues to handle the rate limit of Resend.

## Prerequisites

1. Sign up for a [Cloudflare account](https://dash.cloudflare.com/sign-up/workers-and-pages).
2. Install [`Node.js`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

Node.js version manager

Use a Node version manager like [Volta](https://volta.sh/) or [nvm](https://github.com/nvm-sh/nvm) to avoid permission issues and change Node.js versions. [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/), discussed later in this guide, requires a Node version of `16.17.0` or later.

1. Sign up for [Resend](https://resend.com/) and generate an API key by following the guide on the [Resend documentation](https://resend.com/docs/dashboard/api-keys/introduction).

2. Additionally, you will need access to Cloudflare Queues.

Queues is included in the monthly subscription cost of your Workers Paid plan, and charges based on operations against your queues. A limited version of Queues is also available on the Workers Free plan. Refer to [Pricing](https://developers.cloudflare.com/queues/platform/pricing/) for more details.

Before you can use Queues, you must enable it via [the Cloudflare dashboard](https://dash.cloudflare.com/?to=/:account/workers/queues). You need a Workers Paid plan to enable Queues.

To enable Queues:

1. In the Cloudflare dashboard, go to the **Queues** page.

   [Go to **Queues**](https://dash.cloudflare.com/?to=/:account/workers/queues)

2. Select **Enable Queues**.

## 1. Create a new Workers application

To get started, create a Worker application using the [`create-cloudflare` CLI](https://github.com/cloudflare/workers-sdk/tree/main/packages/create-cloudflare). Open a terminal window and run the following command:

* npm

  ```sh
  npm create cloudflare@latest -- resend-rate-limit-queue
  ```

* yarn

  ```sh
  yarn create cloudflare resend-rate-limit-queue
  ```

* pnpm

  ```sh
  pnpm create cloudflare@latest resend-rate-limit-queue
  ```

For setup, select the following options:

* For *What would you like to start with?*, choose `Hello World example`.
* For *Which template would you like to use?*, choose `Worker only`.
* For *Which language do you want to use?*, choose `TypeScript`.
* For *Do you want to use git for version control?*, choose `Yes`.
* For *Do you want to deploy your application?*, choose `No` (we will be making some changes before deploying).

Then, go to your newly created directory:

```sh
cd resend-rate-limit-queue
```

## 2. Set up a Queue

You need to create a Queue and a binding to your Worker. Run the following command to create a Queue named `rate-limit-queue`:

```sh
npx wrangler queues create rate-limit-queue
```

```sh
Creating queue rate-limit-queue.
Created queue rate-limit-queue.
```

### Add Queue bindings to your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/)

In your Wrangler file, add the following:

* wrangler.jsonc

  ```jsonc
  {
    "queues": {
      "producers": [
        {
          "binding": "EMAIL_QUEUE",
          "queue": "rate-limit-queue"
        }
      ],
      "consumers": [
        {
          "queue": "rate-limit-queue",
          "max_batch_size": 2,
          "max_batch_timeout": 10,
          "max_retries": 3
        }
      ]
    }
  }
  ```

* wrangler.toml

  ```toml
  [[queues.producers]]
  binding = "EMAIL_QUEUE"
  queue = "rate-limit-queue"


  [[queues.consumers]]
  queue = "rate-limit-queue"
  max_batch_size = 2
  max_batch_timeout = 10
  max_retries = 3
  ```

It is important to include the `max_batch_size` of two to the consumer queue is important because the Resend API has a default rate limit of two requests per second. This batch size allows the queue to process the message in the batch size of two. If the batch size is less than two, the queue will wait for 10 seconds to collect the next message. If no more messages are available, the queue will process the message in the batch. For more information, refer to the [Batching, Retries and Delays documentation](https://developers.cloudflare.com/queues/configuration/batching-retries)

Your final Wrangler file should look similar to the example below.

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "resend-rate-limit-queue",
    "main": "src/index.ts",
    "compatibility_date": "2026-02-10",
    "compatibility_flags": [
      "nodejs_compat"
    ],
    "queues": {
      "producers": [
        {
          "binding": "EMAIL_QUEUE",
          "queue": "rate-limit-queue"
        }
      ],
      "consumers": [
        {
          "queue": "rate-limit-queue",
          "max_batch_size": 2,
          "max_batch_timeout": 10,
          "max_retries": 3
        }
      ]
    }
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "resend-rate-limit-queue"
  main = "src/index.ts"
  compatibility_date = "2026-02-10"
  compatibility_flags = [ "nodejs_compat" ]


  [[queues.producers]]
  binding = "EMAIL_QUEUE"
  queue = "rate-limit-queue"


  [[queues.consumers]]
  queue = "rate-limit-queue"
  max_batch_size = 2
  max_batch_timeout = 10
  max_retries = 3
  ```

## 3. Add bindings to environment

Add the bindings to the environment interface in `worker-configuration.d.ts`, so TypeScript correctly types the bindings. The queue is typed as `Queue<Message>`, where `Message` is defined in the following step.

```ts
interface Env {
  EMAIL_QUEUE: Queue<Message>;
}
```

## 4. Send message to the queue

The application will send a message to the queue when the Worker receives a request. For simplicity, you will send the email address as a message to the queue. A new message will be sent to the queue with a delay of one second.

```ts
export default {
  async fetch(req, env, ctx): Promise<Response> {
    try {
      await env.EMAIL_QUEUE.send(
        { email: await req.text() },
        { delaySeconds: 1 },
      );
      return new Response("Success!");
    } catch (e) {
      return new Response("Error!", { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;
```

This will accept requests to any subpath and forwards the request's body. It expects that the request body to contain only an email. In production, you should check that the request was a `POST` request. You should also avoid sending such sensitive information (email) directly to the queue. Instead, you can send a message to the queue that contains a unique identifier for the user. Then, your consumer queue can use the unique identifier to look up the email address in a database and use that to send the email.

## 5. Process the messages in the queue

After the message is sent to the queue, it will be processed by the consumer Worker. The consumer Worker will process the message and send the email.

Since you have not configured Resend yet, you will log the message to the console. After you configure Resend, you will use it to send the email.

Add the `queue()` handler as shown below:

```ts
interface Message {
  email: string;
}


export default {
  async fetch(req, env, ctx): Promise<Response> {
    try {
      await env.EMAIL_QUEUE.send(
        { email: await req.text() },
        { delaySeconds: 1 },
      );
      return new Response("Success!");
    } catch (e) {
      return new Response("Error!", { status: 500 });
    }
  },
  async queue(batch, env, ctx): Promise<void> {
    for (const message of batch.messages) {
      try {
        console.log(message.body.email);
        // After configuring Resend, you can send email
        message.ack();
      } catch (e) {
        console.error(e);
        message.retry({ delaySeconds: 5 });
      }
    }
  },
} satisfies ExportedHandler<Env, Message>;
```

The above `queue()` handler will log the email address to the console and send the email. It will also retry the message if sending the email fails. The `delaySeconds` is set to five seconds to avoid sending the email too quickly.

To test the application, run the following command:

```sh
npm run dev
```

Use the following cURL command to send a request to the application:

```sh
curl -X POST -d "test@example.com" http://localhost:8787/
```

```sh
[wrangler:inf] POST / 200 OK (2ms)
QueueMessage {
  attempts: 1,
  body: { email: 'test@example.com' },
  timestamp: 2024-09-12T13:48:07.236Z,
  id: '72a25ff18dd441f5acb6086b9ce87c8c'
}
```

## 6. Set up Resend

To call the Resend API, you need to configure the Resend API key. Create a `.dev.vars` file in the root of your project and add the following:

```txt
RESEND_API_KEY='your-resend-api-key'
```

Replace `your-resend-api-key` with your actual Resend API key.

Next, update the `Env` interface in `worker-configuration.d.ts` to include the `RESEND_API_KEY` variable.

```ts
interface Env {
  EMAIL_QUEUE: Queue<Message>;
  RESEND_API_KEY: string;
}
```

Lastly, install the [`resend` package](https://www.npmjs.com/package/resend) using the following command:

* npm

  ```sh
  npm i resend
  ```

* yarn

  ```sh
  yarn add resend
  ```

* pnpm

  ```sh
  pnpm add resend
  ```

You can now use the `RESEND_API_KEY` variable in your code.

## 7. Send email with Resend

In your `src/index.ts` file, import the Resend package and update the `queue()` handler to send the email.

```ts
import { Resend } from "resend";


interface Message {
  email: string;
}


export default {
  async fetch(req, env, ctx): Promise<Response> {
    try {
      await env.EMAIL_QUEUE.send(
        { email: await req.text() },
        { delaySeconds: 1 },
      );
      return new Response("Success!");
    } catch (e) {
      return new Response("Error!", { status: 500 });
    }
  },
  async queue(batch, env, ctx): Promise<void> {
    // Initialize Resend
    const resend = new Resend(env.RESEND_API_KEY);
    for (const message of batch.messages) {
      try {
        console.log(message.body.email);
        // send email
        const sendEmail = await resend.emails.send({
          from: "onboarding@resend.dev",
          to: [message.body.email],
          subject: "Hello World",
          html: "<strong>Sending an email from Worker!</strong>",
        });


        // check if the email failed
        if (sendEmail.error) {
          console.error(sendEmail.error);
          message.retry({ delaySeconds: 5 });
        } else {
          // if success, ack the message
          message.ack();
        }
        message.ack();
      } catch (e) {
        console.error(e);
        message.retry({ delaySeconds: 5 });
      }
    }
  },
} satisfies ExportedHandler<Env, Message>;
```

The `queue()` handler will now send the email using the Resend API. It also checks if sending the email failed and will retry the message.

The final script is included below:

```ts
import { Resend } from "resend";


interface Message {
  email: string;
}


export default {
  async fetch(req, env, ctx): Promise<Response> {
    try {
      await env.EMAIL_QUEUE.send(
        { email: await req.text() },
        { delaySeconds: 1 },
      );
      return new Response("Success!");
    } catch (e) {
      return new Response("Error!", { status: 500 });
    }
  },
  async queue(batch, env, ctx): Promise<void> {
    // Initialize Resend
    const resend = new Resend(env.RESEND_API_KEY);
    for (const message of batch.messages) {
      try {
        // send email
        const sendEmail = await resend.emails.send({
          from: "onboarding@resend.dev",
          to: [message.body.email],
          subject: "Hello World",
          html: "<strong>Sending an email from Worker!</strong>",
        });


        // check if the email failed
        if (sendEmail.error) {
          console.error(sendEmail.error);
          message.retry({ delaySeconds: 5 });
        } else {
          // if success, ack the message
          message.ack();
        }
      } catch (e) {
        console.error(e);
        message.retry({ delaySeconds: 5 });
      }
    }
  },
} satisfies ExportedHandler<Env, Message>;
```

To test the application, start the development server using the following command:

```sh
npm run dev
```

Use the following cURL command to send a request to the application:

```sh
curl -X POST -d "delivered@resend.dev" http://localhost:8787/
```

On the Resend dashboard, you should see that the email was sent to the provided email address.

## 8. Deploy your Worker

To deploy your Worker, run the following command:

```sh
npx wrangler deploy
```

Lastly, add the Resend API key using the following command:

```sh
npx wrangler secret put RESEND_API_KEY
```

Enter the value of your API key. Your API key will get added to your project. You can now use the `RESEND_API_KEY` variable in your code.

You have successfully created a Worker which can send emails using the Resend API respecting rate limits.

To test your Worker, you could use the following cURL request. Replace `<YOUR_WORKER_URL>` with the URL of your deployed Worker.

```bash
curl -X POST -d "delivered@resend.dev" <YOUR_WORKER_URL>
```

Refer to the [GitHub repository](https://github.com/harshil1712/queues-rate-limit) for the complete code for this tutorial. If you are using [Hono](https://hono.dev/), you can refer to the [Hono example](https://github.com/harshil1712/resend-rate-limit-demo).

## Related resources

* [How Queues works](https://developers.cloudflare.com/queues/reference/how-queues-works/)
* [Queues Batching and Retries](https://developers.cloudflare.com/queues/configuration/batching-retries/)
* [Resend](https://resend.com/docs/)

</page>

<page>
---
title: Cloudflare Queues - Queues & Browser Rendering · Cloudflare Queues docs
description: Example of how to use Queues and Browser Rendering to power a web crawler.
lastUpdated: 2026-02-08T20:22:21.000Z
chatbotDeprioritize: false
tags: TypeScript
source_url:
  html: https://developers.cloudflare.com/queues/tutorials/web-crawler-with-browser-rendering/
  md: https://developers.cloudflare.com/queues/tutorials/web-crawler-with-browser-rendering/index.md
---

This tutorial explains how to build and deploy a web crawler with Queues, [Browser Rendering](https://developers.cloudflare.com/browser-rendering/), and [Puppeteer](https://developers.cloudflare.com/browser-rendering/puppeteer/).

Puppeteer is a high-level library used to automate interactions with Chrome/Chromium browsers. On each submitted page, the crawler will find the number of links to `cloudflare.com` and take a screenshot of the site, saving results to [Workers KV](https://developers.cloudflare.com/kv/).

You can use Puppeteer to request all images on a page, save the colors used on a site, and more.

## Prerequisites

1. Sign up for a [Cloudflare account](https://dash.cloudflare.com/sign-up/workers-and-pages).
2. Install [`Node.js`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

Node.js version manager

Use a Node version manager like [Volta](https://volta.sh/) or [nvm](https://github.com/nvm-sh/nvm) to avoid permission issues and change Node.js versions. [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/), discussed later in this guide, requires a Node version of `16.17.0` or later.

## 1. Create new Workers application

To get started, create a Worker application using the [`create-cloudflare` CLI](https://github.com/cloudflare/workers-sdk/tree/main/packages/create-cloudflare). Open a terminal window and run the following command:

* npm

  ```sh
  npm create cloudflare@latest -- queues-web-crawler
  ```

* yarn

  ```sh
  yarn create cloudflare queues-web-crawler
  ```

* pnpm

  ```sh
  pnpm create cloudflare@latest queues-web-crawler
  ```

For setup, select the following options:

* For *What would you like to start with?*, choose `Hello World example`.
* For *Which template would you like to use?*, choose `Worker only`.
* For *Which language do you want to use?*, choose `TypeScript`.
* For *Do you want to use git for version control?*, choose `Yes`.
* For *Do you want to deploy your application?*, choose `No` (we will be making some changes before deploying).

Then, move into your newly created directory:

```sh
cd queues-web-crawler
```

## 2. Create KV namespace

We need to create a KV store. This can be done through the Cloudflare dashboard or the Wrangler CLI. For this tutorial, we will use the Wrangler CLI.

* npm

  ```sh
  npx wrangler kv namespace create crawler_links
  ```

* yarn

  ```sh
  yarn wrangler kv namespace create crawler_links
  ```

* pnpm

  ```sh
  pnpm wrangler kv namespace create crawler_links
  ```

- npm

  ```sh
  npx wrangler kv namespace create crawler_screenshots
  ```

- yarn

  ```sh
  yarn wrangler kv namespace create crawler_screenshots
  ```

- pnpm

  ```sh
  pnpm wrangler kv namespace create crawler_screenshots
  ```

```sh
🌀 Creating namespace with title "web-crawler-crawler-links"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
[[kv_namespaces]]
binding = "crawler_links"
id = "<GENERATED_NAMESPACE_ID>"


🌀 Creating namespace with title "web-crawler-crawler-screenshots"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
[[kv_namespaces]]
binding = "crawler_screenshots"
id = "<GENERATED_NAMESPACE_ID>"
```

### Add KV bindings to the [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/)

Then, in your Wrangler file, add the following with the values generated in the terminal:

* wrangler.jsonc

  ```jsonc
  {
    "kv_namespaces": [
      {
        "binding": "CRAWLER_SCREENSHOTS_KV",
        "id": "<GENERATED_NAMESPACE_ID>"
      },
      {
        "binding": "CRAWLER_LINKS_KV",
        "id": "<GENERATED_NAMESPACE_ID>"
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  [[kv_namespaces]]
  binding = "CRAWLER_SCREENSHOTS_KV"
  id = "<GENERATED_NAMESPACE_ID>"


  [[kv_namespaces]]
  binding = "CRAWLER_LINKS_KV"
  id = "<GENERATED_NAMESPACE_ID>"
  ```

## 3. Set up Browser Rendering

Now, you need to set up your Worker for Browser Rendering.

In your current directory, install Cloudflare's [fork of Puppeteer](https://developers.cloudflare.com/browser-rendering/puppeteer/) and also [robots-parser](https://www.npmjs.com/package/robots-parser):

* npm

  ```sh
  npm i -D @cloudflare/puppeteer
  ```

* yarn

  ```sh
  yarn add -D @cloudflare/puppeteer
  ```

* pnpm

  ```sh
  pnpm add -D @cloudflare/puppeteer
  ```

- npm

  ```sh
  npm i robots-parser
  ```

- yarn

  ```sh
  yarn add robots-parser
  ```

- pnpm

  ```sh
  pnpm add robots-parser
  ```

Then, add a Browser Rendering binding. Adding a Browser Rendering binding gives the Worker access to a headless Chromium instance you will control with Puppeteer.

* wrangler.jsonc

  ```jsonc
  {
    "browser": {
      "binding": "CRAWLER_BROWSER"
    }
  }
  ```

* wrangler.toml

  ```toml
  [browser]
  binding = "CRAWLER_BROWSER"
  ```

## 4. Set up a Queue

Now, we need to set up the Queue.

* npm

  ```sh
  npx wrangler queues create queues-web-crawler
  ```

* yarn

  ```sh
  yarn wrangler queues create queues-web-crawler
  ```

* pnpm

  ```sh
  pnpm wrangler queues create queues-web-crawler
  ```

```txt
Creating queue queues-web-crawler.
Created queue queues-web-crawler.
```

### Add Queue bindings to Wrangler configuration

Then, in your Wrangler file, add the following:

* wrangler.jsonc

  ```jsonc
  {
    "queues": {
      "consumers": [
        {
          "queue": "queues-web-crawler",
          "max_batch_timeout": 60
        }
      ],
      "producers": [
        {
          "queue": "queues-web-crawler",
          "binding": "CRAWLER_QUEUE"
        }
      ]
    }
  }
  ```

* wrangler.toml

  ```toml
  [[queues.consumers]]
  queue = "queues-web-crawler"
  max_batch_timeout = 60


  [[queues.producers]]
  queue = "queues-web-crawler"
  binding = "CRAWLER_QUEUE"
  ```

Adding the `max_batch_timeout` of 60 seconds to the consumer queue is important because Browser Rendering has a limit of two new browsers per minute per account. This timeout waits up to a minute before collecting queue messages into a batch. The Worker will then remain under this browser invocation limit.

Your final Wrangler file should look similar to the one below.

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "web-crawler",
    "main": "src/index.ts",
    "compatibility_date": "2026-02-10",
    "compatibility_flags": [
      "nodejs_compat"
    ],
    "kv_namespaces": [
      {
        "binding": "CRAWLER_SCREENSHOTS_KV",
        "id": "<GENERATED_NAMESPACE_ID>"
      },
      {
        "binding": "CRAWLER_LINKS_KV",
        "id": "<GENERATED_NAMESPACE_ID>"
      }
    ],
    "browser": {
      "binding": "CRAWLER_BROWSER"
    },
    "queues": {
      "consumers": [
        {
          "queue": "queues-web-crawler",
          "max_batch_timeout": 60
        }
      ],
      "producers": [
        {
          "queue": "queues-web-crawler",
          "binding": "CRAWLER_QUEUE"
        }
      ]
    }
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "web-crawler"
  main = "src/index.ts"
  compatibility_date = "2026-02-10"
  compatibility_flags = [ "nodejs_compat" ]


  [[kv_namespaces]]
  binding = "CRAWLER_SCREENSHOTS_KV"
  id = "<GENERATED_NAMESPACE_ID>"


  [[kv_namespaces]]
  binding = "CRAWLER_LINKS_KV"
  id = "<GENERATED_NAMESPACE_ID>"


  [browser]
  binding = "CRAWLER_BROWSER"


  [[queues.consumers]]
  queue = "queues-web-crawler"
  max_batch_timeout = 60


  [[queues.producers]]
  queue = "queues-web-crawler"
  binding = "CRAWLER_QUEUE"
  ```

## 5. Add bindings to environment

Add the bindings to the environment interface in `src/index.ts`, so TypeScript correctly types the bindings. The queue is typed as `Queue<Message>`, where `Message` is defined in the following step.

```ts
import type { BrowserWorker } from "@cloudflare/puppeteer";


export interface Env {
  CRAWLER_QUEUE: Queue<Message>;
  CRAWLER_SCREENSHOTS_KV: KVNamespace;
  CRAWLER_LINKS_KV: KVNamespace;
  CRAWLER_BROWSER: BrowserWorker;
}
```

## 6. Submit links to crawl

Add a `fetch()` handler to the Worker to submit links to crawl.

```ts
type Message = {
  url: string;
};


export interface Env {
  CRAWLER_QUEUE: Queue<Message>;
  // ... etc.
}


export default {
  async fetch(req, env, ctx): Promise<Response> {
    await env.CRAWLER_QUEUE.send({ url: await req.text() });
    return new Response("Success!");
  },
} satisfies ExportedHandler<Env>;
```

This will accept requests to any subpath and forwards the request's body to be crawled. It expects that the request body only contains a URL. In production, you should check that the request was a `POST` request and contains a well-formed URL in its body. This has been omitted for simplicity.

## 7. Crawl with Puppeteer

Add a `queue()` handler to the Worker to process the links you send.

```ts
import puppeteer from "@cloudflare/puppeteer";
import robotsParser from "robots-parser";


async queue(batch, env, ctx): Promise<void> {
  let browser: puppeteer.Browser | null = null;
  try {
    browser = await puppeteer.launch(env.CRAWLER_BROWSER);
  } catch {
    batch.retryAll();
  return;
  }


  for (const message of batch.messages) {
    const { url } = message.body;


    let isAllowed = true;
    try {
      const robotsTextPath = new URL(url).origin + "/robots.txt";
      const response = await fetch(robotsTextPath);


      const robots = robotsParser(robotsTextPath, await response.text());
      isAllowed = robots.isAllowed(url) ?? true; // respect robots.txt!
    } catch {}


    if (!isAllowed) {
      message.ack();
      continue;
    }


  // TODO: crawl!
    message.ack();
  }


  await browser.close();
},
```

This is a skeleton for the crawler. It launches the Puppeteer browser and iterates through the Queue's received messages. It fetches the site's `robots.txt` and uses `robots-parser` to check that this site allows crawling. If crawling is not allowed, the message is `ack`'ed, removing it from the Queue. If crawling is allowed, you can continue to crawl the site.

The `puppeteer.launch()` is wrapped in a `try...catch` to allow the whole batch to be retried if the browser launch fails. The browser launch may fail due to going over the limit for number of browsers per account.

```ts
type Result = {
  numCloudflareLinks: number;
  screenshot: ArrayBuffer;
};


const crawlPage = async (url: string): Promise<Result> => {
  const page = await (browser as puppeteer.Browser).newPage();


  await page.goto(url, {
    waitUntil: "load",
  });


  const numCloudflareLinks = await page.$$eval("a", (links) => {
    links = links.filter((link) => {
      try {
        return new URL(link.href).hostname.includes("cloudflare.com");
      } catch {
        return false;
      }
    });
    return links.length;
  });


  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  });


  return {
    numCloudflareLinks,
    screenshot: ((await page.screenshot({ fullPage: true })) as Buffer).buffer,
  };
};
```

This helper function opens a new page in Puppeteer and navigates to the provided URL. `numCloudflareLinks` uses Puppeteer's `$$eval` (equivalent to `document.querySelectorAll`) to find the number of links to a `cloudflare.com` page. Checking if the link's `href` is to a `cloudflare.com` page is wrapped in a `try...catch` to handle cases where `href`s may not be URLs.

Then, the function sets the browser viewport size and takes a screenshot of the full page. The screenshot is returned as a `Buffer` so it can be converted to an `ArrayBuffer` and written to KV.

To enable recursively crawling links, add a snippet after checking the number of Cloudflare links to send messages recursively from the queue consumer to the queue itself. Recursing too deep, as is possible with crawling, will cause a Durable Object `Subrequest depth limit exceeded.` error. If one occurs, it is caught, but the links are not retried.

```ts
// const numCloudflareLinks = await page.$$eval("a", (links) => { ...


await page.$$eval("a", async (links) => {
  const urls: MessageSendRequest<Message>[] = links.map((link) => {
    return {
      body: {
        url: link.href,
      },
    };
  });
  try {
    await env.CRAWLER_QUEUE.sendBatch(urls);
  } catch {} // do nothing, likely hit subrequest limit
});


// await page.setViewport({ ...
```

Then, in the `queue` handler, call `crawlPage` on the URL.

```ts
// in the `queue` handler:
// ...
if (!isAllowed) {
  message.ack();
  continue;
}


try {
  const { numCloudflareLinks, screenshot } = await crawlPage(url);
  const timestamp = new Date().getTime();
  const resultKey = `${encodeURIComponent(url)}-${timestamp}`;
  await env.CRAWLER_LINKS_KV.put(resultKey, numCloudflareLinks.toString(), {
    metadata: { date: timestamp },
  });
  await env.CRAWLER_SCREENSHOTS_KV.put(resultKey, screenshot, {
    metadata: { date: timestamp },
  });
  message.ack();
} catch {
  message.retry();
}


// ...
```

This snippet saves the results from `crawlPage` into the appropriate KV namespaces. If an unexpected error occurred, the URL will be retried and resent to the queue again.

Saving the timestamp of the crawl in KV helps you avoid crawling too frequently.

Add a snippet before checking `robots.txt` to check KV for a crawl within the last hour. This lists all KV keys beginning with the same URL (crawls of the same page), and check if any crawls have been done within the last hour. If any crawls have been done within the last hour, the message is `ack`'ed and not retried.

```ts
type KeyMetadata = {
  date: number;
};


// in the `queue` handler:
// ...
for (const message of batch.messages) {
  const sameUrlCrawls = await env.CRAWLER_LINKS_KV.list({
    prefix: `${encodeURIComponent(url)}`,
  });


  let shouldSkip = false;
  for (const key of sameUrlCrawls.keys) {
    if (timestamp - (key.metadata as KeyMetadata)?.date < 60 * 60 * 1000) {
      // if crawled in last hour, skip
      message.ack();
      shouldSkip = true;
      break;
    }
  }
  if (shouldSkip) {
    continue;
  }


  let isAllowed = true;
  // ...
```

The final script is included below.

```ts
import puppeteer, { BrowserWorker } from "@cloudflare/puppeteer";
import robotsParser from "robots-parser";


type Message = {
  url: string;
};


export interface Env {
  CRAWLER_QUEUE: Queue<Message>;
  CRAWLER_SCREENSHOTS_KV: KVNamespace;
  CRAWLER_LINKS_KV: KVNamespace;
  CRAWLER_BROWSER: BrowserWorker;
}


type Result = {
  numCloudflareLinks: number;
  screenshot: ArrayBuffer;
};


type KeyMetadata = {
  date: number;
};


export default {
  async fetch(req, env, ctx): Promise<Response> {
    // util endpoint for testing purposes
    await env.CRAWLER_QUEUE.send({ url: await req.text() });
    return new Response("Success!");
  },
  async queue(batch, env, ctx): Promise<void> {
    const crawlPage = async (url: string): Promise<Result> => {
      const page = await (browser as puppeteer.Browser).newPage();


      await page.goto(url, {
        waitUntil: "load",
      });


      const numCloudflareLinks = await page.$$eval("a", (links) => {
        links = links.filter((link) => {
          try {
            return new URL(link.href).hostname.includes("cloudflare.com");
          } catch {
            return false;
          }
        });
        return links.length;
      });


      // to crawl recursively - uncomment this!
      /*await page.$$eval("a", async (links) => {
        const urls: MessageSendRequest<Message>[] = links.map((link) => {
          return {
            body: {
              url: link.href,
            },
          };
        });
        try {
          await env.CRAWLER_QUEUE.sendBatch(urls);
        } catch {} // do nothing, might've hit subrequest limit
      });*/


      await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
      });


      return {
        numCloudflareLinks,
        screenshot: ((await page.screenshot({ fullPage: true })) as Buffer)
          .buffer,
      };
    };


    let browser: puppeteer.Browser | null = null;
    try {
      browser = await puppeteer.launch(env.CRAWLER_BROWSER);
    } catch {
      batch.retryAll();
      return;
    }


    for (const message of batch.messages) {
      const { url } = message.body;
      const timestamp = new Date().getTime();
      const resultKey = `${encodeURIComponent(url)}-${timestamp}`;


      const sameUrlCrawls = await env.CRAWLER_LINKS_KV.list({
        prefix: `${encodeURIComponent(url)}`,
      });


      let shouldSkip = false;
      for (const key of sameUrlCrawls.keys) {
        if (timestamp - (key.metadata as KeyMetadata)?.date < 60 * 60 * 1000) {
          // if crawled in last hour, skip
          message.ack();
          shouldSkip = true;
          break;
        }
      }
      if (shouldSkip) {
        continue;
      }


      let isAllowed = true;
      try {
        const robotsTextPath = new URL(url).origin + "/robots.txt";
        const response = await fetch(robotsTextPath);


        const robots = robotsParser(robotsTextPath, await response.text());
        isAllowed = robots.isAllowed(url) ?? true; // respect robots.txt!
      } catch {}


      if (!isAllowed) {
        message.ack();
        continue;
      }


      try {
        const { numCloudflareLinks, screenshot } = await crawlPage(url);
        await env.CRAWLER_LINKS_KV.put(
          resultKey,
          numCloudflareLinks.toString(),
          { metadata: { date: timestamp } },
        );
        await env.CRAWLER_SCREENSHOTS_KV.put(resultKey, screenshot, {
          metadata: { date: timestamp },
        });
        message.ack();
      } catch {
        message.retry();
      }
    }


    await browser.close();
  },
} satisfies ExportedHandler<Env, Message>;
```

## 8. Deploy your Worker

To deploy your Worker, run the following command:

* npm

  ```sh
  npx wrangler deploy
  ```

* yarn

  ```sh
  yarn wrangler deploy
  ```

* pnpm

  ```sh
  pnpm wrangler deploy
  ```

You have successfully created a Worker which can submit URLs to a queue for crawling and save results to Workers KV.

To test your Worker, you could use the following cURL request to take a screenshot of this documentation page.

```bash
curl <YOUR_WORKER_URL> \
  -H "Content-Type: application/json" \
  -d 'https://developers.cloudflare.com/queues/tutorials/web-crawler-with-browser-rendering/'
```

Refer to the [GitHub repository for the complete tutorial](https://github.com/cloudflare/queues-web-crawler), including a front end deployed with Pages to submit URLs and view crawler results.

## Related resources

* [How Queues works](https://developers.cloudflare.com/queues/reference/how-queues-works/)
* [Queues Batching and Retries](https://developers.cloudflare.com/queues/configuration/batching-retries/)
* [Browser Rendering](https://developers.cloudflare.com/browser-rendering/)
* [Puppeteer Examples](https://github.com/puppeteer/puppeteer/tree/main/examples)

</page>
