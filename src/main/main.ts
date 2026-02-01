// =============================================
// NUEVO: Configuración del fallback bundle
// =============================================
const FALLBACK_BACKEND_PATH = app.isPackaged
  ? path.join(process.resourcesPath, "fallback-backend")
  : path.join(__dirname, "../../fallback-backend");

// Helper para copiar el bundle de fallback
const copyFallbackBackend = async (targetPath: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!fs.existsSync(FALLBACK_BACKEND_PATH)) {
      console.error("Fallback backend not found at:", FALLBACK_BACKEND_PATH);
      resolve(false);
      return;
    }

    // Copiar recursivamente
    const copyRecursive = (src: string, dest: string) => {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }

      const entries = fs.readdirSync(src, { withFileTypes: true });
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
          copyRecursive(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    };

    try {
      copyRecursive(FALLBACK_BACKEND_PATH, targetPath);
      console.log("Fallback backend copied successfully");
      resolve(true);
    } catch (err) {
      console.error("Error copying fallback backend:", err);
      resolve(false);
    }
  });
};

// Helper para inicializar git en el fallback (para futuros pulls)
const initGitInFallback = (targetPath: string, branch: string): Promise<void> => {
  return new Promise((resolve) => {
    const commands = [
      `cd "${targetPath}"`,
      "git init",
      `git remote add origin ${repo}`,
      'git config user.email "emudeck@emudeck.com"',
      'git config user.name "EmuDeck"',
      `git fetch --depth 1 origin ${branch}`,
      `git reset --hard origin/${branch}`,
    ].join(" && ");

    exec(commands, shellType, (error, stdout, stderr) => {
      logCommand("initGitInFallback", error, stdout, stderr);
      // Resolvemos siempre, aunque falle el git init
      // Al menos tenemos el código del fallback funcionando
      resolve();
    });
  });
};

// =============================================
// MODIFICADO: ipcMain.on('clone', ...)
// =============================================
ipcMain.on("clone", async (event, branch) => {
  const branchGIT = branch;
  const backChannel = "clone";
  const backendPath = os.platform().includes("win32") ? `${appDataPath}\\backend` : `${appDataPath}/backend`;

  let bashCommand: any;
  if (os.platform().includes("win32")) {
    bashCommand = `cd %userprofile% && cd AppData && cd Roaming && cd EmuDeck && powershell -ExecutionPolicy Bypass -command "& { mkdir "$env:APPDATA/EmuDeck/logs" -ErrorAction SilentlyContinue; Start-Transcript "$env:APPDATA/EmuDeck/logs/git.log"; git config --global http.lowSpeedLimit 1000 ; git config --global http.lowSpeedTime 60 ; git config --global http.postBuffer 524288000 ; git clone --no-single-branch --depth=1 ${repo} ./backend; Stop-Transcript"} && cd backend && git config user.email "emudeck@emudeck.com" && git config user.name "EmuDeck" && git checkout ${branchGIT} && cd %userprofile% && if not exist emudeck mkdir emudeck && cd emudeck && CLS && Stop-Transcript && echo true `;
  } else {
    bashCommand = `rm -rf ${appDataPath}/backend && mkdir -p ${appDataPath}/backend && mkdir -p ~/emudeck/logs && git config --global http.lowSpeedLimit 1000 && git config --global http.lowSpeedTime 60 && git config --global http.postBuffer 524288000 && git clone --no-single-branch --depth=1 ${repo} ${appDataPath}/backend/ && cd ${appDataPath}/backend && git checkout ${branchGIT} && touch ~/.config/EmuDeck/.cloned && printf "ec" && echo true`;
  }

  return exec(`${bashCommand}`, shellType, async (error, stdout, stderr) => {
    logCommand(bashCommand, error, stdout, stderr);

    // Si el clone falló, intentar con el fallback
    if (error || stderr.includes("fatal:") || !stdout.includes("true")) {
      console.warn("Git clone failed, attempting fallback...");
      logCommand("FALLBACK: Git clone failed, using bundled backend", error, stdout, stderr);

      // Limpiar directorio destino
      try {
        if (fs.existsSync(backendPath)) {
          fs.rmSync(backendPath, { recursive: true, force: true });
        }
        fs.mkdirSync(backendPath, { recursive: true });
      } catch (e) {
        console.error("Error preparing backend directory:", e);
      }

      // Copiar fallback
      const copySuccess = await copyFallbackBackend(backendPath);

      if (copySuccess) {
        // Intentar inicializar git para que futuros pulls funcionen
        await initGitInFallback(backendPath, branchGIT);

        // Marcar como clonado (aunque sea fallback)
        if (!os.platform().includes("win32")) {
          try {
            fs.writeFileSync(`${os.homedir()}/.config/EmuDeck/.cloned`, "");
          } catch (e) {}
        }

        event.reply(backChannel, null, "true (fallback)", "");
        logCommand("FALLBACK: Successfully initialized from bundled backend");
      } else {
        event.reply(backChannel, "Fallback failed", "", "No bundled backend available");
      }
    } else {
      event.reply(backChannel, error, stdout, stderr);
    }
  });
});

// =============================================
// MODIFICADO: ipcMain.on('pull', ...)
// =============================================
ipcMain.on("pull", async (event, branch) => {
  const branchGIT = branch;
  const backChannel = "pull";
  const backendPath = os.platform().includes("win32") ? `${appDataPath}\\backend` : `${appDataPath}/backend`;
  const gitDir = path.join(backendPath, ".git");

  // Verificar si existe el directorio .git
  const hasGitDir = fs.existsSync(gitDir);

  let preCommand: any;
  preCommand = `cd ${appDataPath}/backend && git fetch origin && git reset --hard && git clean -fd && git checkout ${branchGIT} && git pull`;
  if (os.platform().includes("win32")) {
    preCommand = `cd ${appDataPath}\\backend && git fetch origin && git reset --hard && git clean -fd && git checkout ${branchGIT} && git pull`;
  }

  // Legacy installs from emudeck-we
  if (os.platform().includes("win32")) {
    const legacyPath = `${appDataPath}/backend/functions/all.ps1`;
    if (fs.existsSync(legacyPath)) {
      preCommand = `cd %userprofile% && cd AppData && cd Roaming && cd EmuDeck && rmdir backend /q /s && powershell -ExecutionPolicy Bypass -command "& { mkdir "$env:APPDATA/EmuDeck/logs" -ErrorAction SilentlyContinue; Start-Transcript "$env:APPDATA/EmuDeck/logs/git.log"; git config --global http.lowSpeedLimit 1000 ; git config --global http.lowSpeedTime 60 ; git config --global http.postBuffer 524288000 ; git clone --no-single-branch --depth=1 ${repo} ./backend; Stop-Transcript"} && cd backend && git config user.email "emudeck@emudeck.com" && git config user.name "EmuDeck" && git checkout ${branchGIT} && echo true `;
    }
  }

  let bashCommand: any;
  if (os.platform().includes("win32")) {
    bashCommand = `${preCommand} && python ${appDataPath}\\backend\\api.py "app_init"`;
  } else {
    bashCommand = `${preCommand} && python3 ${appDataPath}/backend/api.py "app_init"`;
  }

  console.log(bashCommand);

  // Si no hay .git, necesitamos hacer clone primero (o usar fallback)
  if (!hasGitDir) {
    console.warn("No .git directory found, need to clone first");

    // Intentar clonar
    let cloneCommand: any;
    if (os.platform().includes("win32")) {
      cloneCommand = `cd %userprofile% && cd AppData && cd Roaming && cd EmuDeck && rmdir backend /q /s && powershell -ExecutionPolicy Bypass -command "& { git clone --no-single-branch --depth=1 ${repo} ./backend }" && cd backend && git checkout ${branchGIT}`;
    } else {
      cloneCommand = `rm -rf ${appDataPath}/backend && git clone --no-single-branch --depth=1 ${repo} ${appDataPath}/backend/ && cd ${appDataPath}/backend && git checkout ${branchGIT}`;
    }

    return exec(`${cloneCommand}`, shellType, async (error, stdout, stderr) => {
      logCommand("pull-reclone", error, stdout, stderr);

      if (error || stderr.includes("fatal:")) {
        // Clone falló, usar fallback
        console.warn("Re-clone failed during pull, using fallback...");

        try {
          if (fs.existsSync(backendPath)) {
            fs.rmSync(backendPath, { recursive: true, force: true });
          }
          fs.mkdirSync(backendPath, { recursive: true });
        } catch (e) {}

        const copySuccess = await copyFallbackBackend(backendPath);

        if (copySuccess) {
          await initGitInFallback(backendPath, branchGIT);

          // Ejecutar app_init con el fallback
          const initCommand = os.platform().includes("win32")
            ? `python ${appDataPath}\\backend\\api.py "app_init"`
            : `python3 ${appDataPath}/backend/api.py "app_init"`;

          exec(initCommand, shellType, (initError, initStdout, initStderr) => {
            logCommand("fallback-app_init", initError, initStdout, initStderr);
            event.reply(backChannel, "true (fallback)");
          });
        } else {
          event.reply(backChannel, "fallback_failed");
        }
      } else {
        // Clone exitoso, ahora ejecutar app_init
        const initCommand = os.platform().includes("win32")
          ? `python ${appDataPath}\\backend\\api.py "app_init"`
          : `python3 ${appDataPath}/backend/api.py "app_init"`;

        exec(initCommand, shellType, (initError, initStdout, initStderr) => {
          logCommand("app_init", initError, initStdout, initStderr);
          event.reply(backChannel, stdout + initStdout);
        });
      }
    });
  }

  // Flujo normal: ya tiene .git, hacer pull
  return exec(`${bashCommand}`, shellType, (error, stdout, stderr) => {
    logCommand(bashCommand, error, stdout, stderr);

    // Si el pull falla, seguimos con la versión local existente
    if (error || stderr.includes("fatal:")) {
      console.warn("Git pull failed, continuing with existing local version");
      logCommand("PULL FAILED: Using existing local version", error, stdout, stderr);

      // Intentar ejecutar app_init de todas formas
      const initCommand = os.platform().includes("win32")
        ? `python ${appDataPath}\\backend\\api.py "app_init"`
        : `python3 ${appDataPath}/backend/api.py "app_init"`;

      exec(initCommand, shellType, (initError, initStdout, initStderr) => {
        logCommand("app_init after failed pull", initError, initStdout, initStderr);
        // Responder con éxito aunque el pull fallara
        event.reply(backChannel, "true (cached)");
      });
    } else {
      event.reply(backChannel, stdout);
    }
  });
});
