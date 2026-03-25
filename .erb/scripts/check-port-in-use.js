const chalk = require('chalk');

const port = process.env.PORT || '1212';

import('detect-port').then(({ default: detectPort }) => {
  detectPort(port, (err, availablePort) => {
    if (port !== String(availablePort)) {
      throw new Error(
        chalk.whiteBright.bgRed.bold(
          `Port "${port}" on "localhost" is already in use. Please use another port. ex: PORT=4343 npm start`
        )
      );
    } else {
      process.exit(0);
    }
  });
});
