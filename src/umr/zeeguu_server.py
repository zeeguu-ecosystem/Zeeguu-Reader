import os

ZEEGUU_API = os.environ.get('ZEEGUU_API') or 'http://localhost:9001'
print(" == UMR running with API: " + ZEEGUU_API)

# there is not need for a full url since currently the reader
# blueprint is part of the web now
# ZEEGUU_WEB = os.environ.get('ZEEGUU_WEB') or 'http://localhost:9000'
ZEEGUU_LOGIN = "/login"
