define(['jquery', 'app/config'], function ($, config) {
    // Launch request to Zeeguu API.
    return {
        requestZeeguuGET: function(endpoint, requestData, responseHandler)
        {
            requestData.session = SESSION_ID;
            $.get(
                config.ZEEGUU_SERVER + endpoint,
                requestData,
                responseHandler
            );
        },

        requestZeeguuPOST: function(endpoint, requestData, responseHandler) {
            $.post(
                config.ZEEGUU_SERVER + endpoint + "?session=" + SESSION_ID,
                requestData,
                responseHandler
            );
        }
    };
});