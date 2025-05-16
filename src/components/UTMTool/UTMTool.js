import React, { Component } from "react";
import {
  Tabs,
  Tab,
  TabBody,
  GroupBox,
  Button,
  TextInput,
  Select,
} from "react95";
import styled, { ThemeProvider } from "styled-components";
import original from "react95/dist/themes/original";
import cx from "classnames";
import CustomWindow from "../tools/CustomWindow";
import StartMessage from "../StartMessage"; // Import the StartMessage component
import { logOff24 } from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import "./_styles.scss";

// Styled Components
const TabsContainer = styled(Tabs)`
  width: 100%;
  margin-bottom: 8px;
`;

const StyledTabBody = styled(TabBody)`
  width: 100%;
  flex: 1;
  overflow: auto;
  margin-bottom: 8px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
`;

const FormField = styled.div`
  margin-bottom: 8px;
  width: 100%;
`;

const FlexRow = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
  flex-wrap: wrap;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 8px;
  flex-wrap: wrap;
`;

const UrlContainer = styled.div`
  margin-top: 8px;
`;

const TableContainer = styled.div`
  border: inset 2px #a0a0a0;
  height: 200px;
  overflow-y: auto;
  margin-top: 8px;
  background: white;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;

  th,
  td {
    border: 1px solid #d4d4d4;
    padding: 4px 6px;
    text-align: left;
  }

  th {
    background-color: #ececec;
    position: sticky;
    top: 0;
  }
`;

const HistoryList = styled.div`
  border: inset 2px #a0a0a0;
  height: 280px;
  overflow-y: auto;
  background: white;
`;

const HistoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px;
  border-bottom: 1px solid #d4d4d4;

  &:last-child {
    border-bottom: none;
  }
`;

const HistoryUrl = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
  font-size: 11px;
`;

const HistoryActions = styled.div`
  display: flex;
  gap: 4px;
`;

const FieldLabel = styled.label`
  font-size: 11px;
  display: block;
  margin-bottom: 2px;
`;

const CustomParams = styled.div`
  max-height: 100px;
  overflow-y: auto;
`;

const ParamRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
`;

/**
 * UTM Builder Tool for Windows 98 Desktop Environment
 */
class UTMTool extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // State for form inputs
      baseUrl: "https://www.example.com",
      source: "",
      medium: "",
      campaign: "",
      term: "",
      content: "",
      customParams: [{ key: "", value: "" }],

      // State for URL input/output
      fullUrl: "",
      inputUrl: "",
      decodedParams: {},

      // State for UI
      activeTab: 0,
      activePlatform: "custom",
      history: [],

      // Alert state
      showAlert: false,
      alertTitle: "UTM Tracker",
      alertMessage: "",
    };

    // Platform templates
    this.platforms = {
      custom: { name: "Custom" },
      google: {
        name: "Google Ads",
        defaults: { source: "google", medium: "cpc" },
      },
      meta: {
        name: "Meta Ads",
        defaults: { source: "facebook", medium: "paid_social" },
      },
      email: {
        name: "Email",
        defaults: { source: "newsletter", medium: "email" },
      },
      display: {
        name: "Display",
        defaults: { source: "display", medium: "banner" },
      },
    };

    // Campaign presets
    this.campaignPresets = {
      "Product Launch": {
        source: "email",
        medium: "product_launch",
        campaign: "summer_2023_launch",
        term: "new_features",
        content: "email_button",
      },
      "Black Friday": {
        source: "email",
        medium: "promo",
        campaign: "black_friday_2023",
        term: "discount",
        content: "email_banner",
      },
      Webinar: {
        source: "linkedin",
        medium: "social",
        campaign: "webinar_series",
        term: "industry_insights",
        content: "post_link",
      },
    };

    // Parameter rules for validation
    this.parameterRules = {
      source: {
        required: true,
        maxLength: 50,
        noSpaces: true,
        pattern: /^[a-z0-9_.-]+$/i,
        description:
          "Identifies which site sent the traffic (e.g., google, newsletter)",
      },
      medium: {
        required: true,
        maxLength: 50,
        noSpaces: true,
        pattern: /^[a-z0-9_.-]+$/i,
        description:
          "Identifies what type of link was used (e.g., cpc, email, social)",
      },
      campaign: {
        required: false,
        maxLength: 100,
        noSpaces: true,
        pattern: /^[a-z0-9_.-]+$/i,
        description:
          "Identifies a specific product promotion or strategic campaign",
      },
      term: {
        required: false,
        maxLength: 100,
        noSpaces: true,
        pattern: /^[a-z0-9_.-]+$/i,
        description: "Identifies search terms for paid campaigns",
      },
      content: {
        required: false,
        maxLength: 100,
        noSpaces: true,
        pattern: /^[a-z0-9_.-]+$/i,
        description:
          "Differentiates links pointing to the same URL (e.g., logo_link, cta_button)",
      },
    };
  }

  componentDidMount() {
    // Load saved history from localStorage
    const savedHistory = localStorage.getItem("utm_history");
    if (savedHistory) {
      try {
        this.setState({ history: JSON.parse(savedHistory) });
      } catch (e) {
        console.error("Failed to parse history", e);
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
      JSON.stringify(prevState.customParams) !==
        JSON.stringify(this.state.customParams)
    ) {
      if (this.state.activeTab === 0) {
        this.buildUrl();
      }
    }

    // Apply platform template when changed
    if (prevState.activePlatform !== this.state.activePlatform) {
      if (
        this.state.activePlatform !== "custom" &&
        this.platforms[this.state.activePlatform]?.defaults
      ) {
        const defaults = this.platforms[this.state.activePlatform].defaults;
        if (defaults.source) this.setState({ source: defaults.source });
        if (defaults.medium) this.setState({ medium: defaults.medium });
      }
    }

    // Save history to localStorage when it changes
    if (
      JSON.stringify(prevState.history) !== JSON.stringify(this.state.history)
    ) {
      localStorage.setItem("utm_history", JSON.stringify(this.state.history));
    }
  }

  // URL Validation & Formatting
  validateUrl = () => {
    try {
      let url = this.state.baseUrl.trim();

      // Add protocol if missing
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }

      const parsedUrl = new URL(url);

      // Format URL properly (removes extra slashes, normalizes)
      const formattedUrl = parsedUrl.toString();

      this.setState({ baseUrl: formattedUrl }, () => {
        this.buildUrl();
        this.displayAlert(
          "Success",
          "URL is valid and has been formatted correctly."
        );
      });
    } catch (e) {
      this.displayAlert(
        "Error",
        "Please enter a valid URL. Example: https://www.example.com"
      );
    }
  };

  // Load Campaign Preset
  loadCampaignPreset = (presetName) => {
    const preset = this.campaignPresets[presetName];
    if (preset) {
      this.setState(
        {
          source: preset.source,
          medium: preset.medium,
          campaign: preset.campaign,
          term: preset.term,
          content: preset.content,
        },
        () => {
          this.buildUrl();
          this.displayAlert(
            "Preset Applied",
            `The "${presetName}" preset has been applied.`
          );
        }
      );
    }
  };

  // Parameter Validation with Best Practices
  validateParameters = () => {
    const issues = [];

    // Validate baseUrl
    if (!this.state.baseUrl) {
      issues.push("Base URL is required.");
    } else {
      try {
        new URL(this.state.baseUrl);
      } catch (e) {
        issues.push(
          "Base URL is not a valid URL. Please include http:// or https://"
        );
      }
    }

    // Validate UTM parameters
    const params = {
      source: this.state.source,
      medium: this.state.medium,
      campaign: this.state.campaign,
      term: this.state.term,
      content: this.state.content,
    };

    Object.entries(params).forEach(([param, value]) => {
      const rules = this.parameterRules[param];

      if (value) {
        // Only validate if there's a value
        if (rules.noSpaces && value.includes(" ")) {
          issues.push(
            `utm_${param} should not contain spaces. Use underscores or hyphens instead.`
          );
        }

        if (value.length > rules.maxLength) {
          issues.push(
            `utm_${param} is too long (max ${rules.maxLength} characters).`
          );
        }

        if (rules.pattern && !rules.pattern.test(value)) {
          issues.push(
            `utm_${param} should only contain letters, numbers, underscores, periods, and hyphens.`
          );
        }
      } else if (rules.required) {
        issues.push(`utm_${param} is required.`);
      }
    });

    // Validate custom parameters
    this.state.customParams.forEach((param, index) => {
      if (param.key && !param.value) {
        issues.push(
          `Custom parameter #${
            index + 1
          }: Value is required when key is provided.`
        );
      }
      if (!param.key && param.value) {
        issues.push(
          `Custom parameter #${
            index + 1
          }: Key is required when value is provided.`
        );
      }
    });

    if (issues.length > 0) {
      this.displayAlert("Parameter Validation", issues.join("\n\n"));
      return false;
    }

    this.displayAlert("Success", "All parameters are valid!");
    return true;
  };

  // Display alert method
  displayAlert = (title, message) => {
    this.setState({
      showAlert: true,
      alertTitle: title,
      alertMessage: message,
    });
  };

  // Close alert method
  closeAlert = () => {
    this.setState({
      showAlert: false,
    });
  };

  // Show help dialog
  showHelp = () => {
    this.displayAlert(
      "UTM Builder Help",
      "UTM Builder helps you create and manage tracking URLs for marketing campaigns.\n\n" +
        "• Build: Create UTM links for your campaigns\n" +
        "• Decode: Analyze existing UTM links\n" +
        "• History: View your recently created links\n\n" +
        "Required fields are marked with an asterisk (*)"
    );
  };

  // Build the full URL with UTM parameters
  buildUrl = () => {
    // Start with the base URL
    let url = this.state.baseUrl;

    // Add UTM parameters if they exist
    const params = new URLSearchParams();
    if (this.state.source) params.append("utm_source", this.state.source);
    if (this.state.medium) params.append("utm_medium", this.state.medium);
    if (this.state.campaign) params.append("utm_campaign", this.state.campaign);
    if (this.state.term) params.append("utm_term", this.state.term);
    if (this.state.content) params.append("utm_content", this.state.content);

    // Add custom parameters
    this.state.customParams.forEach((param) => {
      if (param.key && param.value) {
        params.append(param.key, param.value);
      }
    });

    // Combine URL with parameters
    const paramString = params.toString();
    if (paramString) {
      // Check if the base URL already has parameters
      url += (url.includes("?") ? "&" : "?") + paramString;
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
        this.displayAlert(
          "Notice",
          "No URL parameters found in the provided URL."
        );
        return;
      }

      this.setState({ decodedParams: params });

      // Optionally populate the builder with these values
      this.setState({
        source: params.utm_source || "",
        medium: params.utm_medium || "",
        campaign: params.utm_campaign || "",
        term: params.utm_term || "",
        content: params.utm_content || "",
        baseUrl: url.origin + url.pathname,
      });

      // Add non-UTM params to custom params
      const customParamsArray = [];
      Object.entries(params).forEach(([key, value]) => {
        if (!key.startsWith("utm_")) {
          customParamsArray.push({ key, value });
        }
      });

      if (customParamsArray.length > 0) {
        this.setState({ customParams: customParamsArray });
      } else {
        this.setState({ customParams: [{ key: "", value: "" }] });
      }

      // Add to history
      this.addToHistory(this.state.inputUrl);

      // Show success message
      this.displayAlert(
        "Success",
        "URL successfully decoded. Parameters have been loaded into the builder."
      );

      // Switch to builder tab
      this.setState({ activeTab: 0 });
    } catch (e) {
      // Show error message
      this.displayAlert(
        "Error",
        "Invalid URL format. Please enter a complete URL including http:// or https://"
      );
    }
  };

  // Add URL to history
  addToHistory = (url) => {
    // Add to front of array, avoid duplicates
    const newHistory = [
      url,
      ...this.state.history.filter((item) => item !== url),
    ].slice(0, 10);
    this.setState({ history: newHistory });
  };

  // Copy URL to clipboard
  copyToClipboard = () => {
    if (
      !this.state.fullUrl ||
      this.state.fullUrl === "https://www.example.com"
    ) {
      this.displayAlert("Notice", "Please build a URL first before copying.");
      return;
    }

    navigator.clipboard
      .writeText(this.state.fullUrl)
      .then(() => {
        this.displayAlert("Success", "URL copied to clipboard!");
        this.addToHistory(this.state.fullUrl);
      })
      .catch(() => {
        this.displayAlert(
          "Error",
          "Could not copy to clipboard. Please try again."
        );
      });
  };

  // Add a new custom parameter field
  addCustomParam = () => {
    this.setState({
      customParams: [...this.state.customParams, { key: "", value: "" }],
    });
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
      updatedParams.push({ key: "", value: "" });
    }
    this.setState({ customParams: updatedParams });
  };

  // Reset all form fields
  resetForm = () => {
    this.setState(
      {
        baseUrl: "https://www.example.com",
        source: "",
        medium: "",
        campaign: "",
        term: "",
        content: "",
        customParams: [{ key: "", value: "" }],
        activePlatform: "custom",
      },
      () => {
        this.buildUrl();
        this.displayAlert("Notice", "Form has been reset to default values.");
      }
    );
  };

  // Set active platform
  setActivePlatform = (platform) => {
    this.setState({ activePlatform: platform });
  };

  // Handle tabs change
  handleTabChange = (value) => {
    this.setState({ activeTab: value });
  };

  render() {
    const { props } = this;

    return (
      <ThemeProvider theme={original}>
        <CustomWindow
          title="UTM Builder"
          icon={logOff24}
          menuOptions={buildMenu(props)}
          initialHeight={450}
          initialWidth={480}
          minHeight={350}
          minWidth={400}
          className={cx("UTMTool", props.className)}
          onHelp={this.showHelp}
          showHelpButton={true}
          onClose={props.onClose}
          resizable={true}
          id={props.id}
          isActive={props.isActive}
          onMinimize={props.onMinimize}
          onMaximize={props.onMaximize}
          moveToTop={props.moveToTop}
          zIndex={props.zIndex}
          minimized={props.minimized}
        >
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              padding: "8px",
            }}
          >
            <TabsContainer
              value={this.state.activeTab}
              onChange={this.handleTabChange}
            >
              <Tab value={0}>Build</Tab>
              <Tab value={1}>Decode</Tab>
              <Tab value={2}>History</Tab>
            </TabsContainer>

            <StyledTabBody>
              {/* Build Tab */}
              {this.state.activeTab === 0 && (
                <FormGrid>
                  {/* Left Column */}
                  <div>
                    {/* Campaign Presets */}
                    <GroupBox label="Campaign Presets">
                      <FlexRow>
                        {Object.keys(this.campaignPresets).map((presetName) => (
                          <Button
                            key={presetName}
                            onClick={() => this.loadCampaignPreset(presetName)}
                            size="sm"
                          >
                            {presetName}
                          </Button>
                        ))}
                      </FlexRow>
                    </GroupBox>

                    {/* Platform Templates */}
                    <GroupBox label="Platform">
                      <Select
                        value={this.state.activePlatform}
                        options={Object.entries(this.platforms).map(
                          ([id, platform]) => ({
                            value: id,
                            label: platform.name,
                          })
                        )}
                        onChange={(value) => this.setActivePlatform(value)}
                        width="100%"
                      />
                    </GroupBox>

                    {/* URL Builder Form - Part 1 */}
                    <GroupBox label="URL Parameters">
                      <FormField>
                        <FieldLabel>Base URL:</FieldLabel>
                        <FormRow>
                          <TextInput
                            value={this.state.baseUrl}
                            onChange={(e) =>
                              this.setState({ baseUrl: e.target.value })
                            }
                            fullWidth
                            placeholder="https://example.com"
                          />
                          <Button onClick={this.validateUrl} size="sm">
                            ✓
                          </Button>
                        </FormRow>
                      </FormField>

                      <FormField>
                        <FieldLabel>
                          Source: <span style={{ color: "red" }}>*</span>
                        </FieldLabel>
                        <TextInput
                          value={this.state.source}
                          onChange={(e) =>
                            this.setState({ source: e.target.value })
                          }
                          fullWidth
                          placeholder="google"
                          title={this.parameterRules.source.description}
                        />
                      </FormField>

                      <FormField>
                        <FieldLabel>
                          Medium: <span style={{ color: "red" }}>*</span>
                        </FieldLabel>
                        <TextInput
                          value={this.state.medium}
                          onChange={(e) =>
                            this.setState({ medium: e.target.value })
                          }
                          fullWidth
                          placeholder="cpc"
                          title={this.parameterRules.medium.description}
                        />
                      </FormField>
                    </GroupBox>
                  </div>

                  {/* Right Column */}
                  <div>
                    {/* URL Builder Form - Part 2 */}
                    <GroupBox label="Optional Parameters">
                      <FormField>
                        <FieldLabel>Campaign:</FieldLabel>
                        <TextInput
                          value={this.state.campaign}
                          onChange={(e) =>
                            this.setState({ campaign: e.target.value })
                          }
                          fullWidth
                          placeholder="summer_promotion"
                          title={this.parameterRules.campaign.description}
                        />
                      </FormField>

                      <FormField>
                        <FieldLabel>Term:</FieldLabel>
                        <TextInput
                          value={this.state.term}
                          onChange={(e) =>
                            this.setState({ term: e.target.value })
                          }
                          fullWidth
                          placeholder="paid_keywords"
                          title={this.parameterRules.term.description}
                        />
                      </FormField>

                      <FormField>
                        <FieldLabel>Content:</FieldLabel>
                        <TextInput
                          value={this.state.content}
                          onChange={(e) =>
                            this.setState({ content: e.target.value })
                          }
                          fullWidth
                          placeholder="banner_ad"
                          title={this.parameterRules.content.description}
                        />
                      </FormField>
                    </GroupBox>

                    {/* Custom Parameters */}
                    <GroupBox label="Custom Parameters">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          marginBottom: "4px",
                        }}
                      >
                        <Button onClick={this.addCustomParam} size="sm">
                          Add
                        </Button>
                      </div>

                      <CustomParams>
                        {this.state.customParams.map((param, index) => (
                          <ParamRow key={index}>
                            <TextInput
                              placeholder="Key"
                              value={param.key}
                              onChange={(e) =>
                                this.updateCustomParam(
                                  index,
                                  "key",
                                  e.target.value
                                )
                              }
                              style={{ flex: 1 }}
                            />
                            <span>=</span>
                            <TextInput
                              placeholder="Value"
                              value={param.value}
                              onChange={(e) =>
                                this.updateCustomParam(
                                  index,
                                  "value",
                                  e.target.value
                                )
                              }
                              style={{ flex: 1 }}
                            />
                            <Button
                              onClick={() => this.removeCustomParam(index)}
                              size="sm"
                            >
                              X
                            </Button>
                          </ParamRow>
                        ))}
                      </CustomParams>
                    </GroupBox>

                    {/* Generated URL Output */}
                    <GroupBox label="Generated URL">
                      <TextInput
                        value={this.state.fullUrl}
                        readOnly
                        fullWidth
                        style={{ marginBottom: "8px" }}
                      />
                      <ButtonRow>
                        <Button onClick={this.copyToClipboard}>Copy</Button>
                        <Button onClick={this.validateParameters}>
                          Validate
                        </Button>
                        <Button onClick={this.resetForm}>Reset</Button>
                      </ButtonRow>
                    </GroupBox>
                  </div>
                </FormGrid>
              )}

              {/* Decode Tab */}
              {this.state.activeTab === 1 && (
                <>
                  <GroupBox label="URL Decoder">
                    <TextInput
                      value={this.state.inputUrl}
                      onChange={(e) =>
                        this.setState({ inputUrl: e.target.value })
                      }
                      placeholder="https://example.com/?utm_source=..."
                      fullWidth
                      style={{ marginBottom: "8px" }}
                    />
                    <Button onClick={this.decodeUrl}>Decode</Button>
                  </GroupBox>

                  {Object.keys(this.state.decodedParams).length > 0 && (
                    <GroupBox label="Decoded Parameters">
                      <TableContainer>
                        <Table>
                          <thead>
                            <tr>
                              <th>Parameter</th>
                              <th>Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(this.state.decodedParams).map(
                              ([key, value]) => (
                                <tr key={key}>
                                  <td>{key}</td>
                                  <td>{value}</td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </Table>
                      </TableContainer>
                    </GroupBox>
                  )}
                </>
              )}

              {/* History Tab */}
              {this.state.activeTab === 2 && (
                <GroupBox label="Recent URLs" style={{ height: "100%" }}>
                  {this.state.history.length > 0 ? (
                    <HistoryList>
                      {this.state.history.map((url, index) => (
                        <HistoryItem key={index}>
                          <HistoryUrl>{url}</HistoryUrl>
                          <HistoryActions>
                            <Button
                              onClick={() => {
                                this.setState({ inputUrl: url, activeTab: 1 });
                              }}
                              size="sm"
                              title="Decode this URL"
                            >
                              Decode
                            </Button>
                            <Button
                              onClick={() => {
                                navigator.clipboard.writeText(url);
                                this.displayAlert(
                                  "Success",
                                  "URL copied to clipboard!"
                                );
                              }}
                              size="sm"
                              title="Copy to clipboard"
                            >
                              Copy
                            </Button>
                          </HistoryActions>
                        </HistoryItem>
                      ))}
                    </HistoryList>
                  ) : (
                    <div style={{ padding: "8px", color: "#888" }}>
                      No history yet. Build or decode URLs to see them here.
                    </div>
                  )}
                </GroupBox>
              )}
            </StyledTabBody>

            {/* Alert dialog using StartMessage */}
            {this.state.showAlert && (
              <StartMessage
                welcomeMessage={this.state.alertMessage}
                title={this.state.alertTitle}
                closeWelcomeAlert={this.closeAlert}
                showWelcomeAlert={this.state.showAlert}
              />
            )}
          </div>
        </CustomWindow>
      </ThemeProvider>
    );
  }
}

export default UTMTool;
