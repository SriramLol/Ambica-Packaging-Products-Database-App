const { ipcRenderer } = require('electron');

window.onload = () => {
  ipcRenderer.send('get-wire');

  document.getElementById('navMenu').addEventListener('change', (e) => {
    ipcRenderer.send('navigate', e.target.value);
  });

  document.getElementById('wireForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      amount: parseInt(document.getElementById('wireAmount').value)
    };
    ipcRenderer.send('add-wire', data);
    e.target.reset();
  });
};

ipcRenderer.on('wire-data', (event, wireList) => {
  const tbody = document.getElementById('wireTableBody');
  tbody.innerHTML = '';
  wireList.forEach(w => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${w.amount}</td>`;
    tbody.appendChild(row);
  });
});

ipcRenderer.send('get-wire');
