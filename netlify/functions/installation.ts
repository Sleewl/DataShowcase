import { Handler } from '@netlify/functions';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
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
    const number = event.path.split('/').pop() || '1';
    const tableName = `installation_${getInstallationName(number)}`;
    
    const result = await pool.query(`
      SELECT 
        "Секция" as section,
        "Дисциплина1" as discipline1,
        "Дисциплина2" as discipline2,
        "Количество_коллизий" as collision_count,
        "Ду_больше_40_мм" as du_over_40,
        "Ду_меньше_40_мм" as du_under_40
      FROM ${tableName}
    `);

    const transformedData = result.rows.map(row => ({
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

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([installation])
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
      body: JSON.stringify({ error: 'Failed to fetch installation data' })
    };
  }
};