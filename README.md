# Zeeguu Unified-Multilanguage-Reader :closed_book:

[![Build Status](https://travis-ci.org/zeeguu-ecosystem/Unified-Multilanguage-Reader.svg?branch=master)](https://travis-ci.org/zeeguu-ecosystem/Unified-Multilanguage-Reader)
[![Documentation Coverage](https://zeeguu-ecosystem.github.io/Unified-Multilanguage-Reader/badge.svg)](https://zeeguu-ecosystem.github.io/Unified-Multilanguage-Reader/)

The Zeeguu Unified-Multilanguage-Reader (UMR) is a Python/Javascript-based web application that implements a multilingual article reading and language learning service that can be deployed amoungst multiple platforms (such as android and IOS). It makes use of (and shares ties with) [the Zeeguu API](https://github.com/mircealungu/Zeeguu-API), for which an account can be requested on [the Zeeguu website](https://www.zeeguu.org).

## Authors
Zeeguu UMR is at its core a University project (Rijksuniversiteit Groningen, Netherlands), developed by two students:
- Dan Chirtoaca
- Luc van den Brand

Under the supervision of Dr. Mircea Lungu.

## Licence
The Zeeguu UMR project is open-source according to the definitions of the MIT-Licence.

## Deployment locations.
The deployed version of UMR can be found on:
- **Development:** [Heroku](https://zeeguu-umr.herokuapp.com/debug_login).
- **Master:** [Zeeguu](https://www.zeeguu.unibe.ch/reader/articles).

## Further reading
Most, if not all, of the information regarding this project can be found in our [documentation](https://zeeguu-ecosystem.github.io/Unified-Multilanguage-Reader/). This page documents the master branch, where in-development versions can be read by pulling a specific branch and running `autodoc.sh` to build your own local documentation.
This will cover subjects like:
- Setting up your development environment.
- Architecutre and UI design.
- Dependencies
and more.

As the flask server is quite minimal, we only discuss the client-side code in detail. The python sources should speak for themselves.
