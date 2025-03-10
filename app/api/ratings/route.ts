import { NextResponse } from 'next/server';
import { createRating, updateRating, getRatingByDomain } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { domain_id, user_id, relevance, popularity, professionalism, remark } = body;

    if (!domain_id || !user_id || !relevance || !popularity || !professionalism) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existingRating = getRatingByDomain.get(domain_id, user_id);

    if (existingRating) {
      // 更新现有评分
      updateRating.run(
        relevance,
        popularity,
        professionalism,
        remark || null,
        domain_id,
        user_id
      );
    } else {
      // 创建新评分
      createRating.run(domain_id, user_id, relevance, popularity, professionalism, remark || null);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Rating error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 