from flask import url_for
from bs4 import BeautifulSoup as Soup

def makeTranslatable(sessionID, content):
    soup = Soup(content, 'html.parser')
 
    #Insert head.
    #soup.find('html').append(soup.new_tag('head'))   

    # Insert jQuery library.
    scriptTag = soup.new_tag('script')
    scriptTag['src'] = 'https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js'
    soup.find('head').append(scriptTag)
    #Insert sessionID.
    scriptTag = soup.new_tag('script')
    scriptTag.append("var sessionID = '" + sessionID +"';")
    soup.find('head').append(scriptTag)
    #Insert translation script.
    scriptTag = soup.new_tag('script')
    scriptTag['src'] = url_for('static', filename='scripts/translation.js')
    soup.find('head').append(scriptTag)
    #Insert custom style.
    linkTag = soup.new_tag('link')
    linkTag['rel'] = 'stylesheet'
    linkTag['type'] = 'text/css'
    linkTag['href'] = url_for('static', filename='styles/article.css')
    soup.find('head').append(linkTag)
    
    return unicode(soup)
