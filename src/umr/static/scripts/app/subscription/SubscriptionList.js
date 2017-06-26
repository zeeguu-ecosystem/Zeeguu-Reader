import $ from 'jquery'
import Mustache from 'mustache';
import config from '../config';
import ZeeguuRequests from '../zeeguuRequests';
import Notifier from '../Notifier';
import 'loggly-jslogger';

const HTML_ID_SUBSCRIPTION_LIST = '#subscriptionList';
const HTML_ID_SUBSCRIPTION_TEMPLATE = '#subscription-template';
const HTML_CLASS_REMOVE_BUTTON = '.removeButton';

/* Setup remote logging. */
let logger = new LogglyTracker();
logger.push({
    'logglyKey': config.LOGGLY_TOKEN,
    'sendConsoleErrors' : true,
    'tag' : 'SubscriptionList'
});

/**
 * Shows a list of all subscribed feeds, allows the user to remove them.
 * It updates the {@link ArticleList} accordingly.
 */
export default class SubscriptionList {
    /**
     * Initialise an empty {@link Map} of feeds.
     */
    constructor() {
        this.feedList = new Map();
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
        $(HTML_ID_SUBSCRIPTION_LIST).empty();
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
        for (let i = 0; i < data.length; i++) {
            this._addSubscription(data[i]);
        }

        this._changed();
    }

    /**
     * Add the feed to the list of subscribed feeds.
     * @param {Object} feed - Data of the particular feed to add to the list.
     */
    _addSubscription(feed) {
        if (this.feedList.has(feed.id))
            return;

        let template = $(HTML_ID_SUBSCRIPTION_TEMPLATE).html();
        let subscription = $(Mustache.render(template, feed));
        let removeButton = $(subscription.find(HTML_CLASS_REMOVE_BUTTON));
        let _unfollow = this._unfollow.bind(this);
        removeButton.click(function(feed) {
            return function () {
                _unfollow(feed);
            };
        }(feed));
        $(HTML_ID_SUBSCRIPTION_LIST).append(subscription);
        this.feedList.set(feed.id, feed);
    }

    /**
     * Subscribe to a new feed, calls the zeeguu server.
     * Uses {@link ZeeguuRequests}.
     * @param {Object} feed - Data of the particular feed to subscribe to.
     */
    follow(feed) {
        this._addSubscription(feed);
        let callback = ((data) => this._onFeedFollowed(feed, data)).bind(this);
        ZeeguuRequests.post(config.FOLLOW_FEED_ENDPOINT, {feed_id: feed.id}, callback);
    }

    /**
     * A feed has just been followed, so we call the {@link ArticleList} to update its list of articles.
     * If there was a failure to follow the feed, we notify the user.
     * Callback function for Zeeguu.
     * @param {Object} feed - Data of the particular feed that has been subscribed to.
     * @param {string} reply - Reply from the server.
     */
    _onFeedFollowed(feed, reply) {
        if (reply === "OK") {
            this._changed();
        } else {
            Notifier.notify("Network Error - Could not follow " + feed.title + ".");
            logger.push("Could not follow '" + feed.title + "'. Server reply: \n" + reply);
        }
    }

    /**
     * Un-subscribe from a feed, call the zeeguu server.
     * Uses {@link ZeeguuRequests}.
     * @param {Object} feed - Data of the particular feed to unfollow.
     */
    _unfollow(feed) {
        this._remove(feed);
        let callback = ((data) => this._onFeedUnfollowed(feed, data)).bind(this);
        ZeeguuRequests.get(config.UNFOLLOW_FEED_ENDPOINT + "/" + feed.id, {}, callback);
    }

    /**
     * A feed has just been removed, so we remove the mentioned feed from the subscription list.
     * On failure we notify the user.
     * Callback function for zeeguu.
     * @param {Object} feed - Data of the particular feed to that has been unfollowed.
     * @param {string} reply - Server reply.
     */
    _onFeedUnfollowed(feed, reply) {
        if (reply === "OK") {
            this._changed();
        } else {
            Notifier.notify("Network Error - Could not unfollow " + feed.title + ".");
            logger.push("Could not unfollow '" + feed.title + "'. Server reply: \n" + reply);
        }
    }

    /**
     * Remove a mentioned feed from the local list (not from the zeeguu list).
     * Makes sure the associated articles are removed as well by notifying {@link ArticleList}.
     * @param {Object} feed - Data of the particular feed to remove from the list.
     */
    _remove(feed) {
        if (!this.feedList.delete(feed.id))  { console.log("Error: feed not in feed list."); }
        $('span[removableID="' + feed.id + '"]').fadeOut();
    }

    /**
     * Fire an event to notify change in this class.
     */
    _changed() {
        document.dispatchEvent(new CustomEvent(config.EVENT_SUBSCRIPTION, { "detail": this.feedList }));
    }
};
