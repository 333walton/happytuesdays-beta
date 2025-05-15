import React, { createContext, useContext } from "react";
import Window from "../tools/Window";
import "./_customwindow.scss";

// Create context for help functionality
const HelpContext = createContext({
  onHelp: null,
  showHelpButton: true
});

// Custom WindowProgram that uses the HelpContext
const CustomWindowProgram = (props) => {
  // Get onHelp from context rather than props
  const { onHelp, showHelpButton } = useContext(HelpContext);
  
  // Clone the original component but add the help button
  const clonedComponent = React.createElement(
    'div',
    {
      // Add CustomWindow class to enable scoped CSS
      className: `Window CustomWindow ${props.className || ''}`,
      style: {
        ...(props.style || {}),
        position: 'relative',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box'
      }
    },
    [
      // Heading with help button
      React.createElement(
        'div',
        { 
          className: 'Window__heading', 
          key: 'heading'
        },
        [
          // Title area
          React.createElement(
            'div',
            { 
              className: 'Window__title', 
              key: 'title'
            },
            [
              props.icon && React.createElement(
                'img',
                { 
                  src: props.icon, 
                  alt: '', 
                  className: 'Window__title-icon',
                  key: 'icon'
                }
              ),
              React.createElement(
                'div',
                { 
                  className: 'Window__title-text', 
                  key: 'title-text'
                },
                props.title
              )
            ].filter(Boolean)
          ),
          // Controls area
          React.createElement(
            'div',
            { 
              className: 'Window__controls', 
              key: 'controls'
            },
            [
              // Help button
              showHelpButton && React.createElement(
                'button',
                { 
                  className: 'Window__help-button', 
                  onClick: onHelp || (() => console.log("Help button clicked but no onHelp function provided")),
                  'aria-label': 'Help',
                  key: 'help',
                  style: {
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingTop: '1px',
                    paddingRight: '1px'
                  }
                },
                '?'
              ),
              // Minimize button
              props.onMinimize && React.createElement(
                'button',
                { 
                  className: 'Window__minimize', 
                  onClick: props.onMinimize,
                  'aria-label': 'Minimize',
                  key: 'minimize',
                  style: {
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    paddingBottom: '2px'
                  }
                },
                '_'
              ),
              // Maximize button
              props.onMaximize && !props.onRestore && React.createElement(
                'button',
                { 
                  className: 'Window__maximize', 
                  onClick: props.onMaximize,
                  'aria-label': 'Maximize',
                  key: 'maximize',
                  style: {
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingTop: '1px'
                  }
                },
                '□'
              ),
              // Restore button
              props.onRestore && React.createElement(
                'button',
                { 
                  className: 'Window__restore', 
                  onClick: props.onRestore,
                  'aria-label': 'Restore',
                  key: 'restore',
                  style: {
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingTop: '1px'
                  }
                },
                '▫'
              ),
              // Close button
              props.onClose && React.createElement(
                'button',
                { 
                  className: 'Window__close', 
                  onClick: props.onClose,
                  'aria-label': 'Close',
                  key: 'close',
                  style: {
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingTop: '1px',
                    paddingRight: '1px'
                  }
                },
                '×'
              )
            ].filter(Boolean) // Filter out null values
          )
        ]
      ),
      // Content area
      React.createElement(
        'div',
        { 
          className: 'Window__content', 
          key: 'content'
        },
        props.children
      ),
      // Footer (if provided)
      props.footer && React.createElement(
        'div',
        { 
          className: 'Window__footer', 
          key: 'footer'
        },
        props.footer
      )
    ].filter(Boolean) // Filter out null values
  );
  
  return clonedComponent;
};

// Custom Window component to create dragOutline
const DragOutline = ({ width, height, children }) => {
  return (
    <div 
      className="drag-outline"
      style={{
        width,
        height,
        position: 'absolute',
        border: '2px dashed #000',
        background: 'transparent',
        top: 0,
        left: 0,
        pointerEvents: 'none'
      }}
    >
      {children}
    </div>
  );
};

// Custom Window that provides help context
const CustomWindow = (props) => {
  const { onHelp, showHelpButton = true, ...windowProps } = props;
  
  // Create context value
  const helpContextValue = {
    onHelp,
    showHelpButton
  };
  
  return (
    <HelpContext.Provider value={helpContextValue}>
      <Window
        {...windowProps}
        Component={CustomWindowProgram}
        showDragFrame={true} // Show the frame outline during drag
      />
    </HelpContext.Provider>
  );
};

export default CustomWindow;