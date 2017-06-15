import $ from 'jquery';
import config from './config';
import ZeeguuRequests from './zeeguuRequests';
import UserActivityLogger from '../UserActivityLogger';

const USER_EVENT_STAR_ARTICLE = 'STAR ARTICLE';
const USER_EVENT_UNSTAR_ARTICLE = 'UNSTAR ARTICLE';
const OFF = 'off';
/**
 * Implements the functionality for starring an article, together with 
 * notifying Zeeguu about the changes.
 */
export default class Starer {
    /**
     * Sets the default state of the starer to false (i.e. untoggled)
     */
    constructor() {
        this.on = false; 
    }

    /**
     * Toggles the star on/off based on its current state and notifies
     * Zeeguu accordingly.
     */
    toggle() {
        let url = $(config.HTML_ID_ARTICLE_URL).children('a').attr('href');
        let title = $(config.HTML_ID_ARTICLE_TITLE).text();
        let articleInfo = {title: title};
        if (this.on) {
            // Launch Zeeguu request to notify about unstarring of article by user.
            ZeeguuRequests.post(config.POST_UNSTAR_ARTICLE, {url: url});
            UserActivityLogger.log(USER_EVENT_UNSTAR_ARTICLE, url, articleInfo);
    
        } else { // it's off            
            // Launch Zeeguu request to notify about starring an article.
            ZeeguuRequests.post(config.POST_STAR_ARTICLE, {url: url, title: title, language_id: FROM_LANGUAGE});
            UserActivityLogger.log(USER_EVENT_STAR_ARTICLE, url, articleInfo);
        }
        this._toggleState();
        this._toggleIcon();
    }

    _toggleState() {
        this.on = (this.on ? false : true);
    }

    _toggleIcon() {
        $(config.HTML_ID_TOGGLESTAR).children().each(function() {
            $(this).toggleClass(OFF);
        });
    }
}