import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Patient, Biomarker, PatientResponse, BiomarkersResponse, BiomarkerStatus } from '../../../types'
import { BiomarkerCategory } from '../../../types'

import type { AIInsightsResponse } from '../../../types'

export default function PatientDetails() {
    const { id } = useParams()
    const [patient, setPatient] = useState<Patient | null>(null)
    const [biomarkers, setBiomarkers] = useState<Biomarker[]>([])
    const [aiInsights, setAiInsights] = useState<string>('')
    const [isLoadingInsights, setIsLoadingInsights] = useState(false)
    const [insightsError, setInsightsError] = useState<string>('')

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

    const getAIInsights = async () => {
        if (!id) return

        setIsLoadingInsights(true)
        setInsightsError('')

        try {
            const response = await fetch(`${apiUrl}/api/patients/${id}/ai-insights`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to generate insights')
            }

            const data: AIInsightsResponse = await response.json()
            setAiInsights(data.insights)
        } catch (error: any) {
            console.error('Failed to get AI insights:', error)
            setInsightsError(error.message || 'Failed to generate insights. Please try again.')
        } finally {
            setIsLoadingInsights(false)
        }
    }

    return (
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
                                        onClick={getAIInsights}
                                        disabled={isLoadingInsights}
                                    >
                                        {isLoadingInsights ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Generating Insights...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-magic me-2"></i>
                                                Get AI Insights
                                            </>
                                        )}
                                    </button>

                                    <div className="mt-3">
                                        <h6>AI Insights</h6>
                                        {insightsError && (
                                            <div className="alert alert-danger" role="alert">
                                                <i className="bi bi-exclamation-triangle me-2"></i>
                                                {insightsError}
                                            </div>
                                        )}
                                        {aiInsights ? (
                                            <div className="card">
                                                <div className="card-body text-start">
                                                    <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                                                        {aiInsights}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : !insightsError && (
                                            <p className="text-muted">
                                                <i className="bi bi-info-circle me-2"></i>
                                                Click the button above to generate AI-powered health insights based on the biomarker results
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-muted">Loading patient details...</p>
                    )}
                </div>
            </div>
        </div>
    )
}
