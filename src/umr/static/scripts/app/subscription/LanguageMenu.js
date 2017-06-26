import $ from 'jquery';
import config from '../config';
import Mustache from 'mustache';
import ZeeguuRequests from '../zeeguuRequests';

const HTML_ID_LANGUAGE_OPTION_LIST = '#languageOptionList';
const HTML_ID_LANGUAGE_OPTION_TEMPLATE = '#languageOption-template';

/**
 * Retrieves the available languages of Zeeguu and fills
 * the {@link FeedSubscriber}'s dialog with these options.
 */
export default class LanguageMenu {

    /**
     * Bind this instance to the associated {@link FeedSubscriber}.
     * @param {FeedSubscriber} feedSubscriber - List of non-subscribed feeds to update.
     */
    constructor(feedSubscriber) {
        this.feedSubscriber = feedSubscriber;
    }

    /**
     * Load the available languages for the dialog.
     * Uses {@link ZeeguuRequests}.
     */
    load() {
        ZeeguuRequests.get(config.GET_AVAILABLE_LANGUAGES, {}, this._loadLanguageOptions.bind(this));
    }

    /**
     * Generates all the available language options as buttons in the dialog.
     * Callback function from the zeeguu request.
     * @param {string} data - JSON string of an array of language codes.
     */
    _loadLanguageOptions(data)
    {
        let options = JSON.parse(data);
        let template = $(HTML_ID_LANGUAGE_OPTION_TEMPLATE).html();
        options.sort();
        for (let i=0; i < options.length; ++i)
        {
            let languageOptionData = {
                languageOptionCode: options[i]
            };
            let languageOption = $(Mustache.render(template, languageOptionData));
            let feedSubscriber = this.feedSubscriber;
            languageOption.on('click', function () {
                feedSubscriber.clear();
                feedSubscriber.load($(this).attr('id'));
                $(this).siblings().removeClass(config.HTML_CLASS_FOCUSED);
                $(this).addClass(config.HTML_CLASS_FOCUSED);
            });
            $(HTML_ID_LANGUAGE_OPTION_LIST).append(languageOption);
        }
        $('#' + this.feedSubscriber.getCurrentLanguage()).addClass(config.HTML_CLASS_FOCUSED);
    }
};
