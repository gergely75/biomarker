import { useEffect, useState } from "react"
import type { Biomarker, BiomarkersResponse, Patient, PatientResponse } from "../types"
import { useParams } from "react-router-dom"
import LineChart from "../components/LineChart"

export default function BiomarkersChart() {
    const { id, biomarker } = useParams()
    const [biomarkerName, setBiomarkerName] = useState<string | null>(null)
    const [patient, setPatient] = useState<Patient | null>(null)
    const [biomarkers, setBiomarkers] = useState<Biomarker[]>([])

    const apiUrl = import.meta.env.VITE_SERVER_API_URL

    useEffect(() => {
        if (id) {
            fetch(`${apiUrl}/api/patients/${id}`)
                .then(response => response.json())
                .then((data: PatientResponse) => {
                    setPatient(data.patient)
                })
        }

        if (biomarker) {
            setBiomarkerName(biomarker)
            fetch(`${apiUrl}/api/patients/${id}/biomarkers`)
                .then(response => response.json())
                .then((data: BiomarkersResponse) => {
                    // filter biomarkers by name
                    data.biomarkers = data.biomarkers.filter(b => b.name.toLowerCase() === biomarker.toLowerCase())
                    setBiomarkers(data.biomarkers)
                })
        }
    }, [id, biomarker])

    return (
        <div>
            <h2>Biomarkers Chart</h2>
            {patient ? (
                <div>
                    <p>{patient.name} ({patient.dateOfBirth})</p>
                </div>
            ) : (
                <p>Loading patient...</p>
            )}
            {biomarkerName && (
                <div>
                    <h3>{biomarkerName.charAt(0).toUpperCase() + biomarkerName.slice(1)}</h3>
                    
                </div>
            )}
        </div>
    )
}