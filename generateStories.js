const fs = require('fs');
const path = require('path');

// Adjust this path if your components live somewhere else
const componentsDir = path.join(__dirname, 'src', 'components');

const generateStoryFile = (componentName) => `
import React from 'react';
import ${componentName} from './${componentName}';

export default {
  title: 'Components/${componentName}',
  component: ${componentName},
};

export const Default = () => <${componentName} />;
`;

fs.readdir(componentsDir, (err, files) => {
  if (err) {
    console.error('❌ Error reading components directory:', err);
    return;
  }

  files.forEach((file) => {
    const componentPath = path.join(componentsDir, file);

    // Only process folders (each folder = 1 component)
    if (fs.lstatSync(componentPath).isDirectory()) {
      const storyFilePath = path.join(componentPath, `${file}.stories.js`);
      
      if (!fs.existsSync(storyFilePath)) {
        const storyContent = generateStoryFile(file);
        fs.writeFileSync(storyFilePath, storyContent, 'utf8');
        console.log(`✅ Generated: ${file}.stories.js`);
      } else {
        console.log(`⚠️ Skipped (already exists): ${file}.stories.js`);
      }
    }
  });
});
