import type { Target } from "./useGame";

export type Choice = {
  label: string;
  lines: string[];
};

export type Npc = Target & {
  kind: "chat";
  /** Filename under /models/npc/. Each Kenney skin is a different character. */
  model: string;
  role: string;
  /** Accent colour for the chat panel header. */
  color: string;
  position: [number, number, number];
  /** Y rotation in radians, so NPCs face into the room rather than at a wall. */
  rotation: number;
  greeting: string[];
  choices: Choice[];
};

export const NPCS: Npc[] = [
  {
    id: "ada",
    name: "Ada",
    kind: "chat",
    role: "Front desk",
    color: "#38bdf8",
    model: "character-a.glb",
    position: [0, 0, 3],
    rotation: 0,
    greeting: [
      "Oh — hey! You made it. Welcome to the office.",
      "Use WASD to walk, hold Shift to run, Space to jump. Drag the mouse to swing the camera around.",
      "Anyone with a name tag will talk to you. Just walk up and press E.",
    ],
    choices: [
      {
        label: "Who else is around?",
        lines: [
          "Kai's at the desks on the west side — he built most of this, ask him how it works.",
          "Mira's over on the east side, she does hiring.",
          "And Bo runs the coffee bar in the back corner. Bo is the reason anything ships.",
        ],
      },
      {
        label: "What is this place?",
        lines: [
          "A hackathon demo, technically. A 3D world in a browser tab.",
          "No plugin, no download, no install. It's React all the way down — the thing you're reading right now is an ordinary div sitting on top of a WebGL canvas.",
        ],
      },
      {
        label: "Where's the dashboard?",
        lines: [
          "Straight ahead, against the north wall — the terminal with the glowing screen.",
          "Walk into it and press E, same as talking to a person.",
        ],
      },
    ],
  },
  {
    id: "kai",
    name: "Kai",
    kind: "chat",
    role: "Tech lead",
    color: "#a78bfa",
    model: "character-c.glb",
    position: [-7.5, 0, -2],
    rotation: Math.PI / 2,
    greeting: [
      "Hey. Don't mind the desk, I'm mid-refactor.",
      "So you found the world. Want the tour of how it's put together, or would you rather just wander?",
    ],
    choices: [
      {
        label: "How does the character move?",
        lines: [
          "Rapier physics, driven by ecctrl. The character is a capsule that floats a few centimetres above the ground on a spring — that's why it climbs slopes and steps without snagging.",
          "It steers relative to the camera, so 'forward' is always wherever you're looking. Costs nothing, feels right immediately.",
        ],
      },
      {
        label: "How do these popups work?",
        lines: [
          "Every one of us stands inside an invisible sensor box. When your collider enters it, Rapier fires an event — no distance maths running every frame.",
          "That event writes to a Zustand store, and the store is the only thing the 3D scene and the DOM both touch.",
          "So this chat panel has no idea it's in a 3D scene. It's a plain React component. You could drop it into any other app unchanged.",
        ],
      },
      {
        label: "Why doesn't my character run off while I type?",
        lines: [
          "Because that was the first bug, and it was maddening.",
          "The same store flag that opens this panel also switches the controller off and freezes the camera. Open a panel, the world stops listening.",
        ],
      },
      {
        label: "Where did the art come from?",
        lines: [
          "None of it is mine. The furniture and the people are Kenney's, the animations are Quaternius — all CC0, all free.",
          "A script pulls them at setup time. That's the whole art pipeline. It's the part people assume takes a month.",
        ],
      },
    ],
  },
  {
    id: "mira",
    name: "Mira",
    kind: "chat",
    role: "Recruiting",
    color: "#fb7185",
    model: "character-e.glb",
    position: [7.5, 0, -3],
    rotation: -Math.PI / 2,
    greeting: [
      "You walked over here yourself instead of clicking a link. That already puts you ahead.",
      "Got a question, or are you just doing a lap?",
    ],
    choices: [
      {
        label: "Why build a demo like this?",
        lines: [
          "Because a résumé is a list of claims and this is a thing that runs.",
          "Anyone can open it in a tab, walk around for ninety seconds, and know what you can do. That's a much shorter argument.",
        ],
      },
      {
        label: "Does it run on a laptop?",
        lines: [
          "It has to — that's the whole point of keeping it low-poly.",
          "Flat colours, no baked lighting, box-shaped everything. It looks deliberate and it renders fast. Style and performance pointing the same direction for once.",
        ],
      },
      {
        label: "What would you add next?",
        lines: [
          "Give us real conversations. Wire the panel to a model instead of a script and every one of us gets a personality that answers questions nobody wrote down in advance.",
          "The seam is already there. It's one route handler away.",
        ],
      },
    ],
  },
  {
    id: "bo",
    name: "Bo",
    kind: "chat",
    role: "Coffee",
    color: "#fbbf24",
    model: "character-h.glb",
    position: [9, 0, 7.5],
    rotation: Math.PI,
    greeting: [
      "Machine's on. It's the good stuff, don't tell finance.",
      "You're the first person to walk all the way back here, you know that?",
    ],
    choices: [
      {
        label: "Do people usually make it this far?",
        lines: [
          "Nope. Most stop at the front desk, read the controls, and close the tab.",
          "Which is fine. But the ones who wander find the corners, and the corners are where you can tell somebody cared.",
        ],
      },
      {
        label: "Any advice?",
        lines: [
          "Ship the small version. Then go stand in it and see what's boring.",
          "You can't find that on a whiteboard. You have to walk around in it.",
        ],
      },
      {
        label: "Just here for coffee.",
        lines: ["Respect. Cup's on the counter.", "Mind the plant on your way out, it's been through a lot."],
      },
    ],
  },
];

export const KIOSK: Target & { position: [number, number, number] } = {
  id: "metrics",
  name: "Ops Terminal",
  kind: "dashboard",
  position: [0, 0, -9.6],
};

export const INTERACTABLES: Target[] = [...NPCS, KIOSK];
