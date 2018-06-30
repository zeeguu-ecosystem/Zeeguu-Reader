#!/bin/bash

if [ $# -eq 0 ]
  then
   echo "expects as two params the old version number and the new one."
   echo "e.g. change_version_number 0.9.1 0.9.2"
   echo "Current version numbers: "
   echo " " 
   
   echo "-- package.json "
   grep version package.json
   echo " " 

   echo "-- article.html "
   grep scripts/dist/translation src/umr/templates/article.html
   echo " " 

   echo "-- articles.html "
   grep scripts/dist/subscription src/umr/templates/articles.html
   echo " " 

   echo "-- src/setup.py "
   grep version src/setup.py
   echo " " 

   exit
fi

echo "changing $1 to $2 in three files"

sed -i.bak "s/$1/$2/g" src/setup.py
sed -i.bak "s/$1/$2/g" package.json
sed -i.bak "s/$1/$2/g" src/umr/templates/article.html
sed -i.bak "s/$1/$2/g" src/umr/templates/articles.html

echo "Done"

echo "--- package.json ---"
grep $2 package.json 
echo " "

echo "--- article.html ---"
grep $2 src/umr/templates/article.html
echo " "

echo "--- articles.html ---"
grep $2 src/umr/templates/articles.html
echo " "

echo "--- setup.py ---"
grep $2 src/setup.py
echo " "