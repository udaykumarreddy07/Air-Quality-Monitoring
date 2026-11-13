# Air Quality Monitoring - Frontend Client

This directory contains the client-side presentation layer and interactive data visualization engines for **Air Quality Monitoring**.

## 📁 Directory Structure

```text
frontend/
├── index.html         # Main Executive Command Center & Visual Dashboard
├── login.html         # Secure Authentication Gateway (PBKDF2 / Demo Guest Access)
├── css/
│   ├── style.css      # Core styles, responsive grid, dark glassmorphism theme
│   ├── all.min.css    # FontAwesome icon typography
│   └── webfonts/      # Font typography assets
├── js/
│   ├── app.js         # Core application coordinator, state manager, audio briefing
│   ├── charts.js      # D3.js v7 visualization charts (Rankings, Trends, Radar, Area)
│   ├── map.js         # Leaflet geospatial map, 50km hazard exposure rings, particle layer
│   ├── table.js       # Verified records explorer, search, pagination, and CSV export
│   ├── d3.v7.min.js   # D3.js v7 library
│   ├── leaflet.js     # Leaflet v1.9.4 geospatial mapping library
│   └── xlsx.full.min.js # SheetJS XLSX parser
└── assets/
    └── ...            # Media assets and logos
```

## 🎨 Visualization Modules (D3.js & Leaflet)
1. **D3 Monotone Trend Spline:** Dynamic interactive time-series with bisector crosshairs.
2. **CPCB Breakpoint Gauge & KPI Cards:** Real-time metrics with categorical color bands.
3. **Multi-Pollutant Radar Chart:** Normalized polar coordinate assessment of PM2.5, PM10, NO2, SO2, CO, O3.
4. **Predictive 24-Hour Forecast Engine:** Forward trajectory curve with 95% confidence intervals.
5. **Interactive Geospatial Sensor Network:** Leaflet sensor beacons with radial hazard buffers.
6. **Lagrangian Wind Particle Canvas:** 1,500-particle fluid advection visualizer.
