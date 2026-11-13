# Air Quality Monitoring - Backend REST API Service

High-performance **Node.js Express** backend providing statutory CPCB environmental data transformations, authentication, filtering, multi-city comparators, and automated Excel generation.

## 📁 Directory Structure

```text
backend/
├── server.js          # Core Express application and REST API endpoints
├── package.json       # Service-specific dependencies and scripts
└── README.md          # Backend documentation and API reference
```

## 🌐 Key REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Serves the login authentication gateway |
| `GET` | `/dashboard` | Serves the main visual dashboard |
| `POST` | `/api/auth/login` | Authenticates users with PBKDF2 salt hashing |
| `GET` | `/api/kpis` | Aggregated executive KPIs (AQI, PM2.5, PM10, Hotspot, Shift) |
| `GET` | `/api/stations` | Registry of all 64 CAAQMS continuous monitoring stations |
| `GET` | `/api/trends` | Time-series telemetry filtered by city and timeline window |
| `GET` | `/api/records` | Paginated, searchable, and sortable observation explorer |
| `GET` | `/api/compare` | Head-to-head dual-city airshed comparator |
| `GET` | `/api/forecast` | 24-hour autoregressive predictive AQI forecast |
| `GET` | `/api/export/excel` | Multi-sheet Microsoft Excel dataset download (`.xlsx`) |
| `GET` | `/api/sources` | Official data citations and CPCB/WHO government portal links |
