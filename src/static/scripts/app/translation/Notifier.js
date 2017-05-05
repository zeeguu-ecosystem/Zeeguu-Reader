import $ from 'jquery';

/**
 * Allows for small pop-up messages.
 * Does not repeat the same message if it is still displaying it.
 */
export default class Notifier {
    constructor() {
        this.lastMessage = "";
    };

    /* Notify the user of <message>. */
    notify (message) {
        var snackbar = document.querySelector('.mdl-js-snackbar');
        if (this.lastMessage == message && $(snackbar).hasClass('mdl-snackbar--active'))
            return;
        snackbar.MaterialSnackbar.showSnackbar({message: message});
        this.lastMessage = message;
    };
};