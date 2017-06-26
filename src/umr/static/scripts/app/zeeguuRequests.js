import $ from 'jquery';
import config from './config'

const ZEEGUU_SERVER = 'https://zeeguu.unibe.ch/api';
const ZEEGUU_SESSION = 'sessionID';
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


