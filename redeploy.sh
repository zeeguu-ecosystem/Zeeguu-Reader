#!/bin/bash
webpack
(cd src; sudo python3.6 setup.py develop)
touch /Users/mircea/my/projects/zeeguu/server/http/web/zeeguu_web/app.py

