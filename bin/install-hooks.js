#!/usr/bin/env bun

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOOKS_DIR = path.join(__dirname, '..', '.git', 'hooks');
const HOOK_PATH = path.join(HOOKS_DIR, 'pre-commit');
const SOURCE_HOOK_PATH = path.join(__dirname, '..', 'hooks', 'pre-commit');

try {
  // Check if .git directory exists
  const gitDir = path.join(__dirname, '..', '.git');
  if (!fs.existsSync(gitDir)) {
    console.error('❌ Error: .git directory not found. Are you in a git repository?');
    process.exit(1);
  }

  // Create hooks directory if it doesn't exist
  if (!fs.existsSync(HOOKS_DIR)) {
    fs.mkdirSync(HOOKS_DIR, { recursive: true });
    console.log('📁 Created .git/hooks directory');
  }

  // Check if source hook exists
  if (!fs.existsSync(SOURCE_HOOK_PATH)) {
    console.error(`❌ Error: Source hook not found at ${SOURCE_HOOK_PATH}`);
    process.exit(1);
  }

  // Copy the hook file
  fs.copyFileSync(SOURCE_HOOK_PATH, HOOK_PATH);

  // Make it executable (Unix-like systems only, Windows doesn't need this)
  if (process.platform !== 'win32') {
    fs.chmodSync(HOOK_PATH, 0o755);
  }

  console.log('✅ Pre-commit hook installed successfully!');
  console.log(`   Installed to: ${HOOK_PATH}`);
} catch (error) {
  console.error('❌ Error installing hook:', error.message);
  process.exit(1);
}
