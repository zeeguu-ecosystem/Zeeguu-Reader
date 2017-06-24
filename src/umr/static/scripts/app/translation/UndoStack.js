import $ from 'jquery';
import config from '../config'

/**
 * Class that allows for saving the state of the page content after each
 * translation and restore upon request.
 */
export default class UndoStack {
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
        let $saved = $(config.HTML_CLASS_PAGECONTENT).clone();
        let $zeeguu = $saved.find(config.HTML_ZEEGUUTAG + config.HTML_CLASS_LOADING);
        let word = $zeeguu.text();
        $zeeguu.empty().removeClass(config.CLASS_LOADING).text(word);
        this.stack.push($saved);
    }


    /** Revert to previous state stored on the stack. */
    undoState() {
        var $saved = this.stack.pop();
        if ($saved) {
            $(config.HTML_CLASS_PAGECONTENT).remove();
            $(config.HTML_CLASS_CONTENTCONTAINER).prepend($saved);    
        }
    }
};
