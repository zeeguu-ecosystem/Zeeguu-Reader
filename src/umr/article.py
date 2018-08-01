from flask import request, render_template
from .session import with_session
from .umr_blueprint import umrblue
import urllib
from .zeeguu_server import ZEEGUU_API
import requests
import json

WORD_TAG = "zeeguu"


@umrblue.route('/article', methods=['GET'])
@with_session
def get_article():
    """

        Retrieve the supplied article link of the supplied language,
        and return a properly processed version of the article.

    """

    article_url = request.args['articleURL']
    print(article_url)

    encoded_url = urllib.parse.quote_plus(article_url)
    request_url = ZEEGUU_API + "/article_id?url=" + encoded_url + "&session=" + request.sessionID
    print(request_url)
    result = requests.get(request_url)
    print(result)
    print(result.content)
    article_id = json.loads(result.content)['article_id']
    print(f"====== got article_id: {article_id}")

    return render_template('article.html', article_id=article_id)
