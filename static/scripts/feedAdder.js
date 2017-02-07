/* Script that allows the user to add a new feed to their feed list using
 * a HTML dialog window. */
var dialog = document.querySelector('dialog');
var showModalButton = document.querySelector('.show-modal');
if (! dialog.showModal) {
  dialogPolyfill.registerDialog(dialog);
}
showModalButton.addEventListener('click', function() {
  requestZeeguuGET(RECCOMENDED_FEED_ENDPOINT, {session : SESSION_ID}, loadFeedOptions)
  dialog.showModal();
});
dialog.querySelector('.close').addEventListener('click', function() {
  dialog.close();
});

function loadFeedOptions(data) {
  var template = $("#feedAddable-template").html();
  for (var i=0; i < data.length; i++) {
    var addableData = {
      addableTitle: data[i]['title'],
      addableID: data[i]['id'],
      addableImage : data[i]['image_url']
    }
    $("#addableFeedList").append(Mustache.render(template, addableData));
  }
}

// Launch request to Zeeguu API.
function requestZeeguuGET(endpoint, requestData, responseHandler)
{
  $.get(
    ZEEGUU_SERVER + endpoint,
    requestData,
    responseHandler
  );
}

function noAvatar(image) {
    image.src = noAvatarURL;
}
