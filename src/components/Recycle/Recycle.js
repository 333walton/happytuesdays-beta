import React from 'react';
import recycle32 from '../../icons'; // Ensure the correct file extension and path
import './_styles.scss'; // Ensure the correct file extension and path

class Recycle extends React.Component {
  handleDoubleClick = () => {
    window.location.href = this.props.href;
  };

  render() {
    const { title, className } = this.props;

    return (
      <div className={className} onDoubleClick={this.handleDoubleClick}>
        <img src={recycle32} alt={title} />
        <span>{title}</span>
      </div>
    );
  }
}

export default Recycle;