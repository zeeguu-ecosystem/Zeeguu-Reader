import $ from 'jquery';
import config from '../config';
import Notifier from '../Notifier';
import Translator from './Translator';
import ZeeguuRequests from '../zeeguuRequests';
import UserActivityLogger from '../UserActivityLogger';

const HTML_ID_ALTERMENU = '#alterMenu';
const HTML_ID_ALTERMENUCONTAINER = '#alterMenuContainer';
const TEXT_SUGGESTION = 'Suggestion...';
const TEXT_NO_ALTERNATIVES = 'Sorry, no alternatives.';

const USER_EVENT_CLOSED_ALTERMENU = 'CLOSE ALTERMENU';
const USER_EVENT_OPENED_ALTERMENU = 'OPEN ALTERMENU';
const MIN_TRANS_COUNT = 2;

/**
 * Class that allows for choosing alternative zeeguu translations from
 * a drop-down alter menu.
 */
export default class AlterMenu {
    /**
     * Initialize the notifier field and the control field for the state of the
     * alter menu (i.e. open or closed).
     */
    constructor() {
        this.menuOpen = false;
        this.notifier = new Notifier();
    }

    /**
     * Create and open the alternative translation menu. 
     * @param {jQuery} $tran - jQuery element encompasing the <tran> tag, 
     * for which to present the alter menu.
     */
    build($tran) {
        // Check how many alternatives there are, if less than 2: abort.
        let countAttr = $tran.attr(config.HTML_ATTRIBUTE_TRANSCOUNT);
        if (!countAttr) return;

        var transCount = parseInt(countAttr);
        if (transCount < MIN_TRANS_COUNT && $tran.attr(config.HTML_ATTRIBUTE_SUGGESTION) === '') { // one translation means no alternatives
            this.notifier.notify(TEXT_NO_ALTERNATIVES);
        }
        this.construct($tran, transCount);
        this._place($tran);
        $(HTML_ID_ALTERMENU).hide();
        this.open();
    };

    /**
     * Add buttons with click listeners that replace the translation and
     * append these to the alter menu. 
     * @param {jQuery} $tran - Reference tag from which the alternative translations are retrieved.
     * @param {int} transCount - Number of present alternative translations. 
     */
    construct($tran, transCount) {
        $(HTML_ID_ALTERMENU).empty();
        for (var i = 0; i < transCount; i++) {
            var button = document.createElement('button');
            var alternative = $tran.attr(config.HTML_ATTRIBUTE_TRANSLATION + i);
            button.textContent = alternative;
            $(button).addClass("mdl-button").addClass("mdl-js-button").addClass("mdl-js-ripple-effect");
            $(HTML_ID_ALTERMENU).append($(button));
            $(button).click({$tran: $tran, alternative: i}, this._swapPrimaryTranslation);
            $(button).click({$tran: $tran, alternative: i}, this._sendSwappedTranslation.bind(this));
        }
        this._appendInputField($tran);
    }

    /**
     * Send the chosen translation from the list of choices to Zeeguu.
     * @param {Object} selectedAlternative - Attribute that determines the selected alternative.  
     */
    _sendSwappedTranslation(selectedAlternative) {
        let $tran = selectedAlternative.data.$tran;
    
        let word = $tran.parent().children(config.HTML_ORIGINAL).text();
        let translation = $tran.attr(config.HTML_ATTRIBUTE_TRANSLATION + selectedAlternative.data.alternative);
        let context = Translator._getContext($tran.parent().get(0));
        let url = window.location.href;
        let title = $(config.HTML_ID_ARTICLE_TITLE).text();
        let selected_from_predefined_choices = true;

        // Launch Zeeguu request to supply translation suggestion.
        ZeeguuRequests.post(config.POST_TRANSLATION_SUGGESTION + '/' + FROM_LANGUAGE + '/' + TO_LANGUAGE,
                           {word: word, context: context, url: url, title: title, translation: translation, 
                            selected_from_predefined_choices: selected_from_predefined_choices});
    }

    /** 
     * Appends the input field for user alternative, to the alter menu.
     * @param {jQuery} $tran - Reference tag from which the suggested translation is retrieved.
     */
    _appendInputField($tran) {
        var input_field = document.createElement('input');
        var suggestion  = $tran.attr(config.HTML_ATTRIBUTE_SUGGESTION);
        var value = (suggestion === '' ? TEXT_SUGGESTION : suggestion);
        $(input_field).addClass('mdl-textfield__input');
        $(input_field).attr('type', 'text');
        $(input_field).attr('id', config.HTML_ID_USER_ALTERNATIVE);        
        $(input_field).attr('value', value);
        $(HTML_ID_ALTERMENU).append($(input_field));
    }

    /**
     * Swap the currently set translation (config.HTML_ATTRIBUTE_TRANSLATION 0) with the selected alternative.
     * @param {Object} selectedAlternative - Attribute that determines the selected alternative.  
     */
    _swapPrimaryTranslation(selectedAlternative) {
        var $tran = selectedAlternative.data.$tran;
        var alternative = selectedAlternative.data.alternative;
        var newText = $tran.attr(config.HTML_ATTRIBUTE_TRANSLATION + alternative);
        $tran.attr(config.HTML_ATTRIBUTE_CHOSEN, newText);
    }

    /**
     * Place the alter menu below the supplied zeeguuTag.
     * @param {jQuery} $tran - Reference tag for the placement of the alter menu.
     */
    _place($tran) {
        var position = $tran.position();
        var tagHeight = $tran.outerHeight();
        var tagWidth = $tran.outerWidth();
        var menuWidth = $(HTML_ID_ALTERMENU).outerWidth();
        var topScroll = $(".mdl-layout__content").scrollTop();
        $tran.append($(HTML_ID_ALTERMENU));
        $(HTML_ID_ALTERMENU).css({
            position: "absolute",
            maxWidth: "35%",
            display: "inline-block",
            left: position.left + (tagWidth - menuWidth) / 2 + "px",
            top: position.top + tagHeight + topScroll + "px"
        });        
    }

    /**
     * Update the position of the alter menu.
     */
    reposition() {
        this._place($(HTML_ID_ALTERMENU).parent());
    };

    /**
     *  Hide (close) the alter menu. 
     */
    close() {
        let word = $(HTML_ID_ALTERMENU).parent().parent().children(config.HTML_ORIGINAL).text();
        UserActivityLogger.log(USER_EVENT_CLOSED_ALTERMENU, word);

        $(HTML_ID_ALTERMENU).slideUp(function () {
            $(HTML_ID_ALTERMENUCONTAINER).append($(HTML_ID_ALTERMENU));
            this.menuOpen = false;
        }.bind(this));
    };

    /**
     *  Open the alter menu. 
     */
    open() {
        let word = $(HTML_ID_ALTERMENU).parent().parent().children(config.HTML_ORIGINAL).text();
        UserActivityLogger.log(USER_EVENT_OPENED_ALTERMENU, word);
        
        $(HTML_ID_ALTERMENU).slideDown(function () {
            this.menuOpen = true
        }.bind(this));
    };

    /**
     * Check whether the alter menu is an open state.
     * @return {boolean} - True only if the alter menu is open.
     */
    isOpen() {
        return this.menuOpen;
    };
};
