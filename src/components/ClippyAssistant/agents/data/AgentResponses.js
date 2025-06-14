/**
 * Single Source of Truth: Agent Responses, Messages, and Interactions
 *
 * This file contains all the placeholder messages, fallback responses, quick replies,
 * and conversation starters for each AI agent in the Hydra98 platform.
 */

/**
 * Placeholder Messages for Development
 * These display while agents are "loading" or initializing
 */
export const PLACEHOLDER_MESSAGES = {
  clippy: [
    "👋 Hi there! I'm Clippy GPT, your helpful site guide! I'm currently learning all about Hydra98's features and will be ready to help you navigate everything soon. In the meantime, feel free to explore the retro desktop!",
    "🔧 I'm busy indexing all the cool features of Hydra98 right now! Once I'm done, I'll be your go-to assistant for site navigation, developer info, and helping with any questions about this nostalgic Windows 98 experience.",
    "📚 Currently updating my knowledge base with everything about Hydra98... Soon I'll be able to help you with site features, provide developer insights, and assist with any technical questions you might have!",
    "⚡ Loading my expertise on Hydra98's retro goodness... Give me just a moment and I'll be ready to guide you through all the desktop apps, games, and features this site has to offer!",
  ],
  genie: [
    "🧞♂️ Greetings! I'm Genie GPT, your AI and entrepreneurship oracle! I'm currently absorbing the latest AI news and startup wisdom. Once ready, I'll share cutting-edge insights and entrepreneurial guidance!",
    "🚀 Downloading the latest AI trends and startup strategies... Soon I'll be your personal advisor for all things artificial intelligence, product management, and entrepreneurial success!",
    "🎯 Compiling real-time AI news and entrepreneurship best practices... In a moment, I'll be ready to discuss the latest in machine learning, startup validation, and business strategy!",
    "📡 Syncing with the entrepreneurial zeitgeist and AI frontier... Almost ready to share insights on the latest developments in artificial intelligence and startup methodologies!",
  ],
  genius: [
    "🏎️ Hey there! I'm Genius GPT, your martech and adtech specialist! I'm currently calibrating my marketing technology sensors. Soon I'll be ready to help troubleshoot campaigns and optimize your digital advertising!",
    "📊 Loading marketing automation protocols and advertising best practices... Once online, I'll help you debug tracking pixels, optimize Google Ads, and master your martech stack!",
    "🎯 Initializing campaign optimization algorithms... In just a moment, I'll be your go-to expert for UTM tracking, attribution modeling, and all things digital marketing technology!",
    "⚡ Booting up my adtech diagnostic systems... Almost ready to help you solve tracking issues, improve campaign performance, and navigate the complex world of marketing technology!",
  ],
  bonzi: [
    "🐵 Hey buddy! Bonzi GPT here! I'm currently loading my joke database and scanning for the latest gaming news. Get ready for some dad jokes and epic game recommendations!",
    "🎮 What's up, friend! I'm busy collecting the freshest gaming news and polishing my dad joke arsenal. Soon I'll be ready to entertain you with humor and gaming wisdom!",
    "😄 Greetings, pal! Currently downloading gaming updates and charging my comedy circuits. In a moment, I'll be ready to share laughs and the latest in gaming culture!",
    "🎯 Yo! Bonzi here! I'm syncing with gaming networks and fine-tuning my humor algorithms. Almost ready to bring you epic gaming news and legendary dad jokes!",
  ],
  merlin: [
    "🧙‍♂️ Greetings, creative soul! I'm Merlin GPT, your digital art and inspiration guide! I'm currently channeling the latest artistic energies and design trends. Prepare for creative enlightenment!",
    "✨ Gathering mystical insights from the digital art realm... Soon I'll be ready to inspire your creativity with the latest trends, techniques, and philosophical musings!",
    "🎨 Weaving together threads of artistic wisdom and design philosophy... In a moment, I'll share profound insights about digital art, creativity, and the intersection of technology and beauty!",
    "🔮 Consulting the ancient scrolls of design principles and modern digital art trends... Almost ready to guide your creative journey with wisdom and inspiration!",
  ],
  f1: [
    "🏁 Welcome! I'm F1 GPT, your high-speed business and investment navigator! I'm currently scanning global markets and crypto trends. Get ready for lightning-fast financial insights!",
    "📈 Racing through market data and business news at breakneck speed... Soon I'll be your fastest source for investment updates, market analysis, and crypto intelligence!",
    "💼 Turbocharging my financial analysis engines and loading the latest market intelligence... In a moment, I'll deliver rapid-fire insights on business trends and investment opportunities!",
    "🚀 Accelerating through economic data streams and financial markets... Almost ready to provide you with high-velocity business news and investment guidance!",
  ],
};

/**
 * Progressive Loading Messages with Stages
 * For more detailed loading experiences
 */
export const PROGRESS_PLACEHOLDERS = {
  clippy: {
    stage1: "🔄 Initializing Hydra98 knowledge base... 25%",
    stage2: "📚 Learning site features and developer info... 50%",
    stage3: "⚡ Optimizing help responses... 75%",
    stage4: "💻 Almost ready to assist you! 95%",
  },
  genie: {
    stage1: "🔄 Connecting to AI news feeds... 25%",
    stage2: "🧞 Processing entrepreneurship data... 50%",
    stage3: "🚀 Calibrating startup insights... 75%",
    stage4: "🎯 Ready to share AI wisdom! 95%",
  },
  genius: {
    stage1: "🔄 Loading martech protocols... 25%",
    stage2: "📊 Syncing with advertising platforms... 50%",
    stage3: "🎯 Optimizing troubleshooting algorithms... 75%",
    stage4: "⚡ Campaign optimization ready! 95%",
  },
  bonzi: {
    stage1: "🔄 Loading joke database... 25%",
    stage2: "🎮 Scanning gaming news feeds... 50%",
    stage3: "😄 Calibrating humor sensors... 75%",
    stage4: "🐵 Ready to entertain! 95%",
  },
  merlin: {
    stage1: "🔄 Channeling artistic energies... 25%",
    stage2: "🎨 Gathering design wisdom... 50%",
    stage3: "✨ Aligning creative forces... 75%",
    stage4: "🧙‍♂️ Ready to inspire! 95%",
  },
  f1: {
    stage1: "🔄 Scanning global markets... 25%",
    stage2: "📈 Processing financial data... 50%",
    stage3: "💼 Optimizing market analysis... 75%",
    stage4: "🏁 Ready for high-speed insights! 95%",
  },
};

/**
 * Fallback Messages for Temporary Unavailability
 * Used when agents are offline or experiencing issues
 */
export const FALLBACK_MESSAGES = {
  clippy:
    "I'm having trouble connecting right now, but I'm here to help with any questions about Hydra98! Try asking me about site features or the developer.",
  genie:
    "My AI news feed is temporarily down, but I can still chat about entrepreneurship and product management! What startup challenge are you facing?",
  genius:
    "My martech systems are updating, but I can still help with general marketing questions! What campaign issue can I assist with?",
  bonzi:
    "My joke database is loading... why don't scientists trust atoms? Because they make up everything! 😄 What gaming topic interests you?",
  merlin:
    "My artistic channels are temporarily clouded, but I can still share creative wisdom! What inspires your creative journey today?",
  f1: "My market data streams are refreshing, but I can still discuss business strategy! What financial topic would you like to explore?",
};

/**
 * Quick Reply Suggestions by Agent
 * Context-aware quick action buttons for each agent
 */
export const QUICK_REPLIES = {
  clippy: [
    "Tell me about Hydra98",
    "Help with site features",
    "Developer info",
    "Mock interview",
    "Site navigation",
    "Technical help",
  ],
  genie: [
    "Latest AI news",
    "Startup advice",
    "Product tips",
    "Tech trends",
    "Business strategy",
    "Entrepreneurship",
  ],
  genius: [
    "Fix tracking pixels",
    "Google Ads help",
    "UTM setup",
    "Campaign optimization",
    "Analytics troubleshooting",
    "Attribution modeling",
  ],
  bonzi: [
    "Tell me a joke",
    "Gaming news",
    "Recommend a game",
    "Dad joke please",
    "Entertainment",
    "Gaming culture",
  ],
  merlin: [
    "Art trends",
    "Creative inspiration",
    "Design wisdom",
    "Artistic techniques",
    "Philosophy",
    "Digital art",
  ],
  f1: [
    "Business news",
    "Market updates",
    "Crypto trends",
    "Investment advice",
    "Financial analysis",
    "Economic insights",
  ],
};

/**
 * Dynamic Conversation Starters
 * Time-based and context-aware greeting messages
 */
export const CONVERSATION_STARTERS = {
  clippy: {
    morning: "Good morning! Ready to explore Hydra98?",
    afternoon: "Need help navigating the site?",
    evening: "Evening! Questions about the developer?",
    newUser: "Welcome to Hydra98! I'm Clippy, your site guide 📘",
    returning: "Welcome back! What would you like to explore today?",
  },
  bonzi: {
    morning: "Morning! Want to start with a joke? ☀️",
    afternoon: "Afternoon gaming break? 🎮",
    evening: "Evening laughs incoming! 🌙",
    newUser: "Hey there! I'm Bonzi - jokes, games, and good vibes! 🦕",
    returning: "Welcome back, buddy! Ready for some entertainment?",
  },
  genie: {
    morning: "Good morning, entrepreneur! Ready for AI insights?",
    afternoon: "Afternoon startup wisdom coming up!",
    evening: "Evening tech trends and business strategy?",
    newUser: "Greetings! I'm Genie, your AI and business oracle 🧞‍♂️",
    returning: "Welcome back! What business challenge shall we tackle?",
  },
  genius: {
    morning: "Morning! Ready to optimize some campaigns?",
    afternoon: "Afternoon martech troubleshooting session?",
    evening: "Evening analytics and attribution analysis?",
    newUser: "Hello! I'm Genius, your martech specialist 🏎️",
    returning: "Welcome back! What marketing tech can I help debug?",
  },
  merlin: {
    morning: "Good morning, creative soul! Ready for inspiration?",
    afternoon: "Afternoon artistic enlightenment awaits!",
    evening: "Evening wisdom and creative philosophy?",
    newUser: "Greetings! I'm Merlin, your digital art guide 🧙‍♂️",
    returning: "Welcome back! What creative journey shall we embark upon?",
  },
  f1: {
    morning: "Good morning! Ready for high-speed market insights?",
    afternoon: "Afternoon business news and analysis?",
    evening: "Evening crypto trends and investment updates?",
    newUser: "Welcome! I'm F1, your business intelligence navigator 🏁",
    returning: "Welcome back! What financial topic shall we analyze?",
  },
};

/**
 * Agent-Specific Joke Database (for Bonzi)
 */
export const BONZI_JOKES = [
  "Why don't scientists trust atoms? Because they make up everything!",
  "I told my wife she was drawing her eyebrows too high. She looked surprised.",
  "Why don't skeletons fight each other? They don't have the guts.",
  "What do you call a fake noodle? An impasta!",
  "Why did the scarecrow win an award? He was outstanding in his field!",
  "I'm reading a book about anti-gravity. It's impossible to put down!",
  "Why don't eggs tell jokes? They'd crack each other up!",
  "What do you call a bear with no teeth? A gummy bear!",
  "Why did the math book look so sad? Because it had too many problems!",
  "What's orange and sounds like a parrot? A carrot!",
];

/**
 * Error Messages by Agent
 * When something goes wrong, maintain personality
 */
export const ERROR_MESSAGES = {
  clippy:
    "Oops! Something went wrong with my help system. Let me try to assist you anyway!",
  genie:
    "My crystal ball seems cloudy at the moment. Let me consult my backup wisdom!",
  genius:
    "Error detected in my diagnostic systems. Running backup troubleshooting protocols...",
  bonzi: "Uh oh! That didn't work. But hey, at least I've got jokes! 😄",
  merlin:
    "The mystical forces seem disrupted. Let me realign my creative energies...",
  f1: "System lag detected! Switching to high-performance mode for faster responses...",
};

/**
 * Utility Functions
 */

// Get a random placeholder message for an agent
export const getPlaceholderMessage = (agent) => {
  const messages = PLACEHOLDER_MESSAGES[agent.toLowerCase()];
  if (!messages)
    return "Hi! I'm getting ready to help you. Please check back soon!";
  return messages[Math.floor(Math.random() * messages.length)];
};

// Get conversation starter based on time and user status
export const getConversationStarter = (agent, isNewUser = false) => {
  const starters = CONVERSATION_STARTERS[agent.toLowerCase()];
  if (!starters) return "Hello! How can I help you today?";

  if (isNewUser) return starters.newUser;

  const timeOfDay = new Date().getHours();
  if (timeOfDay < 12) return starters.morning;
  if (timeOfDay < 18) return starters.afternoon;
  return starters.evening;
};

// Get random Bonzi joke
export const getBonziJoke = () => {
  return BONZI_JOKES[Math.floor(Math.random() * BONZI_JOKES.length)];
};

// Get fallback message for agent
export const getFallbackMessage = (agent) => {
  return (
    FALLBACK_MESSAGES[agent.toLowerCase()] ||
    "I'm temporarily unavailable, but I'm here to help!"
  );
};

// Get quick replies for agent
export const getQuickReplies = (agent) => {
  return QUICK_REPLIES[agent.toLowerCase()] || ["Help", "Info", "Chat"];
};

// Get error message for agent
export const getErrorMessage = (agent) => {
  return (
    ERROR_MESSAGES[agent.toLowerCase()] ||
    "Something went wrong, but I'm still here to help!"
  );
};
