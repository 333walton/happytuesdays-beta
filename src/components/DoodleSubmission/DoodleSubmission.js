import React, { Component } from "react";
import Window from "../tools/Window";
import { WindowProgram } from "packard-belle";
import { paint16 } from "../../icons";
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
    submissionStatus: null
    };
}

handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
};

handleFileChange = (e) => {
    this.setState({ imageFile: e.target.files[0] });
};

handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder: Hook this into API or local submission logic
    console.log("Doodle submitted:", this.state);
    this.setState({ submissionStatus: "Submitted!" });
};

render() {
    const { doodleName, doodler, statement, submissionStatus } = this.state;

    // Filter out "file" and "help" options from the menu
    const filteredMenuOptions = buildMenu(this.props).filter(
        (option) => option.title.toLowerCase() !== "file" && option.title.toLowerCase() !== "help"
    );

    return (
    <Window
        {...this.props}
        title="Submit Doodle"
        icon={paint16}
        Component={WindowProgram}
        initialWidth={300}
        initialHeight={282}
        resizable={false}           // This disables resizing
        onMaximize={null}           // This disables the maximize button
        menuOptions={filteredMenuOptions} // Pass filtered menu options
        className={cx("DoodleSubmission", this.props.className)}
    >
        <form className="doodle-form" onSubmit={this.handleSubmit}>
        <div className="form-group">
            <label htmlFor="doodleName">Doodle Name</label>
            <input
            type="text"
            id="doodleName"
            name="doodleName"
            value={doodleName}
            onChange={this.handleInputChange}
            required
            />
        </div>

        <div className="form-group">
            <label htmlFor="doodler">Your Name</label>
            <input
            type="text"
            id="doodler"
            name="doodler"
            value={doodler}
            onChange={this.handleInputChange}
            required
            />
        </div>

        <div className="form-group">
            <label htmlFor="statement">Doodle Statement</label>
            <textarea
                id="statement"
                name="statement"
                value={statement}
                onChange={this.handleInputChange}
                rows="3"
                style={{ resize: "none" }} // Prevent resizing
            />
        </div>

        <div className="no-background">
            <label htmlFor="imageFile">Attach Image</label>
            <input
            type="file"
            id="imageFile"
            accept="image/*"
            onChange={this.handleFileChange}
            />
        </div>

        <button type="submit" className="submit-button">
            Submit Doodle
        </button>

        {submissionStatus && (
            <p
                className="submission-status"
                        style={{
                            marginTop: "-22px",
                            marginLeft: "5px"
                 }} // Adjust the value to raise the text
            >
                {submissionStatus}
            </p>
        )}
        </form>
    </Window>
    );
}
}

export default DoodleSubmission;
