from flask import render_template 
from readability import Document
from bs4 import BeautifulSoup as Soup

def makeArticle(source):
    # Allow readability to parse the source.
    doc = Document(source)    
    
    # Create our article using Soup.
    soup = Soup(render_template('article.html'), 'html.parser')
     
    # Insert article at div.
    soup.find('div', {'id': 'articleTitle'}).append(doc.title());
    soup.find('div', {'id': 'articleContent'}).append(Soup(doc.summary(True), 'html.parser'));

    return unicode(soup)
