import $ from 'jquery';
import config from '../config';
import Translator from './Translator';
import AlterMenu from './AlterMenu'
import Speaker from '../Speaker';

/* Script that binds listeners to html events, such that the
 * correct object is called to handle it. */
var translator = new Translator();
var alterMenu = new AlterMenu();
var speaker = new Speaker();

/* When the document has finished loading,
 * bind all necessary listeners. */
$(document).ready(function() {
    disableHREF();

    /* If you click anywhere in the translatable window,
     * and the alterMenu is open, we close it. */
    $('.translatable').click(function() {
        if (alterMenu.isOpen())
            alterMenu.close();
    });

    /* When the translate toggle is changed, we
     * make sure that we disable or enable hyperlinks
     * and close all translation tools. */
    $(config.HTML_ID_TOGGLETRANSLATE).change(function()
    {
        if (this.checked)
            disableHREF();
        else
        {
            alterMenu.close();
            enableHREF();
        }
    });

    /* When a translatable word has been clicked,
     * either try to translate it, speak it, or open an alternative
     * translation window.  */
    $(config.HTML_ZEEGUUTAG).click(function(event) {
        if (!$(config.HTML_ID_TOGGLETRANSLATE).is(':checked'))
            return;

        if (alterMenu.isOpen()) {
            alterMenu.close();
            return;
        }

        var target = $(event.target);
        if ( target.is(config.HTML_ZEEGUUTAG) ) {
            if (!translator.isTranslated(this)) {
                translator.translate(this);
            }
        } else if (target.is(config.HTML_ORIGINAL) ) {
            speaker.speak($(this).find(config.HTML_ORIGINAL).text(), FROM_LANGUAGE);
        } else if (target.is(config.HTML_TRANSLATED) ) {
            alterMenu.constructAndOpen(this.children[1]);
        }
    });
});

/* Every time the screen changes, we need to
 * reposition the alter menu to be at the correct word
 * position. */
$(window).on("resize", function() {
    if (alterMenu.isOpen())
        alterMenu.reposition();
});

/* Disable links.
 * Done in this peculiar way as default link disabling methods do not
 * pass a proper text selection. */
function disableHREF()
{
    $('.translatable').find('a').each(function()
    {
        this.setAttribute('href_disabled',this.getAttribute('href'));
        this.removeAttribute('href');
    });
}

/* Enable links. */
function enableHREF()
{
    $('.translatable').find('a').each(function()
    {
        this.setAttribute('href',this.getAttribute('href_disabled'));
        this.removeAttribute('href_disabled');
    });
}