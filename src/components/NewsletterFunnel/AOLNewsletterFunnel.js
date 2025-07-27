import React, { useState } from "react";
import "./AOLNewsletterFunnel.scss";

const AOLNewsletterFunnel = ({ onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
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
    frequency: "weekly", // default
  });
  const [errors, setErrors] = useState({});

  // Email validation
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Check if at least one category is selected
  const hasSelectedCategories = () => {
    return Object.values(formData.categories).some(
      (cat) => cat.main || Object.values(cat.subcategories).some((sub) => sub)
    );
  };

  // Handle main category selection
  const handleMainCategoryChange = (category) => {
    const newCategories = { ...formData.categories };
    const isSelected = !newCategories[category].main;
    newCategories[category].main = isSelected;

    // Toggle all subcategories when main is selected/deselected
    Object.keys(newCategories[category].subcategories).forEach((sub) => {
      newCategories[category].subcategories[sub] = isSelected;
    });

    setFormData({ ...formData, categories: newCategories });
  };

  // Handle subcategory selection
  const handleSubcategoryChange = (category, subcategory) => {
    const newCategories = { ...formData.categories };
    newCategories[category].subcategories[subcategory] =
      !newCategories[category].subcategories[subcategory];

    // Check if all subcategories are selected to update main
    const allSubsSelected = Object.values(
      newCategories[category].subcategories
    ).every((sub) => sub);
    newCategories[category].main = allSubsSelected;

    setFormData({ ...formData, categories: newCategories });
  };

  // Handle step progression
  const handleNextStep = () => {
    const newErrors = {};

    if (currentStep === 2) {
      // Validate email
      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!validateEmail(formData.email)) {
        newErrors.email = "Please enter a valid email";
      }

      // Validate categories
      if (!hasSelectedCategories()) {
        newErrors.categories = "Please select at least one category";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }

    setErrors({});
    setCurrentStep(currentStep + 1);
  };

  // Handle final confirmation
  const handleConfirm = () => {
    // Show confirmation message
    const selectedCategories = [];
    Object.entries(formData.categories).forEach(([cat, data]) => {
      if (data.main) {
        selectedCategories.push(cat);
      } else {
        Object.entries(data.subcategories).forEach(([sub, selected]) => {
          if (selected) {
            selectedCategories.push(`${cat} - ${sub}`);
          }
        });
      }
    });

    const message =
      `You've signed up for Happy Tuesdays!\n\n` +
      `Email: ${formData.email}\n` +
      `Categories: ${selectedCategories.join(", ")}\n` +
      `Frequency: ${formData.frequency}`;

    alert(message);

    // Mark as complete and close
    if (onComplete) {
      onComplete(formData);
    }
    if (onClose) {
      onClose(true); // true indicates successful completion
    }
  };

  // Handle declining in step 1
  const handleDecline = () => {
    if (onClose) {
      onClose(false); // false indicates user declined
    }
  };

  return (
    <div className="aol-newsletter-funnel-overlay">
      <div className="aol-newsletter-funnel window">
        <div className="title-bar">
          <div className="title-bar-text">Happy Tuesdays Newsletter</div>
          <div className="title-bar-controls">
            <button
              className="close-button"
              onClick={() => onClose(false)}
              aria-label="Close"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        </div>

        <div className="funnel-header">
          <div className="step-indicators">
            <div className={`step-box ${currentStep >= 1 ? "active" : ""}`}>
              {currentStep >= 1 && <div className="aol-figure" />}
            </div>
            <div className={`step-box ${currentStep >= 2 ? "active" : ""}`}>
              {currentStep >= 2 && <div className="aol-figure" />}
            </div>
            <div className={`step-box ${currentStep >= 3 ? "active" : ""}`}>
              {currentStep >= 3 && (
                <>
                  <div className="happy-tuesdays-logo" />
                  {currentStep > 3 && <div className="family-icon" />}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="window-body funnel-content">
          {currentStep === 1 && (
            <div className="step-1">
              <h2>Join Happy Tuesdays!</h2>
              <p>
                Would you like to receive our newsletter with the latest
                updates?
              </p>
              <div className="button-group">
                <button onClick={handleNextStep} className="btn">
                  Yes, Sign Me Up!
                </button>
                <button onClick={handleDecline} className="btn">
                  No Thanks
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="step-2 channels-page">
              <h2>Choose Your Interests</h2>

              <div className="email-section">
                <label>Email Address:</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={errors.email ? "error" : ""}
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              <div className="categories-section">
                <h3>Select Your Categories:</h3>
                {errors.categories && (
                  <span className="error-message">{errors.categories}</span>
                )}

                <div className="categories-grid">
                  {/* Technology */}
                  <div className="category-group">
                    <label className="main-category">
                      <input
                        type="checkbox"
                        checked={formData.categories.technology.main}
                        onChange={() => handleMainCategoryChange("technology")}
                      />
                      Technology
                    </label>
                    <div className="subcategories">
                      {Object.keys(
                        formData.categories.technology.subcategories
                      ).map((sub) => (
                        <label key={sub} className="subcategory">
                          <input
                            type="checkbox"
                            checked={
                              formData.categories.technology.subcategories[sub]
                            }
                            onChange={() =>
                              handleSubcategoryChange("technology", sub)
                            }
                          />
                          Tech {sub}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* For Builders */}
                  <div className="category-group">
                    <label className="main-category">
                      <input
                        type="checkbox"
                        checked={formData.categories.builders.main}
                        onChange={() => handleMainCategoryChange("builders")}
                      />
                      For Builders
                    </label>
                    <div className="subcategories">
                      {Object.keys(
                        formData.categories.builders.subcategories
                      ).map((sub) => (
                        <label key={sub} className="subcategory">
                          <input
                            type="checkbox"
                            checked={
                              formData.categories.builders.subcategories[sub]
                            }
                            onChange={() =>
                              handleSubcategoryChange("builders", sub)
                            }
                          />
                          Builder {sub}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Art & Design */}
                  <div className="category-group">
                    <label className="main-category">
                      <input
                        type="checkbox"
                        checked={formData.categories.artDesign.main}
                        onChange={() => handleMainCategoryChange("artDesign")}
                      />
                      Art & Design
                    </label>
                    <div className="subcategories">
                      {Object.keys(
                        formData.categories.artDesign.subcategories
                      ).map((sub) => (
                        <label key={sub} className="subcategory">
                          <input
                            type="checkbox"
                            checked={
                              formData.categories.artDesign.subcategories[sub]
                            }
                            onChange={() =>
                              handleSubcategoryChange("artDesign", sub)
                            }
                          />
                          Art {sub}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Gaming */}
                  <div className="category-group">
                    <label className="main-category">
                      <input
                        type="checkbox"
                        checked={formData.categories.gaming.main}
                        onChange={() => handleMainCategoryChange("gaming")}
                      />
                      Gaming
                    </label>
                    <div className="subcategories">
                      {Object.keys(
                        formData.categories.gaming.subcategories
                      ).map((sub) => (
                        <label key={sub} className="subcategory">
                          <input
                            type="checkbox"
                            checked={
                              formData.categories.gaming.subcategories[sub]
                            }
                            onChange={() =>
                              handleSubcategoryChange("gaming", sub)
                            }
                          />
                          Gaming {sub}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="button-group">
                <button onClick={() => setCurrentStep(1)} className="btn">
                  Back
                </button>
                <button onClick={handleNextStep} className="btn">
                  Continue
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="step-3">
              <h2>Email Frequency</h2>
              <p>How often would you like to receive updates?</p>

              <div className="frequency-options">
                <label>
                  <input
                    type="radio"
                    name="frequency"
                    value="weekly"
                    checked={formData.frequency === "weekly"}
                    onChange={(e) =>
                      setFormData({ ...formData, frequency: e.target.value })
                    }
                  />
                  Weekly
                </label>
                <label>
                  <input
                    type="radio"
                    name="frequency"
                    value="biweekly"
                    checked={formData.frequency === "biweekly"}
                    onChange={(e) =>
                      setFormData({ ...formData, frequency: e.target.value })
                    }
                  />
                  Bi-Weekly
                </label>
              </div>

              <div className="button-group">
                <button onClick={() => setCurrentStep(2)} className="btn">
                  Back
                </button>
                <button onClick={handleConfirm} className="btn">
                  Confirm Signup
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AOLNewsletterFunnel;
