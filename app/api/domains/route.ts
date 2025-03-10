import { NextResponse } from 'next/server';
import { getDomainsWithRatings } from '@/lib/db';
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

    const domains = await getDomainsWithRatings.all(user.id, user.subject_code);
    return NextResponse.json(domains);
  } catch (error) {
    console.error('Error fetching domains:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 