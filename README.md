# The Office — a 3D interactive world in a browser tab

An RPG-style demo: walk a character around a low-poly office with WASD, walk up to
the people in it, and a plain React panel opens — a chat with that character, or a
dashboard at the terminal by the north wall.

The point of the architecture is that **the panels have no idea they are in a 3D
scene**. `ChatPanel` and `DashboardPanel` are ordinary React components rendered as
DOM on top of the canvas. The only thing the 3D world and the UI share is a Zustand
store.

## Running it

```bash
npm install
bash scripts/fetch-assets.sh   # downloads the CC0 models into public/models/
npm run dev
```

Then open http://localhost:3000.

`fetch-assets.sh` is idempotent and must be run once before the first `npm run dev`
— the models are not checked into the repo. Append `?debug` to the URL to draw
Rapier's colliders and trigger volumes.

**Controls:** WASD move · Shift run · Space jump · drag to look · **E** interact ·
**Esc** close.

## How the interaction works

Each NPC and the kiosk is an `Interactable`: a fixed rigid body with a solid
collider you bump into, wrapped in a larger **sensor** collider. Rapier fires
`onIntersectionEnter` / `onIntersectionExit` when the player's body crosses it, so
there is no per-frame distance maths anywhere in the scene.

```
Rapier sensor  →  useGame (Zustand)  →  UILayer  →  ChatPanel / DashboardPanel
```

Two details that are easy to get wrong:

- **The sensor must be filtered to the player.** A sensor reports *every*
  intersection, floor included. The player's rigid body is named `player` and the
  handlers check `other.rigidBodyObject?.name`.
- **`leave` is id-guarded.** Trigger volumes overlap, so walking from one NPC
  straight to the next fires the old NPC's exit *after* the new one's enter.
  Clearing unconditionally would swallow the target you just reached.

When a panel opens, the same store flag switches the controller off
(`<Ecctrl enable={false}>`), zeroes the movement input, and freezes the camera —
otherwise WASD walks the character away while you are reading, and dragging inside
the panel spins the world behind it.

## Notes on ecctrl v2

`ecctrl` 2.0.0 is a rewrite, and essentially every tutorial and blog post online
describes v1. The differences that matter here:

| v1 | v2 |
| --- | --- |
| `<Ecctrl disableControl>` | `<Ecctrl enable={false}>` |
| `<Ecctrl animated>` | `<EcctrlAnimationStateController ecctrl={ref} />` + `useEcctrlAnimationStore` |
| built-in follow camera | none — you drive the camera yourself |
| `export default Ecctrl` | `export { Ecctrl }` (named) |

The big one: **v2 has no keyboard handling at all.** It reads its touch stores and
`handle.setMovement()`, and nothing else — wrapping the scene in drei's
`<KeyboardControls>` does nothing on its own, despite what the Quick Start implies.
`src/components/world/KeyboardInput.tsx` is the missing wire between the two.

Movement is camera-relative: ecctrl derives "forward" from the default camera's
world direction, so `FollowCamera` is the steering input as much as the view.

Physics runs on a **fixed** timestep. With `timeStep="vary"`, any frame stall — and
browsers throttle `requestAnimationFrame` hard in background windows, so alt-tabbing
is enough — hands Rapier one enormous delta and flings the character across the room.

## Layout

```
src/
  app/page.tsx                  renders <GameClient />
  components/
    GameClient.tsx              'use client' — canvas + UI + loading veil
    world/
      WorldCanvas.tsx           <Canvas>, <KeyboardControls>, <Physics>
      Scene.tsx                 lights, office, NPCs, kiosk, player
      Player.tsx                <Ecctrl> + animation + input + camera
      KeyboardInput.tsx         keyboard → handle.setMovement()
      FollowCamera.tsx          third-person orbit camera
      CharacterModel.tsx        player rig + animation cross-fading
      Office.tsx                floor, walls, prop layout
      Prop.tsx                  useGLTF + <Clone> wrapper
      Interactable.tsx          solid body + sensor volume → store
      Npc.tsx / Kiosk.tsx       the things you can walk up to
    ui/
      UILayer.tsx               prompt, key handling, panel routing
      ChatPanel.tsx             canned dialogue
      DashboardPanel.tsx        CSS-only stat bars
  lib/
    useGame.ts                  the store both sides talk to
    npcs.ts                     NPC data and dialogue
```

## Adding an NPC

Add an entry to `NPCS` in `src/lib/npcs.ts` — id, name, a `character-*.glb` from
`public/models/npc/`, a position, and the dialogue. Nothing else needs to change;
`Scene` maps over the array and the store handles the rest.

## Making the NPCs real

The dialogue is canned, and `ChatPanel` is the seam where that changes. Swap the
`pending` lines for a streamed response from a route handler at
`app/api/npc/route.ts` with one persona per character, and nothing else in the scene
has to move. Rate-limit that endpoint before deploying it publicly.

## Assets

All CC0. See `public/models/ATTRIBUTION.md`.

- Player rig and animations — **Universal Animation Library** by Quaternius
- NPCs — **Blocky Characters** by Kenney
- Furniture — **Furniture Kit** by Kenney
