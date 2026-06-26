# GEMINI.md — Antigravity AI Rules for This Repository

These rules govern how the AI assistant behaves in this workspace to keep the codebase clean, focused, and token-efficient.

---

## 1. File & Folder Discipline

- **Do NOT create files or folders that were not explicitly requested** by the user.
- **Do NOT scaffold boilerplate directories** (e.g., `shared/`, `core/`, `utils/`) unless the user asks for them.
- When adding a new component or page, place it **exactly** where it logically belongs based on the existing file structure — do not invent new nesting levels.
- **Never create placeholder/stub files** (e.g., empty `index.ts` barrel files, empty `README.md` files per folder) unless asked.
- Prefer **editing existing files** over creating new ones when the change logically belongs to an existing file.

---

## 2. Code Quality Rules

- **HTML templates only** unless TypeScript logic is explicitly requested.
- **No inline styles** — use Tailwind utility classes exclusively.
- **No unused imports** — only import what is actually used in the file.
- **No commented-out code** — remove dead code instead of commenting it out.
- Keep Angular components **focused and minimal** — one responsibility per component.
- Dark mode: always use Tailwind's `dark:` variant classes. Dark mode is controlled by the `dark` class on `<html>`.

---

## 3. Token Efficiency Rules

- **Read only what you need.** Before reading a file, check if the information can be inferred from the directory listing or a prior read in the same session.
- **Avoid re-reading files** you have already read in the current conversation turn.
- **Do not read `node_modules`**, lock files (`package-lock.json`), or generated files (`.angular/` cache) unless there is a specific, stated reason.
- When searching, use **targeted `grep_search`** with specific queries instead of reading entire files.
- **Do not list deeply nested directories** unless the task requires it (e.g., never list `node_modules/`).
- When making edits, use `multi_replace_file_content` for multiple non-contiguous changes in one file — never rewrite the whole file unless it is a new file or a total replacement is genuinely needed.

---

## 4. Planning & Communication Rules

- **Do not create an implementation plan** for simple, clearly-scoped tasks (single file edits, style fixes, adding one component).
- **Do not ask clarifying questions** for trivial requests — make a reasonable interpretation and execute.
- **Summarise changes concisely** — one or two sentences per file changed. Do not list every Tailwind class used.
- **Do not re-summarise** the content of an artifact or README after creating it — just point to it.

---

## 5. UI/UX Rules (manager-ui specific)

- All new UI must support **both light and dark mode** using Tailwind `dark:` variants.
- Use the **Inter** font (loaded via Google Fonts in `index.html`).
- Follow the design tokens defined in `manager-ui/README.md` (colours, spacing, radius).
- Accent/brand colour: **violet** (`violet-600` light / `violet-400` dark).
- Do not introduce new colour palettes without user approval.
- **No placeholder lorem ipsum text** in UI — use realistic project management content.

---

## 6. Angular-Specific Rules

- Use **standalone components** (Angular 17+ style) — no NgModules.
- Use **`@for` and `@if`** control flow syntax (Angular 17+ templates) — not `*ngFor`/`*ngIf`.
- Route configuration lives in `app.routes.ts` — do not scatter routes elsewhere.
- Tailwind v4 is already configured via `@import 'tailwindcss'` in `styles.css` — do not add a `tailwind.config.js` file.

---

## 7. What NOT to Do

- ❌ Do not run `npm install` for new packages without user approval.
- ❌ Do not run build commands unless explicitly asked or validating correctness.
- ❌ Do not create `.env` files or config files that expose secrets.
- ❌ Do not create test files unless explicitly asked.
- ❌ Do not add CI/CD config (GitHub Actions, Dockerfiles, etc.) unless asked.
