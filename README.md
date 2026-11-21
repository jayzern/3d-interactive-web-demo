# The Office — a 3D interactive world in a browser tab

An RPG-style demo: walk a character around a low-poly office with WASD, walk up to
the people in it, and a plain React panel opens — a chat with that character, or a
dashboard at the terminal by the north wall.

Built with Next.js, React Three Fiber, Rapier, `ecctrl`, Zustand, and Tailwind.

## Running it

```bash
npm install
bash scripts/fetch-assets.sh   # downloads the CC0 models into public/models/
npm run dev
```

Then open http://localhost:3000. The models are not checked into the repo, so the
fetch script must be run once first. Append `?debug` to the URL to draw Rapier's
colliders and trigger volumes.

**Controls:** WASD move · Shift run · Space jump · drag to look · **E** interact ·
**Esc** close.

## How it works

The panels know nothing about 3D — `ChatPanel` and `DashboardPanel` are ordinary
DOM on top of the canvas. The two sides share a Zustand store (`src/lib/useGame.ts`).
Each NPC and the kiosk is an `Interactable`: a solid body wrapped in a sensor
collider; Rapier intersection events drive the store, and opening a panel disables
the character controller and freezes the camera.

```
Rapier sensor  →  useGame (Zustand)  →  UILayer  →  ChatPanel / DashboardPanel
```

Source layout: `src/components/world/` (3D scene, player, camera, interactables),
`src/components/ui/` (panels and HUD), `src/lib/` (store + NPC data). Add an NPC by
appending to `NPCS` in `src/lib/npcs.ts`.

## Assets

All CC0 — Universal Animation Library (Quaternius), Blocky Characters and Furniture
Kit (Kenney). See `public/models/ATTRIBUTION.md`.
