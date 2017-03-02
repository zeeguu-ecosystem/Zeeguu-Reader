/**
 * Retrieves the available languages of Zeeguu and fills
 * the Subscription Manager's dialog with these options.
 */
function LanguageMenu() {
    this.load = function() {
        // Load the available languages for the dialog.
        requestZeeguuGET(GET_AVAILABLE_LANGUAGES, {}, loadLanguageOptions);
    }

    /* Loads all the available language options as buttons in the dialog. */
    function loadLanguageOptions(data)
    {
        var options = JSON.parse(data);
        var template = $(HTML_ID_LANGUAGEOPTION_TEMPLATE).html();
        options.sort();
        for (i=0; i<options.length; ++i)
        {
            var languageOptionData = {
                languageOptionCode: options[i]
            }
            $("#languageOptionList").append(Mustache.render(template, languageOptionData));
        }
    }

}
