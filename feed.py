from flask import render_template 
from zeeguuRequests import requestZeeguuGet
import json

class FeedEntry:
     def __init__(self, title, identifier):
            self.title = title
            self.identifier = identifier

class ArticleEntry:
     def __init__(self, title, url):
            self.title = title
            self.url = url

# Display a list of articles to be read.
def getFeed(sessionID):
    jsonFeeds = json.loads(requestZeeguuGet('get_feeds_being_followed', sessionID))
    feeds = []
    articles = []
    for feed in jsonFeeds:
	feeds += [FeedEntry(feed['title'], feed['id'])]
        #jsonArticles = json.loads(requestZeeguuGet('get_feed_items/'+str(feed['id']),sessionID));
        #for article in jsonArticles:
	    #articles += [ArticleEntry(article['title'], article['url'])]

    return render_template('feedlist.html', sessionID=sessionID, articles=articles, feeds=feeds);
