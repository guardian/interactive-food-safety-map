import iframeMessenger from 'guardian/iframe-messenger';
import embedHTML from './text/embed.html!text';

//import d3 from 'd3';

import {
	selection
} from 'd3-selection-multi'

//import fetchMapData from './map/fetchMapData';
//import drawMap from './map/drawMap';

import fsaData from '../assets/data/fsa.json!json';
import fsaMap from  '../assets/data/fsa_map.json!json';
import lads_info from '../assets/data/lads_info.json!json';

import {postcodeLookup} from './lib/postcode'

import FailingRateChart from './charts/FailingRateChartVertical';
import SquareMap from './map/SquareMap';
import TileSquareMap from './map/TileSquareMap';
import LookupLocalAuthority from './components/LookupLocalAuthority';

import {queue as d3_queue} from 'd3-queue';
import {select} from 'd3-selection';
import {
	csv,
	json
} from "d3-request"
import {
	values
} from "d3-collection"


window.init = function init(el, config) {
    iframeMessenger.enableAutoResize();

    el.innerHTML = embedHTML;
    
    /*csv("../assets/data/centroids.csv",d=>{
    	d.x= +d.x;
    	d.y= +d.y;
    	return d;
    },data=>{
    	// 34 x 40
    	console.log(data)

    	new SquareMap(data,{
    		container:el.querySelector(".square-map"),
    		grid:[40,Math.floor(40*1.82)],
    		margins:{
	    		left:0,
	    		right:0,
	    		bottom:0,
	    		top:0
	    	},
	    	lads_info:lads_info
    	})

    })*/

    d3_queue()
	    .defer(csv, "../../assets/data/grid3.csv")
	    .defer(csv, "../../assets/data/centroids.csv")
	    .defer(json, "../../assets/data/lads_info.json")
	    .await((err, grid, centroids,lads_info)=>{
	    	console.log(grid)
	    	
	    	let lads=values(lads_info);

	    	console.log(lads)

	    	let local_authorities=grid.map(d=>{
	    		let lad=centroids.filter(l=>{
	    			return d.id.toLowerCase() === l.id.replace(/\s/gi,"_").toLowerCase();
	    		})[0]
	    		if(!lad) {
	    			console.log("can't find",d.name)
	    		}
	    		//console.log(lad,d)
	    		let region={}
	    		if(!lads_info[lad.id]) {
	    			if(lad.id[0]==="S") {
		    			region.code="S",
		    			region.name="Scotland"
		    		}	
	    		} else {
	    			region.code=lads_info[lad.id].region_code;
	    			region.name=lads_info[lad.id].region_name;
	    		}

	    		let x=(+d.x + (+d.dx)),
	    			y=((+d.y) + (+d.dy));

	    		x=Math.floor(x/30);

	    		return {
	    			id:lad.id,
	    			index:fsaMap[lad.id],
	    			name:lad.name,
	    			region_code:region.code,
	    			region_name:region.name,
	    			x:x>18?x:x+1,
	    			y:Math.round(y/30),
	    			o_x:x,
	    			o_y:y
	    		};
	    	});

	    	console.log(local_authorities);
	    	
	    	let map=new TileSquareMap(local_authorities,{
	    		container:el.querySelector(".map"),
	    		indicator:"all",
	    		square_side:20,
		    	margins:{
		    		left:20,
		    		right:20,
		    		bottom:20,
		    		top:20
		    	},
		    	fsaData:fsaData,
		    	mouseEnterCallback:(name) => {
		    		values(charts).forEach(c=>c.highlightLAD(name))
		    	}
	    	})

	    	new LookupLocalAuthority({
	    		container:el.querySelector(".js-location"),
	    		list:local_authorities.map(d=>(d.name)),
	    		submitCallback:(d,type)=>{
	    			let name=d;
	    			if(type==="id") {
	    				console.log(d,local_authorities)
	    				let lad=local_authorities.filter(l=>(d==l.id))[0];
	    				name=lad.name;
	    			}
	    			console.log("SHOWING",name)
	    			values(charts).forEach(c=>c.highlightLAD(name))
	    			map.highlightLAD(name)
	    		}
	    	})
	    	

	    	let charts={
		    	"all":new FailingRateChart(fsaData,{
				    	container:el.querySelector("#c1.failingrate-chart"),
				    	indicator:"all",
				    	margins:{
				    		left:10,
				    		right:90,
				    		bottom:20,
				    		top:10
				    	},
				    	mouseEnterCallback:(d=>{
				    		charts.restaurant.highlightLAD(d);
				    		charts.takeaway.highlightLAD(d);
				    		map.highlightLAD(d)
				    	})
				    }),
		    	"restaurant":new FailingRateChart(fsaData,{
				    	container:el.querySelector("#c2.failingrate-chart"),
				    	indicator:"restaurant",
				    	margins:{
				    		left:10,
				    		right:90,
				    		bottom:20,
				    		top:10
				    	},
				    	mouseEnterCallback:(d=>{
				    		charts.all.highlightLAD(d);
				    		charts.takeaway.highlightLAD(d);
				    		map.highlightLAD(d);
				    	})
				    }),
		    	"takeaway":new FailingRateChart(fsaData,{
				    	container:el.querySelector("#c3.failingrate-chart"),
				    	indicator:"takeaway",
				    	margins:{
				    		left:10,
				    		right:90,
				    		bottom:20,
				    		top:10
				    	},
				    	mouseEnterCallback:(d=>{
				    		charts.all.highlightLAD(d);
				    		charts.restaurant.highlightLAD(d);
				    		map.highlightLAD(d);
				    	})
				    })
		    };
	    	

	    });

    

    

    /*select(".hp-location__form")
    	.on('submit', () => {
	        let inputboxVal = document.querySelector(".hp-madlib__input__text").value;
	        
	        if (localNames.indexOf(inputboxVal) !== -1) {
	            this.showResultByName(inputboxVal);
	        } else { // not a constituency
	            postcodeLookup(inputboxVal).then(
	                postcodeJson => this.postcodeFn(postcodeJson),
	                failReason => {
	                    if (typeof failReason === 'string') this.showError(failReason);
	                    else if (failReason.status === 404) this.showError('Invalid postcode');
	                    else this.showError('Error retrieving postcode');
	                }
	            );
	        }
    	})
    	.select("input")*/


    
    //fetchMapData(drawMap);
    
    
    

    

    

};
