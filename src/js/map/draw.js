import {geoPath as d3_geoPath, geoAlbers as d3_geoAlbers} from 'd3-geo';
import {select as d3_select} from 'd3-selection';
import {scaleLinear as d3_scaleLinear} from 'd3-scale';
import {getWindowSize} from '../lib/windowSize';
import fsaData from '../../assets/data/fsa.json!json';
import dataLinker from './dataLinker.js';
import drawUpdate from './drawUpdate.js';

const maxWidth = 620;
const ratioHeight = 1.82;

export default function(err, gb, ni) {
    if (err) throw err;

    /* data */
    let data = dataLinker(gb, ni, fsaData.lads); 
    console.log(fsaData.ranges);


    /* draw */
    let width, height;
    width = getWindowSize().width;
    width = width < maxWidth ? width : maxWidth;
    height = width * ratioHeight;
    //console.log(width, height);

    let max = fsaData.ranges.takeaway.max;
    let fill = d3_scaleLinear()
    .domain([0, 0.5, 0.1, 0.15, 0.25, max, 1])
    .range(["#eaeaea" ,"#dcdcdc", "#bdbdbd", "#aad8f1", "#197caa", "#005689", "#f6f6f6"]);
    //console.log("max:", max);


    let projection = d3_geoAlbers()
    .center([1.4, 55.4])
    .rotate([4.4, 0])
    .parallels([50, 60])
    //.scale(2800)
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

    let paths = svg.append("path")
    .attr("id", (d, i) => "p" + i)
    .attr("data-lad-name", (d, i) => d.name)
    .attr("fill", d => fill(d.count.all.rateFail))
    .attr("d", path);

    let texts = svg.append("text")
    .attr("dy", ".35em")
    .attr("transform", d => "translate(" + path.centroid(d) + ")")
    .attr("id", (d, i) => "t" + i)
    .attr("fill", d => d.count.all.rateFail > 0.2 ? "#333" : "transparent")
    .text((d, i) => d.name + " (" + d.code + ")");


    /* update events */
    drawUpdate(texts, paths, fill);
}
