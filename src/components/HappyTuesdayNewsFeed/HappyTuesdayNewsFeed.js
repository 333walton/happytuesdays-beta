// src/components/HappyTuesdayNewsFeed/HappyTuesdayNewsFeed.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  fetchAndCacheFeed,
  prefetchFeeds,
  clearCategoryCache,
} from "../../utils/feedAggregator";
import FeedSkeleton from "../FeedSkeleton/FeedSkeleton";

const HappyTuesdayNewsFeed = ({
  inIE = false,
  initialTab = "blog",
  initialSubTab,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
  const [feedItems, setFeedItems] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});
  const [lastRefresh, setLastRefresh] = useState({});

  // Category icons mapping
  const categoryIcons = {
    "ai-machine-learning": "🤖",
    "martech-adtech": "📊",
    "web-dev-devops": "💻",
    "cybersecurity-privacy": "🔒",
    "blockchain-web3": "⛓️",
    "vintage-tech-spotlights": "🖥️",
    "founder-stories": "🚀",
    "productivity-hacks": "⚡",
    "automation-no-code": "⚙️",
    "funding-monetization": "💰",
    "project-management": "📋",
    "stoic-mindset": "🧘",
    "generative-ai-art": "🎨",
    "pixel-retro-art": "👾",
    "ui-ux-trends": "🎯",
    "color-typography": "🎨",
    "animation-motion": "✨",
    "tutorials-walkthroughs": "📚",
    "retro-game-news": "🕹️",
    "emulation-modding": "💾",
    "collecting-hardware": "🎮",
    "speedruns-events": "⏱️",
    "indie-retro-releases": "🎲",
    "dos-game-deep-dives": "💿",
  };

  // Default category icon
  const getIcon = (subcategory, index) => {
    if (subcategory && categoryIcons[subcategory]) {
      return categoryIcons[subcategory];
    }
    const defaultIcons = ["📰", "📡", "📢", "📣", "📻"];
    return defaultIcons[index % defaultIcons.length];
  };

  useEffect(() => {
    const pathParts = location.pathname.split("/").filter(Boolean);
    if (pathParts[0] === "feeds") {
      const newTab = pathParts[1] || "blog";
      const newSubTab = pathParts[2];

      if (newTab !== activeTab) {
        setActiveTab(newTab);
      }
      if (newSubTab !== activeSubTab) {
        setActiveSubTab(newSubTab);
      }
    }
  }, [location.pathname, activeTab, activeSubTab]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setActiveSubTab(initialSubTab);
  }, [initialSubTab]);

  // Load feed data when tab/subtab changes
  useEffect(() => {
    if (activeTab !== "blog") {
      if (activeSubTab) {
        loadFeed(activeTab, activeSubTab);
      } else {
        loadInitialFeed(activeTab);
      }

      // Prefetch feeds for the category in background
      prefetchFeeds(activeTab);
    }
  }, [activeTab, activeSubTab]); // Removed function dependencies to avoid circular reference

  // Refresh current feed
  const handleRefresh = () => {
    if (activeTab === "blog") return;

    // Clear cache for current category
    clearCategoryCache(activeTab);

    if (activeSubTab) {
      loadFeed(activeTab, activeSubTab);
    } else {
      loadInitialFeed(activeTab);
    }
  };

  // Define functions without useCallback first to avoid circular dependencies
  const loadInitialFeed = async (feedType) => {
    setLoading((prev) => ({ ...prev, [feedType]: true }));
    setError((prev) => ({ ...prev, [feedType]: null }));

    try {
      const items = await fetchAndCacheFeed(feedType);

      if (items.length === 0) {
        setError((prev) => ({
          ...prev,
          [feedType]: "No items found. Please try again later.",
        }));
      } else {
        setFeedItems((prev) => ({ ...prev, [feedType]: items }));
        setLastRefresh((prev) => ({ ...prev, [feedType]: Date.now() }));
      }
    } catch (err) {
      console.error("Error loading feed:", err);
      setError((prev) => ({
        ...prev,
        [feedType]: "Failed to load feed. Please try again.",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [feedType]: false }));
    }
  };

  const loadFeed = async (category, subcategory) => {
    const feedKey = `${category}_${subcategory}`;
    setLoading((prev) => ({ ...prev, [feedKey]: true }));
    setError((prev) => ({ ...prev, [feedKey]: null }));

    try {
      const items = await fetchAndCacheFeed(category, subcategory);

      if (items.length === 0) {
        setError((prev) => ({
          ...prev,
          [feedKey]: "No items found for this category.",
        }));
      } else {
        setFeedItems((prev) => ({ ...prev, [feedKey]: items }));
        setLastRefresh((prev) => ({ ...prev, [feedKey]: Date.now() }));
      }
    } catch (err) {
      console.error("Error loading subcategory feed:", err);
      setError((prev) => ({
        ...prev,
        [feedKey]: "Failed to load feed. Please try again.",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [feedKey]: false }));
    }
  };

  const showTab = (tabName) => {
    setActiveTab(tabName);
    setActiveSubTab(null);

    if (tabName === "blog") {
      navigate(`/feeds`);
    } else {
      navigate(`/feeds/${tabName}`);
    }
  };

  // Get current feed items
  const getCurrentFeedItems = () => {
    if (activeTab === "blog") return null;

    const feedKey = activeSubTab ? `${activeTab}_${activeSubTab}` : activeTab;
    return feedItems[feedKey] || [];
  };

  // Check if currently loading
  const isCurrentlyLoading = () => {
    if (activeTab === "blog") return false;

    const feedKey = activeSubTab ? `${activeTab}_${activeSubTab}` : activeTab;
    return loading[feedKey] || false;
  };

  // Get current error
  const getCurrentError = () => {
    if (activeTab === "blog") return null;

    const feedKey = activeSubTab ? `${activeTab}_${activeSubTab}` : activeTab;
    return error[feedKey];
  };

  // Format time for last refresh
  const getLastRefreshTime = () => {
    const feedKey = activeSubTab ? `${activeTab}_${activeSubTab}` : activeTab;
    const timestamp = lastRefresh[feedKey];
    if (!timestamp) return null;

    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const categories = {
    tech: [
      "AI & Machine Learning",
      "Martech & AdTech",
      "Web Dev & DevOps",
      "Cybersecurity & Privacy",
      "Blockchain & Web3",
      "Vintage Tech Spotlights",
    ],
    builder: [
      "Founder Stories",
      "Productivity Hacks",
      "Automation & No-Code",
      "Funding & Monetization",
      "Project Management",
      "Stoic Mindset",
    ],
    art: [
      "Generative & AI Art",
      "Pixel & Retro Art",
      "UI/UX Trends",
      "Color & Typography",
      "Animation & Motion",
      "Tutorials & Walkthroughs",
    ],
    gaming: [
      "Retro Game News",
      "Emulation & Modding",
      "Collecting & Hardware",
      "Speedruns & Events",
      "Indie Retro Releases",
      "DOS Game Deep Dives",
    ],
  };

  const styles = {
    container: {
      minHeight: inIE ? "auto" : "100vh",
      fontFamily: '"Courier New", monospace',
      backgroundColor: "#f5f2e8",
      color: "#2c2416",
      lineHeight: "1.6",
    },
    header: {
      backgroundColor: "#e74c3c",
      padding: "20px 0",
      textAlign: "center",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    },
    headerTitle: {
      fontSize: "2.5em",
      color: "#fff",
      textShadow: "3px 3px 0 rgba(0,0,0,0.2)",
      letterSpacing: "2px",
      margin: 0,
    },
    content: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "40px 20px",
    },
    tabs: {
      display: "flex",
      justifyContent: "center",
      marginBottom: "40px",
      backgroundColor: "#2c2416",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      flexWrap: "wrap",
    },
    tabButton: {
      backgroundColor: "transparent",
      border: "none",
      color: "#f5f2e8",
      padding: "15px 30px",
      fontSize: "1.1em",
      cursor: "pointer",
      transition: "all 0.3s ease",
      fontFamily: '"Courier New", monospace',
      fontWeight: "bold",
      position: "relative",
    },
    tabButtonActive: {
      backgroundColor: "#e74c3c",
      color: "#fff",
    },
    tabButtonHover: {
      backgroundColor: "rgba(231, 76, 60, 0.2)",
    },
    tabContent: {
      animation: "fadeIn 0.5s ease",
    },
    blogPost: {
      backgroundColor: "#fff",
      border: "3px solid #2c2416",
      borderRadius: "8px",
      padding: "30px",
      boxShadow: "8px 8px 0 #2c2416",
      transition: "all 0.3s ease",
      marginBottom: "30px",
    },
    blogPostTitle: {
      fontSize: "2em",
      marginBottom: "10px",
      color: "#2c2416",
    },
    blogMeta: {
      color: "#666",
      marginBottom: "20px",
      fontSize: "0.9em",
    },
    blogExcerpt: {
      lineHeight: "1.8",
      marginBottom: "20px",
    },
    readMore: {
      display: "inline-block",
      backgroundColor: "#e74c3c",
      color: "#fff",
      padding: "10px 20px",
      textDecoration: "none",
      borderRadius: "4px",
      fontWeight: "bold",
      transition: "all 0.3s ease",
      boxShadow: "4px 4px 0 #2c2416",
      border: "none",
      cursor: "pointer",
    },
    feedCategories: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "30px",
      marginBottom: "40px",
    },
    feedCategory: {
      backgroundColor: "#fff",
      border: "3px solid #2c2416",
      borderRadius: "8px",
      padding: "20px",
      boxShadow: "8px 8px 0 #2c2416",
      transition: "all 0.3s ease",
    },
    feedCategoryTitle: {
      fontSize: "1.5em",
      marginBottom: "15px",
      color: "#e74c3c",
      borderBottom: "2px dashed #2c2416",
      paddingBottom: "10px",
    },
    subcategoryList: {
      listStyle: "none",
      padding: 0,
      margin: 0,
    },
    subcategoryItem: {
      padding: "8px 0",
      borderBottom: "1px dotted #ccc",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    feedItems: {
      display: "grid",
      gap: "20px",
    },
    feedItem: {
      backgroundColor: "#fff",
      border: "2px solid #2c2416",
      borderRadius: "8px",
      padding: "20px",
      display: "flex",
      alignItems: "flex-start",
      gap: "20px",
      transition: "all 0.3s ease",
      boxShadow: "4px 4px 0 #2c2416",
      cursor: "pointer",
      textDecoration: "none",
      color: "inherit",
    },
    feedIcon: {
      width: "60px",
      height: "60px",
      backgroundColor: "#e74c3c",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "24px",
      color: "#fff",
      flexShrink: 0,
    },
    feedContent: {
      flex: 1,
      minWidth: 0,
    },
    feedTitle: {
      fontSize: "1.2em",
      marginBottom: "5px",
      color: "#2c2416",
      fontWeight: "bold",
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
    },
    feedDesc: {
      color: "#666",
      fontSize: "0.9em",
      marginBottom: "8px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "-webkit-box",
      WebkitLineClamp: 3,
      WebkitBoxOrient: "vertical",
    },
    feedMeta: {
      fontSize: "0.8em",
      color: "#999",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "10px",
    },
    feedTime: {
      fontSize: "0.8em",
      color: "#999",
    },
    feedSource: {
      fontSize: "0.8em",
      color: "#e74c3c",
      fontWeight: "bold",
    },
    loading: {
      textAlign: "center",
      padding: "40px",
      fontSize: "1.2em",
      color: "#e74c3c",
    },
    error: {
      backgroundColor: "#fee",
      border: "2px solid #e74c3c",
      borderRadius: "8px",
      padding: "20px",
      textAlign: "center",
      color: "#e74c3c",
      marginBottom: "20px",
    },
    retryButton: {
      marginTop: "10px",
      backgroundColor: "#e74c3c",
      color: "#fff",
      border: "none",
      padding: "8px 16px",
      borderRadius: "4px",
      cursor: "pointer",
      fontWeight: "bold",
    },
    refreshInfo: {
      textAlign: "center",
      fontSize: "0.9em",
      color: "#666",
      marginBottom: "20px",
    },
    refreshButton: {
      backgroundColor: "#2c2416",
      color: "#f5f2e8",
      border: "none",
      padding: "8px 16px",
      borderRadius: "4px",
      cursor: "pointer",
      marginLeft: "10px",
      fontWeight: "bold",
      transition: "all 0.3s ease",
    },
    emptyState: {
      textAlign: "center",
      padding: "60px 20px",
      color: "#666",
    },
    emptyStateIcon: {
      fontSize: "48px",
      marginBottom: "20px",
      opacity: 0.5,
    },
    thumbnail: {
      width: "60px",
      height: "60px",
      objectFit: "cover",
      borderRadius: "8px",
    },
  };

  const LoadingDots = () => (
    <div style={styles.loading}>
      Loading<span className="loading-dots">...</span>
    </div>
  );

  const ErrorState = ({ message, onRetry }) => (
    <div style={styles.error}>
      <div>{message}</div>
      {onRetry && (
        <button style={styles.retryButton} onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );

  const EmptyState = () => (
    <div style={styles.emptyState}>
      <div style={styles.emptyStateIcon}>📭</div>
      <h3>No News Items Available</h3>
      <p>Check back later for fresh content!</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .loading-dots {
            display: inline-block;
            width: 30px;
            text-align: left;
          }
          
          .loading-dots::after {
            content: '...';
            animation: dots 1.5s steps(4, end) infinite;
          }
          
          @keyframes dots {
            0%, 20% { content: ''; }
            40% { content: '.'; }
            60% { content: '..'; }
            80%, 100% { content: '...'; }
          }
          
          .feed-category:hover {
            transform: translate(-4px, -4px);
            box-shadow: 12px 12px 0 #2c2416;
          }
          
          .blog-post:hover {
            transform: translate(-4px, -4px);
            box-shadow: 12px 12px 0 #2c2416;
          }
          
          .feed-item:hover {
            transform: translate(-2px, -2px);
            box-shadow: 6px 6px 0 #2c2416;
          }
          
          .read-more:hover {
            transform: translate(-2px, -2px);
            box-shadow: 6px 6px 0 #2c2416;
          }
          
          .tab-button:hover {
            background-color: rgba(231, 76, 60, 0.2);
          }
          
          .subcategory-item:hover {
            padding-left: 10px;
            color: #e74c3c;
          }
          
          .subcategory-item::before {
            content: "▸ ";
            color: #e74c3c;
            font-weight: bold;
          }
          
          .refresh-button:hover {
            background-color: #3c3420;
          }
        `}
      </style>

      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>HAPPY TUESDAYS NEWS FEED</h1>
      </header>

      {/* Container */}
      <div style={styles.content}>
        {/* Tabs */}
        <div style={styles.tabs}>
          {[
            { key: "blog", label: "Blog" },
            { key: "tech", label: "Tech Feed" },
            { key: "builder", label: "Builder Feed" },
            { key: "art", label: "Art & Design Feed" },
            { key: "gaming", label: "Gaming Feed" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => showTab(tab.key)}
              style={{
                ...styles.tabButton,
                ...(activeTab === tab.key ? styles.tabButtonActive : {}),
              }}
              className="tab-button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Blog Tab */}
        {activeTab === "blog" && (
          <div style={styles.tabContent}>
            {[
              {
                title: "The Renaissance of Retro Computing",
                date: "January 10, 2025",
                readTime: "5 min read",
                excerpt:
                  "Exploring how vintage computing aesthetics are influencing modern web design and user interfaces. From pixelated fonts to nostalgic color palettes, the retro revolution is here to stay...",
              },
              {
                title: "Building in Public: A Stoic Approach",
                date: "January 8, 2025",
                readTime: "7 min read",
                excerpt:
                  "How ancient Stoic philosophy can guide modern builders and entrepreneurs through the challenges of creating in the digital age. Lessons from Marcus Aurelius for the indie hacker...",
              },
              {
                title: "AI Art Meets Pixel Perfection",
                date: "January 5, 2025",
                readTime: "4 min read",
                excerpt:
                  "The intersection of generative AI and retro pixel art aesthetics is creating a new wave of digital creativity. Discover tools and techniques for blending the old with the new...",
              },
            ].map((post, index) => (
              <article
                key={index}
                style={styles.blogPost}
                className="blog-post"
              >
                <h2 style={styles.blogPostTitle}>{post.title}</h2>
                <div style={styles.blogMeta}>
                  Published on {post.date} • {post.readTime}
                </div>
                <div style={styles.blogExcerpt}>{post.excerpt}</div>
                <button style={styles.readMore} className="read-more">
                  READ MORE →
                </button>
              </article>
            ))}
          </div>
        )}

        {/* Feed Tabs */}
        {activeTab !== "blog" && (
          <div style={styles.tabContent}>
            <div style={styles.feedCategories}>
              <div style={styles.feedCategory} className="feed-category">
                <h3 style={styles.feedCategoryTitle}>
                  {activeTab.toUpperCase()} CATEGORIES
                </h3>
                <ul style={styles.subcategoryList}>
                  {categories[activeTab]?.map((category, index) => {
                    const subCatKebab = category
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/&/g, "and")
                      .replace(/\//g, "-"); // Replace forward slashes with hyphens
                    return (
                      <li
                        key={index}
                        onClick={() =>
                          navigate(`/feeds/${activeTab}/${subCatKebab}`)
                        }
                        style={{
                          ...styles.subcategoryItem,
                          fontWeight:
                            activeSubTab === subCatKebab ? "bold" : "normal",
                          color:
                            activeSubTab === subCatKebab
                              ? "#e74c3c"
                              : "inherit",
                        }}
                        className="subcategory-item"
                      >
                        {category}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Refresh Info */}
            {getLastRefreshTime() && !isCurrentlyLoading() && (
              <div style={styles.refreshInfo}>
                Last updated: {getLastRefreshTime()}
                <button
                  style={styles.refreshButton}
                  onClick={handleRefresh}
                  className="refresh-button"
                >
                  Refresh
                </button>
              </div>
            )}

            {/* Feed Items */}
            <div style={styles.feedItems}>
              {isCurrentlyLoading() ? (
                <FeedSkeleton count={5} />
              ) : getCurrentError() ? (
                <ErrorState
                  message={getCurrentError()}
                  onRetry={handleRefresh}
                />
              ) : getCurrentFeedItems().length > 0 ? (
                getCurrentFeedItems().map((item, index) => (
                  <a
                    key={item.guid || index}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.feedItem}
                    className="feed-item"
                  >
                    <div style={styles.feedIcon}>
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt=""
                          style={styles.thumbnail}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML = getIcon(
                              activeSubTab,
                              index
                            );
                          }}
                        />
                      ) : (
                        getIcon(activeSubTab, index)
                      )}
                    </div>
                    <div style={styles.feedContent}>
                      <h4 style={styles.feedTitle}>{item.title}</h4>
                      {item.description && (
                        <p style={styles.feedDesc}>{item.description}</p>
                      )}
                      <div style={styles.feedMeta}>
                        <span style={styles.feedSource}>{item.source}</span>
                        <span style={styles.feedTime}>{item.time}</span>
                      </div>
                    </div>
                  </a>
                ))
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HappyTuesdayNewsFeed;
