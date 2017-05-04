#!/usr/bin/env bash
# Run this script to deploy.

TOP=$(cd $(dirname $0) && pwd -L)

if [ "$(id -u)" == "0" ]; then
   echo "This script should not be run as root. " 1>&2
   exit 1
fi

echo "Hello deployment server! Let's get you setup! :)"

# Required packages.
echo "Installing required packages..."
sudo apt-get install -y \
python \
python-dev \
libxml2-dev \
libxslt1-dev \
zlib1g-dev

# Required dependencies.
echo "Installing python dependencies..."
pip install -r requirements.txt 

echo "Launching server..."
python src/zeeguu_umr.py
