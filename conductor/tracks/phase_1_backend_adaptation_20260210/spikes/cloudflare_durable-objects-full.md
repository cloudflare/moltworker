<page>
---
title: Overview · Cloudflare Durable Objects docs
description: Durable Objects provide a building block for stateful applications
  and distributed systems.
lastUpdated: 2026-01-06T18:52:43.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/
  md: https://developers.cloudflare.com/durable-objects/index.md
---

Create AI agents, collaborative applications, real-time interactions like chat, and more without needing to coordinate state, have separate storage, or manage infrastructure.

Available on Free and Paid plans

Durable Objects provide a building block for stateful applications and distributed systems.

Use Durable Objects to build applications that need coordination among multiple clients, like collaborative editing tools, interactive chat, multiplayer games, live notifications, and deep distributed systems, without requiring you to build serialization and coordination primitives on your own.

[Get started](https://developers.cloudflare.com/durable-objects/get-started/)

Note

SQLite-backed Durable Objects are now available on the Workers Free plan with these [limits](https://developers.cloudflare.com/durable-objects/platform/pricing/).

[SQLite storage](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/) and corresponding [Storage API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/) methods like `sql.exec` have moved from beta to general availability. New Durable Object classes should use wrangler configuration for [SQLite storage](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#wrangler-configuration-for-sqlite-durable-objects).

### What are Durable Objects?

A Durable Object is a special kind of [Cloudflare Worker](https://developers.cloudflare.com/workers/) which uniquely combines compute with storage. Like a Worker, a Durable Object is automatically provisioned geographically close to where it is first requested, starts up quickly when needed, and shuts down when idle. You can have millions of them around the world. However, unlike regular Workers:

* Each Durable Object has a **globally-unique name**, which allows you to send requests to a specific object from anywhere in the world. Thus, a Durable Object can be used to coordinate between multiple clients who need to work together.
* Each Durable Object has some **durable storage** attached. Since this storage lives together with the object, it is strongly consistent yet fast to access.

Therefore, Durable Objects enable **stateful** serverless applications.

For more information, refer to the full [What are Durable Objects?](https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/) page.

***

## Features

### In-memory State

Learn how Durable Objects coordinate connections among multiple clients or events.

[Use In-memory State](https://developers.cloudflare.com/durable-objects/reference/in-memory-state/)

### Storage API

Learn how Durable Objects provide transactional, strongly consistent, and serializable storage.

[Use Storage API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/)

### WebSocket Hibernation

Learn how WebSocket Hibernation allows you to manage the connections of multiple clients at scale.

[Use WebSocket Hibernation](https://developers.cloudflare.com/durable-objects/best-practices/websockets/#websocket-hibernation-api)

### Durable Objects Alarms

Learn how to use alarms to trigger a Durable Object and perform compute in the future at customizable intervals.

[Use Durable Objects Alarms](https://developers.cloudflare.com/durable-objects/api/alarms/)

***

## Related products

**[Workers](https://developers.cloudflare.com/workers/)**

Cloudflare Workers provides a serverless execution environment that allows you to create new applications or augment existing ones without configuring or maintaining infrastructure.

**[D1](https://developers.cloudflare.com/d1/)**

D1 is Cloudflare's SQL-based native serverless database. Create a database by importing data or defining your tables and writing your queries within a Worker or through the API.

**[R2](https://developers.cloudflare.com/r2/)**

Cloudflare R2 Storage allows developers to store large amounts of unstructured data without the costly egress bandwidth fees associated with typical cloud storage services.

***

## More resources

[Limits](https://developers.cloudflare.com/durable-objects/platform/limits/)

Learn about Durable Objects limits.

[Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)

Learn about Durable Objects pricing.

[Storage options](https://developers.cloudflare.com/workers/platform/storage-options/)

Learn more about storage and database options you can build with Workers.

[Developer Discord](https://discord.cloudflare.com)

Connect with the Workers community on Discord to ask questions, show what you are building, and discuss the platform with other developers.

[@CloudflareDev](https://x.com/cloudflaredev)

Follow @CloudflareDev on Twitter to learn about product announcements, and what is new in Cloudflare Developer Platform.

</page>

<page>
---
title: 404 - Page Not Found · Cloudflare Durable Objects docs
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/404/
  md: https://developers.cloudflare.com/durable-objects/404/index.md
---

# 404

Check the URL, try using our [search](https://developers.cloudflare.com/search/) or try our LLM-friendly [llms.txt directory](https://developers.cloudflare.com/llms.txt).

</page>

<page>
---
title: Workers Binding API · Cloudflare Durable Objects docs
lastUpdated: 2025-01-31T11:01:46.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/durable-objects/api/
  md: https://developers.cloudflare.com/durable-objects/api/index.md
---

* [Durable Object Base Class](https://developers.cloudflare.com/durable-objects/api/base/)
* [Durable Object Container](https://developers.cloudflare.com/durable-objects/api/container/)
* [Durable Object Namespace](https://developers.cloudflare.com/durable-objects/api/namespace/)
* [Durable Object ID](https://developers.cloudflare.com/durable-objects/api/id/)
* [Durable Object Stub](https://developers.cloudflare.com/durable-objects/api/stub/)
* [Durable Object State](https://developers.cloudflare.com/durable-objects/api/state/)
* [SQLite-backed Durable Object Storage](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/)
* [KV-backed Durable Object Storage (Legacy)](https://developers.cloudflare.com/durable-objects/api/legacy-kv-storage-api/)
* [Alarms](https://developers.cloudflare.com/durable-objects/api/alarms/)
* [WebGPU](https://developers.cloudflare.com/durable-objects/api/webgpu/)
* [Rust API](https://github.com/cloudflare/workers-rs?tab=readme-ov-file#durable-objects)

</page>

<page>
---
title: Best practices · Cloudflare Durable Objects docs
lastUpdated: 2025-01-31T11:01:46.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/durable-objects/best-practices/
  md: https://developers.cloudflare.com/durable-objects/best-practices/index.md
---

* [Rules of Durable Objects](https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/)
* [Invoke methods](https://developers.cloudflare.com/durable-objects/best-practices/create-durable-object-stubs-and-send-requests/)
* [Access Durable Objects Storage](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/)
* [Use WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)
* [Error handling](https://developers.cloudflare.com/durable-objects/best-practices/error-handling/)

</page>

<page>
---
title: Concepts · Cloudflare Durable Objects docs
lastUpdated: 2025-07-30T08:17:23.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/durable-objects/concepts/
  md: https://developers.cloudflare.com/durable-objects/concepts/index.md
---

* [What are Durable Objects?](https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/)
* [Lifecycle of a Durable Object](https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/)

</page>

<page>
---
title: Demos and architectures · Cloudflare Durable Objects docs
description: Learn how you can use a Durable Object within your existing
  application and architecture.
lastUpdated: 2025-10-13T13:40:40.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/demos/
  md: https://developers.cloudflare.com/durable-objects/demos/index.md
---

Learn how you can use a Durable Object within your existing application and architecture.

## Demos

Explore the following demo applications for Durable Objects.

* [Cloudflare Workers Chat Demo:](https://github.com/cloudflare/workers-chat-demo) This is a demo app written on Cloudflare Workers utilizing Durable Objects to implement real-time chat with stored history.
* [Wildebeest:](https://github.com/cloudflare/wildebeest) Wildebeest is an ActivityPub and Mastodon-compatible server whose goal is to allow anyone to operate their Fediverse server and identity on their domain without needing to keep infrastructure, with minimal setup and maintenance, and running in minutes.
* [Multiplayer Doom Workers:](https://github.com/cloudflare/doom-workers) A WebAssembly Doom port with multiplayer support running on top of Cloudflare's global network using Workers, WebSockets, Pages, and Durable Objects.

## Reference architectures

Explore the following reference architectures that use Durable Objects:

[Fullstack applications](https://developers.cloudflare.com/reference-architecture/diagrams/serverless/fullstack-application/)

[A practical example of how these services come together in a real fullstack application architecture.](https://developers.cloudflare.com/reference-architecture/diagrams/serverless/fullstack-application/)

[Control and data plane architectural pattern for Durable Objects](https://developers.cloudflare.com/reference-architecture/diagrams/storage/durable-object-control-data-plane-pattern/)

[Separate the control plane from the data plane of your application to achieve great performance and reliability without compromising on functionality.](https://developers.cloudflare.com/reference-architecture/diagrams/storage/durable-object-control-data-plane-pattern/)

</page>

<page>
---
title: REST API · Cloudflare Durable Objects docs
lastUpdated: 2025-01-31T11:01:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/durable-objects-rest-api/
  md: https://developers.cloudflare.com/durable-objects/durable-objects-rest-api/index.md
---


</page>

<page>
---
title: Examples · Cloudflare Durable Objects docs
description: Explore the following examples for Durable Objects.
lastUpdated: 2025-08-14T13:46:41.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/durable-objects/examples/
  md: https://developers.cloudflare.com/durable-objects/examples/index.md
---

Explore the following examples for Durable Objects.

[Use ReadableStream with Durable Object and Workers](https://developers.cloudflare.com/durable-objects/examples/readable-stream/)

[Stream ReadableStream from Durable Objects.](https://developers.cloudflare.com/durable-objects/examples/readable-stream/)

[Use RpcTarget class to handle Durable Object metadata](https://developers.cloudflare.com/durable-objects/examples/reference-do-name-using-init/)

[Access the name from within a Durable Object using RpcTarget.](https://developers.cloudflare.com/durable-objects/examples/reference-do-name-using-init/)

[Durable Object Time To Live](https://developers.cloudflare.com/durable-objects/examples/durable-object-ttl/)

[Use the Durable Objects Alarms API to implement a Time To Live (TTL) for Durable Object instances.](https://developers.cloudflare.com/durable-objects/examples/durable-object-ttl/)

[Build a WebSocket server with WebSocket Hibernation](https://developers.cloudflare.com/durable-objects/examples/websocket-hibernation-server/)

[Build a WebSocket server using WebSocket Hibernation on Durable Objects and Workers.](https://developers.cloudflare.com/durable-objects/examples/websocket-hibernation-server/)

[Build a WebSocket server](https://developers.cloudflare.com/durable-objects/examples/websocket-server/)

[Build a WebSocket server using Durable Objects and Workers.](https://developers.cloudflare.com/durable-objects/examples/websocket-server/)

[Use the Alarms API](https://developers.cloudflare.com/durable-objects/examples/alarms-api/)

[Use the Durable Objects Alarms API to batch requests to a Durable Object.](https://developers.cloudflare.com/durable-objects/examples/alarms-api/)

[Durable Objects - Use KV within Durable Objects](https://developers.cloudflare.com/durable-objects/examples/use-kv-from-durable-objects/)

[Read and write to/from KV within a Durable Object](https://developers.cloudflare.com/durable-objects/examples/use-kv-from-durable-objects/)

[Testing Durable Objects](https://developers.cloudflare.com/durable-objects/examples/testing-with-durable-objects/)

[Write tests for Durable Objects using the Workers Vitest integration.](https://developers.cloudflare.com/durable-objects/examples/testing-with-durable-objects/)

[Build a counter](https://developers.cloudflare.com/durable-objects/examples/build-a-counter/)

[Build a counter using Durable Objects and Workers with RPC methods.](https://developers.cloudflare.com/durable-objects/examples/build-a-counter/)

[Durable Object in-memory state](https://developers.cloudflare.com/durable-objects/examples/durable-object-in-memory-state/)

[Create a Durable Object that stores the last location it was accessed from in-memory.](https://developers.cloudflare.com/durable-objects/examples/durable-object-in-memory-state/)

</page>

<page>
---
title: Getting started · Cloudflare Durable Objects docs
description: "This guide will instruct you through:"
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/get-started/
  md: https://developers.cloudflare.com/durable-objects/get-started/index.md
---

This guide will instruct you through:

* Writing a JavaScript class that defines a Durable Object.
* Using Durable Objects SQL API to query a Durable Object's private, embedded SQLite database.
* Instantiating and communicating with a Durable Object from another Worker.
* Deploying a Durable Object and a Worker that communicates with a Durable Object.

If you wish to learn more about Durable Objects, refer to [What are Durable Objects?](https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/).

## Quick start

If you want to skip the steps and get started quickly, click on the button below.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/hello-world-do-template)

This creates a repository in your GitHub account and deploys the application to Cloudflare Workers. Use this option if you are familiar with Cloudflare Workers, and wish to skip the step-by-step guidance.

You may wish to manually follow the steps if you are new to Cloudflare Workers.

## Prerequisites

1. Sign up for a [Cloudflare account](https://dash.cloudflare.com/sign-up/workers-and-pages).
2. Install [`Node.js`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

Node.js version manager

Use a Node version manager like [Volta](https://volta.sh/) or [nvm](https://github.com/nvm-sh/nvm) to avoid permission issues and change Node.js versions. [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/), discussed later in this guide, requires a Node version of `16.17.0` or later.

## 1. Create a Worker project

You will access your Durable Object from a [Worker](https://developers.cloudflare.com/workers/). Your Worker application is an interface to interact with your Durable Object.

To create a Worker project, run:

* npm

  ```sh
  npm create cloudflare@latest -- durable-object-starter
  ```

* yarn

  ```sh
  yarn create cloudflare durable-object-starter
  ```

* pnpm

  ```sh
  pnpm create cloudflare@latest durable-object-starter
  ```

Running `create cloudflare@latest` will install [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/), the Workers CLI. You will use Wrangler to test and deploy your project.

For setup, select the following options:

* For *What would you like to start with?*, choose `Hello World example`.
* For *Which template would you like to use?*, choose `Worker + Durable Objects`.
* For *Which language do you want to use?*, choose `TypeScript`.
* For *Do you want to use git for version control?*, choose `Yes`.
* For *Do you want to deploy your application?*, choose `No` (we will be making some changes before deploying).

This will create a new directory, which will include either a `src/index.js` or `src/index.ts` file to write your code and a [`wrangler.jsonc`](https://developers.cloudflare.com/workers/wrangler/configuration/) configuration file.

Move into your new directory:

```sh
cd durable-object-starter
```

Adding a Durable Object to an existing Worker

To add a Durable Object to an existing Worker, you need to:

* Modify the code of the existing Worker to include the following:

  ```ts
  export class MyDurableObject extends DurableObject<Env> {
    constructor(ctx: DurableObjectState, env: Env) {
      // Required, as we're extending the base class.
      super(ctx, env)
    }


    {/* Define your Durable Object methods here */}


  }


  export default {
    async fetch(request, env, ctx): Promise<Response> {
      const stub = env.MY_DURABLE_OBJECT.getByName(new URL(request.url).pathname);


      {/* Access your Durable Object methods here */}


    },
  } satisfies ExportedHandler<Env>;
  ```

* Update the Wrangler configuration file of your existing Worker to bind the Durable Object to the Worker.

## 2. Write a Durable Object class using SQL API

Before you create and access a Durable Object, its behavior must be defined by an ordinary exported JavaScript class.

Note

If you do not use JavaScript or TypeScript, you will need a [shim](https://developer.mozilla.org/en-US/docs/Glossary/Shim) to translate your class definition to a JavaScript class.

Your `MyDurableObject` class will have a constructor with two parameters. The first parameter, `ctx`, passed to the class constructor contains state specific to the Durable Object, including methods for accessing storage. The second parameter, `env`, contains any bindings you have associated with the Worker when you uploaded it.

* JavaScript

  ```js
  export class MyDurableObject extends DurableObject {
    constructor(ctx, env) {
      // Required, as we're extending the base class.
      super(ctx, env);
    }
  }
  ```

* TypeScript

  ```ts
  export class MyDurableObject extends DurableObject<Env> {
    constructor(ctx: DurableObjectState, env: Env) {
      // Required, as we're extending the base class.
      super(ctx, env)
    }
  }
  ```

* Python

  ```python
  from workers import DurableObject


  class MyDurableObject(DurableObject):
      def __init__(self, ctx, env):
          super().__init__(ctx, env)
  ```

Workers communicate with a Durable Object using [remote-procedure call](https://developers.cloudflare.com/workers/runtime-apis/rpc/#_top). Public methods on a Durable Object class are exposed as [RPC methods](https://developers.cloudflare.com/durable-objects/best-practices/create-durable-object-stubs-and-send-requests/) to be called by another Worker.

Your file should now look like:

* JavaScript

  ```js
  export class MyDurableObject extends DurableObject {
    constructor(ctx, env) {
      // Required, as we're extending the base class.
      super(ctx, env);
    }


    async sayHello() {
      let result = this.ctx.storage.sql
        .exec("SELECT 'Hello, World!' as greeting")
        .one();
      return result.greeting;
    }
  }
  ```

* TypeScript

  ```ts
  export class MyDurableObject extends DurableObject<Env> {
    constructor(ctx: DurableObjectState, env: Env) {
      // Required, as we're extending the base class.
      super(ctx, env)
    }


      async sayHello(): Promise<string> {
        let result = this.ctx.storage.sql
          .exec("SELECT 'Hello, World!' as greeting")
          .one();
        return result.greeting;
      }


  }
  ```

* Python

  ```python
  from workers import DurableObject


  class MyDurableObject(DurableObject):
      async def say_hello(self):
          result = self.ctx.storage.sql.exec(
              "SELECT 'Hello, World!' as greeting"
          ).one()


          return result.greeting
  ```

In the code above, you have:

1. Defined a RPC method, `sayHello()`, that can be called by a Worker to communicate with a Durable Object.
2. Accessed a Durable Object's attached storage, which is a private SQLite database only accessible to the object, using [SQL API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/#exec) methods (`sql.exec()`) available on `ctx.storage` .
3. Returned an object representing the single row query result using `one()`, which checks that the query result has exactly one row.
4. Return the `greeting` column from the row object result.

## 3. Instantiate and communicate with a Durable Object

Note

Durable Objects do not receive requests directly from the Internet. Durable Objects receive requests from Workers or other Durable Objects. This is achieved by configuring a binding in the calling Worker for each Durable Object class that you would like it to be able to talk to. These bindings must be configured at upload time. Methods exposed by the binding can be used to communicate with particular Durable Objects.

A Worker is used to [access Durable Objects](https://developers.cloudflare.com/durable-objects/best-practices/create-durable-object-stubs-and-send-requests/).

To communicate with a Durable Object, the Worker's fetch handler should look like the following:

* JavaScript

  ```js
  export default {
    async fetch(request, env, ctx) {
      const stub = env.MY_DURABLE_OBJECT.getByName(new URL(request.url).pathname);


      const greeting = await stub.sayHello();


      return new Response(greeting);
    },
  };
  ```

* TypeScript

  ```ts
  export default {
    async fetch(request, env, ctx): Promise<Response> {
        const stub = env.MY_DURABLE_OBJECT.getByName(new URL(request.url).pathname);


        const greeting = await stub.sayHello();


        return new Response(greeting);
      },


  } satisfies ExportedHandler<Env>;
  ```

* Python

  ```python
  from workers import handler, Response, WorkerEntrypoint
  from urllib.parse import urlparse


  class Default(WorkerEntrypoint):
      async def fetch(request):
          url = urlparse(request.url)
          stub = self.env.MY_DURABLE_OBJECT.getByName(url.path)
          greeting = await stub.say_hello()
          return Response(greeting)
  ```

In the code above, you have:

1. Exported your Worker's main event handlers, such as the `fetch()` handler for receiving HTTP requests.
2. Passed `env` into the `fetch()` handler. Bindings are delivered as a property of the environment object passed as the second parameter when an event handler or class constructor is invoked.
3. Constructed a stub for a Durable Object instance based on the provided name. A stub is a client object used to send messages to the Durable Object.
4. Called a Durable Object by invoking a RPC method, `sayHello()`, on the Durable Object, which returns a `Hello, World!` string greeting.
5. Received an HTTP response back to the client by constructing a HTTP Response with `return new Response()`.

Refer to [Access a Durable Object from a Worker](https://developers.cloudflare.com/durable-objects/best-practices/create-durable-object-stubs-and-send-requests/) to learn more about communicating with a Durable Object.

## 4. Configure Durable Object bindings

[Bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/) allow your Workers to interact with resources on the Cloudflare developer platform. The Durable Object bindings in your Worker project's [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) will include a binding name (for this guide, use `MY_DURABLE_OBJECT`) and the class name (`MyDurableObject`).

* wrangler.jsonc

  ```jsonc
  {
    "durable_objects": {
      "bindings": [
        {
          "name": "MY_DURABLE_OBJECT",
          "class_name": "MyDurableObject"
        }
      ]
    }
  }
  ```

* wrangler.toml

  ```toml
  [[durable_objects.bindings]]
  name = "MY_DURABLE_OBJECT"
  class_name = "MyDurableObject"
  ```

The `bindings` section contains the following fields:

* `name` - Required. The binding name to use within your Worker.
* `class_name` - Required. The class name you wish to bind to.
* `script_name` - Optional. Defaults to the current [environment's](https://developers.cloudflare.com/durable-objects/reference/environments/) Worker code.

## 5. Configure Durable Object class with SQLite storage backend

A migration is a mapping process from a class name to a runtime state. You perform a migration when creating a new Durable Object class, or when renaming, deleting or transferring an existing Durable Object class.

Migrations are performed through the `[[migrations]]` configurations key in your Wrangler file.

The Durable Object migration to create a new Durable Object class with SQLite storage backend will look like the following in your Worker's Wrangler file:

* wrangler.jsonc

  ```jsonc
  {
    "migrations": [
      {
        "tag": "v1", // Should be unique for each entry
        "new_sqlite_classes": [ // Array of new classes
          "MyDurableObject"
        ]
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  [[migrations]]
  tag = "v1"
  new_sqlite_classes = [ "MyDurableObject" ]
  ```

Refer to [Durable Objects migrations](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/) to learn more about the migration process.

## 6. Develop a Durable Object Worker locally

To test your Durable Object locally, run [`wrangler dev`](https://developers.cloudflare.com/workers/wrangler/commands/#dev):

```sh
npx wrangler dev
```

In your console, you should see a`Hello world` string returned by the Durable Object.

## 7. Deploy your Durable Object Worker

To deploy your Durable Object Worker:

```sh
npx wrangler deploy
```

Once deployed, you should be able to see your newly created Durable Object Worker on the Cloudflare dashboard.

[Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

Preview your Durable Object Worker at `<YOUR_WORKER>.<YOUR_SUBDOMAIN>.workers.dev`.

## Summary and final code

Your final code should look like this:

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";
  export class MyDurableObject extends DurableObject {
    constructor(ctx, env) {
      // Required, as we are extending the base class.
      super(ctx, env);
    }


    async sayHello() {
      let result = this.ctx.storage.sql
        .exec("SELECT 'Hello, World!' as greeting")
        .one();
      return result.greeting;
    }
  }
  export default {
    async fetch(request, env, ctx) {
      const stub = env.MY_DURABLE_OBJECT.getByName(new URL(request.url).pathname);


      const greeting = await stub.sayHello();


      return new Response(greeting);
    },
  };
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";
  export class MyDurableObject extends DurableObject<Env> {
    constructor(ctx: DurableObjectState, env: Env) {
      // Required, as we are extending the base class.
      super(ctx, env)
    }


      async sayHello():Promise<string> {
        let result = this.ctx.storage.sql
          .exec("SELECT 'Hello, World!' as greeting")
          .one();
        return result.greeting;
      }


  }
  export default {
  async fetch(request, env, ctx): Promise<Response> {
  const stub = env.MY_DURABLE_OBJECT.getByName(new URL(request.url).pathname);


        const greeting = await stub.sayHello();


        return new Response(greeting);
      },


  } satisfies ExportedHandler<Env>;
  ```

* Python

  ```python
  from workers import DurableObject, handler, Response
  from urllib.parse import urlparse


  class MyDurableObject(DurableObject):
      async def say_hello(self):
          result = self.ctx.storage.sql.exec(
              "SELECT 'Hello, World!' as greeting"
          ).one()


          return result.greeting


  class Default(WorkerEntrypoint):
      async def fetch(self, request):
          url = urlparse(request.url)
          stub = self.env.MY_DURABLE_OBJECT.getByName(url.path)
          greeting = await stub.say_hello()
          return Response(greeting)
  ```

By finishing this tutorial, you have:

* Successfully created a Durable Object
* Called the Durable Object by invoking a [RPC method](https://developers.cloudflare.com/workers/runtime-apis/rpc/)
* Deployed the Durable Object globally

## Related resources

* [Create Durable Object stubs](https://developers.cloudflare.com/durable-objects/best-practices/create-durable-object-stubs-and-send-requests/)
* [Access Durable Objects Storage](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/)
* [Miniflare](https://github.com/cloudflare/workers-sdk/tree/main/packages/miniflare) - Helpful tools for mocking and testing your Durable Objects.

</page>

<page>
---
title: Observability · Cloudflare Durable Objects docs
lastUpdated: 2025-01-31T11:01:46.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/durable-objects/observability/
  md: https://developers.cloudflare.com/durable-objects/observability/index.md
---

* [Troubleshooting](https://developers.cloudflare.com/durable-objects/observability/troubleshooting/)
* [Metrics and analytics](https://developers.cloudflare.com/durable-objects/observability/metrics-and-analytics/)
* [Data Studio](https://developers.cloudflare.com/durable-objects/observability/data-studio/)

</page>

<page>
---
title: Platform · Cloudflare Durable Objects docs
lastUpdated: 2025-03-14T10:22:37.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/durable-objects/platform/
  md: https://developers.cloudflare.com/durable-objects/platform/index.md
---

* [Known issues](https://developers.cloudflare.com/durable-objects/platform/known-issues/)
* [Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
* [Limits](https://developers.cloudflare.com/durable-objects/platform/limits/)
* [Choose a data or storage product](https://developers.cloudflare.com/workers/platform/storage-options/)

</page>

<page>
---
title: Reference · Cloudflare Durable Objects docs
lastUpdated: 2025-03-14T10:22:37.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/durable-objects/reference/
  md: https://developers.cloudflare.com/durable-objects/reference/index.md
---

* [In-memory state in a Durable Object](https://developers.cloudflare.com/durable-objects/reference/in-memory-state/)
* [Durable Objects migrations](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/)
* [Data security](https://developers.cloudflare.com/durable-objects/reference/data-security/)
* [Data location](https://developers.cloudflare.com/durable-objects/reference/data-location/)
* [Environments](https://developers.cloudflare.com/durable-objects/reference/environments/)
* [Gradual Deployments](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/gradual-deployments/#gradual-deployments-for-durable-objects)
* [FAQs](https://developers.cloudflare.com/durable-objects/reference/faq/)
* [Glossary](https://developers.cloudflare.com/durable-objects/reference/glossary/)

</page>

<page>
---
title: Release notes · Cloudflare Durable Objects docs
description: Subscribe to RSS
lastUpdated: 2025-03-14T10:22:37.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/release-notes/
  md: https://developers.cloudflare.com/durable-objects/release-notes/index.md
---

[Subscribe to RSS](https://developers.cloudflare.com/durable-objects/release-notes/index.xml)

## 2026-01-07

**Billing for SQLite Storage**

Storage billing for SQLite-backed Durable Objects will be enabled in January 2026, with a target date of January 7, 2026 (no earlier). For more details, refer to the [Billing for SQLite Storage](https://developers.cloudflare.com/changelog/durable-objects/2026-01-07-durable-objects-sqlite-storage-billing/).

## 2025-10-25

* The maximum WebSocket message size limit has been increased from 1 MiB to 32 MiB.

## 2025-10-16

**Durable Objects can access stored data with UI editor**

Durable Objects stored data can be viewed and written using [Data Studio](https://developers.cloudflare.com/durable-objects/observability/data-studio/) on the Cloudflare dashboard. Only Durable Objects using [SQLite storage](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#create-sqlite-backed-durable-object-class) can use Data Studio.

## 2025-08-21

**Durable Objects stubs can now be directly constructed by name**

A [`DurableObjectStub`](https://developers.cloudflare.com/durable-objects/api/stub) can now be directly constructed by created directly with [`DurableObjectNamespace::getByName`](https://developers.cloudflare.com/durable-objects/api/namespace/#getbyname).

## 2025-04-07

**Durable Objects on Workers Free plan**

[SQLite-backed Durable Objects](https://developers.cloudflare.com/durable-objects/get-started/) are now available on the Workers Free plan with these [limits](https://developers.cloudflare.com/durable-objects/platform/pricing/).

## 2025-04-07

**SQLite in Durable Objects GA**

[SQLite-backed Durable Objects](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#create-sqlite-backed-durable-object-class) and corresponding [Storage API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/) methods like `sql.exec` have moved from beta to general availability. New Durable Object classes should use wrangler configuration for SQLite storage over key-value storage.

SQLite storage per Durable Object has increased to 10GB for all existing and new objects.

## 2025-02-19

SQLite-backed Durable Objects now support `PRAGMA optimize` command, which can improve database query performance. It is recommended to run this command after a schema change (for example, after creating an index). Refer to [`PRAGMA optimize`](https://developers.cloudflare.com/d1/sql-api/sql-statements/#pragma-optimize) for more information.

## 2025-02-11

When Durable Objects generate an "internal error" exception in response to certain failures, the exception message may provide a reference ID that customers can include in support communication for easier error identification. For example, an exception with the new message might look like: `internal error; reference = 0123456789abcdefghijklmn`.

## 2024-10-07

**Alarms re-enabled in (beta) SQLite-backed Durable Object classes**

The issue identified with [alarms](https://developers.cloudflare.com/durable-objects/api/alarms/) in [beta Durable Object classes with a SQLite storage backend](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#sqlite-storage-backend) has been resolved and alarms have been re-enabled.

## 2024-09-27

**Alarms disabled in (beta) SQLite-backed Durable Object classes**

An issue was identified with [alarms](https://developers.cloudflare.com/durable-objects/api/alarms/) in [beta Durable Object classes with a SQLite storage backend](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#sqlite-storage-backend). Alarms have been temporarily disabled for only SQLite-backed Durable Objects while a fix is implemented. Alarms in Durable Objects with default, key-value storage backend are unaffected and continue to operate.

## 2024-09-26

**(Beta) SQLite storage backend & SQL API available on new Durable Object classes**

The new beta version of Durable Objects is available where each Durable Object has a private, embedded SQLite database. When deploying a new Durable Object class, users can [opt-in to a SQLite storage backend](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#sqlite-storage-backend) in order to access new [SQL API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/#sql-api) and [point-in-time-recovery API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/#pitr-point-in-time-recovery-api), part of Durable Objects Storage API.

You cannot enable a SQLite storage backend on an existing, deployed Durable Object class. Automatic migration of deployed classes from their key-value storage backend to SQLite storage backend will be available in the future.

During the initial beta, Storage API billing is not enabled for Durable Object classes using SQLite storage backend. SQLite-backed Durable Objects will incur [charges for requests and duration](https://developers.cloudflare.com/durable-objects/platform/pricing/#billing-metrics). We plan to enable Storage API billing for Durable Objects using SQLite storage backend in the first half of 2025 after advance notice with the following [pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/#sqlite-storage-backend).

## 2024-09-07

**New error message for overloaded Durable Objects**

Introduced a new overloaded error message for Durable Objects: "Durable Object is overloaded. Too many requests for the same object within a 10 second window."

This error message does not replace other types of overload messages that you may encounter for your Durable Object, and is only returned at more extreme levels of overload.

## 2024-06-24

[Exceptions](https://developers.cloudflare.com/durable-objects/best-practices/error-handling) thrown from Durable Object internal operations and tunneled to the caller may now be populated with a `.retryable: true` property if the exception was likely due to a transient failure, or populated with an `.overloaded: true` property if the exception was due to [overload](https://developers.cloudflare.com/durable-objects/observability/troubleshooting/#durable-object-is-overloaded).

## 2024-04-03

**Durable Objects support for Oceania region**

Durable Objects can reside in Oceania, lowering Durable Objects request latency for eyeball Workers in Oceania locations.

Refer to [Durable Objects](https://developers.cloudflare.com/durable-objects/reference/data-location/#provide-a-location-hint) to provide location hints to objects.

## 2024-04-01

**Billing reduction for WebSocket messages**

Durable Objects [request billing](https://developers.cloudflare.com/durable-objects/platform/pricing/#billing-metrics) applies a 20:1 ratio for incoming WebSocket messages. For example, 1 million Websocket received messages across connections would be charged as 50,000 Durable Objects requests.

This is a billing-only calculation and does not impact Durable Objects [metrics and analytics](https://developers.cloudflare.com/durable-objects/observability/metrics-and-analytics/).

## 2024-02-15

**Optional \`alarmInfo\` parameter for Durable Object Alarms**

Durable Objects [Alarms](https://developers.cloudflare.com/durable-objects/api/alarms/) now have a new `alarmInfo` argument that provides more details about an alarm invocation, including the `retryCount` and `isRetry` to signal if the alarm was retried.

</page>

<page>
---
title: Tutorials · Cloudflare Durable Objects docs
description: View tutorials to help you get started with Durable Objects.
lastUpdated: 2025-08-18T14:27:42.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/tutorials/
  md: https://developers.cloudflare.com/durable-objects/tutorials/index.md
---

View tutorials to help you get started with Durable Objects.

| Name | Last Updated | Difficulty |
| - | - | - |
| [Build a seat booking app with SQLite in Durable Objects](https://developers.cloudflare.com/durable-objects/tutorials/build-a-seat-booking-app/) | over 1 year ago | Intermediate |
| [Deploy a Browser Rendering Worker with Durable Objects](https://developers.cloudflare.com/browser-rendering/workers-bindings/browser-rendering-with-do/) | over 2 years ago | Beginner |
| [Deploy a real-time chat application](https://developers.cloudflare.com/workers/tutorials/deploy-a-realtime-chat-app/) | over 2 years ago | Intermediate |

</page>

<page>
---
title: Videos · Cloudflare Durable Objects docs
lastUpdated: 2025-03-12T13:36:32.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/video-tutorials/
  md: https://developers.cloudflare.com/durable-objects/video-tutorials/index.md
---

[Introduction to Durable Objects ](https://developers.cloudflare.com/learning-paths/durable-objects-course/series/introduction-to-series-1/)Dive into a hands-on Durable Objects project and learn how to build stateful apps using serverless architecture

</page>

<page>
---
title: Alarms · Cloudflare Durable Objects docs
description: Durable Objects alarms allow you to schedule the Durable Object to
  be woken up at a time in the future. When the alarm's scheduled time comes,
  the alarm() handler method will be called. Alarms are modified using the
  Storage API, and alarm operations follow the same rules as other storage
  operations.
lastUpdated: 2026-02-05T20:26:57.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/api/alarms/
  md: https://developers.cloudflare.com/durable-objects/api/alarms/index.md
---

## Background

Durable Objects alarms allow you to schedule the Durable Object to be woken up at a time in the future. When the alarm's scheduled time comes, the `alarm()` handler method will be called. Alarms are modified using the Storage API, and alarm operations follow the same rules as other storage operations.

Notably:

* Each Durable Object is able to schedule a single alarm at a time by calling `setAlarm()`.
* Alarms have guaranteed at-least-once execution and are retried automatically when the `alarm()` handler throws.
* Retries are performed using exponential backoff starting at a 2 second delay from the first failure with up to 6 retries allowed.

How are alarms different from Cron Triggers?

Alarms are more fine grained than [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/). A Worker can have up to three Cron Triggers configured at once, but it can have an unlimited amount of Durable Objects, each of which can have an alarm set.

Alarms are directly scheduled from within your Durable Object. Cron Triggers, on the other hand, are not programmatic. [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/) execute based on their schedules, which have to be configured through the Cloudflare dashboard or API.

Alarms can be used to build distributed primitives, like queues or batching of work atop Durable Objects. Alarms also provide a mechanism to guarantee that operations within a Durable Object will complete without relying on incoming requests to keep the Durable Object alive. For a complete example, refer to [Use the Alarms API](https://developers.cloudflare.com/durable-objects/examples/alarms-api/).

## Scheduling multiple events with a single alarm

Although each Durable Object can only have one alarm set at a time, you can manage many scheduled and recurring events by storing your event schedule in storage and having the `alarm()` handler process due events, then reschedule itself for the next one.

```js
import { DurableObject } from "cloudflare:workers";


export class AgentServer extends DurableObject {
  // Schedule a one-time or recurring event
  async scheduleEvent(id, runAt, repeatMs = null) {
    await this.ctx.storage.put(`event:${id}`, { id, runAt, repeatMs });
    const currentAlarm = await this.ctx.storage.getAlarm();
    if (!currentAlarm || runAt < currentAlarm) {
      await this.ctx.storage.setAlarm(runAt);
    }
  }


  async alarm() {
    const now = Date.now();
    const events = await this.ctx.storage.list({ prefix: "event:" });
    let nextAlarm = null;


    for (const [key, event] of events) {
      if (event.runAt <= now) {
        await this.processEvent(event);
        if (event.repeatMs) {
          event.runAt = now + event.repeatMs;
          await this.ctx.storage.put(key, event);
        } else {
          await this.ctx.storage.delete(key);
        }
      }
      // Track the next event time
      if (event.runAt > now && (!nextAlarm || event.runAt < nextAlarm)) {
        nextAlarm = event.runAt;
      }
    }


    if (nextAlarm) await this.ctx.storage.setAlarm(nextAlarm);
  }


  async processEvent(event) {
    // Your event handling logic here
  }
}
```

## Storage methods

### `getAlarm`

* `getAlarm()`: number | null

  * If there is an alarm set, then return the currently set alarm time as the number of milliseconds elapsed since the UNIX epoch. Otherwise, return `null`.

  * If `getAlarm` is called while an [`alarm`](https://developers.cloudflare.com/durable-objects/api/alarms/#alarm) is already running, it returns `null` unless `setAlarm` has also been called since the alarm handler started running.

### `setAlarm`

* `setAlarm(scheduledTimeMs number) `: void

  * Set the time for the alarm to run. Specify the time as the number of milliseconds elapsed since the UNIX epoch.
  * If you call `setAlarm` when there is already one scheduled, it will override the existing alarm.

Calling `setAlarm` inside the constructor

If you wish to call `setAlarm` inside the constructor of a Durable Object, ensure that you are first checking whether an alarm has already been set.

This is due to the fact that, if the Durable Object wakes up after being inactive, the constructor is invoked before the [`alarm` handler](https://developers.cloudflare.com/durable-objects/api/alarms/#alarm). Therefore, if the constructor calls `setAlarm`, it could interfere with the next alarm which has already been set.

### `deleteAlarm`

* `deleteAlarm()`: void

  * Unset the alarm if there is a currently set alarm.

  * Calling `deleteAlarm()` inside the `alarm()` handler may prevent retries on a best-effort basis, but is not guaranteed.

## Handler methods

### `alarm`

* `alarm(alarmInfo Object)`: void

  * Called by the system when a scheduled alarm time is reached.

  * The optional parameter `alarmInfo` object has two properties:

    * `retryCount` number: The number of times this alarm event has been retried.
    * `isRetry` boolean: A boolean value to indicate if the alarm has been retried. This value is `true` if this alarm event is a retry.

  * Only one instance of `alarm()` will ever run at a given time per Durable Object instance.

  * The `alarm()` handler has guaranteed at-least-once execution and will be retried upon failure using exponential backoff, starting at 2 second delays for up to 6 retries. This only applies to the most recent `setAlarm()` call. Retries will be performed if the method fails with an uncaught exception.

  * This method can be `async`.

Catching exceptions in alarm handlers

Because alarms are only retried up to 6 times on error, it's recommended to catch any exceptions inside your `alarm()` handler and schedule a new alarm before returning if you want to make sure your alarm handler will be retried indefinitely. Otherwise, a sufficiently long outage in a downstream service that you depend on or a bug in your code that goes unfixed for hours can exhaust the limited number of retries, causing the alarm to not be re-run in the future until the next time you call `setAlarm`.

## Example

This example shows how to both set alarms with the `setAlarm(timestamp)` method and handle alarms with the `alarm()` handler within your Durable Object.

* The `alarm()` handler will be called once every time an alarm fires.
* If an unexpected error terminates the Durable Object, the `alarm()` handler may be re-instantiated on another machine.
* Following a short delay, the `alarm()` handler will run from the beginning on the other machine.

- JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  export default {
    async fetch(request, env) {
      return await env.ALARM_EXAMPLE.getByName("foo").fetch(request);
    },
  };


  const SECONDS = 1000;


  export class AlarmExample extends DurableObject {
    constructor(ctx, env) {
      super(ctx, env);
      this.storage = ctx.storage;
    }
    async fetch(request) {
      // If there is no alarm currently set, set one for 10 seconds from now
      let currentAlarm = await this.storage.getAlarm();
      if (currentAlarm == null) {
        this.storage.setAlarm(Date.now() + 10 * SECONDS);
      }
    }
    async alarm() {
      // The alarm handler will be invoked whenever an alarm fires.
      // You can use this to do work, read from the Storage API, make HTTP calls
      // and set future alarms to run using this.storage.setAlarm() from within this handler.
    }
  }
  ```

- Python

  ```python
  import time


  from workers import DurableObject, WorkerEntrypoint


  class Default(WorkerEntrypoint):
      async def fetch(self, request):
          return await self.env.ALARM_EXAMPLE.getByName("foo").fetch(request)


  SECONDS = 1000


  class AlarmExample(DurableObject):
      def __init__(self, ctx, env):
          super().__init__(ctx, env)
          self.storage = ctx.storage


      async def fetch(self, request):
          # If there is no alarm currently set, set one for 10 seconds from now
          current_alarm = await self.storage.getAlarm()
          if current_alarm is None:
              self.storage.setAlarm(int(time.time() * 1000) + 10 * SECONDS)


      async def alarm(self):
          # The alarm handler will be invoked whenever an alarm fires.
          # You can use this to do work, read from the Storage API, make HTTP calls
          # and set future alarms to run using self.storage.setAlarm() from within this handler.
          pass
  ```

The following example shows how to use the `alarmInfo` property to identify if the alarm event has been attempted before.

* JavaScript

  ```js
  class MyDurableObject extends DurableObject {
    async alarm(alarmInfo) {
      if (alarmInfo?.retryCount != 0) {
        console.log(
          "This alarm event has been attempted ${alarmInfo?.retryCount} times before.",
        );
      }
    }
  }
  ```

* Python

  ```python
  class MyDurableObject(DurableObject):
      async def alarm(self, alarm_info):
          if alarm_info and alarm_info.get('retryCount', 0) != 0:
              print(f"This alarm event has been attempted {alarm_info.get('retryCount')} times before.")
  ```

## Related resources

* Understand how to [use the Alarms API](https://developers.cloudflare.com/durable-objects/examples/alarms-api/) in an end-to-end example.
* Read the [Durable Objects alarms announcement blog post](https://blog.cloudflare.com/durable-objects-alarms/).
* Review the [Storage API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/) documentation for Durable Objects.

</page>

<page>
---
title: Durable Object Base Class · Cloudflare Durable Objects docs
description: The DurableObject base class is an abstract class which all Durable
  Objects inherit from. This base class provides a set of optional methods,
  frequently referred to as handler methods, which can respond to events, for
  example a webSocketMessage when using the WebSocket Hibernation API. To
  provide a concrete example, here is a Durable Object MyDurableObject which
  extends DurableObject and implements the fetch handler to return "Hello,
  World!" to the calling Worker.
lastUpdated: 2026-02-03T14:07:02.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/api/base/
  md: https://developers.cloudflare.com/durable-objects/api/base/index.md
---

The `DurableObject` base class is an abstract class which all Durable Objects inherit from. This base class provides a set of optional methods, frequently referred to as handler methods, which can respond to events, for example a `webSocketMessage` when using the [WebSocket Hibernation API](https://developers.cloudflare.com/durable-objects/best-practices/websockets/#durable-objects-hibernation-websocket-api). To provide a concrete example, here is a Durable Object `MyDurableObject` which extends `DurableObject` and implements the fetch handler to return "Hello, World!" to the calling Worker.

* JavaScript

  ```js
  export class MyDurableObject extends DurableObject {
    constructor(ctx, env) {
      super(ctx, env);
    }


    async fetch(request) {
      return new Response("Hello, World!");
    }
  }
  ```

* TypeScript

  ```ts
  export class MyDurableObject extends DurableObject {
    constructor(ctx: DurableObjectState, env: Env) {
      super(ctx, env);
    }


      async fetch(request: Request) {
        return new Response("Hello, World!");
      }


  }
  ```

* Python

  ```python
  from workers import DurableObject, Response


  class MyDurableObject(DurableObject):
    def __init__(self, ctx, env):
      super().__init__(ctx, env)


    async def fetch(self, request):
      return Response("Hello, World!")
  ```

## Methods

### `fetch`

* `fetch(request Request)`: Response | Promise\<Response>- Takes an HTTP [Request](https://developers.cloudflare.com/workers/runtime-apis/request/) and returns an HTTP [Response](https://developers.cloudflare.com/workers/runtime-apis/response/). This method allows the Durable Object to emulate an HTTP server where a Worker with a binding to that object is the client. - This method can be `async`.
  * Durable Objects support [RPC calls](https://developers.cloudflare.com/durable-objects/best-practices/create-durable-object-stubs-and-send-requests/) as of compatibility date [2024-04-03](https://developers.cloudflare.com/workers/configuration/compatibility-flags/#durable-object-stubs-and-service-bindings-support-rpc). RPC methods are preferred over `fetch()` when your application does not follow HTTP request/response flow.

#### Parameters

* `request` Request - the incoming HTTP request object.

#### Return values

* A Response or Promise\<Response>.

#### Example

* JavaScript

  ```js
  export class MyDurableObject extends DurableObject {
    async fetch(request) {
      const url = new URL(request.url);
      if (url.pathname === "/hello") {
        return new Response("Hello, World!");
      }
      return new Response("Not found", { status: 404 });
    }
  }
  ```

* TypeScript

  ```ts
  export class MyDurableObject extends DurableObject<Env> {
    async fetch(request: Request): Promise<Response> {
      const url = new URL(request.url);
      if (url.pathname === "/hello") {
        return new Response("Hello, World!");
      }
      return new Response("Not found", { status: 404 });
    }
  }
  ```

### `alarm`

* `alarm(alarmInfo? AlarmInvocationInfo)`: void | Promise\<void>

  * Called by the system when a scheduled alarm time is reached.

  * The `alarm()` handler has guaranteed at-least-once execution and will be retried upon failure using exponential backoff, starting at two second delays for up to six retries. Retries will be performed if the method fails with an uncaught exception.

  * This method can be `async`.

  * Refer to [Alarms](https://developers.cloudflare.com/durable-objects/api/alarms/) for more information.

#### Parameters

* `alarmInfo` AlarmInvocationInfo (optional) - an object containing retry information:

  * `retryCount` number - the number of times this alarm event has been retried.
  * `isRetry` boolean - `true` if this alarm event is a retry, `false` otherwise.

#### Return values

* None.

#### Example

* JavaScript

  ```js
  export class MyDurableObject extends DurableObject {
    async alarm(alarmInfo) {
      if (alarmInfo?.isRetry) {
        console.log(`Alarm retry attempt ${alarmInfo.retryCount}`);
      }
      await this.processScheduledTask();
    }
  }
  ```

* TypeScript

  ```ts
  export class MyDurableObject extends DurableObject<Env> {
    async alarm(alarmInfo?: AlarmInvocationInfo): Promise<void> {
      if (alarmInfo?.isRetry) {
        console.log(`Alarm retry attempt ${alarmInfo.retryCount}`);
      }
      await this.processScheduledTask();
    }
  }
  ```

### `webSocketMessage`

* `webSocketMessage(ws WebSocket, message string | ArrayBuffer)`: void | Promise\<void>- Called by the system when an accepted WebSocket receives a message. - This method is not called for WebSocket control frames. The system will respond to an incoming [WebSocket protocol ping](https://www.rfc-editor.org/rfc/rfc6455#section-5.5.2) automatically without interrupting hibernation.
  * This method can be `async`.

#### Parameters

* `ws` WebSocket - the [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) that received the message. Use this reference to send responses or access serialized attachments.
* `message` string | ArrayBuffer - the message data. Text messages arrive as `string`, binary messages as `ArrayBuffer`.

#### Return values

* None.

#### Example

* JavaScript

  ```js
  export class MyDurableObject extends DurableObject {
    async webSocketMessage(ws, message) {
      if (typeof message === "string") {
        ws.send(`Received: ${message}`);
      } else {
        ws.send(`Received ${message.byteLength} bytes`);
      }
    }
  }
  ```

* TypeScript

  ```ts
  export class MyDurableObject extends DurableObject<Env> {
    async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
      if (typeof message === "string") {
        ws.send(`Received: ${message}`);
      } else {
        ws.send(`Received ${message.byteLength} bytes`);
      }
    }
  }
  ```

### `webSocketClose`

* `webSocketClose(ws WebSocket, code number, reason string, wasClean boolean)`: void | Promise\<void>- Called by the system when a WebSocket connection is closed. - You **must** call `ws.close(code, reason)` inside this handler to complete the WebSocket close handshake. Failing to reciprocate the close will result in `1006` errors on the client, representing an abnormal closure per the WebSocket specification.
  * This method can be `async`.

#### Parameters

* `ws` WebSocket - the [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) that was closed.
* `code` number - the [WebSocket close code](https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code) sent by the peer (e.g., `1000` for normal closure, `1001` for going away).
* `reason` string - a string indicating why the connection was closed. May be empty.
* `wasClean` boolean - `true` if the connection closed cleanly with a proper closing handshake, `false` otherwise.

#### Return values

* None.

#### Example

* JavaScript

  ```js
  export class MyDurableObject extends DurableObject {
    async webSocketClose(ws, code, reason, wasClean) {
      // Complete the WebSocket close handshake
      ws.close(code, reason);
      console.log(`WebSocket closed: code=${code}, reason=${reason}`);
    }
  }
  ```

* TypeScript

  ```ts
  export class MyDurableObject extends DurableObject<Env> {
    async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
      // Complete the WebSocket close handshake
      ws.close(code, reason);
      console.log(`WebSocket closed: code=${code}, reason=${reason}`);
    }
  }
  ```

### `webSocketError`

* `webSocketError(ws WebSocket, error unknown)`: void | Promise\<void>- Called by the system when a non-disconnection error occurs on a WebSocket connection. - This method can be `async`.

#### Parameters

* `ws` WebSocket - the [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) that encountered an error.
* `error` unknown - the error that occurred. May be an `Error` object or another type depending on the error source.

#### Return values

* None.

#### Example

* JavaScript

  ```js
  export class MyDurableObject extends DurableObject {
    async webSocketError(ws, error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`WebSocket error: ${message}`);
    }
  }
  ```

* TypeScript

  ```ts
  export class MyDurableObject extends DurableObject<Env> {
    async webSocketError(ws: WebSocket, error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`WebSocket error: ${message}`);
    }
  }
  ```

## Properties

### `ctx`

`ctx` is a readonly property of type [`DurableObjectState`](https://developers.cloudflare.com/durable-objects/api/state/) providing access to storage, WebSocket management, and other instance-specific functionality.

### `env`

`env` contains the environment bindings available to this Durable Object, as defined in your Wrangler configuration.

## Related resources

* [Use WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/) for WebSocket handler best practices.
* [Alarms API](https://developers.cloudflare.com/durable-objects/api/alarms/) for scheduling future work.
* [RPC methods](https://developers.cloudflare.com/durable-objects/best-practices/create-durable-object-stubs-and-send-requests/) for type-safe method calls.

</page>

<page>
---
title: Durable Object Container · Cloudflare Durable Objects docs
description: >-
  When using a Container-enabled Durable Object, you can access the Durable
  Object's associated container via

  the container object which is on the ctx property. This allows you to start,
  stop, and interact with the container.
lastUpdated: 2025-12-08T15:50:53.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/api/container/
  md: https://developers.cloudflare.com/durable-objects/api/container/index.md
---

## Description

When using a [Container-enabled Durable Object](https://developers.cloudflare.com/containers), you can access the Durable Object's associated container via the `container` object which is on the `ctx` property. This allows you to start, stop, and interact with the container.

Note

It is likely preferable to use the official `Container` class, which provides helper methods and a more idiomatic API for working with containers on top of Durable Objects.

* JavaScript

  ```js
  export class MyDurableObject extends DurableObject {
    constructor(ctx, env) {
      super(ctx, env);


      // boot the container when starting the DO
      this.ctx.blockConcurrencyWhile(async () => {
        this.ctx.container.start();
      });
    }
  }
  ```

* TypeScript

  ```ts
  export class MyDurableObject extends DurableObject {
    constructor(ctx: DurableObjectState, env: Env) {
      super(ctx, env);


        // boot the container when starting the DO
        this.ctx.blockConcurrencyWhile(async () => {
          this.ctx.container.start();
      });
      }


  }
  ```

## Attributes

### `running`

`running` returns `true` if the container is currently running. It does not ensure that the container has fully started and ready to accept requests.

```js
  this.ctx.container.running;
```

## Methods

### `start`

`start` boots a container. This method does not block until the container is fully started. You may want to confirm the container is ready to accept requests before using it.

```js
this.ctx.container.start({
  env: {
    FOO: "bar",
  },
  enableInternet: false,
  entrypoint: ["node", "server.js"],
});
```

#### Parameters

* `options` (optional): An object with the following properties:

  * `env`: An object containing environment variables to pass to the container. This is useful for passing configuration values or secrets to the container.
  * `entrypoint`: An array of strings representing the command to run in the container.
  * `enableInternet`: A boolean indicating whether to enable internet access for the container.

#### Return values

* None.

### `destroy`

`destroy` stops the container and optionally returns a custom error message to the `monitor()` error callback.

```js
this.ctx.container.destroy("Manually Destroyed");
```

#### Parameters

* `error` (optional): A string that will be sent to the error handler of the `monitor` method. This is useful for logging or debugging purposes.

#### Return values

* A promise that returns once the container is destroyed.

### `signal`

`signal` sends an IPC signal to the container, such as SIGKILL or SIGTERM. This is useful for stopping the container gracefully or forcefully.

```js
const SIGTERM = 15;
this.ctx.container.signal(SIGTERM);
```

#### Parameters

* `signal`: a number representing the signal to send to the container. This is typically a POSIX signal number, such as SIGTERM (15) or SIGKILL (9).

#### Return values

* None.

### `getTcpPort`

`getTcpPort` returns a TCP port from the container. This can be used to communicate with the container over TCP and HTTP.

```js
const port = this.ctx.container.getTcpPort(8080);
const res = await port.fetch("http://container/set-state", {
  body: initialState,
  method: "POST",
});
```

```js
const conn = this.ctx.container.getTcpPort(8080).connect('10.0.0.1:8080');
await conn.opened;


try {
  if (request.body) {
    await request.body.pipeTo(conn.writable);
  }
  return new Response(conn.readable);
} catch (err) {
  console.error("Request body piping failed:", err);
  return new Response("Failed to proxy request body", { status: 502 });
}
```

#### Parameters

* `port` (number): a TCP port number to use for communication with the container.

#### Return values

* `TcpPort`: a `TcpPort` object representing the TCP port. This object can be used to send requests to the container over TCP and HTTP.

### `monitor`

`monitor` returns a promise that resolves when a container exits and errors if a container errors. This is useful for setting up callbacks to handle container status changes in your Workers code.

```js
class MyContainer extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    function onContainerExit() {
      console.log("Container exited");
    }


    // the "err" value can be customized by the destroy() method
    async function onContainerError(err) {
      console.log("Container errored", err);
    }


    this.ctx.container.start();
    this.ctx.container.monitor().then(onContainerExit).catch(onContainerError);
  }
}
```

#### Parameters

* None

#### Return values

* A promise that resolves when the container exits.

## Related resources

* [Containers](https://developers.cloudflare.com/containers)
* [Get Started With Containers](https://developers.cloudflare.com/containers/get-started)

</page>

<page>
---
title: Durable Object ID · Cloudflare Durable Objects docs
description: A Durable Object ID is a 64-digit hexadecimal number used to
  identify a Durable Object. Not all 64-digit hex numbers are valid IDs. Durable
  Object IDs are constructed indirectly via the DurableObjectNamespace
  interface.
lastUpdated: 2025-12-08T15:50:53.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/api/id/
  md: https://developers.cloudflare.com/durable-objects/api/id/index.md
---

## Description

A Durable Object ID is a 64-digit hexadecimal number used to identify a Durable Object. Not all 64-digit hex numbers are valid IDs. Durable Object IDs are constructed indirectly via the [`DurableObjectNamespace`](https://developers.cloudflare.com/durable-objects/api/namespace) interface.

The `DurableObjectId` interface refers to a new or existing Durable Object. This interface is most frequently used by [`DurableObjectNamespace::get`](https://developers.cloudflare.com/durable-objects/api/namespace/#get) to obtain a [`DurableObjectStub`](https://developers.cloudflare.com/durable-objects/api/stub) for submitting requests to a Durable Object. Note that creating an ID for a Durable Object does not create the Durable Object. The Durable Object is created lazily after creating a stub from a `DurableObjectId`. This ensures that objects are not constructed until they are actually accessed.

Logging

If you are experiencing an issue with a particular Durable Object, you may wish to log the `DurableObjectId` from your Worker and include it in your Cloudflare support request.

## Methods

### `toString`

`toString` converts a `DurableObjectId` to a 64 digit hex string. This string is useful for logging purposes or storing the `DurableObjectId` elsewhere, for example, in a session cookie. This string can be used to reconstruct a `DurableObjectId` via `DurableObjectNamespace::idFromString`.

```js
// Create a new unique ID
const id = env.MY_DURABLE_OBJECT.newUniqueId();
// Convert the ID to a string to be saved elsewhere, e.g. a session cookie
const session_id = id.toString();


...
// Recreate the ID from the string
const id = env.MY_DURABLE_OBJECT.idFromString(session_id);
```

#### Parameters

* None.

#### Return values

* A 64 digit hex string.

### `equals`

`equals` is used to compare equality between two instances of `DurableObjectId`.

* JavaScript

  ```js
  const id1 = env.MY_DURABLE_OBJECT.newUniqueId();
  const id2 = env.MY_DURABLE_OBJECT.newUniqueId();
  console.assert(!id1.equals(id2), "Different unique ids should never be equal.");
  ```

* Python

  ```python
  id1 = env.MY_DURABLE_OBJECT.newUniqueId()
  id2 = env.MY_DURABLE_OBJECT.newUniqueId()
  assert not id1.equals(id2), "Different unique ids should never be equal."
  ```

#### Parameters

* A required `DurableObjectId` to compare against.

#### Return values

* A boolean. True if equal and false otherwise.

## Properties

### `name`

`name` is an optional property of a `DurableObjectId`, which returns the name that was used to create the `DurableObjectId` via [`DurableObjectNamespace::idFromName`](https://developers.cloudflare.com/durable-objects/api/namespace/#idfromname). This value is undefined if the `DurableObjectId` was constructed using [`DurableObjectNamespace::newUniqueId`](https://developers.cloudflare.com/durable-objects/api/namespace/#newuniqueid). This value is also undefined within the `ctx.id` passed into the Durable Object constructor (refer to [GitHub issue](https://github.com/cloudflare/workerd/issues/2240) for discussion).

* JavaScript

  ```js
  const uniqueId = env.MY_DURABLE_OBJECT.newUniqueId();
  const fromNameId = env.MY_DURABLE_OBJECT.idFromName("foo");
  console.assert(uniqueId.name === undefined, "unique ids have no name");
  console.assert(
    fromNameId.name === "foo",
    "name matches parameter to idFromName",
  );
  ```

* Python

  ```python
  unique_id = env.MY_DURABLE_OBJECT.newUniqueId()
  from_name_id = env.MY_DURABLE_OBJECT.idFromName("foo")
  assert unique_id.name is None, "unique ids have no name"
  assert from_name_id.name == "foo", "name matches parameter to idFromName"
  ```

## Related resources

* [Durable Objects: Easy, Fast, Correct – Choose Three](https://blog.cloudflare.com/durable-objects-easy-fast-correct-choose-three/).

</page>

<page>
---
title: KV-backed Durable Object Storage (Legacy) · Cloudflare Durable Objects docs
description: The Durable Object Storage API allows Durable Objects to access
  transactional and strongly consistent storage. A Durable Object's attached
  storage is private to its unique instance and cannot be accessed by other
  objects.
lastUpdated: 2025-12-08T15:50:53.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/api/legacy-kv-storage-api/
  md: https://developers.cloudflare.com/durable-objects/api/legacy-kv-storage-api/index.md
---

Note

This page documents the storage API for legacy KV-backed Durable Objects.

For the newer SQLite-backed Durable Object storage API, refer to [SQLite-backed Durable Object Storage](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api).

The Durable Object Storage API allows Durable Objects to access transactional and strongly consistent storage. A Durable Object's attached storage is private to its unique instance and cannot be accessed by other objects.

The Durable Object Storage API comes with several methods, including SQL, point-in-time recovery (PITR), key-value (KV), and alarm APIs. Available API methods depend on the storage backend for a Durable Objects class, either [SQLite](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#create-sqlite-backed-durable-object-class) or [KV](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/#create-durable-object-class-with-key-value-storage).

| Methods 1 | SQLite-backed Durable Object class | KV-backed Durable Object class |
| - | - | - |
| SQL API | ✅ | ❌ |
| PITR API | ✅ | ❌ |
| Synchronous KV API | ✅ 2, 3 | ❌ |
| Asynchronous KV API | ✅ 3 | ✅ |
| Alarms API | ✅ | ✅ |

Footnotes

1 Each method is implicitly wrapped inside a transaction, such that its results are atomic and isolated from all other storage operations, even when accessing multiple key-value pairs.

2 KV API methods like `get()`, `put()`, `delete()`, or `list()` store data in a hidden SQLite table `__cf_kv`. Note that you will be able to view this table when listing all tables, but you will not be able to access its content through the SQL API.

3 SQLite-backed Durable Objects also use [synchronous KV API methods](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/#synchronous-kv-api) using `ctx.storage.kv`, whereas KV-backed Durable Objects only provide [asynchronous KV API methods](https://developers.cloudflare.com/durable-objects/api/legacy-kv-storage-api/#asynchronous-kv-api).

Recommended SQLite-backed Durable Objects

Cloudflare recommends all new Durable Object namespaces use the [SQLite storage backend](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#create-sqlite-backed-durable-object-class). These Durable Objects can continue to use storage [key-value API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/#synchronous-kv-api).

Additionally, SQLite-backed Durable Objects allow you to store more types of data (such as tables), and offer Point In Time Recovery API which can restore a Durable Object's embedded SQLite database contents (both SQL data and key-value data) to any point in the past 30 days.

The [key-value storage backend](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/#create-durable-object-class-with-key-value-storage) remains for backwards compatibility, and a migration path from KV storage backend to SQLite storage backend for existing Durable Object namespaces will be available in the future.

## Access storage

Durable Objects gain access to Storage API via the `DurableObjectStorage` interface and accessed by the `DurableObjectState::storage` property. This is frequently accessed via `this.ctx.storage` with the `ctx` parameter passed to the Durable Object constructor.

The following code snippet shows you how to store and retrieve data using the Durable Object Storage API.

* JavaScript

  ```js
  export class Counter extends DurableObject {
    constructor(ctx, env) {
      super(ctx, env);
    }


    async increment() {
      let value = (await this.ctx.storage.get("value")) || 0;
      value += 1;
      await this.ctx.storage.put("value", value);
      return value;
    }
  }
  ```

* TypeScript

  ```ts
  export class Counter extends DurableObject {
    constructor(ctx: DurableObjectState, env: Env) {
      super(ctx, env);
    }


    async increment(): Promise<number> {
      let value: number = (await this.ctx.storage.get("value")) || 0;
      value += 1;
      await this.ctx.storage.put("value", value);
      return value;
    }
  }
  ```

* Python

  ```python
  from workers import DurableObject


  class Counter(DurableObject):
    def __init__(self, ctx, env):
      super().__init__(ctx, env)


    async def increment(self):
      value = (await self.ctx.storage.get("value")) or 0
      value += 1
      await self.ctx.storage.put("value", value)
      return value
  ```

JavaScript is a single-threaded and event-driven programming language. This means that JavaScript runtimes, by default, allow requests to interleave with each other which can lead to concurrency bugs. The Durable Objects runtime uses a combination of input gates and output gates to avoid this type of concurrency bug when performing storage operations. Learn more in our [blog post](https://blog.cloudflare.com/durable-objects-easy-fast-correct-choose-three/).

## Asynchronous KV API

KV-backed Durable Objects provide KV API methods which are asynchronous.

### get

* `ctx.storage.get(key string, options Object optional)`: Promise\<any>

  * Retrieves the value associated with the given key. The type of the returned value will be whatever was previously written for the key, or undefined if the key does not exist.

* `ctx.storage.get(keys Array<string>, options Object optional)`: Promise\<Map\<string, any>>

  * Retrieves the values associated with each of the provided keys. The type of each returned value in the [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) will be whatever was previously written for the corresponding key. Results in the `Map` will be sorted in increasing order of their UTF-8 encodings, with any requested keys that do not exist being omitted. Supports up to 128 keys at a time.

#### Supported options

* `allowConcurrency`: boolean

  * By default, the system will pause delivery of I/O events to the Object while a storage operation is in progress, in order to avoid unexpected race conditions. Pass `allowConcurrency: true` to opt out of this behavior and allow concurrent events to be delivered.

* `noCache`: boolean

  * If true, then the key/value will not be inserted into the in-memory cache. If the key is already in the cache, the cached value will be returned, but its last-used time will not be updated. Use this when you expect this key will not be used again in the near future. This flag is only a hint. This flag will never change the semantics of your code, but it may affect performance.

### put

* `put(key string, value any, options Object optional)`: Promise

  * Stores the value and associates it with the given key. The value can be any type supported by the [structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm), which is true of most types.

    The size of keys and values have different limits depending on the Durable Object storage backend you are using. Refer to either:

    * [SQLite-backed Durable Object limits](https://developers.cloudflare.com/durable-objects/platform/limits/#sqlite-backed-durable-objects-general-limits)
    * [KV-backed Durable Object limits](https://developers.cloudflare.com/durable-objects/platform/limits/#key-value-backed-durable-objects-general-limits).

* `put(entries Object, options Object optional)`: Promise

  * Takes an Object and stores each of its keys and values to storage.

  * Each value can be any type supported by the [structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm), which is true of most types.

  * Supports up to 128 key-value pairs at a time. The size of keys and values have different limits depending on the flavor of Durable Object you are using. Refer to either:

    * [SQLite-backed Durable Object limits](https://developers.cloudflare.com/durable-objects/platform/limits/#sqlite-backed-durable-objects-general-limits)
    * [KV-backed Durable Object limits](https://developers.cloudflare.com/durable-objects/platform/limits/#key-value-backed-durable-objects-general-limits)

### delete

* `delete(key string, options Object optional)`: Promise\<boolean>

  * Deletes the key and associated value. Returns `true` if the key existed or `false` if it did not.

* `delete(keys Array<string>, options Object optional)`: Promise\<number>

  * Deletes the provided keys and their associated values. Supports up to 128 keys at a time. Returns a count of the number of key-value pairs deleted.

#### Supported options

* `put()`, `delete()` and `deleteAll()` support the following options:

* `allowUnconfirmed` boolean

  * By default, the system will pause outgoing network messages from the Durable Object until all previous writes have been confirmed flushed to disk. If the write fails, the system will reset the Object, discard all outgoing messages, and respond to any clients with errors instead.

  * This way, Durable Objects can continue executing in parallel with a write operation, without having to worry about prematurely confirming writes, because it is impossible for any external party to observe the Object's actions unless the write actually succeeds.

  * After any write, subsequent network messages may be slightly delayed. Some applications may consider it acceptable to communicate on the basis of unconfirmed writes. Some programs may prefer to allow network traffic immediately. In this case, set `allowUnconfirmed` to `true` to opt out of the default behavior.

  * If you want to allow some outgoing network messages to proceed immediately but not others, you can use the allowUnconfirmed option to avoid blocking the messages that you want to proceed and then separately call the [`sync()`](#sync) method, which returns a promise that only resolves once all previous writes have successfully been persisted to disk.

* `noCache` boolean

  * If true, then the key/value will be discarded from memory as soon as it has completed writing to disk.

  * Use `noCache` if the key will not be used again in the near future. `noCache` will never change the semantics of your code, but it may affect performance.

  * If you use `get()` to retrieve the key before the write has completed, the copy from the write buffer will be returned, thus ensuring consistency with the latest call to `put()`.

Automatic write coalescing

If you invoke `put()` (or `delete()`) multiple times without performing any `await` in the meantime, the operations will automatically be combined and submitted atomically. In case of a machine failure, either all of the writes will have been stored to disk or none of the writes will have been stored to disk.

Write buffer behavior

The `put()` method returns a `Promise`, but most applications can discard this promise without using `await`. The `Promise` usually completes immediately, because `put()` writes to an in-memory write buffer that is flushed to disk asynchronously. However, if an application performs a large number of `put()` without waiting for any I/O, the write buffer could theoretically grow large enough to cause the isolate to exceed its 128 MB memory limit. To avoid this scenario, such applications should use `await` on the `Promise` returned by `put()`. The system will then apply backpressure onto the application, slowing it down so that the write buffer has time to flush. Using `await` will disable automatic write coalescing.

### list

* `list(options Object optional)`: Promise\<Map\<string, any>>

  * Returns all keys and values associated with the current Durable Object in ascending sorted order based on the keys' UTF-8 encodings.

  * The type of each returned value in the [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) will be whatever was previously written for the corresponding key.

  * Be aware of how much data may be stored in your Durable Object before calling this version of `list` without options because all the data will be loaded into the Durable Object's memory, potentially hitting its [limit](https://developers.cloudflare.com/durable-objects/platform/limits/). If that is a concern, pass options to `list` as documented below.

#### Supported options

* `start` string

  * Key at which the list results should start, inclusive.

* `startAfter` string

  * Key after which the list results should start, exclusive. Cannot be used simultaneously with `start`.

* `end` string

  * Key at which the list results should end, exclusive.

* `prefix` string

  * Restricts results to only include key-value pairs whose keys begin with the prefix.

* `reverse` boolean

  * If true, return results in descending order instead of the default ascending order.
  * Enabling `reverse` does not change the meaning of `start`, `startKey`, or `endKey`. `start` still defines the smallest key in lexicographic order that can be returned (inclusive), effectively serving as the endpoint for a reverse-order list. `end` still defines the largest key in lexicographic order that the list should consider (exclusive), effectively serving as the starting point for a reverse-order list.

* `limit` number

  * Maximum number of key-value pairs to return.

* `allowConcurrency` boolean

  * Same as the option to [`get()`](#do-kv-async-get), above.

* `noCache` boolean

  * Same as the option to [`get()`](#do-kv-async-get), above.

## Alarms

### `getAlarm`

* `getAlarm(options Object optional)`: Promise\<Number | null>
  * Retrieves the current alarm time (if set) as integer milliseconds since epoch. The alarm is considered to be set if it has not started, or if it has failed and any retry has not begun. If no alarm is set, `getAlarm()` returns `null`.

#### Supported options

* Same options as [`get()`](#get), but without `noCache`.

### `setAlarm`

* `setAlarm(scheduledTime Date | number, options Object optional)`: Promise

  * Sets the current alarm time, accepting either a JavaScript `Date`, or integer milliseconds since epoch.

  If `setAlarm()` is called with a time equal to or before `Date.now()`, the alarm will be scheduled for asynchronous execution in the immediate future. If the alarm handler is currently executing in this case, it will not be canceled. Alarms can be set to millisecond granularity and will usually execute within a few milliseconds after the set time, but can be delayed by up to a minute due to maintenance or failures while failover takes place.

### `deleteAlarm`

* `deleteAlarm(options Object optional)`: Promise
  * Deletes the alarm if one exists. Does not cancel the alarm handler if it is currently executing.

#### Supported options

* `setAlarm()` and `deleteAlarm()` support the same options as [`put()`](#put), but without `noCache`.

## Other

### `deleteAll`

* `deleteAll(options Object optional)`: Promise

  * Deletes all stored data, effectively deallocating all storage used by the Durable Object. For Durable Objects with a key-value storage backend, `deleteAll()` removes all keys and associated values for an individual Durable Object. For Durable Objects with a [SQLite storage backend](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#create-sqlite-backed-durable-object-class), `deleteAll()` removes the entire contents of a Durable Object's private SQLite database, including both SQL data and key-value data.
  * For Durable Objects with a key-value storage backend, an in-progress `deleteAll()` operation can fail, which may leave a subset of data undeleted. Durable Objects with a SQLite storage backend do not have a partial `deleteAll()` issue because `deleteAll()` operations are atomic (all or nothing).
  * `deleteAll()` does not proactively delete [alarms](https://developers.cloudflare.com/durable-objects/api/alarms/). Use [`deleteAlarm()`](https://developers.cloudflare.com/durable-objects/api/alarms/#deletealarm) to delete an alarm.

### `transactionSync`

* `transactionSync(callback)`: any

  * Only available when using SQLite-backed Durable Objects.

  * Invokes `callback()` wrapped in a transaction, and returns its result.

  * If `callback()` throws an exception, the transaction will be rolled back.

  * The callback must complete synchronously, that is, it should not be declared `async` nor otherwise return a Promise. Only synchronous storage operations can be part of the transaction. This is intended for use with SQL queries using [`ctx.storage.sql.exec()`](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/#exec), which complete sychronously.

### `transaction`

* `transaction(closureFunction(txn))`: Promise

  * Runs the sequence of storage operations called on `txn` in a single transaction that either commits successfully or aborts.

  * Explicit transactions are no longer necessary. Any series of write operations with no intervening `await` will automatically be submitted atomically, and the system will prevent concurrent events from executing while `await` a read operation (unless you use `allowConcurrency: true`). Therefore, a series of reads followed by a series of writes (with no other intervening I/O) are automatically atomic and behave like a transaction.

* `txn`

  * Provides access to the `put()`, `get()`, `delete()`, and `list()` methods documented above to run in the current transaction context. In order to get transactional behavior within a transaction closure, you must call the methods on the `txn` Object instead of on the top-level `ctx.storage` Object.\
    \
    Also supports a `rollback()` function that ensures any changes made during the transaction will be rolled back rather than committed. After `rollback()` is called, any subsequent operations on the `txn` Object will fail with an exception. `rollback()` takes no parameters and returns nothing to the caller.

  * When using [the SQLite-backed storage engine](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#sqlite-storage-backend), the `txn` object is obsolete. Any storage operations performed directly on the `ctx.storage` object, including SQL queries using [`ctx.storage.sql.exec()`](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/#exec), will be considered part of the transaction.

### `sync`

* `sync()`: Promise

  * Synchronizes any pending writes to disk.

  * This is similar to normal behavior from automatic write coalescing. If there are any pending writes in the write buffer (including those submitted with [the `allowUnconfirmed` option](#supported-options-1)), the returned promise will resolve when they complete. If there are no pending writes, the returned promise will be already resolved.

## Related resources

* [Durable Objects: Easy, Fast, Correct Choose Three](https://blog.cloudflare.com/durable-objects-easy-fast-correct-choose-three/)
* [Zero-latency SQLite storage in every Durable Object blog](https://blog.cloudflare.com/sqlite-in-durable-objects/)
* [WebSockets API](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)

</page>

<page>
---
title: Durable Object Namespace · Cloudflare Durable Objects docs
description: A Durable Object namespace is a set of Durable Objects that are
  backed by the same Durable Object class. There is only one Durable Object
  namespace per class. A Durable Object namespace can contain any number of
  Durable Objects.
lastUpdated: 2025-12-08T15:50:53.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/api/namespace/
  md: https://developers.cloudflare.com/durable-objects/api/namespace/index.md
---

## Description

A Durable Object namespace is a set of Durable Objects that are backed by the same Durable Object class. There is only one Durable Object namespace per class. A Durable Object namespace can contain any number of Durable Objects.

The `DurableObjectNamespace` interface is used to obtain a reference to new or existing Durable Objects. The interface is accessible from the fetch handler on a Cloudflare Worker via the `env` parameter, which is the standard interface when referencing bindings declared in the [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/).

This interface defines several [methods](https://developers.cloudflare.com/durable-objects/api/namespace/#methods) that can be used to create an ID for a Durable Object. Note that creating an ID for a Durable Object does not create the Durable Object. The Durable Object is created lazily after calling [`DurableObjectNamespace::get`](https://developers.cloudflare.com/durable-objects/api/namespace/#get) to create a [`DurableObjectStub`](https://developers.cloudflare.com/durable-objects/api/stub) from a `DurableObjectId`. This ensures that objects are not constructed until they are actually accessed.

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  // Durable Object
  export class MyDurableObject extends DurableObject {
    ...
  }


  // Worker
  export default {
    async fetch(request, env) {
      // A stub is a client Object used to invoke methods defined by the Durable Object
      const stub = env.MY_DURABLE_OBJECT.getByName("foo");
      ...
    }
  }
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    MY_DURABLE_OBJECT: DurableObjectNamespace<MyDurableObject>;
  }


  // Durable Object
  export class MyDurableObject extends DurableObject {
    ...
  }


  // Worker
  export default {
    async fetch(request, env) {
      // A stub is a client Object used to invoke methods defined by the Durable Object
      const stub = env.MY_DURABLE_OBJECT.getByName("foo");
      ...
    }
  } satisfies ExportedHandler<Env>;
  ```

* Python

  ```python
  from workers import DurableObject, WorkerEntrypoint


  # Durable Object
  class MyDurableObject(DurableObject):
    pass


  # Worker
  class Default(WorkerEntrypoint):
    async def fetch(self, request):
      # A stub is a client Object used to invoke methods defined by the Durable Object
      stub = self.env.MY_DURABLE_OBJECT.getByName("foo")
      # ...
  ```

## Methods

### `idFromName`

`idFromName` creates a unique [`DurableObjectId`](https://developers.cloudflare.com/durable-objects/api/id) which refers to an individual instance of the Durable Object class. Named Durable Objects are the most common method of referring to Durable Objects.

```js
const fooId = env.MY_DURABLE_OBJECT.idFromName("foo");
const barId = env.MY_DURABLE_OBJECT.idFromName("bar");
```

#### Parameters

* A required string to be used to generate a [`DurableObjectId`](https://developers.cloudflare.com/durable-objects/api/id) corresponding to the name of a Durable Object.

#### Return values

* A [`DurableObjectId`](https://developers.cloudflare.com/durable-objects/api/id) referring to an instance of a Durable Object class.

### `newUniqueId`

`newUniqueId` creates a randomly generated and unique [`DurableObjectId`](https://developers.cloudflare.com/durable-objects/api/id) which refers to an individual instance of the Durable Object class. IDs created using `newUniqueId`, will need to be stored as a string in order to refer to the same Durable Object again in the future. For example, the ID can be stored in Workers KV, another Durable Object, or in a cookie in the user's browser.

```js
const id = env.MY_DURABLE_OBJECT.newUniqueId();
const euId = env.MY_DURABLE_OBJECT.newUniqueId({ jurisdiction: "eu" });
```

`newUniqueId` results in lower request latency at first use

The first time you get a Durable Object stub based on an ID derived from a name, the system has to take into account the possibility that a Worker on the opposite side of the world could have coincidentally accessed the same named Durable Object at the same time. To guarantee that only one instance of the Durable Object is created, the system must check that the Durable Object has not been created anywhere else. Due to the inherent limit of the speed of light, this round-the-world check can take up to a few hundred milliseconds. `newUniqueId` can skip this check.

After this first use, the location of the Durable Object will be cached around the world so that subsequent lookups are faster.

#### Parameters

* An optional object with the key `jurisdiction` and value of a [jurisdiction](https://developers.cloudflare.com/durable-objects/reference/data-location/#restrict-durable-objects-to-a-jurisdiction) string.

#### Return values

* A [`DurableObjectId`](https://developers.cloudflare.com/durable-objects/api/id) referring to an instance of the Durable Object class.

### `idFromString`

`idFromString` creates a [`DurableObjectId`](https://developers.cloudflare.com/durable-objects/api/id) from a previously generated ID that has been converted to a string. This method throws an exception if the ID is invalid, for example, if the ID was not created from the same `DurableObjectNamespace`.

```js
// Create a new unique ID
const id = env.MY_DURABLE_OBJECT.newUniqueId();
// Convert the ID to a string to be saved elsewhere, e.g. a session cookie
const session_id = id.toString();


...
// Recreate the ID from the string
const id = env.MY_DURABLE_OBJECT.idFromString(session_id);
```

#### Parameters

* A required string corresponding to a [`DurableObjectId`](https://developers.cloudflare.com/durable-objects/api/id) previously generated either by `newUniqueId` or `idFromName`.

#### Return values

* A [`DurableObjectId`](https://developers.cloudflare.com/durable-objects/api/id) referring to an instance of a Durable Object class.

### `get`

`get` obtains a [`DurableObjectStub`](https://developers.cloudflare.com/durable-objects/api/stub) from a [`DurableObjectId`](https://developers.cloudflare.com/durable-objects/api/id) which can be used to invoke methods on a Durable Object.

This method returns the stub immediately, often before a connection has been established to the Durable Object. This allows requests to be sent to the instance right away, without waiting for a network round trip.

```js
const id = env.MY_DURABLE_OBJECT.newUniqueId();
const stub = env.MY_DURABLE_OBJECT.get(id);
```

#### Parameters

* A required [`DurableObjectId`](https://developers.cloudflare.com/durable-objects/api/id)
* An optional object with the key `locationHint` and value of a [locationHint](https://developers.cloudflare.com/durable-objects/reference/data-location/#provide-a-location-hint) string.

#### Return values

* A [`DurableObjectStub`](https://developers.cloudflare.com/durable-objects/api/stub) referring to an instance of a Durable Object class.

### `getByName`

`getByName` obtains a [`DurableObjectStub`](https://developers.cloudflare.com/durable-objects/api/stub) from a provided name, which can be used to invoke methods on a Durable Object.

This method returns the stub immediately, often before a connection has been established to the Durable Object. This allows requests to be sent to the instance right away, without waiting for a network round trip.

```js
const fooStub = env.MY_DURABLE_OBJECT.getByName("foo");
const barStub = env.MY_DURABLE_OBJECT.getByName("bar");
```

#### Parameters

* A required string to be used to generate a [`DurableObjectStub`](https://developers.cloudflare.com/durable-objects/api/stub) corresponding to an instance of the Durable Object class with the provided name.

#### Return values

* A [`DurableObjectStub`](https://developers.cloudflare.com/durable-objects/api/stub) referring to an instance of a Durable Object class.

### `jurisdiction`

`jurisdiction` creates a subnamespace from a namespace where all Durable Object IDs and references created from that subnamespace will be restricted to the specified [jurisdiction](https://developers.cloudflare.com/durable-objects/reference/data-location/#restrict-durable-objects-to-a-jurisdiction).

```js
const subnamespace = env.MY_DURABLE_OBJECT.jurisdiction("eu");
const euStub = subnamespace.getByName("foo");
```

#### Parameters

* A required [jurisdiction](https://developers.cloudflare.com/durable-objects/reference/data-location/#restrict-durable-objects-to-a-jurisdiction) string.

#### Return values

* A `DurableObjectNamespace` scoped to a particular regulatory or geographic jurisdiction. Additional geographic jurisdictions are continuously evaluated, so share requests in the [Durable Objects Discord channel](https://discord.com/channels/595317990191398933/773219443911819284).

## Related resources

* [Durable Objects: Easy, Fast, Correct – Choose Three](https://blog.cloudflare.com/durable-objects-easy-fast-correct-choose-three/).

</page>

<page>
---
title: SQLite-backed Durable Object Storage · Cloudflare Durable Objects docs
description: The Durable Object Storage API allows Durable Objects to access
  transactional and strongly consistent storage. A Durable Object's attached
  storage is private to its unique instance and cannot be accessed by other
  objects.
lastUpdated: 2026-01-09T16:09:30.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/
  md: https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/index.md
---

Note

This page documents the storage API for the newer SQLite-backed Durable Objects.

For the legacy KV-backed Durable Object storage API, refer to [KV-backed Durable Object Storage (Legacy)](https://developers.cloudflare.com/durable-objects/api/legacy-kv-storage-api/).

The Durable Object Storage API allows Durable Objects to access transactional and strongly consistent storage. A Durable Object's attached storage is private to its unique instance and cannot be accessed by other objects.

The Durable Object Storage API comes with several methods, including SQL, point-in-time recovery (PITR), key-value (KV), and alarm APIs. Available API methods depend on the storage backend for a Durable Objects class, either [SQLite](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#create-sqlite-backed-durable-object-class) or [KV](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/#create-durable-object-class-with-key-value-storage).

| Methods 1 | SQLite-backed Durable Object class | KV-backed Durable Object class |
| - | - | - |
| SQL API | ✅ | ❌ |
| PITR API | ✅ | ❌ |
| Synchronous KV API | ✅ 2, 3 | ❌ |
| Asynchronous KV API | ✅ 3 | ✅ |
| Alarms API | ✅ | ✅ |

Footnotes

1 Each method is implicitly wrapped inside a transaction, such that its results are atomic and isolated from all other storage operations, even when accessing multiple key-value pairs.

2 KV API methods like `get()`, `put()`, `delete()`, or `list()` store data in a hidden SQLite table `__cf_kv`. Note that you will be able to view this table when listing all tables, but you will not be able to access its content through the SQL API.

3 SQLite-backed Durable Objects also use [synchronous KV API methods](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/#synchronous-kv-api) using `ctx.storage.kv`, whereas KV-backed Durable Objects only provide [asynchronous KV API methods](https://developers.cloudflare.com/durable-objects/api/legacy-kv-storage-api/#asynchronous-kv-api).

Recommended SQLite-backed Durable Objects

Cloudflare recommends all new Durable Object namespaces use the [SQLite storage backend](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#create-sqlite-backed-durable-object-class). These Durable Objects can continue to use storage [key-value API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/#synchronous-kv-api).

Additionally, SQLite-backed Durable Objects allow you to store more types of data (such as tables), and offer Point In Time Recovery API which can restore a Durable Object's embedded SQLite database contents (both SQL data and key-value data) to any point in the past 30 days.

The [key-value storage backend](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/#create-durable-object-class-with-key-value-storage) remains for backwards compatibility, and a migration path from KV storage backend to SQLite storage backend for existing Durable Object namespaces will be available in the future.

Storage billing on SQLite-backed Durable Objects

Storage billing for SQLite-backed Durable Objects will be enabled in January 2026, with a target date of January 7, 2026 (no earlier). Only SQLite storage usage on and after the billing target date will incur charges. For more information, refer to [Billing for SQLite Storage](https://developers.cloudflare.com/changelog/2025-12-12-durable-objects-sqlite-storage-billing/).

## Access storage

Durable Objects gain access to Storage API via the `DurableObjectStorage` interface and accessed by the `DurableObjectState::storage` property. This is frequently accessed via `this.ctx.storage` with the `ctx` parameter passed to the Durable Object constructor.

The following code snippet shows you how to store and retrieve data using the Durable Object Storage API.

* JavaScript

  ```js
  export class Counter extends DurableObject {
    constructor(ctx, env) {
      super(ctx, env);
    }


    async increment() {
      let value = (await this.ctx.storage.get("value")) || 0;
      value += 1;
      await this.ctx.storage.put("value", value);
      return value;
    }
  }
  ```

* TypeScript

  ```ts
  export class Counter extends DurableObject {
    constructor(ctx: DurableObjectState, env: Env) {
      super(ctx, env);
    }


      async increment(): Promise<number> {
        let value: number = (await this.ctx.storage.get('value')) || 0;
        value += 1;
        await this.ctx.storage.put('value', value);
        return value;
      }


  }
  ```

* Python

  ```python
  from workers import DurableObject


  class Counter(DurableObject):
    def __init__(self, ctx, env):
      super().__init__(ctx, env)


    async def increment(self):
      value = (await self.ctx.storage.get('value')) or 0
      value += 1
      await self.ctx.storage.put('value', value)
      return value
  ```

JavaScript is a single-threaded and event-driven programming language. This means that JavaScript runtimes, by default, allow requests to interleave with each other which can lead to concurrency bugs. The Durable Objects runtime uses a combination of input gates and output gates to avoid this type of concurrency bug when performing storage operations. Learn more in our [blog post](https://blog.cloudflare.com/durable-objects-easy-fast-correct-choose-three/).

## SQL API

The `SqlStorage` interface encapsulates methods that modify the SQLite database embedded within a Durable Object. The `SqlStorage` interface is accessible via the [`sql` property](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/#sql) of `DurableObjectStorage` class.

For example, using `sql.exec()` a user can create a table and insert rows.

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export class MyDurableObject extends DurableObject {
    sql: SqlStorage;
    constructor(ctx: DurableObjectState, env: Env) {
      super(ctx, env);
      this.sql = ctx.storage.sql;


      this.sql.exec(`
        CREATE TABLE IF NOT EXISTS artist(
          artistid    INTEGER PRIMARY KEY,
          artistname  TEXT
        );
        INSERT INTO artist (artistid, artistname) VALUES
          (123, 'Alice'),
          (456, 'Bob'),
          (789, 'Charlie');
      `);
    }
  }
  ```

* Python

  ```python
  from workers import DurableObject


  class MyDurableObject(DurableObject):
    def __init__(self, ctx, env):
      super().__init__(ctx, env)
      self.sql = ctx.storage.sql


      self.sql.exec("""
        CREATE TABLE IF NOT EXISTS artist(
          artistid    INTEGER PRIMARY KEY,
          artistname  TEXT
        );
        INSERT INTO artist (artistid, artistname) VALUES
          (123, 'Alice'),
          (456, 'Bob'),
          (789, 'Charlie');
      """)
  ```

- SQL API methods accessed with `ctx.storage.sql` are only allowed on [Durable Object classes with SQLite storage backend](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#create-sqlite-backed-durable-object-class) and will return an error if called on Durable Object classes with a KV-storage backend.
- When writing data, every row update of an index counts as an additional row. However, indexes may be beneficial for read-heavy use cases. Refer to [Index for SQLite Durable Objects](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#index-for-sqlite-durable-objects).
- Writing data to [SQLite virtual tables](https://www.sqlite.org/vtab.html) also counts towards rows written.

Durable Objects support a subset of SQLite extensions for added functionality, including:

* [FTS5 module](https://www.sqlite.org/fts5.html) for full-text search (including `fts5vocab`).
* [JSON extension](https://www.sqlite.org/json1.html) for JSON functions and operators.
* [Math functions](https://sqlite.org/lang_mathfunc.html).

Refer to the [source code](https://github.com/cloudflare/workerd/blob/4c42a4a9d3390c88e9bd977091c9d3395a6cd665/src/workerd/util/sqlite.c%2B%2B#L269) for the full list of supported functions.

### `exec`

`exec(query: string, ...bindings: any[])`: SqlStorageCursor

#### Parameters

* `query`: string
  * The SQL query string to be executed. `query` can contain `?` placeholders for parameter bindings. Multiple SQL statements, separated with a semicolon, can be executed in the `query`. With multiple SQL statements, any parameter bindings are applied to the last SQL statement in the `query`, and the returned cursor is only for the last SQL statement.
* `...bindings`: any\[] Optional
  * Optional variable number of arguments that correspond to the `?` placeholders in `query`.

#### Returns

A cursor (`SqlStorageCursor`) to iterate over query row results as objects. `SqlStorageCursor` is a JavaScript [Iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol), which supports iteration using `for (let row of cursor)`. `SqlStorageCursor` is also a JavaScript [Iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterator_protocol), which supports iteration using `cursor.next()`.

`SqlStorageCursor` supports the following methods:

* `next()`
  * Returns an object representing the next value of the cursor. The returned object has `done` and `value` properties adhering to the JavaScript [Iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterator_protocol). `done` is set to `false` when a next value is present, and `value` is set to the next row object in the query result. `done` is set to `true` when the entire cursor is consumed, and no `value` is set.

* `toArray()`
  * Iterates through remaining cursor value(s) and returns an array of returned row objects.

* `one()`
  * Returns a row object if query result has exactly one row. If query result has zero rows or more than one row, `one()` throws an exception.

* `raw()`: Iterator

  * Returns an Iterator over the same query results, with each row as an array of column values (with no column names) rather than an object.
  * Returned Iterator supports `next()` and `toArray()` methods above.
  * Returned cursor and `raw()` iterator iterate over the same query results and can be combined. For example:

- TypeScript

  ```ts
  let cursor = this.sql.exec("SELECT * FROM artist ORDER BY artistname ASC;");
  let rawResult = cursor.raw().next();


  if (!rawResult.done) {
    console.log(rawResult.value); // prints [ 123, 'Alice' ]
  } else {
    // query returned zero results
  }


  console.log(cursor.toArray()); // prints [{ artistid: 456, artistname: 'Bob' },{ artistid: 789, artistname: 'Charlie' }]
  ```

- Python

  ```python
  cursor = self.sql.exec("SELECT * FROM artist ORDER BY artistname ASC;")
  raw_result = cursor.raw().next()


  if not raw_result.done:
    print(raw_result.value)  # prints [ 123, 'Alice' ]
  else:
    # query returned zero results
    pass


  print(cursor.toArray())  # prints [{ artistid: 456, artistname: 'Bob' },{ artistid: 789, artistname: 'Charlie' }]
  ```

`SqlStorageCursor` has the following properties:

* `columnNames`: string\[]
  * The column names of the query in the order they appear in each row array returned by the `raw` iterator.
* `rowsRead`: number
  * The number of rows read so far as part of this SQL `query`. This may increase as you iterate the cursor. The final value is used for [SQL billing](https://developers.cloudflare.com/durable-objects/platform/pricing/#sqlite-storage-backend).
* `rowsWritten`: number
  * The number of rows written so far as part of this SQL `query`. This may increase as you iterate the cursor. The final value is used for [SQL billing](https://developers.cloudflare.com/durable-objects/platform/pricing/#sqlite-storage-backend).
* Any numeric value in a column is affected by JavaScript's 52-bit precision for numbers. If you store a very large number (in `int64`), then retrieve the same value, the returned value may be less precise than your original number.

SQL transactions

Note that `sql.exec()` cannot execute transaction-related statements like `BEGIN TRANSACTION` or `SAVEPOINT`. Instead, use the [`ctx.storage.transaction()`](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/#transaction) or [`ctx.storage.transactionSync()`](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/#transactionsync) APIs to start a transaction, and then execute SQL queries in your callback.

#### Examples

[SQL API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/#exec) examples below use the following SQL schema:

```ts
import { DurableObject } from "cloudflare:workers";


export class MyDurableObject extends DurableObject {
  sql: SqlStorage
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;


    this.sql.exec(`CREATE TABLE IF NOT EXISTS artist(
      artistid    INTEGER PRIMARY KEY,
      artistname  TEXT
    );INSERT INTO artist (artistid, artistname) VALUES
      (123, 'Alice'),
      (456, 'Bob'),
      (789, 'Charlie');`
    );
  }
}
```

Iterate over query results as row objects:

```ts
  let cursor = this.sql.exec("SELECT * FROM artist;");


  for (let row of cursor) {
    // Iterate over row object and do something
  }
```

Convert query results to an array of row objects:

```ts
  // Return array of row objects: [{"artistid":123,"artistname":"Alice"},{"artistid":456,"artistname":"Bob"},{"artistid":789,"artistname":"Charlie"}]
  let resultsArray1 = this.sql.exec("SELECT * FROM artist;").toArray();
  // OR
  let resultsArray2 = Array.from(this.sql.exec("SELECT * FROM artist;"));
  // OR
  let resultsArray3 = [...this.sql.exec("SELECT * FROM artist;")]; // JavaScript spread syntax
```

Convert query results to an array of row values arrays:

```ts
  // Returns [[123,"Alice"],[456,"Bob"],[789,"Charlie"]]
  let cursor = this.sql.exec("SELECT * FROM artist;");
  let resultsArray = cursor.raw().toArray();


  // Returns ["artistid","artistname"]
  let columnNameArray = this.sql.exec("SELECT * FROM artist;").columnNames.toArray();
```

Get first row object of query results:

```ts
  // Returns {"artistid":123,"artistname":"Alice"}
  let firstRow = this.sql.exec("SELECT * FROM artist ORDER BY artistname DESC;").toArray()[0];
```

Check if query results have exactly one row:

```ts
  // returns error
  this.sql.exec("SELECT * FROM artist ORDER BY artistname ASC;").one();


  // returns { artistid: 123, artistname: 'Alice' }
  let oneRow = this.sql.exec("SELECT * FROM artist WHERE artistname = ?;", "Alice").one()
```

Returned cursor behavior:

```ts
  let cursor = this.sql.exec("SELECT * FROM artist ORDER BY artistname ASC;");
  let result = cursor.next();
  if (!result.done) {
    console.log(result.value); // prints { artistid: 123, artistname: 'Alice' }
  } else {
    // query returned zero results
  }


  let remainingRows = cursor.toArray();
  console.log(remainingRows); // prints [{ artistid: 456, artistname: 'Bob' },{ artistid: 789, artistname: 'Charlie' }]
```

Returned cursor and `raw()` iterator iterate over the same query results:

```ts
  let cursor = this.sql.exec("SELECT * FROM artist ORDER BY artistname ASC;");
  let result = cursor.raw().next();


  if (!result.done) {
    console.log(result.value); // prints [ 123, 'Alice' ]
  } else {
    // query returned zero results
  }


  console.log(cursor.toArray()); // prints [{ artistid: 456, artistname: 'Bob' },{ artistid: 789, artistname: 'Charlie' }]
```

`sql.exec().rowsRead()`:

```ts
  let cursor = this.sql.exec("SELECT * FROM artist;");
  cursor.next()
  console.log(cursor.rowsRead); // prints 1


  cursor.toArray(); // consumes remaining cursor
  console.log(cursor.rowsRead); // prints 3
```

### `databaseSize`

`databaseSize`: number

#### Returns

The current SQLite database size in bytes.

* TypeScript

  ```ts
  let size = ctx.storage.sql.databaseSize;
  ```

* Python

  ```python
  size = ctx.storage.sql.databaseSize
  ```

## PITR (Point In Time Recovery) API

For [SQLite-backed Durable Objects](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#create-sqlite-backed-durable-object-class), the following point-in-time-recovery (PITR) API methods are available to restore a Durable Object's embedded SQLite database to any point in time in the past 30 days. These methods apply to the entire SQLite database contents, including both the object's stored SQL data and stored key-value data using the key-value `put()` API. The PITR API is not supported in local development because a durable log of data changes is not stored locally.

The PITR API represents points in time using 'bookmarks'. A bookmark is a mostly alphanumeric string like `0000007b-0000b26e-00001538-0c3e87bb37b3db5cc52eedb93cd3b96b`. Bookmarks are designed to be lexically comparable: a bookmark representing an earlier point in time compares less than one representing a later point, using regular string comparison.

### `getCurrentBookmark`

`ctx.storage.getCurrentBookmark()`: Promise\<string>

* Returns a bookmark representing the current point in time in the object's history.

### `getBookmarkForTime`

`ctx.storage.getBookmarkForTime(timestamp: number | Date)`: Promise\<string>

* Returns a bookmark representing approximately the given point in time, which must be within the last 30 days. If the timestamp is represented as a number, it is converted to a date as if using `new Date(timestamp)`.

### `onNextSessionRestoreBookmark`

`ctx.storage.onNextSessionRestoreBookmark(bookmark: string)`: Promise\<string>

* Configures the Durable Object so that the next time it restarts, it should restore its storage to exactly match what the storage contained at the given bookmark. After calling this, the application should typically invoke `ctx.abort()` to restart the Durable Object, thus completing the point-in-time recovery.

This method returns a special bookmark representing the point in time immediately before the recovery takes place (even though that point in time is still technically in the future). Thus, after the recovery completes, it can be undone by performing a second recovery to this bookmark.

* TypeScript

  ```ts
  const DAY_MS = 24*60*60*1000;
  // restore to 2 days ago
  let bookmark = ctx.storage.getBookmarkForTime(Date.now() - 2 * DAYS_MS);
  ctx.storage.onNextSessionRestoreBookmark(bookmark);
  ```

* Python

  ```python
  from datetime import datetime, timedelta


  now = datetime.now()
  # restore to 2 days ago
  bookmark = ctx.storage.getBookmarkForTime(now - timedelta(days=2))
  ctx.storage.onNextSessionRestoreBookmark(bookmark)
  ```

## Synchronous KV API

### `get`

* `ctx.storage.kv.get(key string)`: Any, undefined
  * Retrieves the value associated with the given key. The type of the returned value will be whatever was previously written for the key, or undefined if the key does not exist.

### `put`

* `ctx.storage.kv.put(key string, value any)`: void

  * Stores the value and associates it with the given key. The value can be any type supported by the [structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm), which is true of most types.

    For the size of keys and values refer to [SQLite-backed Durable Object limits](https://developers.cloudflare.com/durable-objects/platform/limits/#sqlite-backed-durable-objects-general-limits)

### `delete`

* `ctx.storage.kv.delete(key string)`: boolean
  * Deletes the key and associated value. Returns `true` if the key existed or `false` if it did not.

### `list`

* `ctx.storage.kv.list(options Object optional)`: Iterable\<string, any>

  * Returns all keys and values associated with the current Durable Object in ascending sorted order based on the keys' UTF-8 encodings.

  * The type of each returned value in the [`Iterable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol) will be whatever was previously written for the corresponding key.

  * Be aware of how much data may be stored in your Durable Object before calling this version of `list` without options because all the data will be loaded into the Durable Object's memory, potentially hitting its [limit](https://developers.cloudflare.com/durable-objects/platform/limits/). If that is a concern, pass options to `list` as documented below.

#### Supported options

* `start` string

  * Key at which the list results should start, inclusive.

* `startAfter` string

  * Key after which the list results should start, exclusive. Cannot be used simultaneously with `start`.

* `end` string

  * Key at which the list results should end, exclusive.

* `prefix` string

  * Restricts results to only include key-value pairs whose keys begin with the prefix.

* `reverse` boolean

  * If true, return results in descending order instead of the default ascending order.
  * Enabling `reverse` does not change the meaning of `start`, `startKey`, or `endKey`. `start` still defines the smallest key in lexicographic order that can be returned (inclusive), effectively serving as the endpoint for a reverse-order list. `end` still defines the largest key in lexicographic order that the list should consider (exclusive), effectively serving as the starting point for a reverse-order list.

* `limit` number

  * Maximum number of key-value pairs to return.

## Asynchronous KV API

### get

* `ctx.storage.get(key string, options Object optional)`: Promise\<any>

  * Retrieves the value associated with the given key. The type of the returned value will be whatever was previously written for the key, or undefined if the key does not exist.

* `ctx.storage.get(keys Array<string>, options Object optional)`: Promise\<Map\<string, any>>

  * Retrieves the values associated with each of the provided keys. The type of each returned value in the [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) will be whatever was previously written for the corresponding key. Results in the `Map` will be sorted in increasing order of their UTF-8 encodings, with any requested keys that do not exist being omitted. Supports up to 128 keys at a time.

#### Supported options

* `allowConcurrency`: boolean

  * By default, the system will pause delivery of I/O events to the Object while a storage operation is in progress, in order to avoid unexpected race conditions. Pass `allowConcurrency: true` to opt out of this behavior and allow concurrent events to be delivered.

* `noCache`: boolean

  * If true, then the key/value will not be inserted into the in-memory cache. If the key is already in the cache, the cached value will be returned, but its last-used time will not be updated. Use this when you expect this key will not be used again in the near future. This flag is only a hint. This flag will never change the semantics of your code, but it may affect performance.

### put

* `put(key string, value any, options Object optional)`: Promise

  * Stores the value and associates it with the given key. The value can be any type supported by the [structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm), which is true of most types.

    The size of keys and values have different limits depending on the Durable Object storage backend you are using. Refer to either:

    * [SQLite-backed Durable Object limits](https://developers.cloudflare.com/durable-objects/platform/limits/#sqlite-backed-durable-objects-general-limits)
    * [KV-backed Durable Object limits](https://developers.cloudflare.com/durable-objects/platform/limits/#key-value-backed-durable-objects-general-limits).

* `put(entries Object, options Object optional)`: Promise

  * Takes an Object and stores each of its keys and values to storage.

  * Each value can be any type supported by the [structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm), which is true of most types.

  * Supports up to 128 key-value pairs at a time. The size of keys and values have different limits depending on the flavor of Durable Object you are using. Refer to either:

    * [SQLite-backed Durable Object limits](https://developers.cloudflare.com/durable-objects/platform/limits/#sqlite-backed-durable-objects-general-limits)
    * [KV-backed Durable Object limits](https://developers.cloudflare.com/durable-objects/platform/limits/#key-value-backed-durable-objects-general-limits)

### delete

* `delete(key string, options Object optional)`: Promise\<boolean>

  * Deletes the key and associated value. Returns `true` if the key existed or `false` if it did not.

* `delete(keys Array<string>, options Object optional)`: Promise\<number>

  * Deletes the provided keys and their associated values. Supports up to 128 keys at a time. Returns a count of the number of key-value pairs deleted.

#### Supported options

* `put()`, `delete()` and `deleteAll()` support the following options:

* `allowUnconfirmed` boolean

  * By default, the system will pause outgoing network messages from the Durable Object until all previous writes have been confirmed flushed to disk. If the write fails, the system will reset the Object, discard all outgoing messages, and respond to any clients with errors instead.

  * This way, Durable Objects can continue executing in parallel with a write operation, without having to worry about prematurely confirming writes, because it is impossible for any external party to observe the Object's actions unless the write actually succeeds.

  * After any write, subsequent network messages may be slightly delayed. Some applications may consider it acceptable to communicate on the basis of unconfirmed writes. Some programs may prefer to allow network traffic immediately. In this case, set `allowUnconfirmed` to `true` to opt out of the default behavior.

  * If you want to allow some outgoing network messages to proceed immediately but not others, you can use the allowUnconfirmed option to avoid blocking the messages that you want to proceed and then separately call the [`sync()`](#sync) method, which returns a promise that only resolves once all previous writes have successfully been persisted to disk.

* `noCache` boolean

  * If true, then the key/value will be discarded from memory as soon as it has completed writing to disk.

  * Use `noCache` if the key will not be used again in the near future. `noCache` will never change the semantics of your code, but it may affect performance.

  * If you use `get()` to retrieve the key before the write has completed, the copy from the write buffer will be returned, thus ensuring consistency with the latest call to `put()`.

Automatic write coalescing

If you invoke `put()` (or `delete()`) multiple times without performing any `await` in the meantime, the operations will automatically be combined and submitted atomically. In case of a machine failure, either all of the writes will have been stored to disk or none of the writes will have been stored to disk.

Write buffer behavior

The `put()` method returns a `Promise`, but most applications can discard this promise without using `await`. The `Promise` usually completes immediately, because `put()` writes to an in-memory write buffer that is flushed to disk asynchronously. However, if an application performs a large number of `put()` without waiting for any I/O, the write buffer could theoretically grow large enough to cause the isolate to exceed its 128 MB memory limit. To avoid this scenario, such applications should use `await` on the `Promise` returned by `put()`. The system will then apply backpressure onto the application, slowing it down so that the write buffer has time to flush. Using `await` will disable automatic write coalescing.

### list

* `list(options Object optional)`: Promise\<Map\<string, any>>

  * Returns all keys and values associated with the current Durable Object in ascending sorted order based on the keys' UTF-8 encodings.

  * The type of each returned value in the [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) will be whatever was previously written for the corresponding key.

  * Be aware of how much data may be stored in your Durable Object before calling this version of `list` without options because all the data will be loaded into the Durable Object's memory, potentially hitting its [limit](https://developers.cloudflare.com/durable-objects/platform/limits/). If that is a concern, pass options to `list` as documented below.

#### Supported options

* `start` string

  * Key at which the list results should start, inclusive.

* `startAfter` string

  * Key after which the list results should start, exclusive. Cannot be used simultaneously with `start`.

* `end` string

  * Key at which the list results should end, exclusive.

* `prefix` string

  * Restricts results to only include key-value pairs whose keys begin with the prefix.

* `reverse` boolean

  * If true, return results in descending order instead of the default ascending order.
  * Enabling `reverse` does not change the meaning of `start`, `startKey`, or `endKey`. `start` still defines the smallest key in lexicographic order that can be returned (inclusive), effectively serving as the endpoint for a reverse-order list. `end` still defines the largest key in lexicographic order that the list should consider (exclusive), effectively serving as the starting point for a reverse-order list.

* `limit` number

  * Maximum number of key-value pairs to return.

* `allowConcurrency` boolean

  * Same as the option to [`get()`](#do-kv-async-get), above.

* `noCache` boolean

  * Same as the option to [`get()`](#do-kv-async-get), above.

## Alarms

### `getAlarm`

* `getAlarm(options Object optional)`: Promise\<Number | null>
  * Retrieves the current alarm time (if set) as integer milliseconds since epoch. The alarm is considered to be set if it has not started, or if it has failed and any retry has not begun. If no alarm is set, `getAlarm()` returns `null`.

#### Supported options

* Same options as [`get()`](#get), but without `noCache`.

### `setAlarm`

* `setAlarm(scheduledTime Date | number, options Object optional)`: Promise

  * Sets the current alarm time, accepting either a JavaScript `Date`, or integer milliseconds since epoch.

  If `setAlarm()` is called with a time equal to or before `Date.now()`, the alarm will be scheduled for asynchronous execution in the immediate future. If the alarm handler is currently executing in this case, it will not be canceled. Alarms can be set to millisecond granularity and will usually execute within a few milliseconds after the set time, but can be delayed by up to a minute due to maintenance or failures while failover takes place.

### `deleteAlarm`

* `deleteAlarm(options Object optional)`: Promise
  * Deletes the alarm if one exists. Does not cancel the alarm handler if it is currently executing.

#### Supported options

* `setAlarm()` and `deleteAlarm()` support the same options as [`put()`](#put), but without `noCache`.

## Other

### `deleteAll`

* `deleteAll(options Object optional)`: Promise

  * Deletes all stored data, effectively deallocating all storage used by the Durable Object. For Durable Objects with a key-value storage backend, `deleteAll()` removes all keys and associated values for an individual Durable Object. For Durable Objects with a [SQLite storage backend](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#create-sqlite-backed-durable-object-class), `deleteAll()` removes the entire contents of a Durable Object's private SQLite database, including both SQL data and key-value data.
  * For Durable Objects with a key-value storage backend, an in-progress `deleteAll()` operation can fail, which may leave a subset of data undeleted. Durable Objects with a SQLite storage backend do not have a partial `deleteAll()` issue because `deleteAll()` operations are atomic (all or nothing).
  * `deleteAll()` does not proactively delete [alarms](https://developers.cloudflare.com/durable-objects/api/alarms/). Use [`deleteAlarm()`](https://developers.cloudflare.com/durable-objects/api/alarms/#deletealarm) to delete an alarm.

### `transactionSync`

* `transactionSync(callback)`: any

  * Only available when using SQLite-backed Durable Objects.

  * Invokes `callback()` wrapped in a transaction, and returns its result.

  * If `callback()` throws an exception, the transaction will be rolled back.

  * The callback must complete synchronously, that is, it should not be declared `async` nor otherwise return a Promise. Only synchronous storage operations can be part of the transaction. This is intended for use with SQL queries using [`ctx.storage.sql.exec()`](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/#exec), which complete sychronously.

### `transaction`

* `transaction(closureFunction(txn))`: Promise

  * Runs the sequence of storage operations called on `txn` in a single transaction that either commits successfully or aborts.

  * Explicit transactions are no longer necessary. Any series of write operations with no intervening `await` will automatically be submitted atomically, and the system will prevent concurrent events from executing while `await` a read operation (unless you use `allowConcurrency: true`). Therefore, a series of reads followed by a series of writes (with no other intervening I/O) are automatically atomic and behave like a transaction.

* `txn`

  * Provides access to the `put()`, `get()`, `delete()`, and `list()` methods documented above to run in the current transaction context. In order to get transactional behavior within a transaction closure, you must call the methods on the `txn` Object instead of on the top-level `ctx.storage` Object.\
    \
    Also supports a `rollback()` function that ensures any changes made during the transaction will be rolled back rather than committed. After `rollback()` is called, any subsequent operations on the `txn` Object will fail with an exception. `rollback()` takes no parameters and returns nothing to the caller.

  * When using [the SQLite-backed storage engine](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#sqlite-storage-backend), the `txn` object is obsolete. Any storage operations performed directly on the `ctx.storage` object, including SQL queries using [`ctx.storage.sql.exec()`](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/#exec), will be considered part of the transaction.

### `sync`

* `sync()`: Promise

  * Synchronizes any pending writes to disk.

  * This is similar to normal behavior from automatic write coalescing. If there are any pending writes in the write buffer (including those submitted with [the `allowUnconfirmed` option](#supported-options-1)), the returned promise will resolve when they complete. If there are no pending writes, the returned promise will be already resolved.

## Storage properties

### `sql`

`sql` is a readonly property of type `DurableObjectStorage` encapsulating the [SQL API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/#synchronous-sql-api).

## Related resources

* [Durable Objects: Easy, Fast, Correct Choose Three](https://blog.cloudflare.com/durable-objects-easy-fast-correct-choose-three/)
* [Zero-latency SQLite storage in every Durable Object blog](https://blog.cloudflare.com/sqlite-in-durable-objects/)
* [WebSockets API](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)

</page>

<page>
---
title: Durable Object State · Cloudflare Durable Objects docs
description: The DurableObjectState interface is accessible as an instance
  property on the Durable Object class. This interface encapsulates methods that
  modify the state of a Durable Object, for example which WebSockets are
  attached to a Durable Object or how the runtime should handle concurrent
  Durable Object requests.
lastUpdated: 2026-01-22T13:08:42.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/api/state/
  md: https://developers.cloudflare.com/durable-objects/api/state/index.md
---

## Description

The `DurableObjectState` interface is accessible as an instance property on the Durable Object class. This interface encapsulates methods that modify the state of a Durable Object, for example which WebSockets are attached to a Durable Object or how the runtime should handle concurrent Durable Object requests.

The `DurableObjectState` interface is different from the Storage API in that it does not have top-level methods which manipulate persistent application data. These methods are instead encapsulated in the [`DurableObjectStorage`](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/) interface and accessed by [`DurableObjectState::storage`](https://developers.cloudflare.com/durable-objects/api/state/#storage).

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  // Durable Object
  export class MyDurableObject extends DurableObject {
    // DurableObjectState is accessible via the ctx instance property
    constructor(ctx, env) {
      super(ctx, env);
    }
    ...
  }
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    MY_DURABLE_OBJECT: DurableObjectNamespace<MyDurableObject>;
  }


  // Durable Object
  export class MyDurableObject extends DurableObject {
    // DurableObjectState is accessible via the ctx instance property
    constructor(ctx: DurableObjectState, env: Env) {
      super(ctx, env);
    }
    ...
  }
  ```

* Python

  ```python
  from workers import DurableObject


  # Durable Object
  class MyDurableObject(DurableObject):
    # DurableObjectState is accessible via the ctx instance property
    def __init__(self, ctx, env):
      super().__init__(ctx, env)
    # ...
  ```

## Methods and Properties

### `exports`

Contains loopback bindings to the Worker's own top-level exports. This has exactly the same meaning as [`ExecutionContext`'s `ctx.exports`](https://developers.cloudflare.com/workers/runtime-apis/context/#exports).

### `waitUntil`

`waitUntil` waits until the promise which is passed as a parameter resolves, and can extend a request context even after the last client disconnects. Refer to [Lifecycle of a Durable Object](https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/) for more information.

`waitUntil` has no effect in Durable Objects

Unlike in Workers, `waitUntil` has no effect in Durable Objects. It exists only for API compatibility with the [Workers Runtime APIs](https://developers.cloudflare.com/workers/runtime-apis/context/#waituntil).

Durable Objects automatically remain active as long as there is ongoing work or pending I/O, so `waitUntil` is not needed. Refer to [Lifecycle of a Durable Object](https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/) for more information.

#### Parameters

* A required promise of any type.

#### Return values

* None.

### `blockConcurrencyWhile`

`blockConcurrencyWhile` executes an async callback while blocking any other events from being delivered to the Durable Object until the callback completes. This method guarantees ordering and prevents concurrent requests. All events that were not explicitly initiated as part of the callback itself will be blocked. Once the callback completes, all other events will be delivered.

* `blockConcurrencyWhile` is commonly used within the constructor of the Durable Object class to enforce initialization to occur before any requests are delivered.
* Another use case is executing `async` operations based on the current state of the Durable Object and using `blockConcurrencyWhile` to prevent that state from changing while yielding the event loop.
* If the callback throws an exception, the object will be terminated and reset. This ensures that the object cannot be left stuck in an uninitialized state if something fails unexpectedly.
* To avoid this behavior, enclose the body of your callback in a `try...catch` block to ensure it cannot throw an exception.

To help mitigate deadlocks there is a 30 second timeout applied when executing the callback. If this timeout is exceeded, the Durable Object will be reset. It is best practice to have the callback do as little work as possible to improve overall request throughput to the Durable Object.

When to use `blockConcurrencyWhile`

Use `blockConcurrencyWhile` in the constructor to run schema migrations or initialize state before any requests are processed. This ensures your Durable Object is fully ready before handling traffic.

For regular request handling, you rarely need `blockConcurrencyWhile`. SQLite storage operations are synchronous and do not yield the event loop, so they execute atomically without it. For asynchronous KV storage operations, input gates already prevent other requests from interleaving during storage calls.

Reserve `blockConcurrencyWhile` outside the constructor for cases where you make external async calls (such as `fetch()`) and cannot tolerate state changes while the event loop yields.

* JavaScript

  ```js
  // Durable Object
  export class MyDurableObject extends DurableObject {
    initialized = false;


    constructor(ctx, env) {
      super(ctx, env);


      // blockConcurrencyWhile will ensure that initialized will always be true
      this.ctx.blockConcurrencyWhile(async () => {
        this.initialized = true;
      });
    }
    ...
  }
  ```

* Python

  ```python
  # Durable Object
  class MyDurableObject(DurableObject):
    def __init__(self, ctx, env):
      super().__init__(ctx, env)
      self.initialized = False


      # blockConcurrencyWhile will ensure that initialized will always be true
      async def set_initialized():
        self.initialized = True
      self.ctx.blockConcurrencyWhile(set_initialized)
    # ...
  ```

#### Parameters

* A required callback which returns a `Promise<T>`.

#### Return values

* A `Promise<T>` returned by the callback.

### `acceptWebSocket`

`acceptWebSocket` is part of the [WebSocket Hibernation API](https://developers.cloudflare.com/durable-objects/best-practices/websockets/#websocket-hibernation-api), which allows a Durable Object to be removed from memory to save costs while keeping its WebSockets connected.

`acceptWebSocket` adds a WebSocket to the set of WebSockets attached to the Durable Object. Once called, any incoming messages will be delivered by calling the Durable Object's `webSocketMessage` handler, and `webSocketClose` will be invoked upon disconnect. After calling `acceptWebSocket`, the WebSocket is accepted and its `send` and `close` methods can be used.

The [WebSocket Hibernation API](https://developers.cloudflare.com/durable-objects/best-practices/websockets/#websocket-hibernation-api) takes the place of the standard [WebSockets API](https://developers.cloudflare.com/workers/runtime-apis/websockets/). Therefore, `ws.accept` must not have been called separately and `ws.addEventListener` method will not receive events as they will instead be delivered to the Durable Object.

The WebSocket Hibernation API permits a maximum of 32,768 WebSocket connections per Durable Object, but the CPU and memory usage of a given workload may further limit the practical number of simultaneous connections.

#### Parameters

* A required `WebSocket` with name `ws`.
* An optional `Array<string>` of associated tags. Tags can be used to retrieve WebSockets via [`DurableObjectState::getWebSockets`](https://developers.cloudflare.com/durable-objects/api/state/#getwebsockets). Each tag is a maximum of 256 characters and there can be at most 10 tags associated with a WebSocket.

#### Return values

* None.

### `getWebSockets`

`getWebSockets` is part of the [WebSocket Hibernation API](https://developers.cloudflare.com/durable-objects/best-practices/websockets/#websocket-hibernation-api), which allows a Durable Object to be removed from memory to save costs while keeping its WebSockets connected.

`getWebSockets` returns an `Array<WebSocket>` which is the set of WebSockets attached to the Durable Object. An optional tag argument can be used to filter the list according to tags supplied when calling [`DurableObjectState::acceptWebSocket`](https://developers.cloudflare.com/durable-objects/api/state/#acceptwebsocket).

`waitUntil` is not necessary

Disconnected WebSockets are not returned by this method, but `getWebSockets` may still return WebSockets even after `ws.close` has been called. For example, if the server-side WebSocket sends a close, but does not receive one back (and has not detected a disconnect from the client), then the connection is in the CLOSING 'readyState'. The client might send more messages, so the WebSocket is technically not disconnected.

#### Parameters

* An optional tag of type `string`.

#### Return values

* An `Array<WebSocket>`.

### `setWebSocketAutoResponse`

`setWebSocketAutoResponse` is part of the [WebSocket Hibernation API](https://developers.cloudflare.com/durable-objects/best-practices/websockets/#websocket-hibernation-api), which allows a Durable Object to be removed from memory to save costs while keeping its WebSockets connected.

`setWebSocketAutoResponse` sets an automatic response, auto-response, for the request provided for all WebSockets attached to the Durable Object. If a request is received matching the provided request then the auto-response will be returned without waking WebSockets in hibernation and incurring billable duration charges.

`setWebSocketAutoResponse` is a common alternative to setting up a server for static ping/pong messages because this can be handled without waking hibernating WebSockets.

#### Parameters

* An optional `WebSocketRequestResponsePair(request string, response string)` enabling any WebSocket accepted via [`DurableObjectState::acceptWebSocket`](https://developers.cloudflare.com/durable-objects/api/state/#acceptwebsocket) to automatically reply to the provided response when it receives the provided request. Both request and response are limited to 2,048 characters each. If the parameter is omitted, any previously set auto-response configuration will be removed. [`DurableObjectState::getWebSocketAutoResponseTimestamp`](https://developers.cloudflare.com/durable-objects/api/state/#getwebsocketautoresponsetimestamp) will still reflect the last timestamp that an auto-response was sent.

#### Return values

* None.

### `getWebSocketAutoResponse`

`getWebSocketAutoResponse` returns the `WebSocketRequestResponsePair` object last set by [`DurableObjectState::setWebSocketAutoResponse`](https://developers.cloudflare.com/durable-objects/api/state/#setwebsocketautoresponse), or null if not auto-response has been set.

inspect `WebSocketRequestResponsePair`

`WebSocketRequestResponsePair` can be inspected further by calling `getRequest` and `getResponse` methods.

#### Parameters

* None.

#### Return values

* A `WebSocketRequestResponsePair` or null.

### `getWebSocketAutoResponseTimestamp`

`getWebSocketAutoResponseTimestamp` is part of the [WebSocket Hibernation API](https://developers.cloudflare.com/durable-objects/best-practices/websockets/#websocket-hibernation-api), which allows a Durable Object to be removed from memory to save costs while keeping its WebSockets connected.

`getWebSocketAutoResponseTimestamp` gets the most recent `Date` on which the given WebSocket sent an auto-response, or null if the given WebSocket never sent an auto-response.

#### Parameters

* A required `WebSocket`.

#### Return values

* A `Date` or null.

### `setHibernatableWebSocketEventTimeout`

`setHibernatableWebSocketEventTimeout` is part of the [WebSocket Hibernation API](https://developers.cloudflare.com/durable-objects/best-practices/websockets/#websocket-hibernation-api), which allows a Durable Object to be removed from memory to save costs while keeping its WebSockets connected.

`setHibernatableWebSocketEventTimeout` sets the maximum amount of time in milliseconds that a WebSocket event can run for.

If no parameter or a parameter of `0` is provided and a timeout has been previously set, then the timeout will be unset. The maximum value of timeout is 604,800,000 ms (7 days).

#### Parameters

* An optional `number`.

#### Return values

* None.

### `getHibernatableWebSocketEventTimeout`

`getHibernatableWebSocketEventTimeout` is part of the [WebSocket Hibernation API](https://developers.cloudflare.com/durable-objects/best-practices/websockets/#websocket-hibernation-api), which allows a Durable Object to be removed from memory to save costs while keeping its WebSockets connected.

`getHibernatableWebSocketEventTimeout` gets the currently set hibernatable WebSocket event timeout if one has been set via [`DurableObjectState::setHibernatableWebSocketEventTimeout`](https://developers.cloudflare.com/durable-objects/api/state/#sethibernatablewebsocketeventtimeout).

#### Parameters

* None.

#### Return values

* A number, or null if the timeout has not been set.

### `getTags`

`getTags` is part of the [WebSocket Hibernation API](https://developers.cloudflare.com/durable-objects/best-practices/websockets/#websocket-hibernation-api), which allows a Durable Object to be removed from memory to save costs while keeping its WebSockets connected.

`getTags` returns tags associated with a given WebSocket. This method throws an exception if the WebSocket has not been associated with the Durable Object via [`DurableObjectState::acceptWebSocket`](https://developers.cloudflare.com/durable-objects/api/state/#acceptwebsocket).

#### Parameters

* A required `WebSocket`.

#### Return values

* An `Array<string>` of tags.

### `abort`

`abort` is used to forcibly reset a Durable Object. A JavaScript `Error` with the message passed as a parameter will be logged. This error is not able to be caught within the application code.

* TypeScript

  ```js
  // Durable Object
  export class MyDurableObject extends DurableObject {
    constructor(ctx: DurableObjectState, env: Env) {
      super(ctx, env);
    }


    async sayHello() {
      // Error: Hello, World! will be logged
      this.ctx.abort("Hello, World!");
    }
  }
  ```

* Python

  ```python
  # Durable Object
  class MyDurableObject(DurableObject):
    def __init__(self, ctx, env):
      super().__init__(ctx, env)


    async def say_hello(self):
      # Error: Hello, World! will be logged
      self.ctx.abort("Hello, World!")
  ```

Not available in local development

`abort` is not available in local development with the `wrangler dev` CLI command.

#### Parameters

* An optional `string` .

#### Return values

* None.

## Properties

### `id`

`id` is a readonly property of type `DurableObjectId` corresponding to the [`DurableObjectId`](https://developers.cloudflare.com/durable-objects/api/id) of the Durable Object.

### `storage`

`storage` is a readonly property of type `DurableObjectStorage` encapsulating the [Storage API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/).

## Related resources

* [Durable Objects: Easy, Fast, Correct - Choose Three](https://blog.cloudflare.com/durable-objects-easy-fast-correct-choose-three/).

</page>

<page>
---
title: Durable Object Stub · Cloudflare Durable Objects docs
description: The DurableObjectStub interface is a client used to invoke methods
  on a remote Durable Object. The type of DurableObjectStub is generic to allow
  for RPC methods to be invoked on the stub.
lastUpdated: 2025-12-08T15:50:53.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/api/stub/
  md: https://developers.cloudflare.com/durable-objects/api/stub/index.md
---

## Description

The `DurableObjectStub` interface is a client used to invoke methods on a remote Durable Object. The type of `DurableObjectStub` is generic to allow for RPC methods to be invoked on the stub.

Durable Objects implement E-order semantics, a concept deriving from the [E distributed programming language](https://en.wikipedia.org/wiki/E_\(programming_language\)). When you make multiple calls to the same Durable Object, it is guaranteed that the calls will be delivered to the remote Durable Object in the order in which you made them. E-order semantics makes many distributed programming problems easier. E-order is implemented by the [Cap'n Proto](https://capnproto.org) distributed object-capability RPC protocol, which Cloudflare Workers uses for internal communications.

If an exception is thrown by a Durable Object stub all in-flight calls and future calls will fail with [exceptions](https://developers.cloudflare.com/durable-objects/observability/troubleshooting/). To continue invoking methods on a remote Durable Object a Worker must recreate the stub. There are no ordering guarantees between different stubs.

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  // Durable Object
  export class MyDurableObject extends DurableObject {
    constructor(ctx, env) {
      super(ctx, env);
    }


    async sayHello() {
      return "Hello, World!";
    }
  }


  // Worker
  export default {
    async fetch(request, env) {
      // A stub is a client used to invoke methods on the Durable Object
      const stub = env.MY_DURABLE_OBJECT.getByName("foo");


      // Methods on the Durable Object are invoked via the stub
      const rpcResponse = await stub.sayHello();


      return new Response(rpcResponse);
    },
  };
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    MY_DURABLE_OBJECT: DurableObjectNamespace<MyDurableObject>;
  }


  // Durable Object
  export class MyDurableObject extends DurableObject {
    constructor(ctx: DurableObjectState, env: Env) {
      super(ctx, env);
    }


    async sayHello(): Promise<string> {
      return "Hello, World!";
    }
  }


  // Worker
  export default {
    async fetch(request, env) {
      // A stub is a client used to invoke methods on the Durable Object
      const stub = env.MY_DURABLE_OBJECT.getByName("foo");


      // Methods on the Durable Object are invoked via the stub
      const rpcResponse = await stub.sayHello();


      return new Response(rpcResponse);
    },
  } satisfies ExportedHandler<Env>;
  ```

## Properties

### `id`

`id` is a property of the `DurableObjectStub` corresponding to the [`DurableObjectId`](https://developers.cloudflare.com/durable-objects/api/id) used to create the stub.

* JavaScript

  ```js
  const id = env.MY_DURABLE_OBJECT.newUniqueId();
  const stub = env.MY_DURABLE_OBJECT.get(id);
  console.assert(id.equals(stub.id), "This should always be true");
  ```

* Python

  ```python
  id = env.MY_DURABLE_OBJECT.newUniqueId()
  stub = env.MY_DURABLE_OBJECT.get(id)
  assert id.equals(stub.id), "This should always be true"
  ```

### `name`

`name` is an optional property of a `DurableObjectStub`, which returns a name if it was provided upon stub creation either directly via [`DurableObjectNamespace::getByName`](https://developers.cloudflare.com/durable-objects/api/namespace/#getbyname) or indirectly via a [`DurableObjectId`](https://developers.cloudflare.com/durable-objects/api/id) created by [`DurableObjectNamespace::idFromName`](https://developers.cloudflare.com/durable-objects/api/namespace/#idfromname). This value is undefined if the [`DurableObjectId`](https://developers.cloudflare.com/durable-objects/api/id) used to create the `DurableObjectStub` was constructed using [`DurableObjectNamespace::newUniqueId`](https://developers.cloudflare.com/durable-objects/api/namespace/#newuniqueid).

* JavaScript

  ```js
  const stub = env.MY_DURABLE_OBJECT.getByName("foo");
  console.assert(stub.name === "foo", "This should always be true");
  ```

* Python

  ```python
  stub = env.MY_DURABLE_OBJECT.getByName("foo")
  assert stub.name == "foo", "This should always be true"
  ```

## Related resources

* [Durable Objects: Easy, Fast, Correct – Choose Three](https://blog.cloudflare.com/durable-objects-easy-fast-correct-choose-three/).

</page>

<page>
---
title: WebGPU · Cloudflare Durable Objects docs
description: The WebGPU API allows you to use the GPU directly from JavaScript.
lastUpdated: 2025-02-12T13:41:31.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/api/webgpu/
  md: https://developers.cloudflare.com/durable-objects/api/webgpu/index.md
---

Warning

The WebGPU API is only available in local development. You cannot deploy Durable Objects to Cloudflare that rely on the WebGPU API. See [Workers AI](https://developers.cloudflare.com/workers-ai/) for information on running machine learning models on the GPUs in Cloudflare's global network.

The [WebGPU API](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API) allows you to use the GPU directly from JavaScript.

The WebGPU API is only accessible from within [Durable Objects](https://developers.cloudflare.com/durable-objects/). You cannot use the WebGPU API from within Workers.

To use the WebGPU API in local development, enable the `experimental` and `webgpu` [compatibility flags](https://developers.cloudflare.com/workers/configuration/compatibility-flags/) in the [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) of your Durable Object.

```plaintext
compatibility_flags = ["experimental", "webgpu"]
```

The following subset of the WebGPU API is available from within Durable Objects:

| API | Supported? | Notes |
| - | - | - |
| [`navigator.gpu`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/gpu) | ✅ | |
| [`GPU.requestAdapter`](https://developer.mozilla.org/en-US/docs/Web/API/GPU/requestAdapter) | ✅ | |
| [`GPUAdapterInfo`](https://developer.mozilla.org/en-US/docs/Web/API/GPUAdapterInfo) | ✅ | |
| [`GPUAdapter`](https://developer.mozilla.org/en-US/docs/Web/API/GPUAdapter) | ✅ | |
| [`GPUBindGroupLayout`](https://developer.mozilla.org/en-US/docs/Web/API/GPUBindGroupLayout) | ✅ | |
| [`GPUBindGroup`](https://developer.mozilla.org/en-US/docs/Web/API/GPUBindGroup) | ✅ | |
| [`GPUBuffer`](https://developer.mozilla.org/en-US/docs/Web/API/GPUBuffer) | ✅ | |
| [`GPUCommandBuffer`](https://developer.mozilla.org/en-US/docs/Web/API/GPUCommandBuffer) | ✅ | |
| [`GPUCommandEncoder`](https://developer.mozilla.org/en-US/docs/Web/API/GPUCommandEncoder) | ✅ | |
| [`GPUComputePassEncoder`](https://developer.mozilla.org/en-US/docs/Web/API/GPUComputePassEncoder) | ✅ | |
| [`GPUComputePipeline`](https://developer.mozilla.org/en-US/docs/Web/API/GPUComputePipeline) | ✅ | |
| [`GPUComputePipelineError`](https://developer.mozilla.org/en-US/docs/Web/API/GPUPipelineError) | ✅ | |
| [`GPUDevice`](https://developer.mozilla.org/en-US/docs/Web/API/GPUDevice) | ✅ | |
| [`GPUOutOfMemoryError`](https://developer.mozilla.org/en-US/docs/Web/API/GPUOutOfMemoryError) | ✅ | |
| [`GPUValidationError`](https://developer.mozilla.org/en-US/docs/Web/API/GPUValidationError) | ✅ | |
| [`GPUInternalError`](https://developer.mozilla.org/en-US/docs/Web/API/GPUInternalError) | ✅ | |
| [`GPUDeviceLostInfo`](https://developer.mozilla.org/en-US/docs/Web/API/GPUDeviceLostInfo) | ✅ | |
| [`GPUPipelineLayout`](https://developer.mozilla.org/en-US/docs/Web/API/GPUPipelineLayout) | ✅ | |
| [`GPUQuerySet`](https://developer.mozilla.org/en-US/docs/Web/API/GPUQuerySet) | ✅ | |
| [`GPUQueue`](https://developer.mozilla.org/en-US/docs/Web/API/GPUQueue) | ✅ | |
| [`GPUSampler`](https://developer.mozilla.org/en-US/docs/Web/API/GPUSampler) | ✅ | |
| [`GPUCompilationMessage`](https://developer.mozilla.org/en-US/docs/Web/API/GPUCompilationMessage) | ✅ | |
| [`GPUShaderModule`](https://developer.mozilla.org/en-US/docs/Web/API/GPUShaderModule) | ✅ | |
| [`GPUSupportedFeatures`](https://developer.mozilla.org/en-US/docs/Web/API/GPUSupportedFeatures) | ✅ | |
| [`GPUSupportedLimits`](https://developer.mozilla.org/en-US/docs/Web/API/GPUSupportedLimits) | ✅ | |
| [`GPUMapMode`](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API#reading_the_results_back_to_javascript) | ✅ | |
| [`GPUShaderStage`](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API#create_a_bind_group_layout) | ✅ | |
| [`GPUUncapturedErrorEvent`](https://developer.mozilla.org/en-US/docs/Web/API/GPUUncapturedErrorEvent) | ✅ | |

The following subset of the WebGPU API is not yet supported:

| API | Supported? | Notes |
| - | - | - |
| [`GPU.getPreferredCanvasFormat`](https://developer.mozilla.org/en-US/docs/Web/API/GPU/getPreferredCanvasFormat) | | |
| [`GPURenderBundle`](https://developer.mozilla.org/en-US/docs/Web/API/GPURenderBundle) | | |
| [`GPURenderBundleEncoder`](https://developer.mozilla.org/en-US/docs/Web/API/GPURenderBundleEncoder) | | |
| [`GPURenderPassEncoder`](https://developer.mozilla.org/en-US/docs/Web/API/GPURenderPassEncoder) | | |
| [`GPURenderPipeline`](https://developer.mozilla.org/en-US/docs/Web/API/GPURenderPipeline) | | |
| [`GPUShaderModule`](https://developer.mozilla.org/en-US/docs/Web/API/GPUShaderModule) | | |
| [`GPUTexture`](https://developer.mozilla.org/en-US/docs/Web/API/GPUTexture) | | |
| [`GPUTextureView`](https://developer.mozilla.org/en-US/docs/Web/API/GPUTextureView) | | |
| [`GPUExternalTexture`](https://developer.mozilla.org/en-US/docs/Web/API/GPUExternalTexture) | | |

## Examples

* [workers-wonnx](https://github.com/cloudflare/workers-wonnx/) — Image classification, running on a GPU via the WebGPU API, using the [wonnx](https://github.com/webonnx/wonnx) model inference runtime.

</page>

<page>
---
title: Rust API · Cloudflare Durable Objects docs
lastUpdated: 2024-12-04T15:21:02.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/api/workers-rs/
  md: https://developers.cloudflare.com/durable-objects/api/workers-rs/index.md
---


</page>

<page>
---
title: Access Durable Objects Storage · Cloudflare Durable Objects docs
description: |-
  Durable Objects are a
  powerful compute API that provides a compute with storage building block. Each
  Durable Object has its own private, transactional, and strongly consistent
  storage. Durable Objects
  Storage API provides
  access to a Durable Object's attached storage.
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/
  md: https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/index.md
---

Durable Objects are a powerful compute API that provides a compute with storage building block. Each Durable Object has its own private, transactional, and strongly consistent storage. Durable Objects Storage API provides access to a Durable Object's attached storage.

A Durable Object's [in-memory state](https://developers.cloudflare.com/durable-objects/reference/in-memory-state/) is preserved as long as the Durable Object is not evicted from memory. Inactive Durable Objects with no incoming request traffic can be evicted. There are normal operations like [code deployments](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/) that trigger Durable Objects to restart and lose their in-memory state. For these reasons, you should use Storage API to persist state durably on disk that needs to survive eviction or restart of Durable Objects.

## Access storage

Recommended SQLite-backed Durable Objects

Cloudflare recommends all new Durable Object namespaces use the [SQLite storage backend](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#create-sqlite-backed-durable-object-class). These Durable Objects can continue to use storage [key-value API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/#synchronous-kv-api).

Additionally, SQLite-backed Durable Objects allow you to store more types of data (such as tables), and offer Point In Time Recovery API which can restore a Durable Object's embedded SQLite database contents (both SQL data and key-value data) to any point in the past 30 days.

The [key-value storage backend](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/#create-durable-object-class-with-key-value-storage) remains for backwards compatibility, and a migration path from KV storage backend to SQLite storage backend for existing Durable Object namespaces will be available in the future.

Storage billing on SQLite-backed Durable Objects

Storage billing for SQLite-backed Durable Objects will be enabled in January 2026, with a target date of January 7, 2026 (no earlier). Only SQLite storage usage on and after the billing target date will incur charges. For more information, refer to [Billing for SQLite Storage](https://developers.cloudflare.com/changelog/2025-12-12-durable-objects-sqlite-storage-billing/).

[Storage API methods](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/) are available on `ctx.storage` parameter passed to the Durable Object constructor. Storage API has several methods, including SQL, point-in-time recovery (PITR), key-value (KV), and alarm APIs.

Only Durable Object classes with a SQLite storage backend can access SQL API.

### Create SQLite-backed Durable Object class

Use `new_sqlite_classes` on the migration in your Worker's Wrangler file:

* wrangler.jsonc

  ```jsonc
  {
    "migrations": [
      {
        "tag": "v1", // Should be unique for each entry
        "new_sqlite_classes": [ // Array of new classes
          "MyDurableObject"
        ]
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  [[migrations]]
  tag = "v1"
  new_sqlite_classes = [ "MyDurableObject" ]
  ```

[SQL API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/#exec) is available on `ctx.storage.sql` parameter passed to the Durable Object constructor.

SQLite-backed Durable Objects also offer [point-in-time recovery API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/#pitr-point-in-time-recovery-api), which uses bookmarks to allow you to restore a Durable Object's embedded SQLite database to any point in time in the past 30 days.

### Initialize instance variables from storage

A common pattern is to initialize a Durable Object from [persistent storage](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/) and set instance variables the first time it is accessed. Since future accesses are routed to the same Durable Object, it is then possible to return any initialized values without making further calls to persistent storage.

```ts
import { DurableObject } from "cloudflare:workers";


export class Counter extends DurableObject {
  value: number;


  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);


    // `blockConcurrencyWhile()` ensures no requests are delivered until
    // initialization completes.
    ctx.blockConcurrencyWhile(async () => {
      // After initialization, future reads do not need to access storage.
      this.value = (await ctx.storage.get("value")) || 0;
    });
  }


  async getCounterValue() {
    return this.value;
  }
}
```

### Remove a Durable Object's storage

A Durable Object fully ceases to exist if, when it shuts down, its storage is empty. If you never write to a Durable Object's storage at all (including setting alarms), then storage remains empty, and so the Durable Object will no longer exist once it shuts down.

However if you ever write using [Storage API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/), including setting alarms, then you must explicitly call [`storage.deleteAll()`](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/#deleteall) to empty storage and [`storage.deleteAlarm()`](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/#deletealarm) if you've configured an alarm. It is not sufficient to simply delete the specific data that you wrote, such as deleting a key or dropping a table, as some metadata may remain. The only way to remove all storage is to call `deleteAll()`. Calling `deleteAll()` ensures that a Durable Object will not be billed for storage.

```ts
export class MyDurableObject extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }


  // Clears Durable Object storage
  async clearDo(): Promise<void> {
    // If you've configured a Durable Object alarm
    await this.ctx.storage.deleteAlarm();


    // This will delete all the storage associated with this Durable Object instance
    // This will also delete the Durable Object instance itself
    await this.ctx.storage.deleteAll();
  }
}
```

## SQL API Examples

[SQL API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/#exec) examples below use the following SQL schema:

```ts
import { DurableObject } from "cloudflare:workers";


export class MyDurableObject extends DurableObject {
  sql: SqlStorage
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;


    this.sql.exec(`CREATE TABLE IF NOT EXISTS artist(
      artistid    INTEGER PRIMARY KEY,
      artistname  TEXT
    );INSERT INTO artist (artistid, artistname) VALUES
      (123, 'Alice'),
      (456, 'Bob'),
      (789, 'Charlie');`
    );
  }
}
```

Iterate over query results as row objects:

```ts
  let cursor = this.sql.exec("SELECT * FROM artist;");


  for (let row of cursor) {
    // Iterate over row object and do something
  }
```

Convert query results to an array of row objects:

```ts
  // Return array of row objects: [{"artistid":123,"artistname":"Alice"},{"artistid":456,"artistname":"Bob"},{"artistid":789,"artistname":"Charlie"}]
  let resultsArray1 = this.sql.exec("SELECT * FROM artist;").toArray();
  // OR
  let resultsArray2 = Array.from(this.sql.exec("SELECT * FROM artist;"));
  // OR
  let resultsArray3 = [...this.sql.exec("SELECT * FROM artist;")]; // JavaScript spread syntax
```

Convert query results to an array of row values arrays:

```ts
  // Returns [[123,"Alice"],[456,"Bob"],[789,"Charlie"]]
  let cursor = this.sql.exec("SELECT * FROM artist;");
  let resultsArray = cursor.raw().toArray();


  // Returns ["artistid","artistname"]
  let columnNameArray = this.sql.exec("SELECT * FROM artist;").columnNames.toArray();
```

Get first row object of query results:

```ts
  // Returns {"artistid":123,"artistname":"Alice"}
  let firstRow = this.sql.exec("SELECT * FROM artist ORDER BY artistname DESC;").toArray()[0];
```

Check if query results have exactly one row:

```ts
  // returns error
  this.sql.exec("SELECT * FROM artist ORDER BY artistname ASC;").one();


  // returns { artistid: 123, artistname: 'Alice' }
  let oneRow = this.sql.exec("SELECT * FROM artist WHERE artistname = ?;", "Alice").one()
```

Returned cursor behavior:

```ts
  let cursor = this.sql.exec("SELECT * FROM artist ORDER BY artistname ASC;");
  let result = cursor.next();
  if (!result.done) {
    console.log(result.value); // prints { artistid: 123, artistname: 'Alice' }
  } else {
    // query returned zero results
  }


  let remainingRows = cursor.toArray();
  console.log(remainingRows); // prints [{ artistid: 456, artistname: 'Bob' },{ artistid: 789, artistname: 'Charlie' }]
```

Returned cursor and `raw()` iterator iterate over the same query results:

```ts
  let cursor = this.sql.exec("SELECT * FROM artist ORDER BY artistname ASC;");
  let result = cursor.raw().next();


  if (!result.done) {
    console.log(result.value); // prints [ 123, 'Alice' ]
  } else {
    // query returned zero results
  }


  console.log(cursor.toArray()); // prints [{ artistid: 456, artistname: 'Bob' },{ artistid: 789, artistname: 'Charlie' }]
```

`sql.exec().rowsRead()`:

```ts
  let cursor = this.sql.exec("SELECT * FROM artist;");
  cursor.next()
  console.log(cursor.rowsRead); // prints 1


  cursor.toArray(); // consumes remaining cursor
  console.log(cursor.rowsRead); // prints 3
```

## TypeScript and query results

You can use TypeScript [type parameters](https://www.typescriptlang.org/docs/handbook/2/generics.html#working-with-generic-type-variables) to provide a type for your results, allowing you to benefit from type hints and checks when iterating over the results of a query.

Warning

Providing a type parameter does *not* validate that the query result matches your type definition. In TypeScript, properties (fields) that do not exist in your result type will be silently dropped.

Your type must conform to the shape of a TypeScript [Record](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type) type representing the name (`string`) of the column and the type of the column. The column type must be a valid `SqlStorageValue`: one of `ArrayBuffer | string | number | null`.

For example,

```ts
type User = {
  id: string;
  name: string;
  email_address: string;
  version: number;
};
```

This type can then be passed as the type parameter to a `sql.exec()` call:

```ts
// The type parameter is passed between angle brackets before the function argument:
const result = this.ctx.storage.sql
  .exec<User>(
    "SELECT id, name, email_address, version FROM users WHERE id = ?",
    user_id,
  )
  .one();
// result will now have a type of "User"


// Alternatively, if you are iterating over results using a cursor
let cursor = this.sql.exec<User>(
  "SELECT id, name, email_address, version FROM users WHERE id = ?",
  user_id,
);
for (let row of cursor) {
  // Each row object will be of type User
}


// Or, if you are using raw() to convert results into an array, define an array type:
type UserRow = [
  id: string,
  name: string,
  email_address: string,
  version: number,
];


// ... and then pass it as the type argument to the raw() method:
let cursor = sql
  .exec(
    "SELECT id, name, email_address, version FROM users WHERE id = ?",
    user_id,
  )
  .raw<UserRow>();


for (let row of cursor) {
  // row is of type User
}
```

You can represent the shape of any result type you wish, including more complex types. If you are performing a `JOIN` across multiple tables, you can compose a type that reflects the results of your queries.

## Indexes in SQLite

Creating indexes for your most queried tables and filtered columns reduces how much data is scanned and improves query performance at the same time. If you have a read-heavy workload (most common), this can be particularly advantageous. Writing to columns referenced in an index will add at least one (1) additional row written to account for updating the index, but this is typically offset by the reduction in rows read due to the benefits of an index.

## SQL in Durable Objects vs D1

Cloudflare Workers offers a SQLite-backed serverless database product - [D1](https://developers.cloudflare.com/d1/). How should you compare [SQLite in Durable Objects](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/) and D1?

**D1 is a managed database product.**

D1 fits into a familiar architecture for developers, where application servers communicate with a database over the network. Application servers are typically Workers; however, D1 also supports external, non-Worker access via an [HTTP API](https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/query/), which helps unlock [third-party tooling](https://developers.cloudflare.com/d1/reference/community-projects/#_top) support for D1.

D1 aims for a "batteries included" feature set, including the above HTTP API, [database schema management](https://developers.cloudflare.com/d1/reference/migrations/#_top), [data import/export](https://developers.cloudflare.com/d1/best-practices/import-export-data/), and [database query insights](https://developers.cloudflare.com/d1/observability/metrics-analytics/#query-insights).

With D1, your application code and SQL database queries are not colocated which can impact application performance. If performance is a concern with D1, Workers has [Smart Placement](https://developers.cloudflare.com/workers/configuration/placement/#_top) to dynamically run your Worker in the best location to reduce total Worker request latency, considering everything your Worker talks to, including D1.

**SQLite in Durable Objects is a lower-level compute with storage building block for distributed systems.**

By design, Durable Objects are accessed with Workers-only.

Durable Objects require a bit more effort, but in return, give you more flexibility and control. With Durable Objects, you must implement two pieces of code that run in different places: a front-end Worker which routes incoming requests from the Internet to a unique Durable Object, and the Durable Object itself, which runs on the same machine as the SQLite database. You get to choose what runs where, and it may be that your application benefits from running some application business logic right next to the database.

With SQLite in Durable Objects, you may also need to build some of your own database tooling that comes out-of-the-box with D1.

SQL query pricing and limits are intended to be identical between D1 ([pricing](https://developers.cloudflare.com/d1/platform/pricing/), [limits](https://developers.cloudflare.com/d1/platform/limits/)) and SQLite in Durable Objects ([pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/#sql-storage-billing), [limits](https://developers.cloudflare.com/durable-objects/platform/limits/)).

## Related resources

* [Zero-latency SQLite storage in every Durable Object blog post](https://blog.cloudflare.com/sqlite-in-durable-objects)

</page>

<page>
---
title: Invoke methods · Cloudflare Durable Objects docs
description: All new projects and existing projects with a compatibility date
  greater than or equal to 2024-04-03 should prefer to invoke Remote Procedure
  Call (RPC) methods defined on a Durable Object class.
lastUpdated: 2025-09-23T20:48:09.000Z
chatbotDeprioritize: false
tags: RPC
source_url:
  html: https://developers.cloudflare.com/durable-objects/best-practices/create-durable-object-stubs-and-send-requests/
  md: https://developers.cloudflare.com/durable-objects/best-practices/create-durable-object-stubs-and-send-requests/index.md
---

## Invoking methods on a Durable Object

All new projects and existing projects with a compatibility date greater than or equal to [`2024-04-03`](https://developers.cloudflare.com/workers/configuration/compatibility-flags/#durable-object-stubs-and-service-bindings-support-rpc) should prefer to invoke [Remote Procedure Call (RPC)](https://developers.cloudflare.com/workers/runtime-apis/rpc/) methods defined on a Durable Object class.

Projects requiring HTTP request/response flows or legacy projects can continue to invoke the `fetch()` handler on the Durable Object class.

### Invoke RPC methods

By writing a Durable Object class which inherits from the built-in type `DurableObject`, public methods on the Durable Objects class are exposed as [RPC methods](https://developers.cloudflare.com/workers/runtime-apis/rpc/), which you can call using a [DurableObjectStub](https://developers.cloudflare.com/durable-objects/api/stub) from a Worker.

All RPC calls are [asynchronous](https://developers.cloudflare.com/workers/runtime-apis/rpc/lifecycle/), accept and return [serializable types](https://developers.cloudflare.com/workers/runtime-apis/rpc/), and [propagate exceptions](https://developers.cloudflare.com/workers/runtime-apis/rpc/error-handling/) to the caller without a stack trace. Refer to [Workers RPC](https://developers.cloudflare.com/workers/runtime-apis/rpc/) for complete details.

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  // Durable Object
  export class MyDurableObject extends DurableObject {
    constructor(ctx, env) {
      super(ctx, env);
    }


    async sayHello() {
      return "Hello, World!";
    }
  }


  // Worker
  export default {
    async fetch(request, env) {
      // A stub is a client used to invoke methods on the Durable Object
      const stub = env.MY_DURABLE_OBJECT.getByName("foo");


      // Methods on the Durable Object are invoked via the stub
      const rpcResponse = await stub.sayHello();


      return new Response(rpcResponse);
    },
  };
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    MY_DURABLE_OBJECT: DurableObjectNamespace<MyDurableObject>;
  }


  // Durable Object
  export class MyDurableObject extends DurableObject {
    constructor(ctx: DurableObjectState, env: Env) {
      super(ctx, env);
    }


    async sayHello(): Promise<string> {
      return "Hello, World!";
    }
  }


  // Worker
  export default {
    async fetch(request, env) {
      // A stub is a client used to invoke methods on the Durable Object
      const stub = env.MY_DURABLE_OBJECT.getByName("foo");


      // Methods on the Durable Object are invoked via the stub
      const rpcResponse = await stub.sayHello();


      return new Response(rpcResponse);
    },
  } satisfies ExportedHandler<Env>;
  ```

Note

With RPC, the `DurableObject` superclass defines `ctx` and `env` as class properties. What was previously called `state` is now called `ctx` when you extend the `DurableObject` class. The name `ctx` is adopted rather than `state` for the `DurableObjectState` interface to be consistent between `DurableObject` and `WorkerEntrypoint` objects.

Refer to [Build a Counter](https://developers.cloudflare.com/durable-objects/examples/build-a-counter/) for a complete example.

### Invoking the `fetch` handler

If your project is stuck on a compatibility date before [`2024-04-03`](https://developers.cloudflare.com/workers/configuration/compatibility-flags/#durable-object-stubs-and-service-bindings-support-rpc), or has the need to send a [`Request`](https://developers.cloudflare.com/workers/runtime-apis/request/) object and return a `Response` object, then you should send requests to a Durable Object via the fetch handler.

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  // Durable Object
  export class MyDurableObject extends DurableObject {
    constructor(ctx, env) {
      super(ctx, env);
    }


    async fetch(request) {
      return new Response("Hello, World!");
    }
  }


  // Worker
  export default {
    async fetch(request, env) {
      // A stub is a client used to invoke methods on the Durable Object
      const stub = env.MY_DURABLE_OBJECT.getByName("foo");


      // Methods on the Durable Object are invoked via the stub
      const response = await stub.fetch(request);


      return response;
    },
  };
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    MY_DURABLE_OBJECT: DurableObjectNamespace<MyDurableObject>;
  }


  // Durable Object
  export class MyDurableObject extends DurableObject {
    constructor(ctx: DurableObjectState, env: Env) {
      super(ctx, env);
    }


    async fetch(request: Request): Promise<Response> {
      return new Response("Hello, World!");
    }
  }


  // Worker
  export default {
    async fetch(request, env) {
      // A stub is a client used to invoke methods on the Durable Object
      const stub = env.MY_DURABLE_OBJECT.getByName("foo");


      // Methods on the Durable Object are invoked via the stub
      const response = await stub.fetch(request);


      return response;
    },
  } satisfies ExportedHandler<Env>;
  ```

The `URL` associated with the [`Request`](https://developers.cloudflare.com/workers/runtime-apis/request/) object passed to the `fetch()` handler of your Durable Object must be a well-formed URL, but does not have to be a publicly-resolvable hostname.

Without RPC, customers frequently construct requests which corresponded to private methods on the Durable Object and dispatch requests from the `fetch` handler. RPC is obviously more ergonomic in this example.

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  // Durable Object
  export class MyDurableObject extends DurableObject {
    constructor(ctx: DurableObjectState, env: Env) {
      super(ctx, env);
    }


    private hello(name) {
      return new Response(`Hello, ${name}!`);
    }


    private goodbye(name) {
      return new Response(`Goodbye, ${name}!`);
    }


    async fetch(request) {
      const url = new URL(request.url);
      let name = url.searchParams.get("name");
      if (!name) {
        name = "World";
      }


      switch (url.pathname) {
        case "/hello":
          return this.hello(name);
        case "/goodbye":
          return this.goodbye(name);
        default:
          return new Response("Bad Request", { status: 400 });
      }
    }
  }


  // Worker
  export default {
    async fetch(_request, env, _ctx) {
      // A stub is a client used to invoke methods on the Durable Object
      const stub = env.MY_DURABLE_OBJECT.getByName("foo");


      // Invoke the fetch handler on the Durable Object stub
      let response = await stub.fetch("http://do/hello?name=World");


      return response;
    },
  };
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    MY_DURABLE_OBJECT: DurableObjectNamespace<MyDurableObject>;
  }


  // Durable Object
  export class MyDurableObject extends DurableObject {
    constructor(ctx: DurableObjectState, env: Env) {
      super(ctx, env);
    }


    private hello(name: string) {
      return new Response(`Hello, ${name}!`);
    }


    private goodbye(name: string) {
      return new Response(`Goodbye, ${name}!`);
    }


    async fetch(request: Request): Promise<Response> {
      const url = new URL(request.url);
      let name = url.searchParams.get("name");
      if (!name) {
        name = "World";
      }


      switch (url.pathname) {
        case "/hello":
          return this.hello(name);
        case "/goodbye":
          return this.goodbye(name);
        default:
          return new Response("Bad Request", { status: 400 });
      }
    }
  }


  // Worker
  export default {
    async fetch(_request, env, _ctx) {
      // A stub is a client used to invoke methods on the Durable Object
      const stub = env.MY_DURABLE_OBJECT.getByName("foo");


      // Invoke the fetch handler on the Durable Object stub
      let response = await stub.fetch("http://do/hello?name=World");


      return response;
    },
  } satisfies ExportedHandler<Env>;
  ```

</page>

<page>
---
title: Error handling · Cloudflare Durable Objects docs
description: Any uncaught exceptions thrown by a Durable Object or thrown by
  Durable Objects' infrastructure (such as overloads or network errors) will be
  propagated to the callsite of the client. Catching these exceptions allows you
  to retry creating the DurableObjectStub and sending requests.
lastUpdated: 2025-09-29T13:29:31.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/best-practices/error-handling/
  md: https://developers.cloudflare.com/durable-objects/best-practices/error-handling/index.md
---

Any uncaught exceptions thrown by a Durable Object or thrown by Durable Objects' infrastructure (such as overloads or network errors) will be propagated to the callsite of the client. Catching these exceptions allows you to retry creating the [`DurableObjectStub`](https://developers.cloudflare.com/durable-objects/api/stub) and sending requests.

JavaScript Errors with the property `.retryable` set to True are suggested to be retried if requests to the Durable Object are idempotent, or can be applied multiple times without changing the response. If requests are not idempotent, then you will need to decide what is best for your application. It is strongly recommended to apply exponential backoff when retrying requests.

JavaScript Errors with the property `.overloaded` set to True should not be retried. If a Durable Object is overloaded, then retrying will worsen the overload and increase the overall error rate.

Recreating the DurableObjectStub after exceptions

Many exceptions leave the [`DurableObjectStub`](https://developers.cloudflare.com/durable-objects/api/stub) in a "broken" state, such that all attempts to send additional requests will just fail immediately with the original exception. To avoid this, you should avoid reusing a `DurableObjectStub` after it throws an exception. You should instead create a new one for any subsequent requests.

## How exceptions are thrown

Durable Objects can throw exceptions in one of two ways:

* An exception can be thrown within the user code which implements a Durable Object class. The resulting exception will have a `.remote` property set to `True` in this case.
* An exception can be generated by Durable Object's infrastructure. Some sources of infrastructure exceptions include: transient internal errors, sending too many requests to a single Durable Object, and too many requests being queued due to slow or excessive I/O (external API calls or storage operations) within an individual Durable Object. Some infrastructure exceptions may also have the `.remote` property set to `True` -- for example, when the Durable Object exceeds its memory or CPU limits.

Refer to [Troubleshooting](https://developers.cloudflare.com/durable-objects/observability/troubleshooting/) to review the types of errors returned by a Durable Object and/or Durable Objects infrastructure and how to prevent them.

## Example

This example demonstrates retrying requests using the recommended exponential backoff algorithm.

```ts
import { DurableObject } from "cloudflare:workers";


export interface Env {
  ErrorThrowingObject: DurableObjectNamespace;
}


export default {
  async fetch(request, env, ctx) {
    let userId = new URL(request.url).searchParams.get("userId") || "";


    // Retry behavior can be adjusted to fit your application.
    let maxAttempts = 3;
    let baseBackoffMs = 100;
    let maxBackoffMs = 20000;


    let attempt = 0;
    while (true) {
      // Try sending the request
      try {
        // Create a Durable Object stub for each attempt, because certain types of
        // errors will break the Durable Object stub.
        const doStub = env.ErrorThrowingObject.getByName(userId);
        const resp = await doStub.fetch("http://your-do/");


        return Response.json(resp);
      } catch (e: any) {
        if (!e.retryable) {
          // Failure was not a transient internal error, so don't retry.
          break;
        }
      }
      let backoffMs = Math.min(
        maxBackoffMs,
        baseBackoffMs * Math.random() * Math.pow(2, attempt),
      );
      attempt += 1;
      if (attempt >= maxAttempts) {
        // Reached max attempts, so don't retry.
        break;
      }
      await scheduler.wait(backoffMs);
    }
    return new Response("server error", { status: 500 });
  },
} satisfies ExportedHandler<Env>;


export class ErrorThrowingObject extends DurableObject {
  constructor(state: DurableObjectState, env: Env) {
    super(state, env);


    // Any exceptions that are raised in your constructor will also set the
    // .remote property to True
    throw new Error("no good");
  }


  async fetch(req: Request) {
    // Generate an uncaught exception
    // A .remote property will be added to the exception propagated to the caller
    // and will be set to True
    throw new Error("example error");


    // We never reach this
    return Response.json({});
  }
}
```

</page>

<page>
---
title: Rules of Durable Objects · Cloudflare Durable Objects docs
description: Durable Objects provide a powerful primitive for building stateful,
  coordinated applications. Each Durable Object is a single-threaded,
  globally-unique instance with its own persistent storage. Understanding how to
  design around these properties is essential for building effective
  applications.
lastUpdated: 2026-02-10T11:46:14.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/
  md: https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/index.md
---

Durable Objects provide a powerful primitive for building stateful, coordinated applications. Each Durable Object is a single-threaded, globally-unique instance with its own persistent storage. Understanding how to design around these properties is essential for building effective applications.

This is a guidebook on how to build more effective and correct Durable Object applications.

## When to use Durable Objects

### Use Durable Objects for stateful coordination, not stateless request handling

Workers are stateless functions: each request may run on a different instance, in a different location, with no shared memory between requests. Durable Objects are stateful compute: each instance has a unique identity, runs in a single location, and maintains state across requests.

Use Durable Objects when you need:

* **Coordination** — Multiple clients need to interact with shared state (chat rooms, multiplayer games, collaborative documents)
* **Strong consistency** — Operations must be serialized to avoid race conditions (inventory management, booking systems, turn-based games)
* **Per-entity storage** — Each user, tenant, or resource needs its own isolated database (multi-tenant SaaS, per-user data)
* **Persistent connections** — Long-lived WebSocket connections that survive across requests (real-time notifications, live updates)
* **Scheduled work per entity** — Each entity needs its own timer or scheduled task (subscription renewals, game timeouts)

Use plain Workers when you need:

* **Stateless request handling** — API endpoints, proxies, or transformations with no shared state
* **Maximum global distribution** — Requests should be handled at the nearest edge location
* **High fan-out** — Each request is independent and can be processed in parallel

- JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  // ✅ Good use of Durable Objects: Seat booking requires coordination
  // All booking requests for a venue must be serialized to prevent double-booking
  export class SeatBooking extends DurableObject {
    async bookSeat(seatId, userId) {
      // Check if seat is already booked
      const existing = this.ctx.storage.sql
        .exec("SELECT user_id FROM bookings WHERE seat_id = ?", seatId)
        .toArray();


      if (existing.length > 0) {
        return { success: false, message: "Seat already booked" };
      }


      // Book the seat - this is safe because Durable Objects are single-threaded
      this.ctx.storage.sql.exec(
        "INSERT INTO bookings (seat_id, user_id, booked_at) VALUES (?, ?, ?)",
        seatId,
        userId,
        Date.now(),
      );


      return { success: true, message: "Seat booked successfully" };
    }
  }


  export default {
    async fetch(request, env) {
      const url = new URL(request.url);
      const eventId = url.searchParams.get("event") ?? "default";


      // Route to a Durable Object by event ID
      // All bookings for the same event go to the same instance
      const id = env.BOOKING.idFromName(eventId);
      const booking = env.BOOKING.get(id);


      const { seatId, userId } = await request.json();
      const result = await booking.bookSeat(seatId, userId);


      return Response.json(result, {
        status: result.success ? 200 : 409,
      });
    },
  };
  ```

- TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    BOOKING: DurableObjectNamespace<SeatBooking>;
  }


  // ✅ Good use of Durable Objects: Seat booking requires coordination
  // All booking requests for a venue must be serialized to prevent double-booking
  export class SeatBooking extends DurableObject<Env> {
    async bookSeat(
      seatId: string,
      userId: string
    ): Promise<{ success: boolean; message: string }> {
      // Check if seat is already booked
      const existing = this.ctx.storage.sql
        .exec<{ user_id: string }>(
          "SELECT user_id FROM bookings WHERE seat_id = ?",
          seatId
        )
        .toArray();


      if (existing.length > 0) {
        return { success: false, message: "Seat already booked" };
      }


      // Book the seat - this is safe because Durable Objects are single-threaded
      this.ctx.storage.sql.exec(
        "INSERT INTO bookings (seat_id, user_id, booked_at) VALUES (?, ?, ?)",
        seatId,
        userId,
        Date.now()
      );


      return { success: true, message: "Seat booked successfully" };
    }
  }


  export default {
    async fetch(request: Request, env: Env): Promise<Response> {
      const url = new URL(request.url);
      const eventId = url.searchParams.get("event") ?? "default";


      // Route to a Durable Object by event ID
      // All bookings for the same event go to the same instance
      const id = env.BOOKING.idFromName(eventId);
      const booking = env.BOOKING.get(id);


      const { seatId, userId } = await request.json<{
        seatId: string;
        userId: string;
      }>();
      const result = await booking.bookSeat(seatId, userId);


      return Response.json(result, {
        status: result.success ? 200 : 409,
      });
    },
  };
  ```

A common pattern is to use Workers as the stateless entry point that routes requests to Durable Objects when coordination is needed. The Worker handles authentication, validation, and response formatting, while the Durable Object handles the stateful logic.

## Design and sharding

### Model your Durable Objects around your "atom" of coordination

The most important design decision is choosing what each Durable Object represents. Create one Durable Object per logical unit that needs coordination: a chat room, a game session, a document, a user's data, or a tenant's workspace.

This is the key insight that makes Durable Objects powerful. Instead of a shared database with locks, each "atom" of your application gets its own single-threaded execution environment with private storage.

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  // Each chat room is its own Durable Object instance
  export class ChatRoom extends DurableObject {
    async sendMessage(userId, message) {
      // All messages to this room are processed sequentially by this single instance.
      // No race conditions, no distributed locks needed.
      this.ctx.storage.sql.exec(
        "INSERT INTO messages (user_id, content, created_at) VALUES (?, ?, ?)",
        userId,
        message,
        Date.now(),
      );
    }
  }


  export default {
    async fetch(request, env) {
      const url = new URL(request.url);
      const roomId = url.searchParams.get("room") ?? "lobby";


      // Each room ID maps to exactly one Durable Object instance globally
      const id = env.CHAT_ROOM.idFromName(roomId);
      const stub = env.CHAT_ROOM.get(id);


      await stub.sendMessage("user-123", "Hello, room!");
      return new Response("Message sent");
    },
  };
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    CHAT_ROOM: DurableObjectNamespace<ChatRoom>;
  }


  // Each chat room is its own Durable Object instance
  export class ChatRoom extends DurableObject<Env> {
    async sendMessage(userId: string, message: string) {
      // All messages to this room are processed sequentially by this single instance.
      // No race conditions, no distributed locks needed.
      this.ctx.storage.sql.exec(
        "INSERT INTO messages (user_id, content, created_at) VALUES (?, ?, ?)",
        userId,
        message,
        Date.now()
      );
    }
  }


  export default {
    async fetch(request: Request, env: Env): Promise<Response> {
      const url = new URL(request.url);
      const roomId = url.searchParams.get("room") ?? "lobby";


      // Each room ID maps to exactly one Durable Object instance globally
      const id = env.CHAT_ROOM.idFromName(roomId);
      const stub = env.CHAT_ROOM.get(id);


      await stub.sendMessage("user-123", "Hello, room!");
      return new Response("Message sent");
    },
  };
  ```

Note

If you have global application or user configuration that you need to access frequently (on every request), consider using [Workers KV](https://developers.cloudflare.com/kv/) instead.

Do not create a single "global" Durable Object that handles all requests:

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  // 🔴 Bad: A single Durable Object handling ALL chat rooms
  export class ChatRoom extends DurableObject {
    async sendMessage(roomId, userId, message) {
      // All messages for ALL rooms go through this single instance.
      // This becomes a bottleneck as traffic grows.
      this.ctx.storage.sql.exec(
        "INSERT INTO messages (room_id, user_id, content) VALUES (?, ?, ?)",
        roomId,
        userId,
        message,
      );
    }
  }


  export default {
    async fetch(request, env) {
      // 🔴 Bad: Always using the same ID means one global instance
      const id = env.CHAT_ROOM.idFromName("global");
      const stub = env.CHAT_ROOM.get(id);


      await stub.sendMessage("room-123", "user-456", "Hello!");
      return new Response("Sent");
    },
  };
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    CHAT_ROOM: DurableObjectNamespace<ChatRoom>;
  }


  // 🔴 Bad: A single Durable Object handling ALL chat rooms
  export class ChatRoom extends DurableObject<Env> {
    async sendMessage(roomId: string, userId: string, message: string) {
      // All messages for ALL rooms go through this single instance.
      // This becomes a bottleneck as traffic grows.
      this.ctx.storage.sql.exec(
        "INSERT INTO messages (room_id, user_id, content) VALUES (?, ?, ?)",
        roomId,
        userId,
        message
      );
    }
  }


  export default {
    async fetch(request: Request, env: Env): Promise<Response> {
      // 🔴 Bad: Always using the same ID means one global instance
      const id = env.CHAT_ROOM.idFromName("global");
      const stub = env.CHAT_ROOM.get(id);


      await stub.sendMessage("room-123", "user-456", "Hello!");
      return new Response("Sent");
    },
  };
  ```

### Message throughput limits

A single Durable Object can handle approximately **500-1,000 requests per second** for simple operations. This limit varies based on the work performed per request:

| Operation type | Throughput |
| - | - |
| Simple pass-through (minimal parsing) | \~1,000 req/sec |
| Moderate processing (JSON parsing, validation) | \~500-750 req/sec |
| Complex operations (transformation, storage writes) | \~200-500 req/sec |

When modeling your "atom," factor in the expected request rate. If your use case exceeds these limits, shard your workload across multiple Durable Objects.

For example, consider a real-time game with 50,000 concurrent players sending 10 updates per second. This generates 500,000 requests per second total. You would need 500-1,000 game session Durable Objects—not one global coordinator.

Calculate your sharding requirements:

```plaintext
Required DOs = (Total requests/second) / (Requests per DO capacity)
```

### Use deterministic IDs for predictable routing

Use `getByName()` with meaningful, deterministic strings for consistent routing. The same input always produces the same Durable Object ID, ensuring requests for the same logical entity always reach the same instance.

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  export class GameSession extends DurableObject {
    async join(playerId) {
      // Game logic here
    }
  }


  export default {
    async fetch(request, env) {
      const url = new URL(request.url);
      const gameId = url.searchParams.get("game");


      if (!gameId) {
        return new Response("Missing game ID", { status: 400 });
      }


      // ✅ Good: Deterministic ID from a meaningful string
      // All requests for "game-abc123" go to the same Durable Object
      const stub = env.GAME_SESSION.getByName(gameId);


      await stub.join("player-xyz");
      return new Response("Joined game");
    },
  };
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    GAME_SESSION: DurableObjectNamespace<GameSession>;
  }


  export class GameSession extends DurableObject<Env> {
    async join(playerId: string) {
      // Game logic here
    }
  }


  export default {
    async fetch(request: Request, env: Env): Promise<Response> {
      const url = new URL(request.url);
      const gameId = url.searchParams.get("game");


      if (!gameId) {
        return new Response("Missing game ID", { status: 400 });
      }


      // ✅ Good: Deterministic ID from a meaningful string
      // All requests for "game-abc123" go to the same Durable Object
      const stub = env.GAME_SESSION.getByName(gameId);


      await stub.join("player-xyz");
      return new Response("Joined game");
    },
  };
  ```

Creating a stub does not instantiate or wake up the Durable Object. The Durable Object is only activated when you call a method on the stub.

Use `newUniqueId()` only when you need a new, random instance and will store the mapping externally:

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  export class GameSession extends DurableObject {
    async join(playerId) {
      // Game logic here
    }
  }


  export default {
    async fetch(request, env) {
      // newUniqueId() creates a random ID - useful when creating new instances
      // You must store this ID somewhere (e.g., D1) to find it again later
      const id = env.GAME_SESSION.newUniqueId();
      const stub = env.GAME_SESSION.get(id);


      // Store the mapping: gameCode -> id.toString()
      // await env.DB.prepare("INSERT INTO games (code, do_id) VALUES (?, ?)").bind(gameCode, id.toString()).run();


      return Response.json({ gameId: id.toString() });
    },
  };
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    GAME_SESSION: DurableObjectNamespace<GameSession>;
  }


  export class GameSession extends DurableObject<Env> {
    async join(playerId: string) {
      // Game logic here
    }
  }


  export default {
    async fetch(request: Request, env: Env): Promise<Response> {
      // newUniqueId() creates a random ID - useful when creating new instances
      // You must store this ID somewhere (e.g., D1) to find it again later
      const id = env.GAME_SESSION.newUniqueId();
      const stub = env.GAME_SESSION.get(id);


      // Store the mapping: gameCode -> id.toString()
      // await env.DB.prepare("INSERT INTO games (code, do_id) VALUES (?, ?)").bind(gameCode, id.toString()).run();


      return Response.json({ gameId: id.toString() });
    },
  };
  ```

### Use parent-child relationships for related entities

Do not put all your data in a single Durable Object. When you have hierarchical data (workspaces containing projects, game servers managing matches), create separate child Durable Objects for each entity. The parent coordinates and tracks children, while children handle their own state independently.

This enables parallelism: operations on different children can happen concurrently, while each child maintains its own single-threaded consistency ([read more about this pattern](https://developers.cloudflare.com/reference-architecture/diagrams/storage/durable-object-control-data-plane-pattern/)).

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  // Parent: Coordinates matches, but doesn't store match data
  export class GameServer extends DurableObject {
    async createMatch(matchName) {
      const matchId = crypto.randomUUID();


      // Store reference to the child in parent's database
      this.ctx.storage.sql.exec(
        "INSERT INTO matches (id, name, created_at) VALUES (?, ?, ?)",
        matchId,
        matchName,
        Date.now(),
      );


      // Initialize the child Durable Object
      const childId = this.env.GAME_MATCH.idFromName(matchId);
      const childStub = this.env.GAME_MATCH.get(childId);
      await childStub.init(matchId, matchName);


      return matchId;
    }


    async listMatches() {
      // Parent knows about all matches without waking up each child
      const cursor = this.ctx.storage.sql.exec(
        "SELECT id, name FROM matches ORDER BY created_at DESC",
      );
      return cursor.toArray();
    }
  }


  // Child: Handles its own game state independently
  export class GameMatch extends DurableObject {
    async init(matchId, matchName) {
      await this.ctx.storage.put("matchId", matchId);
      await this.ctx.storage.put("matchName", matchName);
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS players (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          score INTEGER DEFAULT 0
        )
      `);
    }


    async addPlayer(playerId, playerName) {
      this.ctx.storage.sql.exec(
        "INSERT INTO players (id, name, score) VALUES (?, ?, 0)",
        playerId,
        playerName,
      );
    }


    async updateScore(playerId, score) {
      this.ctx.storage.sql.exec(
        "UPDATE players SET score = ? WHERE id = ?",
        score,
        playerId,
      );
    }
  }
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    GAME_SERVER: DurableObjectNamespace<GameServer>;
    GAME_MATCH: DurableObjectNamespace<GameMatch>;
  }


  // Parent: Coordinates matches, but doesn't store match data
  export class GameServer extends DurableObject<Env> {
    async createMatch(matchName: string): Promise<string> {
      const matchId = crypto.randomUUID();


      // Store reference to the child in parent's database
      this.ctx.storage.sql.exec(
        "INSERT INTO matches (id, name, created_at) VALUES (?, ?, ?)",
        matchId,
        matchName,
        Date.now()
      );


      // Initialize the child Durable Object
      const childId = this.env.GAME_MATCH.idFromName(matchId);
      const childStub = this.env.GAME_MATCH.get(childId);
      await childStub.init(matchId, matchName);


      return matchId;
    }


    async listMatches(): Promise<{ id: string; name: string }[]> {
      // Parent knows about all matches without waking up each child
      const cursor = this.ctx.storage.sql.exec<{ id: string; name: string }>(
        "SELECT id, name FROM matches ORDER BY created_at DESC"
      );
      return cursor.toArray();
    }
  }


  // Child: Handles its own game state independently
  export class GameMatch extends DurableObject<Env> {
    async init(matchId: string, matchName: string) {
      await this.ctx.storage.put("matchId", matchId);
      await this.ctx.storage.put("matchName", matchName);
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS players (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          score INTEGER DEFAULT 0
        )
      `);
    }


    async addPlayer(playerId: string, playerName: string) {
      this.ctx.storage.sql.exec(
        "INSERT INTO players (id, name, score) VALUES (?, ?, 0)",
        playerId,
        playerName
      );
    }


    async updateScore(playerId: string, score: number) {
      this.ctx.storage.sql.exec(
        "UPDATE players SET score = ? WHERE id = ?",
        score,
        playerId
      );
    }
  }
  ```

With this pattern:

* Listing matches only queries the parent (children stay hibernated)
* Different matches process player actions in parallel
* Each match has its own SQLite database for player data

### Consider location hints for latency-sensitive applications

By default, a Durable Object is created near the location of the first request it receives. For most applications, this works well. However, you can provide a location hint to influence where the Durable Object is created.

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  export class GameSession extends DurableObject {
    // Game session logic
  }


  export default {
    async fetch(request, env) {
      const url = new URL(request.url);
      const gameId = url.searchParams.get("game") ?? "default";
      const region = url.searchParams.get("region") ?? "wnam"; // Western North America


      // Provide a location hint for where this Durable Object should be created
      const id = env.GAME_SESSION.idFromName(gameId);
      const stub = env.GAME_SESSION.get(id, { locationHint: region });


      return new Response("Connected to game session");
    },
  };
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    GAME_SESSION: DurableObjectNamespace<GameSession>;
  }


  export class GameSession extends DurableObject<Env> {
    // Game session logic
  }


  export default {
    async fetch(request: Request, env: Env): Promise<Response> {
      const url = new URL(request.url);
      const gameId = url.searchParams.get("game") ?? "default";
      const region = url.searchParams.get("region") ?? "wnam"; // Western North America


      // Provide a location hint for where this Durable Object should be created
      const id = env.GAME_SESSION.idFromName(gameId);
      const stub = env.GAME_SESSION.get(id, { locationHint: region });


      return new Response("Connected to game session");
    },
  };
  ```

Location hints are suggestions, not guarantees. Refer to [Data location](https://developers.cloudflare.com/durable-objects/reference/data-location/) for available regions and details.

## Storage and state

### Use SQLite-backed Durable Objects

[SQLite storage](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/) is the recommended storage backend for new Durable Objects. It provides a familiar SQL API for relational queries, indexes, transactions, and better performance than the legacy key-value storage backed Durable Objects. SQLite Durable Objects also support the KV API in synchronous and asynchronous versions.

Configure your Durable Object class to use SQLite storage in your Wrangler configuration:

* wrangler.jsonc

  ```jsonc
  {
    "migrations": [
      { "tag": "v1", "new_sqlite_classes": ["ChatRoom"] }
    ]
  }
  ```

* wrangler.toml

  ```toml
  [[migrations]]
  tag = "v1"
  new_sqlite_classes = [ "ChatRoom" ]
  ```

Then use the SQL API in your Durable Object:

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  export class ChatRoom extends DurableObject {
    constructor(ctx, env) {
      super(ctx, env);


      // Create tables on first instantiation
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at INTEGER NOT NULL
        )
      `);
    }


    async addMessage(userId, content) {
      this.ctx.storage.sql.exec(
        "INSERT INTO messages (user_id, content, created_at) VALUES (?, ?, ?)",
        userId,
        content,
        Date.now(),
      );
    }


    async getRecentMessages(limit = 50) {
      // Use type parameter for typed results
      const cursor = this.ctx.storage.sql.exec(
        "SELECT * FROM messages ORDER BY created_at DESC LIMIT ?",
        limit,
      );
      return cursor.toArray();
    }
  }
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    CHAT_ROOM: DurableObjectNamespace<ChatRoom>;
  }


  type Message = {
    id: number;
    user_id: string;
    content: string;
    created_at: number;
  };


  export class ChatRoom extends DurableObject<Env> {
    constructor(ctx: DurableObjectState, env: Env) {
      super(ctx, env);


      // Create tables on first instantiation
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at INTEGER NOT NULL
        )
      `);
    }


    async addMessage(userId: string, content: string) {
      this.ctx.storage.sql.exec(
        "INSERT INTO messages (user_id, content, created_at) VALUES (?, ?, ?)",
        userId,
        content,
        Date.now()
      );
    }


    async getRecentMessages(limit: number = 50): Promise<Message[]> {
      // Use type parameter for typed results
      const cursor = this.ctx.storage.sql.exec<Message>(
        "SELECT * FROM messages ORDER BY created_at DESC LIMIT ?",
        limit
      );
      return cursor.toArray();
    }
  }
  ```

Refer to [Access Durable Objects storage](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/) for more details on the SQL API.

### Initialize storage and run migrations in the constructor

Use `blockConcurrencyWhile()` in the constructor to run migrations and initialize state before any requests are processed. This ensures your schema is ready and prevents race conditions during initialization.

Note

`PRAGMA user_version` is not supported by Durable Objects SQLite storage. You must use an alternative approach to track your schema version.

For production applications, use a migration library that handles version tracking and execution automatically:

* [`durable-utils`](https://github.com/lambrospetrou/durable-utils#sqlite-schema-migrations) — provides a `SQLSchemaMigrations` class that tracks executed migrations both in memory and in storage.
* [`@cloudflare/actors` storage utilities](https://github.com/cloudflare/actors/blob/main/packages/storage/src/sql-schema-migrations.ts) — a reference implementation of the same pattern used by the Cloudflare Actors framework.

If you prefer not to use a library, you can track schema versions manually using a `_sql_schema_migrations` table. The following example demonstrates this approach:

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  export class ChatRoom extends DurableObject {
    constructor(ctx, env) {
      super(ctx, env);


      // blockConcurrencyWhile() ensures no requests are processed until this completes
      ctx.blockConcurrencyWhile(async () => {
        await this.migrate();
      });
    }


    async migrate() {
      // Create the migrations tracking table if it does not exist
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS _sql_schema_migrations (
          id INTEGER PRIMARY KEY,
          applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);


      // Determine the current schema version
      const version = this.ctx.storage.sql
        .exec(
          "SELECT COALESCE(MAX(id), 0) as version FROM _sql_schema_migrations",
        )
        .one().version;


      if (version < 1) {
        this.ctx.storage.sql.exec(`
          CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at INTEGER NOT NULL
          );
          CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
          INSERT INTO _sql_schema_migrations (id) VALUES (1);
        `);
      }


      if (version < 2) {
        // Future migration: add a new column
        this.ctx.storage.sql.exec(`
          ALTER TABLE messages ADD COLUMN edited_at INTEGER;
          INSERT INTO _sql_schema_migrations (id) VALUES (2);
        `);
      }
    }
  }
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    CHAT_ROOM: DurableObjectNamespace<ChatRoom>;
  }


  export class ChatRoom extends DurableObject<Env> {
    constructor(ctx: DurableObjectState, env: Env) {
      super(ctx, env);


      // blockConcurrencyWhile() ensures no requests are processed until this completes
      ctx.blockConcurrencyWhile(async () => {
        await this.migrate();
      });
    }


    private async migrate() {
      // Create the migrations tracking table if it does not exist
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS _sql_schema_migrations (
          id INTEGER PRIMARY KEY,
          applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);


      // Determine the current schema version
      const version =
        this.ctx.storage.sql
          .exec<{ version: number }>(
            "SELECT COALESCE(MAX(id), 0) as version FROM _sql_schema_migrations",
          )
          .one().version;


      if (version < 1) {
        this.ctx.storage.sql.exec(`
          CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at INTEGER NOT NULL
          );
          CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
          INSERT INTO _sql_schema_migrations (id) VALUES (1);
        `);
      }


      if (version < 2) {
        // Future migration: add a new column
        this.ctx.storage.sql.exec(`
          ALTER TABLE messages ADD COLUMN edited_at INTEGER;
          INSERT INTO _sql_schema_migrations (id) VALUES (2);
        `);
      }
    }
  }
  ```

### Understand the difference between in-memory state and persistent storage

Durable Objects provide multiple state management layers, each with different characteristics:

| Type | Speed | Persistence | Use Case |
| - | - | - | - |
| In-memory (class properties) | Fastest | Lost on eviction or crash | Caching, active connections |
| SQLite storage | Fast | Durable across restarts | Primary data storage |
| External (R2, D1) | Variable | Durable, cross-DO accessible | Large files, shared data |

In-memory state is **not preserved** if the Durable Object is evicted from memory due to inactivity, or if it crashes from an uncaught exception. Always persist important state to SQLite storage.

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  export class ChatRoom extends DurableObject {
    // In-memory cache - fast but NOT preserved across evictions or crashes
    messageCache = null;


    async getRecentMessages() {
      // Return from cache if available (only valid while DO is in memory)
      if (this.messageCache !== null) {
        return this.messageCache;
      }


      // Otherwise, load from durable storage
      const cursor = this.ctx.storage.sql.exec(
        "SELECT * FROM messages ORDER BY created_at DESC LIMIT 100",
      );
      this.messageCache = cursor.toArray();
      return this.messageCache;
    }


    async addMessage(userId, content) {
      // ✅ Always persist to durable storage first
      this.ctx.storage.sql.exec(
        "INSERT INTO messages (user_id, content, created_at) VALUES (?, ?, ?)",
        userId,
        content,
        Date.now(),
      );


      // Then update the cache (if it exists)
      // If the DO crashes here, the message is still saved in SQLite
      this.messageCache = null; // Invalidate cache
    }
  }
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    CHAT_ROOM: DurableObjectNamespace<ChatRoom>;
  }


  type Message = {
    id: number;
    user_id: string;
    content: string;
    created_at: number;
  };


  export class ChatRoom extends DurableObject<Env> {
    // In-memory cache - fast but NOT preserved across evictions or crashes
    private messageCache: Message[] | null = null;


    async getRecentMessages(): Promise<Message[]> {
      // Return from cache if available (only valid while DO is in memory)
      if (this.messageCache !== null) {
        return this.messageCache;
      }


      // Otherwise, load from durable storage
      const cursor = this.ctx.storage.sql.exec<Message>(
        "SELECT * FROM messages ORDER BY created_at DESC LIMIT 100"
      );
      this.messageCache = cursor.toArray();
      return this.messageCache;
    }


    async addMessage(userId: string, content: string) {
      // ✅ Always persist to durable storage first
      this.ctx.storage.sql.exec(
        "INSERT INTO messages (user_id, content, created_at) VALUES (?, ?, ?)",
        userId,
        content,
        Date.now()
      );


      // Then update the cache (if it exists)
      // If the DO crashes here, the message is still saved in SQLite
      this.messageCache = null; // Invalidate cache
    }
  }
  ```

Warning

If an uncaught exception occurs in your Durable Object, the runtime may terminate the instance. Any in-memory state will be lost, but SQLite storage remains intact. Always persist critical state to storage before performing operations that might fail.

### Create indexes for frequently-queried columns

Just like any database, indexes dramatically improve read performance for frequently-filtered columns. The cost is slightly more storage and marginally slower writes.

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  export class ChatRoom extends DurableObject {
    constructor(ctx, env) {
      super(ctx, env);


      ctx.blockConcurrencyWhile(async () => {
        this.ctx.storage.sql.exec(`
          CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at INTEGER NOT NULL
          );


          -- Index for queries filtering by user
          CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);


          -- Index for time-based queries (recent messages)
          CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);


          -- Composite index for user + time queries
          CREATE INDEX IF NOT EXISTS idx_messages_user_time ON messages(user_id, created_at);
        `);
      });
    }


    // This query benefits from idx_messages_user_time
    async getUserMessages(userId, since) {
      return this.ctx.storage.sql
        .exec(
          "SELECT * FROM messages WHERE user_id = ? AND created_at > ? ORDER BY created_at",
          userId,
          since,
        )
        .toArray();
    }
  }
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    CHAT_ROOM: DurableObjectNamespace<ChatRoom>;
  }


  export class ChatRoom extends DurableObject<Env> {
    constructor(ctx: DurableObjectState, env: Env) {
      super(ctx, env);


      ctx.blockConcurrencyWhile(async () => {
        this.ctx.storage.sql.exec(`
          CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at INTEGER NOT NULL
          );


          -- Index for queries filtering by user
          CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);


          -- Index for time-based queries (recent messages)
          CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);


          -- Composite index for user + time queries
          CREATE INDEX IF NOT EXISTS idx_messages_user_time ON messages(user_id, created_at);
        `);
      });
    }


    // This query benefits from idx_messages_user_time
    async getUserMessages(userId: string, since: number) {
      return this.ctx.storage.sql
        .exec(
          "SELECT * FROM messages WHERE user_id = ? AND created_at > ? ORDER BY created_at",
          userId,
          since
        )
        .toArray();
    }
  }
  ```

### Understand how input and output gates work

While Durable Objects are single-threaded, JavaScript's `async`/`await` can allow multiple requests to interleave execution while a request waits for the result of an asynchronous operation. Cloudflare's runtime uses **input gates** and **output gates** to prevent data races and ensure correctness by default.

**Input gates** block new events (incoming requests, fetch responses) while synchronous JavaScript execution is in progress. Awaiting async operations like `fetch()` or KV storage methods opens the input gate, allowing other requests to interleave. However, storage operations provide special protection:

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  export class Counter extends DurableObject {
    // This code is safe due to input gates
    async increment() {
      // While these storage operations execute, no other requests
      // can interleave - input gate blocks new events
      const value = (await this.ctx.storage.get("count")) ?? 0;
      await this.ctx.storage.put("count", value + 1);
      return value + 1;
    }
  }
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    COUNTER: DurableObjectNamespace<Counter>;
  }


  export class Counter extends DurableObject<Env> {
    // This code is safe due to input gates
    async increment(): Promise<number> {
      // While these storage operations execute, no other requests
      // can interleave - input gate blocks new events
      const value = (await this.ctx.storage.get<number>("count")) ?? 0;
      await this.ctx.storage.put("count", value + 1);
      return value + 1;
    }
  }
  ```

**Output gates** hold outgoing network messages (responses, fetch requests) until pending storage writes complete. This ensures clients never see confirmation of data that has not been persisted:

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  export class ChatRoom extends DurableObject {
    async sendMessage(userId, content) {
      // Write to storage - don't need to await for correctness
      this.ctx.storage.sql.exec(
        "INSERT INTO messages (user_id, content, created_at) VALUES (?, ?, ?)",
        userId,
        content,
        Date.now(),
      );


      // This response is held by the output gate until the write completes.
      // The client only receives "Message sent" after data is safely persisted.
      return "Message sent";
    }
  }
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    CHAT_ROOM: DurableObjectNamespace<ChatRoom>;
  }


  export class ChatRoom extends DurableObject<Env> {
    async sendMessage(userId: string, content: string): Promise<string> {
      // Write to storage - don't need to await for correctness
      this.ctx.storage.sql.exec(
        "INSERT INTO messages (user_id, content, created_at) VALUES (?, ?, ?)",
        userId,
        content,
        Date.now()
      );


      // This response is held by the output gate until the write completes.
      // The client only receives "Message sent" after data is safely persisted.
      return "Message sent";
    }
  }
  ```

**Write coalescing:** Multiple storage writes without intervening `await` calls are automatically batched into a single atomic implicit transaction:

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  export class Account extends DurableObject {
    async transfer(fromId, toId, amount) {
      // ✅ Good: These writes are coalesced into one atomic transaction
      this.ctx.storage.sql.exec(
        "UPDATE accounts SET balance = balance - ? WHERE id = ?",
        amount,
        fromId,
      );
      this.ctx.storage.sql.exec(
        "UPDATE accounts SET balance = balance + ? WHERE id = ?",
        amount,
        toId,
      );
      this.ctx.storage.sql.exec(
        "INSERT INTO transfers (from_id, to_id, amount, created_at) VALUES (?, ?, ?, ?)",
        fromId,
        toId,
        amount,
        Date.now(),
      );
      // All three writes commit together atomically
    }


    // 🔴 Bad: await on KV operations breaks coalescing
    async transferBrokenKV(fromId, toId, amount) {
      const fromBalance = (await this.ctx.storage.get(`balance:${fromId}`)) ?? 0;
      await this.ctx.storage.put(`balance:${fromId}`, fromBalance - amount);
      // If the next write fails, the debit already committed!
      const toBalance = (await this.ctx.storage.get(`balance:${toId}`)) ?? 0;
      await this.ctx.storage.put(`balance:${toId}`, toBalance + amount);
    }
  }
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    ACCOUNT: DurableObjectNamespace<Account>;
  }


  export class Account extends DurableObject<Env> {
    async transfer(fromId: string, toId: string, amount: number) {
      // ✅ Good: These writes are coalesced into one atomic transaction
      this.ctx.storage.sql.exec(
        "UPDATE accounts SET balance = balance - ? WHERE id = ?",
        amount,
        fromId
      );
      this.ctx.storage.sql.exec(
        "UPDATE accounts SET balance = balance + ? WHERE id = ?",
        amount,
        toId
      );
      this.ctx.storage.sql.exec(
        "INSERT INTO transfers (from_id, to_id, amount, created_at) VALUES (?, ?, ?, ?)",
        fromId,
        toId,
        amount,
        Date.now()
      );
      // All three writes commit together atomically
    }


    // 🔴 Bad: await on KV operations breaks coalescing
    async transferBrokenKV(fromId: string, toId: string, amount: number) {
      const fromBalance = (await this.ctx.storage.get<number>(`balance:${fromId}`)) ?? 0;
      await this.ctx.storage.put(`balance:${fromId}`, fromBalance - amount);
      // If the next write fails, the debit already committed!
      const toBalance = (await this.ctx.storage.get<number>(`balance:${toId}`)) ?? 0;
      await this.ctx.storage.put(`balance:${toId}`, toBalance + amount);
    }
  }
  ```

For more details, see [Durable Objects: Easy, Fast, Correct — Choose three](https://blog.cloudflare.com/durable-objects-easy-fast-correct-choose-three/) and the [glossary](https://developers.cloudflare.com/durable-objects/reference/glossary/).

### Avoid race conditions with non-storage I/O

Input gates only protect during storage operations. Non-storage I/O like `fetch()` or writing to R2 allows other requests to interleave, which can cause race conditions:

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  export class Processor extends DurableObject {
    // ⚠️ Potential race condition: fetch() allows interleaving
    async processItem(id) {
      const item = await this.ctx.storage.get(`item:${id}`);


      if (item?.status === "pending") {
        // During this fetch, other requests CAN execute and modify storage
        const result = await fetch("https://api.example.com/process");


        // Another request may have already processed this item!
        await this.ctx.storage.put(`item:${id}`, { status: "completed" });
      }
    }
  }
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    PROCESSOR: DurableObjectNamespace<Processor>;
  }


  export class Processor extends DurableObject<Env> {
    // ⚠️ Potential race condition: fetch() allows interleaving
    async processItem(id: string) {
      const item = await this.ctx.storage.get<{ status: string }>(`item:${id}`);


      if (item?.status === "pending") {
        // During this fetch, other requests CAN execute and modify storage
        const result = await fetch("https://api.example.com/process");


        // Another request may have already processed this item!
        await this.ctx.storage.put(`item:${id}`, { status: "completed" });
      }
    }
  }
  ```

To handle this, use optimistic locking (check-and-set) patterns: read a version number before the external call, then verify it has not changed before writing.

Note

With the legacy KV storage backend, use the [`transaction()`](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/#transaction) method for atomic read-modify-write operations across async boundaries.

### Use `blockConcurrencyWhile()` sparingly

The [`blockConcurrencyWhile()`](https://developers.cloudflare.com/durable-objects/api/state/#blockconcurrencywhile) method guarantees that no other events are processed until the provided callback completes, even if the callback performs asynchronous I/O. This is useful for operations that must be atomic, such as state initialization from storage in the constructor:

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  export class ChatRoom extends DurableObject {
    constructor(ctx, env) {
      super(ctx, env);


      // ✅ Good: Use blockConcurrencyWhile for one-time initialization
      ctx.blockConcurrencyWhile(async () => {
        this.ctx.storage.sql.exec(`
          CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY,
            content TEXT
          )
        `);
      });
    }


    // 🔴 Bad: Don't use blockConcurrencyWhile on every request
    async sendMessageSlow(content) {
      await this.ctx.blockConcurrencyWhile(async () => {
        this.ctx.storage.sql.exec(
          "INSERT INTO messages (content) VALUES (?)",
          content,
        );
      });
      // If this takes ~5ms, you're limited to ~200 requests/second
    }


    // ✅ Good: Let output gates handle consistency
    async sendMessageFast(content) {
      this.ctx.storage.sql.exec(
        "INSERT INTO messages (content) VALUES (?)",
        content,
      );
      // Output gate ensures write completes before response is sent
      // Other requests can be processed concurrently
    }
  }
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    CHAT_ROOM: DurableObjectNamespace<ChatRoom>;
  }


  export class ChatRoom extends DurableObject<Env> {
    constructor(ctx: DurableObjectState, env: Env) {
      super(ctx, env);


      // ✅ Good: Use blockConcurrencyWhile for one-time initialization
      ctx.blockConcurrencyWhile(async () => {
        this.ctx.storage.sql.exec(`
          CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY,
            content TEXT
          )
        `);
      });
    }


    // 🔴 Bad: Don't use blockConcurrencyWhile on every request
    async sendMessageSlow(content: string) {
      await this.ctx.blockConcurrencyWhile(async () => {
        this.ctx.storage.sql.exec(
          "INSERT INTO messages (content) VALUES (?)",
          content
        );
      });
      // If this takes ~5ms, you're limited to ~200 requests/second
    }


    // ✅ Good: Let output gates handle consistency
    async sendMessageFast(content: string) {
      this.ctx.storage.sql.exec(
        "INSERT INTO messages (content) VALUES (?)",
        content
      );
      // Output gate ensures write completes before response is sent
      // Other requests can be processed concurrently
    }
  }
  ```

Because `blockConcurrencyWhile()` blocks *all* concurrency unconditionally, it significantly reduces throughput. If each call takes \~5ms, that individual Durable Object is limited to approximately 200 requests/second. Reserve it for initialization and migrations, not regular request handling. For normal operations, rely on input/output gates and write coalescing instead.

For atomic read-modify-write operations during request handling, prefer [`transaction()`](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/#transaction) over `blockConcurrencyWhile()`. Transactions provide atomicity for storage operations without blocking unrelated concurrent requests.

Warning

Using `blockConcurrencyWhile()` across I/O operations (such as `fetch()`, KV, R2, or other external API calls) is an anti-pattern. This is equivalent to holding a lock across I/O in other languages or concurrency frameworks — it blocks all other requests while waiting for slow external operations, severely degrading throughput. Keep `blockConcurrencyWhile()` callbacks fast and limited to local storage operations.

## Communication and API design

### Use RPC methods instead of the `fetch()` handler

Projects with a [compatibility date](https://developers.cloudflare.com/workers/configuration/compatibility-flags/) of `2024-04-03` or later should use RPC methods. RPC is more ergonomic, provides better type safety, and eliminates manual request/response parsing.

Define public methods on your Durable Object class, and call them directly from stubs with full TypeScript support:

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  export class ChatRoom extends DurableObject {
    // Public methods are automatically exposed as RPC endpoints
    async sendMessage(userId, content) {
      const createdAt = Date.now();
      const result = this.ctx.storage.sql.exec(
        "INSERT INTO messages (user_id, content, created_at) VALUES (?, ?, ?) RETURNING id",
        userId,
        content,
        createdAt,
      );
      const { id } = result.one();
      return { id, userId, content, createdAt };
    }


    async getMessages(limit = 50) {
      const cursor = this.ctx.storage.sql.exec(
        "SELECT * FROM messages ORDER BY created_at DESC LIMIT ?",
        limit,
      );


      return cursor.toArray().map((row) => ({
        id: row.id,
        userId: row.user_id,
        content: row.content,
        createdAt: row.created_at,
      }));
    }
  }


  export default {
    async fetch(request, env) {
      const url = new URL(request.url);
      const roomId = url.searchParams.get("room") ?? "lobby";


      const id = env.CHAT_ROOM.idFromName(roomId);
      // stub is typed as DurableObjectStub<ChatRoom>
      const stub = env.CHAT_ROOM.get(id);


      if (request.method === "POST") {
        const { userId, content } = await request.json();
        // Direct method call with full type checking
        const message = await stub.sendMessage(userId, content);
        return Response.json(message);
      }


      // TypeScript knows getMessages() returns Promise<Message[]>
      const messages = await stub.getMessages(100);
      return Response.json(messages);
    },
  };
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    // Type parameter provides typed method calls on the stub
    CHAT_ROOM: DurableObjectNamespace<ChatRoom>;
  }


  type Message = {
    id: number;
    userId: string;
    content: string;
    createdAt: number;
  };


  export class ChatRoom extends DurableObject<Env> {
    // Public methods are automatically exposed as RPC endpoints
    async sendMessage(userId: string, content: string): Promise<Message> {
      const createdAt = Date.now();
      const result = this.ctx.storage.sql.exec<{ id: number }>(
        "INSERT INTO messages (user_id, content, created_at) VALUES (?, ?, ?) RETURNING id",
        userId,
        content,
        createdAt
      );
      const { id } = result.one();
      return { id, userId, content, createdAt };
    }


    async getMessages(limit: number = 50): Promise<Message[]> {
      const cursor = this.ctx.storage.sql.exec<{
        id: number;
        user_id: string;
        content: string;
        created_at: number;
      }>("SELECT * FROM messages ORDER BY created_at DESC LIMIT ?", limit);


      return cursor.toArray().map((row) => ({
        id: row.id,
        userId: row.user_id,
        content: row.content,
        createdAt: row.created_at,
      }));
    }
  }


  export default {
    async fetch(request: Request, env: Env): Promise<Response> {
      const url = new URL(request.url);
      const roomId = url.searchParams.get("room") ?? "lobby";


      const id = env.CHAT_ROOM.idFromName(roomId);
      // stub is typed as DurableObjectStub<ChatRoom>
      const stub = env.CHAT_ROOM.get(id);


      if (request.method === "POST") {
        const { userId, content } = await request.json<{
          userId: string;
          content: string;
        }>();
        // Direct method call with full type checking
        const message = await stub.sendMessage(userId, content);
        return Response.json(message);
      }


      // TypeScript knows getMessages() returns Promise<Message[]>
      const messages = await stub.getMessages(100);
      return Response.json(messages);
    },
  };
  ```

Refer to [Invoke methods](https://developers.cloudflare.com/durable-objects/best-practices/create-durable-object-stubs-and-send-requests/) for more details on RPC and the legacy `fetch()` handler.

### Initialize Durable Objects explicitly with an `init()` method

Durable Objects do not know their own name or ID from within. If your Durable Object needs to know its identity (for example, to store a reference to itself or to communicate with related objects), you must explicitly initialize it.

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  export class ChatRoom extends DurableObject {
    roomId = null;


    // Call this after creating the Durable Object for the first time
    async init(roomId, createdBy) {
      // Check if already initialized
      const existing = await this.ctx.storage.get("roomId");
      if (existing) {
        return; // Already initialized
      }


      // Store the identity
      await this.ctx.storage.put("roomId", roomId);
      await this.ctx.storage.put("createdBy", createdBy);
      await this.ctx.storage.put("createdAt", Date.now());


      // Cache in memory for this session
      this.roomId = roomId;
    }


    async getRoomId() {
      if (this.roomId) {
        return this.roomId;
      }


      const stored = await this.ctx.storage.get("roomId");
      if (!stored) {
        throw new Error("ChatRoom not initialized. Call init() first.");
      }


      this.roomId = stored;
      return stored;
    }
  }


  export default {
    async fetch(request, env) {
      const url = new URL(request.url);
      const roomId = url.searchParams.get("room") ?? "lobby";


      const id = env.CHAT_ROOM.idFromName(roomId);
      const stub = env.CHAT_ROOM.get(id);


      // Initialize on first access
      await stub.init(roomId, "system");


      return new Response(`Room ${await stub.getRoomId()} ready`);
    },
  };
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    CHAT_ROOM: DurableObjectNamespace<ChatRoom>;
  }


  export class ChatRoom extends DurableObject<Env> {
    private roomId: string | null = null;


    // Call this after creating the Durable Object for the first time
    async init(roomId: string, createdBy: string) {
      // Check if already initialized
      const existing = await this.ctx.storage.get("roomId");
      if (existing) {
        return; // Already initialized
      }


      // Store the identity
      await this.ctx.storage.put("roomId", roomId);
      await this.ctx.storage.put("createdBy", createdBy);
      await this.ctx.storage.put("createdAt", Date.now());


      // Cache in memory for this session
      this.roomId = roomId;
    }


    async getRoomId(): Promise<string> {
      if (this.roomId) {
        return this.roomId;
      }


      const stored = await this.ctx.storage.get<string>("roomId");
      if (!stored) {
        throw new Error("ChatRoom not initialized. Call init() first.");
      }


      this.roomId = stored;
      return stored;
    }
  }


  export default {
    async fetch(request: Request, env: Env): Promise<Response> {
      const url = new URL(request.url);
      const roomId = url.searchParams.get("room") ?? "lobby";


      const id = env.CHAT_ROOM.idFromName(roomId);
      const stub = env.CHAT_ROOM.get(id);


      // Initialize on first access
      await stub.init(roomId, "system");


      return new Response(`Room ${await stub.getRoomId()} ready`);
    },
  };
  ```

### Always `await` RPC calls

When calling methods on a Durable Object stub, always use `await`. Unawaited calls create dangling promises, causing errors to be swallowed and return values to be lost.

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  export class ChatRoom extends DurableObject {
    async sendMessage(userId, content) {
      const result = this.ctx.storage.sql.exec(
        "INSERT INTO messages (user_id, content, created_at) VALUES (?, ?, ?) RETURNING id",
        userId,
        content,
        Date.now(),
      );
      return result.one().id;
    }
  }


  export default {
    async fetch(request, env) {
      const id = env.CHAT_ROOM.idFromName("lobby");
      const stub = env.CHAT_ROOM.get(id);


      // 🔴 Bad: Not awaiting the call
      // The message ID is lost, and any errors are swallowed
      stub.sendMessage("user-123", "Hello");


      // ✅ Good: Properly awaited
      const messageId = await stub.sendMessage("user-123", "Hello");


      return Response.json({ messageId });
    },
  };
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    CHAT_ROOM: DurableObjectNamespace<ChatRoom>;
  }


  export class ChatRoom extends DurableObject<Env> {
    async sendMessage(userId: string, content: string): Promise<number> {
      const result = this.ctx.storage.sql.exec<{ id: number }>(
        "INSERT INTO messages (user_id, content, created_at) VALUES (?, ?, ?) RETURNING id",
        userId,
        content,
        Date.now()
      );
      return result.one().id;
    }
  }


  export default {
    async fetch(request: Request, env: Env): Promise<Response> {
      const id = env.CHAT_ROOM.idFromName("lobby");
      const stub = env.CHAT_ROOM.get(id);


      // 🔴 Bad: Not awaiting the call
      // The message ID is lost, and any errors are swallowed
      stub.sendMessage("user-123", "Hello");


      // ✅ Good: Properly awaited
      const messageId = await stub.sendMessage("user-123", "Hello");


      return Response.json({ messageId });
    },
  };
  ```

## Error handling

### Handle errors and use exception boundaries

Uncaught exceptions in a Durable Object can leave it in an unknown state and may cause the runtime to terminate the instance. Wrap risky operations in try/catch blocks, and handle errors appropriately.

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  export class ChatRoom extends DurableObject {
    async processMessage(userId, content) {
      // ✅ Good: Wrap risky operations in try/catch
      try {
        // Validate input before processing
        if (!content || content.length > 10000) {
          throw new Error("Invalid message content");
        }


        this.ctx.storage.sql.exec(
          "INSERT INTO messages (user_id, content, created_at) VALUES (?, ?, ?)",
          userId,
          content,
          Date.now(),
        );


        // External call that might fail
        await this.notifySubscribers(content);
      } catch (error) {
        // Log the error for debugging
        console.error("Failed to process message:", error);


        // Re-throw if it's a validation error (don't retry)
        if (error instanceof Error && error.message.includes("Invalid")) {
          throw error;
        }


        // For transient errors, you might want to handle differently
        throw error;
      }
    }


    async notifySubscribers(content) {
      // External notification logic
    }
  }
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    CHAT_ROOM: DurableObjectNamespace<ChatRoom>;
  }


  export class ChatRoom extends DurableObject<Env> {
    async processMessage(userId: string, content: string) {
      // ✅ Good: Wrap risky operations in try/catch
      try {
        // Validate input before processing
        if (!content || content.length > 10000) {
          throw new Error("Invalid message content");
        }


        this.ctx.storage.sql.exec(
          "INSERT INTO messages (user_id, content, created_at) VALUES (?, ?, ?)",
          userId,
          content,
          Date.now()
        );


        // External call that might fail
        await this.notifySubscribers(content);
      } catch (error) {
        // Log the error for debugging
        console.error("Failed to process message:", error);


        // Re-throw if it's a validation error (don't retry)
        if (error instanceof Error && error.message.includes("Invalid")) {
          throw error;
        }


        // For transient errors, you might want to handle differently
        throw error;
      }
    }


    private async notifySubscribers(content: string) {
      // External notification logic
    }
  }
  ```

When calling Durable Objects from a Worker, errors may include `.retryable` and `.overloaded` properties indicating whether the operation can be retried. For transient failures, implement exponential backoff to avoid overwhelming the system.

Refer to [Error handling](https://developers.cloudflare.com/durable-objects/best-practices/error-handling/) for details on error properties, retry strategies, and exponential backoff patterns.

## WebSockets and real-time

### Use the Hibernatable WebSockets API for cost efficiency

The Hibernatable WebSockets API allows Durable Objects to sleep while maintaining WebSocket connections. This significantly reduces costs for applications with many idle connections.

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  export class ChatRoom extends DurableObject {
    async fetch(request) {
      const url = new URL(request.url);


      if (url.pathname === "/websocket") {
        // Check for WebSocket upgrade
        if (request.headers.get("Upgrade") !== "websocket") {
          return new Response("Expected WebSocket", { status: 400 });
        }


        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);


        // Accept the WebSocket with Hibernation API
        this.ctx.acceptWebSocket(server);


        return new Response(null, { status: 101, webSocket: client });
      }


      return new Response("Not found", { status: 404 });
    }


    // Called when a message is received (even after hibernation)
    async webSocketMessage(ws, message) {
      const data = typeof message === "string" ? message : "binary data";


      // Broadcast to all connected clients
      for (const client of this.ctx.getWebSockets()) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      }
    }


    // Called when a WebSocket is closed
    async webSocketClose(ws, code, reason, wasClean) {
      // Calling close() completes the WebSocket handshake
      ws.close(code, reason);
      console.log(`WebSocket closed: ${code} ${reason}`);
    }


    // Called when a WebSocket error occurs
    async webSocketError(ws, error) {
      console.error("WebSocket error:", error);
    }
  }
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    CHAT_ROOM: DurableObjectNamespace<ChatRoom>;
  }


  export class ChatRoom extends DurableObject<Env> {
    async fetch(request: Request): Promise<Response> {
      const url = new URL(request.url);


      if (url.pathname === "/websocket") {
        // Check for WebSocket upgrade
        if (request.headers.get("Upgrade") !== "websocket") {
          return new Response("Expected WebSocket", { status: 400 });
        }


        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);


        // Accept the WebSocket with Hibernation API
        this.ctx.acceptWebSocket(server);


        return new Response(null, { status: 101, webSocket: client });
      }


      return new Response("Not found", { status: 404 });
    }


    // Called when a message is received (even after hibernation)
    async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
      const data = typeof message === "string" ? message : "binary data";


      // Broadcast to all connected clients
      for (const client of this.ctx.getWebSockets()) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      }
    }


    // Called when a WebSocket is closed
    async webSocketClose(
      ws: WebSocket,
      code: number,
      reason: string,
      wasClean: boolean
    ) {
      // Calling close() completes the WebSocket handshake
      ws.close(code, reason);
      console.log(`WebSocket closed: ${code} ${reason}`);
    }


    // Called when a WebSocket error occurs
    async webSocketError(ws: WebSocket, error: unknown) {
      console.error("WebSocket error:", error);
    }
  }
  ```

With the Hibernation API, your Durable Object can go to sleep when there is no active JavaScript execution, but WebSocket connections remain open. When a message arrives, the Durable Object wakes up automatically.

Best practices:

* The [WebSocket Hibernation API](https://developers.cloudflare.com/durable-objects/best-practices/websockets/#durable-objects-hibernation-websocket-api) exposes `webSocketError`, `webSocketMessage`, and `webSocketClose` handlers for their respective WebSocket events.
* When implementing `webSocketClose`, you **must** reciprocate the close by calling `ws.close()` to avoid swallowing the WebSocket close frame. Failing to do so results in `1006` errors, representing an abnormal close per the WebSocket specification.

Refer to [WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/) for more details.

### Use `serializeAttachment()` to persist per-connection state

WebSocket attachments let you store metadata for each connection that survives hibernation. Use this for user IDs, session tokens, or other per-connection data.

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  export class ChatRoom extends DurableObject {
    async fetch(request) {
      const url = new URL(request.url);


      if (url.pathname === "/websocket") {
        if (request.headers.get("Upgrade") !== "websocket") {
          return new Response("Expected WebSocket", { status: 400 });
        }


        const userId = url.searchParams.get("userId") ?? "anonymous";
        const username = url.searchParams.get("username") ?? "Anonymous";


        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);


        this.ctx.acceptWebSocket(server);


        // Store per-connection state that survives hibernation
        const state = {
          userId,
          username,
          joinedAt: Date.now(),
        };
        server.serializeAttachment(state);


        // Broadcast join message
        this.broadcast(`${username} joined the chat`);


        return new Response(null, { status: 101, webSocket: client });
      }


      return new Response("Not found", { status: 404 });
    }


    async webSocketMessage(ws, message) {
      // Retrieve the connection state (works even after hibernation)
      const state = ws.deserializeAttachment();


      const chatMessage = JSON.stringify({
        userId: state.userId,
        username: state.username,
        content: message,
        timestamp: Date.now(),
      });


      this.broadcast(chatMessage);
    }


    async webSocketClose(ws, code, reason) {
      // Calling close() completes the WebSocket handshake
      ws.close(code, reason);
      const state = ws.deserializeAttachment();
      this.broadcast(`${state.username} left the chat`);
    }


    broadcast(message) {
      for (const client of this.ctx.getWebSockets()) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      }
    }
  }
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    CHAT_ROOM: DurableObjectNamespace<ChatRoom>;
  }


  type ConnectionState = {
    userId: string;
    username: string;
    joinedAt: number;
  };


  export class ChatRoom extends DurableObject<Env> {
    async fetch(request: Request): Promise<Response> {
      const url = new URL(request.url);


      if (url.pathname === "/websocket") {
        if (request.headers.get("Upgrade") !== "websocket") {
          return new Response("Expected WebSocket", { status: 400 });
        }


        const userId = url.searchParams.get("userId") ?? "anonymous";
        const username = url.searchParams.get("username") ?? "Anonymous";


        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);


        this.ctx.acceptWebSocket(server);


        // Store per-connection state that survives hibernation
        const state: ConnectionState = {
          userId,
          username,
          joinedAt: Date.now(),
        };
        server.serializeAttachment(state);


        // Broadcast join message
        this.broadcast(`${username} joined the chat`);


        return new Response(null, { status: 101, webSocket: client });
      }


      return new Response("Not found", { status: 404 });
    }


    async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
      // Retrieve the connection state (works even after hibernation)
      const state = ws.deserializeAttachment() as ConnectionState;


      const chatMessage = JSON.stringify({
        userId: state.userId,
        username: state.username,
        content: message,
        timestamp: Date.now(),
      });


      this.broadcast(chatMessage);
    }


    async webSocketClose(ws: WebSocket, code: number, reason: string) {
      // Calling close() completes the WebSocket handshake
      ws.close(code, reason);
      const state = ws.deserializeAttachment() as ConnectionState;
      this.broadcast(`${state.username} left the chat`);
    }


    private broadcast(message: string) {
      for (const client of this.ctx.getWebSockets()) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      }
    }
  }
  ```

## Scheduling and lifecycle

### Use alarms for per-entity scheduled tasks

Each Durable Object can schedule its own future work using the [Alarms API](https://developers.cloudflare.com/durable-objects/api/alarms/), allowing a Durable Object to execute background tasks on any interval without an incoming request, RPC call, or WebSocket message.

Key points about alarms:

* **`setAlarm(timestamp)`** schedules the `alarm()` handler to run at any time in the future (millisecond precision)
* **Alarms do not repeat automatically** — you must call `setAlarm()` again to schedule the next execution
* **Only schedule alarms when there is work to do** — avoid waking up every Durable Object on short intervals (seconds), as each alarm invocation incurs costs

- JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  export class GameMatch extends DurableObject {
    async startGame(durationMs = 60000) {
      await this.ctx.storage.put("gameStarted", Date.now());
      await this.ctx.storage.put("gameActive", true);


      // Schedule the game to end after the duration
      await this.ctx.storage.setAlarm(Date.now() + durationMs);
    }


    // Called when the alarm fires
    async alarm(alarmInfo) {
      const isActive = await this.ctx.storage.get("gameActive");


      if (!isActive) {
        return; // Game was already ended
      }


      // End the game
      await this.ctx.storage.put("gameActive", false);
      await this.ctx.storage.put("gameEnded", Date.now());


      // Calculate final scores, notify players, etc.
      try {
        await this.calculateFinalScores();
      } catch (err) {
        // If we're almost out of retries but still have work to do, schedule a new alarm
        // rather than letting our retries run out to ensure we keep getting invoked.
        if (alarmInfo && alarmInfo.retryCount >= 5) {
          await this.ctx.storage.setAlarm(Date.now() + 30 * 1000);
          return;
        }
        throw err;
      }


      // Schedule the next alarm only if there's more work to do
      // In this case, schedule cleanup in 24 hours
      await this.ctx.storage.setAlarm(Date.now() + 24 * 60 * 60 * 1000);
    }


    async calculateFinalScores() {
      // Game ending logic
    }
  }
  ```

- TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    GAME_MATCH: DurableObjectNamespace<GameMatch>;
  }


  export class GameMatch extends DurableObject<Env> {
    async startGame(durationMs: number = 60000) {
      await this.ctx.storage.put("gameStarted", Date.now());
      await this.ctx.storage.put("gameActive", true);


      // Schedule the game to end after the duration
      await this.ctx.storage.setAlarm(Date.now() + durationMs);
    }


    // Called when the alarm fires
    async alarm(alarmInfo?: AlarmInvocationInfo) {
      const isActive = await this.ctx.storage.get<boolean>("gameActive");


      if (!isActive) {
        return; // Game was already ended
      }


      // End the game
      await this.ctx.storage.put("gameActive", false);
      await this.ctx.storage.put("gameEnded", Date.now());


      // Calculate final scores, notify players, etc.
      try {
        await this.calculateFinalScores();
      } catch (err) {
        // If we're almost out of retries but still have work to do, schedule a new alarm
        // rather than letting our retries run out to ensure we keep getting invoked.
        if (alarmInfo && alarmInfo.retryCount >= 5) {
          await this.ctx.storage.setAlarm(Date.now() + 30 * 1000);
          return;
        }
        throw err;
      }


      // Schedule the next alarm only if there's more work to do
      // In this case, schedule cleanup in 24 hours
      await this.ctx.storage.setAlarm(Date.now() + 24 * 60 * 60 * 1000);
    }


    private async calculateFinalScores() {
      // Game ending logic
    }
  }
  ```

### Make alarm handlers idempotent

In rare cases, alarms may fire more than once. Your `alarm()` handler should be safe to run multiple times without causing issues.

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  export class Subscription extends DurableObject {
    async alarm() {
      // ✅ Good: Check state before performing the action
      const lastRenewal = await this.ctx.storage.get("lastRenewal");
      const renewalPeriod = 30 * 24 * 60 * 60 * 1000; // 30 days


      // If we already renewed recently, don't do it again
      if (lastRenewal && Date.now() - lastRenewal < renewalPeriod - 60000) {
        console.log("Already renewed recently, skipping");
        return;
      }


      // Perform the renewal
      const success = await this.processRenewal();


      if (success) {
        // Record the renewal time
        await this.ctx.storage.put("lastRenewal", Date.now());


        // Schedule the next renewal
        await this.ctx.storage.setAlarm(Date.now() + renewalPeriod);
      } else {
        // Retry in 1 hour
        await this.ctx.storage.setAlarm(Date.now() + 60 * 60 * 1000);
      }
    }


    async processRenewal() {
      // Payment processing logic
      return true;
    }
  }
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    SUBSCRIPTION: DurableObjectNamespace<Subscription>;
  }


  export class Subscription extends DurableObject<Env> {
    async alarm() {
      // ✅ Good: Check state before performing the action
      const lastRenewal = await this.ctx.storage.get<number>("lastRenewal");
      const renewalPeriod = 30 * 24 * 60 * 60 * 1000; // 30 days


      // If we already renewed recently, don't do it again
      if (lastRenewal && Date.now() - lastRenewal < renewalPeriod - 60000) {
        console.log("Already renewed recently, skipping");
        return;
      }


      // Perform the renewal
      const success = await this.processRenewal();


      if (success) {
        // Record the renewal time
        await this.ctx.storage.put("lastRenewal", Date.now());


        // Schedule the next renewal
        await this.ctx.storage.setAlarm(Date.now() + renewalPeriod);
      } else {
        // Retry in 1 hour
        await this.ctx.storage.setAlarm(Date.now() + 60 * 60 * 1000);
      }
    }


    private async processRenewal(): Promise<boolean> {
      // Payment processing logic
      return true;
    }
  }
  ```

### Clean up storage with `deleteAll()`

To fully clear a Durable Object's storage, call `deleteAll()`. Simply deleting individual keys or dropping tables is not sufficient, as some internal metadata may remain. If you have alarms set, delete those first.

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  export class ChatRoom extends DurableObject {
    async clearStorage() {
      // If you have an alarm set, delete it first
      await this.ctx.storage.deleteAlarm();


      // Delete all storage
      await this.ctx.storage.deleteAll();


      // The Durable Object instance still exists, but with empty storage
      // A subsequent request will find no data
    }
  }
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    CHAT_ROOM: DurableObjectNamespace<ChatRoom>;
  }


  export class ChatRoom extends DurableObject<Env> {
    async clearStorage() {
      // If you have an alarm set, delete it first
      await this.ctx.storage.deleteAlarm();


      // Delete all storage
      await this.ctx.storage.deleteAll();


      // The Durable Object instance still exists, but with empty storage
      // A subsequent request will find no data
    }
  }
  ```

### Design for unexpected shutdowns

Durable Objects may shut down at any time due to deployments, inactivity, or runtime decisions. Rather than relying on shutdown hooks (which are not provided), design your application to write state incrementally.

Durable Objects may shut down due to deployments, inactivity, or runtime decisions. Rather than relying on shutdown hooks (which are not provided), design your application to write state incrementally.

Shutdown hooks or lifecycle callbacks that run before shutdown are not provided because Cloudflare cannot guarantee these hooks would execute in all cases, and external software may rely too heavily on these (unreliable) hooks.

Instead of relying on shutdown hooks, you can regularly write to storage to recover gracefully from shutdowns.

For example, if you are processing a stream of data and need to save your progress, write your position to storage as you go rather than waiting to persist it at the end:

```js
// Good: Write progress as you go
async processData(data) {
  data.forEach(async (item, index) => {
    await this.processItem(item);
    // Save progress frequently
    await this.ctx.storage.put("lastProcessedIndex", index);
  });
}
```

While this may feel unintuitive, Durable Object storage writes are fast and synchronous, so you can persist state with minimal performance concerns.

This approach ensures your Durable Object can safely resume from any point, even if it shuts down unexpectedly.

## Anti-patterns to avoid

### Do not use a single Durable Object as a global singleton

A single Durable Object handling all traffic becomes a bottleneck. While async operations allow request interleaving, all synchronous JavaScript execution is single-threaded, and storage operations provide serialization guarantees that limit throughput.

A common mistake is using a Durable Object for global rate limiting or global counters. This funnels all traffic through a single instance:

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  // 🔴 Bad: Global rate limiter - ALL requests go through one instance
  export class RateLimiter extends DurableObject {
    async checkLimit(ip) {
      const key = `rate:${ip}`;
      const count = (await this.ctx.storage.get(key)) ?? 0;
      await this.ctx.storage.put(key, count + 1);
      return count < 100;
    }
  }


  // 🔴 Bad: Always using the same ID creates a global bottleneck
  export default {
    async fetch(request, env) {
      // Every single request to your application goes through this one DO
      const limiter = env.RATE_LIMITER.get(env.RATE_LIMITER.idFromName("global"));


      const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
      const allowed = await limiter.checkLimit(ip);


      if (!allowed) {
        return new Response("Rate limited", { status: 429 });
      }


      return new Response("OK");
    },
  };
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    RATE_LIMITER: DurableObjectNamespace<RateLimiter>;
  }


  // 🔴 Bad: Global rate limiter - ALL requests go through one instance
  export class RateLimiter extends DurableObject<Env> {
    async checkLimit(ip: string): Promise<boolean> {
      const key = `rate:${ip}`;
      const count = (await this.ctx.storage.get<number>(key)) ?? 0;
      await this.ctx.storage.put(key, count + 1);
      return count < 100;
    }
  }


  // 🔴 Bad: Always using the same ID creates a global bottleneck
  export default {
    async fetch(request: Request, env: Env): Promise<Response> {
      // Every single request to your application goes through this one DO
      const limiter = env.RATE_LIMITER.get(
        env.RATE_LIMITER.idFromName("global")
      );


      const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
      const allowed = await limiter.checkLimit(ip);


      if (!allowed) {
        return new Response("Rate limited", { status: 429 });
      }


      return new Response("OK");
    },
  };
  ```

This pattern does not scale. As traffic increases, the single Durable Object becomes a chokepoint. Instead, identify natural coordination boundaries in your application (per user, per room, per document) and create separate Durable Objects for each.

## Testing and migrations

### Test with Vitest and plan for class migrations

Use `@cloudflare/vitest-pool-workers` for testing Durable Objects. The integration provides isolated storage per test and utilities for direct instance access.

* JavaScript

  ```js
  import {
    env,
    runInDurableObject,
    runDurableObjectAlarm,
  } from "cloudflare:test";
  import { describe, it, expect } from "vitest";


  describe("ChatRoom", () => {
    // Each test gets isolated storage automatically
    it("should send and retrieve messages", async () => {
      const id = env.CHAT_ROOM.idFromName("test-room");
      const stub = env.CHAT_ROOM.get(id);


      // Call RPC methods directly on the stub
      await stub.sendMessage("user-1", "Hello!");
      await stub.sendMessage("user-2", "Hi there!");


      const messages = await stub.getMessages(10);
      expect(messages).toHaveLength(2);
    });


    it("can access instance internals and trigger alarms", async () => {
      const id = env.CHAT_ROOM.idFromName("test-room");
      const stub = env.CHAT_ROOM.get(id);


      // Access storage directly for verification
      await runInDurableObject(stub, async (instance, state) => {
        const count = state.storage.sql
          .exec("SELECT COUNT(*) as count FROM messages")
          .one();
        expect(count.count).toBe(0); // Fresh instance due to test isolation
      });


      // Trigger alarms immediately without waiting
      const alarmRan = await runDurableObjectAlarm(stub);
      expect(alarmRan).toBe(false); // No alarm was scheduled
    });
  });
  ```

* TypeScript

  ```ts
  import {
    env,
    runInDurableObject,
    runDurableObjectAlarm,
  } from "cloudflare:test";
  import { describe, it, expect } from "vitest";


  describe("ChatRoom", () => {
    // Each test gets isolated storage automatically
    it("should send and retrieve messages", async () => {
      const id = env.CHAT_ROOM.idFromName("test-room");
      const stub = env.CHAT_ROOM.get(id);


      // Call RPC methods directly on the stub
      await stub.sendMessage("user-1", "Hello!");
      await stub.sendMessage("user-2", "Hi there!");


      const messages = await stub.getMessages(10);
      expect(messages).toHaveLength(2);
    });


    it("can access instance internals and trigger alarms", async () => {
      const id = env.CHAT_ROOM.idFromName("test-room");
      const stub = env.CHAT_ROOM.get(id);


      // Access storage directly for verification
      await runInDurableObject(stub, async (instance, state) => {
        const count = state.storage.sql
          .exec<{ count: number }>("SELECT COUNT(*) as count FROM messages")
          .one();
        expect(count.count).toBe(0); // Fresh instance due to test isolation
      });


      // Trigger alarms immediately without waiting
      const alarmRan = await runDurableObjectAlarm(stub);
      expect(alarmRan).toBe(false); // No alarm was scheduled
    });
  });
  ```

Configure Vitest in your `vitest.config.ts`:

```ts
import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";


export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.jsonc" },
      },
    },
  },
});
```

For schema changes, run migrations in the constructor using `blockConcurrencyWhile()`. For class renames or deletions, use Wrangler migrations:

* wrangler.jsonc

  ```jsonc
  {
    "migrations": [
      // Rename a class
      { "tag": "v2", "renamed_classes": [{ "from": "OldChatRoom", "to": "ChatRoom" }] },
      // Delete a class (removes all data!)
      { "tag": "v3", "deleted_classes": ["DeprecatedRoom"] }
    ]
  }
  ```

* wrangler.toml

  ```toml
  [[migrations]]
  tag = "v2"


    [[migrations.renamed_classes]]
    from = "OldChatRoom"
    to = "ChatRoom"


  [[migrations]]
  tag = "v3"
  deleted_classes = [ "DeprecatedRoom" ]
  ```

Refer to [Durable Objects migrations](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/) for more details on class migrations, and [Testing with Durable Objects](https://developers.cloudflare.com/durable-objects/examples/testing-with-durable-objects/) for comprehensive testing patterns including SQLite queries and alarm testing.

</page>

<page>
---
title: Use WebSockets · Cloudflare Durable Objects docs
description: Durable Objects can act as WebSocket servers that connect thousands
  of clients per instance. You can also use WebSockets as a client to connect to
  other servers or Durable Objects.
lastUpdated: 2026-02-03T14:07:02.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/best-practices/websockets/
  md: https://developers.cloudflare.com/durable-objects/best-practices/websockets/index.md
---

Durable Objects can act as WebSocket servers that connect thousands of clients per instance. You can also use WebSockets as a client to connect to other servers or Durable Objects.

Two WebSocket APIs are available:

1. **Hibernation WebSocket API** - Allows the Durable Object to hibernate without disconnecting clients when idle. **(recommended)**
2. **Web Standard WebSocket API** - Uses the familiar `addEventListener` event pattern.

## What are WebSockets?

WebSockets are long-lived TCP connections that enable bi-directional, real-time communication between client and server.

Key characteristics:

* Both Workers and Durable Objects can act as WebSocket endpoints (client or server)
* WebSocket sessions are long-lived, making Durable Objects ideal for accepting connections
* A single Durable Object instance can coordinate between multiple clients (for example, chat rooms or multiplayer games)

Refer to [Cloudflare Edge Chat Demo](https://github.com/cloudflare/workers-chat-demo) for an example of using Durable Objects with WebSockets.

### Why use Hibernation?

The Hibernation WebSocket API reduces costs by allowing Durable Objects to sleep when idle:

* Clients remain connected while the Durable Object is not in memory
* [Billable Duration (GB-s) charges](https://developers.cloudflare.com/durable-objects/platform/pricing/) do not accrue during hibernation
* When a message arrives, the Durable Object wakes up automatically

## Durable Objects Hibernation WebSocket API

The Hibernation WebSocket API extends the [Web Standard WebSocket API](https://developers.cloudflare.com/workers/runtime-apis/websockets/) to reduce costs during periods of inactivity.

### How hibernation works

When a Durable Object receives no events (such as alarms or messages) for a short period, it is evicted from memory. During hibernation:

* WebSocket clients remain connected to the Cloudflare network
* In-memory state is reset
* When an event arrives, the Durable Object is re-initialized and its `constructor` runs

To restore state after hibernation, use [`serializeAttachment`](#websocketserializeattachment) and [`deserializeAttachment`](#websocketdeserializeattachment) to persist data with each WebSocket connection.

Refer to [Lifecycle of a Durable Object](https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/) for more information.

### Hibernation example

To use WebSockets with Durable Objects:

1. Proxy the request from the Worker to the Durable Object
2. Call [`DurableObjectState::acceptWebSocket`](https://developers.cloudflare.com/durable-objects/api/state/#acceptwebsocket) to accept the server side connection
3. Define handler methods on the Durable Object class for relevant events

If an event occurs for a hibernated Durable Object, the runtime re-initializes it by calling the constructor. Minimize work in the constructor when using hibernation.

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  // Durable Object
  export class WebSocketHibernationServer extends DurableObject {
    async fetch(request) {
      // Creates two ends of a WebSocket connection.
      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);


      // Calling `acceptWebSocket()` connects the WebSocket to the Durable Object, allowing the WebSocket to send and receive messages.
      // Unlike `ws.accept()`, `state.acceptWebSocket(ws)` allows the Durable Object to be hibernated
      // When the Durable Object receives a message during Hibernation, it will run the `constructor` to be re-initialized
      this.ctx.acceptWebSocket(server);


      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }


    async webSocketMessage(ws, message) {
      // Upon receiving a message from the client, reply with the same message,
      // but will prefix the message with "[Durable Object]: " and return the number of connections.
      ws.send(
        `[Durable Object] message: ${message}, connections: ${this.ctx.getWebSockets().length}`,
      );
    }


    async webSocketClose(ws, code, reason, wasClean) {
      // Calling close() on the server completes the WebSocket close handshake
      ws.close(code, reason);
    }
  }
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    WEBSOCKET_HIBERNATION_SERVER: DurableObjectNamespace<WebSocketHibernationServer>;
  }


  // Durable Object
  export class WebSocketHibernationServer extends DurableObject {
    async fetch(request: Request): Promise<Response> {
      // Creates two ends of a WebSocket connection.
      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);


      // Calling `acceptWebSocket()` connects the WebSocket to the Durable Object, allowing the WebSocket to send and receive messages.
      // Unlike `ws.accept()`, `state.acceptWebSocket(ws)` allows the Durable Object to be hibernated
      // When the Durable Object receives a message during Hibernation, it will run the `constructor` to be re-initialized
      this.ctx.acceptWebSocket(server);


      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }


    async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
      // Upon receiving a message from the client, reply with the same message,
      // but will prefix the message with "[Durable Object]: " and return the number of connections.
      ws.send(
        `[Durable Object] message: ${message}, connections: ${this.ctx.getWebSockets().length}`,
      );
    }


    async webSocketClose(
      ws: WebSocket,
      code: number,
      reason: string,
      wasClean: boolean,
    ) {
      // Calling close() on the server completes the WebSocket close handshake
      ws.close(code, reason);
    }
  }
  ```

* Python

  ```python
  from workers import Response, DurableObject
  from js import WebSocketPair


  # Durable Object


  class WebSocketHibernationServer(DurableObject):
  def **init**(self, state, env):
  super().**init**(state, env)
  self.ctx = state


      async def fetch(self, request):
          # Creates two ends of a WebSocket connection.
          client, server = WebSocketPair.new().object_values()


          # Calling `acceptWebSocket()` connects the WebSocket to the Durable Object, allowing the WebSocket to send and receive messages.
          # Unlike `ws.accept()`, `state.acceptWebSocket(ws)` allows the Durable Object to be hibernated
          # When the Durable Object receives a message during Hibernation, it will run the `__init__` to be re-initialized
          self.ctx.acceptWebSocket(server)


          return Response(
              None,
              status=101,
              web_socket=client
          )


      async def webSocketMessage(self, ws, message):
          # Upon receiving a message from the client, reply with the same message,
          # but will prefix the message with "[Durable Object]: " and return the number of connections.
          ws.send(
              f"[Durable Object] message: {message}, connections: {len(self.ctx.get_websockets())}"
          )


      async def webSocketClose(self, ws, code, reason, was_clean):
          # Calling close() on the server completes the WebSocket close handshake
          ws.close(code, reason)
  ```

Configure your Wrangler file with a Durable Object [binding](https://developers.cloudflare.com/durable-objects/get-started/#4-configure-durable-object-bindings) and [migration](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/):

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "websocket-hibernation-server",
    "durable_objects": {
      "bindings": [
        {
          "name": "WEBSOCKET_HIBERNATION_SERVER",
          "class_name": "WebSocketHibernationServer"
        }
      ]
    },
    "migrations": [
      {
        "tag": "v1",
        "new_sqlite_classes": ["WebSocketHibernationServer"]
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "websocket-hibernation-server"


  [[durable_objects.bindings]]
  name = "WEBSOCKET_HIBERNATION_SERVER"
  class_name = "WebSocketHibernationServer"


  [[migrations]]
  tag = "v1"
  new_sqlite_classes = [ "WebSocketHibernationServer" ]
  ```

A full example is available in [Build a WebSocket server with WebSocket Hibernation](https://developers.cloudflare.com/durable-objects/examples/websocket-hibernation-server/).

Local development support

Prior to `wrangler@3.13.2` and Miniflare `v3.20231016.0`, WebSockets did not hibernate in local development. Hibernatable WebSocket events like [`webSocketMessage()`](https://developers.cloudflare.com/durable-objects/api/base/#websocketmessage) are still delivered. However, the Durable Object is never evicted from memory.

### Automatic ping/pong handling

The Cloudflare runtime automatically handles WebSocket protocol ping frames:

* Incoming [ping frames](https://www.rfc-editor.org/rfc/rfc6455#section-5.5.2) receive automatic pong responses
* Ping/pong handling does not interrupt hibernation
* The `webSocketMessage` handler is not called for control frames

This behavior keeps connections alive without waking the Durable Object.

### Batch messages to reduce overhead

Each WebSocket message incurs processing overhead from context switches between the JavaScript runtime and the underlying system. Sending many small messages can overwhelm a single Durable Object. This happens even if the total data volume is small.

To maximize throughput:

* **Batch multiple logical messages** into a single WebSocket frame
* **Use a simple envelope format** to pack and unpack batched messages
* **Target fewer, larger messages** rather than many small ones

- JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  // Define a batch envelope format
  // Client-side: batch messages before sending
  function sendBatch(ws, messages) {
    const batch = {
      messages,
      timestamp: Date.now(),
    };
    ws.send(JSON.stringify(batch));
  }


  // Durable Object: process batched messages
  export class GameRoom extends DurableObject {
    async webSocketMessage(ws, message) {
      if (typeof message !== "string") return;


      const batch = JSON.parse(message);


      // Process all messages in the batch in a single handler invocation
      for (const msg of batch.messages) {
        this.handleMessage(ws, msg);
      }
    }


    handleMessage(ws, msg) {
      // Handle individual message logic
    }
  }
  ```

- TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  // Define a batch envelope format
  interface BatchedMessage {
  messages: Array<{ type: string; payload: unknown }>;
  timestamp: number;
  }


  // Client-side: batch messages before sending
  function sendBatch(
  ws: WebSocket,
  messages: Array<{ type: string; payload: unknown }>,
  ) {
  const batch: BatchedMessage = {
  messages,
  timestamp: Date.now(),
  };
  ws.send(JSON.stringify(batch));
  }


  // Durable Object: process batched messages
  export class GameRoom extends DurableObject<Env> {
  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
  if (typeof message !== "string") return;


        const batch = JSON.parse(message) as BatchedMessage;


        // Process all messages in the batch in a single handler invocation
        for (const msg of batch.messages) {
          this.handleMessage(ws, msg);
        }
      }


      private handleMessage(ws: WebSocket, msg: { type: string; payload: unknown }) {
        // Handle individual message logic
      }


  }
  ```

#### Why batching helps

WebSocket reads require context switches between the kernel and JavaScript runtime. Each individual message triggers this overhead. Batching 10-100 logical messages into a single WebSocket frame reduces context switches proportionally.

For high-frequency data like sensor readings or game state updates, use time-based or count-based batching. Batch every 50-100ms or every 50-100 messages, whichever comes first.

Note

Hibernation is only supported when a Durable Object acts as a WebSocket server. Outgoing WebSockets do not hibernate.

Events such as [alarms](https://developers.cloudflare.com/durable-objects/api/alarms/), incoming requests, and scheduled callbacks prevent hibernation. This includes `setTimeout` and `setInterval` usage. Read more about [when a Durable Object incurs duration charges](https://developers.cloudflare.com/durable-objects/platform/pricing/#when-does-a-durable-object-incur-duration-charges).

### Extended methods

The following methods are available on the Hibernation WebSocket API. Use them to persist and restore state before and after hibernation.

#### `WebSocket.serializeAttachment`

* `serializeAttachment(value any)`: void

Keeps a copy of `value` associated with the WebSocket connection.

Key behaviors:

* Serialized attachments persist through hibernation as long as the WebSocket remains healthy
* If either side closes the connection, attachments are lost
* Modifications to `value` after calling this method are not retained unless you call it again
* The `value` can be any type supported by the [structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)
* Maximum serialized size is 2,048 bytes

For larger values or data that must persist beyond WebSocket lifetime, use the [Storage API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/) and store the corresponding key as an attachment.

#### `WebSocket.deserializeAttachment`

* `deserializeAttachment()`: any

Retrieves the most recent value passed to `serializeAttachment()`, or `null` if none exists.

#### Attachment example

Use `serializeAttachment` and `deserializeAttachment` to persist per-connection state across hibernation:

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  export class WebSocketServer extends DurableObject {
    async fetch(request) {
      const url = new URL(request.url);
      const orderId = url.searchParams.get("orderId") ?? "anonymous";


      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);


      this.ctx.acceptWebSocket(server);


      // Persist per-connection state that survives hibernation
      const state = {
        orderId,
        joinedAt: Date.now(),
      };
      server.serializeAttachment(state);


      return new Response(null, { status: 101, webSocket: client });
    }


    async webSocketMessage(ws, message) {
      // Restore state after potential hibernation
      const state = ws.deserializeAttachment();
      ws.send(`Hello ${state.orderId}, you joined at ${state.joinedAt}`);
    }


    async webSocketClose(ws, code, reason, wasClean) {
      const state = ws.deserializeAttachment();
      console.log(`${state.orderId} disconnected`);
      ws.close(code, reason);
    }
  }
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  interface ConnectionState {
    orderId: string;
    joinedAt: number;
  }


  export class WebSocketServer extends DurableObject<Env> {
    async fetch(request: Request): Promise<Response> {
      const url = new URL(request.url);
      const orderId = url.searchParams.get("orderId") ?? "anonymous";


      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);


      this.ctx.acceptWebSocket(server);


      // Persist per-connection state that survives hibernation
      const state: ConnectionState = {
        orderId,
        joinedAt: Date.now(),
      };
      server.serializeAttachment(state);


      return new Response(null, { status: 101, webSocket: client });
    }


    async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
      // Restore state after potential hibernation
      const state = ws.deserializeAttachment() as ConnectionState;
      ws.send(`Hello ${state.orderId}, you joined at ${state.joinedAt}`);
    }


    async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
      const state = ws.deserializeAttachment() as ConnectionState;
      console.log(`${state.orderId} disconnected`);
      ws.close(code, reason);
    }
  }
  ```

## WebSocket Standard API

WebSocket connections are established by making an HTTP GET request with the `Upgrade: websocket` header.

The typical flow:

1. A Worker validates the upgrade request
2. The Worker proxies the request to the Durable Object
3. The Durable Object accepts the server side connection
4. The Worker returns the client side connection in the response

Validate requests in a Worker

Both Workers and Durable Objects are billed based on the number of requests. Validate requests in your Worker to avoid billing for invalid requests against a Durable Object.

* JavaScript

  ```js
  // Worker
  export default {
    async fetch(request, env, ctx) {
      if (request.method === "GET" && request.url.endsWith("/websocket")) {
        // Expect to receive a WebSocket Upgrade request.
        // If there is one, accept the request and return a WebSocket Response.
        const upgradeHeader = request.headers.get("Upgrade");
        if (!upgradeHeader || upgradeHeader !== "websocket") {
          return new Response(null, {
            status: 426,
            statusText: "Durable Object expected Upgrade: websocket",
            headers: {
              "Content-Type": "text/plain",
            },
          });
        }


        // This example will refer to a single Durable Object instance, since the name "foo" is
        // hardcoded
        let stub = env.WEBSOCKET_SERVER.getByName("foo");


        // The Durable Object's fetch handler will accept the server side connection and return
        // the client
        return stub.fetch(request);
      }


      return new Response(null, {
        status: 400,
        statusText: "Bad Request",
        headers: {
          "Content-Type": "text/plain",
        },
      });
    },
  };
  ```

* TypeScript

  ```ts
  // Worker
  export default {
    async fetch(request, env, ctx): Promise<Response> {
      if (request.method === "GET" && request.url.endsWith("/websocket")) {
        // Expect to receive a WebSocket Upgrade request.
        // If there is one, accept the request and return a WebSocket Response.
        const upgradeHeader = request.headers.get("Upgrade");
        if (!upgradeHeader || upgradeHeader !== "websocket") {
          return new Response(null, {
            status: 426,
            statusText: "Durable Object expected Upgrade: websocket",
            headers: {
              "Content-Type": "text/plain",
            },
          });
        }


        // This example will refer to a single Durable Object instance, since the name "foo" is
        // hardcoded
        let stub = env.WEBSOCKET_SERVER.getByName("foo");


        // The Durable Object's fetch handler will accept the server side connection and return
        // the client
        return stub.fetch(request);
      }


      return new Response(null, {
        status: 400,
        statusText: "Bad Request",
        headers: {
          "Content-Type": "text/plain",
        },
      });
    },
  } satisfies ExportedHandler<Env>;
  ```

* Python

  ```python
  from workers import Response, WorkerEntrypoint


  # Worker


  class Default(WorkerEntrypoint):
  async def fetch(self, request):
  if request.method == "GET" and request.url.endswith("/websocket"): # Expect to receive a WebSocket Upgrade request. # If there is one, accept the request and return a WebSocket Response.
  upgrade_header = request.headers.get("Upgrade")
  if not upgrade_header or upgrade_header != "websocket":
  return Response(
  None,
  status=426,
  status_text="Durable Object expected Upgrade: websocket",
  headers={
  "Content-Type": "text/plain",
  },
  )


              # This example will refer to a single Durable Object instance, since the name "foo" is
              # hardcoded
              stub = self.env.WEBSOCKET_SERVER.getByName("foo")


              # The Durable Object's fetch handler will accept the server side connection and return
              # the client
              return await stub.fetch(request)


          return Response(
              None,
              status=400,
              status_text="Bad Request",
              headers={
                  "Content-Type": "text/plain",
              },
          )
  ```

The following Durable Object creates a WebSocket connection and responds to messages with the total number of connections:

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  // Durable Object
  export class WebSocketServer extends DurableObject {
    currentlyConnectedWebSockets;


    constructor(ctx, env) {
      super(ctx, env);
      this.currentlyConnectedWebSockets = 0;
    }


    async fetch(request) {
      // Creates two ends of a WebSocket connection.
      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);


      // Calling `accept()` connects the WebSocket to this Durable Object
      server.accept();
      this.currentlyConnectedWebSockets += 1;


      // Upon receiving a message from the client, the server replies with the same message,
      // and the total number of connections with the "[Durable Object]: " prefix
      server.addEventListener("message", (event) => {
        server.send(
          `[Durable Object] currentlyConnectedWebSockets: ${this.currentlyConnectedWebSockets}`,
        );
      });


      // If the client closes the connection, the runtime will close the connection too.
      server.addEventListener("close", (cls) => {
        this.currentlyConnectedWebSockets -= 1;
        server.close(cls.code, "Durable Object is closing WebSocket");
      });


      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }
  }
  ```

* TypeScript

  ```ts
  // Durable Object
  export class WebSocketServer extends DurableObject {
    currentlyConnectedWebSockets: number;


    constructor(ctx: DurableObjectState, env: Env) {
      super(ctx, env);
      this.currentlyConnectedWebSockets = 0;
    }


    async fetch(request: Request): Promise<Response> {
      // Creates two ends of a WebSocket connection.
      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);


      // Calling `accept()` connects the WebSocket to this Durable Object
      server.accept();
      this.currentlyConnectedWebSockets += 1;


      // Upon receiving a message from the client, the server replies with the same message,
      // and the total number of connections with the "[Durable Object]: " prefix
      server.addEventListener("message", (event: MessageEvent) => {
        server.send(
          `[Durable Object] currentlyConnectedWebSockets: ${this.currentlyConnectedWebSockets}`,
        );
      });


      // If the client closes the connection, the runtime will close the connection too.
      server.addEventListener("close", (cls: CloseEvent) => {
        this.currentlyConnectedWebSockets -= 1;
        server.close(cls.code, "Durable Object is closing WebSocket");
      });


      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }
  }
  ```

* Python

  ```python
  from workers import Response, DurableObject
  from js import WebSocketPair
  from pyodide.ffi import create_proxy


  # Durable Object


  class WebSocketServer(DurableObject):
  def **init**(self, ctx, env):
  super().**init**(ctx, env)
  self.currently_connected_websockets = 0


      async def fetch(self, request):
          # Creates two ends of a WebSocket connection.
          client, server = WebSocketPair.new().object_values()


          # Calling `accept()` connects the WebSocket to this Durable Object
          server.accept()
          self.currently_connected_websockets += 1


          # Upon receiving a message from the client, the server replies with the same message,
          # and the total number of connections with the "[Durable Object]: " prefix
          def on_message(event):
              server.send(
                  f"[Durable Object] currentlyConnectedWebSockets: {self.currently_connected_websockets}"
              )


          server.addEventListener("message", create_proxy(on_message))


          # If the client closes the connection, the runtime will close the connection too.
          def on_close(event):
              self.currently_connected_websockets -= 1
              server.close(event.code, "Durable Object is closing WebSocket")


          server.addEventListener("close", create_proxy(on_close))


          return Response(
              None,
              status=101,
              web_socket=client,
          )
  ```

Configure your Wrangler file with a Durable Object [binding](https://developers.cloudflare.com/durable-objects/get-started/#4-configure-durable-object-bindings) and [migration](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/):

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "websocket-server",
    "durable_objects": {
      "bindings": [
        {
          "name": "WEBSOCKET_SERVER",
          "class_name": "WebSocketServer"
        }
      ]
    },
    "migrations": [
      {
        "tag": "v1",
        "new_sqlite_classes": ["WebSocketServer"]
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "websocket-server"


  [[durable_objects.bindings]]
  name = "WEBSOCKET_SERVER"
  class_name = "WebSocketServer"


  [[migrations]]
  tag = "v1"
  new_sqlite_classes = [ "WebSocketServer" ]
  ```

A full example is available in [Build a WebSocket server](https://developers.cloudflare.com/durable-objects/examples/websocket-server/).

WebSocket disconnection on deploy

Code updates disconnect all WebSockets. Deploying a new version restarts every Durable Object, which disconnects any existing connections.

## Related resources

* [Mozilla Developer Network's (MDN) documentation on the WebSocket class](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
* [Cloudflare's WebSocket template for building applications on Workers using WebSockets](https://github.com/cloudflare/websocket-template)
* [Durable Object base class](https://developers.cloudflare.com/durable-objects/api/base/)
* [Durable Object State interface](https://developers.cloudflare.com/durable-objects/api/state/)

```plaintext
```

</page>

<page>
---
title: Lifecycle of a Durable Object · Cloudflare Durable Objects docs
description: This section describes the lifecycle of a Durable Object.
lastUpdated: 2026-01-30T21:23:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/
  md: https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/index.md
---

This section describes the lifecycle of a [Durable Object](https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/).

To use a Durable Object you need to create a [Durable Object Stub](https://developers.cloudflare.com/durable-objects/api/stub/). Simply creating the Durable Object Stub does not send a request to the Durable Object, and therefore the Durable Object is not yet instantiated. A request is sent to the Durable Object and its lifecycle begins only once a method is invoked on the Durable Object Stub.

```js
const stub = env.MY_DURABLE_OBJECT.getByName("foo");
// Now the request is sent to the remote Durable Object.
const rpcResponse = await stub.sayHello();
```

## Durable Object Lifecycle state transitions

A Durable Object can be in one of the following states at any moment:

| State | Description |
| - | - |
| **Active, in-memory** | The Durable Object runs, in memory, and handles incoming requests. |
| **Idle, in-memory non-hibernateable** | The Durable Object waits for the next incoming request/event, but does not satisfy the criteria for hibernation. |
| **Idle, in-memory hibernateable** | The Durable Object waits for the next incoming request/event and satisfies the criteria for hibernation. It is up to the runtime to decide when to hibernate the Durable Object. Currently, it is after 10 seconds of inactivity while in this state. |
| **Hibernated** | The Durable Object is removed from memory. Hibernated WebSocket connections stay connected. |
| **Inactive** | The Durable Object is completely removed from the host process and might need to cold start. This is the initial state of all Durable Objects. |

This is how a Durable Object transitions among these states (each state is in a rounded rectangle).

![Lifecycle of a Durable Object](https://developers.cloudflare.com/_astro/lifecycle-of-a-do.C3BLS8lH_Z2nkrrY.webp)

Assuming a Durable Object does not run, the first incoming request or event (like an alarm) will execute the `constructor()` of the Durable Object class, then run the corresponding function invoked.

At this point the Durable Object is in the **active in-memory state**.

Once all incoming requests or events have been processed, the Durable Object remains idle in-memory for a few seconds either in a hibernateable state or in a non-hibernateable state.

Hibernation can only occur if **all** of the conditions below are true:

* No `setTimeout`/`setInterval` scheduled callbacks are set, since there would be no way to recreate the callback after hibernating.
* No in-progress awaited `fetch()` exists, since it is considered to be waiting for I/O.
* No WebSocket standard API is used.
* No request/event is still being processed, because hibernating would mean losing track of the async function which is eventually supposed to return a response to that request.

After 10 seconds of no incoming request or event, and all the above conditions satisfied, the Durable Object will transition into the **hibernated** state.

Warning

When hibernated, the in-memory state is discarded, so ensure you persist all important information in the Durable Object's storage.

If any of the above conditions is false, the Durable Object remains in-memory, in the **idle, in-memory, non-hibernateable** state.

In case of an incoming request or event while in the **hibernated** state, the `constructor()` will run again, and the Durable Object will transition to the **active, in-memory** state and execute the invoked function.

While in the **idle, in-memory, non-hibernateable** state, after 70-140 seconds of inactivity (no incoming requests or events), the Durable Object will be evicted entirely from memory and potentially from the Cloudflare host and transition to the **inactive** state.

Objects in the **hibernated** state keep their Websocket clients connected, and the runtime decides if and when to transition the object to the **inactive** state (for example deciding to move the object to a different host) thus restarting the lifecycle.

The next incoming request or event starts the cycle again.

Lifecycle states incurring duration charges

A Durable Object incurs charges only when it is **actively running in-memory**, or when it is **idle in-memory and non-hibernateable** (indicated as green rectangles in the diagram).

## Shutdown behavior

Durable Objects will occasionally shut down and objects are restarted, which will run your Durable Object class constructor. This can happen for various reasons, including:

* New Worker [deployments](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/) with code updates
* Lack of requests to an object following the state transitions documented above
* Cloudflare updates to the Workers runtime system
* Workers runtime decisions on where to host objects

When a Durable Object is shut down, the object instance is automatically restarted and new requests are routed to the new instance. In-flight requests are handled as follows:

* **HTTP requests**: In-flight requests are allowed to finish for up to 30 seconds. However, if a request attempts to access a Durable Object's storage during this grace period, it will be stopped immediately to maintain Durable Objects global uniqueness property.
* **WebSocket connections**: WebSocket requests are terminated automatically during shutdown. This is so that the new instance can take over the connection as soon as possible.
* **Other invocations (email, cron)**: Other invocations are treated similarly to HTTP requests.

It is important to ensure that any services using Durable Objects are designed to handle the possibility of a Durable Object being shut down.

### Code updates

When your Durable Object code is updated, your Worker and Durable Objects are released globally in an eventually consistent manner. This will cause a Durable Object to shut down, with the behavior described above. Updates can also create a situation where a request reaches a new version of your Worker in one location, and calls to a Durable Object still running a previous version elsewhere. Refer to [Code updates](https://developers.cloudflare.com/durable-objects/platform/known-issues/#code-updates) for more information about handling this scenario.

### Working without shutdown hooks

Durable Objects may shut down due to deployments, inactivity, or runtime decisions. Rather than relying on shutdown hooks (which are not provided), design your application to write state incrementally.

Shutdown hooks or lifecycle callbacks that run before shutdown are not provided because Cloudflare cannot guarantee these hooks would execute in all cases, and external software may rely too heavily on these (unreliable) hooks.

Instead of relying on shutdown hooks, you can regularly write to storage to recover gracefully from shutdowns.

For example, if you are processing a stream of data and need to save your progress, write your position to storage as you go rather than waiting to persist it at the end:

```js
// Good: Write progress as you go
async processData(data) {
  data.forEach(async (item, index) => {
    await this.processItem(item);
    // Save progress frequently
    await this.ctx.storage.put("lastProcessedIndex", index);
  });
}
```

While this may feel unintuitive, Durable Object storage writes are fast and synchronous, so you can persist state with minimal performance concerns.

This approach ensures your Durable Object can safely resume from any point, even if it shuts down unexpectedly.

</page>

<page>
---
title: What are Durable Objects? · Cloudflare Durable Objects docs
description: "A Durable Object is a special kind of Cloudflare Worker which
  uniquely combines compute with storage. Like a Worker, a Durable Object is
  automatically provisioned geographically close to where it is first requested,
  starts up quickly when needed, and shuts down when idle. You can have millions
  of them around the world. However, unlike regular Workers:"
lastUpdated: 2025-09-24T13:21:38.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/
  md: https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/index.md
---

A Durable Object is a special kind of [Cloudflare Worker](https://developers.cloudflare.com/workers/) which uniquely combines compute with storage. Like a Worker, a Durable Object is automatically provisioned geographically close to where it is first requested, starts up quickly when needed, and shuts down when idle. You can have millions of them around the world. However, unlike regular Workers:

* Each Durable Object has a **globally-unique name**, which allows you to send requests to a specific object from anywhere in the world. Thus, a Durable Object can be used to coordinate between multiple clients who need to work together.
* Each Durable Object has some **durable storage** attached. Since this storage lives together with the object, it is strongly consistent yet fast to access.

Therefore, Durable Objects enable **stateful** serverless applications.

## Durable Objects highlights

Durable Objects have properties that make them a great fit for distributed stateful scalable applications.

**Serverless compute, zero infrastructure management**

* Durable Objects are built on-top of the Workers runtime, so they support exactly the same code (JavaScript and WASM), and similar memory and CPU limits.
* Each Durable Object is [implicitly created on first access](https://developers.cloudflare.com/durable-objects/api/namespace/#get). User applications are not concerned with their lifecycle, creating them or destroying them. Durable Objects migrate among healthy servers, and therefore applications never have to worry about managing them.
* Each Durable Object stays alive as long as requests are being processed, and remains alive for several seconds after being idle before hibernating, allowing applications to [exploit in-memory caching](https://developers.cloudflare.com/durable-objects/reference/in-memory-state/) while handling many consecutive requests and boosting their performance.

**Storage colocated with compute**

* Each Durable Object has its own [durable, transactional, and strongly consistent storage](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/) (up to 10 GB[1](#user-content-fn-1)), persisted across requests, and accessible only within that object.

**Single-threaded concurrency**

* Each [Durable Object instance has an identifier](https://developers.cloudflare.com/durable-objects/api/id/), either randomly-generated or user-generated, which allows you to globally address which Durable Object should handle a specific action or request.
* Durable Objects are single-threaded and cooperatively multi-tasked, just like code running in a web browser. For more details on how safety and correctness are achieved, refer to the blog post ["Durable Objects: Easy, Fast, Correct — Choose three"](https://blog.cloudflare.com/durable-objects-easy-fast-correct-choose-three/).

**Elastic horizontal scaling across Cloudflare's global network**

* Durable Objects can be spread around the world, and you can [optionally influence where each instance should be located](https://developers.cloudflare.com/durable-objects/reference/data-location/#provide-a-location-hint). Durable Objects are not yet available in every Cloudflare data center; refer to the [where.durableobjects.live](https://where.durableobjects.live/) project for live locations.
* Each Durable Object type (or ["Namespace binding"](https://developers.cloudflare.com/durable-objects/api/namespace/) in Cloudflare terms) corresponds to a JavaScript class implementing the actual logic. There is no hard limit on how many Durable Objects can be created for each namespace.
* Durable Objects scale elastically as your application creates millions of objects. There is no need for applications to manage infrastructure or plan ahead for capacity.

## Durable Objects features

### In-memory state

Each Durable Object has its own [in-memory state](https://developers.cloudflare.com/durable-objects/reference/in-memory-state/). Applications can use this in-memory state to optimize the performance of their applications by keeping important information in-memory, thereby avoiding the need to access the durable storage at all.

Useful cases for in-memory state include batching and aggregating information before persisting it to storage, or for immediately rejecting/handling incoming requests meeting certain criteria, and more.

In-memory state is reset when the Durable Object hibernates after being idle for some time. Therefore, it is important to persist any in-memory data to the durable storage if that data will be needed at a later time when the Durable Object receives another request.

### Storage API

The [Durable Object Storage API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/) allows Durable Objects to access fast, transactional, and strongly consistent storage. A Durable Object's attached storage is private to its unique instance and cannot be accessed by other objects.

There are two flavors of the storage API, a [key-value (KV) API](https://developers.cloudflare.com/durable-objects/api/legacy-kv-storage-api/) and an [SQL API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/).

When using the [new SQLite in Durable Objects storage backend](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/#enable-sqlite-storage-backend-on-new-durable-object-class-migration), you have access to both the APIs. However, if you use the previous storage backend you only have access to the key-value API.

### Alarms API

Durable Objects provide an [Alarms API](https://developers.cloudflare.com/durable-objects/api/alarms/) which allows you to schedule the Durable Object to be woken up at a time in the future. This is useful when you want to do certain work periodically, or at some specific point in time, without having to manually manage infrastructure such as job scheduling runners on your own.

You can combine Alarms with in-memory state and the durable storage API to build batch and aggregation applications such as queues, workflows, or advanced data pipelines.

### WebSockets

WebSockets are long-lived TCP connections that enable bi-directional, real-time communication between client and server. Because WebSocket sessions are long-lived, applications commonly use Durable Objects to accept either the client or server connection.

Because Durable Objects provide a single-point-of-coordination between Cloudflare Workers, a single Durable Object instance can be used in parallel with WebSockets to coordinate between multiple clients, such as participants in a chat room or a multiplayer game.

Durable Objects support the [WebSocket Standard API](https://developers.cloudflare.com/durable-objects/best-practices/websockets/#websocket-standard-api), as well as the [WebSockets Hibernation API](https://developers.cloudflare.com/durable-objects/best-practices/websockets/#websocket-hibernation-api) which extends the Web Standard WebSocket API to reduce costs by not incurring billing charges during periods of inactivity.

### RPC

Durable Objects support Workers [Remote-Procedure-Call (RPC)](https://developers.cloudflare.com/workers/runtime-apis/rpc/) which allows applications to use JavaScript-native methods and objects to communicate between Workers and Durable Objects.

Using RPC for communication makes application development easier and simpler to reason about, and more efficient.

## Actor programming model

Another way to describe and think about Durable Objects is through the lens of the [Actor programming model](https://en.wikipedia.org/wiki/Actor_model). There are several popular examples of the Actor model supported at the programming language level through runtimes or library frameworks, like [Erlang](https://www.erlang.org/), [Elixir](https://elixir-lang.org/), [Akka](https://akka.io/), or [Microsoft Orleans for .NET](https://learn.microsoft.com/en-us/dotnet/orleans/overview).

The Actor model simplifies a lot of problems in distributed systems by abstracting away the communication between actors using RPC calls (or message sending) that could be implemented on-top of any transport protocol, and it avoids most of the concurrency pitfalls you get when doing concurrency through shared memory such as race conditions when multiple processes/threads access the same data in-memory.

Each Durable Object instance can be seen as an Actor instance, receiving messages (incoming HTTP/RPC requests), executing some logic in its own single-threaded context using its attached durable storage or in-memory state, and finally sending messages to the outside world (outgoing HTTP/RPC requests or responses), even to another Durable Object instance.

Each Durable Object has certain capabilities in terms of [how much work it can do](https://developers.cloudflare.com/durable-objects/platform/limits/#how-much-work-can-a-single-durable-object-do), which should influence the application's [architecture to fully take advantage of the platform](https://developers.cloudflare.com/reference-architecture/diagrams/storage/durable-object-control-data-plane-pattern/).

Durable Objects are natively integrated into Cloudflare's infrastructure, giving you the ultimate serverless platform to build distributed stateful applications exploiting the entirety of Cloudflare's network.

## Durable Objects in Cloudflare

Many of Cloudflare's products use Durable Objects. Some of our technical blog posts showcase real-world applications and use-cases where Durable Objects make building applications easier and simpler.

These blog posts may also serve as inspiration on how to architect scalable applications using Durable Objects, and how to integrate them with the rest of Cloudflare Developer Platform.

* [Durable Objects aren't just durable, they're fast: a 10x speedup for Cloudflare Queues](https://blog.cloudflare.com/how-we-built-cloudflare-queues/)
* [Behind the scenes with Stream Live, Cloudflare's live streaming service](https://blog.cloudflare.com/behind-the-scenes-with-stream-live-cloudflares-live-streaming-service/)
* [DO it again: how we used Durable Objects to add WebSockets support and authentication to AI Gateway](https://blog.cloudflare.com/do-it-again/)
* [Workers Builds: integrated CI/CD built on the Workers platform](https://blog.cloudflare.com/workers-builds-integrated-ci-cd-built-on-the-workers-platform/)
* [Build durable applications on Cloudflare Workers: you write the Workflows, we take care of the rest](https://blog.cloudflare.com/building-workflows-durable-execution-on-workers/)
* [Building D1: a Global Database](https://blog.cloudflare.com/building-d1-a-global-database/)
* [Billions and billions (of logs): scaling AI Gateway with the Cloudflare Developer Platform](https://blog.cloudflare.com/billions-and-billions-of-logs-scaling-ai-gateway-with-the-cloudflare/)
* [Indexing millions of HTTP requests using Durable Objects](https://blog.cloudflare.com/r2-rayid-retrieval/)

Finally, the following blog posts may help you learn some of the technical implementation aspects of Durable Objects, and how they work.

* [Durable Objects: Easy, Fast, Correct — Choose three](https://blog.cloudflare.com/durable-objects-easy-fast-correct-choose-three/)
* [Zero-latency SQLite storage in every Durable Object](https://blog.cloudflare.com/sqlite-in-durable-objects/)
* [Workers Durable Objects Beta: A New Approach to Stateful Serverless](https://blog.cloudflare.com/introducing-workers-durable-objects/)

## Get started

Get started now by following the ["Get started" guide](https://developers.cloudflare.com/durable-objects/get-started/) to create your first application using Durable Objects.

## Footnotes

1. Storage per Durable Object with SQLite is currently 1 GB. This will be raised to 10 GB for general availability. [↩](#user-content-fnref-1)

</page>

<page>
---
title: Use the Alarms API · Cloudflare Durable Objects docs
description: Use the Durable Objects Alarms API to batch requests to a Durable Object.
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/examples/alarms-api/
  md: https://developers.cloudflare.com/durable-objects/examples/alarms-api/index.md
---

This example implements an `alarm()` handler that allows batching of requests to a single Durable Object.

When a request is received and no alarm is set, it sets an alarm for 10 seconds in the future. The `alarm()` handler processes all requests received within that 10-second window.

If no new requests are received, no further alarms will be set until the next request arrives.

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  // Worker
  export default {
    async fetch(request, env) {
      return await env.BATCHER.getByName("foo").fetch(request);
    },
  };


  // Durable Object
  export class Batcher extends DurableObject {
    constructor(ctx, env) {
      super(ctx, env);
      this.storage = ctx.storage;
      this.ctx.blockConcurrencyWhile(async () => {
        let vals = await this.storage.list({ reverse: true, limit: 1 });
        this.count = vals.size == 0 ? 0 : parseInt(vals.keys().next().value);
      });
    }


    async fetch(request) {
      this.count++;


      // If there is no alarm currently set, set one for 10 seconds from now
      // Any further POSTs in the next 10 seconds will be part of this batch.
      let currentAlarm = await this.storage.getAlarm();
      if (currentAlarm == null) {
        this.storage.setAlarm(Date.now() + 1000 * 10);
      }


      // Add the request to the batch.
      await this.storage.put(this.count, await request.text());
      return new Response(JSON.stringify({ queued: this.count }), {
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
      });
    }


    async alarm() {
      let vals = await this.storage.list();
      await fetch("http://example.com/some-upstream-service", {
        method: "POST",
        body: Array.from(vals.values()),
      });
      await this.storage.deleteAll();
      this.count = 0;
    }
  }
  ```

* Python

  ```py
  from workers import DurableObject, Response, WorkerEntrypoint, fetch
  import time


  # Worker
  class Default(WorkerEntrypoint):
    async def fetch(self, request):
      stub = self.env.BATCHER.getByName("foo")
      return await stub.fetch(request)


  # Durable Object
  class Batcher(DurableObject):
    def __init__(self, ctx, env):
      super().__init__(ctx, env)
      self.storage = ctx.storage


      @self.ctx.blockConcurrencyWhile
      async def initialize():
        vals = await self.storage.list(reverse=True, limit=1)
        self.count = 0
        if len(vals) > 0:
            self.count = int(vals.keys().next().value)


    async def fetch(self, request):
      self.count += 1


      # If there is no alarm currently set, set one for 10 seconds from now
      # Any further POSTs in the next 10 seconds will be part of this batch.
      current_alarm = await self.storage.getAlarm()
      if current_alarm is None:
        self.storage.setAlarm(int(time.time() * 1000) + 1000 * 10)


      # Add the request to the batch.
      await self.storage.put(self.count, await request.text())
      return Response.json(
        {"queued": self.count}
      )


    async def alarm(self):
      vals = await self.storage.list()
      await fetch(
        "http://example.com/some-upstream-service",
        method="POST",
        body=list(vals.values())
      )
      await self.storage.deleteAll()
      self.count = 0
  ```

The `alarm()` handler will be called once every 10 seconds. If an unexpected error terminates the Durable Object, the `alarm()` handler will be re-instantiated on another machine. Following a short delay, the `alarm()` handler will run from the beginning on the other machine.

Finally, configure your Wrangler file to include a Durable Object [binding](https://developers.cloudflare.com/durable-objects/get-started/#4-configure-durable-object-bindings) and [migration](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/) based on the namespace and class name chosen previously.

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "durable-object-alarm",
    "main": "src/index.ts",
    "durable_objects": {
      "bindings": [
        {
          "name": "BATCHER",
          "class_name": "Batcher"
        }
      ]
    },
    "migrations": [
      {
        "tag": "v1",
        "new_sqlite_classes": [
          "Batcher"
        ]
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "durable-object-alarm"
  main = "src/index.ts"


  [[durable_objects.bindings]]
  name = "BATCHER"
  class_name = "Batcher"


  [[migrations]]
  tag = "v1"
  new_sqlite_classes = [ "Batcher" ]
  ```

</page>

<page>
---
title: Build a counter · Cloudflare Durable Objects docs
description: Build a counter using Durable Objects and Workers with RPC methods.
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/examples/build-a-counter/
  md: https://developers.cloudflare.com/durable-objects/examples/build-a-counter/index.md
---

This example shows how to build a counter using Durable Objects and Workers with [RPC methods](https://developers.cloudflare.com/workers/runtime-apis/rpc) that can print, increment, and decrement a `name` provided by the URL query string parameter, for example, `?name=A`.

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  // Worker
  export default {
    async fetch(request, env) {
      let url = new URL(request.url);
      let name = url.searchParams.get("name");
      if (!name) {
        return new Response(
          "Select a Durable Object to contact by using" +
            " the `name` URL query string parameter, for example, ?name=A",
        );
      }


      // A stub is a client Object used to send messages to the Durable Object.
      let stub = env.COUNTERS.getByName(name);


      // Send a request to the Durable Object using RPC methods, then await its response.
      let count = null;
      switch (url.pathname) {
        case "/increment":
          count = await stub.increment();
          break;
        case "/decrement":
          count = await stub.decrement();
          break;
        case "/":
          // Serves the current value.
          count = await stub.getCounterValue();
          break;
        default:
          return new Response("Not found", { status: 404 });
      }


      return new Response(`Durable Object '${name}' count: ${count}`);
    },
  };


  // Durable Object
  export class Counter extends DurableObject {
    async getCounterValue() {
      let value = (await this.ctx.storage.get("value")) || 0;
      return value;
    }


    async increment(amount = 1) {
      let value = (await this.ctx.storage.get("value")) || 0;
      value += amount;
      // You do not have to worry about a concurrent request having modified the value in storage.
      // "input gates" will automatically protect against unwanted concurrency.
      // Read-modify-write is safe.
      await this.ctx.storage.put("value", value);
      return value;
    }


    async decrement(amount = 1) {
      let value = (await this.ctx.storage.get("value")) || 0;
      value -= amount;
      await this.ctx.storage.put("value", value);
      return value;
    }
  }
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    COUNTERS: DurableObjectNamespace<Counter>;
  }


  // Worker
  export default {
    async fetch(request, env) {
      let url = new URL(request.url);
      let name = url.searchParams.get("name");
      if (!name) {
        return new Response(
          "Select a Durable Object to contact by using" +
            " the `name` URL query string parameter, for example, ?name=A",
        );
      }


      // A stub is a client Object used to send messages to the Durable Object.
      let stub = env.COUNTERS.get(name);


      let count = null;
      switch (url.pathname) {
        case "/increment":
          count = await stub.increment();
          break;
        case "/decrement":
          count = await stub.decrement();
          break;
        case "/":
          // Serves the current value.
          count = await stub.getCounterValue();
          break;
        default:
          return new Response("Not found", { status: 404 });
      }


      return new Response(`Durable Object '${name}' count: ${count}`);
    },
  } satisfies ExportedHandler<Env>;


  // Durable Object
  export class Counter extends DurableObject {
    async getCounterValue() {
      let value = (await this.ctx.storage.get("value")) || 0;
      return value;
    }


    async increment(amount = 1) {
      let value: number = (await this.ctx.storage.get("value")) || 0;
      value += amount;
      // You do not have to worry about a concurrent request having modified the value in storage.
      // "input gates" will automatically protect against unwanted concurrency.
      // Read-modify-write is safe.
      await this.ctx.storage.put("value", value);
      return value;
    }


    async decrement(amount = 1) {
      let value: number = (await this.ctx.storage.get("value")) || 0;
      value -= amount;
      await this.ctx.storage.put("value", value);
      return value;
    }
  }
  ```

* Python

  ```py
  from workers import DurableObject, Response, WorkerEntrypoint
  from urllib.parse import urlparse, parse_qs


  # Worker
  class Default(WorkerEntrypoint):
    async def fetch(self, request):
      parsed_url = urlparse(request.url)
      query_params = parse_qs(parsed_url.query)
      name = query_params.get('name', [None])[0]


      if not name:
        return Response(
          "Select a Durable Object to contact by using"
          + " the `name` URL query string parameter, for example, ?name=A"
        )


      # A stub is a client Object used to send messages to the Durable Object.
      stub = self.env.COUNTERS.getByName(name)


      # Send a request to the Durable Object using RPC methods, then await its response.
      count = None


      if parsed_url.path == "/increment":
        count = await stub.increment()
      elif parsed_url.path == "/decrement":
        count = await stub.decrement()
      elif parsed_url.path == "" or parsed_url.path == "/":
        # Serves the current value.
        count = await stub.getCounterValue()
      else:
        return Response("Not found", status=404)


      return Response(f"Durable Object '{name}' count: {count}")


  # Durable Object
  class Counter(DurableObject):
    def __init__(self, ctx, env):
      super().__init__(ctx, env)


    async def getCounterValue(self):
      value = await self.ctx.storage.get("value")
      return value if value is not None else 0


    async def increment(self, amount=1):
      value = await self.ctx.storage.get("value")
      value = (value if value is not None else 0) + amount
      # You do not have to worry about a concurrent request having modified the value in storage.
      # "input gates" will automatically protect against unwanted concurrency.
      # Read-modify-write is safe.
      await self.ctx.storage.put("value", value)
      return value


    async def decrement(self, amount=1):
      value = await self.ctx.storage.get("value")
      value = (value if value is not None else 0) - amount
      await self.ctx.storage.put("value", value)
      return value
  ```

Finally, configure your Wrangler file to include a Durable Object [binding](https://developers.cloudflare.com/durable-objects/get-started/#4-configure-durable-object-bindings) and [migration](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/) based on the namespace and class name chosen previously.

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "my-counter",
    "main": "src/index.ts",
    "durable_objects": {
      "bindings": [
        {
          "name": "COUNTERS",
          "class_name": "Counter"
        }
      ]
    },
    "migrations": [
      {
        "tag": "v1",
        "new_sqlite_classes": [
          "Counter"
        ]
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "my-counter"
  main = "src/index.ts"


  [[durable_objects.bindings]]
  name = "COUNTERS"
  class_name = "Counter"


  [[migrations]]
  tag = "v1"
  new_sqlite_classes = [ "Counter" ]
  ```

### Related resources

* [Workers RPC](https://developers.cloudflare.com/workers/runtime-apis/rpc/)
* [Durable Objects: Easy, Fast, Correct — Choose three](https://blog.cloudflare.com/durable-objects-easy-fast-correct-choose-three/).

</page>

<page>
---
title: Agents · Cloudflare Durable Objects docs
description: Build AI-powered Agents on Cloudflare
lastUpdated: 2025-04-06T14:39:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/examples/agents/
  md: https://developers.cloudflare.com/durable-objects/examples/agents/index.md
---


</page>

<page>
---
title: Durable Object in-memory state · Cloudflare Durable Objects docs
description: Create a Durable Object that stores the last location it was
  accessed from in-memory.
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/examples/durable-object-in-memory-state/
  md: https://developers.cloudflare.com/durable-objects/examples/durable-object-in-memory-state/index.md
---

This example shows you how Durable Objects are stateful, meaning in-memory state can be retained between requests. After a brief period of inactivity, the Durable Object will be evicted, and all in-memory state will be lost. The next request will reconstruct the object, but instead of showing the city of the previous request, it will display a message indicating that the object has been reinitialized. If you need your applications state to survive eviction, write the state to storage by using the [Storage API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/), or by storing your data elsewhere.

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  // Worker
  export default {
    async fetch(request, env) {
      return await handleRequest(request, env);
    },
  };


  async function handleRequest(request, env) {
    let stub = env.LOCATION.getByName("A");
    // Forward the request to the remote Durable Object.
    let resp = await stub.fetch(request);
    // Return the response to the client.
    return new Response(await resp.text());
  }


  // Durable Object
  export class Location extends DurableObject {
    constructor(state, env) {
      super(state, env);
      // Upon construction, you do not have a location to provide.
      // This value will be updated as people access the Durable Object.
      // When the Durable Object is evicted from memory, this will be reset.
      this.location = null;
    }


    // Handle HTTP requests from clients.
    async fetch(request) {
      let response = null;


      if (this.location == null) {
        response = new String(`
  This is the first request, you called the constructor, so this.location was null.
  You will set this.location to be your city: (${request.cf.city}). Try reloading the page.`);
      } else {
        response = new String(`
  The Durable Object was already loaded and running because it recently handled a request.


  Previous Location: ${this.location}
  New Location: ${request.cf.city}`);
      }


      // You set the new location to be the new city.
      this.location = request.cf.city;
      console.log(response);
      return new Response(response);
    }
  }
  ```

* Python

  ```py
  from workers import DurableObject, Response, WorkerEntrypoint


  # Worker
  class Default(WorkerEntrypoint):
    async def fetch(self, request):
      return await handle_request(request, self.env)


  async def handle_request(request, env):
    stub = env.LOCATION.getByName("A")
    # Forward the request to the remote Durable Object.
    resp = await stub.fetch(request)
    # Return the response to the client.
    return Response(await resp.text())


  # Durable Object
  class Location(DurableObject):
    def __init__(self, ctx, env):
      super().__init__(ctx, env)
      # Upon construction, you do not have a location to provide.
      # This value will be updated as people access the Durable Object.
      # When the Durable Object is evicted from memory, this will be reset.
      self.location = None


    # Handle HTTP requests from clients.
    async def fetch(self, request):
      response = None


      if self.location is None:
        response = f"""
  This is the first request, you called the constructor, so this.location was null.
  You will set this.location to be your city: ({request.js_object.cf.city}). Try reloading the page."""
      else:
        response = f"""
  The Durable Object was already loaded and running because it recently handled a request.


  Previous Location: {self.location}
  New Location: {request.js_object.cf.city}"""


      # You set the new location to be the new city.
      self.location = request.js_object.cf.city
      print(response)
      return Response(response)
  ```

Finally, configure your Wrangler file to include a Durable Object [binding](https://developers.cloudflare.com/durable-objects/get-started/#4-configure-durable-object-bindings) and [migration](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/) based on the namespace and class name chosen previously.

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "durable-object-in-memory-state",
    "main": "src/index.ts",
    "durable_objects": {
      "bindings": [
        {
          "name": "LOCATION",
          "class_name": "Location"
        }
      ]
    },
    "migrations": [
      {
        "tag": "v1",
        "new_sqlite_classes": [
          "Location"
        ]
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "durable-object-in-memory-state"
  main = "src/index.ts"


  [[durable_objects.bindings]]
  name = "LOCATION"
  class_name = "Location"


  [[migrations]]
  tag = "v1"
  new_sqlite_classes = [ "Location" ]
  ```

</page>

<page>
---
title: Durable Object Time To Live · Cloudflare Durable Objects docs
description: Use the Durable Objects Alarms API to implement a Time To Live
  (TTL) for Durable Object instances.
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/examples/durable-object-ttl/
  md: https://developers.cloudflare.com/durable-objects/examples/durable-object-ttl/index.md
---

A common feature request for Durable Objects is a Time To Live (TTL) for Durable Object instances. Durable Objects give developers the tools to implement a custom TTL in only a few lines of code. This example demonstrates how to implement a TTL making use of `alarms`. While this TTL will be extended upon every new request to the Durable Object, this can be customized based on a particular use case.

Be careful when calling `setAlarm` in the Durable Object class constructor

In this example the TTL is extended upon every new fetch request to the Durable Object. It might be tempting to instead extend the TTL in the constructor of the Durable Object. This is not advised because the Durable Object's constructor will be called before invoking the alarm handler if the alarm wakes the Durable Object up from hibernation. This approach will naively result in the constructor continually extending the TTL without running the alarm handler. If you must call `setAlarm` in the Durable Object class constructor be sure to check that there is no alarm previously set.

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  // Durable Object
  export class MyDurableObject extends DurableObject {
    // Time To Live (TTL) in milliseconds
    timeToLiveMs = 1000;


    constructor(ctx, env) {
      super(ctx, env);
    }


    async fetch(_request) {
      // Extend the TTL immediately following every fetch request to a Durable Object.
      await this.ctx.storage.setAlarm(Date.now() + this.timeToLiveMs);
      ...
     }


    async alarm() {
      await this.ctx.storage.deleteAll();
    }
  }


  // Worker
  export default {
    async fetch(request, env) {
      const stub = env.MY_DURABLE_OBJECT.getByName("foo");
      return await stub.fetch(request);
    },
  };
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    MY_DURABLE_OBJECT: DurableObjectNamespace<MyDurableObject>;
  }


  // Durable Object
  export class MyDurableObject extends DurableObject {
    // Time To Live (TTL) in milliseconds
    timeToLiveMs = 1000;


    constructor(ctx: DurableObjectState, env: Env) {
      super(ctx, env);
    }


    async fetch(_request: Request) {
      // Extend the TTL immediately following every fetch request to a Durable Object.
      await this.ctx.storage.setAlarm(Date.now() + this.timeToLiveMs);
      ...
     }


    async alarm() {
      await this.ctx.storage.deleteAll();
    }
  }


  // Worker
  export default {
    async fetch(request, env) {
      const stub = env.MY_DURABLE_OBJECT.getByName("foo");
      return await stub.fetch(request);
    },
  } satisfies ExportedHandler<Env>;
  ```

* Python

  ```py
  from workers import DurableObject, Response, WorkerEntrypoint
  import time


  # Durable Object
  class MyDurableObject(DurableObject):
    # Time To Live (TTL) in milliseconds
    timeToLiveMs = 1000


    def __init__(self, ctx, env):
      super().__init__(ctx, env)


    async def fetch(self, _request):
      # Extend the TTL immediately following every fetch request to a Durable Object.
      await self.ctx.storage.setAlarm(int(time.time() * 1000) + self.timeToLiveMs)
      ...


    async def alarm(self):
      await self.ctx.storage.deleteAll()


  # Worker
  class Default(WorkerEntrypoint):
    async def fetch(self, request):
      stub = self.env.MY_DURABLE_OBJECT.getByName("foo")
      return await stub.fetch(request)
  ```

To test and deploy this example, configure your Wrangler file to include a Durable Object [binding](https://developers.cloudflare.com/durable-objects/get-started/#4-configure-durable-object-bindings) and [migration](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/) based on the namespace and class name chosen previously.

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "durable-object-ttl",
    "main": "src/index.ts",
    "durable_objects": {
      "bindings": [
        {
          "name": "MY_DURABLE_OBJECT",
          "class_name": "MyDurableObject"
        }
      ]
    },
    "migrations": [
      {
        "tag": "v1",
        "new_sqlite_classes": [
          "MyDurableObject"
        ]
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "durable-object-ttl"
  main = "src/index.ts"


  [[durable_objects.bindings]]
  name = "MY_DURABLE_OBJECT"
  class_name = "MyDurableObject"


  [[migrations]]
  tag = "v1"
  new_sqlite_classes = [ "MyDurableObject" ]
  ```

</page>

<page>
---
title: Use ReadableStream with Durable Object and Workers · Cloudflare Durable
  Objects docs
description: Stream ReadableStream from Durable Objects.
lastUpdated: 2026-01-27T21:11:25.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/examples/readable-stream/
  md: https://developers.cloudflare.com/durable-objects/examples/readable-stream/index.md
---

This example demonstrates:

* A Worker receives a request, and forwards it to a Durable Object `my-id`.
* The Durable Object streams an incrementing number every second, until it receives `AbortSignal`.
* The Worker reads and logs the values from the stream.
* The Worker then cancels the stream after 5 values.

- JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  // Send incremented counter value every second
  async function* dataSource(signal) {
    let counter = 0;
    while (!signal.aborted) {
      yield counter++;
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }


    console.log("Data source cancelled");
  }


  export class MyDurableObject extends DurableObject {
    async fetch(request) {
      const abortController = new AbortController();


      const stream = new ReadableStream({
        async start(controller) {
          if (request.signal.aborted) {
            controller.close();
            abortController.abort();
            return;
          }


          for await (const value of dataSource(abortController.signal)) {
            controller.enqueue(new TextEncoder().encode(String(value)));
          }
        },
        cancel() {
          console.log("Stream cancelled");
          abortController.abort();
        },
      });


      const headers = new Headers({
        "Content-Type": "application/octet-stream",
      });


      return new Response(stream, { headers });
    }
  }


  export default {
    async fetch(request, env, ctx) {
      const stub = env.MY_DURABLE_OBJECT.getByName("foo");
      const response = await stub.fetch(request, { ...request });
      if (!response.ok || !response.body) {
        return new Response("Invalid response", { status: 500 });
      }


      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();


      let data = [];
      let i = 0;
      while (true) {
        // Cancel the stream after 5 messages
        if (i > 5) {
          reader.cancel();
          break;
        }
        const { value, done } = await reader.read();


        if (value) {
          console.log(`Got value ${value}`);
          data = [...data, value];
        }


        if (done) {
          break;
        }
        i++;
      }


      return Response.json(data);
    },
  };
  ```

- TypeScript

  ```ts
  import { DurableObject } from 'cloudflare:workers';


  // Send incremented counter value every second
  async function* dataSource(signal: AbortSignal) {
      let counter = 0;
      while (!signal.aborted) {
          yield counter++;
          await new Promise((resolve) => setTimeout(resolve, 1_000));
      }


      console.log('Data source cancelled');
  }


  export class MyDurableObject extends DurableObject<Env> {
      async fetch(request: Request): Promise<Response> {
          const abortController = new AbortController();


          const stream = new ReadableStream({
              async start(controller) {
                  if (request.signal.aborted) {
                      controller.close();
                      abortController.abort();
                      return;
                  }


                  for await (const value of dataSource(abortController.signal)) {
                      controller.enqueue(new TextEncoder().encode(String(value)));
                  }
              },
              cancel() {
                  console.log('Stream cancelled');
                  abortController.abort();
              },
          });


          const headers = new Headers({
              'Content-Type': 'application/octet-stream',
          });


          return new Response(stream, { headers });
      }


  }


  export default {
      async fetch(request, env, ctx): Promise<Response> {
          const stub = env.MY_DURABLE_OBJECT.getByName("foo");
          const response = await stub.fetch(request, { ...request });
          if (!response.ok || !response.body) {
              return new Response('Invalid response', { status: 500 });
          }


          const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();


          let data = [] as string[];
          let i = 0;
          while (true) {
              // Cancel the stream after 5 messages
              if (i > 5) {
                  reader.cancel();
                  break;
              }
              const { value, done } = await reader.read();


              if (value) {
                  console.log(`Got value ${value}`);
                  data = [...data, value];
              }


              if (done) {
                  break;
              }
              i++;
          }


          return Response.json(data);
      },


  } satisfies ExportedHandler<Env>;
  ```

Note

In a setup where a Durable Object returns a readable stream to a Worker, if the Worker cancels the Durable Object's readable stream, the cancellation propagates to the Durable Object.

</page>

<page>
---
title: Use RpcTarget class to handle Durable Object metadata · Cloudflare
  Durable Objects docs
description: Access the name from within a Durable Object using RpcTarget.
lastUpdated: 2026-01-27T21:11:25.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/examples/reference-do-name-using-init/
  md: https://developers.cloudflare.com/durable-objects/examples/reference-do-name-using-init/index.md
---

When working with Durable Objects, you will need to access the name that was used to create the Durable Object via `idFromName()`. This name is typically a meaningful identifier that represents what the Durable Object is responsible for (like a user ID, room name, or resource identifier).

However, there is a limitation in the current implementation: even though you can create a Durable Object with `.idFromName(name)`, you cannot directly access this name inside the Durable Object via `this.ctx.id.name`.

The `RpcTarget` pattern shown below offers a solution by creating a communication layer that automatically carries the name with each method call. This keeps your API clean while ensuring the Durable Object has access to its own name.

Based on your needs, you can either store the metadata temporarily in the `RpcTarget` class, or use Durable Object storage to persist the metadata for the lifetime of the object.

This example does not persist the Durable Object metadata. It demonstrates how to:

1. Create an `RpcTarget` class
2. Set the Durable Object metadata (identifier in this example) in the `RpcTarget` class
3. Pass the metadata to a Durable Object method
4. Clean up the `RpcTarget` class after use

```ts
import { DurableObject, RpcTarget } from "cloudflare:workers";


//  * Create an RpcDO class that extends RpcTarget
//  * Use this class to set the Durable Object metadata
//  * Pass the metadata in the Durable Object methods
//  * @param mainDo - The main Durable Object class
//  * @param doIdentifier - The identifier of the Durable Object


export class RpcDO extends RpcTarget {
  constructor(
    private mainDo: MyDurableObject,
    private doIdentifier: string,
  ) {
    super();
  }


  //  * Pass the user's name to the Durable Object method
  //  * @param userName - The user's name to pass to the Durable Object method


  async computeMessage(userName: string): Promise<string> {
    // Call the Durable Object method and pass the user's name and the Durable Object identifier
    return this.mainDo.computeMessage(userName, this.doIdentifier);
  }


  //  * Call the Durable Object method without using the Durable Object identifier
  //  * @param userName - The user's name to pass to the Durable Object method


  async simpleGreeting(userName: string) {
    return this.mainDo.simpleGreeting(userName);
  }
}


//  * Create a Durable Object class
//  * You can use the RpcDO class to set the Durable Object metadata


export class MyDurableObject extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }


  //  * Initialize the RpcDO class
  //  * You can set the Durable Object metadata here
  //  * It returns an instance of the RpcDO class
  //  * @param doIdentifier - The identifier of the Durable Object


  async setMetaData(doIdentifier: string) {
    return new RpcDO(this, doIdentifier);
  }


  //  * Function that computes a greeting message using the user's name and DO identifier
  //  * @param userName - The user's name to include in the greeting
  //  * @param doIdentifier - The identifier of the Durable Object


  async computeMessage(
    userName: string,
    doIdentifier: string,
  ): Promise<string> {
    console.log({
      userName: userName,
      durableObjectIdentifier: doIdentifier,
    });
    return `Hello, ${userName}! The identifier of this DO is ${doIdentifier}`;
  }


  //  * Function that is not in the RpcTarget
  //  * Not every function has to be in the RpcTarget


  private async notInRpcTarget() {
    return "This is not in the RpcTarget";
  }


  //  * Function that takes the user's name and does not use the Durable Object identifier
  //  * @param userName - The user's name to include in the greeting


  async simpleGreeting(userName: string) {
    // Call the private function that is not in the RpcTarget
    console.log(this.notInRpcTarget());


    return `Hello, ${userName}! This doesn't use the DO identifier.`;
  }
}


export default {
  async fetch(request, env, ctx): Promise<Response> {
    let id: DurableObjectId = env.MY_DURABLE_OBJECT.idFromName(
      new URL(request.url).pathname,
    );
    let stub = env.MY_DURABLE_OBJECT.get(id);


    //  * Set the Durable Object metadata using the RpcTarget
    //  * Notice that no await is needed here


    const rpcTarget = stub.setMetaData(id.name ?? "default");


    // Call the Durable Object method using the RpcTarget.
    // The DO identifier is passed in the RpcTarget
    const greeting = await rpcTarget.computeMessage("world");


    // Call the Durable Object method that does not use the Durable Object identifier
    const simpleGreeting = await rpcTarget.simpleGreeting("world");


    // Clean up the RpcTarget.
    try {
      (await rpcTarget)[Symbol.dispose]?.();
      console.log("RpcTarget cleaned up.");
    } catch (e) {
      console.error({
        message: "RpcTarget could not be cleaned up.",
        error: String(e),
        errorProperties: e,
      });
    }


    return new Response(greeting, { status: 200 });
  },
} satisfies ExportedHandler<Env>;
```

This example persists the Durable Object metadata. It demonstrates similar steps as the previous example, but uses Durable Object storage to store the identifier, eliminating the need to pass it through the RpcTarget.

```ts
import { DurableObject, RpcTarget } from "cloudflare:workers";


//  * Create an RpcDO class that extends RpcTarget
//  * Use this class to set the Durable Object metadata
//  * Pass the metadata in the Durable Object methods
//  * @param mainDo - The main Durable Object class
//  * @param doIdentifier - The identifier of the Durable Object


export class RpcDO extends RpcTarget {
  constructor(
    private mainDo: MyDurableObject,
    private doIdentifier: string,
  ) {
    super();
  }


  //  * Pass the user's name to the Durable Object method
  //  * @param userName - The user's name to pass to the Durable Object method


  async computeMessage(userName: string): Promise<string> {
    // Call the Durable Object method and pass the user's name and the Durable Object identifier
    return this.mainDo.computeMessage(userName, this.doIdentifier);
  }


  //  * Call the Durable Object method without using the Durable Object identifier
  //  * @param userName - The user's name to pass to the Durable Object method


  async simpleGreeting(userName: string) {
    return this.mainDo.simpleGreeting(userName);
  }
}


//  * Create a Durable Object class
//  * You can use the RpcDO class to set the Durable Object metadata


export class MyDurableObject extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }


  //  * Initialize the RpcDO class
  //  * You can set the Durable Object metadata here
  //  * It returns an instance of the RpcDO class
  //  * @param doIdentifier - The identifier of the Durable Object


  async setMetaData(doIdentifier: string) {
    // Use DO storage to store the Durable Object identifier
    await this.ctx.storage.put("doIdentifier", doIdentifier);
    return new RpcDO(this, doIdentifier);
  }


  //  * Function that computes a greeting message using the user's name and DO identifier
  //  * @param userName - The user's name to include in the greeting


  async computeMessage(userName: string): Promise<string> {
    // Get the DO identifier from storage
    const doIdentifier = await this.ctx.storage.get("doIdentifier");
    console.log({
      userName: userName,
      durableObjectIdentifier: doIdentifier,
    });
    return `Hello, ${userName}! The identifier of this DO is ${doIdentifier}`;
  }


  //  * Function that is not in the RpcTarget
  //  * Not every function has to be in the RpcTarget


  private async notInRpcTarget() {
    return "This is not in the RpcTarget";
  }


  //  * Function that takes the user's name and does not use the Durable Object identifier
  //  * @param userName - The user's name to include in the greeting


  async simpleGreeting(userName: string) {
    // Call the private function that is not in the RpcTarget
    console.log(this.notInRpcTarget());


    return `Hello, ${userName}! This doesn't use the DO identifier.`;
  }
}


export default {
  async fetch(request, env, ctx): Promise<Response> {
    let id: DurableObjectId = env.MY_DURABLE_OBJECT.idFromName(
      new URL(request.url).pathname,
    );
    let stub = env.MY_DURABLE_OBJECT.get(id);


    //  * Set the Durable Object metadata using the RpcTarget
    //  * Notice that no await is needed here


    const rpcTarget = stub.setMetaData(id.name ?? "default");


    // Call the Durable Object method using the RpcTarget.
    // The DO identifier is stored in the Durable Object's storage
    const greeting = await rpcTarget.computeMessage("world");


    // Call the Durable Object method that does not use the Durable Object identifier
    const simpleGreeting = await rpcTarget.simpleGreeting("world");


    // Clean up the RpcTarget.
    try {
      (await rpcTarget)[Symbol.dispose]?.();
      console.log("RpcTarget cleaned up.");
    } catch (e) {
      console.error({
        message: "RpcTarget could not be cleaned up.",
        error: String(e),
        errorProperties: e,
      });
    }


    return new Response(greeting, { status: 200 });
  },
} satisfies ExportedHandler<Env>;
```

</page>

<page>
---
title: Testing Durable Objects · Cloudflare Durable Objects docs
description: Write tests for Durable Objects using the Workers Vitest integration.
lastUpdated: 2026-02-02T18:38:11.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/examples/testing-with-durable-objects/
  md: https://developers.cloudflare.com/durable-objects/examples/testing-with-durable-objects/index.md
---

Use the [`@cloudflare/vitest-pool-workers`](https://www.npmjs.com/package/@cloudflare/vitest-pool-workers) package to write tests for your Durable Objects. This integration runs your tests inside the Workers runtime, giving you direct access to Durable Object bindings and APIs.

## Prerequisites

Install Vitest and the Workers Vitest integration as dev dependencies:

* npm

  ```sh
  npm i -D vitest@~3.2.0 @cloudflare/vitest-pool-workers
  ```

* pnpm

  ```sh
  pnpm add -D vitest@~3.2.0 @cloudflare/vitest-pool-workers
  ```

* yarn

  ```sh
  yarn add -D vitest@~3.2.0 @cloudflare/vitest-pool-workers
  ```

## Example Durable Object

This example tests a simple counter Durable Object with SQLite storage:

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  export class Counter extends DurableObject {
    constructor(ctx, env) {
      super(ctx, env);


      ctx.blockConcurrencyWhile(async () => {
        this.ctx.storage.sql.exec(`
          CREATE TABLE IF NOT EXISTS counters (
            name TEXT PRIMARY KEY,
            value INTEGER NOT NULL DEFAULT 0
          )
        `);
      });
    }


    async increment(name = "default") {
      this.ctx.storage.sql.exec(
        `INSERT INTO counters (name, value) VALUES (?, 1)
         ON CONFLICT(name) DO UPDATE SET value = value + 1`,
        name,
      );
      const result = this.ctx.storage.sql
        .exec("SELECT value FROM counters WHERE name = ?", name)
        .one();
      return result.value;
    }


    async getCount(name = "default") {
      const result = this.ctx.storage.sql
        .exec("SELECT value FROM counters WHERE name = ?", name)
        .toArray();
      return result[0]?.value ?? 0;
    }


    async reset(name = "default") {
      this.ctx.storage.sql.exec("DELETE FROM counters WHERE name = ?", name);
    }
  }


  export default {
    async fetch(request, env) {
      const url = new URL(request.url);
      const counterId = url.searchParams.get("id") ?? "default";


      const id = env.COUNTER.idFromName(counterId);
      const stub = env.COUNTER.get(id);


      if (request.method === "POST") {
        const count = await stub.increment();
        return Response.json({ count });
      }


      const count = await stub.getCount();
      return Response.json({ count });
    },
  };
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export interface Env {
    COUNTER: DurableObjectNamespace<Counter>;
  }


  export class Counter extends DurableObject<Env> {
    constructor(ctx: DurableObjectState, env: Env) {
      super(ctx, env);


      ctx.blockConcurrencyWhile(async () => {
        this.ctx.storage.sql.exec(`
          CREATE TABLE IF NOT EXISTS counters (
            name TEXT PRIMARY KEY,
            value INTEGER NOT NULL DEFAULT 0
          )
        `);
      });
    }


    async increment(name: string = "default"): Promise<number> {
      this.ctx.storage.sql.exec(
        `INSERT INTO counters (name, value) VALUES (?, 1)
         ON CONFLICT(name) DO UPDATE SET value = value + 1`,
        name
      );
      const result = this.ctx.storage.sql
        .exec<{ value: number }>("SELECT value FROM counters WHERE name = ?", name)
        .one();
      return result.value;
    }


    async getCount(name: string = "default"): Promise<number> {
      const result = this.ctx.storage.sql
        .exec<{ value: number }>("SELECT value FROM counters WHERE name = ?", name)
        .toArray();
      return result[0]?.value ?? 0;
    }


    async reset(name: string = "default"): Promise<void> {
      this.ctx.storage.sql.exec("DELETE FROM counters WHERE name = ?", name);
    }
  }


  export default {
    async fetch(request: Request, env: Env): Promise<Response> {
      const url = new URL(request.url);
      const counterId = url.searchParams.get("id") ?? "default";


      const id = env.COUNTER.idFromName(counterId);
      const stub = env.COUNTER.get(id);


      if (request.method === "POST") {
        const count = await stub.increment();
        return Response.json({ count });
      }


      const count = await stub.getCount();
      return Response.json({ count });
    },
  };
  ```

## Configure Vitest

Create a `vitest.config.ts` file that uses `defineWorkersConfig`:

```ts
import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";


export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.jsonc" },
      },
    },
  },
});
```

Make sure your Wrangler configuration includes the Durable Object binding and SQLite migration:

* wrangler.jsonc

  ```jsonc
  {
    "name": "counter-worker",
    "main": "src/index.ts",
    "compatibility_date": "2026-02-10",
    "durable_objects": {
      "bindings": [
        { "name": "COUNTER", "class_name": "Counter" }
      ]
    },
    "migrations": [
      { "tag": "v1", "new_sqlite_classes": ["Counter"] }
    ]
  }
  ```

* wrangler.toml

  ```toml
  name = "counter-worker"
  main = "src/index.ts"
  compatibility_date = "2026-02-10"


  [[durable_objects.bindings]]
  name = "COUNTER"
  class_name = "Counter"


  [[migrations]]
  tag = "v1"
  new_sqlite_classes = [ "Counter" ]
  ```

## Define types for tests

Create a `test/tsconfig.json` to configure TypeScript for your tests:

```jsonc
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "moduleResolution": "bundler",
    "types": ["@cloudflare/vitest-pool-workers"]
  },
  "include": ["./**/*.ts", "../src/worker-configuration.d.ts"]
}
```

Create an `env.d.ts` file to type the test environment:

```ts
declare module "cloudflare:test" {
  interface ProvidedEnv extends Env {}
}
```

## Writing tests

### Unit tests with direct Durable Object access

You can get a stub to a Durable Object directly from the `env` object provided by `cloudflare:test`:

* JavaScript

  ```js
  import { env } from "cloudflare:test";
  import { describe, it, expect, beforeEach } from "vitest";


  describe("Counter Durable Object", () => {
    // Each test gets isolated storage automatically
    it("should increment the counter", async () => {
      const id = env.COUNTER.idFromName("test-counter");
      const stub = env.COUNTER.get(id);


      // Call RPC methods directly on the stub
      const count1 = await stub.increment();
      expect(count1).toBe(1);


      const count2 = await stub.increment();
      expect(count2).toBe(2);


      const count3 = await stub.increment();
      expect(count3).toBe(3);
    });


    it("should track separate counters independently", async () => {
      const id = env.COUNTER.idFromName("test-counter");
      const stub = env.COUNTER.get(id);


      await stub.increment("counter-a");
      await stub.increment("counter-a");
      await stub.increment("counter-b");


      expect(await stub.getCount("counter-a")).toBe(2);
      expect(await stub.getCount("counter-b")).toBe(1);
      expect(await stub.getCount("counter-c")).toBe(0);
    });


    it("should reset a counter", async () => {
      const id = env.COUNTER.idFromName("test-counter");
      const stub = env.COUNTER.get(id);


      await stub.increment("my-counter");
      await stub.increment("my-counter");
      expect(await stub.getCount("my-counter")).toBe(2);


      await stub.reset("my-counter");
      expect(await stub.getCount("my-counter")).toBe(0);
    });


    it("should isolate different Durable Object instances", async () => {
      const id1 = env.COUNTER.idFromName("counter-1");
      const id2 = env.COUNTER.idFromName("counter-2");


      const stub1 = env.COUNTER.get(id1);
      const stub2 = env.COUNTER.get(id2);


      await stub1.increment();
      await stub1.increment();
      await stub2.increment();


      // Each Durable Object instance has its own storage
      expect(await stub1.getCount()).toBe(2);
      expect(await stub2.getCount()).toBe(1);
    });
  });
  ```

* TypeScript

  ```ts
  import { env } from "cloudflare:test";
  import { describe, it, expect, beforeEach } from "vitest";


  describe("Counter Durable Object", () => {
    // Each test gets isolated storage automatically
    it("should increment the counter", async () => {
      const id = env.COUNTER.idFromName("test-counter");
      const stub = env.COUNTER.get(id);


      // Call RPC methods directly on the stub
      const count1 = await stub.increment();
      expect(count1).toBe(1);


      const count2 = await stub.increment();
      expect(count2).toBe(2);


      const count3 = await stub.increment();
      expect(count3).toBe(3);
    });


    it("should track separate counters independently", async () => {
      const id = env.COUNTER.idFromName("test-counter");
      const stub = env.COUNTER.get(id);


      await stub.increment("counter-a");
      await stub.increment("counter-a");
      await stub.increment("counter-b");


      expect(await stub.getCount("counter-a")).toBe(2);
      expect(await stub.getCount("counter-b")).toBe(1);
      expect(await stub.getCount("counter-c")).toBe(0);
    });


    it("should reset a counter", async () => {
      const id = env.COUNTER.idFromName("test-counter");
      const stub = env.COUNTER.get(id);


      await stub.increment("my-counter");
      await stub.increment("my-counter");
      expect(await stub.getCount("my-counter")).toBe(2);


      await stub.reset("my-counter");
      expect(await stub.getCount("my-counter")).toBe(0);
    });


    it("should isolate different Durable Object instances", async () => {
      const id1 = env.COUNTER.idFromName("counter-1");
      const id2 = env.COUNTER.idFromName("counter-2");


      const stub1 = env.COUNTER.get(id1);
      const stub2 = env.COUNTER.get(id2);


      await stub1.increment();
      await stub1.increment();
      await stub2.increment();


      // Each Durable Object instance has its own storage
      expect(await stub1.getCount()).toBe(2);
      expect(await stub2.getCount()).toBe(1);
    });
  });
  ```

### Integration tests with SELF

Use the `SELF` fetcher to test your Worker's HTTP handler, which routes requests to Durable Objects:

* JavaScript

  ```js
  import { SELF } from "cloudflare:test";
  import { describe, it, expect } from "vitest";


  describe("Counter Worker integration", () => {
    it("should increment via HTTP POST", async () => {
      const response = await SELF.fetch("http://example.com?id=http-test", {
        method: "POST",
      });


      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.count).toBe(1);
    });


    it("should get count via HTTP GET", async () => {
      // First increment the counter
      await SELF.fetch("http://example.com?id=get-test", { method: "POST" });
      await SELF.fetch("http://example.com?id=get-test", { method: "POST" });


      // Then get the count
      const response = await SELF.fetch("http://example.com?id=get-test");
      const data = await response.json();
      expect(data.count).toBe(2);
    });


    it("should use different counters for different IDs", async () => {
      await SELF.fetch("http://example.com?id=counter-a", { method: "POST" });
      await SELF.fetch("http://example.com?id=counter-a", { method: "POST" });
      await SELF.fetch("http://example.com?id=counter-b", { method: "POST" });


      const responseA = await SELF.fetch("http://example.com?id=counter-a");
      const responseB = await SELF.fetch("http://example.com?id=counter-b");


      const dataA = await responseA.json();
      const dataB = await responseB.json();


      expect(dataA.count).toBe(2);
      expect(dataB.count).toBe(1);
    });
  });
  ```

* TypeScript

  ```ts
  import { SELF } from "cloudflare:test";
  import { describe, it, expect } from "vitest";


  describe("Counter Worker integration", () => {
    it("should increment via HTTP POST", async () => {
      const response = await SELF.fetch("http://example.com?id=http-test", {
        method: "POST",
      });


      expect(response.status).toBe(200);
      const data = await response.json<{ count: number }>();
      expect(data.count).toBe(1);
    });


    it("should get count via HTTP GET", async () => {
      // First increment the counter
      await SELF.fetch("http://example.com?id=get-test", { method: "POST" });
      await SELF.fetch("http://example.com?id=get-test", { method: "POST" });


      // Then get the count
      const response = await SELF.fetch("http://example.com?id=get-test");
      const data = await response.json<{ count: number }>();
      expect(data.count).toBe(2);
    });


    it("should use different counters for different IDs", async () => {
      await SELF.fetch("http://example.com?id=counter-a", { method: "POST" });
      await SELF.fetch("http://example.com?id=counter-a", { method: "POST" });
      await SELF.fetch("http://example.com?id=counter-b", { method: "POST" });


      const responseA = await SELF.fetch("http://example.com?id=counter-a");
      const responseB = await SELF.fetch("http://example.com?id=counter-b");


      const dataA = await responseA.json<{ count: number }>();
      const dataB = await responseB.json<{ count: number }>();


      expect(dataA.count).toBe(2);
      expect(dataB.count).toBe(1);
    });
  });
  ```

### Direct access to Durable Object internals

Use `runInDurableObject()` to access instance properties and storage directly. This is useful for verifying internal state or testing private methods:

* JavaScript

  ```js
  import { env, runInDurableObject, listDurableObjectIds } from "cloudflare:test";
  import { describe, it, expect } from "vitest";
  import { Counter } from "../src";


  describe("Direct Durable Object access", () => {
    it("can access instance internals and storage", async () => {
      const id = env.COUNTER.idFromName("direct-test");
      const stub = env.COUNTER.get(id);


      // First, interact normally via RPC
      await stub.increment();
      await stub.increment();


      // Then use runInDurableObject to inspect internals
      await runInDurableObject(stub, async (instance, state) => {
        // Access the exact same class instance
        expect(instance).toBeInstanceOf(Counter);


        // Access storage directly for verification
        const result = state.storage.sql
          .exec("SELECT value FROM counters WHERE name = ?", "default")
          .one();
        expect(result.value).toBe(2);
      });
    });


    it("can list all Durable Object IDs in a namespace", async () => {
      // Create some Durable Objects
      const id1 = env.COUNTER.idFromName("list-test-1");
      const id2 = env.COUNTER.idFromName("list-test-2");


      await env.COUNTER.get(id1).increment();
      await env.COUNTER.get(id2).increment();


      // List all IDs in the namespace
      const ids = await listDurableObjectIds(env.COUNTER);
      expect(ids.length).toBe(2);
      expect(ids.some((id) => id.equals(id1))).toBe(true);
      expect(ids.some((id) => id.equals(id2))).toBe(true);
    });
  });
  ```

* TypeScript

  ```ts
  import {
    env,
    runInDurableObject,
    listDurableObjectIds,
  } from "cloudflare:test";
  import { describe, it, expect } from "vitest";
  import { Counter } from "../src";


  describe("Direct Durable Object access", () => {
    it("can access instance internals and storage", async () => {
      const id = env.COUNTER.idFromName("direct-test");
      const stub = env.COUNTER.get(id);


      // First, interact normally via RPC
      await stub.increment();
      await stub.increment();


      // Then use runInDurableObject to inspect internals
      await runInDurableObject(stub, async (instance: Counter, state) => {
        // Access the exact same class instance
        expect(instance).toBeInstanceOf(Counter);


        // Access storage directly for verification
        const result = state.storage.sql
          .exec<{ value: number }>(
            "SELECT value FROM counters WHERE name = ?",
            "default"
          )
          .one();
        expect(result.value).toBe(2);
      });
    });


    it("can list all Durable Object IDs in a namespace", async () => {
      // Create some Durable Objects
      const id1 = env.COUNTER.idFromName("list-test-1");
      const id2 = env.COUNTER.idFromName("list-test-2");


      await env.COUNTER.get(id1).increment();
      await env.COUNTER.get(id2).increment();


      // List all IDs in the namespace
      const ids = await listDurableObjectIds(env.COUNTER);
      expect(ids.length).toBe(2);
      expect(ids.some((id) => id.equals(id1))).toBe(true);
      expect(ids.some((id) => id.equals(id2))).toBe(true);
    });
  });
  ```

### Test isolation

Each test automatically gets isolated storage. Durable Objects created in one test do not affect other tests:

* JavaScript

  ```js
  import { env, listDurableObjectIds } from "cloudflare:test";
  import { describe, it, expect } from "vitest";


  describe("Test isolation", () => {
    it("first test: creates a Durable Object", async () => {
      const id = env.COUNTER.idFromName("isolated-counter");
      const stub = env.COUNTER.get(id);


      await stub.increment();
      await stub.increment();
      expect(await stub.getCount()).toBe(2);
    });


    it("second test: previous Durable Object does not exist", async () => {
      // The Durable Object from the previous test is automatically cleaned up
      const ids = await listDurableObjectIds(env.COUNTER);
      expect(ids.length).toBe(0);


      // Creating the same ID gives a fresh instance
      const id = env.COUNTER.idFromName("isolated-counter");
      const stub = env.COUNTER.get(id);
      expect(await stub.getCount()).toBe(0);
    });
  });
  ```

* TypeScript

  ```ts
  import { env, listDurableObjectIds } from "cloudflare:test";
  import { describe, it, expect } from "vitest";


  describe("Test isolation", () => {
    it("first test: creates a Durable Object", async () => {
      const id = env.COUNTER.idFromName("isolated-counter");
      const stub = env.COUNTER.get(id);


      await stub.increment();
      await stub.increment();
      expect(await stub.getCount()).toBe(2);
    });


    it("second test: previous Durable Object does not exist", async () => {
      // The Durable Object from the previous test is automatically cleaned up
      const ids = await listDurableObjectIds(env.COUNTER);
      expect(ids.length).toBe(0);


      // Creating the same ID gives a fresh instance
      const id = env.COUNTER.idFromName("isolated-counter");
      const stub = env.COUNTER.get(id);
      expect(await stub.getCount()).toBe(0);
    });
  });
  ```

### Testing SQLite storage

SQLite-backed Durable Objects work seamlessly in tests. The SQL API is available when your Durable Object class is configured with `new_sqlite_classes` in your Wrangler configuration:

* JavaScript

  ```js
  import { env, runInDurableObject } from "cloudflare:test";
  import { describe, it, expect } from "vitest";


  describe("SQLite in Durable Objects", () => {
    it("can query and verify SQLite storage", async () => {
      const id = env.COUNTER.idFromName("sqlite-test");
      const stub = env.COUNTER.get(id);


      // Increment the counter a few times via RPC
      await stub.increment("page-views");
      await stub.increment("page-views");
      await stub.increment("api-calls");


      // Verify the data directly in SQLite
      await runInDurableObject(stub, async (instance, state) => {
        // Query the database directly
        const rows = state.storage.sql
          .exec("SELECT name, value FROM counters ORDER BY name")
          .toArray();


        expect(rows).toEqual([
          { name: "api-calls", value: 1 },
          { name: "page-views", value: 2 },
        ]);


        // Check database size is non-zero
        expect(state.storage.sql.databaseSize).toBeGreaterThan(0);
      });
    });
  });
  ```

* TypeScript

  ```ts
  import { env, runInDurableObject } from "cloudflare:test";
  import { describe, it, expect } from "vitest";


  describe("SQLite in Durable Objects", () => {
    it("can query and verify SQLite storage", async () => {
      const id = env.COUNTER.idFromName("sqlite-test");
      const stub = env.COUNTER.get(id);


      // Increment the counter a few times via RPC
      await stub.increment("page-views");
      await stub.increment("page-views");
      await stub.increment("api-calls");


      // Verify the data directly in SQLite
      await runInDurableObject(stub, async (instance, state) => {
        // Query the database directly
        const rows = state.storage.sql
          .exec<{ name: string; value: number }>("SELECT name, value FROM counters ORDER BY name")
          .toArray();


        expect(rows).toEqual([
          { name: "api-calls", value: 1 },
          { name: "page-views", value: 2 },
        ]);


        // Check database size is non-zero
        expect(state.storage.sql.databaseSize).toBeGreaterThan(0);
      });
    });
  });
  ```

### Testing alarms

Use `runDurableObjectAlarm()` to immediately trigger a scheduled alarm without waiting for the timer. This allows you to test alarm handlers synchronously:

* JavaScript

  ```js
  import {
    env,
    runInDurableObject,
    runDurableObjectAlarm,
  } from "cloudflare:test";
  import { describe, it, expect } from "vitest";
  import { Counter } from "../src";


  describe("Durable Object alarms", () => {
    it("can trigger alarms immediately", async () => {
      const id = env.COUNTER.idFromName("alarm-test");
      const stub = env.COUNTER.get(id);


      // Increment counter and schedule a reset alarm
      await stub.increment();
      await stub.increment();
      expect(await stub.getCount()).toBe(2);


      // Schedule an alarm (in a real app, this might be hours in the future)
      await runInDurableObject(stub, async (instance, state) => {
        await state.storage.setAlarm(Date.now() + 60_000); // 1 minute from now
      });


      // Immediately execute the alarm without waiting
      const alarmRan = await runDurableObjectAlarm(stub);
      expect(alarmRan).toBe(true); // Alarm was scheduled and executed


      // Verify the alarm handler ran (assuming it resets the counter)
      // Note: You'll need an alarm() method in your Durable Object that handles resets
      // expect(await stub.getCount()).toBe(0);


      // Trying to run the alarm again returns false (no alarm scheduled)
      const alarmRanAgain = await runDurableObjectAlarm(stub);
      expect(alarmRanAgain).toBe(false);
    });
  });
  ```

* TypeScript

  ```ts
  import {
    env,
    runInDurableObject,
    runDurableObjectAlarm,
  } from "cloudflare:test";
  import { describe, it, expect } from "vitest";
  import { Counter } from "../src";


  describe("Durable Object alarms", () => {
    it("can trigger alarms immediately", async () => {
      const id = env.COUNTER.idFromName("alarm-test");
      const stub = env.COUNTER.get(id);


      // Increment counter and schedule a reset alarm
      await stub.increment();
      await stub.increment();
      expect(await stub.getCount()).toBe(2);


      // Schedule an alarm (in a real app, this might be hours in the future)
      await runInDurableObject(stub, async (instance, state) => {
        await state.storage.setAlarm(Date.now() + 60_000); // 1 minute from now
      });


      // Immediately execute the alarm without waiting
      const alarmRan = await runDurableObjectAlarm(stub);
      expect(alarmRan).toBe(true); // Alarm was scheduled and executed


      // Verify the alarm handler ran (assuming it resets the counter)
      // Note: You'll need an alarm() method in your Durable Object that handles resets
      // expect(await stub.getCount()).toBe(0);


      // Trying to run the alarm again returns false (no alarm scheduled)
      const alarmRanAgain = await runDurableObjectAlarm(stub);
      expect(alarmRanAgain).toBe(false);
    });
  });
  ```

To test alarms, add an `alarm()` method to your Durable Object:

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  export class Counter extends DurableObject {
    // ... other methods ...


    async alarm() {
      // This method is called when the alarm fires
      // Reset all counters
      this.ctx.storage.sql.exec("DELETE FROM counters");
    }


    async scheduleReset(afterMs) {
      await this.ctx.storage.setAlarm(Date.now() + afterMs);
    }
  }
  ```

* TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  export class Counter extends DurableObject {
    // ... other methods ...


    async alarm() {
      // This method is called when the alarm fires
      // Reset all counters
      this.ctx.storage.sql.exec("DELETE FROM counters");
    }


    async scheduleReset(afterMs: number) {
      await this.ctx.storage.setAlarm(Date.now() + afterMs);
    }
  }
  ```

## Running tests

Run your tests with:

```sh
npx vitest
```

Or add a script to your `package.json`:

```json
{
  "scripts": {
    "test": "vitest"
  }
}
```

## Related resources

* [Workers Vitest integration](https://developers.cloudflare.com/workers/testing/vitest-integration/) - Full documentation for the Vitest integration
* [Durable Objects testing recipe](https://github.com/cloudflare/workers-sdk/tree/main/fixtures/vitest-pool-workers-examples/durable-objects) - Example from the Workers SDK
* [RPC testing recipe](https://github.com/cloudflare/workers-sdk/tree/main/fixtures/vitest-pool-workers-examples/rpc) - Testing JSRPC with Durable Objects

</page>

<page>
---
title: Durable Objects - Use KV within Durable Objects · Cloudflare Durable
  Objects docs
description: Read and write to/from KV within a Durable Object
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/examples/use-kv-from-durable-objects/
  md: https://developers.cloudflare.com/durable-objects/examples/use-kv-from-durable-objects/index.md
---

The following Worker script shows you how to configure a Durable Object to read from and/or write to a [Workers KV namespace](https://developers.cloudflare.com/kv/concepts/how-kv-works/). This is useful when using a Durable Object to coordinate between multiple clients, and allows you to serialize writes to KV and/or broadcast a single read from KV to hundreds or thousands of clients connected to a single Durable Object [using WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/).

Prerequisites:

* A [KV namespace](https://developers.cloudflare.com/kv/api/) created via the Cloudflare dashboard or the [wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/).
* A [configured binding](https://developers.cloudflare.com/kv/concepts/kv-bindings/) for the `kv_namespace` in the Cloudflare dashboard or Wrangler file.
* A [Durable Object namespace binding](https://developers.cloudflare.com/workers/wrangler/configuration/#durable-objects).

Configure your Wrangler file as follows:

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "my-worker",
    "main": "src/index.ts",
    "kv_namespaces": [
      {
        "binding": "YOUR_KV_NAMESPACE",
        "id": "<id_of_your_namespace>"
      }
    ],
    "durable_objects": {
      "bindings": [
        {
          "name": "YOUR_DO_CLASS",
          "class_name": "YourDurableObject"
        }
      ]
    }
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "my-worker"
  main = "src/index.ts"


  [[kv_namespaces]]
  binding = "YOUR_KV_NAMESPACE"
  id = "<id_of_your_namespace>"


  [[durable_objects.bindings]]
  name = "YOUR_DO_CLASS"
  class_name = "YourDurableObject"
  ```

- TypeScript

  ```ts
  import { DurableObject } from "cloudflare:workers";


  interface Env {
    YOUR_KV_NAMESPACE: KVNamespace;
    YOUR_DO_CLASS: DurableObjectNamespace;
  }


  export default {
    async fetch(req: Request, env: Env): Promise<Response> {
      // Assume each Durable Object is mapped to a roomId in a query parameter
      // In a production application, this will likely be a roomId defined by your application
      // that you validate (and/or authenticate) first.
      let url = new URL(req.url);
      let roomIdParam = url.searchParams.get("roomId");


      if (roomIdParam) {
        // Get a stub that allows you to call that Durable Object
        let durableObjectStub = env.YOUR_DO_CLASS.getByName(roomIdParam);


        // Pass the request to that Durable Object and await the response
        // This invokes the constructor once on your Durable Object class (defined further down)
        // on the first initialization, and the fetch method on each request.
        //
        // You could pass the original Request to the Durable Object's fetch method
        // or a simpler URL with just the roomId.
        let response = await durableObjectStub.fetch(`http://do/${roomId}`);


        // This would return the value you read from KV *within* the Durable Object.
        return response;
      }
    },
  };


  export class YourDurableObject extends DurableObject {
    constructor(
      public state: DurableObjectState,
      env: Env,
    ) {
      super(state, env);
    }


    async fetch(request: Request) {
      // Error handling elided for brevity.
      // Write to KV
      await this.env.YOUR_KV_NAMESPACE.put("some-key");


      // Fetch from KV
      let val = await this.env.YOUR_KV_NAMESPACE.get("some-other-key");


      return Response.json(val);
    }
  }
  ```

- Python

  ```py
  from workers import DurableObject, Response, WorkerEntrypoint
  from urllib.parse import urlparse, parse_qs


  class Default(WorkerEntrypoint):
    async def fetch(self, req):
      # Assume each Durable Object is mapped to a roomId in a query parameter
      # In a production application, this will likely be a roomId defined by your application
      # that you validate (and/or authenticate) first.
      url = req.url
      parsed_url = urlparse(url)
      room_id_param = parse_qs(parsed_url.query).get('roomId', [None])[0]


      if room_id_param:
        # Get a stub that allows you to call that Durable Object
        durable_object_stub = self.env.YOUR_DO_CLASS.getByName(room_id_param)


        # Pass the request to that Durable Object and await the response
        # This invokes the constructor once on your Durable Object class (defined further down)
        # on the first initialization, and the fetch method on each request.
        #
        # You could pass the original Request to the Durable Object's fetch method
        # or a simpler URL with just the roomId.
        response = await durable_object_stub.fetch(f"http://do/{room_id_param}")


        # This would return the value you read from KV *within* the Durable Object.
        return response


  class YourDurableObject(DurableObject):
    def __init__(self, state, env):
      super().__init__(state, env)


    async def fetch(self, request):
      # Error handling elided for brevity.
      # Write to KV
      await self.env.YOUR_KV_NAMESPACE.put("some-key", "some-value")


      # Fetch from KV
      val = await self.env.YOUR_KV_NAMESPACE.get("some-other-key")


      return Response.json(val)
  ```

</page>

<page>
---
title: Build a WebSocket server · Cloudflare Durable Objects docs
description: Build a WebSocket server using Durable Objects and Workers.
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
tags: WebSockets
source_url:
  html: https://developers.cloudflare.com/durable-objects/examples/websocket-server/
  md: https://developers.cloudflare.com/durable-objects/examples/websocket-server/index.md
---

This example shows how to build a WebSocket server using Durable Objects and Workers. The example exposes an endpoint to create a new WebSocket connection. This WebSocket connection echos any message while including the total number of WebSocket connections currently established. For more information, refer to [Use Durable Objects with WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/).

Warning

WebSocket connections pin your Durable Object to memory, and so duration charges will be incurred so long as the WebSocket is connected (regardless of activity). To avoid duration charges during periods of inactivity, use the [WebSocket Hibernation API](https://developers.cloudflare.com/durable-objects/examples/websocket-hibernation-server/), which only charges for duration when JavaScript is actively executing.

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  // Worker
  export default {
    async fetch(request, env, ctx) {
      if (request.url.endsWith("/websocket")) {
        // Expect to receive a WebSocket Upgrade request.
        // If there is one, accept the request and return a WebSocket Response.
        const upgradeHeader = request.headers.get("Upgrade");
        if (!upgradeHeader || upgradeHeader !== "websocket") {
          return new Response("Worker expected Upgrade: websocket", {
            status: 426,
          });
        }


        if (request.method !== "GET") {
          return new Response("Worker expected GET method", {
            status: 400,
          });
        }


        // Since we are hard coding the Durable Object ID by providing the constant name 'foo',
        // all requests to this Worker will be sent to the same Durable Object instance.
        let id = env.WEBSOCKET_SERVER.idFromName("foo");
        let stub = env.WEBSOCKET_SERVER.get(id);


        return stub.fetch(request);
      }


      return new Response(
        `Supported endpoints:
  /websocket: Expects a WebSocket upgrade request`,
        {
          status: 200,
          headers: {
            "Content-Type": "text/plain",
          },
        },
      );
    },
  };


  // Durable Object
  export class WebSocketServer extends DurableObject {
    // Keeps track of all WebSocket connections
    sessions;


    constructor(ctx, env) {
      super(ctx, env);
      this.sessions = new Map();
    }


    async fetch(request) {
      // Creates two ends of a WebSocket connection.
      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);


      // Calling `accept()` tells the runtime that this WebSocket is to begin terminating
      // request within the Durable Object. It has the effect of "accepting" the connection,
      // and allowing the WebSocket to send and receive messages.
      server.accept();


      // Generate a random UUID for the session.
      const id = crypto.randomUUID();
      // Add the WebSocket connection to the map of active sessions.
      this.sessions.set(server, { id });


      server.addEventListener("message", (event) => {
        this.handleWebSocketMessage(server, event.data);
      });


      // If the client closes the connection, the runtime will close the connection too.
      server.addEventListener("close", () => {
        this.handleConnectionClose(server);
      });


      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }


    async handleWebSocketMessage(ws, message) {
      const connection = this.sessions.get(ws);


      // Reply back with the same message to the connection
      ws.send(
        `[Durable Object] message: ${message}, from: ${connection.id}, to: the initiating client. Total connections: ${this.sessions.size}`,
      );


      // Broadcast the message to all the connections,
      // except the one that sent the message.
      this.sessions.forEach((_, session) => {
        if (session !== ws) {
          session.send(
            `[Durable Object] message: ${message}, from: ${connection.id}, to: all clients except the initiating client. Total connections: ${this.sessions.size}`,
          );
        }
      });


      // Broadcast the message to all the connections,
      // including the one that sent the message.
      this.sessions.forEach((_, session) => {
        session.send(
          `[Durable Object] message: ${message}, from: ${connection.id}, to: all clients. Total connections: ${this.sessions.size}`,
        );
      });
    }


    async handleConnectionClose(ws) {
      this.sessions.delete(ws);
      ws.close(1000, "Durable Object is closing WebSocket");
    }
  }
  ```

* TypeScript

  ```ts
  import { DurableObject } from 'cloudflare:workers';


  // Worker
  export default {
      async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
          if (request.url.endsWith('/websocket')) {
              // Expect to receive a WebSocket Upgrade request.
              // If there is one, accept the request and return a WebSocket Response.
              const upgradeHeader = request.headers.get('Upgrade');
              if (!upgradeHeader || upgradeHeader !== 'websocket') {
                  return new Response('Worker expected Upgrade: websocket', {
                      status: 426,
                  });
              }


              if (request.method !== 'GET') {
                  return new Response('Worker expected GET method', {
                      status: 400,
                  });
              }


              // Since we are hard coding the Durable Object ID by providing the constant name 'foo',
              // all requests to this Worker will be sent to the same Durable Object instance.
              let id = env.WEBSOCKET_SERVER.idFromName('foo');
              let stub = env.WEBSOCKET_SERVER.get(id);


              return stub.fetch(request);
          }


          return new Response(
              `Supported endpoints:
  /websocket: Expects a WebSocket upgrade request`,
              {
                  status: 200,
                  headers: {
                      'Content-Type': 'text/plain',
                  },
              }
          );
      },
  };


  // Durable Object
  export class WebSocketServer extends DurableObject {
      // Keeps track of all WebSocket connections
      sessions: Map<WebSocket, { [key: string]: string }>;


      constructor(ctx: DurableObjectState, env: Env) {
          super(ctx, env);
          this.sessions = new Map();
      }


      async fetch(request: Request): Promise<Response> {
          // Creates two ends of a WebSocket connection.
          const webSocketPair = new WebSocketPair();
          const [client, server] = Object.values(webSocketPair);


          // Calling `accept()` tells the runtime that this WebSocket is to begin terminating
          // request within the Durable Object. It has the effect of "accepting" the connection,
          // and allowing the WebSocket to send and receive messages.
          server.accept();


          // Generate a random UUID for the session.
          const id = crypto.randomUUID();
          // Add the WebSocket connection to the map of active sessions.
          this.sessions.set(server, { id });


          server.addEventListener('message', (event) => {
              this.handleWebSocketMessage(server, event.data);
          });


          // If the client closes the connection, the runtime will close the connection too.
          server.addEventListener('close', () => {
              this.handleConnectionClose(server);
          });


          return new Response(null, {
              status: 101,
              webSocket: client,
          });
      }


      async handleWebSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
          const connection = this.sessions.get(ws)!;


          // Reply back with the same message to the connection
          ws.send(`[Durable Object] message: ${message}, from: ${connection.id}, to: the initiating client. Total connections: ${this.sessions.size}`);


          // Broadcast the message to all the connections,
          // except the one that sent the message.
          this.sessions.forEach((_, session) => {
              if (session !== ws) {
                  session.send(`[Durable Object] message: ${message}, from: ${connection.id}, to: all clients except the initiating client. Total connections: ${this.sessions.size}`);
              }
          });


          // Broadcast the message to all the connections,
          // including the one that sent the message.
          this.sessions.forEach((_, session) => {
              session.send(`[Durable Object] message: ${message}, from: ${connection.id}, to: all clients. Total connections: ${this.sessions.size}`);
          });
      }


      async handleConnectionClose(ws: WebSocket) {
          this.sessions.delete(ws);
          ws.close(1000, 'Durable Object is closing WebSocket');
      }
  }
  ```

* Python

  ```py
  from workers import DurableObject, Response, WorkerEntrypoint
  from js import WebSocketPair
  from pyodide.ffi import create_proxy
  import uuid


  class Session:
    def __init__(self, *, ws):
      self.ws = ws


  # Worker
  class Default(WorkerEntrypoint):
    async def fetch(self, request):
      if request.url.endswith('/websocket'):
        # Expect to receive a WebSocket Upgrade request.
        # If there is one, accept the request and return a WebSocket Response.
        upgrade_header = request.headers.get('Upgrade')
        if not upgrade_header or upgrade_header != 'websocket':
          return Response('Worker expected Upgrade: websocket', status=426)


        if request.method != 'GET':
          return Response('Worker expected GET method', status=400)


        # Since we are hard coding the Durable Object ID by providing the constant name 'foo',
        # all requests to this Worker will be sent to the same Durable Object instance.
        id = self.env.WEBSOCKET_SERVER.idFromName('foo')
        stub = self.env.WEBSOCKET_SERVER.get(id)


        return await stub.fetch(request)


      return Response(
        """Supported endpoints:
  /websocket: Expects a WebSocket upgrade request""",
        status=200,
        headers={'Content-Type': 'text/plain'}
      )


  # Durable Object
  class WebSocketServer(DurableObject):
    def __init__(self, ctx, env):
      super().__init__(ctx, env)
      # Keeps track of all WebSocket connections, keyed by session ID
      self.sessions = {}


    async def fetch(self, request):
      # Creates two ends of a WebSocket connection.
      client, server = WebSocketPair.new().object_values()


      # Calling `accept()` tells the runtime that this WebSocket is to begin terminating
      # request within the Durable Object. It has the effect of "accepting" the connection,
      # and allowing the WebSocket to send and receive messages.
      server.accept()


      # Generate a random UUID for the session.
      id = str(uuid.uuid4())


      # Create proxies for event handlers (must be destroyed when socket closes)
      async def on_message(event):
        await self.handleWebSocketMessage(id, event.data)


      message_proxy = create_proxy(on_message)
      server.addEventListener('message', message_proxy)


      # If the client closes the connection, the runtime will close the connection too.
      async def on_close(event):
        await self.handleConnectionClose(id)
        # Clean up proxies
        message_proxy.destroy()
        close_proxy.destroy()


      close_proxy = create_proxy(on_close)
      server.addEventListener('close', close_proxy)


      # Add the WebSocket connection to the map of active sessions, keyed by session ID.
      self.sessions[id] = Session(ws=server)


      return Response(None, status=101, web_socket=client)


    async def handleWebSocketMessage(self, session_id, message):
      session = self.sessions[session_id]


      # Reply back with the same message to the connection
      session.ws.send(f"[Durable Object] message: {message}, from: {session_id}, to: the initiating client. Total connections: {len(self.sessions)}")


      # Broadcast the message to all the connections,
      # except the one that sent the message.
      for id, conn in self.sessions.items():
        if id != session_id:
          conn.ws.send(f"[Durable Object] message: {message}, from: {session_id}, to: all clients except the initiating client. Total connections: {len(self.sessions)}")


      # Broadcast the message to all the connections,
      # including the one that sent the message.
      for id, conn in self.sessions.items():
        conn.ws.send(f"[Durable Object] message: {message}, from: {session_id}, to: all clients. Total connections: {len(self.sessions)}")


    async def handleConnectionClose(self, session_id):
      session = self.sessions.pop(session_id, None)
      if session:
        session.ws.close(1000, 'Durable Object is closing WebSocket')
  ```

Finally, configure your Wrangler file to include a Durable Object [binding](https://developers.cloudflare.com/durable-objects/get-started/#4-configure-durable-object-bindings) and [migration](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/) based on the namespace and class name chosen previously.

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "websocket-server",
    "main": "src/index.ts",
    "durable_objects": {
      "bindings": [
        {
          "name": "WEBSOCKET_SERVER",
          "class_name": "WebSocketServer"
        }
      ]
    },
    "migrations": [
      {
        "tag": "v1",
        "new_sqlite_classes": [
          "WebSocketServer"
        ]
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "websocket-server"
  main = "src/index.ts"


  [[durable_objects.bindings]]
  name = "WEBSOCKET_SERVER"
  class_name = "WebSocketServer"


  [[migrations]]
  tag = "v1"
  new_sqlite_classes = [ "WebSocketServer" ]
  ```

### Related resources

* [Durable Objects: Edge Chat Demo](https://github.com/cloudflare/workers-chat-demo).

</page>

<page>
---
title: Build a WebSocket server with WebSocket Hibernation · Cloudflare Durable
  Objects docs
description: Build a WebSocket server using WebSocket Hibernation on Durable
  Objects and Workers.
lastUpdated: 2026-01-29T15:36:19.000Z
chatbotDeprioritize: false
tags: WebSockets
source_url:
  html: https://developers.cloudflare.com/durable-objects/examples/websocket-hibernation-server/
  md: https://developers.cloudflare.com/durable-objects/examples/websocket-hibernation-server/index.md
---

This example is similar to the [Build a WebSocket server](https://developers.cloudflare.com/durable-objects/examples/websocket-server/) example, but uses the WebSocket Hibernation API. The WebSocket Hibernation API should be preferred for WebSocket server applications built on Durable Objects, since it significantly decreases duration charge, and provides additional features that pair well with WebSocket applications. For more information, refer to [Use Durable Objects with WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/).

Note

WebSocket Hibernation is unavailable for outgoing WebSocket use cases. Hibernation is only supported when the Durable Object acts as a server. For use cases where outgoing WebSockets are required, refer to [Write a WebSocket client](https://developers.cloudflare.com/workers/examples/websockets/#write-a-websocket-client).

* JavaScript

  ```js
  import { DurableObject } from "cloudflare:workers";


  // Worker
  export default {
    async fetch(request, env, ctx) {
      if (request.url.endsWith("/websocket")) {
        // Expect to receive a WebSocket Upgrade request.
        // If there is one, accept the request and return a WebSocket Response.
        const upgradeHeader = request.headers.get("Upgrade");
        if (!upgradeHeader || upgradeHeader !== "websocket") {
          return new Response("Worker expected Upgrade: websocket", {
            status: 426,
          });
        }


        if (request.method !== "GET") {
          return new Response("Worker expected GET method", {
            status: 400,
          });
        }


        // Since we are hard coding the Durable Object ID by providing the constant name 'foo',
        // all requests to this Worker will be sent to the same Durable Object instance.
        let stub = env.WEBSOCKET_HIBERNATION_SERVER.getByName("foo");


        return stub.fetch(request);
      }


      return new Response(
        `Supported endpoints:
  /websocket: Expects a WebSocket upgrade request`,
        {
          status: 200,
          headers: {
            "Content-Type": "text/plain",
          },
        },
      );
    },
  };


  // Durable Object
  export class WebSocketHibernationServer extends DurableObject {
    // Keeps track of all WebSocket connections
    // When the DO hibernates, gets reconstructed in the constructor
    sessions;


    constructor(ctx, env) {
      super(ctx, env);
      this.sessions = new Map();


      // As part of constructing the Durable Object,
      // we wake up any hibernating WebSockets and
      // place them back in the `sessions` map.


      // Get all WebSocket connections from the DO
      this.ctx.getWebSockets().forEach((ws) => {
        let attachment = ws.deserializeAttachment();
        if (attachment) {
          // If we previously attached state to our WebSocket,
          // let's add it to `sessions` map to restore the state of the connection.
          this.sessions.set(ws, { ...attachment });
        }
      });


      // Sets an application level auto response that does not wake hibernated WebSockets.
      this.ctx.setWebSocketAutoResponse(
        new WebSocketRequestResponsePair("ping", "pong"),
      );
    }


    async fetch(request) {
      // Creates two ends of a WebSocket connection.
      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);


      // Calling `acceptWebSocket()` informs the runtime that this WebSocket is to begin terminating
      // request within the Durable Object. It has the effect of "accepting" the connection,
      // and allowing the WebSocket to send and receive messages.
      // Unlike `ws.accept()`, `this.ctx.acceptWebSocket(ws)` informs the Workers Runtime that the WebSocket
      // is "hibernatable", so the runtime does not need to pin this Durable Object to memory while
      // the connection is open. During periods of inactivity, the Durable Object can be evicted
      // from memory, but the WebSocket connection will remain open. If at some later point the
      // WebSocket receives a message, the runtime will recreate the Durable Object
      // (run the `constructor`) and deliver the message to the appropriate handler.
      this.ctx.acceptWebSocket(server);


      // Generate a random UUID for the session.
      const id = crypto.randomUUID();


      // Attach the session ID to the WebSocket connection and serialize it.
      // This is necessary to restore the state of the connection when the Durable Object wakes up.
      server.serializeAttachment({ id });


      // Add the WebSocket connection to the map of active sessions.
      this.sessions.set(server, { id });


      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }


    async webSocketMessage(ws, message) {
      // Get the session associated with the WebSocket connection.
      const session = this.sessions.get(ws);


      // Upon receiving a message from the client, the server replies with the same message, the session ID of the connection,
      // and the total number of connections with the "[Durable Object]: " prefix
      ws.send(
        `[Durable Object] message: ${message}, from: ${session.id}, to: the initiating client. Total connections: ${this.sessions.size}`,
      );


      // Send a message to all WebSocket connections, loop over all the connected WebSockets.
      this.sessions.forEach((attachment, connectedWs) => {
        connectedWs.send(
          `[Durable Object] message: ${message}, from: ${session.id}, to: all clients. Total connections: ${this.sessions.size}`,
        );
      });


      // Send a message to all WebSocket connections except the connection (ws),
      // loop over all the connected WebSockets and filter out the connection (ws).
      this.sessions.forEach((attachment, connectedWs) => {
        if (connectedWs !== ws) {
          connectedWs.send(
            `[Durable Object] message: ${message}, from: ${session.id}, to: all clients except the initiating client. Total connections: ${this.sessions.size}`,
          );
        }
      });
    }


    async webSocketClose(ws, code, reason, wasClean) {
      // Calling close() on the server completes the WebSocket close handshake
      ws.close(code, reason);
      this.sessions.delete(ws);
    }
  }
  ```

* TypeScript

  ```ts
  import { DurableObject } from 'cloudflare:workers';


  // Worker
  export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
      if (request.url.endsWith('/websocket')) {
        // Expect to receive a WebSocket Upgrade request.
        // If there is one, accept the request and return a WebSocket Response.
        const upgradeHeader = request.headers.get('Upgrade');
        if (!upgradeHeader || upgradeHeader !== 'websocket') {
          return new Response('Worker expected Upgrade: websocket', {
            status: 426,
          });
        }


        if (request.method !== 'GET') {
          return new Response('Worker expected GET method', {
            status: 400,
          });
        }


        // Since we are hard coding the Durable Object ID by providing the constant name 'foo',
        // all requests to this Worker will be sent to the same Durable Object instance.
        let stub = env.WEBSOCKET_HIBERNATION_SERVER.getByName("foo");


        return stub.fetch(request);
      }


      return new Response(
        `Supported endpoints:
  /websocket: Expects a WebSocket upgrade request`,
        {
          status: 200,
          headers: {
            'Content-Type': 'text/plain',
          },
        }
      );
    },
  };


  // Durable Object
  export class WebSocketHibernationServer extends DurableObject {
    // Keeps track of all WebSocket connections
    // When the DO hibernates, gets reconstructed in the constructor
    sessions: Map<WebSocket, { [key: string]: string }>;


    constructor(ctx: DurableObjectState, env: Env) {
      super(ctx, env);
      this.sessions = new Map();


      // As part of constructing the Durable Object,
      // we wake up any hibernating WebSockets and
      // place them back in the `sessions` map.


      // Get all WebSocket connections from the DO
      this.ctx.getWebSockets().forEach((ws) => {
        let attachment = ws.deserializeAttachment();
        if (attachment) {
          // If we previously attached state to our WebSocket,
          // let's add it to `sessions` map to restore the state of the connection.
          this.sessions.set(ws, { ...attachment });
        }
      });


      // Sets an application level auto response that does not wake hibernated WebSockets.
      this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong'));
    }


    async fetch(request: Request): Promise<Response> {
      // Creates two ends of a WebSocket connection.
      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);


      // Calling `acceptWebSocket()` informs the runtime that this WebSocket is to begin terminating
      // request within the Durable Object. It has the effect of "accepting" the connection,
      // and allowing the WebSocket to send and receive messages.
      // Unlike `ws.accept()`, `this.ctx.acceptWebSocket(ws)` informs the Workers Runtime that the WebSocket
      // is "hibernatable", so the runtime does not need to pin this Durable Object to memory while
      // the connection is open. During periods of inactivity, the Durable Object can be evicted
      // from memory, but the WebSocket connection will remain open. If at some later point the
      // WebSocket receives a message, the runtime will recreate the Durable Object
      // (run the `constructor`) and deliver the message to the appropriate handler.
      this.ctx.acceptWebSocket(server);


      // Generate a random UUID for the session.
      const id = crypto.randomUUID();


      // Attach the session ID to the WebSocket connection and serialize it.
      // This is necessary to restore the state of the connection when the Durable Object wakes up.
      server.serializeAttachment({ id });


      // Add the WebSocket connection to the map of active sessions.
      this.sessions.set(server, { id });


      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }


    async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
      // Get the session associated with the WebSocket connection.
      const session = this.sessions.get(ws)!;


      // Upon receiving a message from the client, the server replies with the same message, the session ID of the connection,
      // and the total number of connections with the "[Durable Object]: " prefix
      ws.send(`[Durable Object] message: ${message}, from: ${session.id}, to: the initiating client. Total connections: ${this.sessions.size}`);


      // Send a message to all WebSocket connections, loop over all the connected WebSockets.
      this.sessions.forEach((attachment, connectedWs) => {
        connectedWs.send(`[Durable Object] message: ${message}, from: ${session.id}, to: all clients. Total connections: ${this.sessions.size}`);
      });


      // Send a message to all WebSocket connections except the connection (ws),
      // loop over all the connected WebSockets and filter out the connection (ws).
      this.sessions.forEach((attachment, connectedWs) => {
        if (connectedWs !== ws) {
            connectedWs.send(`[Durable Object] message: ${message}, from: ${session.id}, to: all clients except the initiating client. Total connections: ${this.sessions.size}`);
        }
      });
    }


    async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
      // Calling close() on the server completes the WebSocket close handshake
      ws.close(code, reason);
      this.sessions.delete(ws);
    }
  }
  ```

* Python

  ```py
  from workers import DurableObject, Response, WorkerEntrypoint
  from js import WebSocketPair, WebSocketRequestResponsePair
  import uuid


  class Session:
    def __init__(self, *, ws):
      self.ws = ws


  # Worker
  class Default(WorkerEntrypoint):
    async def fetch(self, request):
      if request.url.endswith('/websocket'):
        # Expect to receive a WebSocket Upgrade request.
        # If there is one, accept the request and return a WebSocket Response.
        upgrade_header = request.headers.get('Upgrade')
        if not upgrade_header or upgrade_header != 'websocket':
          return Response('Worker expected Upgrade: websocket', status=426)


        if request.method != 'GET':
          return Response('Worker expected GET method', status=400)


        # Since we are hard coding the Durable Object ID by providing the constant name 'foo',
        # all requests to this Worker will be sent to the same Durable Object instance.
        stub = self.env.WEBSOCKET_HIBERNATION_SERVER.getByName("foo")


        return await stub.fetch(request)


      return Response(
        """Supported endpoints:
  /websocket: Expects a WebSocket upgrade request""",
        status=200,
        headers={'Content-Type': 'text/plain'}
      )


  # Durable Object
  class WebSocketHibernationServer(DurableObject):
    def __init__(self, ctx, env):
      super().__init__(ctx, env)
      # Keeps track of all WebSocket connections, keyed by session ID
      # When the DO hibernates, gets reconstructed in the constructor
      self.sessions = {}


      # As part of constructing the Durable Object,
      # we wake up any hibernating WebSockets and
      # place them back in the `sessions` map.


      # Get all WebSocket connections from the DO
      for ws in self.ctx.getWebSockets():
        attachment = ws.deserializeAttachment()
        if attachment:
          # If we previously attached state to our WebSocket,
          # let's add it to `sessions` map to restore the state of the connection.
          # Use the session ID as the key
          self.sessions[attachment] = Session(ws=ws)


      # Sets an application level auto response that does not wake hibernated WebSockets.
      self.ctx.setWebSocketAutoResponse(WebSocketRequestResponsePair.new('ping', 'pong'))


    async def fetch(self, request):
      # Creates two ends of a WebSocket connection.
      client, server = WebSocketPair.new().object_values()


      # Calling `acceptWebSocket()` informs the runtime that this WebSocket is to begin terminating
      # request within the Durable Object. It has the effect of "accepting" the connection,
      # and allowing the WebSocket to send and receive messages.
      # Unlike `ws.accept()`, `this.ctx.acceptWebSocket(ws)` informs the Workers Runtime that the WebSocket
      # is "hibernatable", so the runtime does not need to pin this Durable Object to memory while
      # the connection is open. During periods of inactivity, the Durable Object can be evicted
      # from memory, but the WebSocket connection will remain open. If at some later point the
      # WebSocket receives a message, the runtime will recreate the Durable Object
      # (run the `constructor`) and deliver the message to the appropriate handler.
      self.ctx.acceptWebSocket(server)


      # Generate a random UUID for the session.
      id = str(uuid.uuid4())


      # Attach the session ID to the WebSocket connection and serialize it.
      # This is necessary to restore the state of the connection when the Durable Object wakes up.
      server.serializeAttachment(id)


      # Add the WebSocket connection to the map of active sessions, keyed by session ID.
      self.sessions[id] = Session(ws=server)


      return Response(None, status=101, web_socket=client)


    async def webSocketMessage(self, ws, message):
      # Get the session ID associated with the WebSocket connection.
      session_id = ws.deserializeAttachment()


      # Upon receiving a message from the client, the server replies with the same message, the session ID of the connection,
      # and the total number of connections with the "[Durable Object]: " prefix
      ws.send(f"[Durable Object] message: {message}, from: {session_id}, to: the initiating client. Total connections: {len(self.sessions)}")


      # Send a message to all WebSocket connections, loop over all the connected WebSockets.
      for session in self.sessions.values():
        session.ws.send(f"[Durable Object] message: {message}, from: {session_id}, to: all clients. Total connections: {len(self.sessions)}")


      # Send a message to all WebSocket connections except the connection (ws),
      # loop over all the connected WebSockets and filter out the connection (ws).
      for session in self.sessions.values():
        if session.ws != ws:
          session.ws.send(f"[Durable Object] message: {message}, from: {session_id}, to: all clients except the initiating client. Total connections: {len(self.sessions)}")


    async def webSocketClose(self, ws, code, reason, wasClean):
      # Calling close() on the server completes the WebSocket close handshake
      ws.close(code, reason)
      # Get the session ID from the WebSocket attachment to remove it from sessions
      session_id = ws.deserializeAttachment()
      if session_id:
        self.sessions.pop(session_id, None)
  ```

Finally, configure your Wrangler file to include a Durable Object [binding](https://developers.cloudflare.com/durable-objects/get-started/#4-configure-durable-object-bindings) and [migration](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/) based on the namespace and class name chosen previously.

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "websocket-hibernation-server",
    "main": "src/index.ts",
    "durable_objects": {
      "bindings": [
        {
          "name": "WEBSOCKET_HIBERNATION_SERVER",
          "class_name": "WebSocketHibernationServer"
        }
      ]
    },
    "migrations": [
      {
        "tag": "v1",
        "new_sqlite_classes": [
          "WebSocketHibernationServer"
        ]
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "websocket-hibernation-server"
  main = "src/index.ts"


  [[durable_objects.bindings]]
  name = "WEBSOCKET_HIBERNATION_SERVER"
  class_name = "WebSocketHibernationServer"


  [[migrations]]
  tag = "v1"
  new_sqlite_classes = [ "WebSocketHibernationServer" ]
  ```

### Related resources

* [Durable Objects: Edge Chat Demo with Hibernation](https://github.com/cloudflare/workers-chat-demo/).

</page>

<page>
---
title: Data Studio · Cloudflare Durable Objects docs
description: Each Durable Object can access private storage using Storage API
  available on ctx.storage. To view and write to an object's stored data, you
  can use Durable Objects Data Studio as a UI editor available on the Cloudflare
  dashboard.
lastUpdated: 2025-10-16T13:57:27.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/observability/data-studio/
  md: https://developers.cloudflare.com/durable-objects/observability/data-studio/index.md
---

Each Durable Object can access private storage using [Storage API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/) available on `ctx.storage`. To view and write to an object's stored data, you can use Durable Objects Data Studio as a UI editor available on the Cloudflare dashboard.

Data Studio only supported for SQLite-backed objects

You can only use Data Studio to access data for [SQLite-backed Durable Objects](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#create-sqlite-backed-durable-object-class).

At the moment, you can only read/write data persisted using the [SQL API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/#sql-api). Key-value data persisted using the KV API will be made read-only in the future.

## View Data Studio

You need to have at least the `Workers Platform Admin` [role](https://developers.cloudflare.com/fundamentals/manage-members/roles/) to access Data Studio.

1. In the Cloudflare dashboard, go to the **Durable Objects** page.

   [Go to **Durable Objects**](https://dash.cloudflare.com/?to=/:account/workers/durable-objects)

2. Select an existing Durable Object namespace.

3. Select the **Data Studio** button.

4. Provide a Durable Object identifier, either a user-provided [unique name](https://developers.cloudflare.com/durable-objects/api/namespace/#getbyname) or a Cloudflare-generated [Durable Object ID](https://developers.cloudflare.com/durable-objects/api/id/).

* Queries executed by Data Studio send requests to your remote, deployed objects and incur [usage billing](https://developers.cloudflare.com/durable-objects/platform/pricing/) for requests, duration, rows read, and rows written. You should use Data Studio as you would handle your production, running objects.
* In the **Query** tab when running all statements, each SQL statement is sent as a separate Durable Object request.

## Audit logging

All queries issued by the Data Studio are logged with [audit logging v1](https://developers.cloudflare.com/fundamentals/account/account-security/review-audit-logs/) for your security and compliance needs.

* Each query emits two audit logs, a `query executed` action and a `query completed` action indicating query success or failure. `query_id` in the log event can be used to correlate the two events per query.

</page>

<page>
---
title: Metrics and analytics · Cloudflare Durable Objects docs
description: Durable Objects expose analytics for Durable Object namespace-level
  and request-level metrics.
lastUpdated: 2025-09-17T14:35:09.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/observability/metrics-and-analytics/
  md: https://developers.cloudflare.com/durable-objects/observability/metrics-and-analytics/index.md
---

Durable Objects expose analytics for Durable Object namespace-level and request-level metrics.

The metrics displayed in the [Cloudflare dashboard](https://dash.cloudflare.com/) charts are queried from Cloudflare's [GraphQL Analytics API](https://developers.cloudflare.com/analytics/graphql-api/). You can access the metrics [programmatically via GraphQL](#query-via-the-graphql-api) or HTTP client.

Durable Object namespace

A Durable Object namespace is a set of Durable Objects that can be addressed by name, backed by the same class. There is only one Durable Object namespace per class. A Durable Object namespace can contain any number of Durable Objects.

## View metrics and analytics

Per-namespace analytics for Durable Objects are available in the Cloudflare dashboard. To view current and historical metrics for a namespace:

1. In the Cloudflare dashboard, go to the **Durable Objects** page.

   [Go to **Durable Objects**](https://dash.cloudflare.com/?to=/:account/workers/durable-objects)

2. View account-level Durable Objects usage.

3. Select an existing Durable Object namespace.

4. Select the **Metrics** tab.

You can optionally select a time window to query. This defaults to the last 24 hours.

## View logs

You can view Durable Object logs from the Cloudflare dashboard. Logs are aggregated by the script name and the Durable Object class name.

To start using Durable Object logging:

1. Enable Durable Object logging in the Wrangler configuration file of the Worker that defines your Durable Object class:

   * wrangler.jsonc

     ```jsonc
     {
         "observability": {
             "enabled": true
         }
     }
     ```

   * wrangler.toml

     ```toml
     [observability]
     enabled = true
     ```

2. Deploy the latest version of the Worker with the updated binding.

3. Go to the **Durable Objects** page.

   [Go to **Durable Objects**](https://dash.cloudflare.com/?to=/:account/workers/durable-objects)

4. Select an existing Durable Object namespace.

5. Select the **Logs** tab.

Note

For information on log limits (such as maximum log retention period), refer to the [Workers Logs documentation](https://developers.cloudflare.com/workers/observability/logs/workers-logs/#limits).

## Query via the GraphQL API

Durable Object metrics are powered by GraphQL.

The datasets that include Durable Object metrics include:

* `durableObjectsInvocationsAdaptiveGroups`
* `durableObjectsPeriodicGroups`
* `durableObjectsStorageGroups`
* `durableObjectsSubrequestsAdaptiveGroups`

Use [GraphQL Introspection](https://developers.cloudflare.com/analytics/graphql-api/features/discovery/introspection/) to get information on the fields exposed by each datasets.

### WebSocket metrics

Durable Objects using [WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/) will see request metrics across several GraphQL datasets because WebSockets have different types of requests.

* Metrics for a WebSocket connection itself is represented in `durableObjectsInvocationsAdaptiveGroups` once the connection closes. Since WebSocket connections are long-lived, connections often do not terminate until the Durable Object terminates.
* Metrics for incoming and outgoing WebSocket messages on a WebSocket connection are available in `durableObjectsPeriodicGroups`. If a WebSocket connection uses [WebSocket Hibernation](https://developers.cloudflare.com/durable-objects/best-practices/websockets/#websocket-hibernation-api), incoming WebSocket messages are instead represented in `durableObjectsInvocationsAdaptiveGroups`.

## Example GraphQL query for Durable Objects

```js
  viewer {
    /*
    Replace with your account tag, the 32 hex character id visible at the beginning of any url
    when logged in to dash.cloudflare.com or under "Account ID" on the sidebar of the Workers & Pages Overview
    */
    accounts(filter: {accountTag: "your account tag here"}) {
      // Replace dates with a recent date
      durableObjectsInvocationsAdaptiveGroups(filter: {date_gt: "2023-05-23"}, limit: 1000) {
        sum {
          // Any other fields found through introspection can be added here
          requests
          responseBodySize
        }
      }
      durableObjectsPeriodicGroups(filter: {date_gt: "2023-05-23"}, limit: 1000) {
        sum {
          cpuTime
        }
      }
      durableObjectsStorageGroups(filter: {date_gt: "2023-05-23"}, limit: 1000) {
        max {
          storedBytes
        }
      }
    }
  }
```

Refer to the [Querying Workers Metrics with GraphQL](https://developers.cloudflare.com/analytics/graphql-api/tutorials/querying-workers-metrics/) tutorial for authentication and to learn more about querying Workers datasets.

## Additional resources

* For instructions on setting up a Grafana dashboard to query Cloudflare's GraphQL Analytics API, refer to [Grafana Dashboard starter for Durable Object metrics](https://github.com/TimoWilhelm/grafana-do-dashboard).

## FAQs

### How can I identify which Durable Object instance generated a log entry?

You can use `$workers.durableObjectId` to identify the specific Durable Object instance that generated the log entry.

</page>

<page>
---
title: Troubleshooting · Cloudflare Durable Objects docs
description: wrangler dev and wrangler tail are both available to help you debug
  your Durable Objects.
lastUpdated: 2025-02-12T13:41:31.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/observability/troubleshooting/
  md: https://developers.cloudflare.com/durable-objects/observability/troubleshooting/index.md
---

## Debugging

[`wrangler dev`](https://developers.cloudflare.com/workers/wrangler/commands/#dev) and [`wrangler tail`](https://developers.cloudflare.com/workers/wrangler/commands/#tail) are both available to help you debug your Durable Objects.

The `wrangler dev --remote` command opens a tunnel from your local development environment to Cloudflare's global network, letting you test your Durable Objects code in the Workers environment as you write it.

`wrangler tail` displays a live feed of console and exception logs for each request served by your Worker code, including both normal Worker requests and Durable Object requests. After running `npx wrangler deploy`, you can use `wrangler tail` in the root directory of your Worker project and visit your Worker URL to see console and error logs in your terminal.

## Common errors

### No event handlers were registered. This script does nothing.

In your Wrangler file, make sure the `dir` and `main` entries point to the correct file containing your Worker code, and that the file extension is `.mjs` instead of `.js` if using ES modules syntax.

### Cannot apply `--delete-class` migration to class.

When deleting a migration using `npx wrangler deploy --delete-class <ClassName>`, you may encounter this error: `"Cannot apply --delete-class migration to class <ClassName> without also removing the binding that references it"`. You should remove the corresponding binding under `[durable_objects]` in the [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) before attempting to apply `--delete-class` again.

### Durable Object is overloaded.

A single instance of a Durable Object cannot do more work than is possible on a single thread. These errors mean the Durable Object has too much work to keep up with incoming requests:

* `Error: Durable Object is overloaded. Too many requests queued.` The total count of queued requests is too high.
* `Error: Durable Object is overloaded. Too much data queued.` The total size of data in queued requests is too high.
* `Error: Durable Object is overloaded. Requests queued for too long.` The oldest request has been in the queue too long.
* `Error: Durable Object is overloaded. Too many requests for the same object within a 10 second window.` The number of requests for a Durable Object is too high within a short span of time (10 seconds). This error indicates a more extreme level of overload.

To solve this error, you can either do less work per request, or send fewer requests. For example, you can split the requests among more instances of the Durable Object.

These errors and others that are due to overload will have an [`.overloaded` property](https://developers.cloudflare.com/durable-objects/best-practices/error-handling) set on their exceptions, which can be used to avoid retrying overloaded operations.

### Your account is generating too much load on Durable Objects. Please back off and try again later.

There is a limit on how quickly you can create new [stubs](https://developers.cloudflare.com/durable-objects/api/stub) for new or existing Durable Objects. Those lookups are usually cached, meaning attempts for the same set of recently accessed Durable Objects should be successful, so catching this error and retrying after a short wait is safe. If possible, also consider spreading those lookups across multiple requests.

### Durable Object reset because its code was updated.

Reset in error messages refers to in-memory state. Any durable state that has already been successfully persisted via `state.storage` is not affected.

Refer to [Global Uniqueness](https://developers.cloudflare.com/durable-objects/platform/known-issues/#global-uniqueness).

### Durable Object storage operation exceeded timeout which caused object to be reset.

To prevent indefinite blocking, there is a limit on how much time storage operations can take. In Durable Objects containing a sufficiently large number of key-value pairs, `deleteAll()` may hit that time limit and fail. When this happens, note that each `deleteAll()` call does make progress and that it is safe to retry until it succeeds. Otherwise contact [Cloudflare support](https://developers.cloudflare.com/support/contacting-cloudflare-support/).

### Your account is doing too many concurrent storage operations. Please back off and try again later.

Besides the suggested approach of backing off, also consider changing your code to use `state.storage.get(keys Array<string>)` rather than multiple individual `state.storage.get(key)` calls where possible.

</page>

<page>
---
title: Known issues · Cloudflare Durable Objects docs
description: Durable Objects is generally available. However, there are some known issues.
lastUpdated: 2025-02-19T09:34:35.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/platform/known-issues/
  md: https://developers.cloudflare.com/durable-objects/platform/known-issues/index.md
---

Durable Objects is generally available. However, there are some known issues.

## Global uniqueness

Global uniqueness guarantees there is only a single instance of a Durable Object class with a given ID running at once, across the world.

Uniqueness is enforced upon starting a new event (such as receiving an HTTP request), and upon accessing storage.

After an event is received, if the event takes some time to execute and does not ever access its durable storage, then it is possible that the Durable Object may no longer be current, and some other instance of the same Durable Object ID will have been created elsewhere. If the event accesses storage at this point, it will receive an [exception](https://developers.cloudflare.com/durable-objects/observability/troubleshooting/). If the event completes without ever accessing storage, it may not ever realize that the Durable Object was no longer current.

A Durable Object may be replaced in the event of a network partition or a software update (including either an update of the Durable Object's class code, or of the Workers system itself). Enabling `wrangler tail` or [Cloudflare dashboard](https://dash.cloudflare.com/) logs requires a software update.

## Code updates

Code changes for Workers and Durable Objects are released globally in an eventually consistent manner. Because each Durable Object is globally unique, the situation can arise that a request arrives to the latest version of your Worker (running in one part of the world), which then calls to a unique Durable Object running the previous version of your code for a short period of time (typically seconds to minutes). If you create a [gradual deployment](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/gradual-deployments/), this period of time is determined by how long your live deployment is configured to use more than one version.

For this reason, it is best practice to ensure that API changes between your Workers and Durable Objects are forward and backward compatible across code updates.

## Development tools

[`wrangler tail`](https://developers.cloudflare.com/workers/wrangler/commands/#tail) logs from requests that are upgraded to WebSockets are delayed until the WebSocket is closed. `wrangler tail` should not be connected to a Worker that you expect will receive heavy volumes of traffic.

The Workers editor in the [Cloudflare dashboard](https://dash.cloudflare.com/) allows you to interactively edit and preview your Worker and Durable Objects. In the editor, Durable Objects can only be talked to by a preview request if the Worker being previewed both exports the Durable Object class and binds to it. Durable Objects exported by other Workers cannot be talked to in the editor preview.

[`wrangler dev`](https://developers.cloudflare.com/workers/wrangler/commands/#dev) has read access to Durable Object storage, but writes will be kept in memory and will not affect persistent data. However, if you specify the `script_name` explicitly in the [Durable Object binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/), then writes will affect persistent data. Wrangler will emit a warning in that case.

## Alarms in local development

Currently, when developing locally (using `npx wrangler dev`), Durable Object [alarm methods](https://developers.cloudflare.com/durable-objects/api/alarms) may fail after a hot reload (if you edit the code while the code is running locally).

To avoid this issue, when using Durable Object alarms, close and restart your `wrangler dev` command after editing your code.

</page>

<page>
---
title: Limits · Cloudflare Durable Objects docs
description: Durable Objects are a special kind of Worker, so Workers Limits
  apply according to your Workers plan. In addition, Durable Objects have
  specific limits as listed in this page.
lastUpdated: 2026-02-08T13:47:49.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/platform/limits/
  md: https://developers.cloudflare.com/durable-objects/platform/limits/index.md
---

Durable Objects are a special kind of Worker, so [Workers Limits](https://developers.cloudflare.com/workers/platform/limits/) apply according to your Workers plan. In addition, Durable Objects have specific limits as listed in this page.

## SQLite-backed Durable Objects general limits

| Feature | Limit |
| - | - |
| Number of Objects | Unlimited (within an account or of a given class) |
| Maximum Durable Object classes (per account) | 500 (Workers Paid) / 100 (Free) [1](#user-content-fn-1) |
| Storage per account | Unlimited (Workers Paid) / 5GB (Free) [2](#user-content-fn-2) |
| Storage per class | Unlimited [3](#user-content-fn-3) |
| Storage per Durable Object | 10 GB [3](#user-content-fn-3) |
| Key size | Key and value combined cannot exceed 2 MB |
| Value size | Key and value combined cannot exceed 2 MB |
| WebSocket message size | 32 MiB (only for received messages) |
| CPU per request | 30 seconds (default) / configurable to 5 minutes of [active CPU time](https://developers.cloudflare.com/workers/platform/limits/#cpu-time) [4](#user-content-fn-4) |

### SQL storage limits

For Durable Object classes with [SQLite storage](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/) these SQL limits apply:

| SQL | Limit |
| - | - |
| Maximum number of columns per table | 100 |
| Maximum number of rows per table | Unlimited (excluding per-object storage limits) |
| Maximum string, `BLOB` or table row size | 2 MB |
| Maximum SQL statement length | 100 KB |
| Maximum bound parameters per query | 100 |
| Maximum arguments per SQL function | 32 |
| Maximum characters (bytes) in a `LIKE` or `GLOB` pattern | 50 bytes |

## Key-value backed Durable Objects general limits

Note

Durable Objects are available both on Workers Free and Workers Paid plans.

* **Workers Free plan**: Only Durable Objects with [SQLite storage backend](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#wrangler-configuration-for-sqlite-backed-durable-objects) are available.
* **Workers Paid plan**: Durable Objects with either SQLite storage backend or [key-value storage backend](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/#create-durable-object-class-with-key-value-storage) are available.

If you wish to downgrade from a Workers Paid plan to a Workers Free plan, you must first ensure that you have deleted all Durable Object namespaces with the key-value storage backend.

| Feature | Limit for class with key-value storage backend |
| - | - |
| Number of Objects | Unlimited (within an account or of a given class) |
| Maximum Durable Object classes (per account) | 500 (Workers Paid) / 100 (Free) [5](#user-content-fn-5) |
| Storage per account | 50 GB (can be raised by contacting Cloudflare) [6](#user-content-fn-6) |
| Storage per class | Unlimited |
| Storage per Durable Object | Unlimited |
| Key size | 2 KiB (2048 bytes) |
| Value size | 128 KiB (131072 bytes) |
| WebSocket message size | 32 MiB (only for received messages) |
| CPU per request | 30s (including WebSocket messages) [7](#user-content-fn-7) |

Need a higher limit?

To request an adjustment to a limit, complete the [Limit Increase Request Form](https://forms.gle/ukpeZVLWLnKeixDu7). If the limit can be increased, Cloudflare will contact you with next steps.

## Frequently Asked Questions

### How much work can a single Durable Object do?

Durable Objects can scale horizontally across many Durable Objects. Each individual Object is inherently single-threaded.

* An individual Object has a soft limit of 1,000 requests per second. You can have an unlimited number of individual objects per namespace.
* A simple [storage](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/) `get()` on a small value that directly returns the response may realize a higher request throughput compared to a Durable Object that (for example) serializes and/or deserializes large JSON values.
* Similarly, a Durable Object that performs multiple `list()` operations may be more limited in terms of request throughput.

A Durable Object that receives too many requests will, after attempting to queue them, return an [overloaded](https://developers.cloudflare.com/durable-objects/observability/troubleshooting/#durable-object-is-overloaded) error to the caller.

### How many Durable Objects can I create?

Durable Objects are designed such that the number of individual objects in the system do not need to be limited, and can scale horizontally.

* You can create and run as many separate Durable Objects as you want within a given Durable Object namespace.
* There are no limits for storage per account when using SQLite-backed Durable Objects on a Workers Paid plan.
* Each SQLite-backed Durable Object has a storage limit of 10 GB on a Workers Paid plan.
* Refer to [Durable Object limits](https://developers.cloudflare.com/durable-objects/platform/limits/) for more information.

### Can I increase Durable Objects' CPU limit?

Durable Objects are Worker scripts, and have the same [per invocation CPU limits](https://developers.cloudflare.com/workers/platform/limits/#worker-limits) as any Workers do. Note that CPU time is active processing time: not time spent waiting on network requests, storage calls, or other general I/O, which don't count towards your CPU time or Durable Objects compute consumption.

By default, the maximum CPU time per Durable Objects invocation (HTTP request, WebSocket message, or Alarm) is set to 30 seconds, but can be increased for all Durable Objects associated with a Durable Object definition by setting `limits.cpu_ms` in your Wrangler configuration:

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

## Footnotes

1. Identical to the Workers [script limit](https://developers.cloudflare.com/workers/platform/limits/). [↩](#user-content-fnref-1)

2. Durable Objects both bills and measures storage based on a gigabyte\
   (1 GB = 1,000,000,000 bytes) and not a gibibyte (GiB).\
   [↩](#user-content-fnref-2)

3. Accounts on the Workers Free plan are limited to 5 GB total Durable Objects storage. [↩](#user-content-fnref-3) [↩2](#user-content-fnref-3-2)

4. Each incoming HTTP request or WebSocket *message* resets the remaining available CPU time to 30 seconds. This allows the Durable Object to consume up to 30 seconds of compute after each incoming network request, with each new network request resetting the timer. If you consume more than 30 seconds of compute between incoming network requests, there is a heightened chance that the individual Durable Object is evicted and reset. CPU time per request invocation [can be increased](https://developers.cloudflare.com/durable-objects/platform/limits/#can-i-increase-durable-objects-cpu-limit). [↩](#user-content-fnref-4)

5. Identical to the Workers [script limit](https://developers.cloudflare.com/workers/platform/limits/). [↩](#user-content-fnref-5)

6. Durable Objects both bills and measures storage based on a gigabyte\
   (1 GB = 1,000,000,000 bytes) and not a gibibyte (GiB).\
   [↩](#user-content-fnref-6)

7. Each incoming HTTP request or WebSocket *message* resets the remaining available CPU time to 30 seconds. This allows the Durable Object to consume up to 30 seconds of compute after each incoming network request, with each new network request resetting the timer. If you consume more than 30 seconds of compute between incoming network requests, there is a heightened chance that the individual Durable Object is evicted and reset. CPU time per request invocation [can be increased](https://developers.cloudflare.com/durable-objects/platform/limits/#can-i-increase-durable-objects-cpu-limit). [↩](#user-content-fnref-7)

</page>

<page>
---
title: Pricing · Cloudflare Durable Objects docs
description: "Durable Objects can incur two types of billing: compute and storage."
lastUpdated: 2025-08-22T14:24:45.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/platform/pricing/
  md: https://developers.cloudflare.com/durable-objects/platform/pricing/index.md
---

Durable Objects can incur two types of billing: compute and storage.

Note

Durable Objects are available both on Workers Free and Workers Paid plans.

* **Workers Free plan**: Only Durable Objects with [SQLite storage backend](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#wrangler-configuration-for-sqlite-backed-durable-objects) are available.
* **Workers Paid plan**: Durable Objects with either SQLite storage backend or [key-value storage backend](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/#create-durable-object-class-with-key-value-storage) are available.

If you wish to downgrade from a Workers Paid plan to a Workers Free plan, you must first ensure that you have deleted all Durable Object namespaces with the key-value storage backend.

On Workers Free plan:

* If you exceed any one of the free tier limits, further operations of that type will fail with an error.
* Daily free limits reset at 00:00 UTC.

## Compute billing

Durable Objects are billed for compute duration (wall-clock time) while the Durable Object is actively running or is idle in memory but unable to [hibernate](https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/). Durable Objects that are idle and eligible for hibernation are not billed for duration, even before the runtime has hibernated them. Requests to a Durable Object keep it active or create the object if it was inactive.

| | Free plan | Paid plan |
| - | - | - |
| Requests | 100,000 / day | 1 million, + $0.15/million Includes HTTP requests, RPC sessions1, WebSocket messages2, and alarm invocations |
| Duration3 | 13,000 GB-s / day | 400,000 GB-s, + $12.50/million GB-s4,5 |

Footnotes

1 Each [RPC session](https://developers.cloudflare.com/workers/runtime-apis/rpc/lifecycle/) is billed as one request to your Durable Object. Every [RPC method call](https://developers.cloudflare.com/durable-objects/best-practices/create-durable-object-stubs-and-send-requests/) on a [Durable Objects stub](https://developers.cloudflare.com/durable-objects/) is its own RPC session and therefore a single billed request.

RPC method calls can return objects (stubs) extending [`RpcTarget`](https://developers.cloudflare.com/workers/runtime-apis/rpc/lifecycle/#lifetimes-memory-and-resource-management) and invoke calls on those stubs. Subsequent calls on the returned stub are part of the same RPC session and are not billed as separate requests. For example:

```js
let durableObjectStub = OBJECT_NAMESPACE.get(id); // retrieve Durable Object stub
using foo = await durableObjectStub.bar(); // billed as a request
await foo.baz(); // treated as part of the same RPC session created by calling bar(), not billed as a request
await durableObjectStub.cat(); // billed as a request
```

2 A request is needed to create a WebSocket connection. There is no charge for outgoing WebSocket messages, nor for incoming [WebSocket protocol pings](https://www.rfc-editor.org/rfc/rfc6455#section-5.5.2). For compute requests billing-only, a 20:1 ratio is applied to incoming WebSocket messages to factor in smaller messages for real-time communication. For example, 100 WebSocket incoming messages would be charged as 5 requests for billing purposes. The 20:1 ratio does not affect Durable Object metrics and analytics, which reflect actual usage.

3 Application level auto-response messages handled by [`state.setWebSocketAutoResponse()`](https://developers.cloudflare.com/durable-objects/best-practices/websockets/) will not incur additional wall-clock time, and so they will not be charged.

4 Duration is billed in wall-clock time as long as the Object is active and not eligible for hibernation, but is shared across all requests active on an Object at once. Calling `accept()` on a WebSocket in an Object will incur duration charges for the entire time the WebSocket is connected. It is recommended to use the WebSocket Hibernation API to avoid incurring duration charges once all event handlers finish running. For a complete explanation, refer to [When does a Durable Object incur duration charges?](https://developers.cloudflare.com/durable-objects/platform/pricing/#when-does-a-durable-object-incur-duration-charges).

5 Duration billing charges for the 128 MB of memory your Durable Object is allocated, regardless of actual usage. If your account creates many instances of a single Durable Object class, Durable Objects may run in the same isolate on the same physical machine and share the 128 MB of memory. These Durable Objects are still billed as if they are allocated a full 128 MB of memory.

## Storage billing

The [Durable Objects Storage API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/) is only accessible from within Durable Objects. Pricing depends on the storage backend of your Durable Objects.

* **SQLite-backed Durable Objects (recommended)**: [SQLite storage backend](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#create-sqlite-backed-durable-object-class) is recommended for all new Durable Object classes. Workers Free plan can only create and access SQLite-backed Durable Objects.
* **Key-value backed Durable Objects**: [Key-value storage backend](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/#create-durable-object-class-with-key-value-storage) is only available on the Workers Paid plan.

### SQLite storage backend

Storage billing on SQLite-backed Durable Objects

Storage billing for SQLite-backed Durable Objects will be enabled in January 2026, with a target date of January 7, 2026 (no earlier). Only SQLite storage usage on and after the billing target date will incur charges. For more information, refer to [Billing for SQLite Storage](https://developers.cloudflare.com/changelog/2025-12-12-durable-objects-sqlite-storage-billing/).

| | Workers Free plan | Workers Paid plan |
| - | - | - |
| Rows reads 1,2 | 5 million / day | First 25 billion / month included + $0.001 / million rows |
| Rows written 1,2,3,4 | 100,000 / day | First 50 million / month included + $1.00 / million rows |
| SQL Stored data 5 | 5 GB (total) | 5 GB-month, + $0.20/ GB-month |

Footnotes

1 Rows read and rows written included limits and rates match [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), Cloudflare's serverless SQL database.

2 Key-value methods like `get()`, `put()`, `delete()`, or `list()` store and query data in a hidden SQLite table and are billed as rows read and rows written.

3 Each `setAlarm()` is billed as a single row written.

4 Deletes are counted as rows written.

5 Durable Objects will be billed for stored data until the [data is removed](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#remove-a-durable-objects-storage). Once the data is removed, the object will be cleaned up automatically by the system.

### Key-value storage backend

| | Workers Paid plan |
| - | - |
| Read request units1,2 | 1 million, + $0.20/million |
| Write request units3 | 1 million, + $1.00/million |
| Delete requests4 | 1 million, + $1.00/million |
| Stored data5 | 1 GB, + $0.20/ GB-month |

Footnotes

1 A request unit is defined as 4 KB of data read or written. A request that writes or reads more than 4 KB will consume multiple units, for example, a 9 KB write will consume 3 write request units.

2 List operations are billed by read request units, based on the amount of data examined. For example, a list request that returns a combined 80 KB of keys and values will be billed 20 read request units. A list request that does not return anything is billed for 1 read request unit.

3 Each `setAlarm` is billed as a single write request unit.

4 Delete requests are unmetered. For example, deleting a 100 KB value will be charged one delete request.

5 Durable Objects will be billed for stored data until the data is removed. Once the data is removed, the object will be cleaned up automatically by the system.

Requests that hit the [Durable Objects in-memory cache](https://developers.cloudflare.com/durable-objects/reference/in-memory-state/) or that use the [multi-key versions of `get()`/`put()`/`delete()` methods](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/) are billed the same as if they were a normal, individual request for each key.

## Compute billing examples

These examples exclude the costs for the Workers calling the Durable Objects. When modelling the costs of a Durable Object, note that:

* Inactive objects receiving no requests do not incur any duration charges.
* The [WebSocket Hibernation API](https://developers.cloudflare.com/durable-objects/best-practices/websockets/#websocket-hibernation-api) can dramatically reduce duration-related charges for Durable Objects communicating with clients over the WebSocket protocol, especially if messages are only transmitted occasionally at sparse intervals.

### Example 1

This example represents a simple Durable Object used as a co-ordination service invoked via HTTP.

* A single Durable Object was called by a Worker 1.5 million times
* It is active for 1,000,000 seconds in the month

In this scenario, the estimated monthly cost would be calculated as:

**Requests**:

* (1.5 million requests - included 1 million requests) x $0.15 / 1,000,000 = $0.075

**Compute Duration**:

* 1,000,000 seconds \* 128 MB / 1 GB = 128,000 GB-s
* (128,000 GB-s - included 400,000 GB-s) x $12.50 / 1,000,000 = $0.00

**Estimated total**: \~$0.075 (requests) + $0.00 (compute duration) + minimum $5/mo usage = $5.08 per month

### Example 2

This example represents a moderately trafficked Durable Objects based application using WebSockets to broadcast game, chat or real-time user state across connected clients:

* 100 Durable Objects have 50 WebSocket connections established to each of them.
* Clients send approximately one message a minute for eight active hours a day, every day of the month.

In this scenario, the estimated monthly cost would be calculated as:

**Requests**:

* 50 WebSocket connections \* 100 Durable Objects to establish the WebSockets = 5,000 connections created each day \* 30 days = 150,000 WebSocket connection requests.
* 50 messages per minute \* 100 Durable Objects \* 60 minutes \* 8 hours \* 30 days = 72,000,000 WebSocket message requests.
* 150,000 + (72 million requests / 20 for WebSocket message billing ratio) = 3.75 million billing request.
* (3.75 million requests - included 1 million requests) x $0.15 / 1,000,000 = $0.41.

**Compute Duration**:

* 100 Durable Objects \* 60 seconds \* 60 minutes \* 8 hours \* 30 days = 86,400,000 seconds.
* 86,400,000 seconds \* 128 MB / 1 GB = 11,059,200 GB-s.
* (11,059,200 GB-s - included 400,000 GB-s) x $12.50 / 1,000,000 = $133.24.

**Estimated total**: $0.41 (requests) + $133.24 (compute duration) + minimum $5/mo usage = $138.65 per month.

### Example 3

This example represents a horizontally scaled Durable Objects based application using WebSockets to communicate user-specific state to a single client connected to each Durable Object.

* 100 Durable Objects each have a single WebSocket connection established to each of them.
* Clients sent one message every second of the month so that the Durable Objects were active for the entire month.

In this scenario, the estimated monthly cost would be calculated as:

**Requests**:

* 100 WebSocket connection requests.
* 1 message per second \* 100 connections \* 60 seconds \* 60 minutes \* 24 hours \* 30 days = 259,200,000 WebSocket message requests.
* 100 + (259.2 million requests / 20 for WebSocket billing ratio) = 12,960,100 requests.
* (12.9 million requests - included 1 million requests) x $0.15 / 1,000,000 = $1.79.

**Compute Duration**:

* 100 Durable Objects \* 60 seconds \* 60 minutes \* 24 hours \* 30 days = 259,200,000 seconds
* 259,200,000 seconds \* 128 MB / 1 GB = 33,177,600 GB-s
* (33,177,600 GB-s - included 400,000 GB-s) x $12.50 / 1,000,000 = $409.72

**Estimated total**: $1.79 (requests) + $409.72 (compute duration) + minimum $5/mo usage = $416.51 per month

### Example 4

This example represents a moderately trafficked Durable Objects based application using WebSocket Hibernation to broadcast game, chat or real-time user state across connected clients:

* 100 Durable Objects each have 100 Hibernatable WebSocket connections established to each of them.
* Clients send one message per minute, and it takes 10ms to process a single message in the `webSocketMessage()` handler. Since each Durable Object handles 100 WebSockets, cumulatively each Durable Object will be actively executing JS for 1 second each minute (100 WebSockets \* 10ms).

In this scenario, the estimated monthly cost would be calculated as:

**Requests**:

* 100 WebSocket connections \* 100 Durable Objects to establish the WebSockets = 10,000 initial WebSocket connection requests.
* 100 messages per minute1 \* 100 Durable Objects \* 60 minutes \* 24 hours \* 30 days = 432,000,000 requests.
* 10,000 + (432 million requests / 20 for WebSocket billing ratio) = 21,610,000 million requests.
* (21.6 million requests - included 1 million requests) x $0.15 / 1,000,000 = $3.09.

**Compute Duration**:

* 100 Durable Objects \* 1 second2 \* 60 minutes \* 24 hours \* 30 days = 4,320,000 seconds
* 4,320,000 seconds \* 128 MB / 1 GB = 552,960 GB-s
* (552,960 GB-s - included 400,000 GB-s) x $12.50 / 1,000,000 = $1.91

**Estimated total**: $3.09 (requests) + $1.91 (compute duration) + minimum $5/mo usage = $10.00 per month

1 100 messages per minute comes from the fact that 100 clients connect to each DO, and each sends 1 message per minute.

2 The example uses 1 second because each Durable Object is active for 1 second per minute. This can also be thought of as 432 million requests that each take 10 ms to execute (4,320,000 seconds).

## Frequently Asked Questions

### When does a Durable Object incur duration charges?

A Durable Object incurs duration charges when it is actively executing JavaScript — either handling a request or running event handlers — or when it is idle but does not meet the [conditions for hibernation](https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/). An idle Durable Object that qualifies for hibernation does not incur duration charges, even during the brief window before the runtime hibernates it.

Once an object has been evicted from memory, the next time it is needed, it will be recreated (calling the constructor again).

There are several factors that can prevent a Durable Object from hibernating and cause it to continue incurring duration charges.

Find more information in [Lifecycle of a Durable Object](https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/).

### Does an empty table / SQLite database contribute to my storage?

Yes, although minimal. Empty tables can consume at least a few kilobytes, based on the number of columns (table width) in the table. An empty SQLite database consumes approximately 12 KB of storage.

### Does metadata stored in Durable Objects count towards my storage?

All writes to a SQLite-backed Durable Object stores nominal amounts of metadata in internal tables in the Durable Object, which counts towards your billable storage.

The metadata remains in the Durable Object until you call [`deleteAll()`](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/#deleteall).

</page>

<page>
---
title: Choose a data or storage product · Cloudflare Durable Objects docs
lastUpdated: 2024-08-13T19:56:56.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/platform/storage-options/
  md: https://developers.cloudflare.com/durable-objects/platform/storage-options/index.md
---


</page>

<page>
---
title: Data location · Cloudflare Durable Objects docs
description: Jurisdictions are used to create Durable Objects that only run and
  store data within a region to comply with local regulations such as the GDPR
  or FedRAMP.
lastUpdated: 2025-05-30T16:32:37.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/reference/data-location/
  md: https://developers.cloudflare.com/durable-objects/reference/data-location/index.md
---

## Restrict Durable Objects to a jurisdiction

Jurisdictions are used to create Durable Objects that only run and store data within a region to comply with local regulations such as the [GDPR](https://gdpr-info.eu/) or [FedRAMP](https://blog.cloudflare.com/cloudflare-achieves-fedramp-authorization/).

Workers may still access Durable Objects constrained to a jurisdiction from anywhere in the world. The jurisdiction constraint only controls where the Durable Object itself runs and persists data. Consider using [Regional Services](https://developers.cloudflare.com/data-localization/regional-services/) to control the regions from which Cloudflare responds to requests.

Logging

A [`DurableObjectId`](https://developers.cloudflare.com/durable-objects/api/id) will be logged outside of the specified jurisdiction for billing and debugging purposes.

Durable Objects can be restricted to a specific jurisdiction by creating a [`DurableObjectNamespace`](https://developers.cloudflare.com/durable-objects/api/namespace/) restricted to a jurisdiction. All [Durable Object ID methods](https://developers.cloudflare.com/durable-objects/api/id/) are valid on IDs within a namespace restricted to a jurisdiction.

```js
const euSubnamespace = env.MY_DURABLE_OBJECT.jurisdiction("eu");
const euId = euSubnamespace.newUniqueId();
```

* It is possible to have the same name represent different IDs in different jurisdictions.

  ```js
  const euId1 = env.MY_DURABLE_OBJECT.idFromName("my-name");
  const euId2 = env.MY_DURABLE_OBJECT.jurisdiction("eu").idFromName("my-name");
  console.assert(!euId1.equal(euId2), "This should always be true");
  ```

* You will run into an error if the jurisdiction on your [`DurableObjectNamespace`](https://developers.cloudflare.com/durable-objects/api/namespace/) and the jurisdiction on [`DurableObjectId`](https://developers.cloudflare.com/durable-objects/api/id) are different.

* You will not run into an error if the [`DurableObjectNamespace`](https://developers.cloudflare.com/durable-objects/api/namespace/) is not associated with a jurisdiction.

* All [Durable Object ID methods](https://developers.cloudflare.com/durable-objects/api/id/) are valid on IDs within a namespace restricted to a jurisdiction.

  ```js
  const euSubnamespace = env.MY_DURABLE_OBJECT.jurisdiction("eu");
  const euId = euSubnamespace.idFromName(name);
  const stub = env.MY_DURABLE_OBJECT.get(euId);
  ```

Use `DurableObjectNamespace.jurisdiction`

When specifying a jurisdiction, Cloudflare recommends you first create a namespace restricted to a jurisdiction, using `const euSubnamespace = env.MY_DURABLE_OBJECT.jurisdiction("eu")`.

Note that it is also possible to specify a jurisdiction by creating an individual [`DurableObjectId`](https://developers.cloudflare.com/durable-objects/api/id) restricted to a jurisdiction, using `const euId = env.MY_DURABLE_OBJECT.newUniqueId({ jurisdiction: "eu" })`.

**However, Cloudflare does not recommend this approach.**

### Supported locations

| Parameter | Location |
| - | - |
| eu | The European Union |
| fedramp | FedRAMP-compliant data centers |

## Provide a location hint

Durable Objects, as with any stateful API, will often add response latency as requests must be forwarded to the data center where the Durable Object, or state, is located.

Durable Objects do not currently change locations after they are created1. By default, a Durable Object is instantiated in a data center close to where the initial `get()` request is made. This may not be in the same data center that the `get()` request is made from, but in most cases, it will be in close proximity.

Initial requests to Durable Objects

It can negatively impact latency to pre-create Durable Objects prior to the first client request or when the first client request is not representative of where the majority of requests will come from. It is better for latency to create Durable Objects in response to actual production traffic or provide explicit location hints.

Location hints are the mechanism provided to specify the location that a Durable Object should be located regardless of where the initial `get()` request comes from.

To manually create Durable Objects in another location, provide an optional `locationHint` parameter to `get()`. Only the first call to `get()` for a particular Object will respect the hint.

```js
let durableObjectStub = OBJECT_NAMESPACE.get(id, { locationHint: "enam" });
```

Warning

Hints are a best effort and not a guarantee. Unlike with jurisdictions, Durable Objects will not necessarily be instantiated in the hinted location, but instead instantiated in a data center selected to minimize latency from the hinted location.

### Supported locations

| Parameter | Location |
| - | - |
| wnam | Western North America |
| enam | Eastern North America |
| sam | South America 2 |
| weur | Western Europe |
| eeur | Eastern Europe |
| apac | Asia-Pacific |
| oc | Oceania |
| afr | Africa 2 |
| me | Middle East 2 |

1 Dynamic relocation of existing Durable Objects is planned for the future.

2 Durable Objects currently do not spawn in this location. Instead, the Durable Object will spawn in a nearby location which does support Durable Objects. For example, Durable Objects hinted to South America spawn in Eastern North America instead.

## Additional resources

* You can find our more about where Durable Objects are located using the website: [Where Durable Objects Live](https://where.durableobjects.live/).

</page>

<page>
---
title: Gradual Deployments · Cloudflare Durable Objects docs
description: Gradually deploy changes to Durable Objects.
lastUpdated: 2024-08-13T19:56:56.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/reference/durable-object-gradual-deployments/
  md: https://developers.cloudflare.com/durable-objects/reference/durable-object-gradual-deployments/index.md
---


</page>

<page>
---
title: Data security · Cloudflare Durable Objects docs
description: "This page details the data security properties of Durable Objects, including:"
lastUpdated: 2024-08-13T19:56:56.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/reference/data-security/
  md: https://developers.cloudflare.com/durable-objects/reference/data-security/index.md
---

This page details the data security properties of Durable Objects, including:

* Encryption-at-rest (EAR).
* Encryption-in-transit (EIT).
* Cloudflare's compliance certifications.

## Encryption at Rest

All Durable Object data, including metadata, is encrypted at rest. Encryption and decryption are automatic, do not require user configuration to enable, and do not impact the effective performance of Durable Objects.

Encryption keys are managed by Cloudflare and securely stored in the same key management systems we use for managing encrypted data across Cloudflare internally.

Encryption at rest is implemented using the Linux Unified Key Setup (LUKS) disk encryption specification and [AES-256](https://www.cloudflare.com/learning/ssl/what-is-encryption/), a widely tested, highly performant and industry-standard encryption algorithm.

## Encryption in Transit

Data transfer between a Cloudflare Worker, and/or between nodes within the Cloudflare network and Durable Objects is secured using the same [Transport Layer Security](https://www.cloudflare.com/learning/ssl/transport-layer-security-tls/) (TLS/SSL).

API access via the HTTP API or using the [wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) command-line interface is also over TLS/SSL (HTTPS).

## Compliance

To learn more about Cloudflare's adherence to industry-standard security compliance certifications, visit the Cloudflare [Trust Hub](https://www.cloudflare.com/trust-hub/compliance-resources/).

</page>

<page>
---
title: Durable Objects migrations · Cloudflare Durable Objects docs
description: A migration is a mapping process from a class name to a runtime
  state. This process communicates the changes to the Workers runtime and
  provides the runtime with instructions on how to deal with those changes.
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/
  md: https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/index.md
---

A migration is a mapping process from a class name to a runtime state. This process communicates the changes to the Workers runtime and provides the runtime with instructions on how to deal with those changes.

To apply a migration, you need to:

1. Edit your Wrangler configuration file, as explained below.
2. Re-deploy your Worker using `npx wrangler deploy`.

You must initiate a migration process when you:

* Create a new Durable Object class.
* Rename a Durable Object class.
* Delete a Durable Object class.
* Transfer an existing Durable Objects class.

Note

Updating the code for an existing Durable Object class does not require a migration. To update the code for an existing Durable Object class, run [`npx wrangler deploy`](https://developers.cloudflare.com/workers/wrangler/commands/#deploy). This is true even for changes to how the code interacts with persistent storage. Because of [global uniqueness](https://developers.cloudflare.com/durable-objects/platform/known-issues/#global-uniqueness), you do not have to be concerned about old and new code interacting with the same storage simultaneously. However, it is your responsibility to ensure that the new code is backwards compatible with existing stored data.

## Create migration

The most common migration performed is a new class migration, which informs the runtime that a new Durable Object class is being uploaded. This is also the migration you need when creating your first Durable Object class.

To apply a Create migration:

1. Add the following lines to your Wrangler configuration file:

   * wrangler.jsonc

     ```jsonc
     {
       "migrations": [
         {
           "tag": "<v1>", // Migration identifier. This should be unique for each migration entry
           "new_sqlite_classes": [ // Array of new classes
             "<NewDurableObjectClass>"
           ]
         }
       ]
     }
     ```

   * wrangler.toml

     ```toml
     [[migrations]]
     tag = "<v1>"
     new_sqlite_classes = [ "<NewDurableObjectClass>" ]
     ```

   The Create migration contains:

   * A `tag` to identify the migration.
   * The array `new_sqlite_classes`, which contains the new Durable Object class.

2. Ensure you reference the correct name of the Durable Object class in your Worker code.

3. Deploy the Worker.

Create migration example

To create a new Durable Object binding `DURABLE_OBJECT_A`, your Wrangler configuration file should look like the following:

* wrangler.jsonc

  ```jsonc
  {
    // Creating a new Durable Object class
    "durable_objects": {
      "bindings": [
        {
          "name": "DURABLE_OBJECT_A",
          "class_name": "DurableObjectAClass"
        }
      ]
    },
    // Add the lines below for a Create migration.
    "migrations": [
      {
        "tag": "v1",
        "new_sqlite_classes": [
          "DurableObjectAClass"
        ]
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  [[durable_objects.bindings]]
  name = "DURABLE_OBJECT_A"
  class_name = "DurableObjectAClass"


  [[migrations]]
  tag = "v1"
  new_sqlite_classes = [ "DurableObjectAClass" ]
  ```

### Create Durable Object class with key-value storage

Recommended SQLite-backed Durable Objects

Cloudflare recommends all new Durable Object namespaces use the [SQLite storage backend](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#create-sqlite-backed-durable-object-class). These Durable Objects can continue to use storage [key-value API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/#synchronous-kv-api).

Additionally, SQLite-backed Durable Objects allow you to store more types of data (such as tables), and offer Point In Time Recovery API which can restore a Durable Object's embedded SQLite database contents (both SQL data and key-value data) to any point in the past 30 days.

The [key-value storage backend](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/#create-durable-object-class-with-key-value-storage) remains for backwards compatibility, and a migration path from KV storage backend to SQLite storage backend for existing Durable Object namespaces will be available in the future.

Use `new_classes` on the migration in your Worker's Wrangler file to create a Durable Object class with the key-value storage backend:

* wrangler.jsonc

  ```jsonc
  {
    "migrations": [
      {
        "tag": "v1", // Should be unique for each entry
        "new_classes": [
          // Array of new classes
          "MyDurableObject",
        ],
      },
    ],
  }
  ```

* wrangler.toml

  ```toml
  [[migrations]]
  tag = "v1"
  new_classes = [ "MyDurableObject" ]
  ```

Note

Durable Objects are available both on Workers Free and Workers Paid plans.

* **Workers Free plan**: Only Durable Objects with [SQLite storage backend](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#wrangler-configuration-for-sqlite-backed-durable-objects) are available.
* **Workers Paid plan**: Durable Objects with either SQLite storage backend or [key-value storage backend](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/#create-durable-object-class-with-key-value-storage) are available.

If you wish to downgrade from a Workers Paid plan to a Workers Free plan, you must first ensure that you have deleted all Durable Object namespaces with the key-value storage backend.

## Delete migration

Running a Delete migration will delete all Durable Objects associated with the deleted class, including all of their stored data.

* Do not run a Delete migration on a class without first ensuring that you are not relying on the Durable Objects within that Worker anymore, that is, first remove the binding from the Worker.
* Copy any important data to some other location before deleting.
* You do not have to run a Delete migration on a class that was renamed or transferred.

To apply a Delete migration:

1. Remove the binding for the class you wish to delete from the Wrangler configuration file.

2. Remove references for the class you wish to delete from your Worker code.

3. Add the following lines to your Wrangler configuration file.

   * wrangler.jsonc

     ```jsonc
     {
       "migrations": [
         {
           "tag": "<v2>", // Migration identifier. This should be unique for each migration entry
           "deleted_classes": [ // Array of deleted class names
             "<ClassToDelete>"
           ]
         }
       ]
     }
     ```

   * wrangler.toml

     ```toml
     [[migrations]]
     tag = "<v2>"
     deleted_classes = [ "<ClassToDelete>" ]
     ```

   The Delete migration contains:

   * A `tag` to identify the migration.
   * The array `deleted_classes`, which contains the deleted Durable Object classes.

4. Deploy the Worker.

Delete migration example

To delete a Durable Object binding `DEPRECATED_OBJECT`, your Wrangler configuration file should look like the following:

* wrangler.jsonc

  ```jsonc
  {
    // Remove the binding for the DeprecatedObjectClass DO
    // {"durable_objects": {"bindings": [
    //   {
    //     "name": "DEPRECATED_OBJECT",
    //     "class_name": "DeprecatedObjectClass"
    //   }
    // ]}}
    "migrations": [
      {
        "tag": "v3", // Should be unique for each entry
        "deleted_classes": [ // Array of deleted classes
          "DeprecatedObjectClass"
        ]
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  [[migrations]]
  tag = "v3"
  deleted_classes = [ "DeprecatedObjectClass" ]
  ```

## Rename migration

Rename migrations are used to transfer stored Durable Objects between two Durable Object classes in the same Worker code file.

To apply a Rename migration:

1. Update the previous class name to the new class name by editing your Wrangler configuration file in the following way:

   * wrangler.jsonc

     ```jsonc
     {
       "durable_objects": {
         "bindings": [
           {
             "name": "<MY_DURABLE_OBJECT>",
             "class_name": "<UpdatedDurableObject>" // Update the class name to the new class name
           }
         ]
       },
       "migrations": [
         {
           "tag": "<v3>", // Migration identifier. This should be unique for each migration entry
           "renamed_classes": [ // Array of rename directives
             {
               "from": "<OldDurableObject>",
               "to": "<UpdatedDurableObject>"
             }
           ]
         }
       ]
     }
     ```

   * wrangler.toml

     ```toml
     [[durable_objects.bindings]]
     name = "<MY_DURABLE_OBJECT>"
     class_name = "<UpdatedDurableObject>"


     [[migrations]]
     tag = "<v3>"


       [[migrations.renamed_classes]]
       from = "<OldDurableObject>"
       to = "<UpdatedDurableObject>"
     ```

   The Rename migration contains:

   * A `tag` to identify the migration.

   * The `renamed_classes` array, which contains objects with `from` and `to` properties.

     * `from` property is the old Durable Object class name.
     * `to` property is the renamed Durable Object class name.

2. Reference the new Durable Object class name in your Worker code.

3. Deploy the Worker.

Rename migration example

To rename a Durable Object class, from `OldName` to `UpdatedName`, your Wrangler configuration file should look like the following:

* wrangler.jsonc

  ```jsonc
  {
    // Before deleting the `DeprecatedClass` remove the binding for the `DeprecatedClass`.
    // Update the binding for the `DurableObjectExample` to the new class name `UpdatedName`.
    "durable_objects": {
      "bindings": [
        {
          "name": "MY_DURABLE_OBJECT",
          "class_name": "UpdatedName"
        }
      ]
    },
    // Renaming classes
    "migrations": [
      {
        "tag": "v3",
        "renamed_classes": [ // Array of rename directives
          {
            "from": "OldName",
            "to": "UpdatedName"
          }
        ]
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  [[durable_objects.bindings]]
  name = "MY_DURABLE_OBJECT"
  class_name = "UpdatedName"


  [[migrations]]
  tag = "v3"


    [[migrations.renamed_classes]]
    from = "OldName"
    to = "UpdatedName"
  ```

## Transfer migration

Transfer migrations are used to transfer stored Durable Objects between two Durable Object classes in different Worker code files.

If you want to transfer stored Durable Objects between two Durable Object classes in the same Worker code file, use [Rename migrations](#rename-migration) instead.

Note

Do not run a [Create migration](#create-migration) for the destination class before running a Transfer migration. The Transfer migration will create the destination class for you.

To apply a Transfer migration:

1. Edit your Wrangler configuration file in the following way:

   * wrangler.jsonc

     ```jsonc
     {
       "durable_objects": {
         "bindings": [
           {
             "name": "<MY_DURABLE_OBJECT>",
             "class_name": "<DestinationDurableObjectClass>"
           }
         ]
       },
       "migrations": [
         {
           "tag": "<v4>", // Migration identifier. This should be unique for each migration entry
           "transferred_classes": [
             {
               "from": "<SourceDurableObjectClass>",
               "from_script": "<SourceWorkerScript>",
               "to": "<DestinationDurableObjectClass>"
             }
           ]
         }
       ]
     }
     ```

   * wrangler.toml

     ```toml
     [[durable_objects.bindings]]
     name = "<MY_DURABLE_OBJECT>"
     class_name = "<DestinationDurableObjectClass>"


     [[migrations]]
     tag = "<v4>"


       [[migrations.transferred_classes]]
       from = "<SourceDurableObjectClass>"
       from_script = "<SourceWorkerScript>"
       to = "<DestinationDurableObjectClass>"
     ```

   The Transfer migration contains:

   * A `tag` to identify the migration.

   * The `transferred_class` array, which contains objects with `from`, `from_script`, and `to` properties.

     * `from` property is the name of the source Durable Object class.
     * `from_script` property is the name of the source Worker script.
     * `to` property is the name of the destination Durable Object class.

2. Ensure you reference the name of the new, destination Durable Object class in your Worker code.

3. Deploy the Worker.

Transfer migration example

You can transfer stored Durable Objects from `DurableObjectExample` to `TransferredClass` from a Worker script named `OldWorkerScript`. The configuration of the Wrangler configuration file for your new Worker code (destination Worker code) would look like this:

* wrangler.jsonc

  ```jsonc
  {
    // destination worker
    "durable_objects": {
      "bindings": [
        {
          "name": "MY_DURABLE_OBJECT",
          "class_name": "TransferredClass"
        }
      ]
    },
    // Transferring class
    "migrations": [
      {
        "tag": "v4",
        "transferred_classes": [
          {
            "from": "DurableObjectExample",
            "from_script": "OldWorkerScript",
            "to": "TransferredClass"
          }
        ]
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  [[durable_objects.bindings]]
  name = "MY_DURABLE_OBJECT"
  class_name = "TransferredClass"


  [[migrations]]
  tag = "v4"


    [[migrations.transferred_classes]]
    from = "DurableObjectExample"
    from_script = "OldWorkerScript"
    to = "TransferredClass"
  ```

## Migration Wrangler configuration

* Migrations are performed through the `[[migrations]]` configurations key in your `wrangler.toml` file or `migration` key in your `wrangler.jsonc` file.

* Migrations require a migration tag, which is defined by the `tag` property in each migration entry.

* Migration tags are treated like unique names and are used to determine which migrations have already been applied. Once a given Worker code has a migration tag set on it, all future Worker code deployments must include a migration tag.

* The migration list is an ordered array of tables, specified as a key in your Wrangler configuration file.

* You can define the migration for each environment, as well as at the top level.

  * Top-level migration is specified at the top-level `migrations` key in the Wrangler configuration file.

  * Environment-level migration is specified by a `migrations` key inside the `env` key of the Wrangler configuration file (`[env.<environment_name>.migrations]`).

    * Example Wrangler file:

    ```jsonc
    {
    // top-level default migrations
    "migrations": [{ ... }],
    "env": {
    "staging": {
      // migration override for staging
      "migrations": [{...}]
      }
     }
    }
    ```

  * If a migration is only specified at the top-level, but not at the environment-level, the environment will inherit the top-level migration.

  * Migrations at at the environment-level override migrations at the top level.

* All migrations are applied at deployment. Each migration can only be applied once per [environment](https://developers.cloudflare.com/durable-objects/reference/environments/).

* Each migration in the list can have multiple directives, and multiple migrations can be specified as your project grows in complexity.

Important

* The destination class (the class that stored Durable Objects are being transferred to) for a Rename or Transfer migration must be exported by the deployed Worker.

* You should not create the destination Durable Object class before running a Rename or Transfer migration. The migration will create the destination class for you.

* After a Rename or Transfer migration, requests to the destination Durable Object class will have access to the source Durable Object's stored data.

* After a migration, any existing bindings to the original Durable Object class (for example, from other Workers) will automatically forward to the updated destination class. However, any Workers bound to the updated Durable Object class must update their Durable Object binding configuration in the `wrangler` configuration file for their next deployment.

Note

Note that `.toml` files do not allow line breaks in inline tables (the `{key = "value"}` syntax), but line breaks in the surrounding inline array are acceptable.

You cannot enable a SQLite storage backend on an existing, deployed Durable Object class, so setting `new_sqlite_classes` on later migrations will fail with an error. Automatic migration of deployed classes from their key-value storage backend to SQLite storage backend will be available in the future.

Important

Durable Object migrations are atomic operations and cannot be gradually deployed. To provide early feedback to developers, new Worker versions with new migrations cannot be uploaded. Refer to [Gradual deployments for Durable Objects](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/gradual-deployments/#gradual-deployments-for-durable-objects) for more information.

</page>

<page>
---
title: Environments · Cloudflare Durable Objects docs
description: Environments provide isolated spaces where your code runs with
  specific dependencies and configurations. This can be useful for a number of
  reasons, such as compatibility testing or version management. Using different
  environments can help with code consistency, testing, and production
  segregation, which reduces the risk of errors when deploying code.
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/reference/environments/
  md: https://developers.cloudflare.com/durable-objects/reference/environments/index.md
---

Environments provide isolated spaces where your code runs with specific dependencies and configurations. This can be useful for a number of reasons, such as compatibility testing or version management. Using different environments can help with code consistency, testing, and production segregation, which reduces the risk of errors when deploying code.

## Wrangler environments

[Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) allows you to deploy the same Worker application with different configuration for each [environment](https://developers.cloudflare.com/workers/wrangler/environments/).

If you are using Wrangler environments, you must specify any [Durable Object bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/) you wish to use on a per-environment basis.

Durable Object bindings are not inherited. For example, you can define an environment named `staging` as below:

* wrangler.jsonc

  ```jsonc
  {
    "env": {
      "staging": {
        "durable_objects": {
          "bindings": [
            {
              "name": "EXAMPLE_CLASS",
              "class_name": "DurableObjectExample"
            }
          ]
        }
      }
    }
  }
  ```

* wrangler.toml

  ```toml
  [[env.staging.durable_objects.bindings]]
  name = "EXAMPLE_CLASS"
  class_name = "DurableObjectExample"
  ```

Because Wrangler appends the [environment name](https://developers.cloudflare.com/workers/wrangler/environments/) to the top-level name when publishing, for a Worker named `worker-name` the above example is equivalent to:

* wrangler.jsonc

  ```jsonc
  {
    "env": {
      "staging": {
        "durable_objects": {
          "bindings": [
            {
              "name": "EXAMPLE_CLASS",
              "class_name": "DurableObjectExample",
              "script_name": "worker-name-staging"
            }
          ]
        }
      }
    }
  }
  ```

* wrangler.toml

  ```toml
  [[env.staging.durable_objects.bindings]]
  name = "EXAMPLE_CLASS"
  class_name = "DurableObjectExample"
  script_name = "worker-name-staging"
  ```

`"EXAMPLE_CLASS"` in the staging environment is bound to a different Worker code name compared to the top-level `"EXAMPLE_CLASS"` binding, and will therefore access different Durable Objects with different persistent storage.

If you want an environment-specific binding that accesses the same Objects as the top-level binding, specify the top-level Worker code name explicitly using `script_name`:

* wrangler.jsonc

  ```jsonc
  {
    "env": {
      "another": {
        "durable_objects": {
          "bindings": [
            {
              "name": "EXAMPLE_CLASS",
              "class_name": "DurableObjectExample",
              "script_name": "worker-name"
            }
          ]
        }
      }
    }
  }
  ```

* wrangler.toml

  ```toml
  [[env.another.durable_objects.bindings]]
  name = "EXAMPLE_CLASS"
  class_name = "DurableObjectExample"
  script_name = "worker-name"
  ```

### Migration environments

You can define a Durable Object migration for each environment, as well as at the top level. Migrations at at the environment-level override migrations at the top level.

For more information, refer to [Migration Wrangler Configuration](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/#migration-wrangler-configuration).

## Local development

Local development sessions create a standalone, local-only environment that mirrors the production environment, so that you can test your Worker and Durable Objects before you deploy to production.

An existing Durable Object binding of `DB` would be available to your Worker when running locally.

Refer to Workers [Local development](https://developers.cloudflare.com/workers/development-testing/bindings-per-env/).

## Remote development

KV-backed Durable Objects support remote development using the dashboard playground. The dashboard playground uses a browser version of Visual Studio Code, allowing you to rapidly iterate on your Worker entirely in your browser.

To start remote development:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select an existing Worker.

3. Select the **Edit code** icon located on the upper-right of the screen.

Warning

Remote development is only available for KV-backed Durable Objects. SQLite-backed Durable Objects do not support remote development.

</page>

<page>
---
title: FAQs · Cloudflare Durable Objects docs
description: A Durable Object incurs duration charges when it is actively
  executing JavaScript — either handling a request or running event handlers —
  or when it is idle but does not meet the conditions for hibernation. An idle
  Durable Object that qualifies for hibernation does not incur duration charges,
  even during the brief window before the runtime hibernates it.
lastUpdated: 2025-09-17T14:35:09.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/reference/faq/
  md: https://developers.cloudflare.com/durable-objects/reference/faq/index.md
---

## Pricing

### When does a Durable Object incur duration charges?

A Durable Object incurs duration charges when it is actively executing JavaScript — either handling a request or running event handlers — or when it is idle but does not meet the [conditions for hibernation](https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/). An idle Durable Object that qualifies for hibernation does not incur duration charges, even during the brief window before the runtime hibernates it.

Once an object has been evicted from memory, the next time it is needed, it will be recreated (calling the constructor again).

There are several factors that can prevent a Durable Object from hibernating and cause it to continue incurring duration charges.

Find more information in [Lifecycle of a Durable Object](https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/).

### Does an empty table / SQLite database contribute to my storage?

Yes, although minimal. Empty tables can consume at least a few kilobytes, based on the number of columns (table width) in the table. An empty SQLite database consumes approximately 12 KB of storage.

### Does metadata stored in Durable Objects count towards my storage?

All writes to a SQLite-backed Durable Object stores nominal amounts of metadata in internal tables in the Durable Object, which counts towards your billable storage.

The metadata remains in the Durable Object until you call [`deleteAll()`](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/#deleteall).

## Limits

### How much work can a single Durable Object do?

Durable Objects can scale horizontally across many Durable Objects. Each individual Object is inherently single-threaded.

* An individual Object has a soft limit of 1,000 requests per second. You can have an unlimited number of individual objects per namespace.
* A simple [storage](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/) `get()` on a small value that directly returns the response may realize a higher request throughput compared to a Durable Object that (for example) serializes and/or deserializes large JSON values.
* Similarly, a Durable Object that performs multiple `list()` operations may be more limited in terms of request throughput.

A Durable Object that receives too many requests will, after attempting to queue them, return an [overloaded](https://developers.cloudflare.com/durable-objects/observability/troubleshooting/#durable-object-is-overloaded) error to the caller.

### How many Durable Objects can I create?

Durable Objects are designed such that the number of individual objects in the system do not need to be limited, and can scale horizontally.

* You can create and run as many separate Durable Objects as you want within a given Durable Object namespace.
* There are no limits for storage per account when using SQLite-backed Durable Objects on a Workers Paid plan.
* Each SQLite-backed Durable Object has a storage limit of 10 GB on a Workers Paid plan.
* Refer to [Durable Object limits](https://developers.cloudflare.com/durable-objects/platform/limits/) for more information.

### Can I increase Durable Objects' CPU limit?

Durable Objects are Worker scripts, and have the same [per invocation CPU limits](https://developers.cloudflare.com/workers/platform/limits/#worker-limits) as any Workers do. Note that CPU time is active processing time: not time spent waiting on network requests, storage calls, or other general I/O, which don't count towards your CPU time or Durable Objects compute consumption.

By default, the maximum CPU time per Durable Objects invocation (HTTP request, WebSocket message, or Alarm) is set to 30 seconds, but can be increased for all Durable Objects associated with a Durable Object definition by setting `limits.cpu_ms` in your Wrangler configuration:

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

## Metrics and analytics

### How can I identify which Durable Object instance generated a log entry?

You can use `$workers.durableObjectId` to identify the specific Durable Object instance that generated the log entry.

</page>

<page>
---
title: Glossary · Cloudflare Durable Objects docs
description: Review the definitions for terms used across Cloudflare's Durable
  Objects documentation.
lastUpdated: 2024-10-31T15:59:06.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/reference/glossary/
  md: https://developers.cloudflare.com/durable-objects/reference/glossary/index.md
---

Review the definitions for terms used across Cloudflare's Durable Objects documentation.

| Term | Definition |
| - | - |
| alarm | A Durable Object alarm is a mechanism that allows you to schedule the Durable Object to be woken up at a time in the future. |
| bookmark | A bookmark is a mostly alphanumeric string like `0000007b-0000b26e-00001538-0c3e87bb37b3db5cc52eedb93cd3b96b` which represents a specific state of a SQLite database at a certain point in time. Bookmarks are designed to be lexically comparable: a bookmark representing an earlier point in time compares less than one representing a later point, using regular string comparison. |
| Durable Object | A Durable Object is an individual instance of a Durable Object class. A Durable Object is globally unique (referenced by ID), provides a global point of coordination for all methods/requests sent to it, and has private, persistent storage that is not shared with other Durable Objects within a namespace. |
| Durable Object class | The JavaScript class that defines the methods (RPC) and handlers (`fetch`, `alarm`) as part of your Durable Object, and/or an optional `constructor`. All Durable Objects within a single namespace share the same class definition. |
| Durable Objects | The product name, or the collective noun referring to more than one Durable Object. |
| input gate | While a storage operation is executing, no events shall be delivered to a Durable Object except for storage completion events. Any other events will be deferred until such a time as the object is no longer executing JavaScript code and is no longer waiting for any storage operations. We say that these events are waiting for the "input gate" to open. |
| instance | See "Durable Object". |
| KV API | API methods part of Storage API that support persisting key-value data. |
| migration | A Durable Object migration is a mapping process from a class name to a runtime state. Initiate a Durable Object migration when you need to:- Create a new Durable Object class.
- Rename a Durable Object class.
- Delete a Durable Object class.
- Transfer an existing Durable Objects class. |
| namespace | A logical collection of Durable Objects that all share the same Durable Object (class) definition. A single namespace can have (tens of) millions of Durable Objects. Metrics are scoped per namespace.- The binding name of the namespace (as it will be exposed inside Worker code) is defined in the Wrangler file under the `durable_objects.bindings.name` key. Note that the binding name may not uniquely identify a namespace within an account. Instead, each namespace has a unique namespace ID, which you can view from the Cloudflare dashboard.
- You can instantiate a unique Durable Object within a namespace using [Durable Object namespace methods](https://developers.cloudflare.com/durable-objects/api/namespace/#methods). |
| output gate | When a storage write operation is in progress, any new outgoing network messages will be held back until the write has completed. We say that these messages are waiting for the "output gate" to open. If the write ultimately fails, the outgoing network messages will be discarded and replaced with errors, while the Durable Object will be shut down and restarted from scratch. |
| SQL API | API methods part of Storage API that support SQL querying. |
| Storage API | The transactional and strongly consistent (serializable) [Storage API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/) for persisting data within each Durable Object. State stored within a unique Durable Object is "private" to that Durable Object, and not accessible from other Durable Objects.Storage API includes key-value (KV) API, SQL API, and point-in-time-recovery (PITR) API.- Durable Object classes with the key-value storage backend can use KV API.
- Durable Object classes with the SQLite storage backend can use KV API, SQL API, and PITR API. |
| Storage Backend | By default, a Durable Object class can use Storage API that leverages a key-value storage backend. New Durable Object classes can opt-in to using a [SQLite storage backend](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#sqlite-storage-backend). |
| stub | An object that refers to a unique Durable Object within a namespace and allows you to call into that Durable Object via RPC methods or the `fetch` API. For example, `let stub = env.MY_DURABLE_OBJECT.get(id)` |

</page>

<page>
---
title: In-memory state in a Durable Object · Cloudflare Durable Objects docs
description: In-memory state means that each Durable Object has one active
  instance at any particular time. All requests sent to that Durable Object are
  handled by that same instance. You can store some state in memory.
lastUpdated: 2025-09-24T13:21:38.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/durable-objects/reference/in-memory-state/
  md: https://developers.cloudflare.com/durable-objects/reference/in-memory-state/index.md
---

In-memory state means that each Durable Object has one active instance at any particular time. All requests sent to that Durable Object are handled by that same instance. You can store some state in memory.

Variables in a Durable Object will maintain state as long as your Durable Object is not evicted from memory.

A common pattern is to initialize a Durable Object from [persistent storage](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/) and set instance variables the first time it is accessed. Since future accesses are routed to the same Durable Object, it is then possible to return any initialized values without making further calls to persistent storage.

```js
import { DurableObject } from "cloudflare:workers";


export class Counter extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    // `blockConcurrencyWhile()` ensures no requests are delivered until
    // initialization completes.
    this.ctx.blockConcurrencyWhile(async () => {
      let stored = await this.ctx.storage.get("value");
      // After initialization, future reads do not need to access storage.
      this.value = stored || 0;
    });
  }


  // Handle HTTP requests from clients.
  async fetch(request) {
    // use this.value rather than storage
  }
}
```

A given instance of a Durable Object may share global memory with other instances defined in the same Worker code.

In the example above, using a global variable `value` instead of the instance variable `this.value` would be incorrect. Two different instances of `Counter` will each have their own separate memory for `this.value`, but might share memory for the global variable `value`, leading to unexpected results. Because of this, it is best to avoid global variables.

Built-in caching

The Durable Object's storage has a built-in in-memory cache of its own. If you use `get()` to retrieve a value that was read or written recently, the result will be instantly returned from cache. Instead of writing initialization code like above, you could use `get("value")` whenever you need it, and rely on the built-in cache to make this fast. Refer to the [Build a counter example](https://developers.cloudflare.com/durable-objects/examples/build-a-counter/) to learn more about this approach.

However, in applications with more complex state, explicitly storing state in your Object may be easier than making Storage API calls on every access. Depending on the configuration of your project, write your code in the way that is easiest for you.

</page>

<page>
---
title: Build a seat booking app with SQLite in Durable Objects · Cloudflare
  Durable Objects docs
description: This tutorial shows you how to build a seat reservation app using
  Durable Objects.
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
tags: TypeScript,SQL
source_url:
  html: https://developers.cloudflare.com/durable-objects/tutorials/build-a-seat-booking-app/
  md: https://developers.cloudflare.com/durable-objects/tutorials/build-a-seat-booking-app/index.md
---

In this tutorial, you will learn how to build a seat reservation app using Durable Objects. This app will allow users to book a seat for a flight. The app will be written in TypeScript and will use the new [SQLite storage backend in Durable Object](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#sqlite-storage-backend) to store the data.

Using Durable Objects, you can write reusable code that can handle coordination and state management for multiple clients. Moreover, writing data to SQLite in Durable Objects is synchronous and uses local disks, therefore all queries are executed with great performance. You can learn more about SQLite storage in Durable Objects in the [SQLite in Durable Objects blog post](https://blog.cloudflare.com/sqlite-in-durable-objects).

SQLite in Durable Objects

SQLite in Durable Objects is currently in beta. You can learn more about the limitations of SQLite in Durable Objects in the [SQLite in Durable Objects documentation](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#sqlite-storage-backend).

The application will function as follows:

* A user navigates to the application with a flight number passed as a query parameter.
* The application will create a new Durable Object for the flight number, if it does not already exist.
* If the Durable Object already exists, the application will retrieve the seats information from the SQLite database.
* If the Durable Object does not exist, the application will create a new Durable Object and initialize the SQLite database with the seats information. For the purpose of this tutorial, the seats information is hard-coded in the application.
* When a user selects a seat, the application asks for their name. The application will then reserve the seat and store the name in the SQLite database.
* The application also broadcasts any changes to the seats to all clients.

Let's get started!

## Prerequisites

1. Sign up for a [Cloudflare account](https://dash.cloudflare.com/sign-up/workers-and-pages).
2. Install [`Node.js`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

Node.js version manager

Use a Node version manager like [Volta](https://volta.sh/) or [nvm](https://github.com/nvm-sh/nvm) to avoid permission issues and change Node.js versions. [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/), discussed later in this guide, requires a Node version of `16.17.0` or later.

## 1. Create a new project

Create a new Worker project to create and deploy your app.

1. Create a Worker named `seat-booking` by running:

   * npm

     ```sh
     npm create cloudflare@latest -- seat-booking
     ```

   * yarn

     ```sh
     yarn create cloudflare seat-booking
     ```

   * pnpm

     ```sh
     pnpm create cloudflare@latest seat-booking
     ```

   For setup, select the following options:

   * For *What would you like to start with?*, choose `Hello World example`.
   * For *Which template would you like to use?*, choose `Worker + Durable Objects`.
   * For *Which language do you want to use?*, choose `TypeScript`.
   * For *Do you want to use git for version control?*, choose `Yes`.
   * For *Do you want to deploy your application?*, choose `No` (we will be making some changes before deploying).

2. Change into your new project directory to start developing:

```sh
cd seat-booking
```

## 2. Create the frontend

The frontend of the application is a simple HTML page that allows users to select a seat and enter their name. The application uses [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/binding/) to serve the frontend.

1. Create a new directory named `public` in the project root.

2. Create a new file named `index.html` in the `public` directory.

3. Add the following HTML code to the `index.html` file:

public/index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Flight Seat Booking</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
        background-color: #f0f0f0;
      }
      .booking-container {
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      .seat-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 10px;
        margin-top: 20px;
      }
      .aisle {
        grid-column: 4;
      }
      .seat {
        width: 40px;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid #ccc;
        cursor: pointer;
      }
      .seat.available {
        background-color: #5dbf61ba;
        color: white;
      }
      .seat.unavailable {
        background-color: #f4433673;
        color: white;
        cursor: not-allowed;
      }
      .airplane {
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: #f0f0f0;
        padding: 20px;
        border-radius: 20px;
      }
    </style>
  </head>
  <body>
    <div class="booking-container">
      <h2 id="title"></h2>
      <div class="airplane">
        <div id="seatGrid" class="seat-grid"></div>
      </div>
    </div>


      <script>
        const seatGrid = document.getElementById("seatGrid");
        const title = document.getElementById("title");


        const flightId = window.location.search.split("=")[1];


        const hostname = window.location.hostname;


        if (flightId === undefined) {
          title.textContent = "No Flight ID provided";
          seatGrid.innerHTML = "<p>Add `flightId` to the query string</p>";
        } else {
          handleBooking();
        }


        function handleBooking() {
          let ws;
          if (hostname === 'localhost') {
            const port = window.location.port;
            ws = new WebSocket(`ws://${hostname}:${port}/ws?flightId=${flightId}`);
          } else {
            ws = new WebSocket(`wss://${hostname}/ws?flightId=${flightId}`);
          }


          title.textContent = `Book seat for flight ${flightId}`;


          ws.onopen = () => {
            console.log("Connected to WebSocket server");
          };


          function createSeatGrid(seats) {
            seatGrid.innerHTML = "";
            for (let row = 1; row <= 10; row++) {
              for (let col = 0; col < 6; col++) {
                if (col === 3) {
                  const aisle = document.createElement("div");
                  aisle.className = "aisle";
                  seatGrid.appendChild(aisle);
                }


                const seatNumber = `${row}${String.fromCharCode(65 + col)}`;
                const seat = seats.find((s) => s.seatNumber === seatNumber);
                const seatElement = document.createElement("div");
                seatElement.className = `seat ${seat && seat.occupant ? "unavailable" : "available"}`;
                seatElement.textContent = seatNumber;
                seatElement.onclick = () => bookSeat(seatNumber);
                seatGrid.appendChild(seatElement);
              }
            }
          }


          async function fetchSeats() {
            const response = await fetch(`/seats?flightId=${flightId}`);
            const seats = await response.json();
            createSeatGrid(seats);
          }


          async function bookSeat(seatNumber) {
            const name = prompt("Please enter your name:");
            if (!name) {
              return; // User canceled the prompt
            }


            const response = await fetch(`book-seat?flightId=${flightId}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ seatNumber, name }),
            });
            const result = await response.text();
            fetchSeats();
          }


          ws.onmessage = (event) => {
            try {
              const seats = JSON.parse(event.data);
              createSeatGrid(seats);
            } catch (error) {
              console.error("Error parsing WebSocket message:", error);
            }
          };


          ws.onerror = (error) => {
            console.error("WebSocket error:", error);
          };


          ws.onclose = (event) => {
            console.log("WebSocket connection closed:", event);
          };


          fetchSeats();
        }
      </script>
    </body>


</html>
```

* The frontend makes an HTTP `GET` request to the `/seats` endpoint to retrieve the available seats for the flight.
* It also uses a WebSocket connection to receive updates about the available seats.
* When a user clicks on a seat, the `bookSeat()` function is called that prompts the user to enter their name and then makes a `POST` request to the `/book-seat` endpoint.

1. Update the bindings in the [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) to configure `assets` to serve the `public` directory.

* wrangler.jsonc

  ```jsonc
  {
    "assets": {
      "directory": "public"
    }
  }
  ```

* wrangler.toml

  ```toml
  [assets]
  directory = "public"
  ```

1. If you start the development server using the following command, the frontend will be served at `http://localhost:8787`. However, it will not work because the backend is not yet implemented.

```bash
npm run dev
```

Workers Static Assets

[Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/binding/) is currently in beta. You can also use Cloudflare Pages to serve the frontend. However, you will need a separate Worker for the backend.

## 3. Create table for each flight

The application already has the binding for the Durable Objects class configured in the [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/). If you update the name of the Durable Objects class in `src/index.ts`, make sure to also update the binding in the [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/).

1. Update the binding to use the SQLite storage in Durable Objects. In the [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/), replace `new_classes=["Flight"]` with `new_sqlite_classes=["Flight"]`, `name = "FLIGHT"` with `name = "FLIGHT"`, and `class_name = "MyDurableObject"` with `class_name = "Flight"`. your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) should look similar to this:

* wrangler.jsonc

  ```jsonc
  {
    "durable_objects": {
      "bindings": [
        {
          "name": "FLIGHT",
          "class_name": "Flight"
        }
      ]
    },
    // Durable Object migrations.
    // Docs: https://developers.cloudflare.com/workers/wrangler/configuration/#migrations
    "migrations": [
      {
        "tag": "v1",
        "new_sqlite_classes": [
          "Flight"
        ]
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  [[durable_objects.bindings]]
  name = "FLIGHT"
  class_name = "Flight"


  [[migrations]]
  tag = "v1"
  new_sqlite_classes = [ "Flight" ]
  ```

Your application can now use the SQLite storage in Durable Objects.

1. Add the `initializeSeats()` function to the `Flight` class. This function will be called when the Durable Object is initialized. It will check if the table exists, and if not, it will create it. It will also insert seats information in the table.

For this tutorial, the function creates an identical seating plan for all the flights. However, in production, you would want to update this function to insert seats based on the flight type.

Replace the `Flight` class with the following code:

```ts
import { DurableObject } from "cloudflare:workers";


export class Flight extends DurableObject {
  sql = this.ctx.storage.sql;


  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.initializeSeats();
  }


  private initializeSeats() {
    const cursor = this.sql.exec(`PRAGMA table_list`);


    // Check if a table exists.
    if ([...cursor].find((t) => t.name === "seats")) {
      console.log("Table already exists");
      return;
    }


    this.sql.exec(`
          CREATE TABLE IF NOT EXISTS seats (
          seatId TEXT PRIMARY KEY,
          occupant TEXT
          )
        `);


    // For this demo, we populate the table with 60 seats.
    // Since SQLite in DOs is fast, we can do a query per INSERT instead of batching them in a transaction.
    for (let row = 1; row <= 10; row++) {
      for (let col = 0; col < 6; col++) {
        const seatNumber = `${row}${String.fromCharCode(65 + col)}`;
        this.sql.exec(`INSERT INTO seats VALUES (?, null)`, seatNumber);
      }
    }
  }
}
```

1. Add a `fetch` handler to the `Flight` class. This handler will return a text response. In [Step 5](#5-handle-websocket-connections) You will update the `fetch` handler to handle the WebSocket connection.

```ts
import { DurableObject } from "cloudflare:workers";


export class Flight extends DurableObject {
  ...
  async fetch(request: Request): Promise<Response> {
    return new Response("Hello from Durable Object!", { status: 200 });
  }
}
```

1. Next, update the Worker's fetch handler to create a unique Durable Object for each flight.

```ts
export default {
  async fetch(request, env, ctx): Promise<Response> {
    // Get flight id from the query parameter
    const url = new URL(request.url);
    const flightId = url.searchParams.get("flightId");


    if (!flightId) {
      return new Response(
        "Flight ID not found. Provide flightId in the query parameter",
        { status: 404 },
      );
    }


    const stub = env.FLIGHT.getByName(flightId);
    return stub.fetch(request);
  },
} satisfies ExportedHandler<Env>;
```

Using the flight ID, from the query parameter, a unique Durable Object is created. This Durable Object is initialized with a table if it does not exist.

## 4. Add methods to the Durable Object

1. Add the `getSeats()` function to the `Flight` class. This function returns all the seats in the table.

```ts
import { DurableObject } from "cloudflare:workers";


export class Flight extends DurableObject {
    ...


  private initializeSeats() {
    ...
  }


  // Get all seats.
  getSeats() {
    let results = [];


    // Query returns a cursor.
    let cursor = this.sql.exec(`SELECT seatId, occupant FROM seats`);


    // Cursors are iterable.
    for (let row of cursor) {
      // Each row is an object with a property for each column.
      results.push({ seatNumber: row.seatId, occupant: row.occupant });
    }


    return results;
  }
}
```

1. Add the `assignSeat()` function to the `Flight` class. This function will assign a seat to a passenger. It takes the seat number and the passenger name as parameters.

```ts
import { DurableObject } from "cloudflare:workers";


export class Flight extends DurableObject {
  ...


  private initializeSeats() {
    ...
  }


  // Get all seats.
  getSeats() {
    ...
  }


  // Assign a seat to a passenger.
  assignSeat(seatId: string, occupant: string) {
    // Check that seat isn't occupied.
    let cursor = this.sql.exec(
      `SELECT occupant FROM seats WHERE seatId = ?`,
      seatId,
    );
    let result = cursor.toArray()[0]; // Get the first result from the cursor.


    if (!result) {
      return {message: 'Seat not available',  status: 400 };
    }
    if (result.occupant !== null) {
      return {message: 'Seat not available',  status: 400 };
    }


    // If the occupant is already in a different seat, remove them.
    this.sql.exec(
      `UPDATE seats SET occupant = null WHERE occupant = ?`,
      occupant,
    );


    // Assign the seat. Note: We don't have to worry that a concurrent request may
    // have grabbed the seat between the two queries, because the code is synchronous
    // (no `await`s) and the database is private to this Durable Object. Nothing else
    // could have changed since we checked that the seat was available earlier!
    this.sql.exec(
      `UPDATE seats SET occupant = ? WHERE seatId = ?`,
      occupant,
      seatId,
    );


    // Broadcast the updated seats.
    this.broadcastSeats();
    return {message: `Seat ${seatId} booked successfully`, status: 200 };
  }
}
```

The above function uses the `broadcastSeats()` function to broadcast the updated seats to all the connected clients. In the next section, we will add the `broadcastSeats()` function.

## 5. Handle WebSocket connections

All the clients will connect to the Durable Object using WebSockets. The Durable Object will broadcast the updated seats to all the connected clients. This allows the clients to update the UI in real time.

1. Add the `handleWebSocket()` function to the `Flight` class. This function handles the WebSocket connections.

```ts
import { DurableObject } from "cloudflare:workers";


export class Flight extends DurableObject {
  ...


  private initializeSeats() {
    ...
  }


  // Get all seats.
  getSeats() {
    ...
  }


  // Assign a seat to a passenger.
  assignSeat(seatId: string, occupant: string) {
    ...
  }


  private handleWebSocket(request: Request) {
    console.log('WebSocket connection requested');
    const [client, server] = Object.values(new WebSocketPair());


    this.ctx.acceptWebSocket(server);
    console.log('WebSocket connection established');


    return new Response(null, { status: 101, webSocket: client });
  }
}
```

1. Add the `broadcastSeats()` function to the `Flight` class. This function will broadcast the updated seats to all the connected clients.

```ts
import { DurableObject } from "cloudflare:workers";


export class Flight extends DurableObject {
  ...


  private initializeSeats() {
    ...
  }


  // Get all seats.
  getSeats() {
    ...
  }


  // Assign a seat to a passenger.
  assignSeat(seatId: string, occupant: string) {
    ...
  }


  private handleWebSocket(request: Request) {
    ...
  }


  private broadcastSeats() {
    this.ctx.getWebSockets().forEach((ws) => ws.send(this.getSeats()));
  }
}
```

1. Next, update the `fetch` handler in the `Flight` class. This handler will handle all the incoming requests from the Worker and handle the WebSocket connections using the `handleWebSocket()` method.

```ts
import { DurableObject } from "cloudflare:workers";


export class Flight extends DurableObject {
  ...


  private initializeSeats() {
    ...
  }


  // Get all seats.
  getSeats() {
    ...
  }


  // Assign a seat to a passenger.
  assignSeat(seatId: string, occupant: string) {
    ...
  }


  private handleWebSocket(request: Request) {
    ...
  }


  private broadcastSeats() {
    ...
  }


  async fetch(request: Request) {
    return this.handleWebSocket(request);
  }
}
```

1. Finally, update the `fetch` handler of the Worker.

```ts
export default {
  ...


  async fetch(request, env, ctx): Promise<Response> {
    // Get flight id from the query parameter
    ...


    if (request.method === "GET" && url.pathname === "/seats") {
      return new Response(JSON.stringify(await stub.getSeats()), {
        headers: { 'Content-Type': 'application/json' },
      });
    } else if (request.method === "POST" && url.pathname === "/book-seat") {
      const { seatNumber, name } = (await request.json()) as {
        seatNumber: string;
        name: string;
      };
      const result = await stub.assignSeat(seatNumber, name);
      return new Response(JSON.stringify(result));
    } else if (request.headers.get("Upgrade") === "websocket") {
      return stub.fetch(request);
    }


    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
```

The `fetch` handler in the Worker now calls appropriate Durable Object function to handle the incoming request. If the request is a `GET` request to `/seats`, the Worker returns the seats from the Durable Object. If the request is a `POST` request to `/book-seat`, the Worker calls the `bookSeat` method of the Durable Object to assign the seat to the passenger. If the request is a WebSocket connection, the Durable Object handles the WebSocket connection.

## 6. Test the application

You can test the application locally by running the following command:

```sh
npm run dev
```

This starts a local development server that runs the application. The application is served at `http://localhost:8787`.

Navigate to the application at `http://localhost:8787` in your browser. Since the flight ID is not specified, the application displays an error message.

Update the URL with the flight ID as `http://localhost:8787?flightId=1234`. The application displays the seats for the flight with the ID `1234`.

## 7. Deploy the application

To deploy the application, run the following command:

```sh
npm run deploy
```

```sh
 ⛅️ wrangler 3.78.8
-------------------


🌀 Building list of assets...
🌀 Starting asset upload...
🌀 Found 1 new or modified file to upload. Proceeding with upload...
+ /index.html
Uploaded 1 of 1 assets
✨ Success! Uploaded 1 file (1.93 sec)


Total Upload: 3.45 KiB / gzip: 1.39 KiB
Your worker has access to the following bindings:
- Durable Objects:
  - FLIGHT: Flight
Uploaded seat-book (12.12 sec)
Deployed seat-book triggers (5.54 sec)
  [DEPLOYED_APP_LINK]
Current Version ID: [BINDING_ID]
```

Navigate to the `[DEPLOYED_APP_LINK]` to see the application. Again, remember to pass the flight ID as a query string parameter.

## Summary

In this tutorial, you have:

* used the SQLite storage backend in Durable Objects to store the seats for a flight.
* created a Durable Object class to manage the seat booking.
* deployed the application to Cloudflare Workers!

The full code for this tutorial is available on [GitHub](https://github.com/harshil1712/seat-booking-app).

</page>
