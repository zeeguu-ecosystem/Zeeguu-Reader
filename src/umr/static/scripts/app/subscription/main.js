import $ from 'jquery';
import ArticleList from './ArticleList';
import SubscriptionList from './SubscriptionList';
import FeedSubscriber from './FeedSubscriber';
import dialogPolyfill from 'dialog-polyfill';
import LanguageMenu from './LanguageMenu';
import config from '../config';

/* Script that binds listeners to html events, such that the
 * correct object is called to handle it. */
let subscriptionList = new SubscriptionList();
let articleList = new ArticleList(subscriptionList);
let feedSubscriber = new FeedSubscriber(subscriptionList);
let languageMenu = new LanguageMenu(feedSubscriber);

document.addEventListener(config.EVENT_SUBSCRIPTION, function(e) {
    articleList.clear();
    articleList.load(e.detail);
});

/* When the document has finished loading,
 * bind all necessary listeners. */
$(document).ready(function() {
    subscriptionList.load();
    feedSubscriber.load();
    languageMenu.load();

    let addFeedDialog = document.querySelector('dialog');
    let showAddFeedDialogButton = document.querySelector('.show-modal');

    // Some browsers do not support dialog, for that we use Polyfill.
    if (!addFeedDialog.showModal)
        dialogPolyfill.registerDialog(addFeedDialog);

    // Open and closing of the dialog is handled here.
    showAddFeedDialogButton.addEventListener('click', function () {
        addFeedDialog.showModal();
        $('#' + feedSubscriber.getCurrentLanguage()).focus();
    });

    addFeedDialog.querySelector('.close').addEventListener('click', function () {
        addFeedDialog.close();
    });
});

/* Called when no image could be loaded as an article avatar. */
function noAvatar(image) {
    image.src = noAvatarURL;
}