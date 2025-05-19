import React, { Component } from "react";
import ReactDOM from "react-dom";
import StarfieldContainer from "../StarfieldContainer";
import Starfield2 from "../Starfield2";
import BouncyBallsScreensaver from "../BouncyBalls";
import FlowerBoxScreensaver from "../FlowerBoxScreensaver";
import PipesScreensaver from "../PipesScreensaver";

/**
 * Component to handle rendering the various screensavers
 */
class ScreensaverRenderer extends Component {
  constructor(props) {
    super(props);

    if (!props.isMobile) {
      // Create root elements for our screensaver portals
      this.starfieldRoot = document.createElement("div");
      this.starfieldRoot.id = "starfield-root";

      this.p5jsStarfieldRoot = document.createElement("div");
      this.p5jsStarfieldRoot.id = "p5js-starfield-root";

      this.bouncyBallsRoot = document.createElement("div");
      this.bouncyBallsRoot.id = "BouncyBalls-root";

      this.flowerboxRoot = document.createElement("div");
      this.flowerboxRoot.id = "flowerbox-root";

      this.pipesRoot = document.createElement("div");
      this.pipesRoot.id = "pipes-root";
    }
  }

  componentDidMount() {
    if (this.props.isMobile) return;

    // Append portal roots to the document body
    document.body.appendChild(this.starfieldRoot);
    document.body.appendChild(this.p5jsStarfieldRoot);
    document.body.appendChild(this.bouncyBallsRoot);
    document.body.appendChild(this.flowerboxRoot);
    document.body.appendChild(this.pipesRoot);
  }

  componentWillUnmount() {
    if (this.props.isMobile) return;

    // Clean up the portal roots
    if (this.starfieldRoot.parentNode) {
      this.starfieldRoot.parentNode.removeChild(this.starfieldRoot);
    }

    if (this.p5jsStarfieldRoot.parentNode) {
      this.p5jsStarfieldRoot.parentNode.removeChild(this.p5jsStarfieldRoot);
    }

    if (this.bouncyBallsRoot.parentNode) {
      this.bouncyBallsRoot.parentNode.removeChild(this.bouncyBallsRoot);
    }

    if (this.flowerboxRoot.parentNode) {
      this.flowerboxRoot.parentNode.removeChild(this.flowerboxRoot);
    }

    if (this.pipesRoot.parentNode) {
      this.pipesRoot.parentNode.removeChild(this.pipesRoot);
    }
  }

  renderDefaultStarfield() {
    const { isMobile, showScreensaver, activeScreensaver } = this.props;

    // Only render if not mobile and screensaver mode is active with 'default' type
    if (isMobile || !showScreensaver || activeScreensaver !== "default") {
      return null;
    }

    // Create portal for the default starfield
    return ReactDOM.createPortal(<StarfieldContainer />, this.starfieldRoot);
  }

  renderP5jsStarfield() {
    const { isMobile, showScreensaver, activeScreensaver } = this.props;

    // Only render if not mobile and screensaver mode is active with 'p5js' type
    if (isMobile || !showScreensaver || activeScreensaver !== "p5js") {
      return null;
    }

    // Create portal for the P5.js starfield
    return ReactDOM.createPortal(<Starfield2 />, this.p5jsStarfieldRoot);
  }

  renderBouncyBalls() {
    const { isMobile, showScreensaver, activeScreensaver } = this.props;

    if (isMobile || !showScreensaver || activeScreensaver !== "bouncyballs") {
      return null;
    }

    // Create portal for the bouncy balls screensaver
    return ReactDOM.createPortal(
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "black",
          zIndex: 89,
        }}
      >
        <BouncyBallsScreensaver />
      </div>,
      this.bouncyBallsRoot
    );
  }

  renderFlowerBox() {
    const { isMobile, showScreensaver, activeScreensaver } = this.props;

    if (isMobile || !showScreensaver || activeScreensaver !== "flowerbox") {
      return null;
    }

    // Create portal for the FlowerBox screensaver
    return ReactDOM.createPortal(
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "black",
          zIndex: 89,
        }}
      >
        <FlowerBoxScreensaver />
      </div>,
      this.flowerboxRoot
    );
  }

  renderPipes() {
    const { isMobile, showScreensaver, activeScreensaver } = this.props;

    if (isMobile || !showScreensaver || activeScreensaver !== "pipes") {
      return null;
    }

    // Create portal for the Pipes screensaver
    return ReactDOM.createPortal(
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "black",
          zIndex: 89,
        }}
      >
        <PipesScreensaver />
      </div>,
      this.pipesRoot
    );
  }

  render() {
    if (this.props.isMobile) return null;

    return (
      <>
        {this.renderDefaultStarfield()}
        {this.renderP5jsStarfield()}
        {this.renderBouncyBalls()}
        {this.renderFlowerBox()}
        {this.renderPipes()}
      </>
    );
  }
}

export default ScreensaverRenderer;
