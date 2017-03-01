/* When the document has finished loading,
 * bind all necessary listeners. */
$(document).ready(function() {
	disableHREF();

	/* When the translate toggle is changed, we
	 * make sure that we disable or enable hyperlinks
	 * and close all translation tools. */
	$(HTML_ID_TOGGLETRANSLATE).change(function()
	{
		if (this.checked)
			disableHREF();
		else
		{
			closeAlterMenu();
			enableHREF();
		}
	});

	/* When a translatable word has been clicked,
	 * either try to translate it or open an alternative
	 * translation window.  */
	$(HTML_ZEEGUUTAG).click(function() {
	    if (!$(HTML_ID_TOGGLETRANSLATE).is(':checked'))
	        return;

        if (isTranslated(this)) {
            openAlterMenu(this);
        } else {
            insertTranslation(this);
        }
	});
});

/* Every time the screen changes, we need to
 * reposition the alter menu to be at the correct word
 * position. */
$(window).on("resize", function() {
	var zeeguuTag = $(HTML_ID_ALTERMENU).parent();
	if ($(HTML_ID_ALTERMENU).is(":visible"))
	{
		placeAlterMenu(zeeguuTag);
		$(HTML_ID_ALTERMENU).show();
	}
});

// Disable or enable links.
// Done in this peculiar way as default link disabling methods do not
// pass a proper text selection.
function disableHREF()
{
	$('.translatable').find('a').each(function()
	{
		this.setAttribute('href_disabled',this.getAttribute('href'));
		this.removeAttribute('href');
	});
}

function enableHREF()
{
	$('.translatable').find('a').each(function()
	{
		this.setAttribute('href',this.getAttribute('href_disabled'));
		this.removeAttribute('href_disabled');
	});
}

/* Creates and opens the alternative translation menu. */
function openAlterMenu(zeeguuTag)
{
    // Check how many alternatives there are.
	var transCount = parseInt(zeeguuTag.getAttribute(HTML_ATTRIBUTE_TRANSCOUNT));
	if (transCount < 1) {
        notifyUser("Sorry, no alternatives.");
        return;
    }

    // Add buttons with click listeners that replace the translation.
	$(HTML_ID_ALTERMENU).empty();
	for (var i = 0; i < transCount; i++)
	{
		var button = document.createElement('button');
		var alternative = zeeguuTag.getAttribute(HTML_ATTRIBUTE_TRANSLATION+i);
		button.textContent = alternative;
		$(button).addClass("mdl-button").addClass("mdl-js-button")
				 .addClass("mdl-js-ripple-effect");
		$(HTML_ID_ALTERMENU).append($(button));
		$(button).click({zeeguuTag: zeeguuTag, choice: i}, function(event) {
			var zeeguuTag =  event.data.zeeguuTag;
			var choice = event.data.choice;
			var oldText = zeeguuTag.getAttribute(HTML_ATTRIBUTE_TRANSLATION+'0');
			var newText = zeeguuTag.getAttribute(HTML_ATTRIBUTE_TRANSLATION+choice);
			zeeguuTag.setAttribute(HTML_ATTRIBUTE_TRANSLATION+'0',newText);
			zeeguuTag.setAttribute(HTML_ATTRIBUTE_TRANSLATION+choice, oldText);
		});
	}
	placeAlterMenu(zeeguuTag);
	$(HTML_ID_ALTERMENU).slideDown();
}

/* Places the alter menu below the to-be-altered word. */
function placeAlterMenu(zeeguuTag)
{
	var position = $(zeeguuTag).position();
	var tagHeight = $(zeeguuTag).outerHeight();
	var tagWidth = $(zeeguuTag).outerWidth();
	var menuWidth = $(HTML_ID_ALTERMENU).outerWidth();
	var topScroll = $(".mdl-layout__content").scrollTop();
	$(zeeguuTag).append($(HTML_ID_ALTERMENU));
	$(HTML_ID_ALTERMENU).css({
		position: "absolute",
		maxWidth: "80%",
		display: "inline-block",
		left: position.left + (tagWidth-menuWidth)/2 + "px",
		top: position.top + tagHeight + topScroll + "px"
	});
	$(HTML_ID_ALTERMENU).hide();
}

/* Hides the alter menu. */
function closeAlterMenu()
{
	$(HTML_ID_ALTERMENU).slideUp(function()
	{
    	$(HTML_ID_ALTERMENUCONTAINER).append($(HTML_ID_ALTERMENU));
	});
}

/* Notify the user of <message>. */
function notifyUser(message)
{
    var notification = document.querySelector('.mdl-js-snackbar');
    notification.MaterialSnackbar.showSnackbar(
    {
        message: message
    });
}