import $ from 'jquery';
import config from '../config';
import Mustache from 'mustache';
import ZeeguuRequests from '../zeeguuRequests';

/**
 * Retrieves the available languages of Zeeguu and fills
 * the Subscription Manager's dialog with these options.
 */
export default class LanguageMenu {
    constructor(feedSubscriber) {
        this.feedSubscriber = feedSubscriber;
    }

    /* Load the available languages for the dialog. */
    load() {
        ZeeguuRequests.get(config.GET_AVAILABLE_LANGUAGES, {}, this._loadLanguageOptions.bind(this));
    }

    /* Callback function from the zeeguu request.
     * Generates all the available language options as buttons in the dialog. */
    _loadLanguageOptions(data)
    {
        var options = JSON.parse(data);
        var template = $(config.HTML_ID_LANGUAGEOPTION_TEMPLATE).html();
        options.sort();
        for (var i=0; i < options.length; ++i)
        {
            var languageOptionData = {
                languageOptionCode: options[i]
            }
            var languageOption = $(Mustache.render(template, languageOptionData));
            var feedSubscriber = this.feedSubscriber;
            languageOption.on('click', function () {
                feedSubscriber.clear();
                feedSubscriber.load($(this).attr('id'));
            });
            $("#languageOptionList").append(languageOption);
        }
    }
};