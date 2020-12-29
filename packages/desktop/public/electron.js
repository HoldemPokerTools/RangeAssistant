const { app, BrowserWindow, screen, Menu, shell, dialog, ipcMain, ipcRenderer } = require("electron");
const isDev = require("electron-is-dev");
const path = require("path");
const defaultMenu = require(path.join(__dirname, "./menu.js"));
const fs = require("fs");
const util = require("util");
const Ajv = require("ajv");
const { autoUpdater } = require("electron-updater")
const isMac = process.platform === "darwin";

const width = 330;
const height = isMac ? 426 : 446;

const PROD_URL = "https://rangeassistant.holdempoker.tools";
const DEV_URL = "http://localhost:3001";
const BUILDER_URL = isDev ? DEV_URL : PROD_URL;

const readFile = util.promisify(fs.readFile);

let appWindow;
let initOpenFileQueue = [];
let primaryDisplay;
let dialogShown = false;
// Default settings
let settings = {
  alwaysOnTop: false,
  fadeOnBlur: false,
};

const createAppWindow = async () => {
  let win = new BrowserWindow({
    resizable: false,
    transparent: false,
    hasShadow: true,
    backgroundColor: "#ffffff",
    fullscreenable: false,
    alwaysOnTop: settings.alwaysOnTop,
    maximizable: false,
    minimizable: true,
    title: "Range Assistant",
    webPreferences: {
      devTools: isDev,
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      enableRemoteModule: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    width,
    height,
    minWidth: width,
    minHeight: height,
  });
  if (isDev) {
    win.loadURL(`http://localhost:3000/`);
  } else {
    win.loadFile(path.join(__dirname, "../build/index.html"));
  }
  appWindow = win;

  win.on("closed", () => {
    appWindow = null;
  });
  // see https://github.com/electron/electron/issues/20618 and https://github.com/electron/electron/issues/1336
  // win.setAspectRatio(1, {width: 0, height: 74});

  win.webContents.on("new-window", handleNavigate);
  win.webContents.on("will-navigate", handleNavigate);
  win.webContents.on('did-finish-load', () => {
    if (initOpenFileQueue.length) {
      const fps = initOpenFileQueue = [...initOpenFileQueue];
      initOpenFileQueue = [];
      fps.forEach((fp) => handleRange(fp));
    }
  });
  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
  }
}

const validateRange = (range) => {
  const ajv = new Ajv.default({strict: false});
  if (!ajv.validate(require("./range.schema.json"), range))
    throw new Error(`Invalid range: ${ajv.errorsText()}`);
};

const handleRange = (fp) => {
  readFile(fp, "utf8")
    .then(data => {
      const range = JSON.parse(data);
      validateRange(range);
      appWindow && appWindow.webContents.send("add-range", range);
    })
    .catch(err => {
      console.debug(err);
      dialog.showMessageBox(null, {
        message: "Invalid Range File",
        detail:
          "The range file is not valid. Please try re-exporting the range file from the range builder",
      });
    });
};

const showOpenFileDialog = async () => {
  if (!dialogShown) {
    try {
      dialogShown = true;
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: "Launch Range Assistant",
        message: "Select a Range",
        buttonLabel: "Open Range(s)",
        properties: ["openFile", "multiSelections"],
        filters: [{ name: "Range Files", extensions: ["range", "json"] }],
      });
      if (!canceled) {
        filePaths.forEach(handleRange);
      }
    } finally {
      dialogShown = false;
    }
  }
};

const resetWindowPosition = () => {
  appWindow && appWindow.setPosition(0, 0);
};

const handleSettingsChange = (updated) => {
  Object.assign(settings, updated);
  appWindow && appWindow.setAlwaysOnTop(settings.alwaysOnTop);
}

const setMenu = () => {
  const menu = defaultMenu(
    app,
    shell,
    showOpenFileDialog,
    settings,
    handleSettingsChange
  );
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
};

const handleNavigate = (event, url) => {
  let allowedUrls = [PROD_URL];
  if (!isDev || allowedUrls.includes(url)) event.preventDefault();
  if (allowedUrls.includes(url)) {
    shell.openExternal(BUILDER_URL);
  }
};

const hasValidExtension = fp => fp.endsWith(".range") || fp.endsWith(".json");

const parseFileArgs = args => args.filter(fp => {
  return fp.substring(0, 2) !== '--' && hasValidExtension(fp) && fs.existsSync(fp);
});

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  let files = parseFileArgs(process.argv);
  !isMac && files.forEach(fp => initOpenFileQueue.push(fp));

  app.on('second-instance', (event, argv, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window and load any ranges that triggered the app.
    if (appWindow) {
      if (appWindow.isMinimized()) appWindow.restore();
      appWindow.focus();
      let args = argv.slice(isDev ? 2 : 1);
      let files = parseFileArgs(args);
      !isMac && files.forEach(handleRange);
    }
  });
    
  app.on('will-finish-launching', () => {
    app.on("open-file", (event, fp) => {
      event.preventDefault();
      if (app.isReady() === false) {
        initOpenFileQueue.push(fp);
      } else {
        handleRange(fp);
      };
    });
    ipcMain.on("open-file", (event, fp) => {
      handleRange(fp);
    });
  });

  app.on("ready", () => {
    // handle display changes
    const handleWindowChange = () => {
      const newPrimary = screen.getPrimaryDisplay();
      if (newPrimary.id !== primaryDisplay.id) {
        primaryDisplay = newPrimary;
        resetWindowPosition();
      }
    };
    screen.on("display-added", handleWindowChange);
    screen.on("display-removed", handleWindowChange);
    primaryDisplay = screen.getPrimaryDisplay();
    setMenu();
    createAppWindow();
    autoUpdater.checkForUpdatesAndNotify();
  });

  app.on("window-all-closed", () => {
    app.quit();
  });

  app.on("activate", () => {
    if (!appWindow) {
      createAppWindow();
    }
  });

  app.on("browser-window-focus", () => {
    appWindow && appWindow.setOpacity(1);
  });

  app.on("browser-window-blur", () => {
    appWindow && appWindow.setOpacity(settings.fadeOnBlur ? 0.3 : 1);
  });

  app.on("web-contents-created", (event, contents) => {
    contents.on("will-attach-webview", (event, webPreferences, params) => {
      // Strip away preload scripts if unused or verify their location is legitimate
      if (webPreferences !== commonWindowOptions.webPreferences) {
        event.preventDefault();
        return;
      }
    });
  });

}

if (isDev) {
  require("electron-reload")(__dirname, {
    // Note that the path to electron may vary according to the main file
    electron: require(`${__dirname}/../node_modules/electron`),
  });
}
