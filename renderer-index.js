const { ipcRenderer } = require('electron');

function goTo(page) {
  console.log("Navigating to:", page); // test
  ipcRenderer.send('navigate', page);
}
