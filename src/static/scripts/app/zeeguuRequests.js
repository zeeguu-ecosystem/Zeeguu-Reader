import $ from 'jquery';
import config from './config'

// Launch request to Zeeguu API.
export default class ZeeguuRequests {
    static get (endpoint, requestData, responseHandler) {
        requestData.session = SESSION_ID;
        $.get(
            config.ZEEGUU_SERVER + endpoint,
            requestData,
            responseHandler
        );
    }

    static post (endpoint, requestData, responseHandler) {
        $.post(
            config.ZEEGUU_SERVER + endpoint + "?session=" + SESSION_ID,
            requestData,
            responseHandler
        );
    }
}


