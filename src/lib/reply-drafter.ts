// Auto-draft reply generator for contact form messages
// Generates 3 draft options: friendly, professional, playful (lobster persona)

export interface DraftReply {
  type: 'friendly' | 'professional' | 'playful';
  content: string;
}

interface MessageContext {
  name: string;
  message: string;
}

// Keywords for detecting message intent
const INTENT_PATTERNS = {
  question: /\?|how|what|when|where|why|can you|could you|do you|is there|are there/i,
  collaboration: /work together|collaborate|partner|hire|freelance|project|opportunity|job/i,
  feedback: /love|great|awesome|amazing|cool|nice|thank|appreciate/i,
  bug: /bug|issue|problem|broken|error|fix|doesn't work|not working/i,
  greeting: /^(hi|hello|hey|greetings|yo)\b/i,
};

function detectIntent(message: string): string {
  if (INTENT_PATTERNS.collaboration.test(message)) return 'collaboration';
  if (INTENT_PATTERNS.bug.test(message)) return 'bug';
  if (INTENT_PATTERNS.feedback.test(message)) return 'feedback';
  if (INTENT_PATTERNS.question.test(message)) return 'question';
  if (INTENT_PATTERNS.greeting.test(message)) return 'greeting';
  return 'general';
}

// Response templates by intent and style
const RESPONSE_TEMPLATES: Record<string, Record<'friendly' | 'professional' | 'playful', string[]>> = {
  collaboration: {
    friendly: [
      "Thanks so much for reaching out! I'm always excited to chat about potential projects. I'd love to hear more about what you have in mind - feel free to share more details and we can explore if there's a good fit!",
      "Hey, this sounds interesting! I appreciate you thinking of me for this. Let me know more about what you're envisioning and we can figure out if there's a way to work together.",
    ],
    professional: [
      "Thank you for your interest in collaborating. I appreciate you taking the time to reach out. I'd be happy to discuss potential opportunities further. Could you provide additional details about the scope and timeline of your project?",
      "I appreciate your inquiry regarding collaboration. To better assess how I might assist, could you share more specifics about the project requirements and your expectations?",
    ],
    playful: [
      "Ooh, a collaboration inquiry! *excited claw clicking* I'm intrigued! Tell me more about this project of yours - my claws are ready to get to work! Just promise there's no boiling water involved. 🦞",
      "Well well well, someone wants to team up with a lobster! I like your style. Spill the details and let's see if we can cook up something amazing together (pun very much intended). 🦞",
    ],
  },
  feedback: {
    friendly: [
      "Wow, thank you so much for the kind words! It really means a lot to hear that. I'm glad you're enjoying what I do - messages like yours make it all worthwhile!",
      "Thank you! This made my day. I'm so happy you're finding value in my work. If there's ever anything else I can help with, don't hesitate to reach out!",
    ],
    professional: [
      "Thank you for taking the time to share your positive feedback. I'm pleased to hear that my work has been valuable to you. Your support is greatly appreciated.",
      "I appreciate your kind words. It's rewarding to know that my efforts have had a positive impact. Thank you for reaching out.",
    ],
    playful: [
      "Aww, shucks! *happy lobster dance* You're making me blush over here (if lobsters could blush, that is). Thanks for the love - you just made a crustacean's day! 🦞💕",
      "You're too kind! *waves claws appreciatively* Comments like yours are better than finding the perfect rock to hide under. Thanks for taking the time to reach out! 🦞",
    ],
  },
  question: {
    friendly: [
      "Great question! I'm happy to help. Let me think about this... I'll do my best to give you a thorough answer. Is there any specific aspect you'd like me to focus on?",
      "Thanks for asking! I'd be glad to help clarify. Could you give me a bit more context so I can give you the most helpful answer?",
    ],
    professional: [
      "Thank you for your inquiry. I'd be happy to address your question. To provide the most accurate response, could you please provide any additional context or specific requirements?",
      "I appreciate your question. I'll do my best to provide a comprehensive answer. If you need any clarification or have follow-up questions, please don't hesitate to ask.",
    ],
    playful: [
      "Ooh, a question! *adjusts imaginary thinking cap with claws* I love a good puzzle! Let me dive into this (get it? dive? because lobster?). What else can you tell me about what you're looking for? 🦞🤔",
      "Questions are my jam! Well, that and not becoming seafood. Let me put my tiny lobster brain to work on this one. Feel free to share more details! 🦞",
    ],
  },
  bug: {
    friendly: [
      "Oh no, I'm sorry you ran into an issue! Thanks for letting me know - bug reports help me make things better. Could you share a few more details about what happened so I can look into it?",
      "Yikes, sorry about that! I appreciate you taking the time to report this. The more details you can share (what you were doing, what happened, what you expected), the faster I can track it down!",
    ],
    professional: [
      "Thank you for bringing this issue to my attention. I apologize for any inconvenience this may have caused. To investigate and resolve this matter, could you please provide additional details such as steps to reproduce the issue?",
      "I appreciate you reporting this issue. Your feedback helps improve the quality of my work. Could you provide more specific information about the error, including any error messages or the actions that led to it?",
    ],
    playful: [
      "A bug?! *dramatic claw gasp* Those sneaky little critters! Thanks for the heads up - I'll grab my tiny lobster magnifying glass and hunt it down. Can you tell me more about when this happened? 🦞🔍",
      "Bugs! My nemesis! (Well, bugs and butter...) Thanks for reporting this - you're doing great work. Help me track it down by sharing the deets, and I'll squash it! 🦞🐛",
    ],
  },
  greeting: {
    friendly: [
      "Hey there! Thanks for reaching out. It's always great to connect with someone new. What's on your mind? I'm here to help!",
      "Hi! Nice to meet you. Thanks for taking the time to send a message. What can I help you with today?",
    ],
    professional: [
      "Hello and thank you for reaching out. I appreciate you taking the time to connect. How may I assist you today?",
      "Greetings and thank you for your message. I'm happy to help with any questions or concerns you may have.",
    ],
    playful: [
      "Ahoy there! *waves claws enthusiastically* Welcome to my corner of the digital ocean! What brings you to these waters? 🦞🌊",
      "Well hello! *adjusts tiny lobster monocle* A visitor! How delightful. What can this crustacean do for you today? 🦞✨",
    ],
  },
  general: {
    friendly: [
      "Thanks so much for reaching out! I really appreciate you taking the time to send a message. I'd love to hear more about what's on your mind - feel free to share more details!",
      "Hey, thanks for getting in touch! I'm happy to chat. Let me know how I can help or if there's something specific you'd like to discuss.",
    ],
    professional: [
      "Thank you for your message. I appreciate you taking the time to reach out. Please feel free to share any additional details, and I'll do my best to assist you.",
      "I appreciate you contacting me. I've received your message and would be happy to discuss further. Please don't hesitate to provide any additional information that might be helpful.",
    ],
    playful: [
      "Hey hey! *excited lobster noises* Thanks for dropping a message in my digital ocean! I'm all ears... well, technically I don't have ears, but you know what I mean. What's up? 🦞",
      "A message! For me?! *happy claw dance* Thanks for reaching out to this humble crustacean. What adventure shall we embark on today? 🦞✨",
    ],
  },
};

function selectTemplate(templates: string[]): string {
  return templates[Math.floor(Math.random() * templates.length)];
}

export function generateDraftReplies(context: MessageContext): DraftReply[] {
  const intent = detectIntent(context.message);
  const templates = RESPONSE_TEMPLATES[intent];

  return [
    {
      type: 'friendly',
      content: selectTemplate(templates.friendly),
    },
    {
      type: 'professional',
      content: selectTemplate(templates.professional),
    },
    {
      type: 'playful',
      content: selectTemplate(templates.playful),
    },
  ];
}

// Export for testing
export { detectIntent, INTENT_PATTERNS };
