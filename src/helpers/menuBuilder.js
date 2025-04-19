// 🚀 Update this to allow single-click menu items (like for ImageWindow)
const buildCustomOptions = (rows) =>
  Object.keys(rows).reduce((acc, val) => {
    const menuEntry = rows[val];

    if (typeof menuEntry === "object" && menuEntry?.onClick) {
      return [
        ...acc,
        {
          title: val,
          onClick: menuEntry.onClick,
          options: [] // ✅ required to avoid crash in .reduce()
        }
      ];
    }

    return [
      ...acc,
      {
        title: val,
        options: menuEntry
      }
    ];
  }, []);


// 🎯 Adjusted helpOptions to work with buildCustomOptions
export const helpOptions = (props) => {
  if (props.componentType === "Doom") {
    return {
      title: "Help",
      options: [
        [{ title: "Help Topics", onClick: props.showHelp, isDisabled: true }],
        { title: `About ${props.title}`, isDisabled: true }
      ]
    };
  }
  else if (props.componentType === "ImageWindow") {
    // 🔥 No dropdown — triggers onClick instantly
    return {
      title: "About This Doodle",
      options: [],
      onClick: props.showAbout
    };
  }
  else {
    return {
      title: "Help",
      options: [
        [{ title: "Help Topics", onClick: () => alert("Help Topics clicked"), isDisabled: true }],
        { title: `About ${props.title}`, isDisabled: true }
      ]
    };
  }
};


// 🛠 No changes needed here
export const buildMenu = (props, customOptions = {}) => {
  const fileOptions = props.fileOptions || [];
  const onClose = [{ title: "Close", onClick: () => props.onClose(props) }];
  let saveOptions = [];

if (props.componentType === "ASCIIText") {
  if (props.onSaveAs) {
    saveOptions.push({
      title: "Save As...",
      onClick: data => props.onSaveAs(props, data)
    });
  }
} else {
  if (props.onSaveAs) {
    saveOptions.push({
      title: "Save As...",
      onClick: data => props.onSaveAs(props, data)
    });
  }

  if (props.onSave) {
    saveOptions.push({
      title: "Save",
      onClick: data => props.onSave(props, data),
      isDisabled: props.readOnly
    });
  }
}

  const multiInstance = props.multiInstance
    ? [
        {
          title: "New",
          onClick: () => props.onOpen(props, { new: true }),
          isDisabled: props.singleInstance
        },
        {
          title: "Open...",
          isDisabled: !props.onOpenSearch,
          onClick: props.onOpenSearch
        }
      ]
    : [];
  if (props.multiWindow) {
    onClose.push([{ title: "Exit", onClick: () => props.onExit(props) }]);
  }

  const customElements = buildCustomOptions(customOptions);

  return [
    {
      title: "File",
      options: [...multiInstance, saveOptions, ...fileOptions, onClose]
    },
    ...customElements,
    helpOptions(props)
  ];
};

export default buildMenu;

