import $ from 'jquery';
import Mustache from 'mustache';
import config from '../config';
import ZeeguuRequests from '../zeeguuRequests';

/**
 * Allows the user to add or remove feed subscriptions.
 */
export default class FeedSubscriber {
    constructor(subscriptionList) {
        this.subscriptionList = subscriptionList;
        this.currentLanguage = 'nl';
    }

    /* Calls zeeguu and requests recommended feeds for the given 'language'.
     * If the language is not given, it simply uses the last used language. */
    load(language) {
        language = typeof language !== 'undefined' ? language : this.currentLanguage;
        ZeeguuRequests.get(config.RECOMMENDED_FEED_ENDPOINT + '/' + language,
                                {}, this._loadFeedOptions.bind(this));
        this.currentLanguage = language;
    };

    clear() {
        $(config.HTML_ID_ADDSUBSCRIPTION_LIST).empty();
    };

    getCurrentLanguage() {
        return this.currentLanguage;
    };

    /* Callback function for zeeguu.
     * Fills the dialog's list with all the addable feeds. */
    _loadFeedOptions(data) {
        var template = $(config.HTML_ID_ADDSUBSCRIPTION_TEMPLATE).html();
        for (var i = 0; i < data.length; i++) {
            var addableData = {
                addableTitle: data[i]['title'],
                addableID: data[i]['id'],
                addableImage: data[i]['image_url']
            };
            var feedOption = $(Mustache.render(template, addableData));
            var subscribeButton = $(feedOption.find(".subscribeButton"));
            var _follow = this._follow.bind(this);
            subscribeButton.click(function () {
                _follow($(this).parent());
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
    _follow(feed) {
        var feedID = $(feed).attr('addableID');
        var callback = ((data) => this._onFeedFollowed(feed, data)).bind(this);
        ZeeguuRequests.post(config.FOLLOW_FEED_ENDPOINT, {feed_id: feedID}, callback);
    }

    /* Callback function for zeeguu.
     * A feed has just been followed, so we refresh the subscription list and remove the
     * mentioned feed from the addable feed list. */
    _onFeedFollowed(feed, data) {
        if (data == "OK") {
            this.subscriptionList.load();
            $(feed).fadeOut();
        }
    }
};
