#!/usr/bin/env python
# -*- coding: utf8 -*-
import os

import setuptools

setuptools.setup(
    name="umr",
    version="0.9.159",
    packages=setuptools.find_packages(),
    include_package_data=True,
    zip_safe=False,
    author="Luc & Dan",
    author_email="zeeguu_team@zeeguu.com",
    description="Basic Web Reader for Zeeguu",
    keywords="The reader is a cool module",
    dependency_links=[
        "git+https://github.com/mircealungu/zeeguu-core.git#egg=zeeguu"
    ],
    install_requires=("flask>=0.10.1",
                      "Flask-SQLAlchemy",
                      "Flask-Assets",
                      "cssmin",
                      "zeeguu")
)
