from flask import render_template
from readability import Document
from bs4 import BeautifulSoup as Soup

def makeArticle(sessionID, source, language):
    # Create our article using Soup.
    soup = Soup(render_template('article.html', sessionID = sessionID,
                fromLanguage=language), 'html.parser')

    # Insert article at div.
    doc = Document(source)
    soup.find('p', {'id': 'articleTitle'}).append(doc.short_title());
    summary = doc.summary(True)
    summary = removeImages(summary)
    soup.find('div', {'id': 'articleContent'}).append(Soup(summary, 'html.parser'));

    return unicode(soup)

def removeImages(summary):
    soup = Soup(summary, 'html.parser')
    [s.extract() for s in soup(['img', 'hr'])]
    [s.extract() for s in soup(class_=classBlackList)]
    return unicode(soup)

classBlackList = ["wp-caption-text"]
