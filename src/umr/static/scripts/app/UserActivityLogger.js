import ZeeguuRequests from './zeeguuRequests'

const POST_USER_ACTIVITY_ENDPOINT = '/upload_user_activity_data';

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
    static log(event, value = '', extra_data = {}) {
        let date = new Date();
        let time = date.getUTCFullYear() + '-' + date.getUTCMonth() + '-' + date.getUTCDate()
                 + 'T' + date.getUTCHours() + ':' + date.getUTCMinutes() + ':' + date.getUTCMinutes();
        let eventInformation = {time: time,
                    event: 'UMR - ' + event,
                    value:value,
                    extra_data: JSON.stringify(extra_data)
        };
        ZeeguuRequests.post(POST_USER_ACTIVITY_ENDPOINT, event_information, this._onReply);
    }

    /**
     * Handle the reply from zeeguu.
     * @param reply
     * @private
     */
    static _onReply(reply) {
        if (reply !== 'OK')
            console.log('Failed to record user activity, reply: ' + reply);
    }
}