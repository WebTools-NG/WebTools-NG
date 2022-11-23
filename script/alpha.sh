# Release from alpha into a draft release


# Checkout Alpha Branch
git checkout alpha

# Get current version
CURVER=$(cat package.json|grep -oP '(?<="version": ")[^"]*')
echo $CURVER
# Get git root directory
root=$(git rev-parse --show-toplevel 2>&1)
# get commit hash for version file 
rev=$(git rev-parse --short HEAD 2>&1)
echo Committing v$CURVER.$rev
# Commit to alpha Branch
git commit -am v$CURVER.$rev
# Tag alpha Branch
git tag v$CURVER.$rev
# Upload and trigger a release
git push && git push --tags
git checkout $CURBRANCH
