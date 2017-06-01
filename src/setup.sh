#!/usr/bin/env bash
# Run this script to setup your development environment.

TOP=$(cd $(dirname $0) && pwd -L)

if [ "$(id -u)" == "0" ]; then
   echo "This script should not be run as root. " 1>&2
   exit 1
fi

if [ $# -eq 0 ]
  then
    echo "error: No arguments supplied"
   exit
fi

echo "Hello developer! Let's get UMR ready for you! :)"
(cd ..; webpack)
python setup.py $1

echo "Done!"
