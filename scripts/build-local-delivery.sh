#!/bin/sh
set -eu

repository_dir=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
delivery_parent="$repository_dir/deliverables"
delivery_name="json-render-ai-webmcp-mvp-2026-09-03"
delivery_dir="$delivery_parent/$delivery_name"
mkdir -p "$delivery_parent"
work_dir=$(mktemp -d "$delivery_parent/.build.XXXXXX")
preview_pid=''

cleanup() {
  if [ -n "$preview_pid" ]; then kill "$preview_pid" 2>/dev/null || true; fi
  rm -rf "$work_dir"
}
trap cleanup EXIT INT TERM

if [ -e "$delivery_dir" ] || [ -e "$delivery_dir.zip" ]; then
  echo "Delivery already exists: $delivery_dir" >&2
  exit 1
fi

for required_command in curl ffmpeg ffprobe node pnpm say shasum zip; do
  if ! command -v "$required_command" >/dev/null 2>&1; then
    echo "Missing required command: $required_command" >&2
    exit 1
  fi
done

mkdir -p "$delivery_dir/app-dist" "$delivery_dir/demo" \
  "$delivery_dir/screenshots" "$delivery_dir/source" \
  "$delivery_dir/submission" "$delivery_dir/tools"

cd "$repository_dir"
pnpm build
cp -R dist/. "$delivery_dir/app-dist/"
cp packaging/START_LOCAL.command "$delivery_dir/START_LOCAL.command"
cp packaging/serve-static.mjs "$delivery_dir/tools/serve-static.mjs"
cp docs/LOCAL_DELIVERY.md "$delivery_dir/README.md"
chmod +x "$delivery_dir/START_LOCAL.command"

git archive --format=zip --output="$delivery_dir/source/json-render-ai-source.zip" HEAD
git rev-parse HEAD >"$delivery_dir/source/SOURCE_COMMIT"

cp docs/assets/workspace-overview.png "$delivery_dir/screenshots/"
cp docs/assets/delete-confirmation.png "$delivery_dir/screenshots/"
cp docs/assets/shared-activity.png "$delivery_dir/screenshots/"
cp docs/evidence/2026-09-03-codex-webmcp-full-page.png "$delivery_dir/screenshots/"
cp devpost-submission.md "$delivery_dir/submission/"
cp docs/DEMO_SCRIPT.md "$delivery_dir/submission/"
cp docs/VIDEO_NARRATION.md "$delivery_dir/submission/"
cp docs/VIDEO_NARRATION.txt "$delivery_dir/submission/"
cp docs/evidence/2026-09-02-mvp-acceptance-matrix.md "$delivery_dir/submission/"
cp docs/evidence/2026-09-02-phase-5-verification.md "$delivery_dir/submission/"
cp docs/evidence/2026-09-02-submission-checklist.md "$delivery_dir/submission/"
cp docs/evidence/2026-09-03-codex-agent-webmcp-verification.md "$delivery_dir/submission/"
cp LICENSE "$delivery_dir/submission/"

pnpm preview --host 127.0.0.1 --port 4173 >"$work_dir/preview.log" 2>&1 &
preview_pid=$!
attempt=0
until curl --fail --silent http://127.0.0.1:4173/ >/dev/null; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 50 ]; then
    echo "Preview server did not become ready" >&2
    exit 1
  fi
  sleep 0.1
done

DEMO_URL=http://127.0.0.1:4173/ \
  DEMO_VIDEO_OUTPUT="$work_dir/demo-silent.webm" \
  node scripts/record-local-demo.mjs

kill "$preview_pid" 2>/dev/null || true
wait "$preview_pid" 2>/dev/null || true
preview_pid=''

say -v Samantha -r 145 -f docs/VIDEO_NARRATION.txt -o "$work_dir/narration.aiff"
ffmpeg -hide_banner -loglevel error -y \
  -i "$work_dir/demo-silent.webm" -i "$work_dir/narration.aiff" \
  -filter:a "atempo=0.92,apad" -c:v libx264 -preset medium -crf 20 \
  -pix_fmt yuv420p -c:a aac -b:a 160k -shortest -movflags +faststart \
  "$delivery_dir/demo/json-render-ai-webmcp-demo.mp4"

ffprobe -v error -select_streams v:0 -show_entries stream=width,height \
  -show_entries format=duration -of default=noprint_wrappers=1 \
  "$delivery_dir/demo/json-render-ai-webmcp-demo.mp4"

(
  cd "$delivery_dir"
  find . -type f ! -name SHA256SUMS -print | LC_ALL=C sort | \
    while IFS= read -r delivery_file; do
      shasum -a 256 "$delivery_file"
    done >SHA256SUMS
  shasum -a 256 -c SHA256SUMS
)

(
  cd "$delivery_parent"
  zip -q -r "$delivery_name.zip" "$delivery_name"
  shasum -a 256 "$delivery_name.zip" >"$delivery_name.zip.sha256"
)

echo "$delivery_dir.zip"
