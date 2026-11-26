THE OFFICE - a 3D interactive world in a browser tab
=====================================================

An RPG-style demo: walk a character around a low-poly office with WASD,
walk up to the people in it, and a plain React panel opens - a chat with
that character, or a dashboard at the terminal by the north wall.

The point of the architecture is that the panels have no idea they are in
a 3D scene. ChatPanel and DashboardPanel are ordinary React components
rendered as DOM on top of the canvas. The only thing the 3D world and the
UI share is a Zustand store.


REQUIREMENTS
------------

- Node.js (LTS recommended)
- npm
- A WebGL-capable browser


RUNNING IT
----------

    npm install
    bash scripts/fetch-assets.sh   # downloads the CC0 models into public/models/
    npm run dev

Then open http://localhost:3000

fetch-assets.sh is idempotent and must be run once before the first
"npm run dev" - the models are not checked into the repo.

Append ?debug to the URL to draw Rapier's colliders and trigger volumes.


CONTROLS
--------

    WASD / arrow keys   move
    Shift               run
    Space               jump
    Mouse drag          look around
    Scroll wheel        zoom camera
    E                   interact / talk / use terminal
    Esc                 close panel


HOW IT WORKS
------------

Each NPC and the kiosk is an "Interactable": a fixed rigid body with a
solid collider you bump into, wrapped in a larger sensor collider. Rapier
fires onIntersectionEnter / onIntersectionExit when the player's body
crosses it, so there is no per-frame distance maths anywhere in the scene.

    Rapier sensor  ->  useGame (Zustand)  ->  UILayer  ->  ChatPanel / DashboardPanel

Two details that are easy to get wrong:

- The sensor must be filtered to the player. A sensor reports every
  intersection, floor included. The player's rigid body is named "player"
  and the handlers check other.rigidBodyObject?.name.
- "leave" is id-guarded. Trigger volumes overlap, so walking from one NPC
  straight to the next fires the old NPC's exit after the new one's enter.
  Clearing unconditionally would swallow the target you just reached.

When a panel opens, the same store flag switches the controller off
(<Ecctrl enable={false}>), zeroes the movement input, and freezes the
camera - otherwise WASD walks the character away while you are reading,
and dragging inside the panel spins the world behind it.

Notes on ecctrl v2:

- v2 has no keyboard handling at all. It reads its touch stores and
  handle.setMovement(), and nothing else - wrapping the scene in drei's
  <KeyboardControls> does nothing on its own. src/components/world/
  KeyboardInput.tsx is the missing wire between the two.
- v2 has no built-in follow camera. src/components/world/FollowCamera.tsx
  drives the camera itself (drag to orbit, wheel to zoom), and because
  ecctrl derives "forward" from the camera's world direction, that camera
  is also the steering input.
- Use <Ecctrl enable={false}> (not v1's disableControl), named export
  { Ecctrl }, and <EcctrlAnimationStateController> plus
  useEcctrlAnimationStore for animation state.
- Physics runs on a FIXED timestep (1/60). With timeStep="vary", any frame
  stall (browsers throttle requestAnimationFrame in background windows)
  hands Rapier one enormous delta and flings the character across the room.


PROJECT LAYOUT
--------------

    src/
      app/page.tsx                  renders <GameClient />
      components/
        GameClient.tsx              'use client' - canvas + UI + loading veil
        world/
          WorldCanvas.tsx           <Canvas>, <KeyboardControls>, <Physics>
          Scene.tsx                 lights, office, NPCs, kiosk, player
          Player.tsx                <Ecctrl> + animation + input + camera
          KeyboardInput.tsx         keyboard -> handle.setMovement()
          FollowCamera.tsx          third-person orbit camera
          CharacterModel.tsx        player rig + animation cross-fading
          Office.tsx                floor, walls, prop layout
          Prop.tsx                  useGLTF + <Clone> wrapper
          Interactable.tsx          solid body + sensor volume -> store
          Npc.tsx / Kiosk.tsx       the things you can walk up to
        ui/
          UILayer.tsx               prompt, key handling, panel routing
          ChatPanel.tsx             canned dialogue
          DashboardPanel.tsx        CSS-only stat bars
      lib/
        useGame.ts                  the store both sides talk to
        npcs.ts                     NPC data and dialogue


THE CHARACTERS
--------------

    Ada    Front desk      welcome, controls, where things are
    Kai    Tech lead       how the demo is built (physics, sensors, panels)
    Mira   Recruiting      why the demo exists, what could come next
    Bo     Coffee          the break room, in the back right corner
    Ops Terminal           the kiosk on the north wall - "metrics" dashboard


ADDING AN NPC
-------------

Add an entry to NPCS in src/lib/npcs.ts - id, name, a character-*.glb from
public/models/npc/, a position, and the dialogue. Nothing else needs to
change; Scene maps over the array and the store handles the rest.


MAKING THE NPCS REAL
--------------------

The dialogue is canned, and ChatPanel is the seam where that changes.
Swap the pending lines for a streamed response from a route handler at
app/api/npc/route.ts with one persona per character, and nothing else in
the scene has to move. Rate-limit that endpoint before deploying it
publicly.


ASSETS
------

All CC0. See public/models/ATTRIBUTION.md.

- Player rig and animations - Universal Animation Library by Quaternius
- NPCs                        - Blocky Characters by Kenney
- Furniture                   - Furniture Kit by Kenney


TECH STACK
----------

    Next.js (App Router) + React
    three.js / React Three Fiber / drei
    @react-three/rapier (physics, fixed timestep)
    ecctrl v2 (character controller)
    zustand (shared UI/3D state)
    Tailwind CSS
