# get commit hash
rev=$(git rev-parse --short HEAD 2>&1)
# Export to env as well, for the artifact
echo $(git rev-parse --short HEAD)
export AppRev=$(git rev-parse --short HEAD)
# Get git root directory
root=$(git rev-parse --show-toplevel 2>&1)
# Save to version file
echo "$rev" > "$root/public/version"
