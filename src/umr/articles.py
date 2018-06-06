from flask import render_template
from . import umrblue
from .session import with_session


@umrblue.route('/', methods=['GET'])
@with_session
def articles():
    """Return the main page where the articles and feeds are listed."""

    return render_template('articles.html',)
