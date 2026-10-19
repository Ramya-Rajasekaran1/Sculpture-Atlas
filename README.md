# Sculpture Atlas

An interactive sculpture gallery made from frames of the creator’s source videos. Select a sculpture from the side rail, then inspect it with mouse, touch, or keyboard controls.

## Workspace structure

- `artifacts/sculpture-atlas` — the gallery and its artwork assets
- `artifacts/api-server` — the API and background-audio service
- `artifacts/mockup-sandbox` — isolated component previews
- `lib` — shared workspace packages

The project uses pnpm workspaces. Install dependencies from the repository root with `pnpm install`.

## Run locally

Start the gallery and API server in separate terminals:

```sh
pnpm --filter @workspace/sculpture-atlas run dev
pnpm --filter @workspace/api-server run dev
```

Type-check the gallery with:

```sh
pnpm --filter @workspace/sculpture-atlas run typecheck
```
