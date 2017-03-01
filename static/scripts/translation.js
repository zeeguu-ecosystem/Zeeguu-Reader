/* Merges the zeeguutag with the surrounding translated
 * zeeguutags, and then inserts translations for the tag's content.*/
function insertTranslation(zeeguuTag)
{
	mergeZeeguu(zeeguuTag);
	var text = zeeguuTag.textContent;
	var context = getContext(zeeguuTag);
	var url = ARTICLE_FROM_URL;
	// Launch zeeguu request to fill translation options.
	requestZeeguuPOST(GET_TRANSLATIONS_ENDPOINT+'/'+FROM_LANGUAGE+'/'+TO_LANGUAGE,
		{word : text, context : context, url : url},
		_.partial(setTranslations, zeeguuTag));
}

/* This method handles the zeeguu request returned values,
 * and thus actually inserts the returned translations. */
function setTranslations(zeeguuTag, translations)
{
	translations = translations.translations;
	var transCount = Math.min(translations.length, 3);
	zeeguuTag.setAttribute(HTML_ATTRIBUTE_TRANSCOUNT, transCount);
	for (var i = 0; i < transCount; i++)
		zeeguuTag.setAttribute(HTML_ATTRIBUTE_TRANSLATION+i, translations[i].translation);
}

function getContext(zeeguuTag)
{
    return zeeguuTag.parentElement.textContent;
}

/* Merges the translated zeeguutags surrounding the given zeeguutag. */
function mergeZeeguu(zeeguuTag)
{
	var spaces = '';
	var node = zeeguuTag.previousSibling;
	while (node && node.textContent == ' ')
	{
		node = node.previousSibling;
		spaces += ' ';
	}
	if (node && node.nodeName == HTML_ZEEGUUTAG && isTranslated(node))
	{
		zeeguuTag.textContent = node.textContent + spaces + zeeguuTag.textContent;
		node.parentNode.removeChild(node);
	}
	spaces = '';
    node = zeeguuTag.nextSibling;
	while (node && node.textContent == ' ')
	{
		node = node.nextSibling;
		spaces += ' ';

	}
	if (node && node.nodeName == HTML_ZEEGUUTAG && isTranslated(node))
	{
		zeeguuTag.textContent += spaces + node.textContent;
		node.parentNode.removeChild(node);
	}
}

function isTranslated(zeeguuTag)
{
    return zeeguuTag.hasAttribute(HTML_ATTRIBUTE_TRANSCOUNT);
}