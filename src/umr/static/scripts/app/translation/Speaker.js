import UserActivityLogger from '../UserActivityLogger';

const USER_EVENT_TEXT_TO_SPEECH = 'SPEAK TEXT';

/**
 * Class that allows text to speech for supplied text and language.
 */
export default class Speaker {
    /**
     * Performs the speech synthesis of the supplied parameters.
     * @param {string} text - Text to be transformed to speech.
     * @param {string} language - Language code to be used for synthesis. 
     */
    speak(text, language) {
        let utterance = new SpeechSynthesisUtterance();
        utterance.lang = language;
        utterance.text = text;
        speechSynthesis.speak(utterance);

        UserActivityLogger.log_article_interaction(USER_EVENT_TEXT_TO_SPEECH, text, {language : language});
    }
};