import $ from 'jquery';
import Mustache from 'mustache';
import ArticleList from './ArticleList';
import StarredArticleList from './StarredArticleList';
import SourceSubscriptionList from './SourceSubscriptionList.js';
import SourceSubscriber from './SourceSubscriber.js';
import TopicSubscriber from './TopicSubscriber.js';
import TopicSubscriptionList from './TopicSubscriptionList.js';
import TopicFilterSubscriptionList from "./TopicFilterSubscriptionList";
import TopicFilterSubscriber from "./TopicFilterSubscriber";
import SearchFilterSubscriptionList from "./SearchFilterSubscriptionList"
import SearchSubscriptionList from "./SearchSubscriptionList";
import LanguageSubscriptionList from "./LanguageSubscriptionList";
import LanguageSubscriber from "./LanguageSubscriber";
import config from '../config';

const HTML_ID_SEARCH_NOTIFCATION_TEMPLATE = '#search-notification-template';
const HTML_ID_SEARCH_NOTIFICATION = '.searchNotification';


import "../../../styles/mdl/material.min.js";
import '../../../styles/mdl/material.min.css';
import '../../../styles/material-icons.css';
import '../../../styles/loader.css';
import '../../../styles/login.css';
import '../../../styles/articles.css';
import '../../../styles/addSourceDialog.css';
import '../../../styles/addTopicDialog.css';
import '../../../styles/sweetalert.css';


/* Script that binds listeners to html events, such that the
 * correct object is called to handle it. */
let sourceSubscriptionList = new SourceSubscriptionList();
let articleList = new ArticleList(sourceSubscriptionList);
let sourceSubscriber = new SourceSubscriber(sourceSubscriptionList);
let starredArticleList = new StarredArticleList();
let topicSubscriptionList = new TopicSubscriptionList();
let topicFilterSubscriptionList = new TopicFilterSubscriptionList();
let searchSubscriptionList = new SearchSubscriptionList();
let searchFilterSubscriptionList = new SearchFilterSubscriptionList();
let topicSubscriber = new TopicSubscriber(topicSubscriptionList, searchSubscriptionList);
let topicFilterSubscriber = new TopicFilterSubscriber(topicFilterSubscriptionList, searchFilterSubscriptionList);
let languageSubscriptionList = new LanguageSubscriptionList();
let languageSubscriber = new LanguageSubscriber(languageSubscriptionList);

document.addEventListener(config.EVENT_SUBSCRIPTION, function () {
    articleList.clear();
    articleList.load();
    $(HTML_ID_SEARCH_NOTIFICATION).empty();
});

document.addEventListener(config.EVENT_LOADING, function () {
    articleList.clear();
    articleList.showLoader();
});

/* When the document has finished loading,
 * bind all necessary listeners. */
$(document).ready(function () {
    starredArticleList.load();
    topicSubscriptionList.load();
    topicSubscriber.load();
    topicFilterSubscriptionList.load();
    topicFilterSubscriber.load();
    searchSubscriptionList.load();
    searchFilterSubscriptionList.load();
    languageSubscriptionList.load();
    languageSubscriber.load();
    sourceSubscriptionList.load();
    sourceSubscriber.load();

    let showAddLanguageDialog = document.querySelector('.show-language-subscriber');
    $(showAddLanguageDialog).click(function () {
        languageSubscriber.open();
    });

    let showAddFeedDialogButton = document.querySelector('.show-source-subscriber');
    $(showAddFeedDialogButton).click(function () {
        sourceSubscriber.open();
    });

    let showAddTopicDialogButton = document.querySelector('.show-topic-subscriber');
    $(showAddTopicDialogButton).click(function () {
        topicSubscriber.open();
    });

    let showAddFilterDialogButton = document.querySelector('.show-filter-subscriber');
    $(showAddFilterDialogButton).click(function () {
        topicFilterSubscriber.open();
    });

    let searchExecuted = document.querySelector('#search-expandable');
    $(searchExecuted).keyup(function(event) {
        if (event.keyCode === 13) {
            let input = $(searchExecuted).val();
            $(searchExecuted).val('');
            let layout = document.querySelector('.mdl-layout');
            layout.MaterialLayout.toggleDrawer();
            articleList.search(input);
            showSearchNotification(input)
        }
    });

});

/* Called when no image could be loaded as an article avatar. */
function noAvatar(image) {
    image.src = noAvatarURL;
}

function showSearchNotification(input){
    let template = $(HTML_ID_SEARCH_NOTIFCATION_TEMPLATE).html();
    $(HTML_ID_SEARCH_NOTIFICATION).empty();

    let templateAttributes = {
        displayText: "You searched for : " + input,
    };

    let element = Mustache.render(template, templateAttributes);
    $(HTML_ID_SEARCH_NOTIFICATION).append(element);

    let searchNotificationBox = document.querySelector('.search-notification-box');
    $(searchNotificationBox).click(function () {
        articleList.clear();
        articleList.load();
        $(HTML_ID_SEARCH_NOTIFICATION).empty();
    });
}

$(document).keydown(function (event) {

    let highlighted_element = $("#articleLinkList").children(".highlightedArticle");

    switch (event.key) {
        case 'ArrowDown':
            _select_next_article(highlighted_element, true);
            break;
        case 'ArrowUp':
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


