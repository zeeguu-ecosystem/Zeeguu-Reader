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

    /* When the translate toggle is changed, we
     * make sure that we disable or enable hyperlinks
     * and close all translation tools. */
    $(config.HTML_ID_TOGGLETRANSLATE).change(function()
    {
        if (this.checked) disableSelection();
        else enableSelection();
    });

    /* When a translatable word has been clicked,
     * either try to translate it, speak it, or open an alternative
     * translation window.  */
    $(config.HTML_ZEEGUUTAG).click(function(event) {
        if (!$(config.HTML_ID_TOGGLETRANSLATE).is(':checked'))
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
}

/* Enable selection. */
function enableSelection() {
    $("p").each (function () {
        $(this).removeClass(config.CLASS_NOSELECT);
    });
}