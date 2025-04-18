// generateToolStories.js

const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'src', 'components', 'tools');
const storiesDir = path.join(toolsDir, 'stories');

if (!fs.existsSync(storiesDir)) {
  fs.mkdirSync(storiesDir);
}

const generateStoryContent = (componentName) => `import React from 'react';
import Window from '../Window';
import ${componentName} from '../${componentName}';
import { WindowProgram } from 'packard-belle';

export default {
  title: 'Tools/${componentName}',
  component: ${componentName},
};

export const WrappedInWindow = () => (
  <Window
    title="${componentName} Tool"
    Component={WindowProgram}
    initialWidth={320}
    initialHeight={200}
    icon=""
  >
    <${componentName} />
  </Window>
);
`;

fs.readdirSync(toolsDir).forEach((file) => {
  const ext = path.extname(file);
  const base = path.basename(file, ext);
  const fullPath = path.join(toolsDir, file);

  if (
    fs.lstatSync(fullPath).isFile() &&
    ext === '.js' &&
    base !== 'index' &&
    base !== 'Window' &&
    base !== 'stories'
  ) {
    const storyPath = path.join(storiesDir, `${base}.stories.js`);
    if (!fs.existsSync(storyPath)) {
      fs.writeFileSync(storyPath, generateStoryContent(base));
      console.log(`✅ Created story with window wrapper: ${base}.stories.js`);
    }
  }
});
