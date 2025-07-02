# Hydra98 File Explorer Usage Guide

## Overview

The Hydra98 File Explorer is a custom Windows 95-style file manager integrated into the Hydra98 desktop environment. It provides a familiar interface for browsing and managing files within the virtual file system.

## Features

### 1. Navigation

- **Back/Forward buttons**: Navigate through your browsing history
- **Up button**: Go to the parent directory
- **Address bar**: Shows the current path (e.g., `C:/My Documents`)
- **Double-click**: Open folders or files

### 2. View Modes

- **Icons view**: Display files and folders as large icons (default)
- **Details view**: Display files in a table with columns for Name, Size, and Type
- **Tree view**: Always visible on the left side, showing the folder hierarchy
- Toggle between Icons and Details views using the View menu

### 3. File System Structure

The default file system includes:

```
C:/
├── Windows/
│   └── System32/
│       └── notepad.exe
├── Program Files/
│   └── Hydra98/
│       └── readme.txt
└── My Documents/
    ├── ASCII Art/
    │   ├── flames.txt (opens Burn app)
    │   ├── pipes.txt (opens Pipes app)
    │   └── hourglass.txt (opens Sand app)
    ├── sample.txt
    └── image.jpg
```

### 4. File Integration

- **Text files (.txt)**: Open in Notepad
- **ASCII Art files**: Open in their respective animation apps (Burn, Pipes, Sand)
- **Image files**: Open in ImageWindow (when implemented)

### 5. Toolbar Functions

- **Cut/Copy/Paste**: File operations (placeholder - not yet implemented)
- **Delete**: Remove files (placeholder - not yet implemented)
- **Properties**: View file properties (placeholder - not yet implemented)

## Usage

### Opening the File Explorer

1. Click the Start button
2. Navigate to Documents → My Docs
3. Click on "File Manager"

### Navigating Folders

1. Double-click on any folder to open it (in the main panel or tree view)
2. Click on folders in the tree view to navigate quickly
3. Use the Up button to go to the parent folder
4. Use Back/Forward buttons to navigate through your history
5. The address bar shows the current path (integrated with WindowExplorer)

### Opening Files

1. Double-click on any file to open it
2. Text files will open in Notepad with their content
3. Special ASCII art files will launch their respective animation apps

### Changing View Mode

1. Click on the View menu
2. Select either "Icons" or "Details"
3. The current view mode will have a checkmark (✓)

## Technical Details

### Component Location

- Main component: `src/components/CuboneFileExplorer/CuboneFileExplorer.js`
- Styles: `src/components/CuboneFileExplorer/_styles.scss`
- Index: `src/components/CuboneFileExplorer/index.js`

### File System Data Structure

Files and folders are defined in a hierarchical structure:

```javascript
{
  "/": {
    "C:": {
      type: "folder",
      icon: "hdd32",
      children: {
        "My Documents": {
          type: "folder",
          icon: "folderOpen32",
          children: {
            "sample.txt": {
              type: "file",
              icon: "notepadFile16",
              content: "File content here",
              size: "1 KB",
              component: "Notepad"
            }
          }
        }
      }
    }
  }
}
```

### Adding New Files

To add files to the file system, update the `fileSystem` object in `src/data/start.js` under the File Manager entry in the My Docs section.

### Customization

- The file system can be customized by modifying the data structure
- Icons can be changed by updating the `icon` property
- File associations can be modified by changing the `component` property

## Known Limitations

- Cut/Copy/Paste operations are not yet implemented
- Delete functionality is not yet implemented
- File properties dialog is not yet implemented
- Cannot create new files or folders through the UI
- No drag-and-drop support yet
- Tree view cannot be hidden (always visible)

## Troubleshooting

### Files Not Showing

If files are not displaying:

1. Check the browser console for navigation errors
2. Verify the file system structure in the data
3. Ensure the initial path matches an existing folder

### Navigation Issues

If navigation buttons don't work:

1. Check that the path format is correct (e.g., `C:/My Documents`)
2. Verify that parent folders exist in the file system structure

## Future Enhancements

- Implement file operations (cut, copy, paste, delete)
- Add context menu support
- Enable file/folder creation
- Add drag-and-drop functionality
- Implement file search
- Add file properties dialog
- Support for more file types and associations
