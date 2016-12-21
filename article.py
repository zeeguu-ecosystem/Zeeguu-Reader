from flask import render_template 
from readability import Document
from bs4 import BeautifulSoup as Soup

def makeArticle(sessionID, source):    
    # Create our article using Soup.
    soup = Soup(render_template('article.html', sessionID = sessionID), 'html.parser')
     
    # Insert article at div.
    doc = Document(source)    
    soup.find('p', {'id': 'articleTitle'}).append(doc.title());
    soup.find('div', {'id': 'articleContent'}).append(Soup(doc.summary(True), 'html.parser'));

    return unicode(soup)
