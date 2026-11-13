# Air Quality Monitoring – Engineering Implementation Plan
## Real-Time Air Quality & Atmospheric Pollution Visualization Dashboard
**Course:** CSE221 – Interactive Data Visualization using D3.js  
**Author:** Tellapeli Hasini (Reg No: 98260040005)  
**Institution:** Kalasalingam Academy of Research and Education  
**Academic Year:** 2026 – 2027  

---

## 1. Project Inception & Requirements Breakdown

The Air Quality Monitoring engineering plan defines an end-to-end roadmap for building, optimizing, and deploying an interactive, browser-based air quality intelligence platform. The project requirement matrix is divided into five core functional domains:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        REQUIREMENTS DOMAIN MATRIX                      │
├───────────────────────┬────────────────────────────────────────────────┤
│ 1. Data Engineering   │ In-place Excel synchronization, 2,304 records, │
│                       │ 64 stations (50 South India), CPCB breakpoints │
├───────────────────────┼────────────────────────────────────────────────┤
│ 2. Backend API        │ Express REST service, JSON datastore, CORS,    │
│                       │ EADDRINUSE conflict resilience, static serving │
├───────────────────────┼────────────────────────────────────────────────┤
│ 3. Geospatial Engine  │ Leaflet Google Hybrid, pure manual pan/zoom,   │
│                       │ non-blocking 50km hazard rings, live viewport  │
├───────────────────────┼────────────────────────────────────────────────┤
│ 4. Visual Analytics   │ D3.js v7: Temporal splines with safety bands,  │
│                       │ 6-axis radar, zonal bars, donut, scatter plot  │
├───────────────────────┼────────────────────────────────────────────────┤
│ 5. Deep-Dive Systems  │ Slide-over Airshed Drawer, Pollutant Modal,    │
│                       │ table search/sort/paginate, CSV/JSON export    │
└───────────────────────┴────────────────────────────────────────────────┘
```

---

## 2. Engineering Phases & Work Breakdown Structure (WBS)

```
[Phase 1: Environment Setup] ──► [Phase 2: Data Ingestion & Excel Engine]
                                                │
                                                ▼
[Phase 4: UI Glassmorphic Shell] ◄── [Phase 3: Express Backend REST API]
       │
       ▼
[Phase 5: Leaflet Pure Manual Map] ──► [Phase 6: D3.js Visual Engines (5 Charts)]
                                                │
                                                ▼
[Phase 8: Table & Export Engine] ◄── [Phase 7: Deep-Dive Drawer & Modal]
       │
       ▼
[Phase 9: Verification, EADDRINUSE Resilience & Performance Benchmarks]
```

---

### Phase 1: Environment Setup, Tooling & Package Configuration
- **Objective:** Establish a clean, standardized Node.js development environment supporting Vanilla ES6+, D3.js, Leaflet, and SheetJS.
- **Key Tasks:**
  1. Initialize `package.json` with project metadata, dependencies (`express`, `xlsx`), and npm lifecycle scripts:
     - `"start": "node server.js"`
     - `"dev": "node server.js"`
     - `"watch": "node --watch server.js"`
  2. Verify local Node.js runtime compatibility (Node.js v18.x to v22.x).
  3. Configure workspace directory structure:
     - `public/`: Client web assets (`index.html`, `login.html`, `css/`, `js/`).
     - `data/`: Excel workbook (`air_quality_india_realtime.xlsx`), JSON datastore (`db_store.json`), and station metadata (`stations.json`).
     - `scripts/`: Data ingestion, generation, and verification scripts.
  4. Ensure zero external UI framework dependencies (pure native Vanilla ES6+ and CSS3).

---

### Phase 2: Multi-Source Data Ingestion & In-Place Excel Engine
- **Objective:** Ingest, clean, validate, and synchronize multi-source atmospheric telemetry into a persistent, structured Excel workbook.
- **Key Tasks:**
  1. **Data Source Integration:**
     - Central Pollution Control Board (CPCB) official CAAQMS telemetry.
     - Kaggle historical atmospheric data (`city_day.csv`).
     - OpenAQ API real-time observation feeds.
  2. **Dense Southern India Expansion:**
     - Expand national station network to **64 stations total**.
     - Provision a high-density **50-station network in Southern India** covering:
       - *Telangana (13 stations):* Hyderabad, Warangal, Karimnagar, Nizamabad, Khammam, Ramagundam, Mahbubnagar, Nalgonda, Adilabad, Siddipet, Suryapet, Miryalaguda, Jagtial.
       - *Andhra Pradesh (18 stations):* Visakhapatnam, Vijayawada, Guntur, Nellore, Kurnool, Rajamahendravaram, Tirupati, Kakinada, Kadapa, Anantapur, Vizianagaram, Eluru, Ongole, Nandyal, Machilipatnam, Adoni, Tenali, Proddatur.
       - *Karnataka (10 stations):* Bengaluru, Mysuru, Hubballi-Dharwad, Mangaluru, Belagavi, Kalaburagi, Davanagere, Ballari, Vijayapura, Shivamogga.
       - *Tamil Nadu (9 stations):* Chennai, Coimbatore, Madurai, Tiruchirappalli, Salem, Tirunelveli, Tiruppur, Vellore, Erode.
  3. **In-Place Excel Workbook Architecture:**
     - Maintain and update `data/air_quality_india_realtime.xlsx` (1.92 MB) in-place without creating redundant files.
     - Structure into 4 comprehensive sheets:
       - `RealTime_AirQuality_Stations` (2,304 rows).
       - `Station_Metadata` (64 stations with WGS-84 coordinates and elevation).
       - `CPCB_NAAQS_Breakpoints` (Statutory pollutant sub-index boundaries).
       - `Data_Sources_Citations` (Official URLs, CPCB links, Kaggle citations).
  4. **Validation Pipeline:**
     - Enforce non-negative numerical limits, unique `rec_id` keys, valid dates, and 100% coordinate geocoding.

---

### Phase 3: Express Backend REST API Architecture
- **Objective:** Build a high-performance, asynchronous REST backend providing aggregated analytics and raw record streams.
- **Key Tasks:**
  1. Author `server.js` using Express v5.
  2. Implement local JSON file persistence (`data/db_store.json`) synced with the Excel workbook.
  3. Construct comprehensive REST endpoints:
     - `GET /api/kpi`: Computes National Average AQI, $\text{PM}_{2.5}$, $\text{PM}_{10}$, peak hotspot, and period delta.
     - `GET /api/stations`: Returns 64 stations with coordinates, current AQI, and category.
     - `GET /api/trends`: Returns 60-day daily temporal trend arrays for all stations.
     - `GET /api/rankings`: Returns sorted city rankings (Worst First / Best First).
     - `GET /api/analytics/radar`: Computes 6-axis normalized pollutant averages.
     - `GET /api/analytics/zonal`: Computes aggregated mean AQI across 5 macro-zones.
     - `GET /api/analytics/categories`: Computes record counts across 6 CPCB hazard buckets.
     - `GET /api/analytics/correlation`: Computes $(\text{PM}_{2.5}, \text{PM}_{10})$ paired points and linear regression.
     - `GET /api/export/csv` & `GET /api/export/json`: Data streaming endpoints.
     - `DELETE /api/records/:id`: Authenticated record removal.
  4. **Port Conflict Resilience:**
     - Add `server.on('error', (err) => ...)` to catch `EADDRINUSE` gracefully and output a clear troubleshooting command:  
       `Stop-Process -Name node -Force`.

---

### Phase 4: UI Glassmorphic Design System & Responsive Shell
- **Objective:** Create an ergonomic, dark glassmorphic interface supporting multi-panel data exploration.
- **Key Tasks:**
  1. Construct `public/index.html` with semantic structure:
     - Brand header & live dataset telemetry pills.
     - Quick filter navigation ribbon (City dropdown, Metric selector, Timeline presets).
     - Five animated KPI cards.
     - Geospatial satellite map card with dynamic leaderboard.
     - Multi-city temporal trend section.
     - Multi-dimensional analytics grid (Radar, Zonal Bar, Donut, Scatter Plot).
     - Verified records explorer table.
     - Slide-over Airshed Drawer & Pollutant Modal.
  2. Author `public/css/style.css`:
     - Dark glassmorphism theme (`background: #0a0e17`, cards: `rgba(18, 24, 38, 0.88)`, `backdrop-filter: blur(16px)`).
     - Custom grab/grabbing cursors for map canvas.
     - Responsive grid and flexbox layouts.

---

### Phase 5: Leaflet Geospatial Cartography with Pure Manual Navigation
- **Objective:** Implement a responsive, uncluttered satellite map supporting pure manual drag and zoom gestures.
- **Key Tasks:**
  1. Author `public/js/map.js` wrapping Leaflet v1.9.4.
  2. Initialize Google Hybrid satellite tile layer with seamless layer switcher (Hybrid, Street, Terrain).
  3. **Pure Manual Pan & Zoom Navigation:**
     - Remove all on-screen D-Pad directional buttons, pan buttons, and zoom controls.
     - Enable native Leaflet dragging (`dragging: true`), scroll-wheel zooming (`scrollWheelZoom: true`), and touch zooming.
     - Apply `cursor: grab;` and `:active { cursor: grabbing; }`.
  4. **Non-Blocking Hazard Exposure Rings:**
     - Render 50km hazard circles with `interactive: false` so user drag gestures pass cleanly to the Leaflet viewport engine.
     - Render connection lines with `interactive: false`.
  5. **Dynamic Viewport Synchronization:**
     - Attach `move` and `zoomend` listeners to filter stations within `map.getBounds()`.
     - Dynamically update visible station count badge and re-render floating leaderboard in real time.
  6. **Spatial Intercept:**
     - Handle map clicks by dropping a sonar ping, drawing a dashed intercept line to the nearest station, and automatically opening the Airshed Drawer.

---

### Phase 6: Declarative D3.js v7 Visual Analytics Suite
- **Objective:** Develop five coordinated D3 visualizations reflecting statutory CPCB standards.
- **Key Tasks:**
  1. Author `public/js/charts.js` implementing specialized visual engines:
  2. **Engine 1: Multi-City Temporal Trend Line Chart:**
     - Continuous cubic monotone spline curves (`d3.curveMonotoneX`).
     - Horizontal color-coded CPCB safety boundary bands (*Good* to *Severe*).
     - Interactive crosshair HUD with vertical timestamp guide, animated white-ring active data dot, and background curve dimming.
  3. **Engine 2: 6-Axis Multi-Pollutant Radar Fingerprint:**
     - Equi-angular radial axes (`d3.lineRadial`) normalized to CPCB limits for $\text{PM}_{2.5}$, $\text{PM}_{10}$, $\text{NO}_2$, $\text{SO}_2$, $\text{CO}$, $\text{O}_3$.
  4. **Engine 3: Zonal AQI Distribution Bar Chart:**
     - Vertical bars comparing mean AQI across 5 macro-zones with gradient fills and click-to-filter interaction.
  5. **Engine 4: CPCB Category Donut Chart:**
     - Proportional hazard distribution using `d3.pie` and `d3.arc` with center percentage readouts.
  6. **Engine 5: Particulate Correlation Scatter Plot:**
     - Scatter points plotting $\text{PM}_{2.5}$ vs $\text{PM}_{10}$ with WHO guideline boundary lines and ordinary least squares (OLS) linear regression trend line ($R^2 = 0.88$).

---

### Phase 7: Deep-Dive Airshed Drawer & Pollutant Modal Systems
- **Objective:** Provide instant details-on-demand whenever the user touches any place or element in the dashboard.
- **Key Tasks:**
  1. Implement slide-over `#airshedDrawer` in `public/index.html` and `public/js/app.js`:
     - Displays comprehensive station telemetry: composite AQI, CPCB category badge, 6-parameter concentration gauges, primary driver identification, WHO limit exceedance multipliers, and clinical health advisories.
  2. Implement chemical `#modalPollutantDetail`:
     - Displays molecular properties, NAAQS statutory thresholds, emission sources, respiratory health hazards, and clinical mitigation steps.
  3. Wire click triggers across map markers, map coordinates, chart elements, and table rows to open the Airshed Drawer seamlessly.

---

### Phase 8: Incident Explorer Data Table & Multi-Format Export
- **Objective:** Provide a fast, searchable tabular record explorer with client-side CSV and JSON export.
- **Key Tasks:**
  1. Author `public/js/table.js` implementing client-side sorting, pagination (25, 50, 100 per page), and real-time multi-column search.
  2. Implement client-side export generator constructing RFC-4180 compliant CSV and JSON files directly in browser memory via `URL.createObjectURL(new Blob(...))`.

---

### Phase 9: Verification, Quality Assurance & Performance Profiling
- **Objective:** Validate end-to-end mathematical consistency, zero syntax errors, and sub-100ms response benchmarks.
- **Key Tasks:**
  1. Execute JavaScript syntax checks on all client and server files:
     `node -c public/js/map.js`, `node -c public/js/app.js`, `node -c server.js`.
  2. Test all 10 REST API endpoints to confirm `200 OK` status and valid JSON payloads.
  3. Profile rendering latencies:
     - Boot time: < 350 ms.
     - D3 chart render: < 40 ms.
     - Map pan/zoom: 60 FPS fluid motion.
     - Global filter cross-update: < 30 ms.

---

## 3. Technical Risk Management & Mitigation

| Potential Risk | Root Cause | Impact | Mitigation Strategy |
|:---|:---|:---|:---|
| **Map Drag Interception** | `L.circle` defaults to `interactive: true` in Leaflet, capturing mouse clicks | Prevents manual drag over dense station clusters | Explicitly set `interactive: false` on all 50km hazard rings and polylines |
| **Port Conflict (`EADDRINUSE`)** | Orphan Node processes retaining port 3000 | `npm run dev` fails with port error | Implemented `server.on('error', ...)` with descriptive PowerShell kill command |
| **Script Execution Error** | Missing `"dev"` script in `package.json` | `npm run dev` reports missing script | Added `"dev": "node server.js"` and `"watch": "node --watch server.js"` |
| **Chart Re-render Memory Leak** | Repeatedly appending SVG elements on filter change | Browser memory bloat and sluggishness | Employed D3 general update pattern (`enter()`, `update()`, `exit().remove()`) |
| **Accidental Drawer Open on Drag** | Map click event firing right after drag release | Unwanted drawer opens when user is simply panning | Added drag threshold distance tracker (`hypot > 6px`) to distinguish drag from click |

---

## 4. Validation Checklist & Acceptance Criteria

- [x] Ingested 2,304 verified records across 64 stations (50 South India grid stations).
- [x] In-place Excel workbook (`air_quality_india_realtime.xlsx`) updated and preserved with 4 sheets.
- [x] Express REST server active with 10 operational endpoints returning `200 OK`.
- [x] All movement buttons, D-Pads, and pan buttons removed from the map.
- [x] Pure manual mouse drag (left, right, up, down) and scroll-wheel zoom working smoothly everywhere.
- [x] 50km hazard rings set to `interactive: false` so pointer events pass cleanly to map.
- [x] Floating leaderboard and station counter update dynamically with visible viewport.
- [x] Five animated KPI cards computing National Average, $\text{PM}_{2.5}$, $\text{PM}_{10}$, Peak Hotspot, and Period Delta.
- [x] D3.js temporal spline curves with CPCB safety bands and interactive crosshair HUD.
- [x] Multi-pollutant radar fingerprint, zonal distribution bars, category donut, and particulate scatter plot active.
- [x] Slide-over Airshed Drawer (`#airshedDrawer`) and Pollutant Modal (`#modalPollutantDetail`) fully responsive.
- [x] Verified records explorer with search, sorting, pagination, and instant CSV/JSON export.
- [x] `npm run dev` starts cleanly without errors.

