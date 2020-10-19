const isMac = process.platform === "darwin";

module.exports = (app, shell, onOpen, settings, onSettingsChange) => [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: "about" },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideothers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" },
          ],
        },
      ]
    : []),
  {
    label: "File",
    submenu: [
      {
        label: "Import Range",
        click: onOpen,
        accelerator: "CmdOrCtrl+I",
      },
      { type: "separator" },
      isMac ? { role: "close" } : { role: "quit" },
    ],
  },
  {
    label: "Edit",
    submenu: [
      { role: "copy" },
      { role: "paste" },
      ...(isMac
        ? [
            { role: "pasteAndMatchStyle" },
            { role: "delete" },
            { role: "selectAll" },
            { type: "separator" },
            {
              label: "Speech",
              submenu: [{ role: "startSpeaking" }, { role: "stopSpeaking" }],
            },
          ]
        : [{ role: "delete" }, { type: "separator" }, { role: "selectAll" }]),
    ],
  },
  {
    label: "Appearance",
    submenu: [
      {
        label: "Always on Top",
        type: "checkbox",
        checked: settings.alwaysOnTop,
        click: (e) => onSettingsChange({...settings, alwaysOnTop: e.checked})
      },
      {
        label: "Fade When Inactive",
        type: "checkbox",
        checked: settings.fadeOnBlur,
        click: (e) => onSettingsChange({...settings, fadeOnBlur: e.checked})
      },
    ]
  },
  {
    role: "help",
    submenu: [
      {
        label: "Learn More",
        click: async () => {
          const { shell } = require("electron");
          await shell.openExternal("https://electronjs.org");
        },
      },
    ],
  },
];
