import functools

import flask
from flask import Flask, render_template, request, make_response, send_from_directory
from flask import redirect
from flask import url_for

import article
import requests
import os

ZEEGUU_SERVER = "https://www.zeeguu.unibe.ch/api"
STATUS_ACCEPT = 200

app = Flask(__name__)


def with_session(view):
    """
    Decorator checks whether a session is available either in
     - as a cookie
     - as a GET or POST parameter
    If it is, it sets the sessionID field on the request object
    which can be used within the decorated functions.

    In case of no session, user is redirected to login form.
    """

    @functools.wraps(view)
    def wrapped_view(*args, **kwargs):

        request.sessionID = None

        if request.args.get('sessionID', None):
            request.sessionID = int(request.args['sessionID'])
        elif 'sessionID' in request.cookies:
            request.sessionID = request.cookies.get('sessionID')
        elif request.form.get('sessionID', None):
            request.sessionID = request.form['sessionID']
        else:
            flask.abort(401)

        return view(*args, **kwargs)

    return wrapped_view


@app.route('/favicon.ico')
def get_favicon():
    """Return the favicon icon."""
    return send_from_directory(os.path.join(app.root_path, 'static'), 'images/favicon.ico')


@app.route('/', methods=['GET', 'POST'])
def handle_entry():
    """Handle a Zeeguu Login request on POST, on GET return a login form."""
    if 'sessionID' in request.cookies:
        return redirect(url_for('articles'))
    if request.method == 'POST':
        return handle_login_form()
    else:
        return get_login_form()


@app.route('/articles', methods=['GET'])
@with_session
def articles():
    """Return the main page where the articles and feeds are listed."""
    return get_feed_page(request.sessionID)


@app.route('/article/', methods=['POST'])
@with_session
def get_article():
    """Retrieve the supplied article link of the supplied language,
    and return a properly processed version of the article.
    """
    session = request.sessionID
    article_url = request.form['articleURL']
    article_language = request.form['articleLanguage']
    response = requests.get(article_url)
    print "User with session " + session + " retrieved " + article_url
    return article.make_article(session, response.text, article_language)


def get_login_form():
    """Return the login form."""
    return render_template('login.html')


def handle_login_form():
    """Send user credentials to Zeeguu and store the session on succes,
    then return the article and feed page.
    On failure to authenticate, return the login form.
    """
    username = request.form['username']
    password = {'password': request.form['password']}
    result = requests.post(ZEEGUU_SERVER+'/session/'+username, password)

    # Check for login success, sends the user back to login or continues.
    if result.status_code == STATUS_ACCEPT:
        session = result.content
        response = make_response(get_feed_page(session))
        response.set_cookie('sessionID', session)
    else:
        response = make_response(get_login_form())
    return response


def get_feed_page(session):
    """Return the template that shows all available articles and feeds."""
    return render_template('feedlist.html', sessionID=session)

