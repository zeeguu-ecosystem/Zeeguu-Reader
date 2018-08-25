import os

ZEEGUU_API = os.environ.get('ZEEGUU_API') or 'http://localhost:9001'
print(" == UMR running with API: " + ZEEGUU_API)

ZEEGUU_WEB = os.environ.get('ZEEGUU_WEB') or 'http://localhost:9000'
ZEEGUU_LOGIN = ZEEGUU_WEB + "/login"
