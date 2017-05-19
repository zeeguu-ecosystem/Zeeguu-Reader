from flask import render_template
from . import umrblue
from .session import with_session


@umrblue.route('/articles', methods=['GET'])
@with_session
def articles():
    """Return the main page where the articles and feeds are listed."""
    return get_articles_page()


def get_articles_page():
    """Return the template that shows all available articles and feeds."""
    return render_template('articles.html')
