# Release from master into a draft release

# Get current branch
CURBRANCH=$(git rev-parse --abbrev-ref HEAD)
echo $CURBRANCH
# Checkout Master Branch
git checkout master
# Make sure Master Branch locally is updated
git pull
# Checkout Release Branch
git checkout release
# Update Release Branch from Master
git merge master
# Get current version
CURVER=$(cat package.json|grep -oP '(?<="version": ")[^"]*')
echo $CURVER
# Get git root directory
root=$(git rev-parse --show-toplevel 2>&1)
# get commit hash for version file 
rev='{"rev":"'$(git rev-parse --short HEAD 2>&1)'"}'
# Commit to Release Branch
git commit -am v$CURVER.rev
# Tag Release Branch
git tag v$CURVER.rev
# Upload and trigger a release
git push && git push --tags
