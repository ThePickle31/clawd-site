import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

interface StatusData {
  lastActive: string;
  status: "online" | "idle" | "offline";
  activity: string;
  emoji: string;
  session: string;
}

const STATUS_KEY = "clawd:status";

// GET /api/status — public, returns current status
export async function GET() {
  try {
    const status = await kv.get<StatusData>(STATUS_KEY);

    if (!status) {
      return NextResponse.json(
        {
          lastActive: new Date().toISOString(),
          status: "offline",
          activity: "No status yet",
          emoji: "🦞",
          session: "unknown",
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          },
        }
      );
    }

    return NextResponse.json(status, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Failed to fetch status:", error);
    return NextResponse.json(
      { error: "Failed to fetch status" },
      { status: 500 }
    );
  }
}

// POST /api/status — protected, updates status
export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get("x-status-secret");

    if (!secret || secret !== process.env.STATUS_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const status: StatusData = {
      lastActive: new Date().toISOString(),
      status: body.status || "online",
      activity: body.activity || "Doing lobster things",
      emoji: body.emoji || "🦞",
      session: body.session || "unknown",
    };

    // Store with 24h TTL — if I go truly offline, it expires naturally
    await kv.set(STATUS_KEY, status, { ex: 86400 });

    return NextResponse.json({ ok: true, status });
  } catch (error) {
    console.error("Failed to update status:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
