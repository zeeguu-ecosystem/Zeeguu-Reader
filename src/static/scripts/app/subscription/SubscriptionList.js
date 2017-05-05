import $ from 'jquery'
import Mustache from 'mustache';
import config from '../config';
import ZeeguuRequests from '../zeeguuRequests';

/**
 * Shows a list of all subscribed feeds, allows the user to remove them.
 * It updates the {@link ArticleList} accordingly.
 */
export default class SubscriptionList {
    /**
     * Bind with the {@link ArticleList} and initialise an empty list of feeds.
     * @param {ArticleList} articleList - List of all articles available to the user.
     */
    constructor(articleList) {
        this.articleList = articleList;
        this.feedList = new Set();
    }

    /**
     *  Call zeeguu and retrieve all currently subscribed feeds.
     *  Uses {@link ZeeguuRequests}.
     */
    load() {
        ZeeguuRequests.get(config.GET_FEEDS_BEING_FOLLOWED, {}, this._loadSubscriptions.bind(this));
    };

    /**
     * Remove all feeds from the list, clear {@link ArticleList} as well.
     */
    clear() {
        $(config.HTML_ID_SUBSCRIPTION_LIST).empty();
        this.articleList.clear();
    };

    /**
     * Call clear and load successively.
     */
    refresh() {
        // Refresh the feed list.
        this.clear();
        this.load();
    };

    /**
     * Fills the subscription list with all the subscribed feeds.
     * Callback function for the zeeguu request,
     * makes a call to {@link ArticleList} in order to load the feed's associated articles.
     * @param {Object[]} data - List containing the feeds the user is subscribed to.
     */
    _loadSubscriptions(data) {
        var template = $(config.HTML_ID_SUBSCRIPTION_TEMPLATE).html();
        for (var i = 0; i < data.length; i++) {
            var subscriptionData = {
                subscriptionTitle: data[i]['title'],
                subscriptionID: data[i]['id'],
                subscriptionLanguage: data[i]['language'],
                subscriptionIcon: data[i]['image_url']
            };
            var subscription = $(Mustache.render(template, subscriptionData));
            var removeButton = $(subscription.find(".removeButton"));
            var _unfollow = this._unfollow.bind(this);
            removeButton.click(function() {
                _unfollow($(this).parent());
            });
            if (!this.feedList.has(Number(subscriptionData['subscriptionID']))) {                
                $(config.HTML_ID_SUBSCRIPTION_LIST).append(subscription);
                this.articleList.load(subscriptionData);
            }             
            this.feedList.add(Number(subscriptionData['subscriptionID']));
        }
    }

    /**
     * Un-subscribe from a feed, call the zeeguu server.
     * Uses {@link ZeeguuRequests}.
     * @param {Element} feed - Feed element of the list to un-subscribe from.
     */
    _unfollow(feed) {
        var removableID = $(feed).attr('removableID');
        var callback = ((data) => this._onFeedUnfollowed(feed, data)).bind(this);
        ZeeguuRequests.get(config.UNFOLLOW_FEED_ENDPOINT + "/" + removableID,
                            {}, callback);
    }

    /**
     * A feed has just been removed, so we remove the mentioned feed from the subscription list.
     * Callback function for zeeguu.
     * @param {Element} feed - Feed element of the list that is to be removed.
     * @param {string} data - Server reply.
     */
    _onFeedUnfollowed(feed, data) {
        if (data == "OK") {
            this._remove(feed);
        }
    }

    /**
     * Remove a mentioned feed from the local list (not from the zeeguu list).
     * Makes sure the associated articles are removed as well by notifying {@link ArticleList}.
     * @param {Element} feedNode - The document element (feed) to remove.
     */
    _remove(feedNode) {
        var feedID = $(feedNode).attr('removableID');
        this.articleList.remove(feedID);
        if (!this.feedList.delete(Number(feedID)))  { console.log("Error"); }
        $(feedNode).fadeOut();
    }
};