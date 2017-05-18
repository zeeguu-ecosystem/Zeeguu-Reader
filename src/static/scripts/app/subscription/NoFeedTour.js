import $ from 'jquery'
import config from '../config';

/**
 * Shows or hides style for when there is no feed.
 */
export default class NoFeedTour {

    /**
     * Show a tour styling, guiding the user to new feeds.
     */
    show() {
        $(config.HTML_CLASS_EMPTY_PAGE).show();
        $(config.HTML_CLASS_TOUR).addClass(config.HTML_CLASS_WIGGLE);
        $('.mdl-layout__drawer-button').addClass(config.HTML_CLASS_WIGGLE);
    }

    /**
     * Hides the tour styling.
     */
    hide() {
        $(config.HTML_CLASS_EMPTY_PAGE).hide();
        $(config.HTML_CLASS_TOUR).removeClass(config.HTML_CLASS_WIGGLE);
        $('.mdl-layout__drawer-button').removeClass(config.HTML_CLASS_WIGGLE);
    }
}