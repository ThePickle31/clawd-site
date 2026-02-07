# Contact Form Workflow Changes

## Summary
Simplified the contact form workflow from a 3-draft selection system to a streamlined approve-and-generate flow.

## New Flow

1. **Contact form submitted** → Discord notification with "✅ Approve" and "❌ Ignore" buttons
2. **When "Approve" clicked** → AI generates personalized reply as Clawd the lobster
3. **Reply sent** via Gmail to contact form email
4. **Discord updated** to show "✅ Reply sent!" with preview

## Changes Made

### `src/lib/discord.ts`
- ✅ Replaced `sendContactWithDrafts()` with `sendContactForApproval()`
- Simple 2-button interface (Approve/Ignore)
- Cleaner embed with just the contact info

### `src/lib/reply-drafter.ts`
- ✅ Completely rewritten to use AI (Anthropic Claude API)
- `generateClawdReply()` creates personalized responses
- Uses Clawd's personality: funny, helpful, casual, lobster-themed
- Rotating signatures still included
- Fallback template if API key not configured

### `src/app/api/discord-webhook/route.ts`
- ✅ Simplified `handleButtonInteraction()`
- On approval: generates AI reply → sends email → updates Discord
- Removed draft selection logic
- Shows "generating..." status during AI generation

### `src/app/api/contact/route.ts`
- ✅ Updated to use `sendContactForApproval()`
- Removed draft generation and storage
- Cleaner, simpler flow

### `.env.local` (not committed)
- ✅ Added `ANTHROPIC_API_KEY` for AI generation
- Added placeholders for `DISCORD_APP_ID` and `DISCORD_PUBLIC_KEY`

## Configuration Needed

⚠️ **Before the webhook buttons work**, you need to add to `.env.local`:

```bash
DISCORD_APP_ID=<your-discord-app-id>
DISCORD_PUBLIC_KEY=<your-discord-public-key>
```

Get these from the [Discord Developer Portal](https://discord.com/developers/applications).

## Testing

✅ Code compiles successfully (TypeScript syntax validated)
✅ All modified files pass syntax checks:
- `src/lib/discord.ts`
- `src/lib/reply-drafter.ts`
- `src/app/api/discord-webhook/route.ts`
- `src/app/api/contact/route.ts`

## Commit

```bash
git commit -m "feat: simplify to approve-and-write workflow"
```

Commit hash: `aa438bb`

## Personality Notes

Clawd's AI-generated replies will:
- Be funny and playful with occasional lobster puns
- Actually help the person (genuine, not just jokes)
- Use casual, approachable tone
- Include natural ocean/lobster references (not overdone)
- End with one of the rotating signatures

## Next Steps

1. Add Discord App ID and Public Key to `.env.local`
2. Set up Discord interaction endpoint in Developer Portal
3. Test the full flow with a real contact form submission
4. Deploy to production
