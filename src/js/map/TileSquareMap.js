import {
	select
} from 'd3-selection';

import {
    scaleQuantize as d3_scaleQuantize,
    scaleLinear as d3_scaleLinear,
    scaleThreshold as d3_scaleThreshold
} from 'd3-scale';

import {
	extent,
	range,
	mean,
	median
} from 'd3-array';

import {
	forceSimulation,
	forceX as d3_forceX,
	forceY as d3_forceY,
	forceCollide as d3_forceCollide
} from 'd3-force';

import {
	nest
} from 'd3-collection'

import {
	format as d3_format
} from 'd3-format';

import Tooltip from '../components/Tooltip'

export default function TileSquareMap(data,options) {

	console.log("TileSquareMap",data,options.fsaData)

	/*let colors={
			"london":"#efd255",
			"east":"#ff6600",
			"wales":"#7e0023",
			"scotland":"#0065BD",
			"west-midlands":"#006a4e",
			"east-midlands":"#009966",
			"south-west":"#008bc9",
			"south-east":"#bc0074",
			"north-west":"#008bc9",
			"north-east":"#bc0074",
			"yorkshire-and-the-humber":"#ff7200"
		};*/

	data.forEach(d=>{
		d.info=options.fsaData.lads[d.index];
		let borders={};

		let left=data.filter(n=>(n.x==d.x-1 && n.y==d.y))[0];
		borders.left=left?(left.region_name!==d.region_name):true;

		let right=data.filter(n=>(n.x==d.x+1 && n.y==d.y))[0];
		borders.right=right?(right.region_name!==d.region_name):true;

		let top=data.filter(n=>(n.x==d.x && n.y==d.y-1))[0];
		borders.top=top?(top.region_name!==d.region_name):true;

		let bottom=data.filter(n=>(n.x==d.x && n.y==d.y+1))[0];
		borders.bottom=bottom?(bottom.region_name!==d.region_name):true;

		d.borders=borders;
	})

	let buckets=[0.05,0.1,0.15,0.2,0.5,0.51]

	let fillThreshold = d3_scaleThreshold()
        .domain(buckets)
        .range(["#f6f6f6","#eaeaea","#ffd400","#ffa300","#ff5b3a","#cc2b12"])

	let margins=options.margins || {
		left:0,
		right:0,
		top:0,
		bottom:0
	};

	let lad;
	let tooltip;
	let hover_square;

	let WIDTH,
		HEIGHT;

	let square_side=options.square_side || 15;

	let extents={
		x:extent(data,d=>d.x),
		y:extent(data,d=>d.y)
	}

	console.log("EXTENTS",extents)

	buildVisual();

	function buildVisual() {

		tooltip=new Tooltip({
	    	container:options.container,
	    	margins:margins,
	    	title:false,
	    	indicators:[
	    		{
	    			id:"t_lad_name"
	    		},
	    		{
	    			id:"t_lad_failrate"
	    		},
	    		{
	    			id:"t_lad_sum"
	    		},
	    		{
	    			id:"t_lad_sumfail"
	    		}

	    	],
	    	html:"<div class='content'><span id='t_lad_sumfail' class='value'></span> out of <span id='t_lad_sum' class='value'></span> failed the FSA hygiene inspection in <span id='t_lad_name' class='value b'></span>, a <span id='t_lad_failrate' class='value'>XX</span></div><div class='name'><span id='t_lad_name' class='value'></span></div>"
	    });

		let box=options.container.getBoundingClientRect();
		WIDTH=box.width;
		HEIGHT=box.height;

		square_side=Math.ceil((WIDTH-(margins.left+margins.right))/(extents.x[1]-extents.x[0]));
		square_side=Math.ceil(square_side/2)*2;
		//WIDTH=extents.x[1]*square_side+margins.right+margins.left;
		HEIGHT=(extents.y[1]-extents.y[0])*square_side+(margins.top+margins.bottom);
		console.log("EXTENTS",extents)
		if(HEIGHT>600) {
			HEIGHT=600;
			square_side=Math.ceil((HEIGHT-(margins.top+margins.bottom))/(extents.y[1]-extents.y[0]));
			square_side=Math.ceil(square_side/2)*2;
			WIDTH=(extents.x[1]-extents.y[0])*square_side+margins.right+margins.left;
			HEIGHT=(extents.y[1]-extents.y[0])*square_side+margins.top+margins.bottom;
			//alert("H:"+WIDTH+","+HEIGHT+","+square_side)
		} else {
			//alert("W:"+WIDTH+","+HEIGHT+","+square_side)
		}

		console.log("W",WIDTH,"H",HEIGHT,"S",square_side)

		WIDTH+=square_side;
		HEIGHT+=square_side;

		margins.top+=square_side/2;
		margins.bottom+=square_side/2;
		margins.left+=square_side/2;
		margins.right+=square_side/2;

		let xscale=d3_scaleLinear().domain(extents.x).range([0,WIDTH-(margins.left+margins.right)]);
		let yscale=d3_scaleLinear().domain(extents.y).range([0,HEIGHT-(margins.top+margins.bottom)]);

		xscale=(x)=>{
			return x*square_side
		}

		yscale=(y)=>{
			return y*square_side
		}

		let svg=select(options.container)
					.select(".grid-map")
	    				.append("svg")
	    				.attrs({
	    					width:WIDTH,
	    					height:HEIGHT
	    				})

    	let grid=svg.append("g")
    					.attrs({
    						"class":"lads",
    						"transform":`translate(${margins.left},${margins.top})`
    					});
    	let border_grid=svg.append("g")
    					.attrs({
    						"class":"borders",
    						"transform":`translate(${margins.left},${margins.top})`
    					});
    	let overlay=svg.append("g")
    					.attrs({
    						"class":"overlay",
    						"transform":`translate(${margins.left},${margins.top})`
    					});

    	hover_square=overlay.append("rect")
    				.attrs({
	    				x:-(square_side/2-0.5),
	    				y:-(square_side/2-0.5),
	    				width:square_side,
	    				height:square_side,
	    				"transform":"translate(-100,-100)"
	    			})

    	lad=grid.selectAll("lad")
    			.data(data,d=>d.id)
    			.enter()
    			.append("g")
    				.attr("id",d=>d.id)
    				.attr("rel",d=>d.name)
    				//.attr("data-fail",d=>(d.index?d.info.count[options.indicator].rateFail:"none"))
    				.attr("data-grid",d=>(d.x+"x"+d.y))
    				//.attr("data-coords",d=>(d.o_x+"x"+d.o_y))
    				//.attr("data-region",d=>(`${d.region_name?d.region_name.toLowerCase().replace(/\s/gi,"-"):"none"}`))
    				.attr("class","lad")
    				// .classed("b-t",d=>d.borders.top)
    				// .classed("b-b",d=>d.borders.bottom)
    				// .classed("b-l",d=>d.borders.left)
    				// .classed("b-r",d=>d.borders.right)
    				.attr("transform",d=>{
    					let x=xscale(d.x),
    						y=yscale(d.y);
    					d.position={x:x,y:y}
    					return `translate(${x},${y})`
    				})
    				.on("mouseenter",d=>{
						highlightLAD(d.name,false);
						if(options.mouseEnterCallback) {
							options.mouseEnterCallback.call(this,d.name)
						}
    				})
    				.on("click",d=>{
						//highlightLAD(d.name);
						if(options.mouseClickCallback) {
							options.mouseClickCallback.call(this,d.name)
						}
    				})

    	

    	

    	lad.append("rect")
    			.attrs({
    				x:-(square_side/2-0.5),
    				y:-(square_side/2-0.5),
    				width:square_side-1,
    				height:square_side-1
    			})
    			//.style("fill",d=>(`${d.region_name?colors[d.region_name.toLowerCase().replace(/\s/gi,"-")]:""}`))
    			.style("fill",d=>{
    				if(!d.index) {
    					return "#fff";
    				}
    				//console.log(d)
    				return fillThreshold(d.info.count[options.indicator].rateFail)
    			})

    	
    	let border=border_grid.selectAll("border")
			    			.data(data,d=>d.id)
			    			.enter()
			    			.append("g")
			    			.attr("class","border")
			    			.attr("transform",d=>{
		    					return `translate(${d.position.x},${d.position.y})`
		    				})

		border.filter(d=>d.borders.top)
    			.append("line")
    			.attrs({
    				x1:-(square_side/2),
    				x2:(square_side/2),
    				y1:-(square_side/2),
    				y2:-(square_side/2)
    			})
    	border.filter(d=>d.borders.bottom)
    			.append("line")
    			.attrs({
    				x1:-square_side/2,
    				x2:square_side/2,
    				y1:square_side/2,
    				y2:square_side/2
    			})

    	border.filter(d=>d.borders.left)
    			.append("line")
    			.attrs({
    				x1:-square_side/2,
    				x2:-square_side/2,
    				y1:-square_side/2,
    				y2:square_side/2
    			})

    	border.filter(d=>d.borders.right)
    			.append("line")
    			.attrs({
    				x1:square_side/2,
    				x2:square_side/2,
    				y1:-square_side/2,
    				y2:square_side/2
    			})

    	

    	let legend_width=150,
    		legend_height=15;
    	let legend=svg.append("g")
    					.attrs({
    						"class":"legend",
    						"transform":`translate(${WIDTH-margins.right-legend_width},${margins.top+50})`
    					});
    	legend.append("text")
    			.attrs({
    				x:0,
    				y:-5
    			})
    			.text("Rate of failed inspections")

    	let range=legend
					.selectAll("g.range")
					.data(([0]).concat(buckets))
					.enter()
					.append("g")
					.attr("class","range")
					.attr("transform",d=>{
						return `translate(${d*legend_width},0)`
					});
		range.append("rect")
				.attrs({
					x:0,
					y:0,
					height:legend_height
				})
				.attr("width",(d,i)=>{
					if(d<=0.5) {
						return (buckets[i+1]-d)*legend_width;
					} else {
						return (1-d)*legend_width;
					}
				})
				.style("fill",d=>fillThreshold(d))
		range
			.filter(d=>(([0,0.5,0.51]).indexOf(d)>-1))
			.classed("first-child",d=>(d===0))
			.append("text")
				.attr("x",(d,i)=>{
					//return 0;
					if(d<=0.5) {
						return 0;//(buckets[i+1]-d)*legend_width;
					} else {
						return 0.5*legend_width;
					}
				})
				.attr("y",legend_height+10)
				.text((d,i)=>{
					if(d<=0.5) {
						return (d*100)+"%"
					} else {
						return "100%";
					}
				})

		

	}

	function highlightLAD(name,onlyname=false) {
		//console.log(name,data)
    	//lad.classed("highlight",r=>r.name===name)

    	let _lad=data.filter(d=>(d.name===name))[0]

    	console.log(_lad)

    	hover_square.attr("transform",`translate(${_lad.position.x},${_lad.position.y})`)

    	tooltip.show([
				{
					id:"t_lad_name",
					value:_lad.name
				},
				{
					id:"t_lad_failrate",
					value: d3_format(",.1%")(_lad.info.count[options.indicator].rateFail)
				},
				{
					id:"t_lad_sum",
					value: _lad.info.count[options.indicator].sum
				},
				{
					id:"t_lad_sumfail",
					value: _lad.info.count[options.indicator].sumFail
				}
			],
			_lad.position.x+square_side/2+2,
			_lad.position.y-square_side/2,
			null,
			onlyname
		);

    }

    this.highlightLAD = (name) => {

    	highlightLAD(name);

    }

}
