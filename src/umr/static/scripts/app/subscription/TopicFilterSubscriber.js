import $ from 'jquery';
import Mustache from 'mustache';
import config from '../config';
import swal from 'sweetalert';
import UserActivityLogger from '../UserActivityLogger';
import ZeeguuRequests from '../zeeguuRequests';
import {GET_AVAILABLE_FILTERS} from '../zeeguuRequests';


const HTML_ID_DIALOG_TEMPLATE = '#add-topic-dialog-template';
const HTML_ID_ADD_FEED_LIST = '#addableTopicList';
const HTML_ID_FEED_TEMPLATE = '#topicAddable-template';
const HTML_CLASS_SUBSCRIBE_BUTTON = ".subscribeButton";
const HTML_CLASS_FEED_ICON = '.feedIcon';
const USER_EVENT_OPENED_FEEDSUBSCRIBER = 'OPEN FILTERSUBSCRIBER';

/**
 * Allows the user to add topic subscriptions.
 */
export default class TopicFilterSubscriber {
    /**
     * Link the {@link TopicFilterSubscriptionList} with this instance so we can update it on change.
     * @param topicFilterSubscriptionList
     */
    constructor(topicFilterSubscriptionList) {
        this.topicFilterSubscriptionList = topicFilterSubscriptionList;
    }

    /**
     * Open the dialog window containing the list of feeds.
     * Uses the sweetalert library.
     */
    open() {
        UserActivityLogger.log(USER_EVENT_OPENED_FEEDSUBSCRIBER);
        let template = $(HTML_ID_DIALOG_TEMPLATE).html();
        swal({
            title: 'Available Filters',
            text: template,
            html: true,
            allowOutsideClick: true,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonText: 'Close',
        });

        this.load();
    }

    /**
     * Call Zeeguu and requests available topics for the given language.
     * If the language is not given, it simply uses the last used language.
     * Uses {@link ZeeguuRequests}.
     * @param {string} language - Language code.
     * @example load('nl');
     */
    load() {
        ZeeguuRequests.get(GET_AVAILABLE_FILTERS, {}, this._loadFeedOptions.bind(this));
    }

    /**
     * Clear the list of feed options.
     */
    clear() {
        $(HTML_ID_ADD_FEED_LIST).empty();
    }

    /**
     * Fills the dialog's list with all the addable topics.
     * Callback function for zeeguu.
     * @param {Object[]} data - A list of feeds the user can subscribe to.
     */
    _loadFeedOptions(data) {
        let template = $(HTML_ID_FEED_TEMPLATE).html();
        for (let i = 0; i < data.length; i++) {
            let feedOption = $(Mustache.render(template, data[i]));
            let subscribeButton = $(feedOption.find(HTML_CLASS_SUBSCRIBE_BUTTON));

            subscribeButton.click(
                function (data, feedOption, topicFilterSubscriptionList) {
                    return function() {
                        topicFilterSubscriptionList.follow(data);
                        $(feedOption).fadeOut();
                    };
            }(data[i], feedOption, this.topicFilterSubscriptionList));

            let feedIcon = $(feedOption.find(HTML_CLASS_FEED_ICON));
            feedIcon.on( "error", function () {
                $(this).unbind("error").attr("src", "static/images/noAvatar.png");
            });
            $(HTML_ID_ADD_FEED_LIST).append(feedOption);
        }
    }
};
