from flask import Flask, render_template, request, make_response, send_from_directory
import article
import requests
import os

ZEEGUU_SERVER = "https://www.zeeguu.unibe.ch/api"
STATUS_ACCEPT = 200

app = Flask(__name__)


@app.route('/favicon.ico')
def get_favicon():
    """Return the favicon icon."""
    return send_from_directory(os.path.join(app.root_path, 'static'), 'images/favicon.ico')


@app.route('/', methods=['GET', 'POST'])
def handle_entry():
    """Handle a Zeeguu Login request on POST, on GET return a login form."""
    if 'sessionID' in request.cookies:
        session = request.cookies.get('sessionID')
        return get_feed_page(session)
    else:
        if request.method == 'POST':
            return handle_login_form()
        else:
            return get_login_form()


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


# Returns a zeeguu enhanced article.
@app.route('/article/', methods=['POST'])
def get_article():
    """Retrieve the supplied article link of the supplied language,
    and return a properly processed version of the article.
    """
    session = request.form['sessionID']
    article_url = request.form['articleURL']
    article_language = request.form['articleLanguage']
    response = requests.get(article_url)
    print "User with session " + session + " retrieved " + article_url
    return article.make_article(session, response.text, article_language)
