import iframeMessenger from 'guardian/iframe-messenger';
import scoresHTML from './text/scores.html!text';

window.init = function init(el, config) {
    iframeMessenger.enableAutoResize();
	
	el.innerHTML=scoresHTML;

}