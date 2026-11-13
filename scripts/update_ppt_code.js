const AdmZip = require('adm-zip');
const fs = require('fs');
const { execSync } = require('child_process');

function xmlEscape(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function makeCodeTextBox(codeLines) {
  const pXml = codeLines.map(line => {
    return `<a:p><a:pPr><a:spcAft><a:spcPts val="350"/></a:spcAft><a:defRPr sz="1200" b="0"><a:solidFill><a:srgbClr val="26303D"/></a:solidFill><a:latin typeface="Consolas"/></a:defRPr></a:pPr><a:r><a:t xml:space="preserve">${xmlEscape(line)}</a:t></a:r></a:p>`;
  }).join('');

  return `<p:sp><p:nvSpPr><p:cNvPr id="7" name="TextBox 6"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="594360" y="1097280"/><a:ext cx="10972800" cy="5349240"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square" lIns="73152" rIns="73152" bIns="36576"><a:spAutoFit/></a:bodyPr><a:lstStyle/>${pXml}</p:txBody></p:sp>`;
}

const slide10Code = [
  '<!-- index.html -->',
  '<!DOCTYPE html>',
  '<html lang="en">',
  '<head>',
  '  <meta charset="UTF-8" />',
  '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
  '  <title>Air Quality Monitoring - Real-Time AQI Telemetry</title>',
  '  <script src="https://d3js.org/d3.v7.min.js"></script>',
  '  <style>',
  '    body { font-family: Arial, sans-serif; margin: 24px; color: #243247; }',
  '    .cards { display: flex; gap: 16px; margin: 16px 0; }',
  '    .card { background: #eef5fa; padding: 16px; border-radius: 8px; }',
  '    svg { width: 100%; height: 320px; }',
  '    .bar { fill: #2a69b4; }',
  '    .axis text { font-size: 12px; }',
  '  </style>',
  '</head>',
  '<body>',
  '  <h1>Air Quality Monitoring Telemetry Dashboard</h1>',
  '  <label>Airshed Region:',
  '    <select id="regionFilter">',
  '      <option value="All">All Airsheds (Overview)</option>',
  '      <option value="South">South India Grid (50 Nodes)</option>',
  '      <option value="North">Northern Plains (8 Nodes)</option>',
  '      <option value="West">Western Belt (6 Nodes)</option>',
  '    </select>',
  '  </label>',
  '  <div class="cards" id="kpis"></div>',
  '  <svg id="chart" role="img" aria-label="D3 City AQI Bar Chart"></svg>',
  '  <script>',
  '    const data = [',
  '      {id:"STN-DEL-01", city:"Delhi", region:"North", aqi:342, pm25:198.5},',
  '      {id:"STN-HYD-01", city:"Hyderabad", region:"South", aqi:148, pm25:58.2},',
  '      {id:"STN-BLR-01", city:"Bengaluru", region:"South", aqi:82, pm25:29.4},',
  '      {id:"STN-CHN-01", city:"Chennai", region:"South", aqi:94, pm25:34.1},',
  '      {id:"STN-KOC-01", city:"Kochi", region:"South", aqi:62, pm25:21.0},',
  '      {id:"STN-VJA-01", city:"Vijayawada", region:"South", aqi:155, pm25:64.0},',
  '      {id:"STN-MUM-01", city:"Mumbai", region:"West", aqi:185, pm25:78.6},',
  '      {id:"STN-KOL-01", city:"Kolkata", region:"North", aqi:265, pm25:128.4},',
  '      {id:"STN-VIS-01", city:"Visakhapatnam", region:"South", aqi:172, pm25:71.5},',
  '      {id:"STN-COI-01", city:"Coimbatore", region:"South", aqi:74, pm25:26.8}',
  '    ];'
];

const slide11Code = [
  '    const svg = d3.select("#chart");',
  '    const width = 900, height = 320;',
  '    const margin = {top: 25, right: 25, bottom: 55, left: 55};',
  '',
  '    function update() {',
  '      const selected = document.querySelector("#regionFilter").value;',
  '      const filtered = selected === "All"',
  '        ? data : data.filter(d => d.region === selected);',
  '',
  '      const meanAQI = d3.mean(filtered, d => d.aqi) || 0;',
  '      const meanPM25 = d3.mean(filtered, d => d.pm25) || 0;',
  '      const severeCount = filtered.filter(d => d.aqi > 200).length;',
  '',
  '      const kpiData = [',
  '        ["Active CAAQMS Nodes", filtered.length],',
  '        ["Regional Mean AQI", meanAQI.toFixed(1)],',
  '        ["Severe Nodes (>200)", severeCount],',
  '        ["Mean PM2.5 (µg/m³)", meanPM25.toFixed(1)]',
  '      ];',
  '',
  '      d3.select("#kpis").selectAll(".card").remove();',
  '      d3.select("#kpis").selectAll(".card")',
  '        .data(kpiData).join("div")',
  '        .attr("class", "card")',
  '        .html(d => `<strong>${d[0]}</strong><br>${d[1]}`);',
  '',
  '      // Group records by city and calculate average AQI',
  '      const grouped = d3.rollups(filtered,',
  '        v => d3.mean(v, d => d.aqi), d => d.city)',
  '        .map(([city, aqi]) => ({city, aqi}));',
  '',
  '      drawChart(grouped);',
  '    }',
  '',
  '    document.querySelector("#regionFilter")',
  '      .addEventListener("change", update);'
];

const slide12Code = [
  '    function drawChart(chartData) {',
  '      const innerW = width - margin.left - margin.right;',
  '      const innerH = height - margin.top - margin.bottom;',
  '      svg.attr("viewBox", `0 0 ${width} ${height}`);',
  '      svg.selectAll("*").remove();',
  '',
  '      const g = svg.append("g")',
  '        .attr("transform", `translate(${margin.left},${margin.top})`);',
  '',
  '      const x = d3.scaleBand()',
  '        .domain(chartData.map(d => d.city))',
  '        .range([0, innerW]).padding(0.25);',
  '',
  '      const y = d3.scaleLinear()',
  '        .domain([0, 400]).range([innerH, 0]);',
  '',
  '      // Render X and Y axes',
  '      g.append("g").attr("transform", `translate(0,${innerH})`)',
  '        .call(d3.axisBottom(x));',
  '      g.append("g").call(d3.axisLeft(y));',
  '',
  '      // CPCB Risk Color Coding: Good(<=100), Moderate(<=200), Severe(>200)',
  '      const getColor = aqi => aqi <= 100 ? "#22c55e" : aqi <= 200 ? "#f59e0b" : "#ef4444";',
  '',
  '      // Render data bars with dynamic CPCB color fill',
  '      g.selectAll(".bar").data(chartData).join("rect")',
  '        .attr("class", "bar")',
  '        .attr("x", d => x(d.city))',
  '        .attr("y", d => y(d.aqi))',
  '        .attr("width", x.bandwidth())',
  '        .attr("height", d => innerH - y(d.aqi))',
  '        .attr("fill", d => getColor(d.aqi))',
  '        .append("title")',
  '        .text(d => `${d.city}: AQI ${Math.round(d.aqi)}`);',
  '',
  '      // Value labels above bars',
  '      g.selectAll(".value").data(chartData).join("text")',
  '        .attr("x", d => x(d.city) + x.bandwidth()/2)',
  '        .attr("y", d => y(d.aqi) - 6)',
  '        .attr("text-anchor", "middle")',
  '        .text(d => Math.round(d.aqi));',
  '    }',
  '',
  '    update();',
  '  </script>',
  '</body>',
  '</html>'
];

const zip = new AdmZip('Air_Quality_Monitoring_Presentation.pptx');

// Update Slide 10
let s10 = zip.readAsText('ppt/slides/slide10.xml');
s10 = s10.replace(/D3\.js Complete Code \(1\/3\):[^\<]*/, 'D3.js Complete Code (1/3): HTML Structure &amp; Telemetry Data');
s10 = s10.replace(/<p:sp>[\s\S]*?name="TextBox 6"[\s\S]*?<\/p:sp>/, makeCodeTextBox(slide10Code));
zip.updateFile('ppt/slides/slide10.xml', Buffer.from(s10, 'utf8'));

// Update Slide 11
let s11 = zip.readAsText('ppt/slides/slide11.xml');
s11 = s11.replace(/D3\.js Complete Code \(2\/3\):[^\<]*/, 'D3.js Complete Code (2/3): D3 Aggregation &amp; Telemetry KPIs');
s11 = s11.replace(/<p:sp>[\s\S]*?name="TextBox 6"[\s\S]*?<\/p:sp>/, makeCodeTextBox(slide11Code));
zip.updateFile('ppt/slides/slide11.xml', Buffer.from(s11, 'utf8'));

// Update Slide 12
let s12 = zip.readAsText('ppt/slides/slide12.xml');
s12 = s12.replace(/D3\.js Complete Code \(3\/3\):[^\<]*/, 'D3.js Complete Code (3/3): D3 Chart Rendering &amp; CPCB Colors');
s12 = s12.replace(/<p:sp>[\s\S]*?name="TextBox 6"[\s\S]*?<\/p:sp>/, makeCodeTextBox(slide12Code));
zip.updateFile('ppt/slides/slide12.xml', Buffer.from(s12, 'utf8'));

zip.writeZip('Air_Quality_Monitoring_Presentation.pptx');
console.log('Successfully updated Air_Quality_Monitoring_Presentation.pptx!');

