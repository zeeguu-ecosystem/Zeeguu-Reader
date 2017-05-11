# Architectural Design
The development of the Universal Multilingual Reader started off with the following design goals in mind:

- Aim for a clear separation of concerns in order to improve modularity of the system.
- Comprehensability of code.
- Compatability amoung most modern web browsers and platforms.
- Fault tolerance.
- Responsiveness.
- The implementation should strive for efficiency and avoid redundancy.

In the following sections, we will show you how we tried to follow these goals.

## Making modules
[Ecmascript](https://en.wikipedia.org/wiki/ECMAScript) 2015 (ES2015) introduced a significant addition to the syntax Javascript implements, amoung which, most important to us, are *modules*. However, current browser support for ES2015 is low: we do not have the luxury of only deveoping for the possible future where compatability might increase. To resolve this issue, transpilers like [Babel](https://babeljs.io/) exist: a program that convert next generation Javascript into current day ubiquitously compatible Javascript. 

[Webpack](https://webpack.js.org/) builds on top of Babel, which allows you to enerate a single (neatly minified) backwards compatible file for each entrypoint. Using Webpack we write all our code in the readable and modular ES2016 definition, define a `main.js` for every package as an entry point, and then transpile it to two single files.  These  minified files can be included into our HTML documents, which can invoke the files to allow them to perform their tasks.

- `subscription.entry.js`.
- `translation.entry.js`.

## Design overview
Using these tools, we will were able to define our system as follows:

![Overview Diagram](asset/overview.png)

The Flask server defines two endpoints accessable if the session key is stored in a cookie. If this session is not found, the server redirects the user to the Zeeguu login page. 

The **/articles** endpoint simply delivers the article.html page on a valid GET request. This page defines all styles and structure of the articles listing and the subscription menu, but all functionality is implemented by the package which it invokes. The subscription package make use of the Cache class in order to store article listings locally, but Caching is not specific to this package.

The **/article** endpoint takes as its arguments the article that the user decides to read, processes the article, and then delivers it included with the article.html page on a valid GET request. This page defines all styles and structure of the article listing but again all functionality (like tap-and-translate) is implemented by the package which it invokes. 

Both packages share a need to contact the Zeeguu API once in a while, and thus this functionality has been abstracted into a common class: `ZeeguuRequests`.

## In more detail
### Subscription
![Subscription UML](asset/subscription.png)

The subscription package allows for modifying the users feeds and listing the available articles for the feeds the user is currently subscribed to. The **LanguageMenu** class retrieves the available languages and requests FeedSubscriber  to update the list of available subscriptions whenever a particular language is selected. **FeedSubscriber** thus retrieves feed options and allows for subscribing to those feeds. Subscribing to a feed notifies SubscriptionList. **SubscriptionList** manages the list of all currently subscribed-to feeds and allows for removing a feed from that list. A change to this class calls for a change to the ArticleList. **ArticleList** manages a list of all possible articles to read, and uses the **Cache** class to do this efficiently.

### Translation
![Translation UML](asset/translation.png)
TBD

### ZeeguuRequests
![Subscription UML](asset/ZeeguuRequests.png)

The ZeeguuRequest class hides how we communicate with Zeeguu and gives both POST and GET endpoints to communicate with. Communication is handled asynchronously to force responsiveness of the application. Thus, server reply messages need to be handled by a callback method that you supply yourselves.

### Cache
![Subscription UML](asset/Cache.png)

The Cache class abstracts the implementation of storing user data locally. It allows us, if supported by the browser, to not be forced in querying zeeguu about identical data we requested shortly before. This increases responsiveness of the application whilst decreasing server workload.
