const vscode = require('vscode');

// Pixel art for the pumpkin. Body rows are drawn as the left half and mirrored.
// o = body, d = rib/shadow, h = highlight, e = eyes, m = mouth, g = stem
const STEM = [
  '........gg......',
  '.......gg.......',
];
const BODY_HALVES = [
  '....dddd',
  '..ddoood',
  '.dooohod',
  '.doooood',
  'dooeeeod',
  'dooeeood',
  'dooooood',
  'dommmmmm',
  'doommomm',
  '.doooood',
  '..ddoooo',
  '....dddd',
];
// Extra faces drawn over the body. z = sleeping face, a = angry eyes.
const SLEEP_HALVES = [
  '........',
  '........',
  '........',
  '........',
  '........',
  '..zzzz..',
  '........',
  '.......z',
  '......zz',
  '........',
  '........',
  '........',
];
// x = dizzy face: X X eyes and a wobbly zigzag mouth.
const DIZZY_HALVES = [
  '........',
  '........',
  '........',
  '...x.x..',
  '....x...',
  '...x.x..',
  '........',
  '....x.x.',
  '...x.x.x',
  '........',
  '........',
  '........',
];
const STAR = [
  '..y..',
  '.yyy.',
  'yyyyy',
  '.yyy.',
  '.y.y.',
];
const ANGRY_HALVES = [
  '........',
  '........',
  '........',
  '........',
  '..aa....',
  '...aaa..',
  '........',
  '........',
  '........',
  '........',
  '........',
  '........',
];

// Effects and speech marks, drawn as plain pixel grids.
const BAT_UP = [
  'x.......x',
  'xx.x.x.xx',
  'xxxyxyxxx',
  '...xxx...',
  '....x....',
];
const BAT_DOWN = [
  '.........',
  '...x.x...',
  '..xyxyx..',
  '.xxxxxxx.',
  'xx.xxx.xx',
];
// Two ghost frames: arms and tail wave back and forth.
const GHOST_A = [
  '...xxxxx...',
  '..xxxxxxx..',
  '.xxxxxxxxx.',
  '.xxkxxxkxx.',
  'xxxkxxxkxxx',
  'x.xxxxxxx.x',
  '..xxxkxxx..',
  '..xxxxxxx..',
  '..xxxxxxx..',
  '..x.xx.xx..',
];
const GHOST_B = [
  '...xxxxx...',
  '..xxxxxxx..',
  '.xxxxxxxxx.',
  '.xxkxxxkxx.',
  '.xxkxxxkxx.',
  '.xxxxxxxxx.',
  'x.xxxkxxx.x',
  '..xxxxxxx..',
  '..xxxxxxx..',
  '..xx.xx.x..',
];
// Graveyard pieces. l = light edge, s = stone, d = shadow, k = carving, g = grass
const TOMBSTONE = [
  '..lssss..',
  '.lssssssd',
  'lsssksssd',
  'lsskkksd.',
  'lsssksssd',
  'lsssksssd',
  'lsssssssd',
  'lsssssssd',
  'lsssssssd',
  'ggggggggg',
];
const STONE_CROSS = [
  '...lsd...',
  '...lsd...',
  '.lllssdd.',
  '.lsssssd.',
  '...lsd...',
  '...lsd...',
  '...lsd...',
  '..lsssd..',
  '..lsssd..',
  'ggggggggg',
];
const LETTER_Z = [
  'xxxxx',
  '...x.',
  '..x..',
  '.x...',
  'xxxxx',
];
const EXCLAMATION = [
  'oooo',
  'oyyo',
  'oyyo',
  'oyyo',
  'oyyo',
  'oooo',
  '....',
  'oooo',
  'oyyo',
  'oooo',
];

// Sad face after an evil ghost hit: droopy eyes, tears (t) and a frown.
const SAD_HALVES = [
  '........',
  '........',
  '........',
  '........',
  '....ss..',
  '..sss...',
  '...t....',
  '...t....',
  '....ssss',
  '...s....',
  '........',
  '........',
];
// Evil ghost. o = outline, x = body, r = red eyes, k = mouth, w = teeth
const EVIL_GHOST_A = [
  '...ooooo...',
  '..oxxxxxo..',
  '.oxrxxxrxo.',
  '.oxrrxrrxo.',
  'oxxxxxxxxxo',
  'oxkwkwkwkxo',
  'oxxkkkkkxxo',
  'oxxxxxxxxxo',
  'oxxxxxxxxxo',
  'oxx.oxo.xxo',
  'oo...o...oo',
];
const EVIL_GHOST_B = [
  '...ooooo...',
  '..oxxxxxo..',
  '.oxrxxxrxo.',
  '.oxrrxrrxo.',
  'oxxxxxxxxxo',
  'oxkwkwkwkxo',
  'oxxkkkkkxxo',
  'oxxxxxxxxxo',
  'oxxxxxxxxxo',
  'oxxo.x.oxxo',
  '.oo..o..oo.',
];

const COLORS = { o: '#e8823f', d: '#c46a30', h: '#f2a56b', g: '#5f8f3a' };
const PIXEL = 5;

const mirror = (half) => half + [...half].reverse().join('');
const rect = (x, y, attrs) => `<rect x="${x}" y="${y}" width="1" height="1" ${attrs}/>`;

function svg(width, height, scale, content, attrs = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width * scale}" height="${height * scale}" shape-rendering="crispEdges" ${attrs}>${content}</svg>`;
}

function pixelSvg(rows, palette, scale, attrs) {
  const rects = [];
  rows.forEach((row, y) => {
    [...row].forEach((cell, x) => {
      if (palette[cell]) rects.push(rect(x, y, `fill="${palette[cell]}"`));
    });
  });
  return svg(rows[0].length, rows.length, scale, rects.join(''), attrs);
}

function pumpkinSvg() {
  const rows = [...STEM, ...BODY_HALVES.map(mirror)];
  const rects = [];
  rows.forEach((row, y) => {
    [...row].forEach((cell, x) => {
      if (cell === '.') return;
      const isFace = cell === 'e' || cell === 'm';
      rects.push(rect(x, y, `fill="${COLORS[isFace ? 'o' : cell]}"`));
      if (cell === 'e') rects.push(rect(x, y, 'class="face eyes"'));
      if (cell === 'm') rects.push(rect(x, y, 'class="face mouth"'));
    });
  });
  // classes maps each pixel character to the CSS classes of its rect.
  const overlay = (halves, classes) => {
    halves.map(mirror).forEach((row, y) => {
      [...row].forEach((cell, x) => {
        if (classes[cell]) rects.push(rect(x, y + STEM.length, `class="${classes[cell]}"`));
      });
    });
  };
  overlay(SLEEP_HALVES, { z: 'face sleepy' });
  overlay(ANGRY_HALVES, { a: 'face angry' });
  overlay(DIZZY_HALVES, { x: 'face dizzy-face' });
  overlay(SAD_HALVES, { s: 'face sad-face', t: 'tear sad-face' });
  return svg(rows[0].length, rows.length, PIXEL, rects.join(''), 'class="pumpkin"');
}

// Background art pixels are this many screen px, with this many rows of ground at the bottom.
const BG_PIXEL = 4;
const BG_GROUND = 4;

function getHtml(webview, sleepAfterSeconds = 30, evilGhostMinutes = 3, backgroundUri = null) {
  const nonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const z = (scale) => `<span>${pixelSvg(LETTER_Z, { x: '#f5efe6' }, scale)}</span>`;
  const star = `<span>${pixelSvg(STAR, { y: '#ffe066' }, 3)}</span>`;
  const batPalette = { x: '#5b4670', y: '#ffe066' };
  const twoFrames = (a, b, palette, scale) =>
    pixelSvg(a, palette, scale, 'class="frame-a"') + pixelSvg(b, palette, scale, 'class="frame-b"');
  const batHtml = twoFrames(BAT_UP, BAT_DOWN, batPalette, 4);
  const ghostHtml = twoFrames(GHOST_A, GHOST_B, { x: '#f5efe6', k: '#1a1520' }, 3);
  const stonePalette = { l: '#b0a8b8', s: '#8c8494', d: '#635b6b', k: '#4a4452', g: '#4f7a33' };
  const tombstoneHtml = pixelSvg(TOMBSTONE, stonePalette, 3);
  const crossHtml = pixelSvg(STONE_CROSS, stonePalette, 3);
  const evilPalette = { o: '#3b2752', x: '#8a6bb0', r: '#ff3b1f', k: '#1a1520', w: '#f5efe6' };
  const evilGhostHtml = `<div class="body">${twoFrames(EVIL_GHOST_A, EVIL_GHOST_B, evilPalette, 4)}</div>`;
  const puffHtml = pixelSvg(['xx', 'xx'], { x: '#8a6bb0' }, 3);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' ${webview.cspSource};">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  html, body { margin: 0; height: 100%; overflow: hidden; background: transparent; user-select: none; }
  #bg { position: absolute; left: 0; bottom: 0; z-index: 0; image-rendering: pixelated; pointer-events: none; }
  #graveyard { position: absolute; left: 0; right: 0; height: 60px; overflow: hidden; z-index: 1; pointer-events: none; }
  svg { display: block; }
  #pet { position: absolute; z-index: 2; cursor: grab; touch-action: none; --face: #1a1520; }
  #pet.dragging { cursor: grabbing; }
  #pet .pumpkin { animation: sway 2.4s ease-in-out infinite; transform-origin: 50% 100%; }
  #pet .face { fill: var(--face); }

  /* Faces */
  #pet .sleepy, #pet .angry, #pet.asleep .eyes, #pet.asleep .mouth, #pet.evil .eyes { display: none; }
  #pet.asleep .sleepy, #pet.evil .angry { display: inline; }
  #pet .sad-face, #pet.sad .eyes, #pet.sad .mouth, #pet.sad .sleepy, #pet.sad .angry { display: none; }
  #pet.sad .sad-face { display: inline; }
  #pet .tear { fill: #6fb7ff; }
  #pet .dizzy-face, #pet.dizzy .eyes, #pet.dizzy .mouth, #pet.dizzy .sleepy, #pet.dizzy .angry, #pet.dizzy .sad-face { display: none; }
  #pet.dizzy .dizzy-face { display: inline; }

  /* Sad: mopes after an evil ghost hit */
  #pet.sad .pumpkin { animation: mope 2.4s ease-in-out infinite; }
  #pet.sad .tear { animation: drip 1.2s steps(3) infinite; }

  /* Dizzy: wobbles while stars circle its head */
  #pet.dizzy .pumpkin { animation: woozy 0.9s ease-in-out infinite; }
  #stars { position: absolute; left: 50%; top: 2px; display: none; pointer-events: none; }
  #pet.dizzy #stars { display: block; }
  #stars span { position: absolute; left: -8px; animation: orbit 1.2s linear infinite; }
  #stars span:nth-child(2) { animation-delay: -0.4s; }
  #stars span:nth-child(3) { animation-delay: -0.8s; }

  /* Sleeping and waking */
  #pet.asleep .pumpkin { animation: breathe 3s ease-in-out infinite; }
  #pet.startled .pumpkin { animation: startle 0.45s ease-out; }
  #zzz, #alert { position: absolute; pointer-events: none; display: none; }
  #pet.asleep #zzz, #pet.startled #alert { display: block; }
  #zzz { left: 72%; top: -2px; }
  #zzz span { position: absolute; opacity: 0; animation: float 3s steps(12) infinite; }
  #zzz span:nth-child(2) { animation-delay: 1s; }
  #zzz span:nth-child(3) { animation-delay: 2s; }
  #alert { left: 50%; top: -36px; transform: translateX(-50%); animation: pop 0.9s steps(4); }

  /* Movement */
  #pet.dragging .pumpkin { animation: none; transform: rotate(-8deg) scale(1.05); }
  #pet.falling .pumpkin { animation: none; transform: rotate(var(--spin, 0deg)); }
  #pet.land .pumpkin { animation: land 0.3s ease-out; }
  #pet.nope .pumpkin { animation: nope 0.25s ease-out; }
  #pet.hurt .pumpkin { filter: brightness(2.2) saturate(0.4); }

  /* Click reactions */
  #pet.hop .pumpkin { animation: bounce 0.5s ease-out; }
  #pet.glow { --face: #ffe066; }
  #pet.glow .pumpkin { animation: bounce 0.5s ease-out 3; filter: drop-shadow(0 0 6px #ffe06699) drop-shadow(0 0 14px #e8823f66); }
  #pet.evil { --face: #ff2a1a; }
  #pet.evil .pumpkin { animation: shake 0.1s steps(2) 14; filter: brightness(0.75) saturate(1.4) drop-shadow(0 0 6px #ff1a1acc) drop-shadow(0 0 18px #b3000099); }

  /* Effects that fly out of the pumpkin */
  .fx { position: absolute; z-index: 3; pointer-events: none; }
  .bat { animation: fly var(--time) ease-in forwards; }
  .ghost { --frame: 0.5s; opacity: 0; animation: rise var(--time) ease-out forwards; }
  .grave { bottom: 0; transform: translateY(100%); animation: grave var(--time) ease-in-out forwards; }
  .puff { animation: fly var(--time) ease-out forwards; }

  /* Evil ghost: chases the pumpkin until swatted */
  .evil-ghost { position: absolute; z-index: 4; cursor: crosshair; --frame: 0.4s; animation: appear 0.6s ease-out; }
  .evil-ghost .frame-a, .fx .frame-a { animation: frame-a var(--frame, 0.24s) steps(1) infinite; }
  .evil-ghost .frame-b, .fx .frame-b { position: absolute; top: 0; animation: frame-b var(--frame, 0.24s) steps(1) infinite; }
  .evil-ghost .body { position: relative; filter: drop-shadow(0 0 6px #8a6bb088); }
  .evil-ghost.facing-left .body { transform: scaleX(-1); }
  .evil-ghost.swatted { pointer-events: none; animation: swat 0.45s ease-in forwards; }
  .evil-ghost.leaving { pointer-events: none; animation: cackle 0.9s ease-in forwards; }

  @keyframes sway { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
  @keyframes land { 0% { transform: scale(1.2, 0.75); } 60% { transform: scale(0.95, 1.08); } 100% { transform: scale(1, 1); } }
  @keyframes bounce { 0%, 100% { transform: translateY(0); } 40% { transform: translateY(-14px) scaleY(1.05); } 70% { transform: translateY(0) scaleY(0.92); } }
  @keyframes mope { 0%, 100% { transform: scale(1.04, 0.93) rotate(-2deg); } 50% { transform: scale(1.06, 0.9) rotate(2deg); } }
  @keyframes drip { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(3px); opacity: 0.2; } }
  @keyframes appear { 0% { opacity: 0; } 100% { opacity: 1; } }
  @keyframes swat { 0% { transform: rotate(0) scale(1); } 25% { filter: brightness(3); } 100% { transform: rotate(540deg) scale(0); opacity: 0; } }
  @keyframes cackle { 0% { transform: translate(0, 0); } 30% { transform: translate(0, -6px) scale(1.15); } 100% { transform: translate(0, -80px) scale(0.8); opacity: 0; } }
  @keyframes nope {0%, 100% { transform: scale(1, 1); } 40% { transform: scale(1.08, 0.9); } }
  @keyframes shake { 0% { transform: translateX(-2px) rotate(-2deg); } 100% { transform: translateX(2px) rotate(2deg); } }
  @keyframes breathe { 0%, 100% { transform: scale(1, 1); } 50% { transform: scale(1.03, 0.95); } }
  @keyframes startle { 0% { transform: translateY(0); } 35% { transform: translateY(-18px) scale(0.95, 1.08); } 70% { transform: translateY(0) scale(1.1, 0.9); } 100% { transform: none; } }
  @keyframes float { 0% { opacity: 0; transform: translate(0, 0); } 20% { opacity: 0.9; } 100% { opacity: 0; transform: translate(16px, -32px); } }
  @keyframes pop { 0% { transform: translate(-50%, 6px); } 25%, 100% { transform: translate(-50%, 0); } }
  @keyframes frame-a { 0% { visibility: visible; } 50%, 100% { visibility: hidden; } }
  @keyframes frame-b { 0% { visibility: hidden; } 50%, 100% { visibility: visible; } }
  @keyframes fly { 0% { transform: translate(0, 0) scale(0.4); opacity: 1; } 80% { opacity: 1; } 100% { transform: translate(var(--dx), var(--dy)) scale(1); opacity: 0; } }
  @keyframes rise {
    0% { transform: translate(0, 10px) scale(0.5); opacity: 0; }
    15% { opacity: 0.95; }
    35% { transform: translate(calc(var(--dx) * 0.3 - 10px), calc(var(--dy) * 0.35)) scale(1); }
    65% { transform: translate(calc(var(--dx) * 0.65 + 10px), calc(var(--dy) * 0.7)); opacity: 0.85; }
    100% { transform: translate(var(--dx), var(--dy)); opacity: 0; }
  }
  @keyframes woozy { 0%, 100% { transform: rotate(-9deg) translateX(-3px); } 50% { transform: rotate(9deg) translateX(3px); } }
  @keyframes orbit {
    0% { transform: translate(-36px, 0) scale(1); }
    25% { transform: translate(0, -9px) scale(0.7); opacity: 0.6; }
    50% { transform: translate(36px, 0) scale(1); opacity: 1; }
    75% { transform: translate(0, 9px) scale(1.25); }
    100% { transform: translate(-36px, 0) scale(1); }
  }
  @keyframes grave {0% { transform: translateY(100%); } 12%, 85% { transform: translateY(0); } 100% { transform: translateY(100%); } }
</style>
</head>
<body>
${backgroundUri ? `<canvas id="bg" data-pixel="${BG_PIXEL}" data-ground="${BG_GROUND}"></canvas>` : ''}
<div id="graveyard"></div>
<div id="pet">${pumpkinSvg()}<div id="zzz">${z(2)}${z(3)}${z(4)}</div><div id="alert">${pixelSvg(EXCLAMATION, { o: '#c46a30', y: '#ffe066' }, 3)}</div><div id="stars">${star.repeat(3)}</div></div>
<template id="bat">${batHtml}</template>
<template id="ghost">${ghostHtml}</template>
<template id="tombstone">${tombstoneHtml}</template>
<template id="cross">${crossHtml}</template>
<template id="evil-ghost">${evilGhostHtml}</template>
<template id="puff">${puffHtml}</template>
${backgroundUri ? `<script nonce="${nonce}" src="${backgroundUri}"></script>` : ''}
<script nonce="${nonce}">
  const vscode = acquireVsCodeApi();
  const pet = document.getElementById('pet');
  const state = vscode.getState() || {};
  let x = state.x ?? 20;
  let y = 0; // always drop in from the top
  let vx = 0;
  let vy = 0;
  let drag = null;
  let frame = null;
  let lastTime = 0;
  let trail = [];
  let sleepAfter = ${sleepAfterSeconds} * 1000;
  let sleepTimer;
  let lastReaction;
  let busyUntil = 0;
  let wallHits = [];
  const timers = {};
  const COOLDOWN = 1000; // ms to wait after a trick finishes before the next one
  const DRAG_THRESHOLD = 8; // px the mouse must move before a click becomes a drag

  const GRAVITY = 0.7;    // px per frame^2
  const BOUNCE = 0.45;    // energy kept when hitting the ground
  const WALL_BOUNCE = 0.7; // energy kept when hitting a wall
  const FRICTION = 0.92;  // horizontal slowdown on the ground
  const MAX_SPEED = 35;

  const maxX = () => Math.max(0, window.innerWidth - pet.offsetWidth);
  // With the background on, the pumpkin stands on its grass (sinking one art pixel into it).
  const FLOOR = ${backgroundUri ? BG_PIXEL * (BG_GROUND - 1) : 0};
  const maxY = () => Math.max(0, window.innerHeight - FLOOR - pet.offsetHeight);
  document.getElementById('graveyard').style.bottom = FLOOR + 'px';
  const random = (min, max) => min + Math.random() * (max - min);

  function place() {
    x = Math.min(Math.max(0, x), maxX());
    y = Math.min(Math.max(0, y), maxY());
    pet.style.left = x + 'px';
    pet.style.top = y + 'px';
  }

  // Adds a class to the pet for a while, restarting its animation if it was already on.
  function flash(className, ms) {
    pet.classList.remove(className);
    void pet.offsetWidth;
    pet.classList.add(className);
    clearTimeout(timers[className]);
    timers[className] = setTimeout(() => pet.classList.remove(className), ms);
  }

  // Too many wall hits in a short time make the pumpkin dizzy.
  const DIZZY_HITS = 3;
  const DIZZY_WINDOW = 6000; // ms
  const DIZZY_TIME = 4000;   // ms

  function hitWall() {
    const now = performance.now();
    wallHits = wallHits.filter((t) => now - t < DIZZY_WINDOW);
    wallHits.push(now);
    if (wallHits.length >= DIZZY_HITS) {
      wallHits = [];
      flash('dizzy', DIZZY_TIME);
    }
  }

  function step(time) {
    const dt = Math.min(3, (time - lastTime) / 16.67 || 1);
    lastTime = time;
    vy += GRAVITY * dt;
    x += vx * dt;
    y += vy * dt;

    if ((x <= 0 && vx < 0) || (x >= maxX() && vx > 0)) {
      if (Math.abs(vx) > 3) hitWall();
      vx = -vx * WALL_BOUNCE;
    }
    if (y < 0) { y = 0; vy = 0; }

    if (y >= maxY()) {
      y = maxY();
      vx *= FRICTION;
      if (vy > 3) {
        vy = -vy * BOUNCE;
        flash('land', 300);
      } else {
        vy = 0;
      }
    }
    place();
    pet.style.setProperty('--spin', (vx * 2) + 'deg');

    const resting = y >= maxY() && vy === 0 && Math.abs(vx) < 0.2;
    if (resting) {
      frame = null;
      pet.classList.remove('falling');
      vscode.setState({ x });
      return;
    }
    frame = requestAnimationFrame(step);
  }

  function fall() {
    if (frame !== null) return;
    pet.classList.add('falling');
    lastTime = performance.now();
    frame = requestAnimationFrame(step);
  }

  function stopFalling() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    vx = vy = 0;
    pet.classList.remove('falling');
  }

  // Falls asleep after a while without typing; typing (or poking it) wakes it up.
  function resetSleepTimer() {
    clearTimeout(sleepTimer);
    sleepTimer = setTimeout(() => pet.classList.add('asleep'), sleepAfter);
  }

  function wake() {
    resetSleepTimer();
    if (!pet.classList.contains('asleep')) return false;
    pet.classList.remove('asleep');
    flash('startled', 900);
    return true;
  }

  // Spawns a copy of a <template> at a position and removes it once its animation is over.
  function spawn(templateId, className, left, top, seconds, style = {}, parent = document.body) {
    const el = document.createElement('div');
    el.className = 'fx ' + className;
    el.append(document.getElementById(templateId).content.cloneNode(true));
    el.style.left = left + 'px';
    if (top !== null) el.style.top = top + 'px';
    el.style.setProperty('--time', seconds + 's');
    for (const [key, value] of Object.entries(style)) el.style.setProperty(key, value);
    parent.append(el);
    setTimeout(() => el.remove(), seconds * 1000);
  }

  // Spawns effects one after another, centred on the pumpkin. Returns when the last one ends (ms).
  function burst(count, gap, make) {
    let end = 0;
    for (let i = 0; i < count; i++) {
      const fx = make(i);
      end = Math.max(end, i * gap + fx.seconds * 1000);
      setTimeout(() => {
        const left = x + pet.offsetWidth / 2 - fx.width / 2;
        spawn(fx.template, fx.className, left, y + fx.offsetY, fx.seconds, fx.style);
      }, i * gap);
    }
    return end;
  }

  // Tombstones rise out of the ground on both sides of the pumpkin, then sink back.
  // They live in #graveyard, which ends at the ground line so they are hidden below it.
  function graveyard(seconds) {
    const left = x + pet.offsetWidth / 2 - 13;
    const ground = document.getElementById('graveyard');
    [-95, -55, 55, 95].forEach((offset, i) => {
      const delay = random(0, 250);
      const template = i % 3 === 1 ? 'cross' : 'tombstone';
      setTimeout(() => spawn(template, 'grave', left + offset, null, seconds - delay / 1000, {}, ground), delay);
    });
  }

  // Each trick returns how long it lasts in ms, so clicks are ignored until it's done.
  const REACTIONS = {
    glow: () => {
      flash('glow', 1800);
      return 1800;
    },
    evil: () => {
      flash('evil', 1600);
      return 1600;
    },
    bats: () => {
      flash('hop', 500);
      return burst(5, 90, (i) => ({
        template: 'bat', className: 'bat', width: 36, offsetY: 10, seconds: random(1.1, 1.8),
        style: { '--dx': (i % 2 === 0 ? 1 : -1) * random(60, 160) + 'px', '--dy': -random(80, 180) + 'px' },
      }));
    },
    ghost: () => {
      flash('hop', 500);
      const count = Math.random() < 0.5 ? 2 : 3;
      const ghostsEnd = burst(count, 350, (i) => ({
        template: 'ghost', className: 'ghost', width: 33, offsetY: 0, seconds: random(2.2, 2.8),
        style: { '--dx': (i - (count - 1) / 2) * random(50, 80) + 'px', '--dy': -random(110, 170) + 'px' },
      }));
      graveyard(ghostsEnd / 1000 + 0.3);
      return ghostsEnd + 300;
    },
  };

  function react() {
    const now = performance.now();
    if (now < busyUntil || pet.classList.contains('dizzy') || pet.classList.contains('sad')) {
      // Still resting from the last trick: a small squish shows the click was noticed.
      flash('nope', 250);
      return;
    }
    const options = Object.keys(REACTIONS).filter((name) => name !== lastReaction);
    lastReaction = options[Math.floor(Math.random() * options.length)];
    busyUntil = now + REACTIONS[lastReaction]() + COOLDOWN;
  }

  // Evil ghosts show up every few minutes and chase the pumpkin. Click them to swat them away.
  const GHOST_SPEED = 45;   // px per second
  const GHOST_SIZE = 44;    // px
  const SAD_TIME = 6000;    // ms
  let evilGhostMinutes = ${evilGhostMinutes};
  let ghostTimer;
  let evilGhost = null;

  function scheduleEvilGhost() {
    clearTimeout(ghostTimer);
    if (evilGhostMinutes <= 0) return;
    const delay = evilGhostMinutes * random(0.6, 1.4) * 60000;
    ghostTimer = setTimeout(() => {
      if (!document.hidden) summonEvilGhost();
      scheduleEvilGhost();
    }, delay);
  }

  function summonEvilGhost() {
    if (evilGhost) return;
    const el = document.createElement('div');
    el.className = 'evil-ghost';
    el.append(document.getElementById('evil-ghost').content.cloneNode(true));
    const fromLeft = Math.random() < 0.5;
    const ghost = {
      el,
      gx: fromLeft ? -GHOST_SIZE : window.innerWidth,
      gy: random(10, Math.max(20, window.innerHeight * 0.4)),
      born: performance.now(),
      last: performance.now(),
    };
    el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      swatEvilGhost();
    });
    document.body.append(el);
    evilGhost = ghost;
    requestAnimationFrame(chase);
  }

  function chase(time) {
    const ghost = evilGhost;
    if (!ghost) return;
    const dt = Math.min(0.05, (time - ghost.last) / 1000);
    ghost.last = time;
    const targetX = x + pet.offsetWidth / 2 - GHOST_SIZE / 2;
    const targetY = y + pet.offsetHeight / 2 - GHOST_SIZE / 2;
    const dx = targetX - ghost.gx;
    const dy = targetY - ghost.gy;
    const distance = Math.hypot(dx, dy);
    if (distance < 34) {
      ghostHit(dx);
      return;
    }
    ghost.gx += (dx / distance) * GHOST_SPEED * dt;
    ghost.gy += (dy / distance) * GHOST_SPEED * dt;
    const bob = Math.sin((time - ghost.born) / 250) * 6;
    ghost.el.style.left = ghost.gx + 'px';
    ghost.el.style.top = ghost.gy + bob + 'px';
    ghost.el.classList.toggle('facing-left', dx < 0);
    requestAnimationFrame(chase);
  }

  // Removes the current evil ghost with an exit animation.
  function banishEvilGhost(className, ms) {
    const el = evilGhost.el;
    evilGhost = null;
    el.classList.add(className);
    setTimeout(() => el.remove(), ms);
  }

  function swatEvilGhost() {
    if (!evilGhost) return;
    const left = evilGhost.gx + GHOST_SIZE / 2 - 3;
    const top = evilGhost.gy + GHOST_SIZE / 2 - 3;
    banishEvilGhost('swatted', 450);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const reach = random(25, 45);
      spawn('puff', 'puff', left, top, random(0.4, 0.7), {
        '--dx': Math.cos(angle) * reach + 'px',
        '--dy': Math.sin(angle) * reach + 'px',
      });
    }
  }

  // The ghost reached the pumpkin: knock it away from the ghost and make it sad.
  function ghostHit(dx) {
    banishEvilGhost('leaving', 900);
    wake();
    flash('hurt', 150);
    flash('sad', SAD_TIME);
    if (drag) return;
    stopFalling();
    vx = (dx < 0 ? -1 : 1) * random(12, 18);
    vy = -random(8, 12);
    fall();
  }

  window.addEventListener('message', (e) => {
    const message = e.data;
    if (message.type === 'activity') wake();
    if (message.type === 'ghost') summonEvilGhost();
    if (message.type === 'config') {
      sleepAfter = message.sleepAfterSeconds * 1000;
      resetSleepTimer();
      if (message.evilGhostMinutes !== evilGhostMinutes) {
        evilGhostMinutes = message.evilGhostMinutes;
        scheduleEvilGhost();
      }
    }
  });

  // The moon in the background started staring: the pumpkin jumps.
  window.addEventListener('moonstare', () => {
    wake();
    flash('startled', 900);
  });

  pet.addEventListener('pointerdown', (e) => {
    pet.setPointerCapture(e.pointerId);
    const wasAsleep = wake();
    stopFalling();
    trail = [{ x: e.clientX, y: e.clientY, t: performance.now() }];
    drag = { dx: e.clientX - x, dy: e.clientY - y, startX: e.clientX, startY: e.clientY, moved: false, wasAsleep };
  });

  pet.addEventListener('pointermove', (e) => {
    if (!drag) return;
    // Small wobbles while clicking still count as a click, not a drag.
    if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > DRAG_THRESHOLD) {
      drag.moved = true;
      pet.classList.add('dragging');
    }
    if (!drag.moved) return;
    x = e.clientX - drag.dx;
    y = e.clientY - drag.dy;
    place();
    const now = performance.now();
    trail.push({ x: e.clientX, y: e.clientY, t: now });
    trail = trail.filter((p) => now - p.t < 80);
  });

  pet.addEventListener('pointerup', () => {
    if (drag && drag.moved && trail.length > 1) {
      // Throw it with the speed the mouse was moving at.
      const a = trail[0];
      const b = trail[trail.length - 1];
      const frames = Math.max(1, (b.t - a.t) / 16.67);
      const clamp = (v) => Math.max(-MAX_SPEED, Math.min(MAX_SPEED, v));
      vx = clamp((b.x - a.x) / frames);
      vy = clamp((b.y - a.y) / frames);
    }
    // A plain click does a random trick (unless it just woke the pumpkin up).
    if (drag && !drag.moved && !drag.wasAsleep) react();
    drag = null;
    pet.classList.remove('dragging');
    fall();
  });

  window.addEventListener('resize', () => {
    place();
    if (!drag) fall();
  });
  place();
  fall();
  resetSleepTimer();
  scheduleEvilGhost();
</script>
</body>
</html>`;
}

const petConfig = () => vscode.workspace.getConfiguration('pumpkinSpice.pet');
const sleepAfterSeconds = () => Math.max(5, petConfig().get('sleepAfterSeconds', 30));
const evilGhostMinutes = () => Math.max(0, petConfig().get('evilGhostMinutes', 3));
const showBackground = () => petConfig().get('background', true);

class PumpkinPetProvider {
  constructor(extensionUri) {
    this.mediaUri = vscode.Uri.joinPath(extensionUri, 'media');
  }

  resolveWebviewView(webviewView) {
    this.view = webviewView;
    webviewView.webview.options = { enableScripts: true, localResourceRoots: [this.mediaUri] };
    this.render();
    webviewView.onDidDispose(() => (this.view = undefined));
  }

  render() {
    if (!this.view) return;
    const webview = this.view.webview;
    const backgroundUri = showBackground()
      ? webview.asWebviewUri(vscode.Uri.joinPath(this.mediaUri, 'background.js'))
      : null;
    webview.html = getHtml(webview, sleepAfterSeconds(), evilGhostMinutes(), backgroundUri);
  }

  post(message) {
    if (this.view) this.view.webview.postMessage(message);
  }
}

function registerPet(context) {
  const provider = new PumpkinPetProvider(context.extensionUri);
  let lastActivity = 0;

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('pumpkinSpice.pet', provider, {
      webviewOptions: { retainContextWhenHidden: true },
    }),
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.contentChanges.length === 0 || event.document.uri.scheme === 'output') return;
      const now = Date.now();
      if (now - lastActivity < 1000) return;
      lastActivity = now;
      provider.post({ type: 'activity' });
    }),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('pumpkinSpice.pet.background')) {
        provider.render();
      } else if (event.affectsConfiguration('pumpkinSpice.pet')) {
        provider.post({ type: 'config', sleepAfterSeconds: sleepAfterSeconds(), evilGhostMinutes: evilGhostMinutes() });
      }
    }),
    vscode.commands.registerCommand('pumpkinSpice.pet.summonGhost', async () => {
      if (!provider.view) {
        await vscode.commands.executeCommand('pumpkinSpice.pet.focus');
      }
      provider.post({ type: 'ghost' });
    }),
  );
}

module.exports = { registerPet, pumpkinSvg, getHtml };
