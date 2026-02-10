---
trigger: always_on
---

# SYSTEM: Svelte 5 & Happy-DOM Interaction Rules

Rules for handling events and DOM interactions within the happy-dom environment, establishing it as the standard for testing and simulation.

## 1. Environment Standard

The execution environment is **Happy-DOM**.

- **Standard:** All DOM interactions must be compatible with `happy-dom`'s implementation of the Web Standards.
- **Global:** `window`, `document`, and `HTMLElement` are available globally.
- **Rendering:** Components are mounted into the `happy-dom` document `body` or a specific container using Svelte 5's `mount` function.

## 2. Event Syntax & Triggering

Svelte 5 uses standard HTML attributes. In `happy-dom`, events are triggered programmatically via standard DOM APIs.

- **Syntax:** Use `onclick`, `oninput`, `onsubmit` in templates.

```svelte
<button onclick={() => count++}>Click</button>
```

- **Triggering Events (Test/Script):** Do not use legacy test helpers. Use native DOM methods to simulate user actions.

```javascript
// Correct way to trigger in happy-dom
const btn = document.querySelector("button");
btn.click(); // For click events

// For other events (input, change, etc.)
btn.dispatchEvent(new Event("input", { bubbles: true }));
```

- **Async Updates:** While happy-dom is synchronous, Svelte's reactivity system handles updates in microtasks. Always `await tick()` from svelte after triggering an event to ensure the DOM has updated before asserting.

## 3. Event Modifiers & Propagation

happy-dom respects standard event propagation (capturing/bubbling).

- **Modifiers:** Svelte 5 requires manual handling inside the handler (no `|preventDefault`).

```svelte
<form onsubmit={(e) => { e.preventDefault(); }}>
```

- **Validation:** To verify `preventDefault` was called in happy-dom:

```javascript
const event = new Event("submit", { cancelable: true });
form.dispatchEvent(event);
console.assert(event.defaultPrevented === true);
```

## 4. Component Communication (Props vs Events)

`createEventDispatcher` is deprecated. Interactivity in happy-dom is verified by passing mock functions (spies) as props.

**Component Definition:**

```svelte
<script>
  let { onsave } = $props();
</script>

<button onclick={() => onsave({ id: 1 })}>Save</button>
```

**Interaction Test:**

```javascript
let called = false;
const onsave = (data) => {
  called = true;
  console.log(data);
};

// Mount with the spy function
mount(Component, { target: document.body, props: { onsave } });

document.querySelector("button").click();
// Assert 'called' is true
```

## 5. DOM References & Assertions

Access elements directly using `bind:this` inside the component, or standard `querySelector` from the test script.

**Direct Access (Script):**

```javascript
const input = document.querySelector("input#username");
console.log(input.value); // Read directly from happy-dom node
```

**Snapshotting:** happy-dom serializes cleanly.

```javascript
console.log(document.body.innerHTML); // Get the rendered HTML string
```

## 6. Lifecycle & Unmounting

- **Mounting:** Use `mount` from `svelte`.
- **Cleanup:** Explicitly unmount components to clean up the happy-dom document between tests/runs to prevent state leakage.

```javascript
import { mount, unmount } from "svelte";

const component = mount(App, { target: document.body });
// ... perform actions ...
unmount(component);
document.body.innerHTML = ""; // Reset happy-dom
```
