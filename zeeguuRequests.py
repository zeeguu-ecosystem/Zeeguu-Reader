import requests
ZEEGUU_SERVER = "https://www.zeeguu.unibe.ch"
STATUS_WRONGUSER  = 401; STATUS_WRONGPASS = 400; STATUS_ACCEPT = 200;

# Requests the followed feeds from zeeguu.
def requestZeeguuGet(endpoint, sessionID, items = []):
    url = ZEEGUU_SERVER+'/' + endpoint + '?session=' + sessionID
    for item in items:
        url += '&' + item[0] + '=' + item[1]
    result = requests.get(url)
    content = None;
    if (result.status_code != STATUS_ACCEPT):
        print('Request endpoint ' + endpoint + ' error:'+result.status_code);
    else:
	content = result.content
    return content
