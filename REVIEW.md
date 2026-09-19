# Philos Project — Code Review Guidelines

This document defines the code review standards for the **Philos** Next.js 16 project. All PRs and code changes must pass these checks before merging.

---

## Project Stack Summary

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.3.2 (App Router) |
| React | 19.2.8 |
| Language | TypeScript 5 (strict mode) |
| Database | PostgreSQL via Prisma 7.9 + Neon adapter |
| Styling | Tailwind CSS 4 |
| Testing | Jest 30 + React Testing Library |
| Linting | ESLint 9 + `eslint-config-next` (core-web-vitals + TypeScript) |
| Analytics | Vercel Analytics + Speed Insights |

---

## 1. Architecture & Component Boundaries

### Component Line Limit
- **Max 300 lines** per component file (`.tsx`).
- Flag any component exceeding 300 lines. Suggest extracting child components into separate files under `app/components/` or colocated with the parent.

### JSX Layout Limit
- **Max ~50 lines** of JSX per `return` block.
- Extract sub-layouts into separate Server or Client Components.

### Server Components Default
- **Default to Server Components**. Only add `'use client'` directive when the component uses:
  - `useState`, `useReducer`, `useRef` (mutable refs)
  - `useEffect`, `useLayoutEffect`
  - Event handlers (`onClick`, `onChange`, etc.)
  - Browser-only APIs (`window`, `localStorage`, etc.)
- Keep data fetching, heavy rendering, and Prisma queries in Server Components.

### Custom Hooks & Helpers
- Extract complex stateful logic into `/hooks/use-*.ts` (e.g., `useDebounce`, `useLocalStorage`).
- Extract pure reusable logic into `/lib/utils.ts` or `/utils/`.

---

## 2. Next.js Optimizations

### Image Handling
- **Ban native `<img>` tags**. Use `next/image` (`<Image />`) with:
  - Explicit `alt` (descriptive, not empty)
  - Explicit `width` & `height` **or** `fill` + parent `relative` sizing
  - `priority` for above-the-fold images
- Current `page.tsx` uses `<Image />` correctly — keep this pattern.

### Navigation
- **Ban native `<a>` for internal routes**. Use `next/link` (`<Link />`) with `href`.
- External links: `<a>` with `target="_blank" rel="noopener noreferrer"` (already done in `page.tsx`).

### Asset Loading
- Fonts: Use `next/font/google` (already done in `layout.tsx` with Geist).
- External scripts: Use `next/script` with `strategy="lazyOnload"` or `"afterInteractive"`.

### Dynamic Imports
- Use `next/dynamic` for heavy client-only modules (charts, editors, large libs).
- Set `ssr: false` when the module has no SSR support.

---

## 3. TypeScript & Data Modeling

### Strict Typing
- **Zero `any`**. `tsconfig.json` has `"strict": true` — enforce it.
- Use `interface` for object shapes, `type` for unions/mapped types.
- Prefer `type` for Prisma-generated types (they're already `type`).

### Type DRY
- No duplicate interfaces. Use `extends`, `Pick`, `Omit`, `Partial`, `Required`.
- Prisma models are the source of truth — import from `@/generated/prisma/client`.

### No Magic Values
- Reject hardcoded strings/numbers used as state values, status codes, or config.
- Define enums or `as const` objects in `/constants/` (create if needed).
- Example:
  ```ts
  // constants/status.ts
  export const TaskStatus = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    DONE: 'done',
  } as const;
  export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];
  ```

---

## 4. Data Fetching & Async Logic

### Service Layer Abstraction
- **No direct `fetch` or Prisma calls in view components**.
- Create `/services/` or `/lib/api/` modules:
  ```ts
  // lib/api/tasks.ts
  export async function getTasks(userId: string) {
    return prisma.task.findMany({ where: { userId, deletedAt: null } });
  }
  ```
- Server Components call service functions directly.
- Client Components use SWR / React Query hooks that call API routes.

### Server Data Fetching
- Use Next.js native `fetch` with explicit cache control:
  ```ts
  fetch(url, { next: { revalidate: 60 } }) // ISR
  fetch(url, { cache: 'no-store' }) // Dynamic
  ```
- Prisma queries in Server Components are uncached by default — add `unstable_cache` if needed.

### Client Data Fetching
- **Enforce SWR or React Query** over raw `useEffect` + `fetch`.
- Install: `npm install swr` or `@tanstack/react-query`.
- Example:
  ```tsx
  import useSWR from 'swr';
  const { data } = useSWR('/api/tasks', fetcher);
  ```

### Async Safety
- All `async` functions **must** have `try/catch` or throw to an Error Boundary.
- API routes: wrap in `try/catch`, return `NextResponse.json({ error }, { status })`.
- Server Components: let errors bubble to nearest `error.tsx`.

### Infinite Loop Guard
- Every `useEffect` / `useCallback` **must** have a correct dependency array.
- Flag missing deps, stale closures, or object/array deps that change every render.
- Use `useMemo` / `useCallback` to stabilize references.

---

## 5. Code Hygiene & React Standards

### No Console Logs
- **Ban `console.log` / `console.debug` / `console.warn`** in committed code.
- Use `debug` npm package or structured logging (Pino) if needed.
- ESLint `no-console` rule should catch this — ensure it's enabled.

### Unique Keys
- All `.map()` iterations **must** use stable unique IDs (`item.id`, not index).
- If list is immutable and has no IDs, add them at the data layer.

### Destructuring
- Destructure props, state, context:
  ```tsx
  // Good
  function Card({ title, children }: CardProps) { ... }
  const { data, isLoading } = useSWR(key);
  
  // Bad
  function Card(props) { const title = props.title; ... }
  ```

### Dead Code
- Flag unused variables, props, imports, types.
- Run `npm run lint` — unused vars are caught by `@typescript-eslint/no-unused-vars`.

### Cleanup Functions
- Every `useEffect` that creates timers, listeners, subscriptions **must** return cleanup:
  ```tsx
  useEffect(() => {
    const id = setInterval(fn, 1000);
    return () => clearInterval(id);
  }, []);
  ```

---

## 6. Security & Accessibility (a11y)

### XSS Prevention
- **Ban `dangerouslySetInnerHTML`** unless:
  1. Content is from trusted source
  2. Sanitized with DOMPurify (add as dependency if needed)
  3. Documented with `// SECURITY: sanitized via DOMPurify`
- Prefer safe React patterns (text nodes, components).

### Accessibility
- All `<Image />` have descriptive `alt` (not `"image"` or empty).
- Forms: `<label htmlFor={id}>` + `<input id={id}>` or `<label><input /></label>`.
- Interactive non-text elements: `aria-label` or `aria-labelledby`.
- Semantic HTML: `<main>`, `<nav>`, `<button>`, `<header>`, `<footer>`.
- Color contrast: Tailwind `text-zinc-600` on `bg-white` passes AA — verify custom colors.

---

## 7. Dependencies & Performance

### Lightweight Dependencies
- Before adding a package, check if native API suffices:
  - Date formatting → `Intl.DateTimeFormat` / `date-fns` (tree-shakable)
  - Class names → `clsx` (tiny) or `tailwind-merge`
  - Validation → `zod` (already common with Prisma)
- Avoid moment.js, lodash (use `es-toolkit` or native).

### Unused Packages
- Run `npm run lint` and check `package.json` on refactor.
- Remove `@vercel/analytics` / `@vercel/speed-insights` if not deploying to Vercel.

---

## 8. Prisma & Database Specifics

### Soft Deletes
- All models **must** include `deletedAt DateTime? @map("deleted_at")`.
- All queries **must** filter `where: { deletedAt: null }`.
- Create a Prisma extension or middleware to auto-apply this filter.

### Connection Management
- `lib/prisma.ts` uses global singleton — correct for serverless.
- Neon adapter is used — good for serverless scaling.

### Migrations
- Run `npm run db:migrate` in dev.
- `npm run db:deploy` in CI/CD (non-interactive).
- Never edit generated migration files.

---

## 9. Testing Standards

### Unit Tests
- Test pure functions in `/lib/`, `/utils/`, `/hooks/`.
- Use Jest + React Testing Library.
- Mock Prisma with `jest.mock('@/lib/prisma')`.

### Integration Tests
- Test API routes with `supertest` or Next.js test helpers.
- Test Server Components with `renderToString` or `next-test-utils`.

### Coverage
- Target **≥80%** on services, hooks, utils.
- Run `npm run test:coverage` in CI.

---

## 10. Review Output Format

When reviewing a PR, structure feedback as:

### 🔴 Critical Violations
- Blocking bugs, security issues, infinite loops, type errors (`any`, missing returns).
- Must fix before merge.

### 🟡 Next.js & React Best Practices
- Server/Client component boundaries, dynamic imports, image/link usage, data fetching patterns.
- Should fix before merge.

### 🟢 Style & Code Hygiene
- Lint warnings, naming, `console.log`, dead code, destructuring.
- Nice to fix; can follow up in separate PR if low risk.

### 💡 Refactored Code Block
- Provide optimized replacement code for critical/best-practice items.
- Show before/after with file path and line numbers.

---

## 11. Project-Specific Conventions

| Convention | Rule |
|------------|------|
| File naming | kebab-case for files (`task-card.tsx`), PascalCase for components (`TaskCard`) |
| Path aliases | `@/*` maps to root (see `tsconfig.json`) |
| Prisma output | `../generated/prisma` (see `schema.prisma`) |
| Env vars | `.env.local` for local, Vercel/Neon dashboard for prod |
| Branch naming | `dev/PHI-<ticket>-<slug>` |
| Commit messages | Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`) |

---

## 12. CI/CD Checklist (pre-merge)

- [ ] `npm run lint` passes
- [ ] `npm run typecheck` (or `tsc --noEmit`) passes
- [ ] `npm run test` passes
- [ ] `npm run build` passes
- [ ] No `console.log` in staged files
- [ ] No `any` types introduced
- [ ] All new components under 300 lines
- [ ] All new `useEffect` have cleanup
- [ ] All images use `next/image`
- [ ] All internal links use `next/link`

---

## 13. Quick Reference Commands

```bash
# Lint
npm run lint

# Type check
npx tsc --noEmit

# Test
npm run test
npm run test:coverage

# Build
npm run build

# DB
npm run db:migrate    # dev
npm run db:deploy     # prod/CI
npm run db:studio     # visual

# Format (if prettier added)
npx prettier --write .
```

---

*Last updated: 2026-09-19 — aligned with Next.js 16, React 19, Prisma 7, Tailwind 4*