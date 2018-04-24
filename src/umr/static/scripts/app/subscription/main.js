import $ from 'jquery';
import ArticleList from './ArticleList';
import StarredArticleList from './StarredArticleList';
import SubscriptionList from './SubscriptionList';
import FeedSubscriber from './FeedSubscriber';
import config from '../config';

import "../../../styles/mdl/material.min.js";
import '../../../styles/mdl/material.min.css';
import '../../../styles/material-icons.css';
import '../../../styles/loader.css';
import '../../../styles/login.css';
import '../../../styles/articles.css';
import '../../../styles/addFeedDialog.css';
import '../../../styles/sweetalert.css';
""
/* Script that binds listeners to html events, such that the
 * correct object is called to handle it. */
let subscriptionList = new SubscriptionList();
let articleList = new ArticleList(subscriptionList);
let feedSubscriber = new FeedSubscriber(subscriptionList);
let starredArticleList = new StarredArticleList();


document.addEventListener(config.EVENT_SUBSCRIPTION, function (e) {
    articleList.clear();
    articleList.load(e.detail);
});

/* When the document has finished loading,
 * bind all necessary listeners. */
$(document).ready(function () {
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


$(document).keydown(function (event) {

    let highlighted_element = $("#articleLinkList").children(".highlightedArticle");

    switch (event.key) {

        case 'ArrowDown':
        case 'j':
            _select_next_article(highlighted_element, true);
            break;

        case 'ArrowUp':
        case 'k':
            _select_next_article(highlighted_element, false);
            break;
        case 'Enter':
            window.location.href = highlighted_element.children("a")[0].href;
            break;
    }

});

function scrollToView(elem) {
    var margin_of_error = 100;

    var offset = elem.offset().top;
    if (!elem.is(":visible")) {
        elem.css({"visibility": "hidden"}).show();
        var offset = elem.offset().top;
        elem.css({"visibility": "", "display": ""});
    }

    var visible_area_start = $(window).scrollTop();
    var visible_area_end = visible_area_start + window.innerHeight;

    if (offset < visible_area_start + margin_of_error || offset > visible_area_end - margin_of_error) {
        // Not in view so scroll to it
        elem[0].scrollIntoView();
        return false;
    }
    return true;
}


function _select_next_article(highlighted_element, direction_forward) {

    if (highlighted_element[0] == undefined) {
        $("#articleLinkList").children(":first").toggleClass("highlightedArticle");
    } else {

        let new_higlight;

        if (direction_forward) {
            new_higlight = $("#articleLinkList").children(".highlightedArticle").next().next();
        } else {
            new_higlight = $("#articleLinkList").children(".highlightedArticle").prev().prev();
        }

        // we couldn't find a next or a previous...
        if (new_higlight[0] == undefined) {
            return;
        }

        new_higlight.toggleClass("highlightedArticle");
        highlighted_element.toggleClass("highlightedArticle");

        scrollToView(new_higlight);

    }
}


