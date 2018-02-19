
import $ from 'jquery';
import Mustache from 'mustache';
import config from '../config';
import Cache from '../Cache';
import moment from 'moment';
import NoFeedTour from './NoFeedTour';
import UserActivityLogger from '../UserActivityLogger';
import 'loggly-jslogger';
import ZeeguuRequests from '../zeeguuRequests';
import {GET_RECOMMENDED_ARTICLES} from '../zeeguuRequests';

const KEY_MAP_FEED_ARTICLE = 'feed_article_map';
const USER_EVENT_CLICKED_ARTICLE = 'OPEN ARTICLE';
const EVENT_ARTICLES_CACHED = 'ARTICLES RETRIEVED FROM CACHE';
const EVENT_ARTICLES_REQUESTED = 'ARTICLES REQUESTED FROM ZEEGUU';
const HTML_ID_ARTICLE_LINK_LIST = '#articleLinkList';
const HTML_ID_ARTICLE_LINK_TEMPLATE = '#articleLink-template';

/* Setup remote logging. */
let logger = new LogglyTracker();
logger.push({
    'logglyKey': config.LOGGLY_TOKEN,
    'sendConsoleErrors' : true,
    'tag' : 'ArticleList'
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
        this.articlesOnPage = 42;
    }

    /**
     * Call zeeguu and get the articles for the given feed 'subscription'.
     * If the articles are already in {@link Cache}, load them instead.
     * Uses {@link ZeeguuRequests}.
     * @param {Map} subscriptions - The feeds to retrieve articles from.
     */
    load(subscriptions) {
        if (subscriptions.size < 1)
            this.noFeedTour.show();
        else
            this.noFeedTour.hide();

        let subscription_combo_hash = Array.from(subscriptions.keys()).join(".")

        if (Cache.has(KEY_MAP_FEED_ARTICLE) && Cache.retrieve(KEY_MAP_FEED_ARTICLE)[subscription_combo_hash]) {
            let articleLinks = Cache.retrieve(KEY_MAP_FEED_ARTICLE)[subscription_combo_hash];
            this._renderArticleLinks(articleLinks);
            UserActivityLogger.log(EVENT_ARTICLES_CACHED, subscription_combo_hash);
        } else {
            $(config.HTML_CLASS_LOADER).show();
            let callback = (articleLinks) => this._loadArticleLinks(articleLinks, subscription_combo_hash);
            ZeeguuRequests.get(GET_RECOMMENDED_ARTICLES + '/' + this.articlesOnPage, {}, callback);
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
     *
     * @param difficulty: double between 0 and 10
     * @returns {string} difficulty color code
     * @private
     */
    _difficultyToColorMapping(difficulty) {
        let colors = [
            "#009934",
            "#00BF41",
            "#00C207",
            "#33C600",
            "#aeca03",
            "#ceca44",
            "#f9f800",
            "#FFAC4C",
            "#D57300",
            "#cc3202",
            "#ed000d"
        ];
        return colors[Math.floor(difficulty)]

    }

    /**
     * Generate all the article links from a particular feed.
     * @param {Object} subscription - The feed the articles are from.
     * @param {Object[]} articleLinks - List containing the articles for the feed.
     */
    _renderArticleLinks(articleLinks) {

        let template = $(HTML_ID_ARTICLE_LINK_TEMPLATE).html();
        for (let i = 0; i < articleLinks.length; i++) {
            let articleLink = articleLinks[i];
            var publishedString = moment.utc(articleLink.published).fromNow();
            let difficulty = Math.round(parseFloat(articleLink.metrics.difficulty) * 100) / 10;
            let templateAttributes = {
                articleLinkTitle: articleLink.title,
                articleLinkPublished: publishedString,
                articleLinkURL: articleLink.url,
                articleLinkFeedID: articleLink.feedId,
                articleLinkLanguage: articleLink.language,
                articleDifficulty: difficulty,
                articleDifficultyColor: this._difficultyToColorMapping(difficulty),
                articleSummary: $('<p>' + articleLink.summary + '</p>').text(),
                articleIcon: articleLink.feed_image_url,
                wordCount: articleLink.metrics.word_count
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

                // Log that an article has been opened.
                let url = $(this).find('a')[0].href;
                let articleInfo = {};
                url.split('?')[1].split('&').forEach(function(part) {
                    let item = part.split("=");
                    articleInfo[item[0]] = decodeURIComponent(item[1]);
                });
                UserActivityLogger.log(USER_EVENT_CLICKED_ARTICLE, url, articleInfo);
            }
        });
    }
}

