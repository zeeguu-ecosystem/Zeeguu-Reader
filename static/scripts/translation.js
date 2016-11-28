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
	
	// Insert tags.
	var range = selection.getRangeAt(0);
	var zeeguuTag = document.createElement(HTML_ZEEGUUTAG);
	range.surroundContents(zeeguuTag);
	
	// Launch request.
	var text = selection.toString();
	var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            setTranslation(zeeguuTag, xmlHttp.responseText);
    }
    // TODO : Make the below work.
    var postData = "context="+text;
    postData += "&url=zeeguu-mr-core.herokuapp.com"
    postData += "&word="+text;
    xmlHttp.open("POST", ZEEGUU_SERVER+"/translate/nl/en", true); 
    xmlHttp.send(postData);
}

function setTranslation(zeeguuTag, translation)
{	
	zeeguuTag.innerHTML = "hi";
}
