import $ from 'jquery'
import Mustache from 'mustache';
import config from '../config';
import ZeeguuRequests from '../zeeguuRequests';

/**
 * Shows a list of all subscribed feeds, and updates the article list accordingly.
 */
export default class SubscriptionList {
    constructor(articleList) {
        this.articleList = articleList;
        this.feedList = new Set();
    }

    /* Call zeeguu and retrieve all currently subscribed feeds. */
    load() {
        ZeeguuRequests.get(config.GET_FEEDS_BEING_FOLLOWED, {}, this._loadSubscriptions.bind(this));
    };

    clear() {
        $(config.HTML_ID_SUBSCRIPTION_LIST).empty();
        this.articleList.clear();
    };

    refresh() {
        // Refresh the feed list.
        this.clear();
        this.load();
    };

    /* Callback function for the zeeguu request.
     * Fills the subscription list with all the subscribed feeds,
     * and makes a call to articleList in order to load the feed's associated articles. */
    _loadSubscriptions(data) {
        var template = $(config.HTML_ID_SUBSCRIPTION_TEMPLATE).html();
        for (var i = 0; i < data.length; i++) {
            var subscriptionData = {
                subscriptionTitle: data[i]['title'],
                subscriptionID: data[i]['id'],
                subscriptionLanguage: data[i]['language']
            };
            var subscription = $(Mustache.render(template, subscriptionData));
            var removeButton = $(subscription.find(".removeButton"));
            var _unfollow = this._unfollow.bind(this);
            removeButton.click(function() {
                _unfollow($(this).parent());
            });
            $(config.HTML_ID_SUBSCRIPTION_LIST).append(subscription);
            this.articleList.load(subscriptionData);
        }
    }

    /* Un-subscribe from a feed, calls the zeeguu server.
     * This function is called bu an html element. */
    _unfollow(feed) {
        var removableID = $(feed).attr('removableID');
        var callback = ((data) => this._onFeedUnfollowed(feed, data)).bind(this);
        ZeeguuRequests.get(config.UNFOLLOW_FEED_ENDPOINT + "/" + removableID,
                            {session: SESSION_ID}, callback);
    }

    /* Callback function for zeeguu.
     * A feed has just been removed, so we remove the mentioned feed from the
     * subscription list. */
    _onFeedUnfollowed(feed, data) {
        if (data == "OK") {
            this._remove(feed);
        }
    }

    /* Remove a mentioned feed from the local list (not from the zeeguu list).
     * Makes sure the associated articles are removed as well by notifying articleList. */
    _remove(feedNode) {
        this.articleList.remove($(feedNode).attr('removableID'));
        $(feedNode).fadeOut();
    }
};