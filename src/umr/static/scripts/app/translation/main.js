import $ from 'jquery';
import config from '../config';
import Translator from './Translator';
import AlterMenu from './AlterMenu'
import Speaker from './Speaker';

/* Script that binds listeners to html events, such that the
 * correct object is called to handle it. */
const translator = new Translator();
const alterMenu = new AlterMenu();
const speaker = new Speaker();

/* When the document has finished loading,
 * bind all necessary listeners. */
$(document).ready(function() {
    // Disable selection by default.
    disableToggleCopy(); 
    attachZeeguuListeners();

    /* When the copy toggle is switched on, 
     * copying is enabled and translation gets disabled and vice-versa. */
    $(config.HTML_ID_TOGGLECOPY).click(function()
    {
        // Selection is disabled -> enable it.
        if ($(this).hasClass('mdl-button--disabled')) enableToggleCopy();
        else disableToggleCopy();
    });

    /* When the undo is clicked, content page is replaced
     * with previous one in the stack and listeners are re-attached. */
    $(config.HTML_ID_TOGGLEUNDO).click(function()
    {
        if (alterMenu.isOpen()) alterMenu.close();
        $(config.HTML_ZEEGUUTAG).off();
        translator.undoTranslate();
        attachZeeguuListeners();
    });
});

/* Clicking anywhere in the document when the 
 * alter menu is open, except for the input field,
 * will close the alter menu.*/
$(document).click(function(event) {
    let target = $(event.target);
    if (!target.is('input') && alterMenu.isOpen()) {
        alterMenu.close();
    } else if (target.is('input') && target.val() === config.TEXT_SUGGESTION) {
        target.attr('value', '');
    }
});

/* Listens on keypress 'enter' to set the user suggestion 
 * as the chosen translation. */
$(document).keypress(function(event) {
    let target = $(event.target);
    if (target.is('input') && event.which === config.ENTER_KEY) {
        let trans = target.parent().parent();
        if (target.val() !== '') {
            trans.attr(config.HTML_ATTRIBUTE_CHOSEN, target.val());
            trans.attr(config.HTML_ATTRIBUTE_SUGGESTION, target.val());
        }
        alterMenu.close();
    }
});

/* Every time the screen orientation changes, 
 * the alter menu will be closed. */
$(window).on("orientationchange",function() {
  alterMenu.close();
});

/* Disable selection. */
function disableToggleCopy() {
    $("p").each (function () {
        $(this).addClass(config.CLASS_NOSELECT);
    });
    $(config.HTML_ID_TOGGLECOPY).addClass('mdl-button--disabled');
}

/* Enable selection. */
function enableToggleCopy() {
    $("p").each (function () {
        $(this).removeClass(config.CLASS_NOSELECT);
    });
    $(config.HTML_ID_TOGGLECOPY).removeClass('mdl-button--disabled');
}

function isToggledCopy() {
    return !$(config.HTML_ID_TOGGLECOPY).hasClass('mdl-button--disabled');
}

/* Attach Zeeguu tag click listener. */
function attachZeeguuListeners () {
    /* When a translatable word has been clicked,
     * either try to translate it, speak it, or open an alternative
     * translation window.  */
    $(config.HTML_ZEEGUUTAG).click(function(event) {
        if (isToggledCopy())
            return;
        if (alterMenu.isOpen())
            return;

        let $target = $(event.target);
        if ( $target.is(config.HTML_ZEEGUUTAG) && !translator.isTranslated(this) ) {
            // A non-translated word is clicked, so we translate it.
            translator.translate(this);
        } else if ($target.is(config.HTML_ORIGINAL) ) {
            // Original text is clicked, so we pronounce it using the speaker.
            speaker.speak($target.text(), FROM_LANGUAGE);
        } else if ($target.is(config.HTML_TRANSLATED) ) {
            // Translated text is clicked, so we open the alterMenu to allow for suggestions.
            alterMenu.build($target);
        }
    });
}