import $ from 'jquery';

const ZEEGUU_SERVER = 'http://localhost:9991';
const ZEEGUU_SESSION = 'sessionID';

/** Get a list of recommended feeds. */
export const RECOMMENDED_FEED_ENDPOINT = '/recommended_feeds';
/** Follow a feed. */
export const FOLLOW_FEED_ENDPOINT =  '/start_following_feed';
/** Stop following a feed. */
export const UNFOLLOW_FEED_ENDPOINT = '/stop_following_feed';
/** Get all possible translations available for a given piece of text. */
export const GET_TRANSLATIONS_ENDPOINT = '/get_possible_translations';
/** Get a list of all feeds followed by this user.  */
export const GET_FEEDS_BEING_FOLLOWED = '/followed_feeds';
/** Get all articles for a particular feed. */
export const GET_FEED_ITEMS = '/get_feed_items_with_metrics';


/** Get a list of available languages. */
export const GET_AVAILABLE_LANGUAGES = '/available_languages';
/** Get which language the user is currently learning. */
export const GET_LEARNED_LANGUAGE = '/learned_language';
/** Get the native language of this user. */
export const GET_NATIVE_LANGUAGE = '/native_language';


/** Post a user-generated translation for a piece of text. */
export const POST_TRANSLATION_SUGGESTION = '/contribute_translation';

/** Post a user-activity event. */
export const POST_USER_ACTIVITY_ENDPOINT = '/upload_user_activity_data';


/** Get all starred or liked articles. */
export const GET_STARRED_ARTICLES = '/user_articles/starred_or_liked';

/** Get articles recommended by the server. */
export const GET_RECOMMENDED_ARTICLES = '/user_articles/recommended';


/** Info about a single article **/
export const GET_USER_ARTICLE_INFO = '/user_article';

/** Updates the user article info **/
export const POST_USER_ARTICLE = '/user_article';

/**
 * Abstracts request to the Zeeguu API.
 * @see https://www.zeeguu.unibe.ch
 */
export default class ZeeguuRequests {
    /**
     * Retrieve the Zeeguu sessionID.
     * @returns {?string} session - The session ID of the user, if present.
     */
    static session () {
        return this._readCookie(ZEEGUU_SESSION);
    }

    /**
     * Read a cookie, search for the attribute of a particular name and retrieve it.
     * @param {string} name - The name of the attribute.
     * @returns {?string} session - The session ID of the user, if present.
     */
    static _readCookie(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
            }
            return '';
        }

    /**
     * Send a GET request to the Zeeguu API.
     * @param {string} endpoint - The endpoint to use.
     * @param {string[]} requestData - Parameters to append.
     * @param {function(data : string)} responseHandler - A function that can asynchronously handle the reply.
     */
    static get (endpoint, requestData, responseHandler = function() {}) {
        requestData.session = this.session();
        $.get(
            ZEEGUU_SERVER + endpoint,
            requestData,
            responseHandler
        );
    }

    /**
     * Send a POST request to the Zeeguu API.
     * @param {string} endpoint - The endpoint to use.
     * @param {string[]} requestData - Parameters to append.
     * @param {function(data : string)} responseHandler - A function that can asynchronously handle the reply.
     */
    static post (endpoint, requestData, responseHandler = function() {}) {
        $.post(
            ZEEGUU_SERVER + endpoint + "?session=" + this.session(),
            requestData,
            responseHandler
        );
    }
}
