/* Script that binds listeners to html events, such that the
 * correct object is called to handle it. */

import $ from 'jquery';
import config from '../config';

import Translator from './Translator';
import AlterMenu from './AlterMenu'
import Speaker from './Speaker';
import Starer from './Starer';
import UserActivityLogger from '../UserActivityLogger';
import {readCookie} from '../cookieWorks';
import {addParagraphs, filterShit, wrapWordsInZeeguuTags} from './textProcessing';
import {get_article_id} from './article_id.js'

import {GET_USER_ARTICLE_INFO} from '../zeeguuRequests';
import ZeeguuRequests from "../zeeguuRequests";

import '../../../styles/mdl/material.min.js';
import '../../../styles/mdl/material.min.css';
import '../../../styles/article.css';
import '../../../styles/material-icons.css';


const USER_EVENT_ENABLE_COPY = 'ENABLE COPY';
const USER_EVENT_DISABLE_COPY = 'DISABLE COPY';
const USER_EVENT_CHANGE_ORIENTATION = 'CHANGE ORIENTATION';
const USER_EVENT_LIKE_ARTICLE = 'LIKE ARTICLE';
const USER_EVENT_UNLIKE_ARTICLE = 'UNLIKE ARTICLE';
const USER_EVENT_EXIT_ARTICLE = 'ARTICLE CLOSED';
const USER_EVENT_OPEN_VOCABULARY_FOR_ARTICLE = 'OPEN ARTICLE VOCABULARY';
const USER_EVENT_OPENED_ARTICLE = 'OPEN ARTICLE';
const USER_EVENT_ARTICLE_FOCUS = 'ARTICLE FOCUSED';
const USER_EVENT_ARTICLE_LOST_FOCUS = 'ARTICLE LOST FOCUS';
const USER_EVENT_SCROLL = 'SCROLL';
const USER_EVENT_FEEDBACK = 'USER FEEDBACK';


const HTML_ID_TOGGLE_COPY = '#toggle_copy';
const HTML_ID_TOGGLE_UNDO = '#toggle_undo';
const HTML_ID_TOGGLE_LIKE = '#toggle_like';
const HTML_ID_TOGGLE_STAR = '#toggle_star';
const HTML_ID_ARTICLE_VOCABULARY_LINK = "#bookmarks_for_article_link";
const CLASS_MDL_BUTTON_DISABLED = 'mdl-button--disabled';
const CLASS_NOSELECT = 'noselect';
const ENTER_KEY = 13;

var starer;
const speaker = new Speaker();

let translator;
let alterMenu;
let FROM_LANGUAGE;

let previous_time = 0;

let FREQUENCY_KEEPALIVE = 60 * 1000;

const ARTICLE_FEEDBACK_BUTTON_IDS = [
    "#not_finished_for_boring",
    "#not_finished_for_too_long",
    "#not_finished_for_too_difficult",
    "#not_finished_for_broken",
    "#not_finished_for_incomplete",
    "#not_finished_for_other"];

const ARTICLE_DIFFICULTY_BUTTON_IDS = [
    "#finished_easy",
    "#finished_ok",
    "#finished_hard",
    "#finished_very_hard"];


/* When the document has finished loading,
 * bind all necessary listeners. */
$(document).ready(function () {

    getArticleInfoAndInitElementsRequiringIt(get_article_id());

    UserActivityLogger.log_article_interaction(USER_EVENT_OPENED_ARTICLE);

});

function getArticleInfoAndInitElementsRequiringIt(article_id) {

    let TO_LANGUAGE = readCookie("native_lang");

    ZeeguuRequests.get(GET_USER_ARTICLE_INFO, {article_id: article_id}, function (article_info) {

        FROM_LANGUAGE = article_info.language;

        translator = new Translator(FROM_LANGUAGE, TO_LANGUAGE);

        alterMenu = new AlterMenu(FROM_LANGUAGE, TO_LANGUAGE);

        load_article_info_in_page(article_info);

        attachInteractionScripts();

        make_article_elements_visible();

    }.bind(this));

}


function attachInteractionScripts() {

    disableToggleCopy();
    attachZeeguuTagListeners();

    /* When the user leaves the article, log it as an event. */
    window.onbeforeunload = log_user_leaves_article;

    /* When the copy toggle is switched on,
     * copying is enabled and translation gets disabled and vice-versa. */
    $(HTML_ID_TOGGLE_COPY).click(handle_TOGGLE_COPY_click);

    /* When the undo is clicked, content page is replaced
     * with previous one in the stack and listeners are re-attached. */
    $(HTML_ID_TOGGLE_UNDO).click(handle_TOGGLE_UNDO_click);

    /* When the like button is clicked, set its background color. */
    $(HTML_ID_TOGGLE_LIKE).click(handle_TOGGLE_LIKE_click);

    /* Toggle listener for star button. */
    $(HTML_ID_TOGGLE_STAR).click(function () {
        starer.toggle();
    });

    $(HTML_ID_ARTICLE_VOCABULARY_LINK).click(function () {
        UserActivityLogger.log_article_interaction(USER_EVENT_OPEN_VOCABULARY_FOR_ARTICLE);
    });

    $(".mdl-layout__content").on("scroll", handle_CONTENT_SCROLL_EVENT);

    $("#back_button").click(handle_back_button);

    let difficulty_feedback_handler = handle_difficulty_feebdack_button();
    ARTICLE_DIFFICULTY_BUTTON_IDS.forEach(function (button_id) {
        $(button_id).click(difficulty_feedback_handler)
    });


    let feedback_button_handler = handle_article_feedback_button();
    ARTICLE_FEEDBACK_BUTTON_IDS.forEach(function (button_id) {
        $(button_id).click(feedback_button_handler);
    });


    $("#read_later").click(handle_read_later_button_click());


}


function log_user_leaves_article() {
    UserActivityLogger.log_article_interaction(USER_EVENT_EXIT_ARTICLE);

}

function handle_TOGGLE_COPY_click() {
    // Selection is disabled -> enable it.
    if ($(this).hasClass(CLASS_MDL_BUTTON_DISABLED)) {
        enableToggleCopy();
        UserActivityLogger.log_article_interaction(USER_EVENT_ENABLE_COPY);
    } else {
        disableToggleCopy();
        UserActivityLogger.log_article_interaction(USER_EVENT_DISABLE_COPY);
    }
}

function handle_TOGGLE_UNDO_click() {
    if (alterMenu.isOpen()) {
        alterMenu.close();
        return;
    }
    $(config.HTML_ZEEGUUTAG).off();
    translator.undoTranslate();
    attachZeeguuTagListeners();
}

function handle_TOGGLE_LIKE_click() {
    $(this).toggleClass(CLASS_MDL_BUTTON_DISABLED);

    if ($(this).hasClass(CLASS_MDL_BUTTON_DISABLED)) {
        UserActivityLogger.log_article_interaction(USER_EVENT_UNLIKE_ARTICLE);
    } else {
        UserActivityLogger.log_article_interaction(USER_EVENT_LIKE_ARTICLE);
    }

}

function handle_CONTENT_SCROLL_EVENT() {

    let _current_time = new Date();

    let current_time = _current_time.getTime();

    if (previous_time == 0) {

        UserActivityLogger.log_article_interaction(USER_EVENT_SCROLL);
        previous_time = current_time;

    } else {
        if ((current_time - previous_time) > FREQUENCY_KEEPALIVE) {
            UserActivityLogger.log_article_interaction(USER_EVENT_SCROLL);
            previous_time = current_time;
        } else {
        }
    }
}


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

            // $trans.children(config.HTML_TAG__MORE_ALTERNATIVES).remove();

            $trans.children(config.HTML_TAG__MORE_ALTERNATIVES).removeClass();
            $trans.children(config.HTML_TAG__SINGLE_ALTERNATIVE).removeClass();

            $trans.children(config.HTML_TAG__MORE_ALTERNATIVES).addClass("handContributed");
            $trans.children(config.HTML_TAG__SINGLE_ALTERNATIVE).addClass("handContributed");

            $trans.addClass("contributedAlternativeTran");
            $trans.parent().children("orig").addClass("contributedAlternativeOrig");

            translator.sendSuggestion($zeeguu);
        }
        alterMenu.close();
    }
});

/* Every time the screen orientation changes,
 * the alter menu will be closed. */
$(window).on("orientationchange", function () {
    alterMenu.close();
    UserActivityLogger.log_article_interaction(USER_EVENT_CHANGE_ORIENTATION);
});

$(window).on("focus", function () {

    UserActivityLogger.log_article_interaction(USER_EVENT_ARTICLE_FOCUS);
});

$(window).on("blur", function () {
    UserActivityLogger.log_article_interaction(USER_EVENT_ARTICLE_LOST_FOCUS);
});


/* Disable selection. */
function disableToggleCopy() {
    $("p").each(function () {
        $(this).addClass(CLASS_NOSELECT);
    });
    $(HTML_ID_TOGGLE_COPY).addClass(CLASS_MDL_BUTTON_DISABLED);
}

/* Enable selection. */
function enableToggleCopy() {
    $("p").each(function () {
        $(this).removeClass(CLASS_NOSELECT);
    });
    $(HTML_ID_TOGGLE_COPY).removeClass(CLASS_MDL_BUTTON_DISABLED);
}

function isToggledCopy() {
    return !$(HTML_ID_TOGGLE_COPY).hasClass(CLASS_MDL_BUTTON_DISABLED);
}


function handle_difficulty_feebdack_button() {
    // Returns the handler with the article_id already bound

    function difficulty_feedback_button_clicked_partial(event) {

        ARTICLE_DIFFICULTY_BUTTON_IDS.forEach(function (button_id) {
            $(button_id).css('background', '');
        });

        $(event.target).css("background", "#b3d4fc");

        UserActivityLogger.log_article_interaction(USER_EVENT_FEEDBACK, event.target.id);

        // the bottom page link should be visible only once the user
        // has provided feedback
        $("#bottom_page_back_link").show();
    }

    return difficulty_feedback_button_clicked_partial;
}

function handle_article_feedback_button() {
    // Returns the handler with the given url bound
    function upload_feedback_answer(event) {
        UserActivityLogger.log_article_interaction(USER_EVENT_FEEDBACK, event.target.id);
    }

    return upload_feedback_answer
}

function handle_read_later_button_click() {
    function set_starred(event) {
        UserActivityLogger.log_article_interaction(USER_EVENT_FEEDBACK, event.target.id);
        starer.setState(false);
        starer.toggle();

    }

    return set_starred
}

function handle_back_button() {

    $("#header_row").hide();
    $("#question_reasons_not_to_finish").show();
}


function load_article_info_in_page(article_info) {

    // TITLE
    let title_text = article_info.title;
    document.title = title_text;
    title_text = wrapWordsInZeeguuTags(title_text);
    $("#articleTitle").html(title_text);

    // AUTHORS
    $("#authors").text(article_info.authors);

    // LINK TO SOURCE
    $("#source").attr("href", article_info.url);

    // CONTENT
    let text = article_info.content;
    text = filterShit(text);
    text = wrapWordsInZeeguuTags(text);
    text = addParagraphs(text);
    $("#articleContent").html(text);

    starer = new Starer(article_info.starred);


    // LIKED
    if (!article_info.liked) {
        $(HTML_ID_TOGGLE_LIKE).addClass(CLASS_MDL_BUTTON_DISABLED);
    }

}

function make_article_elements_visible() {
    // These things have to be hidden
    // initially since otherwise they
    // stand out while we wait for the
    // text to arrive from the server.
    // But now that the text is in, we
    // can show them.

    $("#header_row").css("visibility", "visible");
    $("#main_article_content").css("visibility", "visible");
    $("#bottom_feedback_div").css("visibility", "visible");
    $("#loaderanimation").hide();
}


/* Attach Zeeguu tag click listener. */
function attachZeeguuTagListeners() {
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
            translator.getTopTranslation(this);
            // NOTE: To fall back to the previous version uncomment the following line
            // and comment the above line.
            // translator.translate(this);
        } else if ($target.is(config.HTML_ORIGINAL)) {
            // Original text is clicked, so we pronounce it using the speaker.
            speaker.speak($target.text(), FROM_LANGUAGE);
        } else if ($target.is(config.HTML_TRANSLATED)) {
            // Translated text is clicked, so we open the alterMenu to allow for suggestions.
            let getAllTranslations = ($target.attr(config.HTML_ATTRIBUTE_POSSIBLY_MORE_TRANSLATIONS) === '')
            if (getAllTranslations) {
                let currentService = $target.attr(config.HTML_ATTRIBUTE_SERVICENAME_TRANSLATION + "0");
                let currentTranslation = $target.attr(config.HTML_ATTRIBUTE_TRANSLATION + "0");
                // Fetch the rest of the translations. Passing the alterMenu variable to automatically
                // build and show the alterMenu via the callback once the next translations are fetched.
                translator.getNextTranslations(this, currentService, currentTranslation, alterMenu, $target);
            } else {
                alterMenu.build($target);
            }
        }
    });
}
