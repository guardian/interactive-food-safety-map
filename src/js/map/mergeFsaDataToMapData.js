import topojson from 'topojson';
import idToFsaCode from '../../assets/data/fsa_map.json!json';

export default function(gb, ni, ladData) {

    let gbData = topojson.feature(gb, gb.objects.lad);
    let niData = topojson.feature(ni, ni.objects.lgd);
    let mapData = {
        type: "FeatureCollection",
        features: gbData.features.concat(niData.features)
    };

    // link map and fsa data
    let ladDataMissingList = [];
    mapData.features.map((d, i) => {
        let code = idToFsaCode[d.id];
        if (code) {
            //d.code = code;
            // to double check if fsa has all lads
            ladData[code].id = d.id;
            
            d.name = ladData[code].name;
            d.count = ladData[code].count;        
             
        } else {
            d.name = d.properties.name;
            
            // miss-matched lad
            ladDataMissingList.push(i);
            console.log(d.id, d.name, "(no fsa data)");
        }
        delete d.properties;
        return d;
    });

    let mapDataMiss = Object.keys(ladData).filter(key => ladData[key].id === undefined);
    mapDataMiss.forEach(lad => console.log(lad.code, lad.name, lad.count.all.rateFail, "(no map data)"));
    //console.log(ladData, "miss number:", mapDataMiss.length);

    ladDataMissingList.forEach(index => {
        // 1 to represent null data for coloring
        mapData.features[index].count = {
            all: { rateFail: 1 },
            restaurant: { rateFail: 1 },
            takeaway: { rateFail: 1 }
        };
    });
    //console.log(mapData);

    return mapData;
}
