#!/bin/bash

if [ $# -eq 0 ]
  then
   echo "expects as two params the old version number and the new one."
   echo "e.g. change_version_number 0.9.1 0.9.2"
   echo "Current version numbers: "
   echo " " 
   
   echo "-- package.json "
   grep version package.json

   CURR_VERSION=`grep version package.json | sed s/.*version\":\ \"//g | sed s/\",//g`

   # magic perl due to: https://stackoverflow.com/questions/32541720/increment-version-number-in-file-via-bash-command
   NEW_VERSION=`grep version package.json | sed s/.*version\":\ \"//g | sed s/\",//g | perl -pe 's/\b(\d+)(?=\D*$)/$1+1/e'`


   echo "-- article.html "
   grep scripts/dist/translation src/umr/templates/article.html
   echo " " 

   echo "-- articles.html "
   grep scripts/dist/subscription src/umr/templates/articles.html
   echo " " 

   echo "-- src/setup.py "
   grep version src/setup.py
   echo " " 

   echo "Current version: $CURR_VERSION " 
   echo "New version: $NEW_VERSION " 
   echo " "
   read -p "Press enter to continue"

   
fi

echo "changing $CURR_VERSION to $NEW_VERSION in three files"

sed -i.bak "s/$CURR_VERSION/$NEW_VERSION/g" src/setup.py
sed -i.bak "s/$CURR_VERSION/$NEW_VERSION/g" package.json
sed -i.bak "s/$CURR_VERSION/$NEW_VERSION/g" src/umr/templates/article.html
sed -i.bak "s/$CURR_VERSION/$NEW_VERSION/g" src/umr/templates/articles.html

echo "Done"

echo "--- package.json ---"
grep $NEW_VERSION package.json 
echo " "

echo "--- article.html ---"
grep $NEW_VERSION src/umr/templates/article.html
echo " "

echo "--- articles.html ---"
grep $NEW_VERSION src/umr/templates/articles.html
echo " "

echo "--- setup.py ---"
grep $NEW_VERSION src/setup.py
echo " "