# Manual Reply Workflow

This document explains the new manual reply workflow for the contact form.

## Flow Overview

1. **Contact form submitted** → Discord notification with "✅ Approve" and "❌ Ignore" buttons
2. **User clicks "Approve"** → Webhook updates Convex and sends a new Discord message like:
   ```
   📬 Pickle approved reply for user@email.com:
   "Hi Clawd, what did you work on today?"
   
   @Clawd please write and send reply
   
   Message ID: `abc123`
   ```
3. **Clawd sees the message and writes the reply manually**
4. **Clawd calls the API endpoint** to send the email with the reply text
5. **Discord updates** to show "✅ Clawd sent reply"

## Technical Implementation

### Files Changed

- `convex/schema.ts` - Added "approved" status and new fields
- `convex/messages.ts` - Added `markApproved()` mutation
- `src/lib/discord.ts` - Added `notifyClawdForReply()` function
- `src/app/api/discord-webhook/route.ts` - Updated `processApproval()` to use new flow
- `src/app/api/send-reply/route.ts` - NEW endpoint for manual reply sending
- `src/lib/reply-drafter.ts` - Simplified (removed AI generation code)

### Environment Variables

Add to `.env.local`:
```bash
SEND_REPLY_SECRET=<your-secret-here>
```

This secret is used to authenticate requests to the `/api/send-reply` endpoint.

## How to Use

### For Clawd (Manual Reply Process)

When you see a Discord notification asking you to reply:

1. Read the message details in Discord
2. Write your reply
3. Call the API endpoint to send it:

```bash
curl -X POST https://clawd.thepickle.dev/api/send-reply \
  -H "Authorization: Bearer $SEND_REPLY_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "messageId": "abc123",
    "replyText": "Hey! Thanks for reaching out! Here is my response..."
  }'
```

Or using the Convex client:
```typescript
// Get the message
const message = await convex.query(api.messages.getById, { id: messageId });

// Send reply
await fetch('/api/send-reply', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.SEND_REPLY_SECRET}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messageId,
    replyText: "Your reply here...",
  }),
});
```

### API Endpoint Details

**Endpoint:** `POST /api/send-reply`

**Headers:**
- `Authorization: Bearer <SEND_REPLY_SECRET>`
- `Content-Type: application/json`

**Body:**
```json
{
  "messageId": "string (Convex ID)",
  "replyText": "string (your reply content)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reply sent successfully"
}
```

**Errors:**
- `401 Unauthorized` - Invalid or missing API secret
- `400 Bad Request` - Missing messageId or replyText, or message not approved
- `404 Not Found` - Message not found
- `500 Internal Server Error` - Failed to send email

## Flow States

A contact message goes through these states:

1. **pending** - Just submitted, waiting for approve/ignore
2. **approved** - Pickle approved it, Clawd needs to write reply
3. **replied** - Clawd sent the reply
4. **ignored** - Pickle marked it as ignore

## Security Notes

- The `/api/send-reply` endpoint requires the `SEND_REPLY_SECRET` for authentication
- Messages must be in "approved" status before a reply can be sent
- Discord message IDs are stored to allow updating the notification after sending
- All email sending goes through the existing Gmail OAuth2 flow

## Future Improvements

- Add a simple web UI for Clawd to write and send replies
- Store reply drafts before sending
- Add ability to preview email before sending
- Add reply templates for common questions
