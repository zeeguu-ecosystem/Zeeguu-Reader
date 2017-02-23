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
			  if (zeeguuTag.hasAttribute("transCount")) {
				var transCount = parseInt(zeeguuTag.getAttribute("transCount"));
				if (transCount > 1)
					openAlterMenu(zeeguuTag);
				else
					notifyUser("Sorry, no alternatives.");
				}
			  else
			  	insertTranslation(zeeguuTag);
			}
		}
	});
});

$(window).on("resize", function() {
	var zeeguuTag = $("#alterMenu").parent();
	if ($("#alterMenu").is(":visible"))
	{
		placeAlterMenu(zeeguuTag);
		$("#alterMenu").show();
	}
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
	$("#alterMenu").hide();
}

function closeAlterMenu()
{
	$("#alterMenu").slideUp(function()
	{
    	$("#alterMenuContainer").append($("#alterMenu"));
	});
}


// Wraps a zeeguutag including translation around the selected content.
function insertTranslation(zeeguuTag)
{
	mergeZeeguu(zeeguuTag);
	var text = zeeguuTag.textContent;
	var context = "";//getContext(zeeguuTag);
	var url = "zeeguu-mr-core.herokuapp.com";
	// Launch zeeguu request to fill translation options.
	requestZeeguuPOST(GET_TRANSLATIONS_ENDPOINT+'/'+FROM_LANGUAGE+'/'+TO_LANGUAGE,
		{word : text, context : context, url : url},
		_.partial(setTranslations, zeeguuTag));
}

function getContext(zeeguuTag)
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
{
	translations = translations.translations;
	var transCount = Math.min(translations.length, 3);
	zeeguuTag.setAttribute("transCount", transCount);
	for (var i = 0; i < transCount; i++)
		zeeguuTag.setAttribute("translation"+i, translations[i].translation);
}

// Merges the zeeguutags surrounding the given zeeguutag.
function mergeZeeguu(zeeguuTag)
{
	var spaces = '';
	var node = zeeguuTag.previousSibling;
	while (node && node.textContent == ' ')
	{
		node = node.previousSibling;
		spaces += ' ';
	}
	if (node && node.nodeName == HTML_ZEEGUUTAG && node.hasAttribute('transCount'))
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
	if (node && node.nodeName == HTML_ZEEGUUTAG && node.hasAttribute('transCount'))
	{
		zeeguuTag.textContent += spaces + node.textContent;
		node.parentNode.removeChild(node);
	}
}