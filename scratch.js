fetch('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  body: '[out:json];(way(around:100,19.0443,72.8208)[building];);out geom;'
}).then(r=>r.json()).then(data => {
  console.log(JSON.stringify(data.elements.filter(e => e.tags.name), null, 2));
});
