from flask import Blueprint, request, render_template
from newspaper import Article

from bs4 import BeautifulSoup as Soup
from .session import with_session
import re
from .umr_blueprint import umrblue
import urllib
from .login import ZEEGUU_SERVER
import requests
import json


WORD_TAG = "zeeguu"


@umrblue.route('/article', methods=['GET'])
@with_session
def get_article():
    """Retrieve the supplied article link of the supplied language,
    and return a properly processed version of the article.
    """

    article_url = request.args['articleURL']

    #return make_article(article_url)
    # ^- commented out; used to be the old way of
    # rendering part of the article content, but now
    # the entire rendering is moved in Javascript...
    # which kind of makes this endpoint obsolete...
    # we should probably keep the template on the
    # serverside in the first place...
    return render_template('article.html', article_url=article_url)


def get_article_info(url):
    encoded_url = urllib.parse.quote_plus(url)
    result = requests.get(ZEEGUU_SERVER + "/user_article?url=" + encoded_url + "&session=" + request.sessionID)
    article_info = json.loads(result.content)
    return article_info

# DEPRECATED
def make_article(url):
    """
    Create a neatly formatted translatable article html page.
    """

    article_info = get_article_info(url)

    title = wrap_zeeguu_words(article_info['title'])
    authors = article_info['authors']
    content = add_paragraphs(article_info['content'])

    content = wrap_zeeguu_words(content)

    # Create our article using Soup.
    soup = Soup(render_template('article.html'),
                'html.parser')
    soup.find('span', {'id': 'articleURL'}).find('a')['href'] = url
    soup.find('div', {'id': 'articleContent'}).append(Soup(content, 'html.parser'))

    if authors:
        soup.find('p', {'id': 'articleInfo'}).append(Soup(' | By: ' + authors, 'html.parser'))

    soup.find('span', {'id': 'articleTitle'}).append(Soup(title, 'html.parser'))

    return str(soup)


# DEPRECATED
def add_paragraphs(text):
    text = "<p>" + text
    text = text.replace('\n\n', '</p><p>')
    return text

# DEPRECATED
def wrap_zeeguu_words(text):
    """Use a regular expression to wrap all words with a Zeeguu tag.
    Keyword arguments:
    text -- html-formatted text
    """
    soup = Soup(text, 'html.parser')
    for text in soup.findAll(text=True):
        word = "([a-zA-Z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF\u0100-\u017F\u0180-\u024F_'’-]+)"
        if re.search(word, text):
            wrapped_text = re.sub(word, '<' + WORD_TAG + '>' + r'\1' + "</" + WORD_TAG + '>', text)
            text.replaceWith(Soup(wrapped_text, 'html.parser'))
    return str(soup)
