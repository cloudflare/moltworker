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

/**
 * Parse command-line arguments into listing options.
 *
 * @returns {{path: string, recursive: boolean, tree: boolean, hidden: boolean, json: boolean}} The parsed options object where `path` is the target path (default '.'), `recursive` enables recursive traversal, `tree` enables tree view (and implies `recursive`), `hidden` includes hidden entries, and `json` selects JSON output.
 */
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

/**
 * Recursively enumerates directory contents and returns a flat list of item objects.
 *
 * @param {string} dirPath - Filesystem path of the directory to list.
 * @param {Object} options - Listing options.
 * @param {boolean} options.recursive - If true, descend into subdirectories.
 * @param {boolean} options.hidden - If true, include entries whose names start with a dot.
 * @param {number} [depth=0] - Current recursion depth; used to record each item's depth in the tree.
 * @returns {Array<Object>} An array of items where each item contains:
 *   - `name` (string): entry name,
 *   - `path` (string): absolute path to the entry,
 *   - `type` (string): either `'directory'` or `'file'`,
 *   - `size` (number): entry size in bytes,
 *   - `modified` (string): ISO timestamp of last modification,
 *   - `depth` (number): depth level relative to the initial directory.
 *
 * Logs an error to stderr and returns any items collected so far if a directory cannot be read.
 */
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

/**
 * Print a hierarchical tree view of file and directory items.
 *
 * Renders the provided items with tree connectors (├──, └──), directory/file icons, and indentation reflecting each item's `depth`.
 * @param {Array<Object>} items - Array of item objects (expected fields: `name`, `path`, `type` ('directory' | 'file'), and `depth`).
 */
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

/**
 * Print a plain, indented listing of items to stdout with icons and file sizes.
 *
 * Each item is printed on its own line with a folder or file icon, indentation
 * proportional to its `depth` (two spaces per level), and a human-readable
 * size appended for files using `formatSize`.
 *
 * @param {Array<Object>} items - Array of item objects to print. Each item should include:
 *   - {string} name: the entry name
 *   - {string} type: either `'directory'` or `'file'`
 *   - {number} size: file size in bytes (used only for files)
 *   - {number} depth: nesting depth (0 for root)
 */
function printList(items) {
  for (const item of items) {
    const icon = item.type === 'directory' ? '📁' : '📄';
    const size = item.type === 'file' ? ` (${formatSize(item.size)})` : '';
    const indent = '  '.repeat(item.depth);
    console.log(`${indent}${icon} ${item.name}${size}`);
  }
}

/**
 * Convert a byte count into a human-readable size string.
 * @param {number} bytes - Number of bytes.
 * @returns {string} A formatted size string using `B` for bytes, `KB` with one decimal for kilobytes, or `MB` with one decimal for megabytes.
 */
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Entry point that parses CLI options, collects directory items, and writes the chosen output format to stdout.
 *
 * Parses command-line arguments to determine the target path and options, resolves and validates the path
 * (exiting the process with code 1 if the path does not exist), gathers directory items via listDir, and
 * prints them as JSON, a tree view, or a plain indented list according to the selected option.
 */
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