from flask import render_template 

class FeedEntry:
     def __init__(self, title, url):
            self.title = title
            self.url = url

# Display a list of articles to be read.
def getFeed(sessionID):
    # Dummy articles, needs to retrieve this from zeeguu.
    entries = [FeedEntry('Casio komt met nieuwe Smartwatch', 'https://www.wearablesmagazine.nl/2017/01/casio-voorziet-wsd-f20-smartwatch-gps-functie-en-android-wear-2-0/'), FeedEntry('Donald Trump goede relatie Russen', 'http://www.groningerkrant.nl/2017/01/donald-trump-vindt-goede-relatie-russen-positief/')]
    return render_template('feedlist.html', sessionID=sessionID, entries=entries);
