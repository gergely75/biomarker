import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Patient, Biomarker, PatientResponse, BiomarkersResponse, BiomarkerStatus } from '../../../types'
import { BiomarkerCategory } from '../../../types'
import ChatWidget from '../components/ChatWidget'

export default function PatientDetails() {
    const { id } = useParams()
    const [patient, setPatient] = useState<Patient | null>(null)
    const [biomarkers, setBiomarkers] = useState<Biomarker[]>([])
    const [showChatWidget, setShowChatWidget] = useState(false)

    // read url from .env file
    const apiUrl = import.meta.env.VITE_SERVER_API_URL

    useEffect(() => {
        if (id) {
            fetch(`${apiUrl}/api/patients/${id}`)
                .then(response => response.json())
                .then((data: PatientResponse) => {
                    setPatient(data.patient)
                    fetch(`${apiUrl}/api/patients/${id}/biomarkers`)
                        .then(response => response.json())
                        .then((data: BiomarkersResponse) => setBiomarkers(data.biomarkers))
                })
        }
    }, [id])


    const statusColor = (status: BiomarkerStatus) => {
        switch (status) {
            case 'normal':
                return 'text-success'
            case 'high':
                return 'text-danger'
            case 'low':
                return 'text-warning'
            default:
                return 'text-muted'
        }
    }

    const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const category = event.target.value
        fetch(`${apiUrl}/api/patients/${id}/biomarkers?category=${category}`)
            .then(response => response.json())
            .then((data: BiomarkersResponse) => {
                // soert by measuredAt date descending
                data.biomarkers.sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime())
                setBiomarkers(data.biomarkers)
            })
    }

    return (
        <>
            <div>
                <h2 className="mb-4">Patient Details</h2>
                <div className="card">
                    <div className="card-body">
                    {patient ? (
                        <>
                            <h5 className="card-title">{patient.name}</h5>
                            <p className="text-muted">
                                Date of Birth: <strong>{patient.dateOfBirth}</strong>
                            </p>
                            <p className="text-muted">
                                Last Visit: <strong>{patient.lastVisit}</strong>
                            </p>

                            {biomarkers.length > 0 && (
                                <div className="mt-4">
                                    <h6>Biomarkers</h6>

                                    <div className="mb-3">
                                        <select className="form-select" onChange={handleCategoryChange}>
                                            <option value="">All Categories</option>
                                            {BiomarkerCategory.map(category => (
                                                <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Value</th>
                                                <th>Unit</th>
                                                <th>Reference Range</th>
                                                <th>Status</th>
                                                <th>Chart</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {biomarkers.map(biomarker => (
                                                <tr key={biomarker.id}>
                                                    <td>{biomarker.name}</td>
                                                    <td>{biomarker.value}</td>
                                                    <td>{biomarker.unit}</td>
                                                    <td>{biomarker.referenceRange.min} - {biomarker.referenceRange.max}</td>
                                                    <td className={'fw-bold ' + statusColor(biomarker.status)}>{biomarker.status}</td>
                                                    <td><Link to={`/biomarkers-chart/${id}/${biomarker.name.toLowerCase()}`} className="text-primary"><i className="bi bi-graph-up"></i></Link></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setShowChatWidget(true)}
                                    >
                                                <i className="bi bi-magic me-2"></i>
                                                Get AI Insights
                                    </button>

                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-muted">Loading patient details...</p>
                    )}
                    </div>
                </div>
            </div>

            {/* Floating Chat Widget - Only on Patient Details */}
            <ChatWidget 
                isOpen={showChatWidget} 
                onToggle={() => setShowChatWidget(!showChatWidget)}
                hideFloatingButton={true}
            />
        </>
    )
}
