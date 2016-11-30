var ZEEGUU_SERVER = "https://www.zeeguu.unibe.ch";
var HTML_ZEEGUUTAG = "ZEEGUU";
 
$(document).click(function()
{
	tagText();
});
 
function tagText() 
{
	// Select content.
	var selection = window.getSelection();
	selection.modify('move','backward','word');
	selection.modify('extend','forward','word'); 
	var text = selection.toString(); 
	var range = selection.getRangeAt(0);
	
	// Check if selection has been translated already.
	if (range.commonAncestorContainer.parentNode.nodeName != HTML_ZEEGUUTAG) 
	{
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
		//console.log(postData);
		xmlHttp.open("POST", ZEEGUU_SERVER+"/translate/nl/en", true); 
		xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xmlHttp.send(postData);
	}
    selection.modify('move','backward','character');
}

function setTranslation(zeeguuTag, translation)
{	
	zeeguuTag.innerHTML += " ("+translation+")";
}
