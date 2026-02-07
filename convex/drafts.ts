import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    message_id: v.id("contact_messages"),
    drafts: v.array(
      v.object({
        type: v.union(
          v.literal("friendly"),
          v.literal("professional"),
          v.literal("playful")
        ),
        content: v.string(),
      })
    ),
    discord_message_id: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if draft already exists for this message
    const existing = await ctx.db
      .query("reply_drafts")
      .withIndex("by_message_id", (q) => q.eq("message_id", args.message_id))
      .first();

    if (existing) {
      // Update existing draft
      await ctx.db.patch(existing._id, {
        drafts: args.drafts,
        discord_message_id: args.discord_message_id,
      });
      return await ctx.db.get(existing._id);
    }

    const id = await ctx.db.insert("reply_drafts", {
      message_id: args.message_id,
      drafts: args.drafts,
      discord_message_id: args.discord_message_id,
      status: "pending",
    });
    return await ctx.db.get(id);
  },
});

export const getByMessageId = query({
  args: { message_id: v.id("contact_messages") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reply_drafts")
      .withIndex("by_message_id", (q) => q.eq("message_id", args.message_id))
      .first();
  },
});

export const getById = query({
  args: { id: v.id("reply_drafts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getPending = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("reply_drafts")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();
  },
});

export const approve = mutation({
  args: {
    id: v.id("reply_drafts"),
    selected_draft: v.optional(v.number()), // 0, 1, or 2 for the three options
    custom_reply: v.optional(v.string()), // if using a custom reply
  },
  handler: async (ctx, args) => {
    const draft = await ctx.db.get(args.id);
    if (!draft) {
      throw new Error("Draft not found");
    }

    if (draft.status !== "pending") {
      throw new Error("Draft has already been processed");
    }

    await ctx.db.patch(args.id, {
      status: "approved",
      selected_draft: args.selected_draft,
      custom_reply: args.custom_reply,
      approved_at: Date.now(),
    });

    return await ctx.db.get(args.id);
  },
});

export const markSent = mutation({
  args: { id: v.id("reply_drafts") },
  handler: async (ctx, args) => {
    const draft = await ctx.db.get(args.id);
    if (!draft) {
      throw new Error("Draft not found");
    }

    await ctx.db.patch(args.id, {
      status: "sent",
      sent_at: Date.now(),
    });
  },
});

export const markFailed = mutation({
  args: { id: v.id("reply_drafts") },
  handler: async (ctx, args) => {
    const draft = await ctx.db.get(args.id);
    if (!draft) {
      throw new Error("Draft not found");
    }

    await ctx.db.patch(args.id, {
      status: "failed",
    });
  },
});

export const updateDiscordMessageId = mutation({
  args: {
    id: v.id("reply_drafts"),
    discord_message_id: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      discord_message_id: args.discord_message_id,
    });
  },
});

// Get draft by Discord message ID (for webhook processing)
export const getByDiscordMessageId = query({
  args: { discord_message_id: v.string() },
  handler: async (ctx, args) => {
    // Need to scan all drafts since we can't index by optional field efficiently
    const allDrafts = await ctx.db.query("reply_drafts").collect();
    return allDrafts.find((d) => d.discord_message_id === args.discord_message_id) || null;
  },
});
