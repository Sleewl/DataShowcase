import { Handler } from '@netlify/functions';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const result = await pool.query(`
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

    const transformedData = result.rows.map(row => ({
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

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transformedData)
    };
  } catch (error) {
    console.error('Database error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Failed to fetch plan-fact-status data' })
    };
  }
};