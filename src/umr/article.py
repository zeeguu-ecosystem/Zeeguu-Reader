from flask import request, render_template
from .session import with_session
from .umr_blueprint import reader_blueprint
import urllib
from .zeeguu_server import ZEEGUU_API
import requests
import json


@reader_blueprint.route('/article', methods=['GET'])
@with_session
def get_article():
    """

        Retrieve the supplied article link of the supplied language,
        and return a properly processed version of the article.

        can be called either with articleURL or articleID

    """

    article_id = request.args.get('articleID', None)

    if article_id:
        return render_template('article.html', article_id=article_id)

    else:

        article_url = request.args.get('articleURL', None)

        encoded_url = urllib.parse.quote_plus(article_url)
        request_url = ZEEGUU_API + "/article_id?url=" + encoded_url + "&session=" + request.sessionID

        result = requests.get(request_url)

        article_id = json.loads(result.content)['article_id']

        return render_template('article.html', article_id=article_id)
