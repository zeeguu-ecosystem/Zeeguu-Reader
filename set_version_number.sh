#!/bin/bash

echo "changing $1 to $2 in three files"

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


