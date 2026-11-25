# EmuDeck

[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-908a85?logo=gitpod)](https://gitpod.io/from-referrer/)
<img src="https://www.emudeck.com/img/hero.png">

EmuDeck is a collection of scripts that allows you to autoconfigure your Steam Deck, it creates your roms directory structure and downloads all of the needed Emulators for you along with the best configurations for each of them. EmuDeck works great with [Steam Rom Manager](https://github.com/SteamGridDB/steam-rom-manager) or with [EmulationStation DE](https://es-de.org)

## Open an emulator page on launch

The desktop app can open directly to one emulator's page, which is useful for
launchers and front-ends that want to send a user to the right install or
configuration screen:

```bash
./EmuDeck.AppImage --emulator xenia
./EmuDeck.AppImage --emulator=xenia
```

The emulator id matches the ids used by EmuDeck (`xenia`, `dolphin`, `pcsx2`,
and so on). If EmuDeck is already running, a second launch with `--emulator`
navigates the existing window instead of opening another copy. Letting
EmuDeck create the launcher wiring is still the recommended path; this option
only chooses the page that is shown.

# Developers, developers, developers.

We're not currently accepting PR on the new Electron GUI since is still in its early stages, we will accept PR later on the future!

# Open Emoji

All emojis designed by [OpenMoji](https://openmoji.org/) – the open-source emoji and icon project. License: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/#)
