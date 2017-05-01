from flask import Blueprint, request, render_template
from session import with_session

endpoints_articles = Blueprint('endpoints_articles', __name__, template_folder='templates')


@endpoints_articles.route('/articles', methods=['GET'])
@with_session
def articles():
    """Return the main page where the articles and feeds are listed."""
    return get_articles_page(request.sessionID)


def get_articles_page(session):
    """Return the template that shows all available articles and feeds."""
    return render_template('articles.html', sessionID=session)
