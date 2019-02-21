import $ from 'jquery'
import Mustache from 'mustache';
import config from '../config';
import Notifier from '../Notifier';
import 'loggly-jslogger';
import UserActivityLogger from '../UserActivityLogger';
import ZeeguuRequests from '../zeeguuRequests';
import {GET_SUBSCRIBED_FILTERS} from '../zeeguuRequests';
import {SUBSCRIBE_FILTER_ENDPOINT} from '../zeeguuRequests';
import {UNSUBSCRIBE_FILTER_ENDPOINT} from '../zeeguuRequests';
import {reload_articles_on_drawer_close} from "./main.js";


const HTML_ID_SUBSCRIPTION_LIST = '#topicsFilterList';
const HTML_ID_NO_TOPIC_SELECTED = '#any_topic';
const HTML_ID_SUBSCRIPTION_TEMPLATE = '#subscription-template-topic';
const HTML_CLASS_REMOVE_BUTTON = '.removeButton';
const USER_EVENT_FOLLOWED_FEED = 'FILTER TOPIC';
const USER_EVENT_UNFOLLOWED_FEED = 'UNFILTER TOPIC';

/* Setup remote logging. */
let logger = new LogglyTracker();
logger.push({
    'logglyKey': config.LOGGLY_TOKEN,
    'sendConsoleErrors' : true,
    'tag' : 'TopicFilterSubscriptionList'
});

/**
 * Shows a list of all subscribed topics, allows the user to remove them.
 * It updates the {@link ArticleList} accordingly.
 */
export default class TopicFilterSubscriptionList {
    /**
     * Initialise an empty {@link Map} of topics.
     */
    constructor() {
        this.topicFilterSubscriptionList = new Map();
    }

    /**
     *  Call zeeguu and retrieve all currently subscribed topics.
     *  Uses {@link ZeeguuRequests}.
     */
    load() {
        ZeeguuRequests.get(GET_SUBSCRIBED_FILTERS, {}, this._loadSubscriptions.bind(this));
    };

    /**
     * Remove all topics from the list, clear {@link ArticleList} as well.
     */
    clear() {
        $(HTML_ID_SUBSCRIPTION_LIST).empty();
    };

    /**
     * Call clear and load successively.
     */
    refresh() {
        // Refresh the topic list.
        this.clear();
        this.load();
    };

    /**
     * Fills the subscription list with all the subscribed topics.
     * Callback function for the zeeguu request,
     * makes a call to {@link ArticleList} in order to load the topic's associated articles.
     * @param {Object[]} data - List containing the topics the user is subscribed to.
     */
    _loadSubscriptions(data) {
        for (let i = 0; i < data.length; i++) {
            this._addSubscription(data[i]);
        }
    }

    /**
     * Add the topic to the list of filtered topics.
     * @param {Object} topic - Data of the particular topic to add to the list.
     */
    _addSubscription(topic) {
        if (this.topicFilterSubscriptionList.has(topic.id))
            return;

        let template = $(HTML_ID_SUBSCRIPTION_TEMPLATE).html();
        let subscription = $(Mustache.render(template, topic));
        let removeButton = $(subscription.find(HTML_CLASS_REMOVE_BUTTON));
        let _unfollow = this._unfollow.bind(this);
        removeButton.click(function(topic) {
            return function () {
                _unfollow(topic);
            };
        }(topic));
        $(HTML_ID_SUBSCRIPTION_LIST).append(subscription);
        $(HTML_ID_NO_TOPIC_SELECTED).hide();
        this.topicFilterSubscriptionList.set(topic.id, topic);
    }

    /**
     * Filter a new topic, calls the zeeguu server.
     * Uses {@link ZeeguuRequests}.
     * @param {Object} topic - Data of the particular topic to subscribe to.
     */
    follow(topic) {
        UserActivityLogger.log(USER_EVENT_FOLLOWED_FEED, topic.id, topic);
        this._addSubscription(topic);
        this._loading();
        let callback = ((data) => this._onTopicFilterFollowed(topic, data)).bind(this);
        ZeeguuRequests.post(SUBSCRIBE_FILTER_ENDPOINT, {filter_id: topic.id}, callback);
    }

    /**
     * A topic-filter has just been followed, so we call the {@link ArticleList} to update its list of articles.
     * If there was a failure to follow the topic-filter, we notify the user.
     * Callback function for Zeeguu.
     * @param {Object} topic - Data of the particular topic-filter that has been subscribed to.
     * @param {string} reply - Reply from the server.
     */
    _onTopicFilterFollowed(topic, reply) {
        if (reply === "OK") {
            this._changed();
        } else {
            Notifier.notify("Network Error - Could not follow " + topic.title + ".");
            logger.push("Could not follow '" + topic.title + "'. Server reply: \n" + reply);
        }
    }

    /**
     * Un-subscribe from a topic filter, call the zeeguu server.
     * Uses {@link ZeeguuRequests}.
     * @param {Object} topic - Data of the particular topic-filter to unfollow.
     */
    _unfollow(topic) {
        UserActivityLogger.log(USER_EVENT_UNFOLLOWED_FEED, topic.id, topic);
        this._remove(topic);
        this._loading();
        let callback = ((data) => this._onTopicFilterUnfollowed(topic, data)).bind(this);
        ZeeguuRequests.post(UNSUBSCRIBE_FILTER_ENDPOINT, {topic_id: topic.id}, callback);
    }

    /**
     * A topic has just been removed, so we remove the mentioned topic from the filter list.
     * On failure we notify the user.
     * Callback function for zeeguu.
     * @param {Object} topic - Data of the particular topic to that has been unfollowed.
     * @param {string} reply - Server reply.
     */
    _onTopicFilterUnfollowed(topic, reply) {
        if (reply === "OK") {
            this._changed();
        } else {
            Notifier.notify("Network Error - Could not unfollow filter " + topic.title + ".");
            logger.push("Could not unfollow filter '" + topic.title + "'. Server reply: \n" + reply);
        }
    }

    /**
     * Remove a mentioned language from the local list which is shown in the User Interface.
     * Makes sure the associated articles are removed as well by notifying {@link ArticleList}.
     * @param {Object} topic - Data of the particular topic to remove from the list.
     */
    _remove(topic) {
        if (!this.topicFilterSubscriptionList.delete(topic.id))  { console.log("Error: topic not in topic list."); }
        $('span[topicRemovableID="' + topic.id + '"]').fadeOut();
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
