#!/bin/bash
webpack
(cd src; python3 setup.py develop)
touch /Users/mircea/my/projects/zeeguu/server/http/web/zeeguu_web/app.py

