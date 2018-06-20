import $ from 'jquery'
import Mustache from 'mustache';
import config from '../config';
import Notifier from '../Notifier';
import 'loggly-jslogger';
import UserActivityLogger from '../UserActivityLogger';
import ZeeguuRequests from '../zeeguuRequests';
import {GET_FILTERED_SEARCHES} from '../zeeguuRequests';
import {FILTER_SEARCH_ENDPOINT} from '../zeeguuRequests';
import {UNFILTER_SEARCH_ENDPOINT} from '../zeeguuRequests';


const HTML_ID_SUBSCRIPTION_LIST = '#searchesFilterList';
const HTML_ID_SUBSCRIPTION_TEMPLATE = '#subscription-template-search';
const HTML_CLASS_REMOVE_BUTTON = '.removeButton';
const USER_EVENT_FOLLOWED_FEED = 'FOLLOW SEARCH FILTER';
const USER_EVENT_UNFOLLOWED_FEED = 'UNFOLLOW SEARCH FILTER';

/* Setup remote logging. */
let logger = new LogglyTracker();
logger.push({
    'logglyKey': config.LOGGLY_TOKEN,
    'sendConsoleErrors' : true,
    'tag' : 'SearchFilterSubscriptionList'
});

/**
 * Shows a list of all subscribed searches, allows the user to remove them.
 * It updates the {@link ArticleList} accordingly.
 */
export default class SearchFilterSubscriptionList {
    /**
     * Initialise an empty {@link Map} of searches.
     */
    constructor() {
        this.searchFilterSubscriptionList = new Map();
    }

    /**
     *  Call zeeguu and retrieve all currently subscribed searches.
     *  Uses {@link ZeeguuRequests}.
     */
    load() {
        ZeeguuRequests.get(GET_FILTERED_SEARCHES, {}, this._loadSubscriptions.bind(this));
    };

    /**
     * Remove all searches from the list, clear {@link ArticleList} as well.
     */
    clear() {
        $(HTML_ID_SUBSCRIPTION_LIST).empty();
    };

    /**
     * Call clear and load successively.
     */
    refresh() {
        // Refresh the search list.
        this.clear();
        this.load();
    };

    /**
     * Fills the subscription list with all the subscribed searches.
     * Callback function for the zeeguu request,
     * makes a call to {@link ArticleList} in order to load the search's associated articles.
     * @param {Object[]} data - List containing the searches the user is subscribed to.
     */
    _loadSubscriptions(data) {
        for (let i = 0; i < data.length; i++) {
            this._addSubscription(data[i]);
        }
    }

    /**
     * Add the search to the list of subscribed searches.
     * @param {Object} search - Data of the particular search to add to the list.
     */
    _addSubscription(search) {
        if (this.searchFilterSubscriptionList.has(search.id))
            return;

        let template = $(HTML_ID_SUBSCRIPTION_TEMPLATE).html();
        let subscription = $(Mustache.render(template, search));
        let removeButton = $(subscription.find(HTML_CLASS_REMOVE_BUTTON));
        let _unfollow = this._unfollow.bind(this);
        removeButton.click(function(search) {
            return function () {
                _unfollow(search);
            };
        }(search));
        $(HTML_ID_SUBSCRIPTION_LIST).append(subscription);
        this.searchFilterSubscriptionList.set(search.id, search);
    }

    /**
     * Subscribe to a new search, calls the zeeguu server.
     * Uses {@link ZeeguuRequests}.
     * @param {Object} search_terms - Data of the particular search to subscribe to.
     */
    follow(search_terms) {
        let callback = ((data) => this._onSearchFilterFollowed(search_terms, data)).bind(this);
        ZeeguuRequests.get(FILTER_SEARCH_ENDPOINT + "/" + search_terms , {}, callback);
    }

    /**
     * A search has just been followed, so we call the {@link ArticleList} to update its list of articles.
     * If there was a failure to follow the search, we notify the user.
     * Callback function for Zeeguu.
     * @param {Object} search_terms - Data of the particular search that has been subscribed to.
     * @param {string} reply - Reply from the server.
     */
    _onSearchFilterFollowed(search_terms, reply) {
        if (reply != null) {
            UserActivityLogger.log(USER_EVENT_FOLLOWED_FEED, reply.id, search_terms);
            this._addSubscription(reply);
            this._changed();
        } else {
            Notifier.notify("Network Error - Could not follow " + search_terms + ".");
            logger.push("Could not follow '" + search_terms + "'. Server reply: \n" + reply);
        }
    }

    /**
     * Un-subscribe from a search, call the zeeguu server.
     * Uses {@link ZeeguuRequests}.
     * @param {Object} search - Data of the particular search to unfollow.
     */
    _unfollow(search) {
        UserActivityLogger.log(USER_EVENT_UNFOLLOWED_FEED, search.id, search);
        this._remove(search);
        let callback = ((data) => this._onSearchFilterUnfollowed(search, data)).bind(this);
        ZeeguuRequests.post(UNFILTER_SEARCH_ENDPOINT, {search_id: search.id}, callback);
    }

    /**
     * A search has just been removed, so we remove the mentioned search from the subscription list.
     * On failure we notify the user.
     * Callback function for zeeguu.
     * @param {Object} search - Data of the particular search to that has been unfollowed.
     * @param {string} reply - Server reply.
     */
    _onSearchFilterUnfollowed(search, reply) {
        if (reply === "OK") {
            this._changed();
        } else {
            Notifier.notify("Network Error - Could not unfollow " + search.search + ".");
            logger.push("Could not unfollow '" + search.search + "'. Server reply: \n" + reply);
        }
    }

    /**
     * Remove a mentioned language from the local list which is shown in the User Interface.
     * Makes sure the associated articles are removed as well by notifying {@link ArticleList}.
     * @param {Object} search - Data of the particular search to remove from the list.
     */
    _remove(search) {
        if (!this.searchFilterSubscriptionList.delete(search.id))  { console.log("Error: search not in search list."); }
        $('span[searchRemovableID="' + search.id + '"]').fadeOut();
    }

    /**
     * Fire an event to notify change in this class.
     */
    _changed() {
        document.dispatchEvent(new CustomEvent(config.EVENT_SUBSCRIPTION));
    }
};
