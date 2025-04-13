import React, { Component } from "react";
import { WindowProgram } from "packard-belle";
import cx from "classnames";
import Window from "../tools/Window"; // your custom wrapper
import { camera16 } from "../../icons"; // replace with your actual icon
import buildMenu from "../../helpers/menuBuilder";
import "./_styles.scss";

class FileBrowser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showAlert: false,
      isDesktop: window.innerWidth > 1024,
    };
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  handleResize = () => {
    this.setState({ isDesktop: window.innerWidth > 1024 });
  };

  showHelp = () => {
    this.setState({ showAlert: true });
  };

  render() {
    const { props } = this;
    
    return (
      <Window
        {...props}
        title="Pokedex.exe"
        icon={camera16}
        menuOptions={buildMenu({
          ...props,
          componentType: "Calculator",
          showHelp: this.showHelp,
          disableMaximize: true, // Disable maximize option in the menu
        })}
        Component={WindowProgram}
        initialWidth={260}
        initialHeight={200}
        className={cx("FileBrowser", props.className)}
        forceNoMobileMax={true} // Prevent auto-maximization on mobile
        resizable={false} // Disable resizing to prevent manual maximization
        style={{ padding: 8 }}
      >
        <table style={{ width: "100%", fontSize: "14px", borderSpacing: 4 }}>
          <thead>
            <tr>
              <th align="left">Type</th>
              <th align="left">Name</th>
              <th align="left">Level</th>
            </tr>
          </thead>
          <tbody>
            {FileBrowserData.map((entry, index) => (
              <tr key={index}>
                <td>{entry.type}</td>
                <td>{entry.name}</td>
                <td>{entry.level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Window>
    );
  }
}

const FileBrowserData = [
  { type: "🌿", name: "Bulbasaur", level: 64 },
  { type: "🔥", name: "Charizard", level: 209 },
  { type: "⚡", name: "Pikachu", level: 82 },
];

export default FileBrowser;
