/**
 * Allows the user to add or remove feed subscriptions.
 */
function SubscriptionManager(subscriptionList)
{
    var currentLanguage = 'nl';

    /* Calls zeeguu and requests recommended feeds for the given 'language'.
     * If the language is not given, it simply uses the last used language. */
    this.load = function(language) {
        language = typeof language !== 'undefined' ? language : currentLanguage;
        requestZeeguuGET(RECOMMENDED_FEED_ENDPOINT + '/' + language,
            {session: SESSION_ID}, loadFeedOptions);
        currentLanguage = language;
    }

    this.clear = function ()
    {
        $(HTML_ID_ADDSUBSCRIPTION_LIST).empty();
    }

    /* Subscribe to a new feed, calls the zeeguu server.
     * This function is called by an html element.*/
    this.follow = function(feed)
    {
        var feedID = $(feed).attr('addableID');
        requestZeeguuPOST(FOLLOW_FEED_ENDPOINT, {feed_id : feedID}, _.partial(onFeedFollowed, feed));
    }

    /* Un-subscribe from a feed, calls the zeeguu server.
     * This function is called bu an html element. */
    this.unfollow = function(feed)
    {
        var removableID = $(feed).attr('removableID');
        requestZeeguuGET(UNFOLLOW_FEED_ENDPOINT+"/"+removableID, {session : SESSION_ID}, _.partial(onFeedUnfollowed, feed));
    }

    this.getCurrentLanguage = function () {
        return currentLanguage;
    }

    /* Callback function for zeeguu.
     * Fills the dialog's list with all the addable feeds. */
    function loadFeedOptions(data)
    {
        var template = $(HTML_ID_ADDSUBSCRIPTION_TEMPLATE).html();
        for (var i=0; i < data.length; i++) {
            var addableData = {
                addableTitle: data[i]['title'],
                addableID: data[i]['id'],
                addableImage : data[i]['image_url']
            }
            $(HTML_ID_ADDSUBSCRIPTION_LIST).append(Mustache.render(template, addableData));
        }
    }

    /* Callback function for zeeguu.
     * A feed has just been followed, so we refresh the subscription list and remove the
     * mentioned feed from the addable feed list. */
    function onFeedFollowed(feed, data)
    {
        if (data == "OK") {
            subscriptionList.refresh();
            $(feed).fadeOut();
        }
    }

    /* Callback function for zeeguu.
     * A feed has just been removed, so we remove the mentioned feed from the
     * subscription list. */
    function onFeedUnfollowed(feed, data)
    {
        if (data == "OK") {
            subscriptionList.remove(feed);
        }
    }
}