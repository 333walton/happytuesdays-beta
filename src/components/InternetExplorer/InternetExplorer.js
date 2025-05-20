import React, { Component } from "react";
import cx from "classnames";
import nanoid from "nanoid";
import * as icons from "../../icons";
import "./_styles.scss";
import { WindowExplorer } from "packard-belle";
import Window from "../tools/Window";
import buildMenu from "../../helpers/menuBuilder";
// Import the HamsterCreator component
import HamsterCreator from "../HamsterCreator/HamsterCreator";

const noop = () => {};

const canAccessIframe = (id) => {
  const iframe = document && document.querySelector(`.${id}`);
  const canAccess =
    iframe &&
    iframe.contentDocument &&
    iframe.contentDocument.body &&
    iframe.contentDocument.body.scrollHeight;
  if (canAccess) {
    return {
      height: iframe.contentDocument.body.scrollHeight,
      width: iframe.contentDocument.body.scrollWidth,
    };
  }
};

class InternetExplorer extends Component {
  id = "b".concat(nanoid()).replace("-", "");
  state = { dimensions: { width: 800, height: 400 } };

  componentDidMount() {
    setTimeout(this.getIframeDimension, 3000);
  }

  getIframeDimension = () => {
    const iframeDimensions = canAccessIframe(this.id);
    if (iframeDimensions && iframeDimensions !== this.state.dimensions) {
      this.setState({ dimensions: iframeDimensions });
    }
  };

  render() {
    const { props } = this;
    // Check if this is the README window
    const isReadme =
      props.data &&
      props.data.__html &&
      props.data.__html.includes("hamster-gif");

    return (
      <Window
        {...props}
        Component={WindowExplorer}
        className={cx("InternetExplorer", props.className)}
        resizable={true} // Fixed typo here
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        title={`${
          props.data.title || props.title !== "Internet Explorer"
            ? `${props.data.title || props.title} - `
            : ""
        }Internet Explorer`}
        menuOptions={buildMenu(props)}
        minHeight={300}
        minWidth={300}
        // Remove any max height/width constraints
        maxHeight={window.innerHeight - 50} // Allow resizing to almost full screen
        maxWidth={window.innerWidth - 50} // Allow resizing to almost full screen
        explorerOptions={[
          {
            icon: icons.back,
            title: "Back",
            onClick: noop,
          },
          {
            icon: icons.forward,
            title: "Forward",
            onClick: noop,
          },
          {
            icon: icons.ieStop,
            title: "Stop",
            onClick: noop,
          },
          {
            icon: icons.ieRefresh,
            title: "Refresh",
            onClick: noop,
          },
          {
            icon: icons.ieHome,
            title: "Home",
            onClick: noop,
          },
          [
            {
              icon: icons.ieSearch,
              title: "Search",
              onClick: noop,
            },
            {
              icon: icons.ieFavorites,
              title: "Favorites",
              onClick: noop,
            },
            {
              icon: icons.ieHistory,
              title: "History",
              onClick: noop,
            },
          ],
          {
            icon: icons.ieMail,
            title: "Mail",
            onClick: noop,
          },
          {
            icon: icons.iePrint,
            title: "Print",
            onClick: noop,
          },
        ]}
        maximizeOnOpen
      >
        <div
          className="ie-content-wrapper"
          style={{ width: "100%", height: "100%" }}
        >
          {props.data.__html && (
            <div
              style={{
                margin: "2px 1px 0px 2px",
                minHeight: "calc(100% - 4px)",
              }}
              dangerouslySetInnerHTML={props.data}
            />
          )}

          {/* Add HamsterCreator component conditionally for README */}
          {isReadme && <HamsterCreator />}

          {props.children}

          {props.data &&
            !props.data.html &&
            props.data.src &&
            (this.state.dimensions ? (
              <div
                style={{ width: "100%", height: "100%", position: "relative" }}
              >
                <iframe
                  className={this.id}
                  frameBorder="0"
                  src={props.data.src}
                  title={props.data.src}
                  importance="low"
                  style={{
                    width: "100%",
                    height: "100%",
                    // Remove fixed height constraints
                    // maxHeight: '400px !important', - Removed this constraint
                    border: "none",
                  }}
                />
              </div>
            ) : (
              <iframe
                className={this.id}
                frameBorder="0"
                src={props.data.src}
                title={props.data.src}
                importance="low"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
              />
            ))}
        </div>
      </Window>
    );
  }
}

export default InternetExplorer;
