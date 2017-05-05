# Zeeguu Unified-Multilanguage-Reader
[![Build Status](https://travis-ci.org/mircealungu/Unified-Multilanguage-Reader.svg?branch=development_core)](https://travis-ci.org/mircealungu/Unified-Multilanguage-Reader)

The Zeeguu Unified-Multilanguage-Reader (UMR) is a Python-based web application that implements a multilingual article reading and language learning service that can be deployed amoungst multiple platforms (such as android and IOS). It makes use of (and shares ties with) [the Zeeguu API](https://github.com/mircealungu/Zeeguu-API), for which an account can be requested on [the Zeeguu website](https://www.zeeguu.unibe.ch).

The core system is a Flask based REST service. When a web article is requested from this system, it will perform the following modifications before returning this article:
- Format the article into a neatly readable form.
- Insert zeeguu javascript that allows users to translate words.

## Client-side code documentation
![Documentation Coverage](badge.svg)

This document descibes the client side of the application, the javascript files served to the user's browser as part of a reply to certain REST calls.

## Features
- Allow the user to manage their RSS feeds.
- Provide the user with a list of suggested articles.
- Allow the user with translation tools for these articles.

## Authors
Zeeguu UMR is at its core a University project (Rijksuniversiteit Groningen, Netherlands), developed by two students:
- Dan Chirtoaca
- Luc van den Brand

Under the supervision of Dr. Mircea Lungu.

## Licence
The Zeeguu UMR project is open-source according to the definitions of the MIT-Licence.

# Dependencies.
All javascript dependencies are listed in our package.js file on our repository, which can
be used to easily setup your development environment.
