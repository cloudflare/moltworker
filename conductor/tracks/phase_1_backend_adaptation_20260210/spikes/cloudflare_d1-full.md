<page>
---
title: Overview · Cloudflare D1 docs
description: D1 is Cloudflare's managed, serverless database with SQLite's SQL
  semantics, built-in disaster recovery, and Worker and HTTP API access.
lastUpdated: 2025-08-18T14:27:42.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/
  md: https://developers.cloudflare.com/d1/index.md
---

Create new serverless SQL databases to query from your Workers and Pages projects.

Available on Free and Paid plans

D1 is Cloudflare's managed, serverless database with SQLite's SQL semantics, built-in disaster recovery, and Worker and HTTP API access.

D1 is designed for horizontal scale out across multiple, smaller (10 GB) databases, such as per-user, per-tenant or per-entity databases. D1 allows you to build applications with thousands of databases at no extra cost for isolating with multiple databases. D1 pricing is based only on query and storage costs.

Create your first D1 database by [following the Get started guide](https://developers.cloudflare.com/d1/get-started/), learn how to [import data into a database](https://developers.cloudflare.com/d1/best-practices/import-export-data/), and how to [interact with your database](https://developers.cloudflare.com/d1/worker-api/) directly from [Workers](https://developers.cloudflare.com/workers/) or [Pages](https://developers.cloudflare.com/pages/functions/bindings/#d1-databases).

***

## Features

### Create your first D1 database

Create your first D1 database, establish a schema, import data and query D1 directly from an application [built with Workers](https://developers.cloudflare.com/workers/).

[Create your D1 database](https://developers.cloudflare.com/d1/get-started/)

### SQLite

Execute SQL with SQLite's SQL compatibility and D1 Client API.

[Execute SQL queries](https://developers.cloudflare.com/d1/sql-api/sql-statements/)

### Time Travel

Time Travel is D1’s approach to backups and point-in-time-recovery, and allows you to restore a database to any minute within the last 30 days.

[Learn about Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)

***

## Related products

**[Workers](https://developers.cloudflare.com/workers/)**

Build serverless applications and deploy instantly across the globe for exceptional performance, reliability, and scale.

**[Pages](https://developers.cloudflare.com/pages/)**

Deploy dynamic front-end applications in record time.

***

## More resources

[Pricing](https://developers.cloudflare.com/d1/platform/pricing/)

Learn about D1's pricing and how to estimate your usage.

[Limits](https://developers.cloudflare.com/d1/platform/limits/)

Learn about what limits D1 has and how to work within them.

[Community projects](https://developers.cloudflare.com/d1/reference/community-projects/)

Browse what developers are building with D1.

[Storage options](https://developers.cloudflare.com/workers/platform/storage-options/)

Learn more about the storage and database options you can build on with Workers.

[Developer Discord](https://discord.cloudflare.com)

Connect with the Workers community on Discord to ask questions, show what you are building, and discuss the platform with other developers.

[@CloudflareDev](https://x.com/cloudflaredev)

Follow @CloudflareDev on Twitter to learn about product announcements, and what is new in Cloudflare Developer Platform.

</page>

<page>
---
title: 404 - Page Not Found · Cloudflare D1 docs
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/404/
  md: https://developers.cloudflare.com/d1/404/index.md
---

# 404

Check the URL, try using our [search](https://developers.cloudflare.com/search/) or try our LLM-friendly [llms.txt directory](https://developers.cloudflare.com/llms.txt).

</page>

<page>
---
title: Best practices · Cloudflare D1 docs
lastUpdated: 2024-12-11T09:43:45.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/d1/best-practices/
  md: https://developers.cloudflare.com/d1/best-practices/index.md
---

* [Import and export data](https://developers.cloudflare.com/d1/best-practices/import-export-data/)
* [Query a database](https://developers.cloudflare.com/d1/best-practices/query-d1/)
* [Retry queries](https://developers.cloudflare.com/d1/best-practices/retry-queries/)
* [Use indexes](https://developers.cloudflare.com/d1/best-practices/use-indexes/)
* [Local development](https://developers.cloudflare.com/d1/best-practices/local-development/)
* [Remote development](https://developers.cloudflare.com/d1/best-practices/remote-development/)
* [Use D1 from Pages](https://developers.cloudflare.com/pages/functions/bindings/#d1-databases)
* [Global read replication](https://developers.cloudflare.com/d1/best-practices/read-replication/)

</page>

<page>
---
title: Configuration · Cloudflare D1 docs
lastUpdated: 2025-04-09T22:35:27.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/d1/configuration/
  md: https://developers.cloudflare.com/d1/configuration/index.md
---

* [Data location](https://developers.cloudflare.com/d1/configuration/data-location/)
* [Environments](https://developers.cloudflare.com/d1/configuration/environments/)

</page>

<page>
---
title: REST API · Cloudflare D1 docs
lastUpdated: 2025-04-09T22:35:27.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/d1-api/
  md: https://developers.cloudflare.com/d1/d1-api/index.md
---


</page>

<page>
---
title: Demos and architectures · Cloudflare D1 docs
description: Learn how you can use D1 within your existing application and architecture.
lastUpdated: 2025-10-13T13:40:40.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/demos/
  md: https://developers.cloudflare.com/d1/demos/index.md
---

Learn how you can use D1 within your existing application and architecture.

## Featured Demos

* [Starter code for D1 Sessions API](https://github.com/cloudflare/templates/tree/main/d1-starter-sessions-api-template): An introduction to D1 Sessions API. This demo simulates purchase orders administration.

  [![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/d1-starter-sessions-api-template)

Tip: Place your database further away for the read replication demo

To simulate how read replication can improve a worst case latency scenario, select your primary database location to be in a farther away region (one of the deployment steps).

You can find this in the **Database location hint** dropdown.

## Demos

Explore the following demo applications for D1.

* [Starter code for D1 Sessions API:](https://github.com/cloudflare/templates/tree/main/d1-starter-sessions-api-template) An introduction to D1 Sessions API. This demo simulates purchase orders administration.
* [Jobs At Conf:](https://github.com/harshil1712/jobs-at-conf-demo) A job lisiting website to add jobs you find at in-person conferences. Built with Cloudflare Pages, R2, D1, Queues, and Workers AI.
* [Remix Authentication Starter:](https://github.com/harshil1712/remix-d1-auth-template) Implement authenticating to a Remix app and store user data in Cloudflare D1.
* [JavaScript-native RPC on Cloudflare Workers <> Named Entrypoints:](https://github.com/cloudflare/js-rpc-and-entrypoints-demo) This is a collection of examples of communicating between multiple Cloudflare Workers using the remote-procedure call (RPC) system that is built into the Workers runtime.
* [Workers for Platforms Example Project:](https://github.com/cloudflare/workers-for-platforms-example) Explore how you could manage thousands of Workers with a single Cloudflare Workers account.
* [Staff Directory demo:](https://github.com/lauragift21/staff-directory) Built using the powerful combination of HonoX for backend logic, Cloudflare Pages for fast and secure hosting, and Cloudflare D1 for seamless database management.
* [Wildebeest:](https://github.com/cloudflare/wildebeest) Wildebeest is an ActivityPub and Mastodon-compatible server whose goal is to allow anyone to operate their Fediverse server and identity on their domain without needing to keep infrastructure, with minimal setup and maintenance, and running in minutes.
* [D1 Northwind Demo:](https://github.com/cloudflare/d1-northwind) This is a demo of the Northwind dataset, running on Cloudflare Workers, and D1 - Cloudflare's SQL database, running on SQLite.

## Reference architectures

Explore the following reference architectures that use D1:

[Fullstack applications](https://developers.cloudflare.com/reference-architecture/diagrams/serverless/fullstack-application/)

[A practical example of how these services come together in a real fullstack application architecture.](https://developers.cloudflare.com/reference-architecture/diagrams/serverless/fullstack-application/)

[Ingesting BigQuery Data into Workers AI](https://developers.cloudflare.com/reference-architecture/diagrams/ai/bigquery-workers-ai/)

[You can connect a Cloudflare Worker to get data from Google BigQuery and pass it to Workers AI, to run AI Models, powered by serverless GPUs.](https://developers.cloudflare.com/reference-architecture/diagrams/ai/bigquery-workers-ai/)

[Composable AI architecture](https://developers.cloudflare.com/reference-architecture/diagrams/ai/ai-composable/)

[The architecture diagram illustrates how AI applications can be built end-to-end on Cloudflare, or single services can be integrated with external infrastructure and services.](https://developers.cloudflare.com/reference-architecture/diagrams/ai/ai-composable/)

[Serverless global APIs](https://developers.cloudflare.com/reference-architecture/diagrams/serverless/serverless-global-apis/)

[An example architecture of a serverless API on Cloudflare and aims to illustrate how different compute and data products could interact with each other.](https://developers.cloudflare.com/reference-architecture/diagrams/serverless/serverless-global-apis/)

[Retrieval Augmented Generation (RAG)](https://developers.cloudflare.com/reference-architecture/diagrams/ai/ai-rag/)

[RAG combines retrieval with generative models for better text. It uses external knowledge to create factual, relevant responses, improving coherence and accuracy in NLP tasks like chatbots.](https://developers.cloudflare.com/reference-architecture/diagrams/ai/ai-rag/)

</page>

<page>
---
title: Examples · Cloudflare D1 docs
description: Explore the following examples for D1.
lastUpdated: 2025-08-18T14:27:42.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/d1/examples/
  md: https://developers.cloudflare.com/d1/examples/index.md
---

Explore the following examples for D1.

[Query D1 from Python Workers](https://developers.cloudflare.com/d1/examples/query-d1-from-python-workers/)

[Learn how to query D1 from a Python Worker](https://developers.cloudflare.com/d1/examples/query-d1-from-python-workers/)

[Query D1 from Hono](https://developers.cloudflare.com/d1/examples/d1-and-hono/)

[Query D1 from the Hono web framework](https://developers.cloudflare.com/d1/examples/d1-and-hono/)

[Query D1 from Remix](https://developers.cloudflare.com/d1/examples/d1-and-remix/)

[Query your D1 database from a Remix application.](https://developers.cloudflare.com/d1/examples/d1-and-remix/)

[Query D1 from SvelteKit](https://developers.cloudflare.com/d1/examples/d1-and-sveltekit/)

[Query a D1 database from a SvelteKit application.](https://developers.cloudflare.com/d1/examples/d1-and-sveltekit/)

</page>

<page>
---
title: Getting started · Cloudflare D1 docs
description: "This guide instructs you through:"
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/get-started/
  md: https://developers.cloudflare.com/d1/get-started/index.md
---

This guide instructs you through:

* Creating your first database using D1, Cloudflare's native serverless SQL database.
* Creating a schema and querying your database via the command-line.
* Connecting a [Cloudflare Worker](https://developers.cloudflare.com/workers/) to your D1 database using bindings, and querying your D1 database programmatically.

You can perform these tasks through the CLI or through the Cloudflare dashboard.

Note

If you already have an existing Worker and an existing D1 database, follow this tutorial from [3. Bind your Worker to your D1 database](https://developers.cloudflare.com/d1/get-started/#3-bind-your-worker-to-your-d1-database).

## Quick start

If you want to skip the steps and get started quickly, click on the button below.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/docs-examples/tree/d1-get-started/d1/d1-get-started)

This creates a repository in your GitHub account and deploys the application to Cloudflare Workers. Use this option if you are familiar with Cloudflare Workers, and wish to skip the step-by-step guidance.

You may wish to manually follow the steps if you are new to Cloudflare Workers.

## Prerequisites

1. Sign up for a [Cloudflare account](https://dash.cloudflare.com/sign-up/workers-and-pages).
2. Install [`Node.js`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

Node.js version manager

Use a Node version manager like [Volta](https://volta.sh/) or [nvm](https://github.com/nvm-sh/nvm) to avoid permission issues and change Node.js versions. [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/), discussed later in this guide, requires a Node version of `16.17.0` or later.

## 1. Create a Worker

Create a new Worker as the means to query your database.

* CLI

  1. Create a new project named `d1-tutorial` by running:

     * npm

       ```sh
       npm create cloudflare@latest -- d1-tutorial
       ```

     * yarn

       ```sh
       yarn create cloudflare d1-tutorial
       ```

     * pnpm

       ```sh
       pnpm create cloudflare@latest d1-tutorial
       ```

     For setup, select the following options:

     * For *What would you like to start with?*, choose `Hello World example`.
     * For *Which template would you like to use?*, choose `Worker only`.
     * For *Which language do you want to use?*, choose `TypeScript`.
     * For *Do you want to use git for version control?*, choose `Yes`.
     * For *Do you want to deploy your application?*, choose `No` (we will be making some changes before deploying).

     This creates a new `d1-tutorial` directory as illustrated below.

     Your new `d1-tutorial` directory includes:

     * A `"Hello World"` [Worker](https://developers.cloudflare.com/workers/get-started/guide/#3-write-code) in `index.ts`.
     * A [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/). This file is how your `d1-tutorial` Worker accesses your D1 database.

  Note

  If you are familiar with Cloudflare Workers, or initializing projects in a Continuous Integration (CI) environment, initialize a new project non-interactively by setting `CI=true` as an [environmental variable](https://developers.cloudflare.com/workers/configuration/environment-variables/) when running `create cloudflare@latest`.

  For example: `CI=true npm create cloudflare@latest d1-tutorial --type=simple --git --ts --deploy=false` creates a basic "Hello World" project ready to build on.

* Dashboard

  1. In the Cloudflare dashboard, go to the **Workers & Pages** page. [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)
  2. Select **Create application**.
  3. Select **Start with Hello World!** > **Get started**.
  4. Name your Worker. For this tutorial, name your Worker `d1-tutorial`.
  5. Select **Deploy**.

* npm

  ```sh
  npm create cloudflare@latest -- d1-tutorial
  ```

* yarn

  ```sh
  yarn create cloudflare d1-tutorial
  ```

* pnpm

  ```sh
  pnpm create cloudflare@latest d1-tutorial
  ```

## 2. Create a database

A D1 database is conceptually similar to many other SQL databases: a database may contain one or more tables, the ability to query those tables, and optional indexes. D1 uses the familiar [SQL query language](https://www.sqlite.org/lang.html) (as used by SQLite).

To create your first D1 database:

* CLI

  1. Change into the directory you just created for your Workers project:

     ```sh
     cd d1-tutorial
     ```

  2. Run the following `wrangler@latest d1` command and give your database a name. In this tutorial, the database is named `prod-d1-tutorial`:

     Note

     The [Wrangler command-line interface](https://developers.cloudflare.com/workers/wrangler/) is Cloudflare's tool for managing and deploying Workers applications and D1 databases in your terminal. It was installed when you used `npm create cloudflare@latest` to initialize your new project.

     While Wrangler gets installed locally to your project, you can use it outside the project by using the command `npx wrangler`.

     ```sh
     npx wrangler@latest d1 create prod-d1-tutorial
     ```

     ```txt
     ✅ Successfully created DB 'prod-d1-tutorial' in region WEUR
     Created your new D1 database.


     {
       "d1_databases": [
         {
           "binding": "prod_d1_tutorial",
           "database_name": "prod-d1-tutorial",
           "database_id": "<unique-ID-for-your-database>"
         }
       ]
     }
     ```

  3. When prompted: `Would you like Wrangler to add it on your behalf?`, select `Yes`. This will automatically add the binding to your Wrangler configuration file.

  This creates a new D1 database and outputs the [binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/) configuration needed in the next step.

* Dashboard

  1. In the Cloudflare dashboard, go to the **D1 SQL database** page.

     [Go to **D1 SQL database**](https://dash.cloudflare.com/?to=/:account/workers/d1)

  2. Select **Create Database**.

  3. Name your database. For this tutorial, name your D1 database `prod-d1-tutorial`.

  4. (Optional) Provide a location hint. Location hint is an optional parameter you can provide to indicate your desired geographical location for your database. Refer to [Provide a location hint](https://developers.cloudflare.com/d1/configuration/data-location/#provide-a-location-hint) for more information.

  5. Select **Create**.

Note

For reference, a good database name:

* Uses a combination of ASCII characters, shorter than 32 characters, and uses dashes (-) instead of spaces.
* Is descriptive of the use-case and environment. For example, "staging-db-web" or "production-db-backend".
* Only describes the database, and is not directly referenced in code.

## 3. Bind your Worker to your D1 database

You must create a binding for your Worker to connect to your D1 database. [Bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/) allow your Workers to access resources, like D1, on the Cloudflare developer platform.

To bind your D1 database to your Worker:

* CLI

  You can automatically add the binding to your Wrangler configuration file when you run the `wrangler d1 create` command (step 3 of [2. Create a database](https://developers.cloudflare.com/d1/get-started/#2-create-a-database)).

  But if you wish to add the binding manually, follow the steps below:

  1. Copy the lines obtained from step 2 of [2. Create a database](https://developers.cloudflare.com/d1/get-started/#2-create-a-database) from your terminal.

  2. Add them to the end of your Wrangler file.

     * wrangler.jsonc

       ```jsonc
       {
         "d1_databases": [
           {
             "binding": "prod_d1_tutorial", // available in your Worker on env.DB
             "database_name": "prod-d1-tutorial",
             "database_id": "<unique-ID-for-your-database>"
           }
         ]
       }
       ```

     * wrangler.toml

       ```toml
       [[d1_databases]]
       binding = "prod_d1_tutorial"
       database_name = "prod-d1-tutorial"
       database_id = "<unique-ID-for-your-database>"
       ```

     Specifically:

     * The value (string) you set for `binding` is the **binding name**, and is used to reference this database in your Worker. In this tutorial, name your binding `prod_d1_tutorial`.
     * The binding name must be [a valid JavaScript variable name](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#variables). For example, `binding = "MY_DB"` or `binding = "productionDB"` would both be valid names for the binding.
     * Your binding is available in your Worker at `env.<BINDING_NAME>` and the D1 [Workers Binding API](https://developers.cloudflare.com/d1/worker-api/) is exposed on this binding.

  Note

  When you execute the `wrangler d1 create` command, the client API package (which implements the D1 API and database class) is automatically installed. For more information on the D1 Workers Binding API, refer to [Workers Binding API](https://developers.cloudflare.com/d1/worker-api/).

  You can also bind your D1 database to a [Pages Function](https://developers.cloudflare.com/pages/functions/). For more information, refer to [Functions Bindings for D1](https://developers.cloudflare.com/pages/functions/bindings/#d1-databases).

* Dashboard

  You create bindings by adding them to the Worker you have created.

  1. In the Cloudflare dashboard, go to the **Workers & Pages** page. [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)
  2. Select the `d1-tutorial` Worker you created in [step 1](https://developers.cloudflare.com/d1/get-started/#1-create-a-worker).
  3. Go to the **Bindings** tab.
  4. Select **Add binding**.
  5. Select **D1 database** > **Add binding**.
  6. Name your binding in **Variable name**, then select the `prod-d1-tutorial` D1 database you created in [step 2](https://developers.cloudflare.com/d1/get-started/#2-create-a-database) from the dropdown menu. For this tutorial, name your binding `prod_d1_tutorial`.
  7. Select **Add binding**.

* wrangler.jsonc

  ```jsonc
  {
    "d1_databases": [
      {
        "binding": "prod_d1_tutorial", // available in your Worker on env.DB
        "database_name": "prod-d1-tutorial",
        "database_id": "<unique-ID-for-your-database>"
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  [[d1_databases]]
  binding = "prod_d1_tutorial"
  database_name = "prod-d1-tutorial"
  database_id = "<unique-ID-for-your-database>"
  ```

## 4. Run a query against your D1 database

### Populate your D1 database

* CLI

  After correctly preparing your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/), set up your database. Create a `schema.sql` file using the SQL syntax below to initialize your database.

  1. Copy the following code and save it as a `schema.sql` file in the `d1-tutorial` Worker directory you created in step 1:

     ```sql
     DROP TABLE IF EXISTS Customers;
     CREATE TABLE IF NOT EXISTS Customers (CustomerId INTEGER PRIMARY KEY, CompanyName TEXT, ContactName TEXT);
     INSERT INTO Customers (CustomerID, CompanyName, ContactName) VALUES (1, 'Alfreds Futterkiste', 'Maria Anders'), (4, 'Around the Horn', 'Thomas Hardy'), (11, 'Bs Beverages', 'Victoria Ashworth'), (13, 'Bs Beverages', 'Random Name');
     ```

  2. Initialize your database to run and test locally first. Bootstrap your new D1 database by running:

     ```sh
     npx wrangler d1 execute prod-d1-tutorial --local --file=./schema.sql
     ```

     ```txt
     ⛅️ wrangler 4.13.2
     -------------------


     🌀 Executing on local database prod-d1-tutorial (<DATABASE_ID>) from .wrangler/state/v3/d1:
     🌀 To execute on your remote database, add a --remote flag to your wrangler command.
     🚣 3 commands executed successfully.
     ```

     Note

     The command `npx wrangler d1 execute` initializes your database locally, not on the remote database.

  3. Validate that your data is in the database by running:

     ```sh
     npx wrangler d1 execute prod-d1-tutorial --local --command="SELECT * FROM Customers"
     ```

     ```txt
      🌀 Executing on local database jun-d1-db-gs-2025 (cf91ec5c-fa77-4d49-ad8e-e22921b996b2) from .wrangler/state/v3/d1:
      🌀 To execute on your remote database, add a --remote flag to your wrangler command.
      🚣 1 command executed successfully.
      ┌────────────┬─────────────────────┬───────────────────┐
      │ CustomerId │ CompanyName         │ ContactName       │
      ├────────────┼─────────────────────┼───────────────────┤
      │ 1          │ Alfreds Futterkiste │ Maria Anders      │
      ├────────────┼─────────────────────┼───────────────────┤
      │ 4          │ Around the Horn     │ Thomas Hardy      │
      ├────────────┼─────────────────────┼───────────────────┤
      │ 11         │ Bs Beverages        │ Victoria Ashworth │
      ├────────────┼─────────────────────┼───────────────────┤
      │ 13         │ Bs Beverages        │ Random Name       │
      └────────────┴─────────────────────┴───────────────────┘
     ```

* Dashboard

  Use the Dashboard to create a table and populate it with data.

  1. In the Cloudflare dashboard, go to the **D1 SQL database** page.

     [Go to **D1 SQL database**](https://dash.cloudflare.com/?to=/:account/workers/d1)

  2. Select the `prod-d1-tutorial` database you created in [step 2](https://developers.cloudflare.com/d1/get-started/#2-create-a-database).

  3. Select **Console**.

  4. Paste the following SQL snippet.

     ```sql
     DROP TABLE IF EXISTS Customers;
     CREATE TABLE IF NOT EXISTS Customers (CustomerId INTEGER PRIMARY KEY, CompanyName TEXT, ContactName TEXT);
     INSERT INTO Customers (CustomerID, CompanyName, ContactName) VALUES (1, 'Alfreds Futterkiste', 'Maria Anders'), (4, 'Around the Horn', 'Thomas Hardy'), (11, 'Bs Beverages', 'Victoria Ashworth'), (13, 'Bs Beverages', 'Random Name');
     ```

  5. Select **Execute**. This creates a table called `Customers` in your `prod-d1-tutorial` database.

  6. Select **Tables**, then select the `Customers` table to view the contents of the table.

### Write queries within your Worker

After you have set up your database, run an SQL query from within your Worker.

* CLI

  1. Navigate to your `d1-tutorial` Worker and open the `index.ts` file. The `index.ts` file is where you configure your Worker's interactions with D1.

  2. Clear the content of `index.ts`.

  3. Paste the following code snippet into your `index.ts` file:

     * JavaScript

       ```js
       export default {
         async fetch(request, env) {
           const { pathname } = new URL(request.url);


           if (pathname === "/api/beverages") {
             // If you did not use `DB` as your binding name, change it here
             const { results } = await env.prod_d1_tutorial
               .prepare("SELECT * FROM Customers WHERE CompanyName = ?")
               .bind("Bs Beverages")
               .run();
             return Response.json(results);
           }


           return new Response(
             "Call /api/beverages to see everyone who works at Bs Beverages",
           );
         },
       };
       ```

     * TypeScript

       ```ts
       export interface Env {
         // If you set another name in the Wrangler config file for the value for 'binding',
         // replace "DB" with the variable name you defined.
         prod_d1_tutorial: D1Database;
       }


       export default {
         async fetch(request, env): Promise<Response> {
           const { pathname } = new URL(request.url);


           if (pathname === "/api/beverages") {
             // If you did not use `DB` as your binding name, change it here
             const { results } = await env.prod_d1_tutorial.prepare(
               "SELECT * FROM Customers WHERE CompanyName = ?",
             )
               .bind("Bs Beverages")
               .run();
             return Response.json(results);
           }


           return new Response(
             "Call /api/beverages to see everyone who works at Bs Beverages",
           );
         },
       } satisfies ExportedHandler<Env>;
       ```

     * Python

       ```python
       from workers import Response, WorkerEntrypoint
       from urllib.parse import urlparse


       class Default(WorkerEntrypoint):
           async def fetch(self, request):
               pathname = urlparse(request.url).path
               if pathname == "/api/beverages":
                   query = (
                       await self.env.prod_d1_tutorial.prepare(
                           "SELECT * FROM Customers WHERE CompanyName = ?",
                       )
                       .bind("Bs Beverages")
                       .run()
                   )
                   return Response.json(query.results)
               return Response(
                   "Call /api/beverages to see everyone who works at Bs Beverages"
               )
       ```

     In the code above, you:

     1. Define a binding to your D1 database in your code. This binding matches the `binding` value you set in the [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) under `d1_databases`.
     2. Query your database using `env.prod_d1_tutorial.prepare` to issue a [prepared query](https://developers.cloudflare.com/d1/worker-api/d1-database/#prepare) with a placeholder (the `?` in the query).
     3. Call `bind()` to safely and securely bind a value to that placeholder. In a real application, you would allow a user to pass the `CompanyName` they want to list results for. Using `bind()` prevents users from executing arbitrary SQL (known as "SQL injection") against your application and deleting or otherwise modifying your database.
     4. Execute the query by calling [`run()`](https://developers.cloudflare.com/d1/worker-api/prepared-statements/#run) to return all rows (or none, if the query returns none).
     5. Return your query results, if any, in JSON format with `Response.json(results)`.

  After configuring your Worker, you can test your project locally before you deploy globally.

* Dashboard

  You can query your D1 database using your Worker.

  1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

     [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

  2. Select the `d1-tutorial` Worker you created.

  3. Select the **Edit code** icon (**\</>**).

  4. Clear the contents of the `worker.js` file, then paste the following code:

     ```js
     export default {
       async fetch(request, env) {
         const { pathname } = new URL(request.url);


         if (pathname === "/api/beverages") {
           // If you did not use `DB` as your binding name, change it here
           const { results } = await env.prod_d1_tutorial.prepare(
             "SELECT * FROM Customers WHERE CompanyName = ?"
           )
             .bind("Bs Beverages")
             .run();
           return new Response(JSON.stringify(results), {
             headers: { 'Content-Type': 'application/json' }
           });
         }


         return new Response(
           "Call /api/beverages to see everyone who works at Bs Beverages"
         );
       },
     };
     ```

  5. Select **Save**.

* JavaScript

  ```js
  export default {
    async fetch(request, env) {
      const { pathname } = new URL(request.url);


      if (pathname === "/api/beverages") {
        // If you did not use `DB` as your binding name, change it here
        const { results } = await env.prod_d1_tutorial
          .prepare("SELECT * FROM Customers WHERE CompanyName = ?")
          .bind("Bs Beverages")
          .run();
        return Response.json(results);
      }


      return new Response(
        "Call /api/beverages to see everyone who works at Bs Beverages",
      );
    },
  };
  ```

* TypeScript

  ```ts
  export interface Env {
    // If you set another name in the Wrangler config file for the value for 'binding',
    // replace "DB" with the variable name you defined.
    prod_d1_tutorial: D1Database;
  }


  export default {
    async fetch(request, env): Promise<Response> {
      const { pathname } = new URL(request.url);


      if (pathname === "/api/beverages") {
        // If you did not use `DB` as your binding name, change it here
        const { results } = await env.prod_d1_tutorial.prepare(
          "SELECT * FROM Customers WHERE CompanyName = ?",
        )
          .bind("Bs Beverages")
          .run();
        return Response.json(results);
      }


      return new Response(
        "Call /api/beverages to see everyone who works at Bs Beverages",
      );
    },
  } satisfies ExportedHandler<Env>;
  ```

* Python

  ```python
  from workers import Response, WorkerEntrypoint
  from urllib.parse import urlparse


  class Default(WorkerEntrypoint):
      async def fetch(self, request):
          pathname = urlparse(request.url).path
          if pathname == "/api/beverages":
              query = (
                  await self.env.prod_d1_tutorial.prepare(
                      "SELECT * FROM Customers WHERE CompanyName = ?",
                  )
                  .bind("Bs Beverages")
                  .run()
              )
              return Response.json(query.results)
          return Response(
              "Call /api/beverages to see everyone who works at Bs Beverages"
          )
  ```

## 5. Deploy your application

Deploy your application on Cloudflare's global network.

* CLI

  To deploy your Worker to production using Wrangler, you must first repeat the [database configuration](https://developers.cloudflare.com/d1/get-started/#populate-your-d1-database) steps after replacing the `--local` flag with the `--remote` flag to give your Worker data to read. This creates the database tables and imports the data into the production version of your database.

  1. Create tables and add entries to your remote database with the `schema.sql` file you created in step 4. Enter `y` to confirm your decision.

     ```sh
     npx wrangler d1 execute prod-d1-tutorial --remote --file=./schema.sql
     ```

     ```txt
     🌀 Executing on remote database prod-d1-tutorial (<DATABASE_ID>):
     🌀 To execute on your local development database, remove the --remote flag from your wrangler command.
     Note: if the execution fails to complete, your DB will return to its original state and you can safely retry.
     ├ 🌀 Uploading <DATABASE_ID>.a7f10c4651cc3a26.sql
     │ 🌀 Uploading complete.
     │
     🌀 Starting import...
     🌀 Processed 3 queries.
     🚣 Executed 3 queries in 0.00 seconds (5 rows read, 6 rows written)
     Database is currently at bookmark 00000000-0000000a-00004f6d-b85c16a3dbcf077cb8f258b4d4eb965e.
     ┌────────────────────────┬───────────┬──────────────┬────────────────────┐
     │ Total queries executed │ Rows read │ Rows written │ Database size (MB) │
     ├────────────────────────┼───────────┼──────────────┼────────────────────┤
     │ 3                      │ 5         │ 6            │ 0.02               │
     └────────────────────────┴───────────┴──────────────┴────────────────────┘
     ```

  2. Validate the data is in production by running:

     ```sh
     npx wrangler d1 execute prod-d1-tutorial --remote --command="SELECT * FROM Customers"
     ```

     ```txt
     ⛅️ wrangler 4.33.1
     ───────────────────
     🌀 Executing on remote database jun-d1-db-gs-2025 (cf91ec5c-fa77-4d49-ad8e-e22921b996b2):
     🌀 To execute on your local development database, remove the --remote flag from your wrangler command.
     🚣 Executed 1 command in 0.1797ms
     ┌────────────┬─────────────────────┬───────────────────┐
     │ CustomerId │ CompanyName         │ ContactName       │
     ├────────────┼─────────────────────┼───────────────────┤
     │ 1          │ Alfreds Futterkiste │ Maria Anders      │
     ├────────────┼─────────────────────┼───────────────────┤
     │ 4          │ Around the Horn     │ Thomas Hardy      │
     ├────────────┼─────────────────────┼───────────────────┤
     │ 11         │ Bs Beverages        │ Victoria Ashworth │
     ├────────────┼─────────────────────┼───────────────────┤
     │ 13         │ Bs Beverages        │ Random Name       │
     └────────────┴─────────────────────┴───────────────────┘
     ```

  3. Deploy your Worker to make your project accessible on the Internet. Run:

     ```sh
     npx wrangler deploy
     ```

     ```txt
     ⛅️ wrangler 4.33.1
     ────────────────────
     Total Upload: 0.52 KiB / gzip: 0.33 KiB
     Your Worker has access to the following bindings:
     Binding                                        Resource
     env.prod_d1_tutorial (prod-d1-tutorial)        D1 Database


     Uploaded prod-d1-tutorial (4.17 sec)
     Deployed prod-d1-tutorial triggers (3.49 sec)
     https://prod-d1-tutorial.pcx-team.workers.dev
     Current Version ID: 42c82f1c-ff2b-4dce-9ea2-265adcccd0d5
     ```

     You can now visit the URL for your newly created project to query your live database.

     For example, if the URL of your new Worker is `d1-tutorial.<YOUR_SUBDOMAIN>.workers.dev`, accessing `https://d1-tutorial.<YOUR_SUBDOMAIN>.workers.dev/api/beverages` sends a request to your Worker that queries your live database directly.

  4. Test your database is running successfully. Add `/api/beverages` to the provided Wrangler URL. For example, `https://d1-tutorial.<YOUR_SUBDOMAIN>.workers.dev/api/beverages`.

* Dashboard

  1. In the Cloudflare dashboard, go to the **Workers & Pages** page. [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)
  2. Select your `d1-tutorial` Worker.
  3. Select **Deployments**.
  4. From the **Version History** table, select **Deploy version**.
  5. From the **Deploy version** page, select **Deploy**.

  This deploys the latest version of the Worker code to production.

## 6. (Optional) Develop locally with Wrangler

If you are using D1 with Wrangler, you can test your database locally. While in your project directory:

1. Run `wrangler dev`:

   ```sh
   npx wrangler dev
   ```

   When you run `wrangler dev`, Wrangler provides a URL (most likely `localhost:8787`) to review your Worker.

2. Go to the URL.

   The page displays `Call /api/beverages to see everyone who works at Bs Beverages`.

3. Test your database is running successfully. Add `/api/beverages` to the provided Wrangler URL. For example, `localhost:8787/api/beverages`.

If successful, the browser displays your data.

Note

You can only develop locally if you are using Wrangler. You cannot develop locally through the Cloudflare dashboard.

## 7. (Optional) Delete your database

To delete your database:

* CLI

  Run:

  ```sh
  npx wrangler d1 delete prod-d1-tutorial
  ```

* Dashboard

  1. In the Cloudflare dashboard, go to the **D1 SQL database** page.

     [Go to **D1 SQL database**](https://dash.cloudflare.com/?to=/:account/workers/d1)

  2. Select your `prod-d1-tutorial` D1 database.

  3. Select **Settings**.

  4. Select **Delete**.

  5. Type the name of the database (`prod-d1-tutorial`) to confirm the deletion.

Warning

Note that deleting your D1 database will stop your application from functioning as before.

If you want to delete your Worker:

* CLI

  Run:

  ```sh
  npx wrangler delete d1-tutorial
  ```

* Dashboard

  1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

     [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

  2. Select your `d1-tutorial` Worker.

  3. Select **Settings**.

  4. Scroll to the bottom of the page, then select **Delete**.

  5. Type the name of the Worker (`d1-tutorial`) to confirm the deletion.

## Summary

In this tutorial, you have:

* Created a D1 database
* Created a Worker to access that database
* Deployed your project globally

## Next steps

If you have any feature requests or notice any bugs, share your feedback directly with the Cloudflare team by joining the [Cloudflare Developers community on Discord](https://discord.cloudflare.com).

* See supported [Wrangler commands for D1](https://developers.cloudflare.com/workers/wrangler/commands/#d1).
* Learn how to use [D1 Worker Binding APIs](https://developers.cloudflare.com/d1/worker-api/) within your Worker, and test them from the [API playground](https://developers.cloudflare.com/d1/worker-api/#api-playground).
* Explore [community projects built on D1](https://developers.cloudflare.com/d1/reference/community-projects/).

</page>

<page>
---
title: Observability · Cloudflare D1 docs
lastUpdated: 2025-04-09T22:35:27.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/d1/observability/
  md: https://developers.cloudflare.com/d1/observability/index.md
---

* [Audit Logs](https://developers.cloudflare.com/d1/observability/audit-logs/)
* [Debug D1](https://developers.cloudflare.com/d1/observability/debug-d1/)
* [Metrics and analytics](https://developers.cloudflare.com/d1/observability/metrics-analytics/)
* [Billing](https://developers.cloudflare.com/d1/observability/billing/)

</page>

<page>
---
title: Platform · Cloudflare D1 docs
lastUpdated: 2025-04-09T22:35:27.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/d1/platform/
  md: https://developers.cloudflare.com/d1/platform/index.md
---

* [Pricing](https://developers.cloudflare.com/d1/platform/pricing/)
* [Limits](https://developers.cloudflare.com/d1/platform/limits/)
* [Alpha database migration guide](https://developers.cloudflare.com/d1/platform/alpha-migration/)
* [Choose a data or storage product](https://developers.cloudflare.com/workers/platform/storage-options/)
* [Release notes](https://developers.cloudflare.com/d1/platform/release-notes/)

</page>

<page>
---
title: Reference · Cloudflare D1 docs
lastUpdated: 2025-04-09T22:35:27.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/d1/reference/
  md: https://developers.cloudflare.com/d1/reference/index.md
---

* [Migrations](https://developers.cloudflare.com/d1/reference/migrations/)
* [Time Travel and backups](https://developers.cloudflare.com/d1/reference/time-travel/)
* [Community projects](https://developers.cloudflare.com/d1/reference/community-projects/)
* [Generated columns](https://developers.cloudflare.com/d1/reference/generated-columns/)
* [Data security](https://developers.cloudflare.com/d1/reference/data-security/)
* [Backups (Legacy)](https://developers.cloudflare.com/d1/reference/backups/)
* [FAQs](https://developers.cloudflare.com/d1/reference/faq/)
* [Glossary](https://developers.cloudflare.com/d1/reference/glossary/)

</page>

<page>
---
title: SQL API · Cloudflare D1 docs
lastUpdated: 2025-04-09T22:35:27.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/d1/sql-api/
  md: https://developers.cloudflare.com/d1/sql-api/index.md
---

* [SQL statements](https://developers.cloudflare.com/d1/sql-api/sql-statements/)
* [Define foreign keys](https://developers.cloudflare.com/d1/sql-api/foreign-keys/)
* [Query JSON](https://developers.cloudflare.com/d1/sql-api/query-json/)

</page>

<page>
---
title: Tutorials · Cloudflare D1 docs
description: View tutorials to help you get started with D1.
lastUpdated: 2025-08-18T14:27:42.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/tutorials/
  md: https://developers.cloudflare.com/d1/tutorials/index.md
---

View tutorials to help you get started with D1.

## Docs

| Name | Last Updated | Difficulty |
| - | - | - |
| [Deploy an Express.js application on Cloudflare Workers](https://developers.cloudflare.com/workers/tutorials/deploy-an-express-app/) | 4 months ago | Beginner |
| [Query D1 using Prisma ORM](https://developers.cloudflare.com/d1/tutorials/d1-and-prisma-orm/) | 8 months ago | Beginner |
| [Using D1 Read Replication for your e-commerce website](https://developers.cloudflare.com/d1/tutorials/using-read-replication-for-e-com/) | 10 months ago | Beginner |
| [Build a Retrieval Augmented Generation (RAG) AI](https://developers.cloudflare.com/workers-ai/guides/tutorials/build-a-retrieval-augmented-generation-ai/) | about 1 year ago | Beginner |
| [Bulk import to D1 using REST API](https://developers.cloudflare.com/d1/tutorials/import-to-d1-with-rest-api/) | over 1 year ago | Beginner |
| [Build a Comments API](https://developers.cloudflare.com/d1/tutorials/build-a-comments-api/) | over 1 year ago | Intermediate |
| [Build an API to access D1 using a proxy Worker](https://developers.cloudflare.com/d1/tutorials/build-an-api-to-access-d1/) | over 1 year ago | Intermediate |
| [Build a Staff Directory Application](https://developers.cloudflare.com/d1/tutorials/build-a-staff-directory-app/) | almost 2 years ago | Intermediate |

## Videos

Cloudflare Workflows | Introduction (Part 1 of 3)

In this video, we introduce Cloudflare Workflows, the Newest Developer Platform Primitive at Cloudflare.

Cloudflare Workflows | Batching and Monitoring Your Durable Execution (Part 2 of 3)

Workflows exposes metrics such as execution, error rates, steps, and total duration!

Welcome to the Cloudflare Developer Channel

Welcome to the Cloudflare Developers YouTube channel. We've got tutorials and working demos and everything you need to level up your projects. Whether you're working on your next big thing or just dorking around with some side projects, we've got you covered! So why don't you come hang out, subscribe to our developer channel and together we'll build something awesome. You're gonna love it.

Stateful Apps with Cloudflare Workers

Learn how to access external APIs, cache and retrieve data using Workers KV, and create SQL-driven applications with Cloudflare D1.

</page>

<page>
---
title: Workers Binding API · Cloudflare D1 docs
description: "You can execute SQL queries on your D1 database from a Worker
  using the Worker Binding API. To do this, you can perform the following
  steps:"
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/worker-api/
  md: https://developers.cloudflare.com/d1/worker-api/index.md
---

You can execute SQL queries on your D1 database from a Worker using the Worker Binding API. To do this, you can perform the following steps:

1. [Bind the D1 Database](https://developers.cloudflare.com/d1/get-started/#3-bind-your-worker-to-your-d1-database).
2. [Prepare a statement](https://developers.cloudflare.com/d1/worker-api/d1-database/#prepare).
3. [Run the prepared statement](https://developers.cloudflare.com/d1/worker-api/prepared-statements).
4. Analyze the [return object](https://developers.cloudflare.com/d1/worker-api/return-object) (if necessary).

Refer to the relevant sections for the API documentation.

## TypeScript support

D1 Worker Bindings API is fully-typed via the runtime types generated by running [`wrangler types`](https://developers.cloudflare.com/workers/languages/typescript/#typescript) package, and also supports [generic types](https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-types) as part of its TypeScript API. A generic type allows you to provide an optional `type parameter` so that a function understands the type of the data it is handling.

When using the query statement methods [`D1PreparedStatement::run`](https://developers.cloudflare.com/d1/worker-api/prepared-statements/#run), [`D1PreparedStatement::raw`](https://developers.cloudflare.com/d1/worker-api/prepared-statements/#raw) and [`D1PreparedStatement::first`](https://developers.cloudflare.com/d1/worker-api/prepared-statements/#first), you can provide a type representing each database row. D1's API will [return the result object](https://developers.cloudflare.com/d1/worker-api/return-object/#d1result) with the correct type.

For example, providing an `OrderRow` type as a type parameter to [`D1PreparedStatement::run`](https://developers.cloudflare.com/d1/worker-api/prepared-statements/#run) will return a typed `Array<OrderRow>` object instead of the default `Record<string, unknown>` type:

```ts
// Row definition
type OrderRow = {
  Id: string;
  CustomerName: string;
  OrderDate: number;
};


// Elsewhere in your application
// env.MY_DB is the D1 database binding from your Wrangler configuration file
const result = await env.MY_DB.prepare(
  "SELECT Id, CustomerName, OrderDate FROM [Order] ORDER BY ShippedDate DESC LIMIT 100",
).run<OrderRow>();
```

## Type conversion

D1 automatically converts supported JavaScript (including TypeScript) types passed as parameters via the Workers Binding API to their associated D1 types 1. This conversion is permanent and one-way only. This means that when reading the written values back in your code, you will get the converted values rather than the originally inserted values.

Note

We recommend using [STRICT tables](https://www.sqlite.org/stricttables.html) in your SQL schema to avoid issues with mismatched types between values that are actually stored in your database compared to values defined by your schema.

The type conversion during writes is as follows:

| JavaScript (write) | D1 | JavaScript (read) |
| - | - | - |
| null | `NULL` | null |
| Number | `REAL` | Number |
| Number 2 | `INTEGER` | Number |
| String | `TEXT` | String |
| Boolean 3 | `INTEGER` | Number (`0`,`1`) |
| ArrayBuffer | `BLOB` | Array 4 |
| ArrayBuffer View | `BLOB` | Array 4 |
| undefined | Not supported. 5 | - |

1 D1 types correspond to the underlying [SQLite types](https://www.sqlite.org/datatype3.html).

2 D1 supports 64-bit signed `INTEGER` values internally, however [BigInts](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) are not currently supported in the API yet. JavaScript integers are safe up to [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER).

3 Booleans will be cast to an `INTEGER` type where `1` is `TRUE` and `0` is `FALSE`.

4 `ArrayBuffer` and [`ArrayBuffer` views](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/isView) are converted using [`Array.from`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from).

5 Queries with `undefined` values will return a `D1_TYPE_ERROR`.

## API playground

The D1 Worker Binding API playground is an `index.js` file where you can test each of the documented Worker Binding APIs for D1. The file builds from the end-state of the [Get started](https://developers.cloudflare.com/d1/get-started/#write-queries-within-your-worker) code.

You can use this alongside the API documentation to better understand how each API works.

Follow the steps to setup your API playground.

### 1. Complete the Get started tutorial

Complete the [Get started](https://developers.cloudflare.com/d1/get-started/#write-queries-within-your-worker) tutorial. Ensure you use JavaScript instead of TypeScript.

### 2. Modify the content of `index.js`

Replace the contents of your `index.js` file with the code below to view the effect of each API.

index.js

```js
// D1 API Playground - Test each D1 Worker Binding API method
// Change the URL pathname to test different methods (e.g., /RUN, /RAW, /FIRST)
export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);


    // Sample data for testing
    const companyName1 = `Bs Beverages`;
    const companyName2 = `Around the Horn`;


    // Prepare reusable statements
    const stmt = env.DB.prepare(`SELECT * FROM Customers WHERE CompanyName = ?`);
    const stmtMulti = env.DB.prepare(`SELECT * FROM Customers; SELECT * FROM Customers WHERE CompanyName = ?`);
    const session = env.DB.withSession("first-primary")
    const sessionStmt = session.prepare(`SELECT * FROM Customers WHERE CompanyName = ?`);


      // Test D1PreparedStatement::run - returns full D1Result object
      if (pathname === `/RUN`){
      const returnValue = await stmt.bind(companyName1).run();
      return Response.json(returnValue);


      // Test D1PreparedStatement::raw - returns array of arrays
    } else if (pathname === `/RAW`){
      const returnValue = await stmt.bind(companyName1).raw();
      return Response.json(returnValue);


      // Test D1PreparedStatement::first - returns first row only
    } else if (pathname === `/FIRST`){
      const returnValue = await stmt.bind(companyName1).first();
      return Response.json(returnValue);


      // Test D1Database::batch - execute multiple statements
    } else if (pathname === `/BATCH`) {
      const batchResult = await env.DB.batch([
        stmt.bind(companyName1),
        stmt.bind(companyName2)
      ]);
      return Response.json(batchResult);


      // Test D1Database::exec - execute raw SQL without parameters
    } else if (pathname === `/EXEC`){
      const returnValue = await env.DB.exec(`SELECT * FROM Customers WHERE CompanyName = "Bs Beverages"`);
      return Response.json(returnValue);


      // Test D1 Sessions API with read replication
    } else if (pathname === `/WITHSESSION`){
      const returnValue = await sessionStmt.bind(companyName1).run();
      console.log("You're now using D1 Sessions!")
      return Response.json(returnValue);
    }


      // Default response with instructions
      return new Response(
      `Welcome to the D1 API Playground!
      \nChange the URL to test the various methods inside your index.js file.`,
      );
    },


};
```

### 3. Deploy the Worker

1. Navigate to your tutorial directory you created by following step 1.

2. Run `npx wrangler deploy`.

   ```sh
   npx wrangler deploy
   ```

   ```sh
   ⛅️ wrangler 3.112.0
   --------------------


   Total Upload: 1.90 KiB / gzip: 0.59 KiB
   Your worker has access to the following bindings:
   - D1 Databases:
     - DB: DATABASE_NAME (<DATABASE_ID>)
   Uploaded WORKER_NAME (7.01 sec)
   Deployed WORKER_NAME triggers (1.25 sec)
     https://jun-d1-rr.d1-sandbox.workers.dev
   Current Version ID: VERSION_ID
   ```

3. Open a browser at the specified address.

### 4. Test the APIs

Change the URL to test the various D1 Worker Binding APIs.

```plaintext
```

</page>

<page>
---
title: Wrangler commands · Cloudflare D1 docs
description: D1 Wrangler commands use REST APIs to interact with the control
  plane. This page lists the Wrangler commands for D1.
lastUpdated: 2025-12-09T14:15:41.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/wrangler-commands/
  md: https://developers.cloudflare.com/d1/wrangler-commands/index.md
---

D1 Wrangler commands use REST APIs to interact with the control plane. This page lists the Wrangler commands for D1.

## `d1 create`

Creates a new D1 database, and provides the binding and UUID that you will put in your config file

This command acts on remote D1 Databases.

* npm

  ```sh
  npx wrangler d1 create [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler d1 create [NAME]
  ```

* yarn

  ```sh
  yarn wrangler d1 create [NAME]
  ```

- `[NAME]` string required

  The name of the new D1 database

- `--location` string

  A hint for the primary location of the new DB. Options: weur: Western Europe eeur: Eastern Europe apac: Asia Pacific oc: Oceania wnam: Western North America enam: Eastern North America

- `--jurisdiction` string

  The location to restrict the D1 database to run and store data within to comply with local regulations. Note that if jurisdictions are set, the location hint is ignored. Options: eu: The European Union fedramp: FedRAMP-compliant data centers

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

## `d1 info`

Get information about a D1 database, including the current database size and state

This command acts on remote D1 Databases.

* npm

  ```sh
  npx wrangler d1 info [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler d1 info [NAME]
  ```

* yarn

  ```sh
  yarn wrangler d1 info [NAME]
  ```

- `[NAME]` string required

  The name of the DB

- `--json` boolean default: false

  Return output as clean JSON

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

## `d1 list`

List all D1 databases in your account

This command acts on remote D1 Databases.

* npm

  ```sh
  npx wrangler d1 list
  ```

* pnpm

  ```sh
  pnpm wrangler d1 list
  ```

* yarn

  ```sh
  yarn wrangler d1 list
  ```

- `--json` boolean default: false

  Return output as clean JSON

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

## `d1 delete`

Delete a D1 database

This command acts on remote D1 Databases.

* npm

  ```sh
  npx wrangler d1 delete [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler d1 delete [NAME]
  ```

* yarn

  ```sh
  yarn wrangler d1 delete [NAME]
  ```

- `[NAME]` string required

  The name or binding of the DB

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

## `d1 execute`

Execute a command or SQL file

You must provide either --command or --file for this command to run successfully.

* npm

  ```sh
  npx wrangler d1 execute [DATABASE]
  ```

* pnpm

  ```sh
  pnpm wrangler d1 execute [DATABASE]
  ```

* yarn

  ```sh
  yarn wrangler d1 execute [DATABASE]
  ```

- `[DATABASE]` string required

  The name or binding of the DB

- `--command` string

  The SQL query you wish to execute, or multiple queries separated by ';'

- `--file` string

  A .sql file to ingest

- `--yes` boolean alias: --y

  Answer "yes" to any prompts

- `--local` boolean

  Execute commands/files against a local DB for use with wrangler dev

- `--remote` boolean

  Execute commands/files against a remote D1 database for use with remote bindings or your deployed Worker

- `--persist-to` string

  Specify directory to use for local persistence (for use with --local)

- `--json` boolean default: false

  Return output as clean JSON

- `--preview` boolean default: false

  Execute commands/files against a preview D1 database

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

## `d1 export`

Export the contents or schema of your database as a .sql file

* npm

  ```sh
  npx wrangler d1 export [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler d1 export [NAME]
  ```

* yarn

  ```sh
  yarn wrangler d1 export [NAME]
  ```

- `[NAME]` string required

  The name of the D1 database to export

- `--local` boolean

  Export from your local DB you use with wrangler dev

- `--remote` boolean

  Export from a remote D1 database

- `--output` string required

  Path to the SQL file for your export

- `--table` string

  Specify which tables to include in export

- `--no-schema` boolean

  Only output table contents, not the DB schema

- `--no-data` boolean

  Only output table schema, not the contents of the DBs themselves

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

## `d1 time-travel info`

Retrieve information about a database at a specific point-in-time using Time Travel

This command acts on remote D1 Databases.

For more information about Time Travel, see <https://developers.cloudflare.com/d1/reference/time-travel/>

* npm

  ```sh
  npx wrangler d1 time-travel info [DATABASE]
  ```

* pnpm

  ```sh
  pnpm wrangler d1 time-travel info [DATABASE]
  ```

* yarn

  ```sh
  yarn wrangler d1 time-travel info [DATABASE]
  ```

- `[DATABASE]` string required

  The name or binding of the DB

- `--timestamp` string

  Accepts a Unix (seconds from epoch) or RFC3339 timestamp (e.g. 2023-07-13T08:46:42.228Z) to retrieve a bookmark for

- `--json` boolean default: false

  Return output as clean JSON

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

## `d1 time-travel restore`

Restore a database back to a specific point-in-time

This command acts on remote D1 Databases.

For more information about Time Travel, see <https://developers.cloudflare.com/d1/reference/time-travel/>

* npm

  ```sh
  npx wrangler d1 time-travel restore [DATABASE]
  ```

* pnpm

  ```sh
  pnpm wrangler d1 time-travel restore [DATABASE]
  ```

* yarn

  ```sh
  yarn wrangler d1 time-travel restore [DATABASE]
  ```

- `[DATABASE]` string required

  The name or binding of the DB

- `--bookmark` string

  Bookmark to use for time travel

- `--timestamp` string

  Accepts a Unix (seconds from epoch) or RFC3339 timestamp (e.g. 2023-07-13T08:46:42.228Z) to retrieve a bookmark for (within the last 30 days)

- `--json` boolean default: false

  Return output as clean JSON

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

## `d1 migrations create`

Create a new migration

This will generate a new versioned file inside the 'migrations' folder. Name your migration file as a description of your change. This will make it easier for you to find your migration in the 'migrations' folder. An example filename looks like:

```
0000_create_user_table.sql
```

The filename will include a version number and the migration name you specify.

* npm

  ```sh
  npx wrangler d1 migrations create [DATABASE] [MESSAGE]
  ```

* pnpm

  ```sh
  pnpm wrangler d1 migrations create [DATABASE] [MESSAGE]
  ```

* yarn

  ```sh
  yarn wrangler d1 migrations create [DATABASE] [MESSAGE]
  ```

- `[DATABASE]` string required

  The name or binding of the DB

- `[MESSAGE]` string required

  The Migration message

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

## `d1 migrations list`

View a list of unapplied migration files

* npm

  ```sh
  npx wrangler d1 migrations list [DATABASE]
  ```

* pnpm

  ```sh
  pnpm wrangler d1 migrations list [DATABASE]
  ```

* yarn

  ```sh
  yarn wrangler d1 migrations list [DATABASE]
  ```

- `[DATABASE]` string required

  The name or binding of the DB

- `--local` boolean

  Check migrations against a local DB for use with wrangler dev

- `--remote` boolean

  Check migrations against a remote DB for use with wrangler dev --remote

- `--preview` boolean default: false

  Check migrations against a preview D1 DB

- `--persist-to` string

  Specify directory to use for local persistence (you must use --local with this flag)

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

## `d1 migrations apply`

Apply any unapplied D1 migrations

This command will prompt you to confirm the migrations you are about to apply. Confirm that you would like to proceed. After applying, a backup will be captured.

The progress of each migration will be printed in the console.

When running the apply command in a CI/CD environment or another non-interactive command line, the confirmation step will be skipped, but the backup will still be captured.

If applying a migration results in an error, this migration will be rolled back, and the previous successful migration will remain applied.

* npm

  ```sh
  npx wrangler d1 migrations apply [DATABASE]
  ```

* pnpm

  ```sh
  pnpm wrangler d1 migrations apply [DATABASE]
  ```

* yarn

  ```sh
  yarn wrangler d1 migrations apply [DATABASE]
  ```

- `[DATABASE]` string required

  The name or binding of the DB

- `--local` boolean

  Execute commands/files against a local DB for use with wrangler dev

- `--remote` boolean

  Execute commands/files against a remote DB for use with wrangler dev --remote

- `--preview` boolean default: false

  Execute commands/files against a preview D1 DB

- `--persist-to` string

  Specify directory to use for local persistence (you must use --local with this flag)

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

## `d1 insights`

Experimental

Get information about the queries run on a D1 database

This command acts on remote D1 Databases.

* npm

  ```sh
  npx wrangler d1 insights [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler d1 insights [NAME]
  ```

* yarn

  ```sh
  yarn wrangler d1 insights [NAME]
  ```

- `[NAME]` string required

  The name of the DB

- `--timePeriod` string default: 1d

  Fetch data from now to the provided time period

- `--sort-type` string default: sum

  Choose the operation you want to sort insights by

- `--sort-by` string default: time

  Choose the field you want to sort insights by

- `--sort-direction` string default: DESC

  Choose a sort direction

- `--limit` number default: 5

  fetch insights about the first X queries

- `--json` boolean default: false

  return output as clean JSON

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
title: Import and export data · Cloudflare D1 docs
description: D1 allows you to import existing SQLite tables and their data
  directly, enabling you to migrate existing data into D1 quickly and easily.
  This can be useful when migrating applications to use Workers and D1, or when
  you want to prototype a schema locally before importing it to your D1
  database(s).
lastUpdated: 2025-04-16T16:17:28.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/best-practices/import-export-data/
  md: https://developers.cloudflare.com/d1/best-practices/import-export-data/index.md
---

D1 allows you to import existing SQLite tables and their data directly, enabling you to migrate existing data into D1 quickly and easily. This can be useful when migrating applications to use Workers and D1, or when you want to prototype a schema locally before importing it to your D1 database(s).

D1 also allows you to export a database. This can be useful for [local development](https://developers.cloudflare.com/d1/best-practices/local-development/) or testing.

## Import an existing database

To import an existing SQLite database into D1, you must have:

1. The Cloudflare [Wrangler CLI installed](https://developers.cloudflare.com/workers/wrangler/install-and-update/).
2. A database to use as the target.
3. An existing SQLite (version 3.0+) database file to import.

Note

You cannot import a raw SQLite database (`.sqlite3` files) directly. Refer to [how to convert an existing SQLite file](#convert-sqlite-database-files) first.

For example, consider the following `users_export.sql` schema & values, which includes a `CREATE TABLE IF NOT EXISTS` statement:

```sql
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50),
  full_name VARCHAR(50),
  created_on DATE
);
INSERT INTO users (id, full_name, created_on) VALUES ('01GREFXCN9519NRVXWTPG0V0BF', 'Catlaina Harbar', '2022-08-20 05:39:52');
INSERT INTO users (id, full_name, created_on) VALUES ('01GREFXCNBYBGX2GC6ZGY9FMP4', 'Hube Bilverstone', '2022-12-15 21:56:13');
INSERT INTO users (id, full_name, created_on) VALUES ('01GREFXCNCWAJWRQWC2863MYW4', 'Christin Moss', '2022-07-28 04:13:37');
INSERT INTO users (id, full_name, created_on) VALUES ('01GREFXCNDGQNBQAJG1AP0TYXZ', 'Vlad Koche', '2022-11-29 17:40:57');
INSERT INTO users (id, full_name, created_on) VALUES ('01GREFXCNF67KV7FPPSEJVJMEW', 'Riane Zamora', '2022-12-24 06:49:04');
```

With your `users_export.sql` file in the current working directory, you can pass the `--file=users_export.sql` flag to `d1 execute` to execute (import) our table schema and values:

```sh
npx wrangler d1 execute example-db --remote --file=users_export.sql
```

To confirm your table was imported correctly and is queryable, execute a `SELECT` statement to fetch all the tables from your D1 database:

```sh
npx wrangler d1 execute example-db --remote --command "SELECT name FROM sqlite_schema WHERE type='table' ORDER BY name;"
```

```sh
...
🌀 To execute on your local development database, remove the --remote flag from your wrangler command.
🚣 Executed 1 commands in 0.3165ms
┌────────┐
│ name   │
├────────┤
│ _cf_KV │
├────────┤
│ users  │
└────────┘
```

Note

The `_cf_KV` table is a reserved table used by D1's underlying storage system. It cannot be queried and does not incur read/write operations charges against your account.

From here, you can now query our new table from our Worker [using the D1 Workers Binding API](https://developers.cloudflare.com/d1/worker-api/).

Known limitations

For imports, `wrangler d1 execute --file` is limited to 5GiB files, the same as the [R2 upload limit](https://developers.cloudflare.com/r2/platform/limits/). For imports larger than 5GiB, we recommend splitting the data into multiple files.

### Convert SQLite database files

Note

In order to convert a raw SQLite3 database dump (a `.sqlite3` file) you will need the [sqlite command-line tool](https://sqlite.org/cli.html) installed on your system.

If you have an existing SQLite database from another system, you can import its tables into a D1 database. Using the `sqlite` command-line tool, you can convert an `.sqlite3` file into a series of SQL statements that can be imported (executed) against a D1 database.

For example, if you have a raw SQLite dump called `db_dump.sqlite3`, run the following `sqlite` command to convert it:

```sh
sqlite3 db_dump.sqlite3 .dump > db.sql
```

Once you have run the above command, you will need to edit the output SQL file to be compatible with D1:

1. Remove `BEGIN TRANSACTION` and `COMMIT;` from the file

2. Remove the following table creation statement (if present):

   ```sql
   CREATE TABLE _cf_KV (
      key TEXT PRIMARY KEY,
      value BLOB
   ) WITHOUT ROWID;
   ```

You can then follow the steps to [import an existing database](#import-an-existing-database) into D1 by using the `.sql` file you generated from the database dump as the input to `wrangler d1 execute`.

## Export an existing D1 database

In addition to importing existing SQLite databases, you might want to export a D1 database for local development or testing. You can export a D1 database to a `.sql` file using [wrangler d1 export](https://developers.cloudflare.com/workers/wrangler/commands/#d1-export) and then execute (import) with `d1 execute --file`.

To export full D1 database schema and data:

```sh
npx wrangler d1 export <database_name> --remote --output=./database.sql
```

To export single table schema and data:

```sh
npx wrangler d1 export <database_name> --remote --table=<table_name> --output=./table.sql
```

To export only D1 database schema:

```sh
npx wrangler d1 export <database_name> --remote --output=./schema.sql --no-data
```

To export only D1 table schema:

```sh
npx wrangler d1 export <database_name> --remote --table=<table_name> --output=./schema.sql --no-data
```

To export only D1 database data:

```sh
npx wrangler d1 export <database_name> --remote --output=./data.sql --no-schema
```

To export only D1 table data:

```sh
npx wrangler d1 export <database_name> --remote --table=<table_name> --output=./data.sql --no-schema
```

### Known limitations

* Export is not supported for virtual tables, including databases with virtual tables. D1 supports virtual tables for full-text search using SQLite's [FTS5 module](https://www.sqlite.org/fts5.html). As a workaround, delete any virtual tables, export, and then recreate virtual tables.
* A running export will block other database requests.
* Any numeric value in a column is affected by JavaScript's 52-bit precision for numbers. If you store a very large number (in `int64`), then retrieve the same value, the returned value may be less precise than your original number.

## Troubleshooting

If you receive an error when trying to import an existing schema and/or dataset into D1:

* Ensure you are importing data in SQL format (typically with a `.sql` file extension). Refer to [how to convert SQLite files](#convert-sqlite-database-files) if you have a `.sqlite3` database dump.
* Make sure the schema is [SQLite3](https://www.sqlite.org/docs.html) compatible. You cannot import data from a MySQL or PostgreSQL database into D1, as the types and SQL syntax are not directly compatible.
* If you have foreign key relationships between tables, ensure you are importing the tables in the right order. You cannot refer to a table that does not yet exist.
* If you receive a `"cannot start a transaction within a transaction"` error, make sure you have removed `BEGIN TRANSACTION` and `COMMIT` from your dumped SQL statements.

### Resolve `Statement too long` error

If you encounter a `Statement too long` error when trying to import a large SQL file into D1, it means that one of the SQL statements in your file exceeds the maximum allowed length.

To resolve this issue, convert the single large `INSERT` statement into multiple smaller `INSERT` statements. For example, instead of inserting 1,000 rows in one statement, split it into four groups of 250 rows, as illustrated in the code below.

Before:

```sql
INSERT INTO users (id, full_name, created_on)
VALUES
  ('1', 'Jacquelin Elara', '2022-08-20 05:39:52'),
  ('2', 'Hubert Simmons', '2022-12-15 21:56:13'),
  ...
  ('1000', 'Boris Pewter', '2022-12-24 07:59:54');
```

After:

```sql
INSERT INTO users (id, full_name, created_on)
VALUES
  ('1', 'Jacquelin Elara', '2022-08-20 05:39:52'),
  ...
  ('100', 'Eddy Orelo', '2022-12-15 22:16:15');
...
INSERT INTO users (id, full_name, created_on)
VALUES
  ('901', 'Roran Eroi', '2022-08-20 05:39:52'),
  ...
  ('1000', 'Boris Pewter', '2022-12-15 22:16:15');
```

## Foreign key constraints

When importing data, you may need to temporarily disable [foreign key constraints](https://developers.cloudflare.com/d1/sql-api/foreign-keys/). To do so, call `PRAGMA defer_foreign_keys = true` before making changes that would violate foreign keys.

Refer to the [foreign key documentation](https://developers.cloudflare.com/d1/sql-api/foreign-keys/) to learn more about how to work with foreign keys and D1.

## Next Steps

* Read the SQLite [`CREATE TABLE`](https://www.sqlite.org/lang_createtable.html) documentation.
* Learn how to [use the D1 Workers Binding API](https://developers.cloudflare.com/d1/worker-api/) from within a Worker.
* Understand how [database migrations work](https://developers.cloudflare.com/d1/reference/migrations/) with D1.

</page>

<page>
---
title: Local development · Cloudflare D1 docs
description: D1 has fully-featured support for local development, running the
  same version of D1 as Cloudflare runs globally. Local development uses
  Wrangler, the command-line interface for Workers, to manage local development
  sessions and state.
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/best-practices/local-development/
  md: https://developers.cloudflare.com/d1/best-practices/local-development/index.md
---

D1 has fully-featured support for local development, running the same version of D1 as Cloudflare runs globally. Local development uses [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/), the command-line interface for Workers, to manage local development sessions and state.

## Start a local development session

Note

This guide assumes you are using [Wrangler v3.0](https://blog.cloudflare.com/wrangler3/) or later.

Users new to D1 and/or Cloudflare Workers should visit the [D1 tutorial](https://developers.cloudflare.com/d1/get-started/) to install `wrangler` and deploy their first database.

Local development sessions create a standalone, local-only environment that mirrors the production environment D1 runs in so that you can test your Worker and D1 *before* you deploy to production.

An existing [D1 binding](https://developers.cloudflare.com/workers/wrangler/configuration/#d1-databases) of `DB` would be available to your Worker when running locally.

To start a local development session:

1. Confirm you are using wrangler v3.0+.

   ```sh
   wrangler --version
   ```

   ```sh
   ⛅️ wrangler 3.0.0
   ```

2. Start a local development session

   ```sh
   wrangler dev
   ```

   ```sh
   ------------------
   wrangler dev now uses local mode by default, powered by 🔥 Miniflare and 👷 workerd.
   To run an edge preview session for your Worker, use wrangler dev --remote
   Your worker has access to the following bindings:
   - D1 Databases:
     - DB: test-db (c020574a-5623-407b-be0c-cd192bab9545)
   ⎔ Starting local server...


   [mf:inf] Ready on http://127.0.0.1:8787/
   [b] open a browser, [d] open Devtools, [l] turn off local mode, [c] clear console, [x] to exit
   ```

In this example, the Worker has access to local-only D1 database. The corresponding D1 binding in your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) would resemble the following:

* wrangler.jsonc

  ```jsonc
  {
    "d1_databases": [
      {
        "binding": "DB",
        "database_name": "test-db",
        "database_id": "c020574a-5623-407b-be0c-cd192bab9545"
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  [[d1_databases]]
  binding = "DB"
  database_name = "test-db"
  database_id = "c020574a-5623-407b-be0c-cd192bab9545"
  ```

Note that `wrangler dev` separates local and production (remote) data. A local session does not have access to your production data by default. To access your production (remote) database, set `"remote" : true` in the D1 binding configuration. Refer to the [remote bindings documentation](https://developers.cloudflare.com/workers/development-testing/#remote-bindings) for more information. Any changes you make when running against a remote database cannot be undone.

Refer to the [`wrangler dev` documentation](https://developers.cloudflare.com/workers/wrangler/commands/#dev) to learn more about how to configure a local development session.

## Develop locally with Pages

You can only develop against a *local* D1 database when using [Cloudflare Pages](https://developers.cloudflare.com/pages/) by creating a minimal [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) in the root of your Pages project. This can be useful when creating schemas, seeding data or otherwise managing a D1 database directly, without adding to your application logic.

Local development for remote databases

It is currently not possible to develop against a *remote* D1 database when using [Cloudflare Pages](https://developers.cloudflare.com/pages/).

Your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) should resemble the following:

* wrangler.jsonc

  ```jsonc
  {
    // If you are only using Pages + D1, you only need the below in your Wrangler config file to interact with D1 locally.
    "d1_databases": [
      {
        "binding": "DB", // Should match preview_database_id
        "database_name": "YOUR_DATABASE_NAME",
        "database_id": "the-id-of-your-D1-database-goes-here", // wrangler d1 info YOUR_DATABASE_NAME
        "preview_database_id": "DB" // Required for Pages local development
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  [[d1_databases]]
  binding = "DB"
  database_name = "YOUR_DATABASE_NAME"
  database_id = "the-id-of-your-D1-database-goes-here"
  preview_database_id = "DB"
  ```

You can then execute queries and/or run migrations against a local database as part of your local development process by passing the `--local` flag to wrangler:

```bash
wrangler d1 execute YOUR_DATABASE_NAME \
  --local --command "CREATE TABLE IF NOT EXISTS users ( user_id INTEGER PRIMARY KEY, email_address TEXT, created_at INTEGER, deleted INTEGER, settings TEXT);"
```

The preceding command would execute queries the **local only** version of your D1 database. Without the `--local` flag, the commands are executed against the remote version of your D1 database running on Cloudflare's network.

## Persist data

Note

By default, in Wrangler v3 and above, data is persisted across each run of `wrangler dev`. If your local development and testing requires or assumes an empty database, you should start with a `DROP TABLE <tablename>` statement to delete existing tables before using `CREATE TABLE` to re-create them.

Use `wrangler dev --persist-to=/path/to/file` to persist data to a specific location. This can be useful when working in a team (allowing you to share) the same copy, when deploying via CI/CD (to ensure the same starting state), or as a way to keep data when migrating across machines.

Users of wrangler `2.x` must use the `--persist` flag: previous versions of wrangler did not persist data by default.

## Test programmatically

### Miniflare

[Miniflare](https://miniflare.dev/) allows you to simulate a Workers and resources like D1 using the same underlying runtime and code as used in production.

You can use Miniflare's [support for D1](https://miniflare.dev/storage/d1) to create D1 databases you can use for testing:

* wrangler.jsonc

  ```jsonc
  {
    "d1_databases": [
      {
        "binding": "DB",
        "database_name": "test-db",
        "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  [[d1_databases]]
  binding = "DB"
  database_name = "test-db"
  database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  ```

```js
const mf = new Miniflare({
  d1Databases: {
    DB: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  },
});
```

You can then use the `getD1Database()` method to retrieve the simulated database and run queries against it as if it were your real production D1 database:

```js
const db = await mf.getD1Database("DB");


const stmt = db.prepare("SELECT name, age FROM users LIMIT 3");
const { results } = await stmt.run();


console.log(results);
```

### `unstable_dev`

Wrangler exposes an [`unstable_dev()`](https://developers.cloudflare.com/workers/wrangler/api/) that allows you to run a local HTTP server for testing Workers and D1. Run [migrations](https://developers.cloudflare.com/d1/reference/migrations/) against a local database by setting a `preview_database_id` in your Wrangler configuration.

Given the below Wrangler configuration:

* wrangler.jsonc

  ```jsonc
  {
    "d1_databases": [
      {
        "binding": "DB", // i.e. if you set this to "DB", it will be available in your Worker at `env.DB`
        "database_name": "your-database", // the name of your D1 database, set when created
        "database_id": "<UUID>", // The unique ID of your D1 database, returned when you create your database or run `
        "preview_database_id": "local-test-db" // A user-defined ID for your local test database.
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  [[d1_databases]]
  binding = "DB"
  database_name = "your-database"
  database_id = "<UUID>"
  preview_database_id = "local-test-db"
  ```

Migrations can be run locally as part of your CI/CD setup by passing the `--local` flag to `wrangler`:

```sh
wrangler d1 migrations apply your-database --local
```

### Usage example

The following example shows how to use Wrangler's `unstable_dev()` API to:

* Run migrations against your local test database, as defined by `preview_database_id`.
* Make a request to an endpoint defined in your Worker. This example uses `/api/users/?limit=2`.
* Validate the returned results match, including the `Response.status` and the JSON our API returns.

```ts
import { unstable_dev } from "wrangler";
import type { UnstableDevWorker } from "wrangler";


describe("Test D1 Worker endpoint", () => {
  let worker: UnstableDevWorker;


  beforeAll(async () => {
    // Optional: Run any migrations to set up your `--local` database
    // By default, this will default to the preview_database_id
    execSync(`NO_D1_WARNING=true wrangler d1 migrations apply db --local`);


    worker = await unstable_dev("src/index.ts", {
      experimental: { disableExperimentalWarning: true },
    });
  });


  afterAll(async () => {
    await worker.stop();
  });


  it("should return an array of users", async () => {
    // Our expected results
    const expectedResults = `{"results": [{"user_id": 1234, "email": "foo@example.com"},{"user_id": 6789, "email": "bar@example.com"}]}`;
    // Pass an optional URL to fetch to trigger any routing within your Worker
    const resp = await worker.fetch("/api/users/?limit=2");
    if (resp) {
      // https://jestjs.io/docs/expect#tobevalue
      expect(resp.status).toBe(200);
      const data = await resp.json();
      // https://jestjs.io/docs/expect#tomatchobjectobject
      expect(data).toMatchObject(expectedResults);
    }
  });
});
```

Review the [`unstable_dev()`](https://developers.cloudflare.com/workers/wrangler/api/#usage) documentation for more details on how to use the API within your tests.

## Related resources

* Use [`wrangler dev`](https://developers.cloudflare.com/workers/wrangler/commands/#dev) to run your Worker and D1 locally and debug issues before deploying.
* Learn [how to debug D1](https://developers.cloudflare.com/d1/observability/debug-d1/).
* Understand how to [access logs](https://developers.cloudflare.com/workers/observability/logs/) generated from your Worker and D1.

</page>

<page>
---
title: Query a database · Cloudflare D1 docs
description: D1 is compatible with most SQLite's SQL convention since it
  leverages SQLite's query engine. You can use SQL commands to query D1.
lastUpdated: 2025-03-07T11:07:33.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/best-practices/query-d1/
  md: https://developers.cloudflare.com/d1/best-practices/query-d1/index.md
---

D1 is compatible with most SQLite's SQL convention since it leverages SQLite's query engine. You can use SQL commands to query D1.

There are a number of ways you can interact with a D1 database:

1. Using [D1 Workers Binding API](https://developers.cloudflare.com/d1/worker-api/) in your code.
2. Using [D1 REST API](https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/create/).
3. Using [D1 Wrangler commands](https://developers.cloudflare.com/d1/wrangler-commands/).

## Use SQL to query D1

D1 understands SQLite semantics, which allows you to query a database using SQL statements via Workers BindingAPI or REST API (including Wrangler commands). Refer to [D1 SQL API](https://developers.cloudflare.com/d1/sql-api/sql-statements/) to learn more about supported SQL statements.

### Use foreign key relationships

When using SQL with D1, you may wish to define and enforce foreign key constraints across tables in a database. Foreign key constraints allow you to enforce relationships across tables, or prevent you from deleting rows that reference rows in other tables. An example of a foreign key relationship is shown below.

```sql
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY,
    email_address TEXT,
    name TEXT,
    metadata TEXT
)


CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY,
    status INTEGER,
    item_desc TEXT,
    shipped_date INTEGER,
    user_who_ordered INTEGER,
    FOREIGN KEY(user_who_ordered) REFERENCES users(user_id)
)
```

Refer to [Define foreign keys](https://developers.cloudflare.com/d1/sql-api/foreign-keys/) for more information.

### Query JSON

D1 allows you to query and parse JSON data stored within a database. For example, you can extract a value inside a JSON object.

Given the following JSON object (`type:blob`) in a column named `sensor_reading`, you can extract values from it directly.

```json
{
    "measurement": {
        "temp_f": "77.4",
        "aqi": [21, 42, 58],
        "o3": [18, 500],
        "wind_mph": "13",
        "location": "US-NY"
    }
}
```

```sql
-- Extract the temperature value
SELECT json_extract(sensor_reading, '$.measurement.temp_f')-- returns "77.4" as TEXT
```

Refer to [Query JSON](https://developers.cloudflare.com/d1/sql-api/query-json/) to learn more about querying JSON objects.

## Query D1 with Workers Binding API

Workers Binding API primarily interacts with the data plane, and allows you to query your D1 database from your Worker.

This requires you to:

1. Bind your D1 database to your Worker.
2. Prepare a statement.
3. Run the statement.

```js
export default {
    async fetch(request, env) {
        const {pathname} = new URL(request.url);
        const companyName1 = `Bs Beverages`;
        const companyName2 = `Around the Horn`;
        const stmt = env.DB.prepare(`SELECT * FROM Customers WHERE CompanyName = ?`);


        if (pathname === `/RUN`) {
            const returnValue = await stmt.bind(companyName1).run();
            return Response.json(returnValue);
        }


        return new Response(
            `Welcome to the D1 API Playground!
            \nChange the URL to test the various methods inside your index.js file.`,
        );
    },
};
```

Refer to [Workers Binding API](https://developers.cloudflare.com/d1/worker-api/) for more information.

## Query D1 with REST API

REST API primarily interacts with the control plane, and allows you to create/manage your D1 database.

Refer to [D1 REST API](https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/create/) for D1 REST API documentation.

## Query D1 with Wrangler commands

You can use Wrangler commands to query a D1 database. Note that Wrangler commands use REST APIs to perform its operations.

```sh
npx wrangler d1 execute prod-d1-tutorial --command="SELECT * FROM Customers"
```

```sh
🌀 Mapping SQL input into an array of statements
🌀 Executing on local database production-db-backend (<DATABASE_ID>) from .wrangler/state/v3/d1:
┌────────────┬─────────────────────┬───────────────────┐
│ CustomerId │ CompanyName         │ ContactName       │
├────────────┼─────────────────────┼───────────────────┤
│ 1          │ Alfreds Futterkiste │ Maria Anders      │
├────────────┼─────────────────────┼───────────────────┤
│ 4          │ Around the Horn     │ Thomas Hardy      │
├────────────┼─────────────────────┼───────────────────┤
│ 11         │ Bs Beverages        │ Victoria Ashworth │
├────────────┼─────────────────────┼───────────────────┤
│ 13         │ Bs Beverages        │ Random Name       │
└────────────┴─────────────────────┴───────────────────┘
```

</page>

<page>
---
title: Global read replication · Cloudflare D1 docs
description: D1 read replication can lower latency for read queries and scale
  read throughput by adding read-only database copies, called read replicas,
  across regions globally closer to clients.
lastUpdated: 2025-09-08T09:38:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/best-practices/read-replication/
  md: https://developers.cloudflare.com/d1/best-practices/read-replication/index.md
---

D1 read replication can lower latency for read queries and scale read throughput by adding read-only database copies, called read replicas, across regions globally closer to clients.

To use read replication, you must use the [D1 Sessions API](https://developers.cloudflare.com/d1/worker-api/d1-database/#withsession), otherwise all queries will continue to be executed only by the primary database.

A session encapsulates all the queries from one logical session for your application. For example, a session may correspond to all queries coming from a particular web browser session. All queries within a session read from a database instance which is as up-to-date as your query needs it to be. Sessions API ensures [sequential consistency](https://developers.cloudflare.com/d1/best-practices/read-replication/#replica-lag-and-consistency-model) for all queries in a session.

To checkout D1 read replication, deploy the following Worker code using Sessions API, which will prompt you to create a D1 database and enable read replication on said database.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/d1-starter-sessions-api-template)

Tip: Place your database further away for the read replication demo

To simulate how read replication can improve a worst case latency scenario, set your D1 database location hint to be in a farther away region. For example, if you are in Europe create your database in Western North America (WNAM).

* JavaScript

  ```js
  export default {
    async fetch(request, env, ctx) {
      const url = new URL(request.url);


      // A. Create the Session.
      // When we create a D1 Session, we can continue where we left off from a previous
      // Session if we have that Session's last bookmark or use a constraint.
      const bookmark =
        request.headers.get("x-d1-bookmark") ?? "first-unconstrained";
      const session = env.DB01.withSession(bookmark);


      try {
        // Use this Session for all our Workers' routes.
        const response = await withTablesInitialized(
          request,
          session,
          handleRequest,
        );


        // B. Return the bookmark so we can continue the Session in another request.
        response.headers.set("x-d1-bookmark", session.getBookmark() ?? "");


        return response;
      } catch (e) {
        console.error({
          message: "Failed to handle request",
          error: String(e),
          errorProps: e,
          url,
          bookmark,
        });
        return Response.json(
          { error: String(e), errorDetails: e },
          { status: 500 },
        );
      }
    },
  };
  ```

* TypeScript

  ```ts
  export default {
    async fetch(request, env, ctx): Promise<Response> {
      const url = new URL(request.url);


      // A. Create the Session.
      // When we create a D1 Session, we can continue where we left off from a previous
      // Session if we have that Session's last bookmark or use a constraint.
      const bookmark =
        request.headers.get("x-d1-bookmark") ?? "first-unconstrained";
      const session = env.DB01.withSession(bookmark);


      try {
        // Use this Session for all our Workers' routes.
        const response = await withTablesInitialized(
          request,
          session,
          handleRequest,
        );


        // B. Return the bookmark so we can continue the Session in another request.
        response.headers.set("x-d1-bookmark", session.getBookmark() ?? "");


        return response;
      } catch (e) {
        console.error({
          message: "Failed to handle request",
          error: String(e),
          errorProps: e,
          url,
          bookmark,
        });
        return Response.json(
          { error: String(e), errorDetails: e },
          { status: 500 },
        );
      }
    },
  } satisfies ExportedHandler<Env>;
  ```

## Primary database instance vs read replicas

![D1 read replication concept](https://developers.cloudflare.com/images/d1/d1-read-replication-concept.png)

When using D1 without read replication, D1 routes all queries (both read and write) to a specific database instance in [one location in the world](https://developers.cloudflare.com/d1/configuration/data-location/), known as the primary database instance . D1 request latency is dependent on the physical proximity of a user to the primary database instance. Users located further away from the primary database instance experience longer request latency due to [network round-trip time](https://www.cloudflare.com/learning/cdn/glossary/round-trip-time-rtt/).

When using read replication, D1 creates multiple asynchronously replicated copies of the primary database instance, which only serve read requests, called read replicas . D1 creates the read replicas in [multiple regions](https://developers.cloudflare.com/d1/best-practices/read-replication/#read-replica-locations) throughout the world across Cloudflare's network.

Even though a user may be located far away from the primary database instance, they could be close to a read replica. When D1 routes read requests to the read replica instead of the primary database instance, the user enjoys faster responses for their read queries.

D1 asynchronously replicates changes from the primary database instance to all read replicas. This means that at any given time, a read replica may be arbitrarily out of date. The time it takes for the latest committed data in the primary database instance to be replicated to the read replica is known as the replica lag . Replica lag and non-deterministic routing to individual replicas can lead to application data consistency issues. The D1 Sessions API solves this by ensuring sequential consistency. For more information, refer to [replica lag and consistency model](https://developers.cloudflare.com/d1/best-practices/read-replication/#replica-lag-and-consistency-model).

Note

All write queries are still forwarded to the primary database instance. Read replication only improves the response time for read query requests.

| Type of database instance | Description | How it handles write queries | How it handles read queries |
| - | - | - | - |
| Primary database instance | The database instance containing the “original” copy of the database | Can serve write queries | Can serve read queries |
| Read replica database instance | A database instance containing a copy of the original database which asynchronously receives updates from the primary database instance | Forwards any write queries to the primary database instance | Can serve read queries using its own copy of the database |

## Benefits of read replication

A system with multiple read replicas located around the world improves the performance of databases:

* The query latency decreases for users located close to the read replicas. By shortening the physical distance between a the database instance and the user, read query latency decreases, resulting in a faster application.
* The read throughput increases by distributing load across multiple replicas. Since multiple database instances are able to serve read-only requests, your application can serve a larger number of queries at any given time.

## Use Sessions API

By using [Sessions API](https://developers.cloudflare.com/d1/worker-api/d1-database/#withsession) for read replication, all of your queries from a single session read from a version of the database which ensures sequential consistency. This ensures that the version of the database you are reading is logically consistent even if the queries are handled by different read replicas.

D1 read replication achieves this by attaching a bookmark to each query within a session. For more information, refer to [Bookmarks](https://developers.cloudflare.com/d1/reference/time-travel/#bookmarks).

### Enable read replication

Read replication can be enabled at the database level in the Cloudflare dashboard. Check **Settings** for your D1 database to view if read replication is enabled.

1. In the Cloudflare dashboard, go to the **D1** page.

   [Go to **D1 SQL database**](https://dash.cloudflare.com/?to=/:account/workers/d1)

2. Select an existing database > **Settings** > **Enable Read Replication**.

### Start a session without constraints

To create a session from any available database version, use `withSession()` without any parameters, which will route the first query to any database instance, either the primary database instance or a read replica.

```ts
const session = env.DB.withSession() // synchronous
// query executes on either primary database or a read replica
const result = await session
  .prepare(`SELECT * FROM Customers WHERE CompanyName = 'Bs Beverages'`)
  .run()
```

* `withSession()` is the same as `withSession("first-unconstrained")`
* This approach is best when your application does not require the latest database version. All queries in a session ensure sequential consistency.
* Refer to the [D1 Workers Binding API documentation](https://developers.cloudflare.com/d1/worker-api/d1-database#withsession).

### Start a session with all latest data

To create a session from the latest database version, use `withSession("first-primary")`, which will route the first query to the primary database instance.

```ts
const session = env.DB.withSession(`first-primary`) // synchronous
// query executes on primary database
const result = await session
  .prepare(`SELECT * FROM Customers WHERE CompanyName = 'Bs Beverages'`)
  .run()
```

* This approach is best when your application requires the latest database version. All queries in a session ensure sequential consistency.
* Refer to the [D1 Workers Binding API documentation](https://developers.cloudflare.com/d1/worker-api/d1-database#withsession).

### Start a session from previous context (bookmark)

To create a new session from the context of a previous session, pass a `bookmark` parameter to guarantee that the session starts with a database version that is at least as up-to-date as the provided `bookmark`.

```ts
// retrieve bookmark from previous session stored in HTTP header
const bookmark = request.headers.get('x-d1-bookmark') ?? 'first-unconstrained';


const session = env.DB.withSession(bookmark)
const result = await session
  .prepare(`SELECT * FROM Customers WHERE CompanyName = 'Bs Beverages'`)
  .run()
// store bookmark for a future session
response.headers.set('x-d1-bookmark', session.getBookmark() ?? "")
```

* Starting a session with a `bookmark` ensures the new session will be at least as up-to-date as the previous session that generated the given `bookmark`.
* Refer to the [D1 Workers Binding API documentation](https://developers.cloudflare.com/d1/worker-api/d1-database#withsession).

### Check where D1 request was processed

To see how D1 requests are processed by the addition of read replicas, `served_by_region` and `served_by_primary` fields are returned in the `meta` object of [D1 Result](https://developers.cloudflare.com/d1/worker-api/return-object/#d1result).

```ts
const result = await env.DB.withSession()
  .prepare(`SELECT * FROM Customers WHERE CompanyName = 'Bs Beverages'`)
  .run();
console.log({
  servedByRegion: result.meta.served_by_region ?? "",
  servedByPrimary: result.meta.served_by_primary ?? "",
});
```

* `served_by_region` and `served_by_primary` fields are present for all D1 remote requests, regardless of whether read replication is enabled or if the Sessions API is used. On local development, `npx wrangler dev`, these fields are `undefined`.

### Enable read replication via REST API

With the REST API, set `read_replication.mode: auto` to enable read replication on a D1 database.

For this REST endpoint, you need to have an API token with `D1:Edit` permission. If you do not have an API token, follow the guide: [Create API token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/).

* cURL

  ```sh
  curl -X PUT "https://api.cloudflare.com/client/v4/accounts/{account_id}/d1/database/{database_id}" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"read_replication": {"mode": "auto"}}'
  ```

* TypeScript

  ```ts
  const headers = new Headers({
    "Authorization": `Bearer ${TOKEN}`
  });


  await fetch ("/v4/accounts/{account_id}/d1/database/{database_id}", {
    method: "PUT",
    headers: headers,
    body: JSON.stringify(
      { "read_replication": { "mode": "auto" } }
    )
   }
  )
  ```

### Disable read replication via REST API

With the REST API, set `read_replication.mode: disabled` to disable read replication on a D1 database.

For this REST endpoint, you need to have an API token with `D1:Edit` permission. If you do not have an API token, follow the guide: [Create API token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/).

Note

Disabling read replication takes up to 24 hours for replicas to stop processing requests. Sessions API works with databases that do not have read replication enabled, so it is safe to run code with Sessions API even after disabling read replication.

* cURL

  ```sh
  curl -X PUT "https://api.cloudflare.com/client/v4/accounts/{account_id}/d1/database/{database_id}" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"read_replication": {"mode": "disabled"}}'
  ```

* TypeScript

  ```ts
  const headers = new Headers({
    "Authorization": `Bearer ${TOKEN}`
  });


  await fetch ("/v4/accounts/{account_id}/d1/database/{database_id}", {
    method: "PUT",
    headers: headers,
    body: JSON.stringify(
      { "read_replication": { "mode": "disabled" } }
    )
   }
  )
  ```

### Check if read replication is enabled

On the Cloudflare dashboard, check **Settings** for your D1 database to view if read replication is enabled.

Alternatively, `GET` D1 database REST endpoint returns if read replication is enabled or disabled.

For this REST endpoint, you need to have an API token with `D1:Read` permission. If you do not have an API token, follow the guide: [Create API token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/).

* cURL

  ```sh
  curl -X GET "https://api.cloudflare.com/client/v4/accounts/{account_id}/d1/database/{database_id}" \
    -H "Authorization: Bearer $TOKEN"
  ```

* TypeScript

  ```ts
  const headers = new Headers({
    "Authorization": `Bearer ${TOKEN}`
  });


  const response = await fetch("/v4/accounts/{account_id}/d1/database/{database_id}", {
    method: "GET",
    headers: headers
  });


  const data = await response.json();
  console.log(data.read_replication.mode);
  ```

- Check the `read_replication` property of the `result` object

  * `"mode": "auto"` indicates read replication is enabled
  * `"mode": "disabled"` indicates read replication is disabled

## Read replica locations

Currently, D1 automatically creates a read replica in [every supported region](https://developers.cloudflare.com/d1/configuration/data-location/#available-location-hints), including the region where the primary database instance is located. These regions are:

* ENAM
* WNAM
* WEUR
* EEUR
* APAC
* OC

Note

Read replica locations are subject to change at Cloudflare's discretion.

## Observability

To see the impact of read replication and check the how D1 requests are processed by additional database instances, you can use:

* The `meta` object within the [`D1Result`](https://developers.cloudflare.com/d1/worker-api/return-object/#d1result) return object, which includes new fields:

  * `served_by_region`
  * `served_by_primary`

* The Cloudflare dashboard, where you can view your database metrics breakdown by region that processed D1 requests.

## Pricing

D1 read replication is built into D1, so you don’t pay extra storage or compute costs for read replicas. You incur the exact same D1 [usage billing](https://developers.cloudflare.com/d1/platform/pricing/#billing-metrics) with or without replicas, based on `rows_read` and `rows_written` by your queries.

## Known limitations

There are some known limitations for D1 read replication.

* Sessions API is only available via the [D1 Worker Binding](https://developers.cloudflare.com/d1/worker-api/d1-database/#withsession) and not yet available via the REST API.

## Background information

### Replica lag and consistency model

To account for replica lag, it is important to consider the consistency model for D1. A consistency model is a logical framework that governs how a database system serves user queries (how the data is updated and accessed) when there are multiple database instances. Different models can be useful in different use cases. Most database systems provide [read committed](https://jepsen.io/consistency/models/read-committed), [snapshot isolation](https://jepsen.io/consistency/models/snapshot-isolation), or [serializable](https://jepsen.io/consistency/models/serializable) consistency models, depending on their configuration.

#### Without Sessions API

Consider what could happen in a distributed database system.

![Distributed replicas could cause inconsistencies without Sessions API](https://developers.cloudflare.com/images/d1/consistency-without-sessions-api.png)

1. Your SQL write query is processed by the primary database instance.
2. You obtain a response acknowledging the write query.
3. Your subsequent SQL read query goes to a read replica.
4. The read replica has not yet been updated, so does not contain changes from your SQL write query. The returned results are inconsistent from your perspective.

#### With Sessions API

When using D1 Sessions API, your queries obtain bookmarks which allows the read replica to only serve sequentially consistent data.

![D1 offers sequential consistency when using Sessions API](https://developers.cloudflare.com/images/d1/consistency-with-sessions-api.png)

1. SQL write query is processed by the primary database instance.
2. You obtain a response acknowledging the write query. You also obtain a bookmark (100) which identifies the state of the database after the write query.
3. Your subsequent SQL read query goes to a read replica, and also provides the bookmark (100).
4. The read replica will wait until it has been updated to be at least as up-to-date as the provided bookmark (100).
5. Once the read replica has been updated (bookmark 104), it serves your read query, which is now sequentially consistent.

In the diagram, the returned bookmark is bookmark 104, which is different from the one provided in your read query (bookmark 100). This can happen if there were other writes from other client requests that also got replicated to the read replica in between the two write/read queries you executed.

#### Sessions API provides sequential consistency

D1 read replication offers [sequential consistency](https://jepsen.io/consistency/models/sequential). D1 creates a global order of all operations which have taken place on the database, and can identify the latest version of the database that a query has seen, using [bookmarks](https://developers.cloudflare.com/d1/reference/time-travel/#bookmarks). It then serves the query with a database instance that is at least as up-to-date as the bookmark passed along with the query to execute.

Sequential consistency has properties such as:

* **Monotonic reads**: If you perform two reads one after the other (read-1, then read-2), read-2 cannot read a version of the database prior to read-1.
* **Monotonic writes**: If you perform write-1 then write-2, all processes observe write-1 before write-2.
* **Writes follow reads**: If you read a value, then perform a write, the subsequent write must be based on the value that was just read.
* **Read my own writes**: If you write to the database, all subsequent reads will see the write.

## Supplementary information

You may wish to refer to the following resources:

* Blog: [Sequential consistency without borders: How D1 implements global read replication](https://blog.cloudflare.com/d1-read-replication-beta/)
* Blog: [Building D1: a Global Database](https://blog.cloudflare.com/building-d1-a-global-database/)
* [D1 Sessions API documentation](https://developers.cloudflare.com/d1/worker-api/d1-database#withsession)
* [Starter code for D1 Sessions API demo](https://github.com/cloudflare/templates/tree/main/d1-starter-sessions-api-template)
* [E-commerce store read replication tutorial](https://developers.cloudflare.com/d1/tutorials/using-read-replication-for-e-com)

</page>

<page>
---
title: Remote development · Cloudflare D1 docs
description: D1 supports remote development using the dashboard playground. The
  dashboard playground uses a browser version of Visual Studio Code, allowing
  you to rapidly iterate on your Worker entirely in your browser.
lastUpdated: 2025-09-03T16:40:54.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/best-practices/remote-development/
  md: https://developers.cloudflare.com/d1/best-practices/remote-development/index.md
---

D1 supports remote development using the [dashboard playground](https://developers.cloudflare.com/workers/playground/#use-the-playground). The dashboard playground uses a browser version of Visual Studio Code, allowing you to rapidly iterate on your Worker entirely in your browser.

## 1. Bind a D1 database to a Worker

Note

This guide assumes you have previously created a Worker, and a D1 database.

Users new to D1 and/or Cloudflare Workers should read the [D1 tutorial](https://developers.cloudflare.com/d1/get-started/) to install `wrangler` and deploy their first database.

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select an existing Worker.

3. Go to the **Bindings** tab.

4. Select **Add binding**.

5. Select **D1 database** > **Add binding**.

6. Enter a variable name, such as `DB`, and select the D1 database you wish to access from this Worker.

7. Select **Add binding**.

## 2. Start a remote development session

1. On the Worker's page on the Cloudflare dashboard, select **Edit Code** at the top of the page.
2. Your Worker now has access to D1.

Use the following Worker script to verify that the Worker has access to the bound D1 database:

```js
export default {
  async fetch(request, env, ctx) {
    const res = await env.DB.prepare("SELECT 1;").run();
    return new Response(JSON.stringify(res, null, 2));
  },
};
```

## Related resources

* Learn [how to debug D1](https://developers.cloudflare.com/d1/observability/debug-d1/).
* Understand how to [access logs](https://developers.cloudflare.com/workers/observability/logs/) generated from your Worker and D1.

</page>

<page>
---
title: Retry queries · Cloudflare D1 docs
description: It is useful to retry write queries from your application when you
  encounter a transient error. From the list of D1_ERRORs, refer to the
  Recommended action column to determine if a query should be retried.
lastUpdated: 2025-09-11T13:59:52.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/best-practices/retry-queries/
  md: https://developers.cloudflare.com/d1/best-practices/retry-queries/index.md
---

It is useful to retry write queries from your application when you encounter a transient [error](https://developers.cloudflare.com/d1/observability/debug-d1/#error-list). From the list of `D1_ERROR`s, refer to the Recommended action column to determine if a query should be retried.

Note

D1 automatically retries read-only queries up to two more times when it encounters a retryable error.

## Example of retrying queries

Consider the following example of a `shouldRetry(...)` function, taken from the [D1 read replication starter template](https://github.com/cloudflare/templates/blob/main/d1-starter-sessions-api-template/src/index.ts#L108).

You should make sure your retries apply an exponential backoff with jitter strategy for more successful retries. You can use libraries abstracting that already like [`@cloudflare/actors`](https://github.com/cloudflare/actors), or [copy the retry logic](https://github.com/cloudflare/actors/blob/9ba112503132ddf6b5cef37ff145e7a2dd5ffbfc/packages/core/src/retries.ts#L18) in your own code directly.

```ts
import { tryWhile } from "@cloudflare/actors";


function queryD1Example(d1: D1Database, sql: string) {
  return await tryWhile(async () => {
    return await d1.prepare(sql).run();
  }, shouldRetry);
}


function shouldRetry(err: unknown, nextAttempt: number) {
  const errMsg = String(err);
  const isRetryableError =
    errMsg.includes("Network connection lost") ||
    errMsg.includes("storage caused object to be reset") ||
    errMsg.includes("reset because its code was updated");
  if (nextAttempt <= 5 && isRetryableError) {
    return true;
  }
  return false;
}
```

</page>

<page>
---
title: Use D1 from Pages · Cloudflare D1 docs
lastUpdated: 2024-12-11T09:43:45.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/best-practices/use-d1-from-pages/
  md: https://developers.cloudflare.com/d1/best-practices/use-d1-from-pages/index.md
---


</page>

<page>
---
title: Use indexes · Cloudflare D1 docs
description: Indexes enable D1 to improve query performance over the indexed
  columns for common (popular) queries by reducing the amount of data (number of
  rows) the database has to scan when running a query.
lastUpdated: 2025-02-24T09:30:25.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/best-practices/use-indexes/
  md: https://developers.cloudflare.com/d1/best-practices/use-indexes/index.md
---

Indexes enable D1 to improve query performance over the indexed columns for common (popular) queries by reducing the amount of data (number of rows) the database has to scan when running a query.

## When is an index useful?

Indexes are useful:

* When you want to improve the read performance over columns that are regularly used in predicates - for example, a `WHERE email_address = ?` or `WHERE user_id = 'a793b483-df87-43a8-a057-e5286d3537c5'` - email addresses, usernames, user IDs and/or dates are good choices for columns to index in typical web applications or services.
* For enforcing uniqueness constraints on a column or columns - for example, an email address or user ID via the `CREATE UNIQUE INDEX`.
* In cases where you query over multiple columns together - `(customer_id, transaction_date)`.

Indexes are automatically updated when the table and column(s) they reference are inserted, updated or deleted. You do not need to manually update an index after you write to the table it references.

## Create an index

Note

Tables that use the default primary key (an `INTEGER` based `ROWID`), or that define their own `INTEGER PRIMARY KEY`, do not need to create an index for that column.

To create an index on a D1 table, use the `CREATE INDEX` SQL command and specify the table and column(s) to create the index over.

For example, given the following `orders` table, you may want to create an index on `customer_id`. Nearly all of your queries against that table filter on `customer_id`, and you would see a performance improvement by creating an index for it.

```sql
CREATE TABLE IF NOT EXISTS orders (
    order_id INTEGER PRIMARY KEY,
    customer_id STRING NOT NULL, -- for example, a unique ID aba0e360-1e04-41b3-91a0-1f2263e1e0fb
    order_date STRING NOT NULL,
    status INTEGER NOT NULL,
    last_updated_date STRING NOT NULL
)
```

To create the index on the `customer_id` column, execute the below statement against your database:

Note

A common naming format for indexes is `idx_TABLE_NAME_COLUMN_NAMES`, so that you can identify the table and column(s) your indexes are for when managing your database.

```sql
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id)
```

Queries that reference the `customer_id` column will now benefit from the index:

```sql
-- Uses the index: the indexed column is referenced by the query.
SELECT * FROM orders WHERE customer_id = ?


-- Does not use the index: customer_id is not in the query.
SELECT * FROM orders WHERE order_date = '2023-05-01'
```

In more complex cases, you can confirm whether an index was used by D1 by [analyzing a query](#test-an-index) directly.

### Run `PRAGMA optimize`

After creating an index, run the `PRAGMA optimize` command to improve your database performance.

`PRAGMA optimize` runs `ANALYZE` command on each table in the database, which collects statistics on the tables and indices. These statistics allows the query planner to generate the most efficient query plan when executing the user query.

For more information, refer to [`PRAGMA optimize`](https://developers.cloudflare.com/d1/sql-api/sql-statements/#pragma-optimize).

## List indexes

List the indexes on a database, as well as the SQL definition, by querying the `sqlite_schema` system table:

```sql
SELECT name, type, sql FROM sqlite_schema WHERE type IN ('index');
```

This will return output resembling the below:

```txt
┌──────────────────────────────────┬───────┬────────────────────────────────────────┐
│ name                             │ type  │ sql                                    │
├──────────────────────────────────┼───────┼────────────────────────────────────────┤
│ idx_users_id                     │ index │ CREATE INDEX idx_users_id ON users(id) │
└──────────────────────────────────┴───────┴────────────────────────────────────────┘
```

Note that you cannot modify this table, or an existing index. To modify an index, [delete it first](#remove-indexes) and [create a new index](#create-an-index) with the updated definition.

## Test an index

Validate that an index was used for a query by prepending a query with [`EXPLAIN QUERY PLAN`](https://www.sqlite.org/eqp.html). This will output a query plan for the succeeding statement, including which (if any) indexes were used.

For example, if you assume the `users` table has an `email_address TEXT` column and you created an index `CREATE UNIQUE INDEX idx_email_address ON users(email_address)`, any query with a predicate on `email_address` should use your index.

```sql
EXPLAIN QUERY PLAN SELECT * FROM users WHERE email_address = 'foo@example.com';
QUERY PLAN
`--SEARCH users USING INDEX idx_email_address (email_address=?)
```

Review the `USING INDEX <INDEX_NAME>` output from the query planner, confirming the index was used.

This is also a fairly common use-case for an index. Finding a user based on their email address is often a very common query type for login (authentication) systems.

Using an index can reduce the number of rows read by a query. Use the `meta` object to estimate your usage. Refer to ["Can I use an index to reduce the number of rows read by a query?"](https://developers.cloudflare.com/d1/platform/pricing/#can-i-use-an-index-to-reduce-the-number-of-rows-read-by-a-query) and ["How can I estimate my (eventual) bill?"](https://developers.cloudflare.com/d1/platform/pricing/#how-can-i-estimate-my-eventual-bill).

## Multi-column indexes

For a multi-column index (an index that specifies multiple columns), queries will only use the index if they specify either *all* of the columns, or a subset of the columns provided all columns to the "left" are also within the query.

Given an index of `CREATE INDEX idx_customer_id_transaction_date ON transactions(customer_id, transaction_date)`, the following table shows when the index is used (or not):

| Query | Index Used? |
| - | - |
| `SELECT * FROM transactions WHERE customer_id = '1234' AND transaction_date = '2023-03-25'` | Yes: specifies both columns in the index. |
| `SELECT * FROM transactions WHERE transaction_date = '2023-03-28'` | No: only specifies `transaction_date`, and does not include other leftmost columns from the index. |
| `SELECT * FROM transactions WHERE customer_id = '56789'` | Yes: specifies `customer_id`, which is the leftmost column in the index. |

Notes:

* If you created an index over three columns instead — `customer_id`, `transaction_date` and `shipping_status` — a query that uses both `customer_id` and `transaction_date` would use the index, as you are including all columns "to the left".
* With the same index, a query that uses only `transaction_date` and `shipping_status` would *not* use the index, as you have not used `customer_id` (the leftmost column) in the query.

## Partial indexes

Partial indexes are indexes over a subset of rows in a table. Partial indexes are defined by the use of a `WHERE` clause when creating the index. A partial index can be useful to omit certain rows, such as those where values are `NULL` or where rows with a specific value are present across queries.

* A concrete example of a partial index would be on a table with a `order_status INTEGER` column, where `6` might represent `"order complete"` in your application code.
* This would allow queries against orders that are yet to be fulfilled, shipped or are in-progress, which are likely to be some of the most common users (users checking their order status).
* Partial indexes also keep the index from growing unbounded over time. The index does not need to keep a row for every completed order, and completed orders are likely to be queried far fewer times than in-progress orders.

A partial index that filters out completed orders from the index would resemble the following:

```sql
CREATE INDEX idx_order_status_not_complete ON orders(order_status) WHERE order_status != 6
```

Partial indexes can be faster at read time (less rows in the index) and at write time (fewer writes to the index) than full indexes. You can also combine a partial index with a [multi-column index](#multi-column-indexes).

## Remove indexes

Use `DROP INDEX` to remove an index. Dropped indexes cannot be restored.

## Considerations

Take note of the following considerations when creating indexes:

* Indexes are not always a free performance boost. You should create indexes only on columns that reflect your most-queried columns. Indexes themselves need to be maintained. When you write to an indexed column, the database needs to write to the table and the index. The performance benefit of an index and reduction in rows read will, in nearly all cases, offset this additional write.
* You cannot create indexes that reference other tables or use non-deterministic functions, since the index would not be stable.
* Indexes cannot be updated. To add or remove a column from an index, [remove](#remove-indexes) the index and then [create a new index](#create-an-index) with the new columns.
* Indexes contribute to the overall storage required by your database: an index is effectively a table itself.

</page>

<page>
---
title: Data location · Cloudflare D1 docs
description: Learn how the location of data stored in D1 is determined,
  including where the database runs and how you optimize that location based on
  your needs.
lastUpdated: 2025-11-05T14:19:08.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/configuration/data-location/
  md: https://developers.cloudflare.com/d1/configuration/data-location/index.md
---

Learn how the location of data stored in D1 is determined, including where the database runs and how you optimize that location based on your needs.

## Automatic (recommended)

By default, D1 will automatically create your primary database instance in a location close to where you issued the request to create a database. In most cases this allows D1 to choose the optimal location for your database on your behalf.

## Restrict database to a jurisdiction

Jurisdictions are used to create D1 databases that only run and store data within a region to help comply with data locality regulations such as the [GDPR](https://gdpr-info.eu/) or [FedRAMP](https://blog.cloudflare.com/cloudflare-achieves-fedramp-authorization/).

Workers may still access the database constrained to a jurisdiction from anywhere in the world. The jurisdiction constraint only controls where the database itself runs and persists data. Consider using [Regional Services](https://developers.cloudflare.com/data-localization/regional-services/) to control the regions from which Cloudflare responds to requests.

Note

Jurisdictions can only be set on database creation and cannot be added or updated after the database exists. If a jurisdiction and a location hint are both provided, the jurisdiction takes precedence and the location hint is ignored.

### Supported jurisdictions

| Parameter | Location |
| - | - |
| eu | The European Union |
| fedramp | FedRAMP-compliant data centers |

### Use the dashboard

1. In the Cloudflare dashboard, go to the **D1 SQL Database** page.

   [Go to **D1 SQL database**](https://dash.cloudflare.com/?to=/:account/workers/d1)

2. Select **Create Database**.

3. Under **Data location**, select **Specify jurisdiction** and choose a jurisdiction from the list.

4. Select **Create** to create your database.

### Use wrangler

```sh
npx wrangler@latest d1 create db-with-jurisdiction --jurisdiction=eu
```

### Use REST API

```curl
curl -X POST "https://api.cloudflare.com/client/v4/accounts/<account_id>/d1/database" \
     -H "Authorization: Bearer $TOKENn" \
     -H "Content-Type: application/json" \
     --data '{"name": "db-wth-jurisdiction", "jurisdiction": "eu" }'
```

## Provide a location hint

Location hint is an optional parameter you can provide to indicate your desired geographical location for your primary database instance.

You may want to explicitly provide a location hint in cases where the majority of your writes to a specific database come from a different location than where you are creating the database from. Location hints can be useful when:

* Working in a distributed team.
* Creating databases specific to users in specific locations.
* Using continuous deployment (CD) or Infrastructure as Code (IaC) systems to programmatically create your databases.

Provide a location hint when creating a D1 database when:

* Using [`wrangler d1`](https://developers.cloudflare.com/workers/wrangler/commands/#d1) to create a database.
* Creating a database [via the Cloudflare dashboard](https://dash.cloudflare.com/?to=/:account/workers/d1).

Warning

Providing a location hint does not guarantee that D1 runs in your preferred location. Instead, it will run in the nearest possible location (by latency) to your preference.

### Use wrangler

Note

To install wrangler, the command-line interface for D1 and Workers, refer to [Install and Update Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/).

To provide a location hint when creating a new database, pass the `--location` flag with a valid location hint:

```sh
wrangler d1 create new-database --location=weur
```

### Use the dashboard

To provide a location hint when creating a database via the dashboard:

1. In the Cloudflare dashboard, go to the **D1 SQL Database** page.

   [Go to **D1 SQL database**](https://dash.cloudflare.com/?to=/:account/workers/d1)

2. Select **Create database**.

3. Provide a database name and an optional **Location**.

4. Select **Create** to create your database.

### Available location hints

D1 supports the following location hints:

| Hint | Hint description |
| - | - |
| wnam | Western North America |
| enam | Eastern North America |
| weur | Western Europe |
| eeur | Eastern Europe |
| apac | Asia-Pacific |
| oc | Oceania |

Warning

D1 location hints are not currently supported for South America (`sam`), Africa (`afr`), and the Middle East (`me`). D1 databases do not run in these locations.

## Read replica locations

With read replication enabled, D1 creates and distributes read-only copies of the primary database instance around the world. This reduces the query latency for users located far away from the primary database instance.

When using D1 read replication, D1 automatically creates a read replica in [every available region](https://developers.cloudflare.com/d1/configuration/data-location#available-location-hints), including the region where the primary database instance is located.

If a jurisdiction is configured, read replicas are only created within the jurisdiction set on database creation.

Refer to [D1 read replication](https://developers.cloudflare.com/d1/best-practices/read-replication/) for more information.

</page>

<page>
---
title: Environments · Cloudflare D1 docs
description: Environments are different contexts that your code runs in.
  Cloudflare Developer Platform allows you to create and manage different
  environments. Through environments, you can deploy the same project to
  multiple places under multiple names.
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/configuration/environments/
  md: https://developers.cloudflare.com/d1/configuration/environments/index.md
---

[Environments](https://developers.cloudflare.com/workers/wrangler/environments/) are different contexts that your code runs in. Cloudflare Developer Platform allows you to create and manage different environments. Through environments, you can deploy the same project to multiple places under multiple names.

To specify different D1 databases for different environments, use the following syntax in your Wrangler file:

* wrangler.jsonc

  ```jsonc
  {
    "env": {
      // This is a staging environment
      "staging": {
        "d1_databases": [
          {
            "binding": "<BINDING_NAME_1>",
            "database_name": "<DATABASE_NAME_1>",
            "database_id": "<UUID1>"
          }
        ]
      },
      // This is a production environment
      "production": {
        "d1_databases": [
          {
            "binding": "<BINDING_NAME_2>",
            "database_name": "<DATABASE_NAME_2>",
            "database_id": "<UUID2>"
          }
        ]
      }
    }
  }
  ```

* wrangler.toml

  ```toml
  [[env.staging.d1_databases]]
  binding = "<BINDING_NAME_1>"
  database_name = "<DATABASE_NAME_1>"
  database_id = "<UUID1>"


  [[env.production.d1_databases]]
  binding = "<BINDING_NAME_2>"
  database_name = "<DATABASE_NAME_2>"
  database_id = "<UUID2>"
  ```

In the code above, the `staging` environment is using a different database (`DATABASE_NAME_1`) than the `production` environment (`DATABASE_NAME_2`).

## Anatomy of Wrangler file

If you need to specify different D1 databases for different environments, your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) may contain bindings that resemble the following:

* wrangler.jsonc

  ```jsonc
  {
    "production": {
      "d1_databases": [
        {
          "binding": "DB",
          "database_name": "DATABASE_NAME",
          "database_id": "DATABASE_ID"
        }
      ]
    }
  }
  ```

* wrangler.toml

  ```toml
  [[production.d1_databases]]
  binding = "DB"
  database_name = "DATABASE_NAME"
  database_id = "DATABASE_ID"
  ```

In the above configuration:

* `[[production.d1_databases]]` creates an object `production` with a property `d1_databases`, where `d1_databases` is an array of objects, since you can create multiple D1 bindings in case you have more than one database.
* Any property below the line in the form `<key> = <value>` is a property of an object within the `d1_databases` array.

Therefore, the above binding is equivalent to:

```json
{
  "production": {
    "d1_databases": [
      {
        "binding": "DB",
        "database_name": "DATABASE_NAME",
        "database_id": "DATABASE_ID"
      }
    ]
  }
}
```

### Example

* wrangler.jsonc

  ```jsonc
  {
    "env": {
      "staging": {
        "d1_databases": [
          {
            "binding": "BINDING_NAME_1",
            "database_name": "DATABASE_NAME_1",
            "database_id": "UUID_1"
          }
        ]
      },
      "production": {
        "d1_databases": [
          {
            "binding": "BINDING_NAME_2",
            "database_name": "DATABASE_NAME_2",
            "database_id": "UUID_2"
          }
        ]
      }
    }
  }
  ```

* wrangler.toml

  ```toml
  [[env.staging.d1_databases]]
  binding = "BINDING_NAME_1"
  database_name = "DATABASE_NAME_1"
  database_id = "UUID_1"


  [[env.production.d1_databases]]
  binding = "BINDING_NAME_2"
  database_name = "DATABASE_NAME_2"
  database_id = "UUID_2"
  ```

The above is equivalent to the following structure in JSON:

```json
{
  "env": {
    "production": {
      "d1_databases": [
        {
          "binding": "BINDING_NAME_2",
          "database_id": "UUID_2",
          "database_name": "DATABASE_NAME_2"
        }
      ]
    },
    "staging": {
      "d1_databases": [
        {
          "binding": "BINDING_NAME_1",
          "database_id": "UUID_1",
          "database_name": "DATABASE_NAME_1"
        }
      ]
    }
  }
}
```

</page>

<page>
---
title: Query D1 from Hono · Cloudflare D1 docs
description: Query D1 from the Hono web framework
lastUpdated: 2026-01-27T21:11:25.000Z
chatbotDeprioritize: false
tags: Hono
source_url:
  html: https://developers.cloudflare.com/d1/examples/d1-and-hono/
  md: https://developers.cloudflare.com/d1/examples/d1-and-hono/index.md
---

Hono is a fast web framework for building API-first applications, and it includes first-class support for both [Workers](https://developers.cloudflare.com/workers/) and [Pages](https://developers.cloudflare.com/pages/).

When using Workers:

* Ensure you have configured your [Wrangler configuration file](https://developers.cloudflare.com/d1/get-started/#3-bind-your-worker-to-your-d1-database) to bind your D1 database to your Worker.
* You can access your D1 databases via Hono's [`Context`](https://hono.dev/api/context) parameter: [bindings](https://hono.dev/getting-started/cloudflare-workers#bindings) are exposed on `context.env`. If you configured a [binding](https://developers.cloudflare.com/pages/functions/bindings/#d1-databases) named `DB`, then you would access [D1 Workers Binding API](https://developers.cloudflare.com/d1/worker-api/prepared-statements/) methods via `c.env.DB`.
* Refer to the Hono documentation for [Cloudflare Workers](https://hono.dev/getting-started/cloudflare-workers).

If you are using [Pages Functions](https://developers.cloudflare.com/pages/functions/):

1. Bind a D1 database to your [Pages Function](https://developers.cloudflare.com/pages/functions/bindings/#d1-databases).
2. Pass the `--d1 BINDING_NAME=DATABASE_ID` flag to `wrangler dev` when developing locally. `BINDING_NAME` should match what call in your code, and `DATABASE_ID` should match the `database_id` defined in your Wrangler configuration file: for example, `--d1 DB=xxxx-xxxx-xxxx-xxxx-xxxx`.
3. Refer to the Hono guide for [Cloudflare Pages](https://hono.dev/getting-started/cloudflare-pages).

The following examples show how to access a D1 database bound to `DB` from both a Workers script and a Pages Function:

* workers

  ```ts
  import { Hono } from "hono";


  // This ensures c.env.DB is correctly typed
  type Bindings = {
    DB: D1Database;
  };


  const app = new Hono<{ Bindings: Bindings }>();


  // Accessing D1 is via the c.env.YOUR_BINDING property
  app.get("/query/users/:id", async (c) => {
    const userId = c.req.param("id");
    try {
      let { results } = await c.env.DB.prepare(
        "SELECT * FROM users WHERE user_id = ?",
      )
        .bind(userId)
        .run();
      return c.json(results);
    } catch (e) {
      return c.json({ err: "Failed to query user" }, 500);
    }
  });


  // Export our Hono app: Hono automatically exports a
  // Workers 'fetch' handler for you
  export default app;
  ```

* pages

  ```ts
  import { Hono } from "hono";
  import { handle } from "hono/cloudflare-pages";


  // This ensures c.env.DB is correctly typed
  type Bindings = {
    DB: D1Database;
  };


  const app = new Hono<{ Bindings: Bindings }>().basePath("/api");


  // Accessing D1 is via the c.env.YOUR_BINDING property
  app.get("/query/users/:id", async (c) => {
    const userId = c.req.param("id");
    try {
      let { results } = await c.env.DB.prepare(
        "SELECT * FROM users WHERE user_id = ?",
      )
        .bind(userId)
        .run();
      return c.json(results);
    } catch (e) {
      return c.json({ err: "Failed to query user" }, 500);
    }
  });


  // Export the Hono instance as a Pages onRequest function
  export const onRequest = handle(app);
  ```

</page>

<page>
---
title: Query D1 from Remix · Cloudflare D1 docs
description: Query your D1 database from a Remix application.
lastUpdated: 2026-01-28T16:18:50.000Z
chatbotDeprioritize: false
tags: Remix
source_url:
  html: https://developers.cloudflare.com/d1/examples/d1-and-remix/
  md: https://developers.cloudflare.com/d1/examples/d1-and-remix/index.md
---

Note

Remix is no longer recommended for new projects. For new applications, use [React Router](https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router) instead. If you have an existing Remix application, consider [migrating to React Router](https://reactrouter.com/upgrading/remix).

Remix is a full-stack web framework that operates on both client and server. You can query your D1 database(s) from Remix using Remix's [data loading](https://remix.run/docs/en/main/guides/data-loading) API with the [`useLoaderData`](https://remix.run/docs/en/main/hooks/use-loader-data) hook.

To set up a new Remix site on Cloudflare Pages that can query D1:

1. **Refer to [the Remix guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-remix-site/)**.
2. Bind a D1 database to your [Pages Function](https://developers.cloudflare.com/pages/functions/bindings/#d1-databases).
3. Pass the `--d1 BINDING_NAME=DATABASE_ID` flag to `wrangler dev` when developing locally. `BINDING_NAME` should match what call in your code, and `DATABASE_ID` should match the `database_id` defined in your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/): for example, `--d1 DB=xxxx-xxxx-xxxx-xxxx-xxxx`.

The following example shows you how to define a Remix [`loader`](https://remix.run/docs/en/main/route/loader) that has a binding to a D1 database.

* Bindings are passed through on the `context.cloudflare.env` parameter passed to a `LoaderFunction`.
* If you configured a [binding](https://developers.cloudflare.com/pages/functions/bindings/#d1-databases) named `DB`, then you would access [D1 Workers Binding API](https://developers.cloudflare.com/d1/worker-api/prepared-statements/) methods via `context.cloudflare.env.DB`.

- TypeScript

  ```ts
  import type { LoaderFunction } from "@remix-run/cloudflare";
  import { json } from "@remix-run/cloudflare";
  import { useLoaderData } from "@remix-run/react";


  interface Env {
    DB: D1Database;
  }


  export const loader: LoaderFunction = async ({ context, params }) => {
    let env = context.cloudflare.env as Env;


    try {
      let { results } = await env.DB.prepare("SELECT * FROM users LIMIT 5").run();
      return json(results);
    } catch (error) {
      return json({ error: "Failed to fetch users" }, { status: 500 });
    }
  };


  export default function Index() {
    const results = useLoaderData<typeof loader>();
    return (
      <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
        <h1>Welcome to Remix</h1>
        <div>
          A value from D1:
          <pre>{JSON.stringify(results)}</pre>
        </div>
      </div>
    );
  }
  ```

</page>

<page>
---
title: Query D1 from SvelteKit · Cloudflare D1 docs
description: Query a D1 database from a SvelteKit application.
lastUpdated: 2026-01-27T21:11:25.000Z
chatbotDeprioritize: false
tags: SvelteKit,Svelte
source_url:
  html: https://developers.cloudflare.com/d1/examples/d1-and-sveltekit/
  md: https://developers.cloudflare.com/d1/examples/d1-and-sveltekit/index.md
---

[SvelteKit](https://kit.svelte.dev/) is a full-stack framework that combines the Svelte front-end framework with Vite for server-side capabilities and rendering. You can query D1 from SvelteKit by configuring a [server endpoint](https://kit.svelte.dev/docs/routing#server) with a binding to your D1 database(s).

To set up a new SvelteKit site on Cloudflare Pages that can query D1:

1. **Refer to [the SvelteKit guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-svelte-kit-site/) and Svelte's [Cloudflare adapter](https://kit.svelte.dev/docs/adapter-cloudflare)**.
2. Install the Cloudflare adapter within your SvelteKit project: `npm i -D @sveltejs/adapter-cloudflare`.
3. Bind a D1 database [to your Pages Function](https://developers.cloudflare.com/pages/functions/bindings/#d1-databases).
4. Pass the `--d1 BINDING_NAME=DATABASE_ID` flag to `wrangler dev` when developing locally. `BINDING_NAME` should match what call in your code, and `DATABASE_ID` should match the `database_id` defined in your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/): for example, `--d1 DB=xxxx-xxxx-xxxx-xxxx-xxxx`.

The following example shows you how to create a server endpoint configured to query D1.

* Bindings are available on the `platform` parameter passed to each endpoint, via `platform.env.BINDING_NAME`.
* With SvelteKit's [file-based routing](https://kit.svelte.dev/docs/routing), the server endpoint defined in `src/routes/api/users/+server.ts` is available at `/api/users` within your SvelteKit app.

The example also shows you how to configure both your app-wide types within `src/app.d.ts` to recognize your `D1Database` binding, import the `@sveltejs/adapter-cloudflare` adapter into `svelte.config.js`, and configure it to apply to all of your routes.

* TypeScript

  ```ts
  import type { RequestHandler } from "@sveltejs/kit";


  export async function GET({ request, platform }) {
    try {
      let result = await platform.env.DB.prepare(
        "SELECT * FROM users LIMIT 5",
      ).run();
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return Response.json({ error: "Failed to fetch users" }, {
        status: 500
      });
    }
  }
  ```

  ```ts
  // See https://kit.svelte.dev/docs/types#app
  // for information about these interfaces
  declare global {
    namespace App {
      // interface Error {}
      // interface Locals {}
      // interface PageData {}
      interface Platform {
        env: {
          DB: D1Database;
        };
        context: {
          waitUntil(promise: Promise<any>): void;
        };
        caches: CacheStorage & { default: Cache };
      }
    }
  }


  export {};
  ```

  ```js
  import adapter from "@sveltejs/adapter-cloudflare";


  export default {
    kit: {
      adapter: adapter({
        // See below for an explanation of these options
        routes: {
          include: ["/*"],
          exclude: ["<all>"],
        },
      }),
    },
  };
  ```

</page>

<page>
---
title: Export and save D1 database · Cloudflare D1 docs
lastUpdated: 2025-02-19T10:27:52.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/examples/export-d1-into-r2/
  md: https://developers.cloudflare.com/d1/examples/export-d1-into-r2/index.md
---


</page>

<page>
---
title: Query D1 from Python Workers · Cloudflare D1 docs
description: Learn how to query D1 from a Python Worker
lastUpdated: 2026-02-02T18:38:11.000Z
chatbotDeprioritize: false
tags: Python
source_url:
  html: https://developers.cloudflare.com/d1/examples/query-d1-from-python-workers/
  md: https://developers.cloudflare.com/d1/examples/query-d1-from-python-workers/index.md
---

The Cloudflare Workers platform supports [multiple languages](https://developers.cloudflare.com/workers/languages/), including TypeScript, JavaScript, Rust and Python. This guide shows you how to query a D1 database from [Python](https://developers.cloudflare.com/workers/languages/python/) and deploy your application globally.

Note

Support for Python in Cloudflare Workers is in beta. Review the [documentation on Python support](https://developers.cloudflare.com/workers/languages/python/) to understand how Python works within the Workers platform.

## Prerequisites

Before getting started, you should:

1. Review the [D1 tutorial](https://developers.cloudflare.com/d1/get-started/) for TypeScript and JavaScript to learn how to **create a D1 database and configure a Workers project**.
2. Refer to the [Python language guide](https://developers.cloudflare.com/workers/languages/python/) to understand how Python support works on the Workers platform.
3. Have basic familiarity with the Python language.

If you are new to Cloudflare Workers, refer to the [Get started guide](https://developers.cloudflare.com/workers/get-started/guide/) first before continuing with this example.

## Query from Python

This example assumes you have an existing D1 database. To allow your Python Worker to query your database, you first need to create a [binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/) between your Worker and your D1 database and define this in your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/).

You will need the `database_name` and `database_id` for a D1 database. You can use the `wrangler` CLI to create a new database or fetch the ID for an existing database as follows:

```sh
npx wrangler d1 create my-first-db
```

```sh
npx wrangler d1 info some-existing-db
```

```sh
# ┌───────────────────┬──────────────────────────────────────┐
# │                   │ c89db32e-83f4-4e62-8cd7-7c8f97659029 │
# ├───────────────────┼──────────────────────────────────────┤
# │ name              │ db-enam                              │
# ├───────────────────┼──────────────────────────────────────┤
# │ created_at        │ 2023-06-12T16:52:03.071Z             │
# └───────────────────┴──────────────────────────────────────┘
```

### 1. Configure bindings

In your Wrangler file, create a new `[[d1_databases]]` configuration block and set `database_name` and `database_id` to the name and id (respectively) of the D1 database you want to query:

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "python-and-d1",
    "main": "src/entry.py",
    "compatibility_flags": [ // Required for Python Workers
      "python_workers"
    ],
    "compatibility_date": "2026-02-10",
    "d1_databases": [
      {
        "binding": "DB", // This will be how you refer to your database in your Worker
        "database_name": "YOUR_DATABASE_NAME",
        "database_id": "YOUR_DATABASE_ID"
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "python-and-d1"
  main = "src/entry.py"
  compatibility_flags = [ "python_workers" ]
  compatibility_date = "2026-02-10"


  [[d1_databases]]
  binding = "DB"
  database_name = "YOUR_DATABASE_NAME"
  database_id = "YOUR_DATABASE_ID"
  ```

The value of `binding` is how you will refer to your database from within your Worker. If you change this, you must change this in your Worker script as well.

### 2. Create your Python Worker

To create a Python Worker, create an empty file at `src/entry.py`, matching the value of `main` in your Wrangler file with the contents below:

```python
from workers import Response, WorkerEntrypoint


class Default(WorkerEntrypoint):
    async def fetch(self, request):
        # Do anything else you'd like on request here!


        try:
            # Query D1 - we'll list all tables in our database in this example
            results = await self.env.DB.prepare("PRAGMA table_list").run()
            # Return a JSON response
            return Response.json(results)
        except Exception as e:
            return Response.json({"error": "Database query failed"}, status=500)
```

The value of `binding` in your Wrangler file exactly must match the name of the variable in your Python code. This example refers to the database via a `DB` binding, and query this binding via `await env.DB.prepare(...)`.

You can then deploy your Python Worker directly:

```sh
npx wrangler deploy
```

```sh
# Example output
#
# Your worker has access to the following bindings:
# - D1 Databases:
#   - DB: db-enam (c89db32e-83f4-4e62-8cd7-7c8f97659029)
# Total Upload: 0.18 KiB / gzip: 0.17 KiB
# Uploaded python-and-d1 (4.93 sec)
# Published python-and-d1 (0.51 sec)
#   https://python-and-d1.YOUR_SUBDOMAIN.workers.dev
# Current Deployment ID: 80b72e19-da82-4465-83a2-c12fb11ccc72
```

Your Worker will be available at `https://python-and-d1.YOUR_SUBDOMAIN.workers.dev`.

If you receive an error deploying:

* Make sure you have configured your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) with the `database_id` and `database_name` of a valid D1 database.
* Ensure `compatibility_flags = ["python_workers"]` is set in your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/), which is required for Python.
* Review the [list of error codes](https://developers.cloudflare.com/workers/observability/errors/), and ensure your code does not throw an uncaught exception.

## Next steps

* Refer to [Workers Python documentation](https://developers.cloudflare.com/workers/languages/python/) to learn more about how to use Python in Workers.
* Review the [D1 Workers Binding API](https://developers.cloudflare.com/d1/worker-api/) and how to query D1 databases.
* Learn [how to import data](https://developers.cloudflare.com/d1/best-practices/import-export-data/) to your D1 database.

</page>

<page>
---
title: Audit Logs · Cloudflare D1 docs
description: Audit logs provide a comprehensive summary of changes made within
  your Cloudflare account, including those made to D1 databases. This
  functionality is available on all plan types, free of charge, and is always
  enabled.
lastUpdated: 2025-09-03T16:40:54.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/observability/audit-logs/
  md: https://developers.cloudflare.com/d1/observability/audit-logs/index.md
---

[Audit logs](https://developers.cloudflare.com/fundamentals/account/account-security/review-audit-logs/) provide a comprehensive summary of changes made within your Cloudflare account, including those made to D1 databases. This functionality is available on all plan types, free of charge, and is always enabled.

## Viewing audit logs

To view audit logs for your D1 databases, go to the **Audit Logs** page.

[Go to **Audit logs**](https://dash.cloudflare.com/?to=/:account/audit-log)

For more information on how to access and use audit logs, refer to [Review audit logs](https://developers.cloudflare.com/fundamentals/account/account-security/review-audit-logs/).

## Logged operations

The following configuration actions are logged:

| Operation | Description |
| - | - |
| CreateDatabase | Creation of a new database. |
| DeleteDatabase | Deletion of an existing database. |
| [TimeTravel](https://developers.cloudflare.com/d1/reference/time-travel) | Restoration of a past database version. |

## Example log entry

Below is an example of an audit log entry showing the creation of a new database:

```json
{
  "action": { "info": "CreateDatabase", "result": true, "type": "create" },
  "actor": {
    "email": "<ACTOR_EMAIL>",
    "id": "b1ab1021a61b1b12612a51b128baa172",
    "ip": "1b11:a1b2:12b1:12a::11a:1b",
    "type": "user"
  },
  "id": "a123b12a-ab11-1212-ab1a-a1aa11a11abb",
  "interface": "API",
  "metadata": {},
  "newValue": "",
  "newValueJson": { "database_name": "my-db" },
  "oldValue": "",
  "oldValueJson": {},
  "owner": { "id": "211b1a74121aa32a19121a88a712aa12" },
  "resource": {
    "id": "11a21122-1a11-12bb-11ab-1aa2aa1ab12a",
    "type": "d1.database"
  },
  "when": "2024-08-09T04:53:55.752Z"
}
```

</page>

<page>
---
title: Billing · Cloudflare D1 docs
description: D1 exposes analytics to track billing metrics (rows read, rows
  written, and total storage) across all databases in your account.
lastUpdated: 2025-09-03T16:40:54.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/observability/billing/
  md: https://developers.cloudflare.com/d1/observability/billing/index.md
---

D1 exposes analytics to track billing metrics (rows read, rows written, and total storage) across all databases in your account.

The metrics displayed in the [Cloudflare dashboard](https://dash.cloudflare.com/) are sourced from Cloudflare's [GraphQL Analytics API](https://developers.cloudflare.com/analytics/graphql-api/). You can access the metrics [programmatically](https://developers.cloudflare.com/d1/observability/metrics-analytics/#query-via-the-graphql-api) via GraphQL or HTTP client.

## View metrics in the dashboard

Total account billable usage analytics for D1 are available in the Cloudflare dashboard. To view current and past metrics for an account:

1. In the Cloudflare dashboard, go to the **Billing** page.

   [Go to **Billing**](https://dash.cloudflare.com/?to=/:account/billing)

2. Go to **Billable Usage**.

From here you can view charts of your account's D1 usage on a daily or month-to-date timeframe.

Note that billable usage history is stored for a maximum of 30 days.

## Billing Notifications

Usage-based billing notifications are available within the [Cloudflare dashboard](https://dash.cloudflare.com) for users looking to monitor their total account usage.

Notifications on the following metrics are available:

* Rows Read
* Rows Written

</page>

<page>
---
title: Debug D1 · Cloudflare D1 docs
description: D1 allows you to capture exceptions and log errors returned when
  querying a database. To debug D1, you will use the same tools available when
  debugging Workers.
lastUpdated: 2025-09-17T08:55:05.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/observability/debug-d1/
  md: https://developers.cloudflare.com/d1/observability/debug-d1/index.md
---

D1 allows you to capture exceptions and log errors returned when querying a database. To debug D1, you will use the same tools available when [debugging Workers](https://developers.cloudflare.com/workers/observability/).

D1's [`stmt.`](https://developers.cloudflare.com/d1/worker-api/prepared-statements/) and [`db.`](https://developers.cloudflare.com/d1/worker-api/d1-database/) methods throw an [Error object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) whenever an error occurs. To capture exceptions, log the `e.message` value.

For example, the code below has a query with an invalid keyword - `INSERTZ` instead of `INSERT`:

```js
try {
    // This is an intentional misspelling
    await db.exec("INSERTZ INTO my_table (name, employees) VALUES ()");
} catch (e: any) {
    console.error({
        message: e.message
    });
}
```

The code above throws the following error message:

```json
{
  "message": "D1_EXEC_ERROR: Error in line 1: INSERTZ INTO my_table (name, employees) VALUES (): sql error: near \"INSERTZ\": syntax error in INSERTZ INTO my_table (name, employees) VALUES () at offset 0"
}
```

Note

Prior to [`wrangler` 3.1.1](https://github.com/cloudflare/workers-sdk/releases/tag/wrangler%403.1.1), D1 JavaScript errors used the [cause property](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause) for detailed error messages.

To inspect these errors when using older versions of `wrangler`, you should log `error?.cause?.message`.

## Error list

D1 returns the following error constants, in addition to the extended (detailed) error message:

| Error message | Description | Recommended action |
| - | - | - |
| `D1_ERROR` | Prefix of a specific D1 error. | Refer to "List of D1\_ERRORs" below for more detail about your specific error. |
| `D1_EXEC_ERROR` | Exec error in line x: y error. | |
| `D1_TYPE_ERROR` | Returned when there is a mismatch in the type between a column and a value. A common cause is supplying an `undefined` variable (unsupported) instead of `null`. | Ensure the type of the value and the column match. |
| `D1_COLUMN_NOTFOUND` | Column not found. | Ensure you have selected a column which exists in the database. |

The following table lists specific instances of `D1_ERROR`.

List of D1\_ERRORs

Retry operations

While some D1 errors can be resolved by retrying the operation, retrying is only safe if your query is idempotent (produces the same result when executed multiple times).

Before retrying any failed operation:

* Verify your query is idempotent (for example, read-only operations, or queries such as `CREATE TABLE IF NOT EXISTS`).
* Consider [implementing application-level checks](https://developers.cloudflare.com/d1/best-practices/retry-queries/) to identify if the operation can be retried, and retrying only when it is safe and necessary.

| `D1_ERROR` type | Description | Recommended action |
| - | - | - |
| `No SQL statements detected.` | The input query does not contain any SQL statements. | App action: Ensure the query contains at least one valid SQL statement. |
| `Your account has exceeded D1's maximum account storage limit, please contact Cloudflare to raise your limit.` | The total storage across all D1 databases in the account has exceeded the [account storage limit](https://developers.cloudflare.com/d1/platform/limits/). | App action: Delete unused databases, or upgrade your account to a paid plan. |
| `Exceeded maximum DB size.` | The D1 database has exceeded its [storage limit](https://developers.cloudflare.com/d1/platform/limits/). | App action: Delete data rows from the database, or shard your data into multiple databases. |
| `D1 DB reset because its code was updated.` | Cloudflare has updated the code for D1 (or the underlying Durable Object), and the Durable Object which contains the D1 database is restarting. | Retry the operation. |
| `Internal error while starting up D1 DB storage caused object to be reset.` | The Durable Object containing the D1 database is failing to start. | Retry the operation. |
| `Network connection lost.` | A network error. | Retry the operation. Refer to the "Retry operation" note above. |
| `Internal error in D1 DB storage caused object to be reset.` | An error has caused the D1 database to restart. | Retry the operation. |
| `Cannot resolve D1 DB due to transient issue on remote node.` | The query cannot reach the Durable Object containing the D1 database. | Retry the operation. Refer to the "Retry operation" note above. |
| `Can't read from request stream because client disconnected.` | A query request was made (e.g. uploading a SQL query), but the connection was closed during the query was fully executed. | App action: Retry the operation, and ensure the connection stays open. |
| `D1 DB storage operation exceeded timeout which caused object to be reset.` | A query is trying to write a large amount of information (e.g. GBs), and is taking too long. | App action: Optimize the queries (so that each query takes less time), send fewer requests by spreading the load over time, or shard the queries. |
| `D1 DB is overloaded. Requests queued for too long.` | The requests to the D1 database are queued for too long, either because there are too many requests, or the queued requests are taking too long. | App action: Optimize the queries (so that each query takes less time), send fewer requests by spreading the load over time, or shard the queries. |
| `D1 DB is overloaded. Too many requests queued.` | The request queue to the D1 database is too long, either because there are too many requests, or the queued requests are taking too long. | App action: Optimize the queries (so that each query takes less time), send fewer requests by spreading the load over time, or shard the queries. |
| `D1 DB's isolate exceeded its memory limit and was reset.` | A query loaded too much into memory, causing the D1 database to crash. | App action: Optimize the queries (so that each query takes less time), send fewer requests by spreading the load over time, or shard the queries. |
| `D1 DB exceeded its CPU time limit and was reset.` | A query is taking up a lot of CPU time (e.g. scanning over 9 GB table, or attempting a large import/export). | App action: Split the query into smaller shards. |

## Automatic retries

D1 detects read-only queries and automatically attempts up to two retries to execute those queries in the event of failures with retryable errors.

D1 ensures that any retry attempt does not cause database writes, making the automatic retries safe from side-effects, even if a query causing modifications slips through the read-only detection. D1 achieves this by checking for modifications after every query execution, and if any write occurred due to a retry attempt, the query is rolled back.

Note

Only read-only queries (queries containing only the following SQLite keywords: `SELECT`, `EXPLAIN`, `WITH`) are retried. Queries containing any [SQLite keyword](https://sqlite.org/lang_keywords.html) that leads to database writes are not retried.

## View logs

View a stream of live logs from your Worker by using [`wrangler tail`](https://developers.cloudflare.com/workers/observability/logs/real-time-logs#view-logs-using-wrangler-tail) or via the [Cloudflare dashboard](https://developers.cloudflare.com/workers/observability/logs/real-time-logs#view-logs-from-the-dashboard).

## Report issues

* To report bugs or request features, go to the [Cloudflare Community Forums](https://community.cloudflare.com/c/developers/d1/85).
* To give feedback, go to the [D1 Discord channel](https://discord.com/invite/cloudflaredev).
* If you are having issues with Wrangler, report issues in the [Wrangler GitHub repository](https://github.com/cloudflare/workers-sdk/issues/new/choose).

You should include as much of the following in any bug report:

* The ID of your database. Use `wrangler d1 list` to match a database name to its ID.
* The query (or queries) you ran when you encountered an issue. Ensure you redact any personally identifying information (PII).
* The Worker code that makes the query, including any calls to `bind()` using the [Workers Binding API](https://developers.cloudflare.com/d1/worker-api/).
* The full error text, including the content of [`error.cause.message`](#handle-errors).

## Related resources

* Learn [how to debug Workers](https://developers.cloudflare.com/workers/observability/).
* Understand how to [access logs](https://developers.cloudflare.com/workers/observability/logs/) generated from your Worker and D1.
* Use [`wrangler dev`](https://developers.cloudflare.com/workers/wrangler/commands/#dev) to run your Worker and D1 locally and [debug issues before deploying](https://developers.cloudflare.com/workers/development-testing/).

</page>

<page>
---
title: Metrics and analytics · Cloudflare D1 docs
description: D1 exposes database analytics that allow you to inspect query
  volume, query latency, and storage size across all and/or each database in
  your account.
lastUpdated: 2025-09-03T16:40:54.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/observability/metrics-analytics/
  md: https://developers.cloudflare.com/d1/observability/metrics-analytics/index.md
---

D1 exposes database analytics that allow you to inspect query volume, query latency, and storage size across all and/or each database in your account.

The metrics displayed in the [Cloudflare dashboard](https://dash.cloudflare.com/) charts are queried from Cloudflare’s [GraphQL Analytics API](https://developers.cloudflare.com/analytics/graphql-api/). You can access the metrics [programmatically](#query-via-the-graphql-api) via GraphQL or HTTP client.

## Metrics

D1 currently exports the below metrics:

| Metric | GraphQL Field Name | Description |
| - | - | - |
| Read Queries (qps) | `readQueries` | The number of read queries issued against a database. This is the raw number of read queries, and is not used for billing. |
| Write Queries (qps) | `writeQueries` | The number of write queries issued against a database. This is the raw number of write queries, and is not used for billing. |
| Rows read (count) | `rowsRead` | The number of rows read (scanned) across your queries. See [Pricing](https://developers.cloudflare.com/d1/platform/pricing/) for more details on how rows are counted. |
| Rows written (count) | `rowsWritten` | The number of rows written across your queries. |
| Query Response (bytes) | `queryBatchResponseBytes` | The total response size of the serialized query response, including any/all column names, rows and metadata. Reported in bytes. |
| Query Latency (ms) | `queryBatchTimeMs` | The total query response time, including response serialization, on the server-side. Reported in milliseconds. |
| Storage (Bytes) | `databaseSizeBytes` | Maximum size of a database. Reported in bytes. |

Metrics can be queried (and are retained) for the past 31 days.

### Row counts

D1 returns the number of rows read, rows written (or both) in response to each individual query via [the Workers Binding API](https://developers.cloudflare.com/d1/worker-api/return-object/).

Row counts are a precise count of how many rows were read (scanned) or written by that query. Inspect row counts to understand the performance and cost of a given query, including whether you can reduce the rows read [using indexes](https://developers.cloudflare.com/d1/best-practices/use-indexes/). Use query counts to understand the total volume of traffic against your databases and to discern which databases are actively in-use.

Refer to the [Pricing documentation](https://developers.cloudflare.com/d1/platform/pricing/) for more details on how rows are counted.

## View metrics in the dashboard

Per-database analytics for D1 are available in the Cloudflare dashboard. To view current and historical metrics for a database:

1. In the Cloudflare dashboard, go to the **D1** page.

   [Go to **D1 SQL database**](https://dash.cloudflare.com/?to=/:account/workers/d1)

2. Select an existing D1 database.

3. Select the **Metrics** tab.

You can optionally select a time window to query. This defaults to the last 24 hours.

## Query via the GraphQL API

You can programmatically query analytics for your D1 databases via the [GraphQL Analytics API](https://developers.cloudflare.com/analytics/graphql-api/). This API queries the same datasets as the Cloudflare dashboard, and supports GraphQL [introspection](https://developers.cloudflare.com/analytics/graphql-api/features/discovery/introspection/).

D1's GraphQL datasets require an `accountTag` filter with your Cloudflare account ID and include:

* `d1AnalyticsAdaptiveGroups`
* `d1StorageAdaptiveGroups`
* `d1QueriesAdaptiveGroups`

### Examples

To query the sum of `readQueries`, `writeQueries` for a given `$databaseId`, grouping by `databaseId` and `date`:

```graphql
query D1ObservabilitySampleQuery(
  $accountTag: string!
  $start: Date
  $end: Date
  $databaseId: string
) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      d1AnalyticsAdaptiveGroups(
        limit: 10000
        filter: { date_geq: $start, date_leq: $end, databaseId: $databaseId }
        orderBy: [date_DESC]
      ) {
        sum {
          readQueries
          writeQueries
        }
        dimensions {
          date
          databaseId
        }
      }
    }
  }
}
```

[Run in GraphQL API Explorer](https://graphql.cloudflare.com/explorer?query=I4VwpgTgngBAIgRgPICMDOkBuBDFBLAGzwBcoBlbAWwAcCwBFcaACgCgYYASbAYx4HsQAO2IAVbAHMAXDDTEIeIRICE7LnOwRiMuNmJg1nMEIAmOvQY6cTe3NgwBJM7PmKJrAJQwA3msx4wAHdIHzUOXgFhYjRmADNCfQgZbxgIwRFxaS40qMyYAF8vXw4SmBMEAEEhbAIoYjweNAqbanrMMABxCEFqGLDSmCJKEhkEAAYJsf7S+IJE5LKLAH0JMGAZTg0tABpF-SW6da5jE12bYjtHZ2tbFHswJwLpkv4IE0gAISgZAG1zsCWcAAomQAMIAXWeRWeHDQIEooQGAwgYGwJkYkACaBhJUCCn0GIUYGxSI4+RxJjwlGMaDw-CEaERpI4-xxLNu9ycOPJSJ5JT55PyQA\&variables=N4IghgxhD2CuB2AXAKmA5iAXCAggYTwHkBVAOWQH0BJAERABoQBnRMAJ0SxACYAGbgGwBafiICcDEAFN4AEy59BI7kICMvSbLCsARmCZSq87ACUAogAUAMvjMUA6lWQAJanQC+QA)

To query both the average `queryBatchTimeMs` and the 90th percentile `queryBatchTimeMs` per database:

```graphql
query D1ObservabilitySampleQuery2(
  $accountTag: string!
  $start: Date
  $end: Date
  $databaseId: string
) {
  viewer {
    accounts(filter: { accountTag: $accountId }) {
      d1AnalyticsAdaptiveGroups(
        limit: 10000
        filter: { date_geq: $start, date_leq: $end, databaseId: $databaseId }
        orderBy: [date_DESC]
      ) {
        quantiles {
          queryBatchTimeMsP90
        }
        dimensions {
          date
          databaseId
        }
      }
    }
  }
}
```

[Run in GraphQL API Explorer](https://graphql.cloudflare.com/explorer?query=I4VwpgTgngBAIgRgPICMDOkBuBDFBLAGzwBcoBlbAWwAcCwBFcaAJgAoAoGGAEmwGM+AexAA7YgBVsAcwBcMNMQh4RUgISceC7BGJy42YmA3cwIgCZ6DRrtzMHc2DAEkL8xcqnsAlDADeGzDwwAHdIPw0ufiFRYjRWADNCQwg5Xxgo4TFJWR4MmJcYAF8ffy4ymDMEAEERbAIoYjw+NCq7akbMMABxCGFqOIjymCJKEjkEAAYpicHyxIJk1IqrAH0pMGA5bi0dABplwxW6TZ5TM327YgdnV1t7FEcwAsLZssEIM0gAISg5AG1LmAVnAAKJkADCAF1XiVXlxQNgxIQwGhwkMhqBIFAvgY+AALcR4ShgACyaAACgBOGborgvWkVImmNB4QQiVGlBkHaxcy7XJ5mOFFV70sqil6FIA\&variables=N4IghgxhD2CuB2AXAKmA5iAXCAggYTwHkBVAOWQH0BJAERABoQBnRMAJ0SxACYAGbgGwBafiICcDEAFN4AEy59BI7kICMvSbLCsARmCZSq87ACUAogAUAMvjMUA6lWQAJanQC+QA)

To query your account-wide `readQueries` and `writeQueries`:

```graphql
query D1ObservabilitySampleQuery3(
  $accountTag: string!
  $start: Date
  $end: Date
  $databaseId: string
) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      d1AnalyticsAdaptiveGroups(
        limit: 10000
        filter: { date_geq: $start, date_leq: $end, databaseId: $databaseId }
      ) {
        sum {
          readQueries
          writeQueries
        }
      }
    }
  }
}
```

[Run in GraphQL API Explorer](https://graphql.cloudflare.com/explorer?query=I4VwpgTgngBAIgRgPICMDOkBuBDFBLAGzwBcoBlbAWwAcCwBFcaAZgAoAoGGAEmwGM+AexAA7YgBVsAcwBcMNMQh4RUgISceC7BGJy42YmA3cwIgCZ6DRrtzMHc2DAEkL8xcqnsAlDADeGzDwwAHdIPw0ufiFRYjRWADNCQwg5Xxgo4TFJWR4MmOyYAF8ffy4ymDMEAEERbAIoYjw+NCq7akbMMABxCGFqOIjymCJKEjkEAAYpicHyxIJk1IqrAH0pMGA5bi0dABplwxW6TZ5TM327YgdnV1t7FEcwFyLZmBLXrjQQSnChoYgwNgzIxIEE0B8ysElIYQUowOC-lxCq9keVUS9CkA\&variables=N4IghgxhD2CuB2AXAKmA5iAXCAggYTwHkBVAOWQH0BJAERABoQBnRMAJ0SxACYAGbgGwBafiICcDEAFN4AEy59BI7kICMvSbLCsARmCZSq87ACUAogAUAMvjMUA6lWQAJanQC+QA)

## Query `insights`

D1 provides metrics that let you understand and debug query performance. You can access these via GraphQL's `d1QueriesAdaptiveGroups` or `wrangler d1 insights` command.

D1 captures your query strings to make it easier to analyze metrics across query executions. [Bound parameters](https://developers.cloudflare.com/d1/worker-api/prepared-statements/#guidance) are not captured to remove any sensitive information.

Note

`wrangler d1 insights` is an experimental Wrangler command. Its options and output may change.

Run `wrangler d1 insights --help` to view current options.

| Option | Description |
| - | - |
| `--timePeriod` | Fetch data from now to the provided time period (default: `1d`). |
| `--sort-type` | The operation you want to sort insights by. Select between `sum` and `avg` (default: `sum`). |
| `--sort-by` | The field you want to sort insights by. Select between `time`, `reads`, `writes`, and `count` (default: `time`). |
| `--sort-direction` | The sort direction. Select between `ASC` and `DESC` (default: `DESC`). |
| `--json` | A boolean value to specify whether to return the result as clean JSON (default: `false`). |
| `--limit` | The maximum number of queries to be fetched. |

To find top 3 queries by execution count:

```sh
npx wrangler d1 insights <database_name> --sort-type=sum --sort-by=count --limit=3
```

```sh
 ⛅️ wrangler 3.95.0
-------------------


-------------------
🚧 `wrangler d1 insights` is an experimental command.
🚧 Flags for this command, their descriptions, and output may change between wrangler versions.
-------------------


[
  {
    "query": "SELECT tbl_name as name,\n                   (SELECT ncol FROM pragma_table_list(tbl_name)) as num_columns\n            FROM sqlite_master\n            WHERE TYPE = \"table\"\n              AND tbl_name NOT LIKE \"sqlite_%\"\n              AND tbl_name NOT LIKE \"d1_%\"\n              AND tbl_name NOT LIKE \"_cf_%\"\n            ORDER BY tbl_name ASC;",
    "avgRowsRead": 2,
    "totalRowsRead": 4,
    "avgRowsWritten": 0,
    "totalRowsWritten": 0,
    "avgDurationMs": 0.49505,
    "totalDurationMs": 0.9901,
    "numberOfTimesRun": 2,
    "queryEfficiency": 0
  },
  {
    "query": "SELECT * FROM Customers",
    "avgRowsRead": 4,
    "totalRowsRead": 4,
    "avgRowsWritten": 0,
    "totalRowsWritten": 0,
    "avgDurationMs": 0.1873,
    "totalDurationMs": 0.1873,
    "numberOfTimesRun": 1,
    "queryEfficiency": 1
  },
  {
    "query": "SELECT * From Customers",
    "avgRowsRead": 0,
    "totalRowsRead": 0,
    "avgRowsWritten": 0,
    "totalRowsWritten": 0,
    "avgDurationMs": 1.0225,
    "totalDurationMs": 1.0225,
    "numberOfTimesRun": 1,
    "queryEfficiency": 0
  }
]
```

To find top 3 queries by average execution time:

```sh
npx wrangler d1 insights <database_name> --sort-type=avg --sort-by=time --limit=3
```

```sh
⛅️ wrangler 3.95.0
-------------------


-------------------
🚧 `wrangler d1 insights` is an experimental command.
🚧 Flags for this command, their descriptions, and output may change between wrangler versions.
-------------------


[
  {
    "query": "SELECT * From Customers",
    "avgRowsRead": 0,
    "totalRowsRead": 0,
    "avgRowsWritten": 0,
    "totalRowsWritten": 0,
    "avgDurationMs": 1.0225,
    "totalDurationMs": 1.0225,
    "numberOfTimesRun": 1,
    "queryEfficiency": 0
  },
  {
    "query": "SELECT tbl_name as name,\n                   (SELECT ncol FROM pragma_table_list(tbl_name)) as num_columns\n            FROM sqlite_master\n            WHERE TYPE = \"table\"\n              AND tbl_name NOT LIKE \"sqlite_%\"\n              AND tbl_name NOT LIKE \"d1_%\"\n              AND tbl_name NOT LIKE \"_cf_%\"\n            ORDER BY tbl_name ASC;",
    "avgRowsRead": 2,
    "totalRowsRead": 4,
    "avgRowsWritten": 0,
    "totalRowsWritten": 0,
    "avgDurationMs": 0.49505,
    "totalDurationMs": 0.9901,
    "numberOfTimesRun": 2,
    "queryEfficiency": 0
  },
  {
    "query": "SELECT * FROM Customers",
    "avgRowsRead": 4,
    "totalRowsRead": 4,
    "avgRowsWritten": 0,
    "totalRowsWritten": 0,
    "avgDurationMs": 0.1873,
    "totalDurationMs": 0.1873,
    "numberOfTimesRun": 1,
    "queryEfficiency": 1
  }
]
```

To find top 10 queries by rows written in last 7 days:

```sh
npx wrangler d1 insights <database_name> --sort-type=sum --sort-by=writes --limit=10 --timePeriod=7d
```

```sh
⛅️ wrangler 3.95.0
-------------------


-------------------
🚧 `wrangler d1 insights` is an experimental command.
🚧 Flags for this command, their descriptions, and output may change between wrangler versions.
-------------------


[
  {
    "query": "SELECT * FROM Customers",
    "avgRowsRead": 4,
    "totalRowsRead": 4,
    "avgRowsWritten": 0,
    "totalRowsWritten": 0,
    "avgDurationMs": 0.1873,
    "totalDurationMs": 0.1873,
    "numberOfTimesRun": 1,
    "queryEfficiency": 1
  },
  {
    "query": "SELECT * From Customers",
    "avgRowsRead": 0,
    "totalRowsRead": 0,
    "avgRowsWritten": 0,
    "totalRowsWritten": 0,
    "avgDurationMs": 1.0225,
    "totalDurationMs": 1.0225,
    "numberOfTimesRun": 1,
    "queryEfficiency": 0
  },
  {
    "query": "SELECT tbl_name as name,\n                   (SELECT ncol FROM pragma_table_list(tbl_name)) as num_columns\n            FROM sqlite_master\n            WHERE TYPE = \"table\"\n              AND tbl_name NOT LIKE \"sqlite_%\"\n              AND tbl_name NOT LIKE \"d1_%\"\n              AND tbl_name NOT LIKE \"_cf_%\"\n            ORDER BY tbl_name ASC;",
    "avgRowsRead": 2,
    "totalRowsRead": 4,
    "avgRowsWritten": 0,
    "totalRowsWritten": 0,
    "avgDurationMs": 0.49505,
    "totalDurationMs": 0.9901,
    "numberOfTimesRun": 2,
    "queryEfficiency": 0
  }
]
```

Note

The quantity `queryEfficiency` measures how efficient your query was. It is calculated as: the number of rows returned divided by the number of rows read.

Generally, you should try to get `queryEfficiency` as close to `1` as possible. Refer to [Use indexes](https://developers.cloudflare.com/d1/best-practices/use-indexes/) for more information on efficient querying.

</page>

<page>
---
title: Alpha database migration guide · Cloudflare D1 docs
description: D1's open beta launched in October 2023, and newly created
  databases use a different underlying architecture that is significantly more
  reliable and performant, with increased database sizes, improved query
  throughput, and reduced latency.
lastUpdated: 2025-07-23T15:37:48.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/platform/alpha-migration/
  md: https://developers.cloudflare.com/d1/platform/alpha-migration/index.md
---

Warning

D1 alpha databases stopped accepting live SQL queries on August 22, 2024.

D1's open beta launched in October 2023, and newly created databases use a different underlying architecture that is significantly more reliable and performant, with increased database sizes, improved query throughput, and reduced latency.

This guide will instruct you to recreate alpha D1 databases on our production-ready system.

## Prerequisites

1. You have the [`wrangler` command-line tool](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed
2. You are using `wrangler` version `3.33.0` or later (released March 2024) as earlier versions do not have the [`--remote` flag](https://developers.cloudflare.com/d1/platform/release-notes/#2024-03-12) required as part of this guide
3. An 'alpha' D1 database. All databases created before July 27th, 2023 ([release notes](https://developers.cloudflare.com/d1/platform/release-notes/#2024-03-12)) use the alpha storage backend, which is no longer supported and was not recommended for production.

## 1. Verify that a database is alpha

```sh
npx wrangler d1 info <database_name>
```

If the database is alpha, the output of the command will include `version` set to `alpha`:

```plaintext
...
│ version           │ alpha                                 │
...
```

## 2. Create a manual backup

```sh
npx wrangler d1 backup create <alpha_database_name>
```

## 3. Download the manual backup

The command below will download the manual backup of the alpha database as `.sqlite3` file:

```sh
npx wrangler d1 backup download <alpha_database_name> <backup_id> # See available backups with wrangler d1 backup list <database_name>
```

## 4. Convert the manual backup into SQL statements

The command below will convert the manual backup of the alpha database from the downloaded `.sqlite3` file into SQL statements which can then be imported into the new database:

```sh
sqlite3 db_dump.sqlite3 .dump > db.sql
```

Once you have run the above command, you will need to edit the output SQL file to be compatible with D1:

1. Remove `BEGIN TRANSACTION` and `COMMIT;` from the file.

2. Remove the following table creation statement:

   ```sql
   CREATE TABLE _cf_KV (
      key TEXT PRIMARY KEY,
      value BLOB
   ) WITHOUT ROWID;
   ```

## 5. Create a new D1 database

All new D1 databases use the updated architecture by default.

Run the following command to create a new database:

```sh
npx wrangler d1 create <new_database_name>
```

## 6. Run SQL statements against the new D1 database

```sh
npx wrangler d1 execute <new_database_name> --remote --file=./db.sql
```

## 7. Delete your alpha database

To delete your previous alpha database, run:

```sh
npx wrangler d1 delete <alpha_database_name>
```

</page>

<page>
---
title: Limits · Cloudflare D1 docs
description: Cloudflare also offers other storage solutions such as Workers KV,
  Durable Objects, and R2. Each product has different advantages and limits.
  Refer to Choose a data or storage product to review which storage option is
  right for your use case.
lastUpdated: 2026-02-08T13:47:49.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/platform/limits/
  md: https://developers.cloudflare.com/d1/platform/limits/index.md
---

| Feature | Limit |
| - | - |
| Databases per account | 50,000 (Workers Paid) [1](#user-content-fn-1) / 10 (Free) |
| Maximum database size | 10 GB (Workers Paid) / 500 MB (Free) |
| Maximum storage per account | 1 TB (Workers Paid) [2](#user-content-fn-2) / 5 GB (Free) |
| [Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/) duration (point-in-time recovery) | 30 days (Workers Paid) / 7 days (Free) |
| Maximum Time Travel restore operations | 10 restores per 10 minutes (per database) |
| Queries per Worker invocation (read [subrequest limits](https://developers.cloudflare.com/workers/platform/limits/#how-many-subrequests-can-i-make)) | 1000 (Workers Paid) / 50 (Free) |
| Maximum number of columns per table | 100 |
| Maximum number of rows per table | Unlimited (excluding per-database storage limits) |
| Maximum string, `BLOB` or table row size | 2,000,000 bytes (2 MB) |
| Maximum SQL statement length | 100,000 bytes (100 KB) |
| Maximum bound parameters per query | 100 |
| Maximum arguments per SQL function | 32 |
| Maximum characters (bytes) in a `LIKE` or `GLOB` pattern | 50 bytes |
| Maximum bindings per Workers script | Approximately 5,000 [3](#user-content-fn-3) |
| Maximum SQL query duration | 30 seconds [4](#user-content-fn-4) |
| Maximum file import (`d1 execute`) size | 5 GB [5](#user-content-fn-5) |

Batch limits

Limits for individual queries (listed above) apply to each individual statement contained within a batch statement. For example, the maximum SQL statement length of 100 KB applies to each statement inside a `db.batch()`.

Cloudflare also offers other storage solutions such as [Workers KV](https://developers.cloudflare.com/kv/api/), [Durable Objects](https://developers.cloudflare.com/durable-objects/), and [R2](https://developers.cloudflare.com/r2/get-started/). Each product has different advantages and limits. Refer to [Choose a data or storage product](https://developers.cloudflare.com/workers/platform/storage-options/) to review which storage option is right for your use case.

Need a higher limit?

To request an adjustment to a limit, complete the [Limit Increase Request Form](https://forms.gle/ukpeZVLWLnKeixDu7). If the limit can be increased, Cloudflare will contact you with next steps.

## Frequently Asked Questions

Frequently asked questions related to D1 limits:

### How much work can a D1 database do?

D1 is designed for horizontal scale out across multiple, smaller (10 GB) databases, such as per-user, per-tenant or per-entity databases. D1 allows you to build applications with thousands of databases at no extra cost, as the pricing is based only on query and storage costs.

#### Storage

Each D1 database can store up to 10 GB of data.

Warning

Note that the 10 GB limit of a D1 database cannot be further increased.

#### Concurrency and throughput

Each individual D1 database is inherently single-threaded, and processes queries one at a time.

Your maximum throughput is directly related to the duration of your queries.

* If your average query takes 1 ms, you can run approximately 1,000 queries per second.
* If your average query takes 100 ms, you can run 10 queries per second.

A database that receives too many concurrent requests will first attempt to queue them. If the queue becomes full, the database will return an ["overloaded" error](https://developers.cloudflare.com/d1/observability/debug-d1/#error-list).

Each individual D1 database is backed by a single [Durable Object](https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/). When using [D1 read replication](https://developers.cloudflare.com/d1/best-practices/read-replication/#primary-database-instance-vs-read-replicas) each replica instance is a different Durable Object and the guidelines apply to each replica instance independently.

#### Query performance

Query performance is the most important factor for throughput. As a rough guideline:

* Read queries like `SELECT name FROM users WHERE id = ?` with an appropriate index on `id` will take less than a millisecond for SQL duration.
* Write queries like `INSERT` or `UPDATE` can take several milliseconds for SQL duration, and depend on the number of rows written. Writes need to be durably persisted across several locations - learn more on [how D1 persists data under the hood](https://blog.cloudflare.com/d1-read-replication-beta/#under-the-hood-how-d1-read-replication-is-implemented).
* Data migrations like a large `UPDATE` or `DELETE` affecting millions of rows must be run in batches. A single query that attempts to modify hundreds of thousands of rows or hundreds of MBs of data at once will exceed execution limits. Break the work into smaller chunks (e.g., processing 1,000 rows at a time) to stay within platform limits.

To ensure your queries are fast and efficient, [use appropriate indexes in your SQL schema](https://developers.cloudflare.com/d1/best-practices/use-indexes/).

#### CPU and memory

Operations on a D1 database, including query execution and result serialization, run within the [Workers platform CPU and memory limits](https://developers.cloudflare.com/workers/platform/limits/#memory).

Exceeding these limits, or hitting other platform limits, will generate errors. Refer to the [D1 error list for more details](https://developers.cloudflare.com/d1/observability/debug-d1/#error-list).

### How many simultaneous connections can a Worker open to D1?

You can open up to six connections (to D1) simultaneously for each invocation of your Worker.

For more information on a Worker's simultaneous connections, refer to [Simultaneous open connections](https://developers.cloudflare.com/workers/platform/limits/#simultaneous-open-connections).

## Footnotes

1. The maximum number of databases per account can be increased by request on Workers Paid and Enterprise plans, with support for millions to tens-of-millions of databases (or more) per account. Refer to the guidance on limit increases on this page to request an increase. [↩](#user-content-fnref-1)

2. The maximum storage per account can be increased by request on Workers Paid and Enterprise plans. Refer to the guidance on limit increases on this page to request an increase. [↩](#user-content-fnref-2)

3. A single Worker script can have up to 1 MB of script metadata. A binding is defined as a binding to a resource, such as a D1 database, KV namespace, [environmental variable](https://developers.cloudflare.com/workers/configuration/environment-variables/), or secret. Each resource binding is approximately 150-bytes, however environmental variables and secrets are controlled by the size of the value you provide. Excluding environmental variables, you can bind up to \~5,000 D1 databases to a single Worker script. [↩](#user-content-fnref-3)

4. Requests to Cloudflare API must resolve in 30 seconds. Therefore, this duration limit also applies to the entire batch call. [↩](#user-content-fnref-4)

5. The imported file is uploaded to R2. Refer to [R2 upload limit](https://developers.cloudflare.com/r2/platform/limits). [↩](#user-content-fnref-5)

</page>

<page>
---
title: Pricing · Cloudflare D1 docs
description: "D1 bills based on:"
lastUpdated: 2025-07-23T15:37:48.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/platform/pricing/
  md: https://developers.cloudflare.com/d1/platform/pricing/index.md
---

D1 bills based on:

* **Usage**: Queries you run against D1 will count as rows read, rows written, or both (for transactions or batches).
* **Scale-to-zero**: You are not billed for hours or capacity units. If you are not running queries against your database, you are not billed for compute.
* **Storage**: You are only billed for storage above the included [limits](https://developers.cloudflare.com/d1/platform/limits/) of your plan.

## Billing metrics

| | [Workers Free](https://developers.cloudflare.com/workers/platform/pricing/#workers) | [Workers Paid](https://developers.cloudflare.com/workers/platform/pricing/#workers) |
| - | - | - |
| Rows read | 5 million / day | First 25 billion / month included + $0.001 / million rows |
| Rows written | 100,000 / day | First 50 million / month included + $1.00 / million rows |
| Storage (per GB stored) | 5 GB (total) | First 5 GB included + $0.75 / GB-mo |

Track your D1 usage

To accurately track your usage, use the [meta object](https://developers.cloudflare.com/d1/worker-api/return-object/), [GraphQL Analytics API](https://developers.cloudflare.com/d1/observability/metrics-analytics/#query-via-the-graphql-api), or the [Cloudflare dashboard](https://dash.cloudflare.com/?to=/:account/workers/d1/). Select your D1 database, then view: Metrics > Row Metrics.

### Definitions

1. Rows read measure how many rows a query reads (scans), regardless of the size of each row. For example, if you have a table with 5000 rows and run a `SELECT * FROM table` as a full table scan, this would count as 5,000 rows read. A query that filters on an [unindexed column](https://developers.cloudflare.com/d1/best-practices/use-indexes/) may return fewer rows to your Worker, but is still required to read (scan) more rows to determine which subset to return.
2. Rows written measure how many rows were written to D1 database. Write operations include `INSERT`, `UPDATE`, and `DELETE`. Each of these operations contribute towards rows written. A query that `INSERT` 10 rows into a `users` table would count as 10 rows written.
3. DDL operations (for example, `CREATE`, `ALTER`, and `DROP`) are used to define or modify the structure of a database. They may contribute to a mix of read rows and write rows. Ensure you are accurately tracking your usage through the available tools ([meta object](https://developers.cloudflare.com/d1/worker-api/return-object/), [GraphQL Analytics API](https://developers.cloudflare.com/d1/observability/metrics-analytics/#query-via-the-graphql-api), or the [Cloudflare dashboard](https://dash.cloudflare.com/?to=/:account/workers/d1/)).
4. Row size or the number of columns in a row does not impact how rows are counted. A row that is 1 KB and a row that is 100 KB both count as one row.
5. Defining [indexes](https://developers.cloudflare.com/d1/best-practices/use-indexes/) on your table(s) reduces the number of rows read by a query when filtering on that indexed field. For example, if the `users` table has an index on a timestamp column `created_at`, the query `SELECT * FROM users WHERE created_at > ?1` would only need to read a subset of the table.
6. Indexes will add an additional written row when writes include the indexed column, as there are two rows written: one to the table itself, and one to the index. The performance benefit of an index and reduction in rows read will, in nearly all cases, offset this additional write.
7. Storage is based on gigabytes stored per month, and is based on the sum of all databases in your account. Tables and indexes both count towards storage consumed.
8. Free limits reset daily at 00:00 UTC. Monthly included limits reset based on your monthly subscription renewal date, which is determined by the day you first subscribed.
9. There are no data transfer (egress) or throughput (bandwidth) charges for data accessed from D1.
10. [Read replication](https://developers.cloudflare.com/d1/best-practices/read-replication/) does not charge extra for read replicas. You incur the same usage billing based on `rows_read` and `rows_written` by your queries.

## Frequently Asked Questions

Frequently asked questions related to D1 pricing:

### Will D1 always have a Free plan?

Yes, the [Workers Free plan](https://developers.cloudflare.com/workers/platform/pricing/#workers) will always include the ability to prototype and experiment with D1 for free.

### What happens if I exceed the daily limits on reads and writes, or the total storage limit, on the Free plan?

When your account hits the daily read and/or write limits, you will not be able to run queries against D1. D1 API will return errors to your client indicating that your daily limits have been exceeded. Once you have reached your included storage limit, you will need to delete unused databases or clean up stale data before you can insert new data, create or alter tables or create indexes and triggers.

Upgrading to the Workers Paid plan will remove these limits, typically within minutes.

### What happens if I exceed the monthly included reads, writes and/or storage on the paid tier?

You will be billed for the additional reads, writes and storage according to [D1's pricing metrics](#billing-metrics).

### How can I estimate my (eventual) bill?

Every query returns a `meta` object that contains a total count of the rows read (`rows_read`) and rows written (`rows_written`) by that query. For example, a query that performs a full table scan (for instance, `SELECT * FROM users`) from a table with 5000 rows would return a `rows_read` value of `5000`:

```json
"meta": {
  "duration": 0.20472300052642825,
  "size_after": 45137920,
  "rows_read": 5000,
  "rows_written": 0
}
```

These are also included in the D1 [Cloudflare dashboard](https://dash.cloudflare.com) and the [analytics API](https://developers.cloudflare.com/d1/observability/metrics-analytics/), allowing you to attribute read and write volumes to specific databases, time periods, or both.

### Does D1 charge for data transfer / egress?

No.

### Does D1 charge additional for additional compute?

D1 itself does not charge for additional compute. Workers querying D1 and computing results: for example, serializing results into JSON and/or running queries, are billed per [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/#workers), in addition to your D1 specific usage.

### Do queries I run from the dashboard or Wrangler (the CLI) count as billable usage?

Yes, any queries you run against your database, including inserting (`INSERT`) existing data into a new database, table scans (`SELECT * FROM table`), or creating indexes count as either reads or writes.

### Can I use an index to reduce the number of rows read by a query?

Yes, you can use an index to reduce the number of rows read by a query. [Creating indexes](https://developers.cloudflare.com/d1/best-practices/use-indexes/) for your most queried tables and filtered columns reduces how much data is scanned and improves query performance at the same time. If you have a read-heavy workload (most common), this can be particularly advantageous. Writing to columns referenced in an index will add at least one (1) additional row written to account for updating the index, but this is typically offset by the reduction in rows read due to the benefits of an index.

### Does a freshly created database, and/or an empty table with no rows, contribute to my storage?

Yes, although minimal. An empty table consumes at least a few kilobytes, based on the number of columns (table width) in the table. An empty database consumes approximately 12 KB of storage.

</page>

<page>
---
title: Release notes · Cloudflare D1 docs
description: Subscribe to RSS
lastUpdated: 2025-07-23T15:37:48.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/platform/release-notes/
  md: https://developers.cloudflare.com/d1/platform/release-notes/index.md
---

[Subscribe to RSS](https://developers.cloudflare.com/d1/platform/release-notes/index.xml)

## 2025-11-05

**D1 can configure jurisdictions for data localization**

You can now set a [jurisdiction](https://developers.cloudflare.com/d1/configuration/data-location/) when creating a D1 database to guarantee where your database runs and stores data.

## 2025-09-11

**D1 automatically retries read-only queries**

D1 now detects read-only queries and automatically attempts up to two retries to execute those queries in the event of failures with retryable errors. You can access the number of execution attempts in the returned [response metadata](https://developers.cloudflare.com/d1/worker-api/return-object/#d1result) property `total_attempts`.

At the moment, only read-only queries are retried, that is, queries containing only the following SQLite keywords: `SELECT`, `EXPLAIN`, `WITH`. Queries containing any [SQLite keyword](https://sqlite.org/lang_keywords.html) that leads to database writes are not retried.

The retry success ratio among read-only retryable errors varies from 5% all the way up to 95%, depending on the underlying error and its duration (like network errors or other internal errors).

The retry success ratio among all retryable errors is lower, indicating that there are write-queries that could be retried. Therefore, we recommend D1 users to continue applying [retries in their own code](https://developers.cloudflare.com/d1/best-practices/retry-queries/) for queries that are not read-only but are idempotent according to the business logic of the application.

![D1 automatically query retries success ratio](https://developers.cloudflare.com/_astro/d1-auto-retry-success-ratio.yPw8B0tB_Z1kzKe0.webp)

D1 ensures that any retry attempt does not cause database writes, making the automatic retries safe from side-effects, even if a query causing changes slips through the read-only detection. D1 achieves this by checking for modifications after every query execution, and if any write occurred due to a retry attempt, the query is rolled back.

The read-only query detection heuristics are simple for now, and there is room for improvement to capture more cases of queries that can be retried, so this is just the beginning.

## 2025-07-01

**Maximum D1 storage per account for the Workers paid plan is now 1 TB**

The maximum D1 storage per account for users on the Workers paid plan has been increased from 250 GB to 1 TB.

## 2025-07-01

**D1 alpha database backup access removed**

Following the removal of query access to D1 alpha databases on [2024-08-23](https://developers.cloudflare.com/d1/platform/release-notes/#2024-08-23), D1 alpha database backups can no longer be accessed or created with [`wrangler d1 backup`](https://developers.cloudflare.com/d1/reference/backups/), available with wrangler v3.

If you want to retain a backup of your D1 alpha database, please use `wrangler d1 backup` before 2025-07-01. A D1 alpha backup can be used to [migrate](https://developers.cloudflare.com/d1/platform/alpha-migration/#5-create-a-new-d1-database) to a newly created D1 database in its generally available state.

## 2025-05-30

**50-500ms Faster D1 REST API Requests**

Users using Cloudflare's [REST API](https://developers.cloudflare.com/api/resources/d1/) to query their D1 database can see lower end-to-end request latency now that D1 authentication is performed at the closest Cloudflare network data center that received the request. Previously, authentication required D1 REST API requests to proxy to Cloudflare's core, centralized data centers, which added network round trips and latency.

Latency improvements range from 50-500 ms depending on request location and [database location](https://developers.cloudflare.com/d1/configuration/data-location/) and only apply to the REST API. REST API requests and databases outside the United States see a bigger benefit since Cloudflare's primary core data centers reside in the United States.

D1 query endpoints like `/query` and `/raw` have the most noticeable improvements since they no longer access Cloudflare's core data centers. D1 control plane endpoints such as those to create and delete databases see smaller improvements, since they still require access to Cloudflare's core data centers for other control plane metadata.

## 2025-05-02

**D1 HTTP API permissions bug fix**

A permissions bug that allowed Cloudflare account and user [API tokens](https://developers.cloudflare.com/fundamentals/api/get-started/account-owned-tokens/) with `D1:Read` permission and `Edit` permission on another Cloudflare product to perform D1 database writes is fixed. `D1:Edit` permission is required for any database writes via HTTP API.

If you were using an existing API token without `D1:Edit` permission to make edits to a D1 database via the HTTP API, then you will need to [create or edit API tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/) to explicitly include `D1:Edit` permission.

## 2025-04-10

**D1 Read Replication Public Beta**

D1 read replication is available in public beta to help lower average latency and increase overall throughput for read-heavy applications like e-commerce websites or content management tools.

Workers can leverage read-only database copies, called read replicas, by using D1 [Sessions API](https://developers.cloudflare.com/d1/best-practices/read-replication). A session encapsulates all the queries from one logical session for your application. For example, a session may correspond to all queries coming from a particular web browser session. With Sessions API, D1 queries in a session are guaranteed to be [sequentially consistent](https://developers.cloudflare.com/d1/best-practices/read-replication/#replica-lag-and-consistency-model) to avoid data consistency pitfalls. D1 [bookmarks](https://developers.cloudflare.com/d1/reference/time-travel/#bookmarks) can be used from a previous session to ensure logical consistency between sessions.

```ts
// retrieve bookmark from previous session stored in HTTP header
const bookmark = request.headers.get("x-d1-bookmark") ?? "first-unconstrained";

const session = env.DB.withSession(bookmark);
const result = await session
  .prepare(`SELECT * FROM Customers WHERE CompanyName = 'Bs Beverages'`)
  .run();
// store bookmark for a future session
response.headers.set("x-d1-bookmark", session.getBookmark() ?? "");
```

Read replicas are automatically created by Cloudflare (currently one in each supported [D1 region](https://developers.cloudflare.com/d1/best-practices/read-replication/#read-replica-locations)), are active/inactive based on query traffic, and are transparently routed to by Cloudflare at no additional cost.

To checkout D1 read replication, deploy the following Worker code using Sessions API, which will prompt you to create a D1 database and enable read replication on said database.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/d1-starter-sessions-api)

To learn more about how read replication was implemented, go to our [blog post](https://blog.cloudflare.com/d1-read-replication-beta).

## 2025-02-19

**D1 supports \`PRAGMA optimize\`**

D1 now supports `PRAGMA optimize` command, which can improve database query performance. It is recommended to run this command after a schema change (for example, after creating an index). Refer to [`PRAGMA optimize`](https://developers.cloudflare.com/d1/sql-api/sql-statements/#pragma-optimize) for more information.

## 2025-02-04

**Fixed bug with D1 read-only access via UI and /query REST API.**

Fixed a bug with D1 permissions which allowed users with read-only roles via the UI and users with read-only API tokens via the `/query` [REST API](https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/query/) to execute queries that modified databases. UI actions via the `Tables` tab, such as creating and deleting tables, were incorrectly allowed with read-only access. However, UI actions via the `Console` tab were not affected by this bug and correctly required write access.

Write queries with read-only access will now fail. If you relied on the previous incorrect behavior, please assign the correct roles to users or permissions to API tokens to perform D1 write queries.

## 2025-01-13

**D1 will begin enforcing its free tier limits from the 10th of February 2025.**

D1 will begin enforcing the daily [free tier limits](https://developers.cloudflare.com/d1/platform/limits) from 2025-02-10. These limits only apply to accounts on the Workers Free plan.

From 2025-02-10, if you do not take any action and exceed the daily free tier limits, queries to D1 databases via the Workers API and/or REST API will return errors until limits reset daily at 00:00 UTC.

To ensure uninterrupted service, upgrade your account to the [Workers Paid plan](https://developers.cloudflare.com/workers/platform/pricing/) from the [plans page](https://dash.cloudflare.com/?account=/workers/plans). The minimum monthly billing amount is $5. Refer to [Workers Paid plan](https://developers.cloudflare.com/workers/platform/pricing/) and [D1 limits](https://developers.cloudflare.com/d1/platform/limits/).

For better insight into your current usage, refer to your [billing metrics](https://developers.cloudflare.com/d1/observability/billing/) for rows read and rows written, which can be found on the [D1 dashboard](https://dash.cloudflare.com/?account=/workers/d1) or GraphQL API.

## 2025-01-07

**D1 Worker API request latency decreases by 40-60%.**

D1 lowered end-to-end Worker API request latency by 40-60% by eliminating redundant network round trips for each request.

![D1 Worker API latency](https://developers.cloudflare.com/images/d1/faster-d1-worker-api.png)

*p50, p90, and p95 request latency aggregated across entire D1 service. These latencies are a reference point and should not be viewed as your exact workload improvement.*

For each request to a D1 database, at least two network round trips were eliminated. One round trip was due to a bug that is now fixed. The remaining removed round trips are due to avoiding creating a new TCP connection for each request when reaching out to the datacenter hosting the database.

The removal of redundant network round trips also applies to D1's [REST API](https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/query/). However, the REST API still depends on Cloudflare's centralized datacenters for authentication, which reduces the relative performance improvement.

## 2024-08-23

**D1 alpha databases have stopped accepting SQL queries**

Following the [deprecation warning](https://developers.cloudflare.com/d1/platform/release-notes/#2024-04-30) on 2024-04-30, D1 alpha databases have stopped accepting queries (you are still able to create and retrieve backups).

Requests to D1 alpha databases now respond with a HTTP 400 error, containing the following text:

`You can no longer query a D1 alpha database. Please follow https://developers.cloudflare.com/d1/platform/alpha-migration/ to migrate your alpha database and resume querying.`

You can upgrade to the new, generally available version of D1 by following the [alpha database migration guide](https://developers.cloudflare.com/d1/platform/alpha-migration/).

## 2024-07-26

**Fixed bug in TypeScript typings for run() API**

The `run()` method as part of the [D1 Client API](https://developers.cloudflare.com/d1/worker-api/) had an incorrect (outdated) type definition, which has now been addressed as of [`@cloudflare/workers-types`](https://www.npmjs.com/package/@cloudflare/workers-types) version `4.20240725.0`.

The correct type definition is `stmt.run<T>(): D1Result`, as `run()` returns the result rows of the query. The previously *incorrect* type definition was `stmt.run(): D1Response`, which only returns query metadata and no results.

## 2024-06-17

**HTTP API now returns a HTTP 429 error for overloaded D1 databases**

Previously, D1's [HTTP API](https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/query/) returned a HTTP `500 Internal Server` error for queries that came in while a D1 database was overloaded. These requests now correctly return a `HTTP 429 Too Many Requests` error.

D1's [Workers API](https://developers.cloudflare.com/d1/worker-api/) is unaffected by this change.

## 2024-04-30

**D1 alpha databases will stop accepting live SQL queries on August 15, 2024**

Previously [deprecated alpha](https://developers.cloudflare.com/d1/platform/release-notes/#2024-04-05) D1 databases need to be migrated by August 15, 2024 to accept new queries.

Refer to [alpha database migration guide](https://developers.cloudflare.com/d1/platform/alpha-migration/) to migrate to the new, generally available, database architecture.

## 2024-04-12

**HTTP API now returns a HTTP 400 error for invalid queries**

Previously, D1's [HTTP API](https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/query/) returned a HTTP `500 Internal Server` error for an invalid query. An invalid SQL query now correctly returns a `HTTP 400 Bad Request` error.

D1's [Workers API](https://developers.cloudflare.com/d1/worker-api/) is unaffected by this change.

## 2024-04-05

**D1 alpha databases are deprecated**

Now that D1 is generally available and production ready, alpha D1 databases are deprecated and should be migrated for better performance, reliability, and ongoing support.

Refer to [alpha database migration guide](https://developers.cloudflare.com/d1/platform/alpha-migration/) to migrate to the new, generally available, database architecture.

## 2024-04-01

**D1 is generally available**

D1 is now generally available and production ready. Read the [blog post](https://blog.cloudflare.com/building-d1-a-global-database/) for more details on new features in GA and to learn more about the upcoming D1 read replication API.

* Developers with a Workers Paid plan now have a 10GB GB per-database limit (up from 2GB), which can be combined with existing limit of 50,000 databases per account.
* Developers with a Workers Free plan retain the 500 MB per-database limit and can create up to 10 databases per account.
* D1 databases can be [exported](https://developers.cloudflare.com/d1/best-practices/import-export-data/#export-an-existing-d1-database) as a SQL file.

## 2024-03-12

**Change in \`wrangler d1 execute\` default**

As of `wrangler@3.33.0`, `wrangler d1 execute` and `wrangler d1 migrations apply` now default to using a local database, to match the default behavior of `wrangler dev`.

It is also now possible to specify one of `--local` or `--remote` to explicitly tell wrangler which environment you wish to run your commands against.

## 2024-03-05

**Billing for D1 usage**

As of 2024-03-05, D1 usage will start to be counted and may incur charges for an account's future billing cycle.

Developers on the Workers Paid plan with D1 usage beyond [included limits](https://developers.cloudflare.com/d1/platform/pricing/#billing-metrics) will incur charges according to [D1's pricing](https://developers.cloudflare.com/d1/platform/pricing).

Developers on the Workers Free plan can use up to the included limits. Usage beyond the limits below requires signing up for the $5/month Workers Paid plan.

Account billable metrics are available in the [Cloudflare Dashboard](https://dash.cloudflare.com) and [GraphQL API](https://developers.cloudflare.com/d1/observability/metrics-analytics/#metrics).

## 2024-02-16

**API changes to \`run()\`**

A previous change (made on 2024-02-13) to the `run()` [query statement method](https://developers.cloudflare.com/d1/worker-api/prepared-statements/#run) has been reverted.

`run()` now returns a `D1Result`, including the result rows, matching its original behavior prior to the change on 2024-02-13.

Future change to `run()` to return a [`D1ExecResult`](https://developers.cloudflare.com/d1/worker-api/return-object/#d1execresult), as originally intended and documented, will be gated behind a [compatibility date](https://developers.cloudflare.com/workers/configuration/compatibility-dates/) as to avoid breaking existing Workers relying on the way `run()` currently works.

## 2024-02-13

**API changes to \`raw()\`, \`all()\` and \`run()\`**

D1's `raw()`, `all()` and `run()` [query statement methods](https://developers.cloudflare.com/d1/worker-api/prepared-statements/) have been updated to reflect their intended behavior and improve compatibility with ORM libraries.

`raw()` now correctly returns results as an array of arrays, allowing the correct handling of duplicate column names (such as when joining tables), as compared to `all()`, which is unchanged and returns an array of objects. To include an array of column names in the results when using `raw()`, use `raw({columnNames: true})`.

`run()` no longer incorrectly returns a `D1Result` and instead returns a [`D1ExecResult`](https://developers.cloudflare.com/d1/worker-api/return-object/#d1execresult) as originally intended and documented.

This may be a breaking change for some applications that expected `raw()` to return an array of objects.

Refer to [D1 client API](https://developers.cloudflare.com/d1/worker-api/) to review D1's query methods, return types and TypeScript support in detail.

## 2024-01-18

**Support for LIMIT on UPDATE and DELETE statements**

D1 now supports adding a `LIMIT` clause to `UPDATE` and `DELETE` statements, which allows you to limit the impact of a potentially dangerous operation.

## 2023-12-18

**Legacy alpha automated backups disabled**

Databases using D1's legacy alpha backend will no longer run automated [hourly backups](https://developers.cloudflare.com/d1/reference/backups/). You may still choose to take manual backups of these databases.

The D1 team recommends moving to D1's new [production backend](https://developers.cloudflare.com/d1/platform/release-notes/#2023-09-28), which will require you to export and import your existing data. D1's production backend is faster than the original alpha backend. The new backend also supports [Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/), which allows you to restore your database to any minute in the past 30 days without relying on hourly or manual snapshots.

## 2023-10-03

**Create up to 50,000 D1 databases**

Developers using D1 on a Workers Paid plan can now create up to 50,000 databases as part of ongoing increases to D1's limits.

* This further enables database-per-user use-cases and allows you to isolate data between customers.
* Total storage per account is now 50 GB.
* D1's [analytics and metrics](https://developers.cloudflare.com/d1/observability/metrics-analytics/) provide per-database usage data.

If you need to create more than 50,000 databases or need more per-account storage, [reach out](https://developers.cloudflare.com/d1/platform/limits/) to the D1 team to discuss.

## 2023-09-28

**The D1 public beta is here**

D1 is now in public beta, and storage limits have been increased:

* Developers with a Workers Paid plan now have a 2 GB per-database limit (up from 500 MB) and can create 25 databases per account (up from 10). These limits will continue to increase automatically during the public beta.
* Developers with a Workers Free plan retain the 500 MB per-database limit and can create up to 10 databases per account.

Databases must be using D1's [new storage subsystem](https://developers.cloudflare.com/d1/platform/release-notes/#2023-07-27) to benefit from the increased database limits.

Read the [announcement blog](https://blog.cloudflare.com/d1-open-beta-is-here/) for more details about what is new in the beta and what is coming in the future for D1.

## 2023-08-19

**Row count now returned per query**

D1 now returns a count of `rows_written` and `rows_read` for every query executed, allowing you to assess the cost of query for both [pricing](https://developers.cloudflare.com/d1/platform/pricing/) and [index optimization](https://developers.cloudflare.com/d1/best-practices/use-indexes/) purposes.

The `meta` object returned in [D1's Client API](https://developers.cloudflare.com/d1/worker-api/return-object/#d1result) contains a total count of the rows read (`rows_read`) and rows written (`rows_written`) by that query. For example, a query that performs a full table scan (for example, `SELECT * FROM users`) from a table with 5000 rows would return a `rows_read` value of `5000`:

```json
"meta": {
  "duration": 0.20472300052642825,
  "size_after": 45137920,
  "rows_read": 5000,
  "rows_written": 0
}
```

Refer to [D1 pricing documentation](https://developers.cloudflare.com/d1/platform/pricing/) to understand how reads and writes are measured. D1 remains free to use during the alpha period.

## 2023-08-09

**Bind D1 from the Cloudflare dashboard**

You can now [bind a D1 database](https://developers.cloudflare.com/d1/get-started/#3-bind-your-worker-to-your-d1-database) to your Workers directly in the [Cloudflare dashboard](https://dash.cloudflare.com). To bind D1 from the Cloudflare dashboard, select your Worker project -> **Settings** -> **Variables** -> and select **D1 Database Bindings**.

Note: If you have previously deployed a Worker with a D1 database binding with a version of `wrangler` prior to `3.5.0`, you must upgrade to [`wrangler v3.5.0`](https://github.com/cloudflare/workers-sdk/releases/tag/wrangler%403.5.0) first before you can edit your D1 database bindings in the Cloudflare dashboard. New Workers projects do not have this limitation.

Legacy D1 alpha users who had previously prefixed their database binding manually with `__D1_BETA__` should remove this as part of this upgrade. Your Worker scripts should call your D1 database via `env.BINDING_NAME` only. Refer to the latest [D1 getting started guide](https://developers.cloudflare.com/d1/get-started/#3-bind-your-worker-to-your-d1-database) for best practices.

We recommend all D1 alpha users begin using wrangler `3.5.0` (or later) to benefit from improved TypeScript types and future D1 API improvements.

## 2023-08-01

**Per-database limit now 500 MB**

Databases using D1's [new storage subsystem](https://developers.cloudflare.com/d1/platform/release-notes/#2023-07-27) can now grow to 500 MB each, up from the previous 100 MB limit. This applies to both existing and newly created databases.

Refer to [Limits](https://developers.cloudflare.com/d1/platform/limits/) to learn about D1's limits.

## 2023-07-27

**New default storage subsystem**

Databases created via the Cloudflare dashboard and Wrangler (as of `v3.4.0`) now use D1's new storage subsystem by default. The new backend can [be 6 - 20x faster](https://blog.cloudflare.com/d1-turning-it-up-to-11/) than D1's original alpha backend.

To understand which storage subsystem your database uses, run `wrangler d1 info YOUR_DATABASE` and inspect the version field in the output.

Databases with `version: beta` use the new storage backend and support the [Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/) API. Databases with `version: alpha` only use D1's older, legacy backend.

## 2023-07-27

**Time Travel**

[Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/) is now available. Time Travel allows you to restore a D1 database back to any minute within the last 30 days (Workers Paid plan) or 7 days (Workers Free plan), at no additional cost for storage or restore operations.

Refer to the [Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/) documentation to learn how to travel backwards in time.

Databases using D1's [new storage subsystem](https://blog.cloudflare.com/d1-turning-it-up-to-11/) can use Time Travel. Time Travel replaces the [snapshot-based backups](https://developers.cloudflare.com/d1/reference/backups/) used for legacy alpha databases.

## 2023-06-28

**Metrics and analytics**

You can now view [per-database metrics](https://developers.cloudflare.com/d1/observability/metrics-analytics/) via both the [Cloudflare dashboard](https://dash.cloudflare.com/) and the [GraphQL Analytics API](https://developers.cloudflare.com/analytics/graphql-api/).

D1 currently exposes read & writes per second, query response size, and query latency percentiles.

## 2023-06-16

**Generated columns documentation**

New documentation has been published on how to use D1's support for [generated columns](https://developers.cloudflare.com/d1/reference/generated-columns/) to define columns that are dynamically generated on write (or read). Generated columns allow you to extract data from [JSON objects](https://developers.cloudflare.com/d1/sql-api/query-json/) or use the output of other SQL functions.

## 2023-06-12

**Deprecating Error.cause**

As of [`wrangler v3.1.1`](https://github.com/cloudflare/workers-sdk/releases/tag/wrangler%403.1.1) the [D1 client API](https://developers.cloudflare.com/d1/worker-api/) now returns [detailed error messages](https://developers.cloudflare.com/d1/observability/debug-d1/) within the top-level `Error.message` property, and no longer requires developers to inspect the `Error.cause.message` property.

To facilitate a transition from the previous `Error.cause` behaviour, detailed error messages will continue to be populated within `Error.cause` as well as the top-level `Error` object until approximately July 14th, 2023. Future versions of both `wrangler` and the D1 client API will no longer populate `Error.cause` after this date.

## 2023-05-19

**New experimental backend**

D1 has a new experimental storage back end that dramatically improves query throughput, latency and reliability. The experimental back end will become the default back end in the near future. To create a database using the experimental backend, use `wrangler` and set the `--experimental-backend` flag when creating a database:

```sh
$ wrangler d1 create your-database --experimental-backend
```

Read more about the experimental back end in the [announcement blog](https://blog.cloudflare.com/d1-turning-it-up-to-11/).

## 2023-05-19

**Location hints**

You can now provide a [location hint](https://developers.cloudflare.com/d1/configuration/data-location/) when creating a D1 database, which will influence where the leader (writer) is located. By default, D1 will automatically create your database in a location close to where you issued the request to create a database. In most cases this allows D1 to choose the optimal location for your database on your behalf.

## 2023-05-17

**Query JSON**

[New documentation](https://developers.cloudflare.com/d1/sql-api/query-json/) has been published that covers D1's extensive JSON function support. JSON functions allow you to parse, query and modify JSON directly from your SQL queries, reducing the number of round trips to your database, or data queried.

</page>

<page>
---
title: Choose a data or storage product · Cloudflare D1 docs
lastUpdated: 2025-07-23T15:37:48.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/platform/storage-options/
  md: https://developers.cloudflare.com/d1/platform/storage-options/index.md
---


</page>

<page>
---
title: Backups (Legacy) · Cloudflare D1 docs
description: D1 has built-in support for creating and restoring backups of your
  databases with wrangler v3, including support for scheduled automatic backups
  and manual backup management.
lastUpdated: 2025-06-20T15:14:49.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/reference/backups/
  md: https://developers.cloudflare.com/d1/reference/backups/index.md
---

D1 has built-in support for creating and restoring backups of your databases with wrangler v3, including support for scheduled automatic backups and manual backup management.

Planned removal

Access to snapshot based backups for D1 alpha databases described in this documentation will be removed on [2025-07-01](https://developers.cloudflare.com/d1/platform/release-notes/#2025-07-01).

Time Travel

Databases using D1's [production storage subsystem](https://blog.cloudflare.com/d1-turning-it-up-to-11/) can use Time Travel point-in-time recovery. [Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/) replaces the snapshot based backups used for legacy alpha databases.

To understand which storage subsystem your database uses, run `wrangler d1 info YOUR_DATABASE` and check for the `version` field in the output.Databases with `version: alpha` only support the older, snapshot based backup API.

## Automatic backups

D1 automatically backs up your databases every hour on your behalf, and [retains backups for 24 hours](https://developers.cloudflare.com/d1/platform/limits/). Backups will block access to the DB while they are running. In most cases this should only be a second or two, and any requests that arrive during the backup will be queued.

To view and manage these backups, including any manual backups you have made, you can use the `d1 backup list <DATABASE_NAME>` command to list each backup.

For example, to list all of the backups of a D1 database named `existing-db`:

```sh
wrangler d1 backup list existing-db
```

```sh
┌──────────────┬──────────────────────────────────────┬────────────┬─────────┐
│ created_at   │ id                                   │ num_tables │ size    │
├──────────────┼──────────────────────────────────────┼────────────┼─────────┤
│ 1 hour ago   │ 54a23309-db00-4c5c-92b1-c977633b937c │ 1          │ 95.3 kB │
├──────────────┼──────────────────────────────────────┼────────────┼─────────┤
│ <...>        │ <...>                                │ <...>      │ <...>   │
├──────────────┼──────────────────────────────────────┼────────────┼─────────┤
│ 2 months ago │ 8433a91e-86d0-41a3-b1a3-333b080bca16 │ 1          │ 65.5 kB │
└──────────────┴──────────────────────────────────────┴────────────┴─────────┘%
```

The `id` of each backup allows you to download or restore a specific backup.

## Manually back up a database

Creating a manual backup of your database before making large schema changes, manually inserting or deleting data, or otherwise modifying a database you are actively using is a good practice to get into. D1 allows you to make a backup of a database at any time, and stores the backup on your behalf. You should also consider [using migrations](https://developers.cloudflare.com/d1/reference/migrations/) to simplify changes to an existing database.

To back up a D1 database, you must have:

1. The Cloudflare [Wrangler CLI installed](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
2. An existing D1 database you want to back up.

For example, to create a manual backup of a D1 database named `example-db`, call `d1 backup create`.

```sh
wrangler d1 backup create example-db
```

```sh
┌─────────────────────────────┬──────────────────────────────────────┬────────────┬─────────┬───────┐
│ created_at                  │ id                                   │ num_tables │ size    │ state │
├─────────────────────────────┼──────────────────────────────────────┼────────────┼─────────┼───────┤
│ 2023-02-04T15:49:36.113753Z │ 123a81a2-ab91-4c2e-8ebc-64d69633faf1 │ 1          │ 65.5 kB │ done  │
└─────────────────────────────┴──────────────────────────────────────┴────────────┴─────────┴───────┘
```

Larger databases, especially those that are several megabytes (MB) in size with many tables, may take a few seconds to backup. The `state` column in the output will let you know when the backup is done.

## Downloading a backup locally

To download a backup locally, call `wrangler d1 backup download <DATABASE_NAME> <BACKUP_ID>`. Use `wrangler d1 backup list <DATABASE_NAME>` to list the available backups, including their IDs, for a given D1 database.

For example, to download a specific backup for a database named `example-db`:

```sh
wrangler d1 backup download example-db 123a81a2-ab91-4c2e-8ebc-64d69633faf1
```

```sh
🌀 Downloading backup 123a81a2-ab91-4c2e-8ebc-64d69633faf1 from 'example-db'
🌀 Saving to /Users/you/projects/example-db.123a81a2.sqlite3
🌀 Done!
```

The database backup will be download to the current working directory in native SQLite3 format. To import a local database, read [the documentation on importing data](https://developers.cloudflare.com/d1/best-practices/import-export-data/) to D1.

## Restoring a backup

Warning

Restoring a backup will overwrite the existing version of your D1 database in-place. We recommend you make a manual backup before you restore a database, so that you have a backup to revert to if you accidentally restore the wrong backup or break your application.

Restoring a backup will overwrite the current running version of a database with the backup. Database tables (and their data) that do not exist in the backup will no longer exist in the current version of the database, and queries that rely on them will fail.

To restore a previous backup of a D1 database named `existing-db`, pass the ID of that backup to `d1 backup restore`:

```sh
wrangler d1 backup restore existing-db  6cceaf8c-ceab-4351-ac85-7f9e606973e3
```

```sh
Restoring existing-db from backup 6cceaf8c-ceab-4351-ac85-7f9e606973e3....
Done!
```

Any queries against the database will immediately query the current (restored) version once the restore has completed.

</page>

<page>
---
title: Community projects · Cloudflare D1 docs
description: Members of the Cloudflare developer community and broader developer
  ecosystem have built and/or contributed tooling — including ORMs (Object
  Relational Mapper) libraries, query builders, and CLI tools — that build on
  top of D1.
lastUpdated: 2026-01-19T10:20:59.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/reference/community-projects/
  md: https://developers.cloudflare.com/d1/reference/community-projects/index.md
---

Members of the Cloudflare developer community and broader developer ecosystem have built and/or contributed tooling — including ORMs (Object Relational Mapper) libraries, query builders, and CLI tools — that build on top of D1.

Note

Community projects are not maintained by the Cloudflare D1 team. They are managed and updated by the project authors.

## Projects

### Sutando ORM

Sutando is an ORM designed for Node.js. With Sutando, each table in a database has a corresponding model that handles CRUD (Create, Read, Update, Delete) operations.

* [GitHub](https://github.com/sutandojs/sutando)
* [D1 with Sutando ORM Example](https://github.com/sutandojs/sutando-examples/tree/main/typescript/rest-hono-cf-d1)

### knex-cloudflare-d1

knex-cloudflare-d1 is the Cloudflare D1 dialect for Knex.js. Note that this is not an official dialect provided by Knex.js.

* [GitHub](https://github.com/kiddyuchina/knex-cloudflare-d1)

### Prisma ORM

[Prisma ORM](https://www.prisma.io/orm) is a next-generation JavaScript and TypeScript ORM that unlocks a new level of developer experience when working with databases thanks to its intuitive data model, automated migrations, type-safety and auto-completion.

* [Tutorial](https://developers.cloudflare.com/d1/tutorials/d1-and-prisma-orm/)
* [Docs](https://www.prisma.io/docs/orm/prisma-client/deployment/edge/deploy-to-cloudflare#d1)

### D1 adapter for Kysely ORM

Kysely is a type-safe and autocompletion-friendly typescript SQL query builder. With this adapter you can interact with D1 with the familiar Kysely interface.

* [Kysely GitHub](https://github.com/koskimas/kysely)
* [D1 adapter](https://github.com/aidenwallis/kysely-d1)

### feathers-kysely

The `feathers-kysely` database adapter follows the FeathersJS Query Syntax standard and works with any framework. It is built on the D1 adapter for Kysely and supports passing queries directly from client applications. Since the FeathersJS query syntax is a subset of MongoDB's syntax, this is a great tool for MongoDB users to use Cloudflare D1 without previous SQL experience.

* [feathers-kysely on npm](https://www.npmjs.com/package/feathers-kysely)
* [feathers-kysely on GitHub](https://github.com/marshallswain/feathers-kysely)

### Drizzle ORM

Drizzle is a headless TypeScript ORM with a head which runs on Node, Bun and Deno. Drizzle ORM lives on the Edge and it is a JavaScript ORM too. It comes with a drizzle-kit CLI companion for automatic SQL migrations generation. Drizzle automatically generates your D1 schema based on types you define in TypeScript, and exposes an API that allows you to query your database directly.

* [Docs](https://orm.drizzle.team/docs)
* [GitHub](https://github.com/drizzle-team/drizzle-orm)
* [D1 example](https://orm.drizzle.team/docs/connect-cloudflare-d1)

### Flyweight

Flyweight is an ORM designed specifically for databases related to SQLite. It has first-class D1 support that includes the ability to batch queries and integrate with the wrangler migration system.

* [GitHub](https://github.com/thebinarysearchtree/flyweight)

### workers-qb

`workers-qb` is a zero-dependency query builder that provides a simple standardized interface while keeping the benefits and speed of using raw queries over a traditional ORM. While not intended to provide ORM-like functionality, `workers-qb` makes it easier to interact with your database from code for direct SQL access.

* [GitHub](https://github.com/G4brym/workers-qb)
* [Documentation](https://workers-qb.massadas.com/)

### d1-console

Instead of running the `wrangler d1 execute` command in your terminal every time you want to interact with your database, you can interact with D1 from within the `d1-console`. Created by a Discord Community Champion, this gives the benefit of executing multi-line queries, obtaining command history, and viewing a cleanly formatted table output.

* [GitHub](https://github.com/isaac-mcfadyen/d1-console)

### L1

`L1` is a package that brings some Cloudflare Worker ecosystem bindings into PHP and Laravel via the Cloudflare API. It provides interaction with D1 via PDO, KV and Queues, with more services to add in the future, making PHP integration with Cloudflare a real breeze.

* [GitHub](https://github.com/renoki-co/l1)
* [Packagist](https://packagist.org/packages/renoki-co/l1)

### Staff Directory - a D1-based demo

Staff Directory is a demo project using D1, [HonoX](https://github.com/honojs/honox), and [Cloudflare Pages](https://developers.cloudflare.com/pages/). It uses D1 to store employee data, and is an example of a full-stack application built on top of D1.

* [GitHub](https://github.com/lauragift21/staff-directory)
* [D1 functionality](https://github.com/lauragift21/staff-directory/blob/main/app/db.ts)

### NuxtHub

`NuxtHub` is a Nuxt module that brings Cloudflare Worker bindings into your Nuxt application with no configuration. It leverages the [Wrangler Platform Proxy](https://developers.cloudflare.com/workers/wrangler/api/#getplatformproxy) in development and direct binding in production to interact with [D1](https://developers.cloudflare.com/d1/), [KV](https://developers.cloudflare.com/kv/) and [R2](https://developers.cloudflare.com/r2/) with server composables (`hubDatabase()`, `hubKV()` and `hubBlob()`).

`NuxtHub` also provides a way to use your remote D1 database in development using the `npx nuxt dev --remote` command.

* [GitHub](https://github.com/nuxt-hub/core)
* [Documentation](https://hub.nuxt.com)
* [Example](https://github.com/Atinux/nuxt-todos-edge)

## Feedback

To report a bug or file feature requests for these community projects, create an issue directly on the project's repository.

</page>

<page>
---
title: Data security · Cloudflare D1 docs
description: "This page details the data security properties of D1, including:"
lastUpdated: 2024-08-13T19:56:56.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/reference/data-security/
  md: https://developers.cloudflare.com/d1/reference/data-security/index.md
---

This page details the data security properties of D1, including:

* Encryption-at-rest (EAR).
* Encryption-in-transit (EIT).
* Cloudflare's compliance certifications.

## Encryption at Rest

All objects stored in D1, including metadata, live databases, and inactive databases are encrypted at rest. Encryption and decryption are automatic, do not require user configuration to enable, and do not impact the effective performance of D1.

Encryption keys are managed by Cloudflare and securely stored in the same key management systems we use for managing encrypted data across Cloudflare internally.

Objects are encrypted using [AES-256](https://www.cloudflare.com/learning/ssl/what-is-encryption/), a widely tested, highly performant and industry-standard encryption algorithm. D1 uses GCM (Galois/Counter Mode) as its preferred mode.

## Encryption in Transit

Data transfer between a Cloudflare Worker, and/or between nodes within the Cloudflare network and D1 is secured using the same [Transport Layer Security](https://www.cloudflare.com/learning/ssl/transport-layer-security-tls/) (TLS/SSL).

API access via the HTTP API or using the [wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) command-line interface is also over TLS/SSL (HTTPS).

## Compliance

To learn more about Cloudflare's adherence to industry-standard security compliance certifications, visit the Cloudflare [Trust Hub](https://www.cloudflare.com/trust-hub/compliance-resources/).

</page>

<page>
---
title: FAQs · Cloudflare D1 docs
description: Yes, the Workers Free plan will always include the ability to
  prototype and experiment with D1 for free.
lastUpdated: 2025-07-23T15:37:48.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/reference/faq/
  md: https://developers.cloudflare.com/d1/reference/faq/index.md
---

## Pricing

### Will D1 always have a Free plan?

Yes, the [Workers Free plan](https://developers.cloudflare.com/workers/platform/pricing/#workers) will always include the ability to prototype and experiment with D1 for free.

### What happens if I exceed the daily limits on reads and writes, or the total storage limit, on the Free plan?

When your account hits the daily read and/or write limits, you will not be able to run queries against D1. D1 API will return errors to your client indicating that your daily limits have been exceeded. Once you have reached your included storage limit, you will need to delete unused databases or clean up stale data before you can insert new data, create or alter tables or create indexes and triggers.

Upgrading to the Workers Paid plan will remove these limits, typically within minutes.

### What happens if I exceed the monthly included reads, writes and/or storage on the paid tier?

You will be billed for the additional reads, writes and storage according to [D1's pricing metrics](#billing-metrics).

### How can I estimate my (eventual) bill?

Every query returns a `meta` object that contains a total count of the rows read (`rows_read`) and rows written (`rows_written`) by that query. For example, a query that performs a full table scan (for instance, `SELECT * FROM users`) from a table with 5000 rows would return a `rows_read` value of `5000`:

```json
"meta": {
  "duration": 0.20472300052642825,
  "size_after": 45137920,
  "rows_read": 5000,
  "rows_written": 0
}
```

These are also included in the D1 [Cloudflare dashboard](https://dash.cloudflare.com) and the [analytics API](https://developers.cloudflare.com/d1/observability/metrics-analytics/), allowing you to attribute read and write volumes to specific databases, time periods, or both.

### Does D1 charge for data transfer / egress?

No.

### Does D1 charge additional for additional compute?

D1 itself does not charge for additional compute. Workers querying D1 and computing results: for example, serializing results into JSON and/or running queries, are billed per [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/#workers), in addition to your D1 specific usage.

### Do queries I run from the dashboard or Wrangler (the CLI) count as billable usage?

Yes, any queries you run against your database, including inserting (`INSERT`) existing data into a new database, table scans (`SELECT * FROM table`), or creating indexes count as either reads or writes.

### Can I use an index to reduce the number of rows read by a query?

Yes, you can use an index to reduce the number of rows read by a query. [Creating indexes](https://developers.cloudflare.com/d1/best-practices/use-indexes/) for your most queried tables and filtered columns reduces how much data is scanned and improves query performance at the same time. If you have a read-heavy workload (most common), this can be particularly advantageous. Writing to columns referenced in an index will add at least one (1) additional row written to account for updating the index, but this is typically offset by the reduction in rows read due to the benefits of an index.

### Does a freshly created database, and/or an empty table with no rows, contribute to my storage?

Yes, although minimal. An empty table consumes at least a few kilobytes, based on the number of columns (table width) in the table. An empty database consumes approximately 12 KB of storage.

## Limits

### How much work can a D1 database do?

D1 is designed for horizontal scale out across multiple, smaller (10 GB) databases, such as per-user, per-tenant or per-entity databases. D1 allows you to build applications with thousands of databases at no extra cost, as the pricing is based only on query and storage costs.

#### Storage

Each D1 database can store up to 10 GB of data.

Warning

Note that the 10 GB limit of a D1 database cannot be further increased.

#### Concurrency and throughput

Each individual D1 database is inherently single-threaded, and processes queries one at a time.

Your maximum throughput is directly related to the duration of your queries.

* If your average query takes 1 ms, you can run approximately 1,000 queries per second.
* If your average query takes 100 ms, you can run 10 queries per second.

A database that receives too many concurrent requests will first attempt to queue them. If the queue becomes full, the database will return an ["overloaded" error](https://developers.cloudflare.com/d1/observability/debug-d1/#error-list).

Each individual D1 database is backed by a single [Durable Object](https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/). When using [D1 read replication](https://developers.cloudflare.com/d1/best-practices/read-replication/#primary-database-instance-vs-read-replicas) each replica instance is a different Durable Object and the guidelines apply to each replica instance independently.

#### Query performance

Query performance is the most important factor for throughput. As a rough guideline:

* Read queries like `SELECT name FROM users WHERE id = ?` with an appropriate index on `id` will take less than a millisecond for SQL duration.
* Write queries like `INSERT` or `UPDATE` can take several milliseconds for SQL duration, and depend on the number of rows written. Writes need to be durably persisted across several locations - learn more on [how D1 persists data under the hood](https://blog.cloudflare.com/d1-read-replication-beta/#under-the-hood-how-d1-read-replication-is-implemented).
* Data migrations like a large `UPDATE` or `DELETE` affecting millions of rows must be run in batches. A single query that attempts to modify hundreds of thousands of rows or hundreds of MBs of data at once will exceed execution limits. Break the work into smaller chunks (e.g., processing 1,000 rows at a time) to stay within platform limits.

To ensure your queries are fast and efficient, [use appropriate indexes in your SQL schema](https://developers.cloudflare.com/d1/best-practices/use-indexes/).

#### CPU and memory

Operations on a D1 database, including query execution and result serialization, run within the [Workers platform CPU and memory limits](https://developers.cloudflare.com/workers/platform/limits/#memory).

Exceeding these limits, or hitting other platform limits, will generate errors. Refer to the [D1 error list for more details](https://developers.cloudflare.com/d1/observability/debug-d1/#error-list).

### How many simultaneous connections can a Worker open to D1?

You can open up to six connections (to D1) simultaneously for each invocation of your Worker.

For more information on a Worker's simultaneous connections, refer to [Simultaneous open connections](https://developers.cloudflare.com/workers/platform/limits/#simultaneous-open-connections).

</page>

<page>
---
title: Glossary · Cloudflare D1 docs
description: Review the definitions for terms used across Cloudflare's D1 documentation.
lastUpdated: 2025-02-24T09:30:25.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/reference/glossary/
  md: https://developers.cloudflare.com/d1/reference/glossary/index.md
---

Review the definitions for terms used across Cloudflare's D1 documentation.

| Term | Definition |
| - | - |
| bookmark | A bookmark represents the state of a database at a specific point in time.- Bookmarks are lexicographically sortable. Sorting orders a list of bookmarks from oldest-to-newest. |
| primary database instance | The primary database instance is the original instance of a database. This database instance only exists in one location in the world. |
| query planner | A component in a database management system which takes a user query and generates the most efficient plan of executing that query (the query plan). For example, the query planner decides which indices to use, or which table to access first. |
| read replica | A read replica is an eventually-replicated copy of the primary database instance which only serve read requests. There may be multiple read replicas for a single primary database instance. |
| replica lag | The time it takes for the primary database instance to replicate its changes to a specific read replica. |
| session | A session encapsulates all the queries from one logical session for your application. For example, a session may correspond to all queries coming from a particular web browser session. |

</page>

<page>
---
title: Generated columns · Cloudflare D1 docs
description: D1 allows you to define generated columns based on the values of
  one or more other columns, SQL functions, or even extracted JSON values.
lastUpdated: 2024-12-11T09:43:45.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/reference/generated-columns/
  md: https://developers.cloudflare.com/d1/reference/generated-columns/index.md
---

D1 allows you to define generated columns based on the values of one or more other columns, SQL functions, or even [extracted JSON values](https://developers.cloudflare.com/d1/sql-api/query-json/).

This allows you to normalize your data as you write to it or read it from a table, making it easier to query and reducing the need for complex application logic.

Generated columns can also have [indexes defined](https://developers.cloudflare.com/d1/best-practices/use-indexes/) against them, which can dramatically increase query performance over frequently queried fields.

## Types of generated columns

There are two types of generated columns:

* `VIRTUAL` (default): the column is generated when read. This has the benefit of not consuming storage, but can increase compute time (and thus reduce query performance), especially for larger queries.
* `STORED`: the column is generated when the row is written. The column takes up storage space just as a regular column would, but the column does not need to be generated on every read, which can improve read query performance.

When omitted from a generated column expression, generated columns default to the `VIRTUAL` type. The `STORED` type is recommended when the generated column is compute intensive. For example, when parsing large JSON structures.

## Define a generated column

Generated columns can be defined during table creation in a `CREATE TABLE` statement or afterwards via the `ALTER TABLE` statement.

To create a table that defines a generated column, you use the `AS` keyword:

```sql
CREATE TABLE some_table (
    -- other columns omitted
    some_generated_column AS <function_that_generates_the_column_data>
)
```

As a concrete example, to automatically extract the `location` value from the following JSON sensor data, you can define a generated column called `location` (of type `TEXT`), based on a `raw_data` column that stores the raw representation of our JSON data.

```json
{
    "measurement": {
        "temp_f": "77.4",
        "aqi": [21, 42, 58],
        "o3": [18, 500],
        "wind_mph": "13",
        "location": "US-NY"
    }
}
```

To define a generated column with the value of `$.measurement.location`, you can use the [`json_extract`](https://developers.cloudflare.com/d1/sql-api/query-json/#extract-values) function to extract the value from the `raw_data` column each time you write to that row:

```sql
CREATE TABLE sensor_readings (
    event_id INTEGER PRIMARY KEY,
    timestamp INTEGER NOT NULL,
    raw_data TEXT,
    location as (json_extract(raw_data, '$.measurement.location')) STORED
);
```

Generated columns can optionally be specified with the `column_name GENERATED ALWAYS AS <function> [STORED|VIRTUAL]` syntax. The `GENERATED ALWAYS` syntax is optional and does not change the behavior of the generated column when omitted.

## Add a generated column to an existing table

A generated column can also be added to an existing table. If the `sensor_readings` table did not have the generated `location` column, you could add it by running an `ALTER TABLE` statement:

```sql
ALTER TABLE sensor_readings
ADD COLUMN location as (json_extract(raw_data, '$.measurement.location'));
```

This defines a `VIRTUAL` generated column that runs `json_extract` on each read query.

Generated column definitions cannot be directly modified. To change how a generated column generates its data, you can use `ALTER TABLE table_name REMOVE COLUMN` and then `ADD COLUMN` to re-define the generated column, or `ALTER TABLE table_name RENAME COLUMN current_name TO new_name` to rename the existing column before calling `ADD COLUMN` with a new definition.

## Examples

Generated columns are not just limited to JSON functions like `json_extract`: you can use almost any available function to define how a generated column is generated.

For example, you could generate a `date` column based on the `timestamp` column from the previous `sensor_reading` table, automatically converting a Unix timestamp into a `YYYY-MM-dd` format within your database:

```sql
ALTER TABLE your_table
-- date(timestamp, 'unixepoch') converts a Unix timestamp to a YYYY-MM-dd formatted date
ADD COLUMN formatted_date AS (date(timestamp, 'unixepoch'))
```

Alternatively, you could define an `expires_at` column that calculates a future date, and filter on that date in your queries:

```sql
-- Filter out "expired" results based on your generated column:
-- SELECT * FROM your_table WHERE current_date() > expires_at
ALTER TABLE your_table
-- calculates a date (YYYY-MM-dd) 30 days from the timestamp.
ADD COLUMN expires_at AS (date(timestamp, '+30 days'));
```

## Additional considerations

* Tables must have at least one non-generated column. You cannot define a table with only generated column(s).
* Expressions can only reference other columns in the same table and row, and must only use [deterministic functions](https://www.sqlite.org/deterministic.html). Functions like `random()`, sub-queries or aggregation functions cannot be used to define a generated column.
* Columns added to an existing table via `ALTER TABLE ... ADD COLUMN` must be `VIRTUAL`. You cannot add a `STORED` column to an existing table.

</page>

<page>
---
title: Migrations · Cloudflare D1 docs
description: Database migrations are a way of versioning your database. Each
  migration is stored as an .sql file in your migrations folder. The migrations
  folder is created in your project directory when you create your first
  migration. This enables you to store and track changes throughout database
  development.
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/reference/migrations/
  md: https://developers.cloudflare.com/d1/reference/migrations/index.md
---

Database migrations are a way of versioning your database. Each migration is stored as an `.sql` file in your `migrations` folder. The `migrations` folder is created in your project directory when you create your first migration. This enables you to store and track changes throughout database development.

## Features

Currently, the migrations system aims to be simple yet effective. With the current implementation, you can:

* [Create](https://developers.cloudflare.com/workers/wrangler/commands/#d1-migrations-create) an empty migration file.
* [List](https://developers.cloudflare.com/workers/wrangler/commands/#d1-migrations-list) unapplied migrations.
* [Apply](https://developers.cloudflare.com/workers/wrangler/commands/#d1-migrations-apply) remaining migrations.

Every migration file in the `migrations` folder has a specified version number in the filename. Files are listed in sequential order. Every migration file is an SQL file where you can specify queries to be run.

Binding name vs Database name

When running a migration script, you can use either the binding name or the database name.

However, the binding name can change, whereas the database name cannot. Therefore, to avoid accidentally running migrations on the wrong binding, you may wish to use the database name for D1 migrations.

## Wrangler customizations

By default, migrations are created in the `migrations/` folder in your Worker project directory. Creating migrations will keep a record of applied migrations in the `d1_migrations` table found in your database.

This location and table name can be customized in your Wrangler file, inside the D1 binding.

* wrangler.jsonc

  ```jsonc
  {
    "d1_databases": [
      {
        "binding": "<BINDING_NAME>", // i.e. if you set this to "DB", it will be available in your Worker at `env.DB`
        "database_name": "<DATABASE_NAME>",
        "database_id": "<UUID>",
        "preview_database_id": "<UUID>",
        "migrations_table": "<d1_migrations>", // Customize this value to change your applied migrations table name
        "migrations_dir": "<FOLDER_NAME>" // Specify your custom migration directory
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  [[d1_databases]]
  binding = "<BINDING_NAME>"
  database_name = "<DATABASE_NAME>"
  database_id = "<UUID>"
  preview_database_id = "<UUID>"
  migrations_table = "<d1_migrations>"
  migrations_dir = "<FOLDER_NAME>"
  ```

## Foreign key constraints

When applying a migration, you may need to temporarily disable [foreign key constraints](https://developers.cloudflare.com/d1/sql-api/foreign-keys/). To do so, call `PRAGMA defer_foreign_keys = true` before making changes that would violate foreign keys.

Refer to the [foreign key documentation](https://developers.cloudflare.com/d1/sql-api/foreign-keys/) to learn more about how to work with foreign keys and D1.

</page>

<page>
---
title: Time Travel and backups · Cloudflare D1 docs
description: Time Travel is D1's approach to backups and point-in-time-recovery,
  and allows you to restore a database to any minute within the last 30 days.
lastUpdated: 2025-07-07T12:53:47.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/reference/time-travel/
  md: https://developers.cloudflare.com/d1/reference/time-travel/index.md
---

Time Travel is D1's approach to backups and point-in-time-recovery, and allows you to restore a database to any minute within the last 30 days.

* You do not need to enable Time Travel. It is always on.
* Database history and restoring a database incur no additional costs.
* Time Travel automatically creates [bookmarks](#bookmarks) on your behalf. You do not need to manually trigger or remember to initiate a backup.

By not having to rely on scheduled backups and/or manually initiated backups, you can go back in time and restore a database prior to a failed migration or schema change, a `DELETE` or `UPDATE` statement without a specific `WHERE` clause, and in the future, fork/copy a production database directly.

Support for Time Travel

Databases using D1's [new storage subsystem](https://blog.cloudflare.com/d1-turning-it-up-to-11/) can use Time Travel. Time Travel replaces the [snapshot-based backups](https://developers.cloudflare.com/d1/reference/backups/) used for legacy alpha databases.

To understand which storage subsystem your database uses, run `wrangler d1 info YOUR_DATABASE` and inspect the `version` field in the output. Databases with `version: production` support the new Time Travel API. Databases with `version: alpha` only support the older, snapshot-based backup API.

## Bookmarks

Time Travel leverages D1's concept of a bookmark to restore to a point in time.

* Bookmarks older than 30 days are invalid and cannot be used as a restore point.
* Restoring a database to a specific bookmark does not remove or delete older bookmarks. For example, if you restore to a bookmark representing the state of your database 10 minutes ago, and determine that you needed to restore to an earlier point in time, you can still do so.
* Bookmarks are lexicographically sortable. Sorting orders a list of bookmarks from oldest-to-newest.
* Bookmarks can be derived from a [Unix timestamp](https://en.wikipedia.org/wiki/Unix_time) (seconds since Jan 1st, 1970), and conversion between a specific timestamp and a bookmark is deterministic (stable).

Bookmarks are also leveraged by [Sessions API](https://developers.cloudflare.com/d1/best-practices/read-replication/#sessions-api-examples) to ensure sequential consistency within a Session.

## Timestamps

Time Travel supports two timestamp formats:

* [Unix timestamps](https://developer.mozilla.org/en-US/docs/Glossary/Unix_time), which correspond to seconds since January 1st, 1970 at midnight. This is always in UTC.
* The [JavaScript date-time string format](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format), which is a simplified version of the ISO-8601 timestamp format. An valid date-time string for the July 27, 2023 at 11:18AM in Americas/New\_York (EST) would look like `2023-07-27T11:18:53.000-04:00`.

## Requirements

* [`Wrangler`](https://developers.cloudflare.com/workers/wrangler/install-and-update/) `v3.4.0` or later installed to use Time Travel commands.
* A database on D1's production backend. You can check whether a database is using this backend via `wrangler d1 info DB_NAME` - the output show `version: production`.

## Retrieve a bookmark

You can retrieve a bookmark for the current timestamp by calling the `d1 info` command, which defaults to returning the current bookmark:

```sh
wrangler d1 time-travel info YOUR_DATABASE
```

```sh
🚧 Time Traveling...
⚠️ The current bookmark is '00000085-0000024c-00004c6d-8e61117bf38d7adb71b934ebbf891683'
⚡️ To restore to this specific bookmark, run:
 `wrangler d1 time-travel restore YOUR_DATABASE --bookmark=00000085-0000024c-00004c6d-8e61117bf38d7adb71b934ebbf891683`
```

To retrieve the bookmark for a timestamp in the past, pass the `--timestamp` flag with a valid Unix or RFC3339 timestamp:

```sh
wrangler d1 time-travel info YOUR_DATABASE --timestamp="2023-07-09T17:31:11+00:00"
```

## Restore a database

To restore a database to a specific point-in-time:

Warning

Restoring a database to a specific point-in-time is a *destructive* operation, and overwrites the database in place. In the future, D1 will support branching & cloning databases using Time Travel.

```sh
wrangler d1 time-travel restore YOUR_DATABASE --timestamp=UNIX_TIMESTAMP
```

```sh
🚧 Restoring database YOUR_DATABASE from bookmark 00000080-ffffffff-00004c60-390376cb1c4dd679b74a19d19f5ca5be


⚠️ This will overwrite all data in database YOUR_DATABASE.
In-flight queries and transactions will be cancelled.


✔ OK to proceed (y/N) … yes
⚡️ Time travel in progress...
✅ Database YOUR_DATABASE restored back to bookmark 00000080-ffffffff-00004c60-390376cb1c4dd679b74a19d19f5ca5be


↩️ To undo this operation, you can restore to the previous bookmark: 00000085-ffffffff-00004c6d-2510c8b03a2eb2c48b2422bb3b33fad5
```

Note that:

* Timestamps are converted to a deterministic, stable bookmark. The same timestamp will always represent the same bookmark.
* Queries in flight will be cancelled, and an error returned to the client.
* The restore operation will return a [bookmark](#bookmarks) that allows you to [undo](#undo-a-restore) and revert the database.

## Undo a restore

You can undo a restore by:

* Taking note of the previous bookmark returned as part of a `wrangler d1 time-travel restore` operation
* Restoring directly to a bookmark in the past, prior to your last restore.

To fetch a bookmark from an earlier state:

```sh
wrangler d1 time-travel info YOUR_DATABASE
```

```sh
🚧 Time Traveling...
⚠️ The current bookmark is '00000085-0000024c-00004c6d-8e61117bf38d7adb71b934ebbf891683'
⚡️ To restore to this specific bookmark, run:
 `wrangler d1 time-travel restore YOUR_DATABASE --bookmark=00000085-0000024c-00004c6d-8e61117bf38d7adb71b934ebbf891683`
```

## Export D1 into R2 using Workflows

You can automatically export your D1 database into R2 storage via REST API and Cloudflare Workflows. This may be useful if you wish to store a state of your D1 database for longer than 30 days.

Refer to the guide [Export and save D1 database](https://developers.cloudflare.com/workflows/examples/backup-d1/).

## Notes

* You can quickly get the Unix timestamp from the command-line in macOS and Windows via `date +%s`.
* Time Travel does not yet allow you to clone or fork an existing database to a new copy. In the future, Time Travel will allow you to fork (clone) an existing database into a new database, or overwrite an existing database.
* You can restore a database back to a point in time up to 30 days in the past (Workers Paid plan) or 7 days (Workers Free plan). Refer to [Limits](https://developers.cloudflare.com/d1/platform/limits/) for details on Time Travel's limits.

</page>

<page>
---
title: Define foreign keys · Cloudflare D1 docs
description: D1 supports defining and enforcing foreign key constraints across
  tables in a database.
lastUpdated: 2025-04-15T12:29:32.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/sql-api/foreign-keys/
  md: https://developers.cloudflare.com/d1/sql-api/foreign-keys/index.md
---

D1 supports defining and enforcing foreign key constraints across tables in a database.

Foreign key constraints allow you to enforce relationships across tables. For example, you can use foreign keys to create a strict binding between a `user_id` in a `users` table and the `user_id` in an `orders` table, so that no order can be created against a user that does not exist.

Foreign key constraints can also prevent you from deleting rows that reference rows in other tables. For example, deleting rows from the `users` table when rows in the `orders` table refer to them.

By default, D1 enforces that foreign key constraints are valid within all queries and migrations. This is identical to the behaviour you would observe when setting `PRAGMA foreign_keys = on` in SQLite for every transaction.

## Defer foreign key constraints

When running a [query](https://developers.cloudflare.com/d1/worker-api/), [migration](https://developers.cloudflare.com/d1/reference/migrations/) or [importing data](https://developers.cloudflare.com/d1/best-practices/import-export-data/) against a D1 database, there may be situations in which you need to disable foreign key validation during table creation or changes to your schema.

D1's foreign key enforcement is equivalent to SQLite's `PRAGMA foreign_keys = on` directive. Because D1 runs every query inside an implicit transaction, user queries cannot change this during a query or migration.

Instead, D1 allows you to call `PRAGMA defer_foreign_keys = on` or `off`, which allows you to violate foreign key constraints temporarily (until the end of the current transaction).

Calling `PRAGMA defer_foreign_keys = off` does not disable foreign key enforcement outside of the current transaction. If you have not resolved outstanding foreign key violations at the end of your transaction, it will fail with a `FOREIGN KEY constraint failed` error.

To defer foreign key enforcement, set `PRAGMA defer_foreign_keys = on` at the start of your transaction, or ahead of changes that would violate constraints:

```sql
-- Defer foreign key enforcement in this transaction.
PRAGMA defer_foreign_keys = on


-- Run your CREATE TABLE or ALTER TABLE / COLUMN statements
ALTER TABLE users ...


-- This is implicit if not set by the end of the transaction.
PRAGMA defer_foreign_keys = off
```

You can also explicitly set `PRAGMA defer_foreign_keys = off` immediately after you have resolved outstanding foreign key constraints. If there are still outstanding foreign key constraints, you will receive a `FOREIGN KEY constraint failed` error and will need to resolve the violation.

## Define a foreign key relationship

A foreign key relationship can be defined when creating a table via `CREATE TABLE` or when adding a column to an existing table via an `ALTER TABLE` statement.

To illustrate this with an example based on an e-commerce website with two tables:

* A `users` table that defines common properties about a user account, including a unique `user_id` identifier.
* An `orders` table that maps an order back to a `user_id` in the user table.

This mapping is defined as `FOREIGN KEY`, which ensures that:

* You cannot delete a row from the `users` table that would violate the foreign key constraint. This means that you cannot end up with orders that do not have a valid user to map back to.
* `orders` are always defined against a valid `user_id`, mitigating the risk of creating orders that refer to invalid (or non-existent) users.

```sql
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY,
    email_address TEXT,
    name TEXT,
    metadata TEXT
)


CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY,
    status INTEGER,
    item_desc TEXT,
    shipped_date INTEGER,
    user_who_ordered INTEGER,
    FOREIGN KEY(user_who_ordered) REFERENCES users(user_id)
)
```

You can define multiple foreign key relationships per-table, and foreign key definitions can reference multiple tables within your overall database schema.

## Foreign key actions

You can define *actions* as part of your foreign key definitions to either limit or propagate changes to a parent row (`REFERENCES table(column)`). Defining *actions* makes using foreign key constraints in your application easier to reason about, and help either clean up related data or prevent data from being islanded.

There are five actions you can set when defining the `ON UPDATE` and/or `ON DELETE` clauses as part of a foreign key relationship. You can also define different actions for `ON UPDATE` and `ON DELETE` depending on your requirements.

* `CASCADE` - Updating or deleting a parent key deletes all child keys (rows) associated to it.
* `RESTRICT` - A parent key cannot be updated or deleted when *any* child key refers to it. Unlike the default foreign key enforcement, relationships with `RESTRICT` applied return errors immediately, and not at the end of the transaction.
* `SET DEFAULT` - Set the child column(s) referred to by the foreign key definition to the `DEFAULT` value defined in the schema. If no `DEFAULT` is set on the child columns, you cannot use this action.
* `SET NULL` - Set the child column(s) referred to by the foreign key definition to SQL `NULL`.
* `NO ACTION` - Take no action.

CASCADE usage

Although `CASCADE` can be the desired behavior in some cases, deleting child rows across tables can have undesirable effects and/or result in unintended side effects for your users.

In the following example, deleting a user from the `users` table will delete all related rows in the `scores` table as you have defined `ON DELETE CASCADE`. Delete all related rows in the `scores` table if you do not want to retain the scores for any users you have deleted entirely. This might mean that *other* users can no longer look up or refer to scores that were still valid.

```sql
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY,
    email_address TEXT,
)


CREATE TABLE scores (
    score_id INTEGER PRIMARY KEY,
    game TEXT,
    score INTEGER,
    player_id INTEGER,
    FOREIGN KEY(player_id) REFERENCES users(user_id) ON DELETE CASCADE
)
```

## Next Steps

* Read the SQLite [`FOREIGN KEY`](https://www.sqlite.org/foreignkeys.html) documentation.
* Learn how to [use the D1 Workers Binding API](https://developers.cloudflare.com/d1/worker-api/) from within a Worker.
* Understand how [database migrations work](https://developers.cloudflare.com/d1/reference/migrations/) with D1.

</page>

<page>
---
title: Query JSON · Cloudflare D1 docs
description: "D1 has built-in support for querying and parsing JSON data stored
  within a database. This enables you to:"
lastUpdated: 2025-08-15T20:11:52.000Z
chatbotDeprioritize: false
tags: JSON
source_url:
  html: https://developers.cloudflare.com/d1/sql-api/query-json/
  md: https://developers.cloudflare.com/d1/sql-api/query-json/index.md
---

D1 has built-in support for querying and parsing JSON data stored within a database. This enables you to:

* [Query paths](#extract-values) within a stored JSON object - for example, extracting the value of named key or array index directly, which is especially useful with larger JSON objects.
* Insert and/or replace values within an object or array.
* [Expand the contents of a JSON object](#expand-arrays-for-in-queries) or array into multiple rows - for example, for use as part of a `WHERE ... IN` predicate.
* Create [generated columns](https://developers.cloudflare.com/d1/reference/generated-columns/) that are automatically populated with values from JSON objects you insert.

One of the biggest benefits to parsing JSON within D1 directly is that it can directly reduce the number of round-trips (queries) to your database. It reduces the cases where you have to read a JSON object into your application (1), parse it, and then write it back (2).

This allows you to more precisely query over data and reduce the result set your application needs to additionally parse and filter on.

## Types

JSON data is stored as a `TEXT` column in D1. JSON types follow the same [type conversion rules](https://developers.cloudflare.com/d1/worker-api/#type-conversion) as D1 in general, including:

* A JSON null is treated as a D1 `NULL`.
* A JSON number is treated as an `INTEGER` or `REAL`.
* Booleans are treated as `INTEGER` values: `true` as `1` and `false` as `0`.
* Object and array values as `TEXT`.

## Supported functions

The following table outlines the JSON functions built into D1 and example usage.

* The `json` argument placeholder can be a JSON object, array, string, number or a null value.
* The `value` argument accepts string literals (only) and treats input as a string, even if it is well-formed JSON. The exception to this rule is when nesting `json_*` functions: the outer (wrapping) function will interpret the inner (wrapped) functions return value as JSON.
* The `path` argument accepts path-style traversal syntax - for example, `$` to refer to the top-level object/array, `$.key1.key2` to refer to a nested object, and `$.key[2]` to index into an array.

| Function | Description | Example |
| - | - | - |
| `json(json)` | Validates the provided string is JSON and returns a minified version of that JSON object. | `json('{"hello":["world" ,"there"] }')` returns `{"hello":["world","there"]}` |
| `json_array(value1, value2, value3, ...)` | Return a JSON array from the values. | `json_array(1, 2, 3)` returns `[1, 2, 3]` |
| `json_array_length(json)` - `json_array_length(json, path)` | Return the length of the JSON array | `json_array_length('{"data":["x", "y", "z"]}', '$.data')` returns `3` |
| `json_extract(json, path)` | Extract the value(s) at the given path using `$.path.to.value` syntax. | `json_extract('{"temp":"78.3", "sunset":"20:44"}', '$.temp')` returns `"78.3"` |
| `json -> path` | Extract the value(s) at the given path using path syntax and return it as JSON. | |
| `json ->> path` | Extract the value(s) at the given path using path syntax and return it as a SQL type. | |
| `json_insert(json, path, value)` | Insert a value at the given path. Does not overwrite an existing value. | |
| `json_object(label1, value1, ...)` | Accepts pairs of (keys, values) and returns a JSON object. | `json_object('temp', 45, 'wind_speed_mph', 13)` returns `{"temp":45,"wind_speed_mph":13}` |
| `json_patch(target, patch)` | Uses a JSON [MergePatch](https://tools.ietf.org/html/rfc7396) approach to merge the provided patch into the target JSON object. | |
| `json_remove(json, path, ...)` | Remove the key and value at the specified path. | `json_remove('[60,70,80,90]', '$[0]')` returns `70,80,90]` |
| `json_replace(json, path, value)` | Insert a value at the given path. Overwrites an existing value, but does not create a new key if it doesn't exist. | |
| `json_set(json, path, value)` | Insert a value at the given path. Overwrites an existing value. | |
| `json_type(json)` - `json_type(json, path)` | Return the type of the provided value or value at the specified path. Returns one of `null`, `true`, `false`, `integer`, `real`, `text`, `array`, or `object`. | `json_type('{"temperatures":[73.6, 77.8, 80.2]}', '$.temperatures')` returns `array` |
| `json_valid(json)` | Returns 0 (false) for invalid JSON, and 1 (true) for valid JSON. | `json_valid({invalid:json})`returns`0\` |
| `json_quote(value)` | Converts the provided SQL value into its JSON representation. | `json_quote('[1, 2, 3]')` returns `[1,2,3]` |
| `json_group_array(value)` | Returns the provided value(s) as a JSON array. | |
| `json_each(value)` - `json_each(value, path)` | Returns each element within the object as an individual row. It will only traverse the top-level object. | |
| `json_tree(value)` - `json_tree(value, path)` | Returns each element within the object as an individual row. It traverses the full object. | |

The SQLite [JSON extension](https://www.sqlite.org/json1.html), on which D1 builds on, has additional usage examples.

## Error Handling

JSON functions will return a `malformed JSON` error when operating over data that isn't JSON and/or is not valid JSON. D1 considers valid JSON to be [RFC 7159](https://www.rfc-editor.org/rfc/rfc7159.txt) conformant.

In the following example, calling `json_extract` over a string (not valid JSON) will cause the query to return a `malformed JSON` error:

```sql
SELECT json_extract('not valid JSON: just a string', '$')
```

This will return an error:

```txt
ERROR 9015: SQL engine error: query error: Error code 1: SQL error or missing database (malformed
  JSON)`
```

## Generated columns

D1's support for [generated columns](https://developers.cloudflare.com/d1/reference/generated-columns/) allows you to create dynamic columns that are generated based on the values of other columns, including extracted or calculated values of JSON data.

These columns can be queried like any other column, and can have [indexes](https://developers.cloudflare.com/d1/best-practices/use-indexes/) defined on them. If you have JSON data that you frequently query and filter over, creating a generated column and an index can dramatically improve query performance.

For example, to define a column based on a value within a larger JSON object, use the `AS` keyword combined with a [JSON function](#supported-functions) to generate a typed column:

```sql
CREATE TABLE some_table (
    -- other columns omitted
    raw_data TEXT -- JSON: {"measurement":{"aqi":[21,42,58],"wind_mph":"13","location":"US-NY"}}
    location AS (json_extract(raw_data, '$.measurement.location')) STORED
)
```

Refer to [Generated columns](https://developers.cloudflare.com/d1/reference/generated-columns/) to learn more about how to generate columns.

## Example usage

### Extract values

There are three ways to extract a value from a JSON object in D1:

* The `json_extract()` function - for example, `json_extract(text_column_containing_json, '$.path.to.value)`.
* The `->` operator, which returns a JSON representation of the value.
* The `->>` operator, which returns an SQL representation of the value.

The `->` and `->>` operators functions both operate similarly to the same operators in PostgreSQL and MySQL/MariaDB.

Given the following JSON object in a column named `sensor_reading`, you can extract values from it directly.

```json
{
    "measurement": {
        "temp_f": "77.4",
        "aqi": [21, 42, 58],
        "o3": [18, 500],
        "wind_mph": "13",
        "location": "US-NY"
    }
}
```

```sql
-- Extract the temperature value
json_extract(sensor_reading, '$.measurement.temp_f')-- returns "77.4" as TEXT
```

```sql
-- Extract the maximum PM2.5 air quality reading
sensor_reading -> '$.measurement.aqi[3]' -- returns 58 as a JSON number
```

```sql
-- Extract the o3 (ozone) array in full
sensor_reading -\-> '$.measurement.o3' -- returns '[18, 500]' as TEXT
```

### Get the length of an array

You can get the length of a JSON array in two ways:

1. By calling `json_array_length(value)` directly
2. By calling `json_array_length(value, path)` to specify the path to an array within an object or outer array.

For example, given the following JSON object stored in a column called `login_history`, you could get a count of the last logins directly:

```json
{
    "user_id": "abc12345",
    "previous_logins": ["2023-03-31T21:07:14-05:00", "2023-03-28T08:21:02-05:00", "2023-03-28T05:52:11-05:00"]
}
```

```sql
json_array_length(login_history, '$.previous_logins') --> returns 3 as an INTEGER
```

You can also use `json_array_length` as a predicate in a more complex query - for example, `WHERE json_array_length(some_column, '$.path.to.value') >= 5`.

### Insert a value into an existing object

You can insert a value into an existing JSON object or array using `json_insert()`. For example, if you have a `TEXT` column called `login_history` in a `users` table containing the following object:

```json
{"history": ["2023-05-13T15:13:02+00:00", "2023-05-14T07:11:22+00:00", "2023-05-15T15:03:51+00:00"]}
```

To add a new timestamp to the `history` array within our `login_history` column, write a query resembling the following:

```sql
UPDATE users
SET login_history = json_insert(login_history, '$.history[#]', '2023-05-15T20:33:06+00:00')
WHERE user_id = 'aba0e360-1e04-41b3-91a0-1f2263e1e0fb'
```

Provide three arguments to `json_insert`:

1. The name of our column containing the JSON you want to modify.
2. The path to the key within the object to modify.
3. The JSON value to insert. Using `[#]` tells `json_insert` to append to the end of your array.

To replace an existing value, use `json_replace()`, which will overwrite an existing key-value pair if one already exists. To set a value regardless of whether it already exists, use `json_set()`.

### Expand arrays for IN queries

Use `json_each` to expand an array into multiple rows. This can be useful when composing a `WHERE column IN (?)` query over several values. For example, if you wanted to update a list of users by their integer `id`, use `json_each` to return a table with each value as a column called `value`:

```sql
UPDATE users
SET last_audited = '2023-05-16T11:24:08+00:00'
WHERE id IN (SELECT value FROM json_each('[183183, 13913, 94944]'))
```

This would extract only the `value` column from the table returned by `json_each`, with each row representing the user IDs you passed in as an array.

`json_each` effectively returns a table with multiple columns, with the most relevant being:

* `key` - the key (or index).
* `value` - the literal value of each element parsed by `json_each`.
* `type` - the type of the value: one of `null`, `true`, `false`, `integer`, `real`, `text`, `array`, or `object`.
* `fullkey` - the full path to the element: e.g. `$[1]` for the second element in an array, or `$.path.to.key` for a nested object.
* `path` - the top-level path - `$` as the path for an element with a `fullkey` of `$[0]`.

In this example, `SELECT * FROM json_each('[183183, 13913, 94944]')` would return a table resembling the below:

```sql
key|value|type|id|fullkey|path
0|183183|integer|1|$[0]|$
1|13913|integer|2|$[1]|$
2|94944|integer|3|$[2]|$
```

You can use `json_each` with [D1 Workers Binding API](https://developers.cloudflare.com/d1/worker-api/) in a Worker by creating a statement and using `JSON.stringify` to pass an array as a [bound parameter](https://developers.cloudflare.com/d1/worker-api/d1-database/#guidance):

```ts
const stmt = context.env.DB
    .prepare("UPDATE users SET last_audited = ? WHERE id IN (SELECT value FROM json_each(?1))")
const resp = await stmt.bind(
    "2023-05-16T11:24:08+00:00",
    JSON.stringify([183183, 13913, 94944])
    ).run()
```

This would only update rows in your `users` table where the `id` matches one of the three provided.

</page>

<page>
---
title: SQL statements · Cloudflare D1 docs
description: D1 is compatible with most SQLite's SQL convention since it
  leverages SQLite's query engine. D1 supports a number of database-level
  statements that allow you to list tables, indexes, and inspect the schema for
  a given table or index.
lastUpdated: 2025-09-01T15:12:51.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/sql-api/sql-statements/
  md: https://developers.cloudflare.com/d1/sql-api/sql-statements/index.md
---

D1 is compatible with most SQLite's SQL convention since it leverages SQLite's query engine. D1 supports a number of database-level statements that allow you to list tables, indexes, and inspect the schema for a given table or index.

You can execute any of these statements via the D1 console in the Cloudflare dashboard, [`wrangler d1 execute`](https://developers.cloudflare.com/workers/wrangler/commands/#d1), or with the [D1 Worker Bindings API](https://developers.cloudflare.com/d1/worker-api/d1-database).

## Supported SQLite extensions

D1 supports a subset of SQLite extensions for added functionality, including:

* [FTS5 module](https://www.sqlite.org/fts5.html) for full-text search (including `fts5vocab`).
* [JSON extension](https://www.sqlite.org/json1.html) for JSON functions and operators.
* [Math functions](https://sqlite.org/lang_mathfunc.html).

Refer to the [source code](https://github.com/cloudflare/workerd/blob/4c42a4a9d3390c88e9bd977091c9d3395a6cd665/src/workerd/util/sqlite.c%2B%2B#L269) for the full list of supported functions.

## Compatible PRAGMA statements

D1 supports some [SQLite PRAGMA](https://www.sqlite.org/pragma.html) statements. The PRAGMA statement is an SQL extension for SQLite. PRAGMA commands can be used to:

* Modify the behavior of certain SQLite operations.
* Query the SQLite library for internal data about schemas or tables (but note that PRAGMA statements cannot query the contents of a table).
* Control [environmental variables](https://developers.cloudflare.com/workers/configuration/environment-variables/).

The PRAGMA statement examples on this page use the following SQL.

```sql
PRAGMA foreign_keys=off;
DROP TABLE IF EXISTS "Employee";
DROP TABLE IF EXISTS "Category";
DROP TABLE IF EXISTS "Customer";
DROP TABLE IF EXISTS "Shipper";
DROP TABLE IF EXISTS "Supplier";
DROP TABLE IF EXISTS "Order";
DROP TABLE IF EXISTS "Product";
DROP TABLE IF EXISTS "OrderDetail";
DROP TABLE IF EXISTS "CustomerCustomerDemo";
DROP TABLE IF EXISTS "CustomerDemographic";
DROP TABLE IF EXISTS "Region";
DROP TABLE IF EXISTS "Territory";
DROP TABLE IF EXISTS "EmployeeTerritory";
DROP VIEW IF EXISTS [ProductDetails_V];
CREATE TABLE IF NOT EXISTS "Employee" ( "Id" INTEGER PRIMARY KEY, "LastName" VARCHAR(8000) NULL, "FirstName" VARCHAR(8000) NULL, "Title" VARCHAR(8000) NULL, "TitleOfCourtesy" VARCHAR(8000) NULL, "BirthDate" VARCHAR(8000) NULL, "HireDate" VARCHAR(8000) NULL, "Address" VARCHAR(8000) NULL, "City" VARCHAR(8000) NULL, "Region" VARCHAR(8000) NULL, "PostalCode" VARCHAR(8000) NULL, "Country" VARCHAR(8000) NULL, "HomePhone" VARCHAR(8000) NULL, "Extension" VARCHAR(8000) NULL, "Photo" BLOB NULL, "Notes" VARCHAR(8000) NULL, "ReportsTo" INTEGER NULL, "PhotoPath" VARCHAR(8000) NULL);
CREATE TABLE IF NOT EXISTS "Category" ( "Id" INTEGER PRIMARY KEY, "CategoryName" VARCHAR(8000) NULL, "Description" VARCHAR(8000) NULL);
CREATE TABLE IF NOT EXISTS "Customer" ( "Id" VARCHAR(8000) PRIMARY KEY, "CompanyName" VARCHAR(8000) NULL, "ContactName" VARCHAR(8000) NULL, "ContactTitle" VARCHAR(8000) NULL, "Address" VARCHAR(8000) NULL, "City" VARCHAR(8000) NULL, "Region" VARCHAR(8000) NULL, "PostalCode" VARCHAR(8000) NULL, "Country" VARCHAR(8000) NULL, "Phone" VARCHAR(8000) NULL, "Fax" VARCHAR(8000) NULL);
CREATE TABLE IF NOT EXISTS "Shipper" ( "Id" INTEGER PRIMARY KEY, "CompanyName" VARCHAR(8000) NULL, "Phone" VARCHAR(8000) NULL);
CREATE TABLE IF NOT EXISTS "Supplier" ( "Id" INTEGER PRIMARY KEY, "CompanyName" VARCHAR(8000) NULL, "ContactName" VARCHAR(8000) NULL, "ContactTitle" VARCHAR(8000) NULL, "Address" VARCHAR(8000) NULL, "City" VARCHAR(8000) NULL, "Region" VARCHAR(8000) NULL, "PostalCode" VARCHAR(8000) NULL, "Country" VARCHAR(8000) NULL, "Phone" VARCHAR(8000) NULL, "Fax" VARCHAR(8000) NULL, "HomePage" VARCHAR(8000) NULL);
CREATE TABLE IF NOT EXISTS "Order" ( "Id" INTEGER PRIMARY KEY, "CustomerId" VARCHAR(8000) NULL, "EmployeeId" INTEGER NOT NULL, "OrderDate" VARCHAR(8000) NULL, "RequiredDate" VARCHAR(8000) NULL, "ShippedDate" VARCHAR(8000) NULL, "ShipVia" INTEGER NULL, "Freight" DECIMAL NOT NULL, "ShipName" VARCHAR(8000) NULL, "ShipAddress" VARCHAR(8000) NULL, "ShipCity" VARCHAR(8000) NULL, "ShipRegion" VARCHAR(8000) NULL, "ShipPostalCode" VARCHAR(8000) NULL, "ShipCountry" VARCHAR(8000) NULL);
CREATE TABLE IF NOT EXISTS "Product" ( "Id" INTEGER PRIMARY KEY, "ProductName" VARCHAR(8000) NULL, "SupplierId" INTEGER NOT NULL, "CategoryId" INTEGER NOT NULL, "QuantityPerUnit" VARCHAR(8000) NULL, "UnitPrice" DECIMAL NOT NULL, "UnitsInStock" INTEGER NOT NULL, "UnitsOnOrder" INTEGER NOT NULL, "ReorderLevel" INTEGER NOT NULL, "Discontinued" INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS "OrderDetail" ( "Id" VARCHAR(8000) PRIMARY KEY, "OrderId" INTEGER NOT NULL, "ProductId" INTEGER NOT NULL, "UnitPrice" DECIMAL NOT NULL, "Quantity" INTEGER NOT NULL, "Discount" DOUBLE NOT NULL);
CREATE TABLE IF NOT EXISTS "CustomerCustomerDemo" ( "Id" VARCHAR(8000) PRIMARY KEY, "CustomerTypeId" VARCHAR(8000) NULL);
CREATE TABLE IF NOT EXISTS "CustomerDemographic" ( "Id" VARCHAR(8000) PRIMARY KEY, "CustomerDesc" VARCHAR(8000) NULL);
CREATE TABLE IF NOT EXISTS "Region" ( "Id" INTEGER PRIMARY KEY, "RegionDescription" VARCHAR(8000) NULL);
CREATE TABLE IF NOT EXISTS "Territory" ( "Id" VARCHAR(8000) PRIMARY KEY, "TerritoryDescription" VARCHAR(8000) NULL, "RegionId" INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS "EmployeeTerritory" ( "Id" VARCHAR(8000) PRIMARY KEY, "EmployeeId" INTEGER NOT NULL, "TerritoryId" VARCHAR(8000) NULL);
CREATE VIEW [ProductDetails_V] as select p.*, c.CategoryName, c.Description as [CategoryDescription], s.CompanyName as [SupplierName], s.Region as [SupplierRegion] from [Product] p join [Category] c on p.CategoryId = c.id join [Supplier] s on s.id = p.SupplierId;
```

Warning

D1 PRAGMA statements only apply to the current transaction.

### `PRAGMA table_list`

Lists the tables and views in the database. This includes the system tables maintained by D1.

#### Return values

One row per each table. Each row contains:

1. `Schema`: the schema in which the table appears (for example, `main` or `temp`)
2. `name`: the name of the table
3. `type`: the type of the object (one of `table`, `view`, `shadow`, `virtual`)
4. `ncol`: the number of columns in the table, including generated or hidden columns
5. `wr`: `1` if the table is a WITHOUT ROWID table, `0` otherwise
6. `strict`: `1` if the table is a STRICT table, `0` otherwise

Example of `PRAGMA table_list`

```sh
npx wrangler d1 execute [DATABASE_NAME] --command='PRAGMA table_list'
```

```sh
🌀 Executing on remote database [DATABASE_NAME] (DATABASE_ID):
🌀 To execute on your local development database, remove the --remote flag from your wrangler command.
🚣 Executed 1 commands in 0.5874ms
┌────────┬──────────────────────┬───────┬──────┬────┬────────┐
│ schema │ name                 │ type  │ ncol │ wr │ strict │
├────────┼──────────────────────┼───────┼──────┼────┼────────┤
│ main   │ Territory            │ table │ 3    │ 0  │ 0      │
├────────┼──────────────────────┼───────┼──────┼────┼────────┤
│ main   │ CustomerDemographic  │ table │ 2    │ 0  │ 0      │
├────────┼──────────────────────┼───────┼──────┼────┼────────┤
│ main   │ OrderDetail          │ table │ 6    │ 0  │ 0      │
├────────┼──────────────────────┼───────┼──────┼────┼────────┤
│ main   │ sqlite_schema        │ table │ 5    │ 0  │ 0      │
├────────┼──────────────────────┼───────┼──────┼────┼────────┤
│ main   │ Region               │ table │ 2    │ 0  │ 0      │
├────────┼──────────────────────┼───────┼──────┼────┼────────┤
│ main   │ _cf_KV               │ table │ 2    │ 1  │ 0      │
├────────┼──────────────────────┼───────┼──────┼────┼────────┤
│ main   │ ProductDetails_V     │ view  │ 14   │ 0  │ 0      │
├────────┼──────────────────────┼───────┼──────┼────┼────────┤
│ main   │ EmployeeTerritory    │ table │ 3    │ 0  │ 0      │
├────────┼──────────────────────┼───────┼──────┼────┼────────┤
│ main   │ Employee             │ table │ 18   │ 0  │ 0      │
├────────┼──────────────────────┼───────┼──────┼────┼────────┤
│ main   │ Category             │ table │ 3    │ 0  │ 0      │
├────────┼──────────────────────┼───────┼──────┼────┼────────┤
│ main   │ Customer             │ table │ 11   │ 0  │ 0      │
├────────┼──────────────────────┼───────┼──────┼────┼────────┤
│ main   │ Shipper              │ table │ 3    │ 0  │ 0      │
├────────┼──────────────────────┼───────┼──────┼────┼────────┤
│ main   │ Supplier             │ table │ 12   │ 0  │ 0      │
├────────┼──────────────────────┼───────┼──────┼────┼────────┤
│ main   │ Order                │ table │ 14   │ 0  │ 0      │
├────────┼──────────────────────┼───────┼──────┼────┼────────┤
│ main   │ CustomerCustomerDemo │ table │ 2    │ 0  │ 0      │
├────────┼──────────────────────┼───────┼──────┼────┼────────┤
│ main   │ Product              │ table │ 10   │ 0  │ 0      │
├────────┼──────────────────────┼───────┼──────┼────┼────────┤
│ temp   │ sqlite_temp_schema   │ table │ 5    │ 0  │ 0      │
└────────┴──────────────────────┴───────┴──────┴────┴────────┘
```

### `PRAGMA table_info("TABLE_NAME")`

Shows the schema (columns, types, null, default values) for the given `TABLE_NAME`.

#### Return values

One row for each column in the specified table. Each row contains:

1. `cid`: a row identifier
2. `name`: the name of the column
3. `type`: the data type (if provided), `''` otherwise
4. `notnull`: `1` if the column can be NULL, `0` otherwise
5. `dflt_value`: the default value of the column
6. `pk`: `1` if the column is a primary key, `0` otherwise

Example of `PRAGMA table_info`

```sh
npx wrangler d1 execute [DATABASE_NAME] --command='PRAGMA table_info("Order")'
```

```sh
🌀 Executing on remote database [DATABASE_NAME] (DATABASE_ID):
🌀 To execute on your local development database, remove the --remote flag from your wrangler command.
🚣 Executed 1 commands in 0.8502ms
┌─────┬────────────────┬───────────────┬─────────┬────────────┬────┐
│ cid │ name           │ type          │ notnull │ dflt_value │ pk │
├─────┼────────────────┼───────────────┼─────────┼────────────┼────┤
│ 0   │ Id             │ INTEGER       │ 0       │            │ 1  │
├─────┼────────────────┼───────────────┼─────────┼────────────┼────┤
│ 1   │ CustomerId     │ VARCHAR(8000) │ 0       │            │ 0  │
├─────┼────────────────┼───────────────┼─────────┼────────────┼────┤
│ 2   │ EmployeeId     │ INTEGER       │ 1       │            │ 0  │
├─────┼────────────────┼───────────────┼─────────┼────────────┼────┤
│ 3   │ OrderDate      │ VARCHAR(8000) │ 0       │            │ 0  │
├─────┼────────────────┼───────────────┼─────────┼────────────┼────┤
│ 4   │ RequiredDate   │ VARCHAR(8000) │ 0       │            │ 0  │
├─────┼────────────────┼───────────────┼─────────┼────────────┼────┤
│ 5   │ ShippedDate    │ VARCHAR(8000) │ 0       │            │ 0  │
├─────┼────────────────┼───────────────┼─────────┼────────────┼────┤
│ 6   │ ShipVia        │ INTEGER       │ 0       │            │ 0  │
├─────┼────────────────┼───────────────┼─────────┼────────────┼────┤
│ 7   │ Freight        │ DECIMAL       │ 1       │            │ 0  │
├─────┼────────────────┼───────────────┼─────────┼────────────┼────┤
│ 8   │ ShipName       │ VARCHAR(8000) │ 0       │            │ 0  │
├─────┼────────────────┼───────────────┼─────────┼────────────┼────┤
│ 9   │ ShipAddress    │ VARCHAR(8000) │ 0       │            │ 0  │
├─────┼────────────────┼───────────────┼─────────┼────────────┼────┤
│ 10  │ ShipCity       │ VARCHAR(8000) │ 0       │            │ 0  │
├─────┼────────────────┼───────────────┼─────────┼────────────┼────┤
│ 11  │ ShipRegion     │ VARCHAR(8000) │ 0       │            │ 0  │
├─────┼────────────────┼───────────────┼─────────┼────────────┼────┤
│ 12  │ ShipPostalCode │ VARCHAR(8000) │ 0       │            │ 0  │
├─────┼────────────────┼───────────────┼─────────┼────────────┼────┤
│ 13  │ ShipCountry    │ VARCHAR(8000) │ 0       │            │ 0  │
└─────┴────────────────┴───────────────┴─────────┴────────────┴────┘
```

### `PRAGMA table_xinfo("TABLE_NAME")`

Similar to `PRAGMA table_info(TABLE_NAME)` but also includes [generated columns](https://developers.cloudflare.com/d1/reference/generated-columns/).

Example of `PRAGMA table_xinfo`

```sh
npx wrangler d1 execute [DATABASE_NAME] --command='PRAGMA table_xinfo("Order")'
```

```sh
🌀 Executing on remote database [DATABASE_NAME] (DATABASE_ID):
🌀 To execute on your local development database, remove the --remote flag from your wrangler command.
🚣 Executed 1 commands in 0.3854ms
┌─────┬────────────────┬───────────────┬─────────┬────────────┬────┬────────┐
│ cid │ name           │ type          │ notnull │ dflt_value │ pk │ hidden │
├─────┼────────────────┼───────────────┼─────────┼────────────┼────┼────────┤
│ 0   │ Id             │ INTEGER       │ 0       │            │ 1  │ 0      │
├─────┼────────────────┼───────────────┼─────────┼────────────┼────┼────────┤
│ 1   │ CustomerId     │ VARCHAR(8000) │ 0       │            │ 0  │ 0      │
├─────┼────────────────┼───────────────┼─────────┼────────────┼────┼────────┤
│ 2   │ EmployeeId     │ INTEGER       │ 1       │            │ 0  │ 0      │
├─────┼────────────────┼───────────────┼─────────┼────────────┼────┼────────┤
│ 3   │ OrderDate      │ VARCHAR(8000) │ 0       │            │ 0  │ 0      │
├─────┼────────────────┼───────────────┼─────────┼────────────┼────┼────────┤
│ 4   │ RequiredDate   │ VARCHAR(8000) │ 0       │            │ 0  │ 0      │
├─────┼────────────────┼───────────────┼─────────┼────────────┼────┼────────┤
│ 5   │ ShippedDate    │ VARCHAR(8000) │ 0       │            │ 0  │ 0      │
├─────┼────────────────┼───────────────┼─────────┼────────────┼────┼────────┤
│ 6   │ ShipVia        │ INTEGER       │ 0       │            │ 0  │ 0      │
├─────┼────────────────┼───────────────┼─────────┼────────────┼────┼────────┤
│ 7   │ Freight        │ DECIMAL       │ 1       │            │ 0  │ 0      │
├─────┼────────────────┼───────────────┼─────────┼────────────┼────┼────────┤
│ 8   │ ShipName       │ VARCHAR(8000) │ 0       │            │ 0  │ 0      │
├─────┼────────────────┼───────────────┼─────────┼────────────┼────┼────────┤
│ 9   │ ShipAddress    │ VARCHAR(8000) │ 0       │            │ 0  │ 0      │
├─────┼────────────────┼───────────────┼─────────┼────────────┼────┼────────┤
│ 10  │ ShipCity       │ VARCHAR(8000) │ 0       │            │ 0  │ 0      │
├─────┼────────────────┼───────────────┼─────────┼────────────┼────┼────────┤
│ 11  │ ShipRegion     │ VARCHAR(8000) │ 0       │            │ 0  │ 0      │
├─────┼────────────────┼───────────────┼─────────┼────────────┼────┼────────┤
│ 12  │ ShipPostalCode │ VARCHAR(8000) │ 0       │            │ 0  │ 0      │
├─────┼────────────────┼───────────────┼─────────┼────────────┼────┼────────┤
│ 13  │ ShipCountry    │ VARCHAR(8000) │ 0       │            │ 0  │ 0      │
└─────┴────────────────┴───────────────┴─────────┴────────────┴────┴────────┘
```

### `PRAGMA index_list("TABLE_NAME")`

Show the indexes for the given `TABLE_NAME`.

#### Return values

One row for each index associated with the specified table. Each row contains:

1. `seq`: a sequence number for internal tracking
2. `name`: the name of the index
3. `unique`: `1` if the index is UNIQUE, `0` otherwise
4. `origin`: the origin of the index (`c` if created by `CREATE INDEX` statement, `u` if created by UNIQUE constraint, `pk` if created by a PRIMARY KEY constraint)
5. `partial`: `1` if the index is a partial index, `0` otherwise

Example of `PRAGMA index_list`

```sh
npx wrangler d1 execute [DATABASE_NAME] --command='PRAGMA index_list("Territory")'
```

```sh
🌀 Executing on remote database d1-pragma-db (DATABASE_ID):
🌀 To execute on your local development database, remove the --remote flag from your wrangler command.
🚣 Executed 1 commands in 0.2177ms
┌─────┬──────────────────────────────┬────────┬────────┬─────────┐
│ seq │ name                         │ unique │ origin │ partial │
├─────┼──────────────────────────────┼────────┼────────┼─────────┤
│ 0   │ sqlite_autoindex_Territory_1 │ 1      │ pk     │ 0       │
└─────┴──────────────────────────────┴────────┴────────┴─────────┘
```

### `PRAGMA index_info(INDEX_NAME)`

Show the indexed column(s) for the given `INDEX_NAME`.

#### Return values

One row for each key column in the specified index. Each row contains:

1. `seqno`: the rank of the column within the index
2. `cid`: the rank of the column within the table being indexed
3. `name`: the name of the column being indexed

Example of `PRAGMA index_info`

```sh
npx wrangler d1 execute [DATABASE_NAME] --command='PRAGMA index_info("sqlite_autoindex_Territory_1")'
```

```sh
🌀 Executing on remote database d1-pragma-db (DATABASE_ID):
🌀 To execute on your local development database, remove the --remote flag from your wrangler command.
🚣 Executed 1 commands in 0.2523ms
┌───────┬─────┬──────┐
│ seqno │ cid │ name │
├───────┼─────┼──────┤
│ 0     │ 0   │ Id   │
└───────┴─────┴──────┘
```

### `PRAGMA index_xinfo("INDEX_NAME")`

Similar to `PRAGMA index_info("TABLE_NAME")` but also includes hidden columns.

Example of `PRAGMA index_xinfo`

```sh
npx wrangler d1 execute [DATABASE_NAME] --command='PRAGMA index_xinfo("sqlite_autoindex_Territory_1")'
```

```sh
🌀 Executing on remote database d1-pragma-db (DATABASE_ID):
🌀 To execute on your local development database, remove the --remote flag from your wrangler command.
🚣 Executed 1 commands in 0.6034ms
┌───────┬─────┬──────┬──────┬────────┬─────┐
│ seqno │ cid │ name │ desc │ coll   │ key │
├───────┼─────┼──────┼──────┼────────┼─────┤
│ 0     │ 0   │ Id   │ 0    │ BINARY │ 1   │
├───────┼─────┼──────┼──────┼────────┼─────┤
│ 1     │ -1  │      │ 0    │ BINARY │ 0   │
└───────┴─────┴──────┴──────┴────────┴─────┘
```

### `PRAGMA quick_check`

Checks the formatting and consistency of the table, including:

* Incorrectly formatted records
* Missing pages
* Sections of the database which are used multiple times, or are not used at all.

#### Return values

* **If there are no errors:** a single row with the value `OK`
* **If there are errors:** a string which describes the issues flagged by the check

Example of `PRAGMA quick_check`

```sh
npx wrangler d1 execute [DATABASE_NAME] --command='PRAGMA quick_check'
```

```sh
🌀 Executing on remote database [DATABASE_NAME] (DATABASE_ID):
🌀 To execute on your local development database, remove the --remote flag from your wrangler command.
🚣 Executed 1 commands in 1.4073ms
┌─────────────┐
│ quick_check │
├─────────────┤
│ ok          │
└─────────────┘
```

### `PRAGMA foreign_key_check`

Checks for invalid references of foreign keys in the selected table.

### `PRAGMA foreign_key_list("TABLE_NAME")`

Lists the foreign key constraints in the selected table.

### `PRAGMA case_sensitive_like = (on|off)`

Toggles case sensitivity for LIKE operators. When `PRAGMA case_sensitive_like` is set to:

* `ON`: 'a' LIKE 'A' is false
* `OFF`: 'a' LIKE 'A' is true (this is the default behavior of the LIKE operator)

### `PRAGMA ignore_check_constraints = (on|off)`

Toggles the enforcement of CHECK constraints. When `PRAGMA ignore_check_constraints` is set to:

* `ON`: check constraints are ignored
* `OFF`: check constraints are enforced (this is the default behavior)

### `PRAGMA legacy_alter_table = (on|off)`

Toggles the ALTER TABLE RENAME command behavior before/after the legacy version of SQLite (3.24.0). When `PRAGMA legacy_alter_table` is set to:

* `ON`: ALTER TABLE RENAME only rewrites the initial occurrence of the table name in its CREATE TABLE statement and any associated CREATE INDEX and CREATE TRIGGER statements. All other occurrences are unmodified.
* `OFF`: ALTER TABLE RENAME rewrites all references to the table name in the schema (this is the default behavior).

### `PRAGMA recursive_triggers = (on|off)`

Toggles the recursive trigger capability. When `PRAGMA recursive_triggers` is set to:

* `ON`: triggers which fire can activate other triggers (a single trigger can fire multiple times over the same row)
* `OFF`: triggers which fire cannot activate other triggers

### `PRAGMA reverse_unordered_selects = (on|off)`

Toggles the order of the results of a SELECT statement without an ORDER BY clause. When `PRAGMA reverse_unordered_selects` is set to:

* `ON`: reverses the order of results of a SELECT statement
* `OFF`: returns the results of a SELECT statement in the usual order

### `PRAGMA foreign_keys = (on|off)`

Toggles the foreign key constraint enforcement. When `PRAGMA foreign_keys` is set to:

* `ON`: stops operations which violate foreign key constraints
* `OFF`: allows operations which violate foreign key constraints

### `PRAGMA defer_foreign_keys = (on|off)`

Allows you to defer the enforcement of [foreign key constraints](https://developers.cloudflare.com/d1/sql-api/foreign-keys/) until the end of the current transaction. This can be useful during [database migrations](https://developers.cloudflare.com/d1/reference/migrations/), as schema changes may temporarily violate constraints depending on the order in which they are applied.

This does not disable foreign key enforcement outside of the current transaction. If you have not resolved outstanding foreign key violations at the end of your transaction, it will fail with a `FOREIGN KEY constraint failed` error.

Note that setting `PRAGMA defer_foreign_keys = ON` does not prevent `ON DELETE CASCADE` actions from being executed. While foreign key constraint checks are deferred until the end of a transaction, `ON DELETE CASCADE` operations will remain active, consistent with SQLite's behavior.

To defer foreign key enforcement, set `PRAGMA defer_foreign_keys = on` at the start of your transaction, or ahead of changes that would violate constraints:

```sql
-- Defer foreign key enforcement in this transaction.
PRAGMA defer_foreign_keys = on


-- Run your CREATE TABLE or ALTER TABLE / COLUMN statements
ALTER TABLE users ...


-- This is implicit if not set by the end of the transaction.
PRAGMA defer_foreign_keys = off
```

Refer to the [foreign key documentation](https://developers.cloudflare.com/d1/sql-api/foreign-keys/) to learn more about how to work with foreign keys.

### `PRAGMA optimize`

Attempts to optimize all schemas in a database by running the `ANALYZE` command for each table, if necessary. `ANALYZE` updates an internal table which contain statistics about tables and indices. These statistics helps the query planner to execute the input query more efficiently.

When `PRAGMA optimize` runs `ANALYZE`, it sets a limit to ensure the command does not take too long to execute. Alternatively, `PRAGMA optimize` may deem it unnecessary to run `ANALYZE` (for example, if the schema has not changed significantly). In this scenario, no optimizations are made.

We recommend running this command after making any changes to the schema (for example, after [creating an index](https://developers.cloudflare.com/d1/best-practices/use-indexes/)).

Note

Currently, D1 does not support `PRAGMA optimize(-1)`.

`PRAGMA optimize(-1)` is a command which displays all optimizations that would have been performed without actually executing them.

Refer to [SQLite PRAGMA optimize documentation](https://www.sqlite.org/pragma.html#pragma_optimize) for more information on how `PRAGMA optimize` optimizes a database.

## Query `sqlite_master`

You can also query the `sqlite_master` table to show all tables, indexes, and the original SQL used to generate them:

```sql
SELECT name, sql FROM sqlite_master
```

```json
      {
        "name": "users",
        "sql": "CREATE TABLE users ( user_id INTEGER PRIMARY KEY, email_address TEXT, created_at INTEGER, deleted INTEGER, settings TEXT)"
      },
      {
        "name": "idx_ordered_users",
        "sql": "CREATE INDEX idx_ordered_users ON users(created_at DESC)"
      },
      {
        "name": "Order",
        "sql": "CREATE TABLE \"Order\" ( \"Id\" INTEGER PRIMARY KEY, \"CustomerId\" VARCHAR(8000) NULL, \"EmployeeId\" INTEGER NOT NULL, \"OrderDate\" VARCHAR(8000) NULL, \"RequiredDate\" VARCHAR(8000) NULL, \"ShippedDate\" VARCHAR(8000) NULL, \"ShipVia\" INTEGER NULL, \"Freight\" DECIMAL NOT NULL, \"ShipName\" VARCHAR(8000) NULL, \"ShipAddress\" VARCHAR(8000) NULL, \"ShipCity\" VARCHAR(8000) NULL, \"ShipRegion\" VARCHAR(8000) NULL, \"ShipPostalCode\" VARCHAR(8000) NULL, \"ShipCountry\" VARCHAR(8000) NULL)"
      },
      {
        "name": "Product",
        "sql": "CREATE TABLE \"Product\" ( \"Id\" INTEGER PRIMARY KEY, \"ProductName\" VARCHAR(8000) NULL, \"SupplierId\" INTEGER NOT NULL, \"CategoryId\" INTEGER NOT NULL, \"QuantityPerUnit\" VARCHAR(8000) NULL, \"UnitPrice\" DECIMAL NOT NULL, \"UnitsInStock\" INTEGER NOT NULL, \"UnitsOnOrder\" INTEGER NOT NULL, \"ReorderLevel\" INTEGER NOT NULL, \"Discontinued\" INTEGER NOT NULL)"
      }
```

## Search with LIKE

You can perform a search using SQL's `LIKE` operator:

```js
const { results } = await env.DB.prepare(
  "SELECT * FROM Customers WHERE CompanyName LIKE ?",
)
  .bind("%eve%")
  .run();
console.log("results: ", results);
```

```js
results:  [...]
```

## Related resources

* Learn [how to create indexes](https://developers.cloudflare.com/d1/best-practices/use-indexes/#list-indexes) in D1.
* Use D1's [JSON functions](https://developers.cloudflare.com/d1/sql-api/query-json/) to query JSON data.
* Use [`wrangler dev`](https://developers.cloudflare.com/workers/wrangler/commands/#dev) to run your Worker and D1 locally and debug issues before deploying.

</page>

<page>
---
title: Build a Comments API · Cloudflare D1 docs
description: In this tutorial, you will learn how to use D1 to add comments to a
  static blog site. You will construct a new D1 database, and build a JSON API
  that allows the creation and retrieval of comments.
lastUpdated: 2026-02-02T18:38:11.000Z
chatbotDeprioritize: false
tags: Hono,JavaScript,SQL
source_url:
  html: https://developers.cloudflare.com/d1/tutorials/build-a-comments-api/
  md: https://developers.cloudflare.com/d1/tutorials/build-a-comments-api/index.md
---

In this tutorial, you will learn how to use D1 to add comments to a static blog site. To do this, you will construct a new D1 database, and build a JSON API that allows the creation and retrieval of comments.

## Prerequisites

Use [C3](https://developers.cloudflare.com/learning-paths/workers/get-started/c3-and-wrangler/#c3), the command-line tool for Cloudflare's developer products, to create a new directory and initialize a new Worker project:

* npm

  ```sh
  npm create cloudflare@latest -- d1-example
  ```

* yarn

  ```sh
  yarn create cloudflare d1-example
  ```

* pnpm

  ```sh
  pnpm create cloudflare@latest d1-example
  ```

For setup, select the following options:

* For *What would you like to start with?*, choose `Hello World example`.
* For *Which template would you like to use?*, choose `Worker only`.
* For *Which language do you want to use?*, choose `JavaScript`.
* For *Do you want to use git for version control?*, choose `Yes`.
* For *Do you want to deploy your application?*, choose `No` (we will be making some changes before deploying).

To start developing your Worker, `cd` into your new project directory:

```sh
cd d1-example
```

## Video Tutorial

## 1. Install Hono

In this tutorial, you will use [Hono](https://github.com/honojs/hono), an Express.js-style framework, to build your API. To use Hono in this project, install it using `npm`:

* npm

  ```sh
  npm i hono
  ```

* yarn

  ```sh
  yarn add hono
  ```

* pnpm

  ```sh
  pnpm add hono
  ```

## 2. Initialize your Hono application

In `src/worker.js`, initialize a new Hono application, and define the following endpoints:

* `GET /api/posts/:slug/comments`.
* `POST /api/posts/:slug/comments`.

```js
import { Hono } from "hono";


const app = new Hono();


app.get("/api/posts/:slug/comments", async (c) => {
  // Do something and return an HTTP response
  // Optionally, do something with `c.req.param("slug")`
});


app.post("/api/posts/:slug/comments", async (c) => {
  // Do something and return an HTTP response
  // Optionally, do something with `c.req.param("slug")`
});


export default app;
```

## 3. Create a database

You will now create a D1 database. In Wrangler, there is support for the `wrangler d1` subcommand, which allows you to create and query your D1 databases directly from the command line. Create a new database with `wrangler d1 create`:

```sh
npx wrangler d1 create d1-example
```

Reference your created database in your Worker code by creating a [binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/) inside of your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/). Bindings allow us to access Cloudflare resources, like D1 databases, KV namespaces, and R2 buckets, using a variable name in code. In the Wrangler configuration file, set up the binding `DB` and connect it to the `database_name` and `database_id`:

* wrangler.jsonc

  ```jsonc
  {
    "d1_databases": [
      {
        "binding": "DB", // available in your Worker on `env.DB`
        "database_name": "d1-example",
        "database_id": "4e1c28a9-90e4-41da-8b4b-6cf36e5abb29"
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  [[d1_databases]]
  binding = "DB"
  database_name = "d1-example"
  database_id = "4e1c28a9-90e4-41da-8b4b-6cf36e5abb29"
  ```

With your binding configured in your Wrangler file, you can interact with your database from the command line, and inside your Workers function.

## 4. Interact with D1

Interact with D1 by issuing direct SQL commands using `wrangler d1 execute`:

```sh
npx wrangler d1 execute d1-example --remote --command "SELECT name FROM sqlite_schema WHERE type ='table'"
```

```sh
Executing on d1-example:


┌───────┐
│ name  │
├───────┤
│ d1_kv │
└───────┘
```

You can also pass a SQL file - perfect for initial data seeding in a single command. Create `schemas/schema.sql`, which will create a new `comments` table for your project:

```sql
DROP TABLE IF EXISTS comments;
CREATE TABLE IF NOT EXISTS comments (
  id integer PRIMARY KEY AUTOINCREMENT,
  author text NOT NULL,
  body text NOT NULL,
  post_slug text NOT NULL
);
CREATE INDEX idx_comments_post_slug ON comments (post_slug);


-- Optionally, uncomment the below query to create data


-- INSERT INTO COMMENTS (author, body, post_slug) VALUES ('Kristian', 'Great post!', 'hello-world');
```

With the file created, execute the schema file against the D1 database by passing it with the flag `--file`:

```sh
npx wrangler d1 execute d1-example --remote --file schemas/schema.sql
```

## 5. Execute SQL

In earlier steps, you created a SQL database and populated it with initial data. Now, you will add a route to your Workers function to retrieve data from that database. Based on your Wrangler configuration in previous steps, your D1 database is now accessible via the `DB` binding. In your code, use the binding to prepare SQL statements and execute them, for example, to retrieve comments:

```js
app.get("/api/posts/:slug/comments", async (c) => {
  const { slug } = c.req.param();
  const { results } = await c.env.DB.prepare(
    `
    select * from comments where post_slug = ?
  `,
  )
    .bind(slug)
    .run();
  return c.json(results);
});
```

The above code makes use of the `prepare`, `bind`, and `run` functions on a D1 binding to prepare and execute a SQL statement. Refer to [D1 Workers Binding API](https://developers.cloudflare.com/d1/worker-api/) for a list of all methods available.

In this function, you accept a `slug` URL query parameter and set up a new SQL statement where you select all comments with a matching `post_slug` value to your query parameter. You can then return it as a JSON response.

## 6. Insert data

The previous steps grant read-only access to your data. To create new comments by inserting data into the database, define another endpoint in `src/worker.js`:

```js
app.post("/api/posts/:slug/comments", async (c) => {
  const { slug } = c.req.param();
  const { author, body } = await c.req.json();


  if (!author) return c.text("Missing author value for new comment");
  if (!body) return c.text("Missing body value for new comment");


  const { success } = await c.env.DB.prepare(
    `
    insert into comments (author, body, post_slug) values (?, ?, ?)
  `,
  )
    .bind(author, body, slug)
    .run();


  if (success) {
    c.status(201);
    return c.text("Created");
  } else {
    c.status(500);
    return c.text("Something went wrong");
  }
});
```

## 7. Deploy your Hono application

With your application ready for deployment, use Wrangler to build and deploy your project to the Cloudflare network.

Begin by running `wrangler whoami` to confirm that you are logged in to your Cloudflare account. If you are not logged in, Wrangler will prompt you to login, creating an API key that you can use to make authenticated requests automatically from your local machine.

After you have logged in, confirm that your Wrangler file is configured similarly to what is seen below. You can change the `name` field to a project name of your choice:

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "d1-example",
    "main": "src/worker.js",
    "compatibility_date": "2026-02-10",
    "d1_databases": [
      {
        "binding": "DB", // available in your Worker on env.DB
        "database_name": "<YOUR_DATABASE_NAME>",
        "database_id": "<YOUR_DATABASE_UUID>"
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "d1-example"
  main = "src/worker.js"
  compatibility_date = "2026-02-10"


  [[d1_databases]]
  binding = "DB"
  database_name = "<YOUR_DATABASE_NAME>"
  database_id = "<YOUR_DATABASE_UUID>"
  ```

Now, run `npx wrangler deploy` to deploy your project to Cloudflare.

```sh
npx wrangler deploy
```

When it has successfully deployed, test the API by making a `GET` request to retrieve comments for an associated post. Since you have no posts yet, this response will be empty, but it will still make a request to the D1 database regardless, which you can use to confirm that the application has deployed correctly:

```sh
# Note: Your workers.dev deployment URL may be different
curl https://d1-example.signalnerve.workers.dev/api/posts/hello-world/comments
[
  {
    "id": 1,
    "author": "Kristian",
    "body": "Hello from the comments section!",
    "post_slug": "hello-world"
  }
]
```

## 8. Test with an optional frontend

This application is an API back-end, best served for use with a front-end UI for creating and viewing comments. To test this back-end with a prebuild front-end UI, refer to the example UI in the [example-frontend directory](https://github.com/cloudflare/workers-sdk/tree/main/templates/worker-d1-api/example-frontend). Notably, the [`loadComments` and `submitComment` functions](https://github.com/cloudflare/workers-sdk/tree/main/templates/worker-d1-api/example-frontend/src/views/PostView.vue#L57-L82) make requests to a deployed version of this site, meaning you can take the frontend and replace the URL with your deployed version of the codebase in this tutorial to use your own data.

Interacting with this API from a front-end will require enabling specific Cross-Origin Resource Sharing (or *CORS*) headers in your back-end API. Hono allows you to enable Cross-Origin Resource Sharing for your application. Import the `cors` module and add it as middleware to your API in `src/worker.js`:

```typescript
import { Hono } from "hono";
import { cors } from "hono/cors";


const app = new Hono();
app.use("/api/*", cors());
```

Now, when you make requests to `/api/*`, Hono will automatically generate and add CORS headers to responses from your API, allowing front-end UIs to interact with it without erroring.

## Conclusion

In this example, you built a comments API for powering a blog. To see the full source for this D1-powered comments API, you can visit [cloudflare/workers-sdk/templates/worker-d1-api](https://github.com/cloudflare/workers-sdk/tree/main/templates/worker-d1-api).

</page>

<page>
---
title: Build a Staff Directory Application · Cloudflare D1 docs
description: Build a staff directory using D1. Users access employee info;
  admins add new employees within the app.
lastUpdated: 2026-02-02T18:38:11.000Z
chatbotDeprioritize: false
tags: Hono,TypeScript,SQL
source_url:
  html: https://developers.cloudflare.com/d1/tutorials/build-a-staff-directory-app/
  md: https://developers.cloudflare.com/d1/tutorials/build-a-staff-directory-app/index.md
---

In this tutorial, you will learn how to use D1 to build a staff directory. This application will allow users to access information about an organization's employees and give admins the ability to add new employees directly within the app. To do this, you will first need to set up a [D1 database](https://developers.cloudflare.com/d1/get-started/) to manage data seamlessly, then you will develop and deploy your application using the [HonoX Framework](https://github.com/honojs/honox) and [Cloudflare Pages](https://developers.cloudflare.com/pages).

## Prerequisites

Before moving forward with this tutorial, make sure you have the following:

* A Cloudflare account, if you do not have one, [sign up](https://dash.cloudflare.com/sign-up/workers-and-pages) before continuing.
* A recent version of [npm](https://docs.npmjs.com/getting-started) installed.

If you do not want to go through with the setup now, [view the completed code](https://github.com/lauragift21/staff-directory) on GitHub.

## 1. Install HonoX

In this tutorial, you will use [HonoX](https://github.com/honojs/honox), a meta-framework for creating full-stack websites and Web APIs to build your application. To use HonoX in your project, run the `hono-create` command.

To get started, run the following command:

```sh
npm create hono@latest
```

During the setup process, you will be asked to provide a name for your project directory and to choose a template. When making your selection, choose the `x-basic` template.

## 2. Initialize your HonoX application

Once your project is set up, you can see a list of generated files as below. This is a typical project structure for a HonoX application:

```plaintext
.
├── app
│   ├── global.d.ts // global type definitions
│   ├── routes
│   │   ├── _404.tsx // not found page
│   │   ├── _error.tsx // error page
│   │   ├── _renderer.tsx // renderer definition
│   │   ├── about
│   │   │   └── [name].tsx // matches `/about/:name`
│   │   └── index.tsx // matches `/`
│   └── server.ts // server entry file
├── package.json
├── tsconfig.json
└── vite.config.ts
```

The project includes directories for app code, routes, and server setup, alongside configuration files for package management, TypeScript, and Vite.

## 3. Create a database

To create a database for your project, use the Cloudflare CLI tool, [Wrangler](https://developers.cloudflare.com/workers/wrangler), which supports the `wrangler d1` command for D1 database operations. Create a new database named `staff-directory` with the following command:

```sh
npx wrangler d1 create staff-directory
```

After creating your database, you will need to set up a [binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/) in the [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) to integrate your database with your application.

This binding enables your application to interact with Cloudflare resources such as D1 databases, KV namespaces, and R2 buckets. To configure this, create a Wrangler file in your project's root directory and input the basic setup information:

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "staff-directory",
    "compatibility_date": "2026-02-10"
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "staff-directory"
  compatibility_date = "2026-02-10"
  ```

Next, add the database binding details to your Wrangler file. This involves specifying a binding name (in this case, `DB`), which will be used to reference the database within your application, along with the `database_name` and `database_id` provided when you created the database:

* wrangler.jsonc

  ```jsonc
  {
    "d1_databases": [
      {
        "binding": "DB",
        "database_name": "staff-directory",
        "database_id": "f495af5f-dd71-4554-9974-97bdda7137b3"
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  [[d1_databases]]
  binding = "DB"
  database_name = "staff-directory"
  database_id = "f495af5f-dd71-4554-9974-97bdda7137b3"
  ```

You have now configured your application to access and interact with your D1 database, either through the command line or directly within your codebase.

You will also need to make adjustments to your Vite config file in `vite.config.js`. Add the following config settings to ensure that Vite is properly set up to work with Cloudflare bindings in local environment:

```ts
import adapter from "@hono/vite-dev-server/cloudflare";


export default defineConfig(({ mode }) => {
  if (mode === "client") {
    return {
      plugins: [client()],
    };
  } else {
    return {
      plugins: [
        honox({
          devServer: {
            adapter,
          },
        }),
        pages(),
      ],
    };
  }
});
```

## 4. Interact with D1

To interact with your D1 database, you can directly issue SQL commands using the `wrangler d1 execute` command:

```sh
wrangler d1 execute staff-directory --command "SELECT name FROM sqlite_schema WHERE type ='table'"
```

The command above allows you to run queries or operations directly from the command line.

For operations such as initial data seeding or batch processing, you can pass a SQL file with your commands. To do this, create a `schema.sql` file in the root directory of your project and insert your SQL queries into this file:

```sql
CREATE TABLE locations (
    location_id INTEGER PRIMARY KEY AUTOINCREMENT,
    location_name VARCHAR(255) NOT NULL
);


CREATE TABLE departments (
    department_id INTEGER PRIMARY KEY AUTOINCREMENT,
    department_name VARCHAR(255) NOT NULL
);


CREATE TABLE employees (
    employee_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    join_date DATE NOT NULL,
    location_id INTEGER REFERENCES locations(location_id),
    department_id INTEGER REFERENCES departments(department_id)
);


INSERT INTO locations (location_name) VALUES ('London, UK'), ('Paris, France'), ('Berlin, Germany'), ('Lagos, Nigeria'), ('Nairobi, Kenya'), ('Cairo, Egypt'), ('New York, NY'), ('San Francisco, CA'), ('Chicago, IL');


INSERT INTO departments (department_name) VALUES ('Software Engineering'), ('Product Management'), ('Information Technology (IT)'), ('Quality Assurance (QA)'), ('User Experience (UX)/User Interface (UI) Design'), ('Sales and Marketing'), ('Human Resources (HR)'), ('Customer Support'), ('Research and Development (R&D)'), ('Finance and Accounting');
```

The above queries will create three tables: `Locations`, `Departments`, and `Employees`. To populate these tables with initial data, use the `INSERT INTO` command. After preparing your schema file with these commands, you can apply it to the D1 database. Do this by using the `--file` flag to specify the schema file for execution:

```sh
wrangler d1 execute staff-directory --file=./schema.sql
```

To execute the schema locally and seed data into your local directory, pass the `--local` flag to the above command.

## 5. Create SQL statements

After setting up your D1 database and configuring the Wrangler file as outlined in previous steps, your database is accessible in your code through the `DB` binding. This allows you to directly interact with the database by preparing and executing SQL statements. In the following step, you will learn how to use this binding to perform common database operations such as retrieving data and inserting new records.

### Retrieve data from database

```ts
export const findAllEmployees = async (db: D1Database) => {
  const query = `
      SELECT employees.*, locations.location_name, departments.department_name
      FROM employees
      JOIN locations ON employees.location_id = locations.location_id
      JOIN departments ON employees.department_id = departments.department_id
      `;
  const { results } = await db.prepare(query).run();
  const employees = results;
  return employees;
};
```

### Insert data into the database

```ts
export const createEmployee = async (db: D1Database, employee: Employee) => {
  const query = `
      INSERT INTO employees (name, position, join_date, image_url, department_id, location_id)
      VALUES (?, ?, ?, ?, ?, ?)`;


  const results = await db
    .prepare(query)
    .bind(
      employee.name,
      employee.position,
      employee.join_date,
      employee.image_url,
      employee.department_id,
      employee.location_id,
    )
    .run();
  const employees = results;
  return employees;
};
```

For a complete list of all the queries used in the application, refer to the [db.ts](https://github.com/lauragift21/staff-directory/blob/main/app/db.ts) file in the codebase.

## 6. Develop the UI

The application uses `hono/jsx` for rendering. You can set up a Renderer in `app/routes/_renderer.tsx` using the JSX-rendered middleware, serving as the entry point for your application:

```ts
import { jsxRenderer } from 'hono/jsx-renderer'
import { Script } from 'honox/server'


export default jsxRenderer(({ children, title }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <Script src="/app/client.ts" async />
      </head>
      <body>{children}</body>
    </html>
  )
})
```

Add the bindings defined earlier in `global.d.ts` file where the global type definitions for TypeScript is defined ensuring type consistency across your application:

```ts
declare module "hono" {
  interface Env {
    Variables: {};
    Bindings: {
      DB: D1Database;
    };
  }
}
```

This application uses [Tailwind CSS](https://tailwindcss.com/) for styling. To use Tailwind CSS, refer to the [TailwindCSS documentation](https://v2.tailwindcss.com/docs), or follow the steps [provided on GitHub](https://github.com/honojs/honox?tab=readme-ov-file#using-tailwind-css).

To display a list of employees, invoke the `findAllEmployees` function from your `db.ts` file and call that within the `routes/index.tsx` file. The `createRoute()` function present in the file serves as a helper function for defining routes that handle different HTTP methods like `GET`, `POST`, `PUT`, or `DELETE`.

```ts
import { css } from 'hono/css'
import { createRoute } from 'honox/factory'
import Counter from '../islands/counter'


const className = css`
  font-family: sans-serif;
`


export default createRoute((c) => {
  const name = c.req.query('name') ?? 'Hono'
  return c.render(
    <div class={className}>
      <h1>Hello, {name}!</h1>
      <Counter />
    </div>,
    { title: name }
  )
})
```

The existing code within the file includes a placeholder that uses the Counter component. You should replace this section with the following code block:

```ts
import { createRoute } from 'honox/factory'
import type { FC } from 'hono/jsx'
import type { Employee } from '../db'
import { findAllEmployees, findAllDepartments, findAllLocations } from '../db'


const EmployeeCard: FC<{ employee: Employee }> = ({ employee }) => {
  const { employee_id, name, image_url, department_name, location_name } = employee;
  return (
    <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-md">
      <a href={`/employee/${employee_id}`}>
        <img className="bg-indigo-600 p-4 rounded-t-lg" src={image_url} alt={name} />
        //...
      </a>
    </div>
  );
};


export const GET = createRoute(async (c) => {
  const employees = await findAllEmployees(c.env.DB)
  const locations = await findAllLocations(c.env.DB)
  const departments = await findAllDepartments(c.env.DB)
  return c.render(
    <section className="flex-grow">
      <h1 className="mb-4 text-3xl font-extrabold text-gray-900 dark:text-white md:text-5xl lg:text-6xl mt-12">
        <span className="text-transparent bg-clip-text bg-gradient-to-r to-blue-600 from-sky-400">{`Directory `}</span>
      </h1>
      //...
      </section>
      <section className="flex flex-wrap -mx-4">
        {employees.map((employee) => (
          <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2 mb-4">
            <EmployeeCard employee={employee} />
          </div>
        ))}
      </section>
    </section>
  )
})
```

The code snippet demonstrates how to import the `findAllEmployees`, `findAllLocations`, and `findAllDepartments` functions from the `db.ts` file, and how to use the binding `c.env.DB` to invoke these functions. With these, you can retrieve and display the fetched data on the page.

### Add an employee

Use the `export POST` route to create a new employee through the `/admin` page:

```ts
import { createRoute } from "honox/factory";
import type { Employee } from "../../db";
import { getFormDataValue, getFormDataNumber } from "../../utils/formData";
import { createEmployee } from "../../db";


export const POST = createRoute(async (c) => {
  try {
    const formData = await c.req.formData();
    const imageFile = formData.get("image_file");
    let imageUrl = "";


    // TODO: process image url with R2


    const employeeData: Employee = {
      employee_id: getFormDataValue(formData, "employee_id"),
      name: getFormDataValue(formData, "name"),
      position: getFormDataValue(formData, "position"),
      image_url: imageUrl,
      join_date: getFormDataValue(formData, "join_date"),
      department_id: getFormDataNumber(formData, "department_id"),
      location_id: getFormDataNumber(formData, "location_id"),
      location_name: "",
      department_name: "",
    };


    await createEmployee(c.env.DB, employeeData);
    return c.redirect("/", 303);
  } catch (error) {
    return new Response("Error processing your request", { status: 500 });
  }
});
```

### Store images in R2

During the process of creating a new employee, the image uploaded can be stored in an R2 bucket prior to being added to the database.

To store an image in an R2 bucket:

1. Create an R2 bucket.
2. Upload the image to this bucket.
3. Obtain a public URL for the image from the bucket. This URL is then saved in your database, linking to the image stored in the R2 bucket.

Use the `wrangler r2 bucket create` command to create a bucket:

```sh
wrangler r2 bucket create employee-avatars
```

Once the bucket is created, add the R2 bucket binding to your Wrangler file:

* wrangler.jsonc

  ```jsonc
  {
    "r2_buckets": [
      {
        "binding": "MY_BUCKET",
        "bucket_name": "employee-avatars"
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  [[r2_buckets]]
  binding = "MY_BUCKET"
  bucket_name = "employee-avatars"
  ```

Pass the R2 binding to the `global.d.ts` file:

```ts
declare module "hono" {
  interface Env {
    Variables: {};
    Bindings: {
      DB: D1Database;
      MY_BUCKET: R2Bucket;
    };
  }
}
```

To store the uploaded image in the R2 bucket, you can use the `put()` method provided by R2. This method allows you to upload the image file to your bucket:

```ts
if (imageFile instanceof File) {
  const key = `${new Date().getTime()}-${imageFile.name}`;
  const fileBuffer = await imageFile.arrayBuffer();


  await c.env.MY_BUCKET.put(key, fileBuffer, {
    httpMetadata: {
      contentType: imageFile.type || "application/octet-stream",
    },
  });
  console.log(`File uploaded successfully: ${key}`);
  imageUrl = `https://pub-8d936184779047cc96686a631f318fce.r2.dev/${key}`;
}
```

[Refer to GitHub](https://github.com/lauragift21/staff-directory) for the full codebase.

## 7. Deploy your HonoX application

With your application ready for deployment, you can use Wrangler to build and deploy your project to the Cloudflare Network. Ensure you are logged in to your Cloudflare account by running the `wrangler whoami` command. If you are not logged in, Wrangler will prompt you to login by creating an API key that you can use to make authenticated requests automatically from your computer.

After successful login, confirm that your Wrangler file is configured similarly to the code block below:

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "staff-directory",
    "compatibility_date": "2026-02-10",
    "r2_buckets": [
      {
        "binding": "MY_BUCKET",
        "bucket_name": "employee-avatars"
      }
    ],
    "d1_databases": [
      {
        "binding": "DB",
        "database_name": "staff-directory",
        "database_id": "f495af5f-dd71-4554-9974-97bdda7137b3"
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "staff-directory"
  compatibility_date = "2026-02-10"


  [[r2_buckets]]
  binding = "MY_BUCKET"
  bucket_name = "employee-avatars"


  [[d1_databases]]
  binding = "DB"
  database_name = "staff-directory"
  database_id = "f495af5f-dd71-4554-9974-97bdda7137b3"
  ```

Run `wrangler deploy` to deploy your project to Cloudflare. After deployment you can test your application is working by accessing the deployed URL provided for you. Your browser should display your application with the base frontend you created. If you do not have any data populated in your database, go to the `/admin` page to add a new employee, and this should return a new employee in your home page.

## Conclusion

In this tutorial, you built a staff directory application where users can view all employees within an organization. Refer to the [Staff directory repository](https://github.com/lauragift21/staff-directory) for the full source code.

![staff directory demo](https://github.com/lauragift21/staff-directory/raw/main/demo.gif)

</page>

<page>
---
title: Build an API to access D1 using a proxy Worker · Cloudflare D1 docs
description: This tutorial shows how to create an API that allows you to
  securely run queries against a D1 database. The API can be used to customize
  access controls and/or limit what tables can be queried.
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
tags: Hono,TypeScript,SQL
source_url:
  html: https://developers.cloudflare.com/d1/tutorials/build-an-api-to-access-d1/
  md: https://developers.cloudflare.com/d1/tutorials/build-an-api-to-access-d1/index.md
---

In this tutorial, you will learn how to create an API that allows you to securely run queries against a D1 database.

This is useful if you want to access a D1 database outside of a Worker or Pages project, customize access controls and/or limit what tables can be queried.

D1's built-in [REST API](https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/create/) is best suited for administrative use as the global [Cloudflare API rate limit](https://developers.cloudflare.com/fundamentals/api/reference/limits) applies.

To access a D1 database outside of a Worker project, you need to create an API using a Worker. Your application can then securely interact with this API to run D1 queries.

Note

D1 uses parameterized queries. This prevents SQL injection. To make your API more secure, validate the input using a library like [zod](https://zod.dev/).

## Prerequisites

1. Sign up for a [Cloudflare account](https://dash.cloudflare.com/sign-up/workers-and-pages).
2. Install [`Node.js`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).
3. Have an existing D1 database. Refer to [Get started tutorial for D1](https://developers.cloudflare.com/d1/get-started/).

Node.js version manager

Use a Node version manager like [Volta](https://volta.sh/) or [nvm](https://github.com/nvm-sh/nvm) to avoid permission issues and change Node.js versions. [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/), discussed later in this guide, requires a Node version of `16.17.0` or later.

## 1. Create a new project

Create a new Worker to create and deploy your API.

1. Create a Worker named `d1-http` by running:

   * npm

     ```sh
     npm create cloudflare@latest -- d1-http
     ```

   * yarn

     ```sh
     yarn create cloudflare d1-http
     ```

   * pnpm

     ```sh
     pnpm create cloudflare@latest d1-http
     ```

   For setup, select the following options:

   * For *What would you like to start with?*, choose `Hello World example`.
   * For *Which template would you like to use?*, choose `Worker only`.
   * For *Which language do you want to use?*, choose `TypeScript`.
   * For *Do you want to use git for version control?*, choose `Yes`.
   * For *Do you want to deploy your application?*, choose `No` (we will be making some changes before deploying).

2. Change into your new project directory to start developing:

   ```sh
   cd d1-http
   ```

## 2. Install Hono

In this tutorial, you will use [Hono](https://github.com/honojs/hono), an Express.js-style framework, to build the API.

1. To use Hono in this project, install it using `npm`:

   * npm

     ```sh
     npm i hono
     ```

   * yarn

     ```sh
     yarn add hono
     ```

   * pnpm

     ```sh
     pnpm add hono
     ```

## 3. Add an API\_KEY

You need an API key to make authenticated calls to the API. To ensure that the API key is secure, add it as a [secret](https://developers.cloudflare.com/workers/configuration/secrets).

1. For local development, create a `.dev.vars` file in the root directory of `d1-http`.

2. Add your API key in the file as follows.

   ```bash
   API_KEY="YOUR_API_KEY"
   ```

   Replace `YOUR_API_KEY` with a valid string value. You can also generate this value using the following command.

   ```sh
   openssl rand -base64 32
   ```

Note

In this step, we have defined the name of the API key to be `API_KEY`.

## 4. Initialize the application

To initialize the application, you need to import the required packages, initialize a new Hono application, and configure the following middleware:

* [Bearer Auth](https://hono.dev/docs/middleware/builtin/bearer-auth): Adds authentication to the API.
* [Logger](https://hono.dev/docs/middleware/builtin/logger): Allows monitoring the flow of requests and responses.
* [Pretty JSON](https://hono.dev/docs/middleware/builtin/pretty-json): Enables "JSON pretty print" for JSON response bodies.

1. Replace the contents of the `src/index.ts` file with the code below.

   ```ts
   import { Hono } from "hono";
   import { bearerAuth } from "hono/bearer-auth";
   import { logger } from "hono/logger";
   import { prettyJSON } from "hono/pretty-json";


   type Bindings = {
     API_KEY: string;
   };


   const app = new Hono<{ Bindings: Bindings }>();


   app.use("*", prettyJSON(), logger(), async (c, next) => {
     const auth = bearerAuth({ token: c.env.API_KEY });
     return auth(c, next);
   });
   ```

## 5. Add API endpoints

1. Add the following snippet into your `src/index.ts`.

   ```ts
   // Paste this code at the end of the src/index.ts file


   app.post("/api/all", async (c) => {
     return c.text("/api/all endpoint");
   });


   app.post("/api/exec", async (c) => {
     return c.text("/api/exec endpoint");
   });


   app.post("/api/batch", async (c) => {
     return c.text("/api/batch endpoint");
   });


   export default app;
   ```

   This adds the following endpoints:

   * POST `/api/all`
   * POST `/api/exec`
   * POST `/api/batch`

2. Start the development server by running the following command:

   * npm

     ```sh
     npm run dev
     ```

   * yarn

     ```sh
     yarn run dev
     ```

   * pnpm

     ```sh
     pnpm run dev
     ```

3. To test the API locally, open a second terminal.

4. In the second terminal, execute the below cURL command. Replace `YOUR_API_KEY` with the value you set in the `.dev.vars` file.

   ```sh
   curl -H "Authorization: Bearer YOUR_API_KEY" "http://localhost:8787/api/all" --data '{}'
   ```

   You should get the following output:

   ```txt
   /api/all endpoint
   ```

5. Stop the local server from running by pressing `x` in the first terminal.

The Hono application is now set up. You can test the other endpoints and add more endpoints if needed. The API does not yet return any information from your database. In the next steps, you will create a database, add its bindings, and update the endpoints to interact with the database.

## 6. Create a database

If you do not have a D1 database already, you can create a new database with `wrangler d1 create`.

1. In your terminal, run:

   ```sh
   npx wrangler d1 create d1-http-example
   ```

   You may be asked to login to your Cloudflare account. Once logged in, the command will create a new D1 database. You should see a similar output in your terminal.

   ```sh
   ✅ Successfully created DB 'd1-http-example' in region EEUR
   Created your new D1 database.


   [[d1_databases]]
   binding = "DB" # i.e. available in your Worker on env.DB
   database_name = "d1-http-example"
   database_id = "1234567890"
   ```

Make a note of the displayed `database_name` and `database_id`. You will use this to reference the database by creating a [binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/).

## 7. Add a binding

1. From your `d1-http` folder, open the Wrangler file, Wrangler's configuration file.

2. Add the following binding in the file. Make sure that the `database_name` and the `database_id` are correct.

   * wrangler.jsonc

     ```jsonc
     {
       "d1_databases": [
         {
           "binding": "DB", // i.e. available in your Worker on env.DB
           "database_name": "d1-http-example",
           "database_id": "1234567890"
         }
       ]
     }
     ```

   * wrangler.toml

     ```toml
     [[d1_databases]]
     binding = "DB"
     database_name = "d1-http-example"
     database_id = "1234567890"
     ```

3. In your `src/index.ts` file, update the `Bindings` type by adding `DB: D1Database`.

   ```ts
   type Bindings = {
     DB: D1Database;
     API_KEY: string;
   };
   ```

You can now access the database in the Hono application.

## 8. Create a table

To create a table in your newly created database:

1. Create a new folder called `schemas` inside your `d1-http` folder.

2. Create a new file called `schema.sql`, and paste the following SQL statement into the file.

   ```sql
   DROP TABLE IF EXISTS posts;
   CREATE TABLE IF NOT EXISTS posts (
     id integer PRIMARY KEY AUTOINCREMENT,
     author text NOT NULL,
     title text NOT NULL,
     body text NOT NULL,
     post_slug text NOT NULL
   );
   INSERT INTO posts (author, title, body, post_slug) VALUES ('Harshil', 'D1 HTTP API', 'Learn to create an API to query your D1 database.','d1-http-api');
   ```

   The code drops any table named `posts` if it exists, then creates a new table `posts` with the field `id`, `author`, `title`, `body`, and `post_slug`. It then uses an INSERT statement to populate the table.

3. In your terminal, execute the following command to create this table:

   ```sh
   npx wrangler d1 execute d1-http-example --file=./schemas/schema.sql
   ```

Upon successful execution, a new table will be added to your database.

Note

The table will be created in the local instance of the database. If you want to add this table to your production database set `"remote" : true` in the D1 binding configuration. Refer to the [remote bindings documentation](https://developers.cloudflare.com/workers/development-testing/#remote-bindings) for more information.

## 9. Query the database

Your application can now access the D1 database. In this step, you will update the API endpoints to query the database and return the result.

1. In your `src/index.ts` file, update the code as follow.

   ```ts
   // Update the API routes


   /**
   * Executes the `stmt.run()` method.
   * https://developers.cloudflare.com/d1/worker-api/prepared-statements/#run
   */


   app.post('/api/all', async (c) => {
       return c.text("/api/all endpoint");
     try {
       let { query, params } = await c.req.json();
       let stmt = c.env.DB.prepare(query);
       if (params) {
         stmt = stmt.bind(params);
       }


       const result = await stmt.run();
       return c.json(result);
     } catch (err) {
       return c.json({ error: `Failed to run query: ${err}` }, 500);
     }
   });


   /**
   * Executes the `db.exec()` method.
   * https://developers.cloudflare.com/d1/worker-api/d1-database/#exec
   */


   app.post('/api/exec', async (c) => {
       return c.text("/api/exec endpoint");
     try {
       let { query } = await c.req.json();
       let result = await c.env.DB.exec(query);
       return c.json(result);
     } catch (err) {
       return c.json({ error: `Failed to run query: ${err}` }, 500);
     }
   });


   /**
   * Executes the `db.batch()` method.
   * https://developers.cloudflare.com/d1/worker-api/d1-database/#batch
   */


   app.post('/api/batch', async (c) => {
       return c.text("/api/batch endpoint");
     try {
       let { batch } = await c.req.json();
       let stmts = [];
       for (let query of batch) {
         let stmt = c.env.DB.prepare(query.query);
         if (query.params) {
           stmts.push(stmt.bind(query.params));
         } else {
           stmts.push(stmt);
         }
       }
       const results = await c.env.DB.batch(stmts);
       return c.json(results);
     } catch (err) {
       return c.json({ error: `Failed to run query: ${err}` }, 500);
     }
   });
   ...
   ```

In the above code, the endpoints are updated to receive `query` and `params`. These queries and parameters are passed to the respective functions to interact with the database.

* If the query is successful, you receive the result from the database.
* If there is an error, the error message is returned.

## 10. Test the API

Now that the API can query the database, you can test it locally.

1. Start the development server by executing the following command:

   * npm

     ```sh
     npm run dev
     ```

   * yarn

     ```sh
     yarn run dev
     ```

   * pnpm

     ```sh
     pnpm run dev
     ```

2. In a new terminal window, execute the following cURL commands. Make sure to replace `YOUR_API_KEY` with the correct value.

   ```sh
   curl -H "Authorization: Bearer YOUR_API_KEY" "http://localhost:8787/api/all" --data '{"query": "SELECT title FROM posts WHERE id=?", "params":1}'
   ```

   ```sh
   curl -H "Authorization: Bearer YOUR_API_KEY" "http://localhost:8787/api/batch" --data '{"batch": [ {"query": "SELECT title FROM posts WHERE id=?", "params":1},{"query": "SELECT id FROM posts"}]}'
   ```

   ```sh
   curl -H "Authorization: Bearer YOUR_API_KEY" "localhost:8787/api/exec" --data '{"query": "INSERT INTO posts (author, title, body, post_slug) VALUES ('\''Harshil'\'', '\''D1 HTTP API'\'', '\''Learn to create an API to query your D1 database.'\'','\''d1-http-api'\'')" }'
   ```

If everything is implemented correctly, the above commands should result successful outputs.

## 11. Deploy the API

Now that everything is working as expected, the last step is to deploy it to the Cloudflare network. You will use Wrangler to deploy the API.

1. To use the API in production instead of using it locally, you need to add the table to your remote (production) database. To add the table to your production database, run the following command:

   ```sh
   npx wrangler d1 execute d1-http-example --file=./schemas/schema.sql --remote
   ```

   You should now be able to view the table on the [Cloudflare dashboard > **Storage & Databases** > **D1**.](https://dash.cloudflare.com/?to=/:account/workers/d1/)

2. To deploy the application to the Cloudflare network, run the following command:

   ```sh
   npx wrangler deploy
   ```

   ```sh
    ⛅️ wrangler 3.78.4 (update available 3.78.5)
   -------------------------------------------------------


   Total Upload: 53.00 KiB / gzip: 13.16 KiB
   Your worker has access to the following bindings:
   - D1 Databases:
     - DB: d1-http-example (DATABASE_ID)
   Uploaded d1-http (4.29 sec)
   Deployed d1-http triggers (5.57 sec)
     [DEPLOYED_APP_LINK]
   Current Version ID: [BINDING_ID]
   ```

   Upon successful deployment, you will get the link of the deployed app in the terminal (`DEPLOYED_APP_LINK`). Make a note of it.

3. Generate a new API key to use in production.

   ```sh
   openssl rand -base64 32
   ```

   ```sh
   [YOUR_API_KEY]
   ```

4. Execute the `wrangler secret put` command to add an API to the deployed project.

   ```sh
   npx wrangler secret put API_KEY
   ```

   ```sh
   ✔ Enter a secret value:
   ```

   The terminal will prompt you to enter a secret value.

5. Enter the value of your API key (`YOUR_API_KEY`). Your API key will now be added to your project. Using this value you can make secure API calls to your deployed API.

   ```sh
   ✔ Enter a secret value: [YOUR_API_KEY]
   ```

   ```sh
   🌀 Creating the secret for the Worker "d1-http"
   ✨ Success! Uploaded secret API_KEY
   ```

6. To test it, run the following cURL command with the correct `YOUR_API_KEY` and `DEPLOYED_APP_LINK`.

   * Use the `YOUR_API_KEY` you have generated as the secret API key.
   * You can also find your `DEPLOYED_APP_LINK` from the Cloudflare dashboard > **Workers & Pages** > **`d1-http`** > **Settings** > **Domains & Routes**.

   ```sh
   curl -H "Authorization: Bearer YOUR_API_KEY" "https://DEPLOYED_APP_LINK/api/exec" --data '{"query": "SELECT 1"}'
   ```

## Summary

In this tutorial, you have:

1. Created an API that interacts with your D1 database.
2. Deployed this API to the Workers. You can use this API in your external application to execute queries against your D1 database. The full code for this tutorial can be found on [GitHub](https://github.com/harshil1712/d1-http-example/tree/main).

## Next steps

You can check out a similar implementation that uses Zod for validation in [this GitHub repository](https://github.com/elithrar/http-api-d1-example). If you want to build an OpenAPI compliant API for your D1 database, you should use the [Cloudflare Workers OpenAPI 3.1 template](https://github.com/cloudflare/workers-sdk/tree/main/templates/worker-openapi).

</page>

<page>
---
title: Query D1 using Prisma ORM · Cloudflare D1 docs
description: This tutorial shows you how to set up and deploy a Cloudflare
  Worker that is accessing a D1 database from scratch.
lastUpdated: 2026-02-02T18:38:11.000Z
chatbotDeprioritize: false
tags: TypeScript,SQL
source_url:
  html: https://developers.cloudflare.com/d1/tutorials/d1-and-prisma-orm/
  md: https://developers.cloudflare.com/d1/tutorials/d1-and-prisma-orm/index.md
---

## What is Prisma ORM?

[Prisma ORM](https://www.prisma.io/orm) is a next-generation JavaScript and TypeScript ORM that unlocks a new level of developer experience when working with databases thanks to its intuitive data model, automated migrations, type-safety and auto-completion.

To learn more about Prisma ORM, refer to the [Prisma documentation](https://www.prisma.io/docs).

## Query D1 from a Cloudflare Worker using Prisma ORM

This tutorial shows you how to set up and deploy a Cloudflare Worker that is accessing a D1 database from scratch.

## Quick start

If you want to skip the steps and get started quickly, select **Deploy to Cloudflare** below.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/docs-examples/tree/d1-prisma/d1/query-d1-using-prisma)

This creates a repository in your GitHub account and deploys the application to Cloudflare Workers. Use this option if you are familiar with Cloudflare Workers, and wish to skip the step-by-step guidance.

You may wish to manually follow the steps if you are new to Cloudflare Workers.

## Prerequisites

* [`Node.js`](https://nodejs.org/en/) and [`npm`](https://docs.npmjs.com/getting-started) installed on your machine.
* A [Cloudflare account](https://dash.cloudflare.com).

## 1. Create a Cloudflare Worker

Open your terminal, and run the following command to create a Cloudflare Worker using Cloudflare's [`hello-world`](https://github.com/cloudflare/workers-sdk/tree/4fdd8987772d914cf50725e9fa8cb91a82a6870d/packages/create-cloudflare/templates/hello-world) template:

```sh
npm create cloudflare@latest prisma-d1-example -- --type hello-world
```

In your terminal, you will be asked a series of questions related your project:

1. Answer `yes` to using TypeScript.
2. Answer `no` to deploying your Worker.

## 2. Initialize Prisma ORM

Note

D1 is supported in Prisma ORM as of [v5.12.0](https://github.com/prisma/prisma/releases/tag/5.12.0).

To set up Prisma ORM, go into your project directory, and install the Prisma CLI:

```sh
cd prisma-d1-example
```

* npm

  ```sh
  npm i -D prisma
  ```

* yarn

  ```sh
  yarn add -D prisma
  ```

* pnpm

  ```sh
  pnpm add -D prisma
  ```

Next, install the Prisma Client package and the driver adapter for D1:

* npm

  ```sh
  npm i @prisma/client @prisma/adapter-d1
  ```

* yarn

  ```sh
  yarn add @prisma/client @prisma/adapter-d1
  ```

* pnpm

  ```sh
  pnpm add @prisma/client @prisma/adapter-d1
  ```

Finally, bootstrap the files required by Prisma ORM using the following command:

* npm

  ```sh
  npx prisma init --datasource-provider sqlite
  ```

* yarn

  ```sh
  yarn prisma init --datasource-provider sqlite
  ```

* pnpm

  ```sh
  pnpm prisma init --datasource-provider sqlite
  ```

The command above:

1. Creates a new directory called `prisma` that contains your [Prisma schema](https://www.prisma.io/docs/orm/prisma-schema/overview) file.
2. Creates a `.env` file used to configure environment variables that will be read by the Prisma CLI.

In this tutorial, you will not need the `.env` file since the connection between Prisma ORM and D1 will happen through a [binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/). The next steps will instruct you through setting up this binding.

Since you will use the [driver adapter](https://www.prisma.io/docs/orm/overview/databases/database-drivers#driver-adapters) feature which is currently in Preview, you need to explicitly enable it via the `previewFeatures` field on the `generator` block.

Open your `schema.prisma` file and adjust the `generator` block to reflect as follows:

```prisma
generator client {
  provider        = "prisma-client-js"
  output          = "../src/generated/prisma"
  previewFeatures = ["driverAdapters"]
}
```

## 3. Create your D1 database

In this step, you will set up your D1 database. You can create a D1 database via the [Cloudflare dashboard](https://dash.cloudflare.com), or via `wrangler`. This tutorial will use the `wrangler` CLI.

Open your terminal and run the following command:

```sh
npx wrangler d1 create prisma-demo-db
```

You should receive the following output on your terminal:

```plaintext
✅ Successfully created DB 'prisma-demo-db' in region WEUR
Created your new D1 database.


{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "prisma-demo-db",
      "database_id": "<D1_DATABASE_ID>"
    }
  ]
}
```

You now have a D1 database in your Cloudflare account with a binding to your Cloudflare Worker.

Copy the last part of the command output and paste it into your Wrangler file. It should look similar to this:

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "prisma-d1-example",
    "main": "src/index.ts",
    "compatibility_date": "2026-02-10",
    "compatibility_flags": [
      "nodejs_compat"
    ],
    "observability": {
      "enabled": true
    },
    "d1_databases": [
      {
        "binding": "DB", // i.e. available in your Worker on env.DB
        "database_name": "prisma-demo-db",
        "database_id": "<D1_DATABASE_ID>"
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "prisma-d1-example"
  main = "src/index.ts"
  compatibility_date = "2026-02-10"
  compatibility_flags = [ "nodejs_compat" ]


  [observability]
  enabled = true


  [[d1_databases]]
  binding = "DB"
  database_name = "prisma-demo-db"
  database_id = "<D1_DATABASE_ID>"
  ```

Replace `<D1_DATABASE_ID>` with the database ID of your D1 instance. If you were not able to fetch this ID from the terminal output, you can also find it in the [Cloudflare dashboard](https://dash.cloudflare.com/), or by running `npx wrangler d1 info prisma-demo-db` in your terminal.

Next, you will create a database table in the database to send queries to D1 using Prisma ORM.

## 4. Create a table in the database

[Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/overview) does not support D1 yet, so you cannot follow the default migration workflows using `prisma migrate dev` or `prisma db push`.

Note

Prisma Migrate for D1 is currently in Early Access. If you want to try it out, you can follow the instructions on the [Prisma documentation](https://www.prisma.io/docs/orm/overview/databases/cloudflare-d1#using-prisma-migrate-via-a-driver-adapter-in-prismaconfigts-early-access).

D1 uses [migrations](https://developers.cloudflare.com/d1/reference/migrations) for managing schema changes, and the Prisma CLI can help generate the necessary SQL for those updates. In the steps below, you will use both tools to create and apply a migration to your database.

First, create a new migration using `wrangler`:

```sh
npx wrangler d1 migrations create prisma-demo-db create_user_table
```

Answer `yes` to creating a new folder called `migrations`.

The command has now created a new directory called `migrations` and an empty file called `0001_create_user_table.sql` inside of it:

Next, you need to add the SQL statement that will create a `User` table to that file.

Open the `schema.prisma` file and add the following `User` model to your schema:

```prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}
```

Now, run the following command in your terminal to generate the SQL statement that creates a `User` table equivalent to the `User` model above:

```sh
npx prisma migrate diff --from-empty --to-schema-datamodel ./prisma/schema.prisma --script --output migrations/0001_create_user_table.sql
```

This stores a SQL statement to create a new `User` table in your migration file from before, here is what it looks like:

```sql
-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT
);


-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
```

`UNIQUE INDEX` on `email` was created because the `User` model in your Prisma schema is using the [`@unique`](https://www.prisma.io/docs/orm/reference/prisma-schema-reference#unique) attribute on its `email` field.

You now need to use the `wrangler d1 migrations apply` command to send this SQL statement to D1. This command accepts two options:

* `--local`: Executes the statement against a *local* version of D1. This local version of D1 is a SQLite database file that will be located in the `.wrangler/state` directory of your project. Use this approach when you want to develop and test your Worker on your local machine. Refer to [Local development](https://developers.cloudflare.com/d1/best-practices/local-development/) to learn more.
* `--remote`: Executes the statement against your *remote* version of D1. This version is used by your *deployed* Cloudflare Workers. Refer to [Remote development](https://developers.cloudflare.com/d1/best-practices/remote-development/) to learn more.

In this tutorial, you will do both local and remote development. You will test the Worker locally, then deploy your Worker afterwards.

Open your terminal, and run both commands:

```sh
# For the local database
npx wrangler d1 migrations apply prisma-demo-db --local
```

```sh
# For the remote database
npx wrangler d1 migrations apply prisma-demo-db --remote
```

Choose `Yes` both times when you are prompted to confirm that the migration should be applied.

Next, create some data that you can query once the Worker is running. This time, you will run the SQL statement without storing it in a file:

```sh
# For the local database
npx wrangler d1 execute prisma-demo-db --command "INSERT INTO  \"User\" (\"email\", \"name\") VALUES
('jane@prisma.io', 'Jane Doe (Local)');" --local
```

```sh
# For the remote database
npx wrangler d1 execute prisma-demo-db --command "INSERT INTO  \"User\" (\"email\", \"name\") VALUES
('jane@prisma.io', 'Jane Doe (Remote)');" --remote
```

Note

If you receive an error to the effect of `Unknown arguments: (\email\,, \name\)...`, you may need to escape the double quotes with backticks (\`) instead of backslashes (\\).

Your Wrangler command will then look like:

```sh
# Escape with ` instead of \
npx wrangler d1 execute prisma-demo-db --command "INSERT INTO  `"User`" (`"email`", `"name`") VALUES
('jane@prisma.io', 'Jane Doe (Local)');" --<FLAG>
```

## 5. Query your database from the Worker

To query your database from the Worker using Prisma ORM, you need to:

1. Add `DB` to the `Env` interface.
2. Instantiate `PrismaClient` using the `PrismaD1` driver adapter.
3. Send a query using Prisma Client and return the result.

Open `src/index.ts` and replace the entire content with the following:

* JavaScript

  ```js
  import { PrismaClient } from "./generated/prisma/";
  import { PrismaD1 } from "@prisma/adapter-d1";


  export default {
    async fetch(request, env, ctx) {
      const adapter = new PrismaD1(env.DB);
      const prisma = new PrismaClient({ adapter });


      const users = await prisma.user.findMany();
      const result = JSON.stringify(users);
      return new Response(result);
    },
  };
  ```

* TypeScript

  ```ts
  import { PrismaClient } from './generated/prisma/';
  import { PrismaD1 } from '@prisma/adapter-d1';


  export interface Env {
    DB: D1Database;
  }


  export default {
    async fetch(request, env, ctx): Promise<Response> {
      const adapter = new PrismaD1(env.DB);
      const prisma = new PrismaClient({ adapter });


      const users = await prisma.user.findMany();
      const result = JSON.stringify(users);
      return new Response(result);
    },
  } satisfies ExportedHandler<Env>;
  ```

Before running the Worker, generate Prisma Client with the following command:

```sh
npx prisma generate
```

## 6. Run the Worker locally

Now that you have the database query in place and Prisma Client generated, run the Worker locally:

```sh
npm run dev
```

Open your browser at [`http://localhost:8787`](http://localhost:8787/) to check the result of the database query:

```json
[{ "id": 1, "email": "jane@prisma.io", "name": "Jane Doe (Local)" }]
```

## 7. Deploy the Worker

To deploy the Worker, run the following command:

```sh
npm run deploy
```

Access your Worker at `https://prisma-d1-example.USERNAME.workers.dev`. Your browser should display the following data queried from your remote D1 database:

```json
[{ "id": 1, "email": "jane@prisma.io", "name": "Jane Doe (Remote)" }]
```

By finishing this tutorial, you have deployed a Cloudflare Worker using D1 as a database and querying it via Prisma ORM.

## Related resources

* [Prisma documentation](https://www.prisma.io/docs/getting-started).
* To get help, open a new [GitHub Discussion](https://github.com/prisma/prisma/discussions/), or [ask the AI bot in the Prisma docs](https://www.prisma.io/docs).
* [Ready-to-run examples using Prisma ORM](https://github.com/prisma/prisma-examples/).
* Check out the [Prisma community](https://www.prisma.io/community), follow [Prisma on X](https://www.x.com/prisma) and join the [Prisma Discord](https://pris.ly/discord).
* [Developer Experience Redefined: Prisma & Cloudflare Lead the Way to Data DX](https://www.prisma.io/blog/cloudflare-partnership-qerefgvwirjq).

</page>

<page>
---
title: Bulk import to D1 using REST API · Cloudflare D1 docs
description: This tutorial uses the REST API to import a database into D1.
lastUpdated: 2025-10-09T15:47:46.000Z
chatbotDeprioritize: false
tags: JavaScript,TypeScript,SQL
source_url:
  html: https://developers.cloudflare.com/d1/tutorials/import-to-d1-with-rest-api/
  md: https://developers.cloudflare.com/d1/tutorials/import-to-d1-with-rest-api/index.md
---

In this tutorial, you will learn how to import a database into D1 using the [REST API](https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/import/).

## Prerequisites

1. Sign up for a [Cloudflare account](https://dash.cloudflare.com/sign-up/workers-and-pages).
2. Install [`Node.js`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

Node.js version manager

Use a Node version manager like [Volta](https://volta.sh/) or [nvm](https://github.com/nvm-sh/nvm) to avoid permission issues and change Node.js versions. [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/), discussed later in this guide, requires a Node version of `16.17.0` or later.

## 1. Create a D1 API token

To use REST APIs, you need to generate an API token to authenticate your API requests. You can do this through the Cloudflare dashboard.

1. In the Cloudflare dashboard, go to the **API Tokens** page.

   [Go to **Account API tokens**](https://dash.cloudflare.com/?to=/:account/api-tokens)

2. Under **API Tokens**, select **Create Token**.

3. Scroll to **Custom token** > **Create custom token**, then select **Get started**.

4. Under **Token name**, enter a descriptive token name. For example, `Name-D1-Import-API-Token`.

5. Under **Permissions**:

   * Select **Account**.
   * Select **D1**.
   * Select **Edit**.

6. Select **Continue to summary**.

7. Select **Create token**.

8. Copy the API token and save it in a secure file.

* Refer to [Create API token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/) for more information on creating API tokens through the Cloudflare dashboard.
* Refer to [Create tokens via API](https://developers.cloudflare.com/fundamentals/api/how-to/create-via-api/) for more information on creating API tokens through API.

## 2. Create the target table

You must have an existing D1 table which matches the schema of the data you wish to import.

This tutorial uses the following:

* A database called `d1-import-tutorial`.
* A table called `TargetD1Table`
* Within `TargetD1Table`, three columns called `id`, `text`, and `date_added`.

To create the table, follow these steps:

1. In the Cloudflare dashboard, go to the **D1** page.

   [Go to **D1 SQL database**](https://dash.cloudflare.com/?to=/:account/workers/d1)

2. Select **Create database**.

3. Name your database. For this tutorial, name your D1 database `d1-import-tutorial`.

4. (Optional) Provide a location hint. Location hint is an optional parameter you can provide to indicate your desired geographical location for your database. Refer to [Provide a location hint](https://developers.cloudflare.com/d1/configuration/data-location/#provide-a-location-hint) for more information.

5. Select **Create**.

6. Go to **Console**, then paste the following SQL snippet. This creates a table named `TargetD1Table`.

   ```sql
   DROP TABLE IF EXISTS TargetD1Table;
   CREATE TABLE IF NOT EXISTS TargetD1Table (id INTEGER PRIMARY KEY, text TEXT, date_added TEXT);
   ```

   Alternatively, you can use the [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/).

   ```bash
   # Create a D1 database
   npx wrangler d1 create d1-import-tutorial


   # Create a D1 table
   npx wrangler d1 execute d1-import-tutorial --command="DROP TABLE IF EXISTS TargetD1Table; CREATE TABLE IF NOT EXISTS TargetD1Table (id INTEGER PRIMARY KEY, text TEXT, date_added TEXT);" --remote
   ```

## 3. Create an `index.js` file

1. Create a new directory and initialize a new Node.js project.

   ```bash
   mkdir d1-import-tutorial
   cd d1-import-tutorial
   npm init -y
   ```

2. In this repository, create a new file called `index.js`. This file will contain the code which uses REST API to import your data to your D1 database.

3. In your `index.js` file, define the following variables:

   * `TARGET_TABLE`: The target table name
   * `ACCOUNT_ID`: The account ID. Refer to **Account Details** in **Workers & Pages**.
   * `DATABASE_ID`: The D1 database ID. Go to your data base to see your database ID.
   * `D1_API_KEY`: The D1 API token generated in [step 1](https://developers.cloudflare.com/d1/tutorials/import-to-d1-with-rest-api#1-create-a-d1-api-token)

   Warning

   In production, you should use environment variables to store sensitive information.

   ```js
   const TARGET_TABLE = " "; // for the tutorial, `TargetD1Table`
   const ACCOUNT_ID = " ";
   const DATABASE_ID = " ";
   const D1_API_KEY = " ";
   const D1_URL = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/import`;
   const filename = crypto.randomUUID(); // create a random filename
   const uploadSize = 500;
   const headers = {
     "Content-Type": "application/json",
     Authorization: `Bearer ${D1_API_KEY}`,
   };
   ```

## 4. Generate example data (optional)

In practice, you may already have the data you wish to import to a D1 database.

This tutorial generates example data to demonstrate the import process.

1. Install the `@faker-js/faker` module.

   * npm

     ```sh
     npm i @faker-js/faker
     ```

   * yarn

     ```sh
     yarn add @faker-js/faker
     ```

   * pnpm

     ```sh
     pnpm add @faker-js/faker
     ```

2. Add the following code at the beginning of the `index.js` file. This code creates an array called `data` with 2500 (`uploadSize`) array elements, where each array element contains an object with `id`, `text`, and `date_added`. Each array element corresponds to a table row.

   ```js
   import crypto from "crypto";
   import { faker } from "@faker-js/faker";


   // Generate Fake data
   const data = Array.from({ length: uploadSize }, () => ({
     id: Math.floor(Math.random() * 1000000),
     text: faker.lorem.paragraph(),
     date_added: new Date().toISOString().slice(0, 19).replace("T", " "),
   }));
   ```

## 5. Generate the SQL command

1. Create a function that will generate the SQL command to insert the data into the target table. This function uses the `data` array generated in the previous step.

   ```js
   function makeSqlInsert(data, tableName, skipCols = []) {
     const columns = Object.keys(data[0]).join(",");
     const values = data
       .map((row) => {
         return (
           "(" +
           Object.values(row)
             .map((val) => {
               if (skipCols.includes(val) || val === null || val === "") {
                 return "NULL";
               }
               return `'${String(val).replace(/'/g, "").replace(/"/g, "'")}'`;
             })
             .join(",") +
           ")"
         );
       })
       .join(",");


     return `INSERT INTO ${tableName} (${columns}) VALUES ${values};`;
   }
   ```

## 6. Import the data to D1

The import process consists of four steps:

1. **Init upload**: This step initializes the upload process. It sends the hash of the SQL command to the D1 API and receives an upload URL.
2. **Upload to R2**: This step uploads the SQL command to the upload URL.
3. **Start ingestion**: This step starts the ingestion process.
4. **Polling**: This step polls the import process until it completes.

1) Create a function called `uploadToD1` which executes the four steps of the import process.

   ```js
   async function uploadToD1() {
     // 1. Init upload
     const hashStr = crypto.createHash("md5").update(sqlInsert).digest("hex");


     try {
       const initResponse = await fetch(D1_URL, {
         method: "POST",
         headers,
         body: JSON.stringify({
           action: "init",
           etag: hashStr,
         }),
       });


       const uploadData = await initResponse.json();
       const uploadUrl = uploadData.result.upload_url;
       const filename = uploadData.result.filename;


       // 2. Upload to R2
       const r2Response = await fetch(uploadUrl, {
         method: "PUT",
         body: sqlInsert,
       });


       const r2Etag = r2Response.headers.get("ETag").replace(/"/g, "");


       // Verify etag
       if (r2Etag !== hashStr) {
         throw new Error("ETag mismatch");
       }


       // 3. Start ingestion
       const ingestResponse = await fetch(D1_URL, {
         method: "POST",
         headers,
         body: JSON.stringify({
           action: "ingest",
           etag: hashStr,
           filename,
         }),
       });


       const ingestData = await ingestResponse.json();
       console.log("Ingestion Response:", ingestData);


       // 4. Polling
       await pollImport(ingestData.result.at_bookmark);


       return "Import completed successfully";
     } catch (e) {
       console.error("Error:", e);
       return "Import failed";
     }
   }
   ```

   In the above code:

   * An `md5` hash of the SQL command is generated.
   * `initResponse` initializes the upload process and receives the upload URL.
   * `r2Response` uploads the SQL command to the upload URL.
   * Before starting ingestion, the ETag is verified.
   * `ingestResponse` starts the ingestion process.
   * `pollImport` polls the import process until it completes.

2) Add the `pollImport` function to the `index.js` file.

   ```js
   async function pollImport(bookmark) {
     const payload = {
       action: "poll",
       current_bookmark: bookmark,
     };


     while (true) {
       const pollResponse = await fetch(D1_URL, {
         method: "POST",
         headers,
         body: JSON.stringify(payload),
       });


       const result = await pollResponse.json();
       console.log("Poll Response:", result.result);


       const { success, error } = result.result;


       if (
         success ||
         (!success && error === "Not currently importing anything.")
       ) {
         break;
       }


       await new Promise((resolve) => setTimeout(resolve, 1000));
     }
   }
   ```

   The code above does the following:

   * Sends a `poll` action to the D1 API.
   * Polls the import process until it completes.

3) Finally, add the `runImport` function to the `index.js` file to run the import process.

   ```js
   async function runImport() {
     const result = await uploadToD1();
     console.log(result);
   }


   runImport();
   ```

## 7. Write the final code

In the previous steps, you have created functions to execute various processes involved in importing data into D1. The final code executes those functions to import the example data into the target D1 table.

1. Copy the final code of your `index.js` file as shown below, with your variables defined at the top of the code.

   ```js
   import crypto from "crypto";
   import { faker } from "@faker-js/faker";


   const TARGET_TABLE = "";
   const ACCOUNT_ID = "";
   const DATABASE_ID = "";
   const D1_API_KEY = "";
   const D1_URL = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/import`;
   const uploadSize = 500;
   const headers = {
     "Content-Type": "application/json",
     Authorization: `Bearer ${D1_API_KEY}`,
   };


   // Generate Fake data
   const data = Array.from({ length: uploadSize }, () => ({
     id: Math.floor(Math.random() * 1000000),
     text: faker.lorem.paragraph(),
     date_added: new Date().toISOString().slice(0, 19).replace("T", " "),
   }));


   // Make SQL insert statements
   function makeSqlInsert(data, tableName, skipCols = []) {
     const columns = Object.keys(data[0]).join(",");
     const values = data
       .map((row) => {
         return (
           "(" +
           Object.values(row)
             .map((val) => {
               if (skipCols.includes(val) || val === null || val === "") {
                 return "NULL";
               }
               return `'${String(val).replace(/'/g, "").replace(/"/g, "'")}'`;
             })
             .join(",") +
           ")"
         );
       })
       .join(",");


     return `INSERT INTO ${tableName} (${columns}) VALUES ${values};`;
   }


   const sqlInsert = makeSqlInsert(data, TARGET_TABLE);


   async function pollImport(bookmark) {
     const payload = {
       action: "poll",
       current_bookmark: bookmark,
     };


     while (true) {
       const pollResponse = await fetch(D1_URL, {
         method: "POST",
         headers,
         body: JSON.stringify(payload),
       });


       const result = await pollResponse.json();
       console.log("Poll Response:", result.result);


       const { success, error } = result.result;


       if (
         success ||
         (!success && error === "Not currently importing anything.")
       ) {
         break;
       }


       await new Promise((resolve) => setTimeout(resolve, 1000));
     }
   }


   // Upload to D1
   async function uploadToD1() {
     // 1. Init upload
     const hashStr = crypto.createHash("md5").update(sqlInsert).digest("hex");


     try {
       const initResponse = await fetch(D1_URL, {
         method: "POST",
         headers,
         body: JSON.stringify({
           action: "init",
           etag: hashStr,
         }),
       });


       const uploadData = await initResponse.json();
       const uploadUrl = uploadData.result.upload_url;
       const filename = uploadData.result.filename;


       // 2. Upload to R2
       const r2Response = await fetch(uploadUrl, {
         method: "PUT",
         body: sqlInsert,
       });


       const r2Etag = r2Response.headers.get("ETag").replace(/"/g, "");


       // Verify etag
       if (r2Etag !== hashStr) {
         throw new Error("ETag mismatch");
       }


       // 3. Start ingestion
       const ingestResponse = await fetch(D1_URL, {
         method: "POST",
         headers,
         body: JSON.stringify({
           action: "ingest",
           etag: hashStr,
           filename,
         }),
       });


       const ingestData = await ingestResponse.json();
       console.log("Ingestion Response:", ingestData);


       // 4. Polling
       await pollImport(ingestData.result.at_bookmark);


       return "Import completed successfully";
     } catch (e) {
       console.error("Error:", e);
       return "Import failed";
     }
   }


   async function runImport() {
     const result = await uploadToD1();
     console.log(result);
   }


   runImport();
   ```

## 8. Run the code

1. Run your code.

   ```sh
   node index.js
   ```

You will now see your target D1 table populated with the example data.

Note

If you encounter the `statement too long` error, you would need to break your SQL command into smaller chunks and upload them in batches. You can learn more about this error in the [D1 documentation](https://developers.cloudflare.com/d1/best-practices/import-export-data/#resolve-statement-too-long-error).

## Summary

By completing this tutorial, you have

1. Created an API token.
2. Created a target database and table.
3. Generated example data.
4. Created SQL command for the example data.
5. Imported your example data into the D1 target table using REST API.

</page>

<page>
---
title: Using D1 Read Replication for your e-commerce website · Cloudflare D1 docs
description: D1 Read Replication is a feature that allows you to replicate your
  D1 database to multiple regions. This is useful for your e-commerce website,
  as it reduces read latencies and improves read throughput.
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
tags: JavaScript,TypeScript,SQL
source_url:
  html: https://developers.cloudflare.com/d1/tutorials/using-read-replication-for-e-com/
  md: https://developers.cloudflare.com/d1/tutorials/using-read-replication-for-e-com/index.md
---

[D1 Read Replication](https://developers.cloudflare.com/d1/best-practices/read-replication/) is a feature that allows you to replicate your D1 database to multiple regions. This is useful for your e-commerce website, as it reduces read latencies and improves read throughput. In this tutorial, you will learn how to use D1 read replication for your e-commerce website.

While this tutorial uses a fictional e-commerce website, the principles can be applied to any use-case that requires low read latencies and scaling reads, such as a news website, a social media platform, or a marketing website.

## Quick start

If you want to skip the steps and get started quickly, click on the below button:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/harshil1712/e-com-d1-hono)

This will create a repository in your GitHub account and deploy the application to Cloudflare Workers. It will also create and bind a D1 database, create the required tables, add some sample data. During deployment, tick the `Enable read replication` box to activate read replication.

You can then visit the deployed application.

## Prerequisites

1. Sign up for a [Cloudflare account](https://dash.cloudflare.com/sign-up/workers-and-pages).
2. Install [`Node.js`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

Node.js version manager

Use a Node version manager like [Volta](https://volta.sh/) or [nvm](https://github.com/nvm-sh/nvm) to avoid permission issues and change Node.js versions. [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/), discussed later in this guide, requires a Node version of `16.17.0` or later.

## Step 1: Create a Workers project

Create a new Workers project by running the following command:

* npm

  ```sh
  npm create cloudflare@latest -- fast-commerce
  ```

* yarn

  ```sh
  yarn create cloudflare fast-commerce
  ```

* pnpm

  ```sh
  pnpm create cloudflare@latest fast-commerce
  ```

For setup, select the following options:

* For *What would you like to start with?*, choose `Hello World example`.
* For *Which template would you like to use?*, choose `SSR / full-stack app`.
* For *Which language do you want to use?*, choose `TypeScript`.
* For *Do you want to use git for version control?*, choose `Yes`.
* For *Do you want to deploy your application?*, choose `No` (we will be making some changes before deploying).

For creating the API routes, you will use [Hono](https://hono.dev/). You need to install Hono by running the following command:

* npm

  ```sh
  npm i hono
  ```

* yarn

  ```sh
  yarn add hono
  ```

* pnpm

  ```sh
  pnpm add hono
  ```

## Step 2: Update the frontend

The above step creates a new Workers project with a default frontend and installs Hono. You will update the frontend to list the products. You will also add a new page to the frontend to display a single product.

Navigate to the newly created Worker project folder.

```sh
cd fast-commerce
```

Update the `public/index.html` file to list the products. Use the below code as a reference.

public/index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>E-commerce Store</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: Arial, sans-serif;
      }


        body {
          background-color: #f9fafb;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }


        header {
          background-color: white;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e5e7eb;
        }


        .store-title {
          font-weight: bold;
          font-size: 1.25rem;
        }


        .cart-button {
          padding: 0.5rem 1rem;
          cursor: pointer;
          background: none;
          border: none;
        }


        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
          padding: 2rem;
        }


        .product-card {
          background-color: white;
          border-radius: 0.5rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }


        .product-info {
          padding: 1rem;
        }


        .product-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }


        .product-description {
          color: #4b5563;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }


        .product-price {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }


        .product-stock {
          color: #4b5563;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }


        .view-details-btn {
          display: block;
          width: 100%;
          padding: 0.5rem 0;
          background-color: #2563eb;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          text-align: center;
          text-decoration: none;
          font-size: 0.875rem;
        }


        .view-details-btn:hover {
          background-color: #1d4ed8;
        }


        footer {
          background-color: white;
          padding: 1rem 2rem;
          text-align: center;
          border-top: 1px solid #e5e7eb;
          color: #4b5563;
          font-size: 0.875rem;
        }


        /* Basic Responsiveness */
        @media (max-width: 768px) {
          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          }
        }


        @media (max-width: 480px) {
          .products-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <header>
        <h1 class="store-title">E-commerce Store</h1>
        <button class="cart-button">Cart</button>
      </header>


      <main class="products-grid" id="products-container">
        <!-- Products will be loaded here by JavaScript -->
      </main>


      <footer>
        <p>© 2025 E-commerce Store. All rights reserved.</p>
      </footer>


      <script>
        document.addEventListener('DOMContentLoaded', () => {
          let products = [];
          let d1Duration,
            queryDuration = 0;
          let dbLocation;
          let isPrimary = true;


          // Function to create product HTML
          function createProductCard(product) {
            return `
                <div class="product-card" data-category="${product.category}">
                    <div class="product-info">
                        <h3 class="product-title">${product.name}</h3>
                        <p class="product-description">${product.description}</p>
                        <p class="product-price">$${product.price.toFixed(2)}</p>
                        <p class="product-stock">${product.inventory} in stock</p>
                        <a href="product-details.html?id=${product.id}" class="view-details-btn">View Details</a>
                    </div>
                </div>
            `;
          }


          // Function to render content
          function renderContent() {
            try {
              const productsContainer = document.getElementById('products-container');
              if (!productsContainer) return;
              productsContainer.innerHTML = '';


              products.forEach((product) => {
                productsContainer.innerHTML += createProductCard(product);
              });
            } catch (error) {
              console.error('Error rendering content:', error);
            }
          }


          // Fetch products
          fetch('/api/products')
            .then((response) => response.json())
            .then((data) => {
              products = data;
              renderContent();
            })
            .catch((error) => console.error('Error fetching products:', error));
        });
      </script>
    </body>


</html>
```

Create a new `public/product-details.html` file to display a single product.

public/product-details.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Product Details - E-commerce Store</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: Arial, sans-serif;
      }


      body {
        background-color: #f9fafb;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }


      header {
        background-color: white;
        padding: 1rem 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #e5e7eb;
      }


      .store-title {
        font-weight: bold;
        font-size: 1.25rem;
        text-decoration: none;
        color: black;
      }


      .cart-button {
        padding: 0.5rem 1rem;
        cursor: pointer;
        background: none;
        border: none;
      }


      .product-container {
        max-width: 800px;
        margin: 2rem auto;
        background-color: white;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        padding: 2rem;
      }


      .product-title {
        font-size: 1.875rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
      }


      .product-description {
        color: #4b5563;
        margin-bottom: 1.5rem;
      }


      .product-price {
        font-size: 1.875rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
      }


      .product-stock {
        font-size: 0.875rem;
        color: #4b5563;
        text-align: right;
      }


      .add-to-cart-btn {
        display: block;
        width: 100%;
        padding: 0.75rem;
        background-color: #2563eb;
        color: white;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        text-align: center;
        font-size: 1rem;
        margin-top: 1.5rem;
      }


      .add-to-cart-btn:hover {
        background-color: #1d4ed8;
      }


      .price-stock-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }


      footer {
        background-color: white;
        padding: 1rem 2rem;
        text-align: center;
        border-top: 1px solid #e5e7eb;
        color: #4b5563;
        font-size: 0.875rem;
        margin-top: auto;
      }


      /* Back button */
      .back-button {
        display: inline-block;
        margin-bottom: 1.5rem;
        color: #2563eb;
        text-decoration: none;
        font-size: 0.875rem;
      }


      .back-button:hover {
        text-decoration: underline;
      }


      /* Notification */
      .notification {
        position: fixed;
        top: 1rem;
        right: 1rem;
        background-color: #10b981;
        color: white;
        padding: 0.75rem 1rem;
        border-radius: 0.375rem;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        transform: translateX(150%);
        transition: transform 0.3s ease;
      }


      .notification.show {
        transform: translateX(0);
      }
    </style>
  </head>
  <body>
    <header>
      <a href="index.html" class="store-title">E-commerce Store</a>
      <button class="cart-button">Cart</button>
    </header>


    <main class="product-container">
      <a href="index.html" class="back-button">← Back to products</a>
      <h1 class="product-title" id="product-title">Product Name</h1>
      <p class="product-description" id="product-description">
        Product description goes here.
      </p>


      <div class="price-stock-container">
        <p class="product-price" id="product-price">$0.00</p>
        <p class="product-stock" id="product-stock">0 in stock</p>
      </div>


      <button class="add-to-cart-btn" id="add-to-cart">Add to Cart</button>
    </main>


    <div class="notification" id="notification">Added to cart!</div>


    <footer>
      <p>© 2025 E-commerce Store. All rights reserved.</p>
    </footer>


    <script>
      // Get query parameter from URL
      const url = new URL(window.location.href);
      const searchParams = new URLSearchParams(url.search);
      const productId = searchParams.get("id");


      // Fetch product details
      fetch(`/api/products/${productId}`)
        .then((response) => response.json())
        .then((product) => displayContent(product))
        .catch((error) =>
          console.error("Error fetching product details:", error),
        );


      // Function to display product details
      function displayContent(product) {
        document.title = `${product[0].name} - E-commerce Store`;
        document.getElementById("product-title").textContent = product[0].name;
        document.getElementById("product-description").textContent =
          product[0].description;
        document.getElementById("product-price").textContent =
          `$${product[0].price.toFixed(2)}`;
        document.getElementById("product-stock").textContent =
          `${product[0].inventory} in stock`;
      }
    </script>
  </body>
</html>
```

You now have a frontend that lists products and displays a single product. However, the frontend is not yet connected to the D1 database. If you start the development server now, you will see no products. In the next steps, you will create a D1 database and create APIs to fetch products and display them on the frontend.

## Step 3: Create a D1 database and enable read replication

Create a new D1 database by running the following command:

```sh
npx wrangler d1 create fast-commerce
```

Add the D1 bindings returned in the terminal to the `wrangler` file:

* wrangler.jsonc

  ```jsonc
  {
    "d1_databases": [
      {
        "binding": "DB",
        "database_name": "fast-commerce",
        "database_id": "YOUR_DATABASE_ID"
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  [[d1_databases]]
  binding = "DB"
  database_name = "fast-commerce"
  database_id = "YOUR_DATABASE_ID"
  ```

Run the following command to update the `Env` interface in the `worker-configuration.d.ts` file.

```sh
npm run cf-typegen
```

Next, enable read replication for the D1 database. Navigate to [**Workers & Pages** > **D1**](https://dash.cloudflare.com/?to=/:account/workers/d1), then select an existing database > **Settings** > **Enable Read Replication**.

## Step 4: Create the API routes

Update the `src/index.ts` file to import the Hono library and create the API routes.

```ts
import { Hono } from "hono";
// Set db session bookmark in the cookie
import { getCookie, setCookie } from "hono/cookie";


const app = new Hono<{ Bindings: Env }>();


// Get all products
app.get("/api/products", async (c) => {
  return c.json({ message: "get list of products" });
});


// Get a single product
app.get("/api/products/:id", async (c) => {
  return c.json({ message: "get a single product" });
});


// Upsert a product
app.post("/api/product", async (c) => {
  return c.json({ message: "create or update a product" });
});


export default app;
```

The above code creates three API routes:

* `GET /api/products`: Returns a list of products.
* `GET /api/products/:id`: Returns a single product.
* `POST /api/product`: Creates or updates a product.

However, the API routes are not connected to the D1 database yet. In the next steps, you will create a products table in the D1 database, and update the API routes to connect to the D1 database.

## Step 5: Create local D1 database schema

Create a products table in the D1 database by running the following command:

```sh
npx wrangler d1 execute fast-commerce --command "CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, description TEXT, price DECIMAL(10, 2) NOT NULL, inventory INTEGER NOT NULL DEFAULT 0, category TEXT NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)"
```

Next, create an index on the products table by running the following command:

```sh
npx wrangler d1 execute fast-commerce --command "CREATE INDEX IF NOT EXISTS idx_products_id ON products (id)"
```

For development purposes, you can also execute the insert statements on the local D1 database by running the following command:

```sh
npx wrangler d1 execute fast-commerce --command "INSERT INTO products (id, name, description, price, inventory, category) VALUES (1, 'Fast Ergonomic Chair', 'A comfortable chair for your home or office', 100.00, 10, 'Furniture'), (2, 'Fast Organic Cotton T-shirt', 'A comfortable t-shirt for your home or office', 20.00, 100, 'Clothing'), (3, 'Fast Wooden Desk', 'A wooden desk for your home or office', 150.00, 5, 'Furniture'), (4, 'Fast Leather Sofa', 'A leather sofa for your home or office', 300.00, 3, 'Furniture'), (5, 'Fast Organic Cotton T-shirt', 'A comfortable t-shirt for your home or office', 20.00, 100, 'Clothing')"
```

## Step 6: Add retry logic

To make the application more resilient, you can add retry logic to the API routes. Create a new file called `retry.ts` in the `src` directory.

```ts
export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
}


const shouldRetry = (error: unknown): boolean => {
  const errMsg = error instanceof Error ? error.message : String(error);
  return (
    errMsg.includes("Network connection lost") ||
    errMsg.includes("storage caused object to be reset") ||
    errMsg.includes("reset because its code was updated")
  );
};


// Helper function for sleeping
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};


export const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  initialDelay: 100,
  maxDelay: 1000,
  backoffFactor: 2,
};


export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = defaultRetryConfig,
): Promise<T> {
  const maxRetries = config.maxRetries ?? defaultRetryConfig.maxRetries;
  const initialDelay = config.initialDelay ?? defaultRetryConfig.initialDelay;
  const maxDelay = config.maxDelay ?? defaultRetryConfig.maxDelay;
  const backoffFactor =
    config.backoffFactor ?? defaultRetryConfig.backoffFactor;


  let lastError: Error | unknown;
  let delay = initialDelay;


  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      lastError = error;


      if (!shouldRetry(error) || attempt === maxRetries) {
        throw error;
      }


      // Add randomness to avoid synchronizing retries
      // Wait for a random delay between delay and delay*2
      await sleep(delay * (1 + Math.random()));


      // Calculate next delay with exponential backoff
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }


  throw lastError;
}
```

The `withRetry` function is a utility function that retries a given operation with exponential backoff. It takes a configuration object as an argument, which allows you to customize the number of retries, initial delay, maximum delay, and backoff factor. It will only retry the operation if the error is due to a network connection loss, storage reset, or code update.

Warning

In a distrubed system, retry mechanisms can have certain risks. Read the article [Retry Strategies in Distributed Systems: Identifying and Addressing Key Pitfalls](https://www.computer.org/publications/tech-news/trends/retry-strategies-avoiding-pitfalls) to learn more about the risks of retry mechanisms and how to avoid them.

Retries can sometimes lead to data inconsistency. Make sure to handle the retry logic carefully.

Next, update the `src/index.ts` file to import the `withRetry` function and use it in the API routes.

```ts
import { withRetry } from "./retry";
```

## Step 7: Update the API routes

Update the API routes to connect to the D1 database.

### 1. POST /api/product

```ts
app.post("/api/product", async (c) => {
  const product = await c.req.json();


  if (!product) {
    return c.json({ message: "No data passed" }, 400);
  }


  const db = c.env.DB;
  const session = db.withSession("first-primary");


  const { id } = product;


  try {
    return await withRetry(async () => {
      // Check if the product exists
      const { results } = await session
        .prepare("SELECT * FROM products where id = ?")
        .bind(id)
        .run();
      if (results.length === 0) {
        const fields = [...Object.keys(product)];
        const values = [...Object.values(product)];
        // Insert the product
        await session
          .prepare(
            `INSERT INTO products (${fields.join(", ")}) VALUES (${fields.map(() => "?").join(", ")})`,
          )
          .bind(...values)
          .run();
        const latestBookmark = session.getBookmark();
        latestBookmark &&
          setCookie(c, "product_bookmark", latestBookmark, {
            maxAge: 60 * 60, // 1 hour
          });
        return c.json({ message: "Product inserted" });
      }


      // Update the product
      const updates = Object.entries(product)
        .filter(([_, value]) => value !== undefined)
        .map(([key, _]) => `${key} = ?`)
        .join(", ");


      if (!updates) {
        throw new Error("No valid fields to update");
      }


      const values = Object.entries(product)
        .filter(([_, value]) => value !== undefined)
        .map(([_, value]) => value);


      await session
        .prepare(`UPDATE products SET ${updates} WHERE id = ?`)
        .bind(...[...values, id])
        .run();
      const latestBookmark = session.getBookmark();
      latestBookmark &&
        setCookie(c, "product_bookmark", latestBookmark, {
          maxAge: 60 * 60, // 1 hour
        });
      return c.json({ message: "Product updated" });
    });
  } catch (e) {
    console.error(e);
    return c.json({ message: "Error upserting product" }, 500);
  }
});
```

In the above code:

* You get the product data from the request body.

* You then check if the product exists in the database.

  * If it does, you update the product.
  * If it doesn't, you insert the product.

* You then set the bookmark in the cookie.

* Finally, you return the response.

Since you want to start the session with the latest data, you use the `first-primary` constraint. Even if you use the `first-unconstrained` constraint or pass a bookmark, the write request will always be routed to the primary database.

The bookmark set in the cookie can be used to guarantee that a new session reads a database version that is at least as up-to-date as the provided bookmark.

If you are using an external platform to manage your products, you can connect this API to the external platform, such that, when a product is created or updated in the external platform, the D1 database automatically updates the product details.

### 2. GET /api/products

```ts
app.get("/api/products", async (c) => {
  const db = c.env.DB;


  // Get bookmark from the cookie
  const bookmark = getCookie(c, "product_bookmark") || "first-unconstrained";


  const session = db.withSession(bookmark);


  try {
    return await withRetry(async () => {
      const { results } = await session.prepare("SELECT * FROM products").run();


      const latestBookmark = session.getBookmark();


      // Set the bookmark in the cookie
      latestBookmark &&
        setCookie(c, "product_bookmark", latestBookmark, {
          maxAge: 60 * 60, // 1 hour
        });


      return c.json(results);
    });
  } catch (e) {
    console.error(e);
    return c.json([]);
  }
});
```

In the above code:

* You get the database session bookmark from the cookie.
  * If the bookmark is not set, you use the `first-unconstrained` constraint.
* You then create a database session with the bookmark.
* You fetch all the products from the database and get the latest bookmark.
* You then set this bookmark in the cookie.
* Finally, you return the results.

### 3. GET /api/products/:id

```ts
app.get("/api/products/:id", async (c) => {
  const id = c.req.param("id");


  if (!id) {
    return c.json({ message: "Invalid id" }, 400);
  }


  const db = c.env.DB;


  // Get bookmark from the cookie
  const bookmark = getCookie(c, "product_bookmark") || "first-unconstrained";


  const session = db.withSession(bookmark);


  try {
    return await withRetry(async () => {
      const { results } = await session
        .prepare("SELECT * FROM products where id = ?")
        .bind(id)
        .run();


      const latestBookmark = session.getBookmark();


      // Set the bookmark in the cookie
      latestBookmark &&
        setCookie(c, "product_bookmark", latestBookmark, {
          maxAge: 60 * 60, // 1 hour
        });


      console.log(results);


      return c.json(results);
    });
  } catch (e) {
    console.error(e);
    return c.json([]);
  }
});
```

In the above code:

* You get the product ID from the request parameters.
* You then create a database session with the bookmark.
* You fetch the product from the database and get the latest bookmark.
* You then set this bookmark in the cookie.
* Finally, you return the results.

## Step 8: Test the application

You have now updated the API routes to connect to the D1 database. You can now test the application by starting the development server and navigating to the frontend.

```sh
npm run dev
```

Navigate to \`<http://localhost:8787>. You should see the products listed. Click on a product to view the product details.

To insert a new product, use the following command (while the development server is running):

```sh
curl -X POST http://localhost:8787/api/product \
     -H "Content-Type: application/json" \
     -d '{"id": 6, "name": "Fast Computer", "description": "A computer for your home or office", "price": 1000.00, "inventory": 10, "category": "Electronics"}'
```

Navigate to `http://localhost:8787/product-details?id=6`. You should see the new product.

Update the product using the following command, and navigate to `http://localhost:8787/product-details?id=6` again. You will see the updated product.

```sh
curl -X POST http://localhost:8787/api/product \
     -H "Content-Type: application/json" \
     -d '{"id": 6, "name": "Fast Computer", "description": "A computer for your home or office", "price": 1050.00, "inventory": 10, "category": "Electronics"}'
```

Note

Read replication is only used when the application has been [deployed](https://developers.cloudflare.com/d1/tutorials/using-read-replication-for-e-com/#step-9-deploy-the-application). D1 does not create read replicas when you develop locally.

To test it locally, you can set `"remote" : true` in the D1 binding configuration. Refer to the [remote bindings documentation](https://developers.cloudflare.com/workers/development-testing/#remote-bindings) for more information.

## Step 9: Deploy the application

Since the database you used in the previous steps is local, you need to create the products table in the remote database. Execute the following D1 commands to create the products table in the remote database.

```sh
npx wrangler d1 execute fast-commerce --remote --command "CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, description TEXT, price DECIMAL(10, 2) NOT NULL, inventory INTEGER NOT NULL DEFAULT 0, category TEXT NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)"
```

Next, create an index on the products table by running the following command:

```sh
npx wrangler d1 execute fast-commerce --remote --command "CREATE INDEX IF NOT EXISTS idx_products_id ON products (id)"
```

Optionally, you can insert the products into the remote database by running the following command:

```sh
npx wrangler d1 execute fast-commerce --remote --command "INSERT INTO products (id, name, description, price, inventory, category) VALUES (1, 'Fast Ergonomic Chair', 'A comfortable chair for your home or office', 100.00, 10, 'Furniture'), (2, 'Fast Organic Cotton T-shirt', 'A comfortable t-shirt for your home or office', 20.00, 100, 'Clothing'), (3, 'Fast Wooden Desk', 'A wooden desk for your home or office', 150.00, 5, 'Furniture'), (4, 'Fast Leather Sofa', 'A leather sofa for your home or office', 300.00, 3, 'Furniture'), (5, 'Fast Organic Cotton T-shirt', 'A comfortable t-shirt for your home or office', 20.00, 100, 'Clothing')"
```

Now, you can deploy the application with the following command:

```sh
npm run deploy
```

This will deploy the application to Workers and the D1 database will be replicated to the remote regions. If a user requests the application from any region, the request will be redirected to the nearest region where the database is replicated.

## Conclusion

In this tutorial, you learned how to use D1 Read Replication for your e-commerce website. You created a D1 database and enabled read replication for it. You then created an API to create and update products in the database. You also learned how to use the bookmark to get the latest data from the database.

You then created the products table in the remote database and deployed the application.

You can use the same approach for your existing read heavy application to reduce read latencies and improve read throughput. If you are using an external platform to manage the content, you can connect the external platform to the D1 database, so that the content is automatically updated in the database.

You can find the complete code for this tutorial in the [GitHub repository](https://github.com/harshil1712/e-com-d1-hono).

</page>

<page>
---
title: D1 Database · Cloudflare D1 docs
description: To interact with your D1 database from your Worker, you need to
  access it through the environment bindings provided to the Worker (env).
lastUpdated: 2026-01-19T15:44:45.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/worker-api/d1-database/
  md: https://developers.cloudflare.com/d1/worker-api/d1-database/index.md
---

To interact with your D1 database from your Worker, you need to access it through the environment bindings provided to the Worker (`env`).

* JavaScript

  ```js
  async fetch(request, env) {
    // D1 database is 'env.DB', where "DB" is the binding name from the Wrangler configuration file.
  }
  ```

* Python

  ```py
  from workers import WorkerEntrypoint


  class Default(WorkerEntrypoint):
      async def fetch(self, request):
          # D1 database is 'self.env.DB', where "DB" is the binding name from the Wrangler configuration file.
          pass
  ```

A D1 binding has the type `D1Database`, and supports a number of methods, as listed below.

## Methods

### `prepare()`

Prepares a query statement to be later executed.

* JavaScript

  ```js
  const someVariable = `Bs Beverages`;
  const stmt = env.DB.prepare("SELECT * FROM Customers WHERE CompanyName = ?").bind(someVariable);
  ```

* Python

  ```py
  some_variable = "Bs Beverages"
  stmt = self.env.DB.prepare("SELECT * FROM Customers WHERE CompanyName = ?").bind(some_variable)
  ```

#### Parameters

* `query`: String Required
  * The SQL query you wish to execute on the database.

#### Return values

* `D1PreparedStatement`: Object
  * An object which only contains methods. Refer to [Prepared statement methods](https://developers.cloudflare.com/d1/worker-api/prepared-statements/).

#### Guidance

You can use the `bind` method to dynamically bind a value into the query statement, as shown below.

* Example of a static statement without using `bind`:

  * JavaScript

    ```js
    const stmt = db
      .prepare("SELECT * FROM Customers WHERE CompanyName = 'Alfreds Futterkiste' AND CustomerId = 1")
    ```

  * Python

    ```py
    stmt = db.prepare("SELECT * FROM Customers WHERE CompanyName = 'Alfreds Futterkiste' AND CustomerId = 1")
    ```

* Example of an ordered statement using `bind`:

  * JavaScript

    ```js
    const stmt = db
      .prepare("SELECT * FROM Customers WHERE CompanyName = ? AND CustomerId = ?")
      .bind("Alfreds Futterkiste", 1);
    ```

  * Python

    ```py
    stmt = db.prepare("SELECT * FROM Customers WHERE CompanyName = ? AND CustomerId = ?").bind("Alfreds Futterkiste", 1)
    ```

Refer to the [`bind` method documentation](https://developers.cloudflare.com/d1/worker-api/prepared-statements/#bind) for more information.

### `batch()`

Sends multiple SQL statements inside a single call to the database. This can have a huge performance impact as it reduces latency from network round trips to D1. D1 operates in auto-commit. Our implementation guarantees that each statement in the list will execute and commit, sequentially, non-concurrently.

Batched statements are [SQL transactions](https://www.sqlite.org/lang_transaction.html). If a statement in the sequence fails, then an error is returned for that specific statement, and it aborts or rolls back the entire sequence.

To send batch statements, provide `D1Database::batch` a list of prepared statements and get the results in the same order.

* JavaScript

  ```js
  const companyName1 = `Bs Beverages`;
  const companyName2 = `Around the Horn`;
  const stmt = env.DB.prepare(`SELECT * FROM Customers WHERE CompanyName = ?`);
  const batchResult = await env.DB.batch([
    stmt.bind(companyName1),
    stmt.bind(companyName2)
  ]);
  ```

* Python

  ```py
  from pyodide.ffi import to_js


  company_name1 = "Bs Beverages"
  company_name2 = "Around the Horn"
  stmt = self.env.DB.prepare("SELECT * FROM Customers WHERE CompanyName = ?")
  batch_result = await self.env.DB.batch(to_js([
      stmt.bind(company_name1),
      stmt.bind(company_name2)
  ]))
  ```

#### Parameters

* `statements`: Array
  * An array of [`D1PreparedStatement`](#prepare)s.

#### Return values

* `results`: Array

  * An array of `D1Result` objects containing the results of the [`D1Database::prepare`](#prepare) statements. Each object is in the array position corresponding to the array position of the initial [`D1Database::prepare`](#prepare) statement within the `statements`.
  * Refer to [`D1Result`](https://developers.cloudflare.com/d1/worker-api/return-object/#d1result) for more information about this object.

Example of return values

* JavaScript

  ```js
  const companyName1 = `Bs Beverages`;
  const companyName2 = `Around the Horn`;
  const stmt = await env.DB.batch([
    env.DB.prepare(`SELECT * FROM Customers WHERE CompanyName = ?`).bind(companyName1),
    env.DB.prepare(`SELECT * FROM Customers WHERE CompanyName = ?`).bind(companyName2)
  ]);
  return Response.json(stmt)
  ```

* Python

  ```py
  from pyodide.ffi import to_js
  from workers import Response


  company_name1 = "Bs Beverages"
  company_name2 = "Around the Horn"
  stmt = await self.env.DB.batch(to_js([
      self.env.DB.prepare("SELECT * FROM Customers WHERE CompanyName = ?").bind(company_name1),
      self.env.DB.prepare("SELECT * FROM Customers WHERE CompanyName = ?").bind(company_name2)
  ]))
  return Response.json(stmt)
  ```

```json
[
  {
    "success": true,
    "meta": {
      "served_by": "miniflare.db",
      "duration": 0,
      "changes": 0,
      "last_row_id": 0,
      "changed_db": false,
      "size_after": 8192,
      "rows_read": 4,
      "rows_written": 0
    },
    "results": [
      {
        "CustomerId": 11,
        "CompanyName": "Bs Beverages",
        "ContactName": "Victoria Ashworth"
      },
      {
        "CustomerId": 13,
        "CompanyName": "Bs Beverages",
        "ContactName": "Random Name"
      }
    ]
  },
  {
    "success": true,
    "meta": {
      "served_by": "miniflare.db",
      "duration": 0,
      "changes": 0,
      "last_row_id": 0,
      "changed_db": false,
      "size_after": 8192,
      "rows_read": 4,
      "rows_written": 0
    },
    "results": [
      {
        "CustomerId": 4,
        "CompanyName": "Around the Horn",
        "ContactName": "Thomas Hardy"
      }
    ]
  }
]
```

* JavaScript

  ```js
  console.log(stmt[1].results);
  ```

* Python

  ```py
  print(stmt[1].results.to_py())
  ```

```json
[
  {
    "CustomerId": 4,
    "CompanyName": "Around the Horn",
    "ContactName": "Thomas Hardy"
  }
]
```

#### Guidance

* You can construct batches reusing the same prepared statement:

  * JavaScript

    ```js
    const companyName1 = `Bs Beverages`;
    const companyName2 = `Around the Horn`;
    const stmt = env.DB.prepare(`SELECT * FROM Customers WHERE CompanyName = ?`);
    const batchResult = await env.DB.batch([
      stmt.bind(companyName1),
      stmt.bind(companyName2)
    ]);
    return Response.json(batchResult);
    ```

  * Python

    ```py
    from pyodide.ffi import to_js
    from workers import Response


    company_name1 = "Bs Beverages"
    company_name2 = "Around the Horn"
    stmt = self.env.DB.prepare("SELECT * FROM Customers WHERE CompanyName = ?")
    batch_result = await self.env.DB.batch(to_js([
        stmt.bind(company_name1),
        stmt.bind(company_name2)
    ]))
    return Response.json(batch_result)
    ```

### `exec()`

Executes one or more queries directly without prepared statements or parameter bindings.

* JavaScript

  ```js
  const returnValue = await env.DB.exec(`SELECT * FROM Customers WHERE CompanyName = "Bs Beverages"`);
  ```

* Python

  ```py
  return_value = await self.env.DB.exec('SELECT * FROM Customers WHERE CompanyName = "Bs Beverages"')
  ```

#### Parameters

* `query`: String Required
  * The SQL query statement without parameter binding.

#### Return values

* `D1ExecResult`: Object

  * The `count` property contains the number of executed queries.
  * The `duration` property contains the duration of operation in milliseconds.
    * Refer to [`D1ExecResult`](https://developers.cloudflare.com/d1/worker-api/return-object/#d1execresult) for more information.

Example of return values

* JavaScript

  ```js
  const returnValue = await env.DB.exec(`SELECT * FROM Customers WHERE CompanyName = "Bs Beverages"`);
  return Response.json(returnValue);
  ```

* Python

  ```py
  from workers import Response


  return_value = await self.env.DB.exec('SELECT * FROM Customers WHERE CompanyName = "Bs Beverages"')
  return Response.json(return_value)
  ```

```json
{
  "count": 1,
  "duration": 1
}
```

#### Guidance

* If an error occurs, an exception is thrown with the query and error messages, execution stops and further statements are not executed. Refer to [Errors](https://developers.cloudflare.com/d1/observability/debug-d1/#errors) to learn more.
* This method can have poorer performance (prepared statements can be reused in some cases) and, more importantly, is less safe.
* Only use this method for maintenance and one-shot tasks (for example, migration jobs).
* The input can be one or multiple queries separated by `\n`.

### `dump`

Warning

This API only works on databases created during D1's alpha period. Check which version your database uses with `wrangler d1 info <DATABASE_NAME>`.

Dumps the entire D1 database to an SQLite compatible file inside an ArrayBuffer.

* JavaScript

  ```js
  const dump = await db.dump();
  return new Response(dump, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
    },
  });
  ```

* Python

  ```py
  from workers import Response


  dump = await db.dump()
  return Response(dump, status=200, headers={"Content-Type": "application/octet-stream"})
  ```

#### Parameters

* None.

#### Return values

* None.

### `withSession()`

Starts a D1 session which maintains sequential consistency among queries executed on the returned `D1DatabaseSession` object.

* JavaScript

  ```js
  const session = env.DB.withSession("<parameter>");
  ```

* Python

  ```py
  session = self.env.DB.withSession("<parameter>")
  ```

#### Parameters

* `first-primary`: StringOptional

  * Directs the first query in the Session (whether read or write) to the primary database instance. Use this option if you need to start the Session with the most up-to-date data from the primary database instance.
  * Subsequent queries in the Session may use read replicas.
  * Subsequent queries in the Session have sequential consistency.

* `first-unconstrained`: StringOptional

  * Directs the first query in the Session (whether read or write) to any database instance. Use this option if you do not need to start the Session with the most up-to-date data, and wish to prioritize minimizing query latency from the very start of the Session.
  * Subsequent queries in the Session have sequential consistency.
  * This is the default behavior when no parameter is provided.

* `bookmark`: StringOptional

  * A [`bookmark`](https://developers.cloudflare.com/d1/reference/time-travel/#bookmarks) from a previous D1 Session. This allows you to start a new Session from at least the provided `bookmark`.
  * Subsequent queries in the Session have sequential consistency.

#### Return values

* `D1DatabaseSession`: Object
  * An object which contains the methods [`prepare()`](https://developers.cloudflare.com/d1/worker-api/d1-database#prepare) and [`batch()`](https://developers.cloudflare.com/d1/worker-api/d1-database#batch) similar to `D1Database`, along with the additional [`getBookmark`](https://developers.cloudflare.com/d1/worker-api/d1-database#getbookmark) method.

#### Guidance

* To use read replication, you have to use the D1 Sessions API, otherwise all queries will continue to be executed only by the primary database.
* You can return the last encountered `bookmark` for a given Session using [`session.getBookmark()`](https://developers.cloudflare.com/d1/worker-api/d1-database/#getbookmark).

## `D1DatabaseSession` methods

### `getBookmark`

Retrieves the latest `bookmark` from the D1 Session.

* JavaScript

  ```js
  const session = env.DB.withSession("first-primary");
  const result = await session
    .prepare(`SELECT * FROM Customers WHERE CompanyName = 'Bs Beverages'`)
    .run()
  const { bookmark } = session.getBookmark();
    return bookmark;
  ```

* Python

  ```py
  session = self.env.DB.withSession("first-primary")
  result = await session.prepare(
      "SELECT * FROM Customers WHERE CompanyName = 'Bs Beverages'"
  ).run()


  bookmark = session.getBookmark()
  ```

#### Parameters

* None

#### Return values

* `bookmark`: String | null

  * A [`bookmark`](https://developers.cloudflare.com/d1/reference/time-travel/#bookmarks) which identifies the latest version of the database seen by the last query executed within the Session.
  * Returns `null` if no query is executed within a Session.

### `prepare()`

This method is equivalent to [`D1Database::prepare`](https://developers.cloudflare.com/d1/worker-api/d1-database/#prepare).

### `batch()`

This method is equivalent to [`D1Database::batch`](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch).

</page>

<page>
---
title: Prepared statement methods · Cloudflare D1 docs
description: This chapter documents the various ways you can run and retrieve
  the results of a query after you have prepared your statement.
lastUpdated: 2026-01-19T15:44:45.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/worker-api/prepared-statements/
  md: https://developers.cloudflare.com/d1/worker-api/prepared-statements/index.md
---

This chapter documents the various ways you can run and retrieve the results of a query after you have [prepared your statement](https://developers.cloudflare.com/d1/worker-api/d1-database/#prepare).

## Methods

### `bind()`

Binds a parameter to the prepared statement.

* JavaScript

  ```js
  const someVariable = `Bs Beverages`;
  const stmt = env.DB.prepare("SELECT * FROM Customers WHERE CompanyName = ?").bind(someVariable);
  ```

* Python

  ```py
  some_variable = "Bs Beverages"
  stmt = self.env.DB.prepare(
    "SELECT * FROM Customers WHERE CompanyName = ?"
  ).bind(some_variable)
  ```

#### Parameter

* `Variable`: string
  * The variable to be appended into the prepared statement. See [guidance](#guidance) below.

#### Return values

* `D1PreparedStatement`: Object
  * A `D1PreparedStatement` where the input parameter has been included in the statement.

#### Guidance

* D1 follows the [SQLite convention](https://www.sqlite.org/lang_expr.html#varparam) for prepared statements parameter binding. Currently, D1 only supports Ordered (`?NNNN`) and Anonymous (`?`) parameters. In the future, D1 will support named parameters as well.

  | Syntax | Type | Description |
  | - | - | - |
  | `?NNN` | Ordered | A question mark followed by a number `NNN` holds a spot for the `NNN`-th parameter. `NNN` must be between `1` and `SQLITE_MAX_VARIABLE_NUMBER` |
  | `?` | Anonymous | A question mark that is not followed by a number creates a parameter with a number one greater than the largest parameter number already assigned. If this means the parameter number is greater than `SQLITE_MAX_VARIABLE_NUMBER`, it is an error. This parameter format is provided for compatibility with other database engines. But because it is easy to miscount the question marks, the use of this parameter format is discouraged. Programmers are encouraged to use one of the symbolic formats below or the `?NNN` format above instead. |

  To bind a parameter, use the `.bind` method.

  Order and anonymous examples:

  * JavaScript

    ```js
    const stmt = db.prepare("SELECT * FROM Customers WHERE CompanyName = ?").bind("");
    ```

  * Python

    ```py
    stmt = db.prepare("SELECT * FROM Customers WHERE CompanyName = ?").bind("")
    ```

  - JavaScript

    ```js
    const stmt = db
      .prepare("SELECT * FROM Customers WHERE CompanyName = ? AND CustomerId = ?")
      .bind("Alfreds Futterkiste", 1);
    ```

  - Python

    ```py
    stmt = db.prepare(
    "SELECT * FROM Customers WHERE CompanyName = ? AND CustomerId = ?"
    ).bind("Alfreds Futterkiste", 1)
    ```

  * JavaScript

    ```js
    const stmt = db
      .prepare(
      "SELECT * FROM Customers WHERE CompanyName = ?2 AND CustomerId = ?1"
    ).bind(1, "Alfreds Futterkiste");
    ```

  * Python

    ```py
    stmt = db.prepare("SELECT * FROM Customers WHERE CompanyName = ?2 AND CustomerId = ?1").bind(1, "Alfreds Futterkiste")
    ```

#### Static statements

D1 API supports static statements. Static statements are SQL statements where the variables have been hard coded. When writing a static statement, you manually type the variable within the statement string.

Advantages of prepared statements

The recommended approach is to use [prepared statements](https://developers.cloudflare.com/d1/worker-api/d1-database/#prepare) to run the SQL and bind parameters to them. Binding parameters using [`bind()`](https://developers.cloudflare.com/d1/worker-api/prepared-statements/#bind) to prepared statements allows you to reuse the prepared statements in your code, and prevents SQL injection attacks.

Example of a prepared statement with dynamically bound value:

* JavaScript

  ```js
  const someVariable = `Bs Beverages`;
  const stmt = env.DB.prepare("SELECT * FROM Customers WHERE CompanyName = ?").bind(someVariable);
  // A variable (someVariable) will replace the placeholder '?' in the query.
  // `stmt` is a prepared statement.
  ```

* Python

  ```py
  some_variable = "Bs Beverages"
  stmt = self.env.DB.prepare("SELECT * FROM Customers WHERE CompanyName = ?").bind(some_variable)
  # A variable (some_variable) will replace the placeholder '?' in the query.
  # `stmt` is a prepared statement.
  ```

Example of a static statement:

* JavaScript

  ```js
  const stmt = env.DB.prepare("SELECT * FROM Customers WHERE CompanyName = 'Bs Beverages'");
  // "Bs Beverages" is hard-coded into the query.
  // `stmt` is a static statement.
  ```

* Python

  ```py
  stmt = self.env.DB.prepare("SELECT * FROM Customers WHERE CompanyName = 'Bs Beverages'")
  # "Bs Beverages" is hard-coded into the query.
  # `stmt` is a static statement.
  ```

### `run()`

Runs the prepared query (or queries) and returns results. The returned results includes metadata.

* JavaScript

  ```js
  const returnValue = await stmt.run();
  ```

* Python

  ```py
  return_value = await stmt.run()
  ```

#### Parameter

* None.

#### Return values

* `D1Result`: Object

  * An object containing the success status, a meta object, and an array of objects containing the query results.
  * For more information on the object, refer to [`D1Result`](https://developers.cloudflare.com/d1/worker-api/return-object/#d1result).

Example of return values

* JavaScript

  ```js
  const someVariable = `Bs Beverages`;
  const stmt = env.DB.prepare("SELECT * FROM Customers WHERE CompanyName = ?").bind(someVariable);
  const returnValue = await stmt.run();
  return Response.json(returnValue);
  ```

* Python

  ```py
  from workers import Response


  some_variable = "Bs Beverages"
  stmt = self.env.DB.prepare("SELECT * FROM Customers WHERE CompanyName = ?").bind(some_variable)
  return_value = await stmt.run()
  return Response.json(return_value)
  ```

```json
{
  "success": true,
  "meta": {
    "served_by": "miniflare.db",
    "duration": 1,
    "changes": 0,
    "last_row_id": 0,
    "changed_db": false,
    "size_after": 8192,
    "rows_read": 4,
    "rows_written": 0
  },
  "results": [
    {
      "CustomerId": 11,
      "CompanyName": "Bs Beverages",
      "ContactName": "Victoria Ashworth"
    },
    {
      "CustomerId": 13,
      "CompanyName": "Bs Beverages",
      "ContactName": "Random Name"
    }
  ]
}
```

#### Guidance

* `results` is empty for write operations such as `UPDATE`, `DELETE`, or `INSERT`.
* When using TypeScript, you can pass a [type parameter](https://developers.cloudflare.com/d1/worker-api/#typescript-support) to [`D1PreparedStatement::run`](#run) to return a typed result object.
* [`D1PreparedStatement::run`](#run) is functionally equivalent to `D1PreparedStatement::all`, and can be treated as an alias.
* You can choose to extract only the results you expect from the statement by simply returning the `results` property of the return object.

Example of returning only the `results`

* JavaScript

  ```js
  return Response.json(returnValue.results);
  ```

* Python

  ```py
  from workers import Response


  return Response.json(return_value.results)
  ```

```json
[
  {
    "CustomerId": 11,
    "CompanyName": "Bs Beverages",
    "ContactName": "Victoria Ashworth"
  },
  {
    "CustomerId": 13,
    "CompanyName": "Bs Beverages",
    "ContactName": "Random Name"
  }
]
```

### `raw()`

Runs the prepared query (or queries), and returns the results as an array of arrays. The returned results do not include metadata.

Column names are not included in the result set by default. To include column names as the first row of the result array, set `.raw({columnNames: true})`.

* JavaScript

  ```js
  const returnValue = await stmt.raw();
  ```

* Python

  ```py
  return_value = await stmt.raw()
  ```

#### Parameters

* `columnNames`: Object Optional
  * A boolean object which includes column names as the first row of the result array.

#### Return values

* `Array`: Array
  * An array of arrays. Each sub-array represents a row.

Example of return values

* JavaScript

  ```js
  const someVariable = `Bs Beverages`;
  const stmt = env.DB.prepare("SELECT * FROM Customers WHERE CompanyName = ?").bind(someVariable);
  const returnValue = await stmt.raw();
  return Response.json(returnValue);
  ```

* Python

  ```py
  from workers import Response


  some_variable = "Bs Beverages"
  stmt = self.env.DB.prepare("SELECT * FROM Customers WHERE CompanyName = ?").bind(some_variable)
  return_value = await stmt.raw()
  return Response.json(return_value)
  ```

```json
[
  [11, "Bs Beverages",
    "Victoria Ashworth"
  ],
  [13, "Bs Beverages",
    "Random Name"
  ]
]
```

With parameter `columnNames: true`:

* JavaScript

  ```js
  const someVariable = `Bs Beverages`;
  const stmt = env.DB.prepare("SELECT * FROM Customers WHERE CompanyName = ?").bind(someVariable);
  const returnValue = await stmt.raw({columnNames:true});
  return Response.json(returnValue)
  ```

* Python

  ```py
  from pyodide.ffi import to_js
  from workers import Response


  some_variable = "Bs Beverages"
  stmt = self.env.DB.prepare("SELECT * FROM Customers WHERE CompanyName = ?").bind(some_variable)
  return_value = await stmt.raw(columnNames=True)
  return Response.json(return_value)
  ```

```json
[
  [
    "CustomerId",
    "CompanyName",
    "ContactName"
  ],
  [11, "Bs Beverages",
    "Victoria Ashworth"
  ],
  [13, "Bs Beverages",
    "Random Name"
  ]
]
```

#### Guidance

* When using TypeScript, you can pass a [type parameter](https://developers.cloudflare.com/d1/worker-api/#typescript-support) to [`D1PreparedStatement::raw`](#raw) to return a typed result array.

### `first()`

Runs the prepared query (or queries), and returns the first row of the query result as an object. This does not return any metadata. Instead, it directly returns the object.

* JavaScript

  ```js
  const values = await stmt.first();
  ```

* Python

  ```py
  values = await stmt.first()
  ```

#### Parameters

* `columnName`: String Optional
  * Specify a `columnName` to return a value from a specific column in the first row of the query result.
* None.
  * Do not pass a parameter to obtain all columns from the first row.

#### Return values

* `firstRow`: Object Optional

  * An object containing the first row of the query result.
  * The return value will be further filtered to a specific attribute if `columnName` was specified.

* `null`: null

  * If the query returns no rows.

Example of return values

Get all the columns from the first row:

* JavaScript

  ```js
  const someVariable = `Bs Beverages`;
  const stmt = env.DB.prepare("SELECT * FROM Customers WHERE CompanyName = ?").bind(someVariable);
  const returnValue = await stmt.first();
  return Response.json(returnValue)
  ```

* Python

  ```py
  from workers import Response


  some_variable = "Bs Beverages"
  stmt = self.env.DB.prepare("SELECT * FROM Customers WHERE CompanyName = ?").bind(some_variable)
  return_value = await stmt.first()
  return Response.json(return_value)
  ```

```json
{
  "CustomerId": 11,
  "CompanyName": "Bs Beverages",
  "ContactName": "Victoria Ashworth"
}
```

Get a specific column from the first row:

* JavaScript

  ```js
  const someVariable = `Bs Beverages`;
  const stmt = env.DB.prepare("SELECT * FROM Customers WHERE CompanyName = ?").bind(someVariable);
  const returnValue = await stmt.first("CustomerId");
  return Response.json(returnValue)
  ```

* Python

  ```py
  from workers import Response


  some_variable = "Bs Beverages"
  stmt = self.env.DB.prepare("SELECT * FROM Customers WHERE CompanyName = ?").bind(some_variable)
  return_value = await stmt.first("CustomerId")
  return Response.json(return_value)
  ```

```json
11
```

#### Guidance

* If the query returns rows but `column` does not exist, then [`D1PreparedStatement::first`](#first) throws the `D1_ERROR` exception.
* [`D1PreparedStatement::first`](#first) does not alter the SQL query. To improve performance, consider appending `LIMIT 1` to your statement.
* When using TypeScript, you can pass a [type parameter](https://developers.cloudflare.com/d1/worker-api/#typescript-support) to [`D1PreparedStatement::first`](#first) to return a typed result object.

</page>

<page>
---
title: Return objects · Cloudflare D1 docs
description: Some D1 Worker Binding APIs return a typed object.
lastUpdated: 2025-12-02T18:27:05.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/d1/worker-api/return-object/
  md: https://developers.cloudflare.com/d1/worker-api/return-object/index.md
---

Some D1 Worker Binding APIs return a typed object.

| D1 Worker Binding API | Return object |
| - | - |
| [`D1PreparedStatement::run`](https://developers.cloudflare.com/d1/worker-api/prepared-statements/#run), [`D1Database::batch`](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch) | `D1Result` |
| [`D1Database::exec`](https://developers.cloudflare.com/d1/worker-api/d1-database/#exec) | `D1ExecResult` |

## `D1Result`

The methods [`D1PreparedStatement::run`](https://developers.cloudflare.com/d1/worker-api/prepared-statements/#run) and [`D1Database::batch`](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch) return a typed [`D1Result`](#d1result) object for each query statement. This object contains:

* The success status
* A meta object with the internal duration of the operation in milliseconds
* The results (if applicable) as an array

```js
{
  success: boolean, // true if the operation was successful, false otherwise
  meta: {
    served_by: string // the version of Cloudflare's backend Worker that returned the result
    served_by_region: string // the region of the database instance that executed the query
    served_by_primary: boolean // true if (and only if) the database instance that executed the query was the primary
    timings: {
      sql_duration_ms: number // the duration of the SQL query execution by the database instance (not including any network time)
    }
    duration: number, // the duration of the SQL query execution only, in milliseconds
    changes: number, // the number of changes made to the database
    last_row_id: number, // the last inserted row ID, only applies when the table is defined without the `WITHOUT ROWID` option
    changed_db: boolean, // true if something on the database was changed
    size_after: number, // the size of the database after the query is successfully applied
    rows_read: number, // the number of rows read (scanned) by this query
    rows_written: number // the number of rows written by this query
    total_attempts: number //the number of total attempts to successfully execute the query, including retries
  }
  results: array | null, // [] if empty, or null if it does not apply
}
```

### Example

* JavaScript

  ```js
  const someVariable = `Bs Beverages`;
  const stmt = env.DB.prepare("SELECT * FROM Customers WHERE CompanyName = ?").bind(someVariable);
  const returnValue = await stmt.run();
  return Response.json(returnValue)
  ```

* Python

  ```py
  from workers import Response


  some_variable = "Bs Beverages"
  stmt = self.env.DB.prepare("SELECT * FROM Customers WHERE CompanyName = ?").bind(some_variable)
  return_value = await stmt.run()
  return Response.json(return_value)
  ```

```json
{
  "success": true,
  "meta": {
    "served_by": "miniflare.db",
    "served_by_region": "WEUR",
    "served_by_primary": true,
    "timings": {
      "sql_duration_ms": 0.2552
    },
    "duration": 0.2552,
    "changes": 0,
    "last_row_id": 0,
    "changed_db": false,
    "size_after": 16384,
    "rows_read": 4,
    "rows_written": 0
  },
  "results": [
    {
      "CustomerId": 11,
      "CompanyName": "Bs Beverages",
      "ContactName": "Victoria Ashworth"
    },
    {
      "CustomerId": 13,
      "CompanyName": "Bs Beverages",
      "ContactName": "Random Name"
    }
  ]
}
```

## `D1ExecResult`

The method [`D1Database::exec`](https://developers.cloudflare.com/d1/worker-api/d1-database/#exec) returns a typed [`D1ExecResult`](#d1execresult) object for each query statement. This object contains:

* The number of executed queries
* The duration of the operation in milliseconds

```js
{
  "count": number, // the number of executed queries
  "duration": number // the duration of the operation, in milliseconds
}
```

### Example

* JavaScript

  ```js
  const returnValue = await env.DB.exec(`SELECT * FROM Customers WHERE CompanyName = "Bs Beverages"`);
  return Response.json(returnValue);
  ```

* Python

  ```py
  from workers import Response


  return_value = await self.env.DB.exec('SELECT * FROM Customers WHERE CompanyName = "Bs Beverages"')
  return Response.json(return_value)
  ```

```json
{
  "count": 1,
  "duration": 1
}
```

Storing large numbers

Any numeric value in a column is affected by JavaScript's 52-bit precision for numbers. If you store a very large number (in `int64`), then retrieve the same value, the returned value may be less precise than your original number.

</page>
