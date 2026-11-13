const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const DB_DIR = fs.existsSync('database') ? 'database' : (fs.existsSync('../database') ? '../database' : 'data');

// 1. Read records and stations
const records = JSON.parse(fs.readFileSync(path.join(DB_DIR, 'db_store.json'), 'utf8'));
const stations = JSON.parse(fs.readFileSync(path.join(DB_DIR, 'stations.json'), 'utf8'));

// 2. Sheet 1: India_Realtime_AQI
const wsRecords = XLSX.utils.json_to_sheet(records.map(r => ({
  "Record ID": r.id,
  "Station Code": r.station_code || "N/A",
  "City": r.city,
  "State": r.state,
  "Zone": r.zone,
  "Latitude": r.latitude,
  "Longitude": r.longitude,
  "Observation Date": r.date,
  "Date Formatted": r.date_display,
  "Composite AQI": r.aqi,
  "PM2.5 (ug/m3)": r.pm25,
  "PM10 (ug/m3)": r.pm10,
  "NO2 (ug/m3)": r.no2,
  "SO2 (ug/m3)": r.so2,
  "CO (mg/m3)": r.co,
  "O3 (ug/m3)": r.o3,
  "NH3 (ug/m3)": r.nh3 || 0,
  "CPCB Category": r.category,
  "Health Advisory Notice": r.advisory,
  "Official Source": r.data_source || "Live Real-Time CAAQMS & Open-Meteo Sensor Stream"
})));

// 3. Sheet 2: Station_Metadata
const wsStations = XLSX.utils.json_to_sheet(stations.map((s, idx) => ({
  "Index": idx + 1,
  "Station Code": s.station_code,
  "City": s.city,
  "State": s.state,
  "Zone": s.zone,
  "Latitude (WGS-84)": s.lat,
  "Longitude (WGS-84)": s.lng,
  "Period Average AQI": s.avg_aqi,
  "CPCB Risk Category": s.category,
  "Latest Live AQI": s.latest_aqi,
  "Latest PM2.5 (ug/m3)": s.latest_pm25,
  "Latest PM10 (ug/m3)": s.latest_pm10,
  "Latest NO2 (ug/m3)": s.latest_no2,
  "Latest SO2 (ug/m3)": s.latest_so2,
  "Total Observations": s.total_records,
  "Monitoring Agency": s.agency || "Central Pollution Control Board (CPCB) & State PCBs",
  "Data Stream": s.source
})));

// 4. Sheet 3: CPCB_NAQI_Breakpoints
const cpcbStandards = [
  { "AQI Category": "Good", "AQI Range": "0 - 50", "PM2.5 (24h)": "0 - 30", "PM10 (24h)": "0 - 50", "NO2 (24h)": "0 - 40", "SO2 (24h)": "0 - 40", "CO (8h)": "0.0 - 1.0", "O3 (8h)": "0 - 50", "Color Code": "#10b981", "Health Impact": "Minimal impact" },
  { "AQI Category": "Satisfactory / Moderate", "AQI Range": "51 - 100", "PM2.5 (24h)": "31 - 60", "PM10 (24h)": "51 - 100", "NO2 (24h)": "41 - 80", "SO2 (24h)": "41 - 80", "CO (8h)": "1.1 - 2.0", "O3 (8h)": "51 - 100", "Color Code": "#eab308", "Health Impact": "Minor breathing discomfort to sensitive people" },
  { "AQI Category": "Moderately Polluted / Sensitive", "AQI Range": "101 - 150", "PM2.5 (24h)": "61 - 90", "PM10 (24h)": "101 - 150", "NO2 (24h)": "81 - 180", "SO2 (24h)": "81 - 180", "CO (8h)": "2.1 - 4.0", "O3 (8h)": "101 - 168", "Color Code": "#f97316", "Health Impact": "Breathing discomfort to people with lung, asthma and heart diseases" },
  { "AQI Category": "Poor / Unhealthy", "AQI Range": "151 - 200", "PM2.5 (24h)": "91 - 120", "PM10 (24h)": "151 - 250", "NO2 (24h)": "181 - 280", "SO2 (24h)": "181 - 280", "CO (8h)": "4.1 - 10.0", "O3 (8h)": "169 - 208", "Color Code": "#ef4444", "Health Impact": "Breathing discomfort to most people on prolonged exposure" },
  { "AQI Category": "Very Poor / Unhealthy", "AQI Range": "201 - 300", "PM2.5 (24h)": "121 - 250", "PM10 (24h)": "251 - 350", "NO2 (24h)": "281 - 400", "SO2 (24h)": "281 - 400", "CO (8h)": "10.1 - 17.0", "O3 (8h)": "209 - 748", "Color Code": "#a855f7", "Health Impact": "Respiratory illness on prolonged exposure" },
  { "AQI Category": "Severe / Hazardous", "AQI Range": "301 - 500", "PM2.5 (24h)": "250+", "PM10 (24h)": "350+", "NO2 (24h)": "400+", "SO2 (24h)": "400+", "CO (8h)": "17.0+", "O3 (8h)": "748+", "Color Code": "#dc2626", "Health Impact": "Affects healthy people and seriously impacts those with existing diseases" }
];
const wsStandards = XLSX.utils.json_to_sheet(cpcbStandards);

// 5. Sheet 4: Data_Sources_and_Links
const sources = [
  {
    "Source Name": "Central Pollution Control Board (CPCB) Official Portal",
    "Agency / Publisher": "Ministry of Environment, Forest & Climate Change, Govt. of India",
    "Description": "Statutory National Ambient Air Quality Monitoring network (CAAQMS) providing real-time telemetry across urban Indian centers.",
    "Official URL / Direct Link": "https://cpcb.nic.in",
    "Data Portal Link": "https://app.cpcbccr.com/AQI_India/"
  },
  {
    "Source Name": "Open Government Data (OGD) Platform India",
    "Agency / Publisher": "National Informatics Centre (NIC), Ministry of Electronics & IT",
    "Description": "National Air Quality Index (NAQI) public dataset repository with daily and hourly ambient air observations.",
    "Official URL / Direct Link": "https://data.gov.in",
    "Data Portal Link": "https://data.gov.in/resource/real-time-air-quality-index"
  },
  {
    "Source Name": "Live Real-Time Open-Meteo CAAQMS Integration",
    "Agency / Publisher": "European & National Meteorological Services / CAAQMS Telemetry",
    "Description": "Real-time atmospheric sensor observation API providing live hourly PM2.5, PM10, NO2, SO2, CO, and O3 measurements.",
    "Official URL / Direct Link": "https://open-meteo.com/en/docs/air-quality-api",
    "Data Portal Link": "https://air-quality-api.open-meteo.com"
  },
  {
    "Source Name": "Kaggle CAAQMS India Air Quality Dataset",
    "Agency / Publisher": "Rohan Rao (CPCB historical datastore extract)",
    "Description": "Standard benchmark historical datastore containing verified station-day and city-day ambient air quality telemetry.",
    "Official URL / Direct Link": "https://www.kaggle.com/datasets/rohanrao/air-quality-data-in-india",
    "Data Portal Link": "https://www.kaggle.com/datasets/rohanrao/air-quality-data-in-india/data"
  },
  {
    "Source Name": "World Health Organization (WHO) Global Air Quality Guidelines",
    "Agency / Publisher": "World Health Organization (Geneva)",
    "Description": "Global epidemiologically-derived health benchmarks (PM2.5 24h: 15 ug/m3, PM10 24h: 45 ug/m3).",
    "Official URL / Direct Link": "https://www.who.int/publications/i/item/9789240034228",
    "Data Portal Link": "https://www.who.int/news-room/fact-sheets/detail/ambient-(outdoor)-air-quality-and-health"
  }
];
const wsSources = XLSX.utils.json_to_sheet(sources);

// Create Workbook
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, wsRecords, "India_Realtime_AQI");
XLSX.utils.book_append_sheet(wb, wsStations, "Station_Metadata");
XLSX.utils.book_append_sheet(wb, wsStandards, "CPCB_NAQI_Breakpoints");
XLSX.utils.book_append_sheet(wb, wsSources, "Data_Sources_and_Links");

// Write directly into the existing file database/air_quality_india_realtime.xlsx
const targetPath = path.join(DB_DIR, "air_quality_india_realtime.xlsx");
XLSX.writeFile(wb, targetPath);
console.log(`Successfully updated ${targetPath} in-place with:`);
console.log(` - India_Realtime_AQI: ${records.length} rows`);
console.log(` - Station_Metadata: ${stations.length} stations`);
console.log(` - CPCB_NAQI_Breakpoints: ${cpcbStandards.length} brackets`);
console.log(` - Data_Sources_and_Links: ${sources.length} sources`);
