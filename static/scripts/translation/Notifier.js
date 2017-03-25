/**
 * Allows for small pop-up messages.
 * Does not repeat the same message if it is still displaying it.
 */
function Notifier() {
    var lastMessage = "";

    /* Notify the user of <message>. */
    this.notify = function (message)
    {
        var snackbar = document.querySelector('.mdl-js-snackbar');
        if (lastMessage == message && $(snackbar).hasClass('mdl-snackbar--active'))
            return;
        snackbar.MaterialSnackbar.showSnackbar({ message: message });
        lastMessage = message;
    }
}