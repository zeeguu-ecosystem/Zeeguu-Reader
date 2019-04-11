import $ from "jquery";
import Mustache from "mustache";
import config from "../config";
import moment from 'moment';
import {difficultyToColorMapping} from './DifficultyColors'
import UserActivityLogger from "../UserActivityLogger";
import ZeeguuRequests from "../zeeguuRequests";
import { GET_COHORT_ARTICLES } from "../zeeguuRequests";

const HTML_ID_EMPTY_COHORT_ARTICLE_LIST = "#emptyCohortArticleListImage";
const HTML_ID_COHORT_ARTICLE_LIST = "#cohortArticleList";
const HTML_ID_COHORT_ARTICLELINK_TEMPLATE = "#cohort-articleLink-template";
const HTML_CLASS_CLEAR = ".clear";
const USER_EVENT_CLICKED_ARTICLE = "OPEN COHORT ARTICLE";

/**
 * Retrieves and renders a list of cohort articles.
 */
export default class CohortArticleList {
  /**
   * Make an asynchronous call using {@link ZeeguuRequests} to retrieve the cohort articles.
   */
  load() {
    ZeeguuRequests.get(GET_COHORT_ARTICLES, {}, this._renderArticleLinks);
  }

  /**
   * Build a list of articles.
   * Shares code with the {@link ArticleList} class,
   * and thus its a bit smelly.
   * @param {Object[]} articleLinks - List containing articles.
   */
  _renderArticleLinks(articleLinks) {
    if (articleLinks.length === 0) {
      $(HTML_ID_EMPTY_COHORT_ARTICLE_LIST).show();
      return;
    }
    $(HTML_ID_EMPTY_COHORT_ARTICLE_LIST).hide();

    let template = $(HTML_ID_COHORT_ARTICLELINK_TEMPLATE).html();
    for (let i = articleLinks.length - 1; i >= 0; i--) {
      let articleLink = articleLinks[i];
      var publishedString = moment.utc(articleLink.published).fromNow();
      let difficulty = Math.round(parseFloat(articleLink.metrics.difficulty) * 100) / 10;
      let topicsText = articleLink.topics.trim().replace(/(^|\s+)/g, "$1#");
      if (topicsText == "#") topicsText = "";

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
        articleIcon: articleLink.feed_image_url,
        articleTopics: topicsText,
        wordCount: articleLink.metrics.word_count,
        alreadyOpenedClass: articleLink.opened?ALREADY_OPENED_ARTICLE_CLASS:""
    };

      let element = Mustache.render(template, templateAttributes);

      $(HTML_ID_COHORT_ARTICLE_LIST).append(element);
    }

    $(config.HTML_CLASS_ARTICLELINK_FADEOUT).one("click", function(event) {
      if (!event.isPropagationStopped()) {
        event.stopPropagation();

        // Animate the click on an article.
        $(this)
          .parent()
          .parent()
          .siblings()
          .animate(
            {
              opacity: 0.25
            },
            200,
            function() {
              // Animation complete.
              $(config.HTML_CLASS_PAGECONTENT).fadeOut();
            }
          );
        UserActivityLogger.log(USER_EVENT_CLICKED_ARTICLE);
      }
    });
  }
}
