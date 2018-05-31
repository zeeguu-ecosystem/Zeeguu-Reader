import $ from 'jquery';
/* Deployment server:
const ZEEGUU_SERVER = 'https://zeeguu.unibe.ch/api'; */
/* Test server: */
const ZEEGUU_SERVER = 'http://localhost:9001';
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

/** "OLD LANGUAGE ENDPOINTS, STILL USED ATM THOUGH. */
/** Get a list of available languages. */
export const GET_AVAILABLE_LANGUAGES = '/available_languages';
/** Get which language the user is currently learning. */
export const GET_LEARNED_LANGUAGE = '/learned_language';
/** Get the native language of this user. */
export const GET_NATIVE_LANGUAGE = '/native_language';
/** Get the reading languages of this user. */
export const GET_READING_LANGUAGES = '/user_languages/reading';

/** "NEW LANGUAGE ENDPOINTS FOR THE USER_LANGUAGE " */
/** Get all the languages the user is learning. */
export const GET_USER_LANGUAGES = '/user_languages';
/** Add a language for the user to learn. */
export const MODIFY_USER_LANGUAGE = '/user_languages/modify';
/** Delete a language the user is learning. */
export const DELETE_USER_LANGUAGE = '/user_languages/delete';
/** Get all the interesting languages for a user */
export const GET_INTERESTING_LANGUAGES = '/user_languages/interesting';


/** Get a list of available topics. */
export const GET_AVAILABLE_TOPICS = '/interesting_topics';
/** Get which topics the user is currently subscribed to. */
export const GET_SUBSCRIBED_TOPICS = '/subscribed_topics';
/** Subscribe to a new topic. */
export const SUBSCRIBE_TOPIC_ENDPOINT = '/subscribe_topic';
/** Unsubscribe from a topic. */
export const UNSUBSCRIBE_TOPIC_ENDPOINT = '/unsubscribe_topic';


/** Get a lit of the user's current filters. */
export const GET_SUBSCRIBED_FILTERS = '/filtered_topics';
/** Subscribe to a new filter. */
export const SUBSCRIBE_FILTER_ENDPOINT = '/filter_topic';
/** Unsubscribe from a filter. */
export const UNSUBSCRIBE_FILTER_ENDPOINT = '/unfilter_topic';


/** General article search in the database. */
export const SEARCH_ENDPOINT = '/search';
/** Get a user's current search subscriptions. */
export const GET_SUBSCRIBED_SEARCHES = '/subscribed_searches';
/** Subscribe to a search term. */
export const SUBSCRIBE_SEARCH_ENDPOINT = '/subscribe_search';
/** Unsubscribe from a search term. */
export const UNSUBSCRIBE_SEARCH_ENDPOINT = '/unsubscribe_search';

/** Get a user's current search filters. */
export const GET_FILTERED_SEARCHES = '/filtered_searches';
/** Filter a search term out. */
export const FILTER_SEARCH_ENDPOINT = '/filter_search';
/** Unfilter a search term. */
export const UNFILTER_SEARCH_ENDPOINT = '/unfilter_search';


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
