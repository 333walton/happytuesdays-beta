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

    const commonProps = {
      title: "Welcome to Happy Tuesdays!",
      zIndex: 1000,
      onClose: () => this.setState({ displayAlert: false }),
    };

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
      >
        <div className="aol-funnel-container">
          {/* Step 1 & 3: Dial-up interface */}
          {(currentStep === 1 || currentStep === 3) && (
            <div className="dial-up-interface">
              <div className="dial-up-background">
                <img
                  src="/static/aol/dial_up1.png"
                  alt="AOL Dial-up Interface"
                  className="dial-up-bg-image"
                />
              </div>

              {/* Three step boxes overlaid on dial-up interface */}
              <div className="step-boxes-overlay">
                <div className="step-box">
                  {currentStep >= 1 && (
                    <div className="aol-figure-small">AOL</div>
                  )}
                </div>
                <div className="step-box">
                  {currentStep >= 2 && (
                    <div className="aol-figure-small">AOL</div>
                  )}
                </div>
                <div className="step-box">
                  {currentStep >= 3 && (
                    <div className="happy-tuesdays-logo">
                      Happy
                      <br />
                      Tuesdays
                    </div>
                  )}
                  {currentStep >= 4 && <div className="family-icon">👨‍👩‍👧‍👦</div>}
                </div>
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
                          className="pb-button"
                        >
                          Yes
                        </button>
                        <button
                          onClick={this.handleDecline}
                          className="pb-button"
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
                          className="pb-button"
                        >
                          Back
                        </button>
                        <button
                          onClick={this.handleConfirm}
                          className="pb-button"
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
              <div className="channels-background">
                <img
                  src="/static/aol/channels_background.png"
                  alt="AOL Channels Background"
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
                    <p className="channels-header">Choose Your Channels:</p>
                    {errors.categories && (
                      <span className="error-message categories-error">
                        {errors.categories}
                      </span>
                    )}

                    <div className="channel-buttons-grid">
                      {/* Technology Channel */}
                      <div className="channel-item">
                        <div
                          className={cx("channel-button", {
                            selected: formData.categories.technology.main,
                          })}
                          onClick={() =>
                            this.handleMainCategoryChange("technology")
                          }
                        >
                          <img
                            src="/static/aol/channels_computing_btn.png"
                            alt="Technology"
                            className="channel-btn-image"
                          />
                        </div>
                        <div className="subcategories-list">
                          {Object.keys(
                            formData.categories.technology.subcategories
                          ).map((sub) => (
                            <label key={sub} className="subcategory-item">
                              <input
                                type="checkbox"
                                checked={
                                  formData.categories.technology.subcategories[
                                    sub
                                  ]
                                }
                                onChange={() =>
                                  this.handleSubcategoryChange(
                                    "technology",
                                    sub
                                  )
                                }
                              />
                              Tech {sub}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Builders Channel */}
                      <div className="channel-item">
                        <div
                          className={cx("channel-button", {
                            selected: formData.categories.builders.main,
                          })}
                          onClick={() =>
                            this.handleMainCategoryChange("builders")
                          }
                        >
                          <img
                            src="/static/aol/channels_workplace_btn.png"
                            alt="For Builders"
                            className="channel-btn-image"
                          />
                        </div>
                        <div className="subcategories-list">
                          {Object.keys(
                            formData.categories.builders.subcategories
                          ).map((sub) => (
                            <label key={sub} className="subcategory-item">
                              <input
                                type="checkbox"
                                checked={
                                  formData.categories.builders.subcategories[
                                    sub
                                  ]
                                }
                                onChange={() =>
                                  this.handleSubcategoryChange("builders", sub)
                                }
                              />
                              Builder {sub}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Art & Design Channel */}
                      <div className="channel-item">
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
                            alt="Art & Design"
                            className="channel-btn-image"
                          />
                        </div>
                        <div className="subcategories-list">
                          {Object.keys(
                            formData.categories.artDesign.subcategories
                          ).map((sub) => (
                            <label key={sub} className="subcategory-item">
                              <input
                                type="checkbox"
                                checked={
                                  formData.categories.artDesign.subcategories[
                                    sub
                                  ]
                                }
                                onChange={() =>
                                  this.handleSubcategoryChange("artDesign", sub)
                                }
                              />
                              Art {sub}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Gaming Channel */}
                      <div className="channel-item">
                        <div
                          className={cx("channel-button", {
                            selected: formData.categories.gaming.main,
                          })}
                          onClick={() =>
                            this.handleMainCategoryChange("gaming")
                          }
                        >
                          <img
                            src="/static/aol/channels_games_btn.png"
                            alt="Gaming"
                            className="channel-btn-image"
                          />
                        </div>
                        <div className="subcategories-list">
                          {Object.keys(
                            formData.categories.gaming.subcategories
                          ).map((sub) => (
                            <label key={sub} className="subcategory-item">
                              <input
                                type="checkbox"
                                checked={
                                  formData.categories.gaming.subcategories[sub]
                                }
                                onChange={() =>
                                  this.handleSubcategoryChange("gaming", sub)
                                }
                              />
                              Gaming {sub}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="channels-navigation">
                    <button
                      onClick={this.handlePreviousStep}
                      className="pb-button"
                    >
                      ← Back to Dial-up
                    </button>
                    <button onClick={this.handleNextStep} className="pb-button">
                      Continue to Frequency
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Clippy confirmation alert */}
          {this.state.displayAlert && !this.props.data?.disableAlert && (
            <WindowAlert
              {...commonProps}
              onOK={this.confirm}
              onCancel={commonProps.onClose}
              className="AOLNewsletterFunnel--alert Window--active"
            >
              <div className="clippy-message">
                <div className="clippy-character">📎</div>
                <div className="clippy-text">
                  <p>
                    <strong>Great choice!</strong>
                  </p>
                  <p>
                    You've successfully joined the Happy Tuesdays newsletter!
                  </p>
                  <p>Welcome to the family! 🎉</p>
                </div>
              </div>
              <div className="w98-button-container">
                <button className="w98-button" onClick={this.confirm}>
                  OK
                </button>
                <button className="w98-button" onClick={commonProps.onClose}>
                  Cancel
                </button>
              </div>
            </WindowAlert>
          )}
        </div>
      </Window>
    );
  }
}

export default AOLNewsletterFunnel;
