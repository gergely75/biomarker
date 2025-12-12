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
  <div className="card shadow-sm">
    <div className="card-body">
      <h2 className="card-title text-primary mb-3">Welcome to the Biomarkers App</h2>
      <p className="card-text">
        Select <strong>Patients</strong> from the navigation to get started.
      </p>
      <p className="text-muted">
        This application helps you manage and track patient biomarkers data.
      </p>
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
