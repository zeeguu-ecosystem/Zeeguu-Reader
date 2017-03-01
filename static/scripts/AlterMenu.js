/**
 * Class that allows for choosing alternative zeeguu translations.
 */
function AlterMenu()
{
    var anchor;
    var menuOpen = false;
    var notifier = new Notifier();

    /* Creates and opens the alternative translation menu. */
    this.open = function(zeeguuTag)
    {
        // Check how many alternatives there are.
        var transCount = parseInt(zeeguuTag.getAttribute(HTML_ATTRIBUTE_TRANSCOUNT));
        if (transCount <= 1) {
            notifier.notify("Sorry, no alternatives.");
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
        this.place(zeeguuTag);
        $(HTML_ID_ALTERMENU).slideDown(function() {menuOpen = true});
    }

    /* Places the alter menu below the to-be-altered word. */
    this.place = function(zeeguuTag)
    {
        anchor = zeeguuTag;
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
    this.close = function()
    {
        $(HTML_ID_ALTERMENU).slideUp(function()
        {
            $(HTML_ID_ALTERMENUCONTAINER).append($(HTML_ID_ALTERMENU));
            anchor = $(HTML_ID_ALTERMENUCONTAINER);
            menuOpen = false;
        });
    }

    this.getAnchor = function () {
        return anchor;
    }

    this.isOpen = function()
    {
        return menuOpen;
    }
}
