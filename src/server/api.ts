import express from 'express';
import cors from 'cors';
import { query } from './db';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Get plan-fact-status data
app.get('/api/plan-fact-status', async (req, res) => {
  try {
    const data = await query('SELECT * FROM plan_fact_status_st951');
    res.json(data);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch plan-fact-status data' });
  }
});

// Get installation data by number
app.get('/api/installation/:number', async (req, res) => {
  try {
    const { number } = req.params;
    const tableName = `installation_${getInstallationName(number)}`;
    const data = await query(`SELECT * FROM ${tableName}`);
    res.json(data);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch installation data' });
  }
});

function getInstallationName(number: string): string {
  const names = {
    '1': 'one',
    '2': 'two',
    '3': 'three',
    '4': 'four',
    '5': 'five'
  };
  return names[number as keyof typeof names] || 'one';
}

const PORT = process.env.PORT || 5000;

export const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});