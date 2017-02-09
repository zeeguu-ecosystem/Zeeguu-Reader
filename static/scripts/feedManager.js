/* Script that allows the user to add a new feed to their feed list using
 * a HTML dialog window, or remove a feed from their subscribed feed list. */
 $(document).ready(function() {
  var dialog = document.querySelector('dialog');
  var showModalButton = document.querySelector('.show-modal');

  // Some browsers do not support dialog, for that we use Polyfill.
  if (! dialog.showModal)
    dialogPolyfill.registerDialog(dialog);

  // Open and closing of the dialog is handled here.
  showModalButton.addEventListener('click', function()
  {
    requestZeeguuGET(RECCOMENDED_FEED_ENDPOINT, {session : SESSION_ID}, loadFeedOptions)
    dialog.showModal();
  });
  dialog.querySelector('.close').addEventListener('click', function()
  {
    dialog.close();
  });
});

/* Fills the dialog's list with all the addable feeds. */
function loadFeedOptions(data)
{
  $("#addableFeedList").empty();
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

/* Called when an addable feed has been clicked,
 * this function will try to add the feed to the user's list. */
function followFeed(addableID)
{
 requestZeeguuPOST(FOLLOW_FEED_ENDPOINT, {feed_id : addableID}, _.partial(onFeedHandled, 51));
}

function unfollowFeed(removableID)
{
  requestZeeguuGET(UNFOLLOW_FEED_ENDPOINT+"/"+removableID, {session : SESSION_ID}, _.partial(onFeedHandled, 51));
}

function onFeedHandled(id, data) {
 console.log(id);
 console.log(data);
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

// Launch request to Zeeguu API.
function requestZeeguuPOST(endpoint, requestData, responseHandler)
{
  $.post(
    ZEEGUU_SERVER + endpoint + "?session=" + SESSION_ID,
    requestData,
    responseHandler
  );
}

// Called when no image could be loaded as an article avatar.
function noAvatar(image)
{
    image.src = noAvatarURL;
}
