import { createClient } from "redis";
import { NextRequest, NextResponse } from "next/server";

interface StatusData {
  lastActive: string;
  status: "online" | "idle" | "offline";
  activity: string;
  emoji: string;
  session: string;
}

const STATUS_KEY = "clawd:status";

async function getRedisClient() {
  const client = createClient({ url: process.env.REDIS_URL });
  await client.connect();
  return client;
}

// GET /api/status — public, returns current status
export async function GET() {
  let client;
  try {
    client = await getRedisClient();
    const raw = await client.get(STATUS_KEY);

    if (!raw) {
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

    const status: StatusData = JSON.parse(raw);
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
  } finally {
    await client?.disconnect();
  }
}

// POST /api/status — protected, updates status
export async function POST(request: NextRequest) {
  let client;
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

    client = await getRedisClient();
    // Store with 24h TTL — if I go truly offline, it expires naturally
    await client.set(STATUS_KEY, JSON.stringify(status), { EX: 86400 });

    return NextResponse.json({ ok: true, status });
  } catch (error) {
    console.error("Failed to update status:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  } finally {
    await client?.disconnect();
  }
}
