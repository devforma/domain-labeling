import { NextResponse } from 'next/server';
import { getDomainsWithRatingsPaginated } from '@/lib/db';
import { cookies } from 'next/headers';

interface DomainWithRating {
  domain: string;
  subject_code: string;
  url: string;
  relevance: number | null;
  popularity: number | null;
  professionalism: number | null;
  total_count: number;
}

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

    // 获取分页参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const offset = (page - 1) * pageSize;

    // 使用分页查询
    const domains = await getDomainsWithRatingsPaginated.all(
      user.subject_code, // 用于计算总数
      user.id,          // 用于关联评分
      user.subject_code, // 用于筛选数据
      pageSize,         // LIMIT
      offset           // OFFSET
    ) as DomainWithRating[];

    // 从结果中获取总数
    const totalCount = domains[0]?.total_count || 0;

    return NextResponse.json({
      domains: domains.map(d => ({
        domain: d.domain,
        subject_code: d.subject_code,
        url: d.url,
        relevance: d.relevance,
        popularity: d.popularity,
        professionalism: d.professionalism
      })),
      pagination: {
        total: totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    });
  } catch (error) {
    console.error('Error fetching domains:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 