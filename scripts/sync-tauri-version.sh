VERSION=$(grep '"version"' package.json | head -1 | awk -F\" '{print $4}')

jq ".version = \"$VERSION\"" \
  src-tauri/tauri.conf.json \
  > tmp.json && mv tmp.json src-tauri/tauri.conf.json

echo "Synced Tauri version to $VERSION"