import requests
from flask import Blueprint, request, render_template, redirect, url_for, make_response
from .articles import  get_articles_page

ZEEGUU_SERVER = "https://zeeguu.unibe.ch/api"
STATUS_ACCEPT = 200

endpoints_login = Blueprint('endpoints_login', __name__, template_folder='templates')


@endpoints_login.route('/debug_login', methods=['GET', 'POST'])
def handle_entry():
    """Handle a Zeeguu Login request on POST, on GET return a login form."""
    if 'sessionID' in request.cookies:
        return redirect(url_for('endpoints_articles.articles'))
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
        response = make_response(get_articles_page())
        response.set_cookie('sessionID', session)
    else:
        response = make_response(get_login_form())
    return response
