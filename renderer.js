const { ipcRenderer } = require('electron');

// Navigation
function goTo(page) {
  ipcRenderer.send('navigate', page);
}

// Add reel form handler
const form = document.getElementById('reelForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      date: document.getElementById('date').value,
      company: document.getElementById('company').value,
      size: parseInt(document.getElementById('size').value),
      gsm: parseInt(document.getElementById('gsm').value),
      bf: parseInt(document.getElementById('bf').value),
      weight: parseFloat(document.getElementById('weight').value),
      amount: parseInt(document.getElementById('amount').value),
      type: document.getElementById('type').value
    };
    ipcRenderer.send('add-reel', data);
  });

  ipcRenderer.on('reel-added', () => {
    ipcRenderer.send('get-reels');
  });

  ipcRenderer.on('reels-data', (_, rows) => {
    const table = document.getElementById('reelTable').querySelector('tbody');
    table.innerHTML = '';
    rows.forEach(row => {
      const tr = document.createElement('tr');
      row.forEach(cell => {
        const td = document.createElement('td');
        td.textContent = cell;
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
  });

  ipcRenderer.send('get-reels');
}
