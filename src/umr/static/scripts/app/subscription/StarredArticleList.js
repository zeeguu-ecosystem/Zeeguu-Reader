import $ from 'jquery';
import Mustache from 'mustache';
import config from '../config';
import ZeeguuRequests from '../zeeguuRequests';

const GET_STARRED_ARTICLES = '/get_starred_articles';
const HTML_ID_STARRED_ARTICLE_LIST = '#starredArticleList';

/**
 * Retrieves and renders a list of starred articles.
 */
export default class StarredArticleList {
    /**
     * Make an asynchronous call using {@link ZeeguuRequests} to retrieve the starred articles.
     */
    load() {
        ZeeguuRequests.get(GET_STARRED_ARTICLES, {}, this._renderArticleLinks);
    }

    /**
     * Build a list of articles.
     * Shares code with the {@link ArticleList} class,
     * and thus its a bit smelly.
     * @param {Object[]} articleLinks - List containing articles.
     */
    _renderArticleLinks(articleLinks) {
        let template = $(config.HTML_ID_ARTICLELINK_TEMPLATE).html();
        for (let i = 0; i < articleLinks.length; i++) {
            let articleLink = articleLinks[i];
            let templateAttributes = {
                articleLinkTitle: articleLink.title,
                articleLinkLanguage: articleLink.language,
                articleLinkURL: articleLink.url,
                articleSummary: '',
                articleIcon: '/static/images/noAvatar.png'
            };
            let element = Mustache.render(template, templateAttributes);

            $(HTML_ID_STARRED_ARTICLE_LIST).append(element);
        }

        $(config.HTML_CLASS_ARTICLELINK).one('click', function (event) {
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
