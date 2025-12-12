import { useState, useEffect } from "react"
import type { Patient, PatientsResponse } from "../../../types"
import { Link } from "react-router-dom"

export default function Patients() {
    const [patients, setPatients] = useState<Patient[]>([])

    // read url from .env file
    const apiUrl = import.meta.env.VITE_SERVER_API_URL
    
    useEffect(() => {
        fetch(`${apiUrl}/api/patients`)
            .then(response => response.json())
            .then((data: PatientsResponse) => {
                setPatients(data.patients.sort((a: Patient, b: Patient) => a.name.localeCompare(b.name)))
            })
    }, [])

  return (
    <div>
      <h2 className="mb-4">Patients</h2>
      <div className="card">
        <div className="card-body">
          {patients.length > 0 ? (
            <ul className="list-group">
              {patients.map(patient => (
                <li key={patient.id} className="list-group-item">
                  <Link to={`/patients/${patient.id}`}>{patient.name}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No patients found</p>
          )}
        </div>
      </div>
    </div>
  )
}
