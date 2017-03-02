/**
 * Manages a list of articles that can be viewed.
 */
function ArticleList()
{
    /* Call zeeguu and get the articles for the given feed 'subscription'. */
    this.load = function(subscription)
    {
        requestZeeguuGET(GET_FEED_ITEMS + '/' + subscription['subscriptionID'],
            {session : SESSION_ID}, _.partial(loadArticleLinks, subscription));
    }

    this.clear = function()
    {
        $(HTML_ID_ARTICLELINK_LIST).empty();
    }

    /* Remove all articles from the list with 'feedID'. */
    this.remove = function(feedID)
    {
        $('li[articleLinkFeedID="' + feedID + '"]').remove();
    }

    /* Callback function from the zeeguu request.
     * Generates all the article links from a particular feed. */
    function loadArticleLinks(subscriptionData, data)
    {
        var template = $(HTML_ID_ARTICLELINK_TEMPLATE).html();
        for (var i=0; i < data.length; i++) {
            var articleLinkData = {
                articleLinkTitle: data[i]['title'],
                articleLinkURL : data[i]['url'],
                articleLinkFeedID : subscriptionData['subscriptionID'],
                articleLinkLanguage : subscriptionData['subscriptionLanguage'],
                articleDifficulty: data[i]['difficulty']
            }
            $(HTML_ID_ARTICLELINK_LIST).append(Mustache.render(template, articleLinkData));
        }
    }
}