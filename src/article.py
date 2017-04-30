from flask import Blueprint, request, render_template
from readability import Document
from bs4 import BeautifulSoup as Soup
from session import with_session
import re
import requests

WORD_TAG = "zeeguu"

endpoints_article = Blueprint('endpoints_article', __name__, template_folder='templates')


@endpoints_article.route('/article', methods=['POST'])
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
    return make_article(session, response.text, article_language)


def make_article(session, source, language):
    """Create a neatly formatted translatable article html page.

    Keyword arguments:
    session  -- a valid Zeeguu session key
    source   -- the article text to format
    language -- the language the article is written in
    """
    # Create our article using Soup.
    soup = Soup(render_template('article.html', sessionID=session, fromLanguage=language), 'html.parser')

    # Insert article at div.
    doc = Document(source)
    title = wrap_zeeguu_words(doc.short_title())
    content = doc.summary(True)
    content = remove_images(content)
    content = wrap_zeeguu_words(content)
    soup.find('div', {'id': 'articleContent'}).append(Soup(content, 'html.parser'))
    soup.find('p', {'id': 'articleTitle'}).append(Soup(title, 'html.parser'))

    return unicode(soup)


def remove_images(summary):
    """Remove images and related classes by use of a blacklist.

    Keyword arguments:
    summary -- html-formatted text
    """
    css_class_blacklist = ["wp-caption-text"]
    soup = Soup(summary, 'html.parser')
    [s.extract() for s in soup(['img', 'hr'])]
    [s.extract() for s in soup(class_=css_class_blacklist)]
    return unicode(soup)


def wrap_zeeguu_words(text):
    """Use a regular expression to wrap all words with a Zeeguu tag.

    Keyword arguments:
    text -- html-formatted text
    """
    soup = Soup(text, 'html.parser')
    for text in soup.findAll(text=True):
        word = ur'([a-zA-Z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF\u0100-\u017F\u0180-\u024F_-]+)'
        if re.search(word, text):
            wrapped_text = re.sub(word, '<' + WORD_TAG + '>' + r'\1' + "</" + WORD_TAG + '>', text)
            text.replaceWith(Soup(wrapped_text, 'html.parser'))
    return unicode(soup)
