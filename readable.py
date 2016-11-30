from readability import Document
from bs4 import BeautifulSoup as Soup

def makeReadable(messyArticle):
    doc = Document(messyArticle)
    title = doc.title()
    article = doc.summary();
    
    # Modify using soup.
    soup = Soup(article, 'html.parser')
 
    # Insert head.
    soup.find('html').insert(0,soup.new_tag('head')) 
     
    # Set title of the page.
    titleTag = soup.new_tag('title')
    titleTag.append(title);
    soup.find('head').append(titleTag) 
    
     # Add title to document.
    titleTag = soup.new_tag('h2')
    titleTag.append(title);
    soup.find('body').insert(0, titleTag) 

    return unicode(soup)
