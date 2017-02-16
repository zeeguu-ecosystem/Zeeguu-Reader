/* Script that allows the user to add a new feed to their feed list using
 * a HTML dialog window, or remove a feed from their subscribed feed list. */
 var lastSearchedLanguage = 'nl';
 
 $(document).ready(function() {
  // Load the subscribed feeds.
  requestZeeguuGET(GET_FEEDS_BEING_FOLLOWED, {session : SESSION_ID}, loadSubscriptions);
  
  // Load the available languages for the dialog.
  requestZeeguuGET(GET_AVAILABLE_LANGUAGES, {}, loadLanguageOptions);

  var dialog = document.querySelector('dialog');
  var showModalButton = document.querySelector('.show-modal');

  // Some browsers do not support dialog, for that we use Polyfill.
  if (! dialog.showModal)
    dialogPolyfill.registerDialog(dialog);

  // Open and closing of the dialog is handled here.
  showModalButton.addEventListener('click', function()
  {
    getFeedOptionsForLanguage(lastSearchedLanguage);
    dialog.showModal();
  });
  dialog.querySelector('.close').addEventListener('click', function()
  {
    dialog.close();
  });
});

/* Fills the subscription list with all the subscribed feeds,
 * and makes a call to load the feed's associated articles. */
function loadSubscriptions(data)
{
  $("#subscriptionList").empty();
  $("#articleLinkList").empty();
  var template = $("#subscription-template").html();
  for (var i=0; i < data.length; i++) {
    var subscriptionData = {
      subscriptionTitle: data[i]['title'],
      subscriptionID: data[i]['id'],
      subscriptionLanguage: data[i]['language']
    }
    $("#subscriptionList").append(Mustache.render(template, subscriptionData));
    requestZeeguuGET(GET_FEED_ITEMS + '/' + subscriptionData['subscriptionID'],
                    {session : SESSION_ID}, _.partial(loadArticleLinks, subscriptionData));
  }
}

/* Loads all the article links from a particular feed. */
function loadArticleLinks(subscriptionData, data)
{
  var template = $("#articleLink-template").html();
  for (var i=0; i < data.length; i++) {
    var articleLinkData = {
      articleLinkTitle: data[i]['title'],
      articleLinkURL : data[i]['url'],
      articleLinkFeedID : subscriptionData['subscriptionID'],
      articleLinkLanguage : subscriptionData['subscriptionLanguage']
    }
    $("#articleLinkList").append(Mustache.render(template, articleLinkData));
  }
}

/* Loads all the available language options as buttons in the dialog. */
function loadLanguageOptions(data)
{
  var options = JSON.parse(data);
  var template = $("#languageOption-template").html();
  options.sort();
  for (i=0; i<options.length; ++i)
  {
    var languageOptionData = {
      languageOptionCode: options[i]
    }
    $("#languageOptionList").append(Mustache.render(template, languageOptionData));
  }
}

/* Requests Zeeguu for addable feeds of a certain provided language. */
function getFeedOptionsForLanguage(languageOptionCode)
{
  requestZeeguuGET(RECCOMENDED_FEED_ENDPOINT+'/'+languageOptionCode, 
                   {session : SESSION_ID}, loadFeedOptions);
  lastSearchedLanguage = languageOptionCode;
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
    var removableID = $(feed).attr('removableID')
    $('li[articleLinkFeedID="' + removableID + '"]').remove();
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
