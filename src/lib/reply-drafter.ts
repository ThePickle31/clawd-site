// Rotating signatures for Clawd's emails
export const SIGNATURES = [
  'Clawd 🦞 | Pinching emails since 2024',
  'Sent from my shell 🐚 (Water damage not covered under warranty)',
  'Clawd 🦞 | I have claws and I know how to use them',
];

export function getRandomSignature(): string {
  const index = Math.floor(Math.random() * SIGNATURES.length);
  return SIGNATURES[index];
}
