import $ from 'jquery';
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
let topicSubscriber = new TopicSubscriber(topicSubscriptionList);
let topicFilterSubscriptionList = new TopicFilterSubscriptionList();
let topicFilterSubscriber = new TopicFilterSubscriber(topicFilterSubscriptionList);
let searchSubscriptionList = new SearchSubscriptionList();
let searchFilterSubscriptionList = new SearchFilterSubscriptionList();
let languageSubscriptionList = new LanguageSubscriptionList();
let languageSubscriber = new LanguageSubscriber(languageSubscriptionList)



document.addEventListener(config.EVENT_SUBSCRIPTION, function () {
    articleList.clear();
    articleList.load();
});

/* When the document has finished loading,
 * bind all necessary listeners. */
$(document).ready(function () {
    starredArticleList.load();
    sourceSubscriptionList.load();
    sourceSubscriber.load();
    topicSubscriptionList.load();
    topicSubscriber.load();
    topicFilterSubscriptionList.load();
    topicFilterSubscriber.load();
    searchSubscriptionList.load();
    searchFilterSubscriptionList.load();
    languageSubscriptionList.load();
    languageSubscriber.load();

    let showAddLanguageDialog = document.querySelector('.show-language');
    $(showAddLanguageDialog).click(function () {
        languageSubscriber.open();
    });

    let showAddFeedDialogButton = document.querySelector('.show-source');
    $(showAddFeedDialogButton).click(function () {
        sourceSubscriber.open();
    });

    let showAddTopicDialogButton = document.querySelector('.show-sub');
    $(showAddTopicDialogButton).click(function () {
        topicSubscriber.open();
    });

    let showAddFilterDialogButton = document.querySelector('.show-filter');
    $(showAddFilterDialogButton).click(function () {
        topicFilterSubscriber.open();
    });

    let searchExecuted = document.querySelector('#search-expandable');
    $(searchExecuted).keyup(function(event) {
        if (event.keyCode === 13) {
            let input = $(searchExecuted).val();
            let layout = document.querySelector('.mdl-layout');
            layout.MaterialLayout.toggleDrawer();
            articleList.search(input);
        }
    });

    let searchSubscriptionButton = document.querySelector('.subscribe-search');
    $(searchSubscriptionButton).click(function () {
        // Subscribe to a search here.
        // Either subscribe to live input
        let input = $(searchExecuted).val();
        // Or subscribe to the last search.. and use lastSearch var.
        articleList.renderTemporary(input, 0);
        let layout = document.querySelector('.mdl-layout');
        layout.MaterialLayout.toggleDrawer();
        searchSubscriptionList.follow(input);

    });

    let searchFilterButton = document.querySelector('.filter-search');
    $(searchFilterButton).click(function () {
        // Subscribe to a search here.
        // Either subscribe to live input
        let input = $(searchExecuted).val();
        articleList.renderTemporary(input, 1);
        let layout = document.querySelector('.mdl-layout');
        layout.MaterialLayout.toggleDrawer();
        searchFilterSubscriptionList.follow(input);
        // Or subscribe to the last search.. and use lastSearch var.

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


