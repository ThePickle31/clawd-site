import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    token: v.string(),
    expires_at: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("admin_sessions", {
      token: args.token,
      expires_at: args.expires_at,
    });
  },
});

export const validate = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("admin_sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session) return false;
    return session.expires_at > Date.now();
  },
});

export const remove = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("admin_sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

export const cleanExpired = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("admin_sessions")
      .collect();
    for (const session of expired) {
      if (session.expires_at <= now) {
        await ctx.db.delete(session._id);
      }
    }
  },
});
