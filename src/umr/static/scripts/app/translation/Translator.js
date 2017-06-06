import $ from 'jquery';
import ZeeguuRequests from '../zeeguuRequests'
import UndoStack from './UndoStack'
import config from '../config'

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
        this.fromLanguage = FROM_LANGUAGE;
        this.toLanguage = config.TO_LANGUAGE; // en is default
        ZeeguuRequests.get(config.GET_NATIVE_LANGUAGE, {}, function (language) {
            this.toLanguage = language;
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
        var tmp_trans = this._mergeZeeguu(zeeguuTag);

        var text = zeeguuTag.textContent.trim();
        var context = this._getContext(zeeguuTag);
        var url = $(config.HTML_ID_ARTICLE_URL).find('a').attr('href');
        var title = $(config.HTML_ID_ARTICLE_TITLE).text();

        var orig = document.createElement(config.HTML_ORIGINAL);
        var tran = document.createElement(config.HTML_TRANSLATED);

        $(orig).text(text);
        $(zeeguuTag).addClass(config.CLASS_LOADING);
        $(tran).attr('chosen', tmp_trans);
        $(zeeguuTag).empty().append(orig, tran);

        var callback = (data) => this._setTranslations(zeeguuTag, data);
        // Launch Zeeguu request to fill translation options.
        ZeeguuRequests.post(config.GET_TRANSLATIONS_ENDPOINT + '/' + this.fromLanguage + '/' + this.toLanguage,
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
        var word = $zeeguu.children(config.HTML_ORIGINAL).text();
        var context = this._getContext($zeeguu.get(0));
        var url = $(config.HTML_ID_ARTICLE_URL).find('a').attr('href');
        var title = $(config.HTML_ID_ARTICLE_TITLE).text();
        var translation = $zeeguu.children(config.HTML_TRANSLATED).attr(config.HTML_ATTRIBUTE_SUGGESTION);

        // Launch Zeeguu request to supply translation suggestion.
        ZeeguuRequests.post(config.POST_TRANSLATION_SUGGESTION + '/' + this.fromLanguage + '/' + this.toLanguage,
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
    _getContext(zeeguuTag) {
        return zeeguuTag.parentElement.textContent;
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