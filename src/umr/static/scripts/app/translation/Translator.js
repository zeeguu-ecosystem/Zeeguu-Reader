import $ from 'jquery';
import ZeeguuRequests from '../zeeguuRequests';
import UndoStack from './UndoStack';
import config from '../config';

/**
 *  Class that allows for translating zeeguu tags.
 */
export default class Translator {

    /**
     * Initializes the undo manager.
     */
    constructor() {
        this.undoStack = new UndoStack();
        this.connectivesSet = this._buildConnectivesSet();
        ZeeguuRequests.get(config.GET_NATIVE_LANGUAGE, {}, function (language) {
            TO_LANGUAGE = language;
        }.bind(this));
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
        $(zeeguuTag).addClass(config.CLASS_LOADING);
        $(tran).attr('chosen', tmp_trans);
        $(zeeguuTag).empty().append(orig, tran);

        let callback = (data) => this._setTranslations(zeeguuTag, data);
        // Launch Zeeguu request to fill translation options.
        ZeeguuRequests.post(config.GET_TRANSLATIONS_ENDPOINT + '/' + FROM_LANGUAGE + '/' + TO_LANGUAGE,
                           {word: text, context: context, url: url, title: title}, callback);
    }

    /**
     * Resets to previous state (i.e. removes translation from last translated word).
     */
    undoTranslate() {
        this.undoStack.undoState();
    }

    /**
     * Sends a post request to Zeeguu about a contribution/suggestion for a translation from user.
     * @param {jQuery} $zeeguu - Zeeguu reference tag for which to send the user suggestion.
     */
    sendSuggestion ($zeeguu) {
        let word = $zeeguu.children(config.HTML_ORIGINAL).text();
        let context = Translator._getContext($zeeguu.get(0));
        let url = window.location.href;
        let title = $(config.HTML_ID_ARTICLE_TITLE).text();
        let translation = $zeeguu.children(config.HTML_TRANSLATED).attr(config.HTML_ATTRIBUTE_SUGGESTION);

        // Launch Zeeguu request to supply translation suggestion.
        ZeeguuRequests.post(config.POST_TRANSLATION_SUGGESTION + '/' + FROM_LANGUAGE + '/' + TO_LANGUAGE,
                           {word: word, context: context, url: url, title: title, translation: translation});
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
        var tran = zeeguuTag.children[1];
        translations = translations.translations;
        var transCount = Math.min(translations.length, 3);
        tran.setAttribute(config.HTML_ATTRIBUTE_TRANSCOUNT, transCount);
        for (var i = 0; i < transCount; i++)
            tran.setAttribute(config.HTML_ATTRIBUTE_TRANSLATION + i, translations[i].translation);

        tran.setAttribute(config.HTML_ATTRIBUTE_CHOSEN, translations[0].translation); // default chosen translation is 0
        tran.setAttribute(config.HTML_ATTRIBUTE_SUGGESTION, '');
        $(zeeguuTag).removeClass(config.CLASS_LOADING);
    }

    /**
     * Returns surrounding textual context for a given zeeguuTag by extracting the text from
     * its wrapping parent element.
     * @param {Element} zeeguuTag - Document element for which to extract textual context
     * @return {string} - Textual context.
     */
    static _getContext(zeeguuTag) {
        let zeeguuParentClone = zeeguuTag.parentElement.cloneNode(true);        
        $(zeeguuParentClone).find(config.HTML_ID_ALTERMENU).remove();
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

        tmp_trans = tmp_trans.concat(' ' + '..'.repeat(padding_len) + ' ');
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
