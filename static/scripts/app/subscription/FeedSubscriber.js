define(['app/config', 'app/zeeguuRequests', 'mustache', 'jquery'], function (config, zeeguuRequests, Mustache, $) {
    /**
     * Allows the user to add or remove feed subscriptions.
     */
    return function FeedSubscriber(subscriptionList) {
        var currentLanguage = 'nl';

        /* Calls zeeguu and requests recommended feeds for the given 'language'.
         * If the language is not given, it simply uses the last used language. */
        this.load = function (language) {
            language = typeof language !== 'undefined' ? language : currentLanguage;
            zeeguuRequests.requestZeeguuGET(config.RECOMMENDED_FEED_ENDPOINT + '/' + language,
                {session: SESSION_ID}, loadFeedOptions);
            currentLanguage = language;
        };

        this.clear = function () {
            $(config.HTML_ID_ADDSUBSCRIPTION_LIST).empty();
        };

        this.getCurrentLanguage = function () {
            return currentLanguage;
        };

        /* Callback function for zeeguu.
         * Fills the dialog's list with all the addable feeds. */
        function loadFeedOptions(data) {
            var template = $(config.HTML_ID_ADDSUBSCRIPTION_TEMPLATE).html();
            for (var i = 0; i < data.length; i++) {
                var addableData = {
                    addableTitle: data[i]['title'],
                    addableID: data[i]['id'],
                    addableImage: data[i]['image_url']
                };
                var feedOption = $(Mustache.render(template, addableData));
                var subscribeButton = $(feedOption.find(".subscribeButton"));
                subscribeButton.click(function () {
                    follow($(this).parent());
                });
                var feedIcon = $(feedOption.find(".feedIcon"));
                feedIcon.on( "error", function () {
                    $(this).unbind("error").attr("src", "static/images/noAvatar.png");
                });
                $(config.HTML_ID_ADDSUBSCRIPTION_LIST).append(feedOption);
            }
        }

        /* Subscribe to a new feed, calls the zeeguu server.
         * This function is called by an html element.*/
        function follow(feed) {
            var feedID = $(feed).attr('addableID');
            zeeguuRequests.requestZeeguuPOST(config.FOLLOW_FEED_ENDPOINT, {feed_id: feedID}, _.partial(onFeedFollowed, feed));
        }

        /* Callback function for zeeguu.
         * A feed has just been followed, so we refresh the subscription list and remove the
         * mentioned feed from the addable feed list. */
        function onFeedFollowed(feed, data) {
            if (data == "OK") {
                subscriptionList.refresh();
                $(feed).fadeOut();
            }
        }
    };
});