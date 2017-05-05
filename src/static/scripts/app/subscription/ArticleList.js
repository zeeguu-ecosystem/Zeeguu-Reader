import $ from 'jquery';
import Mustache from 'mustache';
import config from '../config';
import ZeeguuRequests from '../zeeguuRequests';

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
        $(config.HTML_CLASS_LOADER).show();
        var callback = (data) => this._loadArticleLinks(subscription, data);
        ZeeguuRequests.get(config.GET_FEED_ITEMS + '/' + subscription.subscriptionID, {}, callback);
    };

    /**
     * Remove all articles from the list.
     */
    clear() {
        $(config.HTML_ID_ARTICLELINK_LIST).empty();
    };

    /**
     * Remove all articles from the list associated with the given feed.
     * @param {string} feedID - The identification code associated with the feed.
     */
    remove(feedID) {
        $('li[articleLinkFeedID="' + feedID + '"]').remove();
    };

    /**
     * Generate all the article links from a particular feed.
     * Callback function for the zeeguu request.
     * @param {Object} subscriptionData - The feed the articles are from.
     * @param {Object[]} data - List containing the articles for the feed.
     */
    _loadArticleLinks(subscriptionData, data) {
        var template = $(config.HTML_ID_ARTICLELINK_TEMPLATE).html();
        for (var i = 0; i < data.length; i++) {
            var difficulty = Math.round(parseFloat(data[i].metrics.difficulty.normalized) * 100) / 10;
            var articleLinkData = {
                articleLinkTitle: data[i].title,
                articleLinkURL: data[i].url,
                articleLinkFeedID: subscriptionData.subscriptionID,
                articleLinkLanguage: subscriptionData.subscriptionLanguage,
                articleDifficultyDiscrete: data[i].metrics.difficulty.discrete,
                articleDifficulty: difficulty,
                articleSummary: $('<p>' + data[i].summary + '</p>').text(),
                articleIcon: subscriptionData.subscriptionIcon
            };
            $(config.HTML_ID_ARTICLELINK_LIST).append(Mustache.render(template, articleLinkData));
        }
        $(config.HTML_CLASS_LOADER).fadeOut('slow');
    }
};
