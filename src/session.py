import functools
import flask
from flask import request


def with_session(view):
    """
    Decorator checks whether a session is available either in
     - as a cookie
     - as a GET or POST parameter
    If it is, it sets the sessionID field on the request object
    which can be used within the decorated functions.

    In case of no session, user is redirected to login form.
    """

    @functools.wraps(view)
    def wrapped_view(*args, **kwargs):

        request.sessionID = None

        if request.args.get('sessionID', None):
            request.sessionID = int(request.args['sessionID'])
        elif 'sessionID' in request.cookies:
            request.sessionID = request.cookies.get('sessionID')
        elif request.form.get('sessionID', None):
            request.sessionID = request.form['sessionID']
        else:
            flask.abort(401)

        return view(*args, **kwargs)

    return wrapped_view