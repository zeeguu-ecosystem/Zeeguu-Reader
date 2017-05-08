import $ from 'jquery';
import ZeeguuRequests from '../zeeguuRequests'
import config from '../config'

/**
 *  Class that allows for translating zeeguu tags. 
 */
export default class Translator {
    /**
     * Merge the surrounding translated zeeguuTags
     * and insert translations for the tag's content by calling Zeeguu.
     * Uses {@link ZeeguuRequests}.
     * @param {Element} zeeguuTag - Document element containing the content to be translated. 
     */
    translate(zeeguuTag) {
        this._mergeZeeguu(zeeguuTag);

        // Add tag to the loading animation class.
        $(zeeguuTag).addClass('loading'); 
        
        var text = zeeguuTag.textContent;
        var context = this._getContext(zeeguuTag);
        var url = $(config.HTML_ID_ARTICLE_URL).text();
        var title = $(config.HTML_ID_ARTICLE_TITLE).text();

        var callback = (data) => this._setTranslations(zeeguuTag, data);
        // Launch Zeeguu request to fill translation options.
        ZeeguuRequests.post(config.GET_TRANSLATIONS_ENDPOINT + '/' + FROM_LANGUAGE + '/' + config.TO_LANGUAGE,
                           {word: text, context: context, url: url, title: title}, callback);
    }

    /**
     *  Checks whether given zeeguuTag is already translated.
     * @param {Element} zeeguuTag - Document element that wraps translatable content. 
     * @return {Boolean} - True only if the passed zeeguuTag already has translation data.    
     */
    isTranslated(zeeguuTag) {
        return zeeguuTag.hasAttribute(config.HTML_ATTRIBUTE_TRANSCOUNT);
    }

    /**
     * Handle the Zeeguu request returned values. Append the returned translations.
     * @param {Element} zeeguuTag - Document element processed for translation.
     * @param {Object[]} translations - A list of translations for the given zeeguuTag content. 
     */
    _setTranslations(zeeguuTag, translations) {
        translations = translations.translations;
        var transCount = Math.min(translations.length, 3);
        zeeguuTag.setAttribute(config.HTML_ATTRIBUTE_TRANSCOUNT, transCount);
        for (var i = 0; i < transCount; i++)
            zeeguuTag.setAttribute(config.HTML_ATTRIBUTE_TRANSLATION + i, translations[i].translation);

        // Remove the loading animation class.
        $(zeeguuTag).removeClass('loading');
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
     *  Merge the translated zeeguuTags surrounding the given zeeguuTag. 
     *  @param {Element} zeeguuTag - Tag for which to perform merge with the surrounding tags. 
     */
    _mergeZeeguu(zeeguuTag) {
        var spaces = '';
        var node = zeeguuTag.previousSibling;
        while (node && node.textContent == ' ') {
            node = node.previousSibling;
            spaces += ' ';
        }
        if (node && node.nodeName == config.HTML_ZEEGUUTAG && this.isTranslated(node)) {
            zeeguuTag.textContent = node.textContent + spaces + zeeguuTag.textContent;
            node.parentNode.removeChild(node);
        }
        spaces = '';
        node = zeeguuTag.nextSibling;
        while (node && node.textContent == ' ') {
            node = node.nextSibling;
            spaces += ' ';

        }
        if (node && node.nodeName == config.HTML_ZEEGUUTAG && this.isTranslated(node)) {
            zeeguuTag.textContent += spaces + node.textContent;
            node.parentNode.removeChild(node);
        }
    }

};