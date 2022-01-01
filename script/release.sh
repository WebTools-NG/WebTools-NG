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
# Commit to Release Branch
git commit -am v$CURVER
# Tag Release Branch
git tag v$CURVER
# Upload and trigger a release
git push && git push --tags
