from flask import Flask, render_template, request, make_response, send_from_directory
import article
import requests
import os

ZEEGUU_SERVER = "https://www.zeeguu.unibe.ch/api"
STATUS_ACCEPT = 200;

app = Flask(__name__)


@app.route('/favicon.ico')
def get_favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'images/favicon.ico')


# Main entry-point, asks the user to login before continuing.
@app.route('/', methods=['GET', 'POST'])
def handle_entry():
    if 'sessionID' in request.cookies:
        sessionID = request.cookies.get('sessionID')
        return get_feed_page(sessionID)
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
    password = {'password' : request.form['password']}
    result = requests.post(ZEEGUU_SERVER+'/session/'+username, password)

    # Check for login success, sends the user back to login or continues.
    if result.status_code == STATUS_ACCEPT:
        sessionID = result.content
        response = make_response(get_feed_page(sessionID))
        response.set_cookie('sessionID', sessionID)
    else:
        response = make_response(get_login_form())
    return response;


# Return the main page where the articles and feeds are listed.
def get_feed_page(sessionID):
    return render_template('feedlist.html', sessionID=sessionID)


# Returns a zeeguu enhanced article.
@app.route('/article/', methods=['POST'])
def get_article():
    sessionID  = request.form['sessionID']
    articleURL = request.form['articleURL']
    articleLanguage = request.form['articleLanguage']
    response = requests.get(articleURL)
    print "User with session " + sessionID + " retrieved " + articleURL;
    return article.make_article(sessionID, response.text, articleLanguage)
