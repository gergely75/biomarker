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
