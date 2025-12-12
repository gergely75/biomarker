import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './index.css'
import App from './App.tsx'

import Patients from './pages/Patients.tsx'
import PatientDetails from './pages/PatientDetails.tsx'

// router
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import BiomarkersChart from './pages/BiomarkersChart.tsx'

const Home = () => (
  <div className="row g-3">
    <div className="col-12">
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-primary mb-3">Welcome to the Biomarkers App</h2>
          <p className="card-text">
            This application helps you manage and track patient biomarkers data with AI-powered insights.
          </p>
        </div>
      </div>
    </div>
    
    <div className="col-md-6">
      <div className="card shadow-sm h-100">
        <div className="card-body">
          <h5 className="card-title">
            <i className="bi bi-people text-primary me-2"></i>
            Patient Management
          </h5>
          <p className="card-text">
            View and manage patient records, track biomarker data, and monitor health trends.
          </p>
          <a href="/patients" className="btn btn-primary btn-sm">
            View Patients
          </a>
        </div>
      </div>
    </div>
  </div>
)

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'patients',
        element: <Patients />,
      },
      {
        path: 'patients/:id',
        element: <PatientDetails />,
      },
      {
        path: 'biomarkers-chart/:id/:biomarker',
        element: <BiomarkersChart />,
      },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
