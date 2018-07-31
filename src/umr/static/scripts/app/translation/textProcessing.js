import config from "../config";

export function addParagraphs(text) {
    text = '<p>' + text;
    text = text.replace(/\n\n/g, '</p><p>');
    return text;
}

export function filterShit(text) {
    text = text.replace(/^false/g, '');
    text = text.replace(/^true/g, '');

    return text;
}

export function wrapWordsInZeeguuTags(text) {
    text = text.replace(/([a-zA-Z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF\u0100-\u017F\u0180-\u024F_'’-]+)/g,
        "<" + config.HTML_ZEEGUUTAG + ">$1</" + config.HTML_ZEEGUUTAG + ">");
    return text;
}

