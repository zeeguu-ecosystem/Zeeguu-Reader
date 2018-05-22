import $ from 'jquery'
import Mustache from 'mustache';
import config from '../config';
import Notifier from '../Notifier';
import 'loggly-jslogger';
import UserActivityLogger from '../UserActivityLogger';
import ZeeguuRequests from '../zeeguuRequests';
import {GET_USER_LANGUAGES} from '../zeeguuRequests';
import {ADD_USER_LANGUAGE} from '../zeeguuRequests';
import {DELETE_USER_LANGUAGE} from '../zeeguuRequests';
import {GET_LEARNED_LANGUAGE} from "../zeeguuRequests";


const HTML_ID_SUBSCRIPTION_LIST = '#languagesList';
const HTML_ID_SUBSCRIPTION_TEMPLATE = '#subscription-template-language';
const HTML_CLASS_REMOVE_BUTTON = '.removeButton';
const USER_EVENT_FOLLOWED_FEED = 'FOLLOW LANGUAGE';
const USER_EVENT_UNFOLLOWED_FEED = 'UNFOLLOW LANGUAGE';

/* Setup remote logging. */
let logger = new LogglyTracker();
logger.push({
    'logglyKey': config.LOGGLY_TOKEN,
    'sendConsoleErrors' : true,
    'tag' : 'LanguageSubscriptionList'
});

/**
 * Shows a list of all subscribed topics, allows the user to remove them.
 * It updates the {@link ArticleList} accordingly.
 */
export default class LanguageSubscriptionList {
    /**
     * Initialise an empty {@link Map} of feeds.
     */
    constructor() {
        this.languageSubscriptionList = new Map();
    }

    /**
     *  Call zeeguu and retrieve all currently subscribed feeds.
     *  Uses {@link ZeeguuRequests}.
     */
    load() {
        ZeeguuRequests.get(GET_USER_LANGUAGES, {}, this._loadSubscriptions.bind(this));
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

        //this._changed();
    }

    /**
     * Add the feed to the list of subscribed feeds.
     * @param {Object} feed - Data of the particular feed to add to the list.
     */
    _addSubscription(language) {
        if (this.languageSubscriptionList.has(language.id))
            return;

        let learned_language = ZeeguuRequests.get(GET_LEARNED_LANGUAGE, {});
        let template = $(HTML_ID_SUBSCRIPTION_TEMPLATE).html();
        let subscription = $(Mustache.render(template, language));
        let removeButton = $(subscription.find(HTML_CLASS_REMOVE_BUTTON));
        if(language.code != learned_language) {
            let _unfollow = this._unfollow.bind(this);
            removeButton.click(function (language) {
                return function () {
                    _unfollow(language);
                };
            }(language));
        }
        $(HTML_ID_SUBSCRIPTION_LIST).append(subscription);
        this.languageSubscriptionList.set(language.id, language);
    }

    /**
     * Subscribe to a new feed, calls the zeeguu server.
     * Uses {@link ZeeguuRequests}.
     * @param {Object} feed - Data of the particular feed to subscribe to.
     */
    follow(language) {
        UserActivityLogger.log(USER_EVENT_FOLLOWED_FEED, language.id, language);
        this._addSubscription(language);
        let callback = ((data) => this._onFeedFollowed(language, data)).bind(this);
        ZeeguuRequests.post(ADD_USER_LANGUAGE, {language_id: language.id}, callback);
    }

    /**
     * A feed has just been followed, so we call the {@link ArticleList} to update its list of articles.
     * If there was a failure to follow the feed, we notify the user.
     * Callback function for Zeeguu.
     * @param {Object} feed - Data of the particular feed that has been subscribed to.
     * @param {string} reply - Reply from the server.
     */
    _onFeedFollowed(language, reply) {
        if (reply === "OK") {
            this._changed();
        } else {
            Notifier.notify("Network Error - Could not follow " + language.title + ".");
            logger.push("Could not follow '" + language.title + "'. Server reply: \n" + reply);
        }
    }

    /**
     * Un-subscribe from a feed, call the zeeguu server.
     * Uses {@link ZeeguuRequests}.
     * @param {Object} feed - Data of the particular feed to unfollow.
     */
    _unfollow(language) {
        UserActivityLogger.log(USER_EVENT_UNFOLLOWED_FEED, language.id, language);
        this._remove(language);
        let callback = ((data) => this._onFeedUnfollowed(language, data)).bind(this);
        ZeeguuRequests.get(DELETE_USER_LANGUAGE + "/" + language.id, {}, callback);
    }

    /**
     * A feed has just been removed, so we remove the mentioned feed from the subscription list.
     * On failure we notify the user.
     * Callback function for zeeguu.
     * @param {Object} feed - Data of the particular feed to that has been unfollowed.
     * @param {string} reply - Server reply.
     */
    _onFeedUnfollowed(language, reply) {
        if (reply === "OK") {
            this._changed();
        } else {
            Notifier.notify("Network Error - Could not unfollow " + language.title + ".");
            logger.push("Could not unfollow '" + language.title + "'. Server reply: \n" + reply);
        }
    }

    /**
     * Remove a mentioned feed from the local list (not from the zeeguu list).
     * Makes sure the associated articles are removed as well by notifying {@link ArticleList}.
     * @param {Object} feed - Data of the particular feed to remove from the list.
     */
    _remove(language) {
        if (!this.languageSubscriptionList.delete(language.id))  { console.log("Error: feed not in feed list."); }
        $('span[removableID="' + language.id + '"]').fadeOut();
    }

    /**
     * Fire an event to notify change in this class.
     */
    _changed() {
        document.dispatchEvent(new CustomEvent(config.EVENT_SUBSCRIPTION));
    }
};
