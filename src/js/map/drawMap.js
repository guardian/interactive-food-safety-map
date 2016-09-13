import {geoPath as d3_geoPath, geoAlbers as d3_geoAlbers} from 'd3-geo';
import {select as d3_select} from 'd3-selection';
import {
    scaleQuantize as d3_scaleQuantize,
    scaleLinear as d3_scaleLinear,
    scaleThreshold as d3_scaleThreshold
} from 'd3-scale';
import {
    nest as d3_nest,
    entries as d3_entries
} from 'd3-collection';
import {getWindowSize} from '../lib/windowSize';
import fsaData from '../../assets/data/fsa.json!json';
import dataLinker from './mergeFsaDataToMapData.js';
import updateColours from './updateMapColourOnBtnClick.js';
import updateSummary from './updateSummary.js';

const maxWidth = 620;
const ratioHeight = 1.82;

export default function drawMap(err, gb, ni) {
    if (err) throw err;

    console.log(fsaData.lads)

    let nested_data=d3_nest()
        .key(d=>{
            if(d.value.name==="Highland" || d.value.name==="Newham") {
                console.log(d)    
            }
            
            return d.value.count.restaurant.rateFail
        })
        .rollup(leaves=>{
            return leaves.length;
        })
        .entries(d3_entries(fsaData.lads))

    console.log(nested_data)

    //return;

    /* data */
    let data = dataLinker(gb, ni, fsaData.lads); 
    console.log(fsaData.ranges);


    /* draw */
    let width, height;
    width = getWindowSize().width;
    width = width < maxWidth ? width : maxWidth;
    height = width * ratioHeight;
    //console.log(width, height);
    let wh=getWindowSize().height,
        rh=wh/height;
    height = Math.min(wh,height);
    //width = height / ratioHeight;

    console.log("RH",rh,wh)

    let max = fsaData.ranges.takeaway.max;
    let fill = d3_scaleQuantize()
    //.domain([0, 0.05, 0.1, 0.15, 0.25, max, 1])
        .domain([0,max])
        .range(["#eaeaea" ,"#dcdcdc", "#bdbdbd", "#aad8f1", "#197caa", "#005689"]);//, "#f6f6f6"]);
    //console.log("max:", max);

    let fillLinear = d3_scaleLinear()
        .domain([0, 0.05, 0.1, 0.15, 0.25, max, 1])
        //.domain([0,max])
        .range(["#eaeaea" ,"#dcdcdc", "#bdbdbd", "#aad8f1", "#197caa", "#005689", "#000"]);

    let fillThreshold = d3_scaleThreshold()
        .domain([0, 0.05, 0.1, 0.15, 0.2, 0.27, 1])
        //.domain([0,max])
        //.range(["#eaeaea" ,"#dcdcdc", "#bdbdbd", "#aad8f1", "#197caa", "#005689", "#f6f6f6"]);
        .range(["#eaeaea",'#f1eef6','#d7b5d8','#df65b0','#dd1c77','#980043',"#f6f6f6"])

    console.log(data)
    data.features.forEach(feat=>{
        console.log(feat.name,feat.count.all.rateFail,fillThreshold(feat.count.all.rateFail),fillLinear(feat.count.all.rateFail))
    })

    let projection = d3_geoAlbers()
    .center([1.4, 55.4])
    .rotate([4.4, 0])
    .parallels([50, 60])
    //.scale(3400)
    //.scale(2800)
    .scale(5800 * (rh>1?1:rh))
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
    .attr("fill", d => fillThreshold(d.count.all.rateFail))
    .attr("d", path)
    .on("mouseenter", d => updateSummary(d));

    let texts = svg.append("text")
    .attr("dy", ".35em")
    .attr("transform", d => "translate(" + path.centroid(d) + ")")
    .attr("id", (d, i) => "t" + i)
    .attr("fill", d => d.count.all.rateFail > 0.4 ? "#333" : "transparent")
    .text((d, i) => d.name + " (" + d.count.all.rateFail + ")");


    /* update events */
    updateColours(texts, paths, fillThreshold);
}
