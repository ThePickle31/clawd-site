#!/bin/bash
# Helper script to send a reply to a contact form message
# Usage: ./scripts/send-reply.sh <message_id> "<reply content>"

set -e

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <message_id> \"<reply content>\""
  echo "Example: $0 abc123 \"Hey! Thanks for reaching out...\""
  exit 1
fi

MESSAGE_ID="$1"
REPLY_CONTENT="$2"

# Load .env.local
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

if [ -z "$SEND_REPLY_SECRET" ]; then
  echo "Error: SEND_REPLY_SECRET not found in .env.local"
  exit 1
fi

# Determine the API endpoint
API_URL="${API_URL:-http://localhost:3000}/api/send-reply"

echo "Sending reply to message: $MESSAGE_ID"
echo "API URL: $API_URL"
echo ""

curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SEND_REPLY_SECRET" \
  -d "{\"messageId\":\"$MESSAGE_ID\",\"replyContent\":\"$REPLY_CONTENT\"}" \
  | jq .

echo ""
echo "Done!"
