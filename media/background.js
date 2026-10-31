// Pixel-art night scene behind the Pumpkin Pet: sky, stars, moon, clouds, hills, a dead tree,
// a graveyard fence and the ground the pumpkin stands on. Drawn at low resolution and scaled up.
// Clicking the moon makes it glow; now and then it swells up and stares back with a grimacing face.
(() => {
  const canvas = document.getElementById('bg');
  const ctx = canvas.getContext('2d');
  const PIXEL = Number(canvas.dataset.pixel); // screen px per art pixel
  const GROUND = Number(canvas.dataset.ground); // art pixels of ground at the bottom

  const SKY = ['#0b0810', '#100c17', '#15101f', '#1b1428', '#221930', '#2a1e37'];
  const STAR_DIM = '#6a5f7d';
  const STAR_BRIGHT = '#d9cfe0';
  const MOON = '#efe2c4';
  const MOON_SHADE = '#d6c49f';
  const MOON_GLOW = '#2c2240';
  const CLOUD = '#2a2038';
  const CLOUD_LIT = '#3b2e4d';
  const BACK_HILLS = '#1a1326';
  const FRONT_HILLS = '#130e1c';
  const SILHOUETTE = '#0d0912';
  const GRASS = '#34492a';
  const GRASS_DARK = '#26371e';
  const DIRT = '#1c1410';
  const DIRT_SPECK = '#2a1e17';
  const MOON_GLOW_BRIGHT = '#4a3a66';
  // The staring moon's face.
  const FACE_SKIN = '#d9b77a';
  const FACE_SHADE = '#a8834f';
  const FACE_DARK = '#3d2214';
  const FACE_GLOW = '#4a1420';
  const EYE_WHITE = '#f2ecd0';
  const EYE_VEIN = '#b8262a';
  const IRIS = '#e0861c';
  const PUPIL = '#140404';
  const TOOTH = '#e8dcc0';
  const MOUTH = '#200a08';
  const FACE_CHANCE = 0.25; // chance a click on the moon wakes the face
  const FACE_FRAMES = 25;   // how long it stares, in 200ms ticks

  const TREE = [
    '......x.........',
    '.x....x.....x...',
    '..x...x....x....',
    '...x..x...x....x',
    '....x.xx.x....x.',
    'x....xxxx....x..',
    '.x....xx....x...',
    '..xx..xx..xx....',
    '....x.xx.x......',
    '.....xxxx.......',
    '......xx........',
    '......xx........',
    '......xx........',
    '......xx........',
    '.....xxxx.......',
    '....xx..xx......',
  ];
  const CLOUD_SHAPE = [
    '....llll.......',
    '..lllcccll.....',
    '.lcccccccclll..',
    'cccccccccccccc.',
    '.ccccccccccccc.',
  ];

  // Small seeded random generator, so the scene looks the same every time it is drawn.
  function seeded(seed) {
    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const BAYER = [[0.125, 0.625], [0.875, 0.375]];
  let base = null; // the still parts of the scene, drawn once per resize
  let stars = [];
  let clouds = [];
  let W = 0;
  let H = 0;
  let moon = { x: 0, y: 0, r: 0 };
  let glowUntil = -1; // frame until which a click keeps the moon glowing
  let face = null;    // { start } while the moon is staring

  function build() {
    W = Math.ceil(window.innerWidth / PIXEL);
    H = Math.ceil(window.innerHeight / PIXEL);
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = W * PIXEL + 'px';
    canvas.style.height = H * PIXEL + 'px';

    base = document.createElement('canvas');
    base.width = W;
    base.height = H;
    const b = base.getContext('2d');
    const dot = (x, y, color) => {
      b.fillStyle = color;
      b.fillRect(x, y, 1, 1);
    };
    const random = seeded(31);
    const groundTop = H - GROUND;

    // Sky: dithered bands from dark at the top to a purple glow at the horizon.
    for (let y = 0; y < groundTop; y++) {
      const f = (y / groundTop) * (SKY.length - 1);
      const i = Math.floor(f);
      for (let x = 0; x < W; x++) {
        const next = f - i > BAYER[y % 2][x % 2] ? Math.min(i + 1, SKY.length - 1) : i;
        dot(x, y, SKY[next]);
      }
    }

    // Moon with a dithered glow and a few craters, in the top right corner.
    const r = Math.max(5, Math.min(10, Math.round(Math.min(W, groundTop) * 0.1)));
    const mx = W - r - 5;
    const my = r + 5;
    moon = { x: mx, y: my, r };
    for (let y = my - r - 4; y <= my + r + 4; y++) {
      for (let x = mx - r - 4; x <= mx + r + 4; x++) {
        const d = Math.hypot(x - mx, y - my);
        if (d <= r) dot(x, y, x - mx + (y - my) > r * 0.7 ? MOON_SHADE : MOON);
        else if (d <= r + 3 && (x + y) % 2 === 0) dot(x, y, MOON_GLOW);
      }
    }
    for (let i = 0; i < 4; i++) {
      const cx = mx + Math.round((random() - 0.5) * r);
      const cy = my + Math.round((random() - 0.5) * r);
      const size = random() < 0.5 ? 1 : 2;
      b.fillStyle = MOON_SHADE;
      b.fillRect(cx, cy, size, size);
    }

    // Stars: anywhere in the upper sky except around the moon.
    stars = [];
    const starRows = Math.max(10, groundTop - 26);
    const count = Math.round((W * starRows) / 100);
    for (let i = 0; i < count; i++) {
      const x = Math.floor(random() * W);
      const y = Math.floor(random() * starRows);
      if (Math.hypot(x - mx, y - my) < r + 5) continue;
      stars.push({ x, y, big: random() < 0.08, phase: random() * 100, speed: 0.5 + random() });
    }

    // Hills: a far layer and a near layer, both built from overlapping sine waves.
    const hill = (x, height, wave, offset) =>
      groundTop - Math.round(height + Math.sin(x * wave + offset) * 3 + Math.sin(x * wave * 2.7 + offset * 2) * 2);
    for (let x = 0; x < W; x++) {
      for (let y = hill(x, 16, 0.06, 1); y < groundTop; y++) dot(x, y, BACK_HILLS);
    }
    for (let x = 0; x < W; x++) {
      for (let y = hill(x, 7, 0.09, 4); y < groundTop; y++) dot(x, y, FRONT_HILLS);
    }

    // A dead tree on the left, standing on the near hills.
    const treeX = Math.min(4, W - TREE[0].length);
    const treeBase = hill(treeX + 6, 7, 0.09, 4) + 1;
    TREE.forEach((row, y) => {
      [...row].forEach((cell, x) => {
        if (cell === 'x') dot(treeX + x, treeBase - TREE.length + y, SILHOUETTE);
      });
    });

    // A spiky graveyard fence along the ground on the right.
    const fenceStart = Math.max(treeX + TREE[0].length + 4, Math.round(W * 0.55));
    for (let x = fenceStart; x < W - 1; x++) {
      dot(x, groundTop - 2, SILHOUETTE);
      dot(x, groundTop - 5, SILHOUETTE);
      if ((x - fenceStart) % 3 === 0) {
        for (let y = groundTop - 7; y < groundTop; y++) dot(x, y, SILHOUETTE);
        dot(x, groundTop - 8, SILHOUETTE);
      }
    }

    // Ground: a grass edge with tufts, then dirt with specks.
    for (let x = 0; x < W; x++) {
      dot(x, groundTop, GRASS);
      if (random() < 0.3) dot(x, groundTop - 1, GRASS_DARK);
      for (let y = groundTop + 1; y < H; y++) dot(x, y, random() < 0.08 ? DIRT_SPECK : DIRT);
    }

    // Two clouds drifting across the upper sky.
    clouds = [
      { y: my + Math.round(r * 0.3), start: random() * W, speed: 0.6 },
      { y: Math.round(starRows * 0.55), start: random() * W, speed: 0.35 },
    ];
  }

  // Cheap per-pixel noise, so the face's texture and veins stay put between frames.
  const hash = (x, y) => (((x * 374761393 + y * 668265263) ^ 0x5bd1e995) >>> 0) % 100;

  // The moon swollen to a bigger, sickly disc with bulging eyes that follow the pumpkin
  // and a wide clenched grin.
  function drawFace(frame, age) {
    const R = moon.r + 3;
    const cx = moon.x;
    const cy = moon.y;
    const dot = (x, y, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(cx + x, cy + y, 1, 1);
    };

    for (let y = -R - 3; y <= R + 3; y++) {
      for (let x = -R - 3; x <= R + 3; x++) {
        const d = Math.hypot(x, y);
        if (d <= R) dot(x, y, x + y > R * 0.6 || hash(x, y) < 12 ? FACE_SHADE : FACE_SKIN);
        else if (d <= R + 3 && (x + y + frame) % 2 === 0) dot(x, y, FACE_GLOW);
      }
    }

    // Where the pumpkin is, relative to the moon, so the pupils can find it.
    let look = { x: -1, y: 1 };
    const pet = document.getElementById('pet');
    if (pet) {
      const box = pet.getBoundingClientRect();
      const art = canvas.getBoundingClientRect();
      const px = (box.left + box.width / 2 - art.left) / PIXEL - cx;
      const py = (box.top + box.height / 2 - art.top) / PIXEL - cy;
      const len = Math.hypot(px, py) || 1;
      look = { x: px / len, y: py / len };
    }

    const er = Math.max(2, Math.round(R * 0.27));
    const ey = -Math.round(R * 0.15);
    // Blinks now and then; otherwise twitches a pixel off target.
    const blink = age > 3 && hash(frame, 7) < 8;
    const twitch = hash(frame, 3) < 15 ? 1 : 0;
    for (const side of [-1, 1]) {
      const ex = side * Math.round(R * 0.42);
      for (let y = -er - 1; y <= er + 1; y++) {
        for (let x = -er - 1; x <= er + 1; x++) {
          const d = Math.hypot(x, y);
          if (d > er + 1) continue;
          if (d > er) dot(ex + x, ey + y, FACE_DARK);
          else if (blink) dot(ex + x, ey + y, FACE_SHADE);
          else dot(ex + x, ey + y, d > er - 1 && hash(ex + x, ey + y) < 35 ? EYE_VEIN : EYE_WHITE);
        }
      }
      if (blink) {
        for (let x = -er; x <= er; x++) dot(ex + x, ey, FACE_DARK);
      } else {
        const reach = Math.max(1, er - 1.5);
        const pupilX = ex + Math.round(look.x * reach) + twitch * side;
        const pupilY = ey + Math.round(look.y * reach);
        dot(pupilX - 1, pupilY, IRIS);
        dot(pupilX + 1, pupilY, IRIS);
        dot(pupilX, pupilY - 1, IRIS);
        dot(pupilX, pupilY + 1, IRIS);
        dot(pupilX, pupilY, PUPIL);
      }
      // A brow slanting down toward the middle, glaring.
      const outer = ex + side * (er + 1);
      const inner = ex - side * er;
      const steps = Math.abs(outer - inner);
      for (let i = 0; i <= steps; i++) {
        const bx = outer - side * i;
        const by = ey - er - 3 + Math.round((i / steps) * 2);
        if (Math.hypot(bx, by) < R) dot(bx, by, FACE_DARK);
      }
    }

    // A hooked nose between the eyes.
    const ny = Math.round(R * 0.15);
    dot(0, ny - 1, FACE_SHADE);
    dot(0, ny, FACE_DARK);
    dot(1, ny, FACE_SHADE);

    // The grin: two rows of teeth, its corners curling up.
    const mw = Math.round(R * 0.62);
    const mTop = Math.round(R * 0.38);
    const teeth = Math.max(1, Math.round(R * 0.15));
    for (let x = -mw; x <= mw; x++) {
      const lift = Math.round((x / mw) ** 2 * 2);
      for (let y = -1; y <= teeth * 2 + 1; y++) {
        const yy = mTop + y - lift;
        if (Math.hypot(x, yy) >= R) continue;
        let color;
        if (y === -1 || y === teeth * 2 + 1 || Math.abs(x) === mw) color = FACE_DARK;
        else if (y === teeth) color = MOUTH;
        else color = (x + mw) % 2 === 0 ? TOOTH : MOUTH;
        dot(x, yy, color);
      }
    }
  }

  function draw(frame) {
    ctx.drawImage(base, 0, 0);

    const staring = face && frame - face.start < FACE_FRAMES;
    if (face && !staring) face = null;

    for (const star of stars) {
      // Each star brightens now and then on its own rhythm (not while the moon is staring).
      const twinkle = !staring && Math.sin(frame * 0.15 * star.speed + star.phase) > 0.85;
      ctx.fillStyle = twinkle ? STAR_BRIGHT : STAR_DIM;
      ctx.fillRect(star.x, star.y, 1, 1);
      if (star.big && twinkle) {
        ctx.fillRect(star.x - 1, star.y, 3, 1);
        ctx.fillRect(star.x, star.y - 1, 1, 3);
      }
    }

    const width = CLOUD_SHAPE[0].length;
    for (const cloud of clouds) {
      const span = W + width;
      const left = Math.round(((cloud.start + frame * cloud.speed * 0.1) % span) - width);
      CLOUD_SHAPE.forEach((row, y) => {
        [...row].forEach((cell, x) => {
          if (cell === '.') return;
          ctx.fillStyle = cell === 'l' ? CLOUD_LIT : CLOUD;
          ctx.fillRect(left + x, cloud.y + y, 1, 1);
        });
      });
    }

    if (frame <= glowUntil && !staring) {
      ctx.fillStyle = MOON_GLOW_BRIGHT;
      for (let y = -moon.r - 3; y <= moon.r + 3; y++) {
        for (let x = -moon.r - 3; x <= moon.r + 3; x++) {
          const d = Math.hypot(x, y);
          if (d > moon.r && d <= moon.r + 3 && (x + y) % 2 === 0) ctx.fillRect(moon.x + x, moon.y + y, 1, 1);
        }
      }
    }

    if (staring) {
      // It flickers between the normal moon and the face as it comes and goes.
      const age = frame - face.start;
      const flicker = age < 3 || age >= FACE_FRAMES - 3;
      if (!flicker || age % 2 === 0) drawFace(frame, age);
    }
  }

  // Is the pointer on the moon? Only counts the bare background, not the pet or ghosts.
  function onMoon(e) {
    if (e.target !== document.body && e.target !== document.documentElement) return false;
    const art = canvas.getBoundingClientRect();
    const x = (e.clientX - art.left) / PIXEL;
    const y = (e.clientY - art.top) / PIXEL;
    const reach = face ? moon.r + 3 : moon.r;
    return Math.hypot(x - moon.x - 0.5, y - moon.y - 0.5) <= reach + 1;
  }

  let frame = 0;
  let resizePending = false;
  build();
  draw(frame);

  // A slow tick is enough for twinkling and drifting; skip it while the panel is hidden.
  setInterval(() => {
    if (document.hidden) return;
    frame++;
    draw(frame);
  }, 200);

  window.addEventListener('pointermove', (e) => {
    document.body.style.cursor = onMoon(e) ? 'pointer' : '';
  });

  window.addEventListener('click', (e) => {
    if (!onMoon(e) || face) return;
    if (Math.random() < FACE_CHANCE) {
      face = { start: frame };
      // Lets the pumpkin notice it is being watched.
      window.dispatchEvent(new Event('moonstare'));
    } else {
      glowUntil = frame + 2;
    }
    draw(frame);
  });

  window.addEventListener('resize', () => {
    if (resizePending) return;
    resizePending = true;
    requestAnimationFrame(() => {
      resizePending = false;
      build();
      draw(frame);
    });
  });
})();
