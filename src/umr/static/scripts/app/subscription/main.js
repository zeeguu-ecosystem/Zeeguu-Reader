import $ from 'jquery';
import ArticleList from './ArticleList';
import StarredArticleList from './StarredArticleList';
import SubscriptionList from './SubscriptionList';
import FeedSubscriber from './FeedSubscriber';
import LanguageMenu from './LanguageMenu';
import config from '../config';

import '../../../styles/mdl/material.min.js';
import '../../../styles/mdl/material.min.css';
import '../../../styles/material-icons.css';
import '../../../styles/loader.css';
import '../../../styles/login.css';
import '../../../styles/articles.css';
import '../../../styles/sweetalert.css';

/* Script that binds listeners to html events, such that the
 * correct object is called to handle it. */
let subscriptionList = new SubscriptionList();
let articleList = new ArticleList(subscriptionList);
let starredArticleList = new StarredArticleList();
let languageMenu = new LanguageMenu();
let feedSubscriber = new FeedSubscriber(subscriptionList, languageMenu);

document.addEventListener(config.EVENT_SUBSCRIPTION, function(e) {
    articleList.clear();
    articleList.load(e.detail);
});

/* When the document has finished loading,
 * bind all necessary listeners. */
$(document).ready(function() {
    starredArticleList.load();
    subscriptionList.load();
    feedSubscriber.load();

    let showAddFeedDialogButton = document.querySelector('.show-modal');
    $(showAddFeedDialogButton).click(function () {
        feedSubscriber.open();
    });
});

/* Called when no image could be loaded as an article avatar. */
function noAvatar(image) {
    image.src = noAvatarURL;
}