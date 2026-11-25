// eslint-disable-next-line import/extensions
import routeFromLaunchArgs from '../main/launchRoute';

describe('routeFromLaunchArgs', () => {
  it('opens the emulator page for a separated argument', () => {
    expect(
      routeFromLaunchArgs(['/opt/EmuDeck.AppImage', '--emulator', 'xenia']),
    ).toBe('/emulators-detail/xenia');
  });

  it('opens the emulator page for an inline argument', () => {
    expect(routeFromLaunchArgs(['EmuDeck.AppImage', '--emulator=xenia'])).toBe(
      '/emulators-detail/xenia',
    );
  });

  it('accepts the emulators alias and normalizes case', () => {
    expect(
      routeFromLaunchArgs(['EmuDeck.AppImage', '--emulators', 'XENIA']),
    ).toBe('/emulators-detail/xenia');
  });

  it('ignores an unknown emulator id', () => {
    expect(
      routeFromLaunchArgs([
        'EmuDeck.AppImage',
        '--emulator',
        'not-an-emulator',
      ]),
    ).toBe('');
  });

  it('returns no route when no emulator was requested', () => {
    expect(routeFromLaunchArgs(['EmuDeck.AppImage'])).toBe('');
  });
});
