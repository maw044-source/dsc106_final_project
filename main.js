import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const container = d3.select('#vis');
const slider = document.querySelector('#time-slider');
const label = document.querySelector('#time-label');
const details = document.querySelector('#details');
const play = document.querySelector('#play');
const parse = d3.utcParse('%Y%m%d%H%M');
const format = d3.utcFormat('%b %d, %Y · %H:%M UTC');
let timer;

try {
  const [rows, world] = await Promise.all([
    d3.csv('ian-track.csv'),
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
  ]);
  const data = rows.map(d => ({ ...d, date: parse(d.date + d.time.padStart(4, '0')), lat: parseFloat(d.lat), lon: -parseFloat(d.lon), wind: +d.wind_knots, pressure: +d.pressure_mb }));
  const width = 820, mapHeight = 350, chartHeight = 220;
  const projection = d3.geoMercator().fitExtent([[20, 10], [width - 20, mapHeight - 10]], {type:'MultiPoint', coordinates:[[-93, 11], [-63, 38]]});
  const path = d3.geoPath(projection);
  const svg = container.append('svg').attr('viewBox', `0 0 ${width} ${mapHeight + chartHeight}`).attr('role','img').attr('aria-label','Map of Hurricane Ian’s path linked to a chart of wind speed over time');
  const map = svg.append('g');
  map.append('rect').attr('width',width).attr('height',mapHeight).attr('fill','#e8f2f4');
  map.append('g').selectAll('path').data(topojson.feature(world, world.objects.countries).features).join('path').attr('d',path).attr('fill','#d7e2d7').attr('stroke','#fff');
  const color = d3.scaleThreshold().domain([34,64,96,113,137]).range(['#86a5ae','#e8c46a','#f2a65a','#df704f','#c44743','#8e344f']);
  map.append('path').datum(data).attr('fill','none').attr('stroke','#596b74').attr('stroke-width',2).attr('d',d3.line().x(d=>projection([d.lon,d.lat])[0]).y(d=>projection([d.lon,d.lat])[1]));
  const points=map.selectAll('.track-point').data(data).join('circle').attr('class','track-point').attr('cx',d=>projection([d.lon,d.lat])[0]).attr('cy',d=>projection([d.lon,d.lat])[1]).attr('r',5).attr('fill',d=>color(d.wind)).attr('stroke','white').attr('tabindex',0).attr('role','button').attr('aria-label',d=>`${format(d.date)}, ${d.wind} knots`).on('click',(_,d)=>update(data.indexOf(d))).on('keydown',(e,d)=>{if(e.key==='Enter'||e.key===' ') {e.preventDefault();update(data.indexOf(d));}});
  const chart = svg.append('g').attr('transform',`translate(60,${mapHeight+25})`), cw=730, ch=145;
  const x=d3.scaleUtc().domain(d3.extent(data,d=>d.date)).range([0,cw]);
  const y=d3.scaleLinear().domain([0,150]).range([ch,0]);
  chart.append('g').attr('transform',`translate(0,${ch})`).call(d3.axisBottom(x).ticks(d3.utcDay.every(2)).tickFormat(d3.utcFormat('%b %d')));
  chart.append('g').call(d3.axisLeft(y).ticks(4));
  chart.append('text').attr('x',0).attr('y',-10).attr('fill','#425460').attr('font-size',13).text('Maximum sustained wind (knots)');
  chart.append('path').datum(data).attr('fill','none').attr('stroke','#bc5142').attr('stroke-width',3).attr('d',d3.line().x(d=>x(d.date)).y(d=>y(d.wind)));
  const chartPoints=chart.selectAll('.wind-point').data(data).join('circle').attr('class','wind-point').attr('cx',d=>x(d.date)).attr('cy',d=>y(d.wind)).attr('r',5).attr('fill','#bc5142').attr('stroke','white').attr('tabindex',0).attr('role','button').attr('aria-label',d=>`${format(d.date)}, ${d.wind} knots`).on('click',(_,d)=>update(data.indexOf(d))).on('keydown',(e,d)=>{if(e.key==='Enter'||e.key===' ') {e.preventDefault();update(data.indexOf(d));}});
  slider.max=data.length-1;
  function update(i) {
    const d=data[i]; slider.value=i; label.textContent=format(d.date);
    details.textContent=`${d.lat.toFixed(1)}° N, ${Math.abs(d.lon).toFixed(1)}° W · ${d.wind} knots (≈ ${Math.round(d.wind*1.15078)} mph) · ${d.pressure} mb${d.event==='L'?' · Landfall':''}`;
    points.attr('r',(_,j)=>j===i?9:5).attr('stroke-width',(_,j)=>j===i?3:1);
    chartPoints.attr('r',(_,j)=>j===i?8:5).attr('stroke-width',(_,j)=>j===i?3:1);
  }
  slider.addEventListener('input',()=>update(+slider.value));
  play.addEventListener('click',()=>{if(timer){clearInterval(timer);timer=null;play.textContent='▶ Play';return;} play.textContent='❚❚ Pause';timer=setInterval(()=>{let i=+slider.value;if(i>=data.length-1){clearInterval(timer);timer=null;play.textContent='▶ Play';return;}update(i+1);},550);});
  update(0);
} catch (error) {
  container.append('p').text('The visualization could not load. Please check your internet connection and run this page from a web server.');
  console.error(error);
}
