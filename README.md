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

## Share

<a href="https://p32929.github.io/share/?repo=pomota"><img src="https://p32929.github.io/readme/share.svg" alt="Share this with your friends in just a click" width="420"></a>

## Support

<a href="https://p32929.github.io/support/"><img src="https://p32929.github.io/readme/support.svg" alt="If you like my works and want to support me, feel free to support" width="420"></a>
