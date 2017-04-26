define(['app/config', 'app/zeeguuRequests', 'mustache', 'underscore'],
        function (config, zeeguuRequests, Mustache, _) {
    /**
     * Manages a list of articles that can be viewed.
     */
    return function ArticleList() {
        /* Call zeeguu and get the articles for the given feed 'subscription'. */
        this.load = function (subscription) {
            $(config.HTML_CLASS_LOADER).show();
            zeeguuRequests.requestZeeguuGET(config.GET_FEED_ITEMS + '/' + subscription['subscriptionID'],
                {}, _.partial(loadArticleLinks, subscription));
        };

        this.clear = function () {
            $(config.HTML_ID_ARTICLELINK_LIST).empty();
        };

        /* Remove all articles from the list with 'feedID'. */
        this.remove = function (feedID) {
            $('li[articleLinkFeedID="' + feedID + '"]').remove();
        };

        /* Callback function from the zeeguu request.
         * Generates all the article links from a particular feed. */
        function loadArticleLinks(subscriptionData, data) {
            var template = $(config.HTML_ID_ARTICLELINK_TEMPLATE).html();
            for (var i = 0; i < data.length; i++) {
                var difficulty = Math.round(parseFloat(data[i]['metrics']['difficulty']['normalized']) * 100) / 10;
                var articleLinkData = {
                    articleLinkTitle: data[i]['title'],
                    articleLinkURL: data[i]['url'],
                    articleLinkFeedID: subscriptionData['subscriptionID'],
                    articleLinkLanguage: subscriptionData['subscriptionLanguage'],
                    articleDifficultyDiscrete: data[i]['metrics']['difficulty']['discrete'],
                    articleDifficulty: difficulty
                };
                $(config.HTML_ID_ARTICLELINK_LIST).append(Mustache.render(template, articleLinkData));
            }
            $(config.HTML_CLASS_LOADER).fadeOut('slow');
        }
    };
});
