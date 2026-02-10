<page>
---
title: Cloudflare Workers KV · Cloudflare Workers KV docs
description: Workers KV is a data storage that allows you to store and retrieve
  data globally. With Workers KV, you can build dynamic and performant APIs and
  websites that support high read volumes with low latency.
lastUpdated: 2025-07-02T08:12:56.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/kv/
  md: https://developers.cloudflare.com/kv/index.md
---

Create a global, low-latency, key-value data storage.

Available on Free and Paid plans

Workers KV is a data storage that allows you to store and retrieve data globally. With Workers KV, you can build dynamic and performant APIs and websites that support high read volumes with low latency.

For example, you can use Workers KV for:

* Caching API responses.
* Storing user configurations / preferences.
* Storing user authentication details.

Access your Workers KV namespace from Cloudflare Workers using [Workers Bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/) or from your external application using the REST API:

* Workers Binding API

  * index.ts

    ```ts
    export default {
      async fetch(request, env, ctx): Promise<Response> {
        // write a key-value pair
        await env.KV.put('KEY', 'VALUE');


        // read a key-value pair
        const value = await env.KV.get('KEY');


        // list all key-value pairs
        const allKeys = await env.KV.list();


        // delete a key-value pair
        await env.KV.delete('KEY');


        // return a Workers response
        return new Response(
          JSON.stringify({
            value: value,
            allKeys: allKeys,
          }),
        );
      },


    } satisfies ExportedHandler<{ KV: KVNamespace }>;
    ```

  * wrangler.jsonc

    ```json
    {
      "$schema": "node_modules/wrangler/config-schema.json",
      "name": "<ENTER_WORKER_NAME>",
      "main": "src/index.ts",
      "compatibility_date": "2025-02-04",
      "observability": {
        "enabled": true
      },


      "kv_namespaces": [
        {
          "binding": "KV",
          "id": "<YOUR_BINDING_ID>"
        }
      ]
    }
    ```

  See the full [Workers KV binding API reference](https://developers.cloudflare.com/kv/api/read-key-value-pairs/).

* REST API

  * cURL

    ```plaintext
    curl https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/storage/kv/namespaces/$NAMESPACE_ID/values/$KEY_NAME \
        -X PUT \
        -H 'Content-Type: multipart/form-data' \
        -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
        -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
        -d '{
          "value": "Some Value"
        }'


    curl https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/storage/kv/namespaces/$NAMESPACE_ID/values/$KEY_NAME \
        -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
        -H "X-Auth-Key: $CLOUDFLARE_API_KEY"
    ```

  * TypeScript

    ```ts
    const client = new Cloudflare({
      apiEmail: process.env['CLOUDFLARE_EMAIL'], // This is the default and can be omitted
      apiKey: process.env['CLOUDFLARE_API_KEY'], // This is the default and can be omitted
    });


    const value = await client.kv.namespaces.values.update('<KV_NAMESPACE_ID>', 'KEY', {
      account_id: '<ACCOUNT_ID>',
      value: 'VALUE',
    });


    const value = await client.kv.namespaces.values.get('<KV_NAMESPACE_ID>', 'KEY', {
      account_id: '<ACCOUNT_ID>',
    });


    const value = await client.kv.namespaces.values.delete('<KV_NAMESPACE_ID>', 'KEY', {
      account_id: '<ACCOUNT_ID>',
    });


    // Automatically fetches more pages as needed.
    for await (const namespace of client.kv.namespaces.list({ account_id: '<ACCOUNT_ID>' })) {
      console.log(namespace.id);
    }
    ```

  See the full Workers KV [REST API and SDK reference](https://developers.cloudflare.com/api/resources/kv/) for details on using REST API from external applications, with pre-generated SDK's for external TypeScript, Python, or Go applications.

* index.ts

  ```ts
  export default {
    async fetch(request, env, ctx): Promise<Response> {
      // write a key-value pair
      await env.KV.put('KEY', 'VALUE');


      // read a key-value pair
      const value = await env.KV.get('KEY');


      // list all key-value pairs
      const allKeys = await env.KV.list();


      // delete a key-value pair
      await env.KV.delete('KEY');


      // return a Workers response
      return new Response(
        JSON.stringify({
          value: value,
          allKeys: allKeys,
        }),
      );
    },


  } satisfies ExportedHandler<{ KV: KVNamespace }>;
  ```

* wrangler.jsonc

  ```json
  {
    "$schema": "node_modules/wrangler/config-schema.json",
    "name": "<ENTER_WORKER_NAME>",
    "main": "src/index.ts",
    "compatibility_date": "2025-02-04",
    "observability": {
      "enabled": true
    },


    "kv_namespaces": [
      {
        "binding": "KV",
        "id": "<YOUR_BINDING_ID>"
      }
    ]
  }
  ```

* cURL

  ```plaintext
  curl https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/storage/kv/namespaces/$NAMESPACE_ID/values/$KEY_NAME \
      -X PUT \
      -H 'Content-Type: multipart/form-data' \
      -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
      -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
      -d '{
        "value": "Some Value"
      }'


  curl https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/storage/kv/namespaces/$NAMESPACE_ID/values/$KEY_NAME \
      -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
      -H "X-Auth-Key: $CLOUDFLARE_API_KEY"
  ```

* TypeScript

  ```ts
  const client = new Cloudflare({
    apiEmail: process.env['CLOUDFLARE_EMAIL'], // This is the default and can be omitted
    apiKey: process.env['CLOUDFLARE_API_KEY'], // This is the default and can be omitted
  });


  const value = await client.kv.namespaces.values.update('<KV_NAMESPACE_ID>', 'KEY', {
    account_id: '<ACCOUNT_ID>',
    value: 'VALUE',
  });


  const value = await client.kv.namespaces.values.get('<KV_NAMESPACE_ID>', 'KEY', {
    account_id: '<ACCOUNT_ID>',
  });


  const value = await client.kv.namespaces.values.delete('<KV_NAMESPACE_ID>', 'KEY', {
    account_id: '<ACCOUNT_ID>',
  });


  // Automatically fetches more pages as needed.
  for await (const namespace of client.kv.namespaces.list({ account_id: '<ACCOUNT_ID>' })) {
    console.log(namespace.id);
  }
  ```

[Get started](https://developers.cloudflare.com/kv/get-started/)

***

## Features

### Key-value storage

Learn how Workers KV stores and retrieves data.

[Use Key-value storage](https://developers.cloudflare.com/kv/get-started/)

### Wrangler

The Workers command-line interface, Wrangler, allows you to [create](https://developers.cloudflare.com/workers/wrangler/commands/#init), [test](https://developers.cloudflare.com/workers/wrangler/commands/#dev), and [deploy](https://developers.cloudflare.com/workers/wrangler/commands/#publish) your Workers projects.

[Use Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Bindings

Bindings allow your Workers to interact with resources on the Cloudflare developer platform, including [R2](https://developers.cloudflare.com/r2/), [Durable Objects](https://developers.cloudflare.com/durable-objects/), and [D1](https://developers.cloudflare.com/d1/).

[Use Bindings](https://developers.cloudflare.com/kv/concepts/kv-bindings/)

***

## Related products

**[R2](https://developers.cloudflare.com/r2/)**

Cloudflare R2 Storage allows developers to store large amounts of unstructured data without the costly egress bandwidth fees associated with typical cloud storage services.

**[Durable Objects](https://developers.cloudflare.com/durable-objects/)**

Cloudflare Durable Objects allows developers to access scalable compute and permanent, consistent storage.

**[D1](https://developers.cloudflare.com/d1/)**

Built on SQLite, D1 is Cloudflare’s first queryable relational database. Create an entire database by importing data or defining your tables and writing your queries within a Worker or through the API.

***

### More resources

[Limits](https://developers.cloudflare.com/kv/platform/limits/)

Learn about KV limits.

[Pricing](https://developers.cloudflare.com/kv/platform/pricing/)

Learn about KV pricing.

[Discord](https://discord.com/channels/595317990191398933/893253103695065128)

Ask questions, show off what you are building, and discuss the platform with other developers.

[Twitter](https://x.com/cloudflaredev)

Learn about product announcements, new tutorials, and what is new in Cloudflare Developer Platform.

</page>

<page>
---
title: 404 - Page Not Found · Cloudflare Workers KV docs
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/kv/404/
  md: https://developers.cloudflare.com/kv/404/index.md
---

# 404

Check the URL, try using our [search](https://developers.cloudflare.com/search/) or try our LLM-friendly [llms.txt directory](https://developers.cloudflare.com/llms.txt).

</page>

<page>
---
title: Workers Binding API · Cloudflare Workers KV docs
lastUpdated: 2024-11-20T15:28:21.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/kv/api/
  md: https://developers.cloudflare.com/kv/api/index.md
---

* [Read key-value pairs](https://developers.cloudflare.com/kv/api/read-key-value-pairs/)
* [Write key-value pairs](https://developers.cloudflare.com/kv/api/write-key-value-pairs/)
* [Delete key-value pairs](https://developers.cloudflare.com/kv/api/delete-key-value-pairs/)
* [List keys](https://developers.cloudflare.com/kv/api/list-keys/)

</page>

<page>
---
title: Key concepts · Cloudflare Workers KV docs
lastUpdated: 2024-09-03T13:14:20.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/kv/concepts/
  md: https://developers.cloudflare.com/kv/concepts/index.md
---

* [How KV works](https://developers.cloudflare.com/kv/concepts/how-kv-works/)
* [KV bindings](https://developers.cloudflare.com/kv/concepts/kv-bindings/)
* [KV namespaces](https://developers.cloudflare.com/kv/concepts/kv-namespaces/)

</page>

<page>
---
title: Demos and architectures · Cloudflare Workers KV docs
description: Learn how you can use KV within your existing application and architecture.
lastUpdated: 2025-10-13T13:40:40.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/kv/demos/
  md: https://developers.cloudflare.com/kv/demos/index.md
---

Learn how you can use KV within your existing application and architecture.

## Demo applications

Explore the following demo applications for KV.

* [Queues Web Crawler:](https://github.com/cloudflare/queues-web-crawler) An example use-case for Queues, a web crawler built on Browser Rendering and Puppeteer. The crawler finds the number of links to Cloudflare.com on the site, and archives a screenshot to Workers KV.

## Reference architectures

Explore the following reference architectures that use KV:

[Fullstack applications](https://developers.cloudflare.com/reference-architecture/diagrams/serverless/fullstack-application/)

[A practical example of how these services come together in a real fullstack application architecture.](https://developers.cloudflare.com/reference-architecture/diagrams/serverless/fullstack-application/)

[Programmable Platforms](https://developers.cloudflare.com/reference-architecture/diagrams/serverless/programmable-platforms/)

[Workers for Platforms provide secure, scalable, cost-effective infrastructure for programmable platforms with global reach.](https://developers.cloudflare.com/reference-architecture/diagrams/serverless/programmable-platforms/)

[Ingesting BigQuery Data into Workers AI](https://developers.cloudflare.com/reference-architecture/diagrams/ai/bigquery-workers-ai/)

[You can connect a Cloudflare Worker to get data from Google BigQuery and pass it to Workers AI, to run AI Models, powered by serverless GPUs.](https://developers.cloudflare.com/reference-architecture/diagrams/ai/bigquery-workers-ai/)

[A/B-testing using Workers](https://developers.cloudflare.com/reference-architecture/diagrams/serverless/a-b-testing-using-workers/)

[Cloudflare's low-latency, fully serverless compute platform, Workers offers powerful capabilities to enable A/B testing using a server-side implementation.](https://developers.cloudflare.com/reference-architecture/diagrams/serverless/a-b-testing-using-workers/)

[Serverless global APIs](https://developers.cloudflare.com/reference-architecture/diagrams/serverless/serverless-global-apis/)

[An example architecture of a serverless API on Cloudflare and aims to illustrate how different compute and data products could interact with each other.](https://developers.cloudflare.com/reference-architecture/diagrams/serverless/serverless-global-apis/)

[Serverless image content management](https://developers.cloudflare.com/reference-architecture/diagrams/serverless/serverless-image-content-management/)

[Leverage various components of Cloudflare's ecosystem to construct a scalable image management solution](https://developers.cloudflare.com/reference-architecture/diagrams/serverless/serverless-image-content-management/)

</page>

<page>
---
title: Examples · Cloudflare Workers KV docs
description: Explore the following examples for KV.
lastUpdated: 2025-08-18T14:27:42.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/kv/examples/
  md: https://developers.cloudflare.com/kv/examples/index.md
---

Explore the following examples for KV.

[Cache data with Workers KV](https://developers.cloudflare.com/kv/examples/cache-data-with-workers-kv/)

[Example of how to use Workers KV to build a distributed application configuration store.](https://developers.cloudflare.com/kv/examples/cache-data-with-workers-kv/)

[Build a distributed configuration store](https://developers.cloudflare.com/kv/examples/distributed-configuration-with-workers-kv/)

[Example of how to use Workers KV to build a distributed application configuration store.](https://developers.cloudflare.com/kv/examples/distributed-configuration-with-workers-kv/)

[Route requests across various web servers](https://developers.cloudflare.com/kv/examples/routing-with-workers-kv/)

[Example of how to use Workers KV to build a distributed application configuration store.](https://developers.cloudflare.com/kv/examples/routing-with-workers-kv/)

[Store and retrieve static assets](https://developers.cloudflare.com/kv/examples/workers-kv-to-serve-assets/)

[Example of how to use Workers KV to store static assets](https://developers.cloudflare.com/kv/examples/workers-kv-to-serve-assets/)

</page>

<page>
---
title: Getting started · Cloudflare Workers KV docs
description: Workers KV provides low-latency, high-throughput global storage to
  your Cloudflare Workers applications. Workers KV is ideal for storing user
  configuration data, routing data, A/B testing configurations and
  authentication tokens, and is well suited for read-heavy workloads.
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/kv/get-started/
  md: https://developers.cloudflare.com/kv/get-started/index.md
---

Workers KV provides low-latency, high-throughput global storage to your [Cloudflare Workers](https://developers.cloudflare.com/workers/) applications. Workers KV is ideal for storing user configuration data, routing data, A/B testing configurations and authentication tokens, and is well suited for read-heavy workloads.

This guide instructs you through:

* Creating a KV namespace.
* Writing key-value pairs to your KV namespace from a Cloudflare Worker.
* Reading key-value pairs from a KV namespace.

You can perform these tasks through the Wrangler CLI or through the Cloudflare dashboard.

## Quick start

If you want to skip the setup steps and get started quickly, click on the button below.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/docs-examples/tree/update/kv/kv/kv-get-started)

This creates a repository in your GitHub account and deploys the application to Cloudflare Workers. Use this option if you are familiar with Cloudflare Workers, and wish to skip the step-by-step guidance.

You may wish to manually follow the steps if you are new to Cloudflare Workers.

## Prerequisites

1. Sign up for a [Cloudflare account](https://dash.cloudflare.com/sign-up/workers-and-pages).
2. Install [`Node.js`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

Node.js version manager

Use a Node version manager like [Volta](https://volta.sh/) or [nvm](https://github.com/nvm-sh/nvm) to avoid permission issues and change Node.js versions. [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/), discussed later in this guide, requires a Node version of `16.17.0` or later.

## 1. Create a Worker project

New to Workers?

Refer to [How Workers works](https://developers.cloudflare.com/workers/reference/how-workers-works/) to learn about the Workers serverless execution model works. Go to the [Workers Get started guide](https://developers.cloudflare.com/workers/get-started/guide/) to set up your first Worker.

* CLI

  Create a new Worker to read and write to your KV namespace.

  1. Create a new project named `kv-tutorial` by running:

     * npm

       ```sh
       npm create cloudflare@latest -- kv-tutorial
       ```

     * yarn

       ```sh
       yarn create cloudflare kv-tutorial
       ```

     * pnpm

       ```sh
       pnpm create cloudflare@latest kv-tutorial
       ```

     For setup, select the following options:

     * For *What would you like to start with?*, choose `Hello World example`.
     * For *Which template would you like to use?*, choose `Worker only`.
     * For *Which language do you want to use?*, choose `TypeScript`.
     * For *Do you want to use git for version control?*, choose `Yes`.
     * For *Do you want to deploy your application?*, choose `No` (we will be making some changes before deploying).

     This creates a new `kv-tutorial` directory, illustrated below.

     Your new `kv-tutorial` directory includes:

     * A `"Hello World"` [Worker](https://developers.cloudflare.com/workers/get-started/guide/#3-write-code) in `index.ts`.
     * A [`wrangler.jsonc`](https://developers.cloudflare.com/workers/wrangler/configuration/) configuration file. `wrangler.jsonc` is how your `kv-tutorial` Worker accesses your kv database.

  2. Change into the directory you just created for your Worker project:

     ```sh
     cd kv-tutorial
     ```

     Note

     If you are familiar with Cloudflare Workers, or initializing projects in a Continuous Integration (CI) environment, initialize a new project non-interactively by setting `CI=true` as an [environmental variable](https://developers.cloudflare.com/workers/configuration/environment-variables/) when running `create cloudflare@latest`.

     For example: `CI=true npm create cloudflare@latest kv-tutorial --type=simple --git --ts --deploy=false` creates a basic "Hello World" project ready to build on.

* Dashboard

  1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

     [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

  2. Select **Create application**.

  3. Select **Start with Hello World!** > **Get started**.

  4. Name your Worker. For this tutorial, name your Worker `kv-tutorial`.

  5. Select **Deploy**.

* npm

  ```sh
  npm create cloudflare@latest -- kv-tutorial
  ```

* yarn

  ```sh
  yarn create cloudflare kv-tutorial
  ```

* pnpm

  ```sh
  pnpm create cloudflare@latest kv-tutorial
  ```

## 2. Create a KV namespace

A [KV namespace](https://developers.cloudflare.com/kv/concepts/kv-namespaces/) is a key-value database replicated to Cloudflare's global network.

* CLI

  You can use [Wrangler](https://developers.cloudflare.com/workers/wrangler/) to create a new KV namespace. You can also use it to perform operations such as put, list, get, and delete within your KV namespace.

  Note

  KV operations are scoped to your account.

  To create a KV namespace via Wrangler:

  1. Open your terminal and run the following command:

     ```sh
     npx wrangler kv namespace create <BINDING_NAME>
     ```

     The `npx wrangler kv namespace create <BINDING_NAME>` subcommand takes a new binding name as its argument. A KV namespace is created using a concatenation of your Worker's name (from your Wrangler file) and the binding name you provide. A `<BINDING_ID>` is randomly generated for you.

     For this tutorial, use the binding name `USERS_NOTIFICATION_CONFIG`.

     ```sh
     npx wrangler kv namespace create
     ```

     ```sh
     🌀 Creating namespace with title "USERS_NOTIFICATION_CONFIG"
     ✨ Success!
     Add the following to your configuration file in your kv_namespaces array:
     {
       "kv_namespaces": [
         {
           "binding": "USERS_NOTIFICATION_CONFIG",
           "id": "<BINDING_ID>"
         }
       ]
     }
     ```

* Dashboard

  1. In the Cloudflare dashboard, go to the **Workers KV** page.

     [Go to **Workers KV**](https://dash.cloudflare.com/?to=/:account/workers/kv/namespaces)

  2. Select **Create instance**.

  3. Enter a name for your namespace. For this tutorial, use `kv_tutorial_namespace`.

  4. Select **Create**.

## 3. Bind your Worker to your KV namespace

You must create a binding to connect your Worker with your KV namespace. [Bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/) allow your Workers to access resources, like KV, on the Cloudflare developer platform.

Bindings

A binding is how your Worker interacts with external resources such as [KV namespaces](https://developers.cloudflare.com/kv/concepts/kv-namespaces/). A binding is a runtime variable that the Workers runtime provides to your code. You can declare a variable name in your Wrangler file that binds to these resources at runtime, and interact with them through this variable. Every binding's variable name and behavior is determined by you when deploying the Worker.

Refer to [Environment](https://developers.cloudflare.com/kv/reference/environments/) for more information.

To bind your KV namespace to your Worker:

* CLI

  1. In your Wrangler file, add the following with the values generated in your terminal from [step 2](https://developers.cloudflare.com/kv/get-started/#2-create-a-kv-namespace):

     * wrangler.jsonc

       ```jsonc
       {
         "kv_namespaces": [
           {
             "binding": "USERS_NOTIFICATION_CONFIG",
             "id": "<BINDING_ID>"
           }
         ]
       }
       ```

     * wrangler.toml

       ```toml
       [[kv_namespaces]]
       binding = "USERS_NOTIFICATION_CONFIG"
       id = "<BINDING_ID>"
       ```

     Binding names do not need to correspond to the namespace you created. Binding names are only a reference. Specifically:

     * The value (string) you set for `binding` is used to reference this KV namespace in your Worker. For this tutorial, this should be `USERS_NOTIFICATION_CONFIG`.
     * The binding must be [a valid JavaScript variable name](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#variables). For example, `binding = "MY_KV"` or `binding = "routingConfig"` would both be valid names for the binding.
     * Your binding is available in your Worker at `env.<BINDING_NAME>` from within your Worker. For this tutorial, the binding is available at `env.USERS_NOTIFICATION_CONFIG`.

* Dashboard

  1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

     [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

  2. Select the `kv-tutorial` Worker you created in [step 1](https://developers.cloudflare.com/kv/get-started/#1-create-a-worker-project).

  3. Got to the **Bindings** tab, then select **Add binding**.

  4. Select **KV namespace** > **Add binding**.

  5. Name your binding (`BINDING_NAME`) in **Variable name**, then select the KV namespace (`kv_tutorial_namespace`) you created in [step 2](https://developers.cloudflare.com/kv/get-started/#2-create-a-kv-namespace) from the dropdown menu.

  6. Select **Add binding** to deploy your binding.

* wrangler.jsonc

  ```jsonc
  {
    "kv_namespaces": [
      {
        "binding": "USERS_NOTIFICATION_CONFIG",
        "id": "<BINDING_ID>"
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  [[kv_namespaces]]
  binding = "USERS_NOTIFICATION_CONFIG"
  id = "<BINDING_ID>"
  ```

## 4. Interact with your KV namespace

You can interact with your KV namespace via [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) or directly from your [Workers](https://developers.cloudflare.com/workers/) application.

### 4.1. Write a value

* CLI

  To write a value to your empty KV namespace using Wrangler:

  1. Run the `wrangler kv key put` subcommand in your terminal, and input your key and value respectively. `<KEY>` and `<VALUE>` are values of your choice.

     ```sh
     npx wrangler kv key put --binding=<BINDING_NAME> "<KEY>" "<VALUE>"
     ```

     In this tutorial, you will add a key `user_1` with value `enabled` to the KV namespace you created in [step 2](https://developers.cloudflare.com/kv/get-started/#2-create-a-kv-namespace).

     ```sh
     npx wrangler kv key put --binding=USERS_NOTIFICATION_CONFIG "user_1" "enabled"
     ```

     ```sh
     Writing the value "enabled" to key "user_1" on namespace <BINDING_ID>.
     ```

  Using `--namespace-id`

  Instead of using `--binding`, you can also use `--namespace-id` to specify which KV namespace should receive the operation:

  ```sh
  npx wrangler kv key put --namespace-id=<BINDING_ID> "<KEY>" "<VALUE>"
  ```

  ```sh
  Writing the value "<VALUE>" to key "<KEY>" on namespace <BINDING_ID>.
  ```

  Storing values in remote KV namespace

  By default, the values are written locally. To create a key and a value in your remote KV namespace, add the `--remote` flag at the end of the command:

  ```sh
  npx wrangler kv key put --namespace-id=xxxxxxxxxxxxxxxx "<KEY>" "<VALUE>"
  ```

* Dashboard

  1. In the Cloudflare dashboard, go to the **Workers KV** page.

     [Go to **Workers KV**](https://dash.cloudflare.com/?to=/:account/workers/kv/namespaces)

  2. Select the KV namespace you created (`kv_tutorial_namespace`).

  3. Go to the **KV Pairs** tab.

  4. Enter a `<KEY>` of your choice.

  5. Enter a `<VALUE>` of your choice.

  6. Select **Add entry**.

### 4.2. Get a value

* CLI

  To access the value from your KV namespace using Wrangler:

  1. Run the `wrangler kv key get` subcommand in your terminal, and input your key value:

     ```sh
     npx wrangler kv key get --binding=<BINDING_NAME> "<KEY>"
     ```

     In this tutorial, you will get the value of the key `user_1` from the KV namespace you created in [step 2](https://developers.cloudflare.com/kv/get-started/#2-create-a-kv-namespace).

     Note

     To view the value directly within the terminal, you use the `--text` flag.

     ```sh
     npx wrangler kv key get --binding=USERS_NOTIFICATION_CONFIG "user_1" --text
     ```

     Similar to the `put` command, the `get` command can also be used to access a KV namespace in two ways - with `--binding` or `--namespace-id`:

  Warning

  Exactly **one** of `--binding` or `--namespace-id` is required.

  Refer to the [`kv bulk` documentation](https://developers.cloudflare.com/kv/reference/kv-commands/#kv-bulk) to write a file of multiple key-value pairs to a given KV namespace.

* Dashboard

  You can view key-value pairs directly from the dashboard.

  1. In the Cloudflare dashboard, go to the **Workers KV** page.

     [Go to **Workers KV**](https://dash.cloudflare.com/?to=/:account/workers/kv/namespaces)

  2. Go to the KV namespace you created (`kv_tutorial_namespace`).

  3. Go to the **KV Pairs** tab.

## 5. Access your KV namespace from your Worker

* CLI

  Note

  When using [`wrangler dev`](https://developers.cloudflare.com/workers/wrangler/commands/#dev) to develop locally, Wrangler defaults to using a local version of KV to avoid interfering with any of your live production data in KV. This means that reading keys that you have not written locally returns null.

  To have `wrangler dev` connect to your Workers KV namespace running on Cloudflare's global network, you can set `"remote" : true` in the KV binding configuration. Refer to the [remote bindings documentation](https://developers.cloudflare.com/workers/development-testing/#remote-bindings) for more information.

  Also refer to [KV binding docs](https://developers.cloudflare.com/kv/concepts/kv-bindings/#use-kv-bindings-when-developing-locally).

  1. In your Worker script, add your KV binding in the `Env` interface. If you have bootstrapped your project with JavaScript, this step is not required.

     ```ts
     interface Env {
       USERS_NOTIFICATION_CONFIG: KVNamespace;
       // ... other binding types
     }
     ```

  2. Use the `put()` method on `USERS_NOTIFICATION_CONFIG` to create a new key-value pair. You will add a new key `user_2` with value `disabled` to your KV namespace.

     ```ts
     let value = await env.USERS_NOTIFICATION_CONFIG.put("user_2", "disabled");
     ```

  3. Use the KV `get()` method to fetch the data you stored in your KV namespace. You will fetch the value of the key `user_2` from your KV namespace.

     ```ts
     let value = await env.USERS_NOTIFICATION_CONFIG.get("user_2");
     ```

  Your Worker code should look like this:

  * JavaScript

    ```js
    export default {
      async fetch(request, env, ctx) {
        try {
          await env.USERS_NOTIFICATION_CONFIG.put("user_2", "disabled");
          const value = await env.USERS_NOTIFICATION_CONFIG.get("user_2");
          if (value === null) {
            return new Response("Value not found", { status: 404 });
          }
          return new Response(value);
        } catch (err) {
          console.error(`KV returned error:`, err);
          const errorMessage =
            err instanceof Error
              ? err.message
              : "An unknown error occurred when accessing KV storage";
          return new Response(errorMessage, {
            status: 500,
            headers: { "Content-Type": "text/plain" },
          });
        }
      },
    };
    ```

  * TypeScript

    ```ts
    export interface Env {
      USERS_NOTIFICATION_CONFIG: KVNamespace;
    }


    export default {
      async fetch(request, env, ctx): Promise<Response> {
        try {
          await env.USERS_NOTIFICATION_CONFIG.put("user_2", "disabled");
          const value = await env.USERS_NOTIFICATION_CONFIG.get("user_2");
          if (value === null) {
            return new Response("Value not found", { status: 404 });
          }
          return new Response(value);
        } catch (err) {
          console.error(`KV returned error:`, err);
          const errorMessage =
            err instanceof Error
              ? err.message
              : "An unknown error occurred when accessing KV storage";
          return new Response(errorMessage, {
            status: 500,
            headers: { "Content-Type": "text/plain" },
          });
        }
      },
    } satisfies ExportedHandler<Env>;
    ```

  The code above:

  1. Writes a key to your KV namespace using KV's `put()` method.
  2. Reads the same key using KV's `get()` method.
  3. Checks if the key is null, and returns a `404` response if it is.
  4. If the key is not null, it returns the value of the key.
  5. Uses JavaScript's [`try...catch`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/try...catch) exception handling to catch potential errors. When writing or reading from any service, such as Workers KV or external APIs using `fetch()`, you should expect to handle exceptions explicitly.

* Dashboard

  1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

     [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

  2. Go to the `kv-tutorial` Worker you created.

  3. Select **Edit Code**.

  4. Clear the contents of the `workers.js` file, then paste the following code.

     * JavaScript

       ```js
       export default {
         async fetch(request, env, ctx) {
           try {
             await env.USERS_NOTIFICATION_CONFIG.put("user_2", "disabled");
             const value = await env.USERS_NOTIFICATION_CONFIG.get("user_2");
             if (value === null) {
               return new Response("Value not found", { status: 404 });
             }
             return new Response(value);
           } catch (err) {
             console.error(`KV returned error:`, err);
             const errorMessage =
               err instanceof Error
                 ? err.message
                 : "An unknown error occurred when accessing KV storage";
             return new Response(errorMessage, {
               status: 500,
               headers: { "Content-Type": "text/plain" },
             });
           }
         },
       };
       ```

     * TypeScript

       ```ts
       export interface Env {
         USERS_NOTIFICATION_CONFIG: KVNamespace;
       }


       export default {
         async fetch(request, env, ctx): Promise<Response> {
           try {
             await env.USERS_NOTIFICATION_CONFIG.put("user_2", "disabled");
             const value = await env.USERS_NOTIFICATION_CONFIG.get("user_2");
             if (value === null) {
               return new Response("Value not found", { status: 404 });
             }
             return new Response(value);
           } catch (err) {
             console.error(`KV returned error:`, err);
             const errorMessage =
               err instanceof Error
                 ? err.message
                 : "An unknown error occurred when accessing KV storage";
             return new Response(errorMessage, {
               status: 500,
               headers: { "Content-Type": "text/plain" },
             });
           }
         },
       } satisfies ExportedHandler<Env>;
       ```

     The code above:

     1. Writes a key to `BINDING_NAME` using KV's `put()` method.
     2. Reads the same key using KV's `get()` method, and returns an error if the key is null (or in case the key is not set, or does not exist).
     3. Uses JavaScript's [`try...catch`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch) exception handling to catch potential errors. When writing or reading from any service, such as Workers KV or external APIs using `fetch()`, you should expect to handle exceptions explicitly.

     The browser should simply return the `VALUE` corresponding to the `KEY` you have specified with the `get()` method.

  5. Select the dropdown arrow next to **Deploy** and select **Save**.

* JavaScript

  ```js
  export default {
    async fetch(request, env, ctx) {
      try {
        await env.USERS_NOTIFICATION_CONFIG.put("user_2", "disabled");
        const value = await env.USERS_NOTIFICATION_CONFIG.get("user_2");
        if (value === null) {
          return new Response("Value not found", { status: 404 });
        }
        return new Response(value);
      } catch (err) {
        console.error(`KV returned error:`, err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "An unknown error occurred when accessing KV storage";
        return new Response(errorMessage, {
          status: 500,
          headers: { "Content-Type": "text/plain" },
        });
      }
    },
  };
  ```

* TypeScript

  ```ts
  export interface Env {
    USERS_NOTIFICATION_CONFIG: KVNamespace;
  }


  export default {
    async fetch(request, env, ctx): Promise<Response> {
      try {
        await env.USERS_NOTIFICATION_CONFIG.put("user_2", "disabled");
        const value = await env.USERS_NOTIFICATION_CONFIG.get("user_2");
        if (value === null) {
          return new Response("Value not found", { status: 404 });
        }
        return new Response(value);
      } catch (err) {
        console.error(`KV returned error:`, err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "An unknown error occurred when accessing KV storage";
        return new Response(errorMessage, {
          status: 500,
          headers: { "Content-Type": "text/plain" },
        });
      }
    },
  } satisfies ExportedHandler<Env>;
  ```

* JavaScript

  ```js
  export default {
    async fetch(request, env, ctx) {
      try {
        await env.USERS_NOTIFICATION_CONFIG.put("user_2", "disabled");
        const value = await env.USERS_NOTIFICATION_CONFIG.get("user_2");
        if (value === null) {
          return new Response("Value not found", { status: 404 });
        }
        return new Response(value);
      } catch (err) {
        console.error(`KV returned error:`, err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "An unknown error occurred when accessing KV storage";
        return new Response(errorMessage, {
          status: 500,
          headers: { "Content-Type": "text/plain" },
        });
      }
    },
  };
  ```

* TypeScript

  ```ts
  export interface Env {
    USERS_NOTIFICATION_CONFIG: KVNamespace;
  }


  export default {
    async fetch(request, env, ctx): Promise<Response> {
      try {
        await env.USERS_NOTIFICATION_CONFIG.put("user_2", "disabled");
        const value = await env.USERS_NOTIFICATION_CONFIG.get("user_2");
        if (value === null) {
          return new Response("Value not found", { status: 404 });
        }
        return new Response(value);
      } catch (err) {
        console.error(`KV returned error:`, err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "An unknown error occurred when accessing KV storage";
        return new Response(errorMessage, {
          status: 500,
          headers: { "Content-Type": "text/plain" },
        });
      }
    },
  } satisfies ExportedHandler<Env>;
  ```

## 6. Deploy your Worker

Deploy your Worker to Cloudflare's global network.

* CLI

  1. Run the following command to deploy KV to Cloudflare's global network:

     ```sh
     npm run deploy
     ```

  2. Visit the URL for your newly created Workers KV application.

     For example, if the URL of your new Worker is `kv-tutorial.<YOUR_SUBDOMAIN>.workers.dev`, accessing `https://kv-tutorial.<YOUR_SUBDOMAIN>.workers.dev/` sends a request to your Worker that writes (and reads) from Workers KV.

* Dashboard

  1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

     [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

  2. Select your `kv-tutorial` Worker.

  3. Select **Deployments**.

  4. From the **Version History** table, select **Deploy version**.

  5. From the **Deploy version** page, select **Deploy**.

     This deploys the latest version of the Worker code to production.

## Summary

By finishing this tutorial, you have:

1. Created a KV namespace
2. Created a Worker that writes and reads from that namespace
3. Deployed your project globally.

## Next steps

If you have any feature requests or notice any bugs, share your feedback directly with the Cloudflare team by joining the [Cloudflare Developers community on Discord](https://discord.cloudflare.com).

* Learn more about the [KV API](https://developers.cloudflare.com/kv/api/).
* Understand how to use [Environments](https://developers.cloudflare.com/kv/reference/environments/) with Workers KV.
* Read the Wrangler [`kv` command documentation](https://developers.cloudflare.com/kv/reference/kv-commands/).

</page>

<page>
---
title: Glossary · Cloudflare Workers KV docs
description: Review the definitions for terms used across Cloudflare's KV documentation.
lastUpdated: 2024-08-13T19:56:56.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/kv/glossary/
  md: https://developers.cloudflare.com/kv/glossary/index.md
---

Review the definitions for terms used across Cloudflare's KV documentation.

| Term | Definition |
| - | - |
| cacheTtl | CacheTtl is a parameter that defines the length of time in seconds that a KV result is cached in the global network location it is accessed from. |
| KV namespace | A KV namespace is a key-value database replicated to Cloudflare’s global network. A KV namespace must require a binding and an id. |
| metadata | A metadata is a serializable value you append to each KV entry. |

</page>

<page>
---
title: Observability · Cloudflare Workers KV docs
lastUpdated: 2024-09-17T08:47:06.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/kv/observability/
  md: https://developers.cloudflare.com/kv/observability/index.md
---

* [Metrics and analytics](https://developers.cloudflare.com/kv/observability/metrics-analytics/)

</page>

<page>
---
title: Platform · Cloudflare Workers KV docs
lastUpdated: 2024-09-03T13:14:20.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/kv/platform/
  md: https://developers.cloudflare.com/kv/platform/index.md
---

* [Pricing](https://developers.cloudflare.com/kv/platform/pricing/)
* [Limits](https://developers.cloudflare.com/kv/platform/limits/)
* [Choose a data or storage product](https://developers.cloudflare.com/workers/platform/storage-options/)
* [Release notes](https://developers.cloudflare.com/kv/platform/release-notes/)
* [Event subscriptions](https://developers.cloudflare.com/kv/platform/event-subscriptions/)

</page>

<page>
---
title: Reference · Cloudflare Workers KV docs
lastUpdated: 2024-09-03T13:14:20.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/kv/reference/
  md: https://developers.cloudflare.com/kv/reference/index.md
---

* [Wrangler KV commands](https://developers.cloudflare.com/kv/reference/kv-commands/)
* [Environments](https://developers.cloudflare.com/kv/reference/environments/)
* [Data security](https://developers.cloudflare.com/kv/reference/data-security/)
* [FAQ](https://developers.cloudflare.com/kv/reference/faq/)

</page>

<page>
---
title: Tutorials · Cloudflare Workers KV docs
description: View tutorials to help you get started with KV.
lastUpdated: 2025-05-06T17:35:57.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/kv/tutorials/
  md: https://developers.cloudflare.com/kv/tutorials/index.md
---

View tutorials to help you get started with KV.

## Docs

| Name | Last Updated | Difficulty |
| - | - | - |
| [Use Workers KV directly from Rust](https://developers.cloudflare.com/workers/tutorials/workers-kv-from-rust/) | over 1 year ago | Intermediate |
| [Build a todo list Jamstack application](https://developers.cloudflare.com/workers/tutorials/build-a-jamstack-app/) | over 1 year ago | Beginner |

## Videos

Cloudflare Workflows | Introduction (Part 1 of 3)

In this video, we introduce Cloudflare Workflows, the Newest Developer Platform Primitive at Cloudflare.

Cloudflare Workflows | Batching and Monitoring Your Durable Execution (Part 2 of 3)

Workflows exposes metrics such as execution, error rates, steps, and total duration!

Build a URL Shortener with an AI-based admin section

We are building a URL Shortener, shrty.dev, on Cloudflare. The apps uses Workers KV and Workers Analytics engine. Craig decided to build with Workers AI runWithTools to provide a chat interface for admins.

Build Rust Powered Apps

In this video, we will show you how to build a global database using workers-rs to keep track of every country and city you’ve visited.

Stateful Apps with Cloudflare Workers

Learn how to access external APIs, cache and retrieve data using Workers KV, and create SQL-driven applications with Cloudflare D1.

</page>

<page>
---
title: KV REST API · Cloudflare Workers KV docs
lastUpdated: 2025-05-20T08:19:56.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/kv/workers-kv-api/
  md: https://developers.cloudflare.com/kv/workers-kv-api/index.md
---


</page>

<page>
---
title: Delete key-value pairs · Cloudflare Workers KV docs
description: "To delete a key-value pair, call the delete() method of the KV
  binding on any KV namespace you have bound to your Worker code:"
lastUpdated: 2025-05-20T08:19:56.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/kv/api/delete-key-value-pairs/
  md: https://developers.cloudflare.com/kv/api/delete-key-value-pairs/index.md
---

To delete a key-value pair, call the `delete()` method of the [KV binding](https://developers.cloudflare.com/kv/concepts/kv-bindings/) on any [KV namespace](https://developers.cloudflare.com/kv/concepts/kv-namespaces/) you have bound to your Worker code:

```js
env.NAMESPACE.delete(key);
```

#### Example

An example of deleting a key-value pair from within a Worker:

```js
export default {
  async fetch(request, env, ctx) {
    try {
      await env.NAMESPACE.delete("first-key");


      return new Response("Successful delete", {
        status: 200
      });
    }
    catch (e)
    {
      return new Response(e.message, {status: 500});
    }
  },
};
```

## Reference

The following method is provided to delete from KV:

* [delete()](#delete-method)

### `delete()` method

To delete a key-value pair, call the `delete()` method of the [KV binding](https://developers.cloudflare.com/kv/concepts/kv-bindings/) on any KV namespace you have bound to your Worker code:

```js
env.NAMESPACE.delete(key);
```

#### Parameters

* `key`: `string`
  * The key to associate with the value.

#### Response

* `response`: `Promise<void>`
  * A `Promise` that resolves if the delete is successful.

This method returns a promise that you should `await` on to verify successful deletion. Calling `delete()` on a non-existing key is returned as a successful delete.

Calling the `delete()` method will remove the key and value from your KV namespace. As with any operations, it may take some time for the key to be deleted from various points in the Cloudflare global network.

## Guidance

### Delete data in bulk

Delete more than one key-value pair at a time with Wrangler or [via the REST API](https://developers.cloudflare.com/api/resources/kv/subresources/namespaces/subresources/keys/methods/bulk_delete/).

The bulk REST API can accept up to 10,000 KV pairs at once. Bulk writes are not supported using the [KV binding](https://developers.cloudflare.com/kv/concepts/kv-bindings/).

## Other methods to access KV

You can also [delete key-value pairs from the command line with Wrangler](https://developers.cloudflare.com/kv/reference/kv-commands/#kv-namespace-delete) or [with the REST API](https://developers.cloudflare.com/api/resources/kv/subresources/namespaces/subresources/values/methods/delete/).

</page>

<page>
---
title: List keys · Cloudflare Workers KV docs
description: "To list all the keys in your KV namespace, call the list() method
  of the KV binding on any KV namespace you have bound to your Worker code:"
lastUpdated: 2025-01-15T10:21:15.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/kv/api/list-keys/
  md: https://developers.cloudflare.com/kv/api/list-keys/index.md
---

To list all the keys in your KV namespace, call the `list()` method of the [KV binding](https://developers.cloudflare.com/kv/concepts/kv-bindings/) on any [KV namespace](https://developers.cloudflare.com/kv/concepts/kv-namespaces/) you have bound to your Worker code:

```js
env.NAMESPACE.list();
```

The `list()` method returns a promise you can `await` on to get the value.

#### Example

An example of listing keys from within a Worker:

```js
export default {
  async fetch(request, env, ctx) {
    try {
      const value = await env.NAMESPACE.list();


      return new Response(JSON.stringify(value.keys), {
        status: 200
      });
    }
    catch (e)
    {
      return new Response(e.message, {status: 500});
    }
  },
};
```

## Reference

The following method is provided to list the keys of KV:

* [list()](#list-method)

### `list()` method

To list all the keys in your KV namespace, call the `list()` method of the [KV binding](https://developers.cloudflare.com/kv/concepts/kv-bindings/) on any KV namespace you have bound to your Worker code:

```ts
env.NAMESPACE.list(options?)
```

#### Parameters

* `options`: `{ prefix?: string, limit?: string, cursor?: string }`

  * An object with attributes `prefix` (optional), `limit` (optional), or `cursor` (optional).

    * `prefix` is a `string` that represents a prefix you can use to filter all keys.
    * `limit` is the maximum number of keys returned. The default is 1,000, which is the maximum. It is unlikely that you will want to change this default but it is included for completeness.
    * `cursor` is a `string` used for paginating responses.

#### Response

* `response`: `Promise<{ keys: { name: string, expiration?: number, metadata?: object }[], list_complete: boolean, cursor: string }>`

  * A `Promise` that resolves to an object containing `keys`, `list_complete`, and `cursor` attributes.

    * `keys` is an array that contains an object for each key listed. Each object has attributes `name`, `expiration` (optional), and `metadata` (optional). If the key-value pair has an expiration set, the expiration will be present and in absolute value form (even if it was set in TTL form). If the key-value pair has non-null metadata set, the metadata will be present.
    * `list_complete` is a boolean, which will be `false` if there are more keys to fetch, even if the `keys` array is empty.
    * `cursor` is a `string` used for paginating responses.

The `list()` method returns a promise which resolves with an object that looks like the following:

```json
{
  "keys": [
    {
      "name": "foo",
      "expiration": 1234,
      "metadata": { "someMetadataKey": "someMetadataValue" }
    }
  ],
  "list_complete": false,
  "cursor": "6Ck1la0VxJ0djhidm1MdX2FyD"
}
```

The `keys` property will contain an array of objects describing each key. That object will have one to three keys of its own: the `name` of the key, and optionally the key's `expiration` and `metadata` values.

The `name` is a `string`, the `expiration` value is a number, and `metadata` is whatever type was set initially. The `expiration` value will only be returned if the key has an expiration and will be in the absolute value form, even if it was set in the TTL form. Any `metadata` will only be returned if the given key has non-null associated metadata.

If `list_complete` is `false`, there are more keys to fetch, even if the `keys` array is empty. You will use the `cursor` property to get more keys. Refer to [Pagination](#pagination) for more details.

Consider storing your values in metadata if your values fit in the [metadata-size limit](https://developers.cloudflare.com/kv/platform/limits/). Storing values in metadata is more efficient than a `list()` followed by a `get()` per key. When using `put()`, leave the `value` parameter empty and instead include a property in the metadata object:

```js
await NAMESPACE.put(key, "", {
  metadata: { value: value },
});
```

Changes may take up to 60 seconds (or the value set with `cacheTtl` of the `get()` or `getWithMetadata()` method) to be reflected on the application calling the method on the KV namespace.

## Guidance

### List by prefix

List all the keys starting with a particular prefix.

For example, you may have structured your keys with a user, a user ID, and key names, separated by colons (such as `user:1:<key>`). You could get the keys for user number one by using the following code:

```js
export default {
  async fetch(request, env, ctx) {
    const value = await env.NAMESPACE.list({ prefix: "user:1:" });
    return new Response(value.keys);
  },
};
```

This will return all keys starting with the `"user:1:"` prefix.

### Ordering

Keys are always returned in lexicographically sorted order according to their UTF-8 bytes.

### Pagination

If there are more keys to fetch, the `list_complete` key will be set to `false` and a `cursor` will also be returned. In this case, you can call `list()` again with the `cursor` value to get the next batch of keys:

```js
const value = await NAMESPACE.list();


const cursor = value.cursor;


const next_value = await NAMESPACE.list({ cursor: cursor });
```

Checking for an empty array in `keys` is not sufficient to determine whether there are more keys to fetch. Instead, use `list_complete`.

It is possible to have an empty array in `keys`, but still have more keys to fetch, because [recently expired or deleted keys](https://en.wikipedia.org/wiki/Tombstone_%28data_store%29) must be iterated through but will not be included in the returned `keys`.

When de-paginating a large result set while also providing a `prefix` argument, the `prefix` argument must be provided in all subsequent calls along with the initial arguments.

### Optimizing storage with metadata for `list()` operations

Consider storing your values in metadata if your values fit in the [metadata-size limit](https://developers.cloudflare.com/kv/platform/limits/). Storing values in metadata is more efficient than a `list()` followed by a `get()` per key. When using `put()`, leave the `value` parameter empty and instead include a property in the metadata object:

```js
await NAMESPACE.put(key, "", {
  metadata: { value: value },
});
```

## Other methods to access KV

You can also [list keys on the command line with Wrangler](https://developers.cloudflare.com/kv/reference/kv-commands/#kv-namespace-list) or [with the REST API](https://developers.cloudflare.com/api/resources/kv/subresources/namespaces/subresources/keys/methods/list/).

</page>

<page>
---
title: Read key-value pairs · Cloudflare Workers KV docs
description: "To get the value for a given key, call the get() method of the KV
  binding on any KV namespace you have bound to your Worker code:"
lastUpdated: 2026-01-30T16:08:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/kv/api/read-key-value-pairs/
  md: https://developers.cloudflare.com/kv/api/read-key-value-pairs/index.md
---

To get the value for a given key, call the `get()` method of the [KV binding](https://developers.cloudflare.com/kv/concepts/kv-bindings/) on any [KV namespace](https://developers.cloudflare.com/kv/concepts/kv-namespaces/) you have bound to your Worker code:

```js
// Read individual key
env.NAMESPACE.get(key);


// Read multiple keys
env.NAMESPACE.get(keys);
```

The `get()` method returns a promise you can `await` on to get the value.

If you request a single key as a string, you will get a single response in the promise. If the key is not found, the promise will resolve with the literal value `null`.

You can also request an array of keys. The return value with be a `Map` of the key-value pairs found, with keys not found having `null` values.

```js
export default {
  async fetch(request, env, ctx) {
    try {
      // Read single key, returns value or null
      const value = await env.NAMESPACE.get("first-key");


      // Read multiple keys, returns Map of values
      const values = await env.NAMESPACE.get(["first-key", "second-key"]);


      // Read single key with metadata, returns value or null
      const valueWithMetadata = await env.NAMESPACE.getWithMetadata("first-key");


      // Read multiple keys with metadata, returns Map of values
      const valuesWithMetadata = await env.NAMESPACE.getWithMetadata(["first-key", "second-key"]);


      return new Response({
        value: value,
        values: Object.fromEntries(values),
        valueWithMetadata: valueWithMetadata,
        valuesWithMetadata: Object.fromEntries(valuesWithMetadata)
      });
    } catch (e) {
      return new Response(e.message, { status: 500 });
    }
  },
};
```

Note

`get()` and `getWithMetadata()` methods may return stale values. If a given key has recently been read in a given location, writes or updates to the key made in other locations may take up to 60 seconds (or the duration of the `cacheTtl`) to display.

## Reference

The following methods are provided to read from KV:

* [get()](#request-a-single-key-with-getkey-string)
* [getWithMetadata()](#request-multiple-keys-with-getkeys-string)

### `get()` method

Use the `get()` method to get a single value, or multiple values if given multiple keys:

* Read single keys with [get(key: string)](#request-a-single-key-with-getkey-string)
* Read multiple keys with [get(keys: string\[\])](#request-multiple-keys-with-getkeys-string)

#### Request a single key with `get(key: string)`

To get the value for a single key, call the `get()` method on any KV namespace you have bound to your Worker code with:

```js
env.NAMESPACE.get(key, type?);
// OR
env.NAMESPACE.get(key, options?);
```

##### Parameters

* `key`: `string`
  * The key of the KV pair.
* `type`: `"text" | "json" | "arrayBuffer" | "stream"`
  * Optional. The type of the value to be returned. `text` is the default.
* `options`: `{ cacheTtl?: number, type?: "text" | "json" | "arrayBuffer" | "stream" }`
  * Optional. Object containing the optional `cacheTtl` and `type` properties. The `cacheTtl` property defines the length of time in seconds that a KV result is cached in the global network location it is accessed from (minimum: 30). The `type` property defines the type of the value to be returned.

##### Response

* `response`: `Promise<string | Object | ArrayBuffer | ReadableStream | null>`

  * The value for the requested KV pair. The response type will depend on the `type` parameter provided for the `get()` command as follows:
  * `text`: A `string` (default).
  * `json`: An object decoded from a JSON string.
  * `arrayBuffer`: An [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) instance.
  * `stream`: A [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream).

#### Request multiple keys with `get(keys: string[])`

To get the values for multiple keys, call the `get()` method on any KV namespace you have bound to your Worker code with:

```js
env.NAMESPACE.get(keys, type?);
// OR
env.NAMESPACE.get(keys, options?);
```

##### Parameters

* `keys`: `string[]`
  * The keys of the KV pairs. Max: 100 keys
* `type`: `"text" | "json"`
  * Optional. The type of the value to be returned. `text` is the default.
* `options`: `{ cacheTtl?: number, type?: "text" | "json" }`
  * Optional. Object containing the optional `cacheTtl` and `type` properties. The `cacheTtl` property defines the length of time in seconds that a KV result is cached in the global network location it is accessed from (minimum: 30). The `type` property defines the type of the value to be returned.

Note

The `.get()` function to read multiple keys does not support `arrayBuffer` or `stream` return types. If you need to read multiple keys of `arrayBuffer` or `stream` types, consider using the `.get()` function to read individual keys in parallel with `Promise.all()`.

##### Response

* `response`: `Promise<Map<string, string | Object | null>>`

  * The value for the requested KV pair. If no key is found, `null` is returned for the key. The response type will depend on the `type` parameter provided for the `get()` command as follows:

    * `text`: A `string` (default).
    * `json`: An object decoded from a JSON string.

The limit of the response size is 25 MB. Responses above this size will fail with a `413 Error` error message.

### `getWithMetadata()` method

Use the `getWithMetadata()` method to get a single value along with its metadata, or multiple values with their metadata:

* Read single keys with [getWithMetadata(key: string)](#request-a-single-key-with-getwithmetadatakey-string)
* Read multiple keys with [getWithMetadata(keys: string\[\])](#request-multiple-keys-with-getwithmetadatakeys-string)

#### Request a single key with `getWithMetadata(key: string)`

To get the value for a given key along with its metadata, call the `getWithMetadata()` method on any KV namespace you have bound to your Worker code:

```js
env.NAMESPACE.getWithMetadata(key, type?);
// OR
env.NAMESPACE.getWithMetadata(key, options?);
```

Metadata is a serializable value you append to each KV entry.

##### Parameters

* `key`: `string`
  * The key of the KV pair.
* `type`: `"text" | "json" | "arrayBuffer" | "stream"`
  * Optional. The type of the value to be returned. `text` is the default.
* `options`: `{ cacheTtl?: number, type?: "text" | "json" | "arrayBuffer" | "stream" }`
  * Optional. Object containing the optional `cacheTtl` and `type` properties. The `cacheTtl` property defines the length of time in seconds that a KV result is cached in the global network location it is accessed from (minimum: 30). The `type` property defines the type of the value to be returned.

##### Response

* `response`: `Promise<{ value: string | Object | ArrayBuffer | ReadableStream | null, metadata: string | null }>`

  * An object containing the value and the metadata for the requested KV pair. The type of the value attribute will depend on the `type` parameter provided for the `getWithMetadata()` command as follows:

    * `text`: A `string` (default).
    * `json`: An object decoded from a JSON string.
    * `arrayBuffer`: An [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) instance.
    * `stream`: A [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream).

If there is no metadata associated with the requested key-value pair, `null` will be returned for metadata.

#### Request multiple keys with `getWithMetadata(keys: string[])`

To get the values for a given set of keys along with their metadata, call the `getWithMetadata()` method on any KV namespace you have bound to your Worker code with:

```js
env.NAMESPACE.getWithMetadata(keys, type?);
// OR
env.NAMESPACE.getWithMetadata(keys, options?);
```

##### Parameters

* `keys`: `string[]`
  * The keys of the KV pairs. Max: 100 keys
* `type`: `"text" | "json"`
  * Optional. The type of the value to be returned. `text` is the default.
* `options`: `{ cacheTtl?: number, type?: "text" | "json" }`
  * Optional. Object containing the optional `cacheTtl` and `type` properties. The `cacheTtl` property defines the length of time in seconds that a KV result is cached in the global network location it is accessed from (minimum: 30). The `type` property defines the type of the value to be returned.

Note

The `.get()` function to read multiple keys does not support `arrayBuffer` or `stream` return types. If you need to read multiple keys of `arrayBuffer` or `stream` types, consider using the `.get()` function to read individual keys in parallel with `Promise.all()`.

##### Response

* `response`: `Promise<Map<string, { value: string | Object | null, metadata: string | Object | null }>`

  * An object containing the value and the metadata for the requested KV pair. The type of the value attribute will depend on the `type` parameter provided for the `getWithMetadata()` command as follows:

    * `text`: A `string` (default).
    * `json`: An object decoded from a JSON string.

  * The type of the metadata will just depend on what is stored, which can be either a string or an object.

If there is no metadata associated with the requested key-value pair, `null` will be returned for metadata.

The limit of the response size is 25 MB. Responses above this size will fail with a `413 Error` error message.

## Guidance

### Type parameter

For simple values, use the default `text` type which provides you with your value as a `string`. For convenience, a `json` type is also specified which will convert a JSON value into an object before returning the object to you. For large values, use `stream` to request a `ReadableStream`. For binary values, use `arrayBuffer` to request an `ArrayBuffer`.

For large values, the choice of `type` can have a noticeable effect on latency and CPU usage. For reference, the `type` can be ordered from fastest to slowest as `stream`, `arrayBuffer`, `text`, and `json`.

### CacheTtl parameter

`cacheTtl` is a parameter that defines the length of time in seconds that a KV result is cached in the global network location it is accessed from.

Defining the length of time in seconds is useful for reducing cold read latency on keys that are read relatively infrequently. `cacheTtl` is useful if your data is write-once or write-rarely.

Hot and cold read

A hot read means that the data is cached on Cloudflare's edge network using the [CDN](https://developers.cloudflare.com/cache/), whether it is in a local cache or a regional cache. A cold read means that the data is not cached, so the data must be fetched from the central stores. Both existing key-value pairs and non-existent key-value pairs (also known as negative lookups) are cached at the edge.

`cacheTtl` is not recommended if your data is updated often and you need to see updates shortly after they are written, because writes that happen from other global network locations will not be visible until the cached value expires.

The `cacheTtl` parameter must be an integer greater than or equal to `30`. `60` is the default. The maximum value for `cacheTtl` is [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER).

Once a key has been read with a given `cacheTtl` in a region, it will remain cached in that region until the end of the `cacheTtl` or eviction. This affects regional and central tiers of KV's built-in caching layers. When writing to Workers KV, the regions in the regional and central caching layers internal to KV will get revalidated with the newly written result.

### Requesting more keys per Worker invocation with bulk requests

Workers are limited to 1,000 operations to external services per invocation. This applies to Workers KV, as documented in [Workers KV limits](https://developers.cloudflare.com/kv/platform/limits/).

To read more than 1,000 keys per operation, you can use the bulk read operations to read multiple keys in a single operation. These count as a single operation against the 1,000 operation limit.

### Reducing cardinality by coalescing keys

If you have a set of related key-value pairs that have a mixed usage pattern (some hot keys and some cold keys), consider coalescing them. By coalescing cold keys with hot keys, cold keys will be cached alongside hot keys which can provide faster reads than if they were uncached as individual keys.

#### Merging into a "super" KV entry

One coalescing technique is to make all the keys and values part of a super key-value object. An example is shown below.

```plaintext
key1: value1
key2: value2
key3: value3
```

becomes

```plaintext
coalesced: {
  key1: value1,
  key2: value2,
  key3: value3,
}
```

By coalescing the values, the cold keys benefit from being kept warm in the cache because of access patterns of the warmer keys.

This works best if you are not expecting the need to update the values independently of each other, which can pose race conditions.

* **Advantage**: Infrequently accessed keys are kept in the cache.
* **Disadvantage**: Size of the resultant value can push your worker out of its memory limits. Safely updating the value requires a [locking mechanism](https://developers.cloudflare.com/kv/api/write-key-value-pairs/#concurrent-writes-to-the-same-key) of some kind.

## Other methods to access KV

You can [read key-value pairs from the command line with Wrangler](https://developers.cloudflare.com/kv/reference/kv-commands/#kv-key-get) and [from the REST API](https://developers.cloudflare.com/api/resources/kv/subresources/namespaces/subresources/values/methods/get/).

</page>

<page>
---
title: Write key-value pairs · Cloudflare Workers KV docs
description: "To create a new key-value pair, or to update the value for a
  particular key, call the put() method of the KV binding on any KV namespace
  you have bound to your Worker code:"
lastUpdated: 2026-01-30T16:08:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/kv/api/write-key-value-pairs/
  md: https://developers.cloudflare.com/kv/api/write-key-value-pairs/index.md
---

To create a new key-value pair, or to update the value for a particular key, call the `put()` method of the [KV binding](https://developers.cloudflare.com/kv/concepts/kv-bindings/) on any [KV namespace](https://developers.cloudflare.com/kv/concepts/kv-namespaces/) you have bound to your Worker code:

```js
env.NAMESPACE.put(key, value);
```

#### Example

An example of writing a key-value pair from within a Worker:

```js
export default {
  async fetch(request, env, ctx) {
    try {
      await env.NAMESPACE.put("first-key", "This is the value for the key");


      return new Response("Successful write", {
        status: 201,
      });
    } catch (e) {
      return new Response(e.message, { status: 500 });
    }
  },
};
```

## Reference

The following method is provided to write to KV:

* [put()](#put-method)

### `put()` method

To create a new key-value pair, or to update the value for a particular key, call the `put()` method on any KV namespace you have bound to your Worker code:

```js
env.NAMESPACE.put(key, value, options?);
```

#### Parameters

* `key`: `string`

  * The key to associate with the value. A key cannot be empty or be exactly equal to `.` or `..`. All other keys are valid. Keys have a maximum length of 512 bytes.

* `value`: `string` | `ReadableStream` | `ArrayBuffer`

  * The value to store. The type is inferred. The maximum size of a value is 25 MiB.

* `options`: `{ expiration?: number, expirationTtl?: number, metadata?: object }`

  * Optional. An object containing the `expiration` (optional), `expirationTtl` (optional), and `metadata` (optional) attributes.

    * `expiration` is the number that represents when to expire the key-value pair in seconds since epoch.
    * `expirationTtl` is the number that represents when to expire the key-value pair in seconds from now. The minimum value is 60.
    * `metadata` is an object that must serialize to JSON. The maximum size of the serialized JSON representation of the metadata object is 1024 bytes.

#### Response

* `response`: `Promise<void>`
  * A `Promise` that resolves if the update is successful.

The put() method returns a Promise that you should `await` on to verify a successful update.

## Guidance

### Concurrent writes to the same key

Due to the eventually consistent nature of KV, concurrent writes to the same key can end up overwriting one another. It is a common pattern to write data from a single process with Wrangler, Durable Objects, or the API. This avoids competing concurrent writes because of the single stream. All data is still readily available within all Workers bound to the namespace.

If concurrent writes are made to the same key, the last write will take precedence.

Writes are immediately visible to other requests in the same global network location, but can take up to 60 seconds (or the value of the `cacheTtl` parameter of the `get()` or `getWithMetadata()` methods) to be visible in other parts of the world.

Refer to [How KV works](https://developers.cloudflare.com/kv/concepts/how-kv-works/) for more information on this topic.

### Write data in bulk

Write more than one key-value pair at a time with Wrangler or [via the REST API](https://developers.cloudflare.com/api/resources/kv/subresources/namespaces/subresources/keys/methods/bulk_update/).

The bulk API can accept up to 10,000 KV pairs at once.

A `key` and a `value` are required for each KV pair. The entire request size must be less than 100 megabytes. Bulk writes are not supported using the [KV binding](https://developers.cloudflare.com/kv/concepts/kv-bindings/).

### Expiring keys

KV offers the ability to create keys that automatically expire. You may configure expiration to occur either at a particular point in time (using the `expiration` option), or after a certain amount of time has passed since the key was last modified (using the `expirationTtl` option).

Once the expiration time of an expiring key is reached, it will be deleted from the system. After its deletion, attempts to read the key will behave as if the key does not exist. The deleted key will not count against the KV namespace’s storage usage for billing purposes.

Note

An `expiration` setting on a key will result in that key being deleted, even in cases where the `cacheTtl` is set to a higher (longer duration) value. Expiration always takes precedence.

There are two ways to specify when a key should expire:

* Set a key's expiration using an absolute time specified in a number of [seconds since the UNIX epoch](https://en.wikipedia.org/wiki/Unix_time). For example, if you wanted a key to expire at 12:00AM UTC on April 1, 2019, you would set the key’s expiration to `1554076800`.

* Set a key's expiration time to live (TTL) using a relative number of seconds from the current time. For example, if you wanted a key to expire 10 minutes after creating it, you would set its expiration TTL to `600`.

Expiration targets that are less than 60 seconds into the future are not supported. This is true for both expiration methods.

#### Create expiring keys

To create expiring keys, set `expiration` in the `put()` options to a number representing the seconds since epoch, or set `expirationTtl` in the `put()` options to a number representing the seconds from now:

```js
await env.NAMESPACE.put(key, value, {
  expiration: secondsSinceEpoch,
});


await env.NAMESPACE.put(key, value, {
  expirationTtl: secondsFromNow,
});
```

These assume that `secondsSinceEpoch` and `secondsFromNow` are variables defined elsewhere in your Worker code.

### Metadata

To associate metadata with a key-value pair, set `metadata` in the `put()` options to an object (serializable to JSON):

```js
await env.NAMESPACE.put(key, value, {
  metadata: { someMetadataKey: "someMetadataValue" },
});
```

### Limits to KV writes to the same key

Workers KV has a maximum of 1 write to the same key per second. Writes made to the same key within 1 second will cause rate limiting (`429`) errors to be thrown.

You should not write more than once per second to the same key. Consider consolidating your writes to a key within a Worker invocation to a single write, or wait at least 1 second between writes.

The following example serves as a demonstration of how multiple writes to the same key may return errors by forcing concurrent writes within a single Worker invocation. This is not a pattern that should be used in production.

```typescript
export default {
  async fetch(request, env, ctx): Promise<Response> {
    // Rest of code omitted
    const key = "common-key";
    const parallelWritesCount = 20;


    // Helper function to attempt a write to KV and handle errors
    const attemptWrite = async (i: number) => {
      try {
        await env.YOUR_KV_NAMESPACE.put(key, `Write attempt #${i}`);
        return { attempt: i, success: true };
      } catch (error) {
        // An error may be thrown if a write to the same key is made within 1 second with a message. For example:
        // error: {
        //  "message": "KV PUT failed: 429 Too Many Requests"
        // }


        return {
          attempt: i,
          success: false,
          error: { message: (error as Error).message },
        };
      }
    };


    // Send all requests in parallel and collect results
    const results = await Promise.all(
      Array.from({ length: parallelWritesCount }, (_, i) =>
        attemptWrite(i + 1),
      ),
    );
    // Results will look like:
    // [
    //     {
    //       "attempt": 1,
    //       "success": true
    //     },
    //    {
    //       "attempt": 2,
    //       "success": false,
    //       "error": {
    //         "message": "KV PUT failed: 429 Too Many Requests"
    //       }
    //     },
    //     ...
    // ]


    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
```

To handle these errors, we recommend implementing a retry logic, with exponential backoff. Here is a simple approach to add retries to the above code.

```typescript
export default {
  async fetch(request, env, ctx): Promise<Response> {
    // Rest of code omitted
    const key = "common-key";
    const parallelWritesCount = 20;


    // Helper function to attempt a write to KV with retries
    const attemptWrite = async (i: number) => {
      return await retryWithBackoff(async () => {
        await env.YOUR_KV_NAMESPACE.put(key, `Write attempt #${i}`);
        return { attempt: i, success: true };
      });
    };


    // Send all requests in parallel and collect results
    const results = await Promise.all(
      Array.from({ length: parallelWritesCount }, (_, i) =>
        attemptWrite(i + 1),
      ),
    );


    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" },
    });
  },
};


async function retryWithBackoff(
  fn: Function,
  maxAttempts = 5,
  initialDelay = 1000,
) {
  let attempts = 0;
  let delay = initialDelay;


  while (attempts < maxAttempts) {
    try {
      // Attempt the function
      return await fn();
    } catch (error) {
      // Check if the error is a rate limit error
      if (
        (error as Error).message.includes(
          "KV PUT failed: 429 Too Many Requests",
        )
      ) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error("Max retry attempts reached");
        }


        // Wait for the backoff period
        console.warn(`Attempt ${attempts} failed. Retrying in ${delay} ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));


        // Exponential backoff
        delay *= 2;
      } else {
        // If it's a different error, rethrow it
        throw error;
      }
    }
  }
}
```

## Other methods to access KV

You can also [write key-value pairs from the command line with Wrangler](https://developers.cloudflare.com/kv/reference/kv-commands/#kv-namespace-create) and [write data via the REST API](https://developers.cloudflare.com/api/resources/kv/subresources/namespaces/subresources/values/methods/update/).

</page>

<page>
---
title: How KV works · Cloudflare Workers KV docs
description: KV is a global, low-latency, key-value data store. It stores data
  in a small number of centralized data centers, then caches that data in
  Cloudflare's data centers after access.
lastUpdated: 2025-03-14T14:36:56.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/kv/concepts/how-kv-works/
  md: https://developers.cloudflare.com/kv/concepts/how-kv-works/index.md
---

KV is a global, low-latency, key-value data store. It stores data in a small number of centralized data centers, then caches that data in Cloudflare's data centers after access.

KV supports exceptionally high read volumes with low latency, making it possible to build dynamic APIs that scale thanks to KV's built-in caching and global distribution. Requests which are not in cache and need to access the central stores can experience higher latencies.

## Write data to KV and read data from KV

When you write to KV, your data is written to central data stores. Your data is not sent automatically to every location's cache.

![Your data is written to central data stores when you write to KV.](https://developers.cloudflare.com/_astro/kv-write.jjzouJNv_Z1fOUQ2.svg)

Initial reads from a location do not have a cached value. Data must be read from the nearest regional tier, followed by a central tier, degrading finally to the central stores for a truly cold global read. While the first access is slow globally, subsequent requests are faster, especially if requests are concentrated in a single region.

Hot and cold read

A hot read means that the data is cached on Cloudflare's edge network using the [CDN](https://developers.cloudflare.com/cache/), whether it is in a local cache or a regional cache. A cold read means that the data is not cached, so the data must be fetched from the central stores.

![Initial reads will miss the cache and go to the nearest central data store first.](https://developers.cloudflare.com/_astro/kv-slow-read.CTQ3d4MF_Z1fOUQ2.svg)

Frequent reads from the same location return the cached value without reading from anywhere else, resulting in the fastest response times. KV operates diligently to update the cached values by refreshing from upper tier caches and central data stores before cache expires in the background.

Refreshing from upper tiers and the central data stores in the background is done carefully so that assets that are being accessed continue to be kept served from the cache without any stalls.

![As mentioned above, frequent reads will return a cached value.](https://developers.cloudflare.com/_astro/kv-fast-read.Bxp8uFUb_Z1fOUQ2.svg)

KV is optimized for high-read applications. It stores data centrally and uses a hybrid push/pull-based replication to store data in cache. KV is suitable for use cases where you need to write relatively infrequently, but read quickly and frequently. Infrequently read values are pulled from other data centers or the central stores, while more popular values are cached in the data centers they are requested from.

## Performance

To improve KV performance, increase the [`cacheTtl` parameter](https://developers.cloudflare.com/kv/api/read-key-value-pairs/#cachettl-parameter) up from its default 60 seconds.

KV achieves high performance by [caching](https://www.cloudflare.com/en-gb/learning/cdn/what-is-caching/) which makes reads eventually-consistent with writes.

Changes are usually immediately visible in the Cloudflare global network location at which they are made. Changes may take up to 60 seconds or more to be visible in other global network locations as their cached versions of the data time out.

Negative lookups indicating that the key does not exist are also cached, so the same delay exists noticing a value is created as when a value is changed.

## Consistency

KV achieves high performance by being eventually-consistent. At the Cloudflare global network location at which changes are made, these changes are usually immediately visible. However, this is not guaranteed and therefore it is not advised to rely on this behaviour. In other global network locations changes may take up to 60 seconds or more to be visible as their cached versions of the data time-out.

Visibility of changes takes longer in locations which have recently read a previous version of a given key (including reads that indicated the key did not exist, which are also cached locally).

Note

KV is not ideal for applications where you need support for atomic operations or where values must be read and written in a single transaction. If you need stronger consistency guarantees, consider using [Durable Objects](https://developers.cloudflare.com/durable-objects/).

An approach to achieve write-after-write consistency is to send all of your writes for a given KV key through a corresponding instance of a Durable Object, and then read that value from KV in other Workers. This is useful if you need more control over writes, but are satisfied with KV's read characteristics described above.

## Guidance

Workers KV is an eventually-consistent edge key-value store. That makes it ideal for **read-heavy**, highly cacheable workloads such as:

* Serving static assets
* Storing application configuration
* Storing user preferences
* Implementing allow-lists/deny-lists
* Caching

In these scenarios, Workers are invoked in a data center closest to the user and Workers KV data will be cached in that region for subsequent requests to minimize latency.

If you have a **write-heavy** [Redis](https://redis.io)-type workload where you are updating the same key tens or hundreds of times per second, KV will not be an ideal fit. If you can revisit how your application writes to single key-value pairs and spread your writes across several discrete keys, Workers KV can suit your needs. Alternatively, [Durable Objects](https://developers.cloudflare.com/durable-objects/) provides a key-value API with higher writes per key rate limits.

## Security

Refer to [Data security documentation](https://developers.cloudflare.com/kv/reference/data-security/) to understand how Workers KV secures data.

</page>

<page>
---
title: KV bindings · Cloudflare Workers KV docs
description: KV bindings allow for communication between a Worker and a KV namespace.
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
tags: Bindings
source_url:
  html: https://developers.cloudflare.com/kv/concepts/kv-bindings/
  md: https://developers.cloudflare.com/kv/concepts/kv-bindings/index.md
---

KV [bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/) allow for communication between a Worker and a KV namespace.

Configure KV bindings in the [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/).

## Access KV from Workers

A [KV namespace](https://developers.cloudflare.com/kv/concepts/kv-namespaces/) is a key-value database replicated to Cloudflare's global network.

To connect to a KV namespace from within a Worker, you must define a binding that points to the namespace's ID.

The name of your binding does not need to match the KV namespace's name. Instead, the binding should be a valid JavaScript identifier, because the identifier will exist as a global variable within your Worker.

A KV namespace will have a name you choose (for example, `My tasks`), and an assigned ID (for example, `06779da6940b431db6e566b4846d64db`).

To execute your Worker, define the binding.

In the following example, the binding is called `TODO`. In the `kv_namespaces` portion of your Wrangler configuration file, add:

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "worker",
    // ...
    "kv_namespaces": [
      {
        "binding": "TODO",
        "id": "06779da6940b431db6e566b4846d64db"
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "worker"


  [[kv_namespaces]]
  binding = "TODO"
  id = "06779da6940b431db6e566b4846d64db"
  ```

With this, the deployed Worker will have a `TODO` field in their environment object (the second parameter of the `fetch()` request handler). Any methods on the `TODO` binding will map to the KV namespace with an ID of `06779da6940b431db6e566b4846d64db` – which you called `My Tasks` earlier.

```js
export default {
  async fetch(request, env, ctx) {
    // Get the value for the "to-do:123" key
    // NOTE: Relies on the `TODO` KV binding that maps to the "My Tasks" namespace.
    let value = await env.TODO.get("to-do:123");


    // Return the value, as is, for the Response
    return new Response(value);
  },
};
```

## Use KV bindings when developing locally

When you use Wrangler to develop locally with the `wrangler dev` command, Wrangler will default to using a local version of KV to avoid interfering with any of your live production data in KV. This means that reading keys that you have not written locally will return `null`.

To have `wrangler dev` connect to your Workers KV namespace running on Cloudflare's global network, set `"remote" : true` in the KV binding configuration. Refer to the [remote bindings documentation](https://developers.cloudflare.com/workers/development-testing/#remote-bindings) for more information.

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "worker",
    // ...
    "kv_namespaces": [
      {
        "binding": "TODO",
        "id": "06779da6940b431db6e566b4846d64db"
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "worker"


  [[kv_namespaces]]
  binding = "TODO"
  id = "06779da6940b431db6e566b4846d64db"
  ```

## Access KV from Durable Objects and Workers using ES modules format

[Durable Objects](https://developers.cloudflare.com/durable-objects/) use ES modules format. Instead of a global variable, bindings are available as properties of the `env` parameter [passed to the constructor](https://developers.cloudflare.com/durable-objects/get-started/#2-write-a-durable-object-class).

An example might look like:

```js
import { DurableObject } from "cloudflare:workers";


export class MyDurableObject extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
  }


  async fetch(request) {
    const valueFromKV = await this.env.NAMESPACE.get("someKey");
    return new Response(valueFromKV);
  }
}
```

</page>

<page>
---
title: KV namespaces · Cloudflare Workers KV docs
description: A KV namespace is a key-value database replicated to Cloudflare’s
  global network.
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/kv/concepts/kv-namespaces/
  md: https://developers.cloudflare.com/kv/concepts/kv-namespaces/index.md
---

A KV namespace is a key-value database replicated to Cloudflare’s global network.

Bind your KV namespaces through Wrangler or via the Cloudflare dashboard.

Note

KV namespace IDs are public and bound to your account.

## Bind your KV namespace through Wrangler

To bind KV namespaces to your Worker, assign an array of the below object to the `kv_namespaces` key.

* `binding` string required

  * The binding name used to refer to the KV namespace.

* `id` string required

  * The ID of the KV namespace.

* `preview_id` string optional

  * The ID of the KV namespace used during `wrangler dev`.

Example:

* wrangler.jsonc

  ```jsonc
  {
    "kv_namespaces": [
      {
        "binding": "<TEST_NAMESPACE>",
        "id": "<TEST_ID>"
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  [[kv_namespaces]]
  binding = "<TEST_NAMESPACE>"
  id = "<TEST_ID>"
  ```

## Bind your KV namespace via the dashboard

To bind the namespace to your Worker in the Cloudflare dashboard:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your **Worker**.

3. Select **Settings** > **Bindings**.

4. Select **Add**.

5. Select **KV Namespace**.

6. Enter your desired variable name (the name of the binding).

7. Select the KV namespace you wish to bind the Worker to.

8. Select **Deploy**.

</page>

<page>
---
title: Cache data with Workers KV · Cloudflare Workers KV docs
description: Example of how to use Workers KV to build a distributed application
  configuration store.
lastUpdated: 2026-01-30T16:08:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/kv/examples/cache-data-with-workers-kv/
  md: https://developers.cloudflare.com/kv/examples/cache-data-with-workers-kv/index.md
---

Workers KV can be used as a persistent, single, global cache accessible from Cloudflare Workers to speed up your application. Data cached in Workers KV is accessible from all other Cloudflare locations as well, and persists until expiry or deletion.

After fetching data from external resources in your Workers application, you can write the data to Workers KV. On subsequent Worker requests (in the same region or in other regions), you can read the cached data from Workers KV instead of calling the external API. This improves your Worker application's performance and resilience while reducing load on external resources.

This example shows how you can cache data in Workers KV and read cached data from Workers KV in a Worker application.

Note

You can also cache data in Workers with the [Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/). With the Cache API, the contents of the cache do not replicate outside of the originating data center and the cache is ephemeral (can be evicted).

With Workers KV, the data is persisted by default to [central stores](https://developers.cloudflare.com/kv/concepts/how-kv-works/) (or can be set to [expire](https://developers.cloudflare.com/kv/api/write-key-value-pairs/#expiring-keys), and can be accessed from other Cloudflare locations.

## Cache data in Workers KV from your Worker application

In the following `index.ts` file, the Worker fetches data from an external server and caches the response in Workers KV. If the data is already cached in Workers KV, the Worker reads the cached data from Workers KV instead of calling the external API.

* index.ts

  ```js
  interface Env {
    CACHE_KV: KVNamespace;
  }


  export default {
    async fetch(request, env, ctx): Promise<Response> {


       const EXPIRATION_TTL = 30; // Cache expiration in seconds
      const url = 'https://example.com';
      const cacheKey = "cache-json-example";


      // Try to get data from KV cache first
      let data = await env.CACHE_KV.get(cacheKey, { type: 'json' });
      let fromCache = true;


      // If data is not in cache, fetch it from example.com
      if (!data) {
        console.log('Cache miss. Fetching fresh data from example.com');
        fromCache = false;


          // In this example, we are fetching HTML content but it can also be API responses or any other data
        const response = await fetch(url);
          const htmlData = await response.text();


          // In this example, we are converting HTML to JSON to demonstrate caching JSON data with Workers KV
          // You could cache any type of data, or even cache the HTML data directly
          data = helperConvertToJSON(htmlData);
          // The expirationTtl option is used to set the expiration time for the cache entry (in seconds), otherwise it will be stored indefinitely
          await env.CACHE_KV.put(cacheKey, JSON.stringify(data), { expirationTtl: EXPIRATION_TTL });
      }


      // Return the appropriate response format
        return new Response(JSON.stringify({
          data,
          fromCache
        }), {
          headers: { 'Content-Type': 'application/json' }
        });


  }
  } satisfies ExportedHandler<Env>;
  31 collapsed lines


  // Helper function to convert HTML to JSON
  function helperConvertToJSON(html: string) {
  // Parse HTML and extract relevant data
  const title = helperExtractTitle(html);
  const content = helperExtractContent(html);
  const lastUpdated = new Date().toISOString();


      return { title, content, lastUpdated };


  }


  // Helper function to extract title from HTML
  function helperExtractTitle(html: string) {
  const titleMatch = html.match(/<title>(.\*?)<\/title>/i);
  return titleMatch ? titleMatch[1] : 'No title found';
  }


  // Helper function to extract content from HTML
  function helperExtractContent(html: string) {
  const bodyMatch = html.match(/<body>(.\*?)<\/body>/is);
  if (!bodyMatch) return 'No content found';


      // Strip HTML tags for a simple text representation
      const textContent = bodyMatch[1].replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();


      return textContent;


  }
  ```

* wrangler.jsonc

  ```json
  {
    "$schema": "node_modules/wrangler/config-schema.json",
    "name": "<ENTER_WORKER_NAME>",
    "main": "src/index.ts",
    "compatibility_date": "2025-03-03",
    "observability": {
      "enabled": true
    },
    "kv_namespaces": [
      {
        "binding": "CACHE_KV",
        "id": "<YOUR_BINDING_ID>"
      }
    ]
  }
  ```

This code snippet demonstrates how to read and update cached data in Workers KV from your Worker. If the data is not in the Workers KV cache, the Worker fetches the data from an external server and caches it in Workers KV.

In this example, we convert HTML to JSON to demonstrate how to cache JSON data with Workers KV, but any type of data can be cached in Workers KV. For instance, you could cache API responses, HTML content, or any other data that you want to persist across requests.

## Related resources

* [Rust support in Workers](https://developers.cloudflare.com/workers/languages/rust/).
* [Using KV in Workers](https://developers.cloudflare.com/kv/get-started/).

</page>

<page>
---
title: Build a distributed configuration store · Cloudflare Workers KV docs
description: Example of how to use Workers KV to build a distributed application
  configuration store.
lastUpdated: 2026-01-27T21:11:25.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/kv/examples/distributed-configuration-with-workers-kv/
  md: https://developers.cloudflare.com/kv/examples/distributed-configuration-with-workers-kv/index.md
---

Storing application configuration data is an ideal use case for Workers KV. Configuration data can include data to personalize an application for each user or tenant, enable features for user groups, restrict access with allow-lists/deny-lists, etc. These use-cases can have high read volumes that are highly cacheable by Workers KV, which can ensure low-latency reads from your Workers application.

In this example, application configuration data is used to personalize the Workers application for each user. The configuration data is stored in an external application and database, and written to Workers KV using the REST API.

## Write your configuration from your external application to Workers KV

In some cases, your source-of-truth for your configuration data may be stored elsewhere than Workers KV. If this is the case, use the Workers KV REST API to write the configuration data to your Workers KV namespace.

The following external Node.js application demonstrates a simple scripts that reads user data from a database and writes it to Workers KV using the REST API library.

* index.js

  ```js
  const postgres = require('postgres');
  const { Cloudflare } = require('cloudflare');
  const { backOff } = require('exponential-backoff');


  if(!process.env.DATABASE_CONNECTION_STRING || !process.env.CLOUDFLARE_EMAIL || !process.env.CLOUDFLARE_API_KEY || !process.env.CLOUDFLARE_WORKERS_KV_NAMESPACE_ID || !process.env.CLOUDFLARE_ACCOUNT_ID) {
  console.error('Missing required environment variables.');
  process.exit(1);
  }


  // Setup Postgres connection
  const sql = postgres(process.env.DATABASE_CONNECTION_STRING);


  // Setup Cloudflare REST API client
  const client = new Cloudflare({
  apiEmail: process.env.CLOUDFLARE_EMAIL,
  apiKey: process.env.CLOUDFLARE_API_KEY,
  });


  // Function to sync Postgres data to Workers KV
  async function syncPreviewStatus() {
  console.log('Starting sync of user preview status...');


      try {
        // Get all users and their preview status
        const users = await sql`SELECT id, preview_features_enabled FROM users`;


        console.log(users);


        // Create the bulk update body
        const bulkUpdateBody = users.map(user => ({
          key: user.id,
          value: JSON.stringify({
            preview_features_enabled: user.preview_features_enabled
          })
        }));


        const response = await backOff(async () => {
          console.log("trying to update")
          try{
            const response = await client.kv.namespaces.bulkUpdate(process.env.CLOUDFLARE_WORKERS_KV_NAMESPACE_ID, {
              account_id: process.env.CLOUDFLARE_ACCOUNT_ID,
              body: bulkUpdateBody
            });
          }
          catch(e){
            // Implement your error handling and logging here
            console.log(e);
            throw e; // Rethrow the error to retry
          }
        });


        console.log(`Sync complete. Updated ${users.length} users.`);
      } catch (error) {
        console.error('Error syncing preview status:', error);
      }


  }


  // Run the sync function
  syncPreviewStatus()
  .catch(console.error)
  .finally(() => process.exit(0));
  ```

* .env

  ```md
  DATABASE_CONNECTION_STRING = <DB_CONNECTION_STRING_HERE>
  CLOUDFLARE_EMAIL = <CLOUDFLARE_EMAIL_HERE>
  CLOUDFLARE_API_KEY = <CLOUDFLARE_API_KEY_HERE>
  CLOUDFLARE_ACCOUNT_ID = <CLOUDFLARE_ACCOUNT_ID_HERE>
  CLOUDFLARE_WORKERS_KV_NAMESPACE_ID = <CLOUDFLARE_WORKERS_KV_NAMESPACE_ID_HERE>
  ```

* db.sql

  ```sql
  -- Create users table with preview_features_enabled flag
  CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    preview_features_enabled BOOLEAN DEFAULT false
  );


  -- Insert sample users
  INSERT INTO users (username, email, preview_features_enabled) VALUES
  ('alice', 'alice@example.com', true),
  ('bob', 'bob@example.com', false),
  ('charlie', 'charlie@example.com', true);
  ```

In this code snippet, the Node.js application reads user data from a Postgres database and writes the user data to be used for configuration in our Workers application to Workers KV using the Cloudflare REST API Node.js library. The application also uses exponential backoff to handle retries in case of errors.

## Use configuration data from Workers KV in your Worker application

With the configuration data now in the Workers KV namespace, we can use it in our Workers application to personalize the application for each user.

* index.ts

  ```js
  // Example configuration data stored in Workers KV:
  // Key: "user-id-abc" | Value: {"preview_features_enabled": false}
  // Key: "user-id-def" | Value: {"preview_features_enabled": true}


  interface Env {
    USER_CONFIGURATION: KVNamespace;
  }


  export default {
    async fetch(request, env) {
      // Get user ID from query parameter
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');


      if (!userId) {
        return new Response('Please provide a userId query parameter', {
          status: 400,
          headers: { 'Content-Type': 'text/plain' }
        });
      }




      const userConfiguration = await env.USER_CONFIGURATION.get<{
        preview_features_enabled: boolean;
      }>(userId, {type: "json"});


      console.log(userConfiguration);


      // Build HTML response
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>My App</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
              .preview-banner {
                background-color: #ffeb3b;
                padding: 10px;
                text-align: center;
                margin-bottom: 20px;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            ${userConfiguration?.preview_features_enabled ? `
              <div class="preview-banner">
                🎉 You have early access to preview features! 🎉
              </div>
            ` : ''}
            <h1>Welcome to My App</h1>
            <p>This is the regular content everyone sees.</p>
          </body>
        </html>
      `;


      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }
  } satisfies ExportedHandler<Env>;
  ```

* wrangler.jsonc

  ```json
  {
    "$schema": "node_modules/wrangler/config-schema.json",
    "name": "<ENTER_WORKER_NAME>",
    "main": "src/index.ts",
    "compatibility_date": "2025-03-03",
    "observability": {
      "enabled": true
    },
    "kv_namespaces": [
      {
        "binding": "USER_CONFIGURATION",
        "id": "<YOUR_BINDING_ID>"
      }
    ]
  }
  ```

This code will use the path within the URL and find the file associated to the path within the KV store. It also sets the proper MIME type in the response to inform the browser how to handle the response. To retrieve the value from the KV store, this code uses `arrayBuffer` to properly handle binary data such as images, documents, and video/audio files.

## Optimize performance for configuration

To optimize performance, you may opt to consolidate values in fewer key-value pairs. By doing so, you may benefit from higher caching efficiency and lower latency.

For example, instead of storing each user's configuration in a separate key-value pair, you may store all users' configurations in a single key-value pair. This approach may be suitable for use-cases where the configuration data is small and can be easily managed in a single key-value pair (the [size limit for a Workers KV value is 25 MiB](https://developers.cloudflare.com/kv/platform/limits/)).

## Related resources

* [Rust support in Workers](https://developers.cloudflare.com/workers/languages/rust/)
* [Using KV in Workers](https://developers.cloudflare.com/kv/get-started/)

</page>

<page>
---
title: A/B testing with Workers KV · Cloudflare Workers KV docs
lastUpdated: 2025-08-18T14:27:42.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/kv/examples/implement-ab-testing-with-workers-kv/
  md: https://developers.cloudflare.com/kv/examples/implement-ab-testing-with-workers-kv/index.md
---


</page>

<page>
---
title: Route requests across various web servers · Cloudflare Workers KV docs
description: Example of how to use Workers KV to build a distributed application
  configuration store.
lastUpdated: 2026-01-27T21:11:25.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/kv/examples/routing-with-workers-kv/
  md: https://developers.cloudflare.com/kv/examples/routing-with-workers-kv/index.md
---

Using Workers KV to store routing data to route requests across various web servers with Workers is an ideal use case for Workers KV. Routing workloads can have high read volume, and Workers KV's low-latency reads can help ensure that routing decisions are made quickly and efficiently.

Routing can be helpful to route requests coming into a single Cloudflare Worker application to different web servers based on the request's path, hostname, or other request attributes.

In single-tenant applications, this can be used to route requests to various origin servers based on the business domain (for example, requests to `/admin` routed to administration server, `/store` routed to storefront server, `/api` routed to the API server).

In multi-tenant applications, requests can be routed to the tenant's respective origin resources (for example, requests to `tenantA.your-worker-hostname.com` routed to server for Tenant A, `tenantB.your-worker-hostname.com` routed to server for Tenant B).

Routing can also be used to implement [A/B testing](https://developers.cloudflare.com/reference-architecture/diagrams/serverless/a-b-testing-using-workers/), canary deployments, or [blue-green deployments](https://en.wikipedia.org/wiki/Blue%E2%80%93green_deployment) for your own external applications. If you are looking to implement canary or blue-green deployments of applications built fully on Cloudflare Workers, see [Workers gradual deployments](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/gradual-deployments/).

## Route requests with Workers KV

In this example, a multi-tenant e-Commerce application is built on Cloudflare Workers. Each storefront is a different tenant and has its own external web server. Our Cloudflare Worker is responsible for receiving all requests for all storefronts and routing requests to the correct origin web server according to the storefront ID.

For simplicity of demonstration, the storefront will be identified with a path element containing the storefront ID, where `https://<WORKER_HOSTNAME>/<STOREFRONT_ID>/...` is the URL pattern for the storefront. You may prefer to use subdomains to identify storefronts in a real-world scenario.

* index.ts

  ```js
  // Example routing data stored in Workers KV:
  // Key: "storefrontA" | Value: {"origin": "https://storefrontA-server.example.com"}
  // Key: "storefrontB" | Value: {"origin": "https://storefrontB-server.example.com"}


  interface Env {
  ROUTING_CONFIG: KVNamespace;
  }


  export default {
    async fetch(request, env, ctx) {


      // Parse the URL to extract the storefront ID from the path
      const url = new URL(request.url);
      const pathParts = url.pathname.split('/').filter(part => part !== '');


      // Check if a storefront ID is provided in the path, otherwise return 400
  6 collapsed lines
      if (pathParts.length === 0) {
        return new Response('Welcome to our multi-tenant platform. Please specify a storefront ID in the URL path.', {
          status: 400,
          headers: { 'Content-Type': 'text/plain' }
        });
      }


      // Extract the storefront ID from the first path segment
      const storefrontId = pathParts[0];


      try {
        // Look up the storefront configuration in KV using env.ROUTING_CONFIG
        const storefrontConfig = await env.ROUTING_CONFIG.get<{
            origin: string;
          }>(storefrontId, {type: "json"});


        // If no configuration is found, return a 404
  6 collapsed lines
        if (!storefrontConfig) {
          return new Response(`Storefront "${storefrontId}" not found.`, {
            status: 404,
            headers: { 'Content-Type': 'text/plain' }
          });
        }


        // Construct the new URL for the origin server
        // Remove the storefront ID from the path when forwarding
        const newPathname = '/' + pathParts.slice(1).join('/');
        const originUrl = new URL(newPathname, storefrontConfig.origin);
        originUrl.search = url.search;


        // Create a new request to the origin server
        const originRequest = new Request(originUrl, {
          method: request.method,
          headers: request.headers,
          body: request.body,
          redirect: 'follow'
        });


        // Send the request to the origin server
        const response = await fetch(originRequest);


          console.log(response.status)


        // Clone the response and add a custom header
        const modifiedResponse = new Response(response.body, response);
        modifiedResponse.headers.set('X-Served-By', 'Cloudflare Worker');
        modifiedResponse.headers.set('X-Storefront-ID', storefrontId);


        return modifiedResponse;


      } catch (error) {
        // Handle any errors
  5 collapsed lines
        console.error(`Error processing request for storefront ${storefrontId}:`, error);
        return new Response('An error occurred while processing your request.', {
          status: 500,
          headers: { 'Content-Type': 'text/plain' }
        });
      }


  }
  } satisfies ExportedHandler<Env>;
  ```

* wrangler.jsonc

  ```json
  {
    "$schema": "node_modules/wrangler/config-schema.json",
    "name": "<ENTER_WORKER_NAME>",
    "main": "src/index.ts",
    "compatibility_date": "2025-03-03",
    "observability": {
      "enabled": true
    },
    "kv_namespaces": [
      {
        "binding": "ROUTING_CONFIG",
        "id": "<YOUR_BINDING_ID>"
      }
    ]
  }
  ```

In this example, the Cloudflare Worker receives a request and extracts the storefront ID from the URL path. The storefront ID is used to look up the origin server URL from Workers KV using the `get()` method. The request is then forwarded to the origin server, and the response is modified to include custom headers before being returned to the client.

## Related resources

* [Rust support in Workers](https://developers.cloudflare.com/workers/languages/rust/).
* [Using KV in Workers](https://developers.cloudflare.com/kv/get-started/).

</page>

<page>
---
title: Store and retrieve static assets · Cloudflare Workers KV docs
description: Example of how to use Workers KV to store static assets
lastUpdated: 2026-02-06T10:14:51.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/kv/examples/workers-kv-to-serve-assets/
  md: https://developers.cloudflare.com/kv/examples/workers-kv-to-serve-assets/index.md
---

By storing static assets in Workers KV, you can retrieve these assets globally with low-latency and high throughput. You can then serve these assets directly, or use them to dynamically generate responses. This can be useful when serving files such as custom scripts, small images that fit within [KV limits](https://developers.cloudflare.com/kv/platform/limits/), or when generating dynamic HTML responses from static assets such as translations.

Note

If you need to **host a front-end or full-stack web application**, **use [Cloudflare Workers static assets](https://developers.cloudflare.com/workers/static-assets/) or [Cloudflare Pages](https://developers.cloudflare.com/pages/)**, which provide a purpose-built deployment experience for web applications and their assets.

[Workers KV](https://developers.cloudflare.com/kv/) provides a more flexible API which allows you to access, edit, and store assets directly from your [Worker](https://developers.cloudflare.com/workers/) without requiring deployments. This can be helpful for serving custom assets that are not included in your deployment bundle, such as uploaded media assets or custom scripts and files generated at runtime.

## Write static assets to Workers KV using Wrangler

To store static assets in Workers KV, you can use the [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (commonly used during development), the [Workers KV binding](https://developers.cloudflare.com/kv/concepts/kv-bindings/) from a Workers application, or the [Workers KV REST API](https://developers.cloudflare.com/api/resources/kv/subresources/namespaces/methods/list/) (commonly used to access Workers KV from an external application). We will demonstrate how to use the Wrangler CLI.

For this scenario, we will store a sample HTML file within our Workers KV store.

Create a new file `index.html` with the following content:

```html
Hello World!
```

We can then use the following Wrangler commands to create a KV pair for this file within our production and preview namespaces:

```sh
npx wrangler kv key put index.html --path index.html --namespace-id=<ENTER_NAMESPACE_ID_HERE>
```

This will create a KV pair with the filename as key and the file content as value, within the our production and preview namespaces specified by your binding in your Wrangler file.

## Serve static assets from KV from your Worker application

In this example, our Workers application will accept any key name as the path of the HTTP request and return the value stored in the KV store for that key.

* index.ts

  ```js
  import mime from "mime";


  interface Env {
  assets: KVNamespace;
  }


  export default {
    async fetch(request, env, ctx): Promise<Response> {
      // Return error if not a get request
      if(request.method !== 'GET'){
        return new Response('Method Not Allowed', {
          status: 405,
        })
      }


        // Get the key from the url & return error if key missing
        const parsedUrl = new URL(request.url)
        const key = parsedUrl.pathname.replace(/^\/+/, '') // Strip any preceding /'s
        if(!key){
          return new Response('Missing path in URL', {
            status: 400
          })
        }


        // Get the mimetype from the key path
        const extension = key.split('.').pop();
        let mimeType = mime.getType(extension) || "text/plain";
        if (mimeType.startsWith("text") || mimeType === "application/javascript") {
          mimeType += "; charset=utf-8";
        }


        // Get the value from the Workers KV store and return it if found
        const value = await env.assets.get(key, 'arrayBuffer')
        if(!value){
          return new Response("Not found", {
            status: 404
          })
        }


        // Return the response from the Workers application with the value from the KV store
        return new Response(value, {
          status: 200,
          headers: new Headers({
            "Content-Type": mimeType
          })
        });
      },


  } satisfies ExportedHandler<Env>;
  ```

* wrangler.jsonc

  ```json
  {
    "$schema": "node_modules/wrangler/config-schema.json",
    "name": "<ENTER_WORKER_NAME>",
    "main": "src/index.ts",
    "compatibility_date": "2025-03-03",
    "observability": {
      "enabled": true
    },
    "kv_namespaces": [
      {
        "binding": "assets",
        "id": "<YOUR_BINDING_ID>"
      }
    ]
  }
  ```

This code parses the key name for the key-value pair to fetch from the HTTP request. Then, it determines the proper MIME type for the response to inform the browser how to handle the response. To retrieve the value from the KV store, this code uses `arrayBuffer` to properly handle binary data such as images, documents, and video/audio files.

Given a sample key-value pair with key `index.html` with value containing some HTML content in our Workers KV namespace store, we can access our Workers application at `https://<YOUR-WORKER-HOSTNAME>/index.html` to see the contents of the `index.html` file.

Try it out with an image or a document and you will see that this Worker is also properly serving those assets from KV.

## Generate dynamic responses from your key-value pairs

In addition to serving static assets, we can also generate dynamic HTML or API responses based on the values stored in our KV store.

1. Start by creating this file in the root of your project:

```json
[
  {
    "language_code": "en",
    "message": "Hello World!"
  },
  {
    "language_code": "es",
    "message": "¡Hola Mundo!"
  },
  {
    "language_code": "fr",
    "message": "Bonjour le monde!"
  },
  {
    "language_code": "de",
    "message": "Hallo Welt!"
  },
  {
    "language_code": "zh",
    "message": "你好，世界！"
  },
  {
    "language_code": "ja",
    "message": "こんにちは、世界！"
  },
  {
    "language_code": "hi",
    "message": "नमस्ते दुनिया!"
  },
  {
    "language_code": "ar",
    "message": "مرحبا بالعالم!"
  }
]
```

1. Open a terminal and enter the following KV command to create a KV entry for the translations file:

```sh
npx wrangler kv key put hello-world.json --path hello-world.json --namespace-id=<ENTER_NAMESPACE_ID_HERE>
```

1. Update your Workers code to add logic to serve a translated HTML file based on the language of the Accept-Language header of the request:

* index.ts

  ```js
  import mime from 'mime';
  import parser from 'accept-language-parser'


  interface Env {
  assets: KVNamespace;
  }


  export default {
    async fetch(request, env, ctx): Promise<Response> {
      // Return error if not a get request
      if(request.method !== 'GET'){
        return new Response('Method Not Allowed', {
          status: 405,
        })
      }


      // Get the key from the url & return error if key missing
      const parsedUrl = new URL(request.url)
      const key = parsedUrl.pathname.replace(/^\/+/, '') // Strip any preceding /'s
      if(!key){
        return new Response('Missing path in URL', {
          status: 400
        })
      }


        // Add handler for translation path (with early return)
        if(key === 'hello-world'){
          // Retrieve the language header from the request and the translations from Workers KV
          const languageHeader = request.headers.get('Accept-Language') || 'en' // Default to English
          const translations : {
            "language_code": string,
            "message": string
          }[] = await env.assets.get('hello-world.json', 'json') || [];


          // Extract the requested language
          const supportedLanguageCodes = translations.map(item => item.language_code)
          const languageCode = parser.pick(supportedLanguageCodes, languageHeader, {
            loose: true
          })


          // Get the message for the selected language
          let selectedTranslation = translations.find(item => item.language_code === languageCode)
          if(!selectedTranslation) selectedTranslation = translations.find(item => item.language_code === "en")
          const helloWorldTranslated = selectedTranslation!['message'];


          // Generate and return the translated html
          const html = `<!DOCTYPE html>
          <html>
            <head>
              <title>Hello World translation</title>
            </head>
            <body>
              <h1>${helloWorldTranslated}</h1>
            </body>
          </html>
          `
          return new Response(html, {
            status: 200,
            headers: {
              'Content-Type': 'text/html; charset=utf-8'
            }
          })
        }


      // Get the mimetype from the key path
      const extension = key.split('.').pop();
      let mimeType = mime.getType(extension) || "text/plain";
      if (mimeType.startsWith("text") || mimeType === "application/javascript") {
        mimeType += "; charset=utf-8";
      }


      // Get the value from the Workers KV store and return it if found
      const value = await env.assets.get(key, 'arrayBuffer')
      if(!value){
        return new Response("Not found", {
          status: 404
        })
      }


      // Return the response from the Workers application with the value from the KV store
      return new Response(value, {
        status: 200,
        headers: new Headers({
          "Content-Type": mimeType
        })
      });


  },
  } satisfies ExportedHandler<Env>;
  ```

* wrangler.jsonc

  ```json
  {
    "$schema": "node_modules/wrangler/config-schema.json",
    "name": "<ENTER_WORKER_NAME>",
    "main": "src/index.ts",
    "compatibility_date": "2025-03-03",
    "observability": {
      "enabled": true
    },
    "kv_namespaces": [
      {
        "binding": "assets",
        "id": "<YOUR_BINDING_ID>"
      }
    ]
  }
  ```

This new code provides a specific endpoint, `/hello-world`, which will provide translated responses. When this URL is accessed, our Worker code will first retrieve the language that is requested by the client in the `Accept-Language` request header and the translations from our KV store for the `hello-world.json` key. It then gets the translated message and returns the generated HTML.

When accessing the Worker application at `https://<YOUR-WORKER-HOSTNAME>/hello-world`, we can notice that our application is now returning the properly translated "Hello World" message.

From your browser's developer console, change the locale language (on Chromium browsers, Run `Show Sensors` to get a dropdown selection for locales). You will see that the Worker is now returning the translated message based on the locale language.

## Related resources

* [Rust support in Workers](https://developers.cloudflare.com/workers/languages/rust/).
* [Using KV in Workers](https://developers.cloudflare.com/kv/get-started/).

</page>

<page>
---
title: Metrics and analytics · Cloudflare Workers KV docs
description: KV exposes analytics that allow you to inspect requests and storage
  across all namespaces in your account.
lastUpdated: 2025-09-03T16:40:54.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/kv/observability/metrics-analytics/
  md: https://developers.cloudflare.com/kv/observability/metrics-analytics/index.md
---

KV exposes analytics that allow you to inspect requests and storage across all namespaces in your account.

The metrics displayed in the [Cloudflare dashboard](https://dash.cloudflare.com/) charts are queried from Cloudflare’s [GraphQL Analytics API](https://developers.cloudflare.com/analytics/graphql-api/). You can access the metrics [programmatically](#query-via-the-graphql-api) via GraphQL or HTTP client.

## Metrics

KV currently exposes the below metrics:

| Dataset | GraphQL Dataset Name | Description |
| - | - | - |
| Operations | `kvOperationsAdaptiveGroups` | This dataset consists of the operations made to your KV namespaces. |
| Storage | `kvStorageAdaptiveGroups` | This dataset consists of the storage details of your KV namespaces. |

Metrics can be queried (and are retained) for the past 31 days.

## View metrics in the dashboard

Per-namespace analytics for KV are available in the Cloudflare dashboard. To view current and historical metrics for a database:

1. In the Cloudflare dashboard, go to the **Workers KV** page.

   [Go to **Workers KV**](https://dash.cloudflare.com/?to=/:account/workers/kv/namespaces)

2. Select an existing namespace.

3. Select the **Metrics** tab.

You can optionally select a time window to query. This defaults to the last 24 hours.

## Query via the GraphQL API

You can programmatically query analytics for your KV namespaces via the [GraphQL Analytics API](https://developers.cloudflare.com/analytics/graphql-api/). This API queries the same datasets as the Cloudflare dashboard, and supports GraphQL [introspection](https://developers.cloudflare.com/analytics/graphql-api/features/discovery/introspection/).

To get started using the [GraphQL Analytics API](https://developers.cloudflare.com/analytics/graphql-api/), follow the documentation to setup [Authentication for the GraphQL Analytics API](https://developers.cloudflare.com/analytics/graphql-api/getting-started/authentication/).

To use the GraphQL API to retrieve KV's datasets, you must provide the `accountTag` filter with your Cloudflare Account ID. The GraphQL datasets for KV include:

* `kvOperationsAdaptiveGroups`
* `kvStorageAdaptiveGroups`

### Examples

The following are common GraphQL queries that you can use to retrieve information about KV analytics. These queries make use of variables `$accountTag`, `$date_geq`, `$date_leq`, and `$namespaceId`, which should be set as GraphQL variables or replaced in line. These variables should look similar to these:

```json
{
  "accountTag": "<YOUR_ACCOUNT_ID>",
  "namespaceId": "<YOUR_KV_NAMESPACE_ID>",
  "date_geq": "2024-07-15",
  "date_leq": "2024-07-30"
}
```

#### Operations

To query the sum of read, write, delete, and list operations for a given `namespaceId` and for a given date range (`start` and `end`), grouped by `date` and `actionType`:

```graphql
query KvOperationsSample(
  $accountTag: string!
  $namespaceId: string
  $start: Date
  $end: Date
) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      kvOperationsAdaptiveGroups(
        filter: { namespaceId: $namespaceId, date_geq: $start, date_leq: $end }
        limit: 10000
        orderBy: [date_DESC]
      ) {
        sum {
          requests
        }
        dimensions {
          date
          actionType
        }
      }
    }
  }
}
```

[Run in GraphQL API Explorer](https://graphql.cloudflare.com/explorer?query=I4VwpgTgngBA0gNwPIAdIEMAuBLA9gOwGcBldAWxQBswAKAKBhgBJ0BjV3EfTAFXQHMAXDEKYI2fPwCEDZvnJhCKNmACSAE2Gjxk2U1HoImYQBEsYPWHyaYZzBYCUMAN6yE2MAHdIL2YzYcXJiENABm2JT2EMLOMAGc3HxCzPFBSTAAvk6ujLkwANbIaBBYeEQAguroKDgIYADiEJwoIX55MOGRkDEw8mSKyqxqNkx9AyoaADQwVfYA+vxgwML6mIaY07Ngc9TLzFbqmW15lNhk2MYwAIwADHc3x7m4EOqQAEJQwgDaW3MmAKLEADCAF1HtlHoxCCAyL52u0IEtwKJCJCjvDGOozlZCGVCHCMZjzGj-KwcAQeFA0GiMo9aXl6UcMkA\&variables=N4IghgxhD2CuB2AXAKmA5iAXCAggYTwHkBVAOWQH0BJAERABoR4wBbAUwGcAHSNqgEywgASgFEACgBl8oigHUqyABLU6jDojAAnREIBMABj0A2ALRHzATgYg28QdkMnze0wEYDIAL5A)

To query the distribution of the latency for read operations for a given `namespaceId` within a given date range (`start`, `end`):

```graphql
query KvOperationsSample2(
  $accountTag: string!
  $namespaceId: string
  $start: Date
  $end: Date
) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      kvOperationsAdaptiveGroups(
        filter: {
          namespaceId: $namespaceId
          date_geq: $start
          date_leq: $end
          actionType: "read"
        }
        limit: 10000
      ) {
        sum {
          requests
        }
        dimensions {
          actionType
        }
        quantiles {
          latencyMsP25
          latencyMsP50
          latencyMsP75
          latencyMsP90
          latencyMsP99
          latencyMsP999
        }
      }
    }
  }
}
```

[Run in GraphQL API Explorer](https://graphql.cloudflare.com/explorer?query=I4VwpgTgngBA0gNwPIAdIEMAuBLA9gOwGcBldAWxQBswAmACgCgYYASdAY3dxH0wBV0AcwBcMQpgjZ8ggIRNW+cmEIoOYAJIATUeMnT5LcegiZRAESxgDYfNpgXMVgJQwA3vITYwAd0hv5zBxcPJiEdABm2JSOEKKuMEHcvAIirIkhKTAAvi7uzPkwANbIaBBYeEQAgproKDgIYADiENwoYQEFMJHRkHEdnTCKZMqq7Bp2LEMjalr9nTWOAPqCYMCihpjGmHMFC2CL1GusNpo7+Rw4BHxQaKIARBBg6Jp3Z1lnlNhk2KYwAIwABiBALmuTOhBAZH8AwKj1AylCbzOmi+NkIFUI0JhgXYl3w1zQSOxoHQvCiyix2Molnw7CgAFlCAAFGgAVjOzGpjlpDOZrJB2M5NLpjKZAHZ2YKYFybCLmQBOAWCmU80Xy+Uc6XC3lM9Ua7HvAaG-LG95ZIA\&variables=N4IghgxhD2CuB2AXAKmA5iAXCAggYTwHkBVAOWQH0BJAERABoR4wBbAUwGcAHSNqgEywgASgFEACgBl8oigHUqyABLU6jDojAAnREIBMABj0A2ALRHzATgYg28QdkMnze0wEYDIAL5A)

To query your account-wide read, write, delete, and list operations across all KV namespaces:

```graphql
query KvOperationsAllSample($accountTag: string!, $start: Date, $end: Date) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      kvOperationsAdaptiveGroups(
        filter: { date_geq: $start, date_leq: $end }
        limit: 10000
      ) {
        sum {
          requests
        }
        dimensions {
          actionType
        }
      }
    }
  }
}
```

[Run in GraphQL API Explorer](https://graphql.cloudflare.com/explorer?query=I4VwpgTgngBA0gNwPIAdIEMAuBLA9gOwGcBBAG1IGV0BbFUsACgBJ0BjV3EfTAFXQHMAXDEKYI2fPwCEAGhhNR6CJmEARLGDlMw+ACZqNAShgBvAFAwYCbGADukUxcsw2HLpkIMAZtlKZIwiYu7JzcfELyrqG8AjAAvsbmzs4A1shoEFh4RMS66Cg4CGAA4hCcKJ5OyZY+fgGmMHn+APr8YMDCCphKmHJNYM30HfI6uvFV1aTY1NgqMACMAAzLixOWiWvOhCDUjtXVEO3gooSblnFnjdM6hNmEe-vObDgEPFBolxf7X84-F3FAA\&variables=N4IghgxhD2CuB2AXAKmA5iAXCAggYTwHkBVAOWQH0BJAERABoQBnRMAJ0SxACYAGbgGwBafiICcDEAFN4AEy59BI7kICMvEAF8gA)

#### Storage

To query the storage details (`keyCount` and `byteCount`) of a KV namespace for every day of a given date range:

```graphql
query Viewer(
  $accountTag: string!
  $namespaceId: string
  $start: Date
  $end: Date
) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      kvStorageAdaptiveGroups(
        filter: { date_geq: $start, date_leq: $end, namespaceId: $namespaceId }
        limit: 10000
        orderBy: [date_DESC]
      ) {
        max {
          keyCount
          byteCount
        }
        dimensions {
          date
        }
      }
    }
  }
}
```

[Run in GraphQL API Explorer](https://graphql.cloudflare.com/explorer?query=I4VwpgTgngBAagSzAd0gCgFAxgEgIYDGBA9iAHYAuAKngOYBcMAzhRAmbQIRa5l4C2YJgAdCYAJIATRizYceOFnggVGAETwUwCsGWkwNWjAEoYAbx4A3JKgjme2QiXIUmaAGYIANloiMzME6klDQMuEEuoTAAvqYW2AkwANaWAMoUxBB0YACCknjCFAiWYADiEKTCbg6JMJ4+kP4w+VoA+rRgwIyKFMoUADTNmmCtXp3dupKDfIIiYlLdM0KiBBKSMTWJXgj8CKowAIwADCdHmwmZkpAAQlCMANotI2oAoqkAwgC653Hn2Px4AAe9lqtSSYCg72CFD+CQARlAtFCXLDorDJDtdEwEMQyEwQaCEk9Uec0YkyRtokA\&variables=N4IghgxhD2CuB2AXAKmA5iAXCAggYTwHkBVAOWQH0BJAERABoR4wBbAUwGcAHSNqgEywgASgFEACgBl8oigHUqyABLU6jDojAAnREIBMABj0A2ALRHzATgYg28QdkMnze0wEYDIAL5A)

</page>

<page>
---
title: Event subscriptions · Cloudflare Workers KV docs
description: Event subscriptions allow you to receive messages when events occur
  across your Cloudflare account. Cloudflare products (e.g., KV, Workers AI,
  Workers) can publish structured events to a queue, which you can then consume
  with Workers or HTTP pull consumers to build custom workflows, integrations,
  or logic.
lastUpdated: 2025-11-06T01:33:23.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/kv/platform/event-subscriptions/
  md: https://developers.cloudflare.com/kv/platform/event-subscriptions/index.md
---

[Event subscriptions](https://developers.cloudflare.com/queues/event-subscriptions/) allow you to receive messages when events occur across your Cloudflare account. Cloudflare products (e.g., [KV](https://developers.cloudflare.com/kv/), [Workers AI](https://developers.cloudflare.com/workers-ai/), [Workers](https://developers.cloudflare.com/workers/)) can publish structured events to a [queue](https://developers.cloudflare.com/queues/), which you can then consume with Workers or [HTTP pull consumers](https://developers.cloudflare.com/queues/configuration/pull-consumers/) to build custom workflows, integrations, or logic.

For more information on [Event Subscriptions](https://developers.cloudflare.com/queues/event-subscriptions/), refer to the [management guide](https://developers.cloudflare.com/queues/event-subscriptions/manage-event-subscriptions/).

## Available KV events

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

</page>

<page>
---
title: Limits · Cloudflare Workers KV docs
lastUpdated: 2026-02-08T13:47:49.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/kv/platform/limits/
  md: https://developers.cloudflare.com/kv/platform/limits/index.md
---

| Feature | Free | Paid |
| - | - | - |
| Reads | 100,000 reads per day | Unlimited |
| Writes to different keys | 1,000 writes per day | Unlimited |
| Writes to same key | 1 per second | 1 per second |
| Operations/Worker invocation [1](#user-content-fn-1) | 1000 | 1000 |
| Namespaces per account | 1,000 | 1,000 |
| Storage/account | 1 GB | Unlimited |
| Storage/namespace | 1 GB | Unlimited |
| Keys/namespace | Unlimited | Unlimited |
| Key size | 512 bytes | 512 bytes |
| Key metadata | 1024 bytes | 1024 bytes |
| Value size | 25 MiB | 25 MiB |
| Minimum [`cacheTtl`](https://developers.cloudflare.com/kv/api/read-key-value-pairs/#cachettl-parameter) [2](#user-content-fn-2) | 30 seconds | 30 seconds |

Need a higher limit?

To request an adjustment to a limit, complete the [Limit Increase Request Form](https://forms.gle/ukpeZVLWLnKeixDu7). If the limit can be increased, Cloudflare will contact you with next steps.

Free versus Paid plan pricing

Refer to [KV pricing](https://developers.cloudflare.com/kv/platform/pricing/) to review the specific KV operations you are allowed under each plan with their pricing.

Workers KV REST API limits

Using the REST API to access Cloudflare Workers KV is subject to the [rate limits that apply to all operations of the Cloudflare REST API](https://developers.cloudflare.com/fundamentals/api/reference/limits).

## Footnotes

1. Within a single invocation, a Worker can make up to 1,000 operations to external services (for example, 500 Workers KV reads and 500 R2 reads). A bulk request to Workers KV counts for 1 request to an external service. [↩](#user-content-fnref-1)

2. The maximum value is [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER). [↩](#user-content-fnref-2)

</page>

<page>
---
title: Pricing · Cloudflare Workers KV docs
description: Workers KV is included in both the Free and Paid Workers plans.
lastUpdated: 2026-02-06T12:01:41.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/kv/platform/pricing/
  md: https://developers.cloudflare.com/kv/platform/pricing/index.md
---

Workers KV is included in both the Free and Paid [Workers plans](https://developers.cloudflare.com/workers/platform/pricing/).

| | Free plan1 | Paid plan |
| - | - | - |
| Keys read | 100,000 / day | 10 million/month, + $0.50/million |
| Keys written | 1,000 / day | 1 million/month, + $5.00/million |
| Keys deleted | 1,000 / day | 1 million/month, + $5.00/million |
| List requests | 1,000 / day | 1 million/month, + $5.00/million |
| Stored data | 1 GB | 1 GB, + $0.50/ GB-month |

1 The Workers Free plan includes limited Workers KV usage. All limits reset daily at 00:00 UTC. If you exceed any one of these limits, further operations of that type will fail with an error.

Note

Workers KV pricing for read, write and delete operations is on a per-key basis. Bulk read operations are billed by the amount of keys read in a bulk read operation.

## Pricing FAQ

#### When writing via KV's [REST API](https://developers.cloudflare.com/api/resources/kv/subresources/namespaces/subresources/keys/methods/bulk_update/), how are writes charged?

Each key-value pair in the `PUT` request is counted as a single write, identical to how each call to `PUT` in the Workers API counts as a write. Writing 5,000 keys via the REST API incurs the same write costs as making 5,000 `PUT` calls in a Worker.

#### Do queries I issue from the dashboard or wrangler (the CLI) count as billable usage?

Yes, any operations via the Cloudflare dashboard or wrangler, including updating (writing) keys, deleting keys, and listing the keys in a namespace count as billable KV usage.

#### Does Workers KV charge for data transfer / egress?

No.

#### What operations incur operations charges?

All operations incur charges, including fetches for non-existent keys that return a `null` (Workers API) or `HTTP 404` (REST API). These operations still traverse KV's infrastructure.

</page>

<page>
---
title: Release notes · Cloudflare Workers KV docs
description: Subscribe to RSS
lastUpdated: 2025-03-11T16:39:16.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/kv/platform/release-notes/
  md: https://developers.cloudflare.com/kv/platform/release-notes/index.md
---

[Subscribe to RSS](https://developers.cloudflare.com/kv/platform/release-notes/index.xml)

## 2024-11-14

**Workers KV REST API bulk operations provide granular errors**

The REST API endpoints for bulk operations ([write](https://developers.cloudflare.com/api/resources/kv/subresources/namespaces/subresources/keys/methods/bulk_update/), [delete](https://developers.cloudflare.com/api/resources/kv/subresources/namespaces/subresources/keys/methods/bulk_delete/)) now return the keys of operations that failed during the bulk operation. The updated response bodies are documented in the [REST API documentation](https://developers.cloudflare.com/api/resources/kv/subresources/namespaces/methods/list/) and contain the following information in the `result` field:

```
{
  "successful_key_count": number,
  "unsuccessful_keys": string[]
}
```

The unsuccessful keys are an array of keys that were not written successfully to all storage backends and therefore should be retried.

## 2024-08-08

**New KV Analytics API**

Workers KV now has a new [metrics dashboard](https://developers.cloudflare.com/kv/observability/metrics-analytics/#view-metrics-in-the-dashboard) and [analytics API](https://developers.cloudflare.com/kv/observability/metrics-analytics/#query-via-the-graphql-api) that leverages the [GraphQL Analytics API](https://developers.cloudflare.com/analytics/graphql-api/) used by many other Cloudflare products. The new analytics API provides per-account and per-namespace metrics for both operations and storage, including latency metrics for read and write operations to Workers KV.

The legacy Workers KV analytics REST API will be turned off as of January 31st, 2025. Developers using this API will receive a series of email notifications prior to the shutdown of the legacy API.

</page>

<page>
---
title: Choose a data or storage product · Cloudflare Workers KV docs
lastUpdated: 2024-08-13T19:56:56.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/kv/platform/storage-options/
  md: https://developers.cloudflare.com/kv/platform/storage-options/index.md
---


</page>

<page>
---
title: Data security · Cloudflare Workers KV docs
description: "This page details the data security properties of KV, including:"
lastUpdated: 2024-08-13T19:56:56.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/kv/reference/data-security/
  md: https://developers.cloudflare.com/kv/reference/data-security/index.md
---

This page details the data security properties of KV, including:

* Encryption-at-rest (EAR).
* Encryption-in-transit (EIT).
* Cloudflare's compliance certifications.

## Encryption at Rest

All values stored in KV are encrypted at rest. Encryption and decryption are automatic, do not require user configuration to enable, and do not impact the effective performance of KV.

Values are only decrypted by the process executing your Worker code or responding to your API requests.

Encryption keys are managed by Cloudflare and securely stored in the same key management systems we use for managing encrypted data across Cloudflare internally.

Objects are encrypted using [AES-256](https://www.cloudflare.com/learning/ssl/what-is-encryption/), a widely tested, highly performant and industry-standard encryption algorithm. KV uses GCM (Galois/Counter Mode) as its preferred mode.

## Encryption in Transit

Data transfer between a Cloudflare Worker, and/or between nodes within the Cloudflare network and KV is secured using the same [Transport Layer Security](https://www.cloudflare.com/learning/ssl/transport-layer-security-tls/) (TLS/SSL).

API access via the HTTP API or using the [wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) command-line interface is also over TLS/SSL (HTTPS).

## Compliance

To learn more about Cloudflare's adherence to industry-standard security compliance certifications, refer to Cloudflare's [Trust Hub](https://www.cloudflare.com/trust-hub/compliance-resources/).

</page>

<page>
---
title: Environments · Cloudflare Workers KV docs
description: KV namespaces can be used with environments. This is useful when
  you have code in your Worker that refers to a KV binding like MY_KV, and you
  want to have these bindings point to different KV namespaces (for example, one
  for staging and one for production).
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/kv/reference/environments/
  md: https://developers.cloudflare.com/kv/reference/environments/index.md
---

KV namespaces can be used with [environments](https://developers.cloudflare.com/workers/wrangler/environments/). This is useful when you have code in your Worker that refers to a KV binding like `MY_KV`, and you want to have these bindings point to different KV namespaces (for example, one for staging and one for production).

The following code in the Wrangler file shows you how to have two environments that have two different KV namespaces but the same binding name:

* wrangler.jsonc

  ```jsonc
  {
    "env": {
      "staging": {
        "kv_namespaces": [
          {
            "binding": "MY_KV",
            "id": "e29b263ab50e42ce9b637fa8370175e8"
          }
        ]
      },
      "production": {
        "kv_namespaces": [
          {
            "binding": "MY_KV",
            "id": "a825455ce00f4f7282403da85269f8ea"
          }
        ]
      }
    }
  }
  ```

* wrangler.toml

  ```toml
  [[env.staging.kv_namespaces]]
  binding = "MY_KV"
  id = "e29b263ab50e42ce9b637fa8370175e8"


  [[env.production.kv_namespaces]]
  binding = "MY_KV"
  id = "a825455ce00f4f7282403da85269f8ea"
  ```

Using the same binding name for two different KV namespaces keeps your Worker code more readable.

In the `staging` environment, `MY_KV.get("KEY")` will read from the namespace ID `e29b263ab50e42ce9b637fa8370175e8`. In the `production` environment, `MY_KV.get("KEY")` will read from the namespace ID `a825455ce00f4f7282403da85269f8ea`.

To insert a value into a `staging` KV namespace, run:

```sh
wrangler kv key put --env=staging --binding=<YOUR_BINDING> "<KEY>" "<VALUE>"
```

Since `--namespace-id` is always unique (unlike binding names), you do not need to specify an `--env` argument:

```sh
wrangler kv key put --namespace-id=<YOUR_ID> "<KEY>" "<VALUE>"
```

Warning

Since version 3.60.0, Wrangler KV commands support the `kv ...` syntax. If you are using versions of Wrangler below 3.60.0, the command follows the `kv:...` syntax. Learn more about the deprecation of the `kv:...` syntax in the [Wrangler commands](https://developers.cloudflare.com/kv/reference/kv-commands/) for KV page.

Most `kv` subcommands also allow you to specify an environment with the optional `--env` flag.

Specifying an environment with the optional `--env` flag allows you to publish Workers running the same code but with different KV namespaces.

For example, you could use separate staging and production KV namespaces for KV data in your Wrangler file:

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "type": "webpack",
    "name": "my-worker",
    "account_id": "<account id here>",
    "route": "staging.example.com/*",
    "workers_dev": false,
    "kv_namespaces": [
      {
        "binding": "MY_KV",
        "id": "06779da6940b431db6e566b4846d64db"
      }
    ],
    "env": {
      "production": {
        "route": "example.com/*",
        "kv_namespaces": [
          {
            "binding": "MY_KV",
            "id": "07bc1f3d1f2a4fd8a45a7e026e2681c6"
          }
        ]
      }
    }
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  type = "webpack"
  name = "my-worker"
  account_id = "<account id here>"
  route = "staging.example.com/*"
  workers_dev = false


  [[kv_namespaces]]
  binding = "MY_KV"
  id = "06779da6940b431db6e566b4846d64db"


  [env.production]
  route = "example.com/*"


    [[env.production.kv_namespaces]]
    binding = "MY_KV"
    id = "07bc1f3d1f2a4fd8a45a7e026e2681c6"
  ```

With the Wrangler file above, you can specify `--env production` when you want to perform a KV action on the KV namespace `MY_KV` under `env.production`.

For example, with the Wrangler file above, you can get a value out of a production KV instance with:

```sh
wrangler kv key get --binding "MY_KV" --env=production "<KEY>"
```

</page>

<page>
---
title: FAQ · Cloudflare Workers KV docs
description: Frequently asked questions regarding Workers KV.
lastUpdated: 2025-09-30T15:23:44.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/kv/reference/faq/
  md: https://developers.cloudflare.com/kv/reference/faq/index.md
---

Frequently asked questions regarding Workers KV.

## General

### Can I use Workers KV without using Workers?

Yes, you can use Workers KV outside of Workers by using the [REST API](https://developers.cloudflare.com/api/resources/kv/) or the associated Cloudflare SDKs for the REST API. It is important to note the [limits of the REST API](https://developers.cloudflare.com/fundamentals/api/reference/limits/) that apply.

### What are the key considerations when choosing how to access KV?

When choosing how to access Workers KV, consider the following:

* **Performance**: Accessing Workers KV via the [Workers Binding API](https://developers.cloudflare.com/kv/api/write-key-value-pairs/) is generally faster than using the [REST API](https://developers.cloudflare.com/api/resources/kv/), as it avoids the overhead of HTTP requests.
* **Rate Limits**: Be aware of the different rate limits for each access method. [REST API](https://developers.cloudflare.com/api/resources/kv/) has a lower write rate limit compared to Workers Binding API. Refer to [What is the rate limit of Workers KV?](https://developers.cloudflare.com/kv/reference/faq/#what-is-the-rate-limit-of-workers-kv)

### Why can I not immediately see the updated value of a key-value pair?

Workers KV heavily caches data across the Cloudflare network. Therefore, it is possible that you read a cached value for up to the [cache TTL](https://developers.cloudflare.com/kv/api/read-key-value-pairs/#cachettl-parameter) duration.

### Is Workers KV eventually consistent or strongly consistent?

Workers KV is eventually consistent.

Workers KV stores data in central stores and replicates the data to all Cloudflare locations through a hybrid push/pull replication approach. This means that the previous value of the key-value pair may be seen in a location for as long as the [cache TTL](https://developers.cloudflare.com/kv/api/read-key-value-pairs/#cachettl-parameter). This means that Workers KV is eventually consistent.

Refer to [How KV works](https://developers.cloudflare.com/kv/concepts/how-kv-works/).

### If a Worker makes a bulk request to Workers KV, would each individual key get counted against the [Worker subrequest limit (of 1000)](https://developers.cloudflare.com/kv/platform/limits/)?

No. A bulk request to Workers KV, regardless of the amount of keys included in the request, will count as a single operation. For example, you could make 500 bulk KV requests and 500 R2 requests for a total of 1000 operations.

### What is the rate limit of Workers KV?

Workers KV's rate limit differs depending on the way you access it.

Operations to Workers KV via the [REST API](https://developers.cloudflare.com/api/resources/kv/) are bound by the same [limits of the REST API](https://developers.cloudflare.com/fundamentals/api/reference/limits/). This limit is shared across all Cloudflare REST API requests.

When writing to Workers KV via the [Workers Binding API](https://developers.cloudflare.com/kv/api/write-key-value-pairs/), the write rate limit is 1 write per second, per key, unlimited across KV keys.

## Pricing

### When writing via Workers KV's [REST API](https://developers.cloudflare.com/api/resources/kv/subresources/namespaces/subresources/keys/methods/bulk_update/), how are writes charged?

Each key-value pair in the `PUT` request is counted as a single write, identical to how each call to `PUT` in the Workers API counts as a write. Writing 5,000 keys via the REST API incurs the same write costs as making 5,000 `PUT` calls in a Worker.

### Do queries I issue from the dashboard or wrangler (the CLI) count as billable usage?

Yes, any operations via the Cloudflare dashboard or wrangler, including updating (writing) keys, deleting keys, and listing the keys in a namespace count as billable Workers KV usage.

### Does Workers KV charge for data transfer / egress?

No.

### Are key expirations billed as delete operations?

No. Key expirations are not billable operations.

</page>

<page>
---
title: Wrangler KV commands · Cloudflare Workers KV docs
description: Manage Workers KV namespaces.
lastUpdated: 2024-09-05T08:56:02.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/kv/reference/kv-commands/
  md: https://developers.cloudflare.com/kv/reference/kv-commands/index.md
---

## `kv namespace`

Manage Workers KV namespaces.

Note

The `kv ...` commands allow you to manage your Workers KV resources in the Cloudflare network. Learn more about using Workers KV with Wrangler in the [Workers KV guide](https://developers.cloudflare.com/kv/get-started/).

Warning

Since version 3.60.0, Wrangler supports the `kv ...` syntax. If you are using versions below 3.60.0, the command follows the `kv:...` syntax. Learn more about the deprecation of the `kv:...` syntax in the [Wrangler commands](https://developers.cloudflare.com/kv/reference/kv-commands/#deprecations) for KV page.

### `kv namespace create`

Create a new namespace

* npm

  ```sh
  npx wrangler kv namespace create [NAMESPACE]
  ```

* pnpm

  ```sh
  pnpm wrangler kv namespace create [NAMESPACE]
  ```

* yarn

  ```sh
  yarn wrangler kv namespace create [NAMESPACE]
  ```

- `[NAMESPACE]` string required

  The name of the new namespace

- `--preview` boolean

  Interact with a preview namespace

- `--use-remote` boolean

  Use a remote binding when adding the newly created resource to your config

- `--update-config` boolean

  Automatically update your config file with the newly added resource

- `--binding` string

  The binding name of this resource in your Worker

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

### `kv namespace list`

Output a list of all KV namespaces associated with your account id

* npm

  ```sh
  npx wrangler kv namespace list
  ```

* pnpm

  ```sh
  pnpm wrangler kv namespace list
  ```

* yarn

  ```sh
  yarn wrangler kv namespace list
  ```



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

### `kv namespace delete`

Delete a given namespace.

* npm

  ```sh
  npx wrangler kv namespace delete
  ```

* pnpm

  ```sh
  pnpm wrangler kv namespace delete
  ```

* yarn

  ```sh
  yarn wrangler kv namespace delete
  ```

- `--binding` string

  The binding name to the namespace to delete from

- `--namespace-id` string

  The id of the namespace to delete

- `--preview` boolean

  Interact with a preview namespace

- `--skip-confirmation` boolean alias: --y default: false

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

### `kv namespace rename`

Rename a KV namespace

* npm

  ```sh
  npx wrangler kv namespace rename [OLD-NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler kv namespace rename [OLD-NAME]
  ```

* yarn

  ```sh
  yarn wrangler kv namespace rename [OLD-NAME]
  ```

- `[OLD-NAME]` string

  The current name (title) of the namespace to rename

- `--namespace-id` string

  The id of the namespace to rename

- `--new-name` string required

  The new name for the namespace

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

## `kv key`

Manage key-value pairs within a Workers KV namespace.

Note

The `kv ...` commands allow you to manage your Workers KV resources in the Cloudflare network. Learn more about using Workers KV with Wrangler in the [Workers KV guide](https://developers.cloudflare.com/kv/get-started/).

Warning

Since version 3.60.0, Wrangler supports the `kv ...` syntax. If you are using versions below 3.60.0, the command follows the `kv:...` syntax. Learn more about the deprecation of the `kv:...` syntax in the [Wrangler commands](https://developers.cloudflare.com/kv/reference/kv-commands/) for KV page.

### `kv key put`

Write a single key/value pair to the given namespace

* npm

  ```sh
  npx wrangler kv key put [KEY] [VALUE]
  ```

* pnpm

  ```sh
  pnpm wrangler kv key put [KEY] [VALUE]
  ```

* yarn

  ```sh
  yarn wrangler kv key put [KEY] [VALUE]
  ```

- `[KEY]` string required

  The key to write to

- `[VALUE]` string

  The value to write

- `--path` string

  Read value from the file at a given path

- `--binding` string

  The binding name to the namespace to write to

- `--namespace-id` string

  The id of the namespace to write to

- `--preview` boolean

  Interact with a preview namespace

- `--ttl` number

  Time for which the entries should be visible

- `--expiration` number

  Time since the UNIX epoch after which the entry expires

- `--metadata` string

  Arbitrary JSON that is associated with a key

- `--local` boolean

  Interact with local storage

- `--remote` boolean

  Interact with remote storage

- `--persist-to` string

  Directory for local persistence

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

### `kv key list`

Output a list of all keys in a given namespace

* npm

  ```sh
  npx wrangler kv key list
  ```

* pnpm

  ```sh
  pnpm wrangler kv key list
  ```

* yarn

  ```sh
  yarn wrangler kv key list
  ```

- `--binding` string

  The binding name to the namespace to list

- `--namespace-id` string

  The id of the namespace to list

- `--preview` boolean default: false

  Interact with a preview namespace

- `--prefix` string

  A prefix to filter listed keys

- `--local` boolean

  Interact with local storage

- `--remote` boolean

  Interact with remote storage

- `--persist-to` string

  Directory for local persistence

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

### `kv key get`

Read a single value by key from the given namespace

* npm

  ```sh
  npx wrangler kv key get [KEY]
  ```

* pnpm

  ```sh
  pnpm wrangler kv key get [KEY]
  ```

* yarn

  ```sh
  yarn wrangler kv key get [KEY]
  ```

- `[KEY]` string required

  The key value to get.

- `--text` boolean default: false

  Decode the returned value as a utf8 string

- `--binding` string

  The binding name to the namespace to get from

- `--namespace-id` string

  The id of the namespace to get from

- `--preview` boolean default: false

  Interact with a preview namespace

- `--local` boolean

  Interact with local storage

- `--remote` boolean

  Interact with remote storage

- `--persist-to` string

  Directory for local persistence

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

### `kv key delete`

Remove a single key value pair from the given namespace

* npm

  ```sh
  npx wrangler kv key delete [KEY]
  ```

* pnpm

  ```sh
  pnpm wrangler kv key delete [KEY]
  ```

* yarn

  ```sh
  yarn wrangler kv key delete [KEY]
  ```

- `[KEY]` string required

  The key value to delete.

- `--binding` string

  The binding name to the namespace to delete from

- `--namespace-id` string

  The id of the namespace to delete from

- `--preview` boolean

  Interact with a preview namespace

- `--local` boolean

  Interact with local storage

- `--remote` boolean

  Interact with remote storage

- `--persist-to` string

  Directory for local persistence

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

## `kv bulk`

Manage multiple key-value pairs within a Workers KV namespace in batches.

Note

The `kv ...` commands allow you to manage your Workers KV resources in the Cloudflare network. Learn more about using Workers KV with Wrangler in the [Workers KV guide](https://developers.cloudflare.com/kv/get-started/).

Warning

Since version 3.60.0, Wrangler supports the `kv ...` syntax. If you are using versions below 3.60.0, the command follows the `kv:...` syntax. Learn more about the deprecation of the `kv:...` syntax in the [Wrangler commands](https://developers.cloudflare.com/kv/reference/kv-commands/) for KV page.

### `kv bulk get`

Gets multiple key-value pairs from a namespace

* npm

  ```sh
  npx wrangler kv bulk get [FILENAME]
  ```

* pnpm

  ```sh
  pnpm wrangler kv bulk get [FILENAME]
  ```

* yarn

  ```sh
  yarn wrangler kv bulk get [FILENAME]
  ```

- `[FILENAME]` string required

  The file containing the keys to get

- `--binding` string

  The binding name to the namespace to get from

- `--namespace-id` string

  The id of the namespace to get from

- `--preview` boolean default: false

  Interact with a preview namespace

- `--local` boolean

  Interact with local storage

- `--remote` boolean

  Interact with remote storage

- `--persist-to` string

  Directory for local persistence

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

### `kv bulk put`

Upload multiple key-value pairs to a namespace

* npm

  ```sh
  npx wrangler kv bulk put [FILENAME]
  ```

* pnpm

  ```sh
  pnpm wrangler kv bulk put [FILENAME]
  ```

* yarn

  ```sh
  yarn wrangler kv bulk put [FILENAME]
  ```

- `[FILENAME]` string required

  The file containing the key/value pairs to write

- `--binding` string

  The binding name to the namespace to write to

- `--namespace-id` string

  The id of the namespace to write to

- `--preview` boolean

  Interact with a preview namespace

- `--ttl` number

  Time for which the entries should be visible

- `--expiration` number

  Time since the UNIX epoch after which the entry expires

- `--metadata` string

  Arbitrary JSON that is associated with a key

- `--local` boolean

  Interact with local storage

- `--remote` boolean

  Interact with remote storage

- `--persist-to` string

  Directory for local persistence

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

### `kv bulk delete`

Delete multiple key-value pairs from a namespace

* npm

  ```sh
  npx wrangler kv bulk delete [FILENAME]
  ```

* pnpm

  ```sh
  pnpm wrangler kv bulk delete [FILENAME]
  ```

* yarn

  ```sh
  yarn wrangler kv bulk delete [FILENAME]
  ```

- `[FILENAME]` string required

  The file containing the keys to delete

- `--force` boolean alias: --f

  Do not ask for confirmation before deleting

- `--binding` string

  The binding name to the namespace to delete from

- `--namespace-id` string

  The id of the namespace to delete from

- `--preview` boolean

  Interact with a preview namespace

- `--local` boolean

  Interact with local storage

- `--remote` boolean

  Interact with remote storage

- `--persist-to` string

  Directory for local persistence

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

## Deprecations

Below are deprecations to Wrangler commands for Workers KV.

### `kv:...` syntax deprecation

Since version 3.60.0, Wrangler supports the `kv ...` syntax. If you are using versions below 3.60.0, the command follows the `kv:...` syntax.

The `kv:...` syntax is deprecated in versions 3.60.0 and beyond and will be removed in a future major version.

For example, commands using the `kv ...` syntax look as such:

```sh
wrangler kv namespace list
wrangler kv key get <KEY>
wrangler kv bulk put <FILENAME>
```

The same commands using the `kv:...` syntax look as such:

```sh
wrangler kv:namespace list
wrangler kv:key get <KEY>
wrangler kv:bulk put <FILENAME>
```

</page>
