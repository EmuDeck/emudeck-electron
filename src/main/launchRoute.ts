import emuDataFile from '../data/emuData.json';

const EMULATOR_IDS = new Set(Object.keys(emuDataFile));
const EMULATOR_PAGE_PREFIX = '/emulators-detail/';

/**
 * Turn a launch command line into the in-app route for one emulator.
 *
 * Accepts both `--emulator xenia` and `--emulator=xenia` (plus the
 * `--emulators` alias) so launchers can use whichever form is convenient.
 * Unknown ids are ignored rather than routed to a page that cannot render.
 */
export default function routeFromLaunchArgs(argv: string[]): string {
  const args = Array.isArray(argv) ? argv : [];
  const flags = ['--emulator', '--emulators'];
  let requested = '';

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const inlineFlag = flags.find((flag) => arg.startsWith(`${flag}=`));
    if (inlineFlag) {
      requested = arg.slice(inlineFlag.length + 1);
      break;
    }
    if (flags.includes(arg) && index + 1 < args.length) {
      requested = args[index + 1];
      break;
    }
  }

  const emulator = requested.trim().toLowerCase();
  if (!emulator || !EMULATOR_IDS.has(emulator)) return '';
  return `${EMULATOR_PAGE_PREFIX}${encodeURIComponent(emulator)}`;
}
