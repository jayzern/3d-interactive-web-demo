# The Office — a 3D interactive world in a browser tab

An RPG-style demo: walk a character around a low-poly office with WASD, approach
the people in it, and a React panel opens — a chat with that character, or a
dashboard at the terminal by the north wall.

The panels have no idea they are in a 3D scene. `ChatPanel` and `DashboardPanel`
are ordinary React components rendered as DOM over the canvas. The only thing the
3D world and the UI share is a Zustand store.

## Running it

```bash
npm install
bash scripts/fetch-assets.sh   # downloads CC0 models into public/models/ (run once)
npm run dev
```

Open http://localhost:3000. The models are not checked in, so `fetch-assets.sh`
must run before the first `npm run dev`. Append `?debug` to the URL to draw
Rapier's colliders and trigger volumes.

**Controls:** WASD move · Shift run · Space jump · drag to look · **E** interact ·
**Esc** close.

## How interaction works

Each NPC and the kiosk is an `Interactable`: a fixed rigid body with a solid
collider, wrapped in a larger **sensor** collider. Rapier fires
`onIntersectionEnter` / `onIntersectionExit` when the player crosses it, so there
is no per-frame distance math.

```
Rapier sensor  →  useGame (Zustand)  →  UILayer  →  ChatPanel / DashboardPanel
```

Two details that are easy to get wrong:

- **Filter the sensor to the player.** A sensor reports *every* intersection,
  floor included. The player's rigid body is named `player`, and the handlers
  check `other.rigidBodyObject?.name`.
- **`leave` is id-guarded.** Trigger volumes overlap, so walking from one NPC
  straight to the next fires the old NPC's exit *after* the new one's enter.
  Clearing unconditionally would swallow the target you just reached.

When a panel opens, the same store flag disables the controller
(`<Ecctrl enable={false}>`), zeroes movement input, and freezes the camera.
Otherwise WASD walks the character away while you read.

## Notes on ecctrl v2

`ecctrl` 2.0.0 is a rewrite, and most online tutorials describe v1:

| v1 | v2 |
| --- | --- |
| `<Ecctrl disableControl>` | `<Ecctrl enable={false}>` |
| `<Ecctrl animated>` | `<EcctrlAnimationStateController ecctrl={ref} />` + `useEcctrlAnimationStore` |
| built-in follow camera | none — you drive the camera yourself |
| `export default Ecctrl` | `export { Ecctrl }` (named) |

- **v2 has no keyboard handling.** It reads touch stores and
  `handle.setMovement()` only. Wrapping the scene in `<KeyboardControls>` does
  nothing on its own, despite what the Quick Start implies.
  `src/components/world/KeyboardInput.tsx` is the missing wire.
- **Movement is camera-relative.** ecctrl derives "forward" from the default
  camera's direction, so `FollowCamera` is the steering input as well as the view.
- **Use a fixed physics timestep.** With `timeStep="vary"`, any frame stall
  (browsers throttle `requestAnimationFrame` hard in background tabs) hands Rapier
  one huge delta and flings the character across the room.

## Layout

```
src/
  app/page.tsx              renders <GameClient />
  components/
    GameClient.tsx          canvas + UI + loading veil
    world/                  WorldCanvas (Canvas/KeyboardControls/Physics), Scene,
                            Player (Ecctrl), KeyboardInput, FollowCamera,
                            CharacterModel, Office, Prop, Interactable, Npc, Kiosk
    ui/                     UILayer (prompt, key handling, panel routing),
                            ChatPanel, DashboardPanel
  lib/
    useGame.ts              the store both sides talk to
    npcs.ts                 NPC data and dialogue
```

## Adding an NPC

Add an entry to `NPCS` in `src/lib/npcs.ts`: id, name, a `character-*.glb` from
`public/models/npc/`, a position, and dialogue. `Scene` maps over the array, so
nothing else changes.

## Making the NPCs real

Dialogue is canned. `ChatPanel` is the seam: swap the `pending` lines for a
streamed response from a route handler (e.g. `app/api/npc/route.ts`) with one
persona per character. Rate-limit that endpoint before deploying publicly.

## Assets

All CC0; see `public/models/ATTRIBUTION.md`.

- Player rig and animations — **Universal Animation Library** by Quaternius
- NPCs — **Blocky Characters** by Kenney
- Furniture — **Furniture Kit** by Kenney
