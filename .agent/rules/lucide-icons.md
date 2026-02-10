---
trigger: always_on
description: Lucide Icons for Svelte 5. Use @lucide/svelte, not lucide-svelte. Includes deprecated icon mapping.
---

# Lucide + Svelte 5 Standard

## Import Pattern

```svelte
import {IconName} from "@lucide/svelte";
```

**NEVER** use `lucide-svelte` - it is deprecated.

## MANDATORY: PROPER IMPORT NAMING

- You will follow this guide to ensure you use the correct imports

### USE THESE IMPORT NAMES

| ❌ Deprecated | ✅ Use Instead |
| ------------- | -------------- |
| Edit          | Pencil         |
| Edit2         | PenLine        |
| Edit3         | Pen            |
| Trash         | Trash2         |
| Close         | X              |
| Add           | Plus           |
| Remove        | Minus          |
| Check         | Check          |
| Settings      | Settings       |
| Home          | House          |
| User          | User           |
| Mail          | Mail           |
| Phone         | Phone          |
| Calendar      | Calendar       |
| Search        | Search         |
| Menu          | Menu           |
| ChevronLeft   | ChevronLeft    |
| ChevronRight  | ChevronRight   |
| ArrowLeft     | ArrowLeft      |
| ArrowRight    | ArrowRight     |
| Plus          | Plus           |
| Minus         | Minus          |
| X             | X              |
| ExternalLink  | ExternalLink   |
| Link          | Link2          |
| Copy          | Copy           |
| Download      | Download       |
| Upload        | Upload         |
| Refresh       | RefreshCw      |
| Loading       | LoaderCircle   |
| Eye           | Eye            |
| EyeOff        | EyeOff         |
| Lock          | Lock           |
| Unlock        | LockOpen       |
| Star          | Star           |
| Heart         | Heart          |
| Bell          | Bell           |
| Info          | Info           |
| AlertTriangle | TriangleAlert  |
| AlertCircle   | CircleAlert    |
| CheckCircle   | CircleCheck    |
| XCircle       | CircleX        |
| LoaderCircle  | LoaderCircle   |

## Component Usage

```svelte
<script>
  import { Pencil, Trash2, Plus } from "@lucide/svelte";
</script>

<button><Pencil class="size-4" /> Edit</button>
```

## Size Classes

Use Tailwind: `size-3`, `size-4`, `size-5`, `size-6`
