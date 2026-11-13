/**
 * Air Quality Monitoring - Core Application Orchestrator & State Hub
 * Reactive synchronization across KPI Cards, Leaflet Map, D3 Splines, Radar, Zonal, Donut, and Table
 */

class AirQualityMonitoringApp {
  constructor() {
    this.state = {
      focusCity: 'all',
      metric: 'aqi',
      timeline: 'full',
      activeCities: new Set(),
      safetyBands: true,
      averageCurve: true,
      dataDots: false,
      curveType: 'monotone',
      rankingSort: 'worst',
      stations: [],
      trendsData: null,
      rankingsData: null,
      currentUser: null
    };

    this.mapInstance = null;
    this.chartsInstance = null;
    this.tableInstance = null;
    this.liveStreamTimer = null;

    this.init();
  }

  async init() {
    this.checkAuthSession();
    this.initInstances();
    this.bindDomEvents();
    await this.loadInitialData();
  }

  checkAuthSession() {
    const userStr = localStorage.getItem('air_quality_user');
    if (userStr) {
      try {
        this.state.currentUser = JSON.parse(userStr);
        this.updateAuthUi();
      } catch (e) {
        localStorage.removeItem('air_quality_user');
      }
    }
  }

  updateAuthUi() {
    const userBadge = document.getElementById('userDisplayName');
    const btnLogout = document.getElementById('btnLogout');

    if (this.state.currentUser) {
      if (userBadge) {
        userBadge.innerText = this.state.currentUser.name || this.state.currentUser.username || 'Hasini Tellapeli';
      }
    }

    if (btnLogout) {
      btnLogout.onclick = (e) => {
        e.preventDefault();
        localStorage.removeItem('air_quality_user');
        window.location.replace('/login.html');
      };
    }
  }

  initInstances() {
    this.chartsInstance = new AirQualityMonitoringCharts(this.state);
    this.mapInstance = new AirQualityMonitoringMap('leafletMap', (city) => {
      this.selectCityFocus(city);
    });
    this.tableInstance = new AirQualityMonitoringTable(this.state);
    window.AirQualityMonitoringTableInstance = this.tableInstance;
  }

  bindDomEvents() {
    // 1. Focus City Select
    const focusCitySelect = document.getElementById('focusCitySelect');
    if (focusCitySelect) {
      focusCitySelect.addEventListener('change', (e) => {
        this.selectCityFocus(e.target.value);
      });
    }

    // 2. Metric Select
    const metricSelect = document.getElementById('metricSelect');
    if (metricSelect) {
      metricSelect.addEventListener('change', (e) => {
        this.state.metric = e.target.value;
        this.refreshDashboardData();
      });
    }

    // 3. Timeline Pill Buttons
    const timelineBtns = document.querySelectorAll('.timeline-pill-btn');
    timelineBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        timelineBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.timeline = btn.getAttribute('data-timeline');
        this.refreshDashboardData();
      });
    });

    // 4. Reset Filters Button
    const btnReset = document.getElementById('btnResetFilters');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.resetFilters();
      });
    }

    // 5. Ranking Sort Toggles
    const rankToggles = document.querySelectorAll('.rank-sort-btn');
    rankToggles.forEach(btn => {
      btn.addEventListener('click', () => {
        rankToggles.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.rankingSort = btn.getAttribute('data-sort');
        this.fetchRankings();
      });
    });

    // 6. Map Layer Toggles
    const mapToggles = document.querySelectorAll('.map-layer-btn');
    mapToggles.forEach(btn => {
      btn.addEventListener('click', () => {
        mapToggles.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const layerKey = btn.getAttribute('data-layer');
        this.mapInstance.setTileLayer(layerKey);
      });
    });

    // 6b. Map Camera Region Adjustments (Smooth glide & sync)
    const regionBtns = document.querySelectorAll('.map-region-btn');
    regionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        regionBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const region = btn.getAttribute('data-region');
        if (this.mapInstance) {
          this.mapInstance.setCameraRegion(region);
        }
        if (region === 'south') {
          this.filterByZone('Coastal South');
        } else if (region === 'north') {
          this.filterByZone('Northern Plains');
        } else if (region === 'west') {
          this.filterByZone('Industrial West');
        } else if (region === 'east') {
          this.filterByZone('Eastern Mining');
        } else {
          this.clearInteractiveFilter();
        }
      });
    });

    // 7. Trend Chart Controls
    const toggleSafetyBands = document.getElementById('toggleSafetyBands');
    if (toggleSafetyBands) {
      toggleSafetyBands.addEventListener('click', () => {
        this.state.safetyBands = !this.state.safetyBands;
        toggleSafetyBands.classList.toggle('active', this.state.safetyBands);
        this.renderTrends();
      });
    }

    const toggleAvgCurve = document.getElementById('toggleAvgCurve');
    if (toggleAvgCurve) {
      toggleAvgCurve.addEventListener('click', () => {
        this.state.averageCurve = !this.state.averageCurve;
        toggleAvgCurve.classList.toggle('active', this.state.averageCurve);
        this.renderTrends();
      });
    }

    const toggleDataDots = document.getElementById('toggleDataDots');
    if (toggleDataDots) {
      toggleDataDots.addEventListener('click', () => {
        this.state.dataDots = !this.state.dataDots;
        toggleDataDots.classList.toggle('active', this.state.dataDots);
        this.renderTrends();
      });
    }

    const toggleCurveType = document.getElementById('toggleCurveType');
    if (toggleCurveType) {
      toggleCurveType.addEventListener('click', () => {
        this.state.curveType = this.state.curveType === 'monotone' ? 'linear' : 'monotone';
        toggleCurveType.classList.toggle('active', this.state.curveType === 'linear');
        toggleCurveType.innerText = this.state.curveType === 'monotone' ? 'Curve: Monotone' : 'Curve: Linear';
        this.renderTrends();
      });
    }

    // 8. City Filter Preset Buttons
    document.getElementById('btnPresetAll')?.addEventListener('click', () => this.presetCities('all'));
    document.getElementById('btnPresetTop3')?.addEventListener('click', () => this.presetCities('top3'));
    document.getElementById('btnPresetCleanest')?.addEventListener('click', () => this.presetCities('cleanest'));
    document.getElementById('btnPresetClear')?.addEventListener('click', () => this.presetCities('clear'));

    // 9. Modals
    document.getElementById('btnAddRecord')?.addEventListener('click', () => this.openAddRecordModal());
    document.getElementById('btnCloseAddModal')?.addEventListener('click', () => this.closeModal('modalAddRecord'));
    document.getElementById('btnCancelAdd')?.addEventListener('click', () => this.closeModal('modalAddRecord'));
    document.getElementById('formAddRecord')?.addEventListener('submit', (e) => this.submitAddRecord(e));

    document.getElementById('btnDatabaseModal')?.addEventListener('click', () => this.openDatabaseModal());
    document.getElementById('btnCloseDbModal')?.addEventListener('click', () => this.closeModal('modalDatabase'));
    document.getElementById('btnReseedDb')?.addEventListener('click', () => this.reseedDatabase());
    document.getElementById('btnReloadData')?.addEventListener('click', () => {
      this.refreshDashboardData();
      this.showToast('Data reloaded from server.');
    });

    // 10. Data Sources Modal
    document.getElementById('btnSourcesModal')?.addEventListener('click', () => this.openSourcesModal());
    document.getElementById('btnCloseSourcesModal')?.addEventListener('click', () => this.closeModal('modalSources'));
    document.getElementById('btnExcelDownload')?.addEventListener('click', () => {
      window.location.href = '/api/export/excel';
    });

    // 11. Audit Dossier Modal
    document.getElementById('btnAuditReport')?.addEventListener('click', () => this.openAuditModal());
    document.getElementById('btnCloseAuditModal')?.addEventListener('click', () => this.closeModal('modalAuditReport'));

    // 12. Live Stream Toggle
    document.getElementById('btnLiveStream')?.addEventListener('click', () => this.toggleLiveStream());

    // 13. Interactive Airshed Drawer & Filter Bar
    document.getElementById('btnDrawerClose')?.addEventListener('click', () => this.closeAirshedDrawer());
    document.getElementById('airshedDrawerBackdrop')?.addEventListener('click', () => this.closeAirshedDrawer());
    document.getElementById('btnClearInteractiveFilter')?.addEventListener('click', () => this.clearInteractiveFilter());
    document.getElementById('btnClosePollutantModal')?.addEventListener('click', () => this.closeModal('modalPollutantDetail'));

    // 14. Audio Briefing Voice Synthesizer
    this.initAudioBriefing();

    // 15. Forecast Airshed Select
    document.getElementById('forecastCitySelect')?.addEventListener('change', (e) => {
      this.loadForecast(e.target.value);
      this.loadWeather(e.target.value);
    });

    // 16. Dual-City Airshed Face-Off Selects
    document.getElementById('duelCity1Select')?.addEventListener('change', () => this.loadDuel());
    document.getElementById('duelCity2Select')?.addEventListener('change', () => this.loadDuel());

    // Global ESC key listener to dismiss panels
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAirshedDrawer();
        document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
      }
    });
  }

  async loadInitialData() {
    await this.fetchStations();
    await this.fetchKpis();
    await this.fetchTrends();
    await this.fetchRankings();
    await this.fetchAdvancedAnalytics();
    await this.loadForecast('all');
    await this.loadWeather('all');
    await this.loadDuel();
    if (this.tableInstance) {
      await this.tableInstance.fetchAndRender();
    }
  }

  async fetchStations() {
    try {
      const res = await fetch('/api/stations?sort=worst');
      const data = await res.json();
      this.state.stations = data.stations;
      this.state.activeCities = new Set(data.stations.map(s => s.city));

      const southCount = data.stations.filter(s => s.zone && s.zone.includes('South')).length;
      const stationsPill = document.getElementById('telemetryStationsPill');
      if (stationsPill) {
        stationsPill.innerHTML = `<span class="live-dot"></span> <span>${data.stations.length} Stations Online (${southCount} South Grid)</span>`;
      }

      const select = document.getElementById('focusCitySelect');
      if (select) {
        select.innerHTML = '<option value="all">All Cities (Overview)</option>';
        data.stations.forEach(s => {
          const opt = document.createElement('option');
          opt.value = s.city;
          opt.textContent = `${s.city} (${s.avg_aqi})`;
          select.appendChild(opt);
        });
      }

      // Populate Forecast Select
      const forecastSelect = document.getElementById('forecastCitySelect');
      if (forecastSelect) {
        forecastSelect.innerHTML = '<option value="all">National Average (64 Stations)</option>';
        data.stations.forEach(s => {
          const opt = document.createElement('option');
          opt.value = s.city;
          opt.textContent = `${s.city} (${s.avg_aqi} AQI)`;
          forecastSelect.appendChild(opt);
        });
      }

      // Populate Duel Face-Off Selects
      const duel1 = document.getElementById('duelCity1Select');
      const duel2 = document.getElementById('duelCity2Select');
      if (duel1 && duel2) {
        duel1.innerHTML = '';
        duel2.innerHTML = '';
        data.stations.forEach(s => {
          const o1 = document.createElement('option');
          o1.value = s.city;
          o1.textContent = `${s.city} (${s.state})`;
          if (s.city === 'Hyderabad') o1.selected = true;
          duel1.appendChild(o1);

          const o2 = document.createElement('option');
          o2.value = s.city;
          o2.textContent = `${s.city} (${s.state})`;
          if (s.city === 'Delhi') o2.selected = true;
          duel2.appendChild(o2);
        });
      }

      this.renderCityPills();

      if (this.mapInstance) {
        this.mapInstance.renderStations(data.stations);
      }
    } catch (err) {
      console.error('Error fetching stations:', err);
    }
  }

  renderCityPills() {
    const container = document.getElementById('cityPillsContainer');
    if (!container) return;
    container.innerHTML = '';

    this.state.stations.forEach(st => {
      const pill = document.createElement('div');
      const isActive = this.state.activeCities.has(st.city);
      const color = this.chartsInstance.getCityColor(st.city);

      pill.className = `city-pill ${isActive ? 'active' : ''}`;
      pill.setAttribute('data-city', st.city);
      pill.innerHTML = `
        <span class="pill-dot" style="background-color: ${color};"></span>
        <span>${st.city} ${st.avg_aqi}</span>
      `;

      pill.addEventListener('click', () => {
        if (this.state.activeCities.has(st.city)) {
          this.state.activeCities.delete(st.city);
        } else {
          this.state.activeCities.add(st.city);
        }
        pill.classList.toggle('active', this.state.activeCities.has(st.city));
        this.updateActiveCitiesCountBadge();
        this.renderTrends();
      });

      pill.addEventListener('mouseenter', () => {
        if (this.chartsInstance) this.chartsInstance.highlightCityCurve(st.city);
      });

      pill.addEventListener('mouseleave', () => {
        if (this.chartsInstance) this.chartsInstance.unhighlightAllCurves();
      });

      container.appendChild(pill);
    });

    this.updateActiveCitiesCountBadge();
  }

  updateActiveCitiesCountBadge() {
    const badge = document.getElementById('activeCitiesCountBadge');
    if (badge) {
      badge.innerText = `${this.state.activeCities.size} of ${this.state.stations.length} Cities Active`;
    }
  }

  presetCities(type) {
    if (type === 'all') {
      this.state.activeCities = new Set(this.state.stations.map(s => s.city));
    } else if (type === 'top3') {
      const top3 = [...this.state.stations].sort((a, b) => b.avg_aqi - a.avg_aqi).slice(0, 3);
      this.state.activeCities = new Set(top3.map(s => s.city));
    } else if (type === 'cleanest') {
      const clean3 = [...this.state.stations].sort((a, b) => a.avg_aqi - b.avg_aqi).slice(0, 3);
      this.state.activeCities = new Set(clean3.map(s => s.city));
    } else if (type === 'clear') {
      this.state.activeCities = new Set();
    }

    const pills = document.querySelectorAll('.city-pill');
    pills.forEach(p => {
      const city = p.getAttribute('data-city');
      p.classList.toggle('active', this.state.activeCities.has(city));
    });

    this.updateActiveCitiesCountBadge();
    this.renderTrends();
  }

  async fetchKpis() {
    try {
      const city = this.state.focusCity;
      const timeline = this.state.timeline;
      const res = await fetch(`/api/kpi?city=${encodeURIComponent(city)}&timeline=${timeline}`);
      const data = await res.json();

      this.animateKpiCounter('kpiAqiVal', data.avg_aqi);
      this.animateKpiCounter('kpiPm25Val', data.avg_pm25, 1);
      this.animateKpiCounter('kpiPm10Val', data.avg_pm10, 1);
      this.animateKpiCounter('kpiPeakVal', data.peak_aqi);

      const trendEl = document.getElementById('kpiTrendVal');
      if (trendEl) {
        trendEl.innerText = `${data.trend_delta > 0 ? '+' : ''}${data.trend_delta}%`;
      }

      const badgeAqi = document.getElementById('kpiAqiBadge');
      if (badgeAqi) {
        badgeAqi.innerText = data.aqi_category;
        badgeAqi.className = `kpi-badge badge-moderate`;
      }

      const badgePm25 = document.getElementById('kpiPm25Badge');
      if (badgePm25) badgePm25.innerText = data.who_pm25_ratio;

      const badgePm10 = document.getElementById('kpiPm10Badge');
      if (badgePm10) badgePm10.innerText = data.who_pm10_ratio;

      const peakDesc = document.getElementById('kpiPeakDesc');
      if (peakDesc) peakDesc.innerText = data.peak_display;

      const trendSubtitle = document.getElementById('kpiTrendSubtitle');
      if (trendSubtitle) trendSubtitle.innerText = data.trend_subtitle;

      const badgeTrend = document.getElementById('kpiTrendBadge');
      if (badgeTrend) {
        badgeTrend.innerText = data.trend_status;
        badgeTrend.className = `kpi-badge ${data.trend_delta > 0 ? 'badge-danger-outline' : 'badge-green-outline'}`;
      }

      const dbPill = document.getElementById('telemetryDbPill');
      if (dbPill) {
        dbPill.innerHTML = `<span class="live-dot"></span> Node.js DB: ${data.total_records} Records`;
      }
    } catch (err) {
      console.error('Error fetching KPIs:', err);
    }
  }

  animateKpiCounter(elementId, targetValue, decimals = 0) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const start = parseFloat(el.innerText) || 0;
    const duration = 600;
    const startTime = performance.now();

    function update(time) {
      const elapsed = time - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = start + (targetValue - start) * ease;
      el.innerText = decimals > 0 ? current.toFixed(decimals) : Math.round(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.innerText = decimals > 0 ? targetValue.toFixed(decimals) : targetValue;
      }
    }
    requestAnimationFrame(update);
  }

  async fetchTrends() {
    try {
      const timeline = this.state.timeline;
      const res = await fetch(`/api/trends?city=all&timeline=${timeline}`);
      const data = await res.json();
      this.state.trendsData = data;
      this.renderTrends();
    } catch (err) {
      console.error('Error fetching trends:', err);
    }
  }

  renderTrends() {
    if (!this.state.trendsData || !this.chartsInstance) return;
    this.chartsInstance.renderTrendChart(this.state.trendsData, this.state.activeCities, {
      safetyBands: this.state.safetyBands,
      averageCurve: this.state.averageCurve,
      dataDots: this.state.dataDots,
      curveType: this.state.curveType
    });
  }

  async fetchRankings() {
    try {
      const timeline = this.state.timeline;
      const sort = this.state.rankingSort;
      const res = await fetch(`/api/rankings?sort=${sort}&timeline=${timeline}`);
      const data = await res.json();
      this.state.rankingsData = data;

      if (this.chartsInstance) {
        this.chartsInstance.renderRankingChart(data.rankings, data.national_avg, (city) => {
          this.selectCityFocus(city);
        });
      }
    } catch (err) {
      console.error('Error fetching rankings:', err);
    }
  }

  // ==========================================
  // Advanced Visualizations Engine
  // ==========================================
  async fetchAdvancedAnalytics() {
    await this.fetchRadarData(this.state.focusCity);
    await this.fetchZonalData();
    await this.fetchDonutData();
    await this.fetchScatterData();
  }

  async fetchRadarData(city = 'all') {
    try {
      const res = await fetch(`/api/analytics/radar?city=${encodeURIComponent(city)}`);
      const data = await res.json();
      if (this.chartsInstance) {
        this.chartsInstance.renderRadarChart(data, 'radarChartContainer');
      }
      const label = document.getElementById('radarFocusLabel');
      if (label) label.innerText = data.city;
    } catch (err) {
      console.error('Radar error:', err);
    }
  }

  async fetchZonalData() {
    try {
      const res = await fetch('/api/analytics/zonal');
      const data = await res.json();
      if (this.chartsInstance) {
        this.chartsInstance.renderZonalChart(data, 'zonalChartContainer');
      }
    } catch (err) {
      console.error('Zonal error:', err);
    }
  }

  async fetchDonutData() {
    try {
      const res = await fetch('/api/analytics/categories');
      const data = await res.json();
      if (this.chartsInstance) {
        this.chartsInstance.renderDonutChart(data, 'donutChartContainer');
      }
    } catch (err) {
      console.error('Donut error:', err);
    }
  }

  async fetchScatterData() {
    try {
      const res = await fetch('/api/analytics/correlation');
      const data = await res.json();
      if (this.chartsInstance) {
        this.chartsInstance.renderScatterPlot(data, 'scatterChartContainer');
      }
    } catch (err) {
      console.error('Scatter error:', err);
    }
  }

  selectCityFocus(cityName) {
    this.state.focusCity = cityName;
    const select = document.getElementById('focusCitySelect');
    if (select) select.value = cityName;

    if (cityName !== 'all') {
      this.mapInstance.focusStation(cityName);
      this.presetCities('clear');
      this.state.activeCities.add(cityName);
      this.renderCityPills();
    } else {
      this.mapInstance.resetView();
      this.presetCities('all');
    }

    this.refreshDashboardData();
    this.fetchRadarData(cityName);
    this.loadForecast(cityName);
    this.loadWeather(cityName);
    const forecastSelect = document.getElementById('forecastCitySelect');
    if (forecastSelect) forecastSelect.value = cityName;
    this.showToast(`Active focus set to: ${cityName}`);
  }

  resetFilters() {
    this.state.focusCity = 'all';
    this.state.timeline = 'full';
    this.state.metric = 'aqi';
    this.state.rankingSort = 'worst';

    const focusSelect = document.getElementById('focusCitySelect');
    if (focusSelect) focusSelect.value = 'all';

    const metricSelect = document.getElementById('metricSelect');
    if (metricSelect) metricSelect.value = 'aqi';

    document.querySelectorAll('.timeline-pill-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-timeline') === 'full');
    });

    document.querySelectorAll('.rank-sort-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-sort') === 'worst');
    });

    this.presetCities('all');
    this.mapInstance.resetView();
    this.refreshDashboardData();
    this.fetchRadarData('all');
    this.showToast('All filters reset to nationwide baseline.');
  }

  async refreshDashboardData() {
    await this.fetchKpis();
    await this.fetchTrends();
    await this.fetchRankings();
    await this.fetchRadarData(this.state.focusCity);
    if (this.tableInstance) {
      await this.tableInstance.fetchAndRender();
    }
  }

  updateGaugeView() {
    const aqi = parseInt(document.getElementById('kpiAqiVal')?.innerText, 10) || 94;
    if (this.chartsInstance) {
      this.chartsInstance.renderGauge(aqi, 'gaugeContainer');
    }
  }

  // Modals
  openAddRecordModal() {
    const modal = document.getElementById('modalAddRecord');
    if (modal) modal.classList.add('open');
  }

  openDatabaseModal() {
    const modal = document.getElementById('modalDatabase');
    if (modal) modal.classList.add('open');
    this.loadValidationReport();
  }

  openSourcesModal() {
    const modal = document.getElementById('modalSources');
    if (modal) modal.classList.add('open');
    this.loadDataSources();
  }

  openAuditModal() {
    const modal = document.getElementById('modalAuditReport');
    if (!modal) return;

    const aqiVal = document.getElementById('kpiAqiVal')?.innerText || '94';
    const pm25Val = document.getElementById('kpiPm25Val')?.innerText || '31.1';
    const pm10Val = document.getElementById('kpiPm10Val')?.innerText || '45.9';
    const peakVal = document.getElementById('kpiPeakVal')?.innerText || '319';
    const peakDesc = document.getElementById('kpiPeakDesc')?.innerText || 'Gurugram Hotspot';

    const auditAqi = document.getElementById('auditAqi');
    if (auditAqi) auditAqi.innerText = aqiVal;

    const auditPm25 = document.getElementById('auditPm25');
    if (auditPm25) auditPm25.innerText = `${pm25Val} µg/m³`;

    const auditPm10 = document.getElementById('auditPm10');
    if (auditPm10) auditPm10.innerText = `${pm10Val} µg/m³`;

    const auditPeak = document.getElementById('auditPeak');
    if (auditPeak) auditPeak.innerText = `${peakVal} AQI (${peakDesc})`;

    modal.classList.add('open');
  }

  toggleLiveStream() {
    const btn = document.getElementById('btnLiveStream');
    const textSpan = document.getElementById('liveStreamText');
    const dotSpan = btn?.querySelector('.live-dot');

    if (this.liveStreamTimer) {
      clearInterval(this.liveStreamTimer);
      this.liveStreamTimer = null;
      if (btn) {
        btn.style.color = '#f87171';
        btn.style.borderColor = 'rgba(239, 68, 68, 0.4)';
      }
      if (dotSpan) {
        dotSpan.style.background = '#ef4444';
        dotSpan.style.boxShadow = '0 0 8px #ef4444';
      }
      if (textSpan) textSpan.innerText = 'Live Stream: OFF';
      this.showToast('Telemetry live stream paused.');
    } else {
      if (btn) {
        btn.style.color = '#34d399';
        btn.style.borderColor = 'rgba(52, 211, 153, 0.4)';
      }
      if (dotSpan) {
        dotSpan.style.background = '#10b981';
        dotSpan.style.boxShadow = '0 0 10px #10b981';
      }
      if (textSpan) textSpan.innerText = 'Live Stream: ACTIVE (5s)';
      this.showToast('Simulated real-time sensor streaming started (5s sync cadence).');

      this.liveStreamTimer = setInterval(() => {
        this.simulateLiveSensorTick();
      }, 5000);
    }
  }

  simulateLiveSensorTick() {
    if (!this.state.stations || this.state.stations.length === 0) return;
    const idx = Math.floor(Math.random() * this.state.stations.length);
    const station = this.state.stations[idx];
    const jitter = Math.floor(Math.random() * 7) - 3;
    const newAqi = Math.max(15, Math.min(480, (station.avg_aqi || 85) + jitter));
    station.avg_aqi = newAqi;

    if (this.mapInstance && this.mapInstance.markers && this.mapInstance.markers[station.city]) {
      const marker = this.mapInstance.markers[station.city];
      const el = marker.getElement();
      if (el) {
        el.style.transform = 'scale(1.25)';
        setTimeout(() => { if (el) el.style.transform = 'scale(1)'; }, 400);
      }
    }

    if (this.state.focusCity === 'all' || this.state.focusCity === station.city) {
      this.fetchKpis();
    }

    this.showToast(`⚡ Telemetry packet received: ${station.name} (${station.city}) AQI: ${newAqi}`);
  }

  // ==========================================
  // Interactive Airshed Deep Dive Drawer
  // ==========================================
  openAirshedDrawer(cityName) {
    if (!this.state.stations || this.state.stations.length === 0) return;
    const st = this.state.stations.find(s => s.city.toLowerCase() === cityName.toLowerCase()) || this.state.stations[0];
    if (!st) return;

    // Header info
    const zoneBadge = document.getElementById('drawerZoneBadge');
    if (zoneBadge) zoneBadge.innerText = `${st.zone.toUpperCase()} AIRSHED`;

    const cityTitle = document.getElementById('drawerCityTitle');
    if (cityTitle) cityTitle.innerText = st.city;

    const stName = document.getElementById('drawerStationName');
    if (stName) stName.innerText = `${st.name || st.city + ' CAAQMS'} • ${st.agency || 'Central Pollution Control Board Grid'}`;

    const coords = document.getElementById('drawerGeoCoords');
    if (coords) coords.innerText = `${st.lat.toFixed(4)}° N, ${st.lng.toFixed(4)}° E • Elev: ${st.elevation || 240}m MSL`;

    // AQI & Category dial
    const aqi = st.avg_aqi || 50;
    const aqiColor = this.chartsInstance.getCategoryColor(aqi);

    const aqiVal = document.getElementById('drawerAqiVal');
    if (aqiVal) {
      aqiVal.innerText = aqi;
      aqiVal.style.color = aqiColor;
    }

    const circle = document.getElementById('drawerAqiProgressCircle');
    if (circle) {
      circle.style.stroke = aqiColor;
      const progress = Math.min(1, aqi / 350);
      const offset = 264 - (264 * progress);
      circle.style.strokeDashoffset = offset;
    }

    const categoryPill = document.getElementById('drawerCategoryPill');
    if (categoryPill) {
      categoryPill.innerText = `${st.category || 'MODERATE'} AIR QUALITY`;
      categoryPill.style.color = aqiColor;
      categoryPill.style.borderColor = aqiColor;
      categoryPill.style.background = `${aqiColor}22`;
    }

    // Dominant pollutant & trend
    const pm25Val = st.latest_pm25 || Math.round(aqi * 0.52);
    const pm10Val = st.latest_pm10 || Math.round(aqi * 0.76);
    const no2Val = (aqi * 0.28).toFixed(1);
    const so2Val = (aqi * 0.14).toFixed(1);
    const coVal = (0.2 + (aqi * 0.008)).toFixed(2);
    const o3Val = Math.round(35 + (aqi * 0.35));
    const nh3Val = (aqi * 0.18).toFixed(1);

    const domPol = document.getElementById('drawerDominantPollutant');
    if (domPol) domPol.innerText = `Primary Driver: PM2.5 Fine Particles (${pm25Val} µg/m³)`;

    const trendStat = document.getElementById('drawerTrendStat');
    if (trendStat) trendStat.innerText = aqi > 100 ? `⚠️ High episodic particulate retention` : `✓ Continuous atmospheric dispersion active`;

    // 7-Pollutant Diagnostic Barometer
    const pollutants = [
      { name: 'PM2.5', full: 'Fine Inhalable Particles', val: pm25Val, unit: 'µg/m³', who: 15, cpcb: 60 },
      { name: 'PM10', full: 'Coarse Respirable Dust', val: pm10Val, unit: 'µg/m³', who: 45, cpcb: 100 },
      { name: 'NO2', full: 'Nitrogen Dioxide', val: no2Val, unit: 'µg/m³', who: 25, cpcb: 80 },
      { name: 'SO2', full: 'Sulfur Dioxide', val: so2Val, unit: 'µg/m³', who: 40, cpcb: 80 },
      { name: 'CO', full: 'Carbon Monoxide', val: coVal, unit: 'mg/m³', who: 2.0, cpcb: 4.0 },
      { name: 'O3', full: 'Tropospheric Ozone', val: o3Val, unit: 'µg/m³', who: 50, cpcb: 100 },
      { name: 'NH3', full: 'Ammonia', val: nh3Val, unit: 'µg/m³', who: 100, cpcb: 400 }
    ];

    const pList = document.getElementById('drawerPollutantsList');
    if (pList) {
      pList.innerHTML = '';
      pollutants.forEach(p => {
        const pctWho = Math.round((p.val / p.who) * 100);
        const barColor = pctWho > 150 ? '#ef4444' : (pctWho > 100 ? '#f97316' : '#10b981');
        const fillW = Math.min(100, Math.max(8, (pctWho / 250) * 100));

        const row = document.createElement('div');
        row.className = 'pollutant-row';
        row.style.cursor = 'pointer';
        row.onclick = () => this.openPollutantModal(p.name, p.val, p.unit, p.who, pctWho);
        row.innerHTML = `
          <div class="pollutant-row-top">
            <span class="pollutant-name">${p.name} <small style="font-size:10px; color:#94a3b8; font-weight:normal;">(${p.full})</small></span>
            <span class="pollutant-val" style="color:${barColor};">${p.val} ${p.unit}</span>
          </div>
          <div class="pollutant-bar-bg">
            <div class="pollutant-bar-fill" style="width: ${fillW}%; background: ${barColor};"></div>
          </div>
          <div class="pollutant-meta">
            <span>WHO Limit: ${p.who} ${p.unit}</span>
            <span style="color:${barColor}; font-weight:700;">${pctWho}% WHO Limit</span>
          </div>
        `;
        pList.appendChild(row);
      });
    }

    // Meteorology Dynamics
    const mGrid = document.getElementById('drawerMeteoGrid');
    if (mGrid) {
      const temp = (26 + ((st.lat % 5) * 1.5) - ((st.lng % 3) * 0.8)).toFixed(1);
      const humidity = Math.min(88, Math.max(42, Math.round(68 + ((st.lng % 4) * 4) - ((st.lat % 3) * 5))));
      const windSpeed = (8 + ((st.lat * 3) % 9)).toFixed(1);
      const windDeg = Math.round((st.lng * 2.5) % 360);
      const pbl = aqi > 150 ? '340m (Severe Inversion)' : '1,280m (Normal)';
      const dispersion = aqi > 150 ? 'Stagnant' : 'Favorable';

      mGrid.innerHTML = `
        <div class="meteo-cell">
          <div class="meteo-label">TEMPERATURE</div>
          <div class="meteo-val">${temp}°C</div>
        </div>
        <div class="meteo-cell">
          <div class="meteo-label">HUMIDITY</div>
          <div class="meteo-val">${humidity}%</div>
        </div>
        <div class="meteo-cell">
          <div class="meteo-label">WIND SPEED</div>
          <div class="meteo-val">${windSpeed} km/h</div>
        </div>
        <div class="meteo-cell">
          <div class="meteo-label">WIND BEARING</div>
          <div class="meteo-val">${windDeg}°</div>
        </div>
        <div class="meteo-cell">
          <div class="meteo-label">INVERSION RISK</div>
          <div class="meteo-val" style="font-size:0.82rem; color:${aqi > 150 ? '#f87171' : '#34d399'};">${aqi > 150 ? 'Elevated' : 'Low'}</div>
        </div>
        <div class="meteo-cell">
          <div class="meteo-label">DISPERSION</div>
          <div class="meteo-val" style="font-size:0.82rem; color:${aqi > 150 ? '#f87171' : '#34d399'};">${dispersion}</div>
        </div>
      `;
    }

    // Clinical Health Advisories
    const hBox = document.getElementById('drawerHealthAdvisories');
    if (hBox) {
      if (aqi <= 50) {
        hBox.innerHTML = `
          <div class="health-advisory-card" style="border-left-color: #10b981;">
            <strong>👶 Pediatric & Senior Cohort: Minimal Risk</strong>
            Ambient air quality is considered satisfactory. Air pollution poses little or no risk to children and elderly individuals.
          </div>
          <div class="health-advisory-card" style="border-left-color: #10b981;">
            <strong>🏃 Outdoor Workouts & Commuters: Encouraged</strong>
            Ideal conditions for endurance sports, morning walks, cycling, and natural cross-ventilation in homes.
          </div>
        `;
      } else if (aqi <= 100) {
        hBox.innerHTML = `
          <div class="health-advisory-card" style="border-left-color: #eab308;">
            <strong>👶 Sensitive Cohorts: Minor Concern</strong>
            Acceptable quality for general populace. Children with reactive airway disease may experience mild irritation during prolonged exposure.
          </div>
          <div class="health-advisory-card" style="border-left-color: #eab308;">
            <strong>🫁 Asthmatics: Carry Relief Inhalers</strong>
            Keep baseline medication accessible during morning rush hours when traffic exhaust concentrates near street level.
          </div>
        `;
      } else {
        hBox.innerHTML = `
          <div class="health-advisory-card" style="border-left-color: #ef4444;">
            <strong>👶 Pediatric & Senior Alert: Restrict Outdoors</strong>
            Children, seniors, and cardiopulmonary patients should avoid prolonged or heavy outdoor exertion.
          </div>
          <div class="health-advisory-card" style="border-left-color: #ef4444;">
            <strong>😷 Respiratory PPE: N95 Respirator Recommended</strong>
            Standard cloth/surgical masks fail against sub-micron PM2.5. Utilize sealed N95 / FFP2 respirators outdoors.
          </div>
        `;
      }
    }

    // Municipal GRAP Mitigation
    const grapBox = document.getElementById('drawerGrapBox');
    if (grapBox) {
      const grapStage = aqi > 300 ? 'GRAP Stage-IV (Emergency)' : (aqi > 200 ? 'GRAP Stage-III (Severe)' : (aqi > 100 ? 'GRAP Stage-II (Very Poor)' : 'GRAP Stage-I (Standard)'));
      grapBox.innerHTML = `
        <div class="grap-badge-container">
          <div style="font-weight:700; color:#facc15; margin-bottom:4px;">Statutory Status: ${grapStage}</div>
          <ul style="padding-left:16px; margin:0; line-height:1.5;">
            <li>Mechanized vacuum sweeping on high-density traffic arteries</li>
            <li>Anti-smog water mist canons operating at major intersections</li>
            <li>${aqi > 150 ? 'Strict prohibition on diesel gensets and non-essential construction dust' : 'Continuous sensor QA/QC audits on municipal monitoring telemetry'}</li>
          </ul>
        </div>
      `;
    }

    // Connect drawer action buttons
    const btnMapZoom = document.getElementById('drawerBtnMapZoom');
    if (btnMapZoom) {
      btnMapZoom.onclick = () => {
        this.mapInstance.focusStation(st.city);
        this.closeAirshedDrawer();
        this.showToast(`Centered satellite view on ${st.city} Station`);
      };
    }

    const btnIsolateTrend = document.getElementById('drawerBtnIsolateTrend');
    if (btnIsolateTrend) {
      btnIsolateTrend.onclick = () => {
        this.presetCities('clear');
        this.state.activeCities.add(st.city);
        this.renderCityPills();
        this.renderTrends();
        this.closeAirshedDrawer();
        this.showToast(`Isolated ${st.city} in temporal spline curves`);
      };
    }

    const btnRadar = document.getElementById('drawerBtnRadarProfile');
    if (btnRadar) {
      btnRadar.onclick = () => {
        this.fetchRadarData(st.city);
        this.closeAirshedDrawer();
        document.getElementById('radarChartContainer')?.scrollIntoView({ behavior: 'smooth' });
        this.showToast(`Loaded ${st.city} into Chemical Radar`);
      };
    }

    const btnFilterTable = document.getElementById('drawerBtnFilterTable');
    if (btnFilterTable) {
      btnFilterTable.onclick = () => {
        if (this.tableInstance) {
          this.tableInstance.setCityFilter(st.city);
        }
        this.closeAirshedDrawer();
        document.getElementById('tabVerifiedRecords')?.scrollIntoView({ behavior: 'smooth' });
        this.showToast(`Filtered verified observation logs to ${st.city}`);
      };
    }

    const btnExportJson = document.getElementById('drawerBtnExportJson');
    if (btnExportJson) {
      btnExportJson.onclick = () => {
        const blob = new Blob([JSON.stringify(st, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `airshed_${st.city.toLowerCase()}_telemetry.json`;
        a.click();
        URL.revokeObjectURL(url);
      };
    }

    const btnExportCsv = document.getElementById('drawerBtnExportCsv');
    if (btnExportCsv) {
      btnExportCsv.onclick = () => {
        const csv = `City,State,Zone,Latitude,Longitude,AQI,Category,PM25,PM10\n"${st.city}","${st.state}","${st.zone}",${st.lat},${st.lng},${st.avg_aqi},"${st.category}",${pm25Val},${pm10Val}`;
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `airshed_${st.city.toLowerCase()}_telemetry.csv`;
        a.click();
        URL.revokeObjectURL(url);
      };
    }

    // Open drawer
    document.getElementById('airshedDrawer')?.classList.add('open');
    document.getElementById('airshedDrawerBackdrop')?.classList.add('open');
  }

  closeAirshedDrawer() {
    document.getElementById('airshedDrawer')?.classList.remove('open');
    document.getElementById('airshedDrawerBackdrop')?.classList.remove('open');
  }

  filterByZone(zoneName) {
    const matching = this.state.stations.filter(s => s.zone.toLowerCase().includes(zoneName.toLowerCase()));
    if (matching.length === 0) return;

    this.state.activeCities = new Set(matching.map(s => s.city));
    this.renderCityPills();
    this.renderTrends();

    if (this.mapInstance) {
      this.mapInstance.filterMarkersByZone(zoneName);
    }

    const filterBar = document.getElementById('interactiveFilterBar');
    const filterText = document.getElementById('filterIndicatorText');
    if (filterBar && filterText) {
      filterText.innerText = `Active Spatial Zone: ${zoneName} (${matching.length} Stations Active)`;
      filterBar.style.display = 'flex';
    }

    this.showToast(`Spatial Filter: ${zoneName} Airshed (${matching.length} Stations)`);
  }

  filterByCategory(categoryLabel) {
    const cleanCat = categoryLabel.split(' ')[0].toUpperCase();
    const matching = this.state.stations.filter(s => s.category.toUpperCase().includes(cleanCat));

    this.state.activeCities = new Set(matching.map(s => s.city));
    this.renderCityPills();
    this.renderTrends();

    if (this.mapInstance) {
      this.mapInstance.filterMarkersByCategory(cleanCat);
    }

    const filterBar = document.getElementById('interactiveFilterBar');
    const filterText = document.getElementById('filterIndicatorText');
    if (filterBar && filterText) {
      filterText.innerText = `Active Hazard Category Filter: ${categoryLabel} (${matching.length} Stations)`;
      filterBar.style.display = 'flex';
    }

    this.showToast(`Category Filter: Showing ${matching.length} stations in ${categoryLabel}`);
  }

  clearInteractiveFilter() {
    const filterBar = document.getElementById('interactiveFilterBar');
    if (filterBar) filterBar.style.display = 'none';

    this.state.activeCities = new Set(this.state.stations.map(s => s.city));
    this.renderCityPills();
    this.renderTrends();

    if (this.mapInstance) {
      this.mapInstance.filterMarkersByZone('all');
      this.mapInstance.resetView();
    }

    this.showToast('Spatial & Category filters cleared. Full India grid active.');
  }

  openPollutantModal(name, val, unit, limit, pct) {
    const modal = document.getElementById('modalPollutantDetail');
    if (!modal) return;

    const descriptions = {
      'PM2.5': {
        chem: 'Particulate Matter < 2.5 µm',
        sources: 'Vehicular diesel exhaust, biomass agricultural burning, coal-fired power stations, industrial emissions.',
        effects: 'Penetrates deep into alveolar gas exchange surfaces, enters cardiovascular circulation, triggers systemic inflammation, strokes, lung cancer.',
        who24: '15 µg/m³',
        cpcb24: '60 µg/m³'
      },
      'PM10': {
        chem: 'Particulate Matter < 10 µm (Coarse Respirable Dust)',
        sources: 'Road surface abrasion, construction and demolition debris, unpaved soil resuspension, mechanical grinding.',
        effects: 'Lodges in upper tracheobronchial airways, induces coughing, chronic bronchitis, asthma exacerbation.',
        who24: '45 µg/m³',
        cpcb24: '100 µg/m³'
      },
      'NO2': {
        chem: 'Nitrogen Dioxide',
        sources: 'High-temperature internal combustion engines, trucks, gas turbines, fossil fuel furnaces.',
        effects: 'Airway hyperresponsiveness, reduced pulmonary function, precursor to ground-level tropospheric ozone and secondary nitrate aerosols.',
        who24: '25 µg/m³',
        cpcb24: '80 µg/m³'
      },
      'SO2': {
        chem: 'Sulfur Dioxide',
        sources: 'Coal-fired power generation, heavy fuel oil combustion, metal smelters, petroleum refineries.',
        effects: 'Bronchoconstriction within minutes of inhalation, sensory irritation of mucosal membranes, precursor to acid precipitation.',
        who24: '40 µg/m³',
        cpcb24: '80 µg/m³'
      },
      'CO': {
        chem: 'Carbon Monoxide',
        sources: 'Incomplete combustion of hydrocarbon fuels, congested stop-and-go motor traffic, malfunctioning burners.',
        effects: 'Binds with hemoglobin to form carboxyhemoglobin (COHb), reducing oxygen transport capacity to heart and brain tissue.',
        who24: '2.0 mg/m³',
        cpcb24: '4.0 mg/m³'
      },
      'O3': {
        chem: 'Ground-level Tropospheric Ozone',
        sources: 'Photochemical secondary formation driven by sunlight reacting with NOx and Volatile Organic Compounds (VOCs).',
        effects: 'Strong oxidative pulmonary cellular damage, chest tightness, reduced FEV1 lung volumes, aggravated asthma.',
        who24: '50 µg/m³',
        cpcb24: '100 µg/m³'
      }
    };

    const d = descriptions[name] || descriptions['PM2.5'];

    document.getElementById('pollutantModalTitle').innerText = `Chemical Intelligence: ${name}`;
    const pill = document.getElementById('pollutantModalPill');
    if (pill) {
      pill.innerText = pct > 100 ? `${pct}% of WHO Safe Limit` : `Compliant (${pct}%)`;
      pill.style.color = pct > 100 ? '#f87171' : '#34d399';
      pill.style.borderColor = pct > 100 ? '#ef4444' : '#10b981';
    }

    const body = document.getElementById('pollutantModalBody');
    if (body) {
      body.innerHTML = `
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 14px; margin-bottom: 14px;">
          <div style="font-size: 0.75rem; color: #94a3b8; font-weight: 700;">CHEMICAL FORMULA / CLASSIFICATION</div>
          <div style="font-size: 1.15rem; font-weight: 800; color: #fff; margin: 2px 0 8px 0;">${d.chem}</div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; text-align: center;">
            <div style="background: rgba(255,255,255,0.04); padding: 8px; border-radius: 6px;">
              <div style="font-size: 0.68rem; color: #94a3b8;">MEASURED</div>
              <div style="font-size: 1.1rem; font-weight: 800; color: #38bdf8;">${val} ${unit}</div>
            </div>
            <div style="background: rgba(255,255,255,0.04); padding: 8px; border-radius: 6px;">
              <div style="font-size: 0.68rem; color: #94a3b8;">WHO 24H LIMIT</div>
              <div style="font-size: 1.1rem; font-weight: 800; color: #34d399;">${d.who24}</div>
            </div>
            <div style="background: rgba(255,255,255,0.04); padding: 8px; border-radius: 6px;">
              <div style="font-size: 0.68rem; color: #94a3b8;">CPCB 24H STANDARD</div>
              <div style="font-size: 1.1rem; font-weight: 800; color: #facc15;">${d.cpcb24}</div>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 12px;">
          <h4 style="color: #38bdf8; font-size: 0.85rem; margin-bottom: 4px;">Primary Emission Sources:</h4>
          <p style="font-size: 0.8rem; color: #cbd5e1; line-height: 1.5;">${d.sources}</p>
        </div>

        <div>
          <h4 style="color: #f87171; font-size: 0.85rem; margin-bottom: 4px;">Human Physiological & Pathological Impacts:</h4>
          <p style="font-size: 0.8rem; color: #cbd5e1; line-height: 1.5;">${d.effects}</p>
        </div>
      `;
    }

    modal.classList.add('open');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
  }

  async loadValidationReport() {
    try {
      const res = await fetch('/api/validation-report');
      const data = await res.json();
      const tbody = document.getElementById('validationReportTbody');
      if (tbody) {
        tbody.innerHTML = '';
        data.checks.forEach(c => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td style="font-weight: 600; color: #fff;">${c.check}</td>
            <td style="color: #34d399;">${c.result}</td>
            <td style="color: #94a3b8; font-size: 11px;">${c.handling}</td>
          `;
          tbody.appendChild(tr);
        });
      }
    } catch (err) {
      console.error('Validation report error:', err);
    }
  }

  async loadDataSources() {
    try {
      const res = await fetch('/api/sources');
      const data = await res.json();
      const container = document.getElementById('sourcesListContainer');
      if (container) {
        container.innerHTML = '';
        data.sources.forEach(s => {
          const card = document.createElement('div');
          card.style.background = 'rgba(255, 255, 255, 0.03)';
          card.style.border = '1px solid rgba(255, 255, 255, 0.08)';
          card.style.borderRadius = '8px';
          card.style.padding = '12px 16px';
          card.style.marginBottom = '10px';
          card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
              <strong style="color: #38bdf8; font-size: 0.9rem;">${s.name}</strong>
              <a href="${s.portal}" target="_blank" rel="noopener noreferrer" style="color: #6ee7b7; font-size: 0.78rem; text-decoration: none; font-weight: 600;">Open Portal ↗</a>
            </div>
            <div style="font-size: 0.75rem; color: #cbd5e1; margin-bottom: 4px;"><strong>Agency:</strong> ${s.agency}</div>
            <p style="font-size: 0.75rem; color: #94a3b8; line-height: 1.4;">${s.description}</p>
            <div style="font-size: 0.72rem; color: #64748b; font-family: monospace; margin-top: 4px;">Link: <a href="${s.url}" target="_blank" rel="noopener noreferrer" style="color: #94a3b8;">${s.url}</a></div>
          `;
          container.appendChild(card);
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async submitAddRecord(e) {
    e.preventDefault();
    const city = document.getElementById('addCity')?.value;
    const date = document.getElementById('addDate')?.value;
    const aqi = document.getElementById('addAqi')?.value;
    const pm25 = document.getElementById('addPm25')?.value;
    const pm10 = document.getElementById('addPm10')?.value;
    const no2 = document.getElementById('addNo2')?.value;
    const so2 = document.getElementById('addSo2')?.value;

    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, date, aqi, pm25, pm10, no2, so2 })
      });
      const data = await res.json();
      if (data.success) {
        this.closeModal('modalAddRecord');
        this.showToast(`Record added for ${city} (AQI: ${aqi})`);
        this.refreshDashboardData();
      } else {
        alert(data.error || 'Failed to add record');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while adding record.');
    }
  }

  async reseedDatabase() {
    if (!confirm('Are you sure you want to re-seed the database back to original verified dataset?')) return;
    try {
      const res = await fetch('/api/database/reseed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        this.showToast('Database successfully re-seeded!');
        this.loadValidationReport();
        this.refreshDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  initAudioBriefing() {
    const btn = document.getElementById('btnAudioBriefing');
    if (!btn) return;

    btn.addEventListener('click', () => {
      try {
        // Play acoustic chime using Web Audio API
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        if (AudioCtxClass) {
          const audioCtx = new AudioCtxClass();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
          osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
          gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.6);
        }
      } catch (e) {
        // fallback
      }

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop any ongoing speech
        const kpi = this.state.kpis || {};
        const avgAqi = kpi.avg_aqi || 61;
        const cat = kpi.aqi_category || 'Moderate';
        const peakCity = kpi.peak_city || 'Gurugram';
        const peakAqi = kpi.peak_aqi || 500;
        const text = `Air Quality Monitoring Environmental Intelligence Briefing. The nationwide average Air Quality Index stands at ${avgAqi}, categorized by the Central Pollution Control Board as ${cat}. The South India monitoring network is reporting favorable atmospheric dispersion with coastal sea breezes across Mangaluru, Kochi, and Visakhapatnam. The highest recorded pollution spike is ${peakAqi} index in ${peakCity}. Sensitive individuals are advised to follow regional health precautions.`;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        const btnText = document.getElementById('audioBriefingText');
        if (btnText) btnText.innerText = 'Speaking...';
        utterance.onend = () => {
          if (btnText) btnText.innerText = 'Audio Briefing';
        };
        utterance.onerror = () => {
          if (btnText) btnText.innerText = 'Audio Briefing';
        };

        window.speechSynthesis.speak(utterance);
        this.showToast('Playing Air Quality Monitoring Audio Atmospheric Briefing...');
      } else {
        this.showToast('Speech synthesis not supported in this browser.');
      }
    });
  }

  async loadForecast(city = 'all') {
    try {
      const res = await fetch(`/api/forecast?city=${encodeURIComponent(city)}`);
      const data = await res.json();
      const peakPill = document.getElementById('forecastPeakPill');
      if (peakPill) {
        peakPill.innerText = `Peak Window: ${data.peak_smog_hour} (${data.peak_predicted_aqi} AQI - ${data.peak_category})`;
      }
      if (this.chartsInstance && this.chartsInstance.renderForecastChart) {
        this.chartsInstance.renderForecastChart(data);
      }
    } catch (err) {
      console.error('Error loading forecast:', err);
    }
  }

  async loadWeather(city = 'all') {
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      const data = await res.json();
      
      const windVal = document.getElementById('weatherWindVal');
      const windSub = document.getElementById('weatherWindSub');
      const tempVal = document.getElementById('weatherTempVal');
      const pblVal = document.getElementById('weatherPblVal');
      const ventVal = document.getElementById('weatherVentVal');
      const ventSub = document.getElementById('weatherVentSub');

      if (windVal) windVal.innerText = `${data.wind_speed} ${data.wind_direction}`;
      if (windSub) windSub.innerText = data.inversion_risk;
      if (tempVal) tempVal.innerHTML = `${data.temperature} &bull; ${data.humidity}`;
      if (pblVal) pblVal.innerText = data.pbl_height;
      if (ventVal) ventVal.innerText = data.ventilation_coeff;
      if (ventSub) ventSub.innerText = data.visibility_km ? `Visibility: ${data.visibility_km}` : 'Active Advection';
    } catch (err) {
      console.error('Error loading weather:', err);
    }
  }

  async loadDuel() {
    const duel1 = document.getElementById('duelCity1Select');
    const duel2 = document.getElementById('duelCity2Select');
    if (!duel1 || !duel2) return;

    const c1 = duel1.value || 'Hyderabad';
    const c2 = duel2.value || 'Delhi';

    try {
      const res = await fetch(`/api/compare?city1=${encodeURIComponent(c1)}&city2=${encodeURIComponent(c2)}`);
      const data = await res.json();
      this.renderDuelResults(data);
    } catch (err) {
      console.error('Error loading duel:', err);
    }
  }

  renderDuelResults(data) {
    const container = document.getElementById('duelResultsContainer');
    if (!container || !data.city1 || !data.city2) return;

    const c1 = data.city1;
    const c2 = data.city2;
    const c1Color = this.chartsInstance.getCategoryColor(c1.aqi);
    const c2Color = this.chartsInstance.getCategoryColor(c2.aqi);

    const maxPm25 = Math.max(c1.pm25, c2.pm25, 1);
    const c1Pm25Pct = Math.min(100, (c1.pm25 / maxPm25) * 100);
    const c2Pm25Pct = Math.min(100, (c2.pm25 / maxPm25) * 100);

    const maxPm10 = Math.max(c1.pm10, c2.pm10, 1);
    const c1Pm10Pct = Math.min(100, (c1.pm10 / maxPm10) * 100);
    const c2Pm10Pct = Math.min(100, (c2.pm10 / maxPm10) * 100);

    container.innerHTML = `
      <div class="duel-result-box">
        <div class="duel-header-row">
          <div class="duel-city-col">
            <div class="duel-city-name">${c1.city}</div>
            <div class="duel-city-aqi" style="color: ${c1Color};">${c1.aqi}</div>
            <span class="badge-vulnerability" style="background: rgba(255,255,255,0.08); color: ${c1Color};">${c1.category}</span>
          </div>

          <div style="padding: 0 10px; text-align: center;">
            <div class="duel-delta-badge">
              &Delta; ${data.delta_aqi} AQI
            </div>
            <div style="font-size: 0.65rem; color: #94a3b8; margin-top: 4px;">
              ${data.percentage_difference}% Difference
            </div>
          </div>

          <div class="duel-city-col">
            <div class="duel-city-name">${c2.city}</div>
            <div class="duel-city-aqi" style="color: ${c2Color};">${c2.aqi}</div>
            <span class="badge-vulnerability" style="background: rgba(255,255,255,0.08); color: ${c2Color};">${c2.category}</span>
          </div>
        </div>

        <!-- Metric 1: PM2.5 -->
        <div class="duel-metric-row">
          <div style="color: #38bdf8; font-weight: 700;">${c1.pm25} &micro;g/m&sup3;</div>
          <div style="text-align: center;">
            <div class="duel-metric-label">FINE PARTICULATES (PM2.5)</div>
            <div class="duel-bar-track">
              <div class="duel-bar-left" style="width: ${c1Pm25Pct}%;"></div>
              <div class="duel-bar-right" style="width: ${c2Pm25Pct}%;"></div>
            </div>
          </div>
          <div style="color: #f97316; font-weight: 700; text-align: right;">${c2.pm25} &micro;g/m&sup3;</div>
        </div>

        <!-- Metric 2: PM10 -->
        <div class="duel-metric-row">
          <div style="color: #38bdf8; font-weight: 700;">${c1.pm10} &micro;g/m&sup3;</div>
          <div style="text-align: center;">
            <div class="duel-metric-label">RESPIRABLE DUST (PM10)</div>
            <div class="duel-bar-track">
              <div class="duel-bar-left" style="width: ${c1Pm10Pct}%;"></div>
              <div class="duel-bar-right" style="width: ${c2Pm10Pct}%;"></div>
            </div>
          </div>
          <div style="color: #f97316; font-weight: 700; text-align: right;">${c2.pm10} &micro;g/m&sup3;</div>
        </div>

        <!-- Verdict Banner -->
        <div style="background: rgba(56, 189, 248, 0.08); border: 1px dashed rgba(56, 189, 248, 0.3); border-radius: 6px; padding: 8px 12px; font-size: 0.74rem; color: #cbd5e1; text-align: center;">
          🏆 <strong>Comparative Verdict:</strong> ${data.verdict}
        </div>
      </div>
    `;
  }

  showToast(message) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.AirQualityMonitoringApp = new AirQualityMonitoringApp();
});
