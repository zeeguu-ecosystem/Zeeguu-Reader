#!/usr/bin/env bash
# Run this script to setup your development environment.

if [ "$(id -u)" == "0" ]; then
   echo "This script should not be run as root. " 1>&2
   exit 1
fi

# Required packages.
read -p "Install dependencies with apt? Will need root priviliges." -n 1 -r
echo    # move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
    sudo apt-get install -y \
    python \
    python-dev \
    libxml2-dev \
    libxslt1-dev \
    zlib1g-dev \
    python-virtualenv \
    virtualenvwrapper
    curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
    sudo apt-get install nodejs
    sudo npm install -g webpack
    sudo npm install
fi

TOP=$(cd $(dirname $0) && pwd -L)
VIRTUALENV_ROOT=${VIRTUALENV_ROOT:-"${HOME}/.virtualenvs/zeeguu_umr"}

# create virtualenv, consistent with virtualenv-wrapper conventions
if [ ! -d ${VIRTUALENV_ROOT} ]; then
   mkdir -p $(dirname ${VIRTUALENV_ROOT})
  virtualenv -p python2.7 ${VIRTUALENV_ROOT}
fi
source ${VIRTUALENV_ROOT}/bin/activate
cd ${TOP}

# install requirements
pip install -r requirements.txt 
