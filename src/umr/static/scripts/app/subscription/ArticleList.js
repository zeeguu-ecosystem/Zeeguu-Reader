import $ from 'jquery';
import Mustache from 'mustache';
import config from '../config';
import Cache from '../Cache';
import Notifier from '../Notifier';
import moment from 'moment';
import NoFeedTour from './NoFeedTour';
import {difficultyToColorMapping} from './DifficultyColors'
import UserActivityLogger from '../UserActivityLogger';
import 'loggly-jslogger';
import ZeeguuRequests from '../zeeguuRequests';
import {GET_RECOMMENDED_ARTICLES} from '../zeeguuRequests';
import {SEARCH_ENDPOINT} from '../zeeguuRequests';
import {FILTER_RENDER} from '../zeeguuRequests';
import {SEARCH_RENDER} from '../zeeguuRequests';

const KEY_MAP_FEED_ARTICLE = 'feed_article_map';
const EVENT_ARTICLES_REQUESTED = 'ARTICLES REQUESTED FROM ZEEGUU';
const HTML_ID_ARTICLE_LINK_LIST = '#articleLinkList';
const HTML_ID_ARTICLE_LINK_TEMPLATE = '#articleLink-template';
const ALREADY_OPENED_ARTICLE_CLASS = "alreadyOpenedArticle";

/* Setup remote logging. */
let logger = new LogglyTracker();
logger.push({
    'logglyKey': config.LOGGLY_TOKEN,
    'sendConsoleErrors': true,
    'tag': 'ArticleList'
});

/**
 * Manages a list of article links, stores them in {@link Cache} if possible.
 */
export default class ArticleList {
    /**
     * Initialise a {@link NoFeedTour} object.
     */
    constructor() {
        this.noFeedTour = new NoFeedTour();
        this.articlesOnPage = 21;
    }

    /**
     * Call zeeguu and get the articles for the given feed 'subscription'.
     * If the articles are already in {@link Cache}, load them instead.
     * Uses {@link ZeeguuRequests}.
     * @param {Map} subscriptions - The feeds to retrieve articles from.
     */
    load() {
        //let subscription_combo_hash = Array.from(subscriptions.keys()).join(".")

        // Feb 25: Disabled Cache. Server usually responds within a second
        // and this way, we can sync the info about articles being starred / liked
        // between the reader and the browser.
        // Otherwise the cache would not be updated with the new state of
        // the article having been starred unstarred liked / unliked / opened ... etc.
        // A more advanced cache invalidation policty could only retrieve the
        // new info from the article that was just opened... or maybe update the
        // cache from the reader... but currently that's not easy because the
        // two javascript scripts live in two different pages.

        // if (Cache.has(KEY_MAP_FEED_ARTICLE) && Cache.retrieve(KEY_MAP_FEED_ARTICLE)[subscription_combo_hash]) {
        //     let articleLinks = Cache.retrieve(KEY_MAP_FEED_ARTICLE)[subscription_combo_hash];
        //     this._renderArticleLinks(articleLinks);
        //     UserActivityLogger.log(EVENT_ARTICLES_CACHED, subscription_combo_hash);
        // } else {
        $(config.HTML_CLASS_LOADER).show();
        //let callback = (articleLinks) => this._loadArticleLinks(articleLinks, subscription_combo_hash);
        let callback = (articleLinks) => this._renderArticleLinks(articleLinks);
        ZeeguuRequests.get(GET_RECOMMENDED_ARTICLES + '/' + this.articlesOnPage, {}, callback);
        UserActivityLogger.log(EVENT_ARTICLES_REQUESTED, this.articlesOnPage);
        // }
    }

    search(search) {
        if (search && 0 !== search.length) {
            this.clear();
            $(config.HTML_CLASS_LOADER).show();
            let callback = (articleLinks) => this._renderArticleLinks(articleLinks);
            ZeeguuRequests.get(SEARCH_ENDPOINT + '/' + search, {}, callback);
            UserActivityLogger.log(EVENT_ARTICLES_REQUESTED, this.articlesOnPage);
        }
    }

    /**
     * Remove all articles from the list.
     */
    clear() {
        $(HTML_ID_ARTICLE_LINK_LIST).empty();
    }

    /**
     * Shows the loader
     */
    showLoader() {
        $(config.HTML_CLASS_LOADER).show();
    }

    /**
     * Remove all articles from the list associated with the given feed.
     * @param {string} feedID - The identification code associated with the feed.
     */
    remove(feedID) {
        $('li[articleLinkFeedID="' + feedID + '"]').remove();
    }

    /**
     * Store all the article links from a particular feed if possible, makes sure they are rendered.
     * Callback function for the zeeguu request.
     * @param {Object} subscription - The feed the articles are from.
     * @param {Object[]} articleLinks - List containing the articles for the feed.
     */
    _loadArticleLinks(articleLinks, subscription_combo_hash) {
        this._renderArticleLinks(articleLinks);
        $(config.HTML_CLASS_LOADER).fadeOut('slow');

        // Cache the article links.
        let feedMap = {};
        if (Cache.has(KEY_MAP_FEED_ARTICLE))
            feedMap = Cache.retrieve(KEY_MAP_FEED_ARTICLE);
        feedMap[subscription_combo_hash] = articleLinks;
        Cache.store(KEY_MAP_FEED_ARTICLE, feedMap);
    }


    /**
     * Generate all the article links from a particular feed.
     * @param {Object[]} articleLinks - List containing the articles for the feed.
     */
    _renderArticleLinks(articleLinks) {
        $(config.HTML_CLASS_LOADER).fadeOut('slow');
        // If there are no articles in the list, show the noFeedTour
        if (articleLinks.length < 1) {
            Notifier.notify("Couldn't find any articles for your selection!");
            this.noFeedTour.show();
            return;
        } else
            this.noFeedTour.hide();

        let template = $(HTML_ID_ARTICLE_LINK_TEMPLATE).html();
        for (let i = 0; i < articleLinks.length; i++) {
            let articleLink = articleLinks[i];
            var publishedString = moment.utc(articleLink.published).fromNow();
            let difficulty = Math.round(parseFloat(articleLink.metrics.difficulty) * 100) / 10;
            let topicsText = articleLink.topics.trim().replace(/(^|\s+)/g, "$1#");
            if (topicsText == "#") topicsText = "";

            // In case we don't have an articleLink url let's point to a fancy letter
            // that matches the initials of the author

            var articleIconURL;

            if (articleLink.icon_name) {
                articleIconURL = "/read/static/images/news-icons/" + articleLink.icon_name;
            } else {
                let authorsInitial = articleLink.authors[0].toLowerCase();
                articleIconURL = "https://img.icons8.com/dusk/2x/" + authorsInitial + ".png";
            }

            let templateAttributes = {
                articleLinkID: articleLink.id,
                articleLinkPublished: publishedString,
                articleLinkTitle: articleLink.title,
                articleLinkURL: articleLink.url,
                articleLinkFeedID: articleLink.feedId,
                articleLinkLanguage: articleLink.language,
                articleDifficulty: difficulty,
                articleDifficultyColor: difficultyToColorMapping(difficulty),
                articleSummary: $('<p>' + articleLink.summary + '</p>').text(),
                articleIcon: articleIconURL,
                articleTopics: topicsText,
                wordCount: articleLink.metrics.word_count,
                alreadyOpenedClass: articleLink.opened ? ALREADY_OPENED_ARTICLE_CLASS : ""
            };

            let element = Mustache.render(template, templateAttributes);

            $(HTML_ID_ARTICLE_LINK_LIST).append(element);
        }

        $(config.HTML_CLASS_ARTICLELINK_FADEOUT).one('click', function (event) {
            if (!event.isPropagationStopped()) {
                event.stopPropagation();

                // Animate the click on an article.
                $(this).siblings().animate({
                    opacity: 0.25,
                }, 200, function () {
                    // Animation complete.
                    $(config.HTML_CLASS_PAGECONTENT).fadeOut();
                });
            }
        });
    }
}

