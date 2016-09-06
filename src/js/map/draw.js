import topojson from 'topojson';
import {geoPath as d3_geoPath, geoAlbers as d3_geoAlbers} from 'd3-geo';
import {select as d3_select} from 'd3-selection';
import {getWindowSize} from '../lib/windowSize';

const maxWidth = 620;
const ratioHeight = 1.82;

export default function(err, gb, ni) {
    if (err) throw err;

    /* data */
    let gbData = topojson.feature(gb, gb.objects.lad);
    let niData = topojson.feature(ni, ni.objects.lgd);
    let data = {
        type: "FeatureCollection",
        features: gbData.features.concat(niData.features) 
    };
    console.log(ni);
    console.log(data.features.length + " lads");
    
    /* draw */
    let width, height;
    width = getWindowSize().width;    
    width = width < maxWidth ? width : maxWidth;
    height = width * ratioHeight;
    //console.log(width, height);

    let projection = d3_geoAlbers()
    .center([1.4, 55.4])
    .rotate([4.4, 0])
    .parallels([50, 60])
    .scale(5800)
    .translate([width / 2, height / 2]);

    let path = d3_geoPath()
    .projection(projection);

    let map = d3_select(".map-gb");
    map.html("");

    let svg = map.append("svg")
    .attr("width", width)
    .attr("height", height)
    .selectAll(".lad")
    .data(data.features)
    .enter();

    svg.append("path")
    .attr("id", (d, i) => "p" + i)
    .attr("data-lad-name", (d, i) => d.properties.LAD13NM)
    .attr("d", path);

    svg.append("text")
    .attr("dy", ".35em")
    .attr("transform", d => "translate(" + path.centroid(d) + ")")
    .attr("id", (d, i) => "t" + i)
    .text((d, i) => d.properties.LAD13NM || d.properties.LGDNAME); 
}
