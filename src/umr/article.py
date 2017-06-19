from flask import Blueprint, request, render_template
from newspaper import Article

from bs4 import BeautifulSoup as Soup
from .session import with_session
import re
from .umr_blueprint import umrblue

WORD_TAG = "zeeguu"


@umrblue.route('/article', methods=['GET'])
@with_session
def get_article():
    """Retrieve the supplied article link of the supplied language,
    and return a properly processed version of the article.
    """
    article_url = request.args['articleURL']
    print("User with session " + request.sessionID + " retrieved " + article_url)

    return make_article(article_url, request.args.get('articleLanguage', None), request.args.get('articleStarred', False))


def make_article(url, language=None, starred=False):
    """Create a neatly formatted translatable article html page.
    Keyword arguments:
    url      -- the url of the article
    language -- the language the article is written in
    starred  -- asserts whether article should be pre-starred
    """
    if language:
        article = Article(url=url, language=language)
    else:
        article = Article(url=url)

    article.download()
    article.parse()

    if not language:
        language = article.extractor.language
    
    title   = wrap_zeeguu_words(article.title)
    authors = ', '.join(article.authors)
    content = add_paragraphs(article.text)
    content = wrap_zeeguu_words(content)

    # Create our article using Soup.
    soup = Soup(render_template('article.html', fromLanguage=language), 'html.parser')
    soup.find('span', {'id': 'articleURL'}).find('a')['href'] = url
    soup.find('div', {'id': 'articleContent'}).append(Soup(content, 'html.parser'))

    if authors:
        soup.find('p',   {'id': 'articleInfo'}).append(Soup(' | By: ' + authors, 'html.parser'))
    if starred:
        star_border = soup.find('i', class_="material-icons star")
        star_fill   = soup.find('i', class_="material-icons star off")
        star_border['class'] = 'material-icons star off'
        star_fill['class'] = 'material-icons star'

    soup.find('span', {'id': 'articleTitle'}).append(Soup(title, 'html.parser'))

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
        word = "([a-zA-Z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF\u0100-\u017F\u0180-\u024F_'’-]+)"
        if re.search(word, text):
            wrapped_text = re.sub(word, '<' + WORD_TAG + '>' + r'\1' + "</" + WORD_TAG + '>', text)
            text.replaceWith(Soup(wrapped_text, 'html.parser'))
    return str(soup)
