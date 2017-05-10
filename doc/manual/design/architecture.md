# Architectural Design
## Goals
The development of the Universal Multilingual Reader started off with the following design goals in mind:

- Aim for a clear separation of concerns in order to improve modularity of the system.
- Focus on increasing intuitiveness between component coupling to facilitate extendability.
- The implementation should strive for efficiency and avoid redundancy.

## Local modules
Most of the code will be running locally on the client machine. This is to decrease the workload on our server, which in turn should lead to increased responsiveness on the users side. 

We decided to split the system into three separate packages: subscription, translation, and zeeguuRequests. The latter being a package that abstracts away all networked communication with the Zeeguu Service and provides a simple universal interface instead. This division is meant to closely resemble the primary features. Additionally, there is a single shared file defining all constants used in the application, such that updates to (for example) endpoint locations can easily be applied trough a single constant update.

To adhere to our model-view-controller principles, most visual elements of the system have been constructed in simple HTML and CSS definitions, whilst we define a single control script for every package that binds certain methods to certain events.

### Subscription
The content of the main page is divided into three essential parts: a list of articles, a list of currently subscribed feeds that allows you to remove feeds from your subscription list, a menu that lists available feeds for a given language that allows you to add feeds (subscribe to feeds). We tried to define classes based on this natural structure, where change in one class is propagated to change in all dependant classes (no active polling):

- **SubscriptionManager:** This class is called by OnClick event listeners on the webpage. It can construct a list of feeds for any particular language and can add or remove feeds when so requested. Adding and removing feeds means that the subscription list has changed, and thus the SubscriptionList is notified.
- **SubscriptionList:** This class can construct a list of all feeds currently subscribed to. For every feed loaded in the list, it will request from the ArticleList to load all associated articles. When a feed is removed from the subscription list, this class will request from the ArticleList to remove all associated articles.
- **ArticleList:** When requested, this class will construct a list of articles for the particular feed passed to it. This is an additive operation, which means that multiple calls to this method will simply append more articles to the already constructed list. This is due to Zeeguu only allowing us to request articles for one feed at a time. When a feed has been removed, we simply iterate over our constructed list and remove all article-links associated to that feed.

Construction of addable feeds, subscribed feeds, or article-links is done by use of a predefined HTML template. Each template has certain variables associated with the feed or article, which is filled-in by our classes when iteratively appending this template to the document. This allows us to keep the look and feel of the interface separate from the implementation of feed and article management.

### Translation
Similarly to the subscription package we try to keep a close correlation between the natural structure of the article translation page and the class definitions:
- **Translator:** allows us to translate text enclosed in our custom Zeeguu Tag (see the Back-end section on how these tags are made to be present in the document). On translation, it will request Zeeguu for translation data, and will append this data as attributes to the tag. It can also tell whether or not a tag has been translated already by checking for the presence of a \texttt{numTranslations} property, since this property is defined after translation to represent the number of alternative translations.
- **AlterMenu:** manages a simple window that shows a list of alternative translations to a word, which it constructs out of the translation attributes associated with the Zeeguu tag. It binds Onclick listeners to all listed alternatives, which will replace the translation when triggered. When there are no alternatives, it will request the Notifier class to notify the user about this.
- **Notifier:** A  very simple class that acts as a wrapper to the MDL Snackbar: a simple pop-up message at the bottom of the screen. This class makes sure that repeated messages are only shown once when the message is still visible to the user in order to decrease the amount of visual `spam' the user receives.

### ZeeguuRequests
The Zeeguu Platform is a RESTful service, and is thus accessible using _POST_ and _GET_ requests on certain endpoints. The zeeguuRequests package only contains two method definitions: one to send a _GET_ request to an endpoint, another to send a _POST_ request. You supply the methods with the particular endpoint you wish to access and the data that should go along with it. Additionally you provide a callback method that will be used to handle the server's reply. 

This design allows us to access all available endpoints on Zeeguu, without having to continuously (re-) define a custom HTTP request. Furthermore, requiring a callback method instead of simply returning the requested data makes sure that the application will not block and wait for a reply. Keeping the client-side application responsive.

