#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARCHIVE_PATH="${1:-}"
EXPORT_PATH="${2:-$PROJECT_ROOT/ios-export}"

if [[ -z "$ARCHIVE_PATH" ]]; then
  LATEST_ARCHIVE="$(find "$HOME/Library/Developer/Xcode/Archives" -name "*.xcarchive" -type d -print 2>/dev/null | sort | tail -n 1)"
  if [[ -z "${LATEST_ARCHIVE:-}" ]]; then
    echo "No .xcarchive found. Create one first in Xcode with Product -> Archive."
    exit 1
  fi
  ARCHIVE_PATH="$LATEST_ARCHIVE"
fi

if [[ ! -d "$ARCHIVE_PATH" ]]; then
  echo "Archive not found: $ARCHIVE_PATH"
  exit 1
fi

mkdir -p "$EXPORT_PATH"

TMP_PLIST="$(mktemp /tmp/tms-export-options.XXXXXX.plist)"
trap 'rm -f "$TMP_PLIST"' EXIT

cat > "$TMP_PLIST" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>compileBitcode</key>
  <false/>
  <key>destination</key>
  <string>export</string>
  <key>method</key>
  <string>development</string>
  <key>signingStyle</key>
  <string>automatic</string>
  <key>stripSwiftSymbols</key>
  <true/>
  <key>thinning</key>
  <string>&lt;none&gt;</string>
</dict>
</plist>
PLIST

echo "Exporting archive:"
echo "  $ARCHIVE_PATH"
echo "to:"
echo "  $EXPORT_PATH"

xcodebuild -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_PATH" \
  -exportOptionsPlist "$TMP_PLIST" \
  -allowProvisioningUpdates

echo
echo "Export complete. Files are in:"
echo "  $EXPORT_PATH"
