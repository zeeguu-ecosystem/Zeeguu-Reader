define(function (require) {
    var $ = require('jquery'),
        domReady = require('domReady'),
        ArticleList = require('./ArticleList'),
        SubscriptionList = require('./SubscriptionList'),
        FeedSubscriber = require('./FeedSubscriber'),
        dialogPolyfill = require('polyfill/dialog-polyfill'),
        LanguageMenu = require('./LanguageMenu');

    /* Script that binds listeners to html events, such that the
     * correct object is called to handle it. */
    var articleList = new ArticleList();
    var subscriptionList = new SubscriptionList(articleList);
    var feedSubscriber = new FeedSubscriber(subscriptionList);
    var languageMenu = new LanguageMenu(feedSubscriber);

    /* When the document has finished loading,
     * bind all necessary listeners. */
    domReady(function () {
        subscriptionList.load();
        feedSubscriber.load();
        languageMenu.load();

        var addFeedDialog = document.querySelector('dialog');
        var showAddFeedDialogButton = document.querySelector('.show-modal');

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
});