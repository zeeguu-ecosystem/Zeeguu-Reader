import $ from 'jquery';
import ZeeguuRequests from '../zeeguuRequests'
import config from '../config'

/* Class that allows for translating zeeguu tags. */
export default class Translator {
    /* Merges the zeeguutag with the surrounding translated
     * zeeguutags, and then inserts translations for the tag's content.*/
    translate(zeeguuTag) {
        this._mergeZeeguu(zeeguuTag);
        
        $(zeeguuTag).addClass('loading'); // adds it to the loading animation class
        
        var text = zeeguuTag.textContent;
        var context = this._getContext(zeeguuTag);
        var url = $(config.HTML_ID_ARTICLE_URL).text();
        var title = $(config.HTML_ID_ARTICLE_TITLE).text();

        var callback = (data) => this._setTranslations(zeeguuTag, data);
        // Launch zeeguu request to fill translation options.
        ZeeguuRequests.post(config.GET_TRANSLATIONS_ENDPOINT + '/' + FROM_LANGUAGE + '/' + config.TO_LANGUAGE,
                           {word: text, context: context, url: url, title: title}, callback);
    }

    isTranslated(zeeguuTag) {
        return zeeguuTag.hasAttribute(config.HTML_ATTRIBUTE_TRANSCOUNT);
    }

    /* This method handles the zeeguu request returned values,
     * and thus actually inserts the returned translations. */
    _setTranslations(zeeguuTag, translations) {
        translations = translations.translations;
        var transCount = Math.min(translations.length, 3);
        zeeguuTag.setAttribute(config.HTML_ATTRIBUTE_TRANSCOUNT, transCount);
        for (var i = 0; i < transCount; i++)
            zeeguuTag.setAttribute(config.HTML_ATTRIBUTE_TRANSLATION + i, translations[i].translation);

        $(zeeguuTag).removeClass('loading'); // removes the animation class
    }

    _getContext(zeeguuTag) {
        return zeeguuTag.parentElement.textContent;
    }

    /* Merges the translated zeeguutags surrounding the given zeeguutag. */
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