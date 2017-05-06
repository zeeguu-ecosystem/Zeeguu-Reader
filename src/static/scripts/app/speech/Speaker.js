

/* Class that allows for text to speech of zeeguu tags. */
export default class Speaker {

    constructor() {
        this.utterance = new SpeechSynthesisUtterance();
    }
       
    speak(text, language) {
        this._setLanguage(language);
        this._setText(text);
        speechSynthesis.speak(this.utterance);
    }

    _setLanguage(language) {
        this.utterance.lang = language;
    }

    _setText(text) {
        this.utterance.text = text;
    }
        
};