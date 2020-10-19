const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("Ranges", {
  isMac: process.platform === "darwin",
  onAdd: (handler) => {
    // Filtering the event param from ipcRenderer
    const newCallback = (_, data) => handler(data);
    ipcRenderer.on("add-range", newCallback);
  },
  importRangeFile: (fp) => {
    if (fp && fp.endsWith(".range")) {
      ipcRenderer.send('open-file', fp)
    }
  }
});
