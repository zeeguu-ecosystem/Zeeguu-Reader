import $ from 'jquery';
import Mustache from 'mustache';
import config from '../config';
import ZeeguuRequests from '../zeeguuRequests';
import {GET_STARRED_ARTICLES} from '../zeeguuRequests';
import {POST_UNSTAR_ARTICLE} from '../zeeguuRequests';


const HTML_ID_EMPTY_STARRED_ARTICLE_LIST = '#emptyStarredArticleListImage';
const HTML_ID_STARRED_ARTICLE_LIST = '#starredArticleList';
const HTML_ID_STARRED_ARTICLELINK_TEMPLATE = '#starred-articleLink-template';
const HTML_CLASS_CLEAR = '.clear';

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
        if (articleLinks.length === 0) {
            $(HTML_ID_EMPTY_STARRED_ARTICLE_LIST).show();
            return;
        }
        $(HTML_ID_EMPTY_STARRED_ARTICLE_LIST).hide();

        let template = $(HTML_ID_STARRED_ARTICLELINK_TEMPLATE).html();
        for (let i = 0; i < articleLinks.length; i++) {
            let articleLink = articleLinks[i];
            let templateAttributes = {
                articleLinkTitle: articleLink.title,
                articleLinkLanguage: articleLink.language,
                articleLinkURL: articleLink.url
            };
            let element = Mustache.render(template, templateAttributes);

            $(HTML_ID_STARRED_ARTICLE_LIST).append(element);
        }

        $(HTML_CLASS_CLEAR).on('click', function () {
            ZeeguuRequests.post(POST_UNSTAR_ARTICLE, {url: this.dataset.href});
            $(this).parent().parent().fadeOut(200, function () {
                let remaining = ($(this).siblings(config.HTML_CLASS_ARTICLELINK_ENTRY)).length;
                if (remaining === 0)
                    $(HTML_ID_EMPTY_STARRED_ARTICLE_LIST).show();
                $(this).remove();
            });
        });

        $(config.HTML_CLASS_ARTICLELINK_FADEOUT).one('click', function (event) {
            if (!event.isPropagationStopped()) {
                event.stopPropagation();

                // Animate the click on an article.
                $(this).parent().parent().siblings().animate({
                    opacity: 0.25,
                }, 200, function () {
                    // Animation complete.
                    $(config.HTML_CLASS_PAGECONTENT).fadeOut();
                });
            }
        });
    }
}
