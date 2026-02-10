<page>
---
title: R2 SQL · R2 SQL docs
description: A distributed SQL engine for R2 Data Catalog
lastUpdated: 2026-02-02T10:17:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/r2-sql/
  md: https://developers.cloudflare.com/r2-sql/index.md
---

Note

R2 SQL is in **open beta**, and any developer with an [R2 subscription](https://developers.cloudflare.com/r2/pricing/) can start using it. Currently, outside of standard R2 storage and operations, you will not be billed for your use of R2 SQL. We will update [the pricing page](https://developers.cloudflare.com/r2-sql/platform/pricing) and provide at least 30 days notice before enabling billing.

Query Apache Iceberg tables managed by R2 Data Catalog using SQL.

R2 SQL is Cloudflare's serverless, distributed, analytics query engine for querying [Apache Iceberg](https://iceberg.apache.org/) tables stored in [R2 Data Catalog](https://developers.cloudflare.com/r2/data-catalog/). R2 SQL is designed to efficiently query large amounts of data by automatically utilizing file pruning, Cloudflare's distributed compute, and R2 object storage.

```sh
❯ npx wrangler r2 sql query "3373912de3f5202317188ae01300bd6_data-catalog" \
"SELECT * FROM default.transactions LIMIT 10"


 ⛅️ wrangler 4.38.0
────────────────────────────────────────────────────────────────────────────
▲ [WARNING] 🚧 `wrangler r2 sql query` is an open-beta command. Please report any issues to https://github.com/cloudflare/workers-sdk/issues/new/choose




┌─────────────────────────────┬──────────────────────────────────────┬─────────┬──────────┬──────────────────────────────────┬───────────────┬───────────────────┬──────────┐
│ __ingest_ts                 │ transaction_id                       │ user_id │ amount   │ transaction_timestamp            │ location      │ merchant_category │ is_fraud │
├─────────────────────────────┼──────────────────────────────────────┼─────────┼──────────┼──────────────────────────────────┼───────────────┼───────────────────┼──────────┤
│ 2025-09-20T22:30:11.872554Z │ fdc1beed-157c-4d2d-90cf-630fdea58051 │ 1679    │ 13241.59 │ 2025-09-20T02:23:04.269988+00:00 │ NEW_YORK      │ RESTAURANT        │ false    │
├─────────────────────────────┼──────────────────────────────────────┼─────────┼──────────┼──────────────────────────────────┼───────────────┼───────────────────┼──────────┤
│ 2025-09-20T22:30:11.724378Z │ ea7ef106-8284-4d08-9348-ad33989b6381 │ 1279    │ 17615.79 │ 2025-09-20T02:23:04.271090+00:00 │ MIAMI         │ GAS_STATION       │ true     │
├─────────────────────────────┼──────────────────────────────────────┼─────────┼──────────┼──────────────────────────────────┼───────────────┼───────────────────┼──────────┤
│ 2025-09-20T22:30:11.724330Z │ afcdee4d-5c71-42be-97ec-e282b6937a8c │ 1843    │ 7311.65  │ 2025-09-20T06:23:04.267890+00:00 │ SEATTLE       │ GROCERY           │ true     │
├─────────────────────────────┼──────────────────────────────────────┼─────────┼──────────┼──────────────────────────────────┼───────────────┼───────────────────┼──────────┤
│ 2025-09-20T22:30:11.657007Z │ b99d14e0-dbe0-49bc-a417-0ee57f8bed99 │ 1976    │ 15228.21 │ 2025-09-16T23:23:04.269426+00:00 │ NEW_YORK      │ RETAIL            │ false    │
├─────────────────────────────┼──────────────────────────────────────┼─────────┼──────────┼──────────────────────────────────┼───────────────┼───────────────────┼──────────┤
│ 2025-09-20T22:30:11.656992Z │ 712cd094-ad4c-4d24-819a-0d3daaaceea1 │ 1184    │ 7570.89  │ 2025-09-20T00:23:04.269163+00:00 │ LOS_ANGELES   │ RESTAURANT        │ true     │
├─────────────────────────────┼──────────────────────────────────────┼─────────┼──────────┼──────────────────────────────────┼───────────────┼───────────────────┼──────────┤
│ 2025-09-20T22:30:11.656912Z │ b5a1aab3-676d-4492-92b8-aabcde6db261 │ 1196    │ 46611.25 │ 2025-09-20T16:23:04.268693+00:00 │ NEW_YORK      │ RETAIL            │ true     │
├─────────────────────────────┼──────────────────────────────────────┼─────────┼──────────┼──────────────────────────────────┼───────────────┼───────────────────┼──────────┤
│ 2025-09-20T22:30:11.613740Z │ 432d3976-8d89-4813-9099-ea2afa2c0e70 │ 1720    │ 21547.9  │ 2025-09-20T05:23:04.273681+00:00 │ SAN FRANCISCO │ GROCERY           │ true     │
├─────────────────────────────┼──────────────────────────────────────┼─────────┼──────────┼──────────────────────────────────┼───────────────┼───────────────────┼──────────┤
│ 2025-09-20T22:30:11.532068Z │ 25e0b851-3092-4ade-842f-e3189e07d4ee │ 1562    │ 29311.54 │ 2025-09-20T05:23:04.277405+00:00 │ NEW_YORK      │ RETAIL            │ false    │
├─────────────────────────────┼──────────────────────────────────────┼─────────┼──────────┼──────────────────────────────────┼───────────────┼───────────────────┼──────────┤
│ 2025-09-20T22:30:11.526037Z │ 8001746d-05fe-42fe-a189-40caf81d7aa2 │ 1817    │ 15976.5  │ 2025-09-15T16:23:04.266632+00:00 │ SEATTLE       │ RESTAURANT        │ true     │
└─────────────────────────────┴──────────────────────────────────────┴─────────┴──────────┴──────────────────────────────────┴───────────────┴───────────────────┴──────────┘
Read 11.3 kB across 4 files from R2
On average, 3.36 kB / s
```

Create an end-to-end data pipeline by following [this step by step guide](https://developers.cloudflare.com/r2-sql/get-started/), which shows you how to stream events into an Apache Iceberg table and query it with R2 SQL.

</page>

<page>
---
title: 404 - Page Not Found · R2 SQL docs
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/r2-sql/404/
  md: https://developers.cloudflare.com/r2-sql/404/index.md
---

# 404

Check the URL, try using our [search](https://developers.cloudflare.com/search/) or try our LLM-friendly [llms.txt directory](https://developers.cloudflare.com/llms.txt).

</page>

<page>
---
title: Getting started · R2 SQL docs
description: Create your first pipeline to ingest streaming data and write to R2
  Data Catalog as an Apache Iceberg table.
lastUpdated: 2025-11-17T14:08:01.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/r2-sql/get-started/
  md: https://developers.cloudflare.com/r2-sql/get-started/index.md
---

This guide will instruct you through:

* Creating your first [R2 bucket](https://developers.cloudflare.com/r2/buckets/) and enabling its [data catalog](https://developers.cloudflare.com/r2/data-catalog/).
* Creating an [API token](https://developers.cloudflare.com/r2/api/tokens/) needed for pipelines to authenticate with your data catalog.
* Creating your first pipeline with a simple ecommerce schema that writes to an [Apache Iceberg](https://iceberg.apache.org/) table managed by R2 Data Catalog.
* Sending sample ecommerce data via HTTP endpoint.
* Validating data in your bucket and querying it with R2 SQL.

## Prerequisites

1. Sign up for a [Cloudflare account](https://dash.cloudflare.com/sign-up/workers-and-pages).
2. Install [`Node.js`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

Node.js version manager

Use a Node version manager like [Volta](https://volta.sh/) or [nvm](https://github.com/nvm-sh/nvm) to avoid permission issues and change Node.js versions. [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/), discussed later in this guide, requires a Node version of `16.17.0` or later.

## 1. Create an R2 bucket

* Wrangler CLI

  1. If not already logged in, run:

     ```plaintext
     npx wrangler login
     ```

  2. Create an R2 bucket:

     ```plaintext
     npx wrangler r2 bucket create pipelines-tutorial
     ```

* Dashboard

  1. In the Cloudflare dashboard, go to the **R2 object storage** page.

     [Go to **Overview**](https://dash.cloudflare.com/?to=/:account/r2/overview)

  2. Select **Create bucket**.

  3. Enter the bucket name: pipelines-tutorial

  4. Select **Create bucket**.

## 2. Enable R2 Data Catalog

* Wrangler CLI

  Enable the catalog on your R2 bucket:

  ```plaintext
  npx wrangler r2 bucket catalog enable pipelines-tutorial
  ```

  When you run this command, take note of the "Warehouse" and "Catalog URI". You will need these later.

* Dashboard

  1. In the Cloudflare dashboard, go to the **R2 object storage** page.

     [Go to **Overview**](https://dash.cloudflare.com/?to=/:account/r2/overview)

  2. Select the bucket: pipelines-tutorial.

  3. Switch to the **Settings** tab, scroll down to **R2 Data Catalog**, and select **Enable**.

  4. Once enabled, note the **Catalog URI** and **Warehouse name**.

## 3. Create an API token

Pipelines must authenticate to R2 Data Catalog with an [R2 API token](https://developers.cloudflare.com/r2/api/tokens/) that has catalog and R2 permissions.

1. In the Cloudflare dashboard, go to the **R2 object storage** page.

   [Go to **Overview**](https://dash.cloudflare.com/?to=/:account/r2/overview)

2. Select **Manage API tokens**.

3. Select **Create Account API token**.

4. Give your API token a name.

5. Under **Permissions**, choose the **Admin Read & Write** permission.

6. Select **Create Account API Token**.

7. Note the **Token value**.

Note

This token also includes the R2 SQL Read permission, which allows you to query your data with R2 SQL.

## 4. Create a pipeline

* Wrangler CLI

  First, create a schema file that defines your ecommerce data structure:

  **Create `schema.json`:**

  ```json
  {
    "fields": [
      {
        "name": "user_id",
        "type": "string",
        "required": true
      },
      {
        "name": "event_type",
        "type": "string",
        "required": true
      },
      {
        "name": "product_id",
        "type": "string",
        "required": false
      },
      {
        "name": "amount",
        "type": "float64",
        "required": false
      }
    ]
  }
  ```

  Use the interactive setup to create a pipeline that writes to R2 Data Catalog:

  ```bash
  npx wrangler pipelines setup
  ```

  Follow the prompts:

  1. **Pipeline name**: Enter `ecommerce`

  2. **Stream configuration**:

     * Enable HTTP endpoint: `yes`
     * Require authentication: `no` (for simplicity)
     * Configure custom CORS origins: `no`
     * Schema definition: `Load from file`
     * Schema file path: `schema.json` (or your file path)

  3. **Sink configuration**:

     * Destination type: `Data Catalog Table`
     * R2 bucket name: `pipelines-tutorial`
     * Namespace: `default`
     * Table name: `ecommerce`
     * Catalog API token: Enter your token from step 3
     * Compression: `zstd`
     * Roll file when size reaches (MB): `100`
     * Roll file when time reaches (seconds): `10` (for faster data visibility in this tutorial)

  4. **SQL transformation**: Choose `Use simple ingestion query` to use:

     ```sql
     INSERT INTO ecommerce_sink SELECT * FROM ecommerce_stream
     ```

  After setup completes, note the HTTP endpoint URL displayed in the final output.

* Dashboard

  1. In the Cloudflare dashboard, go to **Pipelines** > **Pipelines**.

     [Go to **Pipelines**](https://dash.cloudflare.com/?to=/:account/pipelines/overview)

  2. Select **Create Pipeline**.

  3. **Connect to a Stream**:

     * Pipeline name: `ecommerce`
     * Enable HTTP endpoint for sending data: Enabled
     * HTTP authentication: Disabled (default)
     * Select **Next**

  4. **Define Input Schema**:

     * Select **JSON editor**

     * Copy in the schema:

       ```json
       {
         "fields": [
           {
             "name": "user_id",
             "type": "string",
             "required": true
           },
           {
             "name": "event_type",
             "type": "string",
             "required": true
           },
           {
             "name": "product_id",
             "type": "string",
             "required": false
           },
           {
             "name": "amount",
             "type": "f64",
             "required": false
           }
         ]
       }
       ```

     * Select **Next**

  5. **Define Sink**:

     * Select your R2 bucket: `pipelines-tutorial`
     * Storage type: **R2 Data Catalog**
     * Namespace: `default`
     * Table name: `ecommerce`
     * **Advanced Settings**: Change **Maximum Time Interval** to `10 seconds`
     * Select **Next**

  6. **Credentials**:

     * Disable **Automatically create an Account API token for your sink**
     * Enter **Catalog Token** from step 3
     * Select **Next**

  7. **Pipeline Definition**:

     * Leave the default SQL query:

       ```sql
       INSERT INTO ecommerce_sink SELECT * FROM ecommerce_stream;
       ```

     * Select **Create Pipeline**

  8. After pipeline creation, note the **Stream ID** for the next step.

## 5. Send sample data

Send ecommerce events to your pipeline's HTTP endpoint:

```bash
curl -X POST https://{stream-id}.ingest.cloudflare.com \
  -H "Content-Type: application/json" \
  -d '[
    {
      "user_id": "user_12345",
      "event_type": "purchase",
      "product_id": "widget-001",
      "amount": 29.99
    },
    {
      "user_id": "user_67890",
      "event_type": "view_product",
      "product_id": "widget-002"
    },
    {
      "user_id": "user_12345",
      "event_type": "add_to_cart",
      "product_id": "widget-003",
      "amount": 15.50
    }
  ]'
```

Replace `{stream-id}` with your actual stream endpoint from the pipeline setup.

## 6. Validate data in your bucket

1. In the Cloudflare dashboard, go to the **R2 object storage** page.

2. Select your bucket: `pipelines-tutorial`.

3. You should see Iceberg metadata files and data files created by your pipeline. Note: If you aren't seeing any files in your bucket, try waiting a couple of minutes and trying again.

4. The data is organized in the Apache Iceberg format with metadata tracking table versions.

## 7. Query your data using R2 SQL

Set up your environment to use R2 SQL:

```bash
export WRANGLER_R2_SQL_AUTH_TOKEN=YOUR_API_TOKEN
```

Or create a `.env` file with:

```plaintext
WRANGLER_R2_SQL_AUTH_TOKEN=YOUR_API_TOKEN
```

Where `YOUR_API_TOKEN` is the token you created in step 3. For more information on setting environment variables, refer to [Wrangler system environment variables](https://developers.cloudflare.com/workers/wrangler/system-environment-variables/).

Query your data:

```bash
npx wrangler r2 sql query "YOUR_WAREHOUSE_NAME" "
SELECT
    user_id,
    event_type,
    product_id,
    amount
FROM default.ecommerce
WHERE event_type = 'purchase'
LIMIT 10"
```

Replace `YOUR_WAREHOUSE_NAME` with the warehouse name from step 2.

You can also query this table with any engine that supports Apache Iceberg. To learn more about connecting other engines to R2 Data Catalog, refer to [Connect to Iceberg engines](https://developers.cloudflare.com/r2/data-catalog/config-examples/).

## Learn more

[Managing R2 Data Catalogs ](https://developers.cloudflare.com/r2/data-catalog/manage-catalogs/)Enable or disable R2 Data Catalog on your bucket, retrieve configuration details, and authenticate your Iceberg engine.

[Try another example ](https://developers.cloudflare.com/r2-sql/tutorials/end-to-end-pipeline)Detailed tutorial for setting up a simple fraud detection data pipeline, and generate events for it in Python.

[Pipelines ](https://developers.cloudflare.com/pipelines/)Understand SQL transformations and pipeline configuration.

</page>

<page>
---
title: Platform · R2 SQL docs
lastUpdated: 2025-09-25T04:13:57.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/r2-sql/platform/
  md: https://developers.cloudflare.com/r2-sql/platform/index.md
---


</page>

<page>
---
title: Query data · R2 SQL docs
description: Understand how to query data with R2 SQL
lastUpdated: 2025-10-23T14:34:04.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/r2-sql/query-data/
  md: https://developers.cloudflare.com/r2-sql/query-data/index.md
---

Query [Apache Iceberg](https://iceberg.apache.org/) tables managed by [R2 Data Catalog](https://developers.cloudflare.com/r2/data-catalog/). R2 SQL queries can be made via [Wrangler](https://developers.cloudflare.com/workers/wrangler/) or HTTP API.

## Get your warehouse name

To query data with R2 SQL, you'll need your warehouse name associated with your [catalog](https://developers.cloudflare.com/r2/data-catalog/manage-catalogs/). To retrieve it, you can run the [`r2 bucket catalog get` command](https://developers.cloudflare.com/workers/wrangler/commands/#r2-bucket-catalog-get):

```bash
npx wrangler r2 bucket catalog get <BUCKET_NAME>
```

Alternatively, you can find it in the dashboard by going to the **R2 object storage** page, selecting the bucket, switching to the **Settings** tab, scrolling to **R2 Data Catalog**, and finding **Warehouse name**.

## Query via Wrangler

To begin, install [`npm`](https://docs.npmjs.com/getting-started). Then [install Wrangler, the Developer Platform CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/).

Wrangler needs an API token with permissions to access R2 Data Catalog, R2 storage, and R2 SQL to execute queries. The `r2 sql query` command looks for the token in the `WRANGLER_R2_SQL_AUTH_TOKEN` environment variable.

Set up your environment:

```bash
export WRANGLER_R2_SQL_AUTH_TOKEN=YOUR_API_TOKEN
```

Or create a `.env` file with:

```plaintext
WRANGLER_R2_SQL_AUTH_TOKEN=YOUR_API_TOKEN
```

Where `YOUR_API_TOKEN` is the token you created with the [required permissions](#authentication). For more information on setting environment variables, refer to [Wrangler system environment variables](https://developers.cloudflare.com/workers/wrangler/system-environment-variables/).

To run a SQL query, run the [`r2 sql query` command](https://developers.cloudflare.com/workers/wrangler/commands/#r2-sql-query):

```bash
npx wrangler r2 sql query <WAREHOUSE> "SELECT * FROM namespace.table_name limit 10;"
```

For a full list of supported sql commands, refer to the [R2 SQL reference page](https://developers.cloudflare.com/r2-sql/sql-reference).

## Query via API

Below is an example of using R2 SQL via the REST endpoint:

```bash
curl -X POST \
  "https://api.sql.cloudflarestorage.com/api/v1/accounts/{ACCOUNT_ID}/r2-sql/query/{BUCKET_NAME}" \
  -H "Authorization: Bearer ${WRANGLER_R2_SQL_AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT * FROM namespace.table_name limit 10;"
  }'
```

The API requires an API token with the appropriate permissions in the Authorization header. Refer to [Authentication](#authentication) for details on creating a token.

For a full list of supported sql commands, refer to the [R2 SQL reference page](https://developers.cloudflare.com/r2-sql/sql-reference).

## Authentication

To query data with R2 SQL, you must provide a Cloudflare API token with R2 SQL, R2 Data Catalog, and R2 storage permissions. R2 SQL requires these permissions to access catalog metadata and read the underlying data files stored in R2.

### Create API token in the dashboard

Create an [R2 API token](https://developers.cloudflare.com/r2/api/tokens/#permissions) with the following permissions:

* Access to R2 Data Catalog (read-only)
* Access to R2 storage (Admin read/write)
* Access to R2 SQL (read-only)

Use this token value for the `WRANGLER_R2_SQL_AUTH_TOKEN` environment variable when querying with Wrangler, or in the Authorization header when using the REST API.

### Create API token via API

To create an API token programmatically for use with R2 SQL, you'll need to specify R2 SQL, R2 Data Catalog, and R2 storage permission groups in your [Access Policy](https://developers.cloudflare.com/r2/api/tokens/#access-policy).

#### Example Access Policy

```json
[
  {
    "id": "f267e341f3dd4697bd3b9f71dd96247f",
    "effect": "allow",
    "resources": {
      "com.cloudflare.edge.r2.bucket.4793d734c0b8e484dfc37ec392b5fa8a_default_my-bucket": "*",
      "com.cloudflare.edge.r2.bucket.4793d734c0b8e484dfc37ec392b5fa8a_eu_my-eu-bucket": "*"
    },
    "permission_groups": [
      {
        "id": "f45430d92e2b4a6cb9f94f2594c141b8",
        "name": "Workers R2 SQL Read"
      },
      {
        "id": "d229766a2f7f4d299f20eaa8c9b1fde9",
        "name": "Workers R2 Data Catalog Write"
      },
      {
        "id": "bf7481a1826f439697cb59a20b22293e",
        "name": "Workers R2 Storage Write"
      }
    ]
  }
]
```

To learn more about how to create API tokens for R2 SQL using the API, including required permission groups and usage examples, refer to the [Create API tokens via API documentation](https://developers.cloudflare.com/r2/api/tokens/#create-api-tokens-via-api).

## Additional resources

[Manage R2 Data Catalogs ](https://developers.cloudflare.com/r2/data-catalog/manage-catalogs/)Enable or disable R2 Data Catalog on your bucket, retrieve configuration details, and authenticate your Iceberg engine.

[Build an end to end data pipeline ](https://developers.cloudflare.com/r2-sql/tutorials/end-to-end-pipeline)Detailed tutorial for setting up a simple fraud detection data pipeline, and generate events for it in Python.

</page>

<page>
---
title: Reference · R2 SQL docs
lastUpdated: 2025-09-25T04:13:57.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/r2-sql/reference/
  md: https://developers.cloudflare.com/r2-sql/reference/index.md
---


</page>

<page>
---
title: SQL reference · R2 SQL docs
description: Comprehensive reference for SQL syntax and data types supported in R2 SQL.
lastUpdated: 2025-12-12T16:58:55.000Z
chatbotDeprioritize: false
tags: SQL
source_url:
  html: https://developers.cloudflare.com/r2-sql/sql-reference/
  md: https://developers.cloudflare.com/r2-sql/sql-reference/index.md
---

Note

R2 SQL is in public beta. Supported SQL grammar may change over time.

This page documents the R2 SQL syntax based on the currently supported grammar in public beta.

***

## Query Syntax

```sql
SELECT column_list | aggregation_function
FROM table_name
WHERE conditions --optional
[GROUP BY column_list]
[HAVING conditions]
[ORDER BY column_name [DESC | ASC]]
[LIMIT number]
```

***

## Schema Discovery Commands

R2 SQL supports metadata queries to explore available namespaces and tables.

### SHOW DATABASES

Lists all available namespaces.

```sql
SHOW DATABASES;
```

### SHOW NAMESPACES

Alias for `SHOW DATABASES`. Lists all available namespaces.

```sql
SHOW NAMESPACES;
```

### SHOW TABLES

Lists all tables within a specific namespace.

```sql
SHOW TABLES IN namespace_name;
```

### DESCRIBE

Describes the structure of a table, showing column names and data types.

```sql
DESCRIBE namespace_name.table_name;
```

***

## SELECT Clause

### Syntax

```sql
SELECT column_specification [, column_specification, ...]
```

### Column Specification

* **Column name**: `column_name`
* **All columns**: `*`

### Examples

```sql
SELECT * FROM namespace_name.table_name
SELECT user_id FROM namespace_name.table_name
SELECT user_id, timestamp, status FROM namespace_name.table_name
SELECT timestamp, user_id, response_code FROM namespace_name.table_name
```

***

## Aggregation Functions

### Syntax

```sql
SELECT aggregation_function(column_name)
FROM table_name
GROUP BY column_list
```

### Supported Functions

* **COUNT(\*)**: Counts total rows **note**: only `*` is supported
* **SUM(column)**: Sums numeric values
* **AVG(column)**: Calculates average of numeric values
* **MIN(column)**: Finds minimum value
* **MAX(column)**: Finds maximum value

### Examples

```sql
-- Count rows by department
SELECT department, COUNT(*)
FROM my_namespace.sales_data
GROUP BY department


-- Sum decimal values
SELECT region, SUM(total_amount)
FROM my_namespace.sales_data
GROUP BY region


-- Average by category
SELECT category, AVG(price)
FROM my_namespace.products
GROUP BY category


-- Min and Max
SELECT department, MIN(salary), MAX(salary)
FROM my_namespace.employees
GROUP BY department


-- Invalid: No aliases
SELECT department, COUNT(*) AS total FROM my_namespace.sales_data GROUP BY department


-- Invalid: COUNT column name
SELECT COUNT(department) FROM my_namespace.sales_data
```

***

## FROM Clause

### Syntax

```sql
SELECT * FROM table_name
```

***

## WHERE Clause

### Syntax

```sql
SELECT * WHERE condition [AND|OR condition ...]
```

### Conditions

#### Null Checks

* `column_name IS NULL`
* `column_name IS NOT NULL`

#### Value Comparisons

* `column_name BETWEEN value' AND 'value`
* `column_name = value`
* `column_name >= value`
* `column_name > value`
* `column_name <= value`
* `column_name < value`
* `column_name != value`
* `column_name LIKE 'value%'`

#### Logical Operators

* `AND` - Logical AND
* `OR` - Logical OR

### Data Types

* **integer** - Whole numbers
* **float** - Decimal numbers
* **string** - Text values (quoted)
* **timestamp** - RFC3339 format (`'YYYY-DD-MMT-HH:MM:SSZ'`)
* **date** - Date32/Data64 expressed as a string (`'YYYY-MM-DD'`)
* **boolean** - Explicitly valued (true, false)

### Examples

```sql
SELECT * FROM namespace_name.table_name WHERE timestamp BETWEEN '2025-09-24T01:00:00Z' AND '2025-09-25T01:00:00Z'
SELECT * FROM namespace_name.table_name WHERE status = 200
SELECT * FROM namespace_name.table_name WHERE response_time > 1000
SELECT * FROM namespace_name.table_name WHERE user_id IS NOT NULL
SELECT * FROM namespace_name.table_name WHERE method = 'GET' AND status >= 200 AND status < 300
SELECT * FROM namespace_name.table_name WHERE (status = 404 OR status = 500) AND timestamp > '2024-01-01'
```

***

## GROUP BY Clause

### Syntax

```sql
SELECT column_list, aggregation_function
FROM table_name
[WHERE conditions]
GROUP BY column_list
```

### Examples

```sql
-- Single column grouping
SELECT department, COUNT(*)
FROM my_namespace.sales_data
GROUP BY department


-- Multiple column grouping
SELECT department, category, COUNT(*)
FROM my_namespace.sales_data
GROUP BY department, category


-- With WHERE filter
SELECT region, COUNT(*)
FROM my_namespace.sales_data
WHERE status = 'completed'
GROUP BY region


-- With ORDER BY (COUNT only)
SELECT region, COUNT(*)
FROM my_namespace.sales_data
GROUP BY region
ORDER BY COUNT(*) DESC
LIMIT 10


-- ORDER BY SUM
SELECT department, SUM(amount)
FROM my_namespace.sales_data
GROUP BY department
ORDER BY SUM(amount) DESC
```

***

## HAVING Clause

### Syntax

```sql
SELECT column_list, COUNT(*)
FROM table_name
GROUP BY column_list
HAVING SUM/COUNT/MIN/MAX/AVG(column_name) comparison_operator value
```

### Examples

```sql
-- Filter by count threshold
SELECT department, COUNT(*)
FROM my_namespace.sales_data
GROUP BY department
HAVING COUNT(*) > 1000


-- Multiple conditions
SELECT region, COUNT(*)
FROM my_namespace.sales_data
GROUP BY region
HAVING COUNT(*) >= 100


-- HAVING with SUM
SELECT department, SUM(amount)
FROM my_namespace.sales_data
GROUP BY department
HAVING SUM(amount) > 1000000
```

***

## ORDER BY Clause

### Syntax

```sql
--Note: ORDER BY only supports ordering by the partition key
ORDER BY partition_key [DESC]
```

* **ASC**: Ascending order
* **DESC**: Descending order
* **Default**: DESC on all columns of the partition key
* Can contain any columns from the partition key

### Examples

```sql
SELECT * FROM namespace_name.table_name WHERE ... ORDER BY partition_key_A
SELECT * FROM namespace_name.table_name WHERE ... ORDER BY partition_key_B DESC
SELECT * FROM namespace_name.table_name WHERE ... ORDER BY partition_key_A ASC
```

***

## LIMIT Clause

### Syntax

```sql
LIMIT number
```

* **Range**: 1 to 10,000
* **Type**: Integer only
* **Default**: 500

### Examples

```sql
SELECT * FROM namespace_name.table_name WHERE ... LIMIT 100
```

***

## Complete Query Examples

### Basic Query

```sql
SELECT *
FROM my_namespace.http_requests
WHERE timestamp BETWEEN '2025-09-24T01:00:00Z' AND '2025-09-25T01:00:00Z'
LIMIT 100
```

### Filtered Query with Sorting

```sql
SELECT user_id, timestamp, status, response_time
FROM my_namespace.access_logs
WHERE status >= 400 AND response_time > 5000
ORDER BY response_time DESC
LIMIT 50
```

### Complex Conditions

```sql
SELECT timestamp, method, status, user_agent
FROM my_namespace.http_requests
WHERE (method = 'POST' OR method = 'PUT')
  AND status BETWEEN 200 AND 299
  AND user_agent IS NOT NULL
ORDER BY timestamp DESC
LIMIT 1000
```

### Null Handling

```sql
SELECT user_id, session_id, date_column
FROM my_namespace.user_events
WHERE session_id IS NOT NULL
  AND date_column >= '2024-01-01'
ORDER BY timestamp
LIMIT 500
```

### Aggregation Query

```sql
SELECT department, COUNT(*)
FROM my_namespace.sales_data
WHERE sale_date >= '2024-01-01'
GROUP BY department
ORDER BY COUNT(*) DESC
LIMIT 10
```

### Aggregation with HAVING

```sql
SELECT region, COUNT(*)
FROM my_namespace.sales_data
WHERE status = 'completed'
GROUP BY region
HAVING COUNT(*) > 1000
LIMIT 20
```

### Multiple Column Grouping

```sql
SELECT department, category, MIN(price), MAX(price)
FROM my_namespace.products
GROUP BY department, category
LIMIT 100
```

***

## Data Type Reference

### Supported Types

| Type | Description | Example Values |
| - | - | - |
| `integer` | Whole numbers | `1`, `42`, `-10`, `0` |
| `float` | Decimal numbers | `1.5`, `3.14`, `-2.7`, `0.0` |
| `string` | Text values | `'hello'`, `'GET'`, `'2024-01-01'` |
| `boolean` | Boolean values | `true`, `false` |
| `timestamp` | RFC3339 | `'2025-09-24T01:00:00Z'` |
| `date` | 'YYYY-MM-DD' | `'2025-09-24'` |

### Type Usage in Conditions

```sql
-- Integer comparisons
SELECT * FROM namespace_name.table_name WHERE status = 200
SELECT * FROM namespace_name.table_name WHERE response_time > 1000


-- Float comparisons
SELECT * FROM namespace_name.table_name WHERE cpu_usage >= 85.5
SELECT * FROM namespace_name.table_name WHERE memory_ratio < 0.8


-- String comparisons
SELECT * FROM namespace_name.table_name WHERE method = 'POST'
SELECT * FROM namespace_name.table_name WHERE user_agent != 'bot'
SELECT * FROM namespace_name.table_name WHERE country_code = 'US'
```

***

## Operator Precedence

1. **Comparison operators**: `=`, `!=`, `<`, `<=`, `>`, `>=`, `LIKE`, `BETWEEN`, `IS NULL`, `IS NOT NULL`
2. **AND** (higher precedence)
3. **OR** (lower precedence)

Use parentheses to override default precedence:

```sql
SELECT * FROM namespace_name.table_name WHERE (status = 404 OR status = 500) AND method = 'GET'
```

***

</page>

<page>
---
title: Troubleshooting guide · R2 SQL docs
description: This guide covers potential errors and limitations you may
  encounter when using R2 SQL. R2 SQL is in open beta, and supported
  functionality will evolve and change over time.
lastUpdated: 2025-09-25T04:13:57.000Z
chatbotDeprioritize: false
tags: SQL
source_url:
  html: https://developers.cloudflare.com/r2-sql/troubleshooting/
  md: https://developers.cloudflare.com/r2-sql/troubleshooting/index.md
---

This guide covers potential errors and limitations you may encounter when using R2 SQL. R2 SQL is in open beta, and supported functionality will evolve and change over time.

## Query Structure Errors

### Missing Required Clauses

**Error**: `expected exactly 1 table in FROM clause`

**Problem**: R2 SQL requires specific clauses in your query.

```sql
-- Invalid - Missing FROM clause
SELECT user_id WHERE status = 200;


-- Valid
SELECT user_id
FROM http_requests
WHERE status = 200 AND timestamp BETWEEN '2025-09-24T01:00:00Z' AND '2025-09-25T01:00:00Z';
```

**Solution**: Always include `FROM` in your queries.

***

## SELECT Clause Issues

### Unsupported SQL Functions

**Error**: `Function not supported`

**Problem**: Cannot use aggregate or SQL functions in SELECT.

```sql
-- Invalid - Aggregate functions not supported
SELECT COUNT(*) FROM events WHERE timestamp > '2025-09-24T01:00:00Z'
SELECT AVG(response_time) FROM http_requests WHERE status = 200
SELECT MAX(timestamp) FROM logs WHERE user_id = '123'
```

**Solution**: Use basic column selection, and handle aggregation in your application code.

### JSON Field Access

**Error**: `Cannot access nested fields`

**Problem**: Cannot query individual fields from JSON objects.

```sql
-- Invalid - JSON field access not supported
SELECT metadata.user_id FROM events
SELECT json_field->>'property' FROM logs


-- Valid - Select entire JSON field
SELECT metadata FROM events
SELECT json_field FROM logs
```

**Solution**: Select the entire JSON column and parse it in your application.

### Synthetic Data

**Error**: `aliases (AS) are not supported`

**Problem**: Cannot create synthetic columns with literal values.

```sql
-- Invalid - Synthetic data not supported
SELECT user_id, 'active' as status, 1 as priority FROM users


-- Valid
SELECT user_id, status, priority FROM users WHERE status = 'active'
```

**Solution**: Add the required data to your table schema, or handle it in post-processing.

***

## FROM Clause Issues

### Multiple Tables

**Error**: `Multiple tables not supported` or `JOIN operations not allowed`

**Problem**: Cannot query multiple tables or use JOINs.

```sql
-- Invalid - Multiple tables not supported
SELECT a.*, b.* FROM table1 a, table2 b WHERE a.id = b.id
SELECT * FROM events JOIN users ON events.user_id = users.id


-- Valid - Separate queries
SELECT * FROM table1 WHERE id IN ('id1', 'id2', 'id3')
-- Then in application code, query table2 separately
SELECT * FROM table2 WHERE id IN ('id1', 'id2', 'id3')
```

**Solution**:

* Denormalize your data by including necessary fields in a single table.
* Perform multiple queries and join data in your application.

### Subqueries

**Error**: `only table name is supported in FROM clause`

**Problem**: Cannot use subqueries in FROM clause.

```sql
-- Invalid - Subqueries not supported
SELECT * FROM (SELECT user_id FROM events WHERE status = 200) as active_users


-- Valid - Use direct query with appropriate filters
SELECT user_id FROM events WHERE status = 200
```

**Solution**: Flatten your query logic or use multiple sequential queries.

***

## WHERE Clause Issues

### Array Filtering

**Error**: `This feature is not implemented: GetFieldAccess`

**Problem**: Cannot filter on array fields.

```sql
-- Invalid - Array filtering not supported
SELECT * FROM logs WHERE tags[0] = 'error'
SELECT * FROM events WHERE 'admin' = ANY(roles)


-- Valid alternatives - denormalize or use string contains
SELECT * FROM logs WHERE tags_string LIKE '%error%'
-- Or restructure data to avoid arrays
```

**Solution**:

* Denormalize array data into separate columns.
* Use string concatenation of array values for pattern matching.
* Restructure your schema to avoid array types.

### JSON Object Filtering

**Error**: `unsupported binary operator` or `Error during planning: could not parse compound`

**Problem**: Cannot filter on fields inside JSON objects.

```sql
-- Invalid - JSON field filtering not supported
SELECT * FROM requests WHERE metadata.country = 'US'
SELECT * FROM logs WHERE json_data->>'level' = 'error'


-- Valid alternatives
SELECT * FROM requests WHERE country = 'US'  -- If denormalized
-- Or filter entire JSON field and parse in application
SELECT * FROM logs WHERE json_data IS NOT NULL
```

**Solution**:

* Denormalize frequently queried JSON fields into separate columns.
* Filter on the entire JSON field, and handle parsing in your application.

### Column Comparisons

**Error**: `right argument to a binary expression must be a literal`

**Problem**: Cannot compare one column to another in WHERE clause.

```sql
-- Invalid - Column comparisons not supported
SELECT * FROM events WHERE start_time < end_time
SELECT * FROM logs WHERE request_size > response_size


-- Valid - Use computed columns or application logic
-- Add a computed column 'duration' to your schema
SELECT * FROM events WHERE duration > 0
```

**Solution**: Handle comparisons in your application layer.

***

## LIMIT Clause Issues

### Invalid Limit Values

**Error**: `maximum LIMIT is 10000`

**Problem**: Cannot use invalid LIMIT values.

```sql
-- Invalid - Out of range limits
SELECT * FROM events LIMIT 50000  -- Maximum is 10,000


-- Valid
SELECT * FROM events LIMIT 1
SELECT * FROM events LIMIT 10000
```

**Solution**: Use LIMIT values between 1 and 10,000.

### Pagination Attempts

**Error**: `OFFSET not supported`

**Problem**: Cannot use pagination syntax.

```sql
-- Invalid - Pagination not supported
SELECT * FROM events LIMIT 100 OFFSET 200
SELECT * FROM events LIMIT 100, 100


-- Valid alternatives - Use ORDER BY with conditional filters
-- Page 1
SELECT * FROM events WHERE timestamp >= '2024-01-01' ORDER BY timestamp LIMIT 100


-- Page 2 - Use last timestamp from previous page
SELECT * FROM events WHERE timestamp > '2024-01-01T10:30:00Z' ORDER BY timestamp LIMIT 100
```

**Solution**: Implement cursor-based pagination using ORDER BY and WHERE conditions.

***

## Schema Issues

### Dynamic Schema Changes

**Error**: `invalid SQL: only top-level SELECT clause is supported`

**Problem**: Cannot modify table schema or reference non-existent columns.

```sql
-- Invalid - Schema changes not supported
ALTER TABLE events ADD COLUMN new_field STRING
UPDATE events SET status = 200 WHERE user_id = '123'
```

**Solution**:

* Plan your schema carefully before data ingestion.
* Ensure all column names exist in your current schema.

***

## Performance Optimization

### Query Performance Issues

If your queries are running slowly:

1. **Always include partition (timestamp) filters**: This is the most important optimization.

   ```sql
   -- Good
   WHERE timestamp BETWEEN '2024-01-01' AND '2024-01-02'
   ```

2. **Use selective filtering**: Include specific conditions to reduce result sets.

   ```sql
   -- Good
   WHERE status = 200 AND country = 'US' AND timestamp > '2024-01-01'
   ```

3. **Limit result size**: Use appropriate LIMIT values.

   ```sql
   -- Good for exploration
   SELECT * FROM events WHERE timestamp > '2024-01-01' LIMIT 100
   ```

</page>

<page>
---
title: Tutorials · R2 SQL docs
lastUpdated: 2025-09-25T04:13:57.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/r2-sql/tutorials/
  md: https://developers.cloudflare.com/r2-sql/tutorials/index.md
---


</page>

<page>
---
title: R2 SQL - Pricing · R2 SQL docs
description: R2 SQL is in open beta and available to any developer with an R2 subscription.
lastUpdated: 2025-09-25T04:13:57.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/r2-sql/platform/pricing/
  md: https://developers.cloudflare.com/r2-sql/platform/pricing/index.md
---

R2 SQL is in open beta and available to any developer with an [R2 subscription](https://developers.cloudflare.com/r2/pricing/).

We are not currently billing for R2 SQL during open beta. However, you will be billed for standard [R2 storage and operations](https://developers.cloudflare.com/r2/pricing/) for data accessed by queries.

We plan to bill based on the volume of data queried by R2 SQL. We'll provide at least 30 days notice before we make any changes or start charging for R2 SQL usage.

</page>

<page>
---
title: Limitations and best practices · R2 SQL docs
description: R2 SQL is designed for querying partitioned Apache Iceberg tables
  in your R2 data catalog. This document outlines the supported features,
  limitations, and best practices of R2 SQL.
lastUpdated: 2025-12-12T16:58:55.000Z
chatbotDeprioritize: false
tags: SQL
source_url:
  html: https://developers.cloudflare.com/r2-sql/reference/limitations-best-practices/
  md: https://developers.cloudflare.com/r2-sql/reference/limitations-best-practices/index.md
---

Note

R2 SQL is in open beta. Limitations and best practices will change over time.

R2 SQL is designed for querying **partitioned** Apache Iceberg tables in your R2 data catalog. This document outlines the supported features, limitations, and best practices of R2 SQL.

## Quick Reference

| Feature | Supported | Notes |
| - | - | - |
| Basic SELECT | Yes | Columns, \* |
| Aggregation functions | Yes | COUNT(\*), SUM, AVG, MIN, MAX |
| Single table FROM | Yes | Note, aliasing not supported |
| WHERE clause | Yes | Filters, comparisons, equality, etc |
| JOINs | No | No table joins |
| Array filtering | No | No array type support |
| JSON filtering | No | No nested object queries |
| Simple LIMIT | Yes | 1-10,000 range, no pagination support |
| ORDER BY | Yes | Partition key or with GROUP BY columns |
| GROUP BY | Yes | Supported |
| HAVING | Yes | Supported |

## Supported SQL Clauses

R2 SQL supports: `DESCRIBE`, `SHOW`, `SELECT`, `FROM`, `WHERE`, `GROUP BY`, `HAVING`, `ORDER BY`, and `LIMIT`. New features will be released in the future, keep an eye on this page for the latest.

***

## SELECT Clause

### Supported Features

* **Individual columns**: `SELECT column1, column2`
* **All columns**: `SELECT *`

### Limitations

* **No JSON field querying**: Cannot query individual fields from JSON objects
* **Limited aggregation functions**: See Aggregation Functions section below for details
* **No synthetic data**: Cannot create synthetic columns like `SELECT 1 AS what, "hello" AS greeting`
* **No field aliasing**: `SELECT field AS another_name` (applies to both regular columns and aggregations)

### Examples

```sql
-- Valid
SELECT timestamp, user_id, status FROM my_table;
SELECT * FROM my_table;


-- Invalid
SELECT user_id AS uid, timestamp AS ts FROM my_table;
SELECT COUNT(*) FROM events FROM FROM my_table;
SELECT json_field.property FROM my_table;
SELECT 1 AS synthetic_column FROM my_table;
```

***

## Aggregation Functions

### Supported Features

* **COUNT(\*)**: Count total rows **note**: only `*` is supported
* **SUM(column)**: Sum numeric values
* **AVG(column)**: Calculate average of numeric values
* **MIN(column)**: Find minimum value
* **MAX(column)**: Find maximum value
* **With GROUP BY**: All aggregations work with `GROUP BY`

### Limitations

* **No aliases**: `AS` keyword not supported (`SELECT COUNT(*) AS total` fails)
* **COUNT(\*) only**: `COUNT(column_name)` or `COUNT(DISTINCT column)` is not supported

### Examples

```sql
-- Valid
SELECT department, COUNT(*) FROM sales GROUP BY department;
SELECT region, AVG(amount) FROM sales GROUP BY region;
SELECT category, MIN(price), MAX(price) FROM products GROUP BY category;
SELECT SUM(quantity) FROM sales GROUP BY department ORDER BY SUM(amount) DESC;


-- Invalid
SELECT COUNT(*) AS total FROM sales GROUP BY department; -- No aliases
SELECT COUNT(department) FROM sales; -- Must use COUNT(*)
SELECT COUNT(DISTINCT region) FROM sales; -- No DISTINCT support
```

***

## GROUP BY Clause

### Supported Features

* **Single column grouping**: `GROUP BY column`
* **Multiple column grouping**: `GROUP BY column1, column2`
* **With WHERE**: Filter before grouping
* **With LIMIT**: Limit grouped results

### Limitations

* **No expressions**: Cannot use expressions in GROUP BY (e.g., `GROUP BY YEAR(date)`)

### Examples

```sql
SELECT region, COUNT(*) FROM sales GROUP BY region;
SELECT dept, category, COUNT(*) FROM sales GROUP BY dept, category;
SELECT region, COUNT(*) FROM sales WHERE status = 'completed' GROUP BY region;
SELECT dept, COUNT(*) FROM sales GROUP BY dept ORDER BY COUNT(*) DESC LIMIT 10;
SELECT is_active, SUM(amount) FROM sales GROUP BY is_active;
SELECT dept, SUM(amount) FROM sales GROUP BY dept ORDER BY SUM(amount) DESC;
```

***

## HAVING Clause

### Supported Features

* **With COUNT(\*)**: Filter groups by count
* **Comparison operators**: `>`, `>=`, `=`, `<`, `<=`, `!=`, `BETWEEN`, `AND`, `IS NOT NULL`
* **With GROUP BY**: Must be used with GROUP BY

### Examples

```sql
SELECT region, COUNT(*) FROM sales GROUP BY region HAVING COUNT(*) > 1000;
SELECT dept, SUM(amount) FROM sales GROUP BY dept HAVING SUM(amount) > 100000; -- HAVING with SUM
SELECT region, COUNT(*) FROM sales GROUP BY region HAVING COUNT(*) > 100 AND COUNT(*) < 1000;
```

***

## FROM Clause

### Supported Features

* **Single table queries**: `SELECT * FROM table_name`

### Limitations

* **No multiple tables**: Cannot specify multiple tables in FROM clause
* **No subqueries**: `SELECT ... FROM (SELECT ...)` is not supported
* **No JOINs**: No INNER, LEFT, RIGHT, or FULL JOINs
* **No SQL functions**: Cannot use functions like `read_parquet()`
* **No synthetic tables**: Cannot create tables from values
* **No schema evolution**: Schema cannot be altered (no ALTER TABLE, migrations)
* **Immutable datasets**: No UPDATE or DELETE operations allowed
* **Fully defined schema**: Dynamic or union-type fields are not supported
* **No table aliasing**: `SELECT * FROM table_name AS alias`

### Examples

```sql
--Valid
SELECT * FROM http_requests;


--Invalid
SELECT * FROM table1, table2;
SELECT * FROM table1 JOIN table2 ON table1.id = table2.id;
SELECT * FROM (SELECT * FROM events WHERE status = 200);
```

***

## WHERE Clause

### Supported Features

* **Simple type filtering**: Supports `string`, `boolean`, `number` types, and timestamps expressed as RFC3339
* **Boolean logic**: Supports `AND`, `OR`, `NOT` operators
* **Comparison operators**: `>`, `>=`, `=`, `<`, `<=`, `!=`
* **Grouped conditions**: `WHERE col_a="hello" AND (col_b>5 OR col_c != 3)`
* **Pattern matching:** `WHERE col_a LIKE ‘hello w%’` (prefix matching only)
* **NULL Handling :** `WHERE col_a IS NOT NULL` (`IS`/`IS NOT`)

### Limitations

* **No column-to-column comparisons**: Cannot use `WHERE col_a = col_b`
* **No array filtering**: Cannot filter on array types (array\[number], array\[string], array\[boolean])
* **No JSON/object filtering**: Cannot filter on fields inside nested objects or JSON
* **No SQL functions**: No function calls in WHERE clause
* **No arithmetic operators**: Cannot use `+`, `-`, `*`, `/` in conditions

### Examples

```sql
--Valid
SELECT * FROM events WHERE timestamp BETWEEN '2024-01-01' AND '2024-01-02';
SELECT * FROM logs WHERE status = 200 AND user_type = 'premium';
SELECT * FROM requests WHERE (method = 'GET' OR method = 'POST') AND response_time < 1000;


--Invalid
SELECT * FROM logs WHERE tags[0] = 'error'; -- Array filtering
SELECT * FROM requests WHERE metadata.user_id = '123'; -- JSON field filtering
SELECT * FROM events WHERE col_a = col_b; -- Column comparison
SELECT * FROM logs WHERE response_time + latency > 5000; -- Arithmetic
```

***

## ORDER BY Clause

### Supported Features

* **ASC**: Ascending order
* **DESC**: Descending order (Default, on full partition key)
* **With partition key**: Order by partition key columns
* **With GROUP BY**: Can order by all aggregation columns

### Limitations

* **Non-partition keys not supported**: `ORDER BY` on columns other than the partition key is not supported (except with aggregations)

### Examples

```sql
-- Valid
SELECT * FROM table_name WHERE ... ORDER BY partitionKey;
SELECT * FROM table_name WHERE ... ORDER BY partitionKey DESC;
SELECT dept, COUNT(*) FROM table_name GROUP BY dept ORDER BY COUNT(*) DESC;


-- Invalid
SELECT * FROM table_name GROUP BY dept ORDER BY nonPartitionKey DESC --ORDER BY a non-grouped column
```

***

## LIMIT Clause

### Supported Features

* **Simple limits**: `LIMIT number`
* **Range**: Minimum 1, maximum 10,000

### Limitations

* **No pagination**: `LIMIT offset, count` syntax not supported
* **No SQL functions**: Cannot use functions to determine limit
* **No arithmetic**: Cannot use expressions like `LIMIT 10 * 50`

### Examples

```sql
-- Valid
SELECT * FROM events LIMIT 100
SELECT * FROM logs WHERE ... LIMIT 10000


-- Invalid
SELECT * FROM events LIMIT 100, 50; -- Pagination
SELECT * FROM logs LIMIT COUNT(*); / 2 -- Functions
SELECT * FROM events LIMIT 10 * 10; -- Arithmetic
```

***

## Unsupported SQL Clauses

The following SQL clauses are **not supported**:

* `UNION`/`INTERSECT`/`EXCEPT`
* `WITH` (Common Table Expressions)
* `WINDOW` functions
* `INSERT`/`UPDATE`/`DELETE`
* `CREATE`/`ALTER`/`DROP`

***

## Best Practices

1. Always include time filters in your WHERE clause to ensure efficient queries.
2. Use specific column selection instead of `SELECT *` when possible for better performance.
3. Flatten your data to avoid nested JSON objects if you need to filter on those fields.
4. Use `COUNT(*)` exclusively - avoid `COUNT(column_name)` or `COUNT(DISTINCT column)`.
5. Enable compaction in R2 Data Catalog to reduce the number of data files needed to be scanned.

***

</page>

<page>
---
title: Wrangler commands · R2 SQL docs
description: Execute SQL query against R2 Data Catalog
lastUpdated: 2025-11-17T17:45:17.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/r2-sql/reference/wrangler-commands/
  md: https://developers.cloudflare.com/r2-sql/reference/wrangler-commands/index.md
---

Note

R2 SQL is currently in open beta. Report R2 SQL bugs in [GitHub](https://github.com/cloudflare/workers-sdk/issues/new/choose). R2 SQL expects there to be a [`WRANGLER_R2_SQL_AUTH_TOKEN`](https://developers.cloudflare.com/r2-sql/query-data/#authentication) environment variable to be set.

### `r2 sql query`

Execute SQL query against R2 Data Catalog

* npm

  ```sh
  npx wrangler r2 sql query [WAREHOUSE] [QUERY]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 sql query [WAREHOUSE] [QUERY]
  ```

* yarn

  ```sh
  yarn wrangler r2 sql query [WAREHOUSE] [QUERY]
  ```

- `[WAREHOUSE]` string required

  R2 Data Catalog warehouse name

- `[QUERY]` string required

  The SQL query to execute

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
title: Build an end to end data pipeline · R2 SQL docs
description: This tutorial demonstrates how to build a complete data pipeline
  using Cloudflare Pipelines, R2 Data Catalog, and R2 SQL.
lastUpdated: 2026-01-27T21:11:25.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/r2-sql/tutorials/end-to-end-pipeline/
  md: https://developers.cloudflare.com/r2-sql/tutorials/end-to-end-pipeline/index.md
---

In this tutorial, you will learn how to build a complete data pipeline using Cloudflare Pipelines, R2 Data Catalog, and R2 SQL. This also includes a sample Python script that creates and sends financial transaction data to your Pipeline that can be queried by R2 SQL or any Apache Iceberg-compatible query engine.

This tutorial demonstrates how to:

* Set up R2 Data Catalog to store our transaction events in an Apache Iceberg table
* Set up a Cloudflare Pipeline
* Create transaction data with fraud patterns to send to your Pipeline
* Query your data using R2 SQL for fraud analysis

## Prerequisites

1. Sign up for a [Cloudflare account](https://dash.cloudflare.com/sign-up).
2. Install [Node.js](https://nodejs.org/en/).
3. Install [Python 3.8+](https://python.org) for the data generation script.

Node.js version manager

Use a Node version manager like [Volta](https://volta.sh/) or [nvm](https://github.com/nvm-sh/nvm) to avoid permission issues and change Node.js versions.

Wrangler requires a Node version of 16.17.0 or later.

## 1. Set up authentication

You will need API tokens to interact with Cloudflare services.

1. In the Cloudflare dashboard, go to the **API tokens** page.

   [Go to **Account API tokens**](https://dash.cloudflare.com/?to=/:account/api-tokens)

2. Select **Create Token**.

3. Select **Get started** next to Create Custom Token.

4. Enter a name for your API token.

5. Under **Permissions**, choose:

   * **Workers Pipelines** with Read, Send, and Edit permissions
   * **Workers R2 Data Catalog** with Read and Edit permissions
   * **Workers R2 SQL** with Read permissions
   * **Workers R2 Storage** with Read and Edit permissions

6. Optionally, add a TTL to this token.

7. Select **Continue to summary**.

8. Click **Create Token**

9. Note the **Token value**.

Export your new token as an environment variable:

```bash
export WRANGLER_R2_SQL_AUTH_TOKEN= #paste your token here
```

If this is your first time using Wrangler, make sure to log in.

```bash
npx wrangler login
```

## 2. Create an R2 bucket and enable R2 Data Catalog

* Wrangler CLI

  Create an R2 bucket:

  ```bash
  npx wrangler r2 bucket create fraud-pipeline
  ```

* Dashboard

  1. In the Cloudflare dashboard, go to the **R2 object storage** page.

     [Go to **Overview**](https://dash.cloudflare.com/?to=/:account/r2/overview)

  2. Select **Create bucket**.

  3. Enter the bucket name: `fraud-pipeline`

  4. Select **Create bucket**.

Enable the catalog on your R2 bucket:

* Wrangler CLI

  ```bash
  npx wrangler r2 bucket catalog enable fraud-pipeline
  ```

  When you run this command, take note of the "Warehouse" and "Catalog URI". You will need these later.

* Dashboard

  1. In the Cloudflare dashboard, go to the **R2 object storage** page.

     [Go to **Overview**](https://dash.cloudflare.com/?to=/:account/r2/overview)

  2. Select the bucket: `fraud-pipeline`.

  3. Switch to the **Settings** tab, scroll down to **R2 Data Catalog**, and select **Enable**.

  4. Once enabled, note the **Catalog URI** and **Warehouse name**.

Note

Copy the `warehouse` (ACCOUNTID\_BUCKETNAME) and paste it in the `export` below. We will use it later in the tutorial.

```bash
export WAREHOUSE= #Paste your warehouse here
```

### (Optional) Enable compaction on your R2 Data Catalog

R2 Data Catalog can automatically compact tables for you. In production event streaming use cases, it is common to end up with many small files, so it is recommended to enable compaction. Since the tutorial only demonstrates a sample use case, this step is optional.

* Wrangler CLI

  ```bash
  npx wrangler r2 bucket catalog compaction enable fraud-pipeline --token $WRANGLER_R2_SQL_AUTH_TOKEN
  ```

* Dashboard

  1. In the Cloudflare dashboard, go to the **R2 object storage** page.

     [Go to **Overview**](https://dash.cloudflare.com/?to=/:account/r2/overview)

  2. Select the bucket: `fraud-pipeline`.

  3. Switch to the **Settings** tab, scroll down to **R2 Data Catalog**, click on edit icon, and select **Enable**.

  4. You can choose a target file size or leave the default. Click save.

## 3. Set up the pipeline infrastructure

### 3.1. Create the Pipeline stream

* Wrangler CLI

  First, create a schema file called `raw_transactions_schema.json` with the following `json` schema:

  ```json
  {
    "fields": [
      { "name": "transaction_id", "type": "string", "required": true },
      { "name": "user_id", "type": "int64", "required": true },
      { "name": "amount", "type": "float64", "required": false },
      { "name": "transaction_timestamp", "type": "string", "required": false },
      { "name": "location", "type": "string", "required": false },
      { "name": "merchant_category", "type": "string", "required": false },
      { "name": "is_fraud", "type": "bool", "required": false }
    ]
  }
  ```

  Create a stream to receive incoming fraud detection events:

  ```bash
  npx wrangler pipelines streams create raw_events_stream \
    --schema-file raw_transactions_schema.json \
    --http-enabled true \
    --http-auth false
  ```

  Note

  Note the **HTTP Ingest Endpoint URL** from the output. This is the endpoint you will use to send data to your pipeline.

  ```bash
  # The http ingest endpoint from the output (see example below)
  export STREAM_ENDPOINT= #the http ingest endpoint from the output (see example below)
  ```

  The output should look like this:

  ```sh
  🌀 Creating stream 'raw_events_stream'...
  ✨ Successfully created stream 'raw_events_stream' with id 'stream_id'.


  Creation Summary:
  General:
    Name:  raw_events_stream


  HTTP Ingest:
    Enabled:         Yes
    Authentication:  Yes
    Endpoint:        https://stream_id.ingest.cloudflare.com
    CORS Origins:    None


  Input Schema:
  ┌───────────────────────┬────────┬────────────┬──────────┐
  │ Field Name            │ Type   │ Unit/Items │ Required │
  ├───────────────────────┼────────┼────────────┼──────────┤
  │ transaction_id        │ string │            │ Yes      │
  ├───────────────────────┼────────┼────────────┼──────────┤
  │ user_id               │ int64  │            │ Yes      │
  ├───────────────────────┼────────┼────────────┼──────────┤
  │ amount                │float64 │            │ No       │
  ├───────────────────────┼────────┼────────────┼──────────┤
  │ transaction_timestamp │ string │            │ No       │
  ├───────────────────────┼────────┼────────────┼──────────┤
  │ location              │ string │            │ No       │
  ├───────────────────────┼────────┼────────────┼──────────┤
  │ merchant_category     │ string │            │ No       │
  ├───────────────────────┼────────┼────────────┼──────────┤
  │ is_fraud              │ bool   │            │ No       │
  └───────────────────────┴────────┴────────────┴──────────┘
  ```

  ### 3.2. Create the data sink

  Create a sink that writes data to your R2 bucket as Apache Iceberg tables:

  ```bash
  npx wrangler pipelines sinks create raw_events_sink \
    --type "r2-data-catalog" \
    --bucket "fraud-pipeline" \
    --roll-interval 30 \
    --namespace "fraud_detection" \
    --table "transactions" \
    --catalog-token $WRANGLER_R2_SQL_AUTH_TOKEN
  ```

  Note

  This creates a `sink` configuration that will write to the Iceberg table `fraud_detection.transactions` in your R2 Data Catalog every 30 seconds. Pipelines automatically appends an `__ingest_ts` column that is used to partition the table by `DAY`.

  ### 3.3. Create the pipeline

  Connect your stream to your sink with SQL:

  ```bash
  npx wrangler pipelines create raw_events_pipeline \
    --sql "INSERT INTO raw_events_sink SELECT * FROM raw_events_stream"
  ```

* Dashboard

  1. In the Cloudflare dashboard, go to **Pipelines** > **Pipelines**.

     [Go to **Pipelines**](https://dash.cloudflare.com/?to=/:account/pipelines/overview)

  2. Select **Create Pipeline**.

  3. **Connect to a Stream**:

     * Pipeline name: `raw_events`
     * Enable HTTP endpoint for sending data: Enabled
     * HTTP authentication: Disabled (default)
     * Select **Next**

  4. **Define Input Schema**:

     * Select **JSON editor**

     * Copy in the schema:

       ```json
       {
         "fields": [
           { "name": "transaction_id", "type": "string", "required": true },
           { "name": "user_id", "type": "int64", "required": true },
           { "name": "amount", "type": "float64", "required": false },
           {
             "name": "transaction_timestamp",
             "type": "string",
             "required": false
           },
           { "name": "location", "type": "string", "required": false },
           { "name": "merchant_category", "type": "string", "required": false },
           { "name": "is_fraud", "type": "bool", "required": false }
         ]
       }
       ```

     * Select **Next**

  5. **Define Sink**:

     * Select your R2 bucket: `fraud-pipeline`
     * Storage type: **R2 Data Catalog**
     * Namespace: `fraud_detection`
     * Table name: `transactions`
     * **Advanced Settings**: Change **Maximum Time Interval** to `30 seconds`
     * Select **Next**

  6. **Credentials**:

     * Disable **Automatically create an Account API token for your sink**
     * Enter **Catalog Token** from step 1
     * Select **Next**

  7. **Pipeline Definition**:

     * Leave the default SQL query:

       ```sql
       INSERT INTO raw_events_sink SELECT * FROM raw_events_stream;
       ```

     * Select **Create Pipeline**

  8. After pipeline creation, note the **Stream ID** for the next step.

## 4. Generate sample fraud detection data

Create a Python script to generate realistic transaction data with fraud patterns:

```python
import requests
import json
import uuid
import random
import time
import os
from datetime import datetime, timezone, timedelta


# Configuration - exported from the prior steps
STREAM_ENDPOINT = os.environ["STREAM_ENDPOINT"]# From the stream you created
API_TOKEN = os.environ["WRANGLER_R2_SQL_AUTH_TOKEN"] #the same one created earlier
EVENTS_TO_SEND = 1000 # Feel free to adjust this


def generate_transaction():
    """Generate some random transactions with occasional fraud"""


    # User IDs
    high_risk_users = [1001, 1002, 1003, 1004, 1005]
    normal_users = list(range(1006, 2000))


    user_id = random.choice(high_risk_users + normal_users)
    is_high_risk_user = user_id in high_risk_users


    # Generate amounts
    if random.random() < 0.05:
        amount = round(random.uniform(5000, 50000), 2)
    elif random.random() < 0.03:
        amount = round(random.uniform(0.01, 1.00), 2)
    else:
        amount = round(random.uniform(10, 500), 2)


    # Locations
    normal_locations = ["NEW_YORK", "LOS_ANGELES", "CHICAGO", "MIAMI", "SEATTLE", "SAN FRANCISCO"]
    high_risk_locations = ["UNKNOWN_LOCATION", "VPN_EXIT", "MARS", "BAT_CAVE"]


    if is_high_risk_user and random.random() < 0.3:
        location = random.choice(high_risk_locations)
    else:
        location = random.choice(normal_locations)


    # Merchant categories
    normal_merchants = ["GROCERY", "GAS_STATION", "RESTAURANT", "RETAIL"]
    high_risk_merchants = ["GAMBLING", "CRYPTO", "MONEY_TRANSFER", "GIFT_CARDS"]


    if random.random() < 0.1:  # 10% high-risk merchants
        merchant_category = random.choice(high_risk_merchants)
    else:
        merchant_category = random.choice(normal_merchants)


    # Series of checks to either increase fraud score by a certain margin
    fraud_score = 0
    if amount > 2000: fraud_score += 0.4
    if amount < 1: fraud_score += 0.3
    if location in high_risk_locations: fraud_score += 0.5
    if merchant_category in high_risk_merchants: fraud_score += 0.3
    if is_high_risk_user: fraud_score += 0.2


    # Compare the fraud scores
    is_fraud = random.random() < min(fraud_score * 0.3, 0.8)


    # Generate timestamps (some fraud happens at unusual hours)
    base_time = datetime.now(timezone.utc)
    if is_fraud and random.random() < 0.4:  # 40% of fraud at night
        hour = random.randint(0, 5)  # Late night/early morning
        transaction_time = base_time.replace(hour=hour)
    else:
        transaction_time = base_time - timedelta(
            hours=random.randint(0, 168)  # Last week
        )


    return {
        "transaction_id": str(uuid.uuid4()),
        "user_id": user_id,
        "amount": amount,
        "transaction_timestamp": transaction_time.isoformat(),
        "location": location,
        "merchant_category": merchant_category,
        "is_fraud": True if is_fraud else False
    }


def send_batch_to_stream(events, batch_size=100):
    """Send events to Cloudflare Stream in batches"""


    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json"
    }


    total_sent = 0
    fraud_count = 0


    for i in range(0, len(events), batch_size):
        batch = events[i:i + batch_size]
        fraud_in_batch = sum(1 for event in batch if event["is_fraud"] == True)


        try:
            response = requests.post(STREAM_ENDPOINT, headers=headers, json=batch)


            if response.status_code in [200, 201]:
                total_sent += len(batch)
                fraud_count += fraud_in_batch
                print(f"Sent batch of {len(batch)} events (Total: {total_sent})")
            else:
                print(f"Failed to send batch: {response.status_code} - {response.text}")


        except Exception as e:
            print(f"Error sending batch: {e}")


        time.sleep(0.1)


    return total_sent, fraud_count


def main():
    print("Generating fraud detection data...")


    # Generate events
    events = []
    for i in range(EVENTS_TO_SEND):
        events.append(generate_transaction())
        if (i + 1) % 100 == 0:
            print(f"Generated {i + 1} events...")


    fraud_events = sum(1 for event in events if event["is_fraud"] == True)
    print(f"📊 Generated {len(events)} total events ({fraud_events} fraud, {fraud_events/len(events)*100:.1f}%)")


    # Send to stream
    print("Sending data to Pipeline stream...")
    sent, fraud_sent = send_batch_to_stream(events)


    print(f"\nComplete!")
    print(f"   Events sent: {sent:,}")
    print(f"   Fraud events: {fraud_sent:,} ({fraud_sent/sent*100:.1f}%)")
    print(f"   Data is now flowing through your pipeline!")


if __name__ == "__main__":
    main()
```

Install the required Python dependency and run the script:

```bash
pip install requests
python fraud_data_generator.py
```

## 5. Query the data with R2 SQL

Now you can analyze your fraud detection data using R2 SQL. Here are some example queries:

### 5.1. View recent transactions

```bash
npx wrangler r2 sql query "$WAREHOUSE" "
SELECT
    transaction_id,
    user_id,
    amount,
    location,
    merchant_category,
    is_fraud,
    transaction_timestamp
FROM fraud_detection.transactions
WHERE __ingest_ts > '2025-09-24T01:00:00Z'
AND is_fraud = true
LIMIT 10"
```

### 5.2. Filter the raw transactions into a new table to highlight high-value transactions

Create a new sink that will write the filtered data to a new Apache Iceberg table in R2 Data Catalog:

```bash
npx wrangler pipelines sinks create fraud_filter_sink \
  --type "r2-data-catalog" \
  --bucket "fraud-pipeline" \
  --roll-interval 30 \
  --namespace "fraud_detection" \
  --table "fraud_transactions" \
  --catalog-token $WRANGLER_R2_SQL_AUTH_TOKEN
```

Now you will create a new SQL query to process data from the original `raw_events_stream` stream and only write flagged transactions that are over the `amount` of 1,000.

```bash
npx wrangler pipelines create fraud_events_pipeline \
  --sql "INSERT INTO fraud_filter_sink SELECT * FROM raw_events_stream WHERE is_fraud=true and amount > 1000"
```

Note

It may take a few minutes for the new Pipeline to fully Initialize and start processing the data. Also keep in mind the 30 second `roll-interval`.

Query the table and check the results:

```bash
npx wrangler r2 sql query "$WAREHOUSE" "
SELECT
    transaction_id,
    user_id,
    amount,
    location,
    merchant_category,
    is_fraud,
    transaction_timestamp
FROM fraud_detection.fraud_transactions
LIMIT 10"
```

Also verify that the non-fraudulent events are being filtered out:

```bash
npx wrangler r2 sql query "$WAREHOUSE" "
SELECT
    transaction_id,
    user_id,
    amount,
    location,
    merchant_category,
    is_fraud,
    transaction_timestamp
FROM fraud_detection.fraud_transactions
WHERE is_fraud = false
LIMIT 10"
```

You should see the following output:

```text
Query executed successfully with no results
```

## Conclusion

You have successfully built an end to end data pipeline using Cloudflare's data platform. Through this tutorial, you hve learned to:

1. **Use R2 Data Catalog**: Leveraged Apache Iceberg tables for efficient data storage
2. **Set up Cloudflare Pipelines**: Created streams, sinks, and pipelines for data ingestion
3. **Generated sample data**: Created transaction data with some basic fraud patterns
4. **Query your tables with R2 SQL**: Access raw and processed data tables stored in R2 Data Catalog

</page>
