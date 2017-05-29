# Zeeguu Unified-Multilanguage-Reader
[![Build Status](https://travis-ci.org/mircealungu/Unified-Multilanguage-Reader.svg?branch=development_core)](https://travis-ci.org/mircealungu/Unified-Multilanguage-Reader)

The Zeeguu Unified-Multilanguage-Reader (UMR) is a mostly Javascript-based web application that implements a multilingual article reading and language learning service that can be deployed amoungst multiple platforms (such as android and IOS). It makes use of (and shares ties with) [the Zeeguu API](https://github.com/mircealungu/Zeeguu-API), for which an account can be requested on [the Zeeguu website](https://www.zeeguu.unibe.ch).

The required files to run this application locally are delivered trough the endpoints of a Python based [Flask](http://flask.pocoo.org) REST service. In particular, when a web article is requested from this Flask server, it will perform the following modifications before returning this article with our documented Javascript.

- Format the article into a neatly readable format.
- Wrap all words with a Zeeguu tag.

## This documentation
![Documentation Coverage](badge.svg)

...should cover most of what you will find in the associated repository [here](https://github.com/mircealungu/Unified-Multilanguage-Reader). As the Flask server is quite minimal, this document will only discuss the client-side code in detail. The python sources should speak for themselves. Thus, this document descibes the javascript files served to the user's browser as part of a reply to certain REST calls, whilst also touching on the architecture and requirements of the entire project in general.

At the top of this document you will find the three important tabs:

- **Reference:** a neat overfiew of all packages, methods, and classes. Here we discribe what they do and how they relate.
- **Manual:** a description of the project from a requirements and architecture point of view, along with more practical information meant to get new contributors up and running with the sources.
- **Source:** a listing of all source files, for those curious to see the specific implementation of certain pieces of code.

## Licence
The Zeeguu UMR project is open-source according to the definitions of the MIT-Licence.

## Authors
Zeeguu UMR is at its core a University project ([Rijksuniversiteit Groningen](http://www.rug.nl), Netherlands), developed by two students:

[![ Dan Chirtoaca](https://avatars1.githubusercontent.com/DanChirtoaca?s=32)](https://github.com/DanChirtoaca) Dan Chirtoaca,
[![Luc van den Brand](https://avatars1.githubusercontent.com/Lukeslux?s=32)](https://github.com/Lukeslux) Luc van den Brand.

Under the supervision of : [![Mircea Lungu](https://avatars1.githubusercontent.com/mircealungu?s=32)](https://github.com/MirceaLungu) Dr. Mircea Lungu.