var fs = require("fs");

var src, dst, data;

src = 'ni_topo.json';
dst = '../src/assets/data/ni_topo.json';

data = JSON.parse(fs.readFileSync(src));
data.objects.lgd.geometries.map(function(d) {
    d.name = d.properties.name;
    delete d.properties;
    return d;
});
//console.log(data.objects.lgd.geometries);

fs.writeFile(dst, JSON.stringify(data), function (err) {
    if (err) return console.log(err);
    console.log('ni file is saved');
});

src = 'gb_topo.json';
dst = '../src/assets/data/gb_topo.json';

data = JSON.parse(fs.readFileSync(src));
data.objects.lad.geometries.map(function(d) {
    d.name = d.properties.name;
    delete d.properties;
    return d;
});
console.log(data.objects.lad.geometries);

fs.writeFile(dst, JSON.stringify(data), function (err) {
    if (err) return console.log(err);
    console.log('gb file is saved');
});
