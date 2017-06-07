import $ from 'jquery';
import config from '../config';
import Mustache from 'mustache';
import ZeeguuRequests from '../zeeguuRequests';

/**
 * Retrieves the available languages of Zeeguu and fills
 * the {@link FeedSubscriber}'s dialog with these options.
 */
export default class LanguageMenu {
    /**
     * Load the available languages for the dialog.
     * Uses {@link ZeeguuRequests}.
     * @param {FeedSubscriber} feedSubscriber - List of non-subscribed feeds to update.
     */
    load(feedSubscriber) {
        let callback = ((data) => this._loadLanguageOptions(data, feedSubscriber)).bind(this);
        ZeeguuRequests.get(config.GET_AVAILABLE_LANGUAGES, {}, callback);
    }

    /**
     * Generates all the available language options as buttons in the dialog.
     * Callback function from the zeeguu request.
     * @param {string} data - JSON string of an array of language codes.
     * @param {FeedSubscriber} feedSubscriber - List of non-subscribed feeds to update.
     */
    _loadLanguageOptions(data, feedSubscriber)
    {
        let options = JSON.parse(data);
        let template = $(config.HTML_ID_LANGUAGEOPTION_TEMPLATE).html();
        options.sort();
        for (let i=0; i < options.length; ++i)
        {
            let languageOptionData = {
                languageOptionCode: options[i]
            };
            let languageOption = $(Mustache.render(template, languageOptionData));
            languageOption.on('click', function () {
                feedSubscriber.clear();
                feedSubscriber.load($(this).attr('id'));
                $(this).siblings().removeClass(config.HTML_CLASS_FOCUSED);
                $(this).addClass(config.HTML_CLASS_FOCUSED);
            });
            $("#languageOptionList").append(languageOption);
        }
        $('#' + feedSubscriber.getCurrentLanguage()).addClass(config.HTML_CLASS_FOCUSED);
    }
};
