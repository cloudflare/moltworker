const fs = require('fs');
const path = require('path');

const IMAGE_HOOK_DIRECTORY = '/usr/local/lib/openclaw/hooks/moltworker-slack-ready';
const MANAGED_HOOK_DIRECTORY = '/home/openclaw/.openclaw/hooks/moltworker-slack-ready';
const REVIEWED_HOOK_FILES = ['HOOK.md', 'handler.js'];

function replaceManagedHook(sourceDirectory, targetDirectory) {
  const hooksDirectory = path.dirname(targetDirectory);
  fs.mkdirSync(hooksDirectory, { recursive: true });
  const stageDirectory = fs.mkdtempSync(path.join(hooksDirectory, '.moltworker-slack-ready-'));

  try {
    for (const filename of REVIEWED_HOOK_FILES) {
      fs.copyFileSync(path.join(sourceDirectory, filename), path.join(stageDirectory, filename));
    }
    fs.rmSync(targetDirectory, { force: true, recursive: true });
    fs.renameSync(stageDirectory, targetDirectory);
  } catch (error) {
    fs.rmSync(stageDirectory, { force: true, recursive: true });
    throw error;
  }
}

function installMoltworkerSlackReadyHook(
  sourceDirectory = IMAGE_HOOK_DIRECTORY,
  targetDirectory = MANAGED_HOOK_DIRECTORY,
) {
  if (sourceDirectory !== IMAGE_HOOK_DIRECTORY) {
    throw new Error('Unexpected managed hook source directory');
  }
  if (targetDirectory !== MANAGED_HOOK_DIRECTORY) {
    throw new Error('Unexpected managed hook target directory');
  }

  replaceManagedHook(sourceDirectory, targetDirectory);
}

module.exports = {
  IMAGE_HOOK_DIRECTORY,
  MANAGED_HOOK_DIRECTORY,
  installMoltworkerSlackReadyHook,
  replaceManagedHook,
};

if (require.main === module) {
  installMoltworkerSlackReadyHook();
}
