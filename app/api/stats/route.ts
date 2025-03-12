import { NextResponse } from 'next/server';
import db from '@/lib/db';

const TOKEN = 'BX56LPWLMWfUpUsq';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // Verify token
    if (token !== TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get statistics for all subjects
    const stats = db.prepare(`
      WITH subject_stats AS (
        SELECT 
          d.subject_code,
          COUNT(DISTINCT d.domain) as total_domains,
          COUNT(DISTINCT CASE WHEN r.id IS NOT NULL THEN d.id END) as rated_domains
        FROM domains d
        LEFT JOIN ratings r ON d.id = r.domain_id
        GROUP BY d.subject_code
      )
      SELECT 
        subject_code,
        total_domains,
        rated_domains,
        ROUND(CAST(rated_domains AS FLOAT) / total_domains * 100, 2) as completion_percentage
      FROM subject_stats
      ORDER BY subject_code
    `).all();

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 