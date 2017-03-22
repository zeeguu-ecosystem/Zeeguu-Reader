/* Script that binds listeners to html events, such that the
 * correct object is called to handle it. */
var articleList = new ArticleList();
var subscriptionList = new SubscriptionList(articleList);
var subscriptionManager = new SubscriptionManager(subscriptionList);
var languageMenu = new LanguageMenu();

/* When the document has finished loading,
 * bind all necessary listeners. */
$(document).ready(function() {
    subscriptionList.load();
    subscriptionManager.load();
    languageMenu.load();

    var dialog = document.querySelector('dialog');
    var showModalButton = document.querySelector('.show-modal');

    // Some browsers do not support dialog, for that we use Polyfill.
    if (! dialog.showModal)
        dialogPolyfill.registerDialog(dialog);

    // Open and closing of the dialog is handled here.
    showModalButton.addEventListener('click', function()
    {
        dialog.showModal();
        $('#' + subscriptionManager.getCurrentLanguage()).focus();
    });

    dialog.querySelector('.close').addEventListener('click', function()
    {
        dialog.close();
    });
});

/* Called when no image could be loaded as an article avatar. */
function noAvatar(image)
{
    image.src = noAvatarURL;
}
