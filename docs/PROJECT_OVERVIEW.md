# Air Quality Monitoring – Project Overview & System Guide
## Real-Time Air Quality & Atmospheric Pollution Visualization Dashboard
**Course:** CSE221 – Interactive Data Visualization using D3.js  
**Author:** Tellapeli Hasini (Reg No: 98260040005)  
**Institution:** Kalasalingam Academy of Research and Education  
**Academic Year:** 2026 – 2027  

---

## 1. Executive Summary

**Air Quality Monitoring** is an interactive, browser-based environmental intelligence and visual analytics dashboard designed to monitor, analyze, and communicate atmospheric pollution dynamics across Indian urban centers in real time. 

Built specifically for **CSE221 – Interactive Data Visualization using D3.js**, the platform addresses the fundamental challenge of static, cumbersome government air quality bulletins and tabular data dumps by mapping multi-dimensional sensor telemetry into declarative, reactive visual channels. 

The system visualizes an ingested and validated dataset of **2,304 daily observation records spanning 64 continuous monitoring stations across India**, featuring a dense 50-station network in Southern India (Telangana, Andhra Pradesh, Karnataka, Tamil Nadu, and Kerala). The dataset is synchronized directly with an in-place Microsoft Excel workbook (`data/air_quality_india_realtime.xlsx`), historical CAAQMS datastores from Kaggle, and live OpenAQ API feeds.

```
┌────────────────────────────────────────────────────────────────────────┐
│               AIR QUALITY MONITORING SYSTEM HIGHLIGHTS                 │
├────────────────────┬────────────────────┬──────────────────────────────┤
│ 2,304 Records      │ 64 CAAQMS Stations │ 50 South India Grid Stations │
├────────────────────┼────────────────────┼──────────────────────────────┤
│ 5 D3 Visualizations│ Pure Manual Drag   │ In-Place Excel Synchronization│
├────────────────────┼────────────────────┼──────────────────────────────┤
│ Slide-Over Drawer  │ Pollutant Modal    │ RFC-4180 CSV / JSON Exporters │
└────────────────────┴────────────────────┴──────────────────────────────┘
```

---

## 2. Key Metrics & Telemetry At-A-Glance

| Metric | Active Value | Statutory / Epidemiological Meaning |
|:---|:---:|:---|
| **Verified Observation Records** | **2,304 Records** | Complete daily observations spanning September–October 2026 |
| **Active CAAQMS Stations** | **64 Stations** | 50 South India stations + 14 national metropolitan hubs |
| **National Average AQI** | **61 Index** | CPCB Category: **MODERATE** (Acceptable; minor irritation to sensitive individuals) |
| **Fine Particulates ($\text{PM}_{2.5}$)** | **32.0 $\mu\text{g/m}^3$** | **2.1x WHO Limit** (Exceeds WHO 24h safe threshold of $15\,\mu\text{g/m}^3$) |
| **Coarse Dust ($\text{PM}_{10}$)** | **43.1 $\mu\text{g/m}^3$** | **1.0x WHO Limit** (Hovering right at the WHO safe threshold of $45\,\mu\text{g/m}^3$) |
| **Peak Hotspot AQI** | **500 Index** | **HAZARDOUS** (Acute industrial pollution emergency at Gurugram) |
| **Period Trend Shift ($\Delta\%$)** | **+19.5%** | **DETERIORATING $\uparrow$** (Rising seasonal pollution trend) |

---

## 3. Core Feature Highlights

### 3.1 Executive Command Ribbon & 5 Animated KPI Cards
- Displays real-time operational indicators: active stations online, total records, and database sync status.
- Five animated KPI cards powered by D3 number interpolators compute National Average AQI, $\text{PM}_{2.5}$, $\text{PM}_{10}$, Peak Hotspot, and Period Trend Shift ($\Delta\%$).
- Quick filter controls allow instant slicing by **Focus City**, **Metric** ($\text{AQI}$, $\text{PM}_{2.5}$, $\text{PM}_{10}$, $\text{NO}_2$, $\text{SO}_2$, $\text{CO}$, $\text{O}_3$), and **Timeline Presets** (Full Month, W1–W4, Last 7d).

### 3.2 Pure Manual Geospatial Satellite Map (Leaflet v1.9.4)
- **Zero Movement Buttons:** All directional D-Pads, pan buttons, region jump pills, and on-screen zoom buttons have been eliminated to provide an unobstructed cartographic canvas.
- **Pure Manual Drag & Pan:** Click anywhere on the map and drag freely in any direction (Left, Right, Up, Down). The cursor dynamically shifts between `grab` (hover) and `grabbing` (active drag).
- **Mouse Wheel & Pinch Zoom:** Smooth, responsive zooming via mouse wheel or two-finger trackpad/touchscreen gestures.
- **Non-Blocking 50km Hazard Rings (`interactive: false`):** 50km radial population hazard exposure rings are drawn around each station with `interactive: false`, guaranteeing that mouse drag events pass cleanly to the Leaflet viewport engine without getting blocked by overlapping vector paths.
- **Dynamic Viewport Synchronization:** As you pan or zoom across India, a real-time viewport listener recalculates which stations are within view, updating the station counter badge and re-ranking the floating leaderboard dynamically.
- **Spatial Intercept & Sonar Ping:** Clicking anywhere on the map drops a sonar ping marker, draws a dashed connection line to the nearest CAAQMS station, and automatically opens the Airshed Deep Dive Drawer.

### 3.3 Multi-City Temporal Trend Analysis (D3.js v7)
- Renders continuous cubic monotone spline curves (`d3.curveMonotoneX`) over a 60-day observation timeline.
- Features horizontal, semi-transparent CPCB hazard safety bands (*Good*, *Moderate*, *Unhealthy for Sensitive*, *Unhealthy*, *Very Unhealthy*, *Severe*).
- **Interactive Crosshair HUD:** Hovering over any trajectory snaps a vertical dashed cyan crosshair line to the exact calendar date, highlights the active city with an animated white-ring data dot, dims non-selected trajectories to 0.15 opacity, and updates the dynamic HUD badge with exact pollutant concentrations.
- **City Filter Pills:** Quick toggle pills for individual cities with rapid presets: *"All 64"*, *"Top 3 Polluted"*, *"Cleanest"*, and *"Clear"*.

### 3.4 Multi-Pollutant Radar Fingerprint
- A 6-axis radial D3 visualization plotting normalized concentrations of $\text{PM}_{2.5}$, $\text{PM}_{10}$, $\text{NO}_2$, $\text{SO}_2$, $\text{CO}$, and $\text{O}_3$ against statutory CPCB NAAQS limits.
- Allows immediate visual identification of whether an airshed is dominated by vehicular exhaust ($\text{NO}_2$), industrial coal combustion ($\text{SO}_2$), or construction dust ($\text{PM}_{10}$).

### 3.5 Zonal AQI Distribution Bar Chart
- Aggregates air quality across five geographical macro-zones: *Northern Plains*, *Coastal South*, *Industrial West*, *Eastern Mining*, and *Central Plateau*.
- Features vertical bars with gradient fills, value labels, and interactive click-to-filter capabilities.

### 3.6 CPCB Hazard Category Donut Chart
- Encodes the percentage distribution of records across the six statutory CPCB severity buckets using a D3 arc layout.
- Clicking any category slice filters the global dashboard to display only observations matching that hazard level.

### 3.7 Particulate Correlation Scatter Plot ($\text{PM}_{2.5}$ vs $\text{PM}_{10}$)
- Plots $\text{PM}_{2.5}$ against $\text{PM}_{10}$ for all monitoring stations.
- Delineates four epidemiological risk quadrants using WHO guideline threshold reference lines.
- Computes an ordinary least squares (OLS) linear regression trend line ($R^2 = 0.88$), illustrating strong particulate co-emission.

### 3.8 Slide-Over Airshed Deep-Dive Drawer (`#airshedDrawer`)
- Touching any station on the map, clicking a chart element, or selecting a table row smoothly opens a right-side slide-over drawer.
- Presents comprehensive station telemetry: composite AQI, CPCB category badge, 6-parameter concentration gauges, primary driver identification, WHO limit exceedance multipliers, and clinical health advisories.

### 3.9 Chemical Pollutant Medical Detail Modal (`#modalPollutantDetail`)
- Clicking any pollutant badge opens a modal detailing molecular formula, statutory NAAQS thresholds, combustion sources, respiratory health risks, and clinical mitigation protocols.

### 3.10 Verified Records Explorer
- Displays a searchable, sortable, and paginated table of raw sensor records.
- Instant search bar filters records across city name, date, category, or numerical values.
- Client-side export engine generates RFC-4180 compliant CSV and JSON files directly in browser memory without server latency.

### 3.11 24-Hour Predictive AQI Forecast Engine (D3.js Area & Spline)
- Autoregressive machine-learning forward trajectory model predicting hourly AQI for $+1\text{h}$ to $+24\text{h}$.
- Renders continuous monotone cubic splines with a **95% Confidence Interval area band** (`d3.area`).
- Dynamic peak smog hour flag (e.g., `Peak Window: 20:00 (148 AQI)`) and city-specific forecast dropdown.

### 3.12 Meteorological & Atmospheric Boundary Layer Live Barometer
- Displays real-time physical parameters governing atmospheric dispersion:
  - 💨 **Wind Velocity & Vector:** `15.4 km/h ESE` (Moderate Convective Dispersion)
  - 🌡️ **Ambient Temperature & Humidity:** `29.2°C • 68% RH` (Dew Point: `22.4°C`)
  - 🏔️ **Boundary Layer Mixing Height (PBLH):** `1,350 m` (Expanded Vertical Mixing Depth)
  - 🌪️ **CPCB Ventilation Coefficient ($V_c$):** `20,790 m²/s` (Favorable Pollutant Dilution)

### 3.13 Airshed Face-Off: Dual-City Head-to-Head Comparator
- Synchronized comparative module contrasting any two Indian cities side-by-side.
- Computes real-time $\Delta\text{AQI}$ differentials, relative particulate bar ratios ($\text{PM}_{2.5}$ and $\text{PM}_{10}$), and comparative public health verdicts.

### 3.14 Clinical Cohort Vulnerability & Sensitive Population Advisory
- Epidemiological risk stratification for 4 sensitive demographic cohorts:
  - 👶 **Children & Infants:** Lung alveolar development protection.
  - 👵 **Elderly (65+ Cohort):** Cardiovascular ischemic risk mitigation.
  - 🫁 **Asthmatics & COPD Patients:** Bronchial constriction warning and inhaler readiness.
  - 🏃 **Outdoor Workers & Athletes:** Exercise intensity ceilings and N95 respirator guidance.

### 3.15 AI Audio Atmospheric Briefing & Voice Synthesis
- Spoken intelligence summary powered by the browser's native **Web Speech API (`speechSynthesis`)**.
- Incorporates Web Audio API synthesized acoustic harmonic chimes upon activation.

---

## 4. In-Place Excel Workbook Architecture

The complete dataset is stored and maintained directly in:  
**[`data/air_quality_india_realtime.xlsx`](file:///c:/Users/udayk/OneDrive/Documents/AIR%20WATCH/data/air_quality_india_realtime.xlsx)** (1.92 MB).

```
air_quality_india_realtime.xlsx
│
├── Sheet 1: RealTime_AirQuality_Stations (2,304 Rows)
│   └── rec_id, date, city, state, zone, lat, lng, aqi, category, pm25, pm10, no2, so2, co, o3, health_advisory
│
├── Sheet 2: Station_Metadata (64 Rows)
│   └── station_id, city, state, zone, latitude, longitude, elevation_m, monitoring_agency, station_type
│
├── Sheet 3: CPCB_NAAQS_Breakpoints (6 Rows)
│   └── category, aqi_low, aqi_high, pm25_low, pm25_high, pm10_low, pm10_high, no2_low, no2_high...
│
└── Sheet 4: Data_Sources_Citations (3 Rows)
    └── source_name, organization, description, official_url, citation_format
```

---

## 5. Technology Stack

| Layer | Technologies Used | Key Responsibilities |
|:---|:---|:---|
| **Presentation** | Semantic HTML5, CSS3 Glassmorphism | Dark theme (`#0a0e17`), glassmorphic cards (`blur(16px)`), responsive grid & flexbox |
| **Client Controller** | Vanilla ES6+ JavaScript | State management, cross-filter event dispatching, REST API communications |
| **Visual Analytics** | **D3.js (v7)** | Mathematical scales, cubic monotone splines, radar charts, donut arcs, scatter plots |
| **Geospatial** | **Leaflet (v1.9.4)** | Google Hybrid satellite cartography, pure manual pan/zoom, non-blocking hazard rings |
| **Physics Simulation** | HTML5 Canvas API | Autonomous Lagrangian particle advection simulating atmospheric wind dispersion |
| **Data Ingestion** | **SheetJS (XLSX v0.18.5)** | In-place reading and writing of multi-sheet Microsoft Excel workbooks |
| **Backend API** | **Node.js (v20+) & Express (v5)** | REST endpoints, JSON persistence, PBKDF2 authentication, `EADDRINUSE` handling |

---

## 6. REST API Reference

All backend endpoints run locally on port 3000 and return standard JSON responses:

| Method | Endpoint | Description |
|:---:|:---|:---|
| `GET` | `/api/kpi` | Returns National Average AQI, $\text{PM}_{2.5}$, $\text{PM}_{10}$, peak hotspot, and period delta |
| `GET` | `/api/stations` | Returns list of all 64 stations with coordinates, current AQI, and category |
| `GET` | `/api/trends` | Returns 60-day daily temporal trend arrays for all stations |
| `GET` | `/api/rankings` | Returns sorted city rankings (Worst First / Best First) |
| `GET` | `/api/analytics/radar` | Returns 6-axis normalized pollutant averages for radar visualization |
| `GET` | `/api/analytics/zonal` | Returns aggregated mean AQI and particulate counts across 5 macro-zones |
| `GET` | `/api/analytics/categories` | Returns record counts and percentages across 6 CPCB hazard buckets |
| `GET` | `/api/analytics/correlation` | Returns paired $(\text{PM}_{2.5}, \text{PM}_{10})$ data points with linear regression slope |
| `GET` | `/api/export/csv` | Streams RFC-4180 compliant CSV file of the complete dataset |
| `GET` | `/api/export/json` | Returns full JSON document dump of all 2,304 records |
| `DELETE` | `/api/records/:id` | Authenticated endpoint to delete an individual record from the database |

---

## 7. Installation & Quickstart Guide

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **PowerShell** or standard terminal

### Step 1: Install Dependencies
Open PowerShell in the project directory and run:
```powershell
npm install
```

### Step 2: Start Development Server
Run the application using the configured `dev` script:
```powershell
npm run dev
```

*Terminal output will confirm:*
```
====================================================
  Air Quality Monitoring Server running on http://localhost:3000
  Dataset: 2304 records across 64 stations
====================================================
```

### Step 3: Open in Browser
Launch your preferred web browser and navigate to:  
**`http://localhost:3000`**

### User Navigation Tips:
- **Pan the Map:** Click and drag anywhere on the satellite map in any direction (Left, Right, Up, Down).
- **Zoom the Map:** Use your mouse scroll wheel or pinch on a trackpad to zoom in and out.
- **Inspect Station:** Click directly on any station marker or anywhere on the map to open the Airshed Drawer.
- **Inspect Trends:** Hover over the D3 temporal spline curves to see the interactive crosshair HUD.
- **Export Data:** Click **Export CSV** or **Export JSON** in the Verified Records table for instant local downloads.

