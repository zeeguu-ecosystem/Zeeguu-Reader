# How to Build and Run
## Sources
All files needed to setup your own version of Zeeguu UMR can be cloned from this repository. The **master** branch contains the latest stable release, whilst **development_core** contains the in-development version.

## Setting up your development environment
The sources include a small script called `dev_setup.sh`, which you should be able to execute on most UNIX compliant environments. It will try to install the needed packages, after which it will setup a virtual python environment consistent with [virtualenv-wrapper](https://virtualenvwrapper.readthedocs.io) conventions. 

In the case your system does not allow for this shell script to do all the work for you, or you desire a more custom configuration, you should be able to look at the script and perform the listed tasks manually.

## Local deployment
Local deployment of the Zeeguu UMR system consists of the deployment of a Flask app, which is a relatively straightforward procedure automated in the `dev_launch.sh` script. Executing this script will launch your Flask server on `yourIP:5000`, but this can be easily changed to any IP-address or port you desire.

## Remote deployment
### Heroku
There are many methods and services that allow you to launch Zeeguu UMR on a non-local network, but we chose for the [Heroku Cloud Platform](https://www.heroku.com). It provides a basic free hosting plan that is good enough for development build publishing. In their implementation, you can simply push your code-base to your server-associated repository, and it will be build and executed there automatically. 

If you intend to deploy on this platform as well, the repository has the required *Procfile* already included. In short: it simply launches `zeeguu_umr.py` with [gunicorn](http://gunicorn.org).

### Apache
If you intend to deploy on a WSGI compliant server, we have included a `.wsgi` file which will allow you to do that.
