import $ from 'jquery';
import config from '../config';
import Speaker from './Speaker';

var speaker = new Speaker();

$(document).ready(function() {
    var start;

    $(config.HTML_ZEEGUUTAG).on( 'mousedown', function( e ) {
        start = new Date().getTime();
    });
    $(config.HTML_ZEEGUUTAG).on( 'mouseleave', function( e ) {
        start = 0;
    });
    $(config.HTML_ZEEGUUTAG).on( 'mouseup', function( e ) {
        if (new Date().getTime() >= (start + config.SPEECH_DELAY)) {
           speaker.speak($(this).text(), FROM_LANGUAGE);  
        } 
    });

});