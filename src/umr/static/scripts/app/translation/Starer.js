import $ from 'jquery';
import config from '../config';
import UserActivityLogger from '../UserActivityLogger';
import ZeeguuRequests from '../zeeguuRequests';
import {POST_USER_ARTICLE} from '../zeeguuRequests';
import {get_article_id} from './article_id.js'


const USER_EVENT_STAR_ARTICLE = 'STAR ARTICLE';
const USER_EVENT_UNSTAR_ARTICLE = 'UNSTAR ARTICLE';
const OFF = 'off';

const HTML_ID_TOGGLESTAR = '#toggle_star';

const HTML_ID_STAR_FILL = '#toggle_star>#star_fill';
const HTML_ID_STAR_BORDER = '#toggle_star>#star_border';


/**
 * Implements the functionality for starring an article, together with
 * notifying Zeeguu about the changes.
 */
export default class Starer {
    /**
     * Initializes the state of the starer (default is false).
     */
    constructor(state = false) {
        this.setState(state);
    }

    /**
     * Sets the state of the starer and updates the UI
     * @param {boolean} state - Defines the state for the starer: true - 'on' or false - 'off'
     */
    setState(state) {
        this.on = state;
        if (this.on) {
            $(HTML_ID_STAR_FILL).removeClass(OFF);
            $(HTML_ID_STAR_BORDER).addClass(OFF);
        } else {
            $(HTML_ID_STAR_FILL).addClass(OFF);
            $(HTML_ID_STAR_BORDER).removeClass(OFF);
        }
    }

    /**
     * Toggles the star on/off based on its current state and notifies
     * Zeeguu accordingly.
     */
    toggle() {

        let title = $(config.HTML_ID_ARTICLE_TITLE).text();

        if (this.on) {
            // Launch Zeeguu request to notify about unstarring of article by user.
            let payload = {article_id: get_article_id(), starred: "False"}
            ZeeguuRequests.post(POST_USER_ARTICLE, payload);
            UserActivityLogger.log(USER_EVENT_UNSTAR_ARTICLE, '', {}, get_article_id());

        } else { // it's off            
            // Launch Zeeguu request to notify about starring an article.
            ZeeguuRequests.post(POST_USER_ARTICLE, {article_id: get_article_id(), starred: "True"});
            UserActivityLogger.log(USER_EVENT_STAR_ARTICLE, '', {}, get_article_id());
        }
        this._toggleState();
        this._toggleIcon();
    }


    /**
     * Toggles the internal state of this class between true and false.
     */
    _toggleState() {
        this.on = (this.on ? false : true);
    }

    /**
     * Toggles the icon of the star by adding or removing a class representing OFF.
     */
    _toggleIcon() {
        $(HTML_ID_TOGGLESTAR).children().each(function () {
            $(this).toggleClass(OFF);
        });
    }
}