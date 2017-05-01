import os
from flask import Flask, send_from_directory
from login import endpoints_login
from article import endpoints_article
from articles import endpoints_articles

app = Flask(__name__)
app.register_blueprint(endpoints_login)
app.register_blueprint(endpoints_article)
app.register_blueprint(endpoints_articles)


@app.route('/favicon.ico')
def get_favicon():
    """Return the favicon icon."""
    return send_from_directory(os.path.join(app.root_path, 'static'), 'images/favicon.ico')


if __name__ == "__main__":
    """ Launch our flask server. """
    app.run(debug=True, host="0.0.0.0", port=8800)