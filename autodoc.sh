#!/usr/bin/env bash
# Run this script to document the javascript code.
# Be sure your repository is clean and ready before doing this!
# Expects esdoc and git to be setup.

if [ "$(id -u)" == "0" ]; then
   echo "This script should not be run as root!" 1>&2
   exit 1
fi

if [[ -n $(git status --porcelain) ]]
then
	echo "Repository should be clean!"
	exit 1
fi

DATE=`date +%Y-%m-%d:%H:%M:%S`
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Generate documentation.
if [[ "$BRANCH" = "master" ]]
then
	echo "On master => Pushing documentation to gh-pages"
	git checkout gh-pages
	git merge $BRANCH --no-commit --no-ff
	git reset HEAD
	esdoc
	ls -A | grep -v '^doc$\|.git$' | xargs rm -r
	mv -v ./doc/dist/* .
	rm doc -r
	git add --all
	git commit -m "AUTODOC: Documentation updated on $DATE"
	git push
	git checkout $BRANCH
else
	echo "Not master => Building local documentation of $BRANCH."
	esdoc
fi
