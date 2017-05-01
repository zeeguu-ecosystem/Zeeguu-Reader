import $ from 'jquery';
import Mustache from 'mustache';
import _ from 'underscore';
import config from '../config';
import ZeeguuRequests from '../zeeguuRequests';

/**
 * Allows the user to add or remove feed subscriptions.
 */
export default class FeedSubscriber {
    constructor(subscriptionList) {
        this.subscriptionList = subscriptionList;
        this.currentLanguage = 'nl';
        this.zeeguuRequests = new ZeeguuRequests();
    }

    /* Calls zeeguu and requests recommended feeds for the given 'language'.
     * If the language is not given, it simply uses the last used language. */
    load(language) {
        language = typeof language !== 'undefined' ? language : currentLanguage;
        this.zeeguuRequests.get(config.RECOMMENDED_FEED_ENDPOINT + '/' + language,
                                {session: SESSION_ID}, this._loadFeedOptions);
        currentLanguage = language;
    };

    clear() {
        $(config.HTML_ID_ADDSUBSCRIPTION_LIST).empty();
    };

    getCurrentLanguage() {
        return this.currentLanguage;
    };

    /* Callback function for zeeguu.
     * Fills the dialog's list with all the addable feeds. */
    static _loadFeedOptions(data) {
        var template = $(config.HTML_ID_ADDSUBSCRIPTION_TEMPLATE).html();
        for (var i = 0; i < data.length; i++) {
            var addableData = {
                addableTitle: data[i]['title'],
                addableID: data[i]['id'],
                addableImage: data[i]['image_url']
            };
            var feedOption = $(Mustache.render(template, addableData));
            var subscribeButton = $(feedOption.find(".subscribeButton"));
            subscribeButton.click(function () {
                this._follow($(this).parent());
            });
            var feedIcon = $(feedOption.find(".feedIcon"));
            feedIcon.on( "error", function () {
                $(this).unbind("error").attr("src", "static/images/noAvatar.png");
            });
            $(config.HTML_ID_ADDSUBSCRIPTION_LIST).append(feedOption);
        }
    }

    /* Subscribe to a new feed, calls the zeeguu server.
     * This function is called by an html element.*/
    static _follow(feed) {
        var feedID = $(feed).attr('addableID');
        this.zeeguuRequests.post(config.FOLLOW_FEED_ENDPOINT, {feed_id: feedID}, _.partial(this._onFeedFollowed, feed));
    }

    /* Callback function for zeeguu.
     * A feed has just been followed, so we refresh the subscription list and remove the
     * mentioned feed from the addable feed list. */
    static _onFeedFollowed(feed, data) {
        if (data == "OK") {
            this.subscriptionList.refresh();
            $(feed).fadeOut();
        }
    }
};
