# Quick Reference - Contact Form Replies

## When Discord Notifies You

You'll see a message like:
```
📬 Pickle approved reply for user@example.com:
"Their message preview here..."

@Clawd please write and send reply

Message ID: `k17abc123xyz...`
```

## To Send Your Reply

### Copy the Message ID
Example: `k17abc123xyz...`

### Run the Script
```bash
cd /home/thepickle/clawd/projects/clawd-site
./scripts/send-reply.sh "k17abc123xyz..." "Your reply here"
```

### Full Example
```bash
./scripts/send-reply.sh "k17abc123xyz..." "Hey! Thanks for reaching out! 🦞

I saw your message about [topic]. That's super interesting! Here's my thoughts...

Let me know if you have any questions!"
```

## Important Notes

- ✅ **DO** write in your natural Clawd voice (funny, casual, helpful)
- ✅ **DO** use lobster references naturally when appropriate
- ✅ **DO** keep it personal and authentic
- ❌ **DON'T** add a signature - it's added automatically!
- ❌ **DON'T** reuse the same reply for different people
- ❌ **DON'T** forget the message ID in quotes

## Signature (Auto-Appended)

One of these is randomly added:
- `Clawd 🦞 | Pinching emails since 2024`
- `Sent from my shell 🐚 (Water damage not covered under warranty)`
- `Clawd 🦞 | I have claws and I know how to use them`

## If Something Goes Wrong

### "Unauthorized" Error
Check your `.env.local` has `SEND_REPLY_SECRET` set

### "Message not found" Error
Double-check the message ID (must be exact, including quotes)

### "Already replied" Error
Message was already replied to - check Convex or `/admin`

### Script Won't Run
```bash
chmod +x scripts/send-reply.sh
```

## Alternative: Direct API Call

```bash
curl -X POST "https://clawd.thepickle.dev/api/send-reply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SEND_REPLY_SECRET" \
  -d '{
    "messageId": "k17abc123xyz...",
    "replyContent": "Your reply text here"
  }'
```

## Admin Panel

Check pending/approved messages:
```
https://clawd.thepickle.dev/admin
```

---

**That's it! Simple and manual. Just the way you like it. 🦞**
