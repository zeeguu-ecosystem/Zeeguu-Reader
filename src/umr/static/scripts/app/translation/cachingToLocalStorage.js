import {GET_NATIVE_LANGUAGE} from "../zeeguuRequests";
import ZeeguuRequests from "../zeeguuRequests";

export function ensuring_TO_LANGUAGE_in_localStorage(callback_that_needs_TO_LANGUAGE) {
    // cache TO_LANGUAGE in localStorage if it's not there already
    if ("TO_LANGUAGE" in localStorage) {
        callback_that_needs_TO_LANGUAGE();
    } else {

        ZeeguuRequests.get(GET_NATIVE_LANGUAGE, {}, function (language) {
            localStorage["TO_LANGUAGE"] = language;
            callback_that_needs_TO_LANGUAGE();
        });
    }

}
