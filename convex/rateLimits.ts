import { mutation } from "./_generated/server";
import { v } from "convex/values";

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db.query("rate_limits").collect();
    for (const record of records) {
      await ctx.db.delete(record._id);
    }
    return { cleared: records.length };
  },
});

export const check = mutation({
  args: { ip_address: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_MS;

    const record = await ctx.db
      .query("rate_limits")
      .withIndex("by_ip", (q) => q.eq("ip_address", args.ip_address))
      .first();

    if (!record) {
      await ctx.db.insert("rate_limits", {
        ip_address: args.ip_address,
        request_count: 1,
        window_start: now,
      });
      return {
        allowed: true,
        remaining: RATE_LIMIT_MAX - 1,
        resetAt: now + RATE_LIMIT_WINDOW_MS,
      };
    }

    if (record.window_start < windowStart) {
      // Old window, reset
      await ctx.db.patch(record._id, {
        request_count: 1,
        window_start: now,
      });
      return {
        allowed: true,
        remaining: RATE_LIMIT_MAX - 1,
        resetAt: now + RATE_LIMIT_WINDOW_MS,
      };
    }

    if (record.request_count >= RATE_LIMIT_MAX) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: record.window_start + RATE_LIMIT_WINDOW_MS,
      };
    }

    // Increment count
    await ctx.db.patch(record._id, {
      request_count: record.request_count + 1,
    });
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX - record.request_count - 1,
      resetAt: record.window_start + RATE_LIMIT_WINDOW_MS,
    };
  },
});
