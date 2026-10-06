const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const { resolve } = require('metro-resolver');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [monorepoRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(monorepoRoot, 'node_modules'),
];

const reactEntry = path.resolve(monorepoRoot, 'node_modules/react/index.js');
const reactDomEntry = path.resolve(monorepoRoot, 'node_modules/react-dom/index.js');
const schedulerEntry = path.resolve(monorepoRoot, 'node_modules/scheduler/index.js');
const reactJsxRuntimeEntry = path.resolve(monorepoRoot, 'node_modules/react/jsx-runtime.js');
const reactJsxDevRuntimeEntry = path.resolve(monorepoRoot, 'node_modules/react/jsx-dev-runtime.js');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react') {
    return { filePath: reactEntry, type: 'sourceFile' };
  }
  if (moduleName === 'react/jsx-runtime') {
    return { filePath: reactJsxRuntimeEntry, type: 'sourceFile' };
  }
  if (moduleName === 'react/jsx-dev-runtime') {
    return { filePath: reactJsxDevRuntimeEntry, type: 'sourceFile' };
  }
  if (moduleName === 'react-dom') {
    return { filePath: reactDomEntry, type: 'sourceFile' };
  }
  if (moduleName === 'scheduler') {
    return { filePath: schedulerEntry, type: 'sourceFile' };
  }
  return resolve(context, moduleName, platform);
};

module.exports = config;
