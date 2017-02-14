from flask import Flask, render_template, request, make_response, send_from_directory
import article
import requests
import os

ZEEGUU_SERVER = "https://www.zeeguu.unibe.ch"
STATUS_WRONGUSER  = 401; STATUS_WRONGPASS = 400; STATUS_ACCEPT = 200;

app = Flask(__name__)

@app.route('/favicon.ico')
def getFavicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'images/favicon.ico')

# Main entrypoint, asks the user to login before continuing.
@app.route('/', methods=['GET', 'POST'])
def handleEntry():
    if 'sessionID' in request.cookies:
        sessionID = request.cookies.get('sessionID')
        return getFeedList(sessionID)
    else:
        if request.method == 'POST':
            return handleLoginForm()
        else:
            return getLoginForm()

# Ask the user to fill in login credentials.
def getLoginForm():
    return render_template('login.html')

# Handle login request.
def handleLoginForm():
    username = request.form['username']
    password = {'password' : request.form['password']}
    result = requests.post(ZEEGUU_SERVER+'/session/'+username, password)

    # Check for login succces, sends the user back to login or continues.
    if (result.status_code == STATUS_ACCEPT):
        sessionID = result.content
        response = make_response(getFeedList(sessionID))
        response.set_cookie('sessionID', sessionID)
    else:
	response = make_response(getLoginForm())
    return response;

# Return the main page where the articles and feeds are listed.
def getFeedList(sessionID):
    return render_template('feedlist.html', sessionID=sessionID)

# Returns a zeeguu enhanced article.
@app.route('/article', methods=['GET'])
def getArticle():
    sessionID  = request.args.get('sessionID')
    articleURL = request.args.get('articleURL')
    articleLanguage = request.args.get('articleLanguage')
    response = requests.get(articleURL)
    print "User with session " + sessionID + " retrieved " + articleURL;
    return article.makeArticle(sessionID, response.text, articleLanguage)
