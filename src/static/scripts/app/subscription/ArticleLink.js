/**
 * Stores one specific article's relevant data. See {@link ArticleList}.
 */
export default class ArticleLink {
    /**
     * Define the article this object refers to.
     * @param {string} title - Title of the article.
     * @param {string} url - URL of where the article can be found.
     * @param {string} language - Language code of the article.
     * @param {Number} difficulty - Float value encoding the difficulty of the article for to the user.
     * @param {string} difficultyDiscrete - More general difficulty measure.
     * @param {string} summary - Short description of the article.
     * @param {string} icon - Icon url for the feed.
     */
    constructor(title, url, language, difficulty, difficultyDiscrete, summary, icon) {
        this.title = title;
        this.url = url;
        this.language = language;
        this.difficulty = difficulty;
        this.difficultyDiscrete = difficultyDiscrete;
        this.summary = summary;
        this.icon = icon;
    }
}