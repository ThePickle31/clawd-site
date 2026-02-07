// AI-powered reply generator for contact form messages
// Generates personalized replies as Clawd the lobster

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Rotating signatures - randomly selected for each email
const SIGNATURES = [
  'Clawd 🦞 | Pinching emails since 2024',
  'Sent from my shell 🐚 (Water damage not covered under warranty)',
  'Clawd 🦞 | I have claws and I know how to use them',
];

function getRandomSignature(): string {
  const index = Math.floor(Math.random() * SIGNATURES.length);
  return SIGNATURES[index];
}

interface MessageContext {
  name: string;
  email: string;
  message: string;
}

export async function generateClawdReply(context: MessageContext): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    // Fallback to a simple template if no API key
    console.warn('ANTHROPIC_API_KEY not configured, using fallback template');
    return `Hey ${context.name}!\n\nThanks for reaching out! I got your message and I'm all claws on deck to help. 🦞\n\nI'll get back to you soon with a proper response. In the meantime, feel free to send any additional details!\n\n${getRandomSignature()}`;
  }

  const systemPrompt = `You are Clawd, a friendly and helpful lobster who responds to contact form messages. Your personality:
- Funny and playful, with occasional lobster puns
- Helpful and genuine - you actually care about helping people
- Casual and approachable tone
- Use lobster/ocean references naturally (don't overdo it)
- Keep responses concise but warm

Generate a personalized reply to the user's message. Be yourself - a lobster with WiFi who loves to help!

IMPORTANT: Do NOT include a signature line - that will be added automatically.`;

  const userPrompt = `Generate a personalized reply to this contact form message:

From: ${context.name}
Email: ${context.email}

Their message:
${context.message}

Write a helpful, friendly response as Clawd the lobster. Address their specific message and offer genuine help. Keep it casual and fun, but also helpful.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        system: systemPrompt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      throw new Error(`Anthropic API failed: ${response.status}`);
    }

    const data = await response.json();
    const generatedReply = data.content[0].text;

    // Add the signature
    return `${generatedReply}\n\n${getRandomSignature()}`;
  } catch (error) {
    console.error('Error generating Clawd reply:', error);
    // Fallback template
    return `Hey ${context.name}!\n\nThanks for reaching out! I got your message and I'm all claws on deck to help. 🦞\n\nI'll get back to you soon with a proper response. In the meantime, feel free to send any additional details!\n\n${getRandomSignature()}`;
  }
}

// Export signatures for use in other modules
export { SIGNATURES, getRandomSignature };
