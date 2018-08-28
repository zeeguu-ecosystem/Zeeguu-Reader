import $ from 'jquery'
import Mustache from 'mustache';
import config from '../config';
import Notifier from '../Notifier';
import 'loggly-jslogger';
import UserActivityLogger from '../UserActivityLogger';
import ZeeguuRequests from '../zeeguuRequests';
import {GET_READING_LANGUAGES} from '../zeeguuRequests';
import {MODIFY_USER_LANGUAGE} from '../zeeguuRequests';
import {reload_articles_on_drawer_close} from "./main.js";

const HTML_ID_SUBSCRIPTION_LIST = '#languagesList';
const HTML_ID_SUBSCRIPTION_TEMPLATE = '#subscription-template-language';
const HTML_CLASS_REMOVE_BUTTON = '.removeButton';
const USER_EVENT_FOLLOWED_FEED = 'FOLLOW LANGUAGE';
const USER_EVENT_UNFOLLOWED_FEED = 'UNFOLLOW LANGUAGE';

/* Setup remote logging. */
let logger = new LogglyTracker();
logger.push({
    'logglyKey': config.LOGGLY_TOKEN,
    'sendConsoleErrors': true,
    'tag': 'LanguageSubscriptionList'
});

/**
 * Shows a list of all subscribed languages, allows the user to remove them.
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
     *  Call zeeguu and retrieve all currently subscribed languages.
     *  Uses {@link ZeeguuRequests}.
     */
    load() {
        ZeeguuRequests.get(GET_READING_LANGUAGES, {}, this._loadSubscriptions.bind(this));
    };

    /**
     * Remove all languages from the list, clear {@link ArticleList} as well.
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
     * Fills the subscription list with all the subscribed languages.
     * Callback function for the zeeguu request,
     * makes a call to {@link ArticleList} in order to load the language's associated articles.
     * @param {Object[]} data - List containing the languages the user is subscribed to.
     */
    _loadSubscriptions(data) {
        for (let i = 0; i < data.length; i++) {
            this._addSubscription(data[i]);
        }
    }

    /**
     * Add the language to the list of subscribed feeds.
     * @param {Object} language - Data of the particular language to add to the list.
     */
    _addSubscription(language) {
        if (this.languageSubscriptionList.has(language.id))
            return;

        let template = $(HTML_ID_SUBSCRIPTION_TEMPLATE).html();
        let subscription = $(Mustache.render(template, language));
        let removeButton = $(subscription.find(HTML_CLASS_REMOVE_BUTTON));
        let _unfollow = this._unfollow.bind(this);
        removeButton.click(function (language) {
            return function () {
                _unfollow(language);
            };
        }(language));
        $(HTML_ID_SUBSCRIPTION_LIST).append(subscription);
        this.languageSubscriptionList.set(language.id, language);
    }

    /**
     * Subscribe to a new language, calls the zeeguu server.
     * Uses {@link ZeeguuRequests}.
     * @param {Object} language - Data of the particular language to subscribe to.
     */
    follow(language) {
        UserActivityLogger.log(USER_EVENT_FOLLOWED_FEED, language.id, language);
        this._addSubscription(language);
        this._loading();
        let callback = ((data) => this._onLanguageFollowed(language, data)).bind(this);
        ZeeguuRequests.post(MODIFY_USER_LANGUAGE, {language_id: language.id, language_reading: 1}, callback);
    }

    /**
     * A language has just been followed, so we call the {@link ArticleList} to update its list of articles.
     * If there was a failure to follow the language, we notify the user.
     * Callback function for Zeeguu.
     * @param {Object} language - Data of the particular language that has been subscribed to.
     * @param {string} reply - Reply from the server.
     */
    _onLanguageFollowed(language, reply) {
        if (reply === "OK") {
            this._changed();
        } else {
            Notifier.notify("Network Error - Could not follow " + language.title + ".");
            logger.push("Could not follow '" + language.title + "'. Server reply: \n" + reply);
        }
    }

    /**
     * Un-subscribe from a language, call the zeeguu server.
     * Uses {@link ZeeguuRequests}.
     * @param {Object} language - Data of the particular language to unfollow.
     */
    _unfollow(language) {
        UserActivityLogger.log(USER_EVENT_UNFOLLOWED_FEED, language.id, language);
        this._remove(language);
        this._loading();
        let callback = ((data) => this._onLanguageUnfollowed(language, data)).bind(this);
        ZeeguuRequests.post(MODIFY_USER_LANGUAGE, {language_id: language.id, language_reading: 0}, callback);
    }

    /**
     * A language has just been removed, so we remove the mentioned language from the subscription list.
     * On failure we notify the user.
     * Callback function for zeeguu.
     * @param {Object} language - Data of the particular language to that has been unfollowed.
     * @param {string} reply - Server reply.
     */
    _onLanguageUnfollowed(language, reply) {
        if (reply === "OK") {
            this._changed();
        } else {
            Notifier.notify("Network Error - Could not unfollow " + language.title + ".");
            logger.push("Could not unfollow '" + language.title + "'. Server reply: \n" + reply);
        }
    }

    /**
     * Remove a mentioned language from the local list which is shown in the User Interface.
     * Makes sure the associated articles are removed as well by notifying {@link ArticleList}.
     * @param {Object} language - Data of the particular language to remove from the list.
     */
    _remove(language) {
        if (!this.languageSubscriptionList.delete(language.id)) {
            console.log("Error: feed not in feed list.");
        }
        $('span[languageRemovableID="' + language.id + '"]').fadeOut();
    }

    /**
     * Fire an event to notify change in this class.
     */
    _changed() {
        reload_articles_on_drawer_close();
    }

    /**
     * Was used to fire event to show loader while subscribing / unsubscribing
     * Not doing anything anymore because we're not reloading anymore
     */
    _loading() {
    }
};
