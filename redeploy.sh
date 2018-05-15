#!/bin/bash
webpack
(cd src; python setup.py develop)
touch /home/mircea/Zeeguu-Web/zeeguu_web/app.py

