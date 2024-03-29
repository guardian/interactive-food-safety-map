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

export default function FailingRateChart(data,options) {

	let SELECTED_CONSTITUENCY;

	let margins=options.margins || {
		left:0,
		right:0,
		top:0,
		bottom:0
	};

	let WIDTH,
		HEIGHT;

	let buckets=[0, 0.05, 0.1, 0.15, 0.2, 0.27];

	buckets=[0,0.1,0.2,0.3,0.4,0.5]
	buckets=[0.05,0.1,0.15,0.2,0.25,0.251]
	buckets=[0.05,0.1,0.15,0.2,0.5,0.51]

	let fillThreshold = d3_scaleThreshold()
        .domain(buckets)
        //.range(["#eaeaea",'#f1eef6','#d7b5d8','#df65b0','#dd1c77','#980043'])
        //.range(["#f6f6f6","#eaeaea","#f9f1c5","#ffe900","#ffce00"])
        .range(["#f6f6f6","#eaeaea","#ffd400","#ffa300","#ff5b3a","#cc2b12"])

	console.log(data.lads)

	let lads=d3_entries(data.lads).map(d=>{
										d.key=d.value.count[options.indicator].rateFail;
								    	return d;
								    })

	console.log(lads)

	lads=lads.sort((a,b)=>{
    	return +a.key - +b.key;
    })

	let rate;

    /*let nested_data=d3_nest()
        .key(d=>{
            if(d.value.name==="Highland" || d.value.name==="Newham") {
                console.log(d)    
            }
            
            return d.value.count.restaurant.rateFail
        })
        .rollup(leaves=>{
        	return {
        		n:leaves.length,
        		constituencies:leaves.map(d=>d.value.name)
        	}
        })
        .entries(lads)

    nested_data=nested_data.sort((a,b)=>{
    	return +a.key - +b.key;
    })

    console.log(nested_data);*/

    buildVisual();

    function buildVisual() {

    	let box=options.container.getBoundingClientRect();
		WIDTH=box.width;
		HEIGHT=box.height;

    	let svg=select(options.container)
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
    	
    	console.log(extents);
    	extents=[0,0.5]

    	let xscale=d3_scaleLinear().domain([0,lads.length-1]).rangeRound([0,WIDTH-(margins.left+margins.right)]);
    	let yscale=d3_scaleLinear().domain(extents).range([HEIGHT-(margins.top+margins.bottom),0]);

    	let axes=svg.append("g")
    					.attrs({
    						"class":"axes",
    						"transform":`translate(${margins.left},${margins.top})`
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
			    				let x=xscale(i),
			    					y=yscale(+d.key)
			    				//console.log(d,x,y)
			    				return `translate(${x},${y})`;
			    			})
			    			.on("mouseenter",d=>{
			    				highlightLAD(d.value.name);
			    				if(options.mouseEnterCallback) {
			    					console.log(d)
			    					options.mouseEnterCallback.call(this,d.value.name)
			    				}
			    			})
		let w=(WIDTH/lads.length);
		rate.append("rect")
				.attrs({
					x:-w/2,
					y:0,
					width:w
				})
				.attr("height",d=>{
					return yscale.range()[0]-yscale(+d.key);
				})
				.style("fill",d=>{
					return fillThreshold(+d.key)
				})

		// rates.append("circle")
		// 		.attrs({
		// 			cx:0,
		// 			cy:0,
		// 			r:1
		// 		})
				// .style("fill",d=>{
				// 	return fillThreshold(+d.key)
				// })

		rate.append("line")
				.attrs({
					x1:-w/2,
					x2:w/2,
					y1:0,
					y2:0
				})

		rate.append("text")
				.attrs({
					x:w,
					y:-5
				})
				.text(d=>(d.value.name+" "+d3_format(",.2%")(+d.key)))

		rate.append("rect")
				.attrs({
					"class":"bg",
					x:-w/2,
					width:w
				})
				.attr("y",d=>{
					return -yscale(+d.key);
				})
				.attr("height",d=>{
					return yscale.range()[0];
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
			.data([0.05,0.1,0.15,0.2,0.5])
			.enter()
			.append("g")
				.attr("class","bar")
				.attr("transform",d=>{
					let x=0,
						y=yscale(d);
					return `translate(${x},${y})`;
				})

		xbar
			.append("line")
				.attrs({
					x1:0,
					x2:xscale.range()[1],
					y1:0,
					y2:0
				})

		xbar
			.append("text")
				.attrs({
					x:0,
					y:12
				})
				.text(d=>(d3_format(".0%")(d)))


		let mean_bar=rates
					.append("g")
					.datum(avg.mean)
					.attr("class","bar mean")
					.attr("transform",d=>{
						let x=0,
							y=yscale(d);
						return `translate(${x},${y})`;
					})

		mean_bar
			.append("line")
				.attrs({
					x1:0,
					x2:xscale.range()[1],
					y1:0,
					y2:0
				})

		mean_bar
			.append("text")
				.attrs({
					x:xscale.range()[1],
					y:-2,
					"class":"avg"
				})
				.text(d=>("National avg "+d3_format(".2%")(d)))

    }

    function highlightLAD(name) {
    	rate.classed("show",r=>r.value.name===name)
    }

    this.highlightLAD = (name) => {

    	highlightLAD(name);

    }

}