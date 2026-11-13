# Air Quality Monitoring - Database Store & Datasets

This directory houses the persistent environmental telemetry, continuous ambient monitoring station metadata, and benchmark datasets powering the **Air Quality Monitoring** dashboard.

## 📂 Data Store Files

| File | Format | Records | Description |
|------|--------|---------|-------------|
| `db_store.json` | JSON | 2,304 | Primary active JSON datastore with daily ambient telemetry tuples for all 64 CAAQMS stations across 5 national geographical zones. |
| `stations.json` | JSON | 64 | Registry of continuous ambient air quality monitoring stations (CAAQMS) with geocoded coordinates (Latitude/Longitude), elevation, state, and city mapping. |
| `air_quality_india_realtime.xlsx` | Multi-sheet XLSX | 4 Sheets | Complete statutory workbook containing all 2,304 observation tuples, station metadata, CPCB NAQI breakpoint tables, and official references. |
| `kaggle_city_day.csv` | CSV | Historical | Curated historical city-day ambient air quality benchmark dataset. |

## 🧬 Data Schema (`db_store.json`)

Each entry in `db_store.json` adheres to the following interface:

```json
{
  "id": "STN_TN_001_20261015",
  "station_id": "STN_TN_001",
  "station_name": "Alandur Bus Depot, Chennai - CPCB",
  "city": "Chennai",
  "state": "Tamil Nadu",
  "zone": "South",
  "lat": 13.0012,
  "lon": 80.2015,
  "elevation_m": 12,
  "date": "2026-10-15",
  "aqi": 68,
  "category": "MODERATE",
  "pm25": 34.2,
  "pm10": 58.4,
  "no2": 21.0,
  "so2": 11.2,
  "co": 0.8,
  "o3": 18.5,
  "nh3": 7.4,
  "temperature_c": 29.5,
  "humidity_pct": 74,
  "wind_speed_kmh": 14.2,
  "wind_dir_deg": 110,
  "pblh_m": 850,
  "ventilation_coeff": 3350,
  "health_advisory": "Air quality is acceptable; sensitive individuals may experience minor breathing irritation.",
  "data_source": "CPCB India CAAQMS Portal"
}
```
