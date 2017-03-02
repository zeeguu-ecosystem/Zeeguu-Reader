/**
 * Manages a list of articles that can be viewed.
 */
function ArticleList()
{
    this.load = function(subscription)
    {
        requestZeeguuGET(GET_FEED_ITEMS + '/' + subscription['subscriptionID'],
            {session : SESSION_ID}, _.partial(loadArticleLinks, subscription));
    }

    this.clear = function()
    {
        $(HTML_ID_ARTICLELINK_LIST).empty();
    }

    this.remove = function(feedID)
    {
        $('li[articleLinkFeedID="' + feedID + '"]').remove();
    }

    /* Loads all the article links from a particular feed. */
    function loadArticleLinks(subscriptionData, data)
    {
        var template = $(HTML_ID_ARTICLELINK_TEMPLATE).html();
        for (var i=0; i < data.length; i++) {
            var articleLinkData = {
                articleLinkTitle: data[i]['title'],
                articleLinkURL : data[i]['url'],
                articleLinkFeedID : subscriptionData['subscriptionID'],
                articleLinkLanguage : subscriptionData['subscriptionLanguage']
            }
            $(HTML_ID_ARTICLELINK_LIST).append(Mustache.render(template, articleLinkData));
        }
    }
}