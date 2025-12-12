import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { Biomarker, Patient } from '../../types'

import { AIService } from './services/ai-service';
import { MCPService } from './services/mcp-service';

dotenv.config();

const patients: Patient[] = require('../data/seeder_patients.json');
const biomarkers: Biomarker[] = require('../data/seeder_biomarkers.json');

// Initialize services
const aiService = new AIService();
const mcpService = new MCPService(patients, biomarkers);
aiService.setMCPService(mcpService);

const app = express();
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;

// CORS is handled by the reverse proxy (nginx/Apache)
// Removing CORS middleware to avoid duplicate headers

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Chat endpoint with MCP tool integration
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request: messages array required' });
    }

    const response = await aiService.chat(messages);

    res.json({ response });
  } catch (error: any) {
    console.error('Chat Error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat message',
      message: error.message || 'Unknown error occurred'
    });
  }
});

// Start server
app.listen(Number(PORT), String(HOST), () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

