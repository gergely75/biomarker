import type { Biomarker } from "../types"
import { Line } from "react-chartjs-2"
import { useEffect } from "react"

export default function LineChart({ title, biomarkers }: { title: string, biomarkers: Biomarker[] }) {

    useEffect(() => {
        console.log(title, biomarkers)
    }, [biomarkers, title])
    console.log(title, biomarkers)

    return (
        <>
        <div className="card">
            <div className="card-body">
                <div>
                    <h3>{title} - chart</h3>

                    {biomarkers.length > 0 ? (
                        <div className="chart-container">
                            <Line data={{
                                labels: biomarkers.map(biomarker => biomarker.measuredAt),
                                datasets: [
                                    {
                                        label: title,
                                        data: biomarkers.map(biomarker => biomarker.value),
                                    }
                                ]
                            }} />
                        </div>
                    ) : (
                        <p>No biomarkers found</p>
                    )}
                </div>
            </div>
        </div>
        </>
    )
}