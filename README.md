# Pomota

Pomota is a small Pomodoro timer for Windows, macOS and Linux that really makes you take your breaks. Most timers just play a sound, and it's easy to click it away and keep working. When Pomota's work time ends, its window goes full screen and stays on top until the break is over. It is built with Tauri, so the app is only a few MB instead of a few hundred.

![Pomota](https://github.com/p32929/pomota/assets/6418354/97d08ddd-1e8b-4453-98c2-9180dae8407f)

## Features

1. **Forces the break:** the window fills the screen and stays on top during your break.
2. **Your own times:** set the work time and the break time in minutes.
3. **Sound cues:** a warning sound before the break and a finish sound when it ends.
4. **Keeps time in the background:** the countdown doesn't drift when the window is hidden.
5. **Tiny download:** a few MB, on Windows, macOS (Intel and Apple Silicon) and Linux.

## Download

Get the installer for your computer from the [releases page](https://github.com/p32929/pomota/releases/latest): `.msi` for Windows, `.dmg` for macOS, and `.AppImage` or `.deb` for Linux.

## Build it yourself

You need [Node.js](https://nodejs.org/) and the [Tauri prerequisites](https://tauri.app/start/prerequisites/) (the Rust toolchain).

```bash
git clone https://github.com/p32929/pomota.git
cd pomota
npm install
npm run tauri dev     # run it
npm run tauri build   # make an installer for your computer
```

## License

MIT License. Copyright (c) 2023 Fayaz Bin Salam. See [LICENSE](LICENSE) for the full text.

## Contributing

Contributions are very welcome. Please open an issue first to talk about what you'd like to add or change, so we can agree on it before you spend time on a pull request. Thank you!

## You might also like

<p><a href="https://openstore.pfay.workers.dev/more/p32929/pomota/personal/0"><picture><source media="(prefers-color-scheme: dark)" srcset="https://openstore.pfay.workers.dev/more/p32929/pomota/personal/0-dark.svg"><img src="https://openstore.pfay.workers.dev/more/p32929/pomota/personal/0-light.svg" width="50%" align="top" alt="More apps by p32929 on OpenStore (1)"></picture></a><a href="https://openstore.pfay.workers.dev/more/p32929/pomota/personal/1"><picture><source media="(prefers-color-scheme: dark)" srcset="https://openstore.pfay.workers.dev/more/p32929/pomota/personal/1-dark.svg"><img src="https://openstore.pfay.workers.dev/more/p32929/pomota/personal/1-light.svg" width="50%" align="top" alt="More apps by p32929 on OpenStore (2)"></picture></a><br><a href="https://openstore.pfay.workers.dev/more/p32929/pomota/personal/2"><picture><source media="(prefers-color-scheme: dark)" srcset="https://openstore.pfay.workers.dev/more/p32929/pomota/personal/2-dark.svg"><img src="https://openstore.pfay.workers.dev/more/p32929/pomota/personal/2-light.svg" width="50%" align="top" alt="More apps by p32929 on OpenStore (3)"></picture></a><a href="https://openstore.pfay.workers.dev/more/p32929/pomota/personal/3"><picture><source media="(prefers-color-scheme: dark)" srcset="https://openstore.pfay.workers.dev/more/p32929/pomota/personal/3-dark.svg"><img src="https://openstore.pfay.workers.dev/more/p32929/pomota/personal/3-light.svg" width="50%" align="top" alt="More apps by p32929 on OpenStore (4)"></picture></a></p>

<p><a href="https://p32929.github.io/share/?repo=pomota"><picture><source media="(prefers-color-scheme: dark)" srcset="https://p32929.github.io/readme/footer-share-dark.svg"><img src="https://p32929.github.io/readme/footer-share-light.svg" width="50%" align="top" alt="Share this project with your friends in one click"></picture></a><a href="https://p32929.github.io/support/"><picture><source media="(prefers-color-scheme: dark)" srcset="https://p32929.github.io/readme/footer-support-dark.svg"><img src="https://p32929.github.io/readme/footer-support-light.svg" width="50%" align="top" alt="If you like my work and want to support me, feel free to support"></picture></a><br><a href="https://openstore.pfay.workers.dev/add"><picture><source media="(prefers-color-scheme: dark)" srcset="https://p32929.github.io/readme/footer-join-dark.svg"><img src="https://p32929.github.io/readme/footer-join-light.svg" width="100%" align="top" alt="Put your own apps on OpenStore: free, your listing lives in your own repo"></picture></a></p>
