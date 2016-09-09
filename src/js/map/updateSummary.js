import {select as d3_select, selectAll as d3_selectAll} from 'd3-selection';

export default function(data) {
    //console.log(data);
    
    d3_selectAll(".js-name").text(data.name);
    
    Object.keys(data.count).forEach(type => 
        d3_select(".js-" + type).text(toFixed2(data.count[type].rateFail))
    );
    
    // ps. scotland doesn't have zero
    if (data.id[0] === "S") {
        d3_select(".js-sco-expemt").classed("d-n", true);    
    } else {
        d3_select(".js-sco-expemt").classed("d-n", false);    
        d3_select(".js-zero").text(toFixed2(data.count.all[0]/data.count.all.sum));
    }

    // update link to fsa site
    // ...
}

function toFixed2(num) {
    return Math.round(num*10000)/100;
}
