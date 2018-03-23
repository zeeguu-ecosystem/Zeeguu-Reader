/* Script that binds listeners to html events, such that the
 * correct object is called to handle it. */

import $ from 'jquery';
import config from '../config';

import Translator from './Translator';
import AlterMenu from './AlterMenu'
import Speaker from './Speaker';
import Starer from './Starer';
import UserActivityLogger from '../UserActivityLogger';

import {GET_NATIVE_LANGUAGE, GET_USER_ARTICLE_INFO} from '../zeeguuRequests';
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
const USER_EVENT_OPENED_ARTICLE = 'OPEN ARTICLE';
const USER_EVENT_ARTICLE_FOCUS = 'ARTICLE FOCUSED';
const USER_EVENT_ARTICLE_LOST_FOCUS = 'ARTICLE LOST FOCUS';
const USER_EVENT_FEEDBACK = 'USER FEEDBACK';


const HTML_ID_TOGGLE_COPY = '#toggle_copy';
const HTML_ID_LIKE_BUTTON = '#like_button';
const HTML_ID_TOGGLE_UNDO = '#toggle_undo';
const HTML_ID_TOGGLE_LIKE = '#toggle_like';
const HTML_ID_TOGGLE_STAR = '#toggle_star';
const CLASS_MDL_BUTTON_DISABLED = 'mdl-button--disabled';
const CLASS_NOSELECT = 'noselect';
const ENTER_KEY = 13;

const starer = new Starer();
const speaker = new Speaker();

var translator;
var alterMenu;
var FROM_LANGUAGE;
var TO_LANGUAGE;


/* When the document has finished loading,
 * bind all necessary listeners. */
$(document).ready(function () {
    // Disable selection by default.


    let url = $(config.HTML_ID_ARTICLE_URL).children('a').attr('href');

    initElementsRequiringLanguagesAndArticleInfo(url,
        function () {

            disableToggleCopy();
            attachZeeguuListeners();

            /* When the user leaves the article, log it as an event. */
            window.onbeforeunload = function () {
                let url = $(config.HTML_ID_ARTICLE_URL).children('a').attr('href');
                let title = $(config.HTML_ID_ARTICLE_TITLE).text();
                UserActivityLogger.log(USER_EVENT_EXIT_ARTICLE, url, {title: title});
            };

            /* When the copy toggle is switched on,
             * copying is enabled and translation gets disabled and vice-versa. */
            $(HTML_ID_TOGGLE_COPY).click(function () {
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
            $(HTML_ID_TOGGLE_UNDO).click(function () {
                if (alterMenu.isOpen()) {
                    alterMenu.close();
                    return;
                }
                $(config.HTML_ZEEGUUTAG).off();
                translator.undoTranslate();
                attachZeeguuListeners();
            });

            /* When the like button is clicked, set its background color. */
            $(HTML_ID_TOGGLE_LIKE).click(function () {
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
            $(HTML_ID_TOGGLE_STAR).click(function () {
                starer.toggle();
            });

            UserActivityLogger.log(USER_EVENT_OPENED_ARTICLE, url, Date.now());

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


function addParagraphs(text) {
    text = '<p>' + text;
    text = text.replace(/\n\n/g, '</p><p>');
    return text;
}

function filterShit(text) {
    text = text.replace(/^false/g, '');
    text = text.replace(/^true/g, '');

    return text;
}

function wrapWordsInZeeguuTags(text) {
    text = text.replace(/([a-zA-Z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF\u0100-\u017F\u0180-\u024F_'’-]+)/g,
        "<" + config.HTML_ZEEGUUTAG + ">$1</" + config.HTML_ZEEGUUTAG + ">");
    return text;
}


function initElementsRequiringLanguagesAndArticleInfo(url, functions_to_follow) {
    ZeeguuRequests.get(GET_NATIVE_LANGUAGE, {}, function (language) {
        TO_LANGUAGE = language;

        ZeeguuRequests.get(GET_USER_ARTICLE_INFO, {url: url}, function (article_info) {
            FROM_LANGUAGE = article_info.language;

            translator = new Translator(FROM_LANGUAGE, TO_LANGUAGE);

            alterMenu = new AlterMenu(FROM_LANGUAGE, TO_LANGUAGE);

            // console.log("Previous Translations");
            // console.log(article_info.translations);
            // TITLE
            let title_text = article_info.title;
            title_text = wrapWordsInZeeguuTags(title_text);
            $("#articleTitle").html(title_text);

            // AUTHORS
            $("#authors").text(article_info.authors);

            // CONTENT
            let text = article_info.content;
            text = filterShit(text);
            text = wrapWordsInZeeguuTags(text);
            text = addParagraphs(text);
            $("#articleContent").html(text);

            // for (var i = 0, size = article_info.translations.length; i < size; i++) {
            //     let origin = article_info.translations[i].origin;
            //     let tag = $('ZEEGUU:contains("' + origin + '")')[0];
            //     console.log(tag);
            //     translator.translate(tag);
            //
            // }

            // STARRED
            if (article_info.starred) {
                // the HTML for the starer component starts
                // unstarred. thus it's sufficient to toggle it here
                starer.toggle();
                starer.setState(true);

            }

            // LIKED
            if (!article_info.liked) {
                $(HTML_ID_TOGGLE_LIKE).addClass(CLASS_MDL_BUTTON_DISABLED);
            }

            // These things have to be hidden
            // initially since otherwise they
            // stand out while we wait for the
            // text to arrive from the server.
            // But now that the text is in, we
            // can show them.
            $(HTML_ID_LIKE_BUTTON).show();

            $("#articleInfo").show();

            functions_to_follow();

            var upload_feedback_answer = function (event) {
                UserActivityLogger.log(USER_EVENT_FEEDBACK, url, event.target.id);
            };

            $("#back_button").click(function () {
                $("#header_row").hide();
                $("#question_article_read_fully").show();
            });

            $("#maybe_finish_later").click(upload_feedback_answer);

            $("#not_finished_for_boring").click(upload_feedback_answer);
            $("#not_finished_for_too_difficult").click(upload_feedback_answer);
            $("#not_finished_for_other").click(upload_feedback_answer);


            $("#not_finished").click(function (event) {
                $("#question_article_read_fully").hide();
                $("#question_reasons_not_to_finish").show();
            });

            $("#finished").click(function (event) {
                $("#question_article_read_fully").hide();
                $("#question_difficulty_for_finished_article").show();
            });

            $("#finished_difficulty_easy").click(upload_feedback_answer);
            $("#finished_difficulty_ok").click(upload_feedback_answer);
            $("#finished_difficulty_hard").click(upload_feedback_answer);


        }.bind(this));

    }.bind(this));


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
