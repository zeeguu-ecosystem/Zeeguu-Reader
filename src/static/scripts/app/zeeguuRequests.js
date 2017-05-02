import $ from 'jquery';
import config from './config'

// Launch request to Zeeguu API.
export default class ZeeguuRequests {
    static session () {
        return this._readCookie(config.ZEEGUU_SESSION);
    }

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

    static get (endpoint, requestData, responseHandler) {
        requestData.session = this.session();
        $.get(
            config.ZEEGUU_SERVER + endpoint,
            requestData,
            responseHandler
        );
    }

    static post (endpoint, requestData, responseHandler) {
        $.post(
            config.ZEEGUU_SERVER + endpoint + "?session=" + this.session(),
            requestData,
            responseHandler
        );
    }
}


