import {queue as d3_queue} from 'd3-queue';
import {json as d3_json} from 'd3-request';

export default function(cbResult) {

    d3_queue()
	    .defer(d3_json, "../../assets/data/gb_topo.json")
	    .defer(d3_json, "../../assets/data/ni_topo.json")
	    .await(cbResult);

}
