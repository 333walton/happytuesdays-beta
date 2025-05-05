import React, { Component, createRef } from "react";
import Window from "../tools/Window";
import { WindowProgram, WindowAlert } from "packard-belle";
import buildMenu from "../../helpers/menuBuilder";
import cx from "classnames";
import "./_styles.scss";

class DoodleSubmission extends Component {
  constructor(props) {
    super(props);
    this.state = {
      doodleName: "",
      doodler: "",
      statement: "",
      imageFile: null,
      submissionStatus: null,
      displayAlert: false,
    };

    // Create a ref for the file input
    this.fileInputRef = createRef();
  }

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      this.setState({ imageFile: file });
      console.log("File selected:", file.name);
    }
  };

  handleFileButtonClick = () => {
    // Programmatically click the hidden file input
    this.fileInputRef.current.click();
  };

  handleSubmit = (e) => {
    e.preventDefault();
    console.log("Doodle submitted:", this.state);
    this.setState({ submissionStatus: "Submission successful!" });
  };

  confirm = () => {
    console.log("Alert confirmed");
    this.setState({ displayAlert: false });
  };

  render() {
    const { doodleName, doodler, statement, submissionStatus, imageFile } = this.state;

    const commonProps = {
      title: "Alert",
      zIndex: 1000,
      onClose: () => this.setState({ displayAlert: false }),
    };

    const filteredMenuOptions = buildMenu(this.props).filter(
      (option) => option.title.toLowerCase() !== "file" && option.title.toLowerCase() !== "help"
    );

    return (
      <Window
        {...this.props}
        title="Submit Doodle"
        Component={WindowProgram}
        initialWidth={320}
        initialHeight={260}
        resizable={false}
        onMaximize={null}
        menuOptions={filteredMenuOptions}
        className={cx("DoodleSubmission", this.props.className)}
      >
        <form className="doodle-form" onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label htmlFor="doodleName" className="w98-label">Doodle Name:</label>
            <input
              type="text"
              id="doodleName"
              name="doodleName"
              value={doodleName}
              onChange={this.handleInputChange}
              className="w98-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="statement" className="w98-label">Doodle Statement:</label>
            <textarea
              id="statement"
              name="statement"
              value={statement}
              onChange={this.handleInputChange}
              rows="3"
              className="w98-textarea"
            />
          </div>

          <div className="form-group">
            <label htmlFor="imageFile" className="w98-label">Attach Image:</label>
            <div className="file-input-container">
              {/* Hidden file input */}
              <input
                type="file"
                id="imageFile"
                accept="image/*"
                onChange={this.handleFileChange}
                ref={this.fileInputRef}
                style={{ display: "none" }}
              />
              {/* Button to trigger file input */}
              <button
                type="button"
                className="pb-button"
                onClick={this.handleFileButtonClick}
              >
                Choose File
              </button>
              <span
                className="file-name"
                style={{ marginTop: "2px" }}
              >
                {imageFile ? imageFile.name : "No file chosen"}
              </span>
            </div>
          </div>

          <button type="submit" className="pb-button">
            Submit Doodle
          </button>

          {submissionStatus && (
            <div className="submission-status">
              {submissionStatus}
            </div>
          )}
        </form>

        {this.state.displayAlert && !this.props.data?.disableAlert && (
          <WindowAlert
            {...commonProps}
            onOK={this.confirm}
            onCancel={commonProps.onClose}
            className="IframeWindow--alert Window--active"
          >
            {this.props.data?.disclaimer || (
              <div>
                The following is an iframe, content belongs to{" "}
                {this.props.data?.creator || "the original creator"} at{" "}
                <a
                  href={this.props.data?.src}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {this.props.data?.src}
                </a>
                . Behaviour will be inconsistent with rest of system.
              </div>
            )}
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
      </Window>
    );
  }
}

export default DoodleSubmission;