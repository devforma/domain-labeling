import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    const user = JSON.parse(userCookie?.value || '{}');

    if (!user?.id || !user?.subject_code) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // 构建基础查询
    let query = `
      SELECT 
        d.domain,
        d.subject_code,
        d.url,
        r.relevance,
        r.popularity,
        r.professionalism,
        r.remark,
        r.updated_at
      FROM domains d
      LEFT JOIN ratings r ON d.domain = r.domain AND r.user_id = ?
      WHERE d.subject_code = ?
    `;

    // 添加排序
    if (sortBy === 'status') {
      query += ` ORDER BY CASE 
        WHEN r.relevance IS NOT NULL THEN 1 
        ELSE 0 
      END ${sortOrder === 'asc' ? 'ASC' : 'DESC'}, d.domain ASC`;
    } else {
      query += ' ORDER BY d.domain ASC';
    }

    // 添加分页
    const offset = (page - 1) * pageSize;
    query += ` LIMIT ? OFFSET ?`;

    // 执行查询
    const domains = db.prepare(query).all(
      user.id,
      user.subject_code,
      pageSize,
      offset
    );

    // 获取总数
    const [{ count }] = db.prepare(`
      SELECT COUNT(*) as count 
      FROM domains 
      WHERE subject_code = ?
    `).all(user.subject_code) as { count: number }[];

    // 获取已标注总数
    const [{ ratedCount }] = db.prepare(`
      SELECT COUNT(DISTINCT d.domain) as ratedCount
      FROM domains d
      INNER JOIN ratings r ON d.domain = r.domain
      WHERE d.subject_code = ? AND r.user_id = ?
    `).all(user.subject_code, user.id) as { ratedCount: number }[];

    return NextResponse.json({
      domains,
      pagination: {
        total: count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize)
      },
      totalRated: ratedCount
    });
  } catch (error) {
    console.error('Error fetching domains:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 