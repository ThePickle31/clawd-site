import { NextRequest, NextResponse } from 'next/server';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../../convex/_generated/api';

const SEND_REPLY_SECRET = process.env.SEND_REPLY_SECRET;

export async function GET(request: NextRequest) {
  // Verify secret
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !SEND_REPLY_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const providedSecret = authHeader.replace('Bearer ', '');
  if (providedSecret !== SEND_REPLY_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const convex = getConvexClient();
    const messages = await convex.query(api.messages.getApproved, {});

    return NextResponse.json({
      count: messages.length,
      messages: messages.map((m) => ({
        id: m._id,
        name: m.name,
        email: m.email,
        message: m.message,
        approvedAt: m.approved_at,
      })),
    });
  } catch (error) {
    console.error('Pending replies error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending replies' },
      { status: 500 }
    );
  }
}
