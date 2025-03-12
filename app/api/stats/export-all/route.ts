import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {

    // Get all domain data with ratings
    const data = db.prepare(`
      SELECT 
        d.domain,
        d.subject_code,
        d.url,
        CASE WHEN r.id IS NOT NULL THEN 1 ELSE 0 END as is_rated,
        u.username as rater,
        r.relevance,
        r.popularity,
        r.professionalism,
        r.remark,
        r.created_at as rating_date
      FROM domains d
      LEFT JOIN ratings r ON d.id = r.domain_id
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY d.subject_code, d.id
    `).all();

    // Convert to CSV
    const headers = ['学科代码', '域名', 'URL', '是否已标注', '标注人员', '相关性', '科普性', '专业性', '备注', '标注时间'];
    const rows = data.map((row: any) => [
      row.subject_code,
      row.domain,
      row.url,
      row.is_rated ? '是' : '否',
      row.rater || '',
      row.relevance || '',
      row.popularity || '',
      row.professionalism || '',
      row.remark || '',
      row.rating_date || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        // Escape special characters and wrap in quotes if needed
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(','))
    ].join('\n');

    // Add BOM for Excel UTF-8 compatibility
    const csvWithBOM = '\ufeff' + csvContent;

    return new NextResponse(csvWithBOM, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename=all_domains.csv'
      }
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 