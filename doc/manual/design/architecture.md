# Architectural Design
The development of the Universal Multilingual Reader started off with the following design goals in mind:

- Aim for a clear separation of concerns in order to improve modularity of the system.
- Comprehensibility of the code.
- Compatability amoung most modern web browsers and platforms.
- Fault tolerance.
- Responsiveness.
- The implementation should strive for efficiency and avoid redundancy.

In the following sections, we will present how we tried to follow these goals.

## Making modules
[Ecmascript](https://en.wikipedia.org/wiki/ECMAScript) 2015 (ES2015) introduced a significant addition to the syntax that Javascript implements, among which, most important to us, are *modules*. However, current browser support for ES2015 is low: we do not have the luxury of only developing for the possible future where compatability might increase. To resolve this issue, transpilers like [Babel](https://babeljs.io/) exist: a program that converts next generation Javascript into current day, ubiquitously compatible, Javascript. 

[Webpack](https://webpack.js.org/) builds on top of Babel, which allows you to generate a single (neatly minified) backwards compatible file for each entrypoint and the css files used by it. Using Webpack we write all our code in the readable and modular ES2016 definition, define a `main.js` for every package as an entry point, and then transpile it into four single files (2 JavaScript, 2 CSS). These minified files can be included into our HTML documents, which allows the browser to invoke those files and allow them to perform their tasks.

- `subscription.entry.MAJOR.MINOR.PATCH.js`
- `subscription.MAJOR.MINOR.PATCH.css`
- `translation.entry.MAJOR.MINOR.PATCH.js`
- `translation.MAJOR.MINOR.PATCH.css`

[Semantic versioning](http://semver.org/) is applied to the naming of these files in order to prevent caching of outdated versions. This version is defined in the `package.json` configuration file.

## Design overview
Using these tools, we will were able to define our system as follows:

![Overview Diagram](asset/overview.png)

The Flask blueprint defines two endpoints that are accessible if the session key is stored in a cookie. If this session is not found, the server redirects the user to the Zeeguu login page. 

The root endpoint delivers the articles.html page on a valid GET request. This page defines the structure of the articles listing and the subscription menu, while all the styles and functionality is implemented by the package file which it invokes and the CSS it includes. The subscription package makes use of the Cache class in order to store article listings locally, but Caching is not specific to this package.

The **/article** endpoint takes as its arguments the article that the user decides to read, processes the article, and then delivers it included with the article.html page on a valid GET request. This page defines all the structure of the article listing, while all the styles and functionality (like tap-and-translate) are implemented by the package file which it invokes and the CSS it includes. 

Both packages share a need to contact the Zeeguu API upon specific data requests. Thus the functionality that provides the system with that ability, has been abstracted into a common class: `ZeeguuRequests`. The `Notifier` class (used to notify users of special circumstances) and the `UserActivityLogger` (used to log user activities on the Zeeguu server) are shared for similar reasons.

## In more detail
### Subscription
![Subscription UML](asset/subscription.png)

The subscription package allows for modifying the user's feeds and listing the available or starred articles for the feeds the user is currently subscribed. The **LanguageMenu** class retrieves the available languages and requests FeedSubscriber  to update the list of available subscriptions whenever a particular language is selected. **FeedSubscriber** thus retrieves feed options and allows for subscribing to those feeds. Subscribing to a feed notifies SubscriptionList. **SubscriptionList** manages the list of all currently subscribed-to feeds and allows for removing a feed from that list. It uses the **Notifier** in order to inform the user of subscription problems (such as a failure to subscribe). A change to this class calls for a change to the ArticleList. This happens by firing an Event that ArticleList listenes to, with the changed data appended to the detail attribute of the Event. **ArticleList** manages a list of all possible articles to read, and uses the **Cache** class to do this efficiently. When there are no feeds to render article links for, it calls for the NoFeedTour object to `show`. The **NoFeedTour** class allows for showing a webpage styling that motivates the user to subscribe to more feeds. Finally, the **StarredArticleList** retrieves the list of starred articles when requested to load and then renders this content into the list of starred articles. Many classes make use of the static **ZeeguuRequests** and **UserActivityLogger** class, but in order to improve readability of the diagram it has not been included.

### Translation
![Translation UML](asset/translation.png)

The translation package allows for translating context that is wrapped with the custom html tags ('zeeguu'). The translation is the result of **Translator** interfacing with the Zeeguu API via the **ZeeguuRequests**. The **AlterMenu** serves as a display for the available alternative translations from a request. It has the functionality to update the currently set (visible) translation. Moreover, it gives the user the possibility to suggest his own version of translation. The context, subject for translation, is also available for text to speech functionality. This is achieved with the **Speaker** class, which contains uses an utterance object, for which parameters such as language and text are supplied upon text to speech request. The **UndoStack** provides undo functionality to the reading page, reflected onto the translated words. It is used to save the state of the content page and the changes made to it onto a stack, from which the previous state can then be retrieved and set up.

### ZeeguuRequests
![Subscription UML](asset/ZeeguuRequests.png)

The ZeeguuRequest class hides how we communicate with Zeeguu and gives both POST and GET endpoints to communicate with. Communication is handled asynchronously to force responsiveness of the application. Thus, server reply messages need to be handled by a callback method that you supply yourselves.

## UserActivityLogger
![UserActivityLogger UML](asset/UserActivityLogger.png)

Zeeguu provides an endpoint to log events along with their associated data. To ensure proper logging, the UserActitivtyLogger further abstracts this endpoint into a method call of the name `log`. The provided name given to an event is automatically prefixed with "UMR - ", in order to distinquish our logs from other services logging their activities.

### Cache
![Subscription UML](asset/Cache.png)

The Cache class abstracts the implementation of storing user data locally. It allows us, if supported by the browser, to not be forced in querying zeeguu about identical data we requested shortly before. This increases responsiveness of the application whilst decreasing server workload.

### Notifier
![Notifier UML](asset/Notifier.png)

The Notifier class relies on the precense of a MDL document element that is capable of showing small pop-up messages at the bottom of the screen. It will ignore notification requests when they are identical to the currently displayed message, in order to reduce spamming the user with redundant information.