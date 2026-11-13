# Air Quality Monitoring – Real-Time Air Quality & Atmospheric Pollution Visualization Dashboard

> **Course Level Project Report Implementation**  
> **Course:** CSE221 – Interactive Data Visualization using D3.js  
> **Author:** Tellapeli Hasini (Reg No: 98260040005)  
> **Institution:** Kalasalingam Academy of Research & Education  
> **Academic Year:** 2026 – 2027 (Odd Semester)

---

## 📚 Documentation & Project Deliverables

Comprehensive project documentation files are included in the repository:
- 📄 **[Full Academic Course Project Report](docs/PROJECT_REPORT.md)**: 36-page complete academic report matching CSE221 syllabus, Bonafide certificate, Problem Statement, Abstract, Chapters 1–8, schema validation results, and academic references.
- 📋 **[Project Overview & System Guide](docs/PROJECT_OVERVIEW.md)**: Executive summary, system architecture, core visual highlights, Excel structure, and REST API reference.
- 🛠️ **[Engineering Implementation Plan](docs/IMPLEMENTATION_PLAN.md)**: 9-phase work breakdown structure, technical risk mitigation, and acceptance criteria checklist.

---

## 🏗️ Repository Architecture & Modular Organization

The repository is cleanly partitioned into modular tiers separating presentation, business logic, persistence, and documentation:

```text
Air-Quality-Monitoring/
├── frontend/                  # Client-side UI & Visualization Layer
│   ├── index.html             # Command Center Dashboard
│   ├── login.html             # Authentication Gateway
│   ├── css/                   # Stylesheets & typography
│   ├── js/                    # D3.js v7, Leaflet, and app controllers
│   └── assets/                # Logos and icons
├── backend/                   # REST API & Application Server
│   ├── server.js              # Express REST API, auth & endpoints
│   ├── package.json           # Backend dependency manifest
│   └── README.md              # Backend endpoint guide
├── database/                  # Data Backbone & Datastores
│   ├── db_store.json          # Active 2,304 telemetry observation tuples
│   ├── stations.json          # 64 CAAQMS station registries
│   ├── air_quality_india_realtime.xlsx # Multi-sheet statutory Excel workbook
│   ├── kaggle_city_day.csv    # Benchmark baseline dataset
│   └── README.md              # Database schemas & documentation
├── docs/                      # Academic Documentation & Presentations
│   ├── Air_Quality_Monitoring_Presentation.pptx # Project Slide Deck
│   ├── Air_Quality_Monitoring_Report.docx       # Full Academic Report
│   ├── PROJECT_REPORT.md      # Markdown report
│   ├── PROJECT_OVERVIEW.md    # Architecture overview
│   └── report_images/         # High-resolution visual diagrams
├── scripts/                   # Data processing, seeding & build scripts
├── package.json               # Root monorepo script runner
├── server.js                  # Root forwarder entry point
└── README.md                  # Project documentation hub
```

---

## 🌟 Executive Overview & Highlights

**Air Quality Monitoring** is an interactive, browser-based environmental intelligence and air quality visualization platform engineered to transform high-dimensional atmospheric sensor records into actionable visual analytics. The platform replaces static government bulletins and spreadsheets with reactive, declarative web visualization driven by **D3.js v7**, **Leaflet v1.9.4**, **SheetJS (XLSX)**, and a **Node.js Express** REST datastore.

- **Verified Ingested Dataset:** 2,304 daily records covering 64 major Indian urban centers across 5 national geographical zones (including 50 stations across South India).
- **National Average AQI:** **61 / 500** (`MODERATE`)
- **Particulate Matter (PM2.5):** **32.0 µg/m³** (🚨 **2.1x WHO Safe Limit** of 15 µg/m³)
- **Respirable Dust (PM10):** **43.1 µg/m³** (⚠️ **1.0x WHO Limit** of 45 µg/m³)
- **Peak Hotspot Excursion:** **500 Peak** at **Gurugram on 03/09** (Hazardous Smog Emergency)
- **Period Trend Shift (Δ):** **+9.1%** (`DETERIORATING ↑`, Rising Pollution)
- **Data Integrity:** 0 Duplicate IDs, 0 Missing Dates, 0 Out-of-Bounds AQI readings, 100% Geocoded Coordinates.
- **Deep South Indian Grid:** Complete real-time and historical coverage across **Telangana** (8 stations), **Andhra Pradesh** (12 stations), **Karnataka** (11 stations), **Tamil Nadu** (13 stations), **Kerala** (5 stations), and **Puducherry** (1 station).

---

## 🔗 Official Atmospheric Data Sources & Direct Links

All environmental telemetry visualized in Air Quality Monitoring is grounded in statutory Indian and international atmospheric monitoring portals:

1. **Central Pollution Control Board (CPCB) Official Portal**  
   - **Agency:** Ministry of Environment, Forest & Climate Change (MoEFCC), Govt. of India  
   - **Official Homepage:** [https://cpcb.nic.in](https://cpcb.nic.in)  
   - **Live National CAAQMS Data Portal:** [https://app.cpcbccr.com/AQI_India/](https://app.cpcbccr.com/AQI_India/)  
   - **Protocol:** National Air Quality Index (NAQI) Guidelines, Breakpoints and Technical Specifications.

2. **Open Government Data (OGD) Platform India (data.gov.in)**  
   - **Agency:** National Informatics Centre (NIC), Ministry of Electronics & IT  
   - **Direct Dataset Link:** [https://data.gov.in/resource/real-time-air-quality-index](https://data.gov.in/resource/real-time-air-quality-index)  
   - **Description:** Real-time and daily CAAQMS ambient observation feeds across municipal stations.

3. **Kaggle CAAQMS Indian Air Quality Dataset (Rohan Rao)**  
   - **Benchmark Extract:** [https://www.kaggle.com/datasets/rohanrao/air-quality-data-in-india](https://www.kaggle.com/datasets/rohanrao/air-quality-data-in-india)  
   - **Description:** Verified multi-year station-day and city-day telemetry covering critical Indian urban centers.

4. **World Health Organization (WHO) Global Air Quality Guidelines**  
   - **Publication Link:** [https://www.who.int/publications/i/item/9789240034228](https://www.who.int/publications/i/item/9789240034228)  
   - **Fact Sheet:** [https://www.who.int/news-room/fact-sheets/detail/ambient-(outdoor)-air-quality-and-health](https://www.who.int/news-room/fact-sheets/detail/ambient-(outdoor)-air-quality-and-health)  
   - **Safety Limits:** 24-hour safe limits for PM2.5 (15 µg/m³) and PM10 (45 µg/m³).

---

## 📊 Comprehensive Visualizations & Intelligence Suites Built

The dashboard features **11 distinct, coordinated visualization and intelligence engines**:

1. **Dedicated Authentication Gateway (login.html):** First-entry portal with PBKDF2 encryption, Google SSO mock, and instant Demo Guest Access before dashboard entry.
2. **Executive Command Center (Figure 6.1):** 5 Animated KPI cards (AQI, PM2.5, PM10, Peak Hotspot, Period Shift) with quick filters.
3. **Live Atmospheric Breaking Telemetry Ticker (NEW):** Real-time streaming marquee highlighting cleanest airsheds, hazardous spikes, and meteorological warnings.
4. **City Comparison Ranking (Figure 6.2):** D3 ranked dot/bar chart with `Avg: 61` baseline and `Worst First`, `Cleanest`, `A-Z` sort toggles.
5. **Geospatial Satellite Map (Figure 6.2):** Leaflet satellite/hybrid map with 64 pulsating sensor beacons (50 South Indian stations), **50km radial population hazard exposure rings**, directional pan/zoom D-Pad buttons, and regional quick-jump pills.
6. **1,500-Node Particle Physics Simulator:** Real-time Lagrangian fluid advection simulation of wind flow on HTML5 Canvas.
7. **Multi-City Temporal Trend & Crosshair HUD (Figures 6.3 & 6.4):** Continuous monotone splines (`d3.curveMonotoneX`), statutory CPCB safety bands, and bisector crosshair inspection for all 64 cities.
8. **24-Hour Predictive AQI Forecast Engine (D3.js Area & Spline) (NEW):** Autoregressive forward trajectory modeling with 95% confidence intervals and peak smog window flag.
9. **Meteorological Boundary Layer Barometer (NEW):** Real-time Wind vector, ambient temperature, humidity, planetary boundary layer height (PBLH), and CPCB ventilation coefficient ($V_c$).
10. **Airshed Face-Off: Dual-City Head-to-Head Comparator (NEW):** Synchronized side-by-side comparison of any two cities with particulate ratios and comparative health verdict.
11. **Clinical Cohort Vulnerability Matrix (NEW):** Epidemiological risk stratification for Children, Elderly, Asthmatics, and Outdoor Workers with actionable medical advisories.
12. **Deep-Dive Verified Records Explorer (Figure 6.5):** Searchable, sortable, paginated data table with CRUD deletion, RFC-4180 CSV export, and multi-sheet Excel download.
13. **Audio Atmospheric Briefing (NEW):** Voice speech synthesis and acoustic chime for audible environmental intelligence briefings.

---

## 📑 Multi-Sheet Excel Datastore (`air_quality_india_realtime.xlsx`)

A comprehensive 4-sheet structured Excel workbook (1.92 MB) updated in-place and available for download directly via the UI or endpoint `/api/export/excel`:

- **Sheet 1 (`India_Realtime_AQI`):** All 2,304 verified continuous observation tuples (Station Code, City, State, Zone, Coordinates, Elevation, Date, AQI, PM2.5, PM10, NO2, SO2, CO, O3, NH3, Category, Advisory, Source).
- **Sheet 2 (`Station_Metadata`):** Complete registry of all 64 monitoring stations (50 across South India) with elevation, latitude, longitude, and historical averages.
- **Sheet 3 (`CPCB_NAQI_Breakpoints`):** Statutory breakpoints for Indian CPCB AQI classifications (Good to Severe).
- **Sheet 4 (`Data_Sources_and_Links`):** Authoritative citations, publisher names, descriptions, and active hyperlinks.

---

## 🚀 Quick Start Guide

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   # or
   npm start
   ```

3. **Open in browser:**
   - **Authentication Portal (Opens First):** [http://localhost:3000](http://localhost:3000) (or `/login.html`)
     - *Demo Credentials:* `analyst` / `admin123`
     - *Or single-click:* `Demo Guest Access (Instant)` / `Continue with Google`
   - **Direct Dashboard (Authenticated):** [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
