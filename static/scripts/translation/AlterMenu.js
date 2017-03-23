/**
 * Class that allows for choosing alternative zeeguu translations.
 */
function AlterMenu()
{
    var menuOpen = false;
    var notifier = new Notifier();

    /* Creates and opens the alternative translation menu. */
    this.constructAndOpen = function(zeeguuTag)
    {
        // Check how many alternatives there are, if less than 2: abort.
        var transCount = parseInt(zeeguuTag.getAttribute(HTML_ATTRIBUTE_TRANSCOUNT));
        if (transCount < 2) {
            notifier.notify("Sorry, no alternatives.");
            return;
        }
        construct(zeeguuTag, transCount);
        place(zeeguuTag);
        $(HTML_ID_ALTERMENU).slideDown(function() {menuOpen = true});
    }

    /* Add buttons with click listeners that replace the translation. */
    function construct(zeeguuTag, transCount)
    {
        $(HTML_ID_ALTERMENU).empty();
        for (var i = 0; i < transCount; i++)
        {
            var button = document.createElement('button');
            var alternative = zeeguuTag.getAttribute(HTML_ATTRIBUTE_TRANSLATION+i);
            button.textContent = alternative;
            $(button).addClass("mdl-button").addClass("mdl-js-button")
                .addClass("mdl-js-ripple-effect");
            $(HTML_ID_ALTERMENU).append($(button));
            $(button).click({zeeguuTag: zeeguuTag, alternative: i}, swapPrimaryTranslation);
        }
    }

    /* Swaps the HTML_ATTRIBUTE_TRANSLATION 0 with the new preferred translation attribute. */
    function swapPrimaryTranslation(selectedAlternative)
    {
        var zeeguuTag =  selectedAlternative.data.zeeguuTag;
        var alternative = selectedAlternative.data.alternative;
        var oldText = zeeguuTag.getAttribute(HTML_ATTRIBUTE_TRANSLATION + '0');
        var newText = zeeguuTag.getAttribute(HTML_ATTRIBUTE_TRANSLATION + alternative);
        zeeguuTag.setAttribute(HTML_ATTRIBUTE_TRANSLATION + '0', newText);
        zeeguuTag.setAttribute(HTML_ATTRIBUTE_TRANSLATION + alternative, oldText);
    }

    /* Places the alter menu below the to-be-altered word. */
    function place(zeeguuTag)
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

    this.reposition = function() {
        place($(HTML_ID_ALTERMENU).parent());
        $(HTML_ID_ALTERMENU).show();
    }

    /* Hides the alter menu. */
    this.close = function()
    {
        $(HTML_ID_ALTERMENU).slideUp(function()
        {
            $(HTML_ID_ALTERMENUCONTAINER).append($(HTML_ID_ALTERMENU));
            menuOpen = false;
        });
    }

    this.isOpen = function()
    {
        return menuOpen;
    }
}
