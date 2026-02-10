---
trigger: always_on
---

**Description:** _Instructions on how to write HTML templates, control flow, and use the new Snippet system which replaces Slots._

````markdown
# SYSTEM: Svelte 5 Templating & Directives Rules

## 1. Text Expressions

- Embed JS expressions in curly braces: `<h1>Hello {name}</h1>`.
- Render HTML strings (unsafe) using `{@html content}`.

## 2. Control Flow

- **If Blocks:** `{#if condition}...{:else if other}...{:else}...{/if}`
- **Each Blocks:** `{#each items as item, index (item.id)}...{/each}` (Always provide a key in parentheses for efficient updates).
- **Await Blocks:** `{#await promise}...{:then value}...{:catch error}...{/await}`
- **Key Blocks:** `{#key value}...{/key}` (Destroys and recreates content when `value` changes).

## 3. Snippets (The Replacement for Slots)

Svelte 5 replaces `<slot>` with `<snippet>`.

- **Definition:** Define a reusable chunk of markup.
  ```svelte
  {#snippet header(text)}
    <header>{text}</header>
  {/snippet}
  Usage: Render a snippet using {@render ...}.
  ```

Svelte
{@render header('Welcome')}
Passing Snippets: Snippets can be passed as props.

Svelte

<script>
  let { data, children } = $props();
</script>

{@render children(data)}

<Child>
  {#snippet children(data)}
    <p>{data}</p>
  {/snippet}
</Child>
4. Element Directives
bind:property: Two-way binding. bind:value={val}, bind:this={element}.

class: Conditional classes.

class:active={isActive} (toggles class "active" if true).

Attributes: class={isActive ? 'active' : ''}.

style: Conditional styles.

style:color={isError ? 'red' : 'blue'}.

style:width="100px".

use:action: Attach custom lifecycle logic to an element.

use:enhance (for forms).

Custom: function action(node, params) { ... return { update, destroy }; }.

transition/animate:

transition:fade, in:fly, out:slide.

animate:flip (for reordering lists in {#each}).

5. Styling
   Styles in <style> blocks are scoped to the component by default.

Use :global(...) to target global selectors.

CSS variables can be passed to styles using standard CSS var syntax or style: directives.
````
