#!/usr/bin/env bash
# Run this script to document the javascript code.
# Be sure your repository is clean and ready before doing this!
# Expects esdoc and git to be setup.

if [ "$(id -u)" == "0" ]; then
   echo "This script should not be run as root. " 1>&2
   exit 1
fi

if [[ -n $(git status --porcelain) ]]
then
	echo "Repository is not clean!"
	exit 1
fi

TOP=$(cd $(dirname $0) && pwd -L)
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Generate documentation.
if [ "$BRANCH" = "development_core"]
then
	echo "Making gh-pages documentation"
	git checkout gh-pages
	git merge $BRANCH --no-commit --no-ff
	git reset HEAD
	esdoc
	ls -A | grep -v '^doc$\|.git$' | xargs rm -r
	mv -v ./doc/dist/* .
	rm doc -r
	git add --all
	DATE=`date +%Y-%m-%d:%H:%M:%S`
	git commit -m "AUTODOC: Documentation updated on $DATE"
	git push
	git checkout $BRANCH
else
	echo "Not development, not building documentation."
fi
