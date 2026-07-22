import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

const ignoredDirectories = new Set([
  '.git',
  'coverage',
  'node_modules',
]);

const ignoredReferencePattern =
  /^(?:#|https?:|mailto:|tel:|data:|javascript:|blob:|\/\/)/i;

async function collectFiles(directory, extensions) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) {
      continue;
    }

    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectFiles(absolutePath, extensions));
      continue;
    }

    if (extensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(absolutePath);
    }
  }

  return files;
}

function decodeReference(reference) {
  try {
    return decodeURIComponent(reference);
  } catch {
    return reference;
  }
}

function normalizeReference(reference) {
  const withoutFragment = reference.split('#', 1)[0];
  const withoutQuery = withoutFragment.split('?', 1)[0];

  return decodeReference(withoutQuery.trim());
}

function resolveLocalReference(sourceFile, reference) {
  const normalized = normalizeReference(reference);

  if (!normalized || ignoredReferencePattern.test(normalized)) {
    return null;
  }

  const isRootRelative = normalized.startsWith('/');
  const relativeReference = isRootRelative
    ? normalized.replace(/^\/+/, '')
    : normalized;

  let targetPath = isRootRelative
    ? path.resolve(projectRoot, relativeReference)
    : path.resolve(path.dirname(sourceFile), relativeReference);

  if (normalized.endsWith('/')) {
    targetPath = path.join(targetPath, 'index.html');
  }

  const relativeToRoot = path.relative(projectRoot, targetPath);
  const escapesProject =
    relativeToRoot.startsWith('..') ||
    path.isAbsolute(relativeToRoot);

  assert.equal(
    escapesProject,
    false,
    `${path.relative(projectRoot, sourceFile)} references a path outside the project: ${reference}`,
  );

  return targetPath;
}

function extractHtmlReferences(content) {
  const references = [];
  const attributePattern =
    /\b(src|href|poster)\s*=\s*(["'])(.*?)\2/gi;
  const srcsetPattern =
    /\bsrcset\s*=\s*(["'])(.*?)\1/gi;

  for (const match of content.matchAll(attributePattern)) {
    references.push({
      attribute: match[1].toLowerCase(),
      value: match[3],
    });
  }

  for (const match of content.matchAll(srcsetPattern)) {
    const candidates = match[2]
      .split(',')
      .map((candidate) => candidate.trim().split(/\s+/, 1)[0])
      .filter(Boolean);

    for (const candidate of candidates) {
      references.push({
        attribute: 'srcset',
        value: candidate,
      });
    }
  }

  return references;
}

function extractCssReferences(content) {
  const references = [];
  const urlPattern = /url\(\s*(["']?)(.*?)\1\s*\)/gi;

  for (const match of content.matchAll(urlPattern)) {
    references.push({
      attribute: 'url',
      value: match[2],
    });
  }

  return references;
}

async function validateReference(sourceFile, reference) {
  const targetPath = resolveLocalReference(
    sourceFile,
    reference.value,
  );

  if (!targetPath) {
    return null;
  }

  try {
    const targetStats = await stat(targetPath);

    if (!targetStats.isFile()) {
      return `${path.relative(projectRoot, sourceFile)}: ${reference.attribute}="${reference.value}" does not point to a file`;
    }

    if (targetStats.size === 0) {
      return `${path.relative(projectRoot, sourceFile)}: ${reference.attribute}="${reference.value}" points to an empty file`;
    }
  } catch {
    return `${path.relative(projectRoot, sourceFile)}: ${reference.attribute}="${reference.value}" was not found`;
  }

  return null;
}

function getAttribute(attributes, name) {
  const pattern = new RegExp(
    `\\b${name}\\s*=\\s*(["'])(.*?)\\1`,
    'i',
  );
  const match = attributes.match(pattern);

  return match?.[2] ?? null;
}

test('all local HTML and CSS references point to existing files', async () => {
  const htmlFiles = await collectFiles(
    projectRoot,
    new Set(['.html']),
  );
  const cssFiles = await collectFiles(
    projectRoot,
    new Set(['.css']),
  );

  assert.ok(htmlFiles.length > 0, 'No HTML files were found');
  assert.ok(cssFiles.length > 0, 'No CSS files were found');

  const failures = [];

  for (const htmlFile of htmlFiles) {
    const content = await readFile(htmlFile, 'utf8');
    const references = extractHtmlReferences(content);

    for (const reference of references) {
      const failure = await validateReference(
        htmlFile,
        reference,
      );

      if (failure) {
        failures.push(failure);
      }
    }
  }

  for (const cssFile of cssFiles) {
    const content = await readFile(cssFile, 'utf8');
    const references = extractCssReferences(content);

    for (const reference of references) {
      const failure = await validateReference(
        cssFile,
        reference,
      );

      if (failure) {
        failures.push(failure);
      }
    }
  }

  assert.deepEqual(
    failures,
    [],
    `Broken local asset references:\n${failures.join('\n')}`,
  );
});

test('project videos prefer WebM and keep MP4 as fallback', async () => {
  const htmlFiles = await collectFiles(
    projectRoot,
    new Set(['.html']),
  );

  const failures = [];
  let projectVideoCount = 0;
  const videoPattern = /<video\b([^>]*)>([\s\S]*?)<\/video>/gi;
  const sourcePattern = /<source\b([^>]*)\/?>/gi;

  for (const htmlFile of htmlFiles) {
    const content = await readFile(htmlFile, 'utf8');

    for (const videoMatch of content.matchAll(videoPattern)) {
      const videoAttributes = videoMatch[1];

      if (!/\bclass\s*=\s*(["'])[^"']*\bproject-demo\b[^"']*\1/i.test(videoAttributes)) {
        continue;
      }

      projectVideoCount += 1;

      const sources = [...videoMatch[2].matchAll(sourcePattern)]
        .map((sourceMatch) => ({
          src: getAttribute(sourceMatch[1], 'src'),
          type: getAttribute(sourceMatch[1], 'type'),
        }));

      const relativeHtmlPath = path.relative(
        projectRoot,
        htmlFile,
      );

      if (sources.length < 2) {
        failures.push(
          `${relativeHtmlPath}: project video must provide WebM and MP4 sources`,
        );
        continue;
      }

      const [webmSource, mp4Source] = sources;

      if (
        webmSource.type !== 'video/webm' ||
        path.extname(webmSource.src ?? '').toLowerCase() !== '.webm'
      ) {
        failures.push(
          `${relativeHtmlPath}: WebM must be the first project-video source`,
        );
      }

      if (
        mp4Source.type !== 'video/mp4' ||
        path.extname(mp4Source.src ?? '').toLowerCase() !== '.mp4'
      ) {
        failures.push(
          `${relativeHtmlPath}: MP4 must be the second project-video source`,
        );
      }

      const webmName = path.basename(
        webmSource.src ?? '',
        '.webm',
      );
      const mp4Name = path.basename(
        mp4Source.src ?? '',
        '.mp4',
      );

      if (!webmName || webmName !== mp4Name) {
        failures.push(
          `${relativeHtmlPath}: WebM and MP4 fallback files must use the same base name`,
        );
      }
    }
  }

  assert.ok(
    projectVideoCount > 0,
    'No project videos with class="project-demo" were found',
  );

  assert.deepEqual(
    failures,
    [],
    `Invalid project-video fallback configuration:\n${failures.join('\n')}`,
  );
});
