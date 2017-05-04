from flask import Flask, render_template, request, make_response, send_from_directory
import article
import requests
import os

ZEEGUU_SERVER = "https://zeeguu.unibe.ch/api"
STATUS_ACCEPT = 200

app = Flask(__name__)


@app.route('/favicon.ico')
def get_favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'images/favicon.ico')


# Main entry-point, asks the user to login before continuing.
@app.route('/', methods=['GET', 'POST'])
def handle_entry():
    if 'sessionID' in request.cookies:
        session = request.cookies.get('sessionID')
        return get_feed_page(session)
    else:
        if request.method == 'POST':
            return handle_login_form()
        else:
            return get_login_form()


# Ask the user to fill in login credentials.
def get_login_form():
    return render_template('login.html')


# Handle login request.
def handle_login_form():
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


# Return the main page where the articles and feeds are listed.
def get_feed_page(session):
    return render_template('feedlist.html', sessionID=session)


# Returns a zeeguu enhanced article.
@app.route('/article/', methods=['POST'])
def get_article():
    session = request.form['sessionID']
    article_url = request.form['articleURL']
    article_language = request.form['articleLanguage']
    response = requests.get(article_url)
    print "User with session " + session + " retrieved " + article_url
    return article.make_article(session, response.text, article_language)
