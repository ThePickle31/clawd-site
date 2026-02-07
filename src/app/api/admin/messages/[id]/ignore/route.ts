import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/admin-auth';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../../../../../convex/_generated/api';
import { Id } from '../../../../../../../convex/_generated/dataModel';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    return auth.response;
  }

  try {
    const convex = getConvexClient();
    const { id } = await params;

    const message = await convex.query(api.messages.getById, {
      id: id as Id<"contact_messages">,
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    if (message.status !== 'pending') {
      return NextResponse.json(
        { error: `Message already ${message.status}` },
        { status: 400 }
      );
    }

    // Mark as ignored in database
    await convex.mutation(api.messages.markIgnored, {
      id: id as Id<"contact_messages">,
    });

    return NextResponse.json({
      success: true,
      message: 'Message ignored',
    });
  } catch (error) {
    console.error('Ignore error:', error);
    return NextResponse.json(
      { error: 'Failed to ignore message' },
      { status: 500 }
    );
  }
}
