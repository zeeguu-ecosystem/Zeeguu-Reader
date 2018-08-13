import $ from "jquery";
import config from "../config";

export function get_article_id() {

    let id = $(config.HTML_ID_ARTICLE_ID).text();
    return id;
}
