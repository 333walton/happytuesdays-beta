import React, { Component, createRef } from "react";
import Window from "../tools/Window";
import { WindowProgram, WindowAlert } from "packard-belle";
import buildMenu from "../../helpers/menuBuilder";
import cx from "classnames";
import * as icons from "../../icons"; //
import "./AOLNewsletterFunnel.scss";

class AOLNewsletterFunnel extends Component {
  constructor(props) {
    super(props);

    // Define all available channels with their properties
    this.channels = [
      {
        id: "aol_today",
        name: "AOL Today",
        image: "/static/aol/channels_aol_today_btn.png",
      },
      {
        id: "computing",
        name: "Computing",
        image: "/static/aol/channels_computing_btn.png",
      },
      {
        id: "games",
        name: "Games",
        image: "/static/aol/channels_games_btn.png",
      },
      {
        id: "entertainment",
        name: "Entertainment",
        image: "/static/aol/channels_entertainment_btn.png",
      },
      { id: "news", name: "News", image: "/static/aol/channels_news_btn.png" },
      {
        id: "sports",
        name: "Sports",
        image: "/static/aol/channels_sports_btn.png",
      },
      {
        id: "travel",
        name: "Travel",
        image: "/static/aol/channels_travel_btn.png",
      },
      {
        id: "shopping",
        name: "Shopping",
        image: "/static/aol/channels_shopping_btn.png",
      },
      {
        id: "families",
        name: "Families",
        image: "/static/aol/channels_families_btn.png",
      },
      {
        id: "kids_only",
        name: "Kids Only",
        image: "/static/aol/channels_kids_only_btn.png",
      },
      {
        id: "health",
        name: "Health",
        image: "/static/aol/channels_health_btn.png",
      },
      {
        id: "personal_finance",
        name: "Personal Finance",
        image: "/static/aol/channels_personal_finance_btn.png",
      },
      {
        id: "influence",
        name: "Influence",
        image: "/static/aol/new_channels_influence_btn.png",
      },
      {
        id: "workplace",
        name: "Workplace",
        image: "/static/aol/new_channels_workplace_btn.png",
      },
      {
        id: "research_learn",
        name: "Research & Learn",
        image: "/static/aol/new_channels_research_and_learn_btn.png",
      },
      {
        id: "lifestyles",
        name: "Lifestyles",
        image: "/static/aol/new_channels_lifestyles_btn.png",
      },
      {
        id: "international",
        name: "International",
        image: "/static/aol/new_channels_international_btn.png",
      },
      {
        id: "local",
        name: "Local",
        image: "/static/aol/new_channels_local_btn.png",
      },
      // Using placeholder images for the last two to reach 20 total
      {
        id: "music",
        name: "Music",
        image: "/static/aol/channels_news_btn.png",
      },
      {
        id: "food",
        name: "Food & Dining",
        image: "/static/aol/channels_news_btn.png",
      },
    ];

    this.state = {
      currentStep: 1,
      formData: {
        email: "",
        // Initialize selectedChannels as an object with all channels set to false
        selectedChannels: this.channels.reduce((acc, channel) => {
          acc[channel.id] = false;
          return acc;
        }, {}),
        frequency: "weekly",
      },
      errors: {},
    };
  }

  // Email validation
  validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Check if at least one channel is selected
  hasSelectedChannels = () => {
    return Object.values(this.state.formData.selectedChannels).some(
      (isSelected) => isSelected
    );
  };

  // Handle individual channel selection
  handleChannelToggle = (channelId) => {
    this.setState((prevState) => ({
      formData: {
        ...prevState.formData,
        selectedChannels: {
          ...prevState.formData.selectedChannels,
          [channelId]: !prevState.formData.selectedChannels[channelId],
        },
      },
    }));
  };

  // Get list of selected channel names for summary
  getSelectedChannelNames = () => {
    return this.channels
      .filter((channel) => this.state.formData.selectedChannels[channel.id])
      .map((channel) => channel.name);
  };

  // Handle input changes
  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      formData: {
        ...this.state.formData,
        [name]: value,
      },
    });
  };

  // Handle step progression
  handleNextStep = () => {
    const { currentStep, formData } = this.state;

    if (currentStep === 1) {
      this.setState({ currentStep: 2 });
      return;
    }

    if (currentStep === 2) {
      const newErrors = {};

      // Validate email
      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!this.validateEmail(formData.email)) {
        newErrors.email = "Please enter a valid email";
      }

      // Validate channels
      if (!this.hasSelectedChannels()) {
        newErrors.categories = "Please select at least one channel";
      }

      if (Object.keys(newErrors).length > 0) {
        this.setState({ errors: newErrors });
        return;
      }

      this.setState({ errors: {}, currentStep: 3 });
      return;
    }
  };

  // Handle going back
  handlePreviousStep = () => {
    this.setState({
      currentStep: this.state.currentStep - 1,
      errors: {},
    });
  };

  // Handle final confirmation
  handleConfirm = () => {
    this.setState({ currentStep: 4 }); // Show recap screen
  };

  // Handle OK from recap screen
  handleRecapOk = () => {
    // Save the form data
    console.log("Newsletter signup completed:", this.state.formData);

    // Call the completion handler
    if (this.props.onComplete) {
      this.props.onComplete(this.state.formData);
    }

    // Close the window
    if (this.props.onClose) {
      this.props.onClose(true);
    }
  };

  // Handle declining in step 1
  handleDecline = () => {
    if (this.props.onClose) {
      this.props.onClose(false);
    }
  };

  render() {
    const { currentStep, formData, errors } = this.state;

    const filteredMenuOptions = buildMenu(this.props).filter(
      (option) =>
        option.title.toLowerCase() !== "file" &&
        option.title.toLowerCase() !== "help"
    );

    return (
      <Window
        {...this.props}
        title="Happy Tuesdays Newsletter"
        Component={WindowProgram}
        initialWidth={480}
        initialHeight={420}
        resizable={false}
        onMaximize={null}
        menuOptions={filteredMenuOptions}
        className={cx("AOLNewsletterFunnel", this.props.className)}
        forceActive={true}
        minimized={false}
      >
        <div className="aol-funnel-container">
          {/* Step 1, 3 & 4: Dial-up interface */}
          {(currentStep === 1 || currentStep === 3 || currentStep === 4) && (
            <div className="dial-up-interface">
              <div className="dial-up-background">
                <img
                  src="/static/aol/dial_up_5.png"
                  alt="AOL Dial-up Interface"
                  className="dial-up-bg-image"
                />
                <img
                  src="/static/aol/logo_edit3.png"
                  alt="Happy Tuesdays Logo"
                  className="dial-up-bg-image-logo"
                />
              </div>

              {/* Three step boxes overlaid on dial-up interface */}
              <div className="step-boxes-overlay">
                <div className="step-box step-box-1">
                  {currentStep >= 1 && (
                    <img
                      src="/static/aol/dialup_pic1.png"
                      alt="AOL Figure 1"
                      className="aol-figure-image"
                    />
                  )}
                </div>
                <div className="step-box step-box-2">
                  {currentStep >= 2 && (
                    <img
                      src="/static/aol/dialup_pic2.png"
                      alt="AOL Figure 2"
                      className="aol-figure-image aol-figure-2"
                    />
                  )}
                </div>
                <div className="step-box step-box-3">
                  {currentStep >= 3 && (
                    <img
                      src="" ///static/aol/logo_pic3.png
                      alt="AOL Figure 3"
                      className="aol-figure-image aol-figure-3"
                    />
                  )}
                </div>
              </div>

              {/* Status text positioned below dial-up background */}
              <div className="status-text-container">
                {currentStep === 1 && (
                  <div className="status-text">Dialing...</div>
                )}
                {currentStep === 3 && (
                  <div className="status-text">Checking preferences...</div>
                )}
                {currentStep === 4 && (
                  <div className="status-text">Confirming subscription...</div>
                )}
              </div>

              {/* Content overlay */}
              <div className="dial-up-content-overlay">
                {currentStep === 1 && (
                  <div className="step-content">
                    <div className="dial-up-prompt">
                      <p>
                        Would you like to join the Happy Tuesdays mailing list?
                      </p>
                      <div className="button-group">
                        <button
                          onClick={this.handleNextStep}
                          className="aol-button aol-button-primary"
                        >
                          Yes
                        </button>
                        <button
                          onClick={this.handleDecline}
                          className="aol-button aol-button-secondary"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="step-content">
                    <div className="dial-up-prompt">
                      <p>Select your preferred email frequency:</p>

                      <div className="frequency-options">
                        <label>
                          <input
                            type="radio"
                            name="frequency"
                            value="weekly"
                            checked={formData.frequency === "weekly"}
                            onChange={this.handleInputChange}
                          />
                          Weekly
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="frequency"
                            value="biweekly"
                            checked={formData.frequency === "biweekly"}
                            onChange={this.handleInputChange}
                          />
                          Bi-weekly
                        </label>
                      </div>

                      <div className="button-group">
                        <button
                          onClick={this.handlePreviousStep}
                          className="aol-button aol-button-secondary"
                        >
                          Back
                        </button>
                        <button
                          onClick={this.handleConfirm}
                          className="aol-button aol-button-primary"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="step-content">
                    <div className="dial-up-prompt recap-prompt">
                      <p className="confirmation-text">
                        Welcome to the Happy Tuesdays community! Your
                        subscription has been confirmed.
                      </p>
                      <h3>Subscription Summary</h3>
                      <div className="recap-section">
                        <p>
                          <strong>Email:</strong> {formData.email}
                        </p>
                        <p>
                          <strong>Frequency:</strong>{" "}
                          {formData.frequency === "weekly"
                            ? "Weekly"
                            : "Bi-weekly"}
                        </p>
                        <p>
                          <strong>Selected Channels:</strong>
                        </p>
                        <ul className="selected-channels">
                          {this.getSelectedChannelNames().map(
                            (channelName, index) => (
                              <li key={index}>{channelName}</li>
                            )
                          )}
                        </ul>
                      </div>
                      <div className="button-group">
                        <button
                          onClick={this.handleRecapOk}
                          className="aol-button aol-button-primary"
                        >
                          OK
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Channels interface */}
          {currentStep === 2 && (
            <div className="channels-interface">
              {/* Base dial-up background still visible */}
              <div className="dial-up-background">
                <img
                  src="/static/aol/dial_up_5.png"
                  alt="AOL Dial-up Interface"
                  className="dial-up-bg-image"
                />
                <img
                  src="/static/aol/logo_edit3.png"
                  alt="Happy Tuesdays Logo"
                  className="dial-up-bg-image-logo"
                />
              </div>

              {/* Progression boxes still visible */}
              <div className="step-boxes-overlay">
                <div className="step-box step-box-1">
                  <img
                    src="/static/aol/dialup_pic1.png"
                    alt="AOL Figure 1"
                    className="aol-figure-image"
                  />
                </div>
                <div className="step-box step-box-2">
                  <img
                    src="/static/aol/dialup_pic2.png"
                    alt="AOL Figure 2"
                    className="aol-figure-image"
                  />
                </div>
                <div className="step-box step-box-3">{/* Empty for now */}</div>
              </div>

              {/* Status text positioned below dial-up background */}
              <div className="status-text-container">
                <div className="status-text">Connecting...</div>
              </div>

              {/* Temporary channels background overlay */}
              <div className="channels-background">
                <img
                  src="" //static/aol/channels_background.png
                  alt="" //AOL Channels Background
                  className="channels-bg-image"
                />
              </div>

              {/* Channels content overlay */}
              <div className="channels-content-overlay">
                <div className="step-content channels-content">
                  <div className="form-group email-section">
                    <label htmlFor="email" className="w98-label">
                      Email Address:
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={this.handleInputChange}
                      className={cx("w98-input", { error: errors.email })}
                      placeholder="yourname@aol.com"
                      required
                    />
                    {errors.email && (
                      <span className="error-message">{errors.email}</span>
                    )}
                  </div>

                  <div className="channels-selection">
                    <div className="channels-header">
                      Welcome to AOL Channels!
                    </div>
                    <div className="channels-subheader">
                      Choose your interests:
                    </div>
                    {errors.categories && (
                      <span className="error-message categories-error">
                        {errors.categories}
                      </span>
                    )}

                    <div className="channel-buttons-grid">
                      {this.channels.map((channel) => (
                        <div
                          key={channel.id}
                          className={cx("channel-button", {
                            selected: formData.selectedChannels[channel.id],
                          })}
                          onClick={() => this.handleChannelToggle(channel.id)}
                        >
                          <img
                            src={channel.image}
                            alt={channel.name}
                            className="channel-btn-image"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="channels-navigation">
                    <button
                      onClick={this.handlePreviousStep}
                      className="aol-button aol-button-back"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={this.handleNextStep}
                      className="aol-button aol-button-continue"
                    >
                      Continue →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Window>
    );
  }
}

export default AOLNewsletterFunnel;
