// Generates the Pumpkin Spice file icons (SVGs) and the icon theme JSON.
// Run with: npm run icons
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const iconsDir = path.join(root, 'icons');
const themeFile = path.join(root, 'themes', 'pumpkin-spice-icon-theme.json');

const NIGHT = '#1a1520';
const STEM = '#5f8f3a';

// Orange pumpkins for code, white (ghost) pumpkins for config/data/docs.
const ORANGE = { body: '#e8823f', side: '#c46a30', label: NIGHT };
const WHITE = { body: '#f5efe6', side: '#cfc4b8', label: '#c46a30' };

function pumpkin(label, colors) {
  const size = label.length >= 3 ? 7.8 : 10.5;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <path d="M16 8 C16 5 17 3 20 2" stroke="${STEM}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <ellipse cx="9.5" cy="18.5" rx="7.5" ry="10" fill="${colors.side}"/>
  <ellipse cx="22.5" cy="18.5" rx="7.5" ry="10" fill="${colors.side}"/>
  <ellipse cx="16" cy="18.5" rx="9" ry="11" fill="${colors.body}"/>
  <text x="16" y="${label.length >= 3 ? 21.5 : 22.3}" font-family="Segoe UI, Arial, sans-serif" font-size="${size}" font-weight="900" text-anchor="middle" fill="${colors.label}">${label}</text>
</svg>
`;
}

const ghost = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <path d="M7 29 V14 A9 9 0 0 1 25 14 V29 L22 26 L19 29 L16 26 L13 29 L10 26 Z" fill="#f5efe6"/>
  <ellipse cx="12.5" cy="14" rx="1.8" ry="2.4" fill="${NIGHT}"/>
  <ellipse cx="19.5" cy="14" rx="1.8" ry="2.4" fill="${NIGHT}"/>
  <ellipse cx="16" cy="20" rx="2" ry="1.6" fill="${NIGHT}"/>
</svg>
`;

// Jack-o'-lantern folder: dark eyes when closed, glowing eyes when open.
function folder(eyeColor, bodyColor) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <path d="M2 8 A2 2 0 0 1 4 6 H12 L15 9 H28 A2 2 0 0 1 30 11 V26 A2 2 0 0 1 28 28 H4 A2 2 0 0 1 2 26 Z" fill="${bodyColor}"/>
  <path d="M11 13 L13.8 18 H8.2 Z M21 13 L23.8 18 H18.2 Z" fill="${eyeColor}"/>
  <path d="M9 20.5 Q16 26.5 23 20.5 L21 21.3 L19.5 22.8 L18 21.8 L16 23.2 L14 21.8 L12.5 22.8 L11 21.3 Z" fill="${eyeColor}"/>
</svg>
`;
}

const bat = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <path d="M16 11 L14.5 8.5 L14 11.5 C11 9 6 9 2 12 C5 13 6 15 6 18 C8 16 10.5 16.5 12 18.5 C13 17 14.5 16.5 16 17.5 C17.5 16.5 19 17 20 18.5 C21.5 16.5 24 16 26 18 C26 15 27 13 30 12 C26 9 21 9 18 11.5 L17.5 8.5 Z" fill="#e8823f"/>
  <circle cx="15" cy="12.5" r="0.8" fill="#ffe066"/>
  <circle cx="17" cy="12.5" r="0.8" fill="#ffe066"/>
</svg>
`;

// name -> [label, colors, extensions, fileNames]
const pumpkins = {
  js: ['JS', ORANGE, ['js', 'mjs', 'cjs']],
  jsx: ['JSX', ORANGE, ['jsx']],
  ts: ['TS', ORANGE, ['ts', 'mts', 'cts']],
  tsx: ['TSX', ORANGE, ['tsx']],
  py: ['PY', ORANGE, ['py', 'pyw', 'ipynb']],
  java: ['JV', ORANGE, ['java', 'kt', 'kts']],
  c: ['C', ORANGE, ['c', 'h']],
  cpp: ['C++', ORANGE, ['cpp', 'cc', 'cxx', 'hpp', 'hh']],
  cs: ['C#', ORANGE, ['cs']],
  go: ['GO', ORANGE, ['go']],
  rs: ['RS', ORANGE, ['rs']],
  rb: ['RB', ORANGE, ['rb']],
  php: ['PHP', ORANGE, ['php']],
  html: ['<>', ORANGE, ['html', 'htm', 'vue', 'svelte']],
  css: ['#', ORANGE, ['css', 'scss', 'sass', 'less']],
  sh: ['$_', ORANGE, ['sh', 'bash', 'zsh', 'ps1', 'bat', 'cmd']],
  json: ['{}', WHITE, ['json', 'jsonc']],
  yaml: ['YML', WHITE, ['yml', 'yaml', 'toml', 'ini', 'env']],
  xml: ['XML', WHITE, ['xml']],
  md: ['MD', WHITE, ['md', 'mdx']],
  sql: ['SQL', WHITE, ['sql', 'db', 'sqlite']],
  git: ['GIT', WHITE, [], ['.gitignore', '.gitattributes', '.gitmodules']],
  npm: ['NPM', WHITE, [], ['package.json', 'package-lock.json', '.npmrc']],
  docker: ['DK', WHITE, [], ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml', '.dockerignore']],
  lock: ['LCK', WHITE, ['lock'], ['yarn.lock', 'pnpm-lock.yaml']],
};

const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp'];

fs.mkdirSync(iconsDir, { recursive: true });

const write = (name, svg) => fs.writeFileSync(path.join(iconsDir, `${name}.svg`), svg);

write('_file', ghost);
write('_folder', folder(NIGHT, '#e8823f'));
write('_folder_open', folder('#ffe066', '#eaa66f'));
write('image', bat);

const theme = {
  iconDefinitions: {
    _file: { iconPath: '../icons/_file.svg' },
    _folder: { iconPath: '../icons/_folder.svg' },
    _folder_open: { iconPath: '../icons/_folder_open.svg' },
    image: { iconPath: '../icons/image.svg' },
  },
  file: '_file',
  folder: '_folder',
  folderExpanded: '_folder_open',
  rootFolder: '_folder',
  rootFolderExpanded: '_folder_open',
  fileExtensions: {},
  fileNames: {},
};

for (const ext of imageExtensions) theme.fileExtensions[ext] = 'image';

for (const [name, [label, colors, extensions, fileNames = []]] of Object.entries(pumpkins)) {
  write(name, pumpkin(label.replace('<', '&lt;').replace('>', '&gt;'), colors));
  theme.iconDefinitions[name] = { iconPath: `../icons/${name}.svg` };
  for (const ext of extensions) theme.fileExtensions[ext] = name;
  for (const fileName of fileNames) theme.fileNames[fileName.toLowerCase()] = name;
}

fs.writeFileSync(themeFile, JSON.stringify(theme, null, 2) + '\n');
console.log(`Generated ${Object.keys(theme.iconDefinitions).length} icons.`);
