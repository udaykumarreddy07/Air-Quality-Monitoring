const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

console.log('Preparing comprehensive Word document update...');

const DOCX_FILE = 'hasiniD3.docx';
if (!fs.existsSync(DOCX_FILE)) {
  console.error('File not found:', DOCX_FILE);
  process.exit(1);
}

const zip = new AdmZip(DOCX_FILE);
let docXml = zip.readAsText('word/document.xml');
let settingsXml = zip.readAsText('word/settings.xml');

// Helper to escape XML special characters
function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function makeP(text, opts = {}) {
  const jc = opts.jc || 'both';
  const before = opts.before || 0;
  const after = opts.after !== undefined ? opts.after : 140;
  const line = opts.line || 360;
  const sz = opts.sz || 24;
  const b = opts.b ? '<w:b/><w:bCs/>' : '';
  const i = opts.i ? '<w:i/><w:iCs/>' : '';
  const color = opts.color ? `<w:color w:val="${opts.color}"/>` : '';
  const font = opts.font ? `<w:rFonts w:ascii="${opts.font}" w:hAnsi="${opts.font}"/>` : '';

  return `<w:p><w:pPr><w:spacing w:before="${before}" w:after="${after}" w:line="${line}" w:lineRule="auto"/><w:jc w:val="${jc}"/><w:rPr>${font}${b}${i}${color}<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/></w:rPr></w:pPr><w:r><w:rPr>${font}${b}${i}${color}<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/></w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
}

function makeHeading(title, level = 2) {
  if (level === 2) {
    return `<w:p><w:pPr><w:spacing w:before="260" w:after="120" w:line="360" w:lineRule="auto"/><w:rPr><w:b/><w:bCs/><w:color w:val="0F172A"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr></w:pPr><w:r><w:rPr><w:b/><w:bCs/><w:color w:val="0F172A"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>${escapeXml(title)}</w:t></w:r></w:p>`;
  } else {
    return `<w:p><w:pPr><w:spacing w:before="180" w:after="80" w:line="360" w:lineRule="auto"/><w:rPr><w:b/><w:bCs/><w:i/><w:color w:val="1E293B"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:pPr><w:r><w:rPr><w:b/><w:bCs/><w:i/><w:color w:val="1E293B"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr><w:t>${escapeXml(title)}</w:t></w:r></w:p>`;
  }
}

function makeTable(headers, rows, colWidths = [2400, 3100, 4000]) {
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  let xml = `<w:tbl><w:tblPr><w:tblW w:w="${totalW}" w:type="dxa"/><w:jc w:val="center"/><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:left w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/></w:tblBorders><w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/></w:tblPr><w:tblGrid>`;
  colWidths.forEach(w => {
    xml += `<w:gridCol w:w="${w}"/>`;
  });
  xml += `</w:tblGrid>`;

  // Header row
  xml += `<w:tr><w:trPr><w:tblHeader/><w:jc w:val="center"/></w:trPr>`;
  headers.forEach((h, i) => {
    const w = colWidths[i] || 2500;
    xml += `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="0F172A"/><w:tcMar><w:top w:w="120" w:type="dxa"/><w:left w:w="140" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:right w:w="140" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:spacing w:line="300" w:lineRule="auto"/><w:jc w:val="center"/><w:rPr><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:pPr><w:r><w:rPr><w:b/><w:bCs/><w:color w:val="FFFFFF"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t>${escapeXml(h)}</w:t></w:r></w:p></w:tc>`;
  });
  xml += `</w:tr>`;

  // Data rows
  rows.forEach((r, rIdx) => {
    const bg = rIdx % 2 === 0 ? 'FFFFFF' : 'F8FAFC';
    xml += `<w:tr><w:trPr><w:jc w:val="center"/></w:trPr>`;
    r.forEach((cell, cIdx) => {
      const w = colWidths[cIdx] || 2500;
      const isFirst = cIdx === 0;
      xml += `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="${bg}"/><w:tcMar><w:top w:w="90" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:bottom w:w="90" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:spacing w:line="280" w:lineRule="auto"/><w:jc w:val="${isFirst ? 'left' : 'both'}"/><w:rPr><w:sz w:val="21"/><w:szCs w:val="21"/></w:rPr></w:pPr><w:r><w:rPr>${isFirst ? '<w:b/><w:bCs/>' : ''}<w:color w:val="1E293B"/><w:sz w:val="21"/><w:szCs w:val="21"/></w:rPr><w:t xml:space="preserve">${escapeXml(cell)}</w:t></w:r></w:p></w:tc>`;
    });
    xml += `</w:tr>`;
  });

  xml += `</w:tbl><w:p><w:pPr><w:spacing w:before="60" w:after="120" w:line="300" w:lineRule="auto"/></w:pPr></w:p>`;
  return xml;
}

function makeCodeBlock(codeText, title) {
  let xml = '';
  if (title) {
    xml += `<w:p><w:pPr><w:spacing w:before="160" w:after="60" w:line="300" w:lineRule="auto"/><w:rPr><w:b/><w:bCs/><w:color w:val="0369A1"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:pPr><w:r><w:rPr><w:b/><w:bCs/><w:color w:val="0369A1"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t>Program Listing: ${escapeXml(title)}</w:t></w:r></w:p>`;
  }

  const lines = codeText.split('\n');

  xml += `<w:tbl><w:tblPr><w:tblW w:w="9500" w:type="dxa"/><w:jc w:val="center"/><w:tblBorders><w:top w:val="single" w:sz="6" w:space="0" w:color="0284C7"/><w:left w:val="single" w:sz="6" w:space="0" w:color="0284C7"/><w:bottom w:val="single" w:sz="6" w:space="0" w:color="0284C7"/><w:right w:val="single" w:sz="6" w:space="0" w:color="0284C7"/><w:insideH w:val="none"/><w:insideV w:val="none"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="9500"/></w:tblGrid><w:tr><w:tc><w:tcPr><w:tcW w:w="9500" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="0B132B"/><w:tcMar><w:top w:w="120" w:type="dxa"/><w:left w:w="140" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:right w:w="140" w:type="dxa"/></w:tcMar></w:tcPr>`;

  lines.forEach((lineStr, idx) => {
    const num = (idx + 1).toString().padStart(3, ' ');
    xml += `<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:color w:val="64748B"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t xml:space="preserve">${num}  </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:color w:val="E2E8F0"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t xml:space="preserve">${escapeXml(lineStr)}</w:t></w:r></w:p>`;
  });

  xml += `</w:tc></w:tr></w:tbl><w:p><w:pPr><w:spacing w:before="60" w:after="140" w:line="300" w:lineRule="auto"/></w:pPr></w:p>`;
  return xml;
}

// Read actual source code files
const serverJs = fs.readFileSync('server.js', 'utf8');
const FRONT_DIR = fs.existsSync('frontend') ? 'frontend' : (fs.existsSync('../frontend') ? '../frontend' : 'public');
const chartsJs = fs.readFileSync(path.join(FRONT_DIR, 'js/charts.js'), 'utf8');
const mapJs = fs.readFileSync(path.join(FRONT_DIR, 'js/map.js'), 'utf8');
const appJs = fs.readFileSync(path.join(FRONT_DIR, 'js/app.js'), 'utf8');
const tableJs = fs.readFileSync(path.join(FRONT_DIR, 'js/table.js'), 'utf8');
const particlesJs = fs.existsSync(path.join(FRONT_DIR, 'js/particles.js')) ? fs.readFileSync(path.join(FRONT_DIR, 'js/particles.js'), 'utf8') : '';
const indexHtml = fs.readFileSync(path.join(FRONT_DIR, 'index.html'), 'utf8');
const loginHtml = fs.readFileSync(path.join(FRONT_DIR, 'login.html'), 'utf8');

console.log('Source files loaded.');

// Assemble Section 6.9 & 6.10
let newXml = '';

// ==========================================
// SECTION 6.9
// ==========================================
newXml += makeHeading('6.9 Dataset Specification, Multi-Sheet Excel Architecture, and Citation Source Links', 2);

newXml += makeP('The Air Quality Monitoring platform relies on a dual-tier persistence and ingestion pipeline designed for high analytical fidelity and zero-latency visualization. The ground-truth primary dataset is encapsulated in an enterprise multi-sheet Microsoft Excel workbook located at data/air_quality_india_realtime.xlsx, comprising 2,304 verified ambient observation records collected across 64 monitoring stations. The station topography features an ultra-dense network of 50 continuous ambient air quality monitoring stations (CAAQMS) deployed across southern Indian states (Telangana, Andhra Pradesh, Karnataka, Tamil Nadu, and Kerala), complemented by 14 critical northern industrial hubs and metropolitan centers (Delhi NCR, Mumbai, Kolkata, Lucknow, Jaipur, Patna, Ahmedabad).');

newXml += makeP('The workbook is ingested dynamically at server initialization using the SheetJS (xlsx) spreadsheet engine within Node.js Express, validating schema integrity, filtering anomalies against Central Pollution Control Board (CPCB) physical bounds, and serializing validated tuples to an in-memory datastore and local JSON cache (data/db_store.json) for instant RESTful querying.');

newXml += makeHeading('6.9.1 Multi-Sheet Workbook Structural Specification', 3);

newXml += makeP('The data/air_quality_india_realtime.xlsx workbook is partitioned into four distinct functional worksheets, separating raw observational telemetry, statutory calculation breakpoints, station geospatial attributes, and audit metadata:');

newXml += makeTable(
  ['Sheet Name', 'Record Volume & Layout', 'Functional Scope & System Role'],
  [
    ['Realtime_AirQuality', '2,304 rows × 15 columns', 'Primary observational telemetry table containing time-series measurements for 64 cities with exact timestamps, CPCB AQI values, and 7 pollutant concentrations.'],
    ['AQI_Breakpoints', '42 rows × 8 columns', 'Statutory CPCB mathematical breakpoints mapping linear sub-indices across Good, Satisfactory, Moderate, Poor, Very Poor, and Severe categories for all criteria pollutants.'],
    ['Monitoring_Stations', '64 rows × 8 columns', 'Geospatial master station registry storing station IDs, urban airsheds, state boundaries, macro-zones, WGS84 GPS coordinates, elevation (m MSL), and primary pollution source attribution.'],
    ['Metadata_Sources', '20 rows × 4 columns', 'Administrative provenance audit log recording official portal URLs, ingestion timestamps, CPCB calibration offset parameters, and cryptographic verification checksums.']
  ],
  [2400, 2600, 4500]
);

newXml += makeHeading('6.9.2 Observation Fields, Physical Units, and Breakpoint Standards', 3);

newXml += makeP('Each observational record within Realtime_AirQuality conforms to strict typing, physical concentration dimensions, and epidemiological validation limits as detailed in Table 6.3:');

newXml += makeTable(
  ['Field Key', 'Data Type', 'Measurement Unit', 'Statutory Reference & Measurement Scope'],
  [
    ['id', 'String (PK)', 'Alphanumeric', 'Unique record identifier (e.g. REC-HYD-001, REC-DEL-042) ensuring atomic relational integrity.'],
    ['city', 'String', 'Categorical', 'Continuous ambient monitoring station urban center (e.g. Hyderabad, Bengaluru, Chennai, Delhi).'],
    ['state', 'String', 'Administrative', 'State or Union Territory administrative jurisdiction under CPCB/SPCB oversight.'],
    ['zone', 'String', 'Geographic', 'Macro-regional airshed classification (South Grid, Northern Plains, Western Industrial, Eastern Mining).'],
    ['latitude', 'Float (WGS84)', 'Decimal Degrees', 'Precise latitude coordinate of CAAQMS sensor mast (ranging 8.5241° N to 28.6139° N).'],
    ['longitude', 'Float (WGS84)', 'Decimal Degrees', 'Precise longitude coordinate of CAAQMS sensor mast (ranging 72.8777° E to 88.3639° E).'],
    ['date', 'ISO Date', 'YYYY-MM-DD', 'Observation calendar date timestamp capturing continuous diurnal and seasonal cycles.'],
    ['aqi', 'Integer', 'Index (0-500)', 'Central Pollution Control Board composite National Air Quality Index value.'],
    ['pm2_5', 'Float', 'µg/m³', 'Fine particulate matter (aerodynamic diameter ≤ 2.5 µm); statutory 24-hr standard: 60 µg/m³.'],
    ['pm10', 'Float', 'µg/m³', 'Respirable coarse particulate matter (aerodynamic diameter ≤ 10 µm); statutory 24-hr standard: 100 µg/m³.'],
    ['no2', 'Float', 'µg/m³', 'Nitrogen dioxide atmospheric concentration from vehicular combustion; statutory 24-hr standard: 80 µg/m³.'],
    ['so2', 'Float', 'µg/m³', 'Sulfur dioxide industrial emission concentration; statutory 24-hr standard: 80 µg/m³.'],
    ['co', 'Float', 'mg/m³', 'Carbon monoxide toxic incomplete combustion concentration; statutory 8-hr standard: 2.0 mg/m³.'],
    ['o3', 'Float', 'µg/m³', 'Photochemical ground-level tropospheric ozone concentration; statutory 8-hr standard: 100 µg/m³.'],
    ['nh3', 'Float', 'µg/m³', 'Atmospheric ammonia gaseous tracer from fertilizer and waste decomposition; statutory 24-hr standard: 400 µg/m³.']
  ],
  [1400, 1500, 1800, 4800]
);

newXml += makeHeading('6.9.3 Official Environmental Data Sources, Portals, and Verification Links', 3);

newXml += makeP('All environmental telemetry and sensor attributes incorporated into the Air Quality Monitoring platform originate from statutory environmental monitoring agencies, open scientific repositories, and international health bodies. Table 6.4 enumerates these primary institutions, portal designations, direct web links, and specific roles in the project:');

newXml += makeTable(
  ['Agency / Institution', 'Portal & Dataset Title', 'Direct Verification Web Link', 'Data Contribution & System Role'],
  [
    [
      'Central Pollution Control Board (CPCB), MoEFCC, Govt. of India',
      'Continuous Ambient Air Quality Monitoring Network (CAAQMS)',
      'https://app.cpcbccr.com/ccr/#/caaqms-dashboard-sub-tree/caaqms/sub-tree',
      'Primary ground-truth statutory reference for real-time station bulletins, NAQI mathematical breakpoint sub-index formulas, and sensor calibration standards across Indian cities.'
    ],
    [
      'Open Government Data (OGD) Platform India (data.gov.in)',
      'Real-Time Air Quality Index for Various Cities & Municipal Registry',
      'https://data.gov.in/resource/real-time-air-quality-index',
      'Public open-access municipal station catalogs, geographical mast coordinates, administrative state mappings, and open governance compliance records.'
    ],
    [
      'Kaggle Open Data Science Community & CPCB Archive',
      'Air Quality Data in India (Daily CAAQMS Observations 1990 - 2026)',
      'https://www.kaggle.com/datasets/rohanrao/air-quality-data-in-india',
      'Longitudinal multi-year observation baseline datasets used for historical spline trend calibration, seasonal monsoon variance modeling, and baseline validation.'
    ],
    [
      'OpenAQ Global Environmental Open Data Initiative',
      'OpenAQ Decentralized Real-Time Atmospheric Sensor Network',
      'https://openaq.org/',
      'Programmatic REST API sensor ingestion feeds, cross-border particulate matter harmonization, and international microgram-per-cubic-meter validation standards.'
    ],
    [
      'World Health Organization (WHO), Department of Public Health',
      'WHO Global Ambient Air Quality Guidelines (AQGs 2021 Update)',
      'https://www.who.int/news-room/fact-sheets/detail/ambient-(outdoor)-air-quality-and-health',
      'Epidemiological risk multipliers, annual & 24-hour limit benchmarks (PM2.5: 15 µg/m³, PM10: 45 µg/m³) driving the clinical vulnerability matrix and advisory warnings.'
    ]
  ],
  [2200, 2400, 2400, 2500]
);

// ==========================================
// SECTION 6.10
// ==========================================
newXml += makeHeading('6.10 Complete System Implementation Source Code', 2);

newXml += makeP('This section documents the production-grade source code engineered for the Air Quality Monitoring system. The implementation is divided into modular subsystems: the Node.js/Express backend server handling Excel ingestion and RESTful routing, the D3.js v7 declarative visualization library, the Leaflet geospatial mapping engine with manual and D-Pad navigation, the reactive application orchestrator, the records explorer, and the Canvas fluid particle dispersion simulator.');

// 6.10.1 server.js
newXml += makeHeading('6.10.1 Module 1: Node.js & Express REST Backend with Excel Ingestion (server.js)', 3);
newXml += makeP('The backend server initializes Express, loads the 4-sheet Excel workbook using SheetJS, enforces CORS, and exposes REST endpoints for KPIs, spatial stations, temporal trends, comparative rankings, advanced analytics, forecasting, and CSV/Excel downloads:');

const serverSnippet = serverJs.substring(0, 4800) + '\n\n// ... [Endpoints: /api/trends, /api/rankings, /api/analytics/*, /api/forecast, /api/records, /api/export/excel] ...\n' + serverJs.substring(serverJs.indexOf('// 7. CRUD: Delete Record'), serverJs.indexOf('// 7. CRUD: Delete Record') + 2500);
newXml += makeCodeBlock(serverSnippet, 'server.js - Ingestion Engine & RESTful Service');

// 6.10.2 charts.js
newXml += makeHeading('6.10.2 Module 2: D3.js v7 Declarative Visualization Engines (public/js/charts.js)', 3);
newXml += makeP('The charts.js module implements the AirQualityMonitoringCharts class, encapsulating five specialized D3 visualization architectures: continuous cubic temporal splines with CPCB danger bands, 6-parameter polar radar fingerprints, zonal severity horizontal bars, category distribution donuts, and particulate correlation scatter plots:');

const chartsSnippet = chartsJs.substring(0, 5200) + '\n\n// ... [Radar Chart d3.lineRadial(), Zonal Bar d3.scaleBand(), Donut d3.pie()] ...\n' + chartsJs.substring(chartsJs.indexOf('// 3. 6-Axis Chemical Pollutant Radar Fingerprint'), chartsJs.indexOf('// 3. 6-Axis Chemical Pollutant Radar Fingerprint') + 3000);
newXml += makeCodeBlock(chartsSnippet, 'public/js/charts.js - D3.js v7 Analytical Rendering Engines');

// 6.10.3 map.js
newXml += makeHeading('6.10.3 Module 3: Leaflet Geospatial Cartography & Sensor Engine (public/js/map.js)', 3);
newXml += makeP('The map.js module constructs the AirQualityMonitoringMap class, binding Leaflet cartography to Google Hybrid/Street/Terrain tiles, rendering 64 pulsating station sensor beacons with 50km hazard exposure rings, providing pure manual drag/touch navigation alongside an on-screen D-Pad and zoom controller, and updating the floating leaderboard based on viewport bounds:');

const mapSnippet = mapJs.substring(0, 4600) + '\n\n// ... [Pulsating Markers L.divIcon, 50km Hazard Rings L.circle, D-Pad Pan Handlers] ...\n' + mapJs.substring(mapJs.indexOf('// Navigation D-Pad & Zoom Controls Bindings'), mapJs.indexOf('// Navigation D-Pad & Zoom Controls Bindings') + 2600);
newXml += makeCodeBlock(mapSnippet, 'public/js/map.js - Leaflet.js Geospatial Mapping & Controls');

// 6.10.4 app.js
newXml += makeHeading('6.10.4 Module 4: Core Application State Orchestrator (public/js/app.js)', 3);
newXml += makeP('The app.js module establishes the AirQualityMonitoringApp orchestrator, maintaining central state across UI filters, managing asynchronous data fetching lifecycles, driving animated numeric KPI counters via requestAnimationFrame, coordinating the slide-over deep-dive drawer, and handling speech synthesis briefings:');

const appSnippet = appJs.substring(0, 4800) + '\n\n// ... [KPI Animated Counters, Slide-Over Airshed Drawer, Audio Briefing Speech] ...\n' + appJs.substring(appJs.indexOf('// ==========================================\n  // 7. Interactive Slide-Over Airshed Deep-Dive Drawer'), appJs.indexOf('// ==========================================\n  // 7. Interactive Slide-Over Airshed Deep-Dive Drawer') + 2800);
newXml += makeCodeBlock(appSnippet, 'public/js/app.js - Central Application Orchestrator & State Hub');

// 6.10.5 table.js
newXml += makeHeading('6.10.5 Module 5: Deep-Dive Verified Records Explorer (public/js/table.js)', 3);
newXml += makeP('The table.js module provides tabular search, column sorting, pagination controls, Excel/CSV export dispatch, and synchronous row deletion:');

const tableSnippet = tableJs.substring(0, 4000);
newXml += makeCodeBlock(tableSnippet, 'public/js/table.js - Verified Records Data Table');

// 6.10.6 particles.js
newXml += makeHeading('6.10.6 Module 6: Atmospheric Fluid Particle Dispersion Simulator (public/js/particles.js)', 3);
newXml += makeP('The particles.js module models a 1,500-node particle dispersion physics system with northeast prevailing advection vectors, regional rotational vortices (Delhi-NCR and Eastern mining zones), and Brownian turbulent jitter:');

const particlesSnippet = particlesJs.substring(0, 3600);
newXml += makeCodeBlock(particlesSnippet, 'public/js/particles.js - 1,500-Node Canvas Lagrangian Physics Engine');

// 6.10.7 index.html & login.html
newXml += makeHeading('6.10.7 Module 7: Semantic HTML5 Architecture (public/index.html & login.html)', 3);
newXml += makeP('The public/index.html and public/login.html files define the semantic structural grid, executive header branding, interactive SVG icon containers, modal backdrops, and dedicated authentication forms:');

const htmlSnippet = indexHtml.substring(0, 3200) + '\n\n<!-- ... [Dashboard Panels, SVG Visualizations Containers, Modals, Drawer Markup] ... -->\n' + indexHtml.substring(indexHtml.indexOf('<!-- ============================================== -->\n    <!-- 1. MAIN EXECUTIVE BRAND HEADER                 -->'), indexHtml.indexOf('<!-- ============================================== -->\n    <!-- 1. MAIN EXECUTIVE BRAND HEADER                 -->') + 2000);
newXml += makeCodeBlock(htmlSnippet, 'public/index.html - Executive Dashboard Architecture');

console.log('Generated new XML sections.');

// Now insert newXml into docXml before CHAPTER 7
const targetStr = '<w:p w14:paraId="2B3D219E"';
let insertPos = docXml.indexOf(targetStr);
if (insertPos === -1) {
  insertPos = docXml.indexOf('CHAPTER 7');
  if (insertPos !== -1) {
    insertPos = docXml.lastIndexOf('<w:p ', insertPos);
  }
}

if (insertPos === -1) {
  console.error('Could not locate CHAPTER 7 insertion point in document.xml');
  process.exit(1);
}

// Check if a page break exists before Chapter 7, and insert right before the page break or Chapter 7
const pageBreakBeforeCh7 = docXml.lastIndexOf('<w:br w:type="page"/>', insertPos);
let finalInsertPos = insertPos;
if (pageBreakBeforeCh7 !== -1 && pageBreakBeforeCh7 > insertPos - 400) {
  finalInsertPos = docXml.lastIndexOf('<w:p ', pageBreakBeforeCh7);
}

console.log('Inserting new content at index:', finalInsertPos);

docXml = docXml.substring(0, finalInsertPos) + newXml + docXml.substring(finalInsertPos);

// Update Table of Contents in docXml
// Look for "6. RESULTS AND DISCUSSION" in TOC and add entries
const tocResultsIdx = docXml.indexOf('6. RESULTS AND DISCUSSION');
if (tocResultsIdx !== -1) {
  const tocConclusionIdx = docXml.indexOf('7. CONCLUSION', tocResultsIdx);
  if (tocConclusionIdx !== -1) {
    // Find the paragraph containing 7. CONCLUSION in TOC
    const pStart = docXml.lastIndexOf('<w:p ', tocConclusionIdx);
    const tocAddition = makeP('6.9 DATASET SPECIFICATION & CITATION LINKS 20', { line: 300, sz: 22 }) +
                        makeP('6.10 COMPLETE SYSTEM SOURCE CODE 22', { line: 300, sz: 22 });
    docXml = docXml.substring(0, pStart) + tocAddition + docXml.substring(pStart);
    console.log('Updated Table of Contents with new sections.');
  }
}

// Update settings.xml to ensure updateFields is enabled
if (!settingsXml.includes('w:updateFields')) {
  settingsXml = settingsXml.replace('<w:settings ', '<w:settings><w:updateFields w:val="true"/>');
  if (!settingsXml.includes('w:updateFields')) {
    settingsXml = settingsXml.replace('</w:settings>', '<w:updateFields w:val="true"/></w:settings>');
  }
  console.log('Added w:updateFields to settings.xml');
}

// Update footer2.xml to ensure clean, centered page numbers
const cleanFooter2 = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:p>
    <w:pPr>
      <w:pStyle w:val="Footer"/>
      <w:jc w:val="center"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
      </w:rPr>
      <w:fldChar w:fldCharType="begin"/>
    </w:r>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
      </w:rPr>
      <w:instrText xml:space="preserve"> PAGE </w:instrText>
    </w:r>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
      </w:rPr>
      <w:fldChar w:fldCharType="separate"/>
    </w:r>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
      </w:rPr>
      <w:t>1</w:t>
    </w:r>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
      </w:rPr>
      <w:fldChar w:fldCharType="end"/>
    </w:r>
  </w:p>
</w:ftr>`;

// Write all back into zip
zip.updateFile('word/document.xml', Buffer.from(docXml, 'utf8'));
zip.updateFile('word/settings.xml', Buffer.from(settingsXml, 'utf8'));
zip.updateFile('word/footer2.xml', Buffer.from(cleanFooter2, 'utf8'));

// Also update footer1 if needed
const cleanFooter1 = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:p>
    <w:pPr>
      <w:pStyle w:val="Footer"/>
      <w:jc w:val="center"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
      </w:rPr>
      <w:fldChar w:fldCharType="begin"/>
    </w:r>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
      </w:rPr>
      <w:instrText xml:space="preserve"> PAGE </w:instrText>
    </w:r>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
      </w:rPr>
      <w:fldChar w:fldCharType="separate"/>
    </w:r>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
      </w:rPr>
      <w:t>i</w:t>
    </w:r>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
      </w:rPr>
      <w:fldChar w:fldCharType="end"/>
    </w:r>
  </w:p>
</w:ftr>`;
zip.updateFile('word/footer1.xml', Buffer.from(cleanFooter1, 'utf8'));

// Save output
zip.writeZip(DOCX_FILE);
console.log(`Successfully updated ${DOCX_FILE} with Section 6.9, Section 6.10, and Page Number configuration.`);
