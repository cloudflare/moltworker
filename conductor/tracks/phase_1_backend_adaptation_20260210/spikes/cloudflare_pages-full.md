<page>
---
title: Overview · Cloudflare Pages docs
description: Deploy your Pages project by connecting to your Git provider,
  uploading prebuilt assets directly to Pages with Direct Upload or using C3
  from the command line.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/
  md: https://developers.cloudflare.com/pages/index.md
---

Create full-stack applications that are instantly deployed to the Cloudflare global network.

Available on all plans

Deploy your Pages project by connecting to [your Git provider](https://developers.cloudflare.com/pages/get-started/git-integration/), uploading prebuilt assets directly to Pages with [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/) or using [C3](https://developers.cloudflare.com/pages/get-started/c3/) from the command line.

***

## Features

### Pages Functions

Use Pages Functions to deploy server-side code to enable dynamic functionality without running a dedicated server.

[Use Pages Functions](https://developers.cloudflare.com/pages/functions/)

### Rollbacks

Rollbacks allow you to instantly revert your project to a previous production deployment.

[Use Rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/)

### Redirects

Set up redirects for your Cloudflare Pages project.

[Use Redirects](https://developers.cloudflare.com/pages/configuration/redirects/)

***

## Related products

**[Workers](https://developers.cloudflare.com/workers/)**

Cloudflare Workers provides a serverless execution environment that allows you to create new applications or augment existing ones without configuring or maintaining infrastructure.

**[R2](https://developers.cloudflare.com/r2/)**

Cloudflare R2 Storage allows developers to store large amounts of unstructured data without the costly egress bandwidth fees associated with typical cloud storage services.

**[D1](https://developers.cloudflare.com/d1/)**

D1 is Cloudflare’s native serverless database. Create a database by importing data or defining your tables and writing your queries within a Worker or through the API.

**[Zaraz](https://developers.cloudflare.com/zaraz/)**

Offload third-party tools and services to the cloud and improve the speed and security of your website.

***

## More resources

[Limits](https://developers.cloudflare.com/pages/platform/limits/)

Learn about limits that apply to your Pages project (500 deploys per month on the Free plan).

[Framework guides](https://developers.cloudflare.com/pages/framework-guides/)

Deploy popular frameworks such as React, Hugo, and Next.js on Pages.

[Developer Discord](https://discord.cloudflare.com)

Connect with the Workers community on Discord to ask questions, show what you are building, and discuss the platform with other developers.

[@CloudflareDev](https://x.com/cloudflaredev)

Follow @CloudflareDev on Twitter to learn about product announcements, and what is new in Cloudflare Workers.

</page>

<page>
---
title: 404 - Page Not Found · Cloudflare Pages docs
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/404/
  md: https://developers.cloudflare.com/pages/404/index.md
---

# 404

Check the URL, try using our [search](https://developers.cloudflare.com/search/) or try our LLM-friendly [llms.txt directory](https://developers.cloudflare.com/llms.txt).

</page>

<page>
---
title: Demos and architectures · Cloudflare Pages docs
description: Learn how you can use Pages within your existing application and architecture.
lastUpdated: 2025-10-13T13:40:40.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/demos/
  md: https://developers.cloudflare.com/pages/demos/index.md
---

Learn how you can use Pages within your existing application and architecture.

## Demos

Explore the following demo applications for Pages.

* [Jobs At Conf:](https://github.com/harshil1712/jobs-at-conf-demo) A job lisiting website to add jobs you find at in-person conferences. Built with Cloudflare Pages, R2, D1, Queues, and Workers AI.
* [Upload Image to R2 starter:](https://github.com/harshil1712/nextjs-r2-demo) Upload images to Cloudflare R2 from a Next.js application.
* [Staff Directory demo:](https://github.com/lauragift21/staff-directory) Built using the powerful combination of HonoX for backend logic, Cloudflare Pages for fast and secure hosting, and Cloudflare D1 for seamless database management.
* [Wildebeest:](https://github.com/cloudflare/wildebeest) Wildebeest is an ActivityPub and Mastodon-compatible server whose goal is to allow anyone to operate their Fediverse server and identity on their domain without needing to keep infrastructure, with minimal setup and maintenance, and running in minutes.
* [Multiplayer Doom Workers:](https://github.com/cloudflare/doom-workers) A WebAssembly Doom port with multiplayer support running on top of Cloudflare's global network using Workers, WebSockets, Pages, and Durable Objects.
* [Queues Web Crawler:](https://github.com/cloudflare/queues-web-crawler) An example use-case for Queues, a web crawler built on Browser Rendering and Puppeteer. The crawler finds the number of links to Cloudflare.com on the site, and archives a screenshot to Workers KV.
* [Pages Functions with WebAssembly:](https://github.com/cloudflare/pages-fns-with-wasm-demo) This is a demo application that exemplifies the use of Wasm module imports inside Pages Functions code.

## Reference architectures

Explore the following reference architectures that use Pages:

[Fullstack applications](https://developers.cloudflare.com/reference-architecture/diagrams/serverless/fullstack-application/)

[A practical example of how these services come together in a real fullstack application architecture.](https://developers.cloudflare.com/reference-architecture/diagrams/serverless/fullstack-application/)

</page>

<page>
---
title: Configuration · Cloudflare Pages docs
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/pages/configuration/
  md: https://developers.cloudflare.com/pages/configuration/index.md
---

* [Branch deployment controls](https://developers.cloudflare.com/pages/configuration/branch-build-controls/)
* [Build caching](https://developers.cloudflare.com/pages/configuration/build-caching/)
* [Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
* [Build image](https://developers.cloudflare.com/pages/configuration/build-image/)
* [Build watch paths](https://developers.cloudflare.com/pages/configuration/build-watch-paths/)
* [Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
* [Debugging Pages](https://developers.cloudflare.com/pages/configuration/debugging-pages/)
* [Deploy Hooks](https://developers.cloudflare.com/pages/configuration/deploy-hooks/)
* [Early Hints](https://developers.cloudflare.com/pages/configuration/early-hints/)
* [Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/)
* [Headers](https://developers.cloudflare.com/pages/configuration/headers/)
* [Monorepos](https://developers.cloudflare.com/pages/configuration/monorepos/)
* [Preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
* [Redirects](https://developers.cloudflare.com/pages/configuration/redirects/)
* [REST API](https://developers.cloudflare.com/pages/configuration/api/)
* [Rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/)
* [Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/)

</page>

<page>
---
title: Functions · Cloudflare Pages docs
description: Pages Functions allows you to build full-stack applications by
  executing code on the Cloudflare network with Cloudflare Workers. With
  Functions, you can introduce application aspects such as authenticating,
  handling form submissions, or working with middleware. Workers runtime
  features are configurable on Pages Functions, including compatibility with a
  subset of Node.js APIs and the ability to set a compatibility date or
  compatibility flag. Use Functions to deploy server-side code to enable dynamic
  functionality without running a dedicated server.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/functions/
  md: https://developers.cloudflare.com/pages/functions/index.md
---

Pages Functions allows you to build full-stack applications by executing code on the Cloudflare network with [Cloudflare Workers](https://developers.cloudflare.com/workers/). With Functions, you can introduce application aspects such as authenticating, handling form submissions, or working with middleware. [Workers runtime features](https://developers.cloudflare.com/workers/runtime-apis/) are configurable on Pages Functions, including [compatibility with a subset of Node.js APIs](https://developers.cloudflare.com/workers/runtime-apis/nodejs) and the ability to set a [compatibility date or compatibility flag](https://developers.cloudflare.com/workers/configuration/compatibility-dates/). Use Functions to deploy server-side code to enable dynamic functionality without running a dedicated server.

To provide feedback or ask questions on Functions, join the [Cloudflare Developers Discord](https://discord.com/invite/cloudflaredev) and connect with the Cloudflare team in the [#functions channel](https://discord.com/channels/595317990191398933/910978223968518144).

* [Get started](https://developers.cloudflare.com/pages/functions/get-started/)
* [Routing](https://developers.cloudflare.com/pages/functions/routing/)
* [API reference](https://developers.cloudflare.com/pages/functions/api-reference/)
* [Examples](https://developers.cloudflare.com/pages/functions/examples/)
* [Middleware](https://developers.cloudflare.com/pages/functions/middleware/)
* [Configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)
* [Local development](https://developers.cloudflare.com/pages/functions/local-development/)
* [Bindings](https://developers.cloudflare.com/pages/functions/bindings/)
* [TypeScript](https://developers.cloudflare.com/pages/functions/typescript/)
* [Advanced mode](https://developers.cloudflare.com/pages/functions/advanced-mode/)
* [Pages Plugins](https://developers.cloudflare.com/pages/functions/plugins/)
* [Metrics](https://developers.cloudflare.com/pages/functions/metrics/)
* [Debugging and logging](https://developers.cloudflare.com/pages/functions/debugging-and-logging/)
* [Pricing](https://developers.cloudflare.com/pages/functions/pricing/)
* [Module support](https://developers.cloudflare.com/pages/functions/module-support/)
* [Smart Placement](https://developers.cloudflare.com/pages/functions/smart-placement/)
* [Source maps and stack traces](https://developers.cloudflare.com/pages/functions/source-maps/)

</page>

<page>
---
title: Framework guides · Cloudflare Pages docs
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/
  md: https://developers.cloudflare.com/pages/framework-guides/index.md
---

* [Analog](https://developers.cloudflare.com/pages/framework-guides/deploy-an-analog-site/)
* [Angular](https://developers.cloudflare.com/pages/framework-guides/deploy-an-angular-site/)
* [Astro](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/)
* [Blazor](https://developers.cloudflare.com/pages/framework-guides/deploy-a-blazor-site/)
* [Brunch](https://developers.cloudflare.com/pages/framework-guides/deploy-a-brunch-site/)
* [Docusaurus](https://developers.cloudflare.com/pages/framework-guides/deploy-a-docusaurus-site/)
* [Elder.js](https://developers.cloudflare.com/pages/framework-guides/deploy-an-elderjs-site/)
* [Eleventy](https://developers.cloudflare.com/pages/framework-guides/deploy-an-eleventy-site/)
* [Ember](https://developers.cloudflare.com/pages/framework-guides/deploy-an-emberjs-site/)
* [Gatsby](https://developers.cloudflare.com/pages/framework-guides/deploy-a-gatsby-site/)
* [Gridsome](https://developers.cloudflare.com/pages/framework-guides/deploy-a-gridsome-site/)
* [Hexo](https://developers.cloudflare.com/pages/framework-guides/deploy-a-hexo-site/)
* [Hono](https://developers.cloudflare.com/pages/framework-guides/deploy-a-hono-site/)
* [Hugo](https://developers.cloudflare.com/pages/framework-guides/deploy-a-hugo-site/)
* [Jekyll](https://developers.cloudflare.com/pages/framework-guides/deploy-a-jekyll-site/)
* [MkDocs](https://developers.cloudflare.com/pages/framework-guides/deploy-an-mkdocs-site/)
* [Next.js](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
* [Nuxt](https://developers.cloudflare.com/pages/framework-guides/deploy-a-nuxt-site/)
* [Pelican](https://developers.cloudflare.com/pages/framework-guides/deploy-a-pelican-site/)
* [Preact](https://developers.cloudflare.com/pages/framework-guides/deploy-a-preact-site/)
* [Qwik](https://developers.cloudflare.com/pages/framework-guides/deploy-a-qwik-site/)
* [React](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/)
* [Remix](https://developers.cloudflare.com/pages/framework-guides/deploy-a-remix-site/)
* [SolidStart](https://developers.cloudflare.com/pages/framework-guides/deploy-a-solid-start-site/)
* [Sphinx](https://developers.cloudflare.com/pages/framework-guides/deploy-a-sphinx-site/)
* [Static HTML](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/)
* [SvelteKit](https://developers.cloudflare.com/pages/framework-guides/deploy-a-svelte-kit-site/)
* [Vite 3](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/)
* [VitePress](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vitepress-site/)
* [Vue](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vue-site/)
* [Zola](https://developers.cloudflare.com/pages/framework-guides/deploy-a-zola-site/)

</page>

<page>
---
title: Getting started · Cloudflare Pages docs
description: "Choose a setup method for your Pages project:"
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/get-started/
  md: https://developers.cloudflare.com/pages/get-started/index.md
---

Choose a setup method for your Pages project:

* [C3 CLI](https://developers.cloudflare.com/pages/get-started/c3/)
* [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
* [Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/)

</page>

<page>
---
title: How to · Cloudflare Pages docs
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/pages/how-to/
  md: https://developers.cloudflare.com/pages/how-to/index.md
---

* [Add a custom domain to a branch](https://developers.cloudflare.com/pages/how-to/custom-branch-aliases/)
* [Add custom HTTP headers](https://developers.cloudflare.com/pages/how-to/add-custom-http-headers/)
* [Deploy a static WordPress site](https://developers.cloudflare.com/pages/how-to/deploy-a-wordpress-site/)
* [Enable Web Analytics](https://developers.cloudflare.com/pages/how-to/web-analytics/)
* [Enable Zaraz](https://developers.cloudflare.com/pages/how-to/enable-zaraz/)
* [Install private packages](https://developers.cloudflare.com/pages/how-to/npm-private-registry/)
* [Preview Local Projects with Cloudflare Tunnel](https://developers.cloudflare.com/pages/how-to/preview-with-cloudflare-tunnel/)
* [Redirecting \*.pages.dev to a Custom Domain](https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain/)
* [Redirecting www to domain apex](https://developers.cloudflare.com/pages/how-to/www-redirect/)
* [Refactor a Worker to a Pages Function](https://developers.cloudflare.com/pages/how-to/refactor-a-worker-to-pages-functions/)
* [Set build commands per branch](https://developers.cloudflare.com/pages/how-to/build-commands-branches/)
* [Use Direct Upload with continuous integration](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)
* [Use Pages Functions for A/B testing](https://developers.cloudflare.com/pages/how-to/use-worker-for-ab-testing-in-pages/)

</page>

<page>
---
title: Migrate to Workers · Cloudflare Pages docs
lastUpdated: 2025-05-09T17:32:11.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/migrate-to-workers/
  md: https://developers.cloudflare.com/pages/migrate-to-workers/index.md
---


</page>

<page>
---
title: Migration guides · Cloudflare Pages docs
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/pages/migrations/
  md: https://developers.cloudflare.com/pages/migrations/index.md
---

* [Migrating a Jekyll-based site from GitHub Pages](https://developers.cloudflare.com/pages/migrations/migrating-jekyll-from-github-pages/)
* [Migrating from Firebase](https://developers.cloudflare.com/pages/migrations/migrating-from-firebase/)
* [Migrating from Netlify to Pages](https://developers.cloudflare.com/pages/migrations/migrating-from-netlify/)
* [Migrating from Vercel to Pages](https://developers.cloudflare.com/pages/migrations/migrating-from-vercel/)
* [Migrating from Workers Sites to Pages](https://developers.cloudflare.com/pages/migrations/migrating-from-workers/)

</page>

<page>
---
title: Platform · Cloudflare Pages docs
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/pages/platform/
  md: https://developers.cloudflare.com/pages/platform/index.md
---

* [Limits](https://developers.cloudflare.com/pages/platform/limits/)
* [Choose a data or storage product](https://developers.cloudflare.com/workers/platform/storage-options/)
* [Changelog](https://developers.cloudflare.com/pages/platform/changelog/)
* [Known issues](https://developers.cloudflare.com/pages/platform/known-issues/)

</page>

<page>
---
title: Tutorials · Cloudflare Pages docs
description: View tutorials to help you get started with Pages.
lastUpdated: 2025-08-18T14:27:42.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/tutorials/
  md: https://developers.cloudflare.com/pages/tutorials/index.md
---

View tutorials to help you get started with Pages.

## Docs

| Name | Last Updated | Difficulty |
| - | - | - |
| [Point to Pages with a custom domain](https://developers.cloudflare.com/rules/origin-rules/tutorials/point-to-pages-with-custom-domain/) | 10 months ago | Beginner |
| [Migrating from Vercel to Pages](https://developers.cloudflare.com/pages/migrations/migrating-from-vercel/) | 10 months ago | Beginner |
| [Build an API for your front end using Pages Functions](https://developers.cloudflare.com/pages/tutorials/build-an-api-with-pages-functions/) | over 1 year ago | Intermediate |
| [Use R2 as static asset storage with Cloudflare Pages](https://developers.cloudflare.com/pages/tutorials/use-r2-as-static-asset-storage-for-pages/) | over 1 year ago | Intermediate |
| [Use Pages as an origin for Load Balancing](https://developers.cloudflare.com/load-balancing/pools/cloudflare-pages-origin/) | over 1 year ago | Beginner |
| [Localize a website with HTMLRewriter](https://developers.cloudflare.com/pages/tutorials/localize-a-website/) | almost 2 years ago | Intermediate |
| [Build a Staff Directory Application](https://developers.cloudflare.com/d1/tutorials/build-a-staff-directory-app/) | almost 2 years ago | Intermediate |
| [Deploy a static WordPress site](https://developers.cloudflare.com/pages/how-to/deploy-a-wordpress-site/) | almost 3 years ago | Intermediate |
| [Build a blog using Nuxt.js and Sanity.io on Cloudflare Pages](https://developers.cloudflare.com/pages/tutorials/build-a-blog-using-nuxt-and-sanity/) | over 3 years ago | Intermediate |
| [Create a HTML form](https://developers.cloudflare.com/pages/tutorials/forms/) | over 3 years ago | Beginner |
| [Migrating from Netlify to Pages](https://developers.cloudflare.com/pages/migrations/migrating-from-netlify/) | over 3 years ago | Beginner |
| [Add an HTML form with Formspree](https://developers.cloudflare.com/pages/tutorials/add-an-html-form-with-formspree/) | about 4 years ago | Beginner |
| [Add a React form with Formspree](https://developers.cloudflare.com/pages/tutorials/add-a-react-form-with-formspree/) | about 4 years ago | Beginner |
| [Migrating a Jekyll-based site from GitHub Pages](https://developers.cloudflare.com/pages/migrations/migrating-jekyll-from-github-pages/) | over 4 years ago | Beginner |
| [Migrating from Firebase](https://developers.cloudflare.com/pages/migrations/migrating-from-firebase/) | over 5 years ago | Beginner |
| [Migrating from Workers Sites to Pages](https://developers.cloudflare.com/pages/migrations/migrating-from-workers/) | over 5 years ago | Beginner |

## Videos

OpenAI Relay Server on Cloudflare Workers

In this video, Craig Dennis walks you through the deployment of OpenAI's relay server to use with their realtime API.

Deploy your React App to Cloudflare Workers

Learn how to deploy an existing React application to Cloudflare Workers.

Cloudflare Workflows | Schedule and Sleep For Your Apps (Part 3 of 3)

Cloudflare Workflows allows you to initiate sleep as an explicit step, which can be useful when you want a Workflow to wait, schedule work ahead, or pause until an input or other external state is ready.

</page>

<page>
---
title: REST API · Cloudflare Pages docs
description: The Pages API empowers you to build automations and integrate Pages
  with your development workflow. At a high level, the API endpoints let you
  manage deployments and builds and configure projects. Cloudflare supports
  Deploy Hooks for headless CMS deployments. Refer to the API documentation for
  a full breakdown of object types and endpoints.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/configuration/api/
  md: https://developers.cloudflare.com/pages/configuration/api/index.md
---

The [Pages API](https://developers.cloudflare.com/api/resources/pages/subresources/projects/methods/list/) empowers you to build automations and integrate Pages with your development workflow. At a high level, the API endpoints let you manage deployments and builds and configure projects. Cloudflare supports [Deploy Hooks](https://developers.cloudflare.com/pages/configuration/deploy-hooks/) for headless CMS deployments. Refer to the [API documentation](https://api.cloudflare.com/) for a full breakdown of object types and endpoints.

## How to use the API

### Get an API token

To create an API token:

1. In the Cloudflare dashboard, go to the **Account API tokens** page.

   [Go to **Account API tokens**](https://dash.cloudflare.com/?to=/:account/api-tokens)

2. Select **Create Token**.

3. You can go to **Edit Cloudflare Workers** template > **Use template** or go to **Create Custom Token** > **Get started**. If you create a custom token, you will need to make sure to add the **Cloudflare Pages** permission with **Edit** access.

### Make requests

After creating your token, you can authenticate and make requests to the API using your API token in the request headers. For example, here is an API request to get all deployments in a project.

Required API token permissions

At least one of the following [token permissions](https://developers.cloudflare.com/fundamentals/api/reference/permissions/) is required:

* `Pages Read`
* `Pages Write`

```bash
curl "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/deployments" \
  --request GET \
  --header "Authorization: Bearer $CLOUDFLARE_API_TOKEN"
```

Try it with one of your projects by replacing `{account_id}`, `{project_name}`, and `<API_TOKEN>`. Refer to [Find your account ID](https://developers.cloudflare.com/fundamentals/account/find-account-and-zone-ids/) for more information.

## Examples

The API is even more powerful when combined with Cloudflare Workers: the easiest way to deploy serverless functions on Cloudflare's global network. The following section includes three code examples on how to use the Pages API. To build and deploy these samples, refer to the [Get started guide](https://developers.cloudflare.com/workers/get-started/guide/).

### Triggering a new build every hour

Suppose we have a CMS that pulls data from live sources to compile a static output. You can keep the static content as recent as possible by triggering new builds periodically using the API.

```js
const endpoint =
  "https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/{project_name}/deployments";


export default {
  async scheduled(_, env) {
    const init = {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        // We recommend you store the API token as a secret using the Workers dashboard or using Wrangler as documented here: https://developers.cloudflare.com/workers/wrangler/commands/#secret
        Authorization: `Bearer ${env.API_TOKEN}`,
      },
    };


    await fetch(endpoint, init);
  },
};
```

After you have deployed the JavaScript Worker, set a cron trigger in your Worker to run this script periodically. Refer to [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/) for more details.

### Deleting old deployments after a week

Cloudflare Pages hosts and serves all project deployments on preview links. Suppose you want to keep your project private and prevent access to your old deployments. You can use the API to delete deployments after a month, so that they are no longer public online. The latest deployment for a branch cannot be deleted.

```js
const endpoint =
  "https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/{project_name}/deployments";
const expirationDays = 7;


export default {
  async scheduled(_, env) {
    const init = {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        // We recommend you store the API token as a secret using the Workers dashboard or using Wrangler as documented here: https://developers.cloudflare.com/workers/wrangler/commands/#secret
        Authorization: `Bearer ${env.API_TOKEN}`,
      },
    };


    const response = await fetch(endpoint, init);
    const deployments = await response.json();


    for (const deployment of deployments.result) {
      // Check if the deployment was created within the last x days (as defined by `expirationDays` above)
      if (
        (Date.now() - new Date(deployment.created_on)) / 86400000 >
        expirationDays
      ) {
        // Delete the deployment
        await fetch(`${endpoint}/${deployment.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: `Bearer ${env.API_TOKEN}`,
          },
        });
      }
    }
  },
};
```

After you have deployed the JavaScript Worker, you can set a cron trigger in your Worker to run this script periodically. Refer to the [Cron Triggers guide](https://developers.cloudflare.com/workers/configuration/cron-triggers/) for more details.

### Sharing project information

Imagine you are working on a development team using Pages to build your websites. You would want an easy way to share deployment preview links and build status without having to share Cloudflare accounts. Using the API, you can easily share project information, including deployment status and preview links, and serve this content as HTML from a Cloudflare Worker.

```js
const deploymentsEndpoint =
  "https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/{project_name}/deployments";
const projectEndpoint =
  "https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/{project_name}";


export default {
  async fetch(request, env) {
    const init = {
      headers: {
        "content-type": "application/json;charset=UTF-8",
        // We recommend you store the API token as a secret using the Workers dashboard or using Wrangler as documented here: https://developers.cloudflare.com/workers/wrangler/commands/#secret
        Authorization: `Bearer ${env.API_TOKEN}`,
      },
    };


    const style = `body { padding: 6em; font-family: sans-serif; } h1 { color: #f6821f }`;
    let content = "<h2>Project</h2>";


    let response = await fetch(projectEndpoint, init);
    const projectResponse = await response.json();
    content += `<p>Project Name: ${projectResponse.result.name}</p>`;
    content += `<p>Project ID: ${projectResponse.result.id}</p>`;
    content += `<p>Pages Subdomain: ${projectResponse.result.subdomain}</p>`;
    content += `<p>Domains: ${projectResponse.result.domains}</p>`;
    content += `<a href="${projectResponse.result.canonical_deployment.url}"><p>Latest preview: ${projectResponse.result.canonical_deployment.url}</p></a>`;


    content += `<h2>Deployments</h2>`;
    response = await fetch(deploymentsEndpoint, init);
    const deploymentsResponse = await response.json();


    for (const deployment of deploymentsResponse.result) {
      content += `<a href="${deployment.url}"><p>Deployment: ${deployment.id}</p></a>`;
    }


    let html = `
      <!DOCTYPE html>
      <head>
        <title>Example Pages Project</title>
      </head>
      <body>
        <style>${style}</style>
        <div id="container">
          ${content}
        </div>
      </body>`;


    return new Response(html, {
      headers: {
        "Content-Type": "text/html;charset=UTF-8",
      },
    });
  },
};
```

## Related resources

* [Pages API Docs](https://developers.cloudflare.com/api/resources/pages/subresources/projects/methods/list/)
* [Workers Getting Started Guide](https://developers.cloudflare.com/workers/get-started/guide/)
* [Workers Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)

</page>

<page>
---
title: Branch deployment controls · Cloudflare Pages docs
description: When connected to your git repository, Pages allows you to control
  which environments and branches you would like to automatically deploy to. By
  default, Pages will trigger a deployment any time you commit to either your
  production or preview environment. However, with branch deployment controls,
  you can configure automatic deployments to suit your preference on a per
  project basis.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/configuration/branch-build-controls/
  md: https://developers.cloudflare.com/pages/configuration/branch-build-controls/index.md
---

When connected to your git repository, Pages allows you to control which environments and branches you would like to automatically deploy to. By default, Pages will trigger a deployment any time you commit to either your production or preview environment. However, with branch deployment controls, you can configure automatic deployments to suit your preference on a per project basis.

## Production branch control

Direct Upload

If your project is a [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/) project, you will not have the option to configure production branch controls. To update your production branch, you will need to manually call the [Update Project](https://developers.cloudflare.com/api/resources/pages/subresources/projects/methods/edit/) endpoint in the API.

```bash
curl --request PATCH \
"https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/{project_name}" \
--header "Authorization: Bearer <API_TOKEN>" \
--header "Content-Type: application/json" \
--data "{\"production_branch\": \"main\"}"
```

To configure deployment options, go to your Pages project > **Settings** > **Builds & deployments** > **Configure Production deployments**. Pages will default to setting your production environment to the branch you first push, but you can set your production to another branch if you choose.

You can also enable or disable automatic deployment behavior on the production branch by checking the **Enable automatic production branch deployments** box. You must save your settings in order for the new production branch controls to take effect.

## Preview branch control

When configuring automatic preview deployments, there are three options to choose from.

* **All non-Production branches**: By default, Pages will automatically deploy any and every commit to a preview branch.
* **None**: Turns off automatic builds for all preview branches.
* **Custom branches**: Customize the automatic deployments of certain preview branches.

### Custom preview branch control

By selecting **Custom branches**, you can specify branches you wish to include and exclude from automatic deployments in the provided configuration fields. The configuration fields can be filled in two ways:

* **Static branch names**: Enter the precise name of the branch you are looking to include or exclude (for example, staging or dev).
* **Wildcard syntax**: Use wildcards to match multiple branches. You can specify wildcards at the start or end of your rule. The order of execution for the configuration is (1) Excludes, (2) Includes, (3) Skip. Pages will process the exclude configuration first, then go to the include configuration. If a branch does not match either then it will be skipped.

Wildcard syntax

A wildcard (`*`) is a character that is used within rules. It can be placed alone to match anything or placed at the start or end of a rule to allow for better control over branch configuration. A wildcard will match zero or more characters.For example, if you wanted to match all branches that started with `fix/` then you would create the rule `fix/*` to match strings like `fix/1`, `fix/bugs`or `fix/`.

**Example 1:**

If you want to enforce branch prefixes such as `fix/`, `feat/`, or `chore/` with wildcard syntax, you can include and exclude certain branches with the following rules:

* Include Preview branches: `fix/*`, `feat/*`, `chore/*`

* Exclude Preview branches: \`\`

Here Pages will include any branches with the indicated prefixes and exclude everything else. In this example, the excluding option is left empty.

**Example 2:**

If you wanted to prevent [dependabot](https://github.com/dependabot) from creating a deployment for each PR it creates, you can exclude those branches with the following:

* Include Preview branches: `*`

* Exclude Preview branches: `dependabot/*`

Here Pages will include all branches except any branch starting with `dependabot`. In this example, the excluding option means any `dependabot/` branches will not be built.

**Example 3:**

If you only want to deploy release-prefixed branches, then you could use the following rules:

* Include Preview branches: `release/*`

* Exclude Preview branches: `*`

This will deploy only branches starting with `release/`.

</page>

<page>
---
title: Build caching · Cloudflare Pages docs
description: Improve Pages build times by caching dependencies and build output
  between builds with a project-wide shared cache.
lastUpdated: 2025-09-17T11:00:27.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/configuration/build-caching/
  md: https://developers.cloudflare.com/pages/configuration/build-caching/index.md
---

Improve Pages build times by caching dependencies and build output between builds with a project-wide shared cache.

The first build to occur after enabling build caching on your Pages project will save to cache. Every subsequent build will restore from cache unless configured otherwise.

## About build cache

When enabled, the build cache will automatically detect and cache data from each build. Refer to [Frameworks](https://developers.cloudflare.com/pages/configuration/build-caching/#frameworks) to review what directories are automatically saved and restored from the build cache.

### Requirements

Build caching requires the [V2 build system](https://developers.cloudflare.com/pages/configuration/build-image/#v2-build-system) or later. To update from V1, refer to the [V2 build system migration instructions](https://developers.cloudflare.com/pages/configuration/build-image/#v1-to-v2-migration).

### Package managers

Pages will cache the global cache directories of the following package managers:

| Package Manager | Directories cached |
| - | - |
| [npm](https://www.npmjs.com/) | `.npm` |
| [yarn](https://yarnpkg.com/) | `.cache/yarn` |
| [pnpm](https://pnpm.io/) | `.pnpm-store` |
| [bun](https://bun.sh/) | `.bun/install/cache` |

### Frameworks

Some frameworks provide a cache directory that is typically populated by the framework with intermediate build outputs or dependencies during build time. Pages will automatically detect the framework you are using and cache this directory for reuse in subsequent builds.

The following frameworks support build output caching:

| Framework | Directories cached |
| - | - |
| Astro | `node_modules/.astro` |
| Docusaurus | `node_modules/.cache`, `.docusaurus`, `build` |
| Eleventy | `.cache` |
| Gatsby | `.cache`, `public` |
| Next.js | `.next/cache` |
| Nuxt | `node_modules/.cache/nuxt` |

### Limits

The following limits are imposed for build caching:

* **Retention**: Cache is purged seven days after its last read date. Unread cache artifacts are purged seven days after creation.
* **Storage**: Every project is allocated 10 GB. If the project cache exceeds this limit, the project will automatically start deleting artifacts that were read least recently.

## Enable build cache

To enable build caching :

1. Go to the **Workers & Pages** in the Cloudflare dashboard.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Find your Pages project.

3. Go to **Settings** > **Build** > **Build cache**.

4. Select **Enable** to turn on build caching.

## Clear build cache

The build cache can be cleared for a project if needed, such as when debugging build issues. To clear the build cache:

1. Go to the **Workers & Pages** in the Cloudflare dashboard.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Find your Pages project.

3. Go to **Settings** > **Build** > **Build cache**.

4. Select **Clear Cache** to clear the build cache.

</page>

<page>
---
title: Build configuration · Cloudflare Pages docs
description: You may tell Cloudflare Pages how your site needs to be built as
  well as where its output files will be located.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/configuration/build-configuration/
  md: https://developers.cloudflare.com/pages/configuration/build-configuration/index.md
---

You may tell Cloudflare Pages how your site needs to be built as well as where its output files will be located.

## Build commands and directories

You should provide a build command to tell Cloudflare Pages how to build your application. For projects not listed here, consider reading the tool's documentation or framework, and submit a pull request to add it here.

Build directories indicates where your project's build command outputs the built version of your Cloudflare Pages site. Often, this defaults to the industry-standard `public`, but you may find that you need to customize it.

Understanding your build configuration

The build command is provided by your framework. For example, the Gatsby framework uses `gatsby build` as its build command. When you are working without a framework, leave the **Build command** field blank. Pages determines whether a build has succeeded or failed by reading the exit code returned from the user supplied build command. Any non-zero return code will cause a build to be marked as failed. An exit code of 0 will cause the Pages build to be marked as successful and assets will be uploaded regardless of if error logs are written to standard error.

The build directory is generated from the build command. Each framework has its own naming convention, for example, the build output directory is named `/public` for many frameworks.

The root directory is where your site’s content lives. If not specified, Cloudflare assumes that your linked git repository is the root directory. The root directory needs to be specified in cases like monorepos, where there may be multiple projects in one repository.

## Framework presets

Cloudflare maintains a list of build configurations for popular frameworks and tools. These are accessible during project creation. Below are some standard build commands and directories for popular frameworks and tools.

If you are not using a preset, use `exit 0` as your **Build command**.

| Framework/tool | Build command | Build directory |
| - | - | - |
| React (Vite) | `npm run build` | `dist` |
| Gatsby | `npx gatsby build` | `public` |
| Next.js | `npx @cloudflare/next-on-pages@1` | `.vercel/output/static` |
| Next.js (Static HTML Export) | `npx next build` | `out` |
| Nuxt.js | `npm run build` | `dist` |
| Qwik | `npm run build` | `dist` |
| Remix | `npm run build` | `build/client` |
| Svelte | `npm run build` | `public` |
| SvelteKit | `npm run build` | `.svelte-kit/cloudflare` |
| Vue | `npm run build` | `dist` |
| Analog | `npm run build` | `dist/analog/public` |
| Astro | `npm run build` | `dist` |
| Angular | `npm run build` | `dist/cloudflare` |
| Brunch | `npx brunch build --production` | `public` |
| Docusaurus | `npm run build` | `build` |
| Elder.js | `npm run build` | `public` |
| Eleventy | `npx @11ty/eleventy` | `_site` |
| Ember.js | `npx ember-cli build` | `dist` |
| GitBook | `npx gitbook-cli build` | `_book` |
| Gridsome | `npx gridsome build` | `dist` |
| Hugo | `hugo` | `public` |
| Jekyll | `jekyll build` | `_site` |
| MkDocs | `mkdocs build` | `site` |
| Pelican | `pelican content` | `output` |
| React Static | `react-static build` | `dist` |
| Slate | `./deploy.sh` | `build` |
| Umi | `npx umi build` | `dist` |
| VitePress | `npx vitepress build` | `.vitepress/dist` |
| Zola | `zola build` | `public` |

## Environment variables

If your project makes use of environment variables to build your site, you can provide custom environment variables:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project.

3. Select **Settings** > **Environment variables**.

The following system environment variables are injected by default (but can be overridden):

| Environment Variable | Injected value | Example use-case |
| - | - | - |
| `CI` | `true` | Changing build behaviour when run on CI versus locally |
| `CF_PAGES` | `1` | Changing build behaviour when run on Pages versus locally |
| `CF_PAGES_COMMIT_SHA` | `<sha1-hash-of-current-commit>` | Passing current commit ID to error reporting, for example, Sentry |
| `CF_PAGES_BRANCH` | `<branch-name-of-current-deployment>` | Customizing build based on branch, for example, disabling debug logging on `production` |
| `CF_PAGES_URL` | `<url-of-current-deployment>` | Allowing build tools to know the URL the page will be deployed at |

</page>

<page>
---
title: Build image · Cloudflare Pages docs
description: Cloudflare Pages' build environment has broad support for a variety
  of languages, such as Ruby, Node.js, Python, PHP, and Go.
lastUpdated: 2025-12-18T16:07:21.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/configuration/build-image/
  md: https://developers.cloudflare.com/pages/configuration/build-image/index.md
---

Cloudflare Pages' build environment has broad support for a variety of languages, such as Ruby, Node.js, Python, PHP, and Go.

If you need to use a [specific version](#override-default-versions) of a language, (for example, Node.js or Ruby) you can specify it by providing an associated environment variable in your build configuration, or setting the relevant file in your source code.

## Supported languages and tools

In the following tables, review the preinstalled versions for languages and tools included in the Cloudflare Pages' build image, and the environment variables and/or files available for [overriding the preinstalled version](#override-default-versions):

### Languages and runtime

* v3

  | Tool | Default version | Supported versions | Environment variable | File |
  | - | - | - | - | - |
  | **Go** | 1.24.3 | Any version | `GO_VERSION` | |
  | **Node.js** | 22.16.0 | Any version | `NODE_VERSION` | .nvmrc, .node-version |
  | **Bun** | 1.2.15 | Any version | `BUN_VERSION` | |
  | **Python** | 3.13.3 | Any version | `PYTHON_VERSION` | .python-version, runtime.txt |
  | **Ruby** | 3.4.4 | Any version | `RUBY_VERSION` | .ruby-version |

* v2

  | Tool | Default version | Supported versions | Environment variable | File |
  | - | - | - | - | - |
  | **Go** | 1.21.0 | Any version | `GO_VERSION` | |
  | **Node.js** | 18.17.1 | Any version | `NODE_VERSION` | .nvmrc, .node-version |
  | **Bun** | 1.1.33 | Any version | `BUN_VERSION` | |
  | **Python** | 3.11.5 | Any version | `PYTHON_VERSION` | .python-version, runtime.txt |
  | **Ruby** | 3.2.2 | Any version | `RUBY_VERSION` | .ruby-version |

* v1

  | Tool | Default version | Supported versions | Environment variable | File |
  | - | - | - | - | - |
  | **Clojure** | | | | |
  | **Elixir** | 1.7 | 1.7 only | | |
  | **Erlang** | 21 | 21 only | | |
  | **Go** | 1.14.4 | Any version | `GO_VERSION` | |
  | **Java** | 8 | 8 only | | |
  | **Node.js** | 12.18.0 | Any version | `NODE_VERSION` | .nvmrc, .node-version |
  | **PHP** | 5.6 | 5.6, 7.2, 7.4 only | `PHP_VERSION` | |
  | **Python** | 2.7 | 2.7, 3.5, 3.7 only | `PYTHON_VERSION` | runtime.txt, Pipfile |
  | **Ruby** | 2.7.1 | Any version between 2.6.2 and 2.7.5 | `RUBY_VERSION` | .ruby-version |
  | **Swift** | 5.2.5 | Any 5.x version | `SWIFT_VERSION` | .swift-version |
  | **.NET** | 3.1.302 | | | |

Any version

Under Supported versions, "Any version" refers to support for all versions of the language or tool including versions newer than the Default version.

### Tools

* v3

  | Tool | Default version | Supported versions | Environment variable |
  | - | - | - | - |
  | **Bundler** | 2.6.9 | Corresponds with Ruby version | |
  | **Embedded Dart Sass** | 1.62.1 | Up to 1.62.1 | `EMBEDDED_DART_SASS_VERSION` |
  | **gem** | 3.6.9 | Corresponds with Ruby version | |
  | **Hugo** | 0.147.7 | Any version | `HUGO_VERSION` |
  | **npm** | 10.9.2 | Corresponds with Node.js version | |
  | **pip** | 25.1.1 | Corresponds with Python version | |
  | **pipx** | 1.7.1 | | |
  | **pnpm** | 10.11.1 | Any version | `PNPM_VERSION` |
  | **Poetry** | 2.1.3 | | |
  | **Yarn** | 4.9.1 | Any version | `YARN_VERSION` |

* v2

  | Tool | Default version | Supported versions | Environment variable |
  | - | - | - | - |
  | **Bundler** | 2.4.10 | Corresponds with Ruby version | |
  | **Embedded Dart Sass** | 1.62.1 | Up to 1.62.1 | `EMBEDDED_DART_SASS_VERSION` |
  | **gem** | 3.4.10 | Corresponds with Ruby version | |
  | **Hugo** | 0.118.2 | Any version | `HUGO_VERSION` |
  | **npm** | 9.6.7 | Corresponds with Node.js version | |
  | **pip** | 23.2.1 | Corresponds with Python version | |
  | **pipx** | 1.2.0 | | |
  | **pnpm** | 8.7.1 | Any version | `PNPM_VERSION` |
  | **Poetry** | 1.6.1 | | |
  | **Yarn** | 3.6.3 | Any version | `YARN_VERSION` |

* v1

  | Tool | Default version | Supported versions | Environment variable |
  | - | - | - | - |
  | **Boot** | 2.5.2 | 2.5.2 | |
  | **Bower** | | | |
  | **Cask** | | | |
  | **Composer** | | | |
  | **Doxygen** | 1.8.6 | | |
  | **Emacs** | 25 | | |
  | **Gutenberg** | (requires environment variable) | Any version | `GUTENBERG_VERSION` |
  | **Hugo** | 0.54.0 | Any version | `HUGO_VERSION` |
  | **GNU Make** | 3.8.1 | | |
  | **ImageMagick** | 6.7.7 | | |
  | **jq** | 1.5 | | |
  | **Leiningen** | | | |
  | **OptiPNG** | 0.6.4 | | |
  | **npm** | Corresponds with Node.js version | Any version | `NPM_VERSION` |
  | **pip** | Corresponds with Python version | | |
  | **Pipenv** | Latest version | | |
  | **sqlite3** | 3.11.0 | | |
  | **Yarn** | 1.22.4 | Any version from 0.2.0 to 1.22.19 | `YARN_VERSION` |
  | **Zola** | (requires environment variable) | Any version from 0.5.0 and up | `ZOLA_VERSION` |

Any version

Under Supported versions, "Any version" refers to support for all versions of the language or tool including versions newer than the Default version.

### Frameworks

To use a specific version of a framework, specify it in the project's package manager configuration file. For example, if you use Gatsby, your `package.json` should include the following:

```plaintext
"dependencies": {
  "gatsby": "^5.13.7",
}
```

When your build starts, if not already [cached](https://developers.cloudflare.com/pages/configuration/build-caching/), version 5.13.7 of Gatsby will be installed using `npm install`.

## Advanced Settings

### Override default versions

To override default versions of languages and tools in the build system, you can either set the desired version through environment variables or by adding files to your project.

To set the version using environment variables, you can:

1. Find the environment variable name for the language or tool in [this table](https://developers.cloudflare.com/pages/configuration/build-image/#supported-languages-and-tools).
2. Add the environment variable on the dashboard by going to **Settings** > **Environment variables** in your Pages project, or [add the environment variable via Wrangler](https://developers.cloudflare.com/workers/configuration/environment-variables/#add-environment-variables-via-wrangler).

Or, to set the version by adding a file to your project, you can:

1. Find the file name for the language or tool in [this table](https://developers.cloudflare.com/pages/configuration/build-image/#supported-languages-and-tools).
2. Add the specified file name to the root directory of your project, and add the desired version number as the contents of the file.

For example, if you were previously relying on the default version of Node.js in the v1 build system, to migrate to v2, you must specify that you need Node.js `12.18.0` by setting a `NODE_VERSION = 12.18.0` environment variable or by adding a `.node-version` or `.nvmrc` file to your project with `12.18.0` added as the contents to the file.

### Skip dependency install

You can add the following environment variable to disable automatic dependency installation, and run a custom install command instead.

| Build variable | Value |
| - | - |
| `SKIP_DEPENDENCY_INSTALL` | `1` or `true` |

## v3 build system

The v3 build system updates the default tools, libraries and languages to their LTS versions, as of May 2025.

### v2 to v3 Migration

To migrate to this new version, configure your Pages project settings in the dashboard:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project.

3. Go to **Deployments** > **All deployments** > and select the latest version.

If you were previously relying on the default versions of any languages or tools in the build system, your build may fail when migrating to v3. To fix this, you must specify the version you wish to use by [overriding](https://developers.cloudflare.com/pages/configuration/build-image/#overriding-default-versions) the default versions.

### Limitations

The following features are not currently supported when using the v3 build system:

* Specifying Node.js versions as codenames (for example, `hydrogen` or `lts/hydrogen`).
* Detecting Yarn version from `yarn.lock` file version.
* Detecting pnpm version detection based `pnpm-lock.yaml` file version.
* Detecting Node.js and package managers from `package.json` -> `"engines"`.
* `pipenv` and `Pipfile` support.

## Build environment

Cloudflare Pages builds are run in a [gVisor](https://gvisor.dev/docs/) container.

* v3

  | | |
  | - | - |
  | **Build environment** | Ubuntu `22.04.2` |
  | **Architecture** | x86\_64 |

* v2

  | | |
  | - | - |
  | **Build environment** | Ubuntu `22.04.2` |
  | **Architecture** | x86\_64 |

* v1

  | | |
  | - | - |
  | **Build environment** | Ubuntu `20.04.5` |
  | **Architecture** | x86\_64 |

## Build Image Policy

### Build Image Version Deprecation

If you are currently using the v1 or v2 build image, your project will be automatically moved to v3:

* **v1 build image**: If you are using the Pages v1 build image, your project will be automatically moved to v3 on August 25, 2026.
* **v2 build image**: If you are using the Pages v2 build image, your project will be automatically moved to v3 on February 23, 2027.

You will receive 6 months’ notice before the deprecation date via the [Cloudflare Changelog](https://developers.cloudflare.com/changelog/), dashboard notifications, and email.

Going forward, the v3 build image will receive rolling updates to preinstalled software per the policy below. There will be no further build image version changes.

### Preinstalled Software Updates

Preinstalled software (languages and tools) will be updated before reaching end-of-life (EOL). These updates apply only if you have not [overridden the default version](https://developers.cloudflare.com/pages/configuration/build-image/#override-default-versions).

* **Minor version updates**: May be updated to the latest available minor version without notice. For tools that do not follow semantic versioning (e.g., Bun or Hugo), updates that may contain breaking changes will receive 3 months’ notice.
* **Major version updates**: Updated to the next stable long-term support (LTS) version with 3 months’ notice.

**How you'll be notified (for changes requiring notice):**

* [Cloudflare Changelog](https://developers.cloudflare.com/changelog/)
* Dashboard notifications for projects that will receive the update
* Email notifications to project owners

To maintain a specific version and avoid automatic updates, [override the default version](https://developers.cloudflare.com/pages/configuration/build-image/#override-default-versions).

### Best Practices

To avoid unexpected build failures:

* **Monitor announcements** via the [Cloudflare Changelog](https://developers.cloudflare.com/changelog/), dashboard notifications, and email
* **Plan for migration** when you receive update notices
* **Pin specific versions** of critical preinstalled software by [overriding default versions](https://developers.cloudflare.com/pages/configuration/build-image/#override-default-versions)

</page>

<page>
---
title: Build watch paths · Cloudflare Pages docs
description: When you connect a git repository to Pages, by default a change to
  any file in the repository will trigger a Pages build. You can configure Pages
  to include or exclude specific paths to specify if Pages should skip a build
  for a given path. This can be especially helpful if you are using a monorepo
  project structure and want to limit the amount of builds being kicked off.
lastUpdated: 2025-09-17T11:00:27.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/configuration/build-watch-paths/
  md: https://developers.cloudflare.com/pages/configuration/build-watch-paths/index.md
---

When you connect a git repository to Pages, by default a change to any file in the repository will trigger a Pages build. You can configure Pages to include or exclude specific paths to specify if Pages should skip a build for a given path. This can be especially helpful if you are using a monorepo project structure and want to limit the amount of builds being kicked off.

## Configure paths

To configure which paths are included and excluded:

1. Go to the **Workers & Pages** in the Cloudflare dashboard.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Find your Pages project.

3. Go to **Settings** > **Build** > **Build watch paths**. Pages will default to setting your project's includes paths to everything (\[\*]) and excludes paths to nothing (`[]`).

The configuration fields can be filled in two ways:

* **Static filepaths**: Enter the precise name of the file you are looking to include or exclude (for example, `docs/README.md`).
* **Wildcard syntax:** Use wildcards to match multiple path directories. You can specify wildcards at the start or end of your rule.

Wildcard syntax

A wildcard (`*`) is a character that is used within rules. It can be placed alone to match anything or placed at the start or end of a rule to allow for better control over branch configuration. A wildcard will match zero or more characters.For example, if you wanted to match all branches that started with `fix/` then you would create the rule `fix/*` to match strings like `fix/1`, `fix/bugs`or `fix/`.

For each path in a push event, build watch paths will be evaluated as follows:

* Paths satisfying excludes conditions are ignored first
* Any remaining paths are checked against includes conditions
* If any matching path is found, a build is triggered. Otherwise the build is skipped

Pages will bypass the path matching for a push event and default to building the project if:

* A push event contains 0 file changes, in case a user pushes a empty push event to trigger a build
* A push event contains 3000+ file changes or 20+ commits

## Examples

### Example 1

If you want to trigger a build from all changes within a set of directories, such as all changes in the folders `project-a/` and `packages/`

* Include paths: `project-a/*, packages/*`
* Exclude paths: \`\`

### Example 2

If you want to trigger a build for any changes, but want to exclude changes to a certain directory, such as all changes in a docs/ directory

* Include paths: `*`
* Exclude paths: `docs/*`

### Example 3

If you want to trigger a build for a specific file or specific filetype, for example all files ending in `.md`.

* Include paths: `*.md`
* Exclude paths: \`\`

</page>

<page>
---
title: Custom domains · Cloudflare Pages docs
description: When deploying your Pages project, you may wish to point custom
  domains (or subdomains) to your site.
lastUpdated: 2025-09-17T11:00:27.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/configuration/custom-domains/
  md: https://developers.cloudflare.com/pages/configuration/custom-domains/index.md
---

When deploying your Pages project, you may wish to point custom domains (or subdomains) to your site.

## Add a custom domain

To add a custom domain:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project > **Custom domains**.

3. Select **Set up a domain**.

4. Provide the domain that you would like to serve your Cloudflare Pages site on and select **Continue**.

![Adding a custom domain for your Pages project through the Cloudflare dashboard](https://developers.cloudflare.com/_astro/domains.zq4iMU_J_jMmg9.webp)

### Add a custom apex domain

If you are deploying to an apex domain (for example, `example.com`), then you will need to add your site as a Cloudflare zone and [configure your nameservers](#configure-nameservers).

#### Configure nameservers

To use a custom apex domain (for example, `example.com`) with your Pages project, [configure your nameservers to point to Cloudflare's nameservers](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/). If your nameservers are successfully pointed to Cloudflare, Cloudflare will proceed by creating a CNAME record for you.

### Add a custom subdomain

If you are deploying to a subdomain, it is not necessary for your site to be a Cloudflare zone. You will need to [add a custom CNAME record](#add-a-custom-cname-record) to point the domain to your Cloudflare Pages site. To deploy your Pages project to a custom apex domain, that custom domain must be a zone on the Cloudflare account you have created your Pages project on.

Note

If the zone is on the Enterprise plan, make sure that you [release the zone hold](https://developers.cloudflare.com/fundamentals/account/account-security/zone-holds/#release-zone-holds) before adding the custom domain. A zone hold would prevent the custom subdomain from activating.

#### Add a custom CNAME record

If you do not want to point your nameservers to Cloudflare, you must create a custom CNAME record to use a subdomain with Cloudflare Pages. After logging in to your DNS provider, add a CNAME record for your desired subdomain, for example, `shop.example.com`. This record should point to your custom Pages subdomain, for example, `<YOUR_SITE>.pages.dev`.

| Type | Name | Content |
| - | - | - |
| `CNAME` | `shop.example.com` | `<YOUR_SITE>.pages.dev` |

If your site is already managed as a Cloudflare zone, the CNAME record will be added automatically after you confirm your DNS record.

Note

To ensure a custom domain is added successfully, you must go through the [Add a custom domain](#add-a-custom-domain) process described above. Manually adding a custom CNAME record pointing to your Cloudflare Pages site - without first associating the domain (or subdomains) in the Cloudflare Pages dashboard - will result in your domain failing to resolve at the CNAME record address, and display a [`522` error](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-5xx-errors/error-522/).

## Delete a custom domain

To detach a custom domain from your Pages project, you must modify your zone's DNS records.

1. Go to the **DNS Records** page for your website in the Cloudflare dashboard.

   [Go to **Records**](https://dash.cloudflare.com/?to=/:account/:zone/dns/records)

2. Locate your Pages project's CNAME record.

3. Select **Edit**.

4. Select **Delete**.

5. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

6. Select your Pages project.

7. Go to **Custom domains**.

8. Select the **three dot icon** next to your custom domain > **Remove domain**.

After completing these steps, your Pages project will only be accessible through the `*.pages.dev` subdomain you chose when creating your project.

## Disable access to `*.pages.dev` subdomain

To disable access to your project's provided `*.pages.dev` subdomain:

1. Use Cloudflare Access over your previews (`*.{project}.pages.dev`). Refer to [Customize preview deployments access](https://developers.cloudflare.com/pages/configuration/preview-deployments/#customize-preview-deployments-access).

2. Redirect the `*.pages.dev` URL associated with your production Pages project to a custom domain. You can use the account-level [Bulk Redirect](https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/) feature to redirect your `*.pages.dev` URL to a custom domain.

## Caching

For guidelines on caching, refer to [Caching and performance](https://developers.cloudflare.com/pages/configuration/serving-pages/#caching-and-performance).

## Known issues

### CAA records

Certification Authority Authorization (CAA) records allow you to restrict certificate issuance to specific Certificate Authorities (CAs).

This can cause issues when adding a [custom domain](https://developers.cloudflare.com/pages/configuration/custom-domains/) to your Pages project if you have CAA records that do not allow Cloudflare to issue a certificate for your custom domain.

To resolve this, add the necessary CAA records to allow Cloudflare to issue a certificate for your custom domain.

```plaintext
example.com.            300     IN      CAA     0 issue "letsencrypt.org"
example.com.            300     IN      CAA     0 issue "pki.goog; cansignhttpexchanges=yes"
example.com.            300     IN      CAA     0 issue "ssl.com"
example.com.            300     IN      CAA     0 issuewild "letsencrypt.org"
example.com.            300     IN      CAA     0 issuewild "pki.goog; cansignhttpexchanges=yes"
example.com.            300     IN      CAA     0 issuewild "ssl.com"
```

Refer to the [Certification Authority Authorization (CAA) FAQ](https://developers.cloudflare.com/ssl/edge-certificates/troubleshooting/caa-records/) for more information.

### Change DNS entry away from Pages and then back again

Once a custom domain is set up, if you change the DNS entry to point to something else (for example, your origin), the custom domain will become inactive. If you then change that DNS entry to point back at your custom domain, anybody using that DNS entry to visit your website will get errors until it becomes active again. If you want to redirect traffic away from your Pages project temporarily instead of changing the DNS entry, it would be better to use an [Origin rule](https://developers.cloudflare.com/rules/origin-rules/) or a [redirect rule](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/create-dashboard/) instead.

## Relevant resources

* [Debugging Pages](https://developers.cloudflare.com/pages/configuration/debugging-pages/) - Review common errors when deploying your Pages project.

</page>

<page>
---
title: Debugging Pages · Cloudflare Pages docs
description: When setting up your Pages project, you may encounter various
  errors that prevent you from successfully deploying your site. This guide
  gives an overview of some common errors and solutions.
lastUpdated: 2025-10-22T21:11:06.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/configuration/debugging-pages/
  md: https://developers.cloudflare.com/pages/configuration/debugging-pages/index.md
---

When setting up your Pages project, you may encounter various errors that prevent you from successfully deploying your site. This guide gives an overview of some common errors and solutions.

## Check your build log

You can review build errors in your Pages build log. To access your build log:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project.

3. Go to **Deployments** > **View details** > **Build log**.

![After logging in to the Cloudflare dashboard, access the build log by following the instructions above](https://developers.cloudflare.com/_astro/pages-build-log.Dc14wrt1_26cVD8.webp)

Possible errors in your build log are included in the following sections.

### Initializing build environment

Possible errors in this step could be caused by improper installation during Git integration.

To fix this in GitHub:

1. Log in to your GitHub account.
2. Go to **Settings** from your user icon > find **Applications** under Integrations.
3. Find **Cloudflare Pages** > **Configure** > scroll down and select **Uninstall**.
4. Re-authorize your GitHub user/organization on the Cloudflare dashboard.

To fix this in GitLab:

1. Log in to your GitLab account.
2. Go to **Preferences** from your user icon > **Applications**.
3. Find **Cloudflare Pages** > scroll down and select **Revoke**.

Be aware that you need a role of **Maintainer** or above to successfully link your repository, otherwise the build will fail.

### Cloning git repository

Possible errors in this step could be caused by lack of Git Large File Storage (LFS). Check your LFS usage by referring to the [GitHub](https://docs.github.com/en/billing/managing-billing-for-git-large-file-storage/viewing-your-git-large-file-storage-usage) and [GitLab](https://docs.gitlab.com/ee/topics/git/lfs/) documentation.

Make sure to also review your submodule configuration by going to the `.gitmodules` file in your root directory. This file needs to contain both a `path` and a `url` property.

Example of a valid configuration:

```js
[submodule "example"]
  path = example/path
  url = git://github.com/example/repo.git
```

Example of an invalid configuration:

```js
[submodule "example"]
  path = example/path
```

or

```js
[submodule "example"]
        url = git://github.com/example/repo.git
```

### Building application

Possible errors in this step could be caused by faulty setup in your Pages project. Review your build command, output folder and environment variables for any incorrect configuration.

Note

Make sure there are no emojis or special characters as part of your commit message in a Pages project that is integrated with GitHub or GitLab as it can potentially cause issues when building the project.

### Deploying to Cloudflare's global network

Possible errors in this step could be caused by incorrect Pages Functions configuration. Refer to the [Functions](https://developers.cloudflare.com/pages/functions/) documentation for more information on Functions setup.

If you are not using Functions or have reviewed that your Functions configuration does not contain any errors, review the [Cloudflare Status site](https://www.cloudflarestatus.com/) for Cloudflare network issues that could be causing the build failure.

## Differences between `pages.dev` and custom domains

If your custom domain is proxied (orange-clouded) through Cloudflare, your zone's settings, like caching, will apply.

If you are experiencing issues with new content not being shown, go to **Rules** > **Page Rules** in the Cloudflare dashboard and check for a Page Rule with **Cache Everything** enabled. If present, remove this rule as Pages handles its own cache.

If you are experiencing errors on your custom domain but not on your `pages.dev` domain, go to **DNS** > **Records** in the Cloudflare dashboard and set the DNS record for your project to be **DNS Only** (grey cloud). If the error persists, review your zone's configuration.

## Domain stuck in verification

If your [custom domain](https://developers.cloudflare.com/pages/configuration/custom-domains/) has not moved from the **Verifying** stage in the Cloudflare dashboard, refer to the following debugging steps.

### Blocked HTTP validation

Pages uses HTTP validation and needs to hit an HTTP endpoint during validation. If another Cloudflare product is in the way (such as [Access](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/), [a redirect](https://developers.cloudflare.com/rules/url-forwarding/), [a Worker](https://developers.cloudflare.com/workers/), etc.), validation cannot be completed.

To check this, run a `curl` command against your domain hitting `/.well-known/acme-challenge/randomstring`. For example:

```sh
curl -I https://example.com/.well-known/acme-challenge/randomstring
```

```sh
HTTP/2 302
date: Mon, 03 Apr 2023 08:37:39 GMT
location: https://example.cloudflareaccess.com/cdn-cgi/access/login/example.com?kid=...&redirect_url=%2F.well-known%2Facme-challenge%2F...
access-control-allow-credentials: true
cache-control: private, max-age=0, no-store, no-cache, must-revalidate, post-check=0, pre-check=0
server: cloudflare
cf-ray: 7b1ffdaa8ad60693-MAN
```

In the example above, you are redirecting to Cloudflare Access (as shown by the `Location` header). In this case, you need to disable Access over the domain until the domain is verified. After the domain is verified, Access can be re-enabled.

You will need to do the same kind of thing for Redirect Rules or a Worker example too.

### Missing CAA records

If nothing is blocking the HTTP validation, then you may be missing Certification Authority Authorization (CAA) records. This is likely if you have disabled [Universal SSL](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/) or use an external provider.

To check this, run a `dig` on the custom domain's apex (or zone, if this is a [subdomain zone](https://developers.cloudflare.com/dns/zone-setups/subdomain-setup/)). For example:

```sh
dig CAA example.com
```

```sh
; <<>> DiG 9.10.6 <<>> CAA example.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 59018
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1


;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;example.com.    IN  CAA


;; ANSWER SECTION:
example.com.  300  IN  CAA  0 issue "amazon.com"


;; Query time: 92 msec
;; SERVER: 127.0.2.2#53(127.0.2.2)
;; WHEN: Mon Apr 03 10:15:51 BST 2023
;; MSG SIZE  rcvd: 76
```

In the above example, there is only a single CAA record which is allowing Amazon to issue ceritficates.

To resolve this, you will need to add the following CAA records which allows all of the Certificate Authorities (CAs) Cloudflare uses to issue certificates:

```plaintext
example.com.            300     IN      CAA     0 issue "letsencrypt.org"
example.com.            300     IN      CAA     0 issue "pki.goog; cansignhttpexchanges=yes"
example.com.            300     IN      CAA     0 issue "ssl.com"
example.com.            300     IN      CAA     0 issuewild "letsencrypt.org"
example.com.            300     IN      CAA     0 issuewild "pki.goog; cansignhttpexchanges=yes"
example.com.            300     IN      CAA     0 issuewild "ssl.com"
```

### Zone holds

A [zone hold](https://developers.cloudflare.com/fundamentals/account/account-security/zone-holds/) will prevent Pages from adding a custom domain for a hostname under a zone hold.

To add a custom domain for a hostname with a zone hold, temporarily [release the zone hold](https://developers.cloudflare.com/fundamentals/account/account-security/zone-holds/#release-zone-holds) during the custom domain setup process.

Once the custom domain has been successfully completed, you may [reinstate the zone hold](https://developers.cloudflare.com/fundamentals/account/account-security/zone-holds/#enable-zone-holds).

Still having issues

If you have done the steps above and your domain is still verifying after 15 minutes, join our [Discord](https://discord.cloudflare.com) for support or contact our support team through the [Support Portal](https://dash.cloudflare.com/?to=/:account/support).

### Missing `index.html` on the root `pages.dev` URL

If you see a `404` error on the root `pages.dev` URL (`example.pages.dev`), you are likely missing an `index.html` file in your project.

Upload an `index.html` file to resolve this issue.

## Resources

If you need additional guidance on build errors, contact your Cloudflare account team (Enterprise) or refer to the [Support Center](https://developers.cloudflare.com/support/contacting-cloudflare-support/) for guidance on contacting Cloudflare Support.

You can also ask questions in the Pages section of the [Cloudflare Developers Discord](https://discord.com/invite/cloudflaredev).

</page>

<page>
---
title: Deploy Hooks · Cloudflare Pages docs
description: "With Deploy Hooks, you can trigger deployments using event sources
  beyond commits in your source repository. Each event source may obtain its own
  unique URL, which will receive HTTP POST requests in order to initiate new
  deployments. This feature allows you to integrate Pages with new or existing
  workflows. For example, you may:"
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/configuration/deploy-hooks/
  md: https://developers.cloudflare.com/pages/configuration/deploy-hooks/index.md
---

With Deploy Hooks, you can trigger deployments using event sources beyond commits in your source repository. Each event source may obtain its own unique URL, which will receive HTTP POST requests in order to initiate new deployments. This feature allows you to integrate Pages with new or existing workflows. For example, you may:

* Automatically deploy new builds whenever content in a Headless CMS changes
* Implement a fully customized CI/CD pipeline, deploying only under desired conditions
* Schedule a CRON trigger to update your website on a fixed timeline

To create a Deploy Hook:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project.

3. Go to **Settings** > **Builds** and select **Add deploy hook** to start configuration.

![Add a deploy hook on the Cloudflare dashboard](https://developers.cloudflare.com/_astro/deploy-hooks-add.u1N247wc_1rT4RL.webp)

## Parameters needed

To configure your Deploy Hook, you must enter two key parameters:

1. **Deploy hook name:** a unique identifier for your Deploy Hook (for example, `contentful-site`)
2. **Branch to build:** the repository branch your Deploy Hook should build

![Choosing Deploy Hook name and branch to build on Cloudflare dashboard](https://developers.cloudflare.com/_astro/deploy-hooks-configure.C0YoLPl3_1gMfRi.webp)

## Using your Deploy Hook

Once your configuration is complete, the Deploy Hook’s unique URL is ready to be used. You will see both the URL as well as the POST request snippet available to copy.

![Reviewing the Deploy Hook's newly generated unique URL](https://developers.cloudflare.com/_astro/deploy-hooks-details.COmJrG8a_Z1Bj3LX.webp)

Every time a request is sent to your Deploy Hook, a new build will be triggered. Review the **Source** column of your deployment log to see which deployment were triggered by a Deploy Hook.

![Reviewing which deployment was triggered by a Deploy Hook](https://developers.cloudflare.com/_astro/deploy-hooks-deployment-logs.yCL-S3AE_QI7tV.webp)

## Security Considerations

Deploy Hooks are uniquely linked to your project and do not require additional authentication to be used. While this does allow for complete flexibility, it is important that you protect these URLs in the same way you would safeguard any proprietary information or application secret.

If you suspect unauthorized usage of a Deploy Hook, you should delete the Deploy Hook and generate a new one in its place.

## Integrating Deploy Hooks with common CMS platforms

Every CMS provider is different and will offer different pathways in integrating with Pages' Deploy Hooks. The following section contains step-by-step instructions for a select number of popular CMS platforms.

### Contentful

Contentful supports integration with Cloudflare Pages via its **Webhooks** feature. In your Contentful project settings, go to **Webhooks**, create a new Webhook, and paste in your unique Deploy Hook URL in the **URL** field. Optionally, you can specify events that the Contentful Webhook should forward. By default, Contentful will trigger a Pages deployment on all project activity, which may be a bit too frequent. You can filter for specific events, such as Create, Publish, and many others.

![Configuring Deploy Hooks with Contentful](https://developers.cloudflare.com/_astro/contentful.CE1uZvg8_ZocFvz.webp)

### Ghost

You can configure your Ghost website to trigger Pages deployments by creating a new **Custom Integration**. In your Ghost website’s settings, create a new Custom Integration in the **Integrations** page.

Each custom integration created can have multiple **webhooks** attached to it. Create a new webhook by selecting **Add webhook** and **Site changed (rebuild)** as the **Event**. Then paste your unique Deploy Hook URL as the **Target URL** value. After creating this webhook, your Cloudflare Pages application will redeploy whenever your Ghost site changes.

![Configuring Deploy Hooks with Ghost](https://developers.cloudflare.com/_astro/ghost.CT5H6NM7_Zeyqta.webp)

### Sanity

In your Sanity project's Settings page, find the **Webhooks** section, and add the Deploy Hook URL, as seen below. By default, the Webhook will trigger your Pages Deploy Hook for all datasets inside of your Sanity project. You can filter notifications to individual datasets, such as production, using the **Dataset** field:

![Configuring Deploy Hooks with Sanity](https://developers.cloudflare.com/_astro/hooks.CikwC9IO_NHazD.webp)

### WordPress

You can configure WordPress to trigger a Pages Deploy Hook by installing the free **WP Webhooks** plugin. The plugin includes a number of triggers, such as **Send Data on New Post, Send Data on Post Update** and **Send Data on Post Deletion**, all of which allow you to trigger new Pages deployments as your WordPress data changes. Select a trigger on the sidebar of the plugin settings and then [**Add Webhook URL**](https://wordpress.org/plugins/wp-webhooks/), pasting in your unique Deploy Hook URL.

![Configuring Deploy Hooks with WordPress](https://developers.cloudflare.com/_astro/wordpress.VDVl6Kuz_Z1IPszI.webp)

### Strapi

In your Strapi Admin Panel, you can set up and configure webhooks to enhance your experience with Cloudflare Pages. In the Strapi Admin Panel:

1. Navigate to **Settings**.
2. Select **Webhooks**.
3. Select **Add New Webhook**.
4. In the **Name** form field, give your new webhook a unique name.
5. In the **URL** form field, paste your unique Cloudflare Deploy Hook URL.

In the Strapi Admin Panel, you can configure your webhook to be triggered based on events. You can adjust these settings to create a new deployment of your Cloudflare Pages site automatically when a Strapi entry or media asset is created, updated, or deleted.

Be sure to add the webhook configuration to the [production](https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/installation.html) Strapi application that powers your Cloudflare site.

![Configuring Deploy Hooks with Strapi](https://developers.cloudflare.com/_astro/strapi.BuGuUrHn_Si9E0.webp)

### Storyblok

You can set up and configure deploy hooks in Storyblok to trigger events. In your Storyblok space, go to **Settings** and scroll down to **Webhooks**. Paste your deploy hook into the **Story published & unpublished** field and select **Save**.

![Configuring Deploy Hooks with Storyblok](https://user-images.githubusercontent.com/53130544/161367254-ff475f3b-2821-4ee8-a175-8e96e779aa08.png)

</page>

<page>
---
title: Early Hints · Cloudflare Pages docs
description: Early Hints help the browser to load webpages faster. Early Hints
  is enabled automatically on all pages.dev domains and custom domains.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/configuration/early-hints/
  md: https://developers.cloudflare.com/pages/configuration/early-hints/index.md
---

[Early Hints](https://developers.cloudflare.com/cache/advanced-configuration/early-hints/) help the browser to load webpages faster. Early Hints is enabled automatically on all `pages.dev` domains and custom domains.

Early Hints automatically caches any [`preload`](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/preload) and [`preconnect`](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/preconnect) type [`Link` headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Link) to send as Early Hints to the browser. The hints are sent to the browser before the full response is prepared, and the browser can figure out how to load the webpage faster for the end user. There are two ways to create these `Link` headers in Pages:

## Configure Early Hints

Early Hints can be created with either of the two methods detailed below.

### 1. Configure your `_headers` file

Create custom headers using the [`_headers` file](https://developers.cloudflare.com/pages/configuration/headers/). If you include a particular stylesheet on your `/blog/` section of your website, you would create the following rule:

```txt
/blog/*
  Link: </styles.css>; rel=preload; as=style
```

Pages will attach this `Link: </styles.css>; rel=preload; as=style` header. Early Hints will then emit this header as an Early Hint once cached.

### 2. Automatic `Link` header generation

In order to make the authoring experience easier, Pages also automatically generates `Link` headers from any `<link>` HTML elements with the following attributes:

* `href`
* `as` (optional)
* `rel` (one of `preconnect`, `preload`, or `modulepreload`)

`<link>` elements which contain any other additional attributes (for example, `fetchpriority`, `crossorigin` or `data-do-not-generate-a-link-header`) will not be used to generate `Link` headers in order to prevent accidentally losing any custom prioritization logic that would otherwise be dropped as an Early Hint.

This allows you to directly create Early Hints as you are writing your document, without needing to alternate between your HTML and `_headers` file.

```html
<html>
  <head>
    <link rel="preload" href="/style.css" as="style" />
    <link rel="stylesheet" href="/style.css" />
  </head>
</html>
```

### Disable automatic `Link` header generation Automatic `Link` header

Remove any automatically generated `Link` headers by adding the following to your `_headers` file:

```txt
/*
  ! Link
```

Warning

Automatic `Link` header generation should not have any negative performance impact on your website. If you need to disable this feature, contact us by letting us know about your circumstance in our [Discord server](https://discord.com/invite/cloudflaredev).

</page>

<page>
---
title: Git integration · Cloudflare Pages docs
description: You can connect each Cloudflare Pages project to a GitHub or GitLab
  repository, and Cloudflare will automatically deploy your code every time you
  push a change to a branch.
lastUpdated: 2025-09-17T11:00:27.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/configuration/git-integration/
  md: https://developers.cloudflare.com/pages/configuration/git-integration/index.md
---

You can connect each Cloudflare Pages project to a [GitHub](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration) or [GitLab](https://developers.cloudflare.com/pages/configuration/git-integration/gitlab-integration) repository, and Cloudflare will automatically deploy your code every time you push a change to a branch.

Note

Cloudflare Workers now also supports Git integrations to automatically build and deploy Workers from your connected Git repository. Learn more in [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/).

When you connect a git repository to your Cloudflare Pages project, Cloudflare will also:

* **Preview deployments for custom branches**, generating preview URLs for a commit to any branch in the repository without affecting your production deployment.
* **Preview URLs in pull requests** (PRs) to the repository.
* **Build and deployment status checks** within the Git repository.
* **Skipping builds using a commit message**.

These features allow you to manage your deployments directly within GitHub or GitLab without leaving your team's regular development workflow.

You cannot switch to Direct Upload later

If you deploy using the Git integration, you cannot switch to [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/) later. However, if you already use a Git-integrated project and do not want to trigger deployments every time you push a commit, you can [disable automatic deployments](https://developers.cloudflare.com/pages/configuration/git-integration/#disable-automatic-deployments) on all branches. Then, you can use Wrangler to deploy directly to your Pages projects and make changes to your Git repository without automatically triggering a build.

## Supported Git providers

Cloudflare supports connecting Cloudflare Pages to your GitHub and GitLab repositories. Pages does not currently support connecting self-hosted instances of GitHub or GitLab.

If you using a different Git provider (e.g. Bitbucket) or a self-hosted instance, you can start with a Direct Upload project and deploy using a CI/CD provider (e.g. GitHub Actions) with [Wrangler CLI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/).

## Add a Git integration

If you do not have a Git account linked to your Cloudflare account, you will be prompted to set up an installation to GitHub or GitLab when [connecting to Git](https://developers.cloudflare.com/pages/get-started/git-integration/) for the first time, or when adding a new Git account. Follow the prompts and authorize the Cloudflare Git integration.

You can check the following pages to see if your Git integration has been installed:

* [GitHub Applications page](https://github.com/settings/installations) (if you're in an organization, select **Switch settings context** to access your GitHub organization settings)
* [GitLab Authorized Applications page](https://gitlab.com/-/profile/applications)

For details on providing access to organization accounts, see the [GitHub](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/#organizational-access) and [GitLab](https://developers.cloudflare.com/pages/configuration/git-integration/gitlab-integration/#organizational-access) guides.

## Manage a Git integration

You can manage the Git installation associated with your repository connection by navigating to the Pages project, then going to **Settings** > **Builds** and selecting **Manage** under **Git Repository**.

This can be useful for managing repository access or troubleshooting installation issues by reinstalling. For more details, see the [GitHub](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/#managing-access) and [GitLab](https://developers.cloudflare.com/pages/configuration/git-integration/gitlab-integration/#managing-access) guides.

## Disable automatic deployments

If you are using a Git-integrated project and do not want to trigger deployments every time you push a commit, you can use [branch control](https://developers.cloudflare.com/pages/configuration/branch-build-controls/) to disable/pause builds:

1. Go to **Workers & Pages** in the Cloudflare dashboard.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project.

3. Navigate to **Build** > edit **Branch control** > turn off **Enable automatic production branch deployments**.

4. You can also change your Preview branch to **None (Disable automatic branch deployments)** to pause automatic preview deployments.

Then, you can use Wrangler to deploy directly to your Pages project and make changes to your Git repository without automatically triggering a build.

</page>

<page>
---
title: Headers · Cloudflare Pages docs
description: The default response headers served on static asset responses can
  be overridden, removed, or added to, by creating a plain text file called
  _headers without a file extension, in the static asset directory of your
  project. This file will not itself be served as a static asset, but will
  instead be parsed by Cloudflare Pages and its rules will be applied to static
  asset responses.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/configuration/headers/
  md: https://developers.cloudflare.com/pages/configuration/headers/index.md
---

## Custom headers

The default response headers served on static asset responses can be overridden, removed, or added to, by creating a plain text file called `_headers` without a file extension, in the static asset directory of your project. This file will not itself be served as a static asset, but will instead be parsed by Cloudflare Pages and its rules will be applied to static asset responses.

If you are using a framework, you will often have a directory named `public/` or `static/`, and this usually contains deploy-ready assets, such as favicons, `robots.txt` files, and site manifests. These files get copied over to a final output directory during the build, so this is the perfect place to author your `_headers` file. If you are not using a framework, the `_headers` file can go directly into your [build output directory](https://developers.cloudflare.com/pages/configuration/build-configuration/).

Headers defined in the `_headers` file override what Cloudflare ordinarily sends.

Warning

Custom headers defined in the `_headers` file are not applied to responses generated by [Pages Functions](https://developers.cloudflare.com/pages/functions/), even if the request URL matches a rule defined in `_headers`. If you use a server-side rendered (SSR) framework, or Pages Functions (with either a folder of [`functions/`](https://developers.cloudflare.com/pages/functions/routing/) or an ["advanced mode" `_worker.js`](https://developers.cloudflare.com/pages/functions/advanced-mode/)), you will likely need to attach any custom headers you wish to apply directly within that Pages Functions code.

### Attach a header

Header rules are defined in multi-line blocks. The first line of a block is the URL or URL pattern where the rule's headers should be applied. On the next line, an indented list of header names and header values must be written:

```txt
[url]
  [name]: [value]
```

Using absolute URLs is supported, though be aware that absolute URLs must begin with `https` and specifying a port is not supported. `_headers` rules ignore the incoming request's port and protocol when matching against an incoming request. For example, a rule like `https://example.com/path` would match against requests to `other://example.com:1234/path`.

You can define as many `[name]: [value]` pairs as you require on subsequent lines. For example:

```txt
# This is a comment
/secure/page
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer


/static/*
  Access-Control-Allow-Origin: *
  X-Robots-Tag: nosnippet


https://myproject.pages.dev/*
  X-Robots-Tag: noindex
```

An incoming request which matches multiple rules' URL patterns will inherit all rules' headers. Using the previous `_headers` file, the following requests will have the following headers applied:

| Request URL | Headers |
| - | - |
| `https://custom.domain/secure/page` | `X-Frame-Options: DENY` `X-Content-Type-Options: nosniff` `Referrer-Policy: no-referrer` |
| `https://custom.domain/static/image.jpg` | `Access-Control-Allow-Origin: *` `X-Robots-Tag: nosnippet` |
| `https://myproject.pages.dev/home` | `X-Robots-Tag: noindex` |
| `https://myproject.pages.dev/secure/page` | `X-Frame-Options: DENY` `X-Content-Type-Options: nosniff` `Referrer-Policy: no-referrer` `X-Robots-Tag: noindex` |
| `https://myproject.pages.dev/static/styles.css` | `Access-Control-Allow-Origin: *` `X-Robots-Tag: nosnippet, noindex` |

You may define up to 100 header rules. Each line in the `_headers` file has a 2,000 character limit. The entire line, including spacing, header name, and value, counts towards this limit.

If a header is applied twice in the `_headers` file, the values are joined with a comma separator.

### Detach a header

You may wish to remove a default header or a header which has been added by a more pervasive rule. This can be done by prepending the header name with an exclamation mark and space (`! `).

```txt
/*
  Content-Security-Policy: default-src 'self';


/*.jpg
  ! Content-Security-Policy
```

### Match a path

The same URL matching features that [`_redirects`](https://developers.cloudflare.com/pages/configuration/redirects/) offers is also available to the `_headers` file. Note, however, that redirects are applied before headers, so when a request matches both a redirect and a header, the redirect takes priority.

#### Splats

When matching, a splat pattern — signified by an asterisk (`*`) — will greedily match all characters. You may only include a single splat in the URL.

The matched value can be referenced within the header value as the `:splat` placeholder.

#### Placeholders

A placeholder can be defined with `:placeholder_name`. A colon (`:`) followed by a letter indicates the start of a placeholder and the placeholder name that follows must be composed of alphanumeric characters and underscores (`:[A-Za-z]\w*`). Every named placeholder can only be referenced once. Placeholders match all characters apart from the delimiter, which when part of the host, is a period (`.`) or a forward-slash (`/`) and may only be a forward-slash (`/`) when part of the path.

Similarly, the matched value can be used in the header values with `:placeholder_name`.

```txt
/movies/:title
  x-movie-name: You are watching ":title"
```

#### Examples

##### Cross-Origin Resource Sharing (CORS)

To enable other domains to fetch every static asset from your Pages project, the following can be added to the `_headers` file:

```txt
/*
  Access-Control-Allow-Origin: *
```

This applies the \`Access-Control-Allow-Origin\` header to any incoming URL. To be more restrictive, you can define a URL pattern that applies to a `*.pages.dev` subdomain, which then only allows access from its `staging` branch's subdomain:

```txt
https://:project.pages.dev/*
  Access-Control-Allow-Origin: https://staging.:project.pages.dev/
```

##### Prevent your workers.dev URLs showing in search results

[Google](https://developers.google.com/search/docs/advanced/robots/robots_meta_tag#directives) and other search engines often support the `X-Robots-Tag` header to instruct its crawlers how your website should be indexed.

For example, to prevent your `\*.pages.dev` and `\*.\*.pages.dev` URLs from being indexed, add the following to your `_headers` file:

```txt
https://:project.pages.dev/*
  X-Robots-Tag: noindex


https://:version.:project.pages.dev/*
  X-Robots-Tag: noindex
```

##### Configure custom browser cache behavior

If you have a folder of fingerprinted assets (assets which have a hash in their filename), you can configure more aggressive caching behavior in the browser to improve performance for repeat visitors:

```txt
/static/*
  Cache-Control: public, max-age=31556952, immutable
```

##### Harden security for an application

Warning

If you are server-side rendering (SSR) or using Pages Functions to generate responses in any other way and wish to attach security headers, the headers should be sent from the Pages Functions' `Response` instead of using a `_headers` file. For example, if you have an API endpoint and want to allow cross-origin requests, you should ensure that your Worker code attaches CORS headers to its responses, including to `OPTIONS` requests.

You can prevent click-jacking by informing browsers not to embed your application inside another (for example, with an `<iframe>`) with a [`X-Frame-Options`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Frame-Options) header.

[`X-Content-Type-Options: nosniff`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Content-Type-Options) prevents browsers from interpreting a response as any other content-type than what is defined with the `Content-Type` header.

[`Referrer-Policy`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy) allows you to customize how much information visitors give about where they are coming from when they navigate away from your page.

Browser features can be disabled to varying degrees with the [`Permissions-Policy`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy) header (recently renamed from `Feature-Policy`).

If you need fine-grained control over your application's content, the [`Content-Security-Policy`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy) header allows you to configure a number of security settings, including similar controls to the `X-Frame-Options` header.

```txt
/app/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  Permissions-Policy: document-domain=()
  Content-Security-Policy: script-src 'self'; frame-ancestors 'none';
```

</page>

<page>
---
title: Monorepos · Cloudflare Pages docs
description: While some apps are built from a single repository, Pages also
  supports apps with more complex setups. A monorepo is a repository that has
  multiple subdirectories each containing its own application.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/configuration/monorepos/
  md: https://developers.cloudflare.com/pages/configuration/monorepos/index.md
---

While some apps are built from a single repository, Pages also supports apps with more complex setups. A monorepo is a repository that has multiple subdirectories each containing its own application.

## Set up

You can create multiple projects using the same repository, [in the same way that you would create any other Pages project](https://developers.cloudflare.com/pages/get-started/git-integration). You have the option to vary the build command and/or root directory of your project to tell Pages where you would like your build command to run. All project names must be unique even if connected to the same repository.

## Builds

When you connect a git repository to Pages, by default a change to any file in the repository will trigger a Pages build.

![Monorepo example diagram](https://developers.cloudflare.com/_astro/pages-path.D3Q_3sei_zjFlL.webp)

Take for example `my-monorepo` above with two associated Pages projects (`marketing-app` and `ecommerce-app`) and their listed dependencies. By default, if you change a file in the project directory for `marketing-app`, then a build for the `ecommerce-app` project will also be triggered, even though `ecommerce-app` and its dependencies have not changed. To avoid such duplicate builds, you can include and exclude both [build watch paths](https://developers.cloudflare.com/pages/configuration/build-watch-paths) or [branches](https://developers.cloudflare.com/pages/configuration/branch-build-controls) to specify if Pages should skip a build for a given project.

## Git integration

Once you've created a separate Pages project for each of the projects within your Git repository, each Git push will issue a new build and deployment for all connected projects unless specified in your build configuration.

GitHub will display separate comments for each project with the updated project and deployment URL if there is a Pull Request associated with the branch.

### GitHub check runs and GitLab commit statuses

If you have multiple projects associated with your repository, your [GitHub check run](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks#checks) or [Gitlab commit status](https://docs.gitlab.com/ee/user/project/merge_requests/status_checks.html) will appear like the following on your repository:

![GitHub check run](https://developers.cloudflare.com/_astro/ghcheckrun.Cv3SMhfT_2kRJYa.webp)![GitLab commit status](https://developers.cloudflare.com/_astro/glcommitstatus.BXV17OMM_bQMQW.webp)

If a build skips for any reason (i.e. CI Skip, build watch paths, or branch deployment controls), the check run/commit status will not appear.

## Monorepo management tools:

While Pages does not provide specialized tooling for dependency management in monorepos, you may choose to bring additional tooling to help manage your repository. For simple subpackage management, you can utilize tools like [npm](https://docs.npmjs.com/cli/v8/using-npm/workspaces), [pnpm](https://pnpm.io/workspaces), and [Yarn](https://yarnpkg.com/features/workspaces) workspaces. You can also use more powerful tools such as [Turborepo](https://turbo.build/repo/docs), [NX](https://nx.dev/getting-started/intro), or [Lerna](https://lerna.js.org/docs/getting-started) to additionally manage dependencies and task execution.

## Limitations

* You must be using [Build System V2](https://developers.cloudflare.com/pages/configuration/build-image/#v2-build-system) or later in order for monorepo support to be enabled.
* You can configure a maximum of 5 Pages projects per repository. If you need this limit raised, contact your Cloudflare account team or use the [Limit Increase Request Form](https://docs.google.com/forms/d/e/1FAIpQLSd_fwAVOboH9SlutMonzbhCxuuuOmiU1L_I5O2CFbXf_XXMRg/viewform).

</page>

<page>
---
title: Preview deployments · Cloudflare Pages docs
description: "Preview deployments allow you to preview new versions of your
  project without deploying it to production. To view preview deployments:"
lastUpdated: 2025-10-22T21:11:06.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/configuration/preview-deployments/
  md: https://developers.cloudflare.com/pages/configuration/preview-deployments/index.md
---

Preview deployments allow you to preview new versions of your project without deploying it to production. To view preview deployments:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your project and find the deployment you would like to view.

Every time you open a new pull request on your GitHub repository, Cloudflare Pages will create a unique preview URL, which will stay updated as you continue to push new commits to the branch. This is only true when pull requests originate from the repository itself.

![GitHub Preview URLs](https://developers.cloudflare.com/_astro/ghpreviewurls.DuZwczMZ_18Cm2.webp)

For example, if you have a repository called `user-example` connected to Pages, this will give you a `user-example.pages.dev` subdomain. If `main` is your default branch, then any commits to the `main` branch will update your `user-example.pages.dev` content, as well as any [custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/) attached to the project.

![User-example repository's deployment status and preview](https://developers.cloudflare.com/_astro/preview-deployment-mergedone.CyZvkVv1_1lgtKi.webp)

While developing `user-example`, you may push new changes to a `development` branch, for example.

In this example, after you create the new `development` branch, Pages will automatically generate a preview deployment for these changes available at `373f31e2.user-example.pages.dev` - where `373f31e2` is a randomly generated hash.

Each new branch you create will receive a new, randomly-generated hash in front of your `pages.dev` subdomain.

![User-example repository's newly generated preview deployment link and status](https://developers.cloudflare.com/_astro/preview-deployment-generated.CslHDdSO_24Lj7F.webp)

Any additional changes to the `development` branch will continue to update this `373f31e2.user-example.pages.dev` preview address until the `development` branch is merged with the `main` production branch.

Any custom domains, as well as your `user-example.pages.dev` site, will not be affected by preview deployments.

## Customize preview deployments access

You can use [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/) to manage access to your deployment previews. By default, these deployment URLs are public. Enabling the access policy will restrict viewing project deployments to your Cloudflare account.

Once enabled, you can [set up a multi-user account](https://developers.cloudflare.com/fundamentals/manage-members/) to allow other members of your team to view preview deployments.

By default, preview deployments are enabled and available publicly. In your project's settings, you can require visitors to authenticate to view preview deployment. This allows you to lock down access to these preview deployments to your teammates, organization, or anyone else you specify via [Access policies](https://developers.cloudflare.com/cloudflare-one/traffic-policies/).

To protect your preview deployments behind Cloudflare Access:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project.

3. Go to **Settings** > **General** > and select **Enable access policy**.

Note that this will only protect your preview deployments (for example, `373f31e2.user-example.pages.dev` and every other randomly generated preview link) and not your `*.pages.dev` domain or custom domain.

Note

If you want to enable Access for your `*.pages.dev` domain and your custom domain along with your preview deployments, review [Known issues](https://developers.cloudflare.com/pages/platform/known-issues/#enable-access-on-your-pagesdev-domain) for instructions.

## Preview aliases

When a preview deployment is published, it is given a unique, hash-based address — for example, `<hash>.<project>.pages.dev`. These are atomic and may always be visited in the future. However, Pages also creates an alias for `git` branch's name and updates it so that the alias always maps to the latest commit of that branch.

For example, if you push changes to a `development` branch (which is not associated with your Production environment), then Pages will deploy to `abc123.<project>.pages.dev` and alias `development.<project>.pages.dev` to it. Later, you may push new work to the `development` branch, which creates the `xyz456.<project>.pages.dev` deployment. At this point, the `development.<project>.pages.dev` alias points to the `xyz456` deployment, but `abc123.<project>.pages.dev` remains accessible directly.

Branch name aliases are lowercased and non-alphanumeric characters are replaced with a hyphen — for example, the `fix/api` branch creates the `fix-api.<project>.pages.dev` alias.

To view branch aliases within your Pages project, select **View build** for any preview deployment. **Deployment details** will display all aliases associated with that deployment.

You can attach a Preview alias to a custom domain by [adding a custom domain to a branch](https://developers.cloudflare.com/pages/how-to/custom-branch-aliases/).

## Preview indexing by search engines

To maintain a healthy SEO profile, it's vital to prevent search engines from finding duplicate content across the web. Because preview deployments are designed to be an exact replica of your production environment, they inherently create this exact situation. Cloudflare Pages by default ensures your search rankings are not harmed by these temporary previews.

### X-Robots-Tag: noindex on Preview Deployments

By default, every preview deployment generated by Cloudflare Pages includes the X-Robots-Tag: noindex HTTP response header. This header acts as a clear directive to search engine crawlers, instructing them to disregard the page and not include it in their search results.

You can easily confirm that your preview deployments are correctly configured to block indexing. Run the following curl command in your terminal, replacing the placeholder with your unique preview URL:

```plaintext
curl -I https://<your-preview-url>.pages.dev
```

Inspect the output for the x-robots-tag: noindex line to verify that your preview site is not being indexed.

</page>

<page>
---
title: Redirects · Cloudflare Pages docs
description: To apply custom redirects on Cloudflare Pages, declare your
  redirects in a plain text file called _redirects without a file extension, in
  the static asset directory of your project. This file will not itself be
  served as a static asset, but will instead be parsed by Cloudflare Pages and
  its rules will be applied to static asset responses.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/configuration/redirects/
  md: https://developers.cloudflare.com/pages/configuration/redirects/index.md
---

To apply custom redirects on Cloudflare Pages, declare your redirects in a plain text file called `_redirects` without a file extension, in the static asset directory of your project. This file will not itself be served as a static asset, but will instead be parsed by Cloudflare Pages and its rules will be applied to static asset responses.

If you are using a framework, you will often have a directory named `public/` or `static/`, and this usually contains deploy-ready assets, such as favicons, `robots.txt` files, and site manifests. These files get copied over to a final output directory during the build, so this is the perfect place to author your `_redirects` file. If you are not using a framework, the `_redirects` file can go directly into your [build output directory](https://developers.cloudflare.com/pages/configuration/build-configuration/).

Warning

Redirects defined in the `_redirects` file are not applied to requests served by [Pages Functions](https://developers.cloudflare.com/pages/functions/), even if the Function route matches the URL pattern. If your Pages application uses Functions, you must migrate any behaviors from the `_redirects` file to the code in the appropriate `/functions` route, or [exclude the route from Functions](https://developers.cloudflare.com/pages/functions/routing/#create-a-_routesjson-file).

## Structure

### Per line

Only one redirect can be defined per line and must follow this format, otherwise it will be ignored.

```txt
[source] [destination] [code?]
```

* `source` string required

  * A file path.
  * Can include [wildcards (`*`)](#splats) and [placeholders](#placeholders).
  * Because fragments are evaluated by your browser and not Cloudflare's network, any fragments in the source are not evaluated.

* `destination` string required

  * A file path or external link.
  * Can include fragments, query strings, [splats](#splats), and [placeholders](#placeholders).

* `code` number (default: 302) optional

  * Optional parameter

Lines starting with a `#` will be treated as comments.

### Per file

A `_redirects` file is limited to 2,000 static redirects and 100 dynamic redirects, for a combined total of 2,100 redirects. Each redirect declaration has a 1,000-character limit.

In your `_redirects` file:

* The order of your redirects matter. If there are multiple redirects for the same `source` path, the top-most redirect is applied.
* Static redirects should appear before dynamic redirects.
* Redirects are always followed, regardless of whether or not an asset matches the incoming request.

A complete example with multiple redirects may look like the following:

```txt
/home301 / 301
/home302 / 302
/querystrings /?query=string 301
/twitch https://twitch.tv
/trailing /trailing/ 301
/notrailing/ /nottrailing 301
/page/ /page2/#fragment 301
/blog/* https://blog.my.domain/:splat
/products/:code/:name /products?code=:code&name=:name
```

## Advanced redirects

Cloudflare currently offers limited support for advanced redirects.

| Feature | Support | Example | Notes |
| - | - | - | - |
| Redirects (301, 302, 303, 307, 308) | ✅ | `/home / 301` | 302 is used as the default status code. |
| Rewrites (other status codes) | ❌ | `/blog/* /blog/404.html 404` | |
| Splats | ✅ | `/blog/* /posts/:splat` | Refer to [Splats](#splats). |
| Placeholders | ✅ | `/blog/:year/:month/:date/:slug /news/:year/:month/:date/:slug` | Refer to [Placeholders](#placeholders). |
| Query Parameters | ❌ | `/shop id=:id /blog/:id 301` | |
| Proxying | ✅ | `/blog/* /news/:splat 200` | Refer to [Proxying](#proxying). |
| Domain-level redirects | ❌ | `workers.example.com/* workers.example.com/blog/:splat 301` | |
| Redirect by country or language | ❌ | `/ /us 302 Country=us` | |
| Redirect by cookie | ❌ | `/\* /preview/:splat 302 Cookie=preview` | |

## Redirects and header matching

Redirects execute before headers, so in the case of a request matching rules in both files, the redirect will win out.

### Splats

On matching, a splat (asterisk, `*`) will greedily match all characters. You may only include a single splat in the URL.

The matched value can be used in the redirect location with `:splat`.

### Placeholders

A placeholder can be defined with `:placeholder_name`. A colon (`:`) followed by a letter indicates the start of a placeholder and the placeholder name that follows must be composed of alphanumeric characters and underscores (`:[A-Za-z]\w*`). Every named placeholder can only be referenced once. Placeholders match all characters apart from the delimiter, which when part of the host, is a period (`.`) or a forward-slash (`/`) and may only be a forward-slash (`/`) when part of the path.

Similarly, the matched value can be used in the redirect values with `:placeholder_name`.

```txt
/movies/:title /media/:title
```

### Proxying

Proxying will only support relative URLs on your site. You cannot proxy external domains.

Only the first redirect in your file will apply. For example, in the following example, a request to `/a` will render `/b`, and a request to `/b` will render `/c`, but `/a` will not render `/c`.

```plaintext
/a /b 200
/b /c 200
```

Note

Be aware that proxying pages can have an adverse effect on search engine optimization (SEO). Search engines often penalize websites that serve duplicate content. Consider adding a `Link` HTTP header which informs search engines of the canonical source of content.

For example, if you have added `/about/faq/* /about/faqs 200` to your `_redirects` file, you may want to add the following to your `_headers` file:

```txt
/about/faq/*
  Link: </about/faqs>; rel="canonical"
```

## Surpass `_redirects` limits

A [`_redirects`](https://developers.cloudflare.com/pages/platform/limits/#redirects) file has a maximum of 2,000 static redirects and 100 dynamic redirects, for a combined total of 2,100 redirects. Use [Bulk Redirects](https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/) to handle redirects that surpasses the 2,100 redirect rules limit of `_redirects`.

Note

The redirects defined in the `_redirects` file of your build folder can work together with your Bulk Redirects. In case of duplicates, Bulk Redirects will run in front of your Pages project, where your other redirects live.

For example, if you have Bulk Redirects set up to direct `abc.com` to `xyz.com` but also have `_redirects` set up to direct `xyz.com` to `foo.com`, a request for `abc.com` will eventually redirect to `foo.com`.

To use Bulk Redirects, refer to the [Bulk Redirects dashboard documentation](https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/create-dashboard/) or the [Bulk Redirects API documentation](https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/create-api/).

## Related resources

* [Transform Rules](https://developers.cloudflare.com/rules/transform/)

</page>

<page>
---
title: Rollbacks · Cloudflare Pages docs
description: Rollbacks allow you to instantly revert your project to a previous
  production deployment.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/configuration/rollbacks/
  md: https://developers.cloudflare.com/pages/configuration/rollbacks/index.md
---

Rollbacks allow you to instantly revert your project to a previous production deployment.

Any production deployment that has been successfully built is a valid rollback target. When your project has rolled back to a previous deployment, you may still rollback to deployments that are newer than your current version. Note that preview deployments are not valid rollback targets.

In order to perform a rollback, go to **Deployments** in your Pages project. Browse the **All deployments** list and select the three dotted actions menu for the desired target. Select **Rollback to this deployment** for a confirmation window to appear. When confirmed, your project's production deployment will change instantly.

![Deployments for your Pages project that can be used for rollbacks](https://developers.cloudflare.com/_astro/rollbacks.DNHeRPOm_ZSEvgH.webp)

## Related resources

* [Preview Deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
* [Branch deployment controls](https://developers.cloudflare.com/pages/configuration/branch-build-controls/)

</page>

<page>
---
title: Serving Pages · Cloudflare Pages docs
description: Cloudflare Pages includes a number of defaults for serving your
  Pages sites. This page details some of those decisions, so you can understand
  how Pages works, and how you might want to override some of the default
  behaviors.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/configuration/serving-pages/
  md: https://developers.cloudflare.com/pages/configuration/serving-pages/index.md
---

Cloudflare Pages includes a number of defaults for serving your Pages sites. This page details some of those decisions, so you can understand how Pages works, and how you might want to override some of the default behaviors.

## Route matching

If an HTML file is found with a matching path to the current route requested, Pages will serve it. Pages will also redirect HTML pages to their extension-less counterparts: for instance, `/contact.html` will be redirected to `/contact`, and `/about/index.html` will be redirected to `/about/`.

## Not Found behavior

You can define a custom page to be displayed when Pages cannot find a requested file by creating a `404.html` file. Pages will then attempt to find the closest 404 page. If one is not found in the same directory as the route you are currently requesting, it will continue to look up the directory tree for a matching `404.html` file, ending in `/404.html`. This means that you can define custom 404 paths for situations like `/blog/404.html` and `/404.html`, and Pages will automatically render the correct one depending on the situation.

## Single-page application (SPA) rendering

If your project does not include a top-level `404.html` file, Pages assumes that you are deploying a single-page application. This includes frameworks like React, Vue, and Angular. Pages' default single-page application behavior matches all incoming paths to the root (`/`), allowing you to capture URLs like `/about` or `/help` and respond to them from within your SPA.

## Caching and performance

### Recommendations

In most situations, you should avoid setting up any custom caching on your site. Pages comes with built in caching defaults that are optimized for caching as much as possible, while providing the most up to date content. Every time you deploy an asset to Pages, the asset remains cached on the Cloudflare CDN until your next deployment.

Therefore, if you add caching to your [custom domain](https://developers.cloudflare.com/pages/configuration/custom-domains/), it may lead to stale assets being served after a deployment.

In addition, adding caching to your custom domain may cause issues with [Pages redirects](https://developers.cloudflare.com/pages/configuration/redirects/) or [Pages functions](https://developers.cloudflare.com/pages/functions/). These issues can occur because the cached response might get served to your end user before Pages can act on the request.

However, there are some situations where [Cache Rules](https://developers.cloudflare.com/cache/how-to/cache-rules/) on your custom domain does make sense. For example, you may have easily cacheable locations for immutable assets, such as CSS or JS files with content hashes in their file names. Custom caching can help in this case, speeding up the user experience until the file (and associated filename) changes. Just make sure that your caching does not interfere with any redirects or Functions.

Note that when you use Cloudflare Pages, the static assets that you upload as part of your Pages project are automatically served from [Tiered Cache](https://developers.cloudflare.com/cache/how-to/tiered-cache/). You do not need to separately enable Tiered Cache for the custom domain that your Pages project runs on.

Purging the cache

If you notice stale assets being served after a new deployment, go to your zone and then **Caching** > **Configuration** > [**Purge Everything**](https://developers.cloudflare.com/cache/how-to/purge-cache/purge-everything/) to ensure the latest deployment gets served.

### Behavior

For browser caching, Pages always sends `Etag` headers for `200 OK` responses, which the browser then returns in an `If-None-Match` header on subsequent requests for that asset. Pages compares the `If-None-Match` header from the request with the `Etag` it's planning to send, and if they match, Pages instead responds with a `304 Not Modified` that tells the browser it's safe to use what is stored in local cache.

Pages currently returns `200` responses for HTTP range requests; however, the team is working on adding spec-compliant `206` partial responses.

Pages will also serve Gzip and Brotli responses whenever possible.

## Asset retention

We will insert assets into the cache on a per-data center basis. Assets have a time-to-live (TTL) of one week but can also disappear at any time. If you do a new deploy, the assets could exist in that data center up to one week.

## Headers

By default, Pages automatically adds several [HTTP response headers](https://developer.mozilla.org/en-US/docs/Glossary/Response_header) when serving assets, including:

```txt
Access-Control-Allow-Origin: *
Cf-Ray: $CLOUDFLARE_RAY_ID
Referrer-Policy: strict-origin-when-cross-origin
Etag: $ETAG
Content-Type: $CONTENT_TYPE
X-Content-Type-Options: nosniff
Server: cloudflare
```

Note

The [`Cf-Ray`](https://developers.cloudflare.com/fundamentals/reference/cloudflare-ray-id/) header is unique to Cloudflare.

```txt
// if the asset has been encoded
Cache-Control: no-transform
Content-Encoding: $CONTENT_ENCODING


// if the asset is cacheable (the request does not have an `Authorization` or `Range` header)
Cache-Control: public, max-age=0, must-revalidate


// if requesting the asset over a preview URL
X-Robots-Tag: noindex
```

To modify the headers added by Cloudflare Pages - perhaps to add [Early Hints](https://developers.cloudflare.com/pages/configuration/early-hints/) - update the [\_headers file](https://developers.cloudflare.com/pages/configuration/headers/) in your project.

</page>

<page>
---
title: Advanced mode · Cloudflare Pages docs
description: Advanced mode allows you to develop your Pages Functions with a
  _worker.js file rather than the /functions directory.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/functions/advanced-mode/
  md: https://developers.cloudflare.com/pages/functions/advanced-mode/index.md
---

Advanced mode allows you to develop your Pages Functions with a `_worker.js` file rather than the `/functions` directory.

In some cases, Pages Functions' built-in file path based routing and middleware system is not desirable for existing applications. You may have a Worker that is complex and difficult to splice up into Pages' file-based routing system. For these cases, Pages offers the ability to define a `_worker.js` file in the output directory of your Pages project.

When using a `_worker.js` file, the entire `/functions` directory is ignored, including its routing and middleware characteristics. Instead, the `_worker.js` file is deployed and must be written using the [Module Worker syntax](https://developers.cloudflare.com/workers/runtime-apis/handlers/fetch/). If you have never used Module syntax, refer to the [JavaScript modules blog post](https://blog.cloudflare.com/workers-javascript-modules/) to learn more. Using Module syntax enables JavaScript frameworks to generate a Worker as part of the Pages output directory contents.

## Set up a Function

In advanced mode, your Function will assume full control of all incoming HTTP requests to your domain. Your Function is required to make or forward requests to your project's static assets. Failure to do so will result in broken or unwanted behavior. Your Function must be written in Module syntax.

After making a `_worker.js` file in your output directory, add the following code snippet:

* JavaScript

  ```js
  export default {
    async fetch(request, env) {
      const url = new URL(request.url);
      if (url.pathname.startsWith("/api/")) {
        // TODO: Add your custom /api/* logic here.
        return new Response("Ok");
      }
      // Otherwise, serve the static assets.
      // Without this, the Worker will error and no assets will be served.
      return env.ASSETS.fetch(request);
    },
  };
  ```

* TypeScript

  ```ts
  // Note: You would need to compile your TS into JS and output it as a `_worker.js` file. We do not read `_worker.ts`


  interface Env {
    ASSETS: Fetcher;
  }


  export default {
    async fetch(request, env): Promise<Response> {
      const url = new URL(request.url);
      if (url.pathname.startsWith("/api/")) {
        // TODO: Add your custom /api/* logic here.
        return new Response("Ok");
      }
      // Otherwise, serve the static assets.
      // Without this, the Worker will error and no assets will be served.
      return env.ASSETS.fetch(request);
    },
  } satisfies ExportedHandler<Env>;
  ```

In the above code, you have configured your Function to return a response under all requests headed for `/api/`. Otherwise, your Function will fallback to returning static assets.

* The `env.ASSETS.fetch()` function will allow you to return assets on a given request.
* `env` is the object that contains your environment variables and bindings.
* `ASSETS` is a default Function binding that allows communication between your Function and Pages' asset serving resource.
* `fetch()` calls to Pages' asset-serving resource and serves the requested asset.

## Migrate from Workers

To migrate an existing Worker to your Pages project, copy your Worker code and paste it into your new `_worker.js` file. Then handle static assets by adding the following code snippet to `_worker.js`:

```ts
return env.ASSETS.fetch(request);
```

## Deploy your Function

After you have set up a new Function or migrated your Worker to `_worker.js`, make sure your `_worker.js` file is placed in your Pages' project output directory. Deploy your project through your Git integration for advanced mode to take effect.

</page>

<page>
---
title: API reference · Cloudflare Pages docs
description: Learn about the APIs used within Pages Functions.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/functions/api-reference/
  md: https://developers.cloudflare.com/pages/functions/api-reference/index.md
---

The following methods can be used to configure your Pages Function.

## Methods

### `onRequests`

The `onRequest` method will be called unless a more specific `onRequestVerb` method is exported. For example, if both `onRequest` and `onRequestGet` are exported, only `onRequestGet` will be called for `GET` requests.

* `onRequest(contextEventContext)` Response | Promise\<Response>

  * This function will be invoked on all requests no matter what the request method is, as long as no specific request verb (like one of the methods below) is exported.

* `onRequestGet(contextEventContext)` Response | Promise\<Response>

  * This function will be invoked on all `GET` requests.

* `onRequestPost(contextEventContext)` Response | Promise\<Response>

  * This function will be invoked on all `POST` requests.

* `onRequestPatch(contextEventContext)` Response | Promise\<Response>

  * This function will be invoked on all `PATCH` requests.

* `onRequestPut(contextEventContext)` Response | Promise\<Response>

  * This function will be invoked on all `PUT` requests.

* `onRequestDelete(contextEventContext)` Response | Promise\<Response>

  * This function will be invoked on all `DELETE` requests.

* `onRequestHead(contextEventContext)` Response | Promise\<Response>

  * This function will be invoked on all `HEAD` requests.

* `onRequestOptions(contextEventContext)` Response | Promise\<Response>

  * This function will be invoked on all `OPTIONS` requests.

### `env.ASSETS.fetch()`

The `env.ASSETS.fetch()` function allows you to fetch a static asset from your Pages project.

You can pass a [Request object](https://developers.cloudflare.com/workers/runtime-apis/request/), URL string, or URL object to `env.ASSETS.fetch()` function. The URL must be to the pretty path, not directly to the asset. For example, if you had the path `/users/index.html`, you will request `/users/` instead of `/users/index.html`. This method call will run the header and redirect rules, modifying the response that is returned.

## Types

### `EventContext`

The following are the properties on the `context` object which are passed through on the `onRequest` methods:

* `request` [Request](https://developers.cloudflare.com/workers/runtime-apis/request/)

  This is the incoming [Request](https://developers.cloudflare.com/workers/runtime-apis/request/).

* `functionPath` string

  This is the path of the request.

* `waitUntil(promisePromise<any>)` void

  Refer to [`waitUntil` documentation](https://developers.cloudflare.com/workers/runtime-apis/context/#waituntil) for more information.

* `passThroughOnException()` void

  Refer to [`passThroughOnException` documentation](https://developers.cloudflare.com/workers/runtime-apis/context/#passthroughonexception) for more information. Note that this will not work on an [advanced mode project](https://developers.cloudflare.com/pages/functions/advanced-mode/).

* `next(input?Request | string, init?RequestInit)` Promise\<Response>

  Passes the request through to the next Function or to the asset server if no other Function is available.

* `env` [EnvWithFetch](#envwithfetch)

* `params` Params\<P>

  Holds the values from [dynamic routing](https://developers.cloudflare.com/pages/functions/routing/#dynamic-routes).

  In the following example, you have a dynamic path that is `/users/[user].js`. When you visit the site on `/users/nevi` the `params` object would look like:

  ```js
  {
    user: "nevi";
  }
  ```

  This allows you fetch the dynamic value from the path:

  ```js
  export function onRequest(context) {
    return new Response(`Hello ${context.params.user}`);
  }
  ```

  Which would return `"Hello nevi"`.

* `data` Data

### `EnvWithFetch`

Holds the environment variables, secrets, and bindings for a Function. This also holds the `ASSETS` binding which is how you can fallback to the asset-serving behavior.

</page>

<page>
---
title: Bindings · Cloudflare Pages docs
description: A binding enables your Pages Functions to interact with resources
  on the Cloudflare developer platform. Use bindings to integrate your Pages
  Functions with Cloudflare resources like KV, Durable Objects, R2, and D1. You
  can set bindings for both production and preview environments.
lastUpdated: 2026-02-02T18:38:11.000Z
chatbotDeprioritize: false
tags: Bindings
source_url:
  html: https://developers.cloudflare.com/pages/functions/bindings/
  md: https://developers.cloudflare.com/pages/functions/bindings/index.md
---

A [binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/) enables your Pages Functions to interact with resources on the Cloudflare developer platform. Use bindings to integrate your Pages Functions with Cloudflare resources like [KV](https://developers.cloudflare.com/kv/concepts/how-kv-works/), [Durable Objects](https://developers.cloudflare.com/durable-objects/), [R2](https://developers.cloudflare.com/r2/), and [D1](https://developers.cloudflare.com/d1/). You can set bindings for both production and preview environments.

This guide will instruct you on configuring a binding for your Pages Function. You must already have a Cloudflare Developer Platform resource set up to continue.

Note

Pages Functions only support a subset of all [bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/), which are listed on this page.

## KV namespaces

[Workers KV](https://developers.cloudflare.com/kv/concepts/kv-namespaces/) is Cloudflare's key-value storage solution.

To bind your KV namespace to your Pages Function, you can configure a KV namespace binding in the [Wrangler configuration file](https://developers.cloudflare.com/pages/functions/wrangler-configuration/#kv-namespaces) or the Cloudflare dashboard.

To configure a KV namespace binding via the Cloudflare dashboard:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project.

3. Go to **Settings** > **Bindings** > **Add** > **KV namespace**.

4. Give your binding a name under **Variable name**.

5. Under **KV namespace**, select your desired namespace.

6. Redeploy your project for the binding to take effect.

Below is an example of how to use KV in your Function. In the following example, your KV namespace binding is called `TODO_LIST` and you can access the binding in your Function code on `context.env`:

* JavaScript

  ```js
  export async function onRequest(context) {
    const task = await context.env.TODO_LIST.get("Task:123");
    return new Response(task);
  }
  ```

* TypeScript

  ```ts
  interface Env {
    TODO_LIST: KVNamespace;
  }


  export const onRequest: PagesFunction<Env> = async (context) => {
    const task = await context.env.TODO_LIST.get("Task:123");
    return new Response(task);
  };
  ```

### Interact with your KV namespaces locally

You can interact with your KV namespace bindings locally in one of two ways:

* Configure your Pages project's Wrangler file and run [`npx wrangler pages dev`](https://developers.cloudflare.com/workers/wrangler/commands/#dev-1).
* Pass arguments to `wrangler pages dev` directly.

To interact with your KV namespace binding locally by passing arguments to the Wrangler CLI, add `-k <BINDING_NAME>` or `--kv=<BINDING_NAME>` to the `wrangler pages dev` command. For example, if your KV namespace is bound your Function via the `TODO_LIST` binding, access the KV namespace in local development by running:

```sh
npx wrangler pages dev <OUTPUT_DIR> --kv=TODO_LIST
```

Note

If a binding is specified in a [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) and via a command-line argument, the command-line argument takes precedence.

## Durable Objects

[Durable Objects](https://developers.cloudflare.com/durable-objects/) (DO) are Cloudflare's strongly consistent data store that power capabilities such as connecting WebSockets and handling state.

You must create a Durable Object Worker and bind it to your Pages project using the Cloudflare dashboard or your Pages project's [Wrangler configuration file](https://developers.cloudflare.com/pages/functions/wrangler-configuration/). You cannot create and deploy a Durable Object within a Pages project.

To bind your Durable Object to your Pages Function, you can configure a Durable Object binding in the [Wrangler configuration file](https://developers.cloudflare.com/pages/functions/wrangler-configuration/#kv-namespaces) or the Cloudflare dashboard.

To configure a Durable Object binding via the Cloudflare dashboard:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project.

3. Go to **Settings** > **Bindings** > **Add** > **Durable Object**.

4. Give your binding a name under **Variable name**.

5. Under **Durable Object namespace**, select your desired namespace.

6. Redeploy your project for the binding to take effect.

Below is an example of how to use Durable Objects in your Function. In the following example, your DO binding is called `DURABLE_OBJECT` and you can access the binding in your Function code on `context.env`:

* JavaScript

  ```js
  export async function onRequestGet(context) {
    const id = context.env.DURABLE_OBJECT.newUniqueId();
    const stub = context.env.DURABLE_OBJECT.get(id);


    // Pass the request down to the durable object
    return stub.fetch(context.request);
  }
  ```

* TypeScript

  ```ts
  interface Env {
    DURABLE_OBJECT: DurableObjectNamespace;
  }


  export const onRequestGet: PagesFunction<Env> = async (context) => {
    const id = context.env.DURABLE_OBJECT.newUniqueId();
    const stub = context.env.DURABLE_OBJECT.get(id);


    // Pass the request down to the durable object
    return stub.fetch(context.request);
  };
  ```

### Interact with your Durable Object namespaces locally

You can interact with your Durable Object bindings locally in one of two ways:

* Configure your Pages project's Wrangler file and run [`npx wrangler pages dev`](https://developers.cloudflare.com/workers/wrangler/commands/#dev-1).
* Pass arguments to `wrangler pages dev` directly.

While developing locally, to interact with a Durable Object namespace, run `wrangler dev` in the directory of the Worker exporting the Durable Object. In another terminal, run `wrangler pages dev` in the directory of your Pages project.

To interact with your Durable Object namespace locally via the Wrangler CLI, append `--do <BINDING_NAME>=<CLASS_NAME>@<SCRIPT_NAME>` to `wrangler pages dev`. `CLASS_NAME` indicates the Durable Object class name and `SCRIPT_NAME` the name of your Worker.

For example, if your Worker is called `do-worker` and it declares a Durable Object class called `DurableObjectExample`, access this Durable Object by running `npx wrangler dev` in the `do-worker` directory. At the same time, run `npx wrangler pages dev <OUTPUT_DIR> --do MY_DO=DurableObjectExample@do-worker` in your Pages' project directory. Interact with the `MY_DO` binding in your Function code by using `context.env` (for example, `context.env.MY_DO`).

Note

If a binding is specified in a [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) and via a command-line argument, the command-line argument takes precedence.

## R2 buckets

[R2](https://developers.cloudflare.com/r2/) is Cloudflare's blob storage solution that allows developers to store large amounts of unstructured data without the egress fees.

To bind your R2 bucket to your Pages Function, you can configure a R2 bucket binding in the [Wrangler configuration file](https://developers.cloudflare.com/pages/functions/wrangler-configuration/#r2-buckets) or the Cloudflare dashboard.

To configure a R2 bucket binding via the Cloudflare dashboard:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project.

3. Go to **Settings** > **Bindings** > **Add** > **R2 bucket**.

4. Give your binding a name under **Variable name**.

5. Under **R2 bucket**, select your desired R2 bucket.

6. Redeploy your project for the binding to take effect.

Below is an example of how to use R2 buckets in your Function. In the following example, your R2 bucket binding is called `BUCKET` and you can access the binding in your Function code on `context.env`:

* JavaScript

  ```js
  export async function onRequest(context) {
    const obj = await context.env.BUCKET.get("some-key");
    if (obj === null) {
      return new Response("Not found", { status: 404 });
    }
    return new Response(obj.body);
  }
  ```

* TypeScript

  ```ts
  interface Env {
    BUCKET: R2Bucket;
  }


  export const onRequest: PagesFunction<Env> = async (context) => {
    const obj = await context.env.BUCKET.get("some-key");
    if (obj === null) {
      return new Response("Not found", { status: 404 });
    }
    return new Response(obj.body);
  };
  ```

### Interact with your R2 buckets locally

You can interact with your R2 bucket bindings locally in one of two ways:

* Configure your Pages project's Wrangler file and run [`npx wrangler pages dev`](https://developers.cloudflare.com/workers/wrangler/commands/#dev-1).
* Pass arguments to `wrangler pages dev` directly.

Note

By default, Wrangler automatically persists data to local storage. For more information, refer to [Local development](https://developers.cloudflare.com/workers/development-testing/).

To interact with an R2 bucket locally via the Wrangler CLI, add `--r2=<BINDING_NAME>` to the `wrangler pages dev` command. If your R2 bucket is bound to your Function with the `BUCKET` binding, access this R2 bucket in local development by running:

```sh
npx wrangler pages dev <OUTPUT_DIR> --r2=BUCKET
```

Interact with this binding by using `context.env` (for example, `context.env.BUCKET`.)

Note

If a binding is specified in a [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) and via a command-line argument, the command-line argument takes precedence.

## D1 databases

[D1](https://developers.cloudflare.com/d1/) is Cloudflare's native serverless database.

To bind your D1 database to your Pages Function, you can configure a D1 database binding in the [Wrangler configuration file](https://developers.cloudflare.com/pages/functions/wrangler-configuration/#d1-databases) or the Cloudflare dashboard.

To configure a D1 database binding via the Cloudflare dashboard:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project.

3. Go to **Settings** > **Bindings** > **Add**> **D1 database bindings**.

4. Give your binding a name under **Variable name**.

5. Under **D1 database**, select your desired D1 database.

6. Redeploy your project for the binding to take effect.

Below is an example of how to use D1 in your Function. In the following example, your D1 database binding is `NORTHWIND_DB` and you can access the binding in your Function code on `context.env`:

* JavaScript

  ```js
  export async function onRequest(context) {
    // Create a prepared statement with our query
    const ps = context.env.NORTHWIND_DB.prepare("SELECT * from users");
    const data = await ps.first();


    return Response.json(data);
  }
  ```

* TypeScript

  ```ts
  interface Env {
    NORTHWIND_DB: D1Database;
  }


  export const onRequest: PagesFunction<Env> = async (context) => {
    // Create a prepared statement with our query
    const ps = context.env.NORTHWIND_DB.prepare("SELECT * from users");
    const data = await ps.first();


    return Response.json(data);
  };
  ```

### Interact with your D1 databases locally

You can interact with your D1 database bindings locally in one of two ways:

* Configure your Pages project's Wrangler file and run [`npx wrangler pages dev`](https://developers.cloudflare.com/workers/wrangler/commands/#dev-1).
* Pass arguments to `wrangler pages dev` directly.

To interact with a D1 database via the Wrangler CLI while [developing locally](https://developers.cloudflare.com/d1/best-practices/local-development/#develop-locally-with-pages), add `--d1 <BINDING_NAME>=<DATABASE_ID>` to the `wrangler pages dev` command.

If your D1 database is bound to your Pages Function via the `NORTHWIND_DB` binding and the `database_id` in your Wrangler file is `xxxx-xxxx-xxxx-xxxx-xxxx`, access this database in local development by running:

```sh
npx wrangler pages dev <OUTPUT_DIR> --d1 NORTHWIND_DB=xxxx-xxxx-xxxx-xxxx-xxxx
```

Interact with this binding by using `context.env` (for example, `context.env.NORTHWIND_DB`.)

Note

By default, Wrangler automatically persists data to local storage. For more information, refer to [Local development](https://developers.cloudflare.com/workers/development-testing/).

Refer to the [D1 Workers Binding API documentation](https://developers.cloudflare.com/d1/worker-api/) for the API methods available on your D1 binding.

Note

If a binding is specified in a [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) and via a command-line argument, the command-line argument takes precedence.

## Vectorize indexes

[Vectorize](https://developers.cloudflare.com/vectorize/) is Cloudflare’s native vector database.

To bind your Vectorize index to your Pages Function, you can configure a Vectorize index binding in the [Wrangler configuration file](https://developers.cloudflare.com/pages/functions/wrangler-configuration/#vectorize-indexes) or the Cloudflare dashboard.

To configure a Vectorize index binding via the Cloudflare dashboard:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Choose whether you would like to set up the binding in your **Production** or **Preview** environment.

3. Select your Pages project > **Settings**.

4. Go to **Bindings** > **Add** > **Vectorize index**.

5. Give your binding a name under **Variable name**.

6. Under **Vectorize index**, select your desired Vectorize index.

7. Redeploy your project for the binding to take effect.

### Use Vectorize index bindings

To use Vectorize index in your Pages Function, you can access your Vectorize index binding in your Pages Function code. In the following example, your Vectorize index binding is called `VECTORIZE_INDEX` and you can access the binding in your Pages Function code on `context.env`.

* JavaScript

  ```js
  // Sample vectors: 3 dimensions wide.
  //
  // Vectors from a machine-learning model are typically ~100 to 1536 dimensions
  // wide (or wider still).
  const sampleVectors = [
    {
      id: "1",
      values: [32.4, 74.1, 3.2],
      metadata: { url: "/products/sku/13913913" },
    },
    {
      id: "2",
      values: [15.1, 19.2, 15.8],
      metadata: { url: "/products/sku/10148191" },
    },
    {
      id: "3",
      values: [0.16, 1.2, 3.8],
      metadata: { url: "/products/sku/97913813" },
    },
    {
      id: "4",
      values: [75.1, 67.1, 29.9],
      metadata: { url: "/products/sku/418313" },
    },
    {
      id: "5",
      values: [58.8, 6.7, 3.4],
      metadata: { url: "/products/sku/55519183" },
    },
  ];


  export async function onRequest(context) {
    let path = new URL(context.request.url).pathname;
    if (path.startsWith("/favicon")) {
      return new Response("", { status: 404 });
    }


    // You only need to insert vectors into your index once
    if (path.startsWith("/insert")) {
      // Insert some sample vectors into your index
      // In a real application, these vectors would be the output of a machine learning (ML) model,
      // such as Workers AI, OpenAI, or Cohere.
      let inserted = await context.env.VECTORIZE_INDEX.insert(sampleVectors);


      // Return the number of IDs we successfully inserted
      return Response.json(inserted);
    }
  }
  ```

* TypeScript

  ```ts
  export interface Env {
    // This makes our vector index methods available on context.env.VECTORIZE_INDEX.*
    // For example, context.env.VECTORIZE_INDEX.insert() or query()
    VECTORIZE_INDEX: VectorizeIndex;
  }


  // Sample vectors: 3 dimensions wide.
  //
  // Vectors from a machine-learning model are typically ~100 to 1536 dimensions
  // wide (or wider still).
  const sampleVectors: Array<VectorizeVector> = [
    {
      id: "1",
      values: [32.4, 74.1, 3.2],
      metadata: { url: "/products/sku/13913913" },
    },
    {
      id: "2",
      values: [15.1, 19.2, 15.8],
      metadata: { url: "/products/sku/10148191" },
    },
    {
      id: "3",
      values: [0.16, 1.2, 3.8],
      metadata: { url: "/products/sku/97913813" },
    },
    {
      id: "4",
      values: [75.1, 67.1, 29.9],
      metadata: { url: "/products/sku/418313" },
    },
    {
      id: "5",
      values: [58.8, 6.7, 3.4],
      metadata: { url: "/products/sku/55519183" },
    },
  ];


  export const onRequest: PagesFunction<Env> = async (context) => {
    let path = new URL(context.request.url).pathname;
    if (path.startsWith("/favicon")) {
      return new Response("", { status: 404 });
    }


    // You only need to insert vectors into your index once
    if (path.startsWith("/insert")) {
      // Insert some sample vectors into your index
      // In a real application, these vectors would be the output of a machine learning (ML) model,
      // such as Workers AI, OpenAI, or Cohere.
      let inserted = await context.env.VECTORIZE_INDEX.insert(sampleVectors);


      // Return the number of IDs we successfully inserted
      return Response.json(inserted);
    }
  };
  ```

## Workers AI

[Workers AI](https://developers.cloudflare.com/workers-ai/) allows you to run machine learning models, powered by serverless GPUs, on Cloudflare’s global network.

To bind Workers AI to your Pages Function, you can configure a Workers AI binding in the [Wrangler configuration file](https://developers.cloudflare.com/pages/functions/wrangler-configuration/#workers-ai) or the Cloudflare dashboard.

When developing locally using Wrangler, you can define an AI binding using the `--ai` flag. Start Wrangler in development mode by running [`wrangler pages dev --ai AI`](https://developers.cloudflare.com/workers/wrangler/commands/#dev) to expose the `context.env.AI` binding.

To configure a Workers AI binding via the Cloudflare dashboard:

1. Go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project > **Settings**.

3. Select your Pages environment > **Bindings** > **Add** > **Workers AI**.

4. Give your binding a name under **Variable name**.

5. Redeploy your project for the binding to take effect.

### Use Workers AI bindings

To use Workers AI in your Pages Function, you can access your Workers AI binding in your Pages Function code. In the following example, your Workers AI binding is called `AI` and you can access the binding in your Pages Function code on `context.env`.

* JavaScript

  ```js
  export async function onRequest(context) {
    const input = { prompt: "What is the origin of the phrase Hello, World" };


    const answer = await context.env.AI.run(
      "@cf/meta/llama-3.1-8b-instruct",
      input,
    );


    return Response.json(answer);
  }
  ```

* TypeScript

  ```ts
  interface Env {
    AI: Ai;
  }


  export const onRequest: PagesFunction<Env> = async (context) => {
    const input = { prompt: "What is the origin of the phrase Hello, World" };


    const answer = await context.env.AI.run(
      "@cf/meta/llama-3.1-8b-instruct",
      input,
    );


    return Response.json(answer);
  };
  ```

### Interact with your Workers AI binding locally

Workers AI local development usage charges

Using Workers AI always accesses your Cloudflare account in order to run AI models and will incur usage charges even in local development.

You can interact with your Workers AI bindings locally in one of two ways:

* Configure your Pages project's Wrangler file and run [`npx wrangler pages dev`](https://developers.cloudflare.com/workers/wrangler/commands/#dev-1).
* Pass arguments to `wrangler pages dev` directly.

To interact with a Workers AI binding via the Wrangler CLI while developing locally, run:

```sh
npx wrangler pages dev --ai=<BINDING_NAME>
```

Note

If a binding is specified in a [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) and via a command-line argument, the command-line argument takes precedence.

## Service bindings

[Service bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/) enable you to call a Worker from within your Pages Function.

To bind your Pages Function to a Worker, configure a Service binding in your Pages Function using the [Wrangler configuration file](https://developers.cloudflare.com/pages/functions/wrangler-configuration/#service-bindings) or the Cloudflare dashboard.

To configure a Service binding via the Cloudflare dashboard:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project.

3. Go to **Settings** > **Bindings** > **Add** > **Service binding**.

4. Give your binding a name under **Variable name**.

5. Under **Service**, select your desired Worker.

6. Redeploy your project for the binding to take effect.

Below is an example of how to use Service bindings in your Function. In the following example, your Service binding is called `SERVICE` and you can access the binding in your Function code on `context.env`:

* JavaScript

  ```js
  export async function onRequestGet(context) {
    return context.env.SERVICE.fetch(context.request);
  }
  ```

* TypeScript

  ```ts
  interface Env {
    SERVICE: Fetcher;
  }


  export const onRequest: PagesFunction<Env> = async (context) => {
    return context.env.SERVICE.fetch(context.request);
  };
  ```

### Interact with your Service bindings locally

You can interact with your Service bindings locally in one of two ways:

* Configure your Pages project's Wrangler file and run [`npx wrangler pages dev`](https://developers.cloudflare.com/workers/wrangler/commands/#dev-1).
* Pass arguments to `wrangler pages dev` directly.

To interact with a [Service binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/) while developing locally, run the Worker you want to bind to via `wrangler dev` and in parallel, run `wrangler pages dev` with `--service <BINDING_NAME>=<SCRIPT_NAME>` where `SCRIPT_NAME` indicates the name of the Worker. For example, if your Worker is called `my-worker`, connect with this Worker by running it via `npx wrangler dev` (in the Worker's directory) alongside `npx wrangler pages dev <OUTPUT_DIR> --service MY_SERVICE=my-worker` (in the Pages' directory). Interact with this binding by using `context.env` (for example, `context.env.MY_SERVICE`).

If you set up the Service binding via the Cloudflare dashboard, you will need to append `wrangler pages dev` with `--service <BINDING_NAME>=<SCRIPT_NAME>` where `BINDING_NAME` is the name of the Service binding and `SCRIPT_NAME` is the name of the Worker.

For example, to develop locally, if your Worker is called `my-worker`, run `npx wrangler dev` in the `my-worker` directory. In a different terminal, also run `npx wrangler pages dev <OUTPUT_DIR> --service MY_SERVICE=my-worker` in your Pages project directory. Interact with this Service binding by using `context.env` (for example, `context.env.MY_SERVICE`).

Wrangler also supports running your Pages project and bound Workers in the same dev session with one command. To try it out, pass multiple -c flags to Wrangler, like this: `wrangler pages dev -c wrangler.jsonc -c ../other-worker/wrangler.jsonc`. The first argument must point to your Pages configuration file, and the subsequent configurations will be accessible via a Service binding from your Pages project.

Warning

Support for running multiple Workers in the same dev session with one Wrangler command is experimental, and subject to change as we work on the experience. If you run into bugs or have any feedback, [open an issue on the workers-sdk repository](https://github.com/cloudflare/workers-sdk/issues/new)

Note

If a binding is specified in a [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) and via a command-line argument, the command-line argument takes precedence.

## Queue Producers

[Queue Producers](https://developers.cloudflare.com/queues/configuration/javascript-apis/#producer) enable you to send messages into a queue within your Pages Function.

To bind a queue to your Pages Function, configure a queue producer binding in your Pages Function using the [Wrangler configuration file](https://developers.cloudflare.com/pages/functions/wrangler-configuration/#queues-producers) or the Cloudflare dashboard:

To configure a queue producer binding via the Cloudflare dashboard:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project.

3. Go to **Settings** > **Bindings** > **Add** > **Queue**.

4. Give your binding a name under **Variable name**.

5. Under **Queue**, select your desired queue.

6. Redeploy your project for the binding to take effect.

Below is an example of how to use a queue producer binding in your Function. In this example, the binding is named `MY_QUEUE` and you can access the binding in your Function code on `context.env`:

* JavaScript

  ```js
  export async function onRequest(context) {
    await context.env.MY_QUEUE.send({
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers),
    });


    return new Response("Sent!");
  }
  ```

* TypeScript

  ```ts
  interface Env {
    MY_QUEUE: Queue<any>;
  }


  export const onRequest: PagesFunction<Env> = async (context) => {
    await context.env.MY_QUEUE.send({
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers),
    });


    return new Response("Sent!");
  };
  ```

### Interact with your Queue Producer binding locally

If using a queue producer binding with a Pages Function, you will be able to send events to a queue locally. However, it is not possible to consume events from a queue with a Pages Function. You will have to create a [separate consumer Worker](https://developers.cloudflare.com/queues/get-started/#5-create-your-consumer-worker) with a [queue consumer handler](https://developers.cloudflare.com/queues/configuration/javascript-apis/#consumer) to consume events from the queue. Wrangler does not yet support running separate producer Functions and consumer Workers bound to the same queue locally.

## Hyperdrive configs

Note

PostgreSQL drivers like [`Postgres.js`](https://github.com/porsager/postgres) depend on Node.js APIs. Pages Functions with Hyperdrive bindings must be [deployed with Node.js compatibility](https://developers.cloudflare.com/workers/runtime-apis/nodejs).

* wrangler.jsonc

  ```jsonc
  {
    "compatibility_flags": [
      "nodejs_compat"
    ],
    "compatibility_date": "2026-02-10"
  }
  ```

* wrangler.toml

  ```toml
  compatibility_flags = [ "nodejs_compat" ]
  compatibility_date = "2026-02-10"
  ```

[Hyperdrive](https://developers.cloudflare.com/hyperdrive/) is a service for connecting to your existing databases from Cloudflare Workers and Pages Functions.

To bind your Hyperdrive config to your Pages Function, you can configure a Hyperdrive binding in the [Wrangler configuration file](https://developers.cloudflare.com/pages/functions/wrangler-configuration/#hyperdrive) or the Cloudflare dashboard.

To configure a Hyperdrive binding via the Cloudflare dashboard:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project.

3. Go to **Settings** > **Bindings** > **Add** > **Hyperdrive**.

4. Give your binding a name under **Variable name**.

5. Under **Hyperdrive configuration**, select your desired configuration.

6. Redeploy your project for the binding to take effect.

Below is an example of how to use Hyperdrive in your Function. In the following example, your Hyperdrive config is named `HYPERDRIVE` and you can access the binding in your Function code on `context.env`:

* JavaScript

  ```js
  import postgres from "postgres";


  export async function onRequest(context) {
    // create connection to postgres database
    const sql = postgres(context.env.HYPERDRIVE.connectionString);


    try {
      const result = await sql`SELECT id, name, value FROM records`;


      return Response.json({result: result})
    } catch (e) {
      return Response.json({error: e.message, {status: 500}});
    }
  }
  ```

* TypeScript

  ```ts
  import postgres from "postgres";


  interface Env {
    HYPERDRIVE: Hyperdrive;
  }


  type MyRecord = {
    id: number;
    name: string;
    value: string;
  };


  export const onRequest: PagesFunction<Env> = async (context) => {
    // create connection to postgres database
    const sql = postgres(context.env.HYPERDRIVE.connectionString);


    try {
      const result = await sql<MyRecord[]>`SELECT id, name, value FROM records`;


      return Response.json({result: result})
    } catch (e) {
      return Response.json({error: e.message, {status: 500}});
    }
  };
  ```

### Interact with your Hyperdrive binding locally

To interact with your Hyperdrive binding locally, you must provide a local connection string to your database that your Pages project will connect to directly. You can set an environment variable `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_<BINDING_NAME>` with the connection string of the database, or use the Wrangler file to configure your Hyperdrive binding with a `localConnectionString` as specified in [Hyperdrive documentation for local development](https://developers.cloudflare.com/hyperdrive/configuration/local-development/). Then, run [`npx wrangler pages dev <OUTPUT_DIR>`](https://developers.cloudflare.com/workers/wrangler/commands/#dev-1).

## Analytics Engine

The [Analytics Engine](https://developers.cloudflare.com/analytics/analytics-engine/) binding enables you to write analytics within your Pages Function.

To bind an Analytics Engine dataset to your Pages Function, you must configure an Analytics Engine binding using the [Wrangler configuration file](https://developers.cloudflare.com/pages/functions/wrangler-configuration/#analytics-engine-datasets) or the Cloudflare dashboard:

To configure an Analytics Engine binding via the Cloudflare dashboard:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project.

3. Go to **Settings** > **Bindings** > **Add** > **Analytics engine**.

4. Give your binding a name under **Variable name**.

5. Under **Dataset**, input your desired dataset.

6. Redeploy your project for the binding to take effect.

Below is an example of how to use an Analytics Engine binding in your Function. In the following example, the binding is called `ANALYTICS_ENGINE` and you can access the binding in your Function code on `context.env`:

* JavaScript

  ```js
  export async function onRequest(context) {
    const url = new URL(context.request.url);


    context.env.ANALYTICS_ENGINE.writeDataPoint({
      indexes: [],
      blobs: [url.hostname, url.pathname],
      doubles: [],
    });


    return new Response("Logged analytic");
  }
  ```

* TypeScript

  ```ts
  interface Env {
    ANALYTICS_ENGINE: AnalyticsEngineDataset;
  }


  export const onRequest: PagesFunction<Env> = async (context) => {
    const url = new URL(context.request.url);


    context.env.ANALYTICS_ENGINE.writeDataPoint({
      indexes: [],
      blobs: [url.hostname, url.pathname],
      doubles: [],
    });


    return new Response("Logged analytic");
  };
  ```

### Interact with your Analytics Engine binding locally

You cannot use an Analytics Engine binding locally.

## Environment variables

An [environment variable](https://developers.cloudflare.com/workers/configuration/environment-variables/) is an injected value that can be accessed by your Functions. Environment variables are a type of binding that allow you to attach text strings or JSON values to your Pages Function. It is stored as plain text. Set your environment variables directly within the Cloudflare dashboard for both your production and preview environments at runtime and build-time.

To add environment variables to your Pages project, you can use the [Wrangler configuration file](https://developers.cloudflare.com/pages/functions/wrangler-configuration/#environment-variables) or the Cloudflare dashboard.

To configure an environment variable via the Cloudflare dashboard:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project.

3. Go to **Settings** > **Variables and Secrets** > **Add** .

4. After setting a variable name and value, select **Save**.

Below is an example of how to use environment variables in your Function. The environment variable in this example is `ENVIRONMENT` and you can access the environment variable on `context.env`:

* JavaScript

  ```js
  export function onRequest(context) {
    if (context.env.ENVIRONMENT === "development") {
      return new Response("This is a local environment!");
    } else {
      return new Response("This is a live environment");
    }
  }
  ```

* TypeScript

  ```ts
  interface Env {
    ENVIRONMENT: string;
  }


  export const onRequest: PagesFunction<Env> = async (context) => {
    if (context.env.ENVIRONMENT === "development") {
      return new Response("This is a local environment!");
    } else {
      return new Response("This is a live environment");
    }
  };
  ```

### Interact with your environment variables locally

You can interact with your environment variables locally in one of two ways:

* Configure your Pages project's Wrangler file and running `npx wrangler pages dev`.
* Pass arguments to [`wrangler pages dev`](https://developers.cloudflare.com/workers/wrangler/commands/#dev-1) directly.

To interact with your environment variables locally via the Wrangler CLI, add `--binding=<ENVIRONMENT_VARIABLE_NAME>=<ENVIRONMENT_VARIABLE_VALUE>` to the `wrangler pages dev` command:

```sh
npx wrangler pages dev --binding=<ENVIRONMENT_VARIABLE_NAME>=<ENVIRONMENT_VARIABLE_VALUE>
```

## Secrets

Secrets are a type of binding that allow you to attach encrypted text values to your Pages Function. You cannot see secrets after you set them and can only access secrets programmatically on `context.env`. Secrets are used for storing sensitive information like API keys and auth tokens.

To add secrets to your Pages project:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project.

3. Go to **Settings** > **Variables and Secrets** > **Add**.

4. Set a variable name and value.

5. Select **Encrypt** to create your secret.

6. Select **Save**.

You use secrets the same way as environment variables. When setting secrets with Wrangler or in the Cloudflare dashboard, it needs to be done before a deployment that uses those secrets. For more guidance, refer to [Environment variables](#environment-variables).

### Local development with secrets

Warning

Do not use `vars` to store sensitive information in your Worker's Wrangler configuration file. Use secrets instead.

Put secrets for use in local development in either a `.dev.vars` file or a `.env` file, in the same directory as the Wrangler configuration file.

Choose to use either `.dev.vars` or `.env` but not both. If you define a `.dev.vars` file, then values in `.env` files will not be included in the `env` object during local development.

These files should be formatted using the [dotenv](https://hexdocs.pm/dotenvy/dotenv-file-format.html) syntax. For example:

```bash
SECRET_KEY="value"
API_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
```

Do not commit secrets to git

The `.dev.vars` and `.env` files should not committed to git. Add `.dev.vars*` and `.env*` to your project's `.gitignore` file.

To set different secrets for each Cloudflare environment, create files named `.dev.vars.<environment-name>` or `.env.<environment-name>`.

When you select a Cloudflare environment in your local development, the corresponding environment-specific file will be loaded ahead of the generic `.dev.vars` (or `.env`) file.

* When using `.dev.vars.<environment-name>` files, all secrets must be defined per environment. If `.dev.vars.<environment-name>` exists then only this will be loaded; the `.dev.vars` file will not be loaded.

* In contrast, all matching `.env` files are loaded and the values are merged. For each variable, the value from the most specific file is used, with the following precedence:

  * `.env.<environment-name>.local` (most specific)
  * `.env.local`
  * `.env.<environment-name>`
  * `.env` (least specific)

Controlling `.env` handling

It is possible to control how `.env` files are loaded in local development by setting environment variables on the process running the tools.

* To disable loading local dev vars from `.env` files without providing a `.dev.vars` file, set the `CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV` environment variable to `"false"`.
* To include every environment variable defined in your system's process environment as a local development variable, ensure there is no `.dev.vars` and then set the `CLOUDFLARE_INCLUDE_PROCESS_ENV` environment variable to `"true"`.

</page>

<page>
---
title: Debugging and logging · Cloudflare Pages docs
description: Access your Functions logs by using the Cloudflare dashboard or the
  Wrangler CLI.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/functions/debugging-and-logging/
  md: https://developers.cloudflare.com/pages/functions/debugging-and-logging/index.md
---

Access your Functions logs by using the Cloudflare dashboard or the [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/commands/#deployment-tail).

Logs are a powerful debugging tool that can help you test and monitor the behavior of your Pages Functions once they have been deployed. Logs are available for every deployment of your Pages project.

Logs provide detailed information about events and can give insight into:

* Successful or failed requests to your Functions.
* Uncaught exceptions thrown by your Functions.
* Custom `console.log`s declared within your Functions.
* Production issues that cannot be easily reproduced.
* Real-time view of incoming requests to your application.

There are two ways to start a logging session:

1. Run `wrangler pages deployment tail` [in your terminal](https://developers.cloudflare.com/pages/functions/debugging-and-logging/#view-logs-with-wrangler).
2. Use the [Cloudflare dashboard](https://developers.cloudflare.com/pages/functions/debugging-and-logging/#view-logs-in-the-cloudflare-dashboard).

## Add custom logs

Custom logs are `console.log()` statements that you can add yourself inside your Functions. When streaming logs for deployments that contain these Functions, the statements will appear in both `wrangler pages deployment tail` and dashboard outputs.

Below is an example of a custom `console.log` statement inside a Pages Function:

```js
export async function onRequest(context) {
  console.log(
    `[LOGGING FROM /hello]: Request came from ${context.request.url}`,
  );


  return new Response("Hello, world!");
}
```

After you deploy the code above, run `wrangler pages deployment tail` in your terminal. Then access the route at which your Function lives. Your terminal will display:

![Run wrangler pages deployment tail](https://developers.cloudflare.com/_astro/wrangler-custom-logs.F03OQgj6_55lKr.webp)

Your dashboard will display:

![Follow the above steps to access custom logs in the dashboard](https://developers.cloudflare.com/_astro/dash-custom-logs.Csgu9Rye_1v3HJG.webp)

## View logs with Wrangler

`wrangler pages deployment tail` enables developers to livestream logs for a specific project and deployment.

To get started, run `wrangler pages deployment tail` in your Pages project directory. This will log any incoming requests to your application in your local terminal.

The output of each `wrangler pages deployment tail` log is a structured JSON object:

```js
{
  "outcome": "ok",
  "scriptName": null,
  "exceptions": [
    {
      "stack": "    at src/routes/index.tsx17:4\n    at new Promise (<anonymous>)\n",
      "name": "Error",
      "message": "An error has occurred",
      "timestamp": 1668542036110
    }
  ],
  "logs": [],
  "eventTimestamp": 1668542036104,
  "event": {
    "request": {
      "url": "https://pages-fns.pages.dev",
      "method": "GET",
      "headers": {},
      "cf": {}
    },
    "response": {
      "status": 200
    }
  },
  "id": 0
}
```

`wrangler pages deployment tail` allows you to customize a logging session to better suit your needs. Refer to the [`wrangler pages deployment tail` documentation](https://developers.cloudflare.com/workers/wrangler/commands/#deployment-tail) for available configuration options.

## View logs in the Cloudflare Dashboard

To view logs for your `production` or `preview` environments associated with any deployment:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project, go to the deployment you want to view logs for and select **View details** > **Functions**.

Logging is available for all customers (Free, Paid, Enterprise).

## Limits

The following limits apply to Functions logs:

* Logs are not stored. You can start and stop the stream at any time to view them, but they do not persist.
* Logs will not display if the Function’s requests per second are over 100 for the last five minutes.
* Logs from any [Durable Objects](https://developers.cloudflare.com/pages/functions/bindings/#durable-objects) your Functions bind to will show up in the Cloudflare dashboard.
* A maximum of 10 clients can view a deployment’s logs at one time. This can be a combination of either dashboard sessions or `wrangler pages deployment tail` calls.

## Sourcemaps

If you're debugging an uncaught exception, you might find that the [stack traces](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/stack) in your logs contain line numbers to generated JavaScript files. Using Pages' support for [source maps](https://web.dev/articles/source-maps) you can get stack traces that match with the line numbers and symbols of your original source code.

Note

When developing fullstack applications, many build tools (including wrangler for Pages Functions and most fullstack frameworks) will generate source maps for both the client and server, ensure your build step is configured to only emit server sourcemaps or use an additional build step to remove the client source maps. Public source maps might expose the source code of your application to the user.

Refer to [Source maps and stack traces](https://developers.cloudflare.com/pages/functions/source-maps/) for an in-depth explanation.

</page>

<page>
---
title: Examples · Cloudflare Pages docs
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/pages/functions/examples/
  md: https://developers.cloudflare.com/pages/functions/examples/index.md
---

* [A/B testing with middleware](https://developers.cloudflare.com/pages/functions/examples/ab-testing/)
* [Adding CORS headers](https://developers.cloudflare.com/pages/functions/examples/cors-headers/)

</page>

<page>
---
title: Functions - Get started · Cloudflare Pages docs
description: This guide will instruct you on creating and deploying a Pages Function.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/functions/get-started/
  md: https://developers.cloudflare.com/pages/functions/get-started/index.md
---

This guide will instruct you on creating and deploying a Pages Function.

## Prerequisites

You must have a Pages project set up on your local machine or deployed on the Cloudflare dashboard. To create a Pages project, refer to [Get started](https://developers.cloudflare.com/pages/get-started/).

## Create a Function

To get started with generating a Pages Function, create a `/functions` directory. Make sure that the `/functions` directory is at the root of your Pages project (and not in the static root, such as `/dist`).

Advanced mode

For existing applications where Pages Functions’ built-in file path based routing and middleware system is not desirable, use [Advanced mode](https://developers.cloudflare.com/pages/functions/advanced-mode/). Advanced mode allows you to develop your Pages Functions with a `_worker.js` file rather than the `/functions` directory.

Writing your Functions files in the `/functions` directory will automatically generate a Worker with custom functionality at predesignated routes.

Copy and paste the following code into a `helloworld.js` file that you create in your `/functions` folder:

```js
export function onRequest(context) {
  return new Response("Hello, world!");
}
```

In the above example code, the `onRequest` handler takes a request [`context`](https://developers.cloudflare.com/pages/functions/api-reference/#eventcontext) object. The handler must return a `Response` or a `Promise` of a `Response`.

This Function will run on the `/helloworld` route and returns `"Hello, world!"`. The reason this Function is available on this route is because the file is named `helloworld.js`. Similarly, if this file was called `howdyworld.js`, this function would run on `/howdyworld`.

Refer to [Routing](https://developers.cloudflare.com/pages/functions/routing/) for more information on route customization.

### Runtime features

[Workers runtime features](https://developers.cloudflare.com/workers/runtime-apis/) are configurable on Pages Functions, including [compatibility with a subset of Node.js APIs](https://developers.cloudflare.com/workers/runtime-apis/nodejs) and the ability to set a [compatibility date or compatibility flag](https://developers.cloudflare.com/workers/configuration/compatibility-dates/).

Set these configurations by passing an argument to your [Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/#dev-1) command or by setting them in the dashboard. To set Pages compatibility flags in the Cloudflare dashboard:

1. Log into the [Cloudflare dashboard](https://dash.cloudflare.com) and select your account.
2. Select **Workers & Pages** and select your Pages project.
3. Select **Settings** > **Functions** > **Compatibility Flags**.
4. Configure your Production and Preview compatibility flags as needed.

Additionally, use other Cloudflare products such as [D1](https://developers.cloudflare.com/d1/) (serverless DB) and [R2](https://developers.cloudflare.com/r2/) from within your Pages project by configuring [bindings](https://developers.cloudflare.com/pages/functions/bindings/).

## Deploy your Function

After you have set up your Function, deploy your Pages project. Deploy your project by:

* Connecting your [Git provider](https://developers.cloudflare.com/pages/get-started/git-integration/).
* Using [Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/#pages) from the command line.

Warning

[Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/) from the Cloudflare dashboard is currently not supported with Functions.

## Related resources

* Customize your [Function's routing](https://developers.cloudflare.com/pages/functions/routing/)
* Review the [API reference](https://developers.cloudflare.com/pages/functions/api-reference/)
* Learn how to [debug your Function](https://developers.cloudflare.com/pages/functions/debugging-and-logging/)

</page>

<page>
---
title: Local development · Cloudflare Pages docs
description: Run your Pages application locally with our Wrangler Command Line
  Interface (CLI).
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/functions/local-development/
  md: https://developers.cloudflare.com/pages/functions/local-development/index.md
---

Run your Pages application locally with our Wrangler Command Line Interface (CLI).

## Install Wrangler

To get started with Wrangler, refer to the [Install/Update Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/).

## Run your Pages project locally

The main command for local development on Pages is `wrangler pages dev`. This will let you run your Pages application locally, which includes serving static assets and running your Functions.

With your folder of static assets set up, run the following command to start local development:

```sh
npx wrangler pages dev <DIRECTORY-OF-ASSETS>
```

This will then start serving your Pages project. You can press `b` to open the browser on your local site, (available, by default, on <http://localhost:8788>).

Note

If you have a [Wrangler configuration file](https://developers.cloudflare.com/pages/functions/wrangler-configuration/) file configured for your Pages project, you can run [`wrangler pages dev`](https://developers.cloudflare.com/workers/wrangler/commands/#dev-1) without specifying a directory.

### HTTPS support

To serve your local development server over HTTPS with a self-signed certificate, you can \[set `local_protocol` via the [Wrangler configuration file](https://developers.cloudflare.com/pages/functions/wrangler-configuration/#local-development-settings) or you can pass the `--local-protocol=https` argument to [`wrangler pages dev`](https://developers.cloudflare.com/workers/wrangler/commands/#dev-1):

```sh
npx wrangler pages dev --local-protocol=https <DIRECTORY-OF-ASSETS>
```

## Attach bindings to local development

To attach a binding to local development, refer to [Bindings](https://developers.cloudflare.com/pages/functions/bindings/) and find the Cloudflare Developer Platform resource you would like to work with.

## Additional Wrangler configuration

If you are using a Wrangler configuration file in your project, you can set up dev server values like: `port`, `local protocol`, `ip`, and `port`. For more information, read about [configuring local development settings](https://developers.cloudflare.com/pages/functions/wrangler-configuration/#local-development-settings).

</page>

<page>
---
title: Metrics · Cloudflare Pages docs
description: Functions metrics can help you diagnose issues and understand your
  workloads by showing performance and usage data for your Functions.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/functions/metrics/
  md: https://developers.cloudflare.com/pages/functions/metrics/index.md
---

Functions metrics can help you diagnose issues and understand your workloads by showing performance and usage data for your Functions.

## Functions metrics

Functions metrics aggregate request data for an individual Pages project. To view your Functions metrics:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project.

3. In your Pages project, select **Functions Metrics**.

There are three metrics that can help you understand the health of your Function:

1. Requests success.
2. Requests errors.
3. Invocation Statuses.

### Requests

In **Functions metrics**, you can see historical request counts broken down into total requests, successful requests and errored requests. Information on subrequests is available by selecting **Subrequests**.

* **Total**: All incoming requests registered by a Function. Requests blocked by [Web Application Firewall (WAF)](https://www.cloudflare.com/waf/) or other security features will not count.
* **Success**: Requests that returned a `Success` or `Client Disconnected` [invocation status](#invocation-statuses).
* **Errors**: Requests that returned a `Script Threw Exception`, `Exceeded Resources`, or `Internal Error` [invocation status](#invocation-statuses)
* **Subrequests**: Requests triggered by calling `fetch` from within a Function. When your Function fetches a static asset, it will count as a subrequest. A subrequest that throws an uncaught error will not be counted.

Request traffic data may display a drop off near the last few minutes displayed in the graph for time ranges less than six hours. This does not reflect a drop in traffic, but a slight delay in aggregation and metrics delivery.

### Invocation statuses

Function invocation statuses indicate whether a Function executed successfully or failed to generate a response in the Workers runtime. Invocation statuses differ from HTTP status codes. In some cases, a Function invocation succeeds but does not generate a successful HTTP status because of another error encountered outside of the Workers runtime. Some invocation statuses result in a Workers error code being returned to the client.

| Invocation status | Definition | Workers error code | Graph QL field |
| - | - | - | - |
| Success | Worker script executed successfully | | success |
| Client disconnected | HTTP client disconnected before the request completed | | clientDisconnected |
| Script threw exception | Worker script threw an unhandled JavaScript exception | 1101 | scriptThrewException |
| Exceeded resources^1 | Worker script exceeded runtime limits | 1102, 1027 | exceededResources |
| Internal error^2 | Workers runtime encountered an error | | internalError |

1. The Exceeded Resources status may appear when the Worker exceeds a [runtime limit](https://developers.cloudflare.com/workers/platform/limits/#request-limits). The most common cause is excessive CPU time, but is also caused by a script exceeding startup time or free tier limits.
2. The Internal Error status may appear when the Workers runtime fails to process a request due to an internal failure in our system. These errors are not caused by any issue with the Function code nor any resource limit. While requests with Internal Error status are rare, some may appear during normal operation. These requests are not counted towards usage for billing purposes. If you notice an elevated rate of requests with Internal Error status, review [www.cloudflarestatus.com](http://www.cloudflarestatus.com).

To further investigate exceptions, refer to [Debugging and Logging](https://developers.cloudflare.com/pages/functions/debugging-and-logging)

### CPU time per execution

The CPU Time per execution chart shows historical CPU time data broken down into relevant quantiles using [reservoir sampling](https://en.wikipedia.org/wiki/Reservoir_sampling). Learn more about [interpreting quantiles](https://www.statisticshowto.com/quantile-definition-find-easy-steps/).

In some cases, higher quantiles may appear to exceed [CPU time limits](https://developers.cloudflare.com/workers/platform/limits/#cpu-time) without generating invocation errors because of a mechanism in the Workers runtime that allows rollover CPU time for requests below the CPU limit.

### Duration per execution

The **Duration** chart underneath **Median CPU time** in the **Functions metrics** dashboard shows historical [duration](https://developers.cloudflare.com/workers/platform/limits/#duration) per Function execution. The data is broken down into relevant quantiles, similar to the CPU time chart.

Understanding duration on your Function is useful when you are intending to do a significant amount of computation on the Function itself. This is because you may have to use the Standard or Unbound usage model which allows up to 30 seconds of CPU time.

Workers on the [Bundled Usage Model](https://developers.cloudflare.com/workers/platform/pricing/#workers) may have high durations, even with a 50 ms CPU time limit, if they are running many network-bound operations like fetch requests and waiting on responses.

### Metrics retention

Functions metrics can be inspected for up to three months in the past in maximum increments of one week. The **Functions metrics** dashboard in your Pages project includes the charts and information described above.

</page>

<page>
---
title: Middleware · Cloudflare Pages docs
description: Middleware is reusable logic that can be run before your onRequest
  function. Middlewares are typically utility functions. Error handling, user
  authentication, and logging are typical candidates for middleware within an
  application.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/functions/middleware/
  md: https://developers.cloudflare.com/pages/functions/middleware/index.md
---

Middleware is reusable logic that can be run before your [`onRequest`](https://developers.cloudflare.com/pages/functions/api-reference/#onrequests) function. Middlewares are typically utility functions. Error handling, user authentication, and logging are typical candidates for middleware within an application.

## Add middleware

Middleware is similar to standard Pages Functions but middleware is always defined in a `_middleware.js` file in your project's `/functions` directory. A `_middleware.js` file exports an [`onRequest`](https://developers.cloudflare.com/pages/functions/api-reference/#onrequests) function. The middleware will run on requests that match any Pages Functions in the same `/functions` directory, including subdirectories. For example, `functions/users/_middleware.js` file will match requests for `/functions/users/nevi`, `/functions/users/nevi/123` and `functions/users`.

If you want to run a middleware on your entire application, including in front of static files, create a `functions/_middleware.js` file.

In `_middleware.js` files, you may export an `onRequest` handler or any of its method-specific variants. The following is an example middleware which handles any errors thrown in your project's Pages Functions. This example uses the `next()` method available in the request handler's context object:

```js
export async function onRequest(context) {
  try {
    return await context.next();
  } catch (err) {
    return new Response(`${err.message}\n${err.stack}`, { status: 500 });
  }
}
```

## Chain middleware

You can export an array of Pages Functions as your middleware handler. This allows you to chain together multiple middlewares that you want to run. In the following example, you can handle any errors generated from your project's Functions, and check if the user is authenticated:

```js
async function errorHandling(context) {
  try {
    return await context.next();
  } catch (err) {
    return new Response(`${err.message}\n${err.stack}`, { status: 500 });
  }
}


function authentication(context) {
  if (context.request.headers.get("x-email") != "admin@example.com") {
    return new Response("Unauthorized", { status: 403 });
  }


  return context.next();
}


export const onRequest = [errorHandling, authentication];
```

In the above example, the `errorHandling` function will run first. It will capture any errors in the `authentication` function and any errors in any other subsequent Pages Functions.

</page>

<page>
---
title: Module support · Cloudflare Pages docs
description: Pages Functions provide support for several module types, much like
  Workers. This means that you can import and use external modules such as
  WebAssembly (Wasm), text and binary files inside your Functions code.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/functions/module-support/
  md: https://developers.cloudflare.com/pages/functions/module-support/index.md
---

Pages Functions provide support for several module types, much like [Workers](https://blog.cloudflare.com/workers-javascript-modules/). This means that you can import and use external modules such as WebAssembly (Wasm), `text` and `binary` files inside your Functions code.

This guide will instruct you on how to use these different module types inside your Pages Functions.

## ECMAScript Modules

ECMAScript modules (or in short ES Modules) is the official, [standardized](https://tc39.es/ecma262/#sec-modules) module system for JavaScript. It is the recommended mechanism for writing modular and reusable JavaScript code.

[ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) are defined by the use of `import` and `export` statements. Below is an example of a script written in ES Modules format, and a Pages Function that imports that module:

```js
export function greeting(name: string): string {
  return `Hello ${name}!`;
}
```

```js
import { greeting } from "../src/greeting.ts";


export async function onRequest(context) {
  return new Response(`${greeting("Pages Functions")}`);
}
```

## WebAssembly Modules

[WebAssembly](https://developers.cloudflare.com/workers/runtime-apis/webassembly/) (abbreviated Wasm) allows you to compile languages like Rust, Go, or C to a binary format that can run in a wide variety of environments, including web browsers, Cloudflare Workers, Cloudflare Pages Functions, and other WebAssembly runtimes.

The distributable, loadable, and executable unit of code in WebAssembly is called a [module](https://webassembly.github.io/spec/core/syntax/modules.html).

Below is a basic example of how you can import Wasm Modules inside your Pages Functions code:

```js
import addModule from "add.wasm";


export async function onRequest() {
  const addInstance = await WebAssembly.instantiate(addModule);
  return new Response(
    `The meaning of life is ${addInstance.exports.add(20, 1)}`,
  );
}
```

## Text Modules

Text Modules are a non-standardized means of importing resources such as HTML files as a `String`.

To import the below HTML file into your Pages Functions code:

```html
<!DOCTYPE html>
<html>
  <body>
    <h1>Hello Pages Functions!</h1>
  </body>
</html>
```

Use the following script:

```js
import html from "../index.html";


export async function onRequest() {
  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}
```

## Binary Modules

Binary Modules are a non-standardized way of importing binary data such as images as an `ArrayBuffer`.

Below is a basic example of how you can import the data from a binary file inside your Pages Functions code:

```js
import data from "../my-data.bin";


export async function onRequest() {
  return new Response(data, {
    headers: { "Content-Type": "application/octet-stream" },
  });
}
```

</page>

<page>
---
title: Pricing · Cloudflare Pages docs
description: Requests to your Functions are billed as Cloudflare Workers
  requests. Workers plans and pricing can be found in the Workers documentation.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/functions/pricing/
  md: https://developers.cloudflare.com/pages/functions/pricing/index.md
---

Requests to your Functions are billed as Cloudflare Workers requests. Workers plans and pricing can be found [in the Workers documentation](https://developers.cloudflare.com/workers/platform/pricing/).

## Paid Plans

Requests to your Pages functions count towards your quota for Workers Paid plans, including requests from your Function to KV or Durable Object bindings.

Pages supports the [Standard usage model](https://developers.cloudflare.com/workers/platform/pricing/#example-pricing-standard-usage-model).

Note

Workers Enterprise accounts are billed based on the usage model specified in their contract. To switch to the Standard usage model, reach out to your Customer Success Manager (CSM). Some Workers Enterprise customers maintain the ability to [change usage models](https://developers.cloudflare.com/workers/platform/pricing/#how-to-switch-usage-models).

### Static asset requests

On both free and paid plans, requests to static assets are free and unlimited. A request is considered static when it does not invoke Functions. Refer to [Functions invocation routes](https://developers.cloudflare.com/pages/functions/routing/#functions-invocation-routes) to learn more about when Functions are invoked.

## Free Plan

Requests to your Pages Functions count towards your quota for the Workers Free plan. For example, you could use 50,000 Functions requests and 50,000 Workers requests to use your full 100,000 daily request usage. The free plan daily request limit resets at midnight UTC.

</page>

<page>
---
title: Pages Plugins · Cloudflare Pages docs
description: "Cloudflare maintains a number of official Pages Plugins for you to
  use in your Pages projects:"
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/functions/plugins/
  md: https://developers.cloudflare.com/pages/functions/plugins/index.md
---

Cloudflare maintains a number of official Pages Plugins for you to use in your Pages projects:

* [Cloudflare Access](https://developers.cloudflare.com/pages/functions/plugins/cloudflare-access/)
* [Google Chat](https://developers.cloudflare.com/pages/functions/plugins/google-chat/)
* [GraphQL](https://developers.cloudflare.com/pages/functions/plugins/graphql/)
* [hCaptcha](https://developers.cloudflare.com/pages/functions/plugins/hcaptcha/)
* [Honeycomb](https://developers.cloudflare.com/pages/functions/plugins/honeycomb/)
* [Sentry](https://developers.cloudflare.com/pages/functions/plugins/sentry/)
* [Static Forms](https://developers.cloudflare.com/pages/functions/plugins/static-forms/)
* [Stytch](https://developers.cloudflare.com/pages/functions/plugins/stytch/)
* [Turnstile](https://developers.cloudflare.com/pages/functions/plugins/turnstile/)
* [Community Plugins](https://developers.cloudflare.com/pages/functions/plugins/community-plugins/)
* [vercel/og](https://developers.cloudflare.com/pages/functions/plugins/vercel-og/)

***

## Author a Pages Plugin

A Pages Plugin is a Pages Functions distributable which includes built-in routing and functionality. Developers can include a Plugin as a part of their Pages project wherever they chose, and can pass it some configuration options. The full power of Functions is available to Plugins, including middleware, parameterized routes, and static assets.

For example, a Pages Plugin could:

* Intercept HTML pages and inject in a third-party script.
* Proxy a third-party service's API.
* Validate authorization headers.
* Provide a full admin web app experience.
* Store data in KV or Durable Objects.
* Server-side render (SSR) webpages with data from a CMS.
* Report errors and track performance.

A Pages Plugin is essentially a library that developers can use to augment their existing Pages project with a deep integration to Functions.

## Use a Pages Plugin

Developers can enhance their projects by mounting a Pages Plugin at a route of their application. Plugins will provide instructions of where they should typically be mounted (for example, an admin interface might be mounted at `functions/admin/[[path]].ts`, and an error logger might be mounted at `functions/_middleware.ts`). Additionally, each Plugin may take some configuration (for example, with an API token).

***

## Static form example

In this example, you will build a Pages Plugin and then include it in a project.

The first Plugin should:

* intercept HTML forms.
* store the form submission in [KV](https://developers.cloudflare.com/kv/api/).
* respond to submissions with a developer's custom response.

### 1. Create a new Pages Plugin

Create a `package.json` with the following:

```json
{
  "name": "@cloudflare/static-form-interceptor",
  "main": "dist/index.js",
  "types": "index.d.ts",
  "files": ["dist", "index.d.ts", "tsconfig.json"],
  "scripts": {
    "build": "npx wrangler pages functions build --plugin --outdir=dist",
    "prepare": "npm run build"
  }
}
```

Note

The `npx wrangler pages functions build` command supports a number of arguments, including:

* `--plugin` which tells the command to build a Pages Plugin, (rather than Pages Functions as part of a Pages project)
* `--outdir` which allows you to specify where to output the built Plugin
* `--external` which can be used to avoid bundling external modules in the Plugin
* `--watch` argument tells the command to watch for changes to the source files and rebuild the Plugin automatically

For more information about the available arguments, run `npx wrangler pages functions build --help`.

In our example, `dist/index.js` will be the entrypoint to your Plugin. This is a generated file built by Wrangler with the `npm run build` command. Add the `dist/` directory to your `.gitignore`.

Next, create a `functions` directory and start coding your Plugin. The `functions` folder will be mounted at some route by the developer, so consider how you want to structure your files. Generally:

* if you want your Plugin to run on a single route of the developer's choice (for example, `/foo`), create a `functions/index.ts` file.
* if you want your Plugin to be mounted and serve all requests beyond a certain path (for example, `/admin/login` and `/admin/dashboard`), create a `functions/[[path]].ts` file.
* if you want your Plugin to intercept requests but fallback on either other Functions or the project's static assets, create a `functions/_middleware.ts` file.

Do not include the mounted path in your Plugin

Your Plugin should not use the mounted path anywhere in the file structure (for example, `/foo` or `/admin`). Developers should be free to mount your Plugin wherever they choose, but you can make recommendations of how you expect this to be mounted in your `README.md`.

You are free to use as many different files as you need. The structure of a Plugin is exactly the same as Functions in a Pages project today, except that the handlers receive a new property of their parameter object, `pluginArgs`. This property is the initialization parameter that a developer passes when mounting a Plugin. You can use this to receive API tokens, KV/Durable Object namespaces, or anything else that your Plugin needs to work.

Returning to your static form example, if you want to intercept requests and override the behavior of an HTML form, you need to create a `functions/_middleware.ts`. Developers could then mount your Plugin on a single route, or on their entire project.

```typescript
class FormHandler {
  element(element) {
    const name = element.getAttribute("data-static-form-name");
    element.setAttribute("method", "POST");
    element.removeAttribute("action");
    element.append(
      `<input type="hidden" name="static-form-name" value="${name}" />`,
      { html: true },
    );
  }
}


export const onRequestGet = async (context) => {
  // We first get the original response from the project
  const response = await context.next();


  // Then, using HTMLRewriter, we transform `form` elements with a `data-static-form-name` attribute, to tell them to POST to the current page
  return new HTMLRewriter()
    .on("form[data-static-form-name]", new FormHandler())
    .transform(response);
};


export const onRequestPost = async (context) => {
  // Parse the form
  const formData = await context.request.formData();
  const name = formData.get("static-form-name");
  const entries = Object.fromEntries(
    [...formData.entries()].filter(([name]) => name !== "static-form-name"),
  );


  // Get the arguments given to the Plugin by the developer
  const { kv, respondWith } = context.pluginArgs;


  // Store form data in KV under key `form-name:YYYY-MM-DDTHH:MM:SSZ`
  const key = `${name}:${new Date().toISOString()}`;
  context.waitUntil(kv.put(name, JSON.stringify(entries)));


  // Respond with whatever the developer wants
  const response = await respondWith({ formData });
  return response;
};
```

### 2. Type your Pages Plugin

To create a good developer experience, you should consider adding TypeScript typings to your Plugin. This allows developers to use their IDE features for autocompletion, and also ensure that they include all the parameters you are expecting.

In the `index.d.ts`, export a function which takes your `pluginArgs` and returns a `PagesFunction`. For your static form example, you take two properties, `kv`, a KV namespace, and `respondWith`, a function which takes an object with a `formData` property (`FormData`) and returns a `Promise` of a `Response`:

```typescript
export type PluginArgs = {
  kv: KVNamespace;
  respondWith: (args: { formData: FormData }) => Promise<Response>;
};


export default function (args: PluginArgs): PagesFunction;
```

### 3. Test your Pages Plugin

We are still working on creating a great testing experience for Pages Plugins authors. Please be patient with us until all those pieces come together. In the meantime, you can create an example project and include your Plugin manually for testing.

### 4. Publish your Pages Plugin

You can distribute your Plugin however you choose. Popular options include publishing on [npm](https://www.npmjs.com/), showcasing it in the #what-i-built or #pages-discussions channels in our [Developer Discord](https://discord.com/invite/cloudflaredev), and open-sourcing on [GitHub](https://github.com/).

Make sure you are including the generated `dist/` directory, your typings `index.d.ts`, as well as a `README.md` with instructions on how developers can use your Plugin.

***

### 5. Install your Pages Plugin

If you want to include a Pages Plugin in your application, you need to first install that Plugin to your project.

If you are not yet using `npm` in your project, run `npm init` to create a `package.json` file. The Plugin's `README.md` will typically include an installation command (for example, `npm install --save @cloudflare/static-form-interceptor`).

### 6. Mount your Pages Plugin

The `README.md` of the Plugin will likely include instructions for how to mount the Plugin in your application. You will need to:

1. Create a `functions` directory, if you do not already have one.
2. Decide where you want this Plugin to run and create a corresponding file in the `functions` directory.
3. Import the Plugin and export an `onRequest` method in this file, initializing the Plugin with any arguments it requires.

In the static form example, the Plugin you have created already was created as a middleware. This means it can run on either a single route, or across your entire project. If you had a single contact form on your website at `/contact`, you could create a `functions/contact.ts` file to intercept just that route. You could also create a `functions/_middleware.ts` file to intercept all other routes and any other future forms you might create. As the developer, you can choose where this Plugin can run.

A Plugin's default export is a function which takes the same context parameter that a normal Pages Functions handler is given.

```typescript
import staticFormInterceptorPlugin from "@cloudflare/static-form-interceptor";


export const onRequest = (context) => {
  return staticFormInterceptorPlugin({
    kv: context.env.FORM_KV,
    respondWith: async ({ formData }) => {
      // Could call email/notification service here
      const name = formData.get("name");
      return new Response(`Thank you for your submission, ${name}!`);
    },
  })(context);
};
```

### 7. Test your Pages Plugin

You can use `wrangler pages dev` to test a Pages project, including any Plugins you have installed. Remember to include any KV bindings and environment variables that the Plugin is expecting.

With your Plugin mounted on the `/contact` route, a corresponding HTML file might look like this:

```html
<!DOCTYPE html>
<html>
  <body>
    <h1>Contact us</h1>
    <!-- Include the `data-static-form-name` attribute to name the submission -->
    <form data-static-form-name="contact">
      <label>
        <span>Name</span>
        <input type="text" autocomplete="name" name="name" />
      </label>
      <label>
        <span>Message</span>
        <textarea name="message"></textarea>
      </label>
    </form>
  </body>
</html>
```

Your plugin should pick up the `data-static-form-name="contact"` attribute, set the `method="POST"`, inject in an `<input type="hidden" name="static-form-name" value="contact" />` element, and capture `POST` submissions.

### 8. Deploy your Pages project

Make sure the new Plugin has been added to your `package.json` and that everything works locally as you would expect. You can then `git commit` and `git push` to trigger a Cloudflare Pages deployment.

If you experience any problems with any one Plugin, file an issue on that Plugin's bug tracker.

If you experience any problems with Plugins in general, we would appreciate your feedback in the #pages-discussions channel in [Discord](https://discord.com/invite/cloudflaredev)! We are excited to see what you build with Plugins and welcome any feedback about the authoring or developer experience. Let us know in the Discord channel if there is anything you need to make Plugins even more powerful.

***

## Chain your Plugin

Finally, as with Pages Functions generally, it is possible to chain together Plugins in order to combine together different features. Middleware defined higher up in the filesystem will run before other handlers, and individual files can chain together Functions in an array like so:

```typescript
import sentryPlugin from "@cloudflare/pages-plugin-sentry";
import cloudflareAccessPlugin from "@cloudflare/pages-plugin-cloudflare-access";
import adminDashboardPlugin from "@cloudflare/a-fictional-admin-plugin";


export const onRequest = [
  // Initialize a Sentry Plugin to capture any errors
  sentryPlugin({ dsn: "https://sentry.io/welcome/xyz" }),


  // Initialize a Cloudflare Access Plugin to ensure only administrators can access this protected route
  cloudflareAccessPlugin({
    domain: "https://test.cloudflareaccess.com",
    aud: "4714c1358e65fe4b408ad6d432a5f878f08194bdb4752441fd56faefa9b2b6f2",
  }),


  // Populate the Sentry plugin with additional information about the current user
  (context) => {
    const email =
      context.data.cloudflareAccessJWT.payload?.email || "service user";


    context.data.sentry.setUser({ email });


    return next();
  },


  // Finally, serve the admin dashboard plugin, knowing that errors will be captured and that every incoming request has been authenticated
  adminDashboardPlugin(),
];
```

</page>

<page>
---
title: Routing · Cloudflare Pages docs
description: "Functions utilize file-based routing. Your /functions directory
  structure determines the designated routes that your Functions will run on.
  You can create a /functions directory with as many levels as needed for your
  project's use case. Review the following directory:"
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/functions/routing/
  md: https://developers.cloudflare.com/pages/functions/routing/index.md
---

Functions utilize file-based routing. Your `/functions` directory structure determines the designated routes that your Functions will run on. You can create a `/functions` directory with as many levels as needed for your project's use case. Review the following directory:

The following routes will be generated based on the above file structure. These routes map the URL pattern to the `/functions` file that will be invoked when a visitor goes to the URL:

| File path | Route |
| - | - |
| /functions/index.js | example.com |
| /functions/helloworld.js | example.com/helloworld |
| /functions/howdyworld.js | example.com/howdyworld |
| /functions/fruits/index.js | example.com/fruits |
| /functions/fruits/apple.js | example.com/fruits/apple |
| /functions/fruits/banana.js | example.com/fruits/banana |

Trailing slash

Trailing slash is optional. Both `/foo` and `/foo/` will be routed to `/functions/foo.js` or `/functions/foo/index.js`. If your project has both a `/functions/foo.js` and `/functions/foo/index.js` file, `/foo` and `/foo/` would route to `/functions/foo/index.js`.

If no Function is matched, it will fall back to a static asset if there is one. Otherwise, the Function will fall back to the [default routing behavior](https://developers.cloudflare.com/pages/configuration/serving-pages/) for Pages' static assets.

## Dynamic routes

Dynamic routes allow you to match URLs with parameterized segments. This can be useful if you are building dynamic applications. You can accept dynamic values which map to a single path by changing your filename.

### Single path segments

To create a dynamic route, place one set of brackets around your filename – for example, `/users/[user].js`. By doing this, you are creating a placeholder for a single path segment:

| Path | Matches? |
| - | - |
| /users/nevi | Yes |
| /users/daniel | Yes |
| /profile/nevi | No |
| /users/nevi/foobar | No |
| /nevi | No |

### Multipath segments

By placing two sets of brackets around your filename – for example, `/users/[[user]].js` – you are matching any depth of route after `/users/`:

| Path | Matches? |
| - | - |
| /users/nevi | Yes |
| /users/daniel | Yes |
| /profile/nevi | No |
| /users/nevi/foobar | Yes |
| /users/daniel/xyz/123 | Yes |
| /nevi | No |

Route specificity

More specific routes (routes with fewer wildcards) take precedence over less specific routes.

#### Dynamic route examples

Review the following `/functions/` directory structure:

The following requests will match the following files:

| Request | File |
| - | - |
| /foo | Will route to a static asset if one is available. |
| /date | /date.js |
| /users/daniel | /users/\[user].js |
| /users/nevi | /users/\[user].js |
| /users/special | /users/special.js |
| /users/daniel/xyz/123 | /users/\[\[catchall]].js |

The URL segment(s) that match the placeholder (`[user]`) will be available in the request [`context`](https://developers.cloudflare.com/pages/functions/api-reference/#eventcontext) object. The [`context.params`](https://developers.cloudflare.com/pages/functions/api-reference/#eventcontext) object can be used to find the matched value for a given filename placeholder.

For files which match a single URL segment (use a single set of brackets), the values are returned as a string:

```js
export function onRequest(context) {
  return new Response(context.params.user);
}
```

The above logic will return `daniel` for requests to `/users/daniel`.

For files which match against multiple URL segments (use a double set of brackets), the values are returned as an array:

```js
export function onRequest(context) {
  return new Response(JSON.stringify(context.params.catchall));
}
```

The above logic will return `["daniel", "xyz", "123"]` for requests to `/users/daniel/xyz/123`.

## Functions invocation routes

On a purely static project, Pages offers unlimited free requests. However, once you add Functions on a Pages project, all requests by default will invoke your Function. To continue receiving unlimited free static requests, exclude your project's static routes by creating a `_routes.json` file. This file will be automatically generated if a `functions` directory is detected in your project when you publish your project with Pages CI or Wrangler.

Note

Some frameworks (such as [Remix](https://developers.cloudflare.com/pages/framework-guides/deploy-a-remix-site/), [SvelteKit](https://developers.cloudflare.com/pages/framework-guides/deploy-a-svelte-kit-site/)) will also automatically generate a `_routes.json` file. However, if your preferred framework does not, create an issue on their framework repository with a link to this page or let us know on [Discord](https://discord.cloudflare.com). Refer to the [Framework guide](https://developers.cloudflare.com/pages/framework-guides/) for more information on full-stack frameworks.

### Create a `_routes.json` file

Create a `_routes.json` file to control when your Function is invoked. It should be placed in the build directory of your project.

Default build directories

Below are some standard build commands and directories for popular frameworks and tools.

| Framework/tool | Build command | Build directory |
| - | - | - |
| React (Vite) | `npm run build` | `dist` |
| Gatsby | `npx gatsby build` | `public` |
| Next.js | `npx @cloudflare/next-on-pages@1` | `.vercel/output/static` |
| Next.js (Static HTML Export) | `npx next build` | `out` |
| Nuxt.js | `npm run build` | `dist` |
| Qwik | `npm run build` | `dist` |
| Remix | `npm run build` | `build/client` |
| Svelte | `npm run build` | `public` |
| SvelteKit | `npm run build` | `.svelte-kit/cloudflare` |
| Vue | `npm run build` | `dist` |
| Analog | `npm run build` | `dist/analog/public` |
| Astro | `npm run build` | `dist` |
| Angular | `npm run build` | `dist/cloudflare` |
| Brunch | `npx brunch build --production` | `public` |
| Docusaurus | `npm run build` | `build` |
| Elder.js | `npm run build` | `public` |
| Eleventy | `npx @11ty/eleventy` | `_site` |
| Ember.js | `npx ember-cli build` | `dist` |
| GitBook | `npx gitbook-cli build` | `_book` |
| Gridsome | `npx gridsome build` | `dist` |
| Hugo | `hugo` | `public` |
| Jekyll | `jekyll build` | `_site` |
| MkDocs | `mkdocs build` | `site` |
| Pelican | `pelican content` | `output` |
| React Static | `react-static build` | `dist` |
| Slate | `./deploy.sh` | `build` |
| Umi | `npx umi build` | `dist` |
| VitePress | `npx vitepress build` | `.vitepress/dist` |
| Zola | `zola build` | `public` |

This file will include three different properties:

* **version**: Defines the version of the schema. Currently there is only one version of the schema (version 1), however, we may add more in the future and aim to be backwards compatible.
* **include**: Defines routes that will be invoked by Functions. Accepts wildcard behavior.
* **exclude**: Defines routes that will not be invoked by Functions. Accepts wildcard behavior. `exclude` always take priority over `include`.

Note

Wildcards match any number of path segments (slashes). For example, `/users/*` will match everything after the`/users/` path.

#### Example configuration

Below is an example of a `_routes.json`.

```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": []
}
```

This `_routes.json` will invoke your Functions on all routes.

Below is another example of a `_routes.json` file. Any route inside the `/build` directory will not invoke the Function and will not incur a Functions invocation charge.

```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/build/*"]
}
```

## Fail open / closed

If on the Workers Free plan, you can configure how Pages behaves when your daily free tier allowance of Pages Functions requests is exhausted. If, for example, you are performing authentication checks or other critical functionality in your Pages Functions, you may wish to disable your Pages project when the allowance is exhausted.

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project.

3. Go to **Settings** > **Runtime** > **Fail open / closed**.

"Fail open" means that static assets will continue to be served, even if Pages Functions would ordinarily have run first. "Fail closed" means an error page will be returned, rather than static assets.

The daily request limit for Pages Functions can be removed entirely by upgrading to [Workers Standard](https://developers.cloudflare.com/workers/platform/pricing/#workers).

### Limits

Functions invocation routes have the following limits:

* You must have at least one include rule.
* You may have no more than 100 include/exclude rules combined.
* Each rule may have no more than 100 characters.

</page>

<page>
---
title: Smart Placement · Cloudflare Pages docs
description: By default, Workers and Pages Functions are invoked in a data
  center closest to where the request was received. If you are running back-end
  logic in a Pages Function, it may be more performant to run that Pages
  Function closer to your back-end infrastructure rather than the end user.
  Smart Placement (beta) automatically places your workloads in an optimal
  location that minimizes latency and speeds up your applications.
lastUpdated: 2026-01-26T13:23:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/functions/smart-placement/
  md: https://developers.cloudflare.com/pages/functions/smart-placement/index.md
---

By default, [Workers](https://developers.cloudflare.com/workers/) and [Pages Functions](https://developers.cloudflare.com/pages/functions/) are invoked in a data center closest to where the request was received. If you are running back-end logic in a Pages Function, it may be more performant to run that Pages Function closer to your back-end infrastructure rather than the end user. Smart Placement (beta) automatically places your workloads in an optimal location that minimizes latency and speeds up your applications.

## Background

Smart Placement applies to Pages Functions and middleware. Normally, assets are always served globally and closest to your users.

Smart Placement on Pages currently has some caveats. While assets are always meant to be served from a location closest to the user, there are two exceptions to this behavior:

1. If using middleware for every request (`functions/_middleware.js`) when Smart Placement is enabled, all assets will be served from a location closest to your back-end infrastructure. This may result in an unexpected increase in latency as a result.

2. When using [`env.ASSETS.fetch`](https://developers.cloudflare.com/pages/functions/advanced-mode/), assets served via the `ASSETS` fetcher from your Pages Function are served from the same location as your Function. This could be the location closest to your back-end infrastructure and not the user.

Note

To understand how Smart Placement works, refer to [Smart Placement](https://developers.cloudflare.com/workers/configuration/placement/).

## Enable Smart Placement (beta)

Smart Placement is available on all plans.

### Enable Smart Placement via the dashboard

To enable Smart Placement via the dashboard:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project.

3. Select **Settings** > **Runtime**.

4. Under **Placement**, choose **Smart**.

5. Send some initial traffic (approximately 20-30 requests) to your Pages Functions. It takes a few minutes after you have sent traffic to your Pages Function for Smart Placement to take effect.

6. View your Pages Function's [request duration metrics](https://developers.cloudflare.com/workers/observability/metrics-and-analytics/) under Functions Metrics.

## Give feedback on Smart Placement

Smart Placement is in beta. To share your thoughts and experience with Smart Placement, join the [Cloudflare Developer Discord](https://discord.cloudflare.com).

</page>

<page>
---
title: Source maps and stack traces · Cloudflare Pages docs
description: Adding source maps and generating stack traces for Pages.
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/functions/source-maps/
  md: https://developers.cloudflare.com/pages/functions/source-maps/index.md
---

[Stack traces](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/stack) help with debugging your code when your application encounters an unhandled exception. Stack traces show you the specific functions that were called, in what order, from which line and file, and with what arguments.

Most JavaScript code is first bundled, often transpiled, and then minified before being deployed to production. This process creates smaller bundles to optimize performance and converts code from TypeScript to Javascript if needed.

Source maps translate compiled and minified code back to the original code that you wrote. Source maps are combined with the stack trace returned by the JavaScript runtime to present you with a stack trace.

Warning

Support for uploading source maps for Pages is available now in open beta. Minimum required Wrangler version: 3.60.0.

## Source Maps

To enable source maps, provide the `--upload-source-maps` flag to [`wrangler pages deploy`](https://developers.cloudflare.com/workers/wrangler/commands/#deploy-1) or add the following to your Pages application's [Wrangler configuration file](https://developers.cloudflare.com/pages/functions/wrangler-configuration/) if you are using the Pages build environment:

* wrangler.jsonc

  ```jsonc
  {
    "upload_source_maps": true
  }
  ```

* wrangler.toml

  ```toml
  upload_source_maps = true
  ```

When uploading source maps is enabled, Wrangler will automatically generate and upload source map files when you run [`wrangler pages deploy`](https://developers.cloudflare.com/workers/wrangler/commands/#deploy-1).

## Stack traces

​​ When your application throws an uncaught exception, we fetch the source map and use it to map the stack trace of the exception back to lines of your application’s original source code.

You can then view the stack trace when streaming [real-time logs](https://developers.cloudflare.com/pages/functions/debugging-and-logging/).

Note

The source map is retrieved after your Pages Function invocation completes — it's an asynchronous process that does not impact your applications's CPU utilization or performance. Source maps are not accessible inside the application at runtime, if you `console.log()` the [stack property](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/stack), you will not get a deobfuscated stack trace.

## Limits

| Description | Limit |
| - | - |
| Maximum Source Map Size | 15 MB gzipped |

## Related resources

* [Real-time logs](https://developers.cloudflare.com/pages/functions/debugging-and-logging/) - Learn how to capture Pages logs in real-time.

</page>

<page>
---
title: TypeScript · Cloudflare Pages docs
description: Pages Functions supports TypeScript. Author any files in your
  /functions directory with a .ts extension instead of a .js extension to start
  using TypeScript.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/functions/typescript/
  md: https://developers.cloudflare.com/pages/functions/typescript/index.md
---

Pages Functions supports TypeScript. Author any files in your `/functions` directory with a `.ts` extension instead of a `.js` extension to start using TypeScript.

You can add runtime types and Env types by running:

* npm

  ```sh
  npx wrangler types --path='./functions/types.d.ts'
  ```

* yarn

  ```sh
  yarn wrangler types --path='./functions/types.d.ts'
  ```

* pnpm

  ```sh
  pnpm wrangler types --path='./functions/types.d.ts'
  ```

Then configure the types by creating a `functions/tsconfig.json` file:

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "lib": ["esnext"],
    "types": ["./types.d.ts"]
  }
}
```

See [the `wrangler types` command docs](https://developers.cloudflare.com/workers/wrangler/commands/#types) for more details.

If you already have a `tsconfig.json` at the root of your project, you may wish to explicitly exclude the `/functions` directory to avoid conflicts. To exclude the `/functions` directory:

```json
{
  "include": ["src/**/*"],
  "exclude": ["functions/**/*"],
  "compilerOptions": {}
}
```

Pages Functions can be typed using the `PagesFunction` type. This type accepts an `Env` parameter. The `Env` type should have been generated by `wrangler types` and can be found at the top of `types.d.ts`.

Alternatively, you can define the `Env` type manually. For example:

```ts
interface Env {
  KV: KVNamespace;
}


export const onRequest: PagesFunction<Env> = async (context) => {
  const value = await context.env.KV.get("example");
  return new Response(value);
};
```

If you are using `nodejs_compat`, make sure you have installed `@types/node` and updated your `tsconfig.json`.

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "lib": ["esnext"],
    "types": ["./types.d.ts", "node"]
  }
}
```

Note

If you were previously using `@cloudflare/workers-types` instead of the runtime types generated by `wrangler types`, you can refer to this [migration guide](https://developers.cloudflare.com/workers/languages/typescript/#migrating).

</page>

<page>
---
title: Configuration · Cloudflare Pages docs
description: Pages Functions can be configured two ways, either via the
  Cloudflare dashboard or the Wrangler configuration file, a file used to
  customize the development and deployment setup for Workers and Pages
  Functions.
lastUpdated: 2026-02-02T18:38:11.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/functions/wrangler-configuration/
  md: https://developers.cloudflare.com/pages/functions/wrangler-configuration/index.md
---

Warning

If your project contains an existing Wrangler file that you [previously used for local development](https://developers.cloudflare.com/pages/functions/local-development/), make sure you verify that it matches your project settings in the Cloudflare dashboard before opting-in to deploy your Pages project with the Wrangler configuration file. Instead of writing your Wrangler file by hand, Cloudflare recommends using [`npx wrangler pages download config`](#projects-without-existing-wrangler-file) to download your current project settings into a Wrangler file.

Note

As of Wrangler v3.91.0, Wrangler supports both JSON (`wrangler.json` or `wrangler.jsonc`) and TOML (`wrangler.toml`) for its configuration file. Prior to that version, only `wrangler.toml` was supported.

Pages Functions can be configured two ways, either via the [Cloudflare dashboard](https://dash.cloudflare.com) or the Wrangler configuration file, a file used to customize the development and deployment setup for [Workers](https://developers.cloudflare.com/workers/) and Pages Functions.

This page serves as a reference on how to configure your Pages project via the Wrangler configuration file.

If using a Wrangler configuration file, you must treat your file as the [source of truth](https://developers.cloudflare.com/pages/functions/wrangler-configuration/#source-of-truth) for your Pages project configuration.

Using the Wrangler configuration file to configure your Pages project allows you to:

* **Store your configuration file in source control:** Keep your configuration in your repository alongside the rest of your code.
* **Edit your configuration via your code editor:** Remove the need to switch back and forth between interfaces.
* **Write configuration that is shared across environments:** Define configuration like [bindings](https://developers.cloudflare.com/pages/functions/bindings/) for local development, preview and production in one file.
* **Ensure better access control:** By using a configuration file in your project repository, you can control who has access to make changes without giving access to your Cloudflare dashboard.

## Example Wrangler file

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "my-pages-app",
    "pages_build_output_dir": "./dist",
    "kv_namespaces": [
      {
        "binding": "KV",
        "id": "<NAMESPACE_ID>"
      }
    ],
    "d1_databases": [
      {
        "binding": "DB",
        "database_name": "northwind-demo",
        "database_id": "<DATABASE_ID>"
      }
    ],
    "vars": {
      "API_KEY": "1234567asdf"
    }
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "my-pages-app"
  pages_build_output_dir = "./dist"


  [[kv_namespaces]]
  binding = "KV"
  id = "<NAMESPACE_ID>"


  [[d1_databases]]
  binding = "DB"
  database_name = "northwind-demo"
  database_id = "<DATABASE_ID>"


  [vars]
  API_KEY = "1234567asdf"
  ```

## Requirements

### V2 build system

Pages Functions configuration via the Wrangler configuration file requires the [V2 build system](https://developers.cloudflare.com/pages/configuration/build-image/#v2-build-system) or later. To update from V1, refer to the [V2 build system migration instructions](https://developers.cloudflare.com/pages/configuration/build-image/#v1-to-v2-migration).

### Wrangler

You must have Wrangler version 3.45.0 or higher to use a Wrangler configuration file for your Pages project's configuration. To check your Wrangler version, update Wrangler or install Wrangler, refer to [Install/Update Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/).

## Migrate from dashboard configuration

The migration instructions for Pages projects that do not have a Wrangler file currently are different than those for Pages projects with an existing Wrangler file. Read the instructions based on your situation carefully to avoid errors in production.

### Projects with existing Wrangler file

Before you could use the Wrangler configuration file to define your preview and production configuration, it was possible to use the file to define which [bindings](https://developers.cloudflare.com/pages/functions/bindings/) should be available to your Pages project in local development.

If you have been using a Wrangler configuration file for local development, you may already have a file in your Pages project that looks like this:

* wrangler.jsonc

  ```jsonc
  {
    "kv_namespaces": [
      {
        "binding": "KV",
        "id": "<NAMESPACE_ID>"
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  [[kv_namespaces]]
  binding = "KV"
  id = "<NAMESPACE_ID>"
  ```

If you would like to use your existing Wrangler file for your Pages project configuration, you must:

1. Add the `pages_build_output_dir` key with the appropriate value of your [build output directory](https://developers.cloudflare.com/pages/configuration/build-configuration/#build-commands-and-directories) (for example, `pages_build_output_dir = "./dist"`.)
2. Review your existing Wrangler configuration carefully to make sure it aligns with your desired project configuration before deploying.

If you add the `pages_build_output_dir` key to your Wrangler configuration file and deploy your Pages project, Pages will use whatever configuration was defined for local use, which is very likely to be non-production. Do not deploy until you are confident that your Wrangler configuration file is ready for production use.

Overwriting configuration

Running [`wrangler pages download config`](https://developers.cloudflare.com/pages/functions/wrangler-configuration/#projects-without-existing-wranglertoml-file) will overwrite your existing Wrangler file with a generated Wrangler file based on your Cloudflare dashboard configuration. Run this command only if you want to discard your previous Wrangler file that you used for local development and start over with configuration pulled from the Cloudflare dashboard.

You can continue to use your Wrangler file for local development without migrating it for production use by not adding a `pages_build_output_dir` key. If you do not add a `pages_build_output_dir` key and run `wrangler pages deploy`, you will see a warning message telling you that fields are missing and that the file will continue to be used for local development only.

### Projects without existing Wrangler file

If you have an existing Pages project with configuration set up via the Cloudflare dashboard and do not have an existing Wrangler file in your Project, run the `wrangler pages download config` command in your Pages project directory. The `wrangler pages download config` command will download your existing Cloudflare dashboard configuration and generate a valid Wrangler file in your Pages project directory.

* npm

  ```sh
  npx wrangler pages download config <PROJECT_NAME>
  ```

* yarn

  ```sh
  yarn wrangler pages download config <PROJECT_NAME>
  ```

* pnpm

  ```sh
  pnpm wrangler pages download config <PROJECT_NAME>
  ```

Review your generated Wrangler file. To start using the Wrangler configuration file for your Pages project's configuration, create a new deployment, via [Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/) or [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/).

### Handling compatibility dates set to "Latest"

In the Cloudflare dashboard, you can set compatibility dates for preview deployments to "Latest". This will ensure your project is always using the latest compatibility date without the need to explicitly set it yourself.

If you download a Wrangler configuration file from a project configured with "Latest" using the `wrangler pages download` command, your Wrangler configuration file will have the latest compatibility date available at the time you downloaded the configuration file. Wrangler does not support the "Latest" functionality like the dashboard. Compatibility dates must be explicitly set when using a Wrangler configuration file.

Refer to [this guide](https://developers.cloudflare.com/workers/configuration/compatibility-dates/) for more information on what compatibility dates are and how they work.

## Differences using a Wrangler configuration file for Pages Functions and Workers

If you have used [Workers](https://developers.cloudflare.com/workers), you may already be familiar with the [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/). There are a few key differences to be aware of when using this file with your Pages Functions project:

* The configuration fields **do not match exactly** between Pages Functions Wrangler file and the Workers equivalent. For example, configuration keys like `main`, which are Workers specific, do not apply to a Pages Function's Wrangler configuration file. Some functionality supported by Workers, such as [module aliasing](https://developers.cloudflare.com/workers/wrangler/configuration/#module-aliasing) cannot yet be used by Cloudflare Pages projects.
* The Pages' Wrangler configuration file introduces a new key, `pages_build_output_dir`, which is only used for Pages projects.
* The concept of [environments](https://developers.cloudflare.com/pages/functions/wrangler-configuration/#configure-environments) and configuration inheritance in this file **is not** the same as Workers.
* This file becomes the [source of truth](https://developers.cloudflare.com/pages/functions/wrangler-configuration/#source-of-truth) when used, meaning that you **can not edit the same fields in the dashboard** once you are using this file.

## Configure environments

With a Wrangler configuration file, you can quickly set configuration across your local environment, preview deployments, and production.

### Local development

The Wrangler configuration file applies locally when using `wrangler pages dev`. This means that you can test out configuration changes quickly without a need to login to the Cloudflare dashboard. Refer to the following config file for an example:

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "my-pages-app",
    "pages_build_output_dir": "./dist",
    "compatibility_date": "2026-02-10",
    "compatibility_flags": [
      "nodejs_compat"
    ],
    "kv_namespaces": [
      {
        "binding": "KV",
        "id": "<NAMESPACE_ID>"
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "my-pages-app"
  pages_build_output_dir = "./dist"
  compatibility_date = "2026-02-10"
  compatibility_flags = [ "nodejs_compat" ]


  [[kv_namespaces]]
  binding = "KV"
  id = "<NAMESPACE_ID>"
  ```

This Wrangler configuration file adds the `nodejs_compat` compatibility flag and a KV namespace binding to your Pages project. Running `wrangler pages dev` in a Pages project directory with this Wrangler configuration file will apply the `nodejs_compat` compatibility flag locally, and expose the `KV` binding in your Pages Function code at `context.env.KV`.

Note

For a full list of configuration keys, refer to [inheritable keys](#inheritable-keys) and [non-inheritable keys](#non-inheritable-keys).

### Production and preview deployments

Once you are ready to deploy your project, you can set the configuration for production and preview deployments by creating a new deployment containing a Wrangler file.

Note

For the following commands, if you are using git it is important to remember the branch that you set as your [production branch](https://developers.cloudflare.com/pages/configuration/branch-build-controls/#production-branch-control) as well as your [preview branch settings](https://developers.cloudflare.com/pages/configuration/branch-build-controls/#preview-branch-control).

To use the example above as your configuration for production, make a new production deployment using:

```sh
npx wrangler pages deploy
```

or more specifically:

```sh
npx wrangler pages deploy --branch <PRODUCTION BRANCH>
```

To deploy the configuration for preview deployments, you can run the same command as above while on a branch you have configured to work with [preview deployments](https://developers.cloudflare.com/pages/configuration/branch-build-controls/#preview-branch-control). This will set the configuration for all preview deployments, not just the deployments from a specific branch. Pages does not currently support branch-based configuration.

Note

The `--branch` flag is optional with `wrangler pages deploy`. If you use git integration, Wrangler will infer the branch you are on from the repository you are currently in and implicitly add it to the command.

### Environment-specific overrides

There are times that you might want to use different configuration across local, preview deployments, and production. It is possible to override configuration for production and preview deployments by using `[env.production]` or `[env.preview]`.

Note

Unlike [Workers Environments](https://developers.cloudflare.com/workers/wrangler/configuration/#environments), `production` and `preview` are the only two options available via `[env.<ENVIRONMENT>]`.

Refer to the following Wrangler configuration file for an example of how to override preview deployment configuration:

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "my-pages-site",
    "pages_build_output_dir": "./dist",
    "kv_namespaces": [
      {
        "binding": "KV",
        "id": "<NAMESPACE_ID>"
      }
    ],
    "vars": {
      "API_KEY": "1234567asdf"
    },
    "env": {
      "preview": {
        "kv_namespaces": [
          {
            "binding": "KV",
            "id": "<PREVIEW_NAMESPACE_ID>"
          }
        ],
        "vars": {
          "API_KEY": "8901234bfgd"
        }
      }
    }
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "my-pages-site"
  pages_build_output_dir = "./dist"


  [[kv_namespaces]]
  binding = "KV"
  id = "<NAMESPACE_ID>"


  [vars]
  API_KEY = "1234567asdf"


  [[env.preview.kv_namespaces]]
  binding = "KV"
  id = "<PREVIEW_NAMESPACE_ID>"


  [env.preview.vars]
  API_KEY = "8901234bfgd"
  ```

If you deployed this file via `wrangler pages deploy`, `name`, `pages_build_output_dir`, `kv_namespaces`, and `vars` would apply the configuration to local and production, while `env.preview` would override `kv_namespaces` and `vars` for preview deployments.

If you wanted to have configuration values apply to local and preview, but override production, your file would look like this:

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "my-pages-site",
    "pages_build_output_dir": "./dist",
    "kv_namespaces": [
      {
        "binding": "KV",
        "id": "<NAMESPACE_ID>"
      }
    ],
    "vars": {
      "API_KEY": "1234567asdf"
    },
    "env": {
      "production": {
        "kv_namespaces": [
          {
            "binding": "KV",
            "id": "<PRODUCTION_NAMESPACE_ID>"
          }
        ],
        "vars": {
          "API_KEY": "8901234bfgd"
        }
      }
    }
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "my-pages-site"
  pages_build_output_dir = "./dist"


  [[kv_namespaces]]
  binding = "KV"
  id = "<NAMESPACE_ID>"


  [vars]
  API_KEY = "1234567asdf"


  [[env.production.kv_namespaces]]
  binding = "KV"
  id = "<PRODUCTION_NAMESPACE_ID>"


  [env.production.vars]
  API_KEY = "8901234bfgd"
  ```

You can always be explicit and override both preview and production:

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "my-pages-site",
    "pages_build_output_dir": "./dist",
    "kv_namespaces": [
      {
        "binding": "KV",
        "id": "<NAMESPACE_ID>"
      }
    ],
    "vars": {
      "API_KEY": "1234567asdf"
    },
    "env": {
      "preview": {
        "kv_namespaces": [
          {
            "binding": "KV",
            "id": "<PREVIEW_NAMESPACE_ID>"
          }
        ],
        "vars": {
          "API_KEY": "8901234bfgd"
        }
      },
      "production": {
        "kv_namespaces": [
          {
            "binding": "KV",
            "id": "<PRODUCTION_NAMESPACE_ID>"
          }
        ],
        "vars": {
          "API_KEY": "6567875fvgt"
        }
      }
    }
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "my-pages-site"
  pages_build_output_dir = "./dist"


  [[kv_namespaces]]
  binding = "KV"
  id = "<NAMESPACE_ID>"


  [vars]
  API_KEY = "1234567asdf"


  [[env.preview.kv_namespaces]]
  binding = "KV"
  id = "<PREVIEW_NAMESPACE_ID>"


  [env.preview.vars]
  API_KEY = "8901234bfgd"


  [[env.production.kv_namespaces]]
  binding = "KV"
  id = "<PRODUCTION_NAMESPACE_ID>"


  [env.production.vars]
  API_KEY = "6567875fvgt"
  ```

## Inheritable keys

Inheritable keys are configurable at the top-level, and can be inherited (or overridden) by environment-specific configuration.

* `name` string required

  * The name of your Pages project. Alphanumeric and dashes only.

* `pages_build_output_dir` string required

  * The path to your project's build output folder. For example: `./dist`.

* `compatibility_date` string required

  * A date in the form `yyyy-mm-dd`, which will be used to determine which version of the Workers runtime is used. Refer to [Compatibility dates](https://developers.cloudflare.com/workers/configuration/compatibility-dates/).

* `compatibility_flags` string\[] optional

  * A list of flags that enable features from upcoming features of the Workers runtime, usually used together with `compatibility_date`. Refer to [compatibility dates](https://developers.cloudflare.com/workers/configuration/compatibility-dates/).

* `send_metrics` boolean optional

  * Whether Wrangler should send usage data to Cloudflare for this project. Defaults to `true`. You can learn more about this in our [data policy](https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler/telemetry.md).

* `limits` Limits optional

  * Configures limits to be imposed on execution at runtime. Refer to [Limits](#limits).

* `placement` Placement optional

  * Specify how Pages Functions should be located to minimize round-trip time. Refer to [Smart Placement](https://developers.cloudflare.com/workers/configuration/placement/).

* `upload_source_maps` boolean

  * When `upload_source_maps` is set to `true`, Wrangler will upload any server-side source maps part of your Pages project to give corrected stack traces in logs.

## Non-inheritable keys

Non-inheritable keys are configurable at the top-level, but, if any one non-inheritable key is overridden for any environment (for example,`[[env.production.kv_namespaces]]`), all non-inheritable keys must also be specified in the environment configuration and overridden.

For example, this configuration will not work:

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "my-pages-site",
    "pages_build_output_dir": "./dist",
    "kv_namespaces": [
      {
        "binding": "KV",
        "id": "<NAMESPACE_ID>"
      }
    ],
    "vars": {
      "API_KEY": "1234567asdf"
    },
    "env": {
      "production": {
        "vars": {
          "API_KEY": "8901234bfgd"
        }
      }
    }
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "my-pages-site"
  pages_build_output_dir = "./dist"


  [[kv_namespaces]]
  binding = "KV"
  id = "<NAMESPACE_ID>"


  [vars]
  API_KEY = "1234567asdf"


  [env.production.vars]
  API_KEY = "8901234bfgd"
  ```

`[[env.production.vars]]` is set to override `[vars]`. Because of this `[[kv_namespaces]]` must also be overridden by defining `[[env.production.kv_namespaces]]`.

This will work for local development, but will fail to validate when you try to deploy.

* `vars` object optional

  * A map of environment variables to set when deploying your Function. Refer to [Environment variables](https://developers.cloudflare.com/pages/functions/bindings/#environment-variables).

* `d1_databases` object optional

  * A list of D1 databases that your Function should be bound to. Refer to [D1 databases](https://developers.cloudflare.com/pages/functions/bindings/#d1-databases).

* `durable_objects` object optional

  * A list of Durable Objects that your Function should be bound to. Refer to [Durable Objects](https://developers.cloudflare.com/pages/functions/bindings/#durable-objects).

* `hyperdrive` object optional

  * Specifies Hyperdrive configs that your Function should be bound to. Refer to [Hyperdrive](https://developers.cloudflare.com/pages/functions/bindings/#r2-buckets).

* `kv_namespaces` object optional

  * A list of KV namespaces that your Function should be bound to. Refer to [KV namespaces](https://developers.cloudflare.com/pages/functions/bindings/#kv-namespaces).

* `queues.producers` object optional

  * Specifies Queues Producers that are bound to this Function. Refer to [Queues Producers](https://developers.cloudflare.com/queues/get-started/#4-set-up-your-producer-worker).

* `r2_buckets` object optional

  * A list of R2 buckets that your Function should be bound to. Refer to [R2 buckets](https://developers.cloudflare.com/pages/functions/bindings/#r2-buckets).

* `vectorize` object optional

  * A list of Vectorize indexes that your Function should be bound to. Refer to [Vectorize indexes](https://developers.cloudflare.com/vectorize/get-started/intro/#3-bind-your-worker-to-your-index).

* `services` object optional

  * A list of service bindings that your Function should be bound to. Refer to [service bindings](https://developers.cloudflare.com/pages/functions/bindings/#service-bindings).

* `analytics_engine_datasets` object optional

  * Specifies analytics engine datasets that are bound to this Function. Refer to [Workers Analytics Engine](https://developers.cloudflare.com/analytics/analytics-engine/get-started/).

* `ai` object optional

  * Specifies an AI binding to this Function. Refer to [Workers AI](https://developers.cloudflare.com/pages/functions/bindings/#workers-ai).

## Limits

You can configure limits for your Pages project in the same way you can for Workers. Read [this guide](https://developers.cloudflare.com/workers/wrangler/configuration/#limits) for more details.

## Bindings

A [binding](https://developers.cloudflare.com/pages/functions/bindings/) enables your Pages Functions to interact with resources on the Cloudflare Developer Platform. Use bindings to integrate your Pages Functions with Cloudflare resources like [KV](https://developers.cloudflare.com/kv/), [Durable Objects](https://developers.cloudflare.com/durable-objects/), [R2](https://developers.cloudflare.com/r2/), and [D1](https://developers.cloudflare.com/d1/). You can set bindings for both production and preview environments.

### D1 databases

[D1](https://developers.cloudflare.com/d1/) is Cloudflare's serverless SQL database. A Function can query a D1 database (or databases) by creating a [binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/) to each database for [D1 Workers Binding API](https://developers.cloudflare.com/d1/worker-api/).

Note

When using Wrangler in the default local development mode, files will be written to local storage instead of the preview or production database. Refer to [Local development](https://developers.cloudflare.com/workers/development-testing/) for more details.

* Configure D1 database bindings via your [Wrangler file](https://developers.cloudflare.com/workers/wrangler/configuration/#d1-databases) the same way they are configured with Cloudflare Workers.
* Interact with your [D1 Database binding](https://developers.cloudflare.com/pages/functions/bindings/#d1-databases).

### Durable Objects

[Durable Objects](https://developers.cloudflare.com/durable-objects/) provide low-latency coordination and consistent storage for the Workers platform.

* Configure Durable Object namespace bindings via your [Wrangler file](https://developers.cloudflare.com/workers/wrangler/configuration/#durable-objects) the same way they are configured with Cloudflare Workers.

Warning

You must create a Durable Object Worker and bind it to your Pages project using the Cloudflare dashboard or your Pages project's [Wrangler configuration file](https://developers.cloudflare.com/pages/functions/wrangler-configuration/). You cannot create and deploy a Durable Object within a Pages project.

Durable Object bindings configured in a Pages project's Wrangler configuration file require the `script_name` key. For Workers, the `script_name` key is optional.

* Interact with your [Durable Object namespace binding](https://developers.cloudflare.com/pages/functions/bindings/#durable-objects).

### Environment variables

[Environment variables](https://developers.cloudflare.com/workers/configuration/environment-variables/) are a type of binding that allow you to attach text strings or JSON values to your Pages Function.

* Configure environment variables via your [Wrangler file](https://developers.cloudflare.com/workers/wrangler/configuration/#environment-variables) the same way they are configured with Cloudflare Workers.
* Interact with your [environment variables](https://developers.cloudflare.com/pages/functions/bindings/#environment-variables).

### Hyperdrive

[Hyperdrive](https://developers.cloudflare.com/hyperdrive/) bindings allow you to interact with and query any Postgres database from within a Pages Function.

* Configure Hyperdrive bindings via your [Wrangler file](https://developers.cloudflare.com/workers/wrangler/configuration/#hyperdrive) the same way they are configured with Cloudflare Workers.

### KV namespaces

[Workers KV](https://developers.cloudflare.com/kv/api/) is a global, low-latency, key-value data store. It stores data in a small number of centralized data centers, then caches that data in Cloudflare’s data centers after access.

Note

When using Wrangler in the default local development mode, files will be written to local storage instead of the preview or production namespace. Refer to [Local development](https://developers.cloudflare.com/workers/development-testing/) for more details.

* Configure KV namespace bindings via your [Wrangler file](https://developers.cloudflare.com/workers/wrangler/configuration/#kv-namespaces) the same way they are configured with Cloudflare Workers.
* Interact with your [KV namespace binding](https://developers.cloudflare.com/pages/functions/bindings/#kv-namespaces).

### Queues Producers

[Queues](https://developers.cloudflare.com/queues/) is Cloudflare's global message queueing service, providing [guaranteed delivery](https://developers.cloudflare.com/queues/reference/delivery-guarantees/) and [message batching](https://developers.cloudflare.com/queues/configuration/batching-retries/). [Queue Producers](https://developers.cloudflare.com/queues/configuration/javascript-apis/#producer) enable you to send messages into a queue within your Pages Function.

Note

You cannot currently configure a [queues consumer](https://developers.cloudflare.com/queues/reference/how-queues-works/#consumers) with Pages Functions.

* Configure Queues Producer bindings via your [Wrangler file](https://developers.cloudflare.com/workers/wrangler/configuration/#queues) the same way they are configured with Cloudflare Workers.
* Interact with your [Queues Producer binding](https://developers.cloudflare.com/pages/functions/bindings/#queue-producers).

### R2 buckets

[Cloudflare R2 Storage](https://developers.cloudflare.com/r2) allows developers to store large amounts of unstructured data without the costly egress bandwidth fees associated with typical cloud storage services.

Note

When using Wrangler in the default local development mode, files will be written to local storage instead of the preview or production bucket. Refer to [Local development](https://developers.cloudflare.com/workers/development-testing/) for more details.

* Configure R2 bucket bindings via your [Wrangler file](https://developers.cloudflare.com/workers/wrangler/configuration/#r2-buckets) the same way they are configured with Cloudflare Workers.
* Interact with your [R2 bucket bindings](https://developers.cloudflare.com/pages/functions/bindings/#r2-buckets).

### Vectorize indexes

A [Vectorize index](https://developers.cloudflare.com/vectorize/) allows you to insert and query vector embeddings for semantic search, classification and other vector search use-cases.

* Configure Vectorize bindings via your [Wrangler file](https://developers.cloudflare.com/workers/wrangler/configuration/#vectorize-indexes) the same way they are configured with Cloudflare Workers.

### Service bindings

A service binding allows you to call a Worker from within your Pages Function. Binding a Pages Function to a Worker allows you to send HTTP requests to the Worker without those requests going over the Internet. The request immediately invokes the downstream Worker, reducing latency as compared to a request to a third-party service. Refer to [About Service bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/).

* Configure service bindings via your [Wrangler file](https://developers.cloudflare.com/workers/wrangler/configuration/#service-bindings) the same way they are configured with Cloudflare Workers.
* Interact with your [service bindings](https://developers.cloudflare.com/pages/functions/bindings/#service-bindings).

### Analytics Engine Datasets

[Workers Analytics Engine](https://developers.cloudflare.com/analytics/analytics-engine/) provides analytics, observability and data logging from Pages Functions. Write data points within your Pages Function binding then query the data using the [SQL API](https://developers.cloudflare.com/analytics/analytics-engine/sql-api/).

* Configure Analytics Engine Dataset bindings via your [Wrangler file](https://developers.cloudflare.com/workers/wrangler/configuration/#analytics-engine-datasets) the same way they are configured with Cloudflare Workers.
* Interact with your [Analytics Engine Dataset](https://developers.cloudflare.com/pages/functions/bindings/#analytics-engine).

### Workers AI

[Workers AI](https://developers.cloudflare.com/workers-ai/) allows you to run machine learning models, on the Cloudflare network, from your own code – whether that be from Workers, Pages, or anywhere via REST API.

Workers AI local development usage charges

Using Workers AI always accesses your Cloudflare account in order to run AI models and will incur usage charges even in local development.

Unlike other bindings, this binding is limited to one AI binding per Pages Function project.

* Configure Workers AI bindings via your [Wrangler file](https://developers.cloudflare.com/workers/wrangler/configuration/#workers-ai) the same way they are configured with Cloudflare Workers.
* Interact with your [Workers AI binding](https://developers.cloudflare.com/pages/functions/bindings/#workers-ai).

## Local development settings

The local development settings that you can configure are the same for Pages Functions and Cloudflare Workers. Read [this guide](https://developers.cloudflare.com/workers/wrangler/configuration/#local-development-settings) for more details.

## Source of truth

When used in your Pages Functions projects, your Wrangler file is the source of truth. You will be able to see, but not edit, the same fields when you log into the Cloudflare dashboard.

If you decide that you do not want to use a Wrangler configuration file for configuration, you can safely delete it and create a new deployment. Configuration values from your last deployment will still apply and you will be able to edit them from the dashboard.

</page>

<page>
---
title: Blazor · Cloudflare Pages docs
description: Blazor is an SPA framework that can use C# code, rather than
  JavaScript in the browser. In this guide, you will build a site using Blazor,
  and deploy it using Cloudflare Pages.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-a-blazor-site/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-a-blazor-site/index.md
---

[Blazor](https://blazor.net) is an SPA framework that can use C# code, rather than JavaScript in the browser. In this guide, you will build a site using Blazor, and deploy it using Cloudflare Pages.

## Install .NET

Blazor uses C#. You will need the latest version of the [.NET SDK](https://dotnet.microsoft.com/download) to continue creating a Blazor project. If you don't have the SDK installed on your system please download and run the installer.

## Creating a new Blazor WASM project

There are two types of Blazor hosting models: [Blazor Server](https://learn.microsoft.com/en-us/aspnet/core/blazor/hosting-models?view=aspnetcore-8.0#blazor-server) which requires a server to serve the Blazor application to the end user, and [Blazor WebAssembly](https://learn.microsoft.com/en-us/aspnet/core/blazor/hosting-models?view=aspnetcore-8.0#blazor-webassembly) which runs in the browser. Blazor Server is incompatible with the Cloudflare edge network model, thus this guide only use Blazor WebAssembly.

Create a new Blazor WebAssembly (WASM) application by running the following command:

```sh
dotnet new blazorwasm -o my-blazor-project
```

## Create the build script

To deploy, Cloudflare Pages will need a way to build the Blazor project. In the project's directory root, create a `build.sh` file. Populate the file with this (updating the `.dotnet-install.sh` line appropriately if you're not using the latest .NET SDK):

```plaintext
#!/bin/sh
curl -sSL https://dot.net/v1/dotnet-install.sh > dotnet-install.sh
chmod +x dotnet-install.sh
./dotnet-install.sh -c 8.0 -InstallDir ./dotnet
./dotnet/dotnet --version
./dotnet/dotnet publish -c Release -o output
```

Your `build.sh` file needs to be executable for the build command to work. You can make it so by running `chmod +x build.sh`.

## Before you continue

All of the framework guides assume you already have a fundamental understanding of [Git](https://git-scm.com/). If you are new to Git, refer to this [summarized Git handbook](https://guides.github.com/introduction/git-handbook/) on how to set up Git on your local machine.

If you clone with SSH, you must [generate SSH keys](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) on each computer you use to push or pull from GitHub.

Refer to the [GitHub documentation](https://guides.github.com/introduction/git-handbook/) and [Git documentation](https://git-scm.com/book/en/v2) for more information.

## Create a `.gitignore` file

Creating a `.gitignore` file ensures that only what is needed gets pushed onto your GitHub repository. Create a `.gitignore` file by running the following command:

```sh
dotnet new gitignore
```

## Create a GitHub repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, go to your newly created project directory to prepare and push your local application to GitHub by running the following commands in your terminal:

```sh
git init
git remote add origin https://github.com/<your-gh-username>/<repository-name>
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

## Deploy with Cloudflare Pages

To deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application**.

3. Select the **Pages** tab.

4. Select **Import an existing Git repository**.

5. Select the new GitHub repository that you created and then select **Begin setup**.

6. In the **Set up builds and deployments** section, provide the following information:

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command | `./build.sh` |
| Build directory | `output/wwwroot` |

After configuring your site, you can begin your first deploy. You should see Cloudflare Pages installing `dotnet`, your project dependencies, and building your site, before deploying it.

Note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/).

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`. Every time you commit new code to your Blazor site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes look to your site before deploying them to production.

## Troubleshooting

### A file is over the 25 MiB limit

If you receive the error message `Error: Asset "/opt/buildhome/repo/output/wwwroot/_framework/dotnet.wasm" is over the 25MiB limit`, resolve this by doing one of the following actions:

1. Reduce the size of your assets with the following [guide](https://docs.microsoft.com/en-us/aspnet/core/blazor/performance?view=aspnetcore-6.0#minimize-app-download-size).

Or

1. Remove the `*.wasm` files from the output (`rm output/wwwroot/_framework/*.wasm`) and modify your Blazor application to [load the Brotli compressed files](https://docs.microsoft.com/en-us/aspnet/core/blazor/host-and-deploy/webassembly?view=aspnetcore-6.0#compression) instead.

## Learn more

By completing this guide, you have successfully deployed your Blazor site to Cloudflare Pages. To get started with other frameworks, [refer to the list of Framework guides](https://developers.cloudflare.com/pages/framework-guides/).

</page>

<page>
---
title: Brunch · Cloudflare Pages docs
description: Brunch is a fast front-end web application build tool with simple
  declarative configuration and seamless incremental compilation for rapid
  development.
lastUpdated: 2026-01-19T10:17:13.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-a-brunch-site/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-a-brunch-site/index.md
---

[Brunch](https://brunch.io/) is a fast front-end web application build tool with simple declarative configuration and seamless incremental compilation for rapid development.

## Install Brunch

To begin, install Brunch:

```sh
npm install -g brunch
```

## Create a Brunch project

Brunch maintains a library of community-provided [skeletons](https://brunch.io/skeletons) to offer you a boilerplate for your project. Run Brunch's recommended `es6` skeleton with the `brunch new` command:

```sh
brunch new proj -s es6
```

## Before you continue

All of the framework guides assume you already have a fundamental understanding of [Git](https://git-scm.com/). If you are new to Git, refer to this [summarized Git handbook](https://guides.github.com/introduction/git-handbook/) on how to set up Git on your local machine.

If you clone with SSH, you must [generate SSH keys](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) on each computer you use to push or pull from GitHub.

Refer to the [GitHub documentation](https://guides.github.com/introduction/git-handbook/) and [Git documentation](https://git-scm.com/book/en/v2) for more information.

## Create a GitHub repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, go to your newly created project directory to prepare and push your local application to GitHub by running the following commands in your terminal:

```sh
git init
git remote add origin https://github.com/<your-gh-username>/<repository-name>
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

## Deploy with Cloudflare Pages

To deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application**.

3. Select the **Pages** tab.

4. Select **Import an existing Git repository**.

5. Select the new GitHub repository that you created and then select **Begin setup**.

6. In the **Set up builds and deployments** section, provide the following information:

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command | `npx brunch build --production` |
| Build directory | `public` |

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/).

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`.

Every time you commit new code to your Brunch site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) on new pull requests and be able to preview how changes look to your site before deploying them to production.

## Learn more

By completing this guide, you have successfully deployed your Brunch site to Cloudflare Pages. To get started with other frameworks, [refer to the list of Framework guides](https://developers.cloudflare.com/pages/framework-guides/).

</page>

<page>
---
title: Docusaurus · Cloudflare Pages docs
description: Docusaurus is a static site generator. It builds a single-page
  application with fast client-side navigation, leveraging the full power of
  React to make your site interactive. It provides out-of-the-box documentation
  features but can be used to create any kind of site such as a personal
  website, a product site, a blog, or marketing landing pages.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-a-docusaurus-site/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-a-docusaurus-site/index.md
---

[Docusaurus](https://docusaurus.io) is a static site generator. It builds a single-page application with fast client-side navigation, leveraging the full power of React to make your site interactive. It provides out-of-the-box documentation features but can be used to create any kind of site such as a personal website, a product site, a blog, or marketing landing pages.

## Set up a new project

Use the [`create-cloudflare`](https://www.npmjs.com/package/create-cloudflare) CLI (C3) to set up your project. C3 will create a new project directory, initiate Docusaurus' official setup tool, and provide the option to deploy instantly.

To use `create-cloudflare` to create a new Docusaurus project, run the following command:

* npm

  ```sh
  npm create cloudflare@latest -- my-docusaurus-app --framework=docusaurus --platform=pages
  ```

* yarn

  ```sh
  yarn create cloudflare my-docusaurus-app --framework=docusaurus --platform=pages
  ```

* pnpm

  ```sh
  pnpm create cloudflare@latest my-docusaurus-app --framework=docusaurus --platform=pages
  ```

`create-cloudflare` will install additional dependencies, including the [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/#check-your-wrangler-version) CLI and any necessary adapters, and ask you setup questions.

## Before you continue

All of the framework guides assume you already have a fundamental understanding of [Git](https://git-scm.com/). If you are new to Git, refer to this [summarized Git handbook](https://guides.github.com/introduction/git-handbook/) on how to set up Git on your local machine.

If you clone with SSH, you must [generate SSH keys](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) on each computer you use to push or pull from GitHub.

Refer to the [GitHub documentation](https://guides.github.com/introduction/git-handbook/) and [Git documentation](https://git-scm.com/book/en/v2) for more information.

## Create a GitHub repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, go to your newly created project directory to prepare and push your local application to GitHub by running the following commands in your terminal:

```sh
git init
git remote add origin https://github.com/<your-gh-username>/<repository-name>
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

## Deploy with Cloudflare Pages

### Deploy via the `create-cloudflare` CLI (C3)

If you use [`create-cloudflare`(C3)](https://www.npmjs.com/package/create-cloudflare) to create your new Docusaurus project, C3 will install all dependencies needed for your project and prompt you to deploy your project via the CLI. If you deploy, your site will be live and you will be provided with a deployment URL.

### Deploy via the Cloudflare dashboard

To deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application**.

3. Select the **Pages** tab.

4. Select **Import an existing Git repository**.

5. Select the new GitHub repository that you created and then select **Begin setup**.

6. In the **Build settings** section, select *Docusarus* as your **Framework preset**. Your selection will provide the following information:

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command | `npm run build` |
| Build directory | `build` |

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`.

Every time you commit new code to your Docusaurus site and push those changes to GitHub, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) on new pull requests and be able to preview how changes look to your site before deploying them to production.

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/).

## Learn more

By completing this guide, you have successfully deployed your Docusaurus site to Cloudflare Pages. To get started with other frameworks, [refer to the list of Framework guides](https://developers.cloudflare.com/pages/framework-guides/).

</page>

<page>
---
title: Gatsby · Cloudflare Pages docs
description: Gatsby is an open-source React framework for creating websites and
  apps. In this guide, you will create a new Gatsby application and deploy it
  using Cloudflare Pages. You will be using the gatsby CLI to create a new
  Gatsby site.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-a-gatsby-site/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-a-gatsby-site/index.md
---

[Gatsby](https://www.gatsbyjs.com/) is an open-source React framework for creating websites and apps. In this guide, you will create a new Gatsby application and deploy it using Cloudflare Pages. You will be using the `gatsby` CLI to create a new Gatsby site.

## Install Gatsby

Install the `gatsby` CLI by running the following command in your terminal:

```sh
npm install -g gatsby-cli
```

## Create a new project

With Gatsby installed, you can create a new project using `gatsby new`. The `new` command accepts a GitHub URL for using an existing template. As an example, use the `gatsby-starter-lumen` template by running the following command in your terminal. You can find more in [Gatsby's Starters section](https://www.gatsbyjs.com/starters/?v=2):

```sh
npx gatsby new my-gatsby-site https://github.com/alxshelepenok/gatsby-starter-lumen
```

## Before you continue

All of the framework guides assume you already have a fundamental understanding of [Git](https://git-scm.com/). If you are new to Git, refer to this [summarized Git handbook](https://guides.github.com/introduction/git-handbook/) on how to set up Git on your local machine.

If you clone with SSH, you must [generate SSH keys](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) on each computer you use to push or pull from GitHub.

Refer to the [GitHub documentation](https://guides.github.com/introduction/git-handbook/) and [Git documentation](https://git-scm.com/book/en/v2) for more information.

## Create a GitHub repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, go to your newly created project directory to prepare and push your local application to GitHub by running the following commands in your terminal:

```sh
git remote add origin https://github.com/<your-gh-username>/<repository-name>
git branch -M main
git push -u origin main
```

## Deploy with Cloudflare Pages

To deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application**.

3. Select the **Pages** tab.

4. Select **Import an existing Git repository**.

5. Select the new GitHub repository that you created and then select **Begin setup**.

6. In the **Build settings** section, select *Gatsby* as your **Framework preset**. Your selection will provide the following information:

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command | `npx gatsby build` |
| Build directory | `public` |

After configuring your site, you can begin your first deploy. You should see Cloudflare Pages installing `gatsby`, your project dependencies, and building your site, before deploying it.

Note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/).

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`. Every time you commit new code to your Gatsby site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes look to your site before deploying them to production.

## Dynamic routes

If you are using [dynamic routes](https://www.gatsbyjs.com/docs/reference/functions/routing/#dynamic-routing) in your Gatsby project, set up a [proxy redirect](https://developers.cloudflare.com/pages/configuration/redirects/#proxying) for these routes to take effect.

If you have a dynamic route, such as `/users/[id]`, create your proxy redirect by referring to the following example:

```plaintext
/users/* /users/:id 200
```

## Learn more

By completing this guide, you have successfully deployed your Gatsby site to Cloudflare Pages. To get started with other frameworks, [refer to the list of Framework guides](https://developers.cloudflare.com/pages/framework-guides/).

</page>

<page>
---
title: Gridsome · Cloudflare Pages docs
description: Gridsome is a Vue.js powered Jamstack framework for building static
  generated websites and applications that are fast by default. In this guide,
  you will create a new Gridsome project and deploy it using Cloudflare Pages.
  You will use the @gridsome/cli, a command line tool for creating new Gridsome
  projects.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-a-gridsome-site/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-a-gridsome-site/index.md
---

[Gridsome](https://gridsome.org) is a Vue.js powered Jamstack framework for building static generated websites and applications that are fast by default. In this guide, you will create a new Gridsome project and deploy it using Cloudflare Pages. You will use the [`@gridsome/cli`](https://github.com/gridsome/gridsome/tree/master/packages/cli), a command line tool for creating new Gridsome projects.

## Install Gridsome

Install the `@gridsome/cli` by running the following command in your terminal:

```sh
npm install --global @gridsome/cli
```

## Set up a new project

With Gridsome installed, set up a new project by running `gridsome create`. The `create` command accepts a name that defines the directory of the project created and an optional starter kit name. You can review more starters in the [Gridsome starters section](https://gridsome.org/docs/starters/).

```sh
npx gridsome create my-gridsome-website
```

## Before you continue

All of the framework guides assume you already have a fundamental understanding of [Git](https://git-scm.com/). If you are new to Git, refer to this [summarized Git handbook](https://guides.github.com/introduction/git-handbook/) on how to set up Git on your local machine.

If you clone with SSH, you must [generate SSH keys](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) on each computer you use to push or pull from GitHub.

Refer to the [GitHub documentation](https://guides.github.com/introduction/git-handbook/) and [Git documentation](https://git-scm.com/book/en/v2) for more information.

## Create a GitHub repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, go to your newly created project directory to prepare and push your local application to GitHub by running the following commands in your terminal:

```sh
git init
git remote add origin https://github.com/<your-gh-username>/<repository-name>
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

## Deploy with Cloudflare Pages

To deploy your site to Pages:

To deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application**.

3. Select the **Pages** tab.

4. Select **Import an existing Git repository**.

5. Select the new GitHub repository that you created and then select **Begin setup**.

6. In the **Build settings** section, select *Gridsome* as your **Framework preset**. Your selection will provide the following information:

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command | `npx gridsome build` |
| Build directory | `dist` |

After configuring your site, you can begin your first deploy. You should see Cloudflare Pages installing `vuepress`, your project dependencies, and building your site, before deploying it.

Note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/).

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`. Every time you commit new code to your Gridsome project, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes to your site look before deploying them to production.

## Learn more

By completing this guide, you have successfully deployed your Gridsome site to Cloudflare Pages. To get started with other frameworks, [refer to the list of Framework guides](https://developers.cloudflare.com/pages/framework-guides/).

</page>

<page>
---
title: Hexo · Cloudflare Pages docs
description: Hexo is a tool for generating static websites, powered by Node.js.
  Hexo's benefits include speed, simplicity, and flexibility, allowing it to
  render Markdown files into static web pages via Node.js.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-a-hexo-site/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-a-hexo-site/index.md
---

[Hexo](https://hexo.io/) is a tool for generating static websites, powered by Node.js. Hexo's benefits include speed, simplicity, and flexibility, allowing it to render Markdown files into static web pages via Node.js.

In this guide, you will create a new Hexo application and deploy it using Cloudflare Pages. You will use the `hexo` CLI to create a new Hexo site.

## Installing Hexo

First, install the Hexo CLI with `npm` or `yarn` by running either of the following commands in your terminal:

```sh
npm install hexo-cli -g
# or
yarn global add hexo-cli
```

On macOS and Linux, you can install with [brew](https://brew.sh/):

```sh
brew install hexo
```

## Before you continue

All of the framework guides assume you already have a fundamental understanding of [Git](https://git-scm.com/). If you are new to Git, refer to this [summarized Git handbook](https://guides.github.com/introduction/git-handbook/) on how to set up Git on your local machine.

If you clone with SSH, you must [generate SSH keys](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) on each computer you use to push or pull from GitHub.

Refer to the [GitHub documentation](https://guides.github.com/introduction/git-handbook/) and [Git documentation](https://git-scm.com/book/en/v2) for more information.

## Creating a new project

With Hexo CLI installed, create a new project by running the `hexo init` command in your terminal:

```sh
hexo init my-hexo-site
cd my-hexo-site
```

Hexo sites use themes to customize the appearance of statically built HTML sites. Hexo has a default theme automatically installed, which you can find on [Hexo's Themes page](https://hexo.io/themes/).

## Creating a post

Create a new post to give your Hexo site some initial content. Run the `hexo new` command in your terminal to generate a new post:

```sh
hexo new "hello hexo"
```

Inside of `hello-hexo.md`, use Markdown to write the content of the article. You can customize the tags, categories or other variables in the article. Refer to the [Front Matter section](https://hexo.io/docs/front-matter) of the [Hexo documentation](https://hexo.io/docs/) for more information.

## Create a GitHub repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, go to your newly created project directory to prepare and push your local application to GitHub by running the following commands in your terminal:

```sh
git init
git remote add origin https://github.com/<your-gh-username>/<repository-name>
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

## Deploy with Cloudflare Pages

To deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application**.

3. Select the **Pages** tab.

4. Select **Import an existing Git repository**.

5. Select the new GitHub repository that you created and then select **Begin setup**.

6. In the **Set up builds and deployments** section, provide the following information:

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command | `npm run build` |
| Build directory | `public` |

After completing configuration, click the **Save and Deploy** button. You should see Cloudflare Pages installing `hexo` and your project dependencies, and building your site, before deploying it.

Note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/).

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`. Every time you commit new code to your Hexo site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes look to your site before deploying them to production.

## Using a specific Node.js version

Some Hexo themes or plugins have additional requirements for different Node.js versions. To use a specific Node.js version for Hexo:

1. Go to your Pages project.
2. Go to **Settings** > **Environment variables**.
3. Set the environment variable `NODE_VERSION` and a value of your required Node.js version (for example, `14.3`).

![Follow the instructions above to set up an environment variable in the Pages dashboard](https://developers.cloudflare.com/_astro/node-version-pages.19kURO88_1mEGg.webp)

## Learn more

By completing this guide, you have successfully deployed your Hexo site to Cloudflare Pages. To get started with other frameworks, [refer to the list of Framework guides](https://developers.cloudflare.com/pages/framework-guides/).

</page>

<page>
---
title: Hono · Cloudflare Pages docs
description: Hono is a small, simple, and ultrafast web framework for Cloudflare
  Pages and Workers, Deno, and Bun. Learn more about the creation of Hono by
  watching an interview with its creator, Yusuke Wada.
lastUpdated: 2025-10-13T13:40:40.000Z
chatbotDeprioritize: false
tags: Hono
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-a-hono-site/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-a-hono-site/index.md
---

[Hono](https://honojs.dev/) is a small, simple, and ultrafast web framework for Cloudflare Pages and Workers, Deno, and Bun. Learn more about the creation of Hono by [watching an interview](#creator-interview) with its creator, [Yusuke Wada](https://yusu.ke/).

In this guide, you will create a new Hono application and deploy it using Cloudflare Pages.

## Create a new project

Use the [`create-cloudflare`](https://www.npmjs.com/package/create-cloudflare) CLI (C3) to create a new project. C3 will create a new project directory, initiate Hono's official setup tool, and provide the option to deploy instantly.

To use `create-cloudflare` to create a new Hono project, run the following command:

* npm

  ```sh
  npm create cloudflare@latest -- my-hono-app --framework=hono --platform=pages
  ```

* yarn

  ```sh
  yarn create cloudflare my-hono-app --framework=hono --platform=pages
  ```

* pnpm

  ```sh
  pnpm create cloudflare@latest my-hono-app --framework=hono --platform=pages
  ```

In your new Hono project, you will find a `public/static` directory for your static files, and a `src/index.ts` file which is the entrypoint for your server-side code.

## Run in local dev

Develop your app locally by running:

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

You should be able to review your generated web application at `http://localhost:8788`.

## Before you continue

All of the framework guides assume you already have a fundamental understanding of [Git](https://git-scm.com/). If you are new to Git, refer to this [summarized Git handbook](https://guides.github.com/introduction/git-handbook/) on how to set up Git on your local machine.

If you clone with SSH, you must [generate SSH keys](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) on each computer you use to push or pull from GitHub.

Refer to the [GitHub documentation](https://guides.github.com/introduction/git-handbook/) and [Git documentation](https://git-scm.com/book/en/v2) for more information.

## Create a GitHub repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, go to your newly created project directory to prepare and push your local application to GitHub by running the following commands in your terminal:

```sh
git init
git remote add origin https://github.com/<your-gh-username>/<repository-name>
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

## Deploy with Cloudflare Pages

### Deploy via the `create-cloudflare` CLI (C3)

If you use [`create-cloudflare`(C3)](https://www.npmjs.com/package/create-cloudflare) to create your new Hono project, C3 will install all dependencies needed for your project and prompt you to deploy your project via the CLI. If you deploy, your site will be live and you will be provided with a deployment URL.

### Deploy via the Cloudflare dashboard

To deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application**.

3. Select the **Pages** tab.

4. Select **Import an existing Git repository**.

5. Select the new GitHub repository that you created and then select **Begin setup**.

6. In the **Set up builds and deployments** section, provide the following information:

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command | `npm run build` |
| Build directory | `dist` |

After configuring your site, you can begin your first deploy. You should see Cloudflare Pages installing `my-hono-app`, your project dependencies, and building your site before deploying it.

Note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/).

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`. Every time you commit new code to your Hono site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes look to your site before deploying them to production.

## Related resources

### Tutorials

For more tutorials involving Hono and Cloudflare Pages, refer to the following resources:

[Build a Staff Directory Application](https://developers.cloudflare.com/d1/tutorials/build-a-staff-directory-app/)

[Build a staff directory using D1. Users access employee info; admins add new employees within the app.](https://developers.cloudflare.com/d1/tutorials/build-a-staff-directory-app/)

### Demo apps

For demo applications using Hono and Cloudflare Pages, refer to the following resources:

* [Staff Directory demo:](https://github.com/lauragift21/staff-directory) Built using the powerful combination of HonoX for backend logic, Cloudflare Pages for fast and secure hosting, and Cloudflare D1 for seamless database management.

### Creator Interview

</page>

<page>
---
title: Hugo · Cloudflare Pages docs
description: Hugo is a tool for generating static sites, written in Go. It is
  incredibly fast and has great high-level, flexible primitives for managing
  your content using different content formats.
lastUpdated: 2026-01-19T10:17:13.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-a-hugo-site/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-a-hugo-site/index.md
---

[Hugo](https://gohugo.io/) is a tool for generating static sites, written in Go. It is incredibly fast and has great high-level, flexible primitives for managing your content using different [content formats](https://gohugo.io/content-management/formats/).

In this guide, you will create a new Hugo application and deploy it using Cloudflare Pages. You will use the `hugo` CLI to create a new Hugo site.

## Before you continue

All of the framework guides assume you already have a fundamental understanding of [Git](https://git-scm.com/). If you are new to Git, refer to this [summarized Git handbook](https://guides.github.com/introduction/git-handbook/) on how to set up Git on your local machine.

If you clone with SSH, you must [generate SSH keys](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) on each computer you use to push or pull from GitHub.

Refer to the [GitHub documentation](https://guides.github.com/introduction/git-handbook/) and [Git documentation](https://git-scm.com/book/en/v2) for more information.

Go to [Deploy with Cloudflare Pages](#deploy-with-cloudflare-pages) if you already have a Hugo site hosted with your [Git provider](https://developers.cloudflare.com/pages/get-started/git-integration/).

## Install Hugo

Install the Hugo CLI, using the specific instructions for your operating system.

* macos

  If you use the package manager [Homebrew](https://brew.sh), run the `brew install` command in your terminal to install Hugo:

  ```sh
  brew install hugo
  ```

* windows

  If you use the package manager [Chocolatey](https://chocolatey.org/), run the `choco install` command in your terminal to install Hugo:

  ```sh
  choco install hugo --confirm
  ```

  If you use the package manager [Scoop](https://scoop.sh/), run the `scoop install` command in your terminal to install Hugo:

  ```sh
  scoop install hugo
  ```

* linux

  The package manager for your Linux distribution may include Hugo. If this is the case, install Hugo directly using the distribution's package manager — for instance, in Ubuntu, run the following command:

  ```sh
  sudo apt-get install hugo
  ```

  If your package manager does not include Hugo or you would like to download a release directly, refer to the [**Manual**](https://developers.cloudflare.com/pages/framework-guides/deploy-a-hugo-site/#manual-installation) section.

### Manual installation

The Hugo GitHub repository contains pre-built versions of the Hugo command-line tool for various operating systems, which can be found on [the Releases page](https://github.com/gohugoio/hugo/releases).

For more instruction on installing these releases, refer to [Hugo's documentation](https://gohugo.io/getting-started/installing/).

## Create a new project

With Hugo installed, refer to [Hugo's Quick Start](https://gohugo.io/getting-started/quick-start/) to create your project or create a new project by running the `hugo new` command in your terminal:

```sh
hugo new site my-hugo-site
```

Hugo sites use themes to customize the look and feel of the statically built HTML site. There are a number of themes available at [themes.gohugo.io](https://themes.gohugo.io) — for now, use the [Ananke theme](https://themes.gohugo.io/themes/gohugo-theme-ananke/) by running the following commands in your terminal:

```sh
cd my-hugo-site
git init
git submodule add https://github.com/theNewDynamic/gohugo-theme-ananke.git themes/ananke
echo "theme = 'ananke'" >> hugo.toml
```

## Create a post

Create a new post to give your Hugo site some initial content. Run the `hugo new` command in your terminal to generate a new post:

```sh
hugo new content posts/hello-world.md
```

Inside of `hello-world.md`, add some initial content to create your post. Remove the `draft` line in your post's frontmatter when you are ready to publish the post. Any posts with `draft: true` set will be skipped by Hugo's build process.

## Create a GitHub repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, go to your newly created project directory to prepare and push your local application to GitHub by running the following commands in your terminal:

```sh
git remote add origin https://github.com/<your-gh-username>/<repository-name>
git branch -M main
git push -u origin main
```

## Deploy with Cloudflare Pages

To deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application**.

3. Select the **Pages** tab.

4. Select **Import an existing Git repository**.

5. Select the new GitHub repository that you created and then select **Begin setup**.

6. In the **Set up builds and deployments** section, provide the following information:

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command | `hugo` |
| Build directory | `public` |

While `public` is the default build directory for Hugo sites, this setting can be configured with the [`publishDir` setting](https://gohugo.io/configuration/all/#publishdir).

Base URL configuration

Hugo allows you to configure the `baseURL` of your application. This allows you to utilize the `absURL` helper to construct full canonical URLs. In order to do this with Pages, you must provide the `-b` or `--baseURL` flags with the `CF_PAGES_URL` environment variable to your `hugo` build command.

Your final build command may look like this:

```sh
hugo -b $CF_PAGES_URL
```

After completing deployment configuration, select the **Save and Deploy**. You should see Cloudflare Pages installing `hugo` and your project dependencies, and building your site, before deploying it.

Note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/).

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`. Every time you commit new code to your Hugo site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes look to your site before deploying them to production.

## Use a specific or newer Hugo version

To use a [specific or newer version of Hugo](https://github.com/gohugoio/hugo/releases), create the `HUGO_VERSION` environment variable in your Pages project > **Settings** > **Environment variables**. Set the value as the Hugo version you want to specify (see the [Prerequisites](https://gohugo.io/getting-started/quick-start/#prerequisites) for the minimum recommended version).

For example, `HUGO_VERSION`: `0.128.0`.

Note

If you plan to use [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/), make sure you also add environment variables to your **Preview** environment.

## Learn more

By completing this guide, you have successfully deployed your Hugo site to Cloudflare Pages. To get started with other frameworks, [refer to the list of Framework guides](https://developers.cloudflare.com/pages/framework-guides/).

</page>

<page>
---
title: Jekyll · Cloudflare Pages docs
description: Jekyll is an open-source framework for creating websites, based
  around Markdown with Liquid templates. In this guide, you will create a new
  Jekyll application and deploy it using Cloudflare Pages. You use the jekyll
  CLI to create a new Jekyll site.
lastUpdated: 2026-01-19T10:17:13.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-a-jekyll-site/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-a-jekyll-site/index.md
---

[Jekyll](https://jekyllrb.com/) is an open-source framework for creating websites, based around Markdown with Liquid templates. In this guide, you will create a new Jekyll application and deploy it using Cloudflare Pages. You use the `jekyll` CLI to create a new Jekyll site.

Note

If you have an existing Jekyll site on GitHub Pages, refer to [the Jekyll migration guide](https://developers.cloudflare.com/pages/migrations/migrating-jekyll-from-github-pages/).

## Installing Jekyll

Jekyll is written in Ruby, meaning that you will need a functioning Ruby installation, like `rbenv`, to install Jekyll.

To install Ruby on your computer, follow the [`rbenv` installation instructions](https://github.com/rbenv/rbenv#installation) and select a recent version of Ruby by running the `rbenv` command in your terminal. The Ruby version you install will also be used to configure the Pages deployment for your application.

```sh
rbenv install <RUBY_VERSION> # For example, 3.1.3
```

With Ruby installed, you can install the `jekyll` Ruby gem:

```sh
gem install jekyll
```

## Creating a new project

With Jekyll installed, you can create a new project running the `jekyll new` in your terminal:

```sh
jekyll new my-jekyll-site
```

Create a base `index.html` in your newly created folder to give your site content:

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Hello from Cloudflare Pages</title>
  </head>
  <body>
    <h1>Hello from Cloudflare Pages</h1>
  </body>
</html>
```

Optionally, you may use a theme with your new Jekyll site if you would like to start with great styling defaults. For example, the [`minimal-mistakes`](https://github.com/mmistakes/minimal-mistakes) theme has a ["Starting from `jekyll new`"](https://mmistakes.github.io/minimal-mistakes/docs/quick-start-guide/#starting-from-jekyll-new) section to help you add the theme to your new site.

## Before you continue

All of the framework guides assume you already have a fundamental understanding of [Git](https://git-scm.com/). If you are new to Git, refer to this [summarized Git handbook](https://guides.github.com/introduction/git-handbook/) on how to set up Git on your local machine.

If you clone with SSH, you must [generate SSH keys](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) on each computer you use to push or pull from GitHub.

Refer to the [GitHub documentation](https://guides.github.com/introduction/git-handbook/) and [Git documentation](https://git-scm.com/book/en/v2) for more information.

## Create a GitHub repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, go to your newly created project directory to prepare and push your local application to GitHub by running the following commands in your terminal:

```sh
git remote add origin https://github.com/<your-gh-username>/<repository-name>
git branch -M main
git push -u origin main
```

If you are migrating an existing Jekyll project to Pages, confirm that your `Gemfile` is committed as part of your codebase. Pages will look at your Gemfile and run `bundle install` to install the required dependencies for your project, including the `jekyll` gem.

## Deploy with Cloudflare Pages

To deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application**.

3. Select the **Pages** tab.

4. Select **Import an existing Git repository**.

5. Select the new GitHub repository that you created and then select **Begin setup**.

6. In the **Set up builds and deployments** section, provide the following information:

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command | `jekyll build` |
| Build directory | `_site` |

Add an [environment variable](https://developers.cloudflare.com/pages/configuration/build-image/) that matches the Ruby version that you are using locally. Set this as `RUBY_VERSION` on both your preview and production deployments. Below, `3.1.3` is used as an example:

| Environment variable | Value |
| - | - |
| `RUBY_VERSION` | `3.1.3` |

After configuring your site, you can begin your first deployment. You should see Cloudflare Pages installing `jekyll`, your project dependencies, and building your site before deploying it.

Note

For the complete guide to deploying your first site to Cloudflare Pages, refer to [the Get started guide](https://developers.cloudflare.com/pages/get-started/).

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`. Every time you commit new code to your Jekyll site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes look to your site before deploying them to production.

## Learn more

By completing this guide, you have successfully deployed your Jekyll site to Cloudflare Pages. To get started with other frameworks, [refer to the list of Framework guides](https://developers.cloudflare.com/pages/framework-guides/).

</page>

<page>
---
title: Nuxt · Cloudflare Pages docs
description: Web framework making Vue.js-based development simple and powerful.
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-a-nuxt-site/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-a-nuxt-site/index.md
---

[Nuxt](https://nuxt.com) is a web framework making Vue.js-based development simple and powerful.

In this guide, you will create a new Nuxt application and deploy it using Cloudflare Pages.

### Video Tutorial

## Create a new project using the `create-cloudflare` CLI (C3)

The [`create-cloudflare` CLI (C3)](https://developers.cloudflare.com/pages/get-started/c3/) will configure your Nuxt site for Cloudflare Pages. Run the following command in your terminal to create a new Nuxt site:

* npm

  ```sh
  npm create cloudflare@latest -- my-nuxt-app --framework=nuxt --platform=pages
  ```

* yarn

  ```sh
  yarn create cloudflare my-nuxt-app --framework=nuxt --platform=pages
  ```

* pnpm

  ```sh
  pnpm create cloudflare@latest my-nuxt-app --framework=nuxt --platform=pages
  ```

C3 will ask you a series of setup questions and create a new project with [`nuxi` (the official Nuxt CLI)](https://github.com/nuxt/cli). C3 will also install the necessary adapters along with the [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/#check-your-wrangler-version).

After creating your project, C3 will generate a new `my-nuxt-app` directory using the default Nuxt template, updated to be fully compatible with Cloudflare Pages.

When creating your new project, C3 will give you the option of deploying an initial version of your application via [Direct Upload](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/). You can redeploy your application at any time by running following command inside your project directory:

```sh
npm run deploy
```

Git integration

The initial deployment created via C3 is referred to as a [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/). To set up a deployment via the Pages Git integration, refer to the [Git Integration](#git-integration) section below.

## Configure and deploy a project without C3

To deploy a Nuxt project without C3, follow the [Nuxt Get Started guide](https://nuxt.com/docs/getting-started/installation). After you have set up your Nuxt project, choose either the [Git integration guide](https://developers.cloudflare.com/pages/get-started/git-integration/) or [Direct Upload guide](https://developers.cloudflare.com/pages/get-started/direct-upload/) to deploy your Nuxt project on Cloudflare Pages.

## Git integration

In addition to [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/) deployments, you can deploy projects via [Git integration](https://developers.cloudflare.com/pages/configuration/git-integration). Git integration allows you to connect a GitHub or GitLab repository to your Pages application and have your Pages application automatically built and deployed after each new commit is pushed to it.

Git integration

Currently, you cannot add Git integration to existing Pages applications. If you have already deployed your application, you need to create a new Pages application in order to add Git integration to it.

Setup requires a basic understanding of [Git](https://git-scm.com/). If you are new to Git, refer to GitHub's [summarized Git handbook](https://guides.github.com/introduction/git-handbook/) on how to set up Git on your local machine.

### Create a GitHub repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, go to your newly created project directory to prepare and push your local application to GitHub by running the following commands in your terminal:

```sh
# Skip the following three commands if you have built your application
# using C3 or already committed your changes
git init
git add .
git commit -m "Initial commit"


git branch -M main
git remote add origin https://github.com/<YOUR_GH_USERNAME>/<REPOSITORY_NAME>
git push -u origin main
```

### Create a Pages project

To deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application**.

3. Select the **Pages** tab.

4. Select **Import an existing Git repository**.

5. Select the new GitHub repository that you created and then select **Begin setup**.

6. In the **Set up builds and deployments** section, provide the following information:

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command | `npm run build` |
| Build directory | `dist` |

Optionally, you can customize the **Project name** field. It defaults to the GitHub repository's name, but it does not need to match. The **Project name** value is assigned as your `*.pages.dev` subdomain.

1. After completing configuration, select the **Save and Deploy**.

Review your first deploy pipeline in progress. Pages installs all dependencies and builds the project as specified. Cloudflare Pages will automatically rebuild your project and deploy it on every new pushed commit.

Additionally, you will have access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/), which repeat the build-and-deploy process for pull requests. With these, you can preview changes to your project with a real URL before deploying your changes to production.

## Use bindings in your Nuxt application

A [binding](https://developers.cloudflare.com/pages/functions/bindings/) allows your application to interact with Cloudflare developer products, such as [KV](https://developers.cloudflare.com/kv/), [Durable Objects](https://developers.cloudflare.com/durable-objects/), [R2](https://developers.cloudflare.com/r2/), and [D1](https://developers.cloudflare.com/d1/).

If you intend to use bindings in your project, you must first set up your bindings for local and remote development.

### Set up bindings for local development

Projects created via C3 come with `nitro-cloudflare-dev`, a `nitro` module that simplifies the process of working with bindings during development:

```typescript
export default defineNuxtConfig({
  modules: ["nitro-cloudflare-dev"],
});
```

This module is powered by the [`getPlatformProxy` helper function](https://developers.cloudflare.com/workers/wrangler/api#getplatformproxy). `getPlatformProxy` will automatically detect any bindings defined in your project's Wrangler configuration file and emulate those bindings in local development. Review [Wrangler configuration information on bindings](https://developers.cloudflare.com/workers/wrangler/configuration/#bindings) for more information on how to configure bindings in the [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/).

Note

Wrangler configuration is used primarily for local development. Bindings specified in it are not available remotely, unless they are created as [remote bindings](https://developers.cloudflare.com/workers/development-testing/#remote-bindings).

### Set up bindings for a deployed application

In order to access bindings in a deployed application, you will need to [configure your bindings](https://developers.cloudflare.com/pages/functions/bindings/) in the Cloudflare dashboard.

### Add bindings to TypeScript projects

To get proper type support, you need to create a new `env.d.ts` file in the root of your project and declare a [binding](https://developers.cloudflare.com/pages/functions/bindings/). Make sure you have generated Cloudflare runtime types by running [`wrangler types`](https://developers.cloudflare.com/pages/functions/typescript/).

The following is an example of adding a `KVNamespace` binding:

```ts
declare module "h3" {
  interface H3EventContext {
    cf: CfProperties;
    cloudflare: {
      request: Request;
      env: {
        MY_KV: KVNamespace;
      };
      context: ExecutionContext;
    };
  }
}
```

### Access bindings in your Nuxt application

In Nuxt, add server-side code via [Server Routes and Middleware](https://nuxt.com/docs/guide/directory-structure/server#server-directory). The `defineEventHandler()` method is used to define your API endpoints in which you can access Cloudflare's context via the provided `context` field. The `context` field allows you to access any bindings set for your application.

The following code block shows an example of accessing a KV namespace in Nuxt.

* JavaScript

  ```javascript
  export default defineEventHandler(({ context }) => {
    const MY_KV = context.cloudflare.env.MY_KV;


    return {
      // ...
    };
  });
  ```

* TypeScript

  ```typescript
  export default defineEventHandler(({ context }) => {
    const MY_KV = context.cloudflare.env.MY_KV;


    return {
      // ...
    };
  });
  ```

## Learn more

By completing this guide, you have successfully deployed your Nuxt site to Cloudflare Pages. To get started with other frameworks, [refer to the list of Framework guides](https://developers.cloudflare.com/pages/framework-guides/).

## Related resources

### Tutorials

For more tutorials involving Nuxt, refer to the following resources:

[Build a blog using Nuxt.js and Sanity.io on Cloudflare Pages](https://developers.cloudflare.com/pages/tutorials/build-a-blog-using-nuxt-and-sanity/)

[Build a blog application using Nuxt.js and Sanity.io and deploy it on Cloudflare Pages.](https://developers.cloudflare.com/pages/tutorials/build-a-blog-using-nuxt-and-sanity/)

### Demo apps

For demo applications using Nuxt, refer to the following resources:


</page>

<page>
---
title: Pelican · Cloudflare Pages docs
description: Pelican is a static site generator, written in Python. With
  Pelican, you can write your content directly with your editor of choice in
  reStructuredText or Markdown formats.
lastUpdated: 2026-01-19T10:17:13.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-a-pelican-site/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-a-pelican-site/index.md
---

[Pelican](https://docs.getpelican.com) is a static site generator, written in Python. With Pelican, you can write your content directly with your editor of choice in reStructuredText or Markdown formats.

## Create a Pelican project

To begin, create a Pelican project directory. `cd` into your new directory and run:

```sh
python3 -m pip install pelican
```

Then run:

```sh
pip freeze > requirements.txt
```

Create a directory in your project named `content`:

```sh
mkdir content
```

This is the directory name that you will set in the build command.

## Before you continue

All of the framework guides assume you already have a fundamental understanding of [Git](https://git-scm.com/). If you are new to Git, refer to this [summarized Git handbook](https://guides.github.com/introduction/git-handbook/) on how to set up Git on your local machine.

If you clone with SSH, you must [generate SSH keys](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) on each computer you use to push or pull from GitHub.

Refer to the [GitHub documentation](https://guides.github.com/introduction/git-handbook/) and [Git documentation](https://git-scm.com/book/en/v2) for more information.

## Create a GitHub repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, go to your newly created project directory to prepare and push your local application to GitHub by running the following commands in your terminal:

```sh
git init
git remote add origin https://github.com/<your-gh-username>/<repository-name>
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

## Deploy with Cloudflare Pages

To deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application**.

3. Select the **Pages** tab.

4. Select **Import an existing Git repository**.

5. Select the new GitHub repository that you created and then select **Begin setup**.

6. In the **Set up builds and deployments** section, provide the following information:

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command | `pelican content` |
| Build directory | `output` |

1. Select **Environment variables (advanced)** and set the `PYTHON_VERSION` variable with the value of `3.7`.

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/).

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`.

Every time you commit new code to your Pelican site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) on new pull requests and be able to preview how changes look to your site before deploying them to production.

## Learn more

By completing this guide, you have successfully deployed your Pelican site to Cloudflare Pages. To get started with other frameworks, [refer to the list of Framework guides](https://developers.cloudflare.com/pages/framework-guides/).

</page>

<page>
---
title: Preact · Cloudflare Pages docs
description: Preact is a popular, open-source framework for building modern web
  applications. Preact can also be used as a lightweight alternative to React
  because the two share the same API and component model.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-a-preact-site/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-a-preact-site/index.md
---

[Preact](https://preactjs.com) is a popular, open-source framework for building modern web applications. Preact can also be used as a lightweight alternative to React because the two share the same API and component model.

In this guide, you will create a new Preact application and deploy it using Cloudflare Pages. You will use [`create-preact`](https://github.com/preactjs/create-preact), a lightweight project scaffolding tool to set up a new Preact app in seconds.

## Setting up a new project

Create a new project by running the [`npm init`](https://docs.npmjs.com/cli/v6/commands/npm-init) command in your terminal, giving it a title:

```sh
npm init preact
cd your-project-name
```

Note

During initialization, you can accept the `Prerender app (SSG)?` option to have `create-preact` scaffold your app to produce static HTML pages, along with their assets, for production builds. This option is perfect for Pages.

## Before you continue

All of the framework guides assume you already have a fundamental understanding of [Git](https://git-scm.com/). If you are new to Git, refer to this [summarized Git handbook](https://guides.github.com/introduction/git-handbook/) on how to set up Git on your local machine.

If you clone with SSH, you must [generate SSH keys](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) on each computer you use to push or pull from GitHub.

Refer to the [GitHub documentation](https://guides.github.com/introduction/git-handbook/) and [Git documentation](https://git-scm.com/book/en/v2) for more information.

## Create a GitHub repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, go to your newly created project directory to prepare and push your local application to GitHub by running the following commands in your terminal:

```sh
git init
git remote add origin https://github.com/<your-gh-username>/<repository-name>
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

## Deploy with Cloudflare Pages

To deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application**.

3. Select the **Pages** tab.

4. Select **Import an existing Git repository**.

5. Select the new GitHub repository that you created and then select **Begin setup**.

6. In the **Set up builds and deployments** section, provide the following information:

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command | `npm run build` |
| Build directory | `dist` |

Optionally, you can customize the **Project name** field. It defaults to the GitHub repository's name, but it does not need to match. The **Project name** value is assigned as your `*.pages.dev` subdomain.

After completing configuration, select **Save and Deploy**.

You will see your first deploy pipeline in progress. Pages installs all dependencies and builds the project as specified.

After you have deployed your site, you will receive a unique subdomain for your project on `*.pages.dev`.

Cloudflare Pages will automatically rebuild your project and deploy it on every new pushed commit.

Additionally, you will have access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/), which repeat the build-and-deploy process for pull requests. With these, you can preview changes to your project with a real URL before deploying them to production.

Note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/).

## Learn more

By completing this guide, you have successfully deployed your Preact site to Cloudflare Pages. To get started with other frameworks, [refer to the list of Framework guides](https://developers.cloudflare.com/pages/framework-guides/).

</page>

<page>
---
title: Qwik · Cloudflare Pages docs
description: Qwik is an open-source, DOM-centric, resumable web application
  framework designed for best possible time to interactive by focusing on
  resumability, server-side rendering of HTML and fine-grained lazy-loading of
  code.
lastUpdated: 2026-01-19T10:17:13.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-a-qwik-site/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-a-qwik-site/index.md
---

[Qwik](https://github.com/builderio/qwik) is an open-source, DOM-centric, resumable web application framework designed for best possible time to interactive by focusing on [resumability](https://qwik.builder.io/docs/concepts/resumable/), server-side rendering of HTML and [fine-grained lazy-loading](https://qwik.builder.io/docs/concepts/progressive/#lazy-loading) of code.

In this guide, you will create a new Qwik application implemented via [Qwik City](https://qwik.builder.io/qwikcity/overview/) (Qwik's meta-framework) and deploy it using Cloudflare Pages.

## Creating a new project

Use the [`create-cloudflare`](https://www.npmjs.com/package/create-cloudflare) CLI (C3) to create a new project. C3 will create a new project directory, initiate Qwik's official setup tool, and provide the option to deploy instantly.

To use `create-cloudflare` to create a new Qwik project, run the following command:

* npm

  ```sh
  npm create cloudflare@latest -- my-qwik-app --framework=qwik --platform=pages
  ```

* yarn

  ```sh
  yarn create cloudflare my-qwik-app --framework=qwik --platform=pages
  ```

* pnpm

  ```sh
  pnpm create cloudflare@latest my-qwik-app --framework=qwik --platform=pages
  ```

`create-cloudflare` will install additional dependencies, including the [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/#check-your-wrangler-version) and any necessary adapters, and ask you setup questions.

As part of the `cloudflare-pages` adapter installation, a `functions/[[path]].ts` file will be created. The `[[path]]` filename indicates that this file will handle requests to all incoming URLs. Refer to [Path segments](https://developers.cloudflare.com/pages/functions/routing/#dynamic-routes) to learn more.

After selecting your server option, change the directory to your project and render your project by running the following command:

```sh
npm start
```

## Before you continue

All of the framework guides assume you already have a fundamental understanding of [Git](https://git-scm.com/). If you are new to Git, refer to this [summarized Git handbook](https://guides.github.com/introduction/git-handbook/) on how to set up Git on your local machine.

If you clone with SSH, you must [generate SSH keys](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) on each computer you use to push or pull from GitHub.

Refer to the [GitHub documentation](https://guides.github.com/introduction/git-handbook/) and [Git documentation](https://git-scm.com/book/en/v2) for more information.

## Create a GitHub repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, go to your newly created project directory to prepare and push your local application to GitHub by running the following commands in your terminal:

```sh
git init
git remote add origin https://github.com/<your-gh-username>/<repository-name>
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

## Deploy with Cloudflare Pages

### Deploy via the `create-cloudflare` CLI (C3)

If you use [`create-cloudflare`(C3)](https://www.npmjs.com/package/create-cloudflare) to create your new Qwik project, C3 will install all dependencies needed for your project and prompt you to deploy your project via the CLI. If you deploy, your site will be live and you will be provided with a deployment URL.

### Deploy via the Cloudflare dashboard

To deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application**.

3. Select the **Pages** tab.

4. Select **Import an existing Git repository**.

5. Select the new GitHub repository that you created and then select **Begin setup**.

6. In the **Set up builds and deployments** section, provide the following information:

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command | `npm run build` |
| Build directory | `dist` |

After configuring your site, you can begin your first deploy. You should see Cloudflare Pages installing `npm`, your project dependencies, and building your site before deploying it.

Note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/).

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`. Every time you commit new code to your Qwik site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) on new pull requests, to preview how changes look to your site before deploying them to production.

## Use bindings in your Qwik application

A [binding](https://developers.cloudflare.com/pages/functions/bindings/) allows your application to interact with Cloudflare developer products, such as [KV](https://developers.cloudflare.com/kv/concepts/how-kv-works/), [Durable Object](https://developers.cloudflare.com/durable-objects/), [R2](https://developers.cloudflare.com/r2/), and [D1](https://blog.cloudflare.com/introducing-d1/).

In QwikCity, add server-side code via [routeLoaders](https://qwik.builder.io/qwikcity/route-loader/) and [actions](https://qwik.builder.io/qwikcity/action/). Then access bindings set for your application via the `platform` object provided by the framework.

The following code block shows an example of accessing a KV namespace in QwikCity.

```typescript
// ...


export const useGetServerTime = routeLoader$(({ platform }) => {
  // the type `KVNamespace` comes from runtime types generated by running `wrangler types`
  const { MY_KV } = (platform.env as { MY_KV: KVNamespace }));


  return {
    // ....
  }
});
```

## Learn more

By completing this guide, you have successfully deployed your Qwik site to Cloudflare Pages. To get started with other frameworks, [refer to the list of Framework guides](https://developers.cloudflare.com/pages/framework-guides/).

</page>

<page>
---
title: React · Cloudflare Pages docs
description: React is a popular framework for building reactive and powerful
  front-end applications, built by the open-source team at Facebook.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/index.md
---

[React](https://reactjs.org/) is a popular framework for building reactive and powerful front-end applications, built by the open-source team at Facebook.

In this guide, you will create a new React application and deploy it using Cloudflare Pages.

## Setting up a new project

Use the [`create-cloudflare`](https://www.npmjs.com/package/create-cloudflare) CLI (C3) to set up a new project. C3 will create a new project directory, initiate React's official setup tool, and provide the option to deploy instantly.

To use `create-cloudflare` to create a new React project, run the following command:

* npm

  ```sh
  npm create cloudflare@latest -- my-react-app --framework=react --platform=pages
  ```

* yarn

  ```sh
  yarn create cloudflare my-react-app --framework=react --platform=pages
  ```

* pnpm

  ```sh
  pnpm create cloudflare@latest my-react-app --framework=react --platform=pages
  ```

`create-cloudflare` will install dependencies, including the [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/#check-your-wrangler-version) CLI and the Cloudflare Pages adapter, and ask you setup questions.

Go to the application's directory:

```sh
cd my-react-app
```

From here you can run your application with:

```sh
npm run dev
```

## Before you continue

All of the framework guides assume you already have a fundamental understanding of [Git](https://git-scm.com/). If you are new to Git, refer to this [summarized Git handbook](https://guides.github.com/introduction/git-handbook/) on how to set up Git on your local machine.

If you clone with SSH, you must [generate SSH keys](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) on each computer you use to push or pull from GitHub.

Refer to the [GitHub documentation](https://guides.github.com/introduction/git-handbook/) and [Git documentation](https://git-scm.com/book/en/v2) for more information.

## Create a GitHub repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, go to your newly created project directory to prepare and push your local application to GitHub by running the following commands in your terminal:

```sh
git remote add origin https://github.com/<your-gh-username>/<repository-name>
git branch -M main
git push -u origin main
```

## Deploy with Cloudflare Pages

### Deploy via the `create-cloudflare` CLI (C3)

If you use [`create-cloudflare`(C3)](https://www.npmjs.com/package/create-cloudflare) to create your new React project, C3 will install all dependencies needed for your project and prompt you to deploy your project via the CLI. If you deploy, your site will be live and you will be provided with a deployment URL.

### Deploy via the Cloudflare dashboard

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application** > **Pages** > **Import an existing Git repository**.

3. Select the new GitHub repository that you created and, in the **Set up builds and deployments** section, provide the following information:

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command | `npm run build` |
| Build directory | `dist` |

After configuring your site, you can begin your first deploy. You should see Cloudflare Pages installing `react`, your project dependencies, and building your site, before deploying it.

Note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/).

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`. Every time you commit new code to your React application, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes look to your site before deploying them to production.

SPA rendering

By default, Cloudflare Pages assumes you are developing a single-page application. Refer to [Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/#single-page-application-spa-rendering) for more information.

## Learn more

By completing this guide, you have successfully deployed your React site to Cloudflare Pages. To get started with other frameworks, [refer to the list of Framework guides](https://developers.cloudflare.com/pages/framework-guides/).

</page>

<page>
---
title: Remix · Cloudflare Pages docs
description: Remix is a framework that focused on web standard. The framework is
  no longer recommended for new projects by the authors and its successor React
  Router should be used instead.
lastUpdated: 2025-09-26T14:28:21.000Z
chatbotDeprioritize: false
tags: Remix
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-a-remix-site/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-a-remix-site/index.md
---

[Remix](https://remix.run/) is a framework that focused on web standard. The framework is no longer recommended for new projects by the authors and its successor React Router should be used instead.

To start a new React Router project please refer to the [React Router Workers guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router).

And if you have an existing Remix application consider migrating it to React Router as described in the [official Remix upgrade documentation](https://reactrouter.com/upgrading/remix).

</page>

<page>
---
title: SolidStart · Cloudflare Pages docs
description: Solid is an open-source web application framework focused on
  generating performant applications with a modern developer experience based on
  JSX.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-a-solid-start-site/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-a-solid-start-site/index.md
---

[Solid](https://www.solidjs.com/) is an open-source web application framework focused on generating performant applications with a modern developer experience based on JSX.

In this guide, you will create a new Solid application implemented via [SolidStart](https://start.solidjs.com/getting-started/what-is-solidstart) (Solid's meta-framework) and deploy it using Cloudflare Pages.

## Create a new project

Use the [`create-cloudflare`](https://www.npmjs.com/package/create-cloudflare) CLI (C3) to set up a new project. C3 will create a new project directory, initiate Solid's official setup tool, and provide the option to deploy instantly.

To use `create-cloudflare` to create a new Solid project, run the following command:

* npm

  ```sh
  npm create cloudflare@latest -- my-solid-app --framework=solid
  ```

* yarn

  ```sh
  yarn create cloudflare my-solid-app --framework=solid
  ```

* pnpm

  ```sh
  pnpm create cloudflare@latest my-solid-app --framework=solid
  ```

You will be prompted to select a starter. Choose any of the available options. You will then be asked if you want to enable Server Side Rendering. Reply `yes`. Finally, you will be asked if you want to use TypeScript, choose either `yes` or `no`.

`create-cloudflare` will then install dependencies, including the [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/#check-your-wrangler-version) CLI and the SolidStart Cloudflare Pages adapter, and ask you setup questions.

After you have installed your project dependencies, start your application:

```sh
npm run dev
```

## SolidStart Cloudflare configuration

Note

If using [`create-cloudflare` (C3)](https://www.npmjs.com/package/create-cloudflare), you can bypass adding an adapter as C3 automatically installs any necessary adapters and configures them when creating your project.

In order to configure SolidStart so that it can be deployed to Cloudflare pages, update its config file like so:

```diff
import { defineConfig } from "@solidjs/start/config";


export default defineConfig({
  server: {
    preset: "cloudflare-pages",


    rollupConfig: {
      external: ["node:async_hooks"]
    }
  }
});
```

## Before you continue

All of the framework guides assume you already have a fundamental understanding of [Git](https://git-scm.com/). If you are new to Git, refer to this [summarized Git handbook](https://guides.github.com/introduction/git-handbook/) on how to set up Git on your local machine.

If you clone with SSH, you must [generate SSH keys](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) on each computer you use to push or pull from GitHub.

Refer to the [GitHub documentation](https://guides.github.com/introduction/git-handbook/) and [Git documentation](https://git-scm.com/book/en/v2) for more information.

## Create a GitHub repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, go to your newly created project directory to prepare and push your local application to GitHub by running the following commands in your terminal:

```sh
git init
git remote add origin https://github.com/<your-gh-username>/<repository-name>
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

## Deploy with Cloudflare Pages

### Deploy via the `create-cloudflare` CLI (C3)

If you use [`create-cloudflare`(C3)](https://www.npmjs.com/package/create-cloudflare) to create your new Solid project, C3 will install all dependencies needed for your project and prompt you to deploy your project via the CLI. If you deploy, your site will be live and you will be provided with a deployment URL.

### Deploy via the Cloudflare dashboard

To deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application**.

3. Select the **Pages** tab.

4. Select **Import an existing Git repository**.

5. Select the new GitHub repository that you created and then select **Begin setup**.

6. In the **Set up builds and deployments** section, provide the following information:

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command | `npm run build` |
| Build directory | `dist` |

After configuring your site, you can begin your first deploy. You should see Cloudflare Pages installing `npm`, your project dependencies, and building your site before deploying it.

Note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/).

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`. Every time you commit new code to your Solid repository, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) on new pull requests, to preview how changes look to your site before deploying them to production.

## Learn more

By completing this guide, you have successfully deployed your Solid site to Cloudflare Pages. To get started with other frameworks, [refer to the list of Framework guides](https://developers.cloudflare.com/pages/framework-guides/).

</page>

<page>
---
title: Sphinx · Cloudflare Pages docs
description: Sphinx is a tool that makes it easy to create documentation and was
  originally made for the publication of Python documentation. It is well known
  for its simplicity and ease of use.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-a-sphinx-site/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-a-sphinx-site/index.md
---

[Sphinx](https://www.sphinx-doc.org/) is a tool that makes it easy to create documentation and was originally made for the publication of Python documentation. It is well known for its simplicity and ease of use.

In this guide, you will create a new Sphinx project and deploy it using Cloudflare Pages.

## Prerequisites

* Python 3 - Sphinx is based on Python, therefore you must have Python installed

* [pip](https://pypi.org/project/pip/) - The PyPA recommended tool for installing Python packages

* [pipenv](https://pipenv.pypa.io/en/latest/) - automatically creates and manages a virtualenv for your projects

Note

If you are already running a version of Python 3.7, ensure that Python version 3.7 is also installed on your computer before you begin this guide. Python 3.7 is the latest version supported by Cloudflare Pages.

The latest version of Python 3.7 is 3.7.11:

[Python 3.7.11](https://www.python.org/downloads/release/python-3711/)

### Installing Python

Refer to the official Python documentation for installation guidance:

* [Windows](https://www.python.org/downloads/windows/)
* [Linux/UNIX](https://www.python.org/downloads/source/)
* [macOS](https://www.python.org/downloads/macos/)
* [Other](https://www.python.org/download/other/)

### Installing Pipenv

If you already had an earlier version of Python installed before installing version 3.7, other global packages you may have installed could interfere with the following steps to install Pipenv, or your other Python projects which depend on global packages.

[Pipenv](https://pipenv.pypa.io/en/latest/) is a Python-based package manager that makes managing virtual environments simple. This guide will not require you to have prior experience with or knowledge of Pipenv to complete your Sphinx site deployment. Cloudflare Pages natively supports the use of Pipenv and, by default, has the latest version installed.

The quickest way to install Pipenv is by running the command:

```sh
pip install --user pipenv
```

This command will install Pipenv to your user level directory and will make it accessible via your terminal. You can confirm this by running the following command and reviewing the expected output:

```sh
pipenv --version
```

```sh
pipenv, version 2021.5.29
```

### Creating a Sphinx project directory

From your terminal, run the following commands to create a new directory and navigate to it:

```sh
mkdir my-wonderful-new-sphinx-project
cd my-wonderful-new-sphinx-project
```

### Pipenv with Python 3.7

Pipenv allows you to specify which version of Python to associate with a virtual environment. For the purpose of this guide, the virtual environment for your Sphinx project must use Python 3.7.

Use the following command:

```sh
pipenv --python 3.7
```

You should see the following output:

```bash
Creating a virtualenv for this project...
Pipfile: /home/ubuntu/my-wonderful-new-sphinx-project/Pipfile
Using /usr/bin/python3.7m (3.7.11) to create virtualenv...
⠸ Creating virtual environment...created virtual environment CPython3.7.11.final.0-64 in 1598ms
  creator CPython3Posix(dest=/home/ubuntu/.local/share/virtualenvs/my-wonderful-new-sphinx-project-Y2HfWoOr, clear=False, no_vcs_ignore=False, global=False)
  seeder FromAppData(download=False, pip=bundle, setuptools=bundle, wheel=bundle, via=copy, app_data_dir=/home/ubuntu/.local/share/virtualenv)
    added seed packages: pip==21.1.3, setuptools==57.1.0, wheel==0.36.2
  activators BashActivator,CShellActivator,FishActivator,PowerShellActivator,PythonActivator,XonshActivator


✔ Successfully created virtual environment!
Virtualenv location: /home/ubuntu/.local/share/virtualenvs/my-wonderful-new-sphinx-project-Y2HfWoOr
Creating a Pipfile for this project...
```

List the contents of the directory:

```sh
ls
```

```sh
Pipfile
```

### Installing Sphinx

Before installing Sphinx, create the directory you want your project to live in.

From your terminal, run the following command to install Sphinx:

```sh
pipenv install sphinx
```

You should see output similar to the following:

```bash
Installing sphinx...
Adding sphinx to Pipfile's [packages]...
✔ Installation Succeeded
Pipfile.lock not found, creating...
Locking [dev-packages] dependencies...
Locking [packages] dependencies...
Building requirements...
Resolving dependencies...
✔ Success!
Updated Pipfile.lock (763aa3)!
Installing dependencies from Pipfile.lock (763aa3)...
  🐍   ▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉ 0/0 — 00:00:00
To activate this project's virtualenv, run pipenv shell.
Alternatively, run a command inside the virtualenv with pipenv run.
```

This will install Sphinx into a new virtual environment managed by Pipenv. You should see a directory structure like this:

```bash
my-wonderful-new-sphinx-project
|--Pipfile
|--Pipfile.lock
```

## Creating a new project

With Sphinx installed, you can now run the quickstart command to create a template project for you. This command will only work within the Pipenv environment you created in the previous step. To enter that environment, run the following command from your terminal:

```sh
pipenv shell
```

```sh
Launching subshell in virtual environment...
ubuntu@sphinx-demo:~/my-wonderful-new-sphinx-project$  . /home/ubuntu/.local/share/virtualenvs/my-wonderful-new-sphinx-project-Y2HfWoOr/bin/activate
```

Now run the following command:

```sh
sphinx-quickstart
```

You will be presented with a number of questions, please answer them in the following:

```sh
Separate source and build directories (y/n) [n]: Y
Project name: <Your project name>
Author name(s): <You Author Name>
Project release []: <You can accept default here or provide a version>
Project language [en]: <You can accept en here or provide a regional language code>
```

This will create four new files in your active directory, `source/conf.py`, `index.rst`, `Makefile` and `make.bat`:

```bash
my-wonderful-new-sphinx-project
|--Pipfile
|--Pipfile.lock
|--source
|----_static
|----_templates
|----conf.py
|----index.rst
|--Makefile
|--make.bat
```

You now have everything you need to start deploying your site to Cloudflare Pages. For learning how to create documentation with Sphinx, refer to the official [Sphinx documentation](https://www.sphinx-doc.org/en/master/usage/quickstart.html).

## Before you continue

All of the framework guides assume you already have a fundamental understanding of [Git](https://git-scm.com/). If you are new to Git, refer to this [summarized Git handbook](https://guides.github.com/introduction/git-handbook/) on how to set up Git on your local machine.

If you clone with SSH, you must [generate SSH keys](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) on each computer you use to push or pull from GitHub.

Refer to the [GitHub documentation](https://guides.github.com/introduction/git-handbook/) and [Git documentation](https://git-scm.com/book/en/v2) for more information.

## Creating a GitHub repository

In a separate terminal window that is not within the pipenv shell session, verify that SSH key-based authentication is working:

```sh
eval "$(ssh-agent)"
ssh-add -T ~/.ssh/id_rsa.pub
ssh -T git@github.com
```

```sh
The authenticity of host 'github.com (140.82.113.4)' can't be established.
RSA key fingerprint is SHA256:nThbg6kXUpJWGl7E1IGOCspRomTxdCARLviKw6E5SY8.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added 'github.com,140.82.113.4' (RSA) to the list of known hosts.
Hi yourgithubusername! You've successfully authenticated, but GitHub does not provide shell access.
```

Create a new GitHub repository by visiting [repo.new](https://repo.new). After your repository is set up, push your application to GitHub by running the following commands in your terminal:

```sh
git init
git config user.name "Your Name"
git config user.email "username@domain.com"
git remote add origin git@github.com:yourgithubusername/githubrepo.git
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

## Deploy with Cloudflare Pages

To deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application**.

3. Select the **Pages** tab.

4. Select **Import an existing Git repository**.

5. Select the new GitHub repository that you created and then select **Begin setup**.

6. In the **Set up builds and deployments** section, provide the following information:

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command | `make html` |
| Build directory | `build/html` |

Below the configuration, make sure to set the environment variable for specifying the `PYTHON_VERSION`.

For example:

| Variable name | Value |
| - | - |
| PYTHON\_VERSION | 3.7 |

After configuring your site, you can begin your first deploy. You should see Cloudflare Pages installing `Pipenv`, your project dependencies, and building your site, before deployment.

Note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/).

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`. Every time you commit new code to your Sphinx site, Cloudflare Pages will automatically rebuild your project and deploy it.

You will also get access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes look to your site before deploying them to production.

## Learn more

By completing this guide, you have successfully deployed your Sphinx site to Cloudflare Pages. To get started with other frameworks, [refer to the list of Framework guides](https://developers.cloudflare.com/pages/framework-guides/).

</page>

<page>
---
title: SvelteKit · Cloudflare Pages docs
description: Learn how to create and deploy a SvelteKit application to
  Cloudflare Pages using the create-cloudflare CLI
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-a-svelte-kit-site/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-a-svelte-kit-site/index.md
---

SvelteKit is the official framework for building modern web applications with [Svelte](https://svelte.dev), an increasingly popular open-source tool for creating user interfaces. Unlike most frameworks, SvelteKit uses Svelte, a compiler that transforms your component code into efficient JavaScript, enabling SvelteKit to deliver fast, reactive applications that update the DOM surgically as the application state changes.

In this guide, you will create a new SvelteKit application and deploy it using Cloudflare Pages. You will use [`SvelteKit`](https://kit.svelte.dev/), the official Svelte framework for building web applications of all sizes.

## Setting up a new project

Use the [`create-cloudflare`](https://www.npmjs.com/package/create-cloudflare) CLI (C3) to set up a new project. C3 will create a new project directory, initiate SvelteKit's official setup tool, and provide the option to deploy instantly.

To use `create-cloudflare` to create a new SvelteKit project, run the following command:

* npm

  ```sh
  npm create cloudflare@latest -- my-svelte-app --framework=svelte --platform=pages
  ```

* yarn

  ```sh
  yarn create cloudflare my-svelte-app --framework=svelte --platform=pages
  ```

* pnpm

  ```sh
  pnpm create cloudflare@latest my-svelte-app --framework=svelte --platform=pages
  ```

SvelteKit will prompt you for customization choices. For the template option, choose one of the application/project options. The remaining answers will not affect the rest of this guide. Choose the options that suit your project.

`create-cloudflare` will then install dependencies, including the [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/#check-your-wrangler-version) CLI and the SvelteKit `@sveltejs/adapter-cloudflare` adapter, and ask you setup questions.

After you have installed your project dependencies, start your application:

```sh
npm run dev
```

## Before you continue

All of the framework guides assume you already have a fundamental understanding of [Git](https://git-scm.com/). If you are new to Git, refer to this [summarized Git handbook](https://guides.github.com/introduction/git-handbook/) on how to set up Git on your local machine.

If you clone with SSH, you must [generate SSH keys](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) on each computer you use to push or pull from GitHub.

Refer to the [GitHub documentation](https://guides.github.com/introduction/git-handbook/) and [Git documentation](https://git-scm.com/book/en/v2) for more information.

## Create a GitHub repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, go to your newly created project directory to prepare and push your local application to GitHub by running the following commands in your terminal:

```sh
git init
git remote add origin https://github.com/<your-gh-username>/<repository-name>
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

## SvelteKit Cloudflare configuration

To use SvelteKit with Cloudflare Pages, you need to add the [Cloudflare adapter](https://kit.svelte.dev/docs/adapter-cloudflare) to your application.

Note

If using [`create-cloudflare` (C3)](https://www.npmjs.com/package/create-cloudflare), you can bypass adding an adapter as C3 automatically installs any necessary adapters and configures them when creating your project.

1. Install the Cloudflare Adapter by running `npm i --save-dev @sveltejs/adapter-cloudflare` in your terminal.
2. Include the adapter in `svelte.config.js`:

```diff
 import adapter from '@sveltejs/adapter-auto';
 import adapter from '@sveltejs/adapter-cloudflare';


/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    // ... truncated ...
  }
};


export default config;
```

1. (Needed if you are using TypeScript) Include support for environment variables. The `env` object, containing KV namespaces and other storage objects, is passed to SvelteKit via the platform property along with context and caches, meaning you can access it in hooks and endpoints. For example:

```diff
declare namespace App {
    interface Locals {}


   interface Platform {
       env: {
           COUNTER: DurableObjectNamespace;
       };
       context: {
           waitUntil(promise: Promise<any>): void;
       };
       caches: CacheStorage & { default: Cache }
   }


    interface Session {}


    interface Stuff {}
}
```

1. Access the added KV or Durable objects (or generally any [binding](https://developers.cloudflare.com/pages/functions/bindings/)) in your endpoint with `env`:

```js
export async function post(context) {
  const counter = context.platform.env.COUNTER.idFromName("A");
}
```

Note

In addition to the Cloudflare adapter, review other adapters you can use in your project:

* [`@sveltejs/adapter-auto`](https://www.npmjs.com/package/@sveltejs/adapter-auto)

  SvelteKit's default adapter automatically chooses the adapter for your current environment. If you use this adapter, [no configuration is needed](https://kit.svelte.dev/docs/adapter-auto). However, the default adapter introduces a few disadvantages for local development because it has no way of knowing what platform the application is going to be deployed to.

To solve this issue, provide a `CF_PAGES` variable to SvelteKit so that the adapter can detect the Pages platform. For example, when locally building the application: `CF_PAGES=1 vite build`.

* [`@sveltejs/adapter-static`](https://www.npmjs.com/package/@sveltejs/adapter-static) Only produces client-side static assets (no server-side rendering) and is compatible with Cloudflare Pages. Review the [official SvelteKit documentation](https://kit.svelte.dev/docs/adapter-static) for instructions on how to set up the adapter. Keep in mind that if you decide to use this adapter, the build directory, instead of `.svelte-kit/cloudflare`, becomes `build`. You must also configure your Cloudflare Pages application's build directory accordingly.

Warning

If you are using any adapter different from the default SvelteKit adapter, remember to commit and push your adapter setting changes to your GitHub repository before attempting the deployment.

## Deploy with Cloudflare Pages

### Deploy via the `create-cloudflare` CLI (C3)

If you use [`create-cloudflare`(C3)](https://www.npmjs.com/package/create-cloudflare) to create your new Svelte project, C3 will install all dependencies needed for your project and prompt you to deploy your project via the CLI. If you deploy, your site will be live and you will be provided with a deployment URL.

### Deploy via the Cloudflare dashboard

To deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application**.

3. Select the **Pages** tab.

4. Select **Import an existing Git repository**.

5. Select the new GitHub repository that you created and then select **Begin setup**.

6. In the **Build settings** section, select *SvelteKit* as your **Framework preset**. Your selection will provide the following information:

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command | `npm run build` |
| Build directory | `.svelte-kit/cloudflare` |

Optionally, you can customize the **Project name** field. It defaults to the GitHub repository's name, but it does not need to match. The **Project name** value is assigned as your `*.pages.dev` subdomain.

After completing configuration, click the **Save and Deploy** button.

You will see your first deploy pipeline in progress. Pages installs all dependencies and builds the project as specified.

Cloudflare Pages will automatically rebuild your SvelteKit project and deploy it on every new pushed commit.

Additionally, you will have access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/), which repeat the build-and-deploy process for pull requests. With these, you can preview changes to your project with a real URL before deploying them to production.

Note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/).

## Functions setup

In SvelteKit, functions are written as endpoints. Functions contained in the `/functions` directory at the project's root will not be included in the deployment, which compiles to a single `_worker.js` file.

To have the functionality equivalent to Pages Functions [`onRequests`](https://developers.cloudflare.com/pages/functions/api-reference/#onrequests), you need to write standard request handlers in SvelteKit. For example, the following TypeScript file behaves like an `onRequestGet`:

```ts
import type { RequestHandler } from "./$types";


export const GET = (({ url }) => {
  return new Response(String(Math.random()));
}) satisfies RequestHandler;
```

SvelteKit API Routes

For more information about SvelteKit API Routes, refer to the [SvelteKit documentation](https://kit.svelte.dev/docs/routing#server).

## Learn more

By completing this guide, you have successfully deployed your Svelte site to Cloudflare Pages. To get started with other frameworks, [refer to the list of Framework guides](https://developers.cloudflare.com/pages/framework-guides/).

</page>

<page>
---
title: Vite 3 · Cloudflare Pages docs
description: Vite is a next-generation build tool for front-end developers. With
  the release of Vite 3, developers can make use of new command line (CLI)
  improvements, starter templates, and more to help build their front-end
  applications.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/index.md
---

[Vite](https://vitejs.dev) is a next-generation build tool for front-end developers. With [the release of Vite 3](https://vitejs.dev/blog/announcing-vite3.html), developers can make use of new command line (CLI) improvements, starter templates, and [more](https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md#300-2022-07-13) to help build their front-end applications.

Cloudflare Pages has native support for Vite 3 projects. Refer to the blog post on [improvements to the Pages build process](https://blog.cloudflare.com/cloudflare-pages-build-improvements/), including sub-second build initialization, for more information on using Vite 3 and Cloudflare Pages to optimize your application's build tooling.

In this guide, you will learn how to start a new project using Vite 3, and deploy it to Cloudflare Pages.

* npm

  ```sh
  npm create vite@latest
  ```

* yarn

  ```sh
  yarn create vite
  ```

* pnpm

  ```sh
  pnpm create vite@latest
  ```

```sh
✔ Project name: … vite-on-pages
✔ Select a framework: › vue
✔ Select a variant: › vue


Scaffolding project in ~/src/vite-on-pages...


Done. Now run:


  cd vite-on-pages
  npm install
  npm run dev
```

You will now create a new GitHub repository, and push your code using [GitHub's `gh` command line (CLI)](https://cli.github.com):

```sh
git init
```

```sh
Initialized empty Git repository in ~/vite-vue3-on-pages/.git/
```

```sh
git add .
git commit -m "Initial commit"                                           vite-vue3-on-pages/git/main +
```

```sh
[main (root-commit) dad4177] Initial commit
 14 files changed, 1452 insertions(+)
```

```sh
gh repo create
```

```sh
✓ Created repository kristianfreeman/vite-vue3-on-pages on GitHub
✓ Added remote git@github.com:kristianfreeman/vite-vue3-on-pages.git
```

```sh
git push
```

To deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application** > **Pages** > **Import from an existing Git repository**.

3. Select your new GitHub repository.

4. In the **Set up builds and deployments**, set `npm run build` as the **Build command**, and `dist` as the **Build output directory**.

After completing configuration, select **Save and Deploy**.

You will see your first deploy pipeline in progress. Pages installs all dependencies and builds the project as specified. After you have deployed your project, it will be available at the `<YOUR_PROJECT_NAME>.pages.dev` subdomain. Find your project's subdomain in **Workers & Pages** > select your Pages project > **Deployments**.

Cloudflare Pages will automatically rebuild your project and deploy it on every new pushed commit.

Additionally, you will have access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/), which repeat the build-and-deploy process for pull requests. With these, you can preview changes to your project with a real URL before deploying them to production.

## Learn more

By completing this guide, you have successfully deployed your Vite 3 site to Cloudflare Pages. To get started with other frameworks, [refer to the list of Framework guides](https://developers.cloudflare.com/pages/framework-guides/).

</page>

<page>
---
title: VitePress · Cloudflare Pages docs
description: VitePress is a static site generator (SSG) designed for building
  fast, content-centric websites. VitePress takes your source content written in
  Markdown, applies a theme to it, and generates static HTML pages that can be
  easily deployed anywhere.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-a-vitepress-site/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-a-vitepress-site/index.md
---

[VitePress](https://vitepress.dev/) is a [static site generator](https://en.wikipedia.org/wiki/Static_site_generator) (SSG) designed for building fast, content-centric websites. VitePress takes your source content written in [Markdown](https://en.wikipedia.org/wiki/Markdown), applies a theme to it, and generates static HTML pages that can be easily deployed anywhere.

In this guide, you will create a new VitePress project and deploy it using Cloudflare Pages.

## Set up a new project

VitePress ships with a command line setup wizard that will help you scaffold a basic project.

Run the following command in your terminal to create a new VitePress project:

* npm

  ```sh
  npx vitepress@latest init
  ```

* yarn

  ```sh
  yarn dlx vitepress@latest init
  ```

* pnpm

  ```sh
  pnpx vitepress@latest init
  ```

Amongst other questions, the setup wizard will ask you in which directory to save your new project, make sure to be in the project's directory and then install the `vitepress` dependency with the following command:

* npm

  ```sh
  npm i -D vitepress@latest
  ```

* yarn

  ```sh
  yarn add -D vitepress@latest
  ```

* pnpm

  ```sh
  pnpm add -D vitepress@latest
  ```

Note

If you encounter errors, make sure your local machine meets the [Prerequisites for VitePress](https://vitepress.dev/guide/getting-started#prerequisites).

Finally create a `.gitignore` file with the following content:

```plaintext
node_modules
.vitepress/cache
.vitepress/dist
```

This step makes sure that unnecessary files are not going to be included in the project's git repository (which we will set up next).

## Before you continue

All of the framework guides assume you already have a fundamental understanding of [Git](https://git-scm.com/). If you are new to Git, refer to this [summarized Git handbook](https://guides.github.com/introduction/git-handbook/) on how to set up Git on your local machine.

If you clone with SSH, you must [generate SSH keys](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) on each computer you use to push or pull from GitHub.

Refer to the [GitHub documentation](https://guides.github.com/introduction/git-handbook/) and [Git documentation](https://git-scm.com/book/en/v2) for more information.

## Create a GitHub repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, go to your newly created project directory to prepare and push your local application to GitHub by running the following commands in your terminal:

```sh
git init
git remote add origin https://github.com/<your-gh-username>/<repository-name>
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

## Deploy with Cloudflare Pages

To deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application**.

3. Select the **Pages** tab.

4. Select **Import an existing Git repository**.

5. Select the new GitHub repository that you created and then select **Begin setup**.

6. In the **Build settings** section, select *VitePress* as your **Framework preset**. Your selection will provide the following information:

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command | `npx vitepress build` |
| Build directory | `.vitepress/dist` |

After configuring your site, you can begin your first deploy. Cloudflare Pages will install `vitepress`, your project dependencies, and build your site, before deploying it.

Note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/).

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`. Every time you commit and push new code to your VitePress project, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes to your site look before deploying them to production.

## Learn more

By completing this guide, you have successfully deployed your VitePress site to Cloudflare Pages. To get started with other frameworks, [refer to the list of Framework guides](https://developers.cloudflare.com/pages/framework-guides/).

</page>

<page>
---
title: Vue · Cloudflare Pages docs
description: "Vue is a progressive JavaScript framework for building user
  interfaces. A core principle of Vue is incremental adoption: this makes it
  easy to build Vue applications that live side-by-side with your existing
  code."
lastUpdated: 2026-01-19T10:17:13.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-a-vue-site/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-a-vue-site/index.md
---

[Vue](https://vuejs.org/) is a progressive JavaScript framework for building user interfaces. A core principle of Vue is incremental adoption: this makes it easy to build Vue applications that live side-by-side with your existing code.

In this guide, you will create a new Vue application and deploy it using Cloudflare Pages. You will use `vue-cli`, a batteries-included tool for generating new Vue applications.

## Setting up a new project

Use the [`create-cloudflare`](https://www.npmjs.com/package/create-cloudflare) CLI (C3) to set up a new project. C3 will create a new project directory, initiate Vue's official setup tool, and provide the option to deploy instantly.

To use `create-cloudflare` to create a new Vue project, run the following command:

* npm

  ```sh
  npm create cloudflare@latest -- my-vue-app --framework=vue --platform=pages
  ```

* yarn

  ```sh
  yarn create cloudflare my-vue-app --framework=vue --platform=pages
  ```

* pnpm

  ```sh
  pnpm create cloudflare@latest my-vue-app --framework=vue --platform=pages
  ```

## Before you continue

All of the framework guides assume you already have a fundamental understanding of [Git](https://git-scm.com/). If you are new to Git, refer to this [summarized Git handbook](https://guides.github.com/introduction/git-handbook/) on how to set up Git on your local machine.

If you clone with SSH, you must [generate SSH keys](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) on each computer you use to push or pull from GitHub.

Refer to the [GitHub documentation](https://guides.github.com/introduction/git-handbook/) and [Git documentation](https://git-scm.com/book/en/v2) for more information.

## Create a GitHub repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, go to your newly created project directory to prepare and push your local application to GitHub by running the following commands in your terminal:

```sh
git remote add origin https://github.com/<your-gh-username>/<repository-name>
git branch -M main
git push -u origin main
```

## Deploy with Cloudflare Pages

### Deploy via the `create-cloudflare` CLI (C3)

If you use [`create-cloudflare`(C3)](https://www.npmjs.com/package/create-cloudflare) to create your new Vue project, C3 will install all dependencies needed for your project and prompt you to deploy your project via the CLI. If you deploy, your site will be live and you will be provided with a deployment URL.

### Deploy via the Cloudflare dashboard

To deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application**.

3. Select the **Pages** tab.

4. Select **Import an existing Git repository**.

5. Select the new GitHub repository that you created and then select **Begin setup**.

6. In the **Set up builds and deployments** section, provide the following information:

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command | `npm run build` |
| Build directory | `dist` |

After configuring your site, you can begin your first deploy. You should see Cloudflare Pages installing `vue`, your project dependencies, and building your site, before deploying it.

Note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/).

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`. Every time you commit new code to your Vue application, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes look to your site before deploying them to production.

## Learn more

By completing this guide, you have successfully deployed your Vue site to Cloudflare Pages. To get started with other frameworks, [refer to the list of Framework guides](https://developers.cloudflare.com/pages/framework-guides/).

</page>

<page>
---
title: Zola · Cloudflare Pages docs
description: Zola is a fast static site generator in a single binary with
  everything built-in. In this guide, you will create a new Zola application and
  deploy it using Cloudflare Pages. You will use the zola CLI to create a new
  Zola site.
lastUpdated: 2025-11-24T12:31:38.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-a-zola-site/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-a-zola-site/index.md
---

[Zola](https://www.getzola.org/) is a fast static site generator in a single binary with everything built-in. In this guide, you will create a new Zola application and deploy it using Cloudflare Pages. You will use the `zola` CLI to create a new Zola site.

## Installing Zola

First, [install](https://www.getzola.org/documentation/getting-started/installation/) the `zola` CLI, using the specific instructions for your operating system below:

### macOS (Homebrew)

If you use the package manager [Homebrew](https://brew.sh), run the `brew install` command in your terminal to install Zola:

```sh
brew install zola
```

### Windows (Chocolatey)

If you use the package manager [Chocolatey](https://chocolatey.org/), run the `choco install` command in your terminal to install Zola:

```sh
choco install zola
```

### Windows (Scoop)

If you use the package manager [Scoop](https://scoop.sh/), run the `scoop install` command in your terminal to install Zola:

```sh
scoop install zola
```

### Linux (pkg)

Your Linux distro's package manager may include Zola. If this is the case, you can install it directly using your distro's package manager -- for example, using `pkg`, run the following command in your terminal:

```sh
pkg install zola
```

If your package manager does not include Zola or you would like to download a release directly, refer to the [**Manual**](https://developers.cloudflare.com/pages/framework-guides/deploy-a-zola-site/#manual-installation) section below.

### Manual installation

The Zola GitHub repository contains pre-built versions of the Zola command-line tool for various operating systems, which can be found on [the Releases page](https://github.com/getzola/zola/releases).

For more instruction on installing these releases, refer to [Zola's install guide](https://www.getzola.org/documentation/getting-started/installation/).

## Creating a new project

With Zola installed, create a new project by running the `zola init` command in your terminal using the default template:

```sh
zola init my-zola-project
```

Upon running `zola init`, you will prompted with three questions:

1. What is the URL of your site? (<https://example.com>): You can leave this one blank for now.

2. Do you want to enable Sass compilation? \[Y/n]: Y

3. Do you want to enable syntax highlighting? \[y/N]: y

4. Do you want to build a search index of the content? \[y/N]: y

## Before you continue

All of the framework guides assume you already have a fundamental understanding of [Git](https://git-scm.com/). If you are new to Git, refer to this [summarized Git handbook](https://guides.github.com/introduction/git-handbook/) on how to set up Git on your local machine.

If you clone with SSH, you must [generate SSH keys](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) on each computer you use to push or pull from GitHub.

Refer to the [GitHub documentation](https://guides.github.com/introduction/git-handbook/) and [Git documentation](https://git-scm.com/book/en/v2) for more information.

## Create a GitHub repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, go to your newly created project directory to prepare and push your local application to GitHub by running the following commands in your terminal:

```sh
git remote add origin https://github.com/<your-gh-username>/<repository-name>
git branch -M main
git push -u origin main
```

## Deploy with Cloudflare Pages

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command | `zola build` |
| Build directory | `public` |

Below the configuration, make sure to set the **Environment Variables (advanced)** for specifying the `ZOLA_VERSION`.

For example, `ZOLA_VERSION`: `0.17.2`.

After configuring your site, you can begin your first deploy. You should see Cloudflare Pages installing `zola`, your project dependencies, and building your site, before deploying it.

Note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/).

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`.

You can now add that subdomain as the `base_url` in your `config.toml` file.

For example:

```yaml
# The URL the site will be built for
base_url = "https://my-zola-project.pages.dev"
```

Every time you commit new code to your Zola site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes look to your site before deploying them to production.

### Handling Preview Deployments

When working with Cloudflare Pages, you might use preview deployments for testing changes before merging to your main branch. However, these preview deployments use different URLs (like `https://your-branch-name.my-zola-project.pages.dev`), which can cause issues with asset loading if your `base_url` is hardcoded.

To fix this, modify your build command in the Cloudflare Pages configuration to dynamically set the base URL depending on the environment:

```sh
if [ "$CF_PAGES_BRANCH" = "main" ]; then zola build; else zola build --base-url $CF_PAGES_URL; fi
```

This command uses:

* The `base_url` set in `config.toml` when building from the `main` branch
* The preview deployment URL (automatically provided by Cloudflare Pages as `$CF_PAGES_URL`) for all other branches

## Learn more

By completing this guide, you have successfully deployed your Zola site to Cloudflare Pages. To get started with other frameworks, [refer to the list of Framework guides](https://developers.cloudflare.com/pages/framework-guides/).

</page>

<page>
---
title: Analog · Cloudflare Pages docs
description: Fullstack meta-framework for Angular, powered by Vite and Nitro.
lastUpdated: 2026-01-08T11:26:09.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-an-analog-site/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-an-analog-site/index.md
---

[Analog](https://analogjs.org/) is a fullstack meta-framework for Angular, powered by [Vite](https://vitejs.dev/) and [Nitro](https://nitro.unjs.io/).

To deploy an Analog application to Cloudflare, refer to the [Analog Workers guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/more-web-frameworks/analog/).

</page>

<page>
---
title: Angular · Cloudflare Pages docs
description: Angular is an incredibly popular framework for building reactive
  and powerful front-end applications.
lastUpdated: 2026-01-19T10:17:13.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-an-angular-site/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-an-angular-site/index.md
---

[Angular](https://angular.io/) is an incredibly popular framework for building reactive and powerful front-end applications.

In this guide, you will create a new Angular application and deploy it using Cloudflare Pages.

## Create a new project using the `create-cloudflare` CLI (C3)

Use the [`create-cloudflare`](https://www.npmjs.com/package/create-cloudflare) CLI (C3) to set up a new project. C3 will create a new project directory, initiate Angular's official setup tool, and provide the option to deploy instantly.

To use `create-cloudflare` to create a new Angular project, run the following command:

* npm

  ```sh
  npm create cloudflare@latest -- my-angular-app --framework=angular --platform=pages
  ```

* yarn

  ```sh
  yarn create cloudflare my-angular-app --framework=angular --platform=pages
  ```

* pnpm

  ```sh
  pnpm create cloudflare@latest my-angular-app --framework=angular --platform=pages
  ```

`create-cloudflare` will install dependencies, including the [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/#check-your-wrangler-version) CLI and the Cloudflare Pages adapter, and ask you setup questions.

Git integration

The initial deployment created via C3 is referred to as a [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/). To set up a deployment via the Pages Git integration, refer to the [Git Integration](#git-integration) section below.

## Git integration

In addition to [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/) deployments, you can deploy projects via [Git integration](https://developers.cloudflare.com/pages/configuration/git-integration). Git integration allows you to connect a GitHub or GitLab repository to your Pages application and have your Pages application automatically built and deployed after each new commit is pushed to it.

Git integration

Currently, you cannot add Git integration to existing Pages applications. If you have already deployed your application, you need to create a new Pages application in order to add Git integration to it.

Setup requires a basic understanding of [Git](https://git-scm.com/). If you are new to Git, refer to GitHub's [summarized Git handbook](https://guides.github.com/introduction/git-handbook/) on how to set up Git on your local machine.

### Create a GitHub repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, go to your newly created project directory to prepare and push your local application to GitHub by running the following commands in your terminal:



```sh
# Skip the following three commands if you have built your application
# using C3 or already committed your changes
git init
git add .
git commit -m "Initial commit"


git branch -M main
git remote add origin https://github.com/<YOUR_GH_USERNAME>/<REPOSITORY_NAME>
git push -u origin main
```

### Create a Pages project

To deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application**.

3. Select the **Pages** tab.

4. Select **Import an existing Git repository**.

5. Select the new GitHub repository that you created and then select **Begin setup**.

6. In the **Set up builds and deployments** section, provide the following information:

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command | `npm run build` |
| Build directory | `dist/cloudflare` |

On some versions of Angular, you may need to:

Change the `Build command` to `npx ng build --output-path dist/cloudflare`\
Change the `Build directory` to `dist/cloudflare/browser`

Optionally, you can customize the **Project name** field. It defaults to the GitHub repository's name, but it does not need to match. The **Project name** value is assigned as your `*.pages.dev` subdomain.

1. After completing configuration, select the **Save and Deploy**.

Review your first deploy pipeline in progress. Pages installs all dependencies and builds the project as specified. Cloudflare Pages will automatically rebuild your project and deploy it on every new pushed commit.

Additionally, you will have access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/), which repeat the build-and-deploy process for pull requests. With these, you can preview changes to your project with a real URL before deploying your changes to production.

## Learn more

By completing this guide, you have successfully deployed your Angular site to Cloudflare Pages. To get started with other frameworks, [refer to the list of Framework guides](https://developers.cloudflare.com/pages/framework-guides/).

</page>

<page>
---
title: Astro · Cloudflare Pages docs
description: Astro is an all-in-one web framework for building fast,
  content-focused websites. By default, Astro builds websites that have zero
  JavaScript runtime code.
lastUpdated: 2026-01-19T10:17:13.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/index.md
---

[Astro](https://astro.build) is an all-in-one web framework for building fast, content-focused websites. By default, Astro builds websites that have zero JavaScript runtime code.

Refer to the [Astro Docs](https://docs.astro.build/) to learn more about Astro or for assistance with an Astro project.

In this guide, you will create a new Astro application and deploy it using Cloudflare Pages.

### Video Tutorial

## Set up a new project

To use `create-cloudflare` to create a new Astro project, run the following command:

* npm

  ```sh
  npm create cloudflare@latest -- my-astro-app --framework=astro --platform=pages
  ```

* yarn

  ```sh
  yarn create cloudflare my-astro-app --framework=astro --platform=pages
  ```

* pnpm

  ```sh
  pnpm create cloudflare@latest my-astro-app --framework=astro --platform=pages
  ```

Astro will ask:

1. Which project type you would like to set up. Your answers will not affect the rest of this tutorial. Select an answer ideal for your project.

2. If you want to initialize a Git repository. We recommend you to select `No` and follow this guide's [Git instructions](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/#create-a-github-repository) below. If you select `Yes`, do not follow the below Git instructions precisely but adjust them to your needs.

`create-cloudflare` will then install dependencies, including the [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/#check-your-wrangler-version) CLI and the `@astrojs/cloudflare` adapter, and ask you setup questions.

### Astro configuration

You can deploy an Astro Server-side Rendered (SSR) site to Cloudflare Pages using the [`@astrojs/cloudflare` adapter](https://github.com/withastro/adapters/tree/main/packages/cloudflare#readme). SSR sites render on Pages Functions and allow for dynamic functionality and customizations.

Note

If using [`create-cloudflare` (C3)](https://www.npmjs.com/package/create-cloudflare), you can bypass adding an adapter as C3 automatically installs any necessary adapters and configures them when creating your project.

Add the [`@astrojs/cloudflare` adapter](https://github.com/withastro/adapters/tree/main/packages/cloudflare#readme) to your project's `package.json` by running:

```sh
npm run astro add cloudflare
```

## Before you continue

All of the framework guides assume you already have a fundamental understanding of [Git](https://git-scm.com/). If you are new to Git, refer to this [summarized Git handbook](https://guides.github.com/introduction/git-handbook/) on how to set up Git on your local machine.

If you clone with SSH, you must [generate SSH keys](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) on each computer you use to push or pull from GitHub.

Refer to the [GitHub documentation](https://guides.github.com/introduction/git-handbook/) and [Git documentation](https://git-scm.com/book/en/v2) for more information.

## Create a GitHub repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, go to your newly created project directory to prepare and push your local application to GitHub by running the following commands in your terminal:

```sh
git init
git remote add origin https://github.com/<your-gh-username>/<repository-name>
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

## Deploy with Cloudflare Pages

### Deploy via the `create-cloudflare` CLI (C3)

If you use [`create-cloudflare`(C3)](https://www.npmjs.com/package/create-cloudflare) to create your new Astro project, C3 will install all dependencies needed for your project and prompt you to deploy your project via the CLI. If you deploy, your site will be live and you will be provided with a deployment URL.

### Deploy via the Cloudflare dashboard

To deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application**.

3. Select the **Pages** tab.

4. Select **Import an existing Git repository**.

5. Select the new GitHub repository that you created and then select **Begin setup**.

6. In the **Set up builds and deployments** section, provide the following information:

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command | `npm run build` |
| Build directory | `dist` |

Optionally, you can customize the **Project name** field. It defaults to the GitHub repository's name, but it does not need to match. The **Project name** value is assigned as your `*.pages.dev` subdomain.

After completing configuration, select **Save and Deploy**.

You will see your first deployment in progress. Pages installs all dependencies and builds the project as specified.

Cloudflare Pages will automatically rebuild your project and deploy it on every new pushed commit.

Additionally, you will have access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/), which repeat the build-and-deploy process for pull requests. With these, you can preview changes to your project with a real URL before deploying them to production.

Note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/).

### Local runtime

Local runtime support is configured via the `platformProxy` option:

```js
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";


export default defineConfig({
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
});
```

## Use bindings in your Astro application

A [binding](https://developers.cloudflare.com/pages/functions/bindings/) allows your application to interact with Cloudflare developer products, such as [KV](https://developers.cloudflare.com/kv/concepts/how-kv-works/), [Durable Object](https://developers.cloudflare.com/durable-objects/), [R2](https://developers.cloudflare.com/r2/), and [D1](https://blog.cloudflare.com/introducing-d1/).

Use bindings in Astro components and API routes by using `context.locals` from [Astro Middleware](https://docs.astro.build/en/guides/middleware/) to access the Cloudflare runtime which amongst other fields contains the Cloudflare's environment and consecutively any bindings set for your application.

Refer to the following example of how to access a KV namespace with TypeScript.

First, you need to define Cloudflare runtime and KV type by updating the `env.d.ts`. Make sure you have generated Cloudflare runtime types by running [`wrangler types`](https://developers.cloudflare.com/pages/functions/typescript/).

```typescript
/// <reference types="astro/client" />


type ENV = {
  // replace `MY_KV` with your KV namespace
  MY_KV: KVNamespace;
};


// use a default runtime configuration (advanced mode).
type Runtime = import("@astrojs/cloudflare").Runtime<ENV>;
declare namespace App {
  interface Locals extends Runtime {}
}
```

You can then access your KV from an API endpoint in the following way:

```typescript
import type { APIContext } from "astro";


export async function get({ locals }: APIContext) {
  const { MY_KV } = locals.runtime.env;


  return {
    // ...
  };
}
```

Besides endpoints, you can also use bindings directly from your Astro components:

```typescript
---
const myKV = Astro.locals.runtime.env.MY_KV;
const value = await myKV.get("key");
---
<div>{value}</div>
```

To learn more about the Astro Cloudflare runtime, refer to the [Access to the Cloudflare runtime](https://docs.astro.build/en/guides/integrations-guide/cloudflare/#access-to-the-cloudflare-runtime) in the Astro documentation.

## Learn more

By completing this guide, you have successfully deployed your Astro site to Cloudflare Pages. To get started with other frameworks, [refer to the list of Framework guides](https://developers.cloudflare.com/pages/framework-guides/).

</page>

<page>
---
title: Elder.js · Cloudflare Pages docs
description: Elder.js is an SEO-focused framework for building static sites with SvelteKit.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-an-elderjs-site/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-an-elderjs-site/index.md
---

[Elder.js](https://elderguide.com/tech/elderjs/) is an SEO-focused framework for building static sites with [SvelteKit](https://developers.cloudflare.com/pages/framework-guides/deploy-a-svelte-kit-site/).

In this guide, you will create a new Elder.js application and deploy it using Cloudflare Pages.

## Setting up a new project

Create a new project using [`npx degit Elderjs/template`](https://docs.npmjs.com/cli/v6/commands/npm-init), giving it a project name:

```sh
npx degit Elderjs/template elderjs-app
cd elderjs-app
```

The Elder.js template includes a number of pages and examples showing how to build your static site, but by simply generating the project, it is already ready to be deployed to Cloudflare Pages.

## Before you continue

All of the framework guides assume you already have a fundamental understanding of [Git](https://git-scm.com/). If you are new to Git, refer to this [summarized Git handbook](https://guides.github.com/introduction/git-handbook/) on how to set up Git on your local machine.

If you clone with SSH, you must [generate SSH keys](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) on each computer you use to push or pull from GitHub.

Refer to the [GitHub documentation](https://guides.github.com/introduction/git-handbook/) and [Git documentation](https://git-scm.com/book/en/v2) for more information.

## Create a GitHub repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, go to your newly created project directory to prepare and push your local application to GitHub by running the following commands in your terminal:

```sh
git init
git remote add origin https://github.com/<your-gh-username>/<repository-name>
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

## Deploy with Cloudflare Pages

To deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application**.

3. Select the **Pages** tab.

4. Select **Import an existing Git repository**.

5. Select the new GitHub repository that you created and then select **Begin setup**.

6. In the **Build settings** section, select *Elder.js* as your **Framework preset**. Your selection will provide the following information:

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command | `npm run build` |
| Build directory | `public` |

Optionally, you can customize the **Project name** field. It defaults to the GitHub repository's name, but it does not need to match. The **Project name** value is assigned as your `*.pages.dev` subdomain.

### Finalize Setup

After completing configuration, click the **Save and Deploy** button.

You will see your first deploy pipeline in progress. Pages installs all dependencies and builds the project as specified.

Cloudflare Pages will automatically rebuild your project and deploy it on every new pushed commit.

Additionally, you will have access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/), which repeat the build-and-deploy process for pull requests. With these, you can preview changes to your project with a real URL before deploying them to production.

Note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/).

## Learn more

By completing this guide, you have successfully deployed your Elder.js site to Cloudflare Pages. To get started with other frameworks, [refer to the list of Framework guides](https://developers.cloudflare.com/pages/framework-guides/).

</page>

<page>
---
title: Eleventy · Cloudflare Pages docs
description: Eleventy is a simple static site generator. In this guide, you will
  create a new Eleventy site and deploy it using Cloudflare Pages. You will be
  using the eleventy CLI to create a new Eleventy site.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-an-eleventy-site/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-an-eleventy-site/index.md
---

[Eleventy](https://www.11ty.dev/) is a simple static site generator. In this guide, you will create a new Eleventy site and deploy it using Cloudflare Pages. You will be using the `eleventy` CLI to create a new Eleventy site.

## Installing Eleventy

Install the `eleventy` CLI by running the following command in your terminal:

```sh
npm install -g @11ty/eleventy
```

## Creating a new project

There are a lot of [starter projects](https://www.11ty.dev/docs/starter/) available on the Eleventy website. As an example, use the `eleventy-base-blog` project by running the following commands in your terminal:

```sh
git clone https://github.com/11ty/eleventy-base-blog.git my-blog-name
cd my-blog-name
npm install
```

## Before you continue

All of the framework guides assume you already have a fundamental understanding of [Git](https://git-scm.com/). If you are new to Git, refer to this [summarized Git handbook](https://guides.github.com/introduction/git-handbook/) on how to set up Git on your local machine.

If you clone with SSH, you must [generate SSH keys](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) on each computer you use to push or pull from GitHub.

Refer to the [GitHub documentation](https://guides.github.com/introduction/git-handbook/) and [Git documentation](https://git-scm.com/book/en/v2) for more information.

## Creating a GitHub repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, prepare and push your local application to GitHub by running the following command in your terminal:

```sh
git remote set-url origin https://github.com/yourgithubusername/githubrepo
git branch -M main
git push -u origin main
```

## Deploy with Cloudflare Pages

To deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application**.

3. Select the **Pages** tab.

4. Select **Import an existing Git repository**.

5. Select the new GitHub repository that you created and then select **Begin setup**.

6. In the **Build settings** section, select *Eleventy* as your **Framework preset**. Your selection will provide the following information:

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command | `npx @11ty/eleventy` |
| Build directory | `_site` |

Note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/).

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`. Every time you commit new code to your Eleventy site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes look to your site before deploying them to production.

## Learn more

By completing this guide, you have successfully deployed your Eleventy site to Cloudflare Pages. To get started with other frameworks, [refer to the list of Framework guides](https://developers.cloudflare.com/pages/framework-guides/).

</page>

<page>
---
title: Ember · Cloudflare Pages docs
description: Ember.js is a productive, battle-tested JavaScript framework for
  building modern web applications. It includes everything you need to build
  rich UIs that work on any device.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-an-emberjs-site/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-an-emberjs-site/index.md
---

[Ember.js](https://emberjs.com) is a productive, battle-tested JavaScript framework for building modern web applications. It includes everything you need to build rich UIs that work on any device.

## Install Ember

To begin, install Ember:

```sh
npm install -g ember-cli
```

## Create an Ember project

Use the `ember new` command to create a new application:

```sh
npx ember new ember-quickstart --lang en
```

After the application is generated, change the directory to your project and run your project by running the following commands:

```sh
cd ember-quickstart
npm start
```

## Before you continue

All of the framework guides assume you already have a fundamental understanding of [Git](https://git-scm.com/). If you are new to Git, refer to this [summarized Git handbook](https://guides.github.com/introduction/git-handbook/) on how to set up Git on your local machine.

If you clone with SSH, you must [generate SSH keys](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) on each computer you use to push or pull from GitHub.

Refer to the [GitHub documentation](https://guides.github.com/introduction/git-handbook/) and [Git documentation](https://git-scm.com/book/en/v2) for more information.

## Create a GitHub repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, go to your newly created project directory to prepare and push your local application to GitHub by running the following commands in your terminal:

```sh
git remote add origin https://github.com/<your-gh-username>/<repository-name>
git branch -M main
git push -u origin main
```

## Deploy with Cloudflare Pages

To deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application**.

3. Select the **Pages** tab.

4. Select **Import an existing Git repository**.

5. Select the new GitHub repository that you created and then select **Begin setup**.

6. In the **Build settings** section, select *Ember.js* as your **Framework preset**. Your selection will provide the following information:

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command | `npx ember-cli build` |
| Build directory | `dist` |

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`.

Every time you commit new code to your Ember site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) on new pull requests and be able to preview how changes to your site look before deploying them to production.

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/).

## Learn more

By completing this guide, you have successfully deployed your Ember site to Cloudflare Pages. To get started with other frameworks, [refer to the list of Framework guides](https://developers.cloudflare.com/pages/framework-guides/).

</page>

<page>
---
title: MkDocs · Cloudflare Pages docs
description: MkDocs is a modern documentation platform where teams can document
  products, internal knowledge bases and APIs.
lastUpdated: 2026-01-19T10:17:13.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-an-mkdocs-site/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-an-mkdocs-site/index.md
---

[MkDocs](https://www.mkdocs.org/) is a modern documentation platform where teams can document products, internal knowledge bases and APIs.

## Install MkDocs

MkDocs requires a recent version of Python and the Python package manager, pip, to be installed on your system. To install pip, refer to the [MkDocs Installation guide](https://www.mkdocs.org/user-guide/installation/). With pip installed, run:

```sh
pip install mkdocs
```

## Create an MkDocs project

Use the `mkdocs new` command to create a new application:

```sh
mkdocs new <PROJECT_NAME>
```

Then `cd` into your project, take MkDocs and its dependencies and put them into a `requirements.txt` file:

```sh
pip freeze > requirements.txt
```

## Before you continue

All of the framework guides assume you already have a fundamental understanding of [Git](https://git-scm.com/). If you are new to Git, refer to this [summarized Git handbook](https://guides.github.com/introduction/git-handbook/) on how to set up Git on your local machine.

If you clone with SSH, you must [generate SSH keys](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) on each computer you use to push or pull from GitHub.

Refer to the [GitHub documentation](https://guides.github.com/introduction/git-handbook/) and [Git documentation](https://git-scm.com/book/en/v2) for more information.

## Create a GitHub repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, go to your newly created project directory to prepare and push your local application to GitHub by running the following commands in your terminal:

```sh
git init
git remote add origin https://github.com/<your-gh-username>/<repository-name>
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

You have successfully created a GitHub repository and pushed your MkDocs project to that repository.

## Deploy with Cloudflare Pages

To deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application**.

3. Select the **Pages** tab.

4. Select **Import an existing Git repository**.

5. Select the new GitHub repository that you created and then select **Begin setup**.

6. In the **Set up builds and deployments** section, provide the following information:

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command | `mkdocs build` |
| Build directory | `site` |

1. Go to **Environment variables (advanced)** > **Add variable** > and add the variable `PYTHON_VERSION` with a value of `3.7`.

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`.

Every time you commit new code to your MkDocs site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) on new pull requests and be able to preview how changes to your site look before deploying them to production.

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/).

## Learn more

By completing this guide, you have successfully deployed your MkDocs site to Cloudflare Pages. To get started with other frameworks, [refer to the list of Framework guides](https://developers.cloudflare.com/pages/framework-guides/).

</page>

<page>
---
title: Static HTML · Cloudflare Pages docs
description: Cloudflare supports deploying any static HTML website to Cloudflare
  Pages. If you manage your website without using a framework or static site
  generator, or if your framework is not listed in Framework guides, you can
  still deploy it using this guide.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/deploy-anything/
  md: https://developers.cloudflare.com/pages/framework-guides/deploy-anything/index.md
---

Cloudflare supports deploying any static HTML website to Cloudflare Pages. If you manage your website without using a framework or static site generator, or if your framework is not listed in [Framework guides](https://developers.cloudflare.com/pages/framework-guides/), you can still deploy it using this guide.

## Before you continue

All of the framework guides assume you already have a fundamental understanding of [Git](https://git-scm.com/). If you are new to Git, refer to this [summarized Git handbook](https://guides.github.com/introduction/git-handbook/) on how to set up Git on your local machine.

If you clone with SSH, you must [generate SSH keys](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) on each computer you use to push or pull from GitHub.

Refer to the [GitHub documentation](https://guides.github.com/introduction/git-handbook/) and [Git documentation](https://git-scm.com/book/en/v2) for more information.

## Create a GitHub repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, go to your newly created project directory to prepare and push your local application to GitHub by running the following commands in your terminal:

```sh
git init
git remote add origin https://github.com/<your-gh-username>/<repository-name>
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

## Deploy with Cloudflare Pages

To deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application**.

3. Select the **Pages** tab.

4. Select **Import an existing Git repository**.

5. Select the new GitHub repository that you created and then select **Begin setup**.

6. In the **Set up builds and deployments** section, provide the following information:

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command (optional) | `exit 0` |
| Build output directory | `<YOUR_BUILD_DIR>` |

Unlike many of the framework guides, the build command and build output directory for your site are going to be completely custom. If you are not using a preset and do not need to build your site, use `exit 0` as your **Build command**. Cloudflare recommends using `exit 0` as your **Build command** to access features such as Pages Functions. The **Build output directory** is where your application's content lives.

After configuring your site, you can begin your first deploy. Your custom build command (if provided) will run, and Pages will deploy your static site.

Note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/).

After you have deployed your site, you will receive a unique subdomain for your project on `*.pages.dev`. Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes look to your site before deploying them to production.

Getting 404 errors on \*.pages.dev?

If you are getting `404` errors when visiting your `*.pages.dev` domain, make sure your website has a top-level file for `index.html`. This `index.html` is what Pages will serve on your apex with no page specified.

## Learn more

By completing this guide, you have successfully deployed your site to Cloudflare Pages. To get started with other frameworks, [refer to the list of Framework guides](https://developers.cloudflare.com/pages/framework-guides/).

</page>

<page>
---
title: Next.js · Cloudflare Pages docs
description: React framework for building full-stack web applications.
lastUpdated: 2025-09-17T18:05:52.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/nextjs/
  md: https://developers.cloudflare.com/pages/framework-guides/nextjs/index.md
---

[Next.js](https://nextjs.org) is an open-source React framework for creating websites and applications.

If you want to deploy a full stack Server Side Rendered Next.js application please refer to the [Next.js Workers guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs).

To instead deploy a static Next.js site using Pages see the [static Next.js Pages guide](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site).

</page>

<page>
---
title: Create projects with C3 CLI · Cloudflare Pages docs
description: Use C3 (`create-cloudflare` CLI) to set up and deploy new
  applications using framework-specific setup guides to ensure each new
  application follows Cloudflare and any third-party best practices for
  deployment.
lastUpdated: 2026-01-08T11:26:09.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/get-started/c3/
  md: https://developers.cloudflare.com/pages/get-started/c3/index.md
---

Cloudflare provides a CLI command for creating new Workers and Pages projects — `npm create cloudflare`, powered by the [`create-cloudflare` package](https://www.npmjs.com/package/create-cloudflare).

## Create a new application

Open a terminal window and run:

* npm

  ```sh
  npm create cloudflare@latest -- --platform=pages
  ```

* yarn

  ```sh
  yarn create cloudflare --platform=pages
  ```

* pnpm

  ```sh
  pnpm create cloudflare@latest --platform=pages
  ```

Running this command will prompt you to install the [`create-cloudflare`](https://www.npmjs.com/package/create-cloudflare) package, and then ask you questions about the type of application you wish to create.

Note

To create a Pages project you must now specify the `--platform=pages` arg, otherwise C3 will always create a Workers project.

## Web frameworks

If you choose the "Framework Starter" option, you will be prompted to choose a framework to use. The following frameworks are currently supported:

* [Angular](https://developers.cloudflare.com/pages/framework-guides/deploy-an-angular-site/)
* [Astro](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/)
* [Docusaurus](https://developers.cloudflare.com/pages/framework-guides/deploy-a-docusaurus-site/)
* [Gatsby](https://developers.cloudflare.com/pages/framework-guides/deploy-a-gatsby-site/)
* [Hono](https://developers.cloudflare.com/pages/framework-guides/deploy-a-hono-site/)
* [Next.js](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
* [Nuxt](https://developers.cloudflare.com/pages/framework-guides/deploy-a-nuxt-site/)
* [Qwik](https://developers.cloudflare.com/pages/framework-guides/deploy-a-qwik-site/)
* [React](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/)
* [Remix](https://developers.cloudflare.com/pages/framework-guides/deploy-a-remix-site/)
* [SolidStart](https://developers.cloudflare.com/pages/framework-guides/deploy-a-solid-start-site/)
* [SvelteKit](https://developers.cloudflare.com/pages/framework-guides/deploy-a-svelte-kit-site/)
* [Vue](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vue-site/)

When you use a framework, `npm create cloudflare` directly uses the framework's own command for generating a new projects, which may prompt additional questions. This ensures that the project you create is up-to-date with the latest version of the framework, and you have all the same options when creating you project via `npm create cloudflare` that you would if you created your project using the framework's tooling directly.

## Deploy

Once your project has been configured, you will be asked if you would like to deploy the project to Cloudflare. This is optional.

If you choose to deploy, you will be asked to sign into your Cloudflare account (if you aren't already), and your project will be deployed.

## Creating a new Pages project that is connected to a git repository

To create a new project using `npm create cloudflare`, and then connect it to a Git repository on your Github or Gitlab account, take the following steps:

1. Run `npm create cloudflare@latest`, and choose your desired options
2. Select `no` to the prompt, "Do you want to deploy your application?". This is important — if you select `yes` and deploy your application from your terminal ([Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)), then it will not be possible to connect this Pages project to a git repository later on. You will have to create a new Cloudflare Pages project.
3. Create a new git repository, using the application that `npm create cloudflare@latest` just created for you.
4. Follow the steps outlined in the [Git integration guide](https://developers.cloudflare.com/pages/get-started/git-integration/)

## CLI Arguments

C3 collects any required input through a series of interactive prompts. You may also specify your choices via command line arguments, which will skip these prompts. To use C3 in a non-interactive context such as CI, you must specify all required arguments via the command line.

This is the full format of a C3 invocation alongside the possible CLI arguments:

* npm

  ```sh
  npm create cloudflare@latest -- --platform=pages [<DIRECTORY>] [OPTIONS] [-- <NESTED ARGS...>]
  ```

* yarn

  ```sh
  yarn create cloudflare --platform=pages [<DIRECTORY>] [OPTIONS] [-- <NESTED ARGS...>]
  ```

* pnpm

  ```sh
  pnpm create cloudflare@latest --platform=pages [<DIRECTORY>] [OPTIONS] [-- <NESTED ARGS...>]
  ```

- `DIRECTORY` string optional

  * The directory where the application should be created. The name of the application is taken from the directory name.

- `NESTED ARGS..` string\[] optional

  * CLI arguments to pass to eventual third party CLIs C3 might invoke (in the case of full-stack applications).

- `--category` string optional

  * The kind of templates that should be created.

  * The possible values for this option are:

    * `hello-world`: Hello World example
    * `web-framework`: Framework Starter
    * `demo`: Application Starter
    * `remote-template`: Template from a GitHub repo

- `--type` string optional

  * The type of application that should be created.

  * The possible values for this option are:

    * `hello-world`: A basic "Hello World" Cloudflare Worker.
    * `hello-world-durable-object`: A [Durable Object](https://developers.cloudflare.com/durable-objects/) and a Worker to communicate with it.
    * `common`: A Cloudflare Worker which implements a common example of routing/proxying functionalities.
    * `scheduled`: A scheduled Cloudflare Worker (triggered via [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)).
    * `queues`: A Cloudflare Worker which is both a consumer and produced of [Queues](https://developers.cloudflare.com/queues/).
    * `openapi`: A Worker implementing an OpenAPI REST endpoint.
    * `pre-existing`: Fetch a Worker initialized from the Cloudflare dashboard.

- `--framework` string optional

  * The type of framework to use to create a web application (when using this option, `--type` is ignored).

  * The possible values for this option are:

    * `angular`
    * `astro`
    * `docusaurus`
    * `gatsby`
    * `hono`
    * `next`
    * `nuxt`
    * `qwik`
    * `react`
    * `remix`
    * `solid`
    * `svelte`
    * `vue`

- `--template` string optional

  * Create a new project via an external template hosted in a git repository

  * The value for this option may be specified as any of the following:

    * `user/repo`
    * `git@github.com:user/repo`
    * `https://github.com/user/repo`
    * `user/repo/some-template` (subdirectories)
    * `user/repo#canary` (branches)
    * `user/repo#1234abcd` (commit hash)
    * `bitbucket:user/repo` (BitBucket)
    * `gitlab:user/repo` (GitLab)

    See the `degit` [docs](https://github.com/Rich-Harris/degit) for more details.

    At a minimum, templates must contain the following:

    * `package.json`
    * [Wrangler configuration file](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)
    * `src/` containing a worker script referenced from the Wrangler configuration file

    See the [templates folder](https://github.com/cloudflare/workers-sdk/tree/main/packages/create-cloudflare/templates) of this repo for more examples.

- `--deploy` boolean (default: true) optional

  * Deploy your application after it has been created.

- `--lang` string (default: ts) optional

  * The programming language of the template.

  * The possible values for this option are:

    * `ts`
    * `js`
    * `python`

- `--ts` boolean (default: true) optional

  * Use TypeScript in your application. Deprecated. Use `--lang=ts` instead.

- `--git` boolean (default: true) optional

  * Initialize a local git repository for your application.

- `--open` boolean (default: true) optional

  * Open with your browser the deployed application (this option is ignored if the application is not deployed).

- `--existing-script` string optional

  * The name of an existing Cloudflare Workers script to clone locally. When using this option, `--type` is coerced to `pre-existing`.

  * When `--existing-script` is specified, `deploy` will be ignored.

- `-y`, `--accept-defaults` boolean optional

  * Use all the default C3 options each can also be overridden by specifying it.

- `--auto-update` boolean (default: true) optional

  * Automatically uses the latest version of C3.

- `-v`, `--version` boolean optional

  * Show version number.

- `-h`, `--help` boolean optional

  * Show a help message.

Note

All the boolean options above can be specified with or without a value, for example `--open` and `--open true` have the same effect, prefixing `no-` to the option's name negates it, so for example `--no-open` and `--open false` have the same effect.

## Telemetry

Cloudflare collects anonymous usage data to improve `create-cloudflare` over time. Read more about this in our [data policy](https://github.com/cloudflare/workers-sdk/blob/main/packages/create-cloudflare/telemetry.md).

You can opt-out if you do not wish to share any information.

* npm

  ```sh
  npm create cloudflare@latest -- telemetry disable
  ```

* yarn

  ```sh
  yarn create cloudflare telemetry disable
  ```

* pnpm

  ```sh
  pnpm create cloudflare@latest telemetry disable
  ```

Alternatively, you can set an environment variable:

```sh
export CREATE_CLOUDFLARE_TELEMETRY_DISABLED=1
```

You can check the status of telemetry collection at any time.

* npm

  ```sh
  npm create cloudflare@latest -- telemetry status
  ```

* yarn

  ```sh
  yarn create cloudflare telemetry status
  ```

* pnpm

  ```sh
  pnpm create cloudflare@latest telemetry status
  ```

You can always re-enable telemetry collection.

* npm

  ```sh
  npm create cloudflare@latest -- telemetry enable
  ```

* yarn

  ```sh
  yarn create cloudflare telemetry enable
  ```

* pnpm

  ```sh
  pnpm create cloudflare@latest telemetry enable
  ```

</page>

<page>
---
title: Direct Upload · Cloudflare Pages docs
description: Upload your prebuilt assets to Pages and deploy them via the
  Wrangler CLI or the Cloudflare dashboard.
lastUpdated: 2026-01-12T11:18:52.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/get-started/direct-upload/
  md: https://developers.cloudflare.com/pages/get-started/direct-upload/index.md
---

Direct Upload enables you to upload your prebuilt assets to Pages and deploy them to the Cloudflare global network. You should choose Direct Upload over Git integration if you want to [integrate your own build platform](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/) or upload from your local computer.

This guide will instruct you how to upload your assets using Wrangler or the drag and drop method.

You cannot switch to Git integration later

If you choose Direct Upload, you cannot switch to [Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/) later. You will have to create a new project with Git integration to use automatic deployments.

## Prerequisites

Before you deploy your project with Direct Upload, run the appropriate [build command](https://developers.cloudflare.com/pages/configuration/build-configuration/#framework-presets) to build your project.

## Upload methods

After you have your prebuilt assets ready, there are two ways to begin uploading:

* [Wrangler](https://developers.cloudflare.com/pages/get-started/direct-upload/#wrangler-cli).
* [Drag and drop](https://developers.cloudflare.com/pages/get-started/direct-upload/#drag-and-drop).

Note

Within a Direct Upload project, you can switch between creating deployments with either Wrangler or drag and drop. For existing Git-integrated projects, you can manually create deployments using [`wrangler deploy`](https://developers.cloudflare.com/workers/wrangler/commands/#deploy). However, you cannot use drag and drop on the dashboard with existing Git-integrated projects.

## Supported file types

Below is the supported file types for each Direct Upload options:

* Wrangler: A single folder of assets. (Zip files are not supported.)
* Drag and drop: A zip file or single folder of assets.

## Wrangler CLI

### Set up Wrangler

To begin, install [`npm`](https://docs.npmjs.com/getting-started). Then [install Wrangler, the Developer Platform CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/).

#### Create your project

Log in to Wrangler with the [`wrangler login` command](https://developers.cloudflare.com/workers/wrangler/commands/#login). Then run the [`pages project create` command](https://developers.cloudflare.com/workers/wrangler/commands/#project-create):

```sh
npx wrangler pages project create
```

You will then be prompted to specify the project name. Your project will be served at `<PROJECT_NAME>.pages.dev` (or your project name plus a few random characters if your project name is already taken). You will also be prompted to specify your production branch.

Subsequent deployments will reuse both of these values (saved in your `node_modules/.cache/wrangler` folder).

#### Deploy your assets

From here, you have created an empty project and can now deploy your assets for your first deployment and for all subsequent deployments in your production environment. To do this, run the [`wrangler pages deploy`](https://developers.cloudflare.com/workers/wrangler/commands/#deploy-1) command:

```sh
npx wrangler pages deploy <BUILD_OUTPUT_DIRECTORY>
```

Find the appropriate build output directory for your project in [Build directory under Framework presets](https://developers.cloudflare.com/pages/configuration/build-configuration/#framework-presets).

Your production deployment will be available at `<PROJECT_NAME>.pages.dev`.

Note

Before using the `wrangler pages deploy` command, you will need to make sure you are inside the project. If not, you can also pass in the project path.

To deploy assets to a preview environment, run:

```sh
npx wrangler pages deploy <OUTPUT_DIRECTORY> --branch=<BRANCH_NAME>
```

For every branch you create, a branch alias will be available to you at `<BRANCH_NAME>.<PROJECT_NAME>.pages.dev`.

Note

If you are in a Git workspace, Wrangler will automatically pull the branch information for you. Otherwise, you will need to specify your branch in this command.

If you would like to streamline the project creation and asset deployment steps, you can also use the deploy command to both create and deploy assets at the same time. If you execute this command first, you will still be prompted to specify your project name and production branch. These values will still be cached for subsequent deployments as stated above. If the cache already exists and you would like to create a new project, you will need to run the [`create` command](#create-your-project).

#### Other useful commands

If you would like to use Wrangler to obtain a list of all available projects for Direct Upload, use [`pages project list`](https://developers.cloudflare.com/workers/wrangler/commands/#project-list):

```sh
npx wrangler pages project list
```

If you would like to use Wrangler to obtain a list of all unique preview URLs for a particular project, use [`pages deployment list`](https://developers.cloudflare.com/workers/wrangler/commands/#deployment-list):

```sh
npx wrangler pages deployment list
```

For step-by-step directions on how to use Wrangler and continuous integration tools like GitHub Actions, Circle CI, and Travis CI together for continuous deployment, refer to [Use Direct Upload with continuous integration](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/).

## Drag and drop

#### Deploy your project with drag and drop

To deploy with drag and drop:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application** > **Get started** > **Drag and drop your files**.

3. Enter your project name in the provided field and drag and drop your assets.

4. Select **Deploy site**.

Your project will be served from `<PROJECT_NAME>.pages.dev`. Next drag and drop your build output directory into the uploading frame. Once your files have been successfully uploaded, select **Save and Deploy** and continue to your newly deployed project.

#### Create a new deployment

After you have your project created, select **Create a new deployment** to begin a new version of your site. Next, choose whether your new deployment will be made to your production or preview environment. If choosing preview, you can create a new deployment branch or enter an existing one.

## Troubleshoot

### Limits

| Upload method | File limit | File size |
| - | - | - |
| Wrangler | 20,000 files | 25 MiB |
| Drag and drop | 1,000 files | 25 MiB |

If using the drag and drop method, a red warning symbol will appear next to an asset if too large and thus unsuccessfully uploaded. In this case, you may choose to delete that asset but you cannot replace it. In order to do so, you must reupload the entire project.

### Production branch configuration

If your project is a [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/) project, you will not have the option to configure production branch controls. To update your production branch, you will need to manually call the [Update Project](https://developers.cloudflare.com/api/resources/pages/subresources/projects/methods/edit/) endpoint in the API.

```bash
curl --request PATCH \
"https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/{project_name}" \
--header "Authorization: Bearer <API_TOKEN>" \
--header "Content-Type: application/json" \
--data "{\"production_branch\": \"main\"}"
```

### Functions

Drag and drop deployments made from the Cloudflare dashboard do not currently support compiling a `functions` folder of [Pages Functions](https://developers.cloudflare.com/pages/functions/). To deploy a `functions` folder, you must use Wrangler. When deploying a project using Wrangler, if a `functions` folder exists where the command is run, that `functions` folder will be uploaded with the project.

However, note that a `_worker.js` file is supported by both Wrangler and drag and drop deployments made from the dashboard.

</page>

<page>
---
title: Git integration guide · Cloudflare Pages docs
description: Connect your Git provider to Pages.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/get-started/git-integration/
  md: https://developers.cloudflare.com/pages/get-started/git-integration/index.md
---

In this guide, you will get started with Cloudflare Pages and deploy your first website to the Pages platform through Git integration. The Git integration enables automatic builds and deployments every time you push a change to your connected [GitHub](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/) or [GitLab](https://developers.cloudflare.com/pages/configuration/git-integration/gitlab-integration/) repository.

You cannot switch to Direct Upload later

If you deploy using the Git integration, you cannot switch to [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/) later. However, if you already use a Git-integrated project and do not want to trigger deployments every time you push a commit, you can [disable automatic deployments](https://developers.cloudflare.com/pages/configuration/git-integration/#disable-automatic-deployments) on all branches. Then, you can use Wrangler to deploy directly to your Pages projects and make changes to your Git repository without automatically triggering a build.

## Connect your Git provider to Pages

Pages offers support for [GitHub](https://github.com/) and [GitLab](https://gitlab.com/). To create your first Pages project:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application** > **Pages** > **Connect to Git**.

You will be prompted to sign in with your preferred Git provider. This allows Cloudflare Pages to deploy your projects, and update your PRs with [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/).

Note

Signing in with GitLab will grant Pages access to all repositories on your account. Additionally, if you are a part of a multi-user Cloudflare account, and you sign in with GitLab, other members will also have the ability to deploy your repositories to Pages.

If you are using GitLab, you must have the **Maintainer** role or higher on the repository to successfully deploy with Cloudflare Pages.

### Select your GitHub repository

You can select a GitHub project from your personal account or an organization you have given Pages access to. This allows you to choose a GitHub repository to deploy using Pages. Both private and public repositories are supported.

### Select your GitLab repository

If using GitLab, you can select a project from your personal account or from a GitLab group you belong to. This allows you to choose a GitLab repository to deploy using Pages. Both private and public repositories are supported.

## Configure your deployment

Once you have selected a Git repository, select **Install & Authorize** and **Begin setup**. You can then customize your deployment in **Set up builds and deployments**.

Your **project name** will be used to generate your project's hostname. By default, this matches your Git project name.

**Production branch** indicates the branch that Cloudflare Pages should use to deploy the production version of your site. For most projects, this is the `main` or `master` branch. All other branches that are not your production branch will be used for [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/).

Note

You must have pushed at least one branch to your GitHub or GitLab project in order to select a **Production branch** from the dropdown menu.

![Set up builds and deployments page with Project name and Production branch filled in](https://developers.cloudflare.com/_astro/configuration.C_N8MiKW_1LELMX.webp)

### Configure your build settings

Depending on the framework, tool, or project you are deploying to Cloudflare Pages, you will need to specify the site's **build command** and **build output directory** to tell Cloudflare Pages how to deploy your site. The content of this directory is uploaded to Cloudflare Pages as your website's content.

No framework required

You do not need a framework to deploy with Cloudflare Pages. You can continue with the Get started guide without choosing a framework, and refer to [Deploy your site](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/) for more information on deploying your site without a framework.

The dashboard provides a number of framework-specific presets. These presets provide the default build command and build output directory values for the selected framework. If you are unsure what the correct values are for this section, refer to [Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/). If you do not need a build step, leave the **Build command** field blank.

![Build setting fields that need to be filled in](https://developers.cloudflare.com/_astro/build-settings.BREiHFn0_6h9lJ.webp)

Cloudflare Pages begins by working from your repository's root directory. The entire build pipeline, including the installation steps, will begin from this location. If you would like to change this, specify a new root directory location through the **Root directory (advanced)** > **Path** field.

![Root directory field to be filled in](https://developers.cloudflare.com/_astro/root-directory.CKTDgRpM_k2N0r.webp)

Understanding your build configuration

The build command is provided by your framework. For example, the Gatsby framework uses `gatsby build` as its build command. When you are working without a framework, leave the **Build command** field blank.

The build output directory is generated from the build command. Each [framework](https://developers.cloudflare.com/pages/configuration/build-configuration/#framework-presets) has its own naming convention, for example, the build output directory is named `/public` for many frameworks.

The root directory is where your site's content lives. If not specified, Cloudflare assumes that your linked Git repository is the root directory. The root directory needs to be specified in cases like monorepos, where there may be multiple projects in one repository.

Refer to [Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/) for more information.

### Environment variables

Environment variables are a common way of providing configuration to your build workflow. While setting up your project, you can specify a number of key-value pairs as environment variables. These can be further customized once your project has finished building for the first time.

Refer to the [Hexo framework guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-hexo-site/#using-a-specific-nodejs-version) for more information on how to set up a Node.js version environment variable.

After you have chosen your *Framework preset* or left this field blank if you are working without a framework, configured **Root directory (advanced)**, and customized your **Environment variables (optional)**, you are ready to deploy.

## Your first deploy

After you have finished setting your build configuration, select **Save and Deploy**. Your project build logs will output as Cloudflare Pages installs your project dependencies, builds the project, and deploys it to Cloudflare's global network.

![Deployment details in the Cloudflare dashboard](https://developers.cloudflare.com/_astro/deploy-log.D8BQ4nzJ_Z2wcvzD.webp)

When your project has finished deploying, you will receive a unique URL to view your deployed site.

DNS errors

If you encounter a DNS error after visiting your site after your first deploy, this might be because the DNS has not had time to propagate. To solve the error, wait for the DNS to propagate, or try another device or network to resolve the error.

## Manage site

After your first deploy, select **Continue to project** to see your project's configuration in the Cloudflare Pages dashboard. On this page, you can see your project's current deployment status, the production URL and associated commit, and all past deployments.

![Site dashboard displaying your environments and deployments](https://developers.cloudflare.com/_astro/site-dashboard.Ct8X8ZRP_Z1XcghK.webp)

### Delete a project

To delete your Pages project:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project > **Settings** > **Delete project**.

Warning

For projects with a custom domain, you must first delete the CNAME record associated with your Pages project. Failure to do so may leave the DNS records active, causing your domain to point to a Pages project that no longer exists. Refer to [Deleting a custom domain](https://developers.cloudflare.com/pages/configuration/custom-domains/#delete-a-custom-domain) for instructions.

For projects without a custom domain (any project on a `*.pages.dev` subdomain), your project can be deleted in the project's settings.

## Advanced project settings

In the **Settings** section, you can configure advanced settings, such as changing your project name, updating your Git configuration, or updating your build command, build directory or environment variables.

## Related resources

* Set up a [custom domain for your Pages project](https://developers.cloudflare.com/pages/configuration/custom-domains/).
* Enable [Cloudflare Web Analytics](https://developers.cloudflare.com/pages/how-to/web-analytics/).
* Set up Access policies to [manage who can view your deployment previews](https://developers.cloudflare.com/pages/configuration/preview-deployments/#customize-preview-deployments-access).

</page>

<page>
---
title: Add custom HTTP headers · Cloudflare Pages docs
description: More advanced customization of HTTP headers is available through
  Cloudflare Workers serverless functions.
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/how-to/add-custom-http-headers/
  md: https://developers.cloudflare.com/pages/how-to/add-custom-http-headers/index.md
---

Note

Cloudflare provides HTTP header customization for Pages projects by adding a `_headers` file to your project. Refer to the [documentation](https://developers.cloudflare.com/pages/configuration/headers/) for more information.

More advanced customization of HTTP headers is available through Cloudflare Workers [serverless functions](https://www.cloudflare.com/learning/serverless/what-is-serverless/).

If you have not deployed a Worker before, get started with our [tutorial](https://developers.cloudflare.com/workers/get-started/guide/). For the purpose of this tutorial, accomplish steps one (Sign up for a Workers account) through four (Generate a new project) before returning to this page.

Before continuing, ensure that your Cloudflare Pages project is connected to a [custom domain](https://developers.cloudflare.com/pages/configuration/custom-domains/#add-a-custom-domain).

## Writing a Workers function

Workers functions are written in [JavaScript](https://www.cloudflare.com/learning/serverless/serverless-javascript/). When a Worker makes a request to a Cloudflare Pages application, it will receive a response. The response a Worker receives is immutable, meaning it cannot be changed. In order to add, delete, or alter headers, clone the response and modify the headers on a new `Response` instance. Return the new response to the browser with your desired header changes. An example of this is shown below:

```js
export default {
  async fetch(request) {
    // This proxies your Pages application under the condition that your Worker script is deployed on the same custom domain as your Pages project
    const response = await fetch(request);


    // Clone the response so that it is no longer immutable
    const newResponse = new Response(response.body, response);


    // Add a custom header with a value
    newResponse.headers.append(
      "x-workers-hello",
      "Hello from Cloudflare Workers",
    );


    // Delete headers
    newResponse.headers.delete("x-header-to-delete");
    newResponse.headers.delete("x-header2-to-delete");


    // Adjust the value for an existing header
    newResponse.headers.set("x-header-to-change", "NewValue");


    return newResponse;
  },
};
```

## Deploying a Workers function in the dashboard

The easiest way to start deploying your Workers function is by typing [workers.new](https://workers.new/) in the browser. Log in to your account to be automatically directed to the Workers & Pages dashboard. From the Workers & Pages dashboard, write your function or use one of the [examples from the Workers documentation](https://developers.cloudflare.com/workers/examples/).

Select **Save and Deploy** when your script is ready and set a [route](https://developers.cloudflare.com/workers/configuration/routing/routes/) in your domain's zone settings.

For example, [here is a Workers script](https://developers.cloudflare.com/workers/examples/security-headers/) you can copy and paste into the Workers dashboard that sets common security headers whenever a request hits your Pages URL, such as X-XSS-Protection, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, Content-Security-Policy (CSP), and more.

## Deploying a Workers function using the CLI

If you would like to skip writing this file yourself, you can use our `custom-headers-example` [template](https://github.com/kristianfreeman/custom-headers-example) to generate a new Workers function with [wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/), the Workers CLI tool.

```sh
git clone https://github.com/cloudflare/custom-headers-example
cd custom-headers-example
npm install
```

To operate your Workers function alongside your Pages application, deploy it to the same custom domain as your Pages application. To do this, update the Wrangler file in your project with your account and zone details:

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "custom-headers-example",
    "account_id": "FILL-IN-YOUR-ACCOUNT-ID",
    "workers_dev": false,
    "route": "FILL-IN-YOUR-WEBSITE.com/*",
    "zone_id": "FILL-IN-YOUR-ZONE-ID"
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "custom-headers-example"
  account_id = "FILL-IN-YOUR-ACCOUNT-ID"
  workers_dev = false
  route = "FILL-IN-YOUR-WEBSITE.com/*"
  zone_id = "FILL-IN-YOUR-ZONE-ID"
  ```

If you do not know how to find your Account ID and Zone ID, refer to [our guide](https://developers.cloudflare.com/fundamentals/account/find-account-and-zone-ids/).

Once you have configured your [Wrangler configuration file](https://developers.cloudflare.com/pages/functions/wrangler-configuration/) , run `npx wrangler deploy` in your terminal to deploy your Worker:

```sh
npx wrangler deploy
```

After you have deployed your Worker, your desired HTTP header adjustments will take effect. While the Worker is deployed, you should continue to see the content from your Pages application as normal.

</page>

<page>
---
title: Set build commands per branch · Cloudflare Pages docs
description: This guide will instruct you how to set build commands on specific
  branches. You will use the CF_PAGES_BRANCH environment variable to run a
  script on a specified branch as opposed to your Production branch. This guide
  assumes that you have a Cloudflare account and a Pages project.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/how-to/build-commands-branches/
  md: https://developers.cloudflare.com/pages/how-to/build-commands-branches/index.md
---

This guide will instruct you how to set build commands on specific branches. You will use the `CF_PAGES_BRANCH` environment variable to run a script on a specified branch as opposed to your Production branch. This guide assumes that you have a Cloudflare account and a Pages project.

## Set up

Create a `.sh` file in your project directory. You can choose your file's name, but we recommend you name the file `build.sh`.

In the following script, you will use the `CF_PAGES_BRANCH` environment variable to check which branch is currently being built. Populate your `.sh` file with the following:

```bash
# !/bin/bash


if [ "$CF_PAGES_BRANCH" == "production" ]; then
  # Run the "production" script in `package.json` on the "production" branch
  # "production" should be replaced with the name of your Production branch


  npm run production


elif [ "$CF_PAGES_BRANCH" == "staging" ]; then
  # Run the "staging" script in `package.json` on the "staging" branch
  # "staging" should be replaced with the name of your specific branch


  npm run staging


else
  # Else run the dev script
  npm run dev
fi
```

## Publish your changes

To put your changes into effect:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project.

3. Go to **Settings** > **Build & deployments** > **Build configurations** > **Edit configurations**.

4. Update the **Build command** field value to `bash build.sh` and select **Save**.

To test that your build is successful, deploy your project.

</page>

<page>
---
title: Add a custom domain to a branch · Cloudflare Pages docs
description: In this guide, you will learn how to add a custom domain
  (staging.example.com) that will point to a specific branch (staging) on your
  Pages project.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/how-to/custom-branch-aliases/
  md: https://developers.cloudflare.com/pages/how-to/custom-branch-aliases/index.md
---

In this guide, you will learn how to add a custom domain (`staging.example.com`) that will point to a specific branch (`staging`) on your Pages project.

This will allow you to have a custom domain that will always show the latest build for a specific branch on your Pages project.

Note

This setup is only supported when using a proxied Cloudflare DNS record.

If you attempt to follow this guide using an external DNS provider or an unproxied DNS record, your custom alias will be sent to the production branch of your Pages project.

First, make sure that you have a successful deployment on the branch you would like to set up a custom domain for.

Next, add a custom domain under your Pages project for your desired custom domain, for example, `staging.example.com`.

![Follow the instructions below to access the custom domains overview in the Pages dashboard.](https://developers.cloudflare.com/_astro/pages_custom_domain-1.CiOZm32-_1hDrtY.webp)

To do this:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project.

3. Select **Custom domains** > **Setup a custom domain**.

4. Input the domain you would like to use, such as `staging.example.com`

5. Select **Continue** > **Activate domain**

![After selecting your custom domain, you will be asked to activate it.](https://developers.cloudflare.com/_astro/pages_custom_domain-2.BTtd80-v_Z2tx6JW.webp)

After activating your custom domain, go to [DNS](https://dash.cloudflare.com/?to=/:account/:zone/dns) for the `example.com` zone and find the `CNAME` record with the name `staging` and change the target to include your branch alias.

In this instance, change `your-project.pages.dev` to `staging.your-project.pages.dev`.

![After activating your custom domain, change the CNAME target to include your branch name.](https://developers.cloudflare.com/_astro/pages_custom_domain-3.DhnYG8VS_Z2cp0T8.webp)

Now the `staging` branch of your Pages project will be available on `staging.example.com`.

</page>

<page>
---
title: Deploy a static WordPress site · Cloudflare Pages docs
description: Learn how to deploy a static WordPress site using Cloudflare Pages.
lastUpdated: 2025-10-09T15:47:46.000Z
chatbotDeprioritize: false
tags: WordPress
source_url:
  html: https://developers.cloudflare.com/pages/how-to/deploy-a-wordpress-site/
  md: https://developers.cloudflare.com/pages/how-to/deploy-a-wordpress-site/index.md
---

## Overview

In this guide, you will use a WordPress plugin, [Simply Static](https://wordpress.org/plugins/simply-static/), to convert your existing WordPress site to a static website deployed with Cloudflare Pages.

## Prerequisites

This guide assumes that you are:

* The Administrator account on your WordPress site.
* Able to install WordPress plugins on the site.

## Setup

To start, install the [Simply Static](https://wordpress.org/plugins/simply-static/) plugin to export your WordPress site. In your WordPress dashboard, go to **Plugins** > **Add New**.

Search for `Simply Static` and confirm that the resulting plugin that you will be installing matches the plugin below.

![Simply Static plugin](https://developers.cloudflare.com/_astro/simply-static.B1STKlmC_ZDt3bU.webp)

Select **Install** on the plugin. After it has finished installing, select **Activate**.

### Export your WordPress site

After you have installed the plugin, go to your WordPress dashboard > **Simply Static** > **GENERATE STATIC FILES**.

In the **Activity Log**, find the **ZIP archive created** message and select **Click here to download** to download your ZIP file.

### Deploy your WordPress site with Pages

With your ZIP file downloaded, deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application** > **Pages** > **Use direct upload**.

3. Name your project, then select **Create project**.

4. Drag and drop your ZIP file (or unzipped folder of assets) or select it from your computer.

5. After your files have been uploaded, select **Deploy site**.

Your WordPress site will now be live on Pages.

Every time you make a change to your WordPress site, you will need to download a new ZIP file from the WordPress dashboard and redeploy to Cloudflare Pages. Automatic updates are not available with the free version of Simply Static.

## Limitations

There are some features available in WordPress sites that will not be supported in a static site environment:

* WordPress Forms.
* WordPress Comments.
* Any links to `/wp-admin` or similar internal WordPress routes.

## Conclusion

By following this guide, you have successfully deployed a static version of your WordPress site to Cloudflare Pages.

With a static version of your site being served, you can:

* Move your WordPress site to a custom domain or subdomain. Refer to [Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/) to learn more.
* Run your WordPress instance locally, or put your WordPress site behind [Cloudflare Access](https://developers.cloudflare.com/pages/configuration/preview-deployments/#customize-preview-deployments-access) to only give access to your contributors. This has a significant effect on the number of attack vectors for your WordPress site and its content.
* Downgrade your WordPress hosting plan to a cheaper plan. Because the memory and bandwidth requirements for your WordPress instance are now smaller, you can often host it on a cheaper plan, or moving to shared hosting.

Connect with the [Cloudflare Developer community on Discord](https://discord.cloudflare.com) to ask questions and discuss the platform with other developers.

</page>

<page>
---
title: Enable Zaraz · Cloudflare Pages docs
description: Cloudflare Zaraz gives you complete control over third-party tools
  and services for your website, and allows you to offload them to Cloudflare's
  edge, improving the speed and security of your website. With Cloudflare Zaraz
  you can load tools such as analytics tools, advertising pixels and scripts,
  chatbots, marketing automation tools, and more, in the most optimized way.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/how-to/enable-zaraz/
  md: https://developers.cloudflare.com/pages/how-to/enable-zaraz/index.md
---

Cloudflare Zaraz gives you complete control over third-party tools and services for your website, and allows you to offload them to Cloudflare's edge, improving the speed and security of your website. With Cloudflare Zaraz you can load tools such as analytics tools, advertising pixels and scripts, chatbots, marketing automation tools, and more, in the most optimized way.

Cloudflare Zaraz is built for speed, privacy, and security, and you can use it to load as many tools as you need, with a near-zero performance hit.

## Enable

To enable Zaraz on Cloudflare Pages, you need a [custom domain](https://developers.cloudflare.com/pages/configuration/custom-domains/) associated with your project.

After that, [set up Zaraz](https://developers.cloudflare.com/zaraz/get-started/) on the custom domain.

</page>

<page>
---
title: Install private packages · Cloudflare Pages docs
description: Cloudflare Pages supports custom package registries, allowing you
  to include private dependencies in your application. While this walkthrough
  focuses specifically on npm, the Node package manager and registry, the same
  approach can be applied to other registry tools.
lastUpdated: 2025-09-17T11:00:27.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/how-to/npm-private-registry/
  md: https://developers.cloudflare.com/pages/how-to/npm-private-registry/index.md
---

Cloudflare Pages supports custom package registries, allowing you to include private dependencies in your application. While this walkthrough focuses specifically on [npm](https://www.npmjs.com/), the Node package manager and registry, the same approach can be applied to other registry tools.

You will be be adjusting the [environment variables](https://developers.cloudflare.com/pages/configuration/build-configuration/#environment-variables) in your Pages project's **Settings**. An existing website can be modified at any time, but new projects can be initialized with these settings, too. Either way, altering the project settings will not be reflected until its next deployment.

Warning

Be sure to trigger a new deployment after changing any settings.

## Registry Access Token

Every package registry should have a means of issuing new access tokens. Ideally, you should create a new token specifically for Pages, as you would with any other CI/CD platform.

With npm, you can [create and view tokens through its website](https://docs.npmjs.com/creating-and-viewing-access-tokens) or you can use the `npm` CLI. If you have the CLI set up locally and are authenticated, run the following commands in your terminal:

```sh
# Verify the current npm user is correct
npm whoami


# Create a readonly token
npm token create --read-only
#-> Enter password, if prompted
#-> Enter 2FA code, if configured
```

This will produce a read-only token that looks like a UUID string. Save this value for a later step.

## Private modules on the npm registry

The following section applies to users with applications that are only using private modules from the npm registry.

In your Pages project's **Settings** > **Environment variables**, add a new [environment variable](https://developers.cloudflare.com/pages/configuration/build-configuration/#environment-variables) named `NPM_TOKEN` to the **Production** and **Preview** environments and paste the [read-only token you created](#registry-access-token) as its value.

Warning

Add the `NPM_TOKEN` variable to both the **Production** and **Preview** environments.

By default, `npm` looks for an environment variable named `NPM_TOKEN` and because you did not define a [custom registry endpoint](#custom-registry-endpoints), the npm registry is assumed. Local development should continue to work as expected, provided that you and your teammates are authenticated with npm accounts (see `npm whoami` and `npm login`) that have been granted access to the private package(s).

## Custom registry endpoints

When multiple registries are in use, a project will need to define its own root-level [`.npmrc`](https://docs.npmjs.com/cli/v7/configuring-npm/npmrc) configuration file. An example `.npmrc` file may look like this:

```ini
@foobar:registry=https://npm.pkg.github.com
//registry.npmjs.org/:_authToken=${TOKEN_FOR_NPM}
//npm.pkg.github.com/:_authToken=${TOKEN_FOR_GITHUB}
```

Here, all packages under the `@foobar` scope are directed towards the GitHub Packages registry. Then the registries are assigned their own access tokens via their respective environment variable names.

Note

You only need to define an Access Token for the npm registry (refer to `TOKEN_FOR_NPM` in the example) if it is hosting private packages that your application requires.

Your Pages project must then have the matching [environment variables](https://developers.cloudflare.com/pages/configuration/build-configuration/#environment-variables) defined for all environments. In our example, that means `TOKEN_FOR_NPM` must contain [the read-only npm token](#registry-access-token) value and `TOKEN_FOR_GITHUB` must contain its own [personal access token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token#creating-a-token).

### Managing multiple environments

In the event that your local development no longer works with your new `.npmrc` file, you will need to add some additional changes:

1. Rename the Pages-compliant `.npmrc` file to `.npmrc.pages`. This should be referencing environment variables.

2. Restore your previous `.npmrc` file – the version that was previously working for you and your teammates.

3. Go to **Workers & Pages** in the Cloudflare dashboard.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

4. Select your Pages project.

5. Go to **Settings** > **Environment variables**, add a new [environment variable](https://developers.cloudflare.com/pages/configuration/build-configuration/#environment-variables) named [`NPM_CONFIG_USERCONFIG`](https://docs.npmjs.com/cli/v6/using-npm/config#npmrc-files) and set its value to `/opt/buildhome/repo/.npmrc.pages`. If your `.npmrc.pages` file is not in your project's root directory, adjust this path accordingly.

</page>

<page>
---
title: Preview Local Projects with Cloudflare Tunnel · Cloudflare Pages docs
description: Cloudflare Tunnel runs a lightweight daemon (cloudflared) in your
  infrastructure that establishes outbound connections (Tunnels) between your
  origin web server and the Cloudflare global network. In practical terms, you
  can use Cloudflare Tunnel to allow remote access to services running on your
  local machine. It is an alternative to popular tools like Ngrok, and provides
  free, long-running tunnels via the TryCloudflare service.
lastUpdated: 2025-10-23T20:06:36.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/how-to/preview-with-cloudflare-tunnel/
  md: https://developers.cloudflare.com/pages/how-to/preview-with-cloudflare-tunnel/index.md
---

[Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/) runs a lightweight daemon (`cloudflared`) in your infrastructure that establishes outbound connections (Tunnels) between your origin web server and the Cloudflare global network. In practical terms, you can use Cloudflare Tunnel to allow remote access to services running on your local machine. It is an alternative to popular tools like [Ngrok](https://ngrok.com), and provides free, long-running tunnels via the [TryCloudflare](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/trycloudflare/) service.

While Cloudflare Pages provides unique [deploy preview URLs](https://developers.cloudflare.com/pages/configuration/preview-deployments/) for new branches and commits on your projects, Cloudflare Tunnel can be used to provide access to locally running applications and servers during the development process. In this guide, you will install Cloudflare Tunnel, and create a new tunnel to provide access to a locally running application. You will need a Cloudflare account to begin using Cloudflare Tunnel.

## Installing Cloudflare Tunnel

Cloudflare Tunnel can be installed on Windows, Linux, and macOS. To learn about installing Cloudflare Tunnel, refer to the [Install cloudflared](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/) page in the Cloudflare for Teams documentation.

Confirm that `cloudflared` is installed correctly by running `cloudflared --version` in your command line:

```sh
cloudflared --version
```

```sh
cloudflared version 2021.5.9 (built 2021-05-21-1541 UTC)
```

## Run a local service

The easiest way to get up and running with Cloudflare Tunnel is to have an application running locally, such as a [React](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/) or [SvelteKit](https://developers.cloudflare.com/pages/framework-guides/deploy-a-svelte-kit-site/) site. When you are developing an application with these frameworks, they will often make use of a `npm run develop` script, or something similar, which mounts the application and runs it on a `localhost` port. For example, the popular `vite` tool runs your in-development React application on port `5173`, making it accessible at the `http://localhost:5173` address.

## Start a Cloudflare Tunnel

With a local development server running, a new Cloudflare Tunnel can be instantiated by running `cloudflared tunnel` in a new command line window, passing in the `--url` flag with your `localhost` URL and port. `cloudflared` will output logs to your command line, including a banner with a tunnel URL:

```sh
cloudflared tunnel --url http://localhost:5173
```

```sh
2021-07-15T20:11:29Z INF Cannot determine default configuration path. No file [config.yml config.yaml] in [~/.cloudflared ~/.cloudflare-warp ~/cloudflare-warp /etc/cloudflared /usr/local/etc/cloudflared]
2021-07-15T20:11:29Z INF Version 2021.5.9
2021-07-15T20:11:29Z INF GOOS: linux, GOVersion: devel +11087322f8 Fri Nov 13 03:04:52 2020 +0100, GoArch: amd64
2021-07-15T20:11:29Z INF Settings: map[url:http://localhost:5173]
2021-07-15T20:11:29Z INF cloudflared will not automatically update when run from the shell. To enable auto-updates, run cloudflared as a service: https://developers.cloudflare.com/argo-tunnel/reference/service/
2021-07-15T20:11:29Z INF Initial protocol h2mux
2021-07-15T20:11:29Z INF Starting metrics server on 127.0.0.1:42527/metrics
2021-07-15T20:11:29Z WRN Your version 2021.5.9 is outdated. We recommend upgrading it to 2021.7.0
2021-07-15T20:11:29Z INF Connection established connIndex=0 location=ATL
2021-07-15T20:11:32Z INF Each HA connection's tunnel IDs: map[0:cx0nsiqs81fhrfb82pcq075kgs6cybr86v9vdv8vbcgu91y2nthg]
2021-07-15T20:11:32Z INF +-------------------------------------------------------------+
2021-07-15T20:11:32Z INF |  Your free tunnel has started! Visit it:                    |
2021-07-15T20:11:32Z INF |    https://seasonal-deck-organisms-sf.trycloudflare.com     |
2021-07-15T20:11:32Z INF +-------------------------------------------------------------+
```

In this example, the randomly-generated URL `https://seasonal-deck-organisms-sf.trycloudflare.com` has been created and assigned to your tunnel instance. Visiting this URL in a browser will show the application running, with requests being securely forwarded through Cloudflare's global network, through the tunnel running on your machine, to `localhost:5173`:

![Cloudflare Tunnel example rendering a randomly-generated URL](https://developers.cloudflare.com/_astro/tunnel.DK_OjmvC_Z1Wv9CW.webp)

## Next Steps

Cloudflare Tunnel can be configured in a variety of ways and can be used beyond providing access to your in-development applications. For example, you can provide `cloudflared` with a [configuration file](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/local-management/configuration-file/) to add more complex routing and tunnel setups that go beyond a simple `--url` flag. You can also [attach a Cloudflare DNS record](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/routing-to-tunnel/dns/) to a domain or subdomain for an easily accessible, long-lived tunnel to your local machine.

Finally, by incorporating Cloudflare Access, you can provide [secure access to your tunnels](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/) without exposing your entire server, or compromising on security. Refer to the [Cloudflare for Teams documentation](https://developers.cloudflare.com/cloudflare-one/) to learn more about what you can do with Cloudflare's entire suite of Zero Trust tools.

</page>

<page>
---
title: Redirecting *.pages.dev to a Custom Domain · Cloudflare Pages docs
description: Learn how to use Bulk Redirects to redirect your *.pages.dev
  subdomain to your custom domain.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain/
  md: https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain/index.md
---

Learn how to use [Bulk Redirects](https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/) to redirect your `*.pages.dev` subdomain to your [custom domain](https://developers.cloudflare.com/pages/configuration/custom-domains/).

You may want to do this to ensure that your site's content is served only on the custom domain, and not the `<project>.pages.dev` site automatically generated on your first Pages deployment.

## Setup

To redirect a `<project>.pages.dev` subdomain to your custom domain:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project.

3. Go to **Custom domains** and make sure that your custom domain is listed. If it is not, add it by clicking **Set up a custom domain**.

4. Go **Bulk Redirects**.

5. [Create a bulk redirect list](https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/create-dashboard/#1-create-a-bulk-redirect-list) modeled after the following (but replacing the values as appropriate):

| Source URL | Target URL | Status | Parameters |
| - | - | - | - |
| `<project>.pages.dev` | `https://example.com` | `301` | * Preserve query string
* Subpath matching
* Preserve path suffix
* Include subdomains |

1. [Create a bulk redirect rule](https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/create-dashboard/#2-create-a-bulk-redirect-rule) using the list you just created.

To test that your redirect worked, go to your `<project>.pages.dev` domain. If the URL is now set to your custom domain, then the rule has propagated.

## Related resources

* [Redirect www to domain apex](https://developers.cloudflare.com/pages/how-to/www-redirect/)
* [Handle redirects with Bulk Redirects](https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/)

</page>

<page>
---
title: Refactor a Worker to a Pages Function · Cloudflare Pages docs
description: "In this guide, you will learn how to refactor a Worker made to
  intake form submissions to a Pages Function that can be hosted on your
  Cloudflare Pages application. Pages Functions is a serverless function that
  lives within the same project directory as your application and is deployed
  with Cloudflare Pages. It enables you to run server-side code that adds
  dynamic functionality without running a dedicated server. You may want to
  refactor a Worker to a Pages Function for one of these reasons:"
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/pages/how-to/refactor-a-worker-to-pages-functions/
  md: https://developers.cloudflare.com/pages/how-to/refactor-a-worker-to-pages-functions/index.md
---

In this guide, you will learn how to refactor a Worker made to intake form submissions to a Pages Function that can be hosted on your Cloudflare Pages application. [Pages Functions](https://developers.cloudflare.com/pages/functions/) is a serverless function that lives within the same project directory as your application and is deployed with Cloudflare Pages. It enables you to run server-side code that adds dynamic functionality without running a dedicated server. You may want to refactor a Worker to a Pages Function for one of these reasons:

1. If you manage a serverless function that your Pages application depends on and wish to ship the logic without managing a Worker as a separate service.
2. If you are migrating your Worker to Pages Functions and want to use the routing and middleware capabilities of Pages Functions.

Note

You can import your Worker to a Pages project without using Functions by creating a `_worker.js` file in the output directory of your Pages project. This [Advanced mode](https://developers.cloudflare.com/pages/functions/advanced-mode/) requires writing your Worker with [Module syntax](https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/).

However, when using the `_worker.js` file in Pages, the entire `/functions` directory is ignored – including its routing and middleware characteristics.

## General refactoring steps

1. Remove the fetch handler and replace it with the appropriate `OnRequest` method. Refer to [Functions](https://developers.cloudflare.com/pages/functions/get-started/) to select the appropriate method for your Function.
2. Pass the `context` object as an argument to your new `OnRequest` method to access the properties of the context parameter: `request`,`env`,`params` and `next`.
3. Use middleware to handle logic that must be executed before or after route handlers. Learn more about [using Middleware](https://developers.cloudflare.com/pages/functions/middleware/) in the Functions documentation.

## Background

To explain the process of refactoring, this guide uses a simple form submission example.

Form submissions can be handled by Workers but can also be a good use case for Pages Functions, since forms are most times specific to a particular application.

Assuming you are already using a Worker to handle your form, you would have deployed this Worker and then added the URL to your form action attribute in your HTML form. This means that when you change how the Worker handles your submissions, you must make changes to the Worker script. If the logic in your Worker is used by more than one application, Pages Functions would not be a good use case.

However, it can be beneficial to use a [Pages Function](https://developers.cloudflare.com/pages/functions/) when you would like to organize your function logic in the same project directory as your application.

Building your application using Pages Functions can help you manage your client and serverless logic from the same place and make it easier to write and debug your code.

## Handle form entries with Airtable and Workers

An [Airtable](https://airtable.com/) is a low-code platform for building collaborative applications. It helps customize your workflow, collaborate, and handle form submissions. For this example, you will utilize Airtable's form submission feature.

[Airtable](https://airtable.com/) can be used to store entries of information in different tables for the same account. When creating a Worker for handling the submission logic, the first step is to use [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) to initialize a new Worker within a specific folder or at the root of your application.

This step creates the boilerplate to write your Airtable submission Worker. After writing your Worker, you can deploy it to Cloudflare's global network after you [configure your project for deployment](https://developers.cloudflare.com/workers/wrangler/configuration/). Refer to the Workers documentation for a full tutorial on how to [handle form submission with Workers](https://developers.cloudflare.com/workers/tutorials/handle-form-submissions-with-airtable/).

The following code block shows an example of a Worker that handles Airtable form submission.

The `submitHandler` async function is called if the pathname of the work is `/submit`. This function checks that the request method is a `POST` request and then proceeds to parse and post the form entries to Airtable using your credentials, which you can store using [Wrangler `secret`](https://developers.cloudflare.com/workers/wrangler/commands/#secret).

```js
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);


    if (url.pathname === "/submit") {
      return submitHandler(request, env);
    }


    return fetch(request.url);
  },
};


async function submitHandler(request, env) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
    });
  }
  const body = await request.formData();


  const { first_name, last_name, email, phone, subject, message } =
    Object.fromEntries(body);


  const reqBody = {
    fields: {
      "First Name": first_name,
      "Last Name": last_name,
      Email: email,
      "Phone number": phone,
      Subject: subject,
      Message: message,
    },
  };


  return HandleAirtableData(reqBody, env);
}


const HandleAirtableData = (body, env) => {
  return fetch(
    `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(
      env.AIRTABLE_TABLE_NAME,
    )}`,
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${env.AIRTABLE_API_KEY}`,
        "Content-type": `application/json`,
      },
    },
  );
};
```

### Refactor your Worker

To refactor the above Worker, go to your Pages project directory and create a `/functions` folder. In `/functions`, create a `form.js` file. This file will handle form submissions.

Then, in the `form.js` file, export a single `onRequestPost`:

```js
export async function onRequestPost(context) {
  return await submitHandler(context);
}
```

Every Worker has an `addEventListener` to listen for `fetch` events, but you will not need this in a Pages Function. Instead, you will `export` a single `onRequest` function, and depending on the HTTPS request it handles, you will name it accordingly. Refer to [Function documentation](https://developers.cloudflare.com/pages/functions/get-started/) to select the appropriate method for your function.

The above code takes a `request` and `env` as arguments which pass these properties down to the `submitHandler` function, which remains unchanged from the [original Worker](#handle-form-entries-with-airtable-and-workers). However, because Functions allow you to specify the HTTPS request type, you can remove the `request.method` check in your Worker. This is now handled by Pages Functions by naming the `onRequest` handler.

Now, you will introduce the `submitHandler` function and pass the `env` parameter as a property. This will allow you to access `env` in the `HandleAirtableData` function below. This function does a `POST` request to Airtable using your Airtable credentials:

```js
export async function onRequestPost(context) {
  return await submitHandler(context);
}


async function submitHandler(context) {
  const body = await context.request.formData();


  const { first_name, last_name, email, phone, subject, message } =
    Object.fromEntries(body);


  const reqBody = {
    fields: {
      "First Name": first_name,
      "Last Name": last_name,
      Email: email,
      "Phone number": phone,
      Subject: subject,
      Message: message,
    },
  };


  return HandleAirtableData({ body: reqBody, env: env });
}
```

Finally, create a `HandleAirtableData` function. This function will send a `fetch` request to Airtable with your Airtable credentials and the body of your request:

```js
// ..
const HandleAirtableData = async function onRequest({ body, env }) {
  return fetch(
    `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(
      env.AIRTABLE_TABLE_NAME,
    )}`,
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${env.AIRTABLE_API_KEY}`,
        "Content-type": `application/json`,
      },
    },
  );
};
```

You can test your Function [locally using Wrangler](https://developers.cloudflare.com/pages/functions/local-development/). By completing this guide, you have successfully refactored your form submission Worker to a form submission Pages Function.

## Related resources

* [HTML forms](https://developers.cloudflare.com/pages/tutorials/forms/)
* [Plugins documentation](https://developers.cloudflare.com/pages/functions/plugins/)
* [Functions documentation](https://developers.cloudflare.com/pages/functions/)

</page>

<page>
---
title: Use Direct Upload with continuous integration · Cloudflare Pages docs
description: Cloudflare Pages supports directly uploading prebuilt assets,
  allowing you to use custom build steps for your applications and deploy to
  Pages with Wrangler. This guide will teach you how to deploy your application
  to Pages, using continuous integration.
lastUpdated: 2025-09-17T11:00:27.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/
  md: https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/index.md
---

Cloudflare Pages supports directly uploading prebuilt assets, allowing you to use custom build steps for your applications and deploy to Pages with [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/). This guide will teach you how to deploy your application to Pages, using continuous integration.

## Deploy with Wrangler

In your project directory, install [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) so you can deploy a folder of prebuilt assets by running the following command:

```sh
# Publish created project
$ CLOUDFLARE_ACCOUNT_ID=<ACCOUNT_ID> npx wrangler pages deploy <DIRECTORY> --project-name=<PROJECT_NAME>
```

## Get credentials from Cloudflare

### Generate an API Token

To generate an API token:

1. In the Cloudflare dashboard, go to the **API Tokens** page.

   [Go to **Account API tokens**](https://dash.cloudflare.com/?to=/:account/api-tokens)

2. Select **Create Token**.

3. Under **Custom Token**, select **Get started**.

4. Name your API Token in the **Token name** field.

5. Under **Permissions**, select *Account*, *Cloudflare Pages* and *Edit*:

6. Select **Continue to summary** > **Create Token**.

![Follow the instructions above to create an API token for Cloudflare Pages](https://developers.cloudflare.com/_astro/select-api-token-for-pages.BUXEF2B7_1qpS7G.webp)

Now that you have created your API token, you can use it to push your project from continuous integration platforms.

### Get project account ID

To find your account ID, go to the **Zone Overview** page in the Cloudflare dashboard.

[Go to **Overview**](https://dash.cloudflare.com/?to=/:account/:zone/)

Find your account ID in the **API** section on the right-hand side menu.

If you have not added a zone, add one by selecting **Add** > **Connect a domain**. You can purchase a domain from [Cloudflare's registrar](https://developers.cloudflare.com/registrar/).

## Use GitHub Actions

[GitHub Actions](https://docs.github.com/en/actions) is a continuous integration and continuous delivery (CI/CD) platform that allows you to automate your build, test, and deployment pipeline when using GitHub. You can create workflows that build and test every pull request to your repository or deploy merged pull requests to production.

After setting up your project, you can set up a GitHub Action to automate your subsequent deployments with Wrangler.

### Add Cloudflare credentials to GitHub secrets

In the GitHub Action you have set up, environment variables are needed to push your project up to Cloudflare Pages. To add the values of these environment variables in your project's GitHub repository:

1. Go to your project's repository in GitHub.
2. Under your repository's name, select **Settings**.
3. Select **Secrets** > **Actions** > **New repository secret**.
4. Create one secret and put **CLOUDFLARE\_ACCOUNT\_ID** as the name with the value being your Cloudflare account ID.
5. Create another secret and put **CLOUDFLARE\_API\_TOKEN** as the name with the value being your Cloudflare API token.

Add the value of your Cloudflare account ID and Cloudflare API token as `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`, respectively. This will ensure that these secrets are secure, and each time your Action runs, it will access these secrets.

### Set up a workflow

Create a `.github/workflows/pages-deployment.yaml` file at the root of your project. The `.github/workflows/pages-deployment.yaml` file will contain the jobs you specify on the request, that is: `on: [push]` in this case. It can also be on a pull request. For a detailed explanation of GitHub Actions syntax, refer to the [official documentation](https://docs.github.com/en/actions).

In your `pages-deployment.yaml` file, copy the following content:

```yaml
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    name: Deploy to Cloudflare Pages
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      # Run your project's build step
      # - name: Build
      #   run: npm install && npm run build
      - name: Deploy
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy YOUR_DIRECTORY_OF_STATIC_ASSETS --project-name=YOUR_PROJECT_NAME
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

In the above code block, you have set up an Action that runs when you push code to the repository. Replace `YOUR_PROJECT_NAME` with your Cloudflare Pages project name and `YOUR_DIRECTORY_OF_STATIC_ASSETS` with your project's output directory, respectively.

The `${{ secrets.GITHUB_TOKEN }}` will be automatically provided by GitHub Actions with the `contents: read` and `deployments: write` permission. This will enable our Cloudflare Pages action to create a Deployment on your behalf.

Note

This workflow automatically triggers on the current git branch, unless you add a `branch` option to the `with` section.

## Using CircleCI for CI/CD

[CircleCI](https://circleci.com/) is another continuous integration and continuous delivery (CI/CD) platform that allows you to automate your build, test, and deployment pipeline. It can be configured to efficiently run complex pipelines with caching, docker layer caching, and resource classes.

Similar to GitHub Actions, CircleCI can use Wrangler to continuously deploy your projects each time to push to your code.

### Add Cloudflare credentials to CircleCI

After you have generated your Cloudflare API token and found your account ID in the dashboard, you will need to add them to your CircleCI dashboard to use your environment variables in your project.

To add environment variables, in the CircleCI web application:

1. Go to your Pages project > **Settings**.
2. Select **Projects** in the side menu.
3. Select the ellipsis (...) button in the project's row. You will see the option to add environment variables.
4. Select **Environment Variables** > **Add Environment Variable**.
5. Enter the name and value of the new environment variable, which is your Cloudflare credentials (`CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`).

![Follow the instructions above to add environment variables to your CircleCI settings](https://developers.cloudflare.com/_astro/project-settings-env-var-v2.CMCUnm6I_9Jqdr.webp)

### Set up a workflow

Create a `.circleci/config.yml` file at the root of your project. This file contains the jobs that will be executed based on the order of your workflow. In your `config.yml` file, copy the following content:

```yaml
version: 2.1
jobs:
  Publish-to-Pages:
    docker:
      - image: cimg/node:18.7.0


    steps:
      - checkout
      # Run your project's build step
      - run: npm install && npm run build
      # Publish with wrangler
      - run: npx wrangler pages deploy dist --project-name=<PROJECT NAME> # Replace dist with the name of your build folder and input your project name


workflows:
  Publish-to-Pages-workflow:
    jobs:
      - Publish-to-Pages
```

Your continuous integration workflow is broken down into jobs when using CircleCI. From the code block above, you can see that you first define a list of jobs that run on each commit. For example, your repository will run on a prebuilt docker image `cimg/node:18.7.0`. It first checks out the repository with the Node version specified in the image.

Note

Wrangler requires a Node version of at least `16.17.0`. You must upgrade your Node.js version if your version is lower than `16.17.0`.

You can modify the Wrangler command with any [`wrangler pages deploy` options](https://developers.cloudflare.com/workers/wrangler/commands/#deploy-1).

After all the specified steps, define a `workflow` at the end of your file. You can learn more about creating a custom process with CircleCI from the [official documentation](https://circleci.com/docs/2.0/concepts/).

## Travis CI for CI/CD

Travis CI is an open-source continuous integration tool that handles specific tasks, such as pull requests and code pushes for your project workflow. Travis CI can be integrated into your GitHub projects, databases, and other preinstalled services enabled in your build configuration. To use Travis CI, you should have A GitHub, Bitbucket, GitLab or Assembla account.

### Add Cloudflare credentials to TravisCI

In your Travis project, add the Cloudflare credentials you have generated from the Cloudflare dashboard to access them in your `travis.yml` file. Go to your Travis CI dashboard and select your current project > **More options** > **Settings** > **Environment Variables**.

Set the environment variable's name and value and the branch you want it to be attached to. You can also set the privacy of the value.

### Setup

Go to [Travis-ci.com](https://Travis-ci.com) and enable your repository by login in with your preferred provider. This guide uses GitHub. Next, create a `.travis.yml` file and copy the following into the file:

```yaml
language: node_js
node_js:
  - "18.0.0" # You can specify more versions of Node you want your CI process to support
branches:
  only:
    - travis-ci-test # Specify what branch you want your CI process to run on
install:
  - npm install


script:
  - npm run build # Switch this out with your build command or remove it if you don't have a build step
  - npx wrangler pages deploy dist --project-name=<PROJECT NAME>


env:
  - CLOUDFLARE_ACCOUNT_ID: { $CLOUDFLARE_ACCOUNT_ID }
  - CLOUDFLARE_API_TOKEN: { $CLOUDFLARE_API_TOKEN }
```

This will set the Node.js version to 18. You have also set branches you want your continuous integration to run on. Finally, input your `PROJECT NAME` in the script section and your CI process should work as expected.

You can also modify the Wrangler command with any [`wrangler pages deploy` options](https://developers.cloudflare.com/workers/wrangler/commands/#deploy-1).

</page>

<page>
---
title: Use Pages Functions for A/B testing · Cloudflare Pages docs
description: In this guide, you will learn how to use Pages Functions for A/B
  testing in your Pages projects. A/B testing is a user experience research
  methodology applied when comparing two or more versions of a web page or
  application. With A/B testing, you can serve two or more versions of a webpage
  to users and divide traffic to your site.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/how-to/use-worker-for-ab-testing-in-pages/
  md: https://developers.cloudflare.com/pages/how-to/use-worker-for-ab-testing-in-pages/index.md
---

In this guide, you will learn how to use [Pages Functions](https://developers.cloudflare.com/pages/functions/) for A/B testing in your Pages projects. A/B testing is a user experience research methodology applied when comparing two or more versions of a web page or application. With A/B testing, you can serve two or more versions of a webpage to users and divide traffic to your site.

## Overview

Configuring different versions of your application for A/B testing will be unique to your specific use case. For all developers, A/B testing setup can be simplified into a few helpful principles.

Depending on the number of application versions you have (this guide uses two), you can assign your users into experimental groups. The experimental groups in this guide are the base route `/` and the test route `/test`.

To ensure that a user remains in the group you have given, you will set and store a cookie in the browser and depending on the cookie value you have set, the corresponding route will be served.

## Set up your Pages Function

In your project, you can handle the logic for A/B testing using [Pages Functions](https://developers.cloudflare.com/pages/functions/). Pages Functions allows you to handle server logic from within your Pages project.

To begin:

1. Go to your Pages project directory on your local machine.
2. Create a `/functions` directory. Your application server logic will live in the `/functions` directory.

## Add middleware logic

Pages Functions have utility functions that can reuse chunks of logic which are executed before and/or after route handlers. These are called [middleware](https://developers.cloudflare.com/pages/functions/middleware/). Following this guide, middleware will allow you to intercept requests to your Pages project before they reach your site.

In your `/functions` directory, create a `_middleware.js` file.

Note

When you create your `_middleware.js` file at the base of your `/functions` folder, the middleware will run for all routes on your project. Learn more about [middleware routing](https://developers.cloudflare.com/pages/functions/middleware/).

Following the Functions naming convention, the `_middleware.js` file exports a single async `onRequest` function that accepts a `request`, `env` and `next` as an argument.

```js
const abTest = async ({ request, next, env }) => {
  /*
  Todo:
  1. Conditional statements to check for the cookie
  2. Assign cookies based on percentage, then serve
  */
};


export const onRequest = [abTest];
```

To set the cookie, create the `cookieName` variable and assign any value. Then create the `newHomepagePathName` variable and assign it `/test`:

```js
const cookieName = "ab-test-cookie";
const newHomepagePathName = "/test";


const abTest = async ({ request, next, env }) => {
  /*
  Todo:
  1. Conditional statements to check for the cookie
  2. Assign cookie based on percentage then serve
  */
};


export const onRequest = [abTest];
```

## Set up conditional logic

Based on the URL pathname, check that the cookie value is equal to `new`. If the value is `new`, then `newHomepagePathName` will be served.

```js
const cookieName = "ab-test-cookie";
const newHomepagePathName = "/test";


const abTest = async ({ request, next, env }) => {
  /*
  Todo:
  1. Assign cookies based on randomly generated percentage, then serve
  */


  const url = new URL(request.url);
  if (url.pathname === "/") {
    // if cookie ab-test-cookie=new then change the request to go to /test
    // if no cookie set, pass x% of traffic and set a cookie value to "current" or "new"


    let cookie = request.headers.get("cookie");
    // is cookie set?
    if (cookie && cookie.includes(`${cookieName}=new`)) {
      // Change the request to go to /test (as set in the newHomepagePathName variable)
      url.pathname = newHomepagePathName;
      return env.ASSETS.fetch(url);
    }
  }
};


export const onRequest = [abTest];
```

If the cookie value is not present, you will have to assign one. Generate a percentage (from 0-99) by using: `Math.floor(Math.random() * 100)`. Your default cookie version is given a value of `current`.

If the percentage of the number generated is lower than `50`, you will assign the cookie version to `new`. Based on the percentage randomly generated, you will set the cookie and serve the assets. After the conditional block, pass the request to `next()`. This will pass the request to Pages. This will result in 50% of users getting the `/test` homepage.

The `env.ASSETS.fetch()` function will allow you to send the user to a modified path which is defined through the `url` parameter. `env` is the object that contains your environment variables and bindings. `ASSETS` is a default Function binding that allows communication between your Function and Pages' asset serving resource. `fetch()` calls to the Pages asset-serving resource and returns the asset (`/test` homepage) to your website's visitor.

Binding

A Function is a Worker that executes on your Pages project to add dynamic functionality. A binding is how your Function (Worker) interacts with external resources. A binding is a runtime variable that the Workers runtime provides to your code.

```js
const cookieName = "ab-test-cookie";
const newHomepagePathName = "/test";


const abTest = async (context) => {
  const url = new URL(context.request.url);
  // if homepage
  if (url.pathname === "/") {
    // if cookie ab-test-cookie=new then change the request to go to /test
    // if no cookie set, pass x% of traffic and set a cookie value to "current" or "new"


    let cookie = request.headers.get("cookie");
    // is cookie set?
    if (cookie && cookie.includes(`${cookieName}=new`)) {
      // pass the request to /test
      url.pathname = newHomepagePathName;
      return context.env.ASSETS.fetch(url);
    } else {
      const percentage = Math.floor(Math.random() * 100);
      let version = "current"; // default version
      // change pathname and version name for 50% of traffic
      if (percentage < 50) {
        url.pathname = newHomepagePathName;
        version = "new";
      }
      // get the static file from ASSETS, and attach a cookie
      const asset = await context.env.ASSETS.fetch(url);
      let response = new Response(asset.body, asset);
      response.headers.append("Set-Cookie", `${cookieName}=${version}; path=/`);
      return response;
    }
  }
  return context.next();
};


export const onRequest = [abTest];
```

## Deploy to Cloudflare Pages

After you have set up your `functions/_middleware.js` file in your project you are ready to deploy with Pages. Push your project changes to GitHub/GitLab.

After you have deployed your application, review your middleware Function:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project > **Settings** > **Functions** > **Configuration**.

</page>

<page>
---
title: Enable Web Analytics · Cloudflare Pages docs
description: Cloudflare Web Analytics provides free, privacy-first analytics for
  your website without changing your DNS or using Cloudflare’s proxy. Cloudflare
  Web Analytics helps you understand the performance of your web pages as
  experienced by your site visitors.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/how-to/web-analytics/
  md: https://developers.cloudflare.com/pages/how-to/web-analytics/index.md
---

Cloudflare Web Analytics provides free, privacy-first analytics for your website without changing your DNS or using Cloudflare’s proxy. Cloudflare Web Analytics helps you understand the performance of your web pages as experienced by your site visitors.

All you need to enable Cloudflare Web Analytics is a Cloudflare account and a JavaScript snippet on your page to start getting information on page views and visitors. The JavaScript snippet (also known as a beacon) collects metrics using the Performance API, which is available in all major web browsers.

## Enable on Pages project

Cloudflare Pages offers a one-click setup for Web Analytics:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project.

3. Go to **Metrics** and select **Enable** under Web Analytics.

Cloudflare will automatically add the JavaScript snippet to your Pages site on the next deployment.

## View metrics

To view the metrics associated with your Pages project:

1. In the Cloudflare dashboard, go to the **Web Analytics** page.

   [Go to **Web analytics**](https://dash.cloudflare.com/?to=/:account/web-analytics)

2. Select the analytics associated with your Pages project.

For more details about how to use Web Analytics, refer to the [Web Analytics documentation](https://developers.cloudflare.com/web-analytics/data-metrics/).

## Troubleshooting

For Cloudflare to automatically add the JavaScript snippet, your pages need to have valid HTML.

For example, Cloudflare would not be able to enable Web Analytics on a page like this:

```html
Hello world.
```

For Web Analytics to correctly insert the JavaScript snippet, you would need valid HTML output, such as:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Title</title>
  </head>
  <body>


    <p>Hello world.</p>


  </body>
</html>
```

</page>

<page>
---
title: Redirecting www to domain apex · Cloudflare Pages docs
description: Learn how to redirect a www subdomain to your apex domain (example.com).
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/how-to/www-redirect/
  md: https://developers.cloudflare.com/pages/how-to/www-redirect/index.md
---

Learn how to redirect a `www` subdomain to your apex domain (`example.com`).

This setup assumes that you already have a [custom domain](https://developers.cloudflare.com/pages/configuration/custom-domains/) attached to your Pages project.

## Setup

To redirect your `www` subdomain to your domain apex:

1. In the Cloudflare dashboard, go to the **Bulk Redirects** page.

   [Go to **Bulk redirects**](https://dash.cloudflare.com/?to=/:account/bulk-redirects)

2. [Create a bulk redirect list](https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/create-dashboard/#1-create-a-bulk-redirect-list) modeled after the following (but replacing the values as appropriate):

| Source URL | Target URL | Status | Parameters |
| - | - | - | - |
| `www.example.com` | `https://example.com` | `301` | * Preserve query string
* Subpath matching
* Preserve path suffix
* Include subdomains |

1. [Create a bulk redirect rule](https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/create-dashboard/#2-create-a-bulk-redirect-rule) using the list you just created.
2. Go to **DNS**.
3. [Create a DNS record](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/#create-dns-records) for the `www` subdomain using the following values:

| Type | Name | IPv4 address | Proxy status |
| - | - | - | - |
| `A` | `www` | `192.0.2.1` | Proxied |

It may take a moment for this DNS change to propagate, but once complete, you can run the following command in your terminal.

```sh
curl --head -i https://www.example.com/
```

Then, inspect the output to verify that the `location` header and status code are being set as configured.

## Related resources

* [Redirect `*.pages.dev` to a custom domain](https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain/)
* [Handle redirects with Bulk Redirects](https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/)

</page>

<page>
---
title: Migrating from Firebase · Cloudflare Pages docs
description: This tutorial explains how to migrate an existing Firebase
  application to Cloudflare Pages.
lastUpdated: 2025-10-09T15:47:46.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/pages/migrations/migrating-from-firebase/
  md: https://developers.cloudflare.com/pages/migrations/migrating-from-firebase/index.md
---

In this tutorial, you will learn how to migrate an existing Firebase application to Cloudflare Pages. You should already have an existing project deployed on Firebase that you would like to host on Cloudflare Pages.

## Finding your build command and build directory

To move your application to Cloudflare Pages, you will need to find your build command and build directory.

You will use these to tell Cloudflare Pages how to deploy your project. If you have been deploying manually from your local machine using the `firebase` command-line tool, the `firebase.json` configuration file should include a `public` key that will be your build directory:

```json
{
  "public": "public"
}
```

Firebase Hosting does not ask for your build command, so if you are running a standard JavaScript set up, you will probably be using `npm build` or a command specific to the framework or tool you are using (for example, `ng build`).

After you have found your build directory and build command, you can move your project to Cloudflare Pages.

## Creating a new Pages project

If you have not pushed your static site to GitHub before, you should do so before continuing. This will also give you access to features like automatic deployments, and [deployment previews](https://developers.cloudflare.com/pages/configuration/preview-deployments/).

You can create a new repository by visiting [repo.new](https://repo.new) and following the instructions to push your project up to GitHub.

Use the [Get started guide](https://developers.cloudflare.com/pages/get-started/) to add your project to Cloudflare Pages, using the **build command** and **build directory** that you saved earlier.

## Cleaning up your old application and assigning the domain

Once you have deployed your application, go to the Firebase dashboard and remove your old Firebase project. In your Cloudflare DNS settings for your domain, make sure to update the CNAME record for your domain from Firebase to Cloudflare Pages.

By completing this guide, you have successfully migrated your Firebase project to Cloudflare Pages.

</page>

<page>
---
title: Migrating from Netlify to Pages · Cloudflare Pages docs
description: Learn how to migrate from Netlify to Cloudflare. This guide
  includes instructions for migrating redirects and headers.
lastUpdated: 2025-10-09T15:47:46.000Z
chatbotDeprioritize: true
tags: JavaScript
source_url:
  html: https://developers.cloudflare.com/pages/migrations/migrating-from-netlify/
  md: https://developers.cloudflare.com/pages/migrations/migrating-from-netlify/index.md
---

In this tutorial, you will learn how to migrate your Netlify application to Cloudflare Pages.

## Finding your build command and build directory

To move your application to Cloudflare Pages, find your build command and build directory. Cloudflare Pages will use this information to build and deploy your application.

In your Netlify Dashboard, find the project that you want to deploy. It should be configured to deploy from a GitHub repository.

![Selecting a site in the Netlify Dashboard](https://developers.cloudflare.com/_astro/netlify-deploy-1.By04eemW_1Vp1dR.webp)

Inside of your site dashboard, select **Site Settings**, and then **Build & Deploy**.

![Selecting Site Settings in site dashboard](https://developers.cloudflare.com/_astro/netlify-deploy-2.DmmuPQSt_8gv3b.webp) ![Selecting Build and Deploy in sidebar](https://developers.cloudflare.com/_astro/netlify-deploy-3.BKXJ0OTu_1etMse.webp)

In the **Build & Deploy** tab, find the **Build settings** panel, which will have the **Build command** and **Publish directory** fields. Save these for deploying to Cloudflare Pages. In the below image, **Build command** is `yarn build`, and **Publish directory** is `build/`.

![Finding the Build command and Publish directory fields](https://developers.cloudflare.com/_astro/netlify-deploy-4.DDil9MXJ_1TVELz.webp)

## Migrating redirects and headers

If your site includes a `_redirects` file in your publish directory, you can use the same file in Cloudflare Pages and your redirects will execute successfully. If your redirects are in your `netlify.toml` file, you will need to add them to the `_redirects` folder. Cloudflare Pages currently offers limited [supports for advanced redirects](https://developers.cloudflare.com/pages/configuration/redirects/). In the case where you have over 2000 static and/or 100 dynamic redirects rules, it is recommended to use [Bulk Redirects](https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/create-dashboard/).

Your header files can also be moved into a `_headers` folder in your publish directory. It is important to note that custom headers defined in the `_headers` file are not currently applied to responses from functions, even if the function route matches the URL pattern. To learn more about how to [handle headers, refer to Headers](https://developers.cloudflare.com/pages/configuration/headers/).

Note

Redirects execute before headers. In the case of a request matching rules in both files, the redirect will take precedence.

## Forms

In your form component, remove the `data-netlify = "true"` attribute or the Netlify attribute from the `<form>` tag. You can now put your form logic as a Pages Function and collect the entries to a database or an Airtable. Refer to the [handling form submissions with Pages Functions](https://developers.cloudflare.com/pages/tutorials/forms/) tutorial for more information.

## Serverless functions

Netlify functions and Pages Functions share the same filesystem convention using a `functions` directory in the base of your project to handle your serverless functions. However, the syntax and how the functions are deployed differs. Pages Functions run on Cloudflare Workers, which by default operate on the Cloudflare global network, and do not require any additional code or configuration for deployment.

Cloudflare Pages Functions also provides middleware that can handle any logic you need to run before and/or after your function route handler.

### Functions syntax

Netlify functions export an async event handler that accepts an event and a context as arguments. In the case of Pages Functions, you will have to export a single `onRequest` function that accepts a `context` object. The `context` object contains all the information for the request such as `request`, `env`, `params`, and returns a new Response. Learn more about [writing your first function](https://developers.cloudflare.com/pages/functions/get-started/)

Hello World with Netlify functions:

```js
exports.handler = async function (event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello World" }),
  };
};
```

Hello World with Pages Functions:

```js
export async function onRequestPost(request) {
  return new Response(`Hello world`);
}
```

## Other Netlify configurations

Your `netlify.toml` file might have other configurations that are supported by Pages, such as, preview deployment, specifying publish directory, and plugins. You can delete the file after migrating your configurations.

## Access management

You can migrate your access management to [Cloudflare Zero Trust](https://developers.cloudflare.com/cloudflare-one/) which allows you to manage user authentication for your applications, event logging and requests.

## Creating a new Pages project

Once you have found your build directory and build command, you can move your project to Cloudflare Pages.

The [Get started guide](https://developers.cloudflare.com/pages/get-started/) will instruct you how to add your GitHub project to Cloudflare Pages.

If you choose to use a custom domain for your Pages, you can set it to the same custom domain as your currently deployed Netlify application. To assign a custom domain to your Pages project, refer to [Custom Domains](https://developers.cloudflare.com/pages/configuration/custom-domains/).

## Cleaning up your old application and assigning the domain

In the Cloudflare dashboard, go to the **DNS Records** page.

[Go to **Records**](https://dash.cloudflare.com/?to=/:account/:zone/dns/records)

Review that you have updated the CNAME record for your domain from Netlify to Cloudflare Pages. With your DNS record updated, requests will go to your Pages application.

In **DNS**, your record's **Content** should be your `<SUBDOMAIN>.pages.dev` subdomain.

With the above steps completed, you have successfully migrated your Netlify project to Cloudflare Pages.

</page>

<page>
---
title: Migrating from Vercel to Pages · Cloudflare Pages docs
description: In this tutorial, you will learn how to deploy your Vercel
  application to Cloudflare Pages.
lastUpdated: 2025-10-09T15:47:46.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/pages/migrations/migrating-from-vercel/
  md: https://developers.cloudflare.com/pages/migrations/migrating-from-vercel/index.md
---

In this tutorial, you will learn how to deploy your Vercel application to Cloudflare Pages.

You should already have an existing project deployed on Vercel that you would like to host on Cloudflare Pages. Features such as Vercel's serverless functions are currently not supported in Cloudflare Pages.

## Find your build command and build directory

To move your application to Cloudflare Pages, you will need to find your build command and build directory. Cloudflare Pages will use this information to build your application and deploy it.

In your Vercel Dashboard, find the project that you want to deploy. It should be configured to deploy from a GitHub repository.

![Selecting a site in the Vercel Dashboard](https://developers.cloudflare.com/_astro/vercel-deploy-1.D2ttJxis_ZDyq5R.webp)

Inside of your site dashboard, select **Settings**, then **General**.

![Selecting Site Settings in site dashboard](https://developers.cloudflare.com/_astro/vercel-deploy-2.Bz2cpjeg_ZWnFgf.webp)

Find the **Build & Development settings** panel, which will have the **Build Command** and **Output Directory** fields. If you are using a framework, these values may not be filled in, but will show the defaults used by the framework. Save these for deploying to Cloudflare Pages. In the below image, the **Build Command** is `npm run build`, and the **Output Directory** is `build`.

![Finding the Build Command and Output Directory fields](https://developers.cloudflare.com/_astro/vercel-deploy-3.QXCg23KQ_ZSQ8Ij.webp)

## Create a new Pages project

After you have found your build directory and build command, you can move your project to Cloudflare Pages.

The [Get started guide](https://developers.cloudflare.com/pages/get-started/) will instruct you how to add your GitHub project to Cloudflare Pages.

## Add a custom domain

Next, connect a [custom domain](https://developers.cloudflare.com/pages/configuration/custom-domains/) to your Pages project. This domain should be the same one as your currently deployed Vercel application.

### Change domain nameservers

In most cases, you will want to [add your domain to Cloudflare](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/).

This does involve changing your domain nameservers, but simplifies your Pages setup and allows you to use an apex domain for your project (like `example.com`).

If you want to take a different approach, read more about [custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/).

### Set up custom domain

To add a custom domain:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project > **Custom domains**.

3. Select **Set up a domain**.

4. Provide the domain that you would like to serve your Cloudflare Pages site on and select **Continue**.

![Adding a custom domain for your Pages project through the Cloudflare dashboard](https://developers.cloudflare.com/_astro/domains.zq4iMU_J_jMmg9.webp)

The next steps vary based on if you [added your domain to Cloudflare](#change-domain-nameservers):

* **Added to Cloudflare**: Cloudflare will set everything up for you automatically and your domain will move to an `Active` status.
* **Not added to Cloudflare**: You need to [update some DNS records](https://developers.cloudflare.com/pages/configuration/custom-domains/#add-a-custom-subdomain) at your DNS provider to finish your setup.

## Delete your Vercel app

Once your custom domain is set up and sending requests to Cloudflare Pages, you can safely delete your Vercel application.

## Troubleshooting

Cloudflare does not provide IP addresses for your Pages project because we do not require `A` or `AAAA` records to link your domain to your project. Instead, Cloudflare uses `CNAME` records.

For more details, refer to [Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/).

</page>

<page>
---
title: Migrating from Workers Sites to Pages · Cloudflare Pages docs
description: Learn how to migrate from Workers Sites to Cloudflare Pages.
lastUpdated: 2025-10-09T15:47:46.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/pages/migrations/migrating-from-workers/
  md: https://developers.cloudflare.com/pages/migrations/migrating-from-workers/index.md
---

In this tutorial, you will learn how to migrate an existing [Cloudflare Workers Sites](https://developers.cloudflare.com/workers/configuration/sites/) application to Cloudflare Pages.

As a prerequisite, you should have a Cloudflare Workers Sites project, created with [Wrangler](https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler).

Cloudflare Pages provides built-in defaults for every aspect of serving your site. You can port custom behavior in your Worker — such as custom caching logic — to your Cloudflare Pages project using [Functions](https://developers.cloudflare.com/pages/functions/). This enables an easy-to-use, file-based routing system. You can also migrate your custom headers and redirects to Pages.

You may already have a reasonably complex Worker and/or it would be tedious to splice it up into Pages' file-based routing system. For these cases, Pages offers developers the ability to define a `_worker.js` file in the output directory of your Pages project.

Note

When using a `_worker.js` file, the entire `/functions` directory is ignored - this includes its routing and middleware characteristics. Instead, the `_worker.js` file is deployed as is and must be written using the [Module Worker syntax](https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/).

By migrating to Cloudflare Pages, you will be able to access features like [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) and automatic branch deploys with no extra configuration needed.

## Remove unnecessary code

Workers Sites projects consist of the following pieces:

1. An application built with a [static site tool](https://developers.cloudflare.com/pages/how-to/) or a static collection of HTML, CSS and JavaScript files.
2. If using a static site tool, a build directory (called `bucket` in the [Wrangler configuration file](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)) where the static project builds your HTML, CSS, and JavaScript files.
3. A Worker application for serving that build directory. For most projects, this is likely to be the `workers-site` directory.

When moving to Cloudflare Pages, remove the Workers application and any associated Wrangler configuration files or build output. Instead, note and record your `build` command (if you have one), and the `bucket` field, or build directory, from the Wrangler file in your project's directory.

## Migrate headers and redirects

You can migrate your redirects to Pages, by creating a `_redirects` file in your output directory. Pages currently offers limited support for advanced redirects. More support will be added in the future. For a list of support types, refer to the [Redirects documentation](https://developers.cloudflare.com/pages/configuration/redirects/).

Note

A project is limited to 2,000 static redirects and 100 dynamic redirects, for a combined total of 2,100 redirects. Each redirect declaration has a 1,000-character limit. Malformed definitions are ignored. If there are multiple redirects for the same source path, the topmost redirect is applied.

Make sure that static redirects are before dynamic redirects in your `_redirects` file.

In addition to a `_redirects` file, Cloudflare also offers [Bulk Redirects](https://developers.cloudflare.com/pages/configuration/redirects/#surpass-_redirects-limits), which handles redirects that surpasses the 2,100 redirect rules limit set by Pages.

Your custom headers can also be moved into a `_headers` file in your output directory. It is important to note that custom headers defined in the `_headers` file are not currently applied to responses from Functions, even if the Function route matches the URL pattern. To learn more about handling headers, refer to [Headers](https://developers.cloudflare.com/pages/configuration/headers/).

## Create a new Pages project

### Connect to your git provider

After you have recorded your **build command** and **build directory** in a separate location, remove everything else from your application, and push the new version of your project up to your git provider. Follow the [Get started guide](https://developers.cloudflare.com/pages/get-started/) to add your project to Cloudflare Pages, using the **build command** and **build directory** that you saved earlier.

If you choose to use a custom domain for your Pages project, you can set it to the same custom domain as your currently deployed Workers application. Follow the steps for [adding a custom domain](https://developers.cloudflare.com/pages/configuration/custom-domains/#add-a-custom-domain) to your Pages project.

Note

Before you deploy, you will need to delete your old Workers routes to start sending requests to Cloudflare Pages.

### Using Direct Upload

If your Workers site has its custom build settings, you can bring your prebuilt assets to Pages with [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/). In addition, you can serve your website's assets right to the Cloudflare global network by either using the [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) or the drag and drop option.

These options allow you to create and name a new project from the CLI or dashboard. After your project deployment is complete, you can set the custom domain by following the [adding a custom domain](https://developers.cloudflare.com/pages/configuration/custom-domains/#add-a-custom-domain) steps to your Pages project.

## Cleaning up your old application and assigning the domain

After you have deployed your Pages application, to delete your Worker:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Worker.

3. Go to **Manage** > **Delete Worker**.

With your Workers application removed, requests will go to your Pages application. You have successfully migrated your Workers Sites project to Cloudflare Pages by completing this guide.

</page>

<page>
---
title: Migrating a Jekyll-based site from GitHub Pages · Cloudflare Pages docs
description: Learn how to migrate a Jekyll-based site from GitHub Pages to Cloudflare Pages.
lastUpdated: 2025-10-09T15:47:46.000Z
chatbotDeprioritize: true
tags: Ruby
source_url:
  html: https://developers.cloudflare.com/pages/migrations/migrating-jekyll-from-github-pages/
  md: https://developers.cloudflare.com/pages/migrations/migrating-jekyll-from-github-pages/index.md
---

In this tutorial, you will learn how to migrate an existing [GitHub Pages site using Jekyll](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/about-github-pages-and-jekyll) to Cloudflare Pages. Jekyll is one of the most popular static site generators used with GitHub Pages, and migrating your GitHub Pages site to Cloudflare Pages will take a few short steps.

This tutorial will guide you through:

1. Adding the necessary dependencies used by GitHub Pages to your project configuration.
2. Creating a new Cloudflare Pages site, connected to your existing GitHub repository.
3. Building and deploying your site on Cloudflare Pages.
4. (Optional) Migrating your custom domain.

Including build times, this tutorial should take you less than 15 minutes to complete.

Note

If you have a Jekyll-based site not deployed on GitHub Pages, refer to [the Jekyll framework guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-jekyll-site/).

## Before you begin

This tutorial assumes:

1. You have an existing GitHub Pages site using [Jekyll](https://jekyllrb.com/)
2. You have some familiarity with running Ruby's command-line tools, and have both `gem` and `bundle` installed.
3. You know how to use a few basic Git operations, including `add`, `commit`, `push`, and `pull`.
4. You have read the [Get Started](https://developers.cloudflare.com/pages/get-started/) guide for Cloudflare Pages.

If you do not have Rubygems (`gem`) or Bundler (`bundle`) installed on your machine, refer to the installation guides for [Rubygems](https://rubygems.org/pages/download) and [Bundler](https://bundler.io/).

## Preparing your GitHub Pages repository

Note

If your GitHub Pages repository already has a `Gemfile` and `Gemfile.lock` present, you can skip this step entirely. The GitHub Pages environment assumes a default set of Jekyll plugins that are not explicitly specified in a `Gemfile`.

Your existing Jekyll-based repository must specify a `Gemfile` (Ruby's dependency configuration file) to allow Cloudflare Pages to fetch and install those dependencies during the [build step](https://developers.cloudflare.com/pages/configuration/build-configuration/).

Specifically, you will need to create a `Gemfile` and install the `github-pages` gem, which includes all of the dependencies that the GitHub Pages environment assumes.

[Version 2 of the Pages build environment](https://developers.cloudflare.com/pages/configuration/build-image/#languages-and-runtime) will use Ruby 3.2.2 for the default Jekyll build. Please make sure your local development environment is compatible.

```sh
brew install ruby@3.2
export PATH="/usr/local/opt/ruby@3.2/bin:$PATH"
```

```sh
cd my-github-pages-repo
bundle init
```

Open the `Gemfile` that was created for you, and add the following line to the bottom of the file:

```ruby
gem "github-pages", group: :jekyll_plugins
```

Your `Gemfile` should resemble the below:

```ruby
# frozen_string_literal: true


source "https://rubygems.org"


git_source(:github) { |repo_name| "https://github.com/#{repo_name}" }


# gem "rails"
gem "github-pages", group: :jekyll_plugins
```

Run `bundle update`, which will install the `github-pages` gem for you, and create a `Gemfile.lock` file with the resolved dependency versions.

```sh
bundle update
# Bundler will show a lot of output as it fetches the dependencies
```

This should complete successfully. If not, verify that you have copied the `github-pages` line above exactly, and have not commented it out with a leading `#`.

You will now need to commit these files to your repository so that Cloudflare Pages can reference them in the following steps:

```sh
git add Gemfile Gemfile.lock
git commit -m "deps: added Gemfiles"
git push origin main
```

## Configuring your Pages project

With your GitHub Pages project now explicitly specifying its dependencies, you can start configuring Cloudflare Pages. The process is almost identical to [deploying a Jekyll site](https://developers.cloudflare.com/pages/framework-guides/deploy-a-jekyll-site/).

Note

If you are configuring your Cloudflare Pages site for the first time, refer to the [Git integration guide](https://developers.cloudflare.com/pages/get-started/git-integration/), which explains how to connect your existing Git repository to Cloudflare Pages.

To deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application** > **Pages** > **Import an existing Git repository**.

3. Select the new GitHub repository that you created and, in the **Set up builds and deployments** section, provide the following information:

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command | `jekyll build` |
| Build directory | `_site` |

After you have configured your site, you can begin your first deploy. You should see Cloudflare Pages installing `jekyll`, your project dependencies, and building your site, before deploying it.

Note

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/).

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`. Every time you commit new code to your Jekyll site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes look to your site before deploying them to production.

## Migrating your custom domain

If you are using a [custom domain with GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site), you must update your DNS record(s) to point at your new Cloudflare Pages deployment. This will require you to update the `CNAME` record at the DNS provider for your domain to point to `<your-pages-site>.pages.dev`, replacing `<your-username>.github.io`.

Note that it may take some time for DNS caches to expire and for this change to be reflected, depending on the DNS TTL (time-to-live) value you set when you originally created the record.

Refer to the [adding a custom domain](https://developers.cloudflare.com/pages/configuration/custom-domains/#add-a-custom-domain) section of the Get started guide for a list of detailed steps.

## What's next?

* Learn how to [customize HTTP response headers](https://developers.cloudflare.com/pages/how-to/add-custom-http-headers/) for your Pages site using Cloudflare Workers.
* Understand how to [rollback a potentially broken deployment](https://developers.cloudflare.com/pages/configuration/rollbacks/) to a previously working version.
* [Configure redirects](https://developers.cloudflare.com/pages/configuration/redirects/) so that visitors are always directed to your 'canonical' custom domain.

</page>

<page>
---
title: Changelog · Cloudflare Pages docs
description: Subscribe to RSS
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/platform/changelog/
  md: https://developers.cloudflare.com/pages/platform/changelog/index.md
---

[Subscribe to RSS](https://developers.cloudflare.com/pages/platform/changelog/index.xml)

## 2025-04-18

**Action recommended - Node.js 18 end-of-life and impact on Pages Build System V2**

* If you are using [Pages Build System V2](https://developers.cloudflare.com/pages/configuration/build-image/) for a Git-connected Pages project, note that the default Node.js version, **Node.js 18**, will end its LTS support on **April 30, 2025**.

* Pages will not change the default Node.js version in the Build System V2 at this time, instead, we **strongly recommend pinning a modern Node.js version** to ensure your builds are consistent and secure.

* You can [pin any Node.js version](https://developers.cloudflare.com/pages/configuration/build-image/#override-default-versions) by:

  1. Adding a `NODE_VERSION` environment variable with the desired version specified as the value.
  2. Adding a `.node-version` file with the desired version specified in the file.

* Pinning helps avoid unexpected behavior and ensures your builds stay up-to-date with your chosen runtime. We also recommend pinning all critical tools and languages that your project relies on.

## 2025-02-26

**Support for pnpm 10 in build system**

* Pages build system now supports building projects that use **pnpm 10** as the package manager. If your build previously failed due to this unsupported version, retry your build. No config changes needed.

## 2024-12-19

**Cloudflare GitHub App Permissions Update**

* Cloudflare is requesting updated permissions for the [Cloudflare GitHub App](https://github.com/apps/cloudflare-workers-and-pages) to enable features like automatically creating a repository on your GitHub account and deploying the new repository for you when getting started with a template. This feature is coming out soon to support a better onboarding experience.

  * **Requested permissions:**

    * [Repository Administration](https://docs.github.com/en/rest/authentication/permissions-required-for-github-apps?apiVersion=2022-11-28#repository-permissions-for-administration) (read/write) to create repositories.
    * [Contents](https://docs.github.com/en/rest/authentication/permissions-required-for-github-apps?apiVersion=2022-11-28#repository-permissions-for-contents) (read/write) to push code to the created repositories.

  * **Who is impacted:**

    * Existing users will be prompted to update permissions when GitHub sends an email with subject "\[GitHub] Cloudflare Workers & Pages is requesting updated permission" on December 19th, 2024.
    * New users installing the app will see the updated permissions during the connecting repository process.

  * **Action:** Review and accept the permissions update to use upcoming features. *If you decline or take no action, you can continue connecting repositories and deploying changes via the Cloudflare GitHub App as you do today, but new features requiring these permissions will not be available.*

  * **Questions?** Visit [#github-permissions-update](https://discord.com/channels/595317990191398933/1313895851520688163) in the Cloudflare Developers Discord.

## 2024-10-24

**Updating Bun version to 1.1.33 in V2 build system**

* Bun version is being updated from `1.0.1` to `1.1.33` in Pages V2 build system. This is a minor version change, please see details at [Bun](https://bun.sh/blog/bun-v1.1.33).
* If you wish to use a previous Bun version, you can [override default version](https://developers.cloudflare.com/pages/configuration/build-image/#overriding-default-versions).

## 2023-09-13

**Support for D1's new storage subsystem and build error message improvements**

* Added support for D1's [new storage subsystem](https://blog.cloudflare.com/d1-turning-it-up-to-11/). All Git builds and deployments done with Wrangler v3.5.0 and up can use the new subsystem.
* Builds which fail due to exceeding the [build time limit](https://developers.cloudflare.com/pages/platform/limits/#builds) will return a proper error message indicating so rather than `Internal error`.
* New and improved error messages for other build failures

## 2023-08-23

**Commit message limit increase**

* Commit messages can now be up to 384 characters before being trimmed.

## 2023-08-01

**Support for newer TLDs**

* Support newer TLDs such as `.party` and `.music`.

## 2023-07-11

**V2 build system enabled by default**

* V2 build system is now default for all new projects.

## 2023-07-10

**Sped up project creation**

* Sped up project creation.

## 2023-05-19

**Build error message improvement**

* Builds which fail due to Out of memory (OOM) will return a proper error message indicating so rather than `Internal error`.

## 2023-05-17

**V2 build system beta**

* The V2 build system is now available in open beta. Enable the V2 build system by going to your Pages project in the Cloudflare dashboard and selecting **Settings** > [**Build & deployments**](https://dash.cloudflare.com?to=/:account/pages/view/:pages-project/settings/builds-deployments) > **Build system version**.

## 2023-05-16

**Support for Smart Placement**

* [Smart placement](https://developers.cloudflare.com/workers/configuration/placement/) can now be enabled for Pages within your Pages Project by going to **Settings** > [**Functions**](https://dash.cloudflare.com?to=/:account/pages/view/:pages-project/settings/functions).

## 2023-03-23

**Git projects can now see files uploaded**

* Files uploaded are now visible for Git projects, you can view them in the [Cloudflare dashboard](https://dash.cloudflare.com?to=/:account/pages/view/:pages-project/:pages-deployment/files).

## 2023-03-20

**Notifications for Pages are now available**

* Notifications for Pages events are now available in the [Cloudflare dashboard](https://dash.cloudflare.com?to=/:account/notifications). Events supported include:

  * Deployment started.
  * Deployment succeeded.
  * Deployment failed.

## 2023-02-14

**Analytics Engine now available in Functions**

* Added support for [Analytics Engine](https://developers.cloudflare.com/analytics/analytics-engine/) in Functions.

## 2023-01-05

**Queues now available in Functions**

* Added support for [Queues](https://developers.cloudflare.com/queues/) producer in Functions.

## 2022-12-15

**API messaging update**

Updated all API messaging to be more helpful.

## 2022-12-01

**Ability to delete aliased deployments**

* Aliased deployments can now be deleted. If using the API, you will need to add the query parameter `force=true`.

## 2022-11-19

**Deep linking to a Pages deployment**

* You can now deep-link to a Pages deployment in the dashboard with `:pages-deployment`. An example would be `https://dash.cloudflare.com?to=/:account/pages/view/:pages-project/:pages-deployment`.

## 2022-11-17

**Functions GA and other updates**

* Pages functions are now GA. For more information, refer to the [blog post](https://blog.cloudflare.com/pages-function-goes-ga/).

* We also made the following updates to Functions:

  * [Functions metrics](https://dash.cloudflare.com?to=/:account/pages/view/:pages-project/analytics/production) are now available in the dashboard.
  * [Functions billing](https://developers.cloudflare.com/pages/functions/pricing/) is now available.
  * The [Unbound usage model](https://developers.cloudflare.com/workers/platform/limits/#response-limits) is now available for Functions.
  * [Secrets](https://developers.cloudflare.com/pages/functions/bindings/#secrets) are now available.
  * Functions tailing is now available via the [dashboard](https://dash.cloudflare.com?to=/:account/pages/view/:pages-project/:pages-deployment/functions) or with Wrangler (`wrangler pages deployment tail`).

## 2022-11-15

**Service bindings now available in Functions**

* Service bindings are now available in Functions. For more details, refer to the [docs](https://developers.cloudflare.com/pages/functions/bindings/#service-bindings).

## 2022-11-03

**Ansi color codes in build logs**

Build log now supports ansi color codes.

## 2022-10-05

**Deep linking to a Pages project**

* You can now deep-link to a Pages project in the dashboard with `:pages-project`. An example would be `https://dash.cloudflare.com?to=/:account/pages/view/:pages-project`.

## 2022-09-12

**Increased domain limits**

Previously, all plans had a maximum of 10 [custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/) per project.

Now, the limits are:

* **Free**: 100 custom domains.
* **Pro**: 250 custom domains.
* **Business** and **Enterprise**: 500 custom domains.

## 2022-09-08

**Support for \_routes.json**

* Pages now offers support for `_routes.json`. For more details, refer to the [documentation](https://developers.cloudflare.com/pages/functions/routing/#functions-invocation-routes).

## 2022-08-25

**Increased build log expiration time**

Build log expiration time increased from 2 weeks to 1 year.

## 2022-08-08

**New bindings supported**

* R2 and D1 [bindings](https://developers.cloudflare.com/pages/functions/bindings/) are now supported.

## 2022-07-05

**Added support for .dev.vars in wrangler pages**

Pages now supports `.dev.vars` in `wrangler pages`, which allows you to use use environmental variables during your local development without chaining `--env`s.

This functionality requires Wrangler v2.0.16 or higher.

## 2022-06-13

**Added deltas to wrangler pages publish**

Pages has added deltas to `wrangler pages publish`.

We now keep track of the files that make up each deployment and intelligently only upload the files that we have not seen. This means that similar subsequent deployments should only need to upload a minority of files and this will hopefully make uploads even faster.

This functionality requires Wrangler v2.0.11 or higher.

## 2022-06-08

**Added branch alias to PR comments**

* PR comments for Pages previews now include the branch alias.

</page>

<page>
---
title: Known issues · Cloudflare Pages docs
description: "Here are some known bugs and issues with Cloudflare Pages:"
lastUpdated: 2025-12-12T21:19:19.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/platform/known-issues/
  md: https://developers.cloudflare.com/pages/platform/known-issues/index.md
---

Here are some known bugs and issues with Cloudflare Pages:

## Builds and deployment

* GitHub and GitLab are currently the only supported platforms for automatic CI/CD builds. [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/) allows you to integrate your own build platform or upload from your local computer.

* Incremental builds are currently not supported in Cloudflare Pages.

* Uploading a `/functions` directory through the dashboard's Direct Upload option does not work (refer to [Using Functions in Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/#functions)).

* Commits/PRs from forked repositories will not create a preview. Support for this will come in the future.

## Git configuration

* If you deploy using the Git integration, you cannot switch to Direct Upload later. However, if you already use a Git-integrated project and do not want to trigger deployments every time you push a commit, you can [disable/pause automatic deployments](https://developers.cloudflare.com/pages/configuration/git-integration/#disable-automatic-deployments). Alternatively, you can delete your Pages project and create a new one pointing at a different repository if you need to update it.

## Build configuration

* `*.pages.dev` subdomains currently cannot be changed. If you need to change your `*.pages.dev` subdomain, delete your project and create a new one.

* Hugo builds automatically run an old version. To run the latest version of Hugo (for example, `0.101.0`), you will need to set an environment variable. Set `HUGO_VERSION` to `0.101.0` or the Hugo version of your choice.

* By default, Cloudflare uses Node `12.18.0` in the Pages build environment. If you need to use a newer Node version, refer to the [Build configuration page](https://developers.cloudflare.com/pages/configuration/build-configuration/) for configuration options.

* For users migrating from Netlify, Cloudflare does not support Netlify's Forms feature. [Pages Functions](https://developers.cloudflare.com/pages/functions/) are available as an equivalent to Netlify's Serverless Functions.

## Custom Domains

* It is currently not possible to add a custom domain with

  * a wildcard, for example, `*.domain.com`.
  * a Worker already routed on that domain.

* It is currently not possible to add a custom domain with a Cloudflare Access policy already enabled on that domain.

* Cloudflare's Load Balancer does not work with `*.pages.dev` projects; an `Error 1000: DNS points to prohibited IP` will appear.

* When adding a custom domain, the domain will not verify if Cloudflare cannot validate a request for an SSL certificate on that hostname. In order for the SSL to validate, ensure Cloudflare Access or a Cloudflare Worker is allowing requests to the validation path: `http://{domain_name}/.well-known/acme-challenge/*`.

* [Advanced Certificates](https://developers.cloudflare.com/ssl/edge-certificates/advanced-certificate-manager/) cannot be used with Cloudflare Pages due to Cloudflare for SaaS's [certificate prioritization](https://developers.cloudflare.com/ssl/reference/certificate-and-hostname-priority/).

## Pages Functions

* [Functions](https://developers.cloudflare.com/pages/functions/) does not currently support adding/removing polyfills, so your bundler (for example, webpack) may not run.

* `passThroughOnException()` is not currently available for Advanced Mode Pages Functions (Pages Functions which use an `_worker.js` file).

* `passThroughOnException()` is not currently as resilient as it is in Workers. We currently wrap Pages Functions code in a `try`/`catch` block and fallback to calling `env.ASSETS.fetch()`. This means that any critical failures (such as exceeding CPU time or exceeding memory) may still throw an error.

## Enable Access on your `*.pages.dev` domain

If you would like to enable [Cloudflare Access](https://www.cloudflare.com/teams-access/)] for your preview deployments and your `*.pages.dev` domain, you must:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select your Pages project.

3. Go to **Settings** > **Enable access policy**.

4. Select **Manage** on the Access policy created for your preview deployments.

5. Under **Access** > **Applications**, select your project.

6. Select **Configure**.

7. Under **Public hostname**, in the **Subdomain** field, delete the wildcard (`*`) and select **Save application**. You may need to change the **Application name** at this step to avoid an error.

At this step, your `*.pages.dev` domain has been secured behind Access. To resecure your preview deployments:

1. Go back to your Pages project > **Settings** > **General** > and reselect **Enable access policy**.
2. Review that two Access policies, one for your `*.pages.dev` domain and one for your preview deployments (`*.<YOUR_SITE>.pages.dev`), have been created.

If you have a custom domain and protected your `*.pages.dev` domain behind Access, you must:

1. Select **Add an application** > **Self hosted** in [Cloudflare Zero Trust](https://one.dash.cloudflare.com/).
2. Input an **Application name** and select your custom domain from the *Domain* dropdown menu.
3. Select **Next** and configure your access rules to define who can reach the Access authentication page.
4. Select **Add application**.

Warning

If you do not configure an Access policy for your custom domain, an Access authentication will render but not work for your custom domain visitors. If your Pages project has a custom domain, make sure to add an Access policy as described above in steps 10 through 13 to avoid any authentication issues.

If you have an issue that you do not see listed, let the team know in the Cloudflare Workers Discord. Get your invite at [discord.cloudflare.com](https://discord.cloudflare.com), and share your bug report in the #pages-general channel.

## Delete a project with a high number of deployments

You may not be able to delete your Pages project if it has a high number (over 100) of deployments. The Cloudflare team is tracking this issue.

As a workaround, review the following steps to delete all deployments in your Pages project. After you delete your deployments, you will be able to delete your Pages project.

1. Download the `delete-all-deployments.zip` file by going to the following link: <https://pub-505c82ba1c844ba788b97b1ed9415e75.r2.dev/delete-all-deployments.zip>.
2. Extract the `delete-all-deployments.zip` file.
3. Open your terminal and `cd` into the `delete-all-deployments` directory.
4. In the `delete-all-deployments` directory, run `npm install` to install dependencies.
5. Review the following commands to decide which deletion you would like to proceed with:

* To delete all deployments except for the live production deployment (excluding [aliased deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/#preview-aliases)):

```sh
CF_API_TOKEN=<YOUR_CF_API_TOKEN> CF_ACCOUNT_ID=<ACCOUNT_ID> CF_PAGES_PROJECT_NAME=<PROJECT_NAME> npm start
```

* To delete all deployments except for the live production deployment (including [aliased deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/#preview-aliases), for example, `staging.example.pages.dev`):

```sh
CF_API_TOKEN=<YOUR_CF_API_TOKEN> CF_ACCOUNT_ID=<ACCOUNT_ID> CF_PAGES_PROJECT_NAME=<PROJECT_NAME> CF_DELETE_ALIASED_DEPLOYMENTS=true npm start
```

To find your Cloudflare API token, log in to the [Cloudflare dashboard](https://dash.cloudflare.com), select the user icon on the upper righthand side of your screen > go to **My Profile** > **API Tokens**.

You need a token with `Cloudflare Pages Edit` permissions.

To find your Account ID, refer to [Find your zone and account ID](https://developers.cloudflare.com/fundamentals/account/find-account-and-zone-ids/).

## Use Pages as Origin in Cloudflare Load Balancer

[Cloudflare Load Balancing](https://developers.cloudflare.com/load-balancing/) will not work without the host header set. To use a Pages project as target, make sure to select **Add host header** when [creating a pool](https://developers.cloudflare.com/load-balancing/pools/create-pool/#create-a-pool), and set both the host header value and the endpoint address to your `pages.dev` domain.

Refer to [Use Cloudflare Pages as origin](https://developers.cloudflare.com/load-balancing/pools/cloudflare-pages-origin/) for a complete tutorial.

</page>

<page>
---
title: Limits · Cloudflare Pages docs
description: Below are limits observed by the Cloudflare Free plan. For more
  details on removing these limits, refer to the Cloudflare plans page.
lastUpdated: 2026-01-23T14:17:15.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/platform/limits/
  md: https://developers.cloudflare.com/pages/platform/limits/index.md
---

Below are limits observed by the Cloudflare Free plan. For more details on removing these limits, refer to the [Cloudflare plans](https://www.cloudflare.com/plans) page.

Need a higher limit?

To request an adjustment to a limit, complete the [Limit Increase Request Form](https://forms.gle/ukpeZVLWLnKeixDu7). If the limit can be increased, Cloudflare will contact you with next steps.

## Builds

Each time you push new code to your Git repository, Pages will build and deploy your site. You can build up to 500 times per month on the Free plan. Refer to the Pro and Business plans in [Pricing](https://pages.cloudflare.com/#pricing) if you need more builds.

Builds will timeout after 20 minutes. Concurrent builds are counted per account.

## Custom domains

Based on your Cloudflare plan type, a Pages project is limited to a specific number of custom domains. This limit is on a per-project basis.

| Free | Pro | Business | Enterprise |
| - | - | - | - |
| 100 | 250 | 500 | 500[1](#user-content-fn-1) |

## Files

Pages uploads each file on your site to Cloudflare's globally distributed network to deliver a low latency experience to every user that visits your site. Cloudflare Pages sites can contain up to 20,000 files on the Free plan.

Paid plans can have up to 100,000 files per site. To enable this increased limit, set the environment variable `PAGES_WRANGLER_MAJOR_VERSION=4` in your Pages project settings.

## File size

The maximum file size for a single Cloudflare Pages site asset is 25 MiB.

Larger Files

To serve larger files, consider uploading them to [R2](https://developers.cloudflare.com/r2/) and utilizing the [public bucket](https://developers.cloudflare.com/r2/buckets/public-buckets/) feature. You can also use [custom domains](https://developers.cloudflare.com/r2/buckets/public-buckets/#connect-a-bucket-to-a-custom-domain), such as `static.example.com`, for serving these files.

## Functions

Requests to [Pages functions](https://developers.cloudflare.com/pages/functions/) count towards your quota for Workers plans, including requests from your Function to KV or Durable Object bindings.

Pages supports the [Standard usage model](https://developers.cloudflare.com/workers/platform/pricing/#example-pricing-standard-usage-model).

## Headers

A `_headers` file can have a maximum of 100 header rules.

An individual header in a `_headers` file can have a maximum of 2,000 characters. For managing larger headers, it is recommended to implement [Pages Functions](https://developers.cloudflare.com/pages/functions/).

## Preview deployments

You can have an unlimited number of [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) active on your project at a time.

## Redirects

A `_redirects` file can have a maximum of 2,000 static redirects and 100 dynamic redirects, for a combined total of 2,100 redirects. It is recommended to use [Bulk Redirects](https://developers.cloudflare.com/pages/configuration/redirects/#surpass-_redirects-limits) when you have a need for more than the `_redirects` file supports.

## Users

Your Pages site can be managed by an unlimited number of users via the Cloudflare dashboard. Note that this does not correlate with your Git project – you can manage both public and private repositories, open issues, and accept pull requests via without impacting your Pages site.

## Projects

Cloudflare Pages has a soft limit of 100 projects within your account in order to prevent abuse. If you need this limit raised, contact your Cloudflare account team or use the Limit Increase Request Form at the top of this page.

In order to protect against abuse of the service, Cloudflare may temporarily disable your ability to create new Pages projects, if you are deploying a large number of applications in a short amount of time. Contact support if you need this limit increased.

## Footnotes

1. If you need more custom domains, contact your account team. [↩](#user-content-fnref-1)

</page>

<page>
---
title: Choose a data or storage product · Cloudflare Pages docs
lastUpdated: 2025-05-09T17:32:11.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/platform/storage-options/
  md: https://developers.cloudflare.com/pages/platform/storage-options/index.md
---


</page>

<page>
---
title: Add a React form with Formspree · Cloudflare Pages docs
description: Learn how to add a React form with Formspree, a back-end service
  that handles form processing and storage.
lastUpdated: 2025-10-09T15:47:46.000Z
chatbotDeprioritize: false
tags: Forms,JavaScript
source_url:
  html: https://developers.cloudflare.com/pages/tutorials/add-a-react-form-with-formspree/
  md: https://developers.cloudflare.com/pages/tutorials/add-a-react-form-with-formspree/index.md
---

Almost every React website needs a form to collect user data. [Formspree](https://formspree.io/) is a back-end service that handles form processing and storage, allowing developers to include forms on their website without writing server-side code or functions.

In this tutorial, you will create a `<form>` component using React and add it to a single page application built with `create-react-app`. Though you are using `create-react-app` (CRA), the concepts will apply to any React framework including Next.js, Gatsby, and more. You will use Formspree to collect the submitted data and send out email notifications when new submissions arrive, without requiring any server-side coding.

You will deploy your site to Cloudflare Pages. Refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/) to familiarize yourself with the platform.

## Setup

To begin, create a new React project on your local machine with `create-react-app`. Then create a [new GitHub repository](https://repo.new/), and attach the GitHub location as a remote destination:

```sh
# create new project with create-react-app
npx create-react-app new-app
# enter new directory
cd new-app
# attach git remote
git remote add origin git@github.com:<username>/<repo>.git
# change default branch name
git branch -M main
```

You may now modify the React application in the `new-app` directory you created.

## The front-end code

The starting point for `create-react-app` includes a simple Hello World website. You will be adding a Contact Us form that accepts a name, email address, and message. The form code is adapted from the HTML Forms tutorial. For a more in-depth explanation of how HTML forms work and additional learning resources, refer to the [HTML Forms tutorial](https://developers.cloudflare.com/pages/tutorials/forms/).

First, create a new react component called `ContactForm.js` and place it in the `src` folder alongside `App.js`.

```plaintext
project-root/
├─ package.json
└─ src/
   ├─ ContactForm.js
   ├─ App.js
   └─ ...
```

Next, you will build the form component using a helper library from Formspree, [`@formspree/react`](https://github.com/formspree/formspree-react). This library contains a `useForm` hook to simplify the process of handling form submission events and managing form state.

Install it with:

* npm

  ```sh
  npm i @formspree/react
  ```

* yarn

  ```sh
  yarn add @formspree/react
  ```

* pnpm

  ```sh
  pnpm add @formspree/react
  ```

Then paste the following code snippet into the `ContactForm.js` file:

```jsx
import { useForm, ValidationError } from "@formspree/react";


export default function ContactForm() {
  const [state, handleSubmit] = useForm("YOUR_FORM_ID");


  if (state.succeeded) {
    return <p>Thanks for your submission!</p>;
  }


  return (
    <form method="POST" onSubmit={handleSubmit}>
      <label htmlFor="name">Full Name</label>
      <input id="name" type="text" name="name" required />
      <ValidationError prefix="Name" field="name" errors={state.errors} />


      <label htmlFor="email">Email Address</label>
      <input id="email" type="email" name="email" required />
      <ValidationError prefix="Email" field="email" errors={state.errors} />


      <label htmlFor="message">Message</label>
      <textarea id="message" name="message" required></textarea>
      <ValidationError prefix="Message" field="message" errors={state.errors} />


      <button type="submit" disabled={state.submitting}>
        Submit
      </button>
      <ValidationError errors={state.errors} />
    </form>
  );
}
```

Currently, the form contains a placeholder `YOUR_FORM_ID`. You replace this with your own form endpoint later in this tutorial.

The `useForm` hook returns a `state` object and a `handleSubmit` function which you pass to the `onSubmit` form attribute. Combined, these provide a way to submit the form data via AJAX and update form state depending on the response received.

For clarity, this form does not include any styling, but in the GitHub project (<https://github.com/formspree/formspree-example-cloudflare-react>) you can review an example of how to apply styles to the form.

Note

`ValidationError` components are helpers that display error messages for field errors, or general form errors (if no `field` attribute is provided). For more information on validation, refer to the [Formspree React documentation](https://help.formspree.io/hc/en-us/articles/360055613373-The-Formspree-React-library#validation).

To add this form to your website, import the component:

```jsx
import ContactForm from "./ContactForm";
```

Then insert the form into the page as a react component:

```jsx
<ContactForm />
```

For example, you can update your `src/App.js` file to add the form:

```jsx
import ContactForm from "./ContactForm"; // <-- import the form component
import logo from "./logo.svg";
import "./App.css";


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>


        {/* your contact form component goes here */}
        <ContactForm />
      </header>
    </div>
  );
}


export default App;
```

Now you have a single-page application containing a Contact Us form with several fields for the user to fill out. However, you have not set up the form to submit to a valid form endpoint yet. You will do that in the [next section](#the-formspree-back-end).

GitHub repository

The source code for this example is [available on GitHub](https://github.com/formspree/formspree-example-cloudflare-react). It is a live Pages application with a [live demo](https://formspree-example-cloudflare-react.pages.dev/) available, too.

## The Formspree back end

The React form is complete, however, when the user submits this form, they will get a `Form not found` error. To fix this, create a new Formspree form, and copy its unique ID into the form's `useForm` invocation.

To create a Formspree form, sign up for [an account on Formspree](https://formspree.io/register). Then create a new form with the **+ New form** button. Name your new form `Contact-us form` and update the recipient email to an email where you wish to receive your form submissions. Finally, select **Create Form**.

![Creating a Formspree form](https://developers.cloudflare.com/_astro/new-form-dialog.0SL1Ns7t_1IM46x.webp)

You will be presented with instructions on how to integrate your new form. Copy the form’s `hashid` (the last 8 alphanumeric characters from the URL) and paste it into the `useForm` function in the `ContactForm` component you created above.

![Newly generated form endpoint that you can copy to use in the ContactForm component](https://developers.cloudflare.com/_astro/form-endpoint.Be94Kac0_Z2ihA0w.webp)

Your component should now have a line like this:

```jsx
const [state, handleSubmit] = useForm("mqldaqwx");


/* replace the random-like string above with your own form's ID */
```

Now when you submit your form, you should be shown a Thank You message. The form data will be submitted to your account on [Formspree.io](https://formspree.io/).

From here you can adjust your form processing logic to update the [notification email address](https://help.formspree.io/hc/en-us/articles/115008379348-Changing-a-form-email-address), or add plugins like [Google Sheets](https://help.formspree.io/hc/en-us/articles/360036563573-Use-Google-Sheets-to-send-your-submissions-to-a-spreadsheet), [Slack](https://help.formspree.io/hc/en-us/articles/360045648933-Send-Slack-notifications), and more.

For more help setting up Formspree, refer to the following resources:

* For general help with Formspree, refer to the [Formspree help site](https://help.formspree.io/hc/en-us).
* For more help creating forms in React, refer to the [formspree-react documentation](https://help.formspree.io/hc/en-us/articles/360055613373-The-Formspree-React-library)
* For tips on integrating Formspree with popular platforms like Next.js, Gatsby and Eleventy, refer to the [Formspree guides](https://formspree.io/guides).

## Deployment

You are now ready to deploy your project.

If you have not already done so, save your progress within `git` and then push the commit(s) to the GitHub repository:

```sh
# Add all files
git add -A
# Commit w/ message
git commit -m "working example"
# Push commit(s) to remote
git push -u origin main
```

Your work now resides within the GitHub repository, which means that Pages is able to access it too.

If this is your first Cloudflare Pages project, refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/) for a complete walkthrough. After selecting the appropriate GitHub repository, you must configure your project with the following build settings:

* **Project name** – Your choice
* **Production branch** – `main`
* **Framework preset** – Create React App
* **Build command** – `npm run build`
* **Build output directory** – `build`

After selecting **Save and Deploy**, your Pages project will begin its first deployment. When successful, you will be presented with a unique `*.pages.dev` subdomain and a link to your live demo.

## Using environment variables with forms

Sometimes it is helpful to set up two forms, one for development, and one for production. That way you can develop and test your form without corrupting your production dataset, or sending test notifications to clients.

To set up production and development forms first create a second form in Formspree. Name this form Contact Us Testing, and note the form's [`hashid`](https://help.formspree.io/hc/en-us/articles/360015130174-Getting-your-form-s-hashid-).

Then change the `useForm` hook in your `ContactForm.js` file so that it is initialized with an environment variable, rather than a string:

```jsx
const [state, handleSubmit] = useForm(process.env.REACT_APP_FORM_ID);
```

In your Cloudflare Pages project settings, add the `REACT_APP_FORM_ID` environment variable to both the Production and Preview environments. Use your original form's `hashid` for Production, and the new test form's `hashid` for the Preview environment:

![Edit option for environment variables in your Production and Preview environments](https://developers.cloudflare.com/_astro/env-vars.0yB3DPeO_ZJzcNN.webp)

Now, when you commit and push changes to a branch of your git repository, a new preview app will be created with a form that submits to the test form URL. However, your production website will continue to submit to the original form URL.

Note

Create React App uses the prefix `REACT_APP_` to designate environment variables that are accessible to front-end JavaScript code. A different framework will use a different prefix to expose environment variables. For example, in the case of Next.js, the prefix is `NEXT_PUBLIC_`. Consult the documentation of your front-end framework to determine how to access environment variables from your React code.

In this tutorial, you built and deployed a website using Cloudflare Pages and Formspree to handle form submissions. You created a React application with a form that communicates with Formspree to process and store submission requests and send notifications.

If you would like to review the full source code for this application, you can find it on [GitHub](https://github.com/formspree/formspree-example-cloudflare-react).

## Related resources

* [Add an HTML form with Formspree](https://developers.cloudflare.com/pages/tutorials/add-an-html-form-with-formspree/)
* [HTML Forms](https://developers.cloudflare.com/pages/tutorials/forms/)

</page>

<page>
---
title: Add an HTML form with Formspree · Cloudflare Pages docs
description: Learn how to add an HTML form with Formspree, a back-end service
  that handles form processing and storage.
lastUpdated: 2025-10-09T15:47:46.000Z
chatbotDeprioritize: false
tags: Forms
source_url:
  html: https://developers.cloudflare.com/pages/tutorials/add-an-html-form-with-formspree/
  md: https://developers.cloudflare.com/pages/tutorials/add-an-html-form-with-formspree/index.md
---

Almost every website, whether it is a simple HTML portfolio page or a complex JavaScript application, will need a form to collect user data. [Formspree](https://formspree.io) is a back-end service that handles form processing and storage, allowing developers to include forms on their website without writing server-side code or functions.

In this tutorial, you will create a `<form>` using plain HTML and CSS and add it to a static HTML website hosted on Cloudflare Pages. Refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/) to familiarize yourself with the platform. You will use Formspree to collect the submitted data and send out email notifications when new submissions arrive, without requiring any JavaScript or back-end coding.

## Setup

To begin, create a [new GitHub repository](https://repo.new/). Then create a new local directory on your machine, initialize git, and attach the GitHub location as a remote destination:

```sh
# create new directory
mkdir new-project
# enter new directory
cd new-project
# initialize git
git init
# attach remote
git remote add origin git@github.com:<username>/<repo>.git
# change default branch name
git branch -M main
```

You may now begin working in the `new-project` directory you created.

## The website markup

You will only be using plain HTML for this example project. The home page will include a Contact Us form that accepts a name, email address, and message.

Note

The form code is adapted from the HTML Forms tutorial. For a more in-depth explanation of how HTML forms work and additional learning resources, refer to the [HTML Forms tutorial](https://developers.cloudflare.com/pages/tutorials/forms/).

The form code:

```html
<form method="POST" action="/">
  <label for="name">Full Name</label>
  <input id="name" type="text" name="name" pattern="[A-Za-z]+" required />


  <label for="email">Email Address</label>
  <input id="email" type="email" name="email" required />


  <label for="message">Message</label>
  <textarea id="message" name="message" required></textarea>


  <button type="submit">Submit</button>
</form>
```

The `action` attribute determines where the form data is sent. You will update this later to send form data to Formspree. All `<input>` tags must have a unique `name` in order to capture the user's data. The `for` and `id` values must match in order to link the `<label>` with the corresponding `<input>` for accessibility tools like screen readers.

Note

Refer to the [HTML Forms tutorial](https://developers.cloudflare.com/pages/tutorials/forms/) on how to build an HTML form.

To add this form to your website, first, create a `public/index.html` in your project directory. The `public` directory should contain all front-end assets, and the `index.html` file will serve as the home page for the website.

Copy and paste the following content into your `public/index.html` file, which includes the above form:

```html
<html lang="en">
  <head>
    <meta charset="utf8" />
    <title>Form Demo</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
  </head>
  <body>
    <!-- the form from above -->


    <form method="POST" action="/">
      <label for="name">Full Name</label>
      <input id="name" type="text" name="name" pattern="[A-Za-z]+" required />


      <label for="email">Email Address</label>
      <input id="email" type="email" name="email" required />


      <label for="message">Message</label>
      <textarea id="message" name="message" required></textarea>


      <button type="submit">Submit</button>
    </form>
  </body>
</html>
```

Now you have an HTML document containing a Contact Us form with several fields for the user to fill out. However, you have not yet set the `action` attribute to a server that can handle the form data. You will do this in the next section of this tutorial.

GitHub Repository

The source code for this example is [available on GitHub](https://github.com/formspree/formspree-example-cloudflare-html). It is a live Pages application with a [live demo](https://formspree-example-cloudflare-html.pages.dev/) available, too.

## The Formspree back end

The HTML form is complete, however, when the user submits this form, the data will be sent in a `POST` request to the `/` URL. No server exists to process the data at that URL, so it will cause an error. To fix that, create a new Formspree form, and copy its unique URL into the form's `action`.

To create a Formspree form, sign up for [an account on Formspree](https://formspree.io/register).

Next, create a new form with the **+ New form** button. Name it `Contact-us form` and update the recipient email to an email where you wish to receive your form submissions. Then select **Create Form**.

![Creating a Formspree form](https://developers.cloudflare.com/_astro/new-form-dialog.0SL1Ns7t_1IM46x.webp)

You will then be presented with instructions on how to integrate your new form.

![Formspree endpoint](https://developers.cloudflare.com/_astro/form-endpoint.Be94Kac0_Z2ihA0w.webp)

Copy the `Form Endpoint` URL and paste it into the `action` attribute of the form you created above.

```html
<form method="POST" action="https://formspree.io/f/mqldaqwx">
  <!-- replace with your own formspree endpoint -->
</form>
```

Now when you submit your form, you should be redirected to a Thank You page. The form data will be submitted to your account on [Formspree.io](https://formspree.io/).

You can now adjust your form processing logic to change the [redirect page](https://help.formspree.io/hc/en-us/articles/360012378333--Thank-You-redirect), update the [notification email address](https://help.formspree.io/hc/en-us/articles/115008379348-Changing-a-form-email-address), or add plugins like [Google Sheets](https://help.formspree.io/hc/en-us/articles/360036563573-Use-Google-Sheets-to-send-your-submissions-to-a-spreadsheet), [Slack](https://help.formspree.io/hc/en-us/articles/360045648933-Send-Slack-notifications) and more.

For more help setting up Formspree, refer to the following resources:

* For general help with Formspree, refer to the [Formspree help site](https://help.formspree.io/hc/en-us).
* For examples and inspiration for your own HTML forms, review the [Formspree form library](https://formspree.io/library).
* For tips on integrating Formspree with popular platforms like Next.js, Gatsby and Eleventy, refer to the [Formspree guides](https://formspree.io/guides).

## Deployment

You are now ready to deploy your project.

If you have not already done so, save your progress within `git` and then push the commit(s) to the GitHub repository:

```sh
# Add all files
git add -A
# Commit w/ message
git commit -m "working example"
# Push commit(s) to remote
git push -u origin main
```

Your work now resides within the GitHub repository, which means that Pages is able to access it too.

If this is your first Cloudflare Pages project, refer to [Get started](https://developers.cloudflare.com/pages/get-started/) for a complete setup guide. After selecting the appropriate GitHub repository, you must configure your project with the following build settings:

* **Project name** – Your choice
* **Production branch** – `main`
* **Framework preset** – None
* **Build command** – None / Empty
* **Build output directory** – `public`

After selecting **Save and Deploy**, your Pages project will begin its first deployment. When successful, you will be presented with a unique `*.pages.dev` subdomain and a link to your live demo.

In this tutorial, you built and deployed a website using Cloudflare Pages and Formspree to handle form submissions. You created a static HTML document with a form that communicates with Formspree to process and store submission requests and send notifications.

If you would like to review the full source code for this application, you can find it on [GitHub](https://github.com/formspree/formspree-example-cloudflare-html).

## Related resources

* [Add a React form with Formspree](https://developers.cloudflare.com/pages/tutorials/add-a-react-form-with-formspree/)
* [HTML Forms](https://developers.cloudflare.com/pages/tutorials/forms/)

</page>

<page>
---
title: Build a blog using Nuxt.js and Sanity.io on Cloudflare Pages · Cloudflare
  Pages docs
description: Build a blog application using Nuxt.js and Sanity.io and deploy it
  on Cloudflare Pages.
lastUpdated: 2025-10-08T21:39:15.000Z
chatbotDeprioritize: false
tags: Nuxt,Vue.js,JavaScript
source_url:
  html: https://developers.cloudflare.com/pages/tutorials/build-a-blog-using-nuxt-and-sanity/
  md: https://developers.cloudflare.com/pages/tutorials/build-a-blog-using-nuxt-and-sanity/index.md
---

In this tutorial, you will build a blog application using Nuxt.js and Sanity.io and deploy it on Cloudflare Pages. Nuxt.js is a powerful static site generator built on the front-end framework Vue.js. Sanity.io is a headless CMS tool built for managing your application's data without needing to maintain a database.

## Prerequisites

* A recent version of [npm](https://docs.npmjs.com/getting-started) on your computer
* A [Sanity.io](https://www.sanity.io) account

## Creating a new Sanity project

To begin, create a new Sanity project, using one of Sanity's templates, the blog template. If you would like to customize your configuration, you can modify the schema or pick a custom template.

### Installing Sanity and configuring your dataset

Create your new Sanity project by installing the `@sanity/cli` client from npm, and running `sanity init` in your terminal:

* npm

  ```sh
  npm i @sanity/cli
  ```

* yarn

  ```sh
  yarn add @sanity/cli
  ```

* pnpm

  ```sh
  pnpm add @sanity/cli
  ```

- npm

  ```sh
  npx sanity init
  ```

- yarn

  ```sh
  yarn sanity init
  ```

- pnpm

  ```sh
  pnpm sanity init
  ```

When you create a Sanity project, you can choose to use one of their pre-defined schemas. Schemas describe the shape of your data in your Sanity dataset -- if you were to start a brand new project, you may choose to initialize the schema from scratch, but for now, select the **Blog** schema.

### Inspecting your schema

With your project created, you can navigate into the folder and start up the studio locally:

```sh
cd my-sanity-project
```

* npm

  ```sh
  npx sanity start
  ```

* yarn

  ```sh
  yarn sanity start
  ```

* pnpm

  ```sh
  pnpm sanity start
  ```

The Sanity studio is where you can create new records for your dataset. By default, running the studio locally makes it available at `localhost:3333`– go there now and create your author record. You can also create blog posts here.

![Creating a blog post in the Sanity Project dashboard](https://developers.cloudflare.com/_astro/sanity-studio.Cg5gfJOU_2m7it5.webp)

### Deploying your dataset

When you are ready to deploy your studio, run `sanity deploy` to choose a unique URL for your studio. This means that you (or anyone else you invite to manage your blog) can access the studio at a `yoururl.sanity.studio` domain.

* npm

  ```sh
  npx sanity deploy
  ```

* yarn

  ```sh
  yarn sanity deploy
  ```

* pnpm

  ```sh
  pnpm sanity deploy
  ```

Once you have deployed your Sanity studio:

1. Go into Sanity's management panel ([manage.sanity.io](https://manage.sanity.io)).
2. Find your project.
3. Select **API**.
4. Add `http://localhost:3000` as an allowed CORS origin for your project.

This means that requests that come to your Sanity dataset from your Nuxt application will be allowlisted.

![Your Sanity project's CORS settings](https://developers.cloudflare.com/_astro/cors.B4xMgIh9_Z1LDqTl.webp)

## Creating a new Nuxt.js project

Next, create a Nuxt.js project. In a new terminal, use `create-nuxt-app` to set up a new Nuxt project:

* npm

  ```sh
  npx create-nuxt-app blog
  ```

* yarn

  ```sh
  yarn dlx create-nuxt-app blog
  ```

* pnpm

  ```sh
  pnpx create-nuxt-app blog
  ```

Importantly, ensure that you select a rendering mode of **Universal (SSR / SSG)** and a deployment target of **Static (Static/JAMStack hosting)**, while going through the setup process.

After you have completed your project, `cd` into your new project, and start a local development server by running `yarn dev` (or, if you chose npm as your package manager, `npm run dev`):

```sh
cd blog
```

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

### Integrating Sanity.io

After your Nuxt.js application is set up, add Sanity's `@sanity/nuxt` plugin to your Nuxt project:

* npm

  ```sh
  npm i @nuxtjs/sanity @sanity/client
  ```

* yarn

  ```sh
  yarn add @nuxtjs/sanity @sanity/client
  ```

* pnpm

  ```sh
  pnpm add @nuxtjs/sanity @sanity/client
  ```

To configure the plugin in your Nuxt.js application, you will need to provide some configuration details. The easiest way to do this is to copy the `sanity.json` folder from your studio into your application directory (though there are other methods, too: [refer to the `@nuxt/sanity` documentation](https://sanity.nuxtjs.org/getting-started/quick-start/).

```sh
cp ../my-sanity-project/sanity.json .
```

Finally, add `@nuxtjs/sanity` as a **build module** in your Nuxt configuration:

```js
{
  buildModules: ["@nuxtjs/sanity"];
}
```

### Setting up components

With Sanity configured in your application, you can begin using it to render your blog. You will now set up a few pages to pull data from your Sanity API and render it. Note that if you are not familiar with Nuxt, it is recommended that you review the [Nuxt guide](https://nuxtjs.org/guide), which will teach you some fundamentals concepts around building applications with Nuxt.

### Setting up the index page

To begin, update the `index` page, which will be rendered when you visit the root route (`/`). In `pages/index.vue`:

```html
<template>
  <div class="container">
    <div>
      <h1 class="title">My Blog</h1>
    </div>
    <div class="posts">
      <div v-for="post in posts" :key="post._id">
        <h2><a v-bind:href="post.slug.current" v-text="post.title" /></h2>
      </div>
    </div>
  </div>
</template>


<script>
  import { groq } from "@nuxtjs/sanity";


  export default {
    async asyncData({ $sanity }) {
      const query = groq`*[_type == "post"]`;
      const posts = await $sanity.fetch(query);
      return { posts };
    },
  };
</script>


<style>
  .container {
    margin: 2rem;
    min-height: 100vh;
  }
  .posts {
    margin: 2rem 0;
  }
</style>
```

Vue SFCs, or *single file components*, are a unique Vue feature that allow you to combine JavaScript, HTML and CSS into a single file. In `pages/index.vue`, a `template` tag is provided, which represents the Vue component.

Importantly, `v-for` is used as a directive to tell Vue to render HTML for each `post` in an array of `posts`:

```html
<div v-for="post in posts" :key="post._id">
  <h2><a v-bind:href="post.slug.current" v-text="post.title" /></h2>
</div>
```

To populate that `posts` array, the `asyncData` function is used, which is provided by Nuxt to make asynchronous calls (for example, network requests) to populate the page's data.

The `$sanity` object is provided by the Nuxt and Sanity.js integration as a way to make requests to your Sanity dataset. By calling `$sanity.fetch`, and passing a query, you can retrieve specific data from our Sanity dataset, and return it as your page's data.

If you have not used Sanity before, you will probably be unfamiliar with GROQ, the GRaph Oriented Query language provided by Sanity for interfacing with your dataset. GROQ is a powerful language that allows you to tell the Sanity API what data you want out of your dataset. For our first query, you will tell Sanity to retrieve every object in the dataset with a `_type` value of `post`:

```js
const query = groq`*[_type == "post"]`;
const posts = await $sanity.fetch(query);
```

### Setting up the blog post page

Our `index` page renders a link for each blog post in our dataset, using the `slug` value to set the URL for a blog post. For example, if I create a blog post called "Hello World" and set the slug to `hello-world`, my Nuxt application should be able to handle a request to the page `/hello-world`, and retrieve the corresponding blog post from Sanity.

Nuxt has built-in support for these kind of pages, by creating a new file in `pages` in the format `_slug.vue`. In the `asyncData` function of your page, you can then use the `params` argument to reference the slug:

```html
<script>
  export default {
    async asyncData({ params, $sanity }) {
      console.log(params); // { slug: "hello-world" }
    },
  };
</script>
```

With that in mind, you can build `pages/_slug.vue` to take the incoming `slug` value, make a query to Sanity to find the matching blog post, and render the `post` title for the blog post:

```html
<template>
  <div class="container">
    <div v-if="post">
      <h1 class="title" v-text="post.title" />
      <div class="content"></div>
    </div>
    <h4><a href="/">← Go back</a></h4>
  </div>
</template>


<script>
  import { groq } from "@nuxtjs/sanity";


  export default {
    async asyncData({ params, $sanity }) {
      const query = groq`*[_type == "post" && slug.current == "${params.slug}"][0]`;
      const post = await $sanity.fetch(query);
      return { post };
    },
  };
</script>


<style>
  .container {
    margin: 2rem;
    min-height: 100vh;
  }


  .content {
    margin: 2rem 0;
    max-width: 38rem;
  }


  p {
    margin: 1rem 0;
  }
</style>
```

When visiting, for example, `/hello-world`, Nuxt will take the incoming slug `hello-world`, and make a GROQ query to Sanity for any objects with a `_type` of `post`, as well as a slug that matches the value `/hello-world`. From that set, you can get the first object in the array (using the array index operator you would find in JavaScript – `[0]`) and set it as `post` in your page data.

### Rendering content for a blog post

You have rendered the `post` title for our blog, but you are still missing the content of the blog post itself. To render this, import the [`sanity-blocks-vue-component`](https://github.com/rdunk/sanity-blocks-vue-component) package, which takes Sanity's [Portable Text](https://www.sanity.io/docs/presenting-block-text) format and renders it as a Vue component.

First, install the npm package:

* npm

  ```sh
  npm i sanity-blocks-vue-component
  ```

* yarn

  ```sh
  yarn add sanity-blocks-vue-component
  ```

* pnpm

  ```sh
  pnpm add sanity-blocks-vue-component
  ```

After the package is installed, create `plugins/sanity-blocks.js`, which will import the component and register it as the Vue component `block-content`:

```js
import Vue from "vue";
import BlockContent from "sanity-blocks-vue-component";
Vue.component("block-content", BlockContent);
```

In your Nuxt configuration, `nuxt.config.js`, import that file as part of the `plugins` directive:

```js
{
  plugins: ["@/plugins/sanity-blocks.js"];
}
```

In `pages/_slug.vue`, you can now use the `<block-content>` component to render your content. This takes the format of a custom HTML component, and takes three arguments: `:blocks`, which indicates what to render (in our case, `child`), `v-for`, which accepts an iterator of where to get `child` from (in our case, `post.body`), and `:key`, which helps Vue [keep track of state rendering](https://vuejs.org/v2/guide/list.html#Maintaining-State) by providing a unique value for each post: that is, the `_id` value.

```html
<template>
  <div class="container">
    <div v-if="post">
      <h1 class="title" v-text="post.title" />
      <div class="content">
        <block-content
          :blocks="child"
          v-for="child in post.body"
          :key="child._id"
        />
      </div>
    </div>
    <h4><a href="/">← Go back</a></h4>
  </div>
</template>


<script>
  import { groq } from "@nuxtjs/sanity";


  export default {
    async asyncData({ params, $sanity }) {
      const query = groq`*[_type == "post" && slug.current == "${params.slug}"][0]`;
      const post = await $sanity.fetch(query);
      return { post };
    },
  };
</script>


<style>
  .container {
    margin: 2rem;
    min-height: 100vh;
  }


  .content {
    margin: 2rem 0;
    max-width: 38rem;
  }


  p {
    margin: 1rem 0;
  }
</style>
```

In `pages/index.vue`, you can use the `block-content` component to render a summary of the content, by taking the first block in your blog post content and rendering it:

```html
<template>
  <div class="container">
    <div>
      <h1 class="title">My Blog</h1>
    </div>
    <div class="posts">
      <div v-for="post in posts" :key="post._id">
        <h2><a v-bind:href="post.slug.current" v-text="post.title" /></h2>
        <div class="summary">
          <block-content
            :blocks="post.body[0]"
            v-bind:key="post.body[0]._id"
            v-if="post.body.length"
          />
        </div>
      </div>
    </div>
  </div>
</template>


<script>
  import { groq } from "@nuxtjs/sanity";


  export default {
    async asyncData({ $sanity }) {
      const query = groq`*[_type == "post"]`;
      const posts = await $sanity.fetch(query);
      return { posts };
    },
  };
</script>


<style>
  .container {
    margin: 2rem;
    min-height: 100vh;
  }
  .posts {
    margin: 2rem 0;
  }
  .summary {
    margin-top: 0.5rem;
  }
</style>
```

There are many other things inside of your blog schema that you can add to your project. As an exercise, consider one of the following to continue developing your understanding of how to build with a headless CMS:

* Create `pages/authors.vue`, and render a list of authors (similar to `pages/index.vue`, but for objects with `_type == "author"`)
* Read the Sanity docs on [using references in GROQ](https://www.sanity.io/docs/how-queries-work#references-and-joins-db43dfd18d7d), and use it to render author information in a blog post page

## Publishing with Cloudflare Pages

Publishing your project with Cloudflare Pages is a two-step process: first, push your project to GitHub, and then in the Cloudflare Pages dashboard, set up a new project based on that GitHub repository. Pages will deploy a new version of your site each time you publish, and will even set up preview deployments whenever you open a new pull request.

To push your project to GitHub, [create a new repository](https://repo.new), and follow the instructions to push your local Git repository to GitHub.

After you have pushed your project to GitHub, deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application** > **Pages** > **Import an existing Git repository**.

3. Select the new GitHub repository that you created and select **Begin setup**.

4. In the **Set up builds and deployments** section, under **Build settings** > **Framework preset**, choose *Nuxt*. Pages will set the correct fields for you automatically.

When your site has been deployed, you will receive a unique URL to view it in production.

In order to automatically deploy your project when your Sanity.io data changes, you can use [Deploy Hooks](https://developers.cloudflare.com/pages/configuration/deploy-hooks/). Create a new Deploy Hook URL in your **Pages project** > **Settings**. In your Sanity project's Settings page, find the **Webhooks** section, and add the Deploy Hook URL, as seen below:

![Adding a Deploy Hook URL on Sanity's dashboard](https://developers.cloudflare.com/_astro/hooks.CikwC9IO_NHazD.webp)

Now, when you make a change to your Sanity.io dataset, Sanity will make a request to your unique Deploy Hook URL, which will begin a new Cloudflare Pages deploy. By doing this, your Pages application will remain up-to-date as you add new blog posts, or edit existing ones.

## Conclusion

By completing this guide, you have successfully deployed your own blog, powered by Nuxt, Sanity.io, and Cloudflare Pages. You can find the source code for both codebases on GitHub:

* Blog front end: <https://github.com/signalnerve/nuxt-sanity-blog>
* Sanity dataset: <https://github.com/signalnerve/sanity-blog-schema>

If you enjoyed this tutorial, you may be interested in learning how you can use Cloudflare Workers, our powerful serverless function platform, to augment your existing site. Refer to the [Build an API for your front end using Pages Functions tutorial](https://developers.cloudflare.com/pages/tutorials/build-an-api-with-pages-functions/) to learn more.

</page>

<page>
---
title: Build an API for your front end using Pages Functions · Cloudflare Pages docs
description: This tutorial builds a full-stack Pages application using the React framework.
lastUpdated: 2025-10-09T15:47:46.000Z
chatbotDeprioritize: false
tags: JavaScript
source_url:
  html: https://developers.cloudflare.com/pages/tutorials/build-an-api-with-pages-functions/
  md: https://developers.cloudflare.com/pages/tutorials/build-an-api-with-pages-functions/index.md
---

In this tutorial, you will build a full-stack Pages application. Your application will contain:

* A front end, built using Cloudflare Pages and the [React framework](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/).
* A JSON API, built with [Pages Functions](https://developers.cloudflare.com/pages/functions/get-started/), that returns blog posts that can be retrieved and rendered in your front end.

If you prefer to work with a headless CMS rather than an API to render your blog content, refer to the [headless CMS tutorial](https://developers.cloudflare.com/pages/tutorials/build-a-blog-using-nuxt-and-sanity/).

## Video Tutorial

## 1. Build your front end

To begin, create a new Pages application using the React framework.

### Create a new React project

In your terminal, create a new React project called `blog-frontend` using the `create-vite` command. Go into the newly created `blog-frontend` directory and start a local development server:

```sh
npx create-vite -t react blog-frontend
cd blog-frontend
npm install
npm run dev
```

### Set up your React project

To set up your React project:

1. Install the [React Router](https://reactrouter.com/en/main/start/tutorial) in the root of your `blog-frontend` directory.



* [npm](#tab-panel-3104)
* [yarn](#tab-panel-3105)
* [pnpm](#tab-panel-3106)

```sh
npm i react-router-dom@6
```

```sh
yarn add react-router-dom@6
```

```sh
pnpm add react-router-dom@6
```

s

1. Clear the contents of `src/App.js`. Copy and paste the following code to import the React Router into `App.js`, and set up a new router with two routes:

```js
import { Routes, Route } from "react-router-dom";


import Posts from "./components/posts";
import Post from "./components/post";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Posts />} />
      <Route path="/posts/:id" element={<Post />} />
    </Routes>
  );
}


export default App;
```

1. In the `src` directory, create a new folder called `components`.
2. In the `components` directory, create two files: `posts.js`, and `post.js`. These files will load the blog posts from your API, and render them.
3. Populate `posts.js` with the following code:

```js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";


const Posts = () => {
  const [posts, setPosts] = useState([]);


  useEffect(() => {
    const getPosts = async () => {
      const resp = await fetch("/api/posts");
      const postsResp = await resp.json();
      setPosts(postsResp);
    };


    getPosts();
  }, []);


  return (
    <div>
      <h1>Posts</h1>
      {posts.map((post) => (
        <div key={post.id}>
          <h2>
            <Link to={`/posts/${post.id}`}>{post.title}</Link>
          </h2>
        </div>
      ))}
    </div>
  );
};


export default Posts;
```

1. Populate `post.js` with the following code:

```js
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";


const Post = () => {
  const [post, setPost] = useState({});
  const { id } = useParams();


  useEffect(() => {
    const getPost = async () => {
      const resp = await fetch(`/api/post/${id}`);
      const postResp = await resp.json();
      setPost(postResp);
    };


    getPost();
  }, [id]);


  if (!Object.keys(post).length) return <div />;


  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.text}</p>
      <p>
        <em>Published {new Date(post.published_at).toLocaleString()}</em>
      </p>
      <p>
        <Link to="/">Go back</Link>
      </p>
    </div>
  );
};


export default Post;
```

## 2. Build your API

You will now create a Pages Functions that stores your blog content and retrieves it via a JSON API.

### Write your Pages Function

To create the Pages Function that will act as your JSON API:

1. Create a `functions` directory in your `blog-frontend` directory.
2. In `functions`, create a directory named `api`.
3. In `api`, create a `posts.js` file in the `api` directory.
4. Populate `posts.js` with the following code:

```js
import posts from "./post/data";


export function onRequestGet() {
  return Response.json(posts);
}
```

This code gets blog data (from `data.js`, which you will make in step 8) and returns it as a JSON response from the path `/api/posts`.

1. In the `api` directory, create a directory named `post`.
2. In the `post` directory, create a `data.js` file.
3. Populate `data.js` with the following code. This is where your blog content, blog title, and other information about your blog lives.

```js
const posts = [
  {
    id: 1,
    title: "My first blog post",
    text: "Hello world! This is my first blog post on my new Cloudflare Workers + Pages blog.",
    published_at: new Date("2020-10-23"),
  },
  {
    id: 2,
    title: "Updating my blog",
    text: "It's my second blog post! I'm still writing and publishing using Cloudflare Workers + Pages :)",
    published_at: new Date("2020-10-26"),
  },
];


export default posts;
```

1. In the `post` directory, create an `[[id]].js` file.
2. Populate `[[id]].js` with the following code:

```js
import posts from "./data";


export function onRequestGet(context) {
  const id = context.params.id;


  if (!id) {
    return new Response("Not found", { status: 404 });
  }


  const post = posts.find((post) => post.id === Number(id));


  if (!post) {
    return new Response("Not found", { status: 404 });
  }


  return Response.json(post);
}
```

`[[id]].js` is a [dynamic route](https://developers.cloudflare.com/pages/functions/routing#dynamic-routes) which is used to accept a blog post `id`.

## 3. Deploy

After you have configured your Pages application and Pages Function, deploy your project using the Wrangler or via the dashboard.

### Deploy with Wrangler

In your `blog-frontend` directory, run [`wrangler pages deploy`](https://developers.cloudflare.com/workers/wrangler/commands/#deploy-1) to deploy your project to the Cloudflare dashboard.

```sh
wrangler pages deploy blog-frontend
```

### Deploy via the dashboard

To deploy via the Cloudflare dashboard, you will need to create a new Git repository for your Pages project and connect your Git repository to Cloudflare. This tutorial uses GitHub as its Git provider.

#### Create a new repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, prepare and push your local application to GitHub by running the following commands in your terminal:

```sh
git init
git remote add origin https://github.com/<YOUR-GH-USERNAME>/<REPOSITORY-NAME>
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

#### Deploy with Cloudflare Pages

Deploy your application to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application** > **Pages** > **Import an existing Git repository**.

3. Select the new GitHub repository that you created and, in the **Set up builds and deployments** section, provide the following information:

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command | `npm run build` |
| Build directory | `build` |

After configuring your site, begin your first deploy. You should see Cloudflare Pages installing `blog-frontend`, your project dependencies, and building your site.

By completing this tutorial, you have created a full-stack Pages application.

## Related resources

* Learn about [Pages Functions routing](https://developers.cloudflare.com/pages/functions/routing)

</page>

<page>
---
title: Create a HTML form · Cloudflare Pages docs
description: This tutorial will briefly touch upon the basics of HTML forms.
  This tutorial will make heavy use of Cloudflare Pages and its Workers
  integration.
lastUpdated: 2025-10-09T15:47:46.000Z
chatbotDeprioritize: false
tags: Forms,JavaScript
source_url:
  html: https://developers.cloudflare.com/pages/tutorials/forms/
  md: https://developers.cloudflare.com/pages/tutorials/forms/index.md
---

In this tutorial, you will create a simple `<form>` using plain HTML and CSS and deploy it to Cloudflare Pages. While doing so, you will learn about some of the HTML form attributes and how to collect submitted data within a Worker.

MDN Introductory Series

This tutorial will briefly touch upon the basics of HTML forms. For a more in-depth overview, refer to MDN's [Web Forms – Working with user data](https://developer.mozilla.org/en-US/docs/Learn/Forms) introductory series.

This tutorial will make heavy use of Cloudflare Pages and [its Workers integration](https://developers.cloudflare.com/pages/functions/). Refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/) guide to familiarize yourself with the platform.

## Overview

On the web, forms are a common point of interaction between the user and the web document. They allow a user to enter data and, generally, submit their data to a server. A form is comprised of at least one form input, which can vary from text fields to dropdowns to checkboxes and more.

Each input should be named – using the [`name`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-name) attribute – so that the input's value has an identifiable name when received by the server. Additionally, with the advancement of HTML5, form elements may declare additional attributes to opt into automatic form validation. The available validations vary by input type; for example, a text input that accepts emails (via [`type=email`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#input_types)) can ensure that the value looks like a valid email address, a number input (via `type=number`) will only accept integers or decimal values (if allowed), and generic text inputs can define a custom [`pattern`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-pattern) to allow. However, all inputs can declare whether or not a value is [`required`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-required).

Below is an example HTML5 form with a few inputs and their validation rules defined:

```html
<form method="POST" action="/api/submit">
  <input type="text" name="fullname" pattern="[A-Za-z]+" required />
  <input type="email" name="email" required />
  <input type="number" name="age" min="18" required />


  <button type="submit">Submit</button>
</form>
```

If an HTML5 form has validation rules defined, browsers will automatically check all rules when the user attempts to submit the form. Should there be any errors, the submission is prevented and the browser displays the error message(s) to the user for correction. The `<form>` will only `POST` data to the `/submit` endpoint when there are no outstanding validation errors. This entire process is native to HTML5 and only requires the appropriate form and input attributes to exist — no JavaScript is required.

Form elements may also have a [`<label>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label) element associated with them, allowing you to clearly describe each input. This is great for visual clarity, of course, but it also allows for more accessible user experiences since the HTML markup is more well-defined. Assistive technologies directly benefit from this; for example, screen readers can announce which `<input>` is focused. And when a `<label>` is clicked, its assigned form input is focused instead, increasing the activation area for the input.

To enable this, you must create a `<label>` element for each input and assign each `<input>` element and unique `id` attribute value. The `<label>` must also possess a [`for`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label#attr-for) attribute that reflects its input's unique `id` value. Amending the previous snippet should produce the following:

```html
<form method="POST" action="/api/submit">
  <label for="i-fullname">Full Name</label>
  <input
    id="i-fullname"
    type="text"
    name="fullname"
    pattern="[A-Za-z]+"
    required
  />


  <label for="i-email">Email Address</label>
  <input id="i-email" type="email" name="email" required />


  <label for="i-age">Your Age</label>
  <input id="i-age" type="number" name="age" min="18" required />


  <button type="submit">Submit</button>
</form>
```

Note

Your `for` and `id` values do not need to exactly match the values shown above. You may use any `id` values so long as they are unique to the HTML document. A `<label>` can only be linked with an `<input>` if the `for` and `id` attributes match.

When this `<form>` is submitted with valid data, its data contents are sent to the server. You may customize how and where this data is sent by declaring attributes on the form itself. If you do not provide these details, the `<form>` will GET the data to the current URL address, which is rarely the desired behavior. To fix this, at minimum, you need to define an [`action`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-action) attribute with the target URL address, but declaring a [`method`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-method) is often recommended too, even if you are redeclaring the default `GET` value.

By default, HTML forms send their contents in the `application/x-www-form-urlencoded` MIME type. This value will be reflected in the `Content-Type` HTTP header, which the receiving server must read to determine how to parse the data contents. You may customize the MIME type through the [`enctype`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-enctype) attribute. For example, to accept files (via `type=file`), you must change the `enctype` to the `multipart/form-data` value:

```html
<form method="POST" action="/api/submit" enctype="multipart/form-data">
  <label for="i-fullname">Full Name</label>
  <input
    id="i-fullname"
    type="text"
    name="fullname"
    pattern="[A-Za-z]+"
    required
  />


  <label for="i-email">Email Address</label>
  <input id="i-email" type="email" name="email" required />


  <label for="i-age">Your Age</label>
  <input id="i-age" type="number" name="age" min="18" required />


  <label for="i-avatar">Profile Picture</label>
  <input id="i-avatar" type="file" name="avatar" required />


  <button type="submit">Submit</button>
</form>
```

Because the `enctype` changed, the browser changes how it sends data to the server too. The `Content-Type` HTTP header will reflect the new approach and the HTTP request's body will conform to the new MIME type. The receiving server must accommodate the new format and adjust its request parsing method.

## Live example

The rest of this tutorial will focus on building an HTML form on Pages, including a Worker to receive and parse the form submissions.

GitHub Repository

The source code for this example is [available on GitHub](https://github.com/cloudflare/submit.pages.dev). It is a live Pages application with a [live demo](https://submit.pages.dev/) available, too.

### Setup

To begin, create a [new GitHub repository](https://repo.new/). Then create a new local directory on your machine, initialize git, and attach the GitHub location as a remote destination:

```sh
# create new directory
mkdir new-project
# enter new directory
cd new-project
# initialize git
git init
# attach remote
git remote add origin git@github.com:<username>/<repo>.git
# change default branch name
git branch -M main
```

You may now begin working in the `new-project` directory you created.

### Markup

The form for this example is fairly straightforward. It includes an array of different input types, including checkboxes for selecting multiple values. The form also does not include any validations so that you may see how empty and/or missing values are interpreted on the server.

You will only be using plain HTML for this example project. You may use your preferred JavaScript framework, but raw languages have been chosen for simplicity and familiarity – all frameworks are abstracting and/or producing a similar result.

Create a `public/index.html` in your project directory. All front-end assets will exist within this `public` directory and this `index.html` file will serve as the home page for the website.

Copy and paste the following content into your `public/index.html` file:

```html
<html lang="en">
  <head>
    <meta charset="utf8" />
    <title>Form Demo</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
  </head>
  <body>
    <form method="POST" action="/api/submit">
      <div class="input">
        <label for="name">Full Name</label>
        <input id="name" name="name" type="text" />
      </div>


      <div class="input">
        <label for="email">Email Address</label>
        <input id="email" name="email" type="email" />
      </div>


      <div class="input">
        <label for="referers">How did you hear about us?</label>
        <select id="referers" name="referers">
          <option hidden disabled selected value></option>
          <option value="Facebook">Facebook</option>
          <option value="Twitter">Twitter</option>
          <option value="Google">Google</option>
          <option value="Bing">Bing</option>
          <option value="Friends">Friends</option>
        </select>
      </div>


      <div class="checklist">
        <label>What are your favorite movies?</label>
        <ul>
          <li>
            <input id="m1" type="checkbox" name="movies" value="Space Jam" />
            <label for="m1">Space Jam</label>
          </li>
          <li>
            <input
              id="m2"
              type="checkbox"
              name="movies"
              value="Little Rascals"
            />
            <label for="m2">Little Rascals</label>
          </li>
          <li>
            <input id="m3" type="checkbox" name="movies" value="Frozen" />
            <label for="m3">Frozen</label>
          </li>
          <li>
            <input id="m4" type="checkbox" name="movies" value="Home Alone" />
            <label for="m4">Home Alone</label>
          </li>
        </ul>
      </div>


      <button type="submit">Submit</button>
    </form>
  </body>
</html>
```

This HTML document will contain a form with a few fields for the user to fill out. Because there is no validation rules within the form, all fields are optional and the user is able to submit an empty form. For this example, this is intended behavior.

Optional content

Technically, only the `<form>` and its child elements are necessary. The `<head>` and the enclosing `<html>` and `<body>` tags are optional and not strictly necessary for a valid HTML document.

The HTML page is also completely unstyled at this point, relying on the browsers' default UI and color palettes. Styling the page is entirely optional and not necessary for the form to function. If you would like to attach a CSS stylesheet, you may [add a `<link>` element](https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps/Getting_started#adding_css_to_our_document). Refer to the finished tutorial's [source code](https://github.com/cloudflare/submit.pages.dev/blob/8c0594f48681935c268987f2f08bcf3726a74c57/public/index.html#L11) for an example or any inspiration – the only requirement is that your CSS stylesheet also resides within the `public` directory.

### Worker

The HTML form is complete and ready for deployment. When the user submits this form, all data will be sent in a `POST` request to the `/api/submit` URL. This is due to the form's `method` and `action` attributes. However, there is currently no request handler at the `/api/submit` address. You will now create it.

Cloudflare Pages offers a [Functions](https://developers.cloudflare.com/pages/functions/) feature, which allows you to define and deploy Workers for dynamic behaviors.

Functions are linked to the `functions` directory and conveniently construct URL request handlers in relation to the `functions` file structure. For example, the `functions/about.js` file will map to the `/about` URL and `functions/hello/[name].js` will handle the `/hello/:name` URL pattern, where `:name` is any matching URL segment. Refer to the [Functions routing](https://developers.cloudflare.com/pages/functions/routing/) documentation for more information.

To define a handler for `/api/submit`, you must create a `functions/api/submit.js` file. This means that your `functions` and `public` directories should be siblings, with a total project structure similar to the following:

```txt
├── functions
│   └── api
│       └── submit.js
└── public
    └── index.html
```

The `<form>` will send `POST` requests, which means that the `functions/api/submit.js` file needs to export an `onRequestPost` handler:

```js
/**
 * POST /api/submit
 */
export async function onRequestPost(context) {
  // TODO: Handle the form submission
}
```

The `context` parameter is an object filled with several values of potential interest. For this example, you only need the [`Request`](https://developers.cloudflare.com/workers/runtime-apis/request/) object, which can be accessed through the `context.request` key.

As mentioned, a `<form>` defaults to the `application/x-www-form-urlencoded` MIME type when submitting. And, for more advanced scenarios, the `enctype="multipart/form-data"` attribute is needed. Luckily, both MIME types can be parsed and treated as [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData). This means that with Workers – which includes Pages Functions – you are able to use the native [`Request.formData`](https://developer.mozilla.org/en-US/docs/Web/API/Request/formData) parser.

For illustrative purposes, the example application's form handler will reply with all values it received. A `Response` must always be returned by the handler, too:

```js
/**
 * POST /api/submit
 */
export async function onRequestPost(context) {
  try {
    let input = await context.request.formData();
    let pretty = JSON.stringify([...input], null, 2);
    return new Response(pretty, {
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
    });
  } catch (err) {
    return new Response("Error parsing JSON content", { status: 400 });
  }
}
```

With this handler in place, the example is now fully functional. When a submission is received, the Worker will reply with a JSON list of the `FormData` key-value pairs.

However, if you want to reply with a JSON object instead of the key-value pairs (an Array of Arrays), then you must do so manually. Recently, JavaScript added the [`Object.fromEntries`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries) utility. This works well in some cases; however, the example `<form>` includes a `movies` checklist that allows for multiple values. If using `Object.fromEntries`, the generated object would only keep one of the `movies` values, discarding the rest. To avoid this, you must write your own `FormData` to `Object` utility instead:

```js
/**
 * POST /api/submit
 */
export async function onRequestPost(context) {
  try {
    let input = await context.request.formData();


    // Convert FormData to JSON
    // NOTE: Allows multiple values per key
    let output = {};
    for (let [key, value] of input) {
      let tmp = output[key];
      if (tmp === undefined) {
        output[key] = value;
      } else {
        output[key] = [].concat(tmp, value);
      }
    }


    let pretty = JSON.stringify(output, null, 2);
    return new Response(pretty, {
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
    });
  } catch (err) {
    return new Response("Error parsing JSON content", { status: 400 });
  }
}
```

The final snippet (above) allows the Worker to retain all values, returning a JSON response with an accurate representation of the `<form>` submission.

### Deployment

You are now ready to deploy your project.

If you have not already done so, save your progress within `git` and then push the commit(s) to the GitHub repository:

```sh
# Add all files
git add -A
# Commit w/ message
git commit -m "working example"
# Push commit(s) to remote
git push -u origin main
```

Your work now resides within the GitHub repository, which means that Pages is able to access it too.

If this is your first Cloudflare Pages project, refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/) for a complete walkthrough. After selecting the appropriate GitHub repository, you must configure your project with the following build settings:

* **Project name** – Your choice
* **Production branch** – `main`
* **Framework preset** – None
* **Build command** – None / Empty
* **Build output directory** – `public`

After clicking the **Save and Deploy** button, your Pages project will begin its first deployment. When successful, you will be presented with a unique `*.pages.dev` subdomain and a link to your live demo.

In this tutorial, you built and deployed a website and its back-end logic using Cloudflare Pages with its Workers integration. You created a static HTML document with a form that communicates with a Worker handler to parse the submission request(s).

If you would like to review the full source code for this application, you can find it on [GitHub](https://github.com/cloudflare/submit.pages.dev).

## Related resources

* [Build an API for your front end using Cloudflare Workers](https://developers.cloudflare.com/pages/tutorials/build-an-api-with-pages-functions/)
* [Handle form submissions with Airtable](https://developers.cloudflare.com/workers/tutorials/handle-form-submissions-with-airtable/)

</page>

<page>
---
title: Localize a website with HTMLRewriter · Cloudflare Pages docs
description: This tutorial uses the HTMLRewriter functionality in the Cloudflare
  Workers platform to overlay an i18n layer, automatically translating the site
  based on the user’s language.
lastUpdated: 2026-02-02T18:38:11.000Z
chatbotDeprioritize: false
tags: JavaScript
source_url:
  html: https://developers.cloudflare.com/pages/tutorials/localize-a-website/
  md: https://developers.cloudflare.com/pages/tutorials/localize-a-website/index.md
---

In this tutorial, you will build an example internationalization and localization engine (commonly referred to as **i18n** and **l10n**) for your application, serve the content of your site, and automatically translate the content based on your visitors’ location in the world.

This tutorial uses the [`HTMLRewriter`](https://developers.cloudflare.com/workers/runtime-apis/html-rewriter/) class built into the Cloudflare Workers runtime, which allows for parsing and rewriting of HTML on the Cloudflare global network. This gives developers the ability to efficiently and transparently customize their Workers applications.

![An example site that has been successfully localized in Japanese, German and English](https://developers.cloudflare.com/_astro/i18n.DfrXtRlL_HOv9z.webp)

***

## Before you continue

All of the framework guides assume you already have a fundamental understanding of [Git](https://git-scm.com/). If you are new to Git, refer to this [summarized Git handbook](https://guides.github.com/introduction/git-handbook/) on how to set up Git on your local machine.

If you clone with SSH, you must [generate SSH keys](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) on each computer you use to push or pull from GitHub.

Refer to the [GitHub documentation](https://guides.github.com/introduction/git-handbook/) and [Git documentation](https://git-scm.com/book/en/v2) for more information.

## Prerequisites

This tutorial is designed to use an existing website. To simplify this process, you will use a free HTML5 template from [HTML5 UP](https://html5up.net). With this website as the base, you will use the `HTMLRewriter` functionality in the Workers platform to overlay an i18n layer, automatically translating the site based on the user’s language.

If you would like to deploy your own version of the site, you can find the source [on GitHub](https://github.com/lauragift21/i18n-example-workers). Instructions on how to deploy this application can be found in the project’s README.

## Create a new application

Create a new application using the [`create-cloudflare`](https://developers.cloudflare.com/pages/get-started/c3), a CLI for creating and deploying new applications to Cloudflare.

* npm

  ```sh
  npm create cloudflare@latest -- i18n-example
  ```

* yarn

  ```sh
  yarn create cloudflare i18n-example
  ```

* pnpm

  ```sh
  pnpm create cloudflare@latest i18n-example
  ```

For setup, select the following options:

* For *What would you like to start with*?, select `Framework Starter`.
* For *Which development framework do you want to use?*, select `React`.
* For, *Do you want to deploy your application?*, select `No`.

The newly generated `i18n-example` project will contain two folders: `public` and `src` these contain files for a React application:

```sh
cd i18n-example
ls
```

```sh
public src package.json
```

We have to make a few adjustments to the generated project, first we want to the replace the content inside of the `public` directory, with the default generated HTML code for the HTML5 UP template seen in the demo screenshot: download a [release](https://github.com/signalnerve/i18n-example-workers/archive/v1.0.zip) (ZIP file) of the code for this project and copy the `public` folder to your own project to get started.

Next, let's create a functions directory with an `index.js` file, this will be where the logic of the application will be written.

```sh
mkdir functions
cd functions
touch index.js
```

Additionally, we'll remove the `src/` directory since its content isn't necessary for this project. With the static HTML for this project updated, you can focus on the script inside of the `functions` folder, at `index.js`.

## Understanding `data-i18n-key`

The `HTMLRewriter` class provided in the Workers runtime allows developers to parse HTML and write JavaScript to query and transform every element of the page.

The example website in this tutorial is a basic single-page HTML project that lives in the `public` directory. It includes an `h1` element with the text `Example Site` and a number of `p` elements with different text:

![Demo code shown in Chrome DevTools with the elements described above](https://developers.cloudflare.com/_astro/code-example.Csjrvc1w_xNHcU.webp)

What is unique about this page is the addition of [data attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes) in the HTML – custom attributes defined on a number of elements on this page. The `data-i18n-key` on the `h1` tag on this page, as well as many of the `p` tags, indicates that there is a corresponding internationalization key, which should be used to look up a translation for this text:

```html
<!-- source clipped from i18n-example site -->


<div class="inner">
  <h1 data-i18n-key="headline">Example Site</h1>
  <p data-i18n-key="subtitle">This is my example site. Depending o...</p>
  <p data-i18n-key="disclaimer">Disclaimer: the initial translations...</p>
</div>
```

Using `HTMLRewriter`, you will parse the HTML within the `./public/index.html` page. When a `data-i18n-key` attribute is found, you should use the attribute's value to retrieve a matching translation from the `strings` object. With `HTMLRewriter`, you can query elements to accomplish tasks like finding a data attribute. However, as the name suggests, you can also rewrite elements by taking a translated string and directly inserting it into the HTML.

Another feature of this project is based on the `Accept-Language` header, which exists on incoming requests. You can set the translation language per request, allowing users from around the world to see a locally relevant and translated page.

## Using the HTML Rewriter API

Begin with the `functions/index.js` file. Your application in this tutorial will live entirely in this file.

Inside of this file, start by adding the default code for running a [Pages Function](https://developers.cloudflare.com/pages/functions/get-started/#create-a-function).

```js
export function onRequest(context) {
  return new Response("Hello, world!");
}
```

The important part of the code lives in the `onRequest` function. To implement translations on the site, take the HTML response retrieved from `env.ASSETS.fetch(request)` this allows you to fetch a static asset from your Pages project and pass it into a new instance of `HTMLRewriter`. When instantiating `HTMLRewriter`, you can attach handlers using the `on` function. For this tutorial, you will use the `[data-i18n-key]` selector (refer to the [HTMLRewriter documentation](https://developers.cloudflare.com/workers/runtime-apis/html-rewriter/) for more advanced usage) to locate all elements with the `data-i18n-key` attribute, which means that they must be translated. Any matching element will be passed to an instance of your `ElementHandler` class, which will contain the translation logic. With the created instance of `HTMLRewriter`, the `transform` function takes a `response` and can be returned to the client:

```js
export async function onRequest(context) {
  const { request, env } = context;
  const response = await env.ASSETS.fetch(request);
  return new HTMLRewriter()
    .on("[data-i18n-key]", new ElementHandler(countryStrings))
    .transform(response);
}
```

## Transforming HTML

Your `ElementHandler` will receive every element parsed by the `HTMLRewriter` instance, and due to the expressive API, you can query each incoming element for information.

In [How it works](#understanding-data-i18n-key), the documentation describes `data-i18n-key`, a custom data attribute that could be used to find a corresponding translated string for the website’s user interface. In `ElementHandler`, you can define an `element` function, which will be called as each element is parsed. Inside of the `element` function, you can query for the custom data attribute using `getAttribute`:

```js
class ElementHandler {
  element(element) {
    const i18nKey = element.getAttribute("data-i18n-key");
  }
}
```

With `i18nKey` defined, you can use it to search for a corresponding translated string. You will now set up a `strings` object with key-value pairs corresponding to the `data-i18n-key` value. For now, you will define a single example string, `headline`, with a German `string`, `"Beispielseite"` (`"Example Site"`), and retrieve it in the `element` function:

```js
const strings = {
  headline: "Beispielseite",
};


class ElementHandler {
  element(element) {
    const i18nKey = element.getAttribute("data-i18n-key");
    const string = strings[i18nKey];
  }
}
```

Take your translated `string` and insert it into the original element, using the `setInnerContent` function:

```js
const strings = {
  headline: "Beispielseite",
};


class ElementHandler {
  element(element) {
    const i18nKey = element.getAttribute("data-i18n-key");
    const string = strings[i18nKey];
    if (string) {
      element.setInnerContent(string);
    }
  }
}
```

To review that everything looks as expected, use the preview functionality built into Wrangler. Call [`wrangler pages dev ./public`](https://developers.cloudflare.com/workers/wrangler/commands/#dev) to open up a live preview of your project. The command is refreshed after every code change that you make.

You can expand on this translation functionality to provide country-specific translations, based on the incoming request’s `Accept-Language` header. By taking this header, parsing it, and passing the parsed language into your `ElementHandler`, you can retrieve a translated string in your user’s home language, provided that it is defined in `strings`.

To implement this:

1. Update the `strings` object, adding a second layer of key-value pairs and allowing strings to be looked up in the format `strings[country][key]`.
2. Pass a `countryStrings` object into our `ElementHandler`, so that it can be used during the parsing process.
3. Grab the `Accept-Language` header from an incoming request, parse it, and pass the parsed language to `ElementHandler`.

To parse the `Accept-Language` header, install the [`accept-language-parser`](https://www.npmjs.com/package/accept-language-parser) npm package:

```sh
npm i accept-language-parser
```

Once imported into your code, use the package to parse the most relevant language for a client based on `Accept-Language` header, and pass it to `ElementHandler`. Your final code for the project, with an included sample translation for Germany and Japan (using Google Translate) looks like this:

```js
import parser from "accept-language-parser";


// do not set to true in production!
const DEBUG = false;


const strings = {
  de: {
    title: "Beispielseite",
    headline: "Beispielseite",
    subtitle:
      "Dies ist meine Beispielseite. Abhängig davon, wo auf der Welt Sie diese Site besuchen, wird dieser Text in die entsprechende Sprache übersetzt.",
    disclaimer:
      "Haftungsausschluss: Die anfänglichen Übersetzungen stammen von Google Translate, daher sind sie möglicherweise nicht perfekt!",
    tutorial:
      "Das Tutorial für dieses Projekt finden Sie in der Cloudflare Workers-Dokumentation.",
    copyright: "Design von HTML5 UP.",
  },
  ja: {
    title: "サンプルサイト",
    headline: "サンプルサイト",
    subtitle:
      "これは私の例のサイトです。 このサイトにアクセスする世界の場所に応じて、このテキストは対応する言語に翻訳されます。",
    disclaimer:
      "免責事項：最初の翻訳はGoogle翻訳からのものですので、完璧ではないかもしれません！",
    tutorial:
      "Cloudflare Workersのドキュメントでこのプロジェクトのチュートリアルを見つけてください。",
    copyright: "HTML5 UPによる設計。",
  },
};


class ElementHandler {
  constructor(countryStrings) {
    this.countryStrings = countryStrings;
  }


  element(element) {
    const i18nKey = element.getAttribute("data-i18n-key");
    if (i18nKey) {
      const translation = this.countryStrings[i18nKey];
      if (translation) {
        element.setInnerContent(translation);
      }
    }
  }
}


export async function onRequest(context) {
  const { request, env } = context;
  try {
    let options = {};
    if (DEBUG) {
      options = {
        cacheControl: {
          bypassCache: true,
        },
      };
    }
    const languageHeader = request.headers.get("Accept-Language");
    const language = parser.pick(["de", "ja"], languageHeader);
    const countryStrings = strings[language] || {};


    const response = await env.ASSETS.fetch(request);
    return new HTMLRewriter()
      .on("[data-i18n-key]", new ElementHandler(countryStrings))
      .transform(response);
  } catch (e) {
    if (DEBUG) {
      return new Response(e.message || e.toString(), {
        status: 404,
      });
    } else {
      return env.ASSETS.fetch(request);
    }
  }
}
```

## Deploy

Your i18n tool built on Cloudflare Pages is complete and it is time to deploy it to your domain.

To deploy your application to a `*.pages.dev` subdomain, you need to specify a directory of static assets to serve, configure the `pages_build_output_dir` in your project’s Wrangler file and set the value to `./public`:

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": "i18n-example",
    "pages_build_output_dir": "./public",
    "compatibility_date": "2026-02-10"
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "./node_modules/wrangler/config-schema.json"
  name = "i18n-example"
  pages_build_output_dir = "./public"
  compatibility_date = "2026-02-10"
  ```

Next, you need to configure a deploy script in `package.json` file in your project. Add a deploy script with the value `wrangler pages deploy`:

```json
"scripts": {
  "dev": "wrangler pages dev",
  "deploy": "wrangler pages deploy"
}
```

Using `wrangler`, deploy to Cloudflare’s network, using the `deploy` command:

```sh
npm run deploy
```

![An example site that has been successfully localized in Japanese, German and English](https://developers.cloudflare.com/_astro/i18n.DfrXtRlL_HOv9z.webp)

## Related resources

In this tutorial, you built and deployed an i18n tool using `HTMLRewriter`. To review the full source code for this application, refer to the [repository on GitHub](https://github.com/lauragift21/i18n-example-workers).

If you want to get started building your own projects, review the existing list of [Quickstart templates](https://developers.cloudflare.com/workers/get-started/quickstarts/).

</page>

<page>
---
title: Use R2 as static asset storage with Cloudflare Pages · Cloudflare Pages docs
description: This tutorial will teach you how to use R2 as a static asset
  storage bucket for your Pages app.
lastUpdated: 2026-01-29T10:38:24.000Z
chatbotDeprioritize: false
tags: Hono,JavaScript
source_url:
  html: https://developers.cloudflare.com/pages/tutorials/use-r2-as-static-asset-storage-for-pages/
  md: https://developers.cloudflare.com/pages/tutorials/use-r2-as-static-asset-storage-for-pages/index.md
---

This tutorial will teach you how to use [R2](https://developers.cloudflare.com/r2/) as a static asset storage bucket for your [Pages](https://developers.cloudflare.com/pages/) app. This is especially helpful if you're hitting the [file limit](https://developers.cloudflare.com/pages/platform/limits/#files) or the [max file size limit](https://developers.cloudflare.com/pages/platform/limits/#file-size) on Pages.

To illustrate how this is done, we will use R2 as a static asset storage for a fictional cat blog.

## The Cat blog

Imagine you run a static cat blog containing funny cat videos and helpful tips for cat owners. Your blog is growing and you need to add more content with cat images and videos.

The blog is hosted on Pages and currently has the following directory structure:

```plaintext
.
├── public
│   ├── index.html
│   ├── static
│   │   ├── favicon.ico
│   │   └── logo.png
│   └── style.css
└── wrangler.jsonc
```

Adding more videos and images to the blog would be great, but our asset size is above the [file limit on Pages](https://developers.cloudflare.com/pages/platform/limits/#file-size). Let us fix this with R2.

## Create an R2 bucket

The first step is creating an R2 bucket to store the static assets. A new bucket can be created with the dashboard or via Wrangler.

Using the dashboard, navigate to the R2 tab, then click on *Create bucket.* We will name the bucket for our blog *cat-media*. Always remember to give your buckets descriptive names:

![Dashboard](https://developers.cloudflare.com/_astro/dash.B3yWT1et_2u1sYS.webp)

With the bucket created, we can upload media files to R2. I’ll drag and drop two folders with a few cat images and videos into the R2 bucket:

![Upload](https://developers.cloudflare.com/images/pages/tutorials/pages-r2/upload.gif)

Alternatively, an R2 bucket can be created with Wrangler from the command line by running:

```sh
npx wrangler r2 bucket create <bucket_name>
# i.e
# npx wrangler r2 bucket create cat-media
```

Files can be uploaded to the bucket with the following command:

```sh
npx wrangler r2 object put <bucket_name>/<file_name> -f <path_to_file>
# i.e
# npx wrangler r2 object put cat-media/videos/video1.mp4 -f ~/Downloads/videos/video1.mp4
```

## Bind R2 to Pages

To bind the R2 bucket we have created to the cat blog, we need to update the Wrangler configuration.

Open the [Wrangler configuration file](https://developers.cloudflare.com/pages/functions/wrangler-configuration/), and add the following binding to the file. `bucket_name` should be the exact name of the bucket created earlier, while `binding` can be any custom name referring to the R2 resource:

* wrangler.jsonc

  ```jsonc
  {
    "r2_buckets": [
      {
        "binding": "MEDIA",
        "bucket_name": "cat-media"
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  [[r2_buckets]]
  binding = "MEDIA"
  bucket_name = "cat-media"
  ```

Note

Note: The keyword `ASSETS` is reserved and cannot be used as a resource binding.

Save the [Wrangler configuration file](https://developers.cloudflare.com/pages/functions/wrangler-configuration/), and we are ready to move on to the last step.

Alternatively, you can add a binding to your Pages project on the dashboard by navigating to the project’s *Settings* tab > *Functions* > *R2 bucket bindings*.

## Serve R2 Assets From Pages

The last step involves serving media assets from R2 on the blog. To do that, we will create a function to handle requests for media files.

In the project folder, create a *functions* directory. Then, create a *media* subdirectory and a file named `[[all]].js` in it. All HTTP requests to `/media` will be routed to this file.

After creating the folders and JavaScript file, the blog directory structure should look like:

```plaintext
.
├── functions
│   └── media
│       └── [[all]].js
├── public
│   ├── index.html
│   ├── static
│   │   ├── favicon.ico
│   │   └── icon.png
│   └── style.css
└── wrangler.jsonc
```

Finally, we will add a handler function to `[[all]].js`. This function receives all media requests, and returns the corresponding file asset from R2:

```js
export async function onRequestGet(ctx) {
  const path = new URL(ctx.request.url).pathname.replace("/media/", "");
  const file = await ctx.env.MEDIA.get(path);
  if (!file) return new Response(null, { status: 404 });
  return new Response(file.body, {
    headers: { "Content-Type": file.httpMetadata.contentType },
  });
}
```

## Deploy the blog

Before deploying the changes made so far to our cat blog, let us add a few new posts to `index.html`. These posts depend on media assets served from R2:

```html
<!doctype html>
<html lang="en">
  <body>
    <h1>Awesome Cat Blog! 😺</h1>
    <p>Today's post:</p>
    <video width="320" controls>
      <source src="/media/videos/video1.mp4" type="video/mp4" />
    </video>
    <p>Yesterday's post:</p>
    <img src="/media/images/cat1.jpg" width="320" />
  </body>
</html>
```

With all the files saved, open a new terminal window to deploy the app:

```sh
npx wrangler deploy
```

Once deployed, media assets are fetched and served from the R2 bucket.

![Deployed App](https://developers.cloudflare.com/images/pages/tutorials/pages-r2/deployed.gif)

## **Related resources**

* [Learn how function routing works in Pages.](https://developers.cloudflare.com/pages/functions/routing/)
* [Learn how to create public R2 buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/).
* [Learn how to use R2 from Workers](https://developers.cloudflare.com/r2/api/workers/workers-api-usage/).

</page>

<page>
---
title: GitHub integration · Cloudflare Pages docs
description: You can connect each Cloudflare Pages project to a GitHub
  repository, and Cloudflare will automatically deploy your code every time you
  push a change to a branch.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/
  md: https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/index.md
---

You can connect each Cloudflare Pages project to a GitHub repository, and Cloudflare will automatically deploy your code every time you push a change to a branch.

## Features

Beyond automatic deployments, the Cloudflare GitHub integration lets you monitor, manage, and preview deployments directly in GitHub, keeping you informed without leaving your workflow.

### Custom branches

Pages will default to setting your [production environment](https://developers.cloudflare.com/pages/configuration/branch-build-controls/#production-branch-control) to the branch you first push. If a branch other than the default branch (e.g. `main`) represents your project's production branch, then go to **Settings** > **Builds** > **Branch control**, change the production branch by clicking the **Production branch** dropdown menu and choose any other branch.

You can also use [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) to preview versions of your project before merging your production branch, and deploying to production. Pages allows you to configure which of your preview branches are automatically deployed using [branch build controls](https://developers.cloudflare.com/pages/configuration/branch-build-controls/). To configure, go to **Settings** > **Builds** > **Branch control** and select an option under **Preview branch**. Use [**Custom branches**](https://developers.cloudflare.com/pages/configuration/branch-build-controls/) to specify branches you wish to include or exclude from automatic preview deployments.

### Preview URLs

Every time you open a new pull request on your GitHub repository, Cloudflare Pages will create a unique preview URL, which will stay updated as you continue to push new commits to the branch. Note that preview URLs will not be created for pull requests created from forks of your repository. Learn more in [Preview Deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/).

![GitHub Preview URLs](https://developers.cloudflare.com/_astro/ghpreviewurls.DuZwczMZ_18Cm2.webp)

### Skipping a build via a commit message

Without any configuration required, you can choose to skip a deployment on an ad hoc basis. By adding the `[CI Skip]`, `[CI-Skip]`, `[Skip CI]`, `[Skip-CI]`, or `[CF-Pages-Skip]` flag as a prefix in your commit message, and Pages will omit that deployment. The prefixes are not case sensitive.

### Check runs

If you have one or multiple projects connected to a repository (i.e. a [monorepo](https://developers.cloudflare.com/pages/configuration/monorepos/)), you can check on the status of each build within GitHub via [GitHub check runs](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks#checks).

You can see the checks by selecting the status icon next to a commit within your GitHub repository. In the example below, you can select the green check mark to see the results of the check run.

![GitHub status](https://developers.cloudflare.com/_astro/gh-status-check-runs.DkY_pO9C_1RDE3u.webp)

Check runs will appear like the following in your repository.

![GitHub check runs](https://developers.cloudflare.com/_astro/ghcheckrun.Cv3SMhfT_2kRJYa.webp)

If a build skips for any reason (i.e. CI Skip, build watch paths, or branch deployment controls), the check run/commit status will not appear.

## Manage access

You can deploy projects to Cloudflare Workers from your company or side project on GitHub using the [Cloudflare Workers & Pages GitHub App](https://github.com/apps/cloudflare-workers-and-pages).

### Organizational access

You can deploy projects to Cloudflare Pages from your company or side project on both GitHub and GitLab.

When authorizing Cloudflare Pages to access a GitHub account, you can specify access to your individual account or an organization that you belong to on GitHub. In order to be able to add the Cloudflare Pages installation to that organization, your user account must be an owner or have the appropriate role within the organization (that is, the GitHub Apps Manager role). More information on these roles can be seen on [GitHub's documentation](https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/roles-in-an-organization#github-app-managers).

GitHub security consideration

A GitHub account should only point to one Cloudflare account. If you are setting up Cloudflare with GitHub for your organization, Cloudflare recommends that you limit the scope of the application to only the repositories you intend to build with Pages. To modify these permissions, go to the [Applications page](https://github.com/settings/installations) on GitHub and select **Switch settings context** to access your GitHub organization settings. Then, select **Cloudflare Workers & Pages** > For **Repository access**, select **Only select repositories** > select your repositories.

### Remove access

You can remove Cloudflare Pages' access to your GitHub repository or account by going to the [Applications page](https://github.com/settings/installations) on GitHub (if you are in an organization, select Switch settings context to access your GitHub organization settings). The GitHub App is named Cloudflare Workers and Pages, and it is shared between Workers and Pages projects.

#### Remove Cloudflare access to a GitHub repository

To remove access to an individual GitHub repository, you can navigate to **Repository access**. Select the **Only select repositories** option, and configure which repositories you would like Cloudflare to have access to.

![GitHub Repository Access](https://developers.cloudflare.com/_astro/github-repository-access.DGHekBft_Z1VFnS0.webp)

#### Remove Cloudflare access to the entire GitHub account

To remove Cloudflare Workers and Pages access to your entire Git account, you can navigate to **Uninstall "Cloudflare Workers and Pages"**, then select **Uninstall**. Removing access to the Cloudflare Workers and Pages app will revoke Cloudflare's access to *all repositories* from that GitHub account. If you want to only disable automatic builds and deployments, follow the [Disable Build](https://developers.cloudflare.com/workers/ci-cd/builds/#disconnecting-builds) instructions.

Note that removing access to GitHub will disable new builds for Workers and Pages project that were connected to those repositories, though your previous deployments will continue to be hosted by Cloudflare Workers.

### Reinstall the Cloudflare GitHub app

If you see errors where Cloudflare Pages cannot access your git repository, you should attempt to uninstall and reinstall the GitHub application associated with the Cloudflare Pages installation.

1. Go to the installation settings page on GitHub:

   * Navigate to **Settings > Builds** for the Pages project and select **Manage** under Git Repository.
   * Alternatively, visit these links to find the Cloudflare Workers and Pages installation and select **Configure**:

| | |
| - | - |
| **Individual** | `https://github.com/settings/installations` |
| **Organization** | `https://github.com/organizations/<YOUR_ORGANIZATION_NAME>/settings/installations` |

1. In the Cloudflare Workers and Pages GitHub App settings page, navigate to **Uninstall "Cloudflare Workers and Pages"** and select **Uninstall**.
2. Go back to the [**Workers & Pages** overview](https://dash.cloudflare.com) page. Select **Create application** > **Pages** > **Connect to Git**.
3. Select the **+ Add account** button, select the GitHub account you want to add, and then select **Install & Authorize**.
4. You should be redirected to the create project page with your GitHub account or organization in the account list.
5. Attempt to make a new deployment with your project which was previously broken.

</page>

<page>
---
title: GitLab integration · Cloudflare Pages docs
description: You can connect each Cloudflare Pages project to a GitLab
  repository, and Cloudflare will automatically deploy your code every time you
  push a change to a branch.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/configuration/git-integration/gitlab-integration/
  md: https://developers.cloudflare.com/pages/configuration/git-integration/gitlab-integration/index.md
---

You can connect each Cloudflare Pages project to a GitLab repository, and Cloudflare will automatically deploy your code every time you push a change to a branch.

## Features

Beyond automatic deployments, the Cloudflare GitLab integration lets you monitor, manage, and preview deployments directly in GitLab, keeping you informed without leaving your workflow.

### Custom branches

Pages will default to setting your [production environment](https://developers.cloudflare.com/pages/configuration/branch-build-controls/#production-branch-control) to the branch you first push. If a branch other than the default branch (e.g. `main`) represents your project's production branch, then go to **Settings** > **Builds** > **Branch control**, change the production branch by clicking the **Production branch** dropdown menu and choose any other branch.

You can also use [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) to preview versions of your project before merging your production branch, and deploying to production. Pages allows you to configure which of your preview branches are automatically deployed using [branch build controls](https://developers.cloudflare.com/pages/configuration/branch-build-controls/). To configure, go to **Settings** > **Builds** > **Branch control** and select an option under **Preview branch**. Use [**Custom branches**](https://developers.cloudflare.com/pages/configuration/branch-build-controls/) to specify branches you wish to include or exclude from automatic preview deployments.

### Skipping a specific build via a commit message

Without any configuration required, you can choose to skip a deployment on an ad hoc basis. By adding the `[CI Skip]`, `[CI-Skip]`, `[Skip CI]`, `[Skip-CI]`, or `[CF-Pages-Skip]` flag as a prefix in your commit message, Pages will omit that deployment. The prefixes are not case sensitive.

### Check runs and preview URLs

If you have one or multiple projects connected to a repository (i.e. a [monorepo](https://developers.cloudflare.com/workers/ci-cd/builds/advanced-setups/#monorepos)), you can check on the status of each build within GitLab via [GitLab commit status](https://docs.gitlab.com/ee/user/project/merge_requests/status_checks.html).

You can see the statuses by selecting the status icon next to a commit or by going to **Build** > **Pipelines** within your GitLab repository. In the example below, you can select the green check mark to see the results of the check run.

![GitLab Status](https://developers.cloudflare.com/_astro/gl-status-checks.B9jgSbf7_NIlLz.webp)

Check runs will appear like the following in your repository. You can select one of the statuses to view the [preview URL](https://developers.cloudflare.com/pages/configuration/preview-deployments/) for that deployment.

![GitLab Commit Status](https://developers.cloudflare.com/_astro/glcommitstatus.BXV17OMM_bQMQW.webp)

If a build skips for any reason (i.e. CI Skip, build watch paths, or branch deployment controls), the check run/commit status will not appear.

## Manage access

You can deploy projects to Cloudflare Workers from your company or side project on GitLab using the Cloudflare Pages app.

### Organizational access

You can deploy projects to Cloudflare Pages from your company or side project on both GitHub and GitLab.

When you authorize Cloudflare Pages to access your GitLab account, you automatically give Cloudflare Pages access to organizations, groups, and namespaces accessed by your GitLab account. Managing access to these organizations and groups is handled by GitLab.

### Remove access

You can remove Cloudflare Workers' access to your GitLab account by navigating to [Authorized Applications page](https://gitlab.com/-/profile/applications) on GitLab. Find the applications called Cloudflare Workers and select the **Revoke** button to revoke access.

Note that the GitLab application Cloudflare Workers is shared between Workers and Pages projects, and removing access to GitLab will disable new builds for Workers and Pages, though your previous deployments will continue to be hosted by Cloudflare Pages.

### Reinstall the Cloudflare GitLab app

When encountering Git integration related issues, one potential troubleshooting step is attempting to uninstall and reinstall the GitHub or GitLab application associated with the Cloudflare Pages installation.

1. Go to your application settings page on GitLab located here: <https://gitlab.com/-/profile/applications>
2. Select the **Revoke** button on your Cloudflare Pages installation if it exists.
3. Go back to the **Workers & Pages** overview page at `https://dash.cloudflare.com/[YOUR_ACCOUNT_ID]/workers-and-pages`. Select **Create application** > **Pages** > **Connect to Git**.
4. Select the **GitLab** tab at the top, select the **+ Add account** button, select the GitLab account you want to add, and then select **Authorize** on the modal titled "Authorize Cloudflare Pages to use your account?".
5. You will be redirected to the create project page with your GitLab account or organization in the account list.
6. Attempt to make a new deployment with your project which was previously broken.

</page>

<page>
---
title: Troubleshooting builds · Cloudflare Pages docs
description: If your git integration is experiencing issues, you may find the
  following banners in the Deployment page of your Pages project.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/configuration/git-integration/troubleshooting/
  md: https://developers.cloudflare.com/pages/configuration/git-integration/troubleshooting/index.md
---

If your git integration is experiencing issues, you may find the following banners in the Deployment page of your Pages project.

## Project creation

#### `This repository is being used for a Cloudflare Pages project on a different Cloudflare account.`

Using the same GitHub/GitLab repository across separate Cloudflare accounts is disallowed. To use the repository for a Pages project in that Cloudflare account, you should delete any Pages projects using the repository in other Cloudflare accounts.

## Deployments

If you run into any issues related to deployments or failing, check your project dashboard to see if there are any SCM installation warnings listed as shown in the screenshot below.

![Pausing a deployment in the Settings of your Pages project](https://developers.cloudflare.com/_astro/git.dashboard-error.z5oiIEkZ_2jHH7j.webp)

To resolve any errors displayed in the Cloudflare Pages dashboard, follow the steps listed below.

#### `This project is disconnected from your Git account, this may cause deployments to fail.`

To resolve this issue, follow the steps provided above in the [Reinstalling a Git installation section](https://developers.cloudflare.com/pages/configuration/git-integration/#reinstall-a-git-installation) for the applicable SCM provider. If the issue persists even after uninstalling and reinstalling, contact support.

#### `Cloudflare Pages is not properly installed on your Git account, this may cause deployments to fail.`

To resolve this issue, follow the steps provided above in the [Reinstalling a Git installation section](https://developers.cloudflare.com/pages/configuration/git-integration/#reinstall-a-git-installation) for the applicable SCM provider. If the issue persists even after uninstalling and reinstalling, contact support.

#### `The Cloudflare Pages installation has been suspended, this may cause deployments to fail.`

Go to your GitHub installation settings:

* `https://github.com/settings/installations` for individual accounts
* `https://github.com/organizations/<YOUR_ORGANIZATION_NAME>/settings/installations` for organizational accounts

Click **Configure** on the Cloudflare Pages application. Scroll down to the bottom of the page and click **Unsuspend** to allow Cloudflare Pages to make future deployments.

#### `The project is linked to a repository that no longer exists, this may cause deployments to fail.`

You may have deleted or transferred the repository associated with this Cloudflare Pages project. For a deleted repository, you will need to create a new Cloudflare Pages project with a repository that has not been deleted. For a transferred repository, you can either transfer the repository back to the original Git account or you will need to create a new Cloudflare Pages project with the transferred repository.

#### `The repository cannot be accessed, this may cause deployments to fail.`

You may have excluded this repository from your installation's repository access settings. Go to your GitHub installation settings:

* `https://github.com/settings/installations` for individual accounts
* `https://github.com/organizations/<YOUR_ORGANIZATION_NAME>/settings/installations` for organizational accounts

Click **Configure** on the Cloudflare Pages application. Under **Repository access**, ensure that the repository associated with your Cloudflare Pages project is included in the list.

#### `There is an internal issue with your Cloudflare Pages Git installation.`

This is an internal error in the Cloudflare Pages SCM system. You can attempt to [reinstall your Git installation](https://developers.cloudflare.com/pages/configuration/git-integration/#reinstall-a-git-installation), but if the issue persists, [contact support](https://developers.cloudflare.com/support/contacting-cloudflare-support/).

#### `GitHub/GitLab is having an incident and push events to Cloudflare are operating in a degraded state. Check their status page for more details.`

This indicates that GitHub or GitLab may be experiencing an incident affecting push events to Cloudflare. It is recommended to monitor their status page ([GitHub](https://www.githubstatus.com/), [GitLab](https://status.gitlab.com/)) for updates and try deploying again later.

</page>

<page>
---
title: A/B testing with middleware · Cloudflare Pages docs
description: Set up an A/B test by controlling what page is served based on
  cookies. This version supports passing the request through to test and control
  on the origin.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/functions/examples/ab-testing/
  md: https://developers.cloudflare.com/pages/functions/examples/ab-testing/index.md
---

```js
const cookieName = "ab-test-cookie";
const newHomepagePathName = "/test";


const abTest = async (context) => {
  const url = new URL(context.request.url);
  // if homepage
  if (url.pathname === "/") {
    // if cookie ab-test-cookie=new then change the request to go to /test
    // if no cookie set, pass x% of traffic and set a cookie value to "current" or "new"


    let cookie = request.headers.get("cookie");
    // is cookie set?
    if (cookie && cookie.includes(`${cookieName}=new`)) {
      // pass the request to /test
      url.pathname = newHomepagePathName;
      return context.env.ASSETS.fetch(url);
    } else {
      const percentage = Math.floor(Math.random() * 100);
      let version = "current"; // default version
      // change pathname and version name for 50% of traffic
      if (percentage < 50) {
        url.pathname = newHomepagePathName;
        version = "new";
      }
      // get the static file from ASSETS, and attach a cookie
      const asset = await context.env.ASSETS.fetch(url);
      let response = new Response(asset.body, asset);
      response.headers.append("Set-Cookie", `${cookieName}=${version}; path=/`);
      return response;
    }
  }
  return context.next();
};


export const onRequest = [abTest];
```

</page>

<page>
---
title: Adding CORS headers · Cloudflare Pages docs
description: A Pages Functions for appending CORS headers.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
tags: Headers
source_url:
  html: https://developers.cloudflare.com/pages/functions/examples/cors-headers/
  md: https://developers.cloudflare.com/pages/functions/examples/cors-headers/index.md
---

This example is a snippet from our Cloudflare Pages Template repo.

```ts
// Respond to OPTIONS method
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Max-Age": "86400",
    },
  });
};


// Set CORS to all /api responses
export const onRequest: PagesFunction = async (context) => {
  const response = await context.next();
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Max-Age", "86400");
  return response;
};
```

</page>

<page>
---
title: Cloudflare Access · Cloudflare Pages docs
description: The Cloudflare Access Pages Plugin is a middleware to validate
  Cloudflare Access JWT assertions. It also includes an API to lookup additional
  information about a given user's JWT.
lastUpdated: 2025-10-24T20:47:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/functions/plugins/cloudflare-access/
  md: https://developers.cloudflare.com/pages/functions/plugins/cloudflare-access/index.md
---

The Cloudflare Access Pages Plugin is a middleware to validate Cloudflare Access JWT assertions. It also includes an API to lookup additional information about a given user's JWT.

## Installation

* npm

  ```sh
  npm i @cloudflare/pages-plugin-cloudflare-access
  ```

* yarn

  ```sh
  yarn add @cloudflare/pages-plugin-cloudflare-access
  ```

* pnpm

  ```sh
  pnpm add @cloudflare/pages-plugin-cloudflare-access
  ```

## Usage

```typescript
import cloudflareAccessPlugin from "@cloudflare/pages-plugin-cloudflare-access";


export const onRequest: PagesFunction = cloudflareAccessPlugin({
  domain: "https://test.cloudflareaccess.com",
  aud: "4714c1358e65fe4b408ad6d432a5f878f08194bdb4752441fd56faefa9b2b6f2",
});
```

The Plugin takes an object with two properties: the `domain` of your Cloudflare Access account, and the policy `aud` (audience) to validate against. Any requests which fail validation will be returned a `403` status code.

### Access the JWT payload

If you need to use the JWT payload in your application (for example, you need the user's email address), this Plugin will make this available for you at `data.cloudflareAccess.JWT.payload`.

For example:

```typescript
import type { PluginData } from "@cloudflare/pages-plugin-cloudflare-access";


export const onRequest: PagesFunction<unknown, any, PluginData> = async ({
  data,
}) => {
  return new Response(
    `Hello, ${data.cloudflareAccess.JWT.payload.email || "service user"}!`,
  );
};
```

The [entire JWT payload](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/application-token/#payload) will be made available on `data.cloudflareAccess.JWT.payload`. Be aware that the fields available differ between identity authorizations (for example, a user in a browser) and non-identity authorizations (for example, a service token).

### Look up identity

In order to get more information about a given user's identity, use the provided `getIdentity` API function:

```typescript
import { getIdentity } from "@cloudflare/pages-plugin-cloudflare-access/api";


export const onRequest: PagesFunction = async ({ data }) => {
  const identity = await getIdentity({
    jwt: "eyJhbGciOiJIUzI1NiIsImtpZCI6IjkzMzhhYmUxYmFmMmZlNDkyZjY0NmE3MzZmMjVhZmJmN2IwMjVlMzVjNjI3YmU0ZjYwYzQxNGQ0YzczMDY5YjgiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOlsiOTdlMmFhZTEyMDEyMWY5MDJkZjhiYzk5ZmMzNDU5MTNhYjE4NmQxNzRmMzA3OWVhNzI5MjM2NzY2YjJlN2M0YSJdLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiZXhwIjoxNTE5NDE4MjE0LCJpYXQiOjE1MTkzMzE4MTUsImlzcyI6Imh0dHBzOi8vdGVzdC5jbG91ZGZsYXJlYWNjZXNzLmNvbSIsIm5vbmNlIjoiMWQ4MDgzZjcwOGE0Nzk4MjI5NmYyZDk4OTZkNzBmMjA3YTI3OTM4ZjAyNjU0MGMzOTJiOTAzZTVmZGY0ZDZlOSIsInN1YiI6ImNhNjM5YmI5LTI2YWItNDJlNS1iOWJmLTNhZWEyN2IzMzFmZCJ9.05vGt-_0Mw6WEFJF3jpaqkNb88PUMplsjzlEUvCEfnQ",
    domain: "https://test.cloudflareaccess.com",
  });


  return new Response(`Hello, ${identity.name || "service user"}!`);
};
```

The `getIdentity` function takes an object with two properties: a `jwt` string, and a `domain` string. It returns a `Promise` of [the object returned by the `/cdn-cgi/access/get-identity` endpoint](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/application-token/#user-identity). This is particularly useful if you want to use a user's group membership for something like application permissions.

For convenience, this same information can be fetched for the current request's JWT with the `data.cloudflareAccess.JWT.getIdentity` function, (assuming you have already validated the request with the Plugin as above):

```typescript
import type { PluginData } from "@cloudflare/pages-plugin-cloudflare-access";


export const onRequest: PagesFunction<unknown, any, PluginData> = async ({
  data,
}) => {
  const identity = await data.cloudflareAccess.JWT.getIdentity();


  return new Response(`Hello, ${identity.name || "service user"}!`);
};
```

### Login and logout URLs

If you want to force a login or logout, use these utility functions to generate URLs and redirect a user:

```typescript
import { generateLoginURL } from "@cloudflare/pages-plugin-cloudflare-access/api";


export const onRequest = () => {
  const loginURL = generateLoginURL({
    redirectURL: "https://example.com/greet",
    domain: "https://test.cloudflareaccess.com",
    aud: "4714c1358e65fe4b408ad6d432a5f878f08194bdb4752441fd56faefa9b2b6f2",
  });


  return new Response(null, {
    status: 302,
    headers: { Location: loginURL },
  });
};
```

```typescript
import { generateLogoutURL } from "@cloudflare/pages-plugin-cloudflare-access/api";


export const onRequest = () =>
  new Response(null, {
    status: 302,
    headers: {
      Location: generateLogoutURL({
        domain: "https://test.cloudflareaccess.com",
      }),
    },
  });
```

</page>

<page>
---
title: Community Plugins · Cloudflare Pages docs
description: The following are some of the community-maintained Pages Plugins.
  If you have created a Pages Plugin and would like to share it with developers,
  create a PR to add it to this alphabeticallly-ordered list using the link in
  the footer.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/functions/plugins/community-plugins/
  md: https://developers.cloudflare.com/pages/functions/plugins/community-plugins/index.md
---

The following are some of the community-maintained Pages Plugins. If you have created a Pages Plugin and would like to share it with developers, create a PR to add it to this alphabeticallly-ordered list using the link in the footer.

* [pages-plugin-asset-negotiation](https://github.com/Cherry/pages-plugin-asset-negotiation)

  Given a folder of assets in multiple formats, this Plugin will automatically negotiate with a client to serve an optimized version of a requested asset.

* [proxyflare-for-pages](https://github.com/flaregun-net/proxyflare-for-pages)

  Move traffic around your Cloudflare Pages domain with ease. Proxyflare is a reverse-proxy that enables you to:

  * Port forward, redirect, and reroute HTTP and websocket traffic anywhere on the Internet.
  * Mount an entire website on a subpath (for example, `mysite.com/docs`) on your apex domain.
  * Serve static text (like `robots.txt` and other structured metadata) from any endpoint.

  Refer to [Proxyflare](https://proxyflare.works) for more information.

* [cloudflare-pages-plugin-rollbar](https://github.com/hckr-studio/cloudflare-pages-plugin-rollbar)

  The [Rollbar](https://rollbar.com/) Pages Plugin captures and logs all exceptions which occur below it in the execution chain of your [Pages Functions](https://developers.cloudflare.com/pages/functions/). Discover, predict, and resolve errors in real-time.

* [cloudflare-pages-plugin-trpc](https://github.com/toyamarinyon/cloudflare-pages-plugin-trpc)

  Allows developers to quickly create a tRPC server with a Cloudflare Pages Function.

* [pages-plugin-twind](https://github.com/helloimalastair/twind-plugin)

  Automatically injects Tailwind CSS styles into HTML pages after analyzing which classes are used.

</page>

<page>
---
title: Google Chat · Cloudflare Pages docs
description: The Google Chat Pages Plugin creates a Google Chat bot which can
  respond to messages. It also includes an API for interacting with Google Chat
  (for example, for creating messages) without the need for user input. This API
  is useful for situations such as alerts.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/functions/plugins/google-chat/
  md: https://developers.cloudflare.com/pages/functions/plugins/google-chat/index.md
---

The Google Chat Pages Plugin creates a Google Chat bot which can respond to messages. It also includes an API for interacting with Google Chat (for example, for creating messages) without the need for user input. This API is useful for situations such as alerts.

## Installation

* npm

  ```sh
  npm i @cloudflare/pages-plugin-google-chat
  ```

* yarn

  ```sh
  yarn add @cloudflare/pages-plugin-google-chat
  ```

* pnpm

  ```sh
  pnpm add @cloudflare/pages-plugin-google-chat
  ```

## Usage

```typescript
import googleChatPlugin from "@cloudflare/pages-plugin-google-chat";


export const onRequest: PagesFunction = googleChatPlugin(async (message) => {
  if (message.text.includes("ping")) {
    return { text: "pong" };
  }


  return { text: "Sorry, I could not understand your message." };
});
```

The Plugin takes a function, which in turn takes an incoming message, and returns a `Promise` of a response message (or `void` if there should not be any response).

The Plugin only exposes a single route, which is the URL you should set in the Google Cloud Console when creating the bot.

![Google Cloud Console's Connection Settings for the Google Chat API showing 'App URL' selected and 'https://example.com/google-chat' entered into the 'App URL' text input.](https://developers.cloudflare.com/_astro/google-chat.PImk30WB_A5LO1.webp)

### API

The Google Chat API can be called directly using the `GoogleChatAPI` class:

```typescript
import { GoogleChatAPI } from "@cloudflare/pages-plugin-google-chat/api";


export const onRequest: PagesFunction = () => {
  // Initialize a GoogleChatAPI with your service account's credentials
  const googleChat = new GoogleChatAPI({
    credentials: {
      client_email: "SERVICE_ACCOUNT_EMAIL_ADDRESS",
      private_key: "SERVICE_ACCOUNT_PRIVATE_KEY",
    },
  });


  // Post a message
  // https://developers.google.com/chat/api/reference/rest/v1/spaces.messages/create
  const message = await googleChat.createMessage(
    { parent: "spaces/AAAAAAAAAAA" },
    undefined,
    {
      text: "I'm an alert!",
    },
  );


  return new Response("Alert sent.");
};
```

We recommend storing your service account's credentials in KV rather than in plain text as above.

The following functions are available on a `GoogleChatAPI` instance. Each take up to three arguments: an object of path parameters, an object of query parameters, and an object of the request body; as described in the [Google Chat API's documentation](https://developers.google.com/chat/api/reference/rest).

* [`downloadMedia`](https://developers.google.com/chat/api/reference/rest/v1/media/download)
* [`getSpace`](https://developers.google.com/chat/api/reference/rest/v1/spaces/get)
* [`listSpaces`](https://developers.google.com/chat/api/reference/rest/v1/spaces/list)
* [`getMember`](https://developers.google.com/chat/api/reference/rest/v1/spaces.members/get)
* [`listMembers`](https://developers.google.com/chat/api/reference/rest/v1/spaces.members/list)
* [`createMessage`](https://developers.google.com/chat/api/reference/rest/v1/spaces.messages/create)
* [`deleteMessage`](https://developers.google.com/chat/api/reference/rest/v1/spaces.messages/delete)
* [`getMessage`](https://developers.google.com/chat/api/reference/rest/v1/spaces.messages/get)
* [`updateMessage`](https://developers.google.com/chat/api/reference/rest/v1/spaces.messages/update)
* [`getAttachment`](https://developers.google.com/chat/api/reference/rest/v1/spaces.messages.attachments/get)

</page>

<page>
---
title: GraphQL · Cloudflare Pages docs
description: The GraphQL Pages Plugin creates a GraphQL server which can respond
  to application/json and application/graphql POST requests. It responds with
  the GraphQL Playground for GET requests.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/functions/plugins/graphql/
  md: https://developers.cloudflare.com/pages/functions/plugins/graphql/index.md
---

The GraphQL Pages Plugin creates a GraphQL server which can respond to `application/json` and `application/graphql` `POST` requests. It responds with [the GraphQL Playground](https://github.com/graphql/graphql-playground) for `GET` requests.

## Installation

* npm

  ```sh
  npm i @cloudflare/pages-plugin-graphql
  ```

* yarn

  ```sh
  yarn add @cloudflare/pages-plugin-graphql
  ```

* pnpm

  ```sh
  pnpm add @cloudflare/pages-plugin-graphql
  ```

## Usage

```typescript
import graphQLPlugin from "@cloudflare/pages-plugin-graphql";
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";


const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
      hello: {
        type: GraphQLString,
        resolve() {
          return "Hello, world!";
        },
      },
    },
  }),
});


export const onRequest: PagesFunction = graphQLPlugin({
  schema,
  graphql,
});
```

This Plugin only exposes a single route, so wherever it is mounted is wherever it will be available. In the above example, because it is mounted in `functions/graphql.ts`, the server will be available on `/graphql` of your Pages project.

</page>

<page>
---
title: hCaptcha · Cloudflare Pages docs
description: The hCaptcha Pages Plugin validates hCaptcha tokens.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/functions/plugins/hcaptcha/
  md: https://developers.cloudflare.com/pages/functions/plugins/hcaptcha/index.md
---

The hCaptcha Pages Plugin validates hCaptcha tokens.

## Installation

* npm

  ```sh
  npm i @cloudflare/pages-plugin-hcaptcha
  ```

* yarn

  ```sh
  yarn add @cloudflare/pages-plugin-hcaptcha
  ```

* pnpm

  ```sh
  pnpm add @cloudflare/pages-plugin-hcaptcha
  ```

## Usage

```typescript
import hCaptchaPlugin from "@cloudflare/pages-plugin-hcaptcha";


export const onRequestPost: PagesFunction[] = [
  hCaptchaPlugin({
    secret: "0x0000000000000000000000000000000000000000",
    sitekey: "10000000-ffff-ffff-ffff-000000000001",
  }),
  async (context) => {
    // Request has been validated as coming from a human


    const formData = await context.request.formData();


    // Store user credentials


    return new Response("Successfully registered!");
  },
];
```

This Plugin only exposes a single route. It will be available wherever it is mounted. In the above example, because it is mounted in `functions/register.ts`, it will validate requests to `/register`. The Plugin is mounted with a single object parameter with the following properties.

[`secret`](https://dashboard.hcaptcha.com/settings) (mandatory) and [`sitekey`](https://dashboard.hcaptcha.com/sites) (optional) can both be found in your hCaptcha dashboard.

`response` and `remoteip` are optional strings. `response` the hCaptcha token to verify (defaults to extracting `h-captcha-response` from a `multipart/form-data` request). `remoteip` should be requester's IP address (defaults to the `CF-Connecting-IP` header of the request).

`onError` is an optional function which takes the Pages Function context object and returns a `Promise` of a `Response`. By default, it will return a human-readable error `Response`.

`data.hCaptcha` will be populated in subsequent Pages Functions (including for the `onError` function) with [the hCaptcha response object](https://docs.hcaptcha.com/#verify-the-user-response-server-side).

</page>

<page>
---
title: Honeycomb · Cloudflare Pages docs
description: The Honeycomb Pages Plugin automatically sends traces to Honeycomb
  for analysis and observability.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/functions/plugins/honeycomb/
  md: https://developers.cloudflare.com/pages/functions/plugins/honeycomb/index.md
---

The Honeycomb Pages Plugin automatically sends traces to Honeycomb for analysis and observability.

## Installation

* npm

  ```sh
  npm i @cloudflare/pages-plugin-honeycomb
  ```

* yarn

  ```sh
  yarn add @cloudflare/pages-plugin-honeycomb
  ```

* pnpm

  ```sh
  pnpm add @cloudflare/pages-plugin-honeycomb
  ```

## Usage

The following usage example uses environment variables you will need to set in your Pages project settings.

```typescript
import honeycombPlugin from "@cloudflare/pages-plugin-honeycomb";


export const onRequest: PagesFunction<{
  HONEYCOMB_API_KEY: string;
  HONEYCOMB_DATASET: string;
}> = (context) => {
  return honeycombPlugin({
    apiKey: context.env.HONEYCOMB_API_KEY,
    dataset: context.env.HONEYCOMB_DATASET,
  })(context);
};
```

Alternatively, you can hard-code (not advisable for API key) your settings the following way:

```typescript
import honeycombPlugin from "@cloudflare/pages-plugin-honeycomb";


export const onRequest = honeycombPlugin({
  apiKey: "YOUR_HONEYCOMB_API_KEY",
  dataset: "YOUR_HONEYCOMB_DATASET_NAME",
});
```

This Plugin is based on the `@cloudflare/workers-honeycomb-logger` and accepts the same [configuration options](https://github.com/cloudflare/workers-honeycomb-logger#config).

Ensure that you enable the option to **Automatically unpack nested JSON** and set the **Maximum unpacking depth** to **5** in your Honeycomb dataset settings.

![Follow the instructions above to toggle on Automatically unpack nested JSON and set the Maximum unpacking depth option to 5 in the Honeycomb dashboard](https://developers.cloudflare.com/_astro/honeycomb.MQ2Vf1tC_2kKhNs.webp)

### Additional context

`data.honeycomb.tracer` has two methods for attaching additional information about a given trace:

* `data.honeycomb.tracer.log` which takes a single argument, a `String`.
* `data.honeycomb.tracer.addData` which takes a single argument, an object of arbitrary data.

More information about these methods can be seen on [`@cloudflare/workers-honeycomb-logger`'s documentation](https://github.com/cloudflare/workers-honeycomb-logger#adding-logs-and-other-data).

For example, if you wanted to use the `addData` method to attach user information:

```typescript
import type { PluginData } from "@cloudflare/pages-plugin-honeycomb";


export const onRequest: PagesFunction<unknown, any, PluginData> = async ({
  data,
  next,
  request,
}) => {
  // Authenticate the user from the request and extract user's email address
  const email = await getEmailFromRequest(request);


  data.honeycomb.tracer.addData({ email });


  return next();
};
```

</page>

<page>
---
title: Sentry · Cloudflare Pages docs
description: The Sentry Pages Plugin captures and logs all exceptions which
  occur below it in the execution chain of your Pages Functions. It is therefore
  recommended that you install this Plugin at the root of your application in
  functions/_middleware.ts as the very first Plugin.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/functions/plugins/sentry/
  md: https://developers.cloudflare.com/pages/functions/plugins/sentry/index.md
---

Note

Sentry now provides official support for Cloudflare Workers and Pages. Refer to the [Sentry documentation](https://docs.sentry.io/platforms/javascript/guides/cloudflare/) for more details.

The Sentry Pages Plugin captures and logs all exceptions which occur below it in the execution chain of your Pages Functions. It is therefore recommended that you install this Plugin at the root of your application in `functions/_middleware.ts` as the very first Plugin.

## Installation

* npm

  ```sh
  npm i @cloudflare/pages-plugin-sentry
  ```

* yarn

  ```sh
  yarn add @cloudflare/pages-plugin-sentry
  ```

* pnpm

  ```sh
  pnpm add @cloudflare/pages-plugin-sentry
  ```

## Usage

```typescript
import sentryPlugin from "@cloudflare/pages-plugin-sentry";


export const onRequest: PagesFunction = sentryPlugin({
  dsn: "https://sentry.io/welcome/xyz",
});
```

The Plugin uses [Toucan](https://github.com/robertcepa/toucan-js). Refer to the Toucan README to [review the options it can take](https://github.com/robertcepa/toucan-js#other-options). `context`, `request`, and `event` are automatically populated and should not be manually configured.

If your [DSN](https://docs.sentry.io/product/sentry-basics/dsn-explainer/) is held as an environment variable or in KV, you can access it like so:

```typescript
import sentryPlugin from "@cloudflare/pages-plugin-sentry";


export const onRequest: PagesFunction<{
  SENTRY_DSN: string;
}> = (context) => {
  return sentryPlugin({ dsn: context.env.SENTRY_DSN })(context);
};
```

```typescript
import sentryPlugin from "@cloudflare/pages-plugin-sentry";


export const onRequest: PagesFunction<{
  KV: KVNamespace;
}> = async (context) => {
  return sentryPlugin({ dsn: await context.env.KV.get("SENTRY_DSN") })(context);
};
```

### Additional context

If you need to set additional context for Sentry (for example, user information or additional logs), use the `data.sentry` instance in any Function below the Plugin in the execution chain.

For example, you can access `data.sentry` and set user information like so:

```typescript
import type { PluginData } from "@cloudflare/pages-plugin-sentry";


export const onRequest: PagesFunction<unknown, any, PluginData> = async ({
  data,
  next,
}) => {
  // Authenticate the user from the request and extract user's email address
  const email = await getEmailFromRequest(request);


  data.sentry.setUser({ email });


  return next();
};
```

Again, the full list of features can be found in [Toucan's documentation](https://github.com/robertcepa/toucan-js#features).

</page>

<page>
---
title: Static Forms · Cloudflare Pages docs
description: The Static Forms Pages Plugin intercepts all form submissions made
  which have the data-static-form-name attribute set. This allows you to take
  action on these form submissions by, for example, saving the submission to KV.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/functions/plugins/static-forms/
  md: https://developers.cloudflare.com/pages/functions/plugins/static-forms/index.md
---

The Static Forms Pages Plugin intercepts all form submissions made which have the `data-static-form-name` attribute set. This allows you to take action on these form submissions by, for example, saving the submission to KV.

## Installation

* npm

  ```sh
  npm i @cloudflare/pages-plugin-static-forms
  ```

* yarn

  ```sh
  yarn add @cloudflare/pages-plugin-static-forms
  ```

* pnpm

  ```sh
  pnpm add @cloudflare/pages-plugin-static-forms
  ```

## Usage

```typescript
import staticFormsPlugin from "@cloudflare/pages-plugin-static-forms";


export const onRequest: PagesFunction = staticFormsPlugin({
  respondWith: ({ formData, name }) => {
    const email = formData.get("email");
    return new Response(
      `Hello, ${email}! Thank you for submitting the ${name} form.`,
    );
  },
});
```

```html
<body>
  <h1>Sales enquiry</h1>
  <form data-static-form-name="sales">
    <label>Email address <input type="email" name="email" /></label>
    <label>Message <textarea name="message"></textarea></label>
    <button type="submit">Submit</button>
  </form>
</body>
```

The Plugin takes a single argument, an object with a `respondWith` property. This function takes an object with a `formData` property (the [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData) instance) and `name` property (the name value of your `data-static-form-name` attribute). It should return a `Response` or `Promise` of a `Response`. It is in this `respondWith` function that you can take action such as serializing the `formData` and saving it to a KV namespace.

The `method` and `action` attributes of the HTML form do not need to be set. The Plugin will automatically override them to allow it to intercept the submission.

</page>

<page>
---
title: Stytch · Cloudflare Pages docs
description: The Stytch Pages Plugin is a middleware which validates all
  requests and their session_token.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/functions/plugins/stytch/
  md: https://developers.cloudflare.com/pages/functions/plugins/stytch/index.md
---

The Stytch Pages Plugin is a middleware which validates all requests and their `session_token`.

## Installation

* npm

  ```sh
  npm i @cloudflare/pages-plugin-stytch
  ```

* yarn

  ```sh
  yarn add @cloudflare/pages-plugin-stytch
  ```

* pnpm

  ```sh
  pnpm add @cloudflare/pages-plugin-stytch
  ```

## Usage

```typescript
import stytchPlugin from "@cloudflare/pages-plugin-stytch";
import { envs } from "@cloudflare/pages-plugin-stytch/api";


export const onRequest: PagesFunction = stytchPlugin({
  project_id: "YOUR_STYTCH_PROJECT_ID",
  secret: "YOUR_STYTCH_PROJECT_SECRET",
  env: envs.live,
});
```

We recommend storing your secret in KV rather than in plain text as above.

The Stytch Plugin takes a single argument, an object with several properties. `project_id` and `secret` are mandatory strings and can be found in [Stytch's dashboard](https://stytch.com/dashboard/api-keys). `env` is also a mandatory string, and can be populated with the `envs.test` or `envs.live` variables in the API. By default, the Plugin validates a `session_token` cookie of the incoming request, but you can also optionally pass in a `session_token` or `session_jwt` string yourself if you are using some other mechanism to identify user sessions. Finally, you can also pass in a `session_duration_minutes` in order to extend the lifetime of the session. More information on these parameters can be found in [Stytch's documentation](https://stytch.com/docs/api/session-auth).

The validated session response containing user information is made available to subsequent Pages Functions on `data.stytch.session`.

</page>

<page>
---
title: Turnstile · Cloudflare Pages docs
description: Turnstile is Cloudflare's smart CAPTCHA alternative.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/functions/plugins/turnstile/
  md: https://developers.cloudflare.com/pages/functions/plugins/turnstile/index.md
---

[Turnstile](https://developers.cloudflare.com/turnstile/) is Cloudflare's smart CAPTCHA alternative.

The Turnstile Pages Plugin validates Cloudflare Turnstile tokens.

## Installation

* npm

  ```sh
  npm i @cloudflare/pages-plugin-turnstile
  ```

* yarn

  ```sh
  yarn add @cloudflare/pages-plugin-turnstile
  ```

* pnpm

  ```sh
  pnpm add @cloudflare/pages-plugin-turnstile
  ```

## Usage

```typescript
import turnstilePlugin from "@cloudflare/pages-plugin-turnstile";


/**
 * POST /api/submit-with-plugin
 */


export const onRequestPost = [
  turnstilePlugin({
    // This is the demo secret key. In prod, we recommend you store
    // your secret key(s) safely.
    secret: "0x4AAAAAAASh4E5cwHGsTTePnwcPbnFru6Y",
  }),
  // Alternatively, this is how you can use a secret key which has been stored as an environment variable
  // (async (context) => {
  //   return turnstilePlugin({secret: context.env.SECRET_KEY})(context)
  // }),
  async (context) => {
    // Request has been validated as coming from a human
    const formData = await context.request.formData();
    // Additional solve metadata data is available at context.data.turnstile
    return new Response(
      `Successfully verified! ${JSON.stringify(context.data.turnstile)}`,
    );
  },
];
```

This Plugin only exposes a single route to verify an incoming Turnstile response in a `POST` as the `cf-turnstile-response` parameter. It will be available wherever it is mounted. In the example above, it is mounted in `functions/register.ts`. As a result, it will validate requests to `/register`.

## Properties

The Plugin is mounted with a single object parameter with the following properties:

[`secret`](https://dash.cloudflare.com/login) is mandatory and can both be found in your Turnstile dashboard.

`response` and `remoteip` are optional strings. `response` is the Turnstile token to verify. If it is not provided, the plugin will default to extracting `cf-turnstile-response` value from a `multipart/form-data` request). `remoteip` is the requester's IP address. This defaults to the `CF-Connecting-IP` header of the request.

`onError` is an optional function which takes the Pages Function context object and returns a `Promise` of a `Response`. By default, it will return a human-readable error `Response`.

`context.data.turnstile` will be populated in subsequent Pages Functions (including for the `onError` function) with [the Turnstile Siteverify response object](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).

</page>

<page>
---
title: vercel/og · Cloudflare Pages docs
description: The @vercel/og Pages Plugin is a middleware which renders social
  images for webpages. It also includes an API to create arbitrary images.
lastUpdated: 2025-09-15T21:45:20.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/functions/plugins/vercel-og/
  md: https://developers.cloudflare.com/pages/functions/plugins/vercel-og/index.md
---

The `@vercel/og` Pages Plugin is a middleware which renders social images for webpages. It also includes an API to create arbitrary images.

As the name suggests, it is powered by [`@vercel/og`](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation). This plugin and its underlying [Satori](https://github.com/vercel/satori) library was created by the Vercel team.

## Install

To install the `@vercel/og` Pages Plugin, run:

* npm

  ```sh
  npm i @cloudflare/pages-plugin-vercel-og
  ```

* yarn

  ```sh
  yarn add @cloudflare/pages-plugin-vercel-og
  ```

* pnpm

  ```sh
  pnpm add @cloudflare/pages-plugin-vercel-og
  ```

## Use

```typescript
import React from "react";
import vercelOGPagesPlugin from "@cloudflare/pages-plugin-vercel-og";


interface Props {
  ogTitle: string;
}


export const onRequest = vercelOGPagesPlugin<Props>({
  imagePathSuffix: "/social-image.png",
  component: ({ ogTitle, pathname }) => {
    return <div style={{ display: "flex" }}>{ogTitle}</div>;
  },
  extractors: {
    on: {
      'meta[property="og:title"]': (props) => ({
        element(element) {
          props.ogTitle = element.getAttribute("content");
        },
      }),
    },
  },
  autoInject: {
    openGraph: true,
  },
});
```

The Plugin takes an object with six properties:

* `imagePathSuffix`: the path suffix to make the generate image available at. For example, if you mount this Plugin at `functions/blog/_middleware.ts`, set the `imagePathSuffix` as `/social-image.png` and have a `/blog/hello-world` page, the image will be available at `/blog/hello-world/social-image.png`.

* `component`: the React component that will be used to render the image. By default, the React component is given a `pathname` property equal to the pathname of the underlying webpage (for example, `/blog/hello-world`), but more dynamic properties can be provided with the `extractors` option.

* `extractors`: an optional object with two optional properties: `on` and `onDocument`. These properties can be set to a function which takes an object and returns a [`HTMLRewriter` element handler](https://developers.cloudflare.com/workers/runtime-apis/html-rewriter/#element-handlers) or [document handler](https://developers.cloudflare.com/workers/runtime-apis/html-rewriter/#document-handlers) respectively. The object parameter can be mutated in order to provide the React component with additional properties. In the example above, you will use an element handler to extract the `og:title` meta tag from the webpage and pass that to the React component as the `ogTitle` property. This is the primary mechanism you will use to create dynamic images which use values from the underlying webpage.

* `options`: [an optional object which is given directly to the `@vercel/og` library](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation/og-image-api).

* `onError`: an optional function which returns a `Response` or a promise of a `Response`. This function is called when a request is made to the `imagePathSuffix` and `extractors` are provided but the underlying webpage is not valid HTML. Defaults to returning a `404` response.

* `autoInject`: an optional object with an optional property: `openGraph`. If set to `true`, the Plugin will automatically set the `og:image`, `og:image:height` and `og:image:width` meta tags on the underlying webpage.

### Generate arbitrary images

Use this Plugin's API to generate arbitrary images, not just as middleware.

For example, the below code will generate an image saying "Hello, world!" which is available at `/greet`.

```typescript
import React from "react";
import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";


export const onRequest: PagesFunction = async () => {
  return new ImageResponse(
    <div style={{ display: "flex" }}>Hello, world!</div>,
    {
      width: 1200,
      height: 630,
    }
  );
};
```

This is the same API that the underlying [`@vercel/og` library](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation/og-image-api) offers.

</page>

<page>
---
title: Get started · Cloudflare Pages docs
description: Deploy a static site built using Next.js to Cloudflare Pages
lastUpdated: 2025-09-17T18:05:52.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/
  md: https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/index.md
---

Note

Do not use this guide unless you have a specific use case for static exports. Cloudflare recommends using Workers to deploy your Next.js site, for more instructions refer the [Next.js Workers guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs).

[Next.js](https://nextjs.org) is an open-source React framework for creating websites and applications. In this guide, you will create a new Next.js application and deploy it using Cloudflare Pages.

This guide will instruct you how to deploy a static site Next.js project with [static exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports).

## Before you continue

All of the framework guides assume you already have a fundamental understanding of [Git](https://git-scm.com/). If you are new to Git, refer to this [summarized Git handbook](https://guides.github.com/introduction/git-handbook/) on how to set up Git on your local machine.

If you clone with SSH, you must [generate SSH keys](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) on each computer you use to push or pull from GitHub.

Refer to the [GitHub documentation](https://guides.github.com/introduction/git-handbook/) and [Git documentation](https://git-scm.com/book/en/v2) for more information.

## Select your Next.js project

If you already have a Next.js project that you wish to deploy, ensure that it is [configured for static exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports), change to its directory, and proceed to the next step. Otherwise, use `create-next-app` to create a new Next.js project.

```sh
npx create-next-app --example with-static-export my-app
```

After creating your project, a new `my-app` directory will be generated using the official [`with-static-export`](https://github.com/vercel/next.js/tree/canary/examples/with-static-export) example as a template. Change to this directory to continue.

```sh
cd my-app
```

### Create a GitHub repository

Create a new GitHub repository by visiting [repo.new](https://repo.new). After creating a new repository, prepare and push your local application to GitHub by running the following commands in your terminal:

```sh
git remote add origin https://github.com/<GH_USERNAME>/<REPOSITORY_NAME>.git
git branch -M main
git push -u origin main
```

### Deploy your application to Cloudflare Pages

To deploy your site to Pages:

1. In the Cloudflare dashboard, go to the **Workers & Pages** page.

   [Go to **Workers & Pages**](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

2. Select **Create application**.

3. Select the **Pages** tab.

4. Select **Import an existing Git repository**.

5. Select the new GitHub repository that you created and then select **Begin setup**.

6. In the **Build settings** section, select *Next.js (Static HTML Export)* as your **Framework preset**. Your selection will provide the following information:

| Configuration option | Value |
| - | - |
| Production branch | `main` |
| Build command | `npx next build` |
| Build directory | `out` |

After configuring your site, you can begin your first deploy. Cloudflare Pages will install `next`, your project dependencies, and build your site before deploying it.

## Preview your site

After deploying your site, you will receive a unique subdomain for your project on `*.pages.dev`.

Every time you commit new code to your Next.js site, Cloudflare Pages will automatically rebuild your project and deploy it. You will also get access to [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) on new pull requests, so you can preview how changes look to your site before deploying them to production.

For the complete guide to deploying your first site to Cloudflare Pages, refer to the [Get started guide](https://developers.cloudflare.com/pages/get-started/).

</page>
