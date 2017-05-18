# Dependencies
Just like almost any other piece of code, it does not exist in isolation. Our project stands on the shoulders of giants, of we will discuss the biggest ones below (some dependencies require other dependencies, these are not mentioned).

## Python
You can find a listing of **all** dependencies in our `requirements.txt` file. We use Python 3.6 in order to make use of the latest advancements in the dependencies we use (for example, Newspaper for Python 2 is depricated and does not parse webpages as well).

### Flask
A framework was needed to allow us to run a [RESTful](https://en.wikipedia.org/wiki/Representational_state_transfer) server in Python. We decided on using the [Flask microframework](http://flask.pocoo.org/) for its comprehensability, simplicity and its active community supporting it. Furthermore, it allows us to share and reuse code more easily between other services of Zeeguu which also implement most of their functionality using Flask.

Flask (originally created as [an april-fools joke](http://lucumr.pocoo.org/2010/4/3/april-1st-post-mortem/)) is, as of this moment in writing, the most popular Python web development framework on GitHub. 

### Newspaper
We use the [Newspaper](https://newspaper.readthedocs.io/en/latest/) library in order to intelligently filter cluttered web-pages and extract only the important parts: the title and the content.

### Beautifulsoup
[Beautifulsoup](https://www.crummy.com/software/BeautifulSoup/) gives us the ability to easily query and modify elements of HTML on the server, which is needed in order to wrap words with the Zeeguu tag.

### Pytest
[Pytest](https://docs.pytest.org/en/latest/) is a widely adopted testing framework for python. It's more simple and elegant than the build-in testing tools Python provides (decreasing the chance of bugs in our bug-testing tools).

### Gunicorn
[Gunicorn](http://gunicorn.org/) is only used on the Heroku server. It allows it to handle multiple users concurrently.

## Javascript
You can find a listing of **all** dependencies in our `package.json` file.
### MDL
We use the [Material Design Lite](https://getmdl.io/started/) (MDL) library to allow for cross-device Material Design styled web pages. These pages gracefully degrade in older browsers. MDL is very light weight, runs locally, and does not rely on any javascript frameworks.

### NodeJS
[NodeJS](https://nodejs.org/en/) is used to manage our dependencies and keeping everyting up-to-date. The `package.json` file lists these dependencies (where we define a difference between release and development requirements).

### WebPack
[Webpack](https://webpack.js.org/), as discussed earlier, allows us to transpile our Ecmascript 2015 code to backwards-compatible Javascript whilst minifying and compining the modules into neat and efficient files.

### Dialog Polyfill
[Dialog Polyfill](https://github.com/GoogleChrome/dialog-polyfill) fixes dialog window support for browsers that do not have it, such as Firefox.

### Mustache
[Mustache](https://mustache.github.io) is a template rendering library. Templates can be reused to adaptivly modify the content of our pages based on user feedback. For example, we use it to generate the list of available articles.
