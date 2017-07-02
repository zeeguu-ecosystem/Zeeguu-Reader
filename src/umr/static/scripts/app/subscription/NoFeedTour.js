import $ from 'jquery';
import UserActivityLogger from '../UserActivityLogger';

const HTML_ID_EMPTY_ARTICLE_LIST = '#emptyArticleListImage';
const HTML_CLASS_TOUR = '.tour';
const HTML_CLASS_NAME_WIGGLE = 'wiggle';
const HTML_CLASS_MDL_BURGER = '.mdl-layout__drawer-button';
const USER_EVENT_SHOW = 'NO-FEED-TOUR SHOWN';
const USER_EVENT_HIDE = 'NO-FEED-TOUR HIDDEN';

/**
 * Shows or hides style for when there is no feed.
 */
export default class NoFeedTour {
    /**
     * Show a tour styling, guiding the user to new feeds.
     */
    show() {
        UserActivityLogger.log(USER_EVENT_SHOW);
        $(HTML_ID_EMPTY_ARTICLE_LIST).show();
        $(HTML_CLASS_TOUR).addClass(HTML_CLASS_NAME_WIGGLE);
        $(HTML_CLASS_MDL_BURGER).addClass(HTML_CLASS_NAME_WIGGLE);
    }

    /**
     * Hides the tour styling.
     */
    hide() {
        UserActivityLogger.log(USER_EVENT_HIDE);
        $(HTML_ID_EMPTY_ARTICLE_LIST).hide();
        $(HTML_CLASS_TOUR).removeClass(HTML_CLASS_NAME_WIGGLE);
        $(HTML_CLASS_MDL_BURGER).removeClass(HTML_CLASS_NAME_WIGGLE);
    }
}
