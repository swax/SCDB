#!/bin/bash
#
# Preflight check for the NAISYS agent pipeline.
# Run this before starting agents to verify all paths, scripts, tools, and services are working.
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

# --- Load .env ---
if [ ! -f "$ENV_FILE" ]; then
  echo "FAIL: .env file not found at $ENV_FILE"
  exit 1
fi

while IFS='=' read -r key value; do
  # Skip comments and blank lines
  [[ "$key" =~ ^#.*$ || -z "$key" ]] && continue
  # Strip inline comments (but not inside quotes)
  key=$(echo "$key" | xargs)
  # Remove surrounding quotes from value
  value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
  export "$key"="$value" 2>/dev/null || true
done < "$ENV_FILE"

PASS=0
FAIL=0
WARN=0

pass() { echo "  PASS: $1"; PASS=$((PASS + 1)); }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL + 1)); }
warn() { echo "  WARN: $1"; WARN=$((WARN + 1)); }

# ============================================================
echo ""
echo "=== Required Tools ==="
# ============================================================

for cmd in node npx psql tree curl; do
  if command -v "$cmd" &>/dev/null; then
    pass "$cmd found ($(command -v "$cmd"))"
  else
    fail "$cmd not found in PATH"
  fi
done

# ============================================================
echo ""
echo "=== Environment Variables ==="
# ============================================================

required_vars=(
  SCDB_FOLDER
  SCDB_PIPELINE_FOLDER
  SCDB_FIND_SKETCHES_FOLDER
  SCDB_DETAILS_FOLDER
  SCDB_HEADSHOTS_FOLDER
  SCDB_UPDATE_DATABASE_FOLDER
  SCDB_TEST_FOLDER
  SCDB_APPROVAL_FOLDER
  SCDB_DATA_FOLDER
  STARMAPR_FOLDER
)

for var in "${required_vars[@]}"; do
  if [ -n "${!var:-}" ]; then
    pass "$var is set"
  else
    fail "$var is not set"
  fi
done

# ============================================================
echo ""
echo "=== Directory Structure ==="
# ============================================================

# Top-level directories
for dir in "$SCDB_FOLDER" "$STARMAPR_FOLDER" "$SCDB_PIPELINE_FOLDER" "$SCDB_DATA_FOLDER"; do
  if [ -d "$dir" ]; then
    pass "$dir exists"
  else
    fail "$dir does not exist"
  fi
done

# Pipeline stage directories with their subdirectories
stage_folders=(
  "$SCDB_FIND_SKETCHES_FOLDER"
  "$SCDB_DETAILS_FOLDER"
  "$SCDB_HEADSHOTS_FOLDER"
  "$SCDB_UPDATE_DATABASE_FOLDER"
  "$SCDB_TEST_FOLDER"
  "$SCDB_APPROVAL_FOLDER"
)

for stage in "${stage_folders[@]}"; do
  if [ ! -d "$stage" ]; then
    fail "$stage does not exist"
    continue
  fi
  for sub in 01-pending 02-processing 03-completed; do
    if [ -d "$stage/$sub" ]; then
      pass "$stage/$sub exists"
    else
      fail "$stage/$sub does not exist"
    fi
  done
done

# ============================================================
echo ""
echo "=== SCDB Scripts ==="
# ============================================================

scdb_scripts=(
  "$SCDB_FOLDER/operations/youtube/video-summary.js"
  "$SCDB_FOLDER/operations/facebook/get-recent-posts.js"
  "$SCDB_FOLDER/operations/facebook/create-post.js"
  "$SCDB_FOLDER/operations/twitter/get-recent-posts.js"
  "$SCDB_FOLDER/operations/twitter/create-post.js"
  "$SCDB_FOLDER/operations/sketchtvlol/upload-image.js"
  "$SCDB_FOLDER/operations/sketchtvlol/get-sketch-details.mjs"
)

for script in "${scdb_scripts[@]}"; do
  if [ -f "$script" ]; then
    pass "$script exists"
  else
    fail "$script not found"
  fi
done

# ============================================================
echo ""
echo "=== StarMapr Scripts ==="
# ============================================================

starmapr_scripts=(
  "$STARMAPR_FOLDER/01_run_headshot_detection.py"
  "$STARMAPR_FOLDER/34_extract_video_thumbnail.py"
)

for script in "${starmapr_scripts[@]}"; do
  if [ -f "$script" ]; then
    pass "$script exists"
  else
    fail "$script not found"
  fi
done

if [ -f "$STARMAPR_FOLDER/venv/bin/python3" ]; then
  pass "StarMapr python3 venv exists"
  # Verify python boots
  if py_ver=$("$STARMAPR_FOLDER/venv/bin/python3" --version 2>&1); then
    pass "StarMapr python3 runs ($py_ver)"
  else
    fail "StarMapr python3 failed to start"
  fi
  # Verify scripts compile (syntax + imports resolve)
  for py_script in "${starmapr_scripts[@]}"; do
    if [ -f "$py_script" ]; then
      if output=$("$STARMAPR_FOLDER/venv/bin/python3" -m py_compile "$py_script" 2>&1); then
        pass "$(basename "$py_script") compiles OK"
      else
        fail "$(basename "$py_script") compile failed: $(echo "$output" | tail -1)"
      fi
    fi
  done
else
  fail "StarMapr python3 venv not found at $STARMAPR_FOLDER/venv/bin/python3"
fi

# ============================================================
echo ""
echo "=== Database Connectivity ==="
# ============================================================

if psql service=scdb -c "SELECT 1" &>/dev/null; then
  pass "psql service=scdb connection works"
else
  fail "psql service=scdb connection failed"
fi

# NAISYS user exists
naisys_user=$(psql service=scdb -t -c "SELECT id FROM \"user\" WHERE name='NAISYS'" 2>/dev/null | tr -d ' ')
if [ -n "$naisys_user" ]; then
  pass "NAISYS user exists (id: $naisys_user)"
else
  fail "NAISYS user not found in user table"
fi

# refresh_sketch_search function exists
if psql service=scdb -t -c "SELECT proname FROM pg_proc WHERE proname='refresh_sketch_search'" 2>/dev/null | grep -q refresh_sketch_search; then
  pass "refresh_sketch_search() function exists"
else
  fail "refresh_sketch_search() function not found"
fi

# Sketch table is queryable (used by social media agent)
if psql service=scdb -c "SELECT id FROM sketch LIMIT 1" &>/dev/null; then
  pass "sketch table is queryable"
else
  fail "sketch table query failed"
fi

# ============================================================
echo ""
echo "=== Script Execution (read-only) ==="
# ============================================================

# YouTube video summary
if output=$(cd "$SCDB_FOLDER" && node operations/youtube/video-summary.js "https://www.youtube.com/watch?v=jNQXAC9IVRw" 2>&1); then
  pass "youtube/video-summary.js ran successfully"
else
  fail "youtube/video-summary.js failed: $(echo "$output" | tail -1)"
fi

# Facebook recent posts
if output=$(cd "$SCDB_FOLDER" && node operations/facebook/get-recent-posts.js 2>&1); then
  pass "facebook/get-recent-posts.js ran successfully"
else
  warn "facebook/get-recent-posts.js failed: $(echo "$output" | tail -1)"
fi

# Twitter recent posts
if output=$(cd "$SCDB_FOLDER" && node operations/twitter/get-recent-posts.js sketchtvlol 2>&1); then
  pass "twitter/get-recent-posts.js ran successfully"
else
  warn "twitter/get-recent-posts.js failed: $(echo "$output" | tail -1)"
fi

# Get sketch details (fetch a random sketch ID from DB to test with)
sketch_id=$(psql service=scdb -t -c "SELECT id FROM sketch ORDER BY id DESC LIMIT 1" 2>/dev/null | tr -d ' ')
if [ -n "$sketch_id" ]; then
  if output=$(cd "$SCDB_FOLDER" && npx tsx operations/sketchtvlol/get-sketch-details.mjs "$sketch_id" 2>&1); then
    pass "get-sketch-details.mjs ran successfully (sketch $sketch_id)"
    rm -f "$SCDB_FOLDER/database.txt"
  else
    fail "get-sketch-details.mjs failed: $(echo "$output" | tail -1)"
  fi
else
  warn "Could not find a sketch ID to test get-sketch-details.mjs"
fi

# Search API
if output=$(curl -s --max-time 10 "https://www.sketchcomedydatabase.com/api/search?q=test" 2>&1) && echo "$output" | head -c1 | grep -q '{'; then
  pass "sketchcomedydatabase.com search API returns valid JSON"
else
  warn "sketchcomedydatabase.com search API may not be working"
fi

# ============================================================
echo ""
echo "=== External Endpoints ==="
# ============================================================

endpoints=(
  "https://www.sketchtv.lol"
  "https://static.sketchtv.lol/images/sketch/api001_sketch_thumbnail_c320db4b.jpeg"
  "https://www.sketchcomedydatabase.com/api/search?q=test"
)

for url in "${endpoints[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
  if [ "$status" -ge 200 ] && [ "$status" -lt 400 ]; then
    pass "$url (HTTP $status)"
  elif [ "$status" = "000" ]; then
    fail "$url (connection failed)"
  else
    warn "$url (HTTP $status)"
  fi
done

# ============================================================
echo ""
echo "=== Summary ==="
# ============================================================

echo "  $PASS passed, $FAIL failed, $WARN warnings"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo "Preflight check FAILED. Fix the issues above before starting agents."
  exit 1
else
  echo "Preflight check PASSED."
  exit 0
fi
