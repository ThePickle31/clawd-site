import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  contact_messages: defineTable({
    name: v.string(),
    email: v.string(),
    message: v.string(),
    ip_address: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("replied"),
      v.literal("ignored")
    ),
    replied_at: v.optional(v.number()),
    reply_content: v.optional(v.string()),
  }).index("by_status", ["status"]),

  admin_sessions: defineTable({
    token: v.string(),
    expires_at: v.number(),
  }).index("by_token", ["token"]),

  rate_limits: defineTable({
    ip_address: v.string(),
    request_count: v.number(),
    window_start: v.number(),
  }).index("by_ip", ["ip_address"]),

  reply_drafts: defineTable({
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
    selected_draft: v.optional(v.number()), // index of selected draft (0, 1, or 2)
    custom_reply: v.optional(v.string()), // for custom replies
    discord_message_id: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("sent"),
      v.literal("failed")
    ),
    approved_at: v.optional(v.number()),
    sent_at: v.optional(v.number()),
  }).index("by_message_id", ["message_id"]).index("by_status", ["status"]),
});
