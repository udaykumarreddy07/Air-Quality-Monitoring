/**
 * Air Quality Monitoring - Advanced D3.js (v7) Visualization Engine
 * Includes:
 * 1. Multi-City Temporal Splines & CPCB Safety Bands (Figures 6.3 & 6.4)
 * 2. City Comparison Ranking Bar Chart (Figure 6.2)
 * 3. Multi-Pollutant Radar / Spider Web Chart
 * 4. Regional Zonal Severity Matrix Chart
 * 5. CPCB Category Distribution Donut Chart
 * 6. PM2.5 vs PM10 Particle Correlation Scatter Plot
 * 7. Composite AQI Speedometer Arc Gauge
 */

class AirQualityMonitoringCharts {
  constructor(appState) {
    this.appState = appState;
    this.cityColors = {};
  }

  getCityColor(city) {
    if (this.cityColors[city]) return this.cityColors[city];
    const palette = [
      '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
      '#38bdf8', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
      '#14b8a6', '#f43f5e', '#fbbf24', '#22c55e', '#3b82f6'
    ];
    let hash = 0;
    for (let i = 0; i < city.length; i++) {
      hash = city.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = palette[Math.abs(hash) % palette.length];
    this.cityColors[city] = color;
    return color;
  }

  getCategoryColor(aqi) {
    if (aqi <= 50) return '#10b981';
    if (aqi <= 100) return '#eab308';
    if (aqi <= 150) return '#f97316';
    if (aqi <= 200) return '#ef4444';
    if (aqi <= 300) return '#a855f7';
    return '#dc2626';
  }

  // ==========================================
  // 1. D3 Multi-City Temporal Trend Splines
  // ==========================================
  renderTrendChart(trendsData, activeCitiesSet, options = {}) {
    const container = document.getElementById('trendChartContainer');
    if (!container) return;
    container.innerHTML = '';

    const width = container.clientWidth || 1000;
    const height = container.clientHeight || 440;
    const margin = { top: 25, right: 90, bottom: 40, left: 55 };

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'trend-svg');

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const parseTime = d3.timeParse('%Y-%m-%d');
    const dates = trendsData.dates.map(d => parseTime(d));

    const xScale = d3.scaleTime()
      .domain(d3.extent(dates))
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 360])
      .range([chartHeight, 0]);

    // Safety Bands Background
    if (options.safetyBands !== false) {
      const bands = [
        { y0: 0, y1: 50, color: '#10b981', label: 'Good (0-50)' },
        { y0: 50, y1: 100, color: '#eab308', label: 'Moderate (51-100)' },
        { y0: 100, y1: 150, color: '#f97316', label: 'Sensitive (101-150)' },
        { y0: 150, y1: 360, color: '#ef4444', label: 'Unhealthy (151+)' }
      ];

      bands.forEach(b => {
        g.append('rect')
          .attr('x', 0)
          .attr('y', yScale(Math.min(360, b.y1)))
          .attr('width', chartWidth)
          .attr('height', yScale(b.y0) - yScale(Math.min(360, b.y1)))
          .attr('fill', b.color)
          .attr('class', 'safety-band-rect');

        g.append('line')
          .attr('x1', 0)
          .attr('x2', chartWidth)
          .attr('y1', yScale(b.y1))
          .attr('y2', yScale(b.y1))
          .attr('stroke', '#ffffff')
          .attr('class', 'safety-band-line');

        g.append('text')
          .attr('x', chartWidth + 10)
          .attr('y', yScale(b.y0) - 8)
          .attr('fill', '#94a3b8')
          .attr('font-size', '10px')
          .attr('font-family', 'monospace')
          .text(b.label);
      });
    }

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale).tickSize(-chartWidth).tickFormat(''))
      .selectAll('line')
      .attr('stroke', 'rgba(255, 255, 255, 0.05)')
      .attr('stroke-dasharray', '2,2');

    // Axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(d3.timeDay.every(4))
      .tickFormat(d3.timeFormat('%d %b'));

    const yAxis = d3.axisLeft(yScale).ticks(7);

    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .attr('class', 'axis x-axis')
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '11px');

    g.append('g')
      .attr('class', 'axis y-axis')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '11px');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -42)
      .attr('x', -chartHeight / 2)
      .attr('fill', '#94a3b8')
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .text('AQI Level (Index)');

    // Line generator
    const curveFactory = options.curveType === 'linear' ? d3.curveLinear : d3.curveMonotoneX;
    const lineGen = d3.line()
      .x(d => xScale(parseTime(d.date)))
      .y(d => yScale(d.aqi))
      .curve(curveFactory);

    // City Lines
    const linesGroup = g.append('g').attr('class', 'lines-group');
    const cityPaths = {};

    Object.keys(trendsData.cities).forEach(cityName => {
      const cityData = trendsData.cities[cityName];
      const isCityActive = !activeCitiesSet || activeCitiesSet.has(cityName);
      const color = this.getCityColor(cityName);

      const path = linesGroup.append('path')
        .datum(cityData)
        .attr('class', 'spline-curve')
        .attr('id', `curve-${cityName.replace(/\s+/g, '_')}`)
        .attr('d', lineGen)
        .attr('stroke', color)
        .style('display', isCityActive ? null : 'none');

      cityPaths[cityName] = path;

      if (options.dataDots) {
        g.selectAll(`.dot-${cityName.replace(/\s+/g, '_')}`)
          .data(cityData)
          .enter()
          .append('circle')
          .attr('class', `data-dot dot-${cityName.replace(/\s+/g, '_')}`)
          .attr('cx', d => xScale(parseTime(d.date)))
          .attr('cy', d => yScale(d.aqi))
          .attr('r', 2.5)
          .attr('fill', color)
          .style('display', isCityActive ? null : 'none');
      }
    });

    if (options.averageCurve !== false && trendsData.national_curve) {
      g.append('path')
        .datum(trendsData.national_curve)
        .attr('class', 'national-avg-curve')
        .attr('d', lineGen);
    }

    // Crosshair & Hover
    const crosshair = g.append('line')
      .attr('class', 'crosshair-line')
      .attr('y1', 0)
      .attr('y2', chartHeight)
      .style('opacity', 0);

    const activeRingDot = g.append('circle')
      .attr('class', 'active-ring-dot')
      .attr('r', 7)
      .style('opacity', 0);

    const overlay = g.append('rect')
      .attr('class', 'chart-overlay')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair');

    const bisectDate = d3.bisector(d => parseTime(d.date)).left;
    let lastHoveredCity = null;

    overlay
      .on('mousemove', (event) => {
        const [mx, my] = d3.pointer(event);
        const xDate = xScale.invert(mx);

        let closestCity = null;
        let closestDist = Infinity;
        let closestRecord = null;

        const activeCitiesList = Object.keys(trendsData.cities).filter(c => !activeCitiesSet || activeCitiesSet.has(c));

        for (const c of activeCitiesList) {
          const cData = trendsData.cities[c];
          const idx = bisectDate(cData, xDate, 1);
          const d0 = cData[idx - 1];
          const d1 = cData[idx];
          let rec = d0;
          if (d1 && parseTime(d1.date) - xDate < xDate - parseTime(d0.date)) {
            rec = d1;
          }
          if (rec) {
            const py = yScale(rec.aqi);
            const dist = Math.abs(my - py);
            if (dist < closestDist) {
              closestDist = dist;
              closestCity = c;
              closestRecord = rec;
            }
          }
        }

        if (closestCity && closestRecord) {
          lastHoveredCity = closestCity;
          const cx = xScale(parseTime(closestRecord.date));
          const cy = yScale(closestRecord.aqi);

          crosshair
            .attr('x1', cx)
            .attr('x2', cx)
            .style('opacity', 1);

          activeRingDot
            .attr('cx', cx)
            .attr('cy', cy)
            .attr('fill', this.getCityColor(closestCity))
            .style('opacity', 1);

          g.selectAll('.spline-curve').classed('dimmed', true).classed('highlighted', false);
          if (cityPaths[closestCity]) {
            cityPaths[closestCity].classed('dimmed', false).classed('highlighted', true);
          }

          this.updateHudReadout(closestCity, closestRecord);
        }
      })
      .on('click', () => {
        if (lastHoveredCity && window.AirQualityMonitoringApp && window.AirQualityMonitoringApp.openAirshedDrawer) {
          window.AirQualityMonitoringApp.openAirshedDrawer(lastHoveredCity);
        }
      })
      .on('mouseleave', () => {
        crosshair.style('opacity', 0);
        activeRingDot.style('opacity', 0);
        g.selectAll('.spline-curve').classed('dimmed', false).classed('highlighted', false);
        this.resetHudReadout();
      });

    this.highlightCityCurve = (cityName) => {
      if (cityPaths[cityName]) {
        g.selectAll('.spline-curve').classed('dimmed', true).classed('highlighted', false);
        cityPaths[cityName].classed('dimmed', false).classed('highlighted', true);
      }
    };

    this.unhighlightAllCurves = () => {
      g.selectAll('.spline-curve').classed('dimmed', false).classed('highlighted', false);
    };
  }

  updateHudReadout(city, rec) {
    const titleEl = document.getElementById('hudCityTitle');
    const dateEl = document.getElementById('hudDateBadge');
    const aqiEl = document.getElementById('hudAqiVal');
    const pm25El = document.getElementById('hudPm25Val');
    const pm10El = document.getElementById('hudPm10Val');
    const no2El = document.getElementById('hudNo2Val');
    const so2El = document.getElementById('hudSo2Val');

    if (titleEl) titleEl.innerText = city;
    if (dateEl) dateEl.innerText = rec.date_display || rec.date;
    if (aqiEl) aqiEl.innerText = `AQI: ${rec.aqi}`;
    if (pm25El) pm25El.innerText = rec.pm25;
    if (pm10El) pm10El.innerText = rec.pm10;
    if (no2El) no2El.innerText = rec.no2;
    if (so2El) so2El.innerText = rec.so2;
  }

  resetHudReadout() {
    const titleEl = document.getElementById('hudCityTitle');
    const dateEl = document.getElementById('hudDateBadge');
    const aqiEl = document.getElementById('hudAqiVal');
    const pm25El = document.getElementById('hudPm25Val');
    const pm10El = document.getElementById('hudPm10Val');
    const no2El = document.getElementById('hudNo2Val');
    const so2El = document.getElementById('hudSo2Val');

    if (titleEl) titleEl.innerText = 'Touch Any Place or City';
    if (dateEl) dateEl.innerText = 'Sep - Oct 2026';
    if (aqiEl) aqiEl.innerText = '-- AWAITING TOUCH';
    if (pm25El) pm25El.innerText = '--';
    if (pm10El) pm10El.innerText = '--';
    if (no2El) no2El.innerText = '--';
    if (so2El) so2El.innerText = '--';
  }

  // ==========================================
  // 2. City Comparison Ranking Chart (Figure 6.2)
  // ==========================================
  renderRankingChart(rankingsData, nationalAvg = 94, onCityClick = null) {
    const container = document.getElementById('rankingChartContainer');
    if (!container) return;
    container.innerHTML = '';

    const width = container.clientWidth || 550;
    const height = container.clientHeight || 480;
    const margin = { top: 35, right: 25, bottom: 50, left: 45 };

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const data = rankingsData;
    const n = data.length;

    const xScale = d3.scaleLinear()
      .domain([0, n - 1])
      .range([10, chartWidth - 10]);

    const yScale = d3.scaleLinear()
      .domain([0, 200])
      .range([chartHeight, 0]);

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickSize(-chartWidth).tickFormat(''))
      .selectAll('line')
      .attr('stroke', 'rgba(255, 255, 255, 0.05)')
      .attr('stroke-dasharray', '2,2');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px');

    g.append('line')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('y1', yScale(nationalAvg))
      .attr('y2', yScale(nationalAvg))
      .attr('stroke', '#38bdf8')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4,4');

    g.append('text')
      .attr('x', chartWidth - 60)
      .attr('y', yScale(nationalAvg) - 6)
      .attr('fill', '#38bdf8')
      .attr('font-size', '11px')
      .attr('font-weight', '700')
      .text(`Avg: ${nationalAvg}`);

    const tooltip = d3.select('body').append('div')
      .attr('class', 'chart-tooltip')
      .style('position', 'absolute')
      .style('padding', '6px 12px')
      .style('background', 'rgba(15, 23, 42, 0.95)')
      .style('border', '1px solid rgba(255,255,255,0.2)')
      .style('border-radius', '6px')
      .style('font-size', '11px')
      .style('color', '#fff')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 10000);

    data.forEach((d, i) => {
      const cx = xScale(i);
      const cy = yScale(d.avg_aqi);
      const color = this.getCategoryColor(d.avg_aqi);

      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 3.5)
        .attr('fill', color)
        .style('cursor', 'pointer')
        .on('mouseover', (event) => {
          tooltip.transition().duration(150).style('opacity', 1);
          tooltip.html(`<strong>#${i + 1} ${d.city}</strong><br/>Average AQI: <strong>${d.avg_aqi}</strong><br/>Category: ${d.category}`)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', () => tooltip.transition().duration(150).style('opacity', 0))
        .on('click', () => {
          if (window.AirQualityMonitoringApp && window.AirQualityMonitoringApp.openAirshedDrawer) {
            window.AirQualityMonitoringApp.openAirshedDrawer(d.city);
          }
          if (onCityClick) onCityClick(d.city);
        });

      g.append('text')
        .attr('x', cx)
        .attr('y', cy - 8)
        .attr('text-anchor', 'middle')
        .attr('fill', '#cbd5e1')
        .attr('font-size', '9px')
        .attr('font-weight', '600')
        .text(d.avg_aqi);
    });
  }

  // ==========================================
  // 3. Multi-Pollutant Radar / Spider Web Chart
  // ==========================================
  renderRadarChart(data, containerId = 'radarChartContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const width = container.clientWidth || 380;
    const height = 320;
    const radius = Math.min(width, height) / 2 - 45;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const pollutants = data.pollutants;
    const totalAxes = pollutants.length;
    const angleSlice = (Math.PI * 2) / totalAxes;

    // Concentric grid circles (50%, 100% threshold, 150%, 200%)
    const levels = [50, 100, 150, 200];
    const rScale = d3.scaleLinear().domain([0, 250]).range([0, radius]);

    levels.forEach(level => {
      g.append('circle')
        .attr('r', rScale(level))
        .attr('fill', 'none')
        .attr('stroke', level === 100 ? 'rgba(239, 68, 68, 0.6)' : 'rgba(255, 255, 255, 0.08)')
        .attr('stroke-width', level === 100 ? 1.5 : 1)
        .attr('stroke-dasharray', level === 100 ? '4,4' : null);

      if (level === 100) {
        g.append('text')
          .attr('x', 4)
          .attr('y', -rScale(level) + 10)
          .attr('fill', '#f87171')
          .attr('font-size', '9px')
          .attr('font-weight', '700')
          .text('100% WHO Safe Limit');
      }
    });

    // Axis spokes and labels
    pollutants.forEach((d, i) => {
      const angle = i * angleSlice - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      g.append('line')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', x).attr('y2', y)
        .attr('stroke', 'rgba(255, 255, 255, 0.1)');

      const labelX = Math.cos(angle) * (radius + 20);
      const labelY = Math.sin(angle) * (radius + 15);

      const labelText = g.append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#38bdf8')
        .attr('font-size', '11px')
        .attr('font-weight', '700')
        .style('cursor', 'pointer')
        .text(`${d.name}`)
        .on('click', () => {
          if (window.AirQualityMonitoringApp && window.AirQualityMonitoringApp.openPollutantModal) {
            window.AirQualityMonitoringApp.openPollutantModal(d.name, d.value, d.unit, d.limit, d.pct);
          }
        });
    });

    // Radar polygon coordinates
    const radarLine = d3.lineRadial()
      .radius(d => rScale(d.pct))
      .angle((d, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);

    // Glowing Radar polygon
    g.append('path')
      .datum(pollutants)
      .attr('d', radarLine)
      .attr('fill', 'rgba(56, 189, 248, 0.25)')
      .attr('stroke', '#38bdf8')
      .attr('stroke-width', 2.2)
      .style('filter', 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.5))');

    // Data vertices with interactive click
    pollutants.forEach((d, i) => {
      const angle = i * angleSlice - Math.PI / 2;
      const x = Math.cos(angle) * rScale(d.pct);
      const y = Math.sin(angle) * rScale(d.pct);

      g.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 5.5)
        .attr('fill', d.pct > 100 ? '#f87171' : '#10b981')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('click', () => {
          if (window.AirQualityMonitoringApp && window.AirQualityMonitoringApp.openPollutantModal) {
            window.AirQualityMonitoringApp.openPollutantModal(d.name, d.value, d.unit, d.limit, d.pct);
          }
        })
        .append('title')
        .text(`${d.name}: ${d.value} ${d.unit} (${Math.round(d.pct)}% of WHO Limit)\n👉 Click to inspect chemical properties`);

      g.append('text')
        .attr('x', x)
        .attr('y', y - 8)
        .attr('text-anchor', 'middle')
        .attr('fill', '#f1f5f9')
        .attr('font-size', '9px')
        .attr('font-weight', '700')
        .text(`${d.value} ${d.unit}`);
    });
  }

  // ==========================================
  // 4. Regional Zonal Severity Matrix Chart
  // ==========================================
  renderZonalChart(zonalData, containerId = 'zonalChartContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const width = container.clientWidth || 380;
    const height = 320;
    const margin = { top: 20, right: 30, bottom: 30, left: 110 };

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const yScale = d3.scaleBand()
      .domain(zonalData.map(d => d.zone))
      .range([0, chartHeight])
      .padding(0.3);

    const xScale = d3.scaleLinear()
      .domain([0, 180])
      .range([0, chartWidth]);

    // Bars with interactive filtering click
    g.selectAll('.zone-bar')
      .data(zonalData)
      .enter()
      .append('rect')
      .attr('class', 'zone-bar')
      .attr('y', d => yScale(d.zone))
      .attr('x', 0)
      .attr('height', yScale.bandwidth())
      .attr('width', d => xScale(d.avg_aqi))
      .attr('rx', 4)
      .attr('fill', d => this.getCategoryColor(d.avg_aqi))
      .attr('opacity', 0.88)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        if (window.AirQualityMonitoringApp && window.AirQualityMonitoringApp.filterByZone) {
          window.AirQualityMonitoringApp.filterByZone(d.zone);
        }
      })
      .append('title')
      .text(d => `Click to isolate ${d.zone} Airshed (${d.station_count} stations, Avg AQI: ${d.avg_aqi})`);

    // Value Labels
    g.selectAll('.zone-val')
      .data(zonalData)
      .enter()
      .append('text')
      .attr('y', d => yScale(d.zone) + yScale.bandwidth() / 2 + 4)
      .attr('x', d => xScale(d.avg_aqi) + 8)
      .attr('fill', '#fff')
      .attr('font-size', '11px')
      .attr('font-weight', '700')
      .text(d => `${d.avg_aqi} AQI`);

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .attr('fill', '#cbd5e1')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .style('cursor', 'pointer')
      .on('click', (event, zone) => {
        if (window.AirQualityMonitoringApp && window.AirQualityMonitoringApp.filterByZone) {
          window.AirQualityMonitoringApp.filterByZone(zone);
        }
      });
  }

  // ==========================================
  // 5. CPCB Category Donut Chart
  // ==========================================
  renderDonutChart(categoryData, containerId = 'donutChartContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const width = container.clientWidth || 320;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 20;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie().value(d => d.count).sort(null);
    const arc = d3.arc().innerRadius(radius * 0.58).outerRadius(radius);
    const arcHover = d3.arc().innerRadius(radius * 0.58).outerRadius(radius + 7);

    const arcs = svg.selectAll('.arc')
      .data(pie(categoryData))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this).transition().duration(150).attr('d', arcHover);
        centerText.text(`${d.data.pct}%`);
        centerSub.text(d.data.label.split(' ')[0]);
      })
      .on('mouseleave', function(event, d) {
        d3.select(this).transition().duration(150).attr('d', arc);
        centerText.text('2,304');
        centerSub.text('Total Observations');
      })
      .on('click', (event, d) => {
        if (window.AirQualityMonitoringApp && window.AirQualityMonitoringApp.filterByCategory) {
          window.AirQualityMonitoringApp.filterByCategory(d.data.label);
        }
      })
      .append('title')
      .text(d => `${d.data.label}: ${d.data.count} observations (${d.data.pct}%)\n👉 Click to filter stations`);

    const centerText = svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -4)
      .attr('fill', '#fff')
      .attr('font-size', '20px')
      .attr('font-weight', '800')
      .text('2,304');

    const centerSub = svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 14)
      .attr('fill', '#94a3b8')
      .attr('font-size', '9px')
      .attr('font-weight', '600')
      .text('Total Observations');
  }

  // ==========================================
  // 6. PM2.5 vs PM10 Correlation Scatter Plot
  // ==========================================
  renderScatterPlot(pointsData, containerId = 'scatterChartContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const width = container.clientWidth || 480;
    const height = 320;
    const margin = { top: 25, right: 30, bottom: 40, left: 50 };

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const maxPm25 = Math.max(80, (d3.max(pointsData, d => d.pm25) || 70) * 1.15);
    const maxPm10 = Math.max(120, (d3.max(pointsData, d => d.pm10) || 100) * 1.15);
    const xScale = d3.scaleLinear().domain([0, maxPm25]).range([0, chartWidth]);
    const yScale = d3.scaleLinear().domain([0, maxPm10]).range([chartHeight, 0]);

    // WHO Safe Quadrant background tint
    g.append('rect')
      .attr('x', 0)
      .attr('y', yScale(45))
      .attr('width', xScale(15))
      .attr('height', chartHeight - yScale(45))
      .attr('fill', 'rgba(16, 185, 129, 0.08)');

    g.append('text')
      .attr('x', 6)
      .attr('y', chartHeight - 8)
      .attr('fill', 'rgba(52, 211, 153, 0.65)')
      .attr('font-size', '8.5px')
      .attr('font-weight', '700')
      .text('WHO SAFE QUADRANT');

    // WHO Safety Reference Lines (PM2.5: 15, PM10: 45)
    g.append('line')
      .attr('x1', xScale(15)).attr('x2', xScale(15))
      .attr('y1', 0).attr('y2', chartHeight)
      .attr('stroke', '#10b981')
      .attr('stroke-dasharray', '4,4');

    g.append('line')
      .attr('x1', 0).attr('x2', chartWidth)
      .attr('y1', yScale(45)).attr('y2', yScale(45))
      .attr('stroke', '#10b981')
      .attr('stroke-dasharray', '4,4');

    g.append('text')
      .attr('x', xScale(16))
      .attr('y', 14)
      .attr('fill', '#34d399')
      .attr('font-size', '9px')
      .text('WHO PM2.5 (15)');

    g.append('text')
      .attr('x', chartWidth - 85)
      .attr('y', yScale(45) - 6)
      .attr('fill', '#34d399')
      .attr('font-size', '9px')
      .text('WHO PM10 (45)');

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).ticks(6))
      .selectAll('text').attr('fill', '#94a3b8').attr('font-size', '10px');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(6))
      .selectAll('text').attr('fill', '#94a3b8').attr('font-size', '10px');

    // Axis labels
    g.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', chartHeight + 34)
      .attr('fill', '#94a3b8')
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .text('Fine Particulates PM2.5 (µg/m³)');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -36)
      .attr('x', -chartHeight / 2)
      .attr('fill', '#94a3b8')
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .text('Coarse Dust PM10 (µg/m³)');

    // Interactive Scatter circles
    g.selectAll('.scatter-point')
      .data(pointsData)
      .enter()
      .append('circle')
      .attr('class', 'scatter-point')
      .attr('cx', d => xScale(d.pm25))
      .attr('cy', d => yScale(d.pm10))
      .attr('r', 5.5)
      .attr('fill', d => this.getCategoryColor(d.aqi))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.2)
      .attr('opacity', 0.88)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this).transition().duration(150).attr('r', 9).attr('stroke', '#38bdf8').attr('stroke-width', 2);
      })
      .on('mouseleave', function(event, d) {
        d3.select(this).transition().duration(150).attr('r', 5.5).attr('stroke', '#fff').attr('stroke-width', 1.2);
      })
      .on('click', (event, d) => {
        if (window.AirQualityMonitoringApp && window.AirQualityMonitoringApp.openAirshedDrawer) {
          window.AirQualityMonitoringApp.openAirshedDrawer(d.city);
        }
      })
      .append('title')
      .text(d => `${d.city} (${d.state})\nAQI: ${d.aqi} (${d.category})\nPM2.5: ${d.pm25} µg/m³\nPM10: ${d.pm10} µg/m³\n👉 Click to inspect full airshed telemetry`);
  }

  // ==========================================
  // 7. AQI Speedometer Arc Gauge
  // ==========================================
  renderGauge(aqiValue, containerId = 'gaugeContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const width = 240;
    const height = 150;
    const radius = 100;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height - 20})`);

    const arc = d3.arc()
      .innerRadius(65)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2);

    svg.append('path')
      .datum({ endAngle: Math.PI / 2 })
      .style('fill', 'rgba(255, 255, 255, 0.08)')
      .attr('d', arc);

    const aqiClamped = Math.min(500, Math.max(0, aqiValue));
    const angle = -Math.PI / 2 + (aqiClamped / 500) * Math.PI;

    svg.append('path')
      .datum({ endAngle: angle })
      .style('fill', this.getCategoryColor(aqiValue))
      .attr('d', arc);

    svg.append('text')
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '28px')
      .attr('font-weight', '800')
      .text(aqiValue);

    svg.append('text')
      .attr('y', 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .text('INDEX');
  }

  // ==========================================
  // 8. 24-Hour Predictive AQI Forecast Engine
  // ==========================================
  renderForecastChart(forecastData) {
    const container = document.getElementById('forecastChartContainer');
    if (!container || !forecastData || !forecastData.hourly) return;
    container.innerHTML = '';

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 260;
    const margin = { top: 20, right: 30, bottom: 35, left: 45 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const data = forecastData.hourly;

    const xScale = d3.scaleLinear()
      .domain([1, 24])
      .range([0, chartWidth]);

    const maxAqi = Math.max(160, d3.max(data, d => d.ci_upper) * 1.08);
    const yScale = d3.scaleLinear()
      .domain([0, maxAqi])
      .range([chartHeight, 0]);

    // Gridlines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale).ticks(5).tickSize(-chartWidth).tickFormat(''))
      .style('stroke', 'rgba(255, 255, 255, 0.05)')
      .style('stroke-dasharray', '3,3');

    // 95% Confidence Interval Shaded Area
    const ciArea = d3.area()
      .x(d => xScale(d.hour_offset))
      .y0(d => yScale(d.ci_lower))
      .y1(d => yScale(d.ci_upper))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('fill', 'rgba(56, 189, 248, 0.12)')
      .attr('stroke', 'none')
      .attr('d', ciArea);

    // Baseline Line (Predicted AQI)
    const line = d3.line()
      .x(d => xScale(d.hour_offset))
      .y(d => yScale(d.predicted_aqi))
      .curve(d3.curveMonotoneX);

    // Glowing stroke shadow
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(56, 189, 248, 0.35)')
      .attr('stroke-width', 6)
      .attr('d', line);

    // Main line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#38bdf8')
      .attr('stroke-width', 2.5)
      .attr('d', line);

    // Data dots
    g.selectAll('.forecast-dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'forecast-dot')
      .attr('cx', d => xScale(d.hour_offset))
      .attr('cy', d => yScale(d.predicted_aqi))
      .attr('r', 3.5)
      .attr('fill', d => this.getCategoryColor(d.predicted_aqi))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.2)
      .style('cursor', 'pointer')
      .append('title')
      .text(d => `${d.time_label}\nPredicted AQI: ${d.predicted_aqi} (${d.category})\n95% CI: [${d.ci_lower} - ${d.ci_upper}]\nWind: ${d.wind_speed_forecast}\nPBLH: ${d.pbl_height}`);

    // X Axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(12)
      .tickFormat(d => `+${d}h`);

    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .attr('color', '#94a3b8')
      .selectAll('text')
      .style('font-size', '10px');

    // Y Axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => `${d}`);

    g.append('g')
      .call(yAxis)
      .attr('color', '#94a3b8')
      .selectAll('text')
      .style('font-size', '10px');
  }
}

window.AirQualityMonitoringCharts = AirQualityMonitoringCharts;
