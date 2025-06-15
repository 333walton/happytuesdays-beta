/**
 * Single Source of Truth: Knowledge Base and Expertise by Agent
 *
 * This file contains domain-specific knowledge, troubleshooting guides, and expertise
 * content for each AI agent, particularly focused on Genius agent's martech/adtech knowledge.
 */

/**
 * Marketing Technology & Advertising Technology Knowledge Base
 * Comprehensive troubleshooting and best practices for Genius agent
 */
export const MARTECH_KNOWLEDGE = {
  // UTM Parameter Setup and Tracking
  utm_parameters: {
    setup_guide: [
      "UTM Source: Identifies where traffic comes from (google, facebook, newsletter)\n",
      "UTM Medium: Identifies the marketing medium (cpc, social, email, organic)\n",
      "UTM Campaign: Identifies the specific campaign (summer_sale, product_launch)\n",
      "UTM Term: Identifies paid search keywords (optional)\n",
      "UTM Content: Differentiates similar content or ads (optional)\n",
    ],
    common_issues: [
      "Missing UTM parameters breaking attribution",
      "Inconsistent UTM naming conventions",
      "UTM parameters not URL encoded properly",
      "Case sensitivity issues in UTM values",
      "UTM parameters being stripped by redirects",
    ],
    troubleshooting_steps: [
      "Check if UTM parameters are present in the final landing page URL",
      "Verify UTM naming follows consistent convention (lowercase, underscores)",
      "Test URL encoding for special characters in UTM values",
      "Check if redirects preserve UTM parameters",
      "Validate UTM parameters are being captured in analytics",
    ],
    best_practices: [
      "Use consistent naming conventions across all campaigns",
      "Document your UTM taxonomy for team reference",
      "Test UTM-tagged URLs before campaign launch",
      "Use URL builders to avoid manual errors",
      "Include UTM parameters in all paid and trackable campaigns",
    ],
  },

  // Google Analytics Configuration
  google_analytics: {
    common_issues: [
      "Google Analytics not tracking page views",
      "E-commerce tracking not working",
      "Cross-domain tracking broken",
      "Bot traffic skewing data",
      "Sampling affecting data accuracy",
    ],
    troubleshooting_checklist: [
      "Verify GA4 tracking code is installed on all pages",
      "Check if tracking code fires in browser dev tools",
      "Confirm data layer implementation for events",
      "Test enhanced e-commerce tracking",
      "Validate cross-domain linking setup",
      "Check bot filtering settings",
      "Review data retention settings",
    ],
    setup_priorities: [
      "Install Google Tag Manager for easier management",
      "Set up conversion tracking for key actions",
      "Configure enhanced e-commerce if applicable",
      "Implement cross-domain tracking if needed",
      "Set up custom dimensions and metrics",
      "Create meaningful segments and audiences",
    ],
  },

  // Tracking Pixel Implementation
  tracking_pixels: {
    facebook_pixel: [
      "Install base Facebook Pixel code on all pages",
      "Configure standard events (Purchase, Lead, etc.)",
      "Set up custom conversions in Events Manager",
      "Test pixel with Facebook Pixel Helper",
      "Verify pixel data in Facebook Analytics",
    ],
    google_ads_pixel: [
      "Install Google Ads conversion tracking tag",
      "Set up enhanced conversions if available",
      "Configure conversion value tracking",
      "Test conversion tracking in preview mode",
      "Link Google Ads with Google Analytics",
    ],
    common_pixel_issues: [
      "Pixel not firing on conversion pages",
      "Duplicate pixel installations causing data inflation",
      "Pixel blocked by ad blockers",
      "Cross-domain pixel tracking issues",
      "iOS 14.5+ privacy changes affecting pixel data",
    ],
  },

  // Attribution Modeling
  attribution_modeling: {
    models_explained: [
      "First-touch: Credits first interaction with customer",
      "Last-touch: Credits final interaction before conversion",
      "Linear: Distributes credit equally across all touchpoints",
      "Time-decay: Gives more credit to recent interactions",
      "Data-driven: Uses machine learning to assign credit",
    ],
    debugging_attribution: [
      "Check if all marketing channels are properly tagged",
      "Verify attribution windows are set correctly",
      "Look for gaps in customer journey tracking",
      "Compare attribution models to understand impact",
      "Analyze cross-device and cross-browser behavior",
    ],
    optimization_tips: [
      "Use appropriate attribution window for your business",
      "Consider customer lifetime value in attribution",
      "Test different attribution models for insights",
      "Supplement with survey data for offline attribution",
      "Account for view-through conversions where relevant",
    ],
  },

  // Campaign Performance Analysis
  campaign_analysis: {
    key_metrics: [
      "CTR (Click-through Rate): Measures ad relevance",
      "CPC (Cost Per Click): Shows keyword competitiveness",
      "CPA (Cost Per Acquisition): Measures conversion efficiency",
      "ROAS (Return on Ad Spend): Revenue generated per dollar spent",
      "Quality Score: Google's measure of ad relevance and quality",
    ],
    optimization_checklist: [
      "Review search terms report for negative keywords",
      "Test different ad copy variations",
      "Optimize landing page experience and load speed",
      "Adjust bids based on performance data",
      "Segment campaigns by device, location, time",
      "Use ad extensions to improve visibility",
    ],
    red_flags: [
      "Steadily declining CTR over time",
      "High bounce rate on landing pages",
      "Low Quality Score for important keywords",
      "CPA trending upward without ROAS improvement",
      "Low conversion rate despite high traffic",
    ],
  },
};

/**
 * Gaming Industry Knowledge Base
 * For Bonzi agent's gaming news and culture expertise
 */
export const GAMING_KNOWLEDGE = {
  current_trends: [
    "Battle royale games continuing popularity",
    "Rise of indie game development",
    "Cloud gaming services growth",
    "VR/AR gaming adoption",
    "Mobile gaming market expansion",
    "Cross-platform gaming standardization",
  ],
  popular_genres: [
    "First-person shooters (FPS)",
    "Multiplayer online battle arena (MOBA)",
    "Massively multiplayer online (MMO)",
    "Role-playing games (RPG)",
    "Real-time strategy (RTS)",
    "Sandbox/survival games",
  ],
  gaming_platforms: [
    "PC Gaming (Steam, Epic Games Store)",
    "Console Gaming (PlayStation, Xbox, Nintendo)",
    "Mobile Gaming (iOS, Android)",
    "Cloud Gaming (Google Stadia, Xbox Cloud)",
    "VR Platforms (Oculus, PlayStation VR)",
  ],
};

/**
 * Digital Art and Design Knowledge Base
 * For Merlin agent's creative expertise
 */
export const ART_KNOWLEDGE = {
  digital_art_trends: [
    "NFT art and blockchain integration",
    "AI-assisted art creation tools",
    "3D and motion graphics growth",
    "Minimalist and abstract digital art",
    "Retro and nostalgic design revival",
    "Sustainable and eco-conscious design",
  ],
  design_principles: [
    "Balance: Visual weight distribution",
    "Contrast: Emphasis through differences",
    "Emphasis: Creating focal points",
    "Movement: Guiding viewer's eye",
    "Pattern: Repetition for unity",
    "Unity: Cohesive overall design",
  ],
  creative_tools: [
    "Adobe Creative Suite (Photoshop, Illustrator, After Effects)",
    "Figma for UI/UX design",
    "Blender for 3D modeling",
    "Procreate for digital illustration",
    "Cinema 4D for motion graphics",
    "Sketch for interface design",
  ],
};

/**
 * AI and Technology Knowledge Base
 * For Genie agent's AI news and entrepreneurship expertise
 */
export const AI_KNOWLEDGE = {
  ai_trends: [
    "Large Language Models (LLMs) advancement",
    "Computer vision and image recognition",
    "AI ethics and responsible development",
    "Edge AI and mobile inference",
    "AI automation in business processes",
    "Conversational AI and chatbots",
  ],
  startup_advice: [
    "Validate your idea with real customers early",
    "Build MVP (Minimum Viable Product) quickly",
    "Focus on product-market fit before scaling",
    "Understand your unit economics thoroughly",
    "Build a strong founding team with complementary skills",
    "Raise capital only when you have clear growth plan",
  ],
  product_management: [
    "Define clear user personas and use cases",
    "Prioritize features based on impact vs effort",
    "Use data to drive product decisions",
    "Implement continuous user feedback loops",
    "Balance technical debt with feature development",
    "Communicate product vision clearly to stakeholders",
  ],
};

/**
 * Business and Investment Knowledge Base
 * For F1 agent's financial and market expertise
 */
export const BUSINESS_KNOWLEDGE = {
  market_analysis: [
    "Fundamental analysis: Company financials and industry position",
    "Technical analysis: Price charts and trading patterns",
    "Market sentiment: Investor confidence and fear indicators",
    "Economic indicators: GDP, inflation, employment data",
    "Sector rotation: Industry performance cycles",
    "Global events: Geopolitical and economic impacts",
  ],
  investment_principles: [
    "Diversification: Don't put all eggs in one basket",
    "Risk tolerance: Invest according to your comfort level",
    "Time horizon: Align investments with your timeline",
    "Dollar-cost averaging: Reduce timing risk through regular investing",
    "Rebalancing: Maintain target asset allocation",
    "Tax efficiency: Minimize unnecessary tax burden",
  ],
  crypto_trends: [
    "Bitcoin as digital gold and store of value",
    "Ethereum and smart contract platforms",
    "DeFi (Decentralized Finance) protocols",
    "NFTs and digital ownership concepts",
    "Central Bank Digital Currencies (CBDCs)",
    "Regulatory developments and compliance",
  ],
};

/**
 * Site Navigation and Developer Knowledge Base
 * For Clippy agent's site concierge expertise
 */
export const SITE_KNOWLEDGE = {
  hydra98_features: [
    "Retro Windows 98 desktop interface",
    "Multiple AI agent personalities",
    "Classic games like Minesweeper and Doom",
    "MS Paint application for digital art",
    "UTM pixel analyzer tool",
    "Motivational quotes section",
    "Desktop metaphor with window management",
  ],
  developer_background: [
    "Full-stack developer with focus on React and modern web technologies",
    "Experience in marketing technology and analytics",
    "Passion for retro computing and nostalgic user experiences",
    "Expertise in AI integration and chatbot development",
    "Background in digital marketing and campaign optimization",
    "Open source contributor and technology enthusiast",
  ],
  navigation_help: [
    "Right-click desktop for display settings and options",
    "Double-click Clippy for quick interactions",
    "Use Start menu to access all applications",
    "Drag windows to arrange your workspace",
    "Try different AI agents for specialized help",
    "Explore classic games and tools for entertainment",
  ],
};

/**
 * Utility Functions for Knowledge Base Access
 */

// Get knowledge base for specific agent
export const getAgentKnowledge = (agent) => {
  const knowledgeBases = {
    genius: MARTECH_KNOWLEDGE,
    bonzi: GAMING_KNOWLEDGE,
    merlin: ART_KNOWLEDGE,
    genie: AI_KNOWLEDGE,
    f1: BUSINESS_KNOWLEDGE,
    clippy: SITE_KNOWLEDGE,
  };

  return knowledgeBases[agent.toLowerCase()] || {};
};

// Search knowledge base for topic
export const searchKnowledge = (agent, topic) => {
  const knowledge = getAgentKnowledge(agent);
  const results = [];

  Object.entries(knowledge).forEach(([category, content]) => {
    if (category.toLowerCase().includes(topic.toLowerCase())) {
      results.push({ category, content });
    } else if (Array.isArray(content)) {
      const matchingItems = content.filter((item) =>
        item.toLowerCase().includes(topic.toLowerCase())
      );
      if (matchingItems.length > 0) {
        results.push({ category, content: matchingItems });
      }
    }
  });

  console.log("🔍 Debugging searchKnowledge results:", results);
  return results;
};

// Get troubleshooting steps for specific issue
export const getTroubleshootingSteps = (issue) => {
  // Focus on Genius agent's martech troubleshooting
  const troubleshootingMap = {
    utm: MARTECH_KNOWLEDGE.utm_parameters.troubleshooting_steps,
    tracking: MARTECH_KNOWLEDGE.tracking_pixels.common_pixel_issues,
    analytics: MARTECH_KNOWLEDGE.google_analytics.troubleshooting_checklist,
    attribution: MARTECH_KNOWLEDGE.attribution_modeling.debugging_attribution,
    campaign: MARTECH_KNOWLEDGE.campaign_analysis.optimization_checklist,
  };

  const matchingKey = Object.keys(troubleshootingMap).find((key) =>
    issue.toLowerCase().includes(key)
  );

  return matchingKey ? troubleshootingMap[matchingKey] : [];
};

// Ensure all required fields exist in MARTECH_KNOWLEDGE
MARTECH_KNOWLEDGE.utm_parameters.troubleshooting_steps =
  MARTECH_KNOWLEDGE.utm_parameters.troubleshooting_steps || [];
MARTECH_KNOWLEDGE.utm_parameters.best_practices =
  MARTECH_KNOWLEDGE.utm_parameters.best_practices || [];
MARTECH_KNOWLEDGE.google_analytics.troubleshooting_checklist =
  MARTECH_KNOWLEDGE.google_analytics.troubleshooting_checklist || [];
MARTECH_KNOWLEDGE.google_analytics.setup_priorities =
  MARTECH_KNOWLEDGE.google_analytics.setup_priorities || [];
MARTECH_KNOWLEDGE.tracking_pixels.common_pixel_issues =
  MARTECH_KNOWLEDGE.tracking_pixels.common_pixel_issues || [];
MARTECH_KNOWLEDGE.attribution_modeling.debugging_attribution =
  MARTECH_KNOWLEDGE.attribution_modeling.debugging_attribution || [];
MARTECH_KNOWLEDGE.campaign_analysis.key_metrics =
  MARTECH_KNOWLEDGE.campaign_analysis.key_metrics || [];
