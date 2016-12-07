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
 
function tagText() 
{
	// Select content.
	var selection = window.getSelection();
	var range = selection.getRangeAt(0);
	
	// Check if selection has been translated already.
	if (range.commonAncestorContainer.parentNode.nodeName == HTML_ZEEGUUTAG) 
		return;
	
	if (translateMode == WORDMODE)
	{
		selection.modify('move','backward','word');
		selection.modify('extend','forward','word');
	} else {
		selection.modify('move','backward','sentence');
		selection.modify('extend','forward','sentence');
	} 
	
	var text = selection.toString(); 
	range = selection.getRangeAt(0);

	// Insert tags.
	var zeeguuTag = document.createElement(HTML_ZEEGUUTAG);
	range.surroundContents(zeeguuTag);
	
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
	//mergeTags();
}

function mergeTags()
{
	var all = document.getElementsByTagName(HTML_ZEEGUUTAG);
	for (var i=0, max=all.length; i < max; i++) {
		while (all[i].firstChild) {
			clearTags(all[i])
		}
	}	
}

function clearTags(zeeguuNode) {
	var nodes = zeeguuNode.getElementsByTagName(HTML_ZEEGUUTAG);
	for (var i=0, max=nodes.length; i < max; i++) {
		 $(nodes[i]).contents().unwrap();
	}	
}
