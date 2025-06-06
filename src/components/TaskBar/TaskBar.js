import React, { useState, useEffect, useRef } from "react";
import { TaskBar as TaskBarComponent } from "packard-belle";
import { ProgramContext } from "../../contexts";

// Custom tooltip component
const CustomTooltip = ({ text, visible }) => {
  if (!visible) return null;
  
  return (
    <div style={{
      position: 'absolute',
      bottom: 'calc(100% + 30px)',
      left: '105px',
      backgroundColor: '#ffffcc',
      border: '1px solid black',
      padding: '2px 4px',
      fontSize: '10px',
      whiteSpace: 'nowrap',
      zIndex: 99999,
      pointerEvents: 'none'
    }}>
      {text}
    </div>
  );
};

const TaskBar = () => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipTimeout, setTooltipTimeout] = useState(null);
  const taskbarRef = useRef(null);
  const [tooltipText, setTooltipText] = useState('');
  const clippyButtonRef = useRef(null);

  const handleMouseEnter = () => {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
    }
    setTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setTooltipVisible(false);
    }, 200);
    setTooltipTimeout(timeout);
  };

  // Find and modify the Clippy button after render
  useEffect(() => {
    const findClippyButton = () => {
      if (!taskbarRef.current) return;

      const buttons = taskbarRef.current.querySelectorAll('button');
      const clippyButton = Array.from(buttons).find(button => {
        const hasClippyIcon = button.innerHTML.includes('textchat32');
        const hasClippyTitle = button.title === 'Show Clippy' || button.title === 'Hide Clippy';
        return hasClippyIcon || hasClippyTitle;
      });

      if (clippyButton) {
        clippyButtonRef.current = clippyButton;
        const buttonTitle = clippyButton.title;
        setTooltipText(buttonTitle);
        
        clippyButton.addEventListener('mouseenter', handleMouseEnter);
        clippyButton.addEventListener('mouseleave', handleMouseLeave);
        
        clippyButton.removeAttribute('title');
        clippyButton.removeAttribute('data-tooltip');

        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'title') {
              const newTitle = clippyButton.getAttribute('title');
              if (newTitle) {
                setTooltipText(newTitle);
                clippyButton.removeAttribute('title');
              }
            }
          });
        });

        observer.observe(clippyButton, {
          attributes: true,
          attributeFilter: ['title']
        });
        
        return () => {
          clippyButton.removeEventListener('mouseenter', handleMouseEnter);
          clippyButton.removeEventListener('mouseleave', handleMouseLeave);
          observer.disconnect();
        };
      }
    };

    const cleanup = findClippyButton();
    const timeoutId = setTimeout(findClippyButton, 1000);

    return () => {
      if (cleanup) cleanup();
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <ProgramContext.Consumer>
      {context => (
        <div ref={taskbarRef} style={{ position: 'relative' }}>
          <TaskBarComponent
            options={context.startMenu}
            quickLaunch={context.quickLaunch.map(item => {
              if (item.title === "Show Clippy" || item.title === "Hide Clippy") {
                return {
                  ...item,
                  isActive: item.active,
                  dataActive: item.active ? "true" : "false",
                  title: item.title,
                  className: `quick-launch-button-clippy btn ButtonIconSmall ${item.className || ''}`,
                  style: {
                    position: 'relative'
                  }
                };
              }
              return {
                ...item,
                isActive: item.active,
                dataActive: item.active ? "true" : "false"
              };
            })}
            openWindows={context.openOrder.map(windowId => {
              const { activePrograms } = context;
              const isActive = windowId === context.activeId;
              const onClick = isActive ? context.onMinimize : context.moveToTop;
              const { title, icon } = activePrograms[windowId];
              return {
                id: windowId,
                title,
                icon,
                isActive,
                onClick: () => onClick(windowId)
              };
            })}
          />
          <CustomTooltip text={tooltipText} visible={tooltipVisible} />
        </div>
      )}
    </ProgramContext.Consumer>
  );
};

export default TaskBar;
