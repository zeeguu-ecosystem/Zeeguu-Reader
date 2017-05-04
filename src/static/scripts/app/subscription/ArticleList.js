import $ from 'jquery';
import Mustache from 'mustache';
import config from '../config';
import ZeeguuRequests from '../zeeguuRequests';

/**
 * Manages a list of articles that can be viewed.
 */
export default class ArticleList {
    /* Call zeeguu and get the articles for the given feed 'subscription'. */
    load(subscription) {
        $(config.HTML_CLASS_LOADER).show();
        var callback = (data) => this._loadArticleLinks(subscription, data);
        ZeeguuRequests.get(config.GET_FEED_ITEMS + '/' + subscription['subscriptionID'], {}, callback);
    };

    clear() {
        $(config.HTML_ID_ARTICLELINK_LIST).empty();
    };

    /* Remove all articles from the list with 'feedID'. */
    remove(feedID) {
        $('li[articleLinkFeedID="' + feedID + '"]').remove();
    };

    /* Callback function from the zeeguu request.
     * Generates all the article links from a particular feed. */
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
