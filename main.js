import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const mapWidth = 860;
const mapHeight = 360;

const margin = { top: 25, right: 100, bottom: 45, left: 60 };
const width = 860 - margin.left - margin.right;
const height = 450 - margin.top - margin.bottom;

const visSvg = d3.select("#vis")
    .append("svg")
    .attr("width", mapWidth)
    .attr("height", mapHeight);

