#!/usr/bin/env node
/**
 * File Utils - List Directory
 * Usage: node list.js <path> [OPTIONS]
 * Options:
 *   --recursive, -r  List recursively
 *   --tree           Show as tree view
 *   --hidden         Include hidden files
 *   --json           Output as JSON
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

function parseArgs() {
  const result = {
    path: '.',
    recursive: false,
    tree: false,
    hidden: false,
    json: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--recursive' || args[i] === '-r') {
      result.recursive = true;
    } else if (args[i] === '--tree') {
      result.tree = true;
      result.recursive = true;
    } else if (args[i] === '--hidden') {
      result.hidden = true;
    } else if (args[i] === '--json') {
      result.json = true;
    } else if (!args[i].startsWith('-')) {
      result.path = args[i];
    }
  }

  return result;
}

function listDir(dirPath, options, depth = 0) {
  const results = [];

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (!options.hidden && entry.name.startsWith('.')) continue;

      const fullPath = path.join(dirPath, entry.name);
      const stats = fs.statSync(fullPath);

      const item = {
        name: entry.name,
        path: fullPath,
        type: entry.isDirectory() ? 'directory' : 'file',
        size: stats.size,
        modified: stats.mtime.toISOString(),
        depth
      };

      results.push(item);

      if (entry.isDirectory() && options.recursive) {
        results.push(...listDir(fullPath, options, depth + 1));
      }
    }
  } catch (err) {
    console.error(`Error reading ${dirPath}: ${err.message}`);
  }

  return results;
}

function printTree(items) {
  const byPath = new Map();
  items.forEach(item => byPath.set(item.path, item));

  function printItem(item, prefix = '', isLast = true) {
    const connector = isLast ? '└── ' : '├── ';
    const icon = item.type === 'directory' ? '📁 ' : '📄 ';
    console.log(`${prefix}${connector}${icon}${item.name}`);
  }

  // Group by directory
  const roots = items.filter(i => i.depth === 0);

  function printLevel(parentPath, items, prefix = '') {
    const children = items.filter(i =>
      path.dirname(i.path) === parentPath && i.depth > 0
    );

    const levelItems = parentPath === ''
      ? roots
      : items.filter(i => path.dirname(i.path) === parentPath);

    levelItems.forEach((item, idx) => {
      const isLast = idx === levelItems.length - 1;
      printItem(item, prefix, isLast);

      if (item.type === 'directory') {
        const newPrefix = prefix + (isLast ? '    ' : '│   ');
        const subItems = items.filter(i => i.path.startsWith(item.path + path.sep));
        const directChildren = subItems.filter(i => path.dirname(i.path) === item.path);

        directChildren.forEach((child, cidx) => {
          const childIsLast = cidx === directChildren.length - 1;
          printItem(child, newPrefix, childIsLast);

          if (child.type === 'directory') {
            printLevel(child.path, items, newPrefix + (childIsLast ? '    ' : '│   '));
          }
        });
      }
    });
  }

  printLevel('', items);
}

function printList(items) {
  for (const item of items) {
    const icon = item.type === 'directory' ? '📁' : '📄';
    const size = item.type === 'file' ? ` (${formatSize(item.size)})` : '';
    const indent = '  '.repeat(item.depth);
    console.log(`${indent}${icon} ${item.name}${size}`);
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function main() {
  const options = parseArgs();
  const targetPath = path.resolve(options.path);

  if (!fs.existsSync(targetPath)) {
    console.error(`Path not found: ${targetPath}`);
    process.exit(1);
  }

  const items = listDir(targetPath, options);

  if (options.json) {
    console.log(JSON.stringify(items, null, 2));
  } else if (options.tree) {
    console.log(`📁 ${path.basename(targetPath)}`);
    printTree(items);
  } else {
    printList(items);
  }
}

main();
