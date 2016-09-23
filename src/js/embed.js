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
//import SquareMap from './map/SquareMap';
import TileSquareMap from './map/TileSquareMap';
import LookupLocalAuthority from './components/LookupLocalAuthority';

//import {queue as d3_queue} from 'd3-queue';
import {select} from 'd3-selection';
import {
	csv//,
	// json
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

    /*csv("../assets/data/centroids.csv",d=>{
    	d.x= +d.x;
    	d.y= +d.y;
    	return d;
    },data=>{
    	// 34 x 40
    	//console.log(data)

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

    /*d3_queue()
	    .defer(csv, config.assetPath+"/assets/data/grid.csv")
	    //.defer(csv, config.assetPath+"/assets/data/centroids.csv")
	    //.defer(json, config.assetPath+"/assets/data/lads_info.json")
	    //.await((err, grid, centroids,lads_info)=>{
	    .await((err, grid)=>{*/

	csv(config.assetPath+"/assets/data/grid.csv",grid=>{
	    	//console.log(grid)

	    	let lads=values(lads_info);
	    	/*let counts={
	    		takeaway:{
	    			n:0,
	    			m20:0,
	    			lad:[]
	    		},
	    		restaurant:{
	    			n:0,
	    			m20:0,
	    			lad:[]
	    		}
	    	}
	    	values(fsaData.lads).forEach(d=>{
	    		//console.log(d)
	    		if(d.count.restaurant.rateFail>d.count.takeaway.rateFail) {
	    			counts.restaurant.n++;
					if(d.count.restaurant.rateFail>=0.2) {
						counts.restaurant.m20++;
					}
	    			counts.restaurant.lad.push(d)
	    		} else {
	    			counts.takeaway.n++;
	    			if(d.count.takeaway.rateFail>=0.2) {
						counts.takeaway.m20++;
					}
	    			counts.takeaway.lad.push(d)
	    		}
	    	})
	    	console.log(counts)

	    	return;*/
	    	let local_authorities=grid.map(d=>{
	    		// let lad=centroids.filter(l=>{
	    		// 	return d.id.toLowerCase() === l.id.replace(/\s/gi,"_").toLowerCase();
	    		// })[0]
	    		// if(!lad) {
	    		// 	//console.log("can't find",d.name)
	    		// }
	    		////console.log(lad,d)
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



	    		/*let x=(+d.x + (+d.dx)),
	    			y=((+d.y) + (+d.dy));

	    		if(lad.id[0]==="N") {
	    			x = x + (32.5*3);
	    			y = y - (30*5);
	    		}

	    		let n_x=Math.floor(x/30);
	    		n_x=n_x>18?n_x:n_x+1
	    		n_x=n_x<7?n_x+1:n_x*/
	    		let index=fsaMap[d.id],
	    			name=index?fsaData.lads[index].name:"";
	    		//console.log(d.id,index,fsaData.lads[index])
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
	    			/*x:n_x-4,
	    			y:Math.round(y/30),
	    			o_x:x,
	    			o_y:y*/
	    		};
	    	});

	    	//console.log(local_authorities);

	    	let extents={
	    		x:extent(local_authorities,d=>d.x),
	    		y:extent(local_authorities,d=>d.y)
	    	}

	    	//console.log("GRID EXTENTS",extents)

	    	// console.log(JSON.stringify(local_authorities.map(d=>{
	    	// 	    		return d.id+","+d.x+","+d.y
	    	// 	    	})))

	    	let charts;
	    	let lookup;
	    	let map=new TileSquareMap(local_authorities,{
	    		container:el.querySelector(".map"),
	    		indicator:"all",
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
		    		//console.log("--->",name)
		    		lookup.setItem(name);
		    		values(charts).forEach(c=>c.highlightLAD(name))
		    		
		    	},
		    	labels:[
		    		{
		    			id:"E07000120", //Hyndburn
		    			dx:-1,//-(3),
		    			align:"middle"
		    		}, 
		    		/*{
		    			id:"E09000025", //Newham
		    			dx:3,
		    			align:"start"
		    		},
		    		{
		    			id:"E09000009", //Ealing
		    			dx:8,
		    			align:"start"	
		    		},*/
		    		
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
	    	//local_authorities.filter(lad=>(typeof lad.info != 'undefined')).forEach(lad=>{
	    	local_authorities.forEach(lad=>{
	    		//console.log(lad)
	    		if(typeof lad.info != 'undefined') {

		    		let rate=lad.info.count["all"].rateFail,
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
		    			n:lad.info.count["all"].sumFail,
		    			all:lad.info.count["all"].sum
		    		}
		    		//texts[lad.name].html=`With a ${texts[lad.name].rate} failing rate overall, <b>${lad.name}</b> is ${Math.abs(texts[lad.name].diff)} percentage points ${texts[lad.name].how} the average in ${countries[country]}.`;
		    		texts[lad.name].html=`${texts[lad.name].n} out of ${texts[lad.name].all} establishments failed the FSA hygiene inspection in <b>${lad.name}</b>. That is ${Math.abs(texts[lad.name].diff)} percentage points ${texts[lad.name].how} the average in ${countries[country]}.`;	
		    	} else {
		    		//console.log("!!!",lad)
		    		texts[lad.name]={
		    			name:lad.name,
		    			id:lad.id,
		    			country:lad.id.slice(0,1),
		    			html:`Data for ${lad.name} not available`
		    		}
		    	}
	    	})
	    	
	    	//console.log(texts);

	    	lookup=new LookupLocalAuthority({
	    		container:el.querySelector(".js-location"),
	    		list:local_authorities.map(d=>(d.name)),
	    		submitCallback:(d,type)=>{
	    			let name=d;
	    			if(type==="id") {
	    				//console.log(d,local_authorities)
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
				    	indicator:"all",
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
				    	indicator:"restaurant",
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
				    	indicator:"takeaway",
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
