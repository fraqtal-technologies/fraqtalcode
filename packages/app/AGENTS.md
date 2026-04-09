## Debugging

- NEVER try to restart the app, or the server process, EVER.

## Local Dev

- **`packages/ui` (e.g. `logo.tsx`) is only picked up when Vite builds the app** (`packages/app`, or desktop `tauri dev`, or `bun dev:web` from repo root). Hot reload applies there.
- **`opencode serve` / `opencode web` / root `bun dev`** (OpenCode server) usually serves the web UI from **`https://app.opencode.ai`** or from an **embedded bundle** produced at release build—not your working tree. Edits under `packages/ui` will **not** show in that browser session until you ship a new embedded UI build or use local Vite below.
- To verify branding and components locally, run backend + app Vite separately:
  - Backend (from `packages/opencode`): `bun run --conditions=browser ./src/index.ts serve --port 4096`
  - App (from `packages/app`): `bun dev` (default Vite port is in `vite.config.ts`, often `3000`; override with `-- --port <port>`)
  - Open that localhost URL with the API at `http://localhost:4096` (configure as your environment expects).

## SolidJS

- Always prefer `createStore` over multiple `createSignal` calls

## Tool Calling

- ALWAYS USE PARALLEL TOOLS WHEN APPLICABLE.

## Browser Automation

Use `agent-browser` for web automation. Run `agent-browser --help` for all commands.

Core workflow:

1. `agent-browser open <url>` - Navigate to page
2. `agent-browser snapshot -i` - Get interactive elements with refs (@e1, @e2)
3. `agent-browser click @e1` / `fill @e2 "text"` - Interact using refs
4. Re-snapshot after page changes
