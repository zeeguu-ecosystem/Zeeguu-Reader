import $ from 'jquery';
import config from '../config';
import Translator from './Translator';
import AlterMenu from './AlterMenu'
import Speaker from './Speaker';

/* Script that binds listeners to html events, such that the
 * correct object is called to handle it. */
var translator = new Translator();
var alterMenu = new AlterMenu();
var speaker = new Speaker();

/* When the document has finished loading,
 * bind all necessary listeners. */
$(document).ready(function() {
    disableSelection();
    attachZeeguuListeners();

    /* When the copy toggle is switched on, 
     * copying is enabled and translation gets disabled and vice-versa. */
    $(config.HTML_ID_TOGGLETRANSLATE).click(function()
    {
        if ($(this).hasClass('mdl-button--disabled')) enableSelection();
        else disableSelection();
    });

    /* When the undo is clicked, content page is replaced
     * with previous one in the stack and listeners are re-attached. */
    $(config.HTML_ID_TOGGLEUNDO).click(function()
    {
        $(config.HTML_ZEEGUUTAG).off();
        translator.undoTranslate();
        attachZeeguuListeners();
    });
});

/* Clicking anywhere in the document when the 
 * alter menu is open, will close it.*/
$(document).click(function(event) {
    var target = $(event.target);
    if (!target.is('input') && alterMenu.isOpen()) {
        alterMenu.close();
    } else if (target.is('input') && target.val() === config.TEXT_SUGGESTION) {
        target.attr('value', '');
    }
});

/* Listens on keypress 'enter' to set the user suggestion 
 * as the chosen translation. */
$(document).keypress(function(event) {
    var target = $(event.target);
    if (target.is('input') && event.which == config.ENTER_KEY) {
        var trans = target.parent().parent();
        if (target.val() !== '') {
            trans.attr(config.HTML_ATTRIBUTE_CHOSEN, target.val());
            trans.attr(config.HTML_ATTRIBUTE_SUGGESTION, target.val());
        }
        alterMenu.close();
    }
});

/* Every time the screen orientation changes, 
 * the alter menu will be closed. */
$(window).on("orientationchange",function(){
  alterMenu.close();
});

/* Disable selection. */
function disableSelection() {
    $("p").each (function () {
        $(this).addClass(config.CLASS_NOSELECT);
    });
    $(config.HTML_ID_TOGGLETRANSLATE).addClass('mdl-button--disabled');
}

/* Enable selection. */
function enableSelection() {
    $("p").each (function () {
        $(this).removeClass(config.CLASS_NOSELECT);
    });
    $(config.HTML_ID_TOGGLETRANSLATE).removeClass('mdl-button--disabled');
}

/* Attach Zeeguu tag click listener. */
function attachZeeguuListeners () {
    /* When a translatable word has been clicked,
     * either try to translate it, speak it, or open an alternative
     * translation window.  */
    $(config.HTML_ZEEGUUTAG).click(function(event) {
        if (!$(config.HTML_ID_TOGGLETRANSLATE).hasClass('mdl-button--disabled'))
            return;
        if(alterMenu.isOpen())
            return;
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
}