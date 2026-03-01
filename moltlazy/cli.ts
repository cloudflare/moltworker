#!/usr/bin/env node
import { patchConfig, validateConfig, CONFIG_PATH } from "./index.js";

const args = process.argv.slice(2);
let command = args[0] || "patch";
let filePath = CONFIG_PATH;

const fileIdx = args.indexOf("--file");
if (fileIdx !== -1 && args[fileIdx + 1]) {
  filePath = args[fileIdx + 1];
  // If "patch" or "validate" was NOT the first arg but --file was present,
  // we treat the command as whatever was at args[0] UNLESS args[0] was --file.
  if (args[0] === "--file") {
    command = "patch";
  }
}

async function main() {
  try {
    if (command === "validate") {
      const isValid = validateConfig(filePath);
      if (isValid) {
        console.log(`Configuration at ${filePath} is valid.`);
        process.exit(0);
      } else {
        console.error(`Configuration at ${filePath} is INVALID.`);
        process.exit(1);
      }
    } else if (command === "patch") {
      patchConfig(filePath);
      process.exit(0);
    } else {
      console.error(`Unknown command: ${command}`);
      console.log("Usage: moltlazy [patch|validate] [--file <path>]");
      process.exit(1);
    }
  } catch (err) {
    console.error("CLI Error:", err);
    process.exit(1);
  }
}

main();
