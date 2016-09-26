import iframeMessenger from 'guardian/iframe-messenger';
import embedHTML from './text/embed.html!text';

import {
	selection
} from 'd3-selection-multi'

import fsaData from '../assets/data/fsa.json!json';
import fsaMap from  '../assets/data/fsa_map.json!json';
import lads_info from '../assets/data/lads_info.json!json';

import {postcodeLookup} from './lib/postcode'

import FailingRateChart from './charts/FailingRateChartVertical';
import TileSquareMap from './map/TileSquareMap';
import LookupLocalAuthority from './components/LookupLocalAuthority';

import {select} from 'd3-selection';
import {
	csv
} from "d3-request"
import {
	values
} from "d3-collection"
import {
	format as d3_format
} from 'd3-format'
import {
	extent
} from 'd3-array'


window.init = function init(el, config) {
    iframeMessenger.enableAutoResize();
    el.innerHTML = embedHTML;

    /*for(let index in fsaData.lads) {
    	let d=fsaData.lads[index];
    	fsaData.lads[index]={
    		n:d.name,
    		c:{
    			a:{
    				r:d.count.all.rateFail,
    				s:d.count.all.sum,
    				f:d.count.all.sumFail
    			},
    			r:{
    				r:d.count.restaurant.rateFail,
    				s:d.count.restaurant.sum,
    				f:d.count.restaurant.sumFail
    			},
    			t:{
    				r:d.count.takeaway.rateFail,
    				s:d.count.takeaway.sum,
    				f:d.count.takeaway.sumFail
    			}
    		}
    	}
    }

    console.log(fsaData)
    console.log(JSON.stringify(fsaData))*/

	csv(config.assetPath+"/assets/data/grid.csv",grid=>{

	    	let lads=values(lads_info);
	    	
	    	let local_authorities=grid.map(d=>{
	    	
	    		let region={}
	    		if(!lads_info[d.id]) {
	    			if(d.id[0]==="S") {
		    			region.code="S",
		    			region.name="Scotland"
		    		}
	    		} else {
	    			region.code=lads_info[d.id].region_code;
	    			region.name=lads_info[d.id].region_name;
	    		}

	    		let index=fsaMap[d.id],
	    			name=index?fsaData.lads[index].n:"";
	    		
	    		if(!index) {
	    			name=lads_info[d.id].la_name;
	    		}
	    		return {
	    			id:d.id,
	    			index:index,
	    			name:name,
	    			region_code:region.code,
	    			region_name:region.name,
	    			x:+d.x,
	    			y:+d.y
	    		};
	    	});

	    	let extents={
	    		x:extent(local_authorities,d=>d.x),
	    		y:extent(local_authorities,d=>d.y)
	    	}

	    	let charts;
	    	let lookup;
	    	let map=new TileSquareMap(local_authorities,{
	    		container:el.querySelector(".map"),
	    		indicator:"a",
		    	margins:{
		    		left:5,
		    		right:5,
		    		bottom:5,
		    		top:5
		    	},
		    	fsaData:fsaData,
		    	/*mouseEnterCallback:(name) => {
		    		values(charts).forEach(c=>c.highlightLAD(name))
		    	},*/
		    	mouseClickCallback:(name) => {
		    		lookup.setItem(name);
		    		values(charts).forEach(c=>c.highlightLAD(name))
		    		
		    	},
		    	labels:[
		    		{
		    			id:"E07000120", //Hyndburn
		    			dx:-1,//-(3),
		    			align:"middle"
		    		}, 
		    		{
		    			id:"E08000025", //Birmingham
		    			dx:-1,
		    			align:"middle"
		    		},
		    		{
		    			id:"E08000003", //Manchester
		    			dx:-1,
		    			align:"middle"
		    		},
		    		{
		    			id:"E08000035", //Leeds
		    			dx:-1,
		    			align:"middle"
		    		},
		    		{
		    			id:"S12000036", //Edinburgh
		    			dx:0,
		    			align:"start",
		    			label:"Edinburgh"
		    		},
		    		{
		    			id:"S12000027", //Shetland
		    			dx:0,
		    			align:"start"
		    		},
		    		{
		    			id:"E06000032", //Luton
		    			dx:-1,
		    			align:"middle"
		    		},
		    		{
		    			id:"E09000033",
		    			dx:-1,
		    			align:"middle",
		    			label:"London"
		    		}
		    	]
	    	})
	    	
	    	let avgs={
	    			"S":0.10,
	    			"E":0.062,
	    			"W":0.049,
	    			"N":0.023
	    		};
	    	let countries={
	    		"S":"Scotland",
    			"E":"England",
    			"W":"Wales",
    			"N":"Northern Ireland"
	    	}
	    	let texts={};
	    	
	    	local_authorities.forEach(lad=>{
	    		
	    		if(typeof lad.info != 'undefined') {

		    		let rate=lad.info.c["a"].r,
		    			country=lad.id.slice(0,1),
		    			diff=+rate*100 - avgs[country]*100;
		    		texts[lad.name]={
		    			name:lad.name,
		    			id:lad.id,
		    			index:lad.index,
		    			country:country,
		    			rate:d3_format(",.1%")(+rate),
		    			diff:d3_format(",.1f")(diff),
		    			how:diff>0?"above":"below",
		    			n:lad.info.c["a"].f,
		    			all:lad.info.c["a"].s
		    		}
		    		texts[lad.name].html=`${texts[lad.name].n} out of ${texts[lad.name].all} establishments failed the FSA hygiene inspection in <b>${lad.name}</b>. That is ${Math.abs(texts[lad.name].diff)} percentage points ${texts[lad.name].how} the average in ${countries[country]}.`;	
		    	} else {
		    		texts[lad.name]={
		    			name:lad.name,
		    			id:lad.id,
		    			country:lad.id.slice(0,1),
		    			html:`Data for ${lad.name} not available`
		    		}
		    	}
	    	})

	    	lookup=new LookupLocalAuthority({
	    		container:el.querySelector(".js-location"),
	    		list:local_authorities.map(d=>(d.name)),
	    		iframeMessenger:iframeMessenger,
	    		submitCallback:(d,type)=>{
	    			let name=d;
	    			if(type==="id") {
	    				let lad=local_authorities.filter(l=>(d==l.id))[0];
	    				name=lad.name;
	    			}
	    			//console.log("SHOWING",name)
	    			values(charts).forEach(c=>c.highlightLAD(name))
	    			
	    			map.highlightLAD(name);


	    			select(".summary")
	    				.html(texts[name].html)

	    			select(".lookup-result")
		    				.classed("visible",true)

	    			if(texts[name].index) {
	    				
	    				select(".lookup-result")
		    				.classed("no-data",false)

		    			select(".link-to-fsa")
		    				.classed("visible",true)
		    				.select("a")
			    				.attr("href",d=>{
			    					return `http://ratings.food.gov.uk/authority-search/en-GB/%5E/%5E/Relevance/0/${texts[name].index}/%5E/0/1/10`
			    				})
			    				.text(d=>{
			    					return `Go to FSA to see all listings for ${name}`;
			    				})	
	    			} else {
	    				select(".lookup-result")
		    				.classed("no-data",true)
	    			}

	    			
	    		}
	    	})




	    	charts={
		    	"all":new FailingRateChart(fsaData,{
				    	container:el.querySelector("#c1.failingrate-chart"),
				    	indicator:"a",
				    	margins:{
				    		left:0,
				    		right:30,
				    		bottom:15,
				    		top:7
				    	},
				    	title:"All food establishments",
				    	label:"failed the inspections",
				    	mouseEnterCallback:(d=>{
				    		charts.restaurant.highlightLAD(d);
				    		charts.takeaway.highlightLAD(d);
				    		map.highlightLAD(d)
				    	})
				    }),
		    	"restaurant":new FailingRateChart(fsaData,{
				    	container:el.querySelector("#c2.failingrate-chart"),
				    	indicator:"r",
				    	margins:{
				    		left:0,
				    		right:30,
				    		bottom:15,
				    		top:7
				    	},
				    	title:"Restaurants, cafes and canteens",
				    	mouseEnterCallback:(d=>{
				    		charts.all.highlightLAD(d);
				    		charts.takeaway.highlightLAD(d);
				    		map.highlightLAD(d);
				    	})
				    }),
		    	"takeaway":new FailingRateChart(fsaData,{
				    	container:el.querySelector("#c3.failingrate-chart"),
				    	indicator:"t",
				    	margins:{
				    		left:0,
				    		right:30,
				    		bottom:15,
				    		top:7
				    	},
				    	title:"Takeaways and sandwich shops",
				    	mouseEnterCallback:(d=>{
				    		charts.all.highlightLAD(d);
				    		charts.restaurant.highlightLAD(d);
				    		map.highlightLAD(d);
				    	})
				    })
		    };


		    select(".note")
		    	.classed("hidden",false)


	    });


};
