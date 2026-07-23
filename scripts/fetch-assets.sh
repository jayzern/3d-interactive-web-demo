#!/usr/bin/env bash
# Downloads the CC0 3D assets the demo needs into public/models/.
# Idempotent: re-running is a no-op once the models are in place.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/public/models"

if [ -f "$OUT/AnimationLibrary.glb" ] && [ -d "$OUT/props" ] && [ -d "$OUT/npc" ]; then
  echo "assets already present in $OUT — nothing to do"
  exit 0
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$OUT/props" "$OUT/npc"

# --- Player character + animation clips (Quaternius Universal Animation Library, CC0) ---
# Shipped in the ecctrl repo, so the clip names line up with EcctrlAnimationStateController.
echo "==> AnimationLibrary.glb (6.6MB)"
curl -fsSL -o "$OUT/AnimationLibrary.glb" \
  "https://raw.githubusercontent.com/pmndrs/ecctrl/main/public/AnimationLibrary.glb"

# Kenney's zip URLs are content-hashed and change whenever a pack is republished,
# so resolve them from the asset page instead of hardcoding.
kenney_zip_url() {
  curl -fsSL "https://kenney.nl/assets/$1" \
    | grep -oE "https://kenney\.nl/media/pages/assets/[^']*\.zip" \
    | head -1
}

fetch_kenney() {
  local slug="$1" zip="$TMP/$1.zip" url
  url="$(kenney_zip_url "$slug")"
  [ -n "$url" ] || { echo "could not resolve download URL for $slug" >&2; exit 1; }
  echo "==> $slug"
  curl -fsSL -o "$zip" "$url"
  echo "$zip"
}

# --- NPCs: Kenney Blocky Characters (CC0) ---
CHARS_ZIP="$(fetch_kenney blocky-characters | tail -1)"
for c in a c e h k n; do
  unzip -joq "$CHARS_ZIP" "Models/GLB format/character-$c.glb" -d "$OUT/npc"
done
# Kenney embeds textures in these GLBs, but ship the texture dir too in case a
# future republish switches to external images.
unzip -joq "$CHARS_ZIP" "Models/GLB format/Textures/*" -d "$OUT/npc/Textures" 2>/dev/null || true
unzip -poq "$CHARS_ZIP" "License.txt" > "$OUT/LICENSE-kenney-blocky-characters.txt"

# --- Office props: Kenney Furniture Kit (CC0) ---
PROPS_ZIP="$(fetch_kenney furniture-kit | tail -1)"
for p in desk deskCorner chairDesk computerScreen computerKeyboard \
         bookcaseOpen bookcaseClosedWide pottedPlant plantSmall1 \
         rugRectangle rugRound lampSquareFloor loungeChair tableCoffee \
         kitchenCoffeeMachine televisionModern cabinetTelevision; do
  unzip -joq "$PROPS_ZIP" "Models/GLTF format/$p.glb" -d "$OUT/props"
done
unzip -poq "$PROPS_ZIP" "License.txt" > "$OUT/LICENSE-kenney-furniture-kit.txt"

cat > "$OUT/ATTRIBUTION.md" <<'EOF'
# Asset attribution

All assets in this directory are CC0 (public domain). Attribution is not
legally required, but is included because these creators earned it.

- `AnimationLibrary.glb` — character rig and animation clips from the
  **Universal Animation Library** by **Quaternius** (CC0), redistributed via
  the [ecctrl](https://github.com/pmndrs/ecctrl) repository.
- `npc/character-*.glb` — **Blocky Characters** by **Kenney** (CC0).
  https://kenney.nl/assets/blocky-characters
- `props/*.glb` — **Furniture Kit** by **Kenney** (CC0).
  https://kenney.nl/assets/furniture-kit

Support them: https://kenney.nl/donate · https://quaternius.com
EOF

echo
echo "done. $(find "$OUT" -name '*.glb' | wc -l | tr -d ' ') models in $OUT"
du -sh "$OUT"
