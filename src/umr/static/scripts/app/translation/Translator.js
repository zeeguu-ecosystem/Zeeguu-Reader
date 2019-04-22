import $ from 'jquery';
import config from '../config';
import UndoStack from './UndoStack';
import UserActivityLogger from '../UserActivityLogger';
import ZeeguuRequests from '../zeeguuRequests';
import {GET_TRANSLATIONS_ENDPOINT, GET_NEXT_TRANSLATIONS_ENDPOINT} from '../zeeguuRequests';
import {POST_TRANSLATION_SUGGESTION} from '../zeeguuRequests';
import {HTML_ID_ALTERMENU} from "./AlterMenu";


const USER_EVENT_TRANSLATE = 'TRANSLATE TEXT';
const USER_EVENT_UNDO_TRANSLATE = 'UNDO TEXT TRANSLATION';
const USER_EVENT_SEND_SUGGESTION = 'SEND SUGGESTION';
const MAX_TRANSLATIONS_TO_DISPLAY = 5;

/**
 *  Class that allows for translating zeeguu tags.
 */
export default class Translator {

    /**
     * Initializes the undo manager.
     */
    constructor(from_language, to_language) {
        this.undoStack = new UndoStack();
        this.from_language = from_language;
        this.connectivesSet = this._buildConnectivesSet();
        this.to_language = to_language;
    }

    /**
     * Merge the surrounding translated zeeguuTags
     * and insert translations for the tag's content by calling Zeeguu.
     * Uses {@link ZeeguuRequests}.
     * @param {Element} zeeguuTag - Document element containing the content to be translated.
     */
    translate(zeeguuTag) {
        this.undoStack.pushState();
        let tmp_trans = this._mergeZeeguu(zeeguuTag);

        let text = zeeguuTag.textContent.trim();
        let context = Translator._getContext(zeeguuTag);
        let url = window.location.href;
        let title = $(config.HTML_ID_ARTICLE_TITLE).text();

        let orig = document.createElement(config.HTML_ORIGINAL);
        let tran = document.createElement(config.HTML_TRANSLATED);

        $(orig).text(text);
        $(zeeguuTag).addClass("origtrans");
        $(zeeguuTag).addClass(config.CLASS_LOADING);
        $(tran).attr('chosen', tmp_trans);
        $(zeeguuTag).empty().append(tran, orig);

        let callback = (data) => this._setTranslations(zeeguuTag, data);
        // Launch Zeeguu request to fill translation options.
        ZeeguuRequests.post(GET_TRANSLATIONS_ENDPOINT + '/' + this.from_language + '/' + this.to_language,
            {word: text, context: context, url: url, title: title}, callback);

        UserActivityLogger.log_article_interaction(USER_EVENT_TRANSLATE, text);
    }

    /**
     * Merge the surrounding translated zeeguuTags
     * and insert translations for the tag's content by calling Zeeguu.
     * Uses {@link ZeeguuRequests}.
     * @param {Element} zeeguuTag - Document element containing the content to be translated.
     */
    getTopTranslation(zeeguuTag) {
        this.undoStack.pushState();
        let tmp_trans = this._mergeZeeguu(zeeguuTag);

        let text = zeeguuTag.textContent.trim();
        let context = Translator._getContext(zeeguuTag);
        let url = window.location.href;
        let title = $(config.HTML_ID_ARTICLE_TITLE).text();

        let orig = document.createElement(config.HTML_ORIGINAL);
        let tran = document.createElement(config.HTML_TRANSLATED);

        $(orig).text(text);
        $(zeeguuTag).addClass("origtrans");
        $(zeeguuTag).addClass(config.CLASS_LOADING);
        $(tran).attr('chosen', tmp_trans);
        $(zeeguuTag).empty().append(tran, orig);

        let callback = (data) => {
            this._setTopTranslation(zeeguuTag, data.translations);
            this._set_transcount(zeeguuTag, data.translations.length);
        }
        // Launch Zeeguu request to fill translation options.
        ZeeguuRequests.post(GET_NEXT_TRANSLATIONS_ENDPOINT + '/' + this.from_language + '/' + this.to_language,
            {word: text, context: context, url: url, title: title, numberOfResults: 1}, callback);

        UserActivityLogger.log_article_interaction(USER_EVENT_TRANSLATE, text);
    }

    /**
     * Merge the surrounding translated zeeguuTags
     * and insert translations for the tag's content by calling Zeeguu.
     * Uses {@link ZeeguuRequests}.
     * @param {Element} zeeguuTag - Document element containing the content to be translated.
     * @param {String} serviceName - Previous service name that served the request.
     * @param {String} previousTranslation - Previous translation result from the serviceName service.
     * @param {Element} alterMenu - AlterMenu element which will be automatically opened
        in the callback.
     * @param {Element} target - Document element which will be used for the AlterMenu
        build method call in the callback.
     */
    getNextTranslations(zeeguuTag, serviceName, previousTranslation, alterMenu, target) {
        let text = zeeguuTag.textContent.trim();
        let context = Translator._getContext(zeeguuTag);
        let url = window.location.href;
        let title = $(config.HTML_ID_ARTICLE_TITLE).text();

        let orig = document.getElementById(config.HTML_ORIGINAL);
        let tran = document.getElementById(config.HTML_TRANSLATED);

        $(zeeguuTag).addClass(config.CLASS_LOADING);

        let callback = (data) => {
            this._setAlternativeTranslations(zeeguuTag, data.translations);
            this._set_transcount(zeeguuTag, data.translations.length + 1);
            alterMenu.build(target);
        }
        // Launch Zeeguu request to fill translation options.
        ZeeguuRequests.post(GET_NEXT_TRANSLATIONS_ENDPOINT + '/' + this.from_language + '/' + this.to_language,
            {word: text, context: context, url: url, title: title, service: serviceName, numberOfResults: -1,
                currentTranslation: previousTranslation}, callback);

        UserActivityLogger.log_article_interaction(USER_EVENT_TRANSLATE, text);
    }

    /**
     * Resets to previous state (i.e. removes translation from last translated word).
     */
    undoTranslate() {
        this.undoStack.undoState();
        UserActivityLogger.log_article_interaction(USER_EVENT_UNDO_TRANSLATE);
    }

    /**
     * Sends a post request to Zeeguu about a contribution/suggestion for a translation from user.
     * @param {jQuery} $zeeguu - Zeeguu reference tag for which to send the user suggestion.
     */
    sendSuggestion($zeeguu) {
        let word = $zeeguu.children(config.HTML_ORIGINAL).text();
        let context = Translator._getContext($zeeguu.get(0));
        let url = window.location.href;
        let title = $(config.HTML_ID_ARTICLE_TITLE).text();
        let translation = $zeeguu.children(config.HTML_TRANSLATED).attr(config.HTML_ATTRIBUTE_SUGGESTION);

        // Launch Zeeguu request to supply translation suggestion.
        ZeeguuRequests.post(POST_TRANSLATION_SUGGESTION + '/' + this.from_language + '/' + this.to_language,
            {word: word, context: context, url: url, title: title, translation: translation});

        UserActivityLogger.log_article_interaction(USER_EVENT_SEND_SUGGESTION, word, {translation: translation});
    }

    /**
     * Checks whether given zeeguuTag is already translated.
     * @param {jQuery} $zeeguu - Zeeguu reference tag that wraps translatable content.
     * @return {Boolean} - True only if the passed zeeguuTag already has translation data.
     */
    isTranslated($zeeguu) {
        return $zeeguu.has(config.HTML_TRANSLATED).length;
    }

    /**
     * Handle the Zeeguu request returned values. Append the returned translations.
     * @param {Element} zeeguuTag - Document element containing the original text and the translations.
     * @param {Object[]} translations - A list of translations to be added to the given htmlTag content.
     */
    _setTranslations(zeeguuTag, translations) {

        var tran = zeeguuTag.children[0];
        translations = translations.translations;

        this._setTopTranslation(zeeguuTag, translations);
        // Setting the rest of the translations. Passing all translations except the first one.
        // Slice will return empty array if the translations length is 1.
        this._setAlternativeTranslations(zeeguuTag, translations.slice(1));

        this._set_transcount(zeeguuTag, translations.length);
    }

    _set_transcount(zeeguuTag, translationsNumber) {
        var tran = zeeguuTag.children[0];
        var transCount = Math.min(translationsNumber, MAX_TRANSLATIONS_TO_DISPLAY);

        if (transCount > 1) {
            var d = document.createElement(config.HTML_TAG__MORE_ALTERNATIVES);
            $(d).on("click", function (event) {
                $(this).parent().trigger("click")
            });
            tran.appendChild(d);
        } else {
            var d = document.createElement(config.HTML_TAG__SINGLE_ALTERNATIVE);
            tran.appendChild(d);
        }

        tran.setAttribute(config.HTML_ATTRIBUTE_TRANSCOUNT, transCount);
    }

    _remove_loading_class(zeeguuTag) {
        if ($(zeeguuTag).hasClass(config.CLASS_LOADING)) {
            $(zeeguuTag).removeClass(config.CLASS_LOADING);
        }
    }

    _setTopTranslation(zeeguuTag, translations) {
        var tran = zeeguuTag.children[0];

        tran.setAttribute(config.HTML_ATTRIBUTE_CHOSEN, translations[0].translation); // default chosen translation is 0
        tran.setAttribute(config.HTML_ATTRIBUTE_SUGGESTION, '');
        // Set the attribute translate all to empty which will make the next request to fetch all translations
        tran.setAttribute(config.HTML_ATTRIBUTE_TRANSLATE_ALL, '');
        tran.setAttribute(config.HTML_ATTRIBUTE_TRANSLATION + 0, translations[0].translation);
        tran.setAttribute(config.HTML_ATTRIBUTE_SERVICENAME_TRANSLATION + 0, translations[0].source);

        this._remove_loading_class(zeeguuTag);
    }

    _setAlternativeTranslations(zeeguuTag, translations) {
        var tran = zeeguuTag.children[0];

        // The first translation (config.HTML_ATTRIBUTE_TRANSLATION + 0) is already set.
        // The array translations doesn't contain the first translation, only the alternatives,
        // thus starting from (config.HTML_ATTRIBUTE_TRANSLATION + 1).
        for (var i = 1; i < translations.length + 1; i++) {
            tran.setAttribute(config.HTML_ATTRIBUTE_TRANSLATION + i, translations[i - 1].translation);
            tran.setAttribute(config.HTML_ATTRIBUTE_SERVICENAME_TRANSLATION + i, translations[i - 1].source);
        }

        tran.setAttribute(config.HTML_ATTRIBUTE_TRANSLATE_ALL, 'false');

        this._remove_loading_class(zeeguuTag);
    }

    /**
     * Returns surrounding textual context for a given zeeguuTag by extracting the text from
     * its wrapping parent element.
     * @param {Element} zeeguuTag - Document element for which to extract textual context
     * @return {string} - Textual context.
     */
    static _getContext(zeeguuTag) {
        let zeeguuParentClone = zeeguuTag.parentElement.cloneNode(true);
        $(zeeguuParentClone).find(HTML_ID_ALTERMENU).remove();
        return zeeguuParentClone.textContent;
    }

    /**
     * Merge the translated zeeguuTags surrounding the given zeeguuTag.
     * @param {Element} zeeguuTag - Zeeguu tag for which to perform merge with the surrounding tags.
     * @return {string} - Temporary mock translation text.
     */
    _mergeZeeguu(zeeguuTag) {
        var tmp_trans = '';
        var connectives = '';
        var padding_len = zeeguuTag.textContent.length; // approximates the size of the to be translated word

        var node = zeeguuTag.previousSibling;

        while (node && this.connectivesSet.has(node.textContent.trim())) {
            connectives = node.textContent + connectives;
            node = node.previousSibling;
        }

        if (node && node.nodeName == config.HTML_ZEEGUUTAG && this.isTranslated($(node))) {
            zeeguuTag.textContent = node.textContent + connectives + zeeguuTag.textContent;
            tmp_trans = tmp_trans.concat($(node).find('tran').attr('chosen'));
            node.parentNode.removeChild(node.nextSibling);
            node.parentNode.removeChild(node);
        }

        tmp_trans = tmp_trans.concat(' ' + '.'.repeat(padding_len) + ' ');
        connectives = '';
        node = zeeguuTag.nextSibling;
        while (node && this.connectivesSet.has(node.textContent.trim())) {
            connectives += node.textContent;
            node = node.nextSibling;
        }

        if (node && node.nodeName == config.HTML_ZEEGUUTAG && this.isTranslated($(node))) {
            zeeguuTag.textContent += connectives + node.textContent;
            tmp_trans = tmp_trans.concat($(node).find('tran').attr('chosen'));
            node.parentNode.removeChild(node.previousSibling);
            node.parentNode.removeChild(node);
        }
        return tmp_trans;
    }

    /**
     * Build the used connectives set, for which the merge function will merge over.
     * @return {Set} - The set containing the available connectives.
     */
    _buildConnectivesSet() {
        let set = new Set();
        set.add('');
        set.add('-');
        set.add(':');
        set.add(';');
        set.add('\'');
        set.add('’');
        set.add('‘');
        return set;
    }

};
