import { NextResponse } from 'next/server';
import { getRatingByDomain } from '@/lib/db';

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
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const { domainId } = await params;

    if (!userId || !domainId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const rating = getRatingByDomain.get(domainId, parseInt(userId)) as Rating;

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