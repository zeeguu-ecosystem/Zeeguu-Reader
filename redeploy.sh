#!/bin/bash

# somewhere in the JS code there's a hardcoded API reference
# this script replaces it with the value of the $ZEEGUU_API env var
# the compiles
# and then changes the corresponding file back
# 
# expects also to be given the path to the zeeguu web app.py in $ZEEGUU_WEB_APP_MAIN_FILE 
# if given it touches that file which will trigger the reloading of the web

ESCAPE_SLASHES='s/\//\\\//g'

REMOVE_TRAILING_SLASH='s/\/$//g'

DEFAULT_ZEEGUU_API="https://zeeguu.unibe.ch/api"
DEFAULT_ZEEGUU_API_ESCAPED=$(echo $DEFAULT_ZEEGUU_API | sed $REMOVE_TRAILING_SLASH | sed $ESCAPE_SLASHES)
echo $DEFAULT_ZEEGUU_API_ESCAPED


if [ -z $ZEEGUU_API ]; then
	echo "ZEEGUU_API not set. working with $DEFAULT_ZEEGUU_API"
else

	
	echo "ZEEGUU_API defined ($ZEEGUU_API)"
	echo  "... chaging the API url accordingly in zeeguuRequests"
	
	ZEEGUU_API_ESCAPED=$(echo $ZEEGUU_API | sed $REMOVE_TRAILING_SLASH | sed $ESCAPE_SLASHES  )
	sed -i.bak "s/$DEFAULT_ZEEGUU_API_ESCAPED/$ZEEGUU_API_ESCAPED/g" src/umr/static/scripts/app/zeeguuRequests.js
	

	echo "changes in zeeguuRequests.js"
	git diff src/umr/static/scripts/app/zeeguuRequests.js

fi

echo "updating the version number"

./change_version_number.sh

echo "running webpack..."

webpack && (cd src; python setup.py develop) 


if [ -z $ZEEGUU_API ]; then
	echo ""
else
	mv src/umr/static/scripts/app/zeeguuRequests.js.bak src/umr/static/scripts/app/zeeguuRequests.js
	rm -rf src/umr/static/scripts/app/zeeguuRequests.js.bak
	echo "... changed the API url back to $DEFAULT_ZEEGUU_API"

	echo "changes remaining in zeeguuRequests.js"
	git diff src/umr/static/scripts/app/zeeguuRequests.js

fi

if [ -z $ZEEGUU_WEB_APP_MAIN_FILE ]; then
	echo ""
else
	echo "Restarting the web app..."
	touch $ZEEGUU_WEB_APP_MAIN_FILE
fi