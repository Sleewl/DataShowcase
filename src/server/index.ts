import express from 'express';
import cors from 'cors';
import { query } from './db';

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'https://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/plan-fact-status', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        "Отправочная марка" as name,
        "Профиль" as profile,
        "Общая масса кг" as weight,
        "П_Д Ограничения предшест" as "planned_dates.restrictions1",
        "П_Д Техн и орг решения" as "planned_dates.techRestrictions",
        "П_Д Ресурсные ограничения" as "planned_dates.resourceRestrictions",
        "П_Д Монтаж" as "planned_dates.installation",
        "Ф_Д Ограничения предшест" as "actual_dates.restrictions1",
        "Ф_Д Техн и орг решения" as "actual_dates.techRestrictions",
        "Ф_Д Ресурсные ограничения" as "actual_dates.resourceRestrictions",
        "Ф_Д Монтаж" as "actual_dates.installation"
      FROM plan_fact_status_st951
    `);

    const transformedData = result.map(row => ({
      name: row.name,
      profile: row.profile,
      weight: parseFloat(row.weight),
      planned_dates: {
        restrictions1: row['planned_dates.restrictions1'],
        techRestrictions: row['planned_dates.techRestrictions'],
        resourceRestrictions: row['planned_dates.resourceRestrictions'],
        installation: row['planned_dates.installation']
      },
      actual_dates: {
        restrictions1: row['actual_dates.restrictions1'],
        techRestrictions: row['actual_dates.techRestrictions'],
        resourceRestrictions: row['actual_dates.resourceRestrictions'],
        installation: row['actual_dates.installation']
      }
    }));

    res.json(transformedData);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch plan-fact-status data' });
  }
});

app.get('/api/installation/:number', async (req, res) => {
  try {
    const { number } = req.params;
    const tableName = `installation_${getInstallationName(number)}`;
    const result = await query(`
      SELECT 
        "Секция" as section,
        "Дисциплина1" as discipline1,
        "Дисциплина2" as discipline2,
        "Количество_коллизий" as collision_count,
        "Ду_больше_40_мм" as du_over_40,
        "Ду_меньше_40_мм" as du_under_40
      FROM ${tableName}
    `);

    // Transform the data to match the expected format
    const transformedData = result.map(row => ({
      section: row.section,
      discipline1: row.discipline1,
      discipline2: row.discipline2,
      collisionCount: parseInt(row.collision_count),
      duOver40: parseInt(row.du_over_40),
      duUnder40: parseInt(row.du_under_40)
    }));

    const totalCollisions = transformedData.reduce((sum, item) => sum + item.collisionCount, 0);
    const totalDuOver40 = transformedData.reduce((sum, item) => sum + item.duOver40, 0);
    const totalDuUnder40 = transformedData.reduce((sum, item) => sum + item.duUnder40, 0);

    const installation = {
      id: parseInt(number),
      name: `Установка ${number}`,
      version: "12.2024",
      date: "2024-12",
      data: transformedData,
      totalCollisions,
      totalDuOver40,
      totalDuUnder40
    };

    res.json([installation]);
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
