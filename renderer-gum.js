const { ipcRenderer } = require('electron');

window.onload = () => {
  ipcRenderer.send('get-gum');

  document.getElementById('navMenu').addEventListener('change', (e) => {
    ipcRenderer.send('navigate', e.target.value);
  });

  document.getElementById('gumForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      type: document.getElementById('gumType').value,
      amount: parseInt(document.getElementById('gumAmount').value)
    };
    ipcRenderer.send('add-gum', data);
    e.target.reset();
  });
};

ipcRenderer.on('gum-data', (event, gumList) => {
  const tbody = document.getElementById('gumTableBody');
  tbody.innerHTML = '';
  gumList.forEach(g => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${g.type}</td><td>${g.amount}</td>`;
    tbody.appendChild(row);
  });
});

ipcRenderer.send('get-gum');
