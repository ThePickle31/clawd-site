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
});
