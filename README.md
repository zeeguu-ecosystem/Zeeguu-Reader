# Zeeguu Unified-Multilanguage-Reader :closed_book:

The Zeeguu Unified-Multilanguage-Reader (UMR) is a Python-based web application that implements a multilingual article reading and language learning service that can be deployed amoungst multiple platforms (such as android and IOS). It makes use of (and shares ties with) [the Zeeguu API](https://github.com/mircealungu/Zeeguu-API), for which an account can be requested on [the Zeeguu website](https://www.zeeguu.unibe.ch).

The core system is a Flask based REST service. When a web article is requested from this system, it will perform the following modifications before returning this article:
- Format the article into a neatly readable form.
- Insert zeeguu javascript that allows users to translate words.

## How to Build and Run
### Sources
All files needed to setup your own version of Zeeguu UMR can be cloned from this repository. The **master** branch contains the latest stable release, whilst **development_core** contains the in-development version.

### Setting up your development environment
The sources include a small script called *dev_setup.sh*, which you should be able to execute on most UNIX compliant environments. It will try to install the needed packages, after which it will setup a virtual python environment consistent with [virtualenv-wrapper](https://virtualenvwrapper.readthedocs.io) conventions. 

In the case your system does not allow for this shell script to do all the work for you, or you desire a more custom configuration, you should be able to look at the script and perform the listed tasks manually.

### Local deployment
Local deployment of the Zeeguu UMR system consists of the deployment of a Flask app, which is a relatively straightforward procedure automated in the *zeeguu_umr.sh* script. Executing this script will launch your Flask server on *0.0.0.0:8800*, but this can be easily changed to any IP-address or port you desire.

### Remote deployment
There are many methods and services that allow you to launch Zeeguu UMR on a non-local network, but we chose for the [Heroku Cloud Platform](https://www.heroku.com). It provides a basic free hosting plan that is good enough for development build publishing, and it is easily upgradable should a more publicly available release be desired. In their implementation, you can simply push your code-base to your server-associated repository, and it will be build and executed there automatically. 

If you intend to deploy on this platform as well, the repository has the required *Procfile* already included. Make sure you describe *zeeguu_umr.py* as the flask executable in the required environment variable.

## Authors
Zeeguu UMR is at its core a University project (Rijksuniversiteit Groningen, Netherlands), developed by two students:
- Dan Chirtoaca
- Luc van den Brand

Under the supervision of Dr. Mircea Lungu.

## Licence
The Zeeguu UMR project is open-source according to the definitions of the MIT-Licence.

## Acknowledgments
Many thanks to the creators of the following libraries and frameworks, on which our project depends heavily. From where we stand their shoulders are truly giant.
- [Flask](http://flask.pocoo.org/)
- [Beautiful Soup](https://www.crummy.com/software/BeautifulSoup/)
- [Readability](https://github.com/timbertson/python-readability)
- [MDL](https://getmdl.io)
- [Moustache.js](https://github.com/janl/mustache.js)
- [Underscore.js](http://underscorejs.org/)
