#!/usr/bin/env bash
# Run this script to setup your development environment.

TOP=$(cd $(dirname $0) && pwd -L)

if [ "$(id -u)" == "0" ]; then
   echo "This script should not be run as root. " 1>&2
   exit 1
fi

echo "Hello developer! Let's get you setup! :)"

# Required packages.
read -p "Install dependencies with apt? This will ask for root priviliges (y recommended). [Y/n]" -n 1 -r
echo    # move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Apt-get installing..."
    sudo apt-get install -y \
    python3.6 \
    python3.6-dev \
    libxml2-dev \
    libxslt1-dev \
    zlib1g-dev \
    python-virtualenv \
    virtualenvwrapper
    curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
    sudo apt-get install nodejs
    sudo npm install -g webpack
    sudo npm install -g esdoc@0.5.2
else
    echo "Skipping apt-get install."
fi

# create virtualenv, consistent with virtualenv-wrapper conventions
read -p "Setup virtualenv and install python dependencies (y recommended)? " -n 1 -r
echo    # move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Setting up virtual environment..."
    if [ -z ${ZEEGUU_UMR_VENV_ROOT+x} ]
    then
        ZEEGUU_UMR_VENV_ROOT="$HOME/.virtualenvs/zeeguu_umr"
        echo "ZEEGUU_UMR_VENV_ROOT not set, using default ($ZEEGUU_UMR_VENV_ROOT)."
    fi

    if [ ! -d ${ZEEGUU_UMR_VENV_ROOT} ]; then
        mkdir -p $(dirname ${ZEEGUU_UMR_VENV_ROOT})
        virtualenv -p python3.6 ${ZEEGUU_UMR_VENV_ROOT}
    fi
    source ${ZEEGUU_UMR_VENV_ROOT}/bin/activate
    cd "${TOP}"

    # install requirements
    pip install -r requirements.txt
else
    read -p "Install python dependencies globally instead? This will require python3.6! " -n 1 -r
    echo    # move to a new line
    if [[ $REPLY =~ ^[Yy]$ ]]
    then
        echo "Installing dependencies..."
        pip install -r requirements.txt
    fi
fi

read -p "Install javascript dependencies (y recommended)? " -n 1 -r
echo    # move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Setting up javascript dependencies..."
    npm install
fi

echo "Done!"
