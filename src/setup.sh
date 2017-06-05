#!/usr/bin/env bash
# Run this script to package umr.

TOP=$(cd $(dirname $0) && pwd -L)

if [ "$(id -u)" == "0" ]
then
   echo "This script should not be run as root." 1>&2
   exit 1
fi

if [ $# -eq 0 ]
then
    echo "error: No argument supplied!"
   exit 1
fi

command -v webpack >/dev/null 2>&1 || { echo >&2 "error: 'webpack' is not installed, please execute dev_setup.sh first!"; exit 1; }

# All is well, proceed to perform the actual installation.
echo "Hello developer! Let's get UMR ready for you! :)"
(cd ..; webpack)
python setup.py $1

echo "Done!"
