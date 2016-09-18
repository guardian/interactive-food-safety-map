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

export default function SquareMap(data,options) {

	let margins=options.margins || {
		left:0,
		right:0,
		top:0,
		bottom:0
	};

	let WIDTH,
		HEIGHT;

	let extents={
		x:extent(data,d=>d.x),
		y:extent(data,d=>d.y)
	}

	let col_scale=d3_scaleQuantize().range(range(options.grid[0])).domain(extents.x),
		row_scale=d3_scaleQuantize().range(range(options.grid[1])).domain(extents.y);

	data.forEach(d=>{
			d.row=row_scale(d.y);
			d.col=col_scale(d.x);
			console.log(d)
		})



	let row_index=-1,
		col_index=0;
	data=data.sort((a,b)=>{
		if(a.row===b.row) {
			if(a.col===b.col) {
				return a.x - b.x;
			}
			return a.col - b.col;
		}
		return a.row-b.row;
	})

	let rows=[],
		last_row=-1;

	data.forEach(d=>{
		if(last_row!==d.row) {
			rows.push([]);
			last_row=d.row;
		}
		d.current_row=rows.length-1;
		rows[rows.length-1].push(d);
	})
	
	

	console.log(rows)

	/*let row_avg_x=rows.map(row=>{
		return median(row,d=>d.x)
	})
	let row_avg_y=rows.map(row=>{
		return median(row,d=>d.y)
	})

	data.forEach(d=>{
		d.median_x=row_avg_x[d.current_row];
		d.median_y=row_avg_y[d.current_row];
	})*/

	//console.log(row_avg_x,row_avg_y)
	//return;
	
	/*rows.forEach((row,i)=>{
		row.forEach((d,j)=>{
			if(!d.just_moved) {
				if(d.y-row_avg_y[i]>1 && rows[i+1]) {
					let el=row.splice(j,1)[0];
					el.just_moved=true;
					rows[i+1].push(el);
				}
				if(d.y-row_avg_y[i]<-1 && rows[i-1]) {
					let el=row.splice(j,1)[0];
					el.just_moved=true;
					rows[i-1].push(el);
				}	
			}
		})
	})

	rows=sortRows(rows);*/

	

	/*rows.forEach((row,i)=>{
		let prev;
		row.forEach((d,j)=>{
			if(j===0) {
				prev=null;
			}
			if(prev && prev.col===d.col) {
				if(Math.abs(d.x - prev.x)<4) {
					let el=row.splice(j,1)[0];
					rows[i+1].push(el);
				}
			}
			prev=d;
		})
	})
	
	rows=sortRows(rows);*/

	console.log(rows)

	let xscale,yscale;

	buildVisual();

	function sortRows(rows) {
		return rows.map(row=>{
			return row.sort((a,b)=>{
				return a.x-b.x;
			})
		})
	}

	

	function buildVisual() {

		

		let box=options.container.getBoundingClientRect();
		WIDTH=box.width;
		HEIGHT=box.height;

		xscale=d3_scaleLinear().domain([0,options.grid[0]-1]).range([0,WIDTH-(margins.left+margins.right)]);
		yscale=d3_scaleLinear().domain([0,options.grid[1]-1]).range([0,HEIGHT-(margins.top+margins.bottom)]);

		xscale.domain(extents.x);
		yscale.domain(extents.y);

    	let svg=select(options.container)
    				.append("svg")
    				.attrs({
    					width:WIDTH,
    					height:HEIGHT
    				})

    	let grid=svg.append("g")
    					.attrs({
    						"class":"grid",
    						"transform":`translate(${margins.left},${margins.top})`
    					});

    	/*grid
				.selectAll("line.x")
				.data(range(options.grid[0]))
				.enter()
				.append("line")
					.attr("class","x")
					.attr("x1",0)
					.attr("x2",WIDTH)
					.attr("y1",bucket=>{
						return yscale(bucket)
						let median_lad=bucket.value.lads.find(l=>(bucket.value.median_x===l.o_x && bucket.value.median_y===l.o_y));
						return median_lad.y;
					})
					.attr("y2",bucket=>{
						return yscale(bucket)
						let median_lad=bucket.value.lads.find(l=>(bucket.value.median_x===l.o_x && bucket.value.median_y===l.o_y));
						return median_lad.y
					})*/

    	let lads=svg.append("g")
    					.attrs({
    						"class":"lads",
    						"transform":`translate(${margins.left},${margins.top})`
    					});
    	let lad=lads.selectAll("g.lad")
    					//.data(flattenRows(rows))
    					.data(data,d=>d.id)
    					.enter()
    					.append("g")
    						.attr("class","lad")
    						.attr("id",d=>d.name)
    						.attr("rel",d=>d.name)
    						.attr("transform",d=>{

    							//console.log(d.name,d.row,yscale(d.row))

    							let x=xscale(d.x),
    								y=yscale(d.y);
    							d.x=x;
    							d.y=y;

    							return `translate(${d.x},${d.y})`;
    						});

    	let r=6;

    	/*lad.append("circle")
    			.attrs({
    				cx:0,
    				cy:0,
    				r:r
    			})*/

    	let w=(WIDTH-(margins.left+margins.right))/options.grid[0],
			h=(HEIGHT-(margins.top+margins.top))/options.grid[1];
    	lad
    		/*.classed("highlight",d=>{
				return options.regions[d.id].["london"].indexOf(d.id)>-1;
			})*/
    		.append("rect")
    			.attrs({
    				x:-w/2,
    				y:-h/2,
    				width:w,
    				height:h
    			})

    	/*lad
			.append("text")
				.attrs({
					x:0,
					y:0
				})
				.text(d=>d.name.slice(0,3))*/


    	let simulation=forceSimulation(data)
    						.velocityDecay(0.2)
						    .force("x", d3_forceX().strength(0.001))
						    .force("y", d3_forceY().strength(0.001))
						    .force("collide", d3_forceCollide().radius(function(d) { return r + 0.5; }).iterations(2))
						    .on("tick", ticked)
						    .on("end",buildGrid)

		function ticked() {

			//console.log(data)
			let w=(WIDTH-(margins.left+margins.right))/options.grid[0],
				h=(HEIGHT-(margins.top+margins.top))/options.grid[1];
			lad
				.data(data,d=>d.id)
				.attr("transform",d=>{
					return `translate(${d.x},${d.y})`;
				})

		}

		

		function buildGrid() {
			extents={
				x:extent(data,d=>d.x),
				y:extent(data,d=>d.y)
			}

			col_scale.domain(extents.x);
			row_scale.domain(extents.y);

			console.log(data)

			let row_index=-1,
				col_index=0;
			data=data.sort((a,b)=>{
				if(a.row===b.row) {
					if(a.col===b.col) {
						return a.x - b.x;
					}
					return a.col - b.col;
				}
				return a.row-b.row;
			})

			let rows=[],
				last_row=-1;

			data.forEach(d=>{
				if(last_row!==d.row) {
					rows.push([]);
					last_row=d.row;
				}
				d.current_row=rows.length-1;
				rows[rows.length-1].push(d);
			})

			rows=sortRows(rows);

			xscale.domain([0,options.grid[0]-1]);
			yscale.domain([0,options.grid[1]-1]);

			let flatten_rows=flattenRows(rows);


			lad
				.data(flatten_rows,d=>d.id)
				.attr("data-coords",d=>{
					return d.x+","+d.y
				})
				.attr("data-grid",d=>{
					let col=col_scale(d.x),
						row=d.row;//row_scale(d.y);
					d.col=col;
					d.row=row;
					return col+","+row
				})
				/*.attr("data-median",d=>{
					return d.median_x+","+d.median_y
				})*/
				.attr("data-final",d=>{
					let x=xscale(d.col),
						y=yscale(d.row);
					return x+","+y
				})
				.attr("transform",d=>{
					let x=xscale(d.col),
						y=yscale(d.row);
					//console.log(d,x,d.x)

					//y=y+(d.y-d.median_y)
					//x=x+(d.x-d.median_x)

					//d.x=x;
					//d.y=y;

					d.o_x=d.x;
					d.o_y=d.y;

					d.x=x;
					d.y=y;

					return `translate(${x},${y})`;
				})

			let buckets=nest()
							.key(d=>{
								return d.col+"x"+d.row
							})
							.rollup(leaves=>{

								return {
									lads:leaves,
									median_x:leaves[Math.floor(leaves.length/2)].o_x,//median(leaves,d=>d.o_x),
									median_y:leaves[Math.floor(leaves.length/2)].o_y//median(leaves,d=>d.o_y)
								}
							})
							.entries(flatten_rows)

			lad
				//.transition()
				//.duration(1000)
				.attr("transform",d=>{
					//console.log(d)
					let bucket=buckets.find(b=>(b.key===(d.col+"x"+d.row)))
					let lad=bucket.value.lads.find(l=>l.id===d.id);

					//console.log("FOUND",lad,"IN",bucket)

					let dx=d.o_x - bucket.value.median_x,
						dy=d.o_y - bucket.value.median_y;

					d.x=d.x+dx;
					d.y=d.y+dy;

					//console.log(dx,dy)

					return `translate(${d.x},${d.y})`;

				})


			/*lad
				.append("line")
				.attr("x1",d=>{
					let bucket=buckets.find(b=>(b.key===(d.col+"x"+d.row)))
					let median_lad=bucket.value.lads.find(l=>(bucket.value.median_x===l.o_x && bucket.value.median_y===l.o_y));
					let lad=bucket.value.lads.find(l=>l.id===d.id);

					return median_lad.x - lad.x;
				})
				.attr("y1",d=>{
					let bucket=buckets.find(b=>(b.key===(d.col+"x"+d.row)))
					let median_lad=bucket.value.lads.find(l=>(bucket.value.median_x===l.o_x && bucket.value.median_y===l.o_y));
					let lad=bucket.value.lads.find(l=>l.id===d.id);

					return median_lad.y - lad.y;
				})
				.attr("x2",0)
				.attr("y2",0)

			lad
				.filter(d=>{
					let bucket=buckets.find(b=>(b.key===(d.col+"x"+d.row)))
					return bucket.value.median_x===d.o_x && bucket.value.median_y===d.o_y
				})
				.select("rect")
				.style("fill","#ff6600")*/

			

			let simulation2=forceSimulation(flatten_rows)
	    						//.velocityDecay(0.2)
							    //.force("x", d3_forceX().strength(0.002))
							    //.force("y", d3_forceY().strength(0.002))
							    .force("collide", d3_forceCollide().radius(function(d) { return (w*0.51); }).iterations(2))
							    .on("tick", ticked2)
							    .on("end",buildGrid2)

			function ticked2() {

				//console.log(data)
				
				lad
					.data(flatten_rows,d=>d.id)
					.attr("transform",d=>{
						return `translate(${d.x},${d.y})`;
					})

			}

			function buildGrid2() {

				let w=(WIDTH-(margins.left+margins.right))/options.grid[0],
					h=(HEIGHT-(margins.top+margins.top))/options.grid[1];

				let duration=5000;

				lad
					.data(flatten_rows,d=>d.id)
					.transition()
					.duration(duration)
					.attr("transform",d=>{
						let x=Math.round(d.x/w)*w,
							y=Math.round(d.y/h)*h;
						return `translate(${x},${y})`;
					})
				setTimeout(()=>{
					lad
						.append("text")
							.attrs({
								x:0,
								y:0
							})
							.text(d=>d.name.slice(0,3))	
				},duration)
				
			}


			grid
				.selectAll("line.x")
				.data(range(options.grid[1]))
				.enter()
				.append("line")
					.attr("class","x")
					.attr("x1",0)
					.attr("x2",WIDTH)
					.attr("y1",bucket=>{
						return yscale(bucket)
						let median_lad=bucket.value.lads.find(l=>(bucket.value.median_x===l.o_x && bucket.value.median_y===l.o_y));
						return median_lad.y;
					})
					.attr("y2",bucket=>{
						return yscale(bucket)
						let median_lad=bucket.value.lads.find(l=>(bucket.value.median_x===l.o_x && bucket.value.median_y===l.o_y));
						return median_lad.y
					})

			grid
				.selectAll("line.y")
				.data(range(options.grid[0]))
				.enter()
				.append("line")
					.attr("class","y")
					.attr("y1",0)
					.attr("y2",HEIGHT)
					.attr("x1",bucket=>{
						return xscale(bucket)
					})
					.attr("x2",bucket=>{
						return xscale(bucket)
					})

			/*grid
				.selectAll("line.x")
				.data(buckets)
				.enter()
				.append("line")
					.attr("class","x")
					.attr("x1",0)
					.attr("x2",WIDTH)
					.attr("y1",bucket=>{
						let median_lad=bucket.value.lads.find(l=>(bucket.value.median_x===l.o_x && bucket.value.median_y===l.o_y));
						return median_lad.y;
					})
					.attr("y2",bucket=>{
						let median_lad=bucket.value.lads.find(l=>(bucket.value.median_x===l.o_x && bucket.value.median_y===l.o_y));
						return median_lad.y
					})*/

			//console.log(buckets)

			
			

		}

		/*function sortARow(row) {
			console.log("sortARow",row);

			let buckets={
				below:{},
				above:{}
			};

			row.sort((a,b)=>{
				return (a.x-a.median_x) - (b.x-b.median_x)
			}).forEach(d=>{
				console.log(d);
				if(d.x<d.median_x) {
					if(!buckets.below[d.col]){
						buckets.below[d.col]=[];
					}
					buckets.below[d.col].push(d)
				}
				if(d.x>d.median_x) {
					if(!buckets.above[d.col]){
						buckets.above[d.col]=[];
					}
					buckets.above[d.col].push(d)	
				}
				
				
			})

			console.log(buckets)
			let last_col;
			for(let index in buckets.above) {
				let bucket=buckets.above[index];
				if(!last_col) {
					last_col=bucket[0].col;
				}
				if(bucket.length>1) {
					for(let i=0;i<bucket.length;i++) {
						bucket[i].col=last_col+1;
						last_col=bucket[i].col;
					}
				}
				
			}


		}*/

		function flattenRows(rows) {
			let flatten=[];
			rows.forEach((row,i)=>{
				row.forEach((d,j)=>{
					//console.log(d)
					flatten.push({
						col:j,
						row:d.current_row,
						x:d.x,
						y:d.y,
						id:d.id,
						name:d.name,
						median_x:d.median_x,
						median_y:d.median_y
					})
				})
			});
			return flatten;
		}
	}
}