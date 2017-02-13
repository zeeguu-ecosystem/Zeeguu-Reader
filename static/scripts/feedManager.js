/* Script that allows the user to add a new feed to their feed list using
 * a HTML dialog window, or remove a feed from their subscribed feed list. */
 $(document).ready(function() {
  // Load the subscribed feeds.
  requestZeeguuGET(GET_FEEDS_BEING_FOLLOWED, {session : SESSION_ID}, loadSubscriptions);

  var dialog = document.querySelector('dialog');
  var showModalButton = document.querySelector('.show-modal');

  // Some browsers do not support dialog, for that we use Polyfill.
  if (! dialog.showModal)
    dialogPolyfill.registerDialog(dialog);

  // Open and closing of the dialog is handled here.
  showModalButton.addEventListener('click', function()
  {
    requestZeeguuGET(RECCOMENDED_FEED_ENDPOINT, {session : SESSION_ID}, loadFeedOptions);
    dialog.showModal();
  });
  dialog.querySelector('.close').addEventListener('click', function()
  {
    dialog.close();
  });
});

/* Fills the subscription list with all the subscribed feeds. */
function loadSubscriptions(data)
{
  $("#subscriptionList").empty();
  var template = $("#subscription-template").html();
  for (var i=0; i < data.length; i++) {
    var subscriptionData = {
      subscriptionTitle: data[i]['title'],
      subscriptionID: data[i]['id'],
    }
    $("#subscriptionList").append(Mustache.render(template, subscriptionData));
  }
}

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
function followFeed(addable)
{
 var addableID = $(addable).attr('addableID');
 requestZeeguuPOST(FOLLOW_FEED_ENDPOINT, {feed_id : addableID}, _.partial(onFeedFollowed, addable));
}

function unfollowFeed(removable)
{
  var removableID = $(removable).attr('removableID');
  requestZeeguuGET(UNFOLLOW_FEED_ENDPOINT+"/"+removableID, {session : SESSION_ID}, _.partial(onFeedUnfollowed, removable));
}

function onFeedFollowed(feed, data)
{
  if (data == "OK") {
    // Refresh the feed list.
    requestZeeguuGET(GET_FEEDS_BEING_FOLLOWED, {session : SESSION_ID}, loadSubscriptions);
    onFeedHandled(feed);
  }
}

function onFeedUnfollowed(feed, data)
{
  if (data == "OK") {
    onFeedHandled(feed);
  }
}

function onFeedHandled(feed)
{
   $(feed).fadeOut();
}

// Called when no image could be loaded as an article avatar.
function noAvatar(image)
{
    image.src = noAvatarURL;
}
