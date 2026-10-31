# 🎃 Pumpkin Spice

A spooky dark VS Code theme in pumpkin orange and bone white.

## What's inside

- **Pumpkin Spice** color theme: a deep midnight-purple background with orange keywords, amber functions, and cream strings
- **Pumpkin Spice Icons** file icon theme: orange pumpkins for code, white pumpkins for config and docs, jack-o'-lantern folders whose eyes glow when you open them, bats for images, and ghosts for everything else
- **Pumpkin Pet**: a pixel jack-o'-lantern in its own tab in the right sidebar, next to the chat. Drag it around and let go to watch it fall, or toss it so it bounces off the walls. Bounce it off the walls 3 times and it gets dizzy. Click it for a random trick: a lantern glow, an evil red glare, a swarm of bats or a flock of ghosts rising from a graveyard. It falls asleep when you stop typing and wakes up when you start.
- **Evil ghosts**: every few minutes an evil ghost comes for the pumpkin. Click it to swat it away, or the pumpkin gets knocked around and turns sad.
- **Haunted status bar**: counts down to Halloween and shows spooky messages. Click it to summon a new one.

## Usage

1. `Ctrl+K Ctrl+T`, then pick **Pumpkin Spice**
2. Command Palette → **Preferences: File Icon Theme**, then pick **Pumpkin Spice Icons**

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `pumpkinSpice.statusBar.enabled` | `true` | Show the spooky status bar item |
| `pumpkinSpice.pet.sleepAfterSeconds` | `30` | Seconds without typing before the pet falls asleep |
| `pumpkinSpice.pet.background` | `true` | Show the pixel-art night scene behind the pet |
| `pumpkinSpice.pet.evilGhostMinutes` | `3` | Roughly how often an evil ghost shows up (0 = never) |
| `pumpkinSpice.statusBar.intervalSeconds` | `30` | How often the message changes |

## Development

- Press `F5` to open a test window with the extension loaded
- `npm run icons` regenerates the icons from `scripts/generate-icons.js`
- `npm run package` builds a `.vsix` file
