import $ from 'jquery';
import config from '../config';
import Translator from './Translator';
import AlterMenu from './AlterMenu'
import Speaker from './Speaker';
import Starer from './Starer';
import UserActivityLogger from '../UserActivityLogger';

import '../../../styles/mdl/material.min.js';
import '../../../styles/mdl/material.min.css';
import '../../../styles/article.css';
import '../../../styles/material-icons.css';

/* Script that binds listeners to html events, such that the
 * correct object is called to handle it. */

const translator = new Translator();
const alterMenu = new AlterMenu();
const speaker = new Speaker();
const starer = new Starer();

const USER_EVENT_ENABLE_COPY = 'ENABLE COPY';
const USER_EVENT_DISABLE_COPY = 'DISABLE COPY';
const USER_EVENT_CHANGE_ORIENTATION = 'CHANGE ORIENTATION';
const USER_EVENT_LIKE_ARTICLE = 'LIKE ARTICLE';
const USER_EVENT_UNLIKE_ARTICLE = 'UNLIKE ARTICLE';
const USER_EVENT_EXIT_ARTICLE = 'ARTICLE CLOSED';
const USER_EVENT_OPENED_ARTICLE = 'OPEN ARTICLE';
const USER_EVENT_ARTICLE_FOCUS = 'ARTICLE FOCUSED';
const USER_EVENT_ARTICLE_LOST_FOCUS = 'ARTICLE LOST FOCUS';


const STAR_BORDER = 'star_border';


const HTML_ID_TOGGLECOPY = '#toggle_copy';
const HTML_ID_TOGGLEUNDO = '#toggle_undo';
const HTML_ID_TOGGLELIKE = '#toggle_like';
const HTML_ID_TOGGLESTAR = '#toggle_star';
const CLASS_MDL_BUTTON_DISABLED = 'mdl-button--disabled';
const CLASS_MATERIAL_STAR_OFF = '.material-icons.star.off';
const CLASS_NOSELECT = 'noselect';
const ENTER_KEY = 13;

/* When the document has finished loading,
 * bind all necessary listeners. */
$(document).ready(function () {
    // Disable selection by default.
    disableToggleCopy();
    attachZeeguuListeners();
    setStarerState();

    let url = $(config.HTML_ID_ARTICLE_URL).children('a').attr('href');
    UserActivityLogger.log(USER_EVENT_OPENED_ARTICLE, url, Date.now());

    /* When the user leaves the article, log it as an event. */
    window.onbeforeunload = function () {
        let url = $(config.HTML_ID_ARTICLE_URL).children('a').attr('href');
        let title = $(config.HTML_ID_ARTICLE_TITLE).text();
        UserActivityLogger.log(USER_EVENT_EXIT_ARTICLE, url, {title: title});
    };

    /* When the copy toggle is switched on,
     * copying is enabled and translation gets disabled and vice-versa. */
    $(HTML_ID_TOGGLECOPY).click(function () {
        // Selection is disabled -> enable it.
        if ($(this).hasClass(CLASS_MDL_BUTTON_DISABLED)) {
            enableToggleCopy();
            UserActivityLogger.log(USER_EVENT_ENABLE_COPY);
        }
        else {
            disableToggleCopy();
            UserActivityLogger.log(USER_EVENT_DISABLE_COPY);
        }
    });

    /* When the undo is clicked, content page is replaced
     * with previous one in the stack and listeners are re-attached. */
    $(HTML_ID_TOGGLEUNDO).click(function () {
        if (alterMenu.isOpen()) {
            alterMenu.close();
            return;
        }
        $(config.HTML_ZEEGUUTAG).off();
        translator.undoTranslate();
        attachZeeguuListeners();
    });

    /* When the like button is clicked, set its background color. */
    $(HTML_ID_TOGGLELIKE).click(function () {
        $(this).toggleClass(CLASS_MDL_BUTTON_DISABLED);

        let url = $(config.HTML_ID_ARTICLE_URL).children('a').attr('href');
        let title = $(config.HTML_ID_ARTICLE_TITLE).text();

        if ($(this).hasClass(CLASS_MDL_BUTTON_DISABLED)) {
            UserActivityLogger.log(USER_EVENT_UNLIKE_ARTICLE, url, {title: title});
        } else {
            UserActivityLogger.log(USER_EVENT_LIKE_ARTICLE, url, {title: title});
        }

    });

    /* Toggle listener for star button. */
    $(HTML_ID_TOGGLESTAR).click(function () {
        starer.toggle();
    });


});

/* Clicking anywhere in the document when the
 * alter menu is open, except for the input field,
 * will close the alter menu.*/
$(document).click(function (event) {
    let $target = $(event.target);
    if (!$target.is('input') && alterMenu.isOpen()) {
        alterMenu.close();
    } else if ($target.is('input') && $target.val() === config.TEXT_SUGGESTION) {
        $target.attr('value', '');
    }
});

/* Listens on keypress 'enter' to set the user suggestion
 * as the chosen translation and sends the user's contribution
 * to Zeeguu. */
$(document).keypress(function (event) {
    let $target = $(event.target);
    if ($target.is('input') && event.which === ENTER_KEY) {
        let $zeeguu = $target.closest(config.HTML_ZEEGUUTAG);
        let $trans = $zeeguu.children(config.HTML_TRANSLATED);
        if ($target.val() !== '') {
            $trans.attr(config.HTML_ATTRIBUTE_CHOSEN, $target.val());
            $trans.attr(config.HTML_ATTRIBUTE_SUGGESTION, $target.val());
            translator.sendSuggestion($zeeguu);
        }
        alterMenu.close();
    }
});

/* Every time the screen orientation changes,
 * the alter menu will be closed. */
$(window).on("orientationchange", function () {
    alterMenu.close();
    UserActivityLogger.log(USER_EVENT_CHANGE_ORIENTATION);
});

$(window).on("focus", function () {
    let url = $(config.HTML_ID_ARTICLE_URL).children('a').attr('href');
    UserActivityLogger.log(USER_EVENT_ARTICLE_FOCUS, url);
});

$(window).on("blur", function () {
    UserActivityLogger.log(USER_EVENT_ARTICLE_LOST_FOCUS, "");
});


/* Disable selection. */
function disableToggleCopy() {
    $("p").each(function () {
        $(this).addClass(CLASS_NOSELECT);
    });
    $(HTML_ID_TOGGLECOPY).addClass(CLASS_MDL_BUTTON_DISABLED);
}

/* Enable selection. */
function enableToggleCopy() {
    $("p").each(function () {
        $(this).removeClass(CLASS_NOSELECT);
    });
    $(HTML_ID_TOGGLECOPY).removeClass(CLASS_MDL_BUTTON_DISABLED);
}

function isToggledCopy() {
    return !$(HTML_ID_TOGGLECOPY).hasClass(CLASS_MDL_BUTTON_DISABLED);
}

function setStarerState() {
    starer.setState($(CLASS_MATERIAL_STAR_OFF).text() === STAR_BORDER);
}

/* Attach Zeeguu tag click listener. */
function attachZeeguuListeners() {
    /* When a translatable word has been clicked,
     * either try to translate it, speak it, or open an alternative
     * translation window.  */
    $(config.HTML_ZEEGUUTAG).click(function (event) {
        if (isToggledCopy())
            return;
        if (alterMenu.isOpen())
            return;

        let $target = $(event.target);
        if ($target.is(config.HTML_ZEEGUUTAG) && !translator.isTranslated($target)) {
            // A non-translated word is clicked, so we translate it.
            translator.translate(this);
        } else if ($target.is(config.HTML_ORIGINAL)) {
            // Original text is clicked, so we pronounce it using the speaker.
            speaker.speak($target.text(), FROM_LANGUAGE);
        } else if ($target.is(config.HTML_TRANSLATED)) {
            // Translated text is clicked, so we open the alterMenu to allow for suggestions.
            alterMenu.build($target);
        }
    });
}
