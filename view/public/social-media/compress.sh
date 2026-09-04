#!/usr/bin/env bash
#
# compress.sh — normalize every image under view/public/social-media/ to .jpg
# and compress large ones down to ~500KB using ffmpeg.
#
# Behavior:
#   * Converts any png/jpeg/JPG/webp/bmp/tiff/gif/avif to lowercase `.jpg`.
#   * Re-encodes only images that are larger than TARGET_KB (or not already .jpg).
#     Already-small .jpg files are left untouched.
#   * Targets the size via a binary search over ffmpeg's `-q:v` (quality), and
#     falls back to progressive downscaling if quality alone cannot reach it.
#   * Rewrites each captions.json so its `file` fields point at the new .jpg names.
#
# Usage:
#   bash compress.sh            # 500KB target (default)
#   TARGET_KB=300 bash compress.sh
#
# After running, rebuild so the public/ assets propagate to dist/:
#   npm run build

set -euo pipefail

# ---- config ---------------------------------------------------------------
TARGET_KB="${TARGET_KB:-500}"
TARGET_BYTES=$(( TARGET_KB * 1024 ))

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# ---- locate ffmpeg --------------------------------------------------------
FFMPEG="${FFMPEG:-$(command -v ffmpeg || true)}"
if [ -z "$FFMPEG" ]; then
  echo "error: ffmpeg not found on PATH (set FFMPEG=/path/to/ffmpeg)" >&2
  exit 1
fi

# image extensions we care about (case-insensitive)
IMAGE_EXTS=(-iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' \
            -o -iname '*.bmp' -o -iname '*.tif' -o -iname '*.tiff' \
            -o -iname '*.avif' -o -iname '*.gif')

size_of() { stat -c%s "$1" 2>/dev/null || wc -c < "$1"; }

# run_ffmpeg <in> <out> <q> <vf|->
run_ffmpeg() {
  local in="$1" out="$2" q="$3" vf="$4"
  if [ "$vf" = "-" ]; then
    "$FFMPEG" -y -loglevel error -i "$in" -q:v "$q" "$out" 2>/dev/null
  else
    "$FFMPEG" -y -loglevel error -i "$in" -vf "$vf" -q:v "$q" "$out" 2>/dev/null
  fi
}

# find_best_q <in> <vf|-> — echo the lowest q (best quality) whose file size
# is <= TARGET_BYTES, or 0 if none fits at this scale. q range: 2..31.
find_best_q() {
  local in="$1" vf="$2"
  local lo=2 hi=31 mid ans=0 cand="$TMP/cand.jpg"
  while [ "$lo" -le "$hi" ]; do
    mid=$(( (lo + hi) / 2 ))
    rm -f "$cand"
    if ! run_ffmpeg "$in" "$cand" "$mid" "$vf"; then
      return 1
    fi
    if [ ! -s "$cand" ]; then
      return 1
    fi
    if [ "$(size_of "$cand")" -le "$TARGET_BYTES" ]; then
      ans=$mid
      hi=$(( mid - 1 ))   # try smaller q = better quality
    else
      lo=$(( mid + 1 ))
    fi
  done
  echo "$ans"
}

# compress_image <in> <target.jpg> — write a <=TARGET_BYTES jpg to target.
compress_image() {
  local in="$1" target="$2"
  local tmp="$TMP/out.jpg"
  local scale q vf

  for scale in 100 80 64 50 40 32 25 20; do
    if [ "$scale" -eq 100 ]; then
      vf="-"
    else
      vf="scale=trunc(iw*${scale}/100/2)*2:trunc(ih*${scale}/100/2)*2"
    fi

    q="$(find_best_q "$in" "$vf")" || { echo "  ! encode error: $in" >&2; return 1; }

    if [ "$q" -gt 0 ]; then
      run_ffmpeg "$in" "$tmp" "$q" "$vf"
      mv -f "$tmp" "$target"
      return 0
    fi
  done

  # Last resort: smallest scale, lowest quality (accept possible overshoot).
  vf="scale=trunc(iw*20/100/2)*2:trunc(ih*20/100/2)*2"
  run_ffmpeg "$in" "$tmp" "31" "$vf"
  mv -f "$tmp" "$target"
}

# rewrite_captions <captions.json> — point every "file" at its .jpg name.
rewrite_captions() {
  local cf="$1"
  [ -f "$cf" ] || return 0
  node -e '
    const fs = require("fs");
    const p = process.argv[1];
    const arr = JSON.parse(fs.readFileSync(p, "utf8"));
    let changed = 0;
    for (const e of arr) {
      if (e && typeof e.file === "string" && e.file.match(/\.[^.]+$/)) {
        const next = e.file.replace(/\.[^.]+$/, ".jpg");
        if (next !== e.file) { e.file = next; changed++; }
      }
    }
    fs.writeFileSync(p, JSON.stringify(arr, null, 2) + "\n", "utf8");
    console.log("  updated captions.json (" + changed + " renamed)");
  ' "$cf"
}

# ---- main -----------------------------------------------------------------
echo "Target: ~${TARGET_KB}KB per image"
echo "Base dir: ${SCRIPT_DIR}"
echo

for dir in "$SCRIPT_DIR"/*/; do
  [ -d "$dir" ] || continue
  dir="${dir%/}"
  platform="$(basename "$dir")"
  echo "== $platform =="

  # process every image directly inside this platform dir
  while IFS= read -r -d '' f; do
    base="$(basename "$f")"
    stem="${base%.*}"
    target="$dir/${stem}.jpg"

    # already a lowercase .jpg and small enough -> leave it alone
    if [ "$base" = "${stem}.jpg" ] && [ "$(size_of "$f")" -le "$TARGET_BYTES" ]; then
      echo "  keep  $base ($(( $(size_of "$f") / 1024 ))KB)"
      continue
    fi

    before=$(( $(size_of "$f") / 1024 ))
    echo "  conv  $base (${before}KB) -> ${stem}.jpg"
    compress_image "$f" "$target"
    after=$(( $(size_of "$target") / 1024 ))
    echo "        -> ${after}KB"

    # remove the original only when it's a *different* file than the target.
    # On Windows the filesystem is case-insensitive, so ".JPG" and ".jpg" are
    # the same file and must not be deleted after being overwritten in place.
    if [ ! "$f" -ef "$target" ]; then
      rm -f "$f"
    fi
  done < <(find "$dir" -maxdepth 1 -type f \( "${IMAGE_EXTS[@]}" \) -print0 | sort -z)

  rewrite_captions "$dir/captions.json"
  echo
done

echo "Done. Rebuild to sync public/ -> dist/ (npm run build)."
