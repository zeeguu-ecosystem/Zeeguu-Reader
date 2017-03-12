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
    };

    this.clear = function()
    {
        $(HTML_ID_ARTICLELINK_LIST).empty();
    };

    /* Remove all articles from the list with 'feedID'. */
    this.remove = function(feedID)
    {
        $('li[articleLinkFeedID="' + feedID + '"]').remove();
    };

    /* Callback function from the zeeguu request.
     * Generates all the article links from a particular feed. */
    function loadArticleLinks(subscriptionData, data)
    {
        var template = $(HTML_ID_ARTICLELINK_TEMPLATE).html();
        for (var i=0; i < data.length; i++)
        {
            var difficulty = Math.round(parseFloat(data[i]['metrics']['difficulty']['normalized']) * 100) / 10;
            var articleLinkData = {
                articleLinkTitle: data[i]['title'],
                articleLinkURL : data[i]['url'],
                articleLinkFeedID : subscriptionData['subscriptionID'],
                articleLinkLanguage : subscriptionData['subscriptionLanguage'],
                articleDifficultyDiscrete: data[i]['metrics']['difficulty']['discrete'],
                articleDifficulty: difficulty
            };
            $(HTML_ID_ARTICLELINK_LIST).append(Mustache.render(template, articleLinkData));
        }
    }
}