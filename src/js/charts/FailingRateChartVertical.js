import {
	select
} from 'd3-selection';
import {
    scaleQuantize as d3_scaleQuantize,
    scaleLinear as d3_scaleLinear,
    scaleThreshold as d3_scaleThreshold
} from 'd3-scale';
import {
    nest as d3_nest,
    entries as d3_entries
} from 'd3-collection';
import {
	extent,
	range,
	mean,
	median
} from 'd3-array';
// import {
// 	axisLeft
// } from 'd3-axis';
import {
	format as d3_format
} from 'd3-format'
import {getWindowSize} from '../lib/windowSize';

export default function FailingRateChartVertical(data,options) {

	let SELECTED_CONSTITUENCY;

	let margins=options.margins || {
		left:0,
		right:0,
		top:0,
		bottom:0
	};

	let WIDTH,
		HEIGHT;

	let buckets=[0.05,0.1,0.15,0.2,0.5,0.51]

	let fillThreshold = d3_scaleThreshold()
        .domain(buckets)
        .range(["#f6f6f6","#eaeaea","#ffd400","#ffa300","#ff5b3a","#cc2b12"])

	let lads=d3_entries(data.lads).map(d=>{
										d.key=d.value.c[options.indicator].r;
								    	return d;
								    })

	//console.log(lads)

	lads=lads.sort((a,b)=>{
    	return +a.key - +b.key;
    })

	let rate;

    buildVisual();

    function buildVisual() {

    	
		select(options.container)
					.append("h2")
					.html(options.title)

    	let chart=select(options.container)
    				.append("div")
    				.attr("class","chart")

    	let box=chart.node().getBoundingClientRect();
		WIDTH=box.width;
		HEIGHT=box.height;

		let svg=chart
    				.append("svg")
    				.attrs({
    					width:WIDTH,
    					height:HEIGHT
    				})

    	// let extents=extent(nested_data,d=>{
    	// 	return +d.key;
    	// })

    	let extents=extent(lads,d=>{
    		return +d.key;
    	})

    	let avg={
    		mean:mean(lads,d=>{
	    		return +d.key;
	    	}),
	    	median:median(lads,d=>{
	    		return +d.key;
	    	})
	    }

    	extents=[0,0.5]

    	let xscale=d3_scaleLinear().domain(extents).rangeRound([0,WIDTH-(margins.left+margins.right)]);
    	let yscale=d3_scaleLinear().domain([0,lads.length-1]).range([HEIGHT-(margins.top+margins.bottom),0]);

    	let axes=svg.append("g")
    					.attrs({
    						"class":"axes",
    						"transform":`translate(${margins.left},${HEIGHT-margins.bottom})`
    					})

    	let rates=svg.append("g")    					
    					.attrs({
    						"class":"rates",
    						"transform":`translate(${margins.left},${margins.top})`
    					});
    	rate=rates
	    		.selectAll("g.rate")
	    		//.data(nested_data)
	    		.data(lads)
	    		.enter()
	    		.append("g")
	    			.attr("class","rate")
	    			.attr("transform",(d,i)=>{
	    				let x=0,//xscale(+d.key),
	    					y=yscale(i)
	    				////console.log(d,x,y)
	    				return `translate(${x},${y})`;
	    			})
	    			.on("mouseenter",function(d){
	    				/*highlightLAD(d.value.name);
	    				if(options.mouseEnterCallback) {
	    					//console.log(d)
	    					options.mouseEnterCallback.call(this,d.value.name)
	    				}*/
	    			})
		let h=(HEIGHT/lads.length);
		h=1;
		rate.append("rect")
				.attrs({
					x:0,
					y:-h/2,
					height:h
				})
				.attr("width",d=>{
					return xscale(+d.key);
				})
				.style("fill",d=>{
					return fillThreshold(+d.key)
				})
				

		rate.append("text")
				.attr("class","bg")
				.attr("x",d=>(xscale(+d.key)))
				.attr("y",0)
				.attr("dx","0.25em")
				.attr("dy","0.3em")
				//.text(d=>(d.value.name+" "+d3_format(",.2%")(+d.key)))
				.text(d=>(d3_format(",.1%")(+d.key)+" "+(options.label || "")))

		rate.append("text")
				.attr("x",d=>(xscale(+d.key)))
				.attr("y",0)
				.attr("dx","0.25em")
				.attr("dy","0.3em")
				//.text(d=>(d.value.name+" "+d3_format(",.2%")(+d.key)))
				.text(d=>(d3_format(",.1%")(+d.key)+" "+(options.label || "")))

		rate.append("rect")
				.attrs({
					"class":"bg",
					x:0,
					y:0,
					height:h
				})
				.attr("width",d=>{
					return xscale.range()[1];
				})
				// .style("fill",d=>{
				// 	return fillThreshold(+d.key)
				// })

		
		//let xAxis=axisLeft(yscale);


		let xaxis=axes.append("g")
						.attr("class","xaxis")
						//.call(xAxis)

		let xbar=xaxis
			.selectAll("g.bar")
			.data([0.05,0.1,0.15,0.2,0.3,0.4,0.5])
			//.data([0.1,0.2,0.3,0.4,0.5])
			.enter()
			.append("g")
				.attr("class","bar")
				.attr("transform",d=>{
					let x=xscale(d),
						y=0;
					return `translate(${x},${y})`;
				})

		xbar
			.append("line")
				.attrs({
					x1:0,
					x2:0,
					y1:0,
					y2:-yscale.range()[0]
				})

		xbar
			.append("text")
				.attrs({
					x:0,
					y:15
				})
				.text(d=>{
					let label=(d3_format(".0%")(d));
					if(d<0.5) {
						label=label.replace(/%/gi,"")
					}
					return label;
				})


		let mean_bar=rates
					.append("g")
					.datum(avg.mean)
					.attr("class","bar mean")
					.attr("transform",d=>{
						let x=yscale(d),
							y=0;//yscale(d);
						return `translate(${x},${y})`;
					})

		mean_bar
			.append("line")
				.attrs({
					x1:0,
					x2:0,
					y1:0,
					y2:yscale.range()[1]
				})

    }

    function highlightLAD(name) {
    	//console.log(name)
    	rate
    		.classed("show",false)
    		.filter(r=>(r.value.n===name))
    		.classed("show",true)
    		.each(function(d){
    			//console.log(this,this.parentElement,this.parentNode)
    			this.parentNode.appendChild(this);		
    		})

    	
    	
    }

    this.highlightLAD = (name) => {

    	highlightLAD(name);

    }

}