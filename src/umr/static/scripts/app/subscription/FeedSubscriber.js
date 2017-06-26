import $ from 'jquery';
import Mustache from 'mustache';
import config from '../config';
import ZeeguuRequests from '../zeeguuRequests';
import LanguageMenu from './LanguageMenu';
import swal from 'sweetalert';

const HTML_ID_DIALOG_TEMPLATE = '#add-subscription-dialog-template';
const HTML_ID_ADD_FEED_LIST = '#addableFeedList';
const HTML_ID_FEED_TEMPLATE = '#feedAddable-template';
const HTML_CLASS_SUBSCRIBE_BUTTON = ".subscribeButton";
const HTML_CLASS_FEED_ICON = '.feedIcon';

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
        this.languageMenu = new LanguageMenu(this);
        this.currentLanguage = 'nl'; // default
        ZeeguuRequests.get(config.GET_LEARNED_LANGUAGE, {}, 
            function (lang) {
                this.currentLanguage = lang;
            }.bind(this));
    }

    /**
     * Open the dialog window containing the list of feeds.
     * Uses the sweetalert library.
     */
    open() {
        let template = $(HTML_ID_DIALOG_TEMPLATE).html();
        swal({
            title: 'Available Sources',
            text: template,
            html: true,
            allowOutsideClick: true,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonText: 'Close',
        });

        this.languageMenu.load(this);
        this.load();
    }

    /**
     * Call Zeeguu and requests recommended feeds for the given language.
     * If the language is not given, it simply uses the last used language.
     * Uses {@link ZeeguuRequests}.
     * @param {string} language - Language code.
     * @example load('nl');
     */
    load(language = this.currentLanguage) {
        ZeeguuRequests.get(config.RECOMMENDED_FEED_ENDPOINT + '/' + language,
                                {}, this._loadFeedOptions.bind(this));
        this.currentLanguage = language;
    }

    /**
     * Clear the list of feed options.
     */
    clear() {
        $(HTML_ID_ADD_FEED_LIST).empty();
    }

    /**
     * Return the language for the feed options currently displayed.
     * @return {string} - The language of feed options currently on display.
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Sets the current language that user is studying (based on zeeguu settings).
     * @param {string} language - The language code.
     */
    _setCurrentLanguage(language) {
        this.currentLanguage = language;
    }

    /**
     * Fills the dialog's list with all the addable feeds.
     * Callback function for zeeguu.
     * @param {Object[]} data - A list of feeds the user can subscribe to.
     */
    _loadFeedOptions(data) {
        let template = $(HTML_ID_FEED_TEMPLATE).html();
        for (let i = 0; i < data.length; i++) {
            let feedOption = $(Mustache.render(template, data[i]));
            let subscribeButton = $(feedOption.find(HTML_CLASS_SUBSCRIBE_BUTTON));

            subscribeButton.click(
                function (data, feedOption, subscriptionList) {
                    return function() {
                        subscriptionList.follow(data);
                        $(feedOption).fadeOut();
                    };
            }(data[i], feedOption, this.subscriptionList));

            let feedIcon = $(feedOption.find(HTML_CLASS_FEED_ICON));
            feedIcon.on( "error", function () {
                $(this).unbind("error").attr("src", "static/images/noAvatar.png");
            });
            $(HTML_ID_ADD_FEED_LIST).append(feedOption);
        }
    }
};
