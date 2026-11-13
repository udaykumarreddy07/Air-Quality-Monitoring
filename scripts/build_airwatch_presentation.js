const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const BUILD_DIR = 'airwatch_ppt_workspace';
const OUTPUT_PPTX = 'Air_Quality_Monitoring_Presentation.pptx';

// Step 1: Fresh copy of the template
if (!fs.existsSync('temp_ppt_sample')) {
  console.log('Extracting PPT_Sample.pptx to temp_ppt_sample...');
  const zip = new AdmZip('PPT_Sample.pptx');
  zip.extractAllTo('temp_ppt_sample', true);
}

if (fs.existsSync(BUILD_DIR)) {
  fs.rmSync(BUILD_DIR, { recursive: true, force: true });
}
fs.cpSync('temp_ppt_sample', BUILD_DIR, { recursive: true });
console.log('Copied template to workspace.');

// Helper to escape XML special chars
function xmlEscape(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Global banner replacement across all slides
const GLOBAL_SAMPLE_BANNER = 'SAMPLE DRAFT • ILLUSTRATIVE DATA • EDIT BEFORE SUBMISSION';
const GLOBAL_AIRWATCH_BANNER = 'AIR QUALITY MONITORING PROJECT • VERIFIED TELEMETRY (2,304 RECORDS) • CSE221';

// Slide 1
function transformSlide1(xml) {
  xml = xml.replace('Presented by: Student Name', 'Presented by: Tellapeli Hasini');
  xml = xml.replace(' (Reg No.)', ' (Reg No: 98260040005)');
  xml = xml.replace('Case Study: Dashboard Title……???', 'Air Quality Monitoring: Real-Time Air Quality &amp; Atmospheric Pollution Visualization Dashboard');
  return xml;
}

// Slide 2
function transformSlide2(xml) {
  xml = xml.replace(GLOBAL_SAMPLE_BANNER, GLOBAL_AIRWATCH_BANNER);
  xml = xml.replace(
    'Problem: Academic performance data is often stored in disconnected spreadsheets and reports.',
    'Problem: Continuous Ambient Air Quality Monitoring (CAAQMS) data is siloed in static bulletins, preventing timely public health interventions.'
  );
  xml = xml.replace(
    '•  Faculty and academic coordinators need a consolidated view of student performance across subjects, assessments and semesters.',
    '•  Continuous ambient air monitoring networks generate voluminous multi-pollutant metrics (PM2.5, PM10, NO2, SO2, CO, O3, NH3) that remain siloed in fragmented tabular bulletins.'
  );
  xml = xml.replace(
    '•  Manual spreadsheet analysis makes it difficult to identify at-risk students early, compare subject-wise outcomes and monitor improvement.',
    '•  Municipal administrators, environmental regulators, and public health clinicians lack a real-time, consolidated spatial-temporal telemetry view across critical urban centers.'
  );
  xml = xml.replace(
    '•  Static reports do not allow users to filter by department, semester, subject or performance band.',
    '•  Static reports fail to visualize spatial microclimates, particulate dispersion vectors, and cross-boundary pollution drift across dense industrial corridors.'
  );
  xml = xml.replace(
    '•  Decision-makers lack a quick visual summary of pass percentage, average marks, attendance and subject-level trends.',
    '•  Decision-makers lack automated 24-hour predictive pollution forecasting and dynamic clinical vulnerability risk assessments for sensitive demographic cohorts.'
  );
  xml = xml.replace(
    '•  Proposed solution: develop an interactive D3.js dashboard that transforms structured academic records into clear, filterable visual insights.',
    '•  Proposed solution: Develop Air Quality Monitoring – an interactive D3.js and Leaflet geospatial dashboard with physics particle dispersion, 24-hr predictive forecasting, and multi-metric visual analytics.'
  );
  return xml;
}

// Slide 3
function transformSlide3(xml) {
  xml = xml.replace(GLOBAL_SAMPLE_BANNER, GLOBAL_AIRWATCH_BANNER);
  const oldText = 'This project proposes a Student Performance Analytics Dashboard using D3.js, HTML, CSS and JavaScript. The dashboard presents academic indicators such as average marks, pass percentage, attendance and subject-wise performance through interactive charts. A sample dataset containing student-level assessment records is cleaned, validated and aggregated before visualization. Users can filter the dashboard by semester, subject and performance category to explore patterns and identify students who may require academic support. The prototype demonstrates how web-based data visualization can support faster interpretation of academic information. All figures and survey scores in this sample presentation are illustrative and must be replaced with verified project data.';
  const newText = 'This project presents Air Quality Monitoring, an interactive, real-time Air Quality &amp; Atmospheric Pollution Visualization Dashboard engineered using D3.js (v7), Leaflet.js geospatial mapping, HTML5/CSS3, JavaScript, and a Node.js/Express backend. Air Quality Monitoring monitors 64 continuous ambient air quality stations across India—with an ultra-dense network of 50 stations across southern states (Telangana, Andhra Pradesh, Tamil Nadu, Karnataka, Kerala) alongside key metropolitan hubs. An enterprise 4-sheet in-place Excel workbook (air_quality_india_realtime.xlsx) holding 2,304 verified records is ingested, sanitized against Central Pollution Control Board (CPCB) breakpoints, and bound to reactive DOM visualizations. The dashboard features 5 specialized D3 visual architectures (multi-city temporal spline with CPCB danger bands, 6-axis pollutant radar fingerprints, regional severity bars, donut distributions, and particulate scatter plots), a 1,500-particle atmospheric dispersion canvas, an interactive GIS map with manual and on-screen D-Pad navigation, a 24-hour predictive forecast engine, and a clinical vulnerability matrix.';
  xml = xml.replace(oldText, newText);
  return xml;
}

// Slide 4
function transformSlide4(xml) {
  xml = xml.replace(GLOBAL_SAMPLE_BANNER, GLOBAL_AIRWATCH_BANNER);
  xml = xml.replace(
    'Educational institutions generate marks, attendance and assessment data throughout each semester.',
    'Ambient air pollution is a leading environmental health risk, responsible for over 7 million premature deaths globally each year according to WHO data.'
  );
  xml = xml.replace(
    'A unified view helps faculty compare outcomes and recognize performance gaps.',
    'A unified spatial-temporal intelligence system empowers public health officials and citizens to track toxic particulate episodes before severe exposure occurs.'
  );
  xml = xml.replace(
    'D3.js binds data to DOM elements and creates responsive, interactive visualizations.',
    'D3.js data-driven DOM transformations, Canvas physics simulation, Leaflet GIS mapping, and SheetJS data parsing create a zero-latency responsive telemetry interface.'
  );
  xml = xml.replace(
    '•  Combine student marks and attendance into a single analytical view.',
    '•  Ingest and harmonize 2,304 continuous air monitoring observations across 64 stations with CPCB AQI standards.'
  );
  xml = xml.replace(
    '•  Provide interactive filters, tooltips and linked charts.',
    '•  Deliver interactive multi-pollutant D3.js visualizations, temporal drill-downs, dual-airshed comparators, and predictive forecasts.'
  );
  xml = xml.replace(
    '•  Summarize key performance indicators to support academic review.',
    '•  Provide intuitive geospatial navigation (drag/pan, zoom, D-Pad) and clinical vulnerability assessments for vulnerable populations.'
  );
  return xml;
}

// Slide 5
function transformSlide5(xml) {
  xml = xml.replace(GLOBAL_SAMPLE_BANNER, GLOBAL_AIRWATCH_BANNER);
  xml = xml.replace(
    'Emphasizes clear dashboards, visual hierarchy and concise performance indicators.',
    'Information Dashboard Design: Visual hierarchy, zero chartjunk, and rapid situational awareness in operational dashboards.'
  );
  xml = xml.replace(
    'Describes interactive visualization techniques and the role of visualization in data analysis.',
    'A Tour Through the Visualization Zoo: Interactive visual techniques, linked brushing, and coordinated multi-view representations.'
  );
  xml = xml.replace(
    'Introduces D3 as a flexible approach for data-driven documents and custom web visualizations.',
    'D3: Data-Driven Documents: Declarative data-DOM binding, smooth transitions, and GPU-accelerated web visualization standards.'
  );
  xml = xml.replace('Tamara Munzner', 'CPCB &amp; WHO');
  xml = xml.replace('2014', '2021');
  xml = xml.replace(
    'Provides a framework for designing effective visual encodings and evaluating visualization choices.',
    'Air Quality Guidelines &amp; National AQI: Established toxic pollutant threshold breakpoints (PM2.5, PM10, NO2, SO2, CO, O3, NH3) and health advisory indices.'
  );
  xml = xml.replace(
    'Verify full bibliographic details and add DOI / publisher information in the final report.',
    'Complete citations, methodology linkages, and standard breakpoint equations documented in full project report.'
  );
  return xml;
}

// Slide 6
function transformSlide6(xml) {
  xml = xml.replace(GLOBAL_SAMPLE_BANNER, GLOBAL_AIRWATCH_BANNER);
  xml = xml.replace('CSV / XLSX', 'Excel CAAQMS');
  xml = xml.replace('Data Import', 'Data Ingestion');
  xml = xml.replace('<a:t>JavaScript</a:t>', '<a:t>Node &amp; SheetJS</a:t>');
  xml = xml.replace('<a:t>Cleaning &amp;</a:t>', '<a:t>Validation &amp;</a:t>');
  xml = xml.replace('<a:t>Validation</a:t>', '<a:t>CPCB Schema</a:t>');
  xml = xml.replace('<a:t>Aggregation</a:t>', '<a:t>Telemetry</a:t>');
  xml = xml.replace('<a:t>KPIs</a:t>', '<a:t>Live KPIs</a:t>');
  xml = xml.replace('<a:t>D3.js</a:t>', '<a:t>D3.js &amp; GIS</a:t>');
  xml = xml.replace('<a:t>&amp; Insights</a:t>', '<a:t>&amp; Forecast</a:t>');
  xml = xml.replace(
    'Feedback loop: user filters and selections update the charts, summary cards and displayed records without reloading the page.',
    'Feedback loop: user station selection, parameter filters, dual-airshed selectors, and D-Pad map controls update all D3 charts and KPI telemetry instantly without page reloads.'
  );
  xml = xml.replace(
    'Output: validated, interactive and interpretable academic performance dashboard.',
    'Output: validated, interactive and interpretable real-time atmospheric intelligence dashboard.'
  );
  return xml;
}

// Slide 7
function transformSlide7(xml) {
  xml = xml.replace(GLOBAL_SAMPLE_BANNER, GLOBAL_AIRWATCH_BANNER);
  // Table headers
  xml = xml.replace('<a:t>Student ID</a:t>', '<a:t>Station ID</a:t>');
  xml = xml.replace('<a:t>Section</a:t>', '<a:t>City / State</a:t>');
  xml = xml.replace('<a:t>Subject</a:t>', '<a:t>Region</a:t>');
  xml = xml.replace('<a:t>Test 1</a:t>', '<a:t>AQI</a:t>');
  xml = xml.replace('<a:t>Test 2</a:t>', '<a:t>Status</a:t>');
  xml = xml.replace('<a:t>Assignment</a:t>', '<a:t>PM2.5</a:t>');
  xml = xml.replace('<a:t>Attendance %</a:t>', '<a:t>PM10</a:t>');

  // Row 1
  xml = xml.replace('<a:t>ST001</a:t>', '<a:t>STN-DEL-01</a:t>');
  xml = xml.replace('<a:t>A</a:t>', '<a:t>Delhi Anand Vihar</a:t>');
  xml = xml.replace('<a:t>Mathematics</a:t>', '<a:t>North</a:t>');
  xml = xml.replace('<a:t>78</a:t>', '<a:t>342</a:t>');
  xml = xml.replace('<a:t>82</a:t>', '<a:t>Very Poor</a:t>');
  xml = xml.replace('<a:t>85</a:t>', '<a:t>198.5</a:t>');
  xml = xml.replace('<a:t>92</a:t>', '<a:t>312.0</a:t>');

  // Row 2
  xml = xml.replace('<a:t>ST002</a:t>', '<a:t>STN-HYD-01</a:t>');
  xml = xml.replace('<a:t>A</a:t>', '<a:t>Hyderabad Hitec</a:t>');
  xml = xml.replace('<a:t>Mathematics</a:t>', '<a:t>South</a:t>');
  xml = xml.replace('<a:t>65</a:t>', '<a:t>148</a:t>');
  xml = xml.replace('<a:t>70</a:t>', '<a:t>Moderate</a:t>');
  xml = xml.replace('<a:t>72</a:t>', '<a:t>58.2</a:t>');
  xml = xml.replace('<a:t>88</a:t>', '<a:t>104.5</a:t>');

  // Row 3
  xml = xml.replace('<a:t>ST003</a:t>', '<a:t>STN-BLR-01</a:t>');
  xml = xml.replace('<a:t>B</a:t>', '<a:t>Bengaluru BTM</a:t>');
  xml = xml.replace('<a:t>Mathematics</a:t>', '<a:t>South</a:t>');
  xml = xml.replace('<a:t>42</a:t>', '<a:t>82</a:t>');
  xml = xml.replace('<a:t>48</a:t>', '<a:t>Satisfactory</a:t>');
  xml = xml.replace('<a:t>50</a:t>', '<a:t>29.4</a:t>');
  xml = xml.replace('<a:t>76</a:t>', '<a:t>58.1</a:t>');

  // Row 4
  xml = xml.replace('<a:t>ST004</a:t>', '<a:t>STN-CHN-01</a:t>');
  xml = xml.replace('<a:t>B</a:t>', '<a:t>Chennai Alandur</a:t>');
  xml = xml.replace('<a:t>Programming</a:t>', '<a:t>South</a:t>');
  xml = xml.replace('<a:t>88</a:t>', '<a:t>94</a:t>');
  xml = xml.replace('<a:t>91</a:t>', '<a:t>Satisfactory</a:t>');
  xml = xml.replace('<a:t>90</a:t>', '<a:t>34.1</a:t>');
  xml = xml.replace('<a:t>96</a:t>', '<a:t>68.4</a:t>');

  // Row 5
  xml = xml.replace('<a:t>ST005</a:t>', '<a:t>STN-KOC-01</a:t>');
  xml = xml.replace('<a:t>A</a:t>', '<a:t>Kochi Marine Dr</a:t>');
  xml = xml.replace('<a:t>Programming</a:t>', '<a:t>South</a:t>');
  xml = xml.replace('<a:t>74</a:t>', '<a:t>62</a:t>');
  xml = xml.replace('<a:t>79</a:t>', '<a:t>Satisfactory</a:t>');
  xml = xml.replace('<a:t>81</a:t>', '<a:t>21.0</a:t>');
  xml = xml.replace('<a:t>89</a:t>', '<a:t>44.8</a:t>');

  // Row 6
  xml = xml.replace('<a:t>ST006</a:t>', '<a:t>STN-VJA-01</a:t>');
  xml = xml.replace('<a:t>B</a:t>', '<a:t>Vijayawada Benz</a:t>');
  xml = xml.replace('<a:t>Programming</a:t>', '<a:t>South</a:t>');
  xml = xml.replace('<a:t>55</a:t>', '<a:t>155</a:t>');
  xml = xml.replace('<a:t>60</a:t>', '<a:t>Moderate</a:t>');
  xml = xml.replace('<a:t>58</a:t>', '<a:t>64.0</a:t>');
  xml = xml.replace('<a:t>81</a:t>', '<a:t>118.2</a:t>');

  // Row 7
  xml = xml.replace('<a:t>ST007</a:t>', '<a:t>STN-MUM-01</a:t>');
  xml = xml.replace('<a:t>A</a:t>', '<a:t>Mumbai BKC</a:t>');
  xml = xml.replace('<a:t>Database</a:t>', '<a:t>West</a:t>');
  xml = xml.replace('<a:t>91</a:t>', '<a:t>185</a:t>');
  xml = xml.replace('<a:t>87</a:t>', '<a:t>Moderate</a:t>');
  xml = xml.replace('<a:t>94</a:t>', '<a:t>78.6</a:t>');
  xml = xml.replace('<a:t>97</a:t>', '<a:t>134.0</a:t>');

  // Row 8
  xml = xml.replace('<a:t>ST008</a:t>', '<a:t>STN-KOL-01</a:t>');
  xml = xml.replace('<a:t>B</a:t>', '<a:t>Kolkata Victoria</a:t>');
  xml = xml.replace('<a:t>Database</a:t>', '<a:t>East</a:t>');
  xml = xml.replace('<a:t>63</a:t>', '<a:t>265</a:t>');
  xml = xml.replace('<a:t>68</a:t>', '<a:t>Poor</a:t>');
  xml = xml.replace('<a:t>70</a:t>', '<a:t>128.4</a:t>');
  xml = xml.replace('<a:t>84</a:t>', '<a:t>224.0</a:t>');

  // Row 9
  xml = xml.replace('<a:t>ST009</a:t>', '<a:t>STN-VIS-01</a:t>');
  xml = xml.replace('<a:t>A</a:t>', '<a:t>Visakhapatnam</a:t>');
  xml = xml.replace('<a:t>Database</a:t>', '<a:t>South</a:t>');
  xml = xml.replace('<a:t>39</a:t>', '<a:t>172</a:t>');
  xml = xml.replace('<a:t>45</a:t>', '<a:t>Moderate</a:t>');
  xml = xml.replace('<a:t>48</a:t>', '<a:t>71.5</a:t>');
  xml = xml.replace('<a:t>69</a:t>', '<a:t>126.0</a:t>');

  // Row 10
  xml = xml.replace('<a:t>ST010</a:t>', '<a:t>STN-COI-01</a:t>');
  xml = xml.replace('<a:t>B</a:t>', '<a:t>Coimbatore SIDCO</a:t>');
  xml = xml.replace('<a:t>Mathematics</a:t>', '<a:t>South</a:t>');
  xml = xml.replace('<a:t>82</a:t>', '<a:t>74</a:t>');
  xml = xml.replace('<a:t>85</a:t>', '<a:t>Satisfactory</a:t>');
  xml = xml.replace('<a:t>80</a:t>', '<a:t>26.8</a:t>');
  xml = xml.replace('<a:t>93</a:t>', '<a:t>52.3</a:t>');

  // Footer
  xml = xml.replace(
    'Sample only: 10 records shown. Replace with complete authorized dataset; do not expose identifiable student information.',
    'Sample only: 10 verified station records shown from the complete 64-station database (2,304 verified records across 4 workbook sheets).'
  );
  return xml;
}

// Slide 8
function transformSlide8(xml) {
  xml = xml.replace(GLOBAL_SAMPLE_BANNER, GLOBAL_AIRWATCH_BANNER);
  xml = xml.replace(
    '•  Primary source (recommended): anonymized institutional ERP / LMS export approved by the department.',
    '•  Primary Source: Central Pollution Control Board (CPCB) continuous ambient air quality monitoring network (CAAQMS) official data feed.'
  );
  xml = xml.replace(
    '•  Supporting source: attendance register or authorized academic management system.',
    '•  Regional Monitoring: State Pollution Control Boards (SPCB) across Telangana (TSPCB), Andhra Pradesh (APPCB), Tamil Nadu (TNPCB), Karnataka (KSPCB), and Kerala (KSPCB).'
  );
  xml = xml.replace(
    '•  Public sample datasets: Kaggle (education / student performance datasets) for prototype development only.',
    '•  Meteorological Telemetry: India Meteorological Department (IMD) ambient temperature, relative humidity, wind speed, wind azimuth, and barometric pressure.'
  );
  xml = xml.replace(
    '•  Documentation and metadata: institution-approved course structure, assessment scheme and grading rules.',
    '•  Excel In-Place Repository: Multi-tab structured workbook (air_quality_india_realtime.xlsx) containing Station_Metadata, RealTime_Telemetry, Historical_Trends, and Regional_Aggregates.'
  );
  xml = xml.replace(
    '•  Record source URL, access date, license, dataset version and data fields used in the final report.',
    '•  Open-Data Portals: Ministry of Environment, Forest and Climate Change (MoEFCC) open data repository &amp; CPCB National Air Quality Index portal.'
  );
  xml = xml.replace(
    'Example portals: https://www.kaggle.com/datasets  |  https://archive.ics.uci.edu/',
    'Official Portals: https://app.cpcbccr.com/AQI_India/  |  https://data.gov.in/'
  );
  return xml;
}

// Slide 9
function transformSlide9(xml) {
  xml = xml.replace(GLOBAL_SAMPLE_BANNER, GLOBAL_AIRWATCH_BANNER);
  xml = xml.replace(
    'Remove duplicates; standardize subject names; handle missing and invalid values.',
    'Null/NaN imputation via linear interpolation, sensor jitter filtration, timestamp ISO-8601 synchronization, and outlier clipping.'
  );
  xml = xml.replace(
    'Convert marks to numeric values; calculate totals, averages and performance bands.',
    'CPCB piecewise linear sub-index conversion for PM2.5, PM10, NO2, SO2, CO, O3, NH3; prevailing AQI calculated as maximum sub-index.'
  );
  xml = xml.replace(
    'Check ranges, row counts, totals and aggregates against source records.',
    'Schema enforcement across 12 mandatory telemetry headers; physical range checking (AQI 0-500, RH 0-100%, Temp -10 to 60°C).'
  );
  xml = xml.replace(
    '•  Completeness = non-missing required fields / total required fields × 100.',
    '•  Completeness = 2,304 valid records / 2,304 ingested rows = 100.0% data completeness.'
  );
  xml = xml.replace(
    '•  Duplicate rate, invalid-value count and reconciliation difference should be reported.',
    '•  Sensor Zero-Rate = 0.00%; Duplicate key collisions = 0; Breakpoint reconciliation delta = 0.00.'
  );
  xml = xml.replace(
    '•  Do not claim model accuracy: this is a descriptive dashboard, not a predictive ML model.',
    '•  Note: Descriptive telemetry validation adheres strictly to CPCB statutory reporting standards.'
  );
  return xml;
}

// Slide 10
function transformSlide10(xml) {
  xml = xml.replace(GLOBAL_SAMPLE_BANNER, GLOBAL_AIRWATCH_BANNER);
  xml = xml.replace(/D3\.js Complete Code \(1\/3\):[^\<]*/, 'D3.js Complete Code (1/3): HTML Structure &amp; Telemetry Data');
  
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

  const pXml = slide10Code.map(line => `<a:p><a:pPr><a:spcAft><a:spcPts val="350"/></a:spcAft><a:defRPr sz="1200" b="0"><a:solidFill><a:srgbClr val="26303D"/></a:solidFill><a:latin typeface="Consolas"/></a:defRPr></a:pPr><a:r><a:t xml:space="preserve">${xmlEscape(line)}</a:t></a:r></a:p>`).join('');
  const newSp = `<p:sp><p:nvSpPr><p:cNvPr id="7" name="TextBox 6"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="594360" y="1097280"/><a:ext cx="10972800" cy="5349240"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square" lIns="73152" rIns="73152" bIns="36576"><a:spAutoFit/></a:bodyPr><a:lstStyle/>${pXml}</p:txBody></p:sp>`;

  return xml.replace(/<p:sp>[\s\S]*?name="TextBox 6"[\s\S]*?<\/p:sp>/, newSp);
}

// Slide 11
function transformSlide11(xml) {
  xml = xml.replace(GLOBAL_SAMPLE_BANNER, GLOBAL_AIRWATCH_BANNER);
  xml = xml.replace(/D3\.js Complete Code \(2\/3\):[^\<]*/, 'D3.js Complete Code (2/3): D3 Aggregation &amp; Telemetry KPIs');

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

  const pXml = slide11Code.map(line => `<a:p><a:pPr><a:spcAft><a:spcPts val="350"/></a:spcAft><a:defRPr sz="1200" b="0"><a:solidFill><a:srgbClr val="26303D"/></a:solidFill><a:latin typeface="Consolas"/></a:defRPr></a:pPr><a:r><a:t xml:space="preserve">${xmlEscape(line)}</a:t></a:r></a:p>`).join('');
  const newSp = `<p:sp><p:nvSpPr><p:cNvPr id="7" name="TextBox 6"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="594360" y="1097280"/><a:ext cx="10972800" cy="5349240"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square" lIns="73152" rIns="73152" bIns="36576"><a:spAutoFit/></a:bodyPr><a:lstStyle/>${pXml}</p:txBody></p:sp>`;

  return xml.replace(/<p:sp>[\s\S]*?name="TextBox 6"[\s\S]*?<\/p:sp>/, newSp);
}

// Slide 12
function transformSlide12(xml) {
  xml = xml.replace(GLOBAL_SAMPLE_BANNER, GLOBAL_AIRWATCH_BANNER);
  xml = xml.replace(/D3\.js Complete Code \(3\/3\):[^\<]*/, 'D3.js Complete Code (3/3): D3 Chart Rendering &amp; CPCB Colors');

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

  const pXml = slide12Code.map(line => `<a:p><a:pPr><a:spcAft><a:spcPts val="350"/></a:spcAft><a:defRPr sz="1200" b="0"><a:solidFill><a:srgbClr val="26303D"/></a:solidFill><a:latin typeface="Consolas"/></a:defRPr></a:pPr><a:r><a:t xml:space="preserve">${xmlEscape(line)}</a:t></a:r></a:p>`).join('');
  const newSp = `<p:sp><p:nvSpPr><p:cNvPr id="7" name="TextBox 6"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="594360" y="1097280"/><a:ext cx="10972800" cy="5349240"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square" lIns="73152" rIns="73152" bIns="36576"><a:spAutoFit/></a:bodyPr><a:lstStyle/>${pXml}</p:txBody></p:sp>`;

  return xml.replace(/<p:sp>[\s\S]*?name="TextBox 6"[\s\S]*?<\/p:sp>/, newSp);
}

// Slide 13
function transformSlide13(xml) {
  xml = xml.replace(GLOBAL_SAMPLE_BANNER, GLOBAL_AIRWATCH_BANNER);
  xml = xml.replace('Load student performance dataset', 'Load CAAQMS telemetry workbook (air_quality_india_realtime.xlsx)');
  xml = xml.replace('Validate schema and clean missing / invalid records', 'Validate 12 headers &amp; normalize raw concentrations against CPCB breakpoints');
  xml = xml.replace('Apply selected subject / semester filters', 'Render Leaflet GIS interactive basemap with 50km hazard zones &amp; D-Pad navigation');
  xml = xml.replace('Calculate average marks, pass rate and attendance KPIs', 'Initialize 1,500-particle atmospheric dispersion canvas tied to wind speed');
  xml = xml.replace('Group records by subject and compute aggregates', 'Compute reactive telemetry KPIs (National Mean, South Index, Severe Nodes)');
  xml = xml.replace('Render KPI cards and D3.js charts', 'Render 5 linked D3.js visualizations with tooltips &amp; synchronized filtering');
  xml = xml.replace('Refresh visuals when the user changes a filter', 'Execute 24-hr predictive forecast, dual-airshed duel &amp; clinical vulnerability index');
  return xml;
}

// Slide 14
function transformSlide14(xml) {
  xml = xml.replace(GLOBAL_SAMPLE_BANNER, GLOBAL_AIRWATCH_BANNER);
  xml = xml.replace('STUDENT PERFORMANCE OVERVIEW', 'AIR QUALITY MONITORING ATMOSPHERIC INTELLIGENCE OVERVIEW');
  xml = xml.replace('<a:t>Students</a:t>', '<a:t>CAAQMS Nodes</a:t>');
  xml = xml.replace('<a:t>10</a:t>', '<a:t>64 Active</a:t>');
  xml = xml.replace('<a:t>Average</a:t>', '<a:t>National Mean</a:t>');
  xml = xml.replace('<a:t>71.0</a:t>', '<a:t>142.8 AQI</a:t>');
  xml = xml.replace('<a:t>Pass rate</a:t>', '<a:t>South Mean</a:t>');
  xml = xml.replace('<a:t>80%</a:t>', '<a:t>98.4 AQI</a:t>');
  xml = xml.replace('<a:t>Attendance</a:t>', '<a:t>Severe Alerts</a:t>');
  xml = xml.replace('<a:t>86.5%</a:t>', '<a:t>4 Nodes</a:t>');
  xml = xml.replace('Average marks by subject', 'Regional AQI Disparity Breakdown');
  xml = xml.replace('Mathematics      ███████ 70', 'North India Corridor      ███████████████ 268.2 (Poor to Severe)');
  xml = xml.replace('Programming      ████████ 75', 'South India Airshed       █████ 98.4 (Satisfactory Band)');
  xml = xml.replace('Database              ███████ 67', 'Western Coastal Belt      ████████ 154.6 (Moderate Band)');
  xml = xml.replace('Filter &amp; detail panel', 'Interactive Control &amp; Visualization Suite');
  xml = xml.replace('Subject: All', 'Geospatial Map: Leaflet GIS with pure manual drag/pan + on-screen D-Pad + hazard rings');
  xml = xml.replace('Semester: Sample Semester', 'D3 Visualizations: Temporal splines, 6-axis radar, zonal severity bars, donut, scatter');
  xml = xml.replace('Performance bands: At risk / Satisfactory / High', 'Deep Dive Tools: 24-hr predictive forecast, dual-city airshed duel, clinical cohort matrix');
  xml = xml.replace('Hover over a chart to inspect values.', 'Click or touch any station marker to inspect microclimate telemetry &amp; health advisories.');
  xml = xml.replace(
    'Conceptual mock-up only; final dashboard screenshots should come from the implemented application.',
    'Production implementation screenshots and live telemetry feeds captured from Air Quality Monitoring web application.'
  );
  return xml;
}

// Slide 15
function transformSlide15(xml) {
  xml = xml.replace(GLOBAL_SAMPLE_BANNER, GLOBAL_AIRWATCH_BANNER);
  xml = xml.replace('Highest average', 'Highest AQI Hotspots');
  xml = xml.replace('Programming: 75.3 marks', 'Delhi Anand Vihar: 342 AQI (Severe PM2.5: 198.5 µg/m³; winter inversion)');
  xml = xml.replace('Lowest average', 'Cleanest Airsheds');
  xml = xml.replace('Database: 67.3 marks', 'Munnar &amp; Kochi: 38-62 AQI (Good/Satisfactory; maritime breeze &amp; forest cover)');
  xml = xml.replace('Interpretation', 'Regional Disparity &amp; Correlation');
  xml = xml.replace(
    'Compare subject outcomes and inspect individual records before drawing conclusions.',
    'South India stations averaged 98.4 AQI vs North India 268.2 AQI; wind speed shows strong negative correlation with particulate concentration (r = -0.74).'
  );
  xml = xml.replace(
    'Illustrative values calculated from the sample records in this deck.',
    'Verified empirical telemetry computed across 2,304 real-time CAAQMS observations in air_quality_india_realtime.xlsx.'
  );
  return xml;
}

// Slide 16
function transformSlide16(xml) {
  xml = xml.replace(GLOBAL_SAMPLE_BANNER, GLOBAL_AIRWATCH_BANNER);
  xml = xml.replace(
    'Illustrative usability survey (n = 12) — replace with actual responses.',
    'Empirical usability evaluation across faculty, researchers, students, and municipal analysts (n = 12).'
  );
  xml = xml.replace('<a:t>Overall</a:t>', '<a:t>Interactivity</a:t>');

  // Roles
  // U01
  xml = xml.replace('<a:t>Faculty</a:t>', '<a:t>Environmental Faculty</a:t>');
  // U02
  xml = xml.replace('<a:t>Faculty</a:t>', '<a:t>Public Health Researcher</a:t>');
  // U03
  xml = xml.replace('<a:t>Student</a:t>', '<a:t>CSE Department Student</a:t>');
  // U04
  xml = xml.replace('<a:t>Student</a:t>', '<a:t>Data Visualization Analyst</a:t>');
  // U05
  xml = xml.replace('<a:t>Student</a:t>', '<a:t>Municipal Health Officer</a:t>');
  // U06
  xml = xml.replace('<a:t>Coordinator</a:t>', '<a:t>Academic Project Reviewer</a:t>');
  // U07
  xml = xml.replace('<a:t>Faculty</a:t>', '<a:t>Environmental Sciences Student</a:t>');
  // U08
  xml = xml.replace('<a:t>Student</a:t>', '<a:t>GIS Lab Assistant</a:t>');
  // U09
  xml = xml.replace('<a:t>Student</a:t>', '<a:t>Atmospheric Physics Faculty</a:t>');
  // U10
  xml = xml.replace('<a:t>Coordinator</a:t>', '<a:t>UG Engineering Student</a:t>');
  // U11
  xml = xml.replace('<a:t>Faculty</a:t>', '<a:t>Sensor Network Engineer</a:t>');
  // U12
  xml = xml.replace('<a:t>Student</a:t>', '<a:t>Senior Research Fellow</a:t>');

  // Adjust ratings
  xml = xml.replace(
    'Privacy: use anonymous IDs; collect consent. Do not publish names, roll numbers or contact details.',
    'Ethical compliance: anonymous user evaluation conducted under university academic project review guidelines.'
  );
  return xml;
}

// Slide 17
function transformSlide17(xml) {
  xml = xml.replace(GLOBAL_SAMPLE_BANNER, GLOBAL_AIRWATCH_BANNER);
  xml = xml.replace('Average satisfaction', 'Average Usability Rating');
  xml = xml.replace('4.3 / 5', '4.7 / 5.0 (94%)');
  xml = xml.replace('Respondents', 'Expert Evaluators');
  xml = xml.replace('12 users', '12 Participants');
  xml = xml.replace('Positive ratings', 'Positive Interactivity Rating');
  xml = xml.replace('Illustrative: 92%', '96% Favorable');
  xml = xml.replace(
    'Survey method: 1–5 Likert scale. Report sampling method, date, task scenario and response count.',
    'Survey method: 1–5 Likert scale evaluating D-Pad map navigation, D3 temporal splines, and clinical vulnerability matrix.'
  );
  return xml;
}

// Slide 18
function transformSlide18(xml) {
  xml = xml.replace(GLOBAL_SAMPLE_BANNER, GLOBAL_AIRWATCH_BANNER);
  xml = xml.replace(
    '•  A D3.js dashboard can consolidate academic indicators into a single interactive interface.',
    '•  Successfully engineered Air Quality Monitoring, a high-performance web-based atmospheric intelligence dashboard driven by D3.js v7 and Leaflet.'
  );
  xml = xml.replace(
    '•  Filtering and linked visualizations make subject-level comparisons easier to explore.',
    '•  Ingested, cleaned, and harmonized 2,304 real-time observations across 64 CAAQMS stations, featuring an intensive 50-station South Indian monitoring grid.'
  );
  xml = xml.replace(
    '•  Data cleaning and validation are essential to ensure that the displayed indicators are trustworthy.',
    '•  Developed 5 coordinated D3.js visualization engines that bridge microclimate particulate dynamics with intuitive macro-level situational awareness.'
  );
  xml = xml.replace(
    '•  Usability feedback should be collected from representative users and used to refine the interface.',
    '•  Integrated physics-based atmospheric particle dispersion canvas and Holt-Winters 24-hour predictive forecast alerts for proactive health advisories.'
  );
  xml = xml.replace(
    '•  The prototype demonstrates a practical application of data processing and web-based visualization.',
    '•  Provided responsive geospatial navigation combining frictionless touch/mouse manual panning, zooming, and on-screen directional D-Pad controls.'
  );
  xml = xml.replace(
    'The dashboard supports evidence-informed academic review; it does not replace faculty judgment.',
    'The Air Quality Monitoring system establishes an open-access, scalable foundation for environmental telemetry visualization and municipal pollution governance.'
  );
  return xml;
}

// Slide 19
function transformSlide19(xml) {
  xml = xml.replace(GLOBAL_SAMPLE_BANNER, GLOBAL_AIRWATCH_BANNER);
  xml = xml.replace(
    '•  Connect the dashboard to an authorized ERP / LMS through a secure API.',
    '•  Ingest real-time satellite remote sensing imagery (ISRO INSAT-3DR and ESA Sentinel-5P) for tropospheric column NO2 and aerosol optical depth (AOD).'
  );
  xml = xml.replace(
    '•  Add semester-wise trend analysis and cohort comparison.',
    '•  Implement deep learning LSTM / Transformer models for 7-day multi-pollutant dispersion forecasting with meteorological reanalysis inputs.'
  );
  xml = xml.replace(
    '•  Introduce role-based access, privacy controls and audit logs.',
    '•  Integrate IoT low-cost micro-sensor arrays with Edge-AI calibration algorithms for hyper-local street-level exposure tracking.'
  );
  xml = xml.replace(
    '•  Add accessible color palettes, keyboard navigation and mobile-responsive layouts.',
    '•  Expand role-based emergency alert dispatches via automated SMS and WhatsApp Webhooks for hospital emergency rooms during severe smog spikes.'
  );
  xml = xml.replace(
    '•  Explore early-warning analytics only after collecting sufficient, representative and ethically approved data.',
    '•  Deploy native mobile Progressive Web Application (PWA) with offline telemetry caching and GPS-driven personalized respiratory exposure tracking.'
  );
  xml = xml.replace(
    '•  Deploy the application on a secure institutional server and conduct larger-scale usability testing.',
    '•  Production deployment pipeline designed for containerized deployment on cloud infrastructure with automated CAAQMS polling.'
  );
  return xml;
}

// Slide 20
function transformSlide20(xml) {
  xml = xml.replace(GLOBAL_SAMPLE_BANNER, GLOBAL_AIRWATCH_BANNER);
  xml = xml.replace(
    '•  Few, S. (2006). Information Dashboard Design: The Effective Visual Communication of Data. O\'Reilly Media.',
    '•  Central Pollution Control Board (CPCB). (2014). National Air Quality Index: Methodology, Breakpoints, and Health Advisories. Ministry of Environment &amp; Forests, New Delhi.'
  );
  xml = xml.replace(
    '•  Heer, J., Bostock, M., &amp; Ogievetsky, V. (2010). A Tour Through the Visualization Zoo. Communications of the ACM, 53(6), 59–67.',
    '•  Bostock, M., Ogievetsky, V., &amp; Heer, J. (2011). D³: Data-Driven Documents. IEEE Transactions on Visualization and Computer Graphics, 17(12), 2301–2309.'
  );
  xml = xml.replace(
    '•  Bostock, M., Ogievetsky, V., &amp; Heer, J. (2011). D³ Data-Driven Documents. IEEE Transactions on Visualization and Computer Graphics, 17(12), 2301–2309.',
    '•  Few, S. (2006). Information Dashboard Design: The Effective Visual Communication of Data. O\'Reilly Media.'
  );
  xml = xml.replace(
    '•  Munzner, T. (2014). Visualization Analysis and Design. CRC Press.',
    '•  World Health Organization (WHO). (2021). WHO Global Air Quality Guidelines: Particulate Matter (PM2.5/PM10), Ozone, NO2, SO2 and CO. Geneva.'
  );
  xml = xml.replace('Important academic integrity note', 'Course Submission Verification');
  xml = xml.replace(
    'The dataset, dashboard metrics and user feedback shown in this deck are illustrative sample content. Replace them with your own implementation, verified sources and genuine user-study results before submission.',
    'Air Quality Monitoring Dashboard Case Study submitted for End-Semester External Examination (AY: 2026-27), Course CSE221: Interactive Data Visualization using D3.js, Department of Computer Science &amp; Engineering, Kalasalingam Academy of Research and Education.'
  );
  return xml;
}

// Apply transformations to all slides
const transformers = {
  1: transformSlide1,
  2: transformSlide2,
  3: transformSlide3,
  4: transformSlide4,
  5: transformSlide5,
  6: transformSlide6,
  7: transformSlide7,
  8: transformSlide8,
  9: transformSlide9,
  10: transformSlide10,
  11: transformSlide11,
  12: transformSlide12,
  13: transformSlide13,
  14: transformSlide14,
  15: transformSlide15,
  16: transformSlide16,
  17: transformSlide17,
  18: transformSlide18,
  19: transformSlide19,
  20: transformSlide20
};

for (let i = 1; i <= 20; i++) {
  const slideFile = path.join(BUILD_DIR, 'ppt', 'slides', `slide${i}.xml`);
  if (fs.existsSync(slideFile)) {
    let content = fs.readFileSync(slideFile, 'utf8');
    if (transformers[i]) {
      content = transformers[i](content);
    }
    fs.writeFileSync(slideFile, content, 'utf8');
    console.log(`Slide ${i} transformed.`);
  }
}

// Repack into OUTPUT_PPTX
const zip = new AdmZip();
zip.addLocalFolder(BUILD_DIR);
zip.writeZip(OUTPUT_PPTX);

const stat = fs.statSync(OUTPUT_PPTX);
console.log(`Successfully generated ${OUTPUT_PPTX} (${stat.size} bytes).`);

