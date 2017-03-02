/**
 * Shows a list of all subscribed feeds, and updates the article list accordingly.
 */
function SubscriptionList(articleList)
{
    this.load = function ()
    {
        requestZeeguuGET(GET_FEEDS_BEING_FOLLOWED, {session : SESSION_ID}, loadSubscriptions);
    }

    this.clear = function()
    {
        $(HTML_ID_SUBSCRIPTION_LIST).empty();
        articleList.clear();
    }

    this.refresh = function() {
        // Refresh the feed list.
        this.clear();
        this.load();
    }

    this.remove = function(feedNode)
    {
        articleList.remove($(feedNode).attr('removableID'));
        $(feedNode).fadeOut();
    }

    /* Fills the subscription list with all the subscribed feeds,
     * and makes a call to load the feed's associated articles. */
    function loadSubscriptions(data)
    {
        var template = $(HTML_ID_SUBSCRIPTION_TEMPLATE).html();
        for (var i=0; i < data.length; i++) {
            var subscriptionData = {
                subscriptionTitle: data[i]['title'],
                subscriptionID: data[i]['id'],
                subscriptionLanguage: data[i]['language']
            }
            $(HTML_ID_SUBSCRIPTION_LIST).append(Mustache.render(template, subscriptionData));
            articleList.load(subscriptionData);
        }
    }
}