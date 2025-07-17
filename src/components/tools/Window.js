import React from "react";
import cx from "classnames";
import { Rnd } from "react-rnd";
import { SettingsContext } from "../../contexts";
import "./_window.scss";

const handleClasses = {
  top: "ns-resize",
  topRight: "nesw-resize",
  right: "ew-resize",
  bottomRight: "nwse-resize",
  bottom: "ns-resize",
  bottomLeft: "nesw-resize",
  left: "ew-resize",
  topLeft: "nwse-resize",
};

const resizeStyles = (pixels) => {
  const thickness = pixels + 1;
  const nsOffset = 2;
  const ewOffset = 2;

  return {
    top: {
      height: thickness,
      top: -thickness / 2 + nsOffset,
      left: 0,
      right: 0,
    },
    topRight: {
      width: thickness,
      height: thickness,
      top: -thickness / 2 + nsOffset,
      right: -thickness / 2 + ewOffset,
    },
    right: {
      width: thickness,
      top: 0,
      right: -thickness / 2 + ewOffset,
      bottom: 0,
    },
    bottomRight: {
      width: thickness,
      height: thickness,
      bottom: -thickness / 2 + nsOffset,
      right: -thickness / 2 + ewOffset,
    },
    bottom: {
      height: thickness,
      left: 0,
      right: 0,
      bottom: -thickness / 2 + nsOffset,
    },
    bottomLeft: {
      width: thickness,
      height: thickness,
      bottom: -thickness / 2 + nsOffset,
      left: -thickness / 2 + ewOffset,
    },
    left: {
      width: thickness,
      top: 0,
      left: -thickness / 2 + ewOffset,
      bottom: 0,
    },
    topLeft: {
      width: thickness,
      height: thickness,
      top: -thickness / 2 + nsOffset,
      left: -thickness / 2 + ewOffset,
    },
  };
};

const randomizeLaunchSpot = (max) => Math.ceil(Math.random() * max);

const launchPositions = (propX, propY, isMobile) => {
  const random = randomizeLaunchSpot(80);
  const x = propX || random;
  const y = propY || random;
  return !isMobile
    ? {
        x,
        y,
      }
    : {
        x: x / 2,
        y: y / 2,
      };
};

class Window extends React.PureComponent {
  static contextType = SettingsContext;

  state = {
    height: this.props.initialHeight,
    width: this.props.initialWidth,
    maximized:
      (!this.props.forceNoMobileMax &&
        this.context?.isMobile &&
        this.props.resizable) ||
      this.props.maximizeOnOpen,
    ...launchPositions(this.props.initialX, this.props.initialY),
  };

  updateLocation = (a, b) => {
    this.setState({ x: b.x, y: b.y, isDragging: false });
  };
  resize = (e, direction, ref, delta, position) =>
    this.setState({
      width: ref.style.width,
      height: ref.style.height,
      ...position,
    });
  maximize = () => this.setState({ maximized: true });
  restore = () => this.setState({ maximized: false });
  toggleDrag = (val) => () => this.setState({ isDragging: val });
  toggleResize = (val) => () => this.setState({ isResizing: val });

  render() {
    const { context, props } = this;
    const resizeProps =
      this.props.resizable && !this.state.maximized
        ? {
            resizeHandleStyles: resizeStyles(4),
            onResize: this.resize,
            onResizeStart: this.toggleResize(true),
            onResizeStop: this.toggleResize(false),
          }
        : { resizeHandleStyles: resizeStyles(0) };

    const maximizedProps = this.state.maximized
      ? {
          size: { width: "100%" },
          position: { x: -2, y: -3 },
          disableDragging: true,
        }
      : undefined;
    return (
      <Rnd
        className={cx({
          "react-draggable-maximized-hack": this.state.maximized,
          "Window--minimized": this.props.minimized,
          "react-draggable-dragging": this.state.isDragging,
        })}
        style={{
          zIndex: this.props.zIndex,
          visibility: this.props.minimized ? "hidden" : undefined,
        }}
        size={
          !this.state.maximized && {
            width: this.state.width,
            height: this.state.height,
          }
        }
        position={{ x: this.state.x, y: this.state.y }}
        dragHandleClassName="Window__title"
        disableDragging={props.draggable === false || this.state.maximized}
        resizeHandleClasses={handleClasses}
        onDragStart={this.toggleDrag(true)}
        onDragStop={!this.state.maximized && this.updateLocation}
        bounds=".w98"
        minWidth={this.props.minWidth}
        minHeight={this.props.minHeight}
        scale={context.scale}
        onMouseDown={
          this.props.moveToTop
            ? () => this.props.moveToTop(this.props.id)
            : undefined
        }
        {...resizeProps}
        {...maximizedProps}
      >
        {props.Component ? (
          <props.Component
            title={props.title}
            icon={props.icon}
            footer={props.footer}
            onOpen={props.multiInstance && props.onOpen}
            onClose={() => props.onClose(props)}
            onMinimize={props.onMinimize && (() => props.onMinimize(props.id))}
            onRestore={props.resizable ? this.restore : undefined}
            onMaximize={props.onMaximize !== null ? this.maximize : undefined}
            disableMaximize={props.onMaximize === null}
            changingState={this.state.isDragging || this.state.isResizing}
            maximizeOnOpen={
              (!this.props.forceNoMobileMax && this.context.isMobile) ||
              this.props.maximizeOnOpen
            }
            className={cx(props.className, {
              "Window--active": props.isActive,
            })}
            resizable={props.resizable}
            menuOptions={props.menuOptions}
            hasMenu={props.hasMenu}
            explorerOptions={props.explorerOptions}
            data={props.data}
            style={props.style}
            children={props.children}
          />
        ) : (
          <div>
            Error: Component not found
            {console.error("Component not found:", props.Component)}
          </div>
        )}
      </Rnd>
    );
  }
}

Window.defaultProps = {
  minWidth: 162,
  minHeight: 137,
  initialWidth: 200,
  initialHeight: 200,
  resizable: true,
  scale: 1,
  title: "Needs default",
};

export default Window;
