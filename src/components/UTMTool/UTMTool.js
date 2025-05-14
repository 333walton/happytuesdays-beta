import React, { Component } from "react";
import { WindowProgram } from "packard-belle";
import cx from "classnames";
import Window from "../tools/Window";
import { logOff24 } from "../../icons"; // Replace with your appropriate icon
import buildMenu from "../../helpers/menuBuilder";
import Win98Alert from "./Win98Alert"; // Import the alert component
import "./_styles.scss";

class UTMTool extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // State for form inputs
      baseUrl: 'https://www.example.com',
      source: '',
      medium: '',
      campaign: '',
      term: '',
      content: '',
      customParams: [{ key: '', value: '' }],
      
      // State for URL input/output
      fullUrl: '',
      inputUrl: '',
      decodedParams: {},
      
      // State for UI
      activeTab: 'build',
      activePlatform: 'custom',
      showCopied: false,
      history: [],
      
      // Alert state
      showAlert: false,
      alertTitle: "UTM Tracker",
      alertMessage: ""
    };

    // Platform templates
    this.platforms = {
      custom: { name: 'Custom' },
      google: { 
        name: 'Google Ads',
        defaults: { source: 'google', medium: 'cpc' }
      },
      meta: { 
        name: 'Meta Ads',
        defaults: { source: 'facebook', medium: 'paid_social' }
      },
      email: { 
        name: 'Email',
        defaults: { source: 'newsletter', medium: 'email' }
      },
      display: { 
        name: 'Display',
        defaults: { source: 'display', medium: 'banner' }
      }
    };

    // Campaign presets - FEATURE 2
    this.campaignPresets = {
      "Product Launch": {
        source: "email",
        medium: "product_launch",
        campaign: "summer_2023_launch",
        term: "new_features",
        content: "email_button"
      },
      "Black Friday": {
        source: "email",
        medium: "promo",
        campaign: "black_friday_2023",
        term: "discount",
        content: "email_banner"
      },
      "Webinar": {
        source: "linkedin",
        medium: "social",
        campaign: "webinar_series",
        term: "industry_insights",
        content: "post_link"
      }
    };

    // Parameter best practices - FEATURE 3
    this.parameterRules = {
      source: {
        required: true,
        maxLength: 50,
        noSpaces: true,
        pattern: /^[a-z0-9_.-]+$/i,
        description: "Identifies which site sent the traffic (e.g., google, newsletter)"
      },
      medium: {
        required: true,
        maxLength: 50,
        noSpaces: true,
        pattern: /^[a-z0-9_.-]+$/i,
        description: "Identifies what type of link was used (e.g., cpc, email, social)"
      },
      campaign: {
        required: false,
        maxLength: 100,
        noSpaces: true,
        pattern: /^[a-z0-9_.-]+$/i,
        description: "Identifies a specific product promotion or strategic campaign"
      },
      term: {
        required: false,
        maxLength: 100,
        noSpaces: true,
        pattern: /^[a-z0-9_.-]+$/i,
        description: "Identifies search terms for paid campaigns"
      },
      content: {
        required: false,
        maxLength: 100,
        noSpaces: true,
        pattern: /^[a-z0-9_.-]+$/i,
        description: "Differentiates links pointing to the same URL (e.g., logo_link, cta_button)"
      }
    };
  }

  componentDidMount() {
    // Load saved history from localStorage
    const savedHistory = localStorage.getItem('utm_history');
    if (savedHistory) {
      try {
        this.setState({ history: JSON.parse(savedHistory) });
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
    
    // Build initial URL
    this.buildUrl();
  }

  componentDidUpdate(prevProps, prevState) {
    // Update URL when parameters change
    if (
      prevState.baseUrl !== this.state.baseUrl ||
      prevState.source !== this.state.source ||
      prevState.medium !== this.state.medium ||
      prevState.campaign !== this.state.campaign ||
      prevState.term !== this.state.term ||
      prevState.content !== this.state.content ||
      JSON.stringify(prevState.customParams) !== JSON.stringify(this.state.customParams)
    ) {
      if (this.state.activeTab === 'build') {
        this.buildUrl();
      }
    }
    
    // Apply platform template when changed
    if (prevState.activePlatform !== this.state.activePlatform) {
      if (this.state.activePlatform !== 'custom' && this.platforms[this.state.activePlatform]?.defaults) {
        const defaults = this.platforms[this.state.activePlatform].defaults;
        if (defaults.source) this.setState({ source: defaults.source });
        if (defaults.medium) this.setState({ medium: defaults.medium });
      }
    }
    
    // Save history to localStorage when it changes
    if (JSON.stringify(prevState.history) !== JSON.stringify(this.state.history)) {
      localStorage.setItem('utm_history', JSON.stringify(this.state.history));
    }
  }

  // FEATURE 1: URL Validation & Formatting
  validateUrl = () => {
    try {
      let url = this.state.baseUrl.trim();
      
      // Add protocol if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      const parsedUrl = new URL(url);
      
      // Format URL properly (removes extra slashes, normalizes)
      const formattedUrl = parsedUrl.toString();
      
      this.setState({ baseUrl: formattedUrl }, () => {
        this.buildUrl();
        this.displayAlert("Success", "URL is valid and has been formatted correctly.");
      });
    } catch (e) {
      this.displayAlert("Error", "Please enter a valid URL. Example: https://www.example.com");
    }
  };

  // FEATURE 2: Load Campaign Preset
  loadCampaignPreset = (presetName) => {
    const preset = this.campaignPresets[presetName];
    if (preset) {
      this.setState({
        source: preset.source,
        medium: preset.medium,
        campaign: preset.campaign,
        term: preset.term,
        content: preset.content
      }, () => {
        this.buildUrl();
        this.displayAlert("Preset Applied", `The "${presetName}" preset has been applied.`);
      });
    }
  };

  // FEATURE 3: Parameter Validation with Best Practices
  validateParameters = () => {
    const issues = [];
    
    // Validate baseUrl
    if (!this.state.baseUrl) {
      issues.push("Base URL is required.");
    } else {
      try {
        new URL(this.state.baseUrl);
      } catch (e) {
        issues.push("Base URL is not a valid URL. Please include http:// or https://");
      }
    }
    
    // Validate UTM parameters
    const params = {
      source: this.state.source,
      medium: this.state.medium,
      campaign: this.state.campaign,
      term: this.state.term,
      content: this.state.content
    };
    
    Object.entries(params).forEach(([param, value]) => {
      const rules = this.parameterRules[param];
      
      if (value) { // Only validate if there's a value
        if (rules.noSpaces && value.includes(' ')) {
          issues.push(`utm_${param} should not contain spaces. Use underscores or hyphens instead.`);
        }
        
        if (value.length > rules.maxLength) {
          issues.push(`utm_${param} is too long (max ${rules.maxLength} characters).`);
        }
        
        if (rules.pattern && !rules.pattern.test(value)) {
          issues.push(`utm_${param} should only contain letters, numbers, underscores, periods, and hyphens.`);
        }
      } else if (rules.required) {
        issues.push(`utm_${param} is required.`);
      }
    });
    
    // Validate custom parameters
    this.state.customParams.forEach((param, index) => {
      if (param.key && !param.value) {
        issues.push(`Custom parameter #${index + 1}: Value is required when key is provided.`);
      }
      if (!param.key && param.value) {
        issues.push(`Custom parameter #${index + 1}: Key is required when value is provided.`);
      }
    });
    
    if (issues.length > 0) {
      this.displayAlert("Parameter Validation", issues.join("\n\n"));
      return false;
    }
    
    return true;
  };

  // Display alert method
  displayAlert = (title, message) => {
    this.setState({
      showAlert: true,
      alertTitle: title,
      alertMessage: message
    });
  };
  
  // Close alert method
  closeAlert = () => {
    this.setState({
      showAlert: false
    });
  };

  // Build the full URL with UTM parameters
  buildUrl = () => {
    // Start with the base URL
    let url = this.state.baseUrl;
    
    // Add UTM parameters if they exist
    const params = new URLSearchParams();
    if (this.state.source) params.append('utm_source', this.state.source);
    if (this.state.medium) params.append('utm_medium', this.state.medium);
    if (this.state.campaign) params.append('utm_campaign', this.state.campaign);
    if (this.state.term) params.append('utm_term', this.state.term);
    if (this.state.content) params.append('utm_content', this.state.content);
    
    // Add custom parameters
    this.state.customParams.forEach(param => {
      if (param.key && param.value) {
        params.append(param.key, param.value);
      }
    });
    
    // Combine URL with parameters
    const paramString = params.toString();
    if (paramString) {
      // Check if the base URL already has parameters
      url += (url.includes('?') ? '&' : '?') + paramString;
    }
    
    this.setState({ fullUrl: url });
  };

  // Decode a URL to extract UTM and other parameters
  decodeUrl = () => {
    try {
      if (!this.state.inputUrl) {
        this.displayAlert("Error", "Please enter a URL to decode.");
        return;
      }
      
      const url = new URL(this.state.inputUrl);
      const params = {};
      
      // Extract all parameters
      url.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      
      if (Object.keys(params).length === 0) {
        this.displayAlert("Notice", "No URL parameters found in the provided URL.");
        return;
      }
      
      this.setState({ decodedParams: params });
      
      // Optionally populate the builder with these values
      this.setState({
        source: params.utm_source || '',
        medium: params.utm_medium || '',
        campaign: params.utm_campaign || '',
        term: params.utm_term || '',
        content: params.utm_content || '',
        baseUrl: url.origin + url.pathname
      });
      
      // Add non-UTM params to custom params
      const customParamsArray = [];
      Object.entries(params).forEach(([key, value]) => {
        if (!key.startsWith('utm_')) {
          customParamsArray.push({ key, value });
        }
      });
      
      if (customParamsArray.length > 0) {
        this.setState({ customParams: customParamsArray });
      } else {
        this.setState({ customParams: [{ key: '', value: '' }] });
      }
      
      // Add to history
      this.addToHistory(this.state.inputUrl);
      
      // Show success message
      this.displayAlert("Success", "URL successfully decoded. Parameters have been loaded into the builder.");
      
      // Switch to builder tab
      this.setState({ activeTab: 'build' });
      
    } catch (e) {
      // Show error message
      this.displayAlert("Error", "Invalid URL format. Please enter a complete URL including http:// or https://");
    }
  };

  // Add URL to history
  addToHistory = (url) => {
    // Add to front of array, avoid duplicates
    const newHistory = [url, ...this.state.history.filter(item => item !== url)].slice(0, 10);
    this.setState({ history: newHistory });
  };

  // Copy URL to clipboard
  copyToClipboard = () => {
    if (!this.state.fullUrl || this.state.fullUrl === 'https://www.example.com') {
      this.displayAlert("Notice", "Please build a URL first before copying.");
      return;
    }
    
    navigator.clipboard.writeText(this.state.fullUrl).then(() => {
      this.displayAlert("Success", "URL copied to clipboard!");
      this.addToHistory(this.state.fullUrl);
    }).catch(() => {
      this.displayAlert("Error", "Could not copy to clipboard. Please try again.");
    });
  };

  // Add a new custom parameter field
  addCustomParam = () => {
    this.setState({ customParams: [...this.state.customParams, { key: '', value: '' }] });
  };

  // Update a custom parameter
  updateCustomParam = (index, field, value) => {
    const updatedParams = [...this.state.customParams];
    updatedParams[index][field] = value;
    this.setState({ customParams: updatedParams });
  };

  // Remove a custom parameter
  removeCustomParam = (index) => {
    const updatedParams = [...this.state.customParams];
    updatedParams.splice(index, 1);
    if (updatedParams.length === 0) {
      updatedParams.push({ key: '', value: '' });
    }
    this.setState({ customParams: updatedParams });
  };

  // Reset all form fields
  resetForm = () => {
    this.setState({
      baseUrl: 'https://www.example.com',
      source: '',
      medium: '',
      campaign: '',
      term: '',
      content: '',
      customParams: [{ key: '', value: '' }],
      activePlatform: 'custom'
    }, () => {
      this.buildUrl();
      this.displayAlert("Notice", "Form has been reset to default values.");
    });
  };

  // Set active tab
  setActiveTab = (tab) => {
    this.setState({ activeTab: tab });
  };

  // Set active platform
  setActivePlatform = (platform) => {
    this.setState({ activePlatform: platform });
  };

  render() {
    const { props } = this;
    
    return (
      <Window
        {...props}
        title="UTM Builder"
        icon={logOff24}
        menuOptions={buildMenu(props)}
        Component={WindowProgram}
        initialHeight={550}
        initialWidth={500}
        className={cx("UTMTool", props.className)}
      >
        <div className="utm-tool">
          {/* Tab Navigation */}
          <div className="utm-tool-tabs">
            <button 
              className={cx("utm-tool-tab", { active: this.state.activeTab === 'build' })}
              onClick={() => this.setActiveTab('build')}
            >
              Build
            </button>
            <button 
              className={cx("utm-tool-tab", { active: this.state.activeTab === 'decode' })}
              onClick={() => this.setActiveTab('decode')}
            >
              Decode
            </button>
            <button 
              className={cx("utm-tool-tab", { active: this.state.activeTab === 'history' })}
              onClick={() => this.setActiveTab('history')}
            >
              History
            </button>
          </div>

          {/* Build Tab */}
          {this.state.activeTab === 'build' && (
            <div className="utm-tool-content">
              {/* Campaign Presets - FEATURE 2 */}
              <div className="utm-tool-presets">
                <label className="utm-tool-label">Campaign Presets:</label>
                <div className="utm-tool-preset-buttons">
                  {Object.keys(this.campaignPresets).map(presetName => (
                    <button
                      key={presetName}
                      onClick={() => this.loadCampaignPreset(presetName)}
                      className="utm-tool-button utm-tool-preset-button"
                    >
                      {presetName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform Selection */}
              <div className="utm-tool-platform-selector">
                <label className="utm-tool-label">Platform Template:</label>
                <div className="utm-tool-platform-buttons">
                  {Object.entries(this.platforms).map(([id, platform]) => (
                    <button
                      key={id}
                      className={cx("utm-tool-platform-button", { active: this.state.activePlatform === id })}
                      onClick={() => this.setActivePlatform(id)}
                    >
                      {platform.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* URL Builder Form */}
              <div className="utm-tool-form-field">
                <div className="utm-tool-field-header">
                  <label className="utm-tool-label">Base URL:</label>
                  {/* URL Validation button - FEATURE 1 */}
                  <button
                    onClick={this.validateUrl}
                    className="utm-tool-button utm-tool-button-small"
                    title="Validate and format URL"
                  >
                    Validate
                  </button>
                </div>
                <input
                  type="text"
                  value={this.state.baseUrl}
                  onChange={(e) => this.setState({ baseUrl: e.target.value })}
                  className="utm-tool-input"
                />
              </div>
              
              <div className="utm-tool-form-row">
                <div className="utm-tool-form-field">
                  <div className="utm-tool-field-header">
                    <label className="utm-tool-label">Campaign Source:</label>
                    <span className="utm-tool-required">*</span>
                  </div>
                  <input
                    type="text"
                    value={this.state.source}
                    onChange={(e) => this.setState({ source: e.target.value })}
                    className="utm-tool-input"
                    title={this.parameterRules.source.description}
                  />
                </div>
                <div className="utm-tool-form-field">
                  <div className="utm-tool-field-header">
                    <label className="utm-tool-label">Campaign Medium:</label>
                    <span className="utm-tool-required">*</span>
                  </div>
                  <input
                    type="text"
                    value={this.state.medium}
                    onChange={(e) => this.setState({ medium: e.target.value })}
                    className="utm-tool-input"
                    title={this.parameterRules.medium.description}
                  />
                </div>
              </div>
              
              <div className="utm-tool-form-field">
                <label className="utm-tool-label">Campaign Name:</label>
                <input
                  type="text"
                  value={this.state.campaign}
                  onChange={(e) => this.setState({ campaign: e.target.value })}
                  className="utm-tool-input"
                  title={this.parameterRules.campaign.description}
                />
              </div>
              
              <div className="utm-tool-form-row">
                <div className="utm-tool-form-field">
                  <label className="utm-tool-label">Campaign Term:</label>
                  <input
                    type="text"
                    value={this.state.term}
                    onChange={(e) => this.setState({ term: e.target.value })}
                    className="utm-tool-input"
                    title={this.parameterRules.term.description}
                  />
                </div>
                <div className="utm-tool-form-field">
                  <label className="utm-tool-label">Campaign Content:</label>
                  <input
                    type="text"
                    value={this.state.content}
                    onChange={(e) => this.setState({ content: e.target.value })}
                    className="utm-tool-input"
                    title={this.parameterRules.content.description}
                  />
                </div>
              </div>

              {/* Custom Parameters */}
              <div className="utm-tool-custom-params">
                <div className="utm-tool-custom-params-header">
                  <label className="utm-tool-label">Custom Parameters:</label>
                  <button
                    className="utm-tool-button"
                    onClick={this.addCustomParam}
                  >
                    Add Parameter
                  </button>
                </div>
                
                {this.state.customParams.map((param, index) => (
                  <div key={index} className="utm-tool-custom-param-row">
                    <input
                      type="text"
                      placeholder="Key"
                      value={param.key}
                      onChange={(e) => this.updateCustomParam(index, 'key', e.target.value)}
                      className="utm-tool-input utm-tool-input-key"
                    />
                    <span className="utm-tool-equals">=</span>
                    <input
                      type="text"
                      placeholder="Value"
                      value={param.value}
                      onChange={(e) => this.updateCustomParam(index, 'value', e.target.value)}
                      className="utm-tool-input utm-tool-input-value"
                    />
                    <button
                      onClick={() => this.removeCustomParam(index)}
                      className="utm-tool-button utm-tool-button-remove"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Generated URL Output */}
              <div className="utm-tool-result">
                <label className="utm-tool-label">Generated URL:</label>
                <div className="utm-tool-url-output">
                  <input
                    type="text"
                    value={this.state.fullUrl}
                    readOnly
                    className="utm-tool-input utm-tool-input-readonly"
                  />
                  <div className="utm-tool-buttons">
                    <button
                      onClick={this.copyToClipboard}
                      className="utm-tool-button"
                      title="Copy to clipboard"
                    >
                      Copy
                    </button>
                    {/* Added validation button - FEATURE 3 */}
                    <button
                      onClick={this.validateParameters}
                      className="utm-tool-button"
                      title="Validate all parameters"
                    >
                      Validate
                    </button>
                    <button
                      onClick={this.resetForm}
                      className="utm-tool-button"
                      title="Reset form"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Decode Tab */}
          {this.state.activeTab === 'decode' && (
            <div className="utm-tool-content">
              <div className="utm-tool-decode">
                <label className="utm-tool-label">Enter URL to decode:</label>
                <div className="utm-tool-decode-input">
                  <input
                    type="text"
                    value={this.state.inputUrl}
                    onChange={(e) => this.setState({ inputUrl: e.target.value })}
                    placeholder="https://example.com/?utm_source=..."
                    className="utm-tool-input"
                  />
                  <button
                    onClick={this.decodeUrl}
                    className="utm-tool-button"
                  >
                    Decode
                  </button>
                </div>
              </div>

              {Object.keys(this.state.decodedParams).length > 0 && (
                <div className="utm-tool-decode-results">
                  <h3 className="utm-tool-subtitle">Decoded Parameters:</h3>
                  <div className="utm-tool-decode-table-container">
                    <table className="utm-tool-decode-table">
                      <thead>
                        <tr>
                          <th>Parameter</th>
                          <th>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(this.state.decodedParams).map(([key, value]) => (
                          <tr key={key}>
                            <td>{key}</td>
                            <td>{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {this.state.activeTab === 'history' && (
            <div className="utm-tool-content">
              <h3 className="utm-tool-subtitle">Recent URLs:</h3>
              {this.state.history.length > 0 ? (
                <div className="utm-tool-history-list">
                  {this.state.history.map((url, index) => (
                    <div 
                      key={index} 
                      className="utm-tool-history-item"
                    >
                      <div className="utm-tool-history-url">{url}</div>
                      <div className="utm-tool-history-actions">
                        <button 
                          onClick={() => {
                            this.setState({ inputUrl: url, activeTab: 'decode' });
                          }}
                          className="utm-tool-button utm-tool-button-small"
                          title="Decode this URL"
                        >
                          Decode
                        </button>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(url);
                            this.displayAlert("Success", "URL copied to clipboard!");
                          }}
                          className="utm-tool-button utm-tool-button-small"
                          title="Copy to clipboard"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="utm-tool-empty-history">
                  No history yet. Build or decode URLs to see them here.
                </div>
              )}
            </div>
          )}
          
          {/* Alert dialog */}
          {this.state.showAlert && (
            <Win98Alert
              title={this.state.alertTitle}
              message={this.state.alertMessage}
              onClose={this.closeAlert}
            />
          )}
        </div>
      </Window>
    );
  }
}

export default UTMTool;