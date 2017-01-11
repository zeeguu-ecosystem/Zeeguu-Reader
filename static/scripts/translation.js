var ZEEGUU_SERVER = "https://www.zeeguu.unibe.ch";
var HTML_ZEEGUUTAG = "ZEEGUU";

// User control event listeners appended to document here.
$(document).ready(function() {
	disable_href();
	$("#toggle_translate").change(function() 
	{
		if (this.checked)
			disable_href();
		else
		{
			closeAlterMenu();
			enable_href();
		}
	});
	
	$(".translatable").click(function(event) 
	{
		if ($('#toggle_translate').is(':checked'))
		{
			if ($("#alterMenu").is(":visible"))
				closeAlterMenu();
			else if (event.target.nodeName == HTML_ZEEGUUTAG) 
			{
			  var zeeguuTag = event.target;
			  var transCount = parseInt(zeeguuTag.getAttribute("transCount"));
			  if (transCount > 1)
			    openAlterMenu(zeeguuTag);
			  else
			    notifyUser("Sorry, no alternatives.");
			}
			else
				tagText();
		} 
	});
});

$(window).on("orientationchange", function() {
	var zeeguuTag = $("#alterMenu").parent();
	placeAlterMenu(zeeguuTag);
});

// Disable or enable links. 
// Done in this peculiar way as default link disabling methods do not
// pass a proper text selection.
function disable_href()
{
	$('.translatable').find('a').each(function() 
	{
		this.setAttribute('href_disabled',this.getAttribute('href'));
		this.removeAttribute('href');
	});	
}

function enable_href()
{
	$('.translatable').find('a').each(function() 
	{
		this.setAttribute('href',this.getAttribute('href_disabled'));
		this.removeAttribute('href_disabled');
	});	
}

function notifyUser(message)
{
	var notification = document.querySelector('.mdl-js-snackbar');
	notification.MaterialSnackbar.showSnackbar(
	{
		message: message
	});
}

// Places the alternative translation menu.
function openAlterMenu(zeeguuTag)
{
	var transCount = parseInt(zeeguuTag.getAttribute("transCount"));
	$("#alterMenu").empty();
	
	// Add buttons with click listeners that replace the translation.
	for (var i = 0; i < transCount; i++)
	{
		var button = document.createElement('button');
		var alternative = zeeguuTag.getAttribute("translation"+i);
		button.textContent = alternative;
		$(button).addClass("mdl-button").addClass("mdl-js-button")
				 .addClass("mdl-js-ripple-effect");
		$("#alterMenu").append($(button));
		$(button).click({zeeguuTag: zeeguuTag, choice: i}, function(event) {
			var zeeguuTag =  event.data.zeeguuTag;
			var choice = event.data.choice;
			var oldText = zeeguuTag.getAttribute("translation0");
			var newText = zeeguuTag.getAttribute("translation"+choice);
			zeeguuTag.setAttribute("translation0",newText);
			zeeguuTag.setAttribute("translation"+choice, oldText);
		});
	}
	placeAlterMenu(zeeguuTag);
	$("#alterMenu").slideDown();
}

// Show the menu below the to be altered word.
function placeAlterMenu(zeeguuTag)
{
	var pos = $(zeeguuTag).position();
	var tagheight = $(zeeguuTag).outerHeight();
	var tagwidth = $(zeeguuTag).outerWidth();
	var menuwidth = $("#alterMenu").outerWidth();
	var topScroll = $(".mdl-layout__content").scrollTop();
	$(zeeguuTag).append($("#alterMenu"));
	$("#alterMenu").css({
		position: "absolute",
		maxWidth: "80%",
		display: "inline-block",
		left: pos.left + (tagwidth-menuwidth)/2 + "px",
		top: pos.top + tagheight + topScroll + "px"
	});
}

function closeAlterMenu()
{
	$("#alterMenu").slideUp(function() 
	{
    	$("#alterMenuContainer").append($("#alterMenu"));
	});
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
		requestZeeguu("/get_possible_translations/nl/en", text, context, url,
					  setTranslations, zeeguuTag);
	}
	
	// Undo selection.
    selection.modify('move','backward','character');
}

function getContext(selection)
{
	if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
		// TODO Implement firefox alternative.
    } else {
	    selection.modify('move','backward','sentence');
		selection.modify('extend','forward','sentence');
	}
	return selection.toString();
}

function setTranslations(zeeguuTag, translations)
{	translations = JSON.parse(translations).translations;
	var transCount = Math.min(translations.length, 3);
	zeeguuTag.setAttribute("transCount", transCount);
	for (var i = 0; i < transCount; i++)
		zeeguuTag.setAttribute("translation"+i, translations[i].translation);
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
