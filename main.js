import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const mapWidth = 860;
const mapHeight = 360;

const margin = { top: 25, right: 100, bottom: 45, left: 60 };
const width = 860 - margin.left - margin.right;
const height = 450 - margin.top - margin.bottom;

const perspectives = [
  {
    id: "cmipf",
    label: "CMIPF",
    folder: "frames/cmipf",
    unit: "Cloud and Moisture Imagery reflectance factor [1]"
  },
  {
    id: "radf",
    label: "RadF",
    folder: "frames/radf",
    unit: "Radiance [W m⁻² sr⁻¹ µm⁻¹]"
  },
  {
    id: "achtf",
    label: "ACHTF",
    folder: "frames/achtf",
    unit: "Cloud Top Temp [K]"
  },
  {
    id: "sstf",
    label: "SSTF",
    folder: "frames/sstf",
    unit: "Sea Surface (Skin) Temperature [K]"
  },
  {
    id: "tpw",
    label: "TPW",
    folder: "frames/tpw",
    unit: "Total Precipitable Water [mm]"
  }
];

const days = [270, 271, 272, 273];

let currentPerspective = perspectives[0];
let currentDayIndex = 0;

const select = d3.select("#perspective-select");
const slider = d3.select("#day-slider");
const dayLabel = d3.select("#day-label");
const img = d3.select("#satellite-frame");
const svg = d3.select("#overlay-svg");

select
  .selectAll("option")
  .data(perspectives)
  .enter()
  .append("option")
  .attr("value", d => d.id)
  .text(d => d.label);

slider
  .attr("min", 0)
  .attr("max", days.length - 1)
  .attr("step", 1)
  .property("value", currentDayIndex);

function getFramePath(perspective, day) {
  return `${perspective.folder}/14_${day}.png`;
}

function preloadPerspective(perspective) {
  days.forEach(day => {
    const preloader = new Image();
    preloader.src = getFramePath(perspective, day);
  });
}

function updateOverlay(perspective, day) {
  const hudData = [{ text: `${perspective.id.toUpperCase()}: Day ${day}` }];

  const badge = svg.selectAll("text.hud-badge").data(hudData);

  badge
    .enter()
    .append("text")
    .attr("class", "hud-badge")
    .attr("x", 16)
    .attr("y", 28)
    .merge(badge)
    .text(d => d.text);
}

function renderFrame() {
  const day = days[currentDayIndex];
  const src = getFramePath(currentPerspective, day);

  img.attr("src", src);
  dayLabel.text(`Day ${day} (${currentDayIndex + 1} / ${days.length})`);
  updateOverlay(currentPerspective, day);
}

select.on("change", function () {
  const selectedId = d3.select(this).property("value");
  currentPerspective = perspectives.find(p => p.id === selectedId);
  preloadPerspective(currentPerspective);
  renderFrame();
});

slider.on("input", function () {
  currentDayIndex = +d3.select(this).property("value");
  renderFrame();
});

preloadPerspective(currentPerspective);
renderFrame();