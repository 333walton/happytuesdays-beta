import React, { Component } from "react";
import Window from "../tools/Window";
import { WindowProgram } from "packard-belle";
import buildMenu from "../../helpers/menuBuilder";
import cx from "classnames";
import "./_newsletterFunnel.scss";

class NewsletterFunnel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: 1,
      email: "",
      selectedCategories: [],
      frequency: "weekly",
      isSubmitting: false,
      showSuccess: false,
    };
  }

  // Email validation
  validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Navigation handlers
  handleNext = () => {
    const { currentStep, email, selectedCategories } = this.state;

    if (currentStep === 1) {
      this.setState({ currentStep: 2 });
    } else if (currentStep === 2) {
      if (!this.validateEmail(email)) {
        alert("Please enter a valid email address");
        return;
      }
      if (selectedCategories.length === 0) {
        alert("Please select at least one category");
        return;
      }
      this.setState({ currentStep: 3 });
    }
  };

  handleBack = () => {
    this.setState({ currentStep: this.state.currentStep - 1 });
  };

  // Form handlers
  handleEmailChange = (e) => {
    this.setState({ email: e.target.value });
  };

  handleCategoryToggle = (category) => {
    const { selectedCategories } = this.state;
    if (selectedCategories.includes(category)) {
      this.setState({
        selectedCategories: selectedCategories.filter((c) => c !== category),
      });
    } else {
      this.setState({
        selectedCategories: [...selectedCategories, category],
      });
    }
  };

  handleFrequencyChange = (e) => {
    this.setState({ frequency: e.target.value });
  };

  handleSubmit = async () => {
    this.setState({ isSubmitting: true });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Newsletter signup:", {
      email: this.state.email,
      categories: this.state.selectedCategories,
      frequency: this.state.frequency,
    });

    this.setState({
      isSubmitting: false,
      showSuccess: true,
    });

    // Close after 3 seconds
    setTimeout(() => {
      if (this.props.onClose) {
        this.props.onClose(this.props);
      }
    }, 3000);
  };

  // AOL Channel categories with their button assets
  getChannelCategories = () => [
    { id: "arts", label: "Arts & Entertainment", icon: "entertainment" },
    { id: "autos", label: "Autos", icon: "autos" },
    { id: "computing", label: "Computing", icon: "computing" },
    { id: "games", label: "Games", icon: "games" },
    { id: "health", label: "Health & Fitness", icon: "health" },
    { id: "house", label: "House & Home", icon: "house_home" },
    { id: "influence", label: "Influence", icon: "influence" },
    { id: "interests", label: "Interests & Hobbies", icon: "interests" },
    { id: "international", label: "International", icon: "international" },
    { id: "kids", label: "Kids Only", icon: "kids_only" },
    { id: "lifestyles", label: "Lifestyles", icon: "lifestyles" },
    { id: "local", label: "Local", icon: "local" },
    { id: "music", label: "Music", icon: "music_mtv" },
    { id: "news", label: "News", icon: "news" },
    { id: "personal", label: "Personal Finance", icon: "personal_finance" },
    { id: "research", label: "Research & Learn", icon: "research_learn" },
    { id: "shopping", label: "Shopping", icon: "shopping" },
    { id: "sports", label: "Sports", icon: "sports" },
    { id: "travel", label: "Travel", icon: "travel" },
    { id: "women", label: "Women", icon: "women" },
    { id: "workplace", label: "WorkPlace", icon: "workplace" },
  ];

  renderStep1 = () => {
    return (
      <div className="newsletter-step step-1">
        <h2 className="aol-heading">Welcome to Happy Tuesdays Newsletter!</h2>
        <p className="aol-text">
          Stay connected with the latest updates, exclusive content, and special
          offers delivered right to your inbox. Join our community today!
        </p>
        <div className="benefits-list">
          <div className="benefit-item">
            <span className="benefit-icon">📧</span>
            <span>Curated content based on your interests</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🎯</span>
            <span>Early access to new features and tools</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🎨</span>
            <span>Weekly creative inspiration and resources</span>
          </div>
        </div>
        <div className="button-container">
          <button className="aol-button primary" onClick={this.handleNext}>
            Get Started
          </button>
        </div>
      </div>
    );
  };

  renderStep2 = () => {
    const categories = this.getChannelCategories();
    const { email, selectedCategories } = this.state;

    return (
      <div className="newsletter-step step-2">
        <h2 className="aol-heading">Choose Your Interests</h2>

        <div className="email-section">
          <label className="aol-label">Email Address:</label>
          <input
            type="email"
            value={email}
            onChange={this.handleEmailChange}
            placeholder="your@email.com"
            className="aol-input"
          />
        </div>

        <div className="categories-section">
          <p className="aol-text">Select the topics you're interested in:</p>
          <div className="channel-grid">
            {categories.map((category) => (
              <button
                key={category.id}
                className={cx("channel-button", {
                  selected: selectedCategories.includes(category.id),
                })}
                onClick={() => this.handleCategoryToggle(category.id)}
                style={{
                  backgroundImage: `url(/static/aol/${category.icon}.png)`,
                }}
              >
                <span className="sr-only">{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="button-container">
          <button className="aol-button secondary" onClick={this.handleBack}>
            Back
          </button>
          <button
            className="aol-button primary"
            onClick={this.handleNext}
            disabled={!email || selectedCategories.length === 0}
          >
            Continue
          </button>
        </div>
      </div>
    );
  };

  renderStep3 = () => {
    const { frequency, isSubmitting, showSuccess } = this.state;

    if (showSuccess) {
      return (
        <div className="newsletter-step step-3 success">
          <h2 className="aol-heading">Welcome Aboard!</h2>
          <div className="success-message">
            <span className="success-icon">✓</span>
            <p>You've successfully joined the Happy Tuesdays newsletter!</p>
            <p className="small-text">
              Check your inbox for a confirmation email.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="newsletter-step step-3">
        <h2 className="aol-heading">Almost Done!</h2>

        <div className="frequency-section">
          <label className="aol-label">
            How often would you like to hear from us?
          </label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                value="daily"
                checked={frequency === "daily"}
                onChange={this.handleFrequencyChange}
              />
              <span>Daily Digest</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                value="weekly"
                checked={frequency === "weekly"}
                onChange={this.handleFrequencyChange}
              />
              <span>Weekly Roundup (Recommended)</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                value="monthly"
                checked={frequency === "monthly"}
                onChange={this.handleFrequencyChange}
              />
              <span>Monthly Highlights</span>
            </label>
          </div>
        </div>

        <div className="summary-section">
          <h3>Your Selections:</h3>
          <p>
            <strong>Email:</strong> {this.state.email}
          </p>
          <p>
            <strong>Categories:</strong> {this.state.selectedCategories.length}{" "}
            selected
          </p>
        </div>

        <div className="button-container">
          <button
            className="aol-button secondary"
            onClick={this.handleBack}
            disabled={isSubmitting}
          >
            Back
          </button>
          <button
            className="aol-button primary"
            onClick={this.handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing up..." : "Complete Signup"}
          </button>
        </div>
      </div>
    );
  };

  render() {
    const { currentStep } = this.state;

    const filteredMenuOptions = buildMenu(this.props).filter(
      (option) =>
        option.title.toLowerCase() !== "file" &&
        option.title.toLowerCase() !== "help"
    );

    return (
      <div className="newsletter-funnel-wrapper">
        {/* AOL Frame - Always Visible */}
        <div className="aol-frame">
          <img
            src="/static/aol/dial_up1.png"
            alt="AOL Frame"
            className="frame-background"
          />

          {/* Progressive AOL Figures */}
          <div className="figure-boxes">
            <div
              className={cx("figure-box box-1", { visible: currentStep >= 1 })}
            >
              <img src="/static/aol/dialup_pic1.png" alt="AOL Figure 1" />
            </div>
            <div
              className={cx("figure-box box-2", { visible: currentStep >= 2 })}
            >
              <img src="/static/aol/dialup_pic2.png" alt="AOL Figure 2" />
            </div>
            <div
              className={cx("figure-box box-3", { visible: currentStep >= 3 })}
            >
              <img src="/static/aol/dialup_pic3.png" alt="AOL Figure 3" />
            </div>
          </div>
        </div>

        {/* Step Window */}
        <Window
          {...this.props}
          title={`Newsletter Signup - Step ${currentStep} of 3`}
          Component={WindowProgram}
          initialWidth={578}
          initialHeight={400}
          resizable={false}
          onMaximize={null}
          menuOptions={filteredMenuOptions}
          className={cx(
            "NewsletterFunnel",
            `step-${currentStep}`,
            this.props.className
          )}
        >
          <div
            className={cx("newsletter-content", {
              "with-channels-bg": currentStep === 2,
            })}
          >
            {currentStep === 2 && (
              <div
                className="channels-background"
                style={{
                  backgroundImage: "url(/static/aol/channels_background.png)",
                }}
              />
            )}

            {currentStep === 1 && this.renderStep1()}
            {currentStep === 2 && this.renderStep2()}
            {currentStep === 3 && this.renderStep3()}
          </div>
        </Window>
      </div>
    );
  }
}

export default NewsletterFunnel;
