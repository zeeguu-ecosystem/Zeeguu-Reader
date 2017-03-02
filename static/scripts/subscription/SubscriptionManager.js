/**
 * Allows the user to add or remove feed subscriptions.
 */
function SubscriptionManager(subscriptionList)
{
    var currentLanguage = 'nl';

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

    this.follow = function(feed)
    {
        var feedID = $(feed).attr('addableID');
        requestZeeguuPOST(FOLLOW_FEED_ENDPOINT, {feed_id : feedID}, _.partial(onFeedFollowed, feed));
    }

    this.unfollow = function(feed)
    {
        var removableID = $(feed).attr('removableID');
        requestZeeguuGET(UNFOLLOW_FEED_ENDPOINT+"/"+removableID, {session : SESSION_ID}, _.partial(onFeedUnfollowed, feed));
    }

    this.getCurrentLanguage = function () {
        return currentLanguage;
    }

    /* Fills the dialog's list with all the addable feeds. */
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

    function onFeedFollowed(feed, data)
    {
        if (data == "OK") {
            subscriptionList.refresh();
            $(feed).fadeOut();
        }
    }

    function onFeedUnfollowed(feed, data)
    {
        if (data == "OK") {
            subscriptionList.remove(feed);
        }
    }
}