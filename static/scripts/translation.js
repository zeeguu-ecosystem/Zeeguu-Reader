var ZEEGUU_SERVER = "https://www.zeeguu.unibe.ch";
var HTML_ZEEGUUTAG = "ZEEGUU";

// User control functions defined here (handles click events).
$(document).ready(function() {
	$(".translatable").click(function(event) 
	{
		if ($('#toggle_translate').is(':checked'))
		{
			if ($("#alterMenu").is(":visible"))
				$("#alterMenu").hide();
			else if (event.target.nodeName == HTML_ZEEGUUTAG)
				openAlterMenu(event.target);
			else
				tagText();
		} 
	});
	
	$("#toggle_translate").change(function() {
		if(!this.checked) 
			$("#alterMenu").hide();
	});
});

// Places the alternative translation menu.
function openAlterMenu(zeeguuTag)
{
	var pos = $(zeeguuTag).position();
	var width = $(zeeguuTag).outerWidth();
	var menuHeight = $("#alterMenu").outerHeight();
	$("#alterMenu").css({
		position: "absolute",
		width: width,
		top: pos.top - menuHeight/2 +"px",
		left: pos.left + "px"
	}).fadeIn();
}


// Wraps a zeeguutag including translation around the selected content.
function tagText() 
{
	// Get the current selection.
	var selection = window.getSelection();
	
	// Properly select content
	selection.modify('move','backward','word');
	selection.modify('extend','forward','word');
	coverTag(selection, HTML_ZEEGUUTAG);
	
	// Check if selection has been tagged already, if not tag it.
	if (!isTagged(selection, HTML_ZEEGUUTAG)) {
		var range = selection.getRangeAt(0);	
		var zeeguuTag = document.createElement(HTML_ZEEGUUTAG);
		var contents = range.extractContents();
		clearTags(contents, HTML_ZEEGUUTAG);
		zeeguuTag.appendChild(contents);
		range.insertNode(zeeguuTag);
		mergeZeeguu(zeeguuTag);
		
		var text = escape(zeeguuTag.textContent);
		var context = escape(getContext(selection));
		var url = "zeeguu-mr-core.herokuapp.com";
		requestZeeguu("/translate/nl/en", text, context, url,
					  setTranslation, zeeguuTag);
		requestZeeguu("/get_possible_translations/nl/en", text, context, url,
					  setAlternatives, zeeguuTag);
	}
	
	// Undo selection.
    selection.modify('move','backward','character');
}

function getContext(selection)
{
	selection.modify('move','backward','sentence');
	selection.modify('extend','forward','sentence');
	return selection.toString();
}

function setTranslation(zeeguuTag, translation)
{	
	zeeguuTag.setAttribute("translation", " (" + translation + ") ");
}

function setAlternatives(zeeguuTag, alternatives)
{	
	console.log(alternatives);
}

// Launch request to Zeeguu API.
function requestZeeguu(endpoint, word, context, url, responseHandler, zeeguuTag)
{
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() { 
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
			responseHandler(zeeguuTag, xmlHttp.responseText);
	}
	var postData = "context=" + context;
	postData += "&url=" + url;
	postData += "&word=" + word; 
	xmlHttp.open("POST", ZEEGUU_SERVER + endpoint + "?session=" + SESSION_ID, true); 
	xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlHttp.send(postData);
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
