export const invokeIpc = (args) => {
  return new Promise((resolve) => {
    const ipcChannel = window.electron.ipcRenderer;
    ipcChannel.sendMessage("emudeck", args);

    ipcChannel.once("emudeck", ({ stdout = "", stderr = "" }) => {
      const out = stdout.trim();
      const stderrClean = stderr
        .split("\n")
        .filter((line) => !line.startsWith("[notice]"))
        .join("\n")
        .trim();

      const koPayload = (tag) =>
        JSON.stringify({
          status: "KO",
          error: `invokeIpc(${args}): ${tag}`,
          stderr: stderrClean || undefined,
          raw: out || undefined,
        });

      let parsed;
      let parseError;
      try {
        parsed = JSON.parse(out);
      } catch (e) {
        parseError = e;
      }

      if (parsed && typeof parsed === "object") {
        if (parsed.status === "KO") {
          alert(`Error: ${args}: ${parsed.error}`);
          resolve(out);
          return;
        }
        if (parsed.status === "OK") {
          resolve(out);
          return;
        }
        // Valid JSON without a status field (e.g. get_locations returns an
        // array). Let the caller handle the payload directly.
        resolve(out);
        return;
      }

      // From here the response isn't a usable object. Surface a distinctive
      // KO payload so callers that `JSON.parse(message)` get a clear shape
      // instead of tripping on `.status` of undefined/null.
      if (parsed === null) {
        const payload = koPayload("backend returned JSON null");
        alert(`Error: ${args}: backend returned JSON null`);
        resolve(payload);
        return;
      }

      if (parseError) {
        if (out === "" && !stderrClean) {
          const payload = koPayload("empty response from backend");
          alert(`Error: ${args}: empty response from backend`);
          resolve(payload);
          return;
        }

        // Non-JSON output. Preserve the legacy regex branch for callers that
        // return bare "true"/"false"/"OK"/"KO" strings.
        if (/true|OK/.test(out)) {
          resolve(out);
          return;
        }
        if (/false|KO/.test(out)) {
          alert(`Error: ${args}: ${stderrClean}`);
          resolve(out || stderrClean);
          return;
        }

        const payload = koPayload(
          `non-JSON response: ${parseError.message || "parse failed"}`,
        );
        alert(`Error: ${args}: invalid JSON from backend`);
        resolve(payload);
        return;
      }

      // parsed is a primitive (number, boolean, string). Treat as unknown.
      const payload = koPayload(`unexpected primitive response: ${typeof parsed}`);
      resolve(payload);
    });
  });
};
