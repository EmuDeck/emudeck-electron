flatpak-builder --user --install --force-clean release/flatpak-build flatpak/com.emudeck.EmuDeck.local.yaml && flatpak run --env=ELECTRON_ENABLE_LOGGING=1 com.emudeck.EmuDeck
