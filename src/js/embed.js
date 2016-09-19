import iframeMessenger from 'guardian/iframe-messenger';
import embedHTML from './text/embed.html!text';

import {
	selection
} from 'd3-selection-multi'

import fetchMapData from './map/fetchMapData';
import drawMap from './map/drawMap';

import fsaData from '../assets/data/fsa.json!json';
import fsaMap from  '../assets/data/fsa_map.json!json';
import FailingRateChart from './charts/FailingRateChart';
import lads_info from '../assets/data/lads_info.json!json';

import SquareMap from './map/SquareMap';
import TileSquareMap from './map/TileSquareMap';

import {queue as d3_queue} from 'd3-queue';
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
	    		let lad=centroids.find(l=>{
	    			return d.id.toLowerCase() === l.id.replace(/\s/gi,"_").toLowerCase();
	    		})
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

	    	new TileSquareMap(local_authorities,{
	    		container:el.querySelector(".grid-map"),
		    	margins:{
		    		left:20,
		    		right:20,
		    		bottom:20,
		    		top:20
		    	},
		    	fsaData:fsaData
	    	})

	    });

    /*csv("../assets/data/grid.csv",d=>{
    	d.x = +d.x;
    	d.y = +d.y;
    	return d;
    },(data)=>{



    	// new StaticMap("../assets/imgs/LADS.svg",{
	    // 	container:el.querySelector(".square-map")
	    // });	
    })*/

    
    //fetchMapData(drawMap);
    
    new FailingRateChart(fsaData,{
    	container:el.querySelector(".failingrate-chart"),
    	margins:{
    		left:30,
    		right:30,
    		bottom:10,
    		top:30
    	}
    })

};
