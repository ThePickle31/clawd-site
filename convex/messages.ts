import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.string(),
    ip_address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("contact_messages", {
      name: args.name,
      email: args.email,
      message: args.message,
      ip_address: args.ip_address,
      status: "pending",
    });
    return await ctx.db.get(id);
  },
});

export const getById = query({
  args: { id: v.id("contact_messages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getPending = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("contact_messages")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("contact_messages")
      .order("desc")
      .collect();
  },
});

export const markReplied = mutation({
  args: {
    id: v.id("contact_messages"),
    reply_content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "replied",
      replied_at: Date.now(),
      reply_content: args.reply_content,
    });
  },
});

export const markIgnored = mutation({
  args: { id: v.id("contact_messages") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "ignored",
    });
  },
});
