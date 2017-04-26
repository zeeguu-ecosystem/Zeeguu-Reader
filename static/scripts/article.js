//Load common code that includes config, then load the app logic for this page.
require(['./config'], function (config) {
    requirejs(['app/translation/main']);
});