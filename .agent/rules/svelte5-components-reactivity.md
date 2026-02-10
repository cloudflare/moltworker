---
trigger: always_on
---

## Description: Core instructions on how to write Svelte 5 components using the new Runes syntax. This replaces the old Svelte 4 reactivity model.

# SYSTEM: Svelte 5 Component & Reactivity Rules

## 1. File Structure (.svelte)

Components are written in `.svelte` files consisting of three optional sections:

- `<script>`: JavaScript/TypeScript logic. Contains component instantiation logic.
- `<script module>`: Module-level logic that runs once per module, not per instance.
- `<template>` (implicit): HTML markup with Svelte syntax.
- `<style>`: CSS scoped to the component.

## 2. The Reactivity Model: Runes

Svelte 5 uses "Runes" (compiler macros starting with `$`) to define reactivity. Do not use Svelte 4 syntax (`let` exports, `$:`) for new code.

### $state

Creates reactive state.

- **Syntax:** `let count = $state(0);`
- **Behavior:** Reassigning the variable triggers updates (`count += 1`).
- **Deep Reactivity:** Objects and arrays wrapped in `$state` are deeply reactive proxies. Mutating a property (`obj.x = 1`) or pushing to an array (`arr.push(1)`) triggers updates.
- **Classes:** You can use `$state` in class fields to create reactive classes.
- **Raw State:** Use `$state.raw(obj)` for non-proxy state that only updates on reassignment (good for large immutable data).

### $derived

Creates derived state that automatically recalculates when dependencies change.

- **Syntax:** `let double = $derived(count * 2);`
- **Behavior:** Lazy evaluation. It only recalculates when read and dependencies have changed.
- **Complex Logic:** Use `$derived.by(() => { ... })` for complex calculations requiring a function body.

### $effect

Runs side effects when reactive state changes. Replacement for `onMount` and `$:`.

- **Syntax:** `$effect(() => { console.log(count); });`
- **Timing:** Runs after the DOM has been updated.
- **Cleanup:** Return a function to handle cleanup (e.g., clearing intervals).
  ```javascript
  $effect(() => {
    const interval = setInterval(...)
    return () => clearInterval(interval);
  });
  ```

$effect.pre: Runs before the DOM updates.

$props
Declares inputs (props) passed to the component. Replaces export let.

Syntax: let { title, count = 0 } = $props();

Rest Props: let { title, ...rest } = $props();

Note: Props are read-only. To mutate a prop, the parent must pass a "bindable" prop or a setter function, or you must wrap it in local state.

3. Passing State
   State is passed by value: Passing a raw $state variable to a function passes its current value, not the reactive reference.

Passing Reactivity: To allow a function to read current state, pass a getter function: () => count.

Classes: Since class properties with $state are getters/setters, passing the class instance preserves reactivity.

4. Snapshotting
   Use $state.snapshot(proxy) to get a plain, non-reactive copy of a state object (useful for console.log or sending data to external non-reactive libraries).
