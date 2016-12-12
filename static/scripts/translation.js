var ZEEGUU_SERVER = "https://www.zeeguu.unibe.ch";
var HTML_ZEEGUUTAG = "ZEEGUU";
var WORDMODE = "word";
var SENTMODE = "sentence";
var translateMode = WORDMODE;
 
$(document).ready(function() {
	$(".translatable").click(function() {
		tagText();
		if (translateMode == SENTMODE)
		    document.getElementById("modeSwitch").click();
	});
	
	$('#modeSwitch').click(function(){
		if($(this).is(':checked')){
			translateMode = SENTMODE;
		} else {
			translateMode = WORDMODE;
		}
	});
});
 
// Wraps a zeeguutag including translation around the selected content.
function tagText() 
{
	// Select content.
	var selection = window.getSelection();
	var range = selection.getRangeAt(0);
	
	// Properly select content based on mode.
	if (translateMode == WORDMODE)
	{
		selection.modify('move','backward','word');
		selection.modify('extend','forward','word');
	} else {
		selection.modify('move','backward','sentence');
		selection.modify('extend','forward','sentence');
	} 
	coverTag(selection, HTML_ZEEGUUTAG);
	
	// Check if selection has been tagged already.
	if (isTagged(selection, HTML_ZEEGUUTAG)) {
		selection.modify('move','backward','character');
		return;
	}
	
	// Insert tags.
	var text = selection.toString(); 
	range = selection.getRangeAt(0);	
	
	var zeeguuTag = document.createElement(HTML_ZEEGUUTAG);
	var contents = range.extractContents();
    clearTags(contents, HTML_ZEEGUUTAG);
	zeeguuTag.appendChild(contents);
	range.insertNode(zeeguuTag);
	
	// Launch request to Zeeguu API.
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() { 
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
			setTranslation(zeeguuTag, xmlHttp.responseText);
	}
	var postData = "context="+text;
	postData += "&url=zeeguu-mr-core.herokuapp.com"
	postData += "&word="+text;
	xmlHttp.open("POST", ZEEGUU_SERVER+"/translate/nl/en", true); 
	xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlHttp.send(postData);
	
    selection.modify('move','backward','character');
}

function setTranslation(zeeguuTag, translation)
{	
	zeeguuTag.setAttribute("translation", translation);
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

function isTagged(selection, tag) {
	var range = selection.getRangeAt(0);
	var contents = range.cloneContents();
	var children = contents.children;
	return (children.length == 1 && children[0].nodeName == tag)
		    && (contents.textContent == children[0].textContent);
}

// Clears the given tag from contents.
function clearTags(contents, tag) {
	var temp = document.createElement('div');

	while (contents.firstChild)
		temp.appendChild(contents.firstChild);

	var tags = temp.getElementsByTagName(tag);
	var length = tags.length;

	while (length--)
		$(tags[length]).contents().unwrap();

	// Add elements back to fragment:
	while (temp.firstChild)
		contents.appendChild(temp.firstChild);	
}
