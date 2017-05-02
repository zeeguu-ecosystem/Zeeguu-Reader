#!/usr/bin/env bash
# Run this script to document the javascript code.
# Be sure your repository is clean and ready before doing this!
# Expects esdoc and git to be setup.

if [ "$(id -u)" == "0" ]; then
   echo "This script should not be run as root. " 1>&2
   exit 1
fi

TOP=$(cd $(dirname $0) && pwd -L)

# Generate documentation.
git checkout gh-pages
git merge \#50-autodoc --no-commit --no-ff
git reset HEAD
esdoc
ls -A | grep -v '^doc$\|^document.sh$\|.git$' | xargs rm -r
mv -v ./doc/dist/* .
rm doc -r
rm document.sh
git add --all
DATE=`date +%Y-%m-%d:%H:%M:%S`
git commit -m "Documentation updated on $DATE"
