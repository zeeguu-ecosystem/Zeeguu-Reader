define(['app/config', 'app/zeeguuRequests', 'mustache', 'jquery'], function (config, zeeguuRequests, Mustache, $) {
    /**
     * Shows a list of all subscribed feeds, and updates the article list accordingly.
     */
    return function SubscriptionList(articleList) {
        var feedList = new Set(); 

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
                var subscription = $(Mustache.render(template, subscriptionData));
                var removeButton = $(subscription.find(".removeButton"));
                removeButton.click(function() {
                    unfollow($(this).parent());
                });
                $(config.HTML_ID_SUBSCRIPTION_LIST).append(subscription);
                articleList.load(subscriptionData);
            }
        }

        /* Un-subscribe from a feed, calls the zeeguu server.
         * This function is called bu an html element. */
        function unfollow(feed) {
            var removableID = $(feed).attr('removableID');
            zeeguuRequests.requestZeeguuGET(config.UNFOLLOW_FEED_ENDPOINT + "/" + removableID,
                                            {session: SESSION_ID}, _.partial(onFeedUnfollowed, feed));
        }

        /* Callback function for zeeguu.
         * A feed has just been removed, so we remove the mentioned feed from the
         * subscription list. */
        function onFeedUnfollowed(feed, data) {
            if (data == "OK") {
                remove(feed);
            }
        }

        /* Remove a mentioned feed from the local list (not from the zeeguu list).
         * Makes sure the associated articles are removed as well by notifying articleList. */
        function remove(feedNode) {
            articleList.remove($(feedNode).attr('removableID'));
            $(feedNode).fadeOut();
        }
    };
});