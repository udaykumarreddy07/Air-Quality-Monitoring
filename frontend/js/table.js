/**
 * Air Quality Monitoring - Deep-Dive Intelligence & Verified Records Explorer
 * Search, Sort, Slice Pagination, Two-Way CRUD Sync, and RFC-4180 Export
 */

class AirQualityMonitoringTable {
  constructor(appState, onRecordDeleted = null) {
    this.appState = appState;
    this.onRecordDeleted = onRecordDeleted;
    this.currentPage = 1;
    this.pageSize = 25;
    this.searchQuery = '';
    this.sortBy = 'date';
    this.sortOrder = 'desc';
    this.activeTab = 'verified';

    this.initEventListeners();
  }

  initEventListeners() {
    // Search input with debounce
    const searchInput = document.getElementById('tableSearchInput');
    if (searchInput) {
      let timeout = null;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.searchQuery = e.target.value;
          this.currentPage = 1;
          this.fetchAndRender();
        }, 250);
      });
    }

    // Page size selector
    const pageSizeSelect = document.getElementById('pageSizeSelect');
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener('change', (e) => {
        this.pageSize = parseInt(e.target.value, 10);
        this.currentPage = 1;
        this.fetchAndRender();
      });
    }

    // CSV & JSON Export buttons
    const btnExportCsv = document.getElementById('btnExportCsv');
    if (btnExportCsv) {
      btnExportCsv.addEventListener('click', () => this.exportCsv());
    }

    const btnExportJson = document.getElementById('btnExportJson');
    if (btnExportJson) {
      btnExportJson.addEventListener('click', () => this.exportJson());
    }

    // Tabs navigation
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = btn.getAttribute('data-tab');
        this.switchTab(this.activeTab);
      });
    });

    // Column sorting clicks
    const headers = document.querySelectorAll('.verified-table th[data-sort]');
    headers.forEach(th => {
      th.addEventListener('click', () => {
        const field = th.getAttribute('data-sort');
        if (this.sortBy === field) {
          this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
          this.sortBy = field;
          this.sortOrder = 'desc';
        }
        this.fetchAndRender();
      });
    });
  }

  switchTab(tabKey) {
    const tableContainer = document.getElementById('tabVerifiedRecords');
    const advisoryContainer = document.getElementById('tabHealthAdvisories');
    const gaugeContainer = document.getElementById('tabPollutantGauge');

    if (tableContainer) tableContainer.style.display = tabKey === 'verified' ? 'block' : 'none';
    if (advisoryContainer) advisoryContainer.style.display = tabKey === 'advisory' ? 'block' : 'none';
    if (gaugeContainer) gaugeContainer.style.display = tabKey === 'gauge' ? 'block' : 'none';

    if (tabKey === 'gauge' && window.AirQualityMonitoringApp) {
      window.AirQualityMonitoringApp.updateGaugeView();
    }
  }

  getCategoryBadgeClass(category) {
    switch (category) {
      case 'GOOD': return 'badge-green-outline';
      case 'MODERATE': return 'badge-moderate';
      case 'UNHEALTHY FOR SENSITIVE': return 'badge-danger-outline';
      case 'UNHEALTHY': return 'badge-danger-outline';
      case 'VERY UNHEALTHY': return 'badge-purple';
      case 'HAZARDOUS': return 'badge-crimson';
      default: return 'badge-moderate';
    }
  }

  getAqiColor(aqi) {
    if (aqi <= 50) return '#10b981';
    if (aqi <= 100) return '#eab308';
    if (aqi <= 150) return '#f97316';
    if (aqi <= 200) return '#ef4444';
    if (aqi <= 300) return '#a855f7';
    return '#dc2626';
  }

  async fetchAndRender() {
    const tbody = document.getElementById('verifiedTableBody');
    if (!tbody) return;

    const city = this.appState.focusCity || 'all';
    const timeline = this.appState.timeline || 'full';

    const url = `/api/records?city=${encodeURIComponent(city)}&timeline=${timeline}&search=${encodeURIComponent(this.searchQuery)}&sort_by=${this.sortBy}&sort_order=${this.sortOrder}&page=${this.currentPage}&page_size=${this.pageSize}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      tbody.innerHTML = '';
      if (data.records.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:30px; color:#64748b;">No matching records found.</td></tr>`;
        this.renderPagination(data);
        return;
      }

      data.records.forEach(r => {
        const tr = document.createElement('tr');
        const aqiColor = this.getAqiColor(r.aqi);
        const badgeClass = this.getCategoryBadgeClass(r.category);

        tr.innerHTML = `
          <td class="city-cell" style="cursor: pointer; color: #38bdf8; font-weight: 700;" title="👉 Click to inspect ${r.city} Airshed Details">
            ${r.city} ↗
          </td>
          <td style="color: #94a3b8;">${r.date_display || r.date}</td>
          <td class="aqi-num" style="color: ${aqiColor};">${r.aqi}</td>
          <td>${r.pm25}</td>
          <td>${r.pm10}</td>
          <td>${r.no2}</td>
          <td>${r.so2}</td>
          <td><span class="kpi-badge ${badgeClass}">${r.category}</span></td>
          <td>
            <button class="btn-delete-row" onclick="window.AirQualityMonitoringTableInstance.deleteRecord('${r.id}')">
              Delete
            </button>
          </td>
        `;

        tr.querySelector('.city-cell')?.addEventListener('click', () => {
          if (window.AirQualityMonitoringApp && window.AirQualityMonitoringApp.openAirshedDrawer) {
            window.AirQualityMonitoringApp.openAirshedDrawer(r.city);
          }
        });

        tbody.appendChild(tr);
      });

      this.renderPagination(data);
    } catch (err) {
      console.error('Error fetching records:', err);
    }
  }

  renderPagination(data) {
    const infoEl = document.getElementById('paginationInfo');
    const controlsEl = document.getElementById('paginationControls');
    if (!infoEl || !controlsEl) return;

    const start = (data.page - 1) * data.page_size + 1;
    const end = Math.min(data.page * data.page_size, data.total);
    infoEl.innerText = data.total > 0
      ? `Showing ${start} to ${end} of ${data.total} records`
      : '0 records';

    controlsEl.innerHTML = '';

    // Prev button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn-page';
    prevBtn.innerText = '‹';
    prevBtn.disabled = data.page <= 1;
    prevBtn.onclick = () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.fetchAndRender();
      }
    };
    controlsEl.appendChild(prevBtn);

    // Numbered buttons (show around current)
    const totalP = data.total_pages;
    let pStart = Math.max(1, data.page - 2);
    let pEnd = Math.min(totalP, pStart + 4);
    if (pEnd - pStart < 4) pStart = Math.max(1, pEnd - 4);

    for (let p = pStart; p <= pEnd; p++) {
      const pBtn = document.createElement('button');
      pBtn.className = `btn-page ${p === data.page ? 'active' : ''}`;
      pBtn.innerText = p;
      pBtn.onclick = () => {
        this.currentPage = p;
        this.fetchAndRender();
      };
      controlsEl.appendChild(pBtn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn-page';
    nextBtn.innerText = '›';
    nextBtn.disabled = data.page >= totalP;
    nextBtn.onclick = () => {
      if (this.currentPage < totalP) {
        this.currentPage++;
        this.fetchAndRender();
      }
    };
    controlsEl.appendChild(nextBtn);
  }

  async deleteRecord(recordId) {
    if (!confirm(`Are you sure you want to delete record ${recordId}?`)) return;

    try {
      const res = await fetch(`/api/records/${recordId}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        if (window.AirQualityMonitoringApp) {
          window.AirQualityMonitoringApp.showToast(`Record ${recordId} deleted successfully.`);
          window.AirQualityMonitoringApp.refreshDashboardData();
        } else {
          this.fetchAndRender();
        }
      } else {
        alert(result.error || 'Failed to delete record.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Network error while deleting record.');
    }
  }

  setCityFilter(cityName) {
    this.searchQuery = cityName;
    const searchInput = document.getElementById('tableSearchInput');
    if (searchInput) searchInput.value = cityName;
    this.currentPage = 1;
    this.fetchAndRender();
  }

  exportCsv() {
    window.location.href = '/api/export/csv';
  }

  exportJson() {
    window.location.href = '/api/export/json';
  }
}

window.AirQualityMonitoringTable = AirQualityMonitoringTable;

