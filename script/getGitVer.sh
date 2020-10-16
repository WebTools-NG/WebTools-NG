# Export rev to env, for the artifact
export AppRev=$(git rev-parse --short HEAD)
# Get git root directory
root=$(git rev-parse --show-toplevel 2>&1)
# get commit hash for version file 
rev='{"rev":"'$(git rev-parse --short HEAD 2>&1)'"}'
# Save to version file
echo "$rev" > "$root/public/version.json"