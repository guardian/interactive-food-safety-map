import iframeMessenger from 'guardian/iframe-messenger';
import embedHTML from './text/embed.html!text';
import fetchMapData from './map/dataLoader';
import drawMap from './map/draw';

window.init = function init(el, config) {
    iframeMessenger.enableAutoResize();
    el.innerHTML = embedHTML;

    fetchMapData(drawMap);
};
