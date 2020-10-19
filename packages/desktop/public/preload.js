const { contextBridge, ipcRenderer } = require("electron");
const hasValidExtension = fp => fp.endsWith(".range") || fp.endsWith(".json");
contextBridge.exposeInMainWorld("Ranges", {
  isMac: process.platform === "darwin",
  onAdd: (handler) => {
    // Filtering the event param from ipcRenderer
    const newCallback = (_, data) => handler(data);
    ipcRenderer.on("add-range", newCallback);
  },
  importRangeFile: (fp) => {
    if (fp && hasValidExtension(fp)) {
      ipcRenderer.send('open-file', fp)
    }
  }
});
