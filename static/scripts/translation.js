var ZEEGUU_SERVER = "https://www.zeeguu.unibe.ch";
var HTML_ZEEGUUTAG = "ZEEGUU";

$(document).ready(function() {
	$(".translatable").click(function() 
	{
		if ($('#toggle_translate').is(':checked'))
			tagText();
	});
});

// Wraps a zeeguutag including translation around the selected content.
function tagText() 
{
	// Get the current selection.
	var selection = window.getSelection();
	
	// Properly select content
	selection.modify('move','backward','word');
	selection.modify('extend','forward','word');
	coverTag(selection, HTML_ZEEGUUTAG);
	
	// Check if selection has been tagged already.
	if (!isTagged(selection, HTML_ZEEGUUTAG)) {
		// Insert tags.
		var range = selection.getRangeAt(0);	
		var zeeguuTag = document.createElement(HTML_ZEEGUUTAG);
		var contents = range.extractContents();
		clearTags(contents, HTML_ZEEGUUTAG);
		zeeguuTag.appendChild(contents);
		range.insertNode(zeeguuTag);
		
		mergeZeeguu(zeeguuTag);
		
		// Launch request to Zeeguu API.
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.onreadystatechange = function() { 
			if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
				setTranslation(zeeguuTag, xmlHttp.responseText);
		}
		
		var text = escape(zeeguuTag.textContent); 
		var postData = "context="+text;
		postData += "&url=zeeguu-mr-core.herokuapp.com"
		postData += "&word="+text;
		xmlHttp.open("POST", ZEEGUU_SERVER+"/translate/nl/en", true); 
		xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xmlHttp.send(postData);
	}
	
	// Undo selection.
    selection.modify('move','backward','character');
}

function setTranslation(zeeguuTag, translation)
{	
	zeeguuTag.setAttribute("translation", translation);
}

// Merges the zeeguutags surrounding the given zeeguutag.
function mergeZeeguu(zeeguuTag)
{
	var spaces = '';
	var node = zeeguuTag.previousSibling;
	while (node.textContent == ' ')
	{
		node = node.previousSibling;
		spaces += ' ';
	}
	if (node.nodeName == HTML_ZEEGUUTAG)
	{
		zeeguuTag.textContent = node.textContent + spaces + zeeguuTag.textContent;
		node.parentNode.removeChild(node);
	}
	spaces = '';
    node = zeeguuTag.nextSibling;
	while (node.textContent == ' ')
	{
		node = node.nextSibling;
		spaces += ' ';
		
	}
	if (node.nodeName == HTML_ZEEGUUTAG)
	{
		zeeguuTag.textContent += spaces + node.textContent;
		node.parentNode.removeChild(node);
	}
}

// Fixes partial selection of 'tag' nodes.
function coverTag(selection, tag)
{
	var range = selection.getRangeAt(0);
	var parent = selection.anchorNode.parentElement;
	if (parent && parent.nodeName == tag)
		range.setStartBefore(selection.anchorNode.parentElement);
	selection.addRange(range);
}

// Checks if the selection is tagged with tag.
function isTagged(selection, tag) {
	var range = selection.getRangeAt(0);
	var contents = range.cloneContents();
	var children = contents.children;
	return (children.length == 1 && children[0].nodeName == tag)
		    && (contents.textContent == children[0].textContent);
}

// Clears the given contents from tag.
function clearTags(contents, tag) {
	var temp = document.createElement('div');

	while (contents.firstChild)
		temp.appendChild(contents.firstChild);

	var tags = temp.getElementsByTagName(tag);
	var length = tags.length;

	while (length--)
		$(tags[length]).contents().unwrap();

	while (temp.firstChild)
		contents.appendChild(temp.firstChild);	
}
