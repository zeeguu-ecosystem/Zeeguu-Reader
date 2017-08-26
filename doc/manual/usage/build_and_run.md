# How to Build and Run
## Sources
All files needed to setup your own version of Zeeguu UMR can be cloned from this repository. The **master** branch contains the latest stable release, whilst **development** contains the in-development version.

## Setting up your development environment
The sources include a small script called `dev_setup.sh`, which you should be able to execute on most UNIX compliant environments. It will try to install the needed packages, after which it will setup a virtual python environment consistent with [virtualenv-wrapper](https://virtualenvwrapper.readthedocs.io) conventions. 

In the case your system does not allow for this shell script to do all the work for you, or you desire a more custom configuration, you should be able to look at the script and perform the listed tasks manually.

## Local deployment
Before deployment, it is important to transpile and bundle our Ecmascript into the necessary entry-point files for Zeeguu UMR to run (refer to the Design documentation for information as to *why* this is done). If you managed to successfully setup your development environment, this should be as simple as running the command `webpack` in the root directory of this repository. The included configuration should take care of the rest.

Local deployment of the Zeeguu UMR system consists of the deployment of a Flask app, which is a relatively straightforward procedure automated in the `dev_launch.sh` script. Executing this script will launch your Flask server on `yourIP:5000`, but this can be easily changed to any IP-address or port you desire.

## Remote deployment
### Heroku
There are many methods and services that allow you to launch Zeeguu UMR on a non-local network, but we chose for the [Heroku Cloud Platform](https://www.heroku.com). It provides a basic free hosting plan that is good enough for development build publishing. In their implementation, you can simply push your code-base to your server-associated repository, and it will be build and executed there automatically. 

If you intend to deploy on this platform as well, the repository has the required *Procfile* already included. In short: it simply runs `dev_launch.py`. The `package.json` is setup to trigger a webpack build call before this script is executed however.

### Flask server
The UMR reader can be build into a library containing the required blueprint by executing `setup.sh sdist` in your terminal from within the `src` folder. The generated `dist` folder will then contain a file called `umr-MAJOR.MINOR.PATCH.tar.gz`. Install this library if you desire to run UMR as part of a bigger Flask application.
