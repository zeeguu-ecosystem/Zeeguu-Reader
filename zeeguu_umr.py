import os
import requests

from flask import Flask, render_template, request, make_response, send_from_directory
from flask import redirect
from flask import url_for
from session import with_session
from article import article_page

ZEEGUU_SERVER = "https://www.zeeguu.unibe.ch/api"
STATUS_ACCEPT = 200

app = Flask(__name__)
app.register_blueprint(article_page)


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
    return get_articles_page(request.sessionID)


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
        response = make_response(get_articles_page(session))
        response.set_cookie('sessionID', session)
    else:
        response = make_response(get_login_form())
    return response


def get_articles_page(session):
    """Return the template that shows all available articles and feeds."""
    return render_template('articles.html', sessionID=session)

