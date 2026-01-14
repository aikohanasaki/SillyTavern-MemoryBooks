#!/usr/bin/env bun

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const HOOK_PATH = path.join(__dirname, '..', '.git', 'hooks', 'pre-commit');
const SOURCE_HOOK_PATH = path.join(__dirname, '..', 'hooks', 'pre-commit');

console.log('\n' + '='.repeat(60));
console.log('📕 Memory Books - Post-install');
console.log('='.repeat(60) + '\n');

// Check if .git directory exists (might not exist in npm package installations)
const gitDir = path.join(__dirname, '..', '.git');
if (!fs.existsSync(gitDir)) {
  console.log('ℹ️  No .git directory found - skipping hook installation check');
  console.log('   (This is normal for npm/bun package installations)\n');
  process.exit(0);
}

// Check if the pre-commit hook is already installed
if (fs.existsSync(HOOK_PATH)) {
  // Check if it's our hook by comparing content
  try {
    const installedHook = fs.readFileSync(HOOK_PATH, 'utf8');
    const sourceHook = fs.readFileSync(SOURCE_HOOK_PATH, 'utf8');

    if (installedHook === sourceHook) {
      console.log('✅ Git pre-commit hook is already installed and up to date!\n');
    } else {
      console.log('⚠️  A different pre-commit hook is already installed.');
      console.log('   To update it, run: bun run install-hooks\n');
    }
  } catch (err) {
    if (err.code === 'ENOENT' && err.path?.includes('hooks/pre-commit')) {
      console.log('❌ Source hook file (hooks/pre-commit) not found!');
      console.log('   The repository may be in an inconsistent state.\n');
    } else {
      console.log('⚠️  Could not verify pre-commit hook installation.');
      console.log('   To reinstall, run: bun run install-hooks\n');
    }
  }
} else {
  console.log('📋 Git pre-commit hook is not installed.');
  console.log('   This hook automatically runs the build and adds artifacts to commits.\n');
  console.log('   To install it, run: \x1b[1;36mbun run install-hooks\x1b[0m\n');
}

console.log('='.repeat(60) + '\n');

