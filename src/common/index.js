export const invokeIpc = (args) => {
  return new Promise((resolve, reject) => {
    const ipcChannel = window.electron.ipcRenderer;
    // 1) enviamos request
    ipcChannel.sendMessage('emudeck', args);
    // 2) escuchamos la respuesta
    ipcChannel.once('emudeck', ({ stdout = '', stderr = '' }) => {
      const out = stdout.trim();
      // 3) comprobamos si viene OK/true
      if (/true|OK/.test(out)) {
        resolve(out);
      } else if (/false|KO/.test(out)) {
        alert(`Error: ${args}: ${stderr.trim()}`);
        reject(out || stderr.trim());
      } else {
        reject(out || stderr.trim());
      }
    });
  });
};
