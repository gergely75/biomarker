import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const BiomarkerCategories = ['metabolic', 'cardiovascular', 'hormonal'];

interface Patient {
  id: number;
  name: string;
  dateOfBirth: Date;
  lastVisit: string;
}

interface Biomarker {
  id: number;
  patientId: number;
  name: string;
  value: number;
  unit: string;
  category: typeof BiomarkerCategories[number];
  referenceRange: {
    min: number;
    max: number;
  }, 
  measuredAt: Date;
  status: 'normal' | 'high' | 'low';
}


const patients: Patient[] = require('../data/seeder_patients.json');

const biomarkers: Biomarker[] = require('../data/seeder_biomarkers.json');


app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Biomarkers API Server' });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all patients
app.get('/api/patients', (req: Request, res: Response) => {
  res.json({ patients });
});

// Get a specific patient
app.get('/api/patients/:id', (req: Request, res: Response) => {
  const patient = patients.find(p => p.id === parseInt(req.params.id));
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  res.json({ patient });
});

// Get all biomarkers for a patient
app.get('/api/patients/:id/biomarkers', (req: Request, res: Response) => {
  let patientBiomarkers = biomarkers.filter(b => b.patientId === parseInt(req.params.id));

  if (req.query.category) {
    const category = req.query.category as string;
    patientBiomarkers = patientBiomarkers.filter(b => b.category === category);
  }
  
  res.json({ biomarkers: patientBiomarkers });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

