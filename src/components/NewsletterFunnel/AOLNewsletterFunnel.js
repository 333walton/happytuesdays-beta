import React, { Component, createRef } from "react";
import Window from "../tools/Window";
import { WindowProgram, WindowAlert } from "packard-belle";
import buildMenu from "../../helpers/menuBuilder";
import cx from "classnames";
import "./AOLNewsletterFunnel.scss";

class AOLNewsletterFunnel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: 1,
      formData: {
        email: "",
        categories: {
          technology: {
            main: false,
            subcategories: {
              sub1: false,
              sub2: false,
              sub3: false,
              sub4: false,
              sub5: false,
              sub6: false,
            },
          },
          builders: {
            main: false,
            subcategories: {
              sub1: false,
              sub2: false,
              sub3: false,
              sub4: false,
              sub5: false,
              sub6: false,
            },
          },
          artDesign: {
            main: false,
            subcategories: {
              sub1: false,
              sub2: false,
              sub3: false,
              sub4: false,
              sub5: false,
              sub6: false,
            },
          },
          gaming: {
            main: false,
            subcategories: {
              sub1: false,
              sub2: false,
              sub3: false,
              sub4: false,
              sub5: false,
              sub6: false,
            },
          },
        },
        frequency: "weekly",
      },
      errors: {},
      displayAlert: false,
    };
  }

  // Email validation
  validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Check if at least one category is selected
  hasSelectedCategories = () => {
    return Object.values(this.state.formData.categories).some(
      (cat) => cat.main || Object.values(cat.subcategories).some((sub) => sub)
    );
  };

  // Handle main category selection
  handleMainCategoryChange = (category) => {
    const newFormData = { ...this.state.formData };
    const newCategories = { ...newFormData.categories };
    const isSelected = !newCategories[category].main;
    newCategories[category].main = isSelected;

    // Toggle all subcategories when main is selected/deselected
    Object.keys(newCategories[category].subcategories).forEach((sub) => {
      newCategories[category].subcategories[sub] = isSelected;
    });

    newFormData.categories = newCategories;
    this.setState({ formData: newFormData });
  };

  // Handle subcategory selection
  handleSubcategoryChange = (category, subcategory) => {
    const newFormData = { ...this.state.formData };
    const newCategories = { ...newFormData.categories };
    newCategories[category].subcategories[subcategory] =
      !newCategories[category].subcategories[subcategory];

    // Check if all subcategories are selected to update main
    const allSubsSelected = Object.values(
      newCategories[category].subcategories
    ).every((sub) => sub);
    newCategories[category].main = allSubsSelected;

    newFormData.categories = newCategories;
    this.setState({ formData: newFormData });
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

      // Validate categories
      if (!this.hasSelectedCategories()) {
        newErrors.categories = "Please select at least one category";
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
    this.setState({ currentStep: 4 }); // Show family icon

    // Show Clippy confirmation after brief delay
    setTimeout(() => {
      this.setState({ displayAlert: true });
    }, 500);
  };

  // Handle declining in step 1
  handleDecline = () => {
    if (this.props.onClose) {
      this.props.onClose(false);
    }
  };

  // Handle Clippy confirmation
  confirm = () => {
    console.log("Newsletter signup completed:", this.state.formData);
    this.setState({ displayAlert: false });

    if (this.props.onComplete) {
      this.props.onComplete(this.state.formData);
    }
    if (this.props.onClose) {
      this.props.onClose(true);
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
          {/* Step 1 & 3: Dial-up interface */}
          {(currentStep === 1 || currentStep === 3) && (
            <div className="dial-up-interface">
              <div className="dial-up-background">
                <img
                  src="/static/aol/dial_up_5.png"
                  alt="AOL Dial-up Interface"
                  className="dial-up-bg-image"
                />
                <img
                  src="/static/aol/logo_edit1.png"
                  alt="Happy Tuesdays Logo"
                  className="dial-up-bg-image-logo"
                />
              </div>

              {/* Three step boxes overlaid on dial-up interface */}
              <div className="step-boxes-overlay">
                <div className="step-box step-box-1">
                  {currentStep >= 1 && (
                    <img
                      src="/static/aol/dialup_pic11.png"
                      alt="AOL Figure 1"
                      className="aol-figure-image"
                    />
                  )}
                </div>
                <div className="step-box step-box-2">
                  {currentStep >= 2 && (
                    <img
                      src="/static/aol/dialup_pic22.png"
                      alt="AOL Figure 2"
                      className="aol-figure-image"
                    />
                  )}
                </div>
                <div className="step-box step-box-3">
                  {currentStep >= 3 && (
                    <img
                      src="/static/aol/logo3.png"
                      alt="AOL Figure 3"
                      className="aol-figure-image aol-figure-3"
                    />
                  )}
                  {currentStep >= 4 && <div className="family-icon">👨‍👩‍👧‍👦</div>}
                </div>
              </div>

              {/* Status text positioned below dial-up background */}
              <div className="status-text-container">
                {currentStep === 1 && (
                  <div className="status-text">Dialing...</div>
                )}
                {currentStep === 3 && (
                  <div className="status-text">
                    Step 3: Checking preferences...
                  </div>
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
                  src="/static/aol/logo_edit1.png"
                  alt="Happy Tuesdays Logo"
                  className="dial-up-bg-image-logo"
                />
              </div>

              {/* Progression boxes still visible */}
              <div className="step-boxes-overlay">
                <div className="step-box step-box-1">
                  <img
                    src="/static/aol/dialup_pic11.png"
                    alt="AOL Figure 1"
                    className="aol-figure-image"
                  />
                </div>
                <div className="step-box step-box-2">
                  <img
                    src="/static/aol/dialup_pic22.png"
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
                  src="" ///static/aol/channels_background.png
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
                      {/* AOL Today */}
                      <div
                        className={cx("channel-button", {
                          selected: formData.categories.technology.main,
                        })}
                        onClick={() =>
                          this.handleMainCategoryChange("technology")
                        }
                      >
                        <img
                          src="/static/aol/channels_aol_today_btn.png"
                          alt="AOL Today"
                          className="channel-btn-image"
                        />
                      </div>

                      {/* Computing */}
                      <div
                        className={cx("channel-button", {
                          selected: formData.categories.builders.main,
                        })}
                        onClick={() =>
                          this.handleMainCategoryChange("builders")
                        }
                      >
                        <img
                          src="/static/aol/channels_computing_btn.png"
                          alt="Computing"
                          className="channel-btn-image"
                        />
                      </div>

                      {/* Games */}
                      <div
                        className={cx("channel-button", {
                          selected: formData.categories.gaming.main,
                        })}
                        onClick={() => this.handleMainCategoryChange("gaming")}
                      >
                        <img
                          src="/static/aol/channels_games_btn.png"
                          alt="Games"
                          className="channel-btn-image"
                        />
                      </div>

                      {/* Entertainment */}
                      <div
                        className={cx("channel-button", {
                          selected: formData.categories.artDesign.main,
                        })}
                        onClick={() =>
                          this.handleMainCategoryChange("artDesign")
                        }
                      >
                        <img
                          src="/static/aol/channels_entertainment_btn.png"
                          alt="Entertainment"
                          className="channel-btn-image"
                        />
                      </div>

                      {/* News */}
                      <div
                        className={cx("channel-button", {
                          selected: formData.categories.technology.main,
                        })}
                        onClick={() =>
                          this.handleMainCategoryChange("technology")
                        }
                      >
                        <img
                          src="/static/aol/channels_news_btn.png"
                          alt="News"
                          className="channel-btn-image"
                        />
                      </div>

                      {/* Sports */}
                      <div
                        className={cx("channel-button", {
                          selected: formData.categories.builders.main,
                        })}
                        onClick={() =>
                          this.handleMainCategoryChange("builders")
                        }
                      >
                        <img
                          src="/static/aol/channels_sports_btn.png"
                          alt="Sports"
                          className="channel-btn-image"
                        />
                      </div>

                      {/* Travel */}
                      <div
                        className={cx("channel-button", {
                          selected: formData.categories.gaming.main,
                        })}
                        onClick={() => this.handleMainCategoryChange("gaming")}
                      >
                        <img
                          src="/static/aol/channels_travel_btn.png"
                          alt="Travel"
                          className="channel-btn-image"
                        />
                      </div>

                      {/* Shopping */}
                      <div
                        className={cx("channel-button", {
                          selected: formData.categories.artDesign.main,
                        })}
                        onClick={() =>
                          this.handleMainCategoryChange("artDesign")
                        }
                      >
                        <img
                          src="/static/aol/channels_shopping_btn.png"
                          alt="Shopping"
                          className="channel-btn-image"
                        />
                      </div>

                      {/* Families */}
                      <div
                        className={cx("channel-button", {
                          selected: formData.categories.technology.main,
                        })}
                        onClick={() =>
                          this.handleMainCategoryChange("technology")
                        }
                      >
                        <img
                          src="/static/aol/channels_families_btn.png"
                          alt="Families"
                          className="channel-btn-image"
                        />
                      </div>

                      {/* Kids Only */}
                      <div
                        className={cx("channel-button", {
                          selected: formData.categories.builders.main,
                        })}
                        onClick={() =>
                          this.handleMainCategoryChange("builders")
                        }
                      >
                        <img
                          src="/static/aol/channels_kids_only_btn.png"
                          alt="Kids Only"
                          className="channel-btn-image"
                        />
                      </div>

                      {/* Health */}
                      <div
                        className={cx("channel-button", {
                          selected: formData.categories.gaming.main,
                        })}
                        onClick={() => this.handleMainCategoryChange("gaming")}
                      >
                        <img
                          src="/static/aol/channels_health_btn.png"
                          alt="Health"
                          className="channel-btn-image"
                        />
                      </div>

                      {/* Personal Finance */}
                      <div
                        className={cx("channel-button", {
                          selected: formData.categories.artDesign.main,
                        })}
                        onClick={() =>
                          this.handleMainCategoryChange("artDesign")
                        }
                      >
                        <img
                          src="/static/aol/channels_personal_finance_btn.png"
                          alt="Personal Finance"
                          className="channel-btn-image"
                        />
                      </div>
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
