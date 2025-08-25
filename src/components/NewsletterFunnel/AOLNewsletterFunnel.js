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
        id: "ai_ml",
        name: "AI & Machine Learning",
        image: "/static/aol/channels/channel_ai_ml.png", // tech
        className: "channel-ai-ml",
        description:
          "Covers developments and applications of AI and machine learning for beginners and experienced readers.",
        mobileDescription:
          "Covers AI and machine learning developments, tools, and uses for all experience levels.",
      },
      {
        id: "ai_art",
        name: "Generative AI Art",
        image: "/static/aol/channels/channel_ai_art_lab.png", // art
        className: "channel-ai-art",
        description:
          "Covers developments and applications of AI and machine learning for beginners and experienced readers.",
        mobileDescription:
          "Explores projects, techniques, and trends in generative and AI-driven art.",
      },
      {
        id: "startup_stories",
        name: "Startup Stories",
        image: "/static/aol/channels/channel_startup_stories.png", // build
        className: "channel-startup-stories",
        description:
          "Shares lessons, challenges, and experiences from entrepreneurs and their journeys building and growing businesses.",
        mobileDescription:
          "Shares lessons and experiences from entrepreneurs building & scaling businesses.",
      },
      {
        id: "weekly_roundup",
        name: "Weekly Gaming News",
        image: "/static/aol/channels/channel_weekly_roundup.png", // gaming
        className: "channel-weekly-roundup",
        description:
          "Summarizes notable developments, releases, and discussions from across the gaming world in one concise update.",
        mobileDescription:
          "Summarizes weekly gaming news, releases, and key community updates.",
      },
      {
        id: "marketing_tech",
        name: "MarTech & AdTech",
        image: "/static/aol/channels/channel_marketing_tech.png", // tech
        className: "channel-marketing-tech",
        description:
          "Explores marketing and advertising technology, tools, trends, and strategies that drive campaign success.",
        mobileDescription:
          "Covers marketing and advertising tech, including tools, trends, and strategies.",
      },
      {
        id: "ui_ux",
        name: "UI/UX Design",
        image: "static/aol/channels/channel_ui_ux_insider.png", // art
        className: "channel-ui-ux",
        description:
          "Covers user interface and user experience design trends, principles, and practices shaping modern digital products.",
        mobileDescription:
          "Covers trends and best practices shaping UI and UX design for digital products.",
      },
      {
        id: "no_code",
        name: "Automation Tools",
        image: "/static/aol/channels/channel_no_code_tools.png", // build
        className: "channel-no-code",
        description:
          "Explores automation and no-code tools for building and managing projects without traditional programming.",
        mobileDescription:
          "Explores automation and no-code tools for building and managing projects.",
      },
      {
        id: "guides",
        name: "Game Guides",
        image: "/static/aol/channels/channel_pro_guides_tips.png", // gaming
        className: "channel-guides",
        description:
          "Offers strategies, insights, and methods for improving skills and performance in various games.",
        mobileDescription:
          "Shares strategies to improve skills and performance in various games.",
      },
      {
        id: "blockchain_web3",
        name: "Blockchain & Web3",
        image: "/static/aol/channels/channel_blockchain_web3.png", // tech
        className: "channel-blockchain-web3",
        description:
          "Covers blockchain technology, decentralization trends, the evolving Web3 ecosystem and digital economies.",
        mobileDescription:
          "Covers blockchain, decentralization, and Web3 trends with project spotlights.",
      },
      {
        id: "tutorials",
        name: "Tutorials",
        image: "/static/aol/channels/channel_tutorials.png", // art
        className: "channel-tutorials",
        description:
          "Step-by-step guides for creative & technical skills, helping readers learn and apply techniques across multiple mediums.",
        mobileDescription:
          "Step-by-step guides for learning creative and technical skills.",
      },
      {
        id: "pm_playbook",
        name: "Project Management",
        image: "/static/aol/channels/channel_pm_playbook.png", // build
        className: "channel-pm-playbook",
        description:
          "Explores methods, tools, and workflows for planning, organizing, and delivering projects in various settings.",
        mobileDescription:
          "Explores tools and workflows for planning and delivering projects.",
      },
      {
        id: "retro_gaming",
        name: "Retro Gaming",
        image: "/static/aol/channels/channel_retro_gaming.png", // gaming
        className: "channel-retro-gaming",
        description:
          "Covers classic video games, modern perspectives, preservation, and community stories from earlier gaming eras.",
        mobileDescription:
          "Covers classic games, modern takes, preservation, and community stories.",
      },
      {
        id: "cybersecurity_privacy",
        name: "Cybersecurity",
        image: "/static/aol/channels/channel_cyber_privacy.png", // tech
        className: "channel-cybersecurity-privacy",
        description:
          "Examines security challenges, data protection practices, and evolving threats in the digital environment.",
        mobileDescription:
          "Examines security, data protection, and emerging digital threats.",
      },
      {
        id: "motion_design",
        name: "Motion Design",
        image: "static/aol/channels/channel_motion_design.png", // art
        className: "channel-motion-design",
        description:
          "Covers animation techniques and motion design, from core principles to applications in media, products, and marketing.",
        mobileDescription:
          "Covers animation and motion design from principles to real applications.",
      },
      {
        id: "work_smarter",
        name: "Productivity Tips",
        image: "/static/aol/channels/channels_work_smarter2.png", // build
        className: "channel-work-smarter",
        description:
          "Highlights ideas, habits, and tools aimed at improving productivity, efficiency, and focus in work and daily life.",
        mobileDescription:
          "Highlights tools and habits for improving productivity and focus.",
      },
      {
        id: "indie_spotlights",
        name: "Indie Games",
        image: "static/aol/channels/channel_indie_spotlights.png", // gaming
        className: "channel-indie-spotlights",
        description:
          "Showcases indie game projects and stories, including releases, development insights, and creator perspectives.",
        mobileDescription:
          "Showcases indie game releases, development stories, and creator insights.",
      },
      {
        id: "web_devops",
        name: "Web Development",
        image: "/static/aol/channels/channels_web_devops3.png", // tech
        className: "channel-web-devops",
        description:
          "Focuses on web development, tools, workflows, and deployment strategies for building & maintaining projects.",
        mobileDescription:
          "Focuses on web development tools, workflows, and deployment strategies.",
      },
      {
        id: "typeface_color",
        name: "Typeface & Color",
        image: "static/aol/channels/channel_typeface_color.png", // art
        className: "channel-typeface-color",
        description:
          "Examines typography and color design, exploring their role in branding, communication, and visual storytelling.",
        mobileDescription:
          "Explores typography and color in branding, design, and communication.",
      },
      {
        id: "momentum_mindset",
        name: "Mindset & Habits",
        image: "/static/aol/channels/channels_momentum_mindset4.png", // build placeholder
        className: "channel-momentum-mindset",
        description:
          "Shares approaches and ideas for building resilience, focus, and positive habits for growth.",
        mobileDescription:
          "Shares ideas for building resilience, focus, and positive daily habits.",
      },
      {
        id: "collecting",
        name: "Game Collecting",
        image: "static/aol/channels/channel_collectors_hub.png", // gaming
        className: "channel-collecting",
        description:
          "Celebrates the culture of game collecting, with looks at trends, items, and communities built around them.",
        mobileDescription:
          "Explores game collecting trends, notable items, and collector communities.",
      },
    ];

    this.state = {
      statusTextKey: 1, // Add this for triggering fade-in animation
      currentStep: 1,
      formData: {
        email: "",
        selectedChannels: this.channels.reduce((acc, channel) => {
          acc[channel.id] = false;
          return acc;
        }, {}),
        frequency: "weekly",
      },
      errors: {},
      hoveredChannelId: null,
      isMobile: window.innerWidth <= 480, // detect on load
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
      isSmallMobile: window.innerWidth <= 375,
      isMediumMobile: window.innerWidth > 375 && window.innerWidth <= 414,
      isLargeMobile: window.innerWidth > 414 && window.innerWidth <= 480,
      tooltipVisible: false,
      tooltipText: "",
      tooltipPosition: { x: 0, y: 0 },
    };
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("orientationchange", this.handleOrientationChange);
    this.updateViewportDimensions();
    this.ensureProperPositioning();
    this.observeDesktopResize();
    this.setupChannelTooltips();
    this.preloadMailSound(); // Add this line

    // Dispatch event that window opened (for tooltip protection)
    window.dispatchEvent(
      new CustomEvent("windowOpened", {
        detail: { component: "AOLNewsletterFunnel" },
      })
    );
  }

  preloadMailSound = () => {
    this.mailAudio = new Audio("/sounds/aol-yougotmail.wav");
    this.mailAudio.preload = "auto";
    this.mailAudio.volume = 0.1;

    // Load the audio file
    this.mailAudio.load();

    // Set up Web Audio API context if available
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioContext = new AudioContext();
        this.mailAudio.addEventListener(
          "canplaythrough",
          () => {
            if (!this.audioSource && this.audioContext) {
              this.audioSource = this.audioContext.createMediaElementSource(
                this.mailAudio
              );
              this.gainNode = this.audioContext.createGain();
              this.gainNode.gain.value = 0.1;
              this.audioSource
                .connect(this.gainNode)
                .connect(this.audioContext.destination);
            }
          },
          { once: true }
        );
      }
    } catch (err) {
      console.log("Web Audio API not available, falling back to HTML5 audio");
    }
  };

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener(
      "orientationchange",
      this.handleOrientationChange
    );

    this.cleanupTooltips();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    // Dispatch event that window closed (for tooltip restoration)
    window.dispatchEvent(
      new CustomEvent("windowClosed", {
        detail: { component: "AOLNewsletterFunnel" },
      })
    );
  }

  setupChannelTooltips = () => {
    this.tooltipEl = null;
    this.tooltipTimer = null;
  };

  // Add new methods

  updateViewportDimensions = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);

    this.setState({
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
      isSmallMobile: window.innerWidth <= 375,
      isMediumMobile: window.innerWidth > 375 && window.innerWidth <= 414,
      isLargeMobile: window.innerWidth > 414 && window.innerWidth <= 480,
    });
  };

  handleOrientationChange = () => {
    setTimeout(() => {
      this.updateViewportDimensions();
      this.ensureProperPositioning();
    }, 100);
  };

  // Update handleResize
  handleResize = () => {
    this.updateViewportDimensions();
    this.setState({ isMobile: window.innerWidth <= 480 });
    this.ensureProperPositioning();
  };

  // Add dynamic height calculation
  getDynamicWindowHeight = () => {
    const { currentStep, viewportHeight } = this.state;
    const baseHeights = {
      1: 315,
      2: 463,
      3: 342,
      4: 379,
    };

    // Scale heights based on viewport
    const scaleFactor = Math.min(1, viewportHeight / 896); // 896 is iPhone XR height
    return Math.max(baseHeights[currentStep] * scaleFactor, 280); // Minimum height of 280px
  };

  ensureProperPositioning = () => {
    setTimeout(() => {
      const windowElement = document.querySelector(
        ".Window.AOLNewsletterFunnel"
      );
      const desktopContainer = windowElement?.closest(".desktop");

      if (windowElement && desktopContainer) {
        const draggableWrapper = windowElement.closest(".react-draggable");

        if (draggableWrapper) {
          const desktopRect = desktopContainer.getBoundingClientRect();
          const windowRect = windowElement.getBoundingClientRect();

          // Check if window is outside the desktop bounds
          if (
            windowRect.left < desktopRect.left ||
            windowRect.top < desktopRect.top ||
            windowRect.right > desktopRect.right ||
            windowRect.bottom > desktopRect.bottom
          ) {
            // Reset to original positioning based on viewport size
            draggableWrapper.style.position = "absolute";

            if (window.innerWidth >= 768) {
              // Tablet/Desktop: upper center
              draggableWrapper.style.left = "50%";
              draggableWrapper.style.top = "0";
              draggableWrapper.style.transform = "translate(-50%, -20px)";
              draggableWrapper.style.marginTop = "30px";
            } else if (window.innerWidth >= 481) {
              // Larger mobile: upper center
              draggableWrapper.style.left = "50%";
              draggableWrapper.style.top = "0";
              draggableWrapper.style.transform = "translate(-50%, -20px)";
              draggableWrapper.style.marginTop = "30px";
            } else {
              // Mobile: centered but higher
              draggableWrapper.style.left = "50%";
              draggableWrapper.style.top = "50%";
              draggableWrapper.style.transform =
                "translate(-50%, calc(-50% - 100px))";
              draggableWrapper.style.marginTop = "80px";
            }
          }
        }
      }
    }, 100);
  };

  observeDesktopResize = () => {
    const desktopContainer = document.querySelector(".desktop");

    if (desktopContainer && window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          if (entry.target === desktopContainer) {
            this.ensureProperPositioning();
          }
        }
      });

      this.resizeObserver.observe(desktopContainer);
    }
  };

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

  // Play using Web Audio API for better mobile support
  /*audio.addEventListener(
      "canplaythrough",
      () => {
        try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) {
            this.audioContext = new AudioContext();
            this.mailAudio.addEventListener('canplaythrough', () => {
              if (!this.audioSource && this.audioContext) {
                this.audioSource = this.audioContext.createMediaElementSource(this.mailAudio);
                this.gainNode = this.audioContext.createGain();
                this.gainNode.gain.value = 0.04;
                this.audioSource.connect(this.gainNode).connect(this.audioContext.destination);
              }
            }, { once: true });
          }
        } catch (err) {
          console.log("Web Audio API not available, falling back to HTML5 audio");
        }*/

  playMailSound = () => {
    if (!this.mailAudio) {
      console.log("Mail audio not loaded");
      return;
    }

    // Reset audio to beginning
    this.mailAudio.currentTime = 0;

    // Resume audio context if suspended (required by some browsers)
    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    // Add a small delay to ensure audio is ready
    setTimeout(() => {
      this.mailAudio.play().catch((error) => {
        console.log("Could not play mail sound:", error);
      });
    }, 333);
  };

  // Handle channel hover
  showChannelTooltip = (channel, event) => {
    // Prevent tooltips from showing on mobile-sized screens
    if (this.state.isMobile) return;

    // Clear any existing timer
    if (this.tooltipTimer) {
      clearTimeout(this.tooltipTimer);
      this.tooltipTimer = null;
    }

    // Remove any existing tooltip FOR THIS COMPONENT ONLY
    if (this.tooltipEl) {
      this.tooltipEl.remove();
      this.tooltipEl = null;
    }

    const buttonElement = event.currentTarget;

    this.tooltipTimer = setTimeout(() => {
      this.tooltipEl = document.createElement("div");
      this.tooltipEl.className = "aol-newsletter-channel-tooltip";
      this.tooltipEl.textContent = channel.name;
      this.tooltipEl.style.position = "fixed";
      this.tooltipEl.style.zIndex = "100";
      this.tooltipEl.style.backgroundColor = "#ffffe1";
      this.tooltipEl.style.border = "1px solid #000";
      this.tooltipEl.style.padding = "2px 4px";
      this.tooltipEl.style.fontSize = "11px";
      this.tooltipEl.style.fontFamily = '"MS Sans Serif", sans-serif';
      this.tooltipEl.style.pointerEvents = "none";
      this.tooltipEl.style.whiteSpace = "nowrap";

      document.body.appendChild(this.tooltipEl);

      const rect = buttonElement.getBoundingClientRect();
      this.tooltipEl.style.left = `${
        rect.left + rect.width / 2 - this.tooltipEl.offsetWidth / 2
      }px`;
      this.tooltipEl.style.top = `${
        rect.top - this.tooltipEl.offsetHeight - 8
      }px`;

      const updatePosition = () => {
        if (!this.tooltipEl || !buttonElement) return;
        const newRect = buttonElement.getBoundingClientRect();
        this.tooltipEl.style.left = `${
          newRect.left + newRect.width / 2 - this.tooltipEl.offsetWidth / 2
        }px`;
        this.tooltipEl.style.top = `${
          newRect.top - this.tooltipEl.offsetHeight - 8
        }px`;
      };

      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition, true);

      this.tooltipCleanup = () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition, true);
      };
    }, 500);
  };

  hideChannelTooltip = () => {
    // Clear timer if tooltip hasn't appeared yet
    if (this.tooltipTimer) {
      clearTimeout(this.tooltipTimer);
      this.tooltipTimer = null;
    }

    // Run cleanup if exists
    if (this.tooltipCleanup) {
      this.tooltipCleanup();
      this.tooltipCleanup = null;
    }
  };

  cleanupTooltips = () => {
    if (this.tooltipTimer) {
      clearTimeout(this.tooltipTimer);
      this.tooltipTimer = null;
    }
    if (this.tooltipCleanup) {
      this.tooltipCleanup();
      this.tooltipCleanup = null;
    }
  };

  // Updated existing methods
  handleChannelHover = (channelId, event) => {
    this.setState({ hoveredChannelId: channelId });

    // Find the channel and show tooltip
    const channel = this.channels.find((c) => c.id === channelId);
    if (channel) {
      this.showChannelTooltip(channel, event);
    }
  };

  handleChannelHoverLeave = () => {
    this.setState({ hoveredChannelId: null });
    this.hideChannelTooltip();
  };

  // Get the description to display (either from hovered or selected channel)
  getActiveDescription = () => {
    const { hoveredChannelId, formData, isMobile } = this.state;

    // Determine which description field to use
    const descKey = isMobile ? "mobileDescription" : "description";

    if (hoveredChannelId) {
      const channel = this.channels.find((c) => c.id === hoveredChannelId);
      return channel ? channel[descKey] : null;
    }

    const selectedChannelId = Object.keys(formData.selectedChannels).find(
      (id) => formData.selectedChannels[id]
    );

    if (selectedChannelId) {
      const channel = this.channels.find((c) => c.id === selectedChannelId);
      return channel ? channel[descKey] : null;
    }

    return null;
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

  handleColumnSelect = (columnName) => {
    // Define which channels belong to each column
    const columnChannelMap = {
      Tech: [
        "ai_ml",
        "marketing_tech",
        "blockchain_web3",
        "cybersecurity_privacy",
        "web_devops",
      ],
      Design: [
        "ai_art",
        "ui_ux",
        "tutorials",
        "motion_design",
        "typeface_color",
      ],
      Builders: [
        "startup_stories",
        "no_code",
        "pm_playbook",
        "work_smarter",
        "momentum_mindset",
      ],
      Gaming: [
        "weekly_roundup",
        "guides",
        "retro_gaming",
        "indie_spotlights",
        "collecting",
      ],
    };

    // Get channel IDs for this column
    const columnChannelIds = columnChannelMap[columnName];

    if (!columnChannelIds) return;

    // Check if all channels in this column are currently selected
    const allSelected = columnChannelIds.every(
      (channelId) => this.state.formData.selectedChannels[channelId]
    );

    // Toggle all channels in this column
    this.setState((prevState) => {
      const newSelectedChannels = { ...prevState.formData.selectedChannels };

      columnChannelIds.forEach((channelId) => {
        newSelectedChannels[channelId] = !allSelected;
      });

      return {
        formData: {
          ...prevState.formData,
          selectedChannels: newSelectedChannels,
        },
      };
    });
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

  // Modify handleNextStep to trigger status text animation
  handleNextStep = () => {
    const { currentStep, formData } = this.state;

    if (currentStep === 1) {
      this.setState({
        currentStep: 2,
        statusTextKey: this.state.statusTextKey + 1, // Trigger animation
      });
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

      this.setState({
        errors: {},
        currentStep: 3,
        statusTextKey: this.state.statusTextKey + 1, // Trigger animation
      });
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
    this.setState(
      {
        currentStep: 4,
        statusTextKey: this.state.statusTextKey + 1, // Trigger animation
      },
      () => {
        // Play the sound after state update with additional delay
        setTimeout(() => {
          this.playMailSound();
        }, 800); // Delay to let the status text animation complete
      }
    );
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
    const {
      currentStep,
      formData,
      errors,
      isSmallMobile,
      isMediumMobile,
      isLargeMobile,
    } = this.state;

    const mobileClass = cx({
      "mobile-small": isSmallMobile,
      "mobile-medium": isMediumMobile,
      "mobile-large": isLargeMobile,
    });

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
                  {currentStep === 3 && (
                    <img
                      src="/static/aol/dialup_pic3.png"
                      alt="AOL Figure 3"
                      className="aol-figure-image aol-figure-3 aol-figure-fade-in"
                    />
                  )}
                  {currentStep === 4 && (
                    <img
                      src="/static/aol/dialup_pic4.png"
                      alt="AOL Figure 4"
                      className="aol-figure-image aol-figure-4 aol-figure-fade-in"
                      style={{ marginLeft: "2px" }}
                    />
                  )}
                </div>
              </div>

              {/* Status text positioned below dial-up background */}
              <div className="status-text-container">
                {currentStep === 1 && (
                  <div
                    key={`dialing-${this.state.statusTextKey}`}
                    className="status-text"
                  >
                    Dialing...
                  </div>
                )}
                {currentStep === 3 && (
                  <div
                    key={`checking-${this.state.statusTextKey}`}
                    className="status-text"
                  >
                    Checking preferences...
                  </div>
                )}
                {currentStep === 4 && (
                  <div
                    key={`confirming-${this.state.statusTextKey}`}
                    className="status-text"
                  >
                    Confirming subscription...
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

                {currentStep === 4 && (
                  <div className="step-content">
                    <div className="dial-up-prompt recap-prompt">
                      <p className="confirmation-text">
                        Welcome to the Happy Tuesdays community!
                      </p>
                      {/* <h3>Subscription Summary</h3> */}
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
                    className="aol-figure-image aol-figure-fade-in"
                  />
                </div>
              </div>

              {/* Status text positioned below dial-up background */}
              <div className="status-text-container">
                <div
                  key={`connecting-${this.state.statusTextKey}`}
                  className="status-text"
                >
                  Connecting...
                </div>
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
                    <div className="channels-header"></div>
                    <div className="channels-subheader">
                      Choose your interests:
                    </div>
                    {errors.categories && (
                      <span className="error-message categories-error">
                        {errors.categories}
                      </span>
                    )}

                    {/* Column titles for the 4 columns */}
                    <div className="channel-column-titles">
                      <div
                        className="column-title"
                        onClick={() => this.handleColumnSelect("Tech")}
                      >
                        Tech
                      </div>
                      <div
                        className="column-title"
                        onClick={() => this.handleColumnSelect("Design")}
                      >
                        Art/Design
                      </div>
                      <div
                        className="column-title"
                        onClick={() => this.handleColumnSelect("Builders")}
                      >
                        Build/Grow
                      </div>
                      <div
                        className="column-title"
                        onClick={() => this.handleColumnSelect("Gaming")}
                      >
                        Gaming
                      </div>
                    </div>

                    <div className="channel-buttons-grid">
                      {this.channels.map((channel) => (
                        <div
                          key={channel.id}
                          className={cx("channel-button", channel.className, {
                            selected: formData.selectedChannels[channel.id],
                          })}
                          onClick={() => this.handleChannelToggle(channel.id)}
                          onMouseEnter={(e) =>
                            this.handleChannelHover(channel.id, e)
                          }
                          onMouseLeave={this.handleChannelHoverLeave}
                          data-channel-name={channel.name} // Add for accessibility
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
                      Back
                    </button>
                    <div className="channel-description">
                      {this.getActiveDescription()}
                    </div>
                    <button
                      onClick={this.handleNextStep}
                      className="aol-button aol-button-continue"
                    >
                      Next →
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
