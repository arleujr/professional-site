import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requiredFiles = [
  '.env.example',
  '.github/workflows/ci.yml',
  'README.md',
  'README.pt-BR.md',
  'SECURITY.md',
  'api/contact.js',
  'package-lock.json',
  'src/contact/email-template.js',
  'src/contact/messages.js',
  'src/contact/validation.js',
  'tests/contact.test.js',
];

async function collectJavaScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (['.git', 'node_modules'].includes(entry.name)) continue;

    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectJavaScriptFiles(fullPath));
    else if (/\.(?:js|mjs)$/.test(entry.name)) files.push(fullPath);
  }

  return files;
}

for (const relativeFile of requiredFiles) {
  await readFile(path.join(projectRoot, relativeFile));
}

const packageJson = JSON.parse(await readFile(path.join(projectRoot, 'package.json'), 'utf8'));
assert.equal(packageJson.version, '1.2.0', 'package.json must declare version 1.2.0');
assert.equal(packageJson.type, 'module', 'package.json must use ESM');

const files = await collectJavaScriptFiles(projectRoot);
for (const file of files) {
  execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
}

const secretPattern = /\bre_[A-Za-z0-9_-]{16,}\b/;
for (const relativeFile of ['.env.example', 'api/contact.js', 'README.md', 'README.pt-BR.md']) {
  const content = await readFile(path.join(projectRoot, relativeFile), 'utf8');
  assert.equal(secretPattern.test(content), false, `Possible Resend key found in ${relativeFile}`);
}

console.log(`Project validation passed: ${files.length} JavaScript files checked.`);
