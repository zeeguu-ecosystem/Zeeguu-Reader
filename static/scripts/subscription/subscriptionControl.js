/* Script that allows the user to add a new feed to their feed list using
 * a HTML dialog window, or remove a feed from their subscribed feed list. */
var articleList = new ArticleList();
var subscriptionList = new SubscriptionList(articleList);
var subscriptionManager = new SubscriptionManager(subscriptionList);
var languageMenu = new LanguageMenu();
 
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

// Called when no image could be loaded as an article avatar.
function noAvatar(image)
{
    image.src = noAvatarURL;
}
