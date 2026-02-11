import { spawn } from "node:child_process";

const resolveMode = () => {
  const argv = process.argv.slice(2);
  const modeIndex = argv.findIndex((arg) => arg === "--mode");
  if (modeIndex >= 0 && argv[modeIndex + 1]) {
    return argv[modeIndex + 1];
  }
  return process.env.VITE_MODE || process.env.CLOUDFLARE_ENV || "production";
};

const mode = resolveMode();
const child = spawn("bunx", ["vite", "build", "--mode", mode], {
  stdio: "inherit",
  env: process.env,
});

child.on("close", (code) => {
  if (code && code !== 0) {
    process.exit(code);
  }
});
