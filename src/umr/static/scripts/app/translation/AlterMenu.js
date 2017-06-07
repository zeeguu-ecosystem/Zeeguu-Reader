import $ from 'jquery';
import config from '../config'
import Notifier from '../Notifier'

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
        var transCount = parseInt($tran.attr(config.HTML_ATTRIBUTE_TRANSCOUNT));
        if (transCount < 2 && $tran.attr(config.HTML_ATTRIBUTE_SUGGESTION) === '') { // one translation means no alternatives
            this.notifier.notify(config.TEXT_NO_ALTERNATIVES);
        }
        this.construct($tran, transCount);
        this._place($tran);
        $(config.HTML_ID_ALTERMENU).hide();
        this.open();
    };

    /**
     * Add buttons with click listeners that replace the translation and
     * append these to the alter menu. 
     * @param {jQuery} $tran - Reference tag from which the alternative translations are retrieved.
     * @param {int} transCount - Number of present alternative translations. 
     */
    construct($tran, transCount) {

        $(config.HTML_ID_ALTERMENU).empty();
        for (var i = 0; i < transCount; i++) {
            var button = document.createElement('button');
            var alternative = $tran.attr(config.HTML_ATTRIBUTE_TRANSLATION + i);
            button.textContent = alternative;
            $(button).addClass("mdl-button").addClass("mdl-js-button").addClass("mdl-js-ripple-effect");
            $(config.HTML_ID_ALTERMENU).append($(button));
            $(button).click({$tran: $tran, alternative: i}, this._swapPrimaryTranslation);
        }
        this._appendInputField($tran);
    }

    /** 
     * Appends the input field for user alternative, to the alter menu.
     * @param {jQuery} $tran - Reference tag from which the suggested translation is retrieved.
     */
    _appendInputField($tran) {
        var input_field = document.createElement('input');
        var suggestion  = $tran.attr(config.HTML_ATTRIBUTE_SUGGESTION);
        var value = (suggestion === '' ? config.TEXT_SUGGESTION : suggestion);
        $(input_field).addClass('mdl-textfield__input');
        $(input_field).attr('type', 'text');
        $(input_field).attr('id', config.HTML_ID_USER_ALTERNATIVE);        
        $(input_field).attr('value', value);
        $(config.HTML_ID_ALTERMENU).append($(input_field));
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
        var menuWidth = $(config.HTML_ID_ALTERMENU).outerWidth();
        var topScroll = $(".mdl-layout__content").scrollTop();
        $tran.append($(config.HTML_ID_ALTERMENU));
        $(config.HTML_ID_ALTERMENU).css({
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
        this._place($(config.HTML_ID_ALTERMENU).parent());
    };

    /**
     *  Hide (close) the alter menu. 
     */
    close() {
        $(config.HTML_ID_ALTERMENU).slideUp(function () {
            $(config.HTML_ID_ALTERMENUCONTAINER).append($(config.HTML_ID_ALTERMENU));
            this.menuOpen = false;
        }.bind(this));
    };

    /**
     *  Open the alter menu. 
     */
    open() {
        $(config.HTML_ID_ALTERMENU).slideDown(function () {
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
