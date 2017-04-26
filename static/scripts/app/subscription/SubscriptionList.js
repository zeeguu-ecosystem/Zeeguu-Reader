define(['app/config', 'app/zeeguuRequests', 'mustache'], function (config, zeeguuRequests, Mustache) {
    /**
     * Shows a list of all subscribed feeds, and updates the article list accordingly.
     */
    return function SubscriptionList(articleList) {
        /* Call zeeguu and retrieve all currently subscribed feeds. */
        this.load = function () {
            zeeguuRequests.requestZeeguuGET(config.GET_FEEDS_BEING_FOLLOWED, {}, loadSubscriptions);
        };

        this.clear = function () {
            $(config.HTML_ID_SUBSCRIPTION_LIST).empty();
            articleList.clear();
        };

        this.refresh = function () {
            // Refresh the feed list.
            this.clear();
            this.load();
        };

        /* Remove a mentioned feed from the local list (not from the zeeguu list).
         * Makes sure the associated articles are removed as well by notifying articleList. */
        this.remove = function (feedNode) {
            articleList.remove($(feedNode).attr('removableID'));
            $(feedNode).fadeOut();
        };

        /* Callback function for the zeeguu request.
         * Fills the subscription list with all the subscribed feeds,
         * and makes a call to articleList in order to load the feed's associated articles. */
        function loadSubscriptions(data) {
            var template = $(config.HTML_ID_SUBSCRIPTION_TEMPLATE).html();
            for (var i = 0; i < data.length; i++) {
                var subscriptionData = {
                    subscriptionTitle: data[i]['title'],
                    subscriptionID: data[i]['id'],
                    subscriptionLanguage: data[i]['language']
                };
                $(config.HTML_ID_SUBSCRIPTION_LIST).append(Mustache.render(template, subscriptionData));
                articleList.load(subscriptionData);
            }
        }
    };
});