#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🚀 Setting up We-Roster Mobile App...\n');

// Check if we're in the right directory
if (!existsSync(join(projectRoot, 'package.json'))) {
  console.error('❌ Error: package.json not found. Please run this script from the frontend directory.');
  process.exit(1);
}

// Read package.json
const packageJsonPath = join(projectRoot, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

console.log('📦 Project:', packageJson.name);
console.log('📋 Version:', packageJson.version);
console.log('🎯 Main entry:', packageJson.main);

// Check for required files
const requiredFiles = [
  'app.json',
  'babel.config.js',
  'tsconfig.json',
  'App.tsx',
  'src/navigation/RootNavigator.tsx',
  'src/contexts/AuthContext.tsx'
];

console.log('\n🔍 Checking required files...');
let missingFiles = [];

for (const file of requiredFiles) {
  const filePath = join(projectRoot, file);
  if (existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    missingFiles.push(file);
  }
}

if (missingFiles.length > 0) {
  console.log('\n⚠️  Warning: Some required files are missing:');
  missingFiles.forEach(file => console.log(`   - ${file}`));
}

// Check environment variables
console.log('\n🌍 Environment variables:');
const envVars = [
  'EXPO_PUBLIC_API_BASE',
  'EXPO_PUBLIC_MOCK_ROSTER',
  'EXPO_PUBLIC_MOCK_LEAVES'
];

for (const envVar of envVars) {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: ${value}`);
  } else {
    console.log(`⚠️  ${envVar}: Not set (using defaults)`);
  }
}

// Check dependencies
console.log('\n📚 Key dependencies:');
const keyDeps = [
  'expo',
  'react',
  'react-native',
  '@react-navigation/native',
  '@react-navigation/bottom-tabs',
  '@react-navigation/native-stack',
  '@react-native-async-storage/async-storage'
];

for (const dep of keyDeps) {
  if (packageJson.dependencies[dep]) {
    console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
  } else if (packageJson.devDependencies[dep]) {
    console.log(`✅ ${dep}: ${packageJson.devDependencies[dep]} (dev)`);
  } else {
    console.log(`❌ ${dep}: Not found`);
  }
}

// Check TypeScript configuration
console.log('\n🔧 TypeScript configuration:');
const tsconfigPath = join(projectRoot, 'tsconfig.json');
if (existsSync(tsconfigPath)) {
  const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'));
  console.log('✅ tsconfig.json found');
  console.log(`   - Compiler: ${tsconfig.compilerOptions?.target || 'default'}`);
  console.log(`   - Module: ${tsconfig.compilerOptions?.module || 'default'}`);
  console.log(`   - JSX: ${tsconfig.compilerOptions?.jsx || 'default'}`);
} else {
  console.log('❌ tsconfig.json not found');
}

// Check Babel configuration
console.log('\n🔧 Babel configuration:');
const babelConfigPath = join(projectRoot, 'babel.config.js');
if (existsSync(babelConfigPath)) {
  console.log('✅ babel.config.js found');
  const babelConfig = readFileSync(babelConfigPath, 'utf8');
  if (babelConfig.includes('module-resolver')) {
    console.log('✅ Module resolver configured');
  } else {
    console.log('⚠️  Module resolver not configured');
  }
} else {
  console.log('❌ babel.config.js not found');
}

// Check source structure
console.log('\n📁 Source structure:');
const srcDirs = [
  'src/api',
  'src/components',
  'src/contexts',
  'src/hooks',
  'src/navigation',
  'src/screens',
  'src/types',
  'src/lib',
  'src/theme'
];

for (const dir of srcDirs) {
  const dirPath = join(projectRoot, dir);
  if (existsSync(dirPath)) {
    console.log(`✅ ${dir}/`);
  } else {
    console.log(`❌ ${dir}/ - MISSING`);
  }
}

// Check for common issues
console.log('\n🔍 Checking for common issues...');

// Check if node_modules exists
const nodeModulesPath = join(projectRoot, 'node_modules');
if (existsSync(nodeModulesPath)) {
  console.log('✅ node_modules found');
} else {
  console.log('⚠️  node_modules not found - run "npm install" first');
}

// Check for .env files
const envFiles = ['.env', '.env.local', '.env.development'];
let envFileFound = false;
for (const envFile of envFiles) {
  if (existsSync(join(projectRoot, envFile))) {
    console.log(`✅ ${envFile} found`);
    envFileFound = true;
  }
}
if (!envFileFound) {
  console.log('⚠️  No .env files found - using default configuration');
}

// Summary
console.log('\n📊 Setup Summary:');
console.log('================');

if (missingFiles.length === 0) {
  console.log('✅ All required files are present');
} else {
  console.log(`⚠️  ${missingFiles.length} required files are missing`);
}

console.log('\n🚀 Next steps:');
console.log('1. Install dependencies: npm install');
console.log('2. Start development server: npm start');
console.log('3. Run on Android: npm run android');
console.log('4. Run on iOS: npm run ios');
console.log('5. Run on Web: npm run web');

console.log('\n📖 Available scripts:');
console.log('- npm run start    : Start Expo development server');
console.log('- npm run android  : Run on Android device/emulator');
console.log('- npm run ios      : Run on iOS device/simulator');
console.log('- npm run web      : Run on web browser');
console.log('- npm run clean    : Clean node_modules and package-lock.json');

console.log('\n🎉 Setup complete! Happy coding! 🎉');
