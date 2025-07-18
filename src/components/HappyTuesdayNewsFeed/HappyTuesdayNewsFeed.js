//This is ready for clean SPA routing and future Next.js migration
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HappyTuesdayNewsFeed = ({
  inIE = false,
  initialTab = "blog",
  initialSubTab,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
  const [feedItems, setFeedItems] = useState({});
  const [loading, setLoading] = useState({});

  // Update tab/subtab on prop change
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  useEffect(() => {
    setActiveSubTab(initialSubTab);
  }, [initialSubTab]);

  // When tab (category) changes, load its items if not "blog"
  useEffect(() => {
    if (activeTab !== "blog" && !feedItems[activeTab]) {
      loadInitialFeed(activeTab);
    }
  }, [activeTab]);

  // When subtab (subcategory) changes, and not on blog, load corresponding feed
  useEffect(() => {
    if (activeSubTab && activeTab !== "blog") {
      loadFeed(activeSubTab);
    }
    // Optionally, clear subcategory if changing to main blog
    if (activeTab === "blog") {
      setActiveSubTab(undefined);
    }
  }, [activeSubTab, activeTab]);

  const loadInitialFeed = (feedType) => {
    setLoading((prev) => ({ ...prev, [feedType]: true }));
    setTimeout(() => {
      setFeedItems((prev) => ({
        ...prev,
        [feedType]: feedData[feedType] || [],
      }));
      setLoading((prev) => ({ ...prev, [feedType]: false }));
    }, 500);
  };

  const loadFeed = (subcategory) => {
    const activeTabKey = activeTab;
    setLoading((prev) => ({ ...prev, [activeTabKey]: true }));

    setTimeout(() => {
      setFeedItems((prev) => ({
        ...prev,
        [activeTabKey]: [
          {
            icon: "📰",
            title: `${subcategory.replace("-", " ").toUpperCase()} Update`,
            desc: `Latest news and updates from the ${subcategory} category`,
            time: "Just now",
          },
        ],
      }));
      setLoading((prev) => ({ ...prev, [activeTabKey]: false }));
    }, 1000);
  };

  const showTab = (tabName) => {
    setActiveTab(tabName);

    if (tabName === "blog") {
      navigate(`/feeds`);
    } else {
      navigate(`/feeds/${tabName}`);
    }
  };

  // ... feedData, categories, styles (unchanged)
  const feedData = {
    tech: [
      {
        icon: "🤖",
        title: "OpenAI Announces GPT-5 Preview",
        desc: "Next generation AI model shows unprecedented capabilities",
        time: "2 hours ago",
      },
      {
        icon: "🔒",
        title: "Major Security Breach at Tech Giant",
        desc: "Millions of user accounts potentially compromised",
        time: "4 hours ago",
      },
      {
        icon: "⚡",
        title: "JavaScript Framework Wars Continue",
        desc: "New contender enters the arena with blazing fast performance",
        time: "6 hours ago",
      },
    ],
    builder: [
      {
        icon: "🚀",
        title: "Solo Founder Reaches $10k MRR",
        desc: "From idea to profitability in just 6 months",
        time: "1 hour ago",
      },
      {
        icon: "⚙️",
        title: "No-Code Revolution: Build Without Limits",
        desc: "Top 10 automation tools every builder needs",
        time: "3 hours ago",
      },
      {
        icon: "🧘",
        title: "The Stoic Builder's Morning Routine",
        desc: "Ancient wisdom for modern productivity",
        time: "5 hours ago",
      },
    ],
    art: [
      {
        icon: "🎨",
        title: "AI-Generated Pixel Art Goes Viral",
        desc: "Artist combines Midjourney with retro aesthetics",
        time: "30 minutes ago",
      },
      {
        icon: "🎯",
        title: "UI Trend Alert: Brutalist Design Returns",
        desc: "Bold, raw interfaces making a comeback",
        time: "2 hours ago",
      },
      {
        icon: "✨",
        title: "CSS Animation Masterclass Released",
        desc: "Create smooth, performant web animations",
        time: "4 hours ago",
      },
    ],
    gaming: [
      {
        icon: "🕹️",
        title: "Lost NES Prototype Discovered",
        desc: "Unreleased game from 1989 found in storage unit",
        time: "1 hour ago",
      },
      {
        icon: "⚡",
        title: "Speed Runner Breaks 20-Year Record",
        desc: "Super Mario 64 completed in under 15 minutes",
        time: "3 hours ago",
      },
      {
        icon: "💾",
        title: "DOS Gaming on Modern Hardware",
        desc: "Complete guide to retro gaming in 2025",
        time: "5 hours ago",
      },
    ],
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
      alignItems: "center",
      gap: "20px",
      transition: "all 0.3s ease",
      boxShadow: "4px 4px 0 #2c2416",
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
    },
    feedTitle: {
      fontSize: "1.2em",
      marginBottom: "5px",
      color: "#2c2416",
    },
    feedDesc: {
      color: "#666",
      fontSize: "0.9em",
      marginBottom: "5px",
    },
    feedTime: {
      fontSize: "0.8em",
      color: "#999",
    },
    loading: {
      textAlign: "center",
      padding: "40px",
      fontSize: "1.2em",
      color: "#e74c3c",
    },
  };

  const LoadingDots = () => (
    <div style={styles.loading}>
      Loading<span>...</span>
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
          {/* Tabs */}
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
                  {activeTab.toUpperCase()} FEED
                </h3>
                <ul style={styles.subcategoryList}>
                  {categories[activeTab]?.map((category, index) => {
                    const subCatKebab = category
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/&/g, "");
                    return (
                      <li
                        key={index}
                        onClick={() =>
                          navigate(`/feeds/${activeTab}/${subCatKebab}`)
                        }
                        style={styles.subcategoryItem}
                        className="subcategory-item"
                      >
                        {category}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Feed Items */}
            <div style={styles.feedItems}>
              {loading[activeTab] ? (
                <LoadingDots />
              ) : (
                feedItems[activeTab]?.map((item, index) => (
                  <div
                    key={index}
                    style={styles.feedItem}
                    className="feed-item"
                  >
                    <div style={styles.feedIcon}>{item.icon}</div>
                    <div style={styles.feedContent}>
                      <h4 style={styles.feedTitle}>{item.title}</h4>
                      <p style={styles.feedDesc}>{item.desc}</p>
                      <div style={styles.feedTime}>{item.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HappyTuesdayNewsFeed;
