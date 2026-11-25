# The Office — a 3D interactive world in a browser tab

An RPG-style demo: walk a character around a low-poly office with WASD, walk up to
the people in it, and a React panel opens — a chat with that character, or a
dashboard at the terminal by the north wall.

The panels have no idea they are in a 3D scene. `ChatPanel` and `DashboardPanel` are
plain React components rendered as DOM over the canvas. The only thing the 3D world
and the UI share is a Zustand store.

## Running it

```bash
npm install
bash scripts/fetch-assets.sh   # downloads CC0 models into public/models/ (run once)
npm run dev
```

Open http://localhost:3000. Append `?debug` to draw Rapier colliders and trigger volumes.

**Controls:** WASD move · Shift run · Space jump · drag to look · **E** interact · **Esc** close.

## How interaction works

Each NPC and the kiosk is an `Interactable`: a solid rigid body wrapped in a larger
**sensor** collider. Rapier fires `onIntersectionEnter` / `onIntersectionExit`, so
there is no per-frame distance math.

```
Rapier sensor  →  useGame (Zustand)  →  UILayer  →  ChatPanel / DashboardPanel
```

Two details that are easy to get wrong:

- **Filter the sensor to the player.** Sensors report *every* intersection, floor
  included. The player's body is named `player`; handlers check `other.rigidBodyObject?.name`.
- **`leave` is id-guarded.** Trigger volumes overlap, so walking from one NPC to the
  next fires the old exit *after* the new enter. Clearing unconditionally would
  swallow the target you just reached.

When a panel opens, the store flag disables the controller (`<Ecctrl enable={false}>`),
zeroes movement input, and freezes the camera.

## Notes on ecctrl v2

`ecctrl` 2.0.0 is a rewrite; most online tutorials describe v1.

| v1 | v2 |
| --- | --- |
| `<Ecctrl disableControl>` | `<Ecctrl enable={false}>` |
| `<Ecctrl animated>` | `<EcctrlAnimationStateController ecctrl={ref} />` + `useEcctrlAnimationStore` |
| built-in follow camera | none — you drive the camera yourself |
| `export default Ecctrl` | `export { Ecctrl }` (named) |

- **v2 has no keyboard handling.** Wrapping the scene in drei's `<KeyboardControls>`
  does nothing on its own. `src/components/world/KeyboardInput.tsx` is the missing wire.
- **Movement is camera-relative.** ecctrl derives "forward" from the default camera, so
  `FollowCamera` is also the steering input.
- **Use a fixed physics timestep.** With `timeStep="vary"`, a frame stall (e.g. a
  background tab throttled by the browser) hands Rapier one huge delta and flings the
  character across the room.

## Layout

```
src/
  app/page.tsx                  renders <GameClient />
  components/
    GameClient.tsx              canvas + UI + loading veil
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
      Npc.tsx / Kiosk.tsx       things you can walk up to
    ui/
      UILayer.tsx               prompt, key handling, panel routing
      ChatPanel.tsx             canned dialogue
      DashboardPanel.tsx        CSS-only stat bars
  lib/
    useGame.ts                  the store both sides talk to
    npcs.ts                     NPC data and dialogue
```

## Adding an NPC

Add an entry to `NPCS` in `src/lib/npcs.ts` (id, name, a `character-*.glb` from
`public/models/npc/`, position, dialogue). `Scene` maps over the array; nothing else changes.

## Making the NPCs real

Dialogue is canned. `ChatPanel` is the seam: swap the `pending` lines for a streamed
response from a route handler at `app/api/npc/route.ts`, with one persona per character.
Rate-limit that endpoint before deploying publicly.

## Assets

All CC0. See `public/models/ATTRIBUTION.md`.

- Player rig and animations — **Universal Animation Library** by Quaternius
- NPCs — **Blocky Characters** by Kenney
- Furniture — **Furniture Kit** by Kenney
