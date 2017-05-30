#!/usr/bin/env python
# -*- coding: utf8 -*-
from setuptools import setup, find_packages
from setuptools.command.bdist_egg import bdist_egg as _bdist_egg
from subprocess import check_call
import os

class InstallWithWebpack(_bdist_egg):
    def run(self):
        check_call("webpack", cwd='../')
        _bdist_egg.run(self)

setup(
    cmdclass={'easy_install': InstallWithWebpack},
    name="umr",
    version="0.5",
    packages=find_packages(),
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
