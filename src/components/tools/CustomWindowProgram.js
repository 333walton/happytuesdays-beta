import React from "react";
import cx from "classnames";
import "./_customwindow.scss";
import ClippyService from "../ClippyAssistant/ClippyService";

// This is a simplified version focusing on making the help button work
const CustomWindowProgram = (props) => {
  // Destructure all props explicitly to ensure we capture onHelp
  const {
    title,
    icon,
    footer,
    onClose,
    onMinimize,
    onMaximize,
    onRestore,
    onHelp,
    showHelpButton = true,
    className,
    children,
    changingState,
    style,
    ...restProps
  } = props;

  // Here's the key change - we force showMaximize to always be true during dragging
  // if it was true before dragging started
  const showMaximize = onMaximize && !onRestore;

  // Create a handler for the help button that uses ClippyService
  const handleHelpClick = () => {
    // First try to use ClippyService
    const helpShown = ClippyService.handleWindowHelp(title);

    // Then call the original onHelp if provided
    if (onHelp) {
      onHelp();
    }
  };

  // Use a fully custom component that will definitely include our help button
  return (
    <div
      className={cx("Window", className, { "Window--changing": changingState })}
      style={style}
      {...restProps}
    >
      <div className="Window__heading" style={{ height: "17px" }}>
        <div className="Window__title">
          {icon && <img src={icon} alt="" className="Window__title-icon" />}
          <div className="Window__title-text">{title}</div>
        </div>
        <div
          className="Window__controls"
          style={{ display: "flex", alignItems: "center" }}
          // Force this to always be visible during dragging
          data-always-show="true"
        >
          {/* Help button with updated click handler */}
          {showHelpButton && (
            <button
              className="Window__help-button"
              onClick={handleHelpClick}
              aria-label="Help"
              style={{
                display: "inline-flex",
                justifyContent: "center",
                alignItems: "center",
                width: "16px",
                height: "14px",
                marginRight: "2px",
                padding: 0,
                border: "1px solid",
                borderTopColor: "#dfdfdf",
                borderLeftColor: "#dfdfdf",
                borderRightColor: "#808080",
                borderBottomColor: "#808080",
                background: "#c0c0c0",
                color: "#000",
                fontSize: "11px",
                fontWeight: "bold",
                boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #707070",
                cursor: "pointer",
              }}
            >
              ?
            </button>
          )}
          {onMinimize && (
            <button
              className="Window__minimize"
              onClick={onMinimize}
              aria-label="Minimize"
            >
              _
            </button>
          )}
          {/* Always render the button but hide it with CSS if needed */}
          <button
            className="Window__maximize always-show-during-drag"
            onClick={onMaximize}
            aria-label="Maximize"
            // Use inline style to control visibility based on props
            style={{
              display: showMaximize ? "flex" : "none",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            □
          </button>
          {onRestore && (
            <button
              className="Window__restore"
              onClick={onRestore}
              aria-label="Restore"
            >
              ▫
            </button>
          )}
          {onClose && (
            <button
              className="Window__close"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          )}
        </div>
      </div>
      <div className="Window__content">{children}</div>
      {footer && <div className="Window__footer">{footer}</div>}
    </div>
  );
};

export default CustomWindowProgram;
