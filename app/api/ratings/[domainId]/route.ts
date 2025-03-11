import { NextResponse } from 'next/server';
import { getRatingByDomain, getUser } from '@/lib/db';
import { cookies } from 'next/headers';
import { User } from '@/lib/db/schema';

interface Rating {
  relevance: number;
  popularity: number;
  professionalism: number;
  remark: string | null;
}

export async function GET(
  request: Request,
  { params }:any
) {
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

    const { domainId } = params;

    if (!domainId) {
      return NextResponse.json(
        { error: 'Missing domain ID' },
        { status: 400 }
      );
    }

    const rating = getRatingByDomain.get(domainId, dbUser.id) as Rating;

    if (!rating) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      relevance: rating.relevance,
      popularity: rating.popularity,
      professionalism: rating.professionalism,
      remark: rating.remark,
    });
  } catch (error) {
    console.error('Rating fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 