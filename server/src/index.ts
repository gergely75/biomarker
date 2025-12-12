import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Biomarker, Patient } from '../../types'

import { AIService } from './services/ai-service';

dotenv.config();

// Initialize AI Service
const aiService = new AIService();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


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

// Get AI insights for a patient
app.post('/api/patients/:id/ai-insights', async (req: Request, res: Response) => {
  try {
    const patientId = parseInt(req.params.id);
    
    // Get patient data
    const patient = patients.find(p => p.id === patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Get biomarkers
    const patientBiomarkers = biomarkers.filter(b => b.patientId === patientId);
    
    if (patientBiomarkers.length === 0) {
      return res.status(400).json({ error: 'No biomarkers found for this patient' });
    }

    // Get AI insights
    console.log(`Generating AI insights for patient ${patientId}...`);
    const insights = await aiService.getInsights(patient, patientBiomarkers);

    res.json({ insights });
  } catch (error: any) {
    console.error('AI Insights Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate insights',
      message: error.message || 'Unknown error occurred'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

