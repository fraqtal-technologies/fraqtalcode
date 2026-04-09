# Fraqtal desktop branding & model providers

This guide describes the **fraqtalcode** monorepo (your OpenCode fork): where the desktop UI lives, how to rebrand it for Fraqtal, and how **model providers** are configured (server / CLI vs. what the UI shows).

---

## 1. Repository layout (what runs where)


| Package                     | Role                                                                                     |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| `packages/app`              | **Main web UI** — SolidJS + Vite + Tailwind. Shared by desktop shells and `bun dev:web`. |
| `packages/ui`               | **Design system** — shared components, CSS tokens, themes, logo SVGs, Tailwind entry.    |
| `packages/desktop`          | **Tauri 2** desktop shell — loads the built `app` frontend, bundles the CLI sidecar.     |
| `packages/desktop-electron` | **Electron** alternative shell — `electron-vite` + `electron-builder`.                   |
| `packages/opencode`         | **Core server / CLI** — config parsing, provider registry, auth, API the UI talks to.    |


**Useful commands** (from repo root):

- `bun dev:web` — browser UI only (fast iteration on layout/theme).
- `bun dev:desktop` — Tauri dev (full desktop; runs Vite for the desktop package).

The desktop package depends on `@opencode-ai/app` and `@opencode-ai/ui`; most **on-screen** changes are in `app` + `ui`, not in Tauri/Electron glue.

---

## 2. Making UI / branding changes

Think in layers: **native shell** (name, icons, URLs) → **HTML shell** (title, favicons) → **design tokens & themes** → **logo/wordmark** → **copy (i18n)** → **hard-coded links**.

### 2.1 Tauri (`packages/desktop`)

- `**src-tauri/tauri.conf.json`** — `productName`, `identifier`, `mainBinaryName`, `bundle.icon`, deep-link `plugins.deep-link.desktop.schemes` (currently `opencode`).
- `**src-tauri/icons/**` — replace PNG / `.icns` / `.ico` with Fraqtal artwork (match sizes referenced in `tauri.conf.json`).

### 2.2 Electron (`packages/desktop-electron`)

- `**electron-builder.config.ts**` — `protocols` name/schemes, per-OS icons under `resources/icons/`, `artifactName`.
- `**package.json**` — `homepage`, `author` (shown in places like the About flow / metadata).

### 2.3 Web app shell (`packages/app`)

- `**index.html**` — `<title>`, favicon links, `theme-color`, OpenGraph images, `site.webmanifest` (under `public/`).
- `**public/**` — replace `favicon-*.png`, `apple-touch-icon-*.png`, `site.webmanifest`, etc.

### 2.4 Logo and splash

- `**packages/ui/src/components/logo.tsx**` — `Logo`, `Mark`, and `Splash` SVG components (wordmark is inline paths).
- `**packages/ui/src/components/logo.css**` — layout hooks if you adjust sizing.

To rebrand quickly you can swap these components for Fraqtal SVGs while keeping the same exports so imports like `@opencode-ai/ui/logo` keep working.

### 2.5 Global styles and themes

- `**packages/app/src/index.css**` — app-specific CSS; imports `@opencode-ai/ui/styles/tailwind`.
- `**packages/ui/src/styles/**` — Tailwind entry (`tailwind/index.css`), `**theme.css**` (CSS variables for light/dark), component CSS.
- `**packages/ui/src/theme/themes/*.json**` — preset desktop themes; `**default-themes.ts**` registers them.
- `**packages/ui/src/theme/**` — theme resolution, `ThemeProvider`, loading themes from URLs (for custom Fraqtal themes).

For a **Fraqtal default palette**, the maintainable approach is usually: add a new theme JSON + register it in `default-themes.ts`, or adjust the base variables in `theme.css` / `colors.css` if you want a global shift.

### 2.6 Application code: strings and links

Solid pages and layout live under `**packages/app/src/pages/`**. A few high-impact spots:

- `**src/i18n/en.ts**` (and other locales) — keys such as `app.name.desktop`, onboarding copy, settings descriptions. Many visible strings are here rather than hard-coded.
- `**src/entry.tsx**` — desktop notification icon URL (currently an OpenCode CDN image).
- `**src/pages/layout.tsx**` — help / feedback links (e.g. `opencode.ai/desktop-feedback`).
- `**src/pages/layout/sidebar-items.tsx**` — special-case icon URL for the OpenCode “project” entry.

Search the repo for `opencode.ai` and `OpenCode` when hunting remaining marketing strings.

### 2.7 Provider icons in the UI

- `**packages/ui/src/components/provider-icons/**` — icon map for known providers in pickers and settings.

---

## 3. Controlling model providers

Providers are **primarily configured and enforced by the OpenCode server** (`packages/opencode`). The desktop/web UI **lists what the server exposes** (connected accounts, models, defaults). The hook `**packages/app/src/hooks/use-providers.ts`** only adjusts **which providers appear in “popular”** shortcuts — it does not enable or disable backends by itself.

### 3.1 Where configuration lives

**User / global config directory** (see `packages/opencode/src/global/index.ts`):

- App name directory: `**opencode`** under the XDG-style config path (commonly `~/.config/opencode` on Unix).
- Files merged globally (in order): `config.json`, then `opencode.json`, then `opencode.jsonc`.

**Per-project / workspace** (see `packages/opencode/src/config/paths.ts` and `config.ts`):

- Walk upward from the project directory for `**.opencode/opencode.json`** or `**.opencode/opencode.jsonc**`.
- Optional env overrides: `OPENCODE_CONFIG` (single file), `OPENCODE_CONFIG_DIR`, `OPENCODE_DISABLE_PROJECT_CONFIG`, and `OPENCODE_CONFIG_CONTENT` (inline JSON) — useful for CI or embedded deployments.

Merge order is roughly: **global → project `.opencode` layers → flags / managed / account remote config** (see `loadInstanceState` in `packages/opencode/src/config/config.ts`).

Official schema reference is often embedded as `"$schema": "https://opencode.ai/config.json"` in example configs.

### 3.2 Enabling / restricting which providers exist

In `**opencode.json` / `opencode.jsonc`** top-level keys (see `packages/opencode/src/config/config.ts`, `Info` schema):

- `**enabled_providers**` — array of provider IDs. **If set, only these providers are loaded;** everything else is ignored.
- `**disabled_providers`** — array of provider IDs to turn off among auto-loaded providers.

Use `**enabled_providers**` for a **Fraqtal-only** experience (e.g. only your bundled or enterprise provider IDs).

### 3.3 Default and “small” models

Top-level keys:

- `**model`** — default chat model, format `**provider/model**` (e.g. `anthropic/claude-sonnet-4-20250514`).
- `**small_model**` — lighter model for tasks like titles; same `provider/model` format.

### 3.4 Custom providers and model catalogs

Top-level `**provider**` is a map of **provider id → provider config** (same file). Each entry can include:

- `**api`**, `**name**`, `**env**` (environment variables for keys),
- `**options**` (e.g. `apiKey`, `baseURL` for OpenAI-compatible endpoints),
- `**models**` — record of model id → model definition (capabilities, limits, options, etc.).

This is how you wire **custom base URLs**, **OpenAI-compatible** gateways, or **curated model lists** under a single provider id.

### 3.5 Per-agent models

Under `**agent`** (e.g. `agent.build`, `agent.plan`, …), each agent block supports `**model**` and `**variant**` (see `Agent` schema in `config.ts`). Use this when Fraqtal wants different models for plan vs. build vs. title/summary agents.

### 3.6 UI-only: “popular” providers list

`**packages/app/src/hooks/use-providers.ts**` defines `popularProviders` — the order/ids shown as “popular” in the model/provider UI. Align this list with the providers you actually ship in `**enabled_providers**` so the picker matches your product story.

---

## 4. Suggested Fraqtal rebranding checklist

1. **Tauri / Electron** — product name, bundle id, icons, installer strings, URL scheme if you move off `opencode://`.
2. `**packages/app/index.html` + `public/`** — title, favicons, manifest, social images.
3. `**packages/ui/src/components/logo.tsx**` — Fraqtal mark + wordmark.
4. `**packages/app/src/i18n/en.ts**` (and other languages you ship) — `app.name.desktop` and user-facing “OpenCode” strings.
5. **Grep** `opencode.ai` and `OpenCode` under `packages/app` and `packages/ui` — replace support/marketing URLs and notification assets.
6. **Optional** — new theme JSON under `packages/ui/src/theme/themes/` and registration in `default-themes.ts`.
7. **Providers** — ship a default `**~/.config/opencode/opencode.json`** template or document Fraqtal’s recommended `**.opencode/opencode.json**` for teams, with `**enabled_providers**`, `**model**`, and `**provider**` entries as needed.

---

## 5. Reference paths (quick copy-paste)


| Concern                     | Path                                                            |
| --------------------------- | --------------------------------------------------------------- |
| Tauri bundle config         | `packages/desktop/src-tauri/tauri.conf.json`                    |
| Electron builder            | `packages/desktop-electron/electron-builder.config.ts`          |
| App entry + HTML            | `packages/app/index.html`, `packages/app/src/entry.tsx`         |
| Main layout / routes        | `packages/app/src/pages/layout.tsx`, `packages/app/src/app.tsx` |
| English UI strings          | `packages/app/src/i18n/en.ts`                                   |
| Logo                        | `packages/ui/src/components/logo.tsx`                           |
| Theme tokens                | `packages/ui/src/styles/theme.css`                              |
| Theme presets               | `packages/ui/src/theme/themes/*.json`, `default-themes.ts`      |
| Global config dir (runtime) | `Global.Path.config` → `packages/opencode/src/global/index.ts`  |
| Config merge / schema       | `packages/opencode/src/config/config.ts`                        |
| Provider UI ordering        | `packages/app/src/hooks/use-providers.ts`                       |


---

*Generated for the fraqtalcode fork; upstream structure matches anomalyco/opencode-style monorepos. Adjust paths if your fork diverges.*