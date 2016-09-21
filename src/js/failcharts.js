import iframeMessenger from 'guardian/iframe-messenger';
import scoresHTML from './text/failcharts.html!text';

import {
	selection
} from 'd3-selection-multi'

import fsaData from '../assets/data/fsa.json!json';
import FailingRateChart from './charts/FailingRateChartVertical';

window.init = function init(el, config) {
    iframeMessenger.enableAutoResize();
	
	el.innerHTML=scoresHTML;

	let charts={
	    	"restaurant":new FailingRateChart(fsaData,{
			    	container:el.querySelector("#c2.failingrate-chart"),
			    	indicator:"restaurant",
			    	margins:{
			    		left:0,
			    		right:30,
			    		bottom:15,
			    		top:7
			    	},
			    	title:"Restaurants, cafes and canteens"
			    }),
	    	"takeaway":new FailingRateChart(fsaData,{
			    	container:el.querySelector("#c3.failingrate-chart"),
			    	indicator:"takeaway",
			    	margins:{
			    		left:0,
			    		right:30,
			    		bottom:15,
			    		top:7
			    	},
			    	title:"Takeaways and sandwich shops"
			    })
	    };

}