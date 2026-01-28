export const invokeIpc = (args) => {
  return new Promise((resolve, reject) => {
    const ipcChannel = window.electron.ipcRenderer;
    ipcChannel.sendMessage("emudeck", args);

    ipcChannel.once("emudeck", ({ stdout = "", stderr = "" }) => {
      const out = stdout.trim();

      // Parse as JSON
      try {
        const parsed = JSON.parse(out);
        if (parsed.status === "KO") {
          alert(`Error: ${args}: ${parsed.error}`);
          resolve(out);
          return;
        }
        if (parsed.status === "OK") {
          resolve(out);
          return;
        }
      } catch (e) {
        // Not a json
      }

      if (/true|OK/.test(out)) {
        resolve(out);
      } else if (/false|KO/.test(out)) {
        alert(`Error: ${args}: ${stderr.trim()}`);
        resolve(out || stderr.trim());
      } else {
        resolve(out || stderr.trim());
      }
    });
  });
};
