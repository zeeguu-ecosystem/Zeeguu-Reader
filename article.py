from flask import render_template
from readability import Document
from bs4 import BeautifulSoup as Soup


def make_article(sessionID, source, language):
    # Create our article using Soup.
    soup = Soup(render_template('article.html', sessionID = sessionID,
                fromLanguage=language), 'html.parser')

    # Insert article at div.
    doc = Document(source)
    soup.find('p', {'id': 'articleTitle'}).append(doc.short_title());
    summary = doc.summary(True)
    summary = remove_images(summary)
    soup.find('div', {'id': 'articleContent'}).append(Soup(summary, 'html.parser'));

    return unicode(soup)


def remove_images(summary):
    soup = Soup(summary, 'html.parser')
    [s.extract() for s in soup(['img', 'hr'])]
    [s.extract() for s in soup(class_=classBlackList)]
    return unicode(soup)

classBlackList = ["wp-caption-text"]