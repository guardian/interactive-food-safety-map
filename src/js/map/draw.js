import topojson from 'topojson';
import {geoPath as d3_geoPath, geoAlbers as d3_geoAlbers} from 'd3-geo';
import {select as d3_select} from 'd3-selection';
import {scaleLinear as d3_scaleLinear} from 'd3-scale';
import {getWindowSize} from '../lib/windowSize';
import fsaData from '../../assets/data/fsa.json!json';
import idToFsaCode from '../../assets/data/fsa_map.json!json';

const maxWidth = 620;
const ratioHeight = 1.82;

export default function(err, gb, ni) {
    if (err) throw err;

    /* data */
    //console.log(fsaData);

    let gbData = topojson.feature(gb, gb.objects.lad);
    let niData = topojson.feature(ni, ni.objects.lgd);
    let mapData = {
        type: "FeatureCollection",
        features: gbData.features.concat(niData.features)
    };

    // link map and fsa data
    let fsaDataMissingList = [];
    mapData.features.map((d, i) => {
        let code = idToFsaCode[d.id];
        d.properties.code = code;

        if (d.properties.code) {
            // to double check if fsa has all lads
            fsaData[code].id = d.id;
        } else {
            // miss-matched lad
            fsaDataMissingList.push(i);
            console.log(d.id, d.properties.name, "(no fsa data)");
        }
        return d;
    });

    let mapDataMiss = Object.keys(fsaData).filter(key => fsaData[key].id === undefined);
    mapDataMiss.forEach(lad => console.log(lad.code, lad.name, lad.count.all.rateFail, "(no map data)"));
    console.log(fsaData, "miss number:", mapDataMiss.length);

    fsaDataMissingList.forEach(index => {
        // 1 to represent null data for coloring
        mapData.features[index].properties.code = mapData.features[index].id;
        fsaData[mapData.features[index].id] = {
            count: {
                "all" : 1,
                "restaurant": 1,
                "takeaway": 1
        }};
    });
    console.log(mapData);

    /* draw */
    let width, height;
    width = getWindowSize().width;
    width = width < maxWidth ? width : maxWidth;
    height = width * ratioHeight;
    //console.log(width, height);

    let max = 0.27;
    //let max = Math.max.apply(null, fsaData.map(lad => lad.rateFail));
    let fill = d3_scaleLinear()
    .domain([0, 0.5, 0.1, 0.15, 0.2, max, 1])
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
    .data(mapData.features)
    .enter();

    svg.append("path")
    .attr("id", (d, i) => "p" + i)
    .attr("data-lad-name", (d, i) => d.properties.name)
    .attr("fill", d => {
        let lad = fsaData[d.properties.code];
        let rate = lad.count.all.rateFail;
        let color = fill(rate);
        if (rate > 0.1) console.log(lad.name, lad.count.all.rateFail, color);
        return color;
    })
    .attr("d", path);
    //.on("mouse");

    svg.append("text")
    .attr("dy", ".35em")
    .attr("transform", d => "translate(" + path.centroid(d) + ")")
    .attr("id", (d, i) => "t" + i)
    .attr("fill", d => fsaData[d.properties.code].rateFail > 0.1 ? "#333" : "transparent")
    .text((d, i) => i + ". " + d.properties.name);
}
