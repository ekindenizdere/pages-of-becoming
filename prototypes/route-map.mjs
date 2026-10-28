// Makes src/data/route-spanish-adventure.json: Natural Earth 1:10m coastline (world-atlas) and the stops, projected to SVG units.
// Run once in a scratch folder with: npm i world-atlas@2.0.2 topojson-client@3.1.0 d3-geo@3.1.1 && node route-map.mjs
// The roads between stops are approximate waypoints (coast road and motorways, the inland road to Miravet), not traced routes.
import fs from 'fs';
import { feature, mesh } from 'topojson-client';
import { geoMercator, geoPath } from 'd3-geo';
const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/land-10m.json'));
const land = feature(topo, topo.objects.land);
const box = { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[-1.0, 39.3], [2.45, 39.3], [2.45, 41.55], [-1.0, 41.55], [-1.0, 39.3]].reverse()] } };
const W = 600;
const proj = geoMercator().fitWidth(W, box);
const [[, y0], [, y1]] = geoPath(proj).bounds(box);
const H = Math.round(y1 - y0);
proj.translate([proj.translate()[0], proj.translate()[1] - y0]).clipExtent([[0, 0], [W, H]]);
const path = geoPath(proj).digits(1);
const p = (lon, lat) => proj([lon, lat]).map((v) => +v.toFixed(1));
// stops [lon, lat]
const stops = { bcn: [2.0785, 41.2974], cas: [1.979, 41.2655], gin: [1.9285, 41.2585], gar: [1.9005, 41.2505], cal: [1.5685, 41.1875], ven: [1.5353, 41.2192], com: [1.5226, 41.1795], mir: [0.5953, 41.0393], alt: [-0.5110, 39.8295] };
// approximate roads between stops: coast road out of Barcelona, then the motorway south
const legs = {
  'bcn-cas': [[2.0785, 41.2974], [2.03, 41.28], [1.979, 41.2655]],
  'cas-gin': [[1.979, 41.2655], [1.95, 41.262], [1.9285, 41.2585]],
  'gin-gar': [[1.9285, 41.2585], [1.9005, 41.2505]],
  'gar-cal': [[1.9005, 41.2505], [1.86, 41.245], [1.81, 41.237], [1.73, 41.222], [1.67, 41.205], [1.6, 41.195], [1.5685, 41.1875]],
  // chapter 2: El Vendrell, the walk to the riuet at Coma-ruga, inland to Miravet (Reus, Falset, Móra d'Ebre), then down the Ebro and the coast to Altura (Tortosa, AP-7, Sagunt, A-23)
  'cal-ven': [[1.5685, 41.1875], [1.556, 41.205], [1.5353, 41.2192]],
  'ven-com': [[1.5353, 41.2192], [1.53, 41.2], [1.5226, 41.1795]],
  'com-mir': [[1.5226, 41.1795], [1.4, 41.16], [1.25, 41.13], [1.1, 41.155], [0.95, 41.16], [0.82, 41.145], [0.7, 41.1], [0.645, 41.07], [0.62, 41.05], [0.5953, 41.0393]],
  'mir-alt': [[0.5953, 41.0393], [0.57, 40.95], [0.521, 40.812], [0.47, 40.65], [0.475, 40.47], [0.4, 40.36], [0.2, 40.2], [-0.04, 39.99], [-0.15, 39.85], [-0.27, 39.68], [-0.35, 39.72], [-0.45, 39.8], [-0.511, 39.8295]],
};
// places named in the story that are not stops on the road
const refs = { bar: [2.1734, 41.3851], val: [-0.3763, 39.4699] };
const out = { w: W, h: H, refs: Object.fromEntries(Object.entries(refs).map(([k, v]) => [k, p(...v)])), land: path(mesh(topo, topo.objects.land)), stops: Object.fromEntries(Object.entries(stops).map(([k, v]) => [k, p(...v)])), legs: Object.fromEntries(Object.entries(legs).map(([k, v]) => [k, v.map((q) => p(...q))])) };
fs.writeFileSync(process.argv[2] || 'route-map.json', JSON.stringify(out));
console.log(W, H, out.land.length, out.stops);
