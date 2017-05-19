from flask import Blueprint, request, render_template
from newspaper import Article

from bs4 import BeautifulSoup as Soup
from session import with_session
import re

WORD_TAG = "zeeguu"

endpoints_article = Blueprint('endpoints_article', __name__, template_folder='templates')


@endpoints_article.route('/article', methods=['GET'])
@with_session
def get_article():
    """Retrieve the supplied article link of the supplied language,
    and return a properly processed version of the article.
    """
    article_url = request.args['articleURL']
    article_language = request.args['articleLanguage']
 
    print("User with session " + request.sessionID + " retrieved " + article_url)
    return make_article(article_url, article_language)


def make_article(url, language):
    """Create a neatly formatted translatable article html page.
    Keyword arguments:
    session  -- a valid Zeeguu session key
    url      -- the url of the article
    language -- the language the article is written in
    """
    article = Article(url=url, language=language)
    article.download()
    article.parse()

    title   = wrap_zeeguu_words(article.title)
    content = article.text
    content = add_paragraphs(content)
    content = wrap_zeeguu_words(content)

    # Create our article using Soup.
    soup = Soup(render_template('article.html', fromLanguage=language), 'html.parser')
    soup.find('div', {'id': 'articleContent'}).append(Soup(content, 'html.parser'))
    soup.find('p',   {'id': 'articleTitle'}).append(Soup(title, 'html.parser'))
    soup.find('p',   {'id': 'articleURL'}).append(Soup(url, 'html.parser'))

    return str(soup)


def add_paragraphs(text):
    text = "<p>" + text
    text = text.replace('\n\n', '</p><p>')
    return text


def wrap_zeeguu_words(text):
    """Use a regular expression to wrap all words with a Zeeguu tag.
    Keyword arguments:
    text -- html-formatted text
    """
    soup = Soup(text, 'html.parser')
    for text in soup.findAll(text=True):
        word = "([a-zA-Z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF\u0100-\u017F\u0180-\u024F_'-]+)"
        if re.search(word, text):
            wrapped_text = re.sub(word, '<' + WORD_TAG + '>' + r'\1' + "</" + WORD_TAG + '>', text)
            text.replaceWith(Soup(wrapped_text, 'html.parser'))
    return str(soup)
