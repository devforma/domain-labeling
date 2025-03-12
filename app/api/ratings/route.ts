import { NextResponse } from 'next/server';
import { createRating, updateRating, getRatingByDomain, getUser } from '@/lib/db';
import { cookies } from 'next/headers';
import { User } from '@/lib/db/schema';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    const user = JSON.parse(userCookie?.value || '{}');

    if (!user?.username || !user?.password) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 通过用户名和密码获取用户信息
    const dbUser = getUser.get(user.username) as User;
    if (!dbUser || dbUser.password !== user.password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { domainId, relevance, popularity, professionalism, remark } = body;

    if (!domainId || !relevance || !popularity || !professionalism) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existingRating = getRatingByDomain.get(domainId, dbUser.id);

    if (existingRating) {
      // 更新现有评分
      updateRating.run(
        relevance,
        popularity,
        professionalism,
        remark || null,
        domainId,
        dbUser.id
      );
    } else {
      // 创建新评分
      createRating.run(domainId, dbUser.id, relevance, popularity, professionalism, remark || null);
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