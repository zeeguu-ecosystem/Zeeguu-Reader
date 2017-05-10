
/* Class that allows text to speech for supplied text and language. */
export default class Speaker {
    /**
     * Initializes the utterance object for the speech synthesis.
     */
    constructor() {
        this.utterance = new SpeechSynthesisUtterance();
    }

    /**
     * Performs the speech synthesis of the supplied parameters.
     * @param {string} text - Text to be transformed to speech.
     * @param {string} language - Language code to be used for synthesis. 
     */
    speak(text, language) {
        this._setLanguage(language);
        this._setText(text);
        speechSynthesis.speak(this.utterance);
    }

    /**
     * Set the language for the utterance object.
     * @param {string} langauge - Language code.
     */
    _setLanguage(language) {
        this.utterance.lang = language;
    }

    /**
     * Set the text context to be synthesized.
     * @param {string} text - Text to be transformed to speech.
     */
    _setText(text) {
        this.utterance.text = text;
    }
        
};