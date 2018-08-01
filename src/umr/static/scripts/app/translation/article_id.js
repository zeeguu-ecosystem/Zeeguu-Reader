import $ from "jquery";
import config from "../config";

export function get_article_id() {

    let v = $(config.HTML_ID_ARTICLE_ID).text();
    console.log(v)
    return v;
}
