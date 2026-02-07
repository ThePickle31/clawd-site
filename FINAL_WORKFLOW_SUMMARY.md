# Contact Form Final Workflow Summary

## ✅ Implementation Complete

The contact form now uses a **manual approval and reply workflow** where Clawd personally writes and sends all replies.

## How It Works

### 1️⃣ Contact Form Submission
- User submits form → stored in Convex as `pending`
- Discord notification sent with **✅ Approve** and **❌ Ignore** buttons

### 2️⃣ Approval Process
When you click **✅ Approve**:
1. Message status → `approved` in Convex
2. Original Discord message updated: "✅ Approved - awaiting your reply"
3. **New notification sent** mentioning you with:
   - Sender's name and email
   - Message ID (for API call)
   - Message preview

### 3️⃣ Writing the Reply
- You write the reply manually as Clawd
- No AI generation - authentic, personal responses
- Your personality, your humor, your voice 🦞

### 4️⃣ Sending the Reply

**Using the helper script:**
```bash
cd /home/thepickle/clawd/projects/clawd-site
./scripts/send-reply.sh "message_id_here" "Your reply text"
```

**The script:**
- Loads `SEND_REPLY_SECRET` from `.env.local`
- Sends authenticated POST request to `/api/send-reply`
- Displays success/error response

**What happens:**
1. Email sent via Gmail with your reply
2. Random signature auto-appended (one of three options)
3. Message status → `replied` in Convex
4. Discord confirmation notification sent

## Files Created/Modified

### New Files
- ✅ `src/app/api/send-reply/route.ts` - Manual reply API endpoint
- ✅ `scripts/send-reply.sh` - Helper script for sending replies
- ✅ `MANUAL_REPLY_WORKFLOW.md` - Complete workflow documentation
- ✅ `FINAL_WORKFLOW_SUMMARY.md` - This file

### Modified Files
- ✅ `src/lib/discord.ts` - Added `notifyClawdForReply()` function
- ✅ `src/lib/reply-drafter.ts` - Simplified to just signature rotation
- ✅ `src/app/api/discord-webhook/route.ts` - Updated approval flow
- ✅ `convex/schema.ts` - Added `approved` status
- ✅ `convex/messages.ts` - Added `markApproved()` mutation
- ✅ `.env.example` - Added `SEND_REPLY_SECRET` documentation
- ✅ `.env.local` - Added actual `SEND_REPLY_SECRET` (gitignored)

## Configuration

### Required Environment Variables
```bash
# .env.local
SEND_REPLY_SECRET=40ef584d666a5ce00c658a31fec44cbd221747f533d6f9fdbbdac2f3fff82bdf
DISCORD_WEBHOOK_URL=<webhook-url>
GMAIL_CLIENT_ID=<client-id>
GMAIL_CLIENT_SECRET=<client-secret>
GMAIL_REFRESH_TOKEN=<refresh-token>
GMAIL_USER=mrpickles3311@gmail.com
```

### Optional (for button verification)
```bash
DISCORD_APP_ID=<app-id>
DISCORD_PUBLIC_KEY=<public-key>
```

## Testing

### 1. Check API Endpoint
```bash
curl https://clawd.thepickle.dev/api/send-reply
```

Expected: JSON with endpoint info

### 2. Test Helper Script
```bash
./scripts/send-reply.sh --help
```

### 3. Full Flow Test
1. Submit test message via contact form
2. Click ✅ Approve in Discord
3. Copy message ID from notification
4. Run: `./scripts/send-reply.sh <id> "Test reply"`
5. Check email delivered
6. Verify Discord confirmation

## Security

- ✅ API endpoint requires Bearer token authentication
- ✅ Secret generated with `openssl rand -hex 32`
- ✅ Secret stored in `.env.local` (gitignored)
- ✅ Messages can only be replied to once
- ✅ Status validation prevents duplicate sends

## Signature Rotation

Three rotating signatures (auto-appended):
1. `Clawd 🦞 | Pinching emails since 2024`
2. `Sent from my shell 🐚 (Water damage not covered under warranty)`
3. `Clawd 🦞 | I have claws and I know how to use them`

**Don't include signature in your reply text!**

## Git Commits

```
5585781 docs: improve manual reply workflow docs and add helper script
d156baf docs: add manual reply workflow documentation
8772ee9 chore: finalize workflow changes and cleanup
c277023 feat: add manual reply API endpoint - Clawd writes and sends
aa438bb feat: simplify to approve-and-write workflow
```

## What Was Removed

- ❌ AI reply generation (Anthropic API)
- ❌ Pre-generated draft options
- ❌ 3-button selection workflow
- ❌ Automatic reply sending

## What Remains

- ✅ Simple 2-button approval (Approve/Ignore)
- ✅ Manual reply writing by Clawd
- ✅ API endpoint for sending
- ✅ Discord notifications at each step
- ✅ Gmail integration for email sending
- ✅ Convex status tracking

## Next Steps

1. **Deploy to Production**
   ```bash
   npm run build
   # Deploy to Vercel/hosting
   ```

2. **Test Full Flow**
   - Submit real contact form message
   - Approve and reply
   - Verify email delivery

3. **Set Up Monitoring**
   - Watch Discord for new messages
   - Check `/admin` page for pending messages
   - Monitor Convex dashboard

## Support

- **Workflow docs:** `MANUAL_REPLY_WORKFLOW.md`
- **Script location:** `scripts/send-reply.sh`
- **API endpoint:** `https://clawd.thepickle.dev/api/send-reply`
- **Admin panel:** `https://clawd.thepickle.dev/admin`

---

**Ready to go! 🦞**
