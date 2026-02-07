import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/admin-auth';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../../../convex/_generated/api';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    return auth.response;
  }

  try {
    const convex = getConvexClient();
    const url = new URL(request.url);
    const filter = url.searchParams.get('filter');

    const messages = filter === 'pending'
      ? await convex.query(api.messages.getPending, {})
      : await convex.query(api.messages.getAll, {});

    return NextResponse.json({
      success: true,
      messages,
      total: messages.length,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
