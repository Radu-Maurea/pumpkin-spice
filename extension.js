const vscode = require('vscode');
const { registerPet } = require('./pet');

const SPOOKY_MESSAGES = [
  '👻 Boo! Did you commit that?',
  '🎃 Something wicked this way compiles',
  '🦇 It\'s a bug... it\'s a bat... it\'s a bug!',
  '🕷️ There\'s a spider in your web app',
  '💀 Here lies `undefined`. RIP.',
  '🧛 This code sucks... your RAM',
  '🕸️ Sweeping cobwebs out of node_modules',
  '🧟 Your zombie processes are restless',
  '🔮 I foresee a merge conflict',
  '🪦 Dead code walks among us',
  '🍬 Trick or treat? Treat: it compiled',
  '🌕 The full moon summons stack traces',
  '🐈‍⬛ A black cat crossed your semicolon',
  '🧙 Double, double, toil and trouble, fix that bug and refactor double',
  '👁️ The linter is watching',
];

let statusItem;
let timer;
let tick = 0;

function daysUntilHalloween(now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let halloween = new Date(today.getFullYear(), 9, 31);
  if (today > halloween) halloween = new Date(today.getFullYear() + 1, 9, 31);
  return Math.round((halloween - today) / 86400000);
}

function countdownText() {
  const days = daysUntilHalloween();
  if (days === 0) return '🎃 HAPPY HALLOWEEN! 🎃';
  if (days === 1) return '🎃 Halloween is TOMORROW';
  return `🎃 ${days} days until Halloween`;
}

function randomMessage() {
  return SPOOKY_MESSAGES[Math.floor(Math.random() * SPOOKY_MESSAGES.length)];
}

// Alternate between the countdown and a random spooky message.
function refresh() {
  statusItem.text = tick % 2 === 0 ? countdownText() : randomMessage();
  tick++;
}

function restart() {
  clearInterval(timer);
  const config = vscode.workspace.getConfiguration('pumpkinSpice.statusBar');
  if (!config.get('enabled', true)) {
    statusItem.hide();
    return;
  }
  const seconds = Math.max(5, config.get('intervalSeconds', 30));
  tick = 0;
  refresh();
  statusItem.show();
  timer = setInterval(refresh, seconds * 1000);
}

function activate(context) {
  statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -100);
  statusItem.command = 'pumpkinSpice.spook';
  statusItem.tooltip = 'Pumpkin Spice: click for a spooky message';

  context.subscriptions.push(
    statusItem,
    vscode.commands.registerCommand('pumpkinSpice.spook', () => {
      const message = randomMessage();
      statusItem.text = message;
      vscode.window.showInformationMessage(message);
    }),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('pumpkinSpice.statusBar')) restart();
    }),
    { dispose: () => clearInterval(timer) },
  );

  registerPet(context);
  restart();
}

function deactivate() {
  clearInterval(timer);
}

module.exports = { activate, deactivate };
