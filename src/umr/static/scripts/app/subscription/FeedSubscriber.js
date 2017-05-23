import $ from 'jquery';
import Mustache from 'mustache';
import config from '../config';
import ZeeguuRequests from '../zeeguuRequests';

/**
 * Allows the user to add feed subscriptions.
 */
export default class FeedSubscriber {
    /**
     * Link the {@link SubscriptionList} with this instance so we can update it on change.
     * @param {SubscriptionList} subscriptionList - Local (!) list of currently subscribed-to feeds.
     */
    constructor(subscriptionList) {
        this.subscriptionList = subscriptionList;
        this.currentLanguage = 'nl';
    }

    /**
     * Call Zeeguu and requests recommended feeds for the given language.
     * If the language is not given, it simply uses the last used language.
     * Uses {@link ZeeguuRequests}.
     * @param {string} language - Language code.
     * @example load('nl');
     */
    load(language) {
        language = typeof language !== 'undefined' ? language : this.currentLanguage;
        ZeeguuRequests.get(config.RECOMMENDED_FEED_ENDPOINT + '/' + language,
                                {}, this._loadFeedOptions.bind(this));
        this.currentLanguage = language;
    }

    /**
     * Clear the list of feed options.
     */
    clear() {
        $(config.HTML_ID_ADDSUBSCRIPTION_LIST).empty();
    }

    /**
     * Return the language for the feed options currently displayed.
     * @return {string} - The language of feed options currently on display.
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Fills the dialog's list with all the addable feeds.
     * Callback function for zeeguu.
     * @param {Object[]} data - A list of feeds the user can subscribe to.
     */
    _loadFeedOptions(data) {
        var template = $(config.HTML_ID_ADDSUBSCRIPTION_TEMPLATE).html();
        for (var i = 0; i < data.length; i++) {
            var feedOption = $(Mustache.render(template, data[i]));
            var subscribeButton = $(feedOption.find(".subscribeButton"));

            subscribeButton.click(function (data, feedOption, subscriptionList) {
                return function() {
                    subscriptionList.follow(data);
                    $(feedOption).fadeOut();
                };
            }(data[i], feedOption, this.subscriptionList));

            var feedIcon = $(feedOption.find(".feedIcon"));
            feedIcon.on( "error", function () {
                $(this).unbind("error").attr("src", "static/images/noAvatar.png");
            });
            $(config.HTML_ID_ADDSUBSCRIPTION_LIST).append(feedOption);
        }
    }
};
