import $ from 'jquery';
import Mustache from 'mustache';
import config from '../config';
import ZeeguuRequests from '../zeeguuRequests';
import Cache from '../Cache';

const KEY_MAP_FEED_ARTICLE = "feed_article_map";

/**
 * Manages a list of article links, stores them in {@link Cache} if possible.
 */
export default class ArticleList {
    /**
     * Call zeeguu and get the articles for the given feed 'subscription'.
     * If the articles are already in {@link Cache}, load them instead.
     * Uses {@link ZeeguuRequests}.
     * @param {Object} subscription - The feed to retrieve articles from.
     */
    load(subscription) {
        if (Cache.has(KEY_MAP_FEED_ARTICLE) && Cache.retrieve(KEY_MAP_FEED_ARTICLE)[subscription.id]) {
            let articleLinks = Cache.retrieve(KEY_MAP_FEED_ARTICLE)[subscription.id];
            this._renderArticleLinks(subscription, articleLinks);
        } else {
            $(config.HTML_CLASS_LOADER).show();
            let callback = (articleLinks) => this._loadArticleLinks(subscription, articleLinks);
            ZeeguuRequests.get(config.GET_FEED_ITEMS + '/' + subscription.id, {}, callback);
        }
    };

    /**
     * Remove all articles from the list, clears the cached articles.
     */
    clear() {
        $(config.HTML_ID_ARTICLELINK_LIST).empty();
        Cache.remove(KEY_MAP_FEED_ARTICLE);
    };

    /**
     * Remove all articles from the list associated with the given feed.
     * @param {string} feedID - The identification code associated with the feed.
     */
    remove(feedID) {
        $('li[articleLinkFeedID="' + feedID + '"]').remove();
        if (Cache.has(KEY_MAP_FEED_ARTICLE)) {
            Cache.retrieve(KEY_MAP_FEED_ARTICLE)[feedID] = undefined;
        }
    };

    /**
     * Store all the article links from a particular feed if possible, makes sure they are rendered.
     * Callback function for the zeeguu request.
     * @param {Object} subscription - The feed the articles are from.
     * @param {Object[]} articleLinks - List containing the articles for the feed.
     */
    _loadArticleLinks(subscription, articleLinks) {
        this._renderArticleLinks(subscription, articleLinks);
        $(config.HTML_CLASS_LOADER).fadeOut('slow');

        // Cache the article links.
        let feedMap = {};
        if (Cache.has(KEY_MAP_FEED_ARTICLE))
            feedMap = Cache.retrieve(KEY_MAP_FEED_ARTICLE);
        feedMap[subscription.id] = articleLinks;
        Cache.store(KEY_MAP_FEED_ARTICLE, feedMap);
    }

    /**
     * Generate all the article links from a particular feed.
     * @param {Object} subscription - The feed the articles are from.
     * @param {Object[]} articleLinks - List containing the articles for the feed.
     */
    _renderArticleLinks(subscription, articleLinks) {
        let template = $(config.HTML_ID_ARTICLELINK_TEMPLATE).html();
        for (let i = 0; i < articleLinks.length; i++) {
            let articleLink = articleLinks[i];
            let templateAttributes = {
                articleLinkTitle: articleLink.title,
                articleLinkURL: articleLink.url,
                articleLinkFeedID: subscription.id,
                articleLinkLanguage: subscription.language,
                articleDifficultyDiscrete: articleLink.metrics.difficulty.discrete,
                articleDifficulty: Math.round(parseFloat(articleLink.metrics.difficulty.normalized) * 100) / 10,
                articleSummary: $('<p>' + articleLink.summary + '</p>').text(),
                articleIcon: subscription.image_url
            };
            $(config.HTML_ID_ARTICLELINK_LIST).append(Mustache.render(template, templateAttributes));
        }
    }
};
