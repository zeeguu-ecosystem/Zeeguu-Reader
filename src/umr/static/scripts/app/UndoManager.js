import $ from 'jquery';
import config from './config'

/**
 * Class that allows for saving the state of the page content after each
 * translation and restore upon request.
 */
export default class UndoManager {
    /**
     * Initialize the stack for saving the states.
     */
    constructor() {
        this.stack = [];
    }

    /**
     * Push state onto the stack.
     */
    pushState() {
        var $saved = $(config.HTML_CLASS_PAGECONTENT).clone();
        this.stack.push($saved);
    }


    /** Revert to previous state stored on the stack. */
    undoState() {
        var $saved = this.stack.pop();
        if ($saved) {
            $(config.HTML_CLASS_PAGECONTENT).remove();
            $('.mdl-layout__content').prepend($saved);    
        }
    }
};
