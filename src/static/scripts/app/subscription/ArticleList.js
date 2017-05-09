import $ from 'jquery';
import Mustache from 'mustache';
import config from '../config';
import ZeeguuRequests from '../zeeguuRequests';
import ArticleLink from './ArticleLink';
import Cache from '../Cache';

const KEY_LINKS = "feeds";

/**
 * Manages a list of article links.
 */
export default class ArticleList {
    /**
     * Call zeeguu and get the articles for the given feed 'subscription'.
     * Uses {@link ZeeguuRequests}.
     * @param {Object} subscription - The feed to retrieve articles from.
     */
    load(subscription) {
        if (!Cache.has(KEY_LINKS) || !Cache.retrieve(KEY_LINKS)[subscription.subscriptionID]) {
            $(config.HTML_CLASS_LOADER).show();
            let callback = (data) => this._loadArticleLinks(subscription, data);
            ZeeguuRequests.get(config.GET_FEED_ITEMS + '/' + subscription.subscriptionID, {}, callback);
        } else {
            let articleLinks = Cache.retrieve(KEY_LINKS)[subscription.subscriptionID];
            this._renderArticleLinks(subscription.subscriptionID, articleLinks);
        }
    };

    /**
     * Remove all articles from the list.
     */
    clear() {
        $(config.HTML_ID_ARTICLELINK_LIST).empty();
        Cache.remove(KEY_LINKS);
    };

    /**
     * Remove all articles from the list associated with the given feed.
     * @param {string} feedID - The identification code associated with the feed.
     */
    remove(feedID) {
        $('li[articleLinkFeedID="' + feedID + '"]').remove();
        if (!Cache.has(KEY_LINKS)) {
            Cache.retrieve(KEY_LINKS)[feedID] = undefined;
        }
    };

    /**
     * Generate all the article links from a particular feed.
     * Callback function for the zeeguu request.
     * @param {Object} subscriptionData - The feed the articles are from.
     * @param {Object[]} data - List containing the articles for the feed.
     */
    _loadArticleLinks(subscriptionData, data) {
        let articleLinks = [];
        for (var i = 0; i < data.length; i++) {
            let article = data[i];
            let difficulty = Math.round(parseFloat(article.metrics.difficulty.normalized) * 100) / 10;
            articleLinks[i] = new ArticleLink(article.title, article.url, subscriptionData.subscriptionLanguage,
                                              difficulty, article.metrics.difficulty.discrete,
                                              $('<p>' + article.summary + '</p>').text(),
                                              subscriptionData.subscriptionIcon);
        }
        this._renderArticleLinks(subscriptionData.subscriptionID, articleLinks);
        $(config.HTML_CLASS_LOADER).fadeOut('slow');

        // Cache the article links.
        let feedMap = {};
        if (Cache.has(KEY_LINKS))
            feedMap = Cache.retrieve(KEY_LINKS);
        feedMap[subscriptionData.subscriptionID] = articleLinks;
        Cache.store(KEY_LINKS, feedMap);
    }

    _renderArticleLinks(feedID, articleLinks) {
        let template = $(config.HTML_ID_ARTICLELINK_TEMPLATE).html();
        for (var i = 0; i < articleLinks.length; i++) {
            let articleLink = articleLinks[i];
            let templateAttributes = {
                articleLinkFeedID: feedID,
                articleLinkTitle: articleLink.title,
                articleLinkURL: articleLink.url,
                articleLinkLanguage: articleLink.language,
                articleDifficultyDiscrete: articleLink.difficultyDiscrete,
                articleDifficulty: articleLink.difficulty,
                articleSummary: articleLink.summary,
                articleIcon: articleLink.icon
            };
            $(config.HTML_ID_ARTICLELINK_LIST).append(Mustache.render(template, templateAttributes));
        }
    }
};
