import os
from flask import Flask, send_from_directory
from umr.login import endpoints_login
from umr import umrblue

app = Flask(__name__)
app.register_blueprint(endpoints_login)
app.register_blueprint(umrblue)


@app.route('/favicon.ico')
def get_favicon():
    """Return the favicon icon."""
    return send_from_directory(os.path.join(app.root_path, 'static'), 'images/favicon.ico')


if __name__ == "__main__":
    """ Launch our flask server. """
    app.run(host="0.0.0.0", debug=True)
