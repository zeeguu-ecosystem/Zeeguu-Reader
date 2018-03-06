#!/bin/bash

echo "Files Found: "
find src/umr -name "*$1*" -print

# for distinguishing " ", "\t" from "\n"
IFS=

echo "press ENTER to open the first file in the previous list"
read -n 1 key 
if [ "$key" = "" ]; then
   find src/umr -name "*$1*" -exec vi {} +
fi



