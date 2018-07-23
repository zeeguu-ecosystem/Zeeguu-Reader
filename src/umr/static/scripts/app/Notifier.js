import $ from 'jquery';

const HTML_CLASS_SNACKBAR = '.mdl-js-snackbar';
const HTML_CLASS_SNACKBAR_ACTIVE = 'mdl-snackbar--active';

let lastMessage = "";

/**
 * Presents small pop-up messages (notifications).
 * Does not repeat the same message if it currently displays it.
 */
export default class Notifier {
    /**
     * Notify the user with the supplied message.
     * @param {string} message - Message to be displayed. 
     */
    static notify (message) {
        let snackbar = document.querySelector(HTML_CLASS_SNACKBAR);
        if (lastMessage === message && $(snackbar).hasClass(HTML_CLASS_SNACKBAR_ACTIVE))
            return;
        snackbar.MaterialSnackbar.showSnackbar({message: message});
        lastMessage = message;
    };
};
