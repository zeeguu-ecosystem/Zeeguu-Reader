// Launch request to Zeeguu API.
function requestZeeguuGET(endpoint, requestData, responseHandler)
{
  $.get(
    ZEEGUU_SERVER + endpoint,
    requestData,
    responseHandler
  );
}

// Launch request to Zeeguu API.
function requestZeeguuPOST(endpoint, requestData, responseHandler)
{
  $.post(
    ZEEGUU_SERVER + endpoint + "?session=" + SESSION_ID,
    requestData,
    responseHandler
  );
}
