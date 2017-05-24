import $ from 'jquery';

/**
 * Presents small pop-up messages (notifications).
 * Does not repeat the same message if it currently displays it.
 */
export default class Notifier {
    /**
     * Initializes the previously displayed message field. Empty at creation.
     */
    constructor() {
        this.lastMessage = "";
    };

    /**
     * Notify the user with the supplied message.
     * @param {string} message - Message to be displayed. 
     */
    notify (message) {
        let snackbar = document.querySelector('.mdl-js-snackbar');
        if (this.lastMessage === message && $(snackbar).hasClass('mdl-snackbar--active'))
            return;
        snackbar.MaterialSnackbar.showSnackbar({message: message});
        this.lastMessage = message;
    };
};