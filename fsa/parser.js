var fs = require('fs');
var csvjson = require('csvjson');

var src = 'FSA.csv';
var dst = '../src/assets/data/fsa.json';

var dataCSV = fs.readFileSync(src, { encoding : 'utf8'});
var options = { delimiter : '\t'};
var dataArr = csvjson.toArray(dataCSV, options);

// headers
var headers = dataArr.splice(0, 1)[0];

var headerMap = {};
headers.forEach(function(header, i) {
    headerMap[header] = i; 
});
console.log(headerMap);

// rows of data
var dataArrFiltered = dataArr.filter(function(data) {
    var ratingValue = data[headerMap.RatingValue]; 
    return ratingValue !== "Exempt" && ratingValue.indexOf("Awaiting") === -1;
});
//console.log("restaurant count:", dataArrFiltered.length + "/" + dataArr.length);
//console.log(dataArrFiltered.length/dataArr.length);


/* data checking and manipulation */
var lads = [];
var typeBiz = [];
var typeRating = [];
var typeScheme = [];

var pre = "";
dataArrFiltered.forEach(function(data) {
    // local authorities
    // special change: River Tees (648) => Redcar and Cleveland (860)
    if (data[headerMap.LocalAuthorityName] === "River Tees") { 
        data[headerMap.LocalAuthorityName] = "Redcar and Cleveland"; 
        data[headerMap.LocalAuthorityCode] = 860;
    }
    if (data[headerMap.LocalAuthorityCode] !== pre[headerMap.LocalAuthorityCode]) { 
        lads.push({
            code: parseInt(data[headerMap.LocalAuthorityCode]), 
            name: data[headerMap.LocalAuthorityName], 
            flag: data[headerMap.SchemeType] !== "FHIS"}); 
    }
    pre = data;
    
    // BusinessType, RatingValue, SchemeType
    if (typeBiz.indexOf(data[headerMap.BusinessType]) === -1) { typeBiz.push(data[headerMap.BusinessType]); }
    if (typeRating.indexOf(data[headerMap.RatingValue]) === -1) { typeRating.push(data[headerMap.RatingValue]); }
    if (typeScheme.indexOf(data[headerMap.SchemeType]) === -1) { typeScheme.push(data[headerMap.SchemeType]); }
});
//console.log("lad count:", lads.length);
//console.log(typeBiz);
console.log(typeRating);
//console.log(typeScheme);

/* end of data checking */


var ladMap = {};
var bizMap = {};
lads.forEach(function(lad, i) { ladMap[lad.code] = i; });
typeBiz.forEach(function(biz, i) { bizMap[biz] = i; });
console.log(bizMap);


/* row data to local authority districts */

var typeRatingScotland = typeRating.splice(-3); 
var lenCol = typeBiz.length;

function initCount(isNotSco, isByType) {
    var countArr = function() { 
        return isByType ? Array.apply(null, Array(lenCol)).map(function (x, i) { return 0; }) : 0; 
    };
    
    var ratings = {};
    var ratingObj = function(types) {
        types.forEach(function(type) { 
            ratings[type] = countArr(isByType);
        });    
    };

    if (isNotSco) {
        ratingObj(typeRating);
    } else {
        ratingObj(typeRatingScotland);
    }
    
    return JSON.parse(JSON.stringify(ratings));
}

lads.map(function(lad) {
    //lad.count = initCount(lad.flag, false); 
    lad.countByType = initCount(lad.flag, true);
    
    lad.count = {
        all: initCount(lad.flag, false),
        takeaway: initCount(lad.flag, false),
        restaurant: initCount(lad.flag, false)
    };
    return lad;
});

//var dataTest = dataArrFiltered.slice(146200, 146300);//.concat(dataArrFiltered.slice(231715, 231720));
//dataTest.forEach(function(data) {
dataArrFiltered.forEach(function(data, i) {
    var dataLad = lads[ladMap[data[headerMap.LocalAuthorityCode]]];
    
    // all
    dataLad.count.all[data[headerMap.RatingValue]] += 1; 

    // takeaway and restaurant
    var type = data[headerMap.BusinessType].toLowerCase().split("/")[0];
    switch (type) { 
        case "restaurant":
        case "takeaway":
            dataLad.count[type][data[headerMap.RatingValue]] += 1; 
    } 

    // by type
    var iBiz = parseInt(bizMap[data[headerMap.BusinessType]]);
    dataLad.countByType[data[headerMap.RatingValue]][iBiz] += 1;
    
    //console.log(data); 
    //console.log(dataLad);
});

/* calc sum and fail rate */
function sumObj(obj) {
    var sum = 0;
    for( var el in obj ) {
        if( obj.hasOwnProperty( el ) ) {
            sum += parseInt( obj[el] );
    }}
    return sum;
}
lads.map(function(lad) {
    //console.log(lad.name);
    
    // types: all, restaurant, takeaway
    Object.keys(lad.count).forEach(function(type) {
        lad.count[type].sum = sumObj(lad.count[type]);
        
        lad.count[type].sumFail = lad.flag ? 
            lad.count[type]['0'] + lad.count[type]['1'] + lad.count[type]['2'] :    // uk but scotland
            lad.count[type]['Improvement Required'];                                // scotland
    
        lad.count[type].rateFail = Math.round(lad.count[type].sumFail*10000/lad.count[type].sum)/10000;
        
        // 0 units in this type
        //if (isNaN(lad.count[type].rateFail)) {console.log(lad);}
        if (lad.count[type].sum === 0) { lad.count[type].rateFail = null; }
    });
    return lad; 
});
//console.log(lads);

/* ranges */
function getRange(type) {
    return {
        min: Math.min.apply(null, lads.map(function(lad) { return lad.count[type].rateFail;})),
        max: Math.max.apply(null, lads.map(function(lad) { return lad.count[type].rateFail;}))
    };
}
var ranges = {};
Object.keys(lads[0].count).forEach(function(type) { 
    ranges[type] = getRange(type);
});
console.log(ranges);

/* arr to obj for topojson mapping */
var ladObj = {};
lads.map(function(lad) {
    ladObj[lad.code] = {
        name: lad.name,
        count: lad.count,
        countByType: lad.countByType
    };    
});

var output = {
    ranges: ranges,
    lads: ladObj
};
fs.writeFile(dst, JSON.stringify(output), function (err) {
      if (err) return console.log(err);
        console.log('sfa file saved');
});
