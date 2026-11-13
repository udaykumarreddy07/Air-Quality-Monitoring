/**
 * Air Quality Monitoring - Leaflet Geospatial Station Map & Monitoring Leaderboard
 * Google Hybrid Tiles, 44 Pulsating Sensor Beacons, 50km Hazard Rings, and Particle Overlay
 */

class AirQualityMonitoringMap {
  constructor(containerId = 'leafletMap', onStationSelect = null) {
    this.containerId = containerId;
    this.onStationSelect = onStationSelect;
    this.map = null;
    this.markers = {};
    this.hazardRings = {};
    this.activeTileLayer = null;
    this.particleSim = null;
    this.stationsData = [];
    this.clickPingMarker = null;
    this.clickConnectLine = null;

    this.tileProviders = {
      hybrid: L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 18,
        attribution: 'Map data &copy; Google'
      }),
      street: L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap, &copy; CARTO'
      }),
      terrain: L.tileLayer('https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
        maxZoom: 18,
        attribution: 'Map data &copy; Google Terrain'
      })
    };

    this.initMap();
    this.initParticleOverlay();
  }

  initMap() {
    // Center of India: ~21.5° N, 79.5° E, zoom level 5
    // Full manual interaction: mouse drag, touch pan (left, right, up, down), mouse wheel zoom
    this.map = L.map(this.containerId, {
      center: [21.8, 79.5],
      zoom: 5,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      boxZoom: true,
      keyboard: true,
      tap: false,
      inertia: true,
      inertiaDeceleration: 3000,
      inertiaMaxSpeed: 2000,
      easeLinearity: 0.2
    });

    // Track dragging vs pure clicks to enable seamless manual pan & touch
    let isDraggingOrMoving = false;
    let dragStartPos = null;

    this.map.on('mousedown touchstart', (e) => {
      const orig = e.originalEvent;
      if (!orig) return;
      const clientX = orig.touches ? orig.touches[0].clientX : orig.clientX;
      const clientY = orig.touches ? orig.touches[0].clientY : orig.clientY;
      dragStartPos = { x: clientX, y: clientY };
    });

    this.map.on('movestart', () => {
      isDraggingOrMoving = true;
    });

    this.map.on('moveend', () => {
      this.handleViewportMove();
      setTimeout(() => {
        isDraggingOrMoving = false;
        dragStartPos = null;
      }, 140);
    });

    this.map.on('zoomend', () => {
      this.handleViewportMove();
    });

    // Map click listener - Touch anywhere to inspect nearest airshed (only if NOT dragged)
    this.map.on('click', (e) => {
      const orig = e.originalEvent;
      if (dragStartPos && orig) {
        const clientX = orig.clientX !== undefined ? orig.clientX : (orig.changedTouches && orig.changedTouches[0]?.clientX);
        const clientY = orig.clientY !== undefined ? orig.clientY : (orig.changedTouches && orig.changedTouches[0]?.clientY);
        if (clientX !== undefined && clientY !== undefined) {
          const dist = Math.hypot(clientX - dragStartPos.x, clientY - dragStartPos.y);
          if (dist > 6) return; // User manually dragged the map, not a click
        }
      }
      if (isDraggingOrMoving) return;
      if (e.latlng) {
        this.handleMapClick(e.latlng);
      }
    });

    // Default tile: Hybrid
    this.setTileLayer('hybrid');

    // Wire up collapse toggle for floating leaderboard
    document.getElementById('btnToggleLeaderboard')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleLeaderboardCollapse();
    });

    // Wire up D-Pad directional navigation buttons (Left, Right, Up, Down, Center)
    document.getElementById('btnPanUp')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.panUp();
    });
    document.getElementById('btnPanDown')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.panDown();
    });
    document.getElementById('btnPanLeft')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.panLeft();
    });
    document.getElementById('btnPanRight')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.panRight();
    });
    document.getElementById('btnPanCenter')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.resetView();
    });

    // Wire up Zoom in / Zoom out buttons
    document.getElementById('btnZoomIn')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.zoomIn();
    });
    document.getElementById('btnZoomOut')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.zoomOut();
    });

    // Keyboard Arrow Key & +/- Navigation (accessibility)
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (document.querySelector('.modal-backdrop.open')) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.panUp();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.panDown();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.panLeft();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.panRight();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        this.zoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        this.zoomOut();
      }
    });

    // Wire up recenter button if present
    document.getElementById('btnMapRecenter')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.resetView();
    });
  }

  panUp(px = 160) {
    try {
      if (this.map) this.map.panBy([0, -px], { animate: true, duration: 0.35 });
    } catch (err) {
      console.warn('Map panUp error:', err);
    }
  }

  panDown(px = 160) {
    try {
      if (this.map) this.map.panBy([0, px], { animate: true, duration: 0.35 });
    } catch (err) {
      console.warn('Map panDown error:', err);
    }
  }

  panLeft(px = 180) {
    try {
      if (this.map) this.map.panBy([-px, 0], { animate: true, duration: 0.35 });
    } catch (err) {
      console.warn('Map panLeft error:', err);
    }
  }

  panRight(px = 180) {
    try {
      if (this.map) this.map.panBy([px, 0], { animate: true, duration: 0.35 });
    } catch (err) {
      console.warn('Map panRight error:', err);
    }
  }

  zoomIn() {
    try {
      if (this.map) {
        this.map.zoomIn(1);
        this.updateZoomReadout();
      }
    } catch (err) {
      console.warn('Map zoomIn error:', err);
    }
  }

  zoomOut() {
    try {
      if (this.map) {
        this.map.zoomOut(1);
        this.updateZoomReadout();
      }
    } catch (err) {
      console.warn('Map zoomOut error:', err);
    }
  }

  updateZoomReadout() {
    try {
      if (!this.map) return;
      const zoom = this.map.getZoom();
      const readouts = document.querySelectorAll('#mapZoomLevelReadout');
      readouts.forEach(r => {
        r.innerText = `${zoom.toFixed(1)}x`;
      });
    } catch (e) {
      // ignore
    }
  }

  handleViewportMove() {
    try {
      this.updateZoomReadout();
      if (!this.map || !this.stationsData || this.stationsData.length === 0) return;
      const bounds = this.map.getBounds();
      const visible = this.stationsData.filter(st => bounds.contains([st.lat, st.lng]));

      const countBadge = document.getElementById('mapVisibleCountBadge');
      if (countBadge) {
        countBadge.innerText = `${visible.length} of ${this.stationsData.length} in View`;
      }

      // Move and update the leaderboard with visible stations
      this.renderLeaderboard(visible.length > 0 ? visible : this.stationsData);
    } catch (err) {
      console.warn('Viewport move error:', err);
    }
  }

  toggleLeaderboardCollapse() {
    const board = document.getElementById('floatingLeaderboard');
    const btn = document.getElementById('btnToggleLeaderboard');
    if (board) {
      board.classList.toggle('minimized');
      if (btn) {
        btn.innerText = board.classList.contains('minimized') ? '+' : '–';
      }
    }
  }

  setCameraRegion(regionKey) {
    try {
      const regions = {
        all: { center: [21.8, 79.5], zoom: 5 },
        south: { center: [14.0, 78.5], zoom: 6.5 }, // Telangana, Andhra, Karnataka, Tamil Nadu, Kerala
        north: { center: [28.6, 77.2], zoom: 6.8 }, // Delhi, NCR, Punjab, Haryana, UP
        west: { center: [19.2, 73.8], zoom: 7.0 },  // Mumbai, Pune
        east: { center: [24.0, 86.0], zoom: 6.5 }   // Kolkata, Bihar, Northeast
      };

      const target = regions[regionKey] || regions.all;
      if (this.map) {
        this.map.flyTo(target.center, target.zoom, {
          duration: 1.2,
          easeLinearity: 0.25
        });
      }
    } catch (err) {
      console.warn('setCameraRegion error:', err);
    }
  }

  calcDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  handleMapClick(latlng) {
    if (!latlng || typeof latlng.lat !== 'number' || typeof latlng.lng !== 'number') return;
    if (!this.stationsData || this.stationsData.length === 0) return;

    try {
      // Find nearest station
      let nearest = null;
      let minDist = Infinity;

      this.stationsData.forEach(st => {
        const d = this.calcDistanceKm(latlng.lat, latlng.lng, st.lat, st.lng);
        if (d < minDist) {
          minDist = d;
          nearest = st;
        }
      });

      if (!nearest) return;

      // Clear previous click pin and line
      if (this.clickPingMarker) this.map.removeLayer(this.clickPingMarker);
      if (this.clickConnectLine) this.map.removeLayer(this.clickConnectLine);

      // Add sonar ping marker at clicked position
      const pingIcon = L.divIcon({
        className: 'custom-ping-icon',
        html: '<div class="spatial-sonar-ring"></div>',
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      this.clickPingMarker = L.marker(latlng, { icon: pingIcon }).addTo(this.map);

      // Connect clicked point to nearest station with dashed line (non-interactive so it never blocks drag)
      this.clickConnectLine = L.polyline([latlng, [nearest.lat, nearest.lng]], {
        color: '#38bdf8',
        weight: 2,
        dashArray: '6, 6',
        opacity: 0.85,
        interactive: false
      }).addTo(this.map);

      const aqiColor = this.getCategoryColor(nearest.avg_aqi);
      const popupContent = `
        <div style="min-width: 220px; padding: 4px;">
          <div style="font-size: 10px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">
            📍 Spatial Airshed Intercept
          </div>
          <div style="font-size: 11px; color: #94a3b8; font-family: monospace; margin-bottom: 6px;">
            ${latlng.lat.toFixed(3)}°N, ${latlng.lng.toFixed(3)}°E
          </div>
          <div style="font-size: 12px; color: #fff; margin-bottom: 4px;">
            Nearest Station: <strong>${nearest.city}</strong> (${minDist.toFixed(1)} km)
          </div>
          <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 18px; font-weight: 800; color: ${aqiColor};">${nearest.avg_aqi} AQI</span>
            <span style="font-size: 10px; font-weight: 700; color: ${aqiColor}; background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 3px;">${nearest.category}</span>
          </div>
          <button onclick="window.AirQualityMonitoringApp.openAirshedDrawer('${nearest.city}')" style="width: 100%; padding: 6px 10px; background: #0284c7; border: 1px solid #38bdf8; border-radius: 4px; color: #fff; font-size: 11px; font-weight: 700; cursor: pointer;">
            Inspect ${nearest.city} Airshed Details →
          </button>
        </div>
      `;

      this.clickPingMarker.bindPopup(popupContent).openPopup();

      // Automatically open the rich Airshed Deep Dive Drawer
      if (window.AirQualityMonitoringApp && window.AirQualityMonitoringApp.openAirshedDrawer) {
        window.AirQualityMonitoringApp.openAirshedDrawer(nearest.city);
        window.AirQualityMonitoringApp.showToast(`Spatial Intercept: Linked to nearest CAAQMS station ${nearest.city} (${minDist.toFixed(1)} km)`);
      }
    } catch (err) {
      console.warn('handleMapClick error:', err);
    }
  }

  setTileLayer(layerKey) {
    if (this.activeTileLayer) {
      this.map.removeLayer(this.activeTileLayer);
    }
    const layer = this.tileProviders[layerKey] || this.tileProviders.hybrid;
    layer.addTo(this.map);
    this.activeTileLayer = layer;
  }

  initParticleOverlay() {
    try {
      const containerEl = document.getElementById(this.containerId);
      if (!containerEl || !containerEl.parentElement) return;
      const mapContainer = containerEl.parentElement;
      let canvas = document.getElementById('mapParticleCanvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'mapParticleCanvas';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '400';
        mapContainer.appendChild(canvas);
      }
      this.particleSim = new AtmosphericParticleSimulator(canvas, { numParticles: 800 });
      this.particleSim.start();
    } catch (err) {
      console.warn('Atmospheric particle simulator initialization skipped:', err);
    }
  }

  getCategoryColor(aqi) {
    if (aqi <= 50) return '#10b981';
    if (aqi <= 100) return '#eab308';
    if (aqi <= 150) return '#f97316';
    if (aqi <= 200) return '#ef4444';
    if (aqi <= 300) return '#a855f7';
    return '#dc2626';
  }

  renderStations(stationsList) {
    this.stationsData = stationsList;

    // Clear previous
    Object.values(this.markers).forEach(m => this.map.removeLayer(m));
    Object.values(this.hazardRings).forEach(r => this.map.removeLayer(r));
    this.markers = {};
    this.hazardRings = {};

    stationsList.forEach(st => {
      const color = this.getCategoryColor(st.avg_aqi);

      // 1. 50km Hazard Exposure Ring (interactive: false ensures manual mouse/touch dragging passes directly to Leaflet)
      const ring = L.circle([st.lat, st.lng], {
        radius: 50000, // 50km in meters
        color: color,
        fillColor: color,
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '4, 4',
        interactive: false
      }).addTo(this.map);
      this.hazardRings[st.city] = ring;

      // 2. Custom Pulsating Beacon Marker
      const iconHtml = `
        <div style="background-color: ${color}; color: ${color};" class="pulsating-marker" title="${st.city} (${st.avg_aqi} AQI)"></div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-beacon-icon',
        html: iconHtml,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker([st.lat, st.lng], { icon: customIcon }).addTo(this.map);

      // Popup Content with deep dive trigger
      const popupHtml = `
        <div style="min-width: 210px; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
            <strong style="font-size: 14px; color: #fff;">${st.city}</strong>
            <span style="font-size: 10px; color: #94a3b8;">${st.state}</span>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-size: 18px; font-weight: 800; color: ${color};">${st.avg_aqi} <small style="font-size: 11px; color:#94a3b8;">AQI</small></span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.1); color: ${color};">${st.category}</span>
          </div>
          <div style="font-size: 11px; color: #cbd5e1; line-height: 1.5; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px;">
            <div>PM2.5: <strong>${st.latest_pm25 || '--'}</strong> µg/m³</div>
            <div>PM10: <strong>${st.latest_pm10 || '--'}</strong> µg/m³</div>
            <div style="color: #f87171; font-size: 10px; margin-top: 4px;">⚠️ 50km Hazard Zone Active</div>
          </div>
          <div style="display: flex; gap: 6px; margin-top: 8px;">
            <button onclick="window.AirQualityMonitoringApp.openAirshedDrawer('${st.city}')" style="flex: 1; padding: 6px; background: #0284c7; border: 1px solid #38bdf8; border-radius: 4px; color: #fff; font-size: 11px; font-weight: 700; cursor: pointer;">
              Deep Dive ↗
            </button>
            <button onclick="window.AirQualityMonitoringApp.selectCityFocus('${st.city}')" style="flex: 1; padding: 6px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: #cbd5e1; font-size: 11px; font-weight: 600; cursor: pointer;">
              Focus
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        if (window.AirQualityMonitoringApp && window.AirQualityMonitoringApp.openAirshedDrawer) {
          window.AirQualityMonitoringApp.openAirshedDrawer(st.city);
        }
        if (this.onStationSelect) this.onStationSelect(st.city);
      });

      this.markers[st.city] = marker;
    });

    this.renderLeaderboard(stationsList);
  }

  filterMarkersByZone(zone) {
    const matching = [];
    Object.entries(this.markers).forEach(([city, marker]) => {
      const st = this.stationsData.find(s => s.city === city);
      const ring = this.hazardRings[city];
      const match = !zone || zone === 'all' || (st && st.zone.toLowerCase().includes(zone.toLowerCase()));
      if (match) {
        marker.setOpacity(1);
        if (ring) ring.setStyle({ opacity: 1, fillOpacity: 0.12 });
        if (st) matching.push(marker.getLatLng());
      } else {
        marker.setOpacity(0.15);
        if (ring) ring.setStyle({ opacity: 0.05, fillOpacity: 0.02 });
      }
    });

    if (matching.length > 0) {
      const bounds = L.latLngBounds(matching);
      this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
    }
  }

  filterMarkersByCategory(category) {
    const matching = [];
    Object.entries(this.markers).forEach(([city, marker]) => {
      const st = this.stationsData.find(s => s.city === city);
      const ring = this.hazardRings[city];
      const match = !category || category === 'all' || (st && st.category.toUpperCase().includes(category.toUpperCase()));
      if (match) {
        marker.setOpacity(1);
        if (ring) ring.setStyle({ opacity: 1, fillOpacity: 0.12 });
        if (st) matching.push(marker.getLatLng());
      } else {
        marker.setOpacity(0.15);
        if (ring) ring.setStyle({ opacity: 0.05, fillOpacity: 0.02 });
      }
    });

    if (matching.length > 0) {
      const bounds = L.latLngBounds(matching);
      this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
    }
  }

  renderLeaderboard(stationsList) {
    const listEl = document.getElementById('leaderboardList');
    if (!listEl) return;
    listEl.innerHTML = '';

    // Sort descending by AQI
    const sorted = [...stationsList].sort((a, b) => b.avg_aqi - a.avg_aqi);

    sorted.forEach((st, idx) => {
      const color = this.getCategoryColor(st.avg_aqi);
      const li = document.createElement('li');
      li.className = 'leaderboard-item';
      li.innerHTML = `
        <div class="leaderboard-left">
          <span class="leaderboard-rank">#${idx + 1}</span>
          <span class="leaderboard-dot" style="background-color: ${color};"></span>
          <span class="leaderboard-city">${st.city}</span>
        </div>
        <span class="leaderboard-val" style="color: ${color};">${st.avg_aqi} <small style="font-size: 9px; color: #64748b;">Index</small></span>
      `;

      li.addEventListener('click', () => {
        this.focusStation(st.city);
        if (window.AirQualityMonitoringApp && window.AirQualityMonitoringApp.openAirshedDrawer) {
          window.AirQualityMonitoringApp.openAirshedDrawer(st.city);
        }
        if (this.onStationSelect) this.onStationSelect(st.city);
      });

      listEl.appendChild(li);
    });
  }

  focusStation(cityName) {
    const marker = this.markers[cityName];
    const ring = this.hazardRings[cityName];
    if (marker) {
      const latlng = marker.getLatLng();
      this.map.flyTo(latlng, 8, { duration: 1.2 });
      setTimeout(() => {
        marker.openPopup();
      }, 1200);

      // Flash ring
      if (ring) {
        ring.setStyle({ weight: 3, fillOpacity: 0.25 });
        setTimeout(() => ring.setStyle({ weight: 1.5, fillOpacity: 0.12 }), 3000);
      }
    }
  }

  resetView() {
    try {
      if (this.map) {
        this.map.flyTo([21.8, 79.5], 5, { duration: 1.0 });
      }
      document.querySelectorAll('.map-region-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-region') === 'all');
      });
    } catch (err) {
      console.warn('resetView error:', err);
    }
  }
}

window.AirQualityMonitoringMap = AirQualityMonitoringMap;

