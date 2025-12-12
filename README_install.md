# Biomarker

## How to Install & Run the Server

1. **Install dependencies**

   From the `/server` directory, run:
   ```
   npm install
   ```

2. **Run the server in development**

   ```
   npm run dev
   ```

3. **Run the server in production**

   First, build the project:
   ```
   npm run build
   ```

   Then, start the server:
   ```
   npm start
   ```

The server will start on `http://localhost:3000` by default.

**API Endpoints:**
- `/api/patients` — List all patients.
- `/api/patients/:id` — Get a specific patient by ID.
- `/api/patients/:id/biomarkers` — Get all biomarkers for a patient (optionally filter by `category`).

**Sample data is present in:**  
- `server/data/seeder_patients.json`  
- `server/data/seeder_biomarkers.json`

## How to Install & Run the Web App

1. **Install dependencies**

   From the `/web` directory, run:
   ```
   npm install
   ```

2. **Run the web app in development**

   ```
   npm run dev
   ```
   The frontend will start on `http://localhost:5173` by default.

3. **Production build**

   To build the app for production:
   ```
   npm run build
   ```

   To preview the production build locally:
   ```
   npm run preview
   ```

**Usage:**
- Visit `http://localhost:5173` in your browser.
- Select "Patients" from the navigation to browse or search for patients.
- Click a patient to view details and see their biomarkers.
- Click the chart icon next to a biomarker to view its chart.

**Requirements:**
- Ensure `VITE_SERVER_API_URL` is set in `/web/.env` and points to your running server (e.g., `http://localhost:3000`).


