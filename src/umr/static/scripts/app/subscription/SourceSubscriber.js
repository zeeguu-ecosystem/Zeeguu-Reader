import $ from 'jquery';
import Mustache from 'mustache';
import config from '../config';
import LanguageMenu from './LanguageMenu';
import swal from 'sweetalert';
import UserActivityLogger from '../UserActivityLogger';
import ZeeguuRequests from '../zeeguuRequests';
import {GET_LEARNED_LANGUAGE} from '../zeeguuRequests';
import {RECOMMENDED_FEED_ENDPOINT} from '../zeeguuRequests';
import {take_keyboard_focus_away_from_article_list} from './main.js';

const HTML_ID_DIALOG_TEMPLATE = '#add-subscription-dialog-template';
const HTML_ID_ADD_FEED_LIST = '#addableFeedList';
const HTML_ID_FEED_TEMPLATE = '#feedAddable-template';
const HTML_CLASS_SUBSCRIBE_BUTTON = ".subscribeButton";
const HTML_CLASS_FEED_ICON = '.feedIcon';
const USER_EVENT_OPENED_FEEDSUBSCRIBER = 'OPEN FEEDSUBSCRIBER';

/**
 * Allows the user to add source subscriptions.
 */
export default class SourceSubscriber {
    /**
     * Link the {@link SourceSubscriptionList} with this instance so we can update it on change.
     * @param {SourceSubscriptionList} sourceSubscriptionList - Local (!) list of currently subscribed-to sources.
     */
    constructor(sourceSubscriptionList) {
        this.sourceSubscriptionList = sourceSubscriptionList;
        this.languageMenu = new LanguageMenu(this);
        this.currentLanguage = 'nl'; // default
        ZeeguuRequests.get(GET_LEARNED_LANGUAGE, {},
            function (lang) {
                this.currentLanguage = lang;
            }.bind(this));
    }

    /**
     * Open the dialog window containing the list of sources.
     * Uses the sweetalert library.
     */
    open() {

        take_keyboard_focus_away_from_article_list();

        UserActivityLogger.log(USER_EVENT_OPENED_FEEDSUBSCRIBER, this.currentLanguage);
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
     * Call Zeeguu and requests recommended sources for the given language.
     * If the language is not given, it simply uses the last used language.
     * Uses {@link ZeeguuRequests}.
     * @param {string} language - Language code.
     * @example load('nl');
     */
    load(language = this.currentLanguage) {
        ZeeguuRequests.get(RECOMMENDED_FEED_ENDPOINT + '/' + language,
                                {}, this.loadSourceOptions.bind(this));
        this.currentLanguage = language;
    }

    /**
     * Clear the list of source options.
     */
    clear() {
        $(HTML_ID_ADD_FEED_LIST).empty();
    }

    /**
     * Return the language for the source options currently displayed.
     * @return {string} - The language of source options currently on display.
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
     * Fills the dialog's list with all the addable sources.
     * Callback function for zeeguu.
     * @param {Object[]} data - A list of sources the user can subscribe to.
     */
    loadSourceOptions(data) {
        let template = $(HTML_ID_FEED_TEMPLATE).html();
        for (let i = 0; i < data.length; i++) {
            let sourceOption = $(Mustache.render(template, data[i]));
            let subscribeButton = $(sourceOption.find(HTML_CLASS_SUBSCRIBE_BUTTON));

            subscribeButton.click(
                function (data, sourceOption, sourceSubscriptionList) {
                    return function() {
                        sourceSubscriptionList.follow(data);
                        $(sourceOption).fadeOut();
                    };
            }(data[i], sourceOption, this.sourceSubscriptionList));

            let sourceIcon = $(sourceOption.find(HTML_CLASS_FEED_ICON));
            sourceIcon.on( "error", function () {
                $(this).unbind("error").attr("src", "static/images/noAvatar.png");
            });
            $(HTML_ID_ADD_FEED_LIST).append(sourceOption);
        }
    }
};
