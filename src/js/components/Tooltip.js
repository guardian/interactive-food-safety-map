import {
	select
} from 'd3-selection'


export default function Tooltip(options) {

	var w=options.width || 200,
		h=options.height || 110;

	////////console.log("!!!!!!!!!!!",options)

	var tooltip=select(options.container)
					.append("div")
						.attr("class","tooltip arrow_box clearfix")
						.styles({
							"min-height":options.h?((options.h+2)+"px"):"auto",
							"line-height":options.h?((options.h+2)+"px"):"15px"
						})
						//.style("width",function(){
						//	return (options.indicators.length * 52 + 12)+"px";
						//})

	let box=options.container.getBoundingClientRect();
	let WIDTH=box.width;

	var tooltipTitle;
	if(options.title) {
		tooltipTitle=tooltip.append("h1")
			.attr("class","tooltip-title")
			.text("title")	
	}
	let indicator;
	if(options.html) {
		tooltip.html(options.html);
		indicator=tooltip.selectAll("span.value");
	} else {
		indicator=tooltip.selectAll("div.indicator")
				.data(options.indicators,function(d){
					return d.id;
				})
				.enter()
				.append("div")
					.attr("class","indicator clearfix")

		var value=indicator.append("span")
					.attr("class","value")
					.attr("id",function(d){
						return d.id;
					});

		indicator
				.filter(d=>(typeof d.title !== 'undefined'))
				.append("span")
					.attr("class","title")
					.text(function(d){
						return d.title;
					});
	}

	this.hide=function() {
		tooltip.classed("visible",false);
	};
	this.show=function(data,x,y,title=null,onlyname=false) {
	

		if(title) {
			tooltipTitle.text(title);	
		}
		
		if(options.html) {

			if(onlyname) {
				tooltip.classed("only-name",true);
			} else {
				tooltip.classed("only-name",false);
			}

			data.forEach(d=>{
				tooltip.selectAll(`span#${d.id}`).text(d.value)
			});
		} else {
			indicator.data(data);

			indicator.select("span.value")
				.text(function(d){
					//console.log("AAAHHHHHHHHHH",d,this)
					return d.value;
				})
		}

		if(x>WIDTH*0.75) {

		}

		tooltip.styles({
			left:(x+options.margins.left)+"px",
			top:(y+options.margins.top)+"px"
		})
		.classed("visible",true)
		
	};
	

}