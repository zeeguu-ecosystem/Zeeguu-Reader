import $ from 'jquery';
import config from '../config';
import Mustache from 'mustache';
import UserActivityLogger from '../UserActivityLogger';
import ZeeguuRequests from '../zeeguuRequests';
import {GET_AVAILABLE_LANGUAGES} from '../zeeguuRequests';


const HTML_ID_LANGUAGE_OPTION_LIST = '#languageOptionList';
const HTML_ID_LANGUAGE_OPTION_TEMPLATE = '#languageOption-template';
const USER_EVENT_SET_LANGUAGE = 'SET LANGUAGE';

/**
 * Retrieves the available languages of Zeeguu and fills
 * the {@link SourceSubscriber}'s dialog with these options.
 */
export default class LanguageMenu {

    /**
     * Bind this instance to the associated {@link SourceSubscriber}.
     * @param {SourceSubscriber} sourceSubscriber - List of non-subscribed feeds to update.
     */
    constructor(sourceSubscriber) {
        this.sourceSubscriber = sourceSubscriber;
    }

    /**
     * Load the available languages for the dialog.
     * Uses {@link ZeeguuRequests}.
     */
    load() {
        ZeeguuRequests.get(GET_AVAILABLE_LANGUAGES, {}, this._loadLanguageOptions.bind(this));
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
            let sourceSubscriber = this.sourceSubscriber;
            languageOption.on('click', function () {
                let language = $(this).attr('id');
                UserActivityLogger.log(USER_EVENT_SET_LANGUAGE, language, data);
                sourceSubscriber.clear();
                sourceSubscriber.load(language);
                $(this).siblings().removeClass(config.HTML_CLASS_FOCUSED);
                $(this).addClass(config.HTML_CLASS_FOCUSED);
            });
            $(HTML_ID_LANGUAGE_OPTION_LIST).append(languageOption);
        }
        $('#' + this.sourceSubscriber.getCurrentLanguage()).addClass(config.HTML_CLASS_FOCUSED);
    }
};
