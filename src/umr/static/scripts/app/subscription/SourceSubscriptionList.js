import $ from 'jquery'
import Mustache from 'mustache';
import config from '../config';
import Notifier from '../Notifier';
import 'loggly-jslogger';
import UserActivityLogger from '../UserActivityLogger';
import ZeeguuRequests from '../zeeguuRequests';
import {GET_FEEDS_BEING_FOLLOWED} from '../zeeguuRequests';
import {FOLLOW_FEED_ENDPOINT} from '../zeeguuRequests';
import {UNFOLLOW_FEED_ENDPOINT} from '../zeeguuRequests';
import {reload_articles_on_drawer_close} from "./main.js";


const HTML_ID_SUBSCRIPTION_LIST = '#sourcesList';
const HTML_ID_SUBSCRIPTION_TEMPLATE = '#subscription-template-source';
const HTML_CLASS_REMOVE_BUTTON = '.removeButton';
const USER_EVENT_FOLLOWED_FEED = 'FOLLOW FEED';
const USER_EVENT_UNFOLLOWED_FEED = 'UNFOLLOW FEED';

/* Setup remote logging. */
let logger = new LogglyTracker();
logger.push({
    'logglyKey': config.LOGGLY_TOKEN,
    'sendConsoleErrors' : true,
    'tag' : 'SourceSubscriptionList'
});

/**
 * Shows a list of all subscribed sources, allows the user to remove them.
 * It updates the {@link ArticleList} accordingly.
 */
export default class SourceSubscriptionList {
    /**
     * Initialise an empty {@link Map} of sources.
     */
    constructor() {
        this.sourceList = new Map();
    }

    /**
     *  Call zeeguu and retrieve all currently subscribed sources.
     *  Uses {@link ZeeguuRequests}.
     */
    load() {
        ZeeguuRequests.get(GET_FEEDS_BEING_FOLLOWED, {}, this._loadSubscriptions.bind(this));
    };

    /**
     * Remove all sources from the list, clear {@link ArticleList} as well.
     */
    clear() {
        $(HTML_ID_SUBSCRIPTION_LIST).empty();
    };

    /**
     * Call clear and load successively.
     */
    refresh() {
        // Refresh the source list.
        this.clear();
        this.load();
    };

    /**
     * Fills the subscription list with all the subscribed sources.
     * Callback function for the zeeguu request,
     * makes a call to {@link ArticleList} in order to load the source's associated articles.
     * @param {Object[]} data - List containing the sources the user is subscribed to.
     */
    _loadSubscriptions(data) {
        for (let i = 0; i < data.length; i++) {
            this._addSubscription(data[i]);
        }

        this._changed();
    }

    /**
     * Add the source to the list of subscribed sources.
     * @param {Object} source - Data of the particular source to add to the list.
     */
    _addSubscription(source) {
        if (this.sourceList.has(source.id))
            return;

        let template = $(HTML_ID_SUBSCRIPTION_TEMPLATE).html();
        let subscription = $(Mustache.render(template, source));
        let removeButton = $(subscription.find(HTML_CLASS_REMOVE_BUTTON));
        let _unfollow = this._unfollow.bind(this);
        removeButton.click(function(source) {
            return function () {
                _unfollow(source);
            };
        }(source));
        $(HTML_ID_SUBSCRIPTION_LIST).append(subscription);
        this.sourceList.set(source.id, source);
    }

    /**
     * Subscribe to a new source, calls the zeeguu server.
     * Uses {@link ZeeguuRequests}.
     * @param {Object} source - Data of the particular source to subscribe to.
     */
    follow(source) {
        UserActivityLogger.log(USER_EVENT_FOLLOWED_FEED, source.id, source);
        this._addSubscription(source);
        this._loading();
        let callback = ((data) => this._onSourceFollowed(source, data)).bind(this);
        ZeeguuRequests.post(FOLLOW_FEED_ENDPOINT, {source_id: source.id}, callback);
    }

    /**
     * A source has just been followed, so we call the {@link ArticleList} to update its list of articles.
     * If there was a failure to follow the source, we notify the user.
     * Callback function for Zeeguu.
     * @param {Object} source - Data of the particular source that has been subscribed to.
     * @param {string} reply - Reply from the server.
     */
    _onSourceFollowed(source, reply) {
        if (reply === "OK") {
            this._changed();
        } else {
            Notifier.notify("Network Error - Could not follow " + source.title + ".");
            logger.push("Could not follow '" + source.title + "'. Server reply: \n" + reply);
        }
    }

    /**
     * Un-subscribe from a source, call the zeeguu server.
     * Uses {@link ZeeguuRequests}.
     * @param {Object} source - Data of the particular source to unfollow.
     */
    _unfollow(source) {
        UserActivityLogger.log(USER_EVENT_UNFOLLOWED_FEED, source.id, source);
        this._remove(source);
        this._loading();
        let callback = ((data) => this._onSourceUnfollowed(source, data)).bind(this);
        ZeeguuRequests.post(UNFOLLOW_FEED_ENDPOINT, {source_id: source.id}, callback);
    }

    /**
     * A source has just been removed, so we remove the mentioned source from the subscription list.
     * On failure we notify the user.
     * Callback function for zeeguu.
     * @param {Object} source - Data of the particular source to that has been unfollowed.
     * @param {string} reply - Server reply.
     */
    _onSourceUnfollowed(source, reply) {
        if (reply === "OK") {
            this._changed();
        } else {
            Notifier.notify("Network Error - Could not unfollow " + source.title + ".");
            logger.push("Could not unfollow '" + source.title + "'. Server reply: \n" + reply);
        }
    }

    /**
     * Remove a mentioned language from the local list which is shown in the User Interface.
     * Makes sure the associated articles are removed as well by notifying {@link ArticleList}.
     * @param {Object} source - Data of the particular source to remove from the list.
     */
    _remove(source) {
        if (!this.sourceList.delete(source.id))  { console.log("Error: source not in source list."); }
        $('span[sourceRemovableID="' + source.id + '"]').fadeOut();
    }

    /**
     * Fire an event to notify change in this class.
     */
    _changed() {
        reload_articles_on_drawer_close();
    }

    /**
     * Fire event to show loader while subscribing / unsubscribing
     * Not doing anything anymore because we're not reloading anymore
     */
    _loading() {
    }
};
