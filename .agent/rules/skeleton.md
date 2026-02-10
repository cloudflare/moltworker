---
trigger: always_on
---

# Skeleton v4 + Svelte 5 Coding Standards

1. **Knowledge Source:**
   - **CRITICAL:** Before generating component code, ALWAYS reference the latest API documentation at: `https://skeleton.dev/llms-svelte.txt`.
   - Do not guess prop names; v4 APIs differ significantly from v2/v3.

2. **Tech Stack Constraints:**
   - **Framework:** Svelte 5 ONLY. Use Runes (`$state`, `$derived`, `$effect`, `$props`) for all reactivity.
   - **Library:** Skeleton v4 (`@skeletonlabs/skeleton-svelte`).
   - **Styling:** Tailwind CSS v4. Use CSS-native configuration. **Avoid `@apply`**.

3. **Component Architecture (v4):**
   - **Headless:** Components are built on Zag.js. They are composable, not monolithic.
   - **Pattern:** Use Root + Parts.
     - _BAD:_ `<Avatar src="..." />`
     - _GOOD:_ `<Avatar><Avatar.Image src="..." /><Avatar.Fallback>SK</Avatar.Fallback></Avatar>`
   - **Naming Shifts:**
     - `Modal` → `Dialog`
     - `AppRail` → `Navigation`
     - `Toast` → `Toast.Group`
     - `ProgressRadial` → `Progress` (Circular)
     - `SlideToggle` → `Switch`

4. **Styling & Theming:**
   - **Presets:** Use `preset-filled`, `preset-tonal`, `preset-outlined` for standard elements.
   - **Color Pairing:** Use balanced pairings for Light/Dark mode (e.g., `bg-surface-50-950`, `text-primary-500`).
   - **Spacing:** Use Tailwind v4 dynamic spacing (e.g., `p-4`, `gap-2`).
   - **Layouts:** Do NOT use `AppShell`. Use semantic HTML (`<main>`, `<aside>`, `<header>`) with Tailwind Grid/Flexbox.

5. **Implementation Details:**
   - **Imports:** Always import from `@skeletonlabs/skeleton-svelte`.
   - **Icons:** Use `@lucide/svelte` (see `.agent/rules/lucide-icons.md` for import mapping).
   - **Forms:** Use Tailwind Forms plugin styles (`.input`, `.select`, `.checkbox`).
   - **Providers:** Use the Provider Pattern for complex state access (e.g., `Tooltip.Provider`).

6. **Migration Guardrails (Avoid v2/v3 patterns):**
   - NO `slot="name"`. Use Svelte 5 snippets (`{#snippet name()}`).
   - NO `export let`. Use `$props()`.
   - NO `stores`. Use `$state()` or `$state.raw()`.
