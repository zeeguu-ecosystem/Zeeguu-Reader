import ZeeguuRequests from './zeeguuRequests';
import {POST_USER_ACTIVITY_ENDPOINT} from './zeeguuRequests';
import {get_article_id} from "./translation/article_id";

/**
 * Abstracts logging a user event.
 * @see https://www.zeeguu.unibe.ch
 */
export default class UserActivityLogger {
    /**
     * Log a user event and send the information to zeeguu.
     * Uses {@link ZeeguuRequests}.
     * @param {string} event - The tag categorising the event. Always prepended with 'UMR'.
     * @param {string} value - Primary information of the event, can be empty.
     * @param {Object} extra_data - Optional additional information.
     */
    static log(event, value = '', extra_data = {}, article_id='') {

        let event_information = {
            time: new Date().toJSON(),
            event: 'UMR - ' + event,
            value: value,
            extra_data: JSON.stringify(extra_data),
            article_id: article_id
        };
        ZeeguuRequests.post(
            POST_USER_ACTIVITY_ENDPOINT,
            event_information,
            this._onReply);
    }

    static log_article_interaction(event, value = '', extra_data = {}) {
        this.log(event, value, extra_data, get_article_id())
    }

    /**
     * Handle the reply from zeeguu.
     * @param {string} reply - Success status, 'OK' if all went well.
     */
    static _onReply(reply) {
        if (reply !== 'OK')
            console.log('Failed to record user activity, reply: ' + reply);
    }
}
